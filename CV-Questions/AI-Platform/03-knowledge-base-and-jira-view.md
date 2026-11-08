# AI-driven Delivery Workflow Platform: Knowledge base Confluence và Jira view

> Built a knowledge base from Confluence documentation for answering questions and investigating bugs, and a Jira-based view of task status and delivery schedule.

Chú thích: 🔥 = xác suất bị hỏi cao / dễ bị đào sâu. ⚠️ = câu bẫy kiểm tra độ thật của claim trong CV.

---

## A. Phạm vi, động lực và xác minh đóng góp

1. 🔥 ⚠️ "Built a knowledge base": bạn tự xây hoàn toàn, hay dùng sản phẩm có sẵn (Confluence AI, Rovo, Glean, Notion AI, vector DB managed) rồi cấu hình?
   ↳ Follow-up: Phần nào là code bạn viết, phần nào là dịch vụ có sẵn?
   ↳ Follow-up: Ai cùng làm với bạn?
2. Vì sao cần knowledge base riêng khi Confluence đã có search? Bài toán cụ thể nào Confluence search không giải được?
3. Ai là người dùng chính của KB (dev, QA, BA, newcomer)? Họ hỏi những loại câu hỏi nào?
4. Tần suất sử dụng thực tế: bao nhiêu câu hỏi mỗi ngày/tuần, bao nhiêu người dùng thường xuyên?
5. ⚠️ Có số liệu hay phản hồi cụ thể nào cho thấy KB hữu ích (thời gian tìm thông tin giảm, số câu hỏi hỏi lại giảm)?
6. KB gắn với phần còn lại của platform thế nào: nó được pipeline (requirements review, code gen, AI review) dùng chung hay là tính năng riêng?
7. Bạn phát triển KB trong bao lâu? Phiên bản đầu tiên khác phiên bản hiện tại thế nào?
8. Nguồn dữ liệu có thuần Confluence không? Có thêm Jira, code, Function Design, tài liệu vendor không? Vì sao CV chỉ nói Confluence?
9. Function Design của vendor nằm ở đâu: Confluence, file Word/Excel/PDF, hay nơi khác? Có được đưa vào KB không?
10. Phạm vi nội dung trong KB: nghiệp vụ kho (inbound, outbound, tồn kho), kiến trúc, convention, hướng dẫn vận hành? Bao nhiêu page/space?

## B. "Answering questions": hỏi đáp trên tài liệu

11. 🔥 Mô tả kiến trúc của hệ thống hỏi đáp: từ câu hỏi người dùng đến câu trả lời, đi qua những bước nào?
   ↳ Follow-up: Đây có phải RAG cổ điển (retrieve rồi generate) hay agentic search (agent tự grep/đọc file)?
   ↳ Follow-up: Vì sao chọn cách đó?
12. Người dùng hỏi qua giao diện nào (CLI, Slack, web, Jira comment)? Vì sao?
13. Dùng LLM nào để trả lời? Quản lý prompt cho phần hỏi đáp thế nào?
14. Câu trả lời có trích dẫn nguồn (link tới page Confluence, đoạn văn) không? Vì sao quan trọng?
15. Khi tài liệu không có câu trả lời thì hệ thống xử lý thế nào ("không biết" hay đoán)?
16. Khi tài liệu mâu thuẫn nhau (hai page nói khác nhau, bản cũ và bản mới), hệ thống chọn gì?
17. Xử lý câu hỏi hội thoại nhiều lượt (follow-up) và giữ ngữ cảnh thế nào?
18. Câu hỏi mơ hồ hoặc dùng thuật ngữ nội bộ/viết tắt (WES, WIV, FD, tên kho) thì xử lý sao?
19. Đa ngôn ngữ: tài liệu tiếng Anh, câu hỏi tiếng Việt (hoặc ngược lại). Embedding và LLM xử lý ra sao?
20. Làm sao đo chất lượng trả lời (độ chính xác, độ đầy đủ, groundedness)? Có bộ câu hỏi chuẩn (golden set) không?
21. 🔥 Hallucination trong hỏi đáp: AI trả lời sai nhưng nghe rất thuyết phục về nghiệp vụ kho. Bạn phát hiện và giảm thiểu thế nào?
22. Người dùng phản hồi "sai" thì quy trình cải thiện thế nào (thumbs down, log, sửa tài liệu)?
23. Độ trễ trả lời trung bình? Có cache câu hỏi lặp không?
24. Chi phí mỗi câu hỏi, mỗi tháng? Có tối ưu không?

