> Integrated Redis for rate limiting and caching to protect microservices resources and reduce database load.

## A. Bối cảnh và phạm vi

1. 🔥 Redis trong Notification Hub dùng cho những mục đích nào ngoài rate limiting và caching?
2. 🔥 "Protect microservices resources" nghĩa là bảo vệ tài nguyên nào (service, DB, nhà cung cấp bên ngoài, Kafka)? Cụ thể giới hạn cái gì?
3. "Reduce database load": bạn có đo được DB load giảm bao nhiêu không? Số liệu trước và sau?
4. ⚠️ Đây là dự án cá nhân, có lưu lượng đủ lớn để thấy cache hay rate limit có tác dụng không? Bạn kiểm chứng bằng cách nào?
5. Vì sao chọn Redis mà không phải Caffeine, Memcached, Hazelcast hay cache trong DB?
6. Bạn chạy Redis kiểu nào (standalone, Sentinel, Cluster, Docker)? Cấu hình persistence nào (RDB, AOF)?
7. Client Redis bạn dùng: Lettuce, Jedis, Redisson, Spring Data Redis? Vì sao?
8. Rate limit nằm ở đâu: API gateway, filter trong từng service, interceptor gRPC, hay consumer Kafka?
9. Rate limit theo đối tượng nào: user, API key, tenant, IP, kênh gửi, nhà cung cấp?
10. Phần nào của rate limiting và caching bạn tự viết, phần nào dùng thư viện (Bucket4j, Resilience4j, Redisson RateLimiter, Spring Cloud Gateway)?

## B. Rate limiting: thuật toán

11. 🔥 Các thuật toán rate limiting: fixed window, sliding window log, sliding window counter, token bucket, leaky bucket. Khác nhau thế nào?
12. 🔥 Bạn chọn thuật toán nào và vì sao? Nó có lợi gì với notification?
   ↳ Follow-up: Nếu đổi sang thuật toán khác thì hành vi thay đổi ra sao? Cho ví dụ burst traffic.
13. Fixed window có vấn đề "burst ở biên cửa sổ" thế nào? Cho ví dụ số cụ thể.
14. Sliding window log tốn bộ nhớ thế nào? Sliding window counter xấp xỉ ra sao?
15. Token bucket: tham số capacity và refill rate nghĩa là gì, chọn thế nào? Cho phép burst ra sao?
16. Leaky bucket khác token bucket ở điểm nào, hợp với bài toán nào (làm mượt traffic ra downstream)?
17. Làm sao tính lại số token khi không có timer chạy nền (lazy refill dựa trên thời gian)?
18. Dùng giờ nào để tính: giờ client, giờ app server, hay giờ Redis (`TIME`)? Clock skew ảnh hưởng gì?
19. Cấu hình giới hạn (số request, cửa sổ) lấy từ đâu, thay đổi runtime được không? Theo từng tenant/plan khác nhau?
20. Rate limit nhiều tầng (per second, per minute, per day) triển khai thế nào?
21. Cost-based limiting (request nặng tính nhiều token hơn) có cần không?
22. Quota (hạn mức theo tháng) khác rate limit (tốc độ) thế nào?

## C. Rate limiting trên Redis: atomicity và Lua

23. 🔥 Tại sao phải dùng Redis thay vì bộ đếm trong bộ nhớ của từng instance?
24. 🔥 Cài đặt đơn giản `INCR` + `EXPIRE`: có race condition gì? (key không có TTL nếu crash giữa hai lệnh)
25. 🔥 Vì sao cần Lua script? Redis thực thi script thế nào (single-threaded, atomic)?
   ↳ Follow-up: `EVAL` vs `EVALSHA`, `SCRIPT LOAD`, script cache bị flush thì sao? Lua script chạy lâu có chặn Redis không?
