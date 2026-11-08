> Combined vector search over embeddings (pgvector) to shortlist jobs with LLM enrichment of job descriptions and match analysis, giving each match an explanation. Built an evaluation set to tune matching quality.

Chú thích: 🔥 = xác suất bị hỏi cao / dễ bị đào sâu. ⚠️ = câu bẫy kiểm tra độ thật / độ chính xác của claim trong CV.

## A. Tổng quan luồng và động lực thiết kế

1. 🔥 Giải thích pipeline matching end-to-end: từ CV + job đến danh sách match có giải thích. Bước nào dùng vector search, bước nào dùng LLM?
   ↳ Follow-up: Vì sao cần cả hai bước thay vì chỉ dùng LLM chấm điểm tất cả job?
   ↳ Follow-up: Vì sao không chỉ dùng vector search rồi trả luôn kết quả?
2. 🔥 "Shortlist" nghĩa là gì ở đây? Shortlist bao nhiêu job (top-K) và vì sao chọn K đó?
3. Vì sao bạn chọn kiến trúc "retrieve rồi rerank/analyze" (two-stage)? Bạn đã thử phương án đơn giản hơn (keyword search, TF-IDF) để làm baseline chưa?
4. Tại sao bài toán job matching phù hợp với embedding? Điểm yếu của embedding cho bài toán này là gì (số năm kinh nghiệm, phủ định, level)?
5. ⚠️ "Giving each match an explanation" - giải thích này đến từ đâu? Đó là lý do thật mô hình dùng để chấm hay là lời hợp lý hóa sau khi đã chấm (post-hoc rationalization)?
6. Một ví dụ cụ thể: CV của một backend engineer 2 năm kinh nghiệm, một job được match - điểm số và giải thích trông như thế nào?
7. Match analysis gồm những trường nào (điểm, điểm mạnh, điểm thiếu, gợi ý)? Cấu trúc đầu ra được thiết kế dựa trên điều gì?
8. Chi phí và độ trễ cho một lần match end-to-end là bao nhiêu? Bạn đo bằng cách nào?
9. Phần nào của pipeline này bạn nghĩ là "đóng góp riêng" của mình, phần nào là cách làm phổ biến (RAG-like)?

## B. Embedding

10. 🔥 Bạn dùng embedding model nào (OpenAI text-embedding-3, Gemini embedding, bge, e5, ...)? Vì sao chọn? Số chiều bao nhiêu?
   ↳ Follow-up: Model có hỗ trợ tiếng Việt tốt không? Bạn kiểm chứng thế nào?
   ↳ Follow-up: Khi đổi model embedding thì phải làm gì với dữ liệu cũ?
11. Bạn embed cái gì: toàn bộ job description, title, hay phần đã được LLM enrich/tóm tắt? Vì sao?
12. CV được embed như thế nào: cả CV thành một vector, hay chia theo mục (skills, experience, projects)? Trade-off?
13. Chunking: job description dài thì cắt thế nào? Có overlap không? Vì sao?
14. Một vector đại diện cho cả CV có làm mất thông tin không (CV nhiều mảng khác nhau)? Bạn xử lý ra sao?
15. Text được chuẩn hóa trước khi embed thế nào (bỏ HTML, boilerplate, "chúng tôi cung cấp bảo hiểm...")? Boilerplate ảnh hưởng thế nào tới similarity?
16. Mô tả job và CV có "phân phối" khác nhau (ngôn ngữ, văn phong) - bạn xử lý asymmetric retrieval thế nào (query vs document prefix)?
17. Cosine similarity vs dot product vs L2: bạn dùng cái nào và vì sao? Vector có được normalize không?
18. ⚠️ Embedding là gì về mặt toán học/trực giác? Giải thích cho người không chuyên và cho người chuyên.
19. Chi phí embedding cho toàn bộ job và cho mỗi lần user cập nhật CV? Có batch / cache embedding không?
20. Giới hạn token của model embedding ảnh hưởng thế nào tới text dài?
21. Embedding có bị drift hay phụ thuộc phiên bản model không? Bạn lưu version model cùng vector không?
22. Mô tả job tiếng Việt lẫn tiếng Anh (cross-lingual): bạn kiểm tra chất lượng thế nào?
23. Thuật ngữ kỹ thuật ngắn (Go, C, R, .NET, Java vs JavaScript) có bị embedding hiểu sai không? Bạn gặp trường hợp thực tế nào?

## C. pgvector và ANN index

