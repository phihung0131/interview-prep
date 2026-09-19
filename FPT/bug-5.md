Bug 5: Sai lệch tồn kho kiểm kê do khác biệt giữa NULL và Chuỗi rỗng ""
---

### 1. Context & Bối cảnh hệ thống (Background)

* **Hệ thống liên quan:** Phân hệ **WES (Warehouse Execution System)** phối hợp với **WIV (Warehouse Inventory)**.
* **Mã API & Batch cốt lõi:**
* `ST_AP_0002_03_Register Stocktaking Counting Result(PUT)`: Công nhân dùng máy quét cầm tay (HT) ghi nhận số lượng kiểm đếm thực tế tại từng ô kệ.
* `ST_AP_0003_01_Retrieve Stocktaking Counting Result Detail(POST)`: Màn hình đối chiếu chênh lệch giữa số đếm thực tế và số liệu sổ cái.
* `ST_AP_0001_03_Register Stocktaking Result Finalization(PUT)`: Chốt kết quả kiểm kê để khóa sổ.
* `ST_BT_0004_02_Import Loss And Gain Finalization Quantity IF` (WIV Batch): Batch WIV tự động nạp kết quả chênh lệch thừa/thiếu (Loss & Gain) để điều chỉnh sổ cái tồn kho.


* **Quy trình nghiệp vụ thực tế (Business Flow):**
1. Định kỳ cuối tháng, kho tiến hành kiểm kê thực tế (Physical Stocktaking) trên toàn bộ các dãy kệ.
2. Trong ngành thời trang may mặc, sản phẩm được quản lý theo **Composite Key đa tầng**: `SKU` + `Location` + **`Lot Number` (Số lô hàng / Secondary Key)**.
* *Hàng có số lô:* Các dòng sản phẩm cao cấp, hàng giới hạn (Limited Edition), hoặc hàng nhập theo hợp đồng riêng sẽ có số lô cụ thể (ví dụ: `LOT-2026-08A`).
* *Hàng không có số lô:* Các mặt hàng cơ bản bán quanh năm (Basic T-Shirt, tất vớ, phụ kiện) nhập hàng loạt không phân chia lô hàng. Cột `lot_no` trong Database cho các mặt hàng này sẽ nhận giá trị **`NULL`**.


3. Khi công nhân quét đếm một ô kệ có 10 chiếc áo thun basic (không có lô), máy quét gửi payload lên:
```json
{
  "skuId": "TSHIRT-BASIC-BLK-M",
  "locationId": "LOC-A-01-02",
  "lotNo": null, // hoặc rỗng ""
  "countedQty": 10
}

```


4. Hệ thống sẽ truy vấn bảng tồn kho hiện tại `inventory_stock` để lấy số lượng trên sổ cái (Book Quantity) tương ứng với Composite Key trên, sau đó lấy:
$$\text{Chênh lệch (Variance)} = \text{Số thực đếm (Counted)} - \text{Số sổ cái (Book)}$$


Nếu $\text{Variance} = 0$, nghĩa là tồn kho khớp chuẩn xác $100\%$.



---

### 2. Triệu chứng & Các phát hiện qua Datadog (Detection & Investigation)

#### Triệu chứng vận hành & Kế toán (Business & Audit Symptom)

* Sau đợt kiểm kê tháng, báo cáo tài chính của kho ghi nhận một con số giật mình: **Tỷ lệ thất thoát hàng hóa (Inventory Discrepancy Rate) tăng vọt bất thường**.
* Hệ thống ghi nhận hàng loạt mặt hàng cơ bản (Basic Items) bị báo mất cắp hoàn toàn (Total Loss).
* Đồng thời, hệ thống tự động sinh ra hàng loạt phiếu điều chỉnh trừ kho (`Loss Finalization`), xóa sạch hàng nghìn chiếc áo thun khỏi sổ cái.
* Nhưng khi quản lý kho ra tận ô kệ kiểm tra, hàng nghìn chiếc áo thun đó **vẫn đang nằm sờ sờ trên giá kệ**, không hề bị mất một chiếc nào.

#### Điều tra tầng sâu trên Datadog (Technical Investigation)

1. **Quan sát Datadog Monitor Alert:**
* Cảnh báo kích hoạt trên kênh Slack của team kỹ thuật:
`[P1 Alert] WIV High Discrepancy Detected - Total Loss Quantity > 5,000 units during Stocktaking Finalization`.