## C. RAG và xử lý tri thức

### C1. Thu thập và tiền xử lý

25. 🔥 Lấy dữ liệu từ Confluence bằng cách nào (REST API, export, webhook)? Cloud hay Data Center?
26. Nội dung Confluence có bảng, hình, sơ đồ (draw.io), macro, file đính kèm, code block. Bạn xử lý từng loại thế nào?
   ↳ Follow-up: Hình ảnh/sơ đồ chứa thông tin quan trọng thì sao (OCR, mô tả bằng vision model, bỏ qua)?
   ↳ Follow-up: Bảng (ví dụ bảng mapping, bảng trạng thái) có giữ cấu trúc khi chuyển sang văn bản không?
27. Làm sạch dữ liệu: loại boilerplate, trang rác, bản nháp, trang lỗi thời thế nào?
28. Metadata nào được lưu kèm (space, page ID, người sửa, ngày, phiên bản, nhãn, đường dẫn cha-con)?
29. Cấu trúc phân cấp page (cha-con, space) được tận dụng thế nào trong retrieval?

### C2. Chunking

30. 🔥 Chiến lược chunking: kích thước, overlap, chia theo heading hay theo token? Vì sao chọn?
   ↳ Follow-up: Đã thử nhiều chiến lược chưa? So sánh kết quả thế nào?
   ↳ Follow-up: Chunk cắt giữa bảng hoặc giữa một quy trình nhiều bước thì mất ngữ cảnh. Xử lý sao?
31. Chunk có kèm tiêu đề trang, đường dẫn heading (contextual header) để bù ngữ cảnh không?
32. Tài liệu rất dài (Function Design hàng chục trang) chunk thế nào để không mất mạch logic?
33. Tài liệu chứa SQL hoặc code: chunk và index khác văn bản thường thế nào?

### C3. Embedding và vector store

34. 🔥 Dùng embedding model nào? Vì sao? Có hỗ trợ tiếng Việt và thuật ngữ kỹ thuật không?
35. Vector store là gì (pgvector, Qdrant, Chroma, Elasticsearch, FAISS...)? Vì sao chọn? Chạy ở đâu?
36. Có dùng hybrid search (BM25/keyword kết hợp vector) không? Với mã lỗi, tên bảng, tên API thì keyword quan trọng thế nào?
37. Reranking: có dùng cross-encoder/LLM rerank không? Hiệu quả ra sao?
38. Top-k chọn bao nhiêu? Vì sao? Ảnh hưởng thế nào đến độ chính xác và chi phí?
39. Query rewriting, mở rộng truy vấn (HyDE, multi-query) có dùng không?
40. Đánh giá retrieval: dùng metric nào (recall@k, MRR)? Có đo không hay chỉ cảm tính?
41. Kích thước KB (số page, số chunk, dung lượng vector)? Có vấn đề scale không?
42. Nếu không dùng vector mà để agent tự tìm kiếm trực tiếp (grep, đọc page qua API), ưu nhược điểm so với RAG là gì? Bạn chọn gì và vì sao?

### C4. Đồng bộ và cập nhật

43. 🔥 Đồng bộ với Confluence thế nào: định kỳ, theo webhook, theo sự kiện sửa page? Độ trễ bao lâu?
   ↳ Follow-up: Page bị sửa/xóa/di chuyển thì KB xử lý thế nào?
   ↳ Follow-up: Làm sao phát hiện nội dung đã đổi (hash, version, lastModified)?
   ↳ Follow-up: Re-index toàn bộ có tốn kém không? Có hỗ trợ incremental không?
44. Thông tin lỗi thời trong KB gây hại thế nào? Bạn đảm bảo "tươi" ra sao?
45. Có cơ chế đánh dấu độ tin cậy của tài liệu (bản chính thức vs bản nháp, ngày cập nhật) không?
46. Khi phiên bản dự án thay đổi (major/minor release, kho khác nhau), KB có phân biệt theo phiên bản/kho không?

## D. Phân quyền, bảo mật và NDA

47. 🔥 Phân quyền: Confluence có page hạn chế theo space/người dùng. KB có tôn trọng quyền đó không, hay ai hỏi cũng thấy toàn bộ?
   ↳ Follow-up: Nếu không, người không có quyền có thể "moi" nội dung nhạy cảm qua chatbot. Bạn xử lý thế nào?
   ↳ Follow-up: Nếu có, bạn kiểm tra quyền theo từng người dùng bằng cách nào (token người dùng, ACL lưu cùng chunk)?
