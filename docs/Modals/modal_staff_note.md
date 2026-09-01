# 📌 ĐẶC TẢ CHI TIẾT: MODAL GHI CHÚ KHÁCH HÀNG (KTV / STAFF)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Cho phép Kỹ Thuật Viên ghi lại sở thích, thói quen và lưu ý khi phục vụ khách (ví dụ: thích gội nước ấm, sấy mát, da đầu nhạy cảm, massage vai gáy nhẹ).
- Cho phép KTV nhập tháng sinh nhật cho khách nếu khách chưa có trong hệ thống để tiệm tặng voucher 20%.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/modals/modal_staff_note.html`
- **File JS Xử lý**: `js/Components/Modals/modal_staff_note.js`
- **File Kích hoạt**: `js/History/routine_timeline.js` (Bấm vào tên khách trên thẻ tour)

## 3. Quy Tắc Giao Diện & Phân Quyền Chi Tiết (UI & Permissions)
- 👩‍🦰 **Phía Kỹ Thuật Viên (Staff)**:
  - **Số điện thoại**: Luôn che 4 số giữa (`094*144`), không thấy số thật.
  - **Tháng sinh nhật**:
    - Khách **CHƯA CÓ tháng sinh**: Hiển thị dropdown chọn Tháng 1 - 12 để KTV lưu lần đầu.
    - Khách **ĐÃ CÓ tháng sinh**: **ẨN VĨNH VIỄN Ô CHỌN THÁNG**, chỉ hiển thị dòng chữ: `• Sinh nhật: Tháng X`. KTV tuyệt đối không được phép chỉnh sửa tháng sinh nữa.
  - **Ghi chú**: KTV được nhập và sửa nội dung ghi chú thoải mái.
- 👑 **Phía Chủ Tiệm (Owner / Admin)**:
  - Dùng modal riêng `modal_owner_customer.html` với toàn quyền sửa.

## 4. Luồng Xử Lý Logic & Công Thức Toán Học (Business Logic)
1. KTV bấm vào tên khách trên thẻ tour lịch sử $ightarrow$ Gọi hàm `openStaffCustomerNoteModal(phone, name, receiptId)`.
2. Hệ thống tự động tra cứu SĐT gốc 10 số (chống lấy chuỗi che `094*144`).
3. Kiểm tra trường `birth_month` hoặc `birthday` của khách:
   - Nếu `initialMonth >= 1 && initialMonth <= 12` $ightarrow$ Thêm class `hidden` vào `#modal-staff-note-birth-month-container`.
4. Khi KTV bấm *"Lưu Ghi Chú"* $ightarrow$ Cập nhật vào LocalStorage, Firebase Realtime và gọi API `update_customer_notes`.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_customers`
- **Cột Đọc / Ghi**:
  - Cột A (`phone_number`): SĐT 10 số chuẩn hóa.
  - Cột C (`birthday` / `birth_month`): Lưu tháng sinh nhật (1-12).
  - Cột H (`notes`): Ghi chú sở thích của khách.
- **Hàm Backend GAS phụ trách**: `updateCustomerNotes(params)` trong `Code.gs`.
- **Firebase Realtime**: `customers/{cleanPhone}/notes`

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Bóc tách thành component độc lập và thực thi quy tắc ẩn vĩnh viễn ô chọn tháng khi khách đã có sinh nhật.
