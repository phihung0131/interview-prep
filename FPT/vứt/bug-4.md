Bug 4: In tem sai kích thước hộp do MyBatis ánh xạ kiểu dữ liệu Enum lộn xộn
---

### 1. Context & Bối cảnh hệ thống (Background)

* **Hệ thống liên quan:** Phân hệ **WES (Warehouse Execution System)** tích hợp với **Carrier Gateway (Connectship / JNE)**.
* **Mã API & Module cốt lõi:**
* `SP_AP_0020_02_EC Register Customer Packing Result(PUT)`: Ghi nhận kết quả đóng gói đơn hàng online tại bàn đóng gói.
* `SP_AP_0020_03_EC Print Delivery Slip(PUT)`: In nhãn vận chuyển/tem bưu cục để dán lên hộp carton.
* `SP_ML_0011_01_EC Call Connectship Shipment Request`: Gửi thông số kiện hàng (kích thước, trọng lượng, mã loại hộp) sang đối tác vận chuyển quốc tế **Connectship** để tạo mã vận đơn (Tracking Number) và tính cước.
* `MS_AP_0010_01_DC Register Carton M3(PUT)` & `MS_BT_0010_02_Import Carton M3 Master IF`: Quản lý quy chuẩn kích thước các loại thùng carton tiêu chuẩn dùng trong kho.


* **Quy trình nghiệp vụ thực tế (Business Flow):**
1. Tại bàn đóng gói đơn thương mại điện tử (EC Packing Station), công nhân bỏ quần áo vào thùng carton phù hợp.
2. Kho sử dụng các loại thùng tiêu chuẩn định nghĩa sẵn trong hệ thống: `SMALL` (Hộp nhỏ - đựng áo thun, phụ kiện), `MEDIUM` (Hộp vừa - đựng áo khoác, quần jean), `LARGE` (Hộp lớn - đựng áo phao, nhiều món đồ dày).
3. Khi công nhân chọn loại thùng trên màn hình và bấm nút *"Xác nhận đóng gói & In tem"*, WES lưu thông tin thùng vào cơ sở dữ liệu và gọi API sang cổng vận chuyển Connectship.
4. Phía Connectship căn cứ vào mã loại thùng (`BoxType`) để tính trước cước phí vận chuyển (Dimensional Weight) và sinh mã vạch bưu cục để máy in tại trạm nhả tem dán lên kiện hàng.



---

### 2. Triệu chứng & Các phát hiện qua Datadog (Detection & Investigation)

#### Triệu chứng vận hành & Chi phí (Business & Financial Symptom)

* Công nhân dưới kho thắc mắc: Khi đóng 1 chiếc áo thun vào chiếc hộp carton loại nhỏ (`SMALL`), tem in ra từ máy in bưu cục lại ghi ký hiệu phân loại là loại hộp trung bình (`MEDIUM`), mã cước bị nhảy khung.
* Cuối tháng, phòng Kế toán nhận hóa đơn đối soát từ đối tác vận chuyển Connectship: **Chi phí cước vận chuyển đội lên bất thường gần 25%** so với tháng trước dù số lượng đơn hàng không tăng đột biến. Toàn bộ các kiện hàng nhỏ đều bị tính tiền cước của kiện hàng kích cỡ vừa.

#### Điều tra tầng sâu trên Datadog (Technical Investigation)

1. **Soi Datadog APM Trace Explorer:**
* Tìm trace của API `SP_ML_0011_01_EC Call Connectship Shipment Request`.
* Kiểm tra payload JSON gửi sang Connectship gateway:
```json
{
  "orderId": "ORD-202609-9921",
  "packageCode": "BOX_MEDIUM",  // <-- BẤT THƯỜNG: Đơn chỉ có 1 áo thun nhưng gửi mã BOX_MEDIUM!
  "weight": 0.35
}

```


* Đơn hàng rõ ràng được công nhân chọn hộp `SMALL` trên Web UI, nhưng payload gửi cho hãng vận chuyển lại bị biến thành `BOX_MEDIUM`.


2. **Truy vết Database qua Datadog Database Monitoring (DBM):**
* Truy vấn bảng `customer_packing_result`:
```sql
SELECT id, order_id, box_size_code FROM customer_packing_result WHERE id = 88219;

```


