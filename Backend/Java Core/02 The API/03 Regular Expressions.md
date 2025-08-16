## 1) Khái niệm & Tổng quan

### 1. Regular Expression (Regex) là gì? Ưu điểm khi dùng Regex so với duyệt chuỗi thủ công.
- **Trả lời**:
    - **Regex**: Chuỗi ký tự định nghĩa mẫu tìm kiếm hoặc so khớp trong văn bản.
    - **Ưu điểm**:
        - Ngắn gọn, khai báo (một dòng thay nhiều vòng lặp).
        - Linh hoạt, mạnh mẽ cho tìm kiếm phức tạp.
        - Tái sử dụng, dễ bảo trì.
    - **Ví dụ**:
      ```java
      // Thủ công
      boolean isEmail = input.contains("@") && input.contains(".");
      // Regex
      boolean isEmail = input.matches(".*@.*\\..*");
      ```

### 2. ⚠️ Gài: Regex trong Java dùng **gói** nào (`java.util.regex`) và có hỗ trợ sẵn ở String API không?
- **Trả lời**:
    - **Gói**: `java.util.regex` (`Pattern`, `Matcher`).
    - **Hỗ trợ trong String API**: Có, các method như `matches()`, `split()`, `replaceAll()` dùng regex.
    - **Ví dụ**:
      ```java
      import java.util.regex.*;
      String s = "test";
      boolean matches = s.matches("\\w+"); // String API
      Pattern p = Pattern.compile("\\w+"); // java.util.regex
      ```

### 3. Các thành phần chính của Regex: literal, meta-character, quantifier, character class, group.
- **Trả lời**:
    - **Literal**: Ký tự thông thường (ví dụ: `abc`).
    - **Meta-character**: Ký tự đặc biệt (`.`, `*`, `+`, `?`).
    - **Quantifier**: Số lần lặp (`*`, `+`, `{n,m}`).
    - **Character class**: Tập hợp ký tự (`[abc]`, `[a-z]`).
    - **Group**: Phân nhóm (`(abc)`).
    - **Ví dụ**:
      ```java
      Pattern p = Pattern.compile("[a-z]+"); // a-z: class, +: quantifier
      ```

### 4. Sự khác nhau giữa **Pattern** và **Matcher** trong Java.
- **Trả lời**:
    - **`Pattern`**: Biên dịch regex thành đối tượng tái sử dụng.
    - **`Matcher`**: Áp dụng `Pattern` lên chuỗi, thực hiện tìm kiếm/so khớp.
    - **Ví dụ**:
      ```java
      Pattern p = Pattern.compile("\\d+");
      Matcher m = p.matcher("123 abc");
      ```

### 5. Regex trong Java mặc định **case-sensitive** hay **case-insensitive**? Cách thay đổi.
- **Trả lời**:
    - **Mặc định**: Case-sensitive.
    - **Thay đổi**: Dùng flag `Pattern.CASE_INSENSITIVE` hoặc `(?i)` trong regex.
    - **Ví dụ**:
      ```java
      Pattern p = Pattern.compile("java", Pattern.CASE_INSENSITIVE);
      // Hoặc
      Pattern p = Pattern.compile("(?i)java");
      ```

### 6. ⚠️ Gài: Regex trong Java theo chuẩn nào (POSIX, Perl, …)? Có khác với regex trong JavaScript/Python không?
- **Trả lời**:
    - **Chuẩn**: Java dùng cú pháp tương tự Perl, không tuân theo POSIX chặt chẽ.
    - **Khác biệt**:
        - JavaScript: Hỗ trợ regex literal `/regex/`, thiếu một số tính năng như named group (trước ES2018).
        - Python: Tương tự Perl, nhưng cú pháp lookbehind khác.
        - Java: Hỗ trợ named group, lookbehind có giới hạn độ dài.
    - **Ví dụ**:
      ```java
      Pattern p = Pattern.compile("(?<name>\\w+)"); // Named group, không hỗ trợ trong JS cũ
      ```

---

## 2) Pattern & Matcher API

