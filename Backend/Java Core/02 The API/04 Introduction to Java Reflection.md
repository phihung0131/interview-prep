## 1) Khái niệm & Tổng quan

### 1. Java Reflection là gì? Cho ví dụ thực tế khi cần dùng reflection.
**Java Reflection** là cơ chế trong Java cho phép kiểm tra và thao tác với cấu trúc của class (fields, methods, constructors, annotations, v.v.) tại **runtime**, mà không cần biết trước thông tin tại **compile-time**. Nó thuộc gói `java.lang.reflect` và cho phép truy cập metadata của class, tạo instance, gọi method, hoặc thay đổi field dynamically.

**Ví dụ thực tế**:
- **Framework như Spring/Hibernate**: Sử dụng reflection để inject dependencies vào field/method hoặc ánh xạ đối tượng với bảng cơ sở dữ liệu (dựa trên annotation như `@Autowired`, `@Entity`).
- **Serialization/Deserialization**: Thư viện như Jackson/GSON dùng reflection để đọc/ghi giá trị field thành JSON/XML.
- **Debugging/Logging tool**: In ra cấu trúc class hoặc giá trị field/method của object tại runtime.

**Code ví dụ** (đọc giá trị field):
```java
Field field = MyClass.class.getDeclaredField("name");
field.setAccessible(true);
Object value = field.get(obj); // Lấy giá trị field "name" từ đối tượng obj
```

---

### 2. ⚠️ Gài: Reflection có cho phép thao tác với **private field/method** không? Điều kiện để truy cập là gì?
**Có**, Reflection cho phép truy cập và thao tác với **private field/method**. Điều kiện:
- Gọi `setAccessible(true)` trên `Field`, `Method`, hoặc `Constructor` để vượt qua kiểm tra quyền truy cập của JVM.
- Nếu class nằm trong module khác (Java 9+), module đó phải **mở** (open) package chứa class cho module gọi reflection (vì **module system** giới hạn truy cập).

**Lưu ý**:
- Nếu `SecurityManager` được bật, truy cập có thể bị chặn.
- Trong Java 9+, nếu module không mở, sẽ gặp `InaccessibleObjectException`.

**Code ví dụ**:
```java
Field privateField = MyClass.class.getDeclaredField("privateField");
privateField.setAccessible(true); // Bỏ qua kiểm tra quyền truy cập
privateField.set(obj, "newValue");
```

---

### 3. Ưu điểm và nhược điểm của việc dùng Reflection.
**Ưu điểm**:
- **Linh hoạt**: Cho phép truy cập và thao tác với class/method/field mà không cần biết trước tại compile-time.
- **Tự động hóa**: Hỗ trợ các framework (Spring, Hibernate) tự động xử lý cấu hình dựa trên metadata.
- **Debugging/Testing**: Dễ dàng kiểm tra trạng thái nội bộ của object hoặc gọi method private.

**Nhược điểm**:
- **Hiệu năng thấp**: Reflection chậm hơn code thông thường vì phải tra cứu metadata tại runtime.
- **Phức tạp và dễ lỗi**: Code reflection khó đọc, dễ gây lỗi như `NoSuchFieldException`, `IllegalAccessException`.
- **Phá encapsulation**: Truy cập private field/method có thể vi phạm thiết kế OOP.
- **Bảo mật**: Dễ bị lạm dụng để truy cập dữ liệu nhạy cảm.
- **Khó debug**: Lỗi runtime khó phát hiện hơn lỗi compile-time.

---

### 4. So sánh Reflection với **compile-time type checking** — khác biệt và rủi ro.
**Khác biệt**:
- **Reflection**:
    - Hoạt động tại **runtime**, sử dụng metadata của class (fields, methods, v.v.).
    - Không cần biết cấu trúc class tại compile-time, linh hoạt với dynamic code.
    - Dễ gặp lỗi runtime như `NoSuchMethodException` nếu tên method/field sai.
- **Compile-time type checking**:
    - Kiểm tra kiểu dữ liệu và cấu trúc class tại **compile-time** bởi compiler.
    - Đảm bảo an toàn kiểu (type safety) và phát hiện lỗi sớm (method/field không tồn tại).
    - Ít linh hoạt hơn vì cần biết thông tin class tại compile-time.

**Rủi ro của Reflection**:
- **Lỗi runtime**: Sai tên field/method hoặc cấu trúc class thay đổi gây lỗi.
- **Hiệu năng**: Chậm hơn do tra cứu metadata.
- **Bảo mật**: Phá encapsulation, có thể truy cập dữ liệu nhạy cảm.
- **Khó bảo trì**: Code reflection khó đọc và bảo trì hơn code thông thường.

**Khi nào dùng**:
- Reflection: Dùng cho framework, plugin system, hoặc khi cần xử lý dynamic class.
- Compile-time: Dùng cho code thông thường để đảm bảo type safety và hiệu năng.

---

### 5. Reflection API thuộc package nào trong Java? (`java.lang.reflect`, `java.lang.Class`)
Reflection API nằm trong **hai package chính**:
- **`java.lang.reflect`**: Chứa các class như `Field`, `Method`, `Constructor`, `Modifier`, `Array`, v.v., để thao tác với metadata của class.
- **`java.lang.Class`**: Là class chính để đại diện cho một class tại runtime, cung cấp các phương thức như `getDeclaredFields()`, `getMethods()`, `getConstructors()`.

