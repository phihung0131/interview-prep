## 1) Khái niệm & mục đích của package

### 1. Package là gì? Nó giải quyết vấn đề gì về tổ chức mã nguồn và không gian tên?
- **Trả lời**:
    - **Package**: Nhóm các lớp liên quan, định nghĩa không gian tên (namespace).
    - **Giải quyết**:
        - **Tổ chức mã nguồn**: Gom nhóm lớp theo chức năng, dễ quản lý.
        - **Không gian tên**: Tránh xung đột tên lớp (ví dụ: `java.util.List` vs `mylist.List`).
    - **Ví dụ**:
      ```java
      package com.example.util;
      public class Helper {}
      ```

### 2. Sự khác nhau giữa **package** và **module** (Java 9+): phạm vi và vai trò.
- **Trả lời**:
    - **Package**:
        - Phạm vi: Nhóm lớp trong cùng không gian tên.
        - Vai trò: Tổ chức mã, kiểm soát truy cập (package-private).
    - **Module** (Java 9+):
        - Phạm vi: Nhóm nhiều package, kiểm soát truy cập qua `exports`/`opens`.
        - Vai trò: Đóng gói mạnh hơn, quản lý dependency.
    - **Ví dụ**:
      ```java
      // Package
      package com.example;
      // Module
      module com.example { exports com.example.api; }
      ```

### 3. `java.lang.Package` đại diện cho điều gì ở runtime? Lấy metadata gì từ nó?
- **Trả lời**:
    - **`java.lang.Package`**: Đại diện package tại runtime, chứa metadata từ JAR.
    - **Metadata**:
        - Tên package (`getName()`).
        - Thông tin version (`getSpecificationVersion()`, `getImplementationVersion()`).
        - Annotation (`getAnnotations()`).
    - **Ví dụ**:
      ```java
      Package pkg = Package.getPackage("com.example");
      String version = pkg.getImplementationVersion();
      ```

---

## 2) Quy tắc đặt tên & cấu trúc thư mục

### 1. Quy ước đặt tên package (lowercase, domain đảo ngược). Vì sao nên tránh tên ngắn/không có domain?
- **Trả lời**:
    - **Quy ước**: Dùng chữ thường, đảo ngược domain (ví dụ: `com.example.util`).
    - **Tránh tên ngắn**: Dễ xung đột với package khác, khó bảo trì.
    - **Ví dụ**:
      ```java
      package com.example.util; // Tốt
      package util; // Xấu, dễ xung đột
      ```

### 2. Cấu trúc thư mục ↔ câu lệnh `package` trong file `.java`: ánh xạ như thế nào?
- **Trả lời**:
    - **Ánh xạ**: Package `com.example.util` ánh xạ thành thư mục `com/example/util`.
    - **Ví dụ**:
      ```java
      // com/example/util/Helper.java
      package com.example.util;
      public class Helper {}
      ```

### 3. ⚠️ Gài: **Subpackage** có thừa kế quyền của package cha không? Ví dụ `a.b` vs `a.b.c`.
- **Trả lời**:
    - **Không thừa kế**: Subpackage (`a.b.c`) không có quyền truy cập package-private của package cha (`a.b`).
    - **Ví dụ**:
      ```java
      package a.b;
      class Parent { void method() {} }
      package a.b.c;
      class Child { void test() { new Parent().method(); } } // Lỗi: method() package-private
      ```

### 4. Tên package hợp lệ gồm ký tự gì? Có nên dùng Unicode/tiếng Việt trong tên package?
- **Trả lời**:
    - **Hợp lệ**: Chữ, số, dấu chấm, dấu gạch dưới (nhưng không bắt đầu bằng số).
    - **Unicode/tiếng Việt**: Hợp lệ nhưng không nên dùng, vì khó đọc, không tương thích với một số công cụ.
    - **Ví dụ**:
      ```java
      package com.example.util; // Tốt
      package com.xin_chào; // Hợp lệ nhưng không nên
      ```

---

## 3) Tầm vực truy cập & package-private

### 1. Bốn mức truy cập (`public`, `protected`, *default*/package-private, `private`) ảnh hưởng ra sao khi khác package?
- **Trả lời**:
    - **`public`**: Truy cập từ mọi nơi.
    - **`protected`**: Truy cập trong cùng package hoặc subclass (kể cả khác package).
    - **Package-private** (`default`): Chỉ truy cập trong cùng package.
    - **`private`**: Chỉ trong cùng class.
    - **Ví dụ**:
      ```java
      package a;
      public class A { protected void method() {} }
      package b;
      class B extends A { void test() { method(); } } // OK, protected
      ```

