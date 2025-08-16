## 1) Kiểu số & wrapper types

### 1. Liệt kê 8 kiểu nguyên thủy số trong Java và miền giá trị của từng kiểu.
- **Trả lời**:
    - Java có 8 kiểu nguyên thủy:
        1. `byte`: 8-bit, -128 → 127.
        2. `short`: 16-bit, -32,768 → 32,767.
        3. `int`: 32-bit, -2^31 → 2^31-1 (~ -2.1 tỷ → 2.1 tỷ).
        4. `long`: 64-bit, -2^63 → 2^63-1.
        5. `float`: 32-bit, ±1.4E-45 → ±3.4E38, độ chính xác ~7 chữ số thập phân.
        6. `double`: 64-bit, ±4.9E-324 → ±1.8E308, độ chính xác ~16 chữ số thập phân.
        7. `char`: 16-bit, 0 → 65,535 (Unicode UTF-16 code unit).
        8. `boolean`: Không phải số, nhưng là nguyên thủy (true/false).

### 2. Wrapper types (`Byte`, `Short`, `Integer`, `Long`, `Float`, `Double`) khác gì so với primitive về bộ nhớ, nullability và hiệu năng?
- **Trả lời**:
    - **Bộ nhớ**:
        - Primitive: Lưu trực tiếp trên stack, kích thước cố định (ví dụ: `int` 4 bytes, `double` 8 bytes).
        - Wrapper: Là object, lưu trên heap, tốn thêm bộ nhớ cho metadata (thường 12-16 bytes + primitive).
    - **Nullability**:
        - Primitive: Không thể là `null`.
        - Wrapper: Có thể là `null`, dùng trong collection (`List<Integer>`).
    - **Hiệu năng**:
        - Primitive: Nhanh hơn, không cần boxing/unboxing.
        - Wrapper: Chậm hơn do overhead của object và boxing/unboxing.
    - **Ví dụ**:
      ```java
      int i = 5; // Primitive
      Integer j = 5; // Wrapper, có thể null
      ```

### 3. ⚠️ Gài: `Integer a = 128; Integer b = 128; a == b` cho kết quả gì? Vì sao có **Integer cache**?
- **Trả lời**:
    - **Kết quả**: `a == b` trả về `false`.
    - **Lý do**: **Integer cache** lưu các giá trị từ -128 đến 127 (có thể tùy chỉnh cao hơn qua `java.lang.Integer.IntegerCache.high`). Với `128`, `Integer.valueOf(128)` tạo hai object khác nhau, nên `==` so sánh tham chiếu trả `false`.
    - **Mục đích cache**: Tăng hiệu năng và tiết kiệm bộ nhớ khi tái sử dụng các giá trị nhỏ thường dùng.
    - **Ví dụ**:
      ```java
      Integer a = 127, b = 127;
      System.out.println(a == b); // true (cache)
      Integer c = 128, d = 128;
      System.out.println(c == d); // false
      ```

### 4. Tự động boxing/unboxing diễn ra khi nào? Rủi ro `NullPointerException` nào thường gặp khi unbox?
- **Trả lời**:
    - **Boxing**: Primitive → wrapper (ví dụ: `int` → `Integer` khi gán vào `List<Integer>`).
    - **Unboxing**: Wrapper → primitive (ví dụ: `Integer` → `int` trong phép toán).
    - **Rủi ro `NullPointerException`**:
        - Xảy ra khi unbox một wrapper `null` thành primitive.
    - **Ví dụ**:
      ```java
      Integer i = null;
      int j = i; // NullPointerException
      ```
    - **Khắc phục**: Kiểm tra `null` trước khi unbox.

### 5. Khác nhau giữa `new Integer(5)` và `Integer.valueOf(5)`? Ảnh hưởng tới cache và GC?
- **Trả lời**:
    - **`new Integer(5)`**: Luôn tạo object mới, không dùng cache.
    - **`Integer.valueOf(5)`**: Tái sử dụng object từ **Integer cache** (nếu trong -128 → 127).
    - **Ảnh hưởng**:
        - Cache: `valueOf` tận dụng cache, giảm bộ nhớ.
        - GC: `new Integer` tạo nhiều object, tăng áp lực GC.
    - **Khuyến nghị**: Dùng `Integer.valueOf()`.

---

## 2) Số thực & độ chính xác

### 1. Tại sao số chấm động (`float/double`) có thể sai số? IEEE-754 là gì?
- **Trả lời**:
    - **Sai số**: `float`/`double` biểu diễn số thực theo chuẩn **IEEE-754**, dùng bit hữu hạn (32/64 bit) nên không thể biểu diễn chính xác một số thập phân (ví dụ: 0.1).
    - **IEEE-754**: Chuẩn biểu diễn số chấm động, gồm sign, exponent, mantissa. Sai số xuất hiện khi số thập phân không thể biểu diễn chính xác trong hệ nhị phân.
    - **Ví dụ**:
      ```java
      double d = 0.1 + 0.2; // ~0.30000000000000004
      ```

