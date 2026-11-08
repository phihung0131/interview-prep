> Enhanced fault tolerance with Dead Letter Queues (DLQ) and ensured idempotency using PostgreSQL Upsert operations.

## A. Bối cảnh và phạm vi

1. 🔥 "Enhanced fault tolerance": trước khi có DLQ hệ thống hỏng ở đâu? Bạn cải thiện cụ thể điều gì?
2. Fault tolerance nói chung bao gồm những cơ chế nào (retry, timeout, circuit breaker, DLQ, idempotency, replication)? Bạn làm cái nào trong dự án?
3. ⚠️ Bạn có thật sự thấy message vào DLQ trong dự án không? Kể một trường hợp thực tế hoặc khi test.
4. "Ensured idempotency" — bạn đảm bảo bằng gì, tới mức nào? Có hay không có chỗ nào chưa idempotent?
5. Idempotency áp dụng ở những điểm nào: API nhận request, consumer Kafka, gọi nhà cung cấp, Saga step?
6. PostgreSQL Upsert đảm bảo idempotency cho phần nào, không đảm bảo phần nào? (ghi DB vs gửi email ra ngoài)
7. Vì sao chọn PostgreSQL cho phần này? Có cân nhắc cách khác (Redis, bảng dedupe riêng) không?
8. Bạn tự viết phần DLQ hay dùng Spring Kafka (`DeadLetterPublishingRecoverer`, `@RetryableTopic`)? Vì sao?
9. Phần nào trong dòng này là bạn tự thiết kế, phần nào theo hướng dẫn/tutorial?

## B. DLQ: khái niệm và thiết kế

10. 🔥 Dead Letter Queue là gì? Kafka không có DLQ sẵn, vậy DLQ trong Kafka thực chất là gì?
11. 🔥 Message nào được đưa vào DLQ: lỗi deserialize, lỗi validate, lỗi tạm thời hết số lần retry, lỗi nghiệp vụ? Bạn phân loại lỗi thế nào?
   ↳ Follow-up: Lỗi retriable và non-retriable khác nhau ra sao? Bạn xác định thế nào trong code? Lỗi trong nhà cung cấp trả 5xx so với 4xx?
12. 🔥 Quy trình retry trước khi vào DLQ: retry bao nhiêu lần, khoảng cách bao lâu?
13. 🔥 Backoff: fixed, exponential, exponential + jitter; vì sao jitter quan trọng?
14. Retry tại chỗ (blocking retry trong consumer) vs retry topic (non-blocking, `retry-5s`, `retry-1m`): khác nhau thế nào?
15. Blocking retry làm chặn cả partition (head-of-line blocking). Bạn xử lý thế nào?
16. Retry topic làm thay đổi thứ tự message: hệ quả với dữ liệu cần thứ tự?
17. `@RetryableTopic` của Spring Kafka: bạn biết cách nó tạo topic và cấu hình backoff không?
18. Cấu trúc message trong DLQ: giữ payload gốc, thêm header (lỗi, stack trace, topic gốc, partition, offset, số lần retry, timestamp)?
19. DLQ đặt tên thế nào (`<topic>.DLT`, theo service, theo loại lỗi)? Một DLQ chung hay mỗi topic một DLQ?
20. Partition key và số partition của DLQ so với topic gốc?
21. Retention của DLQ đặt bao lâu? Nếu hết hạn trước khi ai đó xử lý thì sao?
22. 🔥 Poison message (poison pill) là gì? Nếu không có DLQ, một message hỏng làm gì với consumer?
23. Message không deserialize được (lỗi định dạng) xảy ra ở tầng nào? `ErrorHandlingDeserializer` có dùng không?
24. Việc gửi vào DLQ bản thân cũng có thể thất bại (broker lỗi). Xử lý thế nào để không mất message?
25. Commit offset của message gốc khi đã đưa sang DLQ: thứ tự thao tác và nguy cơ mất hoặc trùng?
26. Có nên có DLQ cho mỗi consumer group, hay theo topic?
27. Circuit breaker trước khi vào DLQ: nhà cung cấp chết hoàn toàn thì có nên đổ hàng triệu message vào DLQ không? Bạn xử lý thế nào?
28. Phân biệt DLQ với retry queue, parking lot queue, delay queue.
29. Dead letter trong RabbitMQ/SQS và Kafka khác nhau thế nào?

## C. DLQ: vận hành và replay

