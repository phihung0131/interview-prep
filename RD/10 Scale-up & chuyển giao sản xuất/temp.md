Tới **Mục 10: Scale-up & chuyển giao sản xuất**, mình đóng gói thành “giáo trình ôn nhanh” để bạn luyện phỏng vấn Fresher R\&D. Bố cục: bản đồ học → từng khối kiến thức (cần nắm → hỏi hay gặp → đáp mẫu ngắn) → case luyện → cheat-sheet → checklist.

---

# 0) Bản đồ học nhanh (nên nắm hết)

1. **Mục tiêu scale-up & CTQ/CQA/CPP**: sản phẩm tương đương cảm quan–an toàn–ổn định; xác định **Critical Quality Attributes (CQA)** và **Critical Process Parameters (CPP)**.
2. **Tương đồng động học**: khuấy trộn (Re, **P/V**, **tip speed**), nhũ hoá/rotor-stator/static mixer, chọn quy tắc scale.
3. **Truyền nhiệt & gia nhiệt**: HTST/UHT; **plate/tubular/scraped-surface**; **holding tube**, tính **lethality (PU/F)**; fouling.
4. **RTD (Residence Time Distribution)**: plug-flow vs khuấy trộn hoàn toàn; **dead-legs**, thiết kế giữ nhiệt & xác nhận.
5. **Đồng hoá & hệ phân tán**: áp lực/pass, dải kích thước giọt/hạt, ảnh hưởng đến độ đục/body.
6. **Phối trộn bột/nhũ hoá quy mô lớn**: solid induction, eductor, wetting/anti-lump, thứ tự bổ sung.
7. **Lưu biến/độ nhớt & shear**: đo at-scale, thixotropy/yield-stress; in-line viscometer.
8. **Thiết bị, bơm & van**: centrifugal vs positive displacement (PD), shear/pulsation; cảm biến (pH, Brix, DO, flow).
9. **CIP/SSOP & vệ sinh thiết bị**: TACT, biofilm, chuyển đổi công thức.
10. **Tài liệu & gói chuyển giao**: PFD/P\&ID, **BoP (Bill of Process)**, **MBR/BPR**, Control Plan, HACCP update, SOP.
11. **Scale-up về bao bì/chiết rót**: tốc độ line, headspace/DO, torque/niêm kín (liên hệ mục 08).
12. **Xác nhận & thống kê**: 3 lô liên tiếp, **Cp/Cpk**, tiêu chí *first-time-right*, OEE/yield.
13. **Quản trị rủi ro & thay đổi**: risk register/FMEA, **MOC** (change control).

---

# 1) Mục tiêu scale-up & định nghĩa (CTQ/CQA/CPP)

**Cần nắm**

* **CQA** (ví dụ): pH, °Brix, kích thước giọt D\[3,2], độ đục/độ nhớt, PU/F, DO, cảm quan mục tiêu.
* **CPP** (ví dụ): áp đồng hoá, nhiệt-thời gian, tốc độ/khuấy, thứ tự nạp, áp/nhiệt CIP, thời gian hydrat hoá gum.
* **Design space**: khoảng thông số cho phép vẫn đạt CQA.

**Hỏi → Đáp ngắn**

* *Hỏi:* “Bạn xác định CQA/CPP thế nào?”
* *Đáp:* Bắt từ **TPP/spec**, lập sơ đồ quy trình, dùng **risk-ranking (FMEA)** để chọn tham số ảnh hưởng lớn → gán **giới hạn kiểm soát** & kế hoạch xác minh.

---

# 2) Khuấy trộn & tương đồng động học

**Cần nắm**

* **Reynolds (Re)** → chế độ chảy; **P/V (W/L)** → cường độ trộn; **tip speed (π·D·N)** → liên quan shear bề mặt cánh.
* Quy tắc scale thường dùng:

    * **Giữ P/V không đổi** (giữ năng lượng/đơn vị thể tích) → bảo toàn mức phân tán/nhũ hoá.
    * Hoặc **giữ tip-speed** (tránh phá vỡ cấu trúc nhạy shear).
* **Cánh khuấy**: Rushton (turbulent), pitch-blade (đa dụng), anchor (độ nhớt cao).
* **Rotor-stator**: cắt mạnh, dùng để **wetting/nhũ hoá**. **Static mixer**: đồng nhất nhẹ/điền đầy.

**Hỏi → Đáp ngắn**

* *“Chọn gì khi scale nhũ tương?”* → Bắt đầu **giữ P/V**, sau đó tinh chỉnh **áp đồng hoá**; nếu sản phẩm dễ shear-damage → **giữ tip-speed** và tăng thời gian trộn.

