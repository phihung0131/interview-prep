## 1) Object & Class — nền tảng

### 1. “Mọi thứ trong Java đều là object” — đúng đến mức nào? Liệt kê ngoại lệ.
- **Trả lời**: Nhận định này đúng một phần, vì Java là ngôn ngữ hướng đối tượng, nhưng không phải mọi thứ đều là object. Các **ngoại lệ** bao gồm:
    - **Kiểu nguyên thủy** (primitive types): `int`, `double`, `boolean`, `char`, v.v. (không phải đối tượng, được lưu trực tiếp trên stack).
    - **Tham chiếu null**: Không trỏ đến đối tượng nào.
    - **Kiểu void**: Không đại diện cho đối tượng.
    - Các **static member** (field/method): Thuộc về class, không phải instance.
- Các kiểu nguyên thủy có thể được bọc (boxed) thành đối tượng (`Integer`, `Double`, v.v.) qua autoboxing, nhưng bản thân chúng không phải object.

### 2. Vai trò của lớp `Object`. Kể các phương thức cốt lõi và ý nghĩa.
- **Trả lời**: Lớp `Object` là lớp cha của mọi lớp trong Java, cung cấp các phương thức cơ bản cho mọi đối tượng. Các phương thức cốt lõi:
    - `equals(Object)`: So sánh hai đối tượng xem có tương đương không (theo nội dung, không phải tham chiếu).
    - `hashCode()`: Trả về mã băm, dùng trong các cấu trúc dữ liệu như `HashMap`, `HashSet`.
    - `toString()`: Trả về biểu diễn chuỗi của đối tượng, mặc định là `ClassName@hashCode`.
    - `clone()`: Tạo bản sao của đối tượng (shallow copy mặc định, cần implement `Cloneable`).
    - `finalize()`: Gọi trước khi GC thu hồi đối tượng (không khuyến nghị sử dụng, deprecated từ Java 9).
    - `getClass()`: Trả về đối tượng `Class` mô tả kiểu runtime của đối tượng.
    - `wait()`, `notify()`, `notifyAll()`: Hỗ trợ đồng bộ hóa luồng (thread synchronization).
- Vai trò: Định nghĩa hành vi mặc định và hợp đồng cơ bản cho mọi đối tượng.

### 3. Trình bày khác biệt **class** vs **object/instance**; khái niệm **state/behavior/identity**.
- **Trả lời**:
    - **Class**: Là bản thiết kế (blueprint) định nghĩa cấu trúc và hành vi của đối tượng, bao gồm các field, method, constructor.
    - **Object/Instance**: Là thể hiện cụ thể của class, được tạo bằng `new`, chiếm bộ nhớ trong heap.
    - **State**: Trạng thái của đối tượng, được xác định bởi giá trị của các field tại một thời điểm (ví dụ: `balance` trong `Account`).
    - **Behavior**: Hành vi của đối tượng, được định nghĩa bởi các method (ví dụ: `deposit()`, `withdraw()`).
    - **Identity**: Danh tính duy nhất của đối tượng, xác định bởi địa chỉ bộ nhớ (so sánh bằng `==`).

### 4. Trường (field) vs thuộc tính (property) — trong Java chuẩn có “property” như các ngôn ngữ khác không?
- **Trả lời**:
    - **Field**: Là biến instance hoặc static được khai báo trong class (ví dụ: `private int age;`).
    - **Property**: Trong các ngôn ngữ như C#, property là cặp getter/setter được định nghĩa đặc biệt. Trong Java, không có khái niệm property chính thức như C#, nhưng getter/setter (ví dụ: `getAge()`, `setAge()`) thường được dùng để mô phỏng property.
    - Java **không có property chuẩn** như C# (với cú pháp đặc biệt như `{get; set;}`), nhưng các công cụ như JavaBeans coi cặp getter/setter là property.

### 5. ⚠️ Gài: `final` trên **biến tham chiếu** có bất biến (immutable) đối tượng không? Nêu ví dụ phản chứng.
- **Trả lời**: `final` trên biến tham chiếu chỉ ngăn thay đổi **tham chiếu** (không cho trỏ đến đối tượng khác), nhưng **không đảm bảo bất biến** trạng thái của đối tượng được trỏ tới.
- **Ví dụ phản chứng**:
  ```java
  final List<String> list = new ArrayList<>();
  list.add("Hello"); // Hợp lệ, trạng thái đối tượng thay đổi
  list = new ArrayList<>(); // Lỗi biên dịch, không thể gán tham chiếu mới
  ```
- Để đảm bảo bất biến, cần dùng các lớp bất biến (`Collections.unmodifiableList`) hoặc thiết kế lớp với các nguyên tắc bất biến.

---

## 2) Khởi tạo & vòng đời đối tượng

