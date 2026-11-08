> Developed an event-driven microservices architecture using Spring Boot and Kafka for asynchronous, distributed notification delivery.

## A. Bối cảnh, động lực và phạm vi tự làm

1. 🔥 Notification Hub là gì, giải quyết bài toán nào? Vì sao bạn chọn làm dự án này?
   ↳ Follow-up: Phạm vi MVP là gì, bạn bỏ gì ra ngoài? Ai là người dùng giả định?
2. Dự án diễn ra từ Oct 2025 đến Jan 2026, bạn làm một mình hay có người khác? Phần nào do bạn tự viết hoàn toàn?
3. ⚠️ CV ghi "Backend Engineer" cho một dự án cá nhân. Bạn đảm nhận những vai trò nào (design, code, deploy, test)?
4. Mục tiêu của bạn khi làm dự án này là học công nghệ hay giải quyết một nhu cầu thật? Có người dùng thật nào dùng nó chưa?
5. 🔥 Vì sao chọn kiến trúc event-driven microservices cho một hệ thống notification? Có lựa chọn đơn giản hơn không?
   ↳ Follow-up: Event-driven đem lại gì cụ thể mà request-response không có? Bạn gặp khó khăn nào khi debug?
6. ⚠️ Với dự án cá nhân quy mô nhỏ, microservices có phải over-engineering không? Bạn biện minh thế nào?
7. Nếu bắt đầu lại từ đầu, bạn sẽ chọn modular monolith hay microservices? Vì sao?
8. Bạn học Kafka và microservices từ nguồn nào (khóa học, sách, docs, dự án công ty)? Phần nào là tự mày mò?
9. Dự án này khác gì so với công việc bạn làm ở công ty (WMS, Kafka đã dùng ở đâu)? Có mang kinh nghiệm công ty sang không?
10. Trong dự án, thứ khó nhất bạn gặp là gì và giải quyết ra sao?
11. Điều gì bạn làm sai lúc đầu rồi phải sửa lại thiết kế?
12. Bạn có viết tài liệu thiết kế, sơ đồ kiến trúc, ADR cho dự án không? Cho mình xem được không?
13. Repo trên GitHub có README, hướng dẫn chạy, sơ đồ không? Người khác clone về chạy được không?
14. Bạn kiểm chứng dự án chạy đúng bằng cách nào? Có số liệu throughput, latency nào đo được không?
15. 🔥 "Notification" ở đây gồm những kênh nào (email, SMS, push, in-app, webhook)? Kênh nào do bạn thật sự tích hợp?
16. Gửi notification thật qua nhà cung cấp bên ngoài hay mock/giả lập? Nếu mock thì ảnh hưởng gì đến độ tin cậy của thiết kế?
17. Ai là "client" của Notification Hub: service nội bộ, ứng dụng bên ngoài, hay người dùng cuối? Họ gọi vào bằng cách nào?
18. Có những loại notification nào (transactional, marketing, OTP, alert)? Mỗi loại có yêu cầu độ trễ và độ tin cậy khác nhau không?

## B. Kiến trúc microservices và ranh giới service

19. 🔥 Hệ thống có bao nhiêu service, mỗi service chịu trách nhiệm gì? Vẽ sơ đồ ra được không?
   ↳ Follow-up: Service nào nhiều traffic nhất? Service nào có state? Service nào có thể gộp lại?
20. 🔥 Bạn chia ranh giới service dựa trên tiêu chí nào (domain, team, scaling, dữ liệu)?
   ↳ Follow-up: Nếu hai service cùng cần một bảng dữ liệu thì xử lý thế nào?
