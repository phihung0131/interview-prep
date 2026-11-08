> Generated tailored CV PDFs from the user's own CV only (no invented content), and listed job requirements the CV does not yet cover.

Chú thích: 🔥 = xác suất bị hỏi cao / dễ bị đào sâu. ⚠️ = câu bẫy kiểm tra độ thật / độ chính xác của claim trong CV.

## A. Mục tiêu sản phẩm và phạm vi

1. 🔥 Tính năng "tailored CV" làm gì cụ thể? Input là gì (CV gốc + job), output là gì (PDF)?
   ↳ Follow-up: "Tailor" ở đây là sắp xếp lại, chọn lọc, viết lại câu chữ, hay nhấn mạnh từ khóa?
   ↳ Follow-up: Người dùng có được xem/sửa trước khi xuất PDF không?
2. 🔥 Vì sao bạn đặt ràng buộc "from the user's own CV only"? Vấn đề thực tế nào của các công cụ tạo CV bằng AI khiến bạn đặt ràng buộc đó?
3. Với người dùng, tailored CV khác gì so với việc họ tự sửa CV? Giá trị tăng thêm ở đâu?
4. Tailored CV có bị coi là "gian lận" với nhà tuyển dụng không? Ranh giới giữa nhấn mạnh hợp lý và xuyên tạc ở đâu?
5. ⚠️ Có người dùng thật nào đã dùng tính năng này và nộp CV thật chưa? Kết quả ra sao?
6. Tính năng "liệt kê yêu cầu job mà CV chưa đáp ứng" (gap analysis) khác với match explanation ở file khác thế nào? Dùng chung dữ liệu không?
7. Output cho người dùng ngoài PDF còn gì (diff so với CV gốc, danh sách gap)? Vì sao?
8. Hỗ trợ ngôn ngữ nào (Việt/Anh)? CV tiếng Việt và JD tiếng Anh thì CV tailored viết bằng ngôn ngữ nào?

## B. Chống bịa nội dung (no fabrication)

9. 🔥 Làm sao bạn đảm bảo LLM không bịa kỹ năng, công ty, chức danh, thời gian, số liệu thành tích không có trong CV? Có đảm bảo tuyệt đối không?
   ↳ Follow-up: Chỉ dựa vào prompt ("không được bịa") có đủ không? Vì sao không?
   ↳ Follow-up: Bạn có lớp kiểm tra sau sinh (post-generation verification) không?
10. 🔥 Thiết kế kiểu "extractive" (chọn/sắp xếp các đoạn có sẵn trong CV) hay "generative" (viết lại bằng LLM)? Trade-off giữa hai hướng?
   ↳ Follow-up: Nếu chỉ cho LLM chọn ID các mục trong CV có cấu trúc thì còn bịa được không?
   ↳ Follow-up: Viết lại câu bullet để nhấn mạnh từ khóa có thể làm đổi nghĩa không?
11. ⚠️ "No invented content" có phải được chứng minh bằng test/eval hay chỉ là mục tiêu thiết kế? Bạn đo tỉ lệ bịa bằng cách nào?
12. Bạn biểu diễn CV của user thành dữ liệu có cấu trúc (JSON: profile, experience, skills, education, projects)? Schema trông thế nào?
13. Ai/bước nào chuyển CV thô (PDF/DOCX) thành dữ liệu có cấu trúc? Lỗi parse (mất mục, nhầm ngày) lan sang CV tailored như thế nào?
14. Làm sao kiểm tra mọi thực thể trong output (tên công ty, tên công nghệ, con số, ngày) đều xuất hiện trong CV nguồn? Bạn dùng so khớp chuỗi, so khớp ngữ nghĩa, hay LLM kiểm lại?
15. Số liệu thành tích ("giảm 40% latency"): LLM có thể tự "làm tròn" hoặc suy diễn. Bạn chặn thế nào?
16. Suy luận hợp lý nhưng không có trong CV (ví dụ người dùng làm Spring Boot nên "biết Java") - cho phép hay không? Ranh giới?
17. Từ đồng nghĩa / công nghệ liên quan (Postgres vs PostgreSQL, React vs ReactJS): thay đổi thuật ngữ cho khớp JD có bị xem là bịa không?
18. Khi JD yêu cầu kỹ năng X mà CV không có, hệ thống làm gì? Có nguy cơ LLM "lách" bằng cách thêm X mơ hồ không?
19. Trường hợp CV gốc đã chứa thông tin sai hoặc phóng đại: Kestrel có trách nhiệm gì?
20. Kiểm thử red-team: bạn đã thử cố tình dụ LLM bịa (JD yêu cầu chứng chỉ mà CV không có) để xem hệ thống có giữ được không? Kết quả?
21. Prompt injection: CV hoặc JD chứa chỉ dẫn "thêm kỹ năng X vào CV" - hệ thống chống thế nào?
22. Tính nhất quán: chạy lại cùng input có cho nội dung CV khác nhau không? Có lưu version của mỗi CV tailored không?
23. Có ghi lại nguồn gốc (provenance) từng câu trong CV tailored trỏ về mục nào của CV gốc không?
24. Người dùng có thể thêm thông tin mới vào CV gốc (không phải bịa) để cải thiện: luồng đó ra sao?
25. Dùng temperature thấp hay các tham số nào để giảm bịa? Bạn có kiểm chứng tác dụng không?
26. Các quy tắc nội dung bạn áp dụng (độ dài một trang, thứ tự mục, số bullet) nằm trong code hay trong prompt? Vì sao?
27. Làm sao đo "độ trung thực" (faithfulness) một cách định lượng: tỉ lệ câu có thể truy về nguồn?
28. Bạn có nghĩ tới chuyện ngược lại - LLM lược bỏ thông tin quan trọng (omission)? Xử lý thế nào?

