## 1) Khái niệm & Tổng quan

### 1. Virtual thread là gì? Khác gì với **platform thread** (OS thread) về chi phí tạo/bối cảnh chuyển đổi.
**Virtual thread** là một loại thread nhẹ (lightweight thread) được JVM quản lý, ra đời từ Java 19 (JEP 425). Không ánh xạ 1:1 với OS thread, virtual thread chạy trên **carrier thread** (platform thread) và được JVM lập lịch.

**Khác biệt với platform thread**:
- **Chi phí tạo**:
    - **Virtual thread**: Rất thấp (~ vài KB cho stack), tạo hàng triệu thread dễ dàng.
    - **Platform thread**: Cao (~1-2 MB/stack), tạo số lượng lớn gây tốn tài nguyên (memory, OS handles).
- **Context switching**:
    - **Virtual thread**: Chuyển đổi trong user-space bởi JVM, chi phí thấp (chỉ lưu/restore stack nhỏ).
    - **Platform thread**: Chuyển đổi trong kernel-space bởi OS, chi phí cao hơn (phụ thuộc vào OS scheduler).
- **Quản lý**:
    - Virtual thread được JVM lập lịch, không cần OS thread riêng.
    - Platform thread là OS thread, phụ thuộc vào OS scheduler.

**Ví dụ**: Virtual thread phù hợp cho ứng dụng I/O-bound với hàng nghìn request đồng thời, trong khi platform thread thường dùng cho CPU-bound hoặc số lượng thread nhỏ.

---

### 2. Mô hình **thread-per-task** có gì thay đổi khi dùng virtual threads?
- **Thread-per-task truyền thống**:
    - Mỗi task (request, job) chạy trên một platform thread riêng.
    - Giới hạn số thread (~100-200) do chi phí tạo và context-switch cao.
    - Dẫn đến thread pool hữu hạn, cần queue để xử lý task vượt quá thread.
- **Thread-per-task với virtual threads**:
    - Mỗi task được ánh xạ vào một virtual thread, không cần thread pool.
    - Có thể tạo hàng triệu virtual thread, mỗi thread xử lý một task, không cần queue.
    - Blocking task (I/O, DB) không chặn carrier thread, nhờ JVM unmount virtual thread khi blocking.
- **Thay đổi lớn**:
    - Loại bỏ thread pool phức tạp, đơn giản hóa code (blocking thay vì non-blocking).
    - Tăng khả năng scale cho I/O-bound task, nhưng cần quản lý tài nguyên (DB connections, file handles).

**Ví dụ**: Một web server có thể xử lý hàng triệu request đồng thời, mỗi request trên một virtual thread, thay vì dùng thread pool với `CompletableFuture`.

---

### 3. ⚠️ Gài: “Dùng virtual threads là không cần quan tâm đến concurrency nữa.” — Nhận định này sai ở đâu?
Nhận định này **sai** vì:
- **Concurrency vẫn cần quản lý**:
    - Virtual threads không loại bỏ vấn đề thread-safety (race condition, deadlock) khi truy cập tài nguyên dùng chung.
    - Cần đồng bộ hóa (locks, semaphores) khi nhiều virtual thread truy cập cùng biến hoặc tài nguyên.
- **Pinning**: Một số thao tác (như `synchronized`, JNI) gây pinning, làm chặn carrier thread, giảm khả năng scale.
- **Tài nguyên hữu hạn**: Virtual threads không giải quyết giới hạn tài nguyên như DB connections, file handles, cần back-pressure.
- **CPU-bound task**: Virtual threads không hiệu quả, vẫn cần thread pool riêng để tránh chiếm carrier thread.
- **Debugging**: Với hàng triệu thread, việc tracing và debug concurrency errors trở nên phức tạp hơn.

**Kết luận**: Virtual threads đơn giản hóa mô hình lập trình nhưng không thay thế việc quản lý concurrency cẩn thận.

---

### 4. Khái niệm **carrier thread** là gì? Virtual thread “chạy” trên carrier như thế nào?
- **Carrier thread**: Là platform thread (OS thread) do JVM dùng để thực thi virtual threads. Một carrier thread có thể chạy nhiều virtual thread tuần tự hoặc đồng thời.
- **Cách virtual thread chạy**:
    - Virtual thread được **mounted** (gắn) vào carrier thread để thực thi.
    - Khi virtual thread blocking (I/O, sleep), JVM **unmounts** nó, lưu trạng thái stack và giải phóng carrier thread để chạy virtual thread khác.
    - Khi virtual thread sẵn sàng (I/O hoàn tất), JVM **remounts** nó vào một carrier thread (có thể khác).
- **Cơ chế**: JVM dùng **continuation** (ForkJoinPool hoặc custom scheduler) để quản lý mount/unmount, đảm bảo carrier thread luôn bận rộn.

**Ví dụ**: Một carrier thread trong ForkJoinPool có thể chạy hàng nghìn virtual thread, chuyển đổi khi I/O blocking xảy ra.

---

### 5. Các trường hợp sử dụng phù hợp nhất của virtual threads (I/O-bound, RPC, DB…).
- **I/O-bound tasks**:
    - Web server xử lý HTTP request (như Servlet, Spring WebFlux) với blocking I/O (socket, file).
    - Gọi API bên ngoài (RPC, REST) chờ phản hồi lâu.
- **Database access**:
    - JDBC queries blocking nhưng ngắn, như SELECT/INSERT đơn giản.
    - Phù hợp nếu connection pool đủ lớn để xử lý số lượng virtual thread.
- **Streaming/queue processing**:
    - Xử lý message từ Kafka, RabbitMQ với mỗi message trên một virtual thread.
- **Microservices với nhiều request đồng thời**: Mỗi request chạy trên virtual thread, đơn giản hóa code so với reactive programming.

**Không phù hợp**:
- CPU-bound tasks (machine learning, heavy computation) vì chiếm carrier thread lâu.
- Ứng dụng cần low-latency cao với tài nguyên giới hạn nghiêm ngặt.

---

## 2) Lập lịch & cơ chế treo/đánh thức

