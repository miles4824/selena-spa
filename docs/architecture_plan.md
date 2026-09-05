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

### 4. Phân Định Trách Nhiệm Thư Mục & Phân Chia File Chuẩn Mực

```text
js/
├── UI/                                  <-- 1. CÁC LINH KIỆN & VỎ KHUNG TÁI SỬ DỤNG (TAILWIND 4)
│   ├── app_button.js                    <-- Nút bấm hành động (primary, secondary, danger, ghost...)
│   ├── app_card.js                      <-- Khung thẻ nền (banner, surface, mindora, zen; ambient: true)
│   ├── stat_card.js                     <-- Thẻ thống kê chỉ số & thành tích
│   ├── bed_card.js                      <-- Thẻ giám sát giường trực tiếp
│   ├── status_badge.js                  <-- Huy hiệu trạng thái (sẵn sàng, bận, trống)
│   ├── role_badge.js                    <-- Huy hiệu vai trò (KTV, Chủ tiệm)
│   ├── app_title.js                     <-- Tiêu đề hệ thống (AppTitle), CardHeader & ModalHeader
│   ├── modal_shell.js                   <-- Vỏ popup 3 tầng cố định header/footer
│   ├── theme_toggle.js                  <-- Nút gạt sáng / tối
│   └── bottom_nav.js                    <-- Thanh menu đáy kính mờ & viên thuốc trượt
│
├── Screens/                             <-- 2. NỘI DUNG RUỘT CỦA TỪNG MÀN HÌNH (4 TABS + AUTH)
│   ├── Auth/
│   │   └── login_screen.js              <-- Quản lý #container-login
│   │
│   ├── Home/                            <-- TAB 1: HOME [Khác nhau 100% -> Tách đôi]
│   │   ├── staff_home.js                <-- Giao diện kỹ thuật viên (Tour cá nhân, nút vào tour)
│   │   ├── owner_home.js                <-- Giao diện chủ sáng lập (Live giường, doanh thu ngày)
│   │   └── home_screen.js               <-- Router điều phối #container-home
│   │
│   ├── Pos/                             <-- TAB 2: ADD / POS [1 Nhạc trưởng + 16 Sub-Components]
│   │   ├── Components/                  <-- 16 Linh kiện độc lập (40-70 dòng/file, phẳng, tên kỹ thuật sạch)
│   │   │   ├── quick_pills.js           <-- Hàng nút chọn nhanh Combo 1 đến 5
│   │   │   ├── cart_chips.js            <-- Thẻ chip các món đã chọn (2 dòng + nút xoá)
│   │   │   ├── service_dropdown.js      <-- Menu thả xuống 7 nhóm dịch vụ + ô tìm kiếm
│   │   │   ├── cart_total_bar.js        <-- Thẻ tổng thanh toán (tổng tiền + tổng phút)
│   │   │   ├── staff_primary.js         <-- Ô chọn KTV 1 chính (khoá/mở theo role + mắt hoa hồng)
│   │   │   ├── staff_extra.js           <-- Nút thêm KTV phụ & danh sách KTV phụ
│   │   │   ├── customer_phone.js        <-- Ô nhập SĐT + gợi ý khách quen (che SĐT theo role)
│   │   │   ├── customer_fields.js       <-- Ô Tên và Tháng sinh (khoá tên khách cũ, mở khách mới)
│   │   │   ├── loyalty_card.js          <-- Thẻ chu kỳ 10 lần, banner sinh nhật 20%, voucher
│   │   │   ├── live_header.js           <-- Header ca đang chạy, nút hủy, nút Đổi/Thêm & Bàn Giao
│   │   │   ├── live_timer.js            <-- Đồng hồ đếm lùi MM:SS & thanh tiến trình %
│   │   │   ├── live_actions.js          <-- Nút [Hoàn Thành Tour] / [Xong Việc Rời Tour Sớm]
│   │   │   ├── checkout_modal.js        <-- Modal thanh toán 2 pha (bill khách + ảnh QR tĩnh VIB + tip riêng KTV)
│   │   │   ├── service_edit_modal.js    <-- Modal đổi/thêm dịch vụ giữa ca
│   │   │   ├── handover_modal.js        <-- Modal bàn giao ca cho KTV khác
│   │   │   └── swap_staff_modal.js      <-- Modal đổi / thêm KTV cùng làm & rời tour sớm
│   │   └── pos_screen.js                <-- Nhạc trưởng điều phối #container-pos (~120 dòng)
│   │
│   ├── History/                         <-- TAB 3: HISTORY [Khác nhau 70% -> Tách đôi]
│   │   ├── staff_history.js             <-- Lịch sử tour cá nhân KTV
│   │   ├── owner_history.js             <-- Lịch sử toàn tiệm, bộ lọc nâng cao, sửa/huỷ
│   │   └── history_screen.js            <-- Router điều phối #container-history
│   │
│   └── Wallet/                          <-- TAB 4: WALLET / TÀI CHÍNH [Khác nhau 90% -> Tách đôi]
│       ├── staff_wallet.js              <-- Bảng lương nhân viên, hoa hồng, xin ứng
│       ├── owner_wallet.js              <-- Sổ quỹ thu chi, duyệt lương, báo cáo tài chính
│       └── wallet_screen.js             <-- Router điều phối #container-income
│
└── Logic/                               <-- 3. TOÀN BỘ DỊCH VỤ DỮ LIỆU & TOÁN HỌC (ZERO DOM)
    ├── Engine/
    │   ├── firebase_engine.js           <-- WebSocket đồng bộ thời gian thực 20-50ms (Cache/Speed Layer)
    │   ├── gas_client.js                <-- Kết nối Google Apps Script có Secret Token (Storage Layer)
    │   └── config.js                    <-- Cấu hình thương hiệu & biến môi trường
    │
    └── Services/
        ├── phone_service.js             <-- Che số điện thoại bảo mật
        ├── home_service.js              <-- Xử lý nghiệp vụ ca trực & giường
        ├── pos_service.js               <-- Tính tổng tiền, voucher, chia hoa hồng tour
        ├── history_service.js           <-- Lọc tour theo ngày, KTV, tính doanh số
        └── wallet_service.js            <-- Tính toán bảng lương, hoa hồng & tiền tip
```

