## 1) Khái niệm & Tổng quan

### 1. Method Handle là gì? Khác gì với Reflection (`Method`/`Field`) trong Java?
**Method Handle** là một cơ chế trong Java (gói `java.lang.invoke`) cho phép gọi method, truy cập field, hoặc constructor một cách **động** (dynamic) tại runtime với hiệu năng cao hơn so với Reflection. Nó là một tham chiếu trực tiếp đến một method/field/constructor trong JVM, được thiết kế để tận dụng tối ưu hóa của JIT compiler.

**Khác biệt với Reflection**:
- **Hiệu năng**:
    - Method Handle nhanh hơn sau lần gọi đầu, nhờ JIT inline và không phải tra cứu metadata lặp lại.
    - Reflection chậm hơn do tra cứu metadata (field/method) và kiểm tra quyền truy cập tại runtime.
- **API**:
    - Method Handle sử dụng `MethodHandles.Lookup` và `MethodType` để tìm và gọi method/field.
    - Reflection sử dụng `Class`, `Method`, `Field`, `Constructor` từ gói `java.lang.reflect`.
- **Type safety**:
    - Method Handle yêu cầu `MethodType` khớp chính xác khi dùng `invokeExact()`.
    - Reflection cho phép gọi linh hoạt hơn nhưng dễ gây lỗi runtime (như `IllegalArgumentException`).
- **Mục đích**:
    - Method Handle được thiết kế cho các trường hợp cần hiệu năng cao (như framework, serialization).
    - Reflection phổ biến trong các framework như Spring/Hibernate, nhưng chậm hơn.

**Ví dụ**:
```java
// Reflection
Method method = String.class.getMethod("substring", int.class, int.class);
String result = (String) method.invoke("hello", 1, 4); // Chậm

// Method Handle
MethodHandle mh = MethodHandles.lookup().findVirtual(String.class, "substring", MethodType.methodType(String.class, int.class, int.class));
result = (String) mh.invokeExact("hello", 1, 4); // Nhanh hơn
```

---

### 2. Ưu điểm của Method Handle về hiệu năng so với Reflection.
- **JIT optimization**: Method Handle được JVM tối ưu hóa qua JIT compiler, cho phép inline code sau lần gọi đầu, gần với hiệu năng của method call trực tiếp.
- **Không tra cứu lặp lại**: Sau khi tạo, Method Handle là tham chiếu trực tiếp đến method/field, không cần tra cứu metadata như Reflection.
- **Kiểm tra quyền truy cập sớm**: Quyền truy cập được kiểm tra khi tạo Method Handle (bởi `MethodHandles.Lookup`), không lặp lại khi gọi.
- **Type safety**: `invokeExact()` yêu cầu kiểu khớp chính xác, giảm overhead kiểm tra kiểu runtime.
- **Hỗ trợ invokedynamic**: Method Handle tích hợp với `invokedynamic` bytecode, cho phép JVM tối ưu hóa lời gọi động.

**So sánh**:
- Reflection: Mỗi lần gọi `invoke()` kiểm tra quyền truy cập và kiểu, gây overhead.
- Method Handle: Sau lần đầu, gọi `invokeExact()` gần như tương đương method call trực tiếp.

---

### 3. ⚠️ Gài: Method Handle được giới thiệu từ Java phiên bản nào và lý do ra đời?
- **Phiên bản**: Method Handle được giới thiệu từ **Java 7** (gói `java.lang.invoke`).
- **Lý do ra đời**:
    - Hỗ trợ **invokedynamic** bytecode (cũng ra đời ở Java 7) để phục vụ các ngôn ngữ động (như JRuby, Groovy) chạy trên JVM.
    - Cung cấp cơ chế gọi method/field động với **hiệu năng cao** hơn Reflection, phù hợp cho framework và thư viện serialization.
    - Giảm phụ thuộc vào Reflection, vốn chậm và phức tạp, đồng thời cung cấp API linh hoạt hơn cho các trường hợp dynamic dispatch.

**Mục tiêu chính**: Tăng hiệu năng và hỗ trợ các tính năng ngôn ngữ động trên JVM.

---

### 4. So sánh Method Handle với **lambda expressions** và **functional interfaces** về mục tiêu sử dụng.
- **Method Handle**:
    - **Mục tiêu**: Cung cấp cơ chế gọi method/field/constructor động tại runtime với hiệu năng cao.
    - **Sử dụng**: Framework (serialization, DI), dynamic proxy, hoặc khi cần truy cập private member mà không dùng Reflection.
    - **Đặc điểm**: Linh hoạt, nhưng API phức tạp, cần quản lý `MethodType` và `Lookup`.
- **Lambda Expressions**:
    - **Mục tiêu**: Cung cấp cú pháp ngắn gọn để biểu diễn hành vi (behavior) dưới dạng functional interface.
    - **Sử dụng**: Thay thế anonymous class, xử lý stream API, hoặc lập trình functional.
    - **Đặc điểm**: Dễ dùng, type-safe tại compile-time, được chuyển thành `invokedynamic` tại runtime.
