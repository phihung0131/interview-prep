## 1) Khái niệm & mục đích của package

1. Package là gì? Nó giải quyết vấn đề gì về tổ chức mã nguồn và không gian tên?
2. Sự khác nhau giữa **package** và **module** (Java 9+): phạm vi và vai trò.
3. `java.lang.Package` đại diện cho điều gì ở runtime? Lấy metadata gì từ nó?

## 2) Quy tắc đặt tên & cấu trúc thư mục

1. Quy ước đặt tên package (lowercase, domain đảo ngược). Vì sao nên tránh tên ngắn/không có domain?
2. Cấu trúc thư mục ↔ câu lệnh `package` trong file `.java`: ánh xạ như thế nào?
3. ⚠️ Gài: **Subpackage** có thừa kế quyền của package cha không? Ví dụ `a.b` vs `a.b.c`.
4. Tên package hợp lệ gồm ký tự gì? Có nên dùng Unicode/tiếng Việt trong tên package?

## 3) Tầm vực truy cập & package-private

1. Bốn mức truy cập (`public`, `protected`, *default*/package-private, `private`) ảnh hưởng ra sao khi khác package?
2. Quy tắc **`protected`** khi khác package: truy cập hợp lệ trong bối cảnh nào?
3. ⚠️ Gài: `class` top-level có thể `private`/`protected` không? Nếu không, muốn “ẩn” lớp thì làm thế nào?
4. Quan hệ truy cập giữa **top-level** class cùng package và **nested class**.

## 4) `package` declaration & nhiều lớp trong một file

1. Cú pháp và vị trí bắt buộc của dòng `package` trong file `.java`.
2. Một file có thể chứa nhiều lớp top-level không? Lớp nào phải trùng tên file, vì sao?
3. ⚠️ Gài: Nếu **không** có dòng `package`, lớp thuộc package nào? Hệ quả trong import và classpath.

## 5) `import` & `static import`

1. `import` hoạt động thế nào? Nó có “nạp” class vào bộ nhớ không?
2. `import a.*` vs `import a.B`: khác biệt, ưu/nhược.
3. `static import` dùng khi nào (`import static java.util.Collections.*`)? Khi nào **tránh** dùng để giữ code rõ ràng?
4. ⚠️ Gài: Hai lớp trùng tên ở hai package khác nhau — compiler chọn lớp nào? Cách giải mơ hồ.

## 6) Classpath, JAR & package identity

1. Classpath là gì? JVM tìm lớp theo package như thế nào trong thư mục/JAR?
2. Vai trò của **MANIFEST.MF** (ví dụ `Main-Class`), có ảnh hưởng gì đến package không?
3. ⚠️ Gài: “**Split package**” là gì (cùng tên package trải trên nhiều JAR)? Vấn đề gì có thể xảy ra trước/sau Java 9?

## 7) Tài nguyên (resources) trong package

1. Cách tổ chức file tài nguyên (properties, images) trong `src/main/resources` và truy xuất bằng `Class#getResource*`.
2. Khác biệt đường dẫn bắt đầu bằng `/` và không khi gọi `getResource`.
3. ⚠️ Gài: Vì sao dùng `new File(...)` thường **sai** khi truy cập tài nguyên đóng gói trong JAR?

## 8) `package-info.java` & package-level annotations

1. `package-info.java` dùng để làm gì (Javadoc, annotations ở mức package)?
2. Cú pháp khai báo annotation cho package và cách đọc ở runtime.
3. ⚠️ Gài: Đặt `@Nonnull` ở package có “tự động” áp vào tất cả tham số/return không? Cần điều kiện gì để công cụ hiểu?

## 9) Sealed package & bảo toàn tính toàn vẹn (JAR sealing)

1. “Package sealing” là gì trong MANIFEST (`Sealed: true`)? Mục đích, lợi/hại.
2. ⚠️ Gài: Điều gì xảy ra nếu hai JAR **sealed** cùng package tên giống nhau nằm trên classpath?

## 10) Tương tác với Security/Module (nhẹ)

1. Quan hệ giữa package và **module exports** (Java 9+): `exports`/`opens` khác nhau thế nào?
2. Ảnh hưởng của module đến **reflective access** vào class/field ở package không `open`.
3. ⚠️ Gài: Code chạy tốt ở Java 8 nhưng phản chiếu (reflection) **fail** ở Java 17 — liên quan đến package và module như thế nào?

## 11) Thiết kế phân tầng & thực hành tốt

1. Cách chia package theo **domain** (feature-based) vs **layer** (controller/service/repo). Trade-off mỗi cách.
2. Quy tắc ổn định phụ thuộc (tầng **api** không phụ thuộc **impl**).
3. ⚠️ Gài: “God package” chứa quá nhiều lớp — dấu hiệu và chiến lược tách nhỏ.
4. Tên package là **một phần hợp đồng công khai**: ảnh hưởng đến binary compatibility và tài liệu.

## 12) Testing & packages

1. Sử dụng **package-private** để test: đặt test cùng package hay dùng **test fixtures**?
2. ⚠️ Gài: Test ở module khác không truy cập được package-private — các cách giải (opens cho test, move test vào same module).

## 13) Collisions & refactoring

1. Xử lý xung đột tên lớp ở các thư viện khác nhau (FQCN, adapter).
2. Chiến lược refactor đổi tên package an toàn: IDE refactor, kiểm thử, kiểm tra tài nguyên/`package-info.java`.
3. ⚠️ Gài: Đổi tên package **breaking** serialization (FQCN trong stream) — phát hiện & xử lý.

## 14) Hiệu năng & class loading

1. Package ảnh hưởng gì tới tốc độ class loading không? Yếu tố thực sự chi phối là gì (I/O, classloader).
2. ⚠️ Gài: Dùng **Class.forName** với FQCN sai package gây lỗi nào? Phân biệt `ClassNotFoundException` vs `NoClassDefFoundError`.

## 15) Best practices & quy ước nhóm

1. Quy ước tên package ổn định, không lặp viết tắt khó hiểu.
2. Tách **api** (interfaces, DTO) ra package riêng với tài liệu rõ; **impl** ẩn ở package khác.
3. ⚠️ Gài: Lộ lớp **internal** qua `public` trong package API — rủi ro đối với người dùng thư viện.

---

## 16) Mini case (thực chiến 2–5 phút/câu)

1. Bạn có hai thư viện đều chứa lớp `com.example.util.Strings`. Hãy trình bày 3 cách loại bỏ mơ hồ khi sử dụng.
2. Ứng dụng Monorepo: tổ chức packages theo **feature** để giảm phụ thuộc vòng—đưa ra sơ đồ mẫu và nguyên tắc import.
3. Tích hợp Java 17 modules: gói `com.acme.internal` cần reflection bởi Jackson trong test—trình bày cấu hình `opens` an toàn.
4. Refactor hệ thống đổi domain từ `com.startup` sang `io.product`: kế hoạch cutover, kiểm tra tài nguyên & serialization.
5. Đóng gói JAR **sealed** cho package `com.acme.crypto` để ngăn can thiệp — nêu tác dụng phụ có thể gặp trong môi trường plugin.
