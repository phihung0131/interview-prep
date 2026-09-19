Bug 2: Robot nhặt trùng khay do lỗi Race Condition khi nhân viên "Double Click"
---

### 1. Context & Bối cảnh (Background)

* **Hệ thống:** Phân hệ **WES (Warehouse Execution System)** giao tiếp với **WCS (Warehouse Control System) / Robot Exotec**.
* **API thực thi:** `SP_AP_0010_12_Send Picking Instruction To Automated Warehouse(PUT)`.
* **Bối cảnh vận hành:**
* Tại trạm nhặt hàng (Picking Station), công nhân dùng chung một tài khoản trạm hoặc đăng nhập tài khoản cá nhân thông qua máy tính công nghiệp.
* Mỗi request gửi lên hệ thống đều đính kèm `Bearer Token (JWT)` hoặc header `X-User-Id`.
* Chuột máy tính ở kho thường xuyên bị bụi vải may mặc bám vào gây kẹt phím, hoặc do mạng nội bộ kho trễ (WiFi lag) nên công nhân có thói quen **nhấp chuột liên tục 2-3 lần (Double-click / Rapid Click)**.
* Hậu quả: 2 request gửi cách nhau khoảng vài chục đến $200\text{ms}$. Cả 2 cùng lọt qua tầng Controller, cùng gọi WCS khiến **2 con robot Exotec cùng chạy tới gắp 1 khay hàng**, gây dừng chuyền khẩn cấp và sinh lỗi khay ma ảo (`Ghost Bin`).



---

### 2. Thiết kế giải pháp kỹ thuật: AOP + ThreadLocal + Redis Short-lived Lock

Thay vì phải sửa code rải rác ở từng Service hay câu SQL, team triển khai một cơ chế dùng chung (Generic Framework Component) bằng **Spring AOP + Custom Annotation**, kết hợp lấy User từ **ThreadLocal** và khóa **Redis trong ~500ms**.

#### Cơ chế hoạt động (Workflow)

```
Client (Double-click 2 lần trong 100ms)
   │
   ├── Request 1 ──> Filter (bóc JWT -> lưu UserId vào ThreadLocal)
   │                    └── AOP Interceptor (@AntiDuplicate / 500ms)
   │                          └── Redis SET lock:user:123:ins:999 NX EX 500ms -> THÀNH CÔNG (Acquired)
   │                                └── Thực thi Service -> Gọi Robot
   │
   └── Request 2 ──> Filter (lưu UserId vào ThreadLocal)
                        └── AOP Interceptor (@AntiDuplicate / 500ms)
                              └── Redis SET lock:user:123:ins:999 NX EX 500ms -> THẤT BẠI (Key đã tồn tại)
                                    └── Bị chặn ngay tại cửa Controller -> Trả về HTTP 429 hoặc Nuốt âm thầm!

```

---

### 3. Chi tiết mã nguồn triển khai (Code & Architecture)

#### Bước 1: Lưu User Context bằng `ThreadLocal` qua Filter / Interceptor

Khi request đi qua Spring Security / HandlerInterceptor, thông tin `userId` được bóc tách từ JWT token và nhét vào `ThreadLocal` để có thể truy xuất bất kỳ đâu trong thread đó:

```java
public class UserContextHolder {
    private static final ThreadLocal<String> CURRENT_USER = new ThreadLocal<>();

    public static void setUserId(String userId) {
        CURRENT_USER.set(userId);
    }

    public static String getUserId() {
        return CURRENT_USER.get();
    }

    public static void clear() {
        CURRENT_USER.remove(); // Bắt buộc xóa cuối request để chống memory leak trong Tomcat Thread Pool
    }
}

```

#### Bước 2: Tạo Custom Annotation `@PreventDuplicateClick`

Gắn trực tiếp lên API Controller cần bảo vệ:

```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface PreventDuplicateClick {
    long lockTimeMs() default 500; // Khóa trong 500ms
    String keyPrefix() default "";
}

```

#### Bước 3: Viết Spring Aspect (AOP) xử lý với Redis

Tầng Aspect sẽ dùng `ThreadLocal` để lấy `userId`, kết hợp với tham số truyền vào (`instructionId`) tạo thành Redis Key duy nhất:

```java
@Aspect
@Component
@Slf4j
public class DuplicateClickAspect {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Around("@annotation(preventDuplicateClick)")
    public Object handleDuplicateClick(ProceedingJoinPoint joinPoint, PreventDuplicateClick preventDuplicateClick) throws Throwable {
        // 1. Lấy userId từ ThreadLocal (do Filter/Interceptor set trước đó)
        String userId = UserContextHolder.getUserId();
        if (userId == null) {
            userId = "SYSTEM";
        }

        // 2. Lấy tham số nghiệp vụ (ví dụ instructionId từ method args)
        Object[] args = joinPoint.getArgs();
        String businessId = (args.length > 0 && args[0] != null) ? args[0].toString() : "DEFAULT";

        // 3. Tạo Redis Key: lock:send_robot:user_{id}:item_{businessId}
        String lockKey = String.format("lock:%s:%s:%s", 
                preventDuplicateClick.keyPrefix(), userId, businessId);

        long ttl = preventDuplicateClick.lockTimeMs();

        // 4. Gọi atomic Redis SET with NX và PX (Chỉ set nếu chưa tồn tại, tự hết hạn sau 500ms)
        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, "LOCKED", Duration.ofMillis(ttl));

        // 5. Nếu không lấy được lock (nghĩa là request thứ 2 đến trong vòng 500ms)
        if (Boolean.FALSE.equals(acquired)) {
            log.warn("Phát hiện Double-click từ User: {} trên tác vụ: {}. Request bị chặn!", userId, businessId);
            // Có thể quăng Exception hoặc trả về Response nuốt lỗi tùy business
            throw new DuplicateClickException("Thao tác quá nhanh, vui lòng chờ trong giây lát!");
        }

        // 6. Request đầu tiên hợp lệ -> cho phép chạy tiếp vào Service
        return joinPoint.proceed();
    }
}

```

