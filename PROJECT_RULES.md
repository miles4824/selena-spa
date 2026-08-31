# 📜 BỘ QUY TẮC VÀNG VẬN HÀNH & PHÁT TRIỂN HỆ THỐNG SELENA SPA
*Tài liệu quy chuẩn tối thượng (Master Project Rules) dành cho toàn bộ quá trình phát triển, mở rộng và bảo trì hệ thống Selena Spa & Wellness.*

---

## 🔒 1. NGUYÊN TẮC BẢO MẬT & PHÂN QUYỀN (SECURITY & ISOLATION)

### 1.1. Phân Tách Tuyệt Đối Giữa KTV (Staff) Và Chủ Tiệm (Owner)
- Mã nguồn, component và giao diện của **KTV** và **Chủ Tiệm** phải được tách thành **2 Component/File độc lập hoàn toàn**.
- Chỉnh sửa giao diện hoặc logic của KTV **tuyệt đối không được làm ảnh hưởng đến Chủ tiệm** và ngược lại.

### 1.2. Bảo Mật Số Điện Thoại Khách Hàng
- **Kỹ Thuật Viên (Staff)**: Số điện thoại hiển thị trên màn hình và modal luôn phải được che: `094*144`.
- **Chủ Tiệm (Owner)**: Hiển thị đầy đủ số điện thoại: `0949251144`.
- **Lưu dữ liệu**: Bất kể lưu từ màn hình nào, hệ thống phải luôn tra cứu và gửi **Số điện thoại thật 10 số (`0949251144`)** về máy chủ, **tuyệt đối không bao giờ gửi chuỗi bị cắt ngắn (như `94144`) gây sinh dòng rác trên Google Sheets**.

### 1.3. Quy Tắc Tháng Sinh Nhật Khách Hàng
- **Khách CHƯA CÓ tháng sinh**: Cả KTV và Chủ tiệm đều thấy ô chọn tháng để KTV hỏi khách và lưu lại lần đầu.
- **Khách ĐÃ CÓ tháng sinh**:
  - **ẨN HOÀN TOÀN Ô CHỌN THÁNG KHỎI GIAO DIỆN KTV**. KTV chỉ nhìn thấy dòng chữ `• Sinh nhật: Tháng X` ở tiêu đề và **không có quyền can thiệp hay sửa đổi**.
  - **Chỉ có Chủ Tiệm** mới có toàn quyền xem và thay đổi tháng sinh nhật của khách.

---

## 👥 2. NGUYÊN TẮC KTV, CA LÀM & ĐỒNG NGHIỆP CÙNG LÀM (STAFF & WORKFLOW)

### 2.1. Hiển Thị Bạn Cùng Làm (Partner KTV)
- Khi một tour gội có từ 2 KTV cùng phục vụ:
  - Trên thẻ tour của KTV 1 phải hiện rõ: `KTV cùng làm: [Tên KTV 2]`.
  - Trên thẻ tour của KTV 2 phải hiện rõ: `KTV cùng làm: [Tên KTV 1]`.
- Nhãn hiển thị thu nhập trên thẻ tour của KTV phải dùng ngôn ngữ thân thiện:
  - Dùng nhãn: **`Tiền tour:`** (thay vì Hoa hồng tour phức tạp).
  - Dùng nhãn: **`Tiền tip:`** (thay vì Tiền tip nhận được).

### 2.2. Phân Chia Thu Nhập Ca Làm Chung
- Khi có 2 KTV cùng làm 1 ca:
  - Chế độ **Theo thời gian thực (Timer)**: Hoa hồng tour được tự động tính theo tỷ lệ số phút thực tế KTV 1 và KTV 2 đã phục vụ.
  - Chế độ **Chia đều (Equal 50/50)**: Hoa hồng tour được chia đôi $50\% - 50\%$.
- Tiền tip của ca được chia đều hoặc theo thỏa thuận trực tiếp giữa 2 KTV.

### 2.3. Bàn Giao Tour (Handover)
- Khi KTV cần chuyển tour cho bạn khác làm tiếp (do mệt/bận việc):
  - Hệ thống phải đồng bộ ca làm sang máy của KTV tiếp quản qua Firebase Realtime Database trong vòng **0.03 giây**.
  - Tự động chốt số phút KTV trước đã làm để tính tiền chính xác.