26. `MULTI/EXEC` (transaction) khác Lua script ở điểm nào? Vì sao `WATCH` không phù hợp với rate limiting?
27. Pipeline có đảm bảo atomic không?
28. Sorted set (`ZADD`, `ZREMRANGEBYSCORE`, `ZCARD`) dùng cho sliding window log: độ phức tạp và bộ nhớ?
29. Hash (`HSET`, `HINCRBY`) lưu trạng thái token bucket (tokens, last_refill): bạn viết script thế nào?
30. Key design: đặt tên key, ví dụ `rate:{tenant}:{api}:{window}`. Có dùng hash tag `{}` cho Redis Cluster không và vì sao?
31. TTL của key rate limit đặt bao nhiêu? Quên đặt TTL thì sao (memory leak)?
32. Script Lua có dùng nhiều key không? Trong Redis Cluster, các key phải cùng slot: bạn xử lý thế nào?
33. Redis `time` trong script: dùng `redis.call('TIME')` hay truyền thời gian từ app? Ảnh hưởng đến replication script (effects replication)?
34. Độ chính xác của bộ đếm khi có hàng nghìn request đồng thời: có thể vượt giới hạn không?
35. Mỗi request thêm một round trip đến Redis: độ trễ tăng bao nhiêu? Giảm bằng cách nào?
36. Hot key: một tenant lớn bị limit liên tục làm key đó thành điểm nóng. Xử lý?
37. 🔥 Bạn có tự test rằng limiter đúng dưới tải đồng thời không? Test thế nào (nhiều thread, load test)?
38. Redis cluster/replica: ghi vào master, đọc replica có thể lệch. Ảnh hưởng đến limiter ra sao?
39. Failover Redis: replication bất đồng bộ nên counter có thể mất một phần. Hậu quả với rate limit?

## D. Rate limiting: hành vi, trả lời và vận hành

40. Khi vượt giới hạn, trả gì cho client: HTTP 429 / gRPC `RESOURCE_EXHAUSTED`, header `Retry-After`, `X-RateLimit-*`?
41. Request bị limit thì bỏ (drop), xếp hàng (queue), hay làm chậm (throttle)? Với notification chọn cái nào?
42. 🔥 Redis chết hoặc timeout: limiter fail-open hay fail-closed? Vì sao và đánh đổi?
43. Có timeout ngắn cho lệnh Redis, circuit breaker bao quanh limiter không?
44. Rate limit phía producer (nhận API) khác phía consumer (gọi nhà cung cấp SMS/email) thế nào? Bạn đặt ở đâu?
45. Rate limit bảo vệ nhà cung cấp bên ngoài (giới hạn của họ) khác bảo vệ hệ thống mình thế nào?
46. Nhiều instance cùng limit: mỗi instance một bucket hay một bucket toàn cục? Đánh đổi chính xác và độ trễ?
47. Local rate limit + global rate limit kết hợp (hai tầng) có đáng làm không?
48. Phân biệt rate limiting, throttling, load shedding, backpressure, circuit breaker, bulkhead.
49. Thông báo quan trọng (OTP) có được ưu tiên qua mặt limit không? Cách làm?
50. Chống abuse/DDoS: rate limit ở ứng dụng có đủ không? Cần thêm gì ở tầng edge (WAF, CDN, Nginx)?
51. Client retry sau 429: exponential backoff + jitter. Thundering herd ra sao nếu không có jitter?
52. Metrics rate limit (số request bị limit, theo tenant, theo endpoint) và alert: bạn theo dõi không?
53. Whitelist/blacklist, giới hạn theo IP phía sau proxy: lấy IP thật từ `X-Forwarded-For` có rủi ro gì (giả mạo)?
54. Xác định "user" khi chưa đăng nhập: dùng gì làm khóa limit?
55. Test rate limiter đơn vị thế nào khi phụ thuộc thời gian (mock clock)?

## E. Caching: thiết kế

