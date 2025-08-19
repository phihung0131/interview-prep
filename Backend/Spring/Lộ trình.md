# Tài liệu: Spring Start Here
# Câu Hỏi Phỏng Vấn Spring & Spring Boot cho Fresher/Junior

## **1. SPRING FRAMEWORK CƠ BẢN**

### Core Concepts
1. **Spring Framework là gì? Tại sao lại sử dụng Spring?**
   - Định nghĩa và lợi ích của Spring
   - So sánh Spring với pure Java development
   - Các module chính của Spring ecosystem

2. **Dependency Injection (DI) là gì? Tại sao quan trọng?**
   - Giải thích DI pattern
   - Constructor vs Setter vs Field injection
   - Ưu nhược điểm của từng loại injection

3. **Inversion of Control (IoC) Container hoạt động như thế nào?**
   - ApplicationContext vs BeanFactory
   - Bean lifecycle trong Spring container
   - Bean scope: singleton, prototype, request, session

4. **@Component, @Service, @Repository, @Controller khác nhau như thế nào?**
   - Mục đích và sử dụng của từng annotation
   - Stereotype annotations và component scanning
   - Custom annotations

### Configuration
5. **XML configuration vs Java configuration vs Annotation-based configuration?**
   - Ưu nhược điểm của từng approach
   - @Configuration và @Bean
   - Component scanning với @ComponentScan

6. **@Autowired hoạt động như thế nào?**
   - Autowiring modes
   - @Qualifier và @Primary
   - Xử lý multiple beans cùng type

7. **Spring Profiles là gì và khi nào sử dụng?**
   - @Profile annotation
   - application-{profile}.properties
   - Active profiles configuration

## **2. SPRING BOOT FUNDAMENTALS**

### Getting Started
8. **Spring Boot khác gì với Spring Framework?**
   - Auto-configuration concept
   - Starter dependencies
   - Embedded server advantages

9. **@SpringBootApplication annotation bao gồm những gì?**
   - @EnableAutoConfiguration
   - @ComponentScan
   - @Configuration
   - Custom exclude configurations

10. **application.properties vs application.yml?**
    - Cú pháp và format khác nhau
    - Hierarchical configuration
    - Profile-specific properties

### Auto Configuration
11. **Auto-configuration trong Spring Boot hoạt động như thế nào?**
    - @Conditional annotations
    - starter dependencies mechanism
    - Customize auto-configuration

12. **Làm thế nào để exclude specific auto-configuration?**
    - @SpringBootApplication exclude
    - application.properties exclusions
    - Debug auto-configuration

## **3. WEB DEVELOPMENT VỚI SPRING MVC**

### Controllers & REST
13. **@Controller vs @RestController?**
    - ResponseBody behavior
    - View resolution vs JSON response
    - When to use which

14. **Mapping annotations trong Spring MVC?**
    - @RequestMapping và variants (@GetMapping, @PostMapping, etc.)
    - Path variables với @PathVariable
    - Request parameters với @RequestParam

15. **@RequestBody và @ResponseBody hoạt động như thế nào?**
    - JSON serialization/deserialization
    - Message converters
    - Content negotiation

16. **Exception handling trong Spring Boot?**
    - @ExceptionHandler
    - @ControllerAdvice và Global exception handling
    - Custom error responses

### Validation
17. **Validation trong Spring Boot được implement như thế nào?**
    - @Valid và @Validated
    - JSR-303 Bean Validation
    - Custom validators
    - Error handling cho validation

## **4. DATA ACCESS & JPA**

### Spring Data JPA
18. **Spring Data JPA là gì? Lợi ích gì?**
    - Repository pattern
    - JpaRepository vs CrudRepository
    - Custom query methods

19. **Query methods trong Spring Data JPA?**
    - Method naming conventions
    - @Query annotation
    - Native queries vs JPQL

20. **@Entity và JPA annotations?**
    - @Table, @Column, @Id, @GeneratedValue
    - Relationships: @OneToMany, @ManyToOne, @ManyToMany
    - Cascade types và fetch strategies

### Database Configuration
21. **Cấu hình database trong Spring Boot?**
    - DataSource configuration
    - Multiple datasources
    - Connection pooling (HikariCP)

22. **Transaction management trong Spring?**
    - @Transactional annotation
    - Transaction propagation levels
    - Rollback strategies

## **5. SECURITY**

### Spring Security Basics
23. **Spring Security là gì và tại sao cần thiết?**
    - Authentication vs Authorization
    - Security filter chain
    - Default security configuration

24. **Implement basic authentication trong Spring Boot?**
    - UserDetailsService
    - Password encoding
    - In-memory vs database authentication

25. **JWT token authentication?**
    - JWT structure và benefits
    - Token generation và validation
    - Stateless authentication

26. **Method-level security?**
    - @PreAuthorize, @PostAuthorize
    - @Secured annotation
    - Role-based access control

## **6. TESTING**

### Testing Framework
27. **Testing trong Spring Boot?**
    - @SpringBootTest
    - @WebMvcTest, @DataJpaTest
    - Test slices và their purposes

28. **Mock objects trong Spring testing?**
    - @MockBean vs @Mock
    - Mockito integration
    - Testing với TestContainers

29. **Integration testing strategies?**
    - @TestPropertySource
    - Test profiles
    - Database testing approaches

## **7. ADVANCED FEATURES**

### AOP & Events
30. **Aspect-Oriented Programming (AOP) trong Spring?**
    - @Aspect, @Pointcut, @Around, @Before, @After
    - Cross-cutting concerns
    - Use cases: logging, security, caching

