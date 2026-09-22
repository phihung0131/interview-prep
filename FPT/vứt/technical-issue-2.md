Case 2: Phân bổ tồn kho ảo đa tầng (Virtual Multi-Level Allocation) & Thuật toán Packing M3
---

### 1. Context & Các thành phần liên quan trực tiếp

* **Hệ thống:** Phân hệ **WES (Warehouse Execution System)** phối hợp với **WIV (Warehouse Inventory)**.
* **Mã Batch & API thực thi cốt lõi:**
* `SP_BT_0010_02_EC Import Customer Shipment Instruction IF` (WES Batch): Kéo hàng nghìn đơn hàng online (EC) từ hệ thống bán lẻ/OMS về WES.
* `SP_BT_0012_EC Customer Shipment Allocation`: Cụm batch phân tán giữ chỗ hàng online:
* `01_EC Get Unallocated Customer Shipment Instruction (Producer)`: Gom các đơn chưa được giữ hàng.
* `02_EC Validate Shipment To Address (Member)`: Kiểm tra hợp lệ địa chỉ giao hàng.
* `03_EC Submit Customer Shipment Allocation (Aggregator)`: Kích hoạt thuật toán gán vị trí và chốt phân bổ.


* `SP_ML_0009_01_EC Submit Customer Shipment Allocation` (WES Module): Module chạy thuật toán phân bổ tồn kho logic.
* `MS_BT_0011_02_EC Import Piece M3 Master IF` (WES Batch) & `MS_AP_0010_02_EC Register Piece M3(PUT)`: Quản lý kích thước 3 chiều và thể tích thể tích khối ($M^3$) của từng sản phẩm.
* `MS_AP_0008_01_Retrieve In Warehouse Location Allocation Priority By Multi Level Item(POST)`: Bảng cấu hình thứ tự ưu tiên trừ hàng theo vị trí (Priority: Tầng thấp nhặt trước, kệ xa nhặt sau).


* **Tech Stack:** Spring Boot, MyBatis, PostgreSQL, HikariCP Connection Pool.

---

### 2. Nguyên nhân gốc rễ (Root Cause Analysis)

#### Bối cảnh nghiệp vụ phức tạp

Trong ngành bán lẻ may mặc (Fashion Retail), một đơn hàng thương mại điện tử (EC) đặt mua 3 món: 1 áo khoác dày, 1 quần jean và 1 mũ len.
Quá trình phân bổ hàng không chỉ là câu chuyện trừ số lượng đơn thuần $Total - Quantity$, mà phải giải quyết **bài toán tối ưu kép**:

1. **Quy tắc vị trí (Allocation Priority):** Sản phẩm đó đang nằm ở nhiều nơi (Khu trạm Robot Exotec, Kệ nhặt lẻ cố định `Solid Individual Location`, hoặc Kệ dự trữ trên cao `Reserve Area`). Hệ thống phải ưu tiên giữ hàng ở trạm Robot và Kệ nhặt lẻ trước để công nhân lấy dễ nhất.
2. **Quy tắc đóng gói thể tích ($M^3$ Bin Packing):** 3 món này có đóng chung vừa một thùng carton tiêu chuẩn (Box Size M) hay không?
* Nếu vừa: Giữ hàng bình thường.
* Nếu vượt thể tích hoặc quá tải trọng: Hệ thống phải tự động **tách nhánh đơn hàng (Split Shipment Detail Branch)** thành 2 kiện riêng biệt (`SP_BT_0080_EC Customer Shipment Instruction Detail Branch`).



#### Cơ chế sinh lỗi kỹ thuật ở tầng Architecture

Ban đầu, mã nguồn được viết theo mô hình lập trình tuần tự truyền thống: Một phương thức `@Transactional` lớn của Spring bọc toàn bộ chu trình:

```java
@Transactional // <-- ANTI-PATTERN: Mở transaction quá rộng
public void processAllocation(Order order) {
    // 1. Quét DB lấy tồn kho khả dụng
    // 2. Quét DB lấy độ ưu tiên vị trí (Allocation Priority)
    // 3. Quét DB lấy thể tích Piece M3 của từng SKU
    // 4. CHẠY THUẬT TOÁN BIN PACKING (Thuật toán lặp tính toán kích thước hộp)
    // 5. Cập nhật trạng thái và trừ số lượng tồn kho (UPDATE DB)
}

```

**Hậu quả kỹ thuật:**

