## A. Tổng quan dự án và bối cảnh

1. Hệ thống này làm gì, khách hàng là ai, người dùng cuối là ai?
2. Vì sao có nhiều kho (multi-warehouse), mỗi kho khác nhau chỗ nào về nghiệp vụ?
3. Vì sao mỗi kho deploy một app riêng thay vì một hệ thống chung? Ưu và nhược điểm?
4. Có bao nhiêu kho, bao nhiêu app, bao nhiêu database? Dùng chung hay tách?
5. Luồng nghiệp vụ từ inbound receiving đến shipping, bạn vẽ lại được không?
6. Trong luồng đó, bạn phụ trách phần nào, phần nào người khác làm?
7. Hệ thống tích hợp với những hệ thống nào bên ngoài (ERP, đối tác vận chuyển, hệ thống kho cũ)?
8. Giao tiếp giữa các hệ thống bằng gì: REST, batch, file, queue? Vì sao?
9. Dự án chạy bao lâu rồi, giai đoạn hiện tại là build mới hay bảo trì?
10. Quy mô: bao nhiêu request/phút, bao nhiêu đơn/ngày, dung lượng DB, số bản ghi bảng lớn nhất?
11. Peak xảy ra lúc nào (sale, cuối tháng), lúc đó hệ thống ra sao?
12. Team có mấy người, vai trò từng người, bạn làm việc với ai nhiều nhất?

## B. Kiến trúc và thiết kế

13. Hệ thống là monolith hay tách module? Ranh giới module định nghĩa thế nào?
14. Cấu trúc một API điển hình: controller, service, mapper, bảng nào?
15. Vì sao chọn MyBatis thay vì JPA/Hibernate? Khi nào MyBatis gây khó?
16. Bạn từng dùng cả Hibernate (Apollogix) và MyBatis, so sánh thực tế hai bên?
17. Quản lý schema DB thế nào (Flyway, Liquibase, script tay)? Ai được đổi schema?
18. Function Design (FD) có những gì? Ai viết, ai duyệt?
19. 🔥 FD đã có sẵn logic và SQL, vậy đóng góp kỹ thuật riêng của bạn là gì?
20. Bạn từng đọc FD và thấy sai hoặc thiếu chưa? Phản hồi thế nào, kết quả ra sao?
21. Có chuẩn code, tầng kiến trúc, convention nào? Ai đặt ra, bạn bảo vệ nó ra sao?
22. Xử lý lỗi và exception thống nhất thế nào? Format lỗi trả về?
23. Log theo chuẩn nào? Có correlation ID để lần theo request qua nhiều hệ thống không?
24. Cấu hình khác nhau giữa các kho quản lý thế nào?
25. Bạn thấy điểm yếu lớn nhất của kiến trúc hiện tại là gì? Nếu làm lại bạn đổi gì?

## C. API, batch job và xử lý dữ liệu

26. 🔥 "Distributed batch jobs": phân tán ở đây là gì? Chạy trên mấy instance, chia việc thế nào?
27. Batch chạy bằng gì (Spring Batch, scheduler, cron)? Lịch chạy ra sao?
28. Hai instance cùng chạy một job thì sao? Có lock phân tán không, lock bằng gì?
29. Job chạy giữa chừng bị sập thì chạy lại thế nào? Có chạy lại được an toàn không?
30. Batch xử lý bao nhiêu bản ghi một lần? Chia chunk thế nào, vì sao chọn cỡ đó?
31. Job chạy lâu có ảnh hưởng API online không? Xử lý ra sao?
32. Làm sao biết job thất bại? Ai nhận alert, quy trình xử lý?
33. API có phân trang không, kiểu nào (offset/cursor)? Với bảng lớn có vấn đề gì?
34. API nào chạy lâu nhất, nặng nhất? Bạn có đo không?
35. API ghi dữ liệu có idempotent không? Client gọi hai lần thì sao?
36. Có dùng async hay thread pool trong code không? Cấu hình thế nào?
37. Timeout khi gọi hệ thống ngoài đặt bao nhiêu, retry thế nào?
38. Khi hệ thống ngoài chết thì hệ thống của bạn xử lý ra sao (fallback, circuit breaker, queue)?
39. Dữ liệu import/export lớn (file, bulk) xử lý thế nào, tránh tràn bộ nhớ ra sao?

