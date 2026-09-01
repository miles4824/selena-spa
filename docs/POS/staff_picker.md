# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: CỤM PHÂN BỔ KỸ THUẬT VIÊN (STAFF PICKER)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Phân bổ KTV phục vụ ca gội (KTV 1 chính và các KTV phụ cùng làm).

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/pos/staff_section.html`
- **File JS Xử lý giao diện**: `js/Components/POS/staff_picker.js` & `js/Add/pos_checkout.js`

## 3. Quy Tắc Giao Diện & Kịch Bản Phân Quyền Chi Tiết (UI Scenarios & Permissions)
- 👩‍🦰 **Khi KTV đăng nhập**: Ô KTV 1 được **khóa cố định vào tài khoản của KTV đó** (có icon ổ khóa `🔒`), không cho KTV chọn tên người khác làm KTV chính.
- 👑 **Khi Chủ tiệm đăng nhập**: Toàn quyền chọn bất kỳ ai làm KTV chính.
- Nút `+ Thêm Kỹ Thuật Viên Cùng Làm / Phụ` cho phép thêm KTV 2, KTV 3 làm cùng.

## 4. Luồng Xử Lý Logic & Hành Vi Hệ Thống (Business Logic)
- Hiển thị ước tính tiền hoa hồng nhận được ngay bên cạnh tên KTV (`+6.400 đ`).

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_users` (danh sách nhân sự) $
ightarrow$ Ghi vào `tb_payroll_logs`.

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Bóc tách thành component độc lập.
