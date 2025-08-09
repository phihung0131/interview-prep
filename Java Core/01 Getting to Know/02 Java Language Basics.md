# **Java Language Basics – Full Question List (Deep Dive)**

---

## **I. Giới thiệu & Cấu trúc chương trình**

1. Java là ngôn ngữ biên dịch hay thông dịch? Cơ chế `compile → bytecode → JVM` hoạt động ra sao?
2. JDK, JRE, JVM khác nhau thế nào?
3. Một chương trình Java tối thiểu cần những thành phần nào?
4. Giải thích ý nghĩa của `public static void main(String[] args)`. Tại sao `main` phải là `static`?
5. Có thể đổi tên `args` trong `main` không?
6. Nếu không có method `main` thì chạy được chương trình không? Tại sao?
7. `javac` và `java` khác nhau thế nào?
8. File `.java` và `.class` khác nhau gì?
9. Quy tắc đặt tên class, method, biến, và package trong Java?
10. Java case-sensitive nghĩa là gì?

---

## **II. Variables & Scope**

11. Phân biệt biến **local**, **instance**, và **static**.
12. Biến local có giá trị mặc định không?
13. Từ khóa `var` xuất hiện từ Java mấy? Có giới hạn gì?
14. Sự khác nhau giữa `final` variable và `static final` variable?
15. Variable shadowing là gì?
16. Biến trong block (scope) hoạt động như thế nào?
17. Có thể khai báo biến cùng tên trong nested scope không?
18. Tại sao Java không hỗ trợ biến global như C?

---

## **III. Primitive Types & Reference Types**

19. Liệt kê 8 kiểu dữ liệu nguyên thủy (primitive types) trong Java.
20. Kích thước và phạm vi giá trị của từng kiểu primitive?
21. Kiểu `char` trong Java lưu Unicode hay ASCII?
22. Kiểu `boolean` trong Java lưu mấy bit?
23. Boxing và unboxing là gì? Tự động hay thủ công?
24. Tại sao `String` không phải kiểu nguyên thủy mà là immutable class?
25. `null` có phải giá trị hợp lệ của primitive không?
26. Sự khác nhau giữa primitive và reference type về bộ nhớ lưu trữ?

---

## **IV. Operators**

27. Liệt kê các nhóm toán tử trong Java.
28. `==` khác gì `.equals()`?
29. `===` có tồn tại trong Java không?
30. Toán tử `instanceof` hoạt động thế nào?
31. Toán tử `?:` là gì? Dùng trong trường hợp nào?
32. Toán tử `&` và `&&` khác gì?
33. Toán tử `|` và `||` khác gì?
34. Toán tử `>>>` dùng để làm gì?
35. Toán tử `+=` khi áp dụng với String hoạt động thế nào?

---

## **V. Control Flow**

36. Câu lệnh `if-else` hoạt động thế nào?
37. Sự khác nhau giữa `switch` và `if-else`? Khi nào dùng mỗi cái?
38. `switch` hỗ trợ kiểu dữ liệu nào? (Java 7+, 14+ pattern matching)
39. Enhanced `switch` (Java 14) khác gì so với switch cũ?
40. Vòng lặp `for`, `while`, `do-while` khác nhau thế nào?
41. Enhanced for loop (`for-each`) dùng cho loại dữ liệu nào?
42. Từ khóa `break` và `continue` khác nhau ra sao?
43. Label trong Java là gì? Có tác dụng gì với vòng lặp lồng nhau?
44. Có thể dùng `return` trong vòng lặp không?
45. Sự khác nhau giữa `throw` và `return` khi kết thúc luồng thực thi?

---

## **VI. Arrays**

46. Cách khai báo mảng 1 chiều trong Java?
47. Mảng trong Java có fixed size không?
48. Khác nhau giữa mảng primitive và mảng reference type?
49. Khác nhau giữa `int[] a` và `int a[]`?
50. Cách khởi tạo mảng với giá trị mặc định?
51. Mảng 2 chiều (jagged array) là gì?
52. Có thể thay đổi kích thước mảng sau khi tạo không?
53. ArrayIndexOutOfBoundsException xảy ra khi nào?
54. Arrays utility class (`Arrays.sort`, `Arrays.equals`, `Arrays.toString`) dùng thế nào?
55. `Arrays.asList()` trả về gì? Có thể thêm phần tử mới không?

---

## **VII. Strings**

56. String pool là gì?
57. `String s1 = "abc"` và `String s2 = new String("abc")` khác nhau thế nào?
58. Tại sao `String` immutable? Lợi ích?
59. `StringBuilder` và `StringBuffer` khác nhau gì?
60. Khi nào nên dùng StringBuilder thay vì String concatenation?
61. `concat()` và `+` với String khác nhau gì về hiệu năng?
62. So sánh `equals()` và `compareTo()` trong String.
63. Cách tách chuỗi (`split`), thay thế (`replace`), và định dạng (`format`) trong Java?

---

## **VIII. Type Casting**

64. Implicit casting (widening) và explicit casting (narrowing) khác nhau thế nào?
65. Tại sao cần cast khi chuyển từ double sang int?
66. Casting với reference type khác gì với primitive?
67. Khi nào xảy ra `ClassCastException`?
68. Dùng `instanceof` để kiểm tra trước khi cast như thế nào?

---

## **IX. Static & Final**

69. Static variable/method được nạp vào bộ nhớ khi nào?
70. Static block chạy khi nào?
71. Final variable khác gì với constant?
72. Final method và final class dùng để làm gì?
73. Có thể khai báo local variable là final không?
74. Effectively final là gì (Java 8)?

---

## **X. Miscellaneous**

75. Comment trong Java có mấy loại?
76. Java hỗ trợ kiểu dữ liệu unsigned không?
77. Lệnh `assert` dùng để làm gì?
78. Từ khóa `transient` nghĩa là gì?
79. Từ khóa `volatile` có phải thuộc language basics không? (giải thích ngắn)
80. Từ khóa `synchronized` dùng để làm gì?
81. Default values của từng loại biến trong Java?
82. `System.out.println` thực chất là gì?
83. Cơ chế overloading hoạt động thế nào?
84. Khác nhau giữa overloading và overriding ở mức ngôn ngữ?

---

## **XI. Java từ phiên bản mới**

85. `var` trong Java 10 hoạt động ra sao?
86. `switch` expressions (Java 14) có ưu điểm gì?
87. Text blocks (Java 15) là gì?
88. Pattern matching for instanceof (Java 16) khác gì cách cũ?
89. Record class (Java 14) là gì?
90. Sealed classes (Java 17) dùng để làm gì?
