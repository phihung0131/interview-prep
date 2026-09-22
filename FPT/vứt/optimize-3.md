Optimize 3: Tối ưu câu SQL Tra cứu Vị trí Ô kệ trống bằng "Covering Index"
---

### 1. Context & Bối cảnh hệ thống (Background)

* **Hệ thống liên quan:** Phân hệ **WES (Warehouse Execution System)** phối hợp với thiết bị máy quét cầm tay (HT - Handy Terminal) và xe nâng cất hàng.
* **Mã API & Module cốt lõi:**
* `RC_AP_0005_01_Recommend Receiving Putaway To(POST)`: API gợi ý vị trí ô kệ tối ưu nhất để cất hàng vừa dỡ từ xe tải.
* `IV_AP_0004_01_Retrieve Empty In Warehouse Location(POST)`: API lõi chuyên trách quét và lọc các ô kệ đang còn trống trong kho.
* `RC_AP_0004_04_DC Register Receiving Putaway Result(PUT)`: Ghi nhận kết quả xe nâng đã cất pallet vào ô kệ thành công.


* **Quy trình nghiệp vụ thực tế (Business Flow):**
1. Mỗi buổi sáng hoặc đầu ca làm việc, hàng chục xe container cập cảng kho mang theo hàng chục nghìn thùng quần áo.
2. Tại cửa kho (Inbound Staging Area), hàng chục tài xế xe nâng quét mã vạch từng pallet hàng trên máy quét HT.
3. Ứng dụng WES gọi API `RC_AP_0005_01` để **gợi ý ngay lập tức 5 đến 10 ô kệ trống phù hợp nhất** cho tài xế:
* Ô kệ phải trống (`is_empty = true`).
* Ô kệ không bị khóa bảo trì/kiểm kê (`is_locked = false`).
* Ô kệ thuộc phân khu giá đỡ pallet (`location_type = 'RACK'`).
* Sắp xếp theo điểm ưu tiên (`priority_score DESC`): Ưu tiên ô kệ gần cửa kho nhất, tầng thấp nhất để xe nâng di chuyển quãng đường ngắn nhất.


4. Hệ thống phải trả về các thông tin địa lý: `location_id`, `area_id` (Khu vực), `zone_id` (Dãy kệ) để hiển thị lên màn hình xe nâng.



---

### 2. Triệu chứng & Các phát hiện qua Datadog (Detection & Investigation)

#### Triệu chứng vận hành dưới kho (Business Symptom)

* Vào các khung giờ cao điểm dỡ hàng (08:00 - 10:30 sáng), tài xế xe nâng phàn nàn: Quét mã pallet xong, màn hình máy quét bị xoay vòng chờ **$1.5 - 3$ giây** mới hiện ra vị trí kệ cần cất.
* Xe nâng phải xếp hàng dài chờ đợi trước cửa kho, gây tắc nghẽn giao thông cục bộ tại khu vực tiếp nhận hàng.

#### Điều tra tầng sâu trên Datadog (Technical Investigation)

1. **Soi Datadog APM & Database Monitoring (DBM):**
* Endpoint `RC_AP_0005_01` có lượng gọi dồn dập (khoảng **$400 - 600\text{ req/min}$**).
* P95 Latency của câu query tìm kệ trống dao động từ **$120\text{ms} - 280\text{ms}$**, đẩy thời gian phản hồi tổng thể của API lên hơn $1.5\text{s}$ do phải tính toán thêm logic phụ trợ.
* Truy cập tab **Top Queries** trên Datadog DBM: Câu lệnh sau chiếm tới **$35\%$ I/O đọc đĩa (Disk Read I/O)** của Database:
```sql
SELECT location_id, area_id, zone_id 
FROM warehouse_location 
WHERE is_empty = true 
  AND is_locked = false 
  AND location_type = 'RACK'
ORDER BY priority_score DESC 
LIMIT 10;

```




