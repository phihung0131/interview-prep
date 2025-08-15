## 1) Khái niệm & Tổng quan

1. Annotation là gì? Dùng để làm gì ở **compile-time** và **runtime**?
2. Sự khác nhau giữa **metadata** qua annotation và **marker interface**/comment/Javadoc.
3. ⚠️ Gài: Annotation có “kế thừa” nhau không? Có thể `extends` annotation khác không?
4. Liệt kê **meta-annotations** chuẩn và vai trò của từng cái: `@Retention`, `@Target`, `@Documented`, `@Inherited`, `@Repeatable`.
5. Ví dụ các annotation chuẩn trong JDK: `@Override`, `@Deprecated`, `@FunctionalInterface`, `@SuppressWarnings`.

---

## 2) `@Retention` & `@Target`

1. So sánh `RetentionPolicy.SOURCE`, `CLASS`, `RUNTIME`: hiệu ứng tới **class file** và **reflection**.
2. `@Target` có những `ElementType` nào? (TYPE, METHOD, FIELD, PARAMETER, CONSTRUCTOR, PACKAGE, MODULE, TYPE\_USE, TYPE\_PARAMETER…)
3. ⚠️ Gài: Annotation `SOURCE` có thể đọc được bằng reflection không? Vì sao IDE vẫn “biết”?
4. Khi nào cần `TYPE_USE` và `TYPE_PARAMETER` (JSR 308)? Ví dụ gắn annotation vào generic type.
5. Có thể đặt **nhiều** `ElementType` cho một annotation không? Công dụng thực tế.

---

## 3) Khai báo & cấu trúc annotation

1. Cú pháp tạo annotation: `public @interface MyAnn { ... }`.
2. Kiểu dữ liệu hợp lệ cho phần tử (element) của annotation: primitives, `String`, `Class`, enum, annotation khác, **array** của các kiểu trên.
3. ⚠️ Gài: Có thể dùng `null` làm giá trị mặc định của element không? Vì sao phải chọn sentinels (ví dụ chuỗi rỗng)?
4. Khai báo **giá trị mặc định** bằng `default`. Quy tắc “constant expression”.
5. Quy ước đặc biệt với phần tử tên `value()` và cách viết rút gọn khi chỉ truyền `value`.

---

## 4) Lặp lại & kế thừa annotation

1. `@Repeatable` hoạt động như thế nào? **Container annotation** là gì và được sinh ở đâu?
2. Cách lấy annotation lặp lại qua reflection: `getAnnotationsByType` vs `getAnnotation`.
3. ⚠️ Gài: `@Inherited` áp dụng cho **class** hay cả method/field? Ảnh hưởng thực tế.
4. Khi override method ở subclass, annotation trên method cha có “chảy xuống” không? Khi nào phải gắn lại?

---

## 5) Reflection & truy xuất annotation

1. Dùng reflection để lấy annotation trên **class**, **field**, **method**, **parameter**. Khác biệt `getAnnotations` vs `getDeclaredAnnotations`.
2. Truy xuất annotation ở **tham số phương thức** (`Parameter` API) và ở **type use** (qua `AnnotatedType`).
3. ⚠️ Gài: Tại sao lấy annotation RUNTIME trên **interface** có thể nhìn thấy từ class **implements**? Có phải do `@Inherited`?
4. So sánh chi phí hiệu năng khi đọc annotation bằng reflection, cách **cache** để giảm overhead.

---

## 6) Processing ở compile-time (APT)

1. Annotation Processing là gì? Vai trò của `javax.annotation.processing.Processor`.
2. Dòng chảy APT: từ **source** → **rounds** → sinh mã (Filer) → compile tiếp.
3. ⚠️ Gài: Annotation có `RetentionPolicy.RUNTIME` có cần thiết để APT đọc được không?
4. Sự khác nhau giữa xử lý **compile-time** (APT) và **runtime** (reflection).
5. Khi nào nên viết **annotation processor**: kiểm tra quy ước, sinh builder/mapper, validate contract.

---

## 7) Type Annotations (JSR 308)

1. Ví dụ dùng `@NonNull List<@Email String>`: lợi ích so với chỉ gắn trên declaration.
2. `ElementType.TYPE_USE` mở ra những vị trí gắn nào (mã generic, mảng, cast, `throws`, `implements`)?
3. ⚠️ Gài: Trình biên dịch có **bắt buộc** thực thi ý nghĩa của type annotations (ví dụ null-safety) không? Cần gì để có tác dụng?
4. Tương tác với công cụ tĩnh (Checker Framework/SpotBugs): cơ chế hoạt động tổng quát.

---

## 8) Annotation chuẩn trong JDK — chi tiết