24. 🔥 Vì sao dùng pgvector thay vì vector DB chuyên dụng (Pinecone, Qdrant, Weaviate, Milvus)? Khi nào bạn sẽ đổi?
   ↳ Follow-up: Lợi ích của việc để vector cùng DB quan hệ (join, filter, transaction)?
   ↳ Follow-up: Giới hạn của pgvector bạn đã chạm tới chưa?
25. 🔥 Bạn dùng index loại nào: exact (không index), IVFFlat hay HNSW? Vì sao?
   ↳ Follow-up: Giải thích HNSW hoạt động thế nào (layers, entry point, greedy search).
   ↳ Follow-up: Giải thích IVFFlat (lists, probes) và khi nào nó thua HNSW.
26. 🔥 Các tham số bạn tune: m, ef_construction, ef_search (HNSW) hoặc lists, probes (IVFFlat). Giá trị bạn chọn là bao nhiêu và dựa trên gì?
27. Recall vs latency: bạn đo recall của ANN so với exact search bằng cách nào? Recall đạt bao nhiêu?
28. ⚠️ Với số lượng job thực tế của bạn (bao nhiêu bản ghi?), ANN index có thật sự cần thiết hay exact scan là đủ?
29. Câu SQL truy vấn top-K: toán tử nào (`<=>`, `<->`, `<#>`)? Bạn đọc EXPLAIN ANALYZE để xác nhận index được dùng thế nào?
30. Kết hợp filter (địa điểm, còn hạn, level) với ANN: filter trước hay sau? Vấn đề "filtered ANN" trả ít hơn K kết quả bạn xử lý ra sao?
31. Kiểu dữ liệu `vector` vs `halfvec` vs `bit`: bạn có xét quantization để giảm bộ nhớ không?
32. Kích thước index, thời gian build index, bộ nhớ (maintenance_work_mem): bạn quan sát thế nào?
33. Insert/update liên tục (job mới, job hết hạn) có ảnh hưởng chất lượng và hiệu năng index không? Có cần reindex/vacuum không?
34. Vì sao số chiều vector ảnh hưởng đến hiệu năng và độ chính xác? Bạn có giảm chiều (dimension truncation / Matryoshka) không?
35. Thiết kế bảng: embedding lưu ở bảng job hay bảng riêng? Vì sao?
36. Cài đặt pgvector trong Docker/production (extension, version Postgres) có vấn đề gì không?
37. Chiều tìm kiếm: lấy job gần nhất với CV (CV làm query). Có làm chiều ngược lại (job → ứng viên) không?
38. Nếu embedding của hai user giống hệt nhau, kết quả khác nhau hay giống? Có personalization nào không?

## D. Hybrid search và xếp hạng

39. 🔥 Trong CV bạn viết "vector search"; có kết hợp full-text/keyword (BM25, `tsvector`) không? Nếu có, kết hợp thế nào (RRF, weighted sum)?
   ↳ Follow-up: Cho ví dụ truy vấn mà vector search thua keyword search.
   ↳ Follow-up: Cho ví dụ ngược lại.
40. Hard filter (location, remote, lương tối thiểu, level) và soft score (similarity) kết hợp thế nào?
41. Công thức điểm cuối cùng: có hợp nhất điểm similarity, điểm LLM, và các tín hiệu khác không? Trọng số lấy từ đâu?
42. Re-ranking: bạn có dùng cross-encoder hoặc LLM làm reranker không? Chi phí/lợi ích?
43. Đa dạng hóa kết quả (không toàn job cùng một công ty/cùng một nội dung): bạn xử lý không?
44. Cold start: user mới có CV rất ngắn hoặc chưa có CV - kết quả thế nào?
45. Similarity threshold: có ngưỡng cắt "không đủ giống" không? Chọn ngưỡng bằng cách nào?
46. Phân bố similarity score thực tế của bạn trông thế nào (top-1 vs top-50)? Điểm 0.8 có ý nghĩa tuyệt đối không?
47. Điểm similarity có thể so sánh giữa các user khác nhau không? Vì sao / vì sao không?

## E. LLM enrichment của job description

48. 🔥 "LLM enrichment of job descriptions" cụ thể là gì? Trích xuất / chuẩn hóa những trường nào (skills, level, years of experience, tech stack, salary, benefits)?
   ↳ Follow-up: Enrichment chạy lúc crawl (offline) hay lúc user match (online)? Vì sao?
   ↳ Follow-up: Trường nào được dùng để filter, trường nào để embed, trường nào để hiển thị?