### 1. Cơ chế **mount/unmount** của virtual thread là gì? Khi nào unmount diễn ra?
- **Mount**: JVM gắn virtual thread vào carrier thread (platform thread) để thực thi. Stack của virtual thread được nạp vào carrier thread.
- **Unmount**: JVM tách virtual thread khỏi carrier thread, lưu trạng thái stack vào heap, giải phóng carrier thread để chạy virtual thread khác.
- **Khi unmount diễn ra**:
    - Virtual thread gọi blocking operation (như `Thread.sleep()`, `InputStream.read()`, `LockSupport.park()`).
    - Virtual thread chờ I/O (socket, file) hoặc synchronization (monitor wait).
    - JVM sử dụng **continuation** để lưu trạng thái và chuyển carrier thread sang virtual thread khác.

**Ví dụ**: Khi virtual thread gọi `socket.read()`, JVM unmounts nó, cho phép carrier thread chạy virtual thread khác.

---

### 2. Virtual threads được lập lịch bởi ai (JVM scheduler vs OS)? Ảnh hưởng đến fairness và preemption?
- **Lập lịch**:
    - **Virtual threads**: Được JVM lập lịch (thông qua ForkJoinPool hoặc custom scheduler), không phụ thuộc OS scheduler.
    - **Platform threads**: Được OS scheduler lập lịch, phụ thuộc vào hệ điều hành.
- **Fairness**:
    - JVM scheduler đảm bảo fairness bằng cách ưu tiên virtual thread sẵn sàng, nhưng không tuyệt đối như OS scheduler.
    - Virtual threads dựa vào cơ chế continuation, có thể dẫn đến tình trạng "starvation" nếu một thread chiếm carrier lâu (pinning).
- **Preemption**:
    - Virtual threads không hỗ trợ preemption (ngắt trước) như platform threads, vì JVM scheduler dựa vào **yield points** (như blocking calls).
    - Nếu virtual thread không yield (pinning), có thể làm chậm các thread khác.

**Hệ quả**: Virtual threads tối ưu cho I/O-bound, nhưng cần tránh pinning để đảm bảo fairness.

---

### 3. ⚠️ Gài: Khi nào một virtual thread **không thể** unmount khỏi carrier (bị “pinning”)? Kể ít nhất 2 tình huống.
- **Pinning**: Virtual thread không thể unmount, làm chặn carrier thread, giảm khả năng scale.
- **Tình huống gây pinning**:
    1. **Synchronized block/method**:
        - Khi virtual thread giữ monitor lock (qua `synchronized`), JVM không thể unmount vì monitor gắn với carrier thread.
        - Ví dụ: `synchronized (obj) { while (true) {} }`.
    2. **Native calls (JNI)**:
        - Gọi native code qua JNI (như thư viện C) không cho phép continuation, làm virtual thread chặn carrier.
        - Ví dụ: Gọi hàm native trong thư viện mã hóa.
    3. **File I/O blocking lâu** (ít gặp hơn):
        - Một số file I/O operation (như `FileInputStream.read()` trên hệ thống cũ) có thể gây pinning nếu không được JVM tối ưu.
- **Hệ quả**: Pinning làm giảm số lượng virtual thread chạy đồng thời, tương tự platform thread.

**Giải pháp**: Thay `synchronized` bằng `ReentrantLock`, tránh JNI, hoặc tách CPU-bound task sang thread pool riêng.

---

### 4. Sự khác nhau giữa **blocking** trong virtual threads và **non-blocking** (NIO) truyền thống.
- **Blocking trong virtual threads**:
    - Code viết theo kiểu blocking (như `InputStream.read()`), nhưng JVM tự động unmount virtual thread khi blocking.
    - Đơn giản hóa code, không cần callback hay reactive programming.
    - Phù hợp cho I/O-bound tasks với số lượng lớn request.
- **Non-blocking (NIO)**:
    - Dùng `Selector`, `Channel` để xử lý I/O không chặn thread (như `SocketChannel`).
    - Yêu cầu code phức tạp (callback, reactive), nhưng kiểm soát tốt hơn tài nguyên.
    - Hiệu quả cho low-latency hoặc khi tài nguyên rất giới hạn.
- **Khác biệt**:
    - **Code**: Blocking code đơn giản hơn, dễ bảo trì hơn NIO/reactive.
    - **Hiệu năng**: Virtual threads tối ưu cho scale lớn, NIO tối ưu cho tài nguyên hạn chế.
    - **Tài nguyên**: Virtual threads cần nhiều memory hơn cho stack nếu số thread lớn.

---

### 5. Hệ quả khi có nhiều virtual threads hơn số core rất lớn (10^5+): chi phí context-switch, memory footprint.
- **Chi phí context-switch**:
    - Virtual thread context-switch trong user-space (JVM), chi phí thấp (~ vài microsecond).
    - Tuy nhiên, với 10^5+ virtual threads, tổng chi phí switch có thể tích lũy, đặc biệt nếu pinning xảy ra.
- **Memory footprint**:
    - Mỗi virtual thread dùng stack nhỏ (~ vài KB), lưu trên heap khi unmounted.
    - 10^5 threads có thể tiêu tốn ~100-500 MB heap, ảnh hưởng GC nếu không quản lý tốt.
    - Pinning làm stack không được giải phóng, tăng memory footprint.
- **Hệ quả**:
    - Cần giới hạn tài nguyên (DB connections, file handles) để tránh overload.
    - Pinning hoặc CPU-bound task làm giảm hiệu quả, cần tách sang thread pool riêng.
- **Giải pháp**: Dùng back-pressure (Semaphore), giám sát memory, và tránh pinning.

---

## 3) API cốt lõi & cách khởi tạo

### 1. Cách tạo virtual thread trực tiếp bằng `Thread.ofVirtual().start(...)` và `Thread.startVirtualThread(...)`.
- **`Thread.ofVirtual().start(...)`**:
    - Tạo và khởi động virtual thread với `Runnable`.
  ```java
  Thread vt = Thread.ofVirtual().name("my-vt").start(() -> System.out.println("Running"));
  ```
- **`Thread.startVirtualThread(...)`**:
    - Tạo và chạy virtual thread trực tiếp, không cần lưu tham chiếu.
  ```java
  Thread.startVirtualThread(() -> System.out.println("Running"));
  ```
