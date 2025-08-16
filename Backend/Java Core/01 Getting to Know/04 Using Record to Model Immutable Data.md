## 1) Khái niệm & Mục tiêu của Record

### 1. Record là gì? Khác gì với POJO/JavaBean truyền thống về mục tiêu thiết kế.
- **Trả lời**:
    - **Record**: Một loại lớp đặc biệt (Java 14+, chính thức từ Java 16) để mô hình hóa dữ liệu bất biến, trong suốt (transparent data carriers). Record tự động sinh các thành phần như `equals()`, `hashCode()`, `toString()`, và accessor.
    - **Khác với POJO/JavaBean**:
        - **Mục tiêu thiết kế**:
            - **Record**: Tối ưu cho dữ liệu bất biến, giảm boilerplate, hợp đồng bất biến được đảm bảo bởi ngôn ngữ.
            - **POJO/JavaBean**: Linh hoạt hơn, thường dùng cho dữ liệu có thể thay đổi, yêu cầu getter/setter thủ công hoặc dùng Lombok.
        - **Khác biệt cụ thể**:
            - Record là `final`, không cần viết `equals()`, `hashCode()`.
            - POJO thường có setter, hỗ trợ trạng thái thay đổi.
    - **Ví dụ**:
      ```java
      record Point(int x, int y) {} // Tự động bất biến, equals, hashCode, toString
      class PointPOJO {
          private int x, y;
          public int getX() { return x; } // Cần viết thủ công
      }
      ```

### 2. Khi nào nên dùng record để mô hình dữ liệu bất biến? Liệt kê 3 tình huống điển hình.
- **Trả lời**:
    - **Khi dùng**:
        - Dữ liệu cần **bất biến** và **trong suốt** (chỉ lưu trữ, không thay đổi).
        - Muốn giảm boilerplate cho `equals()`, `hashCode()`, `toString()`.
    - **3 tình huống điển hình**:
        1. **DTO (Data Transfer Object)**: Chuyển dữ liệu giữa các tầng (ví dụ: API response).
        2. **Value Object**: Biểu diễn giá trị bất biến (ví dụ: `Money`, `Point`).
        3. **Event Payload**: Dữ liệu sự kiện trong hệ thống (ví dụ: `UserCreatedEvent`).

### 3. ⚠️ Gài: Record có tự động đảm bảo “bất biến sâu” (deep immutability) không? Giải thích.
- **Trả lời**:
    - **Không đảm bảo bất biến sâu**: Record chỉ đảm bảo **shallow immutability** (các field là `final`, không thay đổi tham chiếu).
    - **Giải thích**:
        - Nếu component là mutable (ví dụ: `List`, `Date`), trạng thái bên trong vẫn có thể thay đổi.
        - Cần **defensive copy** hoặc `unmodifiable` view để đảm bảo bất biến sâu.
    - **Ví dụ**:
      ```java
      record Order(List<String> items) {}
      Order order = new Order(new ArrayList<>(List.of("item1")));
      order.items().add("item2"); // Lỗi bất biến
      ```

---

## 2) Cú pháp & Thành phần Record

### 1. Cú pháp khai báo record cơ bản (`record Point(int x, int y) {}`) gồm những **components** nào?
- **Trả lời**:
    - **Components**: Các tham số trong khai báo record (ví dụ: `int x`, `int y`).
    - Mỗi component đại diện cho một **private final field** và có **accessor** tương ứng.
    - **Ví dụ**:
      ```java
      record Point(int x, int y) {} // Components: x, y
      ```

### 2. Mỗi component sinh ra những thành phần gì (field, accessor, `equals/hashCode/toString`, canonical constructor)?
- **Trả lời**:
    - Mỗi component tự động sinh:
        - **Private final field**: Lưu giá trị (ví dụ: `private final int x`).
        - **Public accessor**: Tên trùng component (ví dụ: `x()` thay vì `getX()`).
        - **Canonical constructor**: Gán tất cả components.
        - **`equals()`**: So sánh tất cả components.
        - **`hashCode()`**: Tính hash dựa trên components.
        - **`toString()`**: Chuỗi dạng `Point[x=1, y=2]`.
    - **Ví dụ**:
      ```java
      record Point(int x, int y) {}
      // Tự động sinh: private final int x, y; public int x(); public int y(); equals, hashCode, toString
      ```

