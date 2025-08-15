## 1) Tư duy & mục tiêu khi refactor sang phong cách hàm (functional)

### 1. Functional style là gì trong Java “thuần” (không framework thêm)? Mục tiêu chính khi refactor?
- **Trả lời**:
    - **Functional style**: Sử dụng Stream API, lambda, `Optional`, và các hàm thuần (`Function`, `Predicate`) để viết code khai báo, giảm trạng thái mutable.
    - **Mục tiêu**:
        - Tăng tính đọc hiểu (declarative).
        - Giảm lỗi do trạng thái (side-effects).
        - Dễ test và bảo trì.
    - **Ví dụ**:
      ```java
      // Imperative
      List<Integer> evens = new ArrayList<>();
      for (int i : numbers) if (i % 2 == 0) evens.add(i);
      // Functional
      List<Integer> evens = numbers.stream().filter(i -> i % 2 == 0).toList();
      ```

### 2. Lợi ích so với code mệnh lệnh: tính khai báo, dễ test, ít bug do trạng thái — nêu 3 lợi ích cụ thể.
- **Trả lời**:
    - **Khai báo**: Code mô tả "cái gì" thay vì "làm thế nào", dễ đọc (ví dụ: `filter` thay loop).
    - **Dễ test**: Hàm thuần dễ kiểm tra đầu vào/ra, không phụ thuộc trạng thái.
    - **Ít bug**: Giảm side-effects, tránh race condition trong concurrency.
    - **Ví dụ**:
      ```java
      // Dễ test
      Predicate<Integer> isEven = n -> n % 2 == 0;
      ```

### 3. ⚠️ Gài: “Functional style = dùng Stream ở mọi nơi.” — Nhận định này sai ở đâu?
- **Trả lời**:
    - **Sai**: Functional style không chỉ là Stream, mà còn là hàm thuần, bất biến, và không side-effects.
    - **Vấn đề**:
        - Lạm dụng Stream cho task đơn giản gây overhead.
        - Stream không phù hợp với logic phức tạp hoặc cần truy cập ngẫu nhiên.
    - **Ví dụ**:
      ```java
      // Xấu
      int sum = numbers.stream().reduce(0, Integer::sum);
      // Tốt
      int sum = 0; for (int n : numbers) sum += n;
      ```

### 4. Khái niệm **referential transparency** và **pure function**; đo lường “độ thuần” thực tế trong Java.
- **Trả lời**:
    - **Referential transparency**: Hàm cho cùng đầu vào luôn trả cùng kết quả, không side-effects.
    - **Pure function**: Không phụ thuộc/chỉnh sửa trạng thái bên ngoài.
    - **Đo lường**:
        - Kiểm tra hàm có thay đổi biến ngoài không.
        - Đảm bảo đầu ra chỉ phụ thuộc đầu vào.
    - **Ví dụ**:
      ```java
      // Pure
      int square(int n) { return n * n; }
      // Impure
      int counter = 0;
      int countAndSquare(int n) { counter++; return n * n; }
      ```

### 5. Khi nào **không nên** refactor sang functional? Ví dụ tác vụ CPU nặng, cấu trúc dữ liệu cần thao tác ngẫu nhiên.
- **Trả lời**:
    - **Không nên**:
        - Tác vụ CPU nặng: Stream có overhead (boxing, pipeline).
        - Truy cập ngẫu nhiên: Stream kém hiệu quả so với array/list trực tiếp.
        - Logic phức tạp: Khó diễn đạt bằng Stream.
    - **Ví dụ**:
      ```java
      // Không nên
      int[] arr = ...; // Tác vụ CPU nặng
      Arrays.stream(arr).map(...).forEach(...); // Chậm
      // Tốt
      for (int i = 0; i < arr.length; i++) arr[i] = ...;
      ```

---

## 2) Nhận diện “mùi” mệnh lệnh cần refactor

### 1. Dấu hiệu loop lồng nhau, biến tạm, cờ (flag), break/continue phức tạp.
- **Trả lời**:
    - **Dấu hiệu**:
        - Loop lồng nhiều cấp, khó đọc.
        - Biến tạm (`temp`) để lưu kết quả trung gian.
        - Cờ (`boolean found`) để điều khiển luồng.
    - **Ví dụ**:
      ```java
      // Mùi
      List<Integer> result = new ArrayList<>();
      for (int i : numbers) {
          if (i > 0) {
              for (int j : otherList) if (j == i) result.add(i);
          }
      }
      ```

### 2. Tích lũy thủ công bằng `for` + `if/else` để lọc, chuyển đổi, gom nhóm.
- **Trả lời**:
    - **Mùi**: Dùng loop và `if/else` để lọc/map/gom nhóm thay vì Stream.
    - **Ví dụ**:
      ```java
      // Mùi
      Map<String, Integer> map = new HashMap<>();
      for (User u : users) map.put(u.getName(), map.getOrDefault(u.getName(), 0) + 1);
      // Tốt
      Map<String, Long> map = users.stream()
          .collect(Collectors.groupingBy(User::getName, Collectors.counting()));
      ```

### 3. ⚠️ Gài: Sử dụng `List` trung gian nhiều bước chỉ để truyền dữ liệu giữa các vòng lặp — tại sao là code smell?
- **Trả lời**:
    - **Mùi**: Tạo collection trung gian gây tốn bộ nhớ, không cần thiết.
    - **Lý do**: Stream pipeline xử lý lazy, tránh trung gian.
    - **Ví dụ**:
      ```java
      // Xấu
      List<Integer> temp = new ArrayList<>();
      for (int i : numbers) if (i % 2 == 0) temp.add(i);
      List<Integer> result = new ArrayList<>();
      for (int i : temp) result.add(i * 2);
      // Tốt
      List<Integer> result = numbers.stream().filter(i -> i % 2 == 0).map(i -> i * 2).toList();
      ```

