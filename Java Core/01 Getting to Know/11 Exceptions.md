## I) Khái niệm & Phân loại

### 1. `Throwable`, `Exception`, `Error` khác nhau thế nào về ý nghĩa và cách xử lý?

**`Throwable`**:
- Là lớp cha gốc của tất cả các ngoại lệ và lỗi trong Java, nằm ở đỉnh của cây thừa kế (`java.lang.Throwable`).
- Có hai lớp con trực tiếp: `Exception` và `Error`.
- Cung cấp các phương thức cơ bản như `getMessage()`, `getCause()`, `printStackTrace()` để xử lý thông tin lỗi.
- Không nên ném trực tiếp `Throwable` trong mã nguồn, vì nó quá chung chung.

**`Exception`**:
- Biểu thị các điều kiện bất thường mà một chương trình có thể **khôi phục** (recoverable).
- Được chia thành hai loại: **checked** (phải xử lý khi viết code) và **unchecked** (không bắt buộc xử lý).
- Ví dụ: `IOException`, `SQLException`.
- Cách xử lý: Sử dụng `try-catch` để bắt và xử lý hoặc khai báo `throws` trong chữ ký phương thức.

**`Error`**:
- Biểu thị các lỗi nghiêm trọng, thường liên quan đến hệ thống hoặc JVM, mà chương trình **không thể khôi phục** (non-recoverable).
- Ví dụ: `OutOfMemoryError`, `StackOverflowError`.
- Cách xử lý: Thông thường không nên bắt `Error`, mà để JVM xử lý (thường dẫn đến dừng chương trình). Chỉ bắt trong các trường hợp rất đặc biệt (xem câu 5).

**Khác biệt chính**:
- `Exception` dành cho các tình huống có thể kiểm soát và xử lý trong mã nguồn.
- `Error` liên quan đến các vấn đề hệ thống nghiêm trọng, hiếm khi được xử lý trong ứng dụng.
- `Throwable` là siêu lớp chung, hiếm khi sử dụng trực tiếp.

---

### 2. Vì sao Java phân biệt **checked** và **unchecked** exceptions? Lợi–hại?

**Lý do phân biệt**:
- **Checked exceptions** (kế thừa từ `Exception` nhưng không phải `RuntimeException`):
    - Là các ngoại lệ mà trình biên dịch **bắt buộc** phải xử lý (bằng `try-catch` hoặc `throws`).
    - Thường xảy ra trong các tình huống bên ngoài kiểm soát của chương trình, như lỗi I/O (`IOException`) hoặc lỗi kết nối cơ sở dữ liệu (`SQLException`).
    - Mục đích: Đảm bảo lập trình viên nhận thức và xử lý các tình huống lỗi có khả năng xảy ra, tăng tính an toàn và rõ ràng của mã.
- **Unchecked exceptions** (kế thừa từ `RuntimeException`):
    - Là các ngoại lệ không bắt buộc xử lý tại thời điểm biên dịch.
    - Thường liên quan đến lỗi logic trong mã, như `NullPointerException` hoặc `ArrayIndexOutOfBoundsException`.
    - Mục đích: Cho phép lập trình viên tập trung vào logic chính mà không bị ép buộc xử lý mọi trường hợp lỗi có thể xảy ra.

**Lợi ích**:
- **Checked exceptions**:
    - Tăng độ tin cậy của chương trình bằng cách buộc lập trình viên xử lý các tình huống bất thường.
    - Tạo hợp đồng rõ ràng giữa phương thức và người gọi (qua `throws`).
    - Phù hợp với các hệ thống yêu cầu độ ổn định cao (như ứng dụng doanh nghiệp).
- **Unchecked exceptions**:
    - Giảm sự phức tạp của mã, không yêu cầu `try-catch` hoặc `throws` cho mọi phương thức.
    - Linh hoạt hơn cho các tình huống lỗi logic, nơi lập trình viên có thể kiểm soát được.

**Hạn chế**:
- **Checked exceptions**:
    - Làm mã dài dòng, đặc biệt khi nhiều phương thức ném nhiều ngoại lệ.
    - Có thể gây khó chịu khi ngoại lệ hiếm khi xảy ra hoặc khó xử lý ngay lập tức.
    - Dẫn đến các khối `try-catch` rỗng hoặc xử lý không đúng cách (swallowing exceptions).
- **Unchecked exceptions**:
    - Có thể khiến lỗi bị bỏ qua, dẫn đến khó debug nếu không được xử lý đúng.
    - Thiếu hợp đồng rõ ràng giữa phương thức và người gọi, gây khó khăn trong việc dự đoán lỗi.

---

### 3. `RuntimeException` nằm ở đâu trong cây thừa kế? Khi nào nên ném `RuntimeException` thay vì checked?

**Vị trí trong cây thừa kế**:
- `RuntimeException` là lớp con trực tiếp của `Exception` (`java.lang.RuntimeException`).
- Cây thừa kế: `Object` → `Throwable` → `Exception` → `RuntimeException`.
- Các lớp con phổ biến của `RuntimeException`: `NullPointerException`, `ArrayIndexOutOfBoundsException`, `IllegalArgumentException`.

**Khi nào nên ném `RuntimeException`**:
- Khi lỗi phát sinh do **lỗi logic** hoặc **sai sót trong mã nguồn** mà lập trình viên có thể kiểm soát được, ví dụ:
    - Truyền tham số không hợp lệ (`IllegalArgumentException`).
    - Truy cập đối tượng null (`NullPointerException`).
    - Vượt quá giới hạn mảng (`ArrayIndexOutOfBoundsException`).
- Khi không muốn ép buộc người gọi phương thức phải xử lý ngoại lệ (vì đây là lỗi lập trình, không phải lỗi hệ thống).
- Khi ngoại lệ không thể hoặc không cần khôi phục, và việc dừng chương trình là hợp lý.
- Trong các API hoặc thư viện, sử dụng `RuntimeException` để giảm gánh nặng xử lý ngoại lệ cho người dùng.

**So sánh với checked exceptions**:
- Ném checked exceptions khi lỗi liên quan đến các yếu tố bên ngoài (như file, mạng, cơ sở dữ liệu) và có khả năng khôi phục.
- Ném `RuntimeException` khi lỗi là do lập trình viên viết sai mã, và việc xử lý thường không mang lại giá trị.

**Ví dụ**:
```java
public void processInput(String input) {
    if (input == null) {
        throw new IllegalArgumentException("Input cannot be null");
    }
    // Xử lý input
}
```
Trong trường hợp trên, `IllegalArgumentException` (một `RuntimeException`) được ném để báo hiệu lỗi logic, không yêu cầu người gọi phải bắt.

---

### 4. Ví dụ nào điển hình cho checked (`IOException`) và unchecked (`NullPointerException`)? Vì sao thiết kế như vậy?

**Ví dụ điển hình**:
- **Checked: `IOException`**:
    - Xảy ra khi làm việc với tài nguyên bên ngoài như file, mạng, hoặc thiết bị I/O.
    - Ví dụ: Đọc/ghi file (`FileNotFoundException`, `EOFException`).
    - **Lý do thiết kế**: Các lỗi này thường nằm ngoài tầm kiểm soát của chương trình (file không tồn tại, mất kết nối mạng). Bắt buộc xử lý giúp đảm bảo chương trình xử lý các tình huống bất thường một cách an toàn, ví dụ:
      ```java
      try {
          FileInputStream file = new FileInputStream("data.txt");
      } catch (IOException e) {
          System.err.println("Error reading file: " + e.getMessage());
      }
      ```
- **Unchecked: `NullPointerException`**:
    - Xảy ra khi cố gắng truy cập phương thức hoặc thuộc tính của một đối tượng null.
    - Ví dụ: `String str = null; str.length();` sẽ ném `NullPointerException`.
    - **Lý do thiết kế**: Đây là lỗi logic do lập trình viên, có thể tránh được bằng cách kiểm tra null trước khi sử dụng. Không bắt buộc xử lý để tránh làm mã phức tạp, vì lỗi này nên được sửa trong quá trình phát triển.

**Lý do thiết kế tổng quát**:
- **Checked exceptions**: Được thiết kế để xử lý các tình huống bất thường nhưng có thể khôi phục, liên quan đến tài nguyên bên ngoài. Trình biên dịch ép buộc xử lý để đảm bảo tính an toàn và rõ ràng.
- **Unchecked exceptions**: Dành cho lỗi logic hoặc các vấn đề có thể tránh được trong mã nguồn. Không ép buộc xử lý để giữ mã gọn gàng và tập trung vào logic chính.

---

### 5. `Error` có nên catch không? Trường hợp ngoại lệ nào có thể cân nhắc?

**Có nên catch `Error` không?**:
- **Không nên catch `Error`** trong hầu hết các trường hợp, vì:
    - `Error` biểu thị các vấn đề nghiêm trọng, không thể khôi phục, như `OutOfMemoryError` (hết bộ nhớ) hoặc `StackOverflowError` (tràn ngăn xếp).
    - Việc bắt `Error` thường không có ý nghĩa, vì chương trình không thể tiếp tục hoạt động bình thường sau khi lỗi xảy ra.
    - JVM thường sử dụng `Error` để báo hiệu cần dừng chương trình, và việc can thiệp có thể gây ra hành vi không mong muốn.

**Trường hợp ngoại lệ có thể cân nhắc**:
- **Ghi log hoặc dọn dẹp tài nguyên**: Trong các ứng dụng lớn (như máy chủ), có thể bắt một số `Error` để ghi log lỗi hoặc giải phóng tài nguyên trước khi dừng chương trình.
    - Ví dụ: Bắt `OutOfMemoryError` để ghi log chi tiết về trạng thái hệ thống, sau đó dừng ứng dụng một cách an toàn.
  ```java
  try {
      // Code có thể gây OutOfMemoryError
  } catch (OutOfMemoryError e) {
      Logger.getLogger().severe("Critical error: " + e.getMessage());
      // Dọn dẹp tài nguyên
      System.exit(1);
  }
  ```
- **Ứng dụng đặc biệt**: Trong các hệ thống yêu cầu tính sẵn sàng cao (high availability), có thể bắt `Error` để chuyển hướng sang trạng thái khôi phục hoặc chuyển đổi dự phòng (failover).
- **ThreadDeath**: Trong các ứng dụng sử dụng thread, có thể bắt `ThreadDeath` để xử lý việc dừng thread một cách an toàn (mặc dù hiếm gặp).

**Lưu ý**: Việc bắt `Error` phải được thực hiện cẩn thận, chỉ trong các trường hợp đặc biệt, và không nên lạm dụng để tránh che giấu các vấn đề nghiêm trọng.

---

### 6. “Fail fast” liên quan gì tới việc chọn loại exception?

**“Fail fast” là gì?**:
- “Fail fast” là nguyên tắc thiết kế trong lập trình, trong đó chương trình nên dừng hoặc báo lỗi ngay lập tức khi phát hiện vấn đề, thay vì tiếp tục chạy trong trạng thái không ổn định.
- Mục tiêu: Giảm thiểu thiệt hại, dễ dàng debug, và tránh các lỗi phức tạp hơn về sau.

**Liên quan đến việc chọn loại exception**:
- **Sử dụng `RuntimeException` (unchecked) để “fail fast”**:
    - Khi phát hiện lỗi logic hoặc trạng thái không hợp lệ (như tham số sai, đối tượng null), ném `RuntimeException` (hoặc các lớp con như `IllegalArgumentException`, `IllegalStateException`) để dừng chương trình ngay lập tức.
    - Lý do: Các lỗi này thường do lập trình viên và có thể tránh được trong quá trình phát triển. Việc ném `RuntimeException` giúp phát hiện lỗi sớm trong giai đoạn kiểm thử, thay vì để lỗi lan rộng.
    - Ví dụ:
      ```java
      public void setAge(int age) {
          if (age < 0) {
              throw new IllegalArgumentException("Age cannot be negative");
          }
          this.age = age;
      }
      ```
- **Tránh lạm dụng checked exceptions cho “fail fast”**:
    - Checked exceptions thường dùng cho các tình huống có thể khôi phục, không phù hợp với nguyên tắc “fail fast” vì chúng buộc người gọi phải xử lý, làm chậm quá trình phát hiện lỗi.
    - Ví dụ: Nếu một phương thức yêu cầu tham số không null nhưng lại ném checked exception như `IOException`, điều này không phù hợp và làm mã khó hiểu.

**Lợi ích của “fail fast” với `RuntimeException`**:
- Giúp phát hiện lỗi sớm trong quá trình phát triển hoặc kiểm thử.
- Giảm thiểu rủi ro khi chương trình chạy trong trạng thái không ổn định.
- Tăng tính rõ ràng của mã, vì lỗi logic được báo ngay lập tức.

**Kết luận**:
- Chọn `RuntimeException` khi muốn áp dụng “fail fast” cho các lỗi logic hoặc trạng thái không hợp lệ.
- Sử dụng checked exceptions khi lỗi liên quan đến tài nguyên bên ngoài và có khả năng khôi phục.

---

## II) Cú pháp try–catch–finally

### 7. Quy tắc **thứ tự catch** khi bắt nhiều loại? Thế nào là “unreachable catch”?

**Quy tắc thứ tự catch**:
- Khi bắt nhiều ngoại lệ, các khối `catch` phải được sắp xếp từ **cụ thể** (specific) đến **chung chung** (general).
- Lý do: Java xử lý các khối `catch` theo thứ tự từ trên xuống. Nếu khối `catch` cho lớp cha đứng trước, nó sẽ bắt tất cả ngoại lệ của lớp con, khiến các khối sau trở thành vô nghĩa.
- Ví dụ đúng:
  ```java
  try {
      FileInputStream file = new FileInputStream("file.txt");
  } catch (FileNotFoundException e) {
      // Xử lý ngoại lệ cụ thể
  } catch (IOException e) {
      // Xử lý ngoại lệ chung hơn
  } catch (Exception e) {
      // Xử lý ngoại lệ chung nhất
  }
  ```

**Unreachable catch**:
- Là khối `catch` không bao giờ được thực thi vì ngoại lệ đã bị bắt bởi một khối `catch` trước đó (thường là lớp cha).
- Gây lỗi biên dịch vì trình biên dịch phát hiện mã không thể truy cập.
- Ví dụ lỗi:
  ```java
  try {
      // Code ném IOException
  } catch (Exception e) {
      // Bắt tất cả ngoại lệ, bao gồm IOException
  } catch (IOException e) { // Lỗi: unreachable catch
      // Không bao giờ chạy
  }
  ```
- **Cách khắc phục**: Đặt các khối `catch` cho ngoại lệ cụ thể trước, ngoại lệ chung sau.

---

### 8. Multi-catch (`catch (A | B e)`) hoạt động ra sao? Giới hạn với quan hệ kế thừa?

**Cách hoạt động của multi-catch**:
- Được giới thiệu trong Java 7, cho phép một khối `catch` xử lý nhiều loại ngoại lệ bằng toán tử `|`.
- Cú pháp: `catch (Type1 | Type2 e)`.
- Khi ngoại lệ thuộc bất kỳ loại nào trong danh sách được ném, khối `catch` sẽ xử lý.
- Biến `e` có kiểu là giao điểm của các loại ngoại lệ (thường là lớp cha chung gần nhất).
- Ví dụ:
  ```java
  try {
      // Code ném IOException hoặc SQLException
  } catch (IOException | SQLException e) {
      System.err.println("Error: " + e.getMessage());
  }
  ```

**Giới hạn với quan hệ kế thừa**:
- Các loại ngoại lệ trong multi-catch **không được có quan hệ kế thừa** (một loại không được là lớp con của loại khác).
- Lý do: Nếu có quan hệ kế thừa, lớp cha đã bao gồm lớp con, gây dư thừa và lỗi biên dịch.
- Ví dụ lỗi:
  ```java
  try {
      // Code
  } catch (IOException | FileNotFoundException e) { // Lỗi biên dịch
      // FileNotFoundException là con của IOException
  }
  ```
- **Cách xử lý**: Chỉ liệt kê các ngoại lệ không có quan hệ kế thừa hoặc sử dụng lớp cha chung.

**Lợi ích**:
- Giảm mã trùng lặp khi xử lý nhiều ngoại lệ giống nhau.
- Tăng tính ngắn gọn và dễ đọc.

---

### 9. `finally` chạy khi nào? Liệt kê các trường hợp **không** chạy được `finally`.

**`finally` chạy khi nào**:
- Khối `finally` thực thi **sau** khi `try` hoặc `catch` hoàn tất, bất kể ngoại lệ có được ném hay không.
- Mục đích: Đảm bảo dọn dẹp tài nguyên (như đóng file, giải phóng kết nối).
- Các trường hợp chạy:
    - Sau khi `try` hoàn thành mà không ném ngoại lệ.
    - Sau khi `catch` xử lý ngoại lệ.
    - Ngay cả khi có `return`, `break`, hoặc `continue` trong `try`/`catch`.
- Ví dụ:
  ```java
  try {
      // Code
  } catch (Exception e) {
      // Xử lý ngoại lệ
  } finally {
      System.out.println("Finally executed");
  }
  ```

**Trường hợp `finally` không chạy**:
1. **Gọi `System.exit(0)`**: Dừng JVM ngay lập tức.
   ```java
   try {
       System.exit(0);
   } finally {
       // Không chạy
   }
   ```
2. **JVM gặp lỗi nghiêm trọng**: Như `OutOfMemoryError` hoặc crash hệ thống.
3. **Thread bị gián đoạn**: Thread bị dừng đột ngột (hiếm gặp).
4. **Vòng lặp vô hạn hoặc treo máy**:
   ```java
   try {
       while (true) {} // Vòng lặp vô hạn
   } finally {
       // Không chạy
   }
   ```
5. **Máy bị tắt nguồn**: Hệ thống hoặc phần cứng bị ngắt trước khi `finally` chạy.

---

### 10. `return` trong `try` vs `finally`: giá trị trả về cuối cùng là gì?

**Hành vi của `return`**:
- Nếu `try` hoặc `catch` có `return`, giá trị trả về được lưu tạm trước khi `finally` chạy.
- Nếu `finally` chứa `return`, giá trị từ `finally` sẽ **ghi đè** giá trị từ `try`/`catch`.
- **Kết luận**: Giá trị trả về cuối cùng là từ `return` trong `finally` (nếu có).

**Ví dụ**:
```java
public int testReturn() {
    try {
        return 1; // Lưu tạm 1
    } finally {
        return 2; // Ghi đè, trả về 2
    }
}
```
- Kết quả: Trả về `2`.

**Lưu ý**:
- Nếu `finally` không có `return`, giá trị từ `try` hoặc `catch` được trả về.
- Tránh dùng `return` trong `finally` vì:
    - Làm mã khó hiểu.
    - Có thể che giấu ngoại lệ trong `catch`.
- Chỉ nên dùng `finally` để dọn dẹp tài nguyên.

**Ví dụ không có `return` trong `finally`**:
```java
public int testReturn() {
    try {
        return 1;
    } finally {
        System.out.println("Cleaning up");
    }
}
```
- Kết quả: Trả về `1`, in "Cleaning up".

---

### 11. Khi `catch` ném exception mới, cái cũ có mất không? Cách bảo toàn ngữ cảnh?

**Cái cũ có mất không?**:
- Nếu `catch` ném ngoại lệ mới (`throw new Exception()`), ngoại lệ ban đầu sẽ **mất** nếu không được lưu.
- Điều này gây khó khăn cho việc debug vì mất thông tin nguyên nhân gốc.

**Cách bảo toàn ngữ cảnh**:
- Sử dụng **exception chaining** để gắn ngoại lệ ban đầu vào ngoại lệ mới:
    - Dùng constructor: `new Exception(message, cause)`.
    - Hoặc phương thức `initCause(Throwable cause)` (ít dùng hơn).
- Ví dụ:
  ```java
  try {
      FileInputStream file = new FileInputStream("file.txt");
  } catch (IOException e) {
      throw new RuntimeException("Failed to read file", e); // Bảo toàn IOException
  }
  ```
    - `IOException` được gắn vào `RuntimeException` như nguyên nhân (`cause`).
    - Stack trace của `IOException` được giữ trong `getCause()`.

**Lợi ích**:
- Giữ thông tin gốc, hỗ trợ debug hiệu quả.
- Cho phép bọc ngoại lệ cụ thể thành loại chung hơn mà không mất ngữ cảnh.

**Lưu ý**:
- Chỉ ném ngoại lệ mới khi cần chuyển đổi loại hoặc thêm ngữ cảnh.
- Nếu không cần thay đổi, ném lại ngoại lệ gốc (xem câu 12).

---

### 12. Ném lại cùng đối tượng (`throw e;`) khác gì ném mới `throw new E(e);` về stack trace?

**Ném lại cùng đối tượng (`throw e;`)**:
- Giữ nguyên đối tượng ngoại lệ ban đầu, bao gồm **stack trace** và thông tin.
- Chỉ chuyển ngoại lệ lên cấp cao hơn mà không tạo đối tượng mới.
- Thích hợp khi không cần thay đổi loại ngoại lệ.
- Ví dụ:
  ```java
  try {
      // Code ném IOException
  } catch (IOException e) {
      throw e; // Giữ nguyên IOException và stack trace
  }
  ```
