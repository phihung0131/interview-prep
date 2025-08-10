Tới **Mục 06: Chất lượng & QA/QC**, mình đóng gói thành “giáo trình ôn nhanh” để bạn luyện phỏng vấn Fresher R\&D. Bố cục: bản đồ học → từng khối kiến thức (cần nắm → hỏi hay gặp → đáp mẫu ngắn) → case luyện → checklist.

---

# 0) Bản đồ học nhanh (nên nắm hết)

1. **QA vs QC**: hệ thống vs kiểm tra lô; vai trò, tài liệu, luồng phê duyệt.
2. **Spec & hồ sơ**: TCCS/CT, COA, kế hoạch kiểm soát (Control Plan).
3. **Lấy mẫu – SPC**: AQL, OC curve (khái niệm), **X̄–R/I–MR**, **p/c/u** chart.
4. **Đo lường & hiệu chuẩn**: MSA/Gage R\&R, độ lặp lại & tái lập, kiểm chuẩn thiết bị.
5. **Thử nghiệm in-process & thành phẩm**: pH/TA, °Brix, độ nhớt, L*a*b\*, DO, CO₂, vi sinh, cảm quan QC.
6. **Bao bì & đóng gói**: seam/seal, torque nắp, rò rỉ, OTR/WVTR cơ bản.
7. **Hồ sơ & phóng thích lô**: hold–release–deviation–change control.
8. **Xử lý sai lệch**: OOS/OOT, 5 Why/Ishikawa, CAPA, FMEA (risk).
9. **Nhà cung cấp**: COA, audit, IQC, quản lý thay đổi.
10. **Truy xuất & thu hồi**: mock recall, giữ mẫu.
11. **Ổn định/Shelf-life**: kế hoạch, tăng tốc (Arrhenius/Q10), tiêu chí pass/fail.
12. **Audit & đào tạo**: audit nội bộ/ISO/FSSC, năng lực panel QC cảm quan.

---

# 1) QA vs QC

**Cần nắm**

* **QA** (Assurance): xây **hệ thống** (SOP, quy trình, tiêu chuẩn, đào tạo, audit, change control).
* **QC** (Control): **đo/kiểm** nguyên liệu–quá trình–thành phẩm theo **spec**, lập **phiếu kiểm** và **COA**.

**Hỏi hay gặp**

* Khác nhau cốt lõi QA/QC?
  **Đáp ngắn**: QA ngăn lỗi “từ gốc” (hệ thống), QC phát hiện lỗi “trên sản phẩm”.

---

# 2) Spec, COA & Control Plan

**Cần nắm**

* **Spec**: chỉ tiêu lý-hoá (pH, Brix, TA, độ nhớt…), vi sinh, cảm quan, bao bì; **mốc chấp nhận** (USL/LSL).
* **COA**: nhà cung cấp/nhà máy cấp, đối chiếu spec.
* **Control Plan**: “điểm kiểm soát – phương pháp – tần suất – người chịu trách nhiệm – hồ sơ”.

**Hỏi hay gặp**

* Những chỉ tiêu bắt buộc ở nước giải khát?
  **Đáp ngắn**: tối thiểu **pH/°Brix/TA/độ nhớt/màu/vi sinh mục tiêu/bao bì kín**; thêm **DO/CO₂** nếu có gas, **đục/particle** nếu nước ép.

---

# 3) Lấy mẫu & SPC (cơ bản nhưng rất hay hỏi)

**Cần nắm**

* **AQL** (chấp nhận chất lượng): chọn **cỡ mẫu–mức kiểm** theo tiêu chuẩn; hiểu **rủi ro α/β** (nhận sai/nhả sai).
* **SPC**:

    * **X̄–R** (nhiều mẫu con), **I–MR** (đo đơn).
    * **Biến tính**: **p, np, c, u** cho lỗi đếm.
* **Năng lực quá trình**: **Cp, Cpk**.

    * $Cp = \frac{USL-LSL}{6\sigma}$, $Cpk = \min\left(\frac{USL-\mu}{3\sigma}, \frac{\mu-LSL}{3\sigma}\right)$.

**Hỏi hay gặp**

* Khi nào dùng I–MR thay X̄–R? → Khi **không** có nhóm mẫu con (ví dụ đo **từng chai** theo thời gian).
* Cp cao mà Cpk thấp nghĩa là gì? → Quá trình **lệch tâm** so với spec.

---

# 4) Đo lường & hiệu chuẩn (MSA)

**Cần nắm**

* **Gage R\&R**: tổng biến thiên đo = **repeatability** (thiết bị) + **reproducibility** (người).
* Tiêu chí thô: %R\&R **<10%** tốt, **10–30%** chấp nhận tuỳ rủi ro, **>30%** cần cải thiện.
* **Hiệu chuẩn**: pH meter (chuẩn 4.01/7.00/10.01), khúc xạ kế (nước cất 0 °Bx), viscometer (dầu chuẩn), cân (quả cân).

**Hỏi hay gặp**

