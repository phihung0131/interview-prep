## 1) Biến, kiểu và định danh (Identifiers & Variables)

### 1. Quy tắc đặt **identifier** hợp lệ trong Java.
- **Trả lời**:
    - Bắt đầu bằng **chữ cái Unicode**, **dấu gạch dưới** (`_`), hoặc **dấu đô la** (`$`).
    - Các ký tự tiếp theo: chữ cái Unicode, số, `_`, `$`.
    - **Không được**: Bắt đầu bằng số, chứa ký tự đặc biệt (ngoại trừ `_`, `$`), hoặc là từ khóa Java (`int`, `class`, v.v.).
    - Ví dụ hợp lệ: `myVar`, `_count`, `$price`, `πValue` (Unicode).
    - Ví dụ không hợp lệ: `2var`, `my-var`, `int`.

### 2. Phân biệt **primitive type** và **reference type**; bộ nhớ lưu ở đâu (stack/heap) theo nghĩa logic?
- **Trả lời**:
    - **Primitive type**: Kiểu dữ liệu cơ bản (`int`, `double`, `boolean`, v.v.), lưu **giá trị trực tiếp** trên **stack**.
    - **Reference type**: Đối tượng (`String`, `ArrayList`, v.v.), lưu **tham chiếu** trên **stack**, đối tượng thực tế trên **heap**.
    - **Lưu ý**: Biến local là primitive lưu trên stack; field của object hoặc array lưu trên heap.

### 3. Vòng đời và **phạm vi** (scope) của biến: local, parameter, field, block.
- **Trả lời**:
    - **Local variable**: Khai báo trong method/block, phạm vi trong block, vòng đời đến khi block kết thúc.
    - **Parameter**: Biến truyền vào method, phạm vi trong method, vòng đời trong lần gọi method.
    - **Field**: Biến của class (instance/static), phạm vi phụ thuộc access modifier, vòng đời theo instance (instance field) hoặc class (static field).
    - **Block variable**: Khai báo trong `{}` (ví dụ: trong `for`), phạm vi chỉ trong block.

### 4. **Default value** cho field vs biến local: khi nào có/không có?
- **Trả lời**:
    - **Field**: Tự động được gán giá trị mặc định nếu không khởi tạo (`int` → `0`, `boolean` → `false`, reference → `null`).
    - **Local variable**: **Không có giá trị mặc định**, phải khởi tạo trước khi dùng, nếu không sẽ lỗi biên dịch.

### 5. `final` áp dụng cho biến có ý nghĩa gì? ⚠️ Gài: `final` với **biến tham chiếu** có làm object bất biến không?
- **Trả lời**:
    - **`final` trên biến**: Ngăn gán lại giá trị mới sau khi khởi tạo (constant variable).
    - **⚠️ Gài**: `final` trên biến tham chiếu chỉ ngăn thay đổi **tham chiếu**, không ngăn thay đổi trạng thái của **đối tượng**.
    - **Ví dụ phản chứng**:
      ```java
      final List<String> list = new ArrayList<>();
      list.add("Hello"); // Hợp lệ, trạng thái thay đổi
      list = new ArrayList<>(); // Lỗi biên dịch
      ```
    - Để bất biến, cần dùng `Collections.unmodifiableList()` hoặc thiết kế lớp bất biến.

### 6. Shadowing và hiding biến — ví dụ gây nhầm lẫn cần tránh.
- **Trả lời**:
    - **Shadowing**: Biến local/parameter che khuất field cùng tên trong cùng class.
    - **Hiding**: Field trong lớp con che khuất field cùng tên trong lớp cha.
    - **Ví dụ nhầm lẫn**:
      ```java
      class Test {
          int x = 10;
          void method(int x) { // Shadowing
              System.out.println(x); // In tham số x, không phải field
          }
      }
      ```
    - **Tránh nhầm lẫn**: Dùng `this.x` để truy cập field, đặt tên biến khác nhau.

### 7. Khác nhau giữa **constant** (`public static final`) và biến thường; quy ước đặt tên.
- **Trả lời**:
    - **Constant**: `public static final`, không thể thay đổi giá trị, thường là hằng số toàn cục. Quy ước: **VIẾT_HOA_CÓ_DẤU_GẠCH_DƯỚI**.
    - **Biến thường**: Có thể thay đổi, phạm vi và vòng đời phụ thuộc vào khai báo.
    - **Ví dụ**:
      ```java
      public static final int MAX_SIZE = 100; // Constant
      int size = 10; // Biến thường
      ```

---

## 2) Kiểu nguyên thủy & literal

### 1. Liệt kê 8 **primitive types** và kích thước/miền giá trị.
- **Trả lời**:
    - `byte`: 8-bit, -128 → 127.
    - `short`: 16-bit, -32,768 → 32,767.
    - `int`: 32-bit, -2^31 → 2^31-1 (~ -2.1 tỷ → 2.1 tỷ).
    - `long`: 64-bit, -2^63 → 2^63-1.
    - `float`: 32-bit, ±1.4E-45 → ±3.4E38, độ chính xác ~7 chữ số.
    - `double`: 64-bit, ±4.9E-324 → ±1.8E308, độ chính xác ~16 chữ số.
    - `char`: 16-bit, Unicode '\u0000' → '\uFFFF' (0 → 65,535).
    - `boolean`: Không xác định kích thước rõ ràng, giá trị `true`/`false`.

