## 1) Tổng quan & thuật ngữ

1. Generics giải quyết vấn đề gì so với kiểu raw (trước Java 5)? Lợi ích về type-safety & đọc hiểu?
2. Thuật ngữ: type parameter, type argument, generic class, generic method, raw type — định nghĩa từng khái niệm.
3. Quy ước đặt tên type parameter: `T, E, K, V, R, U`, `T extends Number`… Ý nghĩa và khi nào dùng nhiều tham số (`<K,V>`).
4. ⚠️ Gài: Khác nhau giữa **type parameter** (ở định nghĩa) và **type argument** (khi sử dụng).
5. Vì sao compile-time generics vẫn chạy trên JVM **type-erasure**?

---

## 2) Khai báo lớp & interface generic

1. Cú pháp khai báo `class Box<T>`; sự khác biệt `class Box<T extends Number>`.
2. `interface Comparable<T>`/`Comparator<T>` minh hoạ lợi ích generics ở API chuẩn ra sao?
3. Lớp generic lồng nhau: `class Outer<T> { static class Inner<U> {…} }` — ràng buộc nào với `static`?
4. ⚠️ Gài: Có thể **extends** một lớp generic và **thay đổi** type parameter không? Ví dụ `class IntBox extends Box<Integer>`.
5. Tại sao `static` field/method **không** thể dùng type parameter của lớp (`T`)?

---

## 3) Phương thức & constructor generic

1. Khai báo **method generic**: `static <T> T identity(T x)`; khác gì so với class generic.
2. Constructor generic có cú pháp thế nào? Khi nào cần constructor đặt type parameter riêng?
3. Bounded type parameter trên **method**: `<T extends Comparable<T>>` — ý nghĩa và use case.
4. ⚠️ Gài: Vì sao method generic `static` thường xuất hiện trong **utility class**?
5. Overload giữa method generic & non-generic: quy tắc chọn phương thức.

---

## 4) Suy luận kiểu (Type inference) & Diamond operator

1. Trình bày **type inference** khi gọi method generic và khi khởi tạo: `var list = new ArrayList<String>();` vs `new ArrayList<>()`.
2. Diamond operator `<>` hoạt động thế nào? Giới hạn khi có **anonymous class**.
3. ⚠️ Gài: Khi nào compiler **không** suy luận được kiểu và cần chỉ định tường minh `<String>`?
4. Ảnh hưởng của inference đối với **method reference** và **lambda** (target typing).

---

## 5) Giới hạn kiểu (Bounds) & multiple bounds

1. Upper bound: `<T extends Number>` khác gì `<T extends Number & Comparable<T>>` (nhiều bound).
2. Intersection types: ý nghĩa của `&` trong multiple bounds; thứ tự sắp xếp (class trước interface).
3. ⚠️ Gài: Có **lower bound** trong **type parameter** không? Phân biệt với lower bound ở wildcard.
4. Ràng buộc đệ quy (F-bounded): `<T extends Comparable<T>>` — tại sao hữu ích?

---

## 6) Wildcards & quy tắc PECS

1. Wildcard `?` là gì? So sánh `List<?>`, `List<? extends Number>`, `List<? super Integer>`.
2. Quy tắc **PECS** (“Producer Extends, Consumer Super”): giải thích bằng ví dụ cụ thể.
3. ⚠️ Gài: Vì sao **không** thể thêm phần tử vào `List<? extends Number>` (trừ `null`)?
4. Khi nào nên dùng wildcard thay vì type parameter ở method signature?

---

## 7) Bắt wildcard (Wildcard capture) & helper methods

1. “Wildcard capture” là gì? Khi nào compiler yêu cầu viết helper method generic để “bắt” wildcard?
2. Ví dụ chuyển `void swap(List<?> l, int i, int j)` thành helper `<T> void swap(List<T> l, …)` để hợp lệ.
3. ⚠️ Gài: Tại sao cast “bừa” để vượt qua lỗi capture là nguy hiểm?

---

## 8) Type erasure, reifiable vs non-reifiable

1. Giải thích **type erasure**: biên dịch xoá thông tin kiểu, chèn cast & bridge method.
2. Reifiable vs non-reifiable types: ví dụ `List<String>` là non-reifiable.
3. ⚠️ Gài: Vì sao `instanceof List<String>` **không hợp lệ**, nhưng `instanceof List<?>` lại hợp lệ?
4. Ảnh hưởng của erasure tới **equals**, **overload/override** và runtime cast.

---

## 9) Mảng vs generics

