# Câu hỏi phỏng vấn: Concurrency và data consistency trong API và batch job

> Resolved concurrency and data-consistency issues in APIs and batch jobs, keeping warehouse data accurate when many operations run at the same time.

Chú thích: 🔥 = xác suất bị hỏi cao / dễ bị đào sâu. ⚠️ = câu bẫy kiểm tra độ thật / độ chính xác của claim trong CV.

---

## A. Xác minh claim và phạm vi đóng góp

1. 🔥 Bullet nói "Resolved concurrency and data-consistency issues". Hãy kể vấn đề cụ thể nhất mà bạn đã giải quyết.
   ↳ Follow-up: Bạn phát hiện ra nó, hay được giao điều tra?
   ↳ Follow-up: Bạn tự tìm root cause, hay cả team cùng tìm?
   ↳ Follow-up: Ai đề xuất giải pháp cuối cùng, và bạn viết phần code nào?
2. ⚠️ "Resolved" nghĩa là bạn trực tiếp sửa và đưa lên production, hay đóng góp vào điều tra/review? Phân biệt rõ từng case.
3. ⚠️ Có bao nhiêu vấn đề concurrency/consistency khác nhau bạn đã xử lý? Liệt kê từng cái trong một câu.
4. ⚠️ Trong những case đó, case nào bạn tự làm từ đầu đến cuối, case nào bạn chỉ tham gia, case nào bạn chỉ đọc lại từ tài liệu hoặc git history?
5. ⚠️ "Keeping warehouse data accurate": độ chính xác này đo bằng cách nào? Có số liệu trước/sau (số lần tồn kho âm, số ticket sai lệch) không?
6. ⚠️ "When many operations run at the same time": bao nhiêu thao tác đồng thời? Bao nhiêu thiết bị quét, bao nhiêu request mỗi giây ở peak? Bạn lấy con số đó từ đâu?
7. Có case nào bạn kết luận là race condition nhưng sau đó hóa ra không phải không? Bạn đã kiểm chứng thế nào?
8. Trong CV bạn dùng chữ "Resolved". Có vấn đề nào bạn chưa giải quyết triệt để hoặc chỉ giảm thiểu? Vì sao?
9. Với vai trò Sub Lead, bạn xử lý các vấn đề này một mình hay hướng dẫn member? Cho ví dụ.
10. Bạn có quyền truy cập DB production để điều tra không? Nếu không, bằng chứng nào bạn dùng để chứng minh giả thuyết?
11. Nếu mình hỏi leader của bạn "người này giải quyết concurrency issue nào", họ sẽ nhắc đến case nào?

## B. Case: update không match dòng nào (scrap / retired / timestamp)

