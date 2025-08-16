## 1) Khái niệm nền tảng

### 1. Phân biệt **class** và **object/instance**; ba trụ cột: state, behavior, identity.
- **Trả lời**:
    - **Class**: Bản thiết kế định nghĩa cấu trúc (fields) và hành vi (methods) của đối tượng.
    - **Object/Instance**: Thể hiện cụ thể của class, được tạo bằng `new`, lưu trên heap.
    - **Ba trụ cột**:
        - **State**: Trạng thái của object, được xác định bởi giá trị các field (ví dụ: `balance` trong `Account`).
        - **Behavior**: Hành vi của object, được định nghĩa bởi methods (ví dụ: `deposit()`).
        - **Identity**: Danh tính duy nhất của object, xác định bởi địa chỉ bộ nhớ (so sánh bằng `==`).

### 2. Một object được mô tả bởi những thành phần nào trong Java (fields, methods, constructor, …)?
- **Trả lời**:
    - **Fields**: Biến lưu trạng thái (instance hoặc static).
    - **Methods**: Định nghĩa hành vi (instance hoặc static).
    - **Constructors**: Khởi tạo object, thiết lập trạng thái ban đầu.
    - **Nested classes/interfaces**: Định nghĩa các lớp lồng nhau.
    - **Initializer blocks**: Khối mã khởi tạo static hoặc instance.
    - **Annotations**: Cung cấp metadata.

### 3. ⚠️ Gài: “Mọi thứ trong Java đều là object.” — Sai ở đâu? Nêu ngoại lệ.
- **Trả lời**:
    - **Sai**: Không phải mọi thứ trong Java đều là object.
    - **Ngoại lệ**:
        - **Primitive types**: `int`, `double`, `boolean`, v.v. (lưu trên stack, không phải object).
        - **Tham chiếu null**: Không trỏ đến object.
        - **Void**: Không đại diện cho object.
        - **Static members**: Thuộc class, không phải instance.
    - **Lưu ý**: Primitive types có thể được bọc (boxed) thành objects (`Integer`, `Double`).

### 4. Vai trò của `java.lang.Object` trong hệ phân cấp lớp.
- **Trả lời**:
    - Là **lớp cha** của mọi lớp trong Java (ngầm định nếu không extends lớp khác).
    - Cung cấp các phương thức cơ bản:
        - `equals()`, `hashCode()`: So sánh và mã băm.
        - `toString()`: Biểu diễn chuỗi.
        - `clone()`: Sao chép object.
        - `finalize()`: Dọn dẹp trước GC (deprecated).
        - `getClass()`: Trả về kiểu runtime.
        - `wait()`, `notify()`, `notifyAll()`: Đồng bộ hóa luồng.
    - Đảm bảo mọi object có hành vi mặc định.

### 5. Sơ đồ UML lớp → chuyển thành code Java cần những gì (visibility, fields, methods, relationships)?
- **Trả lời**:
    - **Visibility**: `+` (public), `-` (private), `#` (protected), `~` (package-private).
    - **Fields**: Khai báo với kiểu, tên, modifier (ví dụ: `private int age;`).
    - **Methods**: Khai báo chữ ký với modifier, kiểu trả về, tham số (ví dụ: `public void setAge(int age)`).
    - **Relationships**:
        - **Inheritance**: `extends` (UML: mũi tên rỗng).
        - **Association**: Field tham chiếu đến lớp khác.
        - **Composition/Aggregation**: Field chứa instance/list của lớp khác.
        - **Dependency**: Dùng lớp khác trong method nhưng không giữ tham chiếu.
    - **Ví dụ**:
      ```java
      public class Person {
          private String name; // Field
          public Person(String name) { this.name = name; } // Constructor
          public String getName() { return name; } // Method
      }
      ```

---

## 2) Khai báo lớp & modifiers

### 1. Các **class modifiers** hợp lệ: `public`, `abstract`, `final`, (tùy JDK: `sealed`, `non-sealed`) — ý nghĩa, khi nào dùng.
- **Trả lời**:
    - **`public`**: Lớp truy cập được từ mọi nơi, dùng cho lớp chính hoặc API công khai.
    - **`abstract`**: Lớp không thể tạo instance, dùng khi cần định nghĩa lớp cha trừu tượng.
    - **`final`**: Ngăn kế thừa, dùng để khóa triển khai (ví dụ: `String`).
    - **`sealed`** (Java 17+): Giới hạn lớp con (dùng `permits`), dùng để kiểm soát kế thừa.
    - **`non-sealed`** (Java 17+): Cho phép lớp con mở rộng, dùng trong sealed hierarchy.
    - **Khi dùng**: `abstract` cho lớp cha, `final` cho lớp bất biến, `sealed` cho hierarchy cụ thể.

### 2. Khác biệt **top-level class** vs **nested class** (static/non-static).
- **Trả lời**:
    - **Top-level class**: Lớp độc lập, không nằm trong lớp khác, có thể là `public` hoặc package-private.
    - **Nested class**:
        - **Static nested class**: Không giữ tham chiếu đến instance lớp ngoài, dùng cho logic độc lập.
        - **Non-static (inner class)**: Giữ tham chiếu đến instance lớp ngoài, dùng khi cần truy cập trạng thái lớp ngoài.
    - **Ví dụ**:
      ```java
      class Outer {
          static class StaticNested {} // Không cần Outer instance
          class Inner {} // Cần Outer instance
      }
      ```

