# Case 4: Công thức tính kích thước pallet sai khiến không tận dụng hết sức chứa (Data mapping)

**Bối cảnh nghiệp vụ**
Khi đóng hàng lên pallet để vận chuyển, hệ thống tự động tính toán số lượng kiện hàng có thể xếp lên 1 pallet dựa trên kích thước/thể tích từng kiện hàng và giới hạn kích thước tối đa của pallet, để tối ưu số pallet cần dùng cho mỗi chuyến xe.

**Phát hiện**
Không phải do lỗi hệ thống báo — mà do team vận hành kho vận nhận thấy số pallet thực tế cần dùng cho mỗi chuyến hàng luôn nhiều hơn dự kiến so với kế hoạch ban đầu, phải điều thêm xe hoặc thêm chuyến ngoài kế hoạch thường xuyên hơn mức bình thường — gây phát sinh chi phí vận chuyển ngoài dự toán.

**Điều tra**
So sánh số lượng hàng hệ thống tính là "vừa 1 pallet" với số lượng thực tế xếp được khi đóng hàng thật, phát hiện hệ thống luôn tính ra số lượng ít hơn khả năng thực tế có thể xếp — tức là mỗi pallet đang bị "bỏ trống" một phần sức chứa mà đáng ra có thể tận dụng thêm. Kiểm tra lại công thức tính trong code, phát hiện công thức tính thể tích/kích thước gộp có một bước làm tròn sai (làm tròn xuống ở bước tính trung gian thay vì chỉ làm tròn ở bước cuối cùng), khiến sai số nhỏ ở mỗi kiện hàng cộng dồn lại qua nhiều kiện, dẫn đến kết quả cuối cùng lệch xa hơn tưởng tượng khi số lượng kiện hàng trên 1 đơn lớn.

**Phương án & đánh đổi**
- *Sửa lại thứ tự làm tròn, chỉ làm tròn ở bước tính cuối cùng thay vì làm tròn ở từng bước trung gian*: sửa đúng gốc rễ nhưng cần rà soát lại toàn bộ các đơn hàng đã lên kế hoạch dựa trên công thức cũ để đánh giá mức ảnh hưởng.
- *Thêm hệ số điều chỉnh (buffer) bù trừ vào công thức cũ mà không sửa logic gốc*: nhanh, không cần rà soát sâu, nhưng chỉ là giải pháp tạm — sai số vẫn còn đó và có thể trồi sụt tùy loại hàng khác nhau, không giải quyết tận gốc.

**Quyết định & lý do**
Chọn sửa lại đúng thứ tự làm tròn trong công thức gốc, vì thêm hệ số bù trừ là cách "chữa cháy" không bền vững — mỗi loại hàng có tỷ lệ sai số khác nhau nên 1 hệ số cố định không thể đúng cho tất cả trường hợp, về lâu dài vẫn gây lãng phí pallet ở một số nhóm hàng nhất định.

**Kết quả**
Sau khi sửa, số lượng hàng tính vừa 1 pallet khớp sát với thực tế đóng hàng, số pallet/chuyến xe cần dùng giảm xuống đúng như kế hoạch ban đầu, giảm được số chuyến xe phát sinh ngoài dự toán, tiết kiệm chi phí vận chuyển đáng kể theo tháng.

Hiểu rồi, bỏ hết mấy chi tiết "xuống kho đếm tay", "chạy ra bãi xe" để đúng chất một **Software Engineer / Backend Dev**: nhận ticket từ operation báo lên, ngồi debug, đọc source code, trace log, reproduce bug trên máy và fix tận gốc.

Dưới đây là bản viết lại chuẩn góc nhìn của Dev:

---

# Case 4: Lỗi làm tròn tích lũy trong thuật toán đóng gói pallet gây lãng phí tải trọng xe (Floating-Point Precision & Intermediate Rounding Error)

**Bối cảnh nghiệp vụ**

Trong hệ thống Logistics/WMS, có một module tính toán đóng gói pallet (Pallet Utilization / Bin Packing). Khi lập kế hoạch xuất hàng, hệ thống dựa vào kích thước 3 chiều (Dài x Rộng x Cao) và thể tích của từng kiện hàng để tính xem một pallet tiêu chuẩn chứa được tối đa bao nhiêu kiện, từ đó tính ra tổng số pallet cần dùng để hệ thống tự động gợi ý loại xe tải phù hợp.

**Phát hiện**

Team dev nhận được ticket phản ánh từ bộ phận Vận hành/Điều vận (Operations): Số lượng pallet thực tế luôn vượt dự toán hệ thống tính ra, dẫn đến việc thường xuyên bị thiếu xe và phải gọi thêm xe tải ngoài kế hoạch. Phía operation nghi ngờ hệ thống tính toán sai sức chứa của pallet.

**Điều tra**

