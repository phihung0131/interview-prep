# Case 1: Robot tranh chấp khay hàng cùng thời điểm (Race Condition)

**Bối cảnh nghiệp vụ**

Trong kho tự động (AS/RS), hàng hóa được chứa trong các khay lưu trữ (tote/bin) trên giàn kệ. Khi có đơn hàng xuất kho, hệ thống phân phối nhiệm vụ nhặt hàng song song cho hàng chục robot AGV. Robot sẽ di chuyển tới vị trí, rút khay hàng ra để gắp sản phẩm, sau đó cất khay lại kệ và gửi tín hiệu về hệ thống trung tâm để trừ số lượng tồn kho của khay đó.

**Phát hiện**

Không phải do QA hay dev tìm ra trước — mà do team vận hành (operation) ở kho báo lên: robot liên tục gặp sự cố dừng khẩn cấp giữa line di chuyển hoặc báo lỗi "Tray Inaccessible" (không thể tiếp cận khay). Đồng thời, cuối ca phát hiện một số khay bị hụt số lượng tồn kho thực tế so với hệ thống. Nghiêm trọng hơn, có trường hợp 2 robot cùng hướng về một vị trí khay trên giàn kệ dẫn đến xung đột đường đi và suýt va chạm vật lý, buộc vận hành phải tạm dừng khu vực để can thiệp thủ công.

**Điều tra**

Kiểm tra log phân phối task và audit log trừ kho theo timestamp, phát hiện có những đơn hàng khác nhau cần cùng một mã SKU. Do hệ thống phân phối task chạy đa luồng (multi-worker) và không có cơ chế khóa tài nguyên (unlocked):

* Tại thời điểm $T_0$, Worker 1 và Worker 2 cùng nhận 2 đơn hàng có chung SKU. Cả 2 cùng đọc DB thấy khay A còn đủ số lượng, thế là cùng gán khay A cho Robot 1 và Robot 2 gần như cùng lúc (chỉ lệch nhau vài chục mili-giây).
* Khi tới nơi, Robot 1 lấy khay ra thao tác, Robot 2 đến sau thì vị trí khay đã bị trống nên báo lỗi kẹt luồng.
* Ở tầng dữ liệu, việc đọc rồi trừ kho kiểu `Read-Then-Update` mà không khóa dẫn đến tranh chấp bản ghi tồn kho (Race Condition/Lost Update), khiến việc cập nhật số dư cuối cùng bị sai lệch so với số hàng thực tế robot gắp ra.

**Phương án & đánh đổi**

* *Khóa bi quan trực tiếp tại Database (Pessimistic Lock - `SELECT ... FOR UPDATE`)*: Giữ khóa ở DB trong suốt thời gian robot di chuyển và thao tác với khay.
*Nhược điểm:* Thời gian robot di chuyển ngoài đời thực tính bằng chục giây đến cả phút; việc giữ DB transaction quá lâu sẽ gây nghẽn kết nối, cạn kiệt Connection Pool và làm sập toàn bộ throughput của hệ thống.
* *Thiết kế cơ chế Distributed Lock cho Khay hàng (Bin-level Locking) qua bộ API riêng*:
1. **API Acquire Lock:** Trước khi robot nhận task đến khay, hệ thống gọi API để kiểm tra và đặt trạng thái khóa khay (sử dụng Redis Distributed Lock / state bảng lock kèm cơ chế TTL tự động hết hạn để chống deadlock khi robot gặp sự cố phần cứng). Nếu khay đã bị robot khác lock, task sẽ tự động được điều hướng sang khay chứa SKU tương đương khác.
2. **Cơ chế Atomic Update kho:** Tồn kho chỉ được trừ thông qua câu lệnh nguyên tử có điều kiện ràng buộc (`UPDATE stock SET qty = qty - x WHERE tray_id = ? AND qty >= x`).
3. **API Release Lock:** Khi robot trả khay về vị trí và hoàn tất chu trình, nó gọi API mở khóa để phân phối tiếp cho các robot khác.
*Nhược điểm:* Tăng thêm bước giao tiếp API giữa robot controller và backend, phát sinh độ trễ mạng nhỏ ở khâu nhận việc ban đầu và cần xử lý bài toán failover khi robot bị đứt kết nối giữa chừng (nhờ TTL).

