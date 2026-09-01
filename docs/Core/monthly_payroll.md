# 📌 ĐẶC TẢ CHI TIẾT: CÔNG THỨC TÍNH LƯƠNG THÁNG (MONTHLY PAYROLL)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Tính tổng thu nhập và bảng lương tháng cho từng KTV theo đúng chu kỳ từ ngày 1 đến ngày 30 hàng tháng.

## 2. Danh Sách File Cấu Thành
- **File JS Xử lý**: `js/Core/Payroll/monthly_payroll.js` & `js/Wallet/payroll.js`

## 3. Quy Tắc & Công Thức Tính Toán Chi Tiết
- **Chu kỳ tính lương**: Lọc toàn bộ các ca có ngày từ `01` đến `30` (hoặc `31`) của tháng đó.
- **Công thức Tổng Thu Nhập**:
  $$	ext{Tổng Thu Nhập Tháng} = 	ext{Lương Cứng} + \sum 	ext{Hoa Hồng Tour} + \sum 	ext{Tiền Tips}$$

## 4. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_payroll_logs` (lọc theo cột `date` và `staff_phone`).

## 5. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Chuẩn hóa chu kỳ tính lương 1 - 30.
