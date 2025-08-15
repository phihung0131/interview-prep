## 1) Khái niệm nền tảng

1. Phân biệt **class** và **object/instance**; ba trụ cột: state, behavior, identity.
2. Một object được mô tả bởi những thành phần nào trong Java (fields, methods, constructor, …)?
3. ⚠️ Gài: “Mọi thứ trong Java đều là object.” — Sai ở đâu? Nêu ngoại lệ.
4. Vai trò của `java.lang.Object` trong hệ phân cấp lớp.
5. Sơ đồ UML lớp → chuyển thành code Java cần những gì (visibility, fields, methods, relationships)?

## 2) Khai báo lớp & modifiers

1. Các **class modifiers** hợp lệ: `public`, `abstract`, `final`, (tùy JDK: `sealed`, `non-sealed`) — ý nghĩa, khi nào dùng.
2. Khác biệt **top-level class** vs **nested class** (static/non-static).
3. Quy tắc **một file .java** chứa nhiều lớp: lớp nào phải trùng tên file, vì sao.
4. ⚠️ Gài: Lớp **package-private** được khai báo như thế nào? Ảnh hưởng tới truy cập giữa packages?

## 3) Trường (fields) & phương thức (methods)

1. So sánh **instance field/method** và **static field/method**: khi nào dùng mỗi loại.
2. Quy ước **constant** (`public static final`) và khác biệt với field thường.
3. Overloading method: tiêu chí phân giải (tham số, varargs, autoboxing).
4. ⚠️ Gài: Hai overload `foo(int)` và `foo(Integer)` — truyền `null` gọi cái nào? Tại sao có thể gây lỗi compile.
5. Ảnh hưởng của **access modifiers** (`public/protected/default/private`) trên fields/methods.

## 4) Khởi tạo & thứ tự thực thi

1. Thứ tự khởi tạo chính xác: **static fields → static init blocks → instance fields → instance init blocks → constructor**.
2. Vai trò **instance initializer block** so với gán trực tiếp vào field.
3. ⚠️ Gài: Gọi method **override** từ constructor của lớp cha có rủi ro gì?
4. Khi nào “default constructor” được tạo tự động? Khi nào **không**?
5. Sự khác nhau giữa `this()` và `super()` trong constructor; quy tắc bắt buộc ở dòng đầu.

## 5) `this` & `super`

1. `this` được dùng để làm gì (truy cập field, gọi constructor, truyền reference chính nó)?
2. `super` dùng khi nào (gọi method/constructor của lớp cha).
3. ⚠️ Gài: Truy cập field bị **hidden** ở lớp con bằng cú pháp nào? Có thể “override” field không?
4. Trả về `this` để hỗ trợ **method chaining**: lợi/hại.

## 6) Static chi tiết

1. `static` initializer chạy khi nào? Khi nào một lớp được **initialize** (class initialization triggers).
2. ⚠️ Gài: Thứ tự khởi tạo giữa **static fields** phụ thuộc lẫn nhau trong cùng lớp — rủi ro nào?
3. Mẫu **Singleton**: các biến thể (eager, lazy holder, enum). Ưu/nhược mỗi biến thể.
4. `static import` dùng khi nào nên/không nên.

## 7) Lớp lồng nhau & nội bộ

1. Phân biệt **static nested class** vs **inner class**; hệ quả đến việc nắm giữ tham chiếu outer.
2. Local class & anonymous class: use case và giới hạn.
3. ⚠️ Gài: Biến bên ngoài bắt buộc **effectively final** trong inner/anonymous class là gì, vì sao.
4. Truy cập `OuterClass.this` trong inner class làm gì; rủi ro memory leak?

## 8) Bao đóng (encapsulation) & “properties”

1. Nguyên tắc encapsulation: bảo vệ bất biến; khi nào dùng **defensive copy** với `Date`, arrays, collections.
2. Quy ước **JavaBean** getter/setter; tác động tới các thư viện (ORM, JSON).
3. ⚠️ Gài: Setter cho collection nên gán trực tiếp hay copy/unwrap? Vì sao.
4. Thiết kế **read-only view** cho dữ liệu nội bộ (unmodifiable wrappers).