---

## 💰 3. NGUYÊN TẮC TÍNH TOÁN & KẾ TOÁN (PAYROLL & FINANCE)

### 3.1. Hoa Hồng Tour Của KTV
- KTV hưởng hoa hồng theo loại hợp đồng trong `tb_users`:
  - Loại 1: `10% + Lương cứng`.
  - Loại 2: `20% Thuần tour`.
- **Khách dùng Voucher**: Khách được giảm giá/miễn phí, nhưng KTV **VẪN ĐƯỢC TÍNH HOA HỒNG THEO GIÁ GỐC NIÊM YẾT CỦA COMBO**.
- Tiền tip $100\%$ thuộc về KTV, tiệm không trích phần trăm từ tiền tip.

### 3.2. Chu Kỳ Tính Lương Tháng (1 - 30)
- Chu kỳ tính lương của tiệm được chốt từ **ngày 1 đến ngày 30 của mỗi tháng**.
- Bảng lương tháng = $\text{Hoa hồng tour} + \text{Tiền tip} + \text{Lương cứng (nếu có)} + \text{Phụ cấp/Thưởng}$.

### 3.3. Quản Lý Chi Phí & Báo Cáo Lợi Nhuận Tiệm
- Phân loại chi phí gồm: `Điện sấy & máy lạnh`, `Điện sinh hoạt cố định`, `Tiền nước sạch`, `Mạng Internet`, `Tiền thuê mặt bằng`, `Mỹ phẩm & Dầu gội`, `Khác`.
- Báo cáo Lợi Nhuận Ròng (Net Profit) = $\text{Tổng Doanh Thu} - \text{Tổng Quỹ Lương KTV} - \text{Tổng Chi Phí Vận Hành}$.
- Phân loại rõ ràng 2 nguồn tiền:
  - **Tiền mặt**: Tiền có trong két tại tiệm.
  - **Chuyển khoản**: Tiền chuyển về tài khoản ngân hàng VIB của chủ tiệm (`TRẦN THU NGÂN - 799625591`).

---

## 🌸 4. NGUYÊN TẮC MENU DỊCH VỤ, LÀM THÊM & SẢN PHẨM (MENU & ADD-ONS)

### 4.1. Phân Loại Danh Mục (`tb_menu`)
- 🌸 **Gói Combo Chính (`combo`)**: Combo 1 (50p - 64k), Combo 2 (60p - 99k)... Bắt buộc chọn 1 gói khi tạo ca.
- 💆 **Dịch Vụ Làm Thêm (`addon`)**: Massage Cổ Vai Gáy (15p - 40k), Tẩy da đầu (10p - 30k), Đắp mặt nạ (10p - 25k)... Chọn nhiều tùy ý.
- 🧴 **Sản Phẩm Bán Kèm (`product`)**: Dầu gội bưởi, Serum dưỡng tóc...

### 4.2. Quy Tắc Cộng Dồn Thời Lượng & Bảng Giá
- Thời lượng đếm ngược tự động tính: $\text{Thời lượng Combo chính} + \text{Thời lượng Dịch vụ làm thêm (Add-ons)}$. *(Sản phẩm bán kèm có thời lượng = 0p)*.
- Tổng tiền bill = $\text{Giá Combo} + \text{Giá Dịch vụ thêm} + \text{Giá Sản phẩm bán kèm}$.

---

## ⏱️ 5. NGUYÊN TẮC TẠO TOUR & THANH TOÁN KÍN ĐÁO (POS & SESSIONS)

### 5.1. Quy Trình Thanh Toán 2 Pha
- **Pha 1 (Đưa khách xem)**: Hiển thị Tên dịch vụ, Tổng tiền, Mã QR VIB tiệm (Hoàn toàn giấu kín chữ Tip để giữ lịch sự).
- **Pha 2 (Riêng tư KTV)**: KTV tự nhập tiền tip nhận được một cách kín đáo và hoàn tất lưu hóa đơn.

---

## 📅 6. NGUYÊN TẮC LỊCH & THỜI GIAN (DATETIME)

