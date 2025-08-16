## 1) Khái niệm & Tổng quan

### 1. Annotation là gì? Dùng để làm gì ở **compile-time** và **runtime**?
- **Trả lời**:
    - **Annotation**: Metadata gắn vào code (class, method, field,...) để cung cấp thông tin bổ sung.
    - **Compile-time**: Xử lý bởi annotation processor để sinh mã, kiểm tra quy ước (ví dụ: `@Override`).
    - **Runtime**: Đọc qua reflection để điều khiển hành vi (ví dụ: `@JsonProperty` trong Jackson).
    - **Ví dụ**:
      ```java
      @Override
      void myMethod() {} // Compile-time check
      ```

### 2. Sự khác nhau giữa **metadata** qua annotation và **marker interface**/comment/Javadoc.
- **Trả lời**:
    - **Annotation**: Metadata có cấu trúc, hỗ trợ thuộc tính, xử lý compile-time/runtime.
    - **Marker interface**: Chỉ đánh dấu type, kiểm tra bằng `instanceof`, không có thuộc tính.
    - **Comment/Javadoc**: Chỉ tài liệu hóa, không xử lý tự động.
    - **Ví dụ**:
      ```java
      @interface MyAnn { String value(); } // Có thuộc tính
      interface Marker {} // Không thuộc tính
      ```

### 3. ⚠️ Gài: Annotation có “kế thừa” nhau không? Có thể `extends` annotation khác không?
- **Trả lời**:
    - **Không kế thừa**: Annotation không hỗ trợ `extends` lẫn nhau.
    - **Meta-annotation**: Dùng annotation khác để annotate (ví dụ: `@Component` trên `@Service`).
    - **Ví dụ**:
      ```java
      @Component
      public @interface Service {} // Meta-annotation, không phải kế thừa
      ```

### 4. Liệt kê **meta-annotations** chuẩn và vai trò của từng cái: `@Retention`, `@Target`, `@Documented`, `@Inherited`, `@Repeatable`.
- **Trả lời**:
    - **`@Retention`**: Xác định vòng đời của annotation (`SOURCE`, `CLASS`, `RUNTIME`).
    - **`@Target`**: Chỉ định vị trí áp dụng (class, method, field,...).
    - **`@Documented`**: Đưa annotation vào Javadoc.
    - **`@Inherited`**: Cho phép annotation trên class cha áp dụng cho class con.
    - **`@Repeatable`**: Cho phép lặp lại annotation trên cùng một mục tiêu.

### 5. Ví dụ các annotation chuẩn trong JDK: `@Override`, `@Deprecated`, `@FunctionalInterface`, `@SuppressWarnings`.
- **Trả lời**:
    - **`@Override`**: Đảm bảo method override đúng.
    - **`@Deprecated`**: Đánh dấu code không nên dùng.
    - **`@FunctionalInterface`**: Đảm bảo interface là SAM.
    - **`@SuppressWarnings`**: Tắt cảnh báo compiler.
    - **Ví dụ**:
      ```java
      @Override
      public String toString() { return "test"; }
      ```

---

## 2) `@Retention` & `@Target`

### 1. So sánh `RetentionPolicy.SOURCE`, `CLASS`, `RUNTIME`: hiệu ứng tới **class file** và **reflection**.
- **Trả lời**:
    - **`SOURCE`**: Chỉ giữ trong source, bỏ trong class file, không đọc được qua reflection (ví dụ: `@Override`).
    - **`CLASS`**: Lưu trong class file, nhưng không đọc được qua reflection trừ khi dùng bytecode tools.
    - **`RUNTIME`**: Lưu trong class file, đọc được qua reflection.
    - **Ví dụ**:
      ```java
      @Retention(RetentionPolicy.RUNTIME)
      @interface MyAnn {}
      ```

