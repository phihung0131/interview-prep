# SYSTEM DESIGN, MICROSERVICE, USE CASE / TROUBLESHOOTING

Ba phần này là nơi bạn vừa bị vặn nhiều nhất, và cũng là nơi phân biệt mid với senior. Câu có 🔥 là câu hay gặp, hay làm ứng viên lộ chỗ hổng. Mình bám theo bối cảnh kho vận (WMS, 15 kho, Kafka, PostgreSQL) để bạn liên hệ được với công việc thật.

# PHẦN 1: SYSTEM DESIGN

## A. Cách tiếp cận và ước lượng (senior được chấm ở đây trước)

1. 🔥 Đưa một đề mơ hồ ("thiết kế hệ thống thông báo"). Bạn hỏi lại những gì trước khi vẽ? Phân biệt yêu cầu chức năng, phi chức năng (độ trễ, availability, consistency, durability) và ràng buộc (ngân sách, team, hạ tầng có sẵn).
2. 🔥 Back-of-envelope: 10 triệu user, 10% hoạt động mỗi ngày, mỗi người 20 request. Tính QPS trung bình, QPS đỉnh (nhân 3-5), băng thông, dung lượng lưu trữ 1 năm, số máy cần. Nêu giả định rõ ràng.
3. Tỷ lệ đọc:ghi quyết định điều gì trong thiết kế? Ví dụ 100:1 và 1:100 thì kiến trúc khác nhau thế nào?
4. Số "latency numbers" cần thuộc: RAM, SSD, mạng cùng datacenter, mạng liên vùng. Dùng chúng để loại bỏ phương án nhanh chóng ra sao?
5. Bạn bắt đầu bằng kiến trúc đơn giản nhất (một app + một DB) và chỉ ra điểm nào vỡ trước khi tải tăng. Vì sao cách này tốt hơn vẽ ngay 15 hộp microservice?
6. Availability 99.9% và 99.99% khác nhau bao nhiêu phút downtime mỗi năm? Chi phí kiến trúc để nhảy từ mức này lên mức kia?
7. SLA, SLO, SLI, error budget: dùng error budget để quyết định đánh đổi giữa ra tính năng mới và ổn định thế nào?
8. CAP và PACELC bằng ví dụ kho: hệ thống tồn kho chọn CP hay AP, ở phần nào?
9. Khi nào chấp nhận eventual consistency, khi nào bắt buộc strong consistency? Cho ví dụ cụ thể cho từng loại trong nghiệp vụ kho/thanh toán.
10. Cách bạn trình bày trade-off: "chọn A vì X, đổi lại mất Y, nếu Y thành vấn đề thì chuyển sang B". Luyện một ví dụ với cache hoặc queue.

## B. Building blocks (mỗi cái phải biết khi dùng, khi hại, khi sập)

11. 🔥 Cache: cache-aside, write-through, write-behind, refresh-ahead. Cache ở đâu (client, CDN, gateway, app local, Redis, DB)? Dữ liệu nào nên cache, dữ liệu nào tuyệt đối không?
12. 🔥 Cache invalidation: xóa trước hay sau khi ghi DB, race condition giữa hai thao tác đó dẫn đến dữ liệu cũ vĩnh viễn thế nào? Giải pháp (xóa sau commit, TTL ngắn, versioning key, CDC).
13. Cache stampede, cache penetration (query key không tồn tại), cache avalanche (hết hạn đồng loạt). Mỗi cái cách chặn?
14. Redis chết hoặc đầy thì sao? DB có chịu nổi lượng request tràn xuống không? Thiết kế để cache sập không kéo sập DB (circuit breaker, giới hạn truy cập DB, cache cục bộ dự phòng)?
15. Load balancer: L4 vs L7, round robin, least connections, consistent hashing, sticky session. Health check sai (quá nhạy, quá chậm) gây sự cố gì?
16. Session và state: ứng dụng stateless để scale ngang. Session lưu ở đâu (Redis, JWT)? Đánh đổi của từng cách?
17. 🔥 Scale DB theo thứ tự: tối ưu query → index → cache → read replica → partition → shard. Mỗi bước giải quyết loại tải nào, và bạn dùng số liệu nào để quyết định chuyển bước?
18. Read replica và replication lag: ghi xong đọc ngay không thấy dữ liệu. Giải quyết thế nào (đọc primary cho luồng nhạy cảm, sticky tạm thời, chờ LSN)?
19. Sharding: chọn shard key thế nào, hot shard xử lý ra sao, query chéo shard và transaction chéo shard, resharding khi thêm node?
20. Message queue vs pub/sub vs stream log: Kafka khác RabbitMQ chỗ nào về mô hình, thứ tự, retention, replay? Khi nào chọn cái nào?
21. 🔥 Kafka thiết kế: chọn partition key để đảm bảo thứ tự theo đơn hàng/SKU, số partition chọn thế nào, consumer group, rebalancing gây gián đoạn gì, hot partition?
22. Backpressure: producer nhanh hơn consumer, queue phình mãi. Xử lý (giới hạn, thả bớt, tăng consumer, lưu đệm xuống đĩa, báo ngược cho client)?
23. CDN và object storage: ảnh, file xuất báo cáo. Upload lớn (presigned URL, multipart, resume), vì sao không đẩy file qua app server?
24. Search: khi nào dùng Elasticsearch, đồng bộ từ DB sang thế nào (CDC, dual write có vấn đề gì), xử lý lệch dữ liệu giữa DB và index?
25. API gateway: xác thực, rate limit, routing, aggregation. Rủi ro điểm nghẽn/điểm chết duy nhất, khác gì với BFF (backend for frontend)?
26. 🔥 Rate limiting: fixed window, sliding window, token bucket, leaky bucket. Giới hạn theo user, IP, API key. Triển khai trên nhiều instance (Redis + Lua), điều gì xảy ra khi Redis chết (fail open hay closed)?
27. Thiết kế API: pagination (offset vs cursor), idempotency key, versioning, lỗi chuẩn, bulk API, long-running operation (trả 202 + polling/webhook). Khi nào REST, gRPC, GraphQL, WebSocket, SSE?
28. Idempotency toàn hệ thống: ai sinh key, lưu ở đâu, TTL bao lâu, xử lý request lặp đến khi request đầu đang chạy dở?
29. Long polling, WebSocket, SSE cho thông báo realtime: khác nhau gì, giữ 1 triệu kết nối thì tốn gì và scale thế nào?
30. Phân phối job theo lịch: scheduler phân tán, tránh chạy trùng trên nhiều pod, job lỡ lịch khi hệ thống sập thì bù thế nào?
31. Observability trong thiết kế: log, metric, trace, alert cần có ở từng thành phần. Metric nào đáng cảnh báo (golden signals: latency, traffic, errors, saturation)?
32. Bảo mật trong thiết kế: xác thực, phân quyền, mã hóa, bí mật, audit, dữ liệu nhạy cảm. Nơi nào trong sơ đồ cần ranh giới tin cậy?
33. Multi-region: active-passive vs active-active, đồng bộ dữ liệu, xử lý xung đột ghi, độ trễ. Khi nào KHÔNG đáng làm?
34. Chi phí: ước lượng tiền hạ tầng sơ bộ cho phương án của bạn, thành phần nào đắt nhất, cắt giảm bằng cách nào?

