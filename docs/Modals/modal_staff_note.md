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

#### 🟢 Kịch Bản 1: Đối với Khách Quen (Đã có SĐT trong hệ thống)
- **Tiêu đề Modal**: Hiển thị `Ghi Chú Khách Hàng` và Tên khách.
- **Số điện thoại**: Luôn che 4 số giữa (`094*144`), không bao giờ thấy số thật.
- **Ô nhập Tên & SĐT**: BỊ ẨN HOÀN TOÀN (KTV không được phép sửa Tên & SĐT của khách quen).
- **Ô chọn Tháng sinh**:
  - Nếu khách **đã có tháng sinh**: **ẨN VĨNH VIỄN DROPDOWN**, chỉ hiển thị dòng chữ cố định: `🎂 Sinh nhật: Tháng X` (KTV không được đổi).
  - Nếu khách **chưa có tháng sinh**: Hiển thị dropdown chọn Tháng 1 - 12 để KTV lưu lần đầu.
- **Ô Ghi chú**: KTV được nhập/sửa sở thích của khách thoải mái.

#### 🟠 Kịch Bản 2: Đối với Khách Vãng Lai (Chưa có SĐT)
- **Tiêu đề Modal**: Hiển thị nhãn `Bổ Sung Thông Tin Khách Vãng Lai`.
- **Hệ thống tự động MỞ THÊM 2 Ô NHẬP LIỆU**:
  1. 📱 **Ô Nhập SĐT Thật**: Input Tel (Placeholder: `Nhập SĐT 10 số, VD: 0912345678`).
  2. 👤 **Ô Nhập Tên Khách Hàng**: Input Text (Placeholder: `Nhập tên khách, VD: Chị Lan`).
- **Hành vi Dò Tìm Tự Động Trong 0.1s**:
  - **Trường hợp 2A (Trùng SĐT Khách Cũ)**:
    + Tự động khóa ô Tên và lấy đúng **Tên Cũ** trong danh bạ.
    + Hiện dòng thông báo xanh lá: `✓ Khách quen: [Tên Cũ] • Đã gội [X / 10 ca]`.
    + Ẩn ô chọn tháng nếu khách cũ đã có tháng sinh.
  - **Trường hợp 2B (SĐT Mới Tinh)**:
    + Hiện dòng thông báo màu cam: `+ Khách hàng mới (chưa có hồ sơ)`.
    + Mở ô Tên cho KTV nhập và mở dropdown chọn Tháng sinh nhật (Tùy chọn).
- **Quy tắc xác nhận & Khóa cứng 1 lần (One-Time Lock)**:
  - Nếu là khách mới $
ightarrow$ Bật Popup xác nhận: *"Số điện thoại [0912...] là khách mới. Bạn có chắc chắn muốn tạo hồ sơ cho khách [Tên Khách] không?"*.
  - Bấm Đồng ý $
ightarrow$ Hóa đơn lập tức chuyển thành Khách Quen và khóa cứng vĩnh viễn Tên + SĐT.

### 👑 Phía Chủ Tiệm (Owner / Admin):
- Dùng modal riêng `modal_owner_customer.html` với toàn quyền sửa Tên, SĐT thật 10 số, đổi tháng sinh bất cứ lúc nào.

## 4. Luồng Xử Lý Logic & Hành Vi Hệ Thống (Business Logic)
1. **Bước 1 (Mở Modal)**: KTV bấm vào tên khách trên thẻ tour $
ightarrow$ Gọi `openStaffCustomerNoteModal(phone, name, receiptId)`.
2. **Bước 2 (Gõ SĐT)**: Sự kiện `oninput` tự động kiểm tra số điện thoại:
   - Nếu tìm thấy khách quen $
ightarrow$ Tự động gán tên cũ và hiển thị thông tin chu kỳ.
   - Nếu chưa có $
ightarrow$ Báo khách mới.
3. **Bước 3 (Lưu Thông Tin)**:
   - Cập nhật hóa đơn `tb_receipts` (Sửa tại chỗ Cột F và G).
   - Nếu khách mới $
ightarrow$ Thêm 1 dòng mới vào `tb_customers` (bắt đầu chu kỳ `1 / 10 ca`).
   - Nếu khách cũ $
ightarrow$ Sửa tại chỗ dòng khách cũ trong `tb_customers` (cộng dồn `cycle_visits + 1` và `total_visits + 1`).
   - **Ghi nhật ký đối soát**: Tự động thêm 1 dòng vào `tb_customer_audits` (KTV nào sửa, ca nào, từ khách vãng lai sang SĐT nào, lúc mấy giờ).
   - Cập nhật Firebase Realtime trong 0.03 giây.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_receipts`, `tb_customers` & `tb_customer_audits`.
- **Cột Đọc / Ghi**:
  - `tb_receipts` $
ightarrow$ Cột F (`customer_phone`), Cột G (`customer_name`).
  - `tb_customers` $
ightarrow$ Cột A (`phone_number`), Cột B (`customer_name`), Cột C (`birthday`), Cột E (`cycle_visits`), Cột F (`total_visits`), Cột H (`notes`).
  - `tb_customer_audits` $
ightarrow$ Thêm 1 dòng (Mã audit, Mã hóa đơn, Thời gian, Mã KTV, Tên KTV, Khách cũ, SĐT mới, Tên mới, Ghi chú).
- **Hàm Backend GAS phụ trách**: `updateCustomerNotes(params)` trong `Code.gs`.
- **Firebase Realtime**: `customers/{cleanPhone}/notes`

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`):
- `2026-09-01` (`v0.0.0.9`): Khắc phục hiển thị SĐT 10 số thật cho Chủ Tiệm, hiển thị ô chọn tháng cho khách chưa có tháng sinh và chuẩn hóa SVG Lucide. Bóc tách thành component độc lập và thực thi quy tắc ẩn vĩnh viễn ô chọn tháng khi khách đã có sinh nhật.
- `2026-09-01` (`v0.0.0.9`): Hoàn thiện kịch bản 2A (trùng số lấy lại tên cũ) và 2B (số mới bật popup xác nhận) cho KTV, đồng thời ghi nhận nhật ký đối soát vào bảng `tb_customer_audits`.