### 3. Quy tắc **một file .java** chứa nhiều lớp: lớp nào phải trùng tên file, vì sao.
- **Trả lời**:
    - Chỉ **lớp public** (nếu có) phải trùng tên file `.java` để trình biên dịch xác định entry point.
    - **Lý do**: JVM và công cụ build dùng tên file để ánh xạ với lớp public.
    - Các lớp non-public trong cùng file không bị ràng buộc tên.
    - **Ví dụ**:
      ```java
      // File: MyClass.java
      public class MyClass {}
      class Helper {} // OK
      ```

### 4. ⚠️ Gài: Lớp **package-private** được khai báo như thế nào? Ảnh hưởng tới truy cập giữa packages?
- **Trả lời**:
    - **Khai báo package-private**: Không dùng modifier (`class MyClass`).
    - **Ảnh hưởng**: Chỉ truy cập được trong cùng package, không truy cập được từ package khác.
    - **Ví dụ**:
      ```java
      // package com.example
      class MyClass {} // package-private
      // package com.other
      MyClass obj = new MyClass(); // Lỗi biên dịch
      ```

---

## 3) Trường (fields) & phương thức (methods)

### 1. So sánh **instance field/method** và **static field/method**: khi nào dùng mỗi loại.
- **Trả lời**:
    - **Instance field/method**: Thuộc về instance, lưu trạng thái/hành vi của object cụ thể. Dùng khi cần trạng thái riêng (ví dụ: `name` trong `Person`).
    - **Static field/method**: Thuộc về class, dùng chung cho mọi instance. Dùng cho hằng số, utility, hoặc trạng thái toàn cục (ví dụ: `Math.PI`, `Arrays.sort()`).
    - **Ví dụ**:
      ```java
      class Example {
          int instanceField;
          static int staticField;
          void instanceMethod() {}
          static void staticMethod() {}
      }
      ```

### 2. Quy ước **constant** (`public static final`) và khác biệt với field thường.
- **Trả lời**:
    - **Constant**: `public static final`, không thay đổi giá trị, đặt tên **VIẾT_HOA_CÓ_DẤU_GẠCH_DƯỚI**.
    - **Field thường**: Có thể thay đổi, không có quy ước tên cố định.
    - **Ví dụ**:
      ```java
      public static final int MAX_SIZE = 100; // Constant
      private int size = 10; // Field thường
      ```

### 3. Overloading method: tiêu chí phân giải (tham số, varargs, autoboxing).
- **Trả lời**:
    - **Tiêu chí phân giải**:
        1. **Exact match**: Kiểu tham số khớp chính xác.
        2. **Widening conversion**: `int` → `long`.
        3. **Boxing conversion**: `int` → `Integer`.
        4. **Varargs**: Ưu tiên thấp nhất.
    - **Ví dụ**:
      ```java
      void m(int x) { System.out.println("int"); }
      void m(Integer x) { System.out.println("Integer"); }
      void m(int... x) { System.out.println("varargs"); }
      m(5); // Gọi m(int)
      ```

### 4. ⚠️ Gài: Hai overload `foo(int)` và `foo(Integer)` — truyền `null` gọi cái nào? Tại sao có thể gây lỗi compile.
- **Trả lời**:
    - **Gọi `foo(Integer)`**: `null` là giá trị của reference type (`Integer`), không phải primitive (`int`).
    - **Lỗi compile**: Nếu có thêm overload như `foo(String)`, trình biên dịch không thể chọn giữa `foo(Integer)` và `foo(String)` vì `null` khớp cả hai.
    - **Ví dụ**:
      ```java
      void foo(int x) {}
      void foo(Integer x) {}
      foo(null); // Gọi foo(Integer)
      ```

### 5. Ảnh hưởng của **access modifiers** (`public/protected/default/private`) trên fields/methods.
- **Trả lời**:
    - **`public`**: Truy cập từ mọi nơi.
    - **`protected`**: Truy cập trong package và trong lớp con (khác package chỉ qua instance lớp con).
    - **`default` (package-private)**: Truy cập trong cùng package.
    - **`private`**: Chỉ truy cập trong cùng class.

---

## 4) Khởi tạo & thứ tự thực thi

### 1. Thứ tự khởi tạo chính xác: **static fields → static init blocks → instance fields → instance init blocks → constructor**.
- **Trả lời**:
    - **Thứ tự**:
        1. **Static fields**: Gán giá trị mặc định hoặc khởi tạo khi class được nạp.
        2. **Static init blocks**: Khối `static {}` chạy một lần khi class được nạp.
        3. **Instance fields**: Gán giá trị mặc định hoặc khởi tạo khi tạo instance.
        4. **Instance init blocks**: Khối `{}` chạy trước constructor.
        5. **Constructor**: Hoàn tất khởi tạo instance.
    - **Ví dụ**:
      ```java
      class Test {
          static int s = 1;
          static { s = 2; }
          int x = 3;
          { x = 4; }
          Test() { x = 5; }
      }
      ```

