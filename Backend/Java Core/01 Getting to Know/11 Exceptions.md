## 1) Tổng quan & hệ phân cấp ngoại lệ

### 1. Sơ đồ hệ phân cấp: `Throwable` → `Error` vs `Exception` → `RuntimeException`. Ý nghĩa từng nhánh.
- **Trả lời**:
    - **`Throwable`**: Lớp gốc của tất cả lỗi và ngoại lệ trong Java.
    - **`Error`**: Lỗi nghiêm trọng, thường do hệ thống (JVM), không nên bắt (ví dụ: `OutOfMemoryError`).
    - **`Exception`**: Lỗi ứng dụng, chia thành:
        - **`RuntimeException`**: Unchecked, lỗi lập trình (ví dụ: `NullPointerException`).
        - **Checked Exception**: Phải khai báo hoặc xử lý (ví dụ: `IOException`).

### 2. Khi nào ném `Error` là phù hợp? Nêu ví dụ các `Error` phổ biến và vì sao **không** nên catch bừa.
- **Trả lời**:
    - **Ném `Error`**: Khi hệ thống gặp lỗi không thể phục hồi (ví dụ: hết bộ nhớ, lỗi JVM).
    - **Ví dụ**:
        - `OutOfMemoryError`: Hết heap memory.
        - `StackOverflowError`: Tràn stack.
    - **Không catch bừa**: Vì thường không thể phục hồi, che giấu lỗi nghiêm trọng.
    - **Ví dụ**:
      ```java
      try { recursiveMethod(); } catch (StackOverflowError e) { /* Không nên */ }
      ```

### 3. ⚠️ Gài: `Throwable` có phải là một `Exception`? `Exception` có phải là `Throwable`?
- **Trả lời**:
    - **`Throwable` không là `Exception`**: `Throwable` là superclass của `Error` và `Exception`.
    - **`Exception` là `Throwable`**: `Exception` kế thừa `Throwable`.
    - **Ví dụ**:
      ```java
      Throwable t = new Exception(); // OK
      Exception e = new Throwable(); // Lỗi biên dịch
      ```

### 4. Sự khác nhau giữa **lỗi lập trình** (bug) và **điều kiện lỗi nghiệp vụ** (business error) trong thiết kế exception.
- **Trả lời**:
    - **Lỗi lập trình**: Bug do code sai (ví dụ: `NullPointerException`).
    - **Lỗi nghiệp vụ**: Điều kiện hợp lệ nhưng không thỏa yêu cầu nghiệp vụ (ví dụ: `DuplicateEmailException`).
    - **Ví dụ**:
      ```java
      if (email == null) throw new NullPointerException(); // Bug
      if (emailExists(email)) throw new DuplicateEmailException(); // Nghiệp vụ
      ```

### 5. Khái niệm **exception propagation** (bong bóng ngược call stack) diễn ra thế nào?
- **Trả lời**:
    - **Propagation**: Exception lan ngược qua call stack đến khi được bắt hoặc JVM dừng.
    - **Cơ chế**: Nếu method không bắt, exception truyền lên caller.
    - **Ví dụ**:
      ```java
      void methodA() { methodB(); }
      void methodB() { throw new IOException(); } // Lan đến methodA
      ```

---

## 2) Checked vs Unchecked

### 1. Phân biệt **checked** và **unchecked** exceptions; tiêu chí lựa chọn cho API công khai.
- **Trả lời**:
    - **Checked**: Phải khai báo (`throws`) hoặc xử lý (`try-catch`) (ví dụ: `IOException`).
    - **Unchecked**: Không cần khai báo, kế thừa `RuntimeException` (ví dụ: `NullPointerException`).
    - **Tiêu chí API công khai**:
        - Dùng checked cho lỗi người dùng cần xử lý (ví dụ: I/O, network).
        - Dùng unchecked cho lỗi lập trình (bug).
    - **Ví dụ**:
      ```java
      void readFile() throws IOException {} // Checked
      void process(String s) { if (s == null) throw new NullPointerException(); } // Unchecked
      ```

### 2. ⚠️ Gài: Vì sao `RuntimeException` **không cần** khai báo trong `throws`? Có nên tự tạo nhiều runtime exceptions?
- **Trả lời**:
    - **Lý do**: `RuntimeException` là unchecked, compiler không bắt buộc khai báo.
    - **Tự tạo nhiều**: Chỉ nên tạo khi biểu diễn lỗi lập trình hoặc nghiệp vụ đơn giản, tránh lạm dụng làm mất hợp đồng API rõ ràng.
    - **Ví dụ**:
      ```java
      class MyRuntimeException extends RuntimeException {}
      void method() { throw new MyRuntimeException(); } // Không cần throws
      ```

### 3. Tại sao `IOException` là checked còn `NullPointerException` là unchecked?
- **Trả lời**:
    - **`IOException`**: Checked vì biểu diễn lỗi ngoài tầm kiểm soát (file, mạng), caller cần xử lý.
    - **`NullPointerException`**: Unchecked vì là lỗi lập trình, nên sửa code thay vì bắt.
    - **Ví dụ**:
      ```java
      void read() throws IOException { Files.readString(Path.of("file.txt")); }
      void process(String s) { s.length(); } // Có thể ném NPE
      ```