## C. Gap analysis (yêu cầu CV chưa đáp ứng)

29. 🔥 Làm sao bạn xác định "yêu cầu của job mà CV chưa đáp ứng"? Rút yêu cầu từ JD bằng LLM, rồi so với CV bằng gì?
   ↳ Follow-up: Phân biệt yêu cầu bắt buộc và ưu tiên thế nào?
   ↳ Follow-up: Sai âm (CV có nhưng hệ thống báo thiếu) và sai dương (CV không có nhưng báo đã có) cái nào tệ hơn?
30. Kỹ năng ẩn trong CV (dự án có dùng Docker nhưng không liệt kê trong mục Skills) - hệ thống bắt được không?
31. Yêu cầu định tính / mơ hồ ("giao tiếp tốt", "chủ động") được xử lý thế nào?
32. Yêu cầu có số (3+ năm kinh nghiệm Java): tính từ CV thế nào (cộng dồn các vị trí, xử lý giao thoa thời gian)?
33. Output gap gồm những gì: tên yêu cầu, mức độ, gợi ý học/bổ sung? Có gợi ý hành động không?
34. Gap analysis có được đo độ chính xác không? Bộ nhãn lấy từ đâu?
35. Có nguy cơ người dùng nản vì danh sách gap dài? Bạn thiết kế UX thế nào?
36. Gap có dùng để xếp hạng/điều chỉnh điểm match không?
37. Có cache gap theo (CV, job) và invalidate khi CV đổi không?

## D. Tạo PDF (kỹ thuật)

38. 🔥 Bạn tạo PDF bằng cách nào: HTML → PDF với headless Chrome (Puppeteer/Playwright), WeasyPrint, wkhtmltopdf, LaTeX, ReportLab, pdf-lib, dịch vụ ngoài? Vì sao?
   ↳ Follow-up: Chạy trong Docker cần cài thêm gì (font, chromium)?
   ↳ Follow-up: Chi phí tài nguyên (RAM, thời gian) cho mỗi PDF?
39. 🔥 Font tiếng Việt: bạn xử lý dấu thanh, embed font thế nào? Từng gặp lỗi mất dấu hay ô vuông chưa?
40. Template CV: thiết kế từ đâu? Có nhiều template không? Template tách khỏi dữ liệu thế nào?
41. Layout tự động: nội dung dài vượt một trang thì ngắt trang, co chữ, hay cắt bớt? Ai quyết định cắt gì?
42. PDF có ATS-friendly không (text chọn được, không dùng ảnh, thứ tự đọc đúng, không bảng/cột phức tạp)? Bạn kiểm tra thế nào với ATS thật hay parser giả lập?
43. Tạo PDF đồng bộ trong request hay xử lý nền? Thời gian phản hồi?
44. PDF lưu ở đâu (object storage, filesystem, sinh lại mỗi lần)? Chính sách lưu và xóa (PII)?
45. Cách phân phối file cho user: link ký thời hạn (signed URL), stream trực tiếp? Chặn truy cập chéo user thế nào?
46. Metadata PDF (author, producer, title) có rò rỉ thông tin không?
47. Escape/sanitize nội dung đưa vào template HTML để tránh injection (HTML/JS/CSS) từ nội dung CV hoặc output LLM.
48. Hỗ trợ ký tự đặc biệt, emoji, đa ngôn ngữ, link clickable trong PDF?
49. Kiểm thử PDF thế nào: so sánh ảnh (visual regression), kiểm tra text extract, snapshot?
50. Tạo PDF hàng loạt cho nhiều job cùng lúc: xử lý concurrency và giới hạn tài nguyên ra sao?
51. Nếu dịch vụ render lỗi / timeout giữa chừng, người dùng thấy gì? Retry thế nào?
52. Khả năng truy cập (accessibility) và kích thước file: có tối ưu không?