Là dev chịu trách nhiệm xử lý ticket, em bắt đầu kiểm tra:

1. **Lấy dữ liệu thực tế (Data Profiling):** Em trích xuất các đơn hàng bị lệch từ production, lấy kích thước thực tế của từng kiện hàng và cấu hình chuẩn của pallet (kích thước tối đa, chiều cao tối đa cho phép).
2. **Reproduce & Trace Code:** Em viết unit test để chạy lại thuật toán tính toán với đúng bộ dữ liệu đó. Kết quả: cùng một kích thước pallet và kiện hàng, phép tính nhẩm theo logic toán học cho ra 80 kiện/pallet, nhưng hàm trong code chỉ trả về 68 kiện/pallet.
3. **Phân tích nguyên nhân gốc rễ (Root Cause):** Inspect sâu vào logic của hàm, em phát hiện lỗi **sai số tích lũy (Cumulative Rounding Error)**:
* Code cũ thực hiện đổi đơn vị từ milimet sang mét hoặc foot, sau đó tính số kiện trên mỗi cạnh (dài, rộng, cao).
* Tuy nhiên, dev trước đó đã đặt hàm làm tròn xuống (`Math.floor` / `setScale(..., DOWN)`) **ngay ở từng phép chia trung gian** của từng chiều kích thước trước khi nhân lại để tính tổng sức chứa.
* Việc làm tròn quá sớm khiến mỗi chiều bị hụt đi một phần nhỏ. Khi nhân 3 chiều lại với nhau trên một ma trận nhiều lớp hàng, sai số này bị khuếch đại (amplified), làm hệ thống kết luận pallet đã "đầy" trong khi thực tế thể tích và diện tích sàn vẫn còn dư rất nhiều.



**Phương án & đánh đổi**

* *Thêm hệ số bù trừ (Buffer/Multiplier)*: Nhân thêm một tỷ lệ phần trăm (ví dụ 10-15%) vào kết quả cuối cùng.
*Nhược điểm:* Đây là "magic number" mang tính chữa cháy. Kích thước kiện hàng rất đa dạng, một hệ số cố định không thể đúng cho mọi SKU; với các kiện hàng lớn, việc nhân thêm hệ số có thể làm hệ thống tính vượt quá chiều cao thùng xe tải ngoài đời.
* *Chuẩn hóa thứ tự làm tròn và kiểu dữ liệu (Exact Precision)*: Giữ nguyên độ chính xác cao nhất ở các bước tính toán trung gian (dùng đơn vị nhỏ nhất là milimet với kiểu số nguyên `Integer/Long` hoặc dùng `BigDecimal`), loại bỏ hoàn toàn các hàm `floor` ở giữa luồng, chỉ làm tròn số nguyên một lần duy nhất ở kết quả đóng gói cuối cùng.
*Nhược điểm:* Phải rà soát và viết lại toàn bộ unit test/integration test cho module tính toán đóng gói để đảm bảo không làm gãy các ràng buộc an toàn (như giới hạn tải trọng tối đa).

**Quyết định & lý do**

Chọn sửa triệt để thứ tự làm tròn trong code gốc. Là dev, không thể đưa các "hệ số ma" (magic numbers) vào code để vá lỗi toán học. Thuật toán phải phản ánh chính xác bài toán hình học không gian thì hệ thống mới chạy ổn định lâu dài được.

**Kết quả**

* Sau khi fix và deploy, kết quả tính toán của module pallet khớp chính xác với sức chứa vật lý.
* Tỷ lệ tận dụng pallet tính toán trên hệ thống tăng từ ~70% lên sát 90%, số lượng pallet dự toán khớp hoàn toàn với thực tế xếp hàng của kho.
* Team vận hành không còn tình trạng thiếu xe tải hay phải điều xe đột xuất, ticket được đóng triệt để.

---

### Câu trả lời phỏng vấn đầy đủ (Góc nhìn thuần Backend Dev)