**Lưu ý**: `Class` nằm trong `java.lang`, không phải `java.lang.reflect`, nhưng là nền tảng cho Reflection API.

---

### 6. ⚠️ Gài: Reflection có phá vỡ nguyên tắc **encapsulation** không? Tại sao?
**Có**, Reflection phá vỡ nguyên tắc **encapsulation** vì:
- **Encapsulation** yêu cầu ẩn dữ liệu (private field/method) và chỉ truy cập qua getter/setter công khai.
- Reflection cho phép truy cập trực tiếp vào **private field/method** bằng `setAccessible(true)`, bỏ qua kiểm tra quyền truy cập.
- Điều này vi phạm ý định thiết kế của class, có thể dẫn đến thay đổi trạng thái không mong muốn hoặc truy cập dữ liệu nhạy cảm.

**Ví dụ**:
```java
Field privateField = MyClass.class.getDeclaredField("secret");
privateField.setAccessible(true);
privateField.set(obj, "hacked"); // Thay đổi field private trực tiếp
```

**Hậu quả**: Phá encapsulation có thể gây lỗi logic, khó bảo trì, và rủi ro bảo mật nếu dữ liệu nhạy cảm bị truy cập.

---

## 2) Class Metadata & `Class` Object

### 1. Cách lấy đối tượng `Class<?>` từ tên class (`.class`, `obj.getClass()`, `Class.forName()`).
Có 3 cách chính để lấy đối tượng `Class<?>`:
- **`.class`**: Dùng cú pháp tĩnh `MyClass.class`. Chỉ hoạt động khi biết tên class tại compile-time.
  ```java
  Class<?> clazz = MyClass.class;
  ```
- **`obj.getClass()`**: Lấy `Class` từ một instance của class tại runtime.
  ```java
  MyClass obj = new MyClass();
  Class<?> clazz = obj.getClass();
  ```
- **`Class.forName(String)`**: Load class từ tên đầy đủ (fully qualified name) tại runtime.
  ```java
  Class<?> clazz = Class.forName("com.example.MyClass");
  ```

---

### 2. `Class.forName()` khác gì với `.class` và `getClass()` về việc load & init class.
- **`.class`**:
    - Là cách tĩnh, không load class vào JVM ngay lập tức (chỉ khi class được sử dụng).
    - Không khởi tạo (initialize) class (không chạy static block).
    - Chỉ dùng được khi biết tên class tại compile-time.
- **`getClass()`**:
    - Lấy `Class` từ một instance đã tồn tại, nghĩa là class đã được load và khởi tạo.
    - Không cần tên class tại compile-time, nhưng cần instance.
- **`Class.forName()`**:
    - Load class từ tên đầy đủ (fully qualified name) tại runtime.
    - **Khởi tạo class** (chạy static block) theo mặc định, trừ khi dùng `Class.forName(name, initialize, classLoader)` với `initialize = false`.
    - Có thể ném `ClassNotFoundException` nếu class không tồn tại.

**Code ví dụ**:
```java
// .class
Class<?> c1 = String.class; // Tĩnh, không load ngay

// getClass()
String s = "hello";
Class<?> c2 = s.getClass(); // Class đã load

// Class.forName()
Class<?> c3 = Class.forName("java.lang.String"); // Load và init class
```

---

### 3. Lấy thông tin modifiers (public, abstract, final) của một class bằng reflection như thế nào?
Sử dụng phương thức `getModifiers()` của `Class` để lấy thông tin modifiers, sau đó dùng class `Modifier` để kiểm tra:
```java
Class<?> clazz = MyClass.class;
int modifiers = clazz.getModifiers();

boolean isPublic = Modifier.isPublic(modifiers);
boolean isAbstract = Modifier.isAbstract(modifiers);
boolean isFinal = Modifier.isFinal(modifiers);

System.out.println("Public: " + isPublic + ", Abstract: " + isAbstract + ", Final: " + isFinal);
```

- `getModifiers()` trả về một `int` biểu diễn các modifiers (public, private, abstract, final, v.v.).
- Class `java.lang.reflect.Modifier` cung cấp các phương thức như `isPublic()`, `isAbstract()`, `isFinal()` để kiểm tra.

---

### 4. ⚠️ Gài: Lấy superclass và interfaces từ một class qua reflection. Khi class implement nhiều interface, thứ tự trả về có cố định không?
- **Lấy superclass**:
  ```java
  Class<?> superClass = MyClass.class.getSuperclass();
  ```
    - Trả về `Class` của superclass hoặc `null` nếu là `Object` hoặc interface.

- **Lấy interfaces**:
  ```java
  Class<?>[] interfaces = MyClass.class.getInterfaces();
  ```
    - Trả về mảng các `Class` của interfaces mà class implement trực tiếp.

