# I. Khái niệm & Cú pháp cơ bản

1. Record trong Java là gì? Ra đời để giải quyết vấn đề gì so với POJO/DTO truyền thống?
2. Cú pháp khai báo record? Record component là gì?
3. Record mặc định cung cấp những method nào (constructor, accessors, `equals`, `hashCode`, `toString`)?
4. Tại sao record được xem là “immutable data carrier” dù bạn vẫn có thể dùng component là type mutable?
5. Record có thể `extends` class khác không? Nó kế thừa từ đâu?
6. Record có thể `implements` interface không? Trường hợp dùng thực tế?
7. Record có `setter` không? Vì sao?
8. Khác biệt chính giữa **class**, **record**, **enum**, **sealed type**?
9. Record có thể là `public`/`package-private`? Quy tắc đặt tên file nguồn?
10. Có thể khai báo record lồng nhau (nested/inner record) không? Quy tắc truy cập?

---

# II. Constructors & Validation

11. **Canonical constructor** là gì? Khi nào cần viết tường minh?
12. **Compact constructor** là gì? Khác canonical constructor ở điểm nào?
13. Khi validate invariant trong compact constructor, bạn nên `throw` gì nếu fail?
14. Thứ tự gán field diễn ra thế nào trong canonical vs compact constructor?
15. Có thể tạo **overloaded constructor** cho record không? Quy tắc phải gọi `this(...)` ra sao?
16. Khi cần gán giá trị chuẩn hoá (normalize) cho component (ví dụ trim String), nên làm ở đâu?
17. Có thể thêm **factory static method** để kiểm soát tạo record không? Khi nào nên dùng thay vì constructor?
18. Có thể chặn giá trị `null` cho component như thế nào (validation vs annotation vs Objects.requireNonNull)?
19. Gán giá trị mặc định cho component (defaulting) làm sao cho gọn?
20. Constructor của record có thể `protected`/`private` không? Tác dụng?

---

# III. Bất biến & Thiết kế dữ liệu

21. Tại sao record *ngầm định* bất biến? Các giả định nào **không** đảm bảo bất biến thực sự?
22. **Defensive copy** là gì? Khi component là collection/mảng/mutable type, cần làm gì để giữ bất biến?
23. Khác biệt khi component là `List` vs `List.copyOf(...)` vs `Collections.unmodifiableList(...)`?
24. Có nên chấp nhận mảng (`byte[]`) làm component? Cách bảo vệ bất biến với mảng?
25. Chiến lược bất biến cho **cấu trúc lồng nhau**: record chứa record, record chứa POJO mutable?
26. “Wither method” (copy-with) cho record: cách viết thủ công an toàn, khi nào cần?
27. Khi dữ liệu lớn, bất biến có ảnh hưởng hiệu năng ra sao (copying vs sharing)?
28. Bất biến và **thread-safety**: record giúp gì/không giúp gì?
29. Phân biệt **logical immutability** vs **physical immutability** trong bối cảnh record.
30. Khi nào **value object** → record là lựa chọn tự nhiên? Khi nào **entity** → không nên dùng record?

---

# IV. API mặc định & Override

31. Contract của `equals`/`hashCode` do record sinh ra dựa trên thành phần nào?
32. Có nên override `equals`/`hashCode`/`toString` của record? Trường hợp hợp lệ? Pitfalls?
33. Record accessors khác getter kiểu JavaBean như thế nào? Ảnh hưởng tới frameworks?
34. Có thể thêm **instance method** (business helper) trong record không? Nên hay không?
35. Có thể khai báo **static fields/methods/initializers** trong record? Hạn chế gì với **instance fields** tự khai báo?
36. Khi override accessor để thực hiện logic (ví dụ format), có phá bất biến/contract không?
37. Record có thể implement `Comparable<T>` không? Khi nào nên thêm `compareTo` theo component order?
38. Ảnh hưởng của `null` component tới `equals`/`hashCode` mặc định?
39. `toString()` mặc định có ổn cho logging/PII không? Có cần tuỳ biến?
40. Record có hỗ trợ **annotation trên component** để tác động lên accessor/constructor/serialization không?

---

# V. Generics, Collections & Arrays

41. Record generic: `record Box<T>(T value) {}` — rủi ro type erasure nào?
42. Record component là `List<T>` vs `T[]`: khi nào chọn cái nào?
43. `equals`/`hashCode` mặc định của record với component là mảng cư xử ra sao? (so sánh tham chiếu vs nội dung)
44. Khi component là `Map<K,V>` bất biến: chiến lược tạo map bất biến?
45. Record với **optional data**: dùng `Optional<T>` làm component có hợp lý không?
46. Record với **big data** (byte buffers, memory segments): bất biến và chi phí copy?
47. Record có hỗ trợ **varargs** trong constructor không?
48. Có thể dùng **builder pattern** với record? Cách làm sạch sẽ?
49. Dùng record cho **value-based class** (không đồng nhất identity)? Lợi/hại?
50. Record và **equals by value** trong cấu trúc collection (key cho Map/Set): điều kiện an toàn?

