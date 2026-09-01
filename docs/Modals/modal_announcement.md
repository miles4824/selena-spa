# 📌 ĐẶC TẢ CHI TIẾT: MODAL PHÁT THÔNG BÁO NỘI BỘ

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Cho phép Chủ Tiệm gửi thông báo nội bộ (lịch họp, quy định mới, chúc mừng) xuất hiện ngay tức thì trên đỉnh đầu màn hình Home của toàn bộ Kỹ Thuật Viên.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/modals/modal_announcement.html`
- **File JS Xử lý**: `js/Components/Modals/modal_announcement.js` & `js/Home/announcement.js`
- **Đồng bộ Realtime**: `js/Cloud/firebase_engine.js`

## 3. Quy Tắc Giao Diện & Phân Quyền Chi Tiết (UI & Permissions)
- Chỉ **Chủ Tiệm (Owner)** mới thấy icon chỉnh sửa thông báo trên màn hình Home.
- Nội dung hiển thị dạng khung nổi bật có icon loa phát thanh `megaphone`.

## 4. Luồng Xử Lý Logic & Công Thức Toán Học (Business Logic)
1. Chủ tiệm nhập nội dung và bấm *"Phát Thông Báo"*.
2. Cập nhật ngay vào Firebase node `announcement/content` (KTV nhận trong 0.03s mà không cần tải lại trang).
3. Gọi API lưu vào Google Sheets tab `tb_config`.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_config`
- **Cột Đọc / Ghi**: Cột A (`key = "global_announcement"`), Cột B (`value = [Nội dung]`).
- **Firebase Realtime**: `announcement/content`

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Bóc tách thành component độc lập.
