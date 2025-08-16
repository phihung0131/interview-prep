## 1) Khái niệm & cú pháp cơ bản

### 1. Interface là gì? Khác gì so với **class trừu tượng** ở mục tiêu thiết kế và khả năng kế thừa?
- **Trả lời**:
    - **Interface**: Một hợp đồng (contract) định nghĩa các phương thức mà lớp triển khai phải tuân theo, không chứa trạng thái (trừ hằng số) hoặc logic cụ thể.
    - **Khác với abstract class**:
        - **Mục tiêu thiết kế**:
            - Interface: Định nghĩa hành vi, hỗ trợ đa thừa kế (multiple inheritance).
            - Abstract class: Cung cấp hành vi chung và trạng thái (fields), chỉ kế thừa đơn (single inheritance).
        - **Kế thừa**:
            - Interface: Lớp có thể implement nhiều interface.
            - Abstract class: Lớp chỉ extends một abstract class.
    - **Ví dụ**:
      ```java
      interface Flyable { void fly(); }
      abstract class Animal { abstract void move(); int age; }
      ```

### 2. Quy tắc khai báo interface (top-level vs nested). Tên file, package, visibility.
- **Trả lời**:
    - **Top-level**: Khai báo trong file riêng, tên file khớp tên interface.
    - **Nested**: Khai báo trong class/interface khác, có thể là `static` (mặc định).
    - **Package**: Đặt trong package như class.
    - **Visibility**: `public` hoặc package-private (mặc định).
    - **Ví dụ**:
      ```java
      // File: Flyable.java
      package com.example;
      public interface Flyable { void fly(); }
      // Nested
      class Outer { interface Nested { void doSomething(); } }
      ```

### 3. ⚠️ Gài: Interface có “trạng thái” (state) không? Nếu có thì là kiểu gì và giới hạn ra sao?
- **Trả lời**:
    - **Có trạng thái**: Interface có thể chứa **hằng số** (fields).
    - **Kiểu**: `public static final` (mặc định), chỉ chứa giá trị bất biến.
    - **Giới hạn**: Không thể chứa instance fields (non-static).
    - **Ví dụ**:
      ```java
      interface Config { int MAX = 100; } // public static final
      ```

### 4. Một class “implements” nhiều interface được không? Trình bày ưu/nhược so với kế thừa lớp duy nhất.
- **Trả lời**:
    - **Có thể**: Một class có thể implement nhiều interface.
    - **Ưu**:
        - Linh hoạt, hỗ trợ đa thừa kế hành vi.
        - Giảm coupling, dễ thay đổi triển khai.
    - **Nhược**:
        - Không chia sẻ trạng thái (fields) như abstract class.
        - Xung đột default method cần xử lý.
    - **Ví dụ**:
      ```java
      class Bird implements Flyable, Eatable { ... }
      ```

### 5. Sự khác nhau giữa **implements** và **extends** (interface có thể `extends` nhiều interface).
- **Trả lời**:
    - **`implements`**: Lớp sử dụng để triển khai interface.
    - **`extends`**:
        - Interface sử dụng để kế thừa nhiều interface.
        - Lớp sử dụng để kế thừa một lớp khác.
    - **Ví dụ**:
      ```java
      interface A { void m1(); }
      interface B extends A { void m2(); }
      class C implements B { public void m1() {} public void m2() {} }
      ```

---

## 2) Thành phần trong interface (fields & members)

### 1. Mặc định field trong interface có modifiers gì (visibility, static, final)?
- **Trả lời**:
    - **Modifiers**: `public static final` (hằng số).
    - **Ví dụ**:
      ```java
      interface Config { int MAX = 100; } // Ngầm là public static final
      ```