### 4. Cập nhật biến đếm/toán tổng toàn cục trong nhiều nhánh — rủi ro race/nhầm logic.
- **Trả lời**:
    - **Rủi ro**:
        - **Race condition**: Trong môi trường đa luồng.
        - **Nhầm logic**: Biến toàn cục khó theo dõi.
    - **Ví dụ**:
      ```java
      // Xấu
      int total = 0;
      for (int i : numbers) if (i > 0) total += i;
      // Tốt
      int total = numbers.stream().filter(i -> i > 0).sum();
      ```

---

## 3) Mẫu refactor cơ bản: loop → pipeline

### 1. `for` lọc phần tử → `stream().filter(...)`.
- **Trả lời**:
  ```java
  // Imperative
  List<Integer> evens = new ArrayList<>();
  for (int i : numbers) if (i % 2 == 0) evens.add(i);
  // Functional
  List<Integer> evens = numbers.stream().filter(i -> i % 2 == 0).toList();
  ```

### 2. Ánh xạ (transform) → `map(...)` / primitive streams (`mapToInt`, …) để tránh boxing.
- **Trả lời**:
    - **Map**: Chuyển đổi từng phần tử.
    - **Primitive streams**: Tránh boxing (ví dụ: `mapToInt`).
    - **Ví dụ**:
      ```java
      // Boxing
      List<Integer> squares = numbers.stream().map(n -> n * n).toList();
      // No boxing
      int[] squares = numbers.stream().mapToInt(n -> n * n).toArray();
      ```

### 3. Tích lũy → `reduce(...)` vs `collect(...)`: khi nào chọn cái nào?
- **Trả lời**:
    - **`reduce`**: Tích lũy thành một giá trị (tổng, max).
    - **`collect`**: Tạo cấu trúc phức tạp (List, Map).
    - **Ví dụ**:
      ```java
      // reduce
      int sum = numbers.stream().reduce(0, Integer::sum);
      // collect
      List<Integer> list = numbers.stream().collect(Collectors.toList());
      ```

### 4. ⚠️ Gài: `forEach` có thay thế được `map`/`collect` để biến đổi dữ liệu không?
- **Trả lời**:
    - **Không**: `forEach` chỉ để side-effects, không trả kết quả.
    - **Dùng `map`/`collect`**: Để biến đổi và thu thập.
    - **Ví dụ**:
      ```java
      // Xấu
      List<Integer> result = new ArrayList<>();
      numbers.stream().forEach(n -> result.add(n * 2));
      // Tốt
      List<Integer> result = numbers.stream().map(n -> n * 2).toList();
      ```

### 5. Bỏ lồng nhau → `flatMap(...)`: ví dụ danh sách các danh sách.
- **Trả lời**:
  ```java
  // Imperative
  List<Integer> result = new ArrayList<>();
  for (List<Integer> list : lists) for (int i : list) result.add(i);
  // Functional
  List<Integer> result = lists.stream().flatMap(List::stream).toList();
  ```

### 6. Sắp xếp → `sorted()`/`Comparator.comparing(...)`.
- **Trả lời**:
  ```java
  List<String> sorted = names.stream()
      .sorted(Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()))
      .toList();
  ```

### 7. Loại trùng → `distinct()`; điều kiện để distinct làm việc đúng.
- **Trả lời**:
    - **Điều kiện**: Lớp phải triển khai `equals`/`hashCode` đúng.
    - **Ví dụ**:
      ```java
      List<String> unique = names.stream().distinct().toList();
      ```

### 8. Lấy top-N → `sorted(...).limit(n)`; thứ tự đặt `limit` và `sorted` ảnh hưởng gì?
- **Trả lời**:
    - **Thứ tự**:
        - `sorted().limit(n)`: Sắp xếp toàn bộ, rồi lấy N.
        - `limit(n).sorted()`: Lấy N, rồi sắp xếp (nhanh hơn nếu dữ liệu lớn).
    - **Ví dụ**:
      ```java
      List<Integer> top5 = numbers.stream().sorted().limit(5).toList();
      ```

---

## 4) Gom nhóm, phân vùng & tạo map bằng Collectors

### 1. `groupingBy(key)` vs `partitioningBy(predicate)` — khác nhau và ứng dụng.
- **Trả lời**:
    - **`groupingBy`**: Gom nhóm theo key bất kỳ.
    - **`partitioningBy`**: Chia thành 2 nhóm (true/false) theo predicate.
    - **Ví dụ**:
      ```java
      // groupingBy
      Map<String, List<User>> byName = users.stream().collect(Collectors.groupingBy(User::getName));
      // partitioningBy
      Map<Boolean, List<User>> byAge = users.stream().collect(Collectors.partitioningBy(u -> u.getAge() > 18));
      ```

### 2. Kết hợp `groupingBy` với `mapping`, `counting`, `summingInt`, `maxBy`.
- **Trả lời**:
  ```java
  Map<String, Long> nameCount = users.stream()
      .collect(Collectors.groupingBy(User::getName, Collectors.counting()));
  Map<String, List<Integer>> ages = users.stream()
      .collect(Collectors.groupingBy(User::getName, Collectors.mapping(User::getAge, Collectors.toList())));
  ```

