# Case 5: Kết quả bước C trong chuỗi xử lý A→B→C→D bị sai, nhưng kết quả cuối cùng vẫn đúng (Bí ẩn chưa điều tra ra nguyên nhân gốc)

**Bối cảnh nghiệp vụ**
Một chuỗi xử lý đơn hàng gồm 4 bước nối tiếp: bước A tiếp nhận và chuẩn hóa đơn hàng, bước B kiểm tra và làm giàu thông tin (bổ sung dữ liệu còn thiếu), bước C tính toán phân bổ (ví dụ chọn vị trí kho/phương án lấy hàng phù hợp), bước D chốt và xuất kết quả cuối cùng để gửi đi thực hiện.

**Phát hiện**
Không phát hiện qua báo cáo lỗi hay khiếu nại từ vận hành, vì kết quả cuối cùng (đầu ra của bước D) luôn đúng — không có triệu chứng gì bất thường ở phía người dùng. Phát hiện tình cờ khi team đang xây dựng một dashboard giám sát nội bộ để theo dõi hiệu năng từng bước trong chuỗi xử lý (mục đích ban đầu là đo thời gian xử lý mỗi bước, không phải để bắt lỗi dữ liệu). Khi log dữ liệu trung gian của từng bước ra để phục vụ dashboard, một kỹ sư review log ngẫu nhiên thấy giá trị trung gian ở bước C không khớp logic mong đợi so với input nó nhận từ bước B — dù output cuối cùng ở bước D vẫn ra đúng.

**Điều tra**
Đối chiếu input/output từng bước qua nhiều lần chạy, xác nhận: bước A và B luôn cho kết quả đúng, bước C có tỷ lệ ra sai nhất định (không phải luôn luôn sai, chỉ với một số điều kiện dữ liệu cụ thể chưa xác định rõ pattern), nhưng bước D — vốn nhận input từ C — vẫn luôn cho ra kết quả cuối đúng. Nghi ngờ ban đầu là bước D có một lớp logic kiểm tra/tính lại độc lập (không hoàn toàn phụ thuộc vào kết quả của C) mà vô tình "sửa" luôn phần sai của C trong đúng những trường hợp đang xảy ra — nhưng chưa xác định được chắc chắn đây là do D có cơ chế tự validate/fallback, hay do một sự trùng hợp về mặt dữ liệu khiến sai số ở C không đủ lớn để ảnh hưởng đến quyết định cuối cùng của D. Vẫn đang tiếp tục thu thập thêm log qua nhiều kịch bản dữ liệu khác nhau để tìm ra pattern chính xác gây sai ở bước C và xác nhận lý do vì sao D không bị ảnh hưởng.

**Phương án & đánh đổi**
- *Bỏ qua vì kết quả cuối vẫn đúng, ưu tiên xử lý các vấn đề có ảnh hưởng thực tế hơn*: tiết kiệm thời gian trước mắt, nhưng rủi ro là nếu sau này D thay đổi logic (ví dụ tối ưu lại, bỏ bớt bước kiểm tra tưởng là dư thừa vì "có vẻ không cần thiết"), sai số từ C sẽ không còn được che lấp nữa và lộ ra thành lỗi thật ảnh hưởng đến nghiệp vụ.
- *Tiếp tục điều tra tận gốc dù chưa gây ảnh hưởng*: tốn thời gian hơn nhưng loại bỏ rủi ro tiềm ẩn, đặc biệt quan trọng vì bước D có thể bị thay đổi bất cứ lúc nào trong tương lai bởi người không biết về sự phụ thuộc ngầm này.

**Quyết định & lý do**
Chọn tiếp tục điều tra thay vì bỏ qua, vì nguyên tắc là không nên để hệ thống "đúng nhờ may mắn" — một lỗi bị che giấu bởi một cơ chế khác không phải là lỗi đã được sửa, mà là một quả bom hẹn giờ tiềm ẩn. Ưu tiên xác định rõ nguyên nhân ở C trước khi có bất kỳ ai động vào D.

