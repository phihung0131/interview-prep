Optimize 2: Chuyển đổi Cơ chế Phân bổ Tồn kho sang Batch In-Memory Aggregation
---

### 1. Context & Bối cảnh hệ thống (Background)

* **Hệ thống liên quan:** Phân hệ **WES (Warehouse Execution System)** phối hợp với **WIV (Warehouse Inventory)**.
* **Mã Batch & Module cốt lõi:**
* `SP_BT_0010_02_EC Import Customer Shipment Instruction IF`: Batch nạp các đợt đơn hàng mới từ hệ thống bán lẻ/OMS vào WES.
* `SP_BT_0012_EC Customer Shipment Allocation`: Cụm batch phân tán chịu trách nhiệm giữ chỗ/cấp phát tồn kho logic:
* `01_EC Get Unallocated Customer Shipment Instruction (Producer)`: Quét và gom các đơn hàng ở trạng thái `UNALLOCATED`.
* `03_EC Submit Customer Shipment Allocation (Aggregator)`: **Nơi diễn ra tối ưu** — Thực thi phân bổ tồn kho và chuyển trạng thái đơn sang `ALLOCATED`.


* `SP_ML_0009_01_EC Submit Customer Shipment Allocation`: Module lõi chạy logic kiểm tra tồn khả dụng và trừ kho logic.
* `IV_AP_0001_03_Retrieve Inventory by Allocation State Type with Conjunction of Conditions(POST)`: Tra cứu số lượng hàng khả dụng.


* **Quy trình nghiệp vụ thực tế (Business Flow):**
1. Trong các chiến dịch khuyến mãi lớn (Flash Sale), hàng chục nghìn khách hàng đặt mua online cùng lúc. Cứ mỗi 2 đến 3 phút, batch `SP_BT_0012` sẽ gom một mẻ lớn (chunk size khoảng **$1.000 - 2.000$ đơn hàng**) để chạy phân bổ tồn kho tự động.
2. Mục tiêu của phân bổ: Đảm bảo đơn hàng được giữ hàng thành công (Locking inventory) để chuyển tiếp sang khâu lập lệnh nhặt (`Picking Instruction`), ngăn chặn tuyệt đối tình trạng bán vượt tồn (Overselling).
3. Đặc thù ngành thời trang: **Quy luật 80/20 (Pareto Principle)** thể hiện cực kỳ rõ rệt. Trong 1.000 đơn hàng của một đợt Flash Sale, có tới $70\% - 80\%$ số đơn tập trung vào chỉ **$5 - 10$ mã sản phẩm Hero/Hot Trend** (ví dụ: Áo thun Airism Đen Size L, Quần Short Kaki Màu Be Size M).



---

### 2. Triệu chứng & Các phát hiện qua Datadog (Detection & Investigation)

#### Triệu chứng vận hành (Business & System Symptom)

* Vào các đợt chạy Flash Sale, batch phân bổ `SP_BT_0012` bị phình thời gian chạy: Một mẻ 2.000 đơn hàng mất tới **$3.5 - 5$ phút** mới xử lý xong.
* Tốc độ xả đơn bị nghẽn (Backlog đơn hàng chưa phân bổ dồn ứ hàng chục nghìn đơn), khiến các khâu phía sau (nhặt hàng bằng robot Exotec, đóng gói) bị thiếu việc làm cục bộ vào đầu ca, sau đó lại bị quá tải dồn dập vào cuối ca.

#### Điều tra tầng sâu trên Datadog (Technical Investigation)

1. **Soi Datadog APM Trace Explorer của Batch Worker:**
* Truy cập Trace của một lượt chạy batch `SP_BT_0012_03`.
* Nhìn vào **Flame Graph**: Trace bị kéo dài ngoằng bởi hàng nghìn span con nối tiếp nhau tuần tự:
```text
[Batch: processAllocationChunk] (Duration: 210s)
   ├── [Order 1] -> SELECT available_qty -> UPDATE inventory_stock (Deduct)
   ├── [Order 2] -> SELECT available_qty -> UPDATE inventory_stock (Deduct)
   ├── [Order 3] -> SELECT available_qty -> UPDATE inventory_stock (Deduct)
   ... (Lặp lại 2.000 lần!)

```


