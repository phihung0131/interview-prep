Bug 1: Thất thoát tồn kho ảo do gom đơn gộp (Consolidation) rơi vào "Silent Rollback"
---

### 1. Context & Bối cảnh hệ thống (Background)

* **Hệ thống liên quan:** Phân hệ **WES (Warehouse Execution System)** tương tác với **WIV (Warehouse Inventory)**.
* **Mã API & Function cốt lõi:**
* `SP_AP_0023_01_EC Retrieve Customer Packing Consolidation Requirement for Checkpoint(POST)`: Bàn gom hàng đa món (Consolidation) cho đơn online.
* `SP_AP_0020_02_EC Register Customer Packing Result(PUT)`: Ghi nhận kết quả đóng gói đơn hàng.
* `SP_AP_0021_03_EC Cancel Customer Shipment Instruction(PUT)`: Hủy đơn hoặc hủy một phần món hàng khi phát sinh sự cố tại trạm đóng gói.
* `IV_AP_0003_02_Register Inventory Update Submission(PUT)` (WIV API): Nộp phiếu cập nhật trả lại tồn kho khả dụng cho sổ cái WIV.


* **Quy trình nghiệp vụ thực tế (Business Flow):**
1. Khách mua online đơn gồm 2 món: **1 Áo polo (SKU-A)** và **1 Quần âu (SKU-B)**.
2. Hai món nằm ở hai vị trí kệ khác nhau nên được nhặt vào 2 khay chứa riêng biệt (`Tote 1` và `Tote 2`), sau đó chạy trên băng chuyền đến bàn gom hàng (**Consolidation Checkpoint**).
3. Tại đây, công nhân quét mã khay để gom 2 món vào chung 1 hộp carton trước khi dán nhãn vận chuyển.
4. **Tình huống ngoại lệ (Exception):** Khi kiểm tra chất lượng lần cuối (Final Inspection), công nhân phát hiện chiếc **Áo polo (SKU-A)** bị rách chỉ/dính bẩn.
5. **Quy tắc xử lý nghiệp vụ:**
* Công nhân bấm nút *"Báo lỗi sản phẩm & Hủy món"* trên màn hình Web UI.
* Hệ thống phải:
* Đưa chiếc Áo polo (SKU-A) vào trạng thái cách ly (`QUARANTINE`) để đem đi xử lý tiêu hủy/giặt ủi.
* **Nhả giữ chỗ (Release Allocation) cho chiếc Quần âu (SKU-B)** để trả lại số lượng khả dụng (Available) trên sổ cái WIV cho khách khác đặt mua.
* Ghi một bản ghi nhật ký sự cố vào bảng kiểm toán đóng gói (`packing_incident_audit_log`).
* Phản hồi thông báo trên màn hình: *"Đã xử lý sự cố thành công, vui lòng đưa khay Quần âu về kệ lưu trữ."*







---

### 2. Triệu chứng & Các phát hiện qua Datadog (Detection & Investigation)

#### Triệu chứng vận hành dưới kho (Business Symptom)

* Công nhân thao tác trên màn hình thấy popup báo xanh: *"Thao tác thành công"* (HTTP 200 OK) và tiếp tục làm việc bình thường.
* Tuy nhiên, vài ngày sau, bộ phận kinh doanh và quản lý kho phản ánh hiện tượng kỳ lạ: Nhiều mã hàng bán chạy hiển thị trên website là "Hết hàng" (Out of Stock), nhưng khi nhân viên kiểm tra thực tế tại kho thì thấy hàng vẫn nằm nguyên trên kệ.
* Tồn kho logic bị **"Thất thoát ảo"**: Cột `allocated_quantity` (số lượng bị khóa giữ chỗ) tăng cao bất thường, trong khi các đơn hàng liên quan đều đã bị hủy hoặc đóng gói xong từ lâu.

#### Điều tra tầng sâu trên Datadog (Technical Investigation)

1. **Quan sát APM Trace Explorer:**
* Lọc các request đến endpoint `/api/wes/packing/consolidation/cancel-item`.
* Đa số request trả về `HTTP 200 OK` với latency bình thường (~65ms).
* Tuy nhiên, khi lọc theo tag `@http.status_code:200` kết hợp `has:error`, phát hiện có các span nội bộ sinh ngoại lệ nhưng transaction tổng thể vẫn trả về HTTP 200 cho client.


2. **Soi Flame Graph trên Datadog APM:**
* Nhìn vào cây thực thi (Flame Graph) của transaction bị nghi vấn:
```
[Web Endpoint: cancelDefectiveItem] -> HTTP 200 (Success)
   └── [Service: processConsolidationCancel] -> @Transactional
         ├── [DB: UPDATE inventory_stock (Release Allocation)] -> SUCCESS
         ├── [Method: recordPackingIncidentAudit] -> Invoked
         │     └── [DB: INSERT INTO packing_incident_audit_log] -> ERROR: Data truncation / Length exceeded
         └── [Spring TransactionManager: commit] -> THREW UnexpectedRollbackException!

```




