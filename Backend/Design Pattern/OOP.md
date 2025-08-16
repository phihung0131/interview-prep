# 📌 1. Khái niệm nền tảng

1. OOP là gì? So sánh với lập trình hướng thủ tục.
2. Bốn trụ cột chính của OOP? Mỗi cái giải thích kèm ví dụ.
3. Sự khác nhau giữa **class** và **object**?
4. Khái niệm **state, behavior, identity** trong object?
5. Có phải “mọi thứ trong Java đều là object”? Liệt kê ngoại lệ.
6. Field (biến thành viên) và property có khác nhau trong Java không?

---

# 📌 2. Class, Object & Constructor

1. Khác biệt giữa **instance variable** và **class (static) variable**.
2. Có những loại constructor nào trong Java? Khi nào compiler tự tạo constructor mặc định?
3. Thứ tự khởi tạo trong Java: static field → static block → instance field → instance block → constructor. Giải thích kèm ví dụ.
4. Constructor có thể `private` không? Dùng trong trường hợp nào?
5. Sự khác nhau giữa **constructor overloading** và **method overloading**.

---

# 📌 3. Encapsulation & Access Modifier

1. Encapsulation là gì? Mục đích?
2. Giải thích từng loại **access modifier**: `private`, (default), `protected`, `public`.
3. Tại sao field thường để `private` và cung cấp getter/setter?
4. Nếu chỉ cần đọc mà không được thay đổi, ta thiết kế thế nào?
5. `final` trên biến, method, class có ý nghĩa gì?

---

# 📌 4. Inheritance (Kế thừa)

1. Kế thừa trong OOP là gì? Lợi ích và rủi ro.
2. Java có **đa kế thừa class** không? Vì sao?
3. `super` khác gì với `this`?
4. Phân biệt **method overriding** vs **method overloading**.
5. Tại sao khi override phải quan tâm đến `@Override`, `access modifier`, `return type`, `exception`?

---

# 📌 5. Polymorphism (Đa hình)

1. Polymorphism là gì? Ví dụ compile-time vs runtime polymorphism.
2. Tại sao Java gọi phương thức theo **kiểu thực tế (runtime type)** chứ không phải theo kiểu tham chiếu (reference type)?
3. Biến static có thể override không? Vì sao nói static method chỉ bị **hiding**, không phải overriding?
4. Nếu gọi method trong constructor nhưng class con override method đó thì điều gì xảy ra?

---

# 📌 6. Abstraction

1. Abstraction là gì? So sánh với encapsulation.
2. Khác biệt giữa **abstract class** và **interface** (Java 8+ có default, static method).
3. Một class `abstract` có thể không có method abstract nào không?
4. Interface có thể extend interface khác không? Một interface có thể extend nhiều interface không?
5. Tại sao Java 8 bổ sung `default method` vào interface?

---

# 📌 7. Object Class & Các phương thức cốt lõi

1. Tất cả class trong Java đều kế thừa từ đâu?
2. Ý nghĩa các method cơ bản trong `Object`:

   * `equals()`
   * `hashCode()`
   * `toString()`
   * `clone()`
   * `finalize()` (từ Java 9 deprecated)
   * `wait()/notify()/notifyAll()`
   * `getClass()`
3. Tại sao phải override `equals` và `hashCode` cùng nhau?

---

# 📌 8. Inner Class & Special Class

1. Khác nhau giữa **inner class**, **static nested class**, **local class**, **anonymous class**.
2. Use-case thực tế của từng loại.
3. Có thể khai báo class trong một interface không?

---

# 📌 9. Immutability & Final

1. Một object immutable là gì? Ví dụ `String`.
2. `final` trên biến tham chiếu có làm object immutable không?
   → Gài: không, chỉ làm tham chiếu không đổi, object vẫn mutable.
3. Làm thế nào để thiết kế class immutable?

---

# 📌 10. Các câu gài, dễ nhầm

1. Có thể override static method không?
2. Có thể overload main method không? JVM gọi cái nào?
3. Nếu một class không viết constructor thì sao? Nếu có constructor private thì sao?
4. Tại sao `==` và `equals()` khác nhau khi so sánh object?
5. Nếu không override `hashCode()` mà chỉ override `equals()` thì có vấn đề gì với `HashMap`?