48. Tài liệu chứa thông tin NDA của khách hàng/vendor được gửi vào embedding API hoặc LLM bên ngoài. Có được duyệt không? Dữ liệu đi qua đâu?
49. Lưu trữ vector và văn bản gốc ở đâu (on-prem, cloud)? Mã hóa, backup, kiểm soát truy cập?
50. Credential để đọc Confluence: loại token nào, quyền gì (read-only?), ai giữ? Lộ token thì sao?
51. Dữ liệu cá nhân hoặc bí mật (mật khẩu, connection string, IP nội bộ) lỡ nằm trong Confluence thì KB xử lý thế nào (lọc, che)?
52. Prompt injection qua tài liệu: một page Confluence chứa chỉ thị độc hại hoặc nội dung bị sửa bởi người ngoài. KB/LLM xử lý thế nào?
53. Log câu hỏi/câu trả lời có lưu không? Có chứa thông tin nhạy cảm không? Ai xem được?
54. Quyền của AI trong KB: chỉ đọc hay có thể ghi/sửa Confluence? Vì sao?

## E. Điều tra bug với KB

55. 🔥 "Investigating bugs": KB giúp điều tra bug cụ thể thế nào? Quy trình từ ticket bug đến giả thuyết nguyên nhân?
   ↳ Follow-up: Input là gì (mô tả bug, log, stack trace, mã lỗi, ticket Jira)?
   ↳ Follow-up: Output là gì (nguyên nhân khả dĩ, trang liên quan, đoạn code nghi ngờ, các bước kiểm tra)?
   ↳ Follow-up: Cho một ví dụ bug thật (không vi phạm NDA) đã được điều tra nhanh hơn nhờ KB.
56. KB chỉ chứa tài liệu Confluence, còn nguyên nhân bug nằm ở code/dữ liệu/cấu hình. Làm sao AI điều tra bug mà không có code hoặc dữ liệu thật? Có kết nối codebase không?
57. Bạn không có quyền production (dev chỉ có log/Datadog hạn chế). AI có truy cập được log, DB production không? Nếu không thì "investigating" ở mức nào?
58. Dùng AI điều tra bug thì dữ liệu log chứa thông tin khách hàng có đi lên LLM không? Bạn kiểm soát thế nào?
59. AI chẩn đoán sai nguyên nhân (root cause giả) thì sao? Có trường hợp nào dẫn dev đi sai hướng, mất thêm thời gian?
60. Phân biệt triệu chứng và root cause: AI làm tốt chỗ này không? Ví dụ trong dự án (race condition, transaction, data mapping)?
61. Với bug nghiệp vụ phức tạp (concurrency, tồn kho lệch), AI hỗ trợ được tới đâu? Con người vẫn quyết định phần nào?
62. Có tích hợp với Datadog, log, hệ thống giám sát không? Hay chỉ trả lời từ tài liệu?
63. KB có lưu lịch sử bug đã giải (post-mortem, ticket cũ) để gợi ý bug tương tự không? Cách làm thế nào?
64. Làm sao đo hiệu quả điều tra bug (thời gian tìm root cause giảm, số bug được gợi ý đúng)?
65. Bug điều tra bằng KB có dẫn tới việc cập nhật lại tài liệu (đóng vòng phản hồi) không?
66. Điều tra bug có thể đề xuất fix không? Quy trình từ đề xuất tới code thật tận dụng phần pipeline sinh code thế nào?

## F. Jira view: trạng thái task và lịch giao hàng

67. 🔥 "A Jira-based view of task status and delivery schedule": đây là gì cụ thể (dashboard, báo cáo, trang web, bot, Gantt)? Cho mình xem/mô tả giao diện.
   ↳ Follow-up: Người dùng chính là ai (dev, Sub-lead, PM, khách hàng)?
   ↳ Follow-up: Cái này khác gì dashboard/Gantt/Roadmap có sẵn của Jira (Advanced Roadmaps, Structure, eazyBI)?
