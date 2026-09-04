# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: MODAL CHỌN LỊCH THÁNG NHANH

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Cung cấp bộ chọn lịch ngày trong tháng trực quan, mượt mà trên iPhone/Safari (tránh lỗi vỡ giao diện của thẻ input date mặc định), giúp lọc lịch sử tour và ví thu nhập theo bất kỳ ngày nào trong quá khứ.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/modals/modal_month_picker.html`
- **File JS Xử lý giao diện**: `js/Components/Modals/modal_month_picker.js` & `js/History/routine_timeline.js`
- **Hàm Hỗ trợ Ngày**: `js/Core/DateTime/date_helper.js`

## 3. Quy Tắc Giao Diện & Kịch Bản Phân Quyền Chi Tiết (UI Scenarios & Permissions)
- Hiển thị lưới 7 cột ngày trong tuần (T2 $
ightarrow$ CN).
- **Quy Tắc Khóa Ngày Tương Lai**: Toàn bộ các ngày chưa tới trong tương lai được làm mờ nhẹ chữ xám `#B8ACA2` và **KHÓA BẤM TUYỆT ĐỐI (`pointer-events-none`)**, không cho phép chọn ngày chưa diễn ra.
- Có nút mũi tên chuyển tháng trước / tháng sau và nút bấm nhanh *"Hôm nay"*.

## 4. Luồng Xử Lý Logic & Hành Vi Hệ Thống (Business Logic)
1. Bấm vào icon lịch trên thanh trượt ngày $
ightarrow$ Mở modal.
2. Bấm chọn 1 ngày hợp lệ $
ightarrow$ Đóng modal, đồng bộ thanh trượt 7 ngày và lọc lại danh sách hóa đơn theo ngày đã chọn.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- Phục vụ lọc dữ liệu `tb_receipts` và `tb_payroll_logs`.

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Chuẩn hóa giao diện không bị chìm chữ ngày tương lai.
