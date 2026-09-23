# Case 3b: Batch xử lý tồn kho chạy 2 tiếng sau khi refactor do mất xử lý đa luồng (Performance — Threading)

**Bối cảnh nghiệp vụ**
Hệ thống có một tiến trình chạy định kỳ ban đêm để xử lý toàn bộ biến động tồn kho phát sinh trong ngày (đồng bộ số liệu, đối soát, tạo báo cáo tồn kho cho ngày hôm sau). Tiến trình này cần hoàn thành trước giờ ca sáng bắt đầu để đảm bảo số liệu tồn kho hiển thị đúng khi nhân viên vào ca.

**Phát hiện**
Sau một đợt refactor lại module xử lý batch này (gộp và dọn lại code cho gọn hơn), team vận hành báo tiến trình ban đêm chạy xong trễ hơn hẳn — từ khoảng 20-30 phút trước đây kéo dài lên gần 2 tiếng, có nguy cơ chưa xong khi ca sáng bắt đầu.

**Điều tra**
So sánh thời gian chạy trước và sau đợt refactor, xác nhận đúng là bắt đầu chậm từ bản deploy có đợt refactor đó. Kiểm tra lại code thay đổi, phát hiện trong quá trình dọn lại code, phần xử lý dữ liệu theo từng nhóm (được xử lý song song bằng nhiều luồng trước đây) đã vô tình bị gộp chung vào một luồng xử lý tuần tự duy nhất — có thể do lúc refactor gộp các hàm lại cho gọn, cấu hình thread pool bị bỏ sót không được truyền/áp dụng đúng nữa, khiến toàn bộ hàng nghìn nhóm dữ liệu phải xử lý lần lượt từng cái một thay vì chạy song song như thiết kế ban đầu.

**Phương án & đánh đổi**
- *Rollback về bản trước refactor*: giải quyết ngay lập tức nhưng mất hết các cải thiện code khác trong đợt refactor đó, phải làm lại từ đầu.
- *Khôi phục lại cấu hình xử lý đa luồng đúng như thiết kế ban đầu, giữ nguyên phần code đã dọn gọn*: cần xác định đúng số luồng phù hợp (không quá nhiều gây quá tải database, không quá ít không tận dụng được tốc độ).

**Quyết định & lý do**
Chọn khôi phục lại cấu hình đa luồng thay vì rollback toàn bộ, vì phần lớn thay đổi trong đợt refactor là cải thiện tốt (code sạch hơn, dễ maintain hơn) — chỉ riêng phần cấu hình luồng bị sót. Tính toán lại số luồng phù hợp dựa trên số kết nối database tối đa cho phép, tránh lặp lại kiểu lỗi ngược — chạy quá nhiều luồng làm quá tải database.

**Kết quả**
Thời gian chạy tiến trình ban đêm giảm từ gần 2 tiếng xuống còn khoảng 10 phút, khôi phục lại đúng hiệu năng ban đầu, đồng thời vẫn giữ được toàn bộ cải thiện code sạch hơn từ đợt refactor. Sau vụ này, team thêm một bước kiểm tra thời gian chạy batch vào checklist trước khi merge các thay đổi liên quan đến module xử lý hàng loạt, để tránh lặp lại.

# Case 3b: Hiệu năng Batch Job sụt giảm nghiêm trọng sau Refactor do mất cơ chế xử lý song song (Performance — Concurrency & Thread Pool Regression)

**Bối cảnh nghiệp vụ**

Trong hệ thống quản lý kho vận (WMS), hằng đêm luôn có một tiến trình Batch Job quan trọng (Nightly Inventory Reconciliation & Rollover) chạy để tổng hợp toàn bộ biến động xuất – nhập – kiểm kê trong ngày. Mục tiêu là chốt sổ tồn kho cuối ngày (End-of-Day snapshot), tính toán chênh lệch và đẩy dữ liệu sẵn sàng trước khi ca làm việc đầu tiên của sáng hôm sau bắt đầu (khoảng 6:00 AM). Nếu tiến trình này chưa chạy xong, nhân viên kho vào ca sẽ không có số liệu tồn khả dụng chính xác để mở cổng nhận đơn và xuất hàng.