### 3. ⚠️ Gài: Có thể khai báo **field instance bổ sung** ngoài components không? Nếu có/thì có ràng buộc gì?
- **Trả lời**:
    - **Có thể**: Record cho phép khai báo **instance fields** bổ sung, nhưng phải là `private final` và khởi tạo trong constructor.
    - **Ràng buộc**:
        - Không được dùng trong `equals()`, `hashCode()`, `toString()` (chỉ dựa vào components).
        - Phải được khởi tạo trong canonical hoặc compact constructor.
    - **Ví dụ**:
      ```java
      record Point(int x, int y) {
          private final String description = "Point at " + x + "," + y;
      }
      ```

### 4. Có thể thêm **static fields**, **static methods**, **nested types** trong record không?
- **Trả lời**:
    - **Có thể**:
        - **Static fields**: Lưu trạng thái toàn cục.
        - **Static methods**: Cung cấp utility hoặc factory.
        - **Nested types**: Static nested class hoặc interface.
    - **Ví dụ**:
      ```java
      record Point(int x, int y) {
          static int count = 0;
          static Point origin() { return new Point(0, 0); }
          static class Helper {}
      }
      ```

---

## 3) Tính bất biến & quản lý trạng thái

### 1. Vì sao record được xem là “bất biến theo hợp đồng” (shallow)?
- **Trả lời**:
    - **Shallow immutability**: Record đảm bảo các components là `final`, không thể gán lại tham chiếu.
    - **Hợp đồng**: Ngôn ngữ Java đảm bảo bất biến ở mức tham chiếu, nhưng không kiểm soát trạng thái của objects mutable.

### 2. ⚠️ Gài: `record Order(List<Item> items)`—trường hợp nào đối tượng **không thực sự bất biến**? Cách phòng vệ?
- **Trả lời**:
    - **Không thực sự bất biến**: Nếu `List<Item>` là mutable, trạng thái bên trong có thể thay đổi.
    - **Ví dụ lỗi**:
      ```java
      record Order(List<Item> items) {}
      Order order = new Order(new ArrayList<>());
      order.items().add(new Item()); // Phá bất biến
      ```
    - **Phòng vệ**:
        - **Defensive copy** trong constructor.
        - Trả về **unmodifiable view** trong accessor.
    - **Ví dụ sửa**:
      ```java
      record Order(List<Item> items) {
          public Order(List<Item> items) {
              this.items = List.copyOf(items); // Defensive copy
          }
          public List<Item> items() { return Collections.unmodifiableList(items); }
      }
      ```

### 3. Record có setter không? Nếu cần “thay đổi” dữ liệu, các chiến lược thay thế?
- **Trả lời**:
    - **Không có setter**: Record không cho phép thay đổi components.
    - **Chiến lược thay thế**:
        - Tạo record mới với giá trị cập nhật (`with` pattern).
        - Dùng **builder pattern** để tạo record mới.
    - **Ví dụ**:
      ```java
      record Point(int x, int y) {
          Point withX(int newX) { return new Point(newX, y); }
      }
      ```

---

## 4) Constructors: Canonical & Compact

### 1. Canonical constructor là gì? Chữ ký bắt buộc phải như thế nào?
- **Trả lời**:
    - **Canonical constructor**: Constructor mặc định của record, nhận tất cả components làm tham số và gán chúng.
    - **Chữ ký**: Phải khớp chính xác kiểu và thứ tự của components.
    - **Ví dụ**:
      ```java
      record Point(int x, int y) {
          public Point(int x, int y) { this.x = x; this.y = y; }
      }
      ```

### 2. Compact constructor khác gì canonical constructor đầy đủ tham số?
- **Trả lời**:
    - **Compact constructor**: Không khai báo tham số, không cần gán `this.x = x` (trình biên dịch tự động gán).
    - **Khác biệt**:
        - Canonical: Ghi rõ tham số và gán tường minh.
        - Compact: Chỉ chứa logic bổ sung (validation, normalization).
    - **Ví dụ**:
      ```java
      record Point(int x, int y) {
          public Point { if (x < 0) throw new IllegalArgumentException("x < 0"); }
      }
      ```

### 3. ⚠️ Gài: Trong compact constructor, có cần gán lại `this.x = x` không? Điều gì xảy ra nếu cố gán?
- **Trả lời**:
    - **Không cần gán**: Trình biên dịch tự động gán components trong compact constructor.
    - **Cố gán**: Lỗi biên dịch vì components là `final` và đã được gán.
    - **Ví dụ**:
      ```java
      record Point(int x, int y) {
          public Point { this.x = x; } // Lỗi biên dịch
      }
      ```

