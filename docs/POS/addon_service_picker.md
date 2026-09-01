# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: CỤM CHỌN DỊCH VỤ LÀM THÊM (ADD-ONS PICKER)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Trong quá trình tư vấn hoặc trong ca gội, khách hàng thường có nhu cầu làm thêm các dịch vụ bổ trợ như: Massage thêm cổ vai gáy, Tẩy tế bào chết da đầu, Đắp mặt nạ...
- Tính năng này giúp KTV chọn thêm 1 hoặc nhiều dịch vụ phụ vào tour ca hiện tại chỉ với 1 chạm, tự động cộng dồn tiền và cộng thêm thời gian vào đồng hồ đếm ngược.

---

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/add.html` & `views/components/pos/combo_section.html`
- **File JS Xử lý giao diện**: `js/Add/pos_checkout.js` (`toggleAddonPickerModal`, `renderAddonOptionsList`, `toggleSelectAddon`, `removeSelectedAddon`, `renderSelectedAddonChips`)
- **Danh Mục Dữ Liệu**: `js/config.js` (`DEFAULT_ADDONS`, `selectedAddonIds`)

---

## 3. Quy Tắc Giao Diện & Kịch Bản Nghiệp Vụ Chi Tiết (UI Scenarios & Permissions)

### 3.1. Danh Sách Dịch Vụ Làm Thêm Tiêu Chuẩn (`DEFAULT_ADDONS`):
1. 💆 **Massage Cổ Vai Gáy Chuyên Sâu**: `+50.000đ` • `+20 phút` (Icon: `💆`)
2. 🧖 **Tẩy Tế Bào Chết Da Đầu Thảo Dược**: `+40.000đ` • `+15 phút` (Icon: `🧖`)
3. 🥑 **Đắp Mặt Nạ Thảo Mộc / Collagen**: `+30.000đ` • `+10 phút` (Icon: `🥑`)
4. 🌿 **Xông Hơi Tinh Dầu Trị Liệu**: `+35.000đ` • `+15 phút` (Icon: `🌿`)
5. 💆‍♀️ **Massage Nâng Cơ Mặt Ngọc Thạch**: `+60.000đ` • `+20 phút` (Icon: `💆‍♀️`)

### 3.2. Kịch Bản Nghiệp Vụ & Hành Vi Tương Tác:

#### 🟢 KỊCH BẢN 1: MỞ DANH SÁCH & CHỌN DỊCH VỤ PHỤ
- KTV bấm vào nút viền nét đứt: `[ ➕ Thêm Dịch Vụ Làm Thêm / Cộng Phút ]`.
- Bảng popover `#pos-addon-selector-box` trượt mở ra với danh sách các dịch vụ phụ dạng lưới 2 cột.
- Khi chạm vào 1 dịch vụ:
  - Thẻ đổi sang màu hồng cam viền `#E58A7B`, hiển thị dấu tích xanh `✓`.
  - ID của dịch vụ được thêm vào mảng `selectedAddonIds`.

#### 🟢 KỊCH BẢN 2: HIỂN THỊ THẺ CHIP ĐÃ CHỌN & XÓA NHANH
- Dưới nút bấm sẽ xuất hiện các thẻ Chip màu hồng cam nổi bật:
  `[ 💆 Massage Cổ Vai Gáy (+50.000 đ) ✕ ]`
- Nếu khách đổi ý không làm nữa, KTV chỉ cần bấm vào dấu **`✕`** trên thẻ chip để gỡ bỏ ngay lập tức.

#### 🟢 KỊCH BẢN 3: CỘNG DỒN TIỀN & ĐỒNG HỒ ĐẾM NGƯỢC
- Thẻ tóm tắt góc trên tự động tính lại tổng tiền và tổng phút:
  $$	ext{Tổng Bill} = 	ext{Giá Combo} + \sum 	ext{Giá Addons}$$
  $$	ext{Tổng Phút} = 	ext{Phút Combo} + \sum 	ext{Phút Addons}$$
  *(Ví dụ: Combo 1 64k 45p + Massage Vai Gáy 50k 20p $ightarrow$ Hiển thị: `114.000 đ • 65p`)*.
- Khi bấm **"Bắt Đầu Tour Gội"**: Đồng hồ đếm ngược nhận đúng **65 phút**.
- Khi Hoàn Thành Tour: Hóa đơn ghi rõ `service_name = "Combo 1 (+ Massage Cổ Vai Gáy Chuyên Sâu)"`, tiền `114.000đ`, hoa hồng KTV được chia theo tổng bill.

---

## 4. Luồng Xử Lý Logic & Quản Lý State (State Management)
- **Biến toàn cục**: `selectedAddonIds = []`.
- **Hàm hỗ trợ**:
  - `toggleSelectAddon(addonId)`: Toggle chọn/bỏ chọn addon.
  - `removeSelectedAddon(addonId)`: Gỡ addon trực tiếp từ thẻ chip.
  - `getSelectedAddonsData()`: Trả về danh sách object chi tiết các addon đang được chọn.
  - `resetPOSForm()`: Tự động xóa sạch `selectedAddonIds = []` và clear toàn bộ thẻ chip khi ca gội kết thúc.

---

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_menu` (dòng có `category = "addon"` hoặc cấu hình trong `DEFAULT_ADDONS`).
- **Ghi vào `tb_receipts`**:
  - Cột I: `service_name` (Ghi rõ combo chính kèm tên các addon đã làm).
  - Cột J: `price` (Tổng tiền sau khi cộng dồn).
  - Cột K: `duration_min` (Tổng phút sau khi cộng dồn).
- **Ghi vào `tb_payroll_logs`**:
  - Ghi nhận hoa hồng KTV tương ứng theo tỷ lệ phần trăm trên tổng doanh thu ca.

---

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Khởi tạo tài liệu đặc tả.
- `2026-09-01` (`v0.0.1.6`): Triển khai hoàn thiện giao diện nút bấm popover, thẻ chip hiển thị kèm nút xóa `✕`, cơ chế cộng dồn giá tiền và thời lượng đồng hồ đếm ngược.
