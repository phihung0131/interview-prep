## 1) Khái niệm & Functional Interface (SAM)

### 1. Lambda expression là gì? Nó triển khai **functional interface** (SAM) như thế nào?
- **Trả lời**:
    - **Lambda expression**: Biểu thức ngắn gọn biểu diễn một instance của **functional interface** (Single Abstract Method - SAM).
    - **Cách triển khai**: Compiler sinh một lớp ẩn danh implement SAM, ánh xạ lambda body vào abstract method.
    - **Ví dụ**:
      ```java
      @FunctionalInterface
      interface Action { void run(); }
      Action action = () -> System.out.println("Run"); // Lambda triển khai run()
      ```

### 2. `@FunctionalInterface` có tác dụng gì? Thiếu annotation này thì interface còn là functional interface không?
- **Trả lời**:
    - **Tác dụng `@FunctionalInterface`**: Đảm bảo interface chỉ có một abstract method, báo lỗi biên dịch nếu vi phạm.
    - **Thiếu annotation**: Vẫn là functional interface nếu chỉ có một abstract method.
    - **Ví dụ**:
      ```java
      interface MyAction { void run(); } // Vẫn là functional interface
      MyAction action = () -> {};
      ```

### 3. Liệt kê một số functional interfaces chuẩn trong `java.util.function` (Supplier, Consumer, Function, Predicate, Unary/BinaryOperator).
- **Trả lời**:
    - `Supplier<T>`: `T get()` - Tạo giá trị.
    - `Consumer<T>`: `void accept(T t)` - Xử lý giá trị.
    - `Function<T, R>`: `R apply(T t)` - Chuyển đổi T thành R.
    - `Predicate<T>`: `boolean test(T t)` - Kiểm tra điều kiện.
    - `UnaryOperator<T>`: `T apply(T t)` - Function với input/output cùng kiểu.
    - `BinaryOperator<T>`: `T apply(T t1, T t2)` - Function với hai input cùng kiểu.

### 4. ⚠️ Gài: Vì sao các method thừa kế từ `Object` (equals/hashCode/toString) **không** tính vào số lượng abstract methods khi xác định functional interface?
- **Trả lời**:
    - **Lý do**: Các method của `Object` (`equals`, `hashCode`, `toString`) có sẵn trong mọi lớp, không cần khai báo abstract.
    - **Hệ quả**: Functional interface chỉ đếm abstract method riêng.
    - **Ví dụ**:
      ```java
      @FunctionalInterface
      interface Action {
          void run();
          boolean equals(Object o); // Không tính
      }
      ```

---

## 2) Cú pháp lambda

### 1. Các dạng cú pháp hợp lệ: không tham số `() -> …`, một tham số `x -> …`, nhiều tham số `(x, y) -> …`, khối lệnh `{ … }`, `return`.
- **Trả lời**:
    - **Không tham số**: `() -> System.out.println("Hi")`
    - **Một tham số**: `x -> x * 2`
    - **Nhiều tham số**: `(x, y) -> x + y`
    - **Khối lệnh**: `(x, y) -> { return x + y; }`
    - **Quy tắc**: Dùng `{}` khi cần nhiều statement hoặc `return`.

### 2. Khi nào có thể lược bỏ kiểu tham số? Khi nào buộc phải ghi kiểu?
- **Trả lời**:
    - **Lược bỏ**: Khi compiler suy luận được kiểu từ context (target typing).
    - **Buộc ghi kiểu**: Khi context không rõ (overloaded methods, phức tạp).
    - **Ví dụ**:
      ```java
      Function<String, Integer> f = s -> s.length(); // Lược bỏ
      Function f = (String s) -> s.length(); // Ghi rõ
      ```

### 3. ⚠️ Gài: `x -> { return x + 1; }` khác gì `x -> x + 1` về ngữ nghĩa và ràng buộc cú pháp (statement vs expression)?
- **Trả lời**:
    - **`x -> x + 1`**: Expression lambda, trả về giá trị trực tiếp.
    - **`x -> { return x + 1; }`**: Statement lambda, yêu cầu `{}` và `return` rõ ràng.
    - **Khác biệt**: Expression ngắn gọn hơn, statement cần `;` và `{}`.
    - **Ví dụ**:
      ```java
      Function<Integer, Integer> f1 = x -> x + 1; // Expression
      Function<Integer, Integer> f2 = x -> { return x + 1; }; // Statement
      ```