### 2. `@Target` có những `ElementType` nào? (TYPE, METHOD, FIELD, PARAMETER, CONSTRUCTOR, PACKAGE, MODULE, TYPE_USE, TYPE_PARAMETER...)
- **Trả lời**:
    - **`TYPE`**: Class, interface, enum.
    - **`METHOD`**, **`FIELD`**, **`PARAMETER`**, **`CONSTRUCTOR`**: Các thành phần tương ứng.
    - **`PACKAGE`**: File `package-info.java`.
    - **`MODULE`**: File `module-info.java`.
    - **`TYPE_USE`**: Gắn vào kiểu (generic, cast).
    - **`TYPE_PARAMETER`**: Gắn vào type parameter.

### 3. ⚠️ Gài: Annotation `SOURCE` có thể đọc được bằng reflection không? Vì sao IDE vẫn “biết”?
- **Trả lời**:
    - **Không đọc được**: `SOURCE` bị bỏ trong class file.
    - **IDE biết**: IDE phân tích source code trực tiếp, không cần reflection.
    - **Ví dụ**:
      ```java
      @Override // IDE kiểm tra, không cần reflection
      void myMethod() {}
      ```

### 4. Khi nào cần `TYPE_USE` và `TYPE_PARAMETER` (JSR 308)? Ví dụ gắn annotation vào generic type.
- **Trả lời**:
    - **`TYPE_USE`**: Gắn vào vị trí sử dụng kiểu (generic, cast, `throws`).
    - **`TYPE_PARAMETER`**: Gắn vào khai báo type parameter.
    - **Ví dụ**:
      ```java
      @interface NonNull {}
      List<@NonNull String> list;
      class Box<@NonNull T> {}
      ```

### 5. Có thể đặt **nhiều** `ElementType` cho một annotation không? Công dụng thực tế.
- **Trả lời**:
    - **Có thể**: Đặt nhiều `ElementType` trong `@Target`.
    - **Công dụng**: Annotation linh hoạt, áp dụng nhiều vị trí (ví dụ: `@NotNull` trên field, parameter).
    - **Ví dụ**:
      ```java
      @Target({ElementType.FIELD, ElementType.PARAMETER})
      @interface MyAnn {}
      ```

---

## 3) Khai báo & cấu trúc annotation

### 1. Cú pháp tạo annotation: `public @interface MyAnn { ... }`.
- **Trả lời**:
  ```java
  public @interface MyAnn {
      String value();
      int priority() default 0;
  }
  ```

### 2. Kiểu dữ liệu hợp lệ cho phần tử (element) của annotation: primitives, `String`, `Class`, enum, annotation khác, **array** của các kiểu trên.
- **Trả lời**:
    - **Hợp lệ**: `int`, `String`, `Class<?>`, `enum`, annotation, hoặc mảng của chúng.
    - **Ví dụ**:
      ```java
      @interface MyAnn {
          String name();
          Class<?> type();
          String[] tags();
      }
      ```

### 3. ⚠️ Gài: Có thể dùng `null` làm giá trị mặc định của element không? Vì sao phải chọn sentinels (ví dụ chuỗi rỗng)?
- **Trả lời**:
    - **Không thể**: `null` không phải constant expression.
    - **Sentinel**: Dùng giá trị đặc biệt (chuỗi rỗng, `-1`) để thay thế `null`.
    - **Lý do**: Đảm bảo tính bất biến và rõ ràng.
    - **Ví dụ**:
      ```java
      @interface MyAnn {
          String name() default "";
      }
      ```

### 4. Khai báo **giá trị mặc định** bằng `default`. Quy tắc “constant expression”.
- **Trả lời**:
    - **Default**: Phải là hằng số compile-time (primitives, `String`, `Class`, enum).
    - **Ví dụ**:
      ```java
      @interface MyAnn {
          int priority() default 1;
          String name() default "default";
      }
      ```

### 5. Quy ước đặc biệt với phần tử tên `value()` và cách viết rút gọn khi chỉ truyền `value`.
- **Trả lời**:
    - **Quy ước**: Nếu chỉ truyền `value`, có thể bỏ tên `value`.
    - **Ví dụ**:
      ```java
      @interface MyAnn { String value(); }
      @MyAnn("test") // Rút gọn
      class Test {}
      ```

---

## 4) Lặp lại & kế thừa annotation

