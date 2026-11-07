## A. Array, String, Hash Map (nền tảng, gần như chắc chắn bị hỏi)

1. 🔥 **Two Sum** (tìm hai số có tổng = target). Từ brute force O(n²) lên hash map O(n). Hỏi thêm: mảng đã sort thì sao (two pointers, O(1) bộ nhớ)? Có nhiều cặp đáp án thì sao? Mảng 1 tỷ phần tử không vừa RAM?
2. 🔥 **Phát hiện phần tử trùng**: kiểm tra danh sách messageId có trùng không. So sánh `HashSet` (O(n) bộ nhớ), sort (O(n log n), ít bộ nhớ), Bloom filter (xấp xỉ). Liên hệ: idempotent consumer.
3. **Subarray có tổng bằng K** (có số âm): prefix sum + hash map. Vì sao sliding window không dùng được khi có số âm?
4. 🔥 **Longest substring không lặp ký tự**: sliding window. Điều kiện co/giãn cửa sổ, độ phức tạp, Unicode/emoji có phá giả định không?
5. **Group Anagrams**: key là chuỗi sort hoặc mảng đếm 26 ký tự. So sánh hai cách về độ phức tạp.
6. **Valid Parentheses** (stack). Mở rộng: validate JSON/biểu thức đơn giản, xử lý chuỗi cực dài mà không đệ quy.
7. **Merge Intervals**: gộp các khoảng thời gian chồng lấn. Use case: gộp lịch làm việc, phát hiện **trùng lịch tài xế/xe** (đúng bài Apollogix trong CV của bạn). Mở rộng: có nhiều phòng họp cần bao nhiêu phòng (sort + heap hoặc sweep line)?
8. **Top K phần tử xuất hiện nhiều nhất**: hash map + min-heap O(n log k), hoặc bucket sort O(n). Use case: top SKU bán chạy từ log 100 triệu dòng, không vừa RAM thì sao?
9. **Product of Array Except Self** (không dùng phép chia): prefix/suffix. Cách giải O(1) bộ nhớ phụ.
10. **Rotate Array / Move Zeroes**: in-place, two pointers. Tại sao in-place quan trọng khi dữ liệu lớn?
11. **Container With Most Water / 3Sum**: two pointers sau khi sort, xử lý trùng lặp.
12. **String xử lý thực tế**: tách và đếm từ trong file log, parse dòng CSV có dấu phẩy trong ngoặc kép, đảo chuỗi theo từ. Điều senior hỏi thêm: encoding, chuỗi rỗng, null, khoảng trắng.
13. **Longest Palindromic Substring**: mở rộng từ tâm O(n²), biết Manacher là O(n) (không cần cài).
14. **Đếm tần suất ký tự / chuỗi** dùng mảng `int[26]` thay `HashMap<Character,Integer>`. Vì sao nhanh hơn (boxing, hashing)?

## B. Linked List, Stack, Queue, Heap

15. **Reverse Linked List** (lặp và đệ quy), **phát hiện chu trình** (Floyd), **tìm node giữa**. Cái giá của đệ quy với list 1 triệu node (stack overflow).
16. **Merge hai list đã sort / Merge K sorted lists**: heap, O(N log k). Use case: gộp K file log đã sort theo thời gian, gộp kết quả từ K shard.
17. 🔥 **LRU Cache** O(1) cho `get/put`: `HashMap` + doubly linked list, hoặc `LinkedHashMap` với `accessOrder=true` và `removeEldestEntry`. Hỏi thêm: **thread-safe** thì làm sao (lock toàn bộ, lock theo segment, dùng Caffeine)? Hạn chế của LRU (scan lớn làm bẩn cache), nghe qua LFU/TinyLFU.
18. **Min Stack** (lấy min O(1)), **Queue bằng hai Stack**, **Stack bằng hai Queue**.
19. **Next Greater Element / Daily Temperatures**: monotonic stack. Nhận biết dạng bài.
20. **Sliding Window Maximum**: deque đơn điệu O(n).
21. **Kth Largest Element**: min-heap kích thước k O(n log k) vs quickselect O(n) trung bình. Dữ liệu stream thì sao?
22. **Median từ data stream**: hai heap. Use case: theo dõi p50 của latency liên tục.
23. **Task Scheduler / Meeting Rooms II**: heap + greedy. Liên hệ lập lịch job batch.
24. **Priority Queue của Java**: thứ tự duyệt có sorted không? Vì sao `PriorityQueue` không thread-safe và `PriorityBlockingQueue` dùng khi nào?

