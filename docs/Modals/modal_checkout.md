# 📌 ĐẶC TẢ CHI TIẾT: MODAL THANH TOÁN 2 PHA (CHECKOUT)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Giải quyết bài toán thanh toán tinh tế và kín đáo: Khách hàng quét mã QR thanh toán đúng giá dịch vụ mà không thấy bất kỳ chữ "Tips" nào. Sau khi khách thanh toán xong, KTV mới mở bước riêng tư để nhập tiền Tips.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/modals/modal_checkout.html`
- **File JS Xử lý**: `js/Components/Modals/modal_checkout.js` & `js/Add/pos_checkout.js`

## 3. Quy Tắc Giao Diện & Phân Quyền Chi Tiết (UI & Permissions)
- 🟢 **PHA 1 (Màn hình đưa cho khách xem)**:
  - Hiển thị tên dịch vụ, thời gian làm ca, tên khách hàng.
  - Chọn hình thức thanh toán: **Quét Mã QR** hoặc **Tiền Mặt**.
  - Hiển thị ảnh mã QR ngân hàng VIB (`799625591 - TRẦN THU NGÂN`).
  - **TUYỆT ĐỐI GIẤU HOÀN TOÀN CHỮ VÀ Ô NHẬP TIỀN TIPS**.
  - Nút bấm: *"Khách Đã Thanh Toán Xong • Tiếp Tục"*.
- 🔒 **PHA 2 (Màn hình nội bộ KTV)**:
  - Chỉ hiển thị khi KTV bấm tiếp tục.
  - Hiển thị từng ô nhập Tiền Tips riêng biệt cho từng KTV phục vụ tour này (KTV chính, KTV phụ 1, KTV phụ 2).
  - Tự động cộng tổng tiền thu và hoa hồng dự kiến.
  - Nút bấm: *"Hoàn Tất & Lưu Hóa Đơn"*.

## 4. Luồng Xử Lý Logic & Công Thức Toán Học (Business Logic)
1. Tổng tiền ca = `Giá combo + Tiền dịch vụ thêm + Tiền sản phẩm`.
2. Tổng thanh toán = `Tổng tiền ca + Tổng tiền Tips`.
3. Hoa hồng KTV = Tính theo tỷ lệ hợp đồng (10% hoặc 20%) và tỷ lệ phân chia (theo phút hoặc 50-50). Tiền tip thuộc $100\%$ về KTV.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_receipts` & `tb_payroll_logs`
- **Cột Đọc / Ghi**:
  - `tb_receipts` $ightarrow$ Cột J (`price`), Cột K (`tip_amount`), Cột L (`total_paid`), Cột N (`payment_method`).
  - `tb_payroll_logs` $ightarrow$ Cột O (`commission_amount`), Cột P (`tip_amount`), Cột Q (`total_earned`).
- **Hàm Backend GAS phụ trách**: `createReceipt(params)` trong `Code.gs`.

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Tách riêng thành component độc lập và chuẩn hóa luồng 2 pha.