- **Functional Interfaces**:
    - **Mục tiêu**: Định nghĩa contract cho lambda hoặc method reference.
    - **Sử dụng**: Là nền tảng cho lambda (như `Function`, `Supplier`, `Consumer`).
    - **Đặc điểm**: Đơn giản, chỉ cần một abstract method, tích hợp tốt với Stream API.

**So sánh**:
- Method Handle: Linh hoạt hơn, nhưng phức tạp, dùng cho trường hợp cần điều khiển runtime cấp thấp.
- Lambda/Functional Interface: Dễ dùng, type-safe, phù hợp cho code ứng dụng thông thường.

---

### 5. Method Handle thuộc package nào? (`java.lang.invoke`).
Method Handle thuộc gói **`java.lang.invoke`**, bao gồm các class chính:
- `MethodHandle`: Tham chiếu đến method/field/constructor.
- `MethodHandles`: Factory class cung cấp các phương thức để tạo và thao tác Method Handle.
- `MethodHandles.Lookup`: Đối tượng kiểm soát quyền truy cập để tìm method/field.
- `MethodType`: Đại diện cho kiểu tham số và kiểu trả về của Method Handle.

---

### 6. Liên hệ Method Handle với JVM invokedynamic bytecode instruction.
- **`invokedynamic`** là một bytecode mới trong Java 7, được thiết kế để hỗ trợ gọi method động (dynamic method invocation) trên JVM.
- **Liên hệ với Method Handle**:
    - Method Handle là cơ chế cấp cao để triển khai `invokedynamic` trong Java.
    - `invokedynamic` sử dụng Method Handle để xác định method thực tế sẽ gọi tại runtime, thay vì cố định tại compile-time như `invokevirtual` hoặc `invokestatic`.
    - Method Handle cung cấp tham chiếu trực tiếp đến method, được JVM dùng để thực thi `invokedynamic` với hiệu năng cao.
- **Ứng dụng**: Lambda expressions và method references trong Java 8 được biên dịch thành `invokedynamic` sử dụng Method Handle, giúp tối ưu hóa hiệu năng.

**Ví dụ**: Lambda `x -> System.out.println(x)` được biên dịch thành `invokedynamic` trỏ tới Method Handle của `System.out::println`.

---

## 2) `MethodHandles.Lookup`

### 1. Vai trò của `MethodHandles.Lookup` trong việc tạo Method Handle.
`MethodHandles.Lookup` là một **factory** để tạo Method Handle, chịu trách nhiệm:
- Tìm method, field, hoặc constructor dựa trên tên và `MethodType`.
- Kiểm tra quyền truy cập (access control) của method/field/constructor.
- Quyết định phạm vi truy cập (public, private, protected) dựa trên ngữ cảnh của class gọi.

**Ví dụ**:
```java
MethodHandles.Lookup lookup = MethodHandles.lookup();
MethodHandle mh = lookup.findVirtual(String.class, "substring", MethodType.methodType(String.class, int.class, int.class));
```

---

### 2. Cách lấy đối tượng `Lookup` mặc định (`MethodHandles.lookup()`).
Gọi `MethodHandles.lookup()` để lấy đối tượng `Lookup` mặc định:
```java
MethodHandles.Lookup lookup = MethodHandles.lookup();
```
- **Lookup mặc định** có quyền truy cập tương đương với class gọi nó.
- Quyền truy cập bao gồm tất cả member (public, private, protected) trong class hiện tại, nhưng chỉ public member của class khác.

---

### 3. ⚠️ Gài: Sự khác nhau giữa `lookup()`, `publicLookup()` và `privateLookupIn()` về quyền truy cập.
- **`MethodHandles.lookup()`**:
    - Tạo `Lookup` với quyền truy cập của class gọi (caller class).
    - Có thể truy cập private/protected member của class hiện tại và public member của class khác.
- **`MethodHandles.publicLookup()`**:
    - Tạo `Lookup` chỉ có quyền truy cập **public** member của bất kỳ class nào.
    - Không thể truy cập private/protected member, ngay cả trong class hiện tại.
- **`MethodHandles.privateLookupIn(Class, Lookup)`**:
    - Tạo `Lookup` với quyền truy cập đầy đủ (bao gồm private) vào member của class được chỉ định.
    - Yêu cầu class gọi phải có quyền truy cập vào class đích (qua module system hoặc `setAccessible(true)`).

**Ví dụ**:
```java
MethodHandles.Lookup lookup = MethodHandles.lookup(); // Full access trong class hiện tại
MethodHandles.Lookup publicLookup = MethodHandles.publicLookup(); // Chỉ public
MethodHandles.Lookup privateLookup = MethodHandles.privateLookupIn(TargetClass.class, lookup); // Full access vào TargetClass
```

**Gài**: Trong Java 9+, `privateLookupIn()` có thể ném `IllegalAccessException` nếu module không mở package cho reflection.

---