## C. Tree, Graph, Backtracking

25. 🔥 **Duyệt cây** (DFS pre/in/post-order, BFS theo tầng), cả bản đệ quy lẫn lặp bằng stack. **Max depth, kiểm tra cây đối xứng, validate BST**.
26. **Lowest Common Ancestor**, **Serialize/Deserialize cây**. Use case: cây vị trí kho (kho → khu → kệ → ô), cây danh mục, tìm tổ tiên chung.
27. **Cây phân cấp từ danh sách phẳng** `(id, parentId)`: dựng cây trong O(n) bằng hash map. Phát hiện chu trình dữ liệu bẩn, nhiều root.
28. 🔥 **Number of Islands / flood fill**: DFS/BFS trên lưới. Biến thể: tìm đường ngắn nhất trong kho (BFS trên lưới có chướng ngại vật), đúng tinh thần **picking route** trong WMS.
29. **Graph cơ bản**: biểu diễn (adjacency list vs matrix), BFS/DFS, đếm thành phần liên thông, phát hiện chu trình.
30. 🔥 **Topological sort** (Course Schedule): sắp xếp thứ tự thực thi task có phụ thuộc, phát hiện **phụ thuộc vòng**. Use case: thứ tự chạy batch job, thứ tự deploy service, thứ tự migration.
31. **Shortest path**: BFS (không trọng số), Dijkstra (có trọng số, heap). Use case: tuyến đường tối ưu, chi phí vận chuyển giữa các kho.
32. **Union-Find**: gộp nhóm, phát hiện kết nối. Use case: gom các đơn hàng/thực thể trùng.
33. **Permutations / Subsets / Combination Sum / N-Queens**: backtracking. Cắt nhánh (pruning) để giảm không gian tìm kiếm.
34. **Trie**: autocomplete mã sản phẩm theo tiền tố. So sánh với `TreeMap.subMap` và với DB (`LIKE 'abc%'` có index).
35. **BST và tự cân bằng**: vì sao BST không cân bằng thoái hóa O(n)? `TreeMap` dùng Red-Black Tree, `HashMap` treeify bucket dài.

## D. Searching, Sorting, Dynamic Programming

36. 🔥 **Binary Search** và biến thể: tìm vị trí chèn, first/last occurrence, tìm trong mảng xoay, **binary search trên đáp án** (tìm công suất nhỏ nhất để giao hết hàng trong D ngày). Lỗi kinh điển: tràn số `(l+r)/2` (dùng `l + (r-l)/2`), vòng lặp vô hạn, biên.
37. **Sắp xếp**: giải thích quicksort, mergesort, heapsort, độ phức tạp, ổn định (stable). `Arrays.sort` cho primitive và cho object dùng thuật toán gì (dual-pivot quicksort vs TimSort), vì sao?
38. **Sắp xếp file 50GB với 2GB RAM**: external merge sort (chia chunk sort rồi merge K đường). Liên hệ batch job.
39. 🔥 **DP cơ bản**: Climbing Stairs, House Robber, Coin Change, Longest Increasing Subsequence. Cách nhận diện DP (bài toán con gối nhau, tối ưu cấu trúc con), từ đệ quy → memo → bảng → tối ưu bộ nhớ.
40. **Knapsack 0/1**: use case xếp hàng vào container/xe tải theo trọng lượng, chọn đơn tối đa giá trị trong giới hạn tải. Nhận ra bài NP-khó thì dùng heuristic/greedy.
41. **Edit Distance, Longest Common Subsequence**: so khớp chuỗi, diff. Use case: gợi ý sửa mã sản phẩm sai chính tả.
42. **Greedy vs DP**: cho ví dụ greedy đúng (interval scheduling) và greedy sai (coin change với mệnh giá lạ).
43. **Bit manipulation cơ bản**: kiểm tra lũy thừa 2, đếm bit, XOR tìm số đơn lẻ. Use case: bitmask quyền/cờ trạng thái.

## E. Độ phức tạp và tư duy phân tích