21. Mỗi service có database riêng không? Nếu có thì loại DB nào và vì sao?
22. Service nào là điểm vào (API gateway / ingestion)? Có dùng API gateway thật không?
23. Service nào có thể scale độc lập, và vì sao đó là lý do để tách?
24. ⚠️ Nếu hai service luôn deploy cùng nhau và luôn đổi cùng nhau thì có nên tách không? Dự án của bạn có trường hợp như vậy không?
25. Có "distributed monolith" trong thiết kế của bạn không? Làm sao nhận ra dấu hiệu?
26. Dữ liệu dùng chung giữa các service xử lý thế nào (duplicate, API call, event)?
27. Service discovery và cấu hình tập trung làm thế nào (Eureka, Consul, Kubernetes DNS, Spring Cloud Config, biến môi trường)?
28. Giao tiếp đồng bộ và bất đồng bộ trong hệ thống được phân chia theo nguyên tắc nào?
29. Khi nào bạn chọn gọi trực tiếp (gRPC) và khi nào phát event qua Kafka?
30. Một request notification đi qua những service nào từ lúc nhận đến lúc gửi xong? Kể từng bước.
31. Service nào là "owner" của trạng thái notification (pending, sent, failed)? Trạng thái được cập nhật thế nào?
32. Chia service theo kênh (email service, SMS service) hay theo chức năng (template, scheduler, delivery)? Vì sao?
33. Thêm một kênh mới (ví dụ Zalo, Telegram) cần sửa những chỗ nào? Có theo Open/Closed không?
34. Quản lý template notification, đa ngôn ngữ, biến thay thế được đặt ở service nào?
35. Preference của người dùng (opt-in/opt-out, kênh ưu tiên, giờ yên lặng) có được xử lý không? Ở đâu?
36. Đánh đổi lớn nhất khi tách thành microservices trong dự án này là gì (độ phức tạp vận hành, consistency, debug)?
37. Contract giữa các service (event schema, proto) được quản lý và versioning thế nào?
38. Một service chết thì các service khác bị ảnh hưởng ra sao? Có single point of failure nào không?

## C. Spring Boot

39. Bạn dùng phiên bản Spring Boot / Java nào? Vì sao chọn phiên bản đó?
40. 🔥 Dùng Spring Kafka (`@KafkaListener`, `KafkaTemplate`) hay Kafka client thuần hay Spring Cloud Stream? Vì sao?
   ↳ Follow-up: Bạn cấu hình error handler và retry ở đâu? Ack mode nào?
41. Cấu hình `ConcurrentKafkaListenerContainerFactory`: concurrency, ack mode, error handler bạn chỉnh những gì?
42. `@KafkaListener` chạy trên thread nào? Một message xử lý lâu thì ảnh hưởng gì đến consumer?
43. Bạn chọn blocking (Spring MVC) hay reactive (WebFlux) và vì sao?
44. Virtual threads (Java 21) có liên quan đến thiết kế consumer của bạn không?
45. Quản lý profile và cấu hình môi trường (dev, test, prod) thế nào? Secret để ở đâu?
46. Serialization của message: JSON, Avro, Protobuf? Dùng `JsonSerializer` của Spring thì có rủi ro gì (type headers, class path)?
47. Transaction trong Spring (`@Transactional`) kết hợp với Kafka producer: transaction của DB và Kafka có đồng bộ không?
48. Bạn xử lý exception trong consumer thế nào (`DefaultErrorHandler`, `SeekToCurrentErrorHandler`, `@RetryableTopic`)?
49. Bean lifecycle, graceful shutdown của consumer khi service tắt: bạn xử lý thế nào để không mất hoặc xử lý trùng message?
50. Bạn dùng Spring Actuator, Micrometer cho những gì?
51. Health check (liveness, readiness) của service có kiểm tra kết nối Kafka không? Có nên không?
52. Thread pool/executor nào được cấu hình? Có `@Async` không, khi nào?
53. Spring Boot khởi động chậm, ảnh hưởng gì khi scale nhanh? Bạn có tối ưu gì không?

## D. Kafka: kiến trúc topic, partition, key

54. 🔥 Thiết kế topic của bạn thế nào: bao nhiêu topic, đặt tên ra sao, mỗi topic mang loại event nào?
55. 🔥 Mỗi topic bao nhiêu partition và replication factor? Bạn chọn con số đó dựa trên căn cứ nào?
   ↳ Follow-up: Nếu tải tăng 10 lần thì tăng partition thế nào? Ảnh hưởng gì đến consumer đang chạy?
56. 🔥 Partition key bạn dùng là gì (userId, notificationId, tenantId)? Vì sao?
   ↳ Follow-up: Nếu chọn sai key thì hệ quả gì? Nếu không dùng key thì mất gì?