### 4. Lookup object có giới hạn phạm vi truy cập method/field như thế nào?
- `Lookup` kiểm tra quyền truy cập dựa trên **caller class** (class gọi `lookup()`) và **target class** (class chứa method/field).
- **Phạm vi truy cập**:
    - **Trong cùng class**: Truy cập được tất cả member (public, private, protected, default).
    - **Class khác trong cùng package**: Truy cập được public, protected, default member.
    - **Class khác package**: Chỉ truy cập được public member.
    - **Java 9+**: Module system giới hạn truy cập private member nếu package không được `open` trong `module-info.java`.
- **Lưu ý**: `Lookup` kiểm tra quyền truy cập khi tạo Method Handle, không lặp lại khi gọi.

---

### 5. Khi nào cần dùng `privateLookupIn()` để truy cập private member của class khác.
- Dùng `privateLookupIn()` khi cần tạo Method Handle cho **private member** (method/field/constructor) của một class **khác** mà class gọi không có quyền truy cập trực tiếp.
- **Điều kiện**:
    - Class gọi phải có `Lookup` với quyền truy cập vào class đích (thông qua `open` module hoặc `--add-opens`).
    - Class đích phải thuộc module cho phép reflection từ module của class gọi.
- **Ví dụ sử dụng**: Testing/debug, hoặc framework cần truy cập private member của class bên ngoài.

**Code ví dụ**:
```java
MethodHandles.Lookup lookup = MethodHandles.lookup();
MethodHandles.Lookup privateLookup = MethodHandles.privateLookupIn(TargetClass.class, lookup);
MethodHandle mh = privateLookup.findSpecial(TargetClass.class, "privateMethod", MethodType.methodType(void.class), TargetClass.class);
```

---

## 3) Tạo Method Handle

### 1. Cách tạo Method Handle cho method instance (`findVirtual`) và method static (`findStatic`).
- **Method instance (`findVirtual`)**:
    - Dùng cho method không phải static, yêu cầu một instance để gọi.
  ```java
  MethodHandles.Lookup lookup = MethodHandles.lookup();
  MethodHandle mh = lookup.findVirtual(String.class, "substring", MethodType.methodType(String.class, int.class, int.class));
  String result = (String) mh.invokeExact("hello", 1, 4); // "ell"
  ```
- **Method static (`findStatic`)**:
    - Dùng cho method static, không cần instance.
  ```java
  MethodHandle mh = lookup.findStatic(Math.class, "max", MethodType.methodType(int.class, int.class, int.class));
  int result = (int) mh.invokeExact(10, 20); // 20
  ```

---

### 2. Cách tạo Method Handle cho constructor (`findConstructor`).
Sử dụng `findConstructor` để tạo Method Handle cho constructor:
```java
MethodHandles.Lookup lookup = MethodHandles.lookup();
MethodHandle mh = lookup.findConstructor(ArrayList.class, MethodType.methodType(void.class));
ArrayList<?> list = (ArrayList<?>) mh.invokeExact();
```

- `MethodType` chỉ định kiểu tham số của constructor, với kiểu trả về là `void`.

---

### 3. ⚠️ Gài: Khi dùng `findVirtual` cho method static hoặc `findStatic` cho method instance thì chuyện gì xảy ra?
- **Dùng `findVirtual` cho method static**:
    - Ném `IllegalAccessException` hoặc `WrongMethodTypeException`, vì `findVirtual` yêu cầu method là instance method (non-static).
- **Dùng `findStatic` cho method instance**:
    - Ném `IllegalAccessException` hoặc `WrongMethodTypeException`, vì `findStatic` yêu cầu method là static.
- **Lý do**: JVM kiểm tra loại method (static hay instance) khi tạo Method Handle, và `MethodType` phải khớp với bản chất của method.

**Ví dụ lỗi**:
```java
// Sai: substring là instance method
MethodHandle mh = lookup.findStatic(String.class, "substring", MethodType.methodType(String.class, int.class, int.class)); // Ném exception
```

---

### 4. Cách tạo Method Handle cho field getter (`findGetter`, `findStaticGetter`) và setter (`findSetter`, `findStaticSetter`).
- **Getter**:
    - `findGetter`: Cho instance field.
    - `findStaticGetter`: Cho static field.
  ```java
  MethodHandle getter = lookup.findGetter(MyClass.class, "name", String.class);
  String value = (String) getter.invokeExact(obj);
  ```
- **Setter**:
    - `findSetter`: Cho instance field.
    - `findStaticSetter`: Cho static field.
  ```java
  MethodHandle setter = lookup.findSetter(MyClass.class, "name", String.class);
  setter.invokeExact(obj, "newValue");
  ```

---

### 5. `findSpecial` dùng khi nào? Liên quan gì đến gọi method của superclass.
- **`findSpecial`** dùng để tạo Method Handle cho method **private**, **protected**, hoặc method của **superclass** được gọi thông qua `super.method()`.
- **Liên quan đến superclass**:
    - Cho phép gọi method của superclass mà không bị override bởi subclass.
    - Yêu cầu tham số `specialCaller` (class gọi `super`), đảm bảo quyền truy cập hợp lệ.