### 1. `Pattern.compile()` — các tham số flag (`CASE_INSENSITIVE`, `MULTILINE`, `DOTALL`, `UNICODE_CASE`, `COMMENTS`).
- **Trả lời**:
    - **`CASE_INSENSITIVE`**: Không phân biệt hoa thường.
    - **`MULTILINE`**: `^`/`$` áp dụng cho mỗi dòng.
    - **`DOTALL`**: `.` khớp cả newline.
    - **`UNICODE_CASE`**: Hỗ trợ Unicode trong `CASE_INSENSITIVE`.
    - **`COMMENTS`**: Cho phép chú thích trong regex.
    - **Ví dụ**:
      ```java
      Pattern p = Pattern.compile("^abc", Pattern.MULTILINE | Pattern.CASE_INSENSITIVE);
      ```

### 2. `Matcher` cung cấp những method nào để tìm và thao tác chuỗi? (find, matches, lookingAt, group, start, end)
- **Trả lời**:
    - **`find()`**: Tìm mẫu tiếp theo trong chuỗi.
    - **`matches()`**: So khớp toàn bộ chuỗi.
    - **`lookingAt()`**: So khớp từ đầu chuỗi.
    - **`group()`**: Lấy nhóm khớp.
    - **`start()`/`end()`**: Vị trí bắt đầu/kết thúc của khớp.
    - **Ví dụ**:
      ```java
      Matcher m = Pattern.compile("\\d+").matcher("123 abc");
      while (m.find()) {
          System.out.println(m.group() + " at " + m.start());
      }
      ```

### 3. ⚠️ Gài: Khác nhau giữa `matches()` và `find()` trong Matcher.
- **Trả lời**:
    - **`matches()`**: Kiểm tra toàn bộ chuỗi khớp regex, trả `true`/`false`.
    - **`find()`**: Tìm đoạn con khớp regex, di chuyển con trỏ.
    - **Ví dụ**:
      ```java
      Matcher m = Pattern.compile("\\d+").matcher("123 abc");
      m.matches(); // false (không khớp toàn chuỗi)
      m.find(); // true (tìm "123")
      ```

### 4. Dùng `group()` như thế nào để lấy sub-match?
- **Trả lời**:
    - **Cách dùng**: `group(n)` lấy nhóm thứ `n`, `group(0)` là toàn bộ khớp.
    - **Ví dụ**:
      ```java
      Matcher m = Pattern.compile("(\\d+)-(\\w+)").matcher("123-abc");
      if (m.find()) {
          System.out.println(m.group(1)); // "123"
          System.out.println(m.group(2)); // "abc"
      }
      ```

### 5. `Pattern.matches(regex, input)` khác gì với `Pattern.compile(regex).matcher(input).matches()` về hiệu năng.
- **Trả lời**:
    - **`Pattern.matches()`**: Biên dịch regex mỗi lần, tốn hiệu năng nếu lặp lại.
    - **`Pattern.compile()`**: Biên dịch một lần, tái sử dụng `Pattern`, nhanh hơn.
    - **Ví dụ**:
      ```java
      // Chậm
      Pattern.matches("\\d+", "123");
      // Nhanh
      Pattern p = Pattern.compile("\\d+");
      p.matcher("123").matches();
      ```

### 6. Cách reset Matcher để tái sử dụng.
- **Trả lời**:
    - **Cách reset**: Gọi `m.reset()` hoặc `m.reset(newInput)` để đặt lại con trỏ hoặc đổi chuỗi.
    - **Ví dụ**:
      ```java
      Matcher m = Pattern.compile("\\d+").matcher("123");
      m.find(); // "123"
      m.reset("456");
      m.find(); // "456"
      ```

### 7. Dùng `replaceAll()` vs `replaceFirst()` với regex.
- **Trả lời**:
    - **`replaceAll()`**: Thay tất cả đoạn khớp regex.
    - **`replaceFirst()`**: Thay đoạn khớp đầu tiên.
    - **Ví dụ**:
      ```java
      String s = "a1b1c";
      s = s.replaceAll("\\d", "X"); // "aXbXc"
      s = s.replaceFirst("\\d", "X"); // "aXb1c"
      ```

---

## 3) Cú pháp Regex cơ bản

