# 📌 ĐẶC TẢ CHI TIẾT: MODAL THÔNG TIN KHÁCH HÀNG (CHỦ TIỆM / OWNER)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Dành riêng cho Chủ Tiệm quản trị toàn diện hồ sơ khách hàng: sửa tên, đổi số điện thoại, chỉnh sửa tháng sinh nhật, quản lý ghi chú và kiểm tra số lần gội trong chu kỳ 60 ngày.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/modals/modal_owner_customer.html`
- **File JS Xử lý**: `js/Components/Modals/modal_owner_customer.js`
- **File Kích hoạt**: `js/History/shop_receipts.js` (Thẻ hóa đơn) & `js/Home/home_dashboard.js` (Danh bạ khách)

## 3. Quy Tắc Giao Diện & Phân Quyền Chi Tiết (UI & Permissions)
- 👑 **Phía Chủ Tiệm (Owner / Admin)**:
  - **Số điện thoại**: Hiển thị đầy đủ 10 số (`0949251144`), có ô nhập cho phép sửa sang SĐT khác.
  - **Tên khách hàng**: Cho phép sửa đổi.
  - **Tháng sinh nhật**: Luôn luôn hiển thị dropdown chọn tháng, Chủ tiệm toàn quyền đổi sang tháng khác.
  - **Xem chu kỳ**: Hiển thị trực quan `Số lần ghé trong chu kỳ (X / 10 lần)` và `Số voucher hiện có`.
- 👩‍🦰 **Phía Kỹ Thuật Viên (Staff)**:
  - Bị chặn, không được phép mở modal này.

## 4. Luồng Xử Lý Logic & Công Thức Toán Học (Business Logic)
1. Chủ tiệm bấm icon cây bút trên thẻ hóa đơn hoặc nút "Sửa Info" trong Danh bạ khách $ightarrow$ Gọi `openOwnerCustomerEditorModal(phone, name, receiptId)`.
2. Hệ thống tải dữ liệu khách từ LocalStorage và gọi ngầm `check_customer` về GAS.
3. Khi bấm *"Cập Nhật Hồ Sơ"*:
   - Chuẩn hóa SĐT mới qua `PhoneNormalizer.normalize`.
   - Cập nhật đồng thời danh bạ khách, các hóa đơn liên quan và gọi `update_customer_notes` về Google Sheet.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_customers` & `tb_receipts`
- **Cột Đọc / Ghi**:
  - `tb_customers` $ightarrow$ Cột A (`phone_number`), Cột B (`customer_name`), Cột C (`birthday`), Cột H (`notes`).
- **Hàm Backend GAS phụ trách**: `updateCustomerNotes(params)` trong `Code.gs`.
- **Firebase Realtime**: `customers/{phone}`

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.2`): Đổi tiêu đề thành "Thông Tin Khách Hàng", gắn nút mở trực tiếp trên từng thẻ hóa đơn Lịch sử của Chủ tiệm.