---

# 3) Truyền nhiệt & hệ gia nhiệt/giữ nhiệt

**Cần nắm**

* **Plate HX**: hiệu quả cao cho sản phẩm loãng; **tubular** (độ nhớt/có hạt), **scraped-surface** (dày/dễ fouling).
* **Holding tube**: đảm bảo **thời gian lưu min** đạt **PU/F** mục tiêu; cần **đo lưu lượng chính xác**, tránh **đi tắt**.
* **Fouling**: protein/pectin/đường gây cáu; kiểm bằng **profile nhiệt dịu + CIP thích hợp**.
* **Come-up time** ảnh hưởng **lethality** trong retort.

**Hỏi → Đáp ngắn**

* *“Plate hay tubular cho nước ép đục?”* → **Tubular** an toàn hơn với bột/hạt, fouling chậm; plate cho **trong/loãng**.

---

# 4) RTD (Residence Time Distribution)

**Cần nắm**

* Dòng **plug flow** lý tưởng vs **mixed flow**; thật tế có **phân tán**.
* **Tránh dead-leg** (>1.5D), dùng **coi uốn lớn**, van vệ sinh (EHEDG/3-A).
* **Xác nhận RTD**: xung **muối/đường/đánh dấu nhiệt** → tính **thời gian lưu trung bình** & **tỷ lệ short-residence** (ví dụ <1–2%).
* Ảnh hưởng trực tiếp đến **PU/F** của từng phần tử chất lỏng.

**Hỏi → Đáp ngắn**

* *“Vì sao cùng set-point nhưng PU đo thấp?”* → **RTD rộng/đi tắt**, lưu lượng dao động, cảm biến đặt sai chỗ/không tiếp xúc tốt.

---

# 5) Đồng hoá & hệ phân tán

**Cần nắm**

* **Áp lực/pass** → giảm d\[3,2]; quá nhỏ giọt → cần **emulsifier nhiều hơn**, có thể “mỏng body”.
* **Thứ tự**: hydrat hoá gum → nhũ sơ bộ → **đồng hoá** → **chỉnh pH/ion** (tránh kết tủa/gel sớm).
* **Shear-sensitive** (protein/gel): giảm pass, đổi **van đồng hoá**, **áp tầng** (150/50 bar).

**Hỏi → Đáp ngắn**

* *“Tại sao lên pilot d\[3,2] lớn hơn lab?”* → **P/V thấp**, dầu/hương thay tạp, độ nhớt khác → cần tăng **áp/nhũ sơ bộ** hoặc đổi **cấu hình cánh**.

---

# 6) Phối trộn bột quy mô lớn

**Cần nắm**

* **Solid induction/eductor**: hút bột trực tiếp, giảm bụi/vón.
* **Premix với đường** (1:1–1:4), **rắc mưa**, **vortex** ổn.
* **Hydrat hoá gum**: LBG cần \~80–85 °C; CMC sợ **acid + nhiệt**; pectin **premix với đường**, **acid/Ca²⁺ cho sau**.
* **Wetting agent/lecithin** cho cacao/hương bột.

**Hỏi → Đáp ngắn**

* *“Sau scale vẫn vón pectin?”* → Tốc độ nạp quá nhanh, **shear cục bộ yếu**, không premix với đường; cần **eductor** + tăng **N ở giai đoạn đầu**, sau đó giảm để tránh phá mạng.

---

# 7) Lưu biến/độ nhớt & shear

**Cần nắm**

* Chất lỏng **phi-Newton**: cần ghi **spindle–rpm–T**; **yield-stress** cho sốt/đục.
* **Thixotropy**: đo theo chu trình lên/xuống shear; line speed ảnh hưởng cảm giác rót/chiết.
* **In-line viscometer** giúp kiểm soát dao động mẻ.

**Hỏi → Đáp ngắn**

* *“Vì sao độ sệt mẻ lớn ‘mỏng’ hơn?”* → **Shear hiệu dụng** cao hơn, **thời gian hydrat hoá** chưa đủ, **nhiệt** khác.

---

# 8) Bơm, van & đo lường

**Cần nắm**

* **Bơm ly tâm**: êm, shear thấp, cho loãng; **PD** (lobe/gear) cho **độ nhớt/có hạt** (có thể **pulsation**).
* **Flowmeter**: **mag** (chất lỏng dẫn điện), **Coriolis** (khối lượng – chính xác), **PD** (thể tích).
* **Cảm biến**: pH/cond/Brix (NIR)/DO/Temp áp chuẩn thực phẩm; **đặt vị trí đúng** (tạo dòng chảy đều).
* **Control**: PID cơ bản; tránh **overshoot** ảnh hưởng nhiệt/pH.