* Kết quả trả về: Cột `box_size_code` (kiểu dữ liệu `SMALLINT` trong Postgres) đang lưu giá trị là số `1`.
* Đối chiếu với bản release code mới nhất được deploy lên production 3 ngày trước: Có một commit cập nhật thêm loại hộp siêu nhỏ (`EXTRA_SMALL`) để phục vụ đóng gói các phụ kiện nhỏ (tất vớ, khẩu trang).



---

### 3. Phân tích nguyên nhân gốc rễ (Root Cause Analysis)

Đào sâu vào mã nguồn Java và cấu hình MyBatis, nguyên nhân nằm ở sự kết hợp giữa **MyBatis Enum Mapping mặc định** và **sự xáo trộn thứ tự khai báo Enum**.

#### Mã nguồn cũ trước khi có thay đổi:

Trong cơ sở dữ liệu, cột `box_size_code` được thiết kế kiểu số nguyên (`SMALLINT`).
Trong Java, dev định nghĩa Enum:

```java
public enum BoxSize {
    SMALL,   // ordinal = 0
    MEDIUM,  // ordinal = 1
    LARGE    // ordinal = 2
}

```

Trong MyBatis Mapper XML, dev không chỉ định rõ `typeHandler`, nên MyBatis tự động sử dụng **`EnumOrdinalTypeHandler`** (hoặc dev khai báo rõ dùng ordinal):

```xml
<insert id="insertPackingResult">
    INSERT INTO customer_packing_result (order_id, box_size_code)
    VALUES (#{orderId}, #{boxSize, typeHandler=org.apache.ibatis.type.EnumOrdinalTypeHandler})
</insert>

```

* Lúc này: `SMALL` $\rightarrow$ lưu `0`, `MEDIUM` $\rightarrow$ lưu `1`, `LARGE` $\rightarrow$ lưu `2`. Hệ thống chạy bình thường.

#### Điểm gây bug (Tử huyệt kỹ thuật):

Một lập trình viên khác nhận task bổ sung kích thước hộp mới `EXTRA_SMALL`. Do thói quen sắp xếp theo thứ tự kích thước từ nhỏ đến lớn cho "đẹp mắt", bạn đó đã chèn `EXTRA_SMALL` vào **đầu danh sách Enum**:

```java
public enum BoxSize {
    EXTRA_SMALL, // ordinal = 0  <-- CHÈN VÀO ĐẦU
    SMALL,       // ordinal = 1  <-- BỊ ĐẨY TỪ 0 LÊN 1!
    MEDIUM,      // ordinal = 2  <-- BỊ ĐẨY TỪ 1 LÊN 2!
    LARGE        // ordinal = 3  <-- BỊ ĐẨY TỪ 2 LÊN 3!
}

```

#### Hậu quả dây chuyền:

1. Khi công nhân đóng hộp `SMALL`, MyBatis lấy `boxSize.ordinal()` là **`1`** để ghi xuống Database.
2. Khi module `SP_ML_0011` đọc dữ liệu lên để gửi Connectship, mã logic đọc số `1` từ Database và map ngược lại thành `BoxSize.values()[1]`, nhưng ở các code cũ hoặc bảng map sang carrier thì số `1` tương ứng với `BOX_MEDIUM`.
3. Tệ hơn nữa, các đơn hàng cũ trong lịch sử lưu số `0` (vốn là `SMALL`) bây giờ đọc lên lại bị hiểu nhầm thành `EXTRA_SMALL`! Toàn bộ tính nhất quán dữ liệu kích thước thùng bị đảo lộn hoàn toàn.

---

### 4. Giải pháp xử lý triệt để (Action Plan)

Để loại bỏ hoàn toàn sự phụ thuộc chết người vào chỉ số thứ tự (`ordinal`) của Java Enum, giải pháp được triển khai theo 3 bước:

#### Bước 1: Chuyển đổi sang Persistent Value Code (BaseTypeHandler tùy chỉnh)

Không bao giờ dùng tên Enum tiếng Anh trần trụi và tuyệt đối cấm dùng chỉ số index `ordinal`. Gán cho mỗi Enum một mã định danh bất biến (Immutable Business Code):

