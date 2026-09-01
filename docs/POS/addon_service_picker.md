# 📌 ĐẶC TẢ CHI TIẾT: CỤM CHỌN DỊCH VỤ LÀM THÊM (ADD-ONS PICKER)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Cho phép chọn các dịch vụ khách làm thêm (ví dụ: Massage cổ vai gáy +40k 15p, Đắp mặt nạ thảo dược +30k 10p, Tẩy tế bào chết da đầu +50k 15p).

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/pos/combo_section.html`
- **File JS Xử lý**: `js/Components/POS/addon_service_picker.js`
- **Hàm Tính Giờ & Tiền**: `js/Core/Menu/duration_calculator.js` & `js/Core/Menu/service_pricing.js`

## 3. Quy Tắc Giao Diện & Phân Quyền Chi Tiết (UI & Permissions)
- Nút bấm dạng thẻ có dấu `+` và hiển thị rõ số phút và số tiền cộng thêm.
- Cho phép chọn nhiều dịch vụ cùng lúc (Multi-select).

## 4. Luồng Xử Lý Logic & Công Thức Toán Học (Business Logic)
- **Tự động cộng dồn thời lượng**:
  $$	ext{Tổng phút} = 	ext{Phút Combo chính} + \sum 	ext{Phút Dịch vụ thêm}$$
- **Tự động cộng dồn tiền ca**:
  $$	ext{Tổng giá ca} = 	ext{Giá Combo chính} + \sum 	ext{Giá Dịch vụ thêm}$$

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_menu` (các dòng có `category = "addon"`).
- **Lưu vào `tb_receipts`**: Cột I (`service_name` = `Combo 1 + Cổ vai gáy`), Cột J (`price` = Tổng tiền).

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Thiết lập cơ chế tự cộng dồn giờ và tiền.