**Phát hiện**

Tiến trình này trước đây vận hành ổn định trong khoảng 20–30 phút. Tuy nhiên, sau một đợt release định kỳ có bao gồm việc refactor (tái cấu trúc lại luồng xử lý và gom module cho gọn gàng hơn), team vận hành trực đêm phát hiện cảnh báo: Batch job chạy vượt quá mốc 1 tiếng, kéo dài sang gần 2 tiếng và suýt chạm ngưỡng giờ nhân viên ca sáng đăng nhập vào kho. Sự cố hiệu năng (Performance Degradation) được nâng lên mức P2 để team kỹ thuật vào cuộc khẩn cấp.

**Điều tra & Học hỏi (Root Cause Analysis)**

Khi rà soát lại Git diff của bản release kết hợp phân tích APM (Application Performance Monitoring) và số lượng thread hoạt động trên server, nguyên nhân cốt lõi được chỉ ra:

* **Nguyên nhân kỹ thuật:** Trước đợt refactor, hệ thống chia nhỏ khối lượng công việc theo từng nhóm kho/danh mục (Partitions/Chunks) và đẩy vào một `ThreadPoolExecutor` để xử lý song song trên nhiều Worker Threads.
* **Sai sót trong quá trình Refactor:** Khi dọn dẹp các hàm lồng nhau và chuyển đổi flow code (ví dụ chuyển sang dùng Stream/pipeline mới hoặc gộp service), developer đã vô tình loại bỏ tầng bất đồng bộ (`CompletableFuture` / Task Executor) hoặc gọi trực tiếp phương thức xử lý đồng bộ thay vì ủy thác cho Thread Pool.
* **Cơ chế nghẽn:** Toàn bộ hàng nghìn phân vùng dữ liệu thay vì được 8–10 threads xử lý đồng thời thì nay bị ép chạy **tuần tự (sequential execution)** trên đúng 1 main thread duy nhất. Thời gian chạy do đó bị nhân lên gấp nhiều lần đúng theo hệ số phân vùng, biến một hệ thống đa nhân thành xử lý đơn luồng.

**Phương án & Đánh đổi (Trade-offs)**

Team đã nhanh chóng đặt lên bàn cân hai hướng xử lý:

* *Phương án 1: Rollback toàn bộ đợt release về phiên bản cũ*:
*Ưu điểm:* An toàn, giải quyết ngay lập tức thời gian chạy trong đêm mà không cần suy nghĩ thêm.
*Đánh đổi:* Mất sạch toàn bộ các tính năng mới và các phần code đã được tối ưu, chuẩn hóa trong đợt refactor. Việc rollback cả bản build tiềm ẩn rủi ro xung đột dữ liệu (data migration nếu có) và team phải tốn công merge/test lại từ đầu.
* *Phương án 2: Hotfix khôi phục cơ chế xử lý đa luồng, đồng thời chuẩn hóa kích thước Thread Pool*:
*Ưu điểm:* Giữ lại toàn bộ code clean từ đợt refactor, khắc phục đúng điểm hổng duy nhất mà không gây xáo trộn codebase.
*Đánh đổi:* Cần tính toán kích thước Thread Pool thật chuẩn xác. Nếu mở quá nhiều luồng (Over-threading) sẽ gây cạn kiệt Connection Pool của Database (Database Connection Exhaustion) và CPU Thrashing; nếu quá ít luồng thì không tận dụng hết tài nguyên.

**Quyết định & Kết quả**

Team thống nhất chọn **Phương án 2 (Hotfix khôi phục song song và chuẩn hóa Thread Pool)**:

* Khôi phục cơ chế xử lý song song theo cơ chế Producer-Consumer / Parallel Chunking.
* **Quy hoạch Thread Pool gắn liền với Database Connection Pool:** Thay vì để số luồng tùy ý, team tính toán kích thước worker pool dựa trên công thức bám sát cấu hình HikariCP của DB:
$$\text{Pool Size} = \text{Core CPU} \times \left(1 + \frac{\text{Wait Time}}{\text{Compute Time}}\right)$$



