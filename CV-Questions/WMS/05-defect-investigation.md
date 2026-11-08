> Investigated and fixed defects reported by testers and found in staging and production, tracing each issue from application logs to its root cause; typical causes were unhandled data cases (null pointers) and slow queries.

## A. Xác minh phạm vi và claim trong CV

1. 🔥 ⚠️ Bạn đã xử lý khoảng bao nhiêu defect từ khi vào dự án? Chia theo nguồn: tester, staging, production?
   ↳ Follow-up: Tỷ lệ nguyên nhân: null pointer, query chậm, race condition, mapping, khác? Con số này bạn lấy từ đâu?
2. ⚠️ "Each issue ... to its root cause": có defect nào bạn không tìm ra root cause không? Bạn xử lý thế nào, ghi nhận ra sao?
3. Bạn xử lý defect của chính code mình viết hay của cả team? Defect nằm ngoài module của bạn thì sao?
4. Là Sub Lead, bạn phân defect cho ai? Bạn trực tiếp fix bao nhiêu phần trăm?
5. Ai là người nhận defect đầu tiên và triage (tester, BA, lead)? Bạn nhận qua Jira hay kênh khác?
6. ⚠️ Bạn có quyền truy cập log và DB production ở mức nào? Nếu không có quyền trực tiếp, bạn lấy dữ liệu bằng cách nào?
7. Một defect production điển hình mất bao lâu từ lúc nhận đến lúc fix xong? Con nhanh nhất, con lâu nhất?
8. Defect production trong dự án xảy ra bao nhiêu lần một tháng? Có xu hướng tăng hay giảm?
9. Bạn "tìm thấy" defect ở staging là qua kiểm thử của bạn hay qua tester/ khách hàng UAT?

## B. Nguồn defect, triage và độ ưu tiên

10. 🔥 Quy trình tiếp nhận một defect từ tester: ticket có những trường gì, bạn cần thêm thông tin gì để bắt đầu?
11. Bug report kém (thiếu bước tái hiện, thiếu dữ liệu) thì bạn xử lý thế nào? Có template bạn đề xuất không?
12. Phân loại mức độ nghiêm trọng (severity) và độ ưu tiên (priority) thế nào? Bạn có tham gia quyết định không?
13. Khi nhiều defect đến cùng lúc, bạn ưu tiên thế nào? Ví dụ một defect production nhỏ và một defect staging chặn release.
14. Phân biệt defect thật, lỗi cấu hình/ dữ liệu, lỗi thao tác người dùng, thay đổi yêu cầu. Bạn từng gặp "defect" mà hóa ra không phải bug chưa?
15. Có defect nào do FD sai hoặc thiếu chứ không phải lỗi code không? Bạn xử lý thế nào (sửa code, sửa FD, báo khách hàng)?
16. Defect ở staging nhưng không tái hiện được ở dev: nguyên nhân có thể và cách bạn tiếp cận?
17. Defect chỉ xảy ra với một kho (cấu hình hoặc dữ liệu khác nhau). Bạn xác định thế nào là do dữ liệu/ cấu hình kho đó?
18. Tester báo "API chậm". Bạn kiểm tra thế nào để phân biệt chậm thật với chậm vì môi trường test?
19. Defect lặp lại (regression) – bạn xử lý thế nào để không lặp lại lần nữa?
20. Bạn phối hợp với tester thế nào để họ cung cấp dữ liệu tái hiện? Có họp triage hằng ngày không?

## C. Log, quan sát và truy vết

21. 🔥 Bạn bắt đầu từ log như thế nào? Quy trình: tìm request nào, theo khoá nào (order id, request id, mã kiện hàng), trong khoảng thời gian nào?
   ↳ Follow-up: Log nằm ở đâu (Datadog, file, ELK)? Bạn truy vấn bằng cú pháp gì? Giữ log bao lâu?