### 4. Thực hiện **validation/bình thường hoá** dữ liệu ở constructor như thế nào (ví dụ trim chuỗi, kiểm tra null)?
- **Trả lời**:
    - Dùng compact hoặc canonical constructor để validate/normalize.
    - **Ví dụ**:
      ```java
      record Email(String value) {
          public Email {
              if (value == null) throw new IllegalArgumentException("value null");
              value = value.trim().toLowerCase();
              if (!value.matches(".*@.*")) throw new IllegalArgumentException("Invalid email");
          }
      }
      ```

### 5. Có thể khai báo **additional constructors** (overloaded) trong record không? Yêu cầu gì?
- **Trả lời**:
    - **Có thể**: Record hỗ trợ constructor bổ sung, nhưng phải gọi canonical constructor (dùng `this(args)`).
    - **Yêu cầu**: Không được gán trực tiếp components, chỉ gọi canonical constructor.
    - **Ví dụ**:
      ```java
      record Point(int x, int y) {
          public Point(int x) { this(x, 0); }
      }
      ```

---

## 5) Phương thức & Override

### 1. Record tự động sinh `equals`, `hashCode`, `toString`—tiêu chí dựa trên đâu?
- **Trả lời**:
    - Dựa trên **tất cả components** của record.
    - **`equals`**: So sánh giá trị từng component.
    - **`hashCode`**: Tính hash từ tất cả components.
    - **`toString`**: Chuỗi dạng `RecordName[component1=value1, ...]`.
    - **Ví dụ**:
      ```java
      record Point(int x, int y) {}
      Point p1 = new Point(1, 2);
      Point p2 = new Point(1, 2);
      p1.equals(p2); // true
      p1.toString(); // Point[x=1, y=2]
      ```

### 2. ⚠️ Gài: Override `equals/hashCode` trong record được không? Cần tuân thủ điều gì để không phá hợp đồng?
- **Trả lời**:
    - **Có thể override**: Record cho phép ghi đè `equals`, `hashCode`.
    - **Tuân thủ**:
        - `equals()` phải so sánh tất cả components để giữ tính trong suốt.
        - `hashCode()` phải nhất quán với `equals()` (cùng components → cùng hash).
    - **Ví dụ**:
      ```java
      record Point(int x, int y) {
          @Override
          public boolean equals(Object o) {
              if (this == o) return true;
              if (!(o instanceof Point p)) return false;
              return x == p.x && y == p.y;
          }
          @Override
          public int hashCode() { return Objects.hash(x, y); }
      }
      ```

### 3. Có thể thêm method tùy ý (business methods) vào record không? Ví dụ tính toán dựa trên components.
- **Trả lời**:
    - **Có thể**: Record hỗ trợ thêm method tùy ý.
    - **Ví dụ**:
      ```java
      record Point(int x, int y) {
          public double distanceToOrigin() { return Math.sqrt(x * x + y * y); }
      }
      ```

---

## 6) Kế thừa, `final` & Interfaces

### 1. Record có thể `extends` một class cụ thể không? Nó mặc định `extends` lớp nào?
- **Trả lời**:
    - **Không thể extends class cụ thể**: Record chỉ được extends ngầm `java.lang.Record`.
    - **Mặc định**: Mọi record là subclass của `java.lang.Record`.

### 2. ⚠️ Gài: Record có thể bị `extends` bởi class khác không (record có là `final` không)?
- **Trả lời**:
    - **Không thể bị extends**: Record mặc định là `final`.
    - **Lý do**: Đảm bảo tính trong suốt và bất biến của dữ liệu.

### 3. Record có thể `implements` interface không? Use case thực tế.
- **Trả lời**:
    - **Có thể**: Record có thể implement interface.
    - **Use case**:
        - Implement `Comparable` để so sánh record.
        - Implement interface domain (ví dụ: `Serializable`, `Validatable`).
    - **Ví dụ**:
      ```java
      record Point(int x, int y) implements Comparable<Point> {
          @Override
          public int compareTo(Point o) { return Integer.compare(x, o.x); }
      }
      ```

---

## 7) Annotations & Validation