## D. Concurrency và race condition 🔥

40. 🔥 Kể chi tiết một race condition bạn xử lý: hai hệ thống nào, lệnh gì, xung đột ở đâu?
41. Triệu chứng thấy được là gì (trùng bản ghi, sai tồn kho, lệnh chạy hai lần)?
42. Phát hiện bằng cách nào: khách báo, alert, hay tự thấy? Mất bao lâu để tìm ra?
43. Tái hiện bug ở môi trường nào, bằng cách nào? Nếu không tái hiện được thì chứng minh root cause ra sao?
44. Root cause chính xác ở mức kỹ thuật: check-then-act, read-modify-write, thiếu unique constraint, isolation level?
45. Bạn đã cân nhắc những phương án nào (pessimistic lock, optimistic lock, unique constraint, distributed lock, queue tuần tự)? Vì sao chọn cái đang dùng?
46. Fix đó đổi lại mất gì (throughput, độ phức tạp, deadlock)?
47. 🔥 "Zero duplicate processing": đo bằng gì để khẳng định? Đã chạy bao lâu, qua bao nhiêu giao dịch?
48. Còn kịch bản nào fix này vẫn hở không? Hai instance, retry, sập giữa chừng?
49. "Reliable command execution" nghĩa là gì? Lệnh được bảo đảm thứ tự không? Bảo đảm đúng-một-lần hay ít-nhất-một-lần?
50. Nếu command đến sai thứ tự (hủy đến trước tạo) thì hệ thống xử lý sao?
51. Bạn dùng `synchronized`, lock DB hay lock phân tán? `@Transactional` ảnh hưởng gì đến lock đó?
52. Đã bao giờ gặp deadlock chưa? Phát hiện và xử lý thế nào?
53. Bạn có viết test cho concurrency không? Test thế nào để ổn định, không flaky?
54. Sau fix có biện pháp phòng tái diễn cho cả team không (checklist review, rule, utility chung)?

## E. Transaction và tính nhất quán dữ liệu 🔥

55. 🔥 "Edge-case transactional issue": cụ thể là edge case gì? Kể một ví dụ.
56. Rollback không như mong đợi: do self-invocation, checked exception, propagation, hay lỗi khác?
57. Ranh giới transaction đặt ở đâu (controller, service)? Có transaction bao quanh cả call ra hệ thống ngoài không? Có vấn đề gì?
58. Isolation level đang dùng là gì? Đã gặp hiện tượng nào (non-repeatable read, phantom)?
59. 🔥 "Data-mapping issue": mapping giữa hai hệ thống sai ở đâu? Kiểu dữ liệu, null, đơn vị, múi giờ, làm tròn?
60. "Data discrepancies across distributed modules": discrepancy cụ thể là gì? Làm sao phát hiện lệch dữ liệu?
61. Có job đối soát (reconciliation) không? Nếu hai hệ thống lệch nhau thì ai sửa, sửa thế nào?
62. Khi ghi DB và gọi hệ thống ngoài trong cùng một luồng, nếu một bên lỗi thì xử lý sao?
63. Bạn có biết outbox pattern không? Dự án có cần không, vì sao?
64. Dữ liệu đã sai ở production thì sửa thế nào (script, migration)? Ai duyệt?

## F. Hiệu năng và tối ưu 🔥