### 6.1. Khóa Các Ngày Tương Lai
- Toàn bộ các ngày chưa diễn ra trên thanh trượt tuần (Weekly Strip) và modal lịch tháng (Month Picker) **phải được làm mờ nhẹ và khóa bấm (`pointer-events-none`)**.

### 6.2. Triệt Tiêu Lệch Múi Giờ
- Giờ phút bắt đầu/kết thúc phải lấy trực tiếp từ giờ thực tế `getHours():getMinutes()`, **tuyệt đối không dùng hàm định dạng năm 1899 gây lệch 17 phút**.

---

## 🎁 7. NGUYÊN TẮC CHU KỲ 60 NGÀY & VOUCHER (LOYALTY)

### 7.1. Chu Kỳ Tích Điểm 60 Ngày
- Mỗi chu kỳ kéo dài đúng 60 ngày kể từ lần ghé đầu tiên.
- Khách tích lũy đủ **10 lượt gội trong chu kỳ 60 ngày** $\rightarrow$ Hệ thống tự động tặng **1 Voucher gội miễn phí (100%)**.

### 7.2. Quản Lý Voucher
- Voucher gồm 3 loại: `Chủ tiệm tặng`, `Giảm 20% sinh nhật`, `Giảm tiền mặt`.
- Hạn sử dụng: `30 ngày`, `60 ngày`, hoặc `90 ngày`. Sau thời gian này voucher tự động hết hạn.

---

## 📢 8. NGUYÊN TẮC THÔNG BÁO NỘI BỘ (ANNOUNCEMENT)
- Thông báo do Chủ tiệm phát qua `modal-edit-announcement` được lưu vào `tb_config` (khóa `announcement`) và phát đồng thời lên Firebase Realtime Database.
- Toàn bộ KTV khi mở app phải nhìn thấy banner thông báo này ngay trên đỉnh màn hình Home KTV.

---

## 📊 9. QUY TẮC CẤU TRÚC 8 BẢNG GOOGLE SHEETS
1. **`tb_users`**: `phone, full_name, role, staff_id, salary_type, base_salary, commission_rate, password, avatar_url, is_active, created_at`.
2. **`tb_menu`**: `service_id, service_name, price, duration_min, category, is_active`.
3. **`tb_customers`**: `phone_number, customer_name, birthday, cycle_start_date, cycle_visits, total_visits, voucher_count, notes`.
4. **`tb_receipts`** (16 cột): `receipt_id, date, start_time, end_time, duration_min, customer_phone, customer_name, service_id, service_name, price, tip_amount, total_paid, staff_names, payment_method, is_voucher_used, created_at`.
5. **`tb_payroll_logs`** (19 cột): `log_id, receipt_id, date, start_time, end_time, duration_min, customer_name, service_name, price, staff_phone, staff_id, staff_name, role_in_tour, commission_pct, commission_amount, tip_amount, total_earned, payment_method, created_at`.
6. **`tb_loyalty_cycles`**: `cycle_id, phone_number, customer_name, start_date, end_date, visit_count, is_rewarded, rewarded_at, status`.
7. **`tb_vouchers`**: `voucher_id, phone_number, customer_name, voucher_type, discount_value, expiry_date, status, used_at, notes`.
8. **`tb_expenses`**: `expense_id, date, expense_type, amount, note, created_at`.
9. **`tb_config`**: `config_key, config_value, description, updated_at`.

---

## 🏛️ 10. NGUYÊN TẮC LẬP TRÌNH & KIẾN TRÚC CODE
1. **Tuyệt đối không tự ý thay đổi cấu trúc hay logic nghiệp vụ mà không thảo luận và xin phép người dùng.**
2. **Single Source of Truth**: Mỗi công thức (SĐT, tiền nong, ngày giờ) chỉ được viết ở 1 file duy nhất trong `js/Core/`.
3. **Micro-Components**: Mỗi Modal, Thẻ, Nút bấm là 1 file độc lập siêu ngắn gọn (30 - 80 dòng).
4. **Kiểm tra cú pháp trước khi triển khai**: Luôn chạy Node.js kiểm tra toàn bộ file JS trước khi commit và push lên GitHub Pages.
