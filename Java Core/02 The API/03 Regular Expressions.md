## 1) Khái niệm & Tổng quan

1. Regular Expression (Regex) là gì? Ưu điểm khi dùng Regex so với duyệt chuỗi thủ công.
2. ⚠️ Gài: Regex trong Java dùng **gói** nào (`java.util.regex`) và có hỗ trợ sẵn ở String API không?
3. Các thành phần chính của Regex: literal, meta-character, quantifier, character class, group.
4. Sự khác nhau giữa **Pattern** và **Matcher** trong Java.
5. Regex trong Java mặc định **case-sensitive** hay **case-insensitive**? Cách thay đổi.
6. ⚠️ Gài: Regex trong Java theo chuẩn nào (POSIX, Perl, …)? Có khác với regex trong JavaScript/Python không?

---

## 2) Pattern & Matcher API

1. `Pattern.compile()` — các tham số flag (`CASE_INSENSITIVE`, `MULTILINE`, `DOTALL`, `UNICODE_CASE`, `COMMENTS`).
2. `Matcher` cung cấp những method nào để tìm và thao tác chuỗi? (find, matches, lookingAt, group, start, end)
3. ⚠️ Gài: Khác nhau giữa `matches()` và `find()` trong Matcher.
4. Dùng `group()` như thế nào để lấy sub-match?
5. `Pattern.matches(regex, input)` khác gì với `Pattern.compile(regex).matcher(input).matches()` về hiệu năng.
6. Cách reset Matcher để tái sử dụng.
7. Dùng `replaceAll()` vs `replaceFirst()` với regex.

---

## 3) Cú pháp Regex cơ bản

1. Các ký tự đặc biệt (meta-character): `. ^ $ * + ? { } [ ] \ | ( )` — ý nghĩa từng ký tự.
2. Character classes: `[abc]`, `[^abc]`, `[a-zA-Z]`, `\d`, `\D`, `\w`, `\W`, `\s`, `\S`.
3. Quantifiers: `*`, `+`, `?`, `{n}`, `{n,}`, `{n,m}` — greedy, reluctant (`*?`) và possessive (`*+`).
4. ⚠️ Gài: Sự khác nhau giữa greedy, reluctant và possessive quantifier về backtracking.
5. Anchors: `^` (start), `$` (end), `\b` (word boundary), `\B` (non-boundary).
6. Alternation: `|` — ưu tiên đánh giá từ trái sang phải.
7. Escaping: khi nào cần `\\` trong Java string literal để biểu diễn `\` của regex.

---

## 4) Grouping & Backreference

1. Capturing group `(…)` vs non-capturing group `(?:…)`.
2. ⚠️ Gài: Khi nào dùng non-capturing group để tối ưu hiệu năng?
3. Backreference: `\1`, `\2` — cách hoạt động.
4. Named capturing group `(?<name>…)` và cách lấy bằng tên trong Java 7+ (`Matcher.group("name")`).
5. Lookahead và lookbehind: `(?=…)`, `(?!…)`, `(?<=…)`, `(?<!…)` — khi nào cần, ưu/nhược điểm.
6. ⚠️ Gài: Lookbehind trong Java có giới hạn gì về độ dài pattern.

---

## 5) Regex trong lớp `String`

1. `String.matches(regex)` — behavior & lưu ý (so khớp toàn bộ chuỗi).
2. `split(regex)` — khác gì với `StringTokenizer`.
3. `replaceAll(regex, replacement)` và `replaceFirst()`.
4. ⚠️ Gài: Vì sao `replaceAll()` có thể ném `PatternSyntaxException` còn `replace()` thì không?

---

## 6) Hiệu năng & Best Practices

1. Khi nào nên compile Pattern một lần và tái sử dụng thay vì compile mỗi lần.
2. ⚠️ Gài: Regex có thể gây **Catastrophic Backtracking** không? Ví dụ đơn giản.
3. Cách viết regex tránh backtracking quá mức.
4. Khi nào nên dùng **String API thường** (`contains`, `startsWith`, `endsWith`) thay vì regex.
5. Dùng `Pattern.quote()` để xử lý input người dùng chứa ký tự đặc biệt.

---

## 7) Ứng dụng thực tế

1. Regex để validate email đơn giản và nâng cao (RFC 5322 — biết giới hạn).
2. Regex cho số điện thoại theo format quốc gia.
3. Regex để tách từ trong câu, bỏ dấu chấm câu.
4. Regex để parse log: thời gian, level, message.
5. ⚠️ Gài: Regex validate password — ưu/nhược so với tách ra nhiều điều kiện trong code.

---

## 8) Mini case (thực chiến)

1. Viết regex tìm tất cả từ bắt đầu bằng “Java” (case-insensitive) trong đoạn văn.
2. Trích xuất domain từ email, kể cả subdomain.
3. Tìm tất cả số nguyên âm trong chuỗi và in vị trí index.
4. Tách các câu trong đoạn văn, không cắt nhầm khi gặp dấu chấm trong số thập phân.
5. Tìm tất cả link HTTP/HTTPS trong nội dung HTML (không parse HTML hoàn chỉnh).
6. Tìm các dòng log ERROR xuất hiện sau từ khóa `TransactionId=` và lấy ID đó.

