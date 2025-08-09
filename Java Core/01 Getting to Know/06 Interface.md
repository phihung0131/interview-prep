## I) Khái niệm & Cú pháp cơ bản

1. Interface là gì? Khác gì với abstract class ở mục tiêu thiết kế?
2. Vì sao Java cần interface trong hệ thống type single-inheritance?
3. Khai báo interface tối thiểu trông như thế nào? Có access modifiers nào hợp lệ?
4. Interface mặc định “extends” gì? Có thể `final`/`sealed`/`non-sealed` không?
5. Một class có thể đồng thời `extends` class và `implements` nhiều interface như thế nào?
6. Interface có thể `implements` interface khác không? (so sánh với `extends` của interface)
7. So sánh “contract-based design” của interface với “template-based” của abstract class.
8. Khi nào nên bắt đầu từ interface thay vì class cụ thể?

---

## II) Thành phần trong interface

9. Những thành phần hợp lệ: abstract method, default method, static method, private method (từ Java 9), nested types?
10. Tại sao field trong interface luôn là `public static final` (implicit)?
11. Có thể có instance field trong interface không? Vì sao bị cấm?
12. Thứ tự khởi tạo static field/initializer trong interface so với class?
13. Có thể khai báo `public`/`private`/`protected` cho method trong interface không? Trường hợp nào hợp lệ?
14. Có cần (hoặc nên) ghi rõ `public abstract` trước method không?
15. Interface có thể chứa `record`, `enum`, hoặc class lồng nhau không? Quy tắc truy cập?

---

## III) Default methods (Java 8+)

16. Default method giải quyết vấn đề gì về tiến hóa API (API evolution)?
17. Khi hai interface cung cấp default method trùng chữ ký, class implement phải xử lý xung đột ra sao?
18. Có thể gọi default method của interface cụ thể từ class con như thế nào?
19. Default method có thể `synchronized`/`final`/`native` không?
20. Thứ tự chọn implementation: method override của class vs default method của interface?
21. Default method có nên chứa logic phức tạp? Best practices?

---

## IV) Static & Private methods

22. Static method trong interface có được kế thừa không? Cách gọi đúng?
23. Khác biệt giữa utility static trong interface vs utility class thuần (e.g. `Math`)?
24. Private method trong interface dùng để làm gì? Có giới hạn nào khi gọi?
25. Có thể `private static` method trong interface không? Use-cases?

---

## V) Kế thừa interface, Multiple inheritance & Diamond

26. Một interface có thể `extends` nhiều interface? Thứ tự ảnh hưởng gì?
27. Diamond problem với interface xuất hiện khi nào? Cách giải quyết trong Java?
28. Ưu/nhược của multiple inheritance ở mức interface so với mixins?
29. Interface inheritance có hỗ trợ “state sharing” không? Tại sao không?

---

## VI) Functional interfaces & Lambdas

30. Functional interface là gì? Điều kiện ràng buộc (Single Abstract Method) cụ thể?
31. Dùng `@FunctionalInterface` để làm gì? Nó bắt lỗi gì ở compile-time?
32. SAM + default methods: có phá tính “functional” không?
33. Lambda có thể ném checked exception không? Chiến lược xử lý checked exception trong lambda?
34. Method reference tương tác với functional interface như thế nào?
35. So sánh anonymous class vs lambda về capture biến và this/equals/hashCode.

---

## VII) Generics & Type System

36. Interface generic: `interface Repository<T>` — cách ràng buộc `T extends ...`?
37. Raw type với interface generic: hậu quả và cảnh báo?
38. Wildcards `? extends` / `? super` trong method của interface: khi nào dùng?
39. Bridge methods và type erasure: tác động đến interface generic?
40. Covariant return types khi override method từ interface?
41. Có thể tạo “self-referential generic interface” (F-bounded polymorphism)? Dùng khi nào?

---

## VIII) Exceptions & throws trong interface

42. Interface method có thể khai báo `throws` checked exceptions? Ảnh hưởng tới implementors?
43. Khi override, có thể mở rộng danh sách checked exceptions không?
44. `default`/`static` method ném exception thì ai bắt? Best practices khi thiết kế API.

---

## IX) Visibility, Modules & Packages

45. Interface `public` vs package-private khác gì về API design?
46. Ảnh hưởng của Java Platform Module System (JPMS) lên việc export interfaces giữa modules?
47. Split packages và interface: rủi ro/khuyến nghị?
48. Khi refactor location của interface giữa modules, giữ binary compatibility ra sao?