### 2. ⚠️ Gài: Vì sao thay đổi giá trị hằng số trong interface có thể **không** ảnh hưởng tới code đã biên dịch khác module? (inlining & binary compatibility)
- **Trả lời**:
    - **Lý do**: Hằng số (`public static final`) được **inline** vào bytecode của class sử dụng tại thời điểm biên dịch.
    - **Hậu quả**: Nếu thay đổi giá trị hằng số nhưng không tái biên dịch client, client vẫn dùng giá trị cũ.
    - **Ví dụ**:
      ```java
      // Lib: interface Config { int MAX = 10; }
      // Client: class App { int x = Config.MAX; } // Inlined thành 10
      // Lib đổi MAX = 20, App vẫn thấy 10 nếu không recompile.
      ```

### 3. Interface có thể chứa **nested types** không (class/interface/enum)? Modifiers mặc định là gì?
- **Trả lời**:
    - **Có thể**: Interface chứa nested class, interface, hoặc enum.
    - **Modifiers mặc định**: `public static`.
    - **Ví dụ**:
      ```java
      interface Outer {
          class Nested {}
          interface Inner {}
          enum Status { ON, OFF }
      }
      ```

### 4. Interface có được phép có **initializer blocks** hay constructor không? Vì sao?
- **Trả lời**:
    - **Không có constructor**: Interface không thể khởi tạo.
    - **Initializer blocks**:
        - **Static initializer**: Được phép để khởi tạo static fields.
        - **Instance initializer**: Không được phép vì interface không có instance.
    - **Lý do**: Interface chỉ định nghĩa hợp đồng, không phải object.

---

## 3) Methods trong interface

### 1. `abstract` method mặc định là `public` — có thể hạ xuống `protected`/`private` không?
- **Trả lời**:
    - **Không thể**: Abstract method mặc định và chỉ có thể là `public`.
    - **Lý do**: Interface định nghĩa hợp đồng công khai.

### 2. `default` method là gì? Dùng để làm gì trong việc **evolve API**?
- **Trả lời**:
    - **Default method**: Phương thức có triển khai mặc định (Java 8+).
    - **Mục đích**:
        - Thêm chức năng mới vào interface mà không phá vỡ binary compatibility.
        - Cung cấp hành vi mặc định cho lớp triển khai.
    - **Ví dụ**:
      ```java
      interface Logger {
          default void log(String msg) { System.out.println(msg); }
      }
      ```

### 3. `static` method trong interface khác gì `default` method về cách gọi và thừa kế?
- **Trả lời**:
    - **`static` method**:
        - Gọi qua tên interface (`Interface.method()`).
        - Không được kế thừa bởi lớp triển khai.
    - **`default` method**:
        - Gọi qua instance của lớp triển khai.
        - Có thể override.
    - **Ví dụ**:
      ```java
      interface Util {
          static void staticMethod() {}
          default void defaultMethod() {}
      }
      ```

### 4. Từ Java 9: `private` method trong interface dùng lúc nào và vì sao hữu ích?
- **Trả lời**:
    - **Dùng khi**: Cần chia sẻ logic giữa default/static methods mà không lộ ra ngoài.
    - **Hữu ích**: Giảm lặp code, tăng tính đóng gói.
    - **Ví dụ**:
      ```java
      interface Logger {
          default void logInfo() { log("INFO"); }
          private void log(String level) { System.out.println(level); }
      }
      ```

### 5. ⚠️ Gài: Có thể khai báo `synchronized`/`final`/`native` cho method trong interface không? Lý do.
- **Trả lời**:
    - **Không thể**:
        - `synchronized`: Interface không quản lý luồng.
        - `final`: Default method có thể override, abstract method không cần.
        - `native`: Interface không chứa triển khai native.
    - **Lý do**: Interface định nghĩa hợp đồng, không quản lý chi tiết triển khai.

---

## 4) Default methods & quy tắc phân giải xung đột