### 1. `@Repeatable` hoạt động như thế nào? **Container annotation** là gì và được sinh ở đâu?
- **Trả lời**:
    - **`@Repeatable`**: Cho phép lặp lại annotation trên cùng mục tiêu.
    - **Container annotation**: Annotation tự động sinh để chứa danh sách các annotation lặp lại.
    - **Ví dụ**:
      ```java
      @Repeatable(Authors.class)
      @interface Author { String name(); }
      @interface Authors { Author[] value(); }
      ```

### 2. Cách lấy annotation lặp lại qua reflection: `getAnnotationsByType` vs `getAnnotation`.
- **Trả lời**:
    - **`getAnnotationsByType`**: Lấy tất cả annotation lặp lại trực tiếp.
    - **`getAnnotation`**: Lấy container annotation.
    - **Ví dụ**:
      ```java
      Author[] authors = clazz.getAnnotationsByType(Author.class);
      ```

### 3. ⚠️ Gài: `@Inherited` áp dụng cho **class** hay cả method/field? Ảnh hưởng thực tế.
- **Trả lời**:
    - **Chỉ class**: `@Inherited` chỉ áp dụng cho class, không cho method/field.
    - **Ảnh hưởng**: Subclass kế thừa annotation của superclass.
    - **Ví dụ**:
      ```java
      @Inherited
      @interface MyAnn {}
      @MyAnn class Parent {}
      class Child extends Parent {} // Child có @MyAnn
      ```

### 4. Khi override method ở subclass, annotation trên method cha có “chảy xuống” không? Khi nào phải gắn lại?
- **Trả lời**:
    - **Không chảy xuống**: Annotation trên method không được kế thừa.
    - **Gắn lại**: Khi subclass override method và cần annotation.
    - **Ví dụ**:
      ```java
      class Parent { @MyAnn void method() {} }
      class Child extends Parent { void method() {} } // Không có @MyAnn
      ```

---

## 5) Reflection & truy xuất annotation

### 1. Dùng reflection để lấy annotation trên **class**, **field**, **method**, **parameter**. Khác biệt `getAnnotations` vs `getDeclaredAnnotations`.
- **Trả lời**:
    - **Lấy annotation**:
      ```java
      Annotation[] classAnns = clazz.getAnnotations();
      Annotation[] fieldAnns = field.getAnnotations();
      Annotation[] methodAnns = method.getAnnotations();
      Annotation[] paramAnns = method.getParameterAnnotations()[0];
      ```
    - **`getAnnotations`**: Lấy tất cả annotation, kể cả kế thừa.
    - **`getDeclaredAnnotations`**: Chỉ lấy annotation khai báo trực tiếp.

### 2. Truy xuất annotation ở **tham số phương thức** (`Parameter` API) và ở **type use** (qua `AnnotatedType`).
- **Trả lời**:
    - **Parameter**:
      ```java
      Parameter param = method.getParameters()[0];
      Annotation[] anns = param.getAnnotations();
      ```
    - **Type use**:
      ```java
      AnnotatedType type = field.getAnnotatedType();
      Annotation[] anns = type.getAnnotations();
      ```

### 3. ⚠️ Gài: Tại sao lấy annotation RUNTIME trên **interface** có thể nhìn thấy từ class **implements**? Có phải do `@Inherited`?
- **Trả lời**:
    - **Lý do**: Reflection trả về tất cả annotation trên interface mà class implements.
    - **Không do `@Inherited`**: `@Inherited` chỉ áp dụng cho class hierarchy.
    - **Ví dụ**:
      ```java
      @Retention(RetentionPolicy.RUNTIME)
      @interface MyAnn {}
      @MyAnn interface I {}
      class C implements I {}
      C.class.getAnnotation(MyAnn.class); // Lấy được
      ```

### 4. So sánh chi phí hiệu năng khi đọc annotation bằng reflection, cách **cache** để giảm overhead.
- **Trả lời**:
    - **Chi phí**: Reflection chậm, đặc biệt khi lặp lại nhiều lần.
    - **Cache**:
      ```java
      static Map<Class<?>, Annotation[]> cache = new ConcurrentHashMap<>();
      Annotation[] getCachedAnnotations(Class<?> clazz) {
          return cache.computeIfAbsent(clazz, Class::getAnnotations);
      }
      ```