### 4. Hệ quả của checked exceptions đối với signature phương thức và khả năng lan truyền thay đổi API.
- **Trả lời**:
    - **Hệ quả**:
        - Thêm `throws` vào signature buộc caller xử lý, làm thay đổi API.
        - Lan truyền checked exception yêu cầu mọi method trong chuỗi khai báo `throws`.
    - **Ví dụ**:
      ```java
      void method() throws IOException {} // Caller phải xử lý
      ```

### 5. Chiến lược **exception translation**: quấn (wrap) checked thành unchecked khi nào hợp lý?
- **Trả lời**:
    - **Khi nào**: Khi lỗi checked không liên quan đến caller, hoặc để đơn giản hóa API.
    - **Cách làm**: Wrap vào `RuntimeException` với cause.
    - **Ví dụ**:
      ```java
      try { Files.readString(Path.of("file.txt")); }
      catch (IOException e) { throw new RuntimeException("Failed to read file", e); }
      ```

---

## 3) `throw` & `throws`, khai báo & ném

### 1. Sự khác nhau giữa `throw` (runtime) và `throws` (khai báo).
- **Trả lời**:
    - **`throw`**: Ném exception tại runtime.
    - **`throws`**: Khai báo checked exception mà method có thể ném.
    - **Ví dụ**:
      ```java
      void method() throws IOException {
          throw new IOException("Error");
      }
      ```

### 2. ⚠️ Gài: Có thể `throw` một `Throwable` không phải `Exception`/`Error` (ví dụ subclass tuỳ biến) không? Điều kiện hợp lệ.
- **Trả lời**:
    - **Không thể**: Chỉ `Throwable` (`Error` hoặc `Exception`) được ném.
    - **Điều kiện**: Subclass phải kế thừa `Throwable`.
    - **Ví dụ**:
      ```java
      class MyThrowable extends Throwable {}
      throw new MyThrowable(); // OK
      ```

### 3. Ném lại exception (`throw e;`) vs ném mới với cause (`throw new X(e);`) — ảnh hưởng tới stack trace.
- **Trả lời**:
    - **`throw e`**: Giữ stack trace gốc.
    - **`throw new X(e)`**: Tạo stack trace mới, gán `e` làm cause.
    - **Ví dụ**:
      ```java
      try { throw new IOException(); }
      catch (IOException e) {
          throw e; // Giữ stack trace
          // throw new RuntimeException(e); // Stack trace mới
      }
      ```

### 4. Quy tắc rethrow loại cải tiến (Java 7 “more precise rethrow”) hoạt động thế nào?
- **Trả lời**:
    - **Cơ chế**: Cho phép rethrow exception với kiểu hẹp hơn khai báo trong `catch`.
    - **Điều kiện**: Biến `e` là `final` hoặc effectively final.
    - **Ví dụ**:
      ```java
      void method() throws IOException {
          try { throw new FileNotFoundException(); }
          catch (Exception e) { throw e; } // OK, compiler biết e là IOException
      }
      ```

### 5. Dùng **exception chaining** (`initCause`, constructor có cause) đúng cách.
- **Trả lời**:
    - **Chaining**: Gắn cause để bảo toàn thông tin gốc.
    - **Cách dùng**: Dùng constructor hoặc `initCause` (nếu không có constructor phù hợp).
    - **Ví dụ**:
      ```java
      try { Files.readString(Path.of("file.txt")); }
      catch (IOException e) {
          RuntimeException re = new RuntimeException("Failed", e);
          // Hoặc: re.initCause(e);
          throw re;
      }
      ```

---

## 4) `try`/`catch`/`finally` — cơ chế & bẫy

### 1. Thứ tự khối `catch` theo tính đặc hiệu (specific trước general).
- **Trả lời**:
    - **Quy tắc**: Catch lớp con trước, lớp cha sau.
    - **Ví dụ**:
      ```java
      try { throw new FileNotFoundException(); }
      catch (FileNotFoundException e) { /* Xử lý cụ thể */ }
      catch (IOException e) { /* Xử lý chung */ }
      ```

### 2. `finally` luôn chạy không? Liệt kê các trường hợp ngoại lệ (JVM crash, `System.exit`, `halt`, power off…).
- **Trả lời**:
    - **`finally`**: Chạy sau `try`/`catch`, trừ các trường hợp:
        - JVM crash (lỗi hệ thống).
        - `System.exit()` hoặc `Runtime.getRuntime().halt()`.
        - Mất điện (power off).
    - **Ví dụ**:
      ```java
      try { return; } finally { System.out.println("Finally runs"); }
      ```

### 3. ⚠️ Gài: `return` trong `finally` sẽ làm gì với giá trị `return` ở `try`/`catch`? Vì sao nên **tránh**.
- **Trả lời**:
    - **Hệ quả**: `return` trong `finally` ghi đè giá trị `return` của `try`/`catch`.
    - **Tránh**: Che giấu logic chính, gây lỗi khó debug.
    - **Ví dụ**:
      ```java
      int method() {
          try { return 1; }
          finally { return 2; } // Ghi đè, trả về 2
      }
      ```

