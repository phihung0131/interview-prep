Case 5: Tích hợp Thiết bị Ngoại vi (WCS/Robot Exotec/Connectship) & Bài toán "Ghost Status"
---

### 1. Context & Các thành phần liên quan trực tiếp

* **Hệ thống:** Phân hệ **WES (Warehouse Execution System)** giao tiếp ngoại vi với:
* **WCS (Warehouse Control System) & Robot Exotec / Skypod:** Hệ thống điều khiển cánh tay robot, xe tự hành gắp khay hàng (`Tote/Bin`) và băng chuyền phân loại tự động.
* **Hãng vận chuyển 3PL (Multi-Carrier Gateway):** Nền tảng vận chuyển quốc tế **Connectship** và chuyển phát nội địa **JNE** / **Locus**.


* **Mã API & Module thực thi cốt lõi:**
* `SP_AP_0010_12_Send Picking Instruction To Automated Warehouse(PUT)` & `SP_ML_0015_01_Send Picking Instruction To WCS`: Bắn lệnh sang robot tự động chạy vào ma trận kệ để lấy khay hàng mang ra trạm nhặt.
* `SP_AP_0004_04_Register Retrieval Result For Exotec(PUT)` & `06_Register Storage Result For Exotec(PUT)`: Robot phản hồi kết quả sau khi đã đưa khay hàng ra/vào thành công.
* `IV_AP_0004_17_Mark As Ghost Bin(PUT)`: Đánh dấu thùng hàng "ma" (hệ thống báo có thùng nhưng robot chạy tới tọa độ thì ô kệ trống trơn).
* `SP_ML_0008_01_EC Call Connectship Validate Request` & `SP_ML_0011_01_EC Call Connectship Shipment Request`: Gọi API sang cổng Connectship để sinh mã vận đơn và tem bưu cục.
* `IV_BT_0022_01_Recover Inventory Transfer Waiting Item By In Warehouse Area For WCS` (WES Batch): Batch tự động quét và phục hồi các lệnh giao tiếp thiết bị bị treo/lỗi mạng.


* **Tech Stack:** Spring Boot, MyBatis, PostgreSQL, Resilience4j (Circuit Breaker & Retry), REST/HTTP Industrial Protocol.

---

### 2. Nguyên nhân gốc rễ (Root Cause Analysis)

#### Bối cảnh môi trường nhà kho công nghiệp

Trong kho tự động hóa cao, dây chuyền đóng gói và trạm nhặt hàng phụ thuộc hoàn toàn vào tín hiệu mạng thời gian thực:

* Robot Exotec gắp hàng dựa trên lệnh HTTP/Socket gửi từ WES xuống WCS.
* Tại bàn đóng gói, công nhân quét mã hộp carton, WES phải gọi API sang **Connectship/JNE** trong vòng dưới 1 giây để in mã vạch vận đơn dán lên thùng trước khi đẩy sang băng chuyền.

#### Bản chất kỹ thuật của bài toán "Ghost Status" & Network Timeout

Trong mạng phân tán, khi WES gửi một HTTP Request sang hệ thống ngoại vi (WCS hoặc 3PL Gateway) và nhận về lỗi `SocketTimeoutException` (ví dụ sau 5 giây không có response), **WES hoàn toàn không biết được trạng thái thực tế của bên kia**:

$$\text{Request Sent} \xrightarrow{\text{??? Timeout ???}} \begin{cases} \text{TH 1: Bên kia CHƯA nhận được lệnh (Lệnh chưa chạy)} \\ \text{TH 2: Bên kia ĐÃ thực thi xong nhưng gói tin Response bị rớt trên đường về} \end{cases}$$

**Hệ quả tai hại trên Production khi xử lý ngây thơ:**

* **Sai lầm 1 (Đánh dấu Thất bại và gửi lệnh lại - Duplicate Execution):**
WES tưởng robot chưa chạy nên gửi lại lệnh nhặt khác. Thực tế ở TH 2, robot đã gắp khay hàng đi rồi. Lệnh thứ hai chạy tới thì ô kệ đã rỗng $\rightarrow$ Robot báo lỗi cảm biến, hệ thống bị loạn tọa độ vật lý và sinh ra **`Ghost Bin` (Khay ma)**.
* **Sai lầm 2 (Retry đồng bộ trực tiếp - Synchronous Cascading Failure):**
Khi cổng Connectship bên Mỹ bị chập chờn, mỗi đơn hàng online đứng chờ timeout 15-30 giây. Hàng trăm công nhân tại trạm đóng gói bị đứng hình, các thread của Tomcat trong Spring Boot bị giữ chặt, dẫn đến **sập toàn bộ hệ thống API nội bộ của kho (Cascading Failure)**.

---

### 3. Giải pháp kỹ thuật đa tầng (Action Plan)

