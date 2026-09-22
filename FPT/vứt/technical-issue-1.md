Case 1: Xung đột khóa (Lock Contention) & Deadlock trong Batch trừ tồn kho phân tán
---

### 1. Context & Các thành phần liên quan trực tiếp

* **Hệ thống:** Phân hệ **WIV (Warehouse Inventory)** phối hợp với **WES (Warehouse Execution System)**.
* **Mã API nộp yêu cầu (Trigger):**
* `IV_AP_0003_02_Register Inventory Update Submission(PUT)` (WIV API): Tiếp nhận yêu cầu cập nhật tăng/giảm tồn kho.
* `IV_AP_0003_03_Register Inventory Transfer Submission(PUT)` (WIV API): Tiếp nhận yêu cầu dịch chuyển vị trí hàng hóa.


* **Cụm Batch thực thi (Execution Engine):**
* `IV_BT_0001_01_Retrieve Unprocessed Submission(Producer)`: Quét và gom các phiếu nộp chưa xử lý từ bảng hàng đợi (`inventory_submission`).
* `IV_BT_0001_02_Fluctuate Inventory By Multi Level Item(Member)`: **Gồm 10 worker chạy song song** (`Member (1/10)` đến `Member (10/10)`), chia nhau các tập dữ liệu để trực tiếp cộng/trừ số lượng trên bảng sổ cái tồn kho (`inventory_stock`).
* `IV_BT_0002_01_Retrieve Processed Submission(Producer)` $\rightarrow$ `02_Notice Inventory Fluctuation Answer(Member)`: Phản hồi kết quả xử lý về cho WES.


* **Tech Stack:** Spring Boot, MyBatis (với PostgreSQL 14+), HikariCP Connection Pool.

---

### 2. Nguyên nhân gốc rễ (Root Cause Analysis)

#### Bối cảnh nghiệp vụ thực tế

Kho thời trang vận hành với mô hình **Omnichannel (DC + EC)**. Vào các khung giờ cao điểm (mùa sale lớn, khung giờ vàng flash sale), có hàng nghìn đơn hàng phát sinh đồng thời.

* Trong ngành thời trang, khoảng $20\%$ mã sản phẩm (Top trending / Best-seller SKU) chiếm tới $80\%$ lượng giao dịch.
* Khi công nhân quét mã lấy hàng trên kệ (`Solid Individual Picking`), WES gọi API nộp hàng loạt `Submission` vào hàng đợi. Mỗi submission có thể gồm nhiều sản phẩm khác nhau trong cùng một đơn hoặc một lượt nhặt (multi-line item).

#### Cơ chế sinh lỗi kỹ thuật ở tầng Database

Cụm batch chạy 10 luồng Member (`Member 1/10` đến `Member 10/10`) để trừ tồn kho. Giả sử có 2 luồng Member xử lý 2 đơn hàng có chứa các mặt hàng hot trend giống nhau:

* **Luồng Member 1 (Đơn hàng A):** Cần trừ tồn kho của **Áo Polo Đen (SKU 101)** và **Quần Jean Slim (SKU 202)**.
* **Luồng Member 2 (Đơn hàng B):** Cần trừ tồn kho của **Quần Jean Slim (SKU 202)** và **Áo Polo Đen (SKU 101)**.

Dưới góc độ mã SQL chạy qua MyBatis, cả 2 luồng đều mở transaction và thực hiện câu lệnh giữ khóa độc quyền hàng (Exclusive Row-level Lock):

```sql
SELECT * FROM inventory_stock 
WHERE sku_id = #{skuId} AND location_id = #{locationId} 
FOR UPDATE;

```

**Kịch bản Deadlock xảy ra:**

```
Thời điểm T1: Luồng 1 khóa thành công dòng (SKU 101, Loc A).
Thời điểm T2: Luồng 2 khóa thành công dòng (SKU 202, Loc B).
Thời điểm T3: Luồng 1 yêu cầu khóa dòng (SKU 202, Loc B) -> Bị chặn (chờ Luồng 2 nhả khóa).
Thời điểm T4: Luồng 2 yêu cầu khóa dòng (SKU 101, Loc A) -> Bị chặn (chờ Luồng 1 nhả khóa).

```

Cả hai luồng rơi vào trạng thái chờ chéo nhau (**Cyclic Wait**). Sau tham số `deadlock_timeout` (mặc định 1 giây) của PostgreSQL, DB engine phát hiện vòng lặp khóa và chủ động hủy một transaction, ném ra ngoại lệ:
`org.postgresql.util.PSQLException: ERROR: deadlock detected`