22. Có correlation ID / trace ID xuyên suốt request không? Nếu có, nó được sinh và truyền thế nào (MDC, header)? Nếu không, bạn nối các log bằng cách nào?
23. Log theo level (DEBUG/INFO/WARN/ERROR) ở production đặt ở mức nào? Khi thiếu log để điều tra bạn làm gì (thêm log rồi release)?
24. Log tốt cần gì: có ngữ cảnh (khoá nghiệp vụ), không lộ dữ liệu nhạy cảm, không quá nhiều. Bạn từng cải thiện log của hệ thống chưa? Ví dụ cụ thể.
25. Stack trace: bạn đọc từ đâu? Phân biệt "caused by" gốc và các lớp bọc ngoài. Khi stack trace bị nuốt (catch rồi chỉ log message) thì phát hiện thế nào?
26. Có lần bạn thấy `catch (Exception e)` nuốt lỗi gây khó điều tra không? Hậu quả và cách sửa?
27. Bạn dùng Datadog thế nào cụ thể: log explorer, APM trace, dashboard, monitor? Facet nào hay lọc?
28. Từ log lỗi, bạn xác định "bản ghi nào gây lỗi" bằng cách nào khi log không in dữ liệu đầu vào?
29. Khi log ở hai hệ thống (WMS và hệ thống đối tác/ERP) lệch giờ nhau, bạn đối chiếu timeline thế nào?
30. Thông tin nhạy cảm trong log (dữ liệu khách hàng, token): quy định gì và bạn xử lý khi cần log đầu vào?
31. Log bị mất hoặc đã quá hạn lưu khi bạn điều tra defect cũ. Làm gì?
32. Bạn có đề xuất/ cải thiện dashboard, alert nào sau khi xử lý defect chưa? Alert đó có lọc được nhiễu không?
33. Distributed tracing (OpenTelemetry/Datadog APM): dự án có dùng không? Nó giúp tìm chỗ chậm như thế nào?
34. Metric nào bạn xem khi nghi ngờ vấn đề ở tầng hạ tầng (CPU, heap, GC, connection pool, thread count)?

## D. Tái hiện (reproduce) và chứng minh giả thuyết

35. 🔥 Bạn tái hiện defect production ở môi trường nào? Dữ liệu lấy từ đâu và làm sao tránh dữ liệu nhạy cảm?
36. Khi không tái hiện được, làm sao chứng minh root cause? Bạn có dùng unit test để tái hiện không? Ví dụ.
37. Bạn viết test tái hiện lỗi trước khi sửa (red → green) chứ? Có thể kể lại một lần?
38. Bạn dùng debug từ xa (remote debug), breakpoint, hay chỉ log? Với môi trường staging thì làm thế nào?
39. Lỗi chỉ xảy ra ngẫu nhiên (flaky ở production): phương pháp thu hẹp ra sao?
40. Lỗi chỉ xảy ra ở khối lượng lớn hoặc khi có nhiều request đồng thời. Bạn mô phỏng thế nào?
41. Bạn có script/ công cụ riêng để gọi API tái hiện (Postman, curl, script SQL) không?
42. Lấy dữ liệu từ production để dựng ca test: cần ai duyệt, che dữ liệu nhạy cảm bằng cách nào?
43. Giả thuyết đầu tiên của bạn đúng bao nhiêu phần trăm số lần? Có lần nào chẩn đoán sai root cause không? Sai ở đâu, bài học?
44. Bạn phân biệt "triệu chứng" và "nguyên nhân gốc" thế nào? Phương pháp: 5 Whys, timeline, binary search theo commit (`git bisect`)? Bạn dùng cái nào?
45. Khi nhiều nguyên nhân cùng góp phần (ví dụ query chậm + connection pool nhỏ + batch cùng lúc), bạn xác định cái nào là gốc?
46. `git blame` / `git log` / `git bisect` để tìm commit gây lỗi: bạn từng dùng chưa? Một lần cụ thể?

## E. Null pointer và dữ liệu chưa được xử lý

47. 🔥 Kể 3 defect `NullPointerException` điển hình bạn đã gặp: dòng code nào, dữ liệu nào là null, vì sao null?
   ↳ Follow-up: Null đến từ DB, API ngoài, mapper, mặc định của object, hay logic? Làm sao phát hiện?