### 3. Tạo `Map` an toàn với key trùng: `toMap(key, value, mergeFn, mapSupplier)`.
- **Trả lời**:
  ```java
  Map<String, Integer> map = users.stream()
      .collect(Collectors.toMap(User::getName, User::getAge, (a, b) -> a, TreeMap::new));
  ```

### 4. ⚠️ Gài: Vì sao `toMap` ném `IllegalStateException` khi key trùng? Viết merge function thế nào cho đúng?
- **Trả lời**:
    - **Lý do**: `toMap` mặc định không xử lý key trùng.
    - **Merge function**: Xác định cách gộp giá trị.
    - **Ví dụ**:
      ```java
      Map<String, Integer> map = users.stream()
          .collect(Collectors.toMap(User::getName, User::getAge, Integer::sum));
          // Gộp tuổi nếu tên trùng
      ```

### 5. Thu thập vào cấu trúc cụ thể: `toCollection(LinkedList::new)`, `toSet`, `toUnmodifiableList`.
- **Trả lời**:
  ```java
  LinkedList<String> list = names.stream().collect(Collectors.toCollection(LinkedList::new));
  Set<String> set = names.stream().collect(Collectors.toSet());
  List<String> unmodifiable = names.stream().collect(Collectors.toUnmodifiableList());
  ```

---

## 5) Xử lý điều kiện & nhánh phức tạp theo hướng khai báo

### 1. Thay thế `if/else` dài bằng **bộ quy tắc** (map từ điều kiện → hành động).
- **Trả lời**:
  ```java
  // Imperative
  int process(String type) {
      if (type.equals("A")) return 1;
      else if (type.equals("B")) return 2;
      else return 0;
  }
  // Functional
  Map<String, Integer> rules = Map.of("A", 1, "B", 2);
  int process(String type) { return rules.getOrDefault(type, 0); }
  ```

### 2. Dùng `Map<Enum, Function<...>>` hoặc `switch` expression để ánh xạ hành vi.
- **Trả lời**:
  ```java
  enum Type { A, B }
  Map<Type, Function<Integer, Integer>> actions = Map.of(
      Type.A, x -> x + 1,
      Type.B, x -> x * 2
  );
  int result = actions.getOrDefault(type, x -> x).apply(input);
  // Switch expression
  int result = switch (type) {
      case A -> input + 1;
      case B -> input * 2;
      default -> input;
  };
  ```

### 3. ⚠️ Gài: Lạm dụng `filter(...).findFirst().get()` có ổn không? Cách tránh `NoSuchElementException`.
- **Trả lời**:
    - **Không ổn**: `get()` ném `NoSuchElementException` nếu không tìm thấy.
    - **Khắc phục**: Dùng `orElse`, `orElseGet`, hoặc `orElseThrow`.
    - **Ví dụ**:
      ```java
      // Xấu
      User user = users.stream().filter(u -> u.getId() == id).findFirst().get();
      // Tốt
      User user = users.stream().filter(u -> u.getId() == id).findFirst().orElse(null);
      ```

---

## 6) `Optional` & loại bỏ `null` mệnh lệnh

### 1. Dùng `Optional` để mô hình “có/không có” thay vì `if (x != null)`.
- **Trả lời**:
  ```java
  // Imperative
  String result = user != null ? user.getName() : "Unknown";
  // Functional
  String result = Optional.ofNullable(user).map(User::getName).orElse("Unknown");
  ```

### 2. Chuỗi hoá xử lý: `map`, `flatMap`, `orElse`, `orElseGet`, `orElseThrow`.
- **Trả lời**:
  ```java
  String name = Optional.ofNullable(user)
      .flatMap(u -> Optional.ofNullable(u.getProfile()))
      .map(Profile::getName)
      .orElseThrow(() -> new RuntimeException("No name"));
  ```

### 3. ⚠️ Gài: Khác nhau giữa `orElse` và `orElseGet` về **chi phí** thực thi.
- **Trả lời**:
    - **`orElse`**: Luôn tính giá trị mặc định, dù không cần.
    - **`orElseGet`**: Chỉ tính khi `Optional` rỗng (lazy).
    - **Ví dụ**:
      ```java
      String result = Optional.ofNullable(user).orElse(expensiveMethod()); // Luôn gọi
      String result = Optional.ofNullable(user).orElseGet(() -> expensiveMethod()); // Chỉ gọi nếu rỗng
      ```

### 4. `Optional.stream()` trong pipeline — khi nào giúp rút gọn code.
- **Trả lời**:
    - **Dùng**: Khi cần tích hợp `Optional` vào Stream pipeline.
    - **Ví dụ**:
      ```java
      List<String> names = users.stream()
          .map(u -> Optional.ofNullable(u.getName()))
          .flatMap(Optional::stream)
          .toList();
      ```

---

## 7) Trạng thái, bất biến & side-effects

### 1. Vì sao functional style ưu tiên **bất biến**? Giảm bug race & dễ reasoning.
- **Trả lời**:
    - **Bất biến**:
        - Ngăn thay đổi ngoài ý muốn, giảm race condition.
        - Dễ suy luận logic (đầu vào → đầu ra).
    - **Ví dụ**:
      ```java
      // Bất biến
      List<String> names = List.of("A", "B");
      ```

### 2. Tránh cập nhật biến ngoài (captured state) trong lambda/stream.
- **Trả lời**:
  ```java
  // Xấu
  List<Integer> result = new ArrayList<>();
  numbers.stream().forEach(n -> result.add(n));
  // Tốt
  List<Integer> result = numbers.stream().toList();
  ```