- **Thứ tự trả về của interfaces**:
    - **Không cố định** theo đặc tả Java. Thứ tự phụ thuộc vào trình tự khai báo trong mã nguồn (`implements Interface1, Interface2`), nhưng không nên dựa vào thứ tự này vì nó không được đảm bảo bởi JVM.
    - Để an toàn, xử lý mảng interfaces như tập hợp (set) thay vì danh sách có thứ tự.

**Code ví dụ**:
```java
Class<?> clazz = MyClass.class;
System.out.println("Superclass: " + clazz.getSuperclass().getName());
for (Class<?> iface : clazz.getInterfaces()) {
    System.out.println("Interface: " + iface.getName());
}
```

---

### 5. Cách kiểm tra một class có phải là interface, enum, annotation, array hay primitive qua reflection.
Sử dụng các phương thức của `Class`:
```java
Class<?> clazz = MyClass.class;

// Kiểm tra interface
boolean isInterface = clazz.isInterface();

// Kiểm tra enum
boolean isEnum = clazz.isEnum();

// Kiểm tra annotation
boolean isAnnotation = clazz.isAnnotation();

// Kiểm tra array
boolean isArray = clazz.isArray();

// Kiểm tra primitive
boolean isPrimitive = clazz.isPrimitive();
```

**Ví dụ**:
```java
System.out.println("String is interface? " + String.class.isInterface()); // false
System.out.println("int is primitive? " + int.class.isPrimitive()); // true
System.out.println("MyEnum is enum? " + MyEnum.class.isEnum()); // true
```

---

### 6. Lấy thông tin annotation gắn trên class (runtime-retention).
Sử dụng `getAnnotations()` hoặc `getAnnotation(Class)` để lấy annotation có `RetentionPolicy.RUNTIME`:
```java
Class<?> clazz = MyClass.class;

// Lấy tất cả annotation
Annotation[] annotations = clazz.getAnnotations();

// Lấy annotation cụ thể
MyAnnotation anno = clazz.getAnnotation(MyAnnotation.class);
if (anno != null) {
    System.out.println("Annotation value: " + anno.value());
}
```

- Chỉ annotation với `@Retention(RetentionPolicy.RUNTIME)` mới lấy được qua reflection.
- `getDeclaredAnnotations()` chỉ lấy annotation khai báo trực tiếp trên class, không bao gồm annotation kế thừa.

---

## 3) Constructors

### 1. Cách lấy danh sách tất cả constructor của một class (`getConstructors()`, `getDeclaredConstructors()`).
- **`getConstructors()`**: Lấy tất cả **public** constructor của class (bao gồm kế thừa).
  ```java
  Constructor<?>[] constructors = MyClass.class.getConstructors();
  ```
- **`getDeclaredConstructors()`**: Lấy tất cả constructor (bao gồm private, protected, default) khai báo trực tiếp trong class, không bao gồm kế thừa.
  ```java
  Constructor<?>[] declaredConstructors = MyClass.class.getDeclaredConstructors();
  ```

---

### 2. Khác biệt giữa `getConstructors()` và `getDeclaredConstructors()` — phạm vi truy cập.
- **`getConstructors()`**:
    - Chỉ trả về **public** constructor.
    - Bao gồm constructor kế thừa từ superclass nếu chúng public.
- **`getDeclaredConstructors()`**:
    - Trả về **tất cả** constructor (public, private, protected, default) khai báo trong class.
    - Không bao gồm constructor kế thừa từ superclass.
- **Lưu ý**: Để truy cập constructor private, cần gọi `setAccessible(true)`.

---

### 3. ⚠️ Gài: Dùng reflection tạo instance của class qua constructor private có được không? Cần làm gì?
**Có**, có thể tạo instance qua constructor private bằng cách:
1. Lấy constructor private bằng `getDeclaredConstructor()`.
2. Gọi `setAccessible(true)` để bỏ qua kiểm tra quyền truy cập.
3. Gọi `newInstance()` để tạo instance.

**Code ví dụ**:
```java
Class<?> clazz = MyClass.class;
Constructor<?> constructor = clazz.getDeclaredConstructor(String.class);
constructor.setAccessible(true); // Bỏ qua kiểm tra private
Object instance = constructor.newInstance("param");
```

**Điều kiện**:
- Module chứa class phải mở package cho reflection (Java 9+).
- Không có `SecurityManager` chặn `setAccessible(true)`.

---

### 4. Cách truyền tham số vào constructor khi tạo đối tượng bằng reflection.
Sử dụng `Constructor.newInstance(Object... initargs)` để truyền tham số:
```java
Class<?> clazz = MyClass.class;
Constructor<?> constructor = clazz.getDeclaredConstructor(String.class, int.class);
constructor.setAccessible(true);
Object instance = constructor.newInstance("test", 42); // Truyền "test" và 42
```

- Tham số phải khớp với kiểu và số lượng của constructor.
- Nếu sai kiểu, sẽ ném `IllegalArgumentException`.

---