---

## 3) Target typing & type inference

### 1. **Target typing** là gì? Tại sao cùng một lambda có thể gán cho `Runnable` hoặc `Callable<T>` tuỳ ngữ cảnh?
- **Trả lời**:
    - **Target typing**: Compiler suy luận kiểu của lambda dựa trên interface mục tiêu.
    - **Lý do**: Lambda không có kiểu cố định, ánh xạ vào SAM của interface.
    - **Ví dụ**:
      ```java
      Runnable r = () -> System.out.println("Run");
      Callable<String> c = () -> "Done";
      ```

### 2. Suy luận kiểu tham số và kiểu trả về của lambda diễn ra như thế nào?
- **Trả lời**:
    - **Tham số**: Suy luận từ chữ ký SAM (parameter types).
    - **Trả về**: Suy luận từ body lambda và return type của SAM.
    - **Ví dụ**:
      ```java
      Function<String, Integer> f = s -> s.length(); // String từ input, Integer từ return
      ```

### 3. ⚠️ Gài: Trường hợp **mơ hồ** giữa `overloadedMethod(Runnable)` và `overloadedMethod(Callable<String>)`—compiler chọn thế nào? Cách giải mơ hồ?
- **Trả lời**:
    - **Mơ hồ**: Compiler không chọn được nếu lambda khớp cả hai SAM.
    - **Giải pháp**: Cast tường minh hoặc chỉ định kiểu tham số.
    - **Ví dụ**:
      ```java
      void overloadedMethod(Runnable r) {}
      void overloadedMethod(Callable<String> c) {}
      overloadedMethod((Runnable) () -> {}); // Cast rõ
      ```

---

## 4) Method Reference

### 1. Bốn dạng method reference: `obj::instanceMethod`, `Class::staticMethod`, `Class::instanceMethod`, `Class::new` (constructor).
- **Trả lời**:
    - **`obj::instanceMethod`**: Gọi method trên object cụ thể.
    - **`Class::staticMethod`**: Gọi static method.
    - **`Class::instanceMethod`**: Gọi method trên tham số đầu tiên.
    - **`Class::new`**: Gọi constructor.
    - **Ví dụ**:
      ```java
      String s = "test";
      Function<String, String> f1 = s::toUpperCase;
      Function<String, Integer> f2 = String::valueOf;
      BiFunction<String, String, Integer> f3 = String::compareTo;
      Supplier<String> f4 = String::new;
      ```

### 2. Khi nào nên dùng method reference thay cho lambda để code dễ đọc hơn?
- **Trả lời**:
    - **Dùng method reference**: Khi logic lambda chỉ gọi một method có sẵn, ngắn gọn và rõ ý nghĩa.
    - **Ví dụ**:
      ```java
      Function<String, Integer> f = String::length; // Tốt hơn s -> s.length()
      ```

### 3. ⚠️ Gài: Sự khác nhau giữa `String::toLowerCase` dùng như `Function<String,String>` và `BiFunction<String,Locale,String>` (overload resolution)?
- **Trả lời**:
    - **Khác biệt**: Compiler chọn method reference dựa trên chữ ký SAM.
    - **`String::toLowerCase`**:
        - `Function<String, String>`: Ánh xạ đến `toLowerCase()`.
        - `BiFunction<String, Locale, String>`: Ánh xạ đến `toLowerCase(Locale)`.
    - **Ví dụ**:
      ```java
      Function<String, String> f = String::toLowerCase; // toLowerCase()
      BiFunction<String, Locale, String> bf = String::toLowerCase; // toLowerCase(Locale)
      ```

---

## 5) Phạm vi, capture & “effectively final”

### 1. Quy tắc **effectively final** là gì? Vì sao lambda **không** sửa được biến local?
- **Trả lời**:
    - **Effectively final**: Biến local phải là `final` hoặc không thay đổi sau khởi tạo.
    - **Lý do**: Lambda capture biến bằng tham chiếu, sửa đổi gây lỗi đồng bộ hóa.
    - **Ví dụ**:
      ```java
      int x = 1;
      Runnable r = () -> System.out.println(x); // OK, x effectively final
      ```

