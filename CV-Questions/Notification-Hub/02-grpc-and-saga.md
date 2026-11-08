> Implemented inter-service communication via gRPC and maintained data consistency using a basic Saga pattern approach.

## A. Bối cảnh và phạm vi tự làm

1. 🔥 Trong Notification Hub, những service nào giao tiếp với nhau bằng gRPC? Vẽ lại luồng gọi.
2. Bạn tự viết cả client và server gRPC hay chỉ một phía? Có file `.proto` nào do bạn tự thiết kế?
3. ⚠️ Đây là dự án cá nhân, bạn có thật sự có nhiều service gọi nhau qua gRPC chạy cùng lúc không? Chạy ở đâu?
4. 🔥 Vì sao một hệ thống đã có Kafka (event-driven) lại còn cần gRPC? Hai thứ này chia nhau việc thế nào?
   ↳ Follow-up: Nếu chỉ dùng Kafka thì mất gì? Nếu chỉ dùng gRPC thì mất gì? Có luồng nào bạn có thể chuyển từ gRPC sang Kafka và ngược lại không?
5. 🔥 Chữ "maintained data consistency" trong CV: consistency giữa những thứ gì với những thứ gì (DB của service nào với DB của service nào)?
6. ⚠️ Bạn viết "basic Saga pattern approach". "Basic" nghĩa là gì? Thiếu những gì so với một Saga đầy đủ?
   ↳ Follow-up: Cái "thiếu" đó có phải là cố ý không? Nếu lên production bạn bổ sung gì? Có chỗ nào đang có rủi ro dữ liệu lệch mà bạn biết?
7. ⚠️ "Approach" ở cuối câu: bạn đang dùng thư viện/framework Saga (Axon, Camunda, Temporal, Eventuate) hay tự cài đặt? Nếu tự cài thì gồm những thành phần nào?
8. Bạn đọc về Saga từ nguồn nào? Có tài liệu nào bạn bám vào khi thiết kế?
9. Phần nào của luồng nghiệp vụ cần đến Saga trong Notification Hub? Cho ví dụ một transaction cụ thể trải qua nhiều service.
10. Nếu không có Saga, chuyện gì xấu xảy ra trong ví dụ đó?

## B. gRPC: nền tảng và protobuf

11. gRPC là gì, chạy trên giao thức nào (HTTP/2)? Khác REST/HTTP 1.1 ở những điểm chính?
12. 🔥 Vì sao chọn gRPC thay vì REST để giao tiếp giữa các service nội bộ?
   ↳ Follow-up: gRPC khó chỗ nào so với REST (debug, browser, load balancer)? Bạn có thấy lợi ích thật khi đo hiệu năng không?
13. Protobuf là gì, vì sao gọn và nhanh hơn JSON? Có nhược điểm nào (khó đọc, cần compile)?
14. Field number trong proto có ý nghĩa gì? Đổi số hoặc xóa field thì sao?
15. 🔥 Backward/forward compatibility trong protobuf: thêm field, xóa field, đổi kiểu, đổi tên field thì cái nào an toàn?
16. `reserved` dùng để làm gì?
17. Giá trị mặc định trong proto3: không phân biệt được "không gửi" và "bằng 0/rỗng"; bạn xử lý thế nào (`optional`, wrapper types)?
18. `oneof`, `enum`, `repeated`, `map`, `Timestamp`, `Any`: bạn dùng cái nào, lưu ý gì với enum giá trị `0`?
19. Sinh code từ proto: dùng Maven/Gradle plugin nào, đặt `.proto` ở repo chung hay mỗi service giữ một bản?
20. Quản lý và chia sẻ proto giữa các service thế nào để tránh lệch phiên bản?
21. Package, naming, versioning (`v1`, `v2`) của service proto bạn đặt thế nào?
22. Bạn dùng thư viện nào cho Spring Boot (grpc-spring-boot-starter, net.devh, grpc-java thuần)? Vì sao?
23. Một `Channel` / `ManagedChannel` nên tạo mấy lần, reuse thế nào? Điều gì xảy ra nếu tạo mới mỗi request?
24. Blocking stub, async stub, future stub: khác nhau thế nào và bạn dùng loại nào?

## C. gRPC: các kiểu gọi, deadline, lỗi