30. 🔥 Message trong DLQ thì ai xử lý, quy trình ra sao? Có dashboard hay chỉ đọc log?
31. 🔥 Replay message từ DLQ: bạn làm bằng cách nào (script, consumer riêng, API quản trị)?
   ↳ Follow-up: Replay có thể gây gửi trùng không? Replay vào topic gốc hay topic retry? Làm sao tránh replay lặp vô tận?
32. Sau khi sửa bug, replay hàng loạt từ DLQ có làm quá tải hệ thống không? Điều tiết thế nào?
33. Có cho phép xem, lọc, sửa payload, bỏ qua (discard) từng message trong DLQ không?
34. Alert khi DLQ có message: ngưỡng nào, kênh nào, ai nhận?
35. Metrics DLQ: số message theo topic, theo loại lỗi, tuổi message cũ nhất?
36. Một message vào DLQ có ảnh hưởng đến trạng thái notification trong DB không (đánh dấu FAILED)? Ai cập nhật?
37. Người dùng/client cuối có được báo là notification thất bại không?
38. DLQ phình to không ai xử lý: cách quản lý vòng đời?
39. Dữ liệu cá nhân trong DLQ (email, số điện thoại): vấn đề bảo mật và lưu trữ?
40. Log tương quan giữa message gốc và message DLQ (correlation id) như thế nào để lần lại?
41. DLQ test: bạn kiểm thử kịch bản message hỏng, lỗi tạm thời, hết retry như thế nào?
42. Nếu lỗi do bug trong code consumer, replay trước khi deploy bản sửa thì sao?
43. Nếu cần giữ thứ tự theo key, một message vào DLQ thì các message sau của cùng key xử lý thế nào?

## D. Retry, timeout và các cơ chế chịu lỗi khác

44. Timeout khi gọi nhà cung cấp email/SMS: đặt bao nhiêu? Timeout xảy ra nhưng nhà cung cấp thực ra đã gửi thì sao?
45. Resilience4j (retry, circuit breaker, bulkhead, time limiter) bạn dùng cái nào, cấu hình thế nào?
46. Retry storm / retry amplification: nhiều tầng cùng retry thì nhân lên ra sao? Bạn tránh thế nào?
47. Circuit breaker states (closed, open, half-open): ngưỡng chuyển trạng thái bạn đặt thế nào?
48. Bulkhead: cô lập thread pool theo nhà cung cấp để một nhà cung cấp chậm không kéo cả hệ thống?
49. Graceful degradation: nếu kênh email chết thì hệ thống vẫn chấp nhận request và gửi sau?
50. Fallback sang nhà cung cấp dự phòng (multi-provider): có không? Làm sao tránh gửi hai lần?
51. Health check và tự phục hồi (restart policy) của các service?
52. Chaos test: bạn đã thử tắt Kafka, tắt PostgreSQL, tắt service giữa lúc chạy chưa? Kết quả?
53. Replication Kafka, PostgreSQL replica/failover: phần nào được thiết lập thật?
54. Backpressure khi consumer chậm hơn producer?
55. Message TTL nghiệp vụ: OTP hết hạn thì có nên retry không?

## E. Idempotency: khái niệm

56. 🔥 Idempotency là gì? Phân biệt với "safe" method và với deduplication.
57. 🔥 Vì sao hệ thống Kafka at-least-once bắt buộc phải có idempotent consumer?
58. Idempotent producer của Kafka và idempotent consumer của ứng dụng khác nhau thế nào? Cái nào bạn cần?
59. Những nguồn sinh trùng: client retry, producer retry, rebalancing, replay từ DLQ, consumer crash trước commit. Hệ thống bạn gặp cái nào?
60. 🔥 Idempotency key là gì, ai sinh ra (client, API, consumer), sinh bằng cách nào (UUID, hash nội dung, business key)?
   ↳ Follow-up: Key sinh từ client có thể giả mạo/đụng độ không? Hash nội dung có vấn đề gì khi hai notification giống hệt hợp lệ nhưng khác thời điểm?
61. Key theo business (userId + templateId + eventId) khác key kỹ thuật (messageId) thế nào, bạn chọn cái nào?
62. Thời gian hiệu lực của idempotency key (TTL): lưu bao lâu, xóa thế nào?
63. Cùng key nhưng payload khác: hệ thống xử lý ra sao (trả lỗi 409/422, trả kết quả cũ)?
64. Request lặp đến khi request đầu vẫn đang xử lý dở: trả gì, chờ hay từ chối?
65. Kết quả trả về cho request trùng: có trả đúng response của lần đầu không? Lưu response ở đâu?
66. Idempotent ≠ chỉ chặn trùng: trạng thái trung gian (đang xử lý, hoàn thành, thất bại) lưu thế nào?
67. "Exactly-once effect" = at-least-once delivery + idempotent processing. Giải thích.