12. 🔥 Kể lại case hai luồng (nhân viên scrap trên máy quét và batch đánh dấu Retired) cùng đụng một bản ghi. Ai phát hiện, ai điều tra?
13. Nghiệp vụ "Retired" là gì? Vì sao mã cũ phải bị đánh dấu Retired sau khi mã mới được tạo?
14. Batch Retired chạy khi nào, chạy bởi trigger gì? Nó cập nhật những cột nào trong bản ghi?
15. Máy quét giữ timestamp lúc đọc bản ghi. Vì sao dùng timestamp làm điều kiện update? Đó là thiết kế có chủ đích hay từ FD?
16. Câu `UPDATE ... WHERE id = ? AND updated_at = ?` khi không khớp trả về mấy dòng? Code Java/MyBatis nhận được thông tin đó như thế nào?
17. 🔥 Vì sao hệ thống không kiểm tra số dòng bị ảnh hưởng (rows affected)? Đó là bug do dev, thiếu trong FD, hay thiếu convention?
18. Làm sao bạn phát hiện đúng điểm "update không match nhưng vẫn báo thành công"? Bạn bắt đầu từ log, từ dữ liệu, hay từ đọc code?
19. Phần trừ tồn kho chạy độc lập với kết quả update trạng thái: lý do thiết kế? Nằm trong cùng transaction hay khác transaction?
20. Vì sao tồn kho bị âm? Hệ thống cho phép tồn kho âm không? Có constraint hay check nào chặn không?
21. Batch ban đêm crash vì tồn kho âm: crash ở đâu (exception gì, câu lệnh nào)? Vì sao batch không chịu được dữ liệu âm?
22. ⚠️ Ghi chú nói chênh lệch timestamp giữa hai luồng dưới 2 phút. Làm sao bạn xác nhận hai luồng chạm cùng một bản ghi trong cửa sổ đó? Log có độ chính xác tới mili giây không?
23. ⚠️ Bạn tái hiện được race này ở môi trường test không? Bằng cách nào? Nếu không, bạn chứng minh root cause bằng gì?
24. Vì sao không phát hiện bug sớm hơn? Tần suất xảy ra là bao nhiêu? Bao nhiêu bản ghi bị ảnh hưởng?
25. Dữ liệu tồn kho đã bị âm: bạn sửa dữ liệu hiện tại thế nào (script, adjust)? Ai duyệt?
26. Fix của bạn gồm: kiểm tra rows affected, ràng buộc trừ kho phụ thuộc kết quả update, kiểm tra trạng thái hợp lệ trước khi scrap. Vì sao cần cả ba? Chỉ làm một thì còn hở gì?
27. Khi rows affected = 0, API trả lỗi gì cho máy quét? Nhân viên kho thấy gì và làm gì tiếp?
28. Khi rows affected = 0, có nên retry tự động không? Retry thế nào để không scrap sai?
29. Cùng một bản ghi: scrap và Retired, thao tác nào "thắng" mới đúng nghiệp vụ? Hệ thống ra quyết định này ở đâu?
30. Fix này xử lý các thao tác khác dùng cùng cơ chế timestamp (receiving, move, adjust) không? Bạn có rà soát toàn bộ chỗ dùng `updated_at` làm điều kiện không?
31. ⚠️ Bạn nói tìm ra lỗi này nhưng làm sao biết còn bao nhiêu chỗ khác trong codebase cũng bỏ qua rows affected? Có tìm kiếm có hệ thống không?
32. Bạn có thêm test cho case này không? Test dạng nào để mô phỏng "timestamp đổi giữa lúc đọc và lúc ghi"?
33. Sau fix, có đo được kết quả (tồn kho âm giảm, batch ngừng crash) không?

## C. Case: Hot SKU / giữ tồn kho khi nhiều đơn tranh một mã hàng

34. ⚠️ Ghi chú cho thấy case Hot SKU là bạn đọc code, tài liệu và git history chứ không trực tiếp xử lý lúc sự cố. Nếu bạn nhắc đến case này, bạn khẳng định đóng góp của mình là gì?
35. Mô tả cơ chế giữ/trừ tồn kho khả dụng (available inventory) trước khi đơn xuống kho nhặt. Bạn hiểu luồng này ở mức nào?
36. Cơ chế đọc-kiểm tra-ghi (read-check-write) tách rời gây ra lỗi gì? Giải thích bằng timeline hai request.
37. Optimistic locking dùng cột `updated_at` làm version. So với cột `version` kiểu số nguyên tăng dần, ưu và nhược điểm thế nào?
   ↳ Follow-up: Độ chính xác timestamp (giây, mili giây, micro giây) ảnh hưởng thế nào? Hai update trong cùng một mili giây thì sao?
   ↳ Follow-up: Clock skew giữa các instance app nếu `updated_at` được gán ở app thay vì DB?
   ↳ Follow-up: `updated_at` có thể bị trigger/batch khác cập nhật vì lý do không liên quan, gây false conflict không?