- **Stack trace**: Giữ nguyên stack trace gốc của `IOException`.

**Ném mới (`throw new E(e);`)**:
- Tạo đối tượng ngoại lệ mới, gắn ngoại lệ ban đầu (`e`) làm nguyên nhân (`cause`).
- Stack trace của ngoại lệ mới bắt đầu từ điểm ném, nhưng stack trace gốc được bảo toàn trong `cause`.
- Thích hợp khi cần bọc ngoại lệ hoặc thêm ngữ cảnh.
- Ví dụ:
  ```java
  try {
      // Code ném IOException
  } catch (IOException e) {
      throw new RuntimeException("Error reading file", e); // Bọc IOException
  }
  ```
- **Stack trace**:
    - Stack trace của `RuntimeException` bắt đầu từ `throw new RuntimeException`.
    - Stack trace của `IOException` được truy cập qua `getCause()`.

**So sánh chính**:
- `throw e;`: Giữ nguyên ngoại lệ và stack trace, không tạo overhead.
- `throw new E(e);`: Tạo ngoại lệ mới, stack trace mới, nhưng bảo toàn stack trace gốc trong `cause`.

**Khi nào dùng**:
- `throw e;`: Khi muốn giữ nguyên ngoại lệ ban đầu.
- `throw new E(e);`: Khi cần chuyển đổi loại ngoại lệ hoặc thêm ngữ cảnh.

**Ví dụ minh họa**:
```java
try {
    FileInputStream file = new FileInputStream("file.txt");
} catch (IOException e) {
    throw new RuntimeException("Error reading file", e);
}
```
- Stack trace: Hiển thị `RuntimeException` và `IOException` (qua `Caused by`).

---

## III) `throw` vs `throws`, lan truyền & override

### 13. Khác biệt giữa `throw` (runtime) và `throws` (compile-time)?

**`throw`**:
- Từ khóa dùng để **ném ngoại lệ** rõ ràng trong mã tại **runtime**.
- Cú pháp: `throw new ExceptionType("message");`.
- Dùng trong thân phương thức hoặc khối mã để báo hiệu lỗi hoặc tình huống bất thường.
- Có thể ném bất kỳ `Throwable` (`Error` hoặc `Exception`).
- Ví dụ:
  ```java
  if (input == null) {
      throw new IllegalArgumentException("Input cannot be null");
  }
  ```
- **Thời điểm**: Runtime (khi chương trình chạy).

**`throws`**:
- Từ khóa dùng để **khai báo** các ngoại lệ mà phương thức có thể ném tại **compile-time**.
- Cú pháp: `returnType methodName() throws ExceptionType1, ExceptionType2`.
- Đặt trong chữ ký phương thức để thông báo người gọi cần xử lý hoặc khai báo tiếp (cho checked exceptions).
- Chỉ áp dụng cho **checked exceptions** (ngoại trừ `RuntimeException` và `Error`).
- Ví dụ:
  ```java
  public void readFile(String path) throws IOException {
      FileInputStream file = new FileInputStream(path);
  }
  ```
- **Thời điểm**: Compile-time (trình biên dịch kiểm tra).

**Khác biệt chính**:
- `throw`: Thực hiện ném ngoại lệ trong mã, xảy ra lúc chạy.
- `throws`: Khai báo ngoại lệ phương thức có thể ném, kiểm tra lúc biên dịch.
- `throw`: Ném bất kỳ `Throwable`.
- `throws`: Chủ yếu cho checked exceptions, thông báo hợp đồng cho người gọi.

---

### 14. Quy tắc ***exception propagation***: từ điểm ném đến `catch` phù hợp được chọn như thế nào?

**Exception propagation**:
- Khi ngoại lệ được ném (`throw`) mà không được xử lý bởi `try-catch` tại chỗ, nó **lan truyền ngược** qua ngăn xếp gọi (call stack) đến các phương thức gọi, cho đến khi gặp `catch` phù hợp hoặc chương trình dừng.

**Cách chọn khối `catch` phù hợp**:
1. **Kiểm tra tại phương thức hiện tại**:
    - JVM kiểm tra các khối `catch` theo thứ tự từ trên xuống.
    - Ngoại lệ được xử lý bởi khối `catch` đầu tiên khớp với loại ngoại lệ (hoặc lớp cha).
2. **Lan truyền qua ngăn xếp gọi**:
    - Nếu không có `catch` phù hợp, ngoại lệ chuyển đến phương thức gọi nó.
    - Quá trình tiếp tục đến `main()`; nếu vẫn không bắt, JVM dừng và in stack trace.
3. **Khớp loại ngoại lệ**:
    - Khối `catch` chỉ bắt ngoại lệ nếu nó là **instance** của lớp trong `catch` hoặc lớp con.
    - Ví dụ:
      ```java
      try {
          throw new FileNotFoundException("File not found");
      } catch (IOException e) {
          // Bắt được vì FileNotFoundException là con của IOException
      } catch (Exception e) {
          // Không chạy vì đã bị bắt trước
      }
      ```

**Ví dụ lan truyền**:
```java
public void methodA() throws IOException {
    throw new IOException("Error in methodA");
}
public void methodB() throws IOException {
    methodA(); // Lan truyền từ methodA
}
public void methodC() {
    try {
        methodB();
    } catch (IOException e) {
        System.err.println("Caught: " + e.getMessage());
    }
}
```
- `IOException` ném từ `methodA`, lan truyền qua `methodB`, bắt tại `methodC`.

**Lưu ý**:
- **Checked exceptions**: Phải khai báo `throws` nếu không bắt tại chỗ.
- **Unchecked exceptions**: (`RuntimeException`, `Error`) không cần `throws`, vẫn lan truyền.

---

### 15. Khi override, phương thức con được phép khai báo `throws` rộng/hẹp thế nào so với cha (checked/unchecked)?

**Quy tắc khi override**:
- Phương thức con ghi đè (override) phương thức cha phải tuân theo:
    1. **Checked exceptions**:
        - Có thể khai báo **ít hơn** hoặc **hẹp hơn** (ngoại lệ là lớp con của ngoại lệ trong phương thức cha, hoặc không khai báo).
        - Không được khai báo **rộng hơn** (ngoại lệ không phải lớp con của ngoại lệ trong cha).
        - Lý do: Đảm bảo tính đa hình; người gọi phương thức cha không mong ngoại lệ mới.
        - Ví dụ hợp lệ:
          ```java
          class Parent {
              void method() throws IOException {
                  // Code
              }
          }
          class Child extends Parent {
              @Override
              void method() throws FileNotFoundException { // Hẹp hơn, hợp lệ
                  // Code
              }
          }
          ```
        - Ví dụ lỗi:
          ```java
          class Parent {
              void method() throws IOException {
                  // Code
              }
          }
          class Child extends Parent {
              @Override
              void method() throws SQLException { // Lỗi: SQLException không phải con của IOException
                  // Code
              }
          }
          ```
    2. **Unchecked exceptions**:
        - Phương thức con có thể ném bất kỳ `RuntimeException` nào, không bị ràng buộc bởi phương thức cha.
        - Lý do: Unchecked exceptions không cần khai báo `throws`.
        - Ví dụ:
          ```java
          class Parent {
              void method() {
                  // Code
              }
          }
          class Child extends Parent {
              @Override
              void method() throws RuntimeException { // Hợp lệ
                  // Code
              }
          }
          ```

**Tóm tắt**:
- **Checked**: Chỉ được khai báo ngoại lệ hẹp hơn hoặc không khai báo.
- **Unchecked**: Không giới hạn, có thể ném bất kỳ `RuntimeException`.
- Nếu cha không khai báo `throws`, con không được khai báo checked exceptions.

---

### 16. Constructor khai báo `throws` có khác gì method thường?

**Constructor và `throws`**:
- Constructor có thể khai báo `throws` như phương thức để chỉ ra các ngoại lệ có thể ném.
- Cú pháp:
  ```java
  public ClassName() throws ExceptionType {
      // Code
  }
  ```

**Khác biệt so với phương thức**:
1. **Mục đích**:
    - Constructor: Ném ngoại lệ khi không thể khởi tạo đối tượng hợp lệ (ví dụ: dữ liệu đầu vào sai, không truy cập được tài nguyên).
    - Phương thức: Ném ngoại lệ liên quan đến logic nghiệp vụ.
    - Ví dụ constructor:
      ```java
      public FileReader(String fileName) throws FileNotFoundException {
          File file = new File(fileName);
          if (!file.exists()) {
              throw new FileNotFoundException("File not found: " + fileName);
          }
      }
      ```
2. **Cách gọi**:
    - Constructor gọi bằng `new`, người gọi phải xử lý checked exceptions bằng `try-catch` hoặc `throws`, tương tự phương thức.
    - Constructor không trả về giá trị, nên ngữ cảnh xử lý liên quan đến khởi tạo đối tượng.
    - Ví dụ:
      ```java
      try {
          FileReader reader = new FileReader("file.txt");
      } catch (FileNotFoundException e) {
          System.err.println("Error: " + e.getMessage());
      }
      ```
3. **Override không áp dụng**:
    - Constructor không được ghi đè, nên không chịu ràng buộc `throws` như phương thức.
    - Nhưng constructor con phải xử lý hoặc khai báo ngoại lệ từ constructor cha (qua `super()`).
    - Ví dụ:
      ```java
      class Parent {
          Parent() throws IOException {
              // Code
          }
      }
      class Child extends Parent {
          Child() throws IOException {
              super(); // Phải xử lý hoặc khai báo IOException
          }
      }
      ```

**Điểm giống nhau**:
- Cả hai dùng `throws` để khai báo checked exceptions.
- Có thể ném unchecked exceptions mà không cần khai báo.

**Tóm tắt**:
- Constructor khai báo `throws` giống phương thức về cú pháp, nhưng khác ở mục đích (khởi tạo) và không chịu ràng buộc override.

---

### 17. Có thể `throws` một generic type không? Vì sao không?

**Có thể `throws` generic type không?**:
- **Không**, Java không cho phép khai báo `throws` với generic type trực tiếp.
- Lý do:
    1. **Type erasure**:
        - Generic type (`T`) bị xóa tại compile-time, thay bằng `Object` hoặc giới hạn trên, khiến JVM không thể xác định kiểu ngoại lệ tại runtime.
        - Ví dụ lỗi:
          ```java
          public <T extends Throwable> void method() throws T { // Lỗi biên dịch
              // Code
          }
          ```
    2. **Kiểm tra compile-time**:
        - Trình biên dịch cần biết chính xác loại ngoại lệ trong `throws` để ép buộc xử lý (cho checked exceptions). Generic type gây mơ hồ.
    3. **Hợp đồng rõ ràng**:
        - `throws` yêu cầu ngoại lệ cụ thể hoặc lớp cha. Generic type không đáp ứng vì có thể đại diện cho bất kỳ kiểu nào.

**Cách thay thế**:
- Dùng kiểu cụ thể (`Exception`, `IOException`,...) trong `throws`.
- Xử lý generic trong thân phương thức, không phải trong `throws`.
- Ví dụ hợp lệ:
  ```java
  public <T extends Exception> void processException(T exception) throws Exception {
      throw exception; // Ném generic trong thân phương thức
  }
  ```

**Tóm tắt**:
- Không thể `throws` generic type do type erasure, yêu cầu compile-time, và cần hợp đồng rõ ràng.
- Dùng kiểu cụ thể hoặc xử lý generic trong thân phương thức.

---

## IV) Try-with-resources (TWR) & Suppressed exceptions

### 18. TWR cần interface nào? Khác biệt `AutoCloseable` vs `Closeable`?

**TWR cần interface**:
- Try-with-resources (TWR) yêu cầu tài nguyên phải implement interface `AutoCloseable` (từ Java 7).
- Cú pháp:
  ```java
  try (ResourceType resource = new ResourceType()) {
      // Sử dụng resource
  } // resource.close() tự động được gọi
  ```

**`AutoCloseable` vs `Closeable`**:
- **`AutoCloseable`** (`java.lang.AutoCloseable`):
    - Interface tổng quát cho TWR, chỉ có phương thức `close() throws Exception`.
    - Cho phép ném bất kỳ `Exception` nào từ `close()`.
    - Phù hợp cho các tài nguyên đa dạng (file, database, network).
    - Ví dụ:
      ```java
      public class MyResource implements AutoCloseable {
          @Override
          public void close() throws Exception {
              // Dọn dẹp tài nguyên
          }
      }
      ```
- **`Closeable`** (`java.io.Closeable`):
    - Kế thừa từ `AutoCloseable`, chuyên dụng cho I/O operations.
    - Phương thức `close() throws IOException` (hẹp hơn).
    - Yêu cầu `close()` phải **idempotent** (gọi nhiều lần không gây lỗi).
    - Phù hợp cho streams, readers, writers.
    - Ví dụ:
      ```java
      public class FileInputStream implements Closeable {
          @Override
          public void close() throws IOException {
              // Đóng file stream
          }
      }
      ```

**Khác biệt chính**:
- `AutoCloseable`: Tổng quát, ném `Exception`.
- `Closeable`: Chuyên I/O, ném `IOException`, yêu cầu idempotent.

---

### 19. Tài nguyên được đóng theo **thứ tự nào** khi có nhiều resource?

**Thứ tự đóng tài nguyên**:
- Tài nguyên được đóng theo thứ tự **ngược lại** với thứ tự khai báo (LIFO - Last In, First Out).
- Tương tự như ngăn xếp: tài nguyên khai báo cuối cùng được đóng trước.

**Ví dụ**:
```java
try (FileInputStream fis = new FileInputStream("input.txt");    // Đóng thứ 3
     FileOutputStream fos = new FileOutputStream("output.txt"); // Đóng thứ 2
     BufferedReader br = new BufferedReader(new FileReader("data.txt"))) { // Đóng thứ 1
    // Sử dụng tài nguyên
}
// Thứ tự đóng: br.close() → fos.close() → fis.close()
```

**Lý do thiết kế**:
- Đảm bảo tài nguyên phụ thuộc được đóng trước tài nguyên chính.
- Ví dụ: `BufferedReader` phụ thuộc vào `FileReader`, nên `BufferedReader` phải đóng trước.
- Tránh lỗi khi tài nguyên con cố truy cập tài nguyên cha đã bị đóng.

**Lưu ý**:
- Nếu một tài nguyên ném exception khi đóng, các tài nguyên còn lại vẫn được đóng.
- Exception từ việc đóng tài nguyên sẽ bị suppressed (trừ trường hợp đặc biệt).

---

### 20. Nếu cả **khối try** và **đóng resource** đều ném exception, cái nào là chính, cái nào bị **suppressed**?

**Quy tắc exception chính và suppressed**:
- **Exception từ khối `try`** là **exception chính** (primary exception).
- **Exception từ `close()`** bị **suppressed** (phụ thuộc).
- Lý do: Exception từ logic nghiệp vụ quan trọng hơn exception từ việc dọn dẹp.

**Ví dụ**:
```java
try (MyResource resource = new MyResource()) {
    throw new RuntimeException("Error in try block"); // Exception chính
} // resource.close() ném IOException → bị suppressed
```
- Kết quả: `RuntimeException` được ném, `IOException` từ `close()` bị suppressed.

**Trường hợp đặc biệt**:
- Nếu khối `try` hoàn thành bình thường (không ném exception), nhưng `close()` ném exception, thì exception từ `close()` trở thành exception chính.
- Ví dụ:
  ```java
  try (MyResource resource = new MyResource()) {
      // Không ném exception
  } // resource.close() ném IOException → trở thành exception chính
  ```

**Nhiều tài nguyên**:
- Nếu nhiều tài nguyên ném exception khi đóng, exception đầu tiên (từ tài nguyên đóng đầu tiên) là chính, các exception sau bị suppressed.

**Lợi ích**:
- Đảm bảo exception quan trọng nhất không bị che khuất.
- Vẫn giữ thông tin về tất cả exception thông qua suppressed exceptions.

---

### 21. Lấy exceptions bị **suppressed** bằng API nào? Khi nào suppressed bị tắt?

**API lấy suppressed exceptions**:
- Sử dụng phương thức `getSuppressed()` của `Throwable`:
  ```java
  Throwable[] suppressed = exception.getSuppressed();
  ```
- Trả về mảng các `Throwable` bị suppressed.

**Ví dụ**:
```java
try (MyResource1 r1 = new MyResource1();
     MyResource2 r2 = new MyResource2()) {
    throw new RuntimeException("Main exception");
} catch (Exception e) {
    System.out.println("Main: " + e.getMessage());
    for (Throwable suppressed : e.getSuppressed()) {
        System.out.println("Suppressed: " + suppressed.getMessage());
    }
}
```

**Khi nào suppressed bị tắt**:
1. **Constructor với `enableSuppression = false`**:
   ```java
   public MyException(String message) {
       super(message, null, false, true); // Tắt suppression
   }
   ```
2. **Tài nguyên không ném exception khi đóng**: Không có gì để suppress.
3. **Exception được tạo với suppression bị vô hiệu hóa**: Một số exception đặc biệt có thể tắt tính năng này để tiết kiệm bộ nhớ.

**Lưu ý**:
- Suppressed exceptions hữu ích cho debugging, giúp hiểu toàn bộ ngữ cảnh lỗi.
- Không nên tắt suppression trừ khi có lý do đặc biệt về hiệu năng.

---

### 22. Có nên cho `close()` ném checked exception? Thiết kế thế nào để dùng TWR mượt?

**Có nên cho `close()` ném checked exception?**:
- **Tùy thuộc vào ngữ cảnh**:
    - **Nên ném checked exception** khi việc đóng tài nguyên có thể thất bại và cần xử lý (ví dụ: flush dữ liệu, commit transaction).
    - **Không nên ném** khi việc đóng chỉ là dọn dẹp đơn giản và lỗi không quan trọng.

**Thiết kế để TWR mượt**:
1. **Implement `Closeable` thay vì `AutoCloseable`** khi có thể:
   ```java
   public class MyResource implements Closeable {
       @Override
       public void close() throws IOException { // Cụ thể hơn Exception
           // Dọn dẹp
       }
   }
   ```
2. **Idempotent `close()`**: Gọi nhiều lần không gây lỗi:
   ```java
   private boolean closed = false;

   @Override
   public void close() throws IOException {
       if (!closed) {
           // Thực hiện đóng
           closed = true;
       }
   }
   ```
3. **Xử lý exception trong `close()` nếu không quan trọng**:
   ```java
   @Override
   public void close() {
       try {
           // Đóng tài nguyên
       } catch (Exception e) {
           // Log nhưng không ném lại
           logger.warn("Error closing resource", e);
       }
   }
   ```
4. **Cung cấp phương thức `closeQuietly()`** cho trường hợp không muốn xử lý exception:
   ```java
   public void closeQuietly() {
       try {
           close();
       } catch (Exception ignored) {
           // Bỏ qua lỗi
       }
   }
   ```

**Khuyến nghị**:
- Ném checked exception khi lỗi đóng tài nguyên có ý nghĩa nghiệp vụ.
- Thiết kế idempotent và cung cấp cả phiên bản "quiet" nếu cần.

---

### 23. TWR với biến resource **không final nhưng effectively final**: quy tắc compiler?

**Quy tắc effectively final**:
- Từ Java 9, TWR cho phép sử dụng biến **effectively final** (biến không được gán lại sau khởi tạo) làm resource.
- Trước Java 9, chỉ cho phép khai báo resource trực tiếp trong TWR.

**Ví dụ Java 9+**:
```java
FileInputStream fis = new FileInputStream("file.txt"); // Effectively final
try (fis) { // Hợp lệ từ Java 9
    // Sử dụng fis
}
```

**So sánh với cách cũ**:
```java
// Java 7-8: Phải khai báo trong TWR
try (FileInputStream fis = new FileInputStream("file.txt")) {
    // Sử dụng fis
}
```

**Quy tắc compiler**:
1. **Biến phải effectively final**: Không được gán lại sau khởi tạo.
2. **Phải implement `AutoCloseable`**: Giống như khai báo trực tiếp.
3. **Compiler tự động gọi `close()`**: Tương tự như TWR truyền thống.

**Ví dụ lỗi**:
```java
FileInputStream fis = new FileInputStream("file.txt");
fis = new FileInputStream("other.txt"); // Gán lại → không effectively final
try (fis) { // Lỗi biên dịch
    // Code
}
```

**Lợi ích**:
- Tăng tính linh hoạt, cho phép khởi tạo resource ở nơi khác.
- Giảm lồng nhau khi có logic phức tạp trước khi sử dụng resource.

---

### 24. Viết ví dụ TWR 3 resource và phân tích danh sách `getSuppressed()` khi lỗi kép.