### 1. Khi một class implements **hai** interface có default method trùng chữ ký, chuyện gì xảy ra? Cách giải xung đột (override + `A.super.m()`).
- **Trả lời**:
    - **Xung đột**: Trình biên dịch báo lỗi nếu không override.
    - **Giải pháp**: Lớp triển khai phải override method và chọn gọi `Interface.super.method()` nếu cần.
    - **Ví dụ**:
      ```java
      interface A { default void m() { System.out.println("A"); } }
      interface B { default void m() { System.out.println("B"); } }
      class C implements A, B {
          public void m() { A.super.m(); } // Chọn A
      }
      ```

### 2. Quy tắc “**class wins**” và “**more specific interface wins**” là gì? Ví dụ minh họa.
- **Trả lời**:
    - **Class wins**: Method trong lớp triển khai ưu tiên hơn default method.
    - **More specific interface wins**: Interface cụ thể hơn (sub-interface) ưu tiên.
    - **Ví dụ**:
      ```java
      interface A { default void m() { System.out.println("A"); } }
      interface B extends A { default void m() { System.out.println("B"); } }
      class C implements A, B { // B thắng vì cụ thể hơn
          public void m() { System.out.println("C"); } // C thắng
      }
      ```

### 3. ⚠️ Gài: Default method có thể “override” các method từ `Object` (equals/hashCode/toString) không? Hành vi thực tế thế nào?
- **Trả lời**:
    - **Không thể**: Default method không override được `Object` methods.
    - **Hành vi**: Gọi `equals`/`hashCode`/`toString` trên instance vẫn dùng triển khai của lớp, không phải default method.
    - **Ví dụ**:
      ```java
      interface I { default boolean equals(Object o) { return false; } }
      class C implements I {}
      C c = new C();
      System.out.println(c.equals(c)); // true, không dùng default
      ```

### 4. Ảnh hưởng của default method tới **binary compatibility** khi thêm method mới vào interface công khai.
- **Trả lời**:
    - **Default method**: Cho phép thêm method mới mà không phá vỡ binary compatibility (lớp cũ vẫn chạy).
    - **Không có default**: Thêm abstract method phá vỡ compatibility, yêu cầu tất cả lớp triển khai phải cập nhật.

---

## 5) Functional Interface & Lambda

### 1. Functional interface là gì (SAM type)? Vai trò của `@FunctionalInterface`.
- **Trả lời**:
    - **Functional Interface**: Interface có duy nhất một abstract method (SAM - Single Abstract Method).
    - **Vai trò `@FunctionalInterface`**: Đảm bảo chỉ một abstract method, báo lỗi biên dịch nếu vi phạm.
    - **Ví dụ**:
      ```java
      @FunctionalInterface
      interface Action { void run(); }
      ```

### 2. ⚠️ Gài: Vì sao các method từ `Object` **không tính** vào số lượng abstract methods của functional interface?
- **Trả lời**:
    - **Lý do**: Các method của `Object` (`equals`, `hashCode`, `toString`) có sẵn trong mọi class, không cần khai báo abstract.
    - **Ví dụ**:
      ```java
      @FunctionalInterface
      interface Action {
          void run();
          boolean equals(Object o); // Không tính là abstract
      }
      ```

### 3. Một functional interface có thể chứa **default** và **static** methods không? Ảnh hưởng tới “độ đơn” SAM?
- **Trả lời**:
    - **Có thể**: Default và static methods không ảnh hưởng SAM.
    - **Độ đơn**: Chỉ tính abstract method, nên vẫn là functional interface.
    - **Ví dụ**:
      ```java
      @FunctionalInterface
      interface Action {
          void run();
          default void log() {}
          static void util() {}
      }
      ```

### 4. Ví dụ các functional interfaces chuẩn: `Runnable`, `Callable`, `Supplier`, `Function`, `Consumer`, `Predicate`, `Comparator`.
- **Trả lời**:
    - `Runnable`: `void run()`.
    - `Callable<V>`: `V call() throws Exception`.
    - `Supplier<T>`: `T get()`.
    - `Function<T, R>`: `R apply(T t)`.
    - `Consumer<T>`: `void accept(T t)`.
    - `Predicate<T>`: `boolean test(T t)`.
    - `Comparator<T>`: `int compare(T o1, T o2)`.

