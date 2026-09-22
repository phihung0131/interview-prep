Optimize 4: Tối ưu Thông lượng Giao tiếp Thiết bị bằng Parallel Asynchronous Non-blocking
---

### 1. Context & Bối cảnh hệ thống (Background)

* **Hệ thống liên quan:** Phân hệ **WES (Warehouse Execution System)** giao tiếp với các thiết bị phần cứng thông minh tại sàn kho.
* **Mã API & Module cốt lõi:**
* `SP_AP_0010_13_Send Picking Instruction to Picking Cart(PUT)`: Gửi dữ liệu lượt nhặt hàng loạt xuống đội xe nhặt hàng thông minh (Smart Picking Carts).
* `SP_BT_0001_Picking Instruction to Picking Cart IF Export`: Chuẩn bị payload và đồng bộ dữ liệu với gateway điều khiển xe đẩy.
* `SP_AP_0010_01_Retrieve Picking Instruction(POST)`: Tra cứu và gom nhóm các lượt nhặt hàng theo đợt sóng (Wave).


* **Quy trình nghiệp vụ thực tế (Business Flow):**
1. Trong kho thời trang B2B/B2C diện tích hàng chục nghìn mét vuông, công nhân không cầm giấy đi nhặt thủ công mà sử dụng **Xe nhặt hàng thông minh (Smart Picking Cart)**. Mỗi xe trang bị màn hình cảm ứng, cân điện tử và dải đèn LED chỉ thị (Pick-to-Light).
2. Mỗi đợt sóng nhặt hàng (Wave) gồm hàng trăm đơn, người điều phối kho (Supervisor) bấm nút trên Web UI để phân bổ việc cho **một tổ đội gồm 15 đến 25 xe nhặt hàng** hoạt động đồng thời trong cùng một phân khu.
3. Hệ thống WES phải đẩy toàn bộ thông tin lượt nhặt (Mã sản phẩm, vị trí kệ cần đến, số lượng cần nhặt, ngăn chứa trên xe) xuống màn hình tablet của từng chiếc xe qua giao thức HTTP REST/IoT Gateway nội bộ.



---

### 2. Triệu chứng & Các phát hiện qua Datadog (Detection & Investigation)

#### Triệu chứng vận hành dưới kho (Business Symptom)

* Người điều phối kho phàn nàn: Mỗi lần bấm nút *"Phát lệnh cho đội xe nhặt hàng"* trên Web UI, màn hình bị treo xoay tròn mất **từ 3 đến 5 giây**.
* Có những đợt mạng WiFi kho chập chờn, chỉ cần 1 chiếc xe ở góc khuất sóng bị mất kết nối, toàn bộ thao tác phát lệnh cho cả 20 xe còn lại bị **đơ theo hoặc báo lỗi thất bại toàn phần (Fail-All)**, buộc người điều phối phải bấm lại từ đầu.

#### Điều tra tầng sâu trên Datadog (Technical Investigation)

1. **Soi Datadog APM Flame Graph:**
* Tìm trace của API `PUT /api/wes/picking/send-to-cart`.
* **Bức tranh thực thi tuần tự (Sequential Blocking Anti-Pattern):**
Flame Graph kéo dài thành một chuỗi bậc thang tuyến tính:
```text
[Endpoint: sendPickingInstructionToCarts] (Total Duration: 3.420ms)
   ├── [HTTP POST cartClient.send (Cart #01)] -> 120ms
   ├── [HTTP POST cartClient.send (Cart #02)] -> 145ms
   ├── [HTTP POST cartClient.send (Cart #03)] -> 110ms
   ... (Lặp tuần tự qua 25 xe!)
   └── [HTTP POST cartClient.send (Cart #25)] -> 180ms

```


* **Công thức trễ tích lũy:** Nếu một lệnh gọi xe mất trung bình $\sim 130\text{ms}$, thì 25 chiếc xe sẽ làm tiêu tốn:
$$T_{\text{total}} = \sum_{i=1}^{25} T_i \approx 25 \times 130\text{ms} \approx 3.250\text{ms}$$




