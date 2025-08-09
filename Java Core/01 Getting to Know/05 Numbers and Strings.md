# Java Core: Numbers and Strings

## **I. Numbers – Primitive & Wrapper Classes**

1. Liệt kê các kiểu dữ liệu số nguyên và số thực nguyên thủy (primitive numeric types) trong Java cùng kích thước và phạm vi giá trị.
2. Tại sao Java có cả primitive và wrapper class (`int` vs `Integer`)?
3. Autoboxing và unboxing hoạt động thế nào? Khi nào có thể gây lỗi `NullPointerException`?
4. Wrapper class (`Integer`, `Long`, …) là immutable—điều này ảnh hưởng thế nào đến hiệu năng?
5. Cơ chế cache giá trị của wrapper classes (`Integer.valueOf()`) hoạt động ra sao? Khoảng giá trị mặc định? Có thể thay đổi khoảng cache không?
6. So sánh `==` và `.equals()` khi so sánh wrapper objects.
7. `parseXxx()` vs `valueOf()` trong wrapper classes khác nhau thế nào?
8. Sự khác biệt giữa `Double.NaN`, `Double.POSITIVE_INFINITY`, `Double.NEGATIVE_INFINITY`.
9. So sánh `==` với `Double.compare()` hoặc `Float.compare()` khi so sánh số thực.
10. Lỗi chính xác khi cộng/trừ/nhân/chia số thực (`double`/`float`). Nguyên nhân từ IEEE 754.

---

## **II. BigInteger & BigDecimal**

11. Khi nào nên dùng `BigInteger` thay vì `long`?
12. Khi nào nên dùng `BigDecimal` thay vì `double`?
13. Tại sao `BigDecimal` phù hợp cho tính toán tài chính?
14. Cách khởi tạo `BigDecimal` từ `double` vs `String` và sự khác biệt về độ chính xác.
15. `BigDecimal` có immutable không?
16. Giải thích `scale` và `precision` trong `BigDecimal`.
17. Các phương thức làm tròn trong `BigDecimal` (`RoundingMode`) và khi nào dùng từng loại.
18. Hiệu năng của `BigDecimal` so với `double`.
19. So sánh `BigDecimal.equals()` và `compareTo()` (vấn đề scale).
20. Cách cộng/trừ/nhân/chia `BigDecimal` an toàn.

---

## **III. Number Formatting & Parsing**

21. `NumberFormat` và `DecimalFormat` dùng để làm gì?
22. Cách định dạng số với dấu phân tách hàng nghìn và số thập phân.
23. Cách chuyển đổi số sang chuỗi với locale cụ thể.
24. Cách parse chuỗi thành số với định dạng tùy chỉnh.
25. `String.format()` và `System.out.printf()` khác nhau thế nào?
26. Các ký tự định dạng (`%d`, `%f`, `%e`, `%x`, …) trong `String.format()`.
27. Cách format số với padding (ví dụ `00123`).
28. Format số âm với dấu ngoặc hoặc ký hiệu tùy chỉnh.

---

## **IV. Strings – Cơ bản & Bất biến**

29. `String` trong Java là immutable—lý do và lợi ích?
30. String pool là gì? Cơ chế `intern()` hoạt động ra sao?
31. Khác nhau giữa `String s1 = "abc"` và `String s2 = new String("abc")`.
32. So sánh `==` và `.equals()` khi so sánh chuỗi.
33. `equalsIgnoreCase()` hoạt động thế nào? Có an toàn cho tất cả locale?
34. `compareTo()` và `compareToIgnoreCase()` khác nhau thế nào?
35. Cách nối chuỗi (`+`, `concat()`, `StringBuilder`, `StringBuffer`) và ưu nhược điểm.
36. Sự khác nhau về hiệu năng khi nối chuỗi nhiều lần trong vòng lặp.
37. Cách tách chuỗi với `split()`—lưu ý khi regex đặc biệt (`.`, `|`, `*`, …).
38. `substring()` hoạt động thế nào? (Java 7+ không giữ nguyên char array).
39. Cách thay thế chuỗi (`replace()`, `replaceAll()`, `replaceFirst()`) và khác biệt về regex.
40. Cách kiểm tra chuỗi rỗng hoặc null (`isEmpty()`, `isBlank()`).
41. Cách loại bỏ khoảng trắng (`trim()`, `strip()`, `stripLeading()`, `stripTrailing()`).
42. Ảnh hưởng của `strip()` tới Unicode whitespace so với `trim()`.

---

## **V. StringBuilder & StringBuffer**

43. Khác nhau giữa `StringBuilder` và `StringBuffer`?
44. Khi nào nên dùng `StringBuilder` thay vì `String`?
45. `append()` và `insert()` trong `StringBuilder`.
46. Cách đảo chuỗi (`reverse()`).
47. Có thể chain nhiều phương thức của `StringBuilder` không?
48. Tại sao `StringBuffer` là thread-safe? Ảnh hưởng hiệu năng?

---

## **VI. Char & Encoding**

49. Kiểu `char` trong Java lưu mã Unicode?
50. Ký tự `char` có thể lưu emoji không? Giải thích về surrogate pairs.
51. `Character` class cung cấp những tiện ích gì?
52. `codePointAt()` và `charAt()` khác nhau thế nào?
53. Cách duyệt một chuỗi chứa emoji mà không cắt đôi ký tự?
54. Charset mặc định trong Java là gì? Cách thay đổi?
55. Cách encode/decode chuỗi sang byte (`getBytes(Charset)`) và ngược lại (`new String(byte[], Charset)`).
56. Vấn đề khi encode/decode sai charset.
57. Sự khác nhau giữa UTF-8, UTF-16, và ISO-8859-1 trong Java.

---

## **VII. Regex & String Processing**

58. `String.matches()` hoạt động thế nào?
59. `Pattern` và `Matcher` class—lợi ích so với `matches()`.
60. Cách compile pattern để tái sử dụng nhiều lần.
61. Các flag quan trọng trong regex (`CASE_INSENSITIVE`, `DOTALL`, `MULTILINE`).
62. Nhóm bắt (capturing groups) và nhóm không bắt (non-capturing).
63. Lookahead và lookbehind trong regex.
64. Tối ưu regex để tránh catastrophic backtracking.

---

## **VIII. Các vấn đề nâng cao**

65. So sánh `String` với `CharSequence` interface.
66. Tại sao `String` implement `Comparable` và `CharSequence`?
67. String interning ảnh hưởng gì tới bộ nhớ? Khi nào nên dùng/không dùng?
68. `String.intern()` trong Java 6 vs Java 7+.
69. `StringJoiner` và `String.join()` khác nhau thế nào?
70. Cách join mảng/collection thành chuỗi.
71. Tối ưu xử lý chuỗi lớn: streaming, NIO buffers, memory-mapped files.
72. An toàn khi xử lý dữ liệu nhạy cảm trong chuỗi (ví dụ password)—tại sao nên dùng `char[]` thay vì `String`?
73. Ảnh hưởng của `final` với biến String.
74. Cách so sánh String mà không phụ thuộc locale (`Collator`).
75. Hiệu năng tìm kiếm substring (`indexOf`, `lastIndexOf`, `contains`).
76. Khi nào nên dùng `regionMatches` thay vì `substring().equals()`.
77. String deduplication trong G1 GC—cơ chế và lợi ích.
78. Chuỗi rỗng (`""`) vs `null`—quản lý khác nhau ra sao trong API design.
79. Sử dụng `Formatter` với `Locale` để xử lý số và chuỗi đồng nhất.
80. Các vấn đề thường gặp khi xử lý Unicode normalization (NFC, NFD).