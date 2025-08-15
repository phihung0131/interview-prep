## 1) Tổng quan Collections Framework

### 1. Java Collections Framework là gì? Bao gồm những thành phần chính nào (interfaces, implementations, algorithms)?
- **Trả lời**:
    - **Java Collections Framework (JCF)**: Bộ công cụ cung cấp cấu trúc dữ liệu và thuật toán chuẩn để quản lý tập hợp đối tượng.
    - **Thành phần chính**:
        - **Interfaces**: `Collection`, `List`, `Set`, `Queue`, `Deque`, `Map`.
        - **Implementations**: `ArrayList`, `HashSet`, `HashMap`, `PriorityQueue`, v.v.
        - **Algorithms**: Trong `Collections` class (ví dụ: `sort`, `shuffle`, `binarySearch`).
    - **Ví dụ**:
      ```java
      List<String> list = new ArrayList<>();
      Collections.sort(list);
      ```

### 2. Phân biệt `Collection` và `Collections` (class utility) — chức năng, khi nào dùng mỗi loại.
- **Trả lời**:
    - **`Collection`**: Interface gốc cho các tập hợp (List, Set, Queue), định nghĩa các thao tác cơ bản (`add`, `remove`).
    - **`Collections`**: Utility class chứa các static method để thao tác trên collection (sort, shuffle).
    - **Dùng khi**:
        - `Collection`: Khai báo biến hoặc tham số.
        - `Collections`: Gọi hàm tiện ích.
    - **Ví dụ**:
      ```java
      Collection<String> col = new ArrayList<>();
      Collections.sort((List<String>) col);
      ```

### 3. ⚠️ Gài: Mảng (`array`) có nằm trong Collections Framework không? Vì sao?
- **Trả lời**:
    - **Không**: Mảng không thuộc JCF.
    - **Lý do**: Mảng là cấu trúc dữ liệu nguyên thủy của Java, không implement `Collection`. JCF dùng các lớp như `ArrayList` để thay thế.
    - **Ví dụ**:
      ```java
      String[] arr = {"a", "b"}; // Không phải Collection
      List<String> list = Arrays.asList(arr); // Chuyển sang Collection
      ```

### 4. Các nhóm interface chính: `Collection`, `List`, `Set`, `Queue`, `Deque`, `Map` — ý nghĩa và khi nào chọn loại nào.
- **Trả lời**:
    - **`Collection`**: Gốc, cho phép add/remove/iterate.
    - **`List`**: Có thứ tự, cho phép trùng lặp (dùng khi cần truy cập index).
    - **`Set`**: Không trùng lặp (dùng để lưu tập hợp duy nhất).
    - **`Queue`**: FIFO, ưu tiên (dùng cho hàng đợi).
    - **`Deque`**: Hàng đợi hai đầu (stack/queue linh hoạt).
    - **`Map`**: Key-value, không thuộc `Collection` (dùng để ánh xạ).
    - **Chọn**:
        - `List`: Danh sách thứ tự (ví dụ: danh sách user).
        - `Set`: Tập hợp không trùng (ví dụ: danh sách email).
        - `Map`: Ánh xạ key-value (ví dụ: userId → User).
    - **Ví dụ**:
      ```java
      List<String> list = new ArrayList<>();
      Set<String> set = new HashSet<>();
      Map<String, Integer> map = new HashMap<>();
      ```

### 5. **Legacy collections** (Vector, Hashtable, Stack, Enumeration) — vì sao ít dùng, và thay thế hiện đại.
- **Trả lời**:
    - **Vì sao ít dùng**:
        - Đồng bộ hóa toàn bộ (`synchronized`), chậm.
        - Thiết kế cũ, thiếu tính linh hoạt.
    - **Thay thế**:
        - `Vector` → `ArrayList` hoặc `CopyOnWriteArrayList`.
        - `Hashtable` → `HashMap` hoặc `ConcurrentHashMap`.
        - `Stack` → `ArrayDeque`.
        - `Enumeration` → `Iterator`.
    - **Ví dụ**:
      ```java
      // Cũ
      Vector<String> vector = new Vector<>();
      // Mới
      List<String> list = new ArrayList<>();
      ```

### 6. Ưu điểm của framework so với tự cài đặt cấu trúc dữ liệu.
- **Trả lời**:
    - **Ưu điểm**:
        - Chuẩn hóa, dễ sử dụng.
        - Hiệu năng tối ưu, được kiểm tra kỹ.
        - Hỗ trợ generics, thread-safety, bất biến.
        - Cung cấp thuật toán sẵn (`sort`, `shuffle`).
    - **Ví dụ**:
      ```java
      List<String> list = new ArrayList<>();
      Collections.sort(list); // Không cần tự viết thuật toán
      ```

