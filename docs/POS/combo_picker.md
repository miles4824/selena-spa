# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: CỤM CHỌN COMBO DỊCH VỤ CHÍNH (COMBO PICKER)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Giúp KTV bấm chọn nhanh Combo gội chính (Combo 1 - 5) trong 1 giây ngay khi khách vào tiệm để chuẩn bị bắt đầu ca gội.
- Là dịch vụ cốt lõi bắt buộc phải có trong mỗi ca phục vụ, định hình mức giá cơ sở và thời gian đếm ngược tiêu chuẩn cho toàn bộ ca.

---

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/add.html` & `views/components/pos/combo_section.html`
- **File JS Xử lý giao diện**: `js/Add/pos_checkout.js` & `js/Components/POS/combo_picker.js`
- **Danh Mục Dữ Liệu**: `js/Core/Menu/service_catalog.js` & `js/config.js` (`DEFAULT_MENU`)

---

## 3. Quy Tắc Giao Diện & Kịch Bản Nghiệp Vụ Chi Tiết (UI Scenarios & Permissions)

### 3.1. Danh Mục 5 Combo Tiêu Chuẩn Tại Tiệm:
- 💆 **Combo 1**: Gội Dưỡng Sinh Cơ Bản (`64.000đ` • `45 phút`)
- 💆 **Combo 2**: Gội Dưỡng Sinh Thư Giãn (`99.000đ` • `60 phút`)
- 💆 **Combo 3**: Gội Dưỡng Sinh Hoàng Gia (`149.000đ` • `75 phút`)
- 💆 **Combo 4**: Gội + Massage Cổ Vai Gáy (`199.000đ` • `90 phút`)
- 💆 **Combo 5**: Gội Thư Giãn Toàn Diện (`249.000đ` • `105 phút`)

### 3.2. Kịch Bản Tương Tác Giao Diện:
- **Trường hợp A (Mặc định khi mở tab Tạo Ca)**:
  - Hệ thống tự động chọn sẵn **Combo 1** (`64.000đ` • `45 phút`).
  - Nút `Combo 1` sáng viền cam `#E58A7B`, nền hồng cam `#FFF0EB`, viền ring `ring-2 ring-[#E58A7B]/50`.
  - Thẻ tóm tắt góc phải hiển thị: `64.000 đ • 45p`.
- **Trường hợp B (KTV chọn nhanh qua hàng nút Pills)**:
  - KTV chạm vào bất kỳ nút nào từ `Combo 1` đến `Combo 5`.
  - Dropdown `pos-service-select` tự động đồng bộ theo.
  - Thẻ tóm tắt và đồng hồ dự kiến cập nhật ngay lập tức theo giá và thời lượng của Combo vừa chọn.
- **Trường hợp C (KTV chọn qua Dropdown Select)**:
  - Khi thay đổi trong dropdown, hàng nút Pills tự động chuyển trạng thái active tương ứng.

---

## 4. Luồng Xử Lý Logic & Hành Vi Hệ Thống (Business Logic)

### 4.1. Công Thức Tính Tiền & Thời Gian:
$$	ext{Thời lượng cơ sở} = 	ext{Duration}(	ext{selectedComboId})$$
$$	ext{Giá tiền cơ sở} = 	ext{Price}(	ext{selectedComboId})$$

### 4.2. Khởi Động Đồng Hồ Đếm Giờ (Live Timer):
- Khi KTV bấm nút **"Bắt Đầu Tour Gội"**:
  - `startLiveSession()` khởi tạo đối tượng `currentLiveSession` lưu vào bộ nhớ đệm và Firebase Realtime.
  - Đồng hồ đếm ngược được nạp đúng số phút định mức của Combo để đếm lùi về 00:00.

---

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_menu`
  - Cột A: `service_id` (VD: `CB01`, `CB02`, `CB03`...).
  - Cột B: `service_name` (Tên combo).
  - Cột C: `price` (Giá tiền niêm yết).
  - Cột D: `duration_min` (Thời lượng tiêu chuẩn).
- **Ghi vào `tb_receipts`**:
  - Cột I: `service_name` (Tên Combo).
  - Cột J: `price` (Tổng tiền).
  - Cột K: `duration_min` (Tổng phút ca).

---

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Bóc tách thành component độc lập.
- `2026-09-01` (`v0.0.1.6`): Chuẩn hóa giao diện Pills, tích hợp thẻ tóm tắt giá/giờ và kết nối chặt chẽ với cụm Dịch vụ làm thêm (Add-ons).
