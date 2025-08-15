## 1) Tổng quan & thuật ngữ

### 1. Generics giải quyết vấn đề gì so với kiểu raw (trước Java 5)? Lợi ích về type-safety & đọc hiểu?
- **Trả lời**:
    - **Vấn đề raw types**: Trước Java 5, collection (`List`, `Map`) dùng `Object`, yêu cầu cast thủ công, dễ gây `ClassCastException` và khó đọc.
    - **Lợi ích generics**:
        - **Type-safety**: Kiểm tra kiểu tại compile-time, tránh lỗi runtime.
        - **Đọc hiểu**: Code rõ ràng hơn, ví dụ `List<String>` thay vì `List`.
    - **Ví dụ**:
      ```java
      // Raw type
      List list = new ArrayList(); list.add("text"); String s = (String) list.get(0);
      // Generic
      List<String> list = new ArrayList<>(); list.add("text"); String s = list.get(0);
      ```

### 2. Thuật ngữ: type parameter, type argument, generic class, generic method, raw type — định nghĩa từng khái niệm.
- **Trả lời**:
    - **Type parameter**: Biến kiểu trong khai báo (`T` trong `class Box<T>`).
    - **Type argument**: Kiểu cụ thể khi sử dụng (`String` trong `Box<String>`).
    - **Generic class**: Lớp dùng type parameter (`class Box<T>`).
    - **Generic method**: Phương thức có type parameter riêng (`<T> T method(T t)`).
    - **Raw type**: Generic class/interface dùng mà không chỉ định type argument (`List` thay vì `List<String>`).

### 3. Quy ước đặt tên type parameter: `T, E, K, V, R, U`, `T extends Number`… Ý nghĩa và khi nào dùng nhiều tham số (`<K,V>`).
- **Trả lời**:
    - **Quy ước**:
        - `T`: Type tổng quát.
        - `E`: Element (dùng trong collection).
        - `K`, `V`: Key, Value (dùng trong `Map`).
        - `R`: Return type.
        - `U`: Tham số phụ.
    - **Bounded type**: `T extends Number` giới hạn kiểu (ví dụ: chỉ số).
    - **Nhiều tham số**: Dùng khi cần nhiều kiểu, ví dụ `<K,V>` trong `Map<K,V>`.

### 4. ⚠️ Gài: Khác nhau giữa **type parameter** (ở định nghĩa) và **type argument** (khi sử dụng).
- **Trả lời**:
    - **Type parameter**: Biến kiểu trong khai báo generic (`T` trong `class Box<T>`).
    - **Type argument**: Kiểu cụ thể khi khởi tạo (`String` trong `Box<String>`).
    - **Ví dụ**:
      ```java
      class Box<T> {} // T là type parameter
      Box<String> box = new Box<>(); // String là type argument
      ```

### 5. Vì sao compile-time generics vẫn chạy trên JVM **type-erasure**?
- **Trả lời**:
    - **Type erasure**: JVM xóa thông tin generic tại runtime, thay bằng `Object` hoặc bound (nếu có), để đảm bảo tương thích ngược với Java pre-5.
    - **Lý do**: JVM không biết về generics, chỉ xử lý bytecode đã xóa kiểu.

---

## 2) Khai báo lớp & interface generic

### 1. Cú pháp khai báo `class Box<T>`; sự khác biệt `class Box<T extends Number>`.
- **Trả lời**:
    - **Cú pháp**:
      ```java
      class Box<T> { private T value; }
      ```
    - **Bounded type**:
      ```java
      class Box<T extends Number> { T value; } // Chỉ chấp nhận Number hoặc subtype
      ```
    - **Khác biệt**: `T extends Number` giới hạn `T` là `Number` hoặc các lớp con (`Integer`, `Double`).

### 2. `interface Comparable<T>`/`Comparator<T>` minh hoạ lợi ích generics ở API chuẩn ra sao?
- **Trả lời**:
    - **Lợi ích**:
        - `Comparable<T>`: Đảm bảo so sánh cùng kiểu, tránh cast.
        - `Comparator<T>`: Tách logic so sánh, type-safe.
    - **Ví dụ**:
      ```java
      class Person implements Comparable<Person> {
          public int compareTo(Person p) { return 0; } // Type-safe
      }
      ```