* Thời gian thực thi của mỗi câu `UPDATE` riêng lẻ tăng dần: Đơn đầu tiên chỉ mất $1\text{ms}$, nhưng từ đơn thứ 500 trở đi, mỗi câu `UPDATE` mất tới **$80\text{ms} - 150\text{ms}$**!


2. **Soi Datadog Database Monitoring (DBM) & Lock Trees:**
* Truy cập tab **Wait Events** trên Datadog DBM: Xuất hiện đỉnh nhọn (Spike) của sự kiện chờ `Lock:tuple` và `Lock:transactionid`.
* Datadog **Lock Tree** chỉ thẳng vào nguyên nhân: Hàng chục câu lệnh `UPDATE inventory_stock` đang tranh giành nhau khóa độc quyền dòng (Exclusive Row Lock) trên **cùng một `id` dòng tồn kho** của mã Áo thun Đen Size L (`sku_id = 'TSHIRT-BLK-L'`).
* **Nghịch lý xử lý tuần tự từng đơn (Row Contention Anti-Pattern):**
* Đơn hàng 1 nhảy vào: Khóa dòng Áo thun Đen $\rightarrow$ Trừ 1 cái $\rightarrow$ Commit.
* Đơn hàng 2 nhảy vào: Đứng xếp hàng chờ Đơn 1 nhả khóa $\rightarrow$ Khóa lại $\rightarrow$ Trừ 1 cái $\rightarrow$ Commit.
* ...
* Cứ thế, **1.200 câu lệnh UPDATE xếp hàng đè lên cùng 1 hàng vật lý trong bảng dữ liệu**! Hệ quản trị cơ sở dữ liệu PostgreSQL phải liên tục cấp/nhả row lock và ghi WAL log rời rạc 1.200 lần, dẫn đến tắc nghẽn giao thông nghiêm trọng.





---

### 3. Phân tích & Lựa chọn giải pháp kỹ thuật (Engineering Trade-offs)

Tại sao không tăng luồng Worker xử lý song song (Multi-threading)?

* **Tăng luồng chạy song song:** Càng tăng số worker chạy đồng thời thì xung đột khóa (Lock Contention) trên dòng sản phẩm Hot Trend càng khốc liệt hơn, thời gian chờ khóa tăng theo cấp số nhân và dẫn thẳng tới **Deadlock**.
* **Giải pháp đột phá — Gom nhóm nhu cầu tại bộ nhớ (In-Memory Demand Aggregation):**
* Thay vì tư duy theo hướng *"Xử lý từng đơn hàng độc lập"*, chuyển sang tư duy: **"Xử lý tập trung theo nhu cầu của sản phẩm (SKU-Centric Aggregation)"**.
* Gom toàn bộ nhu cầu mua của 1.000 đơn hàng ngay trong RAM của JVM thành một bảng tổng kết:
$$\text{Tổng cầu Áo thun Đen Size L} = \sum (\text{Nhu cầu từ 1.200 đơn}) = 1.200\text{ chiếc}$$


* Database chỉ cần thực hiện **đúng 1 câu UPDATE duy nhất** để giữ chỗ 1.200 chiếc cho cả mẻ đơn hàng.



---

### 4. Chi tiết triển khai giải pháp (Action Plan)

Mô hình xử lý mới được tái cấu trúc thành **3 giai đoạn tối ưu**:

```
[2.000 Đơn hàng]
       │
       ▼
[Pha 1: Java In-Memory Aggregation] ──> Gom thành Map<SKU, Tổng_Cầu> (Chỉ còn ~30 SKU khác nhau)
       │
       ▼
[Pha 2: Bulk Database Allocation]   ──> Thực thi duy nhất 1 câu UPDATE gộp bằng SQL CTE (Chỉ mất 1 round-trip)
       │
       ▼
[Pha 3: In-Memory Distribution]     ──> Trả kết quả phân bổ về từng đơn hàng trên RAM -> Ghi trạng thái đơn

```