* **Chiếm giữ Connection DB quá lâu:** Ngay khi bước vào `@Transactional`, Spring Boot rút 1 kết nối từ `HikariCP` và giữ chặt nó. Việc lặp tính toán thể tích và xét duyệt độ ưu tiên vị trí trên Java tốn từ **150ms – 250ms/đơn**.
* **Cạn kiệt Connection Pool (Connection Starvation):** Khi batch nạp vào 2.000 đơn hàng cùng lúc, toàn bộ kết nối của `HikariCP` (mặc định pool size = 30-50) bị chiếm trọn bởi các tác vụ đang bận tính toán hình học/thể tích trong CPU/RAM chứ không thực sự đọc/ghi Database.
* **Tê liệt API ban ngày:** Các máy quét cầm tay của công nhân ngoài kho gọi API (`RC_AP`, `SP_AP`) không thể lấy được Connection, dẫn đến lỗi toàn hệ thống:
`org.postgresql.util.PSQLException: HikariPool-1 - Connection is not available, request timed out after 30000ms`.

---

### 3. Giải pháp kỹ thuật đa tầng (Action Plan)

#### Bước 1: Tách rời ranh giới giao dịch (Transaction Boundary Refactoring)

Áp dụng nguyên tắc: **Chỉ mở Connection khi thực sự ghi dữ liệu xuống Database. Tuyệt đối không giữ Connection khi đang tính toán Logic trong CPU/RAM.**

Loại bỏ `@Transactional` ở hàm cha, dùng `TransactionTemplate` của Spring để thu hẹp phạm vi giao dịch:

```java
public void allocateOrder(Order order) {
    // PHA 1: Đọc dữ liệu Read-Only (Không khóa, giải phóng connection ngay)
    InventorySnapshot snapshot = inventoryService.getAvailableStock(order.getSkus());
    PackingProfile packingProfile = masterDataService.getPieceM3(order.getSkus());

    // PHA 2: Chạy thuật toán bộ nhớ thuần túy (In-Memory / Zero DB Connection)
    // Tính toán Bin Packing M3 và chọn vị trí kệ ưu tiên
    AllocationPlan plan = binPackingCalculator.calculate(order, snapshot, packingProfile);

    // PHA 3: Mở Transaction cực ngắn (Chỉ tốn 3-5ms để update DB)
    transactionTemplate.execute(status -> {
        return executeAtomicAllocation(plan);
    });
}

```

#### Bước 2: Tối ưu thuật toán Bin Packing $M^3$ trên Java

* Áp dụng biến thể của thuật toán **3D First-Fit Decreasing (FFD)**: Sắp xếp các món đồ theo thể tích giảm dần, thử nhét vào thùng carton nhỏ nhất khả dụng (`Box S`, `Box M`, `Box L`).
* Caching dữ liệu tĩnh: Dữ liệu kích thước sản phẩm (`Piece M3`) và kích thước thùng carton (`Carton M3`) gần như không đổi trong ngày. Chuyển toàn bộ dữ liệu này vào Local Cache (Caffeine Cache), loại bỏ $100\%$ các câu query lấy thông số $M^3$ lặp đi lặp lại.

#### Bước 3: Cơ chế Khóa lạc quan (Optimistic Locking) kèm Conditional Update trên MyBatis

Vì bỏ transaction bao ngoài, nhiều luồng có thể nhìn thấy cùng một lượng tồn kho khả dụng ban đầu. Để chống bán âm/giữ trùng hàng mà không dùng `SELECT ... FOR UPDATE` (Khóa bi quan gây nghẽn):

* Thêm cột `version` vào bảng tồn kho logic.
* Trong MyBatis XML, sử dụng câu lệnh **Atomic Conditional Update**:

```xml
<update id="deductAvailableInventory">
    UPDATE inventory_stock
    SET allocated_qty = allocated_qty + #{reqQty},
        version = version + 1,
        update_timestamp = CURRENT_TIMESTAMP
    WHERE id = #{stockId} 
      AND version = #{currentVersion}
      AND (total_qty - allocated_qty) >= #{reqQty};
</update>

```

* **Cơ chế Retry với Backoff:** Nếu câu lệnh trên trả về `0` (nghĩa là đã bị luồng khác nhanh tay giữ chỗ trước hoặc phiên bản đã thay đổi), hệ thống ném ra ngoại lệ `OptimisticLockingFailureException`. Worker sẽ nhả ra, đợi ngẫu nhiên (Jittered Backoff từ 10 - 50ms) rồi quét lại tồn kho của vị trí ưu tiên tiếp theo để gán lại.

---

### 4. Kết quả định lượng (Results)

