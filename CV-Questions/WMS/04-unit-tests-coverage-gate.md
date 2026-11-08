> Wrote unit tests for each API and batch job from its design spec, covering all code paths; the project's 90% coverage gate is required to merge and release.

## A. Xác minh phạm vi và claim trong CV

1. 🔥 ⚠️ "Each API and batch job": bạn viết unit test cho tất cả API và batch job của cả dự án, hay chỉ những cái bạn tự code? Khoảng bao nhiêu API và bao nhiêu job?
   ↳ Follow-up: Ai viết test cho phần code của các member khác? Bạn có review test của họ không?
2. 🔥 ⚠️ "Covering all code paths": tất cả đường đi nghĩa là 100% line, 100% branch, hay tất cả nhánh nghiệp vụ trong spec? Có thật sự đạt 100% không?
   ↳ Follow-up: Phần nào không phủ được và vì sao? Cho ví dụ cụ thể.
3. ⚠️ "90% coverage gate is required to merge and release": gate này do ai đặt (khách hàng, kiến trúc sư, team)? Áp dụng cho toàn project, từng module, hay từng PR?
4. ⚠️ Bạn đã tự thiết lập gate này hay chỉ tuân thủ? Nếu tuân thủ thì bạn có đóng góp gì vào cấu hình nó?
5. Con số 90% tính trên chỉ số nào: line, branch, instruction, method, class? Dự án đặt ngưỡng cho chỉ số nào?
6. Gate này chặn ở bước nào: PR check, CI build, bước release? Nếu dưới 90% thì cái gì xảy ra chính xác (build fail, không merge được)?
7. Bạn có từng bị gate chặn không? Kể một lần cụ thể và bạn đã xử lý thế nào.
8. Test viết "from its design spec": bạn có thể nói rõ Function Design (FD) gồm những phần nào mà bạn dùng để suy ra test case?
9. Bạn viết test trước hay sau khi code? Bạn có thật sự suy ra test từ spec trước khi nhìn code không?
10. Coverage trung bình hiện tại của project và của module bạn là bao nhiêu? Bạn xem báo cáo ở đâu?
11. Có phần nào được loại trừ khỏi coverage (DTO, config, entity, mapper interface, `Application`)? Danh sách loại trừ do ai quyết định và có hợp lý không?
12. Bạn có test cho cả phần code của AI sinh ra (AI workflow harness) không? Test do AI sinh hay do bạn viết?
13. Tỷ lệ thời gian dành cho viết test so với viết code là bao nhiêu? Có làm chậm tiến độ không?
14. Là Sub Lead, bạn yêu cầu member viết test như thế nào? Có checklist test trong PR template không?

## B. Thiết kế test case từ design spec

15. 🔥 Quy trình bạn đọc FD của một API và suy ra danh sách test case là gì? Cho ví dụ từ một API thật (không cần số liệu nhạy cảm).
   ↳ Follow-up: Bạn trình bày test case ở đâu (comment, test plan, bảng)? Có ai duyệt danh sách test case không?
16. Bạn dùng kỹ thuật nào: phân vùng tương đương (equivalence partitioning), giá trị biên (boundary value), bảng quyết định (decision table), chuyển trạng thái? Ví dụ áp dụng?
17. Với logic có nhiều điều kiện tổ hợp (ví dụ chọn vị trí kho theo nhiều quy tắc), bạn thiết kế test thế nào để không bùng nổ tổ hợp?
18. FD thiếu hoặc mơ hồ ở nhánh lỗi/ngoại lệ thì bạn xử lý thế nào? Bạn có hỏi lại BA không?
19. Bạn có gặp lỗi trong FD (mâu thuẫn, thiếu) nhờ việc viết test không? Kể một ví dụ.
20. Test case bao phủ các giá trị `null`, rỗng, danh sách rỗng, giá trị âm, số lượng 0, chuỗi toàn khoảng trắng như thế nào?
21. Test cho phần tiền/số lượng/đơn vị/làm tròn: bạn kiểm tra biên làm tròn thế nào (ví dụ làm tròn ở bước trung gian như case tính pallet)?
22. Test cho thời gian/múi giờ: bạn xử lý `Clock`, `LocalDateTime.now()` trong test thế nào để ổn định?
23. Test cho trạng thái chuyển đổi (state machine) của đơn/kiện hàng: bạn phủ các chuyển trạng thái hợp lệ và không hợp lệ ra sao?
24. Test các ràng buộc nghiệp vụ như "mã kiện hàng đã Retired thì không được scrap": bạn thiết kế test đó thế nào?
25. Với đoạn code `if/else` lồng nhiều tầng, bạn đếm cyclomatic complexity hay nhìn sơ đồ để chắc phủ hết đường đi không?
26. Có nhánh code "không thể xảy ra" (defensive code, `default` của switch) – bạn có test không? Nên test không?
27. Test trường hợp lỗi: exception ném ra, thông điệp lỗi, mã lỗi trả về theo định dạng thống nhất của project.
28. Test validation đầu vào (Bean Validation, `@Valid`) nằm ở unit test hay test controller?
29. Test cho phần phân quyền/ vai trò người dùng (nếu có): làm thế nào?