3. **Truy vết Datadog Log Stream (Log Correlation):**
* Đối chiếu `trace_id` từ APM sang log, phát hiện dòng log cảnh báo của framework:
```text
org.springframework.transaction.UnexpectedRollbackException: 
Transaction rolled back because it has been marked as rollback-only

```


* **Bức tranh sáng tỏ:** Dưới kho, công nhân nhận được popup xanh do Controller trả về DTO `{ success: true }`, nhưng bên dưới Database **toàn bộ thao tác nhả tồn kho đã bị Rollback sạch sẽ!**



---

### 3. Phân tích nguyên nhân gốc rễ (Root Cause Analysis)

Đoạn code ban đầu của tầng Service:

```java
@Service
public class PackingConsolidationService {

    @Autowired
    private StockAllocationMapper stockMapper;
    @Autowired
    private IncidentAuditService auditService; // hoặc method nội bộ

    @Transactional // Transaction cha (Physical Transaction A)
    public CancelResultDto cancelDefectiveItem(CancelRequest request) {
        try {
            // Bước 1: Nhả tồn kho giữ chỗ cho món hợp lệ (SKU-B)
            stockMapper.releaseAllocation(request.getValidSkuId(), request.getLocationId());

            // Bước 2: Chuyển món lỗi sang trạng thái QUARANTINE (SKU-A)
            stockMapper.markAsQuarantine(request.getDefectiveSkuId(), request.getLocationId());

            // Bước 3: Ghi nhận lịch sử sự cố đóng gói
            recordIncidentLog(request); // <-- NGUYÊN NHÂN TỬ HUYỆT NẰM Ở ĐÂY

            return new CancelResultDto(true, "Thành công");

        } catch (Exception e) {
            // ANTI-PATTERN: Nuốt exception để UI không bị hiện màn hình đỏ!
            log.error("Có lỗi xảy ra nhưng vẫn trả về success để công nhân làm tiếp", e);
            return new CancelResultDto(true, "Đã ghi nhận sự cố");
        }
    }

    public void recordIncidentLog(CancelRequest request) {
        // Cột note trong DB giới hạn VARCHAR(100), nhưng chuỗi lý do nhập vào dài 150 ký tự
        // Gây ra PSQLException: value too long for type character varying(100)
        auditMapper.insertAuditLog(request.getIncidentNote()); 
    }
}

```

#### Cơ chế kỹ thuật của "Silent Rollback" trong Spring Framework

1. **Spring AOP Proxy & Transaction Propagation:** Mặc định của `@Transactional` là `Propagation.REQUIRED`. Khi gọi `recordIncidentLog()`, nó tham gia chung vào cùng một Physical Transaction với hàm cha.
2. Khi câu lệnh `insertAuditLog` bị lỗi độ dài chuỗi (`Data truncation`), PostgreSQL JDBC Driver ném ra `DataIntegrityViolationException` (một unchecked exception kế thừa từ `RuntimeException`).
3. Spring Transaction Interceptor bắt được exception này và lập tức đánh dấu cờ vào giao dịch vật lý: **`setRollbackOnly()`**.
4. Khối `try-catch` ở hàm cha lại bắt lấy exception này (`catch (Exception e)`) và **nuốt chửng nó**, sau đó trả về `CancelResultDto(true)` (báo thành công).
5. Khi hàm kết thúc, luồng xử lý đi qua Proxy của Spring để chuẩn bị Commit. Proxy kiểm tra thấy cờ `isRollbackOnly() == true`. Về nguyên tắc an toàn dữ liệu, Spring **bắt buộc phải thực hiện ROLLBACK toàn bộ** và ném ra `UnexpectedRollbackException`.
6. Tuy nhiên, do Controller đã lỡ serialize DTO thành công trả về từ trước (hoặc có một Global Exception Handler xử lý lỏng lẻo), kết quả là:
* **Client:** Nhận thông báo thành công, công nhân cất đồ đi làm tiếp.
* **Database:** Lệnh nhả tồn kho (`releaseAllocation`) bị hủy bỏ $\rightarrow$ Chiếc quần âu (SKU-B) vẫn bị kẹt ở trạng thái `allocated_quantity` mãi mãi.



---

### 4. Giải pháp xử lý triệt để (Action Plan)

#### Bước 1: Tách rời ranh giới Transaction ghi Audit Log bằng `REQUIRES_NEW`