### 3. ⚠️ Gài: Dùng `peek()` để ghi log/đếm có ổn không? Khi nào được phép dùng `peek`.
- **Trả lời**:
    - **Không ổn**: `peek()` để side-effects dễ gây lỗi trong `parallelStream`.
    - **Dùng khi**: Debug hoặc log nhẹ, không thay đổi trạng thái.
    - **Ví dụ**:
      ```java
      // OK
      numbers.stream().peek(System.out::println).toList();
      // Xấu
      List<Integer> side = new ArrayList<>();
      numbers.stream().peek(side::add).toList(); // Side-effect
      ```

### 4. Thiết kế API trả **bản sao bất biến** hoặc **view không sửa**.
- **Trả lời**:
  ```java
  List<String> getNames() { return List.copyOf(names); } // Bất biến
  Stream<String> getNameStream() { return names.stream(); } // View
  ```

---

## 8) Performance & bộ nhớ khi chuyển sang functional

### 1. Chi phí boxing/unboxing; dùng **primitive streams** khi nào.
- **Trả lời**:
    - **Boxing**: Chuyển `int` thành `Integer`, tốn bộ nhớ.
    - **Primitive streams**: Dùng với số (`IntStream`, `LongStream`) để tránh boxing.
    - **Ví dụ**:
      ```java
      // Boxing
      numbers.stream().map(n -> n * 2);
      // No boxing
      numbers.stream().mapToInt(n -> n * 2);
      ```

### 2. Tận dụng **short-circuit**: `anyMatch`, `allMatch`, `findFirst`.
- **Trả lời**:
  ```java
  boolean hasEven = numbers.stream().anyMatch(n -> n % 2 == 0); // Dừng khi tìm thấy
  ```

### 3. ⚠️ Gài: Vì sao pipeline “nhiều `sorted()`/`distinct()`” có thể chậm hơn vòng lặp tối ưu tay?
- **Trả lời**:
    - **Lý do**: `sorted`/`distinct` yêu cầu xử lý toàn bộ dữ liệu, tốn bộ nhớ/CPU.
    - **Vòng lặp**: Tối ưu cho trường hợp đặc biệt (ví dụ: mảng đã sắp xếp).
    - **Ví dụ**:
      ```java
      // Chậm
      numbers.stream().distinct().sorted().toList();
      // Nhanh hơn nếu mảng gần sắp xếp
      Arrays.sort(numbers); // Thủ công
      ```

### 4. Hạn chế tạo collection trung gian; ưu tiên pipeline **lazy**.
- **Trả lời**:
  ```java
  // Xấu
  List<Integer> temp = numbers.stream().filter(n -> n > 0).toList();
  List<Integer> result = temp.stream().map(n -> n * 2).toList();
  // Tốt
  List<Integer> result = numbers.stream().filter(n -> n > 0).map(n -> n * 2).toList();
  ```

### 5. Khi nào cân nhắc `parallel()`? Nêu điều kiện dữ liệu/chi phí tách/bộ nhớ.
- **Trả lời**:
    - **Cân nhắc**:
        - Dữ liệu lớn, độc lập.
        - Tác vụ CPU-bound, chi phí tách thấp.
    - **Điều kiện**:
        - Không có side-effects.
        - Collection lớn (nghìn phần tử trở lên).
    - **Ví dụ**:
      ```java
      numbers.parallelStream().map(n -> heavyComputation(n)).toList();
      ```

---

## 9) Debug & quan sát pipeline

### 1. Chiến lược tách pipeline dài thành biến đặt tên (đọc hiểu tốt hơn).
- **Trả lời**:
  ```java
  // Xấu
  List<String> result = users.stream().filter(...).map(...).toList();
  // Tốt
  Stream<User> filtered = users.stream().filter(u -> u.getAge() > 18);
  List<String> result = filtered.map(User::getName).toList();
  ```

### 2. Dùng `peek()` đúng chỗ; thay thế bằng log tại **đầu/cuối** pipeline.
- **Trả lời**:
  ```java
  // OK
  List<String> result = users.stream()
      .peek(u -> logger.debug("Processing: {}", u))
      .map(User::getName)
      .toList();
  ```

### 3. ⚠️ Gài: Vì sao debug bằng `forEach(System.out::println)` có thể **làm thay đổi thứ tự** hoặc gây side-effect ngoài ý muốn?
- **Trả lời**:
    - **Lý do**: `forEach` trong `parallelStream` không đảm bảo thứ tự, có thể gây side-effects.
    - **Khắc phục**: Dùng `peek` hoặc `forEachOrdered`.
    - **Ví dụ**:
      ```java
      // Xấu
      numbers.parallelStream().forEach(System.out::println); // Thứ tự ngẫu nhiên
      // Tốt
      numbers.stream().peek(System.out::println).toList();
      ```

---

## 10) Functional composition & higher-order functions

### 1. Kết hợp `Function` với `andThen`/`compose`; `Predicate.and/or/negate`.
- **Trả lời**:
  ```java
  Function<Integer, Integer> add = x -> x + 1;
  Function<Integer, Integer> square = x -> x * x;
  Function<Integer, Integer> combined = add.andThen(square); // add -> square
  Predicate<Integer> positive = x -> x > 0;
  Predicate<Integer> even = x -> x % 2 == 0;
  Predicate<Integer> posAndEven = positive.and(even);
  ```

### 2. Method reference vs lambda: khi nào tăng độ rõ ràng.
- **Trả lời**:
    - **Method reference**: Rõ ràng hơn khi gọi hàm có sẵn.
    - **Lambda**: Linh hoạt hơn khi logic phức tạp.
    - **Ví dụ**:
      ```java
      // Method reference
      numbers.stream().map(String::valueOf);
      // Lambda
      numbers.stream().map(n -> "Num: " + n);
      ```

