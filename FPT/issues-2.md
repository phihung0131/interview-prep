# Case 2: Xử lý tranh chấp giữ tồn kho cho Hot SKU (Inventory Reservation Concurrency)

**Bối cảnh nghiệp vụ**

Trong hệ thống quản lý kho vận kết hợp bán hàng (WMS/OMS), trước khi một lệnh nhặt hàng thực tế được giao cho nhân viên hay robot dưới sàn, hệ thống phải thực hiện bước **Giữ chỗ tồn kho (Inventory Reservation / Soft Allocation)**. Khi đơn hàng được tạo, hệ thống trừ vào tồn khả dụng (`available_qty`) và cộng vào tồn tạm giữ (`reserved_qty`). Vào các đợt flash sale hoặc khung giờ cao điểm, hàng chục đến hàng trăm đơn hàng có thể cùng tranh chấp một mã hàng bán chạy (**Hot SKU**) tại cùng một kho trung tâm trong cùng một giây.

**Phát hiện**

Vấn đề này từng xảy ra trong giai đoạn đầu của hệ thống: Sau các đợt khuyến mãi lớn, bộ phận CS và vận hành kho ghi nhận tình trạng **bán vượt tồn kho (overselling)**. Khách hàng đã thanh toán và hệ thống báo thành công, nhưng khi gom đơn để xuất kho thì thực tế kệ hàng đã hết sạch. Nhiều đơn hàng buộc phải hủy thủ công, gây ảnh hưởng uy tín và chi phí đền bù.

**Điều tra & Học hỏi (Root Cause Analysis)**

Khi tham gia dự án, em đã chủ động đào sâu lại tài liệu kỹ thuật và git history để hiểu cách các Senior/Architect tiền nhiệm giải quyết bài toán này:

* **Nguyên nhân gốc rễ:** Code nguyên bản xử lý theo mô hình *Read-Modify-Write* tách biệt:
1. `SELECT available_qty FROM inventory WHERE sku_id = ?;`
2. Ứng dụng kiểm tra `if (available_qty >= order_qty)` và tính `new_qty = available_qty - order_qty`.
3. `UPDATE inventory SET available_qty = new_qty WHERE sku_id = ?;`


* **Cơ chế lỗi:** Khi nhiều request ùa vào cùng một mili-giây, các thread cùng đọc được con số tồn kho ban đầu như nhau. Chúng cùng tính toán và ghi đè kết quả, dẫn đến hiện tượng **Lost Update** kinh điển. Kết quả là 5 đơn hàng cùng trừ kho thành công trong khi số lượng thực tế chỉ đủ cho 1 đơn.

**Phương án & Đánh đổi (Trade-offs)**

Đội ngũ kiến trúc ban đầu đã phân tích 3 phương án:

* *Phương án 1: Khóa bi quan (Pessimistic Locking - `SELECT ... FOR UPDATE`)*:
*Ưu điểm:* Dữ liệu luôn chính xác 100%, dễ viết code.
*Đánh đổi:* Khi hàng trăm request cùng nhắm vào một Hot SKU, việc ép xếp hàng tuần tự ở database gây hiện tượng **Lock Contention** nghiêm trọng. Response time tăng vọt, connection pool của DB bị cạn kiệt, kéo sập thông lượng (throughput) của toàn bộ hệ thống.
* *Phương án 2: Khóa lạc quan dùng phiên bản (Optimistic Locking - `WHERE version = current_version`)*:
*Ưu điểm:* Không giữ row lock dài ở DB, hiệu năng đọc rất cao.
*Đánh đổi:* Với Hot SKU có tỷ lệ tranh chấp cực cao (high contention), nếu 100 request cùng đến thì chỉ có 1 request ghi thành công, 99 request còn lại bị conflict. Nếu cho retry tự động, hệ thống sẽ rơi vào bão request (**Retry Storm**), ngốn sạch tài nguyên CPU/Network mà tỷ lệ giữ hàng thành công vẫn rất thấp.
* *Phương án 3: Cập nhật nguyên tử tại Database kèm điều kiện biên (Atomic In-place Update with Guard Condition)*:
*Cú pháp:*
`UPDATE inventory SET available_qty = available_qty - :order_qty, reserved_qty = reserved_qty + :order_qty WHERE sku_id = :sku_id AND available_qty >= :order_qty;`
*Ưu điểm:* Loại bỏ hoàn toàn khoảng hở giữa đọc và ghi. Bản thân storage engine của DB (như InnoDB row-level lock) tự tuần tự hóa thao tác ghi trong vài micro-giây. Điều kiện `available_qty >= :order_qty` đóng vai trò chốt chặn nguyên tử: nếu thành công trả về `rows_affected = 1`, nếu hết hàng trả về `rows_affected = 0`.
*Đánh đổi:* Mọi logic trừ tồn kho phải gói gọn trong 1 câu SQL đơn giản, không nhúng được các điều kiện logic tính toán phức tạp ở tầng code; nếu quy trình checkout phía sau bị lỗi thì bắt buộc phải viết thêm compensating transaction để hoàn tồn (rollback thủ công).

