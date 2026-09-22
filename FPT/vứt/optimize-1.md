Optimize 1: Tối ưu bộ nhớ đệm Java (Caffeine Local Cache) cho Master Data tĩnh
---

### 1. Context & Bối cảnh hệ thống (Background)

* **Hệ thống liên quan:** Phân hệ **WES (Warehouse Execution System)** phục vụ các trạm đóng gói thương mại điện tử (EC Packing Stations).
* **Mã API & Batch cốt lõi:**
* `SP_AP_0020_02_EC Register Customer Packing Result(PUT)`: Ghi nhận kết quả đóng gói hộp carton cho khách mua online.
* `MS_AP_0010_02_EC Register Piece M3(PUT)` & `MS_BT_0011_02_EC Import Piece M3 Master IF`: Dữ liệu kích thước 3 chiều (Dài $\times$ Rộng $\times$ Cao) và thể tích khối ($M^3$) của từng sản phẩm.
* `MS_AP_0009_01_Retrieve Combined Packing Group(POST)`: Bảng quy tắc đóng gói kết hợp (sản phẩm nào được phép đóng chung hộp carton).
* `MS_BT_0010_02_Import Carton M3 Master IF`: Bảng quy chuẩn kích thước các loại thùng carton (`Box S`, `Box M`, `Box L`).


* **Quy trình nghiệp vụ thực tế (Business Flow):**
1. Trong kho có **40 trạm đóng gói (Packing Stations)** hoạt động liên tục song song trong các đợt cao điểm bán hàng (Flash Sale / Mega Campaign).
2. Mỗi khi công nhân quét mã các sản phẩm bỏ vào hộp carton, hệ thống WES phải thực thi thuật toán đóng gói để tính toán:
* Tổng thể tích và tải trọng của các món đồ dựa trên **`Piece M3`**.
* Kiểm tra xem các món có vi phạm quy tắc đóng gói kết hợp (**`Combined Packing Group`**) hay không (ví dụ: không đóng chung áo lụa mỏng với giày dép nặng).
* Đề xuất loại thùng carton tối ưu nhất (**`Carton M3`**) để in tem cước phí chính xác.


3. Để phục vụ việc tính toán này, hệ thống liên tục truy vấn vào các bảng Master Data: `item_piece_m3`, `carton_m3`, và `packing_group_rule`.



---

### 2. Triệu chứng & Các phát hiện qua Datadog (Detection & Investigation)

#### Triệu chứng vận hành dưới kho (Business Symptom)

* Vào các khung giờ cao điểm (10h-12h trưa hoặc 20h-23h tối), màn hình máy tính tại các trạm đóng gói bị khựng (lag). Công nhân quét mã thùng carton phải chờ **1 đến 2 giây** máy in mới nhả tem bưu cục.
* Dây chuyền băng chuyền đóng gói phía sau bị dồn ứ cục bộ, công nhân phải dừng tay chờ hệ thống phản hồi.

#### Điều tra tầng sâu trên Datadog (Technical Investigation)

1. **Quan sát Datadog APM Dashboard:**
* Endpoint `SP_AP_0020_02` có lưu lượng throughput rất cao: Đạt đỉnh khoảng **$1.200\text{ req/min}$**.
* P99 Latency của API này tăng vọt từ mức bình thường $45\text{ms}$ lên tới **$850\text{ms} - 1.2\text{s}$**.
* Nhìn vào **Flame Graph** của trace chậm: Không có câu query SQL nào bị coi là "Slow Query" cá biệt. Mỗi câu query tra cứu `Piece M3` chỉ tốn khoảng **$1.2\text{ms} - 2.5\text{ms}$**.
* Tuy nhiên, một đơn hàng có 4 món đồ thì hàm đóng gói lại bắn ra **12 đến 15 câu query nhỏ lẻ** xuống Database để tra cứu kích thước từng món, quy tắc nhóm hàng và quy cách thùng carton.


