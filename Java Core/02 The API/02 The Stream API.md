## 1) Tổng quan Stream API

1. Stream API trong Java là gì? Khác gì với `java.io.Stream` và với **Collection API**?
2. Ưu điểm khi xử lý dữ liệu bằng Stream so với vòng lặp for truyền thống.
3. ⚠️ Gài: Stream có lưu trữ dữ liệu không? Khi nào dữ liệu thực sự được xử lý?
4. Khác nhau giữa **internal iteration** (Stream) và **external iteration** (for-each).
5. Các loại stream: `Stream<T>`, `IntStream`, `LongStream`, `DoubleStream` — khi nào nên dùng stream nguyên thủy.
6. Nguồn dữ liệu (source) của stream có thể là những gì?
7. Stream có thể tái sử dụng không? Tại sao?

---

## 2) Luồng xử lý (Pipeline) & tính chất

1. Một pipeline Stream gồm các bước nào? (source → intermediate → terminal).
2. **Intermediate operation**: đặc điểm lazy, ví dụ `map`, `filter`, `sorted`, `distinct`, `limit`, `skip`.
3. **Terminal operation**: đặc điểm eager, ví dụ `forEach`, `collect`, `reduce`, `count`, `min`, `max`.
4. ⚠️ Gài: Khi nào intermediate operation thực sự được thực thi?
5. Side-effect là gì trong Stream? Khi nào nên tránh?
6. Sự khác nhau giữa `forEach()` và `forEachOrdered()`.

---

## 3) Tạo Stream

1. Các cách tạo stream từ collection, array, file, generator, builder, primitive ranges.
2. `Stream.of()` vs `Arrays.stream()` khác gì về hiệu năng và null handling?
3. `Stream.generate()` và `Stream.iterate()` khác nhau gì? Có nguy cơ gì nếu không giới hạn?
4. ⚠️ Gài: `List.stream()` vs `List.parallelStream()` khác nhau thế nào về thực thi?

---

## 4) Intermediate Operations – thao tác trung gian

1. `map()` vs `flatMap()` khác nhau thế nào? Use case điển hình của `flatMap()`.
2. `filter()` — predicate là gì, side-effect trong predicate gây hậu quả gì?
3. `distinct()` hoạt động dựa vào phương thức nào của object?
4. `sorted()` không truyền comparator thì sắp xếp thế nào?
5. `peek()` khác gì `map()`? Khi nào nên dùng `peek()` để debug?
6. ⚠️ Gài: `limit()` + `sorted()` thứ tự đặt ảnh hưởng thế nào tới kết quả và hiệu năng?

---

## 5) Terminal Operations – thao tác kết thúc

1. `collect()` là gì? Phân biệt `Collectors.toList()`, `toSet()`, `toMap()`, `joining()`.
2. `reduce()` dùng để làm gì? Khác biệt giữa reduce có identity và không có identity.
3. `min()`/`max()` yêu cầu gì về comparator hoặc comparable?
4. ⚠️ Gài: `forEach()` có đảm bảo thứ tự không?
5. Khác nhau giữa `count()` và `collect(Collectors.counting())`.
6. `allMatch()`, `anyMatch()`, `noneMatch()` — điểm khác nhau về short-circuit.
7. Sau khi gọi terminal operation, Stream còn dùng được không?

---

## 6) Parallel Stream

1. Khi nào nên dùng `parallelStream()`? Những tình huống không nên dùng.
2. Nguyên lý hoạt động của parallel stream (ForkJoinPool, common pool).
3. ⚠️ Gài: Parallel stream có luôn nhanh hơn stream tuần tự không? Vì sao?
4. Vấn đề thread-safety khi dùng parallel stream với cấu trúc dữ liệu mutable.
5. Cách giới hạn số thread trong parallel stream.

---

## 7) Collectors nâng cao

1. `groupingBy()` và `partitioningBy()` khác nhau thế nào?
2. Kết hợp `groupingBy()` với `mapping()`, `counting()`, `summingInt()`.
3. `joining()` — cách nối chuỗi với delimiter, prefix, suffix.
4. `toMap()` — xử lý khi key trùng (`mergeFunction`) và cách chỉ định `Map` implementation.
5. ⚠️ Gài: Dùng `toMap()` với key trùng mà không merge sẽ gây exception gì?

---

## 8) Optional và Stream

1. Tại sao một số method như `findFirst()`/`findAny()` trả về `Optional`?
2. ⚠️ Gài: `findFirst()` và `findAny()` khác gì trong stream tuần tự và song song?
3. Cách xử lý giá trị không tồn tại trong Optional (`orElse`, `orElseGet`, `orElseThrow`).

---

## 9) Stream & Map (Java 8+)

1. Stream các entry trong Map: `map.entrySet().stream()` — khi nào cần `forEach()` vs `collect()`.
2. `Map.forEach()` khác gì với stream `forEach()`.
3. ⚠️ Gài: `map.keySet().stream()` thay đổi key trong khi iterate có an toàn không?

---

## 10) Các lỗi thường gặp & hiệu năng

1. Dùng stream cho tác vụ quá nhỏ — vì sao có thể chậm hơn for-loop.
2. Sử dụng nhiều `sorted()` liên tiếp — tác động tới hiệu năng.
3. ⚠️ Gài: Tại sao dùng `parallelStream()` để update `ArrayList` có thể gây `ConcurrentModificationException` hoặc dữ liệu sai?
4. Gọi `stream()` nhiều lần trên cùng source tốn kém ở đâu?
5. Lạm dụng `peek()` để mutate object — rủi ro về side-effect và tính predictability.

---

## 11) Mini case (thực chiến)

1. Tìm top 5 sản phẩm có doanh thu cao nhất từ danh sách orders với Stream API.
2. Gom nhóm sinh viên theo lớp và tính điểm trung bình từng lớp.
3. Từ một danh sách câu, tách ra tất cả từ, loại bỏ trùng, sắp xếp alphabet.
4. Tìm user đầu tiên có quyền ADMIN trong danh sách (ưu tiên tốc độ).
5. Chuyển danh sách `List<List<String>>` thành một list phẳng không trùng lặp, viết bằng 1 dòng stream.
6. Đếm số email domain khác nhau từ danh sách người dùng.