### 2. ⚠️ Gài: Tại sao đoạn code trong vòng lặp `for (int i...) { tasks.add(() -> use(i)); }` đôi khi không chạy như mong đợi? So sánh với JavaScript closure.
- **Trả lời**:
    - **Vấn đề**: Lambda capture `i` bằng tham chiếu, dùng giá trị cuối cùng của `i`.
    - **So sánh JavaScript**:
        - Java: `i` là biến loop, tất cả lambda dùng cùng `i`.
        - JavaScript: `var` tạo closure trên cùng biến, `let` tạo mới mỗi vòng.
    - **Khắc phục**: Tạo biến local tạm.
    - **Ví dụ**:
      ```java
      List<Runnable> tasks = new ArrayList<>();
      for (int i = 0; i < 3; i++) {
          int temp = i; // Biến tạm
          tasks.add(() -> System.out.println(temp));
      }
      ```

### 3. Khác biệt **lớn** giữa lambda và anonymous class về `this`/`super`/shadowing biến là gì?
- **Trả lời**:
    - **Lambda**:
        - `this` trỏ đến enclosing class.
        - Không thể shadow biến local.
    - **Anonymous class**:
        - `this` trỏ đến instance của anonymous class.
        - Có thể shadow biến local.
    - **Ví dụ**:
      ```java
      class Test {
          void method() {
              int x = 1;
              Runnable r = () -> System.out.println(this); // Test instance
              Runnable anon = new Runnable() { public void run() { System.out.println(this); } }; // Anonymous instance
          }
      }
      ```

### 4. Lambda có thể truy cập field/method của lớp bao quanh như thế nào? Rủi ro concurrency?
- **Trả lời**:
    - **Truy cập**: Lambda truy cập field/method của enclosing class qua `this`.
    - **Rủi ro concurrency**: Field mutable có thể gây race condition.
    - **Ví dụ**:
      ```java
      class Counter {
          int count;
          Runnable r = () -> count++; // Không thread-safe
      }
      ```

---

## 6) Lambda & Exceptions (checked/unchecked)

### 1. Cách xử lý **checked exception** trong lambda khi dùng các interface chuẩn (Predicate/Function) vốn **không throws**.
- **Trả lời**:
    - **Cách xử lý**:
        - Wrap checked exception trong `RuntimeException`.
        - Dùng try-catch trong lambda.
    - **Ví dụ**:
      ```java
      Function<String, String> f = s -> {
          try { return Files.readString(Path.of(s)); }
          catch (IOException e) { throw new RuntimeException(e); }
      };
      ```

### 2. ⚠️ Gài: “Sneaky throws”/wrap exception (RuntimeException) — ưu/nhược, khi nào nên tránh?
- **Trả lời**:
    - **Sneaky throws**: Ném checked exception như unchecked.
    - **Ưu**: Đơn giản hóa code, không cần thay đổi chữ ký SAM.
    - **Nhược**: Che giấu hợp đồng exception, gây khó debug.
    - **Tránh khi**: Caller cần xử lý checked exception rõ ràng.
    - **Ví dụ**:
      ```java
      Function<String, String> f = s -> { throw new IOException(); }; // Lỗi biên dịch
      Function<String, String> sneaky = s -> { throw new RuntimeException(new IOException()); }; // OK
      ```

### 3. Thiết kế functional interface **tự định nghĩa** để ném checked exception (`ThrowingFunction`)—ý tưởng và trade-off.
- **Trả lời**:
    - **Ý tưởng**:
      ```java
      @FunctionalInterface
      interface ThrowingFunction<T, R> { R apply(T t) throws Exception; }
      ```
    - **Trade-off**:
        - **Ưu**: Hỗ trợ checked exception rõ ràng.
        - **Nhược**: Caller phải xử lý `Exception`, mất tương thích với SAM chuẩn.

---

## 7) Generics, intersection types & overloading

### 1. Lambda tương tác với **generics** như thế nào (ví dụ `Function<T,R>`, `Comparator<T>`)?
- **Trả lời**:
    - Lambda ánh xạ vào generic SAM, compiler suy luận kiểu `T`, `R`.
    - **Ví dụ**:
      ```java
      Function<String, Integer> f = s -> s.length();
      Comparator<String> c = (a, b) -> a.compareTo(b);
      ```

