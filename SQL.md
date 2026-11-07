## A. SQL nâng cao và những cái bẫy hay gặp

1. 🔥 `NOT IN (subquery)` trả về rỗng dù chắc chắn có dòng thỏa. Vì sao (NULL)? So sánh `NOT IN`, `NOT EXISTS`, `LEFT JOIN ... IS NULL` về đúng/sai và hiệu năng.
2. `COUNT(*)`, `COUNT(col)`, `COUNT(DISTINCT col)` khác nhau gì? Báo cáo "số đơn theo kho" ra sai vì JOIN làm nhân dòng, phát hiện và sửa thế nào?
3. 🔥 `WHERE` vs `HAVING`, và điều kiện đặt ở `ON` vs `WHERE` của `LEFT JOIN`. Cho ví dụ cùng một câu lệnh ra hai kết quả khác nhau.
4. INNER, LEFT, FULL, CROSS JOIN, self join: cho một tình huống thực tế mỗi loại (đối soát tồn kho hai hệ thống bằng FULL JOIN chẳng hạn).
5. 🔥 Lấy đơn hàng mới nhất của mỗi khách (top-1 mỗi nhóm). Có mấy cách (`ROW_NUMBER`, `DISTINCT ON`, subquery, `LATERAL`) và cách nào nhanh với 50 triệu dòng?
6. Window function: `ROW_NUMBER`, `RANK`, `DENSE_RANK`, `LAG/LEAD`, `SUM() OVER`. Tính tồn kho lũy kế theo ngày từ bảng giao dịch nhập/xuất. Khung `ROWS` vs `RANGE` khác gì?
7. CTE vs subquery vs temp table: khi nào CTE bị materialize (PostgreSQL 12 trở đi thay đổi gì)? CTE đệ quy dùng cho bài toán nào (cây vị trí kho, cây danh mục)?
8. `UNION` vs `UNION ALL`, vì sao `UNION` có thể âm thầm làm chậm và làm mất dòng?
9. Hai bảng cần đối soát tồn kho giữa hai hệ thống, tìm các dòng chỉ có ở một bên hoặc lệch số lượng. Viết bằng SQL thế nào, kết quả lớn thì làm gì?
10. `CASE WHEN` trong aggregate (pivot): báo cáo số lượng theo trạng thái trên một dòng cho mỗi kho.
11. Xử lý thời gian: `timestamp` vs `timestamptz`, group theo ngày của kho ở múi giờ khác nhau, đơn lúc 23:30 UTC rơi vào ngày nào?
12. `LIKE '%abc'`, `ILIKE`, full-text search, `pg_trgm`: tìm theo mã sản phẩm một phần thì chọn gì?
13. `DISTINCT` hay `GROUP BY` khi cần loại trùng? Dùng `DISTINCT` để "vá" kết quả bị nhân dòng là dấu hiệu gì?
14. `UPSERT`: `INSERT ... ON CONFLICT DO UPDATE/NOTHING` trong PostgreSQL. Khi nào hai request đồng thời vẫn gây vấn đề? `MERGE` khác gì? Dùng upsert cộng dồn số lượng thế nào cho đúng?
15. `UPDATE ... SET qty = qty - 1 WHERE id = ? AND qty >= 1`, kiểm tra số dòng bị ảnh hưởng. Vì sao đây là cách trừ tồn kho đơn giản và an toàn nhất (atomic update)?
16. `RETURNING` giải quyết vấn đề gì (lấy ID, giá trị sau update không cần query lần hai)?
17. `NULL` ở khắp nơi: `NULL = NULL`, `NULL` trong unique constraint, `COALESCE`, `NULLS FIRST` khi sort. Bug thực tế nào hay gặp?
18. Làm tròn và kiểu số: `numeric` vs `float` vs `integer` cho tiền và số lượng, tràn `int` (ID đến 2,1 tỷ) xử lý thế nào khi đã chạy production?

## B. Index 🔥

