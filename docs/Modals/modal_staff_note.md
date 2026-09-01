# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: MODAL GHI CHÚ & BỔ SUNG KHÁCH VÃNG LAI (KTV)

## 1. Mục Đích & Bối Cảnh Nghiệp Vụ Thực Tế
- Dành cho Kỹ Thuật Viên thao tác trên màn hình Lịch Sử (Routine Timeline) sau khi hoàn thành ca gội:
  1. Ghi lại sở thích phục vụ của khách quen (nước ấm, sấy mát, da đầu nhạy cảm...).
  2. Bổ sung Tên + Số điện thoại thật cho các ca ban đầu tạo là "Khách vãng lai" để chuyển thành khách quen tích điểm chu kỳ 60 ngày.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/modals/modal_staff_note.html`
- **File JS Xử lý giao diện**: `js/Components/Modals/modal_staff_note.js`
- **File Kích hoạt / Nơi gọi**: `js/History/routine_timeline.js` (Bấm vào tên khách trên thẻ tour)
- **Hàm Xử Lý SĐT**: `js/Core/Phone/phone_normalizer.js` & `js/Core/Phone/phone_masker.js`

## 3. Quy Tắc Giao Diện & Kịch Bản Phân Quyền Chi Tiết (UI Scenarios & Permissions)

### 👩‍🦰 Phía Kỹ Thuật Viên (Staff):
- **🟢 Kịch Bản 1: Đối với Khách Quen (Đã có SĐT trong hệ thống)**:
  - **Tiêu đề Modal**: Hiển thị `Ghi Chú Khách Hàng` và Tên khách.
  - **Số điện thoại**: Luôn che 4 số giữa (`094*144`), không bao giờ thấy số thật.
  - **Ô nhập Tên & SĐT**: BỊ ẨN HOÀN TOÀN (KTV không được phép sửa Tên & SĐT của khách quen).
  - **Ô chọn Tháng sinh**:
    - Nếu khách **đã có tháng sinh**: **ẨN VĨNH VIỄN DROPDOWN**, chỉ hiển thị dòng chữ cố định: `🎂 Sinh nhật: Tháng X` (KTV không được đổi).
    - Nếu khách **chưa có tháng sinh**: Hiển thị dropdown chọn Tháng 1 - 12 để KTV lưu lần đầu.
  - **Ô Ghi chú**: KTV được nhập/sửa sở thích của khách thoải mái.

- **🟠 Kịch Bản 2: Đối với Khách Vãng Lai (Chưa có SĐT)**:
  - **Tiêu đề Modal**: Hiển thị nhãn `Bổ Sung Thông Tin Khách Vãng Lai`.
  - Hệ thống tự động **MỞ THÊM 2 Ô NHẬP LIỆU**:
    1. 👤 **Ô Nhập Tên Khách Hàng**: Input Text (Placeholder: `Nhập tên khách, VD: Chị Lan`).
    2. 📱 **Ô Nhập SĐT Thật**: Input Tel (Placeholder: `Nhập SĐT 10 số, VD: 0912345678`).
  - **Ô chọn Tháng sinh**: Hiển thị dropdown chọn Tháng 1 - 12 (Tùy chọn).
  - **Ô Ghi chú**: Ô nhập ghi chú sở thích.
  - **Quy tắc khóa cứng một lần (One-Time Lock)**: Sau khi KTV bấm Lưu, hóa đơn đó lập tức chuyển thành Khách Quen và khóa cứng Tên + SĐT. KTV không thể mở lại để đổi sang người khác được nữa.

### 👑 Phía Chủ Tiệm (Owner / Admin):
- Dùng modal riêng `modal_owner_customer.html` với toàn quyền sửa Tên, SĐT thật 10 số, đổi tháng sinh bất cứ lúc nào.

## 4. Luồng Xử Lý Logic & Hành Vi Hệ Thống (Business Logic)
1. **Bước 1 (Mở Modal)**: KTV bấm vào tên khách trên thẻ tour $ightarrow$ Gọi `openStaffCustomerNoteModal(phone, name, receiptId)`.
   - Kiểm tra nếu `phone` rỗng hoặc `name === 'Khách vãng lai'` $ightarrow$ Kích hoạt **Kịch Bản 2 (Khách vãng lai)**.
   - Ngược lại $ightarrow$ Kích hoạt **Kịch Bản 1 (Khách quen)**.
2. **Bước 2 (Lưu Thông Tin)**:
   - Khi lưu ca Khách vãng lai:
     + Chuẩn hóa SĐT 10 số qua `PhoneNormalizer.normalize(inputPhone)`.
     + Cập nhật hóa đơn trong `receipts` và hồ sơ khách trong `customers`.
     + **Âm thầm gửi nhật ký đối soát**: Ghi nhận KTV nào đã sửa tour nào, lúc mấy giờ về Backend GAS.
   - Cập nhật Firebase Realtime trong 0.03 giây và gọi API `update_customer_notes`.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_receipts` & `tb_customers`
- **Cột Đọc / Ghi**:
  - `tb_receipts` $ightarrow$ Cột F (`customer_phone`), Cột G (`customer_name`).
  - `tb_customers` $ightarrow$ Cột A (`phone_number`), Cột B (`customer_name`), Cột C (`birthday`), Cột H (`notes`).
- **Hàm Backend GAS phụ trách**: `updateCustomerNotes(params)` trong `Code.gs`.
- **Firebase Realtime**: `customers/{cleanPhone}/notes`

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Bóc tách thành component độc lập và thực thi quy tắc ẩn vĩnh viễn ô chọn tháng khi khách đã có sinh nhật.
- `2026-09-01` (`v0.0.1.0`): Bổ sung tính năng cho phép KTV nhập Tên + SĐT cho ca Khách vãng lai (khóa 1 lần và lẳng lặng ghi nhật ký đối soát).