2. **Soi Datadog APM Trace Explorer & Query Metrics:**
* Tìm trace của API đối chiếu kiểm kê `ST_AP_0003_01`.
* Soi câu lệnh SQL MyBatis thực thi xuống PostgreSQL:
```sql
SELECT total_qty FROM inventory_stock 
WHERE sku_id = 'TSHIRT-BASIC-BLK-M' 
  AND location_id = 'LOC-A-01-02' 
  AND lot_no = NULL; -- <-- ĐIỂM BẤT THƯỜNG TRONG EXECUTION PLAN!

```


* Datadog DBM chỉ ra rằng câu query này trả về **`0 rows`** (không tìm thấy bản ghi nào), dù trong bảng `inventory_stock` đang có sẵn dòng dữ liệu `(sku_id = 'TSHIRT-BASIC-BLK-M', location_id = 'LOC-A-01-02', lot_no = NULL, total_qty = 10)`.


3. **Truy vết Log của Batch Xử lý Chênh lệch (WIV Batch Log):**
* Do câu query trả về `0 rows`, tầng Java Service hiểu rằng: *"Sổ cái ghi nhận vị trí này không có hàng (`bookQty = 0`), nhưng công nhân lại đếm được 10"* hoặc tệ hơn ở chiều đối soát ngược lại: *"Sổ cái có 10, nhưng đối soát ra `0` nên tính là mất sạch 10 cái"*.
* Hệ thống tính toán sai lệch hoàn toàn, kích hoạt batch `ST_BT_0004_02` xuất file trừ kho oan hàng nghìn sản phẩm.



---

### 3. Phân tích nguyên nhân gốc rễ (Root Cause Analysis)

Mã nguồn trong file MyBatis Mapper XML được viết như sau:

```xml
<select id="selectStockForStocktaking" resultType="InventoryStock">
    SELECT id, sku_id, location_id, lot_no, total_qty
    FROM inventory_stock
    WHERE sku_id = #{skuId}
      AND location_id = #{locationId}
      AND lot_no = #{lotNo} <!-- TỬ HUYỆT NẰM Ở ĐÂY -->
</select>

```

#### Bản chất kỹ thuật của Logic ba giá trị (Three-Valued Logic) trong SQL

Trong đại số quan hệ và chuẩn ANSI SQL (đặc biệt là PostgreSQL):

1. Giá trị `NULL` đại diện cho khái niệm **"Chưa biết" (Unknown)**, không phải là một giá trị cụ thể.
2. Mọi phép so sánh bằng toán tử `=` với `NULL` đều cho kết quả là `UNKNOWN` (được coi là `FALSE` trong mệnh đề `WHERE`):
$$\text{NULL} = \text{NULL} \implies \mathbf{UNKNOWN\ (FALSE)}$$


$$\text{NULL} = \text{''} \implies \mathbf{UNKNOWN\ (FALSE)}$$


3. Khi công nhân quét sản phẩm không có số lô:
* Nếu ứng dụng gửi `#{lotNo} = null`: Câu SQL trở thành `WHERE ... AND lot_no = null`. Trong PostgreSQL, điều kiện này **luôn luôn trả về FALSE** với mọi dòng dữ liệu, kể cả các dòng có cột `lot_no` đang là `NULL`.
* Nếu máy quét HT gửi chuỗi rỗng `#{lotNo} = ""`: Câu SQL trở thành `WHERE ... AND lot_no = ''`. Trong Postgres (khác với Oracle), chuỗi rỗng `''` và `NULL` là hai giá trị hoàn toàn khác nhau. Dòng dữ liệu có `lot_no IS NULL` sẽ không khớp với `''`, câu query tiếp tục trả về rỗng!



Kết quả là hệ thống không thể tìm thấy bản ghi tồn kho gốc để so sánh, dẫn đến thuật toán tính chênh lệch kiểm kê bị sai hoàn toàn về mặt toán học.

---

### 4. Giải pháp xử lý triệt để (Action Plan)

Để xử lý tận gốc bài toán so sánh `NULL` và chuỗi rỗng trên PostgreSQL mà vẫn giữ câu query gọn gàng, giải pháp được triển khai qua 3 bước:

#### Bước 1: Sử dụng Toán tử `IS NOT DISTINCT FROM` của PostgreSQL trong MyBatis