* pH lệch giữa 2 máy → xử lý? → Kiểm **chuẩn buffer**, nhiệt, vệ sinh điện cực, **cross-check** mẫu chuẩn, làm **R\&R** nếu cần.

---

# 5) In-process & thành phẩm: test “phải thuộc tay”

**Đồ uống/RTD phổ biến**

* **pH** (±0.02), **TA** (chuẩn độ), **°Brix**, **độ nhớt** (Brookfield: **spindle–rpm–T** phải ghi), **màu L*a*b**\*, **độ đục NTU**, **DO** (ppm), **CO₂** (volumes), **kích thước hạt/giọt** (nếu có).
* **Vi sinh**: tổng khuẩn, men mốc, chỉ tiêu đặc thù (vd *Listeria* cho RTE).
* **Cảm quan QC**: panel nội bộ, **mẫu chuẩn** (golden sample) & **control chart** cho điểm cảm quan.

**Hỏi hay gặp**

* Vì sao độ nhớt QC phải kèm **spindle/rpm/T**? → Vì độ nhớt **phụ thuộc shear & nhiệt**, số liệu không kèm điều kiện là **vô nghĩa**.

---

# 6) Bao bì & đóng gói (liên quan chất lượng)

**Cần nắm**

* **Integrity**: **seam** (lon), **seal** (pouch/PE), **torque** nắp, **vacuum/leak** (màu thuốc nhuộm/áp suất), **burst**.
* **Rào cản**: OTR/WVTR (khái niệm), **ánh sáng**.
* **Hiện tượng**: paneling (hot-fill), hút mùi/hương, dính nhãn.

**Hỏi hay gặp**

* Chai PET bị “lõm mặt” sau hot-fill? → Chênh áp khi nguội, **deaeration chưa tốt**, thiết kế panel kém.

---

# 7) Hồ sơ lô & phóng thích

**Cần nắm**

* **Batch record** đầy đủ: nguyên liệu (COA/lot), thông số quá trình, kiểm tra in-process, thành phẩm.
* Quy trình **Hold–Release**: ai duyệt, tiêu chí pass/fail, **quarantine** khi nghi ngờ.
* **Deviation** & **Change Control** (MOC): ghi nhận–đánh giá rủi ro–phê duyệt–thẩm định.

---

# 8) OOS/OOT – CAPA – FMEA

**Cần nắm**

* **OOS**: kết quả ngoài spec; **OOT**: lệch xu hướng nhưng chưa vượt spec.
* Điều tra: **xác minh phương pháp → mẫu → quá trình**, nếu xác nhận thật sự OOS → **cách ly lô**, đánh giá an toàn & quyết định.
* **Root cause**: 5 Why, **Ishikawa** (Man/Method/Machine/Material/Measurement/Environment).
* **CAPA**: hành động khắc phục (fix hiện tại) + phòng ngừa (ngăn lặp lại).
* **FMEA**: Severity × Occurrence × Detection = **RPN** → ưu tiên cải tiến.

**Hỏi hay gặp**

* OOS độ nhớt: bạn làm gì trước? → **Khoá lô**, **re-test** theo SOP (không “test đến khi đạt”), so **mẫu lưu**, kiểm **thiết bị/điều kiện đo**, truy **in-process** (shear/T/time).

---

# 9) Nhà cung cấp & IQC

**Cần nắm**

* **Phê duyệt NCC**: hồ sơ, audit, thử nghiệm pilot, **spec/COA** thống nhất.
* **IQC**: nhận hàng – **lấy mẫu theo AQL** – đối chiếu COA – **release/return**.
* **Quản lý thay đổi** từ NCC (nguồn xưởng, công thức, quy trình).

---

# 10) Truy xuất & thu hồi

**Cần nắm**

* **1 bước lên / 1 bước xuống**; mã lot, ngày, line.
* **Mock recall** định kỳ, mục tiêu **<4h** tổng hợp danh mục lô bị ảnh hưởng.
* **Giữ mẫu**: điều kiện & thời gian theo shelf-life.

---

# 11) Ổn định/Shelf-life & tăng tốc

**Cần nắm**

* **Kế hoạch**: điều kiện (25/30/37/45 °C, ánh sáng), **nhiệt độ đích**, tần suất kiểm.
* **Động học**: bậc 1 (vitamin C/hương), **Arrhenius/Q10** (ước tính nhanh).
* **Tiêu chí pass**: cảm quan, chỉ tiêu lý-hoá, vi sinh, bao bì.

---

# 12) Audit & đào tạo

**Cần nắm**

* **Internal audit** theo kế hoạch rủi ro, **audit NCC**, **chuẩn ISO/FSSC** (ở mức khái niệm).
* **Đào tạo**: SOP, an toàn, cảm quan QC; đánh giá **năng lực định kỳ**.

---

## Câu hỏi phỏng vấn “xoáy sâu” & đáp mẫu (ngắn – trúng ý)

1. **Thiết kế kế hoạch kiểm soát cho nước trà chanh đóng chai (pH≈3.5)**
   → *Điểm kiểm*: nguyên liệu (COA hương/acid), phối trộn (°Brix/pH online), sau đồng hoá (kích thước hạt), trước chiết (DO), sau xử lý nhiệt (PU), thành phẩm (vi sinh, cảm quan, bao bì kín). *Tần suất*: theo **risk** (mở line dày, ổn định thì giãn). *Hồ sơ*: phiếu in-process + COA lô.

