# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: CÔNG THỨC HOA HỒNG TOUR (TOUR COMMISSION)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Tính toán chính xác số tiền hoa hồng KTV được nhận sau mỗi ca gội đầu dựa theo hợp đồng lao động của từng nhân sự.

## 2. Danh Sách File Cấu Thành
- **File JS Xử lý**: `js/Core/Payroll/tour_commission.js`

## 3. Quy Tắc & Công Thức Tính Toán Chi Tiết
- **Loại 1: Hợp đồng 10% + Lương cứng (`fixed_10pct`)**:
  $$	ext{Hoa hồng} = 	ext{Giá gốc combo} 	imes 10\%$$
- **Loại 2: Hợp đồng 20% Thuần tour (`20pct_tour`)**:
  $$	ext{Hoa hồng} = 	ext{Giá gốc combo} 	imes 20\%$$
- **Quy Tắc Khách Dùng Voucher Miễn Phí (100%)**:
  - Dù bill khách thanh toán 0 đ, KTV **VẪN ĐƯỢC HƯỞNG ĐỦ HOA HỒNG THEO GIÁ GỐC NIÊM YẾT CỦA COMBO** (Chủ tiệm chi trả phần này).
- **Quy Tắc Tiền Tips**:
  - Tiền Tips thuộc về KTV $100\%$, tiệm không thu bất kỳ khoản phế nào.

## 4. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_users` (Cột G `salary_type`, Cột H `commission_rate`) $
ightarrow$ Ghi vào `tb_payroll_logs` (Cột N `commission_pct`, Cột O `commission_amount`).

## 5. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Đưa vào module Core toán học độc lập.