68. ⚠️ Vì sao cần tự xây khi Jira có sẵn dashboard, filter, timeline? Giá trị tăng thêm là gì?
69. Dữ liệu lấy từ Jira thế nào (REST API, JQL, webhook)? Làm mới bao lâu một lần?
70. Hiển thị những thông tin nào: trạng thái, assignee, estimate, due date, sprint, blocked, phụ thuộc, % hoàn thành?
71. "Delivery schedule" được tính thế nào: từ due date nhập tay, từ estimate, từ velocity? Có dự báo ngày giao dự kiến không?
72. Nếu có dự báo, thuật toán/giả định là gì? Độ chính xác ra sao?
73. Dữ liệu Jira thường không sạch (status không cập nhật, thiếu estimate). Bạn xử lý thế nào để view vẫn đáng tin?
74. Có tích hợp LLM trong view này không (tóm tắt trạng thái, cảnh báo rủi ro trễ), hay chỉ là báo cáo dữ liệu thuần?
75. Có hiển thị task bị blocked chờ vendor/khách hàng không? Có liên kết với vế "giảm thời gian chờ" trong bullet 2 không?
76. Với vai trò Sub-lead (theo dõi tiến độ), bạn dùng view này trong daily meeting thế nào? Nó thay đổi cách bạn quản lý ra sao?
77. PM/khách hàng có truy cập view này không? Phân quyền thế nào, có lộ thông tin nội bộ không?
78. Nhiều kho/nhiều release (major/minor) được thể hiện thế nào trong view? Lọc theo kho, theo nhánh release?
79. Làm sao đảm bảo Jira view đồng bộ với thực tế mã nguồn (PR, merge, release)? Có liên kết GitHub không?
80. Dữ liệu được lưu lại (snapshot lịch sử) để xem xu hướng không, hay chỉ trạng thái hiện tại?
81. View được xây bằng công nghệ gì (frontend, backend, DB)? Là bạn viết hay dùng công cụ BI?
82. Jira rate limit và hiệu năng truy vấn khi project lớn: bạn xử lý thế nào (cache, phân trang, JQL tối ưu)?
83. Số lượng ticket, số người dùng của view? Có vấn đề scale không?
84. Jira view này có được chứng minh giúp giảm trễ deadline hoặc tăng khả năng dự báo không?

## G. Tích hợp Confluence và Jira trong cùng nền tảng

85. Liên kết giữa ticket Jira và page Confluence (FD, spec) được dùng thế nào? KB có tự tìm tài liệu liên quan tới ticket không?
86. Khi tạo ticket mới, platform có gợi ý tài liệu liên quan, ticket trùng, hoặc bug tương tự không?
87. Xác thực với Atlassian: OAuth, API token, service account? Quyền tối thiểu cần thiết?
88. Nếu Atlassian đổi API hoặc quota, hệ thống chịu ảnh hưởng ra sao?
89. Dữ liệu từ hai nguồn (Confluence và Jira) có định danh chung (key, ID) để join không? Xử lý bất nhất thế nào?

## H. Vận hành và bảo trì

90. Ai chịu trách nhiệm chất lượng nội dung KB (tài liệu sai thì KB sai)? Có quy trình nâng chất lượng tài liệu không?
91. Monitoring: bạn biết KB hoặc đồng bộ bị hỏng bằng cách nào? Có alert không?
92. Sự cố thực tế đã gặp (đồng bộ sai, index lỗi, trả lời lệch, token hết hạn)? Cách xử lý?
93. Chi phí vận hành hàng tháng (embedding, LLM, lưu trữ, hạ tầng)?
94. Cập nhật embedding model/LLM có buộc re-index không? Quy trình?
95. Backup và khôi phục KB thế nào?
96. Test cho KB: có test hồi quy chất lượng trả lời mỗi khi đổi chunking, embedding, prompt không?
97. Thu thập phản hồi người dùng và cải tiến theo thời gian thế nào?

## I. Rủi ro và đánh đổi

98. Rủi ro lớn nhất của KB là gì (sai thông tin, lộ dữ liệu, phụ thuộc quá mức, tài liệu cũ)? Bạn giảm thế nào?
99. Nếu người dùng tin tuyệt đối câu trả lời của KB và làm sai nghiệp vụ kho thì ai chịu trách nhiệm?
100. KB có thể làm người dùng ngừng đọc tài liệu gốc không? Có tác động xấu gì?
101. Với newcomer: KB giúp onboard nhanh hơn hay tạo hiểu biết nông? Bạn có quan sát nào không?
102. Rủi ro phụ thuộc vào nhà cung cấp (Anthropic, embedding provider, Atlassian)? Kế hoạch dự phòng?
103. Nếu KB đưa ra câu trả lời mâu thuẫn với Function Design chính thức từ vendor, bạn tin cái nào, xử lý sao?