Đảm bảo tổng số active connections phục vụ batch không bao giờ chiếm quá 60% tổng pool của database để chừa tài nguyên cho các job ngầm khác.
* **Kết quả:** Thời gian chạy của tiến trình giảm từ gần 2 tiếng xuống chỉ còn **khoảng 10–12 phút** (nhanh hơn cả bản trước khi refactor nhờ kết hợp code mới đã tinh gọn và số luồng được cấp phát tối ưu).
* **Bài học quy trình (Action Item):** Bổ sung **Performance Baseline Test (Benchmark test)** vào CI/CD pipeline và thêm checklist review bắt buộc: Bất kỳ thay đổi nào tác động vào code của Batch Processing đều phải có metric đo lường execution time trên môi trường Staging với khối lượng dữ liệu tương đương Production trước khi merge.

---

### Câu trả lời phỏng vấn đầy đủ (Mạch lạc, thể hiện tư duy quản trị tài nguyên)

> "Trong quá trình bảo trì hệ thống kho vận, có một sự cố hiệu năng rất đáng nhớ liên quan đến **Concurrency và Thread Management** mà em từng tham gia điều tra và xử lý cùng team sau một đợt refactor code.
> Hệ thống có một batch job chạy hằng đêm để đối soát biến động kho và chốt số liệu tồn đầu ngày cho ca sáng. Bình thường job này chỉ chạy mất khoảng 20–30 phút. Nhưng ngay sau một bản release có refactor lại module xử lý batch để dọn dẹp code, team vận hành báo động đỏ: thời gian chạy vọt lên gần 2 tiếng và có nguy cơ trễ giờ làm việc của công nhân ca sáng.
> Khi kiểm tra Git diff và profile các thread của ứng dụng, em nhận ra lỗi bắt nguồn từ việc **vô tình biến một tác vụ song song thành xử lý tuần tự (Regression from Parallel to Sequential)**. Trước đây, dữ liệu được chia theo từng phân vùng kho và đẩy vào một thread pool để xử lý đồng thời. Khi refactor, người sửa đã gom các hàm lại cho gọn nhưng vô tình bỏ sót cấu hình thread pool và gọi hàm xử lý theo dạng đồng bộ (synchronous execution). Toàn bộ khối lượng công việc khổng lồ dồn hết lên 1 thread duy nhất.
> Thay vì vội vã rollback làm mất toàn bộ các phần code sạch và tính năng mới đã deploy, team em quyết định ra một bản **hotfix khôi phục cơ chế đa luồng**, đồng thời chuẩn hóa lại cấu hình tài nguyên:
> * Đánh đổi lớn nhất khi cấu hình luồng cho batch là mối quan hệ với **Database Connection Pool**. Nếu mở quá nhiều luồng để chạy cho nhanh, các thread sẽ tranh chấp và làm cạn kiệt connection pool của DB, gây sập các dịch vụ ngầm khác.
> * Bọn em tính toán lại thread pool của batch job giới hạn ở mức an toàn, đảm bảo số kết nối DB tối đa chiếm không quá 50–60% pool của hệ thống.
> 
> 
> Sau khi hotfix, tiến trình chạy từ 2 tiếng giảm sâu xuống chỉ còn **10 phút**. Sự cố này giúp em rút ra bài học sâu sắc: Khi refactor code, 'clean code' là chưa đủ, mà luôn phải bảo toàn các thuộc tính phi chức năng (Non-Functional Requirements) như throughput và concurrency. Sau case đó, team em đã đưa thêm bước Performance Smoke Test vào CI/CD pipeline cho các job xử lý hàng loạt."

---

### Các câu hỏi Interviewer có thể đào sâu tiếp & Hướng trả lời

#### 1. "Em tính toán số lượng Thread (Core Pool Size / Max Pool Size) cho batch job này dựa trên tiêu chí nào?"