### 2. Vai trò **instance initializer block** so với gán trực tiếp vào field.
- **Trả lời**:
    - **Instance initializer block**: Khối `{}` chạy trước constructor, dùng cho logic khởi tạo phức tạp (vòng lặp, điều kiện).
    - **Gán trực tiếp**: Gán giá trị tĩnh tại khai báo field, đơn giản hơn.
    - **Ví dụ**:
      ```java
      class Test {
          int x = 1; // Gán trực tiếp
          { x = compute(); } // Initializer block
          int compute() { return 2; }
      }
      ```

### 3. ⚠️ Gài: Gọi method **override** từ constructor của lớp cha có rủi ro gì?
- **Trả lời**:
    - **Rủi ro**: Gọi method override trong constructor cha có thể truy cập trạng thái chưa khởi tạo của lớp con, gây hành vi bất ngờ.
    - **Ví dụ**:
      ```java
      class Parent {
          Parent() { method(); } // Gọi method con
          void method() {}
      }
      class Child extends Parent {
          int x = 10;
          @Override void method() { System.out.println(x); } // x = 0 (chưa khởi tạo)
      }
      new Child(); // In 0, không phải 10
      ```

### 4. Khi nào “default constructor” được tạo tự động? Khi nào **không**?
- **Trả lời**:
    - **Được tạo**: Khi lớp không khai báo bất kỳ constructor nào, trình biên dịch tạo constructor không tham số, body rỗng.
    - **Không được tạo**: Khi lớp khai báo bất kỳ constructor nào (có/không tham số).
    - **Ví dụ**:
      ```java
      class Test {
          // Default constructor tự động: public Test() {}
      }
      class Test2 {
          Test2(int x) {} // Không có default constructor
      }
      ```

### 5. Sự khác nhau giữa `this()` và `super()` trong constructor; quy tắc bắt buộc ở dòng đầu.
- **Trả lời**:
    - **`this()`**: Gọi constructor khác trong cùng class, tái sử dụng logic.
    - **`super()`**: Gọi constructor của lớp cha, đảm bảo lớp cha được khởi tạo.
    - **Quy tắc**: Phải là **dòng đầu tiên** trong constructor; không thể gọi cả `this()` và `super()` cùng lúc.
    - **Ví dụ**:
      ```java
      class Child extends Parent {
          Child() { super(); } // Gọi constructor cha
          Child(int x) { this(); } // Gọi constructor khác
      }
      ```

---

## 5) `this` & `super`

### 1. `this` được dùng để làm gì (truy cập field, gọi constructor, truyền reference chính nó)?
- **Trả lời**:
    - **Truy cập field**: Phân biệt field với biến local/parameter (`this.field`).
    - **Gọi constructor**: `this(args)` để gọi constructor khác trong cùng class.
    - **Truyền reference**: Truyền `this` như tham số hoặc trả về (hỗ trợ method chaining).
    - **Ví dụ**:
      ```java
      class Test {
          int x;
          Test(int x) { this.x = x; } // Truy cập field
          Test() { this(0); } // Gọi constructor
      }
      ```

### 2. `super` dùng khi nào (gọi method/constructor của lớp cha).
- **Trả lời**:
    - **Gọi constructor**: `super(args)` trong constructor để khởi tạo lớp cha.
    - **Gọi method**: `super.method()` để gọi method của lớp cha bị override.
    - **Ví dụ**:
      ```java
      class Child extends Parent {
          Child() { super(10); }
          @Override void method() { super.method(); }
      }
      ```

### 3. ⚠️ Gài: Truy cập field bị **hidden** ở lớp con bằng cú pháp nào? Có thể “override” field không?
- **Trả lời**:
    - **Truy cập field bị hidden**: Dùng `super.field`.
    - **Không thể override field**: Field chỉ có thể bị **hidden** (che khuất), không override như method.
    - **Ví dụ**:
      ```java
      class Parent { int x = 10; }
      class Child extends Parent {
          int x = 20; // Hiding
          void print() { System.out.println(super.x); } // In 10
      }
      ```

### 4. Trả về `this` để hỗ trợ **method chaining**: lợi/hại.
- **Trả lời**:
    - **Lợi**:
        - Code ngắn gọn, gọi liên tiếp method (`obj.setX(1).setY(2)`).
        - Phù hợp với builder pattern.
    - **Hại**:
        - Có thể làm lộ tham chiếu trước khi khởi tạo xong.
        - Khó debug nếu lạm dụng.
    - **Ví dụ**:
      ```java
      class Builder {
          Builder setX(int x) { this.x = x; return this; }
      }
      ```

---

## 6) Static chi tiết

### 1. `static` initializer chạy khi nào? Khi nào một lớp được **initialize** (class initialization triggers).
- **Trả lời**:
    - **`static` initializer**: Chạy một lần khi class được nạp (class loader).
    - **Triggers**:
        - Tạo instance mới (`new MyClass()`).
        - Gọi static method/field.
        - Class được nạp qua `Class.forName()`.
    - **Ví dụ**:
      ```java
      class Test {
          static { System.out.println("Static init"); }
      }
      ```