---

## 5. Cơ Chế Chống Hack Dữ Liệu & Bảo Mật 3 Tầng (Anti-Tampering)

1. **Lọc dữ liệu tại Máy chủ Google Apps Script (Server-Side Filtering)**:
   - Khi thiết bị nhân viên gửi request lấy dữ liệu, Google Apps Script chỉ đóng gói trả về danh mục menu và các tour của chính nhân viên đó (`client_staff_id`).
   - Tuyệt đối không gửi `receipts` (doanh thu toàn tiệm), `expenses` (chi phí) hay `payroll_logs` (lương người khác) về máy nhân viên.
   - Nhân viên dù có dùng F12 sửa `currentUser.role = 'owner'` thì màn hình cũng không có dữ liệu để hiển thị.

2. **Xác thực bảo mật qua Admin Secret Token**:
   - Khi Chủ tiệm đăng nhập, hệ thống cấp mã Token quản trị.
   - Mọi truy vấn xin dữ liệu nhạy cảm (Doanh thu, Thu chi) từ Google Apps Script đều phải gửi kèm Token này.
   - Bất kỳ ai copy link Google Apps Script gọi từ ngoài đều bị chặn `403 Forbidden`.

3. **Tốc Độ Thời Gian Thực 20-50ms (Không Giật Lag)**:
   - **Firebase Realtime Engine** hoạt động như một lớp đệm (Speed / Cache Layer): Dữ liệu đọc/ghi qua WebSocket siêu tốc (20-50 mili-giây), phản hồi tức thì 0ms trên màn hình (Optimistic UI).
   - **Google Sheets** đóng vai trò là sổ cái sao lưu vĩnh viễn (Permanent Storage Layer), được đồng bộ ngầm ở hậu cảnh mà không làm chặn luồng giao diện người dùng.

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
- **v0.0.4.5 (2026-09-05)**:
  - Tự động hóa toàn diện cơ chế che/hiện số tiền nhạy cảm (`privacyType: 'staff_comm' | 'owner_revenue'`) trực tiếp bên trong `StatCard` (`StatCard.toggle(cardId, privacyType)`).
  - Loại bỏ hoàn toàn mã lặp boilerplate cập nhật DOM ở các màn hình `staff_home.js` và `owner_home.js`.
  - Đảm bảo tính bảo mật Zero Leaks (không để lộ tiền thật vào thuộc tính HTML DOM) và tính đa hình Realtime 100% khi số liệu cập nhật từ Firebase.
  - Tối ưu cơ chế render lại SVG Lucide icon mượt mà, chống lỗi cache icon trên các trình duyệt di động.