### 2. ⚠️ Gài: Vì sao `0.1 + 0.2 != 0.3` với `double`? Khi nào nên dùng `BigDecimal`?
- **Trả lời**:
    - **Lý do**: `0.1` và `0.2` không biểu diễn chính xác trong hệ nhị phân (IEEE-754), dẫn đến sai số cộng dồn.
    - **Dùng `BigDecimal`**: Khi cần độ chính xác cao (tài chính, tiền tệ, khoa học).
    - **Ví dụ**:
      ```java
      BigDecimal a = BigDecimal.valueOf(0.1);
      BigDecimal b = BigDecimal.valueOf(0.2);
      BigDecimal sum = a.add(b); // 0.3
      ```

### 3. NaN, Infinity, −0.0 là gì? So sánh bằng `==` với NaN ra sao?
- **Trả lời**:
    - **NaN**: Not-a-Number, kết quả của phép toán không xác định (ví dụ: `0.0/0.0`).
    - **Infinity**: Kết quả vượt quá giới hạn (`1.0/0.0` → `Double.POSITIVE_INFINITY`).
    - **−0.0**: Số 0 âm, khác `0.0` về bit nhưng `==` trả `true`.
    - **So sánh với NaN**: `NaN == NaN` trả `false`. Dùng `Double.isNaN()` để kiểm tra.
    - **Ví dụ**:
      ```java
      double d = Double.NaN;
      System.out.println(d == d); // false
      System.out.println(Double.isNaN(d)); // true
      ```

### 4. So sánh `StrictMath` và `Math`: hành vi/độ chính xác khác nhau thế nào?
- **Trả lời**:
    - **`Math`**: Cung cấp các hàm toán học nhanh, nhưng kết quả có thể phụ thuộc nền tảng.
    - **`StrictMath`**: Đảm bảo kết quả giống nhau trên mọi nền tảng, tuân thủ chặt IEEE-754.
    - **Khác biệt**:
        - `StrictMath` chậm hơn do không tối ưu hóa native.
        - Dùng `StrictMath` khi cần tính nhất quán (ví dụ: ứng dụng khoa học).
    - **Ví dụ**:
      ```java
      double sin = StrictMath.sin(0.5); // Kết quả nhất quán
      ```

### 5. Các phương thức làm tròn: `Math.round`, `ceil`, `floor`, `rint` — chọn cái nào cho yêu cầu nghiệp vụ?
- **Trả lời**:
    - **`Math.round`**: Làm tròn đến số nguyên gần nhất (0.5 → lên).
    - **`Math.ceil`**: Làm tròn lên (ceiling).
    - **`Math.floor`**: Làm tròn xuống (floor).
    - **`Math.rint`**: Làm tròn đến số nguyên gần nhất, ưu tiên số chẵn nếu giữa (ví dụ: 2.5 → 2.0).
    - **Chọn**:
        - Tài chính: `Math.round` hoặc `BigDecimal` với `RoundingMode`.
        - Khoa học: `Math.rint` cho tính nhất quán.
        - Giới hạn phạm vi: `ceil`/`floor`.

---

## 3) BigInteger & BigDecimal

### 1. `BigInteger`/`BigDecimal` giải quyết bài toán gì so với `long`/`double`? Trade-off về hiệu năng.
- **Trả lời**:
    - **Giải quyết**:
        - `BigInteger`: Số nguyên kích thước bất kỳ, vượt giới hạn `long` (2^63-1).
        - `BigDecimal`: Số thập phân độ chính xác cao, tránh sai số của `double`.
    - **Trade-off**:
        - Hiệu năng chậm hơn do tính toán trên object, không dùng CPU native.
        - Tốn bộ nhớ hơn.
    - **Ví dụ**:
      ```java
      BigInteger bi = new BigInteger("12345678901234567890");
      BigDecimal bd = BigDecimal.valueOf(0.1).add(BigDecimal.valueOf(0.2)); // 0.3
      ```

### 2. Khái niệm **scale** trong `BigDecimal` là gì?
- **Trả lời**:
    - **Scale**: Số chữ số thập phân (sau dấu chấm) của `BigDecimal`.
    - **Ví dụ**:
      ```java
      BigDecimal bd = new BigDecimal("123.456"); // Scale = 3
      ```

### 3. ⚠️ Gài: `new BigDecimal(0.1)` vs `BigDecimal.valueOf(0.1)` khác gì? Hậu quả?
- **Trả lời**:
    - **`new BigDecimal(0.1)`**: Tạo từ `double`, mang sai số của IEEE-754 (~0.10000000000000000555...).
    - **`BigDecimal.valueOf(0.1)`**: Tạo từ chuỗi nội bộ, đảm bảo chính xác (0.1).
    - **Hậu quả**: `new BigDecimal(0.1)` gây sai số trong tính toán tài chính.
    - **Khuyến nghị**: Luôn dùng `BigDecimal.valueOf()`.

### 4. `RoundingMode` gồm những chế độ nào? Chọn mode nào cho bài toán tài chính?
- **Trả lời**:
    - **Chế độ**:
        - `UP`: Làm tròn xa 0.
        - `DOWN`: Làm tròn về 0.
        - `CEILING`: Làm tròn lên.
        - `FLOOR`: Làm tròn xuống.
        - `HALF_UP`: Làm tròn ≥0.5 lên, <0.5 xuống.
        - `HALF_DOWN`: Làm tròn >0.5 lên, ≤0.5 xuống.
        - `HALF_EVEN`: Làm tròn về số chẵn gần nhất nếu 0.5.
        - `UNNECESSARY`: Ném lỗi nếu cần làm tròn.
    - **Tài chính**: Dùng `HALF_UP` hoặc `HALF_EVEN` (ngân hàng thường dùng `HALF_EVEN`).

