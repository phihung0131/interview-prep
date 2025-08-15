## 1) Biến, kiểu và định danh (Identifiers & Variables)

1. Quy tắc đặt **identifier** hợp lệ trong Java (chữ cái Unicode, dấu gạch dưới, \$, ký tự đầu…).
2. Phân biệt **primitive type** và **reference type**; bộ nhớ lưu ở đâu (stack/heap) theo nghĩa logic?
3. Vòng đời và **phạm vi** (scope) của biến: local, parameter, field, block.
4. **Default value** cho field vs biến local: khi nào có/không có?
5. `final` áp dụng cho biến có ý nghĩa gì? ⚠️ Gài: `final` với **biến tham chiếu** có làm object bất biến không?
6. Shadowing và hiding biến — ví dụ gây nhầm lẫn cần tránh.
7. Khác nhau giữa **constant** (public static final) và biến thường; quy ước đặt tên.

## 2) Kiểu nguyên thủy & literal

1. Liệt kê 8 **primitive types** và kích thước/miền giá trị tương ứng.
2. Literal số: thập phân, nhị phân (`0b`), bát phân (`0`), hexa (`0x`), dấu gạch dưới `_` trong literal.
3. Literal char và chuỗi escape (`\n`, `\uXXXX`); Unicode trong Java là gì?
4. **Floating-point**: `float` vs `double`, **NaN**, **Infinity**, `-0.0`. Ảnh hưởng so sánh bằng `==`.
5. ⚠️ Gài: Vì sao `0.1 + 0.2 != 0.3` với `double`? Khi nào nên dùng `BigDecimal`.
6. Literal boolean, char; casting char ↔ int; ký tự ghép (surrogate pairs).

## 3) Kiểu tham chiếu, `String` & text blocks

1. Tính **bất biến** (immutability) của `String` — lợi ích, rủi ro khi nối chuỗi trong vòng lặp.
2. `StringBuilder`/`StringBuffer`: khác nhau, khi nào dùng.
3. So sánh `==` vs `equals()` với `String` (interning).
4. **Text blocks** (`"""…"""`): quy tắc về khoảng trắng, indentation, escape.
5. ⚠️ Gài: `new String("abc")` tạo mấy đối tượng? Khi nào dùng/không dùng?

## 4) Mảng (Arrays)

1. Khai báo, khởi tạo mảng một/đa chiều; độ dài cố định.
2. **Array covariance**: vì sao `Number[] a = new Integer[10]` hợp lệ nhưng nguy hiểm?
3. Truy cập ngoài biên: `ArrayIndexOutOfBoundsException`.
4. `Arrays.equals()` vs `Arrays.deepEquals()`; `toString()` vs `deepToString()`.
5. ⚠️ Gài: `Arrays.asList(array)` trả về list kiểu gì? Thêm/xóa được không?

## 5) Toán tử & biểu thức

1. Thứ tự ưu tiên (precedence) và kết hợp (associativity) của toán tử: `* + << < == & && ?:`.
2. **Short-circuit** trong `&&`/`||` và tác động phụ (side-effect).
3. Toán tử bit/shift: `& | ^ ~ << >> >>>` — khác biệt `>>` và `>>>` với số âm.
4. Toán tử ++/-- tiền tố vs hậu tố; thứ tự đánh giá biểu thức.
5. ⚠️ Gài: Chuỗi + số: vì sao `"1" + 2 + 3` khác với `1 + 2 + "3"`?

## 6) Chuyển kiểu & numeric promotions

1. **Widening** vs **narrowing** conversion; khi nào cần cast tường minh.
2. **Unary numeric promotion** và **binary numeric promotion** diễn ra khi nào?
3. Tràn số (overflow) với `int`/`long`; phương thức `Math.addExact`/`multiplyExact`.
4. ⚠️ Gài: Cast `byte b = (byte)130;` ra giá trị gì? Vì sao.
5. Autoboxing/unboxing: khi nào xảy ra; rủi ro `NullPointerException` khi unbox.

## 7) Điều khiển luồng (Control Flow)