### 2. Quy tắc **`protected`** khi khác package: truy cập hợp lệ trong bối cảnh nào?
- **Trả lời**:
    - **Quy tắc**: Subclass ở khác package chỉ truy cập `protected` qua instance của chính subclass.
    - **Ví dụ**:
      ```java
      package a;
      public class A { protected void method() {} }
      package b;
      class B extends A {
          void test() {
              method(); // OK
              new A().method(); // Lỗi
          }
      }
      ```

### 3. ⚠️ Gài: `class` top-level có thể `private`/`protected` không? Nếu không, muốn “ẩn” lớp thì làm thế nào?
- **Trả lời**:
    - **Không thể**: Top-level class chỉ có thể `public` hoặc package-private.
    - **Ẩn lớp**:
        - Dùng package-private.
        - Dùng nested class (`private`/`protected`).
    - **Ví dụ**:
      ```java
      package com.example;
      class Hidden {} // Package-private
      public class Outer { private static class Inner {} }
      ```

### 4. Quan hệ truy cập giữa **top-level** class cùng package và **nested class**.
- **Trả lời**:
    - **Top-level cùng package**: Truy cập package-private lẫn nhau.
    - **Nested class**: Có thể truy cập private của enclosing class.
    - **Ví dụ**:
      ```java
      package com.example;
      class A { private int x; }
      class B { void test(A a) { a.x = 1; } } // OK, cùng package
      class Outer {
          private int x;
          static class Inner { void test(Outer o) { o.x = 1; } } // OK
      }
      ```

---

## 4) `package` declaration & nhiều lớp trong một file

### 1. Cú pháp và vị trí bắt buộc của dòng `package` trong file `.java`.
- **Trả lời**:
    - **Cú pháp**: `package com.example;` ở dòng đầu tiên (trước `import`).
    - **Ví dụ**:
      ```java
      package com.example;
      import java.util.*;
      public class MyClass {}
      ```

### 2. Một file có thể chứa nhiều lớp top-level không? Lớp nào phải trùng tên file, vì sao?
- **Trả lời**:
    - **Có thể**: Nhiều top-level class, nhưng chỉ một `public` class trùng tên file.
    - **Lý do**: Compiler yêu cầu `public` class trùng tên file để dễ tìm.
    - **Ví dụ**:
      ```java
      // MyClass.java
      public class MyClass {}
      class Helper {} // OK, không public
      ```

### 3. ⚠️ Gài: Nếu **không** có dòng `package`, lớp thuộc package nào? Hệ quả trong import và classpath.
- **Trả lời**:
    - **Default package**: Lớp thuộc package mặc định (không tên).
    - **Hệ quả**:
        - Không thể import từ default package (ngoại trừ trong cùng default package).
        - Classpath vẫn tìm được, nhưng khó quản lý.
    - **Ví dụ**:
      ```java
      // MyClass.java (no package)
      public class MyClass {}
      // Không import được từ package khác
      ```

---

## 5) `import` & `static import`

### 1. `import` hoạt động thế nào? Nó có “nạp” class vào bộ nhớ không?
- **Trả lời**:
    - **Hoạt động**: `import` ánh xạ tên ngắn gọn cho fully qualified class name (FQCN), chỉ dùng lúc biên dịch.
    - **Không nạp**: Class chỉ nạp khi runtime bởi classloader.
    - **Ví dụ**:
      ```java
      import java.util.List;
      List<String> list; // Không nạp List
      ```

### 2. `import a.*` vs `import a.B`: khác biệt, ưu/nhược.
- **Trả lời**:
    - **`import a.*`**:
        - **Ưu**: Nhập tất cả lớp trong package `a`, gọn khi dùng nhiều lớp.
        - **Nhược**: Có thể gây mơ hồ, không rõ ràng.
    - **`import a.B`**:
        - **Ưu**: Rõ ràng, chỉ nhập lớp cụ thể.
        - **Nhược**: Phải viết nhiều `import`.
    - **Ví dụ**:
      ```java
      import java.util.*; // Nhập List, Set, ...
      import java.util.List; // Chỉ nhập List
      ```