### 5. So sánh `equals()` và `compareTo()` trên `BigDecimal` (ảnh hưởng của scale).
- **Trả lời**:
    - **`equals()`**: So sánh giá trị và scale (1.0 ≠ 1.00).
    - **`compareTo()`**: So sánh giá trị số, bỏ qua scale (1.0 = 1.00).
    - **Ví dụ**:
      ```java
      BigDecimal a = new BigDecimal("1.0");
      BigDecimal b = new BigDecimal("1.00");
      a.equals(b); // false
      a.compareTo(b); // 0
      ```

### 6. Chuyển đổi `BigDecimal` → `int/long` an toàn: dùng phương thức nào để **fail-fast** khi tràn?
- **Trả lời**:
    - Dùng `intValueExact()`, `longValueExact()` để ném `ArithmeticException` nếu tràn hoặc có phần thập phân.
    - **Ví dụ**:
      ```java
      BigDecimal bd = new BigDecimal("123.45");
      bd.intValueExact(); // ArithmeticException
      ```

---

## 4) Chuyển kiểu số & tràn số

### 1. Widening vs narrowing conversion; khi nào cần cast tường minh?
- **Trả lời**:
    - **Widening**: Chuyển từ kiểu nhỏ sang lớn (`int` → `long`), tự động, không mất dữ liệu.
    - **Narrowing**: Chuyển từ kiểu lớn sang nhỏ (`long` → `int`), cần cast tường minh, có thể mất dữ liệu.
    - **Ví dụ**:
      ```java
      int i = 5;
      long l = i; // Widening
      int j = (int) l; // Narrowing
      ```

### 2. ⚠️ Gài: `byte b = (byte) 130;` cho ra giá trị nào? Vì sao có tràn số?
- **Trả lời**:
    - **Kết quả**: `b = -126`.
    - **Lý do**: `byte` chỉ chứa -128 → 127. `130` (int) vượt giới hạn, khi cast thành `byte` lấy 8 bit thấp (130 % 256 - 256 = -126).
    - **Ví dụ**:
      ```java
      byte b = (byte) 130; // -126
      ```

### 3. `Math.addExact`, `subtractExact`, `multiplyExact`, `toIntExact`: dùng khi nào và vì sao tốt hơn phép toán thô?
- **Trả lời**:
    - **Dùng khi**: Cần phát hiện tràn số ngay lập tức (fail-fast).
    - **Lợi ích**: Ném `ArithmeticException` nếu kết quả vượt giới hạn, tránh lỗi ngầm.
    - **Ví dụ**:
      ```java
      int a = Integer.MAX_VALUE;
      Math.addExact(a, 1); // ArithmeticException
      ```

### 4. Parse chuỗi thành số: `Integer.parseInt`, `Long.parseLong`, hỗ trợ **radix** ra sao? Xử lý dấu `+/-` thế nào?
- **Trả lời**:
    - **`parseInt`/`parseLong`**: Chuyển chuỗi thành `int`/`long`, mặc định radix 10.
    - **Radix**: Hỗ trợ cơ số (2-36) qua tham số (ví dụ: `parseInt("FF", 16)`).
    - **Dấu `+/-`**: Hỗ trợ `+` hoặc `-` ở đầu chuỗi.
    - **Ví dụ**:
      ```java
      int i = Integer.parseInt("-123"); // -123
      int hex = Integer.parseInt("FF", 16); // 255
      ```

---

## 5) Định dạng & phân tích cú pháp số (Formatting/Parsing)

### 1. Khác nhau giữa `NumberFormat`/`DecimalFormat` và `String.format`/`Formatter`.
- **Trả lời**:
    - **`NumberFormat`/`DecimalFormat`**:
        - Chuyên định dạng số theo `Locale` (tiền tệ, phần trăm).
        - Hỗ trợ parse chuỗi thành số.
    - **`String.format`/`Formatter`**:
        - Linh hoạt hơn, định dạng chuỗi tổng quát.
        - Không hỗ trợ parse trực tiếp.
    - **Ví dụ**:
      ```java
      NumberFormat nf = NumberFormat.getCurrencyInstance(Locale.US);
      String s = nf.format(1234.56); // $1,234.56
      String t = String.format("%.2f", 1234.56); // 1234.56
      ```

### 2. Vai trò của `Locale` khi định dạng số, tiền tệ, phần trăm.
- **Trả lời**:
    - **Locale**: Quy định định dạng số (dấu thập phân, nhóm hàng nghìn), tiền tệ (ký hiệu), phần trăm (%).
    - **Ví dụ**:
      ```java
      NumberFormat nf = NumberFormat.getCurrencyInstance(Locale.GERMANY);
      String s = nf.format(1234.56); // 1.234,56 €
      ```

### 3. ⚠️ Gài: Vì sao định dạng `"1,234.56"` có thể parse sai ở `Locale` khác? Cách xử lý i18n đúng.
- **Trả lời**:
    - **Lý do**: `Locale` khác nhau dùng dấu phân cách khác (US: `.` cho thập phân, DE: `,`).
    - **Hậu quả**: `NumberFormat` parse sai nếu không khớp `Locale`.
    - **Xử lý i18n**:
        - Chỉ định `Locale` rõ ràng khi parse.
        - Dùng `NumberFormat.getInstance(Locale)`.
    - **Ví dụ**:
      ```java
      NumberFormat nf = NumberFormat.getInstance(Locale.GERMANY);
      Number n = nf.parse("1.234,56"); // 1234.56
      ```

