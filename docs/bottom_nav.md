# 📌 ĐẶC TẢ THIẾT KẾ & KỸ THUẬT: THANH ĐIỀU HƯỚNG DƯỚI ĐÁY (BOTTOM NAVIGATION DOCK)

## 1. Mục Đích & Bối Cảnh Nghiệp Vụ
- **Bottom Navigation Dock** là thanh điều hướng chính (Global Navigation) của ứng dụng Selena Spa, hiển thị nổi cố định ở dưới đáy màn hình trên thiết bị di động và tablet.
- Phục vụ chuyển đổi tức thì giữa 4 phân hệ chính của tiệm:
  1. **Trang Chủ (`home`)**: Dashboard ca trực cho KTV hoặc Dashboard giám sát vận hành cho Chủ tiệm.
  2. **Tạo Ca / Vé Mới (`pos` / `add`)**: Màn hình bán hàng, chọn KTV, chọn dịch vụ và tính tiền.
  3. **Lịch Sử (`history`)**: Xem lại các tour đã phục vụ trong ngày của KTV hoặc toàn bộ hóa đơn của tiệm.
  4. **Thu Nhập / Báo Cáo (`income`)**: Bảng lương, tiền tip, hoa hồng của KTV hoặc Sổ thu chi, báo cáo doanh thu của Chủ tiệm.

---

## 2. Kiến Trúc Cô Lập (Architecture & Isolation)
Để đảm bảo hiệu năng 60 FPS, không bao giờ bị giật lag hay chớp màn hình khi chuyển tab:
- **Vị trí gắn trong DOM**: Nằm tại container độc lập `<div id="container-nav"></div>` trong file `index.html`, hoàn toàn nằm ngoài container chứa màn hình (`#app`).
- **Nguyên tắc bất biến**:
  - Thanh Nav chỉ được dựng (render) **đúng 1 lần duy nhất** khi người dùng đăng nhập thành công vào ứng dụng.
  - Khi người dùng chuyển đổi giữa các màn hình con, thanh Nav **KHÔNG BAO GIỜ bị xóa bỏ (destroy) hay dựng lại (re-render)**.
  - Việc ẩn/hiện thanh Nav chỉ thực hiện thông qua 2 hàm điều khiển class: `showBottomNav()` và `hideBottomNav()`.

---

## 3. Cấu Trúc Giao Diện & Design Tokens (Tailwind 4)

### A. Khung Dock Kính Mờ Nổi (Floating Glass Dock)
- **Vị trí cố định (Fixed Positioning)**:
  ```html
  <nav id="mobile-bottom-nav" class="fixed left-4 right-4 z-50 max-w-sm mx-auto pointer-events-auto" style="bottom: max(14px, calc(env(safe-area-inset-bottom, 0px) + 6px));">
  ```
  - Hỗ trợ chuẩn `max(14px, calc(env(...) + 6px))` đảm bảo khoảng cách an toàn chống dính đáy trên iPhone (Home Bar / Dynamic Island) và các dòng Android gesture navigation.
- **Hiệu ứng kính mờ Mindora Luxury**:
  - Nền: `bg-white/90 dark:bg-[#2F3E46]/95 border border-spa-border dark:border-[#3D4E56] backdrop-blur-xl`
  - Bo tròn hoàn toàn: `rounded-full`
  - Đổ bóng chiều sâu: `shadow-[0_12px_32px_rgba(0,0,0,0.10)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.5)]`
  - Padding: `px-2.5 py-4`

### B. Hiệu Ứng Viên Thuốc Trượt (Sliding Pill Indicator)
- **Thẻ trượt phát sáng**:
  ```html
  <div id="nav-sliding-indicator" class="absolute rounded-full bg-spa-brand shadow-glow-brand z-[1] pointer-events-none opacity-0 transition-all duration-300 ease-out"></div>
  ```
- **Nguyên lý chuyển động**:
  - Lấy toạ độ `offsetLeft`, kích thước `offsetWidth`, `offsetHeight`, `offsetTop` của nút tab đang active.
  - Sử dụng CSS Transform: `transform: translateX(${activeBtn.offsetLeft}px)`.
  - Hiệu ứng trượt chuyển mượt mà 2 chiều (trái sang phải hoặc phải sang trái) với thời lượng 300ms (`duration-300 ease-out`).
- **Màu sắc nút bấm theo bộ 5 màu Mindora**:
  - Nút đang active (nằm đè lên viên thuốc hồng `spa-brand`): `!text-white active`.
  - Nút inactive: `text-spa-muted dark:text-spa-mist hover:text-spa-brand dark:hover:text-white`.