### 3. ⚠️ Gài: Sự khác nhau về thứ tự giữa `f.andThen(g)` và `g.compose(f)` minh hoạ bằng ví dụ.
- **Trả lời**:
    - **`f.andThen(g)`**: Thực hiện `f` trước, rồi `g`.
    - **`g.compose(f)`**: Thực hiện `f` trước, rồi `g` (giống `andThen`).
    - **Ví dụ**:
      ```java
      Function<Integer, Integer> add = x -> x + 1;
      Function<Integer, Integer> square = x -> x * x;
      int result1 = add.andThen(square).apply(2); // (2+1)^2 = 9
      int result2 = square.compose(add).apply(2); // (2+1)^2 = 9
      ```

### 4. Xây **bộ biến đổi** có thể lắp ghép (pipeline tái sử dụng).
- **Trả lời**:
  ```java
  Function<List<Integer>, List<Integer>> pipeline = list -> list.stream()
      .filter(n -> n > 0)
      .map(n -> n * 2)
      .toList();
  List<Integer> result = pipeline.apply(numbers);
  ```

---

## 11) Refactor imperative → functional theo từng bước

### 1. Bước 1: tách logic thành **hàm thuần** nhỏ có test.
- **Trả lời**:
  ```java
  // Imperative
  int sumPositive(List<Integer> numbers) {
      int sum = 0;
      for (int n : numbers) if (n > 0) sum += n;
      return sum;
  }
  // Functional
  int sumPositive(List<Integer> numbers) {
      return numbers.stream().filter(n -> n > 0).mapToInt(n -> n).sum();
  }
  @Test
  void testSumPositive() {
      assertEquals(6, sumPositive(List.of(1, 2, 3, -1)));
  }
  ```

### 2. Bước 2: thay vòng lặp + biến tạm bằng `map/filter/collect`.
- **Trả lời**:
  ```java
  // Imperative
  List<String> names = new ArrayList<>();
  for (User u : users) if (u.getAge() > 18) names.add(u.getName());
  // Functional
  List<String> names = users.stream().filter(u -> u.getAge() > 18).map(User::getName).toList();
  ```

### 3. Bước 3: gom nhóm/phân trang/sắp xếp bằng Collectors.
- **Trả lời**:
  ```java
  Map<String, List<User>> byName = users.stream()
      .collect(Collectors.groupingBy(User::getName));
  ```

### 4. ⚠️ Gài: “Một PR đổi toàn bộ code sang Stream” — rủi ro gì? Cách **incremental refactor**.
- **Trả lời**:
    - **Rủi ro**:
        - Giảm hiệu năng (boxing, pipeline dài).
        - Code khó đọc nếu lạm dụng.
        - Khó kiểm tra tính đúng đắn.
    - **Incremental**:
        - Refactor từng hàm nhỏ.
        - Viết test trước/sau.
        - So sánh hiệu năng.
    - **Ví dụ**: Refactor từng vòng lặp, kiểm tra bằng unit test.

---

## 12) Kiểm soát lỗi & đặc tả nghiệp vụ trong functional style

### 1. Ngoại lệ checked trong lambda: chiến lược bọc/adapter.
- **Trả lời**:
  ```java
  @FunctionalInterface
  interface CheckedFunction<T, R> {
      R apply(T t) throws Exception;
  }
  <T, R> Function<T, R> wrap(CheckedFunction<T, R> fn) {
      return t -> {
          try { return fn.apply(t); }
          catch (Exception e) { throw new RuntimeException(e); }
      };
  }
  ```

### 2. Dùng `Optional` cho “không tìm thấy” vs dùng exception cho **lỗi nghiệp vụ**.
- **Trả lời**:
    - **`Optional`**: Cho trường hợp hợp lệ “không có dữ liệu”.
    - **Exception**: Lỗi nghiệp vụ (ví dụ: `DuplicateEmailException`).
    - **Ví dụ**:
      ```java
      Optional<User> user = users.stream().filter(u -> u.getId() == id).findFirst();
      if (emailExists(email)) throw new DuplicateEmailException();
      ```

### 3. ⚠️ Gài: Bọc tất cả lỗi thành `RuntimeException` trong pipeline — mùi thiết kế gì?
- **Trả lời**:
    - **Mùi**: Mất ngữ cảnh lỗi, khó xử lý cụ thể.
    - **Khắc phục**: Dùng custom exception hoặc `Optional` cho lỗi dự đoán được.
    - **Ví dụ**:
      ```java
      // Xấu
      Function<String, Integer> parse = s -> {
          try { return Integer.parseInt(s); } catch (Exception e) { throw new RuntimeException(e); }
      };
      // Tốt
      Function<String, Optional<Integer>> parse = s -> {
          try { return Optional.of(Integer.parseInt(s)); } catch (NumberFormatException e) { return Optional.empty(); }
      };
      ```

---

## 13) Concurrency nhẹ nhàng với functional

### 1. Dùng `CompletableFuture` theo chain `thenApply/thenCompose` thay vì **callback lồng nhau**.
- **Trả lời**:
  ```java
  CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> "data")
      .thenApply(String::toUpperCase)
      .thenCompose(s -> CompletableFuture.supplyAsync(() -> s + "!"));
  ```