### 4. Mẫu định dạng `DecimalFormat` (ký tự `#`, `0`, nhóm, phần trăm, tiền tệ) – các bẫy thường gặp.
- **Trả lời**:
    - **Ký tự**:
        - `#`: Hiển thị chữ số nếu có, bỏ nếu không.
        - `0`: Luôn hiển thị, điền 0 nếu thiếu.
        - `,`: Nhóm hàng nghìn.
        - `%`: Nhân 100, thêm ký hiệu %.
        - `¤`: Ký hiệu tiền tệ.
    - **Bẫy**:
        - Quên `Locale`, gây sai dấu phân cách.
        - Số chữ số thập phân không đủ khi parse.
    - **Ví dụ**:
      ```java
      DecimalFormat df = new DecimalFormat("#,##0.00");
      String s = df.format(1234.5); // 1,234.50
      ```

### 5. In số có leading zeros/width alignment bằng `String.format` (`%03d`, `%10.2f`).
- **Trả lời**:
    - **`%03d`**: Số nguyên, 3 chữ số, điền 0 bên trái.
    - **`%10.2f`**: Số thực, tổng 10 ký tự, 2 chữ số thập phân.
    - **Ví dụ**:
      ```java
      String s = String.format("%03d", 5); // 005
      String t = String.format("%10.2f", 12.3); //     12.30
      ```

---

## 6) `String` — bất biến, pool & interning

### 1. Vì sao `String` là **immutable**? Lợi ích về an toàn & cache.
- **Trả lời**:
    - **Immutable**: `String` không thể thay đổi nội dung sau khi tạo.
    - **Lợi ích**:
        - **An toàn**: Ngăn sửa đổi ngoài ý muốn, phù hợp cho key trong `HashMap`.
        - **Cache**: Hỗ trợ **string pool**, tái sử dụng chuỗi, tiết kiệm bộ nhớ.
        - **Thread-safe**: Không cần đồng bộ.

### 2. ⚠️ Gài: `new String("abc")` tạo bao nhiêu object? Ảnh hưởng tới **string pool**?
- **Trả lời**:
    - **Số object**:
        - 1 trong **string pool** ("abc").
        - 1 trên heap (`new String`).
    - **Ảnh hưởng**: `new String("abc")` không thêm vào string pool, nhưng literal "abc" được pool.
    - **Ví dụ**:
      ```java
      String s = new String("abc"); // 2 objects
      ```

### 3. `String.intern()` làm gì? Khi nào nên/không nên dùng?
- **Trả lời**:
    - **`intern()`**: Trả về chuỗi từ **string pool** hoặc thêm chuỗi vào pool.
    - **Nên dùng**: Khi cần tái sử dụng chuỗi để tiết kiệm bộ nhớ.
    - **Không nên dùng**: Lạm dụng gây đầy string pool, tăng áp lực GC.
    - **Ví dụ**:
      ```java
      String s = new String("abc").intern(); // Trả về chuỗi trong pool
      ```

### 4. So sánh `==` và `equals()` cho `String` — khi nào `==` trả `true` “tình cờ”.
- **Trả lời**:
    - **`==`**: So sánh tham chiếu.
    - **`equals()`**: So sánh nội dung chuỗi.
    - **Tình cờ `true`**:
        - Khi cả hai `String` trỏ cùng object trong string pool.
        - Hoặc cả hai được `intern()`.
    - **Ví dụ**:
      ```java
      String a = "abc";
      String b = "abc";
      System.out.println(a == b); // true (string pool)
      ```

### 5. `substring()` từ Java 7u6 trở đi khác gì trước đó về chia sẻ mảng char/bộ nhớ?
- **Trả lời**:
    - **Trước Java 7u6**: `substring()` chia sẻ mảng `char[]` gốc, gây memory leak nếu chuỗi gốc lớn.
    - **Từ Java 7u6**: Tạo mảng `char[]` mới, không giữ tham chiếu chuỗi gốc.
    - **Ví dụ**:
      ```java
      String s = "longstring".substring(0, 4); // Từ 7u6: tạo mảng mới cho "long"
      ```

---

## 7) Ghép chuỗi & hiệu năng

### 1. Khác nhau giữa `String`, `StringBuilder`, `StringBuffer`: thread-safety, hiệu năng, use-case.
- **Trả lời**:
    - **`String`**:
        - Immutable, thread-safe.
        - Hiệu năng thấp khi ghép chuỗi (tạo object mới).
        - Use-case: Chuỗi cố định.
    - **`StringBuilder`**:
        - Mutable, không thread-safe.
        - Hiệu năng cao, phù hợp vòng lặp.
        - Use-case: Ghép chuỗi trong single-thread.
    - **`StringBuffer`**:
        - Mutable, thread-safe (synchronized).
        - Hiệu năng thấp hơn `StringBuilder`.
        - Use-case: Ghép chuỗi trong multi-thread.

