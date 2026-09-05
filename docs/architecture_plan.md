# 🏛️ ĐẶC TẢ KIẾN TRÚC ỨNG DỤNG SELENA SPA (MULTI-CONTAINER ARCHITECTURE)

## 1. Triết Lý & Mục Tiêu Nghiệp Vụ
- **Bảo toàn trạng thái form tuyệt đối (Zero-loss Form State)**:
  Trong nghiệp vụ tiệm Spa, KTV hoặc Chủ tiệm khi đang lập phiếu tour ở tab **POS** (chọn Combo, thêm dịch vụ phụ, gán KTV, nhập SĐT khách) thường xuyên phải nhảy sang tab **Home** để xem tình trạng giường hoặc sang tab **Lịch sử** để xem thông tin cũ.
  -> Kiến trúc **Đa Container (Multi-Container)** đảm bảo khi chuyển tab, form POS chỉ bị ẩn (`hidden`), toàn bộ dữ liệu đang gõ và các nút đang chọn được **giữ nguyên vẹn 100%**, không cần code lưu nháp phức tạp.
- **Tốc độ chuyển tab tức thì 0ms (60 FPS Transition)**:
  Chuyển tab chỉ là thao tác hoán đổi class CSS (`hidden`) giữa các container, không phá hủy và không dựng lại DOM, triệt tiêu hoàn toàn độ trễ giật lag.
- **Không có Top Header chung**:
  Màn hình Home, POS, History không có Header chung trên đầu (vào thẳng nội dung nghiệp vụ). Chỉ riêng màn hình Thu nhập / Báo cáo (Wallet) mới có Header thông tin tài khoản và nút Đăng xuất như bản thiết kế gốc.

---

## 2. Cấu Trúc DOM Chuẩn Trong `index.html`

```html
<body class="min-h-screen bg-spa-bg text-spa-dark font-sans selection:bg-spa-brand/20">

  <!-- 1. CONTAINER MÀN HÌNH ĐĂNG NHẬP -->
  <div id="container-login"></div>

  <!-- 2. HỆ THỐNG CÁC CONTAINER MÀN HÌNH CHÍNH (4 TABS) -->
  <div id="container-home" class="min-h-screen pb-28"></div>
  <div id="container-pos" class="min-h-screen pb-28 hidden"></div>
  <div id="container-history" class="min-h-screen pb-28 hidden"></div>
  <div id="container-income" class="min-h-screen pb-28 hidden"></div>

  <!-- 3. THANH ĐIỀU HƯỚNG ĐÁY CỐ ĐỊNH (BOTTOM NAVIGATION DOCK) -->
  <div id="container-nav"></div>

  <!-- 4. KHUNG CHỨA MODAL TOÀN CỤC -->
  <div id="container-modals"></div>

</body>
```

---

## 3. Cơ Chế Định Tuyến & Vòng Đời (Routing & Lifecycle)

### A. Quy Trình Khởi Động (`DOMContentLoaded`)
1. Kiểm tra `currentUser` trong `localStorage`:
   - **Chưa đăng nhập**:
     - Ẩn toàn bộ `container-home`, `container-pos`, `container-history`, `container-income`, `container-nav`.
     - Kích hoạt `initLogin()` vào `#container-login`.
   - **Đã có phiên**:
     - Ẩn `#container-login`.
     - Gọi `renderHomeScreen()` vào `#container-home` và gỡ bỏ class `hidden`.
     - Dựng và hiển thị Bottom Nav: `renderBottomNav('home')` và `showBottomNav()`.

### B. Cơ Chế Lazy Load & Refresh Hooks (Triệt tiêu 100% nhược điểm Đa Container)

1. **Lazy Mount (Nạp lười - Tiết kiệm RAM và tối ưu lúc mở app)**:
   - Khi vừa đăng nhập thành công: **Chỉ nạp duy nhất `#container-home`**.
   - Ba container còn lại (`pos`, `history`, `income`): Vẫn để rỗng.
   - Khi người dùng **lần đầu click vào tab nào**: Hệ thống kiểm tra container đó chưa có nội dung (`!container.hasChildNodes()`) thì mới tiến hành dựng HTML lần đầu.
   - Từ lần click thứ 2 trở đi: Không dựng lại nữa, chỉ gỡ class `hidden` để hiện ngay lập tức trong 0ms.