2. **Soi Datadog Database Monitoring (DBM) & HikariCP Metrics:**
* Metric `hikari.pool.active_connections` luôn dao động ở mức kịch trần: **$28/30$ connections**.
* Metric `hikari.pool.wait_time_ms` (thời gian thread phải đứng xếp hàng chờ lấy connection) tăng vọt từ $0.5\text{ms}$ lên tới **$450\text{ms}$**!
* CPU của PostgreSQL database node chạm mốc **$78\% - 85\%$**.
* Bảng thống kê `pg_stat_statements` chỉ ra rằng: Các câu lệnh `SELECT ... FROM item_piece_m3 WHERE sku_id = ?` chiếm tới **$42\%$ tổng số lượng truy vấn** của toàn bộ database, với tần suất hàng chục triệu lượt gọi mỗi ngày.


3. **Phát hiện nghịch lý nghiệp vụ (Business Reality):**
* Danh mục kích thước sản phẩm (`Piece M3`) và thùng carton (`Carton M3`) là **Master Data tĩnh**.
* Chúng được nạp từ trụ sở chính (HQ) qua batch ban đêm (`MS_BT_0010`, `MS_BT_0011`) và gần như **không hề thay đổi trong suốt cả ngày làm việc**!
* Việc hàng triệu request trong ngày liên tục rút Connection từ pool, mở socket TCP, parse SQL và giải mã dữ liệu chỉ để đọc đi đọc lại những con số kích thước bất biến là một sự lãng phí tài nguyên cực kỳ nghiêm trọng.



---

### 3. Phân tích & Lựa chọn giải pháp kỹ thuật (Engineering Trade-offs)

Tại sao chọn **Caffeine Local Cache** thay vì **Redis Remote Cache**?

* **Phương án Redis Cache:** Vẫn phải tốn chi phí mạng qua network (Network I/O hop), chi phí serialize/deserialize JSON/Binary, latency vẫn mất khoảng $1 - 3\text{ms}$ cho mỗi món đồ.
* **Phương án Caffeine (In-Memory Local Cache):** Dữ liệu nằm ngay trên **JVM Heap RAM**. Tốc độ truy xuất là tốc độ đọc bộ nhớ CPU, chỉ tính bằng **nano-giây ($\text{ns}$)**, loại bỏ $100\%$ network latency và zero Database Connection.
* **Thách thức lớn nhất của Local Cache:** **Tính nhất quán dữ liệu (Cache Invalidation)** khi ứng dụng chạy trên nhiều Pod Kubernetes (Multi-instance). Nếu batch HQ cập nhật kích thước mới của một chiếc áo, làm sao để tất cả các Pod Spring Boot cùng xóa cache cũ ngay lập tức?
$\implies$ **Giải pháp kết hợp:** Dùng **Caffeine làm Local Cache** lưu trữ dữ liệu, kết hợp với **Redis Pub/Sub làm kênh truyền tín hiệu xóa cache tức thì**.

---

### 4. Chi tiết triển khai giải pháp (Action Plan)

#### Bước 1: Cấu hình Caffeine Cache Manager tối ưu bộ nhớ

Sử dụng thuật toán loại trừ thông minh **W-TinyLFU (Window TinyLFU)** mặc định của Caffeine để giữ lại các SKU hot nhất trong RAM:

```java
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public Cache<String, PieceM3Dto> pieceM3Cache() {
        return Caffeine.newBuilder()
                .maximumSize(50_000) // Lưu tối đa 50.000 SKU phổ biến (chỉ tốn khoảng ~20-30MB Heap RAM)
                .expireAfterWrite(4, TimeUnit.HOURS) // Tự động làm mới sau 4 tiếng đề phòng sót event
                .recordStats() // Bật metric để đẩy sang Datadog
                .build();
    }

    @Bean
    public Cache<String, CartonM3Dto> cartonM3Cache() {
        return Caffeine.newBuilder()
                .maximumSize(500)
                .expireAfterWrite(12, TimeUnit.HOURS)
                .build();
    }
}

```

#### Bước 2: Tích hợp Cache vào Tầng Service tra cứu

Thay vì chọc thẳng xuống MyBatis Mapper, luồng xử lý đi qua Caffeine Cache:

```java
@Service
@Slf4j
public class MasterDataCacheService {

    @Autowired
    private Cache<String, PieceM3Dto> pieceM3Cache;
    @Autowired
    private ItemPieceM3Mapper pieceM3Mapper;

    public PieceM3Dto getPieceM3(String skuId) {
        // Tra cứu trong RAM trước, nếu miss mới gọi MyBatis xuống DB
        return pieceM3Cache.get(skuId, key -> {
            log.debug("Cache miss cho SKU: {}, query DB...", key);
            return pieceM3Mapper.selectBySkuId(key);
        });
    }

    public void evictPieceM3Cache() {
        pieceM3Cache.invalidateAll();
        log.info("Đã xóa sạch toàn bộ local cache Piece M3.");
    }
}

```