**Quyết định & Kết quả**

Team kiến trúc trước đó đã chốt chọn **Phương án 3 (Atomic In-place Update)**.

Giải pháp này giúp triệt tiêu hoàn toàn lỗi overselling trong tất cả các mùa sale sau đó, đồng thời giữ latency của API giữ kho luôn ổn định dưới 20ms mà không làm nghẽn DB Connection Pool. Khi nghiên cứu lại case này, em đã nắm vững tư duy cân bằng giữa **Data Consistency** và **System Throughput** trong các bài toán chịu tải đồng thời cao.

---

### Câu trả lời phỏng vấn đầy đủ (Mạch lạc, trung thực về vai trò)

> "Trong quá trình làm việc tại hệ thống quản lý kho và đơn hàng, có một bài toán về **High Concurrency** kinh điển mà em đã chủ động đào sâu nghiên cứu lại từ kiến trúc của các anh Senior đi trước, đó là bài toán **Giữ tồn kho (Inventory Reservation) cho các Hot SKU**.
> Trước đây, vào các đợt flash sale, hệ thống từng gặp sự cố **Bán vượt tồn kho (Overselling)**. Khách đặt hàng và nhận thông báo thành công, nhưng khi gom đơn để xuất kho thì kệ thực tế đã hết hàng, khiến team vận hành phải hủy đơn thủ công.
> Khi tìm hiểu lại nguyên nhân gốc rễ, em nhận thấy ban đầu hệ thống xử lý theo mô hình *Read-Modify-Write* tách biệt: ứng dụng `SELECT` số lượng ra bộ nhớ, kiểm tra logic `available_qty >= order_qty`, rồi mới chạy câu lệnh `UPDATE`. Khi hàng trăm request mua cùng một mã Hot SKU đổ về trong vài mili-giây, nhiều luồng cùng đọc ra số tồn kho giống nhau và cùng ghi đè kết quả lên DB, gây ra lỗi **Lost Update**.
> Team kiến trúc lúc đó đã cân nhắc kỹ các phương án và đánh đổi:
> 1. Nếu dùng **Pessimistic Locking (`SELECT FOR UPDATE`)**, dù an toàn nhưng với Hot SKU sẽ gây **Lock Contention** nghiêm trọng, giữ connection lâu làm nghẽn toàn bộ Connection Pool của cơ sở dữ liệu.
> 2. Nếu dùng **Optimistic Locking bằng cột `version**`, do mức độ tranh chấp tại một SKU quá cao, 99% request sẽ bị conflict và văng lỗi. Nếu cho cơ chế retry chạy lại thì sẽ tạo ra bão request (**Retry Storm**), gây quá tải CPU hệ thống.
> 3. Giải pháp tối ưu được chọn là **Cập nhật nguyên tử tại Database (Atomic In-place Update) kèm Guard Condition**:
> `UPDATE inventory SET available_qty = available_qty - :qty, reserved_qty = reserved_qty + :qty WHERE sku_id = :sku AND available_qty >= :qty;`
> 
> 
> Đánh đổi ở đây là toàn bộ nghiệp vụ kiểm tra và trừ tồn phải gói gọn trong một câu lệnh đơn giản, không nhúng được logic tính toán phức tạp ở tầng ứng dụng, và nếu các bước sau trong chu trình checkout bị lỗi thì phải có cơ chế bù trừ (Compensating Transaction) để hoàn lại số lượng. Đổi lại, hệ thống tận dụng được row-level lock cực ngắn của DB engine, triệt tiêu hoàn toàn lỗi overselling và giữ latency của API đặt hàng dưới 20ms.
> Việc nghiên cứu kỹ giải pháp và trade-off của case study này giúp em tích lũy được tư duy quan trọng: Khi xử lý bài toán concurrency, không phải lúc nào cũng vác lock nặng nề ra dùng, mà cần nhìn vào mức độ tranh chấp (contention rate) để chọn điểm cân bằng giữa toàn vẹn dữ liệu và thông lượng hệ thống."