**Ví dụ TWR với 3 resource**:
```java
class Resource1 implements AutoCloseable {
    @Override
    public void close() throws Exception {
        throw new RuntimeException("Error closing Resource1");
    }
}

class Resource2 implements AutoCloseable {
    @Override
    public void close() throws Exception {
        throw new IOException("Error closing Resource2");
    }
}

class Resource3 implements AutoCloseable {
    @Override
    public void close() throws Exception {
        throw new SQLException("Error closing Resource3");
    }
}

public class TWRExample {
    public static void main(String[] args) {
        try (Resource1 r1 = new Resource1();
             Resource2 r2 = new Resource2();
             Resource3 r3 = new Resource3()) {

            throw new IllegalArgumentException("Error in try block");

        } catch (Exception e) {
            System.out.println("Main exception: " + e.getClass().getSimpleName() + " - " + e.getMessage());

            Throwable[] suppressed = e.getSuppressed();
            System.out.println("Number of suppressed: " + suppressed.length);

            for (int i = 0; i < suppressed.length; i++) {
                System.out.println("Suppressed[" + i + "]: " +
                    suppressed[i].getClass().getSimpleName() + " - " + suppressed[i].getMessage());
            }
        }
    }
}
```

**Phân tích kết quả**:
```
Main exception: IllegalArgumentException - Error in try block
Number of suppressed: 3
Suppressed[0]: SQLException - Error closing Resource3
Suppressed[1]: IOException - Error closing Resource2
Suppressed[2]: RuntimeException - Error closing Resource1
```

**Giải thích**:
1. **Exception chính**: `IllegalArgumentException` từ khối try.
2. **Thứ tự suppressed**: Theo thứ tự đóng resource (LIFO):
   - Resource3 đóng đầu tiên → SQLException suppressed đầu tiên
   - Resource2 đóng thứ hai → IOException suppressed thứ hai
   - Resource1 đóng cuối cùng → RuntimeException suppressed cuối cùng
3. **Tất cả exception từ `close()`** đều bị suppressed vì có exception chính từ try block.

**Trường hợp không có exception trong try**:
```java
try (Resource1 r1 = new Resource1();
     Resource2 r2 = new Resource2();
     Resource3 r3 = new Resource3()) {
    // Không ném exception
}
```
- **Exception chính**: SQLException (từ Resource3 đóng đầu tiên)
- **Suppressed**: IOException và RuntimeException (từ Resource2 và Resource1)

---

## V) Stack trace, cause & rethrow

### 25. Stack trace gồm những gì? Ý nghĩa từng `StackTraceElement`?

**Stack trace gồm**:
- Stack trace là danh sách các phương thức được gọi từ điểm ném exception đến điểm bắt đầu chương trình.
- Hiển thị **call stack** tại thời điểm exception xảy ra, giúp debug và tìm nguyên nhân lỗi.
- Được tạo tự động khi exception được khởi tạo (gọi `fillInStackTrace()`).

**Cấu trúc `StackTraceElement`**:
Mỗi `StackTraceElement` chứa thông tin về một frame trong call stack:
- **`className`**: Tên đầy đủ của lớp chứa phương thức.
- **`methodName`**: Tên phương thức được gọi.
- **`fileName`**: Tên file source code (có thể null nếu không có).
- **`lineNumber`**: Số dòng trong file (có thể -1 nếu không xác định).

**Ví dụ**:
```java
public class StackTraceExample {
    public static void main(String[] args) {
        try {
            methodA();
        } catch (Exception e) {
            StackTraceElement[] stack = e.getStackTrace();
            for (StackTraceElement element : stack) {
                System.out.println("Class: " + element.getClassName());
                System.out.println("Method: " + element.getMethodName());
                System.out.println("File: " + element.getFileName());
                System.out.println("Line: " + element.getLineNumber());
                System.out.println("---");
            }
        }
    }

    static void methodA() { methodB(); }
    static void methodB() { methodC(); }
    static void methodC() { throw new RuntimeException("Error"); }
}
```

**Kết quả**:
```
Class: StackTraceExample
Method: methodC
File: StackTraceExample.java
Line: 20
---
Class: StackTraceExample
Method: methodB
File: StackTraceExample.java
Line: 19
---
Class: StackTraceExample
Method: methodA
File: StackTraceExample.java
Line: 18
---
Class: StackTraceExample
Method: main
File: StackTraceExample.java
Line: 4
```

**Ý nghĩa**:
- Giúp xác định chính xác nơi exception xảy ra và đường dẫn gọi.
- Hỗ trợ debug hiệu quả, đặc biệt trong ứng dụng phức tạp.

---

### 26. `initCause`, constructor `(message, cause)` và **exception chaining** giúp gì khi debug?

**Exception chaining**:
- Là kỹ thuật liên kết exception gốc với exception mới, tạo chuỗi nguyên nhân.
- Giúp bảo toàn thông tin lỗi gốc khi wrap hoặc chuyển đổi exception.

**Cách thực hiện**:
1. **Constructor `(message, cause)`**:
   ```java
   try {
       // Code ném IOException
   } catch (IOException e) {
       throw new RuntimeException("Failed to process file", e);
   }
   ```
2. **Phương thức `initCause()`**:
   ```java
   RuntimeException re = new RuntimeException("Failed to process file");
   re.initCause(originalException);
   throw re;
   ```

**Lợi ích khi debug**:
1. **Bảo toàn ngữ cảnh gốc**:
   - Stack trace hiển thị cả exception mới và exception gốc.
   - Có thể truy cập exception gốc qua `getCause()`.
2. **Chuỗi nguyên nhân rõ ràng**:
   ```
   RuntimeException: Failed to process file
       at MyClass.processFile(MyClass.java:15)
   Caused by: IOException: File not found
       at FileReader.<init>(FileReader.java:72)
   ```
3. **Chuyển đổi exception type**:
   - Wrap checked exception thành unchecked mà không mất thông tin.
   - Chuyển low-level exception thành business exception.

**Ví dụ thực tế**:
```java
public void processUserData(String userId) throws UserProcessingException {
    try {
        String data = databaseService.getUserData(userId);
        // Xử lý data
    } catch (SQLException e) {
        throw new UserProcessingException("Failed to process user: " + userId, e);
    }
}
```

**API hỗ trợ**:
- `getCause()`: Lấy exception gốc.
- `getRootCause()`: Đi sâu đến exception gốc nhất (tự implement).
- `printStackTrace()`: In toàn bộ chuỗi exception.

---

### 27. `fillInStackTrace()` làm gì? Chi phí? Khi nào nên hạn chế?

**`fillInStackTrace()` làm gì**:
- Ghi lại **call stack hiện tại** vào exception object.
- Được gọi tự động trong constructor của `Throwable`.
- Có thể gọi thủ công để **cập nhật** stack trace về vị trí hiện tại.

**Ví dụ**:
```java
public class CustomException extends Exception {
    public CustomException(String message) {
        super(message);
        // fillInStackTrace() đã được gọi tự động
    }

    public CustomException resetStackTrace() {
        fillInStackTrace(); // Cập nhật stack trace về vị trí này
        return this;
    }
}
```

**Chi phí**:
1. **CPU**: Duyệt qua call stack, tốn thời gian tỷ lệ với độ sâu stack.
2. **Memory**: Lưu trữ mảng `StackTraceElement[]`, có thể lớn với stack sâu.
3. **I/O**: Đọc thông tin debug từ class files (nếu có).

**Khi nào nên hạn chế**:
1. **Exception được ném thường xuyên**: Trong hot path hoặc vòng lặp.
2. **Exception dùng cho control flow**: Không phải lỗi thực sự.
3. **Performance-critical code**: Khi mỗi millisecond đều quan trọng.
4. **Exception pool**: Khi tái sử dụng exception objects.

**Cách hạn chế**:
1. **Tắt stack trace trong constructor**:
   ```java
   public class LightweightException extends Exception {
       public LightweightException(String message) {
           super(message, null, false, false); // Tắt stack trace
       }
   }
   ```
2. **Override `fillInStackTrace()`**:
   ```java
   @Override
   public synchronized Throwable fillInStackTrace() {
       return this; // Không làm gì, trả về this
   }
   ```
3. **Sử dụng static exception instances**:
   ```java
   private static final RuntimeException CACHED_EXCEPTION =
       new RuntimeException("Cached exception");
   ```

**Lưu ý**:
- Chỉ tối ưu khi thực sự cần thiết và đã đo đạc performance.
- Mất thông tin debug quan trọng khi tắt stack trace.

---

### 28. Làm sao **giữ nguyên stack trace gốc** khi wrap exception?

**Vấn đề**:
- Khi tạo exception mới, stack trace bắt đầu từ điểm tạo, mất thông tin về nơi lỗi thực sự xảy ra.

**Cách giữ nguyên stack trace gốc**:
1. **Sử dụng exception chaining** (khuyến nghị):
   ```java
   try {
       // Code ném IOException
   } catch (IOException e) {
       throw new RuntimeException("Wrapper message", e); // Giữ e làm cause
   }
   ```
   - Stack trace hiển thị cả wrapper và original exception.

2. **Copy stack trace từ exception gốc**:
   ```java
   try {
       // Code ném IOException
   } catch (IOException e) {
       RuntimeException wrapper = new RuntimeException("Wrapper message");
       wrapper.setStackTrace(e.getStackTrace()); // Copy stack trace
       throw wrapper;
   }
   ```
   - Wrapper có stack trace giống hệt original.

3. **Ném lại exception gốc** (nếu có thể):
   ```java
   try {
       // Code ném RuntimeException
   } catch (RuntimeException e) {
       // Thêm context nếu cần
       throw e; // Giữ nguyên exception và stack trace
   }
   ```

**So sánh các cách**:
- **Exception chaining**: Bảo toàn cả hai stack trace, rõ ràng nhất.
- **Copy stack trace**: Chỉ giữ stack trace gốc, mất thông tin về wrapper.
- **Ném lại**: Giữ nguyên hoàn toàn, nhưng không thêm được context.

**Ví dụ thực tế**:
```java
public void businessMethod() throws BusinessException {
    try {
        lowLevelOperation();
    } catch (SQLException e) {
        // Giữ nguyên stack trace gốc thông qua chaining
        throw new BusinessException("Business operation failed", e);
    }
}
```

**Kết quả stack trace**:
```
BusinessException: Business operation failed
    at MyClass.businessMethod(MyClass.java:10)
Caused by: SQLException: Connection timeout
    at Database.connect(Database.java:45)
```

---

### 29. `Throwable(String, Throwable, boolean enableSuppression, boolean writableStackTrace)` dùng trong tình huống nào?

**Constructor đầy đủ**:
```java
protected Throwable(String message,
                   Throwable cause,
                   boolean enableSuppression,
                   boolean writableStackTrace)
```

**Tham số**:
- **`message`**: Thông điệp lỗi.
- **`cause`**: Exception gốc (có thể null).
- **`enableSuppression`**: Cho phép suppressed exceptions hay không.
- **`writableStackTrace`**: Cho phép ghi stack trace hay không.

**Tình huống sử dụng**:
1. **Performance-critical exceptions** (`writableStackTrace = false`):
   ```java
   public class FastException extends Exception {
       public FastException(String message) {
           super(message, null, true, false); // Không tạo stack trace
       }
   }
   ```
   - Dùng khi exception được ném thường xuyên và stack trace không cần thiết.

2. **Control flow exceptions** (`enableSuppression = false, writableStackTrace = false`):
   ```java
   public class ControlFlowException extends Exception {
       public ControlFlowException() {
           super(null, null, false, false); // Tối ưu hoàn toàn
       }
   }
   ```
   - Dùng cho break/continue logic, không phải lỗi thực sự.

3. **Cached exceptions**:
   ```java
   private static final Exception TIMEOUT_EXCEPTION =
       new Exception("Timeout", null, false, false);
   ```
   - Tái sử dụng exception instance, không cần stack trace mới.

4. **Security-sensitive exceptions** (`writableStackTrace = false`):
   ```java
   public class SecurityException extends Exception {
       public SecurityException(String message) {
           super(message, null, true, false); // Không lộ stack trace
       }
   }
   ```
   - Tránh lộ thông tin nhạy cảm qua stack trace.

**Lưu ý**:
- Chỉ sử dụng khi thực sự cần thiết và hiểu rõ trade-off.
- Mất khả năng debug khi tắt stack trace.
- Hầu hết trường hợp nên dùng constructor mặc định.

---
30. “Precise rethrow” (Java 7) là gì? Lợi ích với inference kiểu `throws`?

**Precise rethrow**:
- Tính năng Java 7 cho phép rethrow exception với kiểu chính xác hơn, thay vì kiểu chung chung.
- Compiler suy luận kiểu exception thực tế được ném, không chỉ dựa vào kiểu khai báo.

**Trước Java 7**:
```java
public void oldWay() throws Exception { // Phải khai báo Exception chung chung
    try {
        methodThatThrowsIOException();
        methodThatThrowsSQLException();
    } catch (Exception e) {
        // Xử lý
        throw e; // Compiler chỉ biết e là Exception
    }
}
```

**Java 7+ với precise rethrow**:
```java
public void newWay() throws IOException, SQLException { // Có thể khai báo cụ thể
    try {
        methodThatThrowsIOException();
        methodThatThrowsSQLException();
    } catch (Exception e) {
        // Xử lý
        throw e; // Compiler biết e chỉ có thể là IOException hoặc SQLException
    }
}
```

**Điều kiện áp dụng**:
1. Exception parameter phải **effectively final**.
2. Các exception trong try block phải được khai báo cụ thể.
3. Không được gán exception parameter cho giá trị khác.

**Lợi ích**:
1. **API rõ ràng hơn**: Caller biết chính xác exception nào có thể được ném.
2. **Tránh khai báo `throws Exception`**: Giảm việc ép buộc caller xử lý exception chung chung.
3. **Better exception handling**: Caller có thể catch từng loại exception cụ thể.

**Ví dụ thực tế**:
```java
public void processFile(String filename) throws IOException, ParseException {
    try {
        String content = Files.readString(Paths.get(filename)); // IOException
        parseContent(content); // ParseException
    } catch (Exception e) {
        logger.error("Error processing file: " + filename, e);
        throw e; // Precise rethrow: chỉ IOException hoặc ParseException
    }
}
```

**So sánh**:
- **Trước Java 7**: Phải `throws Exception` hoặc catch từng loại riêng.
- **Java 7+**: Có thể rethrow với kiểu chính xác, API sạch hơn.

---

## VI) Quy tắc “thiết kế API” (core)

### 31. Khi nào nên chọn **checked** thay vì **unchecked** trong API công khai?

**Chọn checked exceptions khi**:
1. **Lỗi có thể khôi phục**: Caller có thể xử lý và tiếp tục hoạt động.
   ```java
   public void connectToDatabase() throws ConnectionException {
       // Caller có thể retry hoặc dùng fallback
   }
   ```

2. **Lỗi từ tài nguyên bên ngoài**: File, network, database không nằm trong tầm kiểm soát.
   ```java
   public String readConfig(String path) throws IOException {
       // File có thể không tồn tại, caller cần xử lý
   }
   ```

3. **API yêu cầu xử lý bắt buộc**: Khi việc bỏ qua lỗi có thể gây hậu quả nghiêm trọng.
   ```java
   public void transferMoney(Account from, Account to, BigDecimal amount)
           throws InsufficientFundsException, AccountClosedException {
       // Caller phải xử lý các trường hợp lỗi nghiệp vụ
   }
   ```

**Chọn unchecked exceptions khi**:
1. **Lỗi lập trình**: Caller có thể tránh được bằng cách kiểm tra điều kiện.
   ```java
   public void setAge(int age) {
       if (age < 0) throw new IllegalArgumentException("Age cannot be negative");
   }
   ```

2. **Lỗi không thể khôi phục**: Chương trình không thể tiếp tục hoạt động bình thường.
   ```java
   public void processData(List<String> data) {
       if (data == null) throw new NullPointerException("Data cannot be null");
   }
   ```

3. **API tiện ích**: Không muốn ép buộc caller xử lý exception cho mọi lần gọi.
   ```java
   public static int parseInt(String str) {
       // NumberFormatException (unchecked) thay vì checked
   }
   ```

**Nguyên tắc chung**:
- **Checked**: Khi caller **nên** xử lý lỗi.
- **Unchecked**: Khi caller **có thể** xử lý lỗi nhưng không bắt buộc.

---

### 32. Không nên khai báo `throws Exception` chung chung—vì sao?

**Vấn đề với `throws Exception`**:
1. **Mất thông tin cụ thể**: Caller không biết exception nào có thể xảy ra.
   ```java
   // Tệ
   public void processFile(String path) throws Exception {
       // Caller không biết có thể có IOException, ParseException, etc.
   }

   // Tốt
   public void processFile(String path) throws IOException, ParseException {
       // Caller biết chính xác exception nào cần xử lý
   }
   ```

2. **Ép buộc xử lý không cần thiết**: Caller phải catch Exception hoặc throws tiếp.
   ```java
   // Caller bị ép phải xử lý
   try {
       processFile("data.txt");
   } catch (Exception e) { // Quá chung chung
       // Không biết xử lý thế nào
   }
   ```

3. **Che giấu RuntimeException**: Có thể vô tình catch cả unchecked exceptions.
   ```java
   try {
       processFile("data.txt");
   } catch (Exception e) {
       // Có thể catch cả NullPointerException, IllegalArgumentException
       // mà không nên xử lý
   }
   ```

4. **Khó bảo trì**: Khi thêm exception mới, caller không biết cần cập nhật.
   ```java
   // Nếu thêm SecurityException vào processFile()
   // Caller hiện tại sẽ không biết cần xử lý
   ```

**Cách khắc phục**:
1. **Khai báo cụ thể**:
   ```java
   public void processFile(String path) throws IOException, ParseException {
       // Rõ ràng và dễ xử lý
   }
   ```

2. **Nhóm exception liên quan**:
   ```java
   public class ProcessingException extends Exception {
       // Base exception cho nhóm lỗi liên quan
   }

   public void processFile(String path) throws ProcessingException {
       try {
           // Processing logic
       } catch (IOException | ParseException e) {
           throw new ProcessingException("Failed to process file: " + path, e);
       }
   }
   ```

---

### 33. Đặt message thế nào để stack trace **hữu ích** (ngữ cảnh, tham số)?

**Nguyên tắc message hữu ích**:
1. **Bao gồm ngữ cảnh**: Mô tả đang làm gì khi lỗi xảy ra.
   ```java
   // Tệ
   throw new IOException("File not found");

   // Tốt
   throw new IOException("Failed to read configuration file: " + configPath);
   ```

2. **Bao gồm giá trị tham số**: Giúp debug nhanh hơn.
   ```java
   public void setAge(int age) {
       if (age < 0 || age > 150) {
           throw new IllegalArgumentException(
               "Age must be between 0 and 150, but was: " + age);
       }
   }
   ```

3. **Mô tả điều kiện vi phạm**: Giải thích tại sao lỗi xảy ra.
   ```java
   public void transfer(Account from, Account to, BigDecimal amount) {
       if (from.getBalance().compareTo(amount) < 0) {
           throw new InsufficientFundsException(
               "Cannot transfer " + amount + " from account " + from.getId() +
               " (balance: " + from.getBalance() + ") to account " + to.getId());
       }
   }
   ```

4. **Bao gồm ID/key để tra cứu**: Đặc biệt hữu ích trong hệ thống lớn.
   ```java
   public User findUser(String userId) throws UserNotFoundException {
       User user = userRepository.findById(userId);
       if (user == null) {
           throw new UserNotFoundException(
               "User not found with ID: " + userId + " in database: " + dbName);
       }
       return user;
   }
   ```

**Template message tốt**:
```java
// Pattern: "Action failed: reason [context] (parameters)"
throw new ProcessingException(
    "Failed to process order: insufficient inventory " +
    "[warehouse: " + warehouseId + "] " +
    "(requested: " + quantity + ", available: " + available + ")");
```

**Tránh**:
- Message quá chung chung: "Error occurred"
- Không có thông tin debug: "Invalid input"
- Lộ thông tin nhạy cảm: "Password incorrect for user admin"

---

### 34. Chọn loại exception cốt lõi phù hợp: `IllegalArgumentException` vs `IllegalStateException` vs `UnsupportedOperationException`…

**`IllegalArgumentException`**:
- **Khi nào**: Tham số truyền vào không hợp lệ.
- **Ví dụ**:
  ```java
  public void setAge(int age) {
      if (age < 0) {
          throw new IllegalArgumentException("Age cannot be negative: " + age);
      }
  }

  public void processItems(List<String> items) {
      if (items == null) {
          throw new IllegalArgumentException("Items list cannot be null");
      }
  }
  ```

**`IllegalStateException`**:
- **Khi nào**: Object ở trạng thái không phù hợp để thực hiện operation.
- **Ví dụ**:
  ```java
  public class Connection {
      private boolean closed = false;

      public void sendData(String data) {
          if (closed) {
              throw new IllegalStateException("Cannot send data: connection is closed");
          }
      }
  }

  public void withdraw(BigDecimal amount) {
      if (account.isFrozen()) {
          throw new IllegalStateException("Cannot withdraw: account is frozen");
      }
  }
  ```

