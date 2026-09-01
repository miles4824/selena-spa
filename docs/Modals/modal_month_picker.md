# 📌 ĐẶC TẢ CHI TIẾT: MODAL CHỌN LỊCH THÁNG NHANH

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Cung cấp bộ chọn lịch tháng thẩm mỹ, mượt mà trên iPhone/Safari (tránh lỗi vỡ giao diện của thẻ input date mặc định), giúp lọc lịch sử và ví thu nhập theo bất kỳ ngày nào trong tháng.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/modals/modal_month_picker.html`
- **File JS Xử lý**: `js/Components/Modals/modal_month_picker.js` & `js/History/routine_timeline.js`
- **Hàm Hỗ trợ Ngày**: `js/Core/DateTime/date_helper.js`

## 3. Quy Tắc Giao Diện & Phân Quyền Chi Tiết (UI & Permissions)
- Hiển thị lưới 7 cột (T2 -> CN).
- **Quy Tắc Khóa Ngày Tương Lai**: Toàn bộ các ngày chưa tới trong tương lai được làm mờ nhẹ (`#B8ACA2`) và **KHÓA BẤM (`pointer-events-none`)**, không cho phép chọn ngày chưa tới.
- Có nút chuyển tháng trước/sau và nút chọn nhanh *"Hôm nay"*.

## 4. Luồng Xử Lý Logic & Công Thức Toán Học (Business Logic)
1. Khi chọn 1 ngày $ightarrow$ Gọi callback `onSelectDate(dateKey)`.
2. Đồng bộ ngày được chọn vào thanh trượt lịch 7 ngày và lọc lại danh sách tour.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- Không ghi trực tiếp xuống database, chỉ phục vụ lọc dữ liệu `tb_receipts` và `tb_payroll_logs`.

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Chuẩn hóa giao diện không bị chìm chữ ngày tương lai.