### 1. Thứ tự khởi tạo: static field → static initializer → instance field → instance initializer → constructor — sắp xếp đúng thứ tự và giải thích.
- **Trả lời**:
    - **Thứ tự đúng**:
        1. **Static field**: Gán giá trị mặc định hoặc khởi tạo khi class được nạp.
        2. **Static initializer**: Khối `static {}` chạy một lần khi class được nạp.
        3. **Instance field**: Gán giá trị mặc định hoặc khởi tạo khi tạo instance.
        4. **Instance initializer**: Khối `{}` chạy trước constructor khi tạo instance.
        5. **Constructor**: Chạy cuối cùng để hoàn tất khởi tạo instance.
    - **Giải thích**:
        - Static members được khởi tạo đầu tiên vì chúng thuộc về class, chỉ chạy một lần khi class loader nạp class.
        - Instance members được khởi tạo khi tạo đối tượng mới, theo thứ tự field → initializer → constructor.

### 2. Constructor mặc định được cấp khi nào? Khi khai báo **bất kỳ** constructor khác thì chuyện gì xảy ra?
- **Trả lời**:
    - **Constructor mặc định**: Được trình biên dịch cung cấp (không tham số, body rỗng) nếu **không khai báo bất kỳ constructor nào** trong class.
    - Khi khai báo **bất kỳ constructor nào** (dù có tham số hay không), constructor mặc định **không được cung cấp**. Cần gọi `super()` hoặc `this()` tường minh trong constructor con nếu có.

### 3. Gọi `this(...)` vs `super(...)` trong constructor: quy tắc và thứ tự bắt buộc.
- **Trả lời**:
    - **`this(...)`**: Gọi constructor khác trong cùng class, dùng để tái sử dụng logic khởi tạo.
    - **`super(...)`**: Gọi constructor của lớp cha, đảm bảo lớp cha được khởi tạo trước.
    - **Quy tắc**:
        - Phải là **câu lệnh đầu tiên** trong constructor (không thể gọi cả `this()` và `super()` cùng lúc).
        - Nếu không gọi `super(...)` tường minh, trình biên dịch tự động thêm `super()` (gọi constructor mặc định của lớp cha).
        - Nếu lớp cha không có constructor mặc định, phải gọi `super(...)` tường minh.

### 4. ⚠️ Gài: Dùng field được **override** trong constructor của lớp cha có an toàn không? Vì sao có thể dẫn tới hành vi bất ngờ.
- **Trả lời**: **Không an toàn**. Lý do:
    - Trong constructor của lớp cha, các field hoặc method được override bởi lớp con có thể chưa được khởi tạo đầy đủ (vì constructor của lớp con chưa chạy).
    - Điều này dẫn đến **hành vi bất ngờ**, như truy cập field con trước khi nó được gán giá trị.
- **Ví dụ**:
  ```java
  class Parent {
      Parent() { System.out.println(getValue()); } // Gọi method con
      int getValue() { return 0; }
  }
  class Child extends Parent {
      private int value = 42; // Khởi tạo sau constructor cha
      @Override int getValue() { return value; }
  }
  // Kết quả: in ra 0 (value chưa khởi tạo) thay vì 42.
  ```

### 5. Sự khác nhau giữa **initializer block** và gán trực tiếp vào field.
- **Trả lời**:
    - **Initializer block** (`{}`): Là khối mã chạy trước constructor, dùng để khởi tạo phức tạp hoặc chia sẻ logic giữa các constructor.
    - **Gán trực tiếp vào field**: Là gán giá trị ngay tại khai báo field (ví dụ: `int x = 10;`), đơn giản và chỉ chạy một lần khi khởi tạo instance.
    - **Khác biệt**:
        - Initializer block cho phép logic phức tạp (vòng lặp, điều kiện), trong khi gán trực tiếp chỉ là giá trị tĩnh.
        - Initializer block chạy sau khi gán trực tiếp vào field.

---

## 3) Bao đóng & phạm vi truy cập

### 1. So sánh `public`, `protected`, `default` (package-private), `private` trên **class**, **field**, **method**, **constructor**.
- **Trả lời**:
    - **`public`**: Truy cập từ mọi nơi.
    - **`protected`**: Truy cập trong gói (package) và trong các lớp con (kể cả khác gói, nhưng chỉ qua instance của lớp con).
    - **`default` (package-private)**: Truy cập chỉ trong cùng gói, áp dụng khi không khai báo modifier.
    - **`private`**: Chỉ truy cập trong cùng class.
    - **Áp dụng**:
        - **Class**: Chỉ hỗ trợ `public` hoặc `default` (trừ nested class có thể là `protected`/`private`).
        - **Field/Method/Constructor**: Hỗ trợ cả 4 modifier, kiểm soát phạm vi truy cập.

### 2. Khi nào dùng **encapsulation** để bảo vệ bất biến? Mẫu getter/setter “an toàn” với collection/array.
- **Trả lời**:
    - **Encapsulation**: Ẩn chi tiết triển khai, chỉ expose thông qua getter/setter để bảo vệ trạng thái bất biến và kiểm soát truy cập.
    - **Khi dùng**: Khi cần đảm bảo dữ liệu không bị sửa đổi ngoài ý muốn (ví dụ: giữ `List` không bị thêm/xóa ngoài class).
    - **Mẫu getter/setter an toàn**:
      ```java
      private final List<String> items = new ArrayList<>();
      public List<String> getItems() {
          return Collections.unmodifiableList(items); // Trả về bản sao chỉ đọc
      }
      public void setItems(List<String> newItems) {
          items.clear();
          items.addAll(newItems); // Defensive copy
      }
      ```