### 4. Bắt quá rộng (`catch (Exception e)`) có hại gì? Khi nào chấp nhận được?
- **Trả lời**:
    - **Hại**:
        - Che giấu lỗi cụ thể, khó debug.
        - Xử lý không đúng ngữ cảnh.
    - **Chấp nhận**: Tại rìa hệ thống (ví dụ: controller) để log và trả lỗi chung.
    - **Ví dụ**:
      ```java
      try { Files.readString(Path.of("file.txt")); }
      catch (Exception e) { log.error("Error", e); } // Chỉ tại rìa
      ```

### 5. Khi nào nên **không** bắt mà để exception lan ra (fail-fast)?
- **Trả lời**:
    - **Khi nào**:
        - Lỗi nghiêm trọng, không thể phục hồi.
        - Muốn dừng sớm để phát hiện bug (ví dụ: NPE trong dev).
    - **Ví dụ**:
      ```java
      if (data == null) throw new NullPointerException("Data is null"); // Fail-fast
      ```

---

## 5) Multi-catch & rethrow chính xác (Java 7+)

### 1. Multi-catch với `|` hoạt động thế nào? Hạn chế với biến `e` (final, loại chung).
- **Trả lời**:
    - **Multi-catch**: Xử lý nhiều loại exception trong một `catch`.
    - **Hạn chế**: `e` là `final`, kiểu chung là superclass chung nhỏ nhất.
    - **Ví dụ**:
      ```java
      try { throw new FileNotFoundException(); }
      catch (FileNotFoundException | IllegalArgumentException e) {
          // e là final, kiểu chung là Exception
      }
      ```

### 2. ⚠️ Gài: Tại sao không thể multi-catch hai loại mà có quan hệ kế thừa?
- **Trả lời**:
    - **Lý do**: Compiler không cho phép vì lớp con đã được bao phủ bởi lớp cha.
    - **Ví dụ**:
      ```java
      try {} catch (IOException | FileNotFoundException e) {} // Lỗi: FileNotFoundException là con của IOException
      ```

### 3. “More precise rethrow” cho phép rethrow biến `e` với loại hẹp hơn — điều kiện cần là gì?
- **Trả lời**:
    - **Điều kiện**: `e` là `final` hoặc effectively final, compiler suy luận kiểu thực tế.
    - **Ví dụ**:
      ```java
      void method() throws FileNotFoundException {
          try { throw new FileNotFoundException(); }
          catch (Exception e) { throw e; } // OK, compiler biết e là FileNotFoundException
      }
      ```

### 4. Khi nào nên tách nhiều `catch` thay vì gộp?
- **Trả lời**:
    - **Tách**:
        - Khi mỗi loại exception cần xử lý khác nhau.
        - Để tăng tính rõ ràng và cụ thể.
    - **Ví dụ**:
      ```java
      try { Files.readString(Path.of("file.txt")); }
      catch (FileNotFoundException e) { log.error("File not found"); }
      catch (IOException e) { log.error("IO error", e); }
      ```

---

## 6) Try-with-resources (TWR) & `AutoCloseable`

### 1. Điều kiện để dùng TWR (resource phải implements `AutoCloseable`).
- **Trả lời**:
    - **Điều kiện**: Resource phải implement `AutoCloseable` (có `close()`).
    - **Ví dụ**:
      ```java
      try (FileInputStream fis = new FileInputStream("file.txt")) {
          // Sử dụng fis
      } // Tự động gọi fis.close()
      ```

### 2. Thứ tự đóng tài nguyên trong TWR khi có nhiều resource.
- **Trả lời**:
    - **Thứ tự**: Đóng ngược với thứ tự khai báo (LIFO).
    - **Ví dụ**:
      ```java
      try (FileInputStream fis = new FileInputStream("file.txt");
           FileOutputStream fos = new FileOutputStream("out.txt")) {
          // Sử dụng
      } // fos.close() trước, rồi fis.close()
      ```

### 3. ⚠️ Gài: Ngoại lệ ở `close()` bị **nuốt** hay **đính kèm**? Vai trò của **suppressed exceptions**.
- **Trả lời**:
    - **Đính kèm**: Ngoại lệ từ `close()` được thêm vào suppressed exceptions của exception chính.
    - **Suppressed exceptions**: Lưu trữ lỗi phụ từ `close()` để debug.
    - **Ví dụ**:
      ```java
      try (FileInputStream fis = new FileInputStream("file.txt")) {
          throw new IOException("Main error");
      } catch (IOException e) {
          for (Throwable t : e.getSuppressed()) { log.error("Suppressed", t); }
      }
      ```

### 4. So sánh TWR với `finally` tự đóng — ưu/nhược và tính an toàn khi có nhiều điểm ném lỗi.
- **Trả lời**:
    - **TWR**:
        - **Ưu**: Tự động đóng, xử lý suppressed exceptions, ngắn gọn.
        - **Nhược**: Chỉ dùng với `AutoCloseable`.
    - **Finally**:
        - **Ưu**: Linh hoạt, dùng với bất kỳ tài nguyên.
        - **Nhược**: Dễ quên đóng, không xử lý suppressed exceptions tốt.
    - **Ví dụ**:
      ```java
      // TWR
      try (FileInputStream fis = new FileInputStream("file.txt")) {}
      // Finally
      FileInputStream fis = null;
      try { fis = new FileInputStream("file.txt"); }
      finally { if (fis != null) fis.close(); }
      ```