```java
public enum BoxSize {
    EXTRA_SMALL("XS", "Hộp siêu nhỏ"),
    SMALL("S", "Hộp nhỏ"),
    MEDIUM("M", "Hộp vừa"),
    LARGE("L", "Hộp lớn");

    private final String code;
    private final String description;

    BoxSize(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    // Phương thức tra cứu an toàn
    public static BoxSize fromCode(String code) {
        for (BoxSize size : values()) {
            if (size.code.equalsIgnoreCase(code)) {
                return size;
            }
        }
        throw new IllegalArgumentException("Không tìm thấy BoxSize cho mã: " + code);
    }
}

```

#### Bước 2: Viết Custom MyBatis TypeHandler

Viết một Generic TypeHandler để tự động ánh xạ giữa cột `VARCHAR` của PostgreSQL và `code` của Enum:

```java
@MappedTypes(BoxSize.class)
@MappedJdbcTypes(JdbcType.VARCHAR)
public class BoxSizeTypeHandler extends BaseTypeHandler<BoxSize> {

    @Override
    public void setNonNullParameter(PreparedStatement ps, int i, BoxSize parameter, JdbcType jdbcType) throws SQLException {
        ps.setString(i, parameter.getCode()); // Lưu xuống DB là "S", "M", "L", "XS"
    }

    @Override
    public BoxSize getNullableResult(ResultSet rs, String columnName) throws SQLException {
        String code = rs.getString(columnName);
        return code != null ? BoxSize.fromCode(code) : null;
    }

    @Override
    public BoxSize getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
        String code = rs.getString(columnIndex);
        return code != null ? BoxSize.fromCode(code) : null;
    }

    @Override
    public BoxSize getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
        String code = cs.getString(columnIndex);
        return code != null ? BoxSize.fromCode(code) : null;
    }
}

```

#### Bước 3: Migration Data dưới PostgreSQL

Thay đổi cấu trúc cột DB từ `SMALLINT` sang `VARCHAR(10)` và migrate dữ liệu cũ về đúng mã chuẩn:

```sql
-- Đổi kiểu cột sang text
ALTER TABLE customer_packing_result ALTER COLUMN box_size_code TYPE VARCHAR(10);

-- Map lại các dữ liệu đã bị lưu sai theo ordinal về mã chữ bất biến
UPDATE customer_packing_result SET box_size_code = 'XS' WHERE box_size_code = '0';
UPDATE customer_packing_result SET box_size_code = 'S'  WHERE box_size_code = '1';
UPDATE customer_packing_result SET box_size_code = 'M'  WHERE box_size_code = '2';
UPDATE customer_packing_result SET box_size_code = 'L'  WHERE box_size_code = '3';

```

Từ thời điểm này, bất kể dev có thêm mới, xóa bớt hay đảo lộn thứ tự khai báo trong file Java Enum như thế nào thì giá trị lưu xuống DB và gửi sang Connectship luôn là `"S"`, `"M"`, `"L"`, không bao giờ bị xô lệch.

---

### 5. Kết quả đạt được (Output & Results)

* **Khắc phục triệt để chi phí cước:** Cước vận chuyển gửi sang Connectship lập tức trở về mức chuẩn xác theo đúng thể tích thực tế của từng kiện hàng, tiết kiệm ngay hàng nghìn USD chi phí chênh lệch mỗi tháng.
* **Chuẩn hóa kiến trúc dữ liệu:** Xây dựng quy chuẩn toàn team (Coding Guideline): Cấm hoàn toàn việc dùng `EnumOrdinalTypeHandler`. Mọi Enum lưu DB bắt buộc phải có thuộc tính `code` và đi qua `BaseTypeHandler`.
* **Giám sát tự động trên Datadog:** Tạo log alert trên Datadog để cảnh báo nếu payload gửi sang Connectship có sự chênh lệch bất thường giữa trọng lượng thực tế và thể tích hộp (ví dụ: trọng lượng dưới 500g nhưng gửi mã hộp `LARGE`).

---

### 6. Kịch bản trả lời phỏng vấn đầy đủ (Interview Script)

> **Người phỏng vấn hỏi:** *"Em hãy kể về một con bug mà nguyên nhân nhìn qua thì tưởng chừng rất đơn giản, nhưng hậu quả của nó lại ảnh hưởng trực tiếp đến nghiệp vụ hoặc gây thiệt hại tiền bạc cho doanh nghiệp?"*

