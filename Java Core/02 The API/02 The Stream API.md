## 1) Tổng quan Stream API

### 1. Stream API trong Java là gì? Khác gì với `java.io.Stream` và với **Collection API**?
- **Trả lời**:
    - **Stream API**: Gói `java.util.stream` (Java 8+), xử lý dữ liệu theo cách khai báo, hỗ trợ pipeline (map, filter, reduce).
    - **Khác với `java.io.Stream`**:
        - `java.io.Stream`: Xử lý luồng byte/character (file, network).
        - Stream API: Xử lý tập hợp dữ liệu (collection, array).
    - **Khác với Collection API**:
        - Collection lưu trữ dữ liệu, hỗ trợ add/remove.
        - Stream API xử lý dữ liệu, không lưu trữ, tập trung vào pipeline.
    - **Ví dụ**:
      ```java
      List<String> list = List.of("a", "b");
      list.stream().filter(s -> s.startsWith("a")).forEach(System.out::println);
      ```

### 2. Ưu điểm khi xử lý dữ liệu bằng Stream so với vòng lặp for truyền thống.
- **Trả lời**:
    - **Khai báo**: Mô tả “cái gì” thay vì “làm thế nào”, dễ đọc.
    - **Tính ngắn gọn**: Pipeline thay thế nhiều dòng code lặp.
    - **Song song hóa**: Dễ dùng `parallelStream()` cho đa luồng.
    - **Không side-effects**: Khuyến khích hàm thuần, giảm lỗi.
    - **Ví dụ**:
      ```java
      // For loop
      List<String> filtered = new ArrayList<>();
      for (String s : list) if (s.length() > 1) filtered.add(s);
      // Stream
      List<String> filtered = list.stream().filter(s -> s.length() > 1).toList();
      ```

### 3. ⚠️ Gài: Stream có lưu trữ dữ liệu không? Khi nào dữ liệu thực sự được xử lý?
- **Trả lời**:
    - **Không lưu trữ**: Stream chỉ là pipeline xử lý, không giữ dữ liệu.
    - **Xử lý**: Khi gọi **terminal operation** (ví dụ: `collect`, `forEach`).
    - **Ví dụ**:
      ```java
      Stream<String> stream = list.stream().filter(s -> s.length() > 1); // Lazy, chưa xử lý
      List<String> result = stream.toList(); // Eager, xử lý
      ```

### 4. Khác nhau giữa **internal iteration** (Stream) và **external iteration** (for-each).
- **Trả lời**:
    - **Internal iteration** (Stream): Stream API tự quản lý duyệt, hỗ trợ lazy và song song.
    - **External iteration** (for-each): Người viết code điều khiển duyệt, tường minh.
    - **Ví dụ**:
      ```java
      // External
      for (String s : list) System.out.println(s);
      // Internal
      list.stream().forEach(System.out::println);
      ```

### 5. Các loại stream: `Stream<T>`, `IntStream`, `LongStream`, `DoubleStream` — khi nào nên dùng stream nguyên thủy.
- **Trả lời**:
    - **`Stream<T>`**: Dùng cho đối tượng bất kỳ.
    - **Stream nguyên thủy** (`IntStream`, `LongStream`, `DoubleStream`): Dùng cho số nguyên, dài, thực để tránh boxing/unboxing, tăng hiệu năng.
    - **Ví dụ**:
      ```java
      // Boxing
      Stream<Integer> stream = Stream.of(1, 2, 3);
      // No boxing
      IntStream intStream = IntStream.of(1, 2, 3);
      ```

### 6. Nguồn dữ liệu (source) của stream có thể là những gì?
- **Trả lời**:
    - Collection (`List`, `Set`): `list.stream()`.
    - Array: `Arrays.stream(array)`.
    - File: `Files.lines(path)`.
    - Generator: `Stream.generate()`, `Stream.iterate()`.
    - Builder: `Stream.builder()`.
    - Range: `IntStream.range(0, 10)`.
    - **Ví dụ**:
      ```java
      Stream<String> fromFile = Files.lines(Path.of("file.txt"));
      ```

### 7. Stream có thể tái sử dụng không? Tại sao?
- **Trả lời**:
    - **Không**: Stream chỉ dùng một lần, sau terminal operation thì đóng.
    - **Lý do**: Stream là pipeline tạm thời, trạng thái bị tiêu thụ.
    - **Ví dụ**:
      ```java
      Stream<String> stream = list.stream();
      stream.toList(); // OK
      stream.forEach(System.out::println); // IllegalStateException
      ```