57. Có nguy cơ hot partition không (một user/tenant gửi quá nhiều)? Xử lý thế nào?
58. Tăng số partition sau khi hệ thống chạy thì ảnh hưởng gì đến ordering theo key?
59. Có thể giảm số partition không? Nếu không thì khi chọn sai phải làm gì?
60. Một topic cho nhiều loại event hay mỗi loại một topic? Đánh đổi?
61. Topic theo kênh (`email`, `sms`) hay theo trạng thái (`requested`, `sent`)? Bạn quyết định thế nào?
62. Topic compaction (`cleanup.policy=compact`) có dùng không? Khi nào hợp lý?
63. 🔥 Retention (`retention.ms`, `retention.bytes`) bạn đặt bao nhiêu? Quan hệ với khả năng replay là gì?
64. `min.insync.replicas` bạn đặt thế nào, kết hợp với `acks=all` ra sao? Một broker chết thì chuyện gì xảy ra?
65. Replication factor 3 mà chỉ chạy 1 broker (môi trường dev/dự án cá nhân) thì sao? Bạn chạy Kafka thế nào (Docker, KRaft, ZooKeeper)?
66. ⚠️ Cụm Kafka của bạn có mấy broker? Nếu chỉ một broker thì "distributed" ở CV có nghĩa gì?
67. KRaft khác ZooKeeper chỗ nào, bạn dùng cái nào?
68. Auto create topics có bật không? Rủi ro khi để mặc định?
69. Message size: notification kèm nội dung/attachment lớn thì để thẳng vào Kafka hay chỉ truyền tham chiếu? `max.message.bytes`?
70. Event payload nên mang đầy đủ dữ liệu (event-carried state transfer) hay chỉ ID? Bạn chọn gì và vì sao?

## E. Kafka: producer

71. 🔥 Cấu hình producer: `acks`, `retries`, `enable.idempotence`, `max.in.flight.requests.per.connection` bạn đặt thế nào? Ý nghĩa từng cái?
   ↳ Follow-up: Bật idempotence thì giới hạn `max.in.flight` bao nhiêu để vẫn giữ thứ tự? `acks=all` thì latency tăng bao nhiêu?
72. `acks=0`, `1`, `all` khác nhau ra sao về độ bền và độ trễ?
73. Idempotent producer hoạt động thế nào (producer ID, sequence number)? Giải quyết lỗi nào, không giải quyết lỗi nào?
74. Kafka transactions (transactional.id) bạn có dùng không? Khi nào cần?
75. `linger.ms`, `batch.size`, `compression.type` ảnh hưởng thế nào đến throughput và latency?
76. Retry của producer có làm đảo thứ tự message không? Điều kiện nào thì xảy ra?
77. Producer gửi lỗi (broker không phản hồi, timeout) thì service xử lý ra sao? Request của client có bị fail không?
78. Gửi sync (`.get()`) hay async với callback? Đánh đổi?
79. 🔥 Vấn đề dual write: ghi DB rồi gửi Kafka, giữa chừng sập thì sao? Bạn xử lý thế nào?
   ↳ Follow-up: Outbox pattern, CDC, hay Kafka transaction: bạn chọn gì? Có dùng thật trong dự án không?
80. Producer chọn partition thế nào khi có key và không có key (sticky partitioner)?
81. Message có header gì (correlation id, trace id, event type, version)?

## F. Kafka: consumer, offset, rebalancing

82. 🔥 Consumer group của bạn thiết kế thế nào? Mỗi service một group hay nhiều group trên cùng topic?
83. Số consumer tối đa hữu ích trong một group là bao nhiêu, quan hệ với số partition?
84. 🔥 Offset commit: auto commit hay manual? Commit trước hay sau khi xử lý? Hệ quả của từng cách?
   ↳ Follow-up: Spring Kafka `AckMode` BATCH, RECORD, MANUAL_IMMEDIATE khác nhau thế nào? Bạn chọn gì?
85. `enable.auto.commit=true` có thể gây mất hay trùng message trong trường hợp nào?
86. Commit sync vs async, commit từng record vs theo batch: đánh đổi?
87. 🔥 Rebalancing là gì, vì sao xảy ra, ảnh hưởng gì đến hệ thống (stop-the-world, xử lý trùng)?
   ↳ Follow-up: Làm sao giảm rebalance không cần thiết? Khi rebalance mà consumer đang xử lý dở thì sao?
88. Eager vs cooperative rebalancing, static membership (`group.instance.id`): bạn biết và dùng chưa?
89. `max.poll.interval.ms`, `max.poll.records`, `session.timeout.ms`, `heartbeat.interval.ms`: quan hệ giữa chúng và lỗi bạn gặp khi xử lý chậm?
90. Xử lý một message mất quá `max.poll.interval.ms` (ví dụ gọi API gửi mail chậm) thì chuyện gì xảy ra?
91. 🔥 Delivery semantics at-most-once, at-least-once, exactly-once: hệ thống của bạn thuộc loại nào và vì sao?
   ↳ Follow-up: Cấu hình nào ở producer và consumer để đạt at-least-once? Exactly-once trong Kafka Streams khác consumer thường thế nào?
