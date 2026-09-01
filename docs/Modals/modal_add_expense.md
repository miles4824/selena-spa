# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: MODAL GHI NHẬN CHI PHÍ TIỆM

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Cho phép Chủ Tiệm nhập nhanh các khoản chi phí vận hành tiệm (tiền điện máy lạnh, điện sấy, tiền nước, internet, thuê mặt bằng, mua sắm thêm dầu gội mỹ phẩm) để tự động tính Lợi Nhuận Ròng.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/modals/modal_add_expense.html`
- **File JS Xử lý giao diện**: `js/Components/Modals/modal_add_expense.js` & `js/Wallet/expenses.js`

## 3. Quy Tắc Giao Diện & Kịch Bản Phân Quyền Chi Tiết (UI Scenarios & Permissions)
- Chỉ tài khoản **Chủ Tiệm (Owner)** mới thấy nút `+ Thêm Chi Phí` trong Tab Thu Nhập / Tài Chính.
- Danh mục chi phí chuẩn hóa:
  - ⚡ `Điện sấy & máy lạnh`
  - 💡 `Điện sinh hoạt cố định`
  - 💧 `Tiền nước sạch`
  - 📶 `Mạng wifi internet`
  - 🏠 `Tiền thuê mặt bằng`
  - 🧴 `Mua thêm dầu gội, mỹ phẩm`
  - 📦 `Khác`
- Nhập số tiền chi ra (VNĐ) và ghi chú chi tiết.

## 4. Luồng Xử Lý Logic & Hành Vi Hệ Thống (Business Logic)
1. Tự động sinh mã chi phí: `EXP + yymmddhhmmss`.
2. Thêm vào mảng chi phí và tự động trừ vào công thức Lợi Nhuận Ròng:  
   $$	ext{Lợi Nhuận Ròng} = 	ext{Tổng Doanh Thu} - 	ext{Tổng Quỹ Lương KTV} - 	ext{Tổng Chi Phí Phát Sinh}$$

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_expenses` (7 cột).
- **Cột Đọc / Ghi**: Cột A (`expense_id`), Cột B (`date`), Cột C (`expense_type`), Cột D (`amount`), Cột E (`note`), Cột F (`payer`), Cột G (`created_at`).
- **Hàm Backend GAS phụ trách**: `addExpense(params)` trong `Code.gs`.

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Bóc tách thành component độc lập.
