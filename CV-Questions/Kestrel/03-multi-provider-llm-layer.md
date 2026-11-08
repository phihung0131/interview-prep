> Built an LLM layer that works across several providers (Anthropic, OpenAI, Gemini, DeepSeek), with schema-validated outputs and automatic retries.

Chú thích: 🔥 = xác suất bị hỏi cao / dễ bị đào sâu. ⚠️ = câu bẫy kiểm tra độ thật / độ chính xác của claim trong CV.

## A. Động lực và phạm vi

1. 🔥 Vì sao cần một LLM layer hỗ trợ nhiều provider? Vấn đề thực tế nào khiến bạn làm vậy thay vì dùng một provider?
   ↳ Follow-up: Lợi ích thực sự (chi phí, fallback, chất lượng, tránh lock-in) cái nào bạn đã thực sự dùng đến?
   ↳ Follow-up: Có lúc nào bạn thấy đây là over-engineering không?
2. 🔥 Vì sao không dùng thư viện có sẵn (LangChain, LiteLLM, Vercel AI SDK, OpenRouter, LlamaIndex, Instructor)? Bạn đã cân nhắc và loại bỏ chúng vì lý do gì?
   ↳ Follow-up: Nếu quay lại, bạn sẽ dùng LiteLLM / OpenRouter thay cho tự viết không?
   ↳ Follow-up: Layer của bạn làm được điều gì mà những thư viện đó không làm được?
3. ⚠️ "Works across several providers" - cả bốn provider (Anthropic, OpenAI, Gemini, DeepSeek) đều đã chạy thật và được test chưa, hay có provider chỉ mới viết adapter?
4. Provider nào là mặc định, provider nào là dự phòng? Chọn theo tiêu chí gì?
5. Mỗi tác vụ (enrichment, match analysis, tailoring CV) dùng provider/model nào? Vì sao có thể khác nhau?
6. Layer này bao gồm những chức năng gì ngoài gọi API: routing, retry, fallback, logging, cost tracking, caching?
7. Bạn viết phần này hết bao lâu? Phần nào mất nhiều thời gian nhất?

## B. Thiết kế abstraction

8. 🔥 Vẽ/giải thích kiến trúc của layer: interface chung, adapter của từng provider, cách chọn provider lúc chạy.
   ↳ Follow-up: Interface chung tối thiểu gồm những method nào?
   ↳ Follow-up: Thêm provider thứ năm cần sửa những file nào?
9. 🔥 Các provider khác nhau về API (message format, system prompt, role, tool/function calling, response format, streaming). Bạn thống nhất chúng thế nào? Chỗ nào không thể thống nhất?
10. "Leaky abstraction": có tính năng riêng của provider (Anthropic prompt caching, OpenAI structured outputs, Gemini response schema, DeepSeek reasoning) mà abstraction làm mất? Bạn xử lý thế nào?
11. Bạn thiết kế theo "lowest common denominator" hay cho phép option riêng theo provider?
12. Tên model, giá, context window, giới hạn output của mỗi provider được cấu hình ở đâu? Khi provider ra model mới thì bạn cập nhật thế nào?
13. System prompt và prompt chung cho mọi provider có hiệu quả như nhau không? Có phải chỉnh prompt theo provider không?
14. Dependency injection / factory: bạn khởi tạo client thế nào? Dễ mock trong test không?
15. Streaming có được hỗ trợ không? Có cần cho bài toán này không?
16. Xử lý system message, đa lượt hội thoại, vai trò khác nhau giữa các provider (Gemini dùng "user/model", OpenAI dùng "system/user/assistant").
17. Tool calling / function calling: bạn có dùng không? Hay dùng JSON mode / structured output?
18. Timeout, cancellation: bạn truyền thế nào xuyên qua abstraction?
19. Token counting: mỗi provider tokenizer khác nhau - bạn đếm/ước lượng token thế nào để kiểm soát context và chi phí?
20. Concurrency: bạn gọi song song nhiều request thế nào, giới hạn thế nào để không dính rate limit?
21. Bạn dùng SDK chính thức hay gọi HTTP trực tiếp? Lý do?
22. Một số provider (DeepSeek) tương thích OpenAI API: bạn tái sử dụng client OpenAI hay viết riêng? Vì sao?

## C. Schema-validated outputs

23. 🔥 "Schema-validated outputs" - bạn định nghĩa schema bằng gì (Pydantic, Zod, JSON Schema, ...) và validate ở bước nào?
   ↳ Follow-up: Schema được truyền cho LLM hay chỉ dùng để validate sau?
   ↳ Follow-up: Trường hợp output hợp lệ về cú pháp nhưng sai về ngữ nghĩa thì sao?
