# 📌 ĐẶC TẢ CHI TIẾT: ĐỒNG HỒ ĐẾM GIỜ TRUNG TÂM (LIVE TIMER)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Hiển thị đồng hồ đếm ngược trực quan trong suốt quá trình gội đầu, giúp KTV căn chỉnh các bước gội, massage đúng định mức thời gian.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/pos/timer_section.html`
- **File JS Xử lý**: `js/Components/POS/live_timer.js` & `js/Add/pos_checkout.js`
- **Đồng bộ Realtime**: `js/Cloud/firebase_engine.js`

## 3. Quy Tắc Giao Diện & Phân Quyền Chi Tiết (UI & Permissions)
- Số đếm ngược font chữ to rõ nét, font Mono chuẩn số học.
- Thanh tiến trình chuyển màu từ Xanh (`#2E7D6D`) $ightarrow$ Hồng cam (`#E58A7B`) $ightarrow$ Đỏ khi quá giờ.
- Nếu quá giờ định mức $ightarrow$ Chuyển sang đếm cộng dồn với dấu `+` (Ví dụ: `+02:15`).

## 4. Luồng Xử Lý Logic & Công Thức Toán Học (Business Logic)
1. Bắt đầu ca $ightarrow$ Lưu `start_time` và cập nhật Firebase node `active_sessions/`.
2. Mỗi 1 giây chạy `setInterval` tính số giây còn lại và cập nhật thanh tiến trình.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Firebase Realtime**: `active_sessions/{tourId}`
- **Ghi vào `tb_receipts`**: Cột C (`start_time`), Cột D (`end_time`), Cột E (`duration_min`).

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Bóc tách thành component độc lập.