**Bạn trả lời theo khung STAR 4 bước chuẩn mực:**

#### 1. Situation (Bối cảnh nghiệp vụ)

> *"Dạ có, trong phân hệ WES của tụi em có API `SP_AP_0020` phục vụ đóng gói đơn hàng thương mại điện tử. Tại bàn đóng gói, công nhân sẽ chọn loại thùng carton (`BoxSize: SMALL, MEDIUM, LARGE`) để đóng quần áo.
> Sau khi đóng thùng, hệ thống sẽ gọi API sang cổng vận chuyển quốc tế **Connectship** qua module `SP_ML_0011` để lấy mã vận đơn và in tem bưu cục. Phía Connectship sẽ căn cứ vào loại thùng carton này để tính toán cước phí vận chuyển theo thể tích (Dimensional Weight)."*

#### 2. Task & Root Cause (Vấn đề & Phát hiện qua Datadog)

> *"Sau một đợt release tính năng mới, phòng kế toán thông báo chi phí cước vận chuyển tháng đó bị đội lên gần 25% một cách bất thường, rất nhiều đơn hàng chỉ gồm 1 chiếc áo thun nhỏ nhưng bị tính cước của thùng to.
> Em vào **Datadog APM Trace Explorer** để soi các payload gửi sang Connectship. Em phát hiện một điểm vô lý: Rõ ràng công nhân chọn hộp nhỏ trên UI, nhưng gói tin gửi sang carrier luôn mang mã `BOX_MEDIUM`.
> Soi tiếp dữ liệu trong PostgreSQL qua Datadog DBM, em phát hiện nguyên nhân gốc rễ nằm ở **cơ chế mapping Enum của MyBatis**:
> * Trước đây dev lưu Enum xuống DB dưới dạng số nguyên thông qua `EnumOrdinalTypeHandler` (`SMALL` là 0, `MEDIUM` là 1, `LARGE` là 2).
> * Ở đợt release mới, có một bạn dev thêm loại hộp mới là `EXTRA_SMALL` và chèn vào **đầu danh sách Enum** trong code Java.
> * Việc này khiến toàn bộ chỉ số `ordinal` bị đẩy lên 1 bậc: `SMALL` từ 0 biến thành 1 (tương đương với mã `MEDIUM` cũ). Kết quả là toàn bộ các hộp nhỏ đóng mới đều bị ghi xuống DB mã số 1 và gửi sang Connectship thành hộp trung bình, gây thiệt hại chi phí cước rất lớn."*
> 
> 

#### 3. Action (Giải pháp kỹ thuật đã triển khai)

> *"Để xử lý triệt để và chống tái diễn, em đã thực hiện 3 bước:
> * *Thứ nhất, em cấm hoàn toàn việc dùng `ordinal` để lưu trữ Enum. Em tái cấu trúc Java Enum bằng cách gán cho mỗi giá trị một **Mã code chữ bất biến (Immutable Business Code)**, ví dụ `EXTRA_SMALL` có code là `'XS'`, `SMALL` là `'S'`, `MEDIUM` là `'M'`.*
> * *Thứ hai, em viết một **Custom MyBatis TypeHandler** kế thừa `BaseTypeHandler` để tự động ánh xạ giữa mã code chữ này với cột `VARCHAR` dưới cơ sở dữ liệu, đảm bảo sau này dev có chèn thêm hay đảo thứ tự khai báo Enum thì code và DB cũng không bao giờ bị xô lệch.*
> * *Thứ ba, em viết script migration dưới PostgreSQL để chuẩn hóa lại toàn bộ các bản ghi cũ sang dạng chuỗi `'S'`, `'M'`, `'L'`.*
> * *Em bổ sung một Datadog Log Alert để giám sát tỉ lệ bất thường giữa trọng lượng hàng và mã hộp gửi sang carrier."*
> 
> 

#### 4. Result (Kết quả đạt được)

> *"Nhờ giải pháp này, lỗi in sai tem và tính sai cước được chấm dứt ngay lập tức, chi phí vận chuyển của kho trở về đúng thực tế. Đây cũng là bài học lớn giúp team em chuẩn hóa lại toàn bộ Coding Convention về việc ánh xạ Enum giữa MyBatis và Database trong dự án."*