### 3. `static import` dùng khi nào (`import static java.util.Collections.*`)? Khi nào **tránh** dùng để giữ code rõ ràng?
- **Trả lời**:
    - **Dùng**: Khi cần truy cập static members mà không cần tiền tố class.
    - **Tránh**: Khi gây mơ hồ hoặc làm code khó đọc.
    - **Ví dụ**:
      ```java
      import static java.util.Collections.*;
      List<String> list = singletonList("item"); // Tốt
      // Tránh: import static * quá nhiều gây nhầm lẫn
      ```

### 4. ⚠️ Gài: Hai lớp trùng tên ở hai package khác nhau — compiler chọn lớp nào? Cách giải mơ hồ.
- **Trả lời**:
    - **Compiler lỗi**: Nếu cả hai lớp được import hoặc cùng package.
    - **Giải pháp**:
        - Dùng fully qualified class name (FQCN).
        - Import chỉ một lớp.
    - **Ví dụ**:
      ```java
      import com.example.util.List;
      import java.util.List; // Lỗi
      com.example.util.List list; // OK, dùng FQCN
      ```

---

## 6) Classpath, JAR & package identity

### 1. Classpath là gì? JVM tìm lớp theo package như thế nào trong thư mục/JAR?
- **Trả lời**:
    - **Classpath**: Danh sách thư mục/JAR nơi JVM tìm class.
    - **Tìm lớp**: JVM ánh xạ package/class name (`com.example.MyClass`) thành đường dẫn (`com/example/MyClass.class`).
    - **Ví dụ**:
      ```java
      java -cp lib.jar com.example.Main
      ```

### 2. Vai trò của **MANIFEST.MF** (ví dụ `Main-Class`), có ảnh hưởng gì đến package không?
- **Trả lời**:
    - **`MANIFEST.MF`**: Chứa metadata của JAR (ví dụ: `Main-Class` chỉ định entry point).
    - **Ảnh hưởng**: Không trực tiếp liên quan package, nhưng có thể chỉ định package sealing.
    - **Ví dụ**:
      ```java
      Main-Class: com.example.Main
      ```

### 3. ⚠️ Gài: “**Split package**” là gì (cùng tên package trải trên nhiều JAR)? Vấn đề gì có thể xảy ra trước/sau Java 9?
- **Trả lời**:
    - **Split package**: Cùng package (ví dụ: `com.example`) có trong nhiều JAR.
    - **Trước Java 9**: Có thể chạy, nhưng dễ xung đột nếu class trùng.
    - **Sau Java 9**: Module system cấm split package, gây lỗi module resolution.
    - **Ví dụ**:
      ```java
      // JAR1: com.example.A
      // JAR2: com.example.B // Split package, lỗi ở Java 9+
      ```

---

## 7) Tài nguyên (resources) trong package

### 1. Cách tổ chức file tài nguyên (properties, images) trong `src/main/resources` và truy xuất bằng `Class#getResource*`.
- **Trả lời**:
    - **Tổ chức**: Đặt tài nguyên trong `src/main/resources`, ánh xạ theo package.
    - **Truy xuất**:
      ```java
      URL url = MyClass.class.getResource("/config.properties");
      InputStream is = MyClass.class.getResourceAsStream("image.png");
      ```

### 2. Khác biệt đường dẫn bắt đầu bằng `/` và không khi gọi `getResource`.
- **Trả lời**:
    - **Bắt đầu `/`**: Đường dẫn tuyệt đối từ gốc classpath.
    - **Không `/`**: Đường dẫn tương đối từ package của class.
    - **Ví dụ**:
      ```java
      // com.example.MyClass
      getResource("/data.txt"); // Tìm ở gốc classpath
      getResource("data.txt"); // Tìm trong com/example
      ```

### 3. ⚠️ Gài: Vì sao dùng `new File(...)` thường **sai** khi truy xuất tài nguyên đóng gói trong JAR?
- **Trả lời**:
    - **Lý do**: `new File(...)` chỉ hoạt động với file system, không truy cập được tài nguyên trong JAR.
    - **Khắc phục**: Dùng `Class.getResourceAsStream()`.
    - **Ví dụ**:
      ```java
      InputStream is = MyClass.class.getResourceAsStream("/config.properties");
      ```

---

## 8) `package-info.java` & package-level annotations

### 1. `package-info.java` dùng để làm gì (Javadoc, annotations ở mức package)?
- **Trả lời**:
    - **Dùng để**:
        - Ghi Javadoc cho package.
        - Gắn package-level annotations (ví dụ: `@NonNullByDefault`).
    - **Ví dụ**:
      ```java
      // package-info.java
      /**
       * Package description.
       */
      @NonNullByDefault
      package com.example;
      ```

