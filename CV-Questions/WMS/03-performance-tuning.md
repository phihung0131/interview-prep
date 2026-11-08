> Improved the performance of slow APIs and batch jobs by analyzing their queries, restructuring joins and adding indexes.

## A. Xác minh phạm vi đóng góp thật

1. 🔥 ⚠️ Cụ thể bạn đã tối ưu bao nhiêu API và bao nhiêu batch job? Liệt kê tên/chức năng của từng cái.
   ↳ Follow-up: Cái nào bạn tự phát hiện, cái nào được giao ticket? Cái nào cải thiện nhiều nhất? Có cái nào tối ưu xong mà không đáng kể không?
2. ⚠️ Trong các lần tối ưu đó, lần nào bạn làm một mình hoàn toàn, lần nào làm cùng team hoặc chỉ tham gia điều tra?
3. 🔥 ⚠️ Function Design (FD) đã có sẵn logic và SQL. Vậy SQL trong FD bị chậm hay SQL bạn tự viết bị chậm? Bạn có được phép sửa SQL khác với FD không?
   ↳ Follow-up: Nếu sửa khác FD thì ai duyệt? FD có được cập nhật lại không? Khách hàng/BA có biết không?
4. Bạn tối ưu ở tầng query (SQL), tầng code Java, hay cả hai? Tỷ lệ mỗi loại trong số các lần bạn làm?
5. "Restructuring joins" cụ thể là gì: đổi thứ tự join, đổi loại join, bỏ join thừa, thay subquery bằng join, hay tách một query lớn thành nhiều query? Cho ví dụ của mỗi loại bạn đã làm.
6. "Adding indexes": ai quyết định được thêm index (bạn, lead, DBA, khách hàng)? Quy trình xin thêm index thế nào?
7. Mỗi kho một database riêng, vậy index bạn thêm phải chạy lại ở từng DB? Đảm bảo đồng nhất giữa các kho bằng cách nào?
8. Index đi kèm migration script (Flyway/Liquibase) hay gửi script riêng cho đội vận hành chạy tay? Ai chạy ở production?
9. Nếu bạn không có quyền truy cập DB production, bạn lấy execution plan thật bằng cách nào? Ai chạy `EXPLAIN` hộ bạn?
10. Bạn đã từng tối ưu mà không thêm index nào không? Khi đó giải pháp là gì?
11. Dự án đang ở giai đoạn build mới hay bảo trì? Slow API/batch xuất hiện ở tính năng mới hay tính năng cũ mới bị chậm theo thời gian?
12. Bạn làm việc này từ lúc mới vào dự án (Dec 2024) hay chỉ sau khi lên Sub Lead? Có thay đổi gì giữa hai giai đoạn?

## B. Phát hiện, đo đạc và baseline

13. 🔥 Làm sao biết API/batch nào chậm: vận hành báo, tester báo, alert, dashboard, hay tự phát hiện khi review?
14. "Chậm" được định nghĩa thế nào: ngưỡng bao nhiêu giây thì coi là chậm? Có SLA/NFR hay yêu cầu hiệu năng trong FD không?
15. 🔥 Bạn đo thời gian trước khi tối ưu bằng công cụ gì: log thời gian từng bước, Datadog APM, `EXPLAIN ANALYZE`, `pg_stat_statements`, JMeter?
   ↳ Follow-up: Con số baseline có đo nhiều lần không? Đo trên môi trường nào, dữ liệu thế nào?