---

## 2) Interface & Implementations

### 1. `List` — đặc điểm (thứ tự, phần tử trùng lặp), các implementations: `ArrayList`, `LinkedList`, `CopyOnWriteArrayList`.
- **Trả lời**:
    - **Đặc điểm**: Có thứ tự, cho phép trùng lặp, truy cập theo index.
    - **Implementations**:
        - `ArrayList`: Mảng động, nhanh cho truy cập/get.
        - `LinkedList`: Danh sách liên kết, nhanh cho add/remove đầu/cuối.
        - `CopyOnWriteArrayList`: Thread-safe, copy khi ghi, phù hợp đọc nhiều.
    - **Ví dụ**:
      ```java
      List<String> arrayList = new ArrayList<>();
      List<String> linkedList = new LinkedList<>();
      ```

### 2. `Set` — đặc điểm (không trùng lặp), các implementations: `HashSet`, `LinkedHashSet`, `TreeSet`, `EnumSet`.
- **Trả lời**:
    - **Đặc điểm**: Không trùng lặp, dựa trên `equals()`/`hashCode()`.
    - **Implementations**:
        - `HashSet`: Bảng băm, O(1) truy cập.
        - `LinkedHashSet`: Giữ thứ tự chèn.
        - `TreeSet`: Sắp xếp, dựa trên `Comparable`/`Comparator`.
        - `EnumSet`: Tối ưu cho enum, dùng bit vector.
    - **Ví dụ**:
      ```java
      Set<String> hashSet = new HashSet<>();
      Set<String> treeSet = new TreeSet<>();
      ```

### 3. `Queue`/`Deque` — khác biệt, các implementations: `PriorityQueue`, `ArrayDeque`, `LinkedList` (như queue).
- **Trả lời**:
    - **`Queue`**: FIFO, một đầu vào/ra.
    - **`Deque`**: Hai đầu, hỗ trợ stack/queue.
    - **Implementations**:
        - `PriorityQueue`: Sắp xếp theo ưu tiên.
        - `ArrayDeque`: Mảng động, hiệu quả cho stack/queue.
        - `LinkedList`: Hỗ trợ `Queue`/`Deque`, nhưng chậm hơn `ArrayDeque`.
    - **Ví dụ**:
      ```java
      Queue<Integer> queue = new PriorityQueue<>();
      Deque<Integer> deque = new ArrayDeque<>();
      ```

### 4. `Map` — đặc điểm (key-value), các implementations: `HashMap`, `LinkedHashMap`, `TreeMap`, `Hashtable`, `ConcurrentHashMap`.
- **Trả lời**:
    - **Đặc điểm**: Ánh xạ key-value, key không trùng.
    - **Implementations**:
        - `HashMap`: Bảng băm, O(1) truy cập.
        - `LinkedHashMap`: Giữ thứ tự chèn hoặc access.
        - `TreeMap`: Sắp xếp key theo `Comparable`/`Comparator`.
        - `Hashtable`: Đồng bộ, không cho phép null.
        - `ConcurrentHashMap`: Thread-safe, lock từng bucket.
    - **Ví dụ**:
      ```java
      Map<String, Integer> map = new HashMap<>();
      ```

### 5. ⚠️ Gài: Vì sao `HashMap` cho phép key = null nhưng `Hashtable` thì không?
- **Trả lời**:
    - **`HashMap`**: Cho phép key/value `null`, không đồng bộ.
    - **`Hashtable`**: Không cho phép `null` vì thiết kế cũ, đồng bộ toàn bộ, kiểm tra `null` gây lỗi.
    - **Ví dụ**:
      ```java
      HashMap<String, Integer> map = new HashMap<>();
      map.put(null, 1); // OK
      Hashtable<String, Integer> table = new Hashtable<>();
      table.put(null, 1); // NullPointerException
      ```

### 6. `SortedSet` vs `NavigableSet` và `SortedMap` vs `NavigableMap` — khi nào cần `Navigable`.
- **Trả lời**:
    - **`SortedSet`/`SortedMap`**: Sắp xếp tự động, truy cập theo thứ tự.
    - **`NavigableSet`/`NavigableMap`**: Thêm các method điều hướng (`ceiling`, `floor`, `higher`, `lower`).
    - **Dùng Navigable**: Khi cần tìm phần tử gần nhất hoặc duyệt theo khoảng.
    - **Ví dụ**:
      ```java
      NavigableSet<Integer> set = new TreeSet<>();
      Integer ceiling = set.ceiling(5); // Phần tử >= 5
      ```

