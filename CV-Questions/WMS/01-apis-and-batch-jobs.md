# Câu hỏi phỏng vấn: APIs và batch jobs cho WMS (15 kho, nhiều quốc gia)

> Developed APIs and batch jobs for a warehouse management system used by a global fashion retailer across 15 warehouses in multiple countries, covering goods receiving, returns and shipping orders out to retail stores.

Chú thích: 🔥 = xác suất bị hỏi cao / dễ bị đào sâu. ⚠️ = câu bẫy kiểm tra độ thật / độ chính xác của claim trong CV.

---

## A. Xác minh phạm vi đóng góp và claim trong CV

1. 🔥 Bạn giới thiệu ngắn gọn bullet này: bạn thực sự làm gì trong hệ thống WMS này?
   ↳ Follow-up: Trong "Developed APIs and batch jobs", bạn viết từ đầu hay chủ yếu sửa/mở rộng code có sẵn?
   ↳ Follow-up: Bạn tham gia từ giai đoạn build mới hay giai đoạn bảo trì?
   ↳ Follow-up: Nếu phải ước lượng, bao nhiêu phần trăm thời gian của bạn là API, bao nhiêu là batch, bao nhiêu là fix bug?
2. ⚠️ "Used by a global fashion retailer across 15 warehouses": con số 15 từ đâu ra? Bạn tự đếm hay nghe từ ai? Có phải mỗi kho là một app riêng không?
   ↳ Follow-up: 15 kho ở những quốc gia nào, bạn có làm việc với kho nào cụ thể?
   ↳ Follow-up: Mỗi kho có dùng cùng một codebase không, hay mỗi kho một nhánh/cấu hình?
3. ⚠️ "Global fashion retailer" là ai? Bạn có được nói tên khách hàng không, hay chỉ biết qua tài liệu? Bạn tiếp xúc trực tiếp với khách hàng ở mức nào?
4. ⚠️ Bạn viết "covering goods receiving, returns and shipping orders out to retail stores": bạn phụ trách cả ba luồng hay chỉ một luồng? Luồng nào bạn rành nhất?
5. ⚠️ Hãy kể tên 3 API cụ thể bạn đã tự viết (tên endpoint, request, response, bảng đụng tới).
6. ⚠️ Hãy kể tên 3 batch job cụ thể bạn đã tự viết hoặc sửa: job làm gì, chạy khi nào, đọc/ghi bảng nào?
7. Có API/batch nào bạn viết hoàn toàn dựa trên Function Design mà không phải suy nghĩ thêm không? Vậy đóng góp kỹ thuật riêng của bạn là gì?
8. Có API/batch nào bạn thấy FD thiếu hoặc sai rồi phải bổ sung/sửa không? Kể một ví dụ.
9. Trong team, ai viết phần inbound, ai viết returns, ai viết outbound? Ranh giới code giữa các phần ra sao?
10. Bạn là Sub Lead: phần API/batch trong bullet này là bạn tự code hay bạn chỉ review? Tỷ lệ giữa code và review thế nào?
11. ⚠️ Bullet không có con số nào (số đơn, số API, throughput). Vì sao? Nếu phải điền số, bạn điền gì và chứng minh ra sao?
12. Bạn bắt đầu dự án từ Dec 2024; sau bao lâu bạn tự viết được API đầu tiên đưa lên production? API đó là gì?
13. Ngoài code, bạn còn làm gì với các API/batch này (viết tài liệu, hỗ trợ UAT, trực production)?
14. Nếu mình gọi leader/BA của bạn hỏi về phần bạn làm trong bullet này, họ sẽ xác nhận điều gì?

## B. Bức tranh nghiệp vụ tổng thể