**`UnsupportedOperationException`**:
- **Khi nào**: Operation không được hỗ trợ bởi implementation.
- **Ví dụ**:
  ```java
  public class ReadOnlyList<T> implements List<T> {
      @Override
      public boolean add(T element) {
          throw new UnsupportedOperationException("Cannot add to read-only list");
      }
  }

  public void deleteUser(String userId) {
      throw new UnsupportedOperationException("User deletion not supported in demo mode");
  }
  ```

**`NullPointerException`**:
- **Khi nào**: Hiếm khi ném thủ công, thường dùng `Objects.requireNonNull()`.
- **Ví dụ**:
  ```java
  public void processUser(User user) {
      this.user = Objects.requireNonNull(user, "User cannot be null");
  }
  ```

**`IndexOutOfBoundsException`**:
- **Khi nào**: Index vượt quá giới hạn của collection/array.
- **Ví dụ**:
  ```java
  public T get(int index) {
      if (index < 0 || index >= size) {
          throw new IndexOutOfBoundsException(
              "Index " + index + " out of bounds for size " + size);
      }
  }
  ```

**Quy tắc chọn**:
1. **Tham số sai** → `IllegalArgumentException`
2. **Trạng thái object sai** → `IllegalStateException`
3. **Operation không hỗ trợ** → `UnsupportedOperationException`
4. **Index sai** → `IndexOutOfBoundsException`
5. **Null không mong muốn** → `NullPointerException` (qua `Objects.requireNonNull()`)

---

### 35. Có nên dùng exception cho **luồng điều khiển** thông thường? Tác hại?

**Không nên dùng exception cho control flow**:

**Tác hại**:
1. **Performance kém**: Tạo exception rất đắt (stack trace, object creation).
   ```java
   // Tệ - dùng exception cho control flow
   public boolean hasNext() {
       try {
           getNext();
           return true;
       } catch (NoSuchElementException e) {
           return false;
       }
   }

   // Tốt - dùng boolean
   public boolean hasNext() {
       return currentIndex < items.size();
   }
   ```

2. **Code khó đọc**: Exception nên dành cho exceptional cases.
   ```java
   // Tệ
   try {
       while (true) {
           String item = iterator.next(); // Ném exception khi hết
           process(item);
       }
   } catch (NoSuchElementException e) {
       // Kết thúc bình thường
   }

   // Tốt
   while (iterator.hasNext()) {
       String item = iterator.next();
       process(item);
   }
   ```

3. **Debugging khó khăn**: Exception stack trace làm nhiễu log.

4. **Violate principle**: Exception cho exceptional conditions, không phải normal flow.

**Khi nào exception hợp lý**:
1. **Thực sự exceptional**: Tình huống hiếm xảy ra, không thể dự đoán.
   ```java
   public void saveToFile(String data) throws IOException {
       // IOException là exceptional - disk full, permission denied
   }
   ```

2. **Error conditions**: Không thể tiếp tục xử lý.
   ```java
   public void processPayment(Payment payment) throws PaymentException {
       // Payment failed là error condition
   }
   ```

**Alternative patterns**:
1. **Optional**: Cho giá trị có thể null.
   ```java
   public Optional<User> findUser(String id) {
       // Thay vì ném UserNotFoundException
   }
   ```

2. **Result objects**: Cho success/failure.
   ```java
   public Result<String, ErrorCode> processData(String input) {
       // Return success hoặc error code
   }
   ```

---
### 36. Chính sách “không nuốt lỗi” (don’t swallow): dấu hiệu code smell là gì?

**"Swallowing exceptions" là gì**:
- Bắt exception nhưng không xử lý hoặc log, làm mất thông tin lỗi.

**Dấu hiệu code smell**:
1. **Empty catch blocks**:
   ```java
   // Code smell
   try {
       riskyOperation();
   } catch (Exception e) {
       // Không làm gì - nuốt lỗi
   }
   ```

2. **Catch và ignore**:
   ```java
   // Code smell
   try {
       connectToDatabase();
   } catch (SQLException e) {
       // Bỏ qua lỗi, tiếp tục như không có gì
       return defaultData();
   }
   ```

3. **Log nhưng không propagate khi cần thiết**:
   ```java
   // Code smell trong một số context
   try {
       criticalOperation();
   } catch (Exception e) {
       logger.error("Error occurred", e);
       // Nhưng caller cần biết để xử lý
   }
   ```

**Cách xử lý đúng**:
1. **Log và rethrow**:
   ```java
   try {
       criticalOperation();
   } catch (Exception e) {
       logger.error("Critical operation failed", e);
       throw new ServiceException("Service unavailable", e);
   }
   ```

2. **Convert và propagate**:
   ```java
   try {
       lowLevelOperation();
   } catch (SQLException e) {
       throw new DataAccessException("Database operation failed", e);
   }
   ```

3. **Handle gracefully với fallback**:
   ```java
   try {
       return getDataFromCache();
   } catch (CacheException e) {
       logger.warn("Cache unavailable, falling back to database", e);
       return getDataFromDatabase();
   }
   ```

4. **Fail fast khi không thể recover**:
   ```java
   try {
       initializeSystem();
   } catch (InitializationException e) {
       logger.fatal("System initialization failed", e);
       System.exit(1); // Fail fast
   }
   ```

**Khi nào có thể "nuốt" exception**:
1. **Cleanup operations**: Trong finally blocks.
   ```java
   try {
       // Main operation
   } finally {
       try {
           resource.close();
       } catch (Exception e) {
           logger.debug("Failed to close resource", e); // OK to swallow
       }
   }
   ```

2. **Optional features**: Tính năng không quan trọng.
   ```java
   try {
       sendAnalytics(event);
   } catch (Exception e) {
       logger.debug("Analytics failed", e); // OK - không ảnh hưởng main flow
   }
   ```

**Best practices**:
- Luôn log exception (ít nhất ở DEBUG level)
- Rethrow hoặc wrap exception khi caller cần biết
- Document tại sao exception được "nuốt" nếu có lý do chính đáng
- Sử dụng monitoring/alerting cho silent failures

---

## VII) Khởi tạo lớp, khối static & lỗi liên quan

### 37. Exception trong **static initializer** dẫn tới `ExceptionInInitializerError` như thế nào?

**Static initializer và exception**:
- Static initializer chạy khi class được load lần đầu tiên.
- Nếu exception xảy ra trong static initializer, JVM wrap nó trong `ExceptionInInitializerError`.

**Cách hoạt động**:
```java
public class ProblematicClass {
    private static final String CONFIG;

    static {
        try {
            CONFIG = readConfigFile(); // Có thể ném IOException
        } catch (IOException e) {
            throw new RuntimeException("Failed to load config", e);
        }
    }

    private static String readConfigFile() throws IOException {
        throw new IOException("Config file not found");
    }
}

// Khi sử dụng:
try {
    ProblematicClass obj = new ProblematicClass(); // Trigger class loading
} catch (ExceptionInInitializerError e) {
    Throwable cause = e.getCause(); // RuntimeException
    Throwable rootCause = cause.getCause(); // IOException
}
```

**Đặc điểm của `ExceptionInInitializerError`**:
1. **Unchecked error**: Kế thừa từ `Error`, không cần khai báo throws.
2. **Chỉ xảy ra một lần**: Sau khi static initializer fail, class không thể được khởi tạo.
3. **Chứa original exception**: Truy cập qua `getCause()`.

**Hậu quả**:
```java
public class FailedClass {
    static {
        throw new RuntimeException("Initialization failed");
    }
}

// Lần đầu tiên
try {
    new FailedClass();
} catch (ExceptionInInitializerError e) {
    // Bắt được ExceptionInInitializerError
}

// Lần thứ hai
try {
    new FailedClass();
} catch (NoClassDefFoundError e) {
    // Bắt được NoClassDefFoundError thay vì ExceptionInInitializerError
}
```

**Best practices**:
1. **Tránh logic phức tạp trong static initializer**:
   ```java
   // Tệ
   static {
       // Complex initialization logic
   }

   // Tốt
   private static final MyService SERVICE = initializeService();

   private static MyService initializeService() {
       try {
           return new MyService();
       } catch (Exception e) {
           throw new IllegalStateException("Failed to initialize service", e);
       }
   }
   ```

2. **Lazy initialization cho expensive operations**:
   ```java
   public class ExpensiveResource {
       private static volatile ExpensiveResource instance;

       public static ExpensiveResource getInstance() {
           if (instance == null) {
               synchronized (ExpensiveResource.class) {
                   if (instance == null) {
                       instance = new ExpensiveResource();
                   }
               }
           }
           return instance;
       }
   }
   ```

---

### 38. Sự khác nhau giữa `ClassNotFoundException` (checked) và `NoClassDefFoundError` (runtime)?

**`ClassNotFoundException` (Checked Exception)**:
- **Khi nào**: Khi cố gắng load class bằng tên (string) nhưng không tìm thấy.
- **Nguyên nhân**: Class không có trong classpath tại runtime.
- **Ví dụ**:
  ```java
  try {
      Class<?> clazz = Class.forName("com.example.MissingClass");
  } catch (ClassNotFoundException e) {
      // Class không tồn tại trong classpath
  }

  // Hoặc với ClassLoader
  try {
      ClassLoader.getSystemClassLoader().loadClass("com.example.MissingClass");
  } catch (ClassNotFoundException e) {
      // Xử lý exception
  }
  ```

**`NoClassDefFoundError` (Error)**:
- **Khi nào**: Class tồn tại lúc compile nhưng không có lúc runtime.
- **Nguyên nhân**:
  - Class bị xóa khỏi classpath sau khi compile
  - Static initializer của class failed
  - Dependency missing
- **Ví dụ**:
  ```java
  public class MyClass {
      public void useAnotherClass() {
          AnotherClass obj = new AnotherClass(); // NoClassDefFoundError nếu AnotherClass missing
      }
  }
  ```

**So sánh chi tiết**:

| Aspect | ClassNotFoundException | NoClassDefFoundError |
|--------|----------------------|---------------------|
| **Type** | Checked Exception | Error (unchecked) |
| **Timing** | Runtime - explicit loading | Runtime - implicit reference |
| **Cause** | Class never existed in classpath | Class existed at compile time but missing at runtime |
| **Recovery** | Có thể handle và recover | Thường không thể recover |
| **Common scenarios** | `Class.forName()`, `ClassLoader.loadClass()` | `new ClassName()`, static reference |

**Ví dụ thực tế**:
```java
// ClassNotFoundException
public void loadDynamicClass(String className) {
    try {
        Class<?> clazz = Class.forName(className);
        // Sử dụng reflection
    } catch (ClassNotFoundException e) {
        logger.warn("Class not found: " + className, e);
        // Có thể fallback hoặc skip
    }
}

// NoClassDefFoundError
public class ServiceA {
    private ServiceB serviceB = new ServiceB(); // NoClassDefFoundError nếu ServiceB.class missing

    static {
        // Nếu static initializer fail, subsequent access sẽ gây NoClassDefFoundError
        throw new RuntimeException("Init failed");
    }
}
```

**Cách debug**:
1. **ClassNotFoundException**: Kiểm tra classpath, đảm bảo JAR/class file có mặt.
2. **NoClassDefFoundError**:
   - Kiểm tra dependencies
   - Xem log static initializer
   - Verify class file integrity

---

### 39. Nếu constructor ném exception, object ở trạng thái nào? Rò rỉ resource cần xử lý sao?

**Trạng thái object khi constructor fail**:
- **Object không được tạo**: Reference vẫn là null.
- **Memory được giải phóng**: GC sẽ thu hồi partial object.
- **Finalizer không chạy**: `finalize()` chỉ chạy cho fully constructed objects.

**Ví dụ minh họa**:
```java
public class ResourceHolder {
    private FileInputStream fileStream;
    private DatabaseConnection dbConnection;

    public ResourceHolder(String filename, String dbUrl) throws Exception {
        // Resource 1 - thành công
        this.fileStream = new FileInputStream(filename);

        // Resource 2 - có thể fail
        this.dbConnection = connectToDatabase(dbUrl); // Exception ở đây

        // Nếu exception xảy ra, fileStream đã được tạo nhưng object không hoàn thành
    }
}

// Sử dụng
ResourceHolder holder = null;
try {
    holder = new ResourceHolder("file.txt", "invalid-db-url");
} catch (Exception e) {
    // holder vẫn là null
    // Nhưng FileInputStream đã được tạo và có thể leak
}
```

**Vấn đề resource leak**:
```java
public class LeakyConstructor {
    private FileInputStream stream1;
    private FileInputStream stream2;

    public LeakyConstructor(String file1, String file2) throws IOException {
        this.stream1 = new FileInputStream(file1); // Thành công
        this.stream2 = new FileInputStream(file2); // Fail - stream1 bị leak
    }
}
```

**Cách xử lý đúng**:
1. **Try-catch trong constructor**:
   ```java
   public class SafeConstructor {
       private FileInputStream stream1;
       private FileInputStream stream2;

       public SafeConstructor(String file1, String file2) throws IOException {
           FileInputStream tempStream1 = null;
           FileInputStream tempStream2 = null;

           try {
               tempStream1 = new FileInputStream(file1);
               tempStream2 = new FileInputStream(file2);

               // Chỉ assign khi tất cả thành công
               this.stream1 = tempStream1;
               this.stream2 = tempStream2;
           } catch (IOException e) {
               // Cleanup partial resources
               if (tempStream1 != null) {
                   try { tempStream1.close(); } catch (IOException ignored) {}
               }
               if (tempStream2 != null) {
                   try { tempStream2.close(); } catch (IOException ignored) {}
               }
               throw e;
           }
       }
   }
   ```

2. **Factory method pattern**:
   ```java
   public class ResourceHolder {
       private final FileInputStream stream1;
       private final FileInputStream stream2;

       private ResourceHolder(FileInputStream s1, FileInputStream s2) {
           this.stream1 = s1;
           this.stream2 = s2;
       }

       public static ResourceHolder create(String file1, String file2) throws IOException {
           FileInputStream s1 = null;
           FileInputStream s2 = null;

           try {
               s1 = new FileInputStream(file1);
               s2 = new FileInputStream(file2);
               return new ResourceHolder(s1, s2);
           } catch (IOException e) {
               // Cleanup
               if (s1 != null) try { s1.close(); } catch (IOException ignored) {}
               if (s2 != null) try { s2.close(); } catch (IOException ignored) {}
               throw e;
           }
       }
   }
   ```

3. **Builder pattern với validation**:
   ```java
   public class ResourceBuilder {
       private List<Closeable> resources = new ArrayList<>();

       public ResourceBuilder addFile(String filename) throws IOException {
           FileInputStream stream = new FileInputStream(filename);
           resources.add(stream);
           return this;
       }

       public ResourceHolder build() {
           try {
               return new ResourceHolder(resources);
           } catch (Exception e) {
               // Cleanup all resources if build fails
               resources.forEach(resource -> {
                   try { resource.close(); } catch (IOException ignored) {}
               });
               throw e;
           }
       }
   }
   ```

**Best practices**:
- Acquire resources càng muộn càng tốt trong constructor
- Cleanup partial state khi constructor fail
- Sử dụng factory methods cho complex initialization
- Consider builder pattern cho multiple resources

---

### 40. Khác biệt ném exception trong **instance initializer block** vs trong constructor?

**Instance Initializer Block**:
- Chạy **trước** constructor body.
- Exception propagate lên constructor.
- Không thể catch exception từ initializer trong cùng class.

**Ví dụ Instance Initializer**:
```java
public class InitializerExample {
    private final String config;

    // Instance initializer block
    {
        try {
            config = loadConfig(); // Có thể ném exception
        } catch (IOException e) {
            throw new RuntimeException("Failed to load config", e);
        }
    }

    public InitializerExample() {
        // Constructor chạy sau initializer
        // Nếu initializer ném exception, constructor không chạy
    }

    public InitializerExample(String customConfig) {
        // Initializer vẫn chạy trước constructor này
        this.config = customConfig; // Compile error - config đã được assign
    }
}
```

**Constructor Exception**:
- Exception xảy ra trong constructor body.
- Có thể handle exception trong constructor.
- Có control flow rõ ràng.

**Ví dụ Constructor**:
```java
public class ConstructorExample {
    private String config;

    public ConstructorExample() throws IOException {
        try {
            this.config = loadConfig();
        } catch (IOException e) {
            // Có thể xử lý hoặc rethrow
            logger.error("Config load failed", e);
            throw e;
        }
    }

    public ConstructorExample(String defaultConfig) {
        try {
            this.config = loadConfig();
        } catch (IOException e) {
            // Fallback to default
            this.config = defaultConfig;
        }
    }
}
```

**Thứ tự thực thi**:
```java
public class ExecutionOrder {
    private String field1;
    private String field2;

    // 1. Instance initializer chạy đầu tiên
    {
        System.out.println("Instance initializer 1");
        field1 = "initialized";
        if (someCondition()) {
            throw new RuntimeException("Init failed");
        }
    }

    // 2. Instance initializer thứ hai
    {
        System.out.println("Instance initializer 2");
        field2 = "also initialized";
    }

    // 3. Constructor chạy cuối cùng
    public ExecutionOrder() {
        System.out.println("Constructor");
        // Nếu initializer ném exception, đoạn này không chạy
    }
}
```

**So sánh chi tiết**:

| Aspect | Instance Initializer | Constructor |
|--------|---------------------|-------------|
| **Timing** | Chạy trước constructor | Chạy sau initializer |
| **Exception handling** | Không thể catch trong cùng class | Có thể catch và handle |
| **Flexibility** | Ít linh hoạt | Linh hoạt hơn |
| **Use case** | Common initialization cho all constructors | Specific initialization per constructor |
| **Final field assignment** | Có thể assign final fields | Có thể assign final fields |

**Khi nào dùng initializer block**:
1. **Common initialization**: Logic chung cho tất cả constructors.
   ```java
   public class Logger {
       private final String timestamp;

       // Common cho tất cả constructors
       {
           timestamp = Instant.now().toString();
       }

       public Logger() { /* specific logic */ }
       public Logger(String name) { /* specific logic */ }
   }
   ```

2. **Complex field initialization**:
   ```java
   public class ComplexInit {
       private final Map<String, String> config;

       {
           config = new HashMap<>();
           // Complex initialization logic
           loadDefaultConfig(config);
           validateConfig(config);
       }
   }
   ```

**Khi nào dùng constructor**:
1. **Conditional logic**: Cần xử lý khác nhau tùy tham số.
2. **Exception handling**: Cần catch và recover từ errors.
3. **Parameter-dependent initialization**: Logic phụ thuộc vào constructor parameters.

**Best practice**:
- Dùng initializer cho common, simple initialization
- Dùng constructor cho complex, conditional logic
- Tránh ném checked exceptions từ initializer blocks
- Keep initializer blocks simple và predictable

---

## VIII) Runtime exceptions thường gặp (core)

### 41. Tại sao `NullPointerException` là unchecked? Java 14+ có **Helpful NPE**: giúp gì?

**Tại sao NPE là unchecked**:
1. **Quá phổ biến**: Nếu là checked, hầu hết methods phải khai báo throws NPE.
2. **Có thể tránh được**: Lập trình viên có thể kiểm tra null trước khi sử dụng.
3. **Programming error**: NPE thường do lỗi logic, không phải exceptional condition.

**Ví dụ tại sao không nên là checked**:
```java
// Nếu NPE là checked - code sẽ rất dài dòng
public String processUser(User user) throws NullPointerException {
    String name = user.getName(); // throws NPE
    String email = user.getEmail(); // throws NPE
    return name + " - " + email; // throws NPE
}

// Thay vào đó, kiểm tra null
public String processUser(User user) {
    Objects.requireNonNull(user, "User cannot be null");
    return user.getName() + " - " + user.getEmail();
}
```

**Helpful NPE (Java 14+)**:
- Cung cấp thông tin chi tiết về **chính xác** phần nào của expression bị null.
- Enabled với flag: `-XX:+ShowCodeDetailsInExceptionMessages`

**Trước Java 14**:
```java
String result = user.getProfile().getAddress().getStreet();
// Exception: java.lang.NullPointerException
//   at MyClass.method(MyClass.java:15)
// Không biết user, profile, hay address nào null
```

**Java 14+ Helpful NPE**:
```java
String result = user.getProfile().getAddress().getStreet();
// Exception: java.lang.NullPointerException:
//   Cannot invoke "Profile.getAddress()" because the return value of
//   "User.getProfile()" is null
//   at MyClass.method(MyClass.java:15)
```

**Ví dụ chi tiết**:
```java
public class HelpfulNPEExample {
    public static void main(String[] args) {
        User user = new User();
        user.setProfile(null);

        // Java 14+ sẽ chỉ rõ getProfile() returns null
        String street = user.getProfile().getAddress().getStreet();
    }
}

// Output với Helpful NPE:
// Cannot invoke "Profile.getAddress()" because the return value of
// "User.getProfile()" is null
```

**Lợi ích của Helpful NPE**:
1. **Debug nhanh hơn**: Không cần đoán đoạn nào null.
2. **Ít breakpoint**: Không cần debug step-by-step.
3. **Better error messages**: Đặc biệt hữu ích với method chaining.

