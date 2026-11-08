# CV Interview Questions

Bộ câu hỏi phỏng vấn theo từng ý trong CV (FPT Software + 2 personal projects). Chỉ có câu hỏi, chưa có đáp án.

Ký hiệu: 🔥 = xác suất bị hỏi cao / dễ bị đào sâu. ⚠️ = câu bẫy kiểm tra độ thật của claim trong CV. `↳ Follow-up` = các câu hỏi nối tiếp có thể bị hỏi sau đó.

## FPT Software, Project 1: Warehouse Management System

| # | Bullet | File | Câu |
|---|---|---|---|
| 1 | Developed APIs and batch jobs (15 kho, receiving/returns/shipping) | [WMS/01](WMS/01-apis-and-batch-jobs.md) | 185 |
| 2 | Resolved concurrency and data-consistency issues | [WMS/02](WMS/02-concurrency-data-consistency.md) | 180 |
| 3 | Improved performance (queries, joins, indexes) | [WMS/03](WMS/03-performance-tuning.md) | 154 |
| 4 | Unit tests from design spec, 90% coverage gate | [WMS/04](WMS/04-unit-tests-coverage-gate.md) | 140 |
| 5 | Investigated and fixed defects (logs to root cause) | [WMS/05](WMS/05-defect-investigation.md) | 141 |

## FPT Software, Project 2: AI-driven Delivery Workflow Platform

| # | Bullet | File | Câu |
|---|---|---|---|
| 1 | Designed and built the AI platform on Claude Code SDK | [AI-Platform/01](AI-Platform/01-ai-delivery-pipeline.md) | 178 |
| 2 | Reduced vendor wait time, saved roughly half of dev time | [AI-Platform/02](AI-Platform/02-impact-and-time-savings.md) | 106 |
| 3 | Confluence knowledge base and Jira view | [AI-Platform/03](AI-Platform/03-knowledge-base-and-jira-view.md) | 130 |

## Personal Project: Kestrel (AI-powered Job Search Assistant)

| # | Bullet | File | Câu |
|---|---|---|---|
| 1 | Multi-user platform with auth, billing, crawler | [Kestrel/01](Kestrel/01-multiuser-platform-crawler.md) | 119 |
| 2 | pgvector search, LLM enrichment, evaluation set | [Kestrel/02](Kestrel/02-vector-search-llm-enrichment-eval.md) | 109 |
| 3 | Multi-provider LLM layer, schema validation, retries | [Kestrel/03](Kestrel/03-multi-provider-llm-layer.md) | 92 |
| 4 | Tailored CV PDFs without fabrication | [Kestrel/04](Kestrel/04-tailored-cv-pdf-no-fabrication.md) | 80 |
| 5 | GitHub Actions CI and Docker Compose | [Kestrel/05](Kestrel/05-ci-docker.md) | 80 |

## Personal Project: Notification Hub

| # | Bullet | File | Câu |
|---|---|---|---|
| 1 | Event-driven microservices with Spring Boot and Kafka | [Notification-Hub/01](Notification-Hub/01-event-driven-microservices-kafka.md) | 152 |
| 2 | gRPC and basic Saga | [Notification-Hub/02](Notification-Hub/02-grpc-and-saga.md) | 128 |
| 3 | Redis rate limiting and caching | [Notification-Hub/03](Notification-Hub/03-redis-rate-limit-cache.md) | 118 |
| 4 | DLQ and idempotency with PostgreSQL upsert | [Notification-Hub/04](Notification-Hub/04-dlq-idempotency.md) | 130 |

## Cross-cutting

| File | Nội dung | Câu |
|---|---|---|
| [Cross-Cutting/01](Cross-Cutting/01-overview-and-cv-walkthrough.md) | Giới thiệu bản thân, đi qua CV, chỗ dễ bị nghi ngờ | 55 |
| [Cross-Cutting/02](Cross-Cutting/02-cross-project-technical.md) | Kỹ thuật nối nhiều dự án, system design theo CV | 59 |
| [Cross-Cutting/03](Cross-Cutting/03-ai-engineering-and-llm-use.md) | Dùng AI, LLM, hướng AI engineering | 44 |
| [Cross-Cutting/04](Cross-Cutting/04-behavioral-star.md) | Hành vi / STAR | 39 |
| [Cross-Cutting/05](Cross-Cutting/05-hr-career-salary.md) | HR, định hướng, lương, câu hỏi nên hỏi lại | 52 |

Tổng: 2.471 câu hỏi.

## Lưu ý khi ôn

- Các câu về Kestrel và Notification Hub được viết chỉ dựa trên chữ trong CV, không đọc code repo. Tự đối chiếu với code thật.
- Các case trong `FPT/issues-*.md` mà bạn chỉ tham gia cùng team hoặc đọc lại code đã được đánh ⚠️. Hãy chuẩn bị nói rõ phần việc riêng của bạn.
- Ghi chú có số liệu mâu thuẫn (ví dụ thời gian chạy batch sau fix) cần thống nhất con số trước khi đi phỏng vấn.
- `FPT/introduce.md` nhắc Sub-lead còn CV không có; `FPT/reason-quit.md` nói hệ thống đang maintain còn CV ghi build API/batch. Cần câu trả lời nhất quán.