### 2. Cú pháp khai báo annotation cho package và cách đọc ở runtime.
- **Trả lời**:
    - **Cú pháp**: Gắn annotation trong `package-info.java`.
    - **Đọc runtime**:
      ```java
      Package pkg = Package.getPackage("com.example");
      Annotation[] anns = pkg.getAnnotations();
      ```

### 3. ⚠️ Gài: Đặt `@NonNull` ở package có “tự động” áp vào tất cả tham số/return không? Cần điều kiện gì để công cụ hiểu?
- **Trả lời**:
    - **Không tự động**: `@NonNull` ở package chỉ là gợi ý.
    - **Điều kiện**: Cần annotation processor (Checker Framework) hoặc công cụ tĩnh để thực thi.
    - **Ví dụ**:
      ```java
      @NonNullByDefault
      package com.example;
      ```

---

## 9) Sealed package & bảo toàn tính toàn vẹn (JAR sealing)

### 1. “Package sealing” là gì trong MANIFEST (`Sealed: true`)? Mục đích, lợi/hại.
- **Trả lời**:
    - **Sealing**: Ngăn package được mở rộng từ JAR khác (`Sealed: true` trong `MANIFEST.MF`).
    - **Mục đích**: Bảo vệ tính toàn vẹn, tránh can thiệp package.
    - **Lợi**: An toàn, kiểm soát.
    - **Hại**: Giới hạn mở rộng, khó tích hợp plugin.
    - **Ví dụ**:
      ```java
      // MANIFEST.MF
      Name: com.example
      Sealed: true
      ```

### 2. ⚠️ Gài: Điều gì xảy ra nếu hai JAR **sealed** cùng package tên giống nhau nằm trên classpath?
- **Trả lời**:
    - **Hệ quả**: JVM ném `SecurityException` khi load class từ package bị trùng.
    - **Khắc phục**: Tránh split package hoặc bỏ sealing.

---

## 10) Tương tác với Security/Module (nhẹ)

### 1. Quan hệ giữa package và **module exports** (Java 9+): `exports`/`opens` khác nhau thế nào?
- **Trả lời**:
    - **`exports`**: Cho phép truy cập public API của package từ module khác.
    - **`opens`**: Cho phép reflection vào package, kể cả private.
    - **Ví dụ**:
      ```java
      module com.example {
          exports com.example.api;
          opens com.example.internal to jackson.databind;
      }
      ```

### 2. Ảnh hưởng của module đến **reflective access** vào class/field ở package không `open`.
- **Trả lời**:
    - **Ảnh hưởng**: Module system chặn reflection vào package không `open`, ném `IllegalAccessException`.
    - **Khắc phục**: Dùng `opens` hoặc `--add-opens`.
    - **Ví dụ**:
      ```java
      java --add-opens com.example/com.example.internal=ALL-UNNAMED
      ```

### 3. ⚠️ Gài: Code chạy tốt ở Java 8 nhưng phản chiếu (reflection) **fail** ở Java 17 — liên quan đến package và module như thế nào?
- **Trả lời**:
    - **Lý do**: Java 9+ giới thiệu module system, chặn reflection vào package không `open`.
    - **Khắc phục**: Thêm `opens` trong `module-info.java` hoặc dùng `--add-opens`.
    - **Ví dụ**:
      ```java
      module com.example { opens com.example.internal; }
      ```

---

## 11) Thiết kế phân tầng & thực hành tốt

### 1. Cách chia package theo **domain** (feature-based) vs **layer** (controller/service/repo). Trade-off mỗi cách.
- **Trả lời**:
    - **Domain (feature-based)**:
        - **Ưu**: Gộp logic liên quan (ví dụ: `com.example.order`), dễ bảo trì.
        - **Nhược**: Có thể lặp lại code giữa feature.
    - **Layer**:
        - **Ưu**: Tách tầng rõ ràng (controller, service, repo).
        - **Nhược**: Phụ thuộc vòng dễ xảy ra.
    - **Ví dụ**:
      ```java
      // Domain
      com.example.order.OrderService
      // Layer
      com.example.service.OrderService
      ```

### 2. Quy tắc ổn định phụ thuộc (tầng **api** không phụ thuộc **impl**).
- **Trả lời**:
    - **Quy tắc**: Package API (interface, DTO) không import package implementation.
    - **Ví dụ**:
      ```java
      package com.example.api;
      public interface Service {}
      package com.example.impl;
      public class ServiceImpl implements com.example.api.Service {}
      ```

