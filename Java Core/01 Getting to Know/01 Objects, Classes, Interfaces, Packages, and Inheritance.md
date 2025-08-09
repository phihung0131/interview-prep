# Java Core: Objects, Classes, Interfaces, Packages, and Inheritance

## **I. Objects**

1. Object trong Java là gì? Nó khác gì với instance?
2. Object lưu ở đâu trong bộ nhớ JVM (heap/stack/metaspace)?
3. Object có những đặc điểm nào (state, behavior, identity)?
4. Làm sao để tạo object mới trong Java? Các cách khác nhau?
5. Khác nhau giữa `new` và factory method khi tạo object?
6. Khi nào object trở thành eligible for garbage collection?
7. So sánh shallow copy và deep copy của object.
8. `clone()` hoạt động như thế nào? Khi nào cần implement `Cloneable`?
9. Tại sao `Object` là class cha của mọi class trong Java?
10. Các phương thức quan trọng của `Object` class là gì? (equals, hashCode, toString, clone, getClass, wait, notify...)
11. Cơ chế của `equals()` và `hashCode()` khi so sánh object?
12. Tại sao nên override cả `equals()` và `hashCode()` cùng lúc?
13. `toString()` có tác dụng gì? Khi nào nên override?
14. Nếu 2 object bằng nhau (`equals`), hashCode của chúng có bắt buộc giống nhau không?
15. Có thể thay đổi state của một object immutable không? Ví dụ với String.

---

## **II. Classes**

16. Class là gì? Khác gì với object?
17. Class gồm những thành phần nào (fields, methods, constructors, nested classes...)?
18. Khác nhau giữa instance variables và static variables?
19. Khác nhau giữa instance methods và static methods?
20. Static initialization block dùng để làm gì?
21. Khác nhau giữa inner class, static nested class, local class, anonymous class?
22. Anonymous class dùng khi nào? Hạn chế?
23. Static nested class khác gì inner class thông thường?
24. `this` keyword hoạt động ra sao trong class?
25. Tại sao constructor không có kiểu trả về?
26. Overloading constructor khác gì overloading method?
27. Khi nào cần `private` constructor? (Singleton, factory pattern)
28. Có thể tạo class mà không có constructor không? JVM xử lý thế nào?
29. Lớp abstract có thể có constructor không?
30. Khác biệt giữa final class và abstract class?

---

## **III. Interfaces**

31. Interface là gì? Mục đích sử dụng?
32. Khác nhau giữa interface và abstract class?
33. Interface có thể chứa những loại thành phần nào? (field, method, default method, static method, private method)
34. Tại sao fields trong interface mặc định là `public static final`?
35. Default method trong interface xuất hiện từ phiên bản nào? Lợi ích?
36. Static method trong interface có được kế thừa không?
37. Một class có thể implement nhiều interface không?
38. Interface có thể kế thừa interface khác không?
39. Functional interface là gì? Annotation `@FunctionalInterface` dùng để làm gì?
40. Interface có thể extend nhiều interface cùng lúc không?
41. Interface có thể extend class không?
42. Có thể khai báo constructor trong interface không?
43. Interface có thể khai báo `private` method từ Java 9 — tại sao?

---

## **IV. Packages**

44. Package trong Java là gì? Tác dụng?
45. Tại sao cần tổ chức code theo package?
46. Khác nhau giữa package mặc định và package do người dùng định nghĩa?
47. Cú pháp khai báo package trong file Java?
48. Quy tắc đặt tên package?
49. Import package hoạt động thế nào?
50. Có thể import static members không? Khi nào nên dùng?
51. Sự khác biệt giữa `import java.util.*;` và `import java.util.ArrayList;`?
52. Nếu có 2 class trùng tên ở các package khác nhau, xử lý thế nào?
53. Package-private access modifier là gì?
54. Có thể tạo subpackage như `com.example.utils` không? JVM xử lý thế nào?
55. Tại sao `java.lang` không cần import thủ công?

---

## **V. Inheritance**

56. Inheritance là gì? Lợi ích và nhược điểm?
57. Khác nhau giữa single inheritance và multiple inheritance?
58. Tại sao Java không hỗ trợ multiple inheritance với class?
59. Từ khóa `extends` dùng cho class và interface khác nhau thế nào?
60. Class có thể vừa extend một class vừa implement interface không?
61. Khi nào nên dùng kế thừa, khi nào nên dùng composition?
62. Override method là gì? Quy tắc override?
63. Overloading method khác gì override method?
64. Khi override method, có thể thay đổi phạm vi truy cập (access modifier) không?
65. Khi override, có thể khai báo exception khác không? (checked, unchecked)
66. Từ khóa `super` dùng làm gì?
67. Khi nào constructor gọi `super()` tự động?
68. Có thể gọi constructor cha từ constructor con không?
69. Nếu class cha không có constructor mặc định, subclass xử lý thế nào?
70. Final method có thể override không?
71. Abstract method có thể final không?
72. Interface method có thể override thành static method không?
73. Khi một class implement 2 interface có default method trùng nhau, xử lý ra sao?
74. Dynamic method dispatch là gì? Cách hoạt động của JVM?
75. Upcasting và downcasting trong kế thừa là gì? Khi nào cần?
76. `instanceof` hoạt động thế nào trong context kế thừa?
77. Có thể tạo chuỗi kế thừa nhiều cấp (multi-level inheritance) không?
78. Constructor của class cha được gọi bao nhiêu lần khi tạo object subclass?
79. Tại sao không nên sử dụng kế thừa quá sâu (deep inheritance)?
80. Tại sao nên hạn chế sử dụng kế thừa trong Java?
81. Có thể sử dụng interface để thay thế kế thừa không? Lợi ích của việc này?
82. Tại sao nên sử dụng interface thay vì class abstract?
83. Có thể sử dụng interface để tạo contract cho class không? Lợi ích?
84. Tại sao nên sử dụng interface để tách biệt implementation và contract?
85. 