# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: MODAL QUẢN TRỊ THÔNG TIN KHÁCH HÀNG (CHỦ TIỆM / OWNER)

## 1. Mục Đích & Bối Cảnh Nghiệp Vụ Thực Tế
- Dành riêng cho Chủ Tiệm (Owner) toàn quyền quản lý, sửa chữa mọi thông tin hồ sơ của khách hàng: sửa tên, đổi số điện thoại thật, chỉnh sửa tháng sinh nhật, cập nhật ghi chú sở thích và theo dõi tiến trình tích lũy chu kỳ 60 ngày.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/modals/modal_owner_customer.html`
- **File JS Xử lý giao diện**: `js/Components/Modals/modal_owner_customer.js`
- **File Kích hoạt / Nơi gọi**:
  - `js/History/shop_receipts.js` (Bấm vào tên khách trên thẻ hóa đơn lịch sử).
  - `js/Home/home_dashboard.js` (Bấm nút "Sửa Info" trên danh bạ khách 60 ngày).
- **Hàm Xử Lý SĐT**: `js/Core/Phone/phone_normalizer.js`

## 3. Quy Tắc Giao Diện & Kịch Bản Phân Quyền Chi Tiết (UI Scenarios & Permissions)

### 👑 Phía Chủ Tiệm (Owner / Admin):
- **🟢 Kịch Bản 1: Mở từ Thẻ Hóa Đơn Lịch Sử**:
  - Tiêu đề modal: `Thông Tin Khách Hàng`.
  - Hiển thị đầy đủ SĐT 10 số thật (`0949251144`) trong ô input cho phép sửa.
  - Ô nhập Tên khách hàng: Cho phép sửa sang tên khác.
  - Dropdown chọn Tháng sinh: Luôn hiển thị đầy đủ Tháng 1 - 12, Chủ tiệm đổi tháng nào cũng được.
  - Ô Ghi chú sở thích: Cho phép sửa ghi chú phục vụ.
- **🟠 Kịch Bản 2: Mở từ Danh Bạ Khách Hàng 60 Ngày**:
  - Tự động điền thông tin hiện tại của khách.
  - Hiển thị thêm chỉ số: `Số lần ghé trong chu kỳ (X / 10 ca)` và `Số voucher khả dụng`.

### 👩‍🦰 Phía Kỹ Thuật Viên (Staff):
- BỊ KHÓA HOÀN TOÀN, KTV không có quyền mở modal này.

## 4. Luồng Xử Lý Logic & Hành Vi Hệ Thống (Business Logic)
1. **Bước 1**: Chủ tiệm bấm nút sửa $ightarrow$ Gọi `openOwnerCustomerEditorModal(phone, name, receiptId)`.
2. **Bước 2**: Tải dữ liệu khách từ LocalStorage và gọi ngầm `check_customer` về GAS.
3. **Bước 3 (Khi bấm "Cập Nhật Hồ Sơ")**:
   - Chuẩn hóa SĐT mới qua `PhoneNormalizer.normalize(newPhone)`.
   - Cập nhật danh bạ trong `tb_customers` và đồng bộ lại tên/SĐT trong các hóa đơn `tb_receipts`.
   - Gọi API GAS `update_customer_notes` và cập nhật Firebase Realtime trong 0.03s.
   - Tải lại danh sách lịch sử và danh bạ để cập nhật giao diện ngay lập tức.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_customers` & `tb_receipts`
- **Cột Đọc / Ghi**:
  - `tb_customers` $ightarrow$ Cột A (`phone_number`), Cột B (`customer_name`), Cột C (`birthday`), Cột H (`notes`).
  - `tb_receipts` $ightarrow$ Cột F (`customer_phone`), Cột G (`customer_name`).
- **Hàm Backend GAS phụ trách**: `updateCustomerNotes(params)` trong `Code.gs`.
- **Firebase Realtime**: `customers/{phone}`

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.2`): Đổi tiêu đề modal thành "Thông Tin Khách Hàng" và gắn nút mở trực tiếp trên từng thẻ hóa đơn Lịch sử của Chủ tiệm.