### 5. Phân biệt lambda, method reference, anonymous class khi gán cho functional interface (khác biệt về captured variables & overhead).
- **Trả lời**:
    - **Lambda**: Cú pháp ngắn gọn, capture biến hiệu quả (final/effectively final).
    - **Method reference**: Gọi phương thức có sẵn, gọn hơn lambda, ít overhead.
    - **Anonymous class**: Tạo lớp con ẩn danh, tốn bộ nhớ hơn, dễ debug.
    - **Ví dụ**:
      ```java
      Runnable r1 = () -> System.out.println("Lambda");
      Runnable r2 = System.out::println; // Method reference
      Runnable r3 = new Runnable() { public void run() { System.out.println("Anon"); } };
      ```

---

## 6) Kế thừa interface & đa thừa

### 1. Interface có thể `extends` nhiều interface khác — quy tắc khi trùng **constant**/method signature.
- **Trả lời**:
    - **Constant trùng**: Không gây lỗi, nhưng chỉ một giá trị được chọn (hành vi không xác định).
    - **Method trùng**: Nếu cùng chữ ký, hợp nhất; nếu default method xung đột, cần override.
    - **Ví dụ**:
      ```java
      interface A { int X = 1; }
      interface B { int X = 2; }
      interface C extends A, B {} // X không rõ ràng
      ```

### 2. Trường hợp **diamond** giữa nhiều cấp interface: trình bày cách compiler phân giải.
- **Trả lời**:
    - **Diamond**: Sub-interface kế thừa hai super-interface có default method trùng chữ ký.
    - **Phân giải**: Lớp triển khai phải override hoặc chọn `Interface.super.method()`.
    - **Ví dụ**:
      ```java
      interface A { default void m() {} }
      interface B { default void m() {} }
      interface C extends A, B {}
      class D implements C { public void m() { A.super.m(); } }
      ```

### 3. ⚠️ Gài: Hai super-interface khai báo **method abstract** trùng chữ ký nhưng khác `throws` — hợp lệ không?
- **Trả lời**:
    - **Hợp lệ**: Trình biên dịch yêu cầu lớp triển khai xử lý tập hợp các exception (union).
    - **Ví dụ**:
      ```java
      interface A { void m() throws IOException; }
      interface B { void m() throws SQLException; }
      class C implements A, B { public void m() throws IOException, SQLException {} }
      ```

### 4. Sub-interface có thể **hẹp** kiểu trả về (covariant return type) cho method kế thừa không?
- **Trả lời**:
    - **Có thể**: Sub-interface có thể hẹp kiểu trả về (covariant).
    - **Ví dụ**:
      ```java
      interface A { Object get(); }
      interface B extends A { String get(); } // Hợp lệ
      ```

---

## 7) Generics với interface

### 1. Khai báo **generic interface** (`interface Repo<T>`). Ưu/nhược so với generic class.
- **Trả lời**:
    - **Khai báo**:
      ```java
      interface Repo<T> { void save(T t); }
      ```
    - **Ưu**:
        - Linh hoạt, hỗ trợ đa thừa kế.
        - Tách hợp đồng khỏi triển khai.
    - **Nhược**:
        - Không lưu trạng thái như generic class.
        - Type erasure gây phức tạp khi overload.

### 2. ⚠️ Gài: **Type erasure** ảnh hưởng gì tới overload/bridge methods khi implement generic interface?
- **Trả lời**:
    - **Type erasure**: Generic type bị xóa thành `Object` trong bytecode.
    - **Ảnh hưởng**: Overload method có chữ ký giống nhau sau erasure gây lỗi.
    - **Bridge method**: Trình biên dịch tạo method để xử lý covariance.
    - **Ví dụ**:
      ```java
      interface Repo<T> { void save(T t); }
      class StringRepo implements Repo<String> {
          public void save(String s) {}
          // Bridge: public void save(Object o) { save((String) o); }
      }
      ```