### 1. Gắn annotation vào **record**, **component**, **accessor**, **constructor** như thế nào?
- **Trả lời**:
    - **Record**: Annotation trên khai báo record (ví dụ: `@Entity`).
    - **Component**: Annotation trên component (ảnh hưởng field/accessor).
    - **Accessor**: Ghi đè accessor để thêm annotation.
    - **Constructor**: Annotation trên canonical/compact constructor.
    - **Ví dụ**:
      ```java
      @Entity
      record User(@NotNull String name) {
          @Override public String name() { return name; }
          public User { /* @NotNull đã áp dụng */ }
      }
      ```

### 2. ⚠️ Gài: Dùng Bean Validation (`@NotNull`, `@Email`…) trên components—validator chạy lúc nào, và nên đặt ở đâu?
- **Trả lời**:
    - **Chạy lúc nào**: Bean Validation chạy khi gọi validator (thường trong service/framework, không tự động trong record).
    - **Nên đặt ở đâu**: Trên component để áp dụng cho field/accessor.
    - **Ví dụ**:
      ```java
      record Email(@NotNull @Email String value) {}
      // Validator trong service
      Validator validator = Validation.buildDefaultValidatorFactory().getValidator();
      ```

### 3. Viết validation tuỳ biến (check domain) ở compact constructor vs ở service—trade-off?
- **Trả lời**:
    - **Compact constructor**:
        - **Ưu**: Đảm bảo bất biến ngay khi tạo, logic tập trung.
        - **Nhược**: Làm record phức tạp, không tái sử dụng logic.
    - **Service**:
        - **Ưu**: Tách logic domain, dễ bảo trì.
        - **Nhược**: Phải kiểm tra ở mọi nơi dùng record.
    - **Ví dụ (constructor)**:
      ```java
      record Email(String value) {
          public Email { if (!value.matches(".*@.*")) throw new IllegalArgumentException("Invalid email"); }
      }
      ```

---

## 8) Generics & Type Inference

### 1. Khai báo **generic record** (`record Box<T>(T value) {}`) — ràng buộc gì?
- **Trả lời**:
    - **Khai báo**: `<T>` trước tên record, component dùng `T`.
    - **Ràng buộc**: Tương tự generic class, có thể giới hạn bằng `extends` (ví dụ: `<T extends Number>`).
    - **Ví dụ**:
      ```java
      record Box<T>(T value) {}
      ```

### 2. ⚠️ Gài: `record Pair<T>(T a, T b)` với T là mutable—ảnh hưởng đến bất biến?
- **Trả lời**:
    - **Ảnh hưởng**: Nếu `T` là mutable, trạng thái của `a`, `b` có thể thay đổi, phá vỡ bất biến sâu.
    - **Phòng vệ**: Defensive copy hoặc giới hạn `T` là immutable.
    - **Ví dụ**:
      ```java
      record Pair<T>(T a, T b) {
          public Pair {
              a = (T) new ArrayList<>((List<?>) a); // Defensive copy
              b = (T) new ArrayList<>((List<?>) b);
          }
      }
      ```

### 3. Dùng `var` với record trong Java hiện đại: lợi/nhược về đọc hiểu.
- **Trả lời**:
    - **Lợi**:
        - Ngắn gọn code (`var p = new Point(1, 2);`).
        - Dễ refactor khi đổi kiểu.
    - **Nhược**:
        - Giảm khả năng đọc nếu kiểu không rõ ràng từ ngữ cảnh.
    - **Khuyến nghị**: Dùng `var` khi kiểu dễ suy ra.

---

## 9) Pattern Matching & Deconstruction

### 1. Record hỗ trợ **deconstruction/patterns** như thế nào (record patterns)?
- **Trả lời**:
    - **Record patterns** (Java 19+ preview): Phân giải record thành components trong `instanceof` hoặc `switch`.
    - **Ví dụ**:
      ```java
      if (obj instanceof Point(int x, int y)) {
          System.out.println(x + ", " + y);
      }
      ```

### 2. ⚠️ Gài: So sánh `instanceof` pattern matching với **record pattern** trong `switch` — khác nhau về phạm vi biến và exhaustiveness?
- **Trả lời**:
    - **`instanceof` pattern**:
        - Phạm vi biến: Chỉ trong block của `if`.
        - Không yêu cầu exhaustiveness.
    - **Record pattern trong `switch`**:
        - Phạm vi biến: Trong case của `switch`.
        - Yêu cầu **exhaustiveness** (phải xử lý mọi trường hợp nếu record là sealed).
    - **Ví dụ**:
      ```java
      switch (obj) {
          case Point(int x, int y) -> System.out.println(x);
          default -> throw new IllegalStateException();
      }
      ```