### 3. Lớp generic lồng nhau: `class Outer<T> { static class Inner<U> {…} }` — ràng buộc nào với `static`?
- **Trả lời**:
    - **Ràng buộc**: `static` inner class không phụ thuộc instance của `Outer<T>`, nên `Inner<U>` có type parameter riêng (`U`).
    - **Ví dụ**:
      ```java
      class Outer<T> {
          static class Inner<U> { U value; }
      }
      Outer.Inner<String> inner = new Outer.Inner<>();
      ```

### 4. ⚠️ Gài: Có thể **extends** một lớp generic và **thay đổi** type parameter không? Ví dụ `class IntBox extends Box<Integer>`.
- **Trả lời**:
    - **Có thể**: Kế thừa và chỉ định type argument cụ thể.
    - **Ví dụ**:
      ```java
      class Box<T> { T value; }
      class IntBox extends Box<Integer> {} // Hợp lệ
      ```
    - **Không thể**: Thay đổi type parameter (`class IntBox<T> extends Box<Integer>` không hợp lệ).

### 5. Tại sao `static` field/method **không** thể dùng type parameter của lớp (`T`)?
- **Trả lời**:
    - **Lý do**: `static` thành viên thuộc về lớp, không phụ thuộc instance, trong khi `T` liên kết với instance.
    - **Ví dụ**:
      ```java
      class Box<T> {
          // static T value; // Lỗi biên dịch
          static <U> void method(U u) {} // Hợp lệ, U riêng cho method
      }
      ```

---

## 3) Phương thức & constructor generic

### 1. Khai báo **method generic**: `static <T> T identity(T x)`; khác gì so với class generic.
- **Trả lời**:
    - **Cú pháp**:
      ```java
      static <T> T identity(T x) { return x; }
      ```
    - **Khác biệt**:
        - Method generic: Type parameter riêng, không phụ thuộc lớp.
        - Class generic: Type parameter áp dụng cho toàn lớp.
    - **Ví dụ**:
      ```java
      class Util {
          static <T> T identity(T x) { return x; }
      }
      ```

### 2. Constructor generic có cú pháp thế nào? Khi nào cần constructor đặt type parameter riêng?
- **Trả lời**:
    - **Cú pháp**:
      ```java
      class Box<T> {
          <U> Box(U value) {} // U riêng cho constructor
      }
      ```
    - **Khi cần**: Khi constructor xử lý kiểu khác với `T` của lớp.

### 3. Bounded type parameter trên **method**: `<T extends Comparable<T>>` — ý nghĩa và use case.
- **Trả lời**:
    - **Ý nghĩa**: Giới hạn `T` phải implement `Comparable<T>` để so sánh.
    - **Use case**: Sắp xếp, tìm max/min.
    - **Ví dụ**:
      ```java
      static <T extends Comparable<T>> T max(T a, T b) {
          return a.compareTo(b) > 0 ? a : b;
      }
      ```

### 4. ⚠️ Gài: Vì sao method generic `static` thường xuất hiện trong **utility class**?
- **Trả lời**:
    - **Lý do**:
        - Utility class không cần instance, `static` method phù hợp.
        - Generic method cung cấp tính linh hoạt cho nhiều kiểu.
    - **Ví dụ**:
      ```java
      class Collections {
          static <T> List<T> emptyList() { return new ArrayList<>(); }
      }
      ```

### 5. Overload giữa method generic & non-generic: quy tắc chọn phương thức.
- **Trả lời**:
    - **Quy tắc**: Compiler ưu tiên phương thức cụ thể hơn (non-generic hoặc generic với bound cụ thể).
    - **Ví dụ**:
      ```java
      void process(String s) {}
      <T> void process(T t) {}
      process("test"); // Chọn non-generic
      ```

---

## 4) Suy luận kiểu (Type inference) & Diamond operator

### 1. Trình bày **type inference** khi gọi method generic và khi khởi tạo: `var list = new ArrayList<String>();` vs `new ArrayList<>()`.
- **Trả lời**:
    - **Method generic**: Compiler suy luận kiểu từ tham số hoặc context.
    - **Khởi tạo**:
        - `var list = new ArrayList<String>()`: Suy luận từ khai báo.
        - `new ArrayList<>()`: Diamond operator, suy luận từ context.
    - **Ví dụ**:
      ```java
      <T> T identity(T t) { return t; }
      String s = identity("text"); // Suy luận T = String
      var list = new ArrayList<String>(); // Suy luận List<String>
      ```