---

## 2) Luồng xử lý (Pipeline) & tính chất

### 1. Một pipeline Stream gồm các bước nào? (source → intermediate → terminal).
- **Trả lời**:
    - **Source**: Nguồn dữ liệu (collection, array, file).
    - **Intermediate**: Thao tác trung gian (lazy, ví dụ: `filter`, `map`).
    - **Terminal**: Thao tác kết thúc (eager, ví dụ: `collect`, `forEach`).
    - **Ví dụ**:
      ```java
      list.stream() // Source
          .filter(s -> s.length() > 1) // Intermediate
          .toList(); // Terminal
      ```

### 2. **Intermediate operation**: đặc điểm lazy, ví dụ `map`, `filter`, `sorted`, `distinct`, `limit`, `skip`.
- **Trả lời**:
    - **Lazy**: Không xử lý cho đến khi terminal operation được gọi.
    - **Ví dụ**:
        - `map`: Biến đổi phần tử.
        - `filter`: Lọc theo điều kiện.
        - `sorted`: Sắp xếp.
        - `distinct`: Loại bỏ trùng lặp.
        - `limit`/`skip`: Giới hạn/bỏ qua phần tử.
    - **Ví dụ**:
      ```java
      Stream<String> stream = list.stream().filter(s -> s.length() > 1).map(String::toUpperCase); // Lazy
      ```

### 3. **Terminal operation**: đặc điểm eager, ví dụ `forEach`, `collect`, `reduce`, `count`, `min`, `max`.
- **Trả lời**:
    - **Eager**: Kích hoạt xử lý toàn pipeline, trả kết quả.
    - **Ví dụ**:
        - `forEach`: Thực hiện hành động.
        - `collect`: Thu thập vào collection.
        - `reduce`: Tích lũy thành một giá trị.
        - `count`, `min`, `max`: Tính số lượng, min/max.
    - **Ví dụ**:
      ```java
      long count = list.stream().filter(s -> s.length() > 1).count(); // Eager
      ```

### 4. ⚠️ Gài: Khi nào intermediate operation thực sự được thực thi?
- **Trả lời**:
    - **Khi**: Terminal operation được gọi.
    - **Lý do**: Intermediate operations là lazy, chỉ định nghĩa pipeline.
    - **Ví dụ**:
      ```java
      list.stream().filter(s -> { System.out.println("Filtering"); return s.length() > 1; }); // Không in
      list.stream().filter(s -> { System.out.println("Filtering"); return s.length() > 1; }).toList(); // In
      ```

### 5. Side-effect là gì trong Stream? Khi nào nên tránh?
- **Trả lời**:
    - **Side-effect**: Thay đổi trạng thái ngoài stream (ví dụ: sửa collection, ghi log).
    - **Tránh khi**: Cần tính thuần (pure function) hoặc dùng `parallelStream` (gây race condition).
    - **Ví dụ**:
      ```java
      // Xấu
      List<String> side = new ArrayList<>();
      list.stream().forEach(s -> side.add(s)); // Side-effect
      // Tốt
      List<String> result = list.stream().toList();
      ```

### 6. Sự khác nhau giữa `forEach()` và `forEachOrdered()`.
- **Trả lời**:
    - **`forEach()`**: Không đảm bảo thứ tự trong `parallelStream`.
    - **`forEachOrdered()`**: Đảm bảo thứ tự nguồn, nhưng giảm hiệu năng song song.
    - **Ví dụ**:
      ```java
      list.parallelStream().forEach(System.out::println); // Thứ tự ngẫu nhiên
      list.parallelStream().forEachOrdered(System.out::println); // Thứ tự gốc
      ```

---

## 3) Tạo Stream

### 1. Các cách tạo stream từ collection, array, file, generator, builder, primitive ranges.
- **Trả lời**:
    - **Collection**: `list.stream()`.
    - **Array**: `Arrays.stream(array)`.
    - **File**: `Files.lines(path)`.
    - **Generator**: `Stream.generate(Supplier)`, `Stream.iterate(seed, next)`.
    - **Builder**: `Stream.builder().add(...).build()`.
    - **Primitive ranges**: `IntStream.range(0, 10)`.
    - **Ví dụ**:
      ```java
      Stream<String> fromList = List.of("a", "b").stream();
      IntStream range = IntStream.range(0, 5);
      ```

