# Case 3a: Xử lý hàng loạt chậm do truy vấn lặp lại thông tin không đổi (Performance — CTE)

**Bối cảnh nghiệp vụ**
Vào cuối ngày, hệ thống chạy một tiến trình phân bổ hàng loạt cho hàng nghìn đơn hàng cùng lúc để kịp gửi hàng ra kho vận. Mỗi đơn hàng khi xử lý cần biết thông tin khu vực/vị trí kho tương ứng để chọn nơi lấy hàng — thông tin này gần như không thay đổi trong suốt cả đợt chạy.

**Phát hiện**
Team vận hành phản ánh tiến trình phân bổ cuối ngày ngày càng kéo dài, có nguy cơ trễ giờ cắt đơn (cut-off time) để kịp xe tải đến lấy hàng. Theo dõi thời gian chạy qua các tuần thì thấy tăng dần đều theo số lượng đơn hàng, không phải tăng đột biến do lỗi.

**Điều tra**
Bật log đo thời gian từng bước trong tiến trình, phát hiện phần lớn thời gian không nằm ở logic tính toán phân bổ mà nằm ở việc truy vấn thông tin khu vực/vị trí — được gọi lặp lại cho từng đơn hàng riêng lẻ. Xem lại câu lệnh SQL thì thấy thông tin khu vực/vị trí được lấy bằng một subquery lồng bên trong mệnh đề `WHERE` của câu truy vấn chính, khiến với mỗi dòng đơn hàng, database phải chạy lại subquery đó một lần — trong khi kết quả của subquery gần như giống nhau cho phần lớn các đơn.

**Phương án & đánh đổi**
- *Cache thông tin khu vực/vị trí ở tầng ứng dụng trước khi chạy vòng lặp phân bổ*: hiệu quả nhưng cần thêm logic invalidate cache khi dữ liệu khu vực/vị trí thay đổi giữa chừng (dù hiếm khi xảy ra trong lúc batch đang chạy).
- *Tái cấu trúc câu truy vấn dùng CTE (Common Table Expression)*: tính trước thông tin khu vực/vị trí cần thiết thành 1 tập kết quả trung gian (CTE) ngay từ đầu, sau đó câu truy vấn chính join thẳng vào CTE đó thay vì gọi lại subquery cho từng dòng.

**Quyết định & lý do**
Chọn tái cấu trúc bằng CTE, vì nó giải quyết đúng nguyên nhân gốc (database tự tối ưu chỉ tính CTE một lần rồi tái sử dụng), không cần quản lý thêm tầng cache ở ứng dụng (giảm rủi ro cache bị stale), và không thay đổi logic nghiệp vụ — chỉ thay đổi cách viết câu truy vấn.

**Kết quả**
Thời gian chạy tiến trình phân bổ cuối ngày giảm đáng kể, không còn tăng tuyến tính bất thường theo số lượng đơn, đảm bảo luôn hoàn thành trước giờ cắt đơn dù số lượng đơn hàng tiếp tục tăng theo mùa cao điểm.

### Câu trả lời phỏng vấn (STAR — case CTE, bạn trực tiếp làm)

> "Có một lần em trực tiếp phân tích và xử lý vấn đề performance ở tiến trình phân bổ đơn hàng cuối ngày. Đây là job chạy hàng loạt, xử lý cùng lúc hàng nghìn đơn để kịp gửi ra kho vận, và mỗi đơn khi xử lý cần biết thông tin khu vực/vị trí kho tương ứng để chọn chỗ lấy hàng.

> Team vận hành phản ánh là tiến trình này ngày càng chạy lâu, có nguy cơ trễ giờ cắt đơn để kịp xe tải đến lấy hàng. Em nhìn lại số liệu thời gian chạy qua từng tuần thì thấy nó tăng dần đều theo số lượng đơn, chứ không phải kiểu tăng đột biến do lỗi hệ thống — nên em đoán nó nằm ở vấn đề hiệu năng khi scale lên, không phải bug logic.

> Em bật log đo thời gian từng bước trong tiến trình thì phát hiện phần lớn thời gian không nằm ở phần tính toán phân bổ, mà nằm ở bước truy vấn thông tin khu vực/vị trí kho — bước này bị gọi lặp lại riêng cho từng đơn hàng một. Xem lại câu SQL thì thấy phần lấy thông tin khu vực/vị trí đang được viết dưới dạng subquery lồng trong mệnh đề WHERE, nên với mỗi dòng đơn hàng, database phải chạy lại subquery đó một lần — trong khi thực tế kết quả gần như giống nhau cho phần lớn các đơn, vì thông tin khu vực/vị trí gần như không đổi trong suốt cả đợt chạy.

> Em có cân nhắc hai hướng: một là cache thông tin đó ở tầng ứng dụng trước khi chạy vòng lặp, nhưng cách này phải lo thêm việc invalidate cache nếu dữ liệu khu vực đổi giữa chừng — dù hiếm nhưng vẫn phải xử lý. Hướng còn lại là viết lại câu truy vấn dùng CTE — tính trước thông tin khu vực/vị trí cần thiết thành một tập kết quả trung gian ngay từ đầu, rồi câu truy vấn chính chỉ cần join thẳng vào đó thay vì gọi lại subquery cho từng dòng.

> Em chọn hướng dùng CTE, vì nó giải quyết đúng vào gốc vấn đề — để database tự tính một lần rồi tái sử dụng — mà không phải quản lý thêm tầng cache ở ứng dụng, cũng không phải đổi logic nghiệp vụ gì cả, chỉ là viết lại cách truy vấn.

> Sau khi áp dụng, thời gian chạy tiến trình giảm hẳn, không còn tăng kiểu tuyến tính bất thường theo số lượng đơn nữa, và job luôn hoàn thành trước giờ cắt đơn dù vào mùa cao điểm số lượng đơn tăng lên nhiều."

---

**Vài lưu ý khi trình bày:**
- Đây là case bạn *thật sự* làm, nên có thể trả lời tự tin, dùng "em" xuyên suốt, không cần rào trước như 2 case kia.
- Nếu bị hỏi sâu "sao không dùng index để giải quyết luôn từ subquery đó" — bạn có thể trả lời theo hướng thực tế: index giúp mỗi lần chạy subquery nhanh hơn, nhưng vẫn phải chạy lại nhiều lần (N lần cho N đơn hàng); còn CTE giải quyết việc *chỉ cần chạy một lần duy nhất* — khác bản chất vấn đề (tối ưu tốc độ 1 lần chạy vs. giảm số lần chạy).
- Nếu bị hỏi "CTE có luôn nhanh hơn subquery không" — nên thật thà: "Không phải lúc nào cũng vậy, còn tùy execution plan của DB engine, nhưng trong trường hợp này vì phần dữ liệu trung gian gần như cố định và được nhiều dòng dùng chung, nên gom vào CTE giúp DB không phải tính toán lặp lại."
- Câu hỏi đào sâu khả năng cao khác: "Sao biết CTE chỉ tính 1 lần mà không phải mỗi lần join lại tính lại?" — nếu bạn không chắc phần execution plan / materialization của DB cụ thể (Postgres, MySQL... khác nhau), nên nói: "Em có kiểm tra qua EXPLAIN plan lúc đó thấy thời gian giảm rõ rệt, còn cơ chế materialize CTE chi tiết theo từng DB engine thì em không nhớ hết được, nhưng thực nghiệm cho thấy hiệu quả rõ."