**Best practices tránh NPE**:
```java
// 1. Null checks
if (user != null && user.getProfile() != null) {
    // Safe to use
}

// 2. Objects.requireNonNull()
Objects.requireNonNull(user, "User cannot be null");

// 3. Optional
Optional.ofNullable(user)
    .map(User::getProfile)
    .map(Profile::getAddress)
    .map(Address::getStreet)
    .orElse("Unknown");

// 4. Defensive programming
public class User {
    private Profile profile = new Profile(); // Never null

    public Profile getProfile() {
        return profile; // Guaranteed non-null
    }
}
```

---

### 42. `IndexOutOfBoundsException` vs `ArrayIndexOutOfBoundsException` vs `StringIndexOutOfBoundsException`: dùng khi nào?

**Hierarchy và mối quan hệ**:
```
RuntimeException
└── IndexOutOfBoundsException (abstract base)
    ├── ArrayIndexOutOfBoundsException
    └── StringIndexOutOfBoundsException
```

**`IndexOutOfBoundsException`**:
- **Base class** cho tất cả index-related exceptions.
- **Abstract concept**: Không được ném trực tiếp, chỉ là parent class.
- **Khi nào catch**: Khi muốn handle tất cả loại index errors.

```java
try {
    // Code có thể ném nhiều loại index exception
    processArray(array, index);
    processString(str, index);
} catch (IndexOutOfBoundsException e) {
    // Catch tất cả: Array, String, List index errors
    logger.error("Index out of bounds: " + e.getMessage());
}
```

**`ArrayIndexOutOfBoundsException`**:
- **Khi nào**: Truy cập array với index không hợp lệ.
- **Ném bởi**: JVM khi access array[index] với index < 0 hoặc >= array.length.

```java
int[] array = {1, 2, 3};

// Ném ArrayIndexOutOfBoundsException
int value1 = array[-1];     // Negative index
int value2 = array[3];      // Index >= length
int value3 = array[100];    // Way out of bounds

// Custom array access
public int safeGet(int[] array, int index) {
    if (index < 0 || index >= array.length) {
        throw new ArrayIndexOutOfBoundsException(
            "Index " + index + " out of bounds for array length " + array.length);
    }
    return array[index];
}
```

**`StringIndexOutOfBoundsException`**:
- **Khi nào**: Truy cập String với index không hợp lệ.
- **Ném bởi**: String methods như `charAt()`, `substring()`.

```java
String str = "Hello";

// Ném StringIndexOutOfBoundsException
char c1 = str.charAt(-1);    // Negative index
char c2 = str.charAt(5);     // Index >= length
String sub = str.substring(2, 10); // End index > length

// Safe string access
public char safeCharAt(String str, int index) {
    if (index < 0 || index >= str.length()) {
        throw new StringIndexOutOfBoundsException(
            "Index " + index + " out of bounds for string length " + str.length());
    }
    return str.charAt(index);
}
```

**Collections và `IndexOutOfBoundsException`**:
```java
List<String> list = Arrays.asList("a", "b", "c");

try {
    String item = list.get(5); // Ném IndexOutOfBoundsException (not Array/String specific)
} catch (IndexOutOfBoundsException e) {
    // List implementations ném base IndexOutOfBoundsException
}
```

**Khi nào dùng loại nào**:

1. **Catch `IndexOutOfBoundsException`**: Khi xử lý chung cho tất cả index errors.
   ```java
   public void processData(Object data, int index) {
       try {
           if (data instanceof int[]) {
               return ((int[]) data)[index];
           } else if (data instanceof String) {
               return ((String) data).charAt(index);
           } else if (data instanceof List) {
               return ((List<?>) data).get(index);
           }
       } catch (IndexOutOfBoundsException e) {
           // Handle all index errors uniformly
           throw new DataAccessException("Invalid index: " + index, e);
       }
   }
   ```

2. **Catch specific types**: Khi cần xử lý khác nhau cho từng loại.
   ```java
   try {
       // Complex processing
   } catch (ArrayIndexOutOfBoundsException e) {
       // Array-specific handling
       logger.error("Array access error", e);
   } catch (StringIndexOutOfBoundsException e) {
       // String-specific handling
       logger.error("String access error", e);
   }
   ```

**Best practices**:
```java
// 1. Validate before access
public char safeAccess(String str, int index) {
    if (str == null) throw new IllegalArgumentException("String cannot be null");
    if (index < 0 || index >= str.length()) {
        throw new StringIndexOutOfBoundsException(
            "Index " + index + " out of bounds for string length " + str.length());
    }
    return str.charAt(index);
}

// 2. Use bounds checking utilities
public static void checkBounds(int index, int size) {
    if (index < 0 || index >= size) {
        throw new IndexOutOfBoundsException(
            "Index " + index + " out of bounds for size " + size);
    }
}

// 3. Defensive programming
public String substring(String str, int start, int end) {
    Objects.requireNonNull(str, "String cannot be null");
    if (start < 0) start = 0;
    if (end > str.length()) end = str.length();
    if (start > end) start = end;
    return str.substring(start, end);
}
```

---

### 43. `ClassCastException` xuất hiện khi nào? Liên hệ **erasure** & generics?

**`ClassCastException` xuất hiện khi**:
- Cố gắng cast object sang type không compatible.
- Runtime type checking fail (không phải compile-time).

**Ví dụ cơ bản**:
```java
Object obj = "Hello World";
Integer number = (Integer) obj; // ClassCastException: String cannot be cast to Integer

// Với inheritance
class Animal {}
class Dog extends Animal {}
class Cat extends Animal {}

Animal animal = new Cat();
Dog dog = (Dog) animal; // ClassCastException: Cat cannot be cast to Dog
```

**Liên hệ với Type Erasure**:
- **Type erasure**: Generics information bị xóa tại runtime.
- **Raw types**: Có thể gây ClassCastException không mong muốn.

**Ví dụ với Generics và Erasure**:
```java
// Type erasure example
List<String> stringList = new ArrayList<>();
List rawList = stringList; // Raw type
rawList.add(42); // Compiler warning, nhưng compile được

// Runtime ClassCastException
for (String str : stringList) { // ClassCastException: Integer cannot be cast to String
    System.out.println(str);
}
```

**Heap pollution với varargs**:
```java
@SafeVarargs
public static <T> void addToList(List<T> list, T... elements) {
    for (T element : elements) {
        list.add(element);
    }
}

List<String> strings = new ArrayList<>();
// Compiler warning về heap pollution
addToList(strings, "hello", 42); // 42 được add vào List<String>

// ClassCastException khi sử dụng
for (String str : strings) { // Exception tại đây
    System.out.println(str);
}
```

**Generic array creation issues**:
```java
// Không thể tạo generic array trực tiếp
// List<String>[] arrays = new List<String>[10]; // Compile error

// Workaround có thể gây ClassCastException
@SuppressWarnings("unchecked")
List<String>[] arrays = (List<String>[]) new List[10]; // Unchecked cast

// Potential ClassCastException nếu misuse
Object[] objArrays = arrays;
objArrays[0] = new ArrayList<Integer>(); // Heap pollution
List<String> stringList = arrays[0]; // OK so far
String str = stringList.get(0); // ClassCastException nếu có Integer
```

**Cách tránh ClassCastException**:

1. **instanceof check**:
   ```java
   public void processAnimal(Animal animal) {
       if (animal instanceof Dog) {
           Dog dog = (Dog) animal; // Safe cast
           dog.bark();
       } else if (animal instanceof Cat) {
           Cat cat = (Cat) animal; // Safe cast
           cat.meow();
       }
   }
   ```

2. **Generic methods**:
   ```java
   // Thay vì raw types
   public <T> void processItems(List<T> items, Class<T> type) {
       for (Object item : items) {
           if (type.isInstance(item)) {
               T typedItem = type.cast(item); // Safe cast
               // Process typedItem
           }
       }
   }
   ```

3. **Avoid raw types**:
   ```java
   // Tệ
   List list = new ArrayList();
   list.add("string");
   list.add(42);
   String str = (String) list.get(1); // ClassCastException

   // Tốt
   List<Object> list = new ArrayList<>();
   list.add("string");
   list.add(42);
   Object obj = list.get(1);
   if (obj instanceof String) {
       String str = (String) obj;
   }
   ```

4. **Pattern matching (Java 14+)**:
   ```java
   // Java 14+ instanceof pattern matching
   public void processObject(Object obj) {
       if (obj instanceof String str) {
           // str is automatically cast to String
           System.out.println(str.toUpperCase());
       } else if (obj instanceof Integer num) {
           // num is automatically cast to Integer
           System.out.println(num * 2);
       }
   }
   ```

**Debug ClassCastException**:
```java
try {
    SomeType result = (SomeType) obj;
} catch (ClassCastException e) {
    logger.error("Cannot cast {} to {}",
        obj.getClass().getName(),
        SomeType.class.getName(), e);
    // Log actual type vs expected type
}
```

**Best practices**:
- Tránh raw types
- Sử dụng instanceof trước khi cast
- Prefer composition over inheritance để giảm casting
- Sử dụng generics properly để type safety
- Consider visitor pattern thay vì casting trong complex hierarchies

---

### 44. `ArithmeticException` (chia 0), `NumberFormatException` (parse) — chuẩn hoá thông điệp thế nào cho debug?

**`ArithmeticException`**:
- **Khi nào**: Phép toán số học không hợp lệ, phổ biến nhất là chia cho 0.
- **Chỉ với integer division**: Floating point division by zero trả về Infinity, không ném exception.

```java
// ArithmeticException examples
int result1 = 10 / 0;        // ArithmeticException: / by zero
int result2 = 10 % 0;        // ArithmeticException: / by zero
BigInteger.valueOf(10).divide(BigInteger.ZERO); // ArithmeticException: BigInteger divide by zero

// Floating point không ném exception
double result3 = 10.0 / 0.0; // Infinity
double result4 = 0.0 / 0.0;  // NaN
```

**Chuẩn hóa message cho ArithmeticException**:
```java
public class SafeMath {
    public static int safeDivide(int dividend, int divisor, String context) {
        if (divisor == 0) {
            throw new ArithmeticException(
                String.format("Division by zero in %s: %d / %d",
                    context, dividend, divisor));
        }
        return dividend / divisor;
    }

    public static BigDecimal safeDivide(BigDecimal dividend, BigDecimal divisor,
                                       int scale, RoundingMode roundingMode) {
        if (divisor.compareTo(BigDecimal.ZERO) == 0) {
            throw new ArithmeticException(
                String.format("Division by zero: %s / %s (scale: %d, rounding: %s)",
                    dividend, divisor, scale, roundingMode));
        }
        return dividend.divide(divisor, scale, roundingMode);
    }
}
```

**`NumberFormatException`**:
- **Khi nào**: Parse string thành number thất bại.
- **Subclass của IllegalArgumentException**.

```java
// NumberFormatException examples
int num1 = Integer.parseInt("abc");        // NumberFormatException: For input string: "abc"
double num2 = Double.parseDouble("12.34.56"); // NumberFormatException: multiple points
long num3 = Long.parseLong("999999999999999999999"); // NumberFormatException: out of range
```

**Chuẩn hóa message cho NumberFormatException**:
```java
public class SafeParser {
    public static int parseIntSafely(String input, String fieldName) {
        if (input == null) {
            throw new IllegalArgumentException(fieldName + " cannot be null");
        }

        try {
            return Integer.parseInt(input.trim());
        } catch (NumberFormatException e) {
            throw new NumberFormatException(
                String.format("Invalid integer format for %s: '%s'. Expected: valid integer",
                    fieldName, input));
        }
    }

    public static double parseDoubleSafely(String input, String fieldName,
                                         double min, double max) {
        if (input == null) {
            throw new IllegalArgumentException(fieldName + " cannot be null");
        }

        try {
            double value = Double.parseDouble(input.trim());
            if (value < min || value > max) {
                throw new IllegalArgumentException(
                    String.format("%s value %f is out of range [%f, %f]",
                        fieldName, value, min, max));
            }
            return value;
        } catch (NumberFormatException e) {
            throw new NumberFormatException(
                String.format("Invalid decimal format for %s: '%s'. Expected: decimal number between %f and %f",
                    fieldName, input, min, max));
        }
    }
}
```

---

### 45. `ConcurrentModificationException` có phải lỗi đồng bộ hoá? Bản chất và cách tránh (core collections).

**Bản chất ConcurrentModificationException**:
- **KHÔNG phải lỗi đồng bộ hóa** trong nghĩa thread-safety.
- **Fail-fast mechanism**: Phát hiện modification không mong muốn trong quá trình iteration.
- **Single-threaded cũng có thể xảy ra**: Khi modify collection trong enhanced for loop.

**Khi nào xảy ra**:
```java
List<String> list = new ArrayList<>(Arrays.asList("a", "b", "c", "d"));

// ConcurrentModificationException
for (String item : list) {
    if ("b".equals(item)) {
        list.remove(item); // Modify collection during iteration
    }
}
```

**Cách tránh**:
1. **Sử dụng Iterator.remove()**:
```java
Iterator<String> iterator = list.iterator();
while (iterator.hasNext()) {
    String item = iterator.next();
    if ("b".equals(item)) {
        iterator.remove(); // Safe removal
    }
}
```

2. **Stream API removeIf()**:
```java
list.removeIf(item -> "b".equals(item));
```

3. **Collect items to remove**:
```java
List<String> toRemove = new ArrayList<>();
for (String item : list) {
    if (item.startsWith("b")) {
        toRemove.add(item);
    }
}
list.removeAll(toRemove);
```

---

### 46. `IllegalMonitorStateException` xảy ra khi nào (wait/notify)?

**IllegalMonitorStateException xảy ra khi**:
- Gọi `wait()`, `notify()`, hoặc `notifyAll()` mà **không hold monitor** của object đó.

**Ví dụ lỗi**:
```java
Object lock = new Object();
lock.wait();     // IllegalMonitorStateException - không synchronized
```

**Cách đúng**:
```java
Object lock = new Object();
synchronized (lock) {
    lock.wait();     // OK - holding monitor
    lock.notify();   // OK - holding monitor
}
```

**Producer-Consumer pattern đúng**:
```java
public class ProducerConsumer {
    private final Object lock = new Object();
    private Queue<String> queue = new LinkedList<>();

    public void produce(String item) throws InterruptedException {
        synchronized (lock) {
            while (queue.size() >= MAX_SIZE) {
                lock.wait(); // Wait for space
            }
            queue.offer(item);
            lock.notifyAll(); // Notify consumers
        }
    }

    public String consume() throws InterruptedException {
        synchronized (lock) {
            while (queue.isEmpty()) {
                lock.wait(); // Wait for items
            }
            String item = queue.poll();
            lock.notifyAll(); // Notify producers
            return item;
        }
    }
}
```

---

### 47. `AssertionError` khác exception thế nào? Dùng `assert` trong Java Core hợp lý khi nào?

**AssertionError vs Exception**:
- **AssertionError**: Error (unchecked), development-time debugging, có thể tắt
- **Exception**: Runtime error handling, luôn active, có thể catch

**Khi nào dùng assert**:
1. **Preconditions (internal methods)**:
```java
private void processArray(int[] array, int startIndex) {
    assert array != null : "Array cannot be null";
    assert startIndex >= 0 : "Start index cannot be negative: " + startIndex;
    // Process array
}
```

2. **Postconditions và invariants**:
```java
public void withdraw(double amount) {
    assert amount > 0 : "Withdrawal amount must be positive";
    balance -= amount;
    assert balance >= 0 : "Balance became negative: " + balance;
}
```

**Khi KHÔNG nên dùng assert**:
1. **Public API validation**:
```java
// Tệ - dùng assert cho public API
public void setAge(int age) {
    assert age >= 0 : "Age cannot be negative";
}

// Tốt - dùng exception cho public API
public void setAge(int age) {
    if (age < 0) {
        throw new IllegalArgumentException("Age cannot be negative: " + age);
    }
}
```

2. **Production error handling**:
```java
// Tệ - dùng assert cho production errors
assert new File(filename).exists() : "File not found";

// Tốt - proper exception handling
if (!new File(filename).exists()) {
    throw new FileNotFoundException("File not found: " + filename);
}
```

---

## IX) Luồng (thread) & Exceptions (mức core)

### 48. Exception ném trong **thread con** đi đâu? Làm sao không bị “mất”?

**Exception trong thread con**:
- **Không propagate** về main thread hoặc parent thread.
- **Terminate thread** đó và có thể "mất" nếu không được handle.
- **UncaughtExceptionHandler** là cách duy nhất để catch.

**Ví dụ exception "mất"**:
```java
public class LostExceptionExample {
    public static void main(String[] args) throws InterruptedException {
        Thread thread = new Thread(() -> {
            throw new RuntimeException("This exception will be lost!");
        });

        thread.start();
        thread.join();

        System.out.println("Main thread continues normally");
        // Exception trong thread con không ảnh hưởng main thread
    }
}
```

**Cách không bị "mất" exception**:

1. **UncaughtExceptionHandler**:
```java
Thread thread = new Thread(() -> {
    throw new RuntimeException("Caught exception!");
});

thread.setUncaughtExceptionHandler((t, e) -> {
    System.err.println("Thread " + t.getName() + " threw exception: " + e.getMessage());
    e.printStackTrace();
});

thread.start();
```

2. **Try-catch trong run()**:
```java
public class SafeRunnable implements Runnable {
    @Override
    public void run() {
        try {
            doWork();
        } catch (Exception e) {
            logger.error("Error in thread execution", e);
            notifyError(e);
        }
    }
}
```

3. **Future và ExecutorService**:
```java
ExecutorService executor = Executors.newSingleThreadExecutor();
Future<?> future = executor.submit(() -> {
    throw new RuntimeException("Exception in task");
});

try {
    future.get(); // Exception sẽ được re-thrown ở đây
} catch (ExecutionException e) {
    Throwable cause = e.getCause(); // Original exception
    System.err.println("Task failed: " + cause.getMessage());
}
```

---

### 49. `Thread.UncaughtExceptionHandler` hoạt động thế nào? Trường hợp nên cài đặt?

**Cách hoạt động**:
- **Last resort**: Được gọi khi exception không được catch trong thread.
- **Thread termination**: Thread vẫn bị terminate sau khi handler chạy.
- **Hierarchy**: Thread-specific → ThreadGroup → Default global handler.

**Hierarchy của UncaughtExceptionHandler**:
```java
public class HandlerHierarchy {
    public static void main(String[] args) {
        // 1. Global default handler (lowest priority)
        Thread.setDefaultUncaughtExceptionHandler((t, e) -> {
            System.err.println("Global handler: " + e.getMessage());
        });

        // 2. ThreadGroup handler (medium priority)
        ThreadGroup group = new ThreadGroup("MyGroup") {
            @Override
            public void uncaughtException(Thread t, Throwable e) {
                System.err.println("ThreadGroup handler: " + e.getMessage());
            }
        };

        // 3. Thread-specific handler (highest priority)
        Thread thread = new Thread(group, () -> {
            throw new RuntimeException("Test exception");
        });

        thread.setUncaughtExceptionHandler((t, e) -> {
            System.err.println("Thread-specific handler: " + e.getMessage());
        });

        thread.start();
    }
}
```

**Khi nên cài đặt**:

1. **Production applications**:
```java
public class ProductionExceptionHandler implements Thread.UncaughtExceptionHandler {
    @Override
    public void uncaughtException(Thread t, Throwable e) {
        // 1. Log critical error
        logger.error("Uncaught exception in thread {}", t.getName(), e);

        // 2. Send alert/notification
        alertingService.sendCriticalAlert("Thread crashed", e);

        // 3. Cleanup resources if possible
        cleanupResources(t);

        // 4. Graceful shutdown if critical thread
        if (isCriticalThread(t)) {
            initiateGracefulShutdown();
        }
    }
}

// Usage
Thread.setDefaultUncaughtExceptionHandler(new ProductionExceptionHandler());
```

2. **Background/Worker threads**:
```java
public class WorkerThreadManager {
    private final AtomicInteger failedTasks = new AtomicInteger(0);

    public WorkerThreadManager() {
        ThreadFactory factory = r -> {
            Thread t = new Thread(r);
            t.setUncaughtExceptionHandler((thread, ex) -> {
                logger.error("Worker thread {} failed", thread.getName(), ex);

                // Track failures
                int failures = failedTasks.incrementAndGet();
                if (failures > MAX_FAILURES) {
                    logger.error("Too many worker failures, shutting down");
                    shutdown();
                }
            });
            return t;
        };
    }
}
```

---

### 50. `Runnable` vs `Callable`: khác biệt về throws/return với exception?

**So sánh cơ bản**:

| Aspect | Runnable | Callable |
|--------|----------|----------|
| **Return value** | void (không trả về) | Generic type T |
| **Exception handling** | Không throws checked exceptions | Có thể throws Exception |
| **Method signature** | `void run()` | `T call() throws Exception` |
| **Usage** | Thread, ExecutorService | ExecutorService với Future |