15. 🔥 Vẽ lại giúp mình luồng nghiệp vụ từ nhận hàng (receiving) đến xuất hàng cho cửa hàng (shipping to stores) trong kho thời trang.
16. Khách hàng thời trang có đặc thù gì về hàng hóa (SKU theo size/màu, mùa vụ, hàng treo/hàng gấp) ảnh hưởng đến thiết kế WMS?
17. Một SKU trong hệ thống được định danh thế nào (SKU, barcode, style-color-size)? Một barcode có thể ứng với nhiều SKU không?
18. Đơn vị tồn kho trong hệ thống là gì: item, carton, pallet, LPN? Quan hệ giữa các cấp đóng gói?
19. Hệ thống WMS này nhận dữ liệu gốc (ASN, PO, đơn bán, đơn bổ sung cửa hàng) từ đâu? Hệ thống nào là "source of truth" của tồn kho?
20. "Retail stores" ở đây: là các cửa hàng của chính nhà bán lẻ. Đơn đến từ replenishment tự động hay cửa hàng đặt thủ công?
21. Kho phục vụ cả e-commerce hay chỉ cấp hàng cho cửa hàng? Bullet nói chỉ "retail stores", vậy có online order không?
22. Mỗi kho khác nhau chỗ nào về nghiệp vụ (có robot AGV, không có robot, khác nước, khác luật hải quan)?
23. Những khác biệt giữa các kho được xử lý trong code thế nào: tách app, cấu hình, hay `if (warehouse == ...)`?
24. Người dùng cuối của API/batch của bạn là ai: nhân viên kho dùng máy quét tay, supervisor, hệ thống ERP, hay hệ thống khác?
25. Có SLA nghiệp vụ nào (cut-off time, giờ xe tải đến, giờ ca sáng) ảnh hưởng đến thiết kế batch/API của bạn không?

## C. Goods receiving (inbound)

26. 🔥 Quy trình goods receiving từ lúc xe hàng đến dock đến lúc hàng "available" để bán: có những bước nào?
27. ASN (Advance Shipping Notice) là gì? ASN đến hệ thống bằng cách nào (API, file, batch)? Nếu không có ASN thì nhận hàng thế nào (blind receiving)?
28. Receiving theo PO, theo ASN, theo carton, theo item: khác nhau ra sao? Hệ thống của bạn hỗ trợ cái nào?
29. Số lượng thực nhận khác số lượng trên ASN (thiếu, dư, sai SKU) thì xử lý thế nào? Có ngưỡng dung sai (tolerance) không?
30. Hàng nhận về vào vị trí nào? Putaway do hệ thống chỉ định hay nhân viên chọn? Có tích hợp robot không?
31. Receiving có sinh ra biến động tồn kho ngay hay sau khi hoàn tất putaway? Trạng thái tồn kho (on-hand, available, quarantine) thay đổi thế nào?
32. Hàng nhận về bị hư hỏng hoặc cần QC thì luồng đi ra sao?
33. API receiving của bạn nhận payload gì từ máy quét? Một request là một carton, một item, hay một lô?
34. Nếu máy quét mất mạng giữa chừng rồi gửi lại cùng một lần quét, hệ thống phân biệt thế nào để không nhận trùng?
35. Làm sao đảm bảo một carton không bị nhận hai lần ở hai máy quét khác nhau cùng lúc?
36. Validation nào bạn viết ở API receiving (tồn tại PO, SKU thuộc PO, vượt số lượng đặt, hạn dùng/lô)? Validation đặt ở controller, service hay DB constraint?
37. Receiving hoàn tất thì có gửi thông báo/ghi nhận ngược về ERP không? Gửi đồng bộ hay bất đồng bộ? Nếu gửi lỗi thì sao?
38. Có batch nào gắn với receiving (đóng PO tự động, tính số lượng chênh lệch, báo cáo cuối ngày) không? Nó chạy thế nào?
39. Một lần nhận hàng lớn (hàng chục nghìn item trong một container) thì API/batch xử lý ra sao để không timeout?
40. Receiving có phải cập nhật nhiều bảng trong một transaction (receipt, receipt line, inventory, location, history) không? Bạn quản lý ranh giới transaction thế nào?

## D. Returns