### 2. Diamond operator `<>` hoạt động thế nào? Giới hạn khi có **anonymous class**.
- **Trả lời**:
    - **Diamond operator**: Suy luận kiểu từ context, bỏ type argument trong `new`.
    - **Giới hạn anonymous class**: Không suy luận được vì không có kiểu cụ thể.
    - **Ví dụ**:
      ```java
      List<String> list = new ArrayList<>(); // OK
      List<String> anon = new ArrayList<>() { }; // Lỗi, cần List<String>
      ```

### 3. ⚠️ Gài: Khi nào compiler **không** suy luận được kiểu và cần chỉ định tường minh `<String>`?
- **Trả lời**:
    - **Không suy luận được**: Khi context không rõ (ví dụ: gán vào raw type, hoặc lambda phức tạp).
    - **Ví dụ**:
      ```java
      List list = new ArrayList<>(); // Raw type, cần <String>
      <T> T process(T t); process("text"); // Cần <String>process("text")
      ```

### 4. Ảnh hưởng của inference đối với **method reference** và **lambda** (target typing).
- **Trả lời**:
    - **Target typing**: Compiler suy luận kiểu từ interface mục tiêu.
    - **Ví dụ**:
      ```java
      Function<String, Integer> f = String::length; // Suy luận từ Function
      ```

---

## 5) Giới hạn kiểu (Bounds) & multiple bounds

### 1. Upper bound: `<T extends Number>` khác gì `<T extends Number & Comparable<T>>` (nhiều bound).
- **Trả lời**:
    - **`<T extends Number>`**: Giới hạn `T` là `Number` hoặc subclass.
    - **`<T extends Number & Comparable<T>>`**: `T` phải là `Number` và implement `Comparable<T>`.
    - **Ví dụ**:
      ```java
      <T extends Number & Comparable<T>> T max(T a, T b) { return a.compareTo(b) > 0 ? a : b; }
      ```

### 2. Intersection types: ý nghĩa của `&` trong multiple bounds; thứ tự sắp xếp (class trước interface).
- **Trả lời**:
    - **Intersection types**: `T` phải thỏa mãn tất cả bound.
    - **Thứ tự**: Class (nếu có) phải đứng trước interface.
    - **Ví dụ**:
      ```java
      <T extends Number & Comparable<T>> // OK
      <T extends Comparable<T> & Number> // Lỗi, class phải trước
      ```

### 3. ⚠️ Gài: Có **lower bound** trong **type parameter** không? Phân biệt với lower bound ở wildcard.
- **Trả lời**:
    - **Type parameter**: Không hỗ trợ lower bound (`<T super Integer>` không hợp lệ).
    - **Wildcard**: Hỗ trợ lower bound (`? super Integer`), dùng cho consumer.
    - **Ví dụ**:
      ```java
      List<? super Integer> list; // OK
      ```

### 4. Ràng buộc đệ quy (F-bounded): `<T extends Comparable<T>>` — tại sao hữu ích?
- **Trả lời**:
    - **Ý nghĩa**: Đảm bảo `T` có thể so sánh với chính nó.
    - **Use case**: Sắp xếp, tìm max/min.
    - **Ví dụ**:
      ```java
      class Person implements Comparable<Person> {}
      <T extends Comparable<T>> T max(T a, T b) { return a.compareTo(b) > 0 ? a : b; }
      ```

---

## 6) Wildcards & quy tắc PECS

### 1. Wildcard `?` là gì? So sánh `List<?>`, `List<? extends Number>`, `List<? super Integer>`.
- **Trả lời**:
    - **Wildcard `?`**: Đại diện cho kiểu bất kỳ.
    - **`List<?>`**: Không giới hạn kiểu, chỉ đọc (trừ `null`).
    - **`List<? extends Number>`**: Chỉ đọc, chứa `Number` hoặc subclass.
    - **`List<? super Integer>`**: Chỉ ghi `Integer` hoặc subclass, đọc trả `Object`.
    - **Ví dụ**:
      ```java
      List<? extends Number> nums = new ArrayList<Integer>(); // Chỉ đọc
      List<? super Integer> ints = new ArrayList<Number>(); // Ghi Integer
      ```

