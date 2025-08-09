# Java Core - Classes & Objects

## **I. Khái niệm cơ bản**

1. Class là gì? Object là gì? Khác nhau ra sao?
2. Một class trong Java gồm những thành phần nào? (fields, methods, constructors, nested classes, …)
3. Tại sao cần class thay vì chỉ dùng các hàm và biến toàn cục như C?
4. Làm sao để tạo một object từ class?
5. Object có những đặc điểm gì (state, behavior, identity)?
6. Class và object được lưu ở đâu trong bộ nhớ JVM?
7. Mối quan hệ giữa `Class` (java.lang.Class) và object là gì?
8. Có thể chạy chương trình Java mà không tạo object không?

---

## **II. Constructors**

9. Constructor là gì? Có kiểu trả về không?
10. Khác nhau giữa constructor và method thường?
11. Constructor mặc định (default constructor) là gì? Khi nào JVM tạo nó?
12. Có thể overload constructors không?
13. Khi nào cần `private` constructor? (ví dụ Singleton)
14. Có thể gọi constructor này từ constructor khác không? (`this(...)`)
15. Từ khóa `super()` trong constructor dùng để làm gì?
16. Nếu class cha không có constructor mặc định, subclass cần làm gì?
17. Có thể tạo abstract class có constructor không?
18. Constructor có thể `final` hoặc `static` không?

---

## **III. Fields & Methods**

19. Instance variable là gì? Khác gì với static variable?
20. Instance method khác gì static method?
21. Khi nào nên dùng static method thay vì instance method?
22. Access modifier (public, private, protected, default) ảnh hưởng thế nào tới fields và methods?
23. Tại sao nên để fields private và cung cấp getter/setter?
24. Khi nào dùng `this` keyword?
25. Có thể override static method không?
26. Final method có thể override không?
27. Abstract method có thể final không?

---

## **IV. Object Class (java.lang.Object)**

28. Tại sao mọi class trong Java đều kế thừa từ `Object`?
29. Các method quan trọng trong `Object` là gì? (equals, hashCode, toString, clone, getClass, wait, notify, …)
30. Tại sao nên override cả equals và hashCode cùng lúc?
31. Khi nào cần override toString()?
32. `clone()` hoạt động thế nào? Khác nhau giữa shallow copy và deep copy?
33. `getClass()` trả về gì?
34. Sự khác nhau giữa `==` và `.equals()` với object?

---

## **V. Nested & Inner Classes**

35. Nested class là gì? Có mấy loại?
36. Khác nhau giữa inner class và static nested class?
37. Anonymous class là gì? Khi nào dùng?
38. Local class là gì? Có thể truy cập biến local bên ngoài không?
39. Tại sao inner class có thể truy cập private members của outer class?

---

## **VI. Lifecycle & Memory**

40. Quá trình tạo object diễn ra như thế nào từ khi gọi `new` đến khi hoàn tất?
41. Khi nào một object đủ điều kiện để garbage collection?
42. Có thể ép GC chạy ngay lập tức không? (System.gc())
43. `finalize()` method hoạt động thế nào? Tại sao bị deprecated?

---

## **VII. Nâng cao**

44. Có thể tạo object mà không dùng `new` không? (Reflection, deserialization, clone)
45. Class Loader trong Java hoạt động như thế nào?
46. Sự khác nhau giữa class loading và object instantiation?
47. Có thể tạo immutable object như thế nào?
48. Khác nhau giữa POJO, JavaBean, và record class (Java 14+)?
49. Khi nào nên dùng composition thay vì inheritance cho class design?
50. Có thể tạo object của abstract class hoặc interface không? (Anonymous implementation)