---

## 4. Đặc Tả 4 Nút Điều Hướng

| STT | Mã Tab | Tên Nút | Icon Lucide | Tiêu Đề Staff | Tiêu Đề Owner |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | `home` | Trang chủ | `home` | Trang chủ | Trang chủ |
| 2 | `pos` | Tạo ca mới | `plus` | Tạo ca mới | Tạo ca mới |
| 3 | `history` | Lịch sử | `clock` | Lịch sử tour | Lịch sử toàn tiệm |
| 4 | `income` | Thu nhập / Báo cáo | `wallet` | Thu nhập | Báo cáo |

---

## 5. Danh Sách Hàm API Toàn Cục (`window`)

### 1. `renderBottomNav(activeTab = 'home')`
- **Mục đích**: Render cấu trúc HTML của thanh Dock vào bên trong thẻ `#container-nav`.
- **Tham số**: `activeTab` (Mặc định là `'home'`).

### 2. `updateNavSlidingPill(activeTab = 'home')`
- **Mục đích**: Di chuyển viên thuốc trượt đến vị trí nút tab được chọn và cập nhật trạng thái màu sắc (`!text-white`).
- **Tự động thích ứng**: Lắng nghe sự kiện `window.addEventListener('resize')` để tự căn chỉnh vị trí viên thuốc khi xoay màn hình điện thoại.

### 3. `navigateTab(tab)`
- **Mục đích**: Hàm xử lý sự kiện click khi người dùng bấm vào các nút trên thanh Nav.
- **Logic chống giật màn hình**:
  - Nếu người dùng đang ở tab `home` và bấm lại tab `home`, hệ thống chỉ cuộn mượt lên đầu trang (`window.scrollTo({ top: 0, behavior: 'smooth' })`), không tải lại DOM.
  - Cập nhật vị trí viên thuốc trượt.
  - Kích hoạt router chuyển màn hình `showScreen(tab)`.

### 4. `showBottomNav()` & `hideBottomNav()`
- **Mục đích**: Ẩn hoặc hiện thanh Nav.
- **Sử dụng**: Ẩn khi ở màn hình Login, hiện khi đã đăng nhập thành công vào app.

---

## 6. Lịch Sử Phiên Bản & Lưu Vết (Changelog)
- **v0.0.4.1 (2026-09-04)**:
  - Cập nhật công thức căn lề an toàn dưới đáy sang `max(14px, calc(env(safe-area-inset-bottom, 0px) + 6px))` đảm bảo không bao giờ bị dính mép dưới trên cả iPhone (tai thỏ / Dynamic Island) và Android.
  - Chuẩn hóa màu sắc nút và thanh Dock theo bộ 5 màu Mindora Luxury (`bg-white/90 dark:bg-[#2F3E46]/95`, `text-spa-muted dark:text-spa-mist hover:text-spa-brand dark:hover:text-white`).
  - Đồng bộ bóng đổ Dark Mode `dark:shadow-[0_12px_32px_rgba(0,0,0,0.5)]` tạo độ sâu nổi bật và sang trọng.
- **v0.0.3.1 (2026-09-04)**:
  - Đồng bộ biến trạng thái `currentActiveNavTab` bên trong `updateNavSlidingPill()` và `renderBottomNav()`.
  - Khắc phục triệt để lỗi khi người dùng nhảy trang qua các nút hành động trong thân trang (như nút *"LẬP PHIẾU TOUR MỚI"*), sau đó bấm lại icon `home` ở Bottom Nav bị chặn không cho chuyển về Home do lệch biến `currentActiveNavTab`.
  - Chuyển toàn bộ các nút điều hướng trong trang (`owner_home.js`, `staff_home.js`, `index.html`) sang sử dụng `navigateTab()` đồng bộ.
- **v0.0.3.0 (2026-09-04)**:
  - Tách hoàn toàn thanh Nav ra khỏi màn hình Home, đưa vào container độc lập `#container-nav` bên ngoài `#app`.
  - Đơn giản hóa logic trượt viên thuốc về thuật toán gốc thuần CSS `translateX()` 15 dòng như bản cũ (`OLD`), đảm bảo trượt mượt mà 100% hai chiều.
  - Bổ sung `window.scrollTo(0, 0)` khi chuyển tab để triệt tiêu hiện tượng giật cục thanh cuộn trên màn hình dài của Admin.
