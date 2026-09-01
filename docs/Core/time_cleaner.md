# 📌 ĐẶC TẢ CHI TIẾT: BỘ LÀM SẠCH THỜI GIAN (TIME CLEANER)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Triệt tiêu $100\%$ độ lệch 17 phút lịch sử do lỗi múi giờ `GMT+07:06:40` của Google Sheets (năm 1899), đảm bảo giờ hiển thị trên Web luôn đúng từng phút với đồng hồ thực tế.

## 2. Danh Sách File Cấu Thành
- **File JS Xử lý**: `js/Core/DateTime/time_cleaner.js`
- **Backend GAS**: Hàm `formatTimeVal(val)` trong `google_apps_script/Code.gs`

## 3. Quy Tắc & Công Thức Tính Toán Chi Tiết
- Bắt buộc đọc giờ phút bằng hàm `val.getHours():val.getMinutes()` trực tiếp từ đối tượng Date, không dùng `Utilities.formatDate` trên các ô chỉ chứa giờ.
- Luôn định dạng chuẩn dạng 2 chữ số: `HH:mm` (Ví dụ: `09:05`, `14:30`).

## 4. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_receipts` (Cột C `start_time`, Cột D `end_time`).

## 5. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-08-30`: Triệt tiêu hoàn toàn lỗi lệch 17 phút trên toàn hệ thống.