### 2. `Stream.of()` vs `Arrays.stream()` khác gì về hiệu năng và null handling?
- **Trả lời**:
    - **`Stream.of()`**: Tạo stream từ varargs, không xử lý mảng lớn hiệu quả, không chấp nhận `null` trực tiếp.
    - **`Arrays.stream()`**: Tối ưu cho mảng, hỗ trợ primitive streams, xử lý `null` trong mảng.
    - **Ví dụ**:
      ```java
      Stream<String> s1 = Stream.of("a", "b");
      Stream<String> s2 = Arrays.stream(new String[]{"a", "b"});
      ```

### 3. `Stream.generate()` và `Stream.iterate()` khác nhau gì? Có nguy cơ gì nếu không giới hạn?
- **Trả lời**:
    - **`Stream.generate()`**: Tạo stream vô hạn từ `Supplier`, mỗi phần tử độc lập.
    - **`Stream.iterate()`**: Tạo stream từ seed và hàm chuyển đổi, phụ thuộc phần tử trước.
    - **Nguy cơ**: Vô hạn nếu không dùng `limit`, gây tràn bộ nhớ.
    - **Ví dụ**:
      ```java
      Stream.generate(() -> "a").limit(5); // "a", "a", ...
      Stream.iterate(1, n -> n + 1).limit(5); // 1, 2, 3, ...
      ```

### 4. ⚠️ Gài: `List.stream()` vs `List.parallelStream()` khác nhau thế nào về thực thi?
- **Trả lời**:
    - **`List.stream()`**: Tuần tự, xử lý trên một thread.
    - **`List.parallelStream()`**: Song song, dùng ForkJoinPool, chia dữ liệu thành nhiều thread.
    - **Lưu ý**: `parallelStream` không luôn nhanh hơn, phụ thuộc dữ liệu và tác vụ.
    - **Ví dụ**:
      ```java
      list.parallelStream().forEach(System.out::println); // Song song
      ```

---

## 4) Intermediate Operations – thao tác trung gian

### 1. `map()` vs `flatMap()` khác nhau thế nào? Use case điển hình của `flatMap()`.
- **Trả lời**:
    - **`map()`**: Biến đổi 1:1 (mỗi phần tử thành một kết quả).
    - **`flatMap()`**: Biến đổi 1:nhiều, làm phẳng stream lồng nhau.
    - **Use case `flatMap()`**: Làm phẳng danh sách lồng nhau, xử lý Optional.
    - **Ví dụ**:
      ```java
      // map
      List<String> upper = list.stream().map(String::toUpperCase).toList();
      // flatMap
      List<String> flat = lists.stream().flatMap(List::stream).toList();
      ```

### 2. `filter()` — predicate là gì, side-effect trong predicate gây hậu quả gì?
- **Trả lời**:
    - **Predicate**: Hàm trả về `boolean` để lọc.
    - **Side-effect trong predicate**: Gây lỗi trong `parallelStream` (race condition), làm code khó dự đoán.
    - **Ví dụ**:
      ```java
      // Xấu
      List<String> side = new ArrayList<>();
      list.stream().filter(s -> { side.add(s); return true; }); // Side-effect
      ```

### 3. `distinct()` hoạt động dựa vào phương thức nào của object?
- **Trả lời**:
    - **Dựa trên**: `equals()` và `hashCode()` để xác định trùng lặp.
    - **Ví dụ**:
      ```java
      List<String> unique = list.stream().distinct().toList();
      ```

### 4. `sorted()` không truyền comparator thì sắp xếp thế nào?
- **Trả lời**:
    - **Sắp xếp**: Theo thứ tự tự nhiên (`Comparable` của phần tử).
    - **Yêu cầu**: Phần tử phải implement `Comparable`.
    - **Ví dụ**:
      ```java
      List<String> sorted = list.stream().sorted().toList(); // String implements Comparable
      ```

### 5. `peek()` khác gì `map()`? Khi nào nên dùng `peek()` để debug?
- **Trả lời**:
    - **`peek()`**: Không biến đổi, dùng để debug/log, trả stream gốc.
    - **`map()`**: Biến đổi phần tử, trả stream mới.
    - **Dùng `peek()`**: Khi cần log trạng thái trong pipeline.
    - **Ví dụ**:
      ```java
      list.stream().peek(System.out::println).map(String::toUpperCase).toList();
      ```