PostgreSQL cung cấp toán tử chuẩn ANSI SQL **`IS NOT DISTINCT FROM`**. Toán tử này coi hai giá trị `NULL` là tương đương nhau (Null-safe Equality Operator):

```xml
<!-- File: StocktakingMapper.xml -->
<select id="selectStockForStocktaking" resultType="InventoryStock">
    SELECT id, sku_id, location_id, lot_no, total_qty
    FROM inventory_stock
    WHERE sku_id = #{skuId}
      AND location_id = #{locationId}
      <!-- Null-safe comparison: Khớp cả khi cả 2 đều là NULL -->
      AND lot_no IS NOT DISTINCT FROM #{lotNo}
</select>

```

* **Cơ chế:**
* Nếu cả DB và param đều là `NULL` $\implies$ Trả về **`TRUE`**.
* Nếu DB là `LOT-01` và param là `LOT-01` $\implies$ Trả về **`TRUE`**.
* Nếu DB là `NULL` và param là `LOT-01` $\implies$ Trả về **`FALSE`**.



#### Bước 2: Chuẩn hóa Chuỗi rỗng `""` thành `NULL` tại tầng DTO Sanitizer

Để tránh sự nhập nhằng giữa chuỗi rỗng `""` và `NULL` từ các thiết bị máy quét cầm tay gửi lên:

* Viết một Jackson Deserializer hoặc Sanitizer Utility ở tầng Controller:

```java
public class StringTrimmerDeserializer extends JsonDeserializer<String> {
    @Override
    public String deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getValueAsString();
        if (value == null || value.trim().isEmpty()) {
            return null; // Tự động quy đổi chuỗi rỗng "" hoặc khoảng trắng thành NULL thuần túy
        }
        return value.trim();
    }
}

```

* Gắn cấu hình này vào `Jackson2ObjectMapperBuilder` của Spring Boot để đảm bảo toàn bộ payload vào hệ thống đều được làm sạch trước khi xuống tầng Service.

#### Bước 3: Đánh Partial Index / Null-handling Index trên PostgreSQL

Để các câu query dùng `IS NOT DISTINCT FROM` không bị quét tuần tự (Seq Scan), tinh chỉnh lại Index trên bảng tồn kho:

```sql
-- PostgreSQL B-Tree Index mặc định hỗ trợ tốt IS NOT DISTINCT FROM và NULLS FIRST/LAST
CREATE INDEX idx_inventory_stock_lookup 
ON inventory_stock (sku_id, location_id, lot_no);

```

#### Bước 4: Chạy Script Phục hồi Tồn kho bị trừ oan (Correction Script)

Viết script hoàn tác lại toàn bộ các phiếu điều chỉnh tồn kho `Loss Finalization` bị tạo sai trong kỳ kiểm kê vừa qua, trả lại đúng số lượng 10 chiếc áo thun cho từng vị trí kệ.

---

### 5. Kết quả đạt được (Output & Results)

* **Khôi phục tính chính xác của sổ cái:** Khắc phục và hoàn lại hơn **$5.200$ sản phẩm** bị trừ kho nhầm trên toàn hệ thống, đưa tỷ lệ sai lệch kiểm kê (Discrepancy Rate) từ mức báo động $12\%$ trở về mức tiêu chuẩn thực tế dưới **$0.15\%$**.
* **Xử lý triệt để bài toán Null-safe:** Áp dụng chuẩn `IS NOT DISTINCT FROM` cho toàn bộ các mapper MyBatis có chứa cột `lot_no`, `sub_location` hoặc các mã phụ có khả năng mang giá trị `NULL`.
* **Không còn cảnh báo ảo trên Datadog:** Metric cảnh báo `discrepancy.loss_spike` trên Datadog tắt hoàn toàn trong các kỳ kiểm kê tiếp theo.

---

### 6. Kịch bản trả lời phỏng vấn đầy đủ (Interview Script)

> **Người phỏng vấn hỏi:** *"Em hãy chia sẻ một con bug liên quan đến việc xử lý dữ liệu giữa Java và SQL (Data Mapping / SQL Logic) mà em thấy thú vị và để lại bài học sâu sắc nhất?"*

**Bạn trả lời theo khung STAR 4 bước chuẩn mực:**

#### 1. Situation (Bối cảnh nghiệp vụ)