**Runnable limitations**:
```java
public class RunnableExample implements Runnable {
    @Override
    public void run() {
        try {
            // Phải handle checked exceptions internally
            String data = readFile("config.txt");
            // Không thể return result
        } catch (IOException e) {
            // Phải handle ở đây, không thể propagate
            logger.error("Failed to process", e);
        }
    }
}
```

**Callable advantages**:
```java
public class CallableExample implements Callable<Integer> {
    @Override
    public Integer call() throws Exception {
        // Có thể throws checked exceptions
        String data = readFile("config.txt"); // IOException có thể propagate
        return processData(data); // Có thể return value
    }
}
```

**Usage với Future**:
```java
ExecutorService executor = Executors.newFixedThreadPool(5);

Future<String> future = executor.submit(() -> {
    return processData(); // Có thể throw exceptions
});

try {
    String result = future.get(); // Get result
} catch (ExecutionException e) {
    Throwable cause = e.getCause(); // Original exception
    // Handle specific exception types
}
```

---

### 51. Khi tạo thread pool, exception từ task có làm **chết** thread không? (mức hiểu biết core)

**Câu trả lời ngắn gọn**: **KHÔNG** - Thread pool threads không bị "chết" bởi uncaught exceptions từ tasks.

**Cách ThreadPoolExecutor xử lý exceptions**:

1. **Runnable tasks**:
```java
ExecutorService executor = Executors.newFixedThreadPool(5);

executor.submit(() -> {
    throw new RuntimeException("Task failed!");
    // Thread pool thread KHÔNG bị chết
    // Exception bị "nuốt" nếu không check Future
});

// Exception bị mất nếu không gọi future.get()
```

2. **Callable tasks**:
```java
Future<String> future = executor.submit(() -> {
    throw new RuntimeException("Callable failed!");
    // Thread pool thread vẫn sống
    // Exception được wrap trong ExecutionException
});

try {
    future.get(); // Exception được re-thrown ở đây
} catch (ExecutionException e) {
    // Handle exception
}
```

**Thread pool resilience**:
```java
public class ThreadPoolResilience {
    public static void main(String[] args) throws InterruptedException {
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
            2, 2, 0L, TimeUnit.MILLISECONDS,
            new LinkedBlockingQueue<>());

        // Submit 10 failing tasks
        for (int i = 0; i < 10; i++) {
            executor.submit(() -> {
                System.out.println("Task running on: " + Thread.currentThread().getName());
                throw new RuntimeException("Task failed!");
            });
        }

        Thread.sleep(1000);

        // Pool vẫn có 2 threads active
        System.out.println("Active threads: " + executor.getActiveCount());
        System.out.println("Pool size: " + executor.getPoolSize());

        executor.shutdown();
    }
}
```

**Best practices**:
```java
// Always handle Future results
Future<?> future = executor.submit(task);
try {
    future.get();
} catch (ExecutionException e) {
    logger.error("Task failed", e.getCause());
}
```

---

### 52. Tránh nuốt exception trong `run()`: patterns core nên dùng là gì?

**Pattern 1: Log và callback**:
```java
public class CallbackRunnable implements Runnable {
    private final TaskCallback callback;

    @Override
    public void run() {
        try {
            String result = doWork();
            callback.onSuccess(result);
        } catch (Exception e) {
            logger.error("Task failed", e);
            callback.onFailure(e);
        }
    }
}

interface TaskCallback {
    void onSuccess(String result);
    void onFailure(Exception e);
}
```

**Pattern 2: Result holder**:
```java
public class ResultHolderRunnable implements Runnable {
    private volatile String result;
    private volatile Exception exception;
    private volatile boolean completed = false;

    @Override
    public void run() {
        try {
            result = doWork();
        } catch (Exception e) {
            logger.error("Task failed", e);
            exception = e;
        } finally {
            completed = true;
        }
    }

    public String getResult() throws Exception {
        if (!completed) throw new IllegalStateException("Task not completed");
        if (exception != null) throw exception;
        return result;
    }
}
```

**Pattern 3: CompletableFuture**:
```java
public CompletableFuture<String> executeAsync() {
    return CompletableFuture.supplyAsync(() -> {
        try {
            return doWork();
        } catch (Exception e) {
            logger.error("Async task failed", e);
            throw new RuntimeException(e);
        }
    }).exceptionally(throwable -> {
        notifyFailure(throwable);
        return "default-value";
    });
}
```

**Best practices**:
1. **Always log exceptions** - ít nhất ở ERROR level
2. **Notify interested parties** - callbacks, observers, metrics
3. **Preserve exception information** - stack traces, context
4. **Consider retry mechanisms** - với exponential backoff
5. **Use monitoring/alerting** - cho production systems

---

## X) Serialization & Exceptions (core)

### 53. Exception là `Serializable`: ý nghĩa thực tế? Khi gửi qua ranh giới tiến trình/module?

**Exception và Serializable**:
- **Tất cả Exception classes đều implement Serializable** (thông qua Throwable).
- **Ý nghĩa thực tế**: Có thể serialize/deserialize exceptions qua network, files, hoặc giữa các JVM.

**Khi gửi qua ranh giới tiến trình/module**:

1. **RMI (Remote Method Invocation)**:
```java
// Server side
public interface RemoteService extends Remote {
    String processData(String data) throws RemoteException, ProcessingException;
}

// Custom exception phải serializable
public class ProcessingException extends Exception {
    private final String errorCode;
    private final long timestamp;

    public ProcessingException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.timestamp = System.currentTimeMillis();
    }

    // Getters...
}

// Client side - nhận được full exception với tất cả fields
try {
    remoteService.processData("invalid data");
} catch (ProcessingException e) {
    System.out.println("Error code: " + e.getErrorCode());
    System.out.println("Timestamp: " + e.getTimestamp());
}
```

2. **Message Queues/Event Systems**:
```java
public class ErrorEvent implements Serializable {
    private final Exception originalException;
    private final String contextInfo;
    private final long eventTime;

    public ErrorEvent(Exception exception, String context) {
        this.originalException = exception;
        this.contextInfo = context;
        this.eventTime = System.currentTimeMillis();
    }

    // Có thể gửi qua JMS, Kafka, etc.
}
```

3. **Microservices Communication**:
```java
// Service A
public class ServiceException extends Exception {
    private final String serviceId;
    private final Map<String, Object> errorDetails;

    public ServiceException(String message, String serviceId, Map<String, Object> details) {
        super(message);
        this.serviceId = serviceId;
        this.errorDetails = new HashMap<>(details);
    }
}

// Serialize to JSON/XML for HTTP APIs
// Hoặc binary serialization cho internal communication
```

**Vấn đề cần lưu ý**:
```java
public class ProblematicException extends Exception {
    private transient Connection dbConnection; // transient - không serialize
    private FileInputStream stream; // Không serializable - gây lỗi

    // Solution: Mark non-serializable fields as transient
    private transient FileInputStream stream;

    // Hoặc implement custom serialization
    private void writeObject(ObjectOutputStream out) throws IOException {
        out.defaultWriteObject();
        // Custom logic for non-serializable fields
    }

    private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
        in.defaultReadObject();
        // Reconstruct transient fields if needed
    }
}
```

---

### 54. Thay đổi trường trong exception (thêm field) ảnh hưởng gì tới **serial compatibility**?

**Serial compatibility issues**:

1. **Thêm field mới**:
```java
// Version 1
public class MyException extends Exception {
    private String errorCode;

    public MyException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }
}

// Version 2 - thêm field
public class MyException extends Exception {
    private String errorCode;
    private long timestamp; // Field mới
    private String userId;  // Field mới

    public MyException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.timestamp = System.currentTimeMillis();
    }
}
```

**Vấn đề compatibility**:
- **Forward compatibility**: Version 1 không thể deserialize object từ Version 2.
- **Backward compatibility**: Version 2 có thể deserialize object từ Version 1 (fields mới = default values).

**Solutions**:

1. **SerialVersionUID**:
```java
public class MyException extends Exception {
    private static final long serialVersionUID = 1L; // Explicit UID

    private String errorCode;
    private long timestamp = System.currentTimeMillis(); // Default value

    // Constructors...
}
```

2. **Transient fields cho optional data**:
```java
public class MyException extends Exception {
    private static final long serialVersionUID = 1L;

    private String errorCode; // Core field
    private transient long timestamp; // Optional, không affect compatibility
    private transient Map<String, Object> metadata; // Optional

    public MyException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.timestamp = System.currentTimeMillis();
        this.metadata = new HashMap<>();
    }
}
```

3. **Custom serialization**:
```java
public class VersionedException extends Exception {
    private static final long serialVersionUID = 1L;

    private String errorCode;
    private long timestamp;
    private String userId;

    private void writeObject(ObjectOutputStream out) throws IOException {
        out.defaultWriteObject();
        // Write version info
        out.writeInt(2); // Version 2
        out.writeLong(timestamp);
        out.writeUTF(userId != null ? userId : "");
    }

    private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
        in.defaultReadObject();

        try {
            int version = in.readInt();
            if (version >= 2) {
                timestamp = in.readLong();
                String userIdStr = in.readUTF();
                userId = userIdStr.isEmpty() ? null : userIdStr;
            } else {
                // Default values for older versions
                timestamp = System.currentTimeMillis();
                userId = null;
            }
        } catch (IOException e) {
            // Handle older version without version info
            timestamp = System.currentTimeMillis();
            userId = null;
        }
    }
}
```

**Best practices**:
```java
public class WellDesignedException extends Exception {
    private static final long serialVersionUID = 1L;

    // Core fields - never change
    private final String errorCode;
    private final String message;

    // Optional fields - can be added
    private transient long timestamp = System.currentTimeMillis();
    private transient Map<String, Object> context = new HashMap<>();

    public WellDesignedException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
        this.message = message;
    }

    // Provide methods to set optional data
    public WellDesignedException withTimestamp(long timestamp) {
        this.timestamp = timestamp;
        return this;
    }

    public WellDesignedException withContext(String key, Object value) {
        this.context.put(key, value);
        return this;
    }
}
```

---

### 55. Dùng `readObject`/`writeObject` cho exception có hợp lý? (trường hợp đặc biệt)

**Khi nào hợp lý**:

1. **Non-serializable fields**:
```java
public class DatabaseException extends Exception {
    private final String query;
    private transient Connection connection; // Không serializable
    private transient ResultSet resultSet;   // Không serializable

    private void writeObject(ObjectOutputStream out) throws IOException {
        out.defaultWriteObject();
        // Serialize connection info thay vì connection object
        out.writeUTF(connection != null ? connection.getMetaData().getURL() : "");
    }

    private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
        in.defaultReadObject();
        String url = in.readUTF();
        // Không recreate connection - chỉ lưu info
        // connection và resultSet sẽ là null sau deserialization
    }
}
```

2. **Security-sensitive data**:
```java
public class AuthenticationException extends Exception {
    private String username;
    private transient char[] password; // Sensitive data
    private String hashedPassword;

    private void writeObject(ObjectOutputStream out) throws IOException {
        out.defaultWriteObject();
        // Không serialize password, chỉ serialize hash
        out.writeUTF(hashedPassword != null ? hashedPassword : "");
    }

    private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
        in.defaultReadObject();
        hashedPassword = in.readUTF();
        password = null; // Ensure password is not restored
    }
}
```

3. **Large or computed data**:
```java
public class ProcessingException extends Exception {
    private String errorCode;
    private transient byte[] largeData; // Large data không cần serialize
    private transient String computedSummary;

    private void writeObject(ObjectOutputStream out) throws IOException {
        out.defaultWriteObject();
        // Serialize summary thay vì raw data
        out.writeUTF(computedSummary != null ? computedSummary : "");
        out.writeInt(largeData != null ? largeData.length : 0);
    }

    private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
        in.defaultReadObject();
        computedSummary = in.readUTF();
        int dataSize = in.readInt();
        // largeData = null, chỉ lưu metadata
    }
}
```

4. **Version compatibility**:
```java
public class EvolvingException extends Exception {
    private static final long serialVersionUID = 1L;

    private String errorCode;
    private long timestamp;
    private Map<String, Object> metadata;

    private void writeObject(ObjectOutputStream out) throws IOException {
        out.defaultWriteObject();
        // Write version and optional data
        out.writeInt(1); // Version
        out.writeObject(metadata);
    }

    private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
        in.defaultReadObject();

        try {
            int version = in.readInt();
            if (version >= 1) {
                metadata = (Map<String, Object>) in.readObject();
            }
        } catch (IOException | ClassNotFoundException e) {
            // Handle older versions
            metadata = new HashMap<>();
        }

        // Ensure non-null
        if (metadata == null) {
            metadata = new HashMap<>();
        }
    }
}
```

**Khi KHÔNG nên dùng**:
```java
// Tệ - unnecessary complexity
public class SimpleException extends Exception {
    private String message;
    private int errorCode;

    // Không cần custom serialization - tất cả fields đều serializable
    private void writeObject(ObjectOutputStream out) throws IOException {
        out.defaultWriteObject(); // Redundant
    }

    private void readObject(ObjectInputStream in) throws IOException, ClassNotFoundException {
        in.defaultReadObject(); // Redundant
    }
}
```

**Best practices**:
1. **Chỉ dùng khi cần thiết**: Non-serializable fields, security, performance.
2. **Handle backwards compatibility**: Graceful degradation cho older versions.
3. **Document behavior**: Rõ ràng về fields nào được/không được serialize.
4. **Test thoroughly**: Serialize/deserialize across different versions.
5. **Consider alternatives**: Có thể redesign để tránh custom serialization.

---

## XI) Hiệu năng & thực tiễn

### 56. Tạo & ném exception có đắt không? Thành phần nào đắt nhất?

**Exception creation cost**:
- **Rất đắt** so với normal control flow.
- **Thành phần đắt nhất**: `fillInStackTrace()` - thu thập call stack.

**Chi phí breakdown**:
1. **Object creation**: Tương đối rẻ.
2. **fillInStackTrace()**: Rất đắt - duyệt call stack, tạo StackTraceElement[].
3. **String concatenation**: Trong message construction.
4. **Exception throwing/catching**: Overhead của JVM exception handling.

**Benchmark example**:
```java
public class ExceptionCostBenchmark {
    private static final int ITERATIONS = 1_000_000;

    public static void main(String[] args) {
        // 1. Normal return - baseline
        long start = System.nanoTime();
        for (int i = 0; i < ITERATIONS; i++) {
            normalMethod();
        }
        long normalTime = System.nanoTime() - start;

        // 2. Exception creation only
        start = System.nanoTime();
        for (int i = 0; i < ITERATIONS; i++) {
            new RuntimeException("test"); // Không throw
        }
        long creationTime = System.nanoTime() - start;

        // 3. Exception throw/catch
        start = System.nanoTime();
        for (int i = 0; i < ITERATIONS; i++) {
            try {
                throw new RuntimeException("test");
            } catch (RuntimeException e) {
                // Catch
            }
        }
        long throwCatchTime = System.nanoTime() - start;

        System.out.println("Normal method: " + normalTime / 1_000_000 + "ms");
        System.out.println("Exception creation: " + creationTime / 1_000_000 + "ms");
        System.out.println("Throw/catch: " + throwCatchTime / 1_000_000 + "ms");
    }

    private static boolean normalMethod() {
        return false;
    }
}
```

**Typical results**:
- Normal method: ~1ms
- Exception creation: ~500ms (500x slower)
- Throw/catch: ~2000ms (2000x slower)

---

### 57. Tối ưu đường nóng (hot path): tránh ném lặp lại trong vòng lặp như thế nào?

**Vấn đề với exceptions trong hot path**:
```java
// Tệ - exception trong vòng lặp
public void processItems(List<String> items) {
    for (String item : items) {
        try {
            int value = Integer.parseInt(item); // NumberFormatException cho invalid items
            processValue(value);
        } catch (NumberFormatException e) {
            handleInvalidItem(item, e);
        }
    }
    // Nếu nhiều invalid items -> nhiều exceptions -> performance kém
}
```

**Solution 1: Pre-validation**:
```java
public void processItems(List<String> items) {
    for (String item : items) {
        if (isValidInteger(item)) {
            int value = Integer.parseInt(item); // Safe - đã validate
            processValue(value);
        } else {
            handleInvalidItem(item, null);
        }
    }
}

private boolean isValidInteger(String str) {
    if (str == null || str.isEmpty()) return false;

    int start = 0;
    if (str.charAt(0) == '-') {
        if (str.length() == 1) return false;
        start = 1;
    }

    for (int i = start; i < str.length(); i++) {
        if (!Character.isDigit(str.charAt(i))) {
            return false;
        }
    }
    return true;
}
```

**Solution 2: Result objects**:
```java
public class ParseResult {
    private final boolean success;
    private final int value;
    private final String error;

    public static ParseResult success(int value) {
        return new ParseResult(true, value, null);
    }

    public static ParseResult failure(String error) {
        return new ParseResult(false, 0, error);
    }
}

public ParseResult safeParseInt(String str) {
    try {
        return ParseResult.success(Integer.parseInt(str));
    } catch (NumberFormatException e) {
        return ParseResult.failure("Invalid integer: " + str);
    }
}
```

**Solution 3: Cached exceptions**:
```java
public class CachedExceptions {
    private static final NumberFormatException CACHED_NFE =
        new NumberFormatException("Invalid number format");

    static {
        CACHED_NFE.setStackTrace(new StackTraceElement[0]);
    }

    public int parseIntFast(String str) throws NumberFormatException {
        if (!isValidInteger(str)) {
            throw CACHED_NFE; // Reuse exception instance
        }
        return Integer.parseInt(str);
    }
}
```

---
58. “Preconditions” nên check bằng if hay ném exception? Cân nhắc đọc hiểu vs chi phí.
59. Ghi log + rethrow dễ gây **double logging**—nhận diện & tránh thế nào (ở mức core)?
60. Khi **không** ghi stack trace (constructor 4 tham số) phù hợp ở đâu?

---

## XII) Edge cases, bẫy & câu gài

### 61. Bắt `Throwable` có ổn không? Nguy cơ?

**Catching Throwable - Nguy cơ**:
- **Bắt cả Error**: Có thể catch `OutOfMemoryError`, `StackOverflowError`, `VirtualMachineError`.
- **Che giấu system failures**: JVM có thể không thể recover.
- **Debugging khó khăn**: Mất thông tin về critical system errors.

**Ví dụ nguy hiểm**:
```java
// Tệ - catch Throwable
public void dangerousMethod() {
    try {
        // Some operation
        recursiveMethod(); // Có thể gây StackOverflowError
    } catch (Throwable t) {
        logger.error("Something went wrong", t);
        // Tiếp tục như không có gì - NGUY HIỂM!
    }
}
```

**Khi nào có thể catch Throwable**:
1. **Top-level exception handlers**:
```java
public class ApplicationExceptionHandler {
    public void handleUncaughtException(Thread t, Throwable e) {
        try {
            logger.fatal("Uncaught exception in thread {}", t.getName(), e);

            if (e instanceof Error) {
                // Log và shutdown gracefully
                logger.fatal("Critical error detected, shutting down");
                System.exit(1);
            } else {
                // Handle exceptions normally
                handleException((Exception) e);
            }
        } catch (Throwable loggingError) {
            // Fallback - print to stderr
            e.printStackTrace();
            System.exit(1);
        }
    }
}
```

2. **Framework/Container code**:
```java
public class TaskExecutor {
    public void executeTask(Runnable task) {
        try {
            task.run();
        } catch (Throwable t) {
            if (t instanceof Error) {
                logger.fatal("Critical error in task execution", t);
                // Rethrow Error - không thể handle
                throw (Error) t;
            } else {
                logger.error("Exception in task execution", t);
                // Handle exception
            }
        }
    }
}
```

**Best practices**:
```java
// Tốt - catch Exception, let Error propagate
try {
    riskyOperation();
} catch (Exception e) {
    // Handle recoverable exceptions
    logger.error("Operation failed", e);
}
// Error sẽ propagate và terminate application

// Nếu phải catch Throwable
try {
    riskyOperation();
} catch (Error e) {
    logger.fatal("Critical error", e);
    throw e; // Rethrow Error
} catch (Exception e) {
    logger.error("Exception", e);
    // Handle exception
}
```

---

### 62. Bắt `Exception` trước rồi mới `RuntimeException`/`IOException` sau: vì sao compile lỗi?

**Vấn đề với catch order**:
- **Unreachable code**: Subclass catch blocks không bao giờ được thực thi.
- **Compiler error**: "exception X has already been caught".

**Ví dụ lỗi**:
```java
// Compile error
try {
    riskyOperation();
} catch (Exception e) {           // Catch parent class trước
    logger.error("General exception", e);
} catch (IOException e) {         // Compile error: unreachable
    logger.error("IO exception", e);
} catch (RuntimeException e) {    // Compile error: unreachable
    logger.error("Runtime exception", e);
}
```

**Tại sao bị cấm**:
- `IOException` và `RuntimeException` đều là subclass của `Exception`.
- Khi catch `Exception`, tất cả subclass exceptions đều được bắt.
- Các catch blocks sau không bao giờ được thực thi.

