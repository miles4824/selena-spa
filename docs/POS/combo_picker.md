# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: CỤM CHỌN COMBO DỊCH VỤ CHÍNH (COMBO PICKER)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Giúp KTV bấm chọn nhanh Combo gội chính (Combo 1 - 5) trong 1 giây ngay khi khách vào tiệm để chuẩn bị bắt đầu ca gội.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/pos/combo_section.html`
- **File JS Xử lý giao diện**: `js/Components/POS/combo_picker.js` & `js/Add/pos_checkout.js`
- **Danh Mục Dữ Liệu**: `js/Core/Menu/service_catalog.js`

## 3. Quy Tắc Giao Diện & Kịch Bản Phân Quyền Chi Tiết (UI Scenarios & Permissions)
- Hiển thị đồng thời dạng **Dropdown danh sách** và **Hàng nút bấm nhanh (Pills)**:
  - 💆 **Combo 1**: Gội Dưỡng Sinh Cơ Bản (64k - 50p)
  - 💆 **Combo 2**: Gội Dưỡng Sinh Thư Giãn (99k - 60p)
  - 💆 **Combo 3**: Gội Chuyên Sâu Cổ Vai Gáy (150k - 75p)
  - 💆 **Combo 4**: Gội VIP Thảo Dược & Massage Mặt (199k - 90p)
  - 💆 **Combo 5**: Gội Selena Hoàng Gia Toàn Diện (250k - 105p)
- Khi bấm chọn Combo $ightarrow$ Nút sáng màu hồng cam thương hiệu (`#FFF0EB` viền `#E58A7B`).
- Tự động điền giá tiền và thời lượng chuẩn vào đồng hồ đếm ngược.

## 4. Luồng Xử Lý Logic & Hành Vi Hệ Thống (Business Logic)
- Lấy thông tin từ `ServiceCatalog.getCombos()` $ightarrow$ Tính toán hoa hồng dự kiến cho KTV và cài đặt thời lượng cho đồng hồ đếm ngược.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_menu` (Cột A `service_id`, Cột B `service_name`, Cột C `price`, Cột D `duration_min`).

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Bóc tách thành component độc lập.