2. **Soi Datadog Thread & JVM Metrics:**
* Các HTTP request này chạy trực tiếp trên **Tomcat Worker Thread** (`http-nio-8080-exec-*`).
* Trong suốt hơn 3 giây đó, Tomcat thread bị chặn đứng hoàn toàn (Blocked/Waiting on Socket Read I/O), không làm được việc gì khác.
* Khi nhiều supervisor ở các khu vực cùng bấm nút đồng thời, số lượng Tomcat worker thread bị cạn kiệt, kéo theo các API phục vụ quét mã vạch khác trong kho bị nghẽn dây chuyền.



---

### 3. Phân tích & Lựa chọn giải pháp kỹ thuật (Engineering Trade-offs)

Tại sao không dùng `@Async` mặc định của Spring hay `parallelStream()`?

* **Rủi ro của `@Async` mặc định:** Nếu không cấu hình thread pool rõ ràng, Spring dùng `SimpleAsyncTaskExecutor` (tạo thread mới liên tục $\rightarrow$ nguy cơ OOM) hoặc dùng chung thread pool với các tác vụ khác.
* **Tử huyệt của `parallelStream()`:** `parallelStream` dùng chung `ForkJoinPool.commonPool()` của toàn bộ JVM. Nếu đem các tác vụ gọi mạng (Blocking I/O) nhét vào common pool, toàn bộ CPU cores của JVM sẽ bị chiếm dụng bởi các thread đang ngủ chờ mạng, làm tê liệt các tác vụ tính toán in-memory khác của hệ thống.
* **Giải pháp chuẩn Enterprise:**
1. Tách riêng một **Custom Thread Pool chuyên dụng cho I/O (Dedicated I/O Thread Pool)** với kích thước và hàng đợi được kiểm soát chặt chẽ.
2. Sử dụng **`CompletableFuture` để kích hoạt gọi song song không chặn (Parallel Non-blocking)**.
3. Áp dụng cơ chế **Fail-Safe / Partial Success Isolation**: Xe nào lỗi mạng thì đánh dấu lỗi riêng chiếc đó, không được phép làm gián đoạn các xe đã nhận lệnh thành công.



---

### 4. Chi tiết triển khai giải pháp (Action Plan)

#### Bước 1: Cấu hình Thread Pool chuyên dụng cho I/O Thiết bị

Tạo ThreadPoolExecutor riêng biệt, đặt tên thread rõ ràng để dễ trace trên Datadog:

```java
@Configuration
public class AsyncConfig {

    @Bean(name = "pickingCartExecutor")
    public Executor pickingCartExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(16);
        executor.setMaxPoolSize(32);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("cart-io-");
        // Khi hàng đợi đầy, thread gọi (Tomcat thread) sẽ tự chạy để tạo backpressure tự nhiên
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}

```

#### Bước 2: Tái cấu trúc Service sang Parallel Non-blocking với `CompletableFuture`

Bắn lệnh đồng thời cho 25 xe trong tích tắc, gom kết quả bằng `CompletableFuture.allOf()` kèm timeout bảo vệ:

```java
@Service
@Slf4j
public class PickingCartDispatchService {

    @Autowired
    private PickingCartClient cartClient;
    
    @Autowired
    @Qualifier("pickingCartExecutor")
    private Executor pickingCartExecutor;

    public CartBatchDispatchResult dispatchInstructionsToCarts(List<CartInstructionDto> instructions) {
        long startTime = System.currentTimeMillis();

        // 1. Khởi tạo danh sách tác vụ song song cho từng xe
        List<CompletableFuture<CartDispatchStatus>> futures = instructions.stream()
                .map(inst -> CompletableFuture.supplyAsync(() -> {
                    try {
                        // Gọi REST API xuống từng xe (mỗi xe chạy trên 1 thread riêng biệt)
                        cartClient.sendInstruction(inst.getCartId(), inst);
                        return CartDispatchStatus.success(inst.getCartId());
                    } catch (Exception e) {
                        log.error("Gửi lệnh thất bại cho xe: {}, Lỗi: {}", inst.getCartId(), e.getMessage());
                        // Bắt lỗi cục bộ để không làm đứt chuỗi của các xe khác (Fault Isolation)
                        return CartDispatchStatus.failed(inst.getCartId(), e.getMessage());
                    }
                }, pickingCartExecutor))
                .collect(Collectors.toList());

        // 2. Gom tất cả các Future lại và đợi hoàn thành song song với Timeout tối đa 800ms
        CompletableFuture<Void> allFutures = CompletableFuture.allOf(
                futures.toArray(new CompletableFuture[0])
        );

        try {
            // Chờ tất cả hoàn thành trong tối đa 800ms
            allFutures.get(800, TimeUnit.MILLISECONDS);
        } catch (TimeoutException e) {
            log.warn("Một số xe phản hồi quá thời gian cho phép (800ms)!");
        } catch (Exception e) {
            log.error("Lỗi gián đoạn khi điều phối xe nhặt hàng", e);
        }

        // 3. Bóc tách kết quả của từng xe để báo cáo lên UI
        List<CartDispatchStatus> results = futures.stream()
                .map(f -> f.isDone() && !f.isCompletedExceptionally() ? f.join() : CartDispatchStatus.timeout())
                .collect(Collectors.toList());

        long duration = System.currentTimeMillis() - startTime;
        log.info("Đã phát lệnh cho {} xe trong {}ms", instructions.size(), duration);

        return new CartBatchDispatchResult(results, duration);
    }
}

```

#### Bước 3: Cơ chế Báo cáo Kết quả Một phần (Partial Success Handling)

Tại Web UI và DB:

* Các xe thành công $\rightarrow$ Lệnh nhặt chuyển sang trạng thái `SENT_TO_CART`.
* Xe nào bị rớt mạng/timeout $\rightarrow$ Lệnh chuyển sang `DISPATCH_FAILED` kèm lý do rõ ràng trên màn hình để supervisor biết chính xác chỉ cần bấm gửi lại riêng cho chiếc xe đó hoặc đổi xe khác, không phải gửi lại cho cả đội.

---

### 5. Kết quả định lượng (Output & Results)

* **Thời gian đáp ứng của API (`SP_AP_0010_13`):**
* Thời gian phát lệnh cho cả tổ đội 25 xe giảm thẳng đứng từ **$3.420\text{ms}$ xuống còn đúng $135\text{ms}$** (nhanh hơn gấp **$25$ lần**).
* Thời gian tổng thể lúc này chỉ phụ thuộc vào **chiếc xe phản hồi chậm nhất**, thay vì bị cộng dồn lũy kế thời gian của tất cả các xe:
$$T_{\text{optimized}} = \max(T_1, T_2, \dots, T_{25}) \approx 135\text{ms}$$




* **Bảo vệ Tomcat Worker Threads:**
* Giải phóng hoàn toàn các thread HTTP của Tomcat khỏi tác vụ chờ socket mạng. Metric `jvm.threads.busy` của máy chủ ứng dụng ổn định dưới $15\%$.


* **Độ bền vững vận hành (System Resilience):**
* Triệt tiêu hoàn toàn lỗi "một con sâu làm rầu nồi canh". Một chiếc xe mất sóng ở góc kho không còn khả năng làm treo thao tác phát lệnh của 24 xe còn lại.



---

### 6. Kịch bản trả lời phỏng vấn đầy đủ (Interview Script)

> **Người phỏng vấn hỏi:** *"Em hãy chia sẻ một bài toán tối ưu hóa thông lượng (Throughput) hoặc xử lý bất đồng bộ đa luồng (Multithreading/Concurrency) ở tầng Java Application mà em từng trực tiếp triển khai?"*

**Bạn trả lời theo khung STAR 4 bước chuẩn mực:**

