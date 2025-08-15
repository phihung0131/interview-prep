## 1) Tư duy & mục tiêu khi refactor sang phong cách hàm (functional)

1. Functional style là gì trong Java “thuần” (không framework thêm)? Mục tiêu chính khi refactor?
2. Lợi ích so với code mệnh lệnh: tính khai báo, dễ test, ít bug do trạng thái — nêu 3 lợi ích cụ thể.
3. ⚠️ Gài: “Functional style = dùng Stream ở mọi nơi.” — Nhận định này sai ở đâu?
4. Khái niệm **referential transparency** và **pure function**; đo lường “độ thuần” thực tế trong Java.
5. Khi nào **không nên** refactor sang functional? Ví dụ tác vụ CPU nặng, cấu trúc dữ liệu cần thao tác ngẫu nhiên.

---

## 2) Nhận diện “mùi” mệnh lệnh cần refactor

1. Dấu hiệu loop lồng nhau, biến tạm, cờ (flag), break/continue phức tạp.
2. Tích lũy thủ công bằng `for` + `if/else` để lọc, chuyển đổi, gom nhóm.
3. ⚠️ Gài: Sử dụng `List` trung gian nhiều bước chỉ để truyền dữ liệu giữa các vòng lặp — tại sao là code smell?
4. Cập nhật biến đếm/toán tổng toàn cục trong nhiều nhánh — rủi ro race/nhầm logic.

---

## 3) Mẫu refactor cơ bản: loop → pipeline

1. `for` lọc phần tử → `stream().filter(...)`.
2. Ánh xạ (transform) → `map(...)` / primitive streams (`mapToInt`, …) để tránh boxing.
3. Tích lũy → `reduce(...)` vs `collect(...)`: khi nào chọn cái nào?
4. ⚠️ Gài: `forEach` có thay thế được `map`/`collect` để biến đổi dữ liệu không?
5. Bỏ lồng nhau → `flatMap(...)`: ví dụ danh sách các danh sách.
6. Sắp xếp → `sorted()`/`Comparator.comparing(...)`.
7. Loại trùng → `distinct()`; điều kiện để distinct làm việc đúng.
8. Lấy top-N → `sorted(...).limit(n)`; thứ tự đặt `limit` và `sorted` ảnh hưởng gì?

---

## 4) Gom nhóm, phân vùng & tạo map bằng Collectors

1. `groupingBy(key)` vs `partitioningBy(predicate)` — khác nhau và ứng dụng.
2. Kết hợp `groupingBy` với `mapping`, `counting`, `summingInt`, `maxBy`.
3. Tạo `Map` an toàn với key trùng: `toMap(key, value, mergeFn, mapSupplier)`.
4. ⚠️ Gài: Vì sao `toMap` ném `IllegalStateException` khi key trùng? Viết merge function thế nào cho đúng?
5. Thu thập vào cấu trúc cụ thể: `toCollection(LinkedList::new)`, `toSet`, `toUnmodifiableList`.

---

## 5) Xử lý điều kiện & nhánh phức tạp theo hướng khai báo

1. Thay thế `if/else` dài bằng **bộ quy tắc** (map từ điều kiện → hành động).
2. Dùng `Map<Enum, Function<...>>` hoặc `switch` expression để ánh xạ hành vi.
3. ⚠️ Gài: Lạm dụng `filter(...).findFirst().get()` có ổn không? Cách tránh `NoSuchElementException`.

---

## 6) `Optional` & loại bỏ `null` mệnh lệnh

1. Dùng `Optional` để mô hình “có/không có” thay vì `if (x != null)`.
2. Chuỗi hoá xử lý: `map`, `flatMap`, `orElse`, `orElseGet`, `orElseThrow`.
3. ⚠️ Gài: Khác nhau giữa `orElse` và `orElseGet` về **chi phí** thực thi.
4. `Optional.stream()` trong pipeline — khi nào giúp rút gọn code.

---

## 7) Trạng thái, bất biến & side-effects

1. Vì sao functional style ưu tiên **bất biến**? Giảm bug race & dễ reasoning.
2. Tránh cập nhật biến ngoài (captured state) trong lambda/stream.
3. ⚠️ Gài: Dùng `peek()` để ghi log/đếm có ổn không? Khi nào được phép dùng `peek`.
4. Thiết kế API trả **bản sao bất biến** hoặc **view không sửa**.

---

## 8) Performance & bộ nhớ khi chuyển sang functional

1. Chi phí boxing/unboxing; dùng **primitive streams** khi nào.
2. Tận dụng **short-circuit**: `anyMatch`, `allMatch`, `findFirst`.
3. ⚠️ Gài: Vì sao pipeline “nhiều `sorted()`/`distinct()`” có thể chậm hơn vòng lặp tối ưu tay?
4. Hạn chế tạo collection trung gian; ưu tiên pipeline **lazy**.
5. Khi nào cân nhắc `parallel()`? Nêu điều kiện dữ liệu/chi phí tách/bộ nhớ.

---

## 9) Debug & quan sát pipeline

1. Chiến lược tách pipeline dài thành biến đặt tên (đọc hiểu tốt hơn).
2. Dùng `peek()` đúng chỗ; thay thế bằng log tại **đầu/cuối** pipeline.
3. ⚠️ Gài: Vì sao debug bằng `forEach(System.out::println)` có thể **làm thay đổi thứ tự** hoặc gây side-effect ngoài ý muốn?

---

## 10) Functional composition & higher-order functions