31. **Spring Events là gì?**
    - @EventListener
    - ApplicationEvent
    - Asynchronous event handling

### Caching
32. **Caching trong Spring Boot?**
    - @Cacheable, @CacheEvict, @CachePut
    - Cache providers (Redis, Caffeine)
    - Cache configuration

### Scheduling
33. **Scheduled tasks trong Spring Boot?**
    - @Scheduled annotation
    - Cron expressions
    - Async task execution

## **8. MICROSERVICES & SPRING CLOUD**

### Basic Concepts
34. **Spring Boot với Microservices architecture?**
    - Service discovery basics
    - Configuration management
    - Circuit breaker pattern

35. **RESTTemplate vs WebClient?**
    - Synchronous vs Asynchronous HTTP calls
    - Error handling strategies
    - Connection configuration

## **9. MONITORING & PRODUCTION**

### Actuator
36. **Spring Boot Actuator là gì?**
    - Health checks, metrics, info endpoints
    - Custom health indicators
    - Production monitoring

37. **Logging trong Spring Boot?**
    - Logback configuration
    - Log levels và profiles
    - Structured logging

### Performance
38. **Performance optimization trong Spring Boot?**
    - Lazy initialization
    - Connection pooling
    - Memory management

## **10. CODING CHALLENGES**

### Practical Exercises
39. **Code một RESTful API đơn giản:**
    ```
    Yêu cầu: User management system
    - GET /users - list all users
    - GET /users/{id} - get user by id
    - POST /users - create new user
    - PUT /users/{id} - update user
    - DELETE /users/{id} - delete user
    
    Bao gồm: validation, exception handling, JPA
    ```

40. **Implement authentication system:**
    ```
    Yêu cầu: Login/Register functionality
    - User registration với validation
    - Login với JWT token
    - Protected endpoints
    - Role-based authorization
    ```

41. **Database relationships:**
    ```
    Scenario: Blog system
    - User entity (1-to-many với Post)
    - Post entity (many-to-many với Tag)
    - Implement CRUD operations
    - Custom query methods
    ```

42. **Exception handling:**
    ```
    Implement global exception handler:
    - Custom exceptions
    - Standardized error response format
    - Validation error handling
    - HTTP status codes mapping
    ```

## **11. TROUBLESHOOTING & DEBUG**

### Common Issues
43. **Các lỗi thường gặp trong Spring Boot?**
    - Bean creation errors
    - Circular dependency
    - Port already in use
    - Database connection issues

44. **Debug Spring Boot application như thế nào?**
    - Logging configuration
    - Actuator endpoints
    - IDE debugging techniques

45. **Performance issues troubleshooting?**
    - Slow queries identification
    - Memory leak detection
    - Connection pool monitoring

## **12. CONFIGURATION & DEPLOYMENT**

### Configuration Management
46. **External configuration trong Spring Boot?**
    - Property sources hierarchy
    - Environment variables
    - Command line arguments
    - @ConfigurationProperties

47. **Profile-based configuration?**
    - Development vs Production configs
    - Database per environment
    - Feature toggles

### Deployment
48. **Deploy Spring Boot application?**
    - JAR vs WAR deployment
    - Docker containerization
    - Environment-specific configurations
    - Health checks setup

## **13. INTEGRATION & MESSAGE QUEUES**

### External Systems
49. **Integrate với external APIs?**
    - RestTemplate configuration
    - Error handling strategies
    - Retry mechanisms
    - Timeout configuration

50. **Message queues integration?**
    - RabbitMQ với Spring Boot
    - @RabbitListener
    - Message serialization

## **CODING INTERVIEW SCENARIOS**

### **Scenario 1: E-commerce Backend**
```java
"Design một backend cho e-commerce với:
- Product catalog management
- User registration/login
- Shopping cart functionality
- Order processing
- Inventory management

Implement core features và explain architectural decisions."
```

### **Scenario 2: Blog Platform**
```java
"Tạo blog platform với:
- User authentication (JWT)
- CRUD operations cho posts
- Comment system
- Tag/Category management
- Search functionality

Focus on data modeling và API design."
```

### **Scenario 3: Task Management System**
```java
"Build task management API:
- User roles (Admin, User)
- Project và Task entities
- Assignment functionality
- Status tracking
- Notification system

Emphasize security và business logic."
```

## **TIPS CHUẨN BỊ PHỎNG VẤN**

### **Kiến Thức Cần Vững:**
- Spring Core concepts (DI, IoC, AOP)
- Spring Boot auto-configuration
- Spring MVC và REST API development
- Spring Data JPA basics
- Spring Security fundamentals

### **Thực Hành Cần Có:**
- Tối thiểu 2-3 complete projects
- Understanding of testing strategies
- Database integration experience
- Basic deployment knowledge

### **Red Flags cần Tránh:**
- Chỉ thuộc lòng annotation mà không hiểu concept
- Không biết khi nào nên/không nên dùng Spring
- Không có experience với real projects
- Không hiểu security implications

### **Câu Hỏi Ngược cho Interviewer:**
- "Team sử dụng Spring Boot version nào?"
- "Microservices hay monolith architecture?"
- "Testing strategy của team như thế nào?"
- "CI/CD pipeline hiện tại ra sao?"

---

**Lưu ý quan trọng**: Mỗi câu hỏi đều nên được prepare với ví dụ code cụ thể và explain được pros/cons của approach đó.