- **Ví dụ**:
```java
MethodHandle mh = lookup.findSpecial(SuperClass.class, "method", MethodType.methodType(void.class), SubClass.class);
mh.invokeExact(subClassInstance);
```

**Ứng dụng**: Dùng trong bytecode generation hoặc khi cần gọi method gốc của superclass.

---

### 6. Method Handle có thể tạo cho phương thức private không? Điều kiện.
- **Có**, Method Handle có thể tạo cho method private nếu:
    - Sử dụng `MethodHandles.Lookup` có quyền truy cập private (như `lookup()` trong cùng class hoặc `privateLookupIn()`).
    - Module chứa method private phải mở package cho reflection (Java 9+).
- **Điều kiện**:
    - `Lookup` phải được tạo từ class có quyền truy cập (hoặc qua `privateLookupIn()`).
    - Không bị `SecurityManager` chặn.
- **Ví dụ**:
```java
MethodHandle mh = lookup.findVirtual(MyClass.class, "privateMethod", MethodType.methodType(void.class));
mh.invokeExact(obj);
```

---

## 4) `MethodType`

### 1. `MethodType` là gì? Vì sao Method Handle cần `MethodType` khi tìm method.
- **`MethodType`** là một class trong `java.lang.invoke` đại diện cho **signature** của method (kiểu trả về và kiểu tham số).
- **Vai trò**:
    - Xác định chính xác method/constructor/field cần tìm dựa trên kiểu tham số và kiểu trả về.
    - Đảm bảo type safety khi gọi Method Handle (đặc biệt với `invokeExact()`).
- **Tại sao cần**:
    - JVM yêu cầu thông tin kiểu để tra cứu method trong class (do overload).
    - Giúp Method Handle hoạt động với hiệu năng cao bằng cách cố định signature tại thời điểm tạo.

**Ví dụ**:
```java
MethodType mt = MethodType.methodType(String.class, int.class, int.class); // substring(int, int)
MethodHandle mh = lookup.findVirtual(String.class, "substring", mt);
```

---

### 2. Cách tạo `MethodType` cho method có nhiều tham số và kiểu trả về.
Sử dụng `MethodType.methodType(returnType, paramTypes)`:
```java
MethodType mt = MethodType.methodType(String.class, String.class, int.class, boolean.class);
```
- `returnType`: Kiểu trả về (`void.class` nếu không có).
- `paramTypes`: Danh sách kiểu tham số (có thể rỗng).

**Ví dụ**:
```java
MethodType mt = MethodType.methodType(void.class, String.class); // Method void print(String)
```

---

### 3. ⚠️ Gài: Nếu `MethodType` không khớp chính xác với method thực tế thì chuyện gì xảy ra?
- Nếu `MethodType` không khớp (sai kiểu trả về hoặc tham số):
    - Khi tạo Method Handle, `MethodHandles.Lookup` ném `NoSuchMethodException` hoặc `WrongMethodTypeException`.
    - Nếu dùng `invoke()` (không phải `invokeExact()`), có thể tự động ép kiểu nếu kiểu tương thích, nhưng hiệu năng giảm.
    - Với `invokeExact()`, luôn ném `WrongMethodTypeException` nếu kiểu không khớp chính xác.
- **Lý do**: Method Handle yêu cầu type safety để đảm bảo hiệu năng và tính đúng đắn.

**Ví dụ lỗi**:
```java
MethodType mt = MethodType.methodType(String.class, int.class); // Sai: substring cần 2 int
MethodHandle mh = lookup.findVirtual(String.class, "substring", mt); // Ném NoSuchMethodException
```

---

### 4. `MethodType` có bất biến không (immutable)?
- **Có**, `MethodType` là **immutable** (bất biến).
- Sau khi tạo, không thể thay đổi kiểu trả về hoặc tham số.
- Để tạo `MethodType` mới, phải gọi lại `MethodType.methodType()`.

**Ví dụ**:
```java
MethodType mt = MethodType.methodType(String.class, int.class);
// mt = ...; // Không thể sửa, phải tạo mới
MethodType newMt = MethodType.methodType(String.class, int.class, int.class);
```

---

### 5. Cách lấy `MethodType` từ một Method Handle đã có (`type()` method).
Sử dụng phương thức `type()` của `MethodHandle`:
```java
MethodHandle mh = lookup.findVirtual(String.class, "substring", MethodType.methodType(String.class, int.class, int.class));
MethodType mt = mh.type(); // Trả về MethodType của substring
System.out.println(mt); // (int,int)String
```

---

## 5) Gọi Method Handle

### 1. `invokeExact()` vs `invoke()` khác nhau thế nào về kiểm tra kiểu dữ liệu.
- **`invokeExact()`**:
    - Yêu cầu kiểu tham số và kiểu trả về **khớp chính xác** với `MethodType` của Method Handle.
    - Không tự động ép kiểu (boxing/unboxing, widening).
    - Hiệu năng cao nhất, gần với method call trực tiếp.