48. ⚠️ Nguyên nhân gốc "unhandled data cases" tổng quát là gì? Cột DB nullable trong khi code giả định not-null; spec không mô tả; dữ liệu cũ không đồng nhất; đối tác trả thiếu trường?
49. MyBatis: khi query không có dòng nào, `selectOne` trả `null`; khi nhiều hơn một dòng ném `TooManyResultsException`. Bạn từng gặp chưa?
50. MyBatis mapping: cột `NULL` ánh xạ vào kiểu nguyên thủy (`int`, `long`) gây lỗi; `Integer` vs `int`; `callSettersOnNulls`; `<resultMap>` thiếu `<collection>` khi `LEFT JOIN`. Bạn từng gặp ca nào?
51. `LEFT JOIN` trả `NULL` cho cột bảng bên phải, code giả định luôn có. Ví dụ cụ thể trong dự án?
52. Auto-unboxing `Integer` null sang `int` gây NPE: nhận ra từ stack trace thế nào?
53. `Map.get()` trả null, `Optional.get()` không kiểm tra, `stream().map()` gặp null, `List.of()` không chứa null, `Collectors.toMap` null value: bạn từng gặp ca nào?
54. `BigDecimal` null trong tính toán; so sánh `equals` vs `compareTo`; chia cho 0; làm tròn: defect kiểu này bạn xử lý thế nào?
55. Chuỗi rỗng vs null vs toàn khoảng trắng: validation đầu vào, `StringUtils.isBlank`, `Objects.requireNonNull`. Bạn đặt quy ước gì?
56. Cách fix NPE: thêm `if (x != null)` có phải là fix đúng không? Khi nào đó chỉ là "vá triệu chứng"? Cách tiếp cận đúng là gì (xác định null có hợp lệ về nghiệp vụ không)?
   ↳ Follow-up: Nếu null là không hợp lệ thì fail-fast ở đâu? Nếu hợp lệ thì giá trị mặc định/ nhánh xử lý nghiệp vụ là gì và ai quyết định?
57. `Optional` dùng thế nào là đúng, thế nào là lạm dụng (tham số, field)? `@Nullable` / `@NonNull` / Lombok `@NonNull` có dùng không?
58. Có thể ngăn NPE từ gốc ở mức thiết kế không: constraint `NOT NULL` ở DB, giá trị mặc định, validation đầu vào, DTO bất biến, static analysis (SonarQube, SpotBugs)?
59. Một NPE chỉ xảy ra với một bản ghi cũ do dữ liệu từ migration. Bạn xử lý thế nào: sửa code, sửa dữ liệu, hay cả hai?
60. Helpful NullPointerException message (JDK 14+): bạn có bật không? Nó giúp điều tra như thế nào?
61. Lỗi tương tự "unhandled data case" ngoài null: list rỗng, một phần tử, trùng lặp, số âm, ngày ngoài khoảng, ký tự đặc biệt/ Unicode, độ dài vượt quá cột. Ví dụ bạn gặp?
62. Dữ liệu từ hệ thống ngoài (đối tác, ERP, robot) sai định dạng hoặc thiếu trường. Bạn xử lý validate ở đâu (biên hệ thống)? Có lưu payload gốc để điều tra không?
63. Khi nhận payload không hợp lệ: từ chối toàn bộ, bỏ qua dòng lỗi, hay đưa vào hàng đợi lỗi? Bạn chọn gì và vì sao?
64. Khi bạn sửa một NPE, bạn có rà soát các chỗ tương tự trong codebase (cùng pattern) không? Cách rà (grep, static analysis)?

## F. Query chậm trong defect

65. 🔥 Kể một defect do query chậm mà bạn xử lý: triệu chứng người dùng thấy, bạn lần theo log tới query nào như thế nào?
   ↳ Follow-up: Bạn tìm ra query chậm từ log ứng dụng, slow query log, hay APM? Sau đó fix gì?
