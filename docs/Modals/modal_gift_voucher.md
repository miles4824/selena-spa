# 📌 ĐẶC TẢ CHI TIẾT: MODAL TẶNG VOUCHER KHÁCH HÀNG

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Dành cho Chủ Tiệm chủ động tặng voucher tri ân cho khách hàng thân thiết, khách VIP hoặc quà tặng sinh nhật.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/modals/modal_gift_voucher.html`
- **File JS Xử lý**: `js/Components/Modals/modal_gift_voucher.js`
- **File Kích hoạt**: `js/Home/home_dashboard.js` (Nút "Tặng Voucher" trong Danh bạ khách)

## 3. Quy Tắc Giao Diện & Phân Quyền Chi Tiết (UI & Permissions)
- Chọn loại voucher:
  - Tặng 1 Lần Gội Miễn Phí (100%).
  - Giảm 20% Hóa Đơn.
  - Giảm Tiền Cố Định (50.000 đ).
- Chọn hạn sử dụng: **30 ngày (1 tháng)**, **60 ngày (2 tháng)**, hoặc **90 ngày (3 tháng)** kể từ ngày tặng.
- Nhập lý do tặng (Ví dụ: Khách VIP, Tri ân khách hàng).

## 4. Luồng Xử Lý Logic & Công Thức Toán Học (Business Logic)
1. Ngày hết hạn = $	ext{Hôm nay} + 	ext{Số ngày hạn (30/60/90)}$.
2. Sinh mã voucher tự động: `VC + yymmddhhmmss`.
3. Tăng trường `voucher_count` (+1) trong hồ sơ khách hàng.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_vouchers` & `tb_customers`
- **Cột Đọc / Ghi**:
  - `tb_vouchers` $ightarrow$ Thêm 1 dòng (Mã VC, SĐT, Tên, Loại, Giá trị, Hạn dùng, Trạng thái `Chưa dùng`).
  - `tb_customers` $ightarrow$ Cột G (`voucher_count`) tăng thêm 1.
- **Hàm Backend GAS phụ trách**: `giftVoucher(params)` trong `Code.gs`.

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Bóc tách thành component độc lập.
