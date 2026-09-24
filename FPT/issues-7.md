### Câu trả lời phỏng vấn (STAR — case WIV ABEND, trực tiếp làm)

> "Có một sự cố khá phức tạp mà em trực tiếp điều tra, liên quan đến một race condition giữa hai luồng xử lý tưởng chừng không liên quan gì đến nhau.

> Bên em có một batch xử lý tồn kho chạy định kỳ, và một hôm nó bị crash giữa chừng. Ban đầu mọi người nghĩ nguyên nhân là do nhân viên thao tác sai — cụ thể là quét và hủy hàng (scrap) trên một mã kiện hàng cũ, trong khi mã đó đáng lẽ đã bị thay thế bởi một mã mới rồi. Vì trong nghiệp vụ, khi một kiện hàng được chỉnh sửa lại, hệ thống sẽ tạo ra một bản ghi mới và đánh dấu bản ghi cũ là không còn hiệu lực — không ai được phép động vào nữa. Nhưng thực tế thì nhân viên vẫn quét được mã cũ, hủy được hàng trên đó, thậm chí hủy được tới hai lần.

> Em được giao điều tra vì đây không đơn thuần là lỗi thao tác, bên vận hành cũng khẳng định là quy trình họ làm đúng. Em bắt đầu bằng cách lần lại log theo đúng timeline của giao dịch bị lỗi.

> Việc đầu tiên em phát hiện là, khi máy quét tay của nhân viên đọc mã kiện hàng cũ, nó gọi một API để lấy thông tin, trong đó có kèm theo thời gian cập nhật gần nhất của bản ghi đó — giống như một dấu vân tay của phiên bản dữ liệu tại thời điểm đọc. Máy quét giữ lại giá trị này để dùng cho bước sau.

> Vấn đề là, trong lúc nhân viên còn đang thao tác trên máy — tức là chưa bấm xác nhận hủy hàng — thì có một tiến trình tự động khác của hệ thống kho, chạy độc lập, cũng update chính bản ghi đó vì lý do xử lý phân loại hàng của riêng nó. Việc này làm cho thời gian cập nhật của bản ghi trong database bị thay đổi.

> Đến lúc nhân viên bấm xác nhận hủy hàng, hệ thống gửi API hủy kèm theo thời gian cập nhật mà máy quét đã lưu từ trước — nhưng lúc này trong database, thời gian đó đã không còn khớp nữa do bị tiến trình kia update trước đó rồi. Mà API hủy hàng này thiết kế theo kiểu chỉ cho phép update khi thời gian cập nhật khớp đúng — đây thực ra là một cơ chế tốt, để tránh việc hai nơi cùng ghi đè lên nhau mà không biết. Nhưng vì không khớp, nên câu lệnh update chạy nhưng không match được dòng dữ liệu nào cả — tức là về bản chất, thao tác hủy hàng đó *không hề xảy ra* dù giao diện vẫn báo thành công.

> Đây chính là cái em coi là lỗi thật sự nghiêm trọng nhất trong case này: sau khi chạy update mà không có dòng nào bị ảnh hưởng, hệ thống lại không hề kiểm tra lại kết quả đó — nó cứ mặc định là đã xử lý xong, trả về thành công cho máy quét, trong khi trạng thái thật của bản ghi thì vẫn y như cũ, chưa hề được đánh dấu là đã hủy.

> Vì trạng thái không đổi, hệ thống vẫn coi bản ghi đó là hợp lệ, nên nhân viên hoàn toàn quét lại được và hủy thêm một lần nữa. Mỗi lần hủy như vậy, hệ thống lại gửi lệnh điều chỉnh giảm tồn kho xuống, trong khi hàng thực tế đã xuất kho từ lâu rồi — dẫn đến số liệu tồn kho bị âm, và khi batch xử lý tồn kho ban đêm đọc phải dữ liệu vô lý đó thì nó crash.

> Sau khi xác định rõ nguyên nhân, em đề xuất bổ sung việc kiểm tra kết quả sau mỗi lần update — nếu không có dòng nào bị ảnh hưởng thì phải coi đó là lỗi và trả về thông báo lỗi rõ ràng, thay vì âm thầm cho qua. Ngoài ra cũng bổ sung thêm kiểm tra trạng thái hợp lệ của bản ghi trước khi cho phép thao tác hủy, để chặn sớm hơn nữa ngay từ đầu.

> Case này giúp em rút ra một bài học khá quan trọng: một cơ chế bảo vệ dữ liệu như optimistic lock chỉ thực sự có tác dụng khi tầng gọi nó biết kiểm tra và phản ứng đúng khi nó 'từ chối' — chứ bản thân cơ chế đó không tự động báo lỗi thay cho mình được."

---