## C. "All code paths": line, branch và giới hạn của coverage

30. 🔥 Line coverage và branch coverage khác nhau gì? Cho một đoạn code mà line coverage 100% nhưng branch coverage chỉ 50%.
31. Điều kiện ghép `if (a && b || c)`: branch coverage chưa chắc phủ hết tổ hợp. MC/DC là gì? Bạn có áp dụng không?
32. 🔥 Coverage cao có nghĩa là test tốt không? Cho ví dụ một test phủ 100% nhưng không bắt được bug nào (không có assertion).
   ↳ Follow-up: Làm sao phát hiện test "rỗng" (không assert)? Có quy tắc review chặn không?
33. ⚠️ Có ai từng "chạy cho đủ coverage" bằng cách viết test gọi hàm mà không kiểm tra kết quả? Bạn kiểm soát việc này ở vai Sub Lead thế nào?
34. Mutation testing (PIT) là gì? Dự án có dùng không? Nếu không, bạn đánh giá chất lượng assertion bằng cách nào?
35. Test của bạn có từng bắt được bug thật (ở dev, trước khi lên staging) không? Kể một ví dụ cụ thể.
36. Có bug nào lọt lên staging hoặc production dù coverage ≥ 90% không? Vì sao lọt?
   ↳ Follow-up: Test nào đã thiếu? Sau đó bạn thêm test loại gì để chặn tái diễn?
37. Code mà test mock hết mapper (MyBatis) thì SQL không được kiểm tra. Coverage 90% có phản ánh đúng rủi ro không?
38. Đường đi của code liên quan đến concurrency (race condition, optimistic lock) có thể đạt coverage cao nhưng vẫn lỗi. Bạn kiểm tra thế nào?
39. Branch coverage trên `Optional`, stream, lambda, `switch` expression, try-with-resources: JaCoCo đếm thế nào, bạn từng gặp "nhánh ma" không?
40. Lombok sinh code (`@Data`, `@Builder`) làm coverage sai lệch. Xử lý ra sao (`lombok.config` `lombok.addLombokGeneratedAnnotation`)?
41. Phủ exception handling: làm sao để test nhánh `catch` mà không mock quá nhiều?
42. Có phần legacy/ khó test mà bạn đạt coverage bằng cách nào (refactor để tách, test đặc tả hành vi hiện tại)?

## D. Coverage gate 90%, JaCoCo, CI

43. 🔥 JaCoCo hoạt động thế nào (Java agent, bytecode instrumentation)? Report sinh ra ở đâu (`jacoco.exec`, HTML, XML)?
44. Cấu hình `jacoco-maven-plugin` hay `gradle jacoco`: các goal/ task `prepare-agent`, `report`, `check`, `rule` với `COVEREDRATIO` và `minimum 0.90` hoạt động ra sao?
45. Gate đặt ở mức bundle, package, class, hay method? Có `haltOnFailure` không? Có thể bị bypass không?
46. Công cụ nào hiển thị coverage trên PR (SonarQube, Codecov, Jenkins plugin)? Dự án dùng cái nào?
47. SonarQube quality gate khác JaCoCo `check` thế nào? Quality gate còn điều kiện gì (code smell, duplication, "coverage on new code")?
48. Coverage trên toàn project hay chỉ trên "new code" của PR? Hệ quả của hai cách này?
49. Khi gate yêu cầu 90% mà bạn thêm một feature nhỏ làm tụt coverage tổng, bạn xử lý thế nào?
50. Có file nào bị exclude khỏi JaCoCo (`excludes`), và làm sao bạn tránh lạm dụng exclude để qua gate?
51. Merge request bị chặn vì gate lúc gấp release. Có cơ chế ngoại lệ không? Ai có quyền? Bạn từng xin ngoại lệ chưa?
52. Gate release khác gate merge ở chỗ nào? Vì sao cần cả hai?
53. CI chạy test mất bao lâu? Chạy trên mọi PR hay chỉ nhánh chính? Tách bước unit và integration không?
54. Cấu hình để test chạy song song (surefire `forkCount`, JUnit parallel) – bạn có làm không? Ảnh hưởng gì đến JaCoCo?
55. Báo cáo coverage từ nhiều module gộp thế nào (`jacoco:report-aggregate`)?
56. Nếu dự án có nhiều kho, mỗi kho một nhánh/ cấu hình, coverage gate có chung một chuẩn không?
57. Coverage thay đổi theo từng release: có theo dõi xu hướng không? Có lần nào tụt thấp bất thường?
58. Làm sao bạn thuyết phục team (hoặc quản lý) rằng không nên hạ ngưỡng, hoặc ngược lại nên hạ/tăng ngưỡng?