2. **Phân tích Execution Plan (EXPLAIN ANALYZE) qua Datadog:**
* Bảng `warehouse_location` có khoảng **$500.000$ dòng** (đại diện cho toàn bộ các ô kệ trong kho lớn).
* Dev trước đó đã tạo một B-Tree Index:
```sql
CREATE INDEX idx_location_search ON warehouse_location (is_empty, is_locked, location_type, priority_score);

```


* **Điểm thắt cổ chai vật lý (The Bottleneck):**
* Plan thực thi hiển thị: `Bitmap Index Scan` hoặc `Index Scan`, theo sau bởi một bước cực kỳ tốn kém: **`Heap Fetches: 45.000`**.
* **Bản chất kỹ thuật:** Index hiện tại chỉ chứa các cột điều kiện (`is_empty`, `is_locked`, `location_type`, `priority_score`). Nó **không chứa** dữ liệu của cột `area_id` và `zone_id`.
* Do đó, sau khi tìm thấy các con trỏ dòng (Tuple IDs) thỏa mãn trên Index Tree, PostgreSQL bắt buộc phải thực hiện thêm một bước gọi là **Table Random Access (Heap Fetch)**: Nhảy vào bảng dữ liệu vật lý trên ổ đĩa để lôi `area_id` và `zone_id` lên.
* Khi có hàng chục xe nâng cùng quét liên tục, bộ nhớ đệm Buffer Pool của Postgres bị quá tải, buộc DB phải đọc trực tiếp từ đĩa cứng (Random Disk I/O Read), gây ra hiện tượng sụt giảm hiệu năng nghiêm trọng.





---

### 3. Phân tích & Lựa chọn giải pháp kỹ thuật (Engineering Trade-offs)

Làm sao để câu query **chỉ đọc dữ liệu ngay trên Index mà không cần chạm vào bảng dữ liệu vật lý (Zero Heap Fetches)**?

* **Phương án 1: Thêm `area_id, zone_id` vào làm khóa của Composite Index thường:**
```sql
CREATE INDEX idx_bad ON warehouse_location (is_empty, is_locked, location_type, priority_score, area_id, zone_id);

```


* *Nhược điểm:* `area_id` và `zone_id` sẽ tham gia vào cấu trúc cây B-Tree. Khi gán thêm cột vào khóa, cây index phình to, chi phí sắp xếp (sorting) và chi phí ghi khi cập nhật vị trí kệ tăng cao, làm chậm các lệnh `UPDATE warehouse_location`.


* **Phương án 2 (Tối ưu tuyệt đối): Sử dụng "Covering Index" với mệnh đề `INCLUDE` của PostgreSQL:**
* Từ PostgreSQL 11+, tính năng **Covering Index (`INCLUDE`)** cho phép tách bạch rõ ràng:
* **Key Columns (Cột khóa):** Dùng để lọc và sắp xếp (`WHERE`, `ORDER BY`).
* **Non-Key / Payload Columns (Cột dữ liệu đính kèm):** Nằm ở các node lá (Leaf Nodes) của Index, không tham gia vào cấu trúc cây tìm kiếm, chỉ phục vụ việc lấy trực tiếp giá trị cho mệnh đề `SELECT`.





---

### 4. Chi tiết triển khai giải pháp (Action Plan)

#### Bước 1: Tạo Covering Index với Mệnh đề `INCLUDE` (Zero-Downtime)

Triển khai câu lệnh tạo index trực tiếp trên PostgreSQL production bằng cờ `CONCURRENTLY` để không khóa bảng:

```sql
-- Tạo Covering Index bao gồm cả cột điều kiện và cột payload trả về
CREATE INDEX CONCURRENTLY idx_empty_location_covering 
ON warehouse_location (is_empty, is_locked, location_type, priority_score DESC)
INCLUDE (location_id, area_id, zone_id);

```

