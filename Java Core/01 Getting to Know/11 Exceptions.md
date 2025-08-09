## I) Khái niệm & Phân loại

1. `Throwable`, `Exception`, `Error` khác nhau thế nào về ý nghĩa và cách xử lý?
2. Vì sao Java phân biệt **checked** và **unchecked** exceptions? Lợi–hại?
3. `RuntimeException` nằm ở đâu trong cây thừa kế? Khi nào nên ném `RuntimeException` thay vì checked?
4. Ví dụ nào điển hình cho checked (`IOException`) và unchecked (`NullPointerException`)? Vì sao thiết kế như vậy?
5. `Error` có nên catch không? Trường hợp ngoại lệ nào có thể cân nhắc?
6. “Fail fast” liên quan gì tới việc chọn loại exception?

---

## II) Cú pháp try–catch–finally

7. Quy tắc **thứ tự catch** khi bắt nhiều loại? Thế nào là “unreachable catch”?
8. Multi-catch (`catch (A | B e)`) hoạt động ra sao? Giới hạn với quan hệ kế thừa?
9. `finally` chạy khi nào? Liệt kê các trường hợp **không** chạy được `finally`.
10. `return` trong `try` vs `finally`: giá trị trả về cuối cùng là gì?
11. Khi `catch` ném exception mới, cái cũ có mất không? Cách bảo toàn ngữ cảnh?
12. Ném lại cùng đối tượng (`throw e;`) khác gì ném mới `throw new E(e);` về stack trace?

---

## III) `throw` vs `throws`, lan truyền & override

13. Khác biệt giữa `throw` (runtime) và `throws` (compile-time)?
14. Quy tắc ***exception propagation***: từ điểm ném đến `catch` phù hợp được chọn như thế nào?
15. Khi override, phương thức con được phép khai báo `throws` rộng/hẹp thế nào so với cha (checked/unchecked)?
16. Constructor khai báo `throws` có khác gì method thường?
17. Có thể `throws` một generic type không? Vì sao không?

---

## IV) Try-with-resources (TWR) & Suppressed exceptions

18. TWR cần interface nào? Khác biệt `AutoCloseable` vs `Closeable`?
19. Tài nguyên được đóng theo **thứ tự nào** khi có nhiều resource?
20. Nếu cả **khối try** và **đóng resource** đều ném exception, cái nào là chính, cái nào bị **suppressed**?
21. Lấy exceptions bị **suppressed** bằng API nào? Khi nào suppressed bị tắt?
22. Có nên cho `close()` ném checked exception? Thiết kế thế nào để dùng TWR mượt?
23. TWR với biến resource **không final nhưng effectively final**: quy tắc compiler?
24. Viết ví dụ TWR 3 resource và phân tích danh sách `getSuppressed()` khi lỗi kép.

---

## V) Stack trace, cause & rethrow

25. Stack trace gồm những gì? Ý nghĩa từng `StackTraceElement`?
26. `initCause`, constructor `(message, cause)` và **exception chaining** giúp gì khi debug?
27. `fillInStackTrace()` làm gì? Chi phí? Khi nào nên hạn chế?
28. Làm sao **giữ nguyên stack trace gốc** khi wrap exception?
29. `Throwable(String, Throwable, boolean enableSuppression, boolean writableStackTrace)` dùng trong tình huống nào?
30. “Precise rethrow” (Java 7) là gì? Lợi ích với inference kiểu `throws`?

---

## VI) Quy tắc “thiết kế API” (core)

31. Khi nào nên chọn **checked** thay vì **unchecked** trong API công khai?
32. Không nên khai báo `throws Exception` chung chung—vì sao?
33. Đặt message thế nào để stack trace **hữu ích** (ngữ cảnh, tham số)?
34. Chọn loại exception cốt lõi phù hợp: `IllegalArgumentException` vs `IllegalStateException` vs `UnsupportedOperationException`…
35. Có nên dùng exception cho **luồng điều khiển** thông thường? Tác hại?
36. Chính sách “không nuốt lỗi” (don’t swallow): dấu hiệu code smell là gì?

---

## VII) Khởi tạo lớp, khối static & lỗi liên quan

37. Exception trong **static initializer** dẫn tới `ExceptionInInitializerError` như thế nào?
38. Sự khác nhau giữa `ClassNotFoundException` (checked) và `NoClassDefFoundError` (runtime)?
39. Nếu constructor ném exception, object ở trạng thái nào? Rò rỉ resource cần xử lý sao?
40. Khác biệt ném exception trong **instance initializer block** vs trong constructor?

---

## VIII) Runtime exceptions thường gặp (core)

