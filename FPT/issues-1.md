## Contributed to resolving concurrency and coordination issues across multi-system integrations, improving task execution reliability and reducing operational stalls.
### Câu trả lời phỏng vấn (STAR – bản chi tiết, đúng mức độ tham gia)

**Situation:**
"Hệ thống em làm quản lý vận hành kho, trong đó có phần điều phối nhiệm vụ nhặt hàng cho robot AGV — robot là bên đối tác cung cấp phần cứng, hệ thống bên em chỉ giao tiếp với nó qua API để giao task và nhận trạng thái. Có giai đoạn team vận hành báo lên là robot hay bị stuck giữa chừng khi di chuyển. Theo team vận hành mô tả thì robot có cơ chế tự phát hiện nguy cơ va chạm nên nó tự dừng lại chứ không đâm nhau thật, nhưng việc dừng đột ngột như vậy vẫn làm nghẽn cả luồng di chuyển, robot phải chờ can thiệp hoặc tự retry, ảnh hưởng rõ đến tốc độ nhặt hàng của cả khu vực.

**Task:**
Sau khi nhận issue đó, team em — em tham gia từ đầu cùng mọi người — có nhiệm vụ tìm nguyên nhân gốc ở tầng hệ thống điều phối, vì rõ ràng bên robot chỉ đang phản ứng lại với tình huống đường đi bị xung đột do hệ thống giao task tạo ra.

**Action:**
Cả team ngồi soát lại log phân phối task theo từng khung thời gian xảy ra sự cố, và nhận ra hệ thống đang giao task song song cho nhiều robot mà không kiểm tra trước tuyến đường di chuyển có khả năng cắt nhau hay không. Tức là robot A và robot B có thể cùng lúc được giao đi tới hai vị trí khác nhau, nhưng đường đi thực tế của chúng lại giao nhau ở một đoạn nào đó trên sàn kho — và khi cả hai cùng chạy thì rơi vào tình huống robot tự dừng vì phát hiện nguy cơ va chạm.

Bọn em xử lý theo hướng: trước khi thật sự ra lệnh cho robot chạy, hệ thống sẽ mô phỏng trước tuyến đường dự kiến của nó — tính toán sơ bộ các đoạn đường robot sẽ đi qua — rồi kiểm tra xem tuyến đó có giao với tuyến của robot khác đang hoạt động không. Nếu không xung đột, hệ thống mới khóa lại các đoạn đường/vị trí đó ở tầng dữ liệu — dùng pessimistic lock, tức là giữ lock luôn trong lúc robot đang di chuyển và thao tác, để chắc chắn không có task nào khác được phép giao trùng đường trong thời gian đó. Chỉ sau khi robot lấy hàng xong và trả về trạng thái hoàn tất, hệ thống mới release lock để các task khác được xử lý tiếp.

Vì giữ pessimistic lock trong lúc robot di chuyển thực tế khá lâu so với một transaction DB bình thường, team cũng có tính đến việc giới hạn thời gian giữ lock và có cơ chế tự nhả nếu robot bị timeout hoặc mất tín hiệu quá lâu, để tránh tình trạng một sự cố phần cứng làm treo cả một khu vực trong kho.

**Result:**
Sau khi áp dụng, tần suất robot bị stuck giữa đường giảm rõ rệt, luồng di chuyển trong kho mượt hơn hẳn, và team vận hành phản hồi là ít gặp tình trạng nghẽn line như trước. Cá nhân em thì học được nhiều về cách xử lý bài toán concurrency khi nó không chỉ nằm trên dữ liệu mà còn liên quan đến hành vi vật lý thực tế ngoài đời."

---

**Vài điểm bạn nên nhớ khi trình bày:**
- Xuyên suốt dùng "team em" / "bọn em" chứ không "em thiết kế" — đúng với việc bạn làm cùng team từ đầu đến cuối, không một mình gánh.
- Đoạn "robot tự phát hiện va chạm" luôn gắn với "theo team vận hành mô tả" — nếu bị hỏi sâu cơ chế đó, bạn trả lời thật: "Phần đó là robot bên đối tác tự xử lý, bọn em chỉ nhận trạng thái qua API, không có visibility vào cảm biến hay logic bên trong robot."
- Nếu bị hỏi "sao chọn pessimistic thay vì optimistic lock" — bạn có thể trả lời theo hướng thực tế: vì đây là tài nguyên vật lý (đường đi/vị trí), nếu để xung đột xảy ra rồi mới phát hiện và retry (optimistic) thì lúc đó robot đã lỡ di chuyển vào tình huống nguy hiểm rồi, nên team chọn chặn trước bằng cách khóa ngay từ đầu.
- Nếu không nhớ rõ chi tiết implementation (ví dụ lock lưu ở bảng nào, timeout bao nhiêu giây), cứ nói thật: "Chi tiết cụ thể lâu rồi em không nhớ chính xác, nhưng hướng xử lý chính là như vậy."