# I) Tư duy & Nguyên lý

1. “Lập trình hàm” trong bối cảnh Java Core nghĩa là gì (không phải Haskell)? Mục tiêu khi refactor sang functional là gì?
2. “Pure function”, “referential transparency”, “side-effect” — định nghĩa và cách kiểm tra trong Java?
3. “Transform, don’t mutate” nghĩa là gì với cấu trúc dữ liệu Java tiêu chuẩn?
4. Khi nào **không** nên refactor imperative sang functional (VD: hot path siêu tối ưu, thao tác I/O ràng buộc thứ tự)?
5. Tiêu chí đánh giá refactor: **độ rõ ràng**, **tính tổng quát**, **khả năng test**, **hiệu năng**, **thread-safety** — bạn ưu tiên thế nào?

---

# II) Nhận diện “mùi” imperative & mapping sang functional

6. Những “mùi” thường gặp: biến tích lũy thay đổi liên tục, nhiều `if` lồng, vòng lặp lồng, break/continue nhiều, cờ trạng thái tạm… -> map sang `map/filter/reduce` ra sao?
7. Khi thấy pattern “lọc rồi thao tác”: `if (…) { list.add(f(x)); }` — chuyển thành pipeline gì?
8. Pattern “tìm phần tử đầu tiên/any”: thay `for + break` bằng gì?
9. Pattern “tính tổng/đếm/cực trị”: thay biến tích lũy bằng `sum/count/min/max/reducing` thế nào?
10. Pattern “nhóm/phân loại/đếm theo nhóm”: thay `Map.put/get` thủ công bằng `groupingBy/partitioningBy` thế nào?

---

# III) Từ loop sang Stream API (đơn cấp)

11. Quy trình cơ bản để refactor `for/foreach` sang `stream()` gồm những bước nào?
12. Chọn `map`, `filter`, `peek`, `forEach` đúng vai trò; khi nào **không** dùng `peek`?
13. Khi pipeline có điều kiện phức tạp: nên chia nhỏ thành nhiều `filter` hay gộp một điều kiện lớn? Trade-offs?
14. Refactor “ép kiểu + bỏ null” thường gặp: `filter(Objects::nonNull)` + `map(Sub::cast)` — có pattern sạch hơn?
15. `findFirst` vs `findAny` khác gì trong pipeline tuần tự và song song?

---

# IV) Từ loop lồng nhau sang `flatMap`

16. Nhận diện loop lồng xử lý cấu trúc lồng (list các list) → `flatMap` ra sao?
17. Case “sản sinh cặp (Cartesian product)” chuyển thành `flatMap` như thế nào?
18. Làm sao giữ điều kiện lọc giữa các cấp lồng nhau trong `flatMap` mà vẫn đọc dễ?
19. Khi dữ liệu lồng quá sâu (>2 cấp), nên dừng `flatMap` ở đâu và trích method phụ thế nào?

---

# V) Giảm biến trạng thái & side-effect

20. Biến tích lũy trong loop → chuyển thành `reduce/collect` thế nào?
21. Tại sao `forEach` + mutate collection bên ngoài là **mùi**? Thay bằng collector nào?
22. Khi cần cập nhật thống kê nhiều trường cùng lúc, dùng `collectingAndThen`, `teeing` (Java 12+) hay collector tuỳ biến?
23. Case buộc phải side-effect (ghi log, I/O): chèn ở đâu trong pipeline để không phá semantics?

---

# VI) `Optional` & Null-handling

24. Thay `if (x != null) {…}` bằng `Optional` như thế nào để không tạo **Optional of Optional**?
25. `map/flatMap/orElse/orElseGet/orElseThrow` — chọn đúng để tránh tính toán thừa?
26. `Optional.stream()` (Java 9+) giúp rút gọn pipeline thế nào?
27. Tránh lạm dụng `Optional` làm field trong POJO — khi nào hợp lý/chưa hợp lý trong refactor?

---

# VII) Primitive streams & boxing

28. Khi nào chuyển sang `IntStream/LongStream/DoubleStream` để tránh boxing?
29. Tác động của boxing/unboxing ẩn trong pipeline tới hiệu năng và GC?
30. Pattern tính tổng `BigDecimal`/`long` an toàn trong stream (đặc biệt overflow)?

---

# VIII) `collect`, `Collectors` & cấu trúc dữ liệu