1. Mảng là **covariant** còn generics là **invariant**: hệ quả an toàn kiểu?
2. ⚠️ Gài: Vì sao **không** được tạo `new List<String>[10]`? (generic array creation)
3. Dùng `List<T>[]` có thể qua “bridge” bằng `@SuppressWarnings("unchecked")` — rủi ro?
4. Khi nào thay mảng bằng `List<T>` để an toàn hơn?

---

## 10) Varargs với generics & @SafeVarargs

1. Vấn đề “heap pollution” khi dùng varargs generic (`List<String>... args`).
2. Khi nào nên dùng `@SafeVarargs` và điều kiện an toàn để chú thích?
3. ⚠️ Gài: Vì sao **không** nên lưu tham chiếu `args` vào trường/collection dài hạn?

---

## 11) Raw types & unchecked warnings

1. Raw type là gì (`List` thay vì `List<String>`) và tại sao nên tránh.
2. ⚠️ Gài: Tại sao raw types vẫn tồn tại? (tương thích ngược) — rủi ro khi mix raw với generic.
3. Khi nào dùng `@SuppressWarnings("unchecked")` là chấp nhận được? Nguyên tắc “khoanh vùng tối thiểu”.

---

## 12) Generics & Collections/Map

1. API mẫu: `Map<K,V>`, `Optional<T>`, `Stream<T>` — lợi ích type-safety khi thao tác dữ liệu.
2. `Comparable<T>` vs `Comparator<T>` generic: viết API sắp xếp **consistent with equals**.
3. ⚠️ Gài: `List<Object>` **không** thay cho `List<String>` — giải thích invariance bằng ví dụ.
4. Dùng wildcard trong tham số method: `void addAll(Collection<? extends T> src, Collection<? super T> dst)`.

---

## 13) Generics & Lambda/Streams

1. Cách inference hoạt động khi dùng `Collectors.toMap(...)` với key/value generic.
2. Method reference có thể “gợi” inference thế nào (`String::valueOf`, `BigDecimal::new`).
3. ⚠️ Gài: Vì sao đôi khi cần **hint** kiểu tường minh trong stream (`<String>collect(...)`)?
4. `Optional<T>` và wildcards (`Optional<? extends Number>`) — khi nào hữu ích/khó chịu.

---

## 14) Reflection & type token

1. Do erasure, làm sao giữ thông tin kiểu tại runtime (pattern **TypeToken**, `Class<T>`, `TypeReference` của Jackson/Guava)?
2. Lấy `ParameterizedType` của field/method bằng reflection: hạn chế gì?
3. ⚠️ Gài: Vì sao `List<String>` và `List<Integer>` có cùng `Class` object ở runtime? Hệ quả.

---

## 15) Bridge methods, override & binary compatibility

1. Bridge method là gì? Khi nào compiler sinh ra (override với type erasure).
2. ⚠️ Gài: Bridge method có thể gây vấn đề gì với reflection hoặc AOP/proxy?
3. Overload vs override với generics sau erasure: ví dụ dễ gây **ambiguous**.

---

## 16) Best practices & thiết kế API

1. Khi nào chọn **wildcard** trong public API thay vì type parameter (giúp linh hoạt caller).
2. Viết chữ ký **đọc-không-ghi** (`? extends T`) và **ghi-không-đọc** (`? super T`) đúng nguyên tắc PECS.
3. ⚠️ Gài: Tránh trả về `List<? extends T>` từ public API — vì sao gây khó cho client?
4. Tài liệu hoá ràng buộc (bounds), bất biến & thread-safety khi type là mutable.

---

## 17) Mini case (thực chiến 2–5 phút/câu)

1. Viết hàm `copy(List<? extends T> src, List<? super T> dst)` theo PECS; phân tích giới hạn và khi nào cần `Collections.copy`.
2. Thiết kế `Cache<K,V>` generic với API: `get(K)`, `put(K,V)`, `computeIfAbsent(K, Function<? super K,? extends V>)`. Nêu lý do chọn wildcard.
3. Sửa chữ ký `sum(List<Number> nums)` để nhận cả `List<Integer>`/`List<Double>`.
4. Implement `max(List<T>, Comparator<? super T>)` và giải thích vì sao dùng `? super T`.
5. Viết helper **wildcard capture** cho `swap(List<?> l, int i, int j)` để biên dịch được.
6. Dùng **TypeToken** để parse JSON thành `List<Order>` bằng Jackson/TypeReference; nêu vì sao cần type token.