41. 🔥 Có những loại returns nào trong nghiệp vụ này (store return về kho, hàng lỗi, hàng thu hồi, hàng thừa cuối mùa)? Bạn làm loại nào?
42. Luồng returns từ cửa hàng về kho: ai khởi tạo, dữ liệu đi qua những hệ thống nào, kho xử lý ra sao?
43. Return nhận về kho thì hàng đi đâu: quay về kho bán, sang khu kiểm tra, hay hủy? Quy tắc phân loại đặt ở đâu (FD, bảng cấu hình, code)?
44. Returns khác receiving thông thường ở chỗ nào về mặt dữ liệu và validation?
45. Số lượng trả vượt số lượng đã gửi cho cửa hàng thì hệ thống xử lý thế nào? Bạn lưu lịch sử gửi/trả ở đâu để đối chiếu?
46. Hàng trả về có trạng thái chất lượng (grade A/B, defective). Tồn kho theo trạng thái được mô hình hóa ra sao?
47. Return có làm thay đổi tồn kho của kho và tồn kho tính cho cửa hàng không? Ai là source of truth?
48. Một return bị quét hai lần hoặc nhân viên hủy sau khi đã quét thì xử lý thế nào?
49. Có batch nào cho returns (gom return cuối ngày, tạo báo cáo, đẩy dữ liệu về ERP) không? Bạn chọn batch thay vì API realtime vì lý do gì?
50. Có return nào liên quan đến mã kiện cũ/mới, hàng đã bị "retired" hay đã scrap không? Bạn có từng gặp loại case này?
51. Returns có đặc thù theo quốc gia (thuế, hải quan, luật trả hàng) mà code phải xử lý không?

## E. Shipping orders out to retail stores (outbound)

52. 🔥 Luồng xuất hàng từ đơn của cửa hàng đến lúc xe rời kho: order → allocation → wave/pick → pack → load → ship. Bạn tham gia bước nào?
53. Allocation (phân bổ tồn kho cho đơn) làm gì? Chạy realtime hay batch? Tiêu chí chọn vị trí/lô để lấy hàng là gì?
54. Allocation cuối ngày chạy hàng nghìn đơn: bạn nhớ job này không? Bạn có tham gia tối ưu không, và tối ưu cụ thể phần nào?
55. Đơn thiếu hàng (short) thì xử lý thế nào: backorder, split, hủy dòng, thông báo cửa hàng?
56. Wave planning là gì? Gom đơn vào wave theo tiêu chí nào? Có batch tạo wave không?
57. Picking có liên quan robot AGV ở một số kho. API giao task cho robot do bạn viết hay do module khác? Bạn tương tác thế nào với hệ thống của robot?
58. Packing: đóng carton, tính số carton, tính kích thước pallet. Bạn có chạm tới logic đóng gói/pallet không?
59. Pallet hóa và chọn loại xe: logic nằm ở đâu, bạn có từng sửa không?
60. Shipping confirm làm gì: trừ tồn kho on-hand, đóng đơn, gửi ASN cho cửa hàng, gửi sự kiện cho vận chuyển? Thứ tự các bước thế nào?
61. Nếu shipping confirm thành công ở WMS nhưng gửi thông tin sang ERP/đối tác vận chuyển thất bại thì xử lý ra sao?
62. Cut-off time để kịp xe tải: batch nào bị ràng buộc bởi cut-off? Nếu batch trễ thì quy trình ứng phó là gì?
63. Hủy đơn hoặc thay đổi đơn sau khi đã allocate/pick thì hệ thống xử lý thế nào? Hủy đến sau khi hàng đã đóng thùng?
64. Đơn xuất cho cửa hàng ở nước khác có thêm bước chứng từ/hải quan không? Có gì ảnh hưởng đến API của bạn?
65. Tracking trạng thái đơn: có state machine không? Các trạng thái và chuyển trạng thái hợp lệ được kiểm soát ở đâu?
66. Làm sao biết một đơn "đang kẹt" ở bước nào? Có API/báo cáo nào bạn làm để vận hành xem không?

## F. Multi-warehouse và đa quốc gia

67. 🔥 Mỗi kho một app: vậy 15 kho có 15 deployment, 15 database? Vì sao chọn mô hình này? Ưu nhược điểm?
   ↳ Follow-up: Một bug fix phải đưa lên bao nhiêu app? Quy trình ra sao?
   ↳ Follow-up: Thay đổi schema DB áp cho từng kho thế nào, có lệch phiên bản schema giữa các kho không?
   ↳ Follow-up: Nếu làm lại bạn có gom thành multi-tenant không? Cân nhắc gì?