## F. PostgreSQL upsert

68. 🔥 `INSERT ... ON CONFLICT (...) DO NOTHING` và `DO UPDATE`: khác nhau thế nào, bạn dùng cái nào và vì sao?
   ↳ Follow-up: `DO NOTHING` trả về mấy hàng khi trùng? Làm sao biết insert hay bị bỏ qua (`RETURNING`, update count)? `DO UPDATE` có thể gây hiệu ứng phụ gì?
69. 🔥 `ON CONFLICT` cần một unique index/constraint làm "conflict target". Bạn định nghĩa unique key trên cột nào? Vì sao?
70. Unique key nên là business key hay surrogate key? Composite key có vấn đề gì?
71. Upsert xử lý thế nào khi hai transaction cùng chèn một key đồng thời? PostgreSQL đảm bảo atomicity ra sao?
72. Isolation level mặc định của PostgreSQL (READ COMMITTED), upsert có hoạt động đúng ở mức này không? Có cần SERIALIZABLE không?
73. `SELECT` kiểm tra tồn tại rồi `INSERT` (check-then-act) có race condition gì? Vì sao upsert tốt hơn?
74. Nếu dùng `ON CONFLICT DO UPDATE`: điều kiện `WHERE` trong update (chỉ update khi version mới hơn) để chống message đến sai thứ tự?
75. `EXCLUDED` pseudo-table dùng thế nào?
76. Upsert tạo dead tuple/bloat do update lặp: ảnh hưởng và vacuum?
77. Sequence/serial bị tiêu tốn khi insert thất bại do conflict: hiện tượng "hổng id"?
78. Deadlock khi upsert nhiều hàng theo thứ tự khác nhau (batch upsert): tránh thế nào?
79. Batch upsert: `INSERT ... VALUES (...), (...) ON CONFLICT` hay JDBC batch? Hiệu năng?
80. `MERGE` của PostgreSQL 15+ khác `ON CONFLICT` thế nào?
81. Dùng Spring Data JPA `save()` (merge) khác gì upsert thật của PostgreSQL? Bạn dùng native query, JdbcTemplate, jOOQ hay Hibernate?
82. Index unique ảnh hưởng ghi: kích thước index, ghi chậm đi bao nhiêu?
83. Partial unique index, unique theo điều kiện: dùng khi nào?
84. Bảng dedupe riêng (`processed_messages`) so với unique key ngay trên bảng nghiệp vụ: đánh đổi?
85. Bảng dedupe phình to: dọn thế nào (TTL job, partition theo ngày)?
86. 🔥 Upsert và xử lý nghiệp vụ trong cùng một transaction: nếu nghiệp vụ lỗi thì rollback cả bản ghi dedupe, đúng không? Tại sao quan trọng?
87. Kiểm tra trùng xong rồi mới gửi email: nếu gửi email thất bại thì bản ghi "đã xử lý" xử lý ra sao để retry được?
88. Optimistic locking (version column) vs upsert: dùng cái nào cho cập nhật trạng thái?
89. Làm sao test được tính idempotent: gửi cùng message hai lần, đồng thời hai thread, kiểm tra DB?
90. Connection pool (HikariCP) và transaction trong consumer: bạn cấu hình thế nào?
91. `SELECT ... FOR UPDATE`, `SKIP LOCKED`, advisory lock: dùng khi nào trong luồng này?
92. Migration schema (Flyway/Liquibase) thêm unique constraint lên bảng đã có dữ liệu trùng: xử lý thế nào?

## G. Ranh giới của idempotency và exactly-once

93. 🔥 ⚠️ Upsert giúp idempotent trong DB. Còn việc gửi email/SMS ra bên ngoài thì idempotent bằng cách nào? Nếu consumer sập sau khi gọi nhà cung cấp mà trước khi ghi DB thì sao?
   ↳ Follow-up: Bạn dùng idempotency key phía nhà cung cấp chưa? Có cơ chế "đánh dấu đang gửi" trước khi gửi, rồi xác nhận sau không? Nếu nhà cung cấp không hỗ trợ idempotency thì chấp nhận trùng hay mất?