56. 🔥 Bạn cache những dữ liệu nào (template, preference người dùng, cấu hình kênh, trạng thái notification)? Vì sao đó là ứng viên tốt?
57. 🔥 Dữ liệu nào tuyệt đối không nên cache?
58. 🔥 Cache pattern bạn dùng: cache-aside, read-through, write-through, write-behind? Vì sao?
59. Cache hit ratio bạn đo được bao nhiêu? Công cụ nào?
60. Độ trễ DB trước và sau khi cache là bao nhiêu?
61. Serialization của giá trị trong Redis: JSON, Java serialization, Protobuf? Ảnh hưởng đến kích thước và tương thích?
62. Cấu trúc dữ liệu Redis bạn dùng (string, hash, set, sorted set)? Vì sao chọn kiểu đó?
63. Cache key naming và versioning key khi đổi cấu trúc dữ liệu cache?
64. Cache cục bộ (Caffeine) + Redis (hai tầng) có cần không? Vấn đề đồng bộ hai tầng?
65. Spring Cache abstraction (`@Cacheable`, `@CacheEvict`, `@CachePut`) có dùng không? Bẫy self-invocation, proxy, key generation?
66. TTL đặt bao nhiêu cho từng loại dữ liệu và dựa vào căn cứ nào? TTL cố định có thể gây đồng loạt hết hạn?
67. Eviction policy (`allkeys-lru`, `volatile-lru`, `allkeys-lfu`, `noeviction`): bạn cấu hình cái nào và hệ quả?
68. `maxmemory` đặt thế nào? Redis đầy thì sao?
69. Cache dữ liệu theo từng service hay dùng chung Redis giữa các service? Rủi ro khi dùng chung?
70. Redis cũng dùng cho rate limit và cache: dùng chung một instance có rủi ro gì (eviction làm mất counter rate limit)?

## F. Caching: invalidation và nhất quán

71. 🔥 "There are only two hard things in computer science": cache invalidation. Bạn invalidate cache thế nào khi dữ liệu thay đổi?
   ↳ Follow-up: Xóa cache hay cập nhật cache khi ghi? Vì sao xóa thường an toàn hơn? Chuyện gì xảy ra nếu hai thread ghi và xóa chồng nhau?
72. Race condition trong cache-aside: đọc DB cũ → ghi DB mới → xóa cache → ghi dữ liệu cũ vào cache. Bạn có biết kịch bản này không? Giảm thiểu bằng cách nào (delayed double delete, versioning, TTL ngắn)?
73. Invalidation giữa các service: service A thay đổi dữ liệu, service B đang cache: B biết bằng cách nào (event Kafka, TTL, pub/sub)?
74. Redis Pub/Sub vs Kafka để broadcast invalidation: khác nhau thế nào về độ tin cậy?
75. Dữ liệu cache lệch DB trong bao lâu thì chấp nhận được với notification? Có kịch bản stale gây hậu quả không (gửi cho người đã opt-out)?
76. ⚠️ Preference opt-out được cache; user vừa opt-out nhưng cache chưa cập nhật: hệ thống vẫn gửi notification. Bạn giải quyết thế nào?
77. Write-through và write-behind: rủi ro mất dữ liệu của write-behind khi Redis chết?
78. Cache và transaction DB: xóa cache trước hay sau commit? Nếu transaction rollback thì sao?
79. Versioned cache / cache tag để invalidate theo nhóm?
80. Event-driven invalidation có thể đến trễ hoặc trùng. Xử lý?

## G. Caching: stampede, penetration, avalanche

81. 🔥 Cache stampede (thundering herd) là gì? Khi key nóng hết hạn, hàng nghìn request cùng đổ xuống DB. Bạn xử lý thế nào?
   ↳ Follow-up: Mutex/lock theo key, request coalescing (singleflight), probabilistic early expiration, stale-while-revalidate: bạn chọn cái nào? Lock thì hết hạn giữa chừng ra sao?