### 2. ⚠️ Gài: **Intersection type** trong `(<T extends Runnable & Serializable>)`—làm sao gán một lambda thành `Runnable & Serializable`?
- **Trả lời**:
    - **Cách gán**: Cast lambda để đáp ứng cả hai interface.
    - **Ví dụ**:
      ```java
      <T extends Runnable & Serializable> void run(T t) {}
      run((Runnable & Serializable) () -> System.out.println("Run"));
      ```

### 3. Overload method nhận nhiều SAM khác nhau: quy tắc chọn hàm và kỹ thuật **cast** tường minh.
- **Trả lời**:
    - **Quy tắc chọn**: Compiler ưu tiên method với SAM cụ thể hơn.
    - **Cast tường minh**: Dùng để giải quyết mơ hồ.
    - **Ví dụ**:
      ```java
      void process(Runnable r) {}
      void process(Callable<String> c) {}
      process((Runnable) () -> {}); // Cast rõ
      ```

---

## 8) Bất biến, trạng thái & side-effects

### 1. Lambda **stateless** vs **stateful**: khác nhau, rủi ro khi dùng state mutable (đếm, cộng dồn) trong stream.
- **Trả lời**:
    - **Stateless**: Lambda không lưu trạng thái, an toàn.
    - **Stateful**: Lambda lưu trạng thái (mutable), nguy cơ race condition.
    - **Rủi ro**: Mutable state trong parallel stream gây lỗi.
    - **Ví dụ**:
      ```java
      List<Integer> list = new ArrayList<>();
      stream.forEach(i -> list.add(i)); // Không an toàn
      ```

### 2. ⚠️ Gài: Vì sao side-effect trong `map`/`filter` của stream thường là **mùi**? Trường hợp nào chấp nhận được?
- **Trả lời**:
    - **Mùi**: `map`/`filter` nên thuần túy (pure), side-effect phá vỡ tính bất biến.
    - **Chấp nhận được**: Logging hoặc debug nhẹ, không ảnh hưởng logic.
    - **Ví dụ**:
      ```java
      stream.map(x -> { System.out.println(x); return x; }); // Mùi
      ```

### 3. Kỹ thuật gom kết quả đúng cách: dùng `collect`, `reduce` thay cho cập nhật biến ngoài.
- **Trả lời**:
    - **Cách đúng**: Dùng `collect` hoặc `reduce` để tích lũy kết quả.
    - **Ví dụ**:
      ```java
      List<String> result = stream.collect(Collectors.toList()); // Tốt
      List<String> bad = new ArrayList<>();
      stream.forEach(bad::add); // Xấu
      ```

---

## 9) Lambda & Streams

### 1. Viết pipeline điển hình với stream: `map`, `filter`, `flatMap`, `sorted`, `collect`.
- **Trả lời**:
  ```java
  List<String> result = list.stream()
      .filter(s -> s.length() > 2)
      .map(String::toUpperCase)
      .flatMap(s -> Stream.of(s.split(" ")))
      .sorted()
      .collect(Collectors.toList());
  ```

### 2. ⚠️ Gài: Vì sao `forEach` **không** nên dùng để biến đổi dữ liệu? Thay vào đó nên dùng gì?
- **Trả lời**:
    - **Lý do**: `forEach` gây side-effect, khó kiểm soát, không thread-safe.
    - **Thay thế**: Dùng `collect`, `reduce`, hoặc `map`.
    - **Ví dụ**:
      ```java
      // Xấu
      List<String> result = new ArrayList<>();
      list.forEach(result::add);
      // Tốt
      List<String> result = list.stream().collect(Collectors.toList());
      ```

### 3. Liên hệ comparator: `Comparator.comparing`, `thenComparing`, `reversed`—cách kết hợp method reference & lambda.
- **Trả lời**:
  ```java
  Comparator<Person> comp = Comparator.comparing(Person::getLastName)
      .thenComparing(Person::getFirstName, String.CASE_INSENSITIVE_ORDER)
      .reversed();
  ```