65. 🔥 Kể một lần tối ưu hiệu năng cụ thể: API/query nào chậm, chậm bao nhiêu?
66. Bạn phát hiện ra bằng gì (Datadog, slow query log, APM trace)?
67. Bạn đọc execution plan không? Plan lúc đó cho thấy gì (seq scan, nested loop, sort)?
68. 🔥 "Query index tuning": thêm index nào, cột nào, thứ tự cột vì sao? Index đó tốn gì (ghi chậm, dung lượng)?
69. Có trường hợp thêm index mà query vẫn không dùng không? Vì sao?
70. 🔥 "In-memory processing patterns": cụ thể là gì? Load dữ liệu vào bộ nhớ thay cho query lặp? Giới hạn bộ nhớ ra sao?
71. 🔥 "Efficient caching": cache ở đâu (local, Redis)? Cache cái gì, TTL bao lâu?
72. Cache invalidation xử lý thế nào? Dữ liệu cũ gây hậu quả nghiệp vụ gì?
73. Nhiều instance cùng cache local thì dữ liệu lệch nhau xử lý sao?
74. Cache stampede (nhiều request cùng miss) có gặp không?
75. Latency giảm bao nhiêu, đo trước và sau thế nào? Có số liệu p95/p99 không?
76. N+1 query có gặp không? Với MyBatis xử lý ra sao?
77. Connection pool cấu hình bao nhiêu, vì sao? Có lần nào cạn pool chưa?
78. Có tối ưu batch insert/update không? Cỡ batch bao nhiêu?
79. Bạn có tối ưu mà kết quả không như kỳ vọng không? Rút ra gì?

## G. Debug và vận hành 🔥

80. 🔥 Kể quy trình điều tra một production defect từ lúc nhận ticket đến lúc fix.
81. Bạn dùng Datadog thế nào: metric nào, trace nào, log query nào?
82. Bạn không có quyền production, vậy lấy dữ liệu điều tra bằng cách nào?
83. Khi không có quyền vào DB production, làm sao chứng minh giả thuyết?
84. Có lần nào chẩn đoán sai root cause không? Sai ở đâu, bài học gì?
85. Phân biệt triệu chứng và root cause thế nào? Cho một ví dụ trong dự án.
86. Có alert, dashboard nào bạn đề xuất hoặc cải thiện không?
87. Có incident lớn nào chưa? Ảnh hưởng thế nào, post-mortem ra sao, bạn rút được gì?
88. Hotfix quy trình thế nào? Ai duyệt, rollback ra sao?
89. Lỗi mất bao lâu từ lúc phát hiện đến lúc fix xong (MTTR)? Làm sao rút ngắn?
90. Log có chứa dữ liệu nhạy cảm không, xử lý thế nào?

## H. Test và chất lượng

91. 🔥 "Trên 90% coverage": đo bằng công cụ gì, coverage dòng hay nhánh?
92. Coverage cao có nghĩa là test tốt không? Test nào của bạn từng bắt được bug thật?
93. Phân biệt unit test và integration test trong dự án? Integration test chạy với DB thật hay Testcontainers/H2?
94. H2 và PostgreSQL khác nhau thế nào khi test? Từng gặp test qua nhưng production lỗi chưa?
95. Mock cái gì, không mock cái gì? Vì sao?
96. Thiết kế test case cho logic nghiệp vụ phức tạp theo cách nào?
97. Test chạy bao lâu, có flaky không, xử lý ra sao?
98. Viết test sau khi code hay trước? Quy trình CI chạy test thế nào?
99. Có test hiệu năng hoặc test tải không?
100. Có lần nào test pass mà vẫn lỗi ở UAT/production? Vì sao?

## I. Sub Lead, quy trình và con người 🔥

101. 🔥 Sub Lead khác lead chỗ nào? Bạn chịu trách nhiệm cụ thể điều gì, quyền quyết định tới đâu?
102. Bạn lên Sub Lead sau khoảng 1 năm, vì sao được chọn? Có gì thay đổi trong công việc?
103. Phân việc cho 7 người dựa trên tiêu chí gì? Kể một lần phân việc khó.
104. Ước lượng task và quản lý sprint thế nào? Có lần trễ deadline không, xử lý ra sao?
105. 🔥 Review code: bạn thường bắt lỗi gì nhất? Cho 3 ví dụ cụ thể.
106. Có checklist review không? Ai viết?
107. Member không đồng ý với review của bạn thì sao?
108. Member yếu hoặc code ẩu liên tục, bạn xử lý thế nào?
109. Mentor ai, bằng cách nào, có kết quả gì đo được?
110. Bất đồng với BA/PM/khách hàng về FD hoặc deadline, bạn xử lý ra sao?
111. Bạn xử lý áp lực release gấp thế nào? Có lần nào phải đánh đổi chất lượng không?
112. Khi member kẹt mà bạn cũng không giải quyết được thì làm gì?
113. Bạn đo chất lượng và hiệu suất của team bằng gì?
114. Việc gì bạn làm ở vai Sub Lead mà team khác nhờ đó mà tốt lên?