- **Khác biệt**: `ofVirtual()` cho phép tùy chỉnh (name, priority) trước khi start, `startVirtualThread` ngắn gọn hơn.

---

### 2. `Executors.newVirtualThreadPerTaskExecutor()` hoạt động thế nào? Khác gì với `newFixedThreadPool`.
- **`newVirtualThreadPerTaskExecutor()`**:
    - Tạo `ExecutorService` tạo một virtual thread mới cho mỗi task.
    - Không dùng thread pool, mỗi task chạy trên virtual thread riêng, unmount khi blocking.
    - Phù hợp cho I/O-bound tasks với số lượng lớn.
  ```java
  ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
  executor.submit(() -> System.out.println("Task"));
  ```
- **`newFixedThreadPool`**:
    - Tạo thread pool với số lượng platform thread cố định.
    - Task chờ trong queue nếu số thread bị chiếm hết.
    - Phù hợp cho CPU-bound hoặc tài nguyên giới hạn nghiêm ngặt.
- **Khác biệt**:
    - **Scale**: Virtual thread executor scale tốt hơn (hàng triệu thread), fixed pool giới hạn bởi số thread.
    - **Blocking**: Virtual thread không chặn carrier, fixed pool chặn thread.
    - **Memory**: Virtual thread dùng heap, fixed pool dùng OS thread stack.

---

### 3. ⚠️ Gài: Có nên wrap `newVirtualThreadPerTaskExecutor()` bên trong một **bounded** queue để “giới hạn” số virtual threads? Tại sao có/không?
- **Không nên** wrap `newVirtualThreadPerTaskExecutor()` trong bounded queue vì:
    - **Mục đích virtual thread**: Được thiết kế để tạo hàng triệu thread nhẹ, không cần giới hạn số thread như platform thread.
    - **Bounded queue làm giảm scale**: Giới hạn số task đồng thời, trái với mục tiêu scale lớn của virtual threads.
    - **Tài nguyên thực sự cần giới hạn**: Không phải số thread, mà là tài nguyên như DB connections, file handles. Dùng `Semaphore` hoặc connection pool để quản lý.
- **Khi nào cần queue**:
    - Nếu tài nguyên rất hạn chế (như DB connections), nhưng nên áp dụng back-pressure ở tầng tài nguyên, không phải thread.
- **Giải pháp thay thế**: Dùng `Semaphore` để giới hạn tài nguyên, để virtual thread tận dụng tối đa khả năng scale.

---

### 4. Các tuỳ chọn đặt tên, `ThreadFactory` cho virtual threads.
- **Đặt tên**:
    - Dùng `Thread.ofVirtual().name(String)` hoặc `Thread.ofVirtual().name(String, int)` để đặt tên cố định hoặc tăng dần.
  ```java
  Thread vt = Thread.ofVirtual().name("vt-", 1).start(() -> {});
  ```
- **`ThreadFactory`**:
    - Tạo `ThreadFactory` cho virtual threads bằng `Thread.ofVirtual().factory()`.
  ```java
  ThreadFactory factory = Thread.ofVirtual().name("my-vt-", 0).factory();
  Thread vt = factory.newThread(() -> System.out.println("Running"));
  vt.start();
  ```
- **Tùy chỉnh**: Có thể set daemon, priority, hoặc uncaught exception handler trong factory.

---

### 5. Cách join/cancel một virtual thread; khác biệt hành vi so với platform thread?
- **Join**:
    - Virtual thread: Gọi `Thread.join()` hoặc `Thread.join(Duration)` để chờ thread hoàn tất.
  ```java
  Thread vt = Thread.ofVirtual().start(() -> Thread.sleep(1000));
  vt.join(); // Chờ hoàn tất
  ```
    - Platform thread: Tương tự, nhưng blocking `join()` chặn OS thread.
- **Cancel**:
    - Virtual thread: Gọi `Thread.interrupt()` để hủy, tương tự platform thread.
  ```java
  Thread vt = Thread.ofVirtual().start(() -> { while (!Thread.interrupted()) {} });
  vt.interrupt();
  ```
- **Khác biệt**:
    - Virtual thread: `join()` không chặn carrier thread, JVM unmount virtual thread gọi `join`.
    - Platform thread: `join()` chặn OS thread, gây tốn tài nguyên nếu nhiều thread.
    - Interrupt behavior giống nhau, nhưng virtual thread nhẹ hơn, dễ hủy hơn.

---

## 4) I/O & thao tác chặn (blocking)

### 1. Vì sao nói “blocking rẻ hơn” trên virtual threads? JVM làm gì dưới lớp để tránh chặn carrier?
- **Blocking rẻ hơn** vì:
    - Khi virtual thread blocking (I/O, sleep), JVM **unmounts** nó, lưu stack vào heap, giải phóng carrier thread.
    - Carrier thread được dùng để chạy virtual thread khác, tăng hiệu suất sử dụng CPU.
- **JVM làm gì**:
    - Dùng **continuation** (trong ForkJoinPool) để lưu trạng thái virtual thread.
    - Chuyển đổi blocking call (như `InputStream.read()`) thành non-blocking trong JVM, thông qua integration với NIO hoặc OS.
    - Khi I/O hoàn tất, JVM remount virtual thread để tiếp tục.

**Ví dụ**: Gọi `socket.read()` trong virtual thread không chặn carrier, khác với platform thread.

---

### 2. ⚠️ Gài: Những thao tác nào **vẫn** có thể làm chặn carrier (pinning) khiến scale kém? Ví dụ với `synchronized`, native/JNI, file I/O nhất định…
- **Thao tác gây pinning**:
    1. **`synchronized` block/method**:
        - Monitor lock gắn với carrier thread, không cho phép unmount.
        - Ví dụ: `synchronized (obj) { Thread.sleep(1000); }` chặn carrier thread.
    2. **Native calls (JNI)**:
        - Native code không hỗ trợ continuation, làm virtual thread chặn carrier.
        - Ví dụ: Gọi thư viện C qua JNI.
    3. **File I/O trên hệ thống cũ**:
        - Một số file I/O (như `FileInputStream` trên hệ thống không tối ưu) không được JVM chuyển thành non-blocking.
        - Ví dụ: Đọc file lớn trên hệ thống cũ.
    4. **CPU-bound task lâu**:
        - Vòng lặp nặng (như tính toán phức tạp) không yield, chiếm carrier thread.