2. **Refresh Hooks (Làm mới dữ liệu - Không bao giờ bị cũ số liệu)**:
   - Mỗi khi hàm `showScreen(tab)` mở một container lên, nó sẽ chạy một **Refresh Hook** nhẹ nhàng:
     - Khi mở lại **Home**: Gọi `refreshLiveBeds()` để cập nhật ngay số phút các giường đang chạy, mà KHÔNG đập đi xây lại cả trang.
     - Khi mở lại **History**: Tải thêm các tour vừa hoàn thành trong ngày.
     - Khi mở lại **POS**: **KHÔNG refresh** để giữ nguyên vẹn form tour đang nhập dở.

### C. Quy Trình Đăng Xuất (`handleLogout`)
- Đặt tại tầng Router toàn cục (`index.html`).
- Xóa `currentUser`, dừng timer, ẩn các container chính và ẩn Bottom Nav, hiển thị lại `#container-login`.

---

## 4. Phân Định Trách Nhiệm Thư Mục

```text
js/
├── UI/                  <-- CÁC LINH KIỆN & VỎ KHUNG TÁI SỬ DỤNG (TAILWIND 4)
│   ├── app_button.js    <-- Nút bấm hành động (primary, secondary, danger, ghost...)
│   ├── app_card.js      <-- Khung thẻ nền (banner, surface, mindora, zen; ambient: true)
│   ├── stat_card.js     <-- Thẻ thống kê chỉ số & thành tích
│   ├── bed_card.js      <-- Thẻ giám sát giường trực tiếp
│   ├── status_badge.js  <-- Huy hiệu trạng thái (sẵn sàng, bận, trống)
│   ├── role_badge.js    <-- Huy hiệu vai trò (KTV, Chủ tiệm)
│   ├── app_title.js     <-- Tiêu đề chuẩn hóa toàn hệ thống
│   ├── modal_shell.js   <-- Vỏ popup 3 tầng cố định header/footer
│   ├── theme_toggle.js  <-- Nút gạt sáng / tối
│   ├── bottom_nav.js    <-- Thanh menu đáy kính mờ & viên thuốc trượt
│   └── pull_to_refresh.js <-- Kéo vuốt để làm mới
│
├── Screens/             <-- NỘI DUNG RUỘT CỦA TỪNG MÀN HÌNH (ROUTING VIEW)
│   ├── Auth/
│   │   └── login_screen.js   <-- Quản lý #container-login
│   ├── Home/
│   │   ├── home_screen.js    <-- Điều phối #container-home
│   │   ├── owner_home.js     <-- Giao diện chủ sáng lập
│   │   └── staff_home.js     <-- Giao diện kỹ thuật viên
│   ├── Pos/                  <-- Quản lý #container-pos
│   ├── History/              <-- Quản lý #container-history
│   └── Income/               <-- Quản lý #container-income
│
└── Logic/               <-- TOÀN BỘ DỊCH VỤ DỮ LIỆU & TOÁN HỌC (ZERO DOM)
    ├── Engine/
    │   ├── firebase_engine.js <-- WebSocket đồng bộ thời gian thực 0.03s
    │   └── config.js          <-- Cấu hình thương hiệu & kéo trực tiếp từ Google Sheets
    └── Services/
        ├── phone_service.js   <-- Che số điện thoại bảo mật
        ├── home_service.js    <-- Xử lý nghiệp vụ ca trực & giường
        └── payroll_service.js <-- Tính lương, hoa hồng & tiền tip
```

---

## 5. Tiêu Chuẩn Giao Diện Mindora Luxury & Tối Ưu Hóa Thiết Bị (Mobile WebKit Standard)