92. ⚠️ Bạn có nói được hệ thống của mình "exactly-once" không? Nếu không thì làm sao đảm bảo user không nhận hai email?
93. `auto.offset.reset` earliest/latest: khi nào mất message do chọn sai?
94. Consumer lag là gì, bạn theo dõi và xử lý thế nào khi lag tăng?
95. Làm sao replay lại message cho một consumer group (reset offset, seek)? Đã từng làm chưa?
96. Thêm một consumer group mới đọc lại toàn bộ lịch sử: khi nào hữu ích?
97. Pause/resume consumer khi downstream (nhà cung cấp SMS) quá tải: bạn xử lý thế nào để áp lực ngược (backpressure)?
98. Xử lý song song trong một consumer: nhiều thread xử lý nhưng vẫn giữ thứ tự theo key, làm thế nào?
99. Consumer nhận được message hỏng (không deserialize được) thì sao? Có chặn cả partition không (poison pill)?
100. Thứ tự message: Kafka đảm bảo thứ tự ở mức nào? Hệ thống của bạn có thật sự cần thứ tự không?

## G. Độ tin cậy, thứ tự, schema

101. 🔥 Một event notification bị gửi trùng thì điều gì xảy ra với user? Bạn chặn thế nào?
   ↳ Follow-up: Bạn chặn bằng idempotency ở đâu? Gửi ra nhà cung cấp ngoài có thể trùng không?
102. Event bị mất ở khâu nào có thể xảy ra (producer, broker, consumer)? Với từng khâu bạn bảo vệ ra sao?
103. Nếu hai event của cùng một notification đến sai thứ tự (ví dụ `SENT` đến trước `REQUESTED`) thì xử lý thế nào?
104. 🔥 Schema event được quản lý thế nào: JSON thuần, Avro/Protobuf với Schema Registry? Backward/forward compatibility?
   ↳ Follow-up: Nếu dùng JSON, điều gì ngăn producer làm hỏng consumer? Có contract test không?
105. Đổi schema event (thêm/xóa field) khi producer và consumer deploy lệch nhau thì xử lý ra sao?
106. Event versioning: bạn đặt version trong payload, topic, hay header?
107. Event naming: command ("SendEmail") và event ("EmailSent") khác nhau thế nào? Bạn dùng loại nào trong thiết kế?
108. Event sourcing có dùng không? Khác gì với event-driven đơn thuần?
109. Có sử dụng CQRS không? Read model của trạng thái notification được xây dựng thế nào?
110. Thời gian sống của một event (TTL nghiệp vụ): notification OTP đã hết hạn mà vẫn nằm trong queue thì xử lý ra sao?

## H. Bất đồng bộ, độ trễ và giao tiếp với client

111. 🔥 Vì sao "bất đồng bộ" tốt cho notification? Đánh đổi so với gọi đồng bộ trực tiếp nhà cung cấp là gì?
112. Client gửi yêu cầu xong, làm sao biết notification đã được gửi (polling, webhook, callback)? API trả 202 hay 200?
113. Độ trễ end-to-end từ lúc nhận request đến lúc gửi đi là bao nhiêu? Bạn đo bằng cách nào?
114. Notification khẩn (OTP) và notification thường (marketing) có đi chung topic không? Có cơ chế ưu tiên (priority) không?
115. Scheduled/delayed notification (gửi lúc 9h sáng mai) triển khai thế nào khi Kafka không có delay message sẵn?
116. Batch/bulk notification (gửi cho 1 triệu user) xử lý thế nào? Fan-out ở đâu?
117. Quản lý ngưỡng gửi của nhà cung cấp bên ngoài (throttling downstream) bạn làm ở đâu?
118. Nếu nhà cung cấp email chết hoàn toàn trong 1 giờ, hệ thống của bạn hành xử ra sao (circuit breaker, retry, fallback sang kênh khác)?
119. Fallback kênh (email thất bại thì gửi SMS) có được thiết kế không? Làm sao tránh gửi trùng?

## I. Observability, test, deploy