**Cách sửa - Specific to general**:
```java
// Đúng - catch từ specific đến general
try {
    riskyOperation();
} catch (FileNotFoundException e) {    // Most specific
    logger.error("File not found", e);
} catch (IOException e) {              // More general
    logger.error("IO exception", e);
} catch (RuntimeException e) {         // More general
    logger.error("Runtime exception", e);
} catch (Exception e) {                // Most general
    logger.error("General exception", e);
}
```

**Multi-catch alternative**:
```java
// Nếu xử lý giống nhau
try {
    riskyOperation();
} catch (IOException | RuntimeException e) {
    logger.error("IO or Runtime exception", e);
} catch (Exception e) {
    logger.error("Other exception", e);
}
```

**Exception hierarchy example**:
```
Throwable
├── Error
└── Exception
    ├── RuntimeException
    │   ├── IllegalArgumentException
    │   ├── NullPointerException
    │   └── ...
    ├── IOException
    │   ├── FileNotFoundException
    │   └── ...
    └── Other checked exceptions
```

---

### 63. Shadow biến `e` trong nested try-catch: có gây nhầm lẫn khi debug?

**Variable shadowing trong nested try-catch**:
```java
// Có thể gây nhầm lẫn
try {
    outerOperation();
} catch (Exception e) {  // Outer exception variable
    logger.error("Outer exception", e);

    try {
        recoveryOperation();
    } catch (Exception e) {  // Shadows outer 'e' - CONFUSING!
        logger.error("Inner exception", e);
        // 'e' ở đây là inner exception, không phải outer
    }

    // 'e' ở đây lại là outer exception
    logger.error("After inner try-catch", e);
}
```

**Vấn đề khi debug**:
1. **IDE warnings**: Most IDEs cảnh báo về variable shadowing.
2. **Debugging confusion**: Breakpoint có thể show wrong exception.
3. **Code readability**: Khó hiểu exception nào đang được reference.

**Best practices - Tránh shadowing**:
```java
// Tốt - dùng tên khác nhau
try {
    outerOperation();
} catch (Exception outerException) {
    logger.error("Outer exception", outerException);

    try {
        recoveryOperation();
    } catch (Exception innerException) {
        logger.error("Inner exception", innerException);

        // Có thể access cả hai exceptions
        if (isRelated(outerException, innerException)) {
            throw new CompositeException("Multiple failures",
                Arrays.asList(outerException, innerException));
        }
    }

    // Clear reference to outer exception
    logger.error("After recovery attempt", outerException);
}
```

**Alternative approaches**:
```java
// 1. Extract inner try-catch to separate method
try {
    outerOperation();
} catch (Exception e) {
    logger.error("Outer exception", e);
    handleRecovery(e);
}

private void handleRecovery(Exception originalException) {
    try {
        recoveryOperation();
    } catch (Exception recoveryException) {
        logger.error("Recovery failed", recoveryException);
        // Can still access originalException
    }
}

// 2. Use different scopes
try {
    outerOperation();
} catch (Exception outerEx) {
    logger.error("Outer exception", outerEx);

    {  // New scope
        try {
            recoveryOperation();
        } catch (Exception innerEx) {
            logger.error("Inner exception", innerEx);
        }
    }

    // outerEx still accessible
}
```

---

### 64. `finally` ném exception **che khuất** exception gốc: cách tránh?

**Vấn đề finally masking exceptions**:
```java
// Tệ - finally che khuất exception gốc
try {
    throw new RuntimeException("Original exception");
} finally {
    throw new RuntimeException("Finally exception"); // Che khuất exception gốc
}
// Chỉ "Finally exception" được ném, "Original exception" bị mất
```

**Ví dụ thực tế**:
```java
// Nguy hiểm - resource cleanup che khuất business exception
FileInputStream fis = null;
try {
    fis = new FileInputStream("nonexistent.txt"); // FileNotFoundException
    // Process file
} finally {
    if (fis != null) {
        fis.close(); // Có thể ném IOException và che khuất FileNotFoundException
    }
}
```

**Solution 1: Try-catch trong finally**:
```java
FileInputStream fis = null;
try {
    fis = new FileInputStream("nonexistent.txt");
    // Process file
} finally {
    if (fis != null) {
        try {
            fis.close();
        } catch (IOException e) {
            logger.warn("Failed to close file", e); // Log nhưng không ném
        }
    }
}
```

**Solution 2: Suppressed exceptions (Java 7+)**:
```java
public void processFileWithSuppression() throws IOException {
    FileInputStream fis = null;
    IOException primaryException = null;

    try {
        fis = new FileInputStream("nonexistent.txt");
        // Process file
    } catch (IOException e) {
        primaryException = e;
        throw e;
    } finally {
        if (fis != null) {
            try {
                fis.close();
            } catch (IOException e) {
                if (primaryException != null) {
                    primaryException.addSuppressed(e); // Add as suppressed
                } else {
                    throw e; // No primary exception, so throw close exception
                }
            }
        }
    }
}
```

**Solution 3: Try-with-resources (khuyến nghị)**:
```java
// Tốt nhất - TWR tự động handle suppressed exceptions
try (FileInputStream fis = new FileInputStream("nonexistent.txt")) {
    // Process file
}
// TWR tự động:
// 1. Ném FileNotFoundException nếu file không tồn tại
// 2. Add IOException từ close() vào suppressed nếu có
```

**Solution 4: Exception accumulator**:
```java
public void processWithAccumulator() throws Exception {
    List<Exception> exceptions = new ArrayList<>();
    FileInputStream fis = null;

    try {
        fis = new FileInputStream("nonexistent.txt");
        // Process file
    } catch (Exception e) {
        exceptions.add(e);
    } finally {
        if (fis != null) {
            try {
                fis.close();
            } catch (Exception e) {
                exceptions.add(e);
            }
        }
    }

    if (!exceptions.isEmpty()) {
        Exception primary = exceptions.get(0);
        for (int i = 1; i < exceptions.size(); i++) {
            primary.addSuppressed(exceptions.get(i));
        }
        throw primary;
    }
}
```

**Best practices**:
1. **Use try-with-resources** khi có thể.
2. **Catch exceptions trong finally** và log thay vì rethrow.
3. **Use suppressed exceptions** để preserve cả primary và cleanup exceptions.
4. **Never throw exceptions từ finally** trừ khi không có primary exception.

---

### 65. Multi-catch với các kiểu có quan hệ cha–con: vì sao bị cấm?

**Vấn đề với parent-child trong multi-catch**:
```java
// Compile error
try {
    riskyOperation();
} catch (Exception | IOException e) {  // Error: IOException is subclass of Exception
    logger.error("Exception occurred", e);
}
```

**Tại sao bị cấm**:
1. **Redundancy**: Subclass đã được covered bởi parent class.
2. **Ambiguity**: Không rõ ràng về ý định của programmer.
3. **Type safety**: Compiler không thể determine common type safely.

**Ví dụ các trường hợp bị cấm**:
```java
// 1. Direct parent-child relationship
try {
    operation();
} catch (Exception | RuntimeException e) {  // Error
    // RuntimeException extends Exception
}

// 2. Indirect inheritance
try {
    operation();
} catch (IOException | FileNotFoundException e) {  // Error
    // FileNotFoundException extends IOException
}

// 3. Multiple levels
try {
    operation();
} catch (Throwable | Exception | RuntimeException e) {  // Error
    // All are in inheritance chain
}
```

**Cách sửa**:

1. **Chỉ dùng parent class**:
```java
// Nếu xử lý giống nhau, chỉ cần parent
try {
    operation();
} catch (Exception e) {  // Covers all Exception subclasses
    logger.error("Exception occurred", e);
}
```

2. **Dùng separate catch blocks**:
```java
// Nếu cần xử lý khác nhau
try {
    operation();
} catch (FileNotFoundException e) {
    logger.error("File not found", e);
    // Specific handling
} catch (IOException e) {
    logger.error("IO error", e);
    // General IO handling
}
```

3. **Dùng sibling classes**:
```java
// OK - không có quan hệ cha-con
try {
    operation();
} catch (IOException | SQLException e) {  // OK - siblings
    logger.error("IO or SQL error", e);
}
```

**Type inference trong multi-catch**:
```java
// Compiler infers common supertype
try {
    operation();
} catch (IOException | SQLException e) {
    // Type of 'e' is Exception (common supertype)
    // Can only call methods available in Exception
    logger.error(e.getMessage()); // OK
    // e.getErrorCode(); // Error if only SQLException has this method
}
```

**Best practices**:
1. **Use multi-catch cho sibling exceptions** với cùng handling logic.
2. **Separate catch blocks** khi cần specific handling.
3. **Avoid redundant parent-child combinations**.
4. **Consider exception hierarchy** khi design multi-catch.
### 66. `try` rỗng + `finally` nặng logic: mùi thiết kế nào?

**Code smell: Empty try with heavy finally**:
```java
// Mùi thiết kế tệ
public void suspiciousMethod() {
    try {
        // Không có gì hoặc chỉ có comment
    } finally {
        // Rất nhiều logic phức tạp
        performComplexCleanup();
        updateDatabase();
        sendNotifications();
        generateReports();
    }
}
```

**Vấn đề**:
1. **Misuse of finally**: Finally dành cho cleanup, không phải main logic.
2. **Confusing intent**: Không rõ tại sao cần try-finally.
3. **Error handling**: Logic trong finally khó handle exceptions.
4. **Testing difficulty**: Khó test finally logic riêng biệt.

**Refactoring approaches**:

1. **Extract to regular method**:
```java
// Tốt hơn - logic bình thường
public void improvedMethod() {
    performComplexCleanup();
    updateDatabase();
    sendNotifications();
    generateReports();
}
```

2. **Proper try-finally usage**:
```java
// Đúng cách - có resource cần cleanup
public void properUsage() {
    Resource resource = acquireResource();
    try {
        // Main logic sử dụng resource
        processWithResource(resource);
    } finally {
        // Cleanup resource
        if (resource != null) {
            resource.cleanup();
        }
    }
}
```

3. **Template method pattern**:
```java
public abstract class OperationTemplate {
    public final void execute() {
        try {
            performOperation();
        } finally {
            cleanup();
        }
    }

    protected abstract void performOperation();

    protected void cleanup() {
        // Default cleanup logic
    }
}
```

**Legitimate use cases cho empty try**:
```java
// 1. Ensuring cleanup after exception
public void ensureCleanup() {
    setupResources();
    try {
        // Có thể có exception từ setup
    } finally {
        cleanupResources(); // Luôn chạy
    }
}

// 2. Lock pattern
public void withLock() {
    lock.lock();
    try {
        // Lock acquired, có thể empty nếu chỉ cần hold lock
    } finally {
        lock.unlock();
    }
}
```

---

### 67. Ném `NullPointerException` thủ công có hợp lý? Khi nào nên thay bằng `Objects.requireNonNull`?

**Ném NPE thủ công**:
```java
// Có thể hợp lý trong một số trường hợp
public void setName(String name) {
    if (name == null) {
        throw new NullPointerException("Name cannot be null");
    }
    this.name = name;
}
```

**Khi nào hợp lý**:
1. **Consistency với JVM behavior**: NPE là expected exception cho null access.
2. **API contracts**: Khi null thực sự là programming error.
3. **Performance**: Tránh overhead của Objects.requireNonNull.

**Khi nào nên dùng `Objects.requireNonNull`**:

1. **Standard approach** (khuyến nghị):
```java
public void setName(String name) {
    this.name = Objects.requireNonNull(name, "Name cannot be null");
}
```

2. **Constructor validation**:
```java
public Person(String name, int age) {
    this.name = Objects.requireNonNull(name, "Name cannot be null");
    this.age = Objects.requireNonNull(age, "Age cannot be null");
}
```

3. **Method parameters**:
```java
public void processData(List<String> data) {
    Objects.requireNonNull(data, "Data list cannot be null");

    for (String item : data) {
        Objects.requireNonNull(item, "Data item cannot be null");
        // Process item
    }
}
```

**So sánh approaches**:

| Approach | Pros | Cons |
|----------|------|------|
| **Manual NPE** | Explicit, no dependencies | Verbose, inconsistent |
| **Objects.requireNonNull** | Standard, clear intent, fluent | Slight overhead |
| **IllegalArgumentException** | More descriptive | Not standard for null checks |

**Best practices**:
```java
// 1. Use Objects.requireNonNull for public APIs
public void publicMethod(String param) {
    Objects.requireNonNull(param, "Parameter cannot be null");
}

// 2. Consider manual NPE for performance-critical code
private void hotPath(String param) {
    if (param == null) throw new NullPointerException("param");
}

// 3. Use IllegalArgumentException for business validation
public void setAge(Integer age) {
    Objects.requireNonNull(age, "Age cannot be null");
    if (age < 0 || age > 150) {
        throw new IllegalArgumentException("Age must be between 0 and 150");
    }
}

// 4. Fluent validation
public Builder setName(String name) {
    this.name = Objects.requireNonNull(name, "Name cannot be null");
    return this;
}
```

---

### 68. `OutOfMemoryError`/`StackOverflowError`: xử lý được gì ở mức core?

**OutOfMemoryError (OOM)**:
- **Nguyên nhân**: Heap space exhausted, metaspace full, direct memory limit.
- **Recovery**: Rất khó, thường cần restart application.

**StackOverflowError (SOE)**:
- **Nguyên nhân**: Call stack quá sâu, thường do infinite recursion.
- **Recovery**: Có thể recover nếu catch được.

**Xử lý OutOfMemoryError**:
```java
// 1. Monitoring và alerting
public class MemoryMonitor {
    private static final MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();

    public void checkMemoryUsage() {
        MemoryUsage heapUsage = memoryBean.getHeapMemoryUsage();
        long used = heapUsage.getUsed();
        long max = heapUsage.getMax();

        double usagePercent = (double) used / max * 100;

        if (usagePercent > 90) {
            logger.warn("High memory usage: {}%", usagePercent);
            // Trigger cleanup or alert
        }
    }
}

// 2. Graceful degradation
public class CacheManager {
    private final Map<String, Object> cache = new ConcurrentHashMap<>();

    public Object get(String key) {
        try {
            return cache.get(key);
        } catch (OutOfMemoryError e) {
            logger.error("OOM in cache access, clearing cache", e);
            cache.clear(); // Emergency cleanup
            System.gc(); // Suggest GC
            throw e; // Still propagate
        }
    }
}

// 3. Circuit breaker pattern
public class MemoryCircuitBreaker {
    private volatile boolean circuitOpen = false;

    public void executeWithMemoryCheck(Runnable operation) {
        if (circuitOpen) {
            throw new IllegalStateException("Circuit breaker open due to memory issues");
        }

        try {
            operation.run();
        } catch (OutOfMemoryError e) {
            circuitOpen = true;
            logger.fatal("OOM detected, opening circuit breaker", e);
            throw e;
        }
    }
}
```

**Xử lý StackOverflowError**:
```java
// 1. Depth limiting
public class SafeRecursion {
    private static final int MAX_DEPTH = 1000;

    public int factorial(int n, int depth) {
        if (depth > MAX_DEPTH) {
            throw new IllegalArgumentException("Recursion too deep: " + depth);
        }

        if (n <= 1) return 1;
        return n * factorial(n - 1, depth + 1);
    }

    public int factorial(int n) {
        return factorial(n, 0);
    }
}

// 2. Iterative alternative
public class IterativeApproach {
    public int factorial(int n) {
        int result = 1;
        for (int i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
}

// 3. Stack overflow recovery
public class StackOverflowHandler {
    public void processData(List<String> data) {
        try {
            recursiveProcess(data, 0);
        } catch (StackOverflowError e) {
            logger.error("Stack overflow, switching to iterative approach", e);
            iterativeProcess(data); // Fallback
        }
    }

    private void recursiveProcess(List<String> data, int index) {
        if (index >= data.size()) return;

        processItem(data.get(index));
        recursiveProcess(data, index + 1); // Potential SOE
    }

    private void iterativeProcess(List<String> data) {
        for (String item : data) {
            processItem(item);
        }
    }
}
```

**Core-level strategies**:
1. **Prevention**: Monitor memory usage, limit recursion depth.
2. **Detection**: Catch errors early, implement circuit breakers.
3. **Recovery**: Clear caches, switch to simpler algorithms.
4. **Graceful shutdown**: Save state, notify users, restart cleanly.

**Limitations**:
- **OOM**: Very limited recovery options, usually need restart.
- **SOE**: Better recovery chances, can switch to iterative approaches.
- **Both**: May indicate fundamental design issues.

---

### 69. Dùng `assert` thay cho exception trong public API: vì sao là anti-pattern?

**Vấn đề với assert trong public API**:
```java
// Anti-pattern - assert trong public API
public void setAge(int age) {
    assert age >= 0 : "Age cannot be negative"; // TỆ!
    this.age = age;
}
```

**Tại sao là anti-pattern**:

1. **Assertions có thể bị tắt**:
```java
// Assertions disabled by default
// java MyClass (assertions OFF)
// java -ea MyClass (assertions ON)

public void setAge(int age) {
    assert age >= 0 : "Age cannot be negative";
    this.age = age; // age có thể âm nếu assertions tắt!
}
```

2. **API contract không đáng tin cậy**:
```java
// Client code không thể rely on validation
MyClass obj = new MyClass();
obj.setAge(-5); // Có thể pass hoặc fail tùy JVM settings
```

3. **Production vs Development behavior khác nhau**:
```java
// Development (assertions ON): AssertionError
// Production (assertions OFF): Silent corruption
```

**Cách đúng - Use exceptions**:
```java
// Đúng - exception luôn active
public void setAge(int age) {
    if (age < 0) {
        throw new IllegalArgumentException("Age cannot be negative: " + age);
    }
    this.age = age;
}
```

**Khi nào dùng assert**:

1. **Internal invariants**:
```java
private void internalMethod(int[] array, int index) {
    assert array != null : "Internal contract: array should not be null";
    assert index >= 0 && index < array.length : "Internal contract: valid index";
    // Internal logic
}
```

2. **Post-conditions**:
```java
public List<String> processItems(List<String> input) {
    List<String> result = new ArrayList<>();

    // Processing logic
    for (String item : input) {
        if (item != null && !item.isEmpty()) {
            result.add(item.toUpperCase());
        }
    }

    // Post-condition check
    assert result.size() <= input.size() : "Result cannot be larger than input";
    assert result.stream().allMatch(s -> s != null && !s.isEmpty())
        : "Result should not contain null or empty strings";

    return result;
}
```

3. **Development debugging**:
```java
private void complexCalculation() {
    int result = performCalculation();

    // Debug assertion - should be mathematically impossible
    assert result >= 0 : "Calculation result cannot be negative: " + result;

    return result;
}
```

**Best practices**:
```java
public class WellDesignedAPI {
    // Public API - always use exceptions
    public void setName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Name cannot be null or empty");
        }
        this.name = name;
    }

    // Internal method - can use assertions
    private void validateInternalState() {
        assert name != null : "Internal invariant: name should not be null";
        assert age >= 0 : "Internal invariant: age should not be negative";
    }

    // Hybrid approach
    public void processData(String data) {
        // Public validation with exceptions
        Objects.requireNonNull(data, "Data cannot be null");

        String processed = internalProcess(data);

        // Internal assertion
        assert processed != null : "Internal contract: process should not return null";
    }
}
```

---

### 70. Thao tác trong `catch` thay đổi trạng thái hệ thống gây **partial-commit**: cách rollback core-level?

**Vấn đề partial-commit**:
```java
// Nguy hiểm - partial state changes trong catch
public void transferMoney(Account from, Account to, BigDecimal amount) {
    try {
        from.withdraw(amount);     // Success
        to.deposit(amount);        // Exception ở đây
    } catch (Exception e) {
        // Partial commit: from đã bị withdraw nhưng to chưa được deposit
        logger.error("Transfer failed", e);

        // Rollback attempt trong catch
        from.deposit(amount);      // Có thể fail nữa!
    }
}
```

**Core-level rollback strategies**:

1. **Transaction pattern**:
```java
public class TransactionManager {
    private final List<Runnable> rollbackActions = new ArrayList<>();

    public void addRollbackAction(Runnable action) {
        rollbackActions.add(action);
    }

    public void commit() {
        rollbackActions.clear(); // Success - no rollback needed
    }

    public void rollback() {
        // Execute rollback actions in reverse order
        for (int i = rollbackActions.size() - 1; i >= 0; i--) {
            try {
                rollbackActions.get(i).run();
            } catch (Exception e) {
                logger.error("Rollback action failed", e);
                // Continue with other rollback actions
            }
        }
        rollbackActions.clear();
    }
}

// Usage
public void transferMoney(Account from, Account to, BigDecimal amount) {
    TransactionManager tx = new TransactionManager();

    try {
        BigDecimal originalFromBalance = from.getBalance();
        from.withdraw(amount);
        tx.addRollbackAction(() -> from.setBalance(originalFromBalance));

        BigDecimal originalToBalance = to.getBalance();
        to.deposit(amount);
        tx.addRollbackAction(() -> to.setBalance(originalToBalance));

        tx.commit(); // Success
    } catch (Exception e) {
        tx.rollback(); // Rollback all changes
        throw new TransferException("Transfer failed", e);
    }
}
```

