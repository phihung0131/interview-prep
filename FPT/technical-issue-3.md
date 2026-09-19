Case 3: Chốt ngày vận hành (Operation Date Snapshot) với bảng dữ liệu hàng triệu dòng
---

### 1. Context & Các thành phần liên quan trực tiếp

* **Hệ thống:** Phân hệ **WIV (Warehouse Inventory)** phối hợp với **Kế toán & Hải quan (CMS)**.
* **Mã Batch & API thực thi cốt lõi:**
* `IV_BT_0009_01_Check Previous Operation Inventory Fluctuation Completion` (WIV Batch): Kiểm tra xác nhận toàn bộ các lệnh xuất, nhập, chuyển trong ca làm việc đã hoàn tất $100\%$.
* `CM_AP_0001_01_Update Operation Date By Physical Location` (WIV API) & `IV_BT_0008_01_Confirm Default Operation Date Update` (WIV Batch): Khóa ngày làm việc cũ và chuyển sang ngày làm việc mới.
* `IV_BT_0005_01_Create Inventory Snapshot By Operation Date` (WIV Batch): **Trọng tâm của case** — Chụp ảnh số dư tồn kho của toàn bộ vị trí ô kệ trong kho tại thời điểm chuyển giao ngày.
* `IV_BT_0003_02_EC Export Inventory Snapshot IF` (WIV Batch) & `IV_BT_0015_02_Export Inventory by In Warehouse Location/Inventory Status/Operation Date IF` (WIV Batch): Xuất dữ liệu snapshot sang file để gửi cho ERP/HQ và Hải quan.
* `IV_BT_0006_01_Delete Inventory Record` (WIV Batch): Dọn dẹp dữ liệu tồn kho lịch sử đã hết hạn lưu trữ.


* **Tech Stack:** Spring Boot, MyBatis, PostgreSQL 14+, HikariCP.

---

### 2. Nguyên nhân gốc rễ (Root Cause Analysis)

#### Bối cảnh nghiệp vụ

Trong logistics, "Ngày vận hành" (Operation Date) không chạy từ 00:00 đến 23:59 theo đồng hồ thông thường, mà chạy theo ca kíp (ví dụ: ca đêm kết thúc lúc 06:00 sáng vẫn thuộc ngày vận hành của hôm trước).

* Khi ngày vận hành kết thúc, batch `IV_BT_0005` phải ghi nhận lại trạng thái của **tất cả sản phẩm tại tất cả vị trí kệ**: Tồn thực tế (On-hand), Tồn khả dụng (Available), Tồn giữ chỗ (Allocated), Hàng lỗi/Cách ly (Quarantine).
* Kho may mặc quy mô lớn có hàng triệu bản ghi tồn kho logic chi tiết (chia theo Location $\times$ SKU $\times$ Batch/Lot $\times$ Status).

#### Cơ chế sinh lỗi kỹ thuật ở tầng Database & JVM

Ban đầu, batch được viết rất ngây thơ bằng Spring Boot + MyBatis:

1. **Lỗi Java Heap OOM (Out Of Memory):**
Mã nguồn dùng câu lệnh:
```java
List<InventoryStock> allStocks = inventoryMapper.selectAllCurrentStock();
// Xử lý logic nghiệp vụ...
inventorySnapshotMapper.insertBatch(snapshotList);

```


Khi số lượng bản ghi vượt mốc 3-5 triệu dòng, toàn bộ Object được nạp thẳng vào bộ nhớ. Garbage Collector (GC) của JVM bị quá tải (Stop-The-World kéo dài), dẫn đến lỗi kinh điển:
`java.lang.OutOfMemoryError: Java heap space`.
2. **Lỗi Database Bloat & Nghẽn WAL (Write-Ahead Logging):**
* Khi chuyển sang câu lệnh SQL chạy trực tiếp trên Postgres:
```sql
INSERT INTO inventory_snapshot (...)
SELECT ... FROM inventory_stock;

```


Một câu lệnh ghi hàng triệu dòng trong một transaction duy nhất sinh ra lượng WAL log khổng lồ, làm nghẽn replication sang node Read-Replica.
* Nguy hiểm hơn, bảng `inventory_snapshot` sau vài tháng lưu trữ phình lên tới **hàng chục gigabyte**. Khi batch dọn dẹp dữ liệu cũ `IV_BT_0006_Delete Inventory Record` chạy:
```sql
DELETE FROM inventory_snapshot WHERE operation_date < #{retentionDate};

```