68. Cấu hình theo kho (múi giờ, đơn vị đo, locale, ngày nghỉ, cut-off) lưu ở đâu: file config, bảng DB, biến môi trường?
69. Múi giờ: kho ở nhiều nước, batch "cuối ngày" tính theo giờ nào? Timestamp lưu UTC hay local? Từng gặp bug múi giờ chưa?
70. Đơn vị đo (cm/inch, kg/lb) và tiền tệ khác nhau theo nước: xử lý ở tầng nào, có bug liên quan không?
71. Ngôn ngữ/locale của message lỗi, nhãn in (label) có ảnh hưởng đến API của bạn không?
72. Batch của các kho chạy lúc nào để không đè lên giờ cao điểm của từng kho (khác múi giờ)?
73. Khi một kho cần tính năng mới mà kho khác chưa sẵn sàng thì code API/batch xử lý thế nào (feature flag, cấu hình, nhánh riêng)?
74. Bạn từng làm một yêu cầu chỉ áp dụng cho một kho cụ thể chưa? Thiết kế sao để không ảnh hưởng kho khác?
75. Dữ liệu master (SKU, cửa hàng, location) đồng bộ giữa các kho thế nào? Có kho nào dữ liệu master lệch không?
76. Có báo cáo/giám sát tổng hợp xuyên 15 kho không? Dữ liệu lấy từ đâu khi mỗi kho một DB?

## G. Thiết kế và triển khai API

77. 🔥 Mô tả cấu trúc một API điển hình bạn viết: controller → service → mapper → bảng; DTO/VO/entity; validation; exception handling.
78. REST của bạn đặt tên endpoint, chọn HTTP method, status code thế nào? Có chuẩn nào của dự án không?
79. Format response và format lỗi thống nhất ra sao? Lỗi nghiệp vụ và lỗi hệ thống phân biệt thế nào?
80. Validation request: dùng Bean Validation (`@Valid`, `@NotNull`) hay tự kiểm tra? Validation nghiệp vụ nằm ở đâu?
81. 🔥 API ghi dữ liệu có idempotent không? Client (máy quét) retry thì sao? Dùng idempotency key hay cách nào khác?
82. Versioning API: có không, nếu đổi contract thì client là máy quét/hệ thống khác bị ảnh hưởng thế nào?
83. Authentication/authorization cho API: ai gọi, dùng cơ chế gì (token, API key, mTLS)? Phân quyền theo kho thế nào?
84. Pagination: offset hay cursor? Với danh sách lớn (tồn kho, lịch sử giao dịch) có vấn đề gì?
85. API tìm kiếm/lọc nhiều điều kiện: bạn xây SQL động bằng MyBatis thế nào? Có rủi ro SQL injection khi dùng `${}` không?
86. API nào nặng nhất bạn từng viết hoặc sửa? Nó chạy bao lâu, bạn đo bằng gì?
87. Timeout: API dành cho máy quét cần phản hồi trong bao lâu? Khi quá chậm, nhân viên kho thấy gì?
88. API gọi hệ thống ngoài (ERP, robot, carrier): timeout, retry, circuit breaker, fallback đặt thế nào?
89. Dùng RestTemplate, WebClient hay Feign? Vì sao? Cấu hình connection pool, timeout cho client này ra sao?
90. API bulk (nhận nhiều dòng một request): giới hạn kích thước, xử lý lỗi từng phần (partial failure) thế nào?
91. Một API ghi chạm nhiều bảng: bạn đảm bảo atomic thế nào? Nếu lỗi giữa chừng thì trạng thái dữ liệu ra sao?
92. Có API đồng bộ nào bạn chuyển sang bất đồng bộ không? Vì sao và dùng cơ chế gì?
93. API tài liệu hóa bằng Swagger/OpenAPI hay tài liệu FD? Ai giữ contract với client?
94. Bạn có từng thay đổi contract API làm hỏng client (máy quét, hệ thống khác) chưa? Phát hiện thế nào?
95. Logging ở API: log gì, không log gì (dữ liệu nhạy cảm)? Có correlation ID/trace ID không?
96. Rate limit hoặc bảo vệ API khỏi bị gọi dồn dập (ví dụ máy quét lỗi gửi lặp) có không?
97. Với API trả danh sách lớn cho màn hình/máy quét, bạn tránh lấy dư dữ liệu và tránh N+1 thế nào?

## H. Thiết kế và triển khai batch job