### 3. ⚠️ Gài: `protected` truy cập được từ đâu khi **khác package**? (qua subclass nhưng quy tắc cụ thể).
- **Trả lời**: `protected` cho phép truy cập từ:
    - Tất cả class trong cùng package.
    - Các lớp con (subclass) ở **khác package**, nhưng **chỉ qua instance của lớp con hoặc chính nó**, không qua instance của lớp cha.
- **Ví dụ**:
  ```java
  package p1;
  public class Parent {
      protected int x = 10;
  }
  package p2;
  class Child extends p1.Parent {
      void test(Child c, Parent p) {
          System.out.println(c.x); // OK
          System.out.println(p.x); // Lỗi biên dịch
      }
  }
  ```

### 4. Inner class, static nested class, local class, anonymous class — khác nhau và use-case.
- **Trả lời**:
    - **Inner class**: Lớp non-static trong lớp khác, có tham chiếu ngầm đến instance của lớp bao ngoài. Dùng khi cần truy cập trạng thái của lớp bao ngoài (ví dụ: `Iterator` trong `List`).
    - **Static nested class**: Lớp static trong lớp khác, không giữ tham chiếu đến instance bao ngoài. Dùng khi không cần liên kết với instance (ví dụ: `Map.Entry`).
    - **Local class**: Lớp định nghĩa trong method, chỉ tồn tại trong phạm vi method. Dùng cho logic tạm thời.
    - **Anonymous class**: Lớp không tên, thường dùng để implement interface hoặc override method một lần (ví dụ: `new Runnable() {...}`).
- **Use-case**: Inner/anonymous cho sự kiện GUI; static nested cho tổ chức logic độc lập; local class cho logic tạm.

### 5. Ảnh hưởng của **shadowing/hiding** tên biến/field trong inner class.
- **Trả lời**:
    - **Shadowing**: Biến trong inner class che khuất biến cùng tên trong lớp bao ngoài. Dùng `OuterClass.this.field` để truy cập field của lớp ngoài.
    - **Hiding**: Field hoặc method static trong inner class che khuất static member của lớp ngoài.
    - **Ví dụ**:
      ```java
      class Outer {
          int x = 10;
          class Inner {
              int x = 20;
              void print() { System.out.println(Outer.this.x); } // In 10
          }
      }
      ```

---

## 4) equals, hashCode, toString, clone & bất biến

### 1. Hợp đồng (contract) của `equals()` và `hashCode()`; liên hệ với cấu trúc dữ liệu băm.
- **Trả lời**:
    - **Hợp đồng `equals()`**:
        - **Reflexive**: `x.equals(x) == true`.
        - **Symmetric**: `x.equals(y) == y.equals(x)`.
        - **Transitive**: Nếu `x.equals(y)` và `y.equals(z)`, thì `x.equals(z)`.
        - **Consistent**: `x.equals(y)` không đổi trừ khi trạng thái thay đổi.
        - **Null**: `x.equals(null) == false`.
    - **Hợp đồng `hashCode()`**:
        - Nếu `x.equals(y)`, thì `x.hashCode() == y.hashCode()`.
        - Hash code phải nhất quán trong suốt vòng đời nếu trạng thái không đổi.
    - **Liên hệ**: Trong `HashMap`, `HashSet`, hash code xác định bucket, `equals()` xác định đối tượng cụ thể. Vi phạm hợp đồng gây lỗi (mất dữ liệu, tìm kiếm sai).

### 2. Thiết kế `equals()` cho entity có id sinh sau (late-assigned) — rủi ro gì?
- **Trả lời**:
    - **Rủi ro**: Nếu `id` chưa gán (null hoặc 0), `equals()` có thể trả về kết quả không nhất quán khi `id` được gán sau (phá vỡ hợp đồng consistent).
    - **Cách thiết kế**:
        - Chỉ dùng `id` trong `equals()` nếu đảm bảo `id` luôn được gán trước khi so sánh.
        - Nếu `id` có thể null, kết hợp các field khác hoặc đánh dấu trạng thái (chưa persist).
        - Ví dụ:
          ```java
          class User {
              private Long id;
              private String name;
              @Override
              public boolean equals(Object o) {
                  if (this == o) return true;
                  if (!(o instanceof User)) return false;
                  User other = (User) o;
                  return Objects.equals(id, other.id) && Objects.equals(name, other.name);
              }
          }
          ```

### 3. Viết `toString()` hữu ích: nên/không nên in thông tin gì (bảo mật, PII).
- **Trả lời**:
    - **Nên**: In các field quan trọng để debug (ví dụ: `id`, `name`, trạng thái chính).
    - **Không nên**: In thông tin nhạy cảm (PII như mật khẩu, SSN, thông tin thẻ tín dụng).
    - **Ví dụ**:
      ```java
      class User {
          private Long id;
          private String name;
          private String password; // PII
          @Override
          public String toString() {
              return "User{id=" + id + ", name='" + name + "'}";
          }
      }
      ```

