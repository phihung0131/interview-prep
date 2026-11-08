# AI-driven Delivery Workflow Platform: Tác động và thời gian tiết kiệm

> Reduced the time developers spent blocked waiting for clarification from the external design vendor, and cut simple mistakes and code that did not match business requirements, saving roughly half of development time (team estimate).

Chú thích: 🔥 = xác suất bị hỏi cao / dễ bị đào sâu. ⚠️ = câu bẫy kiểm tra độ thật của claim trong CV.

---

## A. Độ tin cậy của con số "roughly half (team estimate)"

1. 🔥 ⚠️ "Roughly half of development time": half của cái gì? Của một task, một sprint, toàn bộ vòng đời phát triển, hay chỉ một số loại task?
   ↳ Follow-up: Mẫu số là gì: giờ coding, giờ chờ, tổng giờ từ nhận task đến merge?
   ↳ Follow-up: Là giảm 50% thời gian trung bình hay giảm ở những task tốt nhất?
   ↳ Follow-up: Gồm cả review và test, hay chỉ phần code?
2. 🔥 ⚠️ "Team estimate": ai ước lượng, bao nhiêu người, bằng phương pháp gì (hỏi miệng, khảo sát, so story point)?
   ↳ Follow-up: Có ghi lại ở đâu không (bảng khảo sát, tài liệu retro)?
   ↳ Follow-up: Bạn có tham gia ước lượng, và ước lượng của bạn có thiên vị không (vì bạn là người làm ra)?
3. ⚠️ Có baseline trước khi có platform không? Số liệu "trước" lấy từ đâu (Jira cycle time, velocity, timesheet)?
4. ⚠️ Vì sao CV chỉ ghi "team estimate" mà không đo bằng số liệu cứng? Bạn có thể đo bằng gì để thay thế?
5. ⚠️ Nếu mình đề nghị đưa dữ liệu Jira của 3 tháng trước và 3 tháng sau để kiểm chứng, bạn dự đoán kết quả ra sao? Con số có còn "một nửa" không?
6. 🔥 ⚠️ Bạn có chắc con số này không bị thổi phồng (selection bias, novelty effect, ước lượng lạc quan)? Bạn tự phản biện thế nào?
7. Thời gian "tiết kiệm" được dùng vào việc gì: giao thêm task, giảm OT, hay chỉ làm xong sớm hơn? Throughput của team có tăng thật không?
8. Có tính chi phí ẩn không: thời gian review code AI, sửa code AI sinh sai, thời gian bạn dựng và bảo trì platform, chi phí token? Ròng lại còn bao nhiêu?
9. ⚠️ Nếu trừ thời gian bạn bỏ ra xây và bảo trì platform thì tiết kiệm ròng của cả team là bao nhiêu?
10. Tiết kiệm này ổn định theo thời gian hay chỉ đúng ở giai đoạn đầu? Có xu hướng giảm khi task phức tạp hơn không?
11. Có loại task nào platform không giúp, thậm chí làm chậm hơn không? Tỷ lệ task đó là bao nhiêu?
12. Con số đúng với mọi thành viên không (senior vs junior)? Ai hưởng lợi nhiều nhất, ai ít nhất?
13. Có cách nào phân biệt tác động của platform với các yếu tố khác (nghiệp vụ quen hơn, FD tốt hơn, team tăng người, ít task khó)?
14. Bạn có thể đưa ra một ví dụ cụ thể một task "trước và sau" với số giờ thực tế không?
15. Nếu mình hỏi từng thành viên "tiết kiệm bao nhiêu", câu trả lời có khớp "một nửa" không? Có người nào nói khác không?
16. Vì sao dùng "roughly half" thay vì "khoảng 30-40%" hay "khoảng 20%"? Có biên độ sai số không?
17. Bạn có ngại khi con số này bị người phỏng vấn kiểm tra qua tham chiếu (reference) không?

## B. Bối cảnh vấn đề "bị chặn chờ làm rõ từ vendor thiết kế"

18. 🔥 Mô tả quy trình làm việc với external design vendor: ai là vendor, họ giao tài liệu gì (Function Design), qua kênh nào?
19. 🔥 Dev bị blocked chờ làm rõ cụ thể là chờ cái gì? Cho 2-3 ví dụ thật (không vi phạm NDA).
   ↳ Follow-up: Mỗi lần chờ trung bình bao lâu (giờ/ngày)? Có số liệu không?
   ↳ Follow-up: Tần suất blocked trên một task là bao nhiêu?