**Hỏi → Đáp ngắn**

* *“Mag meter đọc nhảy?”* → Bọt/khí, dây mass, đặt gần **bơm/van** gây nhiễu; cần **đoạn thẳng** trước/sau theo khuyến nghị.

---

# 9) CIP/SSOP & vệ sinh khi đổi công thức

**Cần nắm**

* **TACT**: Time-Action-Concentration-Temperature; trình tự: **rửa → kiềm → rửa → acid → rửa → khử trùng**.
* **Biofilm** & fouling: lên lịch **kiềm nóng + chelator + oxidizer**; kiểm **ATP swab**.
* **Đổi công thức (gum/pectin/đạm)**: tăng **alkali step** (nồng độ/T), nâng **turbulence** (Re).

**Hỏi → Đáp ngắn**

* *“Sau thêm pectin, CIP kém sạch?”* → Tăng **kiềm** & **T**, bổ sung **enzym/chelating**, tăng **vận tốc dòng**; xác minh **ATP** & micro.

---

# 10) Tài liệu & gói chuyển giao

**Cần nắm**

* **PFD/P\&ID** (lưu lượng, điểm lấy mẫu, van/ký hiệu vệ sinh), **BoP** (thứ tự/mốc thời gian), **MBR/BPR**, **Control Plan**, **SOP**, **HACCP update**, **artwork** liên quan.
* **Window** thông số: set-point – alarm – action; **form ghi nhận** & *golden batch*.

**Hỏi → Đáp ngắn**

* *“Thiếu gì là dự án TT (tech transfer) dễ fail?”* → **Thứ tự bổ sung/điều kiện hydrat**, **vị trí đo/RTD**, **cửa sổ thông số** & **tiêu chí pass** không rõ.

---

# 11) Xác nhận/Thống kê & tiêu chí *first-time-right*

**Cần nắm**

* **3 lô liên tiếp** đạt spec (cảm quan + lý-hoá + vi sinh); **Cp/Cpk** các CTQ quá trình (fill-weight/torque/độ nhớt).
* **OEE** (Availability × Performance × Quality), **yield** (tổn thất bồn, lọc, chiết).
* **Stability** tăng tốc (Arrhenius/Q10) để “mở bán có điều kiện”.

**Hỏi → Đáp ngắn**

* *“Cp tốt, Cpk thấp?”* → Quá trình **lệch tâm**; cần dịch **trung bình** về giữa spec.

---

# 12) Quản trị rủi ro & thay đổi (MOC)

**Cần nắm**

* **Risk register/FMEA**: S×O×D → RPN; hành động giảm rủi ro; **owner/date**.
* **MOC** khi đổi **NCC/công thức/thiết bị/thông số**; đánh giá **an toàn/nhãn/COGS/QA**; cập nhật **hồ sơ/đào tạo**.

---

## Câu hỏi phỏng vấn “xoáy sâu” & đáp mẫu (ngắn – trúng ý)

1. **Lab ổn, pilot vón pectin khi acid hóa. Làm gì?**
   → Giữ **acid/Ca²⁺ sau đồng hoá**, **premix pectin với đường**, tăng **shear sớm – giảm muộn**, thêm **sequestrant**; kiểm **T hydrat** & **thời gian**.

2. **UHT đạt nhiệt set-point nhưng vi sinh cao. Nguyên nhân?**
   → **RTD ngắn/đi tắt**, **cảm biến đặt sai**, **flow dao động**, **tái nhiễm ở chiller/chiết**; đo **PU/lethality**, làm **tracer RTD**, rà **aseptic zone**.

3. **Giọt nhũ tương to hơn khi scale. Chọn luật scale nào?**
   → Giữ **P/V** hoặc tăng **áp đồng hoá**; nếu shear-sensitive → giữ **tip-speed**, kéo **thời gian trộn** và tối ưu **emulsifier rHLB**.

4. **Độ nhớt dao động theo ca** – kiểm gì trước?
   → **Spindle–rpm–T** đo, **thời gian hydrat**, **trật tự nạp**, **điểm lấy mẫu**; nếu vẫn dao động → **in-line viscometer** + **I-MR chart**.