### 5. Exception thường gặp khi tạo đối tượng bằng constructor không hợp lệ (`InvocationTargetException`, `InstantiationException`).
- **`InstantiationException`**: Class là abstract, interface, hoặc không có constructor hợp lệ (ví dụ: không có default constructor khi gọi `Class.newInstance()`).
- **`IllegalAccessException`**: Constructor không accessible (chưa gọi `setAccessible(true)` hoặc bị module system chặn).
- **`IllegalArgumentException`**: Tham số truyền vào constructor không khớp về số lượng hoặc kiểu.
- **`InvocationTargetException`**: Constructor ném exception trong quá trình chạy (ví dụ: ném `NullPointerException` trong constructor).
- **`NoSuchMethodException`**: Constructor với tham số được chỉ định không tồn tại.

**Code xử lý exception**:
```java
try {
    Constructor<?> constructor = MyClass.class.getDeclaredConstructor(String.class);
    constructor.setAccessible(true);
    Object instance = constructor.newInstance("test");
} catch (InstantiationException | IllegalAccessException | NoSuchMethodException e) {
    e.printStackTrace();
} catch (InvocationTargetException e) {
    e.getCause().printStackTrace(); // Lấy nguyên nhân gốc của exception
}
```

---

## 4) Fields

### 1. Cách lấy danh sách field (`getFields()`, `getDeclaredFields()`), khác biệt giữa chúng.
- **`getFields()`**:
    - Trả về tất cả **public** field (bao gồm field kế thừa từ superclass hoặc interface).
  ```java
  Field[] fields = MyClass.class.getFields();
  ```
- **`getDeclaredFields()`**:
    - Trả về tất cả field (public, private, protected, default) khai báo trực tiếp trong class, không bao gồm field kế thừa.
  ```java
  Field[] declaredFields = MyClass.class.getDeclaredFields();
  ```

**Khác biệt**:
- `getFields()`: Chỉ public, bao gồm kế thừa.
- `getDeclaredFields()`: Tất cả quyền truy cập, chỉ trong class hiện tại.

---

### 2. Truy cập và thay đổi giá trị field (kể cả private) bằng reflection.
Sử dụng `Field.get()` và `Field.set()`:
```java
Field field = MyClass.class.getDeclaredField("name");
field.setAccessible(true); // Cho phép truy cập private
Object value = field.get(obj); // Lấy giá trị
field.set(obj, "newValue"); // Thay đổi giá trị
```

- **`setAccessible(true)`**: Bỏ qua kiểm tra quyền truy cập.
- **Lưu ý**: Nếu field là `static`, truyền `null` thay cho `obj` trong `get()`/`set()`.

---

### 3. ⚠️ Gài: Khi sửa giá trị field `final static` bằng reflection, chuyện gì xảy ra? JVM có luôn dùng giá trị mới không?
- **Có thể sửa giá trị** `final static` field bằng reflection, nhưng cần cẩn thận:
    - Gọi `setAccessible(true)` để bỏ qua kiểm tra quyền truy cập.
    - Dùng `Field.set()` để thay đổi giá trị.
- **Hậu quả**:
    - Nếu field được **inline** bởi compiler (thường với `final static` primitive hoặc `String`), giá trị mới không được áp dụng trong code đã biên dịch vì compiler thay thế field bằng giá trị thực tại compile-time.
    - Nếu không inline (phụ thuộc vào JVM), giá trị mới sẽ được áp dụng.
- **JVM không đảm bảo dùng giá trị mới**: Tùy thuộc vào cách compiler tối ưu hóa và trạng thái runtime.

**Code ví dụ**:
```java
Field field = MyClass.class.getDeclaredField("MY_CONSTANT");
field.setAccessible(true);
field.set(null, "newValue"); // Thay đổi static field
```

**Lưu ý**: Không nên sửa `final static` field vì vi phạm thiết kế và có thể gây lỗi không dự đoán được.

---

### 4. Kiểm tra kiểu dữ liệu (type) của field.
Sử dụng `Field.getType()` hoặc `Field.getGenericType()`:
```java
Field field = MyClass.class.getDeclaredField("name");
Class<?> type = field.getType(); // Trả về Class (ví dụ: String.class)
Type genericType = field.getGenericType(); // Trả về generic type (ví dụ: List<String>)
```

- `getType()` trả về kiểu cơ bản (Class).
- `getGenericType()` trả về thông tin generic (nếu có), có thể là `ParameterizedType`.

---

### 5. Lấy và xử lý annotation gắn trên field.
Sử dụng `Field.getAnnotations()` hoặc `Field.getAnnotation(Class)`:
```java
Field field = MyClass.class.getDeclaredField("name");
MyAnnotation anno = field.getAnnotation(MyAnnotation.class);
if (anno != null) {
    System.out.println("Annotation value: " + anno.value());
}
```

- Chỉ annotation với `@Retention(RetentionPolicy.RUNTIME)` mới lấy được.
- `getDeclaredAnnotations()` chỉ lấy annotation khai báo trực tiếp.

---

## 5) Methods

### 1. Lấy danh sách method (`getMethods()`, `getDeclaredMethods()`), khác nhau thế nào?
- **`getMethods()`**:
    - Trả về tất cả **public** method (bao gồm method kế thừa từ superclass hoặc interface).
  ```java
  Method[] methods = MyClass.class.getMethods();
  ```
- **`getDeclaredMethods()`**:
    - Trả về tất cả method (public, private, protected, default) khai báo trực tiếp trong class, không bao gồm method kế thừa.
  ```java
  Method[] declaredMethods = MyClass.class.getDeclaredMethods();
  ```