19. 🔥 B-tree index hoạt động thế nào? Vì sao tìm kiếm là O(log n)? Chi phí ghi, dung lượng, và vì sao "đánh index mọi cột" là tệ?
20. 🔥 Query chạy nhanh với 1000 dòng, chậm với 10 triệu dòng dù đã có index. Liệt kê các lý do planner không dùng index (hàm bọc cột, kiểu dữ liệu lệch, `LIKE '%x'`, độ chọn lọc thấp, thống kê cũ, `OR`, `!=`).
21. 🔥 Composite index `(a, b, c)`: quy tắc leftmost prefix. Query `WHERE b = ?` có dùng được không? `WHERE a = ? ORDER BY c`? Thứ tự cột chọn theo tiêu chí nào (equality trước, range sau, độ chọn lọc)?
22. Covering index (`INCLUDE`), index-only scan: khi nào tránh được truy cập bảng, vì sao vẫn có thể phải đọc heap (visibility map, vacuum)?
23. Partial index: ví dụ `WHERE status = 'PENDING'` trên bảng 100 triệu đơn mà 99% đã xong. Lợi gì? Unique partial index cho "mỗi đơn chỉ có một lệnh đang active" thì sao?
24. Expression index: tìm không phân biệt hoa thường (`lower(code)`), index trên JSON field. Khi nào query không khớp biểu thức nên không dùng được?
25. Unique index và constraint: vì sao unique constraint là vũ khí chống trùng mạnh hơn kiểm tra trong code? Unique trên cột nullable hoạt động thế nào?
26. Chọn kiểu index: B-tree, hash, GIN, GiST, BRIN. Bảng log cực lớn sắp theo thời gian thì BRIN hợp lý ở đâu? GIN dùng cho `jsonb` và full-text.
27. Index trên foreign key: không có thì xóa dòng cha gây gì (scan toàn bảng con, lock)? Có nên index mọi FK?
28. Index bị bloat, index trùng lặp hay không dùng: phát hiện bằng `pg_stat_user_indexes`, dọn thế nào mà không khóa bảng (`CREATE INDEX CONCURRENTLY`, `REINDEX CONCURRENTLY`)?
29. Thêm index trên bảng 200 triệu dòng đang chạy production. Rủi ro (khóa ghi, I/O, replication lag) và quy trình an toàn?
30. Tạo index xong mà query vẫn không dùng. Kiểm tra gì: `ANALYZE`, selectivity, kiểu dữ liệu, `enable_seqscan` để thử, cost của planner?
31. Vì sao với bảng nhỏ hoặc truy vấn lấy phần lớn dòng, seq scan còn nhanh hơn index scan? Index scan, bitmap scan, index-only scan khác nhau gì?
32. Index cho `ORDER BY ... LIMIT` (top-N): làm thế nào để sort được loại bỏ hoàn toàn? Index với `ASC/DESC` hỗn hợp?
33. Clustered index (InnoDB) vs heap (PostgreSQL): ảnh hưởng đến PK, secondary index, chọn UUID làm PK thế nào (UUID v4 ngẫu nhiên vs UUID v7 theo thời gian)?

## C. Execution plan và tối ưu query 🔥