---

## 6) Processing ở compile-time (APT)

### 1. Annotation Processing là gì? Vai trò của `javax.annotation.processing.Processor`.
- **Trả lời**:
    - **APT**: Xử lý annotation trong source code để sinh mã hoặc kiểm tra quy ước.
    - **`Processor`**: Interface để định nghĩa logic xử lý annotation.
    - **Ví dụ**: Lombok dùng APT để sinh getter/setter.

### 2. Dòng chảy APT: từ **source** → **rounds** → sinh mã (Filer) → compile tiếp.
- **Trả lời**:
    - **Source**: Quét source code để tìm annotation.
    - **Rounds**: Processor xử lý từng vòng, sinh mã qua `Filer`.
    - **Compile tiếp**: Mã sinh ra được biên dịch cùng source.

### 3. ⚠️ Gài: Annotation có `RetentionPolicy.RUNTIME` có cần thiết để APT đọc được không?
- **Trả lời**:
    - **Không cần**: APT đọc trực tiếp source, không phụ thuộc `Retention`.
    - **Ví dụ**:
      ```java
      @Retention(RetentionPolicy.SOURCE)
      @interface MyAnn {} // APT vẫn đọc được
      ```

### 4. Sự khác nhau giữa xử lý **compile-time** (APT) và **runtime** (reflection).
- **Trả lời**:
    - **Compile-time (APT)**: Xử lý source, sinh mã, kiểm tra quy ước, không có overhead runtime.
    - **Runtime (reflection)**: Đọc annotation lúc chạy, điều khiển hành vi, tốn hiệu năng.
    - **Ví dụ**: APT (Lombok), Reflection (Spring).

### 5. Khi nào nên viết **annotation processor**: kiểm tra quy ước, sinh builder/mapper, validate contract.
- **Trả lời**:
    - **Khi nào**:
        - Kiểm tra quy ước (ví dụ: `@Immutable`).
        - Sinh mã (builder, mapper).
        - Validate hợp đồng (Bean Validation).
    - **Ví dụ**: Lombok sinh getter/setter.

---

## 7) Type Annotations (JSR 308)

### 1. Ví dụ dùng `@NonNull List<@Email String>`: lợi ích so với chỉ gắn trên declaration.
- **Trả lời**:
    - **Lợi ích**: Kiểm tra chi tiết hơn (mỗi phần tử trong `List` phải `@Email`).
    - **Ví dụ**:
      ```java
      @interface NonNull {}
      @interface Email {}
      @NonNull List<@Email String> emails;
      ```

### 2. `ElementType.TYPE_USE` mở ra những vị trí gắn nào (mã generic, mảng, cast, `throws`, `implements`)?
- **Trả lời**:
    - **Vị trí**:
        - Generic: `List<@NonNull String>`.
        - Mảng: `String @NonNull []`.
        - Cast: `(@NonNull String) obj`.
        - `throws`: `throws @NonNull IOException`.
        - `implements`: `implements @NonNull Comparable`.

### 3. ⚠️ Gài: Trình biên dịch có **bắt buộc** thực thi ý nghĩa của type annotations (ví dụ null-safety) không? Cần gì để có tác dụng?
- **Trả lời**:
    - **Không bắt buộc**: Compiler chỉ ghi nhận, không thực thi ý nghĩa.
    - **Cần**: Annotation processor (Checker Framework) hoặc công cụ tĩnh.
    - **Ví dụ**: Checker Framework kiểm tra `@NonNull`.

### 4. Tương tác với công cụ tĩnh (Checker Framework/SpotBugs): cơ chế hoạt động tổng quát.
- **Trả lời**:
    - **Cơ chế**: Công cụ tĩnh quét source, kiểm tra annotation, báo lỗi nếu vi phạm (ví dụ: `@NonNull` bị gán `null`).
    - **Ví dụ**: Checker Framework kiểm tra null-safety.

---

## 8) Annotation chuẩn trong JDK — chi tiết

