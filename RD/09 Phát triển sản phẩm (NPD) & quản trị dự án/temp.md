Tới **Mục 09: Phát triển sản phẩm (NPD) & quản trị dự án**, mình gói thành “giáo trình ôn nhanh” để bạn luyện phỏng vấn Fresher R\&D. Bố cục: bản đồ học → từng khối kiến thức (cần nắm → hỏi hay gặp → đáp mẫu ngắn) → case luyện → cheat-sheet → checklist.

---

# 0) Bản đồ học nhanh (nên nắm hết)

1. **Stage-Gate/NPD lifecycle**: Idea → Feasibility → Lab → Pilot → Plant → Launch → Post-launch.
2. **Brief/TPP** (Target Product Profile) & **Business case** (quy mô, giá, GM%).
3. **Thiết kế & thực nghiệm**: nhật ký lab, **DOE/RSM**, tiêu chí *go/no-go*.
4. **Scale-up**: lab → pilot → plant (RTD, heat exchange, RTD/residence time).
5. **COGS/BOM/Yield/Cost-in-use** & định giá (GM%, CM).
6. **Quy định/claim** trong NPD & phê duyệt nhãn.
7. **Project management**: Gantt/critical path, **RACI**, risk register/FMEA, họp điều độ.
8. **Change control & hồ sơ**: MOC, version hóa spec, báo cáo thử nghiệm, PLM.
9. **Nhà cung cấp/thuê gia công**: NDA, đánh giá NCC, CMO, QA agreement.
10. **Bao bì & line trial**: DFM (design for manufacturability), FAT/SAT.
11. **Launch readiness**: V\&V quy trình, SOP, đào tạo, QA plan, PPQS.
12. **Post-launch**: complaint → CAPA, cost-down, life-cycle.

---

# 1) Stage-Gate & tiêu chí cổng

**Cần nắm**

* Giai đoạn & **deliverables**:

    * **Idea/Front-end**: insight, opportunity size.
    * **Feasibility**: công thức sơ bộ, rủi ro chính, ước tính COGS/GM.
    * **Lab**: công thức v1/v2, **stability/cảm quan** ngắn hạn.
    * **Pilot**: thông số đồng hóa/HTST/UHT, **yields**, bao bì thử, **pre-HACCP**.
    * **Plant**: line trial, **process capability** (Cp/Cpk), hồ sơ HACCP/QA.
    * **Launch**: artwork, spec chốt, training, kế hoạch shelf-life.
    * **Post**: PCM (post-commercialization meeting), cost/quality kaizen.
* **Gate**: *go/hold/kill/redirect*, tiêu chí ví dụ: đạt **JAR/hedonic**, **5-log** giảm (đồ uống), **COGS ≤ target**, rủi ro “đỏ” được giảm.

**Hỏi hay gặp → Đáp mẫu ngắn**

* **Vì sao cần Gate?** → Để “đốt tiền đúng nơi”: dừng sớm dự án không đạt tiêu chí, tập trung nguồn lực dự án khả thi.

---

# 2) Brief & TPP (Target Product Profile) + Business case

**Cần nắm**

* **TPP** tối thiểu: sản phẩm/mục tiêu cảm quan, dinh dưỡng & claim, **giá bán mục tiêu**, pack size, shelf-life, **thị trường đích**, công nghệ dự kiến, KPIs (JAR/hedonic ≥ x, chi phí < y).
* **Business case**: quy mô thị trường, sản lượng năm 1–3, **GM% mục tiêu**, CAPEX/OPEX sơ bộ.

**Hỏi → Đáp**

* **TPP khác spec?** → TPP là **mục tiêu** (đầu dự án), spec là **ràng buộc kiểm soát** (khi chốt launch).

---

# 3) Thiết kế thí nghiệm & ra quyết định

**Cần nắm**

* **DOE/RSM** (2×2×2 hoặc central composite) để tối ưu **ngọt–acid–gum** theo *liking/JAR/độ ổn định*.
* **Bằng chứng**: dữ liệu cảm quan + ổn định + lý-hoá + vi sinh.
* **Kill criteria**: không đạt JAR, chi phí vượt trần, rào cản pháp lý.

**Hỏi → Đáp**

* **Khi nào dùng DOE?** → Khi có ≥2 biến số cần tối ưu đồng thời (ví dụ emulsifier% × áp lực đồng hóa ảnh hưởng độ đục & ổn định).

---

