# 📌 1. Tổng quan về Design Pattern

1. Design Pattern là gì? Tại sao cần sử dụng?
2. Ai là tác giả bộ **Gang of Four (GoF)**? Có bao nhiêu pattern trong sách GoF?
3. Lợi ích chính của design pattern trong dự án thực tế?
4. So sánh **design pattern** và **architectural pattern**.
5. Có cần phải nhớ tất cả design pattern không, hay quan trọng là biết cách áp dụng?
6. Design pattern có làm code phức tạp hơn không? Nếu có thì lợi ích là gì?

---

# 📌 2. Creational Patterns (Khởi tạo)

1. Kể tên các **creational patterns**.
2. **Singleton Pattern**:

   * Là gì?
   * Cách triển khai thread-safe trong Java.
   * Ưu điểm và nhược điểm.
   * Những anti-pattern của Singleton.
3. **Factory Method vs Abstract Factory**:

   * Điểm khác biệt.
   * Khi nào dùng cái nào?
   * Ví dụ với `ShapeFactory` hoặc `DatabaseFactory`.
4. **Builder Pattern**:

   * Khi nào nên dùng?
   * So sánh với telescoping constructor.
   * Ví dụ với `User` có nhiều field optional.
5. **Prototype Pattern**:

   * Nguyên lý hoạt động (clone).
   * Shallow copy vs deep copy.

---

# 📌 3. Structural Patterns (Cấu trúc)

1. Kể tên các **structural patterns**.
2. **Adapter Pattern**:

   * Khi nào nên dùng?
   * Ví dụ chuyển đổi interface từ `LegacyPrinter` sang `NewPrinter`.
3. **Decorator Pattern**:

   * Khác gì với inheritance?
   * Ví dụ `BufferedInputStream` trong Java.
4. **Proxy Pattern**:

   * Các loại proxy (Virtual, Remote, Protection).
   * Liên hệ với `Spring AOP Proxy`.
5. **Composite Pattern**:

   * Giải quyết vấn đề gì?
   * Ví dụ cây thư mục (File/Folder).
6. **Facade Pattern**:

   * Khi nào nên dùng?
   * Ví dụ `HibernateUtil` cung cấp API đơn giản cho Hibernate.
7. **Bridge Pattern**:

   * Khác gì với Adapter?
   * Tình huống áp dụng (ví dụ nhiều chiều phân loại: Shape + Color).

---

# 📌 4. Behavioral Patterns (Hành vi)

1. Kể tên các **behavioral patterns**.
2. **Strategy Pattern**:

   * Ý tưởng chính.
   * Ví dụ Payment với `PayPal`, `CreditCard`, `COD`.
3. **Observer Pattern**:

   * Cách hoạt động.
   * Liên hệ với **Java `Observer`**, **Spring Event**, **GUI Listener**.
4. **Command Pattern**:

   * Ý tưởng chính.
   * Ví dụ `Undo/Redo`.
5. **Template Method Pattern**:

   * Ý tưởng và use-case.
   * Liên hệ với `HttpServlet`.
6. **Iterator Pattern**:

   * Tại sao Collections Framework áp dụng Iterator?
7. **State Pattern**:

   * Khi nào nên dùng?
   * Ví dụ `Order` có các trạng thái: `New → Shipped → Delivered`.
8. **Chain of Responsibility**:

   * Ý tưởng chính.
   * Ví dụ `Servlet Filter`, `Spring Security Filter Chain`.

---

# 📌 5. Câu hỏi thực tế và gài bẫy

1. Singleton có phải lúc nào cũng tốt không? Khi nào không nên dùng?
2. Khác nhau giữa **Factory Method** và **Simple Factory**?
3. Decorator vs Proxy: khác nhau ở đâu?
4. Nếu hệ thống có nhiều event listener, tại sao Observer dễ gây **memory leak**?
5. Có cần phải tự code tất cả pattern không, hay tận dụng framework/library?
6. Bạn đã từng gặp design pattern nào trong **Spring Framework** hay **Java SDK**?
7. Khi nào **không nên áp dụng** design pattern?
8. Design pattern có thể gây **over-engineering** thế nào?