### 2. ⚠️ Gài: Thứ tự khởi tạo giữa **static fields** phụ thuộc lẫn nhau trong cùng lớp — rủi ro nào?
- **Trả lời**:
    - **Rủi ro**: Nếu static fields phụ thuộc lẫn nhau, thứ tự khai báo quyết định giá trị, có thể dẫn đến trạng thái không mong muốn.
    - **Ví dụ**:
      ```java
      class Test {
          static int x = y + 1; // y chưa khởi tạo → 0
          static int y = 10;
      }
      // x = 1, không phải 11
      ```
    - **Khuyến nghị**: Tránh phụ thuộc hoặc dùng static initializer block.

### 3. Mẫu **Singleton**: các biến thể (eager, lazy holder, enum). Ưu/nhược mỗi biến thể.
- **Trả lời**:
    - **Eager**:
      ```java
      class Singleton {
          private static final Singleton INSTANCE = new Singleton();
          private Singleton() {}
          public static Singleton getInstance() { return INSTANCE; }
      }
      ```
        - **Ưu**: Đơn giản, thread-safe.
        - **Nhược**: Tạo instance ngay cả khi không dùng.
    - **Lazy Holder**:
      ```java
      class Singleton {
          private Singleton() {}
          private static class Holder {
              static final Singleton INSTANCE = new Singleton();
          }
          public static Singleton getInstance() { return Holder.INSTANCE; }
      }
      ```
        - **Ưu**: Lazy loading, thread-safe.
        - **Nhược**: Phức tạp hơn.
    - **Enum**:
      ```java
      enum Singleton {
          INSTANCE;
      }
      ```
        - **Ưu**: Ngắn gọn, thread-safe, chống reflection/serialization.
        - **Nhược**: Không hỗ trợ lazy loading phức tạp.

### 4. `static import` dùng khi nào nên/không nên.
- **Trả lời**:
    - **Nên dùng**: Khi truy cập static member thường xuyên (ví dụ: `import static java.lang.Math.PI;`).
    - **Không nên dùng**: Khi làm code khó đọc hoặc gây nhập nhằng (ví dụ: import nhiều static method cùng tên).

---

## 7) Lớp lồng nhau & nội bộ

### 1. Phân biệt **static nested class** vs **inner class**; hệ quả đến việc nắm giữ tham chiếu outer.
- **Trả lời**:
    - **Static nested class**: Không giữ tham chiếu đến instance lớp ngoài, độc lập, dùng khi không cần trạng thái lớp ngoài.
    - **Inner class**: Giữ tham chiếu ngầm đến instance lớp ngoài, dùng khi cần truy cập trạng thái.
    - **Hệ quả**:
        - Inner class cần instance lớp ngoài để tạo (`new Outer().new Inner()`).
        - Static nested class tạo trực tiếp (`new Outer.StaticNested()`).

### 2. Local class & anonymous class: use case và giới hạn.
- **Trả lời**:
    - **Local class**: Lớp định nghĩa trong method, dùng cho logic tạm thời, phạm vi trong block.
    - **Anonymous class**: Lớp không tên, dùng để implement interface hoặc override method một lần (ví dụ: `new Runnable() {...}`).
    - **Giới hạn**:
        - Local class: Chỉ dùng trong block, không thể public.
        - Anonymous class: Không thể tái sử dụng, không có constructor.
    - **Use case**: Anonymous class cho sự kiện GUI, local class cho logic phức tạp tạm thời.

### 3. ⚠️ Gài: Biến bên ngoài bắt buộc **effectively final** trong inner/anonymous class là gì, vì sao.
- **Trả lời**:
    - **Effectively final**: Biến local/parameter không được gán lại sau khởi tạo.
    - **Lý do**: Inner/anonymous class sao chép biến vào instance, cần đảm bảo giá trị không đổi để tránh bất đồng bộ.
    - **Ví dụ**:
      ```java
      int x = 10;
      Runnable r = () -> System.out.println(x); // OK
      x = 20; // Lỗi biên dịch nếu x không effectively final
      ```

### 4. Truy cập `OuterClass.this` trong inner class làm gì; rủi ro memory leak?
- **Trả lời**:
    - **`OuterClass.this`**: Truy cập instance lớp ngoài từ inner class.
    - **Rủi ro memory leak**: Inner class giữ tham chiếu đến lớp ngoài, có thể ngăn GC thu hồi nếu inner class được giữ lâu (ví dụ: trong event listener).
    - **Ví dụ**:
      ```java
      class Outer {
          class Inner {
              void method() { System.out.println(Outer.this); }
          }
      }
      ```

---

## 8) Bao đóng (encapsulation) & “properties”

### 1. Nguyên tắc encapsulation: bảo vệ bất biến; khi nào dùng **defensive copy** với `Date`, arrays, collections.
- **Trả lời**:
    - **Encapsulation**: Ẩn chi tiết triển khai, chỉ expose qua getter/setter để bảo vệ trạng thái.
    - **Defensive copy**: Dùng khi field là mutable (`Date`, arrays, collections) để tránh thay đổi ngoài ý muốn.
    - **Ví dụ**:
      ```java
      class Test {
          private final List<String> list = new ArrayList<>();
          public List<String> getList() { return Collections.unmodifiableList(list); }
          public void setList(List<String> input) { list.clear(); list.addAll(input); }
      }
      ```