31. Khi nào chọn `collect(toList())` vs `toSet()` vs `toCollection(TreeSet::new)`?
32. `groupingBy` vs `groupingByConcurrent` — khi nào dùng, có yêu cầu gì về thread-safety?
33. `mapping`, `filtering`, `flatMapping` collector (Java 9+) dùng để ghép bộ xử lý gọn hơn thế nào?
34. `partitioningBy` khác `groupingBy(Predicate)` ra sao?
35. `collectingAndThen` hữu ích khi nào?
36. Thiết kế **Collector custom**: identity, accumulator, combiner, finisher, characteristics — xác định thế nào?
37. Ràng buộc **associativity** của combiner/accumulator ảnh hưởng gì tới đúng-sai của kết quả?

---

# IX) `reduce` đúng cách

38. Khi nào dùng `reduce` thay vì `collect`?
39. `reduce` ba tham số (identity, accumulator, combiner) — ý nghĩa và bẫy khi identity **không** là phần tử trung tính?
40. Vì sao `reduce` không thích hợp cho việc mutating container (VD: `reduce` + `addAll`)?
41. Ví dụ `reduce` sai vì **không** kết hợp được ở parallel; cách sửa sang `collect`?

---

# X) Điều khiển luồng chức năng (short-circuit, ordering)

42. `anyMatch`, `allMatch`, `noneMatch` — refactor từ `for + break` thế nào?
43. Bảo toàn **order**: khi nào cần `sorted`/`distinct`/`dropWhile`/`takeWhile` (Java 9+)?
44. Cost của `sorted` trong pipeline và cách trì hoãn/giảm chi phí sắp xếp?
45. Tính **lazy** của stream: làm sao phát hiện code “không thực thi” vì thiếu terminal operation?

---

# XI) Parallel streams (core)

46. Khi nào **không** nên dùng parallel stream? Ví dụ kinh điển gây chậm hơn.
47. Yêu cầu của accumulator/collector trong parallel: không side-effect, associative — kiểm chứng sao?
48. Ảnh hưởng của **order** tới parallel performance (VD: `findAny` vs `findFirst`)?
49. Cấu trúc dữ liệu nguồn (`ArrayList`, `LinkedList`, `Spliterator`) quyết định hiệu năng parallel thế nào?
50. I/O-bound trong parallel stream — vì sao thường không phù hợp?

---

# XII) Tái cấu trúc điều kiện & branching

51. Refactor chuỗi `if-else` nhiều nhánh sang `Map` + `Function`/`Supplier` hoặc `Enum` + behavior — khi nào hợp lý?
52. Dùng `filter`/`map` nhiều tầng vs dùng `switch` (Java 14+ switch expression) — tiêu chí chọn?
53. “Guard clause” trong functional refactor — cách làm gọn pipeline?

---

# XIII) Xử lý lỗi & ngoại lệ trong pipeline

54. Lambda ném checked exception: các chiến lược thuần core (wrap, adapter, `sneaky`) — ưu/nhược?
55. Thiết kế API thuần Java để đưa **ngữ cảnh lỗi** vào message mà không phá pipeline?
56. Làm sao log/đếm lỗi trong pipeline mà vẫn giữ tính thuần của transformation?

---

# XIV) Testability & Debuggability

57. Vì sao functional style giúp test dễ hơn (pure function, không trạng thái)?
58. Chiến lược test pipeline: **property-based** vs **example-based** trong Java core?
59. Debug pipeline: dùng `peek`/`map` phụ hay **trích method** + test riêng lẻ?
60. Snapshot test cho kết quả `Collector` phức tạp có đáng tin?

---

# XV) API & Thiết kế hàm

61. Public API nên trả `Stream<T>` hay `Collection<T>`? Ảnh hưởng tới tài nguyên và lazy?
62. Tránh “return stream rồi đóng resource” (leak/bug) — nguyên tắc an toàn nào?
63. Tham số đầu vào nên là `Collection` hay `Stream`? Tác động tới composability?
64. Hàm nên nhận **behavior** (functional param) ở đâu để tổng quát mà vẫn dễ dùng?

---

# XVI) Tạo stream đúng cách