98. 🔥 Liệt kê các loại batch job trong WMS này (allocation, đối soát tồn kho, đóng PO, đồng bộ master, báo cáo, retire dữ liệu). Bạn làm cái nào?
99. Batch của bạn chạy bằng gì: Spring Batch, `@Scheduled`, Quartz, cron ở hệ điều hành, hay scheduler bên ngoài? Vì sao?
100. 🔥 Trong ngữ cảnh mỗi kho một app, batch chạy trên mấy instance? Nếu app có nhiều instance thì batch tránh chạy đôi thế nào?
101. Batch xử lý theo chunk hay theo từng bản ghi? Cỡ chunk chọn thế nào, đo ra sao?
102. Transaction của batch: một transaction cho cả job, cho từng chunk, hay từng bản ghi? Vì sao?
103. Batch lỗi giữa chừng thì chạy lại thế nào (restart, resume, rerun toàn bộ)? Chạy lại có an toàn (idempotent) không?
104. Lỗi trên một bản ghi: skip, retry hay fail cả job? Bản ghi lỗi lưu ở đâu, ai xử lý?
105. Làm sao theo dõi trạng thái job (bảng job history, log, Datadog)? Ai nhận alert khi job lỗi hoặc chạy quá lâu?
106. Job chạy lâu có ảnh hưởng API online (lock, tải DB, connection pool) không? Bạn xử lý ra sao?
107. Đọc dữ liệu lớn trong batch: dùng cursor/streaming, phân trang theo khóa, hay load hết? Tránh OOM thế nào?
108. Batch ghi dữ liệu lớn: batch insert/update bằng MyBatis `ExecutorType.BATCH`, `foreach` insert, hay cách khác? Cỡ batch bao nhiêu?
109. Thứ tự và phụ thuộc giữa các job (job B phải chạy sau job A): quản lý thế nào? Nếu A trễ thì B làm gì?
110. Tham số và ngày nghiệp vụ (business date) của batch lấy từ đâu? Chạy bù cho ngày cũ thế nào?
111. Có tình huống batch chạy chồng lên chính nó (lần trước chưa xong, lần sau đã đến giờ) không? Xử lý sao?
112. Bạn từng tối ưu một batch chưa? Kể: chậm ở đâu, đo thế nào, sửa gì, kết quả bao nhiêu.
113. Từng gặp batch chạy xong nhưng dữ liệu sai (thiếu bản ghi, tính trùng) chưa? Phát hiện bằng cách nào?
114. Batch có xử lý đa luồng không? Nếu có, thread pool cấu hình thế nào và liên hệ với connection pool ra sao?
115. Test batch như thế nào (dữ liệu mẫu, môi trường staging, so sánh kết quả trước/sau)?

## I. Spring Boot (kiến thức nền)

116. Spring Boot auto-configuration hoạt động thế nào? `@SpringBootApplication` gồm những annotation nào?
117. Dependency Injection: constructor injection vs field injection, vì sao nên chọn constructor?
118. Bean scope mặc định là gì? Bean singleton có thread-safe không? Có từng gặp lỗi do state trong singleton bean?
119. `@Transactional` hoạt động thế nào (proxy)? Khi nào không có tác dụng (self-invocation, method private, checked exception)?
120. Propagation `REQUIRED` và `REQUIRES_NEW` khác nhau ra sao? Khi nào dùng cái nào trong batch?
121. `@Scheduled` chạy ở thread nào? Hai job `@Scheduled` có chạy song song được không? Cấu hình thế nào?
122. Xử lý exception thống nhất bằng `@ControllerAdvice`/`@ExceptionHandler`: bạn thiết kế thế nào?
123. Cấu hình theo profile (`application-{profile}.yml`), `@ConfigurationProperties`, externalized config: dự án dùng thế nào cho nhiều kho?
124. Filter vs Interceptor vs AOP: khác nhau ra sao, dự án có dùng cho logging/correlation ID không?
125. Connection pool mặc định của Spring Boot là gì (HikariCP)? Các tham số quan trọng nào bạn biết?
126. Actuator: bạn dùng health check, metric nào? Có custom health indicator cho batch không?

## J. MyBatis (kiến thức nền)