**Quyết định & lý do**

Chọn giải pháp **thiết kế cơ chế Lock/Unlock khay qua API độc lập kết hợp Atomic Update**, vì đây là cách giải quyết tận gốc hiện tượng tranh chấp tài nguyên vật lý ngoài thực tế mà không làm thắt cổ chai hiệu năng của Database. Nó tách biệt rõ ràng giữa "trạng thái vật lý của khay" và "giao dịch dữ liệu tồn kho".

**Kết quả**

Sau khi triển khai bộ API lock/unlock khay:

* Tình trạng 2 robot tranh chấp một vị trí khay và lỗi "Tray Inaccessible" giảm hoàn toàn về 0.
* Hiện tượng xung đột lộ trình giữa các robot do trùng điểm lấy hàng được triệt tiêu, giúp luồng di chuyển trong kho thông suốt.
* Dữ liệu tồn kho khớp 100% giữa hệ thống và kiểm đếm thực tế cuối mỗi ca làm việc.

---

### Gợi ý các câu hỏi Interviewer có thể đào sâu tiếp:

1. **Deadlock / Failover:** *"Nếu một con robot lấy được lock của khay xong rồi... bị chết máy, hết pin hoặc đứt kết nối mạng giữa đường thì khay đó có bị khóa vĩnh viễn không? Em thiết kế cơ chế TTL và unlock timeout như thế nào?"*
2. **Kỹ thuật Lock:** *"Em implement Distributed Lock cho khay bằng gì (Redis SETNX, Redlock hay một bảng riêng trong DB)? Vì sao lại chọn giải pháp đó?"*
3. **Task Routing / Througput:** *"Khi một khay bị lock và robot thứ 2 không lấy được, hệ thống xử lý tiếp ra sao? Robot đó đứng chờ hay hệ thống lập tức re-route tìm khay khác để tối ưu thời gian di chuyển?"*
Dưới đây là phiên bản câu trả lời phỏng vấn theo khung **STAR** được tối ưu để nói trực tiếp: tự nhiên, súc tích (khoảng 1.5–2 phút), nêu bật tư duy xử lý **Race Condition tài nguyên vật lý** và cách giải quyết kiến trúc.

---

### Câu trả lời phỏng vấn (Khung STAR)

> **Situation:**
> "Ở dự án kho tự động (AS/RS), hệ thống phân phối hàng trăm task nhặt hàng đồng thời cho các robot AGV. Robot sẽ chạy tới vị trí kệ, rút khay hàng (tote) ra gắp sản phẩm, cất khay lại rồi gửi tín hiệu trừ tồn kho. Sự cố phát sinh khi team vận hành báo lỗi: Robot liên tục báo 'Tray Inaccessible' (không tiếp cận được khay), một số vị trí suýt xảy ra va chạm vật lý giữa 2 robot, và cuối ca thì tồn kho thực tế bị lệch so với hệ thống.
> **Task:**
> Mục tiêu của em là tìm ra nguyên nhân gốc rễ gây xung đột điều hướng của robot và sai lệch số liệu tồn kho.
> **Action:**
> * **Nguyên nhân:** Khi tra cứu log điều phối task và DB audit log, em phát hiện lỗi **Race Condition**. Hệ thống chạy multi-worker nhưng thiếu cơ chế khóa tài nguyên. Khi có 2 đơn hàng cần cùng một mã SKU, cả hai worker đọc DB thấy khay A còn hàng và gần như cùng lúc gán khay A cho 2 robot khác nhau. Khi robot thứ 2 chạy tới thì khay đã bị con thứ nhất rút ra thao tác. Việc đọc-rồi-ghi (`Read-Then-Update`) thiếu kiểm soát cũng khiến tồn kho bị Lost Update.
> * **Giải pháp & Đánh đổi:**
> * Em không chọn khóa trực tiếp tại DB (`SELECT FOR UPDATE`) vì robot di chuyển ngoài đời thực mất từ vài chục giây đến cả phút; giữ connection lâu như vậy sẽ làm nghẽn pool và sập throughput của database.
> * Thay vào đó, em thiết kế **cơ chế Lock/Unlock tài nguyên khay độc lập**:
> 1. Trước khi robot bắt đầu di chuyển, hệ thống phải gọi API **Acquire Lock** để chiếm quyền truy cập khay (sử dụng Redis Distributed Lock có cài đặt TTL để chống deadlock nếu robot chết máy/rớt mạng). Nếu khay đã bị lock, hệ thống tự động reroute task sang khay khác có cùng SKU.
> 2. Trừ tồn kho bằng **Atomic Update** có điều kiện số lượng (`quantity >= x`) ở tầng DB.
> 3. Khi robot hoàn tất trả khay về vị trí, nó gọi API **Release Lock** để giải phóng khay cho các task tiếp theo.
> 
> 
> 
> 
> 
> 
> **Result:**
> Sau khi áp dụng, lỗi tranh chấp khay và xung đột lộ trình robot giảm hoàn toàn về 0. Dữ liệu tồn kho cuối ca khớp 100% với kiểm đếm thực tế, và thông lượng vận hành của cả kho tăng lên rõ rệt."

