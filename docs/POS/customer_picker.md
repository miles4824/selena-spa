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
- 👑 **Chủ tiệm**: Thấy đủ 10 số `0949251144`.
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
- `2026-09-01` (`v0.0.0.1`): Bóc tách thành component độc lập.
