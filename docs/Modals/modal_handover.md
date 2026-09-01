# 📌 ĐẶC TẢ CHI TIẾT: MODAL BÀN GIAO TOUR GỘI (REALTIME HANDOVER)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- KTV đang làm ca nhưng bận việc hoặc mệt đột xuất $ightarrow$ Bàn giao tour cho KTV khác vào làm tiếp. Hệ thống tự động chuyển ca sang máy bạn ấy trong 0.03 giây và tự chia hoa hồng.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/modals/modal_handover.html`
- **File JS Xử lý**: `js/Components/Modals/modal_handover.js` & `js/Add/pos_checkout.js`
- **Đồng bộ Realtime**: `js/Cloud/firebase_engine.js`

## 3. Quy Tắc Giao Diện & Phân Quyền Chi Tiết (UI & Permissions)
- Chọn KTV tiếp quản từ danh sách nhân sự đang rảnh.
- Chọn hình thức chia tiền: Theo số phút đã làm hoặc Chia đều 50/50.
- Hiển thị bảng tóm tắt dự kiến phân bổ hoa hồng trước khi bấm xác nhận.

## 4. Luồng Xử Lý Logic & Công Thức Toán Học (Business Logic)
1. KTV 1 bấm bàn giao $ightarrow$ Firebase cập nhật node `active_sessions/` với KTV 2 là người tiếp quản.
2. Màn hình của KTV 1 đóng lại, màn hình của KTV 2 lập tức mở đồng hồ đếm giờ ca gội tiếp tục chạy.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Firebase Realtime**: `active_sessions/{tourId}`
- **Bảng Google Sheets**: `tb_payroll_logs` (khi kết thúc tour sẽ ghi 2 dòng cho 2 KTV).

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Bóc tách thành component độc lập.
