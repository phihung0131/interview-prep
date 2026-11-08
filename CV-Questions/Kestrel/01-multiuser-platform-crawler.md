> Built a multi-user job-matching platform with authentication and billing that crawls job postings from multiple recruitment sites and matches them to each user's CV.

Chú thích: 🔥 = xác suất bị hỏi cao / dễ bị đào sâu. ⚠️ = câu bẫy kiểm tra độ thật / độ chính xác của claim trong CV.

## A. Động lực, phạm vi và bối cảnh dự án cá nhân

1. 🔥 Kestrel giải quyết vấn đề gì? Vì sao bạn chọn làm dự án này thay vì dùng sẵn các tool như TopCV, ITviec, LinkedIn job alerts?
   ↳ Follow-up: Người dùng mục tiêu là ai (sinh viên mới ra trường, dev đi làm, người đổi ngành)? Bạn đã hỏi ai ngoài bản thân chưa?
   ↳ Follow-up: Điểm khác biệt so với các nền tảng đã có tính năng "job recommendation" là gì?
2. 🔥 Dự án này bạn tự làm một mình hoàn toàn hay có người cùng làm? Phần nào bạn viết, phần nào dùng thư viện / template / AI hỗ trợ?
3. ⚠️ Bạn ghi "Aug 2026 -- Present". Tính đến giờ bạn đã làm bao lâu, commit history trông thế nào, có thể cho xem repo không?
4. ⚠️ Nếu tôi mở repo github.com/phihung0131/auto-jobs ngay bây giờ, tôi sẽ thấy gì đầu tiên? Cấu trúc thư mục ra sao?
5. Tên "Kestrel" và repo "auto-jobs" - vì sao hai tên khác nhau? Có ý nghĩa gì không?
6. Dự án đang ở giai đoạn nào: prototype, MVP, hay đã có người dùng thật? Có bao nhiêu người dùng thật?
7. ⚠️ "Multi-user platform" - hiện có bao nhiêu user thật ngoài bạn? Nếu là 0 thì "multi-user" nghĩa là gì trong thực tế?
8. ⚠️ "Billing" - có tiền thật chạy qua hệ thống chưa, hay mới là tích hợp sandbox/test mode?
9. Bạn dành bao nhiêu giờ mỗi tuần cho dự án? Ưu tiên làm gì trước, bỏ gì sau?
10. Nếu phải cắt scope chỉ còn 30% để ra sản phẩm sớm, bạn giữ lại phần nào?
11. Dự án này có chạy production ở đâu không (VPS, cloud, free tier)? Chi phí hạ tầng mỗi tháng là bao nhiêu?
12. Bạn đã học được gì từ dự án này mà công việc ở công ty hiện tại không dạy bạn?
13. Có phần nào bạn làm hơi quá tay (over-engineering) so với nhu cầu thật không? Vì sao vẫn làm?
14. Roadmap tiếp theo của Kestrel là gì? Tính năng nào bạn dự định làm tiếp?

## B. Kiến trúc tổng thể

15. 🔥 Vẽ kiến trúc tổng thể: các thành phần chính (frontend, backend API, crawler, DB, job queue, LLM layer) và luồng dữ liệu giữa chúng.
   ↳ Follow-up: Thành phần nào là điểm nghẽn đầu tiên khi tăng người dùng?
   ↳ Follow-up: Thành phần nào có thể chết mà hệ thống vẫn phục vụ được người dùng?
16. 🔥 Vì sao bạn chọn tech stack này cho backend? Đã cân nhắc ngôn ngữ/framework nào khác? (Chỉ trả lời dựa trên stack bạn thực sự dùng.)
17. Backend là monolith hay tách service? Vì sao?
18. Crawler chạy trong cùng process với API hay là process/worker riêng? Vì sao?
19. Việc crawl và việc matching được tách thành các bước độc lập hay chạy chung một pipeline?
20. Bạn dùng message queue / job scheduler gì để chạy crawl định kỳ và xử lý nền? Vì sao chọn nó?
21. Dữ liệu chảy từ "job được crawl" đến "user thấy match" qua những bước nào? Mỗi bước ghi vào bảng nào?
22. Nếu một bước trong pipeline fail giữa chừng thì trạng thái dữ liệu ra sao? Có idempotent không?
23. Bạn chọn database nào làm primary store? Vì sao dùng Postgres (liên quan pgvector) thay vì tách vector DB riêng?
24. Schema chính gồm những bảng nào? Quan hệ giữa user, CV, job, match là gì?
25. Một job được nhiều user match thì dữ liệu match lưu per-user hay per-job? Vì sao?
26. Frontend dùng gì và tương tác backend thế nào? Phần nào bạn tự viết?
27. API thiết kế theo REST hay kiểu khác? Versioning, pagination, error format ra sao?
28. Bạn xử lý tác vụ chậm (parse CV, gọi LLM, crawl) bằng async/background job hay trong request? Người dùng thấy trạng thái thế nào?
29. Có dùng cache không (Redis, in-memory)? Cache cái gì, invalidate thế nào?
30. Cấu hình và secrets được quản lý thế nào giữa local, CI và production?