### 3. Bất biến, `? extends`, `? super` trong ngữ cảnh method của interface — áp dụng quy tắc **PECS**.
- **Trả lời**:
    - **PECS**: Producer Extends, Consumer Super.
    - **`? extends T`**: Đọc dữ liệu (producer), không ghi.
    - **`? super T`**: Ghi dữ liệu (consumer), đọc trả `Object`.
    - **Ví dụ**:
      ```java
      interface Processor<T> {
          void process(List<? super T> list);
          T get(List<? extends T> list);
      }
      ```

### 4. Raw types với interface generic: rủi ro và cảnh báo unchecked.
- **Trả lời**:
    - **Raw type**: Sử dụng interface generic mà không chỉ định type (ví dụ: `Repo` thay vì `Repo<String>`).
    - **Rủi ro**: Mất type safety, có thể gây `ClassCastException`.
    - **Cảnh báo**: Trình biên dịch báo unchecked warning.
    - **Ví dụ**:
      ```java
      Repo raw; // Cảnh báo unchecked
      ```

---

## 8) Exceptions & hợp đồng phương thức

### 1. Interface method có thể khai báo `throws` checked exceptions: lớp triển khai được **nới rộng** hay **thu hẹp** `throws`?
- **Trả lời**:
    - **Thu hẹp**: Lớp triển khai có thể khai báo ít exception hơn hoặc không khai báo.
    - **Không nới rộng**: Phải tuân thủ hợp đồng của interface.
    - **Ví dụ**:
      ```java
      interface A { void m() throws IOException; }
      class B implements A { public void m() {} } // Hợp lệ
      ```

### 2. ⚠️ Gài: Default method ném checked exception—class implement **không** khai báo gì thêm có compile được không?
- **Trả lời**:
    - **Hợp lệ**: Default method ném checked exception không yêu cầu lớp triển khai khai báo, miễn là không override.
    - **Ví dụ**:
      ```java
      interface A {
          default void m() throws IOException { throw new IOException(); }
      }
      class B implements A {} // Hợp lệ
      ```

### 3. Tài liệu hoá (Javadoc) về exceptions ở interface vs ở lớp triển khai — best practice.
- **Trả lời**:
    - **Interface**: Ghi rõ tất cả exception trong Javadoc, định nghĩa hợp đồng.
    - **Lớp triển khai**: Chỉ ghi exception cụ thể nếu khác hợp đồng.
    - **Best practice**: Interface ghi đầy đủ, lớp triển khai bổ sung chi tiết nếu cần.

---

## 9) Sealed interfaces (Java 17+)

### 1. Sealed interface là gì? Cú pháp `sealed interface X permits A, B`.
- **Trả lời**:
    - **Sealed interface**: Giới hạn lớp/interface nào được phép triển khai/kế thừa.
    - **Cú pháp**:
      ```java
      sealed interface Event permits UserCreated, OrderPlaced {}
      ```
    - **Mục đích**: Kiểm soát hệ phân cấp, hỗ trợ pattern matching.

### 2. ⚠️ Gài: Khác nhau giữa `sealed`/`non-sealed`/`final` đối với **hệ phân cấp đóng**.
- **Trả lời**:
    - **`sealed`**: Chỉ định lớp/interface được phép triển khai (permits).
    - **`non-sealed`**: Cho phép kế thừa tự do bởi bất kỳ lớp nào.
    - **`final`**: Ngăn kế thừa hoàn toàn.
    - **Ví dụ**:
      ```java
      sealed interface A permits B {}
      non-sealed interface B extends A {}
      final class C implements B {}
      ```