25. 🔥 Bốn kiểu gRPC (unary, server streaming, client streaming, bidirectional): bạn dùng kiểu nào? Có chỗ nào cần streaming trong hệ thống không?
26. 🔥 Deadline và timeout trong gRPC: bạn đặt thế nào? Vì sao nên đặt deadline cho mọi call?
27. Deadline propagation qua nhiều service là gì? Nếu A gọi B gọi C thì deadline xử lý ra sao?
28. Cancel: client hủy call thì server làm gì? Server có kiểm tra được không?
29. 🔥 Error model của gRPC: status code (`UNAVAILABLE`, `DEADLINE_EXCEEDED`, `INVALID_ARGUMENT`, `ALREADY_EXISTS`, `FAILED_PRECONDITION`...) khác HTTP status thế nào?
30. Lỗi nào của gRPC nên retry, lỗi nào không? `UNAVAILABLE` vs `INTERNAL` vs `DEADLINE_EXCEEDED`?
31. Rich error model (`google.rpc.Status`, error details) có dùng không? Trả chi tiết lỗi nghiệp vụ thế nào?
32. Metadata và interceptor: bạn dùng để làm gì (auth, trace id, logging)?
33. Server interceptor xử lý exception tập trung thế nào, để không lộ stack trace ra client?
34. Retry policy, hedging của gRPC (service config) có dùng không? Retry tự viết hay dùng Resilience4j?
35. Retry với gRPC call không idempotent thì có nguy hiểm gì? Làm sao thiết kế call an toàn để retry?
36. Circuit breaker, bulkhead, rate limit phía client gRPC có không?
37. Keepalive, connection idle, `max connection age`: bạn gặp vấn đề kết nối bị đóng ngầm chưa?
38. Message size limit mặc định (4MB) và cách chỉnh. Có bao giờ chạm tới không?
39. Compression trong gRPC có bật không?

## D. gRPC: vận hành, bảo mật, load balancing

40. 🔥 Load balancing với gRPC: vì sao L4 load balancer thông thường hoạt động kém? Giải pháp: client-side LB, L7 proxy (Envoy), service mesh?
41. Service discovery cho gRPC (DNS, Eureka, Kubernetes headless service) bạn dùng thế nào?
42. TLS/mTLS giữa các service có bật không? Xác thực service-to-service làm thế nào?
43. Authentication/authorization trong gRPC: token qua metadata, JWT, interceptor?
44. Health checking protocol của gRPC (`grpc.health.v1`) có dùng không?
45. gRPC reflection, `grpcurl`, BloomRPC/Postman: debug call thế nào?
46. Tracing qua gRPC: trace id lan truyền ra sao? Quan hệ với trace id trong Kafka header?
47. Metrics cho gRPC (latency, error rate theo method): bạn theo dõi gì?
48. Test gRPC: in-process server, mock stub, integration test, contract test thế nào?
49. gRPC-Web, gọi từ browser hoặc từ client bên ngoài: có cần không? Vì sao hệ thống thường dùng REST ở rìa và gRPC ở bên trong?
50. Một service đang deploy phiên bản mới, client cũ gọi: bạn đảm bảo tương thích thế nào?
51. Graceful shutdown của gRPC server: các call đang chạy dở xử lý ra sao?

## E. gRPC so với REST và Kafka

52. 🔥 So sánh gRPC, REST, Kafka cho giao tiếp giữa service: tiêu chí chọn?
53. Khi nào gRPC call đồng bộ gây coupling thời gian (temporal coupling)? Hệ quả khi service bị gọi chậm hoặc chết?
54. Chuỗi gọi gRPC A → B → C: độ khả dụng tổng giảm thế nào? Xử lý cascading failure ra sao?
55. Với notification (bất đồng bộ), gRPC call đồng bộ có phù hợp ở khâu nào? Khâu nào bắt buộc phải qua Kafka?
56. GraphQL, REST, gRPC, WebSocket: nếu phải mở API cho client bên ngoài thì chọn gì?
57. Thrift, Avro RPC, Dubbo: bạn có biết lựa chọn nào khác gRPC không?
58. Streaming gRPC và Kafka: khi cần đẩy dữ liệu liên tục thì khác nhau ra sao (độ bền, replay, backpressure)?

## F. Saga: khái niệm

59. 🔥 Saga pattern là gì? Giải thích bằng lời của bạn với một ví dụ.
60. 🔥 Vì sao không dùng distributed transaction / 2PC (two-phase commit) trong microservices?
   ↳ Follow-up: 2PC có vấn đề gì (blocking, coordinator là điểm chết, khóa lâu, không hỗ trợ bởi Kafka/NoSQL)? XA transaction hỗ trợ những gì?