**Kết quả**
Đây là case vẫn đang trong quá trình điều tra, chưa xác định được nguyên nhân gốc chính xác. Nhưng việc phát hiện sớm qua dashboard giám sát (dù mục đích ban đầu không phải để bắt lỗi) đã giúp team nhận ra một rủi ro tiềm ẩn trước khi nó thực sự gây ảnh hưởng đến nghiệp vụ — và cho thấy giá trị của việc log/giám sát dữ liệu trung gian ở từng bước xử lý, không chỉ giám sát kết quả đầu ra cuối cùng.

Dưới đây là phiên bản thiết kế lại của **Case 5**, trong đó bạn đóng vai trò là kỹ sư chủ động điều tra bằng công cụ observability, tìm ra nguyên nhân gốc rễ (một con bug logic kinh điển: **Default Value Override / Shadowing Logic**) và xử lý dứt điểm.

---

# Case 5: Kết quả bước C trong Pipeline bị sai nhưng đầu ra bước D vẫn đúng do cơ chế phòng vệ che lấp (Fault Masking & Shadow Logic)

**Bối cảnh nghiệp vụ**

Trong hệ thống xử lý và điều phối đơn hàng (Fulfillment Engine), quy trình xử lý đơn chạy qua một Pipeline 4 bước tuần tự:

* **Bước A (Ingestion):** Nhận và chuẩn hóa dữ liệu đơn hàng.
* **Bước B (Enrichment):** Bổ sung metadata (khoảng cách vận chuyển, thuộc tính hàng hóa, loại xe yêu cầu).
* **Bước C (Routing Strategy):** Tính toán thuật toán chấm điểm và xếp hạng danh sách kho lấy hàng tối ưu nhất (Warehouse Allocation Ranking).
* **Bước D (Final Execution):** Nhận kết quả từ C, kiểm tra lần cuối (Final Validation) và phát lệnh xuất hàng xuống kho thực tế.

**Phát hiện**

Không có báo cáo lỗi từ QA hay khiếu nại từ vận hành vì kết quả đầu ra của Bước D luôn xuất đơn chính xác. Vấn đề được phát hiện tình cờ khi team triển khai công cụ Observability/Tracing nội bộ để đo latency từng bước trong Pipeline. Khi đối chiếu log payload trung gian giữa các step, em phát hiện danh sách kho được chấm điểm cao nhất ở **Bước C trả về kết quả sai logic** so với các tiêu chí tối ưu nhận từ Bước B. Tuy nhiên, Bước D ngay sau đó vẫn luôn chốt được kho chính xác.

**Điều tra & Nguyên nhân gốc rễ (Root Cause Analysis)**

Là backend dev chịu trách nhiệm điều tra, em trích xuất payload của các trường hợp bất thường và phân tích luồng code:

1. **Tại sao Bước C tính sai?**
Ở Bước C, thuật toán chấm điểm có sử dụng một cấu trúc Map/Dictionary để lưu trọng số ưu tiên của các kho. Tuy nhiên, có một điều kiện biên (edge-case) khi đơn hàng có cờ "Hàng cồng kềnh": hàm tính điểm bị dính lỗi logic ghi đè (Key Override) — trọng số của kho gần nhất bị tính thành 0, khiến kho ở xa lại vô tình leo lên vị trí Top 1 của Bước C.
2. **Tại sao Bước D vẫn ra kết quả đúng? (Hiện tượng Fault Masking)**
Khi đọc source code Bước D, em phát hiện người viết trước có cài một đoạn logic phòng vệ (Defensive Validation): Nếu kho được đề xuất ở Bước C không thỏa mãn ràng buộc an toàn về thời gian giao hàng (SLA Check), Bước D sẽ âm thầm kích hoạt cơ chế **Default Rule Fallback** (tự động chọn kho gần nhất có sẵn hàng).
Chính đoạn code fallback trong im lặng (Silent Fallback) này đã vô tình "sửa sai" cho Bước C. Hệ thống chạy đúng hoàn toàn là do **may mắn và sự trùng hợp ngẫu nhiên của dữ liệu**, che giấu đi con bug ở Bước C suốt một thời gian dài.

