Có API/batch nào bạn viết hoàn toàn dựa trên Function Design mà không phải suy nghĩ thêm không? Vậy đóng góp kỹ thuật riêng của bạn là gì?
🔥 Mỗi kho một app: vậy 15 kho có 15 deployment, 15 database? Vì sao chọn mô hình này? Ưu nhược điểm? ↳ Follow-up: Một bug fix phải đưa lên bao nhiêu app? Quy trình ra sao? ↳ Follow-up: Thay đổi schema DB áp cho từng kho thế nào, có lệch phiên bản schema giữa các kho không? ↳ Follow-up: Nếu làm lại bạn có gom thành multi-tenant không? Cân nhắc gì?
Có báo cáo/giám sát tổng hợp xuyên 15 kho không? Dữ liệu lấy từ đâu khi mỗi kho một DB?
API gọi hệ thống ngoài (ERP, robot, carrier): timeout, retry, circuit breaker, fallback đặt thế nào?
Timeout: API dành cho máy quét cần phản hồi trong bao lâu? Khi quá chậm, nhân viên kho thấy gì?
Một API ghi chạm nhiều bảng: bạn đảm bảo atomic thế nào? Nếu lỗi giữa chừng thì trạng thái dữ liệu ra sao?
Batch lỗi giữa chừng thì chạy lại thế nào (restart, resume, rerun toàn bộ)? Chạy lại có an toàn (idempotent) không?
Lỗi trên một bản ghi: skip, retry hay fail cả job? Bản ghi lỗi lưu ở đâu, ai xử lý?
Batch có xử lý đa luồng không? Nếu có, thread pool cấu hình thế nào và liên hệ với connection pool ra sao?
@Scheduled chạy ở thread nào? Hai job @Scheduled có chạy song song được không? Cấu hình thế nào?
Redis down thì API/batch của bạn phản ứng thế nào (fallback về DB, lỗi)?
Vì sao không chỉ thêm index mà chọn đổi cách viết query trong trường hợp trên? Hai cách giải quyết khác bản chất ở đâu?
🔥 Kể một lần bạn tối ưu hiệu năng API/query/batch trong dự án: triệu chứng, đo đạc, nguyên nhân, cách sửa, kết quả trước/sau.
Tình huống: sáng thứ Hai, batch đêm của một kho chạy xong nhưng số liệu tồn kho sai. Bạn điều tra từ đâu, trong 30 phút đầu?
Tình huống: một API receiving đột nhiên chậm gấp 10 lần ở một kho duy nhất. Bạn nghĩ tới những nguyên nhân nào?
Tình huống: cut-off còn 1 tiếng, batch allocation chưa xong và đang chạy rất chậm. Bạn làm gì?
Tình huống: khách hàng yêu cầu thay đổi logic returns gấp trước ngày release. Bạn thương lượng và đánh giá rủi ro ra sao?
Nếu được làm lại phần API/batch của dự án này, bạn sẽ đổi điều gì về thiết kế, công cụ hay quy trình?
Điều bạn học được lớn nhất về nghiệp vụ kho vận (WMS) qua dự án này là gì mà trước đây bạn không biết?





