# Xem thêm roadmap.sh (có nhiều khái niệm chưa gặp)
# Kiến Thức Backend Developer cho Phỏng Vấn

## **1. Core Programming & Computer Science**

### Programming Language Fundamentals
- **Ngôn ngữ chính** (Java, Python, C#, Node.js, Go, etc.)
- OOP principles: Encapsulation, Inheritance, Polymorphism, Abstraction
- **Data Structures**: Array, LinkedList, Stack, Queue, HashMap, Tree, Graph
- **Algorithms**: Sorting, Searching, Big O notation
- **Memory Management**: Garbage Collection, Memory leaks

### Coding Skills
- Problem solving với algorithms
- Code optimization và performance
- Clean Code principles
- Code review skills
- Unit testing và TDD

## **2. Database & Data Management**

### Relational Databases
- **SQL mastery**: SELECT, JOIN, Subqueries, Indexes, Views
- Database design: Normalization, ER diagrams
- **PostgreSQL/MySQL** specifics
- Transactions, ACID properties
- Query optimization và performance tuning

### NoSQL Databases
- **MongoDB, Redis, Cassandra** cơ bản
- CAP theorem
- Khi nào dùng SQL vs NoSQL
- Data modeling cho NoSQL

### ORM & Database Tools
- **Hibernate, Entity Framework, Sequelize**
- Connection pooling
- Database migration tools
- Caching strategies

## **3. Web Development & APIs**

### HTTP & Web Fundamentals
- **HTTP methods, status codes, headers**
- Request/Response lifecycle
- Cookies, Sessions, Authentication
- CORS, CSRF protection

### RESTful API Design
- **REST principles** và best practices
- API versioning strategies
- Error handling và status codes
- API documentation (Swagger/OpenAPI)
- Rate limiting

### Authentication & Authorization
- **JWT, OAuth 2.0, Session-based auth**
- Role-based access control (RBAC)
- Password hashing (bcrypt, scrypt)
- Security best practices

## **4. System Design & Architecture**

### Microservices Architecture
- **Monolith vs Microservices**
- Service decomposition strategies
- Communication patterns (synchronous vs asynchronous)
- Data consistency trong distributed systems

### Scalability & Performance
- **Horizontal vs Vertical scaling**
- Load balancing strategies
- Caching (Redis, Memcached, CDN)
- Database sharding và replication

### Message Queues & Event-Driven
- **Apache Kafka, RabbitMQ, AWS SQS**
- Publisher-Subscriber pattern
- Event sourcing cơ bản
- Asynchronous processing

## **5. DevOps & Infrastructure**

### Containerization
- **Docker fundamentals**
- Container orchestration (Kubernetes cơ bản)
- Docker Compose cho development

### CI/CD
- **Git workflows** (GitFlow, feature branches)
- Build pipelines
- Automated testing trong CI/CD
- Deployment strategies (Blue-Green, Rolling)

### Cloud Platforms (AWS/Azure/GCP)
- **Core services**: EC2, S3, RDS, Lambda
- Serverless architecture cơ bản
- Cloud storage và databases
- Basic networking concepts

## **6. Monitoring & Troubleshooting**

### Logging & Monitoring
- **Structured logging** best practices
- Application monitoring (APM tools)
- Error tracking và alerting
- Performance metrics

### Debugging & Profiling
- Debugging techniques
- Performance profiling
- Memory leak detection
- Database query analysis

## **7. Security**

### Application Security
- **Common vulnerabilities**: SQL Injection, XSS, CSRF
- Input validation và sanitization
- Secure coding practices
- API security best practices

### Infrastructure Security
- SSL/TLS certificates
- Network security basics
- Environment variables management
- Secrets management

## **8. Framework-Specific Knowledge**

### Backend Frameworks
- **Spring Boot** (Java): Dependency Injection, Security, Data JPA
- **Django/Flask** (Python): ORM, Middleware, Authentication
- **Express.js** (Node.js): Middleware, Routing, Error handling
- **.NET Core** (C#): MVC, Entity Framework, Dependency Injection

### Framework Patterns
- MVC/MVP/MVVM architecture
- Dependency Injection
- Middleware patterns
- Repository pattern

## **9. Testing**

### Testing Strategies
- **Unit testing, Integration testing, E2E testing**
- Test-driven development (TDD)
- Mocking và stubbing
- Test coverage và quality metrics

### Testing Tools
- JUnit, TestNG (Java)
- pytest (Python)
- Jest, Mocha (JavaScript)
- Testing frameworks cho từng tech stack

## **10. Domain-Specific Topics**

### E-commerce/Fintech
- Payment processing
- Transaction handling
- Order management systems
- Financial calculations

### Real-time Applications
- WebSocket implementation
- Real-time notifications
- Chat systems
- Live data streaming

## **Mức Độ Ưu Tiên cho Fresher/Junior**

### **🔥 Rất Quan Trọng (Phải biết)**
1. Programming language fundamentals
2. SQL và database basics
3. HTTP và REST API
4. Authentication cơ bản
5. Git version control
6. Framework chính của tech stack

### **⭐ Quan Trọng (Nên biết)**
1. System design cơ bản
2. Caching strategies
3. Testing practices
4. Docker basics
5. Security fundamentals
6. Performance optimization

### **💡 Tốt Nếu Biết (Bonus)**
1. Microservices concepts
2. Message queues
3. Cloud platforms
4. Advanced security topics
5. DevOps practices
6. Monitoring tools

## **Cách Chuẩn Bị Hiệu Quả**

### Lý Thuyết + Thực Hành
1. **Xây dựng project thực tế** với các tính năng:
   - User authentication/authorization
   - CRUD operations với database
   - RESTful API
   - Error handling
   - Logging
   - Unit tests

2. **Tech Stack Complete**:
   - Backend framework + Database + Caching + Testing
   - Deploy lên cloud platform (Heroku, AWS free tier)

3. **Code Portfolio**:
   - GitHub repositories với clean code
   - Documentation tốt
   - CI/CD pipeline cơ bản

### Các Dạng Câu Hỏi Thường Gặp

#### Theoretical Questions
- "Giải thích X là gì và khi nào sử dụng?"
- "So sánh A vs B, ưu nhược điểm?"
- "Làm thế nào để handle vấn đề Y?"

#### Practical Questions
- "Design một API cho feature Z"
- "Optimize query này như thế nào?"
- "Debug issue này bạn sẽ làm gì?"

#### System Design (Junior Level)
- "Design một URL shortener đơn giản"
- "Làm thế nào để scale application cho 1000 users?"
- "Database schema cho e-commerce basic"

## **Resources Học Tập**

### Books
- "Clean Code" - Robert Martin
- "Designing Data-Intensive Applications" - Martin Kleppmann
- "System Design Interview" - Alex Xu

### Practice Platforms
- LeetCode (Algorithms)
- HackerRank (SQL + Programming)
- System Design Primer (GitHub)
- Real projects trên GitHub

### Mock Interviews
- Pramp, InterviewBit
- Practice với senior developers
- Record và review lại answers

---

**Lời khuyên cuối:** Tập trung vào depth hơn breadth. Thành thạo 70% những kiến thức cơ bản sẽ tốt hơn biết sơ sài 100% topics.