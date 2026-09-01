# 📜 QUY TẮC VÀNG VẬN HÀNH & PHÁT TRIỂN HỆ THỐNG SELENA SPA
*Tài liệu nguyên tắc bất di bất dịch (Project Master Rules) dành cho việc phát triển và bảo trì Selena Spa.*

---

## 🔒 1. NGUYÊN TẮC BẢO MẬT & PHÂN QUYỀN (SECURITY & ISOLATION)

### 1.1. Phân Tách Tuyệt Đối Giữa KTV (Staff) Và Chủ Tiệm (Owner)
- Mã nguồn và giao diện của **KTV** và **Chủ Tiệm** phải được tách thành **2 Component/File độc lập**.
- Chỉnh sửa giao diện hoặc logic của KTV **tuyệt đối không được làm ảnh hưởng đến Chủ tiệm** và ngược lại.

### 1.2. Bảo Mật Số Điện Thoại Khách Hàng
- **Kỹ Thuật Viên (Staff)**: Số điện thoại phải luôn được che bảo mật: `094*144`.
- **Chủ Tiệm (Owner)**: Hiển thị đầy đủ số điện thoại: `0949251144`.
- **Lưu dữ liệu**: Bất kể lưu từ màn hình nào, hệ thống phải luôn tra cứu và gửi **Số điện thoại thật 10 số (`0949251144`)** về máy chủ, **tuyệt đối không bao giờ gửi chuỗi bị cắt ngắn (như `94144`) gây sinh dòng rác trên Google Sheets**.

### 1.3. Quy Tắc Tháng Sinh Nhật Khách Hàng
- **Khách CHƯA CÓ tháng sinh**:
  - Cả KTV và Chủ tiệm đều thấy ô chọn tháng để KTV hỏi khách và lưu lại lần đầu.
- **Khách ĐÃ CÓ tháng sinh**:
  - **ẨN HOÀN TOÀN Ô CHỌN THÁNG KHỎI GIAO DIỆN KTV**. KTV chỉ nhìn thấy dòng chữ `• Sinh nhật: Tháng X` ở tiêu đề và **không có quyền can thiệp hay sửa đổi**.
  - **Chỉ có Chủ Tiệm** mới có toàn quyền xem và thay đổi tháng sinh nhật của khách.

---

## 💰 2. NGUYÊN TẮC TÍNH TIỀN & HOA HỒNG (PAYROLL & FINANCE)

### 2.1. Hoa Hồng Tour Của KTV
- KTV hưởng hoa hồng theo loại hợp đồng trong `tb_users`:
  - Loại 1: `10% + Lương cứng`.
  - Loại 2: `20% Thuần tour`.
- Khi có 2 KTV cùng phục vụ 1 tour: Hoa hồng được chia theo thỏa thuận ca làm (**Theo thời gian thực tế** hoặc **Chia đều 50/50**).
- **Khách dùng Voucher**: Khách được giảm giá/miễn phí, nhưng KTV **VẪN ĐƯỢC TÍNH HOA HỒNG THEO GIÁ GỐC NIÊM YẾT CỦA COMBO**.

### 2.2. Tiền Tip Của KTV
- $100\%$ tiền tip thuộc về KTV, tiệm không thu bất kỳ khoản trích nào từ tiền tip.
- Nếu 2 KTV cùng làm, tiền tip được chia đều hoặc theo thỏa thuận của 2 bạn.

### 2.3. Tính Lương Hàng Tháng (Chu Kỳ 1 - 30)
- Chu kỳ tính lương của tiệm được chốt từ **ngày 1 đến ngày 30 của mỗi tháng**.
- Bảng lương tháng = $\text{Hoa hồng tour} + \text{Tiền tip} + \text{Lương cứng (nếu có)} + \text{Phụ cấp/Thưởng}$.

### 2.4. Báo Cáo Lợi Nhuận Tiệm
- $\text{Lợi Nhuận Ròng (Net Profit)} = \text{Tổng Doanh Thu} - \text{Tổng Quỹ Lương KTV} - \text{Tổng Chi Phí Vận Hành}$.
- Phân loại rõ ràng 2 nguồn tiền: **Tiền mặt có trong két** vs **Tiền chuyển khoản vào tài khoản VIB**.

---

## ⏱️ 3. NGUYÊN TẮC TẠO TOUR & THANH TOÁN (POS & SESSIONS)

### 3.1. Cộng Dồn Thời Lượng & Bảng Giá
- Thời lượng đếm ngược tự động tính: $\text{Thời lượng Combo chính} + \text{Thời lượng Dịch vụ làm thêm (Add-ons)}$.
- Tổng tiền = $\text{Giá Combo} + \text{Giá Dịch vụ thêm} + \text{Giá Sản phẩm bán kèm}$.

### 3.2. Quy Trình Thanh Toán 2 Pha Kín Đáo
- **Pha 1 (Đưa khách xem)**: Hiển thị Tên dịch vụ, Tổng tiền, Mã QR VIB tiệm (Hoàn toàn giấu kín chữ Tip).
- **Pha 2 (Riêng tư KTV)**: KTV tự nhập tiền tip nhận được một cách kín đáo và hoàn tất lưu hóa đơn.

---

## 📅 4. NGUYÊN TẮC LỊCH & THỜI GIAN (DATETIME)

### 4.1. Khóa Các Ngày Tương Lai
- Toàn bộ các ngày chưa diễn ra trên thanh trượt tuần (Weekly Strip) và modal lịch tháng (Month Picker) **phải được làm mờ nhẹ và khóa bấm (`pointer-events-none`)**.

### 4.2. Triệt Tiêu Lệch Múi Giờ
- Giờ phút bắt đầu/kết thúc phải lấy trực tiếp từ giờ thực tế `getHours():getMinutes()`, **tuyệt đối không dùng hàm định dạng năm 1899 gây lệch 17 phút**.

---

## 🎁 5. NGUYÊN TẮC CHU KỲ 60 NGÀY & VOUCHER

### 5.1. Chu Kỳ Tích Điểm 60 Ngày
- Mỗi chu kỳ kéo dài đúng 60 ngày kể từ lần ghé đầu tiên.
- Khách tích lũy đủ **10 lượt gội trong chu kỳ 60 ngày** $\rightarrow$ Hệ thống tự động tặng **1 Voucher gội miễn phí (100%)**.

### 5.2. Quản Lý Voucher
- Voucher gồm 3 loại: `Chủ tiệm tặng`, `Giảm 20% sinh nhật`, `Giảm tiền mặt`.
- Hạn sử dụng: `30 ngày`, `60 ngày`, hoặc `90 ngày`. Sau thời gian này voucher tự động hết hạn.

---

## 🏛️ 6. NGUYÊN TẮC LẬP TRÌNH & KIẾN TRÚC CODE

1. **Không tự ý thay đổi cấu trúc hay logic nghiệp vụ mà không thảo luận và xin phép người dùng.**
2. **Single Source of Truth**: Mỗi công thức (SĐT, tiền nong, ngày giờ) chỉ được viết ở 1 file duy nhất trong `js/Core/`.
3. **Micro-Components**: Mỗi Modal, Thẻ, Nút bấm là 1 file độc lập siêu ngắn gọn (30 - 80 dòng).
4. **Kiểm tra cú pháp trước khi triển khai**: Luôn chạy Node.js kiểm tra toàn bộ file JS trước khi commit và push lên GitHub Pages.