- **`invoke()`**:
    - Linh hoạt hơn, tự động ép kiểu nếu tương thích (boxing, widening, varargs).
    - Hiệu năng thấp hơn do kiểm tra kiểu runtime.
- **Ví dụ**:
```java
MethodHandle mh = lookup.findVirtual(String.class, "substring", MethodType.methodType(String.class, int.class, int.class));
mh.invokeExact("hello", 1, 4); // OK
mh.invoke("hello", 1, 4); // OK (ép kiểu tự động)
mh.invokeExact("hello", 1.0, 4); // Ném WrongMethodTypeException
```

---

### 2. ⚠️ Gài: Vì sao `invokeExact()` yêu cầu kiểu tham số khớp tuyệt đối với `MethodType`?
- **`invokeExact()`** được thiết kế để đạt **hiệu năng tối đa**, tương đương method call trực tiếp.
- Kiểu phải khớp chính xác để JVM có thể inline code và loại bỏ kiểm tra kiểu runtime.
- Nếu không khớp, JVM không thể đảm bảo an toàn hoặc tối ưu hóa, dẫn đến `WrongMethodTypeException`.
- **Lý do**: Đảm bảo type safety tại runtime và tận dụng JIT compiler.

**Ví dụ lỗi**:
```java
MethodHandle mh = lookup.findVirtual(String.class, "length", MethodType.methodType(int.class));
mh.invokeExact("hello"); // OK
mh.invokeExact((Object) "hello"); // Ném WrongMethodTypeException
```

---

### 3. Khi nào nên dùng `invoke()` thay cho `invokeExact()`.
- Dùng `invoke()` khi:
    - Kiểu tham số hoặc trả về có thể thay đổi (boxing, unboxing, widening).
    - Cần hỗ trợ varargs hoặc kiểu generic.
    - Code cần linh hoạt hơn và chấp nhận overhead nhỏ.
- Dùng `invokeExact()` khi:
    - Kiểu đã được xác định chính xác và không cần ép kiểu.
    - Ưu tiên hiệu năng cao nhất.

**Ví dụ**:
```java
MethodHandle mh = lookup.findVirtual(String.class, "substring", MethodType.methodType(String.class, int.class, int.class));
mh.invoke("hello", 1, 4); // OK, tự động ép kiểu
```

---

### 4. Sử dụng Method Handle để gọi method với tham số biến đổi (`varargs`).
- Method Handle hỗ trợ varargs thông qua `invoke()`:
```java
MethodHandle mh = lookup.findVirtual(String.class, "format", MethodType.methodType(String.class, String.class, Object[].class));
String result = (String) mh.invoke("Hello %s %s", new Object[]{"Alice", "Bob"}); // OK
```
- Với `invokeExact()`, cần truyền chính xác mảng `Object[]`:
```java
mh.invokeExact("Hello %s %s", new Object[]{"Alice", "Bob"}); // OK
```

---

### 5. Sự khác biệt giữa gọi trực tiếp method thông qua Method Handle và gọi qua Reflection về hiệu năng.
- **Method Handle**:
    - Sau lần gọi đầu, JIT compiler inline code, gần với hiệu năng của method call trực tiếp.
    - Kiểm tra quyền truy cập chỉ thực hiện một lần khi tạo Method Handle.
    - Hỗ trợ `invokedynamic`, tối ưu cho các ngôn ngữ động.
- **Reflection**:
    - Mỗi lần gọi `invoke()` phải tra cứu metadata và kiểm tra quyền truy cập, gây overhead.
    - Không tận dụng được JIT inline tốt như Method Handle.
    - Chậm hơn đáng kể, đặc biệt khi gọi lặp lại nhiều lần.

**Ví dụ**:
- Method Handle: Gần như không có overhead sau lần đầu.
- Reflection: Overhead tra cứu metadata mỗi lần gọi.

---

## 6) Chuyển đổi & Kết hợp Method Handle

### 1. `bindTo()` dùng để làm gì? Khi nào cần bind instance vào Method Handle.
- **`bindTo(Object)`** gắn một instance cụ thể vào Method Handle của instance method, biến nó thành Method Handle không cần tham số instance.
- **Khi cần**:
    - Khi muốn gọi method trên một instance cố định mà không phải truyền instance mỗi lần.
    - Tăng hiệu năng bằng cách loại bỏ tham số instance trong lời gọi.

**Ví dụ**:
```java
MethodHandle mh = lookup.findVirtual(String.class, "substring", MethodType.methodType(String.class, int.class, int.class));
MethodHandle bound = mh.bindTo("hello"); // Gắn instance "hello"
String result = (String) bound.invokeExact(1, 4); // "ell"
```

---

