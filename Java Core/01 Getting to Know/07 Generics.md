# I) Fundamentals — Khái niệm & Cú pháp cơ bản

1. Generics giải quyết vấn đề gì so với kiểu thô (raw types)?
2. Khai báo class generic tối thiểu trông như thế nào? (`class Box<T> { ... }`)
3. Khai báo **method generic** khác gì **class generic**? (`<T> T id(T x)`)
4. Có thể vừa có **type parameter ở class** vừa **type parameter ở method** cùng lúc không?
5. Type parameter đặt ở đâu trong chữ ký method (trước return type hay sau)? Vì sao?
6. Quy ước đặt tên type parameter (T, E, K, V, R, X...) có ý nghĩa gì?
7. Raw type là gì? Vì sao nên tránh? Hậu quả về safety và warnings?
8. Generic có thể dùng với **primitive** không? Vì sao không?
9. `new ArrayList<String>()` vs `new ArrayList<>()` (diamond operator) khác nhau thế nào?
10. Có thể **static import** với generic type không? (ý nghĩa/giới hạn)

---

# II) Type Parameters & Bounds — Ràng buộc kiểu

11. `T extends Number` nghĩa là gì? Có cho phép `T` là interface không?
12. **Multiple bounds**: `T extends Number & Comparable<T>`—thứ tự `extends` và `&` có ràng buộc gì?
13. Dùng **interface** trong bounds có khác gì dùng **class** không?
14. Có **lower bounds** trên **type parameter** không (khác với wildcard)?
15. Ràng buộc đệ quy (F-bounded polymorphism): `T extends Comparable<T>` giải quyết vấn đề gì?
16. Intersection types trong bounds dùng khi nào?
17. Có thể ràng buộc `T` **không cho phép null** ở mức ngôn ngữ hiện tại không? (design trade-offs)

---

# III) Wildcards & Variance — `?`, `? extends`, `? super`

18. Wildcard `?` khác gì type parameter `T` trong API design?
19. Quy tắc **PECS** (Producer Extends, Consumer Super) là gì? Ví dụ điển hình.
20. `List<? extends Number>` có cho phép `add` phần tử không? Vì sao?
21. `List<? super Integer>` có đọc được phần tử kiểu `Integer` ra an toàn không?
22. Khi nào nên chọn `List<T>` thay vì `List<? extends T>` trong chữ ký hàm?
23. Sự khác nhau giữa `Comparator<? super T>` và `Comparator<T>` trong Collections API?
24. **Wildcard capture** là gì? Tại sao đôi khi cần **helper method** để “capture”?
25. `<? extends T>` trong return type có ý nghĩa gì với người dùng API?
26. `? extends` lồng nhau (e.g., `List<? extends List<? extends Number>>`)—có hữu ích thực tế không?
27. So sánh **variance** của generics Java (invariant) với **covariant arrays**; hệ quả về an toàn kiểu.
28. Tại sao `List<Object>` **không** là supertype của `List<String>`?
29. `Map<? extends K, ? extends V>` khi nào hợp lý? Rủi ro cập nhật dữ liệu?
30. `Optional<? extends T>` vs `Optional<T>`—tại sao hiếm khi cần wildcard ở Optional?

---

# IV) Generic Methods, Constructors & Static

31. Khai báo **constructor generic** (`<T> Foo(T x)`) hợp lệ không? Dùng khi nào?
32. **Static method generic** có thể sử dụng type parameter của class không?
33. Type parameter **shadowing**: khi method khai báo `<T>` trùng tên với class `<T>`—hệ quả?
34. Overload method generic vs non-generic: cách compiler chọn overload?
35. Có thể đặt **default value** cho type parameter ở Java không?
36. Bắt buộc khai báo **explicit type arguments** khi nào? (`<String>foo(...)`)
37. **Generic factory** patterns: tạo instance qua method generic vs constructor—ưu/nhược?

---

# V) Type Inference — Suy luận kiểu

38. Type inference hoạt động thế nào cho **method generic**?
39. Ảnh hưởng của **diamond operator** tới inference ở dòng khởi tạo biến?
40. Inference với **lambdas**/method references: target typing quyết định ra sao?
41. Tại sao đôi khi compiler “bó tay” và cần chỉ định `<T>` tường minh?
42. Inference với **chaining** (method fluent API): vấn đề “self type” và giải pháp?
43. Inference khi kết hợp **wildcards** và **type parameters** cùng lúc—pitfalls?