## C. Các bài thiết kế mẫu (mỗi bài: làm rõ yêu cầu → ước lượng → thiết kế → nút thắt → failure → trade-off)

35. 🔥 **Flash sale**: 10.000 req/s, 100 sản phẩm, không bán quá số lượng. Trừ tồn ở đâu (Redis atomic Lua, DB `UPDATE ... WHERE qty>0`, hàng đợi), chống bot, xử lý hết hàng, đơn không thanh toán thì hoàn kho thế nào, Redis chết giữa chừng thì đối soát ra sao?
36. 🔥 **Hệ thống thông báo** (email, SMS, push) cho 1 triệu user, bên thứ ba có rate limit. Ưu tiên (OTP vs marketing), template, retry, DLQ, dedupe, preference của user, theo dõi trạng thái gửi, chống gửi trùng khi retry. (Đây chính là Notification Hub của bạn, hãy nói sâu.)
37. 🔥 **Chuyển tiền giữa hai tài khoản ở hai service**: ledger kép, giữ chỗ (hold), saga vs 2PC, idempotency, trạng thái pending, service sập giữa chừng, đối soát cuối ngày, người dùng thấy kết quả thế nào?
38. 🔥 **Tồn kho tổng hợp cho 15 kho** (mỗi kho một app/DB riêng), màn hình xem gần real-time. CDC hay event, độ trễ chấp nhận, thứ tự và trùng event, sửa dữ liệu lệch, kho offline rồi online lại thì bù thế nào?
39. **URL shortener**: sinh mã (hash, counter, Base62, Snowflake), chống trùng, đọc nhiều ghi ít, cache, hết hạn link, analytics click không làm chậm redirect.
40. **Rate limiter dạng dịch vụ** dùng chung cho nhiều API: cấu hình luật động, độ chính xác vs hiệu năng, đồng bộ giữa node.
41. **Hệ thống đặt vé/chỗ** (rạp, kho đặt lịch dock): giữ chỗ tạm có TTL, hai người cùng chọn một chỗ, thanh toán thất bại thì nhả chỗ, overbooking có chủ đích?
42. **Hệ thống phân công picking** trong kho: nhiều picker, đơn có ưu tiên, gom đơn theo khu vực, tránh hai người nhận cùng một việc (`SKIP LOCKED`, queue), xử lý picker bỏ giữa chừng, tối ưu đường đi.
43. **Order management**: vòng đời đơn (state machine), thay đổi/hủy đơn khi đang xử lý, tính nhất quán giữa đơn - tồn kho - thanh toán - vận chuyển, ai là "source of truth"?
44. **Chat/inbox**: lưu tin nhắn, thứ tự, đã đọc, offline, nhóm lớn, fan-out khi gửi vs khi đọc.
45. **News feed/timeline**: fan-out on write vs on read, người nổi tiếng (hot user), cache feed.
46. **File upload/export báo cáo lớn**: xử lý bất đồng bộ, trạng thái job, tải về an toàn, dọn file cũ, tải báo cáo nặng không làm chậm hệ thống chính.
47. **Audit log / event log** 10.000 ghi/giây: lưu ở đâu (Kafka → ClickHouse/Elasticsearch/S3), truy vấn theo thời gian/người dùng, bất biến, giữ bao lâu, mã hóa.
48. **Autocomplete/tìm kiếm sản phẩm**: trie, Elasticsearch, cập nhật chỉ mục, xếp hạng, độ trễ dưới 100ms.
49. **Idempotent webhook receiver**: nhận webhook từ đối tác vận chuyển, đối tác gửi trùng và sai thứ tự, ký xác thực, xử lý chậm thì phản hồi 200 trước hay sau?
50. **Distributed lock / leader election service**: lease, fencing token, split-brain, vì sao lock Redis đơn giản vẫn có thể sai.
51. **Hệ thống đồng bộ dữ liệu hai chiều** giữa WMS và ERP: xung đột ghi, khóa ngoại nghiệp vụ, phiên bản, phát hiện xóa, vòng lặp đồng bộ vô hạn.
52. **Hệ thống cấu hình/feature flag**: thay đổi không cần deploy, rollout theo kho/phần trăm, cache và độ tươi, kill switch.
53. **Batch xử lý 100 triệu bản ghi mỗi đêm**: chia lô, song song, idempotent, restart giữa chừng, theo dõi tiến độ, không ảnh hưởng online.
54. **Dashboard realtime** (số đơn/giây theo kho): stream aggregation, window, độ chính xác vs độ trễ, lưu trữ chuỗi thời gian.