34. 🔥 Đọc `EXPLAIN (ANALYZE, BUFFERS)`: các thông số nào quan trọng (actual time, rows ước lượng vs thực, loops, buffers hit/read)? Rows ước lượng lệch thực tế 1000 lần nói lên điều gì?
35. 🔥 Nested Loop, Hash Join, Merge Join: mỗi loại tốt khi nào? Planner chọn Nested Loop trong khi thực tế dữ liệu lớn thì xử lý ra sao?
36. Thống kê và `ANALYZE`: `autovacuum` chưa kịp chạy sau bulk load làm plan tệ. Phát hiện và xử lý? `default_statistics_target`, extended statistics cho cột tương quan?
37. 🔥 Quy trình tối ưu một query chậm từ đầu: lấy query thật, tái hiện với dữ liệu giống production, `EXPLAIN ANALYZE`, xác định node tốn nhất, đề xuất, đo lại. Bạn không có quyền vào DB production thì làm sao?
38. Một query chạy 50ms trên staging nhưng 30 giây trên production. Nguyên nhân (khối lượng dữ liệu, thống kê, tham số, plan cache/prepared statement, lock chờ)?
39. Prepared statement và generic plan trong PostgreSQL: vì sao cùng câu lệnh mà giá trị tham số khác nhau lại có plan tồi (parameter sniffing)?
40. 🔥 Phân trang `OFFSET` ở trang 100.000 rất chậm. Giải thích và đổi sang keyset pagination thế nào? Hạn chế của keyset (nhảy trang, sort nhiều cột)?
41. `COUNT(*)` trên bảng 200 triệu dòng chậm. Các hướng (ước lượng từ `pg_class.reltuples`, bảng đếm riêng, cache, đếm xấp xỉ) và đánh đổi?
42. Query có `IN (...)` với 50.000 ID. Vấn đề gì (độ dài câu lệnh, plan), thay bằng `= ANY(array)`, bảng tạm hoặc `JOIN VALUES` thế nào?
43. `SELECT *` có hại gì ngoài băng thông (mất index-only scan, thay đổi schema làm hỏng code)?
44. Subquery tương quan (correlated) chậm, viết lại bằng JOIN hoặc window function. `EXISTS` vs `IN` vs `JOIN` có thật sự khác hiệu năng không ở bản PostgreSQL hiện đại?
45. 🔥 N+1 ở tầng SQL: vòng lặp gọi 10.000 query nhỏ. Gom thành một query, `IN`/`ANY`, hoặc join. Ngưỡng nào gom quá lớn lại tệ hơn?
46. Báo cáo nặng chạy trên DB chính làm chậm API. Giải pháp: replica đọc, materialized view, bảng tổng hợp (rollup), chạy ngoài giờ. Đánh đổi độ tươi dữ liệu?
47. Materialized view: refresh thế nào (`CONCURRENTLY`, yêu cầu unique index), khi nào dùng, khi nào bảng tổng hợp tự cập nhật tốt hơn?
48. Slow query log, `pg_stat_statements`: dùng để tìm query nào tốn tổng thời gian nhiều nhất (khác với chậm nhất). Vì sao query 5ms chạy 10 triệu lần/ngày đáng lo hơn query 5 giây chạy 2 lần?
49. `work_mem` nhỏ khiến sort/hash tràn ra đĩa (`external merge`). Phát hiện trong plan và điều chỉnh thế nào mà không làm cạn RAM khi nhiều kết nối?
50. Hibernate sinh query phức tạp với nhiều join gây chậm (đúng ca ở Apollogix của bạn). Khi nào chuyển sang view/function/native query, và rủi ro bảo trì?
51. Function/view trong DB (PostgreSQL) so với logic ở tầng ứng dụng: ưu nhược điểm về hiệu năng, test, versioning, Flyway, deploy?

## D. Transaction, isolation và MVCC 🔥