### 4. `clone()` & `Cloneable`: deep vs shallow clone; tại sao thường khuyến nghị **tránh** clone?
- **Trả lời**:
    - **Shallow clone**: Sao chép tham chiếu, không sao chép đối tượng được tham chiếu (dùng `super.clone()` mặc định).
    - **Deep clone**: Sao chép cả đối tượng được tham chiếu (phải tự implement).
    - **Khuyến nghị tránh**:
        - Dễ gây lỗi nếu không xử lý deep clone đúng.
        - Phức tạp khi đối tượng có cấu trúc lồng nhau.
        - Thay thế bằng **copy constructor** hoặc **factory method** an toàn hơn.
    - **Ví dụ deep clone**:
      ```java
      class MyClass implements Cloneable {
          private List<String> list;
          @Override
          public MyClass clone() throws CloneNotSupportedException {
              MyClass clone = (MyClass) super.clone();
              clone.list = new ArrayList<>(this.list);
              return clone;
          }
      }
      ```

### 5. ⚠️ Gài: Hai object `equal` có bắt buộc `==` trả true không? Và ngược lại?
- **Trả lời**:
    - **Hai object `equals()` không bắt buộc `==` trả true**: `equals()` so sánh nội dung, `==` so sánh tham chiếu. Ví dụ: `new String("a").equals(new String("a"))` là `true`, nhưng `==` là `false`.
    - **Ngược lại**: Nếu `==` trả `true` (cùng tham chiếu), thì `equals()` **phải trả true** (theo hợp đồng reflexive).
    - **Lưu ý**: Vi phạm hợp đồng `equals()` có thể gây lỗi logic.

### 6. Nguyên tắc xây dựng **immutable class** (final, defensive copy, không expose mutable internals).
- **Trả lời**:
    - **Nguyên tắc**:
        1. Đánh dấu lớp `final` để ngăn kế thừa.
        2. Tất cả field là `private final`.
        3. Không cung cấp setter, chỉ có getter trả về bản sao (defensive copy) nếu field là mutable.
        4. Constructor hoặc factory method thực hiện defensive copy cho tham số.
        5. Đảm bảo `equals()`, `hashCode()`, `toString()` không thay đổi trạng thái.
    - **Ví dụ**:
      ```java
      final class Immutable {
          private final List<String> items;
          public Immutable(List<String> items) {
              this.items = new ArrayList<>(items); // Defensive copy
          }
          public List<String> getItems() {
              return Collections.unmodifiableList(items);
          }
      }
      ```

---

## 5) Overloading vs Overriding & đa hình (polymorphism)

### 1. Overloading khác Overriding thế nào về thời điểm chọn phương thức (compile-time vs run-time)?
- **Trả lời**:
    - **Overloading**: Nhiều method cùng tên, khác tham số (số lượng/kiểu). Trình biên dịch chọn method dựa trên kiểu tham số tại **compile-time** (static binding).
    - **Overriding**: Ghi đè method của lớp cha trong lớp con, cùng chữ ký. JVM chọn method dựa trên kiểu thực tế của đối tượng tại **run-time** (dynamic binding).

### 2. **Dynamic dispatch** hoạt động ra sao khi gọi method qua tham chiếu kiểu cha.
- **Trả lời**:
    - **Dynamic dispatch**: JVM xác định kiểu thực tế của đối tượng tại run-time và gọi method override của lớp con, không phải lớp cha.
    - **Ví dụ**:
      ```java
      class Parent { void show() { System.out.println("Parent"); } }
      class Child extends Parent { @Override void show() { System.out.println("Child"); } }
      Parent p = new Child();
      p.show(); // In "Child"
      ```

### 3. Covariant return type là gì? Quy tắc khi override.
- **Trả lời**:
    - **Covariant return type**: Khi override, method con có thể trả về kiểu là **subclass** của kiểu trả về của method cha (từ Java 5).
    - **Quy tắc**: Kiểu trả về của method con phải là subtype của kiểu trả về của method cha.
    - **Ví dụ**:
      ```java
      class Parent { Parent get() { return this; } }
      class Child extends Parent { @Override Child get() { return this; } }
      ```

### 4. Quy tắc khi override method ném checked exceptions: “mở rộng” hay “thu hẹp” được?
- **Trả lời**:
    - **Quy tắc**: Method override chỉ được ném **các checked exception là con** của exception trong method cha hoặc **ít hơn** (thu hẹp). Không được ném exception mới hoặc rộng hơn.
    - **Ví dụ**:
      ```java
      class Parent {
          void method() throws IOException {}
      }
      class Child extends Parent {
          @Override
          void method() throws FileNotFoundException {} // OK, FileNotFoundException là con của IOException
      }
      ```

### 5. ⚠️ Gài: Overload theo **boxed vs primitive** và **varargs** — trình tự phân giải (resolution) ưu tiên.
- **Trả lời**:
    - Trình biên dịch ưu tiên chọn method overload theo thứ tự:
        1. **Exact match**: Kiểu tham số khớp chính xác.
        2. **Widening primitive conversion** (ví dụ: `int` → `long`).
        3. **Boxing conversion** (ví dụ: `int` → `Integer`).
        4. **Varargs**: Nếu không tìm thấy phương thức phù hợp trước, chọn varargs.
    - **Ví dụ**:
      ```java
      class Test {
          void m(int x) { System.out.println("int"); }
          void m(Integer x) { System.out.println("Integer"); }
          void m(int... x) { System.out.println("varargs"); }
      }
      Test t = new Test();
      t.m(5); // In "int" (exact match)
      ```