### 7. `WeakHashMap` là gì? Use case điển hình.
- **Trả lời**:
    - **`WeakHashMap`**: Map với key là `WeakReference`, tự xóa khi key không còn tham chiếu mạnh.
    - **Use case**: Cache tạm thời, nơi key không cần giữ lâu.
    - **Ví dụ**:
      ```java
      WeakHashMap<String, String> cache = new WeakHashMap<>();
      String key = new String("key");
      cache.put(key, "value");
      key = null; // Key có thể bị GC
      ```

### 8. So sánh `EnumMap` và `EnumSet` — lợi ích khi key/value là enum.
- **Trả lời**:
    - **`EnumMap`**: Map với key là enum, lưu trữ bằng mảng, hiệu quả O(1).
    - **`EnumSet`**: Set chứa enum, lưu bằng bit vector, tiết kiệm bộ nhớ.
    - **Lợi ích**: Tối ưu bộ nhớ/thời gian, chỉ dùng với enum.
    - **Ví dụ**:
      ```java
      enum Day { MON, TUE }
      EnumMap<Day, String> map = new EnumMap<>(Day.class);
      EnumSet<Day> set = EnumSet.of(Day.MON);
      ```

---

## 3) List

### 1. So sánh `ArrayList` và `LinkedList` về độ phức tạp O(…) cho add/get/remove/search.
- **Trả lời**:
    - **`ArrayList`**:
        - `add` (cuối): O(1), mở rộng mảng: O(n).
        - `get`: O(1).
        - `remove` (giữa): O(n).
        - `search`: O(n).
    - **`LinkedList`**:
        - `add` (đầu/cuối): O(1).
        - `get`: O(n).
        - `remove` (đầu/cuối): O(1), giữa: O(n).
        - `search`: O(n).
    - **Chọn**:
        - `ArrayList`: Truy cập ngẫu nhiên, ít sửa đổi.
        - `LinkedList`: Thêm/xóa đầu/cuối nhiều.

### 2. Khi nào nên dùng `CopyOnWriteArrayList`? Rủi ro về hiệu năng khi danh sách lớn.
- **Trả lời**:
    - **Dùng khi**: Đọc nhiều, ghi ít, thread-safe (ví dụ: danh sách listener).
    - **Rủi ro**: Ghi tạo bản sao toàn bộ, O(n), chậm với danh sách lớn.
    - **Ví dụ**:
      ```java
      List<String> list = new CopyOnWriteArrayList<>();
      // An toàn khi iterate đa luồng
      ```

### 3. ⚠️ Gài: Tại sao `Arrays.asList()` không thể thêm/xóa phần tử?
- **Trả lời**:
    - **Lý do**: `Arrays.asList()` trả về `Arrays.ArrayList` (inner class), chỉ hỗ trợ đọc, không hỗ trợ thay đổi kích thước.
    - **Khắc phục**: Wrap vào `new ArrayList<>(Arrays.asList(...))`.
    - **Ví dụ**:
      ```java
      List<String> list = Arrays.asList("a", "b");
      list.add("c"); // UnsupportedOperationException
      ```

### 4. Phân biệt `subList()` và copy một phần list — rủi ro khi thay đổi dữ liệu.
- **Trả lời**:
    - **`subList()`**: Trả view của list gốc, thay đổi view ảnh hưởng gốc.
    - **Copy**: Tạo bản sao độc lập.
    - **Rủi ro**: Thay đổi `subList()` gây `ConcurrentModificationException` nếu gốc thay đổi.
    - **Ví dụ**:
      ```java
      List<String> list = new ArrayList<>(List.of("a", "b", "c"));
      List<String> subList = list.subList(0, 2); // View
      subList.add("x"); // Ảnh hưởng list gốc
      ```

### 5. `List.of()` và `List.copyOf()` khác nhau gì về tính bất biến và null elements.
- **Trả lời**:
    - **`List.of()`**: Tạo list bất biến, không cho phép `null`.
    - **`List.copyOf()`**: Tạo bản sao bất biến từ collection, không cho phép `null`.
    - **Khác biệt**: `List.of()` nhận trực tiếp phần tử, `List.copyOf()` nhận collection.
    - **Ví dụ**:
      ```java
      List<String> list1 = List.of("a", "b"); // Bất biến
      List<String> list2 = List.copyOf(Arrays.asList("a", "b")); // Bất biến
      ```