#### Bước 4: Áp dụng lên Controller của WES

```java
@RestController
@RequestMapping("/api/wes/picking")
public class PickingInstructionController {

    @Autowired
    private PickingInstructionService pickingService;

    @PutMapping("/instruction/{id}/send-to-robot")
    @PreventDuplicateClick(keyPrefix = "send_robot", lockTimeMs = 500) // <-- Chống click tặc trong 500ms
    public ResponseEntity<ApiResponse> sendToAutomatedWarehouse(@PathVariable("id") Long id) {
        pickingService.sendToAutomatedWarehouse(id);
        return ResponseEntity.ok(ApiResponse.success("Lệnh đã được gửi sang Robot"));
    }
}

```

---

### 4. Kết quả định lượng (Output)

* **Phía Robot Exotec:** Ngăn chặn $100\%$ các đợt lệnh kép gửi sang WCS trong tích tắc. Robot không còn bị lỗi chạy vào ô kệ trống hay kích hoạt còi dừng hệ thống.
* **Thời gian khóa tối ưu (~500ms):**
* 500ms là khoảng thời gian "vàng": Đủ dài để triệt tiêu cú click thứ hai/thứ ba của chuột bị kẹt (thường diễn ra trong vòng 50 - 200ms).
* Đủ ngắn để công nhân không cảm thấy bị hệ thống "treo" hay khóa tài khoản. Ngay sau khi xử lý xong món đó, họ có thể thao tác tiếp bình thường.


* **Tải Database:** Request trùng bị AOP và Redis chặn ngay tại cửa Controller, không tốn bất kỳ kết nối Connection hay câu query nào xuống PostgreSQL.

---

### 5. Kịch bản trả lời phỏng vấn (Interview Script)

Khi người phỏng vấn hỏi: *"Em đã từng gặp lỗi Race condition / Double click bao giờ chưa và em giải quyết nó như thế nào?"*

**Bạn trả lời cực kỳ tự nhiên và trôi chảy như sau:**

> *"Dạ có, trong phân hệ WES của tụi em có API `SP_AP_0010_12` dùng để gửi lệnh cho **hệ thống Robot tự hành Exotec** chạy vào giàn kệ lấy khay hàng.
> Dưới kho, công nhân dùng máy tính tại bàn nhặt hàng thường có thói quen **double-click chuột** khi thấy mạng hơi khựng. Vì thế, có những lúc 2 request gửi lên cách nhau chỉ tầm 100ms. Code cũ xử lý chưa chặt chẽ nên cả 2 thread Tomcat đều chạy lọt qua, cùng gọi sang WCS khiến **hai con robot cùng chạy đi lấy 1 khay hàng**, gây lỗi cảm biến phần cứng và làm treo dây chuyền tự động.
> Để giải quyết triệt để và có thể tái sử dụng cho nhiều API khác trong kho, team em đã triển khai một giải pháp dùng chung bằng **Spring AOP kết hợp ThreadLocal và Redis**:
> * *Đầu tiên, khi request đi qua Filter bảo mật, tụi em parse JWT và lưu `userId` của công nhân vào **`ThreadLocal`** qua một class `UserContextHolder` (và luôn `clear()` trong khối finally để tránh leak thread pool).*
> * *Tụi em viết một custom annotation `@PreventDuplicateClick` gắn trên API Controller, xử lý bằng Spring AOP.*
> * *Khi request tới, Aspect sẽ lấy `userId` từ ThreadLocal kết hợp với ID nghiệp vụ (`instructionId`) để tạo một Redis Lock Key, ví dụ: `lock:send_robot:{userId}:{instructionId}`.*
> * *Tụi em dùng lệnh **`setIfAbsent` (SET NX) của Redis với TTL ngắn khoảng 500ms**.
> * Request đầu tiên tới sẽ chiếm được key và chạy tiếp xuống tầng Service để gọi robot.
> * Cú click thứ hai đến sau đó 100ms sẽ bị Redis từ chối vì key đang tồn tại. Aspect lập tức chặn lại và ném ra lỗi hoặc nuốt request ngay tại cửa Controller mà không chạm xuống Database.*
> 
> 
> 
> 
> *Khoảng thời gian 500ms là đủ để triệt tiêu hoàn toàn các cú nhấp chuột đúp của công nhân nhưng không làm họ thấy khó chịu vì bị giam thao tác. Sau khi deploy giải pháp này, giàn robot vận hành êm ru, không còn một trường hợp nào bị gọi trùng lệnh nữa ạ."*