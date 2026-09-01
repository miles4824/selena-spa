# 📌 ĐẶC TẢ CHI TIẾT: BỘ XỬ LÝ VOUCHER (VOUCHER ENGINE)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Kiểm tra tính hợp lệ của voucher (còn hạn dùng không, đã dùng chưa) và thực hiện trừ voucher khi thanh toán.

## 2. Danh Sách File Cấu Thành
- **File JS Xử lý**: `js/Core/Loyalty/voucher_engine.js`

## 3. Quy Tắc & Công Thức Tính Toán Chi Tiết
- **Kiểm tra tính hợp lệ**: `status === "Chưa dùng"` VÀ `expiry_date >= Hôm nay`.
- Khi áp dụng voucher trên POS:
  - Giảm giá tương ứng (100% hoặc 20% hoặc 50.000 đ).
  - Đánh dấu `is_voucher_used = TRUE` trên hóa đơn.
  - Cập nhật trạng thái voucher thành `Đã dùng` trên bảng `tb_vouchers`.

## 4. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_vouchers` (Cột G `status`, Cột H `used_receipt_id`).

## 5. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Bóc tách module kiểm tra voucher.