20. Vì sao Function Design lại có nhiều điểm thiếu/mơ hồ? Vendor sai ở đâu: thiếu edge case, mâu thuẫn, SQL sai, lệch spec khách hàng?
21. Kênh trao đổi với vendor: email, Jira comment, họp, Q&A sheet? Chênh lệch múi giờ hay ngôn ngữ có ảnh hưởng không?
22. Ai là người hỏi vendor: dev, Sub-lead hay BA? Bạn đóng vai trò gì trong việc này?
23. Platform giảm thời gian chờ này bằng cách nào cụ thể: phát hiện lỗ hổng sớm hơn, gom câu hỏi một lần, gợi ý đáp án, hay tự suy luận thay vendor?
   ↳ Follow-up: AI có thể tự trả lời câu hỏi lẽ ra cần vendor trả lời không? Làm sao đảm bảo trả lời đúng ý khách hàng?
   ↳ Follow-up: Nếu AI "đoán" sai ý nghiệp vụ và dev code theo thì sao?
24. Giảm thời gian chờ nghĩa là hỏi vendor ít đi, hay hỏi sớm và đúng hơn? Số lần hỏi vendor có đổi không, bạn có đo không?
25. Vendor có phản ứng gì khi nhận những câu hỏi do AI hỗ trợ soạn không? Chất lượng câu hỏi có tốt hơn không?
26. Sau khi dùng platform, thời gian vendor trả lời có thay đổi không? Có khả năng quan hệ với vendor bị ảnh hưởng không?
27. Blocked chờ vendor có phải là nút thắt lớn nhất không? So với các nguyên nhân chậm khác (review, test, môi trường)?
28. Ai kiểm tra rằng điều "đã làm rõ" nội bộ bằng AI là đúng, trước khi dev triển khai? Có xác nhận cuối từ vendor/BA không?
29. Có trường hợp AI báo "FD không đầy đủ" nhưng thực ra đủ không? Chi phí của false alarm đó?
30. Bạn có phát hiện lỗi nghiêm trọng trong Function Design nhờ platform trước khi vào code không? Kể một trường hợp.

## C. "Simple mistakes" và "code không khớp business requirements"

31. 🔥 "Simple mistakes" cụ thể là gì (null check, naming, sai convention, quên validate, sai kiểu, thiếu log, thiếu transaction)?
   ↳ Follow-up: Chúng được ghi nhận ở đâu (review comment, bug list)?
   ↳ Follow-up: Con số trước và sau về số lỗi như vậy là bao nhiêu?
32. 🔥 "Code that did not match business requirements": ví dụ cụ thể là gì? Ai phát hiện (QA, UAT, khách hàng)?
   ↳ Follow-up: Nguyên nhân gốc: dev hiểu sai FD, FD sai, hay FD mơ hồ?
   ↳ Follow-up: Platform ngăn lỗi này bằng bước nào của pipeline?
33. Làm sao đo "giảm lỗi": số bug trong Jira, số vòng review, số vòng rework, số defect UAT? Bạn có số liệu không?
34. Số vòng rework giữa dev, reviewer và QA thay đổi thế nào?
35. Review thủ công của bạn (Sub-lead) giảm bao nhiêu thời gian nhờ AI review? Bạn nhận ra bằng cách nào?
36. Có loại lỗi mới phát sinh do AI (code trông đúng nhưng sai tinh vi, over-engineering, logic bịa) không? Tỷ lệ thế nào so với lỗi giảm được?
37. AI có gây ra lỗi nghiêm trọng hơn dù ít hơn (nhất là về concurrency, transaction, tồn kho) không?
38. Defect lọt ra production hay UAT có giảm không? Có số liệu không?
39. Bug về nghiệp vụ kho (tồn kho, trạng thái, mapping) có giảm nhờ AI review không? Ví dụ?
40. Lỗi code không khớp requirement thường phát hiện muộn. Platform dịch chuyển phát hiện sang sớm hơn ("shift left") thế nào, và bạn chứng minh ra sao?
41. Tỷ lệ PR bị reviewer người trả lại vì lỗi đơn giản trước và sau là bao nhiêu?
42. Chất lượng PR đầu vào cho human review có thay đổi không (số comment trung bình mỗi PR)?

## D. Phương pháp đo lường và dữ liệu

