# 📌 ĐẶC TẢ CHI TIẾT: MODAL ĐIỀU CHỈNH / ĐỔI KTV TRONG CA

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Cho phép đổi KTV, thêm hoặc bớt KTV đang phục vụ ca gội giữa chừng và chọn hình thức phân chia hoa hồng công bằng.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/modals/modal_swap_staff.html`
- **File JS Xử lý**: `js/Components/Modals/modal_swap_staff.js` & `js/Add/pos_checkout.js`
- **Hàm Toán học**: `js/Core/Payroll/split_commission.js`

## 3. Quy Tắc Giao Diện & Phân Quyền Chi Tiết (UI & Permissions)
- Danh sách KTV phục vụ tour hiển thị dạng danh sách động.
- Cho phép bấm `+ Thêm KTV vào tour này` hoặc bấm xóa KTV.
- Chọn hình thức phân chia hoa hồng:
  - ⏱️ **Theo thời gian thực**: Tính tỷ lệ % theo số phút thực tế từng người đã làm.
  - 🤝 **Chia đều**: Cưa đôi 50/50 hoa hồng tour.

## 4. Luồng Xử Lý Logic & Công Thức Toán Học (Business Logic)
- **Chế độ theo phút**: $	ext{Tỷ lệ KTV 1} = rac{	ext{Phút KTV 1}}{	ext{Tổng phút làm ca}}$.
- **Chế độ chia đều**: Mỗi KTV nhận $rac{100\%}{	ext{Số lượng KTV}}$.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_payroll_logs`
- **Cột Đọc / Ghi**: Cột N (`commission_pct`), Cột O (`commission_amount`).
- **Hàm Backend GAS phụ trách**: `createReceipt(params)` ghi nhận từng dòng KTV tương ứng.

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Bóc tách thành component độc lập.
