## **I) Khái niệm & Cơ bản**

1. Annotation trong Java là gì? Khác gì so với comment?
2. Lợi ích của annotation so với config file XML hoặc code convention?
3. Cú pháp khai báo annotation type (`@interface`) cơ bản như thế nào?
4. Marker annotation là gì? Ví dụ.
5. Annotation element có thể có kiểu dữ liệu nào? (liệt kê tất cả kiểu hợp lệ trong Java core)
6. Tại sao annotation element không thể nhận giá trị `null`?
7. Ý nghĩa tên đặc biệt `value()` trong annotation?
8. Có thể áp dụng annotation lên những thành phần nào của code? (class, method, field, parameter, constructor, type parameter, type use)
9. Có thể áp dụng cùng một annotation nhiều lần trên cùng một target không? Giới thiệu `@Repeatable`.

---

## **II) Meta-annotations trong Java Core**

10. `@Retention` có những giá trị nào (`SOURCE`, `CLASS`, `RUNTIME`)? Ảnh hưởng đến thời điểm annotation tồn tại?
11. `@Target` dùng để làm gì? Liệt kê một số `ElementType` quan trọng như `TYPE`, `METHOD`, `FIELD`, `PARAMETER`, `TYPE_USE`, `TYPE_PARAMETER`.
12. `@Documented` có tác dụng gì?
13. `@Inherited` hoạt động thế nào? Giới hạn áp dụng?
14. `@Repeatable` hoạt động ra sao? Container annotation là gì?

---

## **III) Type Annotations (Java 8 – JSR 308)**

15. `@Target(ElementType.TYPE_USE)` khác gì với `@Target(ElementType.TYPE)`?
16. Ví dụ về annotation áp dụng cho generic type, cast, hoặc throws clause.
17. `@Target(ElementType.TYPE_PARAMETER)` dùng khi nào?
18. Cách lấy type-use annotation qua `AnnotatedType` trong reflection.

---

## **IV) Built-in annotations trong Java Core**

19. `@Override` tác dụng gì? Compiler sẽ làm gì nếu method không override thực sự?
20. `@Deprecated` dùng như thế nào? Ý nghĩa của `since` và `forRemoval`.
21. `@SuppressWarnings` hoạt động ra sao? Cần lưu ý gì về tên warnings?
22. `@SafeVarargs` dùng trong trường hợp nào? Giới hạn áp dụng (`static`, `final`, `private` methods).
23. `@FunctionalInterface` là gì? Compiler kiểm tra những gì?
24. `@Native` annotation dùng để làm gì?

---

## **V) Reflection với annotations**

25. Cách lấy annotation của một class/method/field bằng `getAnnotation()` và `getAnnotations()`.
26. `getAnnotation()` vs `getDeclaredAnnotation()` khác nhau thế nào?
27. Sự khác nhau giữa `getAnnotations()` và `getAnnotationsByType()` khi làm việc với `@Repeatable`.
28. `@Inherited` ảnh hưởng thế nào đến kết quả `getAnnotation()`?
29. Có thể lấy annotation của parameter method bằng cách nào?
30. Làm sao lấy annotation áp dụng cho type parameter hoặc type use?

---

## **VI) Thiết kế annotation đơn giản**

31. Khi nào nên dùng marker annotation thay vì annotation có element?
32. Cách đặt `@Retention` đúng cho từng use-case: chỉ compile-time check, hay cần runtime reflection?
33. Lợi thế và hạn chế khi dùng `Class<?>` làm element thay vì `String` tên class.
34. Có nên để annotation chứa mảng element không? So với dùng `@Repeatable`?
35. Cách đảm bảo backward compatibility khi thêm element mới vào annotation.
36. Khi nào annotation chỉ nên là metadata, và khi nào có thể điều khiển logic chương trình (runtime processing)?

---

## **VII) Edge cases trong Java Core**

37. `@Inherited` không áp dụng cho method/field—tại sao?
38. Khi override method: annotation của method cha có “tự động” áp dụng cho method con không?
39. Annotations trên generic type bị mất thông tin type parameter do erasure—ảnh hưởng thế nào?
40. `@Repeatable` nhưng dùng `getAnnotation()` sẽ chỉ thấy 1 container—tại sao?
41. Annotation trên local variable (`@Target(LOCAL_VARIABLE)`) có trường hợp sử dụng nào trong core Java?
42. Annotations trên `package` và `module` được khai báo ở đâu (package-info.java, module-info.java) và cách đọc?