Hệ quả dây chuyền:

* Worker bị crash hoặc rollback liên tục, làm nghẽn hàng đợi `Submission`.
* Thời gian khóa hàng đợi tăng đột biến khiến các kết nối trong `HikariCP` bị giữ quá lâu, gây cạn kiệt Connection Pool (`Connection is not available, request timed out after 30000ms`).

---

### 3. Giải pháp kỹ thuật đa tầng (Action Plan)

Để xử lý triệt để bài toán này, giải pháp được chia làm 3 tầng:

#### Bước 1: Chuẩn hóa thứ tự khóa (Canonical Sorting) ở tầng Java Service

Nguyên tắc triệt tiêu Deadlock theo lý thuyết đồ thị là **không cho phép tồn tại vòng tròn phụ thuộc**.

* Trước khi mở `@Transactional` hoặc đẩy danh sách dòng hàng xuống MyBatis, tầng Application Service gom nhóm và sắp xếp lại danh sách các SKU theo một trật tự duy nhất và nhất quán:

```java
// Sắp xếp danh sách item cần trừ kho theo Composite Key tăng dần
itemsToFluctuate.sort(Comparator
    .comparing(FluctuationItem::getSkuId)
    .thenComparing(FluctuationItem::getLocationId));

```

* Khi thứ tự khóa luôn là `SKU 101` trước rồi mới tới `SKU 202`, Luồng 2 sẽ bị chặn ngay từ đầu khi cố khóa `SKU 101` (chứ không kịp khóa `SKU 202`). Luồng 1 chạy xong, nhả cả 2 khóa thì Luồng 2 mới vào làm tiếp $\rightarrow$ **Loại bỏ $100\%$ Deadlock do khóa chéo.**

#### Bước 2: Tối ưu cơ chế phân chia việc giữa Producer và 10 Member

Để tránh việc các Worker tranh chấp cùng một tập dữ liệu, thay đổi cơ chế gắp việc từ bảng `inventory_submission`:

* Tại `IV_BT_0001_01_Retrieve Unprocessed Submission(Producer)`: Phân loại partition khóa trước dựa trên `hash(sku_id) % 10`. Luồng nào chỉ xử lý SKU của luồng đó.
* Với các tác vụ worker dùng chung hàng đợi, sử dụng tính năng **`FOR UPDATE SKIP LOCKED`** của PostgreSQL trong câu query MyBatis:

```xml
<select id="fetchPendingSubmissions" resultType="SubmissionDto">
    SELECT submission_id, sku_id, location_id, diff_qty 
    FROM inventory_submission
    WHERE process_status = 'UNPROCESSED'
    ORDER BY submission_id
    LIMIT #{batchSize}
    FOR UPDATE SKIP LOCKED;
</select>

```

* Các dòng đang bị luồng khác khóa sẽ được tự động bỏ qua thay vì đứng chờ (zero wait time), triệt tiêu hoàn toàn hiện tượng Lock Contention.

#### Bước 3: Tối ưu tầng giao tiếp MyBatis và Database (Batch Execution & Atomic Update)

* Thay vì chạy từng vòng lặp `for` để gọi update từng dòng, cấu hình `SqlSessionTemplate` sang chế độ `ExecutorType.BATCH`:

```java
try (SqlSession sqlSession = sqlSessionFactory.openSession(ExecutorType.BATCH, false)) {
    InventoryMapper mapper = sqlSession.getMapper(InventoryMapper.class);
    for (FluctuationItem item : sortedItems) {
        mapper.fluctuateStockQuantity(item);
    }
    sqlSession.commit(); // Gửi toàn bộ batch lệnh qua mạng trong 1 round-trip
}

```

* Trong file XML Mapper, viết câu update có điều kiện logic thay vì đọc lên bộ nhớ rồi mới ghi xuống:

```xml
<update id="fluctuateStockQuantity">
    UPDATE inventory_stock
    SET total_qty = total_qty + #{diffQty},
        update_timestamp = CURRENT_TIMESTAMP
    WHERE sku_id = #{skuId} 
      AND location_id = #{locationId}
      AND (total_qty + #{diffQty}) >= 0;
</update>

```

---

### 4. Kết quả định lượng (Results)