38. Khi bị conflict (optimistic lock fail), hệ thống retry hay trả lỗi? Retry bao nhiêu lần, backoff thế nào? Với Hot SKU thì retry storm có xảy ra không?
39. Với Hot SKU, optimistic lock có thực sự tốt hơn pessimistic không? Khi contention rất cao, optimistic thất bại liên tục thì sao?
40. Có phương án nào khác để trừ tồn kho an toàn: `UPDATE inventory SET qty = qty - ? WHERE id = ? AND qty >= ?` (atomic conditional update)? So sánh với cách dùng `updated_at`.
41. Phương án `SELECT ... FOR UPDATE` cho dòng tồn kho: ưu nhược điểm, ảnh hưởng thông lượng khi nhiều đơn tranh một SKU?
42. Có thể dùng Redis (atomic decrement, Lua script) để giữ tồn kho cho Hot SKU không? Rủi ro về nhất quán với DB?
43. Có thể tuần tự hóa các request cùng SKU bằng queue/partition theo SKU không? Đánh đổi?
44. "Bán vượt tồn kho" và "tồn kho âm" khác nhau thế nào? Hệ thống chấp nhận mức nào?

## D. Case: robot AGV, xung đột tuyến đường và pessimistic lock kéo dài

45. 🔥 Kể lại case nhiều robot AGV bị stuck do tuyến đường giao nhau. Hệ thống WMS của bạn chịu trách nhiệm phần nào, phần nào thuộc về robot đối tác?
46. ⚠️ Bạn tham gia từ đầu, nhưng phần nào cụ thể do chính bạn viết (mô phỏng tuyến đường, khóa tài nguyên, nhả khóa)? Phần nào do người khác?
47. "Mô phỏng tuyến đường trước khi giao task": thuật toán tính tuyến lấy dữ liệu bản đồ/đoạn đường từ đâu? Độ chính xác so với đường robot thực sự đi?
48. Tài nguyên bị khóa ở tầng dữ liệu là gì (đoạn đường, ô vị trí, location)? Bảng/ cấu trúc nào lưu? Một task khóa bao nhiêu dòng?
49. Giữ pessimistic lock trong lúc robot di chuyển, có phải là giữ transaction DB mở suốt thời gian đó không? Hay "lock" là một bản ghi trạng thái ở tầng ứng dụng? Mô tả chính xác.
   ↳ Follow-up: Nếu là `SELECT ... FOR UPDATE` trong transaction dài, hậu quả với connection pool và vacuum?
   ↳ Follow-up: Nếu là lock bằng bản ghi (lock table), cơ chế lease/TTL và nhả khóa thế nào?
50. Khi robot timeout hoặc mất tín hiệu, cơ chế tự nhả khóa hoạt động thế nào? Timeout là bao lâu, ai quyết định con số?
51. Khóa bị nhả nhầm khi robot thật sự vẫn đang đứng ở đoạn đường đó: rủi ro vật lý, bạn xử lý thế nào?
52. Deadlock giữa các robot (A giữ đoạn 1 chờ đoạn 2, B giữ đoạn 2 chờ đoạn 1) có xảy ra không? Cách ngăn: lock theo thứ tự, lấy tất cả hoặc không lấy gì?
53. Hai task cùng xin khóa một lúc: lock acquire có atomic không? Dùng cơ chế DB nào (unique constraint, `FOR UPDATE SKIP LOCKED`, `ON CONFLICT`)?
54. Vì sao chọn pessimistic thay vì optimistic cho trường hợp tài nguyên vật lý này? Còn lựa chọn nào (scheduler tập trung, reservation table, path planning của robot vendor)?
55. Throughput nhặt hàng thay đổi thế nào sau khi khóa tuyến? Có đánh đổi nào (robot chờ lâu hơn, ít task song song hơn)?
56. Đo "tần suất stuck giảm rõ rệt" bằng gì? Có số liệu (số lần stuck/ngày) trước và sau không?
57. ⚠️ Cơ chế "robot tự phát hiện va chạm rồi dừng" bạn biết từ đâu? Bạn có quyền truy cập log của robot không? Bạn kiểm chứng giả thuyết "đường đi giao nhau" bằng chứng cứ nào?
58. Robot hoàn thành task thì gọi lại WMS (callback) hay WMS polling trạng thái? Nếu callback đến hai lần hoặc không đến thì xử lý sao?
59. Trạng thái robot trong WMS và trạng thái thật của robot bị lệch (WMS tưởng đã xong nhưng robot chưa): xử lý thế nào?
60. App WMS có nhiều instance thì lock tuyến đường có nhất quán giữa các instance không? Nó nằm ở DB hay bộ nhớ app?
61. Chỉ một số kho có robot AGV. Cơ chế này bật theo kho thế nào?

