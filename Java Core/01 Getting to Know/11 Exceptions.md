## 1) Tổng quan & hệ phân cấp ngoại lệ

1. Sơ đồ hệ phân cấp: `Throwable` → `Error` vs `Exception` → `RuntimeException`. Ý nghĩa từng nhánh.
2. Khi nào ném `Error` là phù hợp? Nêu ví dụ các `Error` phổ biến và vì sao **không** nên catch bừa.
3. ⚠️ Gài: `Throwable` có phải là một `Exception`? `Exception` có phải là `Throwable`?
4. Sự khác nhau giữa **lỗi lập trình** (bug) và **điều kiện lỗi nghiệp vụ** (business error) trong thiết kế exception.
5. Khái niệm **exception propagation** (bong bóng ngược call stack) diễn ra thế nào?

## 2) Checked vs Unchecked

1. Phân biệt **checked** và **unchecked** exceptions; tiêu chí lựa chọn cho API công khai.
2. ⚠️ Gài: Vì sao `RuntimeException` **không cần** khai báo trong `throws`? Có nên tự tạo nhiều runtime exceptions?
3. Tại sao `IOException` là checked còn `NullPointerException` là unchecked?
4. Hệ quả của checked exceptions đối với signature phương thức và khả năng lan truyền thay đổi API.
5. Chiến lược **exception translation**: quấn (wrap) checked thành unchecked khi nào hợp lý?

## 3) `throw` & `throws`, khai báo & ném

1. Sự khác nhau giữa `throw` (runtime) và `throws` (khai báo).
2. ⚠️ Gài: Có thể `throw` một `Throwable` không phải `Exception`/`Error` (ví dụ subclass tuỳ biến) không? Điều kiện hợp lệ.
3. Ném lại exception (`throw e;`) vs ném mới với cause (`throw new X(e);`) — ảnh hưởng tới stack trace.
4. Quy tắc rethrow loại cải tiến (Java 7 “more precise rethrow”) hoạt động thế nào?
5. Dùng **exception chaining** (`initCause`, constructor có cause) đúng cách.

## 4) `try`/`catch`/`finally` — cơ chế & bẫy

1. Thứ tự khối `catch` theo tính đặc hiệu (specific trước general).
2. `finally` luôn chạy không? Liệt kê các trường hợp ngoại lệ (JVM crash, `System.exit`, `halt`, power off…).
3. ⚠️ Gài: `return` trong `finally` sẽ làm gì với giá trị `return` ở `try`/`catch`? Vì sao nên **tránh**.
4. Bắt quá rộng (`catch (Exception e)`) có hại gì? Khi nào chấp nhận được?
5. Khi nào nên **không** bắt mà để exception lan ra (fail-fast)?

## 5) Multi-catch & rethrow chính xác (Java 7+)

1. Multi-catch với `|` hoạt động thế nào? Hạn chế với biến `e` (final, loại chung).
2. ⚠️ Gài: Tại sao không thể multi-catch hai loại mà có quan hệ kế thừa?
3. “More precise rethrow” cho phép rethrow biến `e` với loại hẹp hơn — điều kiện cần là gì?
4. Khi nào nên tách nhiều `catch` thay vì gộp?

## 6) Try-with-resources (TWR) & `AutoCloseable`

1. Điều kiện để dùng TWR (resource phải implements `AutoCloseable`).
2. Thứ tự đóng tài nguyên trong TWR khi có nhiều resource.
3. ⚠️ Gài: Ngoại lệ ở `close()` bị **nuốt** hay **đính kèm**? Vai trò của **suppressed exceptions**.
4. So sánh TWR với `finally` tự đóng — ưu/nhược và tính an toàn khi có nhiều điểm ném lỗi.
5. Viết `AutoCloseable` tuỳ biến cần chú ý điều gì (idempotent, không ném checked nếu có thể).

## 7) Stack trace, cause & suppressed

1. Ý nghĩa của stack trace; cách lấy và in (`printStackTrace`, logger).
2. ⚠️ Gài: Tự tạo exception nhưng **không** điền stack trace (override `fillInStackTrace`) có lợi khi nào? Rủi ro?
3. Dùng `getCause()`/`getSuppressed()` đúng cách; sự khác nhau giữa **cause** và **suppressed**.
4. Đọc stack trace để xác định **điểm gốc** (root cause) vs “noisy wrapper”.
5. Tùy chỉnh message để hữu ích nhưng không lộ dữ liệu nhạy cảm.

## 8) Các exception cốt lõi & khi nào dùng

1. `IllegalArgumentException` vs `IllegalStateException` — tiêu chí chọn.
2. `NullPointerException` (NPE): nguyên nhân thường gặp; **Helpful NPE messages** (Java 14+) cải thiện gì.
3. `ArithmeticException`, `IndexOutOfBoundsException`, `ConcurrentModificationException` — hoàn cảnh sinh.
4. ⚠️ Gài: `NumberFormatException` là checked hay unchecked? Ảnh hưởng tới parsing API.
5. `AssertionError` vs exception runtime — dùng `assert` để làm gì trong dev/test?