## D. Chen yêu cầu giữa chừng (interviewer thường làm vậy)

55. 🔥 "Tải tăng 10 lần": thành phần nào vỡ trước, bạn đo bằng gì, xử lý bước đầu thế nào?
56. 🔥 "DB chính chết": phát hiện, failover, mất bao nhiêu dữ liệu, ứng dụng nối lại thế nào, ai được thông báo?
57. "Bỏ Kafka, chỉ dùng DB": thiết kế lại thế nào, mất gì, giữ được gì?
58. "Bắt buộc strong consistency, không được pending": đổi thiết kế ra sao, trả giá bằng gì?
59. "Ngân sách giảm một nửa": cắt gì trước, chấp nhận rủi ro gì?
60. "Thêm yêu cầu realtime dưới 1 giây": phần nào đổi (push thay vì poll, stream, cache)?
61. "Dữ liệu phải lưu 7 năm và truy vết được": tiering, archive, chi phí, quyền truy cập.
62. "Một nhà cung cấp bên thứ ba sập 2 tiếng": hệ thống của bạn thoái hóa mềm (degrade gracefully) thế nào?
63. "Hai team cùng sửa một service, deploy dẫm chân nhau": giải pháp về tổ chức và kỹ thuật?
64. "Làm sao biết thiết kế này đang chạy tốt?": metric, alert, dashboard, kiểm thử tải, chaos test.

# PHẦN 2: MICROSERVICE

## E. Chia service và ranh giới

65. 🔥 Khi nào nên dùng microservice, khi nào monolith (modular monolith) là lựa chọn tốt hơn? Với team 8 người và 15 kho thì bạn khuyên gì?
66. 🔥 Chia service theo gì: nghiệp vụ (bounded context), theo team (Conway), theo tải? Dấu hiệu chia sai (distributed monolith: deploy cùng nhau, gọi nhau vòng vòng, chung DB)?
67. Mỗi service một database: vì sao, và hệ quả (không join, không transaction chung, báo cáo tổng hợp khó). Cách xử lý báo cáo chéo service?
68. Dùng chung DB giữa các service có phải luôn sai không? Khi nào chấp nhận được tạm thời, rủi ro?
69. Service nào là chủ sở hữu (owner) dữ liệu tồn kho, đơn hàng, khách hàng? Dữ liệu cần ở service khác thì sao chép (replica read model) hay gọi API?
70. Kích thước service: quá nhỏ (nano-service) gây gì, quá lớn gây gì? Tiêu chí chia?
71. Chuyển từ monolith sang microservice: strangler fig, bắt đầu từ module nào, xử lý dữ liệu dùng chung, chạy song song cũ/mới, rollback?
72. 🔥 Mô hình 15 kho, mỗi kho một app riêng (đúng dự án của bạn): ưu nhược điểm so với một hệ thống đa tenant? Khi cần tính năng mới thì release 15 lần, giải quyết ra sao (feature flag, version tương thích, tự động hóa)?
73. Shared library nội bộ giữa các service: lợi và hại (coupling, nâng phiên bản đồng loạt). Khi nào dùng, khi nào copy hoặc dùng contract?
74. Service discovery, config server: Kubernetes DNS vs Eureka/Consul, config tập trung và cách xử lý bí mật.

## F. Giao tiếp giữa các service