66. Từ log ứng dụng (timeout, `Connection is not available`), làm sao nhận biết nguyên nhân là query chậm chứ không phải lỗi mạng?
67. Defect "API timeout" ở production: các bước điều tra theo thứ tự bạn làm (timeout ở đâu: gateway, ứng dụng, DB)?
68. Query chậm dẫn đến cạn connection pool (HikariCP) và kéo theo lỗi ở API khác. Bạn nhận ra chuỗi nhân quả đó thế nào?
69. Query chậm xuất hiện sau một đợt dữ liệu tăng hoặc sau release. Bạn kiểm tra khác biệt thế nào?
70. Khi fix query chậm trong khuôn khổ defect (thường gấp), bạn chọn fix tạm hay fix gốc? Ví dụ đánh đổi?
71. Bạn có dùng `EXPLAIN ANALYZE` trong điều tra defect không? Ai chạy ở production?
72. Query chậm do lock chờ (một transaction giữ lock lâu) thay vì plan xấu: dấu hiệu nào trong log/DB?
73. Defect do batch job chạy chồng lên giờ API online: bạn điều tra và đề xuất xử lý thế nào?

## G. Các case cụ thể trong dự án

74. 🔥 Trong các defect đã xử lý, hãy chọn một mà bạn trực tiếp điều tra từ đầu đến cuối và kể theo timeline: phát hiện, giả thuyết, bằng chứng, root cause, fix, kiểm chứng.
75. Case batch tồn kho bị crash vì tồn kho âm: kể lại. Triệu chứng đầu tiên là gì và ban đầu mọi người nghi ngờ điều gì?
   ↳ Follow-up: Bạn lần từ log batch lùi về nguyên nhân thế nào? Vì sao tồn âm lại làm batch crash?
76. ⚠️ Trong case race condition giữa scrap trên máy quét và batch chuyển "Retired": bạn trực tiếp điều tra hay phụ hỗ trợ? Dựa vào bằng chứng nào để kết luận timestamp lệch?
77. Với case đó, tại sao câu update không khớp dòng nào mà hệ thống vẫn báo thành công? Điều gì cho thấy code không kiểm tra số dòng bị ảnh hưởng?
78. Cách fix: kiểm tra rows affected, ràng buộc trừ kho phụ thuộc vào kết quả update. Bạn có viết test tái hiện kịch bản "rows affected = 0" không? Cụ thể thế nào?
79. Dữ liệu tồn kho đã âm từ trước: bạn sửa dữ liệu hiện tại bằng script nào, ai duyệt, kiểm chứng sau khi sửa thế nào?
80. Case lỗi làm tròn tích lũy khi tính sức chứa pallet: bạn tái hiện bằng unit test thế nào và làm sao biết lỗi nằm ở làm tròn bước trung gian?
81. Trong case pallet, bạn có kiểm tra tác động của fix với các đơn đã lập kế hoạch bằng công thức cũ không? Cách làm?
82. ⚠️ Ghi chú nói tỷ lệ tận dụng pallet tăng từ ~70% lên gần 90%. Số này tính thế nào, từ dữ liệu nào?
83. Case "fault masking" (bước C sai, bước D vẫn đúng nhờ fallback): bạn nhận ra bằng chứng nào? Sau khi sửa C, kiểm tra D thế nào?
84. Tại sao silent fallback là nguy hiểm? Bạn đã thêm cảnh báo gì và ai nhận cảnh báo?
85. Vì sao không tắt/xóa fallback ở bước D? Nếu SLA check của D từ chối kho thì quy tắc nghiệp vụ nào quyết định kết quả cuối?
86. Case Hot SKU và optimistic lock bằng `updated_at`: bạn có điều tra defect liên quan nào chưa, hay chỉ học lại từ code và git history?
87. Optimistic lock dùng `updated_at` thay cho cột version: rủi ro (độ phân giải thời gian, clock skew, hai update cùng timestamp)? Khi bị lỗi xung đột thì xử lý ở tầng gọi thế nào?
88. Case robot AGV bị dừng do xung đột đường đi: bạn tham gia phần nào của việc điều tra? Log nào cho thấy tuyến đường chồng nhau?
89. Giữ pessimistic lock suốt thời gian robot di chuyển: rủi ro gì (lock mồ côi, timeout)? Bạn kiểm tra cơ chế nhả lock bằng cách nào khi robot mất tín hiệu?
90. Trong tất cả các case, defect nào để lại bài học lớn nhất về cách bạn viết code/ review sau đó?