94. Thứ tự "ghi DB rồi gửi" hay "gửi rồi ghi DB": mỗi cách bị lỗi kiểu gì (gửi trùng vs không gửi)?
95. Bạn chọn at-least-once hay at-most-once cho việc gửi cuối cùng? Với OTP và marketing có khác nhau không?
96. Exactly-once semantics của Kafka (transaction + `read_committed`) có phạm vi gì? Vì sao vẫn cần idempotent khi ghi PostgreSQL?
97. Outbox pattern liên quan gì đến idempotency? Bạn có dùng không?
98. Quan hệ giữa idempotency và Saga compensation: bước bù trừ phải idempotent thế nào?
99. Idempotency ở lớp API: header `Idempotency-Key` (kiểu Stripe) có hỗ trợ không? Lưu ở đâu?
100. Redis dedupe (`SET NX EX`) vs PostgreSQL dedupe: ưu nhược điểm, vì sao chọn PostgreSQL?
101. Bloom filter để lọc nhanh trùng: có dùng không? Hạn chế?
102. Dedupe window: trùng xảy ra cách nhau lâu hơn TTL thì sao?
103. Hai bản ghi gần giống nhau do user thao tác hai lần có phải trùng không? Phân biệt "trùng kỹ thuật" và "trùng nghiệp vụ".

## H. Tình huống và failure

104. 🔥 Consumer xử lý xong, ghi DB xong, chưa commit offset rồi sập: sau khi khởi động lại điều gì xảy ra và vì sao không hỏng dữ liệu?
105. 🔥 Message đến lần đầu thất bại ở bước gửi, lần retry thứ hai thành công: bản ghi trong DB phản ánh thế nào, có bị upsert chặn nhầm không?
106. Hai consumer cùng nhận một message (do rebalancing) và upsert đồng thời: một cái thắng, cái kia làm gì?
107. Message A (cập nhật cũ) đến sau message B (cập nhật mới) cho cùng một notification: upsert có ghi đè trạng thái mới bằng trạng thái cũ không? Xử lý thế nào?
108. DLQ replay một message đã từng xử lý thành công một phần: kết quả?
109. PostgreSQL chết giữa chừng: consumer làm gì (retry, pause, vào DLQ)? Message có bị đẩy sang DLQ oan không?
110. Lỗi tạm thời của DB (deadlock, serialization failure, connection timeout) có phải đưa vào DLQ không?
111. Nhà cung cấp trả 429 hoặc 503 hàng loạt: backoff, circuit breaker, DLQ phối hợp thế nào?
112. Bug trong code làm 10.000 message vào DLQ: kế hoạch khắc phục (sửa, deploy, replay có điều tiết, kiểm tra không trùng)?
113. Phát hiện user nhận hai email giống nhau: bạn điều tra thế nào để tìm nguyên nhân (log, trace, bảng dedupe, offset)?
114. Làm sao chứng minh với khách hàng rằng một notification chỉ được gửi một lần?
115. Replay toàn bộ topic từ đầu (reset offset) để khôi phục dữ liệu: với idempotent consumer có an toàn không?

## I. Observability, test, vận hành

116. Theo dõi message qua retry và DLQ: header, trace id, log bạn thiết kế thế nào?
117. Metrics: số retry, tỉ lệ thất bại, tỉ lệ trùng bị chặn, kích thước DLQ. Bạn đã đặt dashboard nào?
118. Alert khi tỉ lệ lỗi tăng vọt hay DLQ lớn lên?
119. Test tích hợp với Kafka + PostgreSQL thật (Testcontainers) cho retry, DLQ, upsert như thế nào?
120. Load test idempotency: gửi cùng một message 1000 lần đồng thời, kỳ vọng kết quả?
121. Chi phí hiệu năng của upsert và bảng dedupe khi throughput tăng cao: bạn đo chưa?
122. Cấu hình theo môi trường (số lần retry, backoff, TTL) lấy từ đâu, đổi runtime được không?

## J. Đánh đổi và phản tư

123. Retry nhiều lần có thể làm trễ notification và tăng tải: cân bằng thế nào?
124. Có nên bỏ DLQ và chỉ log lỗi? Vì sao DLQ tốt hơn?
125. DLQ trong Kafka hay trong bảng PostgreSQL (failed_messages)? Đánh đổi?
126. Idempotency tốn chi phí (một lần ghi thêm, một index thêm) có đáng cho notification marketing không?
127. Nếu làm lại, bạn thay đổi gì ở cách xử lý lỗi và idempotency?
128. Bạn đã học được gì về khác biệt giữa "chạy được khi happy path" và "chịu lỗi thật sự"?
129. Phần nào của dòng CV này bạn chắc chắn trả lời được từng chi tiết, phần nào chỉ nắm khái niệm?
130. Nếu interviewer hỏi "đưa tôi xem DLQ đã bắt được message thật trong dự án", bạn trình bày được không?
