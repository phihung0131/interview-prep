# I) Mục tiêu & Khái niệm cơ bản

1. Lambda expression ra đời để giải quyết vấn đề gì so với anonymous class?
2. Cú pháp tổng quát của lambda (`(params) -> body`) gồm những biến thể nào?
3. Khi nào cần dấu ngoặc quanh tham số, dấu ngoặc nhọn trong body, và `return`?
4. Lambda có phải là đối tượng (instance) thật sự không? Nó thuộc loại nào ở runtime?
5. Khác biệt chính giữa lambda và anonymous inner class về từ khóa `this` và capture biến?
6. Lambda có thể tồn tại độc lập không hay luôn cần “target type”?
7. Lambda có thể có kiểu trả về `void`/generic không? Compiler suy luận thế nào?
8. Khác nhau giữa “lambda expression” và “method reference”?

---

# II) Functional Interface (SAM)

9. Functional interface là gì? Điều kiện tối thiểu để là functional interface?
10. Annotations `@FunctionalInterface` kiểm soát điều gì? Có bắt buộc không?
11. Interface có default/ static method có còn là functional interface không?
12. Trường hợp nào **không** phải functional interface dù có đúng 1 abstract method?
13. Tại sao nhiều API core (Collections, Streams) chọn dùng functional interface thay vì abstract class?
14. Những functional interface “chuẩn” trong `java.util.function` nhóm hóa theo gì (Supplier, Consumer, Function, Predicate, Operator)?
15. Variants primitive (IntConsumer, LongFunction, …) tồn tại để tối ưu điều gì?

---

# III) Target Typing & Type Inference

16. “Target typing” là gì? Tại sao lambda không có “type” nếu đứng một mình?
17. Quy tắc suy luận tham số của lambda khi bỏ kiểu (`(x, y) -> x + y`)?
18. Khi inference thất bại cần khai báo kiểu tường minh ở đâu?
19. Overload resolution với lambda: compiler quyết định chọn method nào khi có nhiều chữ ký?
20. Ảnh hưởng của tham số generic tới inference của lambda trong method chain?
21. `var` trong tham số lambda (Java 11+) dùng để làm gì? Khi nào hữu ích?
22. Kết hợp `var` với annotations trên tham số lambda (e.g., `@Nonnull var x`)—quy tắc?

---

# IV) Scope, Capture & “Effectively Final”

23. Lambda capture biến “tự do” (free variables) như thế nào?
24. “Effectively final” là gì? Vì sao bắt buộc với biến local được capture?
25. Tại sao không thể mutate trực tiếp biến local đã capture? Workaround tinh gọn?
26. Khác biệt “capture-by-value” vs “capture-by-reference” trong Java lambda?
27. `this` trong lambda trỏ tới đâu? So với anonymous class thì khác thế nào?
28. Có thể truy cập biến `private` của enclosing class từ lambda không?
29. Capture biến tham chiếu tới đối tượng mutable: hệ lụy thread-safety?

---

# V) Method References

30. Các dạng method reference: `Class::staticMethod`, `inst::method`, `Class::instanceMethod`, `Class::new`—khác nhau thế nào?
31. Khi nào nên ưu tiên method reference thay vì lambda inline?
32. Constructor reference (`Type::new`) mapping sang functional interface có `get()`/`apply()` như thế nào?
33. “Receiver as first arg” trong `Class::instanceMethod` hoạt động ra sao?
34. Method reference có giúp inference tốt hơn/ kém hơn lambda không?

---

# VI) Exception Handling với Lambda

35. Lambda có thể ném checked exception không? Ràng buộc của functional interface?
36. Chiến lược xử lý checked exception trong lambda: bọc (wrap), “sneaky throw”, adapter… trade-offs?
37. `Stream` operations + exception: patterns để giữ pipeline sạch mà không nuốt lỗi?
38. `CompletableFuture` + lambda: propagate exception như thế nào?

---

# VII) Generics & Higher-Order Functions

39. Lambda như đối số generic: chữ ký `Function<T,R>`/`Predicate<T>` ảnh hưởng inference thế nào?
40. Lambda trả về lambda (higher-order): cách khai báo type an toàn?
41. Currying/partial application trong Java: có cần util helper không?
42. `Comparator.comparing`/`thenComparing`: inference và wildcard `? super T` đóng vai trò gì?
43. `map` vs `flatMap`: tại sao `flatMap` cần lambda trả về `Stream<U>` thay vì `U`?

---

# VIII) Streams & Lambda—Thiết kế & Thực hành

44. Vì sao Streams API đi kèm lambda? Liên hệ lazy vs terminal operations?
45. Stateless vs stateful intermediate ops: vai trò lambda trong hai loại này?
46. Side-effects trong lambda của Streams: khi nào chấp nhận được? Khi nào gây bug?
47. Parallel stream + lambda: thread-safety yêu cầu gì cho capture state?
48. Biến đổi “I/O heavy” trong lambda: backpressure/`CompletableFuture` kết hợp thế nào?
49. `Collectors` và lambda: phân tích chữ ký `toMap`, `groupingBy`, `mapping`…

---

# IX) Concurrency, Threading & Scheduling

50. Dùng lambda để truyền `Runnable`, `Callable`: khác biệt về return/exception?
51. Deadlock/starvation không liên quan lambda, nhưng patterns nào dễ tạo race khi capture mutable?
52. `ExecutorService`/`CompletableFuture` + lambda: tips tránh nuốt exception và memory leak?
53. Lambdas có “synchronized” block bên trong—mùi code smell hay hợp lý?

---

# X) Hiệu năng & Bộ nhớ