#### Bước 3: Đồng bộ Xóa Cache phân tán qua Redis Pub/Sub

Khi có sự kiện cập nhật danh mục từ Batch hoặc Admin gọi API `MS_AP_0010_02_Register Piece M3(PUT)`:

1. **Bên phát tín hiệu (Publisher):** Bắn một message gọn nhẹ lên Redis Channel:
```java
@Service
public class MasterDataSyncService {
    @Autowired
    private StringRedisTemplate redisTemplate;

    public void notifyMasterDataChanged(String masterType) {
        // Bắn thông điệp: "PIECE_M3_UPDATED"
        redisTemplate.convertAndSend("cache:invalidation:channel", masterType);
    }
}

```


2. **Bên nhận tín hiệu (Subscriber - Chạy trên TẤT CẢ các Pod Spring Boot):**
```java
@Component
@Slf4j
public class CacheInvalidationSubscriber implements MessageListener {

    @Autowired
    private MasterDataCacheService cacheService;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String messageBody = new String(message.getBody());
        if ("PIECE_M3_UPDATED".equals(messageBody)) {
            // Từng Pod tự dọn dẹp bộ nhớ RAM của chính mình
            cacheService.evictPieceM3Cache();
            log.info("Nhận được tín hiệu từ Redis, đã invalidate Local Cache.");
        }
    }
}

```



#### Bước 4: Tích hợp Metric Caffeine vào Datadog

Tận dụng tính năng Micrometer của Spring Boot Actuator để đẩy metric của Caffeine trực tiếp lên Datadog Dashboard:

* `cache.gets{cache="pieceM3Cache", result="hit"}`
* `cache.gets{cache="pieceM3Cache", result="miss"}`
* `cache.size{cache="pieceM3Cache"}`

---

### 5. Kết quả định lượng (Output & Results)

* **Tỷ lệ Cache Hit:** Đạt mức ấn tượng **$99.2\%$** sau 15 phút vận hành đầu ca làm việc.
* **Thời gian đáp ứng của API đóng gói (`SP_AP_0020`):**
* P99 Latency giảm thẳng đứng từ **$850\text{ms}$ xuống còn $12\text{ms}$** (nhanh hơn gấp 70 lần).
* Công nhân quét mã thùng carton đến đâu, máy in nhả tem bưu cục ngay lập tức đến đó, giải tỏa hoàn toàn điểm nghẽn tại 40 trạm đóng gói.


* **Giải phóng tài nguyên Database & Connection Pool:**
* Số lượng kết nối sử dụng thực tế của HikariCP giảm từ mức báo động $28/30$ xuống mức an toàn lý tưởng: **$6 - 8$ active connections**.
* CPU của PostgreSQL database giảm tức thì từ **$80\%$ xuống còn $25\%$**, dư thừa năng lực xử lý cho các giao dịch quan trọng khác của kho.


* **Dung lượng bộ nhớ:** 50.000 SKU chỉ chiếm xấp xỉ **$28\text{MB}$ Heap RAM** trên mỗi Pod, hoàn toàn không gây ảnh hưởng đến bộ thu gom rác (Garbage Collector).

---

### 6. Kịch bản trả lời phỏng vấn đầy đủ (Interview Script)

> **Người phỏng vấn hỏi:** *"Em hãy chia sẻ một bài toán tối ưu hóa hiệu năng (Performance Optimization) ở tầng Application mà em tâm đắc nhất? Em đã phát hiện vấn đề qua công cụ nào và đo lường kết quả ra sao?"*

**Bạn trả lời theo khung STAR 4 bước chuẩn mực:**

#### 1. Situation (Bối cảnh nghiệp vụ)

