## 1. Kiến thức nền tảng cần có

Trước khi học Design Pattern, bạn cần vững:

* **OOP (Object-Oriented Programming)**: encapsulation, inheritance, polymorphism, abstraction.
* **SOLID Principles**: nguyên tắc viết code sạch, dễ bảo trì.
* **UML cơ bản**: class diagram, sequence diagram để đọc/hiểu pattern.

---

## 2. Tài liệu tiếng Anh (chuẩn, dễ áp dụng)

* 📘 *Head First Design Patterns* (Eric Freeman, Elisabeth Freeman)
  👉 Dễ hiểu, nhiều ví dụ minh hoạ Java. Rất phù hợp cho fresher.
* 📘 *Design Patterns: Elements of Reusable Object-Oriented Software* (Gang of Four - GoF)
  👉 Kinh điển, nhưng khá nặng. Nên đọc sau khi đã quen.
* Website:

  * [Refactoring Guru](https://refactoring.guru/design-patterns) – trực quan, có code mẫu Java.
  * [SourceMaking](https://sourcemaking.com/design_patterns) – giải thích + anti-patterns.

---

## 3. Lộ trình học Design Pattern

Học theo nhóm để dễ nhớ (GoF chia thành 3 loại chính):

### a. **Creational Patterns (Khởi tạo)**

* Singleton
* Factory Method
* Abstract Factory
* Builder
* Prototype

👉 Dùng khi muốn quản lý cách **tạo object**.
Ví dụ: Spring Bean Factory chính là áp dụng Factory Pattern.

---

### b. **Structural Patterns (Cấu trúc)**

* Adapter
* Bridge
* Composite
* Decorator
* Facade
* Flyweight
* Proxy

👉 Dùng khi muốn **kết hợp class/objects** linh hoạt.
Ví dụ: `java.io.InputStream` dùng Decorator.

---

### c. **Behavioral Patterns (Hành vi)**

* Strategy
* Observer
* Command
* Template Method
* State
* Chain of Responsibility
* Iterator
* Mediator
* Memento
* Visitor

👉 Dùng khi muốn quản lý **tương tác/logic hành vi**.
Ví dụ: `Observer` dùng trong Event Listener của Java Swing hoặc Spring Event.

---

## 4. Cách học hiệu quả

1. **Đọc lý thuyết → code demo nhỏ** (mỗi pattern 1 ví dụ Java).
2. **So sánh với thư viện/framework** bạn đang dùng (Spring, Hibernate, Java Core).

   * VD: Singleton ↔ Spring Bean `@Component`.
3. **Thực hành mini-project**:

   * Quản lý đơn hàng (Factory + Strategy).
   * Hệ thống notification (Observer).
   * Payment Gateway (Template Method + Chain of Responsibility).

---

## 5. Tài liệu bổ sung (dễ tiếp cận)

* Playlist YouTube: *Java Design Patterns* (loạt video ngắn cho từng pattern).
* GitHub Repo: [iluwatar/java-design-patterns](https://github.com/iluwatar/java-design-patterns) – code mẫu đầy đủ, rất chất lượng.

---

👉 Gợi ý: Nếu bạn muốn học trong **2 tháng**, có thể chia thế này:

* **Tuần 1–2**: OOP + SOLID + UML.
* **Tuần 3–4**: Creational Patterns.
* **Tuần 5–6**: Structural Patterns.
* **Tuần 7–8**: Behavioral Patterns + làm mini-project áp dụng.