49. Vì sao cần enrichment khi đã có description gốc? Giá trị tăng thêm so với embed trực tiếp text gốc là gì? Bạn đã chứng minh bằng số liệu chưa?
50. Chi phí enrichment trên mỗi job và tổng cho toàn bộ job? Bạn dùng model nào cho bước này và vì sao (model rẻ vs mạnh)?
51. Enrichment có bị hallucinate (suy ra yêu cầu không có trong JD) không? Bạn phát hiện và hạn chế thế nào?
52. Job description dài, nhiễu, nhiều ngôn ngữ, định dạng lộn xộn - LLM xử lý thế nào? Giới hạn context?
53. Có cache kết quả enrichment theo hash nội dung để không gọi lại khi job không đổi không?
54. Khi prompt hoặc model enrichment thay đổi, bạn re-enrich toàn bộ dữ liệu cũ hay chỉ job mới? Version hóa thế nào?
55. Job không có mô tả hoặc mô tả quá ngắn thì sao?
56. Prompt injection qua mô tả job: chống thế nào?
57. Có đo độ chính xác của enrichment (so với gán nhãn tay) không? Số liệu là bao nhiêu?
58. Normalize skill (React, ReactJS, React.js → một chuẩn): bạn dùng taxonomy hay LLM tự chuẩn hóa? Consistency giữa các lần chạy?
59. Enrichment có tính nhất quán (determinism) không? Temperature bạn đặt bao nhiêu và vì sao?

## F. Match analysis và explanation

60. 🔥 "Match analysis" LLM nhận input gì (CV đầy đủ hay đã tóm tắt, JD gốc hay enriched) và trả output gì?
   ↳ Follow-up: Prompt có few-shot không? Rubric chấm điểm là gì?
   ↳ Follow-up: Điểm số của LLM có ổn định giữa các lần chạy không?
61. Làm sao đảm bảo explanation bám sát nội dung CV và JD thật, không bịa kỹ năng người dùng không có?
62. Điểm LLM (nếu có) hiệu chỉnh (calibrate) thế nào? 70/100 của job A có ý nghĩa tương đương 70/100 của job B không?
63. LLM-as-a-judge có bias (position bias, verbosity bias, self-preference) không? Bạn xử lý sao?
64. Chi phí: phân tích bao nhiêu job cho mỗi user mỗi lần? Có giới hạn không? Có batch nhiều job trong một prompt không?
65. Có cache kết quả analysis theo (CV hash, job hash) không? Khi CV đổi thì invalidate thế nào?
66. Độ trễ: user phải đợi bao lâu để có explanation? Streaming hay async?
67. Explanation có cần nhiều ngôn ngữ (tiếng Việt/Anh) không? Ngôn ngữ đầu ra quyết định thế nào?
68. Nếu LLM nói "match tốt" nhưng vector similarity thấp (hoặc ngược lại), hệ thống tin bên nào?
69. Hiển thị giải thích cho user thế nào để họ tin được? Có trích dẫn câu trong CV/JD làm bằng chứng không?
70. Yêu cầu "must-have" vs "nice-to-have" trong JD: LLM phân biệt thế nào? Ảnh hưởng đến điểm ra sao?
71. Khả năng thiên kiến/bất công (bias) trong matching: giới tính, tuổi, trường học, tên - bạn có nghĩ tới và kiểm tra chưa?
72. Phản hồi của người dùng (thích / bỏ qua / nộp đơn) có được dùng để cải thiện matching không?

## G. Evaluation set và tinh chỉnh chất lượng

73. 🔥 "Built an evaluation set" - bộ đánh giá gồm bao nhiêu mẫu? Mẫu được tạo thế nào (gán nhãn tay, LLM sinh, từ user thật)? Ai gán nhãn?
   ↳ Follow-up: Bao nhiêu CV, bao nhiêu job mỗi CV? Nhãn là nhị phân hay thang điểm?
   ↳ Follow-up: Có kiểm tra độ đồng thuận giữa người gán nhãn không?
74. ⚠️ Bộ eval nhỏ (vài chục mẫu?) có đủ ý nghĩa thống kê để "tune" không? Bạn xử lý overfitting vào eval set thế nào?
75. 🔥 Metric nào bạn dùng: precision@K, recall@K, NDCG, MRR, MAP, hit rate? Vì sao chọn metric đó cho bài toán này?
   ↳ Follow-up: Định nghĩa và công thức NDCG; vì sao NDCG hợp với dữ liệu có thang điểm?
   ↳ Follow-up: Nếu chỉ chọn một metric để báo cáo, bạn chọn gì?
76. 🔥 Bạn "tune" những gì bằng eval set: embedding model, K, ngưỡng, trọng số hybrid, prompt, model LLM, tham số index? Kết quả trước/sau cụ thể là bao nhiêu?
   ↳ Follow-up: Thay đổi nào cho cải thiện lớn nhất? Thay đổi nào hóa ra không có tác dụng?
   ↳ Follow-up: Bạn từng thấy một thay đổi "có vẻ tốt" nhưng làm metric giảm không?