65. Nguồn stream: `collection.stream()`, `Arrays.stream`, `Stream.of`, `Files.lines`, `Pattern.splitAsStream` — chọn đúng theo bài toán?
66. `Stream.iterate` (Java 9 có pred) vs `Stream.generate` — dùng khi nào cho sequence vô hạn?
67. `ofNullable` (Java 9): thay `Stream.of(x)` + null-check như thế nào?
68. Chuyển đổi `Map` sang stream (entrySet/keySet/values) và ngữ cảnh refactor thường gặp?

---

# XVII) Hiệu năng & bộ nhớ (core)

69. Khi nào pipeline tạo nhiều object tạm (boxing, tuple tạm)? Cách giảm phân bổ?
70. So sánh `for` truyền thống + `StringBuilder` với `stream().collect(joining())`: tiêu chí chọn?
71. Phân tích chi phí `distinct`/`groupingBy` lớn — memory-bound và chiến lược chia nhỏ pipeline?
72. Khi nào “pre-sort + linear stream” nhanh hơn “stream + grouping/sorting trong pipeline”?

---

# XVIII) Quy ước đặt tên & cấu trúc phương thức

73. Đặt tên method thuần chức năng nên phản ánh **what** hơn **how** — ví dụ?
74. Tách method cho từng bước `filter/map` lớn để dễ đọc & test — guideline nào là “vừa đủ”?
75. Khi pipeline dài > 5 bước: khi nào nên **ngắt** bằng biến trung gian vs **trích** thành method?

---

# XIX) Edge cases & bẫy thường gặp

76. Dùng `forEach` để mutate nguồn → race/bugs: cách phát hiện & thay thế?
77. `Optional.map` trả về `Optional<Optional<T>>`: vì sao xuất hiện và dùng `flatMap` ra sao?
78. `reduce` với identity sai (không trung tính) gây sai kết quả trong parallel — ví dụ điển hình?
79. `collect(toMap)` đụng key trùng → `IllegalStateException`: cách xử lý với merge function?
80. `sorted` trước `distinct` vs sau `distinct`: khác biệt hiệu năng/kết quả?
81. Dùng `peek` để logic nghiệp vụ (side-effect) — vì sao là anti-pattern?
82. “Stream consumed” — vì sao gọi 2 terminal liên tiếp trên cùng stream nổ lỗi? Giải pháp?
83. `Files.lines` trả stream phải đóng — pipeline + TWR tổ chức thế nào để an toàn?
84. Parallel stream + `HashMap` trong collector tự chế → race — nhận diện và sửa?
85. `mapToObj`/`boxed` lạm dụng gây boxing — khi nào cần primitive chuyên biệt?

---

# XX) Bài tập Refactor (challenge – core only)

86. Refactor: lọc nhân viên active, sort theo lương giảm dần, lấy top N, trả tên — từ `for` sang stream.
87. Refactor: tính tổng `BigDecimal` tiền giao dịch theo từng ngày (groupingBy + reducing).
88. Refactor: từ danh sách users → tất cả quyền (roles) duy nhất, theo alphabet (flatMap + distinct + sorted).
89. Refactor: đọc file lớn, bỏ dòng trống, trim, đếm số dòng bắt đầu bằng prefix (I/O + stream + short-circuit?).
90. Refactor: thay `if-else` nhiều nhánh xử lý command bằng `Map<String, Runnable>`/`Supplier<?>` + method reference.
91. Refactor: tìm **bất kỳ** đơn hàng quá hạn → dừng sớm (short-circuit) — từ `for` sang `anyMatch`.
92. Refactor: ghép 2 danh sách theo khóa (join nội) bằng stream (không framework).
93. Refactor: chuỗi thao tác số lớn → dùng `LongStream`/`IntStream` để tránh boxing.
94. Refactor: pipeline có `sorted` tốn kém → đưa `filter` lên trước, chứng minh lợi ích.
95. Refactor: collector tuỳ biến gộp nhiều thống kê (min/max/avg/count) trong **một pass**.

---

# XXI) Checklist kết thúc refactor

96. Pipeline đã **stateless** chưa? Còn side-effect ẩn không?
97. Có dùng đúng **primitive streams**? Có tránh boxing nơi cần?
98. `Optional` có bị lồng nhau/overuse?
99. Collector có đảm bảo **associativity** & đúng đặc tính khi chạy parallel?
100. Đã viết unit test cho từng bước (method nhỏ) và test end-to-end cho pipeline chưa?