## 1) Khái niệm & Tổng quan

1. Virtual thread là gì? Khác gì với **platform thread** (OS thread) về chi phí tạo/bối cảnh chuyển đổi.
2. Mô hình **thread-per-task** có gì thay đổi khi dùng virtual threads?
3. ⚠️ Gài: “Dùng virtual threads là không cần quan tâm đến concurrency nữa.” — Nhận định này sai ở đâu?
4. Khái niệm **carrier thread** là gì? Virtual thread “chạy” trên carrier như thế nào?
5. Các trường hợp sử dụng phù hợp nhất của virtual threads (I/O-bound, RPC, DB…).

---

## 2) Lập lịch & cơ chế treo/đánh thức

1. Cơ chế **mount/unmount** của virtual thread là gì? Khi nào unmount diễn ra?
2. Virtual threads được lập lịch bởi ai (JVM scheduler vs OS)? Ảnh hưởng đến fairness và preemption?
3. ⚠️ Gài: Khi nào một virtual thread **không thể** unmount khỏi carrier (bị “pinning”)? Kể ít nhất 2 tình huống.
4. Sự khác nhau giữa **blocking** trong virtual threads và **non-blocking** (NIO) truyền thống.
5. Hệ quả khi có nhiều virtual threads hơn số core rất lớn (10^5+): chi phí context-switch, memory footprint.

---

## 3) API cốt lõi & cách khởi tạo

1. Cách tạo virtual thread trực tiếp bằng `Thread.ofVirtual().start(...)` và `Thread.startVirtualThread(...)`.
2. `Executors.newVirtualThreadPerTaskExecutor()` hoạt động thế nào? Khác gì với `newFixedThreadPool`.
3. ⚠️ Gài: Có nên wrap `newVirtualThreadPerTaskExecutor()` bên trong một **bounded** queue để “giới hạn” số virtual threads? Tại sao có/không?
4. Các tuỳ chọn đặt tên, `ThreadFactory` cho virtual threads.
5. Cách join/cancel một virtual thread; khác biệt hành vi so với platform thread?

---

## 4) I/O & thao tác chặn (blocking)

1. Vì sao nói “blocking rẻ hơn” trên virtual threads? JVM làm gì dưới lớp để tránh chặn carrier?
2. ⚠️ Gài: Những thao tác nào **vẫn** có thể làm chặn carrier (pinning) khiến scale kém? Ví dụ với `synchronized`, native/JNI, file I/O nhất định…
3. Ảnh hưởng tới I/O mạng (socket) và DB driver truyền thống (JDBC). Cần thay đổi code không?
4. Kỹ thuật chẩn đoán khi nghi ngờ pinning (log, thread dump, flag runtime…).
5. Đối với tác vụ CPU-bound nặng, virtual threads có lợi không? Chiến lược tách pool?

---

## 5) Đồng bộ hoá & thread safety

1. Ảnh hưởng của virtual threads lên `synchronized`, `ReentrantLock`, `StampedLock`, `Semaphore`.
2. ⚠️ Gài: Vì sao khoá **monitor** (`synchronized`) có thể gây pinning lâu? Khi nào nên ưu tiên lock không gắn monitor.
3. Thiết kế **back-pressure** khi có tài nguyên hữu hạn (ví dụ connection pool): dùng semaphore/bộ giới hạn ở đâu?
4. Tương tác với `wait/notify` trên monitor khi chạy trong virtual threads.
5. Sử dụng `Thread.onSpinWait()`/spin lock trong bối cảnh virtual threads — nên hay không?

---

## 6) ThreadLocal, Scoped Values & ngữ cảnh

1. Chi phí và rủi ro của `ThreadLocal` với hàng chục nghìn virtual threads.
2. ⚠️ Gài: Thay `ThreadLocal` bằng giải pháp nào để truyền dữ liệu chỉ-đọc theo ngữ cảnh call (gợi ý: scoped values)? Ưu/nhược?
3. Tương tác giữa MDC (logging) và virtual threads: truyền/clear ngữ cảnh thế nào cho chuẩn.
4. Vấn đề “context leak” khi tái sử dụng logic giữa virtual & platform thread.

---

## 7) Structured Concurrency (tổng quan liên quan)

1. Structured concurrency giải quyết vấn đề gì khi chạy nhiều task song song?
2. Khái niệm **task scope**, cancel/propagate exceptions, deadline/shutdown.
3. ⚠️ Gài: Khi một subtask thất bại, chiến lược **fail-fast** và “collect all” khác nhau thế nào?
4. Ứng dụng thực tế: gom nhiều RPC trong một request theo structured concurrency.

---

## 8) Tích hợp với framework & kiến trúc

1. Khi tích hợp vào ứng dụng web (ví dụ servlet/HTTP server), chỗ nào nên dùng virtual threads, chỗ nào vẫn nên dùng thread pool hữu hạn?
2. ⚠️ Gài: Với ORM/JDBC + connection pool nhỏ, bật virtual threads **không** tự động tăng throughput. Vì sao?
3. Cân nhắc khi dùng virtual threads trong scheduler/background jobs.
4. Tương thích với code cũ sử dụng `CompletableFuture`/reactive: khi nào giữ reactive, khi nào chuyển về blocking + virtual threads.
5. Logging/tracing khi có hàng vạn threads: đặt tên, correlation id, giới hạn log.

---

## 9) Quan sát, debug & tối ưu

1. Cách lấy **thread dump**/stack trace khi số virtual threads rất lớn; các chỉ dấu nhận diện pinning/blocking.
2. Ảnh hưởng tới GC và heap khi có nhiều stack (ảo) cùng tồn tại; stack vùng nào lưu trữ?
3. ⚠️ Gài: Vì sao “bật virtual threads” đôi khi làm **tệ hơn**? Kể ít nhất 3 nguyên nhân (DB bottleneck, pinning, back-pressure…).
4. Chiến lược giới hạn đồng thời ở **biên tài nguyên** (DB, FS, API) thay vì hạn thread.
5. Benchmark đúng cách với virtual threads: warm-up, đo latency tail, so sánh cùng workload.

---

## 10) Mini case (thực chiến 2–5 phút/câu)

1. Chuyển một REST handler đang dùng `CompletableFuture`/non-blocking sang **blocking code** chạy trên `newVirtualThreadPerTaskExecutor()`; nêu lợi/hại, điểm cần canh chừng.
2. Dịch vụ gọi 3 API downstream: thiết kế structured concurrency để **hủy** 2 call còn lại khi 1 call fail/timeout.
3. Ứng dụng bị nghẽn do `synchronized` trong lớp `JsonCache`: đề xuất thay đổi để tránh pinning và vẫn thread-safe.
4. Kết nối DB tối đa 50; workload tạo 20k virtual threads. Thiết kế **back-pressure** để không làm timeouts dây chuyền.
5. Quy trình **chẩn đoán pinning**: bạn sẽ thu thập gì, đọc output nào, và quyết định refactor ở đâu.