### 2. Literal số: thập phân, nhị phân (`0b`), bát phân (`0`), hexa (`0x`), dấu gạch dưới `_` trong literal.
- **Trả lời**:
    - **Thập phân**: `123`, `123.45` (cho `int`, `double`).
    - **Nhị phân**: `0b1010` (từ Java 7).
    - **Bát phân**: `0123` (bắt đầu bằng 0).
    - **Hexa**: `0x7B` (bắt đầu bằng `0x`).
    - **Dấu gạch dưới** (`_`): Dùng để phân tách cho dễ đọc (từ Java 7), ví dụ: `1_000_000`.
    - **Lưu ý**: `_` không được đứng đầu/cuối literal.

### 3. Literal char và chuỗi escape (`\n`, `\uXXXX`); Unicode trong Java là gì?
- **Trả lời**:
    - **Literal char**: `'a'`, `'\n'` (escape), `'\u0041'` (Unicode).
    - **Chuỗi escape**: `\n` (xuống dòng), `\t` (tab), `\\` (dấu gạch chéo), `\uXXXX` (Unicode 4 chữ số hexa).
    - **Unicode trong Java**: `char` dùng UTF-16, mỗi ký tự là 16-bit, hỗ trợ mã Unicode từ `\u0000` đến `\uFFFF`.

### 4. **Floating-point**: `float` vs `double`, **NaN**, **Infinity**, `-0.0`. Ảnh hưởng so sánh bằng `==`.
- **Trả lời**:
    - **`float`**: 32-bit, độ chính xác thấp hơn, cần hậu tố `f` (`1.23f`).
    - **`double`**: 64-bit, độ chính xác cao hơn, mặc định cho literal (`1.23`).
    - **`NaN`**: Không phải số, `Double.NaN != Double.NaN` khi dùng `==` (dùng `Double.isNaN()` để kiểm tra).
    - **`Infinity`**: `Double.POSITIVE_INFINITY`, `Double.NEGATIVE_INFINITY` (khi chia cho 0).
    - **`-0.0`**: Bằng `0.0` khi so `==`, nhưng khác trong tính toán (ví dụ: `1.0/-0.0` → `-Infinity`).

### 5. ⚠️ Gài: Vì sao `0.1 + 0.2 != 0.3` với `double`? Khi nào nên dùng `BigDecimal`.
- **Trả lời**:
    - **Lý do**: `double` dùng biểu diễn nhị phân (IEEE 754), không thể biểu diễn chính xác các số thập phân như `0.1`, `0.2` (gây sai số làm tròn). Kết quả `0.3` thực tế là `0.30000000000000004`.
    - **Khi dùng `BigDecimal`**:
        - Cần độ chính xác cao (tài chính, tiền tệ).
        - Tránh sai số làm tròn trong tính toán.
    - **Ví dụ**:
      ```java
      BigDecimal a = new BigDecimal("0.1");
      BigDecimal b = new BigDecimal("0.2");
      BigDecimal sum = a.add(b); // Kết quả: 0.3
      ```

### 6. Literal boolean, char; casting char ↔ int; ký tự ghép (surrogate pairs).
- **Trả lời**:
    - **Literal boolean**: `true`, `false`.
    - **Literal char**: `'a'`, `'\u0041'`.
    - **Casting char ↔ int**: `char` là 16-bit unsigned, có thể cast thành `int` (giá trị Unicode) và ngược lại.
      ```java
      char c = 'A'; int i = c; // i = 65
      char d = (char) 66; // d = 'B'
      ```
    - **Surrogate pairs**: Dùng để biểu diễn ký tự Unicode ngoài phạm vi 16-bit (U+10000 đến U+10FFFF), gồm 2 `char` (high/low surrogate).

---

## 3) Kiểu tham chiếu, `String` & text blocks

### 1. Tính **bất biến** (immutability) của `String` — lợi ích, rủi ro khi nối chuỗi trong vòng lặp.
- **Trả lời**:
    - **Bất biến**: `String` không thể thay đổi sau khi tạo, đảm bảo thread-safe và bảo mật.
    - **Lợi ích**: An toàn trong đa luồng, dùng làm key trong `HashMap`, tối ưu hóa bộ nhớ (string pool).
    - **Rủi ro nối chuỗi trong vòng lặp**: Tạo nhiều đối tượng `String` mới, gây tốn bộ nhớ và thời gian.
      ```java
      String s = "";
      for (int i = 0; i < 1000; i++) s += i; // Tạo 1000+ String
      ```

### 2. `StringBuilder`/`StringBuffer`: khác nhau, khi nào dùng.
- **Trả lời**:
    - **Khác nhau**:
        - `StringBuilder`: Không thread-safe, nhanh hơn, dùng trong single-thread.
        - `StringBuffer`: Thread-safe (synchronized), chậm hơn, dùng trong multi-thread.
    - **Khi dùng**:
        - `StringBuilder`: Khi nối chuỗi nhiều lần trong single-thread (ví dụ: xây dựng JSON).
        - `StringBuffer`: Khi cần thread-safety (hiếm gặp).