---

## 10) Hiệu năng & bytecode

### 1. Lambda được triển khai bằng `invokedynamic` và `LambdaMetafactory`—ý nghĩa đối với hiệu năng là gì?
- **Trả lời**:
    - **`invokedynamic`**: Tối ưu hóa tạo instance lambda, giảm overhead so với anonymous class.
    - **`LambdaMetafactory`**: Sinh lambda instance tại runtime, tái sử dụng nếu non-capturing.
    - **Hiệu năng**: Nhanh hơn anonymous class, ít tốn bộ nhớ.

### 2. ⚠️ Gài: **Capturing lambda** khác **non-capturing lambda** về việc cache/reuse instance thế nào?
- **Trả lời**:
    - **Non-capturing**: Không capture biến, instance được cache/reuse.
    - **Capturing**: Capture biến, tạo instance mới mỗi lần.
    - **Ví dụ**:
      ```java
      Runnable r1 = () -> System.out.println("Hi"); // Cache
      int x = 1;
      Runnable r2 = () -> System.out.println(x); // Không cache
      ```

### 3. Khi nào lambda **nhanh hơn**/tương đương/“không nhanh hơn” so với code imperative? Lưu ý boxing/unboxing.
- **Trả lời**:
    - **Nhanh hơn**: Stream pipeline tối ưu hóa (lazy evaluation).
    - **Tương đương**: Vòng lặp đơn giản, không boxing.
    - **Không nhanh hơn**: Boxing/unboxing nhiều (ví dụ: `IntStream` tốt hơn `Stream<Integer>`).
    - **Ví dụ**:
      ```java
      IntStream.range(0, 100).sum(); // Nhanh hơn Stream<Integer>
      ```

---

## 11) Concurrency & parallel

### 1. Dùng lambda trong `CompletableFuture`, `ExecutorService`: best practices khi truyền hàm.
- **Trả lời**:
    - **Best practices**:
        - Dùng lambda non-capturing hoặc stateless.
        - Tránh side-effect, dùng immutable data.
    - **Ví dụ**:
      ```java
      CompletableFuture.supplyAsync(() -> computeResult())
          .thenAccept(System.out::println);
      ```

### 2. ⚠️ Gài: Vì sao **stateful lambda** + **parallel stream** có thể gây kết quả sai/`ConcurrentModificationException`?
- **Trả lời**:
    - **Lý do**: Stateful lambda sửa đổi shared mutable state, gây race condition.
    - **Ví dụ**:
      ```java
      List<Integer> list = new ArrayList<>();
      IntStream.range(0, 100).parallel().forEach(i -> list.add(i)); // ConcurrentModificationException
      ```

### 3. Kỹ thuật thread-safety khi dùng lambda: dùng collectors concurrent, tránh shared mutable state.
- **Trả lời**:
    - **Concurrent collectors**: Dùng `toConcurrentMap`, `groupingByConcurrent`.
    - **Tránh mutable state**: Sử dụng immutable hoặc thread-local.
    - **Ví dụ**:
      ```java
      Map<Integer, Long> map = stream.parallel()
          .collect(Collectors.groupingByConcurrent(i -> i, Collectors.counting()));
      ```

---

## 12) Optional & higher-order functions

### 1. Dùng lambda với `Optional`: `map`, `flatMap`, `filter`, `orElseGet`, `ifPresentOrElse`.
- **Trả lời**:
  ```java
  Optional<String> opt = Optional.of("test");
  opt.map(String::toUpperCase)
     .filter(s -> s.length() > 2)
     .ifPresentOrElse(System.out::println, () -> System.out.println("Empty"));
  ```

### 2. **Function composition**: `andThen`, `compose`, `Predicate.and/or/negate`.
- **Trả lời**:
    - **`andThen`**: Thực hiện function thứ hai sau.
    - **`compose`**: Thực hiện function thứ hai trước.
    - **`Predicate.and/or/negate`**: Kết hợp điều kiện logic.
    - **Ví dụ**:
      ```java
      Function<String, String> f1 = String::toUpperCase;
      Function<String, String> f2 = s -> s + "!";
      Function<String, String> combined = f1.andThen(f2); // TEST!
      ```