---

### Các câu hỏi Interviewer có thể đào sâu tiếp & Hướng trả lời

#### 1. "Sau khi câu lệnh Atomic Update chạy thành công (trả về `rows_affected = 1`), nhưng bước thanh toán hoặc bước tạo đơn tiếp theo bị lỗi/crash, em xử lý hoàn tồn kho (Rollback / Release) như thế nào?"

* **Gợi ý trả lời:**
"Vì thao tác giữ kho thường nằm trong quy trình checkout phân tán (Distributed Transaction), hệ thống áp dụng pattern **Saga / Compensating Transaction**:
* Khi Atomic Update thành công, bản ghi reservation được sinh ra với trạng thái `PENDING` kèm một thời gian hết hạn (ví dụ TTL 15 phút).
* Nếu các bước sau trả về lỗi, hệ thống kích hoạt API bù trừ:
`UPDATE inventory SET available_qty = available_qty + :qty, reserved_qty = reserved_qty - :qty WHERE sku_id = :sku;`
* Đồng thời có một worker chạy định kỳ quét các reservation ở trạng thái `PENDING` đã quá 15 phút (do crash hệ thống mà không gọi được API bù trừ) để tự động hoàn trả lại tồn khả dụng."



#### 2. "Nếu một sự kiện siêu sale có tới hàng nghìn request/giây cùng đâm vào duy nhất 1 dòng DB của 1 SKU thì câu Atomic Update vẫn gây nghẽn Row Lock. Em có biết cách nào để scale tiếp không?"

* **Gợi ý trả lời:**
"Dạ đúng, vì Database serialize thao tác ghi trên cùng một hàng (row-level lock), nên hàng nghìn request/giây vẫn sẽ tạo hàng đợi nghẽn cổ chai. Để scale tiếp, có 2 hướng kiến trúc thường dùng:
1. **Stock Partitioning / Sharding:** Chia 1 mã SKU thành nhiều slot (ví dụ chia 1.000 sản phẩm thành 10 dòng con, mỗi dòng 100 sản phẩm). Khi có request vào, hệ thống random hoặc băm theo user_id vào 1 trong 10 slot để trừ, giảm độ tranh chấp trên một row lock xuống 10 lần.
2. **In-Memory Caching (Redis Counter):** Đưa toàn bộ lượng tồn kho của Hot SKU lên Redis và trừ bằng lệnh nguyên tử `DECRBY` hoặc Lua Script. Redis xử lý single-threaded in-memory với thông lượng hàng chục nghìn ops/giây. Sau khi giữ kho thành công trên Redis, hệ thống đẩy event vào Message Queue (như Kafka) để đồng bộ bất đồng bộ theo lô (batch update) xuống database chính."



#### 3. "Tại sao không dùng Redis Distributed Lock để bọc lấy đoạn code trừ kho ở tầng ứng dụng?"

* **Gợi ý trả lời:**
"Nếu dùng Redis Distributed Lock, bản chất vẫn là **Pessimistic Lock** ở tầng ứng dụng: các request mua Hot SKU vẫn phải lần lượt xin lock, chờ đợi và nhả lock. Điều này không giải quyết được bài toán thông lượng mà còn tốn thêm nhiều network round-trip giữa app server và Redis cluster. Dùng Atomic Update tận dụng ngay lock nội tại của DB nhanh hơn nhiều, hoặc nếu dùng Redis thì dùng thẳng Lua Script/Atomic Counter chứ không nên dùng lock bao bọc."