---

## 4) Set

### 1. `HashSet` hoạt động dựa trên `hashCode()` và `equals()` như thế nào?
- **Trả lời**:
    - **Cơ chế**: Dùng `hashCode()` để chọn bucket, `equals()` để kiểm tra trùng lặp trong bucket.
    - **Yêu cầu**: Lớp phải implement `hashCode()` và `equals()` đúng.
    - **Ví dụ**:
      ```java
      Set<String> set = new HashSet<>();
      set.add("a"); // hashCode() → bucket, equals() kiểm tra
      ```

### 2. `LinkedHashSet` khác gì `HashSet` về thứ tự duyệt.
- **Trả lời**:
    - **`LinkedHashSet`**: Giữ thứ tự chèn, dùng danh sách liên kết đôi.
    - **`HashSet`**: Không đảm bảo thứ tự.
    - **Ví dụ**:
      ```java
      Set<String> linkedSet = new LinkedHashSet<>();
      linkedSet.add("a"); linkedSet.add("b"); // Duyệt: a, b
      ```

### 3. ⚠️ Gài: Vì sao `TreeSet` yêu cầu phần tử phải implement `Comparable` hoặc có `Comparator`?
- **Trả lời**:
    - **Lý do**: `TreeSet` dùng cây đỏ-đen, cần so sánh để sắp xếp.
    - **Yêu cầu**: Phần tử phải có `Comparable` hoặc cung cấp `Comparator` khi tạo.
    - **Ví dụ**:
      ```java
      Set<String> set = new TreeSet<>(); // String implements Comparable
      Set<Integer> set = new TreeSet<>(Comparator.reverseOrder());
      ```

### 4. `EnumSet` lưu trữ thế nào để tối ưu bộ nhớ.
- **Trả lời**:
    - **Cơ chế**: Dùng bit vector, mỗi enum là một bit.
    - **Tối ưu**: Rất tiết kiệm bộ nhớ, O(1) thao tác.
    - **Ví dụ**:
      ```java
      EnumSet<Day> days = EnumSet.of(Day.MON, Day.TUE);
      ```

### 5. Sự khác nhau giữa `add()` trả `true` và `false` trong `Set`.
- **Trả lời**:
    - **`true`**: Phần tử được thêm (không trùng).
    - **`false`**: Phần tử đã tồn tại, không thêm.
    - **Ví dụ**:
      ```java
      Set<String> set = new HashSet<>();
      set.add("a"); // true
      set.add("a"); // false
      ```

---

## 5) Map

### 1. Cấu trúc bên trong `HashMap`: bảng băm, bucket, linked list → treeify từ Java 8.
- **Trả lời**:
    - **Cấu trúc**:
        - Bảng băm: Mảng các bucket.
        - Bucket: Linked list hoặc red-black tree (từ Java 8).
        - **Treeify**: Khi bucket có ≥8 phần tử và bảng ≥64, chuyển linked list sang cây.
    - **Ví dụ**:
      ```java
      HashMap<String, Integer> map = new HashMap<>();
      map.put("key", 1);
      ```

### 2. ⚠️ Gài: Khi nào `HashMap` chuyển từ linked list sang red-black tree và ngược lại?
- **Trả lời**:
    - **Linked list → Tree**: Số phần tử trong bucket ≥8 (`TREEIFY_THRESHOLD`) và bảng ≥64.
    - **Tree → Linked list**: Số phần tử trong bucket <6 (`UNTREEIFY_THRESHOLD`).
    - **Lý do**: Cân bằng giữa hiệu năng và bộ nhớ.

### 3. So sánh `HashMap` và `ConcurrentHashMap` về lock granularity.
- **Trả lời**:
    - **`HashMap`**: Không thread-safe.
    - **`ConcurrentHashMap`**: Thread-safe, lock từng bucket (segmented locking).
    - **Ví dụ**:
      ```java
      ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
      map.put("key", 1); // Thread-safe
      ```

### 4. `LinkedHashMap` hỗ trợ **access-order** để làm LRU cache như thế nào?
- **Trả lời**:
    - **Access-order**: Sắp xếp theo thứ tự truy cập (mới nhất ở cuối).
    - **LRU cache**: Override `removeEldestEntry` để xóa phần tử cũ nhất.
    - **Ví dụ**:
      ```java
      LinkedHashMap<String, Integer> cache = new LinkedHashMap<>(16, 0.75f, true) {
          @Override
          protected boolean removeEldestEntry(Map.Entry<String, Integer> eldest) {
              return size() > 10; // Giới hạn 10 phần tử
          }
      };
      ```