## E. Case: batch đa luồng, thread pool và connection pool

62. 🔥 Kể lại case batch đêm từ 20-30 phút lên gần 2 tiếng sau refactor do mất xử lý song song. Bạn làm phần nào trong điều tra và fix?
63. Làm sao bạn xác định batch từ song song thành tuần tự: so sánh git diff, thread dump, log thread name, APM?
64. Dữ liệu được chia partition theo tiêu chí nào (kho, danh mục, khoảng ID)? Các partition có thật sự độc lập (không ghi vào cùng bản ghi) không?
65. Nếu hai thread xử lý hai partition nhưng cùng cập nhật một bản ghi tổng hợp (ví dụ tồn kho theo SKU) thì có race không? Thiết kế tránh thế nào?
66. Thread pool dùng gì: `ThreadPoolTaskExecutor`, `ExecutorService`, `parallelStream`, `@Async`? Core/max/queue capacity ban đầu là bao nhiêu và vì sao?
67. Số thread chọn thế nào so với HikariCP `maximumPoolSize`? Mỗi worker giữ bao nhiêu connection? Công thức/độ lớn bạn dùng?
68. Quy tắc "batch không chiếm quá 50-60% pool": đo và ép buộc thế nào? Có cấu hình riêng hay chỉ là quy ước?
69. Rejection policy của executor là gì? `CallerRunsPolicy` ảnh hưởng thế nào đến thread gọi?
70. Bounded queue vs unbounded queue: rủi ro của unbounded trong batch lớn?
71. Thread nào bị exception thì xử lý thế nào? Exception trong `Future`/`CompletableFuture` có bị nuốt không? Làm sao đảm bảo job fail đúng khi một partition fail?
72. Mỗi chunk một transaction riêng: nếu 2 trong 10 chunk lỗi thì dữ liệu cuối cùng ở trạng thái gì? Có nhất quán về nghiệp vụ không?
73. ThreadLocal/`@Transactional` với thread pool: transaction có "đi theo" sang worker thread không? Bạn xử lý thế nào để mỗi worker có transaction riêng?
74. `SecurityContext`/MDC (correlation ID) trong worker thread: bị mất không? Xử lý thế nào?
75. Dùng `parallelStream()` trong batch có vấn đề gì (commonPool, không kiểm soát số luồng, blocking IO)?
76. Thread-safety: biến chia sẻ, `SimpleDateFormat`, `HashMap` dùng chung giữa thread trong batch của bạn đã gặp vấn đề chưa?
77. Sau khi thêm lại song song, kết quả batch có giống hệt bản tuần tự không? Bạn kiểm tra tính đúng đắn (không chỉ tốc độ) thế nào?
78. Vì sao 10 phút nhanh hơn 20-30 phút trước refactor? Có gì thay đổi ngoài thread (query, batch size)? Bạn xác minh nguyên nhân cải thiện thế nào?
79. Biện pháp phòng tái diễn: checklist review, performance smoke test. Bạn thực sự triển khai phần nào? Có tự động trong CI không?

## F. Case: pipeline A→B→C→D, fault masking và nhất quán trung gian

80. Kể lại case bước C sai nhưng bước D vẫn ra đúng. Case này có liên quan gì đến "data consistency" trong bullet?
81. ⚠️ Ghi chú vừa có phiên bản "chưa điều tra ra nguyên nhân" vừa có phiên bản "đã sửa dứt điểm". Case này thực tế đã kết thúc ra sao?
82. Làm sao bạn đảm bảo dữ liệu trung gian giữa các bước nhất quán (cùng snapshot) khi các bước chạy ở thời điểm khác nhau?
83. Giữa bước B (enrichment) và bước C (allocation), dữ liệu tồn kho có thể đổi do thao tác khác. Hệ thống xử lý thế nào để C không dùng dữ liệu cũ?
84. Silent fallback ở bước D: vì sao nguy hiểm với nhất quán dữ liệu? Cơ chế monitored fallback bạn thêm hoạt động thế nào?