## 9) Thiết kế **custom exceptions**

1. Khi nào cần custom exception? Tiêu chí tên, ngữ nghĩa domain, chứa thêm ngữ cảnh (id, state).
2. Kế thừa `Exception` hay `RuntimeException`? Lý do kiến trúc.
3. ⚠️ Gài: Có nên tạo **enum error code** trong exception? Đặt ở đâu để tránh ràng buộc chéo.
4. Constructors nên có các biến thể nào (msg, cause, msg+cause).
5. Khả năng **quốc tế hoá (i18n)** thông điệp lỗi: nên trả key hay message sẵn?

## 10) Logging & best practices

1. Nguyên tắc **không log hai lần** (avoid double logging) — log ở **rìa** hệ thống.
2. Log mức nào cho từng loại lỗi (ERROR/WARN/INFO/DEBUG)?
3. ⚠️ Gài: `logger.error("...", e)` khác gì `logger.error("... " + e.getMessage())`? Hệ quả mất stack trace.
4. Không nuốt ngoại lệ trống `catch (Exception e) {}`; nên làm gì tối thiểu?
5. Tránh lộ PII/secret trong message; mask/redact ở đâu.

## 11) Hiệu năng & kiểm thử

1. Tạo exception rất tốn kém ở đâu (fill stack trace)? Khi nào nên tránh dùng exception cho **control-flow**.
2. ⚠️ Gài: Dựng exception nhưng **không** ném (chỉ để log) — hậu quả hiệu năng.
3. Viết unit test cho logic ném lỗi: `assertThrows`, kiểm tra message/code.
4. Benchmark các nhánh ném lỗi (JMH): lưu ý **dead-code elimination**.

## 12) Concurrency & async

1. Ngoại lệ trong `Thread` riêng: vai trò của `UncaughtExceptionHandler`.
2. ⚠️ Gài: Ngoại lệ trong `ExecutorService`/`CompletableFuture` đi đâu? Khác biệt giữa `get()` ném `ExecutionException` và `join()` ném `CompletionException`.
3. Xử lý exception trong **parallel stream**: triệu chứng và cách gom lỗi (collecting, wrapping).
4. Propagate/cancel khi nhiều tác vụ đồng thời (structured concurrency—tổng quan ý tưởng).
5. Virtual threads: exception có khác gì về propagation/stack trace không (nhận thức chung).

## 13) Reflection, I/O & serialization

1. Các checked exceptions thường gặp khi **I/O** (`IOException`, `EOFException`) và **reflection** (`IllegalAccessException`, `InvocationTargetException`).
2. ⚠️ Gài: `InvocationTargetException` bọc gì? Cách lấy **target exception** thật.
3. Ngoại lệ trong **serialization** (`NotSerializableException`, `InvalidClassException`): khi nào xuất hiện.
4. Đóng tài nguyên đúng cách khi lỗi xảy ra giữa chừng (TWR + rollback thủ công nếu cần).

## 14) Assertions vs Exceptions

1. `assert` dùng cho **giả định nội bộ** trong dev/test; khác gì ném `IllegalArgumentException`.
2. ⚠️ Gài: Vì sao **assertion** có thể bị tắt ở runtime? Hệ quả nếu dựa vào assert để kiểm tra đầu vào.
3. Khi nào chuyển từ assert sang validation/exception thực thụ.

## 15) Thực hành thiết kế API & hợp đồng

1. Tài liệu hóa hợp đồng ném lỗi trong Javadoc: liệt kê checked/unchecked và bối cảnh.
2. ⚠️ Gài: Bắt và chuyển tất cả lỗi thành một `RuntimeException` chung — mùi thiết kế gì? Mất mát thông tin nào?
3. Lựa chọn **fail-fast** vs **fail-safe**: ví dụ cho parser, cấu hình, và xử lý người dùng.

---

## 16) Mini case (thực chiến 2–5 phút/câu)

1. Viết hàm đọc file cấu hình; yêu cầu: TWR, phân biệt lỗi “file không tồn tại” vs “định dạng sai”, thêm **error code** trong exception custom.
2. Refactor đoạn code `catch (Exception e)` → các `catch` cụ thể + logging đúng mức; đảm bảo **không** nuốt lỗi.
3. Thiết kế `UserService.create()` sao cho phân biệt rõ: `DuplicateEmailException` (checked hay unchecked?), `InvalidEmailException`, và lỗi I/O khi gửi mail.
4. Xử lý lỗi trong `CompletableFuture` chuỗi: chuyển `IOException` thành `CompletionException` và map sang fallback.
5. Điều tra NPE trên prod: kế hoạch bật **helpful NPE**, thêm context ID vào message, và test tái hiện.
6. Viết `AutoCloseable` cho một kết nối giả lập, đảm bảo `close()` an toàn khi bị gọi nhiều lần và ném suppressed đúng chuẩn.

