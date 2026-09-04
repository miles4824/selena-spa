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
├── UI/                  <-- CÁC LINH KIỆN & VỎ KHUNG TÁI SỬ DỤNG
│   ├── bottom_nav.js    <-- Thanh menu đáy & viên thuốc trượt
│   ├── modal_shell.js   <-- Vỏ popup
│   ├── pull_to_refresh.js
│   ├── app_button.js, app_card.js, bed_card.js, stat_card.js...
│
├── Screens/             <-- NỘI DUNG RUỘT CỦA TỪNG MÀN HÌNH
│   ├── Auth/login_screen.js  <-- Quản lý #container-login
│   ├── Home/
│   │   ├── home_screen.js    <-- Quản lý #container-home
│   │   ├── owner_home.js
│   │   └── staff_home.js
│   ├── Pos/                  <-- Quản lý #container-pos (Tương lai)
│   ├── History/              <-- Quản lý #container-history (Tương lai)
│   └── Income/               <-- Quản lý #container-income (Tương lai)
│
└── Logic/               <-- TOÀN BỘ DỊCH VỤ DỮ LIỆU & TOÁN HỌC
    ├── Engine/firebase_engine.js, config.js
    └── Services/phone_service.js, home_service.js, payroll_service.js...
```