### 5. Viết `AutoCloseable` tuỳ biến cần chú ý điều gì (idempotent, không ném checked nếu có thể).
- **Trả lời**:
    - **Chú ý**:
        - `close()` phải idempotent (gọi nhiều lần không gây lỗi).
        - Tránh ném checked exception trong `close()`.
    - **Ví dụ**:
      ```java
      class MyResource implements AutoCloseable {
          private boolean closed;
          @Override
          public void close() {
              if (!closed) {
                  closed = true;
                  // Đóng tài nguyên
              }
          }
      }
      ```

---

## 7) Stack trace, cause & suppressed

### 1. Ý nghĩa của stack trace; cách lấy và in (`printStackTrace`, logger).
- **Trả lời**:
    - **Stack trace**: Ghi lại chuỗi lệnh gọi dẫn đến exception.
    - **Cách lấy/in**:
        - `e.printStackTrace()`: In ra console.
        - Logger: `logger.error("Error", e)`.
    - **Ví dụ**:
      ```java
      try { throw new IOException(); }
      catch (IOException e) { logger.error("IO error", e); }
      ```

### 2. ⚠️ Gài: Tự tạo exception nhưng **không** điền stack trace (override `fillInStackTrace`) có lợi khi nào? Rủi ro?
- **Trả lời**:
    - **Lợi**:
        - Tăng hiệu năng khi ném nhiều exception (ví dụ: trong vòng lặp).
        - Dùng khi stack trace không cần thiết.
    - **Rủi ro**: Mất thông tin debug.
    - **Ví dụ**:
      ```java
      class MyException extends RuntimeException {
          @Override
          public synchronized Throwable fillInStackTrace() { return this; }
      }
      ```

### 3. Dùng `getCause()`/`getSuppressed()` đúng cách; sự khác nhau giữa **cause** và **suppressed**.
- **Trả lời**:
    - **`getCause()`**: Lấy exception gốc gây ra exception hiện tại.
    - **`getSuppressed()`**: Lấy danh sách exception từ `close()` trong TWR.
    - **Khác biệt**:
        - `cause`: Nguyên nhân chính.
        - `suppressed`: Lỗi phụ từ đóng tài nguyên.
    - **Ví dụ**:
      ```java
      try (FileInputStream fis = new FileInputStream("file.txt")) {
          throw new IOException("Main");
      } catch (IOException e) {
          e.getCause(); // null
          e.getSuppressed(); // Exception từ close()
      }
      ```

### 4. Đọc stack trace để xác định **điểm gốc** (root cause) vs “noisy wrapper”.
- **Trả lời**:
    - **Root cause**: Dòng đầu tiên của stack trace hoặc `getCause()` cuối cùng.
    - **Noisy wrapper**: Các lớp exception bao bọc (ví dụ: `RuntimeException`).
    - **Ví dụ**:
      ```java
      try { throw new IOException("Root"); }
      catch (IOException e) { throw new RuntimeException("Wrapper", e); }
      // Root cause: IOException
      ```

### 5. Tùy chỉnh message để hữu ích nhưng không lộ dữ liệu nhạy cảm.
- **Trả lời**:
    - **Hữu ích**: Cung cấp ngữ cảnh (ID, hành động).
    - **Không lộ PII**: Tránh log thông tin nhạy cảm (password, email).
    - **Ví dụ**:
      ```java
      throw new RuntimeException("Failed to process user ID: " + userId); // OK
      // throw new RuntimeException("Failed for: " + user.toString()); // Xấu, lộ PII
      ```

---

## 8) Các exception cốt lõi & khi nào dùng

### 1. `IllegalArgumentException` vs `IllegalStateException` — tiêu chí chọn.
- **Trả lời**:
    - **`IllegalArgumentException`**: Tham số không hợp lệ.
    - **`IllegalStateException`**: Trạng thái đối tượng không cho phép thao tác.
    - **Ví dụ**:
      ```java
      if (arg < 0) throw new IllegalArgumentException("Negative arg");
      if (!initialized) throw new IllegalStateException("Not initialized");
      ```

### 2. `NullPointerException` (NPE): nguyên nhân thường gặp; **Helpful NPE messages** (Java 14+) cải thiện gì.
- **Trả lời**:
    - **Nguyên nhân**: Truy cập method/field trên `null`.
    - **Helpful NPE (Java 14+)**: Thêm chi tiết (ví dụ: field nào null).
    - **Ví dụ**:
      ```java
      String s = null;
      s.length(); // NPE, Java 14+: "Cannot invoke length() on null"
      ```

### 3. `ArithmeticException`, `IndexOutOfBoundsException`, `ConcurrentModificationException` — hoàn cảnh sinh.
- **Trả lời**:
    - **`ArithmeticException`**: Lỗi toán học (ví dụ: chia cho 0).
    - **`IndexOutOfBoundsException`**: Truy cập index ngoài giới hạn.
    - **`ConcurrentModificationException`**: Sửa collection khi đang duyệt.
    - **Ví dụ**:
      ```java
      int x = 1 / 0; // ArithmeticException
      List<String> list = new ArrayList<>();
      list.get(1); // IndexOutOfBoundsException
      for (String s : list) { list.add("x"); } // ConcurrentModificationException
      ```