### 3. ⚠️ Gài: Sự khác nhau về thứ tự với `f.andThen(g)` và `g.compose(f)`; ví dụ gây nhầm.
- **Trả lời**:
    - **`f.andThen(g)`**: Thực hiện `f` rồi `g` (`g(f(x))`).
    - **`g.compose(f)`**: Thực hiện `f` rồi `g` (`g(f(x))`).
    - **Gây nhầm**: Dễ nhầm thứ tự áp dụng.
    - **Ví dụ**:
      ```java
      Function<Integer, Integer> f = x -> x + 1;
      Function<Integer, Integer> g = x -> x * 2;
      f.andThen(g).apply(1); // (1+1)*2 = 4
      g.compose(f).apply(1); // (1+1)*2 = 4
      ```

---

## 13) Annotation & `var` trong tham số lambda

### 1. Khi nào cần **kiểu tường minh** hoặc dùng `var` trong tham số lambda? Quy tắc đồng nhất (all-or-none).
- **Trả lời**:
    - **Kiểu tường minh**: Khi compiler không suy luận được (overloaded SAM).
    - **Dùng `var`** (Java 11+): Để gắn annotation hoặc tăng rõ ràng.
    - **Quy tắc**: Tất cả tham số phải dùng `var` hoặc không.
    - **Ví dụ**:
      ```java
      BiFunction<String, String, Integer> f = (var x, var y) -> x.length() + y.length();
      ```

### 2. ⚠️ Gài: Gắn annotation (ví dụ `@Nonnull`) lên tham số lambda—cú pháp đúng và hạn chế hiện tại?
- **Trả lời**:
    - **Cú pháp**:
      ```java
      BiFunction<String, String, Integer> f = (@Nonnull var x, @Nonnull var y) -> x.length();
      ```
    - **Hạn chế**: Không thể dùng annotation nếu không dùng `var`.

---

## 14) So sánh với anonymous class & method handle

### 1. Ưu/nhược của lambda so với **anonymous inner class** về độ gọn và scoping.
- **Trả lời**:
    - **Ưu lambda**:
        - Ngắn gọn, ít boilerplate.
        - `this` trỏ enclosing class, tránh nhầm lẫn.
    - **Nhược**:
        - Không thể shadow biến local.
        - Khó debug hơn.
    - **Ví dụ**:
      ```java
      Runnable lambda = () -> System.out.println("Run");
      Runnable anon = new Runnable() { public void run() { System.out.println("Run"); } };
      ```

### 2. ⚠️ Gài: `this` trong lambda trỏ tới đâu so với anonymous class?
- **Trả lời**:
    - **Lambda**: `this` trỏ enclosing class.
    - **Anonymous class**: `this` trỏ instance của anonymous class.
    - **Ví dụ**:
      ```java
      class Test {
          void method() {
              Runnable r = () -> System.out.println(this); // Test
              Runnable anon = new Runnable() { public void run() { System.out.println(this); } }; // Anonymous
          }
      }
      ```

### 3. Khi nào cân nhắc **Method Handle** thay vì lambda cho hiệu năng/case framework?
- **Trả lời**:
    - **Method Handle**: Linh hoạt hơn, hỗ trợ dynamic invocation, dùng trong framework (reflection, proxy).
    - **Lambda**: Dễ dùng, hiệu năng tốt cho SAM.
    - **Khi dùng Method Handle**: Khi cần invoke method động hoặc hiệu năng cao trong framework.

---

## 15) Serialization, equals/hashCode & logging

### 1. Lambda có nên/không nên **Serializable**? Hệ quả khi serialize (khả năng vỡ tương thích).
- **Trả lời**:
    - **Nên**: Khi cần truyền lambda qua mạng/file.
    - **Hệ quả**: Phụ thuộc JVM, dễ vỡ nếu class thay đổi.
    - **Ví dụ**:
      ```java
      @FunctionalInterface
      interface MyAction extends Serializable { void run(); }
      MyAction action = () -> System.out.println("Run");
      ```

### 2. ⚠️ Gài: Hai lambda có cùng code có **equals()** bằng nhau không? Có nên dùng lambda làm key Map?
- **Trả lời**:
    - **Không equals**: Hai lambda dù cùng code có instance khác nhau, `equals()` trả `false`.
    - **Không nên dùng làm key Map**: Vì `equals`/`hashCode` không đáng tin cậy.
    - **Ví dụ**:
      ```java
      Runnable r1 = () -> {};
      Runnable r2 = () -> {};
      System.out.println(r1.equals(r2)); // false
      ```

### 3. Thực hành logging với lambda (SLF4J không hỗ trợ supplier như Java Util Logging)—lợi/hại.
- **Trả lời**:
    - **Lợi**: Trì hoãn tính toán log message, tiết kiệm CPU nếu log level không bật.
    - **Hại**: SLF4J không hỗ trợ `Supplier`, phải tự wrap.
    - **Ví dụ**:
      ```java
      Logger logger = Logger.getLogger("test");
      logger.log(Level.INFO, () -> "Expensive computation");
      ```

---

## 16) Mini case (thực chiến 2–5 phút/câu)

### 1. Viết comparator sắp xếp `User` theo `lastName`, rồi `firstName` (nulls last), không phân biệt hoa/thường.
- **Trả lời**:
  ```java
  record User(String lastName, String firstName) {}
  Comparator<User> comp = Comparator
      .comparing(User::lastName, String.CASE_INSENSITIVE_ORDER.thenComparing(Comparator.nullsLast(Comparator.naturalOrder())))
      .thenComparing(User::firstName, String.CASE_INSENSITIVE_ORDER.thenComparing(Comparator.nullsLast(Comparator.naturalOrder())));
  ```

### 2. Chuyển một đoạn code imperative lọc–map–sắp xếp sang stream + lambda, đảm bảo **không side-effect**.
- **Trả lời**:
  ```java
  // Imperative
  List<String> result = new ArrayList<>();
  for (String s : list) {
      if (s.length() > 2) result.add(s.toUpperCase());
  }
  Collections.sort(result);
  // Stream
  List<String> result = list.stream()
      .filter(s -> s.length() > 2)
      .map(String::toUpperCase)
      .sorted()
      .collect(Collectors.toList());
  ```

### 3. Tạo `RetryingFunction<T,R>` (functional interface) cho phép retry N lần với backoff; demo bọc một `Function<T,R>`.
- **Trả lời**:
  ```java
  @FunctionalInterface
  interface RetryingFunction<T, R> {
      R apply(T t) throws Exception;
  }
  static <T, R> Function<T, R> retry(RetryingFunction<T, R> func, int retries, long backoff) {
      return t -> {
          for (int i = 0; i < retries; i++) {
              try { return func.apply(t); }
              catch (Exception e) { if (i == retries - 1) throw new RuntimeException(e); }
              try { Thread.sleep(backoff); } catch (InterruptedException ignored) {}
          }
          throw new IllegalStateException();
      };
  }
  ```

### 4. Viết `Collectors.toMap` an toàn khi có key trùng, chỉ định `LinkedHashMap` làm implementation, và **merge function** phù hợp.
- **Trả lời**:
  ```java
  Map<String, Integer> map = list.stream()
      .collect(Collectors.toMap(
          s -> s,
          String::length,
          (v1, v2) -> v1, // Giữ giá trị đầu tiên
          LinkedHashMap::new
      ));
  ```

### 5. Biến danh sách `List<List<String>>` thành một **set** các từ duy nhất, lower-case, bỏ trống—dùng `flatMap`.
- **Trả lời**:
  ```java
  Set<String> result = lists.stream()
      .flatMap(List::stream)
      .filter(s -> !s.isBlank())
      .map(String::toLowerCase)
      .collect(Collectors.toSet());
  ```

### 6. Sửa một pipeline song song sai vì cập nhật `ArrayList` trong `forEach`—đưa ra 2 cách đúng (collector thread-safe hoặc thu gọn về sequential phần nguy hiểm).
- **Trả lời**:
  ```java
  // Sai
  List<Integer> result = new ArrayList<>();
  list.parallelStream().forEach(result::add);
  // Cách 1: Collector thread-safe
  List<Integer> result1 = list.parallelStream().collect(Collectors.toList());
  // Cách 2: Sequential
  List<Integer> result2 = new ArrayList<>();
  list.stream().forEach(result2::add);
  ```

---