- **v0.0.4.4 (2026-09-05)**:
  - Tích hợp tính năng bảo mật ẩn/hiện số tiền Doanh Thu Hôm Nay (`owner-today-revenue`) cho Chủ Sáng Lập qua `HomeService.toggleOwnerRevenuePrivacy()` và hàm xử lý `handleOwnerTogglePrivacy()`.
  - Hỗ trợ tham số `isMasked` linh hoạt trong `StatCard` để hiển thị đúng biểu tượng `eye` / `eye-off`.
- **v0.0.4.3 (2026-09-05)**:
  - Khắc phục lỗi mất màu nền gradient trên thẻ `toursCardHtml` (`StatCard` variant `coral` - Số Tour Đã Gội) bằng class `.stat-card-coral` chuẩn CSS gradient và khai báo `@theme` trực tiếp trong `<style type="text/tailwindcss">` của `index.html`.
- **v0.0.4.2 (2026-09-05)**:
  - Rà soát quét toàn bộ codebase và triệt tiêu dứt điểm 100% các mã màu fix cứng còn sót lại (`manifest.json`, `Code.gs`, `modal_shell.js`, `bed_card.js`, `stat_card.js`, `status_badge.js`, `owner_home.js`, `login_screen.js`).
  - Chuyển toàn bộ các thành phần sang token ngữ nghĩa Tailwind 4 Mindora Luxury (`bg-spa-card`, `bg-spa-sage-light`, `text-spa-sage`, `border-spa-border`, `to-spa-mist`...).
  - Đồng bộ `APP_VERSION = 'v0.0.4.2'` giữa `config.js`, `index.html` và tài liệu kỹ thuật.
- **v0.0.4.1 (2026-09-04)**:
  - Đồng bộ chuẩn hóa toàn bộ mã màu trong dự án sang 5 màu nhận diện Mindora Luxury (`#5E887E`, `#A7C7E7`, `#2F3E46`, `#F1F5F4`, `#E8AEB7`).
  - Xóa bỏ triệt để các mã màu fix cứng cũ (`#E58A7B`, `#FAF6F1`, `#2D2424`).
  - Tích hợp hiệu ứng Ambient Glow Spheres trực tiếp vào `AppCard({ ambient: true })`.
  - Khắc phục dứt điểm lỗi bo viền WebKit iOS bằng `-webkit-mask-image` và `isolation: isolate`.
  - Khắc phục lỗi nội dung bị che tai thỏ / Dynamic Island khi nạp app lần đầu bằng hàm `max(54px, ...)`.
- **v0.0.3.0 (2026-09-04)**:
  - Thiết kế kiến trúc Đa Container (Multi-Container Architecture) chuyển tab tức thì 0ms, không mất dữ liệu form POS.
  - Tách `bottom_nav.js` thành component độc lập nằm ngoài container màn hình.