> *"Dạ có, trong phân hệ WES của tụi em có quy trình đóng gói đơn hàng online tại 40 bàn đóng gói (`Packing Stations`) qua API `SP_AP_0020_02`.
> Mỗi khi công nhân quét mã các sản phẩm may mặc vào hộp carton, hệ thống phải chạy thuật toán kiểm tra kích thước 3 chiều (`Piece M3`), quy tắc đóng gói kết hợp (`Combined Packing Group`) và thể tích thùng (`Carton M3`) để tính toán kích thước hộp tối ưu nhất nhằm in mã vận đơn và tính cước vận chuyển chính xác."*

#### 2. Task & Root Cause (Phát hiện qua Datadog & Bản chất kỹ thuật)

> *"Vào các đợt Flash Sale tải cao, dưới kho phản ánh màn hình đóng gói bị khựng, quét mã xong phải chờ hơn 1 giây máy in mới nhả tem.
> Em đã mở **Datadog APM và Database Monitoring (DBM)** để phân tích:
> * P99 Latency của API đóng gói tăng vọt lên gần $1\text{s}$, và metric `hikari.pool.active_connections` luôn kịch trần $28/30$ kết nối, khiến các thread bị đứng chờ lấy connection mất hơn $400\text{ms}$.
> * Soi kỹ Flame Graph và `pg_stat_statements`, em thấy không có câu query nào chạy chậm cá biệt, nhưng mỗi đơn hàng lại phát sinh cả chục câu query nhỏ lặp đi lặp lại để đọc kích thước sản phẩm. Các câu query tra cứu Master Data này chiếm tới $42\%$ tổng lượng truy vấn của toàn bộ Database.
> 
> 
> Nhìn dưới góc độ nghiệp vụ, em nhận thấy đây là **Master Data tĩnh**. Kích thước chiếc áo hay thùng carton được nạp từ HQ qua batch ban đêm và hầu như bất biến trong suốt cả ngày làm việc. Việc hàng triệu request liên tục tranh giành DB connection chỉ để đọc những con số tĩnh này là nguyên nhân chính gây thắt cổ chai."*

#### 3. Action (Giải pháp kỹ thuật đã triển khai)

> *"Em đã đề xuất và trực tiếp triển khai giải pháp **Local In-Memory Cache sử dụng thư viện Caffeine kết hợp với Redis Pub/Sub**:
> * *Thứ nhất, ở tầng ứng dụng Java Spring Boot, em cấu hình **Caffeine Cache** với thuật toán W-TinyLFU, lưu tối đa 50.000 SKU hot nhất ngay trên JVM Heap RAM. Tốc độ đọc lúc này là đọc bộ nhớ CPU, chỉ mất vài nano-giây, hoàn toàn không tốn Network I/O hay DB Connection nào.*
> * *Thứ hai, để giải quyết bài toán đồng bộ dữ liệu giữa nhiều Pod Kubernetes (Multi-instance), em dùng **Redis Pub/Sub làm kênh truyền tín hiệu Invalidation**. Bất cứ khi nào có batch của HQ nạp dữ liệu Master Data mới hoặc Admin can thiệp, hệ thống sẽ publish một thông điệp nhỏ vào Redis Channel. Tất cả các Pod Spring Boot đang lắng nghe sẽ đồng loạt gọi lệnh `cache.invalidateAll()` để làm mới dữ liệu.*
> * *Thứ ba, em dùng Micrometer đẩy metric hit/miss của Caffeine lên **Datadog Dashboard** để giám sát hiệu quả."*
> 
> 

#### 4. Result (Kết quả đạt được)

> *"Kết quả đo lường thực tế trên Datadog cực kỳ ấn tượng:
> * *Tỷ lệ Cache Hit đạt **$99.2\%$**, P99 Latency của API đóng gói giảm từ **$850\text{ms}$ xuống chỉ còn $12\text{ms}$**, công nhân quét mã là máy in tem nhả ngay lập tức.*
> * *Giải phóng hoàn toàn Connection Pool của HikariCP, số kết nối hoạt động giảm về mức an toàn chỉ 6-8 connections, và CPU Database giảm tải tức thì từ **$80\%$ xuống còn $25\%$**.*
> * *Giải pháp này chứng minh việc hiểu rõ đặc tính tĩnh của dữ liệu nghiệp vụ để đưa vào Local Cache đúng chỗ mang lại hiệu quả vượt trội hơn rất nhiều so với việc cố gắng nâng cấp phần cứng Database."*
> 
>