#### Bước 1: Gom nhóm nhu cầu tồn kho trên Java bằng Stream API (Pha 1)

Trước khi chạm vào Database, gom toàn bộ 2.000 đơn hàng thành danh sách tổng cầu theo SKU và vị trí ưu tiên:

```java
@Service
public class BatchAllocationService {

    public AllocationResult processAllocationChunk(List<CustomerOrder> orders) {
        // 1. Gom nhóm toàn bộ order lines theo SKU
        // Từ 5.000 dòng chi tiết của 2.000 đơn -> Rút gọn còn khoảng 30 - 50 SKU tổng
        Map<String, Integer> totalDemandBySku = orders.stream()
                .flatMap(order -> order.getOrderLines().stream())
                .collect(Collectors.groupingBy(
                        OrderLine::getSkuId,
                        Collectors.summingInt(OrderLine::getQuantity)
                ));

        // Chuyển thành danh sách DTO để truyền xuống MyBatis
        List<SkuDemandDto> demandList = totalDemandBySku.entrySet().stream()
                .map(e -> new SkuDemandDto(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(SkuDemandDto::getSkuId)) // Sắp xếp chống deadlock
                .collect(Collectors.toList());

        // 2. Thực thi phân bổ gộp xuống Database
        List<AllocatedStockResult> allocatedResults = executeBulkAllocation(demandList);

        // 3. Phân chia ngược lại cho từng đơn hàng trên RAM
        return distributeStockToOrders(orders, allocatedResults);
    }
}

```

#### Bước 2: Viết câu SQL Atomic Bulk Update bằng CTE trong MyBatis (Pha 2)

Thay vì vòng lặp hàng nghìn câu update, truyền toàn bộ danh sách `demandList` xuống MyBatis để thực thi **một câu lệnh SQL duy nhất** sử dụng PostgreSQL Common Table Expressions (CTE) kết hợp mệnh đề `VALUES`:

```xml
<!-- File: InventoryAllocationMapper.xml -->
<select id="bulkDeductAvailableStock" resultType="AllocatedStockResult">
    WITH demand_table AS (
        -- Bảng tạm chứa nhu cầu tổng của cả mẻ 2.000 đơn
        VALUES 
        <foreach collection="demandList" item="d" separator=",">
            (#{d.skuId}, #{d.totalDemandQty}::INT)
        </foreach>
    ) AS d(sku_id, demand_qty),
    deducted_stock AS (
        -- Update trừ kho một lần duy nhất cho mỗi SKU nếu đủ tồn khả dụng
        UPDATE inventory_stock s
        SET allocated_qty = s.allocated_qty + d.demand_qty,
            update_timestamp = CURRENT_TIMESTAMP
        FROM demand_table d
        WHERE s.sku_id = d.sku_id
          AND s.location_id = 'PICKING-ZONE-01' -- Ưu tiên khu vực nhặt lẻ
          AND (s.total_qty - s.allocated_qty) >= d.demand_qty
        RETURNING s.sku_id, s.location_id, d.demand_qty AS allocated_qty
    )
    -- Trả về danh sách các SKU đã cấp phát thành công trọn gói
    SELECT sku_id, location_id, allocated_qty FROM deducted_stock;
</select>

```

* **Lợi ích vượt trội:**
* Dòng sản phẩm Hot Trend chỉ bị khóa và cập nhật **đúng 1 lần duy nhất** thay vì 1.200 lần.
* Toàn bộ thao tác kiểm tra tồn và trừ giữ chỗ diễn ra nguyên tử ở cấp độ Database Engine trong chưa đầy $10\text{ms}$.



#### Bước 3: Phân phối kết quả về từng đơn hàng trên bộ nhớ RAM (Pha 3)

Sau khi Database xác nhận đã giữ chỗ thành công 1.200 cái áo, tầng Java Service dùng một thuật toán FIFO trên RAM để gán mã giữ chỗ cho từng đơn hàng:

```java
private AllocationResult distributeStockToOrders(List<CustomerOrder> orders, List<AllocatedStockResult> allocatedStocks) {
    Map<String, Integer> stockPool = allocatedStocks.stream()
            .collect(Collectors.toMap(AllocatedStockResult::getSkuId, AllocatedStockResult::getAllocatedQty));

    List<CustomerOrder> successOrders = new ArrayList<>();
    List<CustomerOrder> failedOrders = new ArrayList<>();

    for (CustomerOrder order : orders) {
        boolean canFulfill = true;
        // Kiểm tra xem pool tồn kho đã giữ được có đủ cho đơn này không
        for (OrderLine line : order.getOrderLines()) {
            int availableInPool = stockPool.getOrDefault(line.getSkuId(), 0);
            if (availableInPool < line.getQuantity()) {
                canFulfill = false;
                break;
            }
        }

        if (canFulfill) {
            // Trừ dần trong bộ nhớ RAM
            for (OrderLine line : order.getOrderLines()) {
                stockPool.put(line.getSkuId(), stockPool.get(line.getSkuId()) - line.getQuantity());
            }
            order.setStatus("ALLOCATED");
            successOrders.add(order);
        } else {
            order.setStatus("WAITING_STOCK");
            failedOrders.add(order);
        }
    }

    // Cuối cùng: Dùng MyBatis Batch Insert để lưu trạng thái đơn hàng (1 round-trip)
    orderMapper.batchUpdateOrderStatus(orders);

    return new AllocationResult(successOrders.size(), failedOrders.size());
}

```

---

### 5. Kết quả định lượng (Output & Results)

* **Thời gian thực thi Batch Phân bổ (`SP_BT_0012`):**
* Thời gian xử lý một mẻ 2.000 đơn hàng giảm ngoạn mục từ **$210$ giây (~3.5 phút) xuống còn đúng $8$ giây** (nhanh hơn gấp 26 lần).
* Tốc độ phân bổ trung bình đạt hơn **$250\text{ đơn/giây}$** so với mức cũ chỉ $9.5\text{ đơn/giây}$.


* **Số lượng truy vấn xuống Database:**
* Giảm từ **$4.000$ câu lệnh đọc/ghi riêng lẻ** xuống chỉ còn **$2$ câu lệnh SQL gộp** (1 câu CTE cập nhật tồn kho + 1 câu batch update trạng thái đơn).


* **Triệt tiêu hiện tượng tranh chấp hàng (Row Contention):**
* Sự kiện chờ `Lock:tuple` trên Datadog DBM biến mất hoàn toàn.
* CPU của PostgreSQL database node trong suốt khung giờ Flash Sale giảm tải từ **$90\%$ xuống mức ổn định dưới $30\%$**.


* **Hiệu quả nghiệp vụ kho:** Dòng chảy đơn hàng xuống khu vực robot Exotec và bàn đóng gói diễn ra liên tục, loại bỏ hoàn toàn tình trạng tắc nghẽn xả đơn đầu ca.

---

### 6. Kịch bản trả lời phỏng vấn đầy đủ (Interview Script)

> **Người phỏng vấn hỏi:** *"Em hãy chia sẻ một bài toán tối ưu hóa kết hợp giữa tư duy thuật toán ở tầng Application và cơ chế thực thi của Database mà em tự hào nhất?"*

**Bạn trả lời theo khung STAR 4 bước chuẩn mực:**

#### 1. Situation (Bối cảnh nghiệp vụ)

> *"Dạ có, trong phân hệ WES của tụi em có batch `SP_BT_0012 (EC Customer Shipment Allocation)`. Đây là batch cốt lõi chịu trách nhiệm giữ chỗ tồn kho cho các đơn hàng thương mại điện tử dồn về từ website bán lẻ.
> Cứ mỗi 2 phút, batch sẽ gom một mẻ khoảng 2.000 đơn hàng để phân bổ. Đặc thù ngành thời trang may mặc là vào các đợt Flash Sale, quy luật 80/20 diễn ra rất mạnh: Trong 2.000 đơn hàng dồn về thì có tới $75\%$ số đơn tập trung vào cùng một vài mã sản phẩm Hot Trend, ví dụ như Áo thun Airism màu Đen Size L."*

