## 1) Kiểu số & wrapper types

1. Liệt kê 8 kiểu nguyên thủy số trong Java và miền giá trị của từng kiểu.
2. Wrapper types (`Byte`, `Short`, `Integer`, `Long`, `Float`, `Double`) khác gì so với primitive về bộ nhớ, nullability và hiệu năng?
3. ⚠️ Gài: `Integer a = 128; Integer b = 128; a == b` cho kết quả gì? Vì sao có **Integer cache**?
4. Tự động boxing/unboxing diễn ra khi nào? Rủi ro `NullPointerException` nào thường gặp khi unbox?
5. Khác nhau giữa `new Integer(5)` và `Integer.valueOf(5)`? Ảnh hưởng tới cache và GC?

## 2) Số thực & độ chính xác

1. Tại sao số chấm động (`float/double`) có thể sai số? IEEE-754 là gì?
2. ⚠️ Gài: Vì sao `0.1 + 0.2 != 0.3` với `double`? Khi nào nên dùng `BigDecimal`?
3. NaN, Infinity, −0.0 là gì? So sánh bằng `==` với NaN ra sao?
4. So sánh `StrictMath` và `Math`: hành vi/độ chính xác khác nhau thế nào?
5. Các phương thức làm tròn: `Math.round`, `ceil`, `floor`, `rint` — chọn cái nào cho yêu cầu nghiệp vụ?

## 3) BigInteger & BigDecimal

1. `BigInteger`/`BigDecimal` giải quyết bài toán gì so với `long`/`double`? Trade-off về hiệu năng.
2. Khái niệm **scale** trong `BigDecimal` là gì?
3. ⚠️ Gài: `new BigDecimal(0.1)` vs `BigDecimal.valueOf(0.1)` khác gì? Hậu quả?
4. `RoundingMode` gồm những chế độ nào? Chọn mode nào cho bài toán tài chính?
5. So sánh `equals()` và `compareTo()` trên `BigDecimal` (ảnh hưởng của scale).
6. Chuyển đổi `BigDecimal` → `int/long` an toàn: dùng phương thức nào để **fail-fast** khi tràn?

## 4) Chuyển kiểu số & tràn số

1. Widening vs narrowing conversion; khi nào cần cast tường minh?
2. ⚠️ Gài: `byte b = (byte) 130;` cho ra giá trị nào? Vì sao có tràn số?
3. `Math.addExact`, `subtractExact`, `multiplyExact`, `toIntExact`: dùng khi nào và vì sao tốt hơn phép toán thô?
4. Parse chuỗi thành số: `Integer.parseInt`, `Long.parseLong`, hỗ trợ **radix** ra sao? Xử lý dấu `+/-` thế nào?

## 5) Định dạng & phân tích cú pháp số (Formatting/Parsing)

1. Khác nhau giữa `NumberFormat`/`DecimalFormat` và `String.format`/`Formatter`.
2. Vai trò của `Locale` khi định dạng số, tiền tệ, phần trăm.
3. ⚠️ Gài: Vì sao định dạng `"1,234.56"` có thể parse sai ở `Locale` khác? Cách xử lý i18n đúng.
4. Mẫu định dạng `DecimalFormat` (ký tự `#`, `0`, nhóm, phần trăm, tiền tệ) – các bẫy thường gặp.
5. In số có leading zeros/width alignment bằng `String.format` (`%03d`, `%10.2f`).

## 6) `String` — bất biến, pool & interning

1. Vì sao `String` là **immutable**? Lợi ích về an toàn & cache.
2. ⚠️ Gài: `new String("abc")` tạo bao nhiêu object? Ảnh hưởng tới **string pool**?
3. `String.intern()` làm gì? Khi nào nên/không nên dùng?
4. So sánh `==` và `equals()` cho `String` — khi nào `==` trả `true` “tình cờ”.
5. `substring()` từ Java 7u6 trở đi khác gì trước đó về chia sẻ mảng char/bộ nhớ?

## 7) Ghép chuỗi & hiệu năng

1. Khác nhau giữa `String`, `StringBuilder`, `StringBuffer`: thread-safety, hiệu năng, use-case.
2. ⚠️ Gài: Tại sao `"a" + b + c` trong vòng lặp là anti-pattern? Trình biên dịch có tối ưu ngoài vòng lặp không?
3. `StringBuilder` nên được tái sử dụng như thế nào để giảm GC?
4. `String.join`, `StringJoiner`, `Collectors.joining` — khi nào dùng mỗi cái?

## 8) API chuỗi quan trọng