- **Hệ quả**: Pinning làm giảm số virtual thread chạy đồng thời, giống platform thread.

**Giải pháp**: Dùng `ReentrantLock` thay `synchronized`, tách CPU-bound task sang thread pool riêng.

---

### 3. Ảnh hưởng tới I/O mạng (socket) và DB driver truyền thống (JDBC). Cần thay đổi code không?
- **I/O mạng (socket)**:
    - Virtual threads tự động chuyển blocking socket calls (`Socket.read()`) thành non-blocking trong JVM, không cần đổi code.
    - Ví dụ: Code blocking như `InputStream.read()` hoạt động tốt trên virtual threads.
- **DB driver (JDBC)**:
    - JDBC blocking calls (như `Statement.executeQuery()`) tương thích với virtual threads, không chặn carrier thread.
    - Không cần đổi code, nhưng cần đảm bảo connection pool đủ lớn để hỗ trợ số virtual thread.
- **Khi cần thay đổi code**:
    - Nếu dùng connection pool nhỏ, cần thêm back-pressure (Semaphore) để giới hạn số thread truy cập DB.
    - Tránh pinning trong JDBC driver (như native calls trong driver cũ).

---

### 4. Kỹ thuật chẩn đoán khi nghi ngờ pinning (log, thread dump, flag runtime…).
- **Thread dump**:
    - Chạy `jstack <pid>` hoặc VisualVM để lấy thread dump.
    - Tìm carrier thread (ForkJoinPool worker) bị chặn lâu bởi `synchronized` hoặc JNI.
- **Logging**:
    - Bật flag `-Djdk.tracePinnedThreads=full` để log chi tiết khi pinning xảy ra.
    - Ví dụ: Log sẽ chỉ ra stack trace của virtual thread gây pinning (như `synchronized` block).
- **Monitoring**:
    - Dùng JFR (Java Flight Recorder) để ghi lại sự kiện pinning (`jdk.VirtualThreadPinned`).
    - Kiểm tra số lượng virtual thread mounted/unmounted qua JFR metrics.
- **Refactor**:
    - Thay `synchronized` bằng `ReentrantLock` nếu phát hiện pinning.
    - Tách JNI hoặc CPU-bound task sang thread pool riêng.

---

### 5. Đối với tác vụ CPU-bound nặng, virtual threads có lợi không? Chiến lược tách pool?
- **Virtual threads không hiệu quả** cho CPU-bound tasks vì:
    - Chiếm carrier thread lâu, làm giảm số virtual thread khác được chạy.
    - Không tận dụng được unmount, giống platform thread.
- **Chiến lược tách pool**:
    - Dùng `Executors.newFixedThreadPool(n)` (n = số core) cho CPU-bound tasks.
    - Chạy I/O-bound tasks trên `newVirtualThreadPerTaskExecutor()`.
    - Phối hợp qua `ExecutorService` để submit task phù hợp:
      ```java
      ExecutorService cpuPool = Executors.newFixedThreadPool(4);
      ExecutorService vtPool = Executors.newVirtualThreadPerTaskExecutor();
      if (isCpuBound(task)) {
          cpuPool.submit(task);
      } else {
          vtPool.submit(task);
      }
      ```

---

## 5) Đồng bộ hoá & thread safety

### 1. Ảnh hưởng của virtual threads lên `synchronized`, `ReentrantLock`, `StampedLock`, `Semaphore`.
- **`synchronized`**:
    - Gây pinning, làm virtual thread chặn carrier thread, giảm scale.
    - Vẫn thread-safe, nhưng không tối ưu cho virtual threads.
- **`ReentrantLock`**:
    - Hỗ trợ virtual threads tốt hơn, không gây pinning (dùng `LockSupport`).
    - Thread-safe, phù hợp cho high-concurrency.
- **`StampedLock`**:
    - Tương tự `ReentrantLock`, hỗ trợ read/write lock không pinning.
    - Tối ưu cho read-heavy workloads.
- **`Semaphore`**:
    - Không gây pinning, phù hợp để giới hạn tài nguyên (DB connections, file handles).
    - Dùng để implement back-pressure trong virtual threads.

**Lựa chọn**: Ưu tiên `ReentrantLock` hoặc `Semaphore` thay vì `synchronized`.

---

### 2. ⚠️ Gài: Vì sao khoá **monitor** (`synchronized`) có thể gây pinning lâu? Khi nào nên ưu tiên lock không gắn monitor.
- **Vì sao `synchronized` gây pinning**:
    - Monitor lock gắn với carrier thread, không cho phép JVM unmount virtual thread khi chờ hoặc blocking.
    - Ví dụ: `synchronized (obj) { Thread.sleep(1000); }` chặn carrier thread 1 giây.
- **Khi ưu tiên lock không gắn monitor**:
    - Khi cần scale lớn với nhiều virtual thread đồng thời.
    - Khi có blocking operation trong critical section (như I/O, sleep).
    - Dùng `ReentrantLock` hoặc `StampedLock` vì chúng dùng `LockSupport.park()`, tương thích với continuation của virtual threads.

**Ví dụ**:
```java
ReentrantLock lock = new ReentrantLock();
lock.lock();
try {
    Thread.sleep(1000); // Không pinning
} finally {
    lock.unlock();
}
```

---

### 3. Thiết kế **back-pressure** khi có tài nguyên hữu hạn (ví dụ connection pool): dùng semaphore/bộ giới hạn ở đâu?
- **Vấn đề**: Tài nguyên như DB connections giới hạn số request đồng thời, cần back-pressure để tránh overload.
- **Giải pháp**:
    - Dùng `Semaphore` để giới hạn số virtual thread truy cập tài nguyên:
      ```java
      Semaphore semaphore = new Semaphore(50); // Giới hạn 50 connections
      ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
      executor.submit(() -> {
          try {
              semaphore.acquire();
              // Truy cập DB
          } finally {
              semaphore.release();
          }
      });
      ```
