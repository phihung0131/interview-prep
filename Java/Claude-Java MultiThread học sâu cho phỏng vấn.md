# Java MultiThread học sâu cho phỏng vấn

**Created:** 7/10/2026 18:22:00  
**Updated:** 7/18/2026 1:22:40  
**Exported:** 7/18/2026 12:29:29  
**Link:** [https://claude.ai/chat/a1fc5143-cb15-4c9e-8c11-196dafc1c82a](https://claude.ai/chat/a1fc5143-cb15-4c9e-8c11-196dafc1c82a)  

## Assistant:

> 7/10/2026 18:23:24

> Orchestrated comprehensive Java multithreading curriculum with practical exercises.
>
> - I'm going to create a comprehensive Vietnamese lesson for Nhóm 1, including detailed explanations, practical exercises, and clear setup instructions.
> - **Done**

# Nhóm 1: Nền tảng lý thuyết — Java Memory Model, Data Race, Instruction Reordering

Đây đúng là phần "khó nhằn" nhất nhưng một khi hiểu rồi thì mọi thứ ở các nhóm sau (volatile, synchronized, lock...) sẽ trở thành "hệ quả logic" chứ không phải học vẹt. Mình đi từng bước.

## 1. Tại sao cần Java Memory Model (JMM)?

### Vấn đề gốc: phần cứng không "trung thực" như bạn nghĩ

Khi bạn viết code Java tuần tự, bạn nghĩ nó chạy đúng theo thứ tự dòng lệnh. Nhưng thực tế có 3 "kẻ phá hoại" thứ tự đó:

1. **CPU Cache** — mỗi core có cache riêng (L1/L2), không phải lúc nào cũng đồng bộ ngay với RAM (main memory)
2. **Compiler reordering** — trình biên dịch JIT có thể sắp xếp lại lệnh để tối ưu tốc độ
3. **CPU reordering** — bản thân CPU cũng thực thi out-of-order để tận dụng pipeline

### Sơ đồ hình dung (bạn nên tự vẽ lại):

```
        RAM (Main Memory)
         x = 0, flag = false
              ↑↓  (đồng bộ chậm, không tức thời)
   ┌──────────┴──────────┐
   │                      │
Core 1 Cache          Core 4 Cache
(Thread A ghi)        (Thread B đọc)
x = 1                 x = 0  ← ĐỌC GIÁ TRỊ CŨ!
flag = true           flag = false
```

**Kịch bản cụ thể:**

```java
// Thread A chạy:
x = 1;          // (1) ghi vào Core 1 cache, CHƯA flush ra RAM
flag = true;    // (2) ghi vào Core 1 cache

// Thread B chạy:
if (flag) {          // (3) đọc từ Core 4 cache — có thể thấy true
    print(x);        // (4) nhưng x lúc này Core 4 cache có thể vẫn là 0!
}
```

→ Thread B thấy `flag = true` nhưng `x` vẫn là `0`. Đây là hậu quả của việc **không có "visibility guarantee"** giữa các core.

### JMM giải quyết vấn đề gì?

JMM là một **bộ quy tắc trừu tượng** (không phải cơ chế phần cứng cụ thể) định nghĩa: trong điều kiện nào thì một thread được đảm bảo nhìn thấy giá trị mà thread khác ghi. Nó là "hợp đồng" giữa lập trình viên và JVM/CPU/Compiler.

## 2. Happens-Before — khái niệm trung tâm

**Định nghĩa dễ hiểu:** Nếu hành động A "happens-before" hành động B, thì:
- Kết quả của A **chắc chắn nhìn thấy được** bởi B
- Không có nghĩa là A phải xảy ra trước B về mặt thời gian đồng hồ — mà là JMM **đảm bảo** thứ tự quan sát được

**Các quy tắc happens-before quan trọng nhất (học thuộc để phỏng vấn):**

| # | Quy tắc | Ý nghĩa |
|---|---------|---------|
| 1 | **Program order rule** | Trong 1 thread, lệnh trước happens-before lệnh sau (theo code, nhưng compiler vẫn được reorder nếu không ảnh hưởng kết quả *trong thread đó*) |
| 2 | **Monitor lock rule** | `unlock()` một monitor happens-before `lock()` monitor đó của thread khác (đây là lý do `synchronized` đảm bảo visibility) |
| 3 | **Volatile variable rule** | Ghi vào biến `volatile` happens-before đọc biến đó của thread khác |
| 4 | **Thread start rule** | `Thread.start()` happens-before mọi hành động trong thread đó |
| 5 | **Thread join rule** | Mọi hành động trong thread happens-before `Thread.join()` trả về ở thread gọi |
| 6 | **Transitivity** | Nếu A happens-before B, B happens-before C thì A happens-before C |

**Ví dụ áp dụng quy tắc volatile:**

```java
class SharedData {
    volatile boolean flag = false;
    int x = 0;

    void writer() {
        x = 1;          // (1)
        flag = true;    // (2) - volatile write
    }

    void reader() {
        if (flag) {          // (3) - volatile read
            print(x);        // (4) - chắc chắn thấy x = 1!
        }
    }
}
```

Nhờ quy tắc #3 + #6 (transitivity): `(1) happens-before (2)` (program order) → `(2) happens-before (3)` (volatile rule) → `(3) happens-before (4)` (program order) ⟹ `(1) happens-before (4)`. Vì vậy Thread B chắc chắn thấy `x = 1`.

## 3. Data Race vs Race Condition — phân biệt (câu hỏi phỏng vấn kinh điển)

Đây là 2 khái niệm **rất hay bị nhầm** — bạn trả lời phân biệt rõ ràng là ghi điểm ngay.

| Tiêu chí | Data Race | Race Condition |
|----------|-----------|-----------------|
| **Định nghĩa** | ≥2 thread truy cập cùng 1 biến, ít nhất 1 thread ghi, không có đồng bộ hóa (happens-before) | Kết quả chương trình phụ thuộc vào **thứ tự thực thi** của các thread — thứ tự nào cũng "hợp lệ về mặt code" nhưng cho ra kết quả sai |
| **Bản chất** | Vấn đề ở **cấp bộ nhớ / bytecode** | Vấn đề ở **cấp logic nghiệp vụ** |
| **Có luôn đi kèm nhau?** | Data race → thường dẫn đến race condition, nhưng KHÔNG bắt buộc | Race condition CÓ THỂ xảy ra mà KHÔNG có data race |
| **Ví dụ** | `count++` không đồng bộ (đọc-sửa-ghi không atomic) | `if (accountExists) { createAccount(); }` — dù mỗi dòng đã atomic, 2 thread vẫn có thể cùng thấy `accountExists = false` rồi cùng tạo account trùng |

**Ví dụ race condition KHÔNG có data race:**

```java
// Dùng synchronized đầy đủ, KHÔNG có data race
public void withdraw(int amount) {
    synchronized (lock) {
        if (balance >= amount) {   // check
            balance -= amount;      // act
        }
    }
}
```
Đoạn này an toàn vì cả check và act đều trong 1 synchronized block. Nhưng nếu bạn tách check và act ra 2 method `synchronized` riêng biệt:

```java
public synchronized boolean hasEnough(int amount) {
    return balance >= amount;
}
public synchronized void withdraw(int amount) {
    balance -= amount;
}

// Nơi gọi:
if (account.hasEnough(100)) {   // (A) mỗi method tự nó atomic, KHÔNG có data race
    account.withdraw(100);       // (B) nhưng giữa A và B, thread khác có thể xen vào rút hết tiền!
}
```
→ Đây là **race condition** (lỗi TOCTOU — Time-Of-Check-Time-Of-Use) dù không có data race nào cả, vì mỗi thao tác riêng lẻ đều đã đồng bộ.

**Câu trả lời mẫu khi phỏng vấn hỏi "phân biệt data race và race condition":**
> "Data race là vấn đề kỹ thuật ở cấp bộ nhớ — nhiều thread đọc/ghi 1 biến mà không có happens-before relationship. Race condition là vấn đề logic — kết quả đúng/sai phụ thuộc vào timing của các thread, kể cả khi từng thao tác đã atomic. Data race luôn là bug, nhưng race condition đôi khi là race condition 'benign' (vô hại) tùy ngữ cảnh."

## 4. Instruction Reordering — ví dụ Singleton Pattern bị lỗi

Đây là ví dụ **kinh điển nhất** để hiểu tại sao reordering nguy hiểm.

### Singleton "Double-Checked Locking" SAI (không có volatile):

```java
public class Singleton {
    private static Singleton instance;   // ❌ THIẾU volatile

    public static Singleton getInstance() {
        if (instance == null) {                    // check 1 (không lock)
            synchronized (Singleton.class) {
                if (instance == null) {             // check 2 (có lock)
                    instance = new Singleton();     // ⚠️ dòng nguy hiểm
                }
            }
        }
        return instance;
    }
}
```

### Tại sao dòng `instance = new Singleton()` nguy hiểm?

Về mặt bytecode, câu lệnh này KHÔNG phải 1 thao tác atomic — nó thực chất là 3 bước:

```
1. allocate  → cấp phát bộ nhớ cho object
2. invoke    → gọi constructor để khởi tạo các field
3. assign    → gán địa chỉ bộ nhớ đó cho biến "instance"
```

JIT compiler hoặc CPU **được phép reorder** thành `1 → 3 → 2` (vì theo góc nhìn single-thread, kết quả cuối cùng vẫn giống nhau — đây gọi là "as-if-serial" semantics). Nhưng với multi-thread thì:

```
Thread A:                          Thread B:
1. allocate memory
3. instance = <địa chỉ bộ nhớ>     
                                    check: instance == null? 
                                    → FALSE (đã có địa chỉ!)
                                    return instance;  ← ⚠️ TRẢ VỀ OBJECT CHƯA CHẠY CONSTRUCTOR!
2. invoke constructor (chạy sau)
```

→ Thread B nhận về một object **"nửa sống nửa chết"** — địa chỉ đã có nhưng field bên trong chưa được khởi tạo (vẫn là default value: `0`, `null`, `false`...). Đây là lỗi cực kỳ khó debug vì nó **không phải lúc nào cũng xảy ra** (phụ thuộc CPU, JIT optimization level, timing).

### Cách fix: thêm `volatile`

```java
private static volatile Singleton instance;  // ✅ 
```

`volatile` ở đây có tác dụng chặn reordering giữa bước `allocate/invoke` và `assign` (nhờ **ordering guarantee** — sẽ học kỹ ở Nhóm 2), đảm bảo khi `instance` khác `null` thì constructor **chắc chắn đã chạy xong**.

## 5. Sơ đồ tổng hợp bạn nên tự vẽ lại (bài tập tư duy)

Trước khi làm bài tập code, hãy tự vẽ 1 sơ đồ giấy gồm:
1. RAM ở giữa, 2 Core hai bên với cache riêng
2. Mũi tên thể hiện Thread A ghi `x=1` vào Core cache nhưng chưa flush
3. Thread B đọc từ Core khác → thấy giá trị cũ
4. Vẽ thêm 1 phiên bản có `happens-before` (nhờ volatile/synchronized) → mũi tên "flush + invalidate" xảy ra đúng lúc

Việc tự vẽ giúp bạn nhớ lâu hơn nhiều so với đọc lý thuyết suông.

---

## 🧪 BÀI TẬP THỰC HÀNH

### Setup môi trường

```bash
mkdir -p ~/java-concurrency/nhom1
cd ~/java-concurrency/nhom1
java -version   # cần JDK 17+ để chạy mượt, JDK 21 càng tốt (dùng sau ở Nhóm 9)
```

Bạn không cần Maven/Gradle cho bài tập này — dùng thẳng `java` command chạy single file là đủ (từ Java 11 trở lên hỗ trợ chạy trực tiếp `.java` không cần compile riêng).

### Bài tập 1: Tái hiện lỗi Visibility (không có volatile)

Tạo file `VisibilityBug.java`:

```java
public class VisibilityBug {
    // Thử nghiệm với "false" trước, sau đó đổi thành "true"
    private static boolean flag = false;

    public static void main(String[] args) throws InterruptedException {
        Thread reader = new Thread(() -> {
            System.out.println("Reader thread bắt đầu, đang chờ flag...");
            int count = 0;
            while (!flag) {
                count++;
                // vòng lặp rỗng - nếu không có "count++" JIT có thể tối ưu triệt để
            }
            System.out.println("Reader thread thoát vòng lặp sau " + count + " lần check!");
        });

        reader.start();
        Thread.sleep(1000); // đợi reader thread chạy ổn định

        System.out.println("Main thread set flag = true");
        flag = true;

        reader.join(5000); // đợi tối đa 5s
        if (reader.isAlive()) {
            System.out.println("❌ SAU 5 GIÂY, reader thread VẪN CHƯA THOÁT! → Visibility bug xảy ra!");
            System.exit(0); // ép thoát vì thread bị treo
        } else {
            System.out.println("✅ Reader thread đã thoát bình thường.");
        }
    }
}
```

**Chạy thử:**
```bash
java VisibilityBug.java
```

**Yêu cầu của bạn:**
1. Chạy nhiều lần (5-10 lần) với `flag` KHÔNG có `volatile` — ghi lại: có bao nhiêu lần bị treo (không thoát vòng lặp)?
   - *Lưu ý: trên máy thật (không phải máy ảo/container yếu), lỗi này ngày càng khó tái hiện ở JDK mới vì JIT compiler ngày càng "thông minh" nhưng đôi khi vẫn xảy ra, đặc biệt nếu bạn thêm nhiều logic hơn vào vòng lặp để tránh bị tối ưu hoàn toàn.*
2. Thêm `volatile` vào biến `flag`, chạy lại 5-10 lần — quan sát: còn bị treo nữa không?
3. **Viết ra giấy** (hoặc file `answer.md`): giải thích bằng happens-before rule tại sao `volatile` fix được vấn đề này.

### Bài tập 2: Tái hiện lỗi Singleton (Double-Checked Locking)

Tạo file `BrokenSingleton.java`:

```java
public class BrokenSingleton {
    private static BrokenSingleton instance;
    private int[] data; // giả lập field cần khởi tạo tốn thời gian

    private BrokenSingleton() {
        data = new int[1000];
        // Giả lập việc khởi tạo phức tạp để tăng khả năng "bắt được" lỗi reordering
        for (int i = 0; i < data.length; i++) {
            data[i] = i;
        }
    }

    public static BrokenSingleton getInstance() {
        if (instance == null) {
            synchronized (BrokenSingleton.class) {
                if (instance == null) {
                    instance = new BrokenSingleton();
                }
            }
        }
        return instance;
    }

    public int checkIntegrity() {
        // Nếu object bị "half-initialized", data có thể null → NPE
        // hoặc data.length có thể khác 1000 trong trường hợp cực hiếm
        return data.length;
    }

    public static void main(String[] args) throws InterruptedException {
        int threadCount = 20;
        Thread[] threads = new Thread[threadCount];
        for (int i = 0; i < threadCount; i++) {
            threads[i] = new Thread(() -> {
                try {
                    BrokenSingleton s = getInstance();
                    int len = s.checkIntegrity();
                    if (len != 1000) {
                        System.out.println("❌ PHÁT HIỆN OBJECT CHƯA KHỞI TẠO XONG! len=" + len);
                    }
                } catch (NullPointerException e) {
                    System.out.println("❌ NPE - object nửa sống nửa chết!");
                }
            });
        }
        for (Thread t : threads) t.start();
        for (Thread t : threads) t.join();
        System.out.println("Test xong.");
    }
}
```

**Yêu cầu của bạn:**
1. Chạy nhiều lần — thực tế bug này **rất khó tái hiện trên JDK hiện đại** (vì nhiều lý do: JIT, CPU x86 có strong memory model...). Đây là điều **bình thường** — bạn không cần lo nếu không thấy lỗi thật sự xảy ra.
2. Quan trọng hơn kết quả chạy: thêm `volatile` vào `instance`, rồi giải thích trong `answer.md`:
   - Tại sao thêm `volatile` là "đúng về lý thuyết" dù bug khó tái hiện trên máy bạn?
   - Nếu được hỏi trong phỏng vấn "double checked locking cần gì để đúng?", bạn trả lời thế nào cho đủ ý?

### Bài tập 3 (tư duy, không cần code): Phân biệt Data Race và Race Condition

Viết ra (trong `answer.md`) cho 3 đoạn code sau: đoạn nào có **data race**, đoạn nào có **race condition**, đoạn nào có cả hai, đoạn nào không có gì:

```java
// Đoạn A
int counter = 0;
// 2 threads cùng chạy: counter++;

// Đoạn B
private final Object lock = new Object();
private List<String> list = new ArrayList<>();
void addIfAbsent(String item) {
    synchronized(lock) {
        if (!list.contains(item)) {
            list.add(item);
        }
    }
}
// gọi từ nhiều thread với cùng 1 item

// Đoạn C
private AtomicInteger id = new AtomicInteger(0);
void createUser() {
    int newId = id.get();
    // ... giả sử có xử lý gì đó ở giữa
    id.set(newId + 1);
}
// gọi từ nhiều thread
```

Sau khi bạn làm xong 3 bài tập này, nhắn cho mình để mình review đáp án + giải thích thêm chỗ nào chưa rõ, rồi mình sẽ dạy tiếp **Nhóm 2: volatile, synchronized, ReentrantLock...**

## Assistant:

> 7/13/2026 20:04:29

> Orchestrated comprehensive theoretical framework for Group 2 continuation.
>
> - Người dùng muốn tôi tiếp tục với Nhóm 2 và đi sâu vào lý thuyết, cung cấp nội dung chi tiết bằng tiếng Việt.
> - **Done**

# Nhóm 2: Công cụ đồng bộ hóa cơ bản (Lý thuyết chuyên sâu)

Đây là nhóm "công cụ" — nhưng để dùng đúng, bạn phải hiểu **guarantee** (đảm bảo) mà mỗi công cụ cung cấp, chứ không chỉ nhớ syntax. Phỏng vấn senior thường xoáy vào đúng chỗ này.

## 1. `volatile` — 2 guarantee, KHÔNG có atomicity

### Guarantee #1: Visibility

Khi 1 thread ghi vào biến `volatile`, giá trị đó được **flush ngay lập tức** ra main memory (không giữ ở CPU cache riêng). Khi thread khác đọc, nó **invalidate cache** và đọc lại từ main memory.

```java
private volatile boolean running = true;

void stopWorker() { running = false; }  // Thread A ghi

void workerLoop() {
    while (running) {   // Thread B đọc — LUÔN thấy giá trị mới nhất
        doWork();
    }
}
```

Không có `volatile`, Thread B có thể cache `running = true` mãi mãi trong register/cache và **không bao giờ thoát vòng lặp** dù Thread A đã set `false`.

### Guarantee #2: Ordering (chặn reordering)

`volatile` tạo ra một "hàng rào bộ nhớ" (memory barrier):
- Mọi lệnh **trước** volatile write không được reorder ra **sau** nó
- Mọi lệnh **sau** volatile read không được reorder ra **trước** nó

Đây chính là cơ chế fix bug Singleton ở Nhóm 1 — nó đảm bảo `allocate + invoke constructor` xảy ra **trước** `assign vào instance` theo đúng thứ tự, không bị CPU/compiler đảo lộn.

```
        Volatile Write (flag = true)
─────────────────────────────────────  ← barrier: lệnh trước không lọt qua được
        x = 1  (phải xảy ra trước dòng trên trong bộ nhớ quan sát được)
```

### Điều `volatile` KHÔNG làm được: Atomicity

Đây là câu hỏi phỏng vấn **must-know**: "volatile có làm cho `count++` thread-safe không?" → **KHÔNG**.

```java
private volatile int count = 0;
void increment() { count++; }  // ❌ VẪN race condition!
```

Lý do: `count++` thực chất là 3 bước bytecode:
```
1. read count từ memory   (nhờ volatile, đọc đúng giá trị mới nhất)
2. tăng lên 1 (trong CPU register)
3. write count trở lại memory (nhờ volatile, flush ngay)
```

Nhưng **giữa bước 1 và 3**, thread khác hoàn toàn có thể xen vào đọc-sửa-ghi. `volatile` chỉ đảm bảo *mỗi lần đọc/ghi riêng lẻ* là visible ngay, nó **không đảm bảo cả chuỗi read-modify-write là 1 khối atomic**.

**Ví dụ minh họa race:**
```
Thread A: read count=5
Thread B: read count=5
Thread A: tăng lên 6, write count=6
Thread B: tăng lên 6, write count=6   ← MẤT 1 LẦN TĂNG!
```
Kết quả mong đợi là 7 nhưng thực tế là 6.

**Khi nào `volatile` ĐỦ dùng (không cần synchronized)?**
- Biến chỉ có **1 thread ghi, nhiều thread đọc** (ví dụ flag dừng vòng lặp, config được reload)
- Các thao tác là **atomic tự nhiên** (gán giá trị đơn giản, không phải read-modify-write)

## 2. `synchronized` — Intrinsic Lock, Monitor, Reentrancy

### Cơ chế Monitor

Mỗi object trong Java có 1 "monitor" (hay còn gọi là "intrinsic lock" / "mutex") ẩn gắn liền với nó. `synchronized` sử dụng chính monitor này:

```java
synchronized (someObject) {
    // chỉ 1 thread được vào block này tại 1 thời điểm
    // (thread khác muốn synchronized(someObject) phải đợi)
}
```

`synchronized` cung cấp **cả 2 guarantee** mà `volatile` có (visibility + ordering), **CỘNG THÊM atomicity** (mutual exclusion) — vì chỉ 1 thread được thực thi block đó tại 1 thời điểm.

### 3 dạng sử dụng

```java
// 1. Synchronized method (instance) - lock trên "this"
public synchronized void method() { ... }
// tương đương:
public void method() {
    synchronized(this) { ... }
}

// 2. Synchronized static method - lock trên Class object (khác với lock instance!)
public static synchronized void staticMethod() { ... }
// tương đương:
public static void staticMethod() {
    synchronized(MyClass.class) { ... }
}

// 3. Synchronized block - lock trên object bất kỳ (linh hoạt nhất, khuyến khích dùng)
synchronized(lockObject) { ... }
```

**Bẫy phỏng vấn hay gặp:** static synchronized method và instance synchronized method dùng **2 lock KHÁC NHAU** (Class object vs instance object) → chạy đồng thời được, không loại trừ lẫn nhau!

```java
class Counter {
    public synchronized void instanceMethod() { ... }       // lock: this
    public static synchronized void staticMethod() { ... }  // lock: Counter.class
}
// 2 thread có thể chạy instanceMethod() và staticMethod() ĐỒNG THỜI
```

### Reentrancy (tính tái nhập)

`synchronized` là **reentrant lock** — một thread đã giữ lock có thể "vào lại" chính lock đó mà không bị deadlock với chính mình:

```java
public synchronized void outer() {
    inner();  // gọi method synchronized khác, cùng lock (this)
}
public synchronized void inner() {
    // Thread đã giữ lock "this" ở outer() → được vào tiếp, không bị block
}
```

JVM theo dõi bằng 1 **hold count** (đếm số lần lock được acquire bởi cùng 1 thread) — mỗi lần thoát khỏi synchronized block, count giảm 1, đến khi về 0 thì lock mới thực sự được release cho thread khác.

**Tại sao cần reentrancy?** Nếu không có, code đệ quy hoặc gọi method nội bộ cùng lock sẽ tự deadlock chính nó.

### So sánh nhanh: `synchronized` vs `volatile`

| Tiêu chí | volatile | synchronized |
|---|---|---|
| Visibility | ✅ | ✅ |
| Ordering | ✅ | ✅ |
| Atomicity (mutual exclusion) | ❌ | ✅ |
| Blocking (thread phải đợi) | ❌ (không bao giờ block) | ✅ (thread khác phải đợi) |
| Có thể dùng cho method/block | ❌ (chỉ biến) | ✅ |
| Performance | Nhẹ hơn | Nặng hơn (context switch nếu contested) |

## 3. `ReentrantLock` — khi nào dùng thay `synchronized`

`ReentrantLock` (trong `java.util.concurrent.locks`) cung cấp cùng guarantee cơ bản như `synchronized` (mutual exclusion + reentrancy) nhưng **linh hoạt hơn**. Đây là **4 tình huống kinh điển** hay được hỏi:

### Tình huống 1: Timed Lock (tryLock với timeout)

```java
ReentrantLock lock = new ReentrantLock();

if (lock.tryLock(2, TimeUnit.SECONDS)) {   // ✅ chỉ đợi tối đa 2 giây
    try {
        // critical section
    } finally {
        lock.unlock();
    }
} else {
    // không lấy được lock sau 2s → làm việc khác, tránh treo vô thời hạn
    System.out.println("Không lấy được lock, bỏ qua.");
}
```

`synchronized` **không có cách nào** để "thử lấy lock trong X giây rồi bỏ cuộc" — nó block **vô thời hạn**. Đây là ưu thế lớn nhất khi cần tránh deadlock hoặc timeout logic.

### Tình huống 2: Interruptible Lock

```java
try {
    lock.lockInterruptibly();  // ✅ có thể bị interrupt trong lúc đang chờ lock
    try {
        // critical section
    } finally {
        lock.unlock();
    }
} catch (InterruptedException e) {
    // xử lý khi thread bị interrupt trong lúc đang đợi lock
    Thread.currentThread().interrupt();
}
```

Với `synchronized`, một thread đang **đợi** lock (BLOCKED state) **không thể bị interrupt** — nó chỉ có thể chờ đến khi có lock. `lockInterruptibly()` cho phép thread thoát khỏi trạng thái chờ nếu bị interrupt, hữu ích để hủy task đang chờ tài nguyên (ví dụ: user cancel request).

### Tình huống 3: Fairness (công bằng)

```java
ReentrantLock fairLock = new ReentrantLock(true);  // true = fair mode
```

- **Mặc định (`false`)**: unfair lock — thread nào "may mắn" giành được CPU trước có thể chen ngang lấy lock, dù có thread khác đã đợi lâu hơn (tối ưu throughput nhưng có thể gây starvation)
- **Fair mode (`true`)**: lock được cấp theo đúng thứ tự **FIFO** — thread đợi lâu nhất được ưu tiên → tránh starvation nhưng **chậm hơn đáng kể** (overhead quản lý hàng đợi)

`synchronized` **không có khái niệm fairness** — hoàn toàn phụ thuộc vào JVM/OS scheduler, không kiểm soát được.

### Tình huống 4: Multiple Conditions (nhiều điều kiện chờ trên cùng 1 lock)

Với `synchronized`, bạn chỉ có **1 "wait set"** dùng chung cho `wait()/notify()/notifyAll()`. Với `ReentrantLock`, bạn có thể tạo **nhiều `Condition` object riêng biệt** từ cùng 1 lock:

```java
ReentrantLock lock = new ReentrantLock();
Condition notFull = lock.newCondition();   // điều kiện "hàng đợi chưa đầy"
Condition notEmpty = lock.newCondition();  // điều kiện "hàng đợi chưa rỗng"

// Producer:
lock.lock();
try {
    while (queue.isFull()) {
        notFull.await();      // chỉ chờ điều kiện "chưa đầy", không lẫn với consumer
    }
    queue.add(item);
    notEmpty.signal();        // chỉ đánh thức thread đang chờ "chưa rỗng"
} finally {
    lock.unlock();
}
```

Đây là ưu thế cực lớn cho bài toán **Producer-Consumer** phức tạp — tránh phải `notifyAll()` đánh thức nhầm cả producer lẫn consumer (gây "thundering herd" — tất cả thread thức dậy nhưng đa số phải ngủ lại ngay).

### ⚠️ Cạm bẫy quan trọng nhất của `ReentrantLock`: PHẢI unlock() thủ công trong `finally`

```java
lock.lock();
try {
    // nếu exception xảy ra ở đây mà không có finally → lock KHÔNG BAO GIỜ được release
    // → DEADLOCK VĨNH VIỄN cho mọi thread khác
    doSomething();
} finally {
    lock.unlock();   // ✅ BẮT BUỘC, không có JVM tự lo như synchronized
}
```

`synchronized` tự động release lock khi thoát khối lệnh (kể cả khi có exception) nhờ cơ chế JVM-level. `ReentrantLock` là API thuần Java — **bạn phải tự đảm bảo unlock**, quên là bug nghiêm trọng.

## 4. `ReadWriteLock` / `StampedLock` — tối ưu đọc nhiều / ghi ít

### Vấn đề của `synchronized`/`ReentrantLock` thường

Cả 2 đều là **exclusive lock** — dù bạn chỉ **đọc** dữ liệu (không sửa gì), thread khác cũng phải đợi. Với hệ thống đọc nhiều-ghi ít (ví dụ: cache, config), đây là lãng phí lớn.

### `ReentrantReadWriteLock`

```java
ReadWriteLock rwLock = new ReentrantReadWriteLock();
Lock readLock = rwLock.readLock();
Lock writeLock = rwLock.writeLock();

// Đọc — NHIỀU thread có thể đọc ĐỒNG THỜI
readLock.lock();
try {
    return data.get(key);
} finally {
    readLock.unlock();
}

// Ghi — CHỈ 1 thread được ghi, và không thread nào (kể cả reader) được vào cùng lúc
writeLock.lock();
try {
    data.put(key, value);
} finally {
    writeLock.unlock();
}
```

**Quy tắc cốt lõi:**
- Read lock ↔ Read lock: **không loại trừ nhau** (nhiều reader cùng lúc)
- Read lock ↔ Write lock: **loại trừ nhau**
- Write lock ↔ Write lock: **loại trừ nhau**

### `StampedLock` (Java 8+) — nhanh hơn nhưng phức tạp hơn

`StampedLock` thêm 1 chế độ thứ 3: **Optimistic Read** — không hề lock thật sự, chỉ "đánh dấu" (stamp) rồi đọc, sau đó **kiểm tra lại** xem trong lúc đọc có bị ghi đè không.

```java
StampedLock sl = new StampedLock();

// Optimistic read - KHÔNG có lock thật, cực nhanh
long stamp = sl.tryOptimisticRead();
int x = point.x;   // đọc data mà không hề chặn writer
int y = point.y;
if (!sl.validate(stamp)) {
    // ❌ đã bị writer ghi đè trong lúc đọc → phải đọc lại bằng lock thật
    stamp = sl.readLock();
    try {
        x = point.x;
        y = point.y;
    } finally {
        sl.unlockRead(stamp);
    }
}
```

**Tại sao nhanh hơn `ReadWriteLock`?** Vì optimistic read **hoàn toàn không có overhead của việc acquire/release lock** (không cần CAS, không cần đợi) — nó chỉ đọc 1 số "version stamp" rồi so sánh sau. Chỉ khi phát hiện có xung đột mới "downgrade" xuống dùng lock thật.

**Đánh đổi:** `StampedLock` **KHÔNG hỗ trợ reentrancy** (dùng lại trong cùng thread sẽ deadlock!) và API phức tạp hơn, dễ dùng sai. `ReentrantReadWriteLock` an toàn và dễ dùng hơn cho hầu hết trường hợp.

## 5. Atomic Classes & CAS (Compare-And-Swap)

### CAS là gì?

CAS là 1 **lệnh CPU cấp phần cứng** (không phải software lock), hoạt động theo nguyên lý:

```
CAS(memory_location, expected_value, new_value):
    if (memory_location == expected_value) {
        memory_location = new_value
        return true   // thành công
    } else {
        return false   // thất bại, giá trị đã bị thread khác thay đổi
    }
// Toàn bộ thao tác so sánh + gán này là ATOMIC ở cấp CPU (1 instruction duy nhất)
```

### Cách `AtomicInteger.incrementAndGet()` hoạt động bên trong

```java
public final int incrementAndGet() {
    while (true) {
        int current = get();           // đọc giá trị hiện tại
        int next = current + 1;
        if (compareAndSet(current, next)) {   // CAS: nếu vẫn còn là "current" thì đổi thành "next"
            return next;
        }
        // nếu CAS thất bại (thread khác đã đổi trước) → LOOP LẠI, thử lại từ đầu
    }
}
```

Đây gọi là **lock-free algorithm** (hay "optimistic concurrency") — không có thread nào bị **block** (BLOCKED state) chờ đợi, mà chỉ **retry** liên tục cho đến khi thành công. Khác hoàn toàn với `synchronized` (pessimistic — giả định luôn có xung đột nên lock trước).

**So sánh Lock-based vs Lock-free:**

| | Lock-based (synchronized) | Lock-free (CAS/Atomic) |
|---|---|---|
| Cơ chế | Thread bị BLOCK, JVM/OS quản lý hàng đợi | Thread retry liên tục (busy-spin), không bao giờ block |
| Context switch | Có (tốn kém) | Không |
| Deadlock risk | Có thể | Không thể (không giữ lock) |
| Hiệu năng khi ít contention | Tốt | Rất tốt |
| Hiệu năng khi contention CAO | Ổn định | **Tệ** — quá nhiều thread retry liên tục = "livelock-like" waste CPU |

### `AtomicReference`, `AtomicInteger`, `AtomicLong` — và vấn đề ABA

**Vấn đề ABA** là câu hỏi phỏng vấn nâng cao hay gặp:

```
Thread A đọc value = "A"
Thread A chuẩn bị CAS("A" → "C")
   ... nhưng bị context switch tạm dừng ...
Thread B: CAS("A" → "B")  thành công
Thread B: CAS("B" → "A")  thành công (đổi lại giá trị cũ!)
Thread A: tiếp tục chạy, CAS("A" → "C") → THÀNH CÔNG (vì value hiện tại lại là "A")
```

Về mặt kỹ thuật, CAS của Thread A "đúng" (giá trị hiện tại đúng là "A" như nó expect), nhưng **về mặt logic nghiệp vụ có thể sai** — nếu "A" đại diện cho 1 node trong linked list đã bị free/thay đổi cấu trúc ở giữa, Thread A không hề biết điều đó đã xảy ra.

**Giải pháp:** `AtomicStampedReference` — thêm 1 "version stamp" đi kèm giá trị, mỗi lần thay đổi thì version tăng lên, CAS phải khớp cả value LẪN version thì mới thành công.

## 6. `LongAdder` vs `AtomicLong` — khi nào chọn cái nào

### Vấn đề của `AtomicLong` khi high contention

`AtomicLong` dùng **1 biến CAS duy nhất** cho tất cả thread. Khi có **nhiều thread cùng tăng giá trị đồng thời** (high contention), rất nhiều CAS sẽ **thất bại và phải retry** → lãng phí CPU cycles đáng kể, hiệu năng giảm mạnh.

```
10 threads cùng gọi incrementAndGet() trên 1 AtomicLong
→ Chỉ 1 thread CAS thành công tại 1 thời điểm
→ 9 thread còn lại retry liên tục → cạnh tranh khốc liệt trên 1 biến duy nhất
```

### `LongAdder` — chiến lược "chia để trị" (Striping)

`LongAdder` (Java 8+) dùng nhiều biến "cell" (mảng các Cell nội bộ) — mỗi thread (dựa trên hash) sẽ ghi vào 1 cell khác nhau, **giảm contention** vì các thread ít khi CAS vào cùng 1 ô nhớ:

```
Thread 1 → Cell[0]  += 1
Thread 2 → Cell[1]  += 1   (đồng thời, KHÔNG cạnh tranh với Thread 1)
Thread 3 → Cell[2]  += 1

sum() = Cell[0] + Cell[1] + Cell[2] + base   // chỉ tính tổng khi CẦN đọc giá trị
```

Khi có tranh chấp (CAS thất bại), `LongAdder` tự động "mở rộng" thêm cell mới để giảm khả năng đụng độ tiếp theo (cơ chế tự thích ứng).

### Bảng quyết định chọn cái nào

| Tiêu chí | `AtomicLong` | `LongAdder` |
|---|---|---|
| Đọc giá trị hiện tại thường xuyên xen kẽ với ghi | ✅ Tốt hơn (đọc `get()` rẻ, luôn chính xác tức thời) | ⚠️ `sum()` phải cộng dồn tất cả cell → chậm hơn nếu gọi liên tục |
| Ghi nhiều, ít khi cần đọc (ví dụ: counter thống kê, metrics) | ⚠️ Chậm khi contention cao | ✅ Rất nhanh — đây chính là use case thiết kế cho nó |
| Cần CAS logic phức tạp (`compareAndSet` thủ công) | ✅ Có API đầy đủ | ❌ Không hỗ trợ CAS thủ công |
| Bộ nhớ sử dụng | Thấp (1 giá trị) | Cao hơn (mảng cell, đặc biệt khi high contention mở rộng nhiều cell) |
| Use case điển hình | ID generator, cần giá trị chính xác ngay lập tức | Request counter, hit counter, metrics/monitoring |

**Câu trả lời mẫu phỏng vấn:** *"LongAdder đánh đổi tốc độ đọc (read) để lấy tốc độ ghi (write) cao hơn nhiều dưới high contention, bằng cách phân tán các lần ghi ra nhiều cell riêng biệt thay vì cạnh tranh trên 1 biến CAS duy nhất. Nếu tôi cần 1 counter mà nhiều thread liên tục tăng giá trị và ít khi đọc (như request counter trong hệ thống high-throughput), tôi chọn LongAdder. Nếu tôi cần đọc/ghi xen kẽ thường xuyên và cần giá trị chính xác ngay lập tức (như generate unique ID), tôi chọn AtomicLong."*

---

## 📊 BẢNG SO SÁNH TỔNG HỢP (bạn nên tự làm lại, đây là bản mẫu để đối chiếu)

| Công cụ | Atomicity | Visibility | Ordering | Blocking | Reentrant | Use case chính |
|---|---|---|---|---|---|---|
| `volatile` | ❌ | ✅ | ✅ | ❌ (never blocks) | N/A | Flag đơn giản, 1 writer nhiều reader |
| `synchronized` | ✅ | ✅ | ✅ | ✅ | ✅ | General-purpose, đơn giản, dễ đúng |
| `ReentrantLock` | ✅ | ✅ | ✅ | ✅ (có thể tùy chỉnh) | ✅ | Cần timeout/interrupt/fairness/multi-condition |
| `ReadWriteLock` | ✅ | ✅ | ✅ | ✅ (chỉ writer-writer, writer-reader) | ✅ | Đọc nhiều, ghi ít |
| `Atomic*`/CAS | ✅ (thao tác đơn) | ✅ | ✅ | ❌ (lock-free, retry) | N/A | Counter đơn giản, low-medium contention |
| `LongAdder` | ✅ | ✅ | ✅ | ❌ (lock-free, striped) | N/A | Counter, high contention, ít đọc |

---

## 🧪 BÀI TẬP THỰC HÀNH

### Setup

```bash
cd ~/java-concurrency
mkdir nhom2 && cd nhom2
```

### Bài tập 1: Tự chứng minh `volatile` KHÔNG có atomicity

Tạo file `VolatileNotAtomic.java`:

```java
public class VolatileNotAtomic {
    private static volatile int count = 0;

    public static void main(String[] args) throws InterruptedException {
        int threadCount = 10;
        int incrementsPerThread = 10_000;
        Thread[] threads = new Thread[threadCount];

        for (int i = 0; i < threadCount; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < incrementsPerThread; j++) {
                    count++;   // KHÔNG atomic dù có volatile!
                }
            });
        }

        for (Thread t : threads) t.start();
        for (Thread t : threads) t.join();

        int expected = threadCount * incrementsPerThread;
        System.out.println("Expected: " + expected);
        System.out.println("Actual:   " + count);
        System.out.println(count == expected ? "✅ Trùng khớp (may mắn/ít contention)" : "❌ SAI - đã mất update do race condition!");
    }
}
```

**Yêu cầu:**
1. Chạy 5 lần, ghi lại kết quả `Actual` mỗi lần — chứng minh nó **không ổn định** (khác nhau mỗi lần chạy, luôn ≤ expected)
2. Sửa `count++` thành dùng `synchronized` block, chạy lại → verify luôn ra đúng `expected`
3. Sửa lại dùng `AtomicInteger.incrementAndGet()`, chạy lại → verify luôn đúng, so sánh **thời gian chạy** giữa 2 cách (đo bằng `System.nanoTime()`)

### Bài tập 2: So sánh hiệu năng `synchronized` vs `ReentrantLock` vs `AtomicLong` vs `LongAdder`

Tạo file `PerformanceComparison.java`:

```java
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.LongAdder;
import java.util.concurrent.locks.ReentrantLock;

public class PerformanceComparison {

    static long syncCounter = 0;
    static final Object lockObj = new Object();

    static ReentrantLock reentrantLock = new ReentrantLock();
    static long lockCounter = 0;

    static AtomicLong atomicCounter = new AtomicLong(0);
    static LongAdder longAdderCounter = new LongAdder();

    static final int THREAD_COUNT = 8;
    static final int ITERATIONS = 1_000_000;

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== synchronized ===");
        runTest(() -> {
            synchronized (lockObj) { syncCounter++; }
        });

        System.out.println("=== ReentrantLock ===");
        runTest(() -> {
            reentrantLock.lock();
            try { lockCounter++; } finally { reentrantLock.unlock(); }
        });

        System.out.println("=== AtomicLong ===");
        runTest(atomicCounter::incrementAndGet);

        System.out.println("=== LongAdder ===");
        runTest(longAdderCounter::increment);
    }

    static void runTest(Runnable task) throws InterruptedException {
        Thread[] threads = new Thread[THREAD_COUNT];
        long start = System.nanoTime();

        for (int i = 0; i < THREAD_COUNT; i++) {
            threads[i] = new Thread(() -> {
                for (int j = 0; j < ITERATIONS; j++) {
                    task.run();
                }
            });
        }
        for (Thread t : threads) t.start();
        for (Thread t : threads) t.join();

        long duration = (System.nanoTime() - start) / 1_000_000;
        System.out.println("Thời gian: " + duration + "ms");
    }
}
```

**Yêu cầu:**
1. Chạy toàn bộ, ghi lại thời gian của 4 cách
2. Thử tăng `THREAD_COUNT` lên 16, 32 — quan sát: `LongAdder` có giữ được ưu thế nhiều hơn không khi contention tăng?
3. Viết nhận xét vào `answer.md`: xếp hạng 4 công cụ theo hiệu năng, giải thích **tại sao** dựa trên cơ chế bên trong (không chỉ nói "vì nó nhanh hơn" — phải giải thích bằng CAS/lock/striping)

### Bài tập 3: Tái hiện tình huống cần `ReadWriteLock`

Viết 1 class `Cache` mô phỏng cache đơn giản dùng `HashMap` (không thread-safe), có 2 method `get(key)` và `put(key, value)`. 

```java
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class Cache<K, V> {
    private final Map<K, V> map = new HashMap<>();
    private final ReadWriteLock rwLock = new ReentrantReadWriteLock();

    public V get(K key) {
        rwLock.readLock().lock();
        try {
            // Giả lập việc đọc tốn thời gian (I/O, tính toán...)
            simulateWork(5);
            return map.get(key);
        } finally {
            rwLock.readLock().unlock();
        }
    }

    public void put(K key, V value) {
        rwLock.writeLock().lock();
        try {
            simulateWork(5);
            map.put(key, value);
        } finally {
            rwLock.writeLock().unlock();
        }
    }

    private void simulateWork(int ms) {
        try { Thread.sleep(ms); } catch (InterruptedException ignored) {}
    }

    public static void main(String[] args) throws InterruptedException {
        Cache<String, Integer> cache = new Cache<>();
        cache.put("x", 1);

        long start = System.currentTimeMillis();
        int readerCount = 20;
        Thread[] readers = new Thread[readerCount];
        for (int i = 0; i < readerCount; i++) {
            readers[i] = new Thread(() -> cache.get("x"));
        }
        for (Thread t : readers) t.start();
        for (Thread t : readers) t.join();
        long duration = System.currentTimeMillis() - start;

        System.out.println("20 reader chạy song song mất: " + duration + "ms");
        // Nếu ReadWriteLock hoạt động đúng: ~5-10ms (chạy song song)
        // Nếu dùng synchronized/exclusive lock thường: ~100ms (20 x 5ms, chạy tuần tự)
    }
}
```

**Yêu cầu:**
1. Chạy như trên, ghi lại thời gian
2. Đổi `ReadWriteLock` thành `synchronized` bình thường (lock toàn bộ method `get`/`put` bằng 1 lock chung), chạy lại — so sánh thời gian, giải thích sự khác biệt
3. Thêm vào giữa: 1 writer thread chạy `put()` trong lúc 20 reader đang đọc — quan sát và giải thích thứ tự thực thi (writer có phải đợi hết reader không? reader mới có phải đợi writer không?)

---

Làm xong 3 bài tập gửi cho mình review nhé. Đặc biệt lưu ý bài tập 2 và 3 — mục tiêu không phải là "code chạy được" mà là **giải thích đúng cơ chế bên trong tại sao có sự khác biệt về hiệu năng**, vì đây chính là dạng câu hỏi hay gặp nhất khi phỏng vấn senior. Xong thì mình dạy tiếp **Nhóm 3: Vòng đời Thread, wait/notify/sleep/join, ThreadLocal**.

## Assistant:

> 7/14/2026 12:01:27

> Orchestrated transition to advanced theory and practical exercises.
>
> - Tiếp tục với Nhóm 3, tập trung vào lý thuyết sâu sắc và các bài tập thực hành.
> - **Done**

# Nhóm 3: Vòng đời và quản lý Thread

## 1. 6 trạng thái Thread — chi tiết từng transition

Java định nghĩa thread state qua enum `Thread.State`. Đây là câu hỏi warm-up rất hay gặp nhưng nhiều người trả lời hời hợt — bạn nên hiểu rõ **điều kiện chuyển đổi** giữa các state, không chỉ liệt kê tên.

```
        new Thread()
             │
             ▼
        ┌─────────┐
        │   NEW    │  (đã tạo object, chưa gọi start())
        └────┬────┘
             │ start()
             ▼
        ┌─────────────┐
   ┌───▶│  RUNNABLE    │◀───────────────┐
   │    │ (Ready+Running)│               │
   │    └──────┬───────┘               │
   │           │                        │
   │  chờ lock │  gọi wait()/     hết thời gian
   │  (monitor)│  join()/sleep()   / được notify()
   │           │                    / lock available
   │           ▼                        │
   │    ┌──────────────┐                │
   │    │   BLOCKED     │               │
   │    │ (chờ vào       │               │
   │    │  synchronized) │               │
   │    └──────┬───────┘               │
   │           │ acquired lock          │
   └───────────┴────────────────────────┘
   
        ┌──────────────┐
        │   WAITING     │  (wait() không timeout, join() không timeout,
        │               │   LockSupport.park())
        └──────┬───────┘
               │ notify()/notifyAll()/thread kia terminate/unpark()
               ▼
           RUNNABLE

        ┌──────────────────┐
        │  TIMED_WAITING     │ (sleep(ms), wait(ms), join(ms),
        │                    │  LockSupport.parkNanos())
        └──────┬────────────┘
               │ hết timeout HOẶC được notify/unpark
               ▼
           RUNNABLE

        ┌──────────────┐
        │ TERMINATED    │  (run() chạy xong hoặc throw exception chưa catch)
        └──────────────┘
```

### Điểm hay bị hỏi sai: BLOCKED vs WAITING khác nhau chỗ nào?

| | BLOCKED | WAITING / TIMED_WAITING |
|---|---|---|
| **Nguyên nhân** | Đang cố **vào** 1 `synchronized` block/method mà lock đã bị thread khác giữ | Đã **chủ động gọi** `wait()`, `join()`, `LockSupport.park()` |
| **Ai đánh thức** | JVM tự động khi lock được release | Cần **hành động rõ ràng**: `notify()/notifyAll()` hoặc thread kia kết thúc, hoặc hết timeout |
| **Có giữ lock nào không** | Không giữ gì (đang đợi để giữ) | **WAITING do `wait()`**: đã **release** lock trước khi vào waiting |
| **Interrupt được không** | Từ Java 5 trở đi: **không** áp dụng interrupt để thoát BLOCKED (dùng ReentrantLock.lockInterruptibly() nếu cần) | **Có** — `InterruptedException` được throw nếu thread đang WAITING bị interrupt |

**Ví dụ dễ nhầm:**
```java
synchronized (lock) {
    // Thread ở đây là RUNNABLE (đang giữ lock, đang chạy)
    lock.wait();  
    // Ngay khi gọi wait(): 
    // 1. Thread RELEASE lock "lock"
    // 2. Thread chuyển sang WAITING
    // 3. Thread khác giờ có thể vào synchronized(lock) này
}
```

## 2. `sleep()` vs `wait()` vs `yield()` vs `join()` — bảng so sánh chi tiết

Đây là **câu hỏi phỏng vấn số 1** của nhóm này. Trọng tâm: **thread nào release lock, thread nào không**.

| Method | Thuộc class | Release lock đang giữ? | Cần synchronized block? | Đánh thức bằng gì | Static hay instance |
|---|---|---|---|---|---|
| `Thread.sleep(ms)` | `Thread` | ❌ **KHÔNG** release | Không cần | Hết thời gian hoặc `interrupt()` | static method |
| `Object.wait()` | `Object` | ✅ **CÓ** release (lock của chính object gọi wait) | ✅ **BẮT BUỘC** phải trong synchronized(obj) | `notify()`/`notifyAll()` hoặc timeout (nếu có) hoặc `interrupt()` | instance method |
| `Thread.yield()` | `Thread` | ❌ Không giữ lock nào để release | Không cần | Không "đánh thức" — chỉ là gợi ý cho scheduler | static method |
| `Thread.join()` | `Thread` | ❌ KHÔNG release lock mà **thread gọi join() đang giữ** | Không cần | Thread được join() kết thúc, hoặc timeout, hoặc `interrupt()` | instance method |

### Giải thích sâu từng cái

**`sleep()`** — "Tôi ngủ nhưng vẫn giữ hết đồ trong túi (lock)":
```java
synchronized (lock) {
    Thread.sleep(5000);  
    // Thread này VẪN GIỮ "lock" trong suốt 5 giây!
    // Thread khác muốn synchronized(lock) → phải đợi đủ 5s + phần còn lại
}
```
→ Đây là lỗi hiệu năng cực kỳ phổ biến: gọi `sleep()` bên trong `synchronized` block sẽ **giữ lock không cần thiết**, chặn hết các thread khác dù bản thân không làm gì (chỉ ngủ).

**`wait()`** — "Tôi buông lock ra rồi mới đi ngủ, chờ ai đó gọi tôi dậy":
```java
synchronized (lock) {
    while (!condition) {   // ⚠️ LUÔN dùng while, KHÔNG dùng if (giải thích bên dưới)
        lock.wait();       // RELEASE lock, vào WAITING
        // khi được notify() và acquire lại lock, code tiếp tục CHẠY TỪ ĐÂY
    }
    // xử lý khi condition = true
}
```

**Tại sao phải dùng `while` chứ không phải `if` khi gọi `wait()`?** — Đây là **câu hỏi bẫy kinh điển**:
1. **Spurious wakeup** (đánh thức giả) — JVM cho phép thread bị đánh thức mà **không có ai gọi `notify()`** (hiếm nhưng được đặc tả cho phép, do cách implement OS-level). Nếu dùng `if`, code sẽ chạy tiếp dù điều kiện chưa đúng.
2. **notifyAll() đánh thức nhiều thread** — nhưng chỉ 1 thread được acquire lock trước, xử lý xong condition có thể lại false đối với các thread còn lại. Nếu dùng `if`, các thread sau sẽ chạy vào code xử lý dù điều kiện đã bị người khác "dùng hết" (ví dụ: producer-consumer, 2 consumer cùng được đánh thức nhưng chỉ có 1 item trong queue).

```java
// ❌ SAI - dùng if
synchronized (lock) {
    if (queue.isEmpty()) {
        lock.wait();
    }
    item = queue.poll();  // ⚠️ Có thể null nếu 2 consumer cùng được notifyAll() 
                            // nhưng chỉ có 1 item, consumer thứ 2 poll() ra null!
}

// ✅ ĐÚNG - dùng while
synchronized (lock) {
    while (queue.isEmpty()) {
        lock.wait();   // sau khi được đánh thức, QUAY LẠI kiểm tra điều kiện lần nữa
    }
    item = queue.poll();  // đảm bảo queue chắc chắn không empty tại đây
}
```

**`yield()`** — "gợi ý" (hint) cho scheduler rằng thread hiện tại sẵn sàng nhường CPU cho thread khác cùng priority, nhưng **không đảm bảo gì cả** — scheduler có thể bỏ qua hoàn toàn gợi ý này. Trong thực tế **hiếm khi dùng** trong code production, chủ yếu xuất hiện trong câu hỏi lý thuyết hoặc benchmark/testing.

**`join()`** — thread A gọi `threadB.join()` nghĩa là "Thread A đợi cho đến khi Thread B chạy xong (TERMINATED)":
```java
Thread worker = new Thread(() -> doHeavyWork());
worker.start();
worker.join();  // main thread BLOCK ở đây (thực chất là WAITING) đến khi "worker" xong
System.out.println("Worker đã xong, tiếp tục...");
```
Quan trọng: `join()` **không release lock mà thread gọi `join()` đang giữ** (nếu có) — chỉ liên quan đến lock của **chính object `worker`** thread bên trong (JDK implement `join()` bằng `wait()` trên chính object Thread đó).

## 3. `ThreadLocal` và lỗi rò rỉ bộ nhớ trong Thread Pool (câu hỏi senior hay gặp)

### `ThreadLocal` là gì và giải quyết vấn đề gì?

`ThreadLocal<T>` cho phép **mỗi thread có 1 bản sao riêng** của biến, không chia sẻ giữa các thread — giải quyết vấn đề "cần biến per-thread mà không cần đồng bộ hóa gì cả" (vì mỗi thread chỉ động vào bản của chính nó).

```java
private static final ThreadLocal<SimpleDateFormat> dateFormatHolder = 
    ThreadLocal.withInitial(() -> new SimpleDateFormat("yyyy-MM-dd"));
    // SimpleDateFormat KHÔNG thread-safe, nhưng mỗi thread có instance riêng → an toàn

public String formatDate(Date date) {
    return dateFormatHolder.get().format(date);  // mỗi thread dùng bản riêng của mình
}
```

**Use case phổ biến khác:** lưu context xuyên suốt request (user ID, transaction ID, trace ID cho logging/tracing), tránh phải truyền tham số qua nhiều lớp method.

### Cơ chế bên trong: `ThreadLocalMap`

Đây là phần **quan trọng nhất** để hiểu tại sao có memory leak:

```
Thread object
   │
   └── ThreadLocal.ThreadLocalMap threadLocals  ← MỖI THREAD có 1 map riêng
          │
          ├── Entry: key=ThreadLocal instance A (WeakReference) → value = data A
          ├── Entry: key=ThreadLocal instance B (WeakReference) → value = data B
          └── ...
```

Điểm mấu chốt: **Thread object sở hữu 1 `ThreadLocalMap`**, và trong map đó:
- **key** là `WeakReference` đến `ThreadLocal` instance
- **value** là **StrongReference** (tham chiếu mạnh) đến data thật

### Tại sao memory leak xảy ra trong Thread Pool?

**Kịch bản:**

```java
public class RequestContext {
    private static final ThreadLocal<Map<String, Object>> context = new ThreadLocal<>();
    
    public static void set(String key, Object value) {
        context.get().put(key, value);
    }
    
    public static void clear() {
        context.remove();  // ⚠️ nếu QUÊN gọi cái này...
    }
}

// Trong 1 request handler chạy trên thread pool:
executorService.submit(() -> {
    RequestContext.set("userId", "user123");
    processRequest();
    // ❌ QUÊN gọi RequestContext.clear()!
});
```

**Chuỗi sự kiện gây leak:**

1. Thread pool **tái sử dụng thread** (đây chính là bản chất của thread pool — thread không chết sau mỗi task, nó ở lại chờ task tiếp theo)
2. `ThreadLocalMap` của thread đó **vẫn còn tồn tại** sau khi task kết thúc (vì Thread object còn sống)
3. Nếu bạn không gọi `.remove()`, `Entry` với `value = {"userId": "user123", ...}` **vẫn nằm trong map mãi mãi**, dù task đã xong từ lâu
4. Task tiếp theo chạy trên **cùng thread đó** → có thể **vô tình đọc lại data cũ** của request trước (bug bảo mật nghiêm trọng — leak data giữa các user/request!)
5. Qua hàng nghìn request, `ThreadLocalMap` **phình to dần** vì tích lũy các entry không dùng đến nữa (dù key là WeakReference nên `ThreadLocal` instance có thể bị GC, nhưng **value vẫn giữ strong reference** → **không được GC**, entry trở thành "orphaned" — key null nhưng value vẫn còn)

**Tại sao WeakReference cho key không tự giải quyết được vấn đề?**

Nếu `ThreadLocal` instance (key) bị GC (ví dụ nó chỉ là biến local, không static), entry trong map sẽ có `key = null`. JDK **có cơ chế dọn dẹp** các entry này (khi gọi `get()/set()/remove()` trên bất kỳ ThreadLocal nào khác trong cùng map, nó sẽ "expunge" — dọn 1 số entry stale). Nhưng đây là dọn dẹp **"best-effort", không đảm bảo**, và **value vẫn strong reference** cho đến khi bị "expunge" — nếu không có hoạt động gì trên map đó nữa, entry cứ nằm ì ra đó.

**Trong thực tế, `ThreadLocal` dùng trong thread pool thường là `static final`** → key **không bao giờ bị GC** (vì Class-level reference sống suốt đời ứng dụng) → chỉ còn cách **duy nhất** để dọn: gọi `.remove()` thủ công.

### Cách fix đúng: LUÔN dùng try-finally

```java
executorService.submit(() -> {
    try {
        RequestContext.set("userId", "user123");
        processRequest();
    } finally {
        RequestContext.clear();  // ✅ LUÔN được gọi, kể cả khi có exception
    }
});
```

**Best practice production:** dùng `ThreadPoolExecutor` custom hoặc wrapper (decorator pattern) tự động clear tất cả ThreadLocal sau mỗi task, hoặc dùng framework hỗ trợ sẵn (Spring's `RequestContextHolder` có cơ chế tương tự nhưng đã handle clear đúng cách trong filter).

### Câu trả lời mẫu khi phỏng vấn hỏi "ThreadLocal memory leak là gì, khi nào xảy ra?"

> "ThreadLocal leak xảy ra chủ yếu trong môi trường thread pool, vì thread được tái sử dụng thay vì bị hủy sau mỗi task. Mỗi Thread giữ một ThreadLocalMap riêng, trong đó key là WeakReference đến ThreadLocal instance nhưng value là StrongReference đến dữ liệu thật. Nếu không gọi remove() sau khi dùng xong, dữ liệu đó tồn tại mãi trong map của thread đó — dẫn đến 2 vấn đề: (1) rò rỉ bộ nhớ vì object không bao giờ được GC dù logic không cần nữa, và (2) rủi ro bảo mật nghiêm trọng hơn — request/task tiếp theo chạy trên cùng thread có thể vô tình đọc được data của request trước đó nếu code quên set lại giá trị mới. Giải pháp là luôn gọi remove() trong khối finally."

---

## 🧪 BÀI TẬP THỰC HÀNH

### Setup

```bash
cd ~/java-concurrency
mkdir nhom3 && cd nhom3
```

### Bài tập 1: Quan sát trực tiếp 6 trạng thái Thread bằng code

Tạo file `ThreadStateObserver.java`:

```java
import java.util.concurrent.TimeUnit;

public class ThreadStateObserver {
    private static final Object lock = new Object();

    public static void main(String[] args) throws InterruptedException {
        // Thread sẽ minh họa: NEW -> RUNNABLE -> TIMED_WAITING -> RUNNABLE -> TERMINATED
        Thread sleeper = new Thread(() -> {
            try {
                Thread.sleep(3000);
            } catch (InterruptedException ignored) {}
        }, "SleeperThread");

        // Thread sẽ minh họa: RUNNABLE -> BLOCKED
        Thread blocker = new Thread(() -> {
            synchronized (lock) {
                try { Thread.sleep(5000); } catch (InterruptedException ignored) {}
            }
        }, "BlockerThread");

        Thread waiter = new Thread(() -> {
            synchronized (lock) {
                try {
                    lock.wait();  // RUNNABLE -> WAITING
                } catch (InterruptedException ignored) {}
            }
        }, "WaiterThread");

        System.out.println("Trước start(): " + sleeper.getState());  // NEW

        sleeper.start();
        blocker.start();
        Thread.sleep(200); // đợi blocker chiếm lock trước

        waiter.start();

        Thread.sleep(500); // đợi các thread ổn định trạng thái

        System.out.println("sleeper.getState() = " + sleeper.getState());  // TIMED_WAITING
        System.out.println("blocker.getState() = " + blocker.getState());  // TIMED_WAITING (đang sleep bên trong synchronized)
        System.out.println("waiter.getState()  = " + waiter.getState());   // BLOCKED (đang cố vào synchronized(lock) mà blocker đang giữ)

        sleeper.join();
        System.out.println("Sau khi sleeper.join(): " + sleeper.getState()); // TERMINATED

        blocker.join(); // đợi blocker nhả lock
        Thread.sleep(200);
        System.out.println("waiter.getState() sau khi blocker xong = " + waiter.getState()); // WAITING (đã vào được lock, đang wait())

        synchronized (lock) {
            lock.notifyAll();  // đánh thức waiter
        }
        waiter.join();
        System.out.println("waiter sau notifyAll(): " + waiter.getState()); // TERMINATED
    }
}
```

**Yêu cầu:**
1. Chạy và **đối chiếu từng dòng output** với sơ đồ state machine ở phần lý thuyết
2. Tự giải thích (viết vào `answer.md`): tại sao `waiter` ban đầu là `BLOCKED` chứ không phải `WAITING` (dù code có gọi `wait()`)? Gợi ý: nó đang ở giai đoạn nào khi bạn check state?
3. Thử nghiệm: xóa dòng `Thread.sleep(200)` trước khi `waiter.start()` — chạy lại nhiều lần, quan sát: có khi nào `waiter` lại là `RUNNABLE` (chưa kịp cố gắng vào lock) tại thời điểm check không? Giải thích tại sao có race condition trong chính bài test này.

### Bài tập 2: Chứng minh `sleep()` giữ lock, `wait()` release lock

Tạo file `SleepVsWaitLock.java` — bạn tự viết theo yêu cầu sau (đừng copy, tự làm để nhớ):

**Yêu cầu code:**
1. Tạo 1 method `testSleep()`: Thread A vào `synchronized(lock)` rồi `Thread.sleep(3000)`. Thread B cố gắng vào `synchronized(lock)` ngay sau đó (chạy song song). Đo thời gian Thread B phải đợi để vào được lock — **kỳ vọng: ~3000ms** (vì A giữ lock suốt lúc sleep).
2. Tạo 1 method `testWait()`: Thread A vào `synchronized(lock)` rồi gọi `lock.wait(3000)` (timed wait). Thread B cố gắng vào `synchronized(lock)` ngay sau đó. Đo thời gian Thread B đợi — **kỳ vọng: gần như ngay lập tức (~vài ms)**, vì A đã release lock ngay khi gọi `wait()`.
3. In ra kết quả so sánh 2 con số thời gian, và viết giải thích ngắn trong code comment.

Nếu bí, cấu trúc gợi ý:
```java
public class SleepVsWaitLock {
    private static final Object lock = new Object();

    public static void main(String[] args) throws InterruptedException {
        testSleep();
        Thread.sleep(4000); // đợi test trước xong hẳn
        testWait();
    }

    static void testSleep() throws InterruptedException {
        // TODO: tự viết
    }

    static void testWait() throws InterruptedException {
        // TODO: tự viết
    }
}
```

### Bài tập 3: Tái hiện lỗi `if` thay vì `while` với `wait()`

Viết 1 bài toán Producer-Consumer đơn giản (dùng `wait()/notifyAll()` thủ công, KHÔNG dùng `BlockingQueue` — để hiểu bản chất trước khi học công cụ có sẵn ở Nhóm 4):

**Yêu cầu:**
1. Tạo class `SimpleQueue` với `capacity = 1` (chỉ chứa được 1 item), có method `put(item)` và `take()`, dùng `synchronized + wait/notifyAll`
2. Cố tình viết bằng `if` thay vì `while` để kiểm tra điều kiện
3. Chạy với **2 consumer thread** và **1 producer thread**, producer chỉ `put()` 1 item duy nhất rồi dừng
4. Quan sát: có consumer nào bị lỗi (NullPointerException, hoặc lấy được item "ma" không tồn tại) không?
5. Sửa lại thành `while`, chạy lại, verify hết lỗi
6. Viết giải thích trong `answer.md`: trường hợp cụ thể nào trong bài tập của bạn đã kích hoạt bug này (2 consumer cùng được `notifyAll()` đánh thức nhưng chỉ có 1 item)?

### Bài tập 4: Tái hiện `ThreadLocal` memory leak trong Thread Pool

Tạo file `ThreadLocalLeak.java`:

```java
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class ThreadLocalLeak {
    // Giả lập data "nặng" gắn với mỗi request
    static class RequestData {
        byte[] payload = new byte[1_000_000]; // 1MB mỗi request
        String requestId;
        RequestData(String id) { this.requestId = id; }
    }

    private static final ThreadLocal<RequestData> context = new ThreadLocal<>();

    public static void main(String[] args) throws InterruptedException {
        // Thread pool CHỈ có 2 thread -> sẽ bị tái sử dụng liên tục
        ExecutorService pool = Executors.newFixedThreadPool(2);

        boolean useCleanup = false; // ⚠️ THAY ĐỔI thành true để test bản fix

        for (int i = 0; i < 1000; i++) {
            final int taskId = i;
            pool.submit(() -> {
                context.set(new RequestData("req-" + taskId));
                // giả lập xử lý request
                // ❌ KHÔNG gọi context.remove() ở đây (bug)

                if (useCleanup) {
                    context.remove();
                }
            });
        }

        pool.shutdown();
        pool.awaitTermination(30, TimeUnit.SECONDS);

        // Ép GC rồi đo memory
        System.gc();
        Thread.sleep(500);
        long usedMemory = Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory();
        System.out.println("Memory used: " + (usedMemory / 1024 / 1024) + " MB");
    }
}
```

**Yêu cầu:**
1. Chạy với `useCleanup = false` — ghi lại memory used
2. Chạy với `useCleanup = true` — ghi lại memory used, so sánh
3. Dùng thêm flag JVM để quan sát rõ hơn: `java -Xmx50m -verbose:gc ThreadLocalLeak.java` (giới hạn heap nhỏ để dễ thấy khác biệt, xem log GC chạy nhiều/ít)
4. **Bài tập nâng cao** (không bắt buộc nhưng nên thử): sửa lại dùng `try-finally` để đảm bảo `remove()` luôn chạy kể cả khi task throw exception — inject 1 exception giả vào giữa task và verify là `remove()` vẫn chạy.

---

Làm xong gửi mình review. Bài tập 3 và 4 là 2 bài **quan trọng nhất** của nhóm này — nếu làm kỹ, bạn sẽ trả lời được gần như mọi câu hỏi phỏng vấn xoay quanh `wait/notify` pattern và `ThreadLocal` leak (2 chủ đề rất hay bị hỏi ở vòng senior). Xong thì mình dạy tiếp **Nhóm 4: ConcurrentHashMap, CopyOnWriteArrayList, BlockingQueue**.

## Assistant:

> 7/14/2026 13:09:43

> Surveyed concurrent collection types for thread-safe operations.
>
> - Now moving on to the concurrent collection types—ConcurrentHashMap for thread-safe maps, CopyOnWriteArrayList for lists optimized for read-heavy scenarios, and the various BlockingQueue implementations for producer-consumer patterns.
> - **Done**

# Nhóm 4: Cấu trúc dữ liệu concurrent

## 1. `ConcurrentHashMap` (Java 8+) — cơ chế CAS + khóa theo bucket

### Vấn đề của các giải pháp cũ

| Giải pháp | Vấn đề |
|---|---|
| `HashMap` thường | Không thread-safe — multi-thread ghi có thể gây **infinite loop** (Java 7 trở về trước, do resize/rehash bị corrupt), data corruption |
| `Hashtable` | Thread-safe nhưng dùng **1 lock DUY NHẤT cho toàn bộ map** — mọi thao tác get/put đều phải giành 1 lock → **cực kỳ chậm** khi nhiều thread |
| `Collections.synchronizedMap(map)` | Tương tự Hashtable — wrap toàn bộ bằng 1 lock chung, chỉ khác ở việc bạn tự chọn `Map` implementation nào |

### Kiến trúc `ConcurrentHashMap` Java 8+ (khác hoàn toàn Java 7)

**Java 7** dùng kỹ thuật **Segment locking** — chia map thành 16 segment, mỗi segment có 1 lock riêng (giống 16 Hashtable nhỏ ghép lại).

**Java 8 trở đi** bỏ hẳn Segment, chuyển sang **lock ở cấp độ từng bucket (node) của bảng băm**, mịn hơn nhiều:

```
Bảng băm (Node[] table):
┌─────┬─────┬─────┬─────┬─────┐
│ [0] │ [1] │ [2] │ [3] │ [4] │  ← mỗi ô là 1 bucket
└──┬──┴──┬──┴──┬──┴─────┴─────┘
   │     │     │
  Node  Node  null (chưa có gì)
   │     │
  Node  (linked list nếu collision,
(chain)  chuyển sang red-black tree nếu > 8 node)
```

**Chiến lược đồng bộ hóa theo từng thao tác:**

| Thao tác | Cơ chế |
|---|---|
| **`get(key)`** | **KHÔNG lock gì cả!** Đọc trực tiếp nhờ các field quan trọng được khai báo `volatile` (đảm bảo visibility) |
| **`put(key, value)` — bucket đang trống** | Dùng **CAS** (`compareAndSwap`) để gán Node đầu tiên vào bucket — không cần lock nếu không có collision |
| **`put(key, value)` — bucket đã có node (collision)** | `synchronized` **chỉ trên chính Node đầu tiên của bucket đó** (không phải lock cả map!) |
| **Resize (khi map đầy, cần tăng size bảng băm)** | Cơ chế phức tạp hơn: nhiều thread có thể **cùng tham gia** giúp resize (transfer) song song từng phần bucket, không phải 1 thread làm hết |

**Điểm mấu chốt để trả lời phỏng vấn:** *"ConcurrentHashMap không dùng 1 lock chung cho toàn bộ map như Hashtable. Java 8 trở đi, nó lock ở granularity cực nhỏ — chỉ lock trên node đầu tiên của bucket cụ thể đang bị ghi, và dùng CAS cho trường hợp không có collision. Điều này cho phép nhiều thread ghi vào các bucket khác nhau hoàn toàn song song. get() thậm chí không cần lock gì cả nhờ volatile fields."*

### Vì sao `get()` không cần lock mà vẫn an toàn?

Các field cốt lõi (`Node.val`, `Node.next`, mảng `table`) được khai báo `volatile`. Nhờ **happens-before rule của volatile** (Nhóm 2), khi 1 thread `put()` xong (ghi volatile), thread khác `get()` (đọc volatile) **chắc chắn thấy giá trị mới nhất** — dù không có `synchronized` nào cả. Đây là ví dụ thực tế xuất sắc của việc áp dụng JMM vào thiết kế thư viện.

### Bẫy phỏng vấn: các "compound operation" vẫn có thể bị race nếu dùng sai

```java
// ❌ VẪN có race condition dù dùng ConcurrentHashMap!
if (!map.containsKey(key)) {     // (A) check
    map.put(key, value);          // (B) act — giữa A và B, thread khác có thể put trước!
}
```
`ConcurrentHashMap` chỉ đảm bảo **từng method riêng lẻ** (`get`, `put`, `remove`...) là atomic — không đảm bảo **chuỗi nhiều lệnh gọi** là atomic. Đây chính là "race condition" đã học ở Nhóm 1 (TOCTOU), dù data race ở cấp bytecode không xảy ra.

**Cách fix đúng — dùng atomic compound methods:**
```java
// ✅ ĐÚNG - putIfAbsent là 1 thao tác atomic duy nhất
map.putIfAbsent(key, value);

// ✅ ĐÚNG - computeIfAbsent, atomic, hay dùng để lazy-init
map.computeIfAbsent(key, k -> createExpensiveValue(k));

// ✅ ĐÚNG - merge, hay dùng cho counter/aggregation
map.merge(key, 1, Integer::sum);  // tăng counter atomic, tạo mới nếu chưa có
```

**Lưu ý về `computeIfAbsent`:** hàm lambda mapping được thực thi trong lúc **giữ lock của bucket đó** — nếu lambda tốn thời gian hoặc gọi đệ quy vào chính map đó, có thể gây **deadlock** hoặc giảm hiệu năng nghiêm trọng. Đây là 1 bẫy production thực tế khá nổi tiếng.

## 2. `CopyOnWriteArrayList` — khi nào dùng, khi nào tránh

### Cơ chế: Copy-On-Write

```java
public boolean add(E e) {
    synchronized (lock) {
        Object[] oldArray = getArray();
        int len = oldArray.length;
        Object[] newArray = Arrays.copyOf(oldArray, len + 1);  // ← COPY TOÀN BỘ mảng cũ
        newArray[len] = e;
        setArray(newArray);   // gán volatile reference sang mảng MỚI
        return true;
    }
}

public E get(int index) {
    return getArray()[index];  // ❌ KHÔNG lock gì cả — đọc trực tiếp mảng hiện tại
}
```

**Nguyên lý:** mỗi lần **ghi** (add/remove/set), toàn bộ mảng bên trong được **copy ra 1 bản mới hoàn toàn**, thao tác trên bản mới, rồi gán lại reference (biến `array` là `volatile`). Việc **đọc** luôn thao tác trên **snapshot cũ ổn định**, không bao giờ bị block bởi việc ghi.

### Tại sao Iterator không bao giờ `ConcurrentModificationException`?

```java
List<String> list = new CopyOnWriteArrayList<>(List.of("a", "b", "c"));

for (String s : list) {
    list.add("d");   // ✅ KHÔNG throw ConcurrentModificationException!
    System.out.println(s);  // vẫn in "a", "b", "c" — KHÔNG thấy "d"
}
```

Vì `Iterator` của `CopyOnWriteArrayList` giữ **tham chiếu đến mảng snapshot tại thời điểm tạo iterator** — dù list gốc bị sửa (tạo mảng mới khác), iterator vẫn cứ duyệt trên **bản snapshot cũ nó đang giữ**, hoàn toàn không biết đến sự thay đổi. Đây gọi là **weakly consistent iterator** (khác với `fail-fast iterator` của `ArrayList` thường sẽ throw exception khi bị sửa trong lúc duyệt).

### Khi nào dùng — khi nào TRÁNH (bảng quyết định)

| Tiêu chí | Nên dùng `CopyOnWriteArrayList` | Nên TRÁNH |
|---|---|---|
| Tỷ lệ đọc/ghi | Đọc **RẤT** nhiều, ghi **RẤT** hiếm (ví dụ: danh sách listener, observer pattern, config ít thay đổi) | Ghi thường xuyên (mỗi lần ghi là **O(n)** copy toàn bộ mảng — cực kỳ tốn kém với list lớn) |
| Kích thước list | List **nhỏ** (vài chục đến vài trăm phần tử) | List **lớn** (hàng nghìn/triệu phần tử — copy sẽ rất tốn CPU + memory mỗi lần ghi) |
| Cần snapshot nhất quán khi duyệt (không quan tâm dữ liệu real-time) | ✅ Rất phù hợp — iterator luôn nhất quán, không lo bug | — |
| Cần thấy thay đổi ngay lập tức khi đang duyệt | ❌ Không phù hợp (iterator không thấy update mới) | Cần `ConcurrentHashMap`/lock khác |

**Ví dụ use case kinh điển:** danh sách các `EventListener` trong hệ thống pub-sub — đăng ký/hủy đăng ký (ghi) rất hiếm, nhưng mỗi event lại phải **duyệt qua toàn bộ listener** (đọc) rất thường xuyên.

```java
private final List<EventListener> listeners = new CopyOnWriteArrayList<>();

public void fireEvent(Event e) {
    for (EventListener l : listeners) {   // đọc cực nhanh, không lock
        l.onEvent(e);
    }
}
public void addListener(EventListener l) { listeners.add(l); }  // ghi hiếm, chấp nhận chậm hơn 1 chút
```

## 3. Các loại `BlockingQueue` — điểm khác biệt chính

`BlockingQueue` là interface mở rộng `Queue`, thêm các method **block** khi queue rỗng (lúc `take()`) hoặc đầy (lúc `put()`) — nền tảng chính cho **Producer-Consumer pattern** (sẽ học kỹ ở Nhóm 8).

### 4 method chính (khác biệt về hành vi khi queue rỗng/đầy)

| Method | Khi queue đầy (đối với thêm) | Khi queue rỗng (đối với lấy) |
|---|---|---|
| `add()` / `remove()` | Throw exception ngay | Throw exception ngay |
| `offer()` / `poll()` | Trả về `false`/`null` ngay | Trả về `false`/`null` ngay |
| `put()` / `take()` | **Block vô thời hạn** cho đến khi có chỗ trống | **Block vô thời hạn** cho đến khi có phần tử |
| `offer(timeout)` / `poll(timeout)` | Block **tối đa timeout**, hết giờ trả `false`/`null` | Tương tự |

### Bảng so sánh các implementation

| Loại | Cấu trúc bên trong | Bounded/Unbounded | Đặc điểm chính |
|---|---|---|---|
| **`ArrayBlockingQueue`** | Mảng cố định (circular array) | **Bounded** (bắt buộc khai báo capacity khi tạo) | Dùng **1 lock chung** cho cả put và take (có thể cấu hình 2 `Condition` riêng notEmpty/notFull nhưng vẫn chung 1 `ReentrantLock`) |
| **`LinkedBlockingQueue`** | Linked list (node-based) | Có thể **bounded** hoặc **unbounded** (mặc định `Integer.MAX_VALUE` nếu không khai báo capacity — ⚠️ cực kỳ nguy hiểm, dễ gây OOM) | Dùng **2 lock riêng biệt**: `putLock` và `takeLock` → put và take có thể chạy **song song** (hiệu năng cao hơn ArrayBlockingQueue khi nhiều producer + nhiều consumer) |
| **`PriorityBlockingQueue`** | Binary heap | **Unbounded** (không giới hạn size) | Phần tử được sắp xếp theo `Comparator`/`Comparable`, **KHÔNG FIFO** — `take()` luôn lấy phần tử có priority cao nhất (nhỏ nhất theo natural order) |
| **`SynchronousQueue`** | Không có buffer nào cả! | Capacity = **0** | Mỗi `put()` phải **đợi trực tiếp** 1 `take()` tương ứng đến "bắt tay" (handoff) — không hề lưu trữ phần tử nào. Bản chất là **kênh truyền trực tiếp giữa 2 thread** |
| **`DelayQueue`** | Binary heap, phần tử phải implement `Delayed` | **Unbounded** | Phần tử chỉ có thể `take()` được **sau khi hết thời gian delay** quy định (dùng cho scheduling, cache expiration, retry logic) |

### Giải thích sâu từng loại đáng chú ý

**`LinkedBlockingQueue` với 2 lock riêng — tại sao nhanh hơn?**

```
ArrayBlockingQueue:  put() và take() TRANH CHẤP cùng 1 lock
                     → dù put vào đầu, take ở cuối, vẫn phải chờ nhau

LinkedBlockingQueue: put() dùng putLock, take() dùng takeLock  
                     → producer và consumer chạy THỰC SỰ song song
                     → chỉ khi queue gần đầy/gần rỗng mới có tương tác chéo (qua biến count là AtomicInteger)
```

**⚠️ Cạm bẫy production kinh điển:** `new LinkedBlockingQueue<>()` không truyền capacity → mặc định `Integer.MAX_VALUE` (~2 tỷ) → nếu producer nhanh hơn consumer liên tục, queue **phình to vô hạn** → **OutOfMemoryError**. Đây chính là nguyên nhân gốc của bug nổi tiếng `Executors.newFixedThreadPool()` (sẽ học kỹ ở Nhóm 6) vì nó dùng `LinkedBlockingQueue` không giới hạn bên trong.

**`SynchronousQueue` — dễ hiểu nhầm nhất:**

```java
SynchronousQueue<String> queue = new SynchronousQueue<>();

// Thread A:
queue.put("hello");  // BLOCK ở đây cho đến khi có ai đó take()!
                       // "hello" KHÔNG hề được lưu vào đâu cả

// Thread B (chạy sau, ở thread khác):
String msg = queue.take();  // Ngay khi gọi, "bắt tay" với put() ở trên
                              // Cả 2 thread cùng "unblock" gần như đồng thời
```

Nó giống như 1 "cuộc gặp mặt trực tiếp" — không có kho chứa trung gian. Dùng nhiều trong `Executors.newCachedThreadPool()` (mỗi task được "trao tay" ngay cho 1 thread rảnh hoặc tạo thread mới ngay lập tức, không xếp hàng đợi).

**`PriorityBlockingQueue` — bẫy về thread-safety của Comparator:**

Bản thân queue là thread-safe, nhưng nếu `compareTo()` của các phần tử **không phải hàm pure/immutable** (ví dụ so sánh dựa trên field có thể bị mutate bởi thread khác), có thể gây hành vi không xác định trong heap. Đây là điểm hay bị bỏ qua khi thiết kế hệ thống priority task queue.

### Bảng chọn nhanh (dùng khi phỏng vấn hỏi "chọn queue nào cho tình huống X")

| Tình huống | Chọn |
|---|---|
| Cần giới hạn cứng số lượng item để tránh OOM, 1 lock đơn giản đủ dùng | `ArrayBlockingQueue` |
| Nhiều producer + nhiều consumer, cần hiệu năng cao, biết rõ nên set capacity | `LinkedBlockingQueue(capacity)` |
| Task cần xử lý theo độ ưu tiên (không theo FIFO) | `PriorityBlockingQueue` |
| Cần "trao tay" trực tiếp, không muốn buffer giữ item nào cả (ví dụ cached thread pool) | `SynchronousQueue` |
| Cần delay/schedule (retry sau N giây, cache TTL) | `DelayQueue` |

---

## 🧪 BÀI TẬP THỰC HÀNH

### Setup

```bash
cd ~/java-concurrency
mkdir nhom4 && cd nhom4
```

### Bài tập 1: Chứng minh `ConcurrentHashMap` vẫn có "check-then-act" race condition

Tạo file `CHMRaceCondition.java`:

```java
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

public class CHMRaceCondition {
    public static void main(String[] args) throws InterruptedException {
        testWrongWay();
        Thread.sleep(500);
        testRightWay();
    }

    // ❌ Cách sai: check-then-act không atomic
    static void testWrongWay() throws InterruptedException {
        ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
        AtomicInteger createCount = new AtomicInteger(0);
        int threadCount = 50;
        Thread[] threads = new Thread[threadCount];

        for (int i = 0; i < threadCount; i++) {
            threads[i] = new Thread(() -> {
                if (!map.containsKey("key")) {          // (A) check
                    createCount.incrementAndGet();        // giả lập "tạo resource tốn kém"
                    map.put("key", 1);                     // (B) act
                }
            });
        }
        for (Thread t : threads) t.start();
        for (Thread t : threads) t.join();

        System.out.println("[SAI] Số lần 'tạo resource' xảy ra: " + createCount.get() + " (mong đợi: 1)");
    }

    // ✅ Cách đúng: dùng computeIfAbsent - atomic
    static void testRightWay() throws InterruptedException {
        ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
        AtomicInteger createCount = new AtomicInteger(0);
        int threadCount = 50;
        Thread[] threads = new Thread[threadCount];

        for (int i = 0; i < threadCount; i++) {
            threads[i] = new Thread(() -> {
                map.computeIfAbsent("key", k -> {
                    createCount.incrementAndGet();
                    return 1;
                });
            });
        }
        for (Thread t : threads) t.start();
        for (Thread t : threads) t.join();

        System.out.println("[ĐÚNG] Số lần 'tạo resource' xảy ra: " + createCount.get() + " (mong đợi: 1)");
    }
}
```

**Yêu cầu:**
1. Chạy 5-10 lần, ghi lại `createCount` của `testWrongWay()` — chứng minh nó **thường xuyên > 1** (có khi ra 10, 20, tùy timing)
2. Verify `testRightWay()` **luôn luôn = 1**
3. Viết vào `answer.md`: giải thích tại sao `ConcurrentHashMap` "thread-safe" nhưng vẫn cho phép bug này xảy ra — liên hệ lại khái niệm **race condition vs data race** đã học ở Nhóm 1.

### Bài tập 2: So sánh hiệu năng đọc/ghi `CopyOnWriteArrayList` vs `Collections.synchronizedList`

```java
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

public class ListPerformanceComparison {
    static final int READ_THREADS = 20;
    static final int WRITE_THREADS = 2;
    static final int OPS_PER_THREAD = 5_000;

    public static void main(String[] args) throws InterruptedException {
        System.out.println("=== CopyOnWriteArrayList ===");
        testList(new CopyOnWriteArrayList<>());

        System.out.println("=== synchronizedList ===");
        testList(Collections.synchronizedList(new ArrayList<>()));
    }

    static void testList(List<Integer> list) throws InterruptedException {
        for (int i = 0; i < 100; i++) list.add(i); // seed data

        List<Thread> threads = new ArrayList<>();
        long start = System.nanoTime();

        // Reader threads
        for (int i = 0; i < READ_THREADS; i++) {
            threads.add(new Thread(() -> {
                for (int j = 0; j < OPS_PER_THREAD; j++) {
                    for (Integer x : list) {
                        // giả lập đọc
                    }
                }
            }));
        }

        // Writer threads
        for (int i = 0; i < WRITE_THREADS; i++) {
            threads.add(new Thread(() -> {
                for (int j = 0; j < OPS_PER_THREAD / 10; j++) { // ghi ít hơn nhiều
                    list.add(j);
                }
            }));
        }

        for (Thread t : threads) t.start();
        for (Thread t : threads) t.join();

        long duration = (System.nanoTime() - start) / 1_000_000;
        System.out.println("Thời gian: " + duration + "ms, size cuối: " + list.size());
    }
}
```

**Yêu cầu:**
1. Chạy như trên (20 reader, 2 writer, đọc nhiều ghi ít) — ghi lại thời gian của 2 loại list
2. Đổi tỷ lệ ngược lại: `READ_THREADS = 2, WRITE_THREADS = 20` (ghi nhiều đọc ít) — chạy lại, so sánh
3. Viết nhận xét: ở tỷ lệ nào `CopyOnWriteArrayList` thắng, ở tỷ lệ nào nó thua thảm hại? Giải thích bằng cơ chế "copy toàn bộ mảng mỗi lần ghi".

### Bài tập 3: Tự tay dựng Producer-Consumer bằng 3 loại `BlockingQueue` khác nhau

Viết producer-consumer đơn giản: 1 producer sinh số từ 1-20 (mỗi số cách nhau 100ms), 2 consumer lấy và in ra kèm tên consumer.

**Yêu cầu:** viết đúng 3 phiên bản, mỗi phiên bản chỉ đổi loại queue:
1. Dùng `ArrayBlockingQueue(5)` — quan sát: khi queue đầy (5 phần tử), producer có bị chững lại (block) không?
2. Dùng `SynchronousQueue<>()` — quan sát: producer có phải đợi consumer "nhận trực tiếp" mỗi lần không? (thử in log ngay trước/sau `put()` và `take()` để thấy rõ chúng "bắt tay" gần như đồng thời)
3. Dùng `PriorityBlockingQueue<>()` nhưng đổi producer thành sinh số **ngẫu nhiên** (không tuần tự) và đẩy **tất cả cùng lúc** trước khi consumer bắt đầu lấy — quan sát: thứ tự consumer lấy ra có phải tăng dần theo priority không, dù thứ tự đưa vào là ngẫu nhiên?

Code khung gợi ý (bạn tự điền phần TODO):
```java
import java.util.concurrent.*;

public class ProducerConsumerDemo {
    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(5); // đổi loại queue ở đây

        Thread producer = new Thread(() -> {
            for (int i = 1; i <= 20; i++) {
                try {
                    System.out.println("Producer chuẩn bị put: " + i);
                    queue.put(i);
                    System.out.println("Producer đã put xong: " + i);
                    Thread.sleep(100);
                } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
            }
        });

        Runnable consumerTask = () -> {
            String name = Thread.currentThread().getName();
            try {
                while (true) {
                    Integer item = queue.take();
                    System.out.println(name + " lấy được: " + item);
                }
            } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        };

        Thread consumer1 = new Thread(consumerTask, "Consumer-1");
        Thread consumer2 = new Thread(consumerTask, "Consumer-2");

        consumer1.start();
        consumer2.start();
        producer.start();

        producer.join();
        Thread.sleep(1000);
        consumer1.interrupt();
        consumer2.interrupt();
    }
}
```

---

Làm xong 3 bài, gửi mình kết quả + nhận xét để review. Bài tập 3 đặc biệt quan trọng — nó là nền tảng trực tiếp cho **Nhóm 8 (Producer-Consumer pattern chuẩn)** sắp học. Xong thì mình dạy tiếp **Nhóm 5: CountDownLatch, CyclicBarrier, Semaphore, Phaser**.

## Assistant:

> 7/14/2026 13:27:02

> Pivoted toward advanced theoretical content for section five.
>
> - Moving on to the deep theory section for Group 5.
> - **Done**

# Nhóm 5: Bộ đồng bộ hóa nâng cao (Synchronizers)

Đây là nhóm các lớp trong `java.util.concurrent` được thiết kế để **điều phối nhiều thread cùng làm việc theo một kịch bản nhất định** (khác với Lock — vốn chỉ để bảo vệ 1 vùng dữ liệu). Tất cả đều xây dựng trên nền tảng `AbstractQueuedSynchronizer` (AQS) — bạn nên biết sơ qua AQS vì hay bị hỏi ở cuối phần này.

## 0. Sơ lược AQS (AbstractQueuedSynchronizer) — nền tảng chung

Trước khi vào từng class, cần biết: `ReentrantLock`, `CountDownLatch`, `Semaphore`, `CyclicBarrier` (một phần) đều dùng chung 1 cơ chế nền là **AQS**:

```
AQS có 1 biến "state" (int, volatile) + 1 hàng đợi FIFO các thread đang chờ (CLH queue)

- ReentrantLock:    state = 0 (unlocked) / >0 (số lần lock lồng nhau - reentrant count)
- CountDownLatch:   state = count (số lượng cần đếm về 0)
- Semaphore:        state = số permit còn lại
```

Mỗi subclass chỉ cần override 2 method chính: `tryAcquire()`/`tryRelease()` (định nghĩa "thế nào là acquire được") — còn việc quản lý hàng đợi thread chờ, park/unpark thread, đều do AQS lo. Đây là lý do vì sao các class này có API tương tự nhau (đều có khái niệm "acquire" và "release" dù tên method khác nhau).

## 1. `CountDownLatch` — dùng 1 lần (one-shot)

### Cơ chế

Khởi tạo với 1 số đếm cố định. Các thread gọi `countDown()` để giảm số đếm, các thread khác gọi `await()` để **block cho đến khi số đếm về 0**.

```java
CountDownLatch latch = new CountDownLatch(3);   // đợi 3 sự kiện

// 3 worker threads:
worker.doWork();
latch.countDown();   // giảm 1, không block

// Main thread:
latch.await();        // BLOCK cho đến khi count = 0
System.out.println("Cả 3 worker đã xong!");
```

**Đặc điểm quan trọng nhất: KHÔNG THỂ RESET.** Một khi count về 0, `latch` đó **vĩnh viễn mở** — gọi `await()` sau đó sẽ trả về ngay lập tức, gọi `countDown()` thêm không có tác dụng gì (count không âm). Muốn dùng lại phải **tạo instance mới**.

### 2 pattern sử dụng phổ biến

**Pattern A: "Chờ N việc hoàn thành" (như ví dụ trên)** — 1 latch, nhiều thread `countDown()`, 1 (hoặc nhiều) thread `await()`.

**Pattern B: "Bắn súng lệnh xuất phát" (Starting gate)** — dùng latch với count = 1, để nhiều thread cùng bắt đầu chính xác tại 1 thời điểm:

```java
CountDownLatch startSignal = new CountDownLatch(1);

for (int i = 0; i < 10; i++) {
    new Thread(() -> {
        try {
            startSignal.await();   // TẤT CẢ 10 thread cùng đợi ở đây
            doRacingWork();         // chạy đồng loạt ngay khi được "bắn súng"
        } catch (InterruptedException e) { ... }
    }).start();
}

Thread.sleep(1000);  // đợi tất cả 10 thread vào trạng thái "sẵn sàng" (await)
startSignal.countDown();  // "Bắn súng" — cả 10 thread cùng chạy gần như đồng thời
```

Pattern này cực kỳ hữu ích để **viết test hoặc benchmark có tính concurrent thực sự** — đảm bảo tất cả thread bắt đầu công việc cùng lúc, thay vì bắt đầu rải rác (do overhead tạo thread khác nhau).

## 2. `CyclicBarrier` — tái sử dụng, có thể lặp phase

### Khác biệt cốt lõi với `CountDownLatch`

| | `CountDownLatch` | `CyclicBarrier` |
|---|---|---|
| Ai gọi "chờ" | 1 nhóm thread khác đứng đợi (`await()`), nhóm khác giảm đếm (`countDown()`) — **2 vai trò riêng biệt** | **Chính các thread cần đồng bộ tự gọi `await()`** — không có vai trò "giảm đếm" riêng |
| Tái sử dụng | ❌ Dùng 1 lần | ✅ **Tự động reset** sau khi đủ số thread tới barrier — dùng lại được nhiều "vòng" (phase) |
| Hành động khi đủ điều kiện | Không có gì đặc biệt | Có thể chạy 1 **`Runnable` (barrierAction)** khi đủ thread tới, TRƯỚC khi giải phóng các thread |
| Xử lý lỗi | Không có cơ chế đặc biệt | Nếu 1 thread bị interrupt/timeout khi đang chờ ở barrier → **TẤT CẢ thread khác đang chờ đều bị `BrokenBarrierException`** |

### Ví dụ: mô phỏng tính toán theo từng "vòng" (phase) — bài toán kinh điển

```java
int threadCount = 4;
CyclicBarrier barrier = new CyclicBarrier(threadCount, () -> {
    System.out.println("=== Tất cả thread đã xong 1 vòng, chuẩn bị vòng tiếp theo ===");
});

for (int i = 0; i < threadCount; i++) {
    final int workerId = i;
    new Thread(() -> {
        for (int round = 1; round <= 3; round++) {
            doPartOfWork(workerId, round);
            try {
                System.out.println("Worker " + workerId + " xong vòng " + round + ", đợi các worker khác...");
                barrier.await();   // ĐỢI ở đây cho đến khi CẢ 4 thread cùng tới điểm này
                // Sau await(): barrier TỰ ĐỘNG RESET, sẵn sàng cho vòng tiếp theo
            } catch (Exception e) { ... }
        }
    }).start();
}
```

**Use case điển hình:** thuật toán tính toán song song theo nhiều bước (ví dụ: mô phỏng vật lý theo từng "tick" thời gian — tất cả particle phải tính xong vị trí ở tick hiện tại rồi mới cùng bước sang tick tiếp theo), hoặc matrix multiplication song song theo block.

### Bẫy: `BrokenBarrierException` lan truyền

```java
// Nếu 1 trong 4 thread bị interrupt trong lúc await(), hoặc timeout (nếu dùng await(timeout))
// → CyclicBarrier chuyển sang trạng thái "broken"
// → 3 thread CÒN LẠI đang chờ ở barrier.await() NGAY LẬP TỨC nhận BrokenBarrierException
// → Barrier phải được reset() thủ công mới dùng lại được, hoặc phải tạo mới
```
Đây là điểm khác biệt lớn so với `CountDownLatch` — 1 lỗi có thể "lan" ra ảnh hưởng toàn bộ nhóm thread khác đang chờ.

## 3. `Semaphore` — giới hạn số luồng truy cập tài nguyên

### Cơ chế: quản lý "permit" (giấy phép)

```java
Semaphore semaphore = new Semaphore(3);   // chỉ cho phép 3 thread truy cập đồng thời

void accessResource() throws InterruptedException {
    semaphore.acquire();   // lấy 1 permit, nếu hết permit thì BLOCK
    try {
        useLimitedResource();   // ví dụ: 1 trong 3 kết nối DB
    } finally {
        semaphore.release();   // trả lại permit
    }
}
```

**Điểm khác biệt quan trọng với Lock:** `Semaphore` **KHÔNG có khái niệm "chủ sở hữu" (ownership)**. Với `ReentrantLock`/`synchronized`, chỉ có **chính thread đã lock** mới được unlock. Với `Semaphore`, **bất kỳ thread nào** cũng có thể gọi `release()`, kể cả thread chưa từng gọi `acquire()`:

```java
Semaphore sem = new Semaphore(0);

// Thread A: chỉ gọi release(), không hề acquire() trước
sem.release();

// Thread B: acquire() thành công ngay dù chưa có ai "sở hữu" permit này ban đầu
sem.acquire();
```

Tính chất này khiến `Semaphore` cực kỳ linh hoạt để làm **tín hiệu (signal) giữa các thread**, không chỉ để giới hạn tài nguyên — ví dụ dùng `Semaphore(0)` để mô phỏng 1 kiểu "event" đơn giản.

### 2 use case chính

**Use case A: Connection Pool / Resource Limiting (phổ biến nhất)**
```java
class DatabaseConnectionPool {
    private final Semaphore semaphore = new Semaphore(10);  // tối đa 10 connection đồng thời
    
    public Connection getConnection() throws InterruptedException {
        semaphore.acquire();   // nếu 10 connection đều đang bận, block đợi
        return createOrReuseConnection();
    }
    
    public void releaseConnection(Connection conn) {
        returnToPool(conn);
        semaphore.release();
    }
}
```

**Use case B: Binary Semaphore (giống Mutex nhưng không có ownership)**
```java
Semaphore mutex = new Semaphore(1);  // chỉ 1 permit = giống "lock" nhưng ai cũng release được
```

### Fair mode — giống ReentrantLock

```java
Semaphore fairSemaphore = new Semaphore(3, true);  // true = FIFO, tránh starvation
```
Mặc định (`false`) là **unfair** — có thể có thread bị "chen ngang" liên tục dẫn đến starvation nếu contention cao, đổi lại throughput cao hơn.

## 4. `Phaser` — linh hoạt nhất, hỗ trợ đăng ký động nhiều phase

### Vấn đề `CyclicBarrier` không giải quyết được

`CyclicBarrier` yêu cầu **số lượng thread cố định** ngay từ lúc khởi tạo (`new CyclicBarrier(4)`). Nếu bạn cần:
- Số lượng thread tham gia **thay đổi động** trong quá trình chạy (thread mới join giữa chừng, thread cũ rời đi)
- Cấu trúc **nhiều tầng phase phân cấp** (hierarchical) — phase con của phase cha

→ Đây là lý do `Phaser` ra đời (Java 7+), thay thế `CyclicBarrier` cho các trường hợp phức tạp.

### Cơ chế đăng ký động

```java
Phaser phaser = new Phaser(1);  // "1" = party đầu tiên (thường là main thread) tự đăng ký

for (int i = 0; i < 5; i++) {
    phaser.register();   // ✅ Đăng ký thêm 1 "party" (thread) MỖI KHI cần — ĐỘNG, không cố định lúc khởi tạo
    
    new Thread(() -> {
        doPhase1Work();
        phaser.arriveAndAwaitAdvance();   // tương đương CyclicBarrier.await() — đợi hết phase 1
        
        doPhase2Work();
        phaser.arriveAndAwaitAdvance();   // đợi hết phase 2
        
        phaser.arriveAndDeregister();     // ✅ "rời khỏi" phaser sau khi xong việc — ĐỘNG
    }).start();
}

phaser.arriveAndAwaitAdvance();  // main thread cũng tham gia đợi phase 1 xong
phaser.arriveAndDeregister();     // main thread rời đi
```

### Các method chính (khác biệt về mức độ "chờ")

| Method | Ý nghĩa |
|---|---|
| `register()` | Thêm 1 party mới vào phaser (có thể gọi bất cứ lúc nào, kể cả giữa chừng) |
| `arrive()` | Báo "tôi đã xong phase này" nhưng **KHÔNG đợi** người khác (fire-and-forget) |
| `arriveAndAwaitAdvance()` | Báo xong + **đợi** tất cả party khác cũng xong mới tiếp tục (giống CyclicBarrier.await()) |
| `arriveAndDeregister()` | Báo xong phase hiện tại **VÀ** rút khỏi phaser luôn (không tham gia phase sau) |
| `getPhase()` | Lấy số thứ tự phase hiện tại (tăng dần 0, 1, 2... mỗi khi tất cả party advance) |

### Bảng so sánh 3 synchronizer: CountDownLatch vs CyclicBarrier vs Phaser

| Tiêu chí | `CountDownLatch` | `CyclicBarrier` | `Phaser` |
|---|---|---|---|
| Tái sử dụng nhiều lần | ❌ | ✅ (tự động reset) | ✅ (tự động advance phase) |
| Số lượng thread tham gia cố định | Có (fix lúc khởi tạo) | Có (fix lúc khởi tạo) | ❌ **Động** — register/deregister linh hoạt |
| Ai gọi "chờ" | Có thể khác nhóm (1 nhóm countDown, nhóm khác await) | Chính các thread tham gia tự đợi lẫn nhau | Chính các thread tham gia tự đợi lẫn nhau |
| Chạy hành động khi đủ điều kiện | ❌ | ✅ (barrierAction) | ✅ (override `onAdvance()`) |
| Độ phức tạp API | Đơn giản nhất | Trung bình | Phức tạp nhất, linh hoạt nhất |
| Hierarchical (phaser cha-con) | ❌ | ❌ | ✅ hỗ trợ (`phaser.getParent()`) |

**Trong thực tế:** `Phaser` **ít dùng hơn nhiều** so với 2 cái kia (kể cả trong production) vì độ phức tạp cao mà use case thực sự cần "số lượng thread động" khá hiếm. Nhưng phỏng vấn vẫn hay hỏi để kiểm tra bạn có đọc sâu hay không — trả lời được sự khác biệt là đủ ghi điểm, không cần thành thạo tuyệt đối.

## 5. Bảng quyết định tổng hợp — chọn synchronizer nào

| Tình huống | Chọn |
|---|---|
| Main thread đợi N worker hoàn thành 1 lần duy nhất | `CountDownLatch` |
| Cần "bắn súng lệnh" để nhiều thread cùng bắt đầu đồng thời (benchmark/test) | `CountDownLatch(1)` |
| N thread cần đồng bộ theo nhiều vòng lặp (round/phase) lặp lại, số lượng thread cố định | `CyclicBarrier` |
| Giới hạn số lượng thread truy cập đồng thời vào tài nguyên (connection pool, rate limiting) | `Semaphore` |
| Cần tín hiệu (signal) linh hoạt giữa các thread, không có khái niệm "chủ sở hữu" | `Semaphore` |
| Số lượng thread tham gia đồng bộ hóa **thay đổi động** trong lúc chạy | `Phaser` |

---

## 🧪 BÀI TẬP THỰC HÀNH

### Setup

```bash
cd ~/java-concurrency
mkdir nhom5 && cd nhom5
```

### Bài tập 1: `CountDownLatch` — mô phỏng "Application Startup" (use case thực tế rất hay gặp)

Kịch bản: 1 ứng dụng cần khởi động 4 service song song (Database, Cache, MessageQueue, ConfigServer) trước khi server chính sẵn sàng nhận request.

```java
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ThreadLocalRandom;

public class AppStartupLatch {
    public static void main(String[] args) throws InterruptedException {
        String[] services = {"Database", "Cache", "MessageQueue", "ConfigServer"};
        CountDownLatch latch = new CountDownLatch(services.length);

        long start = System.currentTimeMillis();

        for (String service : services) {
            new Thread(() -> {
                try {
                    int initTime = ThreadLocalRandom.current().nextInt(500, 3000);
                    System.out.println(service + " đang khởi động, dự kiến " + initTime + "ms...");
                    Thread.sleep(initTime);
                    System.out.println("✅ " + service + " đã sẵn sàng!");
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    latch.countDown();  // ⚠️ PHẢI trong finally - kể cả khi lỗi vẫn phải đếm
                }
            }).start();
        }

        System.out.println("Main thread: đang đợi tất cả service khởi động...");
        latch.await();  // TODO: bạn hãy thử thêm timeout version await(timeout, unit) ở bài tập phụ

        long duration = System.currentTimeMillis() - start;
        System.out.println("🚀 Server đã sẵn sàng nhận request sau " + duration + "ms!");
    }
}
```

**Yêu cầu:**
1. Chạy như trên — verify rằng `duration` gần bằng thời gian của service **chậm nhất** (không phải tổng cộng của cả 4) — vì chúng chạy song song
2. Sửa lại dùng `latch.await(1500, TimeUnit.MILLISECONDS)` (bản có timeout) — nếu 1 service khởi động quá 1.5s, in ra cảnh báo "⚠️ Timeout - có service khởi động chậm!" thay vì đợi vô thời hạn
3. **Bài tập nâng cao**: viết thêm phiên bản dùng `CountDownLatch(1)` làm "starting gate" — 5 client thread đều phải đợi ở `await()`, main thread `countDown()` để "thả" tất cả cùng lúc, mỗi client in ra `System.nanoTime()` ngay khi được thả — so sánh độ chênh lệch thời gian giữa các client (nên rất nhỏ, chứng minh chúng chạy gần như đồng thời).

### Bài tập 2: `CyclicBarrier` — mô phỏng tính toán theo Round (giống thuật toán song song thực tế)

Kịch bản: 4 "worker" tính tổng của 1 mảng lớn, chia mảng thành 4 phần, mỗi worker tính phần của mình, đợi nhau xong rồi mới chuyển sang "vòng gộp kết quả" (giả lập).

```java
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.atomic.AtomicInteger;

public class RoundBasedComputation {
    static final int WORKER_COUNT = 4;
    static int[] partialSums = new int[WORKER_COUNT];

    public static void main(String[] args) {
        AtomicInteger roundCounter = new AtomicInteger(0);

        CyclicBarrier barrier = new CyclicBarrier(WORKER_COUNT, () -> {
            // Chạy TRÊN 1 THREAD DUY NHẤT (thread cuối cùng tới barrier) khi đủ 4 worker
            int round = roundCounter.incrementAndGet();
            int total = 0;
            for (int s : partialSums) total += s;
            System.out.println("=== Sau round " + round + ": tổng hiện tại = " + total + " ===");
        });

        for (int i = 0; i < WORKER_COUNT; i++) {
            final int workerId = i;
            new Thread(() -> {
                for (int round = 1; round <= 3; round++) {
                    partialSums[workerId] = workerId * round; // giả lập tính toán 1 phần
                    System.out.println("Worker " + workerId + " xong round " + round + ", partial=" + partialSums[workerId]);
                    try {
                        barrier.await();
                    } catch (Exception e) { throw new RuntimeException(e); }
                }
            }).start();
        }
    }
}
```

**Yêu cầu:**
1. Chạy và quan sát: `barrierAction` (in "=== Sau round...") có chạy đúng **1 lần cho mỗi round**, sau khi CẢ 4 worker báo cáo xong không?
2. **Tái hiện `BrokenBarrierException`:** sửa 1 worker để nó `throw new RuntimeException()` ngẫu nhiên trước khi gọi `barrier.await()` (dùng `if (ThreadLocalRandom.current().nextInt(10) == 0) throw ...`) — verify các worker CÒN LẠI có bị `BrokenBarrierException` ngay lập tức không, dù chúng không hề lỗi gì.
3. Viết vào `answer.md`: giải thích tại sao thiết kế "lan truyền lỗi" này lại hợp lý về mặt logic cho use case tính toán theo round (gợi ý: nếu 1 worker chết mà các worker khác cứ đợi mãi thì sao?)

### Bài tập 3: `Semaphore` — mô phỏng giới hạn Connection Pool

```java
import java.util.concurrent.Semaphore;
import java.util.concurrent.ThreadLocalRandom;

public class ConnectionPoolSimulation {
    static final int MAX_CONNECTIONS = 3;
    static final Semaphore semaphore = new Semaphore(MAX_CONNECTIONS, true); // fair mode

    public static void main(String[] args) throws InterruptedException {
        for (int i = 1; i <= 10; i++) {
            final int clientId = i;
            new Thread(() -> useConnection(clientId)).start();
            Thread.sleep(100); // clients đến rải rác
        }
    }

    static void useConnection(int clientId) {
        try {
            System.out.println("Client " + clientId + " đang CHỜ connection... (available: " 
                + semaphore.availablePermits() + ")");
            semaphore.acquire();
            System.out.println("✅ Client " + clientId + " đã LẤY được connection!");

            int workTime = ThreadLocalRandom.current().nextInt(1000, 2000);
            Thread.sleep(workTime);

            System.out.println("Client " + clientId + " xong việc, TRẢ connection.");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            semaphore.release();
        }
    }
}
```

**Yêu cầu:**
1. Chạy và verify: tại bất kỳ thời điểm nào, **không bao giờ có quá 3 client** đồng thời "đã LẤY được connection" (đếm số dòng "✅ đã LẤY" chưa có "TRẢ connection" tương ứng)
2. Đổi `MAX_CONNECTIONS` xuống `1` — quan sát hành vi giống hệt 1 lock đơn giản
3. **Bài tập chứng minh "no ownership":** viết 1 đoạn code riêng, tạo `Semaphore(0)`, cho 1 thread B gọi `acquire()` (sẽ block vì permit=0), sau đó cho thread A (khác hẳn, chưa từng acquire) gọi `release()` — verify thread B được unblock ngay dù A chưa bao giờ "sở hữu" permit nào. Giải thích điểm khác biệt này so với `ReentrantLock` (nơi chỉ owner mới unlock được).

---

Nhóm 5 tương đối gọn, nên làm nhanh cũng được — quan trọng nhất là **bảng so sánh cuối cùng** (khi nào dùng cái nào), vì đây chính xác là dạng câu hỏi hay gặp: *"Cho tình huống X, bạn chọn CountDownLatch hay CyclicBarrier?"*. Làm xong gửi mình review, rồi mình dạy tiếp **Nhóm 6: ThreadPoolExecutor, rejection policy, cạm bẫy Executors, ForkJoinPool** — đây là nhóm cực kỳ hay bị hỏi ở vòng senior vì liên quan trực tiếp đến production issues.

## Assistant:

> 7/14/2026 14:26:55

> Chuẩn bị trình bày các chủ đề lập trình nâng cao.
>
> - Moving on to cover ThreadPoolExecutor, rejection policies, common Executors pitfalls, and ForkJoinPool.
> - **Done**

# Nhóm 6: Thread Pool & Executor Framework

Đây là nhóm **hay bị hỏi nhất ở vòng senior** vì liên quan trực tiếp production incidents (OOM, thread leak, rejection). Hiểu sâu nhóm này giúp bạn trả lời tốt cả câu hỏi lý thuyết lẫn "đã từng gặp bug gì về thread pool chưa?".

## 1. Tại sao cần Thread Pool thay vì tạo Thread trực tiếp?

Tạo `new Thread()` cho mỗi task có 3 vấn đề:
1. **Overhead tạo/hủy thread** — mỗi thread tốn ~1-2MB stack memory (mặc định) + chi phí OS-level tạo thread khá cao
2. **Không kiểm soát được số lượng** — hàng nghìn request đồng thời → hàng nghìn thread → context switch quá nhiều → hệ thống sập
3. **Không tái sử dụng được** — thread bị hủy ngay sau khi xong task, lần sau lại phải tạo mới từ đầu

Thread Pool giải quyết bằng cách: **tạo sẵn 1 nhóm thread, tái sử dụng chúng cho nhiều task liên tiếp**, và **giới hạn số lượng thread tối đa** để tránh quá tải hệ thống.

## 2. Các tham số của `ThreadPoolExecutor` — hiểu sâu từng cái

```java
public ThreadPoolExecutor(
    int corePoolSize,
    int maximumPoolSize,
    long keepAliveTime,
    TimeUnit unit,
    BlockingQueue<Runnable> workQueue,
    ThreadFactory threadFactory,
    RejectedExecutionHandler handler
)
```

### `corePoolSize` và `maximumPoolSize`

Đây là 2 tham số **hay bị hiểu sai nhất** — nhiều người nghĩ threadpool tạo thread mới ngay khi core đầy, nhưng thực tế phức tạp hơn.

### Thứ tự xử lý task thực sự bên trong (đây là điểm mấu chốt hay bị hỏi)

```
Task mới đến
     │
     ▼
1. Số thread hiện tại < corePoolSize?
     │
    CÓ → Tạo thread MỚI để chạy task ngay (dù có thread rảnh trong core cũng vẫn tạo mới cho đến khi đạt core)
     │
    KHÔNG
     │
     ▼
2. Queue (workQueue) còn chỗ trống?
     │
    CÓ → Đưa task VÀO QUEUE, đợi thread rảnh lấy ra xử lý (KHÔNG tạo thread mới)
     │
    KHÔNG (queue đầy)
     │
     ▼
3. Số thread hiện tại < maximumPoolSize?
     │
    CÓ → Tạo thread MỚI (vượt qua core, tiến tới max) để xử lý task này ngay
     │
    KHÔNG (đã đạt max, queue cũng đầy)
     │
     ▼
4. Áp dụng REJECTION POLICY (task bị từ chối)
```

**Điểm dễ nhầm nhất:** Nhiều người nghĩ pool sẽ **ưu tiên tạo thread lên đến max trước khi dùng queue** — SAI. Thực tế thứ tự là: **core threads → queue → thêm thread đến max → rejection**. Chỉ khi **queue đầy** thì pool mới tạo thêm thread vượt qua `corePoolSize`.

**Ví dụ minh họa cụ thể:**
```java
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    2,                                  // corePoolSize
    4,                                  // maximumPoolSize
    60, TimeUnit.SECONDS,               // keepAliveTime
    new ArrayBlockingQueue<>(2),        // queue capacity = 2
    new ThreadPoolExecutor.AbortPolicy()
);

// Task 1 đến → thread count (0 < 2 core) → TẠO thread mới #1
// Task 2 đến → thread count (1 < 2 core) → TẠO thread mới #2
// Task 3 đến → thread count = 2 = core, không < core → thử vào QUEUE → queue có chỗ (0/2) → VÀO QUEUE
// Task 4 đến → tương tự → VÀO QUEUE (2/2, queue giờ ĐẦY)
// Task 5 đến → thread count (2 < 4 max) → queue đã đầy → TẠO thread mới #3 (vượt core)
// Task 6 đến → thread count (3 < 4 max) → queue đầy → TẠO thread mới #4 (đạt max)
// Task 7 đến → thread count = 4 = max, queue đầy → REJECTION xảy ra!
```

### `keepAliveTime`

Thời gian 1 thread **vượt quá corePoolSize** (tức là thread "thừa" được tạo thêm khi queue đầy) được phép **idle** (không có task) trước khi bị hủy để giải phóng resource. Mặc định chỉ áp dụng cho thread ngoài core; muốn áp dụng cả cho core threads (cho phép core thread cũng bị hủy khi idle) thì gọi thêm `allowCoreThreadTimeOut(true)`.

### `workQueue` — quyết định hành vi rất lớn

Loại queue chọn ảnh hưởng trực tiếp đến khi nào thread mới được tạo (như phân tích ở trên) — đây chính là lý do `Executors.newFixedThreadPool` nguy hiểm (sẽ phân tích kỹ ở mục 4).

## 3. 4 chính sách Rejection — khi pool quá tải

Khi cả `maximumPoolSize` đạt max VÀ queue đầy, `RejectedExecutionHandler` được gọi:

| Policy | Hành vi | Use case |
|---|---|---|
| **`AbortPolicy`** (mặc định) | Throw `RejectedExecutionException` ngay lập tức | Muốn biết ngay khi hệ thống quá tải, xử lý lỗi rõ ràng ở tầng gọi |
| **`CallerRunsPolicy`** | Task được chạy **trực tiếp trên thread đang gọi `submit()`** (không phải thread trong pool) | **Cơ chế "tự động throttle"** — vì thread gọi bị chiếm dụng để chạy task, nó **không thể submit task mới** trong lúc đó → tự nhiên làm chậm tốc độ tạo task mới, giảm áp lực lên pool |
| **`DiscardPolicy`** | **Âm thầm bỏ task**, không throw exception, không log gì cả | Chấp nhận mất task không quan trọng (ví dụ: metrics/logging không critical) — **cẩn thận vì dễ debug nhầm khi task "biến mất" không rõ lý do** |
| **`DiscardOldestPolicy`** | Bỏ task **cũ nhất đang nằm trong queue** (đầu queue), rồi thử submit task mới vào | Ưu tiên task mới hơn task cũ (ví dụ: real-time data, task cũ đã lỗi thời không cần xử lý nữa) |

### Giải thích sâu `CallerRunsPolicy` (hay được hỏi nhất vì cơ chế "tự động" khá tinh tế)

```java
ExecutorService executor = new ThreadPoolExecutor(
    2, 2, 0, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(2),
    new ThreadPoolExecutor.CallerRunsPolicy()
);

// Main thread liên tục submit task
for (int i = 0; i < 100; i++) {
    executor.submit(() -> heavyWork());
    // Khi pool quá tải (2 thread bận, queue đầy 2), 
    // task thứ 5 trở đi sẽ CHẠY TRỰC TIẾP TRÊN MAIN THREAD (blocking main thread)
    // → main thread bị "khựng lại" để tự chạy heavyWork()
    // → main thread KHÔNG THỂ submit task thứ 6 cho đến khi heavyWork() (task 5) xong
    // → Đây chính là cơ chế BACKPRESSURE tự nhiên
}
```

**Câu trả lời mẫu:** *"CallerRunsPolicy không throw exception hay drop task, mà 'trừng phạt' thread đang submit task bằng cách bắt nó tự chạy task đó. Đây tạo ra backpressure tự nhiên — vì thread submit bị bận chạy task, nó không thể tiếp tục dồn thêm task mới vào hệ thống, giúp pool có thời gian 'thở' và xử lý bớt hàng đợi hiện tại."*

Có thể tùy chỉnh Rejection Handler riêng bằng cách implement interface `RejectedExecutionHandler` — ví dụ log + gửi alert + retry sau X giây, thường gặp trong hệ thống production thực tế.

## 4. Cạm bẫy `Executors.newFixedThreadPool` — OOM kinh điển

Đây là câu hỏi **must-know** cho senior. `Executors` class cung cấp các factory method tiện lợi, nhưng ẩn chứa bẫy nghiêm trọng.

### Nhìn vào implementation thực tế

```java
public static ExecutorService newFixedThreadPool(int nThreads) {
    return new ThreadPoolExecutor(
        nThreads, nThreads,             // core = max = nThreads
        0L, TimeUnit.MILLISECONDS,
        new LinkedBlockingQueue<Runnable>()   // ⚠️ KHÔNG truyền capacity → mặc định Integer.MAX_VALUE!
    );
}
```

**Vấn đề:** `LinkedBlockingQueue` không giới hạn capacity nghĩa là **queue = unbounded (≈2 tỷ phần tử)**. Kết hợp với logic xử lý task ở mục 2 (core đầy → vào queue trước khi tạo thread mới), hệ quả là:

```
Nếu tốc độ SUBMIT task > tốc độ XỬ LÝ task:
   → Thread count đạt corePoolSize (= maximumPoolSize, vì fixed) rồi DỪNG LẠI, KHÔNG BAO GIỜ TẠO THÊM
   → Queue KHÔNG BAO GIỜ ĐẦY (vì unbounded) → không bao giờ trigger rejection
   → Task cứ dồn vào queue MÃI MÃI, mỗi task chiếm ít nhất vài chục byte (object reference + Runnable instance)
   → Sau hàng triệu task tồn đọng → OutOfMemoryError: Java heap space
```

**Tại sao nguy hiểm hơn OOM thông thường?** Vì hệ thống **không hề báo lỗi hay throttle sớm** — nó cứ âm thầm nhận task, hoạt động "bình thường" (không throw exception nào), cho đến khi memory cạn kiệt đột ngột — rất khó phát hiện sớm trong môi trường production nếu không có monitoring queue size.

`Executors.newSingleThreadExecutor()` và `Executors.newCachedThreadPool()` cũng có vấn đề tương tự hoặc khác:

| Factory method | Vấn đề tiềm ẩn |
|---|---|
| `newFixedThreadPool(n)` | Queue unbounded → OOM nếu submit nhanh hơn xử lý |
| `newSingleThreadExecutor()` | Tương tự (chỉ 1 thread, queue unbounded) → OOM |
| `newCachedThreadPool()` | `maximumPoolSize = Integer.MAX_VALUE`, dùng `SynchronousQueue` (không buffer) → nếu task đến ồ ạt, **tạo thread mới KHÔNG GIỚI HẠN** → cũng OOM nhưng theo hướng khác (quá nhiều thread thay vì quá nhiều task trong queue) |
| `newScheduledThreadPool(n)` | Tương tự fixed, dùng `DelayedWorkQueue` cũng có thể phình to |

### Best practice: LUÔN tự tạo `ThreadPoolExecutor` tường minh trong production

```java
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    10,                                    // corePoolSize - dựa trên tải trung bình
    20,                                    // maximumPoolSize - dựa trên tải đỉnh
    60L, TimeUnit.SECONDS,                 // keepAliveTime cho thread thừa
    new ArrayBlockingQueue<>(500),         // ✅ BOUNDED queue - giới hạn rõ ràng
    new ThreadFactoryBuilder().setNameFormat("worker-%d").build(),  // đặt tên thread để dễ debug
    new ThreadPoolExecutor.CallerRunsPolicy()  // ✅ Có chiến lược rõ ràng khi quá tải, không để mặc định Abort gây crash bất ngờ
);
```

Với JDK 21+ có `Executors.newVirtualThreadPerTaskExecutor()` (Nhóm 9) giải quyết vấn đề khác hẳn — nhưng với **platform thread** truyền thống, luôn phải tự cấu hình bounded queue.

## 5. `ForkJoinPool` & Work Stealing

### Vấn đề `ForkJoinPool` giải quyết: Divide-and-Conquer song song

`ForkJoinPool` được thiết kế cho bài toán có thể **chia nhỏ đệ quy** (fork) thành các subtask độc lập, xử lý song song, rồi **gộp kết quả** (join) — ví dụ: sort mảng lớn, tính tổng cây, xử lý ảnh theo block.

```java
class SumTask extends RecursiveTask<Long> {
    private final int[] array;
    private final int start, end;
    private static final int THRESHOLD = 1000;

    protected Long compute() {
        if (end - start <= THRESHOLD) {
            long sum = 0;
            for (int i = start; i < end; i++) sum += array[i];
            return sum;                          // base case - tính trực tiếp
        }
        int mid = (start + end) / 2;
        SumTask left = new SumTask(array, start, mid);
        SumTask right = new SumTask(array, mid, end);
        left.fork();                              // giao subtask trái cho thread khác xử lý song song
        long rightResult = right.compute();        // subtask phải tính trên chính thread này
        long leftResult = left.join();              // đợi kết quả subtask trái
        return leftResult + rightResult;
    }
}

ForkJoinPool pool = new ForkJoinPool();  // mặc định số thread = số CPU core
long total = pool.invoke(new SumTask(bigArray, 0, bigArray.length));
```

### Cơ chế Work Stealing — điểm khác biệt cốt lõi so với `ThreadPoolExecutor` thường

**Vấn đề của thread pool thường:** dùng **1 queue chung** cho tất cả thread — nếu 1 task lớn "đẻ" ra nhiều subtask nhỏ, tất cả subtask đều dồn vào **cùng 1 hàng đợi**, tạo ra **tranh chấp (contention)** khi nhiều thread cùng cố lấy task từ đó.

**Work Stealing giải quyết:**

```
Mỗi thread trong ForkJoinPool có 1 DEQUE (double-ended queue) RIÊNG:

Thread 1: [T1a, T1b, T1c] ← Thread 1 lấy/đẩy task từ ĐUÔI (LIFO - local access)
Thread 2: [T2a, T2b]      
Thread 3: []               ← Thread 3 đang RẢNH (deque rỗng)
Thread 4: [T4a, T4b, T4c, T4d]

→ Thread 3 rảnh sẽ "STEAL" (lấy trộm) task từ ĐẦU deque của thread khác (ví dụ Thread 4)
  vì Thread 4 tự lấy task của mình từ ĐUÔI, Thread 3 lấy trộm từ ĐẦU
  → GIẢM tranh chấp (2 đầu khác nhau của deque), tăng tận dụng CPU
```

**Tại sao lấy từ đuôi (owner) và đầu (thief) khác nhau lại quan trọng?**
- Owner thread lấy task **mới fork gần nhất** (đuôi) — theo nguyên lý **LIFO**, tận dụng tốt **cache locality** (task vừa tạo còn "nóng" trong cache CPU)
- Thief thread lấy task **cũ nhất, lớn nhất thường có** (đầu) — theo nguyên lý **FIFO** từ góc nhìn thief, giảm khả năng phải "steal" liên tục vì lấy được task lớn hơn (nhiều subtask con hơn để tự chia tiếp)

**Kết quả:** CPU core nào rảnh sẽ tự động "mượn việc" từ core khác đang bận, giúp cân bằng tải tự động mà không cần điều phối tập trung — đây là lý do `ForkJoinPool` **hiệu quả hơn nhiều** cho bài toán chia để trị so với `ThreadPoolExecutor` thường.

### `ForkJoinPool.commonPool()` — con dao 2 lưỡi

`Stream.parallel()`, `CompletableFuture` (nếu không chỉ định executor riêng) đều dùng chung `ForkJoinPool.commonPool()` — 1 pool **dùng chung cho toàn bộ JVM**, kích thước mặc định = `số CPU core - 1`.

**Vấn đề:** nếu 1 nơi trong code chạy task **blocking I/O** (gọi network, đọc file...) trên common pool, nó sẽ **chiếm dụng** 1 trong số ít thread đó, làm giảm khả năng xử lý song song của **toàn bộ ứng dụng**, kể cả những chỗ code khác không liên quan cũng dùng `parallelStream()`. Đây là lý do quan trọng dẫn tới Nhóm 7 (`CompletableFuture` nên dùng executor riêng cho tác vụ I/O).

---

## 📊 Bảng tổng hợp Executors factory methods (bạn nên thuộc để trả lời nhanh)

| Factory method | corePoolSize | maxPoolSize | Queue | Rủi ro chính |
|---|---|---|---|---|
| `newFixedThreadPool(n)` | n | n | Unbounded LinkedBlockingQueue | OOM nếu submit nhanh hơn xử lý |
| `newSingleThreadExecutor()` | 1 | 1 | Unbounded LinkedBlockingQueue | Tương tự, + không song song được gì |
| `newCachedThreadPool()` | 0 | Integer.MAX_VALUE | SynchronousQueue (0 buffer) | Tạo vô hạn thread nếu tải cao → OOM kiểu khác |
| `newScheduledThreadPool(n)` | n | Integer.MAX_VALUE | DelayedWorkQueue | Có thể phình to tương tự |
| Tự tạo `ThreadPoolExecutor` | tùy chỉnh | tùy chỉnh | **Bounded** (khuyến nghị) | Kiểm soát được, nhưng phải tự tính toán đúng |

---

## 🧪 BÀI TẬP THỰC HÀNH

### Setup

```bash
cd ~/java-concurrency
mkdir nhom6 && cd nhom6
```

### Bài tập 1: Quan sát trực tiếp thứ tự "core → queue → max → reject"

Tạo file `ThreadPoolOrderObserver.java`:

```java
import java.util.concurrent.*;

public class ThreadPoolOrderObserver {
    public static void main(String[] args) throws InterruptedException {
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
            2, 4, 5, TimeUnit.SECONDS,
            new ArrayBlockingQueue<>(2),
            new ThreadPoolExecutor.AbortPolicy()
        );

        for (int i = 1; i <= 8; i++) {
            final int taskId = i;
            try {
                executor.submit(() -> {
                    System.out.println("Task " + taskId + " đang chạy trên " + Thread.currentThread().getName());
                    try { Thread.sleep(3000); } catch (InterruptedException ignored) {}
                });
                System.out.println("Submit task " + taskId + " OK. PoolSize=" + executor.getPoolSize() 
                    + ", QueueSize=" + executor.getQueue().size() + ", Active=" + executor.getActiveCount());
            } catch (RejectedExecutionException e) {
                System.out.println("❌ Task " + taskId + " BỊ TỪ CHỐI! PoolSize=" + executor.getPoolSize() 
                    + ", QueueSize=" + executor.getQueue().size());
            }
            Thread.sleep(100);
        }

        executor.shutdown();
    }
}
```

**Yêu cầu:**
1. Chạy và ghi lại **chính xác task nào** rơi vào core-thread-mới, task nào vào queue, task nào trigger tạo thread vượt core, task nào bị reject
2. Đối chiếu với sơ đồ lý thuyết ở mục 2 — verify đúng thứ tự: 2 task đầu tạo thread core, 2 task tiếp vào queue (đầy), 2 task tiếp tạo thread lên max=4, 2 task cuối bị reject
3. Đổi `RejectedExecutionHandler` thành `CallerRunsPolicy` — chạy lại, quan sát: task bị "reject" giờ chạy ở đâu? In `Thread.currentThread().getName()` ngay trong task để verify nó chạy trên **main thread** chứ không phải pool thread.

### Bài tập 2: Tái hiện OOM của `Executors.newFixedThreadPool` (mô phỏng an toàn, không thực sự crash máy)

Tạo file `FixedThreadPoolOOMDemo.java`:

```java
import java.util.concurrent.*;

public class FixedThreadPoolOOMDemo {
    public static void main(String[] args) throws InterruptedException {
        ExecutorService executor = Executors.newFixedThreadPool(2);

        // Giả lập: submit RẤT NHANH, mỗi task xử lý CHẬM
        for (int i = 0; i < 500_000; i++) {
            final int taskId = i;
            executor.submit(() -> {
                try { Thread.sleep(10); } catch (InterruptedException ignored) {}
            });

            if (i % 50_000 == 0) {
                if (executor instanceof ThreadPoolExecutor tpe) {
                    System.out.println("Đã submit " + i + " task. Queue size hiện tại: " + tpe.getQueue().size());
                }
            }
        }

        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.MINUTES);
        System.out.println("Hoàn thành (nếu không OOM trước đó).");
    }
}
```

**Yêu cầu:**
1. Chạy với giới hạn heap nhỏ để dễ quan sát: `java -Xmx100m FixedThreadPoolOOMDemo.java`
2. Quan sát log "Queue size hiện tại" — verify nó **tăng liên tục, không dừng lại**, cho đến khi có thể xảy ra `OutOfMemoryError`
3. **Sửa lại thành bounded queue tự tạo** (dùng `ThreadPoolExecutor` tường minh với `ArrayBlockingQueue(1000)` + `CallerRunsPolicy`), chạy lại với cùng heap limit — verify không còn bị OOM (vì có backpressure tự nhiên làm chậm việc submit).
4. Viết vào `answer.md`: giải thích bằng chính con số bạn đo được, tại sao "Queue size cứ tăng" lại là dấu hiệu rõ ràng nhất để phát hiện bug này trong môi trường production (gợi ý: bạn sẽ theo dõi metric nào qua JMX/Micrometer trong hệ thống thật?)

### Bài tập 3: So sánh `ThreadPoolExecutor` thường vs `ForkJoinPool` cho bài toán chia để trị

Viết bài toán: tính tổng của mảng 50 triệu phần tử `long`, so sánh 3 cách:

```java
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;

public class SumComparisonDemo {
    static final int SIZE = 50_000_000;
    static final int THRESHOLD = 100_000;

    static class SumTask extends RecursiveTask<Long> {
        int[] array; int start, end;
        SumTask(int[] array, int start, int end) { this.array = array; this.start = start; this.end = end; }

        protected Long compute() {
            if (end - start <= THRESHOLD) {
                long sum = 0;
                for (int i = start; i < end; i++) sum += array[i];
                return sum;
            }
            int mid = (start + end) / 2;
            SumTask left = new SumTask(array, start, mid);
            SumTask right = new SumTask(array, mid, end);
            left.fork();
            long rightResult = right.compute();
            long leftResult = left.join();
            return leftResult + rightResult;
        }
    }

    public static void main(String[] args) throws Exception {
        int[] array = new int[SIZE];
        for (int i = 0; i < SIZE; i++) array[i] = 1; // để dễ verify: tổng phải = SIZE

        // Cách 1: single thread tuần tự
        long start1 = System.nanoTime();
        long sum1 = 0;
        for (int x : array) sum1 += x;
        System.out.println("Sequential: " + (System.nanoTime() - start1) / 1_000_000 + "ms, sum=" + sum1);

        // Cách 2: ForkJoinPool
        long start2 = System.nanoTime();
        ForkJoinPool fjPool = new ForkJoinPool();
        long sum2 = fjPool.invoke(new SumTask(array, 0, array.length));
        System.out.println("ForkJoinPool: " + (System.nanoTime() - start2) / 1_000_000 + "ms, sum=" + sum2);

        // Cách 3: parallelStream (thực chất dùng common ForkJoinPool bên dưới)
        long start3 = System.nanoTime();
        long sum3 = java.util.Arrays.stream(array).parallel().asLongStream().sum();
        System.out.println("parallelStream: " + (System.nanoTime() - start3) / 1_000_000 + "ms, sum=" + sum3);
    }
}
```

**Yêu cầu:**
1. Chạy và so sánh thời gian 3 cách — verify `ForkJoinPool` và `parallelStream` đều nhanh hơn sequential đáng kể (thường 2-4x tùy số core máy bạn)
2. Thử đổi `THRESHOLD` xuống rất nhỏ (`100`) — chạy lại, quan sát: có nhanh hơn không hay lại CHẬM hơn? Giải thích tại sao (gợi ý: overhead của việc tạo quá nhiều task nhỏ so với lợi ích song song hóa)
3. Kiểm tra `Runtime.getRuntime().availableProcessors()` trên máy bạn, so sánh với tốc độ tăng tốc thực tế đo được — có tỷ lệ thuận không?

---

Bài tập 2 là bài **quan trọng nhất và thực tế nhất** của cả khóa học này — nó chính là loại bug đã gây sập không ít hệ thống production thật. Làm kỹ bài này, bạn sẽ trả lời cực tốt câu hỏi "Bạn đã từng gặp production issue nào về threading chưa? Xử lý thế nào?" — 1 câu hỏi gần như chắc chắn sẽ gặp ở phỏng vấn senior.

Làm xong gửi mình review, rồi mình dạy tiếp **Nhóm 7: CompletableFuture — pipeline, xử lý lỗi, executor riêng**.

## Assistant:

> 7/14/2026 14:31:19

# Nhóm 7: Lập trình bất đồng bộ hiện đại — CompletableFuture

`CompletableFuture` (Java 8+) giải quyết vấn đề lớn nhất của `Future` cũ: **`Future.get()` block hoàn toàn**, không có cách nào compose (nối chuỗi) nhiều tác vụ bất đồng bộ, không xử lý lỗi linh hoạt được. `CompletableFuture` implement cả `Future` và `CompletionStage` — cho phép xây dựng **pipeline bất đồng bộ non-blocking**.

## 1. Vấn đề của `Future` cũ (để hiểu tại sao CompletableFuture ra đời)

```java
ExecutorService executor = Executors.newFixedThreadPool(2);
Future<Integer> future = executor.submit(() -> computeValue());

// ❌ Muốn xử lý kết quả tiếp theo, PHẢI block:
Integer result = future.get();   // BLOCK thread hiện tại cho đến khi xong
processResult(result);            // chỉ chạy sau khi block xong

// ❌ Không có cách nào "đăng ký callback" để tự động chạy khi future xong
// ❌ Không có cách nào compose 2 future với nhau (future A xong rồi mới chạy future B dùng kết quả A)
// ❌ Xử lý exception thô sơ, phải try-catch quanh get()
```

`CompletableFuture` giải quyết bằng **callback-based, non-blocking, composable API**.

## 2. Tạo `CompletableFuture` — các cách khởi tạo

```java
// Chạy task có kết quả trả về (dùng ForkJoinPool.commonPool() mặc định)
CompletableFuture<Integer> cf1 = CompletableFuture.supplyAsync(() -> computeValue());

// Chạy task KHÔNG có kết quả trả về (Runnable)
CompletableFuture<Void> cf2 = CompletableFuture.runAsync(() -> doSomething());

// Tạo future đã có sẵn giá trị (không cần thread nào cả, dùng để test hoặc default value)
CompletableFuture<Integer> cf3 = CompletableFuture.completedFuture(42);

// Tự hoàn thành thủ công (dùng khi tích hợp với callback API cũ, ví dụ non-blocking I/O framework)
CompletableFuture<Integer> cf4 = new CompletableFuture<>();
// ... ở đâu đó khác trong code, khi có kết quả:
cf4.complete(100);
```

## 3. Pipeline — 3 nhóm method chính (phần hay bị hỏi nhất)

### Nhóm A: Transform kết quả — `thenApply` / `thenAccept` / `thenRun`

Khác biệt về **input/output** — đây là điểm dễ nhầm lẫn cần nhớ rõ:

| Method | Input | Output | Dùng khi nào |
|---|---|---|---|
| `thenApply(Function<T,R>)` | Nhận kết quả T | Trả về R (transform) | Muốn biến đổi giá trị, tiếp tục pipeline |
| `thenAccept(Consumer<T>)` | Nhận kết quả T | Không trả gì (`CompletableFuture<Void>`) | Chỉ cần "tiêu thụ" kết quả (ví dụ in ra, lưu DB), không cần giá trị mới |
| `thenRun(Runnable)` | **Không nhận** kết quả gì cả | Không trả gì | Chỉ cần biết "đã xong", không quan tâm giá trị là gì |

```java
CompletableFuture.supplyAsync(() -> 10)
    .thenApply(x -> x * 2)           // 10 -> 20, TIẾP TỤC pipeline với giá trị mới
    .thenAccept(x -> System.out.println("Kết quả: " + x))  // in ra 20, pipeline giờ là Void
    .thenRun(() -> System.out.println("Hoàn tất!"));         // không quan tâm giá trị, chỉ biết đã xong
```

### Nhóm B: Compose 2 future độc lập — `thenCombine`

Dùng khi có **2 tác vụ bất đồng bộ chạy song song, độc lập với nhau**, và bạn cần **gộp kết quả** của cả 2 lại:

```java
CompletableFuture<Integer> priceFuture = CompletableFuture.supplyAsync(() -> fetchPrice());
CompletableFuture<Double> discountFuture = CompletableFuture.supplyAsync(() -> fetchDiscountRate());

CompletableFuture<Double> finalPrice = priceFuture.thenCombine(
    discountFuture,
    (price, discount) -> price * (1 - discount)  // chạy khi CẢ 2 future đều xong
);
```

**Điểm quan trọng:** `priceFuture` và `discountFuture` chạy **song song thực sự** (2 thread khác nhau), `thenCombine` chỉ block/callback khi **cả 2 đều hoàn thành**.

### Nhóm C: Chuỗi tác vụ phụ thuộc — `thenCompose` (khác biệt lớn nhất, hay bị hỏi nhất)

Đây là câu hỏi phân biệt **`thenApply` vs `thenCompose`** — tương tự khái niệm `map` vs `flatMap` trong Stream/Optional.

```java
// ❌ Dùng thenApply khi hàm bên trong trả về CHÍNH CompletableFuture -> bị LỒNG NHAU (nested)
CompletableFuture<CompletableFuture<User>> nested = 
    CompletableFuture.supplyAsync(() -> getUserId())
        .thenApply(userId -> fetchUserAsync(userId));  // fetchUserAsync() trả về CompletableFuture<User>
        // Kết quả: CompletableFuture<CompletableFuture<User>> -- rất khó dùng, phải get().get()

// ✅ Dùng thenCompose để "làm phẳng" (flatten) kết quả
CompletableFuture<User> flat = 
    CompletableFuture.supplyAsync(() -> getUserId())
        .thenCompose(userId -> fetchUserAsync(userId));  // TỰ ĐỘNG unwrap, kết quả CompletableFuture<User>
```

**Quy tắc chọn:** hàm callback trả về **giá trị thường** → `thenApply`. Hàm callback trả về **`CompletableFuture` khác** (thường là gọi 1 async method khác) → `thenCompose`. Đây chính là use case **chuỗi các lời gọi async phụ thuộc lẫn nhau**:

```java
// Kịch bản thực tế: lấy user -> lấy order của user đó -> lấy chi tiết sản phẩm trong order
CompletableFuture<List<ProductDetail>> pipeline = 
    fetchUserAsync(userId)                              // CompletableFuture<User>
        .thenCompose(user -> fetchOrdersAsync(user.getId()))   // CompletableFuture<List<Order>>
        .thenCompose(orders -> fetchProductDetailsAsync(orders)); // CompletableFuture<List<ProductDetail>>
```

### `allOf` / `anyOf` — chờ nhiều future cùng lúc

```java
CompletableFuture<Void> all = CompletableFuture.allOf(cf1, cf2, cf3);  
// Hoàn thành khi TẤT CẢ future xong. Lưu ý: trả về Void, phải tự get() từng cái nếu cần kết quả

all.thenRun(() -> {
    int r1 = cf1.join();  // join() giống get() nhưng không throw checked exception
    int r2 = cf2.join();
    int r3 = cf3.join();
    System.out.println("Tổng: " + (r1 + r2 + r3));
});

CompletableFuture<Object> any = CompletableFuture.anyOf(cf1, cf2, cf3);
// Hoàn thành ngay khi CÓ 1 future BẤT KỲ xong trước (dùng cho race giữa nhiều nguồn, lấy cái nào nhanh nhất)
```

## 4. Xử lý lỗi — `exceptionally`, `handle`, `whenComplete` (rất hay bị nhầm lẫn)

Đây là phần **quan trọng nhất** của Nhóm 7 khi phỏng vấn — phải phân biệt rõ 3 method này.

### `exceptionally` — chỉ xử lý khi CÓ lỗi, giống catch

```java
CompletableFuture<Integer> cf = CompletableFuture.supplyAsync(() -> {
    if (someCondition) throw new RuntimeException("Lỗi!");
    return 10;
}).exceptionally(ex -> {
    System.out.println("Bắt được lỗi: " + ex.getMessage());
    return -1;   // giá trị FALLBACK khi có lỗi — pipeline TIẾP TỤC với giá trị này
});
// Nếu KHÔNG có lỗi, exceptionally() KHÔNG chạy, pipeline giữ nguyên giá trị gốc (10)
```

### `handle` — LUÔN chạy dù có lỗi hay không, nhận cả 2 tham số (result, exception)

```java
CompletableFuture<Integer> cf = CompletableFuture.supplyAsync(() -> {
    if (someCondition) throw new RuntimeException("Lỗi!");
    return 10;
}).handle((result, ex) -> {
    if (ex != null) {
        System.out.println("Có lỗi: " + ex.getMessage());
        return -1;
    }
    return result * 2;   // Không lỗi -> xử lý bình thường
});
// handle() LUÔN được gọi, result hoặc ex sẽ có 1 cái null tùy trường hợp
```

### `whenComplete` — giống `handle` (luôn chạy) nhưng KHÔNG thay đổi được kết quả pipeline

```java
CompletableFuture<Integer> cf = CompletableFuture.supplyAsync(() -> {
    if (someCondition) throw new RuntimeException("Lỗi!");
    return 10;
}).whenComplete((result, ex) -> {
    if (ex != null) {
        System.out.println("Log lỗi: " + ex.getMessage());
    } else {
        System.out.println("Log thành công: " + result);
    }
    // ⚠️ KHÔNG có return -> KHÔNG thể thay đổi giá trị pipeline
    // Nếu ban đầu có exception, sau whenComplete pipeline VẪN throw exception đó khi get()!
});
```

### Bảng so sánh 3 method (đây chính là bảng nên thuộc để trả lời phỏng vấn)

| Method | Chạy khi nào | Nhận tham số | Có thể đổi kết quả pipeline? | Dùng khi nào |
|---|---|---|---|---|
| `exceptionally` | **Chỉ khi có lỗi** | `Throwable` | ✅ Có (trả về fallback value) | Chỉ cần fallback value khi lỗi, không cần logic khi thành công |
| `handle` | **Luôn luôn** | `(result, Throwable)` | ✅ Có | Cần xử lý khác nhau cho cả 2 trường hợp VÀ transform kết quả |
| `whenComplete` | **Luôn luôn** | `(result, Throwable)` | ❌ Không (chỉ side-effect) | Chỉ cần logging/side-effect (metrics, cleanup), không cần đổi giá trị |

**Bẫy hay gặp:** nghĩ rằng `whenComplete` có thể "nuốt" exception giống `exceptionally` — **SAI**. Nếu pipeline có lỗi, dùng `whenComplete` xong thì `get()`/`join()` sau đó **vẫn throw exception** đó, vì `whenComplete` chỉ để quan sát (side-effect), không "xử lý" lỗi theo nghĩa dừng việc lan truyền.

```java
CompletableFuture<Integer> cf = CompletableFuture.supplyAsync(() -> { throw new RuntimeException("Boom"); })
    .whenComplete((r, ex) -> System.out.println("Đã log lỗi"));

cf.get();  // ⚠️ VẪN throw ExecutionException (bọc RuntimeException("Boom") bên trong)
           // dù đã "whenComplete" — vì whenComplete KHÔNG xử lý/nuốt lỗi
```

### Kết hợp nhiều method trong 1 pipeline (thực tế production hay thấy)

```java
CompletableFuture.supplyAsync(() -> fetchDataFromAPI())
    .thenApply(data -> transformData(data))
    .exceptionally(ex -> {
        log.error("API call failed", ex);
        return getDefaultData();          // fallback
    })
    .thenApply(data -> enrichData(data))   // chạy tiếp dù có lỗi hay không (vì exceptionally đã fallback)
    .whenComplete((result, ex) -> {
        metricsRecorder.record("pipeline_duration", ...);   // luôn ghi metrics, không quan tâm kết quả
    });
```

## 5. Chạy task trên Executor riêng để tránh nghẽn ForkJoin common pool

### Vấn đề: mặc định `CompletableFuture` dùng `ForkJoinPool.commonPool()`

```java
CompletableFuture.supplyAsync(() -> {
    return httpClient.get("https://slow-api.example.com/data");  // ⚠️ blocking I/O call
});
// Task này chạy trên ForkJoinPool.commonPool() — pool DÙNG CHUNG toàn JVM
// Nếu nhiều nơi khác trong ứng dụng cũng dùng parallelStream() hoặc CompletableFuture mặc định,
// TẤT CẢ đều tranh chấp cùng 1 pool có kích thước giới hạn (= số CPU core - 1)
```

**Hậu quả thực tế:** nếu bạn có 1 API endpoint gọi HTTP tới service khác (I/O-bound, có thể mất 500ms-2s), và pool chỉ có ví dụ 7 thread (8 core máy chủ), thì chỉ cần **7 request đồng thời** là đã **chiếm hết toàn bộ common pool** — mọi chỗ khác trong ứng dụng dùng `parallelStream()` hoặc `CompletableFuture` mặc định đều bị **đói thread**, dù logic đó hoàn toàn không liên quan tới API call kia.

### Giải pháp: luôn truyền Executor riêng cho I/O-bound task

```java
ExecutorService ioExecutor = new ThreadPoolExecutor(
    20, 50, 60, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(200),
    new ThreadPoolExecutor.CallerRunsPolicy()
);

CompletableFuture.supplyAsync(() -> {
    return httpClient.get("https://slow-api.example.com/data");
}, ioExecutor);   // ✅ TRUYỀN EXECUTOR RIÊNG — cách ly khỏi common pool

// Tương tự với các method then*, LUÔN có phiên bản "Async" nhận thêm Executor:
cf.thenApplyAsync(x -> transform(x), customExecutor);
cf.thenComposeAsync(x -> callAnotherAsync(x), customExecutor);
```

### Bẫy quan trọng: khác biệt giữa `thenApply` và `thenApplyAsync` (không executor)

```java
cf.thenApply(x -> transform(x));         
// Chạy trên THREAD NÀO ĐÓ ĐÃ HOÀN THÀNH cf trước đó (có thể là thread gọi complete(), 
// hoặc nếu cf đã complete rồi thì chạy NGAY trên thread hiện tại gọi thenApply - không tạo thread mới)

cf.thenApplyAsync(x -> transform(x));    
// LUÔN LUÔN submit vào ForkJoinPool.commonPool() để chạy (dù cf đã complete hay chưa)

cf.thenApplyAsync(x -> transform(x), customExecutor);
// LUÔN LUÔN submit vào customExecutor
```

**Điểm hay bị hỏi:** `thenApply` (không Async) **KHÔNG đảm bảo chạy trên thread nào cố định** — nó phụ thuộc vào timing (nếu future đã complete trước khi gọi `thenApply`, code chạy ngay trên caller thread; nếu chưa, nó chạy trên thread mà sau này gọi `complete()`). Đây là hành vi khó dự đoán, nên trong code production nghiêm túc, **luôn nên dùng bản `Async` + chỉ định executor rõ ràng** để kiểm soát chắc chắn task chạy ở đâu.

### Nguyên tắc chia tách Executor theo loại task (best practice)

| Loại task | Executor nên dùng |
|---|---|
| CPU-bound (tính toán nặng, không I/O) | `ForkJoinPool.commonPool()` mặc định là ổn (được thiết kế cho việc này) |
| I/O-bound (HTTP call, DB query, file I/O) | **Executor riêng**, kích thước lớn hơn số CPU core (vì thread đợi I/O không dùng CPU) |
| Mix cả 2 loại trong cùng ứng dụng | **Bắt buộc tách riêng 2 pool**, không share — tránh 1 loại "đói" thread vì loại kia chiếm dụng |

---

## 📊 Bảng tổng hợp toàn bộ method quan trọng (để ôn nhanh trước phỏng vấn)

| Method | Mục đích |
|---|---|
| `supplyAsync(Supplier)` / `runAsync(Runnable)` | Khởi tạo task bất đồng bộ |
| `thenApply(Function)` | Transform kết quả, trả về giá trị mới |
| `thenAccept(Consumer)` | Tiêu thụ kết quả, không trả gì |
| `thenRun(Runnable)` | Chạy khi xong, không cần biết kết quả |
| `thenCompose(Function trả về CF)` | Chuỗi 2 async phụ thuộc nhau, tránh nested CF |
| `thenCombine(CF khác, BiFunction)` | Gộp kết quả 2 future độc lập chạy song song |
| `allOf(...)` / `anyOf(...)` | Đợi tất cả / đợi 1 cái xong trước |
| `exceptionally(Function)` | Fallback khi có lỗi (chỉ chạy nếu lỗi) |
| `handle(BiFunction)` | Luôn chạy, xử lý cả 2 trường hợp, có thể đổi kết quả |
| `whenComplete(BiConsumer)` | Luôn chạy, chỉ side-effect, KHÔNG đổi được kết quả/lỗi |
| `*Async(..., Executor)` | Chỉ định rõ executor chạy — best practice production |

---

## 🧪 BÀI TẬP THỰC HÀNH

### Setup

```bash
cd ~/java-concurrency
mkdir nhom7 && cd nhom7
```

### Bài tập 1: Phân biệt `thenApply` vs `thenCompose` bằng code thực tế

Viết mô phỏng 3 API call phụ thuộc nhau (dùng `Thread.sleep` giả lập độ trễ mạng):

```java
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ThenApplyVsCompose {
    static ExecutorService executor = Executors.newFixedThreadPool(4);

    static CompletableFuture<String> fetchUserAsync(int userId) {
        return CompletableFuture.supplyAsync(() -> {
            sleep(300);
            return "User-" + userId;
        }, executor);
    }

    static CompletableFuture<String> fetchOrdersAsync(String user) {
        return CompletableFuture.supplyAsync(() -> {
            sleep(300);
            return "Orders-of-" + user;
        }, executor);
    }

    static void sleep(int ms) { try { Thread.sleep(ms); } catch (InterruptedException e) {} }

    public static void main(String[] args) throws Exception {
        // TODO 1: Viết bằng thenApply -> quan sát kiểu dữ liệu bị "lồng" (CompletableFuture<CompletableFuture<String>>)
        // Gợi ý: bạn sẽ phải gọi .get().get() hoặc dùng biến kiểu CompletableFuture<CompletableFuture<String>>

        // TODO 2: Viết lại bằng thenCompose -> kiểu dữ liệu "phẳng" CompletableFuture<String>
        // In ra kết quả cuối cùng, đo tổng thời gian chạy (kỳ vọng ~600ms vì 2 API tuần tự phụ thuộc nhau)

        executor.shutdown();
    }
}
```

**Yêu cầu:** tự viết cả 2 TODO, chạy và quan sát sự khác biệt về kiểu dữ liệu trả về, verify `thenCompose` cho code gọn hơn hẳn.

### Bài tập 2: Xây pipeline xử lý lỗi hoàn chỉnh, phân biệt 3 method lỗi

```java
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ThreadLocalRandom;

public class ErrorHandlingPipeline {
    static int callFlakyAPI() {
        if (ThreadLocalRandom.current().nextInt(3) == 0) {
            throw new RuntimeException("API call thất bại!");
        }
        return ThreadLocalRandom.current().nextInt(100);
    }

    public static void main(String[] args) throws Exception {
        for (int i = 0; i < 10; i++) {
            CompletableFuture<Integer> cf = CompletableFuture.supplyAsync(ErrorHandlingPipeline::callFlakyAPI)
                .whenComplete((result, ex) -> {
                    // TODO: chỉ LOG, không xử lý gì, verify KHÔNG thay đổi được kết quả
                    if (ex != null) System.out.println("[whenComplete] Lỗi xảy ra: " + ex.getMessage());
                    else System.out.println("[whenComplete] Thành công: " + result);
                })
                .exceptionally(ex -> {
                    // TODO: fallback giá trị -1 khi lỗi
                    return -1;
                });

            Integer finalResult = cf.get();
            System.out.println("=> Kết quả cuối cùng lần " + i + ": " + finalResult);
            System.out.println("---");
        }
    }
}
```

**Yêu cầu:**
1. Chạy 10 lần vòng lặp, quan sát: khi lỗi xảy ra, thứ tự log là gì? (`whenComplete` chạy TRƯỚC hay SAU `exceptionally`?) — chú ý thứ tự đặt trong pipeline
2. Thử **đổi thứ tự**: đặt `exceptionally` TRƯỚC `whenComplete` trong chain — chạy lại, quan sát: giờ `whenComplete` có còn thấy exception nữa không? (Gợi ý: vì `exceptionally` đã "nuốt" lỗi và tạo fallback value trước khi tới `whenComplete`)
3. Viết vào `answer.md`: rút ra quy tắc — **thứ tự các method trong chain có quan trọng không?** Điều gì xảy ra nếu đặt `exceptionally` ở cuối cùng của 1 pipeline dài mà có nhiều `thenApply` ở giữa?

### Bài tập 3: Chứng minh vấn đề "nghẽn ForkJoin common pool"

```java
import java.util.concurrent.*;

public class CommonPoolStarvationDemo {
    public static void main(String[] args) throws Exception {
        System.out.println("Common pool parallelism: " + ForkJoinPool.commonPool().getParallelism());

        // Giả lập: nhiều task I/O-bound (blocking) chiếm hết common pool
        int numBlockingTasks = ForkJoinPool.commonPool().getParallelism() + 2; // cố tình vượt quá pool size

        CompletableFuture<?>[] blockingTasks = new CompletableFuture[numBlockingTasks];
        for (int i = 0; i < numBlockingTasks; i++) {
            final int taskId = i;
            blockingTasks[i] = CompletableFuture.runAsync(() -> {
                System.out.println("Blocking task " + taskId + " bắt đầu trên " + Thread.currentThread().getName());
                try { Thread.sleep(3000); } catch (InterruptedException e) {}
                System.out.println("Blocking task " + taskId + " KẾT THÚC");
            }); // ⚠️ KHÔNG truyền executor riêng -> dùng chung common pool
        }

        // Task "vô tội" khác, cũng dùng common pool, đáng lẽ nên nhanh
        long start = System.currentTimeMillis();
        CompletableFuture<Integer> innocentTask = CompletableFuture.supplyAsync(() -> {
            return 1 + 1;  // task cực nhẹ, đáng lẽ chạy gần như tức thời
        });
        int result = innocentTask.get();
        long duration = System.currentTimeMillis() - start;

        System.out.println("Task 'vô tội' (1+1) mất " + duration + "ms để hoàn thành! (mong đợi: gần 0ms nếu pool không bị nghẽn)");

        CompletableFuture.allOf(blockingTasks).get();
    }
}
```

**Yêu cầu:**
1. Chạy và quan sát: `innocentTask` (chỉ tính `1+1`) mất **bao lâu** để hoàn thành? Verify nó bị "đói" thread do các `blockingTasks` chiếm hết pool.
2. Sửa lại: tạo riêng 1 `ExecutorService customExecutor = Executors.newFixedThreadPool(10)`, dùng nó cho `blockingTasks` (truyền vào `runAsync(..., customExecutor)`), giữ `innocentTask` dùng common pool mặc định — chạy lại, verify `innocentTask` giờ hoàn thành gần như ngay lập tức.
3. Viết vào `answer.md`: từ bài tập này, rút ra 1 quy tắc bạn sẽ áp dụng khi code production — khi nào **bắt buộc** phải truyền executor riêng cho `CompletableFuture`?

---

Bài tập 3 mô phỏng đúng 1 loại bug production khá nổi tiếng ("common pool starvation") — nếu bạn từng dùng `parallelStream()` hoặc `CompletableFuture` mặc định trong code chứa I/O call, khả năng cao đã (hoặc sẽ) gặp bug này. Làm xong 3 bài gửi mình review, rồi mình dạy tiếp **Nhóm 8: Deadlock, Livelock, Starvation, và Producer-Consumer pattern chuẩn** — nhóm này tập trung vào kỹ năng **debug** thực tế (dùng `jstack`), rất hay được hỏi kiểu "bạn từng debug deadlock chưa, làm thế nào?".

## Assistant:

> 7/14/2026 14:35:04

> Prepared to delve deeper into section eight's theoretical foundations.
>
> - Tiếp tục với Nhóm 8, đi sâu vào lý thuyết.
> - **Done**

# Nhóm 8: Các lỗi kinh điển cần biết cách debug

Đây là nhóm thiên về **kỹ năng thực chiến** — phỏng vấn senior rất hay hỏi "bạn từng debug deadlock production chưa, làm thế nào?" Nếu bạn trả lời được có quy trình rõ ràng (không phải chỉ nói lý thuyết suông), đây là điểm cộng rất lớn.

## 1. Deadlock — Circular Wait

### Điều kiện cần (4 điều kiện Coffman) để deadlock xảy ra

Deadlock chỉ xảy ra khi **cả 4 điều kiện sau đồng thời đúng** — hiểu rõ 4 điều kiện này giúp bạn biết cách **phá vỡ** deadlock (chỉ cần phá 1 trong 4 là đủ):

| Điều kiện | Giải thích |
|---|---|
| **Mutual Exclusion** | Tài nguyên chỉ có thể được giữ bởi 1 thread tại 1 thời điểm (bản chất của lock) |
| **Hold and Wait** | Thread đang **giữ** ít nhất 1 tài nguyên, đồng thời **chờ** thêm tài nguyên khác |
| **No Preemption** | Tài nguyên không thể bị "cướp" từ thread đang giữ — phải tự nguyện release |
| **Circular Wait** | Tồn tại 1 chuỗi thread T1→T2→T3→...→T1 mà mỗi thread đang chờ tài nguyên do thread tiếp theo giữ |

### Ví dụ kinh điển: Deadlock 2 thread, 2 lock

```java
private static final Object lockA = new Object();
private static final Object lockB = new Object();

// Thread 1:
synchronized (lockA) {
    Thread.sleep(100); // tạo cơ hội cho Thread 2 chiếm lockB
    synchronized (lockB) {
        // cần cả A và B
    }
}

// Thread 2:
synchronized (lockB) {
    Thread.sleep(100);
    synchronized (lockA) {
        // cần cả B và A — NGƯỢC THỨ TỰ với Thread 1!
    }
}
```

**Chuỗi sự kiện:**
```
Thread 1: giữ lockA, đang CHỜ lockB
Thread 2: giữ lockB, đang CHỜ lockA
→ Circular wait: T1 chờ T2, T2 chờ T1 → CẢ 2 TREO VĨNH VIỄN
```

### Cách phòng tránh Deadlock (phá điều kiện Circular Wait — dễ áp dụng nhất)

**Nguyên tắc: LUÔN acquire lock theo 1 THỨ TỰ CỐ ĐỊNH, toàn hệ thống thống nhất**

```java
// ✅ Cách 1: Sắp xếp lock theo thứ tự cố định (ví dụ theo hashCode hoặc ID)
void transfer(Account from, Account to, double amount) {
    Account first = from.getId() < to.getId() ? from : to;
    Account second = from.getId() < to.getId() ? to : from;
    
    synchronized (first) {
        synchronized (second) {
            // luôn lock theo thứ tự ID tăng dần, dù transfer(A,B) hay transfer(B,A)
            // → không bao giờ có circular wait
            from.debit(amount);
            to.credit(amount);
        }
    }
}
```

```java
// ✅ Cách 2: Dùng tryLock với timeout — phá "Hold and Wait" thay vì "No Preemption"
boolean acquired1 = lockA.tryLock(1, TimeUnit.SECONDS);
if (acquired1) {
    try {
        boolean acquired2 = lockB.tryLock(1, TimeUnit.SECONDS);
        if (acquired2) {
            try {
                // critical section
            } finally { lockB.unlock(); }
        } else {
            // KHÔNG lấy được lockB → RELEASE lockA, retry sau (tránh giữ mãi)
        }
    } finally { lockA.unlock(); }
}
```

Cách 2 không phòng deadlock tuyệt đối (có thể vẫn "livelock" nếu retry logic sai — sẽ nói ở mục 2), nhưng ít nhất tránh được **treo vĩnh viễn**.

### Cách phát hiện Deadlock bằng `jstack` (kỹ năng thực chiến quan trọng nhất)

**Bước 1:** Tìm PID của Java process bị treo
```bash
jps -l
# hoặc
ps aux | grep java
```

**Bước 2:** Dump thread stack
```bash
jstack <PID> > threaddump.txt
```

**Bước 3:** Tìm phần `jstack` tự động phát hiện deadlock — nó có sẵn cơ chế detect và in ra rõ ràng:

```
Found one Java-level deadlock:
=============================
"Thread-1":
  waiting to lock monitor 0x00007f... (object 0x000000076b... , a java.lang.Object),
  which is held by "Thread-0"
"Thread-0":
  waiting to lock monitor 0x00007f... (object 0x000000076c... , a java.lang.Object),
  which is held by "Thread-1"

Java stack information for the threads listed above:
===================================================
"Thread-1":
        at DeadlockDemo.lambda$main$1(DeadlockDemo.java:25)
        - waiting to lock <0x000000076b...> (a java.lang.Object)
        - locked <0x000000076c...> (a java.lang.Object)
        at DeadlockDemo$$Lambda$2/0x0000000800c04440.run(Unknown Source)
        at java.lang.Thread.run(java.base@21/Thread.java:1583)
...
Found 1 deadlock.
```

`jstack` **tự tìm ra circular wait** và in rõ: thread nào đang giữ lock nào, đang chờ lock nào, chờ ai — kèm **stack trace chính xác dòng code** gây ra vấn đề. Đây chính là workflow debug thực tế:

```
1. Nhận báo cáo hệ thống bị "treo" / response time tăng đột biến / CPU thấp bất thường 
   (dấu hiệu: threads bị BLOCKED chứ không phải đang tính toán, nên CPU thường THẤP, khác với vòng lặp vô hạn làm CPU cao)
2. jstack <PID> nhiều lần (2-3 lần cách nhau vài giây) để xác nhận thread vẫn ở cùng trạng thái BLOCKED (không tự thoát)
3. Tìm section "Found Java-level deadlock" — nếu có, jstack chỉ thẳng ra vấn đề
4. Nếu KHÔNG tự phát hiện được (deadlock phức tạp qua nhiều lock/nhiều thread), 
   tự đọc thủ công: tìm các thread có state BLOCKED, xem chúng đang "waiting to lock" cái gì,
   rồi tìm thread nào đang "locked" đúng object đó — vẽ lại đồ thị chờ đợi bằng tay
```

**Công cụ khác ngoài `jstack`:** VisualVM (GUI), `jcmd <PID> Thread.print` (tương đương jstack, built-in JDK mới hơn), APM tools (Datadog, New Relic) có dashboard deadlock detection tự động trong môi trường production.

## 2. Livelock — thread không bị block nhưng vẫn không tiến triển

### Khác biệt với Deadlock

| | Deadlock | Livelock |
|---|---|---|
| Trạng thái thread | **BLOCKED** — hoàn toàn đứng yên | **RUNNABLE** — vẫn đang "chạy", CPU vẫn hoạt động |
| Biểu hiện | CPU usage thấp (thread không làm gì) | CPU usage **cao** (thread liên tục làm việc nhưng vô ích) |
| Nguyên nhân | Chờ tài nguyên bị giữ bởi nhau, không có cơ chế nhường | Cả 2 thread đều **"quá lịch sự"** — liên tục nhường nhau, phản ứng lại lẫn nhau, nhưng không bao giờ tiến triển |

### Ví dụ kinh điển: 2 người đi ngược chiều trong hành lang hẹp

```java
class Spouse {
    private String name;
    private boolean isHungry = true;

    void eatWith(Spouse other, Object lockPan) {
        while (isHungry) {
            synchronized (lockPan) {
                if (other.isHungry) {
                    System.out.println(name + ": tôi nhường bạn ăn trước!");
                    // Nhường lock, thử lại sau — GIỐNG kịch bản tryLock ở trên nhưng LOGIC RETRY SAI
                    continue;   // vòng lặp lại NGAY LẬP TỨC, không có delay ngẫu nhiên
                }
                isHungry = false;
                System.out.println(name + ": tôi ăn xong!");
            }
        }
    }
}
```

**Vấn đề:** cả 2 spouse đều check `other.isHungry` = true → cả 2 cùng nhường nhau → cùng lặp lại → **không ai bao giờ ăn được**, dù cả 2 vẫn "chạy" liên tục (không hề bị BLOCK).

### Đây chính là hệ quả của việc "fix deadlock sai cách" bằng `tryLock` retry logic không tốt:

```java
// ❌ Retry logic gây livelock
while (true) {
    if (lockA.tryLock()) {
        try {
            if (lockB.tryLock()) {
                try {
                    // làm việc
                    return;
                } finally { lockB.unlock(); }
            }
        } finally { lockA.unlock(); }
    }
    // KHÔNG có delay → 2 thread cứ liên tục tryLock, release, tryLock, release ĐỒNG BỘ với nhau
    // → luôn "vừa hụt" nhau, giống bị livelock
}
```

### Giải pháp: thêm **randomized backoff** (delay ngẫu nhiên) trước khi retry

```java
// ✅ Thêm random delay để "phá vỡ đồng bộ" giữa các thread
Random random = new Random();
while (true) {
    if (lockA.tryLock()) {
        try {
            if (lockB.tryLock()) {
                try {
                    // làm việc
                    return;
                } finally { lockB.unlock(); }
            }
        } finally { lockA.unlock(); }
    }
    try {
        Thread.sleep(random.nextInt(100));  // ✅ delay ngẫu nhiên, phá "nhịp điệu" giống nhau
    } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
}
```

Đây chính xác là nguyên lý đằng sau **Exponential Backoff** dùng trong network protocol (TCP retransmission, retry HTTP request) — dùng ngẫu nhiên để tránh nhiều bên cùng đồng bộ "đụng độ" theo cùng 1 pattern.

**Cách phát hiện Livelock:** khó hơn deadlock nhiều vì `jstack` **không tự phát hiện được** (vì thread không hề BLOCKED). Dấu hiệu nhận biết: **CPU usage cao bất thường nhưng throughput/progress = 0** (log không có tiến triển gì, hoặc log lặp lại y hệt liên tục). Cần theo dõi qua application-level logging/metrics thay vì thread dump.

## 3. Starvation — thread bị "đói" tài nguyên

### Định nghĩa

Thread có thể **chạy được về mặt kỹ thuật** (không deadlock, không livelock), nhưng **liên tục không được cấp CPU/lock** vì các thread khác luôn được ưu tiên hơn — dẫn đến chờ đợi vô thời hạn (dù về lý thuyết không phải "kẹt cứng").

### Nguyên nhân phổ biến

**1. Thread priority không hợp lý:**
```java
Thread highPriority = new Thread(() -> { while(true) work(); });
highPriority.setPriority(Thread.MAX_PRIORITY);   // priority = 10

Thread lowPriority = new Thread(() -> { while(true) work(); });
lowPriority.setPriority(Thread.MIN_PRIORITY);    // priority = 1

// Trên 1 số OS/JVM, lowPriority có thể gần như KHÔNG BAO GIỜ được CPU cấp phát
```
Trong thực tế, `Thread.setPriority()` **rất ít khi nên dùng** trong code production vì hành vi phụ thuộc OS scheduler, không portable, dễ gây starvation không kiểm soát được.

**2. Unfair lock với high contention:**
```java
ReentrantLock unfairLock = new ReentrantLock();  // mặc định unfair
// Với unfair lock, JVM có thể liên tục cho phép thread "mới đến" chen ngang giành lock
// trước cả thread đã đợi rất lâu — về lý thuyết throughput cao hơn nhưng có RỦI RO starvation
```

**3. Vòng lặp `synchronized` giữ lock quá lâu:**
```java
synchronized (sharedResource) {
    doVeryLongExpensiveWork();  // giữ lock hàng giây/phút
    // các thread khác cần sharedResource → phải đợi RẤT LÂU, dù về lý thuyết cuối cùng cũng được
}
```

### Giải pháp

```java
// ✅ Dùng Fair Lock khi cần đảm bảo công bằng (đánh đổi hiệu năng)
ReentrantLock fairLock = new ReentrantLock(true);

// ✅ Tránh giữ lock lâu — thu hẹp critical section tối thiểu
synchronized (sharedResource) {
    prepareLocalCopy();   // copy dữ liệu cần thiết
}
// xử lý expensive work BÊN NGOÀI lock, trên local copy
processExpensiveWork(localCopy);

// ✅ Tránh dùng thread priority tùy tiện, để mặc định NORM_PRIORITY cho hầu hết trường hợp
```

**Câu trả lời mẫu phỏng vấn khi được hỏi "phân biệt deadlock, livelock, starvation":**
> "Deadlock là các thread bị block hoàn toàn, chờ vòng tròn tài nguyên của nhau — không bao giờ tự thoát. Livelock là thread vẫn chạy (không block) nhưng liên tục phản ứng lẫn nhau theo cách khiến không ai tiến triển được — như 2 người nhường nhau ở hành lang hẹp mãi không qua được. Starvation là 1 thread về lý thuyết vẫn có thể tiến triển, nhưng liên tục bị các thread khác 'giành' tài nguyên/CPU trước, khiến nó phải chờ rất lâu hoặc vô thời hạn. Cả 3 đều liên quan đến vấn đề fairness/resource contention nhưng khác nhau về cơ chế và cách debug — deadlock dùng jstack phát hiện ngay, livelock phải quan sát CPU cao + log không tiến triển, starvation phải quan sát độ trễ bất thường của 1 thread/request cụ thể so với các request khác."

## 4. Producer-Consumer Pattern chuẩn với `BlockingQueue`

Đây là bài toán tổng hợp — áp dụng gần như toàn bộ kiến thức đã học (Nhóm 4, 6) để giải quyết đúng cách, tránh mọi lỗi ở trên.

### Tại sao `BlockingQueue` là lựa chọn "chuẩn" thay vì tự viết `wait/notify`

Ở Nhóm 3, bạn đã tự viết Producer-Consumer bằng `wait/notify` thủ công — dễ sai (quên `while`, quên `notifyAll`, dễ tạo lock tranh chấp không cần thiết). `BlockingQueue` đã **đóng gói sẵn** toàn bộ logic đó đúng cách, cùng với việc **decouple hoàn toàn** tốc độ producer và consumer.

### Kiến trúc chuẩn: Multiple Producers, Multiple Consumers

```java
import java.util.concurrent.*;

class Task {
    final int id;
    Task(int id) { this.id = id; }
}

class ProducerConsumerSystem {
    private final BlockingQueue<Task> queue;
    private final ExecutorService producerPool;
    private final ExecutorService consumerPool;
    private volatile boolean running = true;

    public ProducerConsumerSystem(int queueCapacity, int producerCount, int consumerCount) {
        this.queue = new ArrayBlockingQueue<>(queueCapacity);  // ✅ BOUNDED - tự động tạo backpressure
        this.producerPool = Executors.newFixedThreadPool(producerCount);
        this.consumerPool = Executors.newFixedThreadPool(consumerCount);
    }

    public void startProducer(int producerId) {
        producerPool.submit(() -> {
            int taskCounter = 0;
            while (running) {
                try {
                    Task task = new Task(producerId * 1000 + taskCounter++);
                    queue.put(task);   // ✅ BLOCK tự động nếu queue đầy - KHÔNG cần tự viết wait/notify
                    System.out.println("Producer-" + producerId + " tạo task " + task.id);
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        });
    }

    public void startConsumer(int consumerId) {
        consumerPool.submit(() -> {
            while (running || !queue.isEmpty()) {  // ✅ xử lý hết task còn lại trước khi dừng hẳn
                try {
                    Task task = queue.poll(500, TimeUnit.MILLISECONDS);  // ✅ timeout, tránh block vô hạn khi shutdown
                    if (task != null) {
                        System.out.println("  Consumer-" + consumerId + " xử lý task " + task.id);
                        Thread.sleep(150);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        });
    }

    public void shutdown() {
        running = false;
        producerPool.shutdown();
        consumerPool.shutdown();
    }
}
```

### Các điểm thiết kế quan trọng cần giải thích được khi phỏng vấn

1. **Tại sao dùng `ArrayBlockingQueue` bounded, không phải unbounded?** → Tránh OOM giống bug `Executors.newFixedThreadPool` ở Nhóm 6, đồng thời tạo **natural backpressure**: nếu consumer chậm hơn producer, producer tự động bị `put()` block lại, không dồn ứ vô hạn.

2. **Tại sao consumer dùng `poll(timeout)` thay vì `take()`?** → `take()` block vô thời hạn — khi cần shutdown hệ thống, consumer có thể bị "kẹt" mãi trong `take()` nếu queue rỗng. `poll(timeout)` cho phép consumer **định kỳ kiểm tra lại điều kiện `running`** để thoát vòng lặp đúng lúc, đây là pattern **graceful shutdown**.

3. **Tại sao dùng `volatile boolean running` thay vì biến thường?** → Đây chính là ứng dụng trực tiếp kiến thức Nhóm 1/2 — cần **visibility guarantee** để tất cả producer/consumer thread thấy ngay khi `running` chuyển thành `false` từ thread gọi `shutdown()`.

### Graceful Shutdown hoàn chỉnh

```java
public void gracefulShutdown() throws InterruptedException {
    running = false;                                    // báo hiệu dừng nhận task mới
    producerPool.shutdown();
    producerPool.awaitTermination(5, TimeUnit.SECONDS);  // đợi producer dừng hẳn

    // Consumer tiếp tục xử lý HẾT task còn lại trong queue (nhờ điều kiện "!queue.isEmpty()")
    consumerPool.shutdown();
    if (!consumerPool.awaitTermination(10, TimeUnit.SECONDS)) {
        System.out.println("⚠️ Consumer không xong kịp, force shutdown!");
        consumerPool.shutdownNow();   // force interrupt tất cả thread còn chạy
    }
}
```

**Phân biệt `shutdown()` vs `shutdownNow()`:**
| Method | Hành vi |
|---|---|
| `shutdown()` | Không nhận task mới, nhưng **cho phép task đang chạy và task trong queue hoàn thành hết** |
| `shutdownNow()` | Cố gắng **dừng ngay** task đang chạy (gửi `interrupt()`), **trả về list task chưa kịp chạy** trong queue (không đảm bảo dừng được nếu task không check `isInterrupted()`) |

---

## 📊 Bảng tổng hợp Nhóm 8

| Vấn đề | Trạng thái thread | CPU usage | Công cụ phát hiện | Cách phòng tránh chính |
|---|---|---|---|---|
| **Deadlock** | BLOCKED | Thấp | `jstack` (tự động detect) | Lock ordering cố định, tryLock+timeout |
| **Livelock** | RUNNABLE (busy) | Cao | Quan sát log không tiến triển + CPU cao | Random backoff khi retry |
| **Starvation** | RUNNABLE nhưng ít được CPU/lock | Bình thường | So sánh latency giữa các thread/request | Fair lock, tránh priority cực đoan, giảm critical section |

---

## 🧪 BÀI TẬP THỰC HÀNH

### Setup

```bash
cd ~/java-concurrency
mkdir nhom8 && cd nhom8
```

### Bài tập 1: Tự tay tái hiện Deadlock và debug bằng `jstack`

Tạo file `DeadlockDemo.java`:

```java
public class DeadlockDemo {
    private static final Object lockA = new Object();
    private static final Object lockB = new Object();

    public static void main(String[] args) {
        Thread t1 = new Thread(() -> {
            synchronized (lockA) {
                System.out.println("Thread-1 giữ lockA, đang chờ lockB...");
                try { Thread.sleep(100); } catch (InterruptedException ignored) {}
                synchronized (lockB) {
                    System.out.println("Thread-1 có cả 2 lock (sẽ không bao giờ xảy ra)");
                }
            }
        }, "Thread-1");

        Thread t2 = new Thread(() -> {
            synchronized (lockB) {
                System.out.println("Thread-2 giữ lockB, đang chờ lockA...");
                try { Thread.sleep(100); } catch (InterruptedException ignored) {}
                synchronized (lockA) {
                    System.out.println("Thread-2 có cả 2 lock (sẽ không bao giờ xảy ra)");
                }
            }
        }, "Thread-2");

        t1.start();
        t2.start();
    }
}
```

**Yêu cầu (đây là bài tập quan trọng nhất của cả nhóm — làm kỹ):**
1. Chạy chương trình (nó sẽ treo vĩnh viễn, không tự thoát) — mở terminal khác
2. Tìm PID: `jps -l` (tìm dòng `DeadlockDemo`)
3. Chạy `jstack <PID> > deadlock_dump.txt`
4. Mở file, tìm section `"Found one Java-level deadlock"` — đọc và xác định: Thread nào giữ lock nào, đang chờ lock nào
5. Chụp lại/copy đoạn output đó vào `answer.md`, tự chú thích từng dòng nghĩa là gì
6. **Sửa code fix deadlock** bằng kỹ thuật "lock ordering" (luôn lock lockA trước lockB ở cả 2 thread) — chạy lại, verify chương trình chạy xong và thoát bình thường, không cần `jstack` gì nữa.

### Bài tập 2: Tái hiện Livelock

Viết class `PoliteSpouse` mô phỏng đúng ví dụ "2 người nhường nhau ở hành lang":

```java
public class LivelockDemo {
    static class Spouse {
        private final String name;
        private volatile boolean isHungry = true;

        Spouse(String name) { this.name = name; }

        void eatWith(Spouse other, Object lockPan) {
            while (isHungry) {
                synchronized (lockPan) {
                    if (other.isHungry) {
                        System.out.println(name + ": Bạn ăn trước đi, tôi nhường!");
                    } else {
                        isHungry = false;
                        System.out.println(name + ": Cảm ơn, giờ tôi ăn!");
                        continue;
                    }
                }
                try { Thread.sleep(10); } catch (InterruptedException ignored) {}
                // TODO: thử KHÔNG có delay ngẫu nhiên trước -> quan sát livelock
                // rồi thêm delay ngẫu nhiên (Random) -> quan sát nó tự thoát được
            }
        }
    }

    public static void main(String[] args) {
        Object lockPan = new Object();
        Spouse husband = new Spouse("Chồng");
        Spouse wife = new Spouse("Vợ");

        new Thread(() -> husband.eatWith(wife, lockPan)).start();
        new Thread(() -> wife.eatWith(husband, lockPan)).start();
    }
}
```

**Yêu cầu:**
1. Chạy với `Thread.sleep(10)` **cố định** (không random) — quan sát: chương trình có bao giờ tự kết thúc không, hay in ra "nhường nhau" liên tục vô hạn? Để chạy khoảng 5-10 giây rồi tự kill (Ctrl+C) nếu không dừng.
2. Sửa `Thread.sleep(10)` thành `Thread.sleep(new Random().nextInt(50))` (random delay) — chạy lại nhiều lần, verify chương trình giờ **thường xuyên tự thoát được** sau vài lần nhường
3. Viết vào `answer.md`: dùng `jstack` chụp lại khi đang chạy bản livelock (bản cố định, không random) — verify rằng **jstack KHÔNG báo "Found Java-level deadlock"** dù chương trình vẫn bị "treo" logic — đây chính là điểm khác biệt quan trọng nhất giữa deadlock và livelock khi debug thực tế.

### Bài tập 3: Xây dựng Producer-Consumer hoàn chỉnh với Graceful Shutdown

Dựa trên code mẫu ở phần lý thuyết (`ProducerConsumerSystem`), bạn tự hoàn thiện thành 1 chương trình chạy được đầy đủ:

**Yêu cầu:**
1. Implement đầy đủ class `ProducerConsumerSystem` như code mẫu, chạy với 2 producer, 3 consumer, queue capacity = 5
2. Chạy hệ thống trong 3 giây (`Thread.sleep(3000)` ở main), sau đó gọi `gracefulShutdown()`
3. Verify: sau khi gọi shutdown, **không có task mới nào được tạo thêm** (producer dừng ngay), nhưng **các task đã có sẵn trong queue vẫn được consumer xử lý hết** trước khi chương trình thoát hẳn — log ra để verify điều này (đếm số task tạo ra vs số task xử lý xong, phải bằng nhau)
4. **Bài tập nâng cao:** thử đổi `ArrayBlockingQueue(5)` thành capacity = `1` (rất nhỏ) — quan sát log producer có thường xuyên bị "chững" lại (block ở `put()`) vì queue đầy liên tục không? Đây chính là minh chứng trực quan cho khái niệm "backpressure" đã nói ở lý thuyết.

---

Bài tập 1 (deadlock + jstack) là bài **bắt buộc phải làm tay ít nhất 1 lần** trong đời nếu muốn tự tin trả lời phỏng vấn senior về chủ đề này — cảm giác tự mình tạo ra deadlock, tự dump thread, tự đọc và hiểu output sẽ giúp bạn nhớ rất lâu, khác hẳn với việc chỉ đọc lý thuyết.

Làm xong gửi mình review, rồi mình dạy tiếp **Nhóm 9: Virtual Threads (Java 21), Pinning problem, Structured Concurrency** — đây là phần "điểm cộng" giúp bạn nổi bật so với ứng viên khác, vì không phải ai cũng cập nhật kiến thức mới này.

## Assistant:

> 7/14/2026 14:38:39

> Investigated virtual thread pinning effects và structured concurrency frameworks.
>
> - Moving into the deeper aspects of virtual threads now—specifically how pinning affects their efficiency, and how structured concurrency provides a framework for managing them safely.
> - **Done**

# Nhóm 9: Kiến thức mới nhất (Java 21) — Virtual Threads & Structured Concurrency

Đây là phần **"điểm cộng lớn"** đúng như bạn ghi trong list — vì phần lớn ứng viên chỉ học tới Executor/CompletableFuture mà không cập nhật Java 21. Trả lời tốt phần này gây ấn tượng mạnh với interviewer senior/lead.

## 1. Virtual Threads — vấn đề gì được giải quyết?

### Vấn đề gốc: Platform Thread (thread truyền thống) quá "đắt"

Từ đầu đến giờ, mọi `Thread` bạn dùng đều là **Platform Thread** — ánh xạ **1-1 với OS thread (kernel thread)**. Điều này có 2 hệ quả nặng nề:

1. **Tốn tài nguyên**: mỗi platform thread chiếm khoảng **~1MB stack memory** mặc định + chi phí tạo/hủy ở cấp OS khá cao (context switch giữa kernel thread cũng tốn kém)
2. **Giới hạn số lượng**: máy chủ thông thường chỉ chạy được vài nghìn đến vài chục nghìn platform thread cùng lúc trước khi cạn tài nguyên (memory, OS limits)

### Bài toán thực tế dẫn đến nhu cầu Virtual Thread

Mô hình phổ biến nhất của backend service: **"thread-per-request"** — mỗi request HTTP được xử lý bởi 1 thread riêng, thread đó gọi DB, gọi service khác (I/O), rồi trả response.

```
Request đến → gán 1 Platform Thread → thread gọi DB (I/O blocking) → THREAD BỊ "ĐÓNG BĂNG" CHỜ I/O
             → dù CPU không làm gì trong lúc đó, OS thread vẫn bị CHIẾM DỤNG hoàn toàn
```

Với 10.000 request đồng thời, cần 10.000 platform thread → **không khả thi** với model cũ. Đây là lý do các framework reactive (WebFlux, Vert.x, RxJava) ra đời — nhưng lập trình reactive **rất khó viết, khó debug** (callback hell, stack trace vô nghĩa khi lỗi).

### Virtual Thread giải quyết bằng cách nào?

Virtual Thread (JEP 444, chính thức từ Java 21) là **thread do JVM quản lý** (không map trực tiếp 1-1 với OS thread), cực kỳ nhẹ (~vài trăm byte thay vì ~1MB), cho phép tạo **hàng triệu** virtual thread cùng lúc.

```java
// Platform thread (cách cũ)
Thread platformThread = new Thread(() -> doWork());
platformThread.start();

// Virtual thread (Java 21+)
Thread virtualThread = Thread.ofVirtual().start(() -> doWork());

// Hoặc dùng Executor:
try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 1_000_000; i++) {   // ✅ TẠO 1 TRIỆU VIRTUAL THREAD được, thoải mái
        executor.submit(() -> {
            callDatabase();   // blocking I/O như code truyền thống, KHÔNG CẦN reactive/callback
        });
    }
}
```

**Điểm mấu chốt:** Bạn viết code **y hệt blocking-style truyền thống** (dễ đọc, dễ debug, stack trace bình thường) nhưng đạt được **hiệu năng gần tương đương non-blocking/reactive** — đây chính là "lời hứa" cốt lõi của Virtual Thread.

## 2. Cơ chế Mount/Unmount — Carrier Thread

### Mô hình M:N — nhiều Virtual Thread chạy trên ít Platform Thread

```
        Virtual Threads (hàng triệu, rất nhẹ)
   VT1   VT2   VT3   VT4   VT5   VT6   VT7   VT8 ...
    │     │     │     │     │     │     │     │
    └──┬──┘     └──┬──┘     └──┬──┘     └──┬──┘
       │           │           │           │
   ┌───▼───┐   ┌───▼───┐   ┌───▼───┐   ┌───▼───┐
   │Carrier │   │Carrier │   │Carrier │   │Carrier │   ← Platform Thread (số lượng ít, 
   │Thread 1│   │Thread 2│   │Thread 3│   │Thread 4│      thường = số CPU core)
   └────────┘   └────────┘   └────────┘   └────────┘
              ForkJoinPool (scheduler quản lý carrier threads)
```

**Carrier Thread** = platform thread thật sự chạy dưới nền — mỗi Virtual Thread cần "mượn" 1 carrier thread để thực thi code thật (vì cuối cùng CPU vẫn cần OS thread để chạy). Số lượng carrier thread mặc định = `Runtime.availableProcessors()` (chạy trên `ForkJoinPool` riêng dành cho virtual thread scheduler).

### Cơ chế Mount / Unmount (điểm quan trọng nhất để hiểu VT)

```
1. Virtual Thread VT1 được "MOUNT" lên Carrier Thread C1 → bắt đầu chạy code
2. VT1 gọi 1 blocking operation (ví dụ: đọc từ socket, chờ DB trả kết quả)
3. JVM PHÁT HIỆN đây là điểm blocking → tự động "UNMOUNT" VT1 khỏi C1
   → C1 ĐƯỢC GIẢI PHÓNG, có thể mount VT2, VT3... khác lên chạy tiếp
   → VT1 "đóng băng" trạng thái (giống như đóng gói continuation), CHỜ ở đâu đó (không chiếm carrier)
4. Khi I/O của VT1 hoàn thành (data đã sẵn sàng) → VT1 được "MOUNT LẠI" lên 1 carrier thread RẢNH BẤT KỲ
   (có thể là carrier khác, không nhất thiết là C1 ban đầu)
   → tiếp tục chạy code từ đúng chỗ đã dừng
```

**Bản chất kỹ thuật:** Virtual Thread built trên khái niệm **Continuation** — JVM lưu lại toàn bộ trạng thái thực thi (stack frame) của virtual thread khi nó unmount, để có thể "resume" lại chính xác sau này, tương tự khái niệm coroutine ở các ngôn ngữ khác (Kotlin, Go goroutine).

**So sánh trực quan:**
```
Platform Thread khi blocking I/O:
   OS Thread ─────[BLOCKED, chờ I/O, CHIẾM OS thread suốt thời gian đó]─────→ tiếp tục

Virtual Thread khi blocking I/O:
   Carrier Thread ──[VT1 chạy]──[UNMOUNT VT1]──[carrier RẢNH, mount VT2 khác chạy]──...
                                      ↓ (khi I/O xong)
                                 [VT1 MOUNT LẠI lên carrier rảnh nào đó]──[VT1 tiếp tục chạy]
```

Nhờ cơ chế này, với **cùng vài carrier thread** (= vài core CPU), hệ thống có thể phục vụ **hàng chục nghìn virtual thread** đang "chờ I/O" cùng lúc mà không tốn thêm OS resource — vì lúc chờ I/O, carrier đã được giải phóng cho việc khác.

## 3. Pinning Problem — tại sao `synchronized` làm Virtual Thread "dính" Carrier Thread

Đây là **câu hỏi hay nhất và khó nhất** của Nhóm 9 — hiểu sâu chỗ này chứng tỏ bạn đọc kỹ tài liệu Java 21, không phải chỉ biết mặt chữ "Virtual Thread".

### Vấn đề: `synchronized` KHÔNG hỗ trợ unmount

Cơ chế "unmount khi blocking" ở trên hoạt động tốt với các blocking API đã được **JDK cập nhật để hỗ trợ Virtual Thread** (java.net socket, `java.io` blocking streams, `java.util.concurrent` locks...). Nhưng `synchronized` (intrinsic lock, monitor) là cơ chế **cấp thấp trong JVM**, gắn chặt với khái niệm OS thread từ rất lâu — **chưa được thiết kế lại** để hỗ trợ unmount linh hoạt.

**Kết quả:** Khi 1 Virtual Thread đang ở trong `synchronized` block và gọi blocking operation bên trong đó → nó **KHÔNG unmount được** — carrier thread **bị "ghim" (pinned)** vào chính virtual thread đó cho đến khi thoát khỏi `synchronized` block.

```java
private final Object lock = new Object();

void handleRequest() {
    synchronized (lock) {
        String data = blockingHttpCall();  // ⚠️ Virtual Thread bị PINNED ở đây!
        // Carrier thread bị "khóa cứng" với virtual thread này suốt thời gian blockingHttpCall()
        // KHÔNG unmount được, dù về nguyên lý virtual thread nên nhường carrier cho VT khác
    }
}
```

### Hậu quả thực tế của Pinning

```
Nếu bạn có 1000 virtual thread, tất cả đều gọi blockingHttpCall() bên trong synchronized,
nhưng chỉ có 8 carrier thread (8 core CPU):

→ Chỉ 8 virtual thread có thể "pinned" chạy cùng lúc (mỗi carrier bị 1 VT chiếm cứng)
→ 992 virtual thread còn lại phải ĐỢI carrier rảnh — 
   NHƯNG carrier không bao giờ rảnh cho đến khi blockingHttpCall() của 8 VT đang pinned xong!
→ HIỆU NĂNG SẬP VỀ GẦN NHƯ PLATFORM THREAD THÔNG THƯỜNG (chỉ dùng được 8 "luồng thực" cùng lúc)
→ Toàn bộ lợi ích "hàng triệu virtual thread nhẹ" BỊ VÔ HIỆU HÓA
```

Đây chính là lý do câu hỏi trong list của bạn ghi: **"nên thay bằng ReentrantLock"** — vì `ReentrantLock` (và các lock trong `java.util.concurrent.locks`) đã được **thiết kế lại để hỗ trợ unmount** đúng cách với Virtual Thread.

```java
private final ReentrantLock lock = new ReentrantLock();

void handleRequest() {
    lock.lock();
    try {
        String data = blockingHttpCall();  // ✅ Virtual Thread ĐƯỢC PHÉP unmount bình thường!
        // Carrier thread được giải phóng để phục vụ virtual thread khác trong lúc chờ I/O
    } finally {
        lock.unlock();
    }
}
```

### Cách phát hiện Pinning trong thực tế

**JDK Flight Recorder (JFR)** có sự kiện `jdk.VirtualThreadPinned` — bật bằng:
```bash
java -XX:StartFlightRecording:filename=recording.jfr MyApp
```
Hoặc dùng JVM flag debug đơn giản hơn để log ra console mỗi khi có pinning xảy ra:
```bash
java -Djdk.tracePinnedThreads=full MyApp
```
Output sẽ in ra stack trace chính xác của đoạn code nào gây pinning — cực kỳ hữu ích để tìm ra chỗ `synchronized` cần thay bằng `ReentrantLock` trong codebase lớn.

### Lưu ý quan trọng: KHÔNG phải mọi `synchronized` đều gây pinning nghiêm trọng

Nếu `synchronized` block **không chứa blocking operation nào bên trong** (chỉ có tính toán CPU thuần túy, chạy rất nhanh), pinning xảy ra nhưng **thời gian rất ngắn** — không đáng lo. Vấn đề chỉ nghiêm trọng khi **blocking I/O (hoặc thao tác lâu) nằm bên trong `synchronized`**. Nguyên tắc chung: hạn chế tối đa I/O trong critical section (đây vốn cũng là best-practice ngay cả với platform thread — Nhóm 8 đã đề cập việc "thu hẹp critical section").

### Bảng ghi nhớ nhanh: cái gì gây Pinning, cái gì không

| Tình huống bên trong `synchronized` | Có gây pinning kéo dài không? |
|---|---|
| Tính toán CPU thuần túy | Không đáng kể (rất ngắn) |
| Gọi blocking I/O (network, file, DB) | ✅ **CÓ**, nghiêm trọng |
| Gọi `Thread.sleep()` | ✅ **CÓ** |
| Gọi method khác cũng dùng `synchronized` (nested) | Vẫn pinned (cả block ngoài) |
| Dùng `ReentrantLock` thay vì `synchronized` | ✅ Không pin — unmount bình thường |

**Câu trả lời mẫu phỏng vấn:** *"Virtual Thread cho phép unmount khỏi carrier thread khi gặp blocking I/O, nhưng cơ chế này không áp dụng được với `synchronized` vì đây là intrinsic lock cấp JVM, gắn liền với OS thread từ thiết kế cũ, chưa được cập nhật để hỗ trợ continuation của Virtual Thread. Nếu code có blocking call bên trong `synchronized` block, carrier thread bị 'ghim' (pinned) suốt thời gian đó, làm mất hoàn toàn lợi ích scale của Virtual Thread — về bản chất hệ thống lúc đó chỉ chạy được nhiều 'luồng thực' bằng đúng số carrier thread, y hệt Platform Thread thông thường. Giải pháp là thay `synchronized` bằng `ReentrantLock`, vì các lock trong `java.util.concurrent.locks` đã được thiết kế lại để tương thích với cơ chế mount/unmount của Virtual Thread."*

## 4. Structured Concurrency (`StructuredTaskScope`) — quản lý vòng đời task có cấu trúc

### Vấn đề: "Orphaned task" khi dùng `CompletableFuture`/Executor thông thường

```java
CompletableFuture<User> userFuture = CompletableFuture.supplyAsync(() -> fetchUser());
CompletableFuture<List<Order>> ordersFuture = CompletableFuture.supplyAsync(() -> fetchOrders());

User user = userFuture.get();          // ⚠️ nếu fetchUser() throw exception ở đây,
                                          // ordersFuture VẪN TIẾP TỤC CHẠY NGẦM — "orphaned" (mồ côi)
List<Order> orders = ordersFuture.get(); // không ai quản lý vòng đời của nó nữa,
                                           // tốn tài nguyên vô ích, khó cancel đúng cách,
                                           // exception handling rời rạc, dễ leak thread
```

Vấn đề cốt lõi: các subtask (userFuture, ordersFuture) **không có mối quan hệ cha-con rõ ràng** với luồng gọi chúng — nếu 1 task fail, task kia không tự động bị hủy, dẫn đến **resource leak** và code khó reasoning về error handling.

### Structured Concurrency giải quyết bằng nguyên tắc: "task con không được sống lâu hơn task cha"

```java
try (var scope = StructuredTaskScope.open()) {  // API mới trong JDK 21+ (preview), 
                                                  // cú pháp có thể khác nhau tùy phiên bản JDK cụ thể
    Subtask<User> userTask = scope.fork(() -> fetchUser());
    Subtask<List<Order>> ordersTask = scope.fork(() -> fetchOrders());

    scope.join();   // ĐỢI TẤT CẢ subtask xong (hoặc 1 cái fail tùy policy), 
                     // giống try-with-resources — đảm bảo KHÔNG CÓ task nào "mồ côi" thoát khỏi scope này

    User user = userTask.get();
    List<Order> orders = ordersTask.get();
    // Nếu ra khỏi block try mà chưa join() xong hoặc có lỗi chưa xử lý -> 
    // JVM tự động đảm bảo mọi subtask được HỦY (cancel) trước khi thoát scope
}
// Khi thoát khỏi try-with-resources: ĐẢM BẢO 100% không còn subtask nào đang chạy ngầm
```

**Nguyên tắc lõi (giống try-with-resources cho concurrency):**
- Mọi subtask được `fork()` bên trong 1 `scope` đều bị ràng buộc vòng đời với chính `scope` đó
- Khi thoát khỏi `scope` (dù thành công, thất bại, hay bị exception) → **JVM đảm bảo tất cả subtask đã kết thúc** (hoàn thành hoặc bị cancel), không có task nào "trôi nổi" tiếp tục chạy ngầm không kiểm soát
- Exception của bất kỳ subtask nào cũng được propagate lên rõ ràng, không bị "nuốt" âm thầm

### So sánh tư duy: Unstructured vs Structured

```
CompletableFuture (unstructured):        StructuredTaskScope (structured):
   
   main thread                              main thread
       │                                        │
       ├── fork task A ────┐                    ├── scope.fork(A) ──┐
       │                    │  (không rõ         │                   │ (RÀNG BUỘC RÕ vào scope)
       ├── fork task B ────┤   ràng buộc          ├── scope.fork(B) ──┤
       │                    │   vòng đời)         │                   │
    get()/join() ...       └─→ có thể vẫn      scope.join() ────────┘
    (task có thể vẫn         chạy ngầm dù       (ĐẢM BẢO tất cả xong/cancel
    "trôi" nếu lỗi xảy ra    main đã thoát        trước khi ra khỏi block,
    ở chỗ khác)              hoặc lỗi             GIỐNG cấu trúc code lồng nhau
                                                    của single-thread thông thường)
```

### Lợi ích cụ thể

1. **Error handling nhất quán**: nếu 1 subtask fail, các subtask khác trong cùng scope **tự động bị cancel** (tùy policy, ví dụ `ShutdownOnFailure`), tránh lãng phí tài nguyên chạy tiếp việc vô ích
2. **Cancellation propagation**: hủy task cha → tự động hủy toàn bộ task con, đúng nghĩa "cha con"
3. **Observability tốt hơn**: vì có cấu trúc rõ ràng (giống cây), công cụ debug/monitoring (thread dump) có thể hiển thị đúng mối quan hệ cha-con giữa các task, dễ trace hơn nhiều so với các future "trôi nổi" độc lập
4. **Code dễ đọc hơn**: tư duy giống lập trình tuần tự truyền thống (block code trong `{}` = vòng đời rõ ràng), dù bên trong là chạy concurrent

### Lưu ý về độ chín của API

`StructuredTaskScope` vẫn đang ở dạng **preview/incubator** qua nhiều phiên bản JDK (21, 22, 23...), API cụ thể (`scope.fork()`, `scope.join()`, các policy như `ShutdownOnFailure`/`ShutdownOnSuccess`) **có thể thay đổi giữa các JDK version** trước khi chính thức ổn định (finalize). Khi phỏng vấn, bạn nên nói rõ **hiểu đúng triết lý/nguyên tắc** (structured concurrency, task cha-con, tránh orphaned task) là quan trọng hơn nhớ chính xác syntax — vì bản thân API còn đang tiến hóa.

**Câu trả lời mẫu:** *"Structured Concurrency giải quyết vấn đề 'orphaned task' của mô hình concurrency truyền thống — khi bạn fork nhiều task song song bằng CompletableFuture hay ExecutorService, không có gì đảm bảo các task đó bị hủy đúng lúc khi có lỗi xảy ra ở nơi khác, dễ dẫn tới resource leak. StructuredTaskScope áp dụng nguyên tắc giống try-with-resources cho concurrency — mọi subtask được fork trong 1 scope có vòng đời ràng buộc chặt với scope đó, đảm bảo khi thoát khỏi scope, không còn task nào chạy ngầm không kiểm soát. Nó giúp code concurrent có cấu trúc rõ ràng như code tuần tự thông thường, dễ reasoning về error handling và cancellation hơn nhiều."*

---

## 📊 Bảng tổng hợp Nhóm 9

| Khái niệm | Vấn đề giải quyết | Điểm chính cần nhớ |
|---|---|---|
| **Virtual Thread** | Platform thread quá "đắt" cho mô hình thread-per-request với I/O nhiều | M:N model, mount/unmount linh hoạt qua Carrier Thread |
| **Pinning Problem** | `synchronized` không hỗ trợ unmount → mất lợi ích scale | Thay `synchronized` bằng `ReentrantLock` khi có blocking I/O bên trong |
| **Structured Concurrency** | Orphaned task, resource leak, error handling rời rạc | Vòng đời task con ràng buộc chặt với task cha, giống try-with-resources |

---

## 🧪 BÀI TẬP THỰC HÀNH

### Setup — Bắt buộc JDK 21+

```bash
java -version   # phải >= 21, nếu chưa có thì cài JDK 21 (Temurin/OpenJDK)
cd ~/java-concurrency
mkdir nhom9 && cd nhom9
```

### Bài tập 1: Chứng minh Virtual Thread scale tốt hơn Platform Thread khi I/O nhiều

Tạo file `VirtualVsPlatformThread.java`:

```java
import java.util.concurrent.*;
import java.util.stream.IntStream;

public class VirtualVsPlatformThread {
    static final int TASK_COUNT = 10_000;

    public static void main(String[] args) throws Exception {
        System.out.println("=== Platform Thread Pool (fixed 200 threads) ===");
        testWithExecutor(Executors.newFixedThreadPool(200));

        System.out.println("=== Virtual Thread (unlimited) ===");
        testWithExecutor(Executors.newVirtualThreadPerTaskExecutor());
    }

    static void testWithExecutor(ExecutorService executor) throws InterruptedException {
        long start = System.currentTimeMillis();
        CountDownLatch latch = new CountDownLatch(TASK_COUNT);

        for (int i = 0; i < TASK_COUNT; i++) {
            executor.submit(() -> {
                try {
                    Thread.sleep(100);  // giả lập blocking I/O (network call, DB query...)
                } catch (InterruptedException ignored) {
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();
        long duration = System.currentTimeMillis() - start;
        System.out.println("Hoàn thành " + TASK_COUNT + " task (mỗi task 'block' 100ms) trong: " + duration + "ms");
        executor.shutdown();
    }
}
```

**Yêu cầu:**
1. Chạy và so sánh thời gian 2 cách — với 10.000 task "block" 100ms mỗi task, nhưng chỉ có 200 platform thread → tổng thời gian platform thread sẽ **≈ 10000/200 × 100ms = 5000ms** (vì mỗi thread phải xử lý ~50 task tuần tự), trong khi Virtual Thread **gần như chạy hết song song thực sự → ≈100-200ms**
2. Thử tăng `TASK_COUNT` lên `100_000` — verify Virtual Thread vẫn chạy ổn định, còn thử tăng pool size Platform Thread lên tương ứng (ví dụ 2000 thread) xem có bắt đầu gặp vấn đề về memory/hiệu năng tạo thread không (`-Xss` mặc định mỗi platform thread khá tốn)
3. Viết vào `answer.md`: giải thích bằng con số đo được, tại sao Virtual Thread phù hợp cho workload **I/O-bound** (không phải CPU-bound) — thử nghĩ xem nếu đổi `Thread.sleep(100)` thành 1 vòng lặp tính toán CPU nặng (không sleep) thì kết quả có còn chênh lệch nhiều như vậy không? (gợi ý: vì CPU-bound task không có chỗ nào để "unmount", carrier thread vẫn bị chiếm dụng suốt)

### Bài tập 2: Tái hiện Pinning Problem và verify bằng `jdk.tracePinnedThreads`

Tạo file `PinningDemo.java`:

```java
import java.util.concurrent.*;
import java.util.concurrent.locks.ReentrantLock;

public class PinningDemo {
    private static final Object syncLock = new Object();
    private static final ReentrantLock reentrantLock = new ReentrantLock();

    public static void main(String[] args) throws InterruptedException {
        String mode = args.length > 0 ? args[0] : "synchronized";

        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            CountDownLatch latch = new CountDownLatch(50);
            for (int i = 0; i < 50; i++) {
                executor.submit(() -> {
                    if (mode.equals("synchronized")) {
                        synchronized (syncLock) {
                            try { Thread.sleep(100); } catch (InterruptedException ignored) {}
                            // Blocking bên trong synchronized -> GÂY PINNING
                        }
                    } else {
                        reentrantLock.lock();
                        try {
                            try { Thread.sleep(100); } catch (InterruptedException ignored) {}
                        } finally {
                            reentrantLock.unlock();
                        }
                    }
                    latch.countDown();
                });
            }
            latch.await();
        }
    }
}
```

**Yêu cầu:**
1. Compile và chạy với flag tracing:
```bash
javac PinningDemo.java
java -Djdk.tracePinnedThreads=full PinningDemo synchronized
```
Verify output có in ra cảnh báo pinning (dòng có `Thread[...]` kèm `synchronized` block bị đánh dấu).

2. Chạy lại với mode ReentrantLock:
```bash
java -Djdk.tracePinnedThreads=full PinningDemo reentrantlock
```
Verify KHÔNG còn cảnh báo pinning nào.

3. Đo thời gian chạy tổng thể của cả 2 mode (thêm `System.currentTimeMillis()` vào code) với `TASK_COUNT` tăng lên (ví dụ 5000 thay vì 50, giữ nguyên `Thread.sleep(100)`) — verify mode `synchronized` chạy **chậm hơn đáng kể** vì bị giới hạn bởi số carrier thread (≈ số CPU core), còn mode `reentrantLock` scale tốt hơn nhiều.

4. Viết vào `answer.md`: từ số liệu đo được, giải thích lại bằng lời của chính bạn tại sao pinning làm mất lợi ích virtual thread — liên hệ lại với sơ đồ mount/unmount đã học.

### Bài tập 3: Structured Concurrency — so sánh với cách viết `CompletableFuture` cũ

**Lưu ý:** vì API `StructuredTaskScope` còn preview, cần thêm flag khi compile/chạy: `--enable-preview` (và tùy phiên bản JDK, package/class có thể ở `java.util.concurrent` với tên khác nhau — kiểm tra đúng theo JDK bạn đang cài, ví dụ JDK 21/22 dùng `StructuredTaskScope.ShutdownOnFailure`).

```bash
javac --release 21 --enable-preview StructuredDemo.java
java --enable-preview StructuredDemo
```

**Yêu cầu (làm ở mức tìm hiểu, không cần syntax hoàn hảo 100% vì API còn thay đổi):**
1. Viết 1 phiên bản dùng `CompletableFuture` gọi 2 "service" giả lập (1 cái ném exception ngẫu nhiên, 1 cái chạy bình thường mất 2 giây) — quan sát: khi service 1 lỗi, service 2 (chạy 2 giây) có **tiếp tục chạy ngầm** dù bạn đã nhận được exception và "coi như xong" ở main thread không? (thêm log ở cuối service 2 để verify nó vẫn in ra sau khi exception đã được xử lý)
2. Tìm hiểu và thử viết lại bằng `StructuredTaskScope` (tra thêm tài liệu chính thức JEP 453/499 tùy phiên bản JDK bạn cài, vì cú pháp có thể khác bản preview khác nhau) — với chính sách `ShutdownOnFailure`, verify rằng khi service 1 lỗi, service 2 **bị hủy sớm** (không chạy hết 2 giây), scope thoát ra ngay với exception rõ ràng.
3. Viết vào `answer.md` (không cần code hoàn hảo, quan trọng là hiểu đúng khái niệm): so sánh trải nghiệm code + hành vi giữa 2 cách, đặc biệt về điểm "orphaned task".

---

## 🎯 Tổng kết toàn bộ 9 nhóm — chuẩn bị phỏng vấn

Sau khi hoàn thành hết 9 nhóm, bạn nên tự làm 1 việc cuối cùng: **viết lại toàn bộ kiến thức thành 1 trang "cheat sheet"** theo cấu trúc:
1. Mỗi công cụ/khái niệm — 1 câu định nghĩa
2. Guarantee nó cung cấp (atomicity/visibility/ordering)
3. 1 ví dụ code ngắn
4. 1 bẫy thường gặp

Đây chính là cách ôn tập hiệu quả nhất trước ngày phỏng vấn — thay vì đọc lại toàn bộ, bạn chỉ cần lướt qua cheat sheet tự viết để "kích hoạt" lại trí nhớ về từng chủ đề.

Làm xong 3 bài tập của Nhóm 9, gửi mình review — đặc biệt bài tập 2 (Pinning) là phần **khác biệt nhất** giúp bạn nổi bật khi phỏng vấn, vì đa số ứng viên chỉ biết Virtual Thread ở mức "nghe nói nhẹ hơn thread thường" mà không hiểu sâu về pinning. Nếu bạn muốn, mình có thể tiếp tục hỗ trợ bạn: tổng hợp lại toàn bộ 9 nhóm thành 1 bộ câu hỏi phỏng vấn mock (dạng hỏi-đáp) để bạn luyện tập phản xạ trả lời nhanh — cho mình biết nếu bạn muốn đi hướng đó tiếp theo.

Powered by Claude Exporter (https://www.ai-chat-exporter.net)