52. 🔥 ACID: mỗi chữ cái đảm bảo điều gì, và đâu là chữ bị đánh đổi nhiều nhất khi scale? Durability dựa vào WAL thế nào?
53. 🔥 Các isolation level (Read Uncommitted/Committed, Repeatable Read, Serializable) và các hiện tượng (dirty read, non-repeatable read, phantom, write skew, lost update). Cho ví dụ tình huống kho cho từng hiện tượng.
54. 🔥 PostgreSQL mặc định `READ COMMITTED`. Hai transaction cùng đọc tồn kho = 1 rồi cùng trừ 1 thì sao? Với `REPEATABLE READ` kết quả khác thế nào (lỗi serialization failure và retry)?
55. MVCC trong PostgreSQL: mỗi dòng có phiên bản, `xmin/xmax`, snapshot. Vì sao đọc không chặn ghi? Cái giá phải trả (dead tuple, vacuum, bloat)?
56. Write skew: hai bác sĩ cùng nghỉ trực, tương tự: hai nhân viên cùng nhận hai lệnh làm kho trống mà ràng buộc nói "ít nhất một người phải trực". `SERIALIZABLE` giải quyết thế nào, đánh đổi?
57. Lost update: hai người cùng sửa một bản ghi, bản sau đè bản trước. Giải quyết bằng optimistic locking (`version`), `SELECT FOR UPDATE`, hay atomic update?
58. Long-running transaction nguy hiểm thế nào (giữ snapshot, chặn vacuum, giữ lock, `idle in transaction`)? Phát hiện bằng `pg_stat_activity` và xử lý thế nào?
59. Transaction nhìn thấy dữ liệu của chính nó nhưng service khác không thấy: vì sao event gửi trước commit làm consumer đọc dữ liệu cũ hoặc không thấy? Giải pháp?
60. Savepoint là gì? Vì sao trong PostgreSQL, một câu lệnh lỗi làm cả transaction thành `aborted`, và cách xử lý khi muốn tiếp tục (savepoint hoặc `ON CONFLICT`)?
61. Đồng bộ commit: `synchronous_commit`, fsync, độ bền đổi lấy tốc độ. Khi nào có thể chấp nhận mất vài giây dữ liệu?
62. Phân biệt transaction ở DB với "transaction" nghiệp vụ trải dài nhiều bước/nhiều hệ thống. Khi nào DB transaction không đủ?
63. Two-phase commit (XA) có nên dùng không? Vì sao hay bị tránh trong microservice?
64. Snapshot đọc nhất quán cho báo cáo: chạy báo cáo tổng tiền trong khi có giao dịch song song, `REPEATABLE READ` hoặc `READ ONLY DEFERRABLE` giải quyết gì?

## E. Lock, deadlock và mẫu thiết kế chống xung đột 🔥

65. 🔥 Các loại lock trong PostgreSQL: row-level (`FOR UPDATE`, `FOR NO KEY UPDATE`, `FOR SHARE`), table-level, advisory lock. Câu lệnh nào lấy lock nào (kể cả `ALTER TABLE`, `CREATE INDEX`)?
66. 🔥 "SELECT kiểm tra tồn tại rồi INSERT" vẫn sinh bản ghi trùng. Vì sao và sửa thế nào (unique constraint + `ON CONFLICT`, khóa cha, advisory lock)?
67. 🔥 Hai transaction update chéo nhau gây deadlock. Tái hiện, đọc log deadlock, sửa bằng thứ tự truy cập nhất quán, giảm kích thước transaction, retry.
68. `SELECT ... FOR UPDATE` giữ lock đến khi nào? Đặt ở đâu trong code để lock ngắn nhất? Nếu bên trong giữ lock mà gọi API ngoài thì hậu quả?
69. 🔥 `FOR UPDATE SKIP LOCKED`: thiết kế hàng đợi công việc (outbox, lệnh picking) cho nhiều worker lấy việc không đụng nhau. `NOWAIT` khác gì?
70. Optimistic locking: bảng có cột `version`, câu `UPDATE ... WHERE id = ? AND version = ?`, số dòng ảnh hưởng 0 thì làm gì? Khi nào xung đột nhiều khiến optimistic tệ hơn pessimistic?
71. Tồn kho "nóng" (một SKU hot bị 1000 request/giây): row lock thành nút thắt. Hướng giải: chia nhỏ bộ đếm (sharded counter), giữ chỗ bằng Redis rồi ghi DB, hàng đợi tuần tự theo SKU. Đánh đổi từng cách?
72. Advisory lock (`pg_advisory_xact_lock`): dùng cho bài toán nào (job chỉ chạy một nơi, tuần tự hóa theo business key)? Rủi ro khi dùng với connection pool (lock theo session)?
73. Lock timeout, statement timeout, `idle_in_transaction_session_timeout`: đặt giá trị nào để một query kẹt không kéo sập cả hệ thống?
74. Một migration `ALTER TABLE` xin `ACCESS EXCLUSIVE` lock đang chờ sau một transaction dài, và mọi query sau đó bị xếp hàng sau nó. Chuyện gì xảy ra (lock queue)? Phòng ngừa bằng `lock_timeout` và retry?
75. Hệ thống có 2 pod xử lý cùng một lệnh vì retry. Chặn bằng unique key + trạng thái (state machine với `UPDATE ... WHERE status = 'NEW'`). Vì sao `UPDATE ... WHERE status` là bước "claim" nguyên tử rất hữu ích?
76. Idempotency key lưu trong DB: thiết kế bảng, unique, TTL, xử lý khi request đầu còn đang chạy mà request lặp đến (in-progress)?
77. Khóa phân tán bằng DB vs Redis vs ZooKeeper: lock bằng bảng DB (`INSERT` unique) có ổn không, xử lý lock mồ côi khi process chết?