# 4) Scale-up (lab → pilot → plant)

**Cần nắm**

* **Tính tương đồng**: nhiệt & shear (đồng hóa 2-pass 150/50 bar lab có thể thành 200/50 bar pilot).
* **RTD** cho hệ liên tục (HTST/UHT); **come-up time/F₀** cho retort.
* **Cạm bẫy**: fouling/burn-on, vón pectin, phân lớp bồn lớn; **thứ tự bổ sung** giữ nguyên logic lab.

**Hỏi → Đáp**

* **Thất bại pilot thường do đâu?** → Thứ tự nạp, **khí hoà tan**, shear quá mức, kiểm soát pH/ion khác lab.

---

# 5) COGS/BOM/Yield/Cost-in-use & định giá

**Cần nắm**

* **COGS/unit** = nguyên liệu (BOM theo **%w/w × giá**) / **yield** + bao bì + **conversion** (nhân công/utility) + phế.
* **Yield**: tổn thất bồn, lọc, chiết, co rút nhiệt.
* **Cost-in-use**: giá thành **theo liều dùng** (ví dụ flavor 0.12% × 12 USD/kg = 0.0144 USD/L).
* **GM%** = (Price−COGS)/Price; **CM** = Price−COGS.
* Nhạy cảm: 1% yield ↑ có thể tiết kiệm lớn hơn 1% giảm giá nguyên liệu.

**Hỏi → Đáp**

* **Vì sao “cost-in-use” quan trọng?** → Quyết định chọn nguyên liệu **không chỉ** theo giá/kg mà theo **liều dùng hiệu quả**.

---

# 6) Regulatory/Claim trong NPD

**Cần nắm**

* **Early check**: thị trường đích có cho phép **preservative X/INS**? claim “no added sugar” có hợp?
* **Label loop**: công thức ↔ claim ↔ artwork ↔ kiểm pháp lý.

**Hỏi → Đáp**

* **Phát hiện claim không hợp lệ ở Gate 4?** → Kích **change control**, chỉnh claim/công thức, cập nhật artwork; nếu rủi ro cao → **hold/redirect**.

---

# 7) Quản trị dự án: kế hoạch, RACI, rủi ro

**Cần nắm**

* **Gantt/Critical Path**, mốc Gate & line trial.
* **RACI**: R (làm), A (chịu trách nhiệm), C (tham vấn), I (được biết).
* **Risk register/FMEA**: S×O×D = **RPN**; action giảm S/O/D; owner & deadline.
* **Rituals**: weekly stand-up (15’), monthly Gate review (60’).

**Hỏi → Đáp**

* **Trễ pilot do NCC giao trễ?** → *Mitigation*: NCC backup, **safety stock** nguyên liệu quan trọng, milestone có **buffer**.

---

# 8) Change control & hồ sơ (PLM)

**Cần nắm**

* **MOC** khi đổi công thức/NCC/bao bì: đánh giá ảnh hưởng **an toàn/nhãn/COGS/QA**, phê duyệt đa phòng ban.
* **Version hóa** spec/BOM; **trial report** & **CAPA**; hệ **PLM/ERP** (khái niệm).

**Hỏi → Đáp**

* **Tại sao không “chỉnh nhẹ” công thức mà không MOC?** → Rủi ro **mất compliance**, lệch spec/COGS, khó truy xuất.

---

# 9) Nhà cung cấp & gia công (CMO)

**Cần nắm**

* **NDA**, **technical data sheet/COA**, **audit** (HACCP/FSSC), **trial** nguyên liệu.
* **QA agreement** với CMO: trách nhiệm CCP, hồ sơ batch, quyền audit.

**Hỏi → Đáp**

* **Khi nào nên dùng CMO?** → Khi thiếu công suất/công nghệ; lưu ý **bảo mật công thức** & **QA agreement** rõ.

---

# 10) Bao bì & line trial (liên kết NPD)

**Cần nắm**

* **DFM**: chọn vật liệu phù hợp **công nghệ rót** (hot-fill/aseptic/retort).
* **FAT/SAT**: nghiệm thu thiết bị (nếu có), **trial plan**: mục tiêu → thông số → chỉ tiêu pass (rò/OTR/CO₂, paneling).
* **PPK/Cpk** nắp/torque/fill-weight.

**Hỏi → Đáp**

* **Fail rò sau 2 tuần?** → Xem **seal/torque**, **deaeration**, **liner**, **T–P–t** đóng gói.