16. Bạn có tách được thời gian ở tầng DB và thời gian ở tầng ứng dụng (serialize, network, vòng lặp Java) không? Làm bằng cách nào?
17. Thời gian đo ở staging có đại diện cho production không? Dữ liệu staging có lượng gần giống production không?
18. Làm sao phân biệt query chậm do bản thân nó với chậm do lock chờ, connection pool cạn, hoặc DB đang bận vì job khác?
19. Query chậm ổn định hay chỉ chậm vào một số giờ/ngày? Bạn kiểm tra tính chu kỳ bằng cách nào?
20. Chậm có tăng theo thời gian/theo khối lượng dữ liệu không? Làm sao nhìn ra xu hướng (tuyến tính, bậc hai)?
21. Làm sao chọn thứ tự ưu tiên giữa nhiều API/batch đang chậm? Tiêu chí: tần suất gọi, tổng thời gian, mức ảnh hưởng nghiệp vụ?
22. Query 50ms chạy 1 triệu lần với query 5 giây chạy 10 lần/ngày, cái nào bạn xử lý trước và vì sao?
23. Bạn có dùng `pg_stat_statements` hoặc slow query log không? Nếu không, vì sao?
24. Có API nào chậm do gọi hệ thống bên ngoài chứ không phải do DB không? Bạn phân biệt bằng cách nào?
25. Bạn có đặt metric/log đo thời gian vào code (như `StopWatch`) không? Có để lại trong code production không, vì sao?

## C. Phân tích query và execution plan

26. 🔥 Quy trình bạn phân tích một query chậm từ đầu đến cuối là gì? Bước đầu tiên bạn làm?
27. 🔥 `EXPLAIN` và `EXPLAIN ANALYZE` khác nhau gì? Vì sao `EXPLAIN ANALYZE` với câu `UPDATE/DELETE` phải cẩn thận?
28. Bạn đọc plan ở những thông số nào đầu tiên: cost, actual time, rows ước lượng so với thực tế, loops, `Buffers`?
   ↳ Follow-up: Rows ước lượng lệch thực tế nhiều lần nói lên điều gì? `ANALYZE` có giúp không?
29. Seq Scan, Index Scan, Index Only Scan, Bitmap Heap Scan khác nhau gì? Khi nào Seq Scan lại là lựa chọn đúng?
30. Nested Loop, Hash Join, Merge Join: khi nào planner chọn loại nào? Bạn từng thấy Nested Loop chạy hàng triệu loops chưa, xử lý ra sao?
31. Plan có node `Sort` tốn kém hoặc `external merge Disk`: nghĩa là gì, xử lý bằng cách nào?
32. Plan hiện `Filter` với `Rows Removed by Filter` rất lớn nói lên điều gì?
33. Bạn có từng gặp plan khác nhau giữa môi trường dev, staging, production cho cùng một query không? Nguyên nhân?
34. Thống kê (`ANALYZE`, autovacuum) cũ ảnh hưởng plan thế nào? Bạn có từng phải chạy `ANALYZE` thủ công không?
35. Tham số bind (prepared statement) ảnh hưởng plan thế nào? MyBatis dùng `#{}` và `${}` khác nhau gì về plan và an toàn?
36. Bạn đọc plan của query có CTE: node `CTE Scan` nghĩa là gì? Làm sao biết CTE đã được materialize hay inline?
37. Trong query có nhiều join và nhiều điều kiện lọc, bạn xác định node nào là "thủ phạm" bằng cách nào (so sánh actual time từng node)?
38. Bạn có đo trên dữ liệu có phân phối lệch (một vài kho/SKU chiếm đa số) không? Skew ảnh hưởng tới plan thế nào?
39. Bạn có dùng công cụ phụ trợ để đọc plan (explain.depesz, pgAdmin, DBeaver) không?
40. Khi không lấy được plan thật từ production, bạn suy luận từ thông tin gì (số dòng bảng, index sẵn có, định nghĩa schema)?

## D. Restructuring joins và viết lại query

41. 🔥 Kể một query mà bạn viết lại join: query gốc thế nào, vì sao chậm, bạn viết lại ra sao, kết quả bao nhiêu?
   ↳ Follow-up: Làm sao chứng minh query mới cho cùng kết quả như query cũ? Bạn so sánh tập kết quả bằng cách nào?