1. `length`, `isEmpty`, `isBlank`, `strip` vs `trim`, `repeat`, `indent`, `transform` (các phiên bản Java khác nhau).
2. Tìm kiếm/thay thế: `indexOf`/`lastIndexOf`, `replace`, `replaceFirst/All` (regex), `contains`.
3. ⚠️ Gài: Khác nhau giữa `replace` (literal) và `replaceAll` (regex). Khi nào `PatternSyntaxException` xảy ra?
4. Cắt/chia: `substring`, `split` (regex) và bẫy khi ký tự đặc biệt.
5. **Text Blocks** (`"""…"""`): quy tắc escape/indent; khi nào nên dùng để xử lý JSON/SQL.

## 9) Unicode, `char` và code points

1. `char` trong Java là 16-bit UTF-16 code unit — hệ quả với emoji/surrogate pairs.
2. ⚠️ Gài: `s.length()` đo **code units** hay **code points**? Tính số ký tự “mắt người thấy” thế nào?
3. Xử lý code point: `codePointAt`, `codePoints`, `Character.isSurrogate`, `offsetByCodePoints`.
4. Chuẩn hoá Unicode (NFC/NFD) và tác động tới so sánh/so khớp.
5. So sánh theo văn hoá (collation): dùng `Collator` thay vì `String.compareTo` khi nào?

## 10) So sánh chuỗi & thứ tự sắp xếp

1. `String.compareTo` dựa trên gì? Ảnh hưởng tới sort “từ điển” đa ngôn ngữ.
2. ⚠️ Gài: Vì sao `equalsIgnoreCase` có thể **không** tương đương chuẩn ở một số ngôn ngữ (tiếng Thổ Nhĩ Kỳ, ß của Đức)?
3. Khi nào nên dùng `Collator` với `Locale` để sort/tìm kiếm an toàn i18n?

## 11) Quét & phân tách văn bản

1. `Scanner` so với `String.split`/regex: ưu/nhược, khi nào chọn `Scanner`.
2. ⚠️ Gài: `StringTokenizer` có còn nên dùng không? Khác gì với `split` về khoảng trắng/regex.
3. Tách token lớn (logfile): kỹ thuật stream dòng và tránh load cả file vào RAM.

## 12) Bảo mật & xử lý dữ liệu nhạy cảm

1. Vì sao **không** nên giữ mật khẩu dưới dạng `String`? Dùng `char[]` hay `java.security` API nào?
2. ⚠️ Gài: Log dữ liệu nhạy cảm với `toString()` có rủi ro gì? Chính sách mask dữ liệu nên áp dụng ở đâu?
3. Làm sạch/băm/salt chuỗi trước khi lưu — best practices cơ bản.

## 13) Ngẫu nhiên & chuỗi

1. `Random` vs `SecureRandom`: khác nhau, khi nào bắt buộc dùng `SecureRandom` (token, OTP).
2. Tạo chuỗi ngẫu nhiên an toàn (bảng ký tự, bias khi dùng modulo).
3. ⚠️ Gài: `Math.random()` dựa trên gì? Có dùng cho bảo mật được không?

## 14) Hiệu năng & bộ nhớ

1. Ảnh hưởng của tạo nhiều `String` tạm thời; kỹ thuật giảm churn (builder, pooling, `String.concat` trong JDK mới).
2. Kiểm thử microbenchmark đúng cách cho thao tác số/chuỗi (JMH): warm-up, dead-code elimination.
3. ⚠️ Gài: Vì sao so sánh `String` bằng `==` đôi khi “có vẻ chạy đúng” trong dev nhưng sai trên prod?

---

## 15) Mini case (thực chiến 2–5 phút/câu)

1. Định dạng tiền tệ cho nhiều quốc gia (VN, US, DE): trình bày cách dùng `NumberFormat` + `Locale`, xử lý đầu vào `"1.234,56"`.
2. Tính lãi kép chính xác theo tháng trong 10 năm: chọn kiểu số, **rounding**, in bảng kết quả đẹp bằng `String.format`.
3. Làm sạch và chuẩn hoá email/username: trim, lowercase (i18n-safe), chuẩn hoá Unicode để so sánh chính xác.
4. Tạo `orderId` an toàn: dùng `SecureRandom` sinh chuỗi base62 dài N, chứng minh không bias.
5. Xử lý text có emoji: đếm số “ký tự người dùng thấy” và cắt chuỗi không làm vỡ surrogate pair.
6. Chuyển toàn bộ pipeline tính **thuế VAT** từ `double` sang `BigDecimal`: nêu các điểm cần đổi (khởi tạo, scale, rounding, so sánh).
