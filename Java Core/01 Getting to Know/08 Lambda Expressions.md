## 1) Khái niệm & Functional Interface (SAM)

1. Lambda expression là gì? Nó triển khai **functional interface** (SAM) như thế nào?
2. `@FunctionalInterface` có tác dụng gì? Thiếu annotation này thì interface còn là functional interface không?
3. Liệt kê một số functional interfaces chuẩn trong `java.util.function` (Supplier, Consumer, Function, Predicate, Unary/BinaryOperator).
4. ⚠️ Gài: Vì sao các method thừa kế từ `Object` (equals/hashCode/toString) **không** tính vào số lượng abstract methods khi xác định functional interface?

## 2) Cú pháp lambda

1. Các dạng cú pháp hợp lệ: không tham số `() -> …`, một tham số `x -> …`, nhiều tham số `(x, y) -> …`, khối lệnh `{ … }`, `return`.
2. Khi nào có thể lược bỏ kiểu tham số? Khi nào buộc phải ghi kiểu?
3. ⚠️ Gài: `x -> { return x + 1; }` khác gì `x -> x + 1` về ngữ nghĩa và ràng buộc cú pháp (statement vs expression)?

## 3) Target typing & type inference

1. **Target typing** là gì? Tại sao cùng một lambda có thể gán cho `Runnable` hoặc `Callable<T>` tuỳ ngữ cảnh?
2. Suy luận kiểu tham số và kiểu trả về của lambda diễn ra như thế nào?
3. ⚠️ Gài: Trường hợp **mơ hồ** giữa `overloadedMethod(Runnable)` và `overloadedMethod(Callable<String>)`—compiler chọn thế nào? Cách giải mơ hồ?

## 4) Method Reference

1. Bốn dạng method reference: `obj::instanceMethod`, `Class::staticMethod`, `Class::instanceMethod`, `Class::new` (constructor).
2. Khi nào nên dùng method reference thay cho lambda để code dễ đọc hơn?
3. ⚠️ Gài: Sự khác nhau giữa `String::toLowerCase` dùng như `Function<String,String>` và `BiFunction<String,Locale,String>` (overload resolution)?

## 5) Phạm vi, capture & “effectively final”

1. Quy tắc **effectively final** là gì? Vì sao lambda **không** sửa được biến local?
2. ⚠️ Gài: Tại sao đoạn code trong vòng lặp `for (int i...) { tasks.add(() -> use(i)); }` đôi khi không chạy như mong đợi? So sánh với JavaScript closure.
3. Khác biệt **lớn** giữa lambda và anonymous class về `this`/`super`/shadowing biến là gì?
4. Lambda có thể truy cập field/method của lớp bao quanh như thế nào? Rủi ro concurrency?

## 6) Lambda & Exceptions (checked/unchecked)

1. Cách xử lý **checked exception** trong lambda khi dùng các interface chuẩn (Predicate/Function) vốn **không throws**.
2. ⚠️ Gài: “Sneaky throws”/wrap exception (RuntimeException) — ưu/nhược, khi nào nên tránh?
3. Thiết kế functional interface **tự định nghĩa** để ném checked exception (`ThrowingFunction`)—ý tưởng và trade-off.

## 7) Generics, intersection types & overloading

1. Lambda tương tác với **generics** như thế nào (ví dụ `Function<T,R>`, `Comparator<T>`)?
2. ⚠️ Gài: **Intersection type** trong `(<T extends Runnable & Serializable>)`—làm sao gán một lambda thành `Runnable & Serializable`?
3. Overload method nhận nhiều SAM khác nhau: quy tắc chọn hàm và kỹ thuật **cast** tường minh.

## 8) Bất biến, trạng thái & side-effects

1. Lambda **stateless** vs **stateful**: khác nhau, rủi ro khi dùng state mutable (đếm, cộng dồn) trong stream.
2. ⚠️ Gài: Vì sao side-effect trong `map`/`filter` của stream thường là **mùi**? Trường hợp nào chấp nhận được?
3. Kỹ thuật gom kết quả đúng cách: dùng `collect`, `reduce` thay cho cập nhật biến ngoài.