## G. Case: phân bổ cuối ngày và cạnh tranh với API online

85. Batch allocation cuối ngày chạy khi API online vẫn đang xử lý (máy quét đang pick/ship): hai bên có tranh chấp bản ghi tồn kho không?
86. Batch lock bản ghi theo kiểu nào (lock từng dòng, lock bảng, advisory lock)? Có chặn API online không?
87. Tối ưu CTE giảm số lần chạy subquery: có thay đổi gì về cách đọc nhất quán (snapshot) không? Dữ liệu khu vực/vị trí đổi giữa chừng thì sao?
88. Batch allocation đọc tồn kho, chọn vị trí, ghi allocation: cùng một tồn kho có thể bị allocate cho hai đơn trong hai luồng song song không? Bạn ngăn thế nào?

## H. Kiến thức nền: các loại race condition và mô hình khóa

89. 🔥 Phân biệt race condition, deadlock, livelock, starvation. Cho ví dụ trong WMS.
90. Check-then-act và read-modify-write là gì? Cho ví dụ trong code tồn kho.
91. Lost update là gì? Làm sao tái hiện bằng hai transaction?
92. Pessimistic lock vs optimistic lock: khi nào dùng cái nào? Tiêu chí quyết định?
93. Optimistic lock bằng version column: cài đặt trong MyBatis (không có `@Version` như JPA) thế nào?
94. Unique constraint như một công cụ concurrency: dùng để chống bản ghi trùng thế nào? Bắt `DuplicateKeyException` ra sao?
95. Atomic update (`SET qty = qty - ?`) so với read-modify-write ở tầng ứng dụng: khác biệt gì về an toàn?
96. Compare-and-swap ở tầng DB (`UPDATE ... WHERE status = 'X'`): dùng để thực hiện state transition an toàn thế nào?
97. `SELECT ... FOR UPDATE`, `FOR SHARE`, `NOWAIT`, `SKIP LOCKED`: khác nhau thế nào? Khi nào dùng `SKIP LOCKED` (ví dụ queue công việc cho batch)?
98. PostgreSQL advisory lock (`pg_advisory_lock`, `pg_try_advisory_xact_lock`): là gì, dùng khi nào, rủi ro (session-level, pooled connection)?
99. Lock theo bản ghi vs lock theo bảng trong PostgreSQL: các mức khóa bảng (`ACCESS EXCLUSIVE`, `ROW EXCLUSIVE`...) ảnh hưởng thế nào đến DDL/batch?
100. Lock ordering: vì sao thống nhất thứ tự lấy khóa giúp tránh deadlock? Áp dụng thế nào khi update nhiều SKU trong một đơn?
101. Phát hiện deadlock trong PostgreSQL: `deadlock_timeout`, log lỗi `deadlock detected`. Ứng dụng nên xử lý ra sao khi gặp lỗi này?
102. Bạn đã từng gặp deadlock thật trong dự án chưa? Phát hiện, nguyên nhân, cách sửa?
103. Lock wait timeout (`lock_timeout`, `statement_timeout`): có cấu hình không? Giá trị nào, vì sao?
104. Phantom read, non-repeatable read, dirty read là gì? Cho ví dụ liên quan đến tồn kho.
105. 🔥 Các isolation level của PostgreSQL (`READ COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE`): khác nhau ra sao? Mặc định là gì? PostgreSQL có dirty read không?
106. Dự án dùng isolation level nào? Có thay đổi ở đâu không? Vì sao?
107. `SERIALIZABLE` trong PostgreSQL (SSI) trả về lỗi serialization failure: ứng dụng xử lý thế nào? Vì sao ít dùng?
108. MVCC giúp đọc không chặn ghi thế nào? Vì sao `READ COMMITTED` vẫn có lost update nếu viết sai?
109. Trong `READ COMMITTED`, câu `UPDATE ... WHERE` chạy lại điều kiện sau khi chờ lock (re-check) hoạt động ra sao?