### 2. ⚠️ Gài: Khi `bindTo()` thì Method Handle mới có còn yêu cầu tham số instance không?
- **Không**, Method Handle mới sau khi `bindTo()` không còn yêu cầu tham số instance.
- `bindTo()` loại bỏ tham số đầu tiên (instance) khỏi `MethodType`, vì instance đã được gắn cố định.
- **Ví dụ**:
```java
MethodHandle mh = lookup.findVirtual(String.class, "substring", MethodType.methodType(String.class, int.class, int.class)); // (String,int,int)String
MethodHandle bound = mh.bindTo("hello"); // (int,int)String
```

**Gài**: Nếu gọi `invokeExact()` trên Method Handle gốc với tham số instance đã bị bind, sẽ ném `WrongMethodTypeException`.

---

### 3. Chuyển đổi Method Handle để đổi kiểu tham số (`asType`).
Sử dụng `asType(MethodType)` để chuyển đổi `MethodType` của Method Handle, miễn là kiểu mới tương thích:
```java
MethodHandle mh = lookup.findVirtual(String.class, "substring", MethodType.methodType(String.class, int.class, int.class));
MethodHandle converted = mh.asType(MethodType.methodType(Object.class, Integer.class, Integer.class)); // Ép kiểu
Object result = (String) converted.invoke(Integer.valueOf(1), Integer.valueOf(4)); // OK
```

- `asType()` tự động boxing/unboxing hoặc widening nếu cần.
- Nếu kiểu không tương thích, ném `WrongMethodTypeException`.

---

### 4. Tạo Method Handle mới từ method gốc bằng cách chèn thêm tham số (`insertArguments`) hoặc bỏ bớt (`dropArguments`).
- **`insertArguments`**:
    - Chèn giá trị cố định cho một số tham số đầu tiên.
  ```java
  MethodHandle mh = lookup.findVirtual(String.class, "substring", MethodType.methodType(String.class, int.class, int.class));
  MethodHandle fixed = MethodHandles.insertArguments(mh, 1, 1); // Cố định tham số đầu tiên = 1
  String result = (String) fixed.invokeExact("hello", 4); // "ell"
  ```
- **`dropArguments`**:
    - Bỏ bớt tham số không cần thiết.
  ```java
  MethodHandle dropped = MethodHandles.dropArguments(mh, 0, String.class); // Bỏ tham số đầu
  ```

---

### 5. Kết hợp Method Handle với `filterArguments`, `filterReturnValue` để xử lý trước/sau khi gọi method gốc.
- **`filterArguments`**:
    - Áp dụng Method Handle khác để xử lý tham số trước khi gọi method gốc.
  ```java
  MethodHandle mh = lookup.findVirtual(String.class, "substring", MethodType.methodType(String.class, int.class, int.class));
  MethodHandle filter = MethodHandles.filterArguments(mh, 1, lookup.findStatic(Math.class, "abs", MethodType.methodType(int.class, int.class)));
  String result = (String) filter.invokeExact("hello", -1, 4); // Math.abs(-1) = 1
  ```
- **`filterReturnValue`**:
    - Xử lý giá trị trả về của method gốc.
  ```java
  MethodHandle toUpper = lookup.findVirtual(String.class, "toUpperCase", MethodType.methodType(String.class));
  MethodHandle filtered = MethodHandles.filterReturnValue(mh, toUpper);
  String result = (String) filtered.invokeExact("hello", 1, 4); // "ELL"
  ```

---

### 6. Dùng `permuteArguments` để đổi thứ tự tham số.
Sử dụng `permuteArguments` để sắp xếp lại thứ tự tham số:
```java
MethodHandle mh = lookup.findVirtual(String.class, "substring", MethodType.methodType(String.class, int.class, int.class));
MethodHandle permuted = MethodHandles.permuteArguments(mh, MethodType.methodType(String.class, int.class, int.class, String.class), 2, 0, 1);
String result = (String) permuted.invokeExact(1, 4, "hello"); // "ell"
```
- Tham số thứ tự (`2, 0, 1`) ánh xạ vị trí mới sang vị trí cũ.

---

## 7) Method Handles & Lambda Metafactory

### 1. `LambdaMetafactory` là gì? Vai trò trong việc tạo lambda runtime từ Method Handle.
- **`LambdaMetafactory`** là một class trong `java.lang.invoke` dùng để tạo lambda expression hoặc method reference tại runtime từ Method Handle.
- **Vai trò**:
    - Tạo implementation của functional interface từ Method Handle.
    - Chuyển Method Handle thành lambda, tận dụng `invokedynamic` để đạt hiệu năng cao.
- **Ví dụ**:
```java
MethodHandle mh = lookup.findVirtual(String.class, "toUpperCase", MethodType.methodType(String.class));
CallSite site = LambdaMetafactory.metafactory(
    lookup, "apply", MethodType.methodType(Function.class), 
    MethodType.methodType(Object.class, Object.class), mh, 
    MethodType.methodType(String.class, String.class)
);
Function<String, String> lambda = (Function) site.getTarget().invokeExact();
String result = lambda.apply("hello"); // "HELLO"
```

---