### 3. ⚠️ Gài: “God package” chứa quá nhiều lớp — dấu hiệu và chiến lược tách nhỏ.
- **Trả lời**:
    - **Dấu hiệu**: Package chứa nhiều lớp không liên quan, khó tìm kiếm.
    - **Chiến lược**:
        - Tách theo feature hoặc chức năng.
        - Giữ số lớp dưới 20-30/package.
    - **Ví dụ**: Tách `com.example.util` thành `com.example.util.string` và `com.example.util.math`.

### 4. Tên package là **một phần hợp đồng công khai**: ảnh hưởng đến binary compatibility và tài liệu.
- **Trả lời**:
    - **Hợp đồng công khai**: Tên package là API, không nên đổi tùy tiện.
    - **Ảnh hưởng**:
        - Đổi tên phá binary compatibility.
        - Cần tài liệu rõ ràng trong `package-info.java`.

---

## 12) Testing & packages

### 1. Sử dụng **package-private** để test: đặt test cùng package hay dùng **test fixtures**?
- **Trả lời**:
    - **Cùng package**: Test truy cập package-private, đơn giản.
    - **Test fixtures**: Tạo lớp public để test, rõ ràng hơn.
    - **Ví dụ**:
      ```java
      // com.example
      class MyClass { void method() {} }
      // com.example (test)
      class MyClassTest { void test() { new MyClass().method(); } }
      ```

### 2. ⚠️ Gài: Test ở module khác không truy cập được package-private — các cách giải (opens cho test, move test vào same module).
- **Trả lời**:
    - **Giải pháp**:
        - **Opens**: Mở package cho test module.
        - **Same module**: Đặt test trong cùng module.
    - **Ví dụ**:
      ```java
      module com.example {
          opens com.example to test.module;
      }
      ```

---

## 13) Collisions & refactoring

### 1. Xử lý xung đột tên lớp ở các thư viện khác nhau (FQCN, adapter).
- **Trả lời**:
    - **FQCN**: Dùng tên đầy đủ để chỉ định lớp.
    - **Adapter**: Viết wrapper để ánh xạ lớp.
    - **Ví dụ**:
      ```java
      com.example.util.List list; // FQCN
      class MyList { // Adapter
          private com.example.util.List delegate;
      }
      ```

### 2. Chiến lược refactor đổi tên package an toàn: IDE refactor, kiểm thử, kiểm tra tài nguyên/`package-info.java`.
- **Trả lời**:
    - **Chiến lược**:
        - Dùng IDE (Eclipse/IntelliJ) để refactor package.
        - Kiểm tra tài nguyên trong `src/main/resources`.
        - Cập nhật `package-info.java` và serialization.
        - Chạy unit test để xác nhận.
    - **Ví dụ**: Đổi `com.old` thành `com.new` và cập nhật `MANIFEST.MF`.

### 3. ⚠️ Gài: Đổi tên package **breaking** serialization (FQCN trong stream) — phát hiện & xử lý.
- **Trả lời**:
    - **Phát hiện**: Lỗi `ClassNotFoundException` khi deserialize.
    - **Xử lý**:
        - Giữ `serialVersionUID` nhất quán.
        - Tùy chỉnh `readResolve()` để ánh xạ lớp cũ sang mới.
    - **Ví dụ**:
      ```java
      class MyClass implements Serializable {
          private static final long serialVersionUID = 1L;
          private Object readResolve() { return new com.new.MyClass(); }
      }
      ```

---

## 14) Hiệu năng & class loading

### 1. Package ảnh hưởng gì tới tốc độ class loading không? Yếu tố thực sự chi phối là gì (I/O, classloader).
- **Trả lời**:
    - **Package**: Không ảnh hưởng trực tiếp, chỉ định danh.
    - **Yếu tố chi phối**:
        - I/O: Đọc file từ disk/JAR.
        - Classloader: Cơ chế tìm kiếm, cache.
    - **Ví dụ**: Nhiều JAR trên classpath làm chậm tìm kiếm.

### 2. ⚠️ Gài: Dùng **Class.forName** với FQCN sai package gây lỗi nào? Phân biệt `ClassNotFoundException` vs `NoClassDefFoundError`.
- **Trả lời**:
    - **Sai package**: `ClassNotFoundException` (lớp không tìm thấy).
    - **Phân biệt**:
        - **`ClassNotFoundException`**: Lớp không tồn tại trên classpath.
        - **`NoClassDefFoundError`**: Lớp tồn tại nhưng không khởi tạo được (lỗi dependency, initialization).
    - **Ví dụ**:
      ```java
      Class.forName("com.wrong.MyClass"); // ClassNotFoundException
      ```