42. Join thừa là gì? Làm sao phát hiện một bảng join vào nhưng cột không dùng đến?
43. `LEFT JOIN` hay `INNER JOIN`: có lần nào đổi loại join để planner tối ưu được không? Đổi có làm khác kết quả không?
44. Điều kiện đặt ở `ON` hay ở `WHERE` của `LEFT JOIN` ảnh hưởng gì đến kết quả và hiệu năng?
45. `IN` / `EXISTS` / `JOIN` / `NOT IN` / `NOT EXISTS`: trong PostgreSQL bản bạn dùng, planner xử lý khác nhau không? Bạn từng thay cái nào bằng cái nào?
46. Subquery tương quan (correlated) chạy lại cho từng dòng. Bạn nhận biết và viết lại bằng join/window function thế nào?
47. Join nhiều bảng một-nhiều làm nhân dòng (row explosion): phát hiện ra thế nào, xử lý bằng aggregate trước rồi mới join hay cách khác?
48. Thứ tự join có ảnh hưởng không với PostgreSQL (`join_collapse_limit`)? Khi nào phải chủ động ép thứ tự?
49. Bạn có thay join bằng tách query rồi ghép ở Java không? Khi nào cách đó tốt hơn, khi nào tệ hơn?
50. Query dùng `DISTINCT` hay `GROUP BY` để loại dòng trùng sau khi join bị nhân dòng. Bạn xử lý gốc rễ thế nào?
51. `SELECT *` hay chọn cột cụ thể: có từng ảnh hưởng hiệu năng ở API của bạn không (index-only scan, băng thông)?
52. Điều kiện bọc hàm lên cột (`lower(col)`, `date(col)`, cast) làm index vô hiệu. Bạn có từng sửa kiểu này không?
53. `OR` nhiều điều kiện: viết lại thành `UNION ALL` hay `IN` thế nào? Khi nào làm vậy hợp lý?
54. `LIKE '%abc%'` trong màn hình tìm kiếm: bạn xử lý thế nào (trigram index, đổi cách tìm)?
55. Phân trang `OFFSET/LIMIT` ở API danh sách: có từng gặp chậm ở trang sâu không? Keyset pagination giải quyết thế nào, hạn chế?
56. `COUNT(*)` để tính tổng số trang trên bảng lớn chậm. Bạn từng xử lý thế nào?
57. MyBatis dynamic SQL (`<if>`, `<foreach>`, `<where>`): khi tham số thay đổi, câu SQL thực tế thay đổi và plan cũng thay đổi. Bạn kiểm tra tất cả biến thể bằng cách nào?
58. `<foreach>` với `IN` của hàng chục nghìn phần tử: vấn đề gì, thay bằng gì (`= ANY(array)`, bảng tạm, batch)?
59. N+1 query trong MyBatis (nested select, `<collection select=...>`): bạn từng gặp chưa? Nhận biết qua log thế nào, sửa ra sao (join + `resultMap`, batch ID)?
60. Dùng `resultMap` với `<collection>` join nhiều bảng: ảnh hưởng gì đến số dòng trả về và bộ nhớ?
61. Window function thay cho self join hay subquery: bạn đã áp dụng chưa? Ví dụ?
62. Sau khi viết lại query, bạn xử lý tính tương thích với FD thế nào: kết quả, thứ tự sắp xếp, xử lý NULL có giữ nguyên không?

## E. Index

63. 🔥 Kể một index bạn thêm: bảng nào, cột nào, kiểu index gì, query nào hưởng lợi, nhanh hơn bao nhiêu?
   ↳ Follow-up: Vì sao thứ tự cột như vậy? Query nào khác trên bảng đó có bị ảnh hưởng, tốt hay xấu?
