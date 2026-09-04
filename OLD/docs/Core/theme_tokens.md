# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: HỆ THỐNG GIAO DIỆN & MÃ MÀU THƯƠNG HIỆU (THEME TOKENS & DESIGN SYSTEM)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Thiết lập ngôn ngữ thiết kế đồng nhất (Design System) cho toàn bộ ứng dụng Selena Spa.
- Định hình phong cách **Luxury Spa Thư Giãn & Cao Cấp**: Kết hợp giữa gam màu kem ấm (#FAF6F1), màu cam đào ngọt ngào (#E58A7B) và xanh ngọc bích thư thái (#2E7D6D).
- Đảm bảo tính thẩm mỹ, độ tương phản chuẩn WCAG, dễ đọc và tối ưu trải nghiệm thao tác trên thiết bị di động (Mobile-First).

---

## 2. Danh Sách File Cấu Thành (HTML, JS & CSS)
- **File Định Nghĩa Mã Màu Core**: `js/Core/Theme/theme_tokens.js`
- **Cấu hình Tailwind CSS & Typography**: `index.html` (Khối `<script>` Tailwind CDN)
- **Tài Nguyên Font Chữ Trực Tuyến**: Google Fonts (*Playfair Display* 400..900, *Plus Jakarta Sans* 200..800, *JetBrains Mono* 100..800)
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

### 4.1. Hệ Thống Font Chữ (3 Họ Font Chuẩn):
1. **Font Tiêu Đề (`font-serif`)**: *Playfair Display* (Google Fonts 400..900)
   - Áp dụng cho: Toàn bộ thẻ tiêu đề `h1, h2, h3`, `.font-heading`, `.font-serif-luxury`.
   - Phong cách: Đẳng cấp, sang trọng quý phái chuẩn Luxury Spa.
2. **Font Nội Dung & Nhập Liệu (`font-sans`)**: *Plus Jakarta Sans* (Google Fonts 200..800)
   - Áp dụng cho: Toàn trang (`body`), các ô input, tên khách hàng, SĐT, danh sách dịch vụ, nút bấm.
   - Phong cách: Tròn trịa, hiện đại, sắc nét tuyệt đối trên mọi màn hình di động.
3. **Font Số Tiền & Kỹ Thuật (`font-mono`)**: *JetBrains Mono* (Google Fonts 100..800)
   - Áp dụng cho: Toàn bộ số tiền (`+24.900 đ`), giờ bắt đầu (`21:59`), thời lượng (`23p`), đồng hồ đếm ngược (`00:00`), mã hóa đơn (`HD842235`).
   - Phong cách: Số monospaced thẳng hàng tuyệt đối, sắc sảo và hiện đại.

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
- `2026-09-02` (`v0.0.5.0`):
- `2026-09-02` (`v0.0.5.4`):
- `2026-09-02` (`v0.0.5.6`):
- `2026-09-02` (`v0.0.6.2`): Nạp đầy đủ 3 họ Google Fonts với toàn bộ dải Weights: Playfair Display (400..900), Plus Jakarta Sans (200..800) và JetBrains Mono (100..800).
- `2026-09-02` (`v0.0.5.8`): Xóa bỏ hoàn toàn mọi tham chiếu JetBrains Mono, tối ưu hệ thống nhẹ nhàng và minh bạch.
- `2026-09-02` (`v0.0.5.7`): Nạp đầy đủ dải độ dày 200..900 cho Font Literata, tinh chỉnh độ đậm tiêu đề thanh thoát chuẩn Luxury Spa và áp dụng class `uppercase tracking-wider` cho các tiêu đề chính. Đính chính chính xác dự án chỉ sử dụng duy nhất 2 họ font thực tế là Literata và Plus Jakarta Sans, loại bỏ hoàn toàn tên gọi JetBrains Mono thừa. Bổ sung đầy đủ định nghĩa Font-family tokens (Literata, Plus Jakarta Sans, JetBrains Mono) vào THEME_TOKENS. Khởi tạo tài liệu đặc tả chuẩn hóa Hệ thống Giao diện & Bảng mã màu thương hiệu (Theme Tokens & Design System).