## F. Thiết kế schema và toàn vẹn dữ liệu

78. 🔥 Chuẩn hóa 1NF/2NF/3NF, khi nào phi chuẩn hóa có chủ đích (đọc nhiều, báo cáo)? Cho ví dụ đơn hàng và dòng hàng với giá tại thời điểm đặt.
79. Khóa chính: số tăng dần, UUID, khóa tự nhiên (mã SKU). Ưu/nhược điểm về hiệu năng index, lộ thông tin, merge dữ liệu giữa 15 kho?
80. Foreign key có nên bật ở production không? Chi phí hiệu năng, lợi ích toàn vẹn, các hệ thống lớn bỏ FK vì sao? `ON DELETE CASCADE` nguy hiểm thế nào?
81. `CHECK` constraint, `NOT NULL`, `UNIQUE`: đưa ràng buộc nghiệp vụ xuống DB (số lượng không âm, trạng thái hợp lệ) thay vì chỉ validate ở code. Ví dụ bắt lỗi trừ âm tồn kho.
82. Lưu trạng thái: cột `status` string, enum DB, bảng tham chiếu. Chuyển trạng thái hợp lệ được bảo vệ ở đâu? Thêm giá trị mới có khóa bảng không?
83. Mô hình tồn kho: một cột `quantity` cập nhật trực tiếp vs sổ cái giao dịch (ledger/append-only, tồn = tổng). Ưu nhược điểm về audit, hiệu năng, đối soát?
84. Quan hệ nhiều-nhiều, bảng liên kết, cây phân cấp (adjacency list, materialized path, nested set, `ltree`). Chọn thế nào cho cây vị trí kho (kho → khu → kệ → ô)?
85. Soft delete vs hard delete vs archive: ảnh hưởng với unique constraint, index (partial index `WHERE deleted_at IS NULL`), báo cáo, GDPR?
86. Audit/lịch sử: trigger, bảng history, event sourcing nhẹ. Cái nào hợp dữ liệu kho cần truy vết ai đổi gì lúc nào?
87. Lưu JSON (`jsonb`) trong bảng quan hệ: khi nào hợp lý (thuộc tính thay đổi), khi nào là bẫy (cần join, ràng buộc, index)? 
88. Multi-tenant / nhiều kho: một DB chung với cột `warehouse_id`, schema riêng, hay DB riêng cho từng kho (đúng mô hình của bạn). So sánh về cô lập, chi phí, migration, báo cáo tổng hợp.
89. Thiết kế dữ liệu cho hai hệ thống đồng bộ: khóa ngoại nghiệp vụ, phiên bản (`updated_at`, `version`), đánh dấu bản ghi đã đồng bộ, phát hiện xóa?
90. Kiểu dữ liệu: `varchar(n)` vs `text`, `char`, độ dài, collation (so sánh chuỗi, sort tiếng Việt), `citext`. Bug thực tế nào xảy ra khi collation khác giữa các môi trường?
91. Số thứ tự không đứt quãng (mã đơn, số phiếu): `SEQUENCE` có lỗ hổng khi rollback, nếu pháp lý yêu cầu liên tục thì làm sao (bảng counter với lock)?

## G. Dữ liệu lớn: batch, partition, migration 🔥

