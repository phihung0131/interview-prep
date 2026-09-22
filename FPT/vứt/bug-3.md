Bug 3: Đơn hàng bị treo vĩnh viễn do sai sót khi chia lô hàng lẻ (Assortment Breakdown)
---

### 1. Context & Bối cảnh hệ thống (Background)

* **Hệ thống liên quan:** Phân hệ **WES (Warehouse Execution System)** phối hợp với **WIV (Warehouse Inventory)**.
* **Mã API & Batch cốt lõi:**
* `MS_BT_0003_02_Import Assortment Breakdown Master IF`: Nạp định mức công thức cấu tạo của bộ combo (BOM - Bill of Materials). Ví dụ: 1 Bộ thể thao (`SET-01`) = 1 Áo khoác (`TOP-01`) + 1 Quần dài (`BOT-01`).
* `IV_AP_0011_01_DC Retrieve Assortment Disassembling Instruction(POST)` & `02_DC Register Assortment Disassembling Instruction(PUT)`: WES tạo chỉ thị tháo dỡ một số lượng lớn bộ combo để chuyển thành hàng lẻ bán lẻ.
* `IV_BT_0007_DC Assortment Disassembling Allocation Result Assignment`:
* `01_Get Assortment Disassembling Allocation Result (Producer)`: Quét các lệnh tháo dỡ ở trạng thái `APPROVED`.
* `02_Assign Assortment Disassembling Allocation Result (Member)`: **Nơi xảy ra bug** — Chia nhỏ khối lượng công việc của lô hàng lớn cho nhiều công nhân tại các bàn thao tác (Workstations).
* `03_Update Assortment Disassembling Instruction Header Status (Aggregator)`: Kiểm tra tiến độ phân bổ để chuyển trạng thái lệnh từ `ALLOCATING` sang `ALLOCATED` trước khi in phiếu.




* **Quy trình nghiệp vụ thực tế (Business Flow):**
1. Kho DC cần gấp sản phẩm lẻ để cấp cho các cửa hàng bán lẻ hoặc đóng đơn EC. Quản lý kho tạo lệnh tháo dỡ **10 bộ combo thể thao `SET-01**`.
2. Tại khu vực gia công nội bộ kho, có **3 bàn thao tác (Workstations)** đang sẵn sàng làm việc (`Member 1`, `Member 2`, `Member 3`).
3. Batch `IV_BT_0007_02` có nhiệm vụ: Tự động chia 10 bộ combo này cho 3 công nhân sao cho khối lượng công việc đồng đều nhất có thể, tạo ra các dòng chi tiết `detail` tương ứng với từng công nhân.
4. Sau khi chia việc xong, Batch Aggregator `IV_BT_0007_03` quét lại: Nếu tổng số lượng giao cho các công nhân khớp đúng bằng số lượng trên Header ($10$ bộ), lệnh sẽ được chốt trạng thái `ALLOCATED` để máy in tự động in phiếu chỉ thị gia công (`IV_AP_0011_03_DC Print Assortment Disassembling Instruction`).



---

### 2. Triệu chứng & Các phát hiện qua Datadog (Detection & Investigation)

#### Triệu chứng vận hành dưới kho (Business Symptom)

* Công nhân tại các bàn gia công đứng chơi vì không có phiếu việc nhả ra từ máy in.
* Quản lý kho tra cứu trên Web UI thấy lệnh tháo dỡ bị kẹt cứng ở trạng thái `IN_PROGRESS` (hoặc `ALLOCATING`) nhiều ngày liền, không thể hủy, không thể in, cũng không thể thực hiện.
* Hàng tồn kho của 10 bộ combo cha bị khóa giữ chỗ (Allocated), không thể đem đi bán mà cũng không được tháo ra thành hàng lẻ.

#### Điều tra tầng sâu trên Datadog (Technical Investigation)

1. **Quan sát Datadog Monitor Alert:**
* Một cảnh báo tự động trên Datadog kích hoạt:
`[P2 Alert] WES Assortment Instructions stuck in ALLOCATING status > 2 hours`.
* Truy cập Datadog Dashboard, thấy số lượng lệnh bị treo tăng dần theo từng ngày, đặc biệt tập trung vào các lệnh có số lượng tổng không chia hết cho số lượng bàn thao tác đang online.


