Optimize 5: Tối ưu Connection Pool & Xóa bỏ Nghẽn mạng bằng UNIX Domain Socket
---

### 1. Context & Bối cảnh hệ thống (Background)

* **Hệ thống liên quan:** Phân hệ **WES Core** và cơ sở dữ liệu **PostgreSQL** chạy trên cùng một máy chủ bare-metal chuyên dụng cấu hình cao (hoặc trong cùng một Pod/Node Kubernetes thông qua volume mount chung).
* **Mã API & Batch cốt lõi:**
* Toàn bộ hệ thống API tần suất cao (High-Frequency Trading in Warehouse): `SP_AP_0012_02_Issue Slip By HT`, `RC_AP_0004_01_DC Register Receiving Inspection Completion`, và các batch cập nhật trạng thái liên tục.


* **Quy trình nghiệp vụ thực tế (Business Flow):**
1. Kho vận hành với hơn 200 thiết bị cầm tay (Handy Terminals), cổng quét RFID tự động và hàng chục trạm máy tính liên tục bắn request.
2. Số lượng giao dịch vi mô (Micro-transactions) diễn ra dồn dập: Mỗi thao tác quét mã vạch chỉ thực hiện một câu `SELECT` hoặc `UPDATE` diễn ra trong $1\text{ms} - 2\text{ms}$.
3. Tổng lưu lượng truy vấn cơ sở dữ liệu đạt đỉnh từ **$15.000$ đến $25.000\text{ queries/second (QPS)}$**.



---

### 2. Triệu chứng & Các phát hiện qua Datadog (Detection & Investigation)

#### Triệu chứng vận hành & Hệ thống (System Symptoms)

* Vào các giờ cao điểm, ứng dụng xuất hiện hiện tượng trễ chập chờn ngẫu nhiên: Các câu query cực kỳ đơn giản (như `SELECT 1` hoặc tra cứu theo Primary Key) bình thường chỉ tốn $0.5\text{ms}$ bỗng nhiên thỉnh thoảng bị vọt lên **$30\text{ms} - 50\text{ms}$**.
* Xuất hiện rải rác cảnh báo kết nối từ HikariCP: `Connection reset` hoặc `Cannot assign requested address`.

#### Điều tra tầng sâu trên Datadog & OS Metrics (Technical Investigation)

1. **Soi Datadog Network & Host Metrics:**
* Metric `system.net.tcp.in_errs` và `system.net.tcp.retrans_segs` (tỷ lệ truyền lại gói tin TCP) tăng cao bất thường trên loopback interface `127.0.0.1`.
* Kiểm tra trạng thái socket trên OS: Số lượng socket rơi vào trạng thái **`TIME_WAIT` vọt lên hơn 30.000**.
* **Bản chất kỹ thuật (TCP Overhead & Ephemeral Port Exhaustion):**
* Dù ứng dụng và PostgreSQL nằm chung một máy chủ vật lý, Spring Boot vẫn kết nối qua TCP/IP loopback `localhost:5432`.
* Mọi gói tin dữ liệu đều phải đi qua trọn vẹn **Network Stack của Linux Kernel**: Đóng gói TCP header, tính toán checksum, định tuyến qua loopback virtual adapter, chuyển ngữ cảnh (Context switches giữa User space và Kernel space), rồi giải mã gói tin ở phía PostgreSQL.
* Chi phí bắt tay 3 bước (3-way handshake) và giải phóng kết nối tạo ra tải CPU vô ích (Kernel CPU overhead).




2. **Soi HikariCP Pool Sizing qua Datadog APM:**
* Dev trước đó cấu hình HikariCP theo quán tính: `maximumPoolSize = 100`, `minimumIdle = 10`.
* **Sai lầm về Dynamic Sizing:** Khi tải tăng đột ngột, HikariCP phải liên tục tạo mới kết nối (Spike Connection Creation). PostgreSQL bên dưới là mô hình **Process-based Architecture** (mỗi kết nối là một tiến trình `postgres` riêng biệt tốn ~10MB RAM và chi phí fork process). Việc liên tục co giãn connection pool gây giật lag toàn bộ hệ điều hành.



---

### 3. Phân tích & Lựa chọn giải pháp kỹ thuật (Engineering Trade-offs)

Làm sao để truyền dữ liệu giữa Spring Boot và PostgreSQL với **độ trễ gần bằng 0 mà không cần đi qua Network Stack**?