2. **Memento pattern**:
```java
public class StateMemento {
    private final Map<String, Object> state = new HashMap<>();

    public void saveState(String key, Object value) {
        state.put(key, value);
    }

    public Object getState(String key) {
        return state.get(key);
    }
}

public class StatefulOperation {
    public void complexOperation(Account account1, Account account2) {
        StateMemento memento = new StateMemento();

        try {
            // Save original state
            memento.saveState("account1.balance", account1.getBalance());
            memento.saveState("account2.balance", account2.getBalance());

            // Perform operations
            account1.withdraw(100);
            account2.deposit(100);

        } catch (Exception e) {
            // Restore original state
            account1.setBalance((BigDecimal) memento.getState("account1.balance"));
            account2.setBalance((BigDecimal) memento.getState("account2.balance"));

            throw new OperationException("Operation failed, state restored", e);
        }
    }
}
```

3. **Command pattern với undo**:
```java
public interface Command {
    void execute() throws Exception;
    void undo() throws Exception;
}

public class WithdrawCommand implements Command {
    private final Account account;
    private final BigDecimal amount;
    private BigDecimal previousBalance;

    public WithdrawCommand(Account account, BigDecimal amount) {
        this.account = account;
        this.amount = amount;
    }

    @Override
    public void execute() throws Exception {
        previousBalance = account.getBalance();
        account.withdraw(amount);
    }

    @Override
    public void undo() throws Exception {
        account.setBalance(previousBalance);
    }
}

public class TransactionExecutor {
    private final List<Command> executedCommands = new ArrayList<>();

    public void execute(Command command) throws Exception {
        try {
            command.execute();
            executedCommands.add(command);
        } catch (Exception e) {
            rollback();
            throw e;
        }
    }

    private void rollback() {
        for (int i = executedCommands.size() - 1; i >= 0; i--) {
            try {
                executedCommands.get(i).undo();
            } catch (Exception e) {
                logger.error("Undo failed for command", e);
            }
        }
        executedCommands.clear();
    }
}
```

4. **Copy-on-write approach**:
```java
public class SafeStateManager {
    public void safeOperation(MutableObject obj) {
        // Create copy before modification
        MutableObject backup = obj.deepCopy();

        try {
            // Perform risky operations on original
            obj.modify();
            obj.transform();
            obj.validate();

        } catch (Exception e) {
            // Restore from backup
            obj.restoreFrom(backup);
            throw new OperationException("Operation failed, state restored", e);
        }
    }
}
```

**Best practices**:
1. **Plan for rollback before starting**: Design operations to be reversible.
2. **Use transactions**: Database transactions, in-memory transaction managers.
3. **Immutable objects**: Prefer immutable state when possible.
4. **Atomic operations**: Group related changes into atomic units.
5. **Compensation actions**: Define explicit undo operations.
6. **Test rollback scenarios**: Ensure rollback logic works correctly.

---

## XIII) Tình huống thiết kế (challenge – vẫn core)

### 71. Viết một `AutoCloseable` tùy biến: `close()` có nên ném checked? TWR hoạt động ra sao khi lỗi kép?

**Thiết kế AutoCloseable với checked exception**:
```java
public class CustomResource implements AutoCloseable {
    private boolean closed = false;
    private final FileInputStream fileStream;
    private final DatabaseConnection dbConnection;

    public CustomResource(String filename, String dbUrl) throws IOException, SQLException {
        this.fileStream = new FileInputStream(filename);
        this.dbConnection = DriverManager.getConnection(dbUrl);
    }

    @Override
    public void close() throws IOException {
        if (closed) return;

        IOException closeException = null;

        // Close resources in reverse order
        if (dbConnection != null) {
            try {
                dbConnection.close();
            } catch (SQLException e) {
                closeException = new IOException("Failed to close database connection", e);
            }
        }

        if (fileStream != null) {
            try {
                fileStream.close();
            } catch (IOException e) {
                if (closeException != null) {
                    e.addSuppressed(closeException);
                }
                closeException = e;
            }
        }

        closed = true;

        if (closeException != null) {
            throw closeException;
        }
    }
}
```

**TWR với lỗi kép**:
```java
public void demonstrateDoubleError() {
    try (CustomResource resource = new CustomResource("file.txt", "jdbc:db")) {
        // Main operation throws exception
        throw new RuntimeException("Main operation failed");
    } catch (Exception e) {
        // e là RuntimeException
        // Nếu close() cũng throws IOException, nó sẽ được add vào suppressed

        System.out.println("Main exception: " + e.getMessage());

        Throwable[] suppressed = e.getSuppressed();
        for (Throwable s : suppressed) {
            System.out.println("Suppressed: " + s.getMessage());
        }
    }
}
```

**Khi nào nên ném checked từ close()**:
1. **Khi close operation có thể fail** và caller cần biết.
2. **Khi failure có thể recover** được.
3. **Consistency với existing APIs** (như InputStream.close()).

**Alternative - unchecked close()**:
```java
public class UncheckedResource implements AutoCloseable {
    @Override
    public void close() {
        try {
            // Cleanup operations
        } catch (Exception e) {
            throw new RuntimeException("Failed to close resource", e);
        }
    }
}
```

---

### 72. Thiết kế ngoại lệ domain: **1 base unchecked + vài subclass**—tiêu chí chia tách?

**Base unchecked exception**:
```java
public class ECommerceException extends RuntimeException {
    private final String errorCode;
    private final Map<String, Object> context;

    protected ECommerceException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.context = new HashMap<>();
    }

    public String getErrorCode() { return errorCode; }

    public ECommerceException addContext(String key, Object value) {
        context.put(key, value);
        return this;
    }

    public Map<String, Object> getContext() {
        return new HashMap<>(context);
    }
}
```

**Tiêu chí chia tách subclass**:

1. **Theo domain area**:
```java
// Order domain
public class OrderException extends ECommerceException {
    protected OrderException(String errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
    }
}

// Payment domain
public class PaymentException extends ECommerceException {
    protected PaymentException(String errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
    }
}

// Inventory domain
public class InventoryException extends ECommerceException {
    protected InventoryException(String errorCode, String message, Throwable cause) {
        super(errorCode, message, cause);
    }
}
```

2. **Theo error category**:
```java
// Validation errors
public class ValidationException extends ECommerceException {
    public ValidationException(String field, String message) {
        super("VALIDATION_ERROR", "Validation failed for " + field + ": " + message, null);
        addContext("field", field);
    }
}

// Business rule violations
public class BusinessRuleException extends ECommerceException {
    public BusinessRuleException(String rule, String message) {
        super("BUSINESS_RULE_VIOLATION", message, null);
        addContext("rule", rule);
    }
}

// Resource not found
public class ResourceNotFoundException extends ECommerceException {
    public ResourceNotFoundException(String resourceType, String resourceId) {
        super("RESOURCE_NOT_FOUND",
              resourceType + " not found: " + resourceId, null);
        addContext("resourceType", resourceType);
        addContext("resourceId", resourceId);
    }
}
```

3. **Factory methods cho common cases**:
```java
public class ECommerceExceptions {
    public static OrderException orderNotFound(String orderId) {
        return new OrderException("ORDER_NOT_FOUND",
                                "Order not found: " + orderId, null)
                .addContext("orderId", orderId);
    }

    public static PaymentException paymentDeclined(String reason) {
        return new PaymentException("PAYMENT_DECLINED",
                                  "Payment declined: " + reason, null)
                .addContext("declineReason", reason);
    }

    public static InventoryException insufficientStock(String productId, int available, int requested) {
        return new InventoryException("INSUFFICIENT_STOCK",
                                    String.format("Insufficient stock for %s: available %d, requested %d",
                                                productId, available, requested), null)
                .addContext("productId", productId)
                .addContext("availableStock", available)
                .addContext("requestedQuantity", requested);
    }
}
```

**Guidelines**:
- **Maximum 3-4 subclasses** để tránh phức tạp.
- **Error codes** để distinguish specific errors.
- **Context data** thay vì nhiều subclass.
- **Factory methods** cho convenience.

---

### 73. API đọc file: chọn `throws IOException` hay wrap thành unchecked? Đánh đổi DX vs minh bạch.

**Option 1: Throws IOException (minh bạch)**:
```java
public class FileReader {
    public String readFile(String path) throws IOException {
        try {
            return Files.readString(Paths.get(path));
        } catch (IOException e) {
            throw new IOException("Failed to read file: " + path, e);
        }
    }

    public List<String> readLines(String path) throws IOException {
        try {
            return Files.readAllLines(Paths.get(path));
        } catch (IOException e) {
            throw new IOException("Failed to read lines from: " + path, e);
        }
    }
}

// Usage - caller phải handle
try {
    String content = fileReader.readFile("config.txt");
} catch (IOException e) {
    // Handle file error
}
```

**Option 2: Wrap thành unchecked (DX tốt hơn)**:
```java
public class UncheckedFileReader {
    public String readFile(String path) {
        try {
            return Files.readString(Paths.get(path));
        } catch (IOException e) {
            throw new FileReadException("Failed to read file: " + path, e);
        }
    }

    public List<String> readLines(String path) {
        try {
            return Files.readAllLines(Paths.get(path));
        } catch (IOException e) {
            throw new FileReadException("Failed to read lines from: " + path, e);
        }
    }
}

public class FileReadException extends RuntimeException {
    public FileReadException(String message, Throwable cause) {
        super(message, cause);
    }
}

// Usage - cleaner code
String content = fileReader.readFile("config.txt"); // No try-catch required
```

**Hybrid approach**:
```java
public class FlexibleFileReader {
    // Checked version for explicit error handling
    public String readFileChecked(String path) throws IOException {
        return Files.readString(Paths.get(path));
    }

    // Unchecked version for convenience
    public String readFile(String path) {
        try {
            return readFileChecked(path);
        } catch (IOException e) {
            throw new FileReadException("Failed to read file: " + path, e);
        }
    }

    // Optional-based approach
    public Optional<String> tryReadFile(String path) {
        try {
            return Optional.of(readFileChecked(path));
        } catch (IOException e) {
            logger.debug("Failed to read file: " + path, e);
            return Optional.empty();
        }
    }
}
```

**Decision criteria**:
- **Library/Framework**: Prefer unchecked cho better DX.
- **Application code**: Checked nếu file errors cần explicit handling.
- **Utility methods**: Provide both versions.
- **Domain context**: Business-critical files → checked, config files → unchecked.

---

### 74. Viết hàm `rethrowUnchecked(Throwable t)` dùng kỹ thuật core hợp lệ (không lạm dụng hack nguy hiểm).

**Safe rethrow implementation**:
```java
public class ExceptionUtils {

    /**
     * Rethrows any throwable as unchecked exception.
     * Uses type erasure technique - safe and JVM compliant.
     */
    @SuppressWarnings("unchecked")
    public static <T extends Throwable> void rethrowUnchecked(Throwable throwable) throws T {
        throw (T) throwable;
    }

    /**
     * Alternative implementation using RuntimeException wrapping
     * for checked exceptions only.
     */
    public static void rethrowAsUnchecked(Throwable throwable) {
        if (throwable instanceof RuntimeException) {
            throw (RuntimeException) throwable;
        } else if (throwable instanceof Error) {
            throw (Error) throwable;
        } else {
            // Wrap checked exception
            throw new RuntimeException(throwable);
        }
    }

    /**
     * Preserves original exception type when possible.
     */
    public static void rethrowPreservingType(Throwable throwable) {
        if (throwable instanceof RuntimeException) {
            throw (RuntimeException) throwable;
        } else if (throwable instanceof Error) {
            throw (Error) throwable;
        } else {
            // Use type erasure for checked exceptions
            ExceptionUtils.<RuntimeException>rethrowUnchecked(throwable);
        }
    }
}
```

**Usage examples**:
```java
public class UsageExamples {

    // Example 1: Wrapping checked exceptions in functional interfaces
    public static <T> Supplier<T> unchecked(CheckedSupplier<T> supplier) {
        return () -> {
            try {
                return supplier.get();
            } catch (Exception e) {
                ExceptionUtils.rethrowUnchecked(e);
                return null; // Never reached
            }
        };
    }

    @FunctionalInterface
    public interface CheckedSupplier<T> {
        T get() throws Exception;
    }

    // Example 2: Stream processing with checked exceptions
    public List<String> processFiles(List<String> filePaths) {
        return filePaths.stream()
            .map(unchecked(path -> Files.readString(Paths.get(path))))
            .collect(Collectors.toList());
    }

    // Example 3: Callback handling
    public void executeCallback(CheckedRunnable callback) {
        try {
            callback.run();
        } catch (Exception e) {
            logger.error("Callback failed", e);
            ExceptionUtils.rethrowUnchecked(e);
        }
    }

    @FunctionalInterface
    public interface CheckedRunnable {
        void run() throws Exception;
    }
}
```

**Why this technique is safe**:
1. **Type erasure**: Generics are erased at runtime, so `<T extends Throwable>` becomes just `Throwable`.
2. **JVM compliant**: No bytecode manipulation or reflection hacks.
3. **Preserves stack trace**: Original exception is thrown as-is.
4. **No wrapping overhead**: Direct rethrow without creating new exception objects.

---

### 75. Chuẩn hoá thông điệp exception: bao gồm **id đối tượng/đường dẫn/tham số**—mẫu message tốt là gì?

**Structured message template**:
```java
public class MessageTemplate {

    // Pattern: [ERROR_CODE] Operation failed: reason [context]
    public static String format(String errorCode, String operation, String reason,
                              Map<String, Object> context) {
        StringBuilder sb = new StringBuilder();

        // Error code prefix
        sb.append("[").append(errorCode).append("] ");

        // Operation description
        sb.append(operation).append(" failed: ");

        // Failure reason
        sb.append(reason);

        // Context information
        if (context != null && !context.isEmpty()) {
            sb.append(" [");
            context.entrySet().stream()
                .map(entry -> entry.getKey() + "=" + entry.getValue())
                .forEach(pair -> sb.append(pair).append(", "));

            // Remove trailing comma
            if (sb.length() > 2) {
                sb.setLength(sb.length() - 2);
            }
            sb.append("]");
        }

        return sb.toString();
    }
}
```

**Domain-specific message builders**:
```java
public class OrderExceptionMessages {

    public static String orderNotFound(String orderId) {
        Map<String, Object> context = Map.of(
            "orderId", orderId,
            "timestamp", Instant.now(),
            "operation", "ORDER_LOOKUP"
        );

        return MessageTemplate.format(
            "ORDER_NOT_FOUND",
            "Order retrieval",
            "Order does not exist",
            context
        );
    }

    public static String insufficientStock(String productId, String orderId,
                                         int requested, int available) {
        Map<String, Object> context = Map.of(
            "productId", productId,
            "orderId", orderId,
            "requestedQuantity", requested,
            "availableQuantity", available,
            "operation", "STOCK_CHECK"
        );

        return MessageTemplate.format(
            "INSUFFICIENT_STOCK",
            "Stock validation",
            String.format("Requested %d but only %d available", requested, available),
            context
        );
    }

    public static String paymentFailed(String orderId, String paymentId,
                                     String gatewayResponse) {
        Map<String, Object> context = Map.of(
            "orderId", orderId,
            "paymentId", paymentId,
            "gatewayResponse", gatewayResponse,
            "operation", "PAYMENT_PROCESSING"
        );

        return MessageTemplate.format(
            "PAYMENT_FAILED",
            "Payment processing",
            "Gateway declined transaction",
            context
        );
    }
}
```

**File operation messages**:
```java
public class FileExceptionMessages {

    public static String fileNotFound(String filePath, String operation) {
        Map<String, Object> context = Map.of(
            "filePath", filePath,
            "operation", operation,
            "workingDirectory", System.getProperty("user.dir")
        );

        return MessageTemplate.format(
            "FILE_NOT_FOUND",
            "File access",
            "File does not exist at specified path",
            context
        );
    }

    public static String permissionDenied(String filePath, String requiredPermission) {
        Map<String, Object> context = Map.of(
            "filePath", filePath,
            "requiredPermission", requiredPermission,
            "currentUser", System.getProperty("user.name")
        );

        return MessageTemplate.format(
            "PERMISSION_DENIED",
            "File access",
            "Insufficient permissions for file operation",
            context
        );
    }
}
```

**API parameter validation messages**:
```java
public class ValidationMessages {

    public static String nullParameter(String parameterName, String methodName) {
        Map<String, Object> context = Map.of(
            "parameterName", parameterName,
            "methodName", methodName,
            "parameterType", "required"
        );

        return MessageTemplate.format(
            "NULL_PARAMETER",
            "Parameter validation",
            "Required parameter cannot be null",
            context
        );
    }

    public static String invalidRange(String parameterName, Object value,
                                    Object minValue, Object maxValue) {
        Map<String, Object> context = Map.of(
            "parameterName", parameterName,
            "actualValue", value,
            "minValue", minValue,
            "maxValue", maxValue
        );

        return MessageTemplate.format(
            "INVALID_RANGE",
            "Parameter validation",
            String.format("Value %s is outside valid range [%s, %s]", value, minValue, maxValue),
            context
        );
    }
}
```

**Usage examples**:
```java
public class ExceptionUsage {

    public Order getOrder(String orderId) throws OrderException {
        if (orderId == null) {
            throw new OrderException(
                ValidationMessages.nullParameter("orderId", "getOrder")
            );
        }

        Order order = orderRepository.findById(orderId);
        if (order == null) {
            throw new OrderException(
                OrderExceptionMessages.orderNotFound(orderId)
            );
        }

        return order;
    }

    public void processPayment(String orderId, String paymentId) throws PaymentException {
        try {
            PaymentResult result = paymentGateway.processPayment(paymentId);
            if (!result.isSuccess()) {
                throw new PaymentException(
                    OrderExceptionMessages.paymentFailed(orderId, paymentId, result.getResponse())
                );
            }
        } catch (GatewayException e) {
            throw new PaymentException(
                OrderExceptionMessages.paymentFailed(orderId, paymentId, e.getMessage()),
                e
            );
        }
    }
}
```

**Message pattern benefits**:
1. **Consistent format**: Dễ parse bởi monitoring tools.
2. **Rich context**: Đủ thông tin để debug.
3. **Searchable**: Error codes giúp tìm kiếm logs.
4. **Structured data**: Context map có thể extract thành metrics.
5. **Human readable**: Vẫn dễ đọc cho developers.

---

## Tóm tắt & Best Practices

### Core Principles
1. **Exception hierarchy**: Checked cho recoverable errors, unchecked cho programming errors.
2. **Try-with-resources**: Luôn dùng cho AutoCloseable resources.
3. **Exception chaining**: Preserve original cause với meaningful context.
4. **Fail fast**: Validate early, fail immediately với clear messages.
5. **Don't swallow exceptions**: Luôn log hoặc propagate exceptions.

### Performance Considerations
1. **Exceptions are expensive**: Tránh trong hot paths và loops.
2. **Stack trace cost**: Disable khi không cần thiết cho performance.
3. **Pre-validation**: Check conditions trước khi có thể throw exceptions.
4. **Cached exceptions**: Reuse exception instances cho high-frequency scenarios.

### Design Guidelines
1. **API contracts**: Use exceptions cho clear contracts, if-checks cho performance.
2. **Layer boundaries**: Transform exceptions appropriately between layers.
3. **Message standards**: Consistent format với error codes và context.
4. **Thread safety**: Handle exceptions properly trong concurrent code.
5. **Testing**: Always test exception scenarios và rollback logic.

### Common Pitfalls to Avoid
1. **Empty catch blocks**: Never ignore exceptions without logging.
2. **Generic Exception**: Avoid `throws Exception` trong public APIs.
3. **Finally masking**: Don't let finally exceptions hide primary exceptions.
4. **Double logging**: Coordinate logging strategy across layers.
5. **Resource leaks**: Always cleanup resources, especially trong exception scenarios.

### Modern Java Features
1. **Multi-catch**: Simplify exception handling cho related exceptions.
2. **Suppressed exceptions**: Automatic handling trong try-with-resources.
3. **Helpful NPE**: Better debugging information trong Java 14+.
4. **Pattern matching**: Cleaner instanceof checks trong newer Java versions.

Tài liệu này cung cấp nền tảng vững chắc về Java Exception handling cho các cuộc phỏng vấn technical, từ kiến thức cơ bản đến các kỹ thuật nâng cao và best practices trong production code.
76. Cho đoạn mã có `try/finally` với `return` trong cả hai: dự đoán output và giải thích dòng thời gian.
77. Chuỗi gọi 4 tầng: A→B→C→D, D ném `IOException`, B muốn wrap thành unchecked rồi ném tiếp—thiết kế để **không mất cause**.
78. Viết ví dụ `getSuppressed()` thể hiện **3** suppressed exceptions xếp chồng khi đóng nhiều resource.
79. Thử bắt `Exception` ở cấp rất cao (main) và in stack trace có đủ ngữ cảnh? Cần thêm gì ở message?
80. Phân tích vì sao **catch rộng** + `continue` trong vòng lặp có thể che giấu lỗi dữ liệu và gây **silent data loss**.