> "Trong quá trình bảo trì hệ thống Logistics/WMS, em từng giải quyết một con bug khá thú vị liên quan đến **độ chính xác số học (Floating-Point Precision) và sai số làm tròn tích lũy** trong module tính toán đóng gói pallet (Bin Packing).
> Hệ thống có tính năng tính toán kích thước 3D của các kiện hàng để xếp lên pallet, từ đó xác định số lượng pallet cần dùng để tự động gợi ý loại xe tải phù hợp. Team dev nhận được ticket từ bộ phận vận hành báo rằng: Kế hoạch hệ thống tính luôn bị thiếu pallet so với thực tế, khiến họ thường xuyên bị hụt xe và phải gọi thêm xe ngoài kế hoạch.
> Khi nhận ticket, em trích xuất bộ dữ liệu các đơn hàng bị lệch từ production về để debug và viết unit test tái hiện lỗi. Khi đối chiếu kết quả hàm chạy với phép tính toán học thông thường, em nhận ra code luôn trả về kết quả số kiện trên một pallet thấp hơn 15–20% so với thực tế.
> Đọc sâu vào source code thuật toán, em phát hiện nguyên nhân gốc rễ:
> Người viết code cũ khi quy đổi đơn vị kích thước từng cạnh đã dùng hàm làm tròn xuống (`Math.floor`) **ngay ở từng bước tính trung gian** của từng chiều (Dài, Rộng, Cao). Việc làm tròn sớm khiến mỗi chiều bị mất đi một phần nhỏ; khi nhân 3 chiều lại với nhau trên một ma trận đóng gói nhiều lớp, sai số này bị cộng dồn và khuếch đại lên rất lớn, khiến hệ thống kết luận pallet đã đầy dù không gian thực tế vẫn còn dư.
> Về phương án xử lý:
> * Có ý kiến đề xuất thêm một hệ số bù trừ (buffer multiplier) vào kết quả cuối cho nhanh, nhưng em từ chối vì đây là 'magic number'. Mỗi loại hàng có kích thước khác nhau, nhét hệ số cứng vào sẽ khiến các kiện hàng cồng kềnh bị tính tràn thể tích an toàn của xe tải.
> * Em chọn cách **tái cấu trúc lại chuỗi tính toán**: chuyển toàn bộ kích thước về đơn vị nhỏ nhất là milimet kiểu số nguyên để tránh sai số dấu phẩy động, loại bỏ toàn bộ các hàm làm tròn ở bước trung gian và chỉ làm tròn một lần duy nhất ở kết quả số lượng kiện cuối cùng.
> 
> 
> Em đã bổ sung một bộ unit test phủ toàn bộ các case kích thước hàng từ nhỏ đến cồng kềnh trước khi release. Sau khi deploy, hệ thống tính toán chính xác sức chứa thực tế, số lượng pallet dự toán khớp hoàn toàn và team vận hành không còn bị động trong việc điều phối xe tải."

---

### Các câu hỏi Interviewer có thể đào sâu tiếp & Cách trả lời cho Dev:

#### 1. "Em test và verify lại thuật toán này thế nào trước khi deploy lên Production?"

* **Gợi ý trả lời:**
"Em viết **Unit Test theo dạng Data-Driven Testing (hoặc Parameterized Test)**:
* Lấy khoảng 20–30 bộ dữ liệu kích thước thực tế từ production log (gồm cả hàng nhỏ, hàng cồng kềnh, hàng kích thước lẻ như 103mm, 207mm).
* Viết các test case kiểm tra 2 tiêu chí bắt buộc: (1) Kết quả số lượng kiện không được vượt quá thể tích và tải trọng tối đa của pallet, và (2) Không được có hiện tượng lãng phí không gian lớn do làm tròn sai.
* Chạy test song song giữa hàm cũ và hàm mới trên tập dữ liệu lịch sử để so sánh độ chênh lệch trước khi merge code."



#### 2. "Tại sao không dùng `float` hay `double` mà lại chuyển về `milimet` hoặc `BigDecimal`?"

* **Gợi ý trả lời:**
"Chuẩn dấu phẩy động IEEE 754 của `float`/`double` không thể biểu diễn chính xác số thập phân ở mức nhị phân (ví dụ $0.1 + 0.2 \neq 0.3$). Khi thực hiện nhiều phép nhân chia liên tiếp, sai số precision sẽ tự tích tụ. Trong hệ thống backend, chuẩn nhất là đưa về **đơn vị nguyên tử nhỏ nhất (milimet)** và lưu bằng kiểu số nguyên (`Integer` hoặc `Long`) — vừa tính toán nhanh ở tầng CPU, vừa không bao giờ bị sai số làm tròn."

#### 3. "Nếu bài toán nâng cấp lên xếp các kiện hàng có kích thước hỗn hợp (nhiều SKU khác kích thước trên cùng 1 pallet), em sẽ thiết kế thuật toán thế nào?"

* **Gợi ý trả lời:**
"Đó là bài toán **3D Bin Packing Problem (NP-Hard)**. Ở tầng backend, nếu giải bằng quy hoạch động hay vét cạn sẽ gây timeout API. Em sẽ dùng giải thuật **Heuristic (như Best-Fit Decreasing - BFD)**:
1. Sort danh sách kiện hàng theo thể tích giảm dần.
2. Duyệt từng kiện, dùng thuật toán không gian trống (Guillotine Split hoặc Coordinate Spaces) để tìm vị trí còn trống nhỏ nhất mà vừa với kiện đó.
3. Kiểm tra các ràng buộc: xoay chiều kiện hàng (rotation), trọng tâm pallet và giới hạn tải trọng trước khi chốt tọa độ đặt kiện."