### 3. Khi nào nên dùng deconstruction để viết code khai thác dữ liệu nhanh gọn?
- **Trả lời**:
    - Khi cần truy cập nhanh components mà không gọi accessor.
    - Dùng trong `switch` hoặc `instanceof` để xử lý logic phân nhánh.
    - **Ví dụ**: Xử lý event payload hoặc DTO.

---

## 10) Serialization & Tương tác với Framework

### 1. Java Serialization mặc định xử lý record ra sao? Lưu ý về thứ tự components.
- **Trả lời**:
    - Record tự động implement `Serializable`.
    - **Xử lý**: Serialize/deserialize dựa trên components (tên, kiểu, thứ tự).
    - **Lưu ý**: Thay đổi thứ tự/tên component phá vỡ tương thích serialization.
    - **Ví dụ**:
      ```java
      record Point(int x, int y) implements Serializable {}
      ```

### 2. ⚠️ Gài: Dùng record với **Jackson/Gson** — cần điều kiện gì (constructor/param names)? Vấn đề khi đổi tên component?
- **Trả lời**:
    - **Điều kiện**:
        - Canonical constructor khớp tên component với JSON key.
        - Có thể cần `@JsonCreator`, `@JsonProperty` nếu tên khác.
    - **Vấn đề đổi tên component**:
        - Phá vỡ ánh xạ JSON nếu không dùng annotation.
        - **Khắc phục**: Dùng `@JsonProperty` để cố định tên.
    - **Ví dụ**:
      ```java
      record User(@JsonProperty("username") String name) {}
      ```

### 3. Record & JPA/Hibernate: có nên dùng record làm **entity**? Nêu các rào cản điển hình (no-arg ctor, mutability…). Giải pháp thay thế.
- **Trả lời**:
    - **Không nên dùng làm entity**:
        - **Rào cản**:
            - JPA yêu cầu no-arg constructor, record không hỗ trợ.
            - Entity cần mutable cho cập nhật, record là immutable.
            - Lifecycle callbacks (`@PrePersist`) khó áp dụng.
        - **Giải pháp thay thế**:
            - Dùng POJO với getter/setter cho entity.
            - Dùng record cho DTO hoặc read-only view.
    - **Ví dụ**: Dùng record cho DTO, POJO cho entity.

---

## 11) So sánh với POJO + Lombok

### 1. Record vs Lombok `@Value`/`@Data`: khác nhau về mức “ràng buộc ngôn ngữ” vs “tạo mã tự động”.
- **Trả lời**:
    - **Record**:
        - Ràng buộc ngôn ngữ: `final`, bất biến, tự sinh `equals`, `hashCode`, `toString`.
        - Không cần thư viện ngoài.
    - **Lombok `@Value`/`@Data`**:
        - Tạo mã tự động: Sinh getter/setter, `equals`, `hashCode`, v.v.
        - `@Data` hỗ trợ mutable, `@Value` cho immutable.
        - Phụ thuộc Lombok, tăng chi phí build.
    - **Ví dụ**:
      ```java
      record Point(int x, int y) {} // Record
      @Value class PointLombok { int x; int y; } // Lombok
      ```

### 2. ⚠️ Gài: Khi nào Lombok vẫn phù hợp hơn record? Kể ví dụ cụ thể.
- **Trả lời**:
    - **Lombok phù hợp hơn**:
        - Cần mutable object (setter).
        - Yêu cầu no-arg constructor (JPA entity).
        - Tùy chỉnh phức tạp (lifecycle methods).
    - **Ví dụ**:
      ```java
      @Data
      @Entity
      class User {
          @Id Long id;
          String name;
          @PrePersist void onCreate() { /* logic */ }
      }
      ```

### 3. Chi phí chuyển đổi một POJO bất biến sang record: rủi ro tương thích nhị phân/JSON.
- **Trả lời**:
    - **Chi phí**:
        - Thay getter (`getX()` → `x()`), ảnh hưởng API.
        - JSON mapping cần cập nhật tên field.
    - **Rủi ro**:
        - **Tương thích nhị phân**: Thay đổi chữ ký accessor phá vỡ client code.
        - **JSON**: Thay đổi tên component cần annotation hoặc config mới.
    - **Khắc phục**: Dùng `@JsonProperty`, giữ compatibility layer.