## I. Spring, transaction và ranh giới nhất quán

110. 🔥 `@Transactional` hoạt động bằng proxy: những tình huống nào rollback không như mong đợi (self-invocation, checked exception, method private, catch exception nuốt lỗi)?
111. Bạn đã gặp bug transaction nào như vậy trong dự án không? Kể chi tiết (edge case nào, hệ quả gì, sửa ra sao).
112. `rollbackFor` mặc định chỉ rollback với `RuntimeException`/`Error`. Bạn đã khai báo `rollbackFor` ở đâu?
113. `Propagation.REQUIRES_NEW` trong batch: dùng để làm gì (ghi log lỗi không bị rollback)? Rủi ro (cạn connection pool, deadlock với transaction cha)?
114. Transaction bao quanh cả lời gọi hệ thống ngoài (HTTP gọi robot/ERP): vấn đề gì? Bạn thiết kế thế nào để tách?
115. `@Transactional(readOnly = true)` có tác dụng gì với PostgreSQL và pooled connection?
116. Transaction timeout: cấu hình thế nào? Transaction dài trong batch ảnh hưởng gì (lock, vacuum, bloat)?
117. Event sau commit (`@TransactionalEventListener(AFTER_COMMIT)`) dùng để làm gì? Dự án có dùng không?
118. Khi ghi DB thành công nhưng gọi hệ thống ngoài thất bại (hoặc ngược lại), trạng thái nhất quán thế nào? Bạn nghe về outbox pattern: dự án có cần không?
119. Distributed transaction giữa WMS và ERP/robot: vì sao không dùng 2PC? Dùng saga hay compensation ở đâu?
120. Exactly-once vs at-least-once vs at-most-once: hệ thống của bạn hướng tới cái nào? Làm sao đạt hiệu ứng "exactly-once" bằng idempotency?

## J. Idempotency, trùng lặp và batch nhiều instance

121. 🔥 Làm sao đảm bảo một thao tác (nhận hàng, scrap, ship confirm) không bị xử lý hai lần khi máy quét retry hoặc người dùng bấm hai lần?
   ↳ Follow-up: Dùng idempotency key lưu ở đâu, hết hạn khi nào?
   ↳ Follow-up: Hai request trùng đến cùng lúc thì ai thắng, dùng unique constraint hay lock?
   ↳ Follow-up: Request thứ hai nhận phản hồi gì?
122. Batch job chạy trên nhiều instance: làm sao chỉ một instance chạy tại một thời điểm? Lock phân tán bằng gì (ShedLock, bảng lock, Redis, advisory lock)?
123. ⚠️ Bạn có triển khai lock phân tán thật trong dự án, hay chỉ biết lý thuyết? Nếu có, mô tả cơ chế và cách xử lý khi instance giữ lock bị chết.
124. Redis lock (`SET key value NX PX`) có an toàn không? Vấn đề với lock hết hạn trước khi xử lý xong, fencing token, Redlock tranh cãi?
125. Lock lease/TTL ngắn hơn thời gian xử lý thật: hậu quả? Có gia hạn (watchdog/renew) không?
126. Batch bị crash giữa chừng: dữ liệu ở trạng thái nửa vời thế nào? Cơ chế chạy lại không tạo trùng (idempotent batch) ra sao?
127. Thiết kế xử lý theo "trạng thái" (PENDING → PROCESSING → DONE) với claim bản ghi atomically (`UPDATE ... WHERE status='PENDING' RETURNING`): ưu điểm khi nhiều worker?
128. `SKIP LOCKED` để nhiều worker lấy việc không trùng: bạn hiểu và đã dùng chưa?
129. Hai job khác nhau cùng ghi vào một bảng: quy tắc thứ tự, khóa, hoặc lịch chạy để tránh xung đột là gì?
130. Message hoặc command đến sai thứ tự (hủy đến trước tạo): hệ thống xử lý thế nào? Có sequence number/version không?
131. Command bị gửi trùng (robot/ERP gửi lại): xử lý thế nào để ghi nhận một lần?