- **Đặt ở đâu**:
    - Trong tầng truy cập tài nguyên (DB, API, file system).
    - Trước khi gọi blocking operation (như `Connection.execute()`).
- **Lợi ích**: Ngăn timeout dây chuyền, đảm bảo tài nguyên không bị quá tải.

---

### 4. Tương tác với `wait/notify` trên monitor khi chạy trong virtual threads.
- `wait/notify` trên monitor (`synchronized`) hoạt động bình thường trong virtual threads, nhưng **gây pinning**:
    - Khi virtual thread gọi `obj.wait()`, nó không unmount, làm chặn carrier thread.
    - `notify()` hoặc `notifyAll()` vẫn đánh thức thread, nhưng hiệu quả giảm do pinning.
- **Giải pháp thay thế**:
    - Dùng `ReentrantLock` với `Condition`:
      ```java
      ReentrantLock lock = new ReentrantLock();
      Condition condition = lock.newCondition();
      lock.lock();
      try {
          condition.await(); // Không pinning
          condition.signal();
      } finally {
          lock.unlock();
      }
      ```
- **Lưu ý**: Tránh `wait/notify` trong virtual threads, ưu tiên `Condition` hoặc `CompletableFuture`.

---

### 5. Sử dụng `Thread.onSpinWait()`/spin lock trong bối cảnh virtual threads — nên hay không?
- **Không nên** dùng `Thread.onSpinWait()` hoặc spin lock trong virtual threads vì:
    - Spin lock chiếm carrier thread, gây pinning, làm giảm khả năng scale.
    - Virtual threads được thiết kế cho I/O-bound, không phù hợp với busy-waiting.
- **Thay thế**:
    - Dùng `ReentrantLock` hoặc `Semaphore` để đồng bộ hóa.
    - Nếu cần CPU-bound, tách sang `FixedThreadPool` để tránh ảnh hưởng virtual threads.
- **Ví dụ**: Thay spin lock bằng lock:
```java
ReentrantLock lock = new ReentrantLock();
lock.lock();
try {
    // Critical section
} finally {
    lock.unlock();
}
```

---

## 6) ThreadLocal, Scoped Values & ngữ cảnh

### 1. Chi phí và rủi ro của `ThreadLocal` với hàng chục nghìn virtual threads.
- **Chi phí**:
    - Mỗi virtual thread có bản sao riêng của `ThreadLocal`, tiêu tốn memory (~ vài KB/thread).
    - Với 10^5 threads, memory footprint có thể lên đến hàng trăm MB, ảnh hưởng GC.
- **Rủi ro**:
    - **Memory leak**: Nếu không `remove()` `ThreadLocal` sau khi dùng, giá trị vẫn tồn tại trong thread.
    - **Context leak**: Dữ liệu từ virtual thread trước có thể bị tái sử dụng sai trong thread sau.
    - **Hiệu năng**: Truy cập `ThreadLocal` chậm hơn nếu số thread lớn do quản lý bản sao.

**Giải pháp**: Dùng `ScopedValue` (Java 21) hoặc cẩn thận `remove()` `ThreadLocal`.

---

### 2. ⚠️ Gài: Thay `ThreadLocal` bằng giải pháp nào để truyền dữ liệu chỉ-đọc theo ngữ cảnh call (gợi ý: scoped values)? Ưu/nhược?
- **Giải pháp thay thế**: Dùng **`ScopedValue`** (Java 21, JEP 429) để truyền dữ liệu chỉ-đọc theo ngữ cảnh.
- **Cách dùng**:
  ```java
  ScopedValue<String> TRACE_ID = ScopedValue.newInstance();
  ScopedValue.runWhere(TRACE_ID, "tx123", () -> {
      System.out.println(ScopedValue.get(TRACE_ID)); // "tx123"
  });
  ```
- **Ưu điểm**:
    - **Hiệu năng cao**: `ScopedValue` nhẹ hơn `ThreadLocal`, không cần bản sao cho mỗi thread.
    - **Thread-safe**: Dữ liệu chỉ-đọc, không lo race condition.
    - **Scope rõ ràng**: Giá trị tự động bị xóa khi ra khỏi scope, tránh memory leak.
- **Nhược điểm**:
    - Chỉ hỗ trợ dữ liệu chỉ-đọc, không cho phép thay đổi trong scope.
    - Yêu cầu Java 21+, không tương thích với code cũ dùng `ThreadLocal`.
    - Phức tạp hơn khi truyền qua nhiều layer (cần `runWhere` lồng nhau).

**Gài**: `ThreadLocal` vẫn cần thiết nếu dữ liệu cần sửa đổi trong thread.

---

### 3. Tương tác giữa MDC (logging) và virtual threads: truyền/clear ngữ cảnh thế nào cho chuẩn.
- **Vấn đề**: MDC (`Mapped Diagnostic Context`) dựa trên `ThreadLocal`, không tự động truyền qua virtual thread boundaries.
- **Giải pháp**:
    - Dùng `ScopedValue` để lưu MDC context:
      ```java
      ScopedValue<String> MDC_CONTEXT = ScopedValue.newInstance();
      ScopedValue.runWhere(MDC_CONTEXT, "tx123", () -> {
          log.info("Message"); // Truy cập MDC_CONTEXT.get()
      });
      ```
    - Wrap logging framework để đọc `ScopedValue` thay vì `ThreadLocal`.
- **Clear ngữ cảnh**:
    - `ScopedValue` tự động clear khi ra khỏi scope (`runWhere`).
    - Với `ThreadLocal`, gọi `MDC.clear()` trong `finally` block:
      ```java
      MDC.put("traceId", "tx123");
      try {
          log.info("Message");
      } finally {
          MDC.clear();
      }
      ```

---

### 4. Vấn đề “context leak” khi tái sử dụng logic giữa virtual & platform thread.
- **Context leak**: Dữ liệu từ `ThreadLocal` của virtual thread có thể bị tái sử dụng sai trong platform thread hoặc ngược lại.
- **Nguyên nhân**:
    - Virtual thread và platform thread chia sẻ cùng `ThreadLocal` instance.
    - Code không clear `ThreadLocal` sau khi dùng.