### 6. ⚠️ Gài: `limit()` + `sorted()` thứ tự đặt ảnh hưởng thế nào tới kết quả và hiệu năng?
- **Trả lời**:
    - **`sorted().limit(n)`**: Sắp xếp toàn bộ, rồi lấy N phần tử đầu. Chậm hơn nếu dữ liệu lớn.
    - **`limit(n).sorted()`**: Lấy N phần tử đầu, rồi sắp xếp. Nhanh hơn, nhưng kết quả khác.
    - **Ví dụ**:
      ```java
      // sorted -> limit
      List<Integer> result1 = numbers.stream().sorted().limit(5).toList(); // Top 5 nhỏ nhất
      // limit -> sorted
      List<Integer> result2 = numbers.stream().limit(5).sorted().toList(); // 5 phần tử đầu, sắp xếp
      ```

---

## 5) Terminal Operations – thao tác kết thúc

### 1. `collect()` là gì? Phân biệt `Collectors.toList()`, `toSet()`, `toMap()`, `joining()`.
- **Trả lời**:
    - **`collect()`**: Thu thập kết quả thành collection hoặc giá trị.
    - **`Collectors.toList()`**: Tạo `List`.
    - **`toSet()`**: Tạo `Set` (loại trùng lặp).
    - **`toMap()`**: Tạo `Map` từ key-value, cần xử lý key trùng.
    - **`joining()`**: Nối chuỗi từ stream.
    - **Ví dụ**:
      ```java
      List<String> list = stream.collect(Collectors.toList());
      String joined = stream.collect(Collectors.joining(", "));
      ```

### 2. `reduce()` dùng để làm gì? Khác biệt giữa reduce có identity và không có identity.
- **Trả lời**:
    - **`reduce()`**: Tích lũy thành một giá trị (tổng, max).
    - **Có identity**: Trả kết quả mặc định nếu stream rỗng.
    - **Không identity**: Trả `Optional` nếu stream rỗng.
    - **Ví dụ**:
      ```java
      int sum = numbers.stream().reduce(0, Integer::sum); // Có identity
      Optional<Integer> sumOpt = numbers.stream().reduce(Integer::sum); // Không identity
      ```

### 3. `min()`/`max()` yêu cầu gì về comparator hoặc comparable?
- **Trả lời**:
    - **Yêu cầu**: Phần tử phải implement `Comparable` hoặc cung cấp `Comparator`.
    - **Ví dụ**:
      ```java
      Optional<String> min = list.stream().min(Comparator.naturalOrder());
      ```

### 4. ⚠️ Gài: `forEach()` có đảm bảo thứ tự không?
- **Trả lời**:
    - **Không**: Trong `parallelStream`, `forEach()` không đảm bảo thứ tự.
    - **Khắc phục**: Dùng `forEachOrdered()` nếu cần thứ tự.
    - **Ví dụ**:
      ```java
      list.parallelStream().forEach(System.out::println); // Ngẫu nhiên
      ```

### 5. Khác nhau giữa `count()` và `collect(Collectors.counting())`.
- **Trả lời**:
    - **`count()`**: Phương thức trực tiếp, trả `long`.
    - **`Collectors.counting()`**: Collector, dùng trong `collect` cho pipeline phức tạp.
    - **Ví dụ**:
      ```java
      long count = list.stream().count();
      long count2 = list.stream().collect(Collectors.counting());
      ```

### 6. `allMatch()`, `anyMatch()`, `noneMatch()` — điểm khác nhau về short-circuit.
- **Trả lời**:
    - **`allMatch()`**: Trả `true` nếu tất cả thỏa predicate, dừng khi gặp `false`.
    - **`anyMatch()`**: Trả `true` nếu một phần tử thỏa, dừng khi tìm thấy.
    - **`noneMatch()`**: Trả `true` nếu không phần tử nào thỏa, dừng khi gặp `true`.
    - **Ví dụ**:
      ```java
      boolean hasEven = numbers.stream().anyMatch(n -> n % 2 == 0); // Short-circuit
      ```

### 7. Sau khi gọi terminal operation, Stream còn dùng được không?
- **Trả lời**:
    - **Không**: Stream bị đóng sau terminal operation.
    - **Khắc phục**: Tạo stream mới từ nguồn.
    - **Ví dụ**:
      ```java
      Stream<String> stream = list.stream();
      stream.toList();
      stream.count(); // IllegalStateException
      ```