## K. Tồn kho, nhất quán nghiệp vụ và đối soát

132. Mô hình tồn kho: on-hand, allocated, available, in-transit. Quy tắc cập nhật các số này khi receive/allocate/pick/ship là gì? Bất biến (invariant) nào luôn phải đúng?
133. Tồn kho có được lưu dạng số dư (balance) hay tính từ sổ giao dịch (ledger)? Lợi hại của từng cách với concurrency?
134. Bảng lịch sử giao dịch tồn kho (inventory transaction log) có không? Vai trò trong điều tra sai lệch?
135. Cho phép tồn kho âm hay không? Có CHECK constraint (`qty >= 0`) ở DB không? Vì sao có/không?
136. Reconciliation: có job đối soát tồn kho WMS với thực tế (cycle count) hoặc với ERP không? Phát hiện lệch thì làm gì?
137. Bạn từng điều tra một chênh lệch tồn kho thật chưa? Quy trình truy ngược từ số sai đến nguyên nhân?
138. Data mapping issue giữa hai hệ thống/module: kiểu dữ liệu, null, đơn vị, múi giờ, làm tròn. Bạn đã gặp ví dụ nào?
139. Rounding và độ chính xác số học (`BigDecimal`, làm tròn ở bước cuối) từng gây sai lệch dữ liệu trong dự án chưa? Kể case.
140. Múi giờ và "ngày nghiệp vụ" giữa các kho ở nhiều nước: sai lệch ở batch cuối ngày thế nào, tránh ra sao?

## L. Phát hiện, kiểm thử và vận hành

141. 🔥 Làm sao bạn phát hiện lỗi concurrency khi nó chỉ xảy ra hiếm hoi? Dùng log, metric, alert gì?
142. Bạn tái hiện race condition thế nào: test đa luồng, hai connection thủ công, sleep chèn vào code, công cụ tải?
143. Viết test cho concurrency thế nào để không flaky (`CountDownLatch`, `CyclicBarrier`, ExecutorService, Testcontainers PostgreSQL)?
144. Test với H2 có tái hiện được hành vi lock/isolation của PostgreSQL không? Khác biệt gì?
145. Load test hoặc stress test có dùng không (JMeter, k6, Gatling)? Kết quả cho thấy gì về contention?
146. Log để điều tra race condition: cần ghi thông tin gì (thread, transaction id, version/timestamp trước và sau, rows affected)?
147. Datadog: trace/metric/log query nào bạn dùng để lần theo hai luồng cùng đụng một bản ghi?
148. Alert nào bạn đề xuất hoặc thêm (rows affected = 0, optimistic lock conflict rate, tồn kho âm, job quá hạn)?
149. Chỉ số theo dõi sức khỏe nhất quán dữ liệu: conflict rate, retry count, deadlock count, số bản ghi stuck ở PROCESSING. Dự án có đo cái nào?
150. Phòng tái diễn: bạn có thêm convention/utility chung (ví dụ helper kiểm tra rows affected), checklist review, lint rule cho cả team không?
151. Khi review PR của member, bạn kiểm tra những gì về concurrency và transaction? Cho ví dụ cụ thể bạn từng chặn.
152. Bạn truyền đạt các bài học concurrency cho team bằng cách nào (tài liệu, share session, pair)?

## M. Phương án, đánh đổi và quyết định

153. 🔥 Với một bài toán tranh chấp bản ghi tồn kho, bạn chọn giữa optimistic lock, pessimistic lock, atomic update, unique constraint, queue tuần tự như thế nào? Tiêu chí?
154. Khi nào pessimistic lock gây nghẽn throughput? Làm sao đo?
155. Khi nào optimistic lock gây retry storm? Làm sao giảm?
156. Có nên dùng lock phân tán thay vì lock DB? Điểm yếu của lock phân tán so với DB lock?
157. Có nên chuyển các luồng ghi tồn kho sang xử lý tuần tự qua queue (single writer per SKU/warehouse) không? Đánh đổi?
158. Event sourcing hoặc ledger cho tồn kho có lợi gì với concurrency? Vì sao dự án không dùng?
159. Một fix concurrency bạn chọn mà sau này thấy chưa tối ưu: là gì và bạn sẽ đổi thế nào?
160. Làm sao quyết định mức độ "đủ tốt" khi fix concurrency trong hệ thống thật (xác suất thấp nhưng hậu quả cao)?