92. 🔥 Batch job update 5 triệu dòng làm các API khác chậm và replication lag tăng. Làm lại thế nào (chia chunk theo khoảng khóa, commit từng đợt, nghỉ giữa đợt, giờ thấp điểm, theo dõi lock và lag)?
93. Xóa 100 triệu dòng log cũ: `DELETE` tốn gì (WAL, dead tuple, bloat, lock)? So sánh với `DROP PARTITION`, `TRUNCATE`, chia batch.
94. 🔥 Partitioning (range theo thời gian, list theo kho, hash): lợi ích (pruning, drop nhanh), hạn chế (unique cần chứa khóa partition, nhiều partition làm chậm planner). Khi nào KHÔNG nên partition?
95. Sharding khác partitioning thế nào? Khi nào đáng làm, chọn shard key thế nào, vấn đề cross-shard query và transaction?
96. Bulk insert: `INSERT` từng dòng vs batch vs `COPY`. Tắt index tạm thời? Cỡ batch hợp lý, rewriteBatchedStatements (MySQL), `reWriteBatchedInserts` (PostgreSQL JDBC)?
97. 🔥 Thêm cột `NOT NULL DEFAULT` vào bảng 50 triệu dòng khi hệ thống đang chạy. Khác nhau giữa các phiên bản PostgreSQL, quy trình expand/contract (thêm nullable → backfill theo lô → thêm constraint `NOT VALID` → `VALIDATE`)?
98. Đổi kiểu cột (int → bigint) trên bảng khổng lồ, không downtime. Chiến lược cột mới + đồng bộ + chuyển đổi?
99. Backfill dữ liệu: viết job backfill an toàn (idempotent, chạy lại được, chia lô theo PK, theo dõi tiến độ, có thể dừng giữa chừng)?
100. Rollback migration: Flyway không tự rollback. Chiến lược cho migration phá hủy (xóa cột)? Vì sao nên triển khai thành 2 release (code bỏ dùng cột trước, xóa cột sau)?
101. Release nhiều kho, mỗi kho một DB: migration chạy lệch nhau giữa các kho thì code phiên bản mới/cũ phải tương thích thế nào? Làm sao biết kho nào đã migrate?
102. Dữ liệu tăng 10 lần sau 1 năm: ước lượng dung lượng, chiến lược lưu trữ (archive, tiering, nén), thời gian giữ dữ liệu?
103. Export/import file lớn (CSV hàng triệu dòng): `COPY`, streaming, staging table, kiểm tra và hợp nhất bằng `INSERT ... SELECT`/`MERGE`, xử lý dòng lỗi?
104. Job đối soát (reconciliation) chạy hàng đêm so sánh hai hệ thống hàng chục triệu dòng. Thiết kế (checksum theo lô, so sánh theo khoảng khóa, tránh tải hết lên bộ nhớ)?

## H. PostgreSQL nội bộ và vận hành

105. 🔥 VACUUM, autovacuum, dead tuple, bloat: vì sao một bảng update liên tục trở nên chậm và phình? Tuning autovacuum cho bảng nóng? `VACUUM FULL` vs `pg_repack`?
106. Transaction ID wraparound là gì, vì sao là sự cố nghiêm trọng, cách phòng?
107. HOT update, `fillfactor`: giảm bloat cho bảng update nhiều cột không index thế nào?
108. WAL, checkpoint, `max_wal_size`: ghi nhiều làm I/O giật theo chu kỳ checkpoint. Quan sát và chỉnh thế nào?
109. Connection: mỗi connection PostgreSQL là một process, vì sao 500 connection là vấn đề? Connection pool ở app (HikariCP) và PgBouncer: transaction pooling có hạn chế gì (prepared statement, advisory lock, session state)?
110. 🔥 "Too many connections" hoặc app báo cạn pool. Điều tra: ai đang giữ connection (`pg_stat_activity`), `idle in transaction`, query kẹt, rò rỉ connection không đóng. Công thức chọn kích thước pool?
111. `pg_stat_activity`, `pg_locks`: viết query tìm ai đang chặn ai (blocking chain). Kill query nào, và `pg_cancel_backend` vs `pg_terminate_backend`?
112. Tìm nguyên nhân DB CPU 100%: query nào, từ pod nào, từ khi nào? Dùng `pg_stat_statements`, trace APM nối với query, so sánh trước và sau release.
113. Cache hit ratio, `shared_buffers`, OS cache: bảng làm việc không vừa RAM thì triệu chứng và hướng xử lý?
114. Temp file, `log_min_duration_statement`, `auto_explain`: bật chúng ở production an toàn thế nào?
115. Extension hữu ích (`pg_stat_statements`, `pg_trgm`, `pgcrypto`, `uuid-ossp`, `timescaledb`): nhóm nào bạn dùng, nhóm nào cần cân nhắc rủi ro?
116. Khác biệt PostgreSQL và MySQL (InnoDB) mà bạn từng gặp: isolation mặc định, gap lock, clustered index, `ON DUPLICATE KEY`, collation, DDL có transactional không?
117. Gap lock / next-key lock trong MySQL ở `REPEATABLE READ` gây deadlock lạ thế nào khi insert đồng thời?