### 1. `@Override`: compiler kiểm tra điều gì? Trường hợp `@Override` trên interface method trong JDK cũ vs mới.
- **Trả lời**:
    - **Kiểm tra**: Đảm bảo method override method cha hoặc implement interface method.
    - **JDK cũ**: Không cho phép `@Override` trên interface method (trước Java 6).
    - **JDK mới**: Cho phép, vì interface method có thể override.

### 2. `@Deprecated`: thuộc tính `since`, `forRemoval` dùng khi nào?
- **Trả lời**:
    - **`since`**: Chỉ định phiên bản bắt đầu deprecated.
    - **`forRemoval`**: Đánh dấu sẽ xóa trong tương lai.
    - **Ví dụ**:
      ```java
      @Deprecated(since = "1.8", forRemoval = true)
      void oldMethod() {}
      ```

### 3. `@SuppressWarnings`: các **key** thường dùng (`unchecked`, `deprecation`, `rawtypes`); phạm vi ảnh hưởng.
- **Trả lời**:
    - **Key**:
        - `unchecked`: Tắt cảnh báo generic không kiểm tra.
        - `deprecation`: Tắt cảnh báo deprecated.
        - `rawtypes`: Tắt cảnh báo raw type.
    - **Phạm vi**: Chỉ áp dụng scope nhỏ nhất (method, biến).
    - **Ví dụ**:
      ```java
      @SuppressWarnings("unchecked")
      List list = new ArrayList();
      ```

### 4. ⚠️ Gài: Lạm dụng `@SuppressWarnings("unchecked")` có thể che giấu lỗi gì liên quan generics?
- **Trả lời**:
    - **Lỗi che giấu**: `ClassCastException` runtime do dùng sai kiểu generic.
    - **Ví dụ**:
      ```java
      @SuppressWarnings("unchecked")
      List<String> list = (List<String>) new ArrayList<Integer>(); // Lỗi runtime
      ```

---

## 9) Annotations phổ biến ngoài JDK (tư duy phỏng vấn)

### 1. Bean Validation (`@NotNull`, `@Email`, `@Size`…): chạy ở đâu, cần `@Validated`/`@Valid` trong Spring?
- **Trả lời**:
    - **Chạy**: Runtime, qua Bean Validation (Hibernate Validator).
    - **`@Validated`/`@Valid`**: Kích hoạt validation trên controller hoặc bean.
    - **Ví dụ**:
      ```java
      @Validated
      class UserController {
          void create(@Valid UserDTO dto) {}
      }
      ```

### 2. Jackson (`@JsonProperty`, `@JsonIgnore`, `@JsonCreator`): mapping tên trường và constructor.
- **Trả lời**:
    - **`@JsonProperty`**: Map tên JSON với field/method.
    - **`@JsonIgnore`**: Bỏ qua field khi serialize/deserialize.
    - **`@JsonCreator`**: Chỉ định constructor/factory cho deserialization.
    - **Ví dụ**:
      ```java
      class User {
          @JsonProperty("user_name") String name;
      }
      ```

### 3. Lombok (`@Getter`, `@Builder`): hoạt động ở compile-time kiểu gì (annotation processor).
- **Trả lời**:
    - **Cơ chế**: Lombok dùng APT để sinh mã (getter, builder) trong source.
    - **Ví dụ**:
      ```java
      @Getter
      class User { private String name; } // Sinh getName()
      ```

### 4. ⚠️ Gài: Tại sao đổi tên field nhưng **quên** cập nhật `@JsonProperty` có thể phá tương thích JSON?
- **Trả lời**:
    - **Lý do**: `@JsonProperty` ánh xạ tên JSON, nếu field đổi tên mà không cập nhật, JSON không map đúng.
    - **Ví dụ**:
      ```java
      class User {
          @JsonProperty("name") String userName; // JSON chờ "name"
      } // Đổi thành firstName, JSON vẫn cần "name"
      ```

---

## 10) Meta-annotations nâng cao & composition

### 1. Dùng annotation này **meta-annotate** annotation khác để tạo **stereotype** (ví dụ Spring `@Service` meta-annotate `@Component`).
- **Trả lời**:
    - **Stereotype**: Kết hợp nhiều annotation thành một (ví dụ: `@Service` kế thừa `@Component`).
    - **Ví dụ**:
      ```java
      @Component
      public @interface Service {}
      ```

