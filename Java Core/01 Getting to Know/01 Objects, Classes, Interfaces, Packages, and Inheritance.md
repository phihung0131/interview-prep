## 1) Object & Class — nền tảng

1. “Mọi thứ trong Java đều là object” — đúng đến mức nào? Liệt kê ngoại lệ.
2. Vai trò của lớp `Object`. Kể các phương thức cốt lõi và ý nghĩa (equals, hashCode, toString, clone, finalize, getClass, wait/notify…).
3. Trình bày khác biệt **class** vs **object/instance**; khái niệm **state/behavior/identity**.
4. Trường (field) vs thuộc tính (property) — trong Java chuẩn có “property” như các ngôn ngữ khác không?
5. ⚠️ Gài: `final` trên **biến tham chiếu** có bất biến (immutable) đối tượng không? Nêu ví dụ phản chứng.

## 2) Khởi tạo & vòng đời đối tượng

1. Thứ tự khởi tạo: static field → static initializer → instance field → instance initializer → constructor — sắp xếp đúng thứ tự và giải thích.
2. Constructor mặc định được cấp khi nào? Khi khai báo **bất kỳ** constructor khác thì chuyện gì xảy ra?
3. Gọi `this(...)` vs `super(...)` trong constructor: quy tắc và thứ tự bắt buộc.
4. ⚠️ Gài: Dùng field được **override** trong constructor của lớp cha có an toàn không? Vì sao có thể dẫn tới hành vi bất ngờ.
5. Sự khác nhau giữa **initializer block** và gán trực tiếp vào field.

## 3) Bao đóng & phạm vi truy cập

1. So sánh `public`, `protected`, `default` (package-private), `private` trên **class**, **field**, **method**, **constructor**.
2. Khi nào dùng **encapsulation** để bảo vệ bất biến? Mẫu getter/setter “an toàn” với collection/array.
3. ⚠️ Gài: `protected` truy cập được từ đâu khi **khác package**? (qua subclass nhưng quy tắc cụ thể).
4. Inner class, static nested class, local class, anonymous class — khác nhau và use-case.
5. Ảnh hưởng của **shadowing/hiding** tên biến/field trong inner class.

## 4) equals, hashCode, toString, clone & bất biến

1. Hợp đồng (contract) của `equals()` và `hashCode()`; liên hệ với cấu trúc dữ liệu băm.
2. Thiết kế `equals()` cho entity có id sinh sau (late-assigned) — rủi ro gì?
3. Viết `toString()` hữu ích: nên/không nên in thông tin gì (bảo mật, PII).
4. `clone()` & `Cloneable`: deep vs shallow clone; tại sao thường khuyến nghị **tránh** clone?
5. ⚠️ Gài: Hai object `equal` có bắt buộc `==` trả true không? Và ngược lại?
6. Nguyên tắc xây dựng **immutable class** (final, defensive copy, không expose mutable internals).

## 5) Overloading vs Overriding & đa hình (polymorphism)

1. Overloading khác Overriding thế nào về thời điểm chọn phương thức (compile-time vs run-time)?
2. **Dynamic dispatch** hoạt động ra sao khi gọi method qua tham chiếu kiểu cha.
3. Covariant return type là gì? Quy tắc khi override.
4. Quy tắc khi override method ném checked exceptions: “mở rộng” hay “thu hẹp” được?
5. ⚠️ Gài: Overload theo **boxed vs primitive** và **varargs** — trình tự phân giải (resolution) ưu tiên.

## 6) Abstract classes vs Interfaces

1. Khi nào chọn abstract class, khi nào chọn interface? Nêu tiêu chí thiết kế.
2. Interface có thể chứa gì từ Java 8+ (default, static methods; từ Java 9 có private methods).
3. ⚠️ Gài: “Interface không có state.” — Nhận định này sai ở đâu (hằng số static final, field public static final).
4. Multiple inheritance qua **default methods**: xung đột kim cương giải quyết bằng quy tắc nào?
5. Marker interface (vd: `Serializable`) có ý nghĩa gì; khác annotation ở chỗ nào?

## 7) Packages & tổ chức mã nguồn

1. Mục đích của **package** (tổ chức, tránh va chạm tên, kiểm soát truy cập).
2. Quy tắc đặt tên package (lowercase, domain đảo ngược). Vì sao **subpackage** không thừa kế quyền truy cập của package cha?
3. `import` có nạp class không? Sự khác nhau `import a.*` vs import tường minh.
4. ⚠️ Gài: Hai class **cùng tên** khác package được import đồng thời — tham chiếu tên rút gọn sẽ trỏ tới đâu?
5. Ảnh hưởng của package tới **serialization** và **reflection** (tên đủ định danh FQCN).

## 8) Kế thừa (Inheritance) — chi tiết

1. Hiding field vs overriding method — khác nhau và vì sao hiding dễ gây nhầm.
2. `final` trên class và method: khi nào dùng để khóa hành vi; bất lợi tiềm ẩn.
3. Gọi `super.method()` trong override để mở rộng thay vì thay thế hoàn toàn: tiêu chí và cạm bẫy.
4. ⚠️ Gài: Static method có **override** được không? Sự thật về **method hiding** với static.
5. Composition over inheritance: khi nào nên **thay thế** kế thừa bằng ủy quyền (delegation).

## 9) Generics & kế thừa

1. Tính **invariance** của generics: vì sao `List<Object>` không nhận `List<String>`?
2. Wildcards: `? extends T` vs `? super T` (PECS) — áp dụng trong API collections.
3. ⚠️ Gài: Bridge methods là gì? Vì sao xuất hiện khi override method generic.
4. Type erasure ảnh hưởng gì đến overload/override và phản chiếu (reflection).

## 10) Giao diện đặc biệt & tính năng hiện đại (tuỳ lớp Java)

1. `record` (Java 16+) — có kế thừa class khác được không? Có thể implement interface không?
2. `sealed` classes/interfaces (Java 17+): mục đích, cú pháp `permits`, ảnh hưởng thiết kế kế thừa.
3. ⚠️ Gài: Dùng `sealed` để mô hình **closed hierarchy** khác gì pattern “enum pattern” trước đây?

## 11) Ngoại lệ & kế thừa

1. Checked vs unchecked exceptions — quy tắc khi **override** method có throws.
2. Tổ chức hierarchy exception domain-specific; lợi ích khi bắt ở mức cha.
3. ⚠️ Gài: Bắt `Exception` hoặc `Throwable` ở tầng dưới có thể phá vỡ hợp đồng override như thế nào?

## 12) Mini case (thực chiến — 2–5 phút/câu)

1. Một class `Money` cần bất biến: thiết kế field, constructor, defensive copy, equals/hashCode, toString.
2. Giải quyết xung đột default methods: interface `A.log()`, `B.log()` và class `C implements A,B`. Chỉ ra cách chọn triển khai.
3. Thay thế kế thừa `class Stack extends Vector` bằng composition: phác thảo API và ủy quyền cần thiết.
4. Thiết kế `User` entity có id gán sau (persist mới có id): viết equals/hashCode an toàn theo giai đoạn vòng đời.
5. Hai lớp `Parent` có method `f()` và `Child` override `f()` ném ít checked exceptions hơn: minh họa chữ ký hợp lệ.
6. Hai class trùng tên khác package được dùng chung file: trình bày cách `import`/FQCN để tránh nhập nhằng.