2. **Soi Datadog Log Management & Trace Correlation:**
* Lọc log của worker chạy batch `IV_BT_0007_03 (Aggregator)` theo `instruction_id`:
```text
DEBUG [IV_BT_0007_03] Checking instructionId: INS-ASSORT-2026-0042
DEBUG [IV_BT_0007_03] Header Total Qty: 10
DEBUG [IV_BT_0007_03] Aggregated Assigned Detail Qty: 9
WARN  [IV_BT_0007_03] Quantity mismatch! Header: 10, Details Sum: 9. Skipping status transition to ALLOCATED.

```


* **Bức tranh sáng tỏ:** Header yêu cầu tách 10 bộ, nhưng tổng số lượng giao xuống các chi tiết của 3 công nhân cộng lại chỉ có **9 bộ**.
* Hệ thống bị rơi vào trạng thái bế tắc vô tận (Deadlock logic): Aggregator đòi đủ 10 mới cho qua, nhưng Member chỉ tạo ra 9 dòng việc!



---

### 3. Phân tích nguyên nhân gốc rễ (Root Cause Analysis)

Mở mã nguồn của worker `IV_BT_0007_02_Assign Member`, đoạn code chia việc được viết rất ngây thơ:

```java
@Service
public class AssortmentAssignmentService {

    public void assignWorkToMembers(AssortmentHeader header, List<WorkerStation> availableStations) {
        int totalQty = header.getTotalQty(); // Ví dụ: 10
        int numStations = availableStations.size(); // Ví dụ: 3 bàn thao tác

        // LỖI CHẾT NGƯỜI: Phép chia số nguyên trong Java (Integer Division)
        int qtyPerStation = totalQty / numStations; // 10 / 3 = 3 (mất phần thập phân .333)

        List<AssortmentDetail> details = new ArrayList<>();
        for (WorkerStation station : availableStations) {
            AssortmentDetail detail = new AssortmentDetail();
            detail.setHeaderId(header.getId());
            detail.setStationId(station.getId());
            detail.setAssignedQty(qtyPerStation); // Mỗi trạm nhận 3 bộ
            details.add(detail);
        }

        // Lưu xuống DB: 3 trạm x 3 bộ = 9 bộ.
        // ĐÚNG 1 BỘ DƯ (Remainder = 1) BỊ "BỐC HƠI" KHỎI TẦNG BỘ NHỚ!
        detailMapper.batchInsert(details);
    }
}

```

#### Bản chất kỹ thuật của lỗi

1. **Integer Division Truncation:** Trong Java, phép chia giữa hai số kiểu `int` (`10 / 3`) sẽ tự động chặt cụt phần thập phân và lấy phần nguyên là `3`.
2. $3 \times 3 = 9$, số dư $10 \pmod 3 = 1$ bị bỏ quên hoàn toàn.
3. Ở tầng Aggregator (`IV_BT_0007_03`), điều kiện nghiệm thu logic được viết rất chặt chẽ:
```sql
SELECT CASE WHEN SUM(assigned_qty) = #{headerTotalQty} THEN 'VALID' ELSE 'INVALID' END
FROM assortment_disassembling_detail
WHERE header_id = #{headerId};

```


Vì $9 \ne 10$, Aggregator hiểu rằng "tiến trình phân bổ chưa làm xong" và bỏ qua, chờ lượt chạy tiếp theo của batch. Lượt chạy sau quét lại vẫn thấy $9 \ne 10$, dẫn đến vòng lặp vô tận khiến đơn hàng bị treo vĩnh viễn.

---

### 4. Giải pháp xử lý triệt để (Action Plan)

Để giải quyết bài toán chia lô không đều và bảo toàn số lượng chính xác $100\%$, giải pháp được chia làm 3 bước:

#### Bước 1: Áp dụng Thuật toán Phân bổ phần dư (Largest Remainder Method / Modulo Distribution)

Viết lại thuật toán phân bổ trong Java: Chia đều phần nguyên trước, sau đó rải lần lượt các đơn vị phần dư (Remainder) vào các trạm đầu tiên cho đến khi hết dư:

```java
@Service
public class AssortmentAssignmentService {

    public void assignWorkToMembers(AssortmentHeader header, List<WorkerStation> availableStations) {
        int totalQty = header.getTotalQty(); // 10
        int numStations = availableStations.size(); // 3

        int baseQty = totalQty / numStations; // Phần nguyên cơ bản: 3
        int remainder = totalQty % numStations; // Số dư: 10 % 3 = 1

        List<AssortmentDetail> details = new ArrayList<>();

        for (int i = 0; i < numStations; i++) {
            // Trạm nào nằm trong phạm vi số dư sẽ được cộng thêm 1 đơn vị
            int finalQty = baseQty + (i < remainder ? 1 : 0);

            if (finalQty > 0) { // Tránh trường hợp chia cho quá nhiều trạm dẫn đến qty = 0
                AssortmentDetail detail = new AssortmentDetail();
                detail.setHeaderId(header.getId());
                detail.setStationId(availableStations.get(i).getId());
                detail.setAssignedQty(finalQty);
                details.add(detail);
            }
        }

        // Kết quả phân bổ:
        // Trạm 0: 3 + 1 = 4 bộ
        // Trạm 1: 3 + 0 = 3 bộ
        // Trạm 2: 3 + 0 = 3 bộ
        // Tổng: 4 + 3 + 3 = đúng 10 bộ!
        detailMapper.batchInsert(details);
    }
}

```

#### Bước 2: Thêm Ràng buộc Toàn vẹn (Integrity Check) ở Tầng Cơ sở dữ liệu

Để đảm bảo không bao giờ có sai sót logic nào lọt qua được xuống Database, tạo một Trigger kiểm tra hoặc viết một câu Assertion trước khi Aggregator chốt trạng thái:

```sql
-- Kiểm tra trước khi cập nhật trạng thái
UPDATE assortment_disassembling_header h
SET status = 'ALLOCATED',
    update_timestamp = CURRENT_TIMESTAMP
WHERE h.id = #{headerId}
  AND h.total_qty = (
      SELECT COALESCE(SUM(d.assigned_qty), 0)
      FROM assortment_disassembling_detail d
      WHERE d.header_id = h.id
  );

```

#### Bước 3: Script Tự động Phục hồi các Lệnh Treo (Self-Healing Job)

Viết một script SQL chạy một lần quét toàn bộ các lệnh đang kẹt ở trạng thái `IN_PROGRESS` trước đó, tính toán phần dư bị thiếu và bù thêm vào dòng chi tiết của công nhân đầu tiên, sau đó kích hoạt Aggregator chạy lại để giải phóng toàn bộ đơn hàng bị nghẽn.

---

### 5. Kết quả đạt được (Output & Results)

* **Khắc phục $100\%$ đơn hàng bị treo:** Giải phóng toàn bộ các lệnh tháo dỡ combo bị kẹt, máy in nhả phiếu gia công bình thường, giải tỏa hàng trăm bộ quần áo bị giam giữ tồn kho logic.
* **Bảo toàn số lượng tuyệt đối:** Bất kể số lượng chia là bao nhiêu (ví dụ: $7$ bộ cho $4$ trạm, $100$ bộ cho $7$ trạm), thuật toán Modulo Distribution luôn đảm bảo $\sum \text{Detail Qty} \equiv \text{Header Total Qty}$.
* **Hoàn thiện hệ thống giám sát Datadog:** Metric `assortment.stuck_orders` giảm về $0$, thiết lập thêm SLA cảnh báo nếu bất kỳ lệnh gia công nào ở trạng thái trung gian quá 15 phút.

---

### 6. Kịch bản trả lời phỏng vấn đầy đủ (Interview Script)

> **Người phỏng vấn hỏi:** *"Em hãy chia sẻ một con bug nghiệp vụ (Business Logic Bug) mà nguyên nhân xuất phát từ một lỗi kỹ thuật tưởng chừng rất nhỏ của lập trình viên, nhưng hậu quả lại làm nghẽn cả một quy trình vận hành?"*

**Bạn trả lời theo khung STAR 4 bước chuẩn mực:**

#### 1. Situation (Bối cảnh nghiệp vụ)