### 2. Quy tắc **PECS** (“Producer Extends, Consumer Super”): giải thích bằng ví dụ cụ thể.
- **Trả lời**:
    - **PECS**:
        - **Producer Extends**: Đọc dữ liệu, dùng `? extends T`.
        - **Consumer Super**: Ghi dữ liệu, dùng `? super T`.
    - **Ví dụ**:
      ```java
      void copy(List<? extends Number> src, List<? super Number> dst) {
          for (Number n : src) dst.add(n);
      }
      ```

### 3. ⚠️ Gài: Vì sao **không** thể thêm phần tử vào `List<? extends Number>` (trừ `null`)?
- **Trả lời**:
    - **Lý do**: Compiler không biết kiểu cụ thể của `List`, chỉ biết là subtype của `Number`, nên không an toàn khi thêm.
    - **Ví dụ**:
      ```java
      List<? extends Number> list = new ArrayList<Integer>();
      list.add(1); // Lỗi biên dịch
      list.add(null); // OK
      ```

### 4. Khi nào nên dùng wildcard thay vì type parameter ở method signature?
- **Trả lời**:
    - **Wildcard**: Khi method chỉ cần đọc/ghi mà không cần kiểu cụ thể.
    - **Type parameter**: Khi cần sử dụng kiểu trong nhiều tham số/return.
    - **Ví dụ**:
      ```java
      void print(List<?> list) {} // Wildcard đủ
      <T> T process(T t) { return t; } // Cần type parameter
      ```

---

## 7) Bắt wildcard (Wildcard capture) & helper methods

### 1. “Wildcard capture” là gì? Khi nào compiler yêu cầu viết helper method generic để “bắt” wildcard?
- **Trả lời**:
    - **Wildcard capture**: Compiler gán wildcard (`?`) thành kiểu cụ thể tạm thời.
    - **Helper method**: Cần khi compiler không thể xử lý wildcard trực tiếp (ví dụ: swap elements).
    - **Ví dụ**:
      ```java
      void swap(List<?> list, int i, int j) {
          swapHelper(list, i, j); // Cần helper
      }
      ```

### 2. Ví dụ chuyển `void swap(List<?> l, int i, int j)` thành helper `<T> void swap(List<T> l, …)` để hợp lệ.
- **Trả lời**:
  ```java
  void swap(List<?> list, int i, int j) {
      swapHelper(list, i, j);
  }
  private <T> void swapHelper(List<T> list, int i, int j) {
      T temp = list.get(i);
      list.set(i, list.get(j));
      list.set(j, temp);
  }
  ```

### 3. ⚠️ Gài: Tại sao cast “bừa” để vượt qua lỗi capture là nguy hiểm?
- **Trả lời**:
    - **Nguy hiểm**: Cast bừa (`(List<String>) list`) bỏ qua type safety, có thể gây `ClassCastException` runtime.
    - **Khắc phục**: Dùng helper method generic để capture an toàn.

---

## 8) Type erasure, reifiable vs non-reifiable

### 1. Giải thích **type erasure**: biên dịch xoá thông tin kiểu, chèn cast & bridge method.
- **Trả lời**:
    - **Type erasure**: Compiler xóa thông tin generic, thay bằng `Object` hoặc bound, thêm cast và bridge method để đảm bảo type safety.
    - **Ví dụ**:
      ```java
      class Box<T> { T value; }
      // Sau erasure: class Box { Object value; }
      ```

### 2. Reifiable vs non-reifiable types: ví dụ `List<String>` là non-reifiable.
- **Trả lời**:
    - **Reifiable**: Kiểu có thông tin đầy đủ tại runtime (`int`, `List`).
    - **Non-reifiable**: Kiểu bị xóa thông tin generic (`List<String>`).
    - **Ví dụ**:
      ```java
      List<String> list; // Non-reifiable
      List rawList; // Reifiable
      ```