PostgreSQL **không hề giải phóng dung lượng ổ cứng** khi chạy `DELETE` (nó chỉ đánh dấu các dòng đó là `dead tuples`). Bảng bị phình to (Table Bloat), các câu query tra cứu snapshot bị quét toàn bảng (Sequential Scan) cực chậm. Tiến trình `autovacuum` chạy ngầm để dọn dead tuples thì chiếm dụng hết I/O của đĩa cứng, kéo tụt hiệu năng của toàn bộ hệ thống kho.



---

### 3. Giải pháp kỹ thuật đa tầng (Action Plan)

Để giải quyết triệt để từ bộ nhớ ứng dụng đến lưu trữ Database, bài toán được chia làm 3 bước:

#### Bước 1: Kỹ thuật Streaming Data bằng MyBatis `Cursor` & `ResultHandler`

Tuyệt đối không load hàng triệu bản ghi vào `List<T>`. Tận dụng cơ chế Cursor của PostgreSQL và MyBatis để xử lý dạng đường ống (Pipeline):

```java
@Transactional(readOnly = true)
public void streamAndProcessSnapshot(String operationDate) {
    // 1. Mở Cursor đọc từ DB với fetchSize hợp lý (ví dụ 2000 records/lần)
    try (Cursor<InventoryStock> cursor = inventoryMapper.scanAllStockWithCursor()) {
        List<InventorySnapshot> buffer = new ArrayList<>(2000);
        
        for (InventoryStock stock : cursor) {
            buffer.add(convertToSnapshot(stock, operationDate));
            
            // 2. Cứ gom đủ 2000 bản ghi thì flush xuống DB một lần
            if (buffer.size() >= 2000) {
                bulkInsertSnapshots(buffer);
                buffer.clear(); // Giải phóng ngay cho Garbage Collector
            }
        }
        if (!buffer.isEmpty()) {
            bulkInsertSnapshots(buffer);
        }
    }
}

```

* **Cấu hình Mapper XML:** Phải đặt `fetchSize="2000"` để driver JDBC không kéo toàn bộ dữ liệu về RAM:

```xml
<select id="scanAllStockWithCursor" resultSetType="FORWARD_ONLY" fetchSize="2000" resultType="InventoryStock">
    SELECT * FROM inventory_stock WHERE is_active = true
</select>

```

* Bộ nhớ Heap của JVM luôn phẳng lì ở mức **dưới 300MB**, không bao giờ bị OOM dù bảng có 10 hay 50 triệu dòng.

#### Bước 2: Phân vùng bảng vật lý (PostgreSQL Declarative Table Partitioning)

Thay vì nhồi nhét tất cả vào một bảng khổng lồ, chia bảng `inventory_snapshot` theo thời gian bằng **Partition By Range**:

```sql
-- Tạo bảng cha phân vùng theo ngày vận hành
CREATE TABLE inventory_snapshot (
    id BIGSERIAL,
    operation_date DATE NOT NULL,
    sku_id VARCHAR(50) NOT NULL,
    location_id VARCHAR(50) NOT NULL,
    total_qty INT NOT NULL,
    ...
    PRIMARY KEY (operation_date, id)
) PARTITION BY RANGE (operation_date);

-- Các bảng con tự động được tạo trước theo tháng/ngày (qua pg_partman hoặc cronjob)
CREATE TABLE snapshot_2026_09 PARTITION OF inventory_snapshot
    FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');

```

#### Bước 3: Thay thế `DELETE` bằng `DROP/DETACH PARTITION` (Zero-cost Cleanup)

Tại batch `IV_BT_0006_Delete Inventory Record`, thay vì thực thi lệnh `DELETE FROM inventory_snapshot WHERE operation_date < ...` (vốn sinh dead tuples và nghẽn autovacuum), chuyển sang thao tác DDL:

```sql
-- Tách phân vùng cũ ra khỏi bảng chính (thao tác tức thì, không lock)
ALTER TABLE inventory_snapshot DETACH PARTITION snapshot_2026_01;

-- Xóa đứt phân vùng (giải phóng dung lượng ổ cứng trong 5 mili-giây, không sinh WAL)
DROP TABLE snapshot_2026_01;

```

---

### 4. Kết quả định lượng (Results)

* **Thời gian thực thi Batch Snapshot (`IV_BT_0005`):** Rút ngắn từ **52 phút** xuống còn **6 phút 15 giây** cho hơn 4.5 triệu bản ghi.
* **Tài nguyên RAM JVM:** Duy trì ổn định ở mức **250MB - 350MB**, triệt tiêu $100\%$ nguy cơ sập pod do Heap OOM.
* **Tối ưu hóa Database Storage:**
* Loại bỏ hoàn toàn hiện tượng Table Bloat.
* Tác vụ dọn dẹp dữ liệu cũ (`IV_BT_0006`) chạy từ chỗ mất 25 phút (gây lock I/O) xuống còn **dưới 10ms**, dung lượng đĩa cứng được hoàn trả ngay lập tức cho hệ điều hành.


