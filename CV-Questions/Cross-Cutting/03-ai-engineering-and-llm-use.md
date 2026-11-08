# AI Engineering và việc dùng LLM (AI Engineering and LLM Use)

Phạm vi: dùng AI trong công việc (Project 2) và dự án cá nhân (Kestrel): quan điểm về AI coding, trách nhiệm, đánh giá LLM, prompt, RAG, agent, chi phí, bảo mật, định hướng nghề nghiệp. Chỉ liệt kê câu hỏi, không có đáp án.

## A. Quan điểm về AI coding và năng lực tự code

1. 🔥 Em dùng AI nhiều như vậy thì em còn tự code được không? Chứng minh bằng cách nào?
   ↳ Follow-up: Nếu tôi cho em một bài live-coding không có AI, em kỳ vọng mình làm được đến đâu? Lần gần nhất em tự debug một vấn đề khó mà không nhờ AI là khi nào?
2. 🔥 Em nghĩ gì về "vibe coding"? Em phân biệt nó với AI-assisted engineering thế nào?
3. Em dùng AI cho việc gì và tuyệt đối không dùng AI cho việc gì?
4. Có lần nào AI sinh code trông đúng nhưng sai tinh vi (sai concurrency, sai transaction, sai edge case) mà em bắt được không? Kể cụ thể.
5. Làm sao em tránh bị "teo" kỹ năng khi quá phụ thuộc AI? Em có quy tắc nào cho bản thân?
6. Một junior dùng AI sinh toàn bộ code mà không hiểu: em nhìn nhận thế nào và sẽ hướng dẫn ra sao?
7. Em có tin rằng AI làm giảm chất lượng code base về dài hạn không? Bằng chứng nào em thấy?

## B. Trách nhiệm với code do AI sinh

8. 🔥 Code do AI sinh ra gây bug production thì ai chịu trách nhiệm? Quy trình của em để ngăn việc đó là gì?
   ↳ Follow-up: Trong pipeline Project 2, điểm kiểm soát của con người nằm ở đâu? Có bước nào AI được tự động merge không?
9. Em review code do AI viết khác thế nào so với code người viết?
10. Vấn đề bản quyền/license của code AI sinh ra, em có quan tâm không? Công ty có chính sách gì?
11. Làm sao em đảm bảo AI không đưa vào lỗ hổng bảo mật (SQL injection, secrets, dependency độc hại)?
12. AI sinh test cho chính code AI sinh ra: vì sao điều này có thể tạo ra "test xanh giả"? Em tránh thế nào?
13. Với coverage gate 90%, AI sinh unit test để đạt gate có làm giảm giá trị của gate không?

## C. Project 2: AI-driven Delivery Workflow Platform

14. 🔥 Giải thích kiến trúc tổng thể của nền tảng: Claude Code SDK, Jira, Confluence, GitHub nối với nhau thế nào, một task đi qua pipeline ra sao?
    ↳ Follow-up: Mỗi bước (requirements review, test scenario, code gen, unit test, PR) dùng prompt/agent riêng hay một agent chung? Trạng thái được lưu ở đâu?
15. Knowledge base từ Confluence + Jira view: thu thập, chunk, cập nhật, và truy xuất thế nào? Có dùng embedding không hay chỉ context stuffing?
16. Làm sao agent biết convention và domain của WMS mà không bịa? Khi tài liệu mâu thuẫn hoặc lỗi thời thì sao?
17. AI code review trước human review: prompt/tiêu chí đánh giá là gì, comment được đăng lên PR thế nào, người review có bị "anchor" vào kết quả AI không?
18. Agent có quyền gì trên repo (đọc, tạo branch, push, mở PR)? Cách giới hạn quyền, ngăn prompt injection từ nội dung ticket/PR?
19. Khi agent chạy lâu hoặc lặp vô hạn, em kiểm soát token/thời gian/chi phí thế nào?
20. Điều gì sai nhiều nhất khi agent sinh code cho hệ thống legacy Spring Boot/MyBatis? Em xử lý thế nào?
21. Dữ liệu khách hàng (global fashion retailer) và mã nguồn đi qua LLM: ràng buộc bảo mật/NDA nào, dữ liệu có rời khỏi môi trường công ty không?

## D. Đánh giá LLM (Evaluation) và Kestrel