41. Tại sao `NullPointerException` là unchecked? Java 14+ có **Helpful NPE**: giúp gì?
42. `IndexOutOfBoundsException` vs `ArrayIndexOutOfBoundsException` vs `StringIndexOutOfBoundsException`: dùng khi nào?
43. `ClassCastException` xuất hiện khi nào? Liên hệ **erasure** & generics?
44. `ArithmeticException` (chia 0), `NumberFormatException` (parse) — chuẩn hoá thông điệp thế nào cho debug?
45. `ConcurrentModificationException` có phải lỗi đồng bộ hoá? Bản chất và cách tránh (core collections).
46. `IllegalMonitorStateException` xảy ra khi nào (wait/notify)?
47. `AssertionError` khác exception thế nào? Dùng `assert` trong Java Core hợp lý khi nào?

---

## IX) Luồng (thread) & Exceptions (mức core)

48. Exception ném trong **thread con** đi đâu? Làm sao không bị “mất”?
49. `Thread.UncaughtExceptionHandler` hoạt động thế nào? Trường hợp nên cài đặt?
50. `Runnable` vs `Callable`: khác biệt về throws/return với exception?
51. Khi tạo thread pool, exception từ task có làm **chết** thread không? (mức hiểu biết core)
52. Tránh nuốt exception trong `run()`: patterns core nên dùng là gì?

---

## X) Serialization & Exceptions (core)

53. Exception là `Serializable`: ý nghĩa thực tế? Khi gửi qua ranh giới tiến trình/module?
54. Thay đổi trường trong exception (thêm field) ảnh hưởng gì tới **serial compatibility**?
55. Dùng `readObject`/`writeObject` cho exception có hợp lý? (trường hợp đặc biệt)

---

## XI) Hiệu năng & thực tiễn

56. Tạo & ném exception có đắt không? Thành phần nào đắt nhất?
57. Tối ưu đường nóng (hot path): tránh ném lặp lại trong vòng lặp như thế nào?
58. “Preconditions” nên check bằng if hay ném exception? Cân nhắc đọc hiểu vs chi phí.
59. Ghi log + rethrow dễ gây **double logging**—nhận diện & tránh thế nào (ở mức core)?
60. Khi **không** ghi stack trace (constructor 4 tham số) phù hợp ở đâu?

---

## XII) Edge cases, bẫy & câu gài

61. Bắt `Throwable` có ổn không? Nguy cơ?
62. Bắt `Exception` trước rồi mới `RuntimeException`/`IOException` sau: vì sao compile lỗi?
63. Shadow biến `e` trong nested try-catch: có gây nhầm lẫn khi debug?
64. `finally` ném exception **che khuất** exception gốc: cách tránh?
65. Multi-catch với các kiểu có quan hệ cha–con: vì sao bị cấm?
66. `try` rỗng + `finally` nặng logic: mùi thiết kế nào?
67. Ném `NullPointerException` thủ công có hợp lý? Khi nào nên thay bằng `Objects.requireNonNull`?
68. `OutOfMemoryError`/`StackOverflowError`: xử lý được gì ở mức core?
69. Dùng `assert` thay cho exception trong public API: vì sao là anti-pattern?
70. Thao tác trong `catch` thay đổi trạng thái hệ thống gây **partial-commit**: cách rollback core-level?

---

## XIII) Tình huống thiết kế (challenge – vẫn core)

71. Viết một `AutoCloseable` tùy biến: `close()` có nên ném checked? TWR hoạt động ra sao khi lỗi kép?
72. Thiết kế ngoại lệ domain: **1 base unchecked + vài subclass**—tiêu chí chia tách?
73. API đọc file: chọn `throws IOException` hay wrap thành unchecked? Đánh đổi DX vs minh bạch.
74. Viết hàm `rethrowUnchecked(Throwable t)` dùng kỹ thuật core hợp lệ (không lạm dụng hack nguy hiểm).
75. Chuẩn hoá thông điệp exception: bao gồm **id đối tượng/đường dẫn/tham số**—mẫu message tốt là gì?
76. Cho đoạn mã có `try/finally` với `return` trong cả hai: dự đoán output và giải thích dòng thời gian.
77. Chuỗi gọi 4 tầng: A→B→C→D, D ném `IOException`, B muốn wrap thành unchecked rồi ném tiếp—thiết kế để **không mất cause**.
78. Viết ví dụ `getSuppressed()` thể hiện **3** suppressed exceptions xếp chồng khi đóng nhiều resource.
79. Thử bắt `Exception` ở cấp rất cao (main) và in stack trace có đủ ngữ cảnh? Cần thêm gì ở message?
80. Phân tích vì sao **catch rộng** + `continue` trong vòng lặp có thể che giấu lỗi dữ liệu và gây **silent data loss**.
