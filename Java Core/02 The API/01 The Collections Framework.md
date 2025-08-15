## 1) Tổng quan Collections Framework

1. Java Collections Framework là gì? Bao gồm những thành phần chính nào (interfaces, implementations, algorithms)?
2. Phân biệt `Collection` và `Collections` (class utility) — chức năng, khi nào dùng mỗi loại.
3. ⚠️ Gài: Mảng (`array`) có nằm trong Collections Framework không? Vì sao?
4. Các nhóm interface chính: `Collection`, `List`, `Set`, `Queue`, `Deque`, `Map` — ý nghĩa và khi nào chọn loại nào.
5. **Legacy collections** (Vector, Hashtable, Stack, Enumeration) — vì sao ít dùng, và thay thế hiện đại.
6. Ưu điểm của framework so với tự cài đặt cấu trúc dữ liệu.

---

## 2) Interface & Implementations

1. `List` — đặc điểm (thứ tự, phần tử trùng lặp), các implementations: `ArrayList`, `LinkedList`, `CopyOnWriteArrayList`.
2. `Set` — đặc điểm (không trùng lặp), các implementations: `HashSet`, `LinkedHashSet`, `TreeSet`, `EnumSet`.
3. `Queue`/`Deque` — khác biệt, các implementations: `PriorityQueue`, `ArrayDeque`, `LinkedList` (như queue).
4. `Map` — đặc điểm (key-value), các implementations: `HashMap`, `LinkedHashMap`, `TreeMap`, `Hashtable`, `ConcurrentHashMap`.
5. ⚠️ Gài: Vì sao `HashMap` cho phép key = null nhưng `Hashtable` thì không?
6. `SortedSet` vs `NavigableSet` và `SortedMap` vs `NavigableMap` — khi nào cần `Navigable`.
7. `WeakHashMap` là gì? Use case điển hình.
8. So sánh `EnumMap` và `EnumSet` — lợi ích khi key/value là enum.

---

## 3) List

1. So sánh `ArrayList` và `LinkedList` về độ phức tạp O(…) cho add/get/remove/search.
2. Khi nào nên dùng `CopyOnWriteArrayList`? Rủi ro về hiệu năng khi danh sách lớn.
3. ⚠️ Gài: Tại sao `Arrays.asList()` không thể thêm/xóa phần tử?
4. Phân biệt `subList()` và copy một phần list — rủi ro khi thay đổi dữ liệu.
5. `List.of()` và `List.copyOf()` khác nhau gì về tính bất biến và null elements.

---

## 4) Set

1. `HashSet` hoạt động dựa trên `hashCode()` và `equals()` như thế nào?
2. `LinkedHashSet` khác gì `HashSet` về thứ tự duyệt.
3. ⚠️ Gài: Vì sao `TreeSet` yêu cầu phần tử phải implement `Comparable` hoặc có `Comparator`?
4. `EnumSet` lưu trữ thế nào để tối ưu bộ nhớ.
5. Sự khác nhau giữa `add()` trả `true` và `false` trong `Set`.

---

## 5) Map

1. Cấu trúc bên trong `HashMap`: bảng băm, bucket, linked list → treeify từ Java 8.
2. ⚠️ Gài: Khi nào `HashMap` chuyển từ linked list sang red-black tree và ngược lại?
3. So sánh `HashMap` và `ConcurrentHashMap` về lock granularity.
4. `LinkedHashMap` hỗ trợ **access-order** để làm LRU cache như thế nào?
5. `TreeMap` dựa trên cây đỏ-đen: độ phức tạp các thao tác.
6. `Hashtable` có còn nên dùng không? So sánh với `ConcurrentHashMap`.
7. `IdentityHashMap` so sánh key bằng `==` thay vì `equals()` — use case nào hợp lý.
8. `Map.of()` và `Map.copyOf()` — bất biến, null key/value cho phép không?

---

## 6) Queue & Deque

1. `PriorityQueue` sắp xếp dựa trên `Comparable` hoặc `Comparator` như thế nào?
2. ⚠️ Gài: `PriorityQueue` có đảm bảo toàn bộ phần tử được sort khi iterate không?
3. `ArrayDeque` vs `LinkedList` khi dùng như stack/queue — ưu/nhược điểm.
4. Khác nhau giữa `offer()`/`add()` và `poll()`/`remove()`.
5. Blocking queues: `ArrayBlockingQueue`, `LinkedBlockingQueue`, `PriorityBlockingQueue`, `DelayQueue`, `SynchronousQueue` — khi nào dùng.

---

## 7) Thuật toán & Utility

1. Các hàm trong `Collections` class: `sort`, `shuffle`, `reverse`, `binarySearch`, `min`, `max`, `unmodifiableXxx`.
2. ⚠️ Gài: Điều kiện để `binarySearch()` hoạt động chính xác.
3. `Collections.unmodifiableList()` khác gì với `List.copyOf()`?
4. `Collections.synchronizedList()` vs `CopyOnWriteArrayList` về thread safety.
5. Sử dụng `Comparator.comparing()` và method reference để sort.

---

## 8) Generics & Collections

1. Ưu điểm khi Collections dùng Generics so với raw type.
2. ⚠️ Gài: Tại sao `List<Object>` **không** thể gán `List<String>`?
3. Wildcards: `List<? extends Number>` vs `List<? super Integer>` — khi nào dùng mỗi loại.
4. Covariant array (`Number[]`) vs invariant generics (`List<Number>`) — nguy cơ runtime error.
5. `Collections.emptyList()` trả về kiểu gì? Có thể add phần tử không?

---

## 9) Null & Collections

1. Chính sách null của các implementations: `HashMap` vs `Hashtable`, `ArrayList` vs `CopyOnWriteArrayList`.
2. ⚠️ Gài: Tại sao `TreeSet`/`TreeMap` với `null` có thể ném `NullPointerException`?
3. Best practice khi xử lý null trong collection API.

---

## 10) Đồng bộ & Bất biến

1. `Collections.synchronizedXxx()` hoạt động thế nào? Khi iterate cần làm gì thêm để thread-safe?
2. Khác nhau giữa **unmodifiable** và **immutable** collection.
3. ⚠️ Gài: `List.of()` có thực sự immutable hoàn toàn không?
4. Khi nào nên chọn collection thread-safe gốc (`ConcurrentHashMap`) thay vì wrapper synchronized.

---

## 11) Mini case (thực chiến)

1. Thiết kế cache nhỏ LRU dùng `LinkedHashMap`.
2. Phân tích nguyên nhân `ConcurrentModificationException` khi remove phần tử trong vòng for-each.
3. Tìm top 10 sản phẩm bán chạy nhất với `HashMap` + `PriorityQueue`.
4. Dùng `TreeMap` để lưu dữ liệu theo mốc thời gian và query theo khoảng ngày.
5. Cài đặt queue xử lý tác vụ ưu tiên thấp/trung/cao với `PriorityBlockingQueue`.
6. So sánh chi phí bộ nhớ giữa `ArrayList` và `LinkedList` khi lưu 1 triệu phần tử.