### 2. ⚠️ Gài: Tại sao `"a" + b + c` trong vòng lặp là anti-pattern? Trình biên dịch có tối ưu ngoài vòng lặp không?
- **Trả lời**:
    - **Anti-pattern trong vòng lặp**: Mỗi phép `+` tạo `String` mới, tốn bộ nhớ và CPU.
    - **Tối ưu ngoài vòng lặp**: Trình biên dịch chuyển `+` thành `StringBuilder` cho chuỗi tĩnh.
    - **Ví dụ**:
      ```java
      String s = "";
      for (int i = 0; i < 1000; i++) {
          s += i; // Anti-pattern
      }
      // Tốt hơn:
      StringBuilder sb = new StringBuilder();
      for (int i = 0; i < 1000; i++) {
          sb.append(i);
      }
      ```

### 3. `StringBuilder` nên được tái sử dụng như thế nào để giảm GC?
- **Trả lời**:
    - Khởi tạo `StringBuilder` với dung lượng ban đầu đủ lớn.
    - Tái sử dụng bằng cách gọi `setLength(0)` thay vì tạo mới.
    - **Ví dụ**:
      ```java
      StringBuilder sb = new StringBuilder(1000);
      sb.append("data");
      sb.setLength(0); // Reset để tái sử dụng
      ```

### 4. `String.join`, `StringJoiner`, `Collectors.joining` — khi nào dùng mỗi cái?
- **Trả lời**:
    - **`String.join`**: Ghép danh sách chuỗi với delimiter, ngắn gọn.
        - Use-case: Ghép mảng/list đơn giản.
    - **`StringJoiner`**: Linh hoạt hơn, hỗ trợ prefix/suffix.
        - Use-case: Định dạng JSON/CSV.
    - **`Collectors.joining`**: Dùng trong Stream API.
        - Use-case: Ghép kết quả stream.
    - **Ví dụ**:
      ```java
      String s = String.join(",", "a", "b"); // a,b
      StringJoiner sj = new StringJoiner(",", "[", "]").add("a").add("b"); // [a,b]
      ```

---

## 8) API chuỗi quan trọng

### 1. `length`, `isEmpty`, `isBlank`, `strip` vs `trim`, `repeat`, `indent`, `transform` (các phiên bản Java khác nhau).
- **Trả lời**:
    - **`length`**: Độ dài chuỗi (code units).
    - **`isEmpty`**: Kiểm tra chuỗi rỗng (Java 6+).
    - **`isBlank`**: Kiểm tra chuỗi rỗng hoặc chỉ chứa khoảng trắng (Java 11+).
    - **`strip` vs `trim`**: `strip` (Java 11+) loại bỏ khoảng trắng Unicode, `trim` chỉ loại ASCII.
    - **`repeat`**: Lặp chuỗi (Java 11+).
    - **`indent`**: Thêm thụt đầu dòng (Java 12+).
    - **`transform`**: Áp dụng hàm lên chuỗi (Java 12+).
    - **Ví dụ**:
      ```java
      String s = "  ";
      s.isBlank(); // true
      s.strip(); // ""
      ```

### 2. Tìm kiếm/thay thế: `indexOf`/`lastIndexOf`, `replace`, `replaceFirst/All` (regex), `contains`.
- **Trả lời**:
    - **`indexOf`/`lastIndexOf`**: Tìm vị trí đầu/cuối của chuỗi con.
    - **`replace`**: Thay thế literal.
    - **`replaceFirst/All`**: Thay thế dựa trên regex.
    - **`contains`**: Kiểm tra chuỗi con.
    - **Ví dụ**:
      ```java
      String s = "hello world";
      s.indexOf("l"); // 2
      s.replaceAll("l", "x"); // hexlo worxd
      ```

### 3. ⚠️ Gài: Khác nhau giữa `replace` (literal) và `replaceAll` (regex). Khi nào `PatternSyntaxException` xảy ra?
- **Trả lời**:
    - **`replace`**: Thay thế chuỗi literal, không dùng regex.
    - **`replaceAll`**: Thay thế dựa trên regex.
    - **`PatternSyntaxException`**: Khi regex sai cú pháp (ví dụ: ngoặc không đóng).
    - **Ví dụ**:
      ```java
      String s = "a.b";
      s.replace(".", "x"); // axb
      s.replaceAll(".", "x"); // xxx
      s.replaceAll("[", "x"); // PatternSyntaxException
      ```

### 4. Cắt/chia: `substring`, `split` (regex) và bẫy khi ký tự đặc biệt.
- **Trả lời**:
    - **`substring`**: Cắt chuỗi con theo chỉ số.
    - **`split`**: Tách chuỗi theo regex.
    - **Bẫy**: Ký tự đặc biệt trong regex (`.`, `*`) cần escape.
    - **Ví dụ**:
      ```java
      String s = "a.b.c";
      String[] parts = s.split("\\."); // [a, b, c]
      ```