- **Giải pháp**:
    - Dùng `ScopedValue` để giới hạn scope dữ liệu, tránh leak.
    - Luôn gọi `ThreadLocal.remove()` trong `finally` block:
      ```java
      ThreadLocal<String> tl = ThreadLocal.withInitial(() -> "");
      try {
          tl.set("value");
      } finally {
          tl.remove();
      }
      ```
    - Tách logic cho virtual thread và platform thread riêng biệt, tránh dùng chung `ThreadLocal`.

---

## 7) Structured Concurrency (tổng quan liên quan)

### 1. Structured concurrency giải quyết vấn đề gì khi chạy nhiều task song song?
- **Vấn đề**: Trong concurrency truyền thống, các task chạy độc lập (như `ExecutorService.submit()`), khó quản lý lỗi, hủy, hoặc timeout đồng bộ.
- **Structured concurrency** (Java 21, JEP 428):
    - Tổ chức các task trong một **scope** (như `StructuredTaskScope`), đảm bảo tất cả subtask hoàn tất hoặc hủy cùng lúc.
    - Giải quyết:
        - **Error propagation**: Nếu một subtask thất bại, các subtask khác có thể hủy.
        - **Cancellation**: Hủy toàn bộ scope khi timeout hoặc một task thất bại.
        - **Resource cleanup**: Đảm bảo tài nguyên được giải phóng khi scope kết thúc.
- **Ví dụ**:
```java
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    scope.fork(() -> callApi1());
    scope.fork(() -> callApi2());
    scope.join().throwIfFailed(); // Chờ và ném lỗi nếu có
}
```

---

### 2. Khái niệm **task scope**, cancel/propagate exceptions, deadline/shutdown.
- **Task scope**:
    - Là một context (`StructuredTaskScope`) quản lý các subtask (forked tasks).
    - Đảm bảo tất cả subtask hoàn tất hoặc hủy cùng lúc.
- **Cancel/propagate exceptions**:
    - `ShutdownOnFailure`: Hủy tất cả subtask nếu một task thất bại, ném exception gốc.
    - `ShutdownOnSuccess`: Hủy các task còn lại khi một task thành công.
- **Deadline/shutdown**:
    - `joinUntil(Instant)`: Chờ đến thời điểm cụ thể, hủy nếu timeout.
    - `shutdown()`: Hủy tất cả subtask, thường dùng khi scope không còn cần thiết.
- **Ví dụ**:
```java
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    scope.fork(() -> callApi());
    scope.joinUntil(Instant.now().plusSeconds(5)); // Timeout sau 5s
}
```

---

### 3. ⚠️ Gài: Khi một subtask thất bại, chiến lược **fail-fast** và “collect all” khác nhau thế nào?
- **Fail-fast (`ShutdownOnFailure`)**:
    - Nếu một subtask ném exception, scope hủy tất cả subtask còn lại ngay lập tức.
    - Ném exception của subtask thất bại đầu tiên qua `throwIfFailed()`.
    - Phù hợp khi cần phản hồi nhanh khi lỗi xảy ra.
- **Collect all**:
    - Chờ tất cả subtask hoàn tất (thành công hoặc thất bại), thu thập tất cả kết quả/lỗi.
    - Dùng custom `StructuredTaskScope` để lưu trữ exception trong `List<Throwable>`.
    - Phù hợp khi cần xử lý tất cả kết quả (như báo cáo lỗi).
- **Ví dụ**:
  ```java
  // Fail-fast
  try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
      scope.fork(() -> { throw new RuntimeException("Error"); });
      scope.join().throwIfFailed(); // Ném ngay
  }
  // Collect all
  try (var scope = new StructuredTaskScope<Object>()) {
      scope.fork(() -> { throw new RuntimeException("Error"); });
      scope.join();
      // Xử lý tất cả exception
  }
  ```

---

### 4. Ứng dụng thực tế: gom nhiều RPC trong một request theo structured concurrency.
- **Ứng dụng**: Gọi nhiều API song song, thu thập kết quả, hoặc hủy nếu một API thất bại/timeout.
- **Code ví dụ**:
```java
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    var future1 = scope.fork(() -> callRpc1());
    var future2 = scope.fork(() -> callRpc2());
    var future3 = scope.fork(() -> callRpc3());
    scope.joinUntil(Instant.now().plusSeconds(5)).throwIfFailed();
    List<String> results = List.of(future1.get(), future2.get(), future3.get());
    return results;
}
```
- **Lợi ích**: Đảm bảo tất cả RPC hoàn tất hoặc hủy cùng lúc, tránh rò rỉ tài nguyên.

---

## 8) Tích hợp với framework & kiến trúc

### 1. Khi tích hợp vào ứng dụng web (ví dụ servlet/HTTP server), chỗ nào nên dùng virtual threads, chỗ nào vẫn nên dùng thread pool hữu hạn?
- **Dùng virtual threads**:
    - **Servlet/HTTP handler**: Xử lý request I/O-bound (gọi API, DB query ngắn).
    - **Middleware**: Blocking code như đọc request body, parse JSON.
    - **Ví dụ**: Spring MVC với `newVirtualThreadPerTaskExecutor()` cho mỗi request.
- **Dùng thread pool hữu hạn**:
    - **CPU-bound tasks**: Tính toán nặng, mã hóa, xử lý ảnh.
    - **Tài nguyên giới hạn nghiêm ngặt**: DB connections, file handles cần queue để tránh overload.
    - **Ví dụ**: `newFixedThreadPool(4)` cho image processing.
- **Chiến lược**:
    - Kết hợp: Virtual threads cho I/O, fixed pool cho CPU-bound.
    - Dùng back-pressure (Semaphore) cho tài nguyên hạn chế.

---

### 2. ⚠️ Gài: Với ORM/JDBC + connection pool nhỏ, bật virtual threads **không** tự động tăng throughput. Vì sao?
- **Lý do**:
    - **Connection pool giới hạn**: Nếu pool chỉ có 50 connections, chỉ 50 virtual threads truy cập DB đồng thời được, các thread khác phải chờ, không tăng throughput.
    - **Pinning**: Nếu JDBC driver dùng `synchronized` hoặc JNI, gây pinning, làm giảm scale.
    - **Overhead**: Tạo nhiều virtual threads nhưng không dùng được connection gây memory overhead và GC pressure.