* **Phương án TCP Loopback (`127.0.0.1:5432`):** Phải đi qua toàn bộ network stack, đóng/mở packet, tiêu tốn CPU kernel và giới hạn bởi ephemeral port.
* **Phương án UNIX Domain Socket (UDS):**
* UDS là cơ chế giao tiếp liên tiến trình (IPC - Inter-Process Communication) tiêu chuẩn của hệ điều hành Linux/Unix.
* Dữ liệu được truyền trực tiếp **từ bộ nhớ của Process A sang bộ nhớ của Process B thông qua Kernel Buffer**, hoàn toàn **bỏ qua giao thức TCP/IP** (Zero Network Hop, không đóng gói header, không checksum, không tốn cổng port).
* Thông lượng (Throughput) của UDS cao hơn TCP loopback từ **$20\% - 30\%$**, độ trễ (Latency) thấp hơn $50\%$.



---

### 4. Chi tiết triển khai giải pháp (Action Plan)

#### Bước 1: Kích hoạt UNIX Domain Socket trên PostgreSQL

Đảm bảo PostgreSQL mở socket file cục bộ trong file cấu hình `postgresql.conf`:

```ini
# Lắng nghe trên thư mục socket mặc định của Linux
unix_socket_directories = '/var/run/postgresql'
unix_socket_permissions = 0777

```

#### Bước 2: Tích hợp Thư viện JNI UNIX Socket vào Spring Boot

Vì máy ảo Java (JVM) truyền thống kết nối qua TCP Socket, cần bổ sung thư viện native socket **junixsocket** vào `pom.xml`:

```xml
<dependency>
    <groupId>com.kohlschutter.junixsocket</groupId>
    <artifactId>junixsocket-core</artifactId>
    <version>2.6.2</version>
</dependency>

```

Cấu hình JDBC URL chuyển từ giao thức TCP sang UNIX Domain Socket trong `application.yml`:

```yaml
spring:
  datasource:
    # Không dùng localhost:5432, chuyển sang socketFactory trỏ vào file .s.PGSQL.5432
    url: jdbc:postgresql://localhost/warehouse_db?socketFactory=org.newsclub.net.unix.AFUNIXSocketFactory$FactoryArg&socketFactoryArg=/var/run/postgresql/.s.PGSQL.5432
    driver-class-name: org.postgresql.Driver

```

#### Bước 3: Tinh chỉnh Cấu hình HikariCP sang "Fixed Pool Sizing"

Loại bỏ hoàn toàn chi phí co giãn kết nối runtime và thiết lập các ngưỡng bảo vệ chuẩn xác:

```yaml
    hikari:
      # Áp dụng công thức vàng: connections = ((core_count * 2) + effective_spindle_count)
      # Với server 16 cores NVMe SSD: Pool size cố định = 32
      maximum-pool-size: 32
      minimum-idle: 32 # Đặt bằng max-pool-size để cố định pool, không co giãn!
      idle-timeout: 0  # Không bao giờ đóng kết nối rảnh
      max-lifetime: 1800000 # 30 phút tự refresh 1 lần để tránh stale state
      connection-timeout: 3000 # Chờ tối đa 3s, nếu quá 3s phải ném lỗi ngay
      leak-detection-threshold: 5000 # Quá 5s chưa trả connection -> Datadog hú còi ngay!

```

---

### 5. Kết quả định lượng (Output & Results)

* **Thông lượng Database (Throughput):**
* Khả năng xử lý truy vấn tối đa của cụm máy chủ tăng từ **$18.000\text{ QPS}$ lên hơn $23.500\text{ QPS}$** (tăng trưởng **$30\%$** thông lượng trên cùng một cấu hình phần cứng).


* **Độ trễ Round-trip JDBC (Latency):**
* P99 Latency của các câu lệnh đọc/ghi micro-transaction giảm từ **$2.4\text{ms}$ xuống còn $0.8\text{ms}$** (nhanh hơn gấp 3 lần).


* **Tối ưu hóa tài nguyên Host:**
* Trạng thái `TIME_WAIT` socket trên Linux giảm hoàn toàn về **`0`**.
* Tải CPU của máy chủ ứng dụng giảm **$12\%$** nhờ loại bỏ chi phí đóng gói TCP stack và context switching của nhân Linux.


* **Độ ổn định của HikariCP:**
* Nhờ cố định kích thước pool (`minimumIdle = maximumPoolSize = 32`), hiện tượng giật lag do co giãn kết nối biến mất hoàn toàn. Cảnh báo rò rỉ kết nối được kiểm soát chặt chẽ ở ngưỡng $5.000\text{ms}$.



---