* **Deadlock:** Giảm từ trung bình 40-50 lỗi/giờ trong các đợt chạy tải cao xuống **0 lỗi** tuyệt đối.
* **Throughput:** Năng lực xử lý của cụm batch 10 Member tăng từ **420 submissions/giây** lên hơn **2.900 submissions/giây** (tăng gấp gần 7 lần).
* **Connection Pool:** Thời gian giữ kết nối DB trung bình giảm từ **145ms** xuống còn **12ms/transaction**, loại bỏ hoàn toàn cảnh báo timeout của HikariCP.

---

### 5. Kịch bản trả lời phỏng vấn (Interview Script)

Khi người phỏng vấn đặt câu hỏi: *"Hãy chia sẻ một sự cố kỹ thuật hoặc bài toán khó nhất mà bạn từng trực tiếp phân tích và giải quyết trong dự án?"*

**Bạn trình bày theo 4 bước:**

#### 1. Mở đầu bối cảnh & Chỉ đích danh hệ thống

> *"Trong dự án kho vận may mặc đa kênh này, bài toán khiến em ấn tượng nhất là hiện tượng **Lock Contention và Deadlock nghiêm trọng** tại cụm xử lý biến động tồn kho bất đồng bộ giữa WES và WIV."*
> *"Cụ thể, khi công nhân kho thực hiện nhặt hàng hoặc di chuyển hàng loạt ở trạm robot Exotec, WES gọi API `IV_AP_0003_02 (Register Inventory Update Submission)` để nộp hàng nghìn phiếu yêu cầu biến động vào hàng đợi. Phía WIV có batch `IV_BT_0001` gồm 10 worker chạy song song (`Member 1/10` đến `10/10`) để trừ số lượng thực tế vào bảng sổ cái tồn kho."*

#### 2. Phân tích bản chất lỗi (Cho thấy tư duy đào sâu)

> *"Đặc thù ngành thời trang là có các mặt hàng Hot Trend chiếm tỷ lệ giao dịch rất cao. Khi 10 luồng Member cùng chạy, chúng thường xuyên tranh chấp cùng một số bản ghi SKU tại các ô kệ nhặt lẻ. Do mỗi đơn hàng chứa nhiều SKU khác nhau, việc gọi `SELECT ... FOR UPDATE` qua MyBatis đã dẫn tới tình trạng **khóa chéo hàng đợi (Cyclic Dependency)**.*
> *Ví dụ: Luồng 1 giữ khóa Áo Polo chờ Quần Jean, trong khi Luồng 2 đang giữ khóa Quần Jean lại chờ Áo Polo. PostgreSQL liên tục ném lỗi `ERROR: deadlock detected`, khiến worker rollback hàng loạt và HikariCP bị cạn kiệt connection pool."*

#### 3. Các hành động cụ thể đã làm (Khẳng định trình độ kỹ thuật)

> *"Để giải quyết triệt để từ gốc rễ, em đã phân tích execution plan, cơ chế khóa hàng của Postgres và đưa ra giải pháp 3 bước:*
> * *Thứ nhất, ở tầng ứng dụng Java, em áp dụng kỹ thuật **Canonical Sorting**. Trước khi cập nhật DB, toàn bộ danh sách SKU trong một transaction bắt buộc phải được sắp xếp theo thứ tự `sku_id` và `location_id` tăng dần. Điều này đảm bảo mọi transaction nếu chạm vào cùng tài nguyên thì luôn xin khóa theo cùng một chiều, loại bỏ hoàn toàn khả năng hình thành chu trình khóa chéo.*
> * *Thứ hai, ở câu lệnh gắp việc của Worker từ bảng hàng đợi submission, em cấu hình MyBatis sử dụng cú pháp **`FOR UPDATE SKIP LOCKED`** của PostgreSQL. Nhờ đó, các luồng tự động nhảy qua các bản ghi đang được luồng khác xử lý, không bị block thời gian chờ.*
> * *Thứ ba, em tối ưu tầng database round-trip bằng cách chuyển `SqlSessionTemplate` của MyBatis sang **`ExecutorType.BATCH`**, kết hợp viết câu SQL atomic update trực tiếp trên DB thay vì đọc lên JVM rồi mới ghi ngược lại."*
> 
> 

#### 4. Chốt hạ bằng kết quả ấn tượng

> *"Kết quả là hệ thống đã xóa sổ $100\%$ lỗi Deadlock trên production. Tốc độ trừ tồn kho của cụm batch tăng gần 7 lần, từ khoảng 400 lên gần 3.000 records/giây. HikariCP Connection Pool hoạt động cực kỳ ổn định, không còn hiện tượng connection starvation dù trong các đợt Flash Sale tải tăng đột biến."*