- **Giải pháp**:
    - Tăng connection pool size (nếu DB hỗ trợ).
    - Dùng `Semaphore` để giới hạn số thread truy cập DB.
    - Thay `synchronized` bằng `ReentrantLock` trong driver hoặc code liên quan.

---

### 3. Cân nhắc khi dùng virtual threads trong scheduler/background jobs.
- **Cân nhắc**:
    - **I/O-bound jobs**: Virtual threads phù hợp (như gửi email, gọi API).
    - **CPU-bound jobs**: Tách sang fixed thread pool để tránh pinning.
    - **Tài nguyên giới hạn**: Dùng back-pressure để giới hạn số job đồng thời.
    - **Monitoring**: Theo dõi pinning và memory footprint với nhiều job.
- **Ví dụ**: Dùng `newVirtualThreadPerTaskExecutor()` cho job gửi notification, nhưng `newFixedThreadPool()` cho job tính toán.

---

### 4. Tương thích với code cũ sử dụng `CompletableFuture`/reactive: khi nào giữ reactive, khi nào chuyển về blocking + virtual threads.
- **Giữ reactive (`CompletableFuture`)**:
    - Ứng dụng cần low-latency, tài nguyên rất giới hạn (như DB connections nhỏ).
    - Code đã tối ưu với non-blocking I/O (NIO, reactive drivers).
    - Cần kiểm soát chi tiết concurrency (như rate-limiting).
- **Chuyển sang blocking + virtual threads**:
    - Code đơn giản hơn, dễ bảo trì (blocking code dễ đọc hơn reactive).
    - I/O-bound tasks với số lượng lớn request (như web server).
    - Tài nguyên đủ để scale (như DB pool lớn).
- **Chiến lược**:
    - Dùng virtual threads cho new code hoặc refactor code I/O-bound.
    - Giữ reactive cho legacy code hoặc khi cần low-latency nghiêm ngặt.

---

### 5. Logging/tracing khi có hàng vạn threads: đặt tên, correlation id, giới hạn log.
- **Đặt tên**:
    - Dùng `Thread.ofVirtual().name("vt-", i)` để đặt tên thread dễ nhận diện.
- **Correlation ID**:
    - Lưu correlation ID trong `ScopedValue` thay vì `ThreadLocal`:
      ```java
      ScopedValue<String> CORRELATION_ID = ScopedValue.newInstance();
      ScopedValue.runWhere(CORRELATION_ID, "tx123", () -> log.info("Message"));
      ```
- **Giới hạn log**:
    - Dùng sampling (log chỉ 1% request) để giảm log volume.
    - Bật JFR hoặc `-Djdk.tracePinnedThreads` để log pinning thay vì log toàn bộ thread.
- **Tracing**:
    - Dùng tracing framework (OpenTelemetry) tích hợp với `ScopedValue` để truyền correlation ID.

---

## 9) Quan sát, debug & tối ưu

### 1. Cách lấy **thread dump**/stack trace khi số virtual threads rất lớn; các chỉ dấu nhận diện pinning/blocking.
- **Lấy thread dump**:
    - Chạy `jstack <pid>` hoặc dùng VisualVM/JMC.
    - Tìm carrier threads (ForkJoinPool worker) với stack trace dài hoặc bị chặn bởi `synchronized`/JNI.
- **Chỉ dấu pinning**:
    - Carrier thread có trạng thái `RUNNABLE` nhưng không tiến triển (do `synchronized` hoặc JNI).
    - Virtual thread bị gắn lâu với carrier (xem JFR event `jdk.VirtualThreadPinned`).
- **Chỉ dấu blocking**:
    - Virtual thread ở trạng thái `WAITING` hoặc `TIMED_WAITING` do I/O hoặc lock.
- **Tool**:
    - Bật `-Djdk.tracePinnedThreads=full` để log chi tiết pinning.
    - Dùng JFR để ghi lại sự kiện virtual thread.

---

### 2. Ảnh hưởng tới GC và heap khi có nhiều stack (ảo) cùng tồn tại; stack vùng nào lưu trữ?
- **Ảnh hưởng GC**:
    - Virtual thread stack lưu trên **heap** khi unmounted, tiêu tốn ~ vài KB/thread.
    - Với 10^5 threads, heap có thể tăng hàng trăm MB, gây GC pressure.
    - GC phải quét stack của virtual threads, làm tăng thời gian pause nếu số thread lớn.
- **Stack lưu trữ**:
    - Khi mounted: Stack nằm trong carrier thread (native stack).
    - Khi unmounted: Stack được lưu vào heap dưới dạng continuation object.
- **Tối ưu**:
    - Giới hạn số virtual thread bằng back-pressure.
    - Giám sát heap usage qua JFR hoặc VisualVM.

---

### 3. ⚠️ Gài: Vì sao “bật virtual threads” đôi khi làm **tệ hơn**? Kể ít nhất 3 nguyên nhân (DB bottleneck, pinning, back-pressure…).
- **Nguyên nhân**:
    1. **DB bottleneck**: Connection pool nhỏ không đáp ứng được số lượng lớn virtual thread, dẫn đến chờ lâu hoặc timeout.
    2. **Pinning**: `synchronized`, JNI, hoặc CPU-bound task làm chặn carrier thread, giảm scale.
    3. **Thiếu back-pressure**: Tạo quá nhiều virtual threads (10^5+) gây memory overhead, GC pressure, hoặc overload tài nguyên (file, API).
    4. **CPU-bound tasks**: Virtual threads không tối ưu, chiếm carrier thread, làm chậm hệ thống.
- **Giải pháp**:
    - Dùng `Semaphore` cho back-pressure.
    - Thay `synchronized` bằng `ReentrantLock`.
    - Tách CPU-bound task sang fixed thread pool.

---

