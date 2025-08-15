## 1) Khái niệm & Tổng quan

1. Method Handle là gì? Khác gì với Reflection (`Method`/`Field`) trong Java?
2. Ưu điểm của Method Handle về hiệu năng so với Reflection.
3. ⚠️ Gài: Method Handle được giới thiệu từ Java phiên bản nào và lý do ra đời?
4. So sánh Method Handle với **lambda expressions** và **functional interfaces** về mục tiêu sử dụng.
5. Method Handle thuộc package nào? (`java.lang.invoke`).
6. Liên hệ Method Handle với JVM invokedynamic bytecode instruction.

---

## 2) `MethodHandles.Lookup`

1. Vai trò của `MethodHandles.Lookup` trong việc tạo Method Handle.
2. Cách lấy đối tượng `Lookup` mặc định (`MethodHandles.lookup()`).
3. ⚠️ Gài: Sự khác nhau giữa `lookup()`, `publicLookup()` và `privateLookupIn()` về quyền truy cập.
4. Lookup object có giới hạn phạm vi truy cập method/field như thế nào?
5. Khi nào cần dùng `privateLookupIn()` để truy cập private member của class khác.

---

## 3) Tạo Method Handle

1. Cách tạo Method Handle cho method instance (`findVirtual`) và method static (`findStatic`).
2. Cách tạo Method Handle cho constructor (`findConstructor`).
3. ⚠️ Gài: Khi dùng `findVirtual` cho method static hoặc `findStatic` cho method instance thì chuyện gì xảy ra?
4. Cách tạo Method Handle cho field getter (`findGetter`, `findStaticGetter`) và setter (`findSetter`, `findStaticSetter`).
5. `findSpecial` dùng khi nào? Liên quan gì đến gọi method của superclass.
6. Method Handle có thể tạo cho phương thức private không? Điều kiện.

---

## 4) `MethodType`

1. `MethodType` là gì? Vì sao Method Handle cần `MethodType` khi tìm method.
2. Cách tạo `MethodType` cho method có nhiều tham số và kiểu trả về.
3. ⚠️ Gài: Nếu `MethodType` không khớp chính xác với method thực tế thì chuyện gì xảy ra?
4. `MethodType` có bất biến không (immutable)?
5. Cách lấy `MethodType` từ một Method Handle đã có (`type()` method).

---

## 5) Gọi Method Handle

1. `invokeExact()` vs `invoke()` khác nhau thế nào về kiểm tra kiểu dữ liệu.
2. ⚠️ Gài: Vì sao `invokeExact()` yêu cầu kiểu tham số khớp tuyệt đối với `MethodType`?
3. Khi nào nên dùng `invoke()` thay cho `invokeExact()`.
4. Sử dụng Method Handle để gọi method với tham số biến đổi (`varargs`).
5. Sự khác biệt giữa gọi trực tiếp method thông qua Method Handle và gọi qua Reflection về hiệu năng.

---

## 6) Chuyển đổi & Kết hợp Method Handle

1. `bindTo()` dùng để làm gì? Khi nào cần bind instance vào Method Handle.
2. ⚠️ Gài: Khi `bindTo()` thì Method Handle mới có còn yêu cầu tham số instance không?
3. Chuyển đổi Method Handle để đổi kiểu tham số (`asType`).
4. Tạo Method Handle mới từ method gốc bằng cách chèn thêm tham số (`insertArguments`) hoặc bỏ bớt (`dropArguments`).
5. Kết hợp Method Handle với `filterArguments`, `filterReturnValue` để xử lý trước/sau khi gọi method gốc.
6. Dùng `permuteArguments` để đổi thứ tự tham số.

---

## 7) Method Handles & Lambda Metafactory

1. `LambdaMetafactory` là gì? Vai trò trong việc tạo lambda runtime từ Method Handle.
2. ⚠️ Gài: Sự khác nhau giữa lambda được compile sẵn và lambda tạo từ `LambdaMetafactory`.
3. Tại sao dùng `LambdaMetafactory` có thể cho hiệu năng tương đương method call bình thường.
4. Ứng dụng tạo implementation của functional interface từ Method Handle.

---

## 8) Ứng dụng thực tế

1. Dùng Method Handle để gọi method private trong class cho mục đích testing/debug.
2. Dùng Method Handle để thay thế Reflection trong framework để tăng hiệu năng.
3. Tạo dynamic proxy hoặc event handler bằng Method Handle thay cho `InvocationHandler`.
4. ⚠️ Gài: Vì sao nhiều thư viện serialization/deserialization (Jackson, Gson) dùng Method Handle thay cho Reflection.
5. Tích hợp Method Handle để implement dependency injection framework nhỏ gọn.

---

## 9) Hiệu năng & Bảo mật

1. Vì sao Method Handle nhanh hơn Reflection sau lần gọi đầu? Liên quan đến JIT inline.
2. ⚠️ Gài: Trong Java 9+, việc truy cập private member qua Method Handle bị hạn chế bởi module system như thế nào?
3. Cách cache Method Handle để giảm chi phí tạo mới nhiều lần.
4. Rủi ro bảo mật khi mở quyền truy cập qua `Lookup` cho class bên ngoài.

---

## 10) Mini Case (thực chiến)

1. Viết code lấy Method Handle cho method `String.substring(int, int)` và gọi nó.
2. Tạo Method Handle cho constructor của `ArrayList` và tạo đối tượng.
3. Bind Method Handle cho instance cụ thể và gọi method instance không có tham số.
4. Tạo Method Handle cho field getter và setter, thay đổi giá trị field private.
5. Sử dụng `insertArguments` để tạo Method Handle cố định giá trị tham số đầu tiên của method cộng hai số.
6. Tạo một lambda `Runnable` runtime từ Method Handle trỏ tới method `System.out::println`.