### 4. ⚠️ Gài: `NumberFormatException` là checked hay unchecked? Ảnh hưởng tới parsing API.
- **Trả lời**:
    - **Unchecked**: Kế thừa `IllegalArgumentException` → `RuntimeException`.
    - **Ảnh hưởng**: Parsing API không cần `throws`, nhưng caller nên kiểm tra input.
    - **Ví dụ**:
      ```java
      Integer.parseInt("abc"); // NumberFormatException
      ```

### 5. `AssertionError` vs exception runtime — dùng `assert` để làm gì trong dev/test?
- **Trả lời**:
    - **`AssertionError`**: Ném bởi `assert` khi kiểm tra giả định dev/test.
    - **Dùng `assert`**: Kiểm tra điều kiện nội bộ trong dev/test, không dùng trong production.
    - **Ví dụ**:
      ```java
      assert x > 0 : "x must be positive"; // AssertionError nếu x <= 0
      ```

---

## 9) Thiết kế **custom exceptions**

### 1. Khi nào cần custom exception? Tiêu chí tên, ngữ nghĩa domain, chứa thêm ngữ cảnh (id, state).
- **Trả lời**:
    - **Khi nào**: Biểu diễn lỗi nghiệp vụ cụ thể, cần ngữ cảnh riêng.
    - **Tiêu chí**:
        - Tên rõ ràng, mang ngữ nghĩa domain (ví dụ: `DuplicateEmailException`).
        - Thêm field cho ngữ cảnh (ID, trạng thái).
    - **Ví dụ**:
      ```java
      class DuplicateEmailException extends RuntimeException {
          private final String email;
          public DuplicateEmailException(String email) {
              super("Duplicate email: " + email);
              this.email = email;
          }
      }
      ```

### 2. Kế thừa `Exception` hay `RuntimeException`? Lý do kiến trúc.
- **Trả lời**:
    - **`Exception`**: Lỗi nghiệp vụ caller cần xử lý (checked).
    - **`RuntimeException`**: Lỗi lập trình hoặc lỗi không cần xử lý rõ ràng (unchecked).
    - **Lý do**: Phù hợp hợp đồng API và ngữ cảnh.
    - **Ví dụ**:
      ```java
      class MyCheckedException extends Exception {} // Caller phải xử lý
      class MyUncheckedException extends RuntimeException {} // Không cần xử lý
      ```

### 3. ⚠️ Gài: Có nên tạo **enum error code** trong exception? Đặt ở đâu để tránh ràng buộc chéo.
- **Trả lời**:
    - **Nên tạo**: Enum error code giúp chuẩn hóa lỗi, dễ tra cứu.
    - **Đặt ở đâu**: Đặt trong package riêng hoặc class tĩnh để tránh phụ thuộc vòng.
    - **Ví dụ**:
      ```java
      enum ErrorCode { DUPLICATE_EMAIL, INVALID_INPUT }
      class MyException extends RuntimeException {
          private final ErrorCode code;
          public MyException(ErrorCode code) { this.code = code; }
      }
      ```

### 4. Constructors nên có các biến thể nào (msg, cause, msg+cause).
- **Trả lời**:
    - **Constructors**:
        - `MyException(String message)`
        - `MyException(Throwable cause)`
        - `MyException(String message, Throwable cause)`
    - **Ví dụ**:
      ```java
      class MyException extends RuntimeException {
          public MyException(String message) { super(message); }
          public MyException(Throwable cause) { super(cause); }
          public MyException(String message, Throwable cause) { super(message, cause); }
      }
      ```

### 5. Khả năng **quốc tế hoá (i18n)** thông điệp lỗi: nên trả key hay message sẵn?
- **Trả lời**:
    - **Trả key**: Dễ i18n, message lấy từ resource bundle.
    - **Message sẵn**: Phù hợp lỗi cố định, không cần i18n.
    - **Ví dụ**:
      ```java
      class MyException extends RuntimeException {
          private final String key;
          public MyException(String key) { this.key = key; }
          public String getLocalizedMessage(Locale locale) {
              return ResourceBundle.getBundle("messages", locale).getString(key);
          }
      }
      ```

---

## 10) Logging & best practices

### 1. Nguyên tắc **không log hai lần** (avoid double logging) — log ở **rìa** hệ thống.
- **Trả lời**:
    - **Không log hai lần**: Chỉ log tại điểm xử lý cuối (ví dụ: controller, boundary).
    - **Rìa hệ thống**: Đảm bảo lỗi được log một lần, tránh lặp.
    - **Ví dụ**:
      ```java
      // Controller
      try { service.call(); }
      catch (Exception e) { logger.error("Service failed", e); }
      ```