77. ⚠️ Con số cụ thể: metric baseline là bao nhiêu và sau tune là bao nhiêu? Chênh lệch có ý nghĩa thống kê không?
78. Chia train/dev/test hay tuning và đánh giá trên cùng một tập? Rủi ro data leakage?
79. CV dùng trong eval có phải CV thật không? Xử lý PII ra sao? Nếu là CV tổng hợp (synthetic) thì có đại diện thực tế không?
80. Ground truth "job này phù hợp với CV này" mang tính chủ quan. Bạn định nghĩa tiêu chí phù hợp thế nào?
81. Dùng LLM để sinh nhãn hoặc chấm eval có rủi ro vòng lặp (dùng chính model đang đánh giá)? Bạn xử lý thế nào?
82. Đánh giá riêng retrieval (shortlist) và đánh giá end-to-end (sau LLM) ra sao? Retrieval recall đạt bao nhiêu trước khi qua LLM?
83. Eval có chạy tự động trong CI hoặc theo lệnh để phát hiện regression không?
84. Chi phí chạy một lần eval (LLM calls) là bao nhiêu? Bạn kiểm soát thế nào?
85. Có đánh giá chất lượng explanation (faithfulness, usefulness) riêng không? Bằng cách nào?
86. Eval set có đa dạng ngành/level/ngôn ngữ không? Bias của eval set là gì?
87. Phân tích lỗi (error analysis): nhóm lỗi phổ biến nhất của matcher là gì? Bạn sửa thế nào?
88. Eval offline có tương quan với hành vi người dùng thật không? Bạn có A/B test hoặc online metric không?
89. Nếu người dùng không đồng ý với ranking của hệ thống, bạn xử lý feedback đó vào eval thế nào?

## H. Hiệu năng, chi phí, scale

90. Latency của bước vector search (p50/p95) với dữ liệu hiện tại? Khi dữ liệu gấp 100 lần?
91. Bộ nhớ DB cho vector: N job × d chiều × 4 bytes - tính nhanh cho 1 triệu job với 1536 chiều.
92. Nếu 1.000 user cùng bấm "match" cùng lúc, điểm nghẽn là DB, LLM rate limit hay chi phí?
93. Làm sao giảm chi phí LLM mà không giảm chất lượng (model nhỏ cho enrichment, cache, chỉ phân tích top-N)?
94. Rate limit / quota của provider ảnh hưởng thế nào tới pipeline? Bạn xử lý hàng đợi ra sao?
95. Re-embed toàn bộ khi đổi model: thời gian và chi phí ước tính? Chiến lược migrate không downtime?

## I. Edge case và câu hỏi tình huống

96. CV tiếng Việt, JD tiếng Anh - kết quả có tốt không? Bạn kiểm chứng thế nào?
97. CV rất ngắn / nhiều lỗi / là ảnh scan - pipeline hỏng ở đâu?
98. Người đổi ngành (từ kế toán sang dev): matching nên hành xử thế nào?
99. Job có yêu cầu "ít nhất 5 năm kinh nghiệm" mà CV chỉ có 1 năm: hệ thống xử lý ở bước nào (embedding không nắm được con số này)?
100. Job lương ẩn / "thỏa thuận": tiêu chí lương xử lý thế nào?
101. Mô tả job giống nhau về mặt ngữ nghĩa nhưng khác level (Junior vs Senior): làm sao tách?
102. Nếu top-K không có job nào đủ tốt, hệ thống nên nói gì thay vì cố trả kết quả?
103. Embedding API lỗi giữa chừng khi đang embed hàng loạt: hệ thống phục hồi thế nào?

## J. Đánh đổi, phản tư và kiểm tra độ thật

104. 🔥 Quyết định thiết kế khó nhất trong phần matching là gì? Bạn từ bỏ phương án nào và vì sao?
105. ⚠️ Nếu tôi bảo bạn mở mã nguồn phần query top-K và giải thích từng dòng, bạn làm được không?
106. ⚠️ Bạn đã thực sự đo recall của index hay chỉ dùng tham số mặc định?
107. Nếu làm lại, bạn có dùng một cách tiếp cận khác (fine-tune embedding, learning-to-rank, knowledge graph kỹ năng) không?
108. Giới hạn lớn nhất của cách làm hiện tại là gì? Bạn sẽ không khuyên dùng nó trong trường hợp nào?
109. Kinh nghiệm này giúp ích thế nào cho công việc backend hiện tại hoặc vị trí mà bạn đang ứng tuyển?
