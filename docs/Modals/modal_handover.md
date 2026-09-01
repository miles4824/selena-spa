# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: MODAL BÀN GIAO TOUR GỘI REALTIME

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- KTV đang làm ca nhưng phải ra về sớm, có khách hẹn trước hoặc mệt đột xuất $ightarrow$ Bàn giao toàn bộ ca đang gội cho KTV khác tiếp quản. Ca gội lập tức nhảy sang điện thoại của bạn KTV mới trong 0.03 giây.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/modals/modal_handover.html`
- **File JS Xử lý giao diện**: `js/Components/Modals/modal_handover.js`
- **Đồng bộ Realtime**: `js/Cloud/firebase_engine.js`

## 3. Quy Tắc Giao Diện & Kịch Bản Phân Quyền Chi Tiết (UI Scenarios & Permissions)
- Dropdown chọn KTV tiếp quản từ danh sách nhân sự đang rảnh.
- Chọn hình thức chia tiền: Theo số phút đã làm hoặc Chia đều 50/50.
- Hiển thị bản tóm tắt số tiền mỗi người nhận trước khi bấm bàn giao.

## 4. Luồng Xử Lý Logic & Hành Vi Hệ Thống (Business Logic)
1. KTV 1 bấm *"Bàn Giao Ca"* $ightarrow$ Firebase cập nhật node `active_sessions/{tourId}` gán KTV 2 làm người phụ trách chính.
2. Màn hình máy KTV 1 tự động đóng đồng hồ về trạng thái rảnh.
3. Màn hình máy KTV 2 lập tức mở đồng hồ đếm ngược đang chạy tiếp tục.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Firebase Realtime**: `active_sessions/{tourId}`
- **Bảng Google Sheets**: `tb_payroll_logs` (khi kết thúc tour sẽ ghi 2 dòng cho 2 KTV).

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Bóc tách thành component độc lập.
