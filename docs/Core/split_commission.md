# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: CÔNG THỨC PHÂN CHIA HOA HỒNG 2 KTV (SPLIT COMMISSION)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Phân chia công bằng hoa hồng của ca gội khi có 2 hoặc nhiều KTV cùng phục vụ (hoặc đổi ca giữa chừng).

## 2. Danh Sách File Cấu Thành
- **File JS Xử lý**: `js/Core/Payroll/split_commission.js`

## 3. Quy Tắc & Công Thức Tính Toán Chi Tiết
- **Chế độ 1: Phân chia theo thời gian thực (Tính theo phút)**:
  $$	ext{Tỷ lệ KTV 1} = rac{	ext{Số phút KTV 1 làm}}{	ext{Tổng số phút ca}}, \quad 	ext{Tỷ lệ KTV 2} = 1 - 	ext{Tỷ lệ KTV 1}$$
  $$	ext{Hoa hồng KTV 1} = 	ext{Tổng hoa hồng ca} 	imes 	ext{Tỷ lệ KTV 1}$$
- **Chế độ 2: Chia đều (50 / 50)**:
  $$	ext{Hoa hồng KTV 1} = 	ext{Hoa hồng KTV 2} = 	ext{Tổng hoa hồng ca} 	imes 50\%$$

## 4. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- Ghi 2 dòng riêng biệt vào `tb_payroll_logs` cho 2 KTV tương ứng.

## 5. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-02` (`v0.0.7.2`): Tách biệt công thức tính hoa hồng theo rate cá nhân của từng KTV (người 10%, người 20%) nhân với % phân bổ ca.
- `2026-09-01` (`v0.0.0.1`): Chuẩn hóa thuật toán chia tiền.