127. 🔥 Vì sao dự án dùng MyBatis thay vì JPA/Hibernate? Khi nào MyBatis gây khó, khi nào có lợi?
128. `#{}` và `${}` khác nhau thế nào? Khi nào buộc phải dùng `${}`, rủi ro ra sao?
129. Mapper XML vs annotation: dự án dùng cái nào, vì sao?
130. Dynamic SQL (`<if>`, `<choose>`, `<foreach>`, `<where>`, `<set>`): bạn từng viết SQL động phức tạp nào? Lỗi thường gặp?
131. `resultMap`, `association`, `collection`: dùng thế nào? N+1 query phát sinh ra sao với MyBatis và cách tránh?
132. Cache cấp 1 (SqlSession) và cấp 2 của MyBatis: khác nhau thế nào? Có bật cache cấp 2 không, rủi ro gì với dữ liệu tồn kho?
133. `SqlSession` lifecycle trong Spring (`SqlSessionTemplate`) và transaction: liên hệ ra sao?
134. Batch executor trong MyBatis: dùng thế nào, gotcha gì (flush, trả về số dòng ảnh hưởng)?
135. Mapping kiểu dữ liệu: `TypeHandler` là gì, bạn từng viết chưa? Xử lý `null`, `BigDecimal`, `LocalDateTime`, enum thế nào?
136. Phân trang trong MyBatis: dùng PageHelper hay tự viết `LIMIT/OFFSET`? Vấn đề với offset lớn?
137. Insert trả về khóa sinh tự động (`useGeneratedKeys`) với PostgreSQL: dùng sequence hay identity?
138. Update trả về số dòng ảnh hưởng: bạn dùng thông tin này ở đâu trong code? Có kiểm tra chưa?
139. So sánh thực tế bạn từng dùng Hibernate (dự án trước) và MyBatis: bạn thấy khác biệt lớn nhất khi viết API/batch ở WMS là gì?

## K. PostgreSQL (kiến thức nền)

140. Index B-tree, composite index, partial index: khi nào dùng? Thứ tự cột trong composite index quyết định gì?
141. Đọc `EXPLAIN` / `EXPLAIN ANALYZE`: bạn nhìn những chỉ số nào (Seq Scan, Index Scan, cost, rows, actual time)?
142. Khi nào PostgreSQL bỏ qua index dù đã tạo (hàm trên cột, kiểu không khớp, thống kê cũ, bảng nhỏ)?
143. MVCC trong PostgreSQL là gì? `VACUUM`, bloat, dead tuple liên quan thế nào tới bảng tồn kho bị update liên tục?
144. CTE (`WITH`) trong PostgreSQL: từ phiên bản 12 materialization khác trước thế nào? `MATERIALIZED` / `NOT MATERIALIZED`?
145. Window function (`ROW_NUMBER`, `SUM() OVER`) có dùng trong báo cáo/allocation không? Cho ví dụ.
146. `INSERT ... ON CONFLICT` (upsert): dùng khi nào trong batch? Rủi ro?
147. Kiểu dữ liệu timestamp (`timestamp` vs `timestamptz`) và múi giờ: dự án lưu thế nào?
148. Khóa ngoại và constraint: dự án có dùng nhiều không hay kiểm tra ở tầng ứng dụng? Vì sao?
149. Partitioning bảng lịch sử giao dịch kho: có không? Khi nào cần?
150. Connection pooling phía DB (PgBouncer) và giới hạn `max_connections` với 15 app: có liên quan không?

## L. Redis và cache

151. ⚠️ Stack ghi Redis: Redis trong dự án này dùng vào việc gì? Phần nào trong bullet "APIs và batch jobs" dùng Redis? Bạn trực tiếp viết hay chỉ dùng thư viện có sẵn?
   ↳ Follow-up: Nếu không dùng Redis cho bullet này, vì sao đưa vào stack?
   ↳ Follow-up: Cache cái gì, key thiết kế ra sao, TTL bao lâu, invalidate thế nào?
152. Cache master data (SKU, location) bằng Redis hay local cache? Nhiều instance thì dữ liệu lệch thế nào?
153. Cache stampede, cache penetration, cache avalanche là gì? Dự án có gặp không?
154. Redis down thì API/batch của bạn phản ứng thế nào (fallback về DB, lỗi)?
155. Dữ liệu tồn kho có nên cache không? Vì sao có/không?

## M. Tích hợp hệ thống và dữ liệu