1. `@Override`: compiler kiểm tra điều gì? Trường hợp `@Override` trên interface method trong JDK cũ vs mới.
2. `@Deprecated`: thuộc tính `since`, `forRemoval` dùng khi nào?
3. `@SuppressWarnings`: các **key** thường dùng (`unchecked`, `deprecation`, `rawtypes`); phạm vi ảnh hưởng.
4. ⚠️ Gài: Lạm dụng `@SuppressWarnings("unchecked")` có thể che giấu lỗi gì liên quan generics?

---

## 9) Annotations phổ biến ngoài JDK (tư duy phỏng vấn)

1. Bean Validation (`@NotNull`, `@Email`, `@Size`…): chạy ở đâu, cần `@Validated`/`@Valid` trong Spring?
2. Jackson (`@JsonProperty`, `@JsonIgnore`, `@JsonCreator`): mapping tên trường và constructor.
3. Lombok (`@Getter`, `@Builder`): hoạt động ở compile-time kiểu gì (annotation processor).
4. ⚠️ Gài: Tại sao đổi tên field nhưng **quên** cập nhật `@JsonProperty` có thể phá tương thích JSON?

---

## 10) Meta-annotations nâng cao & composition

1. Dùng annotation này **meta-annotate** annotation khác để tạo **stereotype** (ví dụ Spring `@Service` meta-annotate `@Component`).
2. `@AliasFor` (trong Spring) giải quyết vấn đề gì khi **liên kết** thuộc tính giữa các annotation?
3. ⚠️ Gài: Hai annotation meta-annotate chéo nhau gây **mơ hồ** thuộc tính — nhận diện & tránh như thế nào?
4. Chiến lược đặt **default** thông minh để giảm noise khi dùng nhiều annotation chồng.

---

## 11) Package/Module-level annotations

1. Đặt annotation ở **package** trong `package-info.java` — use case (API docs, constraints).
2. Gắn annotation lên **module** trong `module-info.java`: khi nào hữu ích?
3. ⚠️ Gài: Đặt annotation ở package có “phủ” lên các class con cùng package không? Cần gì để truy xuất?

---

## 12) Hạn chế, tương thích & bẫy thường gặp

1. Annotation elements phải là **compile-time constant**: vì sao không thể đặt `new ArrayList<>()` hay `LocalDate.now()`?
2. Không có `null` trong element: kỹ thuật sentinel/`Optional`-like thay thế.
3. ⚠️ Gài: Thứ tự phần tử **array** trong annotation có quan trọng không (đối với `equals`/`hashCode` của annotation)?
4. Binary compatibility: thay đổi **giá trị hằng số** trong annotation lib có thể không phản ánh ở client nếu không **recompile** — vì sao?

---

## 13) Thiết kế annotation tốt

1. Tiêu chí: rõ mục tiêu, minimal surface, default hợp lý, tài liệu hóa (`@Documented`).
2. Cân nhắc `RUNTIME` vs `CLASS`: **chỉ** bật `RUNTIME` khi cần phản chiếu.
3. ⚠️ Gài: Biến annotation thành “cấu hình mini-language” quá phức tạp có mùi gì? Khi nào nên chuyển sang code/builder JSON/YAML.
4. Tên element `value` vs nhiều element có tên: quy ước nhất quán giúp đọc/viết gọn.

---

## 14) Hiệu năng & bảo mật

1. Overhead đọc annotation runtime: khi nào cần **cache** (Map\<Class\<?>, AnnInfo>)?
2. Ảnh hưởng module system (Java 9+) tới **reflective access** annotation trên **private**/non-exported packages.
3. ⚠️ Gài: Rủi ro bảo mật khi dựa vào annotation để **bật tính năng** mà không kiểm tra quyền/role ở runtime.

---

## 15) Mini case (thực chiến 2–5 phút/câu)

1. Thiết kế `@Audit(action, actorField)` để tự động log trước/sau khi gọi service; xác định `@Target`, `@Retention`, cách lấy **actor** bằng reflection.
2. Viết `@Trimmed` (TYPE\_USE) để **normalize** `String` khi binding request → DTO; phác thảo chỗ cắm processor/filter.
3. Chuyển các flag boolean rải rác thành một annotation `@FeatureToggle("key")` đọc từ config; bàn về **RUNTIME vs CLASS**.
4. Xây `@Email` tuỳ biến dùng Bean Validation: định nghĩa element, `ConstraintValidator`, thông điệp i18n.
5. Chuẩn hóa REST error bằng annotation `@Problem(status, code)` đặt trên exception; design cách **mapping** → `ResponseEntity`.
6. Debug lỗi: `@Repeatable` không lấy được đủ annotations bằng reflection — liệt kê chỗ có thể sai (container, retention, API gọi).