---

## 6) Abstract classes vs Interfaces

### 1. Khi nào chọn abstract class, khi nào chọn interface? Nêu tiêu chí thiết kế.
- **Trả lời**:
    - **Abstract class**:
        - Khi cần chia sẻ **mã nguồn chung** (field, method triển khai).
        - Dùng cho các lớp có quan hệ **is-a** chặt chẽ (ví dụ: `Vehicle` → `Car`).
    - **Interface**:
        - Khi cần định nghĩa **hợp đồng hành vi** mà không quan tâm triển khai.
        - Hỗ trợ **multiple inheritance**, phù hợp với các quan hệ linh hoạt (ví dụ: `Comparable`, `Serializable`).
    - **Tiêu chí**: Chọn interface cho tính linh hoạt, abstract class cho trạng thái và hành vi chung.

### 2. Interface có thể chứa gì từ Java 8+ (default, static methods; từ Java 9 có private methods).
- **Trả lời**:
    - Từ **Java 8**:
        - **Default methods**: Cung cấp triển khai mặc định, cho phép mở rộng interface mà không phá vỡ code cũ.
        - **Static methods**: Thuộc về interface, dùng cho utility functions.
    - Từ **Java 9**:
        - **Private methods**: Hỗ trợ chia sẻ logic trong default methods mà không expose ra ngoài.
    - **Ví dụ**:
      ```java
      interface MyInterface {
          default void doSomething() { doPrivate(); }
          static void utility() { System.out.println("Static"); }
          private void doPrivate() { System.out.println("Private"); }
      }
      ```

### 3. ⚠️ Gài: “Interface không có state.” — Nhận định này sai ở đâu (hằng số static final, field public static final).
- **Trả lời**:
    - Nhận định **sai** vì interface có thể chứa **hằng số** (`public static final` field), được coi là state của interface.
    - **Ví dụ**:
      ```java
      interface MyInterface {
          int CONSTANT = 42; // public static final ngầm định
      }
      ```
    - Tuy nhiên, đây là state tĩnh, không phải instance state như trong class.

### 4. Multiple inheritance qua **default methods**: xung đột kim cương giải quyết bằng quy tắc nào?
- **Trả lời**:
    - **Vấn đề kim cương**: Xảy ra khi class implement hai interface có default method cùng tên.
    - **Quy tắc giải quyết**:
        1. Nếu một class override method, bản override được ưu tiên.
        2. Nếu không, default method từ interface **cụ thể hơn** (theo quan hệ kế thừa) được chọn.
        3. Nếu không giải quyết được, phải override tường minh trong class.
    - **Ví dụ**:
      ```java
      interface A { default void m() { System.out.println("A"); } }
      interface B { default void m() { System.out.println("B"); } }
      class C implements A, B {
          @Override public void m() { A.super.m(); } // Chọn A
      }
      ```

### 5. Marker interface (vd: `Serializable`) có ý nghĩa gì; khác annotation ở chỗ nào?
- **Trả lời**:
    - **Marker interface**: Interface rỗng (không có method), dùng để đánh dấu class có khả năng đặc biệt (ví dụ: `Serializable` cho phép serialization).
    - **Khác annotation**:
        - Marker interface được kiểm tra tại **compile-time/run-time** qua `instanceof`, trong khi annotation chỉ cung cấp metadata, xử lý qua reflection.
        - Interface hỗ trợ kế thừa, annotation không.
    - **Use-case**: `Serializable`, `Cloneable` đánh dấu hành vi đặc biệt cho JVM.

---

## 7) Packages & tổ chức mã nguồn

### 1. Mục đích của **package** (tổ chức, tránh va chạm tên, kiểm soát truy cập).
- **Trả lời**:
    - **Tổ chức**: Nhóm các class liên quan, cải thiện cấu trúc mã nguồn.
    - **Tránh va chạm tên**: Đảm bảo tên class duy nhất trong không gian tên (namespace).
    - **Kiểm soát truy cập**: Hỗ trợ `default` (package-private) để giới hạn truy cập trong gói.

### 2. Quy tắc đặt tên package (lowercase, domain đảo ngược). Vì sao **subpackage** không thừa kế quyền truy cập của package cha?
- **Trả lời**:
    - **Quy tắc đặt tên**: Dùng chữ thường, đảo ngược tên miền (ví dụ: `com.example.myapp`).
    - **Subpackage không thừa kế quyền truy cập**: Package trong Java là **không gian tên độc lập**, không có quan hệ cha-con. `com.example` và `com.example.sub` là hai package riêng biệt, không chia sẻ quyền `default`.

### 3. `import` có nạp class không? Sự khác nhau `import a.*` vs import tường minh.
- **Trả lời**:
    - **`import` không nạp class**: Chỉ khai báo tên rút gọn để tham chiếu, class được nạp khi sử dụng (bởi class loader).
    - **`import a.*`**: Nhập tất cả class trong package `a`, nhưng không nhập subpackage.
    - **Import tường minh** (`import a.MyClass`): Nhập cụ thể một class, rõ ràng hơn, tránh nhầm lẫn tên.