### 2. Quy ước **JavaBean** getter/setter; tác động tới các thư viện (ORM, JSON).
- **Trả lời**:
    - **Quy ước JavaBean**:
        - Getter: `getX()` cho non-boolean, `isX()` cho boolean.
        - Setter: `setX(T x)`.
        - Field private, getter/setter public.
    - **Tác động**: ORM (Hibernate), JSON (Jackson) dựa vào getter/setter để ánh xạ dữ liệu.
    - **Ví dụ**:
      ```java
      class Person {
          private String name;
          public String getName() { return name; }
          public void setName(String name) { this.name = name; }
      }
      ```

### 3. ⚠️ Gài: Setter cho collection nên gán trực tiếp hay copy/unwrap? Vì sao.
- **Trả lời**:
    - **Nên copy**: Không gán trực tiếp tham chiếu mà sao chép dữ liệu để tránh thay đổi ngoài ý muốn.
    - **Lý do**: Gán trực tiếp khiến collection nội bộ bị sửa đổi bên ngoài, phá vỡ encapsulation.
    - **Ví dụ**:
      ```java
      public void setList(List<String> input) {
          list = new ArrayList<>(input); // Copy
      }
      ```

### 4. Thiết kế **read-only view** cho dữ liệu nội bộ (unmodifiable wrappers).
- **Trả lời**:
    - Dùng `Collections.unmodifiableList/Set/Map` để trả về view chỉ đọc.
    - **Ví dụ**:
      ```java
      private final List<String> list = new ArrayList<>();
      public List<String> getList() { return Collections.unmodifiableList(list); }
      ```

---

## 9) Bất biến (immutability) & bản sao (copy)

### 1. Yêu cầu tối thiểu để xây dựng một lớp **immutable** (final, không lộ tham chiếu mutable, copy phòng thủ…).
- **Trả lời**:
    - Lớp là `final` (ngăn kế thừa).
    - Tất cả field là `private final`.
    - Không có setter, getter trả về bản sao nếu field mutable.
    - Constructor thực hiện defensive copy cho tham số mutable.
    - **Ví dụ**:
      ```java
      final class Immutable {
          private final List<String> list;
          public Immutable(List<String> list) { this.list = new ArrayList<>(list); }
          public List<String> getList() { return Collections.unmodifiableList(list); }
      }
      ```

### 2. Copy constructor vs factory `of(...)`: khi nào nên dùng.
- **Trả lời**:
    - **Copy constructor**: Tạo instance mới từ instance hiện tại (`new MyClass(other)`).
    - **Factory `of(...)`**: Tạo instance từ tham số, kiểm soát khởi tạo chặt chẽ.
    - **Khi dùng**:
        - Copy constructor: Khi cần sao chép toàn bộ trạng thái.
        - Factory: Khi cần logic khởi tạo đặc biệt hoặc cache.
    - **Ví dụ**:
      ```java
      class MyClass {
          int x;
          MyClass(MyClass other) { this.x = other.x; } // Copy constructor
          static MyClass of(int x) { return new MyClass(x); } // Factory
      }
      ```

### 3. ⚠️ Gài: `final` trên **biến tham chiếu** có biến object thành immutable không?
- **Trả lời**:
    - **Không**: `final` chỉ ngăn thay đổi tham chiếu, không ngăn thay đổi trạng thái object.
    - **Ví dụ**:
      ```java
      final List<String> list = new ArrayList<>();
      list.add("Hello"); // Hợp lệ
      list = new ArrayList<>(); // Lỗi biên dịch
      ```

### 4. Deep copy vs shallow copy — ví dụ minh hoạ.
- **Trả lời**:
    - **Shallow copy**: Sao chép tham chiếu, không sao chép object được tham chiếu.
    - **Deep copy**: Sao chép toàn bộ cấu trúc object.
    - **Ví dụ**:
      ```java
      class Test implements Cloneable {
          List<String> list = new ArrayList<>();
          @Override public Test clone() throws CloneNotSupportedException {
              Test copy = (Test) super.clone(); // Shallow
              copy.list = new ArrayList<>(list); // Deep
              return copy;
          }
      }
      ```

---

## 10) `equals`, `hashCode`, `toString`, `compareTo`

### 1. **Hợp đồng** của `equals()`/`hashCode()` và hệ quả với `HashMap`/`HashSet`.
- **Trả lời**:
    - **Hợp đồng `equals()`**:
        - Reflexive: `x.equals(x) == true`.
        - Symmetric: `x.equals(y) == y.equals(x)`.
        - Transitive: Nếu `x.equals(y)` và `y.equals(z)`, thì `x.equals(z)`.
        - Consistent: Kết quả không đổi nếu trạng thái không đổi.
        - Null: `x.equals(null) == false`.
    - **Hợp đồng `hashCode()`**:
        - Nếu `x.equals(y)`, thì `x.hashCode() == y.hashCode()`.
        - Consistent: Không đổi nếu trạng thái không đổi.
    - **Hệ quả**: Vi phạm hợp đồng gây lỗi trong `HashMap`/`HashSet` (mất key, tìm kiếm sai).