64. 🔥 Index đó tốn gì: ghi chậm hơn, dung lượng, bảo trì? Bạn có cân nhắc đánh đổi này không? Bảng đó ghi nhiều hay đọc nhiều?
65. Composite index: quy tắc leftmost prefix. `WHERE b = ?` với index `(a, b)` dùng được không? Bạn đã xếp thứ tự cột theo tiêu chí nào (equality trước, range sau, độ chọn lọc)?
66. Làm sao biết một cột có độ chọn lọc (selectivity) tốt để đánh index? Cột `status` với vài giá trị có nên index không?
67. Partial index: bạn đã dùng chưa? Với bảng có 99% bản ghi trạng thái hoàn tất, lợi gì?
68. Covering index (`INCLUDE`) và index-only scan: khi nào áp dụng, visibility map liên quan gì?
69. 🔥 Thêm index xong mà query vẫn không dùng. Bạn kiểm tra những gì (statistics, kiểu dữ liệu lệch, hàm bọc cột, selectivity thấp, cost)?
70. Có trường hợp thêm index làm query khác chậm đi (planner chọn plan sai) không? Bạn có từng gặp?
71. Index cho `ORDER BY ... LIMIT`: thiết kế để bỏ node Sort thế nào? Hỗn hợp ASC/DESC?
72. Index trên khóa ngoại: bạn có kiểm tra các bảng con thiếu index FK không? Hậu quả khi thiếu?
73. Bạn có từng xóa/ gộp index thừa hoặc trùng lặp không? Phát hiện bằng `pg_stat_user_indexes` thế nào?
74. Thêm index trên bảng lớn đang chạy production: `CREATE INDEX` thường và `CONCURRENTLY` khác gì? Rủi ro khóa ghi? Nếu `CONCURRENTLY` thất bại giữa chừng thì sao (index INVALID)?
75. Dung lượng index bao nhiêu so với bảng? Bạn có ước lượng trước khi thêm không?
76. Unique index / constraint: bạn có dùng để vừa nhanh vừa chống trùng không?
77. Index trên cột nullable và `IS NULL` / `IS NOT NULL`: PostgreSQL dùng index được không?
78. Index trên cột kiểu `timestamp` khi lọc theo ngày: vì sao `WHERE date(created_at) = ?` không dùng index và viết lại thế nào?
79. Bloat của index sau thời gian dài update/delete: biết chưa? Xử lý thế nào (`REINDEX CONCURRENTLY`)?
80. Index làm batch job ghi hàng triệu dòng chậm đi. Bạn có tắt/ tạo lại index quanh batch không? Rủi ro?

## F. Case batch phân bổ cuối ngày: subquery trong `WHERE` và CTE

81. 🔥 Kể lại case batch phân bổ hàng loạt cuối ngày: job làm gì, mỗi lần xử lý bao nhiêu đơn, chạy lúc nào, giờ cắt đơn (cut-off) lúc nào?
82. Job chạy lâu "tăng dần đều theo số đơn" — bạn có số liệu theo tuần không? Bao nhiêu phút lên bao nhiêu phút?
83. ⚠️ Bạn nói subquery trong `WHERE` bị chạy lại cho từng đơn. Subquery đó có tương quan (tham chiếu cột bên ngoài) hay độc lập? Với subquery độc lập, PostgreSQL thường đánh giá thế nào (InitPlan)?
   ↳ Follow-up: Vậy làm sao bạn chắc chắn là nó chạy N lần? Bạn xác nhận bằng `EXPLAIN ANALYZE` (loops) hay chỉ suy luận từ code?