## 9) Bất biến (immutability) & bản sao (copy)

1. Yêu cầu tối thiểu để xây dựng một lớp **immutable** (final, không lộ tham chiếu mutable, copy phòng thủ…).
2. Copy constructor vs factory `of(...)`: khi nào nên dùng.
3. ⚠️ Gài: `final` trên **biến tham chiếu** có biến object thành immutable không?
4. Deep copy vs shallow copy — ví dụ minh hoạ.

## 10) `equals`, `hashCode`, `toString`, `compareTo`

1. **Hợp đồng** của `equals()`/`hashCode()` và hệ quả với `HashMap`/`HashSet`.
2. Thiết kế `equals()` an toàn với entity có id gán sau (transient → persistent).
3. `compareTo()` (Comparable) vs `Comparator` — tính **consistent with equals** là gì.
4. ⚠️ Gài: Hai đối tượng `equal` có bắt buộc cùng `hashCode` không? Ngược lại thì sao?
5. Viết `toString()` hữu ích: ẩn thông tin nhạy cảm, cân bằng độ dài.

## 11) `clone()` & `Cloneable` (và vì sao hay tránh)

1. Cơ chế `clone()` mặc định, yêu cầu triển khai `Cloneable`.
2. Deep vs shallow clone; tại sao nhiều guideline khuyên **tránh** clone (thay bằng copy constructor).
3. ⚠️ Gài: Gọi `super.clone()` khi **không** implements `Cloneable` sẽ thế nào?

## 12) Vòng đời object, dọn dẹp tài nguyên

1. Garbage Collection ảnh hưởng gì tới vòng đời object (không xác định thời điểm hủy).
2. `finalize()` (đã bị loại bỏ/ddeprecated): vì sao không nên dùng.
3. ⚠️ Gài: Nếu cần dọn tài nguyên (socket, stream), dùng cơ chế nào đúng chuẩn? (gợi ý: `try-with-resources`, `AutoCloseable`).
4. `Cleaner` là gì (thay thế finalize) và khi nào cân nhắc.

## 13) Đa hình & ràng buộc khi kế thừa (liên quan lớp)

1. Overriding vs overloading: quyết định tại **runtime** hay **compile-time**.
2. Covariant return type khi override: quy tắc.
3. ⚠️ Gài: Rules khi override method có `throws` checked exceptions (thu hẹp/mở rộng?).
4. Ủy quyền (delegation) & composition over inheritance: khi nào nên ưu tiên.

## 14) Generics trên lớp & phương thức

1. Khai báo lớp generic, method generic; khi nào nên đặt generic ở method thay vì class.
2. ⚠️ Gài: **Type erasure** ảnh hưởng gì đến overload và kiểm tra kiểu lúc runtime (`instanceof`)?
3. Ràng buộc `<T extends …>` và `<T super …>` trong khai báo API.

## 15) Tham chiếu, truyền tham số & object identity

1. Java **pass-by-value**: truyền đối tượng như thế nào (copy tham chiếu).
2. ⚠️ Gài: Đổi tham chiếu trong method có làm thay đổi biến bên ngoài không? Khác với mutate object bên trong.
3. Phân biệt `==` và `equals()` cho reference types.

---

## 16) Mini case (thực chiến 2–5 phút/câu)

1. Thiết kế lớp **immutable `Money`** (currency, amount): nêu fields, constructor, validate, equals/hashCode, toString, defensive copy nếu cần.
2. Refactor một lớp có **nhiều constructor** chồng chéo sang **builder pattern**: tiêu chí và lợi ích.
3. Một entity `User` có `roles: List<Role>`: viết getter/setter an toàn để không rò rỉ cấu trúc nội bộ.
4. Khắc phục `equals()` sai khiến `HashSet` chứa trùng phần tử: quy trình kiểm tra và sửa.
5. Tạo **inner class** xử lý sự kiện, chỉ ra cách truy cập `OuterClass.this` và minh họa bẫy “effectively final”.
6. Viết lớp `Range` (start, end) với bất biến `start ≤ end`: chèn kiểm tra vào đâu (constructor/setter), thông điệp lỗi ra sao.
