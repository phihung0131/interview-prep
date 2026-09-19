Câu hỏi này interviewer muốn thấy bạn có **tính kỷ luật, khả năng tự chủ công việc và phong cách làm việc chuyên nghiệp (daily routine)** hay không. Vì bạn kiêm vai trò **Dev cứng + Sub-lead**, câu trả lời cần chia rõ 2 mảng: **điều phối/teamwork** và **code/kỹ thuật thực tế**.

Nói tự nhiên, gãy gọn theo dòng thời gian một ngày làm việc:

---

### Mẫu trả lời (Thực tế, rành mạch)

> "Dạ, công việc hàng ngày của em trong dự án được chia làm hai mảng chính:
> **1. Về vai trò Sub-lead và điều phối:**
> * Đầu ngày, em tham gia Daily Scrum cùng team để nắm tiến độ, rà soát xem có member nào đang gặp blocker (vướng spec, vướng môi trường hay lỗi kỹ thuật) để hỗ trợ gỡ ngay.
> * Em làm việc trực tiếp với khách hàng hoặc BrSE/BA để làm rõ các Requirement/Spec mới của API và Batch, sau đó bóc tách thành các task kỹ thuật cụ thể, ước lượng thời gian (estimate) và phân chia cho anh em trong team.
> * Trong ngày, em thực hiện code review cho các Pull Request của member, đảm bảo code tuân thủ convention, đúng ranh giới transaction và các câu truy vấn MyBatis được viết tối ưu trước khi merge.
> * Cuối ngày hoặc định kỳ, em tổng hợp tình hình tiến độ và các rủi ro phát sinh để report cho Project Manager.
> 
> 
> **2. Về vai trò Developer thực chiến:**
> * Sau khi sắp xếp xong việc cho team, phần lớn thời gian còn lại em tập trung code các module nghiệp vụ phức tạp mà em trực tiếp phụ trách, chủ yếu là các API điều khiển trạm nhặt/robot và cụm Batch phân bổ tồn kho.
> * Em cũng là người trực tiếp tham gia điều tra, fix các con bug khó mà member chưa giải quyết được, và tối ưu các đoạn logic/SQL bị chậm phát hiện trong quá trình test hoặc vận hành."
> 
> 

---

### Mồi câu người phỏng vấn sẽ hỏi tiếp ngay sau câu này:

1. *"Khi review code cho member, em kỹ tính nhất ở những điểm nào?"* $\rightarrow$ Trả lời: bẫy transaction, deadlock khi for-update, null-safe SQL.
2. *"Khi khách hàng đổi spec gấp hoặc yêu cầu không rõ ràng, em làm việc lại với họ thế nào?"*
3. *"Em phân bổ thời gian giữa việc quản lý/hỗ trợ team và việc tự code như thế nào để không bị trễ deadline cá nhân?"*