---

# VI) Erasure — Xoá kiểu & Hệ quả

44. **Type erasure** là gì? Tại sao Java chọn erasure thay vì reified generics?
45. Erasure ảnh hưởng gì đến **reflection**?
46. Tại sao không thể `new T[]` hoặc `new T()` trong generic code?
47. Vì sao `instanceof List<String>` không hợp lệ, phải dùng `instanceof List<?>`?
48. Erasure và **bridge methods**: tại sao compiler sinh bridge? Ví dụ kinh điển với `Comparable`.
49. Erasure & **binary compatibility**: thay đổi chữ ký generic có thể phá gì?
50. Erasure khiến `List<Integer>` và `List<String>` có **cùng runtime class**—hệ quả?

---

# VII) Arrays, Varargs & Heap Pollution

51. Vì sao **generic arrays** bị cấm? (heap pollution)
52. `List<String>[]` có hợp lệ không? Workaround nào?
53. Varargs với generic (`List<T>...`) gây **heap pollution** như thế nào?
54. Dùng `@SafeVarargs` khi nào hợp lệ? (ràng buộc `static`, `final`, `private`/Java 9+)
55. Sự khác nhau giữa `@SafeVarargs` và `@SuppressWarnings("unchecked")` về ý nghĩa an toàn.
56. Thiết kế API: tránh trả về hoặc nhận vào **array of parameterized types** như thế nào?

---

# VIII) Collections, Streams & Optionals

57. Tại sao `Collections.max` dùng `Comparator<? super T>`?
58. `Stream<T>`: ý nghĩa type parameter trong `map`, `flatMap`, `collect`?
59. `flatMap` biến đổi `Stream<Stream<R>>` thành `Stream<R>` thông qua generics ra sao?
60. `Collectors.toMap` có chữ ký generic phức tạp—giải thích các tham số type của nó.
61. `Optional<T>` trong pipeline generics: khi nào gây “nested generics” khó đọc?
62. Thiết kế method generic trả về `Optional<T>` vs ném exception—trade-offs?
63. `Comparator.comparing`/`thenComparing` với method references: inference diễn ra thế nào?
64. `Map.computeIfAbsent` và wildcards: vì sao thường dùng `? super K`/`? extends V`?

---

# IX) Exceptions & Generics

65. Tại sao **không** thể khai báo `catch (T e)` với generic type?
66. Có thể `throws T` (generic) không? Nếu không, tại sao?
67. **Generic exception wrapper** pattern: bọc checked thành unchecked—thiết kế đúng cách?
68. Lambda + checked exceptions: chiến lược “sneaky throws” có rủi ro gì?

---

# X) Reflection, Type Tokens & Metadata

69. Làm sao kiểm tra một field là `List<String>` hay `List<?>` qua reflection?
70. Phân biệt `Class<T>` vs `Type` vs `ParameterizedType` vs `TypeVariable` vs `WildcardType`.
71. **Type token** pattern (e.g., `Class<T>`, `TypeReference<T>`) giải quyết gì khi erasure làm mất thông tin?
72. Cách viết API nhận `Class<T>`/`Type` để deserialize JSON thành `List<Foo>`?
73. Giới hạn của type token khi lồng nhiều lớp generics (e.g., `Map<String, List<Foo>>`)?

---

# XI) Design & API Best Practices

74. Chọn `List<T>` hay `Collection<T>` trong API param/return cho tính **tối thiểu hoá giả định**?
75. Khi nào nên dùng `? extends` ở **input** vs **output**? Áp dụng quy tắc PECS thực tế.
76. Thiết kế **immutable API** với generics: trả về `List<T>` hay `List<? extends T>`?
77. Tránh rò rỉ implementation type parameter (leaky abstraction) như thế nào?
78. Đặt **upper bound** hẹp (`T extends Number & Comparable<T>`) để tăng an toàn—có làm API khó dùng?
79. Hạn chế dùng raw type, khi buộc phải dùng thì **khoanh vùng** và **document** ra sao?
80. Nên **prefer wildcards** trong API hay **type params**? Các tiêu chí lựa chọn.
81. Fluency API với **self-types** (CRTP): `class Builder<T extends Builder<T>>`—tránh cast thế nào?
82. **Builder generics** đa tầng (nested builders) giữ type safety ra sao?
83. Thiết kế **covariant return type** cho hierarchy generic để dễ mở rộng?
84. Khi nào dùng **bounded type parameter** thay vì **bounded wildcard** trên cùng một chữ ký?
85. Quy tắc đặt **visibility** cho type parameter (public API vs internal).