### 4. ⚠️ Gài: Hai class **cùng tên** khác package được import đồng thời — tham chiếu tên rút gọn sẽ trỏ tới đâu?
- **Trả lời**:
    - Nếu import hai class cùng tên từ khác package (ví dụ: `import a.MyClass; import b.MyClass;`), dùng tên rút gọn (`MyClass`) sẽ **gây lỗi biên dịch** do nhập nhằng.
    - **Giải pháp**: Dùng **fully qualified class name** (FQCN) như `a.MyClass` hoặc chỉ import một class.
    - **Ví dụ**:
      ```java
      import a.MyClass;
      import b.MyClass; // Lỗi nếu dùng MyClass trực tiếp
      a.MyClass obj = new a.MyClass(); // OK
      ```

### 5. Ảnh hưởng của package tới **serialization** và **reflection** (tên đủ định danh FQCN).
- **Trả lời**:
    - **Serialization**: Package là một phần của FQCN (`com.example.MyClass`), dùng để xác định class khi deserialize. Sai package gây lỗi `ClassNotFoundException`.
    - **Reflection**: FQCN cần để lấy `Class` object (`Class.forName("com.example.MyClass")`). Package ảnh hưởng đến phạm vi truy cập (ví dụ: `default` chỉ trong package).

---

## 8) Kế thừa (Inheritance) — chi tiết

### 1. Hiding field vs overriding method — khác nhau và vì sao hiding dễ gây nhầm.
- **Trả lời**:
    - **Hiding field**: Field trong lớp con che khuất field cùng tên trong lớp cha. Truy cập phụ thuộc vào kiểu tham chiếu, không phải kiểu thực tế.
    - **Overriding method**: Method trong lớp con ghi đè method cha, gọi dựa trên kiểu thực tế (dynamic dispatch).
    - **Vì sao hiding dễ gây nhầm**: Truy cập field qua tham chiếu kiểu cha có thể trả về giá trị khác với kiểu con, gây nhầm lẫn.
    - **Ví dụ**:
      ```java
      class Parent { int x = 10; }
      class Child extends Parent { int x = 20; }
      Parent p = new Child();
      System.out.println(p.x); // In 10 (hiding), không phải 20
      ```

### 2. `final` trên class và method: khi nào dùng để khóa hành vi; bất lợi tiềm ẩn.
- **Trả lời**:
    - **Trên class**: Ngăn kế thừa (ví dụ: `String`). Dùng khi muốn đảm bảo lớp không bị sửa đổi hành vi.
    - **Trên method**: Ngăn override (ví dụ: methods trong `String`). Dùng để bảo vệ logic cốt lõi.
    - **Bất lợi**:
        - Giảm tính linh hoạt, khó mở rộng trong tương lai.
        - Có thể buộc dùng composition thay vì kế thừa.

### 3. Gọi `super.method()` trong override để mở rộng thay vì thay thế hoàn toàn: tiêu chí và cạm bẫy.
- **Trả lời**:
    - **Tiêu chí**: Gọi `super.method()` khi muốn giữ logic của lớp cha và bổ sung logic con.
    - **Cạm bẫy**:
        - Nếu method cha phụ thuộc vào trạng thái chưa khởi tạo, có thể gây lỗi.
        - Phải đảm bảo hợp đồng method không bị phá vỡ.
    - **Ví dụ**:
      ```java
      class Parent { void process() { System.out.println("Parent"); } }
      class Child extends Parent {
          @Override void process() {
              super.process(); // Gọi cha
              System.out.println("Child");
          }
      }
      ```

### 4. ⚠️ Gài: Static method có **override** được không? Sự thật về **method hiding** với static.
- **Trả lời**:
    - **Static method không thể override**, chỉ có thể **hide** (che khuất) trong lớp con.
    - **Method hiding**: Static method trong lớp con che khuất static method cùng tên trong lớp cha. Gọi dựa trên kiểu tham chiếu, không phải kiểu thực tế.
    - **Ví dụ**:
      ```java
      class Parent { static void m() { System.out.println("Parent"); } }
      class Child extends Parent { static void m() { System.out.println("Child"); } }
      Parent p = new Child();
      p.m(); // In "Parent" (hiding, không phải override)
      ```

### 5. Composition over inheritance: khi nào nên **thay thế** kế thừa bằng ủy quyền (delegation).
- **Trả lời**:
    - **Khi nào dùng composition**:
        - Quan hệ **has-a** thay vì **is-a** (ví dụ: `Car` có `Engine`, không phải `Car` là `Engine`).
        - Cần kiểm soát chặt chẽ hành vi hoặc tránh kế thừa phức tạp.
        - Muốn tái sử dụng mã nguồn mà không bị ràng buộc bởi lớp cha.
    - **Ví dụ**:
      ```java
      class Engine { void start() { System.out.println("Engine started"); } }
      class Car {
          private Engine engine = new Engine();
          void start() { engine.start(); } // Ủy quyền
      }
      ```

---

## 9) Generics & kế thừa

