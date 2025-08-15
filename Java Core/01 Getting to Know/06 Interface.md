## 1) Khái niệm & cú pháp cơ bản

1. Interface là gì? Khác gì so với **class trừu tượng** ở mục tiêu thiết kế và khả năng kế thừa?
2. Quy tắc khai báo interface (top-level vs nested). Tên file, package, visibility.
3. ⚠️ Gài: Interface có “trạng thái” (state) không? Nếu có thì là kiểu gì và giới hạn ra sao?
4. Một class “implements” nhiều interface được không? Trình bày ưu/nhược so với kế thừa lớp duy nhất.
5. Sự khác nhau giữa **implements** và **extends** (interface có thể `extends` nhiều interface).

## 2) Thành phần trong interface (fields & members)

1. Mặc định field trong interface có modifiers gì (visibility, static, final)?
2. ⚠️ Gài: Vì sao thay đổi giá trị hằng số trong interface có thể **không** ảnh hưởng tới code đã biên dịch khác module? (inlining & binary compatibility)
3. Interface có thể chứa **nested types** không (class/interface/enum)? Modifiers mặc định là gì?
4. Interface có được phép có **initializer blocks** hay constructor không? Vì sao?

## 3) Methods trong interface

1. `abstract` method mặc định là `public` — có thể hạ xuống `protected`/`private` không?
2. `default` method là gì? Dùng để làm gì trong việc **evolve API**?
3. `static` method trong interface khác gì `default` method về cách gọi và thừa kế?
4. Từ Java 9: `private` method trong interface dùng lúc nào và vì sao hữu ích?
5. ⚠️ Gài: Có thể khai báo `synchronized`/`final`/`native` cho method trong interface không? Lý do.

## 4) Default methods & quy tắc phân giải xung đột

1. Khi một class implements **hai** interface có default method trùng chữ ký, chuyện gì xảy ra? Cách giải xung đột (override + `A.super.m()`).
2. Quy tắc “**class wins**” và “**more specific interface wins**” là gì? Ví dụ minh họa.
3. ⚠️ Gài: Default method có thể “override” các method từ `Object` (equals/hashCode/toString) không? Hành vi thực tế thế nào?
4. Ảnh hưởng của default method tới **binary compatibility** khi thêm method mới vào interface công khai.

## 5) Functional Interface & Lambda

1. Functional interface là gì (SAM type)? Vai trò của `@FunctionalInterface`.
2. ⚠️ Gài: Vì sao các method từ `Object` **không tính** vào số lượng abstract methods của functional interface?
3. Một functional interface có thể chứa **default** và **static** methods không? Ảnh hưởng tới “độ đơn” SAM?
4. Ví dụ các functional interfaces chuẩn: `Runnable`, `Callable`, `Supplier`, `Function`, `Consumer`, `Predicate`, `Comparator`.
5. Phân biệt lambda, method reference, anonymous class khi gán cho functional interface (khác biệt về captured variables & overhead).

## 6) Kế thừa interface & đa thừa

1. Interface có thể `extends` nhiều interface khác — quy tắc khi trùng **constant**/method signature.
2. Trường hợp **diamond** giữa nhiều cấp interface: trình bày cách compiler phân giải.
3. ⚠️ Gài: Hai super-interface khai báo **method abstract** trùng chữ ký nhưng khác `throws` — hợp lệ không?
4. Sub-interface có thể **hẹp** kiểu trả về (covariant return type) cho method kế thừa không?

## 7) Generics với interface

1. Khai báo **generic interface** (`interface Repo<T>`). Ưu/nhược so với generic class.
2. ⚠️ Gài: **Type erasure** ảnh hưởng gì tới overload/bridge methods khi implement generic interface?
3. Bất biến, `? extends`, `? super` trong ngữ cảnh method của interface — áp dụng quy tắc **PECS**.
4. Raw types với interface generic: rủi ro và cảnh báo unchecked.