### 3. ⚠️ Gài: Vì sao `instanceof List<String>` **không hợp lệ**, nhưng `instanceof List<?>` lại hợp lệ?
- **Trả lời**:
    - **Lý do**: `List<String>` bị type erasure, không có thông tin kiểu tại runtime.
    - **`List<?>`**: Không cần thông tin kiểu cụ thể, nên hợp lệ.
    - **Ví dụ**:
      ```java
      if (obj instanceof List<?>) {} // OK
      if (obj instanceof List<String>) {} // Lỗi biên dịch
      ```

### 4. Ảnh hưởng của erasure tới **equals**, **overload/override** và runtime cast.
- **Trả lời**:
    - **Equals**: Không phân biệt `List<String>` và `List<Integer>` tại runtime.
    - **Overload/Override**: Gây lỗi nếu chữ ký giống nhau sau erasure.
    - **Runtime cast**: Compiler chèn cast để đảm bảo type safety.
    - **Ví dụ**:
      ```java
      void process(List<String> list) {}
      void process(List<Integer> list) {} // Lỗi: same erasure
      ```

---

## 9) Mảng vs generics

### 1. Mảng là **covariant** còn generics là **invariant**: hệ quả an toàn kiểu?
- **Trả lời**:
    - **Covariant (mảng)**: `String[]` có thể gán vào `Object[]`, nhưng có thể gây `ArrayStoreException`.
    - **Invariant (generics)**: `List<String>` không gán được vào `List<Object>`, đảm bảo type safety.
    - **Ví dụ**:
      ```java
      String[] arr = new String[1];
      Object[] objArr = arr; // OK
      objArr[0] = 1; // ArrayStoreException
      ```

### 2. ⚠️ Gài: Vì sao **không** được tạo `new List<String>[10]`? (generic array creation)
- **Trả lời**:
    - **Lý do**: Type erasure khiến mảng generic không an toàn (không kiểm tra được kiểu runtime).
    - **Khắc phục**: Dùng `List<?>[]` hoặc `@SuppressWarnings("unchecked")`.
    - **Ví dụ**:
      ```java
      List<String>[] arr = (List<String>[]) new List<?>[10]; // OK với warning
      ```

### 3. Dùng `List<T>[]` có thể qua “bridge” bằng `@SuppressWarnings("unchecked")` — rủi ro?
- **Trả lời**:
    - **Rủi ro**: Có thể gây `ClassCastException` nếu gán sai kiểu.
    - **Ví dụ**:
      ```java
      @SuppressWarnings("unchecked")
      List<String>[] arr = (List<String>[]) new List<?>[1];
      arr[0] = new ArrayList<Integer>(); // Lỗi runtime
      ```

### 4. Khi nào thay mảng bằng `List<T>` để an toàn hơn?
- **Trả lời**:
    - Khi cần type safety và không cần truy cập chỉ số cố định.
    - **Ví dụ**: Dùng `List<String>` thay `String[]` để tránh `ArrayStoreException`.

---

## 10) Varargs với generics & @SafeVarargs

### 1. Vấn đề “heap pollution” khi dùng varargs generic (`List<String>... args`).
- **Trả lời**:
    - **Heap pollution**: Gán mảng varargs vào kiểu không an toàn, gây `ClassCastException`.
    - **Ví dụ**:
      ```java
      List<String>... args = new List[] { new ArrayList<Integer>() }; // Heap pollution
      ```

### 2. Khi nào nên dùng `@SafeVarargs` và điều kiện an toàn để chú thích?
- **Trả lời**:
    - **Dùng `@SafeVarargs`**: Khi method không sửa đổi mảng varargs và chỉ đọc.
    - **Điều kiện**: Không lưu mảng vào field/collection, không cast bừa.
    - **Ví dụ**:
      ```java
      @SafeVarargs
      static <T> List<T> asList(T... items) { return Arrays.asList(items); }
      ```

### 3. ⚠️ Gài: Vì sao **không** nên lưu tham chiếu `args` vào trường/collection dài hạn?
- **Trả lời**:
    - **Lý do**: Varargs là mảng, có thể bị sửa đổi ngoài method, gây heap pollution.
    - **Khắc phục**: Sao chép mảng trước khi lưu.
    - **Ví dụ**:
      ```java
      List<T> store;
      @SafeVarargs
      void save(T... args) { store = List.copyOf(Arrays.asList(args)); }
      ```

---

## 11) Raw types & unchecked warnings