### 3. Lợi ích của sealed đối với **pattern matching** trong `switch` và exhaustiveness checking.
- **Trả lời**:
    - **Lợi ích**:
        - Đảm bảo tất cả trường hợp được xử lý (exhaustiveness).
        - Giảm lỗi runtime do thiếu case.
    - **Ví dụ**:
      ```java
      sealed interface Event permits A, B {}
      switch (event) { case A a -> ...; case B b -> ...; } // Exhaustive
      ```

---

## 10) Interface vs Abstract Class — so sánh sâu

### 1. Khi nào chọn interface thay vì abstract class? Tiêu chí: đa thừa vs chia sẻ state.
- **Trả lời**:
    - **Chọn interface**:
        - Cần đa thừa kế hành vi.
        - Chỉ định nghĩa hợp đồng, không cần trạng thái.
    - **Chọn abstract class**:
        - Cần chia sẻ trạng thái (fields) hoặc logic chung.
        - Chỉ kế thừa đơn.
    - **Ví dụ**:
      ```java
      interface Flyable { void fly(); }
      abstract class Animal { int age; abstract void move(); }
      ```

### 2. ⚠️ Gài: Có thể mô phỏng **đa kế thừa hành vi** bằng interface + default methods, nhưng có nhược điểm gì (độ phức tạp, mùi thiết kế)?
- **Trả lời**:
    - **Mô phỏng**: Default methods cho phép đa thừa kế hành vi.
    - **Nhược điểm**:
        - Xung đột default method phức tạp hóa code.
        - Thiết kế phức tạp nếu lạm dụng default method (mùi “fat interface”).
    - **Khuyến nghị**: Tách logic nặng vào class/service.

### 3. Giao diện **SPI/API**: dùng interface để đảo ngược phụ thuộc (DIP) như thế nào?
- **Trả lời**:
    - **DIP (Dependency Inversion Principle)**: Lớp phụ thuộc vào interface, không phụ thuộc cụ thể.
    - **Cách dùng**: Định nghĩa interface cho SPI (Service Provider Interface), tiêm triển khai qua constructor/factory.
    - **Ví dụ**:
      ```java
      interface Database { void connect(); }
      class MyService { private final Database db; MyService(Database db) { this.db = db; } }
      ```

---

## 11) Marker Interface & so sánh với Annotation

### 1. Marker interface là gì (vd: `Serializable`, `Cloneable`)? Giá trị của nó trong **type system**.
- **Trả lời**:
    - **Marker interface**: Interface rỗng, dùng để đánh dấu lớp có khả năng đặc biệt.
    - **Giá trị**: Kiểm tra type-safe tại compile-time (`instanceof`).
    - **Ví dụ**:
      ```java
      class MyClass implements Serializable {}
      ```

### 2. ⚠️ Gài: Khi nào **annotation** là lựa chọn tốt hơn marker interface và ngược lại?
- **Trả lời**:
    - **Annotation tốt hơn**:
        - Cần metadata chi tiết (giá trị, thuộc tính).
        - Không cần type checking (ví dụ: `@Override`, `@Deprecated`).
    - **Marker interface tốt hơn**:
        - Cần type safety trong generic hoặc `instanceof`.
        - Framework yêu cầu interface (ví dụ: `Serializable`).
    - **Ví dụ**:
      ```java
      @interface MyMarker {}
      interface MyInterface {}
      ```

### 3. Ảnh hưởng tới `instanceof`, generic bounds và toolchain (framework, runtime checks).
- **Trả lời**:
    - **`instanceof`**: Marker interface cho phép kiểm tra type.
    - **Generic bounds**: Interface dùng làm bound (`T extends Serializable`).
    - **Toolchain**: Framework (như serialization) yêu cầu marker interface.

---

## 12) Khởi tạo interface & class loading

### 1. Khi nào **khởi tạo** interface diễn ra? Truy cập **compile-time constant** có kích hoạt khởi tạo không?
- **Trả lời**:
    - **Khởi tạo**: Khi truy cập static field/method không phải compile-time constant.
    - **Compile-time constant**: Không kích hoạt khởi tạo vì được inline.
    - **Ví dụ**:
      ```java
      interface Config { int MAX = 10; } // Truy cập MAX không khởi tạo
      ```