* **Gợi ý trả lời:**
"Dạ, việc xác định số thread phụ thuộc vào bản chất tác vụ là **CPU-bound** hay **I/O-bound**:
* Tác vụ đối soát kho này bản chất là **I/O-bound** (phần lớn thời gian là chờ câu lệnh SQL đọc/ghi DB hoặc gọi API mạng).
* Công thức chuẩn thường dùng là: $\text{Số Thread} = \text{Số CPU Core} \times (1 + \frac{\text{I/O Wait Time}}{\text{CPU Compute Time}})$.
* Tuy nhiên, trong thực tế, nút thắt cổ chai không nằm ở CPU của ứng dụng mà nằm ở **Database Connection Pool (ví dụ HikariCP)**. Mỗi worker thread khi xử lý 1 chunk dữ liệu thường giữ 1 DB connection. Do đó, em giới hạn số thread của pool luôn nhỏ hơn số idle connection sẵn có của DB pool (ví dụ DB pool có 30 connections, em cấp cho batch pool tối đa 10–12 threads) để tránh gây hiện tượng `Connection Timeout` cho các tiến trình khác."



#### 2. "Nếu trong lúc 10 threads đang chạy song song, có 1-2 thread bị văng lỗi (Exception) thì em kiểm soát transaction và dữ liệu thế nào để không bị lỗi dở dang (partial failure)?"

* **Gợi ý trả lời:**
"Hệ thống áp dụng mô hình **Chunk-based Processing** độc lập:
* Mỗi thread nhận một chunk/partition riêng biệt và toàn bộ thao tác ghi dữ liệu của chunk đó được bao bọc trong một **Local DB Transaction**.
* Nếu một thread bị lỗi (ví dụ ngoại lệ dữ liệu sai), transaction của riêng chunk đó sẽ rollback và bản ghi lỗi được lưu vào bảng `batch_error_log` hoặc Dead Letter Queue (DLQ) để xử lý sau.
* Các thread khác vẫn tiếp tục commit bình thường. Khi kết thúc batch, hệ thống tổng hợp trạng thái: nếu có lỗi thì gửi alert và gắn trạng thái `COMPLETED_WITH_SKIPPED` để team vận hành biết rõ những bản ghi nào cần can thiệp thủ công mà không làm nghẽn toàn bộ tiến trình."



#### 3. "Tại sao không dùng luôn `@Async` của Spring Boot hay `parallelStream()` của Java cho nhanh mà lại phải tự cấu hình một ThreadPool riêng?"

* **Gợi ý trả lời:**
"Dạ, dùng hai thứ đó trong các batch job tải nặng rất nguy hiểm:
* `parallelStream()` mặc định dùng chung **ForkJoinPool.commonPool()** của toàn bộ JVM. Nếu batch job chiếm dụng hết pool này, tất cả các tác vụ khác trong ứng dụng cần dùng parallelStream sẽ bị nghẽn (starvation).
* `@Async` nếu không chỉ định rõ bean `Executor` thì Spring có thể dùng pool mặc định không giới hạn queue (dễ dẫn tới `OutOfMemoryError` khi dữ liệu lớn).
* Vì vậy, nguyên tắc tốt nhất là luôn khai báo một **Custom ThreadPoolExecutor** độc lập dành riêng cho batch job, có cấu hình rõ ràng: `CorePoolSize`, `MaxPoolSize`, `ArrayBlockingQueue` có giới hạn (Bounded Queue) và chính sách xử lý khi quá tải (như `CallerRunsPolicy` để tự động giảm tốc độ nạp việc khi hàng đợi đầy)."

### Câu trả lời phỏng vấn (STAR — case thread pool regression, tham gia trực tiếp)

> "Có một sự cố về hiệu năng khá nhớ mà em tham gia trực tiếp xử lý cùng team, xảy ra ngay sau một đợt refactor code.