Việc ghi log kiểm toán không được phép làm ảnh hưởng hoặc kéo sập giao dịch tài chính/kho vận chính. Tách việc ghi log sang một Service riêng biệt với cơ chế giao dịch độc lập:

```java
@Service
public class IncidentAuditService {

    @Autowired
    private IncidentAuditMapper auditMapper;

    // Mở một physical transaction hoàn toàn mới, độc lập với transaction cha
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordIncidentLog(CancelRequest request) {
        try {
            // Cắt ngắn chuỗi an toàn trước khi insert để chống Data Truncation
            String sanitizedNote = StringUtils.truncate(request.getIncidentNote(), 100);
            auditMapper.insertAuditLog(request.getIncidentId(), sanitizedNote);
        } catch (Exception e) {
            // Ghi log lỗi của riêng audit, không để ảnh hưởng đến luồng chính
            log.error("Không thể ghi log audit đóng gói: {}", e.getMessage());
        }
    }
}

```

#### Bước 2: Xóa bỏ Anti-Pattern "Nuốt Exception" ở Business Logic

Hàm nghiệp vụ chính phải chịu trách nhiệm về tính toàn vẹn dữ liệu. Nếu có lỗi nghiệp vụ thực sự xảy ra, phải để exception văng ra ngoài nhằm rollback một cách minh bạch:

```java
@Service
public class PackingConsolidationService {

    @Autowired
    private StockAllocationMapper stockMapper;
    @Autowired
    private IncidentAuditService auditService;

    @Transactional(rollbackFor = Exception.class)
    public CancelResultDto cancelDefectiveItem(CancelRequest request) {
        // 1. Nhả tồn kho giữ chỗ
        int releasedRows = stockMapper.releaseAllocation(request.getValidSkuId(), request.getLocationId());
        if (releasedRows == 0) {
            throw new InventoryAllocationException("Không tìm thấy bản ghi phân bổ để nhả tồn kho!");
        }

        // 2. Chuyển món lỗi sang QUARANTINE
        stockMapper.markAsQuarantine(request.getDefectiveSkuId(), request.getLocationId());

        // 3. Ghi audit log (Chạy trên transaction độc lập, nếu lỗi cũng không làm rollback bước 1 & 2)
        auditService.recordIncidentLog(request);

        return new CancelResultDto(true, "Hủy món và nhả tồn kho thành công");
    }
}

```

#### Bước 3: Viết Batch quét dọn tồn kho "Mồ côi" (Reconciliation Script)

Viết một script SQL chạy một lần để giải phóng toàn bộ số lượng tồn kho đã bị khóa oan trong suốt thời gian hệ thống dính bug:

```sql
-- Tìm và đưa allocated_qty về đúng thực tế cho các đơn đã bị hủy/kết thúc
UPDATE inventory_stock s
SET allocated_qty = allocated_qty - orphaned.stuck_qty,
    update_timestamp = CURRENT_TIMESTAMP
FROM (
    SELECT d.sku_id, d.location_id, SUM(d.allocated_qty) AS stuck_qty
    FROM shipment_instruction_detail d
    JOIN shipment_instruction_header h ON d.header_id = h.id
    WHERE h.status IN ('CANCELLED', 'COMPLETED') 
      AND d.allocation_status = 'ALLOCATED'
    GROUP BY d.sku_id, d.location_id
) orphaned
WHERE s.sku_id = orphaned.sku_id 
  AND s.location_id = orphaned.location_id;

```

---

### 5. Kết quả đạt được (Output & Results)

* **Khắc phục triệt để tồn kho ảo:** Giải phóng hơn **$1.800$ sản phẩm** bị khóa oan trên hệ thống, giúp các mã hàng này ngay lập tức hiển thị "Có hàng" trở lại trên website bán lẻ.
* **Minh bạch hóa lỗi hệ thống:** Không còn hiện tượng "Silent Rollback" hay trả về HTTP 200 giả mạo. Datadog APM phản ánh đúng $100\%$ trạng thái thực tế của Database Transaction.
* **Độ ổn định của dây chuyền:** Việc ghi log sự cố chạy trên transaction riêng biệt `REQUIRES_NEW` giúp các trạm đóng gói vận hành trơn tru, không bao giờ bị nghẽn hay lỗi dây chuyền do các thao tác phụ trợ.

---

### 6. Kịch bản trả lời phỏng vấn đầy đủ (Interview Script)

> **Người phỏng vấn hỏi:** *"Em hãy chia sẻ về một con bug khó chịu hoặc một bài toán bẫy kỹ thuật liên quan đến Transaction mà em từng trực tiếp điều tra và khắc phục?"*

**Bạn trả lời theo khung STAR 4 bước chuẩn mực:**