Làm sao phân biệt query chậm do bản thân nó với chậm do lock chờ, connection pool cạn, hoặc DB đang bận vì job khác?
🔥 Quy trình bạn phân tích một query chậm từ đầu đến cuối là gì? Bước đầu tiên bạn làm?
🔥 EXPLAIN và EXPLAIN ANALYZE khác nhau gì? Vì sao EXPLAIN ANALYZE với câu UPDATE/DELETE phải cẩn thận?
Bạn đọc plan ở những thông số nào đầu tiên: cost, actual time, rows ước lượng so với thực tế, loops, Buffers? ↳ Follow-up: Rows ước lượng lệch thực tế nhiều lần nói lên điều gì? ANALYZE có giúp không?
Seq Scan, Index Scan, Index Only Scan, Bitmap Heap Scan khác nhau gì? Khi nào Seq Scan lại là lựa chọn đúng?
Bạn đọc plan của query có CTE: node CTE Scan nghĩa là gì? Làm sao biết CTE đã được materialize hay inline?
🔥 Kể một query mà bạn viết lại join: query gốc thế nào, vì sao chậm, bạn viết lại ra sao, kết quả bao nhiêu? ↳ Follow-up: Làm sao chứng minh query mới cho cùng kết quả như query cũ? Bạn so sánh tập kết quả bằng cách nào?
LEFT JOIN hay INNER JOIN: có lần nào đổi loại join để planner tối ưu được không? Đổi có làm khác kết quả không?
Điều kiện đặt ở ON hay ở WHERE của LEFT JOIN ảnh hưởng gì đến kết quả và hiệu năng?
IN / EXISTS / JOIN / NOT IN / NOT EXISTS: trong PostgreSQL bản bạn dùng, planner xử lý khác nhau không? Bạn từng thay cái nào bằng cái nào?
🔥 Kể một index bạn thêm: bảng nào, cột nào, kiểu index gì, query nào hưởng lợi, nhanh hơn bao nhiêu? ↳ Follow-up: Vì sao thứ tự cột như vậy? Query nào khác trên bảng đó có bị ảnh hưởng, tốt hay xấu?
🔥 Index đó tốn gì: ghi chậm hơn, dung lượng, bảo trì? Bạn có cân nhắc đánh đổi này không? Bảng đó ghi nhiều hay đọc nhiều?
🔥 Thêm index xong mà query vẫn không dùng. Bạn kiểm tra những gì (statistics, kiểu dữ liệu lệch, hàm bọc cột, selectivity thấp, cost)?
Index trên cột kiểu timestamp khi lọc theo ngày: vì sao WHERE date(created_at) = ? không dùng index và viết lại thế nào?
⚠️ Subquery trong WHERE chạy N lần thật không? Nó tương quan hay độc lập? Chỗ lặp nằm ở SQL hay ở vòng lặp Java? Bạn chứng minh bằng EXPLAIN ANALYZE (loops) hay chỉ suy luận?
Nhớ: subquery độc lập thường chỉ chạy một lần (InitPlan). Chỉ tương quan mới chạy lại theo dòng.🔥 API chậm dần theo thời gian dù code không đổi, hoặc sau release từ 200ms lên 3s: các giả thuyết và cách kiểm tra từng cái.
Gợi ý: dữ liệu tăng, statistics cũ, bloat, plan đổi, lock, pool, hệ thống ngoài.
Batch đột nhiên chậm gấp 5: hỏi gì và kiểm tra gì đầu tiên?
Có 1 ngày để giảm tải DB đang quá tải: làm gì đầu tiên, thứ hai, thứ ba?
Thêm index làm API khác chậm đi, hoặc DBA hay khách hàng từ chối vì sợ ghi chậm: xử lý và thuyết phục bằng bằng chứng gì?
Thêm index lên bảng 200 triệu dòng giữa giờ cao điểm: làm hay từ chối? Cách làm an toàn?
Nhớ: CREATE INDEX CONCURRENTLY, rủi ro index INVALID, làm ngoài giờ cao điểm.
Khách yêu cầu dưới 1 giây nhưng tối ưu hết cách chỉ đạt 3 giây: đề xuất gì? (Cache, bảng tổng hợp, async, đổi yêu cầu.)
Batch chiếm hết connection pool làm API online time-out: xử lý ngay và thiết kế lâu dài (tách pool, giới hạn luồng, timeout).
Member viết query chạy tốt với 1.000 dòng ở dev nhưng chậm với 10 triệu dòng: giúp họ nhìn ra và sửa thế nào, phòng tái diễn ra sao?
Lần tối ưu tự hào nhất, lần học được nhiều nhất, lần đoán sai (nghĩ do index nhưng hóa ra chỗ khác).
Làm lại thì đưa EXPLAIN và kiểm tra hiệu năng vào review hoặc CI từ đầu không?
Điểm yếu trong mảng tối ưu (quyền DB, chưa tuning server, chưa làm partition), bạn bù thế nào, và học thêm bằng cách nào?



🔥 Defect khó nhất bạn xử lý (STAR): vì sao khó, bạn làm gì, kết quả, bài học.
Một lần chẩn đoán sai và phải đổi hướng: điều gì khiến bạn nhận ra?
Nếu làm lại, bạn đầu tư gì để rút ngắn thời gian điều tra (log có cấu trúc, trace, dashboard, quyền đọc DB chỉ-đọc, runbook)?