## C. Multi-user và authentication

31. 🔥 Authentication bạn làm kiểu gì: session cookie, JWT, OAuth/social login? Vì sao chọn cách đó?
   ↳ Follow-up: Nếu dùng JWT, revoke token thế nào? Refresh token lưu ở đâu?
   ↳ Follow-up: Nếu dùng session, scale ngang nhiều instance thì xử lý sao?
32. 🔥 Bạn tự viết auth hay dùng thư viện/dịch vụ (Auth0, Clerk, Supabase Auth, Passport, ...)? Vì sao?
33. Password lưu thế nào (hash algorithm, salt, cost factor)? Vì sao chọn thuật toán đó?
34. Có đăng ký bằng email: verify email, quên mật khẩu, đổi mật khẩu không? Luồng reset password an toàn thế nào?
35. Có rate limit / chống brute force cho login không?
36. Có hỗ trợ đăng nhập Google/GitHub không? Bạn xử lý account linking thế nào khi cùng email?
37. Authorization: user chỉ được thấy CV, match, PDF của chính mình - bạn enforce ở tầng nào (middleware, query, row-level security)?
38. ⚠️ Cho ví dụ cụ thể một lỗi IDOR (đổi id trên URL xem dữ liệu người khác) mà bạn đã phòng hoặc từng gặp trong dự án.
39. Có phân quyền admin vs user không? Admin làm được gì?
40. CSRF, XSS, CORS: bạn cấu hình thế nào cho frontend-backend?
41. Dữ liệu của hai user trộn nhau ở chỗ nào có thể xảy ra (cache, vector search, job queue)? Bạn đã kiểm tra tenant isolation chưa?
42. Session/token hết hạn bao lâu? Vì sao chọn giá trị đó?
43. Bạn có viết test cho auth không? Test những case nào (token hết hạn, sai quyền, user bị xóa)?

## D. Billing và thanh toán

44. 🔥 Billing của Kestrel làm gì cụ thể: subscription, pay-per-use, credit? Vì sao chọn mô hình đó?
   ↳ Follow-up: Cái gì bị giới hạn theo gói (số lần match, số PDF, số lần gọi LLM)?
   ↳ Follow-up: Free tier được bao nhiêu và vì sao?
45. 🔥 Bạn tích hợp cổng thanh toán nào (Stripe, PayOS, VNPay, MoMo, ...)? Vì sao chọn? Ở Việt Nam có khác biệt gì?
46. 🔥 Webhook từ cổng thanh toán: bạn verify chữ ký thế nào? Xử lý event đến trùng, đến lộn thứ tự, đến muộn ra sao?
   ↳ Follow-up: Nếu webhook fail/retry, người dùng đã trả tiền mà chưa được nâng gói thì xử lý thế nào?
   ↳ Follow-up: Idempotency key bạn dùng ở đâu?
47. Trạng thái subscription của user được lưu thế nào? Source of truth là DB của bạn hay là cổng thanh toán?
48. Xử lý renew, hủy, hết hạn, thanh toán thất bại (dunning), refund như thế nào?
49. Bạn có lưu thông tin thẻ không? PCI-DSS ảnh hưởng thế nào đến thiết kế của bạn?
50. Race condition: hai request dùng quota cùng lúc khi user chỉ còn 1 lượt - bạn chặn thế nào?
51. Usage metering: bạn đếm lượt dùng (LLM call, match) ở đâu? Có thể sai lệch không?
52. ⚠️ Đã test billing end-to-end với tài khoản thật/sandbox chưa? Kể một bug billing bạn từng gặp.
53. Thuế VAT, hóa đơn điện tử cho thanh toán ở Việt Nam - bạn có xét tới không?
54. Chi phí LLM/embedding trên mỗi user so với giá gói: bạn tính unit economics ra sao? Có lỗ không?
55. Làm sao ngăn một user lạm dụng free tier (tạo nhiều tài khoản)?

## E. Crawler: thiết kế và kỹ thuật

56. 🔥 Bạn crawl những trang tuyển dụng nào? Vì sao chọn các trang đó? Mỗi trang cấu trúc khác nhau thế nào?
   ↳ Follow-up: Thêm một site mới mất bao lâu và cần sửa những gì?
   ↳ Follow-up: Có abstraction chung cho các site (interface/adapter) không?