---

## 6) Parallel Stream

### 1. Khi nào nên dùng `parallelStream()`? Những tình huống không nên dùng.
- **Trả lời**:
    - **Nên dùng**:
        - Dữ liệu lớn (nghìn phần tử trở lên).
        - Tác vụ CPU-bound, độc lập.
    - **Không nên dùng**:
        - Dữ liệu nhỏ (overhead lớn).
        - Tác vụ I/O-bound.
        - Có side-effects hoặc trạng thái mutable.
    - **Ví dụ**:
      ```java
      list.parallelStream().map(this::heavyComputation).toList();
      ```

### 2. Nguyên lý hoạt động của parallel stream (ForkJoinPool, common pool).
- **Trả lời**:
    - **ForkJoinPool**: Framework chia-ghép để xử lý song song.
    - **Common pool**: Pool mặc định, số thread dựa trên CPU cores.
    - **Cơ chế**: Chia dữ liệu thành chunk, xử lý song song, gộp kết quả.
    - **Ví dụ**:
      ```java
      ForkJoinPool.commonPool(); // Pool mặc định
      ```

### 3. ⚠️ Gài: Parallel stream có luôn nhanh hơn stream tuần tự không? Vì sao?
- **Trả lời**:
    - **Không**: Overhead của chia tách/gộp, thread coordination.
    - **Lý do**:
        - Dữ liệu nhỏ: Overhead lớn hơn lợi ích.
        - I/O-bound: Chờ I/O làm chậm.
        - Side-effects: Gây lỗi hoặc race condition.
    - **Ví dụ**:
      ```java
      // Chậm với dữ liệu nhỏ
      List.of(1, 2, 3).parallelStream().map(n -> n * 2).toList();
      ```

### 4. Vấn đề thread-safety khi dùng parallel stream với cấu trúc dữ liệu mutable.
- **Trả lời**:
    - **Vấn đề**: Race condition khi nhiều thread cập nhật mutable data.
    - **Khắc phục**: Dùng collector thread-safe hoặc tránh side-effects.
    - **Ví dụ**:
      ```java
      // Xấu
      List<Integer> result = new ArrayList<>();
      numbers.parallelStream().forEach(result::add); // Race condition
      // Tốt
      List<Integer> result = numbers.parallelStream().collect(Collectors.toList());
      ```

### 5. Cách giới hạn số thread trong parallel stream.
- **Trả lời**:
    - Dùng custom `ForkJoinPool` hoặc thiết lập system property.
    - **Ví dụ**:
      ```java
      ForkJoinPool pool = new ForkJoinPool(4);
      List<String> result = pool.submit(() -> list.parallelStream().map(String::toUpperCase).toList()).get();
      // Hoặc
      System.setProperty("java.util.concurrent.ForkJoinPool.common.parallelism", "4");
      ```

---

## 7) Collectors nâng cao

### 1. `groupingBy()` và `partitioningBy()` khác nhau thế nào?
- **Trả lời**:
    - **`groupingBy()`**: Gom nhóm theo key bất kỳ, tạo `Map<K, List<T>>`.
    - **`partitioningBy()`**: Chia thành 2 nhóm (`true`/`false`) theo predicate.
    - **Ví dụ**:
      ```java
      Map<String, List<User>> byName = users.stream().collect(Collectors.groupingBy(User::getName));
      Map<Boolean, List<User>> byAge = users.stream().collect(Collectors.partitioningBy(u -> u.getAge() > 18));
      ```

### 2. Kết hợp `groupingBy()` với `mapping()`, `counting()`, `summingInt()`.
- **Trả lời**:
  ```java
  Map<String, Long> nameCount = users.stream()
      .collect(Collectors.groupingBy(User::getName, Collectors.counting()));
  Map<String, List<Integer>> ages = users.stream()
      .collect(Collectors.groupingBy(User::getName, Collectors.mapping(User::getAge, Collectors.toList())));
  ```

### 3. `joining()` — cách nối chuỗi với delimiter, prefix, suffix.
- **Trả lời**:
  ```java
  String result = list.stream().collect(Collectors.joining(", ", "[", "]")); // [a, b, c]
  ```

### 4. `toMap()` — xử lý khi key trùng (`mergeFunction`) và cách chỉ định `Map` implementation.
- **Trả lời**:
  ```java
  Map<String, Integer> map = users.stream()
      .collect(Collectors.toMap(User::getName, User::getAge, (a, b) -> a, TreeMap::new));
  ```