* **Cơ chế hoạt động bên dưới của PostgreSQL:**
* B-Tree Index chỉ đánh khóa trên: `(is_empty, is_locked, location_type, priority_score DESC)`. Cây tìm kiếm cực kỳ gọn gàng, độ sâu (tree depth) thấp.
* Ba cột `location_id`, `area_id`, `zone_id` được gắn kèm vào tầng lá (Leaf pages).
* Khi câu SQL thực thi, PostgreSQL kích hoạt cơ chế đỉnh cao: **Index-Only Scan**. Toàn bộ dữ liệu cần cho câu lệnh đều có sẵn trong Index. Số lượt truy cập bảng vật lý (`Heap Fetches`) giảm về **chính xác bằng `0**`.



#### Bước 2: Tinh chỉnh Vacuum & Visibility Map

Để đảm bảo PostgreSQL luôn ưu tiên chọn `Index-Only Scan`, bảng cần có **Visibility Map** sạch sẽ (xác nhận các block dữ liệu không chứa dead tuples):

* Chạy lệnh dọn dẹp và cập nhật thống kê ngay sau khi tạo index:
```sql
VACUUM ANALYZE warehouse_location;

```



#### Bước 3: Chuẩn hóa câu query MyBatis Mapper

Đảm bảo câu lệnh XML của MyBatis chỉ lấy đúng và đủ các cột đã được bọc trong Covering Index (tránh dùng `SELECT *` làm mất tác dụng của Index-Only Scan):

```xml
<!-- File: WarehouseLocationMapper.xml -->
<select id="selectTopEmptyLocations" resultType="LocationRecommendDto">
    SELECT location_id, area_id, zone_id
    FROM warehouse_location
    WHERE is_empty = true
      AND is_locked = false
      AND location_type = 'RACK'
    ORDER BY priority_score DESC
    LIMIT #{limit};
</select>

```

---

### 5. Kết quả định lượng (Output & Results)

* **Execution Plan trước và sau tối ưu (Đo lường bằng `EXPLAIN ANALYZE`):**
* *Trước:* `Bitmap Heap Scan` | `Heap Fetches: ~45.000` | Execution Time: **$120\text{ms} - 180\text{ms}$**.
* *Sau:* **`Index Only Scan using idx_empty_location_covering`** | `Heap Fetches: 0` | Execution Time: **$1.2\text{ms} - 1.8\text{ms}$** (Nhanh hơn gần **$100$ lần**).


* **Tài nguyên Database:**
* I/O Đọc đĩa ngẫu nhiên (Random Disk Read) của câu query giảm **$99\%$**, toàn bộ dữ liệu lá của Index nằm gọn trong bộ nhớ đệm Buffer Pool.
* CPU Database trong khung giờ dỡ hàng buổi sáng giảm tải từ **$65\%$ xuống còn $22\%$**.


* **Hiệu quả vận hành kho:**
* P99 Latency của API gợi ý vị trí cất hàng (`RC_AP_0005_01`) giảm từ **$1.5\text{s}$ xuống dưới $40\text{ms}$**.
* Tài xế xe nâng quét mã pallet là vị trí kệ hiện lên màn hình máy quét ngay lập tức, triệt tiêu hoàn toàn hiện tượng ùn tắc xe nâng trước cửa kho.



---

### 6. Kịch bản trả lời phỏng vấn đầy đủ (Interview Script)

> **Người phỏng vấn hỏi:** *"Em hãy chia sẻ một case tối ưu hóa câu truy vấn Database (SQL/Index Optimization) mà em thấy tự hào nhất? Em đã dùng kỹ thuật gì đặc biệt ngoài việc đánh index B-Tree thông thường?"*

**Bạn trả lời theo khung STAR 4 bước chuẩn mực:**

#### 1. Situation (Bối cảnh nghiệp vụ)

