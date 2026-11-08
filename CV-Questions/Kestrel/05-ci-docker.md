> Set up GitHub Actions CI (lint, type check, backend and frontend tests) and Docker Compose.

Chú thích: 🔥 = xác suất bị hỏi cao / dễ bị đào sâu. ⚠️ = câu bẫy kiểm tra độ thật / độ chính xác của claim trong CV.

## A. Tổng quan và động lực

1. 🔥 Vì sao một dự án cá nhân lại cần CI và Docker Compose? Lợi ích thực tế bạn đã nhận được là gì?
   ↳ Follow-up: Có lần nào CI chặn được một bug thật trước khi merge không? Kể cụ thể.
   ↳ Follow-up: Có gì bạn làm vì "trông chuyên nghiệp" mà thực ra chưa cần?
2. ⚠️ Bạn tự viết toàn bộ workflow YAML và Compose file hay copy template / nhờ AI? Bạn giải thích được từng dòng không?
3. Trước khi có CI, quy trình kiểm tra của bạn là gì? Sau khi có CI thay đổi thế nào?
4. CI hiện chạy ở những sự kiện nào (push, pull_request, schedule)? Vì sao chọn vậy?
5. Dự án một người dùng branch/PR thế nào? Có branch protection yêu cầu CI xanh mới merge không?
6. Bạn làm CI/CD hay chỉ CI? Có tự động deploy không?
7. Kinh nghiệm này liên hệ gì tới công việc hiện tại của bạn ở công ty?

## B. GitHub Actions: cấu trúc workflow

8. 🔥 Mô tả workflow: có bao nhiêu job, job nào chạy song song, job nào phụ thuộc nhau (`needs`)?
   ↳ Follow-up: Tổng thời gian một lần CI chạy? Bước nào chậm nhất?
   ↳ Follow-up: Bạn đã tối ưu thời gian CI thế nào?
9. Runner nào (ubuntu-latest, pin phiên bản)? Vì sao pin hoặc không pin?
10. Cache dependencies bạn làm thế nào (actions/cache, setup-* cache option)? Key cache lấy từ gì?
11. Matrix build (nhiều phiên bản Node/Python) có dùng không? Vì sao?
12. `concurrency` để hủy run cũ khi push mới: có dùng không?
13. Pin version của action (theo tag hay SHA)? Rủi ro supply chain khi dùng action bên thứ ba?
14. Quyền của `GITHUB_TOKEN` (permissions) bạn đặt thế nào? Nguyên tắc least privilege?
15. Secrets trong CI: bạn lưu gì trong GitHub Secrets? Test có cần API key LLM thật không? Xử lý thế nào để không lộ key vào log hoặc cho PR từ fork?
16. Workflow có path filter (chỉ chạy job frontend khi frontend đổi) không? Trade-off?
17. Artifact (báo cáo coverage, log test) có upload không?
18. Bạn debug workflow fail thế nào (log, chạy local bằng `act`, SSH debug)?
19. Reusable workflow / composite action: có tách không? Có trùng lặp YAML không?
20. Chi phí phút CI (free tier) có là mối quan tâm không?

## C. Lint và type check

21. 🔥 Lint dùng công cụ nào cho backend và frontend (ESLint, Ruff, flake8, Prettier, golangci-lint, ...)? Quy tắc nào bạn bật và vì sao?
   ↳ Follow-up: Lint bắt được loại lỗi nào mà test không bắt?
   ↳ Follow-up: Bạn có tắt rule nào không, tắt bằng cách nào và có để lại giải thích?
22. 🔥 Type check dùng gì (mypy, pyright, tsc, ...)? Mức strict bao nhiêu? Có type ignore nào còn tồn tại không?
   ↳ Follow-up: Type checking giúp gì cho code gọi LLM / dữ liệu động?
   ↳ Follow-up: Sự khác nhau giữa runtime validation (schema) và static type checking?
23. Format code (Prettier, Black) có kiểm tra trong CI (`--check`) hay tự sửa? Vì sao?
24. Pre-commit hook local có không? Quan hệ với CI?
25. Lint/type check chạy ở local giống CI thế nào để không "xanh local, đỏ CI"?
26. Có kiểm tra bảo mật tĩnh / dependency audit trong CI không?
27. Cho ví dụ một lỗi type check bắt được trong dự án này.

## D. Test: backend và frontend

28. 🔥 Backend test dùng framework gì? Có unit, integration, hay e2e? Tỉ lệ giữa chúng?
   ↳ Follow-up: Test cần Postgres + pgvector thật không? Chạy trong CI bằng service container hay mock?
   ↳ Follow-up: Test isolation giữa các test (rollback transaction, DB tạm) làm thế nào?
29. 🔥 Test gọi LLM provider và các trang tuyển dụng (crawler) thế nào mà không tốn tiền, không flaky, không phụ thuộc mạng?
   ↳ Follow-up: Fixture HTML đã lưu, mock server, VCR/cassette?
   ↳ Follow-up: Có test nào gọi thật và chạy riêng không?