75. 🔥 Đồng bộ (REST/gRPC) vs bất đồng bộ (event/queue): chọn thế nào cho từng luồng? Chuỗi gọi đồng bộ 5 service làm availability tổng giảm thế nào (0.99^5)?
76. 🔥 REST vs gRPC: protobuf, HTTP/2, streaming, typed contract, khó debug, hạ tầng (proxy, browser). Dự án của bạn dùng REST, vì sao hợp lý? Khi nào chuyển gRPC?
77. Event notification vs event-carried state transfer vs event sourcing: khác nhau gì, khi nào dùng?
78. Command vs event: đặt tên và ý nghĩa, ai chịu trách nhiệm khi sai? Coupling ngầm của event (consumer phụ thuộc cấu trúc event)?
79. 🔥 Thiết kế contract và tương thích ngược: thêm/xóa/đổi field của API và event mà consumer cũ vẫn chạy. Schema registry (Avro/Protobuf), consumer-driven contract test (Pact)?
80. Versioning: URL, header, hay song song hai phiên bản? Khi nào được xóa phiên bản cũ, biết ai còn dùng bằng cách nào?
81. Timeout, retry, backoff + jitter giữa service: đặt timeout bao nhiêu (nhỏ hơn timeout của caller), retry ở tầng nào (tránh nhân retry qua nhiều tầng thành bão)?
82. 🔥 Circuit breaker, bulkhead, rate limiter, fallback (Resilience4j): mỗi cái chặn loại sự cố nào, cấu hình ngưỡng ra sao, fallback trả gì cho nghiệp vụ nhạy cảm?
83. Cascading failure: một service chậm kéo sập cả chuỗi. Cơ chế nào ngăn (timeout, bulkhead, load shedding, queue có giới hạn)?
84. Service mesh (Istio): giải quyết gì (mTLS, retry, traffic shifting, observability), đổi lại chi phí và độ phức tạp gì? Khi nào chưa cần?
85. Gọi service đồng bộ trong lúc đang giữ transaction DB: rủi ro gì, thiết kế lại thế nào?
86. Phối hợp chuỗi nhiều service: choreography (event) vs orchestration (điều phối viên). Khi nào chọn cái nào, ai theo dõi trạng thái toàn chuỗi?

## G. Dữ liệu nhất quán trong microservice 🔥

87. 🔥 Vì sao không dùng được transaction ACID xuyên nhiều service? Two-phase commit vì sao thường bị tránh?
88. 🔥 Saga: 3 service A → B → C, C lỗi thì rollback B, A. Compensation viết thế nào (idempotent, có thể thất bại)? Điều gì xảy ra nếu bước compensation cũng lỗi? Orchestrator sập giữa chừng thì sao (lưu state machine trong DB)?
89. 🔥 Dual write problem: ghi DB xong rồi publish Kafka, sập ở giữa. Outbox pattern giải quyết thế nào, relay (polling vs CDC/Debezium), đảm bảo thứ tự và trùng lặp ra sao?
90. 🔥 Consumer idempotent: Kafka at-least-once, bảng `processed_messages` cùng transaction với nghiệp vụ, hoặc upsert/điều kiện trạng thái. Message trùng đến đồng thời ở hai consumer thì sao?
91. Exactly-once thật sự có không? Kafka transaction/idempotent producer giải quyết phạm vi nào, và vì sao ra ngoài Kafka (DB, bên thứ ba) vẫn cần idempotency ở phía nhận?
92. 🔥 Gọi bên thứ ba (SMS, thanh toán) bị timeout, không biết đã thực hiện chưa. Idempotency key, tra trạng thái trước khi gửi lại, lưu trạng thái "đã gửi", đối soát sau.
93. Thứ tự event: event "hủy" đến trước "tạo". Partition key, version/sequence trong event, bỏ qua event cũ, buffer chờ, hay thiết kế để thao tác giao hoán?
94. Event bị mất hoặc consumer bị lệch: replay từ offset, reconciliation job, khôi phục read model từ đầu. Retention của Kafka đủ không?
95. Eventual consistency nhìn từ người dùng: ghi xong, trang danh sách chưa thấy. UX và kỹ thuật xử lý (cập nhật lạc quan, đọc từ nguồn ghi, trạng thái "đang xử lý")?
96. CQRS: tách đường ghi và đọc, read model cập nhật bằng event. Lợi ích, chi phí (độ trễ, phức tạp), khi nào không cần?
97. Event sourcing: lưu chuỗi sự kiện thay vì trạng thái hiện tại. Ưu (audit, replay) và nhược (query phức tạp, schema evolution, snapshot). Khi nào hợp (sổ cái kho, tài chính)?
98. Distributed lock cho tài nguyên dùng chung: Redis, DB, ZooKeeper; hết hạn lock khi vẫn đang xử lý; fencing token.
99. Đồng bộ dữ liệu tham chiếu (danh mục SKU) giữa service: sao chép qua event hay gọi API mỗi lần? Độ tươi chấp nhận, xử lý khi service nguồn chết?
100. DLQ và retry topic: phân loại lỗi tạm thời vs vĩnh viễn, retry với trễ tăng dần, ai xử lý DLQ, replay an toàn thế nào, message "độc" làm kẹt partition thì sao?
101. Chuyển dữ liệu giữa hai phiên bản schema trong lúc rolling deploy: expand/contract, event có cả field cũ và mới, consumer cũ chịu được không?
102. Phát hiện lệch dữ liệu liên service tự động: job đối soát theo lô/checksum, metric "số bản ghi lệch", cảnh báo, quy trình sửa (ai sửa, sửa bên nào là chuẩn)?