### 6. Kịch bản trả lời phỏng vấn đầy đủ (Interview Script)

> **Người phỏng vấn hỏi:** *"Em hãy chia sẻ một bài toán tối ưu hóa hạ tầng/kết nối tầng sâu (Infrastructure / Connection Pool Tuning) giữa Spring Boot và Database mà em từng thực hiện để chịu tải cực lớn?"*

**Bạn trả lời theo khung STAR 4 bước chuẩn mực:**

#### 1. Situation (Bối cảnh nghiệp vụ)

> *"Dạ có, trong hệ thống kho vận WES của tụi em, có hàng trăm thiết bị quét cầm tay, cổng RFID và trạm robot liên tục gửi micro-transaction về server. Lưu lượng giao dịch đạt đỉnh hơn 18.000 truy vấn mỗi giây (QPS).
> Về mặt hạ tầng, ứng dụng Spring Boot Core và cơ sở dữ liệu PostgreSQL được đặt chung trên cùng một máy chủ bare-metal chuyên dụng cấu hình cao để tối ưu tốc độ."*

#### 2. Task & Root Cause (Phát hiện qua Datadog & Bản chất kỹ thuật)

> *"Vấn đề phát sinh là vào các khung giờ cao điểm, thỉnh thoảng các câu query đơn giản bị khựng bất thường mất tới 30-50ms, và hệ thống cảnh báo cạn kiệt port mạng.
> Em đã mở **Datadog Network & Host Monitoring** để phân tích và phát hiện 2 nguyên nhân cốt lõi:
> * *Thứ nhất là **TCP Loopback Overhead**: Dù chạy chung máy chủ, ứng dụng vẫn kết nối qua `localhost:5432`. Mọi câu query đều phải đi qua toàn bộ network stack của nhân Linux (đóng gói TCP, tính checksum, context switch giữa user và kernel space). Hệ thống ghi nhận hơn 30.000 socket rơi vào trạng thái `TIME_WAIT`, gây tiêu tốn CPU và nghẽn tạm thời.*
> * *Thứ hai là **Cấu hình HikariCP sai cách**: Pool size bị cấu hình co giãn (`min-idle = 10, max-pool = 100`). Khi tải ập đến đột ngột, việc PostgreSQL phải liên tục fork process mới để tạo connection làm giật lag cả hệ điều hành."*
> 
> 

#### 3. Action (Giải pháp kỹ thuật đã triển khai)

> *"Em đã trực tiếp tối ưu lại tầng kết nối này bằng 2 giải pháp kỹ thuật sâu:
> * *Thứ nhất, em chuyển đổi hoàn toàn phương thức kết nối JDBC từ TCP sang **UNIX Domain Socket (UDS)** bằng thư viện `junixsocket`. Thay vì kết nối qua mạng, ứng dụng kết nối trực tiếp qua file socket IPC trong kernel `/var/run/postgresql/.s.PGSQL.5432`. Dữ liệu được truyền thẳng giữa các vùng nhớ của tiến trình trong nhân Linux, loại bỏ 100% chi phí network stack và xóa sổ hoàn toàn trạng thái `TIME_WAIT`.*
> * *Thứ hai, em tinh chỉnh lại **HikariCP theo mô hình Fixed Pool Sizing**: Đặt `minimum-idle` bằng đúng `maximum-pool-size` là 32 (theo công thức chuẩn số core CPU và ổ cứng NVMe). Đồng thời bật cờ `leak-detection-threshold = 5000ms` để Datadog cảnh báo ngay nếu có giao dịch nào giữ kết nối quá 5 giây.*
> * *Em đẩy các metric connection pool từ HikariCP trực tiếp lên Datadog Dashboard để theo dõi thời gian mượn kết nối."*
> 
> 

#### 4. Result (Kết quả đạt được)

> *"Kết quả đo lường thực tế sau khi deploy:
> * *Thông lượng xử lý truy vấn của hệ thống tăng thêm **$30\%$**, từ $18.000$ lên hơn **$23.500\text{ QPS}$** mà không cần nâng cấp phần cứng.*
> * *Độ trễ round-trip JDBC giảm từ **$2.4\text{ms}$ xuống dưới $0.8\text{ms}$**, CPU máy chủ giảm tải $12\%$ nhờ giải phóng gánh nặng xử lý mạng.*
> * *Hệ thống vận hành cực kỳ ổn định, triệt tiêu hoàn toàn tình trạng trễ cục bộ và lỗi nghẽn connection pool trong các đợt cao điểm."*
> 
>