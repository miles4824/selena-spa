# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: MODAL TẶNG VOUCHER KHÁCH HÀNG

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Dành cho Chủ Tiệm chủ động phát voucher quà tặng tri ân cho khách hàng thân thiết, khách VIP hoặc tặng quà dịp đặc biệt.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/modals/modal_gift_voucher.html`
- **File JS Xử lý giao diện**: `js/Components/Modals/modal_gift_voucher.js`
- **File Kích hoạt**: `js/Home/home_dashboard.js` (Nút "Tặng Voucher" trong Danh bạ khách 60 ngày)

## 3. Quy Tắc Giao Diện & Kịch Bản Phân Quyền Chi Tiết (UI Scenarios & Permissions)
- Chọn loại ưu đãi:
  - 🎁 Tặng 1 Lần Gội Miễn Phí (100%).
  - 🎂 Giảm 20% Hóa Đơn.
  - 💵 Giảm Tiền Cố Định (50.000 đ).
- Chọn hạn sử dụng: **30 ngày (1 tháng)**, **60 ngày (2 tháng)**, hoặc **90 ngày (3 tháng)** kể từ ngày tặng.
- Nhập lý do tặng quà (Ví dụ: Khách VIP thân thiết, Tri ân dịp lễ).

## 4. Luồng Xử Lý Logic & Hành Vi Hệ Thống (Business Logic)
1. Ngày hết hạn = $	ext{Hôm nay} + 	ext{Số ngày hạn (30/60/90)}$.
2. Sinh mã voucher tự động: `VC + yymmddhhmmss`.
3. Tăng trường `voucher_count` (+1) trong hồ sơ khách hàng và thêm dòng mới vào `tb_vouchers`.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_vouchers` (9 cột) & `tb_customers` (Cột G `voucher_count`).
- **Hàm Backend GAS phụ trách**: `giftVoucher(params)` trong `Code.gs`.

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Bóc tách thành component độc lập.