### 1. Tính **invariance** của generics: vì sao `List<Object>` không nhận `List<String>`?
- **Trả lời**:
    - Generics trong Java là **invariant**, nghĩa là `List<String>` không phải là subtype của `List<Object>` dù `String` là subtype của `Object`.
    - **Lý do**: Đảm bảo type safety. Nếu cho phép, có thể thêm `Integer` vào `List<String>` qua `List<Object>`, gây lỗi runtime.
    - **Ví dụ**:
      ```java
      List<String> strings = new ArrayList<>();
      List<Object> objects = strings; // Lỗi biên dịch
      objects.add(42); // Nguy cơ phá vỡ type safety
      ```

### 2. Wildcards: `? extends T` vs `? super T` (PECS) — áp dụng trong API collections.
- **Trả lời**:
    - **PECS**: Producer Extends, Consumer Super.
    - **`? extends T`**: Chỉ đọc (producer), chấp nhận các collection của `T` hoặc subtype. Dùng khi lấy dữ liệu (ví dụ: `List<? extends Number>`).
    - **`? super T`**: Chỉ ghi (consumer), chấp nhận collection của `T` hoặc supertype. Dùng khi thêm dữ liệu (ví dụ: `List<? super Integer>`).
    - **Ví dụ**:
      ```java
      List<? extends Number> readOnly = new ArrayList<Integer>();
      Number n = readOnly.get(0); // OK
      // readOnly.add(42); // Lỗi, không ghi được
      List<? super Integer> writeOnly = new ArrayList<Number>();
      writeOnly.add(42); // OK
      ```

### 3. ⚠️ Gài: Bridge methods là gì? Vì sao xuất hiện khi override method generic.
- **Trả lời**:
    - **Bridge methods**: Là method tự động sinh bởi trình biên dịch để hỗ trợ generic type erasure khi override method generic.
    - **Lý do xuất hiện**: Sau type erasure, chữ ký method có thể khác nhau giữa lớp cha và con, bridge method đảm bảo tính tương thích.
    - **Ví dụ**:
      ```java
      class Parent<T> { void set(T t) {} }
      class Child extends Parent<String> {
          @Override void set(String s) {}
      }
      // Bridge method sinh ra: void set(Object o) { set((String) o); }
      ```

### 4. Type erasure ảnh hưởng gì đến overload/override và phản chiếu (reflection).
- **Trả lời**:
    - **Type erasure**: Generic types bị xóa tại runtime, thay bằng raw type hoặc bound (thường là `Object`).
    - **Ảnh hưởng**:
        - **Overload**: Không thể overload chỉ dựa vào generic type khác nhau (ví dụ: `m(List<String>)` và `m(List<Integer>)` gây lỗi biên dịch).
        - **Override**: Bridge methods được sinh để đảm bảo tương thích.
        - **Reflection**: Không lấy được thông tin generic type tại runtime, trừ khi dùng `ParameterizedType` trong metadata (ví dụ: field hoặc method signature).

---

## 10) Giao diện đặc biệt & tính năng hiện đại (tuỳ lớp Java)

### 1. `record` (Java 16+) — có kế thừa class khác được không? Có thể implement interface không?
- **Trả lời**:
    - **`record`**: Là lớp bất biến, ngắn gọn để lưu trữ dữ liệu (tự động sinh constructor, getter, `equals()`, `hashCode()`, `toString()`).
    - **Kế thừa class**: Không thể extend class khác (ngầm định extend `java.lang.Record`).
    - **Implement interface**: Có thể implement interface.
    - **Ví dụ**:
      ```java
      record Point(int x, int y) implements Comparable<Point> {
          @Override
          public int compareTo(Point other) { return Integer.compare(x, other.x); }
      }
      ```

### 2. `sealed` classes/interfaces (Java 17+): mục đích, cú pháp `permits`, ảnh hưởng thiết kế kế thừa.
- **Trả lời**:
    - **Mục đích**: Giới hạn các lớp/interface được phép kế thừa/implement, tăng kiểm soát và bảo mật thiết kế.
    - **Cú pháp `permits`**: Chỉ định danh sách lớp con cụ thể (ví dụ: `sealed class Shape permits Circle, Rectangle`).
    - **Ảnh hưởng**: Đảm bảo hierarchy rõ ràng, dễ kiểm tra switch expression/pattern matching.
    - **Ví dụ**:
      ```java
      sealed interface Shape permits Circle, Rectangle {}
      final class Circle implements Shape {}
      final class Rectangle implements Shape {}
      ```

### 3. ⚠️ Gài: Dùng `sealed` để mô hình **closed hierarchy** khác gì pattern “enum pattern” trước đây?
- **Trả lời**:
    - **Sealed class**:
        - Linh hoạt hơn, cho phép định nghĩa lớp con với trạng thái và hành vi riêng.
        - Hỗ trợ pattern matching trong switch expression.
        - Dùng `permits` để kiểm soát kế thừa.
    - **Enum pattern**:
        - Chỉ dùng `enum` với các instance cố định, không thể thêm trạng thái hoặc hành vi phức tạp.
        - Ít linh hoạt hơn, phù hợp với tập hợp giá trị cố định.
    - **Khác biệt**: Sealed class cho phép hierarchy mở rộng hơn, dễ bảo trì hơn trong thiết kế phức tạp.

---

## 11) Ngoại lệ & kế thừa