### 2. Thiết kế `equals()` an toàn với entity có id gán sau (transient → persistent).
- **Trả lời**:
    - **Cách thiết kế**:
        - Nếu `id` đã gán, so sánh `id`.
        - Nếu `id` chưa gán, so sánh các field khác.
    - **Ví dụ**:
      ```java
      class User {
          private Long id;
          private String name;
          @Override
          public boolean equals(Object o) {
              if (this == o) return true;
              if (!(o instanceof User)) return false;
              User other = (User) o;
              if (id != null && other.id != null) return id.equals(other.id);
              return Objects.equals(name, other.name);
          }
          @Override
          public int hashCode() { return id != null ? id.hashCode() : Objects.hash(name); }
      }
      ```

### 3. `compareTo()` (Comparable) vs `Comparator` — tính **consistent with equals** là gì.
- **Trả lời**:
    - **`Comparable`**: Interface định nghĩa `compareTo()` trong lớp, dùng cho thứ tự tự nhiên.
    - **`Comparator`**: Lớp riêng định nghĩa thứ tự tùy chỉnh.
    - **Consistent with equals**: Nếu `x.equals(y)`, thì `x.compareTo(y) == 0` (khuyến nghị, không bắt buộc).
    - **Ví dụ**:
      ```java
      class Person implements Comparable<Person> {
          String name;
          @Override public int compareTo(Person o) { return name.compareTo(o.name); }
      }
      ```

### 4. ⚠️ Gài: Hai đối tượng `equal` có bắt buộc cùng `hashCode` không? Ngược lại thì sao?
- **Trả lời**:
    - **Cùng `equals` → bắt buộc cùng `hashCode`**: Theo hợp đồng `hashCode()`.
    - **Cùng `hashCode` → không bắt buộc `equals`**: `hashCode()` có thể xung đột (hash collision).
    - **Ví dụ**:
      ```java
      String s1 = "Aa", s2 = "BB";
      s1.hashCode() == s2.hashCode(); // Có thể true
      s1.equals(s2); // false
      ```

### 5. Viết `toString()` hữu ích: ẩn thông tin nhạy cảm, cân bằng độ dài.
- **Trả lời**:
    - **Nguyên tắc**:
        - In thông tin chính (id, name, trạng thái).
        - Ẩn PII (mật khẩu, thông tin cá nhân).
        - Giữ chuỗi ngắn gọn, dễ đọc.
    - **Ví dụ**:
      ```java
      class User {
          private Long id;
          private String name;
          private String password;
          @Override
          public String toString() { return "User{id=" + id + ", name='" + name + "'}"; }
      }
      ```

---

## 11) `clone()` & `Cloneable` (và vì sao hay tránh)

### 1. Cơ chế `clone()` mặc định, yêu cầu triển khai `Cloneable`.
- **Trả lời**:
    - **`clone()`**: Phương thức của `Object`, tạo bản sao (shallow copy).
    - **Yêu cầu `Cloneable`**: Interface rỗng, đánh dấu lớp có thể clone.
    - **Cơ chế mặc định**: Sao chép tham chiếu, không sao chép object con.

### 2. Deep vs shallow clone; tại sao nhiều guideline khuyên **tránh** clone.
- **Trả lời**:
    - **Shallow clone**: Chỉ sao chép tham chiếu của field.
    - **Deep clone**: Sao chép toàn bộ cấu trúc object.
    - **Tránh clone**:
        - Dễ lỗi nếu không xử lý deep clone.
        - Phức tạp với cấu trúc lồng nhau.
        - Copy constructor/factory an toàn hơn.
    - **Ví dụ**:
      ```java
      class Test implements Cloneable {
          List<String> list;
          @Override public Test clone() throws CloneNotSupportedException {
              Test copy = (Test) super.clone();
              copy.list = new ArrayList<>(list); // Deep
              return copy;
          }
      }
      ```

### 3. ⚠️ Gài: Gọi `super.clone()` khi **không** implements `Cloneable` sẽ thế nào?
- **Trả lời**:
    - Ném `CloneNotSupportedException` vì `Cloneable` là điều kiện bắt buộc.
    - **Ví dụ**:
      ```java
      class Test {
          @Override public Object clone() throws CloneNotSupportedException {
              return super.clone(); // Lỗi runtime
          }
      }
      ```

---

## 12) Vòng đời object, dọn dẹp tài nguyên

### 1. Garbage Collection ảnh hưởng gì tới vòng đời object (không xác định thời điểm hủy).
- **Trả lời**:
    - **Vòng đời**: Tạo (new) → Sử dụng → Không còn tham chiếu → GC thu hồi.
    - **GC**: Chạy không xác định, chỉ thu hồi khi không còn tham chiếu, không đảm bảo thời điểm hủy.

### 2. `finalize()` (đã bị loại bỏ/deprecated): vì sao không nên dùng.
- **Trả lời**:
    - **Deprecated**: Từ Java 9, loại bỏ từ Java 18.
    - **Lý do tránh**:
        - Không đảm bảo chạy (GC quyết định).
        - Hiệu năng thấp, khó debug.
        - Thay bằng `try-with-resources` hoặc `Cleaner`.

