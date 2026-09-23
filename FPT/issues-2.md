### Câu trả lời phỏng vấn (bản sửa — dùng Optimistic Locking với updated_at làm version)

> "Có một bài toán concurrency khác em thấy khá hay, dù không phải lúc sự cố xảy ra em trực tiếp xử lý, mà là lúc em đọc lại code và tài liệu của hệ thống thì phát hiện ra cách team kiến trúc trước đó đã giải quyết — đó là bài toán **giữ tồn kho cho các mã hàng bán chạy (Hot SKU)** trong mùa sale.

> Về bối cảnh, em hiểu sơ là trước khi đơn hàng thật sự được giao xuống kho để nhặt, hệ thống phải trừ tạm tồn kho khả dụng để tránh bán trùng. Vào các đợt sale cao điểm, có lúc hàng trăm đơn cùng tranh nhau một mã hàng hot trong cùng một khoảng thời gian rất ngắn. Theo tài liệu để lại thì giai đoạn đầu hệ thống từng gặp tình trạng bán vượt tồn kho — khách đặt thành công nhưng đến lúc xuất kho thì hàng đã hết, phải hủy đơn thủ công.

> Em có tò mò nên đào lại git history để xem cách xử lý ban đầu với cách xử lý sau này khác nhau ra sao. Hóa ra ban đầu code làm theo kiểu đọc số lượng ra, kiểm tra đủ hàng hay không, rồi mới ghi lại — tách thành nhiều bước riêng lẻ. Vấn đề là khi nhiều request cùng đọc gần như cùng lúc, chúng đọc ra cùng một con số tồn kho ban đầu, rồi cùng ghi đè kết quả lên nhau, nên dù logic mỗi request đều đúng nhưng tổng thể lại bị sai — kiểu nhiều đơn cùng trừ thành công trong khi hàng chỉ đủ cho một đơn.

> Cách team trước xử lý là dùng **optimistic locking**, nhưng thay vì thêm hẳn một cột version riêng, họ tận dụng luôn cột **updated_at** (thời điểm cập nhật gần nhất) làm giá trị version. Luồng xử lý là: request đọc dữ liệu tồn kho lên, kèm luôn giá trị updated_at tại thời điểm đọc. Sau khi validate xong các điều kiện đầu vào (đủ hàng hay không, hợp lệ hay không), lúc ghi xuống thì câu update sẽ kèm điều kiện so khớp đúng cái updated_at đã đọc lúc đầu. Nếu trong lúc đó có request khác đã ghi trước và làm updated_at thay đổi, thì điều kiện so khớp sẽ sai, câu update không match được dòng nào, hệ thống hiểu là bị xung đột phiên bản và quăng lỗi để tầng ứng dụng xử lý lại — chứ không âm thầm ghi đè lên nhau như cách cũ.

> Em cũng đọc thấy trước đó có cân nhắc dùng khóa cứng — kiểu khóa hẳn dòng dữ liệu trong lúc xử lý, nhưng với mã hàng hot có quá nhiều request cùng tranh chấp thì sẽ gây nghẽn nặng, request phải xếp hàng chờ. Optimistic locking thì ngược lại, không giữ khóa, ai đọc trước ghi trước thì thắng, còn lại bị từ chối và phải thử lại — phù hợp hơn với những trường hợp mà đa số request vẫn có thể xử lý nhanh mà không cần chờ đợi lẫn nhau.

> Việc tìm hiểu lại case này giúp em hiểu rõ hơn là xử lý concurrency không phải lúc nào cũng cần khóa chặt mọi thứ lại, mà cần nhìn vào mức độ tranh chấp thực tế để chọn giải pháp phù hợp."

---

**Vài lưu ý:**
- Nếu interviewer hỏi "vậy dùng updated_at làm version thì có rủi ro gì so với cột version riêng (kiểu số nguyên tăng dần)?" — bạn có thể trả lời thật: "Phần rủi ro sâu hơn của cách này thì em chưa tìm hiểu kỹ, nhưng em đoán nếu hệ thống có clock skew giữa các service hoặc độ chính xác timestamp không đủ (ví dụ chỉ tới giây) thì có thể hai lần update rất sát nhau bị trùng giá trị, khiến optimistic lock không phát hiện được xung đột." — đây là câu trả lời thể hiện tư duy phản biện dù không chắc chắn 100%, khá tốt cho phỏng vấn.
- Nếu hỏi "vậy khi bị lỗi optimistic lock thì hệ thống retry thế nào" — thật thà: "Chi tiết cơ chế retry cụ thể em không nắm rõ, nhưng thường thì tầng ứng dụng sẽ đọc lại dữ liệu mới nhất và thử ghi lại, hoặc trả lỗi cho client để họ thử lại request."
- Giữ nguyên phần mở đầu xác nhận vai trò "học lại, không trực tiếp xử lý" — nhất quán với các câu trả lời trước.