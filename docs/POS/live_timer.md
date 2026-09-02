# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: ĐỒNG HỒ ĐẾM GIỜ TRUNG TÂM (LIVE TIMER)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Hiển thị đồng hồ đếm ngược trực quan trong suốt quá trình gội đầu, giúp KTV căn chỉnh các bước gội, massage đúng định mức thời gian.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/pos/timer_section.html`
- **File JS Xử lý giao diện**: `js/Components/POS/live_timer.js` & `js/Add/pos_checkout.js`
- **Đồng bộ Realtime**: `js/Cloud/firebase_engine.js`

## 3. Quy Tắc Giao Diện & Kịch Bản Phân Quyền Chi Tiết (UI Scenarios & Permissions)
- Số đếm ngược font chữ to rõ nét, font Mono chuẩn số học.
- Thanh tiến trình chuyển màu từ Xanh (`#2E7D6D`) $
ightarrow$ Hồng cam (`#E58A7B`) $
ightarrow$ Đỏ khi quá giờ.
- Nếu quá giờ định mức $
ightarrow$ Chuyển sang đếm cộng dồn với dấu `+` (Ví dụ: `+02:15`).


### 3.3. Tính Năng Đổi & Bổ Sung Dịch Vụ Giữa Ca (Mid-Tour Service Swap):
- Cạnh tiêu đề tour có nút **`[ ✏️ Đổi / Thêm ]`** mở `modal_edit_live_services`.
- Khi dịch vụ thay đổi: Live Timer lập tức cập nhật lại `duration_target_min` và tính lại thanh tiến trình phần trăm mà không cần reset thời gian bắt đầu ca.

## 4. Luồng Xử Lý Logic & Hành Vi Hệ Thống (Business Logic)
1. Bắt đầu ca $
ightarrow$ Lưu `start_time` và cập nhật Firebase node `active_sessions/`.
2. Mỗi 1 giây chạy `setInterval` tính số giây còn lại và cập nhật thanh tiến trình.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Firebase Realtime**: `active_sessions/{tourId}`
- **Ghi vào `tb_receipts`**: Cột C (`start_time`), Cột D (`end_time`), Cột E (`duration_min`).

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`):
- `2026-09-02` (`v0.0.5.9`):
- `2026-09-02` (`v0.0.6.1`):
- `2026-09-02` (`v0.0.6.3`):
- `2026-09-02` (`v0.0.6.4`): Cập nhật `live-service-name` thành font-medium thanh thoát và gán font-mono cho toàn bộ tiền tour & tiền tip trên thẻ timeline. Chuyển định mức thời gian (`live-target-time-text`) và toàn bộ số tiền sang font-mono JetBrains Mono. Khắc phục triệt để lỗi gán innerText null và bảo vệ toàn diện các phần tử DOM trong renderLiveSessionUI. Cập nhật tiêu đề trang động thành 'ĐANG TRONG TOUR GỘI' khi có ca chạy và thay emoji 👤 bằng SVG user icon sắc nét.
- `2026-09-01` (`v0.0.3.9`):
- `2026-09-01` (`v0.0.4.3`): Thiết kế lại 3 cột thời gian chân đồng hồ (Bắt đầu và Định mức căn giữa dạng 2 tầng). Bổ sung tính năng đổi & thêm dịch vụ giữa ca kết nối với modal_edit_live_services. Bóc tách thành component độc lập.