## E. JUnit và Mockito: kiến thức nền

59. 🔥 JUnit 4 và JUnit 5 khác nhau thế nào (Jupiter, `@BeforeEach`, `@ExtendWith`, `@ParameterizedTest`, `@Nested`, `assertThrows`)? Dự án dùng bản nào?
60. `@ParameterizedTest` với `@CsvSource`, `@MethodSource`: bạn dùng khi nào? Lợi ích với test dựa trên spec?
61. `@Mock`, `@InjectMocks`, `@Spy`, `@Captor`, `@MockBean` khác nhau gì? `MockitoExtension` vs `MockitoAnnotations.openMocks`?
62. `when(...).thenReturn(...)`, `doReturn().when()`, `doThrow`, `thenAnswer`. Khi nào bắt buộc dùng `doReturn` với spy?
63. `verify(mock, times(n))`, `never()`, `ArgumentCaptor`, `InOrder`: bạn kiểm chứng điều gì bằng verify? Khi nào verify quá nhiều là xấu?
64. Strict stubs của Mockito (`UnnecessaryStubbingException`): bạn gặp chưa? Nó nói lên gì về test?
65. Mock static (`mockStatic`), mock constructor, mock final class: có dùng không? Có nên không?
66. Test double: dummy, stub, mock, spy, fake. Phân biệt và ví dụ dùng.
67. 🔥 Mock cái gì, không mock cái gì? Vì sao không mock lớp domain/ lớp tiện ích thuần?
68. Test `@Transactional` trong Spring: rollback sau mỗi test, khác gì với runtime? Có khi nào nó che giấu bug (flush, lazy)?
69. AssertJ vs JUnit assertions vs Hamcrest. Bạn chọn gì, vì sao? Ví dụ so sánh danh sách, ngoại lệ, số thập phân với `BigDecimal` (`compareTo` vs `equals`).
70. Quy ước đặt tên test và cấu trúc Arrange-Act-Assert / Given-When-Then. Dự án có chuẩn không?
71. Test độc lập thứ tự: vì sao không được phụ thuộc thứ tự chạy? Biến static dùng chung làm test bị lỗi thế nào?
72. `@SpringBootTest` vs `@WebMvcTest` vs `@MybatisTest` / `@DataJpaTest` vs thuần Mockito: khi nào dùng cái nào? Chi phí thời gian?
73. Test thời gian chạy lâu do khởi tạo Spring context: tăng tốc bằng cách nào (cache context, tránh `@DirtiesContext`)?
74. Tiêu chí một unit test tốt (FIRST: Fast, Independent, Repeatable, Self-validating, Timely).

## F. Test cho API (controller, service, mapper)

75. 🔥 Cấu trúc test của một API điển hình: bạn test controller, service, mapper riêng hay gộp? Phần nào là "unit" thực sự?
76. Test controller bằng `MockMvc`: kiểm tra status, body JSON, header, validation, xử lý exception toàn cục (`@ControllerAdvice`) thế nào?
77. Test service với mapper bị mock: kiểm tra gì? Nếu service gọi nhiều mapper theo thứ tự, bạn xác minh thế nào?
78. 🔥 Test mapper MyBatis: bạn test SQL bằng DB thật, Testcontainers, H2, hay không test? Vì sao?
   ↳ Follow-up: Nếu không test SQL thì SQL sai (join, điều kiện, null) được bắt bằng cách nào? Coverage 90% có tính các mapper XML không?