22. 🔥 Em đánh giá chất lượng đầu ra LLM thế nào? Evaluation set của Kestrel gồm gì, metric nào, chạy khi nào?
    ↳ Follow-up: Ai gán nhãn ground truth? LLM-as-judge có dùng không, và thiên lệch của nó ra sao? Em phát hiện regression khi đổi prompt/model thế nào?
23. So sánh bốn provider (Anthropic, OpenAI, Gemini, DeepSeek) em dựa trên tiêu chí nào: chất lượng, độ trễ, chi phí, độ ổn định output? Kết luận của em là gì?
24. 🔥 Làm sao em đảm bảo CV PDF được tailor không bịa nội dung (không thêm kỹ năng/kinh nghiệm không có)?
    ↳ Follow-up: Có bước xác minh sau sinh (grounding check, so khớp với CV gốc) không? Khi người dùng tự yêu cầu thêm thứ không có thì sao?
25. Schema-validated output: dùng JSON schema/tool use/structured output của provider hay tự parse? Validation thất bại thì retry thế nào?
26. Hallucination: các biện pháp giảm trong hệ thống của em (grounding, citation, temperature, constrained decoding)?
27. LLM enrichment cho job posting: trích xuất trường nào, độ chính xác đo thế nào, xử lý tin tuyển dụng nhiều ngôn ngữ/không chuẩn?

## E. Prompt, RAG và agent

28. Em quản lý prompt thế nào: version, review, test, tách khỏi code? Khi đổi prompt thì làm sao biết không làm hỏng chỗ khác?
29. Prompt engineering vs fine-tuning vs RAG: em chọn khi nào, và với Kestrel thì chọn gì?
30. RAG: em thiết kế chunking, embedding model, retrieval (pgvector), rerank thế nào? Đo chất lượng retrieval bằng gì (recall@k, MRR)?
31. Khi nào RAG thất bại? Ví dụ thực tế em gặp.
32. Agent vs workflow cố định: khi nào dùng agent tự quyết, khi nào pipeline cứng? Project 2 thuộc loại nào và vì sao?
33. Tool use/function calling: thiết kế tool thế nào để an toàn, idempotent, dễ gỡ lỗi?
34. Prompt injection và data exfiltration: nguy cơ cụ thể trong Kestrel (crawl nội dung từ web đưa vào LLM) và trong Project 2 (nội dung Jira/Confluence), em phòng thế nào?

## F. Chi phí, vận hành, đạo đức

35. 🔥 Chi phí LLM của Kestrel mỗi người dùng mỗi tháng khoảng bao nhiêu? Em tối ưu bằng cách nào (cache, model nhỏ, batch, giới hạn)?
    ↳ Follow-up: Billing của em có tính được chi phí biên theo user không? Điều gì xảy ra khi một user tiêu tốn gấp 100 lần bình thường?
36. Rate limit, timeout, provider outage: fallback giữa các provider thế nào, và output khác nhau giữa provider có gây rắc rối không?
37. Quyền riêng tư: gửi CV (dữ liệu cá nhân) tới LLM bên thứ ba, người dùng đồng ý thế nào, provider có train trên dữ liệu đó không, lưu giữ bao lâu?
38. Đạo đức khi crawl dữ liệu các trang tuyển dụng và khi dùng AI hỗ trợ ứng tuyển (người dùng nộp CV do AI viết): ranh giới nào em tự đặt ra?
39. Thiên lệch (bias) trong matching/ranking việc làm: em có xem xét rủi ro phân biệt đối xử không?
40. Logging prompt/response để debug có xung đột với quyền riêng tư thế nào? Em xử lý ra sao?

## G. Định hướng nghề nghiệp và tương lai

41. 🔥 Em có muốn chuyển sang AI Engineering không? Khác gì giữa Backend Engineer và AI Engineer theo cách em hiểu, và em còn thiếu gì?
    ↳ Follow-up: Em đã học gì về ML nền tảng (embedding, fine-tuning, eval)? Em thích phần xây hạ tầng/sản phẩm quanh LLM hay phần mô hình?
42. 🔥 Theo em, vai trò developer sẽ thay đổi thế nào trong 3-5 năm tới? Em chuẩn bị gì?
43. Kỹ năng nào của một backend engineer trở nên giá trị hơn trong thời đại AI và kỹ năng nào ít đi?
44. Nếu AI giảm một nửa thời gian dev như CV nói, thì công ty cần ít dev hơn chăng? Em nghĩ gì về hệ quả đó?