## 9) Lambda & Streams

1. Viết pipeline điển hình với stream: `map`, `filter`, `flatMap`, `sorted`, `collect`.
2. ⚠️ Gài: Vì sao `forEach` **không** nên dùng để biến đổi dữ liệu? Thay vào đó nên dùng gì?
3. Liên hệ comparator: `Comparator.comparing`, `thenComparing`, `reversed`—cách kết hợp method reference & lambda.

## 10) Hiệu năng & bytecode

1. Lambda được triển khai bằng `invokedynamic` và `LambdaMetafactory`—ý nghĩa đối với hiệu năng là gì?
2. ⚠️ Gài: **Capturing lambda** khác **non-capturing lambda** về việc cache/reuse instance thế nào?
3. Khi nào lambda **nhanh hơn**/tương đương/“không nhanh hơn” so với code imperative? Lưu ý boxing/unboxing.

## 11) Concurrency & parallel

1. Dùng lambda trong `CompletableFuture`, `ExecutorService`: best practices khi truyền hàm.
2. ⚠️ Gài: Vì sao **stateful lambda** + **parallel stream** có thể gây kết quả sai/`ConcurrentModificationException`?
3. Kỹ thuật thread-safety khi dùng lambda: dùng collectors concurrent, tránh shared mutable state.

## 12) Optional & higher-order functions

1. Dùng lambda với `Optional`: `map`, `flatMap`, `filter`, `orElseGet`, `ifPresentOrElse`.
2. **Function composition**: `andThen`, `compose`, `Predicate.and/or/negate`.
3. ⚠️ Gài: Sự khác nhau về thứ tự với `f.andThen(g)` và `g.compose(f)`; ví dụ gây nhầm.

## 13) Annotation & `var` trong tham số lambda

1. Khi nào cần **kiểu tường minh** hoặc dùng `var` trong tham số lambda? Quy tắc đồng nhất (all-or-none).
2. ⚠️ Gài: Gắn annotation (ví dụ `@Nonnull`) lên tham số lambda—cú pháp đúng và hạn chế hiện tại?

## 14) So sánh với anonymous class & method handle

1. Ưu/nhược của lambda so với **anonymous inner class** về độ gọn và scoping.
2. ⚠️ Gài: `this` trong lambda trỏ tới đâu so với anonymous class?
3. Khi nào cân nhắc **Method Handle** thay vì lambda cho hiệu năng/case framework?

## 15) Serialization, equals/hashCode & logging

1. Lambda có nên/không nên **Serializable**? Hệ quả khi serialize (khả năng vỡ tương thích).
2. ⚠️ Gài: Hai lambda có cùng code có **equals()** bằng nhau không? Có nên dùng lambda làm key Map?
3. Thực hành logging với lambda (SLF4J không hỗ trợ supplier như Java Util Logging)—lợi/hại.

---

## 16) Mini case (thực chiến 2–5 phút/câu)

1. Viết comparator sắp xếp `User` theo `lastName`, rồi `firstName` (nulls last), không phân biệt hoa/thường.
2. Chuyển một đoạn code imperative lọc–map–sắp xếp sang stream + lambda, đảm bảo **không side-effect**.
3. Tạo `RetryingFunction<T,R>` (functional interface) cho phép retry N lần với backoff; demo bọc một `Function<T,R>`.
4. Viết `Collectors.toMap` an toàn khi có key trùng, chỉ định `LinkedHashMap` làm implementation, và **merge function** phù hợp.
5. Biến danh sách `List<List<String>>` thành một **set** các từ duy nhất, lower-case, bỏ trống—dùng `flatMap`.
6. Sửa một pipeline song song sai vì cập nhật `ArrayList` trong `forEach`—đưa ra 2 cách đúng (collector thread-safe hoặc thu gọn về sequential phần nguy hiểm).