30. Test cho billing/webhook: bạn mô phỏng sự kiện từ cổng thanh toán thế nào?
31. Test cho auth và phân quyền (không truy cập chéo dữ liệu user) có không?
32. Test cho vector search: dùng dữ liệu cố định để kiểm tra thứ tự? Có test index không?
33. Evaluation set (matching) có chạy trong CI không hay chạy tay? Vì sao?
34. Frontend test dùng gì (Jest/Vitest, Testing Library, Playwright/Cypress)? Test cái gì?
35. Code coverage: bao nhiêu phần trăm? Bạn có đặt ngưỡng tối thiểu không? Coverage cao có nghĩa là test tốt không?
36. ⚠️ Số lượng test hiện có là bao nhiêu? Pass rate? Có test bị skip/xfail không?
37. Flaky test: bạn đã gặp chưa và xử lý thế nào?
38. Test chạy song song được không? Có chia shard không?
39. Có contract test giữa frontend và backend (OpenAPI, type chia sẻ) không?
40. Chiến lược test cho tác vụ bất đồng bộ / background job / retry.
41. Test cho schema validation và retry của LLM layer: tạo output hỏng thế nào?
42. Test có seed dữ liệu hoặc migration trước khi chạy? CI chạy migration thật không?
43. Tests chạy với biến môi trường nào và cấu hình ở đâu?

## E. Docker và Docker Compose

44. 🔥 Compose file gồm những service nào (backend, frontend, Postgres/pgvector, worker/crawler, queue, ...)? Mối quan hệ giữa chúng?
   ↳ Follow-up: Service nào phụ thuộc service nào (`depends_on` + healthcheck)?
   ↳ Follow-up: `depends_on` có đảm bảo DB sẵn sàng không? Bạn xử lý thế nào?
45. 🔥 Dockerfile của backend: base image gì, multi-stage build không, kích thước image, chạy bằng user non-root không?
   ↳ Follow-up: Tối ưu layer cache thế nào (copy file dependency trước)?
   ↳ Follow-up: `.dockerignore` có gì?
46. Image Postgres: dùng image pgvector chính thức hay tự build? Khởi tạo extension (`CREATE EXTENSION vector`) ở đâu?
47. Dữ liệu DB lưu bằng volume thế nào? `docker compose down -v` làm gì? Backup?
48. Quản lý biến môi trường và secrets trong Compose (`.env`, `env_file`, Docker secrets)? Có tránh commit `.env` không?
49. Mạng (networks), cổng (ports) public so với internal: DB có bị expose ra ngoài không?
50. Healthcheck, restart policy, resource limit (memory/CPU) bạn cấu hình thế nào?
51. Compose dùng cho dev, cho production, hay cả hai? Có override file (`docker-compose.override.yml`, profiles) không?
52. Hot reload cho dev trong container (bind mount) vs build image: bạn làm sao?
53. Chạy crawler với headless browser/ Chromium trong Docker: image to, cần shm, sandbox, font - bạn xử lý gì?
54. Migration database trong Compose: chạy tự động khi start hay thủ công? Rủi ro?
55. Logging container: xem log, thu thập tập trung?
56. Thời gian từ `git clone` đến hệ thống chạy được trên máy mới: các bước? Có tài liệu README không?
57. Build image trong CI: có không? Có push lên registry (GHCR, Docker Hub) không? Tag thế nào?
58. Quét lỗ hổng image (Trivy, Docker Scout) có không?
59. Vì sao dùng Compose thay vì Kubernetes? Khi nào bạn chuyển?
60. Compose trên máy dev khác môi trường production ở những điểm nào?
61. Lỗi Compose thường gặp bạn đã gặp: cổng bị chiếm, volume permission, DNS giữa container, thứ tự khởi động - cho ví dụ.
62. Deploy bằng Compose lên VPS: zero-downtime có không? Rollback thế nào?

## F. Bảo mật, chi phí và vận hành

63. Secrets lọt vào Docker image hoặc layer history thế nào và bạn tránh ra sao?
64. Pipeline có tránh chạy workflow với secrets cho PR từ fork không (`pull_request_target`)?
65. Repo public: có secret scanning, Dependabot, branch protection không?
66. Phụ thuộc vào pin version dependency (lock file) để build tái lập (reproducible) như thế nào?
67. Chi phí tổng của CI + hạ tầng cho dự án? Có lần nào CI bị tốn phút do loop không?
68. Environment (dev/staging/prod) có tách không? Cấu hình theo môi trường thế nào?
69. Monitoring sau deploy: bạn biết deploy hỏng bằng cách nào?

## G. Đánh đổi, tình huống và kiểm tra độ thật

70. 🔥 Nếu CI đỏ nhưng bạn tin code đúng (flaky), bạn làm gì? Bạn có bao giờ bỏ qua CI đỏ không?
71. ⚠️ Mở file `.github/workflows/*.yml` ra: bạn giải thích từng step được không? Bước nào chưa cần thiết?
72. ⚠️ Chạy `docker compose up` trên máy sạch, dự án có lên được ngay không? Điều gì cần chuẩn bị (API key, `.env`, dữ liệu seed)?
73. Tình huống: CI từ 3 phút lên 15 phút sau một thay đổi. Bạn tìm nguyên nhân thế nào?
74. Tình huống: test pass ở local nhưng fail ở CI. Các nguyên nhân bạn nghĩ tới theo thứ tự?
75. Tình huống: test cần DB pgvector nhưng CI chạy chậm vì khởi động DB. Bạn tối ưu thế nào?
76. Tình huống: team thêm 5 người cùng đẩy code - CI/CD của bạn cần thay đổi gì (code owners, required reviews, merge queue)?
77. Nếu thêm CD tự động deploy, bạn thiết kế pipeline và chiến lược rollback ra sao?
78. Bạn sẽ thêm gì nếu có thêm thời gian: e2e test, load test, preview environment, SAST?
79. CI này đã thay đổi cách bạn làm việc ở công ty chính của bạn không? Bạn có áp dụng lại ở đó không?
80. Kiểm thử đã đủ để tự tin deploy hệ thống có thanh toán thật chưa? Còn thiếu gì?