* **Thời gian giữ DB Connection:** Giảm từ **180ms - 220ms** xuống chỉ còn **6ms - 8ms** cho mỗi đơn hàng (giảm hơn $95\%$ thời gian giữ kết nối).
* **Trạng thái HikariCP:** Ngay cả trong đợt sale cao điểm xử lý 10.000 đơn/giờ, số lượng Active Connection của HikariCP luôn duy trì ở mức an toàn ($30\% - 45\%$), triệt tiêu hoàn toàn lỗi `Connection Timeout`.
* **Độ chính xác phân bổ:** Thuật toán tính toán $M^3$ chia đúng $99.8\%$ các trường hợp kiện hàng vượt thể tích để tách nhánh đơn hàng tự động, giúp công nhân ở trạm đóng gói không bao giờ gặp tình trạng thùng carton bị tràn/không vừa nắp.

---

### 5. Kịch bản trả lời phỏng vấn (Interview Script)

Khi người phỏng vấn hỏi: *"Em đã bao giờ gặp vấn đề nghẽn hiệu năng (Performance Bottleneck) liên quan đến Database Connection Pool và Business Logic phức tạp chưa?"*

**Bạn trả lời theo khung STAR mượt mà:**

#### 1. Situation (Bối cảnh)

> *"Dạ có, trong phân hệ xuất hàng thương mại điện tử (EC Outbound) của dự án, tụi em có batch `SP_BT_0012 (EC Customer Shipment Allocation)`. Đây là batch chịu trách nhiệm gom hàng ngàn đơn hàng online, vừa tính toán độ ưu tiên vị trí kệ nhặt hàng (`Allocation Priority`), vừa phải tính toán thể tích 3 chiều (`Piece M3`) của các sản phẩm may mặc xem có đóng vừa thùng carton tiêu chuẩn hay phải tách nhánh đơn hàng (Split Branch). "*

#### 2. Task & Root Cause (Vấn đề & Bản chất kỹ thuật)

> *"Vấn đề phát sinh vào đợt chạy thử nghiệm tải cao: HikariCP Connection Pool liên tục bị cạn kiệt, các API máy quét của công nhân ngoài kho bị timeout hàng loạt.*
> *Khi trace code và xem metric, em phát hiện ra lỗi kiến trúc: Team đang dùng **Anti-Pattern `@Transactional` bao trọn phương thức xử lý đơn hàng**. Việc tính toán thể tích thùng carton (Bin Packing Algorithm) và duyệt thứ tự ưu tiên kệ diễn ra trên CPU/RAM mất từ 150ms đến 200ms cho mỗi đơn. Vì transaction mở ngay từ đầu, kết nối DB bị giữ chặt trong suốt thời gian tính toán đó dù không thực hiện câu lệnh đọc/ghi nào, dẫn đến hiện tượng **Connection Starvation**."*

#### 3. Action (Giải pháp kỹ thuật)

> *"Em đã chủ trì tái cấu trúc (Refactor) lại luồng phân bổ này theo 3 bước:*
> * *Thứ nhất, em **tách rời hoàn toàn ranh giới giao dịch (Transaction Boundary)**. Em bỏ `@Transactional` ở tầng ngoài, đưa việc tính toán Bin Packing $M^3$ và chọn vị trí ưu tiên thành luồng In-Memory thuần túy (Zero DB Connection). Em dùng `Caffeine Cache` để lưu cấu hình thể tích sản phẩm, tính toán xong xuôi ra kế hoạch phân bổ.*
> * *Thứ hai, chỉ khi thực sự ghi nhận giữ hàng xuống DB, em mới dùng `TransactionTemplate` của Spring mở transaction trong đúng 6ms - 8ms cuối cùng.*
> * *Thứ ba, để chống việc giữ trùng hàng giữa các luồng phân tán mà không phải dùng `SELECT FOR UPDATE` gây khóa hàng, em triển khai **Khóa lạc quan (Optimistic Locking)** với cột `version` kết hợp điều kiện `(total_qty - allocated_qty) >= reqQty` trực tiếp trong file XML của MyBatis. Nếu xung đột, worker sẽ retry với cơ chế Exponential Backoff."*
> 
> 

#### 4. Result (Kết quả)

> *"Nhờ giải pháp này, thời gian chiếm dụng kết nối DB giảm hơn $95\%$. Hệ thống xử lý mượt mà hàng ngàn đơn hàng dồn về mà HikariCP vẫn dư thừa tài nguyên. Đồng thời thuật toán Bin Packing tính toán chính xác thể tích, giúp hệ thống tự động tách nhánh đơn hàng chuẩn xác trước khi đẩy lệnh nhặt xuống cho robot Exotec."*