## H. Resilience, vận hành và triển khai

103. 🔥 Observability cho microservice: correlation/trace ID đi xuyên HTTP, Kafka, thread pool, batch job. Distributed tracing (OpenTelemetry), sampling, tìm "service nào làm chậm" trong một request đi qua 6 service.
104. Alert tốt vs alert tồi: alert theo triệu chứng (error rate, latency) thay vì nguyên nhân, tránh alert fatigue, runbook kèm theo, on-call.
105. Health check: liveness vs readiness vs startup. Readiness có nên kiểm tra DB/Kafka không (rủi ro cả đàn pod cùng "không sẵn sàng" khi dependency chậm)?
106. Graceful shutdown: pod bị tắt khi đang xử lý request và consumer đang giữa batch. Xử lý thế nào (ngừng nhận, hoàn tất, commit offset, thời gian chờ)?
107. Chiến lược deploy: rolling, blue-green, canary. Chọn cái nào cho thay đổi có migration DB? Rollback khi code đã ghi dữ liệu định dạng mới?
108. Feature flag: rollout dần theo kho/phần trăm, kill switch, nợ flag cũ, flag lưu ở đâu và cache thế nào?
109. Cấu hình và bí mật: ConfigMap/Secret, Vault, xoay khóa, cấu hình khác nhau theo kho, thay đổi nóng không restart (cân nhắc rủi ro)?
110. Autoscaling: HPA theo CPU có đủ không? Với consumer Kafka scale theo lag, giới hạn bởi số partition, scale nhanh làm DB quá tải thì sao?
111. Giới hạn tài nguyên trong container: request/limit CPU, memory, JVM nhận biết cgroup, CPU throttling gây latency tăng bất thường, OOMKilled.
112. Bảo mật service-to-service: mTLS, token nội bộ, nguyên tắc tối thiểu quyền, secret không nằm trong image/log, quét lỗ hổng thư viện.
113. Kiểm thử trong microservice: unit, integration, contract, end-to-end. Vì sao e2e nhiều thì chậm và mong manh? Test với Kafka/DB thật bằng Testcontainers, test môi trường chung.
114. Chaos engineering: tắt một service/node/zone để kiểm chứng giả định. Bạn sẽ thử kịch bản nào đầu tiên (kill consumer giữa chừng, làm chậm DB, làm Redis chết)?
115. Tài liệu và quản trị API: catalog service, owner, SLA từng service, deprecation policy. Khi 30 service thì ai biết service nào làm gì?
116. Chi phí vận hành của microservice: số pipeline, số dashboard, số on-call, độ phức tạp debug. Dấu hiệu bạn đã "quá tay" với microservice?

# PHẦN 3: USE CASE / TROUBLESHOOTING

Với mỗi tình huống, phải nói được **quy trình**: xác định phạm vi → thu thập bằng chứng → giả thuyết → kiểm chứng → khắc phục tạm → sửa gốc → phòng ngừa.

## I. Hiệu năng và tải

117. 🔥 Sau release, p95 của một API từ 200ms lên 3 giây. Bạn làm gì trong 15 phút đầu? (so sánh trước/sau, xem diff release, trace, DB, dependency, rollback hay điều tra tiếp, ai quyết định?)
118. 🔥 Một pod CPU 100% nhưng traffic bình thường. Thread dump 3 lần cách nhau 5 giây, phân biệt GC, vòng lặp vô hạn, regex backtracking, serialization lớn, lock contention?
119. Heap tăng dần, 2 ngày thì OOM. Quy trình: GC log, heap dump, MAT, dominator tree, nghi ngờ (cache không giới hạn, ThreadLocal, listener, connection không đóng).
120. API list đơn hàng chậm dần theo thời gian. Giả thuyết (thiếu index phù hợp sort, offset sâu, count toàn bảng, N+1, bloat, dữ liệu tăng) và cách chứng minh từng cái.
121. Lỗi `Connection is not available` / cạn connection pool. Ai giữ connection (transaction dài, gọi API ngoài trong transaction, rò rỉ), điều tra bằng `pg_stat_activity` và metric Hikari, sửa gốc và sửa tạm.
122. Hệ thống chạy tốt, tăng tải 5 lần thì p95 tăng 20 lần. Giả thuyết đầu tiên (pool, lock, GC, query, dependency) và đo từng cái thế nào?
123. Lỗi tăng vọt lúc 2 giờ sáng mỗi ngày trùng giờ batch. Kiểm tra lock, I/O, autovacuum, connection pool, query nặng, tranh chấp tài nguyên với API.
124. Một query chạy 50ms trên staging nhưng 30 giây trên production. Nguyên nhân (dữ liệu, thống kê, plan, lock chờ, tham số) và cách tái hiện khi không có quyền vào production.
125. Throughput không tăng dù tăng số pod. Nút thắt chung (DB, lock một dòng nóng, một partition Kafka, API ngoài giới hạn), cách xác định.
126. Latency tăng chỉ vào vài phút sau mỗi lần deploy rồi giảm. Warm-up JIT, cache lạnh, pool chưa đầy, autoscaling chậm. Giảm thế nào?
127. API đơn giản nhưng thỉnh thoảng chậm 5 giây rồi bình thường (p99 xấu). Nguyên nhân (full GC, lock timeout, DNS, retry ngầm, noisy neighbor, CPU throttling)?
128. Báo cáo nặng của một người dùng làm cả hệ thống chậm. Cô lập thế nào (replica, hàng đợi, giới hạn, tách tài nguyên, chạy bất đồng bộ)?
129. Bạn có đúng 1 ngày để giảm tải một DB đang quá tải. Thứ tự hành động và vì sao tăng tài nguyên là phương án cuối?
130. Ước lượng throughput của dự án bạn đang làm: số liệu lấy từ đâu, giả định thế nào, peak, nút thắt dự đoán (câu bạn từng bị hỏi).