### 2. Log mức nào cho từng loại lỗi (ERROR/WARN/INFO/DEBUG)?
- **Trả lời**:
    - **ERROR**: Lỗi nghiêm trọng, cần hành động (ví dụ: DB failure).
    - **WARN**: Vấn đề tiềm ẩn, không dừng hệ thống.
    - **INFO**: Sự kiện quan trọng (ví dụ: service khởi động).
    - **DEBUG**: Chi tiết debug, chỉ trong dev.
    - **Ví dụ**:
      ```java
      logger.error("DB error", e); // ERROR
      logger.warn("Deprecated API used"); // WARN
      ```

### 3. ⚠️ Gài: `logger.error("...", e)` khác gì `logger.error("... " + e.getMessage())`? Hệ quả mất stack trace.
- **Trả lời**:
    - **`logger.error("...", e)`**: Log message và stack trace đầy đủ.
    - **`logger.error("... " + e.getMessage())`**: Chỉ log message, mất stack trace.
    - **Hệ quả**: Mất stack trace gây khó debug.
    - **Ví dụ**:
      ```java
      try { throw new IOException(); }
      catch (IOException e) {
          logger.error("Error", e); // OK
          logger.error("Error: " + e.getMessage()); // Mất stack trace
      }
      ```

### 4. Không nuốt ngoại lệ trống `catch (Exception e) {}`; nên làm gì tối thiểu?
- **Trả lời**:
    - **Tối thiểu**: Log lỗi hoặc rethrow.
    - **Ví dụ**:
      ```java
      try { Files.readString(Path.of("file.txt")); }
      catch (IOException e) { logger.error("IO error", e); throw e; }
      ```

### 5. Tránh lộ PII/secret trong message; mask/redact ở đâu.
- **Trả lời**:
    - **Tránh PII**: Không log email, password, token.
    - **Mask/redact**: Trong logger hoặc custom exception message.
    - **Ví dụ**:
      ```java
      String masked = email.replaceAll("(?<=.).(?=.*@)", "*");
      logger.error("Failed for user: {}", masked);
      ```

---

## 11) Hiệu năng & kiểm thử

### 1. Tạo exception rất tốn kém ở đâu (fill stack trace)? Khi nào nên tránh dùng exception cho **control-flow**.
- **Trả lời**:
    - **Tốn kém**: `fillInStackTrace()` thu thập call stack.
    - **Tránh control-flow**: Không dùng exception để điều khiển luồng (ví dụ: thay `if`).
    - **Ví dụ**:
      ```java
      // Xấu
      try { throw new Exception(); } catch (Exception e) { /* Flow */ }
      // Tốt
      if (condition) { /* Flow */ }
      ```

### 2. ⚠️ Gài: Dựng exception nhưng **không** ném (chỉ để log) — hậu quả hiệu năng.
- **Trả lời**:
    - **Hậu quả**: Tạo stack trace tốn CPU dù không dùng.
    - **Khắc phục**: Log message trực tiếp hoặc override `fillInStackTrace`.
    - **Ví dụ**:
      ```java
      // Xấu
      logger.error("Error", new Exception());
      // Tốt
      logger.error("Error");
      ```

### 3. Viết unit test cho logic ném lỗi: `assertThrows`, kiểm tra message/code.
- **Trả lời**:
    - **Dùng `assertThrows`**:
      ```java
      @Test
      void test() {
          Exception e = assertThrows(IllegalArgumentException.class, () -> method(-1));
          assertEquals("Negative arg", e.getMessage());
      }
      ```

### 4. Benchmark các nhánh ném lỗi (JMH): lưu ý **dead-code elimination**.
- **Trả lời**:
    - **Lưu ý**: JMH tránh tối ưu hóa dead code bằng cách dùng `@Benchmark` và `Blackhole`.
    - **Ví dụ**:
      ```java
      @Benchmark
      public void test(Blackhole bh) {
          try { throw new Exception(); } catch (Exception e) { bh.consume(e); }
      }
      ```

---

## 12) Concurrency & async

### 1. Ngoại lệ trong `Thread` riêng: vai trò của `UncaughtExceptionHandler`.
- **Trả lời**:
    - **`UncaughtExceptionHandler`**: Xử lý exception không bắt được trong thread.
    - **Ví dụ**:
      ```java
      Thread.setDefaultUncaughtExceptionHandler((t, e) -> logger.error("Uncaught", e));
      ```

### 2. ⚠️ Gài: Ngoại lệ trong `ExecutorService`/`CompletableFuture` đi đâu? Khác biệt giữa `get()` ném `ExecutionException` và `join()` ném `CompletionException`.
- **Trả lời**:
    - **Đi đâu**: Exception được bọc trong `ExecutionException` hoặc `CompletionException`.
    - **`get()`**: Ném `ExecutionException` bọc cause.
    - **`join()`**: Ném `CompletionException` bọc cause.
    - **Ví dụ**:
      ```java
      CompletableFuture.supplyAsync(() -> { throw new RuntimeException(); })
          .get(); // ExecutionException
          .join(); // CompletionException
      ```

### 3. Xử lý exception trong **parallel stream**: triệu chứng và cách gom lỗi (collecting, wrapping).
- **Trả lời**:
    - **Triệu chứng**: Lỗi lan truyền, dừng stream.
    - **Gom lỗi**: Dùng `collect` hoặc try-catch trong lambda.
    - **Ví dụ**:
      ```java
      List<Exception> errors = new ArrayList<>();
      list.parallelStream().map(x -> {
          try { process(x); return x; }
          catch (Exception e) { errors.add(e); return null; }
      }).collect(Collectors.toList());
      ```