## H. Root cause analysis và đào sâu kỹ thuật

91. Race condition: bạn phát hiện ra bằng dấu hiệu nào (bản ghi trùng, tồn kho lệch, lệnh chạy hai lần)? Bằng chứng trong log để chứng minh hai luồng chồng thời gian?
92. Check-then-act, read-modify-write, thiếu unique constraint: bạn nhận ra mẫu lỗi nào hay gặp nhất trong dự án?
93. `@Transactional` không rollback do self-invocation, checked exception, hay `try/catch` nuốt exception: bạn từng gặp ca nào? Triệu chứng và cách tìm?
94. Transaction bao cả lời gọi hệ thống ngoài làm giữ lock lâu: nhận biết thế nào qua log/DB?
95. Dữ liệu sai do mapping giữa hai hệ thống (đơn vị, múi giờ, enum, làm tròn): bạn đối chiếu hai bên thế nào?
96. Lỗi múi giờ/ngày giờ (`LocalDateTime` vs `Instant`, giờ kho khác UTC): defect kiểu này bạn từng gặp chưa?
97. Lỗi do cache (Redis) trả dữ liệu cũ: bạn nhận biết thế nào và xác định TTL/ invalidation đúng ở đâu?
98. Lỗi do hai instance cùng chạy một batch: log nào cho thấy điều đó (hostname, thread, thời điểm)?
99. Lỗi do cấu hình khác nhau giữa kho/ môi trường (profile, flag): bạn kiểm tra thế nào?
100. Lỗi OOM / heap tăng / GC dài khi xử lý dữ liệu lớn: bạn có dùng heap dump, GC log không? Nguyên nhân thường gặp?
101. Lỗi hiệu năng do vòng lặp gọi DB (N+1) trong code: nhận biết qua log SQL thế nào và sửa ra sao?
102. Thread dump: bạn đọc để tìm deadlock hoặc thread bị chặn thế nào?
103. Phân biệt lỗi tầng ứng dụng với lỗi dữ liệu với lỗi hạ tầng: checklist đầu tiên của bạn?

## I. Fix, kiểm chứng và phát hành

104. 🔥 Bạn chọn giữa fix nhanh (hotfix) và fix triệt để thế nào? Cho ví dụ đã chọn fix tạm rồi làm lại sau.
105. Quy trình hotfix production: nhánh nào, ai duyệt, kiểm thử thế nào, đẩy về các nhánh khác (các kho) ra sao?
106. Fix xong, bạn xác nhận ở staging thế nào? Tester kiểm tra lại, hay bạn chủ động test hồi quy?
107. Mỗi fix có kèm unit test không? Test đó phải fail trước fix và pass sau fix. Ví dụ.
108. Bạn đánh giá "blast radius" (phạm vi ảnh hưởng) của một fix thế nào để không gây lỗi mới?
109. Có lần fix của bạn gây ra lỗi mới (regression) không? Chuyện gì xảy ra, bạn xử lý thế nào?
110. Rollback một fix lỗi: thế nào, có tác động đến dữ liệu đã ghi không?
111. Khi lỗi đã làm hỏng dữ liệu production, kế hoạch gồm gì: dừng thêm lỗi, đo mức ảnh hưởng, script sửa, kiểm chứng, thông báo?
112. Script sửa dữ liệu: viết thế nào để an toàn (transaction, kiểm tra số dòng, backup bảng, chạy thử trên bản sao)? Ai duyệt trước khi chạy?
113. Thông báo cho vận hành/ khách hàng về defect và workaround: bạn làm gì trong lúc chờ fix?
114. Hotfix cho một kho khác với kho còn lại: tách nhánh hay dùng cờ cấu hình? Rủi ro?
115. Cập nhật ticket: bạn ghi gì (root cause, fix, cách kiểm chứng)? Có tài liệu/ post-mortem không?

## J. Phòng ngừa và cải tiến