## K. Dữ liệu sai, lệch, trùng

131. 🔥 Phiếu nhập kho bị xử lý hai lần, tồn kho cộng đôi. Điều tra bằng chứng (log, thời gian, trace, bảng giao dịch), xác định root cause (retry, hai instance, thiếu unique, consumer trùng), sửa dữ liệu hiện tại thế nào, ngăn tái diễn bằng ràng buộc nào?
132. 🔥 Tồn kho hệ thống A và B lệch 3%. Quy trình tìm nguyên nhân (đối soát theo lô, mất event, mapping sai, sai thứ tự, múi giờ), thiết kế cơ chế tự phát hiện từ nay.
133. Hai request cùng trừ tồn kho, chỉ còn 1 món, ra tồn âm. Liệt kê cách giải, vì sao `synchronized` không đủ khi chạy nhiều pod, giải pháp tốt nhất cho tồn kho nóng.
134. Dữ liệu một kho sai do script sửa tay. Điều tra ai/lúc nào, khôi phục (PITR, sửa từ log), quy trình ngăn lặp lại (review script, chạy thử, backup bảng, transaction và kiểm tra rowcount).
135. Báo cáo tổng tiền ra số khác nhau mỗi lần chạy. Nguyên nhân (isolation, dữ liệu đang thay đổi, múi giờ, làm tròn, join nhân dòng) và cách làm cho ổn định.
136. Trạng thái đơn bị "kẹt" (không bao giờ hoàn tất). Tìm bằng truy vấn nào, nguyên nhân (event mất, consumer lỗi, saga kẹt, timeout không có), cơ chế tự phục hồi?
137. Dữ liệu đúng trong DB nhưng màn hình hiển thị cũ. Nghi cache, replica lag, CDN, read model chưa cập nhật. Kiểm tra từng tầng thế nào?
138. Hai hệ thống trao đổi dữ liệu, một bên báo "đã nhận", bên kia báo "chưa gửi". Cách điều tra thông điệp bị mất ở đâu (outbox, broker, consumer, mapping, bên thứ ba).
139. Mapping giữa hai hệ thống sai (null vs rỗng, số thập phân, enum lạ, múi giờ). Phát hiện sớm bằng validation, contract test, dữ liệu mẫu từ production ẩn danh.
140. Lỗi do dữ liệu cũ (legacy) không theo giả định code mới (null, trùng, định dạng lạ). Xử lý (defensive code, migration, backfill) và phòng ngừa?
141. Khách báo "đơn của tôi mất". Bạn truy vết xuyên các hệ thống theo thứ tự nào, cần log/ID nào, làm sao rút ngắn lần sau (correlation ID, trạng thái có lịch sử)?

## L. Messaging, Kafka và tích hợp

142. 🔥 Consumer lag tăng lên 1 triệu message. Chẩn đoán (consumer chậm, rebalancing liên tục, hot partition, downstream chậm, message lớn) và hành động (tăng consumer tới số partition, tối ưu xử lý, tăng partition và hậu quả với thứ tự).
143. Consumer rebalance liên tục, xử lý không tiến. Nguyên nhân (`max.poll.interval.ms` bị vượt do xử lý chậm, GC, crash loop), cách chỉnh và thiết kế lại.
144. Một message "độc" làm consumer kẹt mãi một partition. Cách phát hiện, đưa sang DLQ sau N lần, xử lý lệnh tuần tự vẫn đúng thứ tự thế nào?
145. Message trùng lặp xuất hiện sau khi broker/consumer restart. Giải thích bằng offset commit và cách làm cho an toàn.
146. Message bị mất (nghi). Kiểm tra tầng producer (`acks`, retry, idempotent), broker (replication, `min.insync.replicas`, unclean election), consumer (commit trước khi xử lý).
147. Event đến sai thứ tự gây trạng thái sai. Tái hiện, sửa bằng version/sequence, xử lý "cũ hơn thì bỏ qua", hoặc buffer.
148. Đối tác gửi webhook trùng/trễ/sai thứ tự và đôi khi gửi bão. Chịu tải và đảm bảo đúng thế nào (nhận nhanh vào queue, dedupe, xử lý bất đồng bộ, rate limit)?
149. API đối tác chậm hoặc chết hàng giờ. Hệ thống của bạn không được dừng hẳn: hàng đợi, retry có trần, circuit breaker, thông báo, xử lý bù khi họ hồi phục.
150. Retry storm: một service chậm, mọi client retry đồng loạt làm nó chết hẳn. Cơ chế chặn (backoff + jitter, retry budget, circuit breaker, load shedding).
151. Gửi SMS bị timeout, không rõ đã gửi hay chưa; retry có làm gửi đôi không? Xử lý theo mức quan trọng của tin nhắn.