---

# XII) Edge Cases & Tricky Bits

86. Overload `foo(List<String>)` và `foo(List<Integer>)` có hợp lệ không? Vì sao?
87. Overload `foo(List<T>)`/`foo(List<?>)`—compiler chọn cái nào?
88. Tại sao `Collections.emptyList()` trả về `List<Object>` nhưng dùng được cho `List<String>`? (type inference)
89. `Comparable` và `compareTo`: vì sao thường thấy `Comparable<? super T>`?
90. Tại sao `Enum` không generic nhưng `Class<T>` lại generic?
91. Bridge methods gây ra những ghi log khó hiểu (stacktrace/reflect) — nhận biết và xử lý?
92. Generics + `equals`/`hashCode`: có rủi ro gì khi dùng wildcards làm key Map/Set?
93. **Unchecked cast** nào có thể chứng minh an toàn? (ví dụ tạo mảng `@SuppressWarnings`)
94. Tại sao `Supplier<List<String>>` **không** là subtype của `Supplier<List<Object>>`?
95. Tại sao `Function<A, B>` **không** contravariant ở tham số và covariant ở return như lý thuyết?
96. Co/contra-variance mô phỏng qua **wildcards** thay vì type constructor variance—ý nghĩa.
97. **Recursive generics** nhiều cấp có đọc được không? Khi nào nên refactor?
98. Interop với Kotlin/Scala (reified, variance annotations): cạm bẫy khi gọi từ Java?
99. Ảnh hưởng của generics tới **JIT/inlining** và **escape analysis** (ở mức cao)?
100. Thay đổi chữ ký generic trong thư viện public: hướng dẫn **binary/source compatibility** an toàn?
101. API public trả về `Stream<? extends T>`: người dùng có bị “kẹt” khi cần mutate collection?
102. Dùng `Class<? extends Annotation>` trong reflection filters: vì sao dùng `extends` ở đây?
103. `Callable<T>` vs `Runnable`: vì sao một cái generics, cái kia không?
104. `CompletableFuture<T>`: generic của các combinators (`thenCompose`, `thenCombine`) hoạt động ra sao?
105. `Optional.orElseGet(Supplier<? extends T>)`: vì sao dùng `? extends T` ở supplier?
106. `Comparator<T>` vs `Comparable<T>`: thiết kế generic nào phù hợp từng tình huống?
107. `Map.merge`/`compute` generic signatures và wildcard—vì sao nhìn “xoắn não”?
108. `ServiceLoader<S>`: tại sao dùng type parameter ở đây?
109. Generics và `var` (Java 10): khi nào giúp/ khi nào che khuất type gây bug?
110. “Curiously Recurring Template Pattern” với hierarchies sâu: khi nào nên dừng?

---

# XIII) Bài tập thiết kế/đọc hiểu (thử thách nhanh)

111. Viết chữ ký generic cho hàm `copy` từ `List<? extends T>` sang `List<? super T>` theo PECS.
112. Viết API `max` nhận `Collection<? extends T>` và `Comparator<? super T>` trả `T`.
113. Tạo `ImmutableList<T>`: đảm bảo không rò rỉ mutability qua methods với wildcards.
114. Viết helper “capture” chuyển `List<?>` thành `List<T>` an toàn trong một phương thức generic.
115. Thiết kế builder kiểu **self-type** cho subclassing fluent API mà không cần cast tay.
116. Triển khai `topK` cho `Stream<T>` với comparator generic, giữ type safety.
117. Viết `zip` cho hai `List<A>` & `List<B>` → `List<Pair<A,B>>` (generic đôi).
118. Viết `groupingBy` tùy biến trả về `Map<K, List<V>>` chỉ với generics core (không dùng Collectors).
119. Viết `Either<L,R>` (sum type) bằng generics: API an toàn và ergonomic.
120. Viết `TypeToken<T>` đơn giản để giữ lại thông tin parametrized type qua anonymous subclass.