79. H2 chế độ PostgreSQL khác PostgreSQL thật ở đâu (hàm, `ON CONFLICT`, `jsonb`, `FOR UPDATE SKIP LOCKED`, kiểu thời gian, `ILIKE`)? Đã gặp test qua nhưng chạy thật lỗi chưa?
80. Testcontainers với PostgreSQL: khởi động thế nào, chạy trong CI cần gì (Docker), tốn thời gian bao nhiêu? Dự án có dùng không?
81. Test API có Redis: mock `RedisTemplate`, dùng embedded Redis, hay Testcontainers? Test TTL, cache miss, cache hit thế nào?
82. Test API gọi hệ thống bên ngoài (đối tác vận chuyển, ERP, robot AGV): mock bằng WireMock/MockRestServiceServer hay mock client? Test timeout, retry, lỗi 5xx thế nào?
83. Test API ghi dữ liệu có optimistic lock bằng `updated_at`: bạn mô phỏng xung đột (rows affected = 0) thế nào ở unit test?
   ↳ Follow-up: Test nào đảm bảo "nếu update trả 0 dòng thì không trừ kho"?
84. Test tính idempotent: gọi hai lần cùng request, kiểm tra kết quả thế nào?
85. Test phân trang, sắp xếp, lọc: các biên (trang rỗng, trang cuối, `size` = 0, `size` quá lớn).
86. Test dữ liệu đầu vào lớn (danh sách nghìn phần tử, chuỗi dài): bạn có thực hiện không?
87. Test xử lý `null` từ mapper (không tìm thấy dòng): service ném lỗi gì? Bạn có test case "không tìm thấy" cho mọi API không?
88. Test mapping DTO/Entity (MapStruct/ModelMapper/tay): kiểm tra gì để bắt lỗi mapping null/đơn vị?
89. Test xử lý lỗi thống nhất (format lỗi trả về, mã lỗi): bạn có test tập trung ở một nơi không?
90. Test log (assert log được ghi) có cần không? Khi nào đáng làm?

## G. Test cho batch job

91. 🔥 Bạn test một batch job như thế nào: test từng bước (reader/processor/writer hoặc tương đương), hay test cả job? Job của bạn dùng Spring Batch hay scheduler tự viết?
92. Test batch job với dữ liệu lớn: unit test dùng dữ liệu nhỏ, vậy lỗi hiệu năng/ bộ nhớ ở khối lượng thật được bắt ở đâu?
93. Test logic chia chunk/ phân vùng (partition) và xử lý song song: assert gì? Chạy đa luồng trong test có flaky không?
94. Bài học từ sự cố batch bị mất đa luồng sau refactor: unit test có bắt được lỗi này không? Bạn đề xuất test hay kiểm tra nào khác (test thời gian, assert tên thread, benchmark)?
95. Test khi một chunk lỗi: job tiếp tục hay dừng? Ghi nhận lỗi, rollback chunk, retry/ skip được kiểm tra thế nào?
96. Test tính chạy lại an toàn (rerun) và idempotent của job: bạn mô phỏng job sập giữa chừng ra sao?
97. Test lập lịch (cron expression, `@Scheduled`): có test không? Làm sao tránh chờ thời gian thật?
98. Test lock phân tán/ chống chạy trùng giữa các instance cho batch: ở unit test chỉ mock được tới đâu?
99. Test job đọc/ghi file (CSV import/export): dùng file tạm (`@TempDir`), encoding, dòng lỗi, dòng rỗng?
100. Test job gọi nhiều mapper/ API: mock số lượng lớn gây test khó đọc. Bạn giải quyết thế nào?
101. Batch xử lý thời gian (cuối ngày, qua nửa đêm, DST, múi giờ kho): test ranh giới ngày thế nào?

## H. Chất lượng test, flaky và bảo trì

102. 🔥 Test flaky là gì? Nguyên nhân thường gặp (thời gian, thứ tự, đa luồng, dữ liệu chung, mạng)? Bạn từng gặp chưa, xử lý ra sao?
103. Bạn xử lý test chậm thế nào? Bao lâu chạy toàn bộ unit test của project?
104. Test hồi quy cho bug đã fix: bạn có quy tắc "mỗi bug fix phải kèm test tái hiện" không?
105. Khi spec thay đổi, bạn cập nhật test thế nào để không bị tình trạng test lỗi thời, hoặc sửa test cho qua mà không hiểu?
106. Test quá gắn chặt với implementation (mock nhiều, verify từng lời gọi) làm refactor khó. Bạn thấy chưa? Cách giảm?
107. Test code quá nhiều lặp lại: bạn dùng test fixture, builder, object mother ra sao?
108. Dữ liệu test: tạo thế nào, tránh dùng dữ liệu thật/ nhạy cảm?
109. Cấu trúc thư mục test, phân loại tag (`@Tag("integration")`) để tách chạy nhanh/ chậm.
110. Có phân biệt rõ unit test, integration test, system/UAT test trong dự án không? Ai chịu trách nhiệm mỗi loại?
111. Có test hiệu năng/ test tải không? Có kiểm thử concurrency không? Nếu không, vì sao?
112. Bạn xử lý test phụ thuộc vào thứ tự các dòng trả về của DB (không có `ORDER BY`) thế nào?