### 3. So sánh `==` vs `equals()` với `String` (interning).
- **Trả lời**:
    - **`==`**: So sánh tham chiếu, kiểm tra 2 `String` có cùng địa chỉ bộ nhớ.
    - **`equals()`**: So sánh nội dung chuỗi.
    - **Interning**: `String` literal và `String.intern()` lưu trong **string pool**, khiến `==` có thể trả `true` nếu cùng giá trị trong pool.
    - **Ví dụ**:
      ```java
      String a = "hello";
      String b = "hello"; // Cùng string pool
      String c = new String("hello");
      System.out.println(a == b); // true
      System.out.println(a == c); // false
      System.out.println(a.equals(c)); // true
      ```

### 4. **Text blocks** (`"""…"""`): quy tắc về khoảng trắng, indentation, escape.
- **Trả lời**:
    - **Text blocks** (Java 15+): Dùng `"""` để viết chuỗi đa dòng, giữ định dạng tự nhiên.
    - **Quy tắc**:
        - **Khoảng trắng**: Tự động loại bỏ indentation chung (dựa trên vị trí `"""` đóng).
        - **Escape**: Hỗ trợ `\n`, `\\`, không cần `\` cho dấu ngoặc kép trong block.
        - **Dấu cách cuối dòng**: Có thể bỏ bằng `\` hoặc `\s`.
    - **Ví dụ**:
      ```java
      String html = """
                    <html>
                      <body>Hello</body>
                    </html>
                    """; // Indentation tự động điều chỉnh
      ```

### 5. ⚠️ Gài: `new String("abc")` tạo mấy đối tượng? Khi nào dùng/không dùng?
- **Trả lời**:
    - **Số đối tượng**:
        - `"abc"` (literal) tạo 1 đối tượng trong **string pool**.
        - `new String("abc")` tạo thêm 1 đối tượng mới trên **heap**.
        - Tổng: 2 đối tượng.
    - **Khi dùng**: Hiếm khi, chỉ khi cần đối tượng `String` riêng biệt trên heap (ví dụ: kiểm soát bộ nhớ đặc biệt).
    - **Khi không dùng**: Tránh vì tốn bộ nhớ và không cần thiết; dùng literal `"abc"` là đủ.

---

## 4) Mảng (Arrays)

### 1. Khai báo, khởi tạo mảng một/đa chiều; độ dài cố định.
- **Trả lời**:
    - **Khai báo**: `int[] arr;` hoặc `int arr[];`.
    - **Khởi tạo**: `int[] arr = new int[5];` hoặc `int[] arr = {1, 2, 3};`.
    - **Mảng đa chiều**: `int[][] matrix = new int[3][4];` hoặc `int[][] jagged = {{1,2}, {3,4,5}};`.
    - **Độ dài cố định**: Mảng không thể thay đổi kích thước sau khi tạo.

### 2. **Array covariance**: vì sao `Number[] a = new Integer[10]` hợp lệ nhưng nguy hiểm?
- **Trả lời**:
    - **Array covariance**: Cho phép gán mảng subtype (`Integer[]`) cho mảng supertype (`Number[]`).
    - **Nguy hiểm**: Có thể gây `ArrayStoreException` nếu thêm kiểu không tương thích.
    - **Ví dụ**:
      ```java
      Number[] nums = new Integer[10];
      nums[0] = 1; // OK
      nums[1] = 2.5; // Lỗi runtime: ArrayStoreException
      ```

### 3. Truy cập ngoài biên: `ArrayIndexOutOfBoundsException`.
- **Trả lời**:
    - Xảy ra khi truy cập chỉ số ngoài phạm vi mảng (âm hoặc ≥ `array.length`).
    - **Ví dụ**:
      ```java
      int[] arr = new int[3];
      arr[3] = 5; // Lỗi: ArrayIndexOutOfBoundsException
      ```

### 4. `Arrays.equals()` vs `Arrays.deepEquals()`; `toString()` vs `deepToString()`.
- **Trả lời**:
    - **`Arrays.equals()`**: So sánh mảng 1 chiều, kiểm tra từng phần tử bằng `equals()`.
    - **`Arrays.deepEquals()`**: So sánh mảng đa chiều, đệ quy kiểm tra các mảng con.
    - **`Arrays.toString()`**: Chuyển mảng 1 chiều thành chuỗi (ví dụ: `[1, 2, 3]`).
    - **`Arrays.deepToString()`**: Chuyển mảng đa chiều thành chuỗi, hiển thị cấu trúc lồng nhau.

### 5. ⚠️ Gài: `Arrays.asList(array)` trả về list kiểu gì? Thêm/xóa được không?
- **Trả lời**:
    - **`Arrays.asList()`**: Trả về `List` được backed bởi mảng gốc, là instance của `Arrays.ArrayList` (không phải `java.util.ArrayList`).
    - **Thêm/xóa**: Không được, vì kích thước cố định (ném `UnsupportedOperationException`).
    - **Giải pháp**: Tạo `new ArrayList<>(Arrays.asList(array))` để có `List` có thể sửa đổi.
    - **Ví dụ**:
      ```java
      Integer[] arr = {1, 2, 3};
      List<Integer> list = Arrays.asList(arr);
      list.add(4); // Lỗi: UnsupportedOperationException
      ```

---

## 5) Toán tử & biểu thức

### 1. Thứ tự ưu tiên (precedence) và kết hợp (associativity) của toán tử.
- **Trả lời**:
    - **Thứ tự ưu tiên** (cao → thấp):
        - `*`, `/`, `%` > `+`, `-` > `<<`, `>>`, `>>>` > `<`, `>` > `==` > `&` > `^` > `|` > `&&` > `||` > `?:`.
    - **Kết hợp**:
        - Hầu hết toán tử (như `+`, `*`) là **left-to-right**.
        - Toán tử gán (`=`), ternary (`?:`), shift (`<<`, `>>`, `>>>`) là **right-to-left**.
    - **Ví dụ**: `a + b * c` → `b * c` trước, rồi `a +`.

### 2. **Short-circuit** trong `&&`/`||` và tác động phụ (side-effect).
- **Trả lời**:
    - **Short-circuit**:
        - `&&`: Nếu vế trái `false`, không đánh giá vế phải.
        - `||`: Nếu vế trái `true`, không đánh giá vế phải.
    - **Tác động phụ**: Tránh gọi phương thức có side-effect ở vế phải nếu short-circuit xảy ra.
    - **Ví dụ**:
      ```java
      int x = 0;
      if (false && ++x > 0) {} // x không tăng
      System.out.println(x); // In 0
      ```

### 3. Toán tử bit/shift: `& | ^ ~ << >> >>>` — khác biệt `>>` và `>>>` với số âm.
- **Trả lời**:
    - **Bitwise**: `&` (AND), `|` (OR), `^` (XOR), `~` (NOT).
    - **Shift**:
        - `<<`: Dịch trái, nhân với 2^n.
        - `>>`: Dịch phải có dấu, giữ bit dấu cho số âm.
        - `>>>`: Dịch phải không dấu, điền 0 vào bit cao nhất.
    - **Khác biệt `>>` vs `>>>`**:
      ```java
      int x = -8; // Binary: 11111111_11111111_11111111_11111000
      System.out.println(x >> 2);  // -2 (giữ bit dấu)
      System.out.println(x >>> 2); // 1073741822 (điền 0)
      ```

### 4. Toán tử ++/-- tiền tố vs hậu tố; thứ tự đánh giá biểu thức.
- **Trả lời**:
    - **`++x` (tiền tố)**: Tăng giá trị trước, trả về giá trị mới.
    - **`x++` (hậu tố)**: Trả về giá trị cũ, sau đó tăng.
    - **Ví dụ**:
      ```java
      int x = 5;
      System.out.println(++x); // In 6 (tăng trước)
      System.out.println(x++); // In 6 (trả về trước, tăng sau)
      System.out.println(x);   // In 7
      ```

### 5. ⚠️ Gài: Chuỗi + số: vì sao `"1" + 2 + 3` khác với `1 + 2 + "3"`?
- **Trả lời**:
    - Toán tử `+` với `String` chuyển tất cả thành chuỗi, xử lý từ trái sang phải.
    - **`"1" + 2 + 3`**: `"1" + 2` → `"12"`, rồi `"12" + 3` → `"123"`.
    - **`1 + 2 + "3"`**: `1 + 2` → `3`, rồi `3 + "3"` → `"33"`.
    - **Kết quả**: `"123"` vs `"33"`.

---

## 6) Chuyển kiểu & numeric promotions

### 1. **Widening** vs **narrowing** conversion; khi nào cần cast tường minh.
- **Trả lời**:
    - **Widening**: Chuyển từ kiểu nhỏ hơn sang lớn hơn (ví dụ: `int` → `long`), tự động, không mất dữ liệu.
    - **Narrowing**: Chuyển từ kiểu lớn hơn sang nhỏ hơn (ví dụ: `long` → `int`), cần **cast tường minh**, có thể mất dữ liệu.
    - **Ví dụ**:
      ```java
      int i = 10;
      long l = i; // Widening, tự động
      int j = (int) l; // Narrowing, cần cast
      ```

### 2. **Unary numeric promotion** và **binary numeric promotion** diễn ra khi nào?
- **Trả lời**:
    - **Unary numeric promotion**: Áp dụng cho toán tử đơn (`++`, `-`, `~`) với `byte`, `short`, `char`, chuyển thành `int`.
    - **Binary numeric promotion**: Áp dụng cho toán tử đôi (`+`, `*`, `<`, v.v.), chuyển `byte`, `short`, `char` thành `int`, hoặc nếu có `long`, `float`, `double`, thì chuyển thành kiểu lớn nhất.
    - **Ví dụ**:
      ```java
      byte b = 10;
      int result = b + b; // Binary promotion thành int
      ```

### 3. Tràn số (overflow) với `int`/`long`; phương thức `Math.addExact`/`multiplyExact`.
- **Trả lời**:
    - **Overflow**: Xảy ra khi kết quả vượt quá miền giá trị của `int` (`2^31-1`) hoặc `long` (`2^63-1`).
    - **`Math.addExact`/`multiplyExact`**: Ném `ArithmeticException` nếu tràn số, dùng để kiểm soát lỗi.
    - **Ví dụ**:
      ```java
      int x = Integer.MAX_VALUE;
      System.out.println(x + 1); // Overflow: -2147483648
      Math.addExact(x, 1); // Ném ArithmeticException
      ```

### 4. ⚠️ Gài: Cast `byte b = (byte)130;` ra giá trị gì? Vì sao.
- **Trả lời**:
    - `byte` có miền giá trị `-128` đến `127`. Khi cast `130` (vượt quá), lấy 8 bit thấp nhất của biểu diễn nhị phân.
    - `130` = `10000010` (8 bit), cast thành `byte` giữ nguyên → `-126` (do bit dấu).
    - **Kết quả**: `b = -126`.

### 5. Autoboxing/unboxing: khi nào xảy ra; rủi ro `NullPointerException` khi unbox.
- **Trả lời**:
    - **Autoboxing**: Chuyển primitive sang wrapper (ví dụ: `int` → `Integer`).
    - **Unboxing**: Chuyển wrapper sang primitive (ví dụ: `Integer` → `int`).
    - **Khi xảy ra**: Trong gán, toán tử, hoặc method call (ví dụ: `List<Integer>.add(5)`).
    - **Rủi ro `NullPointerException`**: Unboxing `null` wrapper.
      ```java
      Integer i = null;
      int j = i; // Ném NullPointerException
      ```

---

## 7) Điều khiển luồng (Control Flow)

### 1. `if/else`, `switch` cơ bản; `switch` với `String`, `enum`, `int`.
- **Trả lời**:
    - **`if/else`**: Điều kiện đơn giản, linh hoạt, dùng khi có ít nhánh.
    - **`switch`**: So sánh giá trị với các case, hỗ trợ `int`, `char`, `byte`, `short`, `String` (Java 7+), `enum`.
    - **Ví dụ**:
      ```java
      String day = "MONDAY";
      switch (day) {
          case "MONDAY": System.out.println("Work"); break;
          default: System.out.println("Rest");
      }
      ```

### 2. **Switch expressions** (mũi tên `->`, `yield`) — lợi ích so với switch cũ.
- **Trả lời**:
    - **Switch expressions** (Java 14+): Dùng `->` để trả giá trị, `yield` để trả về từ block.
    - **Lợi ích**:
        - Ngắn gọn, trả về giá trị trực tiếp.
        - Loại bỏ fall-through mặc định.
        - Hỗ trợ pattern matching (Java 17+).
    - **Ví dụ**:
      ```java
      int value = switch (day) {
          case "MONDAY" -> 1;
          default -> 0;
      };
      ```

### 3. Vòng lặp `for`, **enhanced-for**, `while`, `do-while`: khi nào chọn loại nào.
- **Trả lời**:
    - **`for`**: Biết số lần lặp (ví dụ: duyệt mảng với chỉ số).
    - **Enhanced-for**: Duyệt collection/mảng mà không cần chỉ số (ví dụ: `for (int x : arr)`).
    - **`while`**: Khi số lần lặp không biết trước, kiểm tra điều kiện trước.
    - **`do-while`**: Tương tự `while`, nhưng chạy ít nhất 1 lần.
    - **Lựa chọn**: Dùng enhanced-for cho đơn giản, `for` khi cần chỉ số, `do-while` khi cần chạy ít nhất 1 lần.

### 4. `break`, `continue`, **nhãn** (labeled break/continue).
- **Trả lời**:
    - **`break`**: Thoát vòng lặp/block switch.
    - **`continue`**: Bỏ qua lần lặp hiện tại, tiếp tục lần tiếp theo.
    - **Labeled break/continue**: Chỉ định vòng lặp cụ thể để thoát hoặc tiếp tục.
    - **Ví dụ**:
      ```java
      outer: for (int i = 0; i < 3; i++) {
          for (int j = 0; j < 3; j++) {
              if (j == 1) break outer; // Thoát cả 2 vòng
          }
      }
      ```

### 5. ⚠️ Gài: Fall-through trong `switch` kiểu cũ — khi nào xảy ra và cách tránh.
- **Trả lời**:
    - **Fall-through**: Xảy ra khi không có `break` trong case, thực hiện tất cả case tiếp theo.
    - **Cách tránh**:
        - Luôn thêm `break` hoặc `return`.
        - Dùng switch expression (`->`) để loại bỏ fall-through.
    - **Ví dụ**:
      ```java
      int x = 1;
      switch (x) {
          case 1: System.out.println("One"); // Fall-through
          case 2: System.out.println("Two"); break;
      } // In "One" và "Two"
      ```

---

## 8) Phương thức & tham số

### 1. **Pass-by-value** trong Java; tham chiếu object được “copy” như thế nào.
- **Trả lời**:
    - Java luôn **pass-by-value**: Giá trị của tham số (primitive hoặc tham chiếu) được copy.
    - Với **reference type**, copy tham chiếu, không phải đối tượng, nên thay đổi trạng thái đối tượng ảnh hưởng gốc.
    - **Ví dụ**:
      ```java
      void modify(List<String> list) { list.add("Hello"); }
      List<String> list = new ArrayList<>();
      modify(list);
      System.out.println(list); // In [Hello]
      ```

### 2. **Varargs** (`T...`) — ưu/nhược, mối quan hệ với mảng.
- **Trả lời**:
    - **Varargs**: Cho phép truyền số lượng tham số biến đổi, được xử lý như mảng (`T[]`).
    - **Ưu**: Linh hoạt, gọn code.
    - **Nhược**: Chỉ dùng ở tham số cuối, có thể gây nhầm lẫn nếu overload.
    - **Ví dụ**:
      ```java
      void print(int... nums) { System.out.println(Arrays.toString(nums)); }
      print(1, 2, 3); // In [1, 2, 3]
      ```

### 3.burgo

System: ### 3. Overloading: quy tắc phân giải (primitive vs boxed vs varargs).
- **Trả lời**:
    - **Quy tắc phân giải**:
        1. **Exact match**: Kiểu tham số khớp chính xác.
        2. **Widening primitive conversion**: `int` → `long`, v.v.
        3. **Boxing conversion**: `int` → `Integer`.
        4. **Varargs**: Ưu tiên thấp nhất.
    - **Ví dụ**:
      ```java
      void m(int x) { System.out.println("int"); }
      void m(Integer x) { System.out.println("Integer"); }
      void m(int... x) { System.out.println("varargs"); }
      m(5); // Gọi m(int)
      ```

### 4. ⚠️ Gài: Hai overload `foo(int)` và `foo(Integer)` — truyền `null` gọi cái nào?
- **Trả lời**:
    - Truyền `null` gọi `foo(Integer)` vì `null` là giá trị của reference type (`Integer`), không phải primitive (`int`).
    - **Ví dụ**:
      ```java
      void foo(int x) { System.out.println("int"); }
      void foo(Integer x) { System.out.println("Integer"); }
      foo(null); // In "Integer"
      ```

### 5. Tham số `final` và ý nghĩa thực tế.
- **Trả lời**:
    - **Tham số `final`**: Ngăn gán lại giá trị mới cho tham số trong method.
    - **Ý nghĩa**:
        - Tăng tính rõ ràng (bảo đảm tham số không bị thay đổi).
        - Hỗ trợ lambda capture (biến local/parameter phải là `final` hoặc effectively final).
    - **Ví dụ**:
      ```java
      void method(final int x) {
          // x = 5; // Lỗi biên dịch
      }
      ```

---

## 9) `var` & suy luận kiểu cục bộ

### 1. `var` dùng ở đâu hợp lệ (local variables, loop indices, try-with-resources).
- **Trả lời**:
    - **Hợp lệ**: Biến local, chỉ số vòng lặp (`for`), biến trong `try-with-resources`.
    - **Không hợp lệ**: Field, tham số method, kiểu trả về.
    - **Ví dụ**:
      ```java
      var x = 10; // int
      for (var i = 0; i < 5; i++) {} // int
      try (var br = new BufferedReader(...)) {} // BufferedReader
      ```

### 2. Lợi/hại của `var` với khả năng đọc hiểu code.
- **Trả lời**:
    - **Lợi**:
        - Ngắn gọn code, đặc biệt với kiểu phức tạp (`List<Map<String, Integer>>`).
        - Tăng tính linh hoạt khi đổi kiểu mà không cần sửa khai báo.
    - **Hại**:
        - Giảm khả năng đọc hiểu nếu kiểu không rõ ràng (ví dụ: `var x = getValue();`).
        - Dễ lạm dụng, làm code khó bảo trì.
    - **Khuyến nghị**: Dùng `var` khi kiểu dễ suy ra từ ngữ cảnh.

### 3. ⚠️ Gài: `var` không phải **dynamic typing** — giải thích vì sao.
- **Trả lời**:
    - **`var` không phải dynamic typing**: Kiểu của biến được xác định tại **compile-time** dựa trên giá trị gán, không thay đổi tại runtime.
    - **Dynamic typing**: Kiểu thay đổi tại runtime (như JavaScript).
    - **Ví dụ**:
      ```java
      var x = 10; // x là int, không thể gán x = "abc"
      ```

### 4. `var` trong lambda parameters (khi nào hợp lệ, annotations).
- **Trả lời**:
    - **Hợp lệ**: Từ Java 11, `var` dùng trong tham số lambda nếu có annotation hoặc kiểu rõ ràng.
    - **Ví dụ**:
      ```java
      (var x, @NonNull var y) -> x + y // OK
      (var x, var y) -> x + y // Lỗi nếu không suy ra được kiểu
      ```

---

## 10) `switch` nâng cao & pattern matching

### 1. **Pattern matching for `instanceof`**: cú pháp, phạm vi biến pattern.
- **Trả lời**:
    - **Cú pháp** (Java 16+): `if (obj instanceof String s) { ... }` tự động cast `obj` thành `s` (kiểu `String`).
    - **Phạm vi biến pattern**: Chỉ trong block của `if` (hoặc tương tự).
    - **Ví dụ**:
      ```java
      if (obj instanceof String s && s.length() > 0) {
          System.out.println(s); // s là String
      }
      ```

### 2. **Switch on enums/strings** vs **switch expressions** — so sánh rõ ràng.
- **Trả lời**:
    - **Switch on enums/strings**: `switch` truyền thống, dùng `break`, không trả giá trị.
    - **Switch expressions**: Dùng `->`, trả giá trị trực tiếp, loại bỏ fall-through, hỗ trợ pattern matching.
    - **Ví dụ**:
      ```java
      enum Day { MONDAY, SUNDAY }
      // Switch truyền thống
      switch (day) {
          case MONDAY: System.out.println("Work"); break;
      }
      // Switch expression
      String result = switch (day) {
          case MONDAY -> "Work";
          default -> "Rest";
      };
      ```

### 3. ⚠️ Gài: Biến pattern trong `instanceof` có còn hữu dụng ngoài block không?
- **Trả lời**:
    - **Không hữu dụng ngoài block**: Biến pattern chỉ tồn tại trong phạm vi block của `instanceof`.
    - **Ví dụ**:
      ```java
      if (obj instanceof String s) {
          System.out.println(s); // OK
      }
      System.out.println(s); // Lỗi biên dịch
      ```

---

## 11) Wrapper types, so sánh & số học chính xác

### 1. So sánh wrapper (`Integer`) bằng `==` vs `equals()`, **Integer cache**.
- **Trả lời**:
    - **`==`**: So sánh tham chiếu, chỉ đúng nếu cùng đối tượng.
    - **`equals()`**: So sánh giá trị.
    - **Integer cache**: Cache các giá trị `Integer` từ `-128` đến `127` (có thể cấu hình), nên `==` có thể đúng trong khoảng này.
    - **Ví dụ**:
      ```java
      Integer a = 127, b = 127;
      Integer c = 128, d = 128;
      System.out.println(a == b); // true (cache)
      System.out.println(c == d); // false (khác đối tượng)
      ```

### 2. `BigInteger`/`BigDecimal`: khi nào cần; scale, rounding mode.
- **Trả lời**:
    - **Khi cần**:
        - `BigInteger`: Số nguyên lớn (vượt `long`).
        - `BigDecimal`: Số thập phân chính xác (tài chính, khoa học).
    - **Scale**: Số chữ số thập phân trong `BigDecimal`.
    - **Rounding mode**: `RoundingMode.HALF_UP`, `CEILING`, v.v., dùng khi chia hoặc làm tròn.
    - **Ví dụ**:
      ```java
      BigDecimal bd = new BigDecimal("1.23456");
      bd = bd.setScale(2, RoundingMode.HALF_UP); // 1.23
      ```

### 3. ⚠️ Gài: `new Integer(128) == 128` cho kết quả gì? Vì sao.
- **Trả lời**:
    - **Kết quả**: `true`.
    - **Lý do**: `new Integer(128) == 128` unbox `Integer` thành `int`, so sánh giá trị `128 == 128`.
    - **Lưu ý**: Nếu so `new Integer(128) == new Integer(128)`, kết quả `false` vì khác đối tượng.

---

## 12) Ngoại lệ căn bản & TWR (try-with-resources)

### 1. Checked vs unchecked exceptions; khi nào dùng `throws` vs `try/catch`.
- **Trả lời**:
    - **Checked**: Kế thừa từ `Exception` (trừ `RuntimeException`), phải khai báo (`throws`) hoặc xử lý (`try/catch`).
    - **Unchecked**: Kế thừa từ `RuntimeException`, không bắt buộc xử lý.
    - **Khi dùng**:
        - `throws`: Chuyển trách nhiệm xử lý exception lên caller.
        - `try/catch`: Xử lý exception trong method hiện tại.

### 2. **Try-with-resources**: yêu cầu `AutoCloseable`; thứ tự đóng tài nguyên; suppressed exceptions.
- **Trả lời**:
    - **Yêu cầu**: Class phải implement `AutoCloseable` (có method `close()`).
    - **Thứ tự đóng**: Tài nguyên đóng theo thứ tự **ngược lại** khai báo.
    - **Suppressed exceptions**: Exception trong `close()` được thêm vào danh sách suppressed của exception chính.
    - **Ví dụ**:
      ```java
      try (BufferedReader br = new BufferedReader(...);
           PrintWriter pw = new PrintWriter(...)) {
          // Code
      } // br và pw tự động đóng, pw trước br
      ```

### 3. ⚠️ Gài: `finally` có luôn chạy không? Trường hợp nào **không** (System.exit, crash…).
- **Trả lời**:
    - **`finally`**: Thường chạy sau `try` hoặc `catch`, kể cả khi có `return`.
    - **Trường hợp không chạy**:
        - `System.exit(0)`: Kết thúc JVM ngay lập tức.
        - Crash JVM (ví dụ: `OutOfMemoryError`).
        - Mất điện hoặc lỗi phần cứng.

---

## 13) Package, import, `main` & entry point

### 1. Cú pháp `package`/`import`; `static import` dùng khi nào.
- **Trả lời**:
    - **`package`**: Định nghĩa namespace (`package com.example;`).
    - **`import`**: Nhập class (`import com.example.MyClass;`).
    - **`static import`**: Nhập static member, dùng để gọi trực tiếp (ví dụ: `import static java.lang.Math.PI;` → `System.out.println(PI);`).
    - **Khi dùng static import**: Khi cần truy cập static member thường xuyên, nhưng tránh lạm dụng để giữ rõ ràng.

### 2. Chữ ký hợp lệ của **`main`**; có thể overload `main` không; chạy được không.
- **Trả lời**:
    - **Chữ ký hợp lệ**: `public static void main(String[] args)`.
    - **Overload `main`**: Có thể, nhưng JVM chỉ gọi chữ ký chuẩn.
    - **Chạy được không**: Chỉ chữ ký chuẩn được chạy như entry point.
    - **Ví dụ**:
      ```java
      public static void main(String[] args) { System.out.println("Main"); }
      public static void main(int x) { System.out.println("Overloaded"); } // Không chạy
      ```

### 3. ⚠️ Gài: Hai class trùng tên khác package cùng import wildcard — cách tham chiếu lớp mong muốn.
- **Trả lời**:
    - **Vấn đề**: `import a.*; import b.*;` với `a.MyClass` và `b.MyClass` gây nhập nhằng.
    - **Giải pháp**: Dùng **fully qualified class name** (FQCN) hoặc import tường minh.
    - **Ví dụ**:
      ```java
      import a.MyClass;
      b.MyClass bClass = new b.MyClass(); // Dùng FQCN
      ```

---

## 14) Bình luận & Javadoc

### 1. Phân biệt `//`, `/* */`, `/** */`; khi nào dùng Javadoc.
- **Trả lời**:
    - **`//`**: Comment một dòng.
    - **`/* */`**: Comment nhiều dòng.
    - **`/** */`**: Javadoc, dùng để tạo tài liệu API.
    - **Khi dùng Javadoc**: Trên class, method, field để mô tả chức năng, tham số, giá trị trả về.