---

## 12) Hiệu năng, Bộ nhớ & GC

### 1. Record có lợi gì về **bộ nhớ** và **inlineability** so với POJO tương đương?
- **Trả lời**:
    - **Bộ nhớ**: Record không cần boilerplate, giảm kích thước bytecode.
    - **Inlineability**: Record có thể được JVM inline (nhờ `final` và cấu trúc đơn giản), cải thiện hiệu năng.
    - **So với POJO**: POJO cần thêm getter/setter, tốn bộ nhớ và phức tạp hơn.

### 2. ⚠️ Gài: `toString()` sinh tự động có an toàn trên data lớn/nhạy cảm? Ảnh hưởng logging/perf?
- **Trả lời**:
    - **Không an toàn hoàn toàn**:
        - **Dữ liệu lớn**: `toString()` in toàn bộ components, có thể chậm (ví dụ: `List` lớn).
        - **Dữ liệu nhạy cảm**: Có thể lộ thông tin (mật khẩu, token).
    - **Ảnh hưởng**:
        - Logging: Tăng kích thước log, giảm hiệu năng.
        - Perf: Gọi `toString()` trên collection lớn tốn CPU.
    - **Khắc phục**: Override `toString()` để giới hạn nội dung.

### 3. Ảnh hưởng của record đến **hash-based collections** (key trong `HashMap/HashSet`) khi components thay đổi ý nghĩa.
- **Trả lời**:
    - **Ảnh hưởng**: Thay đổi ý nghĩa component (ví dụ: đổi từ `id` sang `name`) phá vỡ hợp đồng `hashCode()`, gây lỗi tìm kiếm trong `HashMap/HashSet`.
    - **Khắc phục**: Đảm bảo components ổn định, hoặc override `equals/hashCode` với logic cố định.

---

## 13) Thiết kế API & Best Practices

### 1. Khi thiết kế API domain: tiêu chí chọn record cho **DTO**, **Value Object**, **Event payload**.
- **Trả lời**:
    - **Tiêu chí**:
        - Dữ liệu bất biến, trong suốt.
        - Không cần logic phức tạp hoặc setter.
        - Cần `equals`, `hashCode`, `toString` tự động.
    - **Use case**:
        - **DTO**: Chuyển dữ liệu API (`UserDto`).
        - **Value Object**: Biểu diễn giá trị (`Money`, `Point`).
        - **Event payload**: Dữ liệu sự kiện (`OrderPlacedEvent`).

### 2. ⚠️ Gài: Thêm **logic nặng** vào record có mùi thiết kế không? Ranh giới giữa VO thuần dữ liệu và domain object giàu hành vi.
- **Trả lời**:
    - **Mùi thiết kế**: Thêm logic nặng (tính toán phức tạp, I/O) làm record mất đi tính **trong suốt** của dữ liệu.
    - **Ranh giới**:
        - **Value Object**: Chỉ chứa logic đơn giản liên quan đến components (ví dụ: tính khoảng cách).
        - **Domain object**: Chứa logic nghiệp vụ phức tạp, nên dùng class.
    - **Khuyến nghị**: Tách logic nặng vào service.

### 3. Naming components: tính ổn định hợp đồng khi public accessor trùng tên component.
- **Trả lời**:
    - **Ổn định**: Accessor trùng tên component là hợp đồng cố định, không nên thay đổi tên component.
    - **Khắc phục**: Dùng `@JsonProperty` để tách tên API với tên component.

---

## 14) Truy cập & Bao đóng

### 1. Accessor của record là gì (không phải “getX()” mà là `x()`)? Ảnh hưởng đến mapping/thư viện phản chiếu.
- **Trả lời**:
    - **Accessor**: Phương thức public, tên trùng component (ví dụ: `x()`), trả về giá trị component.
    - **Ảnh hưởng**:
        - Phá vỡ quy ước JavaBean (`getX()`), cần cấu hình cho Jackson/Hibernate.
        - **Khắc phục**: Dùng annotation (`@JsonProperty`) hoặc custom serializer.