## M. Hạ tầng, release và sự cố

152. Pod thỉnh thoảng restart không có log lỗi. Nghi ngờ (OOMKilled, liveness probe fail, thread bị block), kiểm tra bằng `kubectl describe`, metric bộ nhớ, exit code.
153. Sau release phát hiện bug nghiêm trọng, migration DB đã chạy. Rollback code có được không? Chiến lược expand/contract để rollback an toàn, forward-fix khi nào hợp lý?
154. Release cho 15 kho, kho 7 lỗi, kho khác bình thường. Tìm khác biệt (cấu hình, dữ liệu, phiên bản, migration lệch), cô lập, quyết định dừng hay tiếp tục các kho còn lại?
155. Hotfix cho một kho phải đưa về tất cả nhánh. Quy trình (cherry-pick, merge ngược), rủi ro lệch nhánh, cách kiểm soát.
156. Merge conflict lớn giữa nhánh release và nhánh phát triển làm mất code. Phát hiện, khôi phục, quy trình tránh.
157. Cấu hình sai (timeout, pool, URL) chỉ ở một môi trường gây lỗi lạ. Cách kiểm tra khác biệt cấu hình hệ thống, quản lý cấu hình như code.
158. Lỗi chỉ xuất hiện trên production, không tái hiện được ở staging. Điều gì thường khác (dữ liệu, tải, cấu hình, hạ tầng, đồng hồ, múi giờ)? Làm sao thu thập thêm bằng chứng mà không có quyền production (log bổ sung, feature flag debug, replay traffic, dữ liệu ẩn danh)?
159. Certificate hết hạn, secret xoay làm một service không kết nối được. Cách phát hiện, quy trình phòng ngừa (giám sát hạn, xoay tự động).
160. Disk đầy do log trên node. Xử lý khẩn, phòng ngừa (log rotation, giới hạn, đẩy log ra ngoài, cảnh báo sớm).
161. DNS/mạng chập chờn gây lỗi timeout rải rác. Phân biệt lỗi ứng dụng và lỗi mạng bằng bằng chứng nào?
162. Một thư viện phụ thuộc có lỗ hổng bảo mật nghiêm trọng (kiểu Log4Shell). Quy trình xác định mức ảnh hưởng, vá, kiểm thử, triển khai khẩn cấp.

## N. Incident, quy trình và tư duy

163. 🔥 Quy trình xử lý incident lớn: phát hiện, phân loại mức độ, tập hợp người, giao tiếp trạng thái, khắc phục tạm trước (rollback, tắt flag, scale), điều tra gốc sau. Vai trò Incident Commander, người ghi chép, người giao tiếp.
164. 🔥 Viết post-mortem không đổ lỗi: timeline, root cause (5 whys), vì sao không phát hiện sớm hơn, hành động khắc phục có chủ sở hữu và hạn chót. Kể một post-mortem bạn từng tham gia.
165. MTTD, MTTR: làm sao rút ngắn cả hai (alert tốt, dashboard, runbook, rollback nhanh, feature flag)?
166. Bạn chẩn đoán sai root cause lần đầu và đã fix "nhầm". Nhận ra sao, xử lý thế nào, rút ra gì?
167. Nhận một service chạy chậm, không có tài liệu. Tuần đầu bạn làm gì để hiểu và cải thiện an toàn (đo trước, vẽ bản đồ, chọn thắng lợi nhỏ, không refactor lớn khi chưa có test)?
168. Review code có: `@Transactional` ở controller, load cả bảng vào `List`, `catch (Exception e) {}`, `HashMap` static làm cache, gọi REST trong transaction. Bạn comment thế nào và xếp mức độ nghiêm trọng?
169. Team gặp issue member không xử được, bạn cũng chưa gặp. Quy trình: tách vấn đề, thu bằng chứng, tái hiện, hỏi chuyên gia, ghi lại tri thức, ai quyết định leo thang?
170. Giữa lúc sự cố, sếp ép "fix nhanh bằng mọi giá" và cách nhanh nhất có rủi ro mất dữ liệu. Bạn xử lý thế nào?
171. Bạn phát hiện lỗi do chính mình gây ra sau release. Nói với ai, khi nào, và hành động trước tiên là gì?
172. Chọn giữa tối ưu SQL, thêm cache, hay tăng pod khi API chậm: dựa vào dữ liệu nào? Khi nào "tăng pod" là câu trả lời đúng, khi nào là che giấu bệnh?
173. Làm sao chứng minh một cải tiến hiệu năng thực sự có hiệu quả (đo trước/sau, cùng điều kiện tải, p95/p99, không chỉ trung bình, kiểm soát yếu tố nhiễu)?
174. Một service quan trọng chưa từng có test, bạn cần sửa lỗi gấp. Làm sao sửa an toàn (characterization test, bao bọc thay đổi nhỏ, feature flag, canary)?