## 8) Exceptions & hợp đồng phương thức

1. Interface method có thể khai báo `throws` checked exceptions: lớp triển khai được **nới rộng** hay **thu hẹp** `throws`?
2. ⚠️ Gài: Default method ném checked exception—class implement **không** khai báo gì thêm có compile được không?
3. Tài liệu hoá (Javadoc) về exceptions ở interface vs ở lớp triển khai — best practice.

## 9) Sealed interfaces (Java 17+)

1. Sealed interface là gì? Cú pháp `sealed interface X permits A, B`.
2. ⚠️ Gài: Khác nhau giữa `sealed`/`non-sealed`/`final` đối với **hệ phân cấp đóng**.
3. Lợi ích của sealed đối với **pattern matching** trong `switch` và exhaustiveness checking.

## 10) Interface vs Abstract Class — so sánh sâu

1. Khi nào chọn interface thay vì abstract class? Tiêu chí: đa thừa vs chia sẻ state.
2. ⚠️ Gài: Có thể mô phỏng **đa kế thừa hành vi** bằng interface + default methods, nhưng có nhược điểm gì (độ phức tạp, mùi thiết kế)?
3. Giao diện **SPI/API**: dùng interface để đảo ngược phụ thuộc (DIP) như thế nào?

## 11) Marker Interface & so sánh với Annotation

1. Marker interface là gì (vd: `Serializable`, `Cloneable`)? Giá trị của nó trong **type system**.
2. ⚠️ Gài: Khi nào **annotation** là lựa chọn tốt hơn marker interface và ngược lại?
3. Ảnh hưởng tới `instanceof`, generic bounds và toolchain (framework, runtime checks).

## 12) Khởi tạo interface & class loading

1. Khi nào **khởi tạo** interface diễn ra? Truy cập **compile-time constant** có kích hoạt khởi tạo không?
2. ⚠️ Gài: Constant trong interface được **inline** vào bytecode — hệ quả khi đổi giá trị ở thư viện nhưng không recompile client.

## 13) Thiết kế API dựa trên interface

1. Tách **interface** (hợp đồng) và **implementation** để giảm coupling như thế nào?
2. **ISP** (Interface Segregation Principle): chia nhỏ interface để tránh “fat interface”.
3. ⚠️ Gài: Lạm dụng interface “cho mọi thứ” có mùi gì? Khi nào class cụ thể là đủ?
4. Versioning & compatibility: chiến lược thêm method mới (default), thêm constant, đổi tên method.

## 14) Logging, equals/hashCode & toString trong interface

1. Có nên đặt **hằng số** logger (`Logger`) trong interface rồi **implements** để “thừa kế” logger? Ưu/nhược?
2. ⚠️ Gài: Đặt `equals/hashCode/toString` dạng **default** trong interface liệu có tác dụng? Tác động tới lớp triển khai?
3. Tổ chức **utility static methods** trong interface vs trong class `final` utility (ví dụ `Comparator`, `Map` có static factory).

## 15) Mini case (thực chiến 2–5 phút/câu)

1. Thiết kế **PricingStrategy** (interface) với 3 biến thể: `Flat`, `Tiered`, `Promo` — xử lý xung đột default method tính thuế.
2. Refactor một API “God interface” 15 method thành 3 interface nhỏ theo **ISP**.
3. Xử lý xung đột default: `Auditable.log()` và `Traceable.log()` trùng chữ ký; viết lớp `Service` giải quyết bằng `A.super.log()`.
4. Tạo `@FunctionalInterface` `RetryPolicy<T>` + ví dụ lambda/method reference; thảo luận checked exception.
5. Dùng **sealed interface** cho phân hệ `Event` (`UserCreated`, `OrderPlaced`). Viết `switch` exhaustiveness.
6. Minh hoạ lỗi binary-compat: app A dùng `Config.MAX = 10` từ interface của lib B; đổi `MAX=20` ở B nhưng không recompile A — kết quả gì?