**Khác biệt**:
- `getMethods()`: Chỉ public, bao gồm kế thừa.
- `getDeclaredMethods()`: Tất cả quyền truy cập, chỉ trong class hiện tại.

---

### 2. Gọi method qua reflection (`invoke()`), truyền tham số như thế nào?
Sử dụng `Method.invoke(Object, Object...)`:
```java
Method method = MyClass.class.getDeclaredMethod("doSomething", String.class, int.class);
method.setAccessible(true); // Nếu method private
Object result = method.invoke(obj, "test", 42); // Truyền tham số
```

- Tham số phải khớp về kiểu và số lượng.
- Nếu method là `static`, truyền `null` thay cho `obj`.

---

### 3. ⚠️ Gài: Khi gọi method private qua reflection, cần xử lý `setAccessible(true)` ở đâu?
- Gọi `setAccessible(true)` trên đối tượng `Method` trước khi gọi `invoke()`:
```java
Method privateMethod = MyClass.class.getDeclaredMethod("privateMethod");
privateMethod.setAccessible(true); // Phải gọi trước invoke
Object result = privateMethod.invoke(obj);
```

- **Lưu ý**:
    - Nếu không gọi `setAccessible(true)`, sẽ ném `IllegalAccessException`.
    - Trong Java 9+, module chứa method phải mở package cho reflection.

---

### 4. Phân biệt `IllegalAccessException` và `InvocationTargetException` khi gọi method.
- **`IllegalAccessException`**:
    - Xảy ra khi method không accessible (private/protected) và chưa gọi `setAccessible(true)`.
    - Hoặc module system (Java 9+) chặn truy cập.
- **`InvocationTargetException`**:
    - Xảy ra khi method được gọi ném một exception bên trong.
    - Dùng `getCause()` để lấy exception gốc.
  ```java
  try {
      method.invoke(obj);
  } catch (InvocationTargetException e) {
      e.getCause().printStackTrace(); // Lấy exception gốc
  }
  ```

---

### 5. Lấy generic parameter type của method qua reflection.
Sử dụng `Method.getGenericParameterTypes()` hoặc `Method.getGenericReturnType()`:
```java
Method method = MyClass.class.getDeclaredMethod("myMethod", List.class);
Type[] paramTypes = method.getGenericParameterTypes(); // Trả về List<String>
Type returnType = method.getGenericReturnType(); // Trả về generic return type
```

- Nếu là `ParameterizedType`, có thể ép kiểu để lấy thông tin generic:
```java
if (paramTypes[0] instanceof ParameterizedType) {
    ParameterizedType pType = (ParameterizedType) paramTypes[0];
    Type[] actualTypes = pType.getActualTypeArguments(); // Lấy String trong List<String>
}
```

---

### 6. Lấy annotation trên method và xử lý.
Sử dụng `Method.getAnnotations()` hoặc `Method.getAnnotation(Class)`:
```java
Method method = MyClass.class.getDeclaredMethod("myMethod");
MyAnnotation anno = method.getAnnotation(MyAnnotation.class);
if (anno != null) {
    System.out.println("Annotation value: " + anno.value());
}
```

- Chỉ annotation với `@Retention(RetentionPolicy.RUNTIME)` mới lấy được.

---

## 6) Annotations & Reflection

### 1. Cách kiểm tra một class/method/field có annotation nhất định không.
Sử dụng `isAnnotationPresent(Class)`:
```java
Class<?> clazz = MyClass.class;
boolean hasAnnotation = clazz.isAnnotationPresent(MyAnnotation.class);

Field field = clazz.getDeclaredField("name");
boolean fieldHasAnnotation = field.isAnnotationPresent(MyAnnotation.class);

Method method = clazz.getDeclaredMethod("myMethod");
boolean methodHasAnnotation = method.isAnnotationPresent(MyAnnotation.class);
```

---

### 2. Lấy giá trị thuộc tính (element) của annotation.
Sử dụng `getAnnotation(Class)` và gọi phương thức của annotation:
```java
MyAnnotation anno = MyClass.class.getAnnotation(MyAnnotation.class);
if (anno != null) {
    String value = anno.value(); // Lấy thuộc tính "value"
    int priority = anno.priority(); // Lấy thuộc tính "priority"
}
```

---

### 3. ⚠️ Gài: Annotation có `RetentionPolicy.CLASS` hay `SOURCE` có lấy được qua reflection không?
- **`RetentionPolicy.CLASS`**: Annotation được lưu trong file `.class` nhưng **không** có sẵn tại runtime, nên **không lấy được** qua reflection.
- **`RetentionPolicy.SOURCE`**: Annotation chỉ tồn tại trong source code, bị bỏ đi sau khi compile, nên **không lấy được** qua reflection.
- Chỉ annotation với **`RetentionPolicy.RUNTIME`** mới lấy được qua reflection.

**Code ví dụ**:
```java
@Retention(RetentionPolicy.RUNTIME)
@interface MyAnnotation {
    String value();
}

MyAnnotation anno = MyClass.class.getAnnotation(MyAnnotation.class); // Lấy được
```