2. **X̄–R control chart vượt UCL nhưng kết quả vẫn trong spec → làm gì?**
   → Đây là **mất kiểm soát thống kê** (special cause). **Dừng – điều tra** (máy, nguyên liệu, người), **không** sửa chart để “hợp thức hoá”. Sau khi khắc phục, **re-center** nếu cần.

3. **Cp=1.8; Cpk=0.9** → đọc thế nào?
   → Năng lực tiềm năng tốt nhưng **lệch tâm**; nguy cơ chạm **một phía**. Cần **dịch tâm** (trimming/offset) hoặc **giảm biến thiên**.

4. **Gage R\&R 28% cho đo độ nhớt** – chấp nhận?
   → Giáp ranh; cân nhắc **giảm biến thiên người đo** (SOP, training, spindle/rpm/T cố định), **bảo trì thiết bị**, nếu vẫn >20% ở đặc tính quan trọng → **nâng cấp/đổi phương pháp**.

5. **OOS pH ở thành phẩm** nhưng in-process OK
   → Kiểm **drift điện cực**, **nhiệt độ đo**, **đệm/acid bổ sung muộn**, **stratification** tank cuối; đánh giá **an toàn/vi sinh** nếu pH tăng gần ngưỡng; quyết định theo **risk & dữ liệu xác minh**.

6. **Thiết kế retention sample & mock recall**
   → Giữ mẫu **theo lô** ở **điều kiện bảo quản thực**, thời gian ≥ shelf-life + biên; **mock recall**: chọn 1 nguyên liệu/lô thành phẩm, chạy **truy xuất** & liệt kê **khách hàng** trong **≤4h**.

7. **Khi nào “OOT” vẫn phải CAPA?**
   → Khi **xu hướng lệch** có nguy cơ thành **OOS** (ví dụ pH tăng dần qua các lô), cần **phân tích xu hướng – điều chỉnh quá trình**.

---

## Case luyện nhanh

**Case A – Độ nhớt trà sữa dao động lớn theo ca**

* *Giả thuyết*: hydrat hoá gum chưa đủ, chênh **T**, shear không ổn, người đo đổi **spindle/rpm**.
* *Hành động*: **SOP hoá** thời gian hydrat, khóa **T đo** (25 °C), **spindle–rpm** cố định, **I–MR chart**, làm **R\&R nhanh**.

**Case B – Tỷ lệ phồng/lõm chai cao sau hot-fill**

* *Giả thuyết*: DO cao, headspace sai, làm nguội/thuỷ nhiệt không chuẩn.
* *Hành động*: bổ sung **deaeration**, kiểm **fill/vacuum panel**, **cooling tunnel profile**, đo **DO** trước chiết.

**Case C – Lô nước cam fail men mốc sau 2 tuần**

* *Giả thuyết*: **PU thiếu**, tái nhiễm tại chiết, bao bì OTR cao.
* *Hành động*: xác minh **lethality** (PU), **swab** khu chiết (EMP), kiểm **nhiệt–thời** hot-fill, đổi **nắp/liner**.

---

## Cheat-sheet công thức/nhớ nhanh

* **Cp, Cpk** như trên; **I–MR**: $UCL_{I} = \bar{X} + 3\cdot \frac{\overline{MR}}{d_2}$ (d₂≈1.128 cho MR cỡ 2).
* **Nhớ** ghi cùng **điều kiện đo**: *spindle–rpm–T* (độ nhớt), *T–buffer* (pH), *illumination* (màu).
* **Gage R\&R**: <10% tốt; 10–30% cân nhắc rủi ro; >30% cải tiến ngay.
* **Quy tắc vàng**: *Out of control ≠ Out of spec*, nhưng **mất kiểm soát** phải điều tra **trước khi** phóng thích.

---

## Checklist “đạt phỏng vấn”

* Tôi giải thích rõ **QA vs QC** và mô tả **Control Plan** cho 1 sản phẩm cụ thể.
* Tôi biết thiết lập/đọc **control chart** cơ bản & **Cp/Cpk**.
* Tôi nắm **MSA/Gage R\&R/hiệu chuẩn** cấp thực hành.
* Tôi liệt kê **test in-process/thành phẩm** phù hợp từng mảng (đồ uống/RTD/sữa/nước ép).
* Tôi trình bày **quy trình OOS → CAPA** có trình tự & bằng chứng.
* Tôi hiểu **IQC–supplier COA–mock recall–retention** và cách vận hành.
* Tôi lồng **vi sinh/bao bì** vào quản lý chất lượng (EMP, seam/seal, DO/OTR).

---

Nếu bạn muốn, mình gói nội dung thành **cheat-sheet PDF 5–7 trang** (mẫu biểu X̄–R/I–MR, form OOS/CAPA, template Control Plan & checklist phóng thích lô) để bạn in học trước phỏng vấn.