## J. Release và Git 🔥

115. 🔥 Chiến lược branching bạn quản lý: nhánh nào, merge theo luồng nào (GitFlow, trunk)?
116. Phân biệt major release và minor release trong dự án. Khác nhau về quy trình thế nào?
117. "Deployment conflicts across fulfillment centers": conflict ở đây là gì, trước đây xảy ra thế nào?
118. Bạn xử lý thế nào khi kho A cần tính năng mới nhưng kho B chưa sẵn sàng?
119. Feature flag có dùng không? Cấu hình theo kho thế nào?
120. Hotfix cho một kho thì đưa về các nhánh khác ra sao (cherry-pick, merge)?
121. Có lần merge sai, mất code hoặc đẩy nhầm lên chưa? Xử lý thế nào?
122. Rollback release thế nào, DB migration có rollback được không?
123. CI/CD gồm những bước nào? Bạn không đụng hạ tầng thì phần nào là của bạn?
124. Release trong lúc kho đang hoạt động thì xử lý gián đoạn ra sao?
125. Bạn đã tự động hóa hay cải thiện được gì trong quy trình release?

## K. AI workflow harness 🔥

126. 🔥 "AI-driven workflow harness" là gì cụ thể? Nó chạy thế nào từ đầu đến cuối?
127. FD-to-code boilerplate: AI nhận đầu vào gì, sinh ra gì? Chất lượng đầu ra thế nào?
128. Tích hợp Jira, Confluence, GitHub API bằng cách nào (token, quyền, webhook)?
129. Làm sao kiểm soát AI sinh code sai hoặc bịa? Có bước review người không?
130. Bảo mật: code và tài liệu nội bộ gửi lên Claude thế nào, công ty có duyệt chưa?
131. "Accelerating PR review turnaround": nhanh hơn bao nhiêu, đo bằng gì?
132. Có bao nhiêu người trong team dùng? Họ phản hồi thế nào?
133. Chi phí và giới hạn (token, rate limit) xử lý ra sao?
134. Prompt/context quản lý thế nào để ổn định? Xử lý FD dài ra sao?
135. Điều gì AI làm tệ, bạn đã cải thiện như thế nào?
136. Rủi ro lớn nhất của việc dùng AI sinh code là gì, bạn giảm bằng cách nào?
137. Đây là việc bạn tự đề xuất hay được giao? Thuyết phục team thế nào?

## L. Câu hỏi "bóc mẽ" kiểm tra trung thực

138. Trong CV, dòng nào bạn tự làm 100%, dòng nào làm chung?
139. Bạn nói "Architected" cho AI harness, vậy bạn tự thiết kế hay làm theo mẫu có sẵn?
140. Chọn dòng bạn tự tin nhất trong CV, mình sẽ hỏi sâu 10 phút. Chọn đi.
141. Dòng nào trong CV bạn thấy yếu nhất, vì sao vẫn ghi?
142. Nếu mình gọi hỏi đồng nghiệp hoặc leader của bạn, họ sẽ xác nhận điều gì?
143. Việc gì bạn từng làm sai ở dự án này và rút kinh nghiệm?
144. Điều gì ở công việc hiện tại bạn chưa được làm (thiết kế, DB, hạ tầng), bạn bù bằng cách nào?

## M. Động lực và định hướng

145. Dự án ổn định, vì sao muốn rời đi? Điều gì bạn muốn học mà chỗ này không có?
146. Sau 1.5 năm, bạn lớn lên nhiều nhất ở điểm nào?
147. Bạn muốn đi hướng nào tiếp: lên senior kỹ thuật, kiến trúc, hay quản lý?
148. Trong 2 năm tới bạn muốn tự làm được gì mà hiện tại chưa làm được?
149. Nếu vào công ty mới, 3 tháng đầu bạn sẽ làm gì?