### 2. `@AliasFor` (trong Spring) giải quyết vấn đề gì khi **liên kết** thuộc tính giữa các annotation?
- **Trả lời**:
    - **`@AliasFor`**: Liên kết thuộc tính giữa meta-annotation và annotation chính.
    - **Ví dụ**:
      ```java
      @Component
      public @interface Service {
          @AliasFor(annotation = Component.class, attribute = "value")
          String value() default "";
      }
      ```

### 3. ⚠️ Gài: Hai annotation meta-annotate chéo nhau gây **mơ hồ** thuộc tính — nhận diện & tránh như thế nào?
- **Trả lời**:
    - **Mơ hồ**: Khi hai annotation có thuộc tính trùng tên không rõ ràng.
    - **Tránh**: Dùng `@AliasFor` hoặc đặt tên thuộc tính khác nhau.
    - **Ví dụ**:
      ```java
      @interface Ann1 { String value(); }
      @interface Ann2 { @AliasFor(annotation = Ann1.class, attribute = "value") String name(); }
      ```

### 4. Chiến lược đặt **default** thông minh để giảm noise khi dùng nhiều annotation chồng.
- **Trả lời**:
    - **Chiến lược**:
        - Dùng giá trị mặc định hợp lý (chuỗi rỗng, `0`).
        - Dùng `value()` để rút gọn cú pháp.
    - **Ví dụ**:
      ```java
      @interface MyAnn { String value() default ""; }
      @MyAnn // Không cần value
      class Test {}
      ```

---

## 11) Package/Module-level annotations

### 1. Đặt annotation ở **package** trong `package-info.java` — use case (API docs, constraints).
- **Trả lời**:
    - **Use case**: Tài liệu hóa package, đặt constraint (ví dụ: `@NonNullByDefault`).
    - **Ví dụ**:
      ```java
      // package-info.java
      @NonNullByDefault
      package com.example;
      ```

### 2. Gắn annotation lên **module** trong `module-info.java`: khi nào hữu ích?
- **Trả lời**:
    - **Hữu ích**: Định nghĩa metadata cho module (ví dụ: version, dependency).
    - **Ví dụ**:
      ```java
      // module-info.java
      @ModuleInfo(version = "1.0")
      module com.example {}
      ```

### 3. ⚠️ Gài: Đặt annotation ở package có “phủ” lên các class con cùng package không? Cần gì để truy xuất?
- **Trả lời**:
    - **Không phủ**: Package annotation không tự động áp dụng cho class.
    - **Truy xuất**: Dùng `Package.getAnnotations()`.
    - **Ví dụ**:
      ```java
      Package pkg = Package.getPackage("com.example");
      Annotation[] anns = pkg.getAnnotations();
      ```

---

## 12) Hạn chế, tương thích & bẫy thường gặp

### 1. Annotation elements phải là **compile-time constant**: vì sao không thể đặt `new ArrayList<>()` hay `LocalDate.now()`?
- **Trả lời**:
    - **Lý do**: Annotation yêu cầu giá trị bất biến tại compile-time để đảm bảo tính xác định.
    - **Ví dụ**:
      ```java
      @interface MyAnn {
          String value() default "test"; // OK
          List<String> list() default new ArrayList<>(); // Lỗi
      }
      ```

### 2. Không có `null` trong element: kỹ thuật sentinel/`Optional`-like thay thế.
- **Trả lời**:
    - **Kỹ thuật**: Dùng chuỗi rỗng, `-1`, hoặc enum đặc biệt.
    - **Ví dụ**:
      ```java
      @interface MyAnn {
          String name() default "";
      }
      ```

### 3. ⚠️ Gài: Thứ tự phần tử **array** trong annotation có quan trọng không (đối với `equals`/`hashCode` của annotation)?
- **Trả lời**:
    - **Quan trọng**: `equals`/`hashCode` của annotation dựa trên nội dung mảng, không thứ tự.
    - **Ví dụ**:
      ```java
      @interface MyAnn { String[] value(); }
      @MyAnn({"a", "b"}) class A {}
      @MyAnn({"b", "a"}) class B {} // equals true
      ```