### 5. ⚠️ Gài: Dùng `toMap()` với key trùng mà không merge sẽ gây exception gì?
- **Trả lời**:
    - **Exception**: `IllegalStateException` khi key trùng.
    - **Khắc phục**: Cung cấp `mergeFunction`.
    - **Ví dụ**:
      ```java
      // Xấu
      Map<String, Integer> map = users.stream().collect(Collectors.toMap(User::getName, User::getAge)); // IllegalStateException
      // Tốt
      Map<String, Integer> map = users.stream().collect(Collectors.toMap(User::getName, User::getAge, Integer::sum));
      ```

---

## 8) Optional và Stream

### 1. Tại sao một số method như `findFirst()`/`findAny()` trả về `Optional`?
- **Trả lời**:
    - **Lý do**: Kết quả có thể không tồn tại, tránh `null` và `NullPointerException`.
    - **Ví dụ**:
      ```java
      Optional<String> first = list.stream().filter(s -> s.length() > 5).findFirst();
      ```

### 2. ⚠️ Gài: `findFirst()` và `findAny()` khác gì trong stream tuần tự và song song?
- **Trả lời**:
    - **Tuần tự**:
        - `findFirst()`: Trả phần tử đầu tiên thỏa điều kiện.
        - `findAny()`: Trả phần tử bất kỳ (thường giống `findFirst`).
    - **Song song**:
        - `findFirst()`: Đảm bảo phần tử đầu tiên theo thứ tự nguồn.
        - `findAny()`: Trả phần tử bất kỳ từ thread nào, nhanh hơn.
    - **Ví dụ**:
      ```java
      Optional<Integer> any = numbers.parallelStream().filter(n -> n > 0).findAny();
      ```

### 3. Cách xử lý giá trị không tồn tại trong Optional (`orElse`, `orElseGet`, `orElseThrow`).
- **Trả lời**:
  ```java
  String result = optional.orElse("default"); // Luôn tính default
  String result2 = optional.orElseGet(() -> expensiveMethod()); // Lazy
  String result3 = optional.orElseThrow(() -> new RuntimeException("Not found"));
  ```

---

## 9) Stream & Map (Java 8+)

### 1. Stream các entry trong Map: `map.entrySet().stream()` — khi nào cần `forEach()` vs `collect()`.
- **Trả lời**:
    - **`forEach()`**: Thực hiện hành động, không thu thập kết quả.
    - **`collect()`**: Tạo cấu trúc dữ liệu từ stream.
    - **Ví dụ**:
      ```java
      map.entrySet().stream().forEach(e -> System.out.println(e.getKey())); // In key
      List<String> keys = map.entrySet().stream().map(Map.Entry::getKey).collect(Collectors.toList());
      ```

### 2. `Map.forEach()` khác gì với stream `forEach()`.
- **Trả lời**:
    - **`Map.forEach()`**: Duyệt trực tiếp key-value, không qua pipeline.
    - **Stream `forEach()`**: Dùng trong pipeline, hỗ trợ song song.
    - **Ví dụ**:
      ```java
      map.forEach((k, v) -> System.out.println(k + ":" + v));
      map.entrySet().stream().forEach(e -> System.out.println(e));
      ```

### 3. ⚠️ Gài: `map.keySet().stream()` thay đổi key trong khi iterate có an toàn không?
- **Trả lời**:
    - **Không an toàn**: Thay đổi `Map` trong khi stream có thể gây `ConcurrentModificationException`.
    - **Khắc phục**: Thu thập vào collection mới trước khi sửa.
    - **Ví dụ**:
      ```java
      // Xấu
      map.keySet().stream().forEach(k -> map.remove(k)); // ConcurrentModificationException
      // Tốt
      List<String> keys = map.keySet().stream().toList();
      keys.forEach(map::remove);
      ```

---

## 10) Các lỗi thường gặp & hiệu năng

### 1. Dùng stream cho tác vụ quá nhỏ — vì sao có thể chậm hơn for-loop.
- **Trả lời**:
    - **Lý do**: Overhead của pipeline (boxing, lambda, stream creation) lớn hơn lợi ích.
    - **Ví dụ**:
      ```java
      // Chậm
      int sum = Stream.of(1, 2, 3).reduce(0, Integer::sum);
      // Nhanh
      int sum = 0; for (int n : new int[]{1, 2, 3}) sum += n;
      ```