### 2. ⚠️ Gài: Constant trong interface được **inline** vào bytecode — hệ quả khi đổi giá trị ở thư viện nhưng không recompile client.
- **Trả lời**:
    - **Hệ quả**: Client vẫn dùng giá trị cũ vì constant được inline vào bytecode.
    - **Khắc phục**: Dùng `static final` field trong class thay vì interface.
    - **Ví dụ**:
      ```java
      // Lib: interface Config { int MAX = 10; }
      // Client: int x = Config.MAX; // Inline thành 10
      // Lib đổi MAX = 20, client vẫn thấy 10 nếu không recompile.
      ```

---

## 13) Thiết kế API dựa trên interface

### 1. Tách **interface** (hợp đồng) và **implementation** để giảm coupling như thế nào?
- **Trả lời**:
    - **Cách tách**:
        - Interface định nghĩa hợp đồng.
        - Triển khai cụ thể trong lớp riêng.
        - Tiêm triển khai qua constructor/factory.
    - **Giảm coupling**: Code phụ thuộc vào interface, không phụ thuộc cụ thể.
    - **Ví dụ**:
      ```java
      interface Repository { void save(String data); }
      class SqlRepository implements Repository { public void save(String data) {} }
      ```

### 2. **ISP** (Interface Segregation Principle): chia nhỏ interface để tránh “fat interface”.
- **Trả lời**:
    - **ISP**: Lớp chỉ implement interface liên quan, tránh method thừa.
    - **Cách chia**:
        - Tách thành các interface nhỏ, mỗi interface tập trung một chức năng.
    - **Ví dụ**:
      ```java
      interface Reader { void read(); }
      interface Writer { void write(); }
      class FileProcessor implements Reader, Writer {}
      ```

### 3. ⚠️ Gài: Lạm dụng interface “cho mọi thứ” có mùi gì? Khi nào class cụ thể là đủ?
- **Trả lời**:
    - **Mùi thiết kế**: Tăng độ phức tạp, khó bảo trì nếu interface không cần thiết.
    - **Class cụ thể đủ khi**:
        - Không cần đa thừa kế.
        - Không cần tách hợp đồng khỏi triển khai.
    - **Ví dụ**: Class utility với static method không cần interface.

### 4. Versioning & compatibility: chiến lược thêm method mới (default), thêm constant, đổi tên method.
- **Trả lời**:
    - **Thêm method**: Dùng default method để giữ binary compatibility.
    - **Thêm constant**: Cẩn thận vì inlining gây lỗi nếu không recompile client.
    - **Đổi tên method**: Phá vỡ compatibility, cần versioning API.

---

## 14) Logging, equals/hashCode & toString trong interface

### 1. Có nên đặt **hằng số** logger (`Logger`) trong interface rồi **implements** để “thừa kế” logger? Ưu/nhược?
- **Trả lời**:
    - **Không nên**:
        - **Nhược**: Logger là trạng thái, không phù hợp với interface (chỉ nên chứa hằng số).
        - **Ưu**: Tiết kiệm code, nhưng vi phạm thiết kế.
    - **Khuyến nghị**: Dùng class utility hoặc tiêm logger.
    - **Ví dụ**:
      ```java
      interface BadIdea { Logger LOG = Logger.getLogger("app"); }
      ```

### 2. ⚠️ Gài: Đặt `equals/hashCode/toString` dạng **default** trong interface liệu có tác dụng? Tác động tới lớp triển khai?
- **Trả lời**:
    - **Không tác dụng**: Default method của `Object` không được dùng, lớp triển khai vẫn dùng `Object` methods.
    - **Tác động**: Phải gọi tường minh (`I.super.equals()`).
    - **Ví dụ**:
      ```java
      interface I { default boolean equals(Object o) { return false; } }
      class C implements I {} // C.equals dùng Object.equals
      ```

