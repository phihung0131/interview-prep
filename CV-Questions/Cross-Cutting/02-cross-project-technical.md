# Kỹ thuật xuyên dự án (Cross-Project Technical)

Phạm vi: câu hỏi kỹ thuật nối WMS, Notification Hub, Kestrel và AI Platform, cộng khối system design ngắn dựa trên CV. Chỉ liệt kê câu hỏi, không có đáp án.

## A. Persistence và ORM: MyBatis vs JPA

1. 🔥 Vì sao WMS dùng MyBatis? So sánh với JPA/Hibernate theo kinh nghiệm thực tế của em.
   ↳ Follow-up: Khi nào em chọn JPA, khi nào MyBatis? Với Notification Hub và Kestrel, em dùng gì và vì sao khác nhau?
2. Vấn đề N+1 xuất hiện thế nào ở JPA và ở MyBatis? Em từng gặp ở đâu?
3. MyBatis cho kiểm soát SQL tốt, nhưng cái giá về bảo trì (SQL rải rác, mapping thủ công, thiếu type safety) em xử lý thế nào?
4. Quản lý migration schema giữa ba dự án (Flyway/Liquibase/script tay): em làm sao khi cần đổi schema không downtime?
5. Em dùng pgvector trong Kestrel: index nào (IVFFlat/HNSW), khác gì với index B-tree trong WMS? Query vector kết hợp filter thường ra sao?

## B. Transaction và consistency: monolith vs distributed

6. 🔥 Trong WMS (monolith, một DB) em đảm bảo consistency bằng ACID transaction. Qua Notification Hub (Kafka, nhiều service), cái gì mất đi và em bù lại bằng gì?
   ↳ Follow-up: "Saga cơ bản" của em có compensation thật không? Nếu compensation cũng lỗi thì sao? Làm sao biết saga đang kẹt ở bước nào?
7. Trong Spring, em từng gặp lỗi `@Transactional` không rollback như mong đợi (self-invocation, checked exception, propagation) không? Ví dụ cụ thể?
8. Isolation level mặc định của PostgreSQL là gì và em có đổi không? Kể một tình huống phantom/non-repeatable read thực tế.
9. Dual write problem (ghi DB rồi publish Kafka): em xử lý thế nào ở Notification Hub? Outbox pattern có áp dụng không, và nếu không thì rủi ro là gì?
10. Eventual consistency khác strong consistency thế nào ở góc nhìn người dùng/nghiệp vụ? Với WMS, phần nào bắt buộc strong, phần nào chấp nhận eventual?
11. Làm sao phát hiện và đối soát (reconciliation) khi dữ liệu giữa hai hệ thống lệch nhau? Em đã làm ở đâu?

## C. Idempotency

12. 🔥 Idempotency ở Notification Hub được làm bằng PostgreSQL upsert. Trình bày cơ chế, key được tạo từ đâu, và TTL/dọn dẹp ra sao.
    ↳ Follow-up: Hai request cùng key đến đồng thời thì sao? Nếu request đầu thất bại giữa chừng, request thứ hai xử lý thế nào? Vì sao không dùng Redis cho việc này?
13. Idempotency ở WMS (goods receiving, returns, shipping) có tương đương không? Client gọi hai lần cùng một receiving thì chuyện gì xảy ra?
14. Exactly-once có thật không? Kafka exactly-once semantics làm được đến đâu và giới hạn ở đâu?
15. Batch job chạy lại sau khi sập giữa chừng: làm sao chắc chắn không xử lý trùng?
16. Idempotency ở lời gọi LLM (Kestrel) có ý nghĩa gì khi output không deterministic? Retry LLM có gây tốn tiền hoặc kết quả khác nhau thế nào?

## D. Redis: lock, cache, rate limit

17. 🔥 Em dùng Redis ở WMS và Notification Hub: mục đích khác nhau thế nào (cache, rate limit, lock)?
    ↳ Follow-up: Cache invalidation xử lý ra sao? Có gặp cache stampede, cache penetration, hay dữ liệu cũ gây hậu quả nghiệp vụ không?