120. 🔥 Làm sao theo dõi một notification cụ thể đi qua các service (correlation id, distributed tracing)? Trace id truyền qua Kafka header thế nào?
121. Bạn dùng log, metrics, tracing nào (ELK, Prometheus, Grafana, OpenTelemetry, Zipkin)? Cái nào thật sự đã set up?
122. Metrics quan trọng nhất bạn theo dõi là gì (lag, throughput, error rate, latency, số message vào DLQ)?
123. Alert nào bạn sẽ đặt cho hệ thống này?
124. Test strategy: unit, integration (Testcontainers/EmbeddedKafka), contract, end-to-end. Bạn thật sự viết loại nào?
125. Test consumer thế nào để chứng minh nó idempotent và xử lý đúng khi message trùng?
126. Test thế nào cho kịch bản broker chết, consumer chết giữa chừng?
127. Deploy bằng gì: Docker Compose, Kubernetes, cloud? Có CI/CD không?
128. Rolling deploy một consumer thì rebalancing xảy ra thế nào, làm sao giảm gián đoạn?
129. Cấu hình scale: scale theo CPU hay theo consumer lag? Giới hạn bởi gì?
130. Bạn đã chạy load test chưa? Công cụ nào, kết quả nào, nút thắt ở đâu?
131. Bảo mật: Kafka có bật SASL/SSL, ACL không? Dữ liệu cá nhân (email, số điện thoại) trong event được bảo vệ thế nào?
132. Dữ liệu cá nhân nằm trong topic có retention dài thì có vấn đề tuân thủ (GDPR, xóa dữ liệu) không?

## J. Failure scenario và tình huống

133. 🔥 Consumer chết sau khi gửi email nhưng trước khi commit offset: chuyện gì xảy ra?
   ↳ Follow-up: Sau khởi động lại, user nhận mấy email? Làm sao giảm khả năng này về 0?
134. 🔥 Consumer commit offset rồi mới xử lý, xử lý lỗi: chuyện gì xảy ra?
135. Broker leader của partition chết: producer và consumer thấy gì, mất bao lâu để phục hồi, có mất message không?
136. Toàn bộ cụm Kafka chết: producer của bạn làm gì? Có buffer, fallback, hay trả lỗi cho client?
137. Lag tăng đột biến 100 lần vào giờ cao điểm: bạn điều tra và xử lý theo trình tự nào?
138. Một message khiến consumer crash lặp đi lặp lại: dấu hiệu, cách cô lập, cách khắc phục?
139. Deploy phiên bản mới làm đổi schema event và consumer cũ crash: cách ngăn chặn và khôi phục?
140. Hai instance consumer cùng xử lý một message do rebalancing: hậu quả và cách phòng?
141. Topic bị xóa nhầm hoặc retention hết trước khi consumer đọc: hậu quả và cách phòng?
142. Một tenant/user spam gửi hàng triệu notification làm ảnh hưởng người khác (noisy neighbor): giải pháp?

## K. So sánh, đánh đổi, phản tư

143. 🔥 Kafka vs RabbitMQ vs SQS vs Redis Streams cho bài toán notification: vì sao chọn Kafka?
   ↳ Follow-up: Nếu chỉ có 10 msg/s, Kafka còn hợp lý không? Khi nào bạn đổi sang RabbitMQ/SQS?
144. Kafka có phải quá nặng cho dự án này? Thay bằng message queue đơn giản hơn thì mất gì, được gì?
145. Vì sao không dùng một bảng DB làm queue (polling)? Khi nào cách đó lại đủ tốt?
146. Event-driven so với request-response: bạn đã gặp nhược điểm nào (khó debug, eventual consistency, khó test)?
147. Choreography vs orchestration trong luồng gửi notification: bạn nghiêng về cái nào?
148. Eventual consistency ảnh hưởng thế nào đến trải nghiệm người dùng (trạng thái hiển thị chậm)?
149. Điều gì trong thiết kế hiện tại bạn không hài lòng nhất? Nếu có thêm 2 tháng bạn sửa gì?
150. Bạn học được điều gì lớn nhất từ dự án và đã áp dụng vào công việc chính chưa?
151. Nếu hệ thống tăng 100 lần tải, thành phần nào vỡ trước?
152. Nếu interviewer yêu cầu bạn vẽ lại kiến trúc trên bảng và giải thích từng mũi tên, bạn sẵn sàng chưa? Mũi tên nào bạn còn chưa chắc?