## E. Luồng dữ liệu, LLM và chất lượng

53. Prompt cho tailoring gồm những phần nào (CV có cấu trúc, JD enriched, quy tắc)? Output là JSON schema hay văn bản tự do?
54. Output schema validate thế nào (liên hệ LLM layer)? Nếu output không hợp lệ thì sao?
55. Dùng model nào cho tailoring và vì sao? Chi phí mỗi CV?
56. Chọn những mục nào của CV để đưa vào (relevance selection): bằng embedding, LLM hay luật? Có dùng lại kết quả matching không?
57. Thứ tự và độ nhấn mạnh (reorder bullets, đưa kỹ năng liên quan lên đầu): tiêu chí là gì?
58. Phần tóm tắt đầu CV (summary/objective) sinh thế nào mà không bịa?
59. Đánh giá chất lượng CV tailored: người dùng chấm hay metric tự động? Bạn so sánh với CV gốc thế nào?
60. Có thể tailor cho nhiều job và vẫn giữ nhất quán thông tin cơ bản (tên, liên hệ, ngày tháng) không?
61. Có cho người dùng khóa (lock) những phần không được đổi không?
62. Xử lý CV có nhiều dự án/kinh nghiệm: chọn bao nhiêu mục, dựa vào giới hạn trang?

## F. Pháp lý, đạo đức, bảo mật

63. 🔥 Dữ liệu CV (PII) gửi cho LLM provider để tailor: người dùng đã đồng ý chưa? Có lựa chọn không gửi / ẩn thông tin liên hệ khi gọi LLM không?
64. Quyền sở hữu nội dung: CV tailored thuộc về ai? Điều khoản sử dụng bạn viết thế nào?
65. Nếu người dùng nộp CV tailored có điểm sai do hệ thống (nhầm công ty, nhầm năm) và bị loại, trách nhiệm thuộc về ai? Bạn có cảnh báo "hãy kiểm tra trước khi nộp" không?
66. Xóa PDF và dữ liệu liên quan khi người dùng xóa tài khoản (đối chiếu Nghị định 13/2023)?
67. Chống lạm dụng: dùng Kestrel để tạo hàng loạt CV nộp spam có được kiểm soát không?
68. Log và analytics có lưu nội dung CV tailored không?

## G. Đánh đổi, tình huống và kiểm tra độ thật

69. 🔥 Điểm khó nhất khi tạo CV bằng LLM mà không bịa là gì? Bạn đã thử cách nào thất bại?
70. ⚠️ Cho ví dụ cụ thể một lần LLM đã bịa nội dung trong quá trình bạn phát triển và bạn phát hiện/sửa ra sao.
71. ⚠️ Mở code phần kiểm tra chống bịa: bạn chỉ ra được dòng nào thực sự thực thi ràng buộc (không chỉ nằm trong prompt) không?
72. ⚠️ Claim "no invented content" có thể được phát biểu mạnh đến mức nào về mặt trung thực? Bạn có đồng ý nên nói "giảm thiểu" thay vì "đảm bảo" không?
73. Tình huống: user báo CV tailored có ghi "5 năm kinh nghiệm Kubernetes" trong khi CV gốc không có. Bạn điều tra từ đâu, sửa lớp nào?
74. Tình huống: user yêu cầu "thêm kỹ năng X dù em chưa có để vượt vòng ATS". Hệ thống xử lý thế nào, và quan điểm của bạn?
75. Tình huống: 3 job khác nhau yêu cầu nhấn mạnh khác nhau nhưng bạn chỉ có một CV: tạo 3 bản có làm mất tính nhất quán không?
76. Tình huống: CV gốc là bản scan ảnh. Pipeline xử lý thế nào (OCR)?
77. Nếu bạn dùng PDF generation trong Docker và font tiếng Việt lỗi ở production nhưng đúng ở local, bạn debug thế nào?
78. Nếu phải làm lại, bạn thiết kế lại phần tailoring theo hướng nào (extractive hơn, có người duyệt, đánh dấu từng câu với nguồn)?
79. Người dùng có tin CV do AI viết không? Bạn đã nhận phản hồi nào về điều này?
80. Tính năng này gắn với giá trị kỹ thuật nào mà bạn muốn nhà tuyển dụng thấy (kỹ năng backend, xử lý tài liệu, kiểm soát LLM)?