---

## X) Thiết kế, Patterns & Thực tiễn

49. Dùng interface để tách abstraction/implementation (Bridge, Strategy, State): ví dụ nào “sạch”?
50. Interface segregation principle (ISP): chia nhỏ interface thế nào để tránh “fat interface”?
51. Marker interfaces (e.g., `Serializable`, `Cloneable`) vs annotations: khi nào dùng cái nào?
52. Lạm dụng interface (over-abstraction) gây hại gì?
53. “SPI vs API” với interface: khác biệt câu chuyện mở rộng ở runtime?
54. Interface + Dependency Injection: tips để viết testable code?
55. Interface-stability: quy tắc thay đổi chữ ký/return type mà không phá backward compatibility?
56. `equals/hashCode` contract khi tham chiếu qua interface thay vì class cụ thể?
57. Kỹ thuật “role interface” trong domain: lợi ích & pitfalls.

---

## XI) Interop với class, enum, record, sealed types

58. Enum có thể implement interface? Use-cases phổ biến (strategy per-constant)?
59. Record (value carrier) implement interface: phù hợp khi nào?
60. Abstract class + interface cùng tồn tại: chọn đặt logic mặc định ở đâu?
61. Sealed interfaces: model hóa closed hierarchies và exhaustive `switch`?
62. Tương tác pattern matching (instanceof + switch) với các implementors của một interface?
63. Có nên cho interface biết quá nhiều về loại implementor (leaky abstraction)?

---

## XII) Reflection & Runtime

64. Làm sao kiểm tra một `Class<?>` là interface (Reflection API)?
65. Lấy danh sách method/field của interface bằng reflection có khác gì class?
66. Dynamic proxies (`java.lang.reflect.Proxy`) xây dựng implementor runtime như thế nào?
67. Hạn chế của `Proxy` so với bytecode generation (ByteBuddy, ASM)?
68. InvocationHandler xử lý equals/hashCode/toString thế nào cho interface proxy?

---

## XIII) Serialization & Frameworks

69. Interface và Java serialization: object graph chứa reference kiểu interface có yêu cầu gì với implementor?
70. JSON binding (Jackson/Gson) với trường có type là interface: cách polymorphic deserialization?
71. Spring bean injection theo interface vs theo class: ưu/nhược?
72. MapStruct mappper qua interface: cơ chế generate implementation?
73. JAX-RS/Feign clients định nghĩa contract bằng interface: lưu ý checked exceptions, default methods?

---

## XIV) Hiệu năng & ABI/Binary Compatibility

74. Gọi qua interface (invokeinterface) vs qua class (invokevirtual): khác biệt hiệu năng/JIT?
75. Devirtualization & inlining khi call site là interface — khi nào JIT tối ưu được?
76. Thêm default method mới vào interface public: có phá binary compatibility không?
77. Xoá/đổi chữ ký method interface: hậu quả runtime?
78. Sử dụng sealed interface để giúp JIT tối ưu các `switch` exhaustiveness?

---

## XV) Edge cases & Câu hỏi gài

79. Có thể tạo instance của interface không? (anonymous class, proxy) Các giới hạn?
80. Interface có thể khai báo `main` static method và chạy không?
81. Interface có thể tham chiếu tới `this` trong default method? Ngữ nghĩa?
82. Field `public static final` trong interface được “inlined” — rủi ro khi thay đổi giá trị?
83. Default method gọi đến method abstract khác: thứ tự ràng buộc và nguy cơ `NullPointerException`/override trap?
84. Default method ném exception checked mà interface không khai báo? Có hợp lệ?
85. Kế thừa hai interface có method cùng tên nhưng khác return type: xử lý thế nào?
86. Hai interface có method trùng chữ ký nhưng khác `throws` checked exceptions: xung đột?
87. Interface tham chiếu tới generic type erasure: khi runtime cast, có `ClassCastException` bất ngờ?
88. Có thể gán tham chiếu `null` cho biến kiểu interface không? Ý nghĩa thiết kế?
89. Làm sao mô hình hoá “optional capability” bằng interface nhỏ (role-based design)?
90. Khi viết thư viện, làm sao thiết kế interface “mở rộng dần” (evolution-friendly) mà không buộc người dùng sửa code mỗi phiên bản?

---