### 4. Binary compatibility: thay đổi **giá trị hằng số** trong annotation lib có thể không phản ánh ở client nếu không **recompile** — vì sao?
- **Trả lời**:
    - **Lý do**: Giá trị hằng số được inline vào bytecode client, không recompile thì dùng giá trị cũ.
    - **Ví dụ**:
      ```java
      @interface MyAnn { int value() default 10; }
      // Client: @MyAnn // Inline thành 10
      // Lib đổi value = 20, client vẫn thấy 10 nếu không recompile
      ```

---

## 13) Thiết kế annotation tốt

### 1. Tiêu chí: rõ mục tiêu, minimal surface, default hợp lý, tài liệu hóa (`@Documented`).
- **Trả lời**:
    - **Rõ mục tiêu**: Chỉ định rõ chức năng (validation, config).
    - **Minimal surface**: Giữ ít element, tránh phức tạp.
    - **Default hợp lý**: Giảm boilerplate.
    - **Tài liệu hóa**: Dùng `@Documented` để đưa vào Javadoc.

### 2. Cân nhắc `RUNTIME` vs `CLASS`: **chỉ** bật `RUNTIME` khi cần phản chiếu.
- **Trả lời**:
    - **`RUNTIME`**: Khi cần reflection (Spring, Jackson).
    - **`CLASS`**: Khi chỉ cần bytecode tools hoặc APT.
    - **Ví dụ**:
      ```java
      @Retention(RetentionPolicy.RUNTIME)
      @interface MyAnn {} // Dùng reflection
      ```

### 3. ⚠️ Gài: Biến annotation thành “cấu hình mini-language” quá phức tạp có mùi gì? Khi nào nên chuyển sang code/builder JSON/YAML.
- **Trả lời**:
    - **Mùi**: Tăng độ phức tạp, khó debug, mất type-safety.
    - **Chuyển sang code/JSON/YAML**: Khi cần cấu hình động hoặc phức tạp.
    - **Ví dụ**: Thay `@Config(a=1, b=2)` bằng JSON file.

### 4. Tên element `value` vs nhiều element có tên: quy ước nhất quán giúp đọc/viết gọn.
- **Trả lời**:
    - **`value`**: Dùng khi chỉ cần một thuộc tính chính, rút gọn cú pháp.
    - **Nhiều element**: Dùng khi cần nhiều thuộc tính rõ ràng.
    - **Ví dụ**:
      ```java
      @interface MyAnn { String value(); int priority() default 0; }
      @MyAnn("test") // Rút gọn
      ```

---

## 14) Hiệu năng & bảo mật

### 1. Overhead đọc annotation runtime: khi nào cần **cache** (Map\<Class\<?>, AnnInfo>)?
- **Trả lời**:
    - **Overhead**: Reflection chậm khi đọc lặp lại.
    - **Cache**: Khi annotation không thay đổi, lưu vào `Map`.
    - **Ví dụ**:
      ```java
      Map<Class<?>, Annotation[]> cache = new ConcurrentHashMap<>();
      Annotation[] getAnnotations(Class<?> clazz) {
          return cache.computeIfAbsent(clazz, Class::getAnnotations);
      }
      ```

### 2. Ảnh hưởng module system (Java 9+) tới **reflective access** annotation trên **private**/non-exported packages.
- **Trả lời**:
    - **Ảnh hưởng**: Module system giới hạn truy cập private/non-exported.
    - **Khắc phục**: Mở module bằng `exports` hoặc `open`.
    - **Ví dụ**:
      ```java
      module com.example {
          opens com.example to java.base;
      }
      ```

### 3. ⚠️ Gài: Rủi ro bảo mật khi dựa vào annotation để **bật tính năng** mà không kiểm tra quyền/role ở runtime.
- **Trả lời**:
    - **Rủi ro**: Hacker có thể bypass bằng cách inject annotation giả.
    - **Khắc phục**: Kiểm tra quyền/role runtime.
    - **Ví dụ**:
      ```java
      @Role("admin")
      void restricted() {
          if (!hasRole("admin")) throw new SecurityException();
      }
      ```

