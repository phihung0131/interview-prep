# CS Fundamentals thường bị hỏi trong phỏng vấn (đặc biệt ở công ty châu Á)

> Ghi chú: Đây là các chủ đề OS/CS cơ bản nhưng hay bị đào sâu. Nên chuẩn bị kỹ.

---

## 1. Process vs Thread, Scheduling
- **Process vs Thread khác nhau thế nào ở mức kernel?**  
  - Không chỉ là “process có address space riêng”.  
  - Hiểu về `task_struct`, context switch cost, TLB flush, v.v.
- **Kernel context switch**  
  - Hoạt động thế nào? Những gì được save/restore?  
  - Vì sao **thread switch nhanh hơn process switch**?
- **Scheduling trong kernel (CFS – Completely Fair Scheduler)**  
  - Linux CFS phân bổ CPU dựa trên **red-black tree**.  
  - Ý nghĩa của **vruntime**?
- **System call**  
  - Cơ chế từ user space sang kernel space.  
  - Traps, syscall table, mode switch cost.

---

## 2. Memory Management
- **Virtual memory** hoạt động thế nào?
- **TLB (Translation Lookaside Buffer)**  
  - Vì sao backend engineer cần hiểu?  
  - Điều gì xảy ra khi **TLB cache miss**?
- **Page table structure (x86_64)**  
  - 4-level page table. Kernel map virtual → physical ra sao?
- **Huge pages**  
  - Lợi ích cho database/cache servers.
- **Demand paging & page fault**  
  - Khi request dữ liệu chưa có trong RAM, kernel xử lý thế nào?
- **NUMA (Non-Uniform Memory Access)**  
  - Ảnh hưởng performance microservice chạy trên nhiều socket/core.

---

## 3. Concurrency & Synchronization
- **Spinlock vs Mutex vs Semaphore**  
  - Kernel dùng khi nào?  
  - Khi nào spinlock thay vì sleep?
- **RCU (Read-Copy-Update)**  
  - Kernel dùng RCU để làm gì?  
  - Tại sao phù hợp cho read-heavy workloads?
- **Deadlock detection trong kernel**  
  - Kernel giải quyết thế nào khi 2 process giữ lock circular?

---

## 4. I/O and Storage
- **Blocking vs Non-blocking vs Async I/O**  
  - (AIO, io_uring) — Kernel xử lý syscalls như epoll, io_uring thế nào?
- **Page cache trong Linux kernel**  
  - Khi backend đọc file/DB, kernel cache dữ liệu ở đâu?
- **Write-back vs Write-through** strategy.
- **Disk scheduling**  
  - CFQ, Deadline, Noop.  
  - Ảnh hưởng đến DB/Log service.

---

## 5. Networking (backend-critical)
- **Socket API → Kernel mapping**  
  - `socket()`, `bind()`, `listen()`, `accept()` đi qua kernel thế nào?
- **Zero-copy networking**  
  - `sendfile()`, `splice()`, `mmap()` giảm copy user ↔ kernel ra sao?
- **TCP stack trong kernel**  
  - TCP state machine (SYN, ESTABLISHED, FIN).  
  - Cleanup nhiều connection (ephemeral ports, TIME_WAIT).
- **Interrupt vs Polling trong network driver**  
  - Vì sao epoll/io_uring tốt hơn busy polling?

---

## 6. Advanced Topics
- **Kernel space vs User space**  
  - Lý do tách biệt.
- **Signals**  
  - Cơ chế signal delivery (SIGKILL vs SIGTERM).
- **cgroups & namespaces**  
  - Nền tảng isolation cho Docker/K8s.
- **Huge QPS case (1M concurrent connections)**  
  - Bottleneck kernel nằm ở đâu?  
  - Tuning sysctl (`somaxconn`, `tcp_tw_reuse`, `net.core.somaxconn`) ảnh hưởng ra sao?

---