Bước nào trong pipeline đau nhất, tốn thời gian nhất trước đây?
Vì sao cần platform riêng mà không dùng sẵn Claude Code, Copilot, Cursor hay các công cụ có sẵn? ↳ Follow-up: Platform của bạn có giá trị gì mà dùng Claude Code CLI trực tiếp không có? ↳ Follow-up: Nếu công cụ thương mại ra tính năng tương tự, platform của bạn còn cần thiết không?
Dự án thực tế (kho vận WES/WIV, multi-warehouse, Function Design từ vendor) có đặc thù gì khiến AI generic không đủ dùng?
🔥 Vẽ kiến trúc tổng thể của platform: thành phần nào, luồng dữ liệu thế nào, chạy ở đâu? ↳ Follow-up: Điểm vào (trigger) là gì: người dùng bấm, webhook Jira, comment, CLI, hay lịch chạy? ↳ Follow-up: Có orchestrator trung tâm không? Nó viết bằng gì? ↳ Follow-up: Trạng thái pipeline lưu ở đâu?
Các giai đoạn (stage) chạy tuần tự hay song song? Phụ thuộc giữa các stage ra sao?
Có database riêng cho platform không? Schema chính là gì?
🔥 Vì sao chọn Claude Code SDK mà không gọi thẳng Messages API tự viết agent loop? ↳ Follow-up: Claude Code SDK cho bạn thứ gì có sẵn (tool đọc/sửa file, bash, quản lý context) mà tự viết thì mất công? ↳ Follow-up: Đánh đổi nào khi phụ thuộc SDK (kiểm soát, version, hành vi thay đổi)?
🔥 Bạn có dùng subagent không? Chia subagent theo vai trò nào (spec reviewer, coder, tester, reviewer)? ↳ Follow-up: Subagent giao tiếp với agent chính thế nào, truyền context gì qua lại? ↳ Follow-up: Chia subagent giúp được gì: context sạch, tool hạn chế, hay song song? ↳ Follow-up: Đã thử một agent làm tất cả chưa? Khác biệt chất lượng thế nào?
Bạn định nghĩa tool/MCP server tùy biến nào? Mỗi tool làm gì (đọc Jira, đọc Confluence, tạo PR)? ↳ Follow-up: Tự viết MCP server hay dùng sẵn? Chạy local hay remote? ↳ Follow-up: Mô tả tool (description) quyết định agent chọn tool đúng thế nào? Bạn tinh chỉnh ra sao?
🔥 AI code review hoạt động thế nào: trigger khi nào, đọc gì (diff, toàn file, FD, convention), xuất ra gì? ↳ Follow-up: Review comment được đăng lên GitHub dạng inline hay một comment tổng? ↳ Follow-up: Có severity/phân loại (blocking vs suggestion) không?
🔥 Quản lý context window thế nào khi FD dài, repo lớn? Chiến lược cắt, tóm tắt, chọn lọc là gì? ↳ Follow-up: Từng gặp lỗi do vượt context hoặc "lost in the middle" chưa? ↳ Follow-up: Dùng prompt caching không? Hiệu quả thế nào? ↳ Follow-up: Context compaction của SDK có tác động gì tới chất lượng?
🔥 Prompt quản lý thế nào: lưu ở đâu (file, DB), version control, template hóa, review thay đổi? ↳ Follow-up: Thay đổi prompt có được test hồi quy không? ↳ Follow-up: Ai được sửa prompt? Có quy trình review không?
Bạn có kỹ thuật nào để giảm bịa (grounding, yêu cầu trích dẫn nguồn, "nếu không biết hãy nói không biết")?
🔥 Đánh giá chất lượng đầu ra thế nào? Có bộ eval/golden set không? Metric là gì? ↳ Follow-up: Nếu chưa có eval bài bản, bạn đánh giá bằng cảm tính hay bằng số? ↳ Follow-up: Khi đổi prompt hoặc model, bạn biết tốt hơn hay tệ hơn bằng cách nào? ↳ Follow-up: Dùng LLM-as-judge không? Có thiên lệch gì?
🔥 Hallucination: ví dụ AI bịa class/method/bảng/cột không tồn tại? Bạn phát hiện và chặn thế nào?
🔥 Rủi ro lớn nhất của việc dùng AI trong delivery pipeline thật là gì? Bạn giảm bằng cách nào?