### A. Hệ Thống 5 Màu Mindora Luxury Cốt Lõi (Zero Hardcoding)
Toàn bộ hệ thống giao diện được quy chuẩn trên 5 gam màu phong thủy thư giãn tĩnh tại:
- **`#5E887E` (`spa-brand`)**: Xanh ngọc xô thơm quý phái (nút chính, viền active, nhấn mạnh).
- **`#A7C7E7` (`spa-mist`)**: Xanh sương mai dịu mát (badge phụ, vầng sáng trung tâm).
- **`#2F3E46` (`spa-dark`)**: Xám đá phiến trầm sang trọng (chữ tiêu đề, nền Dark Mode).
- **`#F1F5F4` (`spa-bg`)**: Trắng sứ ngọc trai nhẹ êm mắt (nền tổng thể light mode).
- **`#E8AEB7` (`spa-blush`)**: Hồng phấn hoàng gia tinh tế (badge nổi bật, vầng sáng ambient).
- **Quy tắc**: Tuyệt đối xóa bỏ mã màu san hô cũ (`#E58A7B`), màu nền cát cũ (`#FAF6F1`) và màu chữ nâu cũ (`#2D2424`). Bắt buộc dùng semantic Tailwind classes.

### B. Cơ Chế Chống Lỗi WebKit Bo Góc Bị Xén (Cạnh Bo Cạnh Không)
- Sử dụng bộ 3 thuộc tính đồng bộ trên `AppCard`, `StatCard`, `BedCard`:
  ```css
  style="-webkit-mask-image: -webkit-radial-gradient(white, black); border-radius: 28px; -webkit-border-radius: 28px; isolation: isolate; transform: translateZ(0);"
  ```
- Ép GPU tạo layer cô lập (isolated stacking context), đảm bảo bo viền tròn $100\%$ mượt mà không bị xén cạnh trên Safari / WebKit iOS.

### C. Khoảng Cách An Toàn Tai Thỏ / Dynamic Island Trên iOS
- Khắc phục triệt để lỗi `env(safe-area-inset-top)` trả về `0px` lúc vừa mở app chưa cuộn trang:
  ```css
  padding-top: max(54px, calc(env(safe-area-inset-top, 0px) + 12px));
  bottom: max(14px, calc(env(safe-area-inset-bottom, 0px) + 6px));
  ```

### D. Tích Hợp Hiệu Ứng Quả Cầu Phát Sáng (Ambient Glow Spheres)
- Thay vì viết HTML quả cầu lặp lại nhiều nơi, `AppCard` hỗ trợ tham số `ambient: true` tự động render 3 quả cầu phát sáng mềm mại với màu sắc Mindora Luxury (`#E8AEB7`, `#5E887E`, `#A7C7E7`).

---

## 6. Lịch Sử Phiên Bản & Lưu Vết (Changelog)
- **v0.0.4.1 (2026-09-04)**:
  - Đồng bộ chuẩn hóa toàn bộ mã màu trong dự án sang 5 màu nhận diện Mindora Luxury (`#5E887E`, `#A7C7E7`, `#2F3E46`, `#F1F5F4`, `#E8AEB7`).
  - Xóa bỏ triệt để các mã màu fix cứng cũ (`#E58A7B`, `#FAF6F1`, `#2D2424`).
  - Tích hợp hiệu ứng Ambient Glow Spheres trực tiếp vào `AppCard({ ambient: true })`.
  - Khắc phục dứt điểm lỗi bo viền WebKit iOS bằng `-webkit-mask-image` và `isolation: isolate`.
  - Khắc phục lỗi nội dung bị che tai thỏ / Dynamic Island khi nạp app lần đầu bằng hàm `max(54px, ...)`.
- **v0.0.3.0 (2026-09-04)**:
  - Thiết kế kiến trúc Đa Container (Multi-Container Architecture) chuyển tab tức thì 0ms, không mất dữ liệu form POS.
  - Tách `bottom_nav.js` thành component độc lập nằm ngoài container màn hình.