## I. Quy trình, review và vai trò Sub Lead

113. Khi review PR của member, bạn kiểm tra test như thế nào: có assertion thật không, có đủ nhánh lỗi không, có test cho edge case của spec không?
114. Bạn từng từ chối PR vì test kém dù coverage đủ 90% chưa? Ví dụ?
115. Member than phiền gate 90% là gánh nặng, viết test cho "đủ số". Bạn xử lý thế nào?
116. Gate 90% có tạo áp lực viết test vô nghĩa không? Nếu bạn là người đặt chuẩn, bạn chọn con số khác không, hoặc dùng chỉ số khác (mutation, coverage on new code)?
117. Bạn đo chất lượng test của team bằng gì ngoài coverage?
118. Có chiến lược onboarding member mới về cách viết test của dự án không?
119. Test có được review song song với code không, hay review sau? Ai duyệt test?
120. Release bị trễ vì gate coverage chưa đạt: bạn làm gì? Từng có tình huống nào đánh đổi chất lượng để kịp hạn?

## J. Tình huống "nếu... thì sao"

121. 🔥 Một API có 20 nhánh điều kiện lồng nhau, test viết xong chỉ đạt 70%. Bạn xác định phần chưa phủ và quyết định thế nào (viết thêm test, refactor code, chấp nhận)?
122. Coverage đạt 91% nhưng một lỗi null pointer vẫn xảy ra ở production. Bạn phân tích test thiếu gì?
123. Một hàm có 300 dòng với nhiều phụ thuộc, không thể mock dễ dàng. Bạn viết test thế nào?
124. Mapper XML có SQL phức tạp (join nhiều bảng, `<if>` động) và bạn phải đảm bảo coverage. Bạn làm gì ngoài mock?
125. Hai test chạy riêng thì qua, chạy chung thì fail. Điều tra thế nào?
126. Test chạy tốt ở máy bạn nhưng fail trên CI. Các nguyên nhân khả dĩ?
127. Gate chặn vì coverage tụt 0,3% do file auto-generated. Xử lý đúng cách thế nào?
128. FD ghi một quy tắc nhưng code hiện tại làm khác, và test viết theo FD fail. Bạn quyết định theo FD hay theo code? Báo ai?
129. Test viết theo FD pass nhưng tester vẫn tìm ra defect ở UAT. Vì sao có thể xảy ra?
130. Bạn phải viết test cho một batch xử lý 10 triệu bản ghi. Chiến lược test của bạn?
131. Thêm một cột nullable vào bảng; test của bạn cần cập nhật những gì để chắc không hỏng chỗ khác?

## K. Câu hỏi bẫy kiểm tra độ thật và phản tư

132. ⚠️ Nếu mình mở repo ngay bây giờ, mình sẽ thấy test của bạn như thế nào? Chọn một API bất kỳ bạn đã viết và giải thích test của nó.
133. ⚠️ Bạn nói "covering all code paths" nhưng 90% là ngưỡng. Hai điều này có mâu thuẫn không? Bạn giải thích thế nào với cấp trên?
134. ⚠️ Hãy cho mình một ví dụ test bạn đã viết có `assertThrows` hoặc `ArgumentCaptor` và giải thích vì sao cần dùng nó.
135. ⚠️ Bạn có từng viết test chỉ để tăng coverage mà bản thân biết nó không có giá trị? Thành thật cho biết.
136. Test nào bạn viết mà bạn tự hào nhất? Nó bảo vệ điều gì?
137. Nếu làm lại, bạn thay đổi gì trong chiến lược test của dự án (Testcontainers cho mapper, contract test, mutation testing, nâng nhánh coverage)?
138. Điều gì khiến bạn tin rằng test của bạn đủ tốt để release mà không cần kiểm tra thủ công thêm?
139. Điểm yếu của bạn về testing là gì (concurrency test, test hiệu năng, test tích hợp)? Bạn đang cải thiện thế nào?
140. AI sinh test: bạn có dùng AI để sinh unit test không? Bạn đánh giá chất lượng test đó thế nào, làm sao tránh test "đúng với code sai"?