⚠️ Mở KB lên và demo/mô tả: gõ một câu hỏi thật về nghiệp vụ kho, hệ thống trả lời gì, trích nguồn gì? (Mình hỏi bạn từng bước dữ liệu đi qua đâu.)
⚠️ Số page Confluence đã được index là bao nhiêu? Số chunk? Kích thước embedding? Nếu bạn không nhớ, vì sao chưa đo?
⚠️ Chunk size và overlap chính xác bạn dùng là bao nhiêu? Bạn đã thử đổi chưa, kết quả cụ thể?
⚠️ Nếu đúng là RAG, bạn cho mình thấy một ví dụ truy vấn mà retrieval trả sai chunk và bạn đã sửa thế nào.
⚠️ "Investigating bugs": có đúng là nó điều tra được bug, hay chỉ là hỏi đáp tài liệu có liên quan tới bug? Ranh giới ở đâu?
⚠️ Jira view có thật sự do bạn viết, hay chỉ là dashboard/filter cấu hình trên Jira? Mô tả phần code bạn viết.
⚠️ Bạn có số liệu về mức sử dụng thực tế của KB và Jira view (người dùng hoạt động, số truy vấn) không?
⚠️ Nếu mình nói "đây chỉ là chatbot gọi API Confluence rồi nhét vào prompt", bạn phản bác thế nào?
⚠️ Có phải KB chủ yếu giúp những người bạn thân trong team, hay cả team (và các team khác) dùng? Dẫn chứng?
⚠️ Khách hàng và vendor có biết nội dung Confluence của dự án được đưa lên dịch vụ AI không? Có biên bản đồng ý không?
Tình huống: một page chứa quy tắc nghiệp vụ lỗi thời nhưng KB vẫn trích dẫn nó, dev code sai theo. Bạn xử lý hậu quả và phòng ngừa thế nào?
Tình huống: QA hỏi KB "quy tắc phân bổ tồn kho cho kho X" và nhận câu trả lời lẫn lộn với kho Y. Bạn gỡ lỗi thế nào?
Tình huống: vendor yêu cầu chứng minh dữ liệu FD của họ không bị đưa ra ngoài hệ thống. Bạn trình bày kiến trúc dữ liệu thế nào?
Tình huống: Confluence có page "Credentials" chứa mật khẩu UAT. KB đã index. Bạn xử lý ra sao ngay lập tức?
Tình huống: một dev mới hỏi KB về lỗi deadlock khi chạy batch. KB trả về nội dung chung chung vô ích. Bạn cải thiện retrieval thế nào?
Tình huống: team muốn mở rộng KB sang cả mã nguồn và log production. Bạn cân nhắc những rủi ro và thiết kế gì?
Tình huống: lượng page tăng gấp 10 lần và truy vấn chậm đi. Bạn xử lý thế nào?
Tình huống: sau khi đổi embedding model, chất lượng retrieval xấu đi. Bạn phát hiện và quay lại thế nào?
Bạn học được gì về RAG/LLM từ việc xây KB này mà ban đầu không nghĩ đến?
Nếu làm lại, bạn thiết kế KB khác ở điểm nào?
Điều gì làm KB thất bại mà bạn đã thấy ở các dự án nội bộ tương tự? Bạn tránh thế nào?
Bạn đã bao giờ phát hiện nhờ KB một vấn đề của chính tài liệu (mâu thuẫn, thiếu) không? Bạn xử lý thế nào?
Có điều gì bạn muốn bổ sung vào KB hoặc view nếu có thêm thời gian và nguồn lực?
Kinh nghiệm này giúp bạn vào vị trí đang ứng tuyển như thế nào?
🔥 Phân quyền: Confluence có page hạn chế theo space/người dùng. KB có tôn trọng quyền đó không, hay ai hỏi cũng thấy toàn bộ? ↳ Follow-up: Nếu không, người không có quyền có thể "moi" nội dung nhạy cảm qua chatbot. Bạn xử lý thế nào? ↳ Follow-up: Nếu có, bạn kiểm tra quyền theo từng người dùng bằng cách nào (token người dùng, ACL lưu cùng chunk)?
Tài liệu chứa thông tin NDA của khách hàng/vendor được gửi vào embedding API hoặc LLM bên ngoài. Có được duyệt không? Dữ liệu đi qua đâu?
Lưu trữ vector và văn bản gốc ở đâu (on-prem, cloud)? Mã hóa, backup, kiểm soát truy cập?
Credential để đọc Confluence: loại token nào, quyền gì (read-only?), ai giữ? Lộ token thì sao?
Dữ liệu cá nhân hoặc bí mật (mật khẩu, connection string, IP nội bộ) lỡ nằm trong Confluence thì KB xử lý thế nào (lọc, che)?
Prompt injection qua tài liệu: một page Confluence chứa chỉ thị độc hại hoặc nội dung bị sửa bởi người ngoài. KB/LLM xử lý thế nào?
Log câu hỏi/câu trả lời có lưu không? Có chứa thông tin nhạy cảm không? Ai xem được?
Quyền của AI trong KB: chỉ đọc hay có thể ghi/sửa Confluence? Vì sao?
C. RAG và xử lý tri thức
C1. Thu thập và tiền xử lý
🔥 Lấy dữ liệu từ Confluence bằng cách nào (REST API, export, webhook)? Cloud hay Data Center?
Nội dung Confluence có bảng, hình, sơ đồ (draw.io), macro, file đính kèm, code block. Bạn xử lý từng loại thế nào? ↳ Follow-up: Hình ảnh/sơ đồ chứa thông tin quan trọng thì sao (OCR, mô tả bằng vision model, bỏ qua)? ↳ Follow-up: Bảng (ví dụ bảng mapping, bảng trạng thái) có giữ cấu trúc khi chuyển sang văn bản không?
Làm sạch dữ liệu: loại boilerplate, trang rác, bản nháp, trang lỗi thời thế nào?
Metadata nào được lưu kèm (space, page ID, người sửa, ngày, phiên bản, nhãn, đường dẫn cha-con)?
Cấu trúc phân cấp page (cha-con, space) được tận dụng thế nào trong retrieval?
C2. Chunking
🔥 Chiến lược chunking: kích thước, overlap, chia theo heading hay theo token? Vì sao chọn? ↳ Follow-up: Đã thử nhiều chiến lược chưa? So sánh kết quả thế nào? ↳ Follow-up: Chunk cắt giữa bảng hoặc giữa một quy trình nhiều bước thì mất ngữ cảnh. Xử lý sao?
Chunk có kèm tiêu đề trang, đường dẫn heading (contextual header) để bù ngữ cảnh không?
Tài liệu rất dài (Function Design hàng chục trang) chunk thế nào để không mất mạch logic?
Tài liệu chứa SQL hoặc code: chunk và index khác văn bản thường thế nào?
C3. Embedding và vector store
🔥 Dùng embedding model nào? Vì sao? Có hỗ trợ tiếng Việt và thuật ngữ kỹ thuật không?
Vector store là gì (pgvector, Qdrant, Chroma, Elasticsearch, FAISS...)? Vì sao chọn? Chạy ở đâu?
Có dùng hybrid search (BM25/keyword kết hợp vector) không? Với mã lỗi, tên bảng, tên API thì keyword quan trọng thế nào?
Reranking: có dùng cross-encoder/LLM rerank không? Hiệu quả ra sao?
Top-k chọn bao nhiêu? Vì sao? Ảnh hưởng thế nào đến độ chính xác và chi phí?
Query rewriting, mở rộng truy vấn (HyDE, multi-query) có dùng không?
Đánh giá retrieval: dùng metric nào (recall@k, MRR)? Có đo không hay chỉ cảm tính?
Kích thước KB (số page, số chunk, dung lượng vector)? Có vấn đề scale không?
Nếu không dùng vector mà để agent tự tìm kiếm trực tiếp (grep, đọc page qua API), ưu nhược điểm so với RAG là gì? Bạn chọn gì và vì sao?
C4. Đồng bộ và cập nhật
🔥 Đồng bộ với Confluence thế nào: định kỳ, theo webhook, theo sự kiện sửa page? Độ trễ bao lâu? ↳ Follow-up: Page bị sửa/xóa/di chuyển thì KB xử lý thế nào? ↳ Follow-up: Làm sao phát hiện nội dung đã đổi (hash, version, lastModified)? ↳ Follow-up: Re-index toàn bộ có tốn kém không? Có hỗ trợ incremental không?
Thông tin lỗi thời trong KB gây hại thế nào? Bạn đảm bảo "tươi" ra sao?
Có cơ chế đánh dấu độ tin cậy của tài liệu (bản chính thức vs bản nháp, ngày cập nhật) không?
Khi phiên bản dự án thay đổi (major/minor release, kho khác nhau), KB có phân biệt theo phiên bản/kho không?
🔥 Mô tả kiến trúc của hệ thống hỏi đáp: từ câu hỏi người dùng đến câu trả lời, đi qua những bước nào? ↳ Follow-up: Đây có phải RAG cổ điển (retrieve rồi generate) hay agentic search (agent tự grep/đọc file)? ↳ Follow-up: Vì sao chọn cách đó?
🔥 Hallucination trong hỏi đáp: AI trả lời sai nhưng nghe rất thuyết phục về nghiệp vụ kho. Bạn phát hiện và giảm thiểu thế nào?