### 2. ⚠️ Gài: Sự khác nhau giữa lambda được compile sẵn và lambda tạo từ `LambdaMetafactory`.
- **Lambda compile sẵn**:
    - Được định nghĩa trong source code (như `x -> x.toUpperCase()`).
    - Biên dịch thành `invokedynamic` bởi compiler, trỏ tới Method Handle tại runtime.
    - Type-safe tại compile-time, dễ dùng, hiệu năng tối ưu.
- **Lambda từ `LambdaMetafactory`**:
    - Được tạo động tại runtime từ Method Handle.
    - Phức tạp hơn, yêu cầu cấu hình `CallSite` và `MethodType`.
    - Dùng trong framework hoặc khi cần tạo lambda từ method không biết trước.
- **Khác biệt**:
    - Compile sẵn: Dễ dùng, type-safe, tối ưu từ đầu.
    - `LambdaMetafactory`: Linh hoạt, dùng cho dynamic code, nhưng cần quản lý kiểu cẩn thận.

---

### 3. Tại sao dùng `LambdaMetafactory` có thể cho hiệu năng tương đương method call bình thường.
- `LambdaMetafactory` tạo lambda thông qua `invokedynamic`, được JVM tối ưu hóa bằng JIT compiler.
- Sau lần gọi đầu, `invokedynamic` liên kết với Method Handle, inline code, loại bỏ overhead.
- Không có tra cứu metadata lặp lại (như Reflection), nên hiệu năng gần với method call trực tiếp.

---

### 4. Ứng dụng tạo implementation của functional interface từ Method Handle.
- **Ứng dụng**: Tạo dynamic implementation của `Function`, `Consumer`, `Supplier`, v.v. trong framework hoặc plugin system.
- **Ví dụ**:
```java
MethodHandle mh = lookup.findStatic(System.class, "currentTimeMillis", MethodType.methodType(long.class));
CallSite site = LambdaMetafactory.metafactory(
    lookup, "get", MethodType.methodType(Supplier.class), 
    MethodType.methodType(Object.class), mh, 
    MethodType.methodType(long.class)
);
Supplier<Long> supplier = (Supplier) site.getTarget().invokeExact();
long time = supplier.get(); // Gọi System.currentTimeMillis()
```

---

## 8) Ứng dụng thực tế

### 1. Dùng Method Handle để gọi method private trong class cho mục đích testing/debug.
```java
MethodHandle mh = lookup.findVirtual(MyClass.class, "privateMethod", MethodType.methodType(void.class));
mh.invokeExact(obj); // Gọi private method
```
- **Ưu điểm**: Hiệu năng cao hơn Reflection, phù hợp cho testing framework.

---

### 2. Dùng Method Handle để thay thế Reflection trong framework để tăng hiệu năng.
- Thay `Method.invoke()` bằng `MethodHandle.invokeExact()` trong serialization, DI, hoặc ORM framework.
- **Ví dụ**: Thay thế Reflection trong Spring để gọi setter:
```java
MethodHandle setter = lookup.findSetter(MyClass.class, "name", String.class);
setter.invokeExact(obj, "value"); // Nhanh hơn method.invoke()
```

---

### 3. Tạo dynamic proxy hoặc event handler bằng Method Handle thay cho `InvocationHandler`.
```java
MethodHandle mh = lookup.findVirtual(MyClass.class, "doSomething", MethodType.methodType(void.class));
MyInterface proxy = (MyInterface) LambdaMetafactory.metafactory(
    lookup, "doSomething", MethodType.methodType(MyInterface.class), 
    MethodType.methodType(void.class), mh, MethodType.methodType(void.class)
).getTarget().invokeExact();
proxy.doSomething();
```

---

### 4. ⚠️ Gài: Vì sao nhiều thư viện serialization/deserialization (Jackson, Gson) dùng Method Handle thay cho Reflection.
- **Hiệu năng**: Method Handle nhanh hơn Reflection, đặc biệt khi gọi lặp lại (như khi serialize/deserialize nhiều object).
- **JIT inline**: Method Handle được inline bởi JIT compiler, giảm overhead.
- **Type safety**: `invokeExact()` đảm bảo kiểu khớp chính xác, tránh lỗi runtime.
- **Giảm tra cứu metadata**: Method Handle lưu trữ tham chiếu trực tiếp, không cần tra cứu lặp lại như Reflection.

**Ví dụ**: Jackson dùng Method Handle để gọi getter/setter khi parse JSON, cải thiện tốc độ.

---

### 5. Tích hợp Method Handle để implement dependency injection framework nhỏ gọn.
- **Cách làm**:
    - Dùng `findSetter` để inject giá trị vào field.
    - Dùng `LambdaMetafactory` để tạo factory cho bean.
- **Ví dụ**:
```java
MethodHandle setter = lookup.findSetter(MyBean.class, "name", String.class);
MyBean bean = new MyBean();
setter.invokeExact(bean, "injectedValue");
```

---

## 9) Hiệu năng & Bảo mật