18. Redis distributed lock: dùng SETNX/Redlock thế nào? Khi lock hết hạn trong lúc job vẫn chạy thì sao? Fencing token là gì?
19. Khi nào dùng lock DB (SELECT FOR UPDATE, advisory lock), khi nào dùng lock Redis, khi nào dùng optimistic lock với version?
20. Rate limit trong Notification Hub: thuật toán gì (token bucket, sliding window)? Triển khai bằng Lua hay lệnh rời? Cách đảm bảo atomic?
21. Redis sập thì từng hệ thống của em ứng xử thế nào (fail-open hay fail-closed)? Vì sao?
22. TTL, eviction policy, persistence (RDB/AOF) em chọn gì và vì sao?

## E. Retry, DLQ và batch job

23. 🔥 So sánh cơ chế retry/DLQ của Notification Hub với cơ chế retry của batch job trong WMS: giống và khác ở đâu?
    ↳ Follow-up: Retry với exponential backoff và jitter dùng khi nào? Poison message xử lý ra sao? Ai xử lý message nằm trong DLQ và theo quy trình nào?
24. Retry gây retry storm khi downstream sập: em phòng bằng circuit breaker, bulkhead hay backoff? Em có dùng Resilience4j không?
25. Ordering trong Kafka: partition key chọn thế nào? Retry có làm đảo thứ tự không?
26. Consumer lag tăng thì em làm gì? Rebalance gây gián đoạn xử lý thế nào?
27. Backpressure: producer nhanh hơn consumer thì xử lý ra sao ở Kafka và ở batch?
28. Poison pill, schema evolution của message: quản lý versioning event thế nào?

## F. gRPC, REST và giao tiếp giữa service

29. gRPC trong Notification Hub dùng ở chỗ nào và vì sao không chỉ dùng REST? Trade-off về debug, tooling, backward compatibility?
30. Timeout, deadline propagation, và retry cho gRPC call đặt thế nào?

## G. LLM structured output so với unit test

31. 🔥 Schema-validated output + retry của Kestrel khác gì với việc viết unit test cho code truyền thống? Có điểm chung gì về triết lý "kiểm chứng đầu ra"?
    ↳ Follow-up: Retry bao nhiêu lần, retry kèm thông báo lỗi validation hay retry mù? Khi vẫn fail thì fallback ra sao? Chi phí token của retry được kiểm soát thế nào?
32. Test cho code gọi LLM: mock provider, golden test, hay evaluation set? Làm sao test không flaky?
33. Coverage gate 90% có thể áp dụng cho phần code LLM không? Vì sao nên hay không nên?
34. Property-based test hoặc contract test có dùng được cho output LLM không?

## H. Testing strategy và CI/CD

35. 🔥 Chiến lược test tổng thể của em qua các dự án: kim tự tháp test, ranh giới unit/integration, dùng Testcontainers hay H2?
    ↳ Follow-up: H2 vs PostgreSQL khác nhau gây lỗi gì? Từng có test pass mà production lỗi chưa? Làm sao test concurrency ổn định?
36. GitHub Actions CI của Kestrel gồm những bước nào? Có cache dependency, chạy song song, quality gate (lint, SAST, coverage) không?
37. Quy trình deploy của WMS (nhiều kho) so với Kestrel (Docker Compose): khác nhau thế nào về rollback, blue-green, canary, migration DB?
38. Docker Compose đủ cho production không? Bước tiếp theo là Kubernetes hay managed service, và khi nào cần chuyển?
39. Quản lý secrets và cấu hình theo môi trường (đặc biệt khóa API của bốn LLM provider): em làm thế nào?

## I. Hiệu năng, bảo mật, observability