### 1. Raw type là gì (`List` thay vì `List<String>`) và tại sao nên tránh.
- **Trả lời**:
    - **Raw type**: Generic type không chỉ định type argument.
    - **Tránh vì**: Mất type safety, dễ gây `ClassCastException`.
    - **Ví dụ**:
      ```java
      List raw = new ArrayList(); raw.add(1); String s = (String) raw.get(0); // Lỗi runtime
      ```

### 2. ⚠️ Gài: Tại sao raw types vẫn tồn tại? (tương thích ngược) — rủi ro khi mix raw với generic.
- **Trả lời**:
    - **Tồn tại**: Để tương thích ngược với code pre-Java 5.
    - **Rủi ro**: Mix raw và generic gây unchecked warning, lỗi runtime.
    - **Ví dụ**:
      ```java
      List raw = new ArrayList<String>(); raw.add(1); // Lỗi runtime khi truy cập
      ```

### 3. Khi nào dùng `@SuppressWarnings("unchecked")` là chấp nhận được? Nguyên tắc “khoanh vùng tối thiểu”.
- **Trả lời**:
    - **Chấp nhận được**: Khi chắc chắn type-safe (ví dụ: cast trong reflection).
    - **Nguyên tắc**: Chỉ áp dụng ở scope nhỏ nhất (biến, method).
    - **Ví dụ**:
      ```java
      @SuppressWarnings("unchecked")
      List<String> list = (List<String>) obj;
      ```

---

## 12) Generics & Collections/Map

### 1. API mẫu: `Map<K,V>`, `Optional<T>`, `Stream<T>` — lợi ích type-safety khi thao tác dữ liệu.
- **Trả lời**:
    - **Lợi ích**:
        - `Map<K,V>`: Type-safe cho key/value.
        - `Optional<T>`: Tránh `null`, rõ ràng kiểu trả về.
        - `Stream<T>`: Xử lý dữ liệu type-safe.
    - **Ví dụ**:
      ```java
      Map<String, Integer> map = new HashMap<>();
      Optional<String> opt = Optional.of("text");
      ```

### 2. `Comparable<T>` vs `Comparator<T>` generic: viết API sắp xếp **consistent with equals**.
- **Trả lời**:
    - **`Comparable<T>`**: So sánh tự nhiên, implement trong lớp.
    - **`Comparator<T>`**: So sánh bên ngoài, tách logic.
    - **Consistent with equals**: `compareTo(a, b) == 0` đồng nghĩa `a.equals(b)`.
    - **Ví dụ**:
      ```java
      class Person implements Comparable<Person> {
          public int compareTo(Person p) { return name.compareTo(p.name); }
      }
      ```

### 3. ⚠️ Gài: `List<Object>` **không** thay cho `List<String>` — giải thích invariance bằng ví dụ.
- **Trả lời**:
    - **Invariance**: `List<String>` không phải subtype của `List<Object>` để đảm bảo type safety.
    - **Ví dụ**:
      ```java
      List<String> strings = new ArrayList<>();
      List<Object> objects = strings; // Lỗi biên dịch
      objects.add(1); // Nếu hợp lệ, gây lỗi runtime
      ```

### 4. Dùng wildcard trong tham số method: `void addAll(Collection<? extends T> src, Collection<? super T> dst)`.
- **Trả lời**:
    - **Wildcard**:
        - `? extends T`: Đọc từ source.
        - `? super T`: Ghi vào destination.
    - **Ví dụ**:
      ```java
      void addAll(Collection<? extends Number> src, Collection<? super Number> dst) {
          src.forEach(dst::add);
      }
      ```

---

## 13) Generics & Lambda/Streams

### 1. Cách inference hoạt động khi dùng `Collectors.toMap(...)` với key/value generic.
- **Trả lời**:
    - **Inference**: Compiler suy luận từ lambda/method reference và context.
    - **Ví dụ**:
      ```java
      Map<String, Integer> map = list.stream().collect(Collectors.toMap(s -> s, String::length));
      ```

### 2. Method reference có thể “gợi” inference thế nào (`String::valueOf`, `BigDecimal::new`).
- **Trả lời**:
    - **Method reference**: Cung cấp context để suy luận kiểu.
    - **Ví dụ**:
      ```java
      Function<Integer, String> f = String::valueOf; // Suy luận Integer -> String
      ```