---

# VI. Pattern Matching & Record Patterns

51. Deconstruction pattern là gì? Ví dụ `case Point(int x, int y)` trong `switch`.
52. Phân biệt **type pattern** vs **record pattern** vs **guarded pattern** trong `switch`.
53. Lợi ích của record pattern với truy vấn dữ liệu lồng nhau (nested deconstruction).
54. Kết hợp record pattern với **sealed types** để có **exhaustive switch**?
55. Hạn chế hiện tại của record pattern: tính ổn định ngôn ngữ, readability, hiệu năng?
56. Sử dụng record pattern trong `instanceof`: khi nào giúp code sạch hơn?
57. Guard (`when`) trong pattern matching: nơi đặt validation nhanh-gọn?
58. Tương tác giữa record pattern và **null handling** trong `switch`?
59. Deconstruction có ảnh hưởng tới tính bất biến không?
60. Best practices khi refactor từ getters sang record pattern.

---

# VII. Serialization, JSON & Frameworks

61. Jackson/Gson có hỗ trợ record “out of the box” không? Cần cấu hình gì?
62. Quy tắc ánh xạ tên component ↔ tên trường JSON? Cách tuỳ biến bằng annotation?
63. Serialization Java (native) và record: serialVersionUID có cần? Bẫy tương thích nhị phân?
64. Record với JPA/Hibernate: vì sao thường **không** phù hợp làm entity? Có hack nào?
65. Dùng record làm **projection/DTO** trong Spring Data: tips và giới hạn?
66. MapStruct/Dozer với record: cấu hình mapper 2 chiều?
67. Record và validation frameworks (Jakarta Validation): đặt annotation ở đâu (component/accessor/constructor param)?
68. Record & protobuf/Avro/Thrift: mapping field bất biến và schema evolution?
69. Dùng record cho API input vs output: thống nhất bất biến, ẩn bớt field nhạy cảm?
70. Ảnh hưởng của `@JsonCreator`/`@JsonProperty` lên canonical constructor?

---

# VIII. Hiệu năng & Bộ nhớ

71. Chi phí tạo record so với POJO tương đương? JIT/escape analysis xử lý thế nào?
72. `equals`/`hashCode` mặc định do record sinh: chi phí O(n) theo số component—có tối ưu gì?
73. Record và **cache locality** trong các cấu trúc dữ liệu lớn?
74. GC pressure khi dùng record nhiều (immutable → nhiều object nhỏ): chiến lược giảm áp lực?
75. Tác động của defensive copy (collections/mảng) đến latency/throughput?
76. Micro-benchmarking (JMH) để so sánh record vs class: những sai số phổ biến cần tránh?

---

# IX. Thiết kế, So sánh & Thực tiễn

77. Khi nào **record > Lombok @Value**? Khi nào ngược lại?
78. Record vs Kotlin data class: khác biệt về cú pháp, features (copy, destructuring), interoperability?
79. Record vs JavaBean truyền thống: ảnh hưởng lên DI/Reflection/Frameworks?
80. Có nên dùng record làm **API model** public? Ổn định hợp đồng & khả năng mở rộng?
81. Dùng record cho **domain value objects** trong DDD: lợi ích và ràng buộc?
82. Migration: chuyển từ DTO class sang record an toàn mà không phá vỡ clients?
83. Quy ước đặt tên component: trùng với tên JSON hay tên domain?
84. “Fat record” có nhiều logic có mùi code smell không? Tách thế nào?

---

# X. Tình huống cạnh biên & Kiểm thử

85. Có thể khai báo **instance fields** thủ công trong record không? Tại sao bị cấm?
86. Có thể viết **instance initializer blocks** không? Còn **static initializer** thì sao?
87. Ảnh hưởng của `transient` với record component trong serialization?
88. Annotations đặt ở **component vs accessor vs constructor parameter** khác nhau thế nào?
89. Reflection với record: nhận biết record bằng API nào? Lấy danh sách component ra sao?
90. Testing record: **structural equality** vs **property-based testing** để kiểm tra invariant?
91. Snapshot testing với `toString()` mặc định—khi nào nên/không nên dựa vào?
92. So sánh `Objects.requireNonNull` vs custom validator trong compact constructor.
93. Gỡ lỗi khi JSON thiếu field → mapping vào canonical constructor: làm sao trace nhanh?
94. Khi thay đổi thứ tự hoặc tên component, hậu quả tới binary/API/JSON là gì?
95. Triển khai `readResolve`/`writeReplace` có áp dụng cho record? Trường hợp cần?