44. 🔥 Với mỗi bài trên: nêu **time và space complexity**, sau đó hỏi "input lớn gấp 1000 lần thì cái gì vỡ trước: CPU hay RAM?".
45. **Amortized**: vì sao `ArrayList.add` là O(1) amortized? `HashMap` thao tác O(1) trong trường hợp xấu nhất là gì?
46. Hai giải pháp, một nhanh nhưng tốn RAM, một chậm nhưng tiết kiệm. Chọn thế nào dựa trên ràng buộc thực tế?
47. Nhận diện dạng bài từ đề: "nhiều lần truy vấn → tiền xử lý", "chuỗi con → sliding window", "đường đi → BFS/DFS", "tối ưu có cấu trúc con → DP".

## F. Coding thực tế cho backend (tầng này phân biệt mid với junior)

48. 🔥 **Rate limiter**: cài class `RateLimiter` cho phép N request/giây. Fixed window → sliding window log → token bucket. Làm cho **thread-safe** (`AtomicLong`, `synchronized`, `ConcurrentHashMap` theo user). Chạy nhiều instance thì sao (chuyển sang Redis + Lua)?
49. 🔥 **Thread-safe LRU/TTL cache**: cài cache có TTL, giới hạn kích thước, thread-safe. Làm sao dọn entry hết hạn (lazy vs scheduler)? Cache stampede xử lý thế nào (`computeIfAbsent`, lock theo key)?
50. 🔥 **Producer-Consumer**: cài bằng `BlockingQueue`, nhiều producer/consumer, cách dừng sạch (poison pill), xử lý khi queue đầy (backpressure).
51. **Retry helper**: viết `retry(Supplier<T>, maxAttempts, backoff)` có exponential backoff + jitter, chỉ retry với loại exception phù hợp. Retry thao tác không idempotent nguy hiểm thế nào?
52. **Circuit breaker đơn giản** (CLOSED/OPEN/HALF_OPEN) bằng state machine, thread-safe.
53. **Idempotent processor**: viết hàm xử lý message không xử lý trùng, kể cả khi hai thread cùng nhận một messageId (`ConcurrentHashMap.putIfAbsent` ở mức in-memory, unique constraint ở mức DB).
54. 🔥 **Xử lý file lớn**: đọc file CSV 10GB, đếm số dòng theo từng kho, bộ nhớ chỉ vài trăm MB. Streaming (`BufferedReader`, `Files.lines`), chia chunk, xử lý song song có kiểm soát, ghi kết quả từng phần.
55. **Chia batch**: viết hàm chia `List<T>` thành các batch kích thước n (tránh `IN` quá dài, bulk insert), đảm bảo không copy thừa dữ liệu.
56. **Parse và validate dữ liệu bẩn**: file nhập kho có dòng thiếu cột, số âm, ngày sai định dạng. Thiết kế để dòng lỗi không làm hỏng cả file, thu thập lỗi báo cáo lại.
57. **Gộp hai danh sách tồn kho** từ hai hệ thống, tìm dòng chỉ có một bên và dòng lệch số lượng: hash map theo key, O(n+m). Dữ liệu lớn không vừa RAM thì sort-merge theo key.
58. **ID generator phân tán** (snowflake): cấu trúc bit (timestamp + machine + sequence), xử lý đồng hồ lùi, thread-safe.
59. **Consistent hashing**: giải thích và cài khung đơn giản. Use case: chia key cho nhiều node cache/shard, thêm bớt node thì ít key phải di chuyển.
60. **Bloom filter**: nguyên lý, false positive, chọn số hash/kích thước. Use case: lọc nhanh messageId đã thấy trước khi tra DB.
61. **State machine cho trạng thái đơn hàng**: cài bằng `enum` với bảng chuyển trạng thái hợp lệ, chặn chuyển sai, dễ test, mở rộng.
62. **Thiết kế class OOP**: bãi đỗ xe, thang máy, hệ thống đặt phòng, quản lý vị trí kho. Cách chọn class, interface, áp dụng SOLID, design pattern phù hợp (Strategy cho cách tính phí, Factory, Observer), tránh lạm dụng pattern.
63. **Code review ngay tại chỗ**: đưa đoạn code Java có `HashMap` dùng chung nhiều thread, `catch (Exception e) {}`, string concat trong vòng lặp, `equals` thiếu `hashCode`, `SimpleDateFormat` dùng chung. Liệt kê lỗi và mức độ nghiêm trọng.
64. **Viết unit test cho một hàm**: chọn test case (biên, null, rỗng, trùng, số rất lớn), vì sao test độc lập, đặt tên test rõ nghĩa. Thiết kế hàm để dễ test (inject dependency, tách side effect).
65. **Debug bằng đọc code**: cho một đoạn code đa luồng có race condition tinh vi (check-then-act, `i++` không atomic, `HashMap` dùng chung), tìm bug và sửa bằng ít nhất hai cách.
66. **Tối ưu code chậm**: cho đoạn code O(n²) (lặp lồng nhau với `list.contains`), nhờ bạn tìm vấn đề và đổi sang O(n) bằng `Set`/`Map`. Đo bằng JMH hay chỉ đoán?