### 1. Các ký tự đặc biệt (meta-character): `. ^ $ * + ? { } [ ] \ | ( )` — ý nghĩa từng ký tự.
- **Trả lời**:
    - **`.`**: Khớp bất kỳ ký tự nào (trừ newline, trừ khi có `DOTALL`).
    - **`^`**: Đầu chuỗi/dòng (`MULTILINE`).
    - **`$`**: Cuối chuỗi/dòng (`MULTILINE`).
    - **`*`**, **`+`**, **`?`**: Lặp 0-n, 1-n, 0-1 lần.
    - **`{n}`**, **`{n,}`**, **`{n,m}`**: Lặp n lần, ≥n lần, n-m lần.
    - **`[]`**: Character class.
    - **`|`**: Hoặc.
    - **`()`**: Nhóm.
    - **`\\`**: Thoát ký tự đặc biệt.
    - **Ví dụ**:
      ```java
      Pattern p = Pattern.compile("\\d+"); // Số, lặp ≥1
      ```

### 2. Character classes: `[abc]`, `[^abc]`, `[a-zA-Z]`, `\d`, `\D`, `\w`, `\W`, `\s`, `\S`.
- **Trả lời**:
    - **`[abc]`**: Khớp a, b, hoặc c.
    - **`[^abc]`**: Không phải a, b, c.
    - **`[a-zA-Z]`**: Chữ cái.
    - **`\d`**: Số (`[0-9]`).
    - **`\D`**: Không phải số.
    - **`\w`**: Chữ, số, `_` (`[a-zA-Z0-9_]`).
    - **`\W`**: Không phải `\w`.
    - **`\s`**: Khoảng trắng.
    - **`\S`**: Không phải khoảng trắng.
    - **Ví dụ**:
      ```java
      Pattern p = Pattern.compile("[a-z]+"); // Chữ thường
      ```

### 3. Quantifiers: `*`, `+`, `?`, `{n}`, `{n,}`, `{n,m}` — greedy, reluctant (`*?`) và possessive (`*+`).
- **Trả lời**:
    - **Greedy**: Lấy nhiều ký tự nhất có thể (`*`, `+`, `{n,m}`).
    - **Reluctant**: Lấy ít nhất có thể (`*?`, `+?`).
    - **Possessive**: Lấy nhiều nhất, không backtrack (`*+`, `++`).
    - **Ví dụ**:
      ```java
      String s = "aaa";
      Pattern.compile("a*").matcher(s).find(); // Greedy: "aaa"
      Pattern.compile("a*?").matcher(s).find(); // Reluctant: ""
      ```

### 4. ⚠️ Gài: Sự khác nhau giữa greedy, reluctant và possessive quantifier về backtracking.
- **Trả lời**:
    - **Greedy**: Lấy tối đa, backtrack nếu không khớp.
    - **Reluctant**: Lấy tối thiểu, backtrack để thử thêm.
    - **Possessive**: Lấy tối đa, không backtrack.
    - **Ví dụ**:
      ```java
      String s = "<a><b>";
      Pattern.compile("<.*>").matcher(s).find(); // Greedy: "<a><b>"
      Pattern.compile("<.*?>").matcher(s).find(); // Reluctant: "<a>"
      Pattern.compile("<.*+>").matcher(s).find(); // Possessive: "<a><b>", không backtrack
      ```

### 5. Anchors: `^` (start), `$` (end), `\b` (word boundary), `\B` (non-boundary).
- **Trả lời**:
    - **`^`**: Đầu chuỗi/dòng (`MULTILINE`).
    - **`$`**: Cuối chuỗi/dòng (`MULTILINE`).
    - **`\b`**: Ranh giới từ (giữa `\w` và `\W`).
    - **`\B`**: Không phải ranh giới từ.
    - **Ví dụ**:
      ```java
      Pattern.compile("\\bword\\b").matcher("word in text").find(); // Khớp "word"
      ```

### 6. Alternation: `|` — ưu tiên đánh giá từ trái sang phải.
- **Trả lời**:
    - **`|`**: Chọn một trong các mẫu, đánh giá từ trái sang phải.
    - **Ví dụ**:
      ```java
      Pattern.compile("cat|category").matcher("category").find(); // Khớp "cat" trước
      ```