### 2. ⚠️ Gài: Có nên để components lộ trực tiếp collection? Kỹ thuật **defensive copy/unmodifiable view** ở đâu?
- **Trả lời**:
    - **Không nên lộ collection trực tiếp**: Phá vỡ bất biến.
    - **Kỹ thuật**:
        - **Defensive copy**: Trong constructor, sao chép collection đầu vào.
        - **Unmodifiable view**: Trong accessor, trả về `Collections.unmodifiableList`.
    - **Ví dụ**:
      ```java
      record Order(List<Item> items) {
          public Order { items = List.copyOf(items); }
          public List<Item> items() { return Collections.unmodifiableList(items); }
      }
      ```

### 3. “Canon” bất biến: kiểm tra null/clone dữ liệu vào constructor vs kiểm soát ở edge của hệ thống.
- **Trả lời**:
    - **Constructor**: Kiểm tra null/clone đảm bảo bất biến ngay khi tạo, nhưng tăng chi phí runtime.
    - **Edge của hệ thống**: Kiểm soát ở service/API giảm gánh nặng cho record, nhưng cần validate ở nhiều nơi.
    - **Khuyến nghị**: Kết hợp cả hai, ưu tiên validate trong constructor cho dữ liệu nhạy cảm.

---

## 15) Mini Case (thực chiến 2–5 phút/câu)

### 1. Thiết kế `record Money(BigDecimal amount, Currency currency)` bất biến “thực sự”: đề xuất validate & defensive copy.
- **Trả lời**:
  ```java
  import java.math.BigDecimal;
  import java.util.Currency;

  record Money(BigDecimal amount, Currency currency) {
      public Money {
          if (amount == null || currency == null) throw new IllegalArgumentException("Non-null required");
          amount = new BigDecimal(amount.toString()); // Defensive copy
      }
      public BigDecimal amount() { return new BigDecimal(amount.toString()); } // Defensive copy
  }
  ```

### 2. Chuyển DTO `UserDto` (POJO + Lombok) sang record; nêu các thay đổi cần làm ở mapper/Jackson/OpenAPI.
- **Trả lời**:
    - **POJO ban đầu**:
      ```java
      @Data
      class UserDto {
          private String name;
          private int age;
      }
      ```
    - **Chuyển sang record**:
      ```java
      record UserDto(String name, int age) {}
      ```
    - **Thay đổi cần làm**:
        - **Mapper**: Cập nhật từ `getName()` sang `name()`.
        - **Jackson**: Thêm `@JsonProperty` nếu tên JSON khác component.
        - **OpenAPI**: Cập nhật schema để ánh xạ tên accessor.

### 3. `record Order(List<Item> items)`: đề xuất cách đảm bảo items không bị sửa từ bên ngoài (copy + unmodifiable).
- **Trả lời**:
  ```java
  record Order(List<Item> items) {
      public Order { items = List.copyOf(items); }
      public List<Item> items() { return Collections.unmodifiableList(items); }
  }
  ```

### 4. Viết compact constructor cho `record Email(String value)` để chuẩn hoá (lowercase/trim) và validate theo regex.
- **Trả lời**:
  ```java
  record Email(String value) {
      public Email {
          if (value == null) throw new IllegalArgumentException("value null");
          value = value.trim().toLowerCase();
          if (!value.matches("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$"))
              throw new IllegalArgumentException("Invalid email");
      }
  }
  ```

### 5. Dùng **record pattern** trong `switch` để xử lý `Event` với các biến thể `UserCreated`, `UserDeleted` (records); đảm bảo exhaustiveness.
- **Trả lời**:
  ```java
  sealed interface Event permits UserCreated, UserDeleted {}
  record UserCreated(String name) implements Event {}
  record UserDeleted(long id) implements Event {}

  String process(Event event) {
      return switch (event) {
          case UserCreated(String name) -> "Created: " + name;
          case UserDeleted(long id) -> "Deleted: " + id;
      }; // Exhaustive vì Event là sealed
  }
  ```

### 6. Sửa lỗi: sau khi đổi từ POJO sang record, Jackson báo lỗi không khớp tham số—liệt kê các nguyên nhân có thể và hướng khắc phục.
- **Trả lời**:
    - **Nguyên nhân**:
        1. Tên accessor (`name()`) không khớp với `getName()` trong JSON mapping.
        2. Thiếu canonical constructor khớp với JSON.
        3. Thay đổi tên component phá vỡ ánh xạ.
    - **Khắc phục**:
        - Thêm `@JsonCreator` và `@JsonProperty`:
          ```java
          record User(@JsonProperty("username") String name) {}
          ```
        - Cấu hình Jackson để nhận accessor của record.

---