84. ⚠️ Câu subquery đó nằm trong query của một lần gọi, hay query được gọi N lần từ vòng lặp Java (mỗi đơn một lần)? Chỗ lặp thật sự nằm ở SQL hay ở ứng dụng?
85. 🔥 CTE ở PostgreSQL 12 trở lên: khi nào được inline, khi nào bị materialize? `WITH ... AS MATERIALIZED` / `NOT MATERIALIZED` dùng khi nào? Phiên bản PostgreSQL của dự án là bao nhiêu?
86. ⚠️ Nếu CTE chỉ được tham chiếu một lần và không có side effect, ở PG12+ nó bị inline giống subquery. Vậy cải thiện của bạn đến từ CTE hay từ việc đổi sang join? Bạn kiểm tra thế nào?
87. Bạn mô tả "CTE tính một lần rồi tái sử dụng". Điều đó đúng khi nào? Làm sao chứng minh bằng plan?
88. Ghi chú nói thời gian "giảm đáng kể". Cụ thể giảm từ bao nhiêu xuống bao nhiêu? Số lượng đơn lúc đo?
89. Vì sao không chỉ thêm index cho bảng khu vực/vị trí? Index và CTE giải quyết hai vấn đề khác nhau thế nào?
90. Phương án cache ở tầng ứng dụng (load bản đồ khu vực/vị trí vào bộ nhớ trước vòng lặp): chi phí bộ nhớ, invalidation. Nếu dữ liệu khu vực thay đổi giữa chừng thì sao? Vì sao không chọn?
91. Khi gom thông tin khu vực/vị trí vào CTE rồi join, kết quả có thể thay đổi nếu dữ liệu khu vực bị cập nhật trong lúc batch chạy (isolation). Bạn nghĩ về điều đó không?
92. Job phân bổ có chạy trong một transaction lớn hay chia nhiều transaction? Giữ lock nào, ảnh hưởng API ban ngày không?
93. Job có xử lý theo chunk không? Chunk bao nhiêu đơn? Nếu một đơn lỗi thì sao?
94. Sau khi sửa, bạn còn nút thắt nào khác trong job không? Phần nào chiếm thời gian lớn tiếp theo?
95. Làm lại case này, bạn có chọn khác không (ví dụ `LATERAL`, bảng tạm, tính trước bằng materialized view)?

## G. Case batch ban đêm chạy 2 tiếng sau refactor: thread pool

96. 🔥 Kể lại case batch ban đêm: job làm gì (đồng bộ, đối soát, báo cáo tồn kho?), ở module nào, cần xong trước mấy giờ?
97. ⚠️ Ghi chú của bạn có nhiều số liệu (20-30 phút lên gần 2 tiếng, về 10 phút hoặc 10-12 phút). Số liệu nào là số thật bạn đo? Đo bằng gì, ở môi trường nào?
98. ⚠️ Vai trò của bạn thực sự là gì: người viết code refactor, người review, người điều tra hay người sửa? Ai là tác giả đợt refactor?
   ↳ Follow-up: Nếu bạn là Sub Lead lúc đó, sao review không bắt được? Bạn rút ra gì về quy trình review?
99. Ban đầu "xử lý song song" được cài bằng gì: `ExecutorService`, `CompletableFuture`, `@Async`, `parallelStream`, Spring Batch partitioning?
100. Refactor làm mất đa luồng như thế nào chính xác: gọi đồng bộ, bean `Executor` không được inject, `join()` ngay sau `submit()`, hay cấu hình bị ghi đè? Bạn tìm ra chỗ đó bằng cách nào (git diff, thread dump, profiler)?
101. Bạn xác nhận job chạy đơn luồng bằng cách nào (thread dump, log tên thread, CPU sử dụng)?
102. Sau khi khôi phục, số luồng bạn chọn là bao nhiêu? Căn cứ gì (CPU core, kích thước HikariCP `maximumPoolSize`, bản chất I/O-bound hay CPU-bound)?
   ↳ Follow-up: Mỗi luồng giữ mấy connection? Nếu một luồng cần 2 connection cùng lúc (transaction lồng) thì có nguy cơ deadlock pool không?
