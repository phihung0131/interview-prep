## I) Khái niệm & Cú pháp cơ bản

1. Package là gì? Mục tiêu thiết kế của package trong Java là gì (namespace, tổ chức mã, access control)?
2. Cú pháp khai báo package đầu file `.java` như thế nào? Có bao nhiêu package có thể khai báo trong một file?
3. Điều gì xảy ra nếu **không** khai báo dòng `package` (default package)? Hệ quả với dự án thực tế?
4. Mối quan hệ giữa **tên package** và **cấu trúc thư mục** trong source/output?
5. Quy tắc biên dịch/lưu trữ khi `package` không khớp thư mục (ví dụ `com.example` nhưng file nằm sai chỗ)?
6. Tên package có phân biệt hoa/thường không? Hậu quả trên hệ điều hành khác nhau (Windows vs \*nix)?
7. Có thể đổi tên package “tùy hứng” được không? Ảnh hưởng tới FQN (Fully Qualified Name) và tương thích nhị phân?

---

## II) Quy ước đặt tên & tổ chức

8. Quy ước đặt tên package theo reversed domain (vd: `com.mycompany.app`)—lợi ích?
9. Khi nào nên chia nhỏ thành **subpackage** (vd: `com.app.util`, `com.app.service`)? “Subpackage” có **kế thừa** gì về access control không?
10. Ký tự hợp lệ trong tên package? Dùng số, `_`, `-` được không?
11. Tránh trùng tên với package chuẩn (vd: `java.util`)—vì sao?
12. Tiêu chí nhóm code theo package: theo layer (api, service, repository), theo domain (order, user), hay kết hợp?
13. Tên package gắn với version (vd `v1`, `v2`)—ưu/nhược?

---

## III) Access control & Visibility (package-level)

14. **Package-private** (default, không ghi modifier) là gì? Ai truy cập được?
15. `protected` khác gì `package-private` khi khác package nhưng có **kế thừa**?
16. `public` class trong package A có thể dùng class package-private trong cùng package A không?
17. `private` top-level class có tồn tại không? Nếu không, vì sao?
18. Một file có thể chứa nhiều top-level class không? Modifier nào bắt buộc với class trùng tên file?
19. “Friend-like” access qua package: ưu/nhược điểm so với `public` API?
20. Access của **nested class** (inner/static nested) tương tác ra sao với package-level visibility?

---

## IV) Import & tên đầy đủ (FQN)

21. `import` hoạt động thế nào? Có ảnh hưởng runtime không hay chỉ là cú pháp compile-time?
22. `import a.b.*;` có import **subpackages** không? Vì sao nhiều người hiểu nhầm?
23. Khác nhau giữa `import a.b.C;` và `import a.b.*;` về độ rõ ràng và xung đột tên?
24. **Ambiguous import**: 2 class cùng tên ở 2 package khác nhau—giải quyết ra sao?
25. Khi nên dùng **FQN** (vd: `java.util.Date`) thay vì import?
26. Static import (`import static ...`) dùng khi nào? Pitfalls (đọc hiểu, xung đột tên)?
27. Hiệu năng compile-time khi dùng wildcard import vs import tường minh? Myth vs thực tế.

---

## V) Classpath, JAR & Tải lớp (core level)

28. **Classpath** là gì? Compiler/runtime tìm class theo package như thế nào?
29. Khác nhau giữa **sourcepath** và **classpath** khi dùng `javac`?
30. Một package có thể “trải” trên nhiều JAR khác nhau không? (split package ở góc nhìn classpath thuần)
31. Khi có **trùng FQN** (cùng package + cùng tên class) ở nhiều JAR, classloader chọn cái nào?
32. **Sealed package** trong JAR manifest là gì (core-level, không JPMS)? Ảnh hưởng vi phạm sẽ ra sao?
33. Package và **SecurityManager** (di sản): khái niệm “package sealing” và kiểm tra toàn vẹn.
34. Ảnh hưởng của **đường dẫn trùng lặp** (same class on classpath nhiều lần) với việc nạp lớp theo package?

---

## VI) Tài nguyên (resources) & package