82. 🔥 Cache penetration (truy vấn key không tồn tại): bạn xử lý thế nào (cache null, Bloom filter, validate input)?
83. Cache avalanche (nhiều key cùng hết hạn hoặc Redis chết): bạn xử lý thế nào (TTL jitter, warm up, nhiều tầng)?
84. Hot key: một key được đọc cực nhiều làm một node Redis quá tải. Giải pháp?
85. Big key (value quá lớn) gây vấn đề gì (chặn single thread, network)?
86. Cache warming khi khởi động hoặc sau khi Redis restart: cần không, làm thế nào?
87. 🔥 Redis chết hoàn toàn thì DB có chịu nổi lượng truy cập tràn xuống không? Bạn đã thử chưa?
88. Fallback khi Redis lỗi: gọi thẳng DB, trả stale, hay trả lỗi? Circuit breaker và giới hạn truy cập DB?
89. Timeout kết nối Redis, connection pool (Lettuce, Jedis pool) cấu hình thế nào? Pool cạn thì sao?
90. Negative caching và TTL ngắn cho kết quả không tìm thấy?

## H. Redis nội bộ và vận hành

91. 🔥 Vì sao Redis nhanh dù single-threaded? Redis 6+ có I/O threading, thực thi lệnh vẫn single thread?
92. Lệnh nguy hiểm trong production: `KEYS *`, `FLUSHALL`, `SMEMBERS` trên set lớn. Thay bằng gì (`SCAN`)?
93. Persistence RDB vs AOF: khác nhau, khi nào mất dữ liệu? Với cache và rate limit có cần persistence không?
94. Replication, Sentinel, Cluster: khác nhau thế nào? Bạn dùng loại nào cho dự án và vì sao?
95. Redis Cluster hash slot (16384) là gì, resharding, key trong lệnh nhiều key phải cùng slot?
96. Failover Sentinel mất bao lâu, trong lúc đó ứng dụng thấy gì?
97. Memory fragmentation, `INFO memory`, `MEMORY USAGE`: theo dõi dung lượng thế nào?
98. Slow log, latency monitor: dùng để làm gì?
99. Bảo mật Redis: password/ACL, TLS, không mở public. Bạn cấu hình gì?
100. Redis dùng làm distributed lock (`SET NX PX`, Redlock): bạn có dùng không? Vấn đề của lock (hết hạn khi đang xử lý, fencing token)?
101. Redis Streams/Pub/Sub có dùng không? Khác Kafka thế nào?
102. Redis có phải source of truth cho thứ gì trong dự án không? Nếu mất dữ liệu Redis thì hậu quả?
103. Metrics Redis cần theo dõi: hit/miss, used memory, evicted keys, connected clients, latency, ops/sec?
104. Redis memory tăng không kiểm soát: điều tra thế nào?

## I. Tình huống, đánh đổi, phản tư

105. 🔥 Một tenant gửi đột biến 100.000 notification/phút: rate limit và cache của bạn hoạt động thế nào từ đầu đến cuối?
106. Rate limit làm mất notification quan trọng của khách hàng: bạn thiết kế để người dùng không bị mất thông báo (queue, retry sau)?
107. Một lỗi cấu hình khiến limit quá thấp, chặn hết traffic hợp lệ: phát hiện và xử lý thế nào? Có kill switch không?
108. Giới hạn cấu hình sai theo chiều ngược (quá cao) làm nhà cung cấp SMS chặn tài khoản: phòng ngừa?
109. Nếu bỏ Redis, chỉ dùng cache cục bộ và DB, bạn mất gì?
110. Cache có làm tăng độ phức tạp hơn lợi ích thu được trong dự án này không? Bạn đo giá trị thế nào?
111. Có nên cache ở tầng gateway/CDN thay vì Redis ở service?
112. Khi nào nên dùng materialized view / read replica thay vì cache?
113. ⚠️ Nếu interviewer bảo "dự án có vài request/giây, cần gì Redis", bạn đáp ra sao?
114. Bạn từng gặp bug liên quan Redis/cache nào thật sự? Triệu chứng và cách sửa?
115. Nếu làm lại, bạn thay đổi gì ở rate limiting hay caching?
116. Bạn có thể giải thích đoạn Lua script của mình dòng-từng-dòng mà không nhìn code không?
117. Tích hợp rate limit với circuit breaker và retry (Resilience4j) trong gọi nhà cung cấp: thứ tự áp dụng thế nào?
118. Nếu cần quota toàn cục chính xác tuyệt đối (không được vượt), Redis có đủ không? Cần gì thêm?