### 2. Kết hợp nhiều future: `allOf`/`anyOf`; mapping kết quả có kiểu.
- **Trả lời**:
  ```java
  CompletableFuture<String> f1 = CompletableFuture.supplyAsync(() -> "A");
  CompletableFuture<String> f2 = CompletableFuture.supplyAsync(() -> "B");
  CompletableFuture<List<String>> all = CompletableFuture.allOf(f1, f2)
      .thenApply(v -> Stream.of(f1, f2).map(CompletableFuture::join).toList());
  ```

### 3. ⚠️ Gài: Vì sao **stateful lambda** + `parallelStream` thường cho kết quả sai? Cách sửa.
- **Trả lời**:
    - **Lý do**: Lambda cập nhật trạng thái ngoài gây race condition.
    - **Sửa**: Dùng collector thread-safe hoặc sequential stream.
    - **Ví dụ**:
      ```java
      // Xấu
      List<Integer> result = new ArrayList<>();
      numbers.parallelStream().forEach(result::add); // Sai
      // Tốt
      List<Integer> result = numbers.parallelStream().collect(Collectors.toList());
      ```

---

## 14) Pattern chuyên dụng khi refactor

### 1. **Map-of-actions**: thay chuỗi `if/else` phân nhánh theo key.
- **Trả lời**:
  ```java
  Map<String, Function<Integer, Integer>> actions = Map.of(
      "add", x -> x + 1,
      "double", x -> x * 2
  );
  int result = actions.getOrDefault(type, x -> x).apply(input);
  ```

### 2. **Collector tuỳ biến**: khi Collectors mặc định không đủ (kết hợp số liệu phức tạp).
- **Trả lời**:
  ```java
  Collector<Integer, List<Integer>, Double> medianCollector = Collector.of(
      ArrayList::new,
      List::add,
      (a, b) -> { a.addAll(b); return a; },
      list -> {
          Collections.sort(list);
          return list.size() % 2 == 0
              ? (list.get(list.size() / 2 - 1) + list.get(list.size() / 2)) / 2.0
              : list.get(list.size() / 2) * 1.0;
      }
  );
  ```

### 3. ⚠️ Gài: Khi nào `reduce` **không phù hợp** bằng `collect` (vấn đề kết hợp/đơn vị?).
- **Trả lời**:
    - **Không phù hợp**:
        - Kết quả là collection phức tạp (List, Map).
        - Cần đơn vị trung gian (accumulator) không tương thích.
    - **Ví dụ**:
      ```java
      // Xấu
      List<Integer> list = numbers.stream().reduce(new ArrayList<>(), (acc, n) -> { acc.add(n); return acc; }, (a, b) -> { a.addAll(b); return a; });
      // Tốt
      List<Integer> list = numbers.stream().collect(Collectors.toList());
      ```

### 4. **Windowing/chunking**: mô phỏng theo stream API (khi chưa có API sẵn).
- **Trả lời**:
  ```java
  Stream<List<Integer>> chunked = Stream.iterate(0, i -> i < numbers.size(), i -> i + chunkSize)
      .map(i -> numbers.subList(i, Math.min(i + chunkSize, numbers.size())));
  ```

---

## 15) Anti-pattern cần tránh

### 1. Dùng stream cho task quá nhỏ/1 phần tử → overhead.
- **Trả lời**:
  ```java
  // Xấu
  String result = list.stream().filter(s -> s.equals("a")).findFirst().orElse("");
  // Tốt
  String result = list.contains("a") ? "a" : "";
  ```

### 2. Lồng `stream()` trong `stream()` mà không `flatMap`.
- **Trả lời**:
  ```java
  // Xấu
  List<Stream<String>> nested = lists.stream().map(List::stream).toList();
  // Tốt
  List<String> flat = lists.stream().flatMap(List::stream).toList();
  ```

### 3. ⚠️ Gài: Biến `forEach` thành nơi **mutate** collection khác → `ConcurrentModificationException`.
- **Trả lời**:
  ```java
  // Xấu
  List<String> other = new ArrayList<>();
  names.stream().forEach(other::add); // Có thể gây lỗi trong parallel
  // Tốt
  List<String> other = names.stream().toList();
  ```

### 4. Pipeline dài khó đọc: thiếu đặt tên cho bước trung gian.
- **Trả lời**:
  ```java
  // Xấu
  List<String> result = users.stream().filter(...).map(...).toList();
  // Tốt
  Stream<User> filtered = users.stream().filter(u -> u.getAge() > 18);
  List<String> result = filtered.map(User::getName).toList();
  ```

---

## 16) Testing & đảm bảo đúng chức năng sau refactor

### 1. Viết unit test cho các **hàm thuần** thay vì endpoint lớn.
- **Trả lời**:
  ```java
  @Test
  void testFilterPositive() {
      Function<List<Integer>, List<Integer>> filter = l -> l.stream().filter(n -> n > 0).toList();
      assertEquals(List.of(1, 2), filter.apply(List.of(-1, 1, 2)));
  }
  ```

### 2. Property-based testing (đầu vào ngẫu nhiên) cho `map/filter/reduce`.
- **Trả lời**:
  ```java
  @Property
  void testFilter(@ForAll @Size(min = 0, max = 100) List<Integer> input) {
      List<Integer> result = input.stream().filter(n -> n > 0).toList();
      assertTrue(result.stream().allMatch(n -> n > 0));
  }
  ```