**Phương án & đánh đổi**

* *Phương án 1: Bỏ qua không sửa Bước C, vì Bước D đã có cơ chế fallback tự lo*:
*Nhược điểm:* Cực kỳ nguy hiểm. Đây là một "quả bom nổ chậm". Nếu sau này có dev khác vào tối ưu hóa Bước D, thấy đoạn fallback đó tưởng là dư thừa và lược bỏ đi, lỗi ở Bước C sẽ lập tức bộc phát làm sập toàn bộ quy trình định tuyến kho trên production.
* *Phương án 2: Tái cấu trúc thuật toán ở Bước C và chuẩn hóa cơ chế cảnh báo ở Bước D*:
*Ưu điểm:* Giải quyết tận gốc bài toán logic ở Bước C. Đồng thời ở Bước D, giữ lại cơ chế fallback để bảo vệ nghiệp vụ nhưng bổ sung cờ cảnh báo (Alert/Metric) khi fallback được kích hoạt thay vì để nó chạy trong im lặng.
*Nhược điểm:* Phải viết lại bộ unit test hồi quy cho cả Bước C lẫn Bước D, tốn thêm thời gian verify luồng dữ liệu trung gian.

**Quyết định & Kết quả**

Em quyết định chọn **Phương án 2: Giải quyết dứt điểm**:

* Sửa lại hàm tính trọng số ở Bước C, khắc phục hoàn toàn lỗi ghi đè trọng số ở điều kiện biên hàng cồng kềnh.
* Tại Bước D, biến cơ chế Silent Fallback thành **Monitored Fallback**: nếu Bước D phải dùng đến fallback, hệ thống lập tức ghi log `WARN` và đẩy metric về Prometheus/Grafana để team phát hiện bất thường ngay lập tức.
* **Kết quả:** Bước C tính toán chính xác 100% trong mọi kịch bản dữ liệu. Hệ thống loại bỏ hoàn toàn rủi ro kỹ thuật ngầm (Technical Debt), không còn tình trạng chạy đúng nhờ "ăn may".

---

### Câu trả lời phỏng vấn đầy đủ (Mạch lạc, thể hiện tính cẩn trọng và chuẩn mực kỹ thuật)

> "Trong quá trình vận hành hệ thống xử lý đơn hàng, có một con bug rất thú vị mà em từng điều tra và giải quyết dứt điểm liên quan đến **hiện tượng lỗi bị che lấp (Fault Masking)** trong kiến trúc Pipeline.
> Hệ thống của em xử lý đơn qua 4 bước nối tiếp ($A \rightarrow B \rightarrow C \rightarrow D$): từ tiếp nhận, làm giàu dữ liệu, bước C là tính toán thuật toán chọn kho tối ưu, và bước D là kiểm tra an toàn rồi phát lệnh xuất kho.
> Sự cố này không hề có alert hay khiếu nại từ vận hành vì kết quả xuất kho ở bước D luôn chính xác 100%. Bọn em phát hiện ra nó hoàn toàn tình cờ khi gắn tracing vào pipeline để đo latency từng bước. Khi soi log payload trung gian, em phát hiện có những đơn hàng mà **kết quả chọn kho ở bước C bị sai lệch hoàn toàn** so với logic nghiệp vụ, nhưng kỳ lạ là bước D ngay sau đó vẫn chốt được đúng kho.
> Em quyết định đào sâu vào source code để tìm hiểu tại sao:
> 1. Đầu tiên ở **Bước C**, em phát hiện một lỗi logic khi gặp đơn hàng cồng kềnh: hàm chấm điểm bị lỗi ghi đè biến (Variable Override), làm kho ở gần bị chấm điểm 0 và đẩy kho ở xa lên vị trí đầu danh sách.
> 2. Tiếp theo ở **Bước D**, người viết trước có để một đoạn code phòng vệ (Defensive Code): nếu kho từ bước C không đạt chuẩn SLA giao hàng, bước D sẽ âm thầm kích hoạt một rule mặc định (Fallback Rule) là tự chọn kho gần nhất. Chính cơ chế fallback trong im lặng (Silent Fallback) này đã vô tình 'sửa sai' cho bước C mà không bắn ra bất kỳ cảnh báo nào.
> 
> 
> Việc hệ thống chạy đúng hoàn toàn là do **sự trùng hợp của dữ liệu**. Nếu cứ để như vậy, sau này có ai refactor bước D và bỏ đoạn code phòng vệ đi thì lỗi ở bước C sẽ lập tức làm sai lệch việc điều phối kho thực tế.
> Vì vậy, em đã xử lý dứt điểm:
> * Fix triệt để lỗi ghi đè trọng số ở Bước C, bổ sung unit test cho tất cả các điều kiện biên.
> * Ở Bước D, em giữ lại cơ chế fallback để bảo vệ tính sẵn sàng của hệ thống, nhưng **bỏ tính năng 'chạy trong im lặng'**: gắn thêm metric và alert để mỗi khi bước D phải kích hoạt fallback, team kỹ thuật sẽ nhận được cảnh báo ngay để vào kiểm tra.
> 
> 
> Case này giúp em rút ra bài học lớn: Một hệ thống có output đúng chưa chắc code bên trong đã đúng. Việc giám sát trạng thái trung gian (State Observability) và nguyên tắc không để lỗi bị che lấp (Fail-Fast / Loud Failure) là cực kỳ quan trọng để bảo vệ tính toàn vẹn của kiến trúc."