---

# 11) Launch readiness & V\&V

**Cần nắm**

* **PPQS** (Pre-Production Quality Sign-off): spec chốt, SOP, training, QA plan, HACCP cập nhật, artwork đúng, COA/COC đầy đủ.
* **Process validation**: 3 lô liên tiếp **first-time-right**, Cp/Cpk đạt.

**Hỏi → Đáp**

* **Thước đo sẵn sàng launch?** → PPQS “xanh”, 3 lô ổn định, khách hàng nội bộ duyệt cảm quan, chuỗi cung ứng sẵn.

---

# 12) Post-launch (PCM)

**Cần nắm**

* Họp **30/60/90 ngày**: phàn nàn khách hàng, chất lượng, “đứt hàng”, **GM thực vs target**.
* **Cost-down** & **continuous improvement**: reformulate nhẹ, tối ưu yield, đổi bao bì.

**Hỏi → Đáp**

* **Phàn nàn “nhạt hương” tháng 2–3**? → Kiểm **DO/OTR** & bao bì, **antioxidant/chelator**, nâng **top-note**, **deaeration/flush**.

---

## Case luyện nhanh

**Case A – Trà chanh RTD “low sugar, clean label”**

* **TPP**: 330 ml; ≤5 g/100 ml; JAR ngọt/chua ở mức 3/5; shelf-life 6–9 tháng; “no preservatives”.
* **Kế hoạch**: DOE (sweetener blend × acid profile × xanthan), pilot **hot-fill** vs **aseptic** (ưu hương), bao bì PET barrier nhẹ, **deaeration**.
* **Gate**: JAR đạt, ổn định 40 °C 4 tuần ok; **COGS** ≤ mục tiêu.

**Case B – Cost-down 8% nước cam đục**

* **Đòn bẩy**: **yield** (lọc/đồng hóa), **cloud** tối ưu liều, **hương cost-in-use**, pack size/weight.
* **Rủi ro**: cảm quan & đục không đạt → **consumer CLT** xác nhận.

**Case C – Pilot fail: vón pectin & fouling**

* **Chẩn đoán**: pH/Calcium vào sớm, shear muộn.
* **Khắc phục**: **premix** pectin với đường, hydrat đủ, **acid/Ca²⁺ sau đồng hóa**, profile nhiệt “dịu” hơn, thêm **sequestrant**.

---

## Cheat-sheet (nhẩm thuộc)

* **TPP one-pager**: Sản phẩm – thuộc tính cảm quan – dinh dưỡng/claim – giá mục tiêu – pack – shelf-life – công nghệ – KPIs – rủi ro lớn – timeline.
* **COGS** = (Σ *giá/kg × liều dùng/kg*)/**yield** + pack + conversion + phế; **GM%** = (P−C)/P.
* **Gate**: *go/hold/kill* dựa trên **JAR/hedonic, an toàn, COGS, rủi ro**.
* **RACI**: R\&D (R), QA (A cho spec/QA plan), MKT (A cho TPP/claim), Sourcing (R NCC), MFG (R trial), Legal/Reg (C).
* **Risk**: FMEA (S×O×D) → RPN; có **owner** & **due date**.
* **Trial plan**: mục tiêu → mẻ → thông số (áp đồng hoá/holding/điền đầy) → chỉ tiêu pass (vi sinh/PU, cảm quan, leak) → hồ sơ.

---

## Checklist “đạt phỏng vấn”

* Tôi mô tả rõ **Stage-Gate** & **deliverables** từng giai đoạn.
* Tôi soạn được **TPP** ngắn gọn & **business case** cơ bản (COGS/GM).
* Tôi biết dùng **DOE** để tối ưu ≥2 biến và đặt **kill criteria**.
* Tôi hiểu **scale-up** (shear/nhiệt/RTD) và cách viết **trial plan**.
* Tôi tính được **cost-in-use**, **yield**, **GM%**, và đề xuất **đòn bẩy cost-down**.
* Tôi vận hành **RACI, risk register/FMEA, MOC**, biết hồ sơ cần cho **PPQS/launch**.
* Tôi đưa được **kế hoạch post-launch 30/60/90 ngày** với tiêu chí đánh giá.

---

Muốn mình chuyển phần này thành **cheat-sheet PDF 5–7 trang** (kèm mẫu TPP một trang, template trial plan, bảng Gate checklist, file tính COGS/yield) để bạn in học trước phỏng vấn không?