### 4. Chiến lược giới hạn đồng thời ở **biên tài nguyên** (DB, FS, API) thay vì hạn thread.
- **Chiến lược**:
    - Dùng `Semaphore` để giới hạn số thread truy cập tài nguyên:
      ```java
      Semaphore dbSemaphore = new Semaphore(50); // 50 DB connections
      dbSemaphore.acquire();
      try {
          // Truy cập DB
      } finally {
          dbSemaphore.release();
      }
      ```
    - Tăng connection pool size nếu DB hỗ trợ.
    - Dùng rate-limiting cho API calls (như `Bucket4j`).
- **Lợi ích**: Cho phép virtual threads scale tối đa, chỉ giới hạn ở tài nguyên thực sự.

---

### 5. Benchmark đúng cách với virtual threads: warm-up, đo latency tail, so sánh cùng workload.
- **Warm-up**:
    - Chạy workload vài phút để JIT compiler tối ưu hóa virtual thread scheduling.
    - Ví dụ: Chạy 10k requests trước khi đo.
- **Đo latency tail**:
    - Đo P99/P999 latency để phát hiện pinning hoặc bottleneck.
    - Dùng tool như JMH hoặc wrk.
- **So sánh cùng workload**:
    - So sánh virtual threads với fixed thread pool hoặc reactive code trên cùng số request và tài nguyên.
    - Ví dụ: 10k request gọi API với connection pool 50.
- **Tool**:
    - JMH để đo micro-benchmarks.
    - JFR để ghi lại pinning và GC metrics.
- **Lưu ý**: Đảm bảo tài nguyên (DB, API) đủ để scale, tránh bottleneck giả.

---

## 10) Mini case (thực chiến 2–5 phút/câu)

### 1. Chuyển một REST handler đang dùng `CompletableFuture`/non-blocking sang **blocking code** chạy trên `newVirtualThreadPerTaskExecutor()`; nêu lợi/hại, điểm cần canh chừng.
- **Chuyển đổi**:
  ```java
  // Trước (CompletableFuture)
  CompletableFuture<String> handleRequest() {
      return CompletableFuture.supplyAsync(() -> callApi(), Executors.newFixedThreadPool(10));
  }
  // Sau (Virtual Thread)
  ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
  String handleRequest() {
      return executor.submit(() -> callApi()).get();
  }
  ```
- **Lợi**:
    - Code đơn giản hơn, dễ đọc, không cần callback hoặc reactive.
    - Scale tốt hơn cho I/O-bound tasks (hàng triệu request).
- **Hại**:
    - Memory footprint tăng nếu số virtual thread lớn.
    - Pinning có thể xảy ra nếu dùng `synchronized` hoặc JNI.
- **Canh chừng**:
    - Pinning trong API call (dùng `-Djdk.tracePinnedThreads` để phát hiện).
    - Giới hạn tài nguyên (DB connections) bằng `Semaphore`.
    - Giám sát GC pressure với số thread lớn.

---

### 2. Dịch vụ gọi 3 API downstream: thiết kế structured concurrency để **hủy** 2 call còn lại khi 1 call fail/timeout.
```java
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    var future1 = scope.fork(() -> callApi1());
    var future2 = scope.fork(() -> callApi2());
    var future3 = scope.fork(() -> callApi3());
    scope.joinUntil(Instant.now().plusSeconds(5)).throwIfFailed();
    return List.of(future1.get(), future2.get(), future3.get());
} catch (TimeoutException e) {
    throw new RuntimeException("Timeout", e);
}
```
- **Giải thích**:
    - `ShutdownOnFailure` hủy tất cả subtask nếu một task thất bại hoặc timeout.
    - `joinUntil` đảm bảo timeout sau 5s.
    - Exception được propagate qua `throwIfFailed()`.

---

### 3. Ứng dụng bị nghẽn do `synchronized` trong lớp `JsonCache`: đề xuất thay đổi để tránh pinning và vẫn thread-safe.
- **Vấn đề**: `synchronized` trong `JsonCache` gây pinning, làm chặn carrier thread.
- **Thay đổi**:
    - Thay `synchronized` bằng `ReentrantLock`:
      ```java
      class JsonCache {
          private final ReentrantLock lock = new ReentrantLock();
          private Map<String, String> cache = new HashMap<>();
          String get(String key) {
              lock.lock();
              try {
                  return cache.get(key);
              } finally {
                  lock.unlock();
              }
          }
      }
      ```
- **Lợi ích**:
    - `ReentrantLock` không gây pinning, hỗ trợ continuation.
    - Vẫn thread-safe, đảm bảo atomicity.
- **Canh chừng**: Đảm bảo luôn `unlock()` trong `finally` block.

---

### 4. Kết nối DB tối đa 50; workload tạo 20k virtual threads. Thiết kế **back-pressure** để không làm timeouts dây chuyền.
```java
Semaphore dbSemaphore = new Semaphore(50); // 50 connections
ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();
for (int i = 0; i < 20000; i++) {
    executor.submit(() -> {
        dbSemaphore.acquire();
        try {
            // Truy cập DB
            executeQuery();
        } finally {
            dbSemaphore.release();
        }
    });
}
```
- **Giải thích**:
    - `Semaphore` giới hạn 50 virtual threads truy cập DB đồng thời.
    - Các thread khác chờ, tránh overload DB và timeout dây chuyền.
- **Tối ưu**:
    - Tăng connection pool size nếu DB hỗ trợ.
    - Dùng JFR để giám sát semaphore contention.

---

### 5. Quy trình **chẩn đoán pinning**: bạn sẽ thu thập gì, đọc output nào, và quyết định refactor ở đâu.
- **Thu thập**:
    - Thread dump qua `jstack <pid>` hoặc VisualVM.
    - Bật flag `-Djdk.tracePinnedThreads=full` để log pinning.
    - Dùng JFR để ghi lại sự kiện `jdk.VirtualThreadPinned`.
- **Đọc output**:
    - Thread dump: Tìm carrier thread (`ForkJoinPool-worker`) bị chặn bởi `synchronized` hoặc JNI.
    - JFR: Kiểm tra stack trace của event `VirtualThreadPinned` để xác định code gây pinning.
- **Refactor**:
    - Thay `synchronized` bằng `ReentrantLock` hoặc `StampedLock`.
    - Tách JNI/CPU-bound task sang `FixedThreadPool`.
    - Dùng `-Djdk.tracePinnedThreads` để verify sau refactor.

---