* **Tốc độ xuất file (`IV_BT_0003_02` / `IV_BT_0015_02`):** Nhờ cơ chế Partition Pruning (chỉ quét đúng partition của ngày hôm đó), tốc độ xuất dữ liệu gửi sang Hải quan nhanh hơn gấp 4 lần.

---

### 5. Kịch bản trả lời phỏng vấn (Interview Script)

Khi người phỏng vấn hỏi: *"Em đã từng xử lý các batch job xử lý dữ liệu lớn (Big Data / High Volume) gặp vấn đề về bộ nhớ hoặc I/O Database bao giờ chưa?"*

**Bạn trả lời theo khung STAR chuẩn mực:**

#### 1. Situation (Bối cảnh)

> *"Dạ có, trong phân hệ sổ cái WIV của hệ thống tụi em có nghiệp vụ **Chốt ngày vận hành và Chụp ảnh số dư tồn kho (Operation Date Snapshot)** qua batch `IV_BT_0005`. Cuối mỗi ngày làm việc, hệ thống phải quét toàn bộ tồn kho của hàng trăm ngàn vị trí kệ chia theo SKU, màu, size, trạng thái hàng để tạo ra bản ghi snapshot phục vụ kiểm toán tài chính và đối soát hải quan CMS."*

#### 2. Task & Root Cause (Vấn đề & Đào sâu kỹ thuật)

> *"Khi dữ liệu kho tăng trưởng lên mức hơn 4 triệu bản ghi, batch này gặp 2 nút thắt cổ chai cực kỳ nghiêm trọng:
> * *Thứ nhất, ở tầng ứng dụng, mã nguồn ban đầu dùng MyBatis kéo dữ liệu lên dạng `List<Entity>`, khiến **JVM bị tràn bộ nhớ (Heap OOM)** và GC Stop-The-World liên tục.*
> * *Thứ hai, ở tầng Database, bảng snapshot phình to hàng chục GB. Khi batch dọn dẹp dữ liệu cũ `IV_BT_0006` chạy lệnh `DELETE`, PostgreSQL sinh ra hàng triệu **Dead Tuples**, gây ra hiện tượng **Table Bloat**. Tiến trình Autovacuum bị kích hoạt chạy quét đĩa làm nghẽn toàn bộ I/O, khiến các câu query của hệ thống kho bị chậm đột biến."*
> 
> 

#### 3. Action (Giải pháp kỹ thuật)

> *"Em đã trực tiếp tối ưu lại toàn bộ kiến trúc xử lý của luồng này:
> * *Về phía Spring Boot và MyBatis, em thay đổi cơ chế đọc dữ liệu sang dùng **`Cursor` kết hợp `ResultHandler**` với `fetchSize=2000`. Dữ liệu được stream liên tục theo dạng Pipeline: cứ đọc được 2000 bản ghi thì xử lý và flush batch xuống DB rồi giải phóng ngay khỏi RAM. Nhờ đó, heap size luôn phẳng lì dưới 350MB.*
> * *Về phía PostgreSQL, em tái cấu trúc bảng `inventory_snapshot` sang mô hình **Declarative Partitioning theo khoảng thời gian (`RANGE (operation_date)`)**.*
> * *Nhờ có Partitioning, ở batch xóa dữ liệu cũ `IV_BT_0006`, em thay thế hoàn toàn lệnh `DELETE` bằng thao tác **`ALTER TABLE ... DETACH PARTITION` rồi `DROP TABLE**`. Giải pháp này giải phóng dung lượng đĩa vật lý ngay lập tức trong vài mili-giây, không sinh WAL log và triệt tiêu hoàn toàn gánh nặng cho tiến trình Autovacuum."*
> 
> 

#### 4. Result (Kết quả)

> *"Nhờ sự kết hợp giữa Streaming ở tầng ứng dụng và Partitioning ở tầng cơ sở dữ liệu, thời gian chụp snapshot chốt ngày giảm từ gần 1 tiếng xuống còn hơn 6 phút. Bộ nhớ ứng dụng cực kỳ ổn định và dung lượng Database luôn được dọn dẹp sạch sẽ mà không gây ảnh hưởng đến các giao dịch khác trong kho."*