35. Cách tổ chức **resources** theo package (thư mục) để dùng `Class.getResource(...)`/`getResourceAsStream(...)`?
36. Đường dẫn tương đối vs tuyệt đối trong `getResource(...)` liên hệ thế nào với package của class gọi?
37. Tên package ảnh hưởng gì tới **ResourceBundle** (i18n) lookup?
38. Loading resource trong JAR theo package có khác gì so với filesystem?
39. Bẫy phổ biến khi build ra JAR: resource không nằm đúng package → load thất bại.

---

## VII) `package-info.java` & Annotations ở cấp package

40. `package-info.java` dùng để làm gì? Có thể chứa những thứ gì (javadoc, annotations)?
41. Làm sao gắn **annotation** vào package? (khai báo ở `package-info.java`)
42. Sự khác nhau khi đọc annotation ở cấp **package** so với class (Reflection API nào)?
43. `@Documented`/`@Retention` lựa chọn nào phù hợp cho annotation cấp package?
44. Có thể có nhiều `package-info.java` cho cùng một package ở nhiều thư mục nguồn không? Hợp nhất thế nào lúc compile?

---

## VIII) Công cụ & Quy trình biên dịch (javac/jar)

45. `javac -d out src/...` sắp xếp output theo package ra sao?
46. `jar` đóng gói: sơ đồ thư mục trong JAR phải khớp package như thế nào?
47. Khi đổi package, cần cập nhật những đâu (import, build scripts, shade/relocate)?
48. Ảnh hưởng của **obfuscation/shading** tới tên package (relocation) và tương thích nhị phân?
49. Có nên dùng package tên ngắn để giảm kích thước classfile/JAR? (thực tế vs ảnh hưởng đọc hiểu)

---

## IX) Quan hệ với OOP & Thiết kế API

50. Dùng package để **ẩn chi tiết triển khai** và chỉ public hóa “API surface” nhỏ—cách bố trí thư mục hợp lý?
51. “Feature package” (gom theo module nghiệp vụ) vs “layer package” (controller/service/repo): trade-offs?
52. Tách `api` và `impl` theo package: cách giảm rò rỉ type nội bộ ra public API?
53. Kết hợp **package-private** với **factory pattern** để kiểm soát tạo đối tượng?
54. Tổ chức test theo package: test có thể truy cập package-private không (cùng package)?
55. Thiết kế tên package phản ánh **bounded context** trong DDD: lợi ích lâu dài?

---

## X) Tương tác với `protected`/kế thừa & packages

56. Quy tắc chi tiết của `protected` khi **khác package** nhưng **có kế thừa** (ai truy cập được, qua tham chiếu nào)?
57. `protected` + package-private members khác package: ví dụ dễ gây hiểu nhầm?
58. Subclass cùng package vs khác package: khác biệt thực quyền truy cập?
59. “Friend package” (không có thật): cách mô phỏng bằng packaging & design?

---

## XI) ClassLoader & Packages (ở mức core)

60. Mỗi `Class` biết mình thuộc package nào như thế nào? (`Class.getPackage()`) trả về gì khi không có `package-info`?
61. Hai class cùng **tên package** nhưng do **ClassLoader khác** nạp—chúng có “cùng package” theo JVM không?
62. Tác động của việc override `getResource` ở custom classloader tới resource lookup theo package?
63. Có thể tạo `Package` đối tượng runtime (`Package.getPackage`) và metadata (Implementation-Version…) như thế nào?

---

## XII) Edge cases & Bẫy thường gặp

64. Không thể **import** từ **default package**—vì sao?
65. Import static với tên đụng `java.lang.Math.*` và constant trùng tên—làm sao tránh nhập nhằng?
66. Wildcard import từ **nhiều package** gây khó đọc—quy tắc dọn dẹp?
67. **Tên trùng** giữa class và package (vd: package `util` và class `util`)—hệ quả?
68. “Shadowing” class chuẩn bằng class cùng tên trong package tự tạo—tác hại?
69. Tải tài nguyên với đường dẫn sai (thiếu `/` đầu) khi dùng `getResource`—khác biệt giữa call từ instance vs từ class?
70. `package-info.java` bị IDE bỏ qua khi không có javadoc: cách đảm bảo nó vẫn compile/đóng gói?

---