#### 2. Task & Root Cause (Phát hiện qua Datadog & Bản chất kỹ thuật)

> *"Vấn đề phát sinh là vào các đợt sale lớn, batch phân bổ bị nghẽn nghiêm trọng, chạy mất gần 4 phút mới xong một mẻ 2.000 đơn, làm ứ đọng hàng chục nghìn đơn hàng phía sau.
> Em đã mở **Datadog APM và Database Monitoring (DBM)** để phân tích. Khi nhìn vào **Datadog Lock Tree và Wait Events**, em thấy sự kiện chờ `Lock:tuple` tăng vọt đột biến.
> Soi sâu vào mã nguồn, em phát hiện lỗi kiến trúc kinh điển: **Xử lý tuần tự từng đơn hàng độc lập (Order-by-Order Anti-Pattern)**.
> Batch duyệt qua từng đơn: Đọc đơn 1 $\rightarrow$ khóa dòng Áo thun Đen trừ kho $\rightarrow$ duyệt đơn 2 $\rightarrow$ lại khóa dòng Áo thun Đen trừ kho. Kết quả là có hơn 1.200 câu lệnh `UPDATE` xếp hàng tranh chấp khóa trên cùng một dòng dữ liệu trong bảng `inventory_stock`. Càng nhiều đơn cùng mua một sản phẩm thì thời gian chờ khóa của Database càng tăng theo cấp số nhân."*

#### 3. Action (Giải pháp kỹ thuật đã triển khai)

> *"Thay vì tư duy theo hướng mở thêm thread worker chạy song song (vốn sẽ làm tranh chấp khóa trầm trọng hơn), em đã thay đổi hoàn toàn kiến trúc xử lý bằng kỹ thuật **Gom nhóm nhu cầu tại bộ nhớ (In-Memory Demand Aggregation)** theo 3 bước:
> * *Thứ nhất, ở tầng Java Spring Boot, trước khi chạm vào DB, em dùng **Java Stream API gom toàn bộ 2.000 đơn hàng lại theo mã SKU**. Từ hàng nghìn dòng chi tiết của đơn hàng, hệ thống rút gọn lại chỉ còn khoảng 30 mã SKU tổng. Em tính ra được tổng cầu: Ví dụ chiếc Áo thun Đen Size L cần giữ chỗ tổng cộng 1.200 cái.*
> * *Thứ hai, ở tầng PostgreSQL / MyBatis, thay vì bắn 1.200 câu lệnh update, em truyền danh sách tổng cầu này xuống một **câu lệnh SQL duy nhất sử dụng CTE (Common Table Expressions) kết hợp mệnh đề `VALUES**`. Database chỉ cần thực thi đúng 1 lệnh UPDATE duy nhất để giữ chỗ 1.200 cái áo trong chưa đầy 10ms, triệt tiêu $100\%$ hiện tượng xếp hàng chờ khóa.*
> * *Thứ ba, sau khi Database xác nhận đã giữ chỗ thành công cả mẻ, em thực hiện **thuật toán phân phối FIFO trên bộ nhớ RAM của JVM** để gán ngược lại trạng thái cho từng đơn hàng, và dùng MyBatis Batch Update để cập nhật trạng thái đơn một lần cuối."*
> 
> 

#### 4. Result (Kết quả đạt được)

> *"Nhờ chuyển đổi từ cơ chế lặp database sang gom nhóm bộ nhớ, kết quả đo lường trên Datadog cực kỳ ngoạn mục:
> * *Thời gian chạy của batch 2.000 đơn hàng giảm từ **$210$ giây xuống còn đúng $8$ giây** (nhanh hơn gấp 26 lần).*
> * *Số lượng câu query xuống Database giảm từ hơn 4.000 câu xuống đúng 2 câu lệnh gộp.*
> * *Sự kiện tranh chấp khóa hàng (`Lock:tuple`) biến mất hoàn toàn, CPU Database giảm từ $90\%$ xuống dưới $30\%$, giúp toàn bộ dây chuyền kho xả đơn trơn tru mà không còn hiện tượng tắc nghẽn."*
> 
>