54. Lambda có overhead runtime không so với anonymous class? (allocation, class loading)
55. Escape analysis & inlining với lambda: JIT tối ưu ra sao trong hot path?
56. Boxing/unboxing ẩn trong lambda (đặc biệt với `Stream`): tránh thế nào bằng primitive streams?
57. `for` truyền thống + `StringBuilder` vs `stream().map(...).collect(...)`: cân nhắc hiệu năng?
58. Memory footprint của capture variables và life-cycle đối tượng đóng kín (closure)?

---

# XI) Bytecode & `invokedynamic`

59. Lambda được biên dịch như thế nào (không tạo inner class cố định)?
60. Vai trò của `invokedynamic` và `LambdaMetafactory` trong triển khai lambda?
61. Tại sao hai lambda “giống hệt” có thể chia sẻ implementation?
62. Ảnh hưởng của thay đổi chữ ký functional interface tới binary compatibility của lambda call site?

---

# XII) Overload Resolution & Ambiguity

63. Khi hai overload đều chấp nhận functional interface khác nhau, làm sao disambiguate?
64. Dùng cast `(Function<A,B>)` để “gợi ý” compiler: khi nào cần?
65. `removeIf` vs `remove` (Collections): ví dụ đụng độ overload với lambda?
66. `null` + overload functional interface: compiler chọn kiểu nào?

---

# XIII) Design Patterns với Lambda

67. Strategy/Command/Template Method refactor sang lambda: lợi ích và giới hạn?
68. Event/listener API: khi nào lambda làm code khó test hơn so với class riêng?
69. Dùng lambda để tạo DSL mini: giới hạn cú pháp ở Java?
70. Functional core, imperative shell—vai trò lambda trong kiến trúc này?

---

# XIV) Testing, Debugging & Readability

71. Lambda có tên không? Ảnh hưởng debug/stacktrace khi crash?
72. Cách log bên trong lambda mà không phá lazy evaluation hoặc làm nhiễu pipeline?
73. Viết unit test cho lambda: kiểm tra hành vi hay kiểm tra hàm thuần (pure function)?
74. Khi nào nên extract lambda thành method có tên để tăng đọc hiểu?

---

# XV) Serialization & Framework Interop

75. Lambda có serializable không? Khi nào “được” nhưng không nên dựa vào?
76. Jackson/Gson có serialize lambda không? Tại sao thường không?
77. Spring/Spring Data dùng lambda ở đâu (method reference trong repos, specs)? Rủi ro?
78. MapStruct/BeanUtils có thể xử lý lambda như bean/POJO không?

---

# XVI) Bẫy thường gặp (Tricky Bits)

79. Dùng lambda để cập nhật biến local trong loop—vì sao compile lỗi hoặc hành vi khó đoán?
80. `this`/`super` trong lambda không phải của lambda—hệ quả khi gọi method protected/private?
81. Lambda “nuốt” exception trong stream + collector: tại sao bug khó thấy?
82. Lambda tạo reference memory leak tới outer class/context—những tình huống nào?
83. So sánh `Predicate.isEqual(x)` vs `a -> a.equals(x)`—edge cases `null`?
84. “Method reference đẹp hơn” không phải lúc nào đúng—khi nào nên ưu tiên lambda rõ ràng?
85. Recursion với lambda: vì sao không trực tiếp, cần helper (e.g., `UnaryOperator<T>[] ref`)?
86. Tail-recursion không được tối ưu trong JVM—ảnh hưởng thiết kế hàm đệ quy?

---

# XVII) Annotations & Constraints

87. Đặt annotation lên tham số lambda thế nào? So với đặt lên method reference?
88. Dùng annotations (validation) trên functional interface vs trên lambda param—khác biệt tool support?
89. JSpecify/Nullness annotations với lambda: compiler hiểu được tới mức nào?

---

# XVIII) API Design với Lambda

90. Khi nào nên nhận `Supplier<T>` thay vì `T` để hoãn tính toán?
91. `Optional.orElse` vs `orElseGet(Supplier)`—lambda giúp tối ưu nhánh đắt?
92. Thiết kế API có callback lambda: lifecycle, threading model phải document ra sao?
93. Có nên trả về lambda từ public API? Ảnh hưởng binary compatibility?
94. Khi chuyển API từ listener interface sang lambda, bảo toàn backward compatibility thế nào?

---

# XIX) Interop & Ngôn ngữ khác

95. Kotlin/Scala closures vs Java lambda: những khác biệt quan trọng (reified, inline functions)?
96. Sử dụng lambda từ Java 8 trong Android cũ bằng desugar tools—giới hạn nào?
97. Gọi Java lambda từ Kotlin: SAM adapters hoạt động ra sao?

---

# XX) Bài tập/Thiết kế (Challenge)

98. Viết `retry(int times, Supplier<T>)` sử dụng lambda để retry có backoff.
99. Tạo `memoize(Function<A,B>)` an toàn thread dựa trên lambda.
100. Viết `compose(Function<A,B>, Function<B,C>) -> Function<A,C>`.
101. Triển khai `debounce(Consumer<T>, long delay)` dùng `ScheduledExecutorService`.
102. Viết `withResource(Supplier<R>, Function<R,T>)` đóng resource tự động (không dùng try-with-resources).
103. Viết `time(Supplier<T>)` trả về `Pair<T, Duration>` để benchmark lambda.
104. Thiết kế `lazy(Supplier<T>)` trả về proxy chỉ tính một lần, thread-safe.
105. Tạo `guard(Predicate<T>, Function<T,R>, Function<T,R>)` chọn nhánh bằng lambda.