1. Kết hợp `Function` với `andThen`/`compose`; `Predicate.and/or/negate`.
2. Method reference vs lambda: khi nào tăng độ rõ ràng.
3. ⚠️ Gài: Sự khác nhau về thứ tự giữa `f.andThen(g)` và `g.compose(f)` minh hoạ bằng ví dụ.
4. Xây **bộ biến đổi** có thể lắp ghép (pipeline tái sử dụng).

---

## 11) Refactor imperative → functional theo từng bước

1. Bước 1: tách logic thành **hàm thuần** nhỏ có test.
2. Bước 2: thay vòng lặp + biến tạm bằng `map/filter/collect`.
3. Bước 3: gom nhóm/phân trang/sắp xếp bằng Collectors.
4. ⚠️ Gài: “Một PR đổi toàn bộ code sang Stream” — rủi ro gì? Cách **incremental refactor**.

---

## 12) Kiểm soát lỗi & đặc tả nghiệp vụ trong functional style

1. Ngoại lệ checked trong lambda: chiến lược bọc/adapter.
2. Dùng `Optional` cho “không tìm thấy” vs dùng exception cho **lỗi nghiệp vụ**.
3. ⚠️ Gài: Bọc tất cả lỗi thành `RuntimeException` trong pipeline — mùi thiết kế gì?

---

## 13) Concurrency nhẹ nhàng với functional

1. Dùng `CompletableFuture` theo chain `thenApply/thenCompose` thay vì **callback lồng nhau**.
2. Kết hợp nhiều future: `allOf`/`anyOf`; mapping kết quả có kiểu.
3. ⚠️ Gài: Vì sao **stateful lambda** + `parallelStream` thường cho kết quả sai? Cách sửa.

---

## 14) Pattern chuyên dụng khi refactor

1. **Map-of-actions**: thay chuỗi `if/else` phân nhánh theo key.
2. **Collector tuỳ biến**: khi Collectors mặc định không đủ (kết hợp số liệu phức tạp).
3. ⚠️ Gài: Khi nào `reduce` **không phù hợp** bằng `collect` (vấn đề kết hợp/đơn vị?).
4. **Windowing/chunking**: mô phỏng theo stream API (khi chưa có API sẵn).

---

## 15) Anti-pattern cần tránh

1. Dùng stream cho task quá nhỏ/1 phần tử → overhead.
2. Lồng `stream()` trong `stream()` mà không `flatMap`.
3. ⚠️ Gài: Biến `forEach` thành nơi **mutate** collection khác → `ConcurrentModificationException`.
4. Pipeline dài khó đọc: thiếu đặt tên cho bước trung gian.

---

## 16) Testing & đảm bảo đúng chức năng sau refactor

1. Viết unit test cho các **hàm thuần** thay vì endpoint lớn.
2. Property-based testing (đầu vào ngẫu nhiên) cho `map/filter/reduce`.
3. ⚠️ Gài: So sánh kết quả **trước/sau** refactor với **golden master** — khi nào hữu ích?

---

## 17) Thiết kế API “định hướng hàm”

1. Nhận vào `Function/Predicate/Comparator` thay vì “chiến lược” hard-code.
2. Trả về **view bất biến**/`Stream` thay vì collection mutable khi phù hợp.
3. ⚠️ Gài: Trả `Stream` từ method công khai — rủi ro gì nếu caller dùng sau khi nguồn đã đóng?

---

## 18) Sử dụng cấu trúc & tính năng mới hỗ trợ functional

1. Dùng **records** cho DTO bất biến trong pipeline.
2. Pattern matching (instanceof/switch) để thay chuỗi `if/else`.
3. ⚠️ Gài: Đệ quy “functional” trong Java không có **TCO** — hệ quả, cách thay thế bằng stream/loop.

---

## 19) Migration & tooling

1. Xác định **điểm nóng** bằng profiler để chọn đoạn refactor trước.
2. So sánh micro-benchmark (JMH) **trước/sau** refactor.
3. ⚠️ Gài: Tin vào benchmark không chuẩn (thiếu warm-up, dead-code elimination) dẫn tới kết luận sai như thế nào?

---

## 20) Mini case (thực chiến 2–5 phút/câu)

1. Refactor danh sách `Order` để lấy top 10 khách theo doanh thu, bỏ các đơn `CANCELLED`, gộp theo khách, sắp xếp giảm dần.
2. Từ danh sách `User`, lấy map `domain -> số lượng email`, không phân biệt hoa/thường, loại null/trống.
3. Chuyển thuật toán đếm từ khoá trong tệp văn bản (nhiều dòng) sang pipeline: tách từ, normalize, group, top-K.
4. Biến đoạn code tạo `Map<Id, Product>` với `for` và `putIfAbsent` thành `toMap` có **merge function** đúng.
5. Refactor chuỗi `if/else` tính phí giao hàng theo khu vực & hạng thành **map-of-functions** + `switch` expression.
6. Ghép nhiều call REST song song (3 dịch vụ) bằng `CompletableFuture`: log lỗi chuẩn, timeout, và tổng hợp kết quả gọn.
7. Thay thế đoạn cập nhật `ArrayList` trong `parallelStream` gây lỗi bằng **collector** thread-safe hoặc gom về sequential ở đoạn mutate.
8. Viết **collector tuỳ biến** tính trung vị (median) cho `IntStream` — bàn về trade-off bộ nhớ/độ phức tạp.
9. Chuyển xử lý CSV: parse → validate → map DTO → group theo trạng thái → xuất thống kê, không tạo collection trung gian dư thừa.
10. So sánh hiệu năng hai phiên bản: imperative tối ưu bằng mảng vs functional bằng stream — đề xuất tiêu chí chọn.