### 2. Thẻ Javadoc cơ bản: `@param`, `@return`, `@throws`, `@since`, `@deprecated`.
- **Trả lời**:
    - **`@param`**: Mô tả tham số method.
    - **`@return`**: Mô tả giá trị trả về.
    - **`@throws`**: Mô tả exception ném ra.
    - **`@since`**: Phiên bản bắt đầu hỗ trợ.
    - **`@deprecated`**: Đánh dấu thành phần không nên dùng.
    - **Ví dụ**:
      ```java
      /** @param x số nguyên
       *  @return bình phương của x
       *  @throws IllegalArgumentException nếu x âm
       */
      int square(int x) { ... }
      ```

### 3. ⚠️ Gài: Javadoc có phải là comment “bình thường” không? Ai tiêu thụ nội dung này.
- **Trả lời**:
    - **Không phải comment bình thường**: Javadoc (`/** */`) được xử lý bởi công cụ `javadoc` để tạo tài liệu HTML.
    - **Người tiêu thụ**:
        - Lập trình viên (qua tài liệu API).
        - Công cụ IDE (hiển thị tooltip).
        - Công cụ build (tạo tài liệu).

---

## 15) Mini case (thực chiến 2–5 phút/câu)

### 1. Viết hàm **parse** chuỗi “1,234,567.89” thành `BigDecimal` an toàn khu vực (locale-aware); liệt kê bẫy thường gặp.
- **Trả lời**:
  ```java
  import java.text.NumberFormat;
  import java.text.ParseException;
  import java.util.Locale;

  public BigDecimal parse(String number, Locale locale) throws ParseException {
      NumberFormat format = NumberFormat.getNumberInstance(locale);
      Number parsed = format.parse(number);
      return new BigDecimal(parsed.toString());
  }
  ```
    - **Bẫy thường gặp**:
        - Dấu phân cách thập phân/phần nghìn khác nhau (ví dụ: US dùng `.`, EU dùng `,`).
        - Chuỗi không hợp lệ (ví dụ: `"abc"`) gây `ParseException`.
        - Mất độ chính xác nếu dùng `Double.parseDouble`.