---

### 4 câu hỏi Interviewer có thể "vặn" tiếp & Cách trả lời ngắn gọn

#### 1. "Nếu robot lấy được lock rồi bị kẹt bánh, hết pin hoặc mất sóng giữa đường thì khay đó có bị treo luôn không?"

* **Góc trả lời:** "Em thiết kế **Lock kèm TTL (Time-To-Live)** dựa trên thời gian di chuyển tối đa ước tính cộng với một khoảng buffer (ví dụ 60 giây). Ngoài ra, trên robot có gửi **Heartbeat** định kỳ; nếu robot vẫn đang thao tác bình thường thì heartbeat sẽ gia hạn thêm TTL. Nếu robot mất tín hiệu quá thời gian này, lock tự động giải phóng và hệ thống kích hoạt cảnh báo cho vận hành kiểm tra robot."

#### 2. "Tại sao em chọn Redis Distributed Lock mà không lưu trạng thái locked trong một bảng Database?"

* **Góc trả lời:** "Tần suất acquire và release lock diễn ra liên tục theo giây với hàng trăm robot, nếu ghi liên tục vào DB sẽ tạo tải I/O không cần thiết. Redis xử lý in-memory với độ trễ sub-millisecond, có sẵn atomic commands (`SET NX PX`) và cơ chế TTL tự động hết hạn, giúp giảm tải hoàn toàn cho primary DB."

#### 3. "Nếu khay đang bị lock, robot thứ 2 xử lý tiếp thế nào? Đứng chờ hay làm gì?"

* **Góc trả lời:** "Hệ thống sẽ không cho robot đứng chờ vì làm nghẽn làn đường di chuyển. Ngay khi API lock trả về thất bại (Lock Failed), service điều phối sẽ kích hoạt cơ chế **Fallback Reroute**: tìm ngay khay chứa SKU tương đương ở vị trí gần nhất để giao cho robot. Chỉ khi toàn bộ kho không còn khay nào khác thỏa mãn, task mới được đưa về trạng thái chờ (Backoff queue)."

#### 4. "Dữ liệu tồn kho bị lệch trong quá khứ trước khi fix bug, em xử lý reconciliation (đối soát) như thế nào?"

* **Góc trả lời:** "Team em viết script đối soát giữa lịch sử gắp hàng thực tế từ log robot controller và số dư trong DB để lọc ra danh sách các khay bị sai lệch. Sau đó phối hợp với team vận hành kiểm đếm nhanh các ô này và tạo các **Adjustment Transaction (giao dịch điều chỉnh)** để cân bằng số liệu, thay vì can thiệp sửa trực tiếp vào bảng tồn kho nhằm giữ toàn vẹn audit trail."