---

## 15) Best practices & quy ước nhóm

### 1. Quy ước tên package ổn định, không lặp viết tắt khó hiểu.
- **Trả lời**:
    - **Quy ước**:
        - Dùng domain đảo ngược (`com.example`).
        - Tránh viết tắt khó hiểu (ví dụ: `com.ex.util` thay vì `com.example.util`).
    - **Ví dụ**:
      ```java
      package com.example.order.service; // Tốt
      package com.ex.ord.srv; // Xấu
      ```

### 2. Tách **api** (interfaces, DTO) ra package riêng với tài liệu rõ; **impl** ẩn ở package khác.
- **Trả lời**:
    - **API package**: Chứa interface, DTO, public API.
    - **Impl package**: Chứa implementation, package-private.
    - **Ví dụ**:
      ```java
      package com.example.api;
      public interface Service {}
      package com.example.impl;
      class ServiceImpl implements com.example.api.Service {}
      ```

### 3. ⚠️ Gài: Lộ lớp **internal** qua `public` trong package API — rủi ro đối với người dùng thư viện.
- **Trả lời**:
    - **Rủi ro**: Client phụ thuộc vào internal class, phá hợp đồng API.
    - **Khắc phục**: Dùng package-private hoặc package riêng cho internal.
    - **Ví dụ**:
      ```java
      package com.example.api;
      public class Internal {} // Xấu, lộ internal
      ```

---

## 16) Mini case (thực chiến 2–5 phút/câu)

### 1. Bạn có hai thư viện đều chứa lớp `com.example.util.Strings`. Hãy trình bày 3 cách loại bỏ mơ hồ khi sử dụng.
- **Trả lời**:
    - **Cách 1: FQCN**:
      ```java
      com.example.util.Strings s1; // Thư viện 1
      org.other.util.Strings s2; // Thư viện 2
      ```
    - **Cách 2: Import cụ thể**:
      ```java
      import com.example.util.Strings;
      Strings s; // Chỉ dùng lớp này
      ```
    - **Cách 3: Adapter**:
      ```java
      class MyStrings {
          private com.example.util.Strings delegate;
      }
      ```

### 2. Ứng dụng Monorepo: tổ chức packages theo **feature** để giảm phụ thuộc vòng—đưa ra sơ đồ mẫu và nguyên tắc import.
- **Trả lời**:
    - **Sơ đồ**:
      ```
      com.example
      ├── order
      │   ├── api (Order, OrderService)
      │   ├── impl (OrderServiceImpl)
      │   └── model (OrderDTO)
      ├── payment
      │   ├── api
      │   ├── impl
      │   └── model
      ```
    - **Nguyên tắc**:
        - Chỉ import từ `api` hoặc `model` của feature khác.
        - Không import `impl` giữa các feature.

### 3. Tích hợp Java 17 modules: gói `com.acme.internal` cần reflection bởi Jackson trong test—trình bày cấu hình `opens` an toàn.
- **Trả lời**:
  ```java
  module com.acme {
      opens com.acme.internal to com.fasterxml.jackson.databind;
  }
  // Hoặc runtime
  java --add-opens com.acme/com.acme.internal=com.fasterxml.jackson.databind
  ```

### 4. Refactor hệ thống đổi domain từ `com.startup` sang `io.product`: kế hoạch cutover, kiểm tra tài nguyên & serialization.
- **Trả lời**:
    - **Kế hoạch**:
        - Dùng IDE refactor package.
        - Cập nhật `src/main/resources`, `package-info.java`.
        - Giữ `serialVersionUID` cho serialization.
        - Chạy test suite để kiểm tra.
    - **Serialization**:
      ```java
      class MyClass implements Serializable {
          private static final long serialVersionUID = 1L;
          private Object readResolve() { return new io.product.MyClass(); }
      }
      ```

### 5. Đóng gói JAR **sealed** cho package `com.acme.crypto` để ngăn can thiệp — nêu tác dụng phụ có thể gặp trong môi trường plugin.
- **Trả lời**:
  ```java
  // MANIFEST.MF
  Name: com.acme.crypto
  Sealed: true
  ```
    - **Tác dụng phụ**:
        - Plugin không thể thêm class vào `com.acme.crypto`.
        - Gây `SecurityException` nếu plugin cố gắng.
    - **Khắc phục**: Dùng package khác cho plugin hoặc bỏ sealing.

---