156. Những hệ thống nào API/batch của bạn trao đổi dữ liệu (ERP, robot/AGV, carrier, hệ thống kho cũ, cửa hàng)? Theo hướng nào?
157. Giao tiếp bằng REST, file (CSV/XML), hay message queue? Vì sao chọn cách đó cho từng hệ thống?
158. Import file lớn từ ERP (master, đơn hàng): định dạng, validation, xử lý dòng lỗi, báo cáo kết quả thế nào?
159. Mapping dữ liệu giữa WMS và hệ thống khác (mã SKU, mã kho, đơn vị): bảng mapping lưu đâu? Từng sai mapping chưa?
160. Dữ liệu lệch giữa WMS và ERP: phát hiện bằng gì? Có job đối soát (reconciliation) không?
161. Gửi dữ liệu sang hệ thống ngoài thất bại: retry thế nào, lưu hàng đợi lỗi ở đâu, ai xử lý lại?
162. Có cần outbox pattern cho các luồng ghi DB + gửi hệ thống ngoài không? Dự án hiện làm thế nào?
163. Khi hệ thống ngoài thay đổi contract mà không báo trước, bạn phát hiện và ứng phó thế nào?

## N. Hiệu năng, chất lượng, vận hành

164. 🔥 Kể một lần bạn tối ưu hiệu năng API/query/batch trong dự án: triệu chứng, đo đạc, nguyên nhân, cách sửa, kết quả trước/sau.
165. Bạn dùng công cụ gì để phát hiện chậm (Datadog APM, slow query log, `EXPLAIN`)? Metric/trace nào hữu ích nhất?
166. Một query tối ưu bằng CTE thay subquery lặp: tại sao CTE nhanh hơn, và trong PostgreSQL có luôn như vậy không?
167. Vì sao không chỉ thêm index mà chọn đổi cách viết query trong trường hợp trên? Hai cách giải quyết khác bản chất ở đâu?
168. Quy mô dữ liệu: bảng lớn nhất có bao nhiêu bản ghi? Query nào trên bảng đó thường chậm?
169. Test: bạn viết unit test và integration test cho API/batch thế nào? Dùng Testcontainers/H2/DB thật? Coverage bao nhiêu?
170. Môi trường: dev, test, UAT, production. Bạn có quyền production không? Khi có defect production, bạn điều tra thế nào?
171. Bạn từng xử lý một production defect thuộc API hoặc batch của chính bạn chưa? Kể chi tiết.
172. Sau khi release, bạn theo dõi chất lượng API/batch thế nào (error rate, latency, job duration)?
173. Dữ liệu production sai cần sửa: bạn viết script sửa không? Ai duyệt, kiểm soát rủi ro ra sao?
174. Release: quy trình đưa thay đổi API/batch lên 15 kho; có release theo từng kho (dần dần) không? Rollback thế nào?
175. Quản lý thay đổi schema DB khi API/batch đổi (Flyway/Liquibase/script)? Backward compatibility khi nhiều kho chạy nhiều phiên bản?

## O. Hành vi, tình huống và phản tư

176. Tình huống: sáng thứ Hai, batch đêm của một kho chạy xong nhưng số liệu tồn kho sai. Bạn điều tra từ đâu, trong 30 phút đầu?
177. Tình huống: một API receiving đột nhiên chậm gấp 10 lần ở một kho duy nhất. Bạn nghĩ tới những nguyên nhân nào?
178. Tình huống: cut-off còn 1 tiếng, batch allocation chưa xong và đang chạy rất chậm. Bạn làm gì?
179. Tình huống: BA yêu cầu thêm một trường vào API nhưng client máy quét ở vài kho chưa cập nhật. Bạn thiết kế thế nào?
180. Tình huống: khách hàng yêu cầu thay đổi logic returns gấp trước ngày release. Bạn thương lượng và đánh giá rủi ro ra sao?
181. STAR: kể một lần bạn bất đồng với FD hoặc với BA về cách xử lý một API/batch. Kết quả?
182. STAR: kể một lỗi bạn gây ra trong API hoặc batch và cách bạn khắc phục, rút kinh nghiệm.
183. STAR: kể một lần bạn review PR của member và chặn một lỗi nghiêm trọng liên quan API/batch.
184. Nếu được làm lại phần API/batch của dự án này, bạn sẽ đổi điều gì về thiết kế, công cụ hay quy trình?
185. Điều bạn học được lớn nhất về nghiệp vụ kho vận (WMS) qua dự án này là gì mà trước đây bạn không biết?