5. **Fouling nhanh ở plate HX với sữa hạt** – khắc phục?
   → Đổi **profile nhiệt dịu** (indirect/2-stage), **pre-filter/colloid-mill**, **điều pH xa pI**, thêm **phosphate/citrate**, rút ngắn **run-time** + CIP dày hơn.

6. **Holding tube cần dài bao nhiêu?**
   → Từ **thời gian lưu tối thiểu yêu cầu** (PU/F target) và **lưu lượng min**; thêm **hệ số an toàn** sau khi đã xác nhận **RTD** không có *short circuit*.

7. **Bơm nào cho nước ép có pulp?**
   → **PD lobe/diaphragm** để bảo toàn pulp, giảm **cắt**; tránh **ly tâm** tốc độ cao gây phá hạt.

8. **Chứng minh ‘first-time-right’ khi chuyển giao?**
   → 3 lô liên tiếp đạt **CQA** + **HACCP**; báo cáo **capability** (Cp/Cpk), **stability tắt nhanh** vẫn pass; hồ sơ **PPQS** ký.

---

## Case luyện nhanh

**Case A – Trà sữa UHT “cát miệng” & foul exchanger**

* *Chẩn đoán*: protein gần pI, hạt bột thô, shear & nhiệt quá mạnh.
* *Kế hoạch thử*: **pH 6.8→7.0** + **phosphate/citrate**, **colloid-mill/filtration 100–200 µm**, UHT **shorter hold** & **scraped-surface**; đồng hoá 150/50→200/50 bar; tiêu chí **sandiness score ↓**, **PU đạt**, **fouling rate** giảm.

**Case B – Nước cam đục hot-fill, chai PET bị paneling & “nhạt hương”**

* *Chẩn đoán*: **DO/headspace** cao, rào O₂ kém, ánh sáng.
* *Kế hoạch*: **deaeration + N₂ dosing**, tối ưu **fill temp/cooling tunnel**, **foil-induction seal**, PET **barrier** (SiOx/EVOH), **EDTA + antioxidant**; theo dõi **DO**, **NTU**, **hương** 40 °C/2 tuần.

**Case C – Pilot tốt, plant tách lớp sau 2 tuần**

* *Chẩn đoán*: **P/V thấp**, thứ tự nạp khác, **đồng hoá một pass**, shear muộn phá mạng gum.
* *Kế hoạch*: giữ **P/V** tương đương (N↑ hoặc đổi cánh), **hai pass** 150/50→200/50 bar, **gum premix + hydrat đủ**, **acid sau**; đo **d\[3,2]**, **serum viscosity**, test lão hoá tăng tốc.

---

## Cheat-sheet nhớ nhanh

* **Scale nhũ**: ưu tiên **P/V**; nếu shear-sensitive → **tip-speed**.
* **Holding tube**: xác minh **RTD** trước khi tính **PU**; tránh **dead-legs**.
* **Đồng hoá**: giọt quá nhỏ → cần **emulsifier** nhiều, có thể “mỏng”; cân bằng **áp/pass**.
* **Hydrat gum**: premix với **đường**, **T/Time** đủ; **acid/Ca²⁺ sau**.
* **CIP (TACT)**: công thức đổi → **kiềm/T** ↑, thêm **chelating/enzym**; xác minh **ATP**.
* **Tài liệu TT**: **PFD/P\&ID, BoP, MBR, Control Plan, HACCP, SOP** + *golden batch*.
* **First-time-right**: 3 lô đạt **CQA** + **capability**; **OEE & yield** ổn.

---

## Checklist “đạt phỏng vấn”

* Tôi giải thích được **CQA/CPP** và cách chọn **design space**.
* Tôi nắm **Re, P/V, tip-speed** & quy tắc scale khuấy/nhũ hóa.
* Tôi mô tả **HTX/holding/PU–F**, **RTD** và cách xác minh.
* Tôi xử lý **fouling/biofilm/CIP** và đổi công thức (gum/protein).
* Tôi biết **bơm/van/cảm biến** phù hợp và lỗi thường gặp.
* Tôi viết được **gói chuyển giao** (BoP/MBR/Control Plan/HACCP update) & **kế hoạch xác nhận 3 lô**.
* Tôi đưa ra **kế hoạch thử at-scale** với tiêu chí pass cụ thể (cảm quan–lý hoá–vi sinh–bao bì).

---

Nếu bạn muốn, mình có thể đóng gói nội dung thành **cheat-sheet PDF 5–7 trang** (kèm mẫu BoP/MBR, biểu mẫu RTD & PU, bảng quy tắc scale P/V–tip speed, checklist PPQS) để bạn in ôn trước phỏng vấn.