61. 🔥 Saga đảm bảo tính chất ACID nào, không đảm bảo tính chất nào? Cụ thể là thiếu "I" (isolation) thì gây hậu quả gì?
62. Eventual consistency là gì? Saga có phải eventual consistency không?
63. Compensating transaction là gì? Khác rollback của DB thế nào?
64. Phân loại bước trong Saga: compensable, pivot, retriable. Bạn biết không?
65. 🔥 Choreography vs Orchestration: khác nhau thế nào, ưu nhược điểm của từng cái?
   ↳ Follow-up: Dự án của bạn thuộc loại nào? Vì sao chọn? Khi số bước tăng lên 10 thì loại nào dễ quản lý hơn?
66. Orchestrator là một service riêng hay nằm trong service khởi tạo? Nó lưu state ở đâu?
67. Saga state machine: bạn mô hình hóa trạng thái (STARTED, PENDING, COMPLETED, COMPENSATING, FAILED) thế nào?
68. Saga log / saga instance table: có lưu trong DB không? Gồm trường gì?
69. Semantic lock, commutative updates, pessimistic view, reread value: các biện pháp đối phó thiếu isolation trong Saga, bạn biết cái nào?
70. Saga có thể timeout không? Bạn xử lý một bước không bao giờ phản hồi ra sao?
71. Saga khác gì với workflow engine (Temporal, Camunda, Step Functions)? Khi nào nên dùng engine?
72. TCC (Try-Confirm-Cancel) là gì, khác Saga ra sao?
73. Saga có áp dụng cho workflow dài hàng giờ/ngày không? Khác gì giao dịch ngắn?

## G. "Basic Saga" và cài đặt trong dự án

74. 🔥 ⚠️ Hãy mô tả chính xác Saga trong dự án của bạn: bắt đầu từ sự kiện nào, có mấy bước, bước nào là compensable?
75. ⚠️ Cho một ví dụ cụ thể về một lần chạy thành công và một lần thất bại giữa chừng, từng bước hệ thống làm gì.
76. 🔥 ⚠️ Compensation cụ thể của bạn là gì? Ví dụ bước nào thất bại thì hủy bước nào, và "hủy" nghĩa là làm gì (cập nhật trạng thái, xóa, gửi event hủy)?
77. 🔥 Compensation cũng thất bại thì sao? Retry bao nhiêu lần, rồi làm gì tiếp?
78. Compensation có idempotent không? Chạy hai lần có hỏng dữ liệu không? Làm sao đảm bảo?
79. Một bước không thể bù trừ được (đã gửi email/SMS ra ngoài) thì thiết kế Saga thế nào (đặt bước đó ở cuối, pivot transaction)?
80. ⚠️ Gửi notification ra ngoài là hành động không thể thu hồi. Vậy Saga của bạn bảo vệ điều gì thật sự?
81. Thứ tự các bước trong Saga bạn sắp xếp theo nguyên tắc nào?
82. Saga của bạn là choreography hay orchestration? Nếu choreography thì làm sao biết toàn bộ luồng đang ở bước nào?
83. Nếu orchestration thì orchestrator bị sập giữa chừng, khi khởi động lại nó khôi phục thế nào?
84. 🔥 Bước 1 hoàn thành nhưng service ở bước 2 chết: sau đó điều gì xảy ra? Ai phát hiện và xử lý?
85. Tin nhắn trả lời (reply event) đến trễ, sau khi Saga đã timeout và compensate xong: xử lý thế nào?
86. Hai Saga cùng chạy trên cùng một dữ liệu (concurrent): có xung đột không, ngăn thế nào?
87. Làm sao biết Saga nào đang kẹt (không hoàn thành/không compensate)? Có job quét, dashboard, alert không?
88. Bạn có thể xem trạng thái Saga của một request cụ thể bằng cách nào? Có API hay chỉ đọc log?
89. Có test cho kịch bản Saga thất bại ở từng bước không? Test thế nào (chaos, mock, fault injection)?
90. Ngoài happy path, bạn đã thật sự chạy và chứng kiến compensation hoạt động chưa? Kể lại.
91. Saga của bạn xử lý partial failure, duplicate message, out-of-order message thế nào?
92. Các service tham gia Saga có phải biết nhau không (coupling)? Chúng giao tiếp bằng gRPC hay Kafka trong Saga?
93. ⚠️ Nếu Saga dựa trên gRPC call đồng bộ thì khác gì một chuỗi gọi API có try/catch? Điểm khác biệt thật sự là gì?
94. Nếu Saga dựa trên Kafka thì làm sao gói bước "cập nhật DB" và "phát event" thành nguyên tử? Quay lại dual write.
95. Một phần "consistency" của bạn có thể chỉ là cập nhật trạng thái trong cùng một DB. Vậy Saga có thật sự cần thiết không?
96. Bạn có thể mô tả phiên bản "không-basic" mà bạn sẽ làm nếu có thời gian: thêm gì (timeout, retry policy, persisted state, dashboard)?

