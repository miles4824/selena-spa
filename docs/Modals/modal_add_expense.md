# 📌 ĐẶC TẢ CHI TIẾT: MODAL NHẬP CHI PHÍ TIỆM

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Cho phép Chủ Tiệm ghi nhận nhanh các khoản chi phí phát sinh (tiền điện sấy, điện sinh hoạt, tiền nước, internet, mặt bằng, mua thêm dầu gội mỹ phẩm) để tự động tính Lợi Nhuận Ròng.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/modals/modal_add_expense.html`
- **File JS Xử lý**: `js/Components/Modals/modal_add_expense.js` & `js/Wallet/expenses.js`

## 3. Quy Tắc Giao Diện & Phân Quyền Chi Tiết (UI & Permissions)
- Chỉ có tài khoản **Chủ Tiệm (Owner)** mới thấy nút thêm chi phí trong Tab Tài Chính.
- Chọn loại chi phí: `Điện sấy & máy lạnh`, `Điện sinh hoạt cố định`, `Tiền nước sạch`, `Mạng wifi internet`, `Tiền thuê mặt bằng`, `Mua thêm dầu gội, mỹ phẩm`, `Khác`.
- Nhập số tiền (VNĐ) và ghi chú chi tiết.

## 4. Luồng Xử Lý Logic & Công Thức Toán Học (Business Logic)
1. Tự động sinh mã chi phí: `EXP + yymmddhhmmss`.
2. Lưu vào mảng chi phí và trừ vào công thức Lợi Nhuận Ròng:  
   $$	ext{Lợi Nhuận Ròng} = 	ext{Tổng Doanh Thu} - 	ext{Tổng Quỹ Lương KTV} - 	ext{Tổng Chi Phí Phát Sinh}$$

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_expenses` (7 cột)
- **Cột Đọc / Ghi**: Cột A (`expense_id`), Cột B (`date`), Cột C (`expense_type`), Cột D (`amount`), Cột E (`note`), Cột F (`payer`), Cột G (`created_at`).
- **Hàm Backend GAS phụ trách**: `addExpense(params)` trong `Code.gs`.

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Bóc tách thành component độc lập.