116. 🔥 Sau mỗi defect, bạn làm gì để không lặp lại (test, validation, alert, checklist review, tài liệu)? Cho 2-3 ví dụ cụ thể đã thực hiện.
117. Bạn có đưa các lỗi hay gặp (null, thiếu kiểm tra rows affected, tính toán làm tròn) vào checklist review không? Nội dung?
118. Có phân tích xu hướng defect (loại, module, nguyên nhân) để cải thiện quy trình không?
119. Bạn có đề xuất guideline xử lý null/ lỗi/ log cho team chưa? Phản hồi thế nào?
120. Static analysis (SonarQube, SpotBugs, IDE inspections) có bắt NPE tiềm ẩn không? Quy tắc nào được bật?
121. Chuẩn hóa xử lý lỗi và exception để dễ điều tra: format lỗi, mã lỗi, ngữ cảnh; bạn có đóng góp gì?
122. Làm sao đảm bảo spec/FD mô tả dữ liệu biên (null, rỗng, âm)? Bạn có phản hồi lên BA để bổ sung không?

## K. Tình huống "nếu... thì sao"

123. 🔥 Production báo "tồn kho một SKU bị lệch" lúc cao điểm, bạn không có quyền DB. Hãy kể các bước bạn làm trong 1 giờ đầu.
124. Lỗi `NullPointerException` xuất hiện hàng nghìn lần/giờ sau một release. Bạn làm gì trước: rollback, hotfix, hay điều tra?
125. Log chỉ có "Internal Server Error" và không có stack trace. Bạn tiếp cận thế nào?
126. Tester báo một lỗi nhưng bạn không thể tái hiện sau nhiều giờ. Bạn làm gì tiếp theo, khi nào kết luận "không phải lỗi"?
127. Một lỗi xảy ra mỗi đêm 2 giờ sáng. Bạn điều tra thế nào (giờ batch, backup, vacuum, cron khác)?
128. Hai defect có vẻ liên quan: một NPE và một query chậm trên cùng API. Làm sao biết cái nào gây cái nào?
129. Khách hàng yêu cầu fix trong 2 giờ nhưng bạn thấy root cause nằm ở thiết kế. Bạn đề xuất gì?
130. Sau fix, lỗi vẫn còn xảy ra thỉnh thoảng. Bạn nghĩ gì và làm gì?
131. Member của bạn fix NPE bằng cách bọc `try/catch` và bỏ qua. Bạn review và phản hồi thế nào?
132. Một dòng dữ liệu "bẩn" cũ khiến cả batch crash. Bạn thiết kế để batch chịu lỗi (skip và ghi nhận) thế nào mà không che giấu vấn đề?
133. Lỗi chỉ xuất hiện với dữ liệu tiếng Việt có dấu hoặc ký tự đặc biệt. Bạn điều tra (encoding, collation, độ dài byte vs ký tự) thế nào?

## L. Hành vi (STAR) và phản tư

134. Kể về defect khó nhất bạn từng xử lý: vì sao khó, bạn đã làm gì, kết quả, bài học (STAR).
135. Kể một lần bạn chẩn đoán sai và phải đổi hướng giữa chừng. Điều gì khiến bạn nhận ra mình sai?
136. Kể một lần bạn bị áp lực lớn khi sự cố production kéo dài. Bạn giữ bình tĩnh và phối hợp với team thế nào?
137. Kể một lần bất đồng với tester/ BA về việc một thứ có phải là defect hay không. Kết quả?
138. Bạn đã hướng dẫn member xử lý defect/ đọc log như thế nào? Có ví dụ member tiến bộ nhờ đó không?
139. Nếu làm lại, bạn sẽ đầu tư thêm gì để rút ngắn thời gian điều tra (log có cấu trúc, trace, dashboard, quyền đọc DB chỉ-đọc, runbook)?
140. Điều gì ở việc xử lý defect hiện tại bạn chưa làm được (quyền DB production, phân tích sâu bằng APM, chaos/ load test)? Bạn bù thế nào?
141. Công việc xử lý defect dạy bạn điều gì về cách viết code mới để ít lỗi hơn?