## J. Câu hỏi bẫy kiểm tra độ thật

104. ⚠️ Mở KB lên và demo/mô tả: gõ một câu hỏi thật về nghiệp vụ kho, hệ thống trả lời gì, trích nguồn gì? (Mình hỏi bạn từng bước dữ liệu đi qua đâu.)
105. ⚠️ Số page Confluence đã được index là bao nhiêu? Số chunk? Kích thước embedding? Nếu bạn không nhớ, vì sao chưa đo?
106. ⚠️ Chunk size và overlap chính xác bạn dùng là bao nhiêu? Bạn đã thử đổi chưa, kết quả cụ thể?
107. ⚠️ Nếu đúng là RAG, bạn cho mình thấy một ví dụ truy vấn mà retrieval trả sai chunk và bạn đã sửa thế nào.
108. ⚠️ "Investigating bugs": có đúng là nó điều tra được bug, hay chỉ là hỏi đáp tài liệu có liên quan tới bug? Ranh giới ở đâu?
109. ⚠️ Jira view có thật sự do bạn viết, hay chỉ là dashboard/filter cấu hình trên Jira? Mô tả phần code bạn viết.
110. ⚠️ Bạn có số liệu về mức sử dụng thực tế của KB và Jira view (người dùng hoạt động, số truy vấn) không?
111. ⚠️ Nếu mình nói "đây chỉ là chatbot gọi API Confluence rồi nhét vào prompt", bạn phản bác thế nào?
112. ⚠️ Có phải KB chủ yếu giúp những người bạn thân trong team, hay cả team (và các team khác) dùng? Dẫn chứng?
113. ⚠️ Khách hàng và vendor có biết nội dung Confluence của dự án được đưa lên dịch vụ AI không? Có biên bản đồng ý không?

## K. Câu hỏi tình huống

114. Tình huống: một page chứa quy tắc nghiệp vụ lỗi thời nhưng KB vẫn trích dẫn nó, dev code sai theo. Bạn xử lý hậu quả và phòng ngừa thế nào?
115. Tình huống: QA hỏi KB "quy tắc phân bổ tồn kho cho kho X" và nhận câu trả lời lẫn lộn với kho Y. Bạn gỡ lỗi thế nào?
116. Tình huống: vendor yêu cầu chứng minh dữ liệu FD của họ không bị đưa ra ngoài hệ thống. Bạn trình bày kiến trúc dữ liệu thế nào?
117. Tình huống: Confluence có page "Credentials" chứa mật khẩu UAT. KB đã index. Bạn xử lý ra sao ngay lập tức?
118. Tình huống: một dev mới hỏi KB về lỗi `deadlock` khi chạy batch. KB trả về nội dung chung chung vô ích. Bạn cải thiện retrieval thế nào?
119. Tình huống: PM muốn Jira view hiển thị "ngày giao dự kiến" cho khách hàng. Nhưng dữ liệu Jira thiếu estimate. Bạn tư vấn thế nào?
120. Tình huống: team muốn mở rộng KB sang cả mã nguồn và log production. Bạn cân nhắc những rủi ro và thiết kế gì?
121. Tình huống: lượng page tăng gấp 10 lần và truy vấn chậm đi. Bạn xử lý thế nào?
122. Tình huống: sau khi đổi embedding model, chất lượng retrieval xấu đi. Bạn phát hiện và quay lại thế nào?

## L. Hành vi và phản tư

123. Phần nào trong KB hay Jira view khiến bạn tự hào nhất? Phần nào bạn thấy còn yếu?
124. Bạn học được gì về RAG/LLM từ việc xây KB này mà ban đầu không nghĩ đến?
125. Nếu làm lại, bạn thiết kế KB khác ở điểm nào?
126. Điều gì làm KB thất bại mà bạn đã thấy ở các dự án nội bộ tương tự? Bạn tránh thế nào?
127. Bạn đã bao giờ phát hiện nhờ KB một vấn đề của chính tài liệu (mâu thuẫn, thiếu) không? Bạn xử lý thế nào?
128. Với vai trò Backend Engineer, phần KB/Jira view này có liên quan gì tới mong muốn trở thành Solution Architect của bạn?
129. Có điều gì bạn muốn bổ sung vào KB hoặc view nếu có thêm thời gian và nguồn lực?
130. Kinh nghiệm này giúp bạn vào vị trí đang ứng tuyển như thế nào?
