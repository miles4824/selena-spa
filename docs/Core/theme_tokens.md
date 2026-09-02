# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: HỆ THỐNG GIAO DIỆN & MÃ MÀU THƯƠNG HIỆU (THEME TOKENS & DESIGN SYSTEM)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Thiết lập ngôn ngữ thiết kế đồng nhất (Design System) cho toàn bộ ứng dụng Selena Spa.
- Định hình phong cách **Luxury Spa Thư Giãn & Cao Cấp**: Kết hợp giữa gam màu kem ấm (#FAF6F1), màu cam đào ngọt ngào (#E58A7B) và xanh ngọc bích thư thái (#2E7D6D).
- Đảm bảo tính thẩm mỹ, độ tương phản chuẩn WCAG, dễ đọc và tối ưu trải nghiệm thao tác trên thiết bị di động (Mobile-First).

---

## 2. Danh Sách File Cấu Thành (HTML, JS & CSS)
- **File Định Nghĩa Mã Màu Core**: `js/Core/Theme/theme_tokens.js`
- **Cấu hình Tailwind CSS & Typography**: `index.html` (Khối `<script>` Tailwind CDN)
- **Tài Nguyên Font Chữ Trực Tuyến**: Google Fonts (*Playfair Display*, *Plus Jakarta Sans*, *JetBrains Mono*)
- **File Đặc Tả Kỹ Thuật**: `docs/Core/theme_tokens.md`

---

## 3. Bảng Mã Màu Thương Hiệu Chuẩn (Brand Color Palette)

### 3.1. Bảng Màu Cơ Bản:
| Tên Token | Mã Hex | Ý Nghĩa / Mục Đích Sử Dụng |
| :--- | :---: | :--- |
| `COLOR_PRIMARY` | `#E58A7B` | 🌸 **Màu Chủ Đạo**: Nút bấm chính, giá tiền nổi bật, combo đang chọn, viền active. |
| `COLOR_PRIMARY_HOVER` | `#D9796A` | 🌸 **Màu Chủ Đạo Khi Hover / Nhấn Giữ**. |
| `COLOR_ACCENT` | `#2E7D6D` | 🌿 **Màu Điểm Nhấn / Thành Công**: Nút Hoàn thành tour, huy hiệu rảnh rỗi, thời lượng phút. |
| `COLOR_ACCENT_HOVER` | `#25685B` | 🌿 **Màu Điểm Nhấn Khi Hover / Nhấn Giữ**. |
| `COLOR_BG_PAGE` | `#FAF6F1` | 🍦 **Màu Nền Trang Web**: Gam màu kem ấm dịu mắt, chống mỏi mắt cho nhân viên. |
| `COLOR_BG_CARD` | `#FFFFFF` | 📄 **Màu Nền Thẻ Card**: Nền trắng tinh khôi giúp nổi bật nội dung. |
| `COLOR_BG_INPUT` | `#F7F2EC` | 📦 **Màu Nền Ô Nhập Liệu / Dropdown Menu**. |
| `COLOR_BORDER` | `#F0EAE1` | 📏 **Màu Đường Viền**: Viền thẻ, đường nét đứt (dashed divider). |
| `COLOR_BORDER_LIGHT` | `#EFE8DF` | 📏 **Màu Viền Nhẹ Cho Popover & Input**. |
| `COLOR_TEXT_MAIN` | `#2D2424` | 🖋️ **Màu Chữ Chính**: Nâu đen ấm áp, dễ đọc, không gắt như đen tuyền (#000). |
| `COLOR_TEXT_MUTED` | `#7E7272` | 🖋️ **Màu Chữ Phụ**: Xám tro ấm cho nhãn phụ, số phút, ngày tháng. |
| `COLOR_TEXT_LIGHT` | `#A39696` | 🖋️ **Màu Chữ Placeholder / Ghi Chú Mờ**. |
| `COLOR_DISABLED` | `#B8ACA2` | 🔒 **Màu Trạng Thái Vô Hiệu Hóa / Khóa**. |
| `COLOR_CASH` | `#D35400` | 💵 **Màu Thanh Toán Tiền Mặt / Cảnh Báo Cam Đậm**. |

---

## 4. Hệ Thống Typography (Font Chữ) & Bo Góc (Border Radius)

### 4.1. Hệ Thống Font Chữ (3 Cấp Độ):
1. **Font Tiêu Đề (`font-serif`)**: *Playfair Display*
   - Dùng cho: Tiêu đề trang (`Tạo Tour Gội Mới`), Tên thương hiệu `Selena Spa`, Tiêu đề Modal.
   - Đặc tính: Mang lại cảm giác sang trọng, quý phái và đẳng cấp Spa.
2. **Font Nội Dung (`font-sans`)**: *Plus Jakarta Sans*
   - Dùng cho: Tên dịch vụ, tên KTV, tên khách hàng, các dòng mô tả, nút bấm.
   - Đặc tính: Hiện đại, tròn trịa, cực kỳ sắc nét trên màn hình điện thoại iPhone & Android.
3. **Font Số Liệu & Tiền Bạc (`font-mono`)**: *JetBrains Mono*
   - Dùng cho: Giá tiền (`64.000 đ`), Đồng hồ đếm giờ (`16:04`), Giờ bắt đầu (`21:59`), Số điện thoại.
   - Đặc tính: Con số có độ rộng đồng đều (monospaced), không bị giật layout khi số nhảy.

### 4.2. Hệ Thống Bo Góc (Border Radius Standards):
- **`rounded-3xl` (24px - 28px)**: Dùng cho Thẻ Card bao ngoài lớn (`live-session-card`, `pos-form-box`, Modals).
- **`rounded-2xl` (16px)**: Dùng cho Thẻ dịch vụ con, Ô nhập liệu (Input), Ô chọn Dropdown, Hộp chọn nhanh.
- **`rounded-xl` (12px)**: Dùng cho Thẻ Tag Chip 2 dòng, Huy hiệu thời gian, Mục trong menu thả xuống.
- **`rounded-full` (9999px)**: Dùng cho Nút hành động chính (`Hoàn Thành Tour`, `Bắt Đầu Tour`), Nút chọn nhanh Pill.

---

## 5. Quy Chuẩn Đổ Bóng & Hiệu Ứng (Shadows & Transitions)
- **Đổ bóng thẻ Card**: `shadow-xl shadow-stone-200/50` (Mềm mại, không bị đen bẩn).
- **Đổ bóng Menu Popover / Dropdown**: `shadow-2xl ring-1 ring-black/5` (Tạo độ nổi bật vượt trội).
- **Hiệu ứng nút bấm**: `transition-all duration-200 active:scale-95 cursor-pointer`.
- **Hiệu ứng Popover/Modal xuất hiện**: `animate-in fade-in zoom-in-95`.

---

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-02` (`v0.0.5.0`): Khởi tạo tài liệu đặc tả chuẩn hóa Hệ thống Giao diện & Bảng mã màu thương hiệu (Theme Tokens & Design System).