---

### 4. Tạo một annotation custom và đọc giá trị của nó bằng reflection.
**Tạo annotation**:
```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface MyAnnotation {
    String value();
    int priority() default 1;
}
```

**Đọc annotation**:
```java
@MyAnnotation(value = "test", priority = 10)
class MyClass {}

MyAnnotation anno = MyClass.class.getAnnotation(MyAnnotation.class);
System.out.println("Value: " + anno.value() + ", Priority: " + anno.priority());
```

---

## 7) Generic Type & Reflection

### 1. Lấy thông tin generic type của field (`ParameterizedType`).
Sử dụng `Field.getGenericType()` và ép kiểu sang `ParameterizedType`:
```java
Field field = MyClass.class.getDeclaredField("myList");
Type genericType = field.getGenericType();
if (genericType instanceof ParameterizedType) {
    ParameterizedType pType = (ParameterizedType) genericType;
    Type[] actualTypes = pType.getActualTypeArguments(); // Lấy List<String> -> String
}
```

---

### 2. ⚠️ Gài: Do **type erasure**, khi nào generic type bị mất thông tin và không lấy được qua reflection?
- **Type erasure**: Java xóa thông tin generic tại runtime để đảm bảo tương thích ngược, trừ một số trường hợp:
    - **Field**: Thông tin generic được giữ trong metadata của field (dùng `getGenericType()`).
    - **Method parameter/return type**: Giữ thông tin generic (dùng `getGenericParameterTypes()`, `getGenericReturnType()`).
    - **Generic superclass**: Giữ thông tin generic (dùng `getGenericSuperclass()`).
- **Khi thông tin bị mất**:
    - Biến cục bộ (local variable) generic không có metadata tại runtime.
    - Instance của generic class không giữ thông tin generic (trừ khi dùng anonymous class hoặc subclass rõ ràng).
    - Ví dụ: `List<String> list = new ArrayList<>()` chỉ được xem là `List` tại runtime.

**Code ví dụ**:
```java
class MyClass<T> {}
class SubClass extends MyClass<String> {}

Type genericSuper = SubClass.class.getGenericSuperclass(); // Lấy MyClass<String>
```

---

### 3. Lấy thông tin generic của superclass (`getGenericSuperclass()`).
```java
Class<?> clazz = SubClass.class;
Type genericSuper = clazz.getGenericSuperclass();
if (genericSuper instanceof ParameterizedType) {
    ParameterizedType pType = (ParameterizedType) genericSuper;
    Type[] actualTypes = pType.getActualTypeArguments(); // Lấy String
}
```

- Trả về `Type` của superclass, có thể là `ParameterizedType` nếu có generic.

---

### 4. Lấy generic parameter của method return type và parameter type.
- **Return type**:
  ```java
  Method method = MyClass.class.getDeclaredMethod("getList");
  Type returnType = method.getGenericReturnType();
  if (returnType instanceof ParameterizedType) {
      ParameterizedType pType = (ParameterizedType) returnType;
      Type[] actualTypes = pType.getActualTypeArguments();
  }
  ```
- **Parameter type**:
  ```java
  Method method = MyClass.class.getDeclaredMethod("setList", List.class);
  Type[] paramTypes = method.getGenericParameterTypes();
  if (paramTypes[0] instanceof ParameterizedType) {
      ParameterizedType pType = (ParameterizedType) paramTypes[0];
      Type[] actualTypes = pType.getActualTypeArguments();
  }
  ```

---

## 8) Dynamic Class Loading & Proxy

### 1. Cách load class khi chỉ biết tên ở runtime (`Class.forName`, `ClassLoader.loadClass`).
- **`Class.forName(String)`**:
    - Load class từ tên đầy đủ, mặc định khởi tạo class (chạy static block).
  ```java
  Class<?> clazz = Class.forName("com.example.MyClass");
  ```
- **`ClassLoader.loadClass(String)`**:
    - Load class nhưng không khởi tạo (không chạy static block).
  ```java
  ClassLoader cl = ClassLoader.getSystemClassLoader();
  Class<?> clazz = cl.loadClass("com.example.MyClass");
  ```

---

### 2. So sánh `Class.forName()` và `ClassLoader.loadClass()` về việc khởi tạo class.
- **`Class.forName()`**:
    - Load và **khởi tạo** class (chạy static block) theo mặc định.
    - Có thể tắt khởi tạo bằng `Class.forName(name, false, classLoader)`.
- **`ClassLoader.loadClass()`**:
    - Chỉ load class vào JVM, không khởi tạo (không chạy static block).
    - Phù hợp khi muốn trì hoãn khởi tạo.

**Ví dụ**:
```java
Class<?> c1 = Class.forName("MyClass"); // Load và init
Class<?> c2 = ClassLoader.getSystemClassLoader().loadClass("MyClass"); // Chỉ load
```

---

### 3. ⚠️ Gài: ClassLoader nào được dùng mặc định khi load class?
- Mặc định, JVM sử dụng **System ClassLoader** (`ClassLoader.getSystemClassLoader()`) để load class khi gọi `Class.forName()` hoặc code thông thường.
- Tuy nhiên, `Class.forName()` sử dụng **ClassLoader của class gọi nó** (caller’s ClassLoader) nếu không chỉ định ClassLoader cụ thể.
- Trong ứng dụng, có thể là **AppClassLoader** (cho application classes) hoặc **custom ClassLoader** nếu được cấu hình.