### 3. ⚠️ Gài: So sánh kết quả **trước/sau** refactor với **golden master** — khi nào hữu ích?
- **Trả lời**:
    - **Hữu ích**: Khi đảm bảo hành vi không đổi sau refactor.
    - **Cách làm**: Chạy test trên cả code cũ/mới, so sánh output.
    - **Ví dụ**:
      ```java
      @Test
      void testRefactor() {
          List<Integer> oldResult = oldMethod(input);
          List<Integer> newResult = newMethod(input);
          assertEquals(oldResult, newResult);
      }
      ```

---

## 17) Thiết kế API “định hướng hàm”

### 1. Nhận vào `Function/Predicate/Comparator` thay vì “chiến lược” hard-code.
- **Trả lời**:
  ```java
  List<String> process(List<String> input, Predicate<String> filter) {
      return input.stream().filter(filter).toList();
  }
  ```

### 2. Trả về **view bất biến**/`Stream` thay vì collection mutable khi phù hợp.
- **Trả lời**:
  ```java
  Stream<String> getNames() { return names.stream(); } // View
  List<String> getImmutableNames() { return List.copyOf(names); } // Bất biến
  ```

### 3. ⚠️ Gài: Trả `Stream` từ method công khai — rủi ro gì nếu caller dùng sau khi nguồn đã đóng?
- **Trả lời**:
    - **Rủi ro**: `IllegalStateException` nếu nguồn Stream đã được tiêu thụ.
    - **Khắc phục**: Trả `Supplier<Stream>` hoặc collection bất biến.
    - **Ví dụ**:
      ```java
      Supplier<Stream<String>> getNames() { return () -> names.stream(); }
      ```

---

## 18) Sử dụng cấu trúc & tính năng mới hỗ trợ functional

### 1. Dùng **records** cho DTO bất biến trong pipeline.
- **Trả lời**:
  ```java
  record User(String name, int age) {}
  List<String> names = users.stream().map(User::name).toList();
  ```

### 2. Pattern matching (instanceof/switch) để thay chuỗi `if/else`.
- **Trả lời**:
  ```java
  // instanceof
  if (obj instanceof String s) { return s.length(); }
  // switch
  return switch (obj) {
      case String s -> s.length();
      default -> 0;
  };
  ```

### 3. ⚠️ Gài: Đệ quy “functional” trong Java không có **TCO** — hệ quả, cách thay thế bằng stream/loop.
- **Trả lời**:
    - **Hệ quả**: Đệ quy sâu gây `StackOverflowError` (no Tail Call Optimization).
    - **Thay thế**: Dùng Stream hoặc loop.
    - **Ví dụ**:
      ```java
      // Xấu
      int factorial(int n) { return n == 0 ? 1 : n * factorial(n - 1); }
      // Tốt
      int factorial(int n) { return IntStream.rangeClosed(1, n).reduce(1, (a, b) -> a * b); }
      ```

---

## 19) Migration & tooling

### 1. Xác định **điểm nóng** bằng profiler để chọn đoạn refactor trước.
- **Trả lời**:
    - **Cách làm**: Dùng VisualVM/JProfiler tìm đoạn code lặp nhiều, tốn CPU.
    - **Ví dụ**: Refactor loop lồng trong hotspot trước.

### 2. So sánh micro-benchmark (JMH) **trước/sau** refactor.
- **Trả lời**:
  ```java
  @Benchmark
  public List<Integer> old(Blackhole bh) {
      List<Integer> result = new ArrayList<>();
      for (int n : numbers) if (n > 0) result.add(n);
      return result;
  }
  @Benchmark
  public List<Integer> newStream(Blackhole bh) {
      return numbers.stream().filter(n -> n > 0).toList();
  }
  ```

### 3. ⚠️ Gài: Tin vào benchmark không chuẩn (thiếu warm-up, dead-code elimination) dẫn tới kết luận sai như thế nào?
- **Trả lời**:
    - **Sai lầm**:
        - Thiếu warm-up: Kết quả không ổn định do JIT.
        - Dead-code elimination: Code không chạy thực tế.
    - **Khắc phục**: Dùng JMH với warm-up, `Blackhole`.
    - **Ví dụ**:
      ```java
      @Benchmark
      public void test(Blackhole bh) { bh.consume(numbers.stream().sum()); }
      ```

---

## 20) Mini case (thực chiến 2–5 phút/câu)

### 1. Refactor danh sách `Order` để lấy top 10 khách theo doanh thu, bỏ các đơn `CANCELLED`, gộp theo khách, sắp xếp giảm dần.
- **Trả lời**:
  ```java
  record Order(String customerId, double amount, Status status) {}
  enum Status { ACTIVE, CANCELLED }
  List<Map.Entry<String, Double>> topCustomers = orders.stream()
      .filter(o -> o.status() != Status.CANCELLED)
      .collect(Collectors.groupingBy(Order::customerId, Collectors.summingDouble(Order::amount)))
      .entrySet().stream()
      .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
      .limit(10)
      .toList();
  ```

### 2. Từ danh sách `User`, lấy map `domain -> số lượng email`, không phân biệt hoa/thường, loại null/trống.
- **Trả lời**:
  ```java
  Map<String, Long> domainCounts = users.stream()
      .map(User::getEmail)
      .filter(email -> email != null && !email.isEmpty())
      .map(email -> email.substring(email.indexOf("@") + 1).toLowerCase())
      .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));
  ```

### 3. Chuyển thuật toán đếm từ khóa trong tệp văn bản (nhiều dòng) sang pipeline: tách từ, normalize, group, top-K.
- **Trả lời**:
  ```java
  List<Map.Entry<String, Long>> topWords = Files.lines(Path.of("file.txt"))
      .flatMap(line -> Arrays.stream(line.split("\\W+")))
      .map(String::toLowerCase)
      .filter(word -> !word.isEmpty())
      .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()))
      .entrySet().stream()
      .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
      .limit(k)
      .toList();
  ```