### 7. Escaping: khi nào cần `\\` trong Java string literal để biểu diễn `\` của regex.
- **Trả lời**:
    - **Cần `\\`**: Để biểu diễn `\` trong regex, vì Java string cần thoát `\`.
    - **Ví dụ**:
      ```java
      String regex = "\\."; // Regex: \. (khớp dấu chấm)
      Pattern.compile(regex).matcher("a.b").find(); // true
      ```

---

## 4) Grouping & Backreference

### 1. Capturing group `(…)` vs non-capturing group `(?:…)`.
- **Trả lời**:
    - **Capturing group**: Lưu trữ để truy xuất bằng `group(n)`.
    - **Non-capturing group**: Chỉ nhóm, không lưu trữ.
    - **Ví dụ**:
      ```java
      Matcher m = Pattern.compile("(\\w+)|(?:\\d+)").matcher("abc");
      m.find();
      System.out.println(m.group(1)); // "abc" (capturing)
      ```

### 2. ⚠️ Gài: Khi nào dùng non-capturing group để tối ưu hiệu năng?
- **Trả lời**:
    - **Dùng khi**: Chỉ cần nhóm để áp dụng quantifier, không cần truy xuất nhóm.
    - **Tối ưu**: Giảm bộ nhớ vì không lưu nhóm.
    - **Ví dụ**:
      ```java
      Pattern.compile("(?:\\d+)-(\\w+)").matcher("123-abc").find(); // Chỉ lưu "abc"
      ```

### 3. Backreference: `\1`, `\2` — cách hoạt động.
- **Trả lời**:
    - **Backreference**: Khớp lại chuỗi đã bắt bởi nhóm trước.
    - **Ví dụ**:
      ```java
      Matcher m = Pattern.compile("(\\w+)\\s+\\1").matcher("word word");
      m.find(); // true (khớp "word word")
      ```

### 4. Named capturing group `(?<name>…)` và cách lấy bằng tên trong Java 7+ (`Matcher.group("name")`).
- **Trả lời**:
  ```java
  Matcher m = Pattern.compile("(?<id>\\d+)-(?<name>\\w+)").matcher("123-abc");
  if (m.find()) {
      System.out.println(m.group("id")); // "123"
      System.out.println(m.group("name")); // "abc"
  }
  ```

### 5. Lookahead và lookbehind: `(?=…)`, `(?!…)`, `(?<=…)`, `(?<!…)` — khi nào cần, ưu/nhược điểm.
- **Trả lời**:
    - **Lookahead**:
        - `(?=...)`: Khớp nếu sau vị trí có mẫu.
        - `(?!...)`: Không khớp nếu sau có mẫu.
    - **Lookbehind**:
        - `(?<=...)`: Khớp nếu trước có mẫu.
        - `(?<!...)`: Không khớp nếu trước có mẫu.
    - **Khi cần**: Kiểm tra ngữ cảnh mà không bao gồm trong kết quả.
    - **Ưu**: Linh hoạt, không tiêu thụ chuỗi.
    - **Nhược**: Lookbehind có giới hạn độ dài cố định (Java).
    - **Ví dụ**:
      ```java
      Pattern.compile("\\w+(?=\\.)").matcher("file.txt").find(); // "file"
      ```

### 6. ⚠️ Gài: Lookbehind trong Java có giới hạn gì về độ dài pattern.
- **Trả lời**:
    - **Giới hạn**: Lookbehind phải có độ dài cố định (không hỗ trợ `*`, `+`).
    - **Lý do**: Engine regex cần biết độ dài chính xác để kiểm tra.
    - **Ví dụ**:
      ```java
      Pattern.compile("(?<=\\d{2})\\w+").matcher("12abc").find(); // OK
      Pattern.compile("(?<=\\d+)\\w+").matcher("12abc").find(); // Lỗi
      ```

---

## 5) Regex trong lớp `String`

### 1. `String.matches(regex)` — behavior & lưu ý (so khớp toàn bộ chuỗi).
- **Trả lời**:
    - **Behavior**: Kiểm tra toàn bộ chuỗi khớp regex.
    - **Lưu ý**: Không tái sử dụng `Pattern`, chậm nếu lặp.
    - **Ví dụ**:
      ```java
      String s = "123";
      boolean isNumber = s.matches("\\d+"); // true
      ```

### 2. `split(regex)` — khác gì với `StringTokenizer`.
- **Trả lời**:
    - **`split(regex)`**: Chia chuỗi theo regex, mạnh mẽ hơn.
    - **`StringTokenizer`**: Chia theo delimiter cố định, không hỗ trợ regex, cũ hơn.
    - **Ví dụ**:
      ```java
      String[] parts = "a,b;c".split("[,;]"); // ["a", "b", "c"]
      ```

### 3. `replaceAll(regex, replacement)` và `replaceFirst()`.
- **Trả lời**:
    - **`replaceAll()`**: Thay tất cả đoạn khớp.
    - **`replaceFirst()`**: Thay đoạn khớp đầu tiên.
    - **Ví dụ**:
      ```java
      String s = "a1b1c";
      s.replaceAll("\\d", "X"); // "aXbXc"
      s.replaceFirst("\\d", "X"); // "aXb1c"
      ```

### 4. ⚠️ Gài: Vì sao `replaceAll()` có thể ném `PatternSyntaxException` còn `replace()` thì không?
- **Trả lời**:
    - **`replaceAll()`**: Dùng regex, lỗi cú pháp regex gây `PatternSyntaxException`.
    - **`replace()`**: Thay chuỗi literal, không dùng regex.
    - **Ví dụ**:
      ```java
      String s = "abc";
      s.replaceAll("[", "X"); // PatternSyntaxException
      s.replace("[", "X"); // OK
      ```

---

## 6) Hiệu năng & Best Practices

### 1. Khi nào nên compile Pattern một lần và tái sử dụng thay vì compile mỗi lần.
- **Trả lời**:
    - **Nên tái sử dụng**: Khi regex được dùng nhiều lần, tiết kiệm chi phí biên dịch.
    - **Ví dụ**:
      ```java
      // Chậm
      for (String s : list) Pattern.matches("\\d+", s);
      // Nhanh
      Pattern p = Pattern.compile("\\d+");
      for (String s : list) p.matcher(s).matches();
      ```

### 2. ⚠️ Gài: Regex có thể gây **Catastrophic Backtracking** không? Ví dụ đơn giản.
- **Trả lời**:
    - **Có**: Backtracking quá mức khi regex phức tạp, chuỗi dài.
    - **Ví dụ**:
      ```java
      Pattern.compile("(a+)+b").matcher("aaaaaa...").find(); // Chậm do backtracking
      ```
    - **Giải thích**: Engine thử mọi tổ hợp `a+` trước khi tìm `b`.

### 3. Cách viết regex tránh backtracking quá mức.
- **Trả lời**:
    - Dùng quantifier cụ thể (`{n,m}` thay `*`).
    - Dùng non-capturing group hoặc possessive quantifier.
    - Tách regex thành các bước đơn giản.
    - **Ví dụ**:
      ```java
      // Tốt hơn
      Pattern.compile("a{1,10}b").matcher("aaaaaaab").find();
      ```

### 4. Khi nào nên dùng **String API thường** (`contains`, `startsWith`, `endsWith`) thay vì regex.
- **Trả lời**:
    - **Dùng String API**: Khi logic đơn giản (tìm chuỗi cố định, không cần mẫu phức tạp).
    - **Lý do**: Nhanh hơn, không cần biên dịch regex.
    - **Ví dụ**:
      ```java
      // Nhanh
      if (s.contains("abc")) { ... }
      // Chậm
      if (s.matches(".*abc.*")) { ... }
      ```

### 5. Dùng `Pattern.quote()` để xử lý input người dùng chứa ký tự đặc biệt.
- **Trả lời**:
    - **Cách dùng**: Thoát toàn bộ chuỗi để xử lý như literal.
    - **Ví dụ**:
      ```java
      String userInput = "a.b";
      String regex = Pattern.quote(userInput); // "a\.b"
      Pattern.compile(regex).matcher("a.b").find(); // true
      ```

---

## 7) Ứng dụng thực tế

### 1. Regex để validate email đơn giản và nâng cao (RFC 5322 — biết giới hạn).
- **Trả lời**:
    - **Đơn giản**: `[^@]+@[^@]+\\.[a-zA-Z]{2,}`
    - **Nâng cao (gần RFC 5322)**:
      ```java
      String regex = "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}";
      ```
    - **Giới hạn**: Không thể khớp hoàn toàn RFC 5322 (quá phức tạp, hiếm dùng).

### 2. Regex cho số điện thoại theo format quốc gia.
- **Trả lời**:
    - **Ví dụ Việt Nam** (+84 hoặc 0, 10 số):
      ```java
      String regex = "(?:\\+84|0)[35789]\\d{8}";
      ```
    - **Giải thích**: Bắt đầu bằng `+84` hoặc `0`, tiếp theo là đầu số di động.

### 3. Regex để tách từ trong câu, bỏ dấu chấm câu.
- **Trả lời**:
  ```java
  String regex = "\\b\\w+\\b";
  Pattern.compile(regex).matcher("Hello, world!").find(); // "Hello", "world"
  ```

### 4. Regex để parse log: thời gian, level, message.
- **Trả lời**:
  ```java
  String regex = "^(\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2})\\s+(\\w+)\\s+(.+)$";
  Matcher m = Pattern.compile(regex).matcher("2025-08-15 12:00:00 ERROR Something went wrong");
  if (m.find()) {
      System.out.println("Time: " + m.group(1));
      System.out.println("Level: " + m.group(2));
      System.out.println("Message: " + m.group(3));
  }
  ```

### 5. ⚠️ Gài: Regex validate password — ưu/nhược so với tách ra nhiều điều kiện trong code.
- **Trả lời**:
    - **Regex** (ví dụ: ít nhất 8 ký tự, có chữ hoa, thường, số):
      ```java
      String regex = "(?=.*[A-Z])(?=.*[a-z])(?=.*\\d).{8,}";
      ```
    - **Ưu**:
        - Ngắn gọn, khai báo.
        - Dễ áp dụng trong validation framework.
    - **Nhược**:
        - Khó đọc với regex phức tạp.
        - Khó báo lỗi cụ thể (ví dụ: thiếu chữ hoa).
    - **Code điều kiện**:
        - **Ưu**: Báo lỗi chi tiết, dễ bảo trì.
        - **Nhược**: Dài dòng hơn.
    - **Chọn**: Dùng code điều kiện nếu cần báo lỗi cụ thể.

---

## 8) Mini case (thực chiến)

### 1. Viết regex tìm tất cả từ bắt đầu bằng “Java” (case-insensitive) trong đoạn văn.
- **Trả lời**:
  ```java
  String text = "Java is great, javascript is not Java.";
  Matcher m = Pattern.compile("(?i)\\bJava\\w*\\b").matcher(text);
  while (m.find()) {
      System.out.println(m.group()); // Java
  }
  ```

### 2. Trích xuất domain từ email, kể cả subdomain.
- **Trả lời**:
  ```java
  String email = "user@sub.domain.com";
  Matcher m = Pattern.compile("@([\\w.-]+)").matcher(email);
  if (m.find()) {
      System.out.println(m.group(1)); // sub.domain.com
  }
  ```

### 3. Tìm tất cả số nguyên âm trong chuỗi và in vị trí index.
- **Trả lời**:
  ```java
  String text = "12 -34 abc -56";
  Matcher m = Pattern.compile("-\\d+").matcher(text);
  while (m.find()) {
      System.out.println(m.group() + " at " + m.start()); // -34 at 3, -56 at 10
  }
  ```

### 4. Tách các câu trong đoạn văn, không cắt nhầm khi gặp dấu chấm trong số thập phân.
- **Trả lời**:
  ```java
  String text = "Hello. World 3.14 is pi. End.";
  String[] sentences = text.split("(?<=[.!?])\\s+(?!\\d)");
  // ["Hello.", "World 3.14 is pi.", "End."]
  ```

### 5. Tìm tất cả link HTTP/HTTPS trong nội dung HTML (không parse HTML hoàn chỉnh).
- **Trả lời**:
  ```java
  String html = "<a href=\"https://example.com\">link</a> http://test.com";
  Matcher m = Pattern.compile("https?://[\\w.-]+(?:/\\S*)?").matcher(html);
  while (m.find()) {
      System.out.println(m.group()); // https://example.com, http://test.com
  }
  ```

### 6. Tìm các dòng log ERROR xuất hiện sau từ khóa `TransactionId=` và lấy ID đó.
- **Trả lời**:
  ```java
  String log = "INFO msg\nTransactionId=123 ERROR failed\nINFO ok";
  Matcher m = Pattern.compile("TransactionId=(\\d+)\\s+ERROR\\s+(.+)$", Pattern.MULTILINE).matcher(log);
  while (m.find()) {
      System.out.println("ID: " + m.group(1) + ", Message: " + m.group(2));
      // ID: 123, Message: failed
  }
  ```

---