Để giải quyết triệt để sự cố không chắc chắn về trạng thái (Indeterminate State), giải pháp được xây dựng theo mô hình **3 pha khép kín**:

#### Bước 1: Bảo vệ luồng gọi ngoại vi bằng Resilience4j (Circuit Breaker & Fallback)

Không bao giờ để hệ thống bên ngoài kéo sập hệ thống nội bộ. Bọc toàn bộ các lời gọi sang Connectship/JNE và WCS bằng Circuit Breaker:

```java
@CircuitBreaker(name = "carrierService", fallbackMethod = "carrierFallback")
@TimeLimiter(name = "carrierService")
public CompletableFuture<ShipmentResponse> callConnectship(ShipmentRequest request) {
    return CompletableFuture.supplyAsync(() -> restTemplate.postForObject(connectshipUrl, request, ShipmentResponse.class));
}

// Hàm Fallback khi mạng bị lỗi hoặc timeout
public CompletableFuture<ShipmentResponse> carrierFallback(ShipmentRequest request, Throwable t) {
    // Chuyển đơn hàng vào hàng đợi chờ xử lý bất đồng bộ (DLQ)
    // Trả về mã phản hồi tạm thời để giải phóng màn hình đóng gói ngay lập tức
    return CompletableFuture.completedFuture(ShipmentResponse.pending());
}

```

* Cấu hình Timeout ngắn (chỉ 2.5 giây). Nếu tỷ lệ lỗi vượt quá $30\%$, Circuit Breaker tự động bật sang trạng thái `OPEN`, từ chối gọi thẳng để bảo vệ thread pool của Spring Boot.

#### Bước 2: Thiết kế Máy trạng thái 3 pha (Two-Phase Verification State Machine)

Xóa bỏ tư duy chỉ có 2 trạng thái `SUCCESS` hoặc `FAILED`. Bổ sung trạng thái trung gian **`INSTRUCTION_SENT_PENDING_ACK` (Đã gửi - Đang chờ xác minh)**:

* Khi gặp timeout hoặc network drop:
* Tuyệt đối **không đánh dấu FAILED**.
* Cập nhật trạng thái lệnh sang `INSTRUCTION_SENT_PENDING_ACK` kèm theo mã `idempotency_key` và timestamp thời điểm gửi.
* Không cho phép nhân viên thao tác đè lên đơn này trên Web UI/máy quét HT để chống gửi trùng.



#### Bước 3: Batch Tự phục hồi & Vấn tin Trạng thái (`IV_BT_0022_Recover Waiting Item`)

Batch ngầm `IV_BT_0022_01` chạy định kỳ mỗi 1-2 phút, quét các bản ghi đang bị treo ở trạng thái `PENDING_ACK` quá 90 giây để **chủ động vấn tin (Inquiry / Reconciliation)**:

1. **Hỏi lại hệ thống đích (Inquiry Phase):**
WES gọi API tra vấn trạng thái sang WCS (`IV_AP_0004_03_Retrieve Storage Result`) hoặc sang Connectship với mã `idempotency_key` ban đầu:
*"Lệnh số X tao gửi lúc nãy bên mày đã thực thi chưa?"*
2. **Quyết định trạng thái (Resolution Phase):**
* *Nếu WCS trả lời "Đã gắp khay hàng xong":* WES cập nhật trạng thái thành `COMPLETED` và tiếp tục luồng, không chạy lại.
* *Nếu WCS trả lời "Chưa từng nhận được lệnh này":* WES an toàn hủy lệnh cũ và kích hoạt gửi lại lệnh mới.
* *Nếu khay hàng thực sự bị kẹt hoặc mất tích trên kệ:* Lúc này WES mới gọi API `IV_AP_0004_17_Mark As Ghost Bin(PUT)` để cách ly tọa độ ô kệ đó, đồng thời kích hoạt tìm sản phẩm thay thế từ vị trí dự phòng khác.



---

### 4. Kết quả định lượng (Results)

* **Tỷ lệ Khay ma (Ghost Bin):** Giảm từ mức trung bình 15-20 vụ/ngày xuống **dưới 1 vụ/tháng**, loại bỏ tình trạng robot chạy tới vị trí rỗng gây dừng chuyền tự động.
* **Độ ổn định hệ thống (System Availability):** Đạt mức **$99.98\%$**. Khi đối tác vận chuyển quốc tế (Connectship) gặp sự cố mạng, thời gian phản hồi của màn hình đóng gói nội bộ tại kho vẫn duy trì dưới **200ms** (nhờ cơ chế Fallback của Circuit Breaker), không một công nhân nào bị đơ máy quét.
* **Tự động phục hồi:** Batch `IV_BT_0022` tự động hòa giải và xử lý thành công hơn $98.5\%$ các giao dịch treo mạng mà không cần bất kỳ sự can thiệp thủ công nào từ đội ngũ IT Support.