> *"Dạ có, trong phân hệ WES của tụi em có quy trình **Kiểm kê kho thực tế định kỳ (Physical Stocktaking)** qua API `ST_AP_0002_03`.
> Trong ngành bán lẻ may mặc thời trang, sản phẩm được quản lý tồn kho theo tổ hợp khóa đa tầng gồm: Mã hàng (`SKU`) + Tọa độ kệ (`Location`) + **Số lô hàng (`Lot Number`)**. Với các mặt hàng cao cấp thì có số lô cụ thể, còn các mặt hàng cơ bản (Basic T-Shirt, phụ kiện) nhập hàng loạt thì không có số lô, cột `lot_no` dưới cơ sở dữ liệu sẽ nhận giá trị `NULL`.
> Khi công nhân dùng máy quét cầm tay quét đếm hàng trên kệ, hệ thống sẽ đối chiếu số lượng thực đếm với số lượng tồn kho trên sổ cái để tính ra chênh lệch thừa/thiếu (Loss & Gain)."*

#### 2. Task & Root Cause (Vấn đề & Phát hiện qua Datadog)

> *"Sau kỳ kiểm kê tháng, hệ thống Datadog kích hoạt cảnh báo đỏ vì **tỷ lệ hàng báo mất cắp (Total Loss) tăng vọt bất thường**. Hàng loạt mặt hàng áo thun cơ bản bị hệ thống kết luận là mất sạch khỏi kho và tự động kích hoạt batch trừ kho hàng nghìn chiếc, dù thực tế hàng vẫn đang nằm nguyên trên kệ.
> Em đã vào **Datadog APM Trace Explorer** để soi câu lệnh SQL mà MyBatis thực thi xuống PostgreSQL khi đối soát đơn hàng. Em phát hiện câu query có dạng:
> `WHERE sku_id = #{skuId} AND location_id = #{locId} AND lot_no = #{lotNo}`.
> Với các mặt hàng basic không có số lô, param truyền vào là `null` hoặc chuỗi rỗng `""`.
> Lúc này câu lệnh trở thành `lot_no = NULL`. Trong PostgreSQL, theo chuẩn **Three-Valued Logic**, phép so sánh bằng `=` với `NULL` luôn trả về kết quả là `UNKNOWN` (tương đương `FALSE`). Kể cả khi dòng dữ liệu trong DB đang lưu `lot_no IS NULL`, phép so sánh `NULL = NULL` vẫn trả về false!
> Do đó, câu query trả về `0 rows`. Tầng Java hiểu nhầm là sổ cái không có hàng (`bookQty = 0`), từ đó tính toán sai lệch hoàn toàn kết quả kiểm kê."*

#### 3. Action (Giải pháp kỹ thuật đã triển khai)

> *"Em đã xử lý triệt để bài toán này bằng 3 bước:
> * *Thứ nhất, ở tầng cơ sở dữ liệu / MyBatis: Em thay thế toán tử `=` bằng toán tử chuẩn ANSI SQL **`IS NOT DISTINCT FROM`** của PostgreSQL: `AND lot_no IS NOT DISTINCT FROM #{lotNo}`. Toán tử này xử lý an toàn giá trị Null (Null-safe Equality), coi hai giá trị `NULL` là bằng nhau, giúp câu query khớp chính xác dòng dữ liệu trong DB.*
> * *Thứ hai, ở tầng Spring Boot: Để tránh trường hợp máy quét cầm tay gửi chuỗi rỗng `""` thay vì `null`, em viết một **Custom Jackson Deserializer** để tự động chuẩn hóa mọi chuỗi rỗng hoặc khoảng trắng thành `NULL` ngay khi parse Request Body JSON ở Controller.*
> * *Thứ ba, em viết script phục hồi lại toàn bộ số lượng tồn kho đã bị trừ nhầm trước đó trên sổ cái WIV."*
> 
> 

#### 4. Result (Kết quả đạt được)

> *"Kết quả là tụi em đã khôi phục lại hơn 5.200 sản phẩm bị trừ kho oan, đưa tỷ lệ sai lệch kiểm kê về đúng thực tế dưới $0.15\%$. Đây là bài học rất sâu sắc về sự khác biệt giữa xử lý giá trị `NULL` trong ngôn ngữ lập trình Java và logic ba trạng thái trong cơ sở dữ liệu quan hệ SQL."*