### 5. `TreeMap` dựa trên cây đỏ-đen: độ phức tạp các thao tác.
- **Trả lời**:
    - **Cấu trúc**: Cây đỏ-đen, tự cân bằng.
    - **Độ phức tạp**:
        - `put`/`get`/`remove`: O(log n).
        - Duyệt: O(n).
    - **Ví dụ**:
      ```java
      TreeMap<String, Integer> map = new TreeMap<>();
      ```

### 6. `Hashtable` có còn nên dùng không? So sánh với `ConcurrentHashMap`.
- **Trả lời**:
    - **Không nên dùng**: `Hashtable` đồng bộ toàn bộ, chậm, không cho phép `null`.
    - **`ConcurrentHashMap`**:
        - Lock từng bucket, hiệu năng cao hơn.
        - Hỗ trợ `null` value (không hỗ trợ `null` key).
    - **Ví dụ**:
      ```java
      ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
      ```

### 7. `IdentityHashMap` so sánh key bằng `==` thay vì `equals()` — use case nào hợp lý.
- **Trả lời**:
    - **Cơ chế**: So sánh key bằng tham chiếu (`==`).
    - **Use case**: Khi cần key là đối tượng riêng biệt, không dựa vào `equals`.
    - **Ví dụ**:
      ```java
      IdentityHashMap<Object, String> map = new IdentityHashMap<>();
      String s1 = new String("key");
      String s2 = new String("key");
      map.put(s1, "value1");
      map.put(s2, "value2"); // Khác nhau vì s1 != s2
      ```

### 8. `Map.of()` và `Map.copyOf()` — bất biến, null key/value cho phép không?
- **Trả lời**:
    - **`Map.of()`**: Tạo map bất biến, không cho phép `null` key/value.
    - **`Map.copyOf()`**: Tạo bản sao bất biến từ Map, không cho phép `null`.
    - **Ví dụ**:
      ```java
      Map<String, Integer> map1 = Map.of("a", 1);
      Map<String, Integer> map2 = Map.copyOf(new HashMap<>(Map.of("a", 1)));
      ```

---

## 6) Queue & Deque

### 1. `PriorityQueue` sắp xếp dựa trên `Comparable` hoặc `Comparator` như thế nào?
- **Trả lời**:
    - **Cơ chế**: Dùng heap, sắp xếp khi thêm/lấy phần tử dựa trên `Comparable` hoặc `Comparator`.
    - **Ví dụ**:
      ```java
      PriorityQueue<Integer> queue = new PriorityQueue<>(Comparator.reverseOrder());
      queue.add(3); queue.add(1); // 3, 1 → lấy 1 trước
      ```

### 2. ⚠️ Gài: `PriorityQueue` có đảm bảo toàn bộ phần tử được sort khi iterate không?
- **Trả lời**:
    - **Không**: Chỉ đảm bảo phần tử đầu (min/max) đúng thứ tự, các phần tử khác không đảm bảo khi iterate.
    - **Ví dụ**:
      ```java
      PriorityQueue<Integer> queue = new PriorityQueue<>();
      queue.add(3); queue.add(1); queue.add(2);
      queue.forEach(System.out::println); // Không đảm bảo 1, 2, 3
      ```

### 3. `ArrayDeque` vs `LinkedList` khi dùng như stack/queue — ưu/nhược điểm.
- **Trả lời**:
    - **`ArrayDeque`**:
        - **Ưu**: Hiệu năng cao, O(1) cho stack/queue, dùng mảng.
        - **Nhược**: Không hỗ trợ truy cập ngẫu nhiên.
    - **`LinkedList`**:
        - **Ưu**: Hỗ trợ truy cập ngẫu nhiên.
        - **Nhược**: Chậm hơn, O(n) cho truy cập giữa.
    - **Chọn**: `ArrayDeque` cho stack/queue.

### 4. Khác nhau giữa `offer()`/`add()` và `poll()`/`remove()`.
- **Trả lời**:
    - **`offer()`**: Thêm phần tử, trả `false` nếu không thể (queue đầy).
    - **`add()`**: Thêm phần tử, ném `IllegalStateException` nếu không thể.
    - **`poll()`**: Lấy và xóa đầu queue, trả `null` nếu rỗng.
    - **`remove()`**: Lấy và xóa đầu queue, ném `NoSuchElementException` nếu rỗng.
    - **Ví dụ**:
      ```java
      Queue<Integer> queue = new ArrayDeque<>();
      queue.offer(1); // true
      queue.poll(); // 1
      ```