103. Dung lượng pool DB là bao nhiêu và còn bao nhiêu chừa cho API online? Con số "không quá 50-60% pool" từ đâu ra?
104. Hàng đợi của `ThreadPoolExecutor` (bounded hay unbounded) và `RejectedExecutionHandler` bạn cấu hình thế nào? Vì sao?
105. Khi một luồng ném exception thì các luồng khác và kết quả tổng thế nào? Ghi nhận lỗi, retry, hay bỏ qua? Transaction tách theo chunk hay chung?
106. Các luồng song song ghi cùng bảng/dòng có gây lock contention hay deadlock không? Chia partition dữ liệu theo khóa nào để tránh đụng nhau?
107. Dùng chung `ThreadLocal`, `SecurityContext`, MDC/correlation ID trong thread pool: log có bị mất thông tin ngữ cảnh khi chuyển luồng không?
108. Vì sao không dùng `parallelStream()` hay `@Async` mặc định? Rủi ro gì?
109. Hotfix này triển khai thế nào, lúc mấy giờ, đã chạy lại job ngay trong đêm hay đợi đêm sau? Dữ liệu bị trễ có phải xử lý bù không?
110. ⚠️ "Bổ sung kiểm tra thời gian chạy vào checklist/CI trước khi merge" — hiện checklist đó có thật không, ai duy trì, đã chặn được lần nào chưa?
111. Việc chạy song song làm tăng tải DB đêm. Có job khác chạy cùng lúc không? Bạn đo ảnh hưởng thế nào?

## H. Kiểm chứng kết quả và số liệu

112. 🔥 Làm sao khẳng định "đã cải thiện"? Số trước/sau, lặp bao nhiêu lần, trung vị hay trung bình, p95?
113. Bạn có kiểm tra rằng kết quả sau tối ưu giống hệt trước (tính đúng đắn) không? Cách làm cụ thể (so sánh tập kết quả, test hồi quy)?
114. Tối ưu trên staging đạt 10 lần nhưng production chỉ 2 lần. Nguyên nhân có thể (cache nóng/lạnh, khối lượng, thống kê, tranh chấp)?
115. Cache nóng/lạnh (buffer cache): lần chạy đầu và các lần sau khác nhau thế nào? Bạn đo công bằng ra sao?
116. Bạn có theo dõi sau khi release (Datadog, log) để xác nhận cải thiện kéo dài không? Sau bao lâu thì thấy lại chậm?
117. Có lần nào bạn tối ưu xong rồi dữ liệu tăng và lại chậm không? Bạn dự phóng tăng trưởng thế nào?
118. Có lần tối ưu mà kết quả không như kỳ vọng hoặc phản tác dụng không? Bài học?
119. Bạn có trường hợp khuyên "không nên tối ưu" vì chi phí/rủi ro lớn hơn lợi ích không?
120. Cải thiện này mang lại lợi ích nghiệp vụ gì cụ thể (kịp giờ cắt đơn, nhân viên kho đỡ chờ)? Có phản hồi từ vận hành không?

## I. Rủi ro, vận hành và quy trình

121. Triển khai thay đổi query/index lên nhiều kho: theo thứ tự nào, có thử ở một kho trước không, có rollback plan không?
122. Index mới làm tăng thời gian ghi của giao dịch nhập/xuất khi cao điểm (peak sale). Bạn đánh giá thế nào?
123. Thay đổi query có cần qua kiểm thử hồi quy, UAT, hoặc phê duyệt từ khách hàng không? Ai duyệt?
124. Release hiệu năng thuộc loại major hay minor release? Có đi vào hotfix không?
125. Bạn có từng phải hotfix gấp một vấn đề hiệu năng ở production không? Quy trình thế nào?
126. Sau khi sửa, bạn có thêm monitor/alert cho API hoặc batch đó không (thời gian chạy vượt ngưỡng)?
127. Bạn có chia sẻ kinh nghiệm tối ưu cho team (guideline SQL, checklist review) không? Nội dung gì?
128. Khi review PR của member, bạn nhận ra query có vấn đề hiệu năng bằng dấu hiệu nào? Cho 3 ví dụ cụ thể.

## J. Kiến thức nền liên quan (PostgreSQL, MyBatis, HikariCP)