### 1. Vì sao Method Handle nhanh hơn Reflection sau lần gọi đầu? Liên quan đến JIT inline.
- **Sau lần gọi đầu**:
    - Method Handle được liên kết với method thực tế qua `invokedynamic` hoặc trực tiếp.
    - JIT compiler inline code, loại bỏ overhead tra cứu và kiểm tra kiểu.
- **Reflection**: Mỗi lần gọi `invoke()` phải tra cứu metadata và kiểm tra quyền truy cập.
- **Kết quả**: Method Handle đạt hiệu năng gần với method call trực tiếp.

---

### 2. ⚠️ Gài: Trong Java 9+, việc truy cập private member qua Method Handle bị hạn chế bởi module system như thế nào?
- **Module system** (JPMS) giới hạn truy cập private member nếu package không được `open` trong `module-info.java`.
- `MethodHandles.privateLookupIn()` yêu cầu module đích mở package cho module gọi, nếu không sẽ ném `IllegalAccessException`.
- **Giải pháp**:
    - Thêm `open` trong `module-info.java`:
      ```java
      module my.module {
          opens com.example to java.base;
      }
      ```
    - Hoặc dùng `--add-opens` khi chạy JVM.

---

### 3. Cách cache Method Handle để giảm chi phí tạo mới nhiều lần.
- Lưu trữ Method Handle trong `static final` field để tái sử dụng:
```java
private static final MethodHandle SUBSTRING_MH;
static {
    SUBSTRING_MH = MethodHandles.lookup()
        .findVirtual(String.class, "substring", MethodType.methodType(String.class, int.class, int.class));
}
```
- **Lợi ích**: Tránh tra cứu lặp lại, giảm overhead khởi tạo.

---

### 4. Rủi ro bảo mật khi mở quyền truy cập qua `Lookup` cho class bên ngoài.
- **Rủi ro**:
    - `privateLookupIn()` cho phép truy cập private member, có thể làm lộ dữ liệu nhạy cảm.
    - Hacker có thể lạm dụng để gọi method/field không được phép.
- **Giảm thiểu**:
    - Hạn chế sử dụng `privateLookupIn()` trừ khi cần thiết.
    - Dùng `SecurityManager` để chặn truy cập trái phép.
    - Đảm bảo module system giới hạn package mở.

---

## 10) Mini Case (thực chiến)

### 1. Viết code lấy Method Handle cho method `String.substring(int, int)` và gọi nó.
```java
MethodHandles.Lookup lookup = MethodHandles.lookup();
MethodHandle mh = lookup.findVirtual(String.class, "substring", MethodType.methodType(String.class, int.class, int.class));
String result = (String) mh.invokeExact("hello", 1, 4); // "ell"
System.out.println(result);
```

---

### 2. Tạo Method Handle cho constructor của `ArrayList` và tạo đối tượng.
```java
MethodHandles.Lookup lookup = MethodHandles.lookup();
MethodHandle mh = lookup.findConstructor(ArrayList.class, MethodType.methodType(void.class));
ArrayList<?> list = (ArrayList<?>) mh.invokeExact();
System.out.println(list);
```

---

### 3. Bind Method Handle cho instance cụ thể và gọi method instance không có tham số.
```java
MethodHandles.Lookup lookup = MethodHandles.lookup();
MethodHandle mh = lookup.findVirtual(String.class, "length", MethodType.methodType(int.class));
MethodHandle bound = mh.bindTo("hello");
int length = (int) bound.invokeExact(); // 5
System.out.println(length);
```

---

### 4. Tạo Method Handle cho field getter và setter, thay đổi giá trị field private.
```java
class MyClass {
    private String name = "initial";
}

MethodHandles.Lookup lookup = MethodHandles.lookup();
MethodHandle getter = lookup.findGetter(MyClass.class, "name", String.class);
MethodHandle setter = lookup.findSetter(MyClass.class, "name", String.class);
MyClass obj = new MyClass();
setter.invokeExact(obj, "newValue");
String value = (String) getter.invokeExact(obj); // "newValue"
System.out.println(value);
```

---

### 5. Sử dụng `insertArguments` để tạo Method Handle cố định giá trị tham số đầu tiên của method cộng hai số.
```java
MethodHandle mh = lookup.findStatic(Math.class, "addExact", MethodType.methodType(int.class, int.class, int.class));
MethodHandle fixed = MethodHandles.insertArguments(mh, 0, 10); // Cố định a = 10
int result = (int) fixed.invokeExact(20); // 10 + 20 = 30
System.out.println(result);
```

---

### 6. Tạo một lambda `Runnable` runtime từ Method Handle trỏ tới method `System.out::println`.
```java
MethodHandle mh = lookup.findVirtual(PrintStream.class, "println", MethodType.methodType(void.class, String.class));
mh = mh.bindTo(System.out); // Bind System.out
CallSite site = LambdaMetafactory.metafactory(
    lookup, "run", MethodType.methodType(Runnable.class), 
    MethodType.methodType(void.class), mh, 
    MethodType.methodType(void.class, String.class)
);
Runnable runnable = (Runnable) site.getTarget().invokeExact();
runnable.run(); // In ra "Hello"
```

---