### 5. Blocking queues: `ArrayBlockingQueue`, `LinkedBlockingQueue`, `PriorityBlockingQueue`, `DelayQueue`, `SynchronousQueue` — khi nào dùng.
- **Trả lời**:
    - **`ArrayBlockingQueue`**: Giới hạn kích thước, FIFO, dùng cho producer-consumer cố định.
    - **`LinkedBlockingQueue`**: Không giới hạn (hoặc giới hạn tùy chọn), FIFO.
    - **`PriorityBlockingQueue`**: Sắp xếp ưu tiên, thread-safe.
    - **`DelayQueue`**: Phần tử có thời gian delay, dùng cho tác vụ định thời.
    - **`SynchronousQueue`**: Không lưu trữ, truyền trực tiếp producer-consumer.
    - **Ví dụ**:
      ```java
      BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(10);
      ```

---

## 7) Thuật toán & Utility

### 1. Các hàm trong `Collections` class: `sort`, `shuffle`, `reverse`, `binarySearch`, `min`, `max`, `unmodifiableXxx`.
- **Trả lời**:
    - **`sort`**: Sắp xếp list.
    - **`shuffle`**: Xáo trộn ngẫu nhiên.
    - **`reverse`**: Đảo ngược list.
    - **`binarySearch`**: Tìm kiếm nhị phân.
    - **`min`/`max`**: Tìm min/max.
    - **`unmodifiableXxx`**: Trả view không sửa được.
    - **Ví dụ**:
      ```java
      List<Integer> list = new ArrayList<>(List.of(3, 1, 2));
      Collections.sort(list); // 1, 2, 3
      ```

### 2. ⚠️ Gài: Điều kiện để `binarySearch()` hoạt động chính xác.
- **Trả lời**:
    - **Điều kiện**:
        - List phải được sắp xếp trước.
        - Phải dùng cùng `Comparator` (hoặc `Comparable`) với lúc sắp xếp.
    - **Ví dụ**:
      ```java
      List<Integer> list = new ArrayList<>(List.of(1, 2, 3));
      int index = Collections.binarySearch(list, 2); // 1
      ```

### 3. `Collections.unmodifiableList()` khác gì với `List.copyOf()`?
- **Trả lời**:
    - **`Collections.unmodifiableList()`**: Trả view bất biến của list gốc, thay đổi gốc ảnh hưởng view.
    - **`List.copyOf()`**: Tạo bản sao bất biến, độc lập với gốc.
    - **Ví dụ**:
      ```java
      List<String> list = new ArrayList<>(List.of("a"));
      List<String> unmodifiable = Collections.unmodifiableList(list);
      List<String> copy = List.copyOf(list);
      list.add("b"); // unmodifiable thấy "b", copy không
      ```

### 4. `Collections.synchronizedList()` vs `CopyOnWriteArrayList` về thread safety.
- **Trả lời**:
    - **`Collections.synchronizedList()`**: Đồng bộ từng method, cần khóa thủ công khi iterate.
    - **`CopyOnWriteArrayList`**: Copy khi ghi, an toàn khi iterate, phù hợp đọc nhiều.
    - **Ví dụ**:
      ```java
      List<String> syncList = Collections.synchronizedList(new ArrayList<>());
      List<String> cowList = new CopyOnWriteArrayList<>();
      ```

### 5. Sử dụng `Comparator.comparing()` và method reference để sort.
- **Trả lời**:
  ```java
  List<User> users = new ArrayList<>();
  users.sort(Comparator.comparing(User::getName).thenComparing(User::getAge));
  ```

---

## 8) Generics & Collections

### 1. Ưu điểm khi Collections dùng Generics so với raw type.
- **Trả lời**:
    - **Ưu điểm**:
        - Kiểm tra kiểu lúc biên dịch, giảm lỗi runtime.
        - Loại bỏ ép kiểu (cast).
        - Code rõ ràng, dễ đọc.
    - **Ví dụ**:
      ```java
      // Raw
      List list = new ArrayList(); list.add("a"); String s = (String) list.get(0);
      // Generic
      List<String> list = new ArrayList<>(); String s = list.get(0);
      ```

