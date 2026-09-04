# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: CÔNG THỨC TÍNH LỢI NHUẬN RÒNG (PROFIT CALCULATOR)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Giúp Chủ Tiệm nắm bắt bức tranh tài chính chuẩn xác: Tiệm kiếm được bao nhiêu, chi trả lương bao nhiêu, chi phí phát sinh bao nhiêu và thực lãi mang về túi là bao nhiêu.

## 2. Danh Sách File Cấu Thành
- **File JS Xử lý**: `js/Core/Finance/profit_calculator.js` & `js/Screens/Owner/owner_wallet_screen.js`

## 3. Quy Tắc & Công Thức Tính Toán Chi Tiết
$$	ext{Lợi Nhuận Ròng} = 	ext{Tổng Doanh Thu Dịch Vụ} - 	ext{Tổng Quỹ Lương KTV} - 	ext{Tổng Chi Phí Tiệm}$$
- **Phân loại dòng tiền**:
  - **Tiền mặt trong két**: Các ca thanh toán tiền mặt - Các khoản chi trả bằng tiền mặt.
  - **Tiền trong tài khoản VIB**: Các ca khách quét mã QR ngân hàng VIB (`799625591`).

## 4. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_receipts` (Doanh thu), `tb_payroll_logs` (Quỹ lương), `tb_expenses` (Chi phí).

## 5. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Chuẩn hóa công thức Lợi Nhuận Ròng.