## N. Tình huống "nếu... thì sao"

161. Tình huống: hai nhân viên ở hai máy quét cùng scrap một kiện hàng đúng lúc nhau. Hệ thống làm gì ở từng bước? Kết quả cuối?
162. Tình huống: batch Retired chạy đúng lúc nhân viên đang ở giữa thao tác putaway cùng bản ghi. Điều gì xảy ra với code hiện tại?
163. Tình huống: hai instance cùng chạy một batch do scheduler cấu hình sai. Làm sao phát hiện nhanh và hậu quả dữ liệu?
164. Tình huống: batch crash ở chunk thứ 7 trên 20. Chạy lại thế nào để chunk 1-6 không bị tính lại?
165. Tình huống: tồn kho của một SKU hot bị âm 3 lần trong tuần. Quy trình điều tra của bạn từ đầu?
166. Tình huống: sau fix rows affected, tỷ lệ lỗi "update không match" tăng đột ngột ở production. Bạn đánh giá đây là tốt hay xấu? Làm gì tiếp?
167. Tình huống: kho A chưa deploy bản fix, kho B đã deploy. Dữ liệu và hành vi hai kho khác nhau ra sao, xử lý thế nào?
168. Tình huống: bạn cần thêm unique constraint lên bảng lớn đang chạy production. Dữ liệu cũ đã có trùng. Làm thế nào an toàn (`CREATE INDEX CONCURRENTLY`, dọn trùng, downtime)?
169. Tình huống: một query `SELECT ... FOR UPDATE` làm API máy quét bị treo ở peak. Bạn xử lý thế nào ngay và về lâu dài?
170. Tình huống: sau khi thêm lock, deadlock xuất hiện ở production. Bạn phân tích và sửa thế nào?
171. Tình huống: client retry khi thấy lỗi optimistic lock, nhưng lần retry trước thực ra đã thành công một phần. Làm sao tránh xử lý trùng?
172. Tình huống: yêu cầu thêm tính năng mới làm thay đổi cùng bản ghi ở ba luồng khác nhau. Bạn rà soát rủi ro concurrency thế nào trước khi code?

## O. Hành vi và phản tư

173. STAR: kể một lần bạn chẩn đoán sai root cause của vấn đề concurrency/consistency. Sai ở đâu, bạn sửa cách làm thế nào?
174. STAR: kể một lần bạn thuyết phục team/BA chấp nhận giải pháp có đánh đổi (chặn thao tác, thêm lỗi cho người dùng) để bảo vệ dữ liệu.
175. STAR: kể một lần bạn bị áp lực release nhưng vẫn không chấp nhận bỏ qua rủi ro dữ liệu.
176. Điều gì bạn thấy khó nhất khi xử lý concurrency trong môi trường có phần cứng (robot, máy quét) khác với hệ thống thuần phần mềm?
177. Nếu làm lại toàn bộ cách bảo vệ nhất quán dữ liệu của hệ thống (lock, transaction, idempotency, giám sát), bạn sẽ thiết kế khác thế nào?
178. Bài học lớn nhất của bạn về "optimistic lock chỉ hiệu quả khi tầng gọi kiểm tra kết quả" có thể áp dụng cho những chỗ nào khác trong hệ thống?
179. Có vấn đề consistency nào bạn biết còn tồn tại trong hệ thống nhưng chưa được xử lý? Bạn đánh giá rủi ro thế nào?
180. Nếu vào công ty mới có hệ thống tương tự, trong tuần đầu bạn sẽ rà soát những điểm rủi ro concurrency nào trước?