40. 🔥 Quy trình em chẩn đoán một API chậm, dù ở WMS hay ở Kestrel: bắt đầu từ đâu, công cụ nào, theo thứ tự nào?
41. Index tuning: nguyên tắc chọn cột và thứ tự cột, composite index, covering index, và lúc nào index không được dùng?
42. Bảo mật tổng thể: authN/authZ ở Kestrel (JWT/session, OAuth?), lưu mật khẩu, phân quyền theo tenant, chống IDOR, SQL injection, rate limit?
43. Multi-tenant data isolation trong Kestrel: cách đảm bảo user A không thấy CV/dữ liệu của user B? Có test cho việc đó không?
44. Dữ liệu cá nhân trong CV và crawl dữ liệu tuyển dụng: GDPR/PDPA, lưu trữ, xóa dữ liệu, mã hóa, và việc gửi nội dung CV tới LLM provider bên thứ ba?
45. Observability: logs, metrics, traces cho từng dự án. Correlation ID xuyên qua Kafka và gRPC được truyền thế nào?
46. Em từng dùng Datadog (hoặc tương đương) để điều tra gì? Alert nào là hữu ích, alert nào là noise?

## J. Scale và thiết kế hệ thống từ kinh nghiệm CV

47. 🔥 Nếu WMS tăng từ 15 lên 150 kho, những phần nào của kiến trúc hiện tại hỏng đầu tiên? Em sẽ sửa gì trước?
48. Notification Hub scale từ ngàn lên chục triệu thông báo/ngày: bottleneck ở đâu (Kafka partition, DB idempotency, Redis, provider)?
49. Kestrel scale lên 100k user: crawl, embedding, LLM cost, và DB thay đổi thế nào?
50. Khi nào nên tách monolith thành microservices? WMS nên tách hay không, và theo ranh giới nào?
51. Một thiết kế mà em thấy over-engineered trong dự án cá nhân của mình (Kafka + gRPC cho bài toán nhỏ)? Biện minh hay thừa nhận?

## K. Câu hỏi system design ngắn dựa trên CV

52. 🔥 Thiết kế hệ thống quản lý tồn kho cho nhiều kho: mô hình dữ liệu (SKU, location, lot, reservation), đảm bảo không bán quá tồn, đồng bộ giữa các kho.
    ↳ Follow-up: Inventory ledger (append-only) hay số dư trực tiếp? Xử lý hai đơn tranh nhau tồn cuối cùng thế nào? Cycle count/điều chỉnh tồn xử lý thế nào? Tồn khả dụng vs tồn vật lý vs tồn đã giữ chỗ?
53. 🔥 Thiết kế hệ thống gửi thông báo cho vài triệu user (push, email, SMS): kiến trúc, queue, template, ưu tiên, rate limit theo provider, retry, dedupe, opt-out.
    ↳ Follow-up: Làm sao gửi campaign cho 5 triệu user trong 10 phút? Làm sao tránh gửi trùng? Theo dõi trạng thái delivery và bounce thế nào? Multi-channel fallback?
54. 🔥 Thiết kế nền tảng matching job (như Kestrel mở rộng): crawl, chuẩn hóa dữ liệu, dedupe job, embedding, ranking, cập nhật tin hết hạn, cá nhân hóa.
    ↳ Follow-up: Kết hợp keyword search và vector search thế nào? Đánh giá chất lượng matching ra sao? Chi phí embedding và cách cập nhật khi thay model?
55. Thiết kế hệ thống nhận hàng (goods receiving) chịu được scan đồng thời từ nhiều thiết bị cầm tay, đảm bảo không nhận trùng.
56. Thiết kế job scheduler phân tán chạy batch trên nhiều instance, mỗi job chạy đúng một lần, có retry và quan sát được.
57. Thiết kế rate limiter dùng chung cho nhiều service, chính xác ở mức nào, chịu lỗi Redis ra sao.
58. Thiết kế gateway gọi nhiều LLM provider: routing, fallback, cache, giới hạn chi phí theo user, ghi log và audit.
59. Thiết kế pipeline CI/CD AI-driven cho toàn công ty (mở rộng từ Project 2): cô lập quyền, audit, chi phí, quy tắc khi nào AI không được tự merge.
