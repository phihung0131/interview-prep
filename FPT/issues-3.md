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