43. 🔥 Nếu được làm lại, bạn thiết kế phép đo tác động thế nào cho chặt chẽ hơn (baseline, nhóm đối chứng, chỉ số)?
44. Bạn có thu thập dữ liệu sử dụng (số lần chạy, thời gian chạy, tỷ lệ chấp nhận đầu ra) trong platform không?
45. Chỉ số nào là "lead indicator" (sớm) và chỉ số nào là "lag indicator" (muộn) trong đánh giá này?
46. Dùng Jira để đo cycle time có đáng tin không (dev log status không đều, task khác nhau độ khó)?
47. Làm sao chuẩn hóa độ phức tạp task khi so sánh trước/sau (story point có ổn định không)?
48. Có so sánh giữa task dùng và không dùng platform trong cùng thời kỳ không (A/B tự nhiên)?
49. Dev có xu hướng ghi giờ thấp đi, hay ước lượng theo cảm tính "nhờ AI nên nhanh"? Bạn kiểm soát thế nào?
50. Bạn có từng nghi ngờ con số này và kiểm tra lại không? Kết quả?
51. Có thể trình bày con số bằng cách an toàn hơn trong CV không (ví dụ khoảng 30-50% tuỳ loại task)? Vì sao bạn chọn "roughly half"?
52. Nếu số liệu thật chỉ là 20-30%, bạn có thấy dự án vẫn đáng không? Bạn biện minh thế nào?
53. Công ty/ban giám đốc có nhìn nhận con số này không? Nó có được công bố chính thức, ví dụ trong báo cáo, demo, hay chỉ trong team?
54. Mức độ tin cậy: nếu bạn chấm 1-10 độ tin cậy của con số này, bạn chấm mấy, vì sao?

## E. Phân rã tiết kiệm theo từng bước pipeline

55. Tiết kiệm phân bổ thế nào giữa: đọc/hiểu FD, làm rõ với vendor, viết code, viết unit test, tạo PR, review, sửa lỗi?
56. Bước nào tiết kiệm nhiều nhất, bước nào ít nhất? Có bước nào bạn thấy gần như không tiết kiệm?
57. Thời gian viết unit test giảm bao nhiêu? Chất lượng test có giữ được không?
58. Thời gian tạo test scenario giảm bao nhiêu? Dev hay QA hưởng lợi?
59. Thời gian code review (reviewer người) giảm bao nhiêu? Có đo bằng "time to first review" hoặc "time to merge" không?
60. Thời gian đọc và hiểu Function Design dài giảm bao nhiêu nhờ tóm tắt/review của AI? Có rủi ro hiểu sai qua tóm tắt không?
61. Ngược lại, thêm bước nào làm tốn thời gian (chờ pipeline chạy, đọc kết quả AI, sửa prompt, xử lý khi AI sai)?
62. Pipeline chạy bao lâu so với dev tự làm cùng việc? Có tình huống dev chờ platform chạy xong thì bị "block" mới không?

## F. Tác động đến team và con người

63. 🔥 Phản hồi của các thành viên trong team: ai ủng hộ, ai nghi ngờ, ai không dùng? Vì sao?
64. Với junior: AI giúp họ nhanh hơn hay làm họ hiểu nghiệp vụ nông hơn? Bạn quan sát được gì?
65. Với senior: họ coi platform là trợ thủ hay gánh nặng (phải review thêm)?
66. Bạn (Sub-lead) có thay đổi cách phân task, ước lượng task sau khi có platform không? Estimate có được điều chỉnh theo "một nửa" không?
67. Nếu estimate giảm một nửa, khách hàng/PM có kỳ vọng team giao nhanh gấp đôi không? Áp lực đó xử lý thế nào?
68. Có tình huống team tin quá vào AI và bỏ qua bước kiểm tra? Bạn xử lý ra sao?
69. Nhân sự có lo bị thay thế không? Bạn trả lời lo ngại đó thế nào?
70. Tác động lên tinh thần và văn hoá review: reviewer có đỡ nản hơn không hay bắt đầu lười?
71. Hiệu ứng lên khách hàng: delivery nhanh hơn, ít lỗi hơn, khách hàng có phản hồi gì? Có bằng chứng không (feedback, UAT pass rate)?
72. Tác động với quan hệ vendor: vendor có biết team bạn dùng AI để rà FD? Có căng thẳng nào không?

## G. Tác động kinh doanh và chi phí - lợi ích

73. 🔥 Tính ROI thế nào: giờ công tiết kiệm × đơn giá trừ chi phí token, hạ tầng, giờ xây và bảo trì? Bạn đã tính chưa?
74. Chi phí token mỗi tháng so với giá trị tiết kiệm?
75. Với dự án theo hợp đồng giá cố định hoặc man-month, tiết kiệm 50% thời gian có nghĩa gì cho công ty (lợi nhuận, giá bán, giảm headcount)?
76. Nếu khách hàng tính tiền theo man-month, việc giảm nửa thời gian có ảnh hưởng doanh thu không? Công ty nghĩ sao?
77. Tiết kiệm này mở rộng sang dự án khác được không? Dự án khác có Function Design từ vendor không?
78. Có rủi ro gì nếu con số "một nửa" bị quản lý cấp cao dùng để cắt giảm nguồn lực hoặc ép deadline?
79. Với tư cách người đề xuất, bạn có được ghi nhận (khen thưởng, thăng tiến) gì không? Điều đó có liên quan lý do bạn muốn đổi việc không?