> *"Dạ có, trong phân hệ WES của tụi em có API `RC_AP_0005_01` dùng để **gợi ý ô kệ trống tối ưu cho xe nâng cất hàng** khi dỡ các container từ nhà máy về kho.
> Mỗi khi tài xế xe nâng quét mã pallet hàng, hệ thống phải chạy câu query lọc trên bảng 500.000 ô kệ để tìm ra top 10 vị trí kệ còn trống (`is_empty = true`), không bị khóa (`is_locked = false`), thuộc khu vực giá đỡ pallet (`location_type = 'RACK'`) và sắp xếp theo điểm ưu tiên gần cửa nhất (`priority_score DESC`) để xe nâng di chuyển ngắn nhất."*

#### 2. Task & Root Cause (Phát hiện qua Datadog & Bản chất kỹ thuật)

> *"Vào khung giờ dỡ hàng buổi sáng, hàng chục xe nâng quét liên tục khiến API bị chậm, máy quét cầm tay quay tròn mất gần 2 giây, gây ùn ứ xe nâng tại cửa nhận hàng.
> Em vào **Datadog Database Monitoring (DBM)** để kiểm tra thì thấy câu query tìm kệ trống chiếm tới $35\%$ Disk Read I/O của toàn bộ Database với thời gian chạy trung bình $150\text{ms}$.
> Bật `EXPLAIN ANALYZE` lên soi, em thấy bảng đã có sẵn B-Tree Index trên các cột điều kiện, nhưng execution plan vẫn phải thực hiện một bước cực kỳ tốn kém là **Heap Fetches hàng chục ngàn dòng**.
> Nguyên nhân là vì Index cũ chỉ chứa các cột trong mệnh đề `WHERE` và `ORDER BY`, nó **không chứa các cột dữ liệu cần lấy ra ở mệnh đề SELECT** là `area_id` và `zone_id`. Do đó, sau khi quét index xong, PostgreSQL vẫn buộc phải thực hiện Table Random Access nhảy vào bảng dữ liệu vật lý trên ổ đĩa để lôi dữ liệu lên, gây nghẽn I/O đĩa cứng nghiêm trọng."*

#### 3. Action (Giải pháp kỹ thuật đã triển khai)

> *"Thay vì thêm các cột `area_id`, `zone_id` vào khóa của B-Tree index thông thường (vốn sẽ làm phình to cây index và làm chậm các thao tác ghi), em đã quyết định triển khai kỹ thuật **Covering Index với mệnh đề `INCLUDE` của PostgreSQL**:
> * *Em tạo index: `CREATE INDEX CONCURRENTLY idx_empty_location_covering ON warehouse_location (is_empty, is_locked, location_type, priority_score DESC) INCLUDE (location_id, area_id, zone_id)`.*
> * *Bằng cách đưa các cột cần SELECT vào mệnh đề `INCLUDE`, các giá trị này sẽ được lưu kèm ở tầng lá của Index mà không tham gia vào cấu trúc cây khóa B-Tree.*
> * *Nhờ đó, PostgreSQL kích hoạt được cơ chế **`Index-Only Scan`**. Toàn bộ dữ liệu của câu query đều được đọc trực tiếp 100% từ Index trong bộ nhớ đệm, số lần đọc bảng vật lý `Heap Fetches` giảm về đúng bằng `0`.*
> * *Em chạy `VACUUM ANALYZE` để làm sạch Visibility Map và chuẩn hóa Mapper XML của MyBatis chỉ SELECT đúng các cột này."*
> 
> 

#### 4. Result (Kết quả đạt được)

> *"Kết quả đo lường thực tế cực kỳ thuyết phục:
> * *Thời gian thực thi của câu query giảm từ **$150\text{ms}$ xuống chỉ còn $1.5\text{ms}$** (nhanh hơn 100 lần).*
> * *Đĩa cứng giảm $99\%$ tải đọc ngẫu nhiên, CPU Database giảm từ $65\%$ về mức $22\%$.*
> * *Thời gian phản hồi trên máy quét của tài xế xe nâng giảm từ gần 2 giây xuống dưới $40\text{ms}$, giúp dòng chảy hàng hóa tại cửa kho được giải phóng trơn tru mà không còn tình trạng tắc nghẽn."*
> 
>