### 1. Checked vs unchecked exceptions — quy tắc khi **override** method có throws.
- **Trả lời**:
    - **Checked exceptions**: Kế thừa từ `Exception` (trừ `RuntimeException`), phải khai báo hoặc xử lý.
    - **Unchecked exceptions**: Kế thừa từ `RuntimeException`, không bắt buộc khai báo.
    - **Quy tắc override**:
        - Method con chỉ được ném **checked exceptions là con** của exception trong method cha hoặc **ít hơn**.
        - Unchecked exceptions không bị ràng buộc.

### 2. Tổ chức hierarchy exception domain-specific; lợi ích khi bắt ở mức cha.
- **Trả lời**:
    - **Hierarchy domain-specific**: Tạo các lớp exception tùy chỉnh (ví dụ: `OrderNotFoundException` extends `BusinessException`) để mô tả lỗi cụ thể trong domain.
    - **Lợi ích bắt ở mức cha**:
        - Đơn giản hóa xử lý lỗi chung (ví dụ: bắt `BusinessException` thay vì từng loại con).
        - Tăng tính tái sử dụng và dễ bảo trì.
    - **Ví dụ**:
      ```java
      class BusinessException extends Exception {}
      class OrderNotFoundException extends BusinessException {}
      try { ... } catch (BusinessException e) { // Xử lý chung }
      ```

### 3. ⚠️ Gài: Bắt `Exception` hoặc `Throwable` ở tầng dưới có thể phá vỡ hợp đồng override như thế nào?
- **Trả lời**:
    - Bắt `Exception` hoặc `Throwable` ở tầng dưới có thể **che giấu lỗi nghiêm trọng** (như `OutOfMemoryError`) hoặc **phá vỡ hợp đồng** của method override (nếu method cha không khai báo ném exception đó).
    - **Ví dụ**:
      ```java
      class Parent { void m() {} }
      class Child extends Parent {
          @Override void m() {
              try { ... } catch (Exception e) { // Che giấu lỗi không mong muốn
                  throw new RuntimeException(e);
              }
          }
      }
      ```
    - **Khuyến nghị**: Chỉ bắt các exception cụ thể liên quan đến logic.

---

## 12) Mini case (thực chiến — 2–5 phút/câu)

### 1. Một class `Money` cần bất biến: thiết kế field, constructor, defensive copy, equals/hashCode, toString.
- **Trả lời**:
  ```java
  import java.math.BigDecimal;
  import java.util.Objects;

  public final class Money {
      private final BigDecimal amount;
      private final String currency;

      public Money(BigDecimal amount, String currency) {
          this.amount = amount != null ? new BigDecimal(amount.toString()) : BigDecimal.ZERO; // Defensive copy
          this.currency = currency != null ? currency : "USD";
      }

      public BigDecimal getAmount() { return new BigDecimal(amount.toString()); }
      public String getCurrency() { return currency; }

      @Override
      public boolean equals(Object o) {
          if (this == o) return true;
          if (!(o instanceof Money)) return false;
          Money other = (Money) o;
          return amount.compareTo(other.amount) == 0 && Objects.equals(currency, other.currency);
      }

      @Override
      public int hashCode() { return Objects.hash(amount, currency); }

      @Override
      public String toString() { return currency + " " + amount; }
  }
  ```

### 2. Giải quyết xung đột default methods: interface `A.log()`, `B.log()` và class `C implements A,B`. Chỉ ra cách chọn triển khai.
- **Trả lời**:
  ```java
  interface A { default void log() { System.out.println("A"); } }
  interface B { default void log() { System.out.println("B"); } }
  class C implements A, B {
      @Override
      public void log() {
          A.super.log(); // Chọn A
          // Hoặc B.super.log(); hoặc tự triển khai
      }
  }
  ```

### 3. Thay thế kế thừa `class Stack extends Vector` bằng composition: phác thảo API và ủy quyền cần thiết.
- **Trả lời**:
  ```java
  class Stack<T> {
      private final List<T> list = new ArrayList<>();
      public void push(T item) { list.add(item); }
      public T pop() { return list.remove(list.size() - 1); }
      public boolean isEmpty() { return list.isEmpty(); }
  }
  ```
    - **Lý do**: Composition tránh kế thừa không cần thiết từ `Vector`, kiểm soát API chặt chẽ hơn.

### 4. Thiết kế `User` entity có id gán sau (persist mới có id): viết equals/hashCode an toàn theo giai đoạn vòng đời.
- **Trả lời**:
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
      public int hashCode() {
          return id != null ? id.hashCode() : Objects.hash(name);
      }
  }
  ```

### 5. Hai lớp `Parent` có method `f()` và `Child` override `f()` ném ít checked exceptions hơn: minh họa chữ ký hợp lệ.
- **Trả lời**:
  ```java
  class Parent {
      void f() throws IOException {}
  }
  class Child extends Parent {
      @Override
      void f() throws FileNotFoundException {} // Thu hẹp exception
  }
  ```

### 6. Hai class trùng tên khác package được dùng chung file: trình bày cách `import`/FQCN để tránh nhập nhằng.
- **Trả lời**:
  ```java
  import com.example.a.MyClass; // Import một class
  // Hoặc dùng FQCN
  com.example.b.MyClass b = new com.example.b.MyClass();
  MyClass a = new MyClass(); // Dùng class từ import
  ```