## 1) Khái niệm & Tổng quan

1. Java Reflection là gì? Cho ví dụ thực tế khi cần dùng reflection.
2. ⚠️ Gài: Reflection có cho phép thao tác với **private field/method** không? Điều kiện để truy cập là gì?
3. Ưu điểm và nhược điểm của việc dùng Reflection.
4. So sánh Reflection với **compile-time type checking** — khác biệt và rủi ro.
5. Reflection API thuộc package nào trong Java? (`java.lang.reflect`, `java.lang.Class`)
6. ⚠️ Gài: Reflection có phá vỡ nguyên tắc **encapsulation** không? Tại sao?

---

## 2) Class Metadata & `Class` Object

1. Cách lấy đối tượng `Class<?>` từ tên class (`.class`, `obj.getClass()`, `Class.forName()`).
2. `Class.forName()` khác gì với `.class` và `getClass()` về việc load & init class.
3. Lấy thông tin modifiers (public, abstract, final) của một class bằng reflection như thế nào?
4. ⚠️ Gài: Lấy superclass và interfaces từ một class qua reflection. Khi class implement nhiều interface, thứ tự trả về có cố định không?
5. Cách kiểm tra một class có phải là interface, enum, annotation, array hay primitive qua reflection.
6. Lấy thông tin annotation gắn trên class (runtime-retention).

---

## 3) Constructors

1. Cách lấy danh sách tất cả constructor của một class (`getConstructors()`, `getDeclaredConstructors()`).
2. Khác biệt giữa `getConstructors()` và `getDeclaredConstructors()` — phạm vi truy cập.
3. ⚠️ Gài: Dùng reflection tạo instance của class qua constructor private có được không? Cần làm gì?
4. Cách truyền tham số vào constructor khi tạo đối tượng bằng reflection.
5. Exception thường gặp khi tạo đối tượng bằng constructor không hợp lệ (`InvocationTargetException`, `InstantiationException`).

---

## 4) Fields

1. Cách lấy danh sách field (`getFields()`, `getDeclaredFields()`), khác biệt giữa chúng.
2. Truy cập và thay đổi giá trị field (kể cả private) bằng reflection.
3. ⚠️ Gài: Khi sửa giá trị field `final static` bằng reflection, chuyện gì xảy ra? JVM có luôn dùng giá trị mới không?
4. Kiểm tra kiểu dữ liệu (type) của field.
5. Lấy và xử lý annotation gắn trên field.

---

## 5) Methods

1. Lấy danh sách method (`getMethods()`, `getDeclaredMethods()`), khác nhau thế nào?
2. Gọi method qua reflection (`invoke()`), truyền tham số như thế nào?
3. ⚠️ Gài: Khi gọi method private qua reflection, cần xử lý `setAccessible(true)` ở đâu?
4. Phân biệt `IllegalAccessException` và `InvocationTargetException` khi gọi method.
5. Lấy generic parameter type của method qua reflection.
6. Lấy annotation trên method và xử lý.

---

## 6) Annotations & Reflection

1. Cách kiểm tra một class/method/field có annotation nhất định không.
2. Lấy giá trị thuộc tính (element) của annotation.
3. ⚠️ Gài: Annotation có `RetentionPolicy.CLASS` hay `SOURCE` có lấy được qua reflection không?
4. Tạo một annotation custom và đọc giá trị của nó bằng reflection.

---

## 7) Generic Type & Reflection

1. Lấy thông tin generic type của field (`ParameterizedType`).
2. ⚠️ Gài: Do **type erasure**, khi nào generic type bị mất thông tin và không lấy được qua reflection?
3. Lấy thông tin generic của superclass (`getGenericSuperclass()`).
4. Lấy generic parameter của method return type và parameter type.

---

## 8) Dynamic Class Loading & Proxy

1. Cách load class khi chỉ biết tên ở runtime (`Class.forName`, `ClassLoader.loadClass`).
2. So sánh `Class.forName()` và `ClassLoader.loadClass()` về việc khởi tạo class.
3. ⚠️ Gài: ClassLoader nào được dùng mặc định khi load class?
4. Giới thiệu `java.lang.reflect.Proxy`: tạo dynamic proxy cho interface.
5. Tình huống dùng dynamic proxy để implement cross-cutting concern (như logging, security).

---

## 9) Hiệu năng & Bảo mật

1. Tại sao Reflection chậm hơn code thông thường? Cách giảm overhead (cache `Method`, `Field`).
2. ⚠️ Gài: Vì sao `setAccessible(true)` bị hạn chế trong Java 9+ (module system)?
3. Rủi ro bảo mật khi dùng Reflection (truy cập field private, phá encapsulation).
4. Khi nào nên tránh dùng Reflection và thay bằng design pattern khác (Factory, ServiceLoader).

---

## 10) Mini Case (thực chiến)

1. Viết code đọc tất cả field và giá trị của một object bất kỳ thành chuỗi JSON-like.
2. Gọi tất cả method annotated với `@Init` trên một class bằng reflection.
3. Nạp class plugin từ tên trong file cấu hình và tạo instance để gọi `execute()`.
4. Implement `toString()` chung cho nhiều class mà không phải viết tay từng field (dùng reflection).
5. Phân tích một annotation `@Entity` để tự động tạo câu lệnh SQL CREATE TABLE.
6. Viết tool in ra cấu trúc class (field, method, constructor) như lệnh `javap`.