### 2. Sử dụng nhiều `sorted()` liên tiếp — tác động tới hiệu năng.
- **Trả lời**:
    - **Tác động**: Mỗi `sorted()` là O(n log n), nhiều lần gây lãng phí.
    - **Khắc phục**: Gộp `sorted()` với `Comparator` kết hợp.
    - **Ví dụ**:
      ```java
      // Xấu
      list.stream().sorted().sorted(Comparator.reverseOrder());
      // Tốt
      list.stream().sorted(Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()));
      ```

### 3. ⚠️ Gài: Tại sao dùng `parallelStream()` để update `ArrayList` có thể gây `ConcurrentModificationException` hoặc dữ liệu sai?
- **Trả lời**:
    - **Lý do**: Nhiều thread cập nhật `ArrayList` (không thread-safe) gây race condition.
    - **Khắc phục**: Dùng `collect()` với collector thread-safe.
    - **Ví dụ**:
      ```java
      // Xấu
      List<Integer> result = new ArrayList<>();
      numbers.parallelStream().forEach(result::add); // Sai
      // Tốt
      List<Integer> result = numbers.parallelStream().collect(Collectors.toList());
      ```

### 4. Gọi `stream()` nhiều lần trên cùng source tốn kém ở đâu?
- **Trả lời**:
    - **Tốn kém**: Tạo pipeline mới mỗi lần, lặp lại xử lý nguồn.
    - **Khắc phục**: Lưu stream vào biến hoặc thu thập kết quả lần đầu.
    - **Ví dụ**:
      ```java
      Stream<String> stream = list.stream(); // Tạo một lần
      ```

### 5. Lạm dụng `peek()` để mutate object — rủi ro về side-effect và tính predictability.
- **Trả lời**:
    - **Rủi ro**: Gây side-effects, khó dự đoán trong `parallelStream`.
    - **Khắc phục**: Dùng `map` hoặc `collect` để xử lý rõ ràng.
    - **Ví dụ**:
      ```java
      // Xấu
      list.stream().peek(s -> list2.add(s)).toList();
      // Tốt
      List<String> result = list.stream().map(s -> { list2.add(s); return s; }).toList();
      ```

---

## 11) Mini case (thực chiến)

### 1. Tìm top 5 sản phẩm có doanh thu cao nhất từ danh sách orders với Stream API.
- **Trả lời**:
  ```java
  record Order(String productId, double revenue) {}
  List<Map.Entry<String, Double>> top5 = orders.stream()
      .collect(Collectors.groupingBy(Order::productId, Collectors.summingDouble(Order::revenue)))
      .entrySet().stream()
      .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
      .limit(5)
      .toList();
  ```

### 2. Gom nhóm sinh viên theo lớp và tính điểm trung bình từng lớp.
- **Trả lời**:
  ```java
  record Student(String className, double score) {}
  Map<String, Double> avgScores = students.stream()
      .collect(Collectors.groupingBy(Student::className, 
                                     Collectors.averagingDouble(Student::score)));
  ```

### 3. Từ một danh sách câu, tách ra tất cả từ, loại bỏ trùng, sắp xếp alphabet.
- **Trả lời**:
  ```java
  List<String> words = sentences.stream()
      .flatMap(s -> Arrays.stream(s.split("\\W+")))
      .filter(w -> !w.isEmpty())
      .distinct()
      .sorted()
      .toList();
  ```

### 4. Tìm user đầu tiên có quyền ADMIN trong danh sách (ưu tiên tốc độ).
- **Trả lời**:
  ```java
  record User(String name, String role) {}
  Optional<User> admin = users.stream()
      .filter(u -> u.role().equals("ADMIN"))
      .findFirst();
  ```

### 5. Chuyển danh sách `List<List<String>>` thành một list phẳng không trùng lặp, viết bằng 1 dòng stream.
- **Trả lời**:
  ```java
  List<String> flat = lists.stream().flatMap(List::stream).distinct().toList();
  ```

### 6. Đếm số email domain khác nhau từ danh sách người dùng.
- **Trả lời**:
  ```java
  long domainCount = users.stream()
      .map(User::getEmail)
      .filter(email -> email != null && email.contains("@"))
      .map(email -> email.substring(email.indexOf("@") + 1).toLowerCase())
      .distinct()
      .count();
  ```

---