### 5. **Text Blocks** (`"""…"""`): quy tắc escape/indent; khi nào nên dùng để xử lý JSON/SQL.
- **Trả lời**:
    - **Text Blocks** (Java 15+): Chuỗi nhiều dòng, giảm escape `\n`.
    - **Quy tắc**:
        - Bỏ khoảng trắng đầu dòng (dựa trên dòng ít thụt nhất).
        - Escape `\` khi cần giữ ký tự đặc biệt.
    - **Use-case**: JSON, SQL, HTML.
    - **Ví dụ**:
      ```java
      String json = """
          {
              "name": "John"
          }
          """;
      ```

---

## 9) Unicode, `char` và code points

### 1. `char` trong Java là 16-bit UTF-16 code unit — hệ quả với emoji/surrogate pairs.
- **Trả lời**:
    - **`char`**: 16-bit, biểu diễn UTF-16 code unit, không đủ cho emoji (code point > U+FFFF, cần surrogate pair).
    - **Hệ quả**: Emoji cần 2 `char` (high/low surrogate), xử lý sai có thể cắt vỡ.
    - **Ví dụ**:
      ```java
      String s = "😊"; // 2 chars (surrogate pair)
      ```

### 2. ⚠️ Gài: `s.length()` đo **code units** hay **code points**? Tính số ký tự “mắt người thấy” thế nào?
- **Trả lời**:
    - **`s.length()`**: Đo số **code units** (16-bit `char`).
    - **Tính code points**: Dùng `s.codePointCount(0, s.length())`.
    - **Ví dụ**:
      ```java
      String s = "😊";
      s.length(); // 2 (code units)
      s.codePointCount(0, s.length()); // 1 (code point)
      ```

### 3. Xử lý code point: `codePointAt`, `codePoints`, `Character.isSurrogate`, `offsetByCodePoints`.
- **Trả lời**:
    - **`codePointAt`**: Lấy code point tại chỉ số.
    - **`codePoints`**: Stream các code point.
    - **`Character.isSurrogate`**: Kiểm tra surrogate pair.
    - **`offsetByCodePoints`**: Di chuyển chỉ số theo code point.
    - **Ví dụ**:
      ```java
      String s = "😊";
      int cp = s.codePointAt(0); // U+1F60A
      ```

### 4. Chuẩn hoá Unicode (NFC/NFD) và tác động tới so sánh/so khớp.
- **Trả lời**:
    - **NFC**: Gộp ký tự thành dạng ngắn nhất.
    - **NFD**: Phân tách ký tự thành các phần (base + combining mark).
    - **Tác động**: So sánh chuỗi cần chuẩn hóa trước để tránh khác biệt.
    - **Ví dụ**:
      ```java
      String s = Normalizer.normalize("é", Normalizer.Form.NFC);
      ```

### 5. So sánh theo văn hoá (collation): dùng `Collator` thay vì `String.compareTo` khi nào?
- **Trả lời**:
    - Dùng `Collator` khi cần so sánh chuỗi theo quy tắc ngôn ngữ (Locale-specific).
    - **`String.compareTo`**: So sánh dựa trên code point, không phù hợp đa ngôn ngữ.
    - **Ví dụ**:
      ```java
      Collator collator = Collator.getInstance(Locale.FRENCH);
      collator.compare("é", "e"); // Theo quy tắc tiếng Pháp
      ```

---

## 10) So sánh chuỗi & thứ tự sắp xếp

### 1. `String.compareTo` dựa trên gì? Ảnh hưởng tới sort “từ điển” đa ngôn ngữ.
- **Trả lời**:
    - **`compareTo`**: So sánh theo giá trị code point của `char` (Unicode).
    - **Ảnh hưởng**: Không phù hợp với quy tắc sắp xếp đa ngôn ngữ (ví dụ: tiếng Đức, Thổ Nhĩ Kỳ).
    - **Khắc phục**: Dùng `Collator`.

### 2. ⚠️ Gài: Vì sao `equalsIgnoreCase` có thể **không** tương đương chuẩn ở một số ngôn ngữ (tiếng Thổ Nhĩ Kỳ, ß của Đức)?
- **Trả lời**:
    - **`equalsIgnoreCase`**: Chuyển chữ hoa/thường theo Unicode, không theo `Locale`.
    - **Vấn đề**:
        - Tiếng Thổ Nhĩ Kỳ: `I` (chữ hoa) không tương ứng `i` mà là `ı`.
        - Tiếng Đức: `ß` không có chữ hoa chuẩn, gây lỗi so sánh.
    - **Khắc phục**: Dùng `Collator` hoặc chuẩn hóa với `Locale`.

### 3. Khi nào nên dùng `Collator` với `Locale` để sort/tìm kiếm an toàn i18n?
- **Trả lời**:
    - Khi cần sắp xếp/tìm kiếm theo quy tắc ngôn ngữ (ví dụ: tiếng Pháp, Đức).
    - **Ví dụ**:
      ```java
      Collator collator = Collator.getInstance(Locale.GERMANY);
      collator.setStrength(Collator.PRIMARY); // Bỏ qua hoa/thường
      ```

---

## 11) Quét & phân tách văn bản

### 1. `Scanner` so với `String.split`/regex: ưu/nhược, khi nào chọn `Scanner`.
- **Trả lời**:
    - **`Scanner`**:
        - **Ưu**: Xử lý stream, hỗ trợ nhiều kiểu dữ liệu, tiện cho file/input lớn.
        - **Nhược**: Chậm hơn regex cho chuỗi nhỏ.
    - **`String.split`/regex**:
        - **Ưu**: Nhanh, linh hoạt với pattern phức tạp.
        - **Nhược**: Load toàn bộ chuỗi vào RAM.
    - **Chọn `Scanner`**: Khi đọc file/stream lớn, cần parse từng token.

### 2. ⚠️ Gài: `StringTokenizer` có còn nên dùng không? Khác gì với `split` về khoảng trắng/regex.
- **Trả lời**:
    - **Không nên dùng**: `StringTokenizer` bị deprecated, thiếu linh hoạt.
    - **Khác biệt**:
        - `StringTokenizer`: Chỉ tách bởi delimiter cố định, không hỗ trợ regex.
        - `split`: Hỗ trợ regex, mạnh hơn.
    - **Ví dụ**:
      ```java
      String s = "a,,b";
      String[] parts = s.split(","); // [a, "", b]
      ```

### 3. Tách token lớn (logfile): kỹ thuật stream dòng và tránh load cả file vào RAM.
- **Trả lời**:
    - Dùng `BufferedReader` + `lines()` hoặc `Scanner` để đọc từng dòng.
    - **Ví dụ**:
      ```java
      try (BufferedReader br = Files.newBufferedReader(Path.of("log.txt"))) {
          br.lines().flatMap(line -> Arrays.stream(line.split("\\s+"))).forEach(System.out::println);
      }
      ```

---

## 12) Bảo mật & xử lý dữ liệu nhạy cảm

### 1. Vì sao **không** nên giữ mật khẩu dưới dạng `String`? Dùng `char[]` hay `java.security` API nào?
- **Trả lời**:
    - **Không dùng `String`**:
        - Immutable, không xóa được khỏi bộ nhớ cho đến khi GC chạy.
        - Có thể lộ trong string pool.
    - **Dùng `char[]`**:
        - Có thể xóa nội dung (`Arrays.fill(arr, '\0')`).
    - **API**: `java.security.SecureRandom`, `PBEKeySpec` cho mật khẩu.
    - **Ví dụ**:
      ```java
      char[] password = "secret".toCharArray();
      Arrays.fill(password, '\0'); // Xóa
      ```

### 2. ⚠️ Gài: Log dữ liệu nhạy cảm với `toString()` có rủi ro gì? Chính sách mask dữ liệu nên áp dụng ở đâu?
- **Trả lời**:
    - **Rủi ro**: `toString()` có thể lộ mật khẩu, token trong log.
    - **Chính sách mask**:
        - Override `toString()` để ẩn dữ liệu nhạy cảm.
        - Áp dụng ở tầng service hoặc logging framework.
    - **Ví dụ**:
      ```java
      record User(String name, String password) {
          @Override
          public String toString() { return "User[name=" + name + "]"; }
      }
      ```

### 3. Làm sạch/băm/salt chuỗi trước khi lưu — best practices cơ bản.
- **Trả lời**:
    - **Làm sạch**: Trim, chuẩn hóa Unicode, kiểm tra hợp lệ.
    - **Băm**: Dùng `MessageDigest` (SHA-256) với salt từ `SecureRandom`.
    - **Ví dụ**:
      ```java
      byte[] salt = new byte[16];
      SecureRandom.getInstanceStrong().nextBytes(salt);
      MessageDigest md = MessageDigest.getInstance("SHA-256");
      md.update(salt);
      byte[] hash = md.digest("password".getBytes());
      ```

---

## 13) Ngẫu nhiên & chuỗi

### 1. `Random` vs `SecureRandom`: khác nhau, khi nào bắt buộc dùng `SecureRandom` (token, OTP).
- **Trả lời**:
    - **`Random`**: Dùng thuật toán pseudo-random, nhanh nhưng có thể dự đoán.
    - **`SecureRandom`**: Dùng nguồn entropy an toàn (OS/hardware), chậm hơn.
    - **Bắt buộc `SecureRandom`**: Token, OTP, key mã hóa.
    - **Ví dụ**:
      ```java
      SecureRandom sr = SecureRandom.getInstanceStrong();
      int otp = sr.nextInt(1000000);
      ```

### 2. Tạo chuỗi ngẫu nhiên an toàn (bảng ký tự, bias khi dùng modulo).
- **Trả lời**:
    - Dùng `SecureRandom` với bảng ký tự (base62: a-z, A-Z, 0-9).
    - **Tránh bias**: Không dùng modulo, dùng `nextInt(alphabet.length())`.
    - **Ví dụ**:
      ```java
      String alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      SecureRandom sr = new SecureRandom();
      StringBuilder sb = new StringBuilder(10);
      for (int i = 0; i < 10; i++) {
          sb.append(alphabet.charAt(sr.nextInt(alphabet.length())));
      }
      ```

### 3. ⚠️ Gài: `Math.random()` dựa trên gì? Có dùng cho bảo mật được không?
- **Trả lời**:
    - **`Math.random()`**: Dựa trên `Random`, dùng thuật toán pseudo-random.
    - **Không dùng cho bảo mật**: Có thể dự đoán, không đủ entropy.
    - **Khắc phục**: Dùng `SecureRandom`.

---

## 14) Hiệu năng & bộ nhớ

### 1. Ảnh hưởng của tạo nhiều `String` tạm thời; kỹ thuật giảm churn (builder, pooling, `String.concat` trong JDK mới).
- **Trả lời**:
    - **Ảnh hưởng**: Tạo nhiều `String` tạm thời tăng áp lực GC, tốn CPU.
    - **Kỹ thuật giảm**:
        - Dùng `StringBuilder` trong vòng lặp.
        - Dùng `String.concat` (JDK 9+) cho ghép chuỗi ngắn.
        - Tái sử dụng `StringBuilder`.

### 2. Kiểm thử microbenchmark đúng cách cho thao tác số/chuỗi (JMH): warm-up, dead-code elimination.
- **Trả lời**:
    - **JMH (Java Microbenchmark Harness)**:
        - **Warm-up**: Chạy nhiều lần để JIT tối ưu.
        - **Dead-code elimination**: Tránh code không dùng (dùng `@Benchmark`, trả kết quả).
    - **Ví dụ**:
      ```java
      @Benchmark
      public String test() {
          StringBuilder sb = new StringBuilder();
          for (int i = 0; i < 1000; i++) sb.append(i);
          return sb.toString();
      }
      ```

### 3. ⚠️ Gài: Vì sao so sánh `String` bằng `==` đôi khi “có vẻ chạy đúng” trong dev nhưng sai trên prod?
- **Trả lời**:
    - **Lý do**:
        - Trong dev, chuỗi literal thường dùng string pool, `==` đúng “tình cờ”.
        - Trong prod, chuỗi động (từ input, DB) không pool, `==` sai.
    - **Khắc phục**: Luôn dùng `equals()`.

---

## 15) Mini case (thực chiến 2–5 phút/câu)

### 1. Định dạng tiền tệ cho nhiều quốc gia (VN, US, DE): trình bày cách dùng `NumberFormat` + `Locale`, xử lý đầu vào `"1.234,56"`.
- **Trả lời**:
  ```java
  import java.text.NumberFormat;
  import java.util.Locale;

  NumberFormat vn = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
  NumberFormat us = NumberFormat.getCurrencyInstance(Locale.US);
  NumberFormat de = NumberFormat.getCurrencyInstance(Locale.GERMANY);
  double amount = 1234.56;
  System.out.println(vn.format(amount)); // 1.234,56 ₫
  System.out.println(us.format(amount)); // $1,234.56
  System.out.println(de.format(amount)); // 1.234,56 €

  NumberFormat parser = NumberFormat.getInstance(Locale.GERMANY);
  Number parsed = parser.parse("1.234,56"); // 1234.56
  ```

### 2. Tính lãi kép chính xác theo tháng trong 10 năm: chọn kiểu số, **rounding**, in bảng kết quả đẹp bằng `String.format`.
- **Trả lời**:
  ```java
  import java.math.BigDecimal;
  import java.math.RoundingMode;

  BigDecimal principal = BigDecimal.valueOf(1000);
  BigDecimal rate = BigDecimal.valueOf(0.05).divide(BigDecimal.valueOf(12), 10, RoundingMode.HALF_UP); // Lãi tháng
  int months = 120;
  BigDecimal result = principal;
  System.out.printf("%-10s %-15s%n", "Month", "Balance");
  for (int i = 1; i <= months; i++) {
      result = result.multiply(BigDecimal.ONE.add(rate));
      System.out.printf("%-10d %-15.2f%n", i, result.setScale(2, RoundingMode.HALF_UP));
  }
  ```

### 3. Làm sạch và chuẩn hoá email/username: trim, lowercase (i18n-safe), chuẩn hoá Unicode để so sánh chính xác.
- **Trả lời**:
  ```java
  import java.text.Normalizer;

  String normalizeEmail(String email) {
      if (email == null) return null;
      String normalized = Normalizer.normalize(email.trim().toLowerCase(Locale.ROOT), Normalizer.Form.NFC);
      if (!normalized.matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")) {
          throw new IllegalArgumentException("Invalid email");
      }
      return normalized;
  }
  ```

### 4. Tạo `orderId` an toàn: dùng `SecureRandom` sinh chuỗi base62 dài N, chứng minh không bias.
- **Trả lời**:
  ```java
  import java.security.SecureRandom;

  String generateOrderId(int length) {
      String alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      SecureRandom sr = new SecureRandom();
      StringBuilder sb = new StringBuilder(length);
      for (int i = 0; i < length; i++) {
          sb.append(alphabet.charAt(sr.nextInt(alphabet.length()))); // Không bias
      }
      return sb.toString();
  }
  ```

### 5. Xử lý text có emoji: đếm số “ký tự người dùng thấy” và cắt chuỗi không làm vỡ surrogate pair.
- **Trả lời**:
  ```java
  String s = "Hello😊World";
  int count = s.codePointCount(0, s.length()); // 10 (1 cho 😊)
  String safeSubstring = s.substring(0, s.offsetByCodePoints(0, 5)); // Hello
  ```

### 6. Chuyển toàn bộ pipeline tính **thuế VAT** từ `double` sang `BigDecimal`: nêu các điểm cần đổi (khởi tạo, scale, rounding, so sánh).
- **Trả lời**:
    - **Khởi tạo**: Dùng `BigDecimal.valueOf()` thay vì `new BigDecimal(double)`.
    - **Scale**: Đặt scale rõ ràng (ví dụ: 2 cho tiền tệ).
    - **Rounding**: Dùng `setScale(2, RoundingMode.HALF_UP)`.
    - **So sánh**: Dùng `compareTo()` thay vì `equals()` nếu bỏ qua scale.
    - **Ví dụ**:
      ```java
      BigDecimal price = BigDecimal.valueOf(100.0);
      BigDecimal vatRate = BigDecimal.valueOf(0.1);
      BigDecimal vat = price.multiply(vatRate).setScale(2, RoundingMode.HALF_UP); // 10.00
      ```

---