### 2. ⚠️ Gài: Tại sao `List<Object>` **không** thể gán `List<String>`?
- **Trả lời**:
    - **Lý do**: Generics là **invariant**, `List<String>` không phải subtype của `List<Object>` để tránh lỗi runtime.
    - **Ví dụ**:
      ```java
      List<String> strings = new ArrayList<>();
      // List<Object> objects = strings; // Lỗi biên dịch
      List<? extends Object> objects = strings; // OK
      ```

### 3. Wildcards: `List<? extends Number>` vs `List<? super Integer>` — khi nào dùng mỗi loại.
- **Trả lời**:
    - **`? extends Number`**: Chỉ đọc, lấy ra `Number` hoặc subtype.
    - **`? super Integer`**: Chỉ ghi, thêm `Integer` hoặc subtype.
    - **Ví dụ**:
      ```java
      List<? extends Number> readOnly = new ArrayList<Integer>();
      Number n = readOnly.get(0); // OK
      List<? super Integer> writeOnly = new ArrayList<Number>();
      writeOnly.add(1); // OK
      ```

### 4. Covariant array (`Number[]`) vs invariant generics (`List<Number>`) — nguy cơ runtime error.
- **Trả lời**:
    - **Covariant array**: `Number[]` chấp nhận `Integer[]`, nhưng có thể gây `ArrayStoreException`.
    - **Invariant generics**: `List<Number>` không chấp nhận `List<Integer>`, an toàn hơn.
    - **Ví dụ**:
      ```java
      Number[] numbers = new Integer[1];
      numbers[0] = 1.0; // ArrayStoreException
      // List<Number> list = new ArrayList<Integer>(); // Lỗi biên dịch
      ```

### 5. `Collections.emptyList()` trả về kiểu gì? Có thể add phần tử không?
- **Trả lời**:
    - **Trả về**: `List` bất biến, generic, không chứa phần tử.
    - **Không thể add**: Ném `UnsupportedOperationException`.
    - **Ví dụ**:
      ```java
      List<String> empty = Collections.emptyList();
      empty.add("a"); // UnsupportedOperationException
      ```

---

## 9) Null & Collections

### 1. Chính sách null của các implementations: `HashMap` vs `Hashtable`, `ArrayList` vs `CopyOnWriteArrayList`.
- **Trả lời**:
    - **`HashMap`**: Cho phép `null` key/value.
    - **`Hashtable`**: Không cho phép `null` key/value.
    - **`ArrayList`**: Cho phép `null` phần tử.
    - **`CopyOnWriteArrayList`**: Cho phép `null` phần tử.
    - **Ví dụ**:
      ```java
      HashMap<String, String> map = new HashMap<>();
      map.put(null, null); // OK
      ```

### 2. ⚠️ Gài: Tại sao `TreeSet`/`TreeMap` với `null` có thể ném `NullPointerException`?
- **Trả lời**:
    - **Lý do**: `TreeSet`/`TreeMap` cần so sánh key/phần tử, gọi `compareTo` hoặc `Comparator` trên `null` gây `NullPointerException`.
    - **Ví dụ**:
      ```java
      TreeSet<String> set = new TreeSet<>();
      set.add(null); // NullPointerException
      ```

### 3. Best practice khi xử lý null trong collection API.
- **Trả lời**:
    - Kiểm tra `null` trước khi thêm.
    - Dùng `Optional` hoặc default value.
    - Sử dụng `Objects.requireNonNull`.
    - **Ví dụ**:
      ```java
      List<String> list = new ArrayList<>();
      list.add(Objects.requireNonNull(value, "Value cannot be null"));
      ```

---

## 10) Đồng bộ & Bất biến

### 1. `Collections.synchronizedXxx()` hoạt động thế nào? Khi iterate cần làm gì thêm để thread-safe?
- **Trả lời**:
    - **Cơ chế**: Đồng bộ từng method bằng `synchronized`.
    - **Khi iterate**: Cần khóa thủ công trên collection.
    - **Ví dụ**:
      ```java
      List<String> list = Collections.synchronizedList(new ArrayList<>());
      synchronized (list) {
          for (String s : list) { /* an toàn */ }
      }
      ```

### 2. Khác nhau giữa **unmodifiable** và **immutable** collection.
- **Trả lời**:
    - **Unmodifiable**: View không sửa được, nhưng gốc có thể thay đổi.
    - **Immutable**: Không thể sửa đổi, kể cả gốc.
    - **Ví dụ**:
      ```java
      List<String> list = new ArrayList<>(List.of("a"));
      List<String> unmodifiable = Collections.unmodifiableList(list);
      List<String> immutable = List.of("a");
      ```