### 4. Propagate/cancel khi nhiều tác vụ đồng thời (structured concurrency—tổng quan ý tưởng).
- **Trả lời**:
    - **Structured concurrency**: Quản lý tác vụ đồng thời, đảm bảo tất cả hoàn thành hoặc hủy khi có lỗi.
    - **Ví dụ**:
      ```java
      try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
          scope.fork(() -> task1());
          scope.fork(() -> task2());
          scope.join().throwIfFailed();
      }
      ```

### 5. Virtual threads: exception có khác gì về propagation/stack trace không (nhận thức chung).
- **Trả lời**:
    - **Khác biệt**: Propagation giống thread thông thường, nhưng stack trace có thể ngắn hơn do virtual threads tối ưu hóa.
    - **Ví dụ**:
      ```java
      Thread.ofVirtual().start(() -> { throw new RuntimeException(); });
      ```

---

## 13) Reflection, I/O & serialization

### 1. Các checked exceptions thường gặp khi **I/O** (`IOException`, `EOFException`) và **reflection** (`IllegalAccessException`, `InvocationTargetException`).
- **Trả lời**:
    - **I/O**:
        - `IOException`: Lỗi chung khi đọc/ghi.
        - `EOFException`: Hết file bất ngờ.
    - **Reflection**:
        - `IllegalAccessException`: Truy cập field/method không hợp lệ.
        - `InvocationTargetException`: Method ném exception.

### 2. ⚠️ Gài: `InvocationTargetException` bọc gì? Cách lấy **target exception** thật.
- **Trả lời**:
    - **Bọc**: Exception từ method được gọi qua reflection.
    - **Lấy target**: Dùng `getCause()`.
    - **Ví dụ**:
      ```java
      try { method.invoke(obj); }
      catch (InvocationTargetException e) {
          Throwable cause = e.getCause();
      }
      ```

### 3. Ngoại lệ trong **serialization** (`NotSerializableException`, `InvalidClassException`): khi nào xuất hiện.
- **Trả lời**:
    - **`NotSerializableException`**: Lớp không implement `Serializable`.
    - **`InvalidClassException`**: Cấu trúc lớp thay đổi (ví dụ: `serialVersionUID` không khớp).
    - **Ví dụ**:
      ```java
      ObjectOutputStream oos = new ObjectOutputStream(...);
      oos.write(new NonSerializableClass()); // NotSerializableException
      ```

### 4. Đóng tài nguyên đúng cách khi lỗi xảy ra giữa chừng (TWR + rollback thủ công nếu cần).
- **Trả lời**:
    - **TWR**: Tự động đóng tài nguyên.
    - **Rollback**: Xử lý trong `catch` hoặc `finally` nếu cần.
    - **Ví dụ**:
      ```java
      try (Connection conn = getConnection()) {
          conn.setAutoCommit(false);
          // Xử lý
          conn.commit();
      } catch (SQLException e) {
          conn.rollback();
          throw e;
      }
      ```

---

## 14) Assertions vs Exceptions

### 1. `assert` dùng cho **giả định nội bộ** trong dev/test; khác gì ném `IllegalArgumentException`.
- **Trả lời**:
    - **`assert`**: Kiểm tra giả định dev/test, có thể tắt runtime.
    - **`IllegalArgumentException`**: Kiểm tra input, luôn chạy.
    - **Ví dụ**:
      ```java
      assert x > 0; // Dev/test
      if (x <= 0) throw new IllegalArgumentException(); // Production
      ```

### 2. ⚠️ Gài: Vì sao **assertion** có thể bị tắt ở runtime? Hệ quả nếu dựa vào assert để kiểm tra đầu vào.
- **Trả lời**:
    - **Tắt runtime**: Dùng `-ea` để bật, mặc định tắt trong production.
    - **Hệ quả**: Nếu dùng `assert` kiểm tra input, lỗi có thể bị bỏ qua.
    - **Ví dụ**:
      ```java
      assert input != null; // Tắt runtime, input null không báo lỗi
      ```

### 3. Khi nào chuyển từ assert sang validation/exception thực thụ.
- **Trả lời**:
    - **Chuyển khi**:
        - Kiểm tra input người dùng.
        - Logic cần chạy ở production.
    - **Ví dụ**:
      ```java
      if (input == null) throw new IllegalArgumentException("Null input");
      ```

---

## 15) Thực hành thiết kế API & hợp đồng

### 1. Tài liệu hóa hợp đồng ném lỗi trong Javadoc: liệt kê checked/unchecked và bối cảnh.
- **Trả lời**:
    - **Javadoc**:
        - Liệt kê checked exceptions với `@throws`.
        - Ghi chú unchecked nếu quan trọng.
    - **Ví dụ**:
      ```java
      /**
       * Reads file.
       * @throws IOException if file cannot be read.
       * @throws IllegalArgumentException if path is null.
       */
      void readFile(String path) throws IOException {}
      ```