## H. Độ chính xác và tính khái quát của claim

80. ⚠️ "Reduced the time developers spent blocked": mức giảm này đo ở những dev nào, bao lâu? Chỉ một module hay toàn dự án?
81. ⚠️ Cả hai vế trong bullet ("giảm thời gian chờ" và "giảm lỗi") đều dẫn tới "một nửa". Có phải bạn cộng gộp hai lợi ích thành một con số không? Tách ra mỗi phần là bao nhiêu?
82. ⚠️ Nếu mình tìm hiểu thêm và thấy dự án vẫn bị chờ vendor nhiều, bạn giải thích thế nào?
83. ⚠️ Bạn có sửa Function Design hay quy trình với vendor không, hay hoàn toàn chỉ dựa vào AI? Phần tiết kiệm có đến từ thay đổi quy trình chứ không phải platform không?
84. ⚠️ Có phải tiết kiệm đến chủ yếu từ việc sinh code boilerplate (vốn ít giá trị), còn phần khó vẫn do người làm?
85. ⚠️ Task trong dự án phần lớn là CRUD/boilerplate theo FD hay logic khó (race, transaction, hiệu năng)? Tỷ lệ này ảnh hưởng thế nào tới con số của bạn?
86. ⚠️ Có nguy cơ con số này chỉ đúng với những task "dễ AI hóa", và bị quy rộng cho toàn bộ không?
87. ⚠️ Nếu mình tính theo tổng thời gian dự án (bao gồm UAT, release, chờ khách hàng), tiết kiệm sẽ còn bao nhiêu phần trăm?
88. ⚠️ Con số này có thể bị quy cho chính bạn là tác giả hay không? Bạn có bằng chứng độc lập (người khác xác nhận, số liệu quản lý dự án)?

## I. Câu hỏi tình huống

89. Tình huống: PM hỏi "bạn nói tiết kiệm 50%, vậy giảm estimate của sprint tới một nửa nhé". Bạn trả lời thế nào?
90. Tình huống: khách hàng thấy dự án dùng AI và đòi giảm giá theo mức tiết kiệm. Bạn tham gia thảo luận thế nào?
91. Tình huống: dữ liệu Jira cho thấy cycle time giảm chỉ 15%. Bạn giải thích khác biệt với "team estimate" ra sao?
92. Tình huống: một dev nói họ mất nhiều thời gian hơn vì phải sửa code AI sinh sai. Bạn điều tra thế nào?
93. Tình huống: bug nghiệp vụ lớn lọt lên UAT dù đã qua AI review. Bạn trình bày với khách hàng và cải tiến thế nào?
94. Tình huống: vendor chậm trả lời 5 ngày vào đúng lúc deadline. Platform giúp gì, và ngoài platform bạn làm gì?
95. Tình huống: bạn phải thuyết phục một team khác (không dùng AI) áp dụng platform dựa trên con số của bạn. Bạn dùng bằng chứng gì để họ tin?
96. Tình huống: sau 6 tháng, tiết kiệm không còn rõ rệt. Bạn tìm nguyên nhân thế nào?
97. Tình huống: sếp yêu cầu bạn chuẩn bị một slide "kết quả" cho ban giám đốc ngày mai. Bạn đưa số nào, trình bày giới hạn của số liệu thế nào?

## J. Hành vi và phản tư

98. 🔥 Bạn tự hào nhất về điều gì trong tác động của platform? Có câu chuyện cụ thể nào về một dev hoặc một task đã được cải thiện rõ rệt?
99. Điều gì làm bạn bất ngờ khi triển khai (cách người dùng thực sự dùng, nơi AI giúp không như dự đoán)?
100. Bạn học được gì về việc đo lường tác động của một công cụ nội bộ? Lần sau bạn làm khác ở đâu?
101. Có điều gì trong con số này khiến bạn không thoải mái khi đưa lên CV không?
102. Nếu phải sửa lại bullet này cho chính xác hơn, bạn viết lại thế nào?
103. Bạn có góp ý gì để công ty đo lường hiệu quả các công cụ AI nội bộ nghiêm túc hơn?
104. Thành công của platform có phụ thuộc vào bạn không, hay sẽ tiếp tục nếu bạn rời đi? Điều đó nói gì về tác động bền vững?
105. Bạn sẽ mang kinh nghiệm này vào công việc mới như thế nào (đề xuất tự động hóa, đo lường, văn hoá dùng AI)?
106. Đây có phải chiến thắng của riêng bạn không, hay thành quả tập thể? Bạn phân bổ công lao thế nào?