## I. Replication, scale, HA và backup

118. 🔥 Replica đọc: replication lag gây lỗi gì (ghi xong đọc ngay không thấy, "read your own writes")? Cách xử lý (đọc từ primary cho luồng nhạy cảm, sticky session, chờ LSN)?
119. Sync vs async replication: đánh đổi giữa độ bền và độ trễ ghi. Failover tự động mất dữ liệu thế nào (split brain, mất commit chưa kịp replicate)?
120. Scale đọc, scale ghi: thứ tự thử (tối ưu query → index → cache → replica → partition → shard). Bạn quyết định chuyển bước dựa trên số liệu nào?
121. Backup: logical (`pg_dump`) vs physical (`pg_basebackup`, WAL archiving, PITR). RPO, RTO là gì, kiểm tra backup khôi phục được chưa bằng cách nào?
122. Lỡ chạy `UPDATE` thiếu `WHERE` trên production. Xử lý thế nào (PITR, khôi phục bảng từ backup, phát hiện sớm, quy trình duyệt script, chạy trong transaction để kiểm tra số dòng)?
123. Quy trình sửa dữ liệu production an toàn: script review, chạy thử trên bản sao, backup bảng trước, transaction + kiểm tra `rowcount`, ghi lại audit, ai duyệt?
124. Đồng bộ dữ liệu giữa 15 DB kho lên một kho dữ liệu tổng hợp: CDC (Debezium), ETL theo lô, đánh đổi độ trễ, thứ tự, xóa dữ liệu, schema thay đổi?
125. Connection string, quyền DB, mã hóa (at rest, in transit), mask dữ liệu nhạy cảm cho môi trường test: bạn đề xuất gì?
126. Disaster: DB chính của một kho chết lúc cao điểm. Quy trình phát hiện, chuyển sang replica, ứng dụng nối lại, dữ liệu mất bao nhiêu, thông báo ai?

## J. NoSQL, Redis, Elasticsearch (khi nào dùng, khi nào không)

127. 🔥 Khi nào chọn MongoDB thay vì PostgreSQL? Dữ liệu dạng tài liệu, schema thay đổi. Khi nào đó là sai lầm (cần join, transaction nhiều tài liệu, báo cáo)? PostgreSQL `jsonb` thay thế được tới đâu?
128. MongoDB: thiết kế document (embed vs reference), index, kích thước document tối đa, transaction đa tài liệu có sẵn nhưng giá nào?
129. 🔥 Redis dùng cho những việc gì (cache, rate limit, lock, session, hàng đợi nhẹ, leaderboard)? Chọn cấu trúc dữ liệu nào cho từng việc?
130. Cache-aside, write-through, write-behind: ưu nhược điểm, khi nào dữ liệu cache lệch DB, xử lý invalidation thế nào (xóa sau commit, TTL, versioning key)?
131. Cache stampede (nhiều request cùng miss khi key hết hạn): khóa theo key, TTL ngẫu nhiên, refresh sớm, cache "null" cho dữ liệu không tồn tại (cache penetration)?
132. Redis lock (`SET NX PX`): vì sao không an toàn tuyệt đối (hết hạn khi vẫn đang xử lý, failover mất lock)? Fencing token là gì? Khi nào dùng DB lock thay thế?
133. Rate limiter bằng Redis: fixed window, sliding window, token bucket. Dùng Lua script để atomic thế nào, đúng ngay cả khi nhiều instance?
134. Redis chết hoặc đầy: ứng dụng xử lý thế nào (fail open/closed, fallback sang DB, chống dồn tải làm sập DB)? Eviction policy chọn gì?
135. Redis persistence (RDB, AOF) và vì sao không nên xem nó là nơi lưu dữ liệu duy nhất cho dữ liệu quan trọng?
136. Elasticsearch: dùng khi nào (tìm kiếm văn bản, lọc đa chiều, log), vì sao không dùng làm DB gốc? Đồng bộ từ PostgreSQL sang ES thế nào và xử lý lệch dữ liệu?
137. CAP và PACELC: giải thích bằng ví dụ hệ thống kho. Hệ thống nào của bạn chọn CP, AP?
138. Chọn cơ sở dữ liệu cho một yêu cầu mới (log sự kiện 10.000 ghi/giây, truy vấn theo thời gian): PostgreSQL, TimescaleDB, Cassandra, ClickHouse? Tiêu chí quyết định?

