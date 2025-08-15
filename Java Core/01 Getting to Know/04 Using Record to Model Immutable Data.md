## 1) Khái niệm & Mục tiêu của Record

1. Record là gì? Khác gì với POJO/JavaBean truyền thống về mục tiêu thiết kế.
2. Khi nào nên dùng record để mô hình dữ liệu bất biến? Liệt kê 3 tình huống điển hình.
3. ⚠️ Gài: Record có tự động đảm bảo “bất biến sâu” (deep immutability) không? Giải thích.

## 2) Cú pháp & Thành phần Record

1. Cú pháp khai báo record cơ bản (`record Point(int x, int y) {}`) gồm những **components** nào?
2. Mỗi component sinh ra những thành phần gì (field, accessor, `equals/hashCode/toString`, canonical constructor)?
3. ⚠️ Gài: Có thể khai báo **field instance bổ sung** ngoài components không? Nếu có/thì có ràng buộc gì?
4. Có thể thêm **static fields**, **static methods**, **nested types** trong record không?

## 3) Tính bất biến & quản lý trạng thái

1. Vì sao record được xem là “bất biến theo hợp đồng” (shallow)?
2. ⚠️ Gài: `record Order(List<Item> items)`—trường hợp nào đối tượng **không thực sự bất biến**? Cách phòng vệ?
3. Record có setter không? Nếu cần “thay đổi” dữ liệu, các chiến lược thay thế?

## 4) Constructors: Canonical & Compact

1. Canonical constructor là gì? Chữ ký bắt buộc phải như thế nào?
2. Compact constructor khác gì canonical constructor đầy đủ tham số?
3. ⚠️ Gài: Trong compact constructor, có cần gán lại `this.x = x` không? Điều gì xảy ra nếu cố gán?
4. Thực hiện **validation/bình thường hoá** dữ liệu ở constructor như thế nào (ví dụ trim chuỗi, kiểm tra null)?
5. Có thể khai báo **additional constructors** (overloaded) trong record không? Yêu cầu gì?

## 5) Phương thức & Override

1. Record tự động sinh `equals`, `hashCode`, `toString`—tiêu chí dựa trên đâu?
2. ⚠️ Gài: Override `equals/hashCode` trong record được không? Cần tuân thủ điều gì để không phá hợp đồng?
3. Có thể thêm method tùy ý (business methods) vào record không? Ví dụ tính toán dựa trên components.

## 6) Kế thừa, `final` & Interfaces

1. Record có thể `extends` một class cụ thể không? Nó mặc định `extends` lớp nào?
2. ⚠️ Gài: Record có thể bị `extends` bởi class khác không (record có là `final` không)?
3. Record có thể `implements` interface không? Use case thực tế.

## 7) Annotations & Validation

1. Gắn annotation vào **record**, **component**, **accessor**, **constructor** như thế nào?
2. ⚠️ Gài: Dùng Bean Validation (`@NotNull`, `@Email`…) trên components—validator chạy lúc nào, và nên đặt ở đâu?
3. Viết validation tuỳ biến (check domain) ở compact constructor vs ở service—trade-off?

## 8) Generics & Type Inference

1. Khai báo **generic record** (`record Box<T>(T value) {}`) — ràng buộc gì?
2. ⚠️ Gài: `record Pair<T>(T a, T b)` với T là mutable—ảnh hưởng đến bất biến?
3. Dùng `var` với record trong Java hiện đại: lợi/nhược về đọc hiểu.

## 9) Pattern Matching & Deconstruction

1. Record hỗ trợ **deconstruction/patterns** như thế nào (record patterns)?
2. ⚠️ Gài: So sánh `instanceof` pattern matching với **record pattern** trong `switch` — khác nhau về phạm vi biến và exhaustiveness?
3. Khi nào nên dùng deconstruction để viết code khai thác dữ liệu nhanh gọn?

## 10) Serialization & Tương tác với Framework

1. Java Serialization mặc định xử lý record ra sao? Lưu ý về thứ tự components.
2. ⚠️ Gài: Dùng record với **Jackson/Gson** — cần điều kiện gì (constructor/param names)? Vấn đề khi đổi tên component?
3. Record & JPA/Hibernate: có nên dùng record làm **entity**? Nêu các rào cản điển hình (no-arg ctor, mutability…). Giải pháp thay thế.

## 11) So sánh với POJO + Lombok

1. Record vs Lombok `@Value`/`@Data`: khác nhau về mức “ràng buộc ngôn ngữ” vs “tạo mã tự động”.
2. ⚠️ Gài: Khi nào Lombok vẫn phù hợp hơn record? Kể ví dụ cụ thể.
3. Chi phí chuyển đổi một POJO bất biến sang record: rủi ro tương thích nhị phân/JSON.

## 12) Hiệu năng, Bộ nhớ & GC

1. Record có lợi gì về **bộ nhớ** và **inlineability** so với POJO tương đương?
2. ⚠️ Gài: `toString()` sinh tự động có an toàn trên data lớn/nhạy cảm? Ảnh hưởng logging/perf?
3. Ảnh hưởng của record đến **hash-based collections** (key trong `HashMap/HashSet`) khi components thay đổi ý nghĩa.

## 13) Thiết kế API & Best Practices

1. Khi thiết kế API domain: tiêu chí chọn record cho **DTO**, **Value Object**, **Event payload**.
2. ⚠️ Gài: Thêm **logic nặng** vào record có mùi thiết kế không? Ranh giới giữa VO thuần dữ liệu và domain object giàu hành vi.
3. Naming components: tính ổn định hợp đồng khi public accessor trùng tên component.

## 14) Truy cập & Bao đóng

1. Accessor của record là gì (không phải “getX()” mà là `x()`)? Ảnh hưởng đến mapping/thư viện phản chiếu.
2. ⚠️ Gài: Có nên để components lộ trực tiếp collection? Kỹ thuật **defensive copy/unmodifiable view** ở đâu?
3. “Canon” bất biến: kiểm tra null/clone dữ liệu vào constructor vs kiểm soát ở edge của hệ thống.

## 15) Mini Case (thực chiến 2–5 phút/câu)

1. Thiết kế `record Money(BigDecimal amount, Currency currency)` bất biến “thực sự”: đề xuất validate & defensive copy.
2. Chuyển DTO `UserDto` (POJO + Lombok) sang record; nêu các thay đổi cần làm ở mapper/Jackson/OpenAPI.
3. `record Order(List<Item> items)`: đề xuất cách đảm bảo items không bị sửa từ bên ngoài (copy + unmodifiable).
4. Viết compact constructor cho `record Email(String value)` để chuẩn hoá (lowercase/trim) và validate theo regex.
5. Dùng **record pattern** trong `switch` để xử lý `Event` với các biến thể `UserCreated`, `UserDeleted` (records); đảm bảo exhaustiveness.
6. Sửa lỗi: sau khi đổi từ POJO sang record, Jackson báo lỗi không khớp tham số—liệt kê các nguyên nhân có thể và hướng khắc phục.