### 3. ⚠️ Gài: `List.of()` có thực sự immutable hoàn toàn không?
- **Trả lời**:
    - **Có**: `List.of()` tạo list bất biến hoàn toàn, không thể sửa đổi.
    - **Lưu ý**: Các phần tử bên trong (nếu mutable) vẫn có thể bị thay đổi.
    - **Ví dụ**:
      ```java
      List<StringBuilder> list = List.of(new StringBuilder("a"));
      list.get(0).append("b"); // OK, StringBuilder mutable
      ```

### 4. Khi nào nên chọn collection thread-safe gốc (`ConcurrentHashMap`) thay vì wrapper synchronized.
- **Trả lời**:
    - **Chọn `ConcurrentHashMap`**:
        - Hiệu năng cao hơn (lock từng bucket).
        - Hỗ trợ atomic operations (`compute`, `merge`).
    - **Wrapper synchronized**: Phù hợp khi chỉ cần đồng bộ cơ bản.
    - **Ví dụ**:
      ```java
      ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
      map.computeIfAbsent("key", k -> 0);
      ```

---

## 11) Mini case (thực chiến)

### 1. Thiết kế cache nhỏ LRU dùng `LinkedHashMap`.
- **Trả lời**:
  ```java
  class LRUCache<K, V> extends LinkedHashMap<K, V> {
      private final int capacity;
      public LRUCache(int capacity) {
          super(capacity, 0.75f, true);
          this.capacity = capacity;
      }
      @Override
      protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
          return size() > capacity;
      }
  }
  ```

### 2. Phân tích nguyên nhân `ConcurrentModificationException` khi remove phần tử trong vòng for-each.
- **Trả lời**:
    - **Nguyên nhân**: Sửa đổi collection (remove) trong khi iterate bằng for-each.
    - **Khắc phục**: Dùng `Iterator.remove()` hoặc Stream/collect mới.
    - **Ví dụ**:
      ```java
      // Xấu
      List<String> list = new ArrayList<>(List.of("a", "b"));
      for (String s : list) list.remove(s); // ConcurrentModificationException
      // Tốt
      Iterator<String> it = list.iterator();
      while (it.hasNext()) if (it.next().equals("a")) it.remove();
      ```

### 3. Tìm top 10 sản phẩm bán chạy nhất với `HashMap` + `PriorityQueue`.
- **Trả lời**:
  ```java
  record Product(String id, int sales) {}
  List<Product> top10 = products.stream()
      .collect(Collectors.groupingBy(Product::id, Collectors.summingInt(Product::sales)))
      .entrySet().stream()
      .map(e -> new Product(e.getKey(), e.getValue()))
      .collect(Collectors.toCollection(() -> new PriorityQueue<>(10, Comparator.comparingInt(Product::sales))))
      .stream().limit(10).toList();
  ```

### 4. Dùng `TreeMap` để lưu dữ liệu theo mốc thời gian và query theo khoảng ngày.
- **Trả lời**:
  ```java
  TreeMap<LocalDate, String> events = new TreeMap<>();
  events.put(LocalDate.now(), "Event");
  NavigableMap<LocalDate, String> range = events.subMap(
      LocalDate.of(2025, 1, 1), true,
      LocalDate.of(2025, 12, 31), true
  );
  ```

### 5. Cài đặt queue xử lý tác vụ ưu tiên thấp/trung/cao với `PriorityBlockingQueue`.
- **Trả lời**:
  ```java
  enum Priority { LOW, MEDIUM, HIGH }
  record Task(String name, Priority priority) implements Comparable<Task> {
      @Override
      public int compareTo(Task o) { return priority.compareTo(o.priority); }
  }
  BlockingQueue<Task> queue = new PriorityBlockingQueue<>();
  queue.offer(new Task("task1", Priority.HIGH));
  ```

### 6. So sánh chi phí bộ nhớ giữa `ArrayList` và `LinkedList` khi lưu 1 triệu phần tử.
- **Trả lời**:
    - **`ArrayList`**:
        - Bộ nhớ: Mảng liên tục, ~4 byte/phần tử (reference) + overhead mảng.
        - Tổng: ~4MB cho 1 triệu phần tử (64-bit JVM, không tính đối tượng thật).
    - **`LinkedList`**:
        - Bộ nhớ: Mỗi node có 2 con trỏ (next/prev) + reference, ~24 byte/node.
        - Tổng: ~24MB cho 1 triệu phần tử.
    - **Chọn**: `ArrayList` tiết kiệm bộ nhớ hơn.

---