## K. Câu hỏi tổng hợp kiểu senior

139. 🔥 Phiếu nhập kho bị xử lý hai lần dẫn đến tồn kho cộng đôi. Điều tra từ bằng chứng trong DB (log, bảng giao dịch, thời gian), xác định root cause ở tầng nào (retry, hai instance, thiếu unique), sửa dữ liệu hiện tại thế nào, ngăn tái diễn bằng ràng buộc nào?
140. 🔥 Tồn kho hệ thống A và B lệch nhau 3%. Quy trình tìm nguyên nhân (đối soát theo lô, đánh dấu lệnh lệch, mất event, mapping sai, đồng bộ không thứ tự), và thiết kế cơ chế tự phát hiện từ nay?
141. Sau release, một API từ 200ms lên 3 giây, code không đổi phần query. Giả thuyết về DB (plan đổi do thống kê, thiếu index trên cột mới, lock, bloat, dữ liệu tăng đột biến) và kiểm tra từng cái thế nào?
142. API list đơn hàng chậm dần theo thời gian. Nguyên nhân có thể (thiếu index composite phù hợp sort, offset sâu, count toàn bảng, bảng bloat, join thừa) và cách chứng minh từng giả thuyết?
143. Lỗi tăng vọt lúc 2 giờ sáng mỗi ngày trùng giờ batch. Điều tra từ góc DB (lock, I/O, autovacuum, connection pool, query nặng)?
144. Cho một bảng `inventory_transaction` 300 triệu dòng, truy vấn phổ biến: tồn hiện tại theo SKU, lịch sử theo SKU trong khoảng ngày, báo cáo theo kho theo tuần. Bạn thiết kế index, partition, bảng tổng hợp thế nào?
145. Thiết kế DB cho flash sale 10.000 yêu cầu/giây, 100 sản phẩm, không bán quá số lượng. Lớp nào giữ tồn (Redis/DB), cách trừ nguyên tử, xử lý hết hàng, hoàn trả khi đơn hủy, đối soát lại?
146. Hai transaction chạy song song gây lệch số tiền báo cáo. Bạn chứng minh bằng bản tái hiện hai session psql thế nào, rồi sửa bằng isolation hay lock hay thiết kế lại?
147. Review một PR có: query trong vòng lặp, `SELECT *`, `UPDATE` không có `WHERE` index, transaction bao cả gọi API ngoài, migration thêm cột NOT NULL trực tiếp. Comment cho từng cái và xếp mức độ nghiêm trọng?
148. Dữ liệu một kho sai do script sửa tay ai đó chạy. Quy trình điều tra, khôi phục, và biện pháp quy trình ngăn chuyện này lặp lại?
149. Bạn có đúng 1 ngày để giảm tải DB đang quá tải. Làm gì đầu tiên, thứ hai, thứ ba? (xác định query tốn nhất, chặn query xấu, thêm index khẩn, cache điểm nóng, giảm connection, tăng tài nguyên là phương án sau cùng)