57. 🔥 Crawler dùng công cụ gì (HTTP client + parser, headless browser như Playwright/Puppeteer, API nội bộ của site)? Vì sao?
   ↳ Follow-up: Khi nào bạn phải dùng headless browser và chi phí của nó?
   ↳ Follow-up: Trang render bằng JS (SPA) bạn xử lý thế nào?
58. Bạn tìm ra endpoint/dữ liệu cần lấy bằng cách nào (xem network tab, HTML parsing, sitemap)?
59. 🔥 Site thay đổi HTML/DOM làm parser hỏng - bạn phát hiện và sửa thế nào? Có alert không?
60. Tần suất crawl là bao lâu một lần? Dựa vào đâu quyết định?
61. Crawl full hay incremental? Làm sao biết job nào mới, đã đổi, đã hết hạn/đã gỡ?
62. 🔥 Dedup: cùng một job đăng trên nhiều site hoặc đăng lại nhiều lần - bạn nhận diện trùng thế nào?
   ↳ Follow-up: Khóa dedup dựa trên gì (URL, title+company, hash nội dung, embedding similarity)?
   ↳ Follow-up: Tỉ lệ false positive/false negative của dedup là bao nhiêu?
63. Chuẩn hóa dữ liệu từ nhiều site về một schema chung: các trường nào, trường nào thiếu ở site này nhưng có ở site khác?
64. Lương, địa điểm, level, hình thức làm việc ở mỗi site viết một kiểu - bạn normalize ra sao?
65. Bạn xử lý lỗi mạng, timeout, 5xx, 429 thế nào (retry, backoff, circuit breaker)?
66. Rate limiting phía crawler: bạn giới hạn tốc độ thế nào để không làm sập site đích?
67. 🔥 Anti-bot (Cloudflare, captcha, IP block, fingerprinting): bạn từng gặp chưa và xử lý ra sao? Có dùng proxy rotation không?
68. User-Agent, headers, cookie, session khi crawl: bạn có giả dạng trình duyệt không? Cân nhắc đạo đức thế nào?
69. Crawl song song bằng gì (worker pool, async, nhiều process)? Concurrency tối đa bao nhiêu và vì sao?
70. Một lần crawl chạy mất bao lâu, thu được bao nhiêu job? Dung lượng dữ liệu hiện có bao nhiêu?
71. Job hết hạn / bị gỡ khỏi site: bạn đánh dấu và ẩn khỏi kết quả match thế nào?
72. Lưu raw HTML hay chỉ lưu dữ liệu đã parse? Lý do và trade-off?
73. Làm sao đảm bảo chất lượng dữ liệu crawl (monitor số job/ngày, field null, parser coverage)?
74. Crawler có test không? Test với HTML fixture hay gọi trực tiếp site thật? Xử lý flaky test thế nào?
75. Crawl job có yêu cầu đăng nhập (nội dung chỉ hiển thị khi login) thì bạn xử lý thế nào hay bỏ qua?
76. Có những trường dữ liệu thú vị (mô tả dài, yêu cầu kỹ năng) mà các site che giấu hay phân trang - bạn lấy ra sao?
77. Multi-language (tiếng Việt, tiếng Anh, lẫn lộn) trong mô tả job có gây vấn đề cho parsing/matching không?

## F. Pháp lý, đạo đức và bảo mật

78. 🔥 Scraping các trang tuyển dụng có hợp pháp không? Đã đọc Terms of Service / robots.txt của các site đó chưa?
   ↳ Follow-up: Nếu một site gửi thư yêu cầu ngừng crawl thì bạn làm gì?
   ↳ Follow-up: Bạn phân biệt thế nào giữa dữ liệu công khai và dữ liệu có bản quyền của site?
79. Bạn có tôn trọng robots.txt không? Vì sao có/không?
80. Hiển thị lại nội dung job của site khác trên Kestrel có vấn đề bản quyền / cạnh tranh không? Bạn có link ngược về nguồn không?
81. 🔥 CV chứa PII (họ tên, số điện thoại, email, địa chỉ, ngày sinh): bạn lưu, mã hóa và giới hạn truy cập thế nào?
   ↳ Follow-up: CV được gửi tới LLM provider bên thứ ba - người dùng có biết/đồng ý không? Có consent flow không?
   ↳ Follow-up: Có nên ẩn danh hóa (redact) PII trước khi gửi LLM không?