### 3. ⚠️ Gài: Nếu cần dọn tài nguyên (socket, stream), dùng cơ chế nào đúng chuẩn? (gợi ý: `try-with-resources`, `AutoCloseable`).
- **Trả lời**:
    - **Cơ chế đúng**: `try-with-resources` với lớp implement `AutoCloseable`.
    - **Ví dụ**:
      ```java
      try (BufferedReader br = new BufferedReader(...)) {
          // Sử dụng
      } // Tự động gọi br.close()
      ```

### 4. `Cleaner` là gì (thay thế finalize) và khi nào cân nhắc.
- **Trả lời**:
    - **`Cleaner`**: Class trong Java 9+ để đăng ký hành động dọn dẹp, chạy khi object không còn tham chiếu.
    - **Khi dùng**: Khi cần dọn tài nguyên ngoài heap (native memory).
    - **Ví dụ**:
      ```java
      Cleaner cleaner = Cleaner.create();
      cleaner.register(this, () -> System.out.println("Cleaned"));
      ```

---

## 13) Đa hình & ràng buộc khi kế thừa (liên quan lớp)

### 1. Overriding vs overloading: quyết định tại **runtime** hay **compile-time**.
- **Trả lời**:
    - **Overriding**: Ghi đè method, quyết định tại **runtime** (dynamic dispatch).
    - **Overloading**: Nhiều method cùng tên, khác tham số, quyết định tại **compile-time**.
    - **Ví dụ**:
      ```java
      class Parent { void m() {} }
      class Child extends Parent { @Override void m() {} }
      Parent p = new Child();
      p.m(); // Gọi Child.m() (runtime)
      ```

### 2. Covariant return type khi override: quy tắc.
- **Trả lời**:
    - Cho phép method override trả về kiểu là **subtype** của kiểu trả về method cha.
    - **Ví dụ**:
      ```java
      class Parent { Parent get() { return this; } }
      class Child extends Parent { @Override Child get() { return this; } }
      ```

### 3. ⚠️ Gài: Rules khi override method có `throws` checked exceptions (thu hẹp/mở rộng?).
- **Trả lời**:
    - **Quy tắc**: Chỉ được ném **checked exceptions là con** của exception trong method cha hoặc **ít hơn** (thu hẹp).
    - **Ví dụ**:
      ```java
      class Parent { void m() throws IOException {} }
      class Child extends Parent { @Override void m() throws FileNotFoundException {} }
      ```

### 4. Ủy quyền (delegation) & composition over inheritance: khi nào nên ưu tiên.
- **Trả lời**:
    - **Ưu tiên composition**:
        - Quan hệ **has-a** thay vì **is-a**.
        - Cần kiểm soát hành vi cụ thể.
        - Tránh kế thừa phức tạp.
    - **Ví dụ**:
      ```java
      class Car {
          private Engine engine = new Engine();
          void start() { engine.start(); } // Delegation
      }
      ```

---

## 14) Generics trên lớp & phương thức

### 1. Khai báo lớp generic, method generic; khi nào nên đặt generic ở method thay vì class.
- **Trả lời**:
    - **Lớp generic**: `<T>` áp dụng cho toàn bộ class.
    - **Method generic**: `<T>` chỉ áp dụng trong method.
    - **Khi dùng method generic**: Khi logic chỉ cần generic trong phạm vi method.
    - **Ví dụ**:
      ```java
      class Box<T> { T value; }
      class Util {
          static <T> void print(T t) { System.out.println(t); }
      }
      ```

### 2. ⚠️ Gài: **Type erasure** ảnh hưởng gì đến overload và kiểm tra kiểu lúc runtime (`instanceof`)?
- **Trả lời**:
    - **Type erasure**: Xóa generic type tại runtime, thay bằng raw type hoặc bound (`Object` nếu không có bound).
    - **Ảnh hưởng**:
        - **Overload**: Không thể overload chỉ dựa trên generic type khác nhau (`m(List<String>)` và `m(List<Integer>)` gây lỗi).
        - **instanceof**: Không kiểm tra được generic type (`obj instanceof List<String>` không hợp lệ).
    - **Ví dụ**:
      ```java
      List<String> list = new ArrayList<>();
      System.out.println(list instanceof List); // OK
      ```

### 3. Ràng buộc `<T extends …>` và `<T super …>` trong khai báo API.
- **Trả lời**:
    - **`<T extends X>`**: Giới hạn `T` là `X` hoặc subtype, dùng cho producer (ví dụ: `List<? extends Number>`).
    - **`<T super X>`**: Giới hạn `T` là `X` hoặc supertype, dùng cho consumer (ví dụ: `List<? super Integer>`).
    - **Ví dụ**:
      ```java
      <T extends Comparable<T>> void sort(List<T> list) {}
      ```

---

## 15) Tham chiếu, truyền tham số & object identity

### 1. Java **pass-by-value**: truyền đối tượng như thế nào (copy tham chiếu).
- **Trả lời**:
    - Java **pass-by-value**: Copy giá trị tham số (primitive hoặc tham chiếu).
    - Với object, copy tham chiếu, nên thay đổi trạng thái ảnh hưởng gốc.
    - **Ví dụ**:
      ```java
      void modify(List<String> list) { list.add("Hello"); }
      List<String> l = new ArrayList<>();
      modify(l); // l = [Hello]
      ```