1. `if/else`, `switch` cơ bản; `switch` với `String`, `enum`, `int`.
2. **Switch expressions** (mũi tên `->`, `yield`) — lợi ích so với switch cũ.
3. Vòng lặp `for`, **enhanced-for**, `while`, `do-while`: khi nào chọn loại nào.
4. `break`, `continue`, **nhãn** (labeled break/continue).
5. ⚠️ Gài: Fall-through trong `switch` kiểu cũ — khi nào xảy ra và cách tránh.

## 8) Phương thức & tham số

1. **Pass-by-value** trong Java; tham chiếu object được “copy” như thế nào.
2. **Varargs** (`T...`) — ưu/nhược, mối quan hệ với mảng.
3. Overloading: quy tắc phân giải (primitive vs boxed vs varargs).
4. ⚠️ Gài: Hai overload `foo(int)` và `foo(Integer)` — truyền `null` gọi cái nào?
5. Tham số `final` và ý nghĩa thực tế.

## 9) `var` & suy luận kiểu cục bộ

1. `var` dùng ở đâu hợp lệ (local variables, loop indices, try-with-resources).
2. Lợi/hại của `var` với khả năng đọc hiểu code.
3. ⚠️ Gài: `var` không phải **dynamic typing** — giải thích vì sao.
4. `var` trong lambda parameters (khi nào hợp lệ, annotations).

## 10) `switch` nâng cao & pattern matching

1. **Pattern matching for `instanceof`**: cú pháp, phạm vi biến pattern.
2. **Switch on enums/strings** vs **switch expressions** — so sánh rõ ràng.
3. ⚠️ Gài: Biến pattern trong `instanceof` có còn hữu dụng ngoài block không?

## 11) Wrapper types, so sánh & số học chính xác

1. So sánh wrapper (`Integer`) bằng `==` vs `equals()`, **Integer cache**.
2. `BigInteger`/`BigDecimal`: khi nào cần; scale, rounding mode.
3. ⚠️ Gài: `new Integer(128) == 128` cho kết quả gì? Vì sao.

## 12) Ngoại lệ căn bản & TWR (try-with-resources)

1. Checked vs unchecked exceptions; khi nào dùng `throws` vs `try/catch`.
2. **Try-with-resources**: yêu cầu `AutoCloseable`; thứ tự đóng tài nguyên; suppressed exceptions.
3. ⚠️ Gài: `finally` có luôn chạy không? Trường hợp nào **không** (System.exit, crash…).

## 13) Package, import, `main` & entry point

1. Cú pháp `package`/`import`; `static import` dùng khi nào.
2. Chữ ký hợp lệ của **`main`**; có thể overload `main` không; chạy được không.
3. ⚠️ Gài: Hai class trùng tên khác package cùng import wildcard — cách tham chiếu lớp mong muốn.

## 14) Bình luận & Javadoc

1. Phân biệt `//`, `/* */`, `/** */`; khi nào dùng Javadoc.
2. Thẻ Javadoc cơ bản: `@param`, `@return`, `@throws`, `@since`, `@deprecated`.
3. ⚠️ Gài: Javadoc có phải là comment “bình thường” không? Ai tiêu thụ nội dung này.

---

## 15) Mini case (thực chiến 2–5 phút/câu)

1. Viết hàm **parse** chuỗi “1,234,567.89” thành `BigDecimal` an toàn khu vực (locale-aware); liệt kê bẫy thường gặp.
2. Tối ưu đoạn code nối chuỗi trong vòng lặp 1e6 lần: đề xuất thay thế và giải thích vì sao nhanh hơn.
3. Dò lỗi biểu thức tính thuế: kết hợp `int`, `double`, `%`, và phép chia; xác định nơi promotion sai và sửa.
4. Dùng **switch expression** để map mã trạng thái (`"NEW"`, `"PAID"`, `"CANCELLED"`) sang enum, có default an toàn.
5. Viết phương thức `sum(int... nums)` xử lý `null` an toàn khi gọi với mảng rỗng hoặc `null`.