**Code ví dụ**:
```java
Class<?> clazz = Class.forName("MyClass"); // Dùng System ClassLoader
Class<?> clazz2 = Class.forName("MyClass", true, MyClass.class.getClassLoader()); // Chỉ định ClassLoader
```

---

### 4. Giới thiệu `java.lang.reflect.Proxy`: tạo dynamic proxy cho interface.
`java.lang.reflect.Proxy` cho phép tạo **dynamic proxy** tại runtime cho một hoặc nhiều interface. Proxy chuyển tiếp các lời gọi method đến `InvocationHandler`.

**Code ví dụ**:
```java
interface MyInterface {
    void doSomething();
}

InvocationHandler handler = (proxy, method, args) -> {
    System.out.println("Method invoked: " + method.getName());
    return null;
};

MyInterface proxy = (MyInterface) Proxy.newProxyInstance(
    MyInterface.class.getClassLoader(),
    new Class<?>[]{MyInterface.class},
    handler
);
proxy.doSomething(); // In ra: Method invoked: doSomething
```

---

### 5. Tình huống dùng dynamic proxy để implement cross-cutting concern (như logging, security).
**Dynamic proxy** thường được dùng trong:
- **Logging**: Ghi log trước/sau khi gọi method.
- **Security**: Kiểm tra quyền truy cập trước khi gọi method.
- **Transaction management**: Bọc method trong transaction (như Spring’s `@Transactional`).

**Ví dụ (Logging)**:
```java
InvocationHandler handler = (proxy, method, args) -> {
    System.out.println("Before: " + method.getName());
    Object result = method.invoke(target, args); // Gọi method gốc
    System.out.println("After: " + method.getName());
    return result;
};
```

**Ứng dụng thực tế**: Spring AOP dùng dynamic proxy để xử lý cross-cutting concern như logging, caching, hoặc transaction.

---

## 9) Hiệu năng & Bảo mật

### 1. Tại sao Reflection chậm hơn code thông thường? Cách giảm overhead (cache `Method`, `Field`).
**Tại sao chậm**:
- Reflection tra cứu metadata (field, method, constructor) tại runtime, thay vì dùng mã máy được tối ưu hóa bởi compiler.
- Kiểm tra quyền truy cập (access control) và `setAccessible(true)` gây thêm overhead.
- Không tận dụng được JIT compiler tối ưu hóa.

**Cách giảm overhead**:
- **Cache `Field`, `Method`, `Constructor`**:
    - Lưu trữ đối tượng `Field`/`Method` sau khi tra cứu để tái sử dụng, tránh gọi `getDeclaredField()`/`getDeclaredMethod()` nhiều lần.
  ```java
  private static final Field NAME_FIELD;
  static {
      NAME_FIELD = MyClass.class.getDeclaredField("name");
      NAME_FIELD.setAccessible(true);
  }
  ```
- **Sử dụng MethodHandle** (Java 7+): Nhanh hơn reflection truyền thống.
- **Tránh lặp lại reflection**: Chỉ dùng reflection khi cần thiết, chuyển sang code thông thường nếu có thể.

---

### 2. ⚠️ Gài: Vì sao `setAccessible(true)` bị hạn chế trong Java 9+ (module system)?
- Trong Java 9+, **module system** (JPMS) giới thiệu khái niệm **encapsulation mạnh** (strong encapsulation).
- Theo mặc định, package trong module không cho phép truy cập private field/method từ module khác qua reflection, trừ khi:
    - Package được khai báo `open` trong `module-info.java`.
    - Hoặc module gọi `--add-opens` khi chạy JVM.
- Nếu không, gọi `setAccessible(true)` sẽ ném `InaccessibleObjectException`.

**Ví dụ module-info.java**:
```java
module my.module {
    opens com.example to java.base; // Cho phép reflection từ java.base
}
```

---

### 3. Rủi ro bảo mật khi dùng Reflection (truy cập field private, phá encapsulation).
- **Phá encapsulation**: Truy cập private field/method, làm lộ dữ liệu nhạy cảm hoặc thay đổi trạng thái không mong muốn.
- **Tấn công injection**: Hacker có thể dùng reflection để gọi method hoặc thay đổi field nhạy cảm (như `SecurityManager`).
- **Khó kiểm soát**: Code reflection khó audit, dễ bị lạm dụng.

**Giảm thiểu**:
- Dùng `SecurityManager` để chặn reflection trái phép.
- Hạn chế sử dụng reflection trong code nhạy cảm.
- Sử dụng module system (Java 9+) để giới hạn truy cập.

---

### 4. Khi nào nên tránh dùng Reflection và thay bằng design pattern khác (Factory, ServiceLoader).
**Tránh Reflection khi**:
- **Hiệu năng quan trọng**: Reflection chậm, không phù hợp cho code chạy thường xuyên.
- **Code đơn giản**: Nếu có thể dùng code thông thường hoặc interface, không cần reflection.
- **Bảo mật cao**: Tránh rủi ro phá encapsulation hoặc lộ dữ liệu nhạy cảm.