## G. Cách senior tiếp cận một bài coding (đây mới là thứ được chấm)

Thứ tự nên làm, và nên nói thành tiếng ở từng bước:

1. **Làm rõ đề:** kích thước input, có trùng không, có số âm không, input rỗng/null, đã sort chưa, cần tối ưu thời gian hay bộ nhớ?
2. **Nêu ví dụ nhỏ** và vài case biên trước khi code.
3. **Nói brute force trước**, rồi chỉ ra điểm nghẽn, rồi mới tối ưu. Đừng nhảy thẳng vào đáp án "thuộc lòng", vì nghe như học vẹt.
4. **Chốt hướng và độ phức tạp** trước khi viết code, hỏi interviewer có đồng ý không.
5. **Viết code sạch:** tên biến rõ nghĩa, tách hàm nhỏ, xử lý biên ngay từ đầu.
6. **Tự chạy thử** bằng tay với ví dụ và các case biên, tự bắt lỗi trước khi interviewer chỉ.
7. **Nói về mở rộng:** "nếu dữ liệu không vừa RAM thì…", "nếu chạy đa luồng thì…", "nếu cần test thì…".

Khi bí: nói ra suy nghĩ ("em đang cân nhắc hash map hoặc two pointers, vì…"), hỏi gợi ý lịch sự, và vẫn nộp được lời giải brute force chạy đúng còn hơn im lặng.

## Lộ trình luyện (4-6 tuần, 1-2 bài mỗi ngày)

| Tuần | Chủ đề | Mục tiêu |
|---|---|---|
| 1 | Array, String, Hash Map, Two pointers, Sliding window (câu 1-14) | Trơn tru 15-20 phút mỗi bài Easy/Medium |
| 2 | Linked list, Stack, Queue, Heap, LRU (câu 15-24) | Cài tay được LRU và Top K |
| 3 | Tree, Graph, BFS/DFS, Topological sort (câu 25-35) | Nhận ra bài đồ thị từ đề |
| 4 | Binary search, Sort, DP cơ bản (câu 36-43) | Giải được DP 1 chiều từ đệ quy → bảng |
| 5 | Coding backend (câu 48-66) | Cài rate limiter, cache, producer-consumer thread-safe |
| 6 | Mock interview coding có bấm giờ | Nói thành tiếng, tự test, nói độ phức tạp |

**Mẹo luyện:**
- Với mỗi bài, sau khi giải, **tự nâng yêu cầu**: dữ liệu 100 lần lớn hơn thì sao, chạy đa luồng thì sao. Đây là thứ phân biệt người trả lời kiểu senior.
- **Nhận diện dạng bài** quan trọng hơn giải nhiều bài. 80-100 bài chọn lọc theo các dạng trên hiệu quả hơn 300 bài làm ngẫu nhiên.
- Bài **Easy** phải trơn tru; mức **Medium** là đủ cho đa số công ty outsourcing/product Việt Nam, còn công ty lớn nước ngoài mới nặng về Hard.
- Luôn **viết bằng tay hoặc trên editor không có autocomplete** vài lần, vì nhiều vòng phỏng vấn chỉ cho Google Docs hoặc bảng trắng.
- Nhiều công ty Java còn cho **live coding trong IDE** với bài thực tế (như nhóm F), nên đừng chỉ luyện LeetCode.