82. Quyền xóa dữ liệu: user muốn xóa tài khoản và toàn bộ CV/embedding của họ - bạn làm được không? Embedding có được xóa theo không?
83. Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân của Việt Nam (và GDPR nếu có user EU) ảnh hưởng gì tới thiết kế của bạn?
84. API key của các LLM provider và cổng thanh toán được lưu ở đâu? Làm sao tránh commit nhầm lên GitHub (repo công khai)?
85. ⚠️ Repo đang public hay private? Nếu public, bạn kiểm tra lịch sử commit có lọt secret nào chưa?
86. Dữ liệu CV được lưu ở đâu (DB, object storage, filesystem)? Backup và mã hóa at-rest/in-transit thế nào?
87. Log có ghi PII hoặc nội dung CV không? Bạn che thế nào?
88. Prompt injection: một job description độc hại (do crawl về) chứa chỉ dẫn "bỏ qua mọi hướng dẫn trước" thì ảnh hưởng gì tới pipeline match/enrichment?
89. SSRF / lỗi upload: user upload CV file - bạn validate loại file, kích thước, quét mã độc thế nào?
90. Dependency vulnerabilities: bạn có kiểm tra (npm audit, dependabot, pip-audit) không?

## G. Matching ở mức tổng quan (chi tiết kỹ thuật ở file khác)

91. 🔥 "Matches them to each user's CV" - match nghĩa là gì? Output cuối cùng người dùng nhận là gì (điểm số, danh sách, giải thích)?
92. Quy trình từ lúc user upload CV đến lúc nhận danh sách job: các bước, thời gian chờ.
93. CV được parse từ định dạng nào (PDF, DOCX, text)? Parse thế nào và sai ở đâu?
94. Khi user cập nhật CV, các match cũ xử lý ra sao (tính lại toàn bộ hay tăng dần)?
95. Khi có job mới được crawl, bạn match với toàn bộ user hay chỉ user liên quan? Độ phức tạp là bao nhiêu?
96. Người dùng có thể đặt tiêu chí (địa điểm, mức lương, remote, level) không? Tiêu chí cứng và tiêu chí mềm kết hợp thế nào?
97. Thông báo cho user khi có match mới (email, push)? Làm sao tránh spam?
98. Làm sao bạn biết kết quả match là "tốt"? (nối với evaluation ở file khác - ở đây chỉ hỏi tín hiệu phản hồi từ user.)

## H. Scale, vận hành, độ tin cậy

99. 🔥 Nếu từ 10 lên 10.000 user, phần nào của hệ thống vỡ trước? Bạn sẽ sửa gì?
100. Nếu số job tăng lên 1 triệu bản ghi, query và index xử lý ra sao?
101. Chi phí lớn nhất của hệ thống là gì (LLM, embedding, hạ tầng, proxy)? Cách giảm?
102. Monitoring/logging/alerting: bạn biết crawler hoặc pipeline hỏng bằng cách nào?
103. Backup và disaster recovery cho DB: có chưa? Đã từng restore thử chưa?
104. Migration database: bạn dùng công cụ gì? Rollback thế nào?
105. Deploy: quy trình từ commit đến production? Có zero-downtime không?
106. Một sự cố bạn từng gặp (crawler bị block, bill LLM tăng đột biến, webhook mất) - kể lại nguyên nhân và cách xử lý.
107. Nếu LLM provider hoặc site đích sập, người dùng thấy gì? Hệ thống degrade thế nào?
108. Có vấn đề timezone, locale (VND, múi giờ) cần lưu ý trong billing và crawl lịch không?

## I. Đánh đổi thiết kế, tình huống và phản tư

109. Điều bạn tự hào nhất trong dự án này là gì? Điều bạn thấy dở nhất?
110. Nếu làm lại từ đầu, bạn thay đổi quyết định kiến trúc nào lớn nhất?
111. Quyết định kỹ thuật khó nhất bạn phải đưa ra? Các phương án đã cân nhắc?
112. Một bug khó nhất bạn debug trong dự án này là gì? Bạn tìm ra nguyên nhân bằng cách nào?
113. Nếu một công ty muốn dùng Kestrel cho B2B (hàng nghìn ứng viên), bạn cần thay đổi những gì?
114. Nếu site lớn nhất bạn crawl cấm hoàn toàn, sản phẩm còn giá trị không? Bạn có phương án thay thế (API chính thức, partnership, user tự dán link)?
115. Dự án cá nhân này liên hệ gì tới công việc backend hiện tại của bạn? Kỹ năng nào chuyển giao được?
116. Bạn dùng AI coding assistant trong dự án này đến mức nào? Phần nào bạn thật sự hiểu từng dòng?
117. ⚠️ Chọn ngẫu nhiên một module trong repo - bạn có thể giải thích dòng chạy và lý do viết như vậy không?
118. Nếu tôi cho bạn 1 ngày để thêm một site tuyển dụng mới, bạn làm những bước nào từ đầu?
119. Nếu tôi hỏi phần nào trong CV này bạn "nói hơi quá", bạn sẽ thừa nhận phần nào?