---

### 5. Kịch bản trả lời phỏng vấn (Interview Script)

Khi người phỏng vấn hỏi: *"Hệ thống của em tích hợp với nhiều thiết bị phần cứng (WCS/Robot) và bên thứ ba (Carrier 3PL). Em đã từng xử lý sự cố mất kết nối mạng, timeout hoặc trạng thái không đồng nhất giữa hai bên như thế nào?"*

**Bạn trả lời theo khung STAR chuẩn mực:**

#### 1. Situation (Bối cảnh)

> *"Dạ có, trong phân hệ WES của tụi em, hệ thống phải giao tiếp thời gian thực với **hệ thống robot tự hành Exotec qua WCS** (`SP_AP_0010_12`) và các **hãng vận chuyển đa kênh quốc tế như Connectship, JNE** (`SP_ML_0011`).
> Mỗi khi đơn hàng online được đóng gói xong, WES phải bắn lệnh điều khiển cánh tay robot đưa khay hàng ra và gọi API lấy mã vận đơn từ nhà xe chỉ trong vòng dưới 1 giây."*

#### 2. Task & Root Cause (Vấn đề & Đào sâu kỹ thuật)

> *"Thách thức kỹ thuật lớn nhất ở đây là hiện tượng **Timeout không xác định (Indeterminate State hay Ghost Status)**. Khi WES gọi sang WCS hoặc Connectship mà gặp lỗi `SocketTimeoutException` sau 5 giây, WES hoàn toàn không thể biết được là phía bên kia thực sự chưa nhận được lệnh, hay đã xử lý xong rồi nhưng gói tin phản hồi bị rớt trên đường truyền.
> Ban đầu, nếu hệ thống tự động retry mù quáng, phía robot Exotec sẽ bị nhận 2 lần lệnh nhặt cho cùng 1 vị trí. Khi robot tới nơi thì ô kệ đã trống trơn, dẫn đến lỗi cảm biến phần cứng và sinh ra hiện tượng **`Ghost Bin` (Khay ma ảo)** làm gián đoạn toàn bộ line tự động. Ngược lại, nếu đứng chờ timeout quá lâu thì toàn bộ thread pool của Tomcat bị nghẽn, làm tê liệt máy quét của công nhân tại kho."*

#### 3. Action (Giải pháp kỹ thuật)

> *"Em đã cùng team tái thiết kế lại kiến trúc tích hợp ngoại vi theo mô hình 3 lớp:
> * *Thứ nhất, em áp dụng thư viện **Resilience4j** để cấu hình **Circuit Breaker kết hợp TimeLimiter**. Với các đối tác bên ngoài như Connectship, em siết timeout xuống 2.5 giây. Nếu tỷ lệ lỗi vượt $30\%$, Circuit Breaker lập tức bật sang trạng thái OPEN và kích hoạt hàm Fallback, đẩy đơn vào hàng đợi xử lý bất đồng bộ để giải phóng ngay luồng cho công nhân đóng gói.*
> * *Thứ hai, em xóa bỏ cơ chế 2 trạng thái đơn giản (Success/Failed) và bổ sung trạng thái trung gian **`INSTRUCTION_SENT_PENDING_ACK`**. Khi gặp timeout, hệ thống tuyệt đối không đánh dấu thất bại hay retry ngay lập tức, mà đóng băng trạng thái của đơn hàng lại kèm mã `idempotency_key`.*
> * *Thứ ba, em viết batch ngầm **`IV_BT_0022_Recover Waiting Item`** chạy định kỳ mỗi phút. Batch này quét các bản ghi bị treo để thực hiện chu trình **Two-phase Inquiry**: Nó chủ động gọi API vấn tin sang WCS/Carrier để hỏi: 'Lệnh này bên bạn đã chạy xong chưa?'. Nếu bên kia xác nhận đã xong thì WES chỉ việc cập nhật trạng thái; nếu bên kia chưa nhận được thì WES mới an toàn phát lệnh chạy lại. Nếu khay hàng thực sự có vấn đề, batch mới kích hoạt API `IV_AP_0004_17_Mark As Ghost Bin` để cách ly vị trí kệ lỗi."*
> 
> 

#### 4. Result (Kết quả)

> *"Giải pháp máy trạng thái 3 pha kết hợp Circuit Breaker đã giúp loại bỏ $95\%$ các lỗi khay ma trên hệ thống robot tự động. Dây chuyền kho vận hành liên tục mà không bao giờ bị nghẽn dây chuyền khi mạng bên ngoài chập chờn. Đây cũng là giải pháp giúp hệ thống đạt chuẩn vận hành ổn định $99.98\%$ trong suốt các mùa cao điểm."*