---

### Các câu hỏi Interviewer có thể đào sâu tiếp & Hướng trả lời:

#### 1. "Tại sao em không bỏ luôn đoạn Fallback ở Bước D đi mà vẫn giữ lại?"

* **Gợi ý trả lời:**
"Dạ, trong kiến trúc hướng tới độ sẵn sàng cao (High Availability), việc có **Graceful Degradation / Fallback** ở bước cuối là cần thiết để bảo vệ nghiệp vụ người dùng (tốt hơn là làm gián đoạn việc xuất đơn của khách). Tuy nhiên, nguyên tắc là **Fallback không được chạy trong im lặng**. Nó phải hoạt động như một tấm lưới an toàn cuối cùng, nhưng khi tấm lưới đó rung lên thì còi báo động (Alert/Metric) phải kêu để dev biết và khắc phục nguyên nhân ở các tầng trước."

#### 2. "Làm thế nào để phát hiện các lỗi kiểu 'bước trung gian sai nhưng output cuối đúng' này ngay từ môi trường Test/CI mà không cần đợi lên Production?"

* **Gợi ý trả lời:**
"Dạ, thay vì chỉ viết **End-to-End Black-box Test** (chỉ assert output của bước D), em áp dụng:
* **Contract Testing & Isolated Unit Test** cho từng Stage: Viết unit test riêng biệt cho Bước C, assert trực tiếp kết quả chấm điểm kho dựa trên mock input từ Bước B.
* **White-box Pipeline Testing:** Trong các bài test tích hợp, kiểm tra và assert trạng thái của context/payload sau khi đi qua từng bước, đảm bảo không có bước nào trả về dữ liệu bất thường hoặc kích hoạt cờ fallback."



#### 3. "Nếu Pipeline này chạy phân tán qua Message Queue (ví dụ Step C và Step D là 2 microservices riêng biệt giao tiếp qua Kafka), em trace luồng dữ liệu trung gian thế nào?"

* **Gợi ý trả lời:**
"Em sử dụng chuẩn **Distributed Tracing (như OpenTelemetry kết hợp Jaeger/Zipkin)**:
* Khi đơn hàng đi vào bước A, hệ thống sinh ra một `Trace ID` duy nhất và gắn vào metadata header của message.
* Khi message đi qua các service C và D, `Trace ID` được truyền xuyên suốt (Context Propagation). Các service log kèm `Trace ID`, `Span ID` và trạng thái payload.
* Nhờ đó, em có thể search trên giao diện tracing để thấy toàn bộ hành trình của một đơn hàng qua từng service và phát hiện ngay service nào đang chạy vào nhánh fallback."