#### 1. Situation (Bối cảnh nghiệp vụ)

> *"Dạ có, trong phân hệ WES của tụi em có một nghiệp vụ rất quan trọng tại trạm gom đơn đóng gói thương mại điện tử (Consolidation Checkpoint) qua API `SP_AP_0023_01`. Khi khách mua nhiều món, các món được nhặt từ nhiều kệ khác nhau về bàn đóng gói để gom chung vào một hộp.
> Nếu trong quá trình gom, công nhân phát hiện một món bị rách chỉ hoặc dính bẩn, họ sẽ bấm nút 'Hủy món lỗi' trên màn hình. Lúc đó, hệ thống có nhiệm vụ đưa món lỗi vào khu cách ly (`QUARANTINE`), đồng thời phải **nhả giữ chỗ (Release Allocation)** cho món hàng lành lặn còn lại để trả số lượng khả dụng về sổ cái WIV cho khách khác mua, và cuối cùng là ghi một bản ghi lịch sử kiểm toán."*

#### 2. Task & Root Cause (Vấn đề & Phát hiện qua Datadog)

> *"Vấn đề phát sinh là sau một thời gian vận hành, phòng kinh doanh phản ánh rất nhiều mặt hàng Hot Trend bị hiển thị 'Hết hàng' trên web bán hàng, nhưng thực tế kiểm tra dưới kho thì hàng vẫn nằm nguyên trên kệ. Tồn kho bị thất thoát ảo do cờ `allocated_quantity` bị kẹt số lượng rất lớn.
> Em đã trực tiếp dùng **Datadog APM và Log Correlation** để điều tra. Khi soi Flame Graph của các request hủy món, em phát hiện một nghịch lý: Endpoint trả về `HTTP 200 OK`, công nhân thấy thông báo thành công, nhưng trong log Datadog lại âm thầm ghi nhận lỗi:
> `org.springframework.transaction.UnexpectedRollbackException: Transaction marked as rollback-only`.
> Đào sâu vào code tầng Service, em phát hiện ra **Anti-Pattern 'Nuốt Exception' trong Spring `@Transactional**`. Cụ thể, hàm chính gọi một hàm phụ để insert log sự cố vào bảng `packing_incident_audit_log`. Do cột ghi chú bị giới hạn ký tự, câu lệnh insert log văng lỗi `DataIntegrityViolationException`. Spring Transaction Interceptor bắt được lỗi này nên đã âm thầm đánh dấu cờ `setRollbackOnly()`. Nhưng ở hàm cha, dev trước đó lại dùng khối `try-catch` bọc bên ngoài và nuốt lỗi, vẫn trả về DTO thành công cho Controller. Khi ra khỏi method, Spring thấy cờ rollback nên đã **Rollback toàn bộ giao dịch dưới DB**. Kết quả là công nhân thấy popup xanh, nhưng lệnh nhả tồn kho bị hủy bỏ sạch sẽ."*

#### 3. Action (Giải pháp kỹ thuật đã triển khai)

> *"Để xử lý dứt điểm từ gốc rễ, em đã thực hiện 3 bước:
> * *Thứ nhất, em **tách rời ranh giới Transaction (Transaction Boundary)**. Việc ghi log audit không được phép kéo sập luồng nghiệp vụ chính. Em chuyển logic ghi audit sang một Service riêng và cấu hình `@Transactional(propagation = Propagation.REQUIRES_NEW)` kèm hàm cắt chuỗi an toàn. Nhờ đó, việc ghi log chạy trên một physical connection độc lập, kể cả khi log bị lỗi thì luồng nhả kho chính vẫn commit thành công.*
> * *Thứ hai, em dọn dẹp khối `try-catch` nuốt lỗi ở hàm cha, đảm bảo nếu có lỗi nghiệp vụ xảy ra ở luồng chính thì exception phải được ném ra rõ ràng để Controller phản hồi đúng mã lỗi về UI, chấm dứt hoàn toàn hiện tượng Silent Rollback.*
> * *Thứ ba, em viết một script SQL reconciliation để đối soát giữa bảng đơn hàng và bảng tồn kho, giải phóng toàn bộ số lượng tồn kho bị kẹt oan trước đó."*
> 
> 

#### 4. Result (Kết quả đạt được)

> *"Kết quả là tụi em đã giải phóng được hơn 1.800 sản phẩm bị khóa ảo về lại trạng thái khả dụng để tiếp tục bán hàng. Hệ thống vận hành minh bạch, Datadog không còn ghi nhận bất kỳ trace nào bị lỗi `UnexpectedRollbackException`, và độ chính xác tồn kho giữa WES và WIV đạt mức tuyệt đối $100\%$."*