### 2. Tối ưu đoạn code nối chuỗi trong vòng lặp 1e6 lần: đề xuất thay thế và giải thích vì sao nhanh hơn.
- **Trả lời**:
    - **Code không tối ưu**:
      ```java
      String s = "";
      for (int i = 0; i < 1_000_000; i++) s += i;
      ```
    - **Tối ưu**:
      ```java
      StringBuilder sb = new StringBuilder();
      for (int i = 0; i < 1_000_000; i++) sb.append(i);
      String s = sb.toString();
      ```
    - **Lý do nhanh hơn**: `String` bất biến tạo mới đối tượng mỗi lần nối, O(n²) thời gian. `StringBuilder` khả biến, O(n) thời gian.

### 3. Dò lỗi biểu thức tính thuế: kết hợp `int`, `double`, `%`, và phép chia; xác định nơi promotion sai và sửa.
- **Trả lời**:
    - **Code lỗi**:
      ```java
      int price = 1000;
      double taxRate = 0.1;
      int tax = (int) (price * taxRate); // Lỗi: kết quả sai nếu price lớn
      int total = price + tax;
      ```
    - **Sửa**:
      ```java
      int price = 1000;
      double taxRate = 0.1;
      double tax = price * taxRate; // Giữ double để tránh mất độ chính xác
      int total = price + (int) Math.round(tax); // Làm tròn hợp lý
      ```
    - **Lỗi**: Ép kiểu `int` sớm gây mất độ chính xác thập phân.

### 4. Dùng **switch expression** để map mã trạng thái (`"NEW"`, `"PAID"`, `"CANCELLED"`) sang enum, có default an toàn.
- **Trả lời**:
  ```java
  enum Status { NEW, PAID, CANCELLED, UNKNOWN }

  Status mapStatus(String code) {
      return switch (code) {
          case "NEW" -> Status.NEW;
          case "PAID" -> Status.PAID;
          case "CANCELLED" -> Status.CANCELLED;
          default -> Status.UNKNOWN;
      };
  }
  ```

### 5. Viết phương thức `sum(int... nums)` xử lý `null` an toàn khi gọi với mảng rỗng hoặc `null`.
- **Trả lời**:
  ```java
  int sum(int... nums) {
      if (nums == null) return 0;
      int total = 0;
      for (int num : nums) total += num;
      return total;
  }
  ```
    - **An toàn**: Kiểm tra `null`, xử lý mảng rỗng trả về `0`.