## H. Outbox, idempotency và độ tin cậy trong Saga

97. 🔥 Transactional Outbox pattern là gì? Giải quyết vấn đề gì trong Saga?
   ↳ Follow-up: Bạn có dùng outbox trong dự án không? Nếu không, khoảng trống đó dẫn đến rủi ro gì? Relay đọc outbox bằng polling hay CDC (Debezium)?
98. Dual write: vì sao "ghi DB rồi gửi Kafka" nguy hiểm? Cho ví dụ failure.
99. Outbox relay đảm bảo gì về thứ tự và trùng lặp?
100. Inbox pattern / bảng `processed_messages` để dedupe: dùng khi nào?
101. 🔥 Mỗi bước tham gia Saga phải idempotent. Bạn đảm bảo thế nào?
102. Saga ID / correlation ID được sinh ở đâu và truyền qua các bước ra sao?
103. Request có timeout nhưng thật ra server đã xử lý xong: client retry sẽ thế nào? Có tạo trùng không?
104. Transaction boundary: mỗi bước Saga là một local transaction. Bạn đóng gói thế nào để "đổi trạng thái + ghi event" cùng commit?
105. Change Data Capture (Debezium) có phù hợp không? So sánh với polling outbox?
106. Event Sourcing và Saga: có liên quan gì?

## I. Tình huống, failure và đánh đổi

107. 🔥 Một notification đã được ghi vào DB nhưng event chưa bao giờ được phát ra Kafka (service sập đúng lúc đó). Hệ thống phát hiện và sửa thế nào?
108. Hệ thống ở trạng thái trung gian (đã trừ quota nhưng chưa gửi, hoặc ngược lại): người dùng và hệ thống thấy gì?
109. Reconciliation job là gì, bạn có cần nó không? Nó đối chiếu cái gì với cái gì?
110. Một bước của Saga bị chậm 10 phút: nên chờ, hủy, hay gửi cảnh báo? Dựa vào gì quyết định?
111. Bạn đảm bảo thế nào để compensation không chạy khi bước kia thật ra đã thành công (timeout giả)?
112. Khi nào bạn không dùng Saga mà chỉ cần một local transaction (gộp service) hoặc chấp nhận inconsistent tạm thời?
113. Nếu có yêu cầu "tuyệt đối không được gửi trùng", Saga và Kafka của bạn đủ không? Thêm gì nữa?
114. Rủi ro của Saga: bước compensate thất bại, dữ liệu lệch lâu dài, khó debug, thiếu isolation. Bạn từng gặp cái nào?
115. Nếu phải gộp hai service lại để tránh Saga, bạn cân nhắc những gì?
116. Saga vs "một transaction lớn trong monolith": vì sao microservices phải trả cái giá này?

## J. Observability, test, vận hành

117. Theo dõi một Saga qua nhiều service: log, trace id, bảng trạng thái nào?
118. Metrics cho Saga (số Saga đang chạy, tỉ lệ compensate, thời gian trung bình, số bị kẹt): bạn có không?
119. Alert nào cho Saga kẹt hoặc compensation thất bại?
120. Deploy phiên bản mới đổi logic Saga khi vẫn còn Saga đang chạy dở (in-flight): xử lý thế nào?
121. Versioning của Saga và event trong in-flight saga?
122. Test integration của Saga: dùng Testcontainers (Kafka, PostgreSQL) hay mock?
123. Contract test giữa các service gRPC trong Saga bạn có không?

## K. Phản tư

124. ⚠️ Nếu interviewer nói "đây chỉ là chuỗi gọi API với vài status, đâu phải Saga", bạn đáp thế nào?
125. Phần nào trong dòng CV này bạn tự tin nhất, phần nào bạn thấy chưa chắc nhất?
126. Nếu làm lại, bạn có chọn gRPC và Saga cho dự án này không? Hay chọn đơn giản hơn?
127. Điều gì bạn học được về distributed consistency mà trước đó chưa hiểu?
128. Bạn đã áp dụng được Saga/outbox/idempotency vào công việc chính chưa? Ở đâu?