#### 1. Situation (Bối cảnh nghiệp vụ)

> *"Dạ có, trong phân hệ WES của tụi em có API `SP_AP_0010_13` dùng để **phát lệnh nhặt hàng loạt cho đội xe nhặt hàng thông minh (Smart Picking Carts)**.
> Mỗi xe nhặt hàng đều trang bị máy tính bảng và dải đèn LED Pick-to-Light kết nối mạng nội bộ. Khi bắt đầu một đợt nhặt hàng (Wave), người điều phối kho sẽ bấm nút trên Web UI để gửi dữ liệu hàng loạt xuống cho một tổ đội gồm 20 đến 25 xe nhặt hàng cùng lúc."*

#### 2. Task & Root Cause (Phát hiện qua Datadog & Bản chất kỹ thuật)

> *"Vấn đề là mỗi lần bấm nút, màn hình của người điều phối bị đơ xoay tròn mất từ 3 đến 5 giây. Tệ hơn nữa, nếu có 1 chiếc xe bị yếu sóng WiFi ở góc kho, toàn bộ lệnh phát cho cả 25 xe đều bị treo cứng và báo lỗi thất bại.
> Em vào **Datadog APM Flame Graph** để phân tích thì phát hiện ra mô hình **Sequential Blocking I/O Anti-Pattern**:
> * Mã nguồn cũ dùng vòng lặp `for` tuần tự: gọi xe 1 mất 130ms, chờ xong mới gọi xe 2, xe 3... 25 chiếc xe cộng dồn lại làm request kéo dài hơn 3.4 giây.
> * Các lời gọi mạng này chạy trực tiếp trên Tomcat Worker Thread, giam giữ thread chờ socket mạng và gây nghẽn pool xử lý HTTP của server."*
> 
> 

#### 3. Action (Giải pháp kỹ thuật đã triển khai)

> *"Em đã tái cấu trúc lại toàn bộ luồng giao tiếp này sang mô hình **Parallel Asynchronous Non-blocking** theo 3 bước:
> * *Thứ nhất, em không dùng pool mặc định mà tách riêng một **Dedicated Thread Pool (`ThreadPoolTaskExecutor`) chuyên trách cho I/O thiết bị**, với core pool size = 16 và max = 32, kèm CallerRunsPolicy để kiểm soát tải.*
> * *Thứ hai, em dùng **`CompletableFuture.supplyAsync()`** để bắn 25 request đồng thời xuống 25 xe song song. Em gom các future lại bằng `CompletableFuture.allOf()` kèm cơ chế Timeout bảo vệ ở mức 800ms để không bao giờ để request bị treo vô hạn.*
> * *Thứ ba, em áp dụng cơ chế **Fault Isolation (Cô lập lỗi)**: Mỗi future được bọc try-catch cục bộ để nếu 1 xe bị rớt mạng thì chỉ ghi nhận lỗi riêng xe đó, không làm đứt chuỗi của các xe còn lại. Kết quả trả về cho Web UI là danh sách chi tiết xe nào nhận thành công, xe nào thất bại để supervisor chủ động xử lý."*
> 
> 

#### 4. Result (Kết quả đạt được)

> *"Nhờ chuyển sang xử lý song song, kết quả đo lường trên Datadog cực kỳ ấn tượng:
> * *Thời gian phát lệnh cho toàn bộ 25 xe giảm ngoạn mục từ **$3.420\text{ms}$ xuống chỉ còn đúng $135\text{ms}$** (nhanh hơn gấp 25 lần), thời gian chạy giờ đây chỉ bằng thời gian của một chiếc xe duy nhất.*
> * *Giải phóng hoàn toàn Tomcat threads, server vận hành nhẹ nhàng và ổn định.*
> * *Loại bỏ hoàn toàn hiện tượng lỗi dây chuyền do thiết bị ngoại vi, trải nghiệm của người điều phối kho trở nên tức thì và mượt mà."*
> 
>