# CÁCH TRẢ LỜI KIỂU SENIOR

**System design (khung 6 bước, nói thành tiếng):**
1. Làm rõ yêu cầu (chức năng, phi chức năng, quy mô) và chốt giả định.
2. Ước lượng nhanh (QPS, dung lượng, tỷ lệ đọc/ghi).
3. Vẽ kiến trúc đơn giản nhất đáp ứng được, rồi API và mô hình dữ liệu.
4. Tìm nút thắt và thêm thành phần (cache, queue, shard) **có lý do**.
5. Đi qua failure mode: thành phần nào sập thì sao, dữ liệu mất hay trùng không.
6. Nêu trade-off và những gì bạn sẽ làm khác nếu có thêm thời gian/ngân sách.

**Troubleshooting (đo trước, đoán sau):**
1. **Phạm vi:** ảnh hưởng ai, từ khi nào, có trùng sự kiện nào (release, cấu hình, batch, tải)?
2. **Bằng chứng:** metric, trace, log, thread dump, plan, thay vì phỏng đoán.
3. **Giả thuyết xếp theo xác suất và chi phí kiểm tra**, loại dần.
4. **Khắc phục tạm** (rollback, tắt flag, scale) tách khỏi **sửa gốc**.
5. **Phòng ngừa:** alert, test, ràng buộc, quy trình. Chốt bằng một câu về bài học.

**Khi chưa gặp case đó:** "Em chưa gặp trực tiếp, nhưng em sẽ tiếp cận như sau..." rồi đi đúng quy trình trên. Nói "em chịu" là cách mất điểm nhanh nhất.

# CÁCH LUYỆN

1. **Thứ tự ưu tiên:** G (nhất quán dữ liệu), C (bài thiết kế mẫu: flash sale, thông báo, chuyển tiền, tồn kho 15 kho), F (giao tiếp), rồi I và K (troubleshooting). Đây là nhóm bạn vừa bị hỏi.
2. **Mỗi tuần 2 bài system design**, mỗi bài nói thành tiếng 30-40 phút, ghi âm, tự chấm theo khung 6 bước.
3. **Dựng lab:** nâng cấp Notification Hub với outbox, consumer idempotent, DLQ, saga lưu trạng thái, rồi kill consumer/broker giữa chừng để thấy hệ thống phản ứng. Đây là chất liệu thật để trả lời nhóm G và L.
4. **Mỗi tình huống troubleshooting**, tự viết quy trình 5 bước ra giấy, rồi đối chiếu với bug thật ở công ty (case file đã nói ở trên).
5. **Chấm ✅ / 🟡 / ❌** từng câu, ưu tiên 🔥 mà ❌.

# PROMPT LUYỆN VỚI AI

```
Bạn là interviewer senior Java backend/architect, phỏng vấn tôi (1.5 năm kinh nghiệm, Spring Boot, MyBatis, PostgreSQL, Kafka, WMS 15 kho ở outsourcing; side project Notification Hub). Nhắm mid, tư duy senior. Chế độ gắt: được chê thẳng khi tôi trả lời ẩu, không chê cá nhân.

LUẬT:
1. Mỗi lần MỘT đề. Xen kẽ: system design (có chen yêu cầu giữa chừng), microservice (consistency, resilience), troubleshooting (bạn đóng vai hệ thống đang lỗi, tôi hỏi gì bạn cung cấp số liệu giả lập).
2. System design: ép tôi làm đủ 6 bước (làm rõ → ước lượng → thiết kế → nút thắt → failure → trade-off). Tôi nhảy thẳng vào vẽ thì chặn lại.
3. Troubleshooting: chấm tính hệ thống của quy trình điều tra (phạm vi, bằng chứng, giả thuyết, khắc phục tạm vs sửa gốc, phòng ngừa), không chỉ kết luận.
4. Sau mỗi câu trả lời, đào sâu 2-3 lần: "nếu cái đó cũng sập thì sao", "đổi ràng buộc thì sao", "đo bằng gì".
5. Chấm /10 theo: đúng kỹ thuật, trade-off, failure mode, có số liệu. Cho đáp án chuẩn ngắn sau khi chấm.
6. Tôi được hỏi lại để làm rõ đề; chấm cả việc tôi có biết hỏi hay không.
7. Sau 6 đề: tổng kết top 3 lỗ hổng, top 3 thói quen nói xấu, 5 thứ cần học tiếp.
Nói tiếng Việt, bắt đầu bằng đề đầu tiên.
```

Mình có thể làm tiếp một trong ba việc: (1) đưa toàn bộ 7 phần (Java/JVM, Spring/JPA, SQL/DB, Coding, System design, Microservice, Troubleshooting) vào một file `.md` có bảng tick ✅/🟡/❌ để bạn theo dõi tiến độ, (2) viết đáp án mẫu ngắn cho các câu 🔥 của phần này (Saga, outbox, consumer idempotent, flash sale, chuyển tiền), hoặc (3) vào mock ngay: mình ra đề system design đầu tiên (ví dụ tồn kho tổng hợp 15 kho) và bạn làm theo khung 6 bước. Bạn chọn cái nào?