129. B-tree index hoạt động thế nào, độ phức tạp tra cứu ra sao, chi phí ghi?
130. MVCC của PostgreSQL ảnh hưởng thế nào đến hiệu năng bảng update nhiều (dead tuple, vacuum, bloat)? Bạn từng thấy bảng nào bloat chưa?
131. Autovacuum và `ANALYZE` có tác động thế nào lên plan sau một batch ghi lớn?
132. HikariCP: `maximumPoolSize`, `connectionTimeout`, `idleTimeout`, `maxLifetime`, leak detection. Bạn đã tinh chỉnh gì?
133. Công thức chọn kích thước pool; vì sao pool lớn hơn không phải lúc nào cũng nhanh hơn?
134. MyBatis: `#{}` vs `${}`, `ExecutorType.BATCH`, `fetchSize`, cache cấp 1 và cấp 2. Cấp nào bật trong dự án?
135. Đọc bảng lớn bằng MyBatis: `fetchSize`, cursor/ `ResultHandler` để streaming khi dữ liệu hàng triệu dòng, tránh tràn heap thế nào?
136. Batch insert/update: `reWriteBatchedInserts` của PostgreSQL JDBC, `ExecutorType.BATCH`, kích thước batch hợp lý?
137. `statement_timeout`, `lock_timeout` có đặt không? Một query kẹt ảnh hưởng gì đến pool?
138. Giải thích nested loop, hash join, merge join bằng ví dụ bảng đơn hàng và bảng khu vực.

## K. Tình huống "nếu... thì sao"

139. 🔥 API danh sách chậm dần theo thời gian dù code không đổi. Các giả thuyết của bạn và cách kiểm tra từng cái?
140. Sau release, một API từ 200ms lên 3 giây, phần query không đổi. Bạn điều tra từ đâu?
141. Batch chạy ổn nhiều tháng, đột nhiên chậm gấp 5 trong một đêm. Hỏi gì, kiểm tra gì đầu tiên?
142. Bạn có 1 ngày để giảm tải DB đang quá tải. Làm gì đầu tiên, thứ hai, thứ ba?
143. Thêm index khiến một API khác chậm hơn rõ rệt. Bạn xử lý thế nào?
144. Khách hàng muốn API trả về dưới 1 giây nhưng dữ liệu cho phép chỉ đạt 3 giây sau khi tối ưu hết cách. Bạn đề xuất gì (cache, bảng tổng hợp, async, thay đổi yêu cầu)?
145. Cần thêm index lên bảng 200 triệu dòng giữa giờ cao điểm. Bạn làm hay từ chối? Cách làm an toàn?
146. Một member viết query chạy tốt với 1.000 dòng ở dev nhưng chậm với 10 triệu dòng. Bạn giúp họ nhìn ra và sửa như thế nào, và phòng tái diễn?
147. Thêm index nhưng DBA/khách hàng từ chối vì sợ ảnh hưởng ghi. Bạn thuyết phục bằng bằng chứng gì?
148. Một batch job chiếm hết connection pool khiến API online time-out. Làm gì ngay, và thiết kế lâu dài ra sao?
149. Bạn tối ưu xong nhưng sau đó FD thay đổi yêu cầu làm query phức tạp hơn. Bạn bảo vệ hiệu năng thế nào?

## L. Hành vi và phản tư

150. Kể lần tối ưu bạn tự hào nhất, vì sao? Lần nào làm bạn học nhiều nhất?
151. Việc gì bạn từng đoán sai trong quá trình tối ưu (nghĩ do index nhưng hóa ra do chỗ khác)?
152. Nếu làm lại, bạn có đưa tối ưu hiệu năng và theo dõi `EXPLAIN` vào quy trình review/CI từ đầu không?
153. Bạn học về tối ưu SQL/PostgreSQL bằng cách nào (sách, tài liệu, thực hành)? Gần đây học thêm gì?
154. Điểm yếu của bạn trong mảng tối ưu hiệu năng là gì (quyền hạn DB, chưa tuning cấu hình server, chưa làm partition)? Bạn bù thế nào?
