# 📌 1. Tổng quan SOLID

1. SOLID là gì? Ai đưa ra khái niệm này?
2. Tại sao SOLID quan trọng trong thiết kế phần mềm hướng đối tượng?
3. Nếu không tuân thủ SOLID thì hậu quả thường gặp là gì? (ví dụ code khó bảo trì, khó mở rộng, bug dây chuyền).

---

# 📌 2. **S – Single Responsibility Principle (SRP)**

1. SRP là gì? Giải thích theo định nghĩa “một class chỉ nên có một lý do để thay đổi”.
2. Ví dụ một class **vi phạm SRP** (ví dụ `UserService` vừa xử lý logic, vừa gửi email, vừa thao tác DB).
3. Làm sao refactor để tuân thủ SRP trong ví dụ trên?
4. Sự khác biệt giữa SRP và **Separation of Concerns**?
5. Nếu chia nhỏ quá nhiều class để tuân SRP thì có nhược điểm gì?

---

# 📌 3. **O – Open/Closed Principle (OCP)**

1. OCP là gì? “Open for extension, closed for modification”.
2. Ví dụ một đoạn code **vi phạm OCP** (ví dụ `switch-case` xử lý từng loại hình thức thanh toán).
3. Làm sao refactor với **Strategy pattern** để tuân OCP?
4. Tại sao OCP thường đi chung với **Design Pattern** (Strategy, Factory, Decorator…)?
5. Nếu code thay đổi yêu cầu business liên tục, áp dụng OCP cứng nhắc có gây khó khăn không?

---

# 📌 4. **L – Liskov Substitution Principle (LSP)**

1. Định nghĩa LSP: “Subtype phải có thể thay thế được supertype mà không phá vỡ tính đúng đắn của chương trình”.
2. Ví dụ **vi phạm LSP**: class `Rectangle` và `Square` (gán chiều dài/chiều rộng).
3. Khi nào kế thừa có thể phá vỡ LSP? (ví dụ override method thay đổi behavior).
4. Làm sao kiểm chứng code có vi phạm LSP không? (unit test thay thế subtype vào chỗ supertype).
5. LSP liên quan thế nào đến **design by contract**?

---

# 📌 5. **I – Interface Segregation Principle (ISP)**

1. ISP là gì? “Clients không nên bị ép phụ thuộc vào những method mà chúng không dùng”.
2. Ví dụ vi phạm ISP: interface `IMachine` có `print()`, `scan()`, `fax()`, nhưng `BasicPrinter` chỉ cần `print()`.
3. Giải pháp refactor: tách thành các interface nhỏ hơn (`IPrinter`, `IScanner`, `IFax`).
4. ISP có liên quan thế nào đến **fat interface** và **role interface**?
5. Trong thực tế Java, ISP thường áp dụng ở đâu? (Spring, JDK collections).

---

# 📌 6. **D – Dependency Inversion Principle (DIP)**

1. DIP là gì? “High-level module không nên phụ thuộc trực tiếp vào low-level module, mà cả hai phụ thuộc vào abstraction”.
2. Ví dụ vi phạm DIP: `UserService` trực tiếp tạo `MySQLRepository`.
3. Giải pháp refactor: dùng interface `UserRepository` và inject implementation qua constructor.
4. DIP khác gì với **Dependency Injection (DI)** trong Spring? (DIP là nguyên tắc, DI là cơ chế thực hiện).
5. DIP giúp unit test dễ dàng hơn như thế nào?

---

# 📌 7. Tổng hợp câu hỏi “gài bẫy”

1. SOLID chỉ áp dụng cho class, có áp dụng cho function/module không?
2. Có bao giờ không nên áp dụng SOLID không? (ví dụ dự án nhỏ, MVP nhanh).
3. Giữa SRP và ISP có bị “trùng ý tưởng” không?
4. Nếu code đã phức tạp mà cứ cố tuân SOLID thì có thể dẫn đến vấn đề gì?
5. Tại sao SOLID thường đi kèm với **Design Patterns**?

