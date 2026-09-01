# 📌 ĐẶC TẢ CHI TIẾT: CỤM CHỌN COMBO DỊCH VỤ CHÍNH (COMBO PICKER)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Giúp KTV bấm chọn nhanh Combo gội chính (Combo 1 - 5) trong 1 giây ngay trên màn hình POS.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/pos/combo_section.html`
- **File JS Xử lý**: `js/Components/POS/combo_picker.js` & `js/Add/pos_checkout.js`
- **Danh Mục Dữ Liệu**: `js/Core/Menu/service_catalog.js`

## 3. Quy Tắc Giao Diện & Phân Quyền Chi Tiết (UI & Permissions)
- Hiển thị đồng thời dạng **Dropdown danh sách** và **Hàng nút bấm nhanh (Pills)**.
- Khi bấm chọn Combo $ightarrow$ Nút sáng màu hồng cam thương hiệu (`#FFF0EB` viền `#E58A7B`).
- Tự động hiển thị giá tiền niêm yết và thời lượng chuẩn của combo đó.

## 4. Luồng Xử Lý Logic & Công Thức Toán Học (Business Logic)
- Lấy thông tin từ `ServiceCatalog.getCombos()` $ightarrow$ Điền giá tiền vào ô tính toán và cập nhật thời lượng đếm ngược.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_menu`
- **Cột Đọc**: Cột A (`service_id`), Cột B (`service_name`), Cột C (`price`), Cột D (`duration_min`).

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Bóc tách thành component độc lập.