> *"Dạ có, trong phân hệ WES của tụi em có nghiệp vụ **Gia công tháo dỡ combo quần áo (Assortment Disassembling)** qua cụm batch `IV_BT_0007`.
> Trong ngành thời trang may mặc, khi kho cần gấp hàng lẻ để bán, hệ thống sẽ tạo lệnh tháo dỡ các bộ combo (gồm 1 áo + 1 quần) thành từng sản phẩm riêng biệt. Lô hàng lớn này được cụm batch chạy ngầm chia việc tự động cho các bàn gia công (`Workstations`) của công nhân.
> Cụm batch thiết kế theo mô hình phân tán: Batch `Member` chia số lượng cho từng trạm, sau đó Batch `Aggregator` sẽ quét lại: nếu tổng số lượng giao cho các trạm khớp đúng $100\%$ số lượng trên lệnh gốc thì mới đổi trạng thái sang `ALLOCATED` để máy in tự động in phiếu việc ra giấy cho công nhân làm."*

#### 2. Task & Root Cause (Vấn đề & Phát hiện qua Datadog)

> *"Vấn đề phát sinh là dưới kho có những ngày công nhân đứng chơi vì máy in không nhả phiếu, còn trên màn hình Web UI thì lệnh tháo dỡ bị kẹt cứng ở trạng thái `IN_PROGRESS` cả tuần liền. Tồn kho của các bộ combo bị khóa giữ chỗ (Allocated), không bán được mà cũng không tháo dỡ được.
> Nhờ cảnh báo monitor trên **Datadog**, em vào **Datadog Log Management** lọc theo `instruction_id` của các lệnh bị treo. Em phát hiện một nghịch lý: Lệnh gốc Header yêu cầu tách 10 bộ, nhưng log của Aggregator lại ghi: `Header Total: 10, Details Sum: 9. Mismatch!`. Vì thiếu đúng 1 bộ nên Aggregator không bao giờ duyệt hoàn tất.
> Đào sâu vào mã nguồn Java của batch Member, em phát hiện lỗi kinh điển: **Phép chia số nguyên (Integer Division)**. Lệnh yêu cầu tách 10 bộ chia cho 3 bàn thao tác đang online. Dev trước đó viết code: `int qtyPerStation = totalQty / numStations;` tức là `10 / 3`. Trong Java, phép chia int lấy phần nguyên là `3`. Vòng lặp gán cho 3 bàn mỗi bàn 3 bộ, tổng là 9 bộ. **Đúng 1 bộ dư (Remainder = 1) đã bị bốc hơi hoàn toàn khỏi bộ nhớ!**"*

#### 3. Action (Giải pháp kỹ thuật đã triển khai)

> *"Em đã xử lý dứt điểm bài toán này bằng 2 bước:
> * *Về mặt thuật toán: Em thay thế phép chia nguyên bằng **Thuật toán phân bổ phần dư (Largest Remainder Method / Modulo Distribution)**. Hệ thống lấy phần nguyên cơ bản bằng phép chia `/`, đồng thời lấy số dư bằng phép chia `%` (`10 % 3 = 1`). Sau đó, em dùng vòng lặp rải đều số dư này vào các bàn thao tác đầu tiên (Trạm 1 nhận 4 bộ, Trạm 2 nhận 3 bộ, Trạm 3 nhận 3 bộ). Đảm bảo tổng số lượng phân bổ luôn khớp chính xác tuyệt đối với Header.*
> * *Về mặt bảo vệ dữ liệu: Em siết chặt điều kiện Atomic Update dưới PostgreSQL bằng câu lệnh có mệnh đề kiểm tra `WHERE total_qty = (SELECT SUM(assigned_qty) FROM details)`. Đồng thời em chạy script tự động bù số lượng thiếu cho các đơn đang bị kẹt để hệ thống tự động thông luồng.*
> * *Em cấu hình một Datadog Synthetic Metric để theo dõi tỷ lệ phân bổ của các batch gia công trong kho."*
> 
> 

#### 4. Result (Kết quả đạt được)

> *"Kết quả là giải phóng được toàn bộ các lô hàng bị kẹt, máy in hoạt động trơn tru. Thuật toán mới đảm bảo tính đúng đắn toán học $100\%$ cho mọi trường hợp chia lô lẻ trong kho, không còn bất kỳ đơn hàng nào bị treo trạng thái, và loại bỏ hoàn toàn sự cố giam giữ tồn kho logic."*