### 3. ⚠️ Gài: Vì sao đôi khi cần **hint** kiểu tường minh trong stream (`<String>collect(...)`)?
- **Trả lời**:
    - **Lý do**: Context không đủ rõ để suy luận (ví dụ: stream phức tạp, raw type).
    - **Ví dụ**:
      ```java
      list.stream().collect(Collectors.<String, List<String>>toMap(k -> k, k -> List.of(k)));
      ```

### 4. `Optional<T>` và wildcards (`Optional<? extends Number>`) — khi nào hữu ích/khó chịu.
- **Trả lời**:
    - **Hữu ích**: `Optional<? extends Number>` cho phép đọc `Number` hoặc subtype.
    - **Khó chịu**: Không thể set giá trị mới, chỉ đọc.
    - **Ví dụ**:
      ```java
      Optional<? extends Number> opt = Optional.of(1);
      Number n = opt.get(); // OK
      ```

---

## 14) Reflection & type token

### 1. Do erasure, làm sao giữ thông tin kiểu tại runtime (pattern **TypeToken**, `Class<T>`, `TypeReference` của Jackson/Guava)?
- **Trả lời**:
    - **TypeToken**: Lớp con ẩn danh giữ thông tin kiểu (`new TypeToken<List<String>>(){}`).
    - **`Class<T>`**: Giữ kiểu đơn giản.
    - **`TypeReference`**: Jackson/Guava dùng để parse JSON.
    - **Ví dụ**:
      ```java
      TypeReference<List<String>> typeRef = new TypeReference<>() {};
      ```

### 2. Lấy `ParameterizedType` của field/method bằng reflection: hạn chế gì?
- **Trả lời**:
    - **Cách lấy**:
      ```java
      Field field = MyClass.class.getDeclaredField("list");
      ParameterizedType type = (ParameterizedType) field.getGenericType();
      ```
    - **Hạn chế**: Chỉ lấy được nếu field/method khai báo rõ kiểu, không hoạt động với raw type.

### 3. ⚠️ Gài: Vì sao `List<String>` và `List<Integer>` có cùng `Class` object ở runtime? Hệ quả.
- **Trả lời**:
    - **Lý do**: Type erasure xóa thông tin generic, cả hai thành `List`.
    - **Hệ quả**: Không kiểm tra được kiểu cụ thể bằng `instanceof` hoặc reflection.
    - **Ví dụ**:
      ```java
      List<String> s = new ArrayList<>();
      List<Integer> i = new ArrayList<>();
      s.getClass() == i.getClass(); // true
      ```

---

## 15) Bridge methods, override & binary compatibility

### 1. Bridge method là gì? Khi nào compiler sinh ra (override với type erasure).
- **Trả lời**:
    - **Bridge method**: Phương thức compiler tạo để xử lý type erasure khi override generic method.
    - **Khi sinh**: Khi lớp con override method generic với kiểu cụ thể.
    - **Ví dụ**:
      ```java
      interface Repo<T> { void save(T t); }
      class StringRepo implements Repo<String> {
          public void save(String s) {}
          // Bridge: public void save(Object o) { save((String) o); }
      }
      ```

### 2. ⚠️ Gài: Bridge method có thể gây vấn đề gì với reflection hoặc AOP/proxy?
- **Trả lời**:
    - **Vấn đề**:
        - Reflection: Có thể lấy nhầm bridge method.
        - AOP/Proxy: Proxy có thể gọi bridge method, gây lỗi logic.
    - **Khắc phục**: Kiểm tra `isBridge()` trong reflection.

### 3. Overload vs override với generics sau erasure: ví dụ dễ gây **ambiguous**.
- **Trả lời**:
    - **Vấn đề**: Overload method generic có chữ ký giống nhau sau erasure.
    - **Ví dụ**:
      ```java
      void process(List<String> l) {}
      void process(List<Integer> l) {} // Lỗi: same erasure
      ```

---

## 16) Best practices & thiết kế API

### 1. Khi nào chọn **wildcard** trong public API thay vì type parameter (giúp linh hoạt caller).
- **Trả lời**:
    - **Wildcard**: Khi method chỉ cần đọc/ghi, không cần kiểu cụ thể.
    - **Type parameter**: Khi cần dùng kiểu trong nhiều tham số/return.
    - **Ví dụ**:
      ```java
      void print(List<?> list) {} // Wildcard linh hoạt hơn
      ```

### 2. Viết chữ ký **đọc-không-ghi** (`? extends T`) và **ghi-không-đọc** (`? super T`) đúng nguyên tắc PECS.
- **Trả lời**:
  ```java
  Number read(List<? extends Number> list) { return list.get(0); }
  void write(List<? super Integer> list) { list.add(1); }
  ```

### 3. ⚠️ Gài: Tránh trả về `List<? extends T>` từ public API — vì sao gây khó cho client?
- **Trả lời**:
    - **Lý do**: Client không thể thêm phần tử vào `List<? extends T>`, chỉ đọc.
    - **Khắc phục**: Trả `List<T>` hoặc sao chép thành `List<T>`.
    - **Ví dụ**:
      ```java
      List<? extends Number> list; // Client không thể add
      ```

### 4. Tài liệu hoá ràng buộc (bounds), bất biến & thread-safety khi type là mutable.
- **Trả lời**:
    - **Ràng buộc**: Ghi rõ bound trong Javadoc (`@param <T> where T extends Number`).
    - **Bất biến**: Ghi chú nếu `T` cần immutable.
    - **Thread-safety**: Ghi rõ nếu generic type không thread-safe.
    - **Ví dụ**:
      ```java
      /**
       * @param <T> must be immutable and thread-safe
       */
      class Cache<T> {}
      ```

---

## 17) Mini case (thực chiến 2–5 phút/câu)

### 1. Viết hàm `copy(List<? extends T> src, List<? super T> dst)` theo PECS; phân tích giới hạn và khi nào cần `Collections.copy`.
- **Trả lời**:
  ```java
  void copy(List<? extends T> src, List<? super T> dst) {
      for (T t : src) dst.add(t);
  }
  ```
    - **Giới hạn**: `dst` không thể đọc type-safe (trả `Object`), `src` không thể ghi.
    - **Dùng `Collections.copy`**: Khi cần copy vào danh sách có kích thước cố định.

### 2. Thiết kế `Cache<K,V>` generic với API: `get(K)`, `put(K,V)`, `computeIfAbsent(K, Function<? super K,? extends V>)`. Nêu lý do chọn wildcard.
- **Trả lời**:
  ```java
  interface Cache<K, V> {
      V get(K key);
      void put(K key, V value);
      V computeIfAbsent(K key, Function<? super K, ? extends V> mapping);
  }
  ```
    - **Wildcard lý do**: `Function<? super K, ? extends V>` cho phép linh hoạt input/output kiểu.

### 3. Sửa chữ ký `sum(List<Number> nums)` để nhận cả `List<Integer>`/`List<Double>`.
- **Trả lời**:
  ```java
  double sum(List<? extends Number> nums) {
      return nums.stream().mapToDouble(Number::doubleValue).sum();
  }
  ```

### 4. Implement `max(List<T>, Comparator<? super T>)` và giải thích vì sao dùng `? super T`.
- **Trả lời**:
  ```java
  <T> T max(List<T> list, Comparator<? super T> comp) {
      T max = list.get(0);
      for (T t : list) if (comp.compare(t, max) > 0) max = t;
      return max;
  }
  ```
    - **Lý do `? super T`**: Cho phép `Comparator` so sánh supertype của `T`, linh hoạt hơn.

### 5. Viết helper **wildcard capture** cho `swap(List<?> l, int i, int j)` để biên dịch được.
- **Trả lời**:
  ```java
  void swap(List<?> list, int i, int j) {
      swapHelper(list, i, j);
  }
  private <T> void swapHelper(List<T> list, int i, int j) {
      T temp = list.get(i);
      list.set(i, list.get(j));
      list.set(j, temp);
  }
  ```

### 6. Dùng **TypeToken** để parse JSON thành `List<Order>` bằng Jackson/TypeReference; nêu vì sao cần type token.
- **Trả lời**:
  ```java
  ObjectMapper mapper = new ObjectMapper();
  List<Order> orders = mapper.readValue(json, new TypeReference<List<Order>>() {});
  ```
    - **Lý do cần TypeToken**: Type erasure xóa thông tin `List<Order>` tại runtime, `TypeReference` giữ kiểu qua reflection.

---