---

## 15) Mini case (thực chiến 2–5 phút/câu)

### 1. Thiết kế `@Audit(action, actorField)` để tự động log trước/sau khi gọi service; xác định `@Target`, `@Retention`, cách lấy **actor** bằng reflection.
- **Trả lời**:
  ```java
  @Retention(RetentionPolicy.RUNTIME)
  @Target(ElementType.METHOD)
  @interface Audit {
      String action();
      String actorField();
  }
  // Reflection
  Method method = clazz.getMethod("serviceMethod");
  Audit audit = method.getAnnotation(Audit.class);
  String actor = (String) clazz.getField(audit.actorField()).get(instance);
  ```

### 2. Viết `@Trimmed` (TYPE_USE) để **normalize** `String` khi binding request → DTO; phác thảo chỗ cắm processor/filter.
- **Trả lời**:
  ```java
  @Retention(RetentionPolicy.RUNTIME)
  @Target(ElementType.TYPE_USE)
  @interface Trimmed {}
  class DTO {
      @Trimmed String name;
  }
  // Filter (Spring)
  @Component
  class TrimmedFilter implements WebDataBinder {
      void bind(PropertyValues pvs) {
          // Trim String fields annotated with @Trimmed
      }
  }
  ```

### 3. Chuyển các flag boolean rải rác thành một annotation `@FeatureToggle("key")` đọc từ config; bàn về **RUNTIME vs CLASS**.
- **Trả lời**:
  ```java
  @Retention(RetentionPolicy.RUNTIME)
  @Target(ElementType.METHOD)
  @interface FeatureToggle { String key(); }
  // Reflection
  if (method.isAnnotationPresent(FeatureToggle.class)) {
      String key = method.getAnnotation(FeatureToggle.class).key();
      if (!config.isEnabled(key)) return;
  }
  // RUNTIME: Cần để đọc config lúc chạy
  ```

### 4. Xây `@Email` tuỳ biến dùng Bean Validation: định nghĩa element, `ConstraintValidator`, thông điệp i18n.
- **Trả lời**:
  ```java
  @Retention(RetentionPolicy.RUNTIME)
  @Target(ElementType.FIELD)
  @Constraint(validatedBy = EmailValidator.class)
  @interface Email {
      String message() default "{invalid.email}";
      Class<?>[] groups() default {};
      Class<? extends Payload>[] payload() default {};
  }
  class EmailValidator implements ConstraintValidator<Email, String> {
      @Override
      public boolean isValid(String value, ConstraintValidatorContext ctx) {
          return value != null && value.matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$");
      }
  }
  ```

### 5. Chuẩn hóa REST error bằng annotation `@Problem(status, code)` đặt trên exception; design cách **mapping** → `ResponseEntity`.
- **Trả lời**:
  ```java
  @Retention(RetentionPolicy.RUNTIME)
  @Target(ElementType.TYPE)
  @interface Problem { int status(); String code(); }
  @Problem(status = 400, code = "INVALID")
  class InvalidRequestException extends RuntimeException {}
  // ExceptionHandler
  @ExceptionHandler(InvalidRequestException.class)
  ResponseEntity<?> handle(InvalidRequestException e) {
      Problem p = e.getClass().getAnnotation(Problem.class);
      return ResponseEntity.status(p.status()).body(new ErrorResponse(p.code()));
  }
  ```

### 6. Debug lỗi: `@Repeatable` không lấy được đủ annotations bằng reflection — liệt kê chỗ có thể sai (container, retention, API gọi).
- **Trả lời**:
    - **Sai container**: Container annotation không khai báo đúng (`@Repeatable` trỏ sai).
    - **Sai retention**: Container hoặc annotation chính không phải `RUNTIME`.
    - **Sai API**: Dùng `getAnnotation` thay vì `getAnnotationsByType`.
    - **Ví dụ sửa**:
      ```java
      @Repeatable(Authors.class)
      @interface Author { String name(); }
      @Retention(RetentionPolicy.RUNTIME)
      @interface Authors { Author[] value(); }
      Author[] authors = clazz.getAnnotationsByType(Author.class);
      ```

---

