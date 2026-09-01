# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: THANH TRƯỢT LỊCH 7 NGÀY (WEEKLY DATE STRIP)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Thanh trượt 7 ngày ngang đầu màn hình Lịch sử và Thu nhập giúp bấm chọn ngày xem dữ liệu trong 1 chạm.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File JS Xử lý giao diện**: `js/Components/Cards/weekly_date_strip.js` & `js/History/routine_timeline.js`
- **Hàm Kiểm Tra Ngày**: `js/Core/DateTime/date_helper.js`

## 3. Quy Tắc Giao Diện & Kịch Bản Phân Quyền Chi Tiết (UI Scenarios & Permissions)
- **Quy Tắc Khóa Ngày Tương Lai**: Toàn bộ các ngày chưa tới trong tương lai được làm mờ nhẹ chữ xám `#B8ACA2` trên nền `#F6F1EA` và **KHÓA BẤM TUYỆT ĐỐI (`pointer-events-none`)**, không bị chìm mất chữ nhưng không cho phép bấm.
- Nút "Xem tất cả" và icon mở modal chọn lịch tháng nhanh.

## 4. Luồng Xử Lý Logic & Hành Vi Hệ Thống (Business Logic)
- Kiểm tra `DateHelper.isFuture(dateStr)` $ightarrow$ Nếu `true` thì gán class khóa bấm an toàn.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- Không ghi database, chỉ phục vụ lọc dữ liệu `tb_receipts`.

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-08-31` (`v0.1.8.9`): Tinh chỉnh màu sắc nút ngày tương lai rõ ràng, không bị chìm mất chữ.
