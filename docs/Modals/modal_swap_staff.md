# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: MODAL ĐIỀU CHỈNH & ĐỔI KTV TRONG CA

## 1. Mục Đích & Bối Cảnh Nghiệp Vụ Thực Tế
- Khi đang gội đầu mà cần thêm KTV vào phụ gội/massage, hoặc KTV chính có việc bận cần chuyển giao cho KTV khác làm tiếp, modal này giúp điều chỉnh danh sách KTV và tự động phân chia tiền hoa hồng công bằng.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/modals/modal_swap_staff.html`
- **File JS Xử lý giao diện**: `js/Components/Modals/modal_swap_staff.js` & `js/Add/pos_checkout.js`
- **Hàm Toán học lõi**: `js/Core/Payroll/split_commission.js`

## 3. Quy Tắc Giao Diện & Kịch Bản Phân Quyền Chi Tiết (UI Scenarios & Permissions)

### 🟢 KỊCH BẢN 1: CHẾ ĐỘ PHÂN CHIA THEO THỜI GIAN THỰC (TÍNH THEO PHÚT)
- Hệ thống đếm chính xác KTV 1 đã làm bao nhiêu phút, KTV 2 làm bao nhiêu phút.
- Tỷ lệ hoa hồng tự động chia theo công thức: $	ext{Tỷ lệ KTV 1} = rac{	ext{Phút KTV 1}}{	ext{Tổng phút làm ca}}$.

### 🤝 KỊCH BẢN 2: CHẾ ĐỘ CHIA ĐỀU (50 / 50)
- Hai KTV thống nhất cưa đôi hoa hồng tour.
- Mỗi KTV nhận đúng $50\%$ hoa hồng của ca gội đó.

## 4. Luồng Xử Lý Logic & Hành Vi Hệ Thống (Business Logic)
1. KTV bấm nút *"Đổi / Thêm KTV"* trên đồng hồ POS $
ightarrow$ Mở modal.
2. Cho phép bấm `+ Thêm KTV vào tour này` hoặc bấm icon thùng rác để xóa bớt KTV.
3. Chọn 1 trong 2 chế độ chia tiền $
ightarrow$ Hệ thống tự tính bảng phân bổ tiền dự kiến.
4. Bấm *"Xác Nhận Thay Đổi"* $
ightarrow$ Cập nhật mảng KTV phục vụ của ca trên Firebase.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_payroll_logs`
- **Cột Đọc / Ghi**: Cột N (`commission_pct`), Cột O (`commission_amount`).
- **Hàm Backend GAS phụ trách**: `createReceipt(params)` ghi nhận từng dòng KTV tương ứng.

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Bóc tách thành component độc lập.