**Vài lưu ý khi trình bày:**
- Case này khá "nặng" và nhiều bước — nếu phỏng vấn giới hạn thời gian, bạn có thể rút gọn phần giữa (mô tả T0-T1-T2) và tập trung vào **root cause + điểm hổng "không check rows affected"**, vì đó mới là insight quan trọng nhất.
- Nếu bị hỏi **"sao phát hiện ra được đúng race condition này, không phải nguyên nhân khác"** — trả lời thật: "Em lần theo timestamp trong log của cả hai luồng — máy quét và tiến trình tự động — thấy chúng chênh nhau chưa đến 2 phút và cùng đụng vào một bản ghi, nên nghi ngờ và xác nhận lại bằng cách đối chiếu đúng giá trị thời gian cập nhật ở từng bước."
- Nếu bị hỏi **"sao không thấy lỗi này sớm hơn"** — có thể trả lời: "Vì tần suất xảy ra rất thấp, chỉ khi đúng hai điều kiện trùng nhau về thời gian, nên nó âm thầm tồn tại một thời gian trước khi bộc phát đủ nghiêm trọng để ảnh hưởng tới batch."
- Nếu không chắc chắn 100% về việc bạn có phải người đề xuất giải pháp cuối cùng hay không, có thể điều chỉnh nhẹ câu "em đề xuất" thành "em cùng team đề xuất" cho an toàn.

### Câu trả lời hoàn chỉnh, đã sửa đúng theo mô tả của bạn

> "Em kể case này cho dễ hình dung nhé. Bên em có nghiệp vụ: khi một kiện hàng cần chỉnh sửa lại, hệ thống sẽ tạo ra một mã mới thay thế, còn mã cũ thì phải được đánh dấu là 'Retired' — hết hiệu lực, không ai được thao tác tiếp trên đó nữa. Việc đánh dấu 'Retired' này được xử lý bởi một batch chạy ngầm, kích hoạt ngay sau khi mã mới được tạo ra.

> Vấn đề nằm ở đúng thời điểm đó có sự trùng hợp: giả sử lúc 11h58, một nhân viên dùng máy quét, quét mã **cũ** để loại bỏ hàng hư hỏng (scrap) — máy quét gọi API lấy thông tin bản ghi, trong đó có kèm một mốc thời gian cập nhật gần nhất, máy quét giữ lại mốc 11h58 này để dùng cho bước sau.

> Gần như cùng lúc đó, cái batch retired mã cũ cũng chạy — nó update chính bản ghi đó để chuyển trạng thái thành Retired, khiến mốc thời gian cập nhật trong database đổi thành 11h59.

> Đến khi nhân viên bấm xác nhận scrap, hệ thống gửi API hủy kèm mốc thời gian 11h58 mà máy quét đã lưu từ trước. Nhưng lúc này trong database mốc thời gian đã là 11h59 rồi — không khớp. Hệ thống mình có thiết kế: câu lệnh update chỉ chạy khi mốc thời gian khớp đúng, coi như một cách kiểm tra 'dữ liệu mình đang thấy có còn mới nhất hay không'. Vì không khớp nên câu lệnh update chạy nhưng không update được dòng nào — về bản chất, việc chuyển trạng thái sang 'đã scrap' đó **không hề xảy ra**.

> Và đây là điểm em thấy nghiêm trọng nhất: hệ thống không hề kiểm tra lại xem câu update đó có thực sự thành công hay không, cũng không báo lỗi gì cả — nó cứ chạy tiếp như bình thường, coi như thao tác scrap đã xong. Nhưng thực chất bản ghi mã cũ vẫn giữ nguyên trạng thái cũ, không được đánh dấu đã scrap.

> Trong khi đó, phần trừ tồn kho lại không phụ thuộc vào việc update trạng thái đó có thành công hay không — nó vẫn cứ chạy và trừ kho bình thường như thể scrap đã hoàn tất. Mà tồn kho thực tế của mã cũ này đã về 0 từ trước rồi, vì hàng đã xuất đi theo mã mới. Nên bị trừ thêm một lần nữa thì thành âm. Và vì trạng thái mã cũ vẫn chưa được đánh dấu là đã scrap, nên nhân viên quét lại được và scrap thêm lần nữa, kho lại càng âm sâu hơn — dẫn đến batch xử lý tồn kho ban đêm đọc phải số liệu âm vô lý đó và bị crash.

> Sau khi tìm ra nguyên nhân, em đề xuất vá đúng hai chỗ: một là sau khi update trạng thái mà không có dòng nào bị ảnh hưởng thì phải coi đó là lỗi, dừng lại và báo ngay, không được để phần trừ kho chạy tiếp; hai là việc trừ kho phải gắn chặt với kết quả update trạng thái, không được tách rời độc lập như vậy. Bài học em rút ra là: có cơ chế kiểm tra dữ liệu mới nhất trước khi ghi thôi chưa đủ, quan trọng là toàn bộ các bước sau đó phải thực sự phụ thuộc vào kết quả kiểm tra đó, chứ không thể chạy tiếp một cách độc lập, im lặng cho qua được."