### 3. Tổ chức **utility static methods** trong interface vs trong class `final` utility (ví dụ `Comparator`, `Map` có static factory).
- **Trả lời**:
    - **Interface**:
        - Phù hợp cho static factory hoặc helper liên quan đến interface.
        - Ví dụ: `Comparator.comparing()`.
    - **Final class**:
        - Phù hợp cho utility tổng quát, không liên quan interface.
        - Ví dụ: `Collections` class.
    - **Khuyến nghị**: Dùng interface cho static method liên quan hợp đồng.

---

## 15) Mini case (thực chiến 2–5 phút/câu)

### 1. Thiết kế **PricingStrategy** (interface) với 3 biến thể: `Flat`, `Tiered`, `Promo` — xử lý xung đột default method tính thuế.
- **Trả lời**:
  ```java
  interface PricingStrategy {
      double calculatePrice(double base);
      default double applyTax(double price) { return price * 1.1; }
  }
  interface Flat extends PricingStrategy {}
  interface Tiered extends PricingStrategy { default double applyTax(double price) { return price * 1.15; } }
  interface Promo extends PricingStrategy {}
  class Sale implements Flat, Tiered, Promo {
      public double calculatePrice(double base) { return base; }
      public double applyTax(double price) { return Tiered.super.applyTax(price); } // Chọn Tiered
  }
  ```

### 2. Refactor một API “God interface” 15 method thành 3 interface nhỏ theo **ISP**.
- **Trả lời**:
    - **God interface**:
      ```java
      interface God { void read(); void write(); void connect(); ... }
      ```
    - **Refactor**:
      ```java
      interface Reader { void read(); }
      interface Writer { void write(); }
      interface Connector { void connect(); }
      class Service implements Reader, Writer, Connector { ... }
      ```

### 3. Xử lý xung đột default: `Auditable.log()` và `Traceable.log()` trùng chữ ký; viết lớp `Service` giải quyết bằng `A.super.log()`.
- **Trả lời**:
  ```java
  interface Auditable { default void log() { System.out.println("Audit"); } }
  interface Traceable { default void log() { System.out.println("Trace"); } }
  class Service implements Auditable, Traceable {
      public void log() { Auditable.super.log(); } // Chọn Auditable
  }
  ```

### 4. Tạo `@FunctionalInterface` `RetryPolicy<T>` + ví dụ lambda/method reference; thảo luận checked exception.
- **Trả lời**:
  ```java
  @FunctionalInterface
  interface RetryPolicy<T> {
      T execute() throws Exception;
  }
  // Lambda
  RetryPolicy<String> policy = () -> { Thread.sleep(100); return "Done"; };
  // Method reference
  RetryPolicy<String> policyRef = someClass::someMethod;
  // Checked exception: Caller phải xử lý Exception
  ```

### 5. Dùng **sealed interface** cho phân hệ `Event` (`UserCreated`, `OrderPlaced`). Viết `switch` exhaustiveness.
- **Trả lời**:
  ```java
  sealed interface Event permits UserCreated, OrderPlaced {}
  record UserCreated(String name) implements Event {}
  record OrderPlaced(int id) implements Event {}
  String process(Event e) {
      return switch (e) {
          case UserCreated(String name) -> "User: " + name;
          case OrderPlaced(int id) -> "Order: " + id;
      }; // Exhaustive
  }
  ```

### 6. Minh hoạ lỗi binary-compat: app A dùng `Config.MAX = 10` từ interface of lib B; đổi `MAX=20` ở B nhưng không recompile A — kết quả gì?
- **Trả lời**:
    - **Kết quả**: App A vẫn thấy `MAX = 10`.
    - **Lý do**: `MAX` được inline vào bytecode của A tại thời điểm biên dịch.
    - **Khắc phục**: Dùng class với static field hoặc recompile A.

---