24. 🔥 Làm sao bắt LLM trả đúng JSON: native structured output của provider, tool calling bắt buộc, prompt + parse, hay thư viện? Khác nhau giữa 4 provider ra sao?
25. Output bị lỗi dạng thế nào hay gặp nhất (JSON cụt do max tokens, markdown fence ```json, trailing comma, thiếu trường, sai kiểu, enum lạ)?
26. Bạn xử lý output bị cắt cụt vì hết max_tokens như thế nào?
27. Parse JSON "khoan dung" (repair JSON) có dùng không? Rủi ro của việc tự sửa?
28. Khi validation fail: bạn làm gì ngay (retry nguyên prompt, retry kèm thông báo lỗi cho LLM, đổi provider)?
29. Schema evolution: khi thêm / đổi trường, dữ liệu cũ đã lưu thế nào? Có versioning cho schema không?
30. Field optional vs required, giá trị mặc định, null: bạn thiết kế thế nào để LLM ít sai nhất?
31. Giới hạn của JSON Schema mà từng provider hỗ trợ (strict mode của OpenAI hạn chế một số keyword, Gemini hỗ trợ subset): bạn gặp vấn đề nào?
32. Validate giá trị ngữ nghĩa (điểm trong khoảng 0-100, skill list không rỗng, ngày hợp lệ): làm ở schema hay tầng khác?
33. Tên trường và mô tả trường (field description) ảnh hưởng thế nào tới chất lượng output? Bạn tối ưu thế nào?
34. Nested schema phức tạp có làm giảm độ chính xác không? Bạn có chia thành nhiều call không?
35. Bạn có log lại các output invalid để phân tích không? Tỉ lệ invalid ban đầu và sau khi sửa là bao nhiêu?
36. ⚠️ Con số cụ thể: tỉ lệ call phải retry vì lỗi schema là bao nhiêu phần trăm? Bạn đo bằng gì?
37. Giá trị `temperature`, `top_p` ảnh hưởng thế nào tới độ ổn định của structured output? Bạn đặt bao nhiêu?
38. Reasoning model (có thinking) và structured output: có xung đột gì không?
39. Bảo mật: output của LLM đi vào DB / HTML - bạn sanitize thế nào (injection, XSS)?

## D. Retry, fallback và độ tin cậy

40. 🔥 "Automatic retries" - retry cho những loại lỗi nào (429, 5xx, timeout, lỗi schema, nội dung bị chặn)? Loại lỗi nào không retry?
   ↳ Follow-up: Chiến lược backoff (exponential, jitter) cụ thể? Số lần tối đa?
   ↳ Follow-up: Retry trên lỗi 4xx (bad request) có hợp lý không?
41. 🔥 Retry do lỗi hạ tầng và retry do lỗi schema khác nhau thế nào về cách làm và về ngân sách (số lần, chi phí)?
42. Tôn trọng header `Retry-After` / rate-limit headers của provider không?
43. Idempotency: gọi LLM bị timeout nhưng provider vẫn tính tiền và xử lý xong - retry có gây tốn tiền gấp đôi không? Chấp nhận hay chặn?
44. Fallback sang provider khác khi provider chính lỗi: tự động hay cấu hình? Kết quả từ model khác có nhất quán không?
45. Circuit breaker: nếu một provider sập kéo dài, bạn tránh gọi liên tục thế nào?
46. Tổng thời gian tối đa cho một tác vụ (timeout tổng) khi retry nhiều lần là bao nhiêu? User thấy gì?
47. Retry kèm thông báo lỗi validation vào prompt ("lần trước bạn trả sai chỗ X"): hiệu quả hơn retry thường không? Bạn đo chưa?
48. Content filter / safety refusal (Gemini block, Anthropic/OpenAI refusal): bạn phát hiện và xử lý thế nào?
49. Làm sao tránh vòng lặp retry vô hạn / đốt tiền khi prompt có vấn đề thật?
50. Khi quá giới hạn retry thì trả lỗi gì? Trạng thái job/tác vụ lưu lại thế nào để chạy lại sau?
51. Lỗi từng phần trong tác vụ batch (50 job, 3 job fail): xử lý partial failure ra sao?
52. Test retry thế nào (mock provider trả 429, JSON hỏng)? Có test tự động không?

## E. Chi phí, giới hạn, quan sát (observability)

53. 🔥 Bạn theo dõi chi phí LLM thế nào (token in/out nhân giá)? Có lưu theo user / theo tác vụ không?
54. Có hạn mức (budget cap, quota per user) để chặn lạm dụng không?
55. Prompt caching (Anthropic cache_control, OpenAI automatic caching, Gemini context caching): bạn có tận dụng không? Tiết kiệm bao nhiêu?
56. Chọn model theo độ khó tác vụ (router): có không? Tiêu chí?
57. So sánh 4 provider cho cùng tác vụ: chất lượng, độ trễ, giá, độ ổn định output - kết quả bạn rút ra là gì?
58. ⚠️ Bạn có số liệu benchmark thực tế giữa các provider trên chính dữ liệu của mình không, hay chỉ cảm tính?
59. Logging: lưu prompt và response không? Rủi ro PII (CV) trong log? Retention?
60. Tracing/metrics (latency, tỉ lệ lỗi, token) có không? Dùng công cụ gì (Langfuse, OpenTelemetry, tự viết)?
61. Context window khác nhau: CV + JD dài vượt giới hạn thì xử lý thế nào (cắt, tóm tắt, chia)?
62. Rate limit khác nhau theo provider/tier: bạn xử lý hàng đợi và throttling toàn cục thế nào?
63. Provider deprecate model (đổi tên, ngừng hỗ trợ) thì bạn phát hiện và xử lý thế nào?
64. Batch API (OpenAI/Anthropic batch) giảm 50% giá cho tác vụ không gấp: bạn có dùng không?

## F. Bảo mật và pháp lý

65. 🔥 API key của 4 provider lưu và nạp thế nào? Mỗi user có tự cung cấp key (BYOK) hay dùng key chung của bạn?
   ↳ Follow-up: Nếu BYOK, key người dùng lưu thế nào (mã hóa, KMS)? Log có lộ key không?
   ↳ Follow-up: Nếu key chung, ngăn lạm dụng thế nào?
66. Dữ liệu CV gửi cho nhiều provider: chính sách lưu dữ liệu / training của từng provider (zero data retention) bạn có tìm hiểu không?
67. DeepSeek có máy chủ ở Trung Quốc: vấn đề data residency / bảo mật khi gửi CV (PII) bạn cân nhắc thế nào?
68. Prompt injection từ nội dung job/CV: layer của bạn có lớp phòng vệ nào (tách instruction và data, delimiter, kiểm tra output)?
69. Output của LLM có thể chứa nội dung không an toàn / sai: có kiểm duyệt (moderation) không?
70. Cho phép người dùng chọn provider hay chỉ quản trị viên chọn? Vì sao?

## G. Test, bảo trì và chất lượng

71. Test layer này thế nào: unit test với mock, contract test, hay gọi provider thật? Chi phí test và flaky?
72. Làm sao đảm bảo khi đổi provider/model, chất lượng đầu ra không tụt (regression)? Có dùng evaluation set không?
73. Bạn mock một provider thế nào để test retry và schema fail?
74. Type safety: kiểu dữ liệu từ schema được phản ánh sang code thế nào (type inference)?
75. Cấu hình provider (env var, file config) có validate lúc khởi động không? Thiếu API key của provider không dùng thì sao?
76. Khi thêm provider mới, tài liệu hoặc test mẫu nào giúp người khác (hoặc bạn tương lai) làm theo?
77. Phiên bản SDK của provider cập nhật nhanh, breaking change: bạn quản lý thế nào?

## H. Đánh đổi, tình huống và kiểm tra độ thật

78. 🔥 Quyết định thiết kế khó nhất của LLM layer là gì? Bạn từng viết lại nó chưa? Vì sao?
79. ⚠️ Mở file adapter của Anthropic và của OpenAI: bạn chỉ ra được những điểm khác nhau cốt lõi khi gọi API (tham số max_tokens bắt buộc, cách trả usage, định dạng content block) không?
80. ⚠️ Giải thích cách bạn ép structured output với Anthropic (không có JSON mode như OpenAI) và với Gemini khác nhau thế nào.
81. ⚠️ DeepSeek có model reasoning (R1) và model chat: layer của bạn xử lý trường hợp reasoning_content như thế nào?
82. Tình huống: sáng nay provider chính trả 529/overloaded liên tục. Hệ thống làm gì tự động, bạn can thiệp thế nào?
83. Tình huống: hóa đơn LLM tháng này tăng gấp 5. Bạn điều tra từ đâu?
84. Tình huống: model mới ra, rẻ hơn 3 lần. Bạn quyết định chuyển thế nào, đo cái gì trước khi chuyển?
85. Tình huống: output JSON từ một provider đột nhiên đổi định dạng sau khi họ cập nhật model. Bạn phát hiện bằng cách nào?
86. Tình huống: một user phàn nàn kết quả "kỳ lạ". Bạn có đủ log để tái hiện (prompt, model, version, seed) không?
87. Nếu chỉ được giữ một provider, bạn giữ cái nào và vì sao?
88. Layer này nên mở nguồn / tách thành thư viện riêng không? Cần thêm gì để dùng bởi người khác?
89. Khác biệt giữa việc "gọi LLM" và "xây hệ thống dùng LLM đáng tin cậy" theo kinh nghiệm của bạn là gì?
90. Bạn học được gì về hạn chế của LLM (non-determinism, hallucination, drift) khi xây layer này?
91. Nếu LLM provider đồng loạt tăng giá, mô hình kinh doanh của Kestrel còn đứng vững không?
92. Bạn có dùng AI coding assistant để viết layer này? Phần nào bạn tự hiểu và kiểm chứng?
