# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: CỤM TRA CỨU & CHỌN KHÁCH HÀNG (CUSTOMER PICKER)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Nhập SĐT khách để tra cứu lịch sử, chu kỳ 60 ngày (10 lần tặng 1) và áp dụng ưu đãi sinh nhật giảm 20% hoặc voucher miễn phí 100%.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/pos/customer_section.html`
- **File JS Xử lý giao diện**: `js/Components/POS/customer_picker.js` & `js/Add/pos_checkout.js`
- **Hàm Xử Lý SĐT**: `js/Core/Phone/phone_normalizer.js` & `js/Core/Phone/phone_masker.js`

## 3. Quy Tắc Giao Diện & Kịch Bản Phân Quyền Chi Tiết (UI Scenarios & Permissions)
- Gõ 2-3 số đầu $
ightarrow$ Hiển thị dropdown gợi ý khách quen tự động.
- 👩‍🦰 **KTV**: Thấy SĐT che `094*144`.
- 👑 **Chủ tiệm / Admin**: Thấy đủ 10 số `0949251144` và **toàn quyền chỉnh sửa tên/thông tin khách hàng**.
- 🔒 **Quy tắc bảo vệ tên khách hàng cho Staff**: Nếu khách đã có số điện thoại và tên chính thức trong hệ thống (khác 'Khách vãng lai' / để trống) $\rightarrow$ **Khóa ô Tên** không cho Staff chỉnh sửa. Chỉ mở khóa cho Staff nhập tên khi khách là khách mới hoặc tên đang là 'Khách vãng lai'.
- Tự động hiện thẻ Loyalty nếu tìm thấy:
  - Thanh tiến trình: `X / 10 Lần gội` và hạn chót 60 ngày.
  - Banner sinh nhật màu vàng nếu trùng tháng sinh.
  - Banner tích chọn dùng Voucher nếu khách có voucher khả dụng.

## 4. Luồng Xử Lý Logic & Hành Vi Hệ Thống (Business Logic)
1. Gõ SĐT $
ightarrow$ Chuẩn hóa qua `PhoneNormalizer.normalize(val)`.
2. Tìm trong mảng `customers` và gọi ngầm `check_customer` về GAS.
3. Nếu tích chọn *"Dùng voucher"* $
ightarrow$ Ca này miễn phí 100% (KTV vẫn nhận đủ 10% hoa hồng theo giá gốc).

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_customers`, `tb_loyalty_cycles`, `tb_vouchers`.
- **Hàm Backend GAS phụ trách**: `checkCustomer(phone)` trong `Code.gs`.

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`):
- `2026-09-01` (`v0.0.4.4`):
- `2026-09-02` (`v0.0.5.2`):
- `2026-09-02` (`v0.0.5.3`):
- `2026-09-02` (`v0.0.5.5`): Đồng bộ 100% Font-family Plus Jakarta Sans thống nhất và hài hòa giữa ô Số Điện Thoại và Tên Khách Hàng. Đồng bộ 100% Placeholder từ bảng tb_config trên Google Sheets ('Tên khách hàng', 'Số điện thoại'), xóa bỏ triệt để toàn bộ text offline cũ. Hoàn thiện quy tắc khóa tên khách chính thức cho Staff, mở khóa cho Khách vãng lai/khách mới và toàn quyền cho Admin. Mở khóa toàn diện ô Tên Khách Hàng cho phép nhập/chỉnh sửa tên trực tiếp khi tạo tour. Bóc tách thành component độc lập.