### 4. Biến đoạn code tạo `Map<Id, Product>` với `for` và `putIfAbsent` thành `toMap` có **merge function** đúng.
- **Trả lời**:
  ```java
  // Imperative
  Map<String, Product> map = new HashMap<>();
  for (Product p : products) map.putIfAbsent(p.getId(), p);
  // Functional
  Map<String, Product> map = products.stream()
      .collect(Collectors.toMap(Product::getId, Function.identity(), (p1, p2) -> p1));
  ```

### 5. Refactor chuỗi `if/else` tính phí giao hàng theo khu vực & hạng thành **map-of-functions** + `switch` expression.
- **Trả lời**:
  ```java
  enum Region { LOCAL, INTERNATIONAL }
  enum Tier { STANDARD, PREMIUM }
  Map<Region, Function<Tier, Double>> fees = Map.of(
      Region.LOCAL, t -> switch (t) { case STANDARD -> 5.0; case PREMIUM -> 10.0; },
      Region.INTERNATIONAL, t -> switch (t) { case STANDARD -> 15.0; case PREMIUM -> 25.0; }
  );
  double calculateFee(Region region, Tier tier) {
      return fees.getOrDefault(region, t -> 0.0).apply(tier);
  }
  ```

### 6. Ghép nhiều call REST song song (3 dịch vụ) bằng `CompletableFuture`: log lỗi chuẩn, timeout, và tổng hợp kết quả gọn.
- **Trả lời**:
  ```java
  CompletableFuture<String> call1 = CompletableFuture.supplyAsync(() -> callService1())
      .orTimeout(1, TimeUnit.SECONDS)
      .exceptionally(e -> { logger.error("Service1 failed", e); return null; });
  CompletableFuture<String> call2 = CompletableFuture.supplyAsync(() -> callService2())
      .orTimeout(1, TimeUnit.SECONDS)
      .exceptionally(e -> { logger.error("Service2 failed", e); return null; });
  CompletableFuture<String> call3 = CompletableFuture.supplyAsync(() -> callService3())
      .orTimeout(1, TimeUnit.SECONDS)
      .exceptionally(e -> { logger.error("Service3 failed", e); return null; });
  List<String> results = CompletableFuture.allOf(call1, call2, call3)
      .thenApply(v -> Stream.of(call1, call2, call3)
          .map(CompletableFuture::join)
          .filter(Objects::nonNull)
          .toList())
      .join();
  ```

### 7. Thay thế đoạn cập nhật `ArrayList` trong `parallelStream` gây lỗi bằng **collector** thread-safe hoặc gom về sequential ở đoạn mutate.
- **Trả lời**:
  ```java
  // Xấu
  List<Integer> result = new ArrayList<>();
  numbers.parallelStream().forEach(n -> result.add(n * 2)); // Race condition
  // Tốt
  List<Integer> result = numbers.parallelStream()
      .map(n -> n * 2)
      .collect(Collectors.toCollection(ArrayList::new)); // Thread-safe
  ```

### 8. Viết **collector tuỳ biến** tính trung vị (median) cho `IntStream` — bàn về trade-off bộ nhớ/độ phức tạp.
- **Trả lời**:
  ```java
  Collector<Integer, List<Integer>, Double> medianCollector = Collector.of(
      ArrayList::new,
      List::add,
      (a, b) -> { a.addAll(b); return a; },
      list -> {
          Collections.sort(list);
          return list.size() % 2 == 0
              ? (list.get(list.size() / 2 - 1) + list.get(list.size() / 2)) / 2.0
              : list.get(list.size() / 2) * 1.0;
      }
  );
  double median = numbers.stream().collect(medianCollector);
  ```
    - **Trade-off**:
        - **Bộ nhớ**: Lưu toàn bộ danh sách, O(n) space.
        - **Độ phức tạp**: Sắp xếp O(n log n).

### 9. Chuyển xử lý CSV: parse → validate → map DTO → group theo trạng thái → xuất thống kê, không tạo collection trung gian dư thừa.
- **Trả lời**:
  ```java
  record OrderDTO(String id, String status) {}
  Map<String, Long> stats = Files.lines(Path.of("orders.csv"))
      .map(line -> line.split(","))
      .filter(arr -> arr.length >= 2)
      .map(arr -> new OrderDTO(arr[0], arr[1]))
      .filter(dto -> !dto.id().isEmpty() && !dto.status().isEmpty())
      .collect(Collectors.groupingBy(OrderDTO::status, Collectors.counting()));
  ```

### 10. So sánh hiệu năng hai phiên bản: imperative tối ưu bằng mảng vs functional bằng stream — đề xuất tiêu chí chọn.
- **Trả lời**:
    - **Imperative (mảng)**:
        - **Ưu**: Hiệu năng cao, ít overhead, tốt cho CPU-bound.
        - **Nhược**: Code dài, dễ lỗi.
    - **Functional (Stream)**:
        - **Ưu**: Ngắn gọn, dễ bảo trì.
        - **Nhược**: Overhead boxing, pipeline.
    - **Tiêu chí chọn**:
        - Dữ liệu nhỏ, CPU-bound: Imperative.
        - Dữ liệu lớn, cần đọc hiểu: Stream.
    - **Ví dụ**:
      ```java
      // Imperative
      int sum = 0; for (int n : numbers) sum += n;
      // Functional
      int sum = numbers.stream().mapToInt(n -> n).sum();
      ```

---