> Hệ thống có một batch job chạy vào ban đêm để tổng hợp lại toàn bộ biến động tồn kho trong ngày — nhập, xuất, kiểm kê — rồi chốt số liệu để sáng hôm sau nhân viên ca sáng có số tồn đúng khi bắt đầu làm việc. Bình thường job này chỉ chạy khoảng 20-30 phút là xong. Nhưng sau một bản release có đợt refactor lại module xử lý batch — dọn dẹp code cho gọn hơn — thì team trực đêm báo lên là job chạy gần 2 tiếng mới xong, có nguy cơ chưa kịp trước giờ ca sáng vào.

> Em cùng team soát lại thì so sánh thời gian chạy trước và sau bản release đó, xác nhận đúng là bắt đầu chậm từ lúc deploy bản có refactor. Nhìn vào code thay đổi thì phát hiện ra vấn đề: trước đây phần xử lý dữ liệu được chia theo từng nhóm kho/danh mục và chạy song song bằng nhiều luồng. Nhưng trong lúc refactor, lúc gom các hàm lại cho gọn, không rõ vô tình thế nào mà phần cấu hình xử lý đa luồng đó bị bỏ sót, không còn được áp dụng đúng nữa — kết quả là toàn bộ hàng nghìn nhóm dữ liệu, đáng lẽ được nhiều luồng xử lý cùng lúc, giờ lại bị dồn hết chạy tuần tự trên một luồng duy nhất. Nên thời gian chạy mới bị nhân lên gấp nhiều lần như vậy.

> Lúc đó team cũng cân nhắc là rollback về bản cũ cho nhanh, nhưng như vậy sẽ mất hết các cải thiện code khác trong đợt refactor, phải làm lại từ đầu. Nên bọn em chọn hướng khôi phục lại đúng cấu hình xử lý song song như thiết kế ban đầu, còn phần code đã dọn gọn thì vẫn giữ nguyên. Cái khó là phải tính lại cho đúng số luồng chạy song song bao nhiêu là hợp lý — nếu chạy quá nhiều luồng cùng lúc thì lại làm quá tải kết nối tới database, còn quá ít thì không tận dụng được tốc độ, coi như quay lại vấn đề cũ.

> Sau khi tính toán lại và áp dụng, thời gian chạy job giảm từ gần 2 tiếng xuống chỉ còn khoảng 10 phút — nhanh hơn cả trước khi refactor, vì vừa giữ được code gọn hơn vừa cấu hình luồng đúng lại. Sau vụ đó, team cũng thêm một bước kiểm tra thời gian chạy của các batch job quan trọng vào checklist trước khi merge, để tránh lặp lại kiểu lỗi âm thầm như vậy."

---

**Vài lưu ý khi trình bày:**
- Phần **"không rõ vô tình thế nào"** là cách nói an toàn khi bạn không chắc chi tiết kỹ thuật chính xác gây mất luồng (do gộp hàm, do config bị đè, do đổi sang cách gọi khác...) — không cần khẳng định chắc nịch nếu không nhớ rõ.
- Nếu bị hỏi **"vậy làm sao biết số luồng bao nhiêu là hợp lý?"** — nếu bạn không nhớ công thức cụ thể, có thể trả lời tự nhiên: "Bọn em tính dựa theo số kết nối database tối đa cho phép, để đảm bảo batch job không chiếm hết pool kết nối, ảnh hưởng tới các job hay service khác đang chạy song song." — không cần nói công thức toán học nếu không tự tin giải thích khi bị hỏi sâu.
- Nếu bị hỏi **"sao không rollback cho an toàn"** — câu trả lời sẵn có trong bài đã hợp lý: giữ lại phần cải thiện tốt, chỉ sửa đúng chỗ bị lỗi.
- Nếu bị hỏi sâu về cơ chế thread pool (core size, queue, exception handling khi 1 thread lỗi) mà không nắm chắc, nên thành thật: "Phần cấu hình chi tiết lúc đó là cả team cùng bàn và chỉnh, em nhớ hướng chính là dựa vào số kết nối DB cho phép, còn con số cụ thể thì lâu rồi em không nhớ chính xác."