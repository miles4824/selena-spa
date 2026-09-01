# 📌 ĐẶC TẢ CHI TIẾT: THẺ HỒ SƠ KHÁCH HÀNG (CUSTOMER PROFILE CARD)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Hiển thị thẻ khách hàng trong mục Danh Bạ Khách 60 Ngày của Chủ Tiệm: xem tổng số lần ghé, tiến trình tích 10 lần gội, sinh nhật, số voucher hiện có và nút tặng voucher.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/owner/home.html`
- **File JS Xử lý**: `js/Components/Cards/customer_profile_card.js` & `js/Home/home_dashboard.js`

## 3. Quy Tắc Giao Diện & Phân Quyền Chi Tiết (UI & Permissions)
- Hiển thị đầy đủ SĐT 10 số.
- Nhãn sinh nhật màu vàng `🎂 Sinh nhật T[X]` nếu khách có sinh nhật trong tháng hiện tại.
- Thanh tiến trình chu kỳ 60 ngày (`X / 10 ca`) và hạn chót 60 ngày.
- Nút bấm: *"Sửa Info"* (mở `modal_owner_customer`) và *"Tặng Voucher"* (mở `modal_gift_voucher`).

## 4. Luồng Xử Lý Logic & Công Thức Toán Học (Business Logic)
- Tính toán chu kỳ qua `CycleTracker.calculateCycle(startDate, visits)`.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_customers` (8 cột).

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Bóc tách thành component độc lập.