### 2. ⚠️ Gài: Đổi tham chiếu trong method có làm thay đổi biến bên ngoài không? Khác với mutate object bên trong.
- **Trả lời**:
    - **Đổi tham chiếu**: Không ảnh hưởng biến ngoài vì chỉ thay đổi bản sao tham chiếu.
    - **Mutate object**: Ảnh hưởng vì tham chiếu trỏ đến cùng object.
    - **Ví dụ**:
      ```java
      void swap(List<String> list) { list = new ArrayList<>(); }
      void add(List<String> list) { list.add("Hello"); }
      List<String> l = new ArrayList<>();
      swap(l); // l không đổi
      add(l); // l = [Hello]
      ```

### 3. Phân biệt `==` và `equals()` cho reference types.
- **Trả lời**:
    - **`==`**: So sánh tham chiếu (cùng địa chỉ bộ nhớ).
    - **`equals()`**: So sánh nội dung (tùy implement, ví dụ: `String` so sánh ký tự).
    - **Ví dụ**:
      ```java
      String a = new String("x");
      String b = new String("x");
      a == b; // false
      a.equals(b); // true
      ```

---

## 16) Mini case (thực chiến 2–5 phút/câu)

### 1. Thiết kế lớp **immutable `Money`** (currency, amount): nêu fields, constructor, validate, equals/hashCode, toString, defensive copy nếu cần.
- **Trả lời**:
  ```java
  import java.math.BigDecimal;
  import java.util.Objects;

  public final class Money {
      private final BigDecimal amount;
      private final String currency;

      public Money(BigDecimal amount, String currency) {
          if (amount == null || currency == null) throw new IllegalArgumentException("Non-null required");
          this.amount = new BigDecimal(amount.toString()); // Defensive copy
          this.currency = currency;
      }

      public BigDecimal getAmount() { return new BigDecimal(amount.toString()); }
      public String getCurrency() { return currency; }

      @Override
      public boolean equals(Object o) {
          if (this == o) return true;
          if (!(o instanceof Money)) return false;
          Money other = (Money) o;
          return amount.compareTo(other.amount) == 0 && currency.equals(other.currency);
      }

      @Override
      public int hashCode() { return Objects.hash(amount, currency); }

      @Override
      public String toString() { return currency + " " + amount; }
  }
  ```

### 2. Refactor một lớp có **nhiều constructor** chồng chéo sang **builder pattern**: tiêu chí và lợi ích.
- **Trả lời**:
    - **Tiêu chí**: Khi class có nhiều constructor với tham số tùy chọn, gây khó đọc và bảo trì.
    - **Lợi ích**: Dễ đọc, hỗ trợ tham số tùy chọn, đảm bảo bất biến.
    - **Ví dụ**:
      ```java
      class Person {
          private final String name;
          private final int age;
  
          private Person(String name, int age) { this.name = name; this.age = age; }
  
          static class Builder {
              private String name;
              private int age;
              Builder name(String name) { this.name = name; return this; }
              Builder age(int age) { this.age = age; return this; }
              Person build() { return new Person(name, age); }
          }
      }
      ```

### 3. Một entity `User` có `roles: List<Role>`: viết getter/setter an toàn để không rò rỉ cấu trúc nội bộ.
- **Trả lời**:
  ```java
  class User {
      private final List<Role> roles = new ArrayList<>();

      public List<Role> getRoles() { return Collections.unmodifiableList(roles); }
      public void setRoles(List<Role> roles) {
          this.roles.clear();
          this.roles.addAll(roles != null ? roles : List.of());
      }
  }
  ```

### 4. Khắc phục `equals()` sai khiến `HashSet` chứa trùng phần tử: quy trình kiểm tra và sửa.
- **Trả lời**:
    - **Kiểm tra**:
        1. Xác minh `equals()` tuân thủ hợp đồng (reflexive, symmetric, transitive, consistent).
        2. Kiểm tra `hashCode()`: Nếu `equals()` trả `true`, `hashCode()` phải giống nhau.
    - **Sửa**:
      ```java
      class Item {
          private int id;
          @Override
          public boolean equals(Object o) {
              if (this == o) return true;
              if (!(o instanceof Item)) return false;
              return id == ((Item) o).id;
          }
          @Override
          public int hashCode() { return id; }
      }
      ```

### 5. Tạo **inner class** xử lý sự kiện, chỉ ra cách truy cập `OuterClass.this` và minh họa bẫy “effectively final”.
- **Trả lời**:
  ```java
  class Outer {
      private int x;
      class Inner {
          void handleEvent() {
              System.out.println(Outer.this.x); // Truy cập Outer instance
              int local = 10;
              Runnable r = () -> System.out.println(local); // OK, local effectively final
              // local = 20; // Lỗi nếu không effectively final
          }
      }
  }
  ```

### 6. Viết lớp `Range` (start, end) với bất biến `start ≤ end`: chèn kiểm tra vào đâu (constructor/setter), thông điệp lỗi ra sao.
- **Trả lời**:
  ```java
  class Range {
      private final int start;
      private final int end;

      public Range(int start, int end) {
          if (start > end) throw new IllegalArgumentException("start must be <= end");
          this.start = start;
          this.end = end;
      }

      public int getStart() { return start; }
      public int getEnd() { return end; }
  }
  ```

---