**Thay thế**:
- **Factory Pattern**: Tạo instance dựa trên cấu hình mà không cần reflection.
  ```java
  MyInterface obj = Factory.create("type1"); // Thay vì Class.forName()
  ```
- **ServiceLoader** (Java 6+): Load implementation của interface dynamically.
  ```java
  ServiceLoader<MyInterface> loader = ServiceLoader.load(MyInterface.class);
  MyInterface impl = loader.iterator().next();
  ```
- **Dependency Injection**: Dùng framework như Spring để inject dependency thay vì reflection thủ công.

---

## 10) Mini Case (thực chiến)

### 1. Viết code đọc tất cả field và giá trị của một object bất kỳ thành chuỗi JSON-like.
```java
public String toJsonLike(Object obj) throws IllegalAccessException {
    StringBuilder sb = new StringBuilder("{");
    Field[] fields = obj.getClass().getDeclaredFields();
    for (int i = 0; i < fields.length; i++) {
        Field field = fields[i];
        field.setAccessible(true);
        sb.append("\"").append(field.getName()).append("\": ");
        Object value = field.get(obj);
        sb.append(value == null ? "null" : "\"" + value + "\"");
        if (i < fields.length - 1) sb.append(", ");
    }
    sb.append("}");
    return sb.toString();
}
```

---

### 2. Gọi tất cả method annotated với `@Init` trên một class bằng reflection.
```java
@Retention(RetentionPolicy.RUNTIME)
@interface Init {}

public void callInitMethods(Object obj) throws IllegalAccessException, InvocationTargetException {
    for (Method method : obj.getClass().getDeclaredMethods()) {
        if (method.isAnnotationPresent(Init.class)) {
            method.setAccessible(true);
            method.invoke(obj);
        }
    }
}
```

---

### 3. Nạp class plugin từ tên trong file cấu hình và gọi `execute()`.
```java
public void loadAndExecutePlugin(String className) throws Exception {
    Class<?> clazz = Class.forName(className);
    Object plugin = clazz.getDeclaredConstructor().newInstance();
    Method execute = clazz.getDeclaredMethod("execute");
    execute.invoke(plugin);
}
```

---

### 4. Implement `toString()` chung cho nhiều class mà không phải viết tay từng field (dùng reflection).
```java
@Override
public String toString() {
    StringBuilder sb = new StringBuilder(getClass().getSimpleName()).append("[");
    try {
        Field[] fields = getClass().getDeclaredFields();
        for (int i = 0; i < fields.length; i++) {
            Field field = fields[i];
            field.setAccessible(true);
            sb.append(field.getName()).append("=").append(field.get(this));
            if (i < fields.length - 1) sb.append(", ");
        }
    } catch (IllegalAccessException e) {
        e.printStackTrace();
    }
    return sb.append("]").toString();
}
```

---

### 5. Phân tích một annotation `@Entity` để tự động tạo câu lệnh SQL CREATE TABLE.
```java
@Retention(RetentionPolicy.RUNTIME)
@interface Entity {
    String tableName();
}

@Retention(RetentionPolicy.RUNTIME)
@interface Column {
    String name();
    String type();
}

public String generateCreateTable(Class<?> clazz) {
    Entity entity = clazz.getAnnotation(Entity.class);
    if (entity == null) return null;

    StringBuilder sql = new StringBuilder("CREATE TABLE ").append(entity.tableName()).append(" (");
    Field[] fields = clazz.getDeclaredFields();
    for (int i = 0; i < fields.length; i++) {
        Column col = fields[i].getAnnotation(Column.class);
        if (col != null) {
            sql.append(col.name()).append(" ").append(col.type());
            if (i < fields.length - 1) sql.append(", ");
        }
    }
    sql.append(");");
    return sql.toString();
}
```

---

### 6. Viết tool in ra cấu trúc class (field, method, constructor) như lệnh `javap`.
```java
public void printClassStructure(Class<?> clazz) {
    System.out.println("Class: " + clazz.getName());
    System.out.println("Modifiers: " + Modifier.toString(clazz.getModifiers()));
    System.out.println("Superclass: " + clazz.getSuperclass().getName());
    System.out.println("Interfaces: " + Arrays.toString(clazz.getInterfaces()));

    System.out.println("\nConstructors:");
    for (Constructor<?> c : clazz.getDeclaredConstructors()) {
        System.out.println(Modifier.toString(c.getModifiers()) + " " + c.getName() + Arrays.toString(c.getParameterTypes()));
    }

    System.out.println("\nFields:");
    for (Field f : clazz.getDeclaredFields()) {
        System.out.println(Modifier.toString(f.getModifiers()) + " " + f.getType().getSimpleName() + " " + f.getName());
    }

    System.out.println("\nMethods:");
    for (Method m : clazz.getDeclaredMethods()) {
        System.out.println(Modifier.toString(m.getModifiers()) + " " + m.getReturnType().getSimpleName() + " " + m.getName() + Arrays.toString(m.getParameterTypes()));
    }
}
```

---