### 2. ⚠️ Gài: Bắt và chuyển tất cả lỗi thành một `RuntimeException` chung — mùi thiết kế gì? Mất mát thông tin nào?
- **Trả lời**:
    - **Mùi**: Che giấu ngữ cảnh lỗi, làm mất tính cụ thể.
    - **Mất mát**: Loại lỗi gốc, thông tin nghiệp vụ.
    - **Ví dụ**:
      ```java
      // Xấu
      try { Files.readString(Path.of("file.txt")); }
      catch (IOException e) { throw new RuntimeException(e); } // Mất loại IOException
      ```

### 3. Lựa chọn **fail-fast** vs **fail-safe**: ví dụ cho parser, cấu hình, và xử lý người dùng.
- **Trả lời**:
    - **Fail-fast**: Dừng ngay khi lỗi (parser: ném `NumberFormatException`).
    - **Fail-safe**: Tiếp tục với giá trị mặc định (cấu hình: dùng default).
    - **Ví dụ**:
      ```java
      // Fail-fast
      int parse(String s) { return Integer.parseInt(s); }
      // Fail-safe
      int parseSafe(String s) { try { return Integer.parseInt(s); } catch (NumberFormatException e) { return 0; } }
      ```

---

## 16) Mini case (thực chiến 2–5 phút/câu)

### 1. Viết hàm đọc file cấu hình; yêu cầu: TWR, phân biệt lỗi “file không tồn tại” vs “định dạng sai”, thêm **error code** trong exception custom.
- **Trả lời**:
  ```java
  enum ConfigError { FILE_NOT_FOUND, INVALID_FORMAT }
  class ConfigException extends RuntimeException {
      private final ConfigError code;
      public ConfigException(ConfigError code, String msg) { super(msg); this.code = code; }
  }
  Properties readConfig(String path) {
      try (FileReader reader = new FileReader(path)) {
          Properties props = new Properties();
          props.load(reader);
          if (!props.containsKey("key")) throw new ConfigException(ConfigError.INVALID_FORMAT, "Missing key");
          return props;
      } catch (FileNotFoundException e) {
          throw new ConfigException(ConfigError.FILE_NOT_FOUND, "File not found: " + path, e);
      } catch (IOException e) {
          throw new ConfigException(ConfigError.INVALID_FORMAT, "Invalid format", e);
      }
  }
  ```

### 2. Refactor đoạn code `catch (Exception e)` → các `catch` cụ thể + logging đúng mức; đảm bảo **không** nuốt lỗi.
- **Trả lời**:
  ```java
  // Trước
  try { Files.readString(Path.of("file.txt")); }
  catch (Exception e) {}
  // Sau
  try { Files.readString(Path.of("file.txt")); }
  catch (FileNotFoundException e) {
      logger.error("File not found: {}", path, e);
      throw e;
  } catch (IOException e) {
      logger.error("IO error reading file", e);
      throw e;
  }
  ```

### 3. Thiết kế `UserService.create()` sao cho phân biệt rõ: `DuplicateEmailException` (checked hay unchecked?), `InvalidEmailException`, và lỗi I/O khi gửi mail.
- **Trả lời**:
  ```java
  class DuplicateEmailException extends RuntimeException { /* Unchecked */ }
  class InvalidEmailException extends RuntimeException {}
  class UserService {
      void create(String email) throws IOException {
          if (!email.matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"))
              throw new InvalidEmailException();
          if (emailExists(email))
              throw new DuplicateEmailException();
          sendEmail(email); // Có thể ném IOException
      }
  }
  ```

### 4. Xử lý lỗi trong `CompletableFuture` chuỗi: chuyển `IOException` thành `CompletionException` và map sang fallback.
- **Trả lời**:
  ```java
  CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
      throw new IOException("IO error");
  }).exceptionally(ex -> {
      if (ex.getCause() instanceof IOException)
          throw new CompletionException(ex.getCause());
      return "Fallback";
  });
  ```

### 5. Điều tra NPE trên prod: kế hoạch bật **helpful NPE**, thêm context ID vào message, và test tái hiện.
- **Trả lời**:
    - **Kế hoạch**:
        - Bật Helpful NPE: JVM flag `-XX:+ShowCodeDetailsInExceptionMessages` (Java 14+).
        - Thêm context: Wrap NPE với custom exception chứa ID.
        - Tái hiện: Viết unit test với input null.
    - **Ví dụ**:
      ```java
      class MyService {
          void process(String id, String data) {
              try { data.length(); }
              catch (NullPointerException e) {
                  throw new RuntimeException("Null data for ID: " + id, e);
              }
          }
      }
      @Test
      void testNPE() { assertThrows(RuntimeException.class, () -> service.process("123", null)); }
      ```

### 6. Viết `AutoCloseable` cho một kết nối giả lập, đảm bảo `close()` an toàn khi gọi nhiều lần và ném suppressed đúng chuẩn.
- **Trả lời**:
  ```java
  class MyConnection implements AutoCloseable {
      private boolean closed;
      @Override
      public void close() throws IOException {
          if (!closed) {
              try { /* Đóng tài nguyên */ }
              catch (Exception e) { throw new IOException("Close failed", e); }
              closed = true;
          }
      }
      void use() throws IOException {
          if (closed) throw new IOException("Connection closed");
          // Logic
      }
  }
  ```

---

