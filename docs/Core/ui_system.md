# 🧩 HỆ THỐNG UI SYSTEM (MODULAR REUSABLE COMPONENTS)

*Hồ sơ đặc tả kỹ thuật chuẩn hóa toàn bộ thành phần giao diện (UI Components) của dự án Selena Spa theo kiến trúc Component-Driven với Tailwind 4.*


### D. Component `ModalShell`
- **Cấu trúc chuẩn 3 tầng**:
  + **Tầng 1 (Header Sticky)**: Ghim chặt trên đỉnh với icon, tiêu đề và nút đóng ✕ tròn `w-8 h-8 rounded-full`.
  + **Tầng 2 (Body Scrollable)**: Cuộn mượt ở giữa với `overflow-y-auto overscroll-contain flex-1`.
  + **Tầng 3 (Footer Sticky)**: Ghim chặt ở đáy chứa các nút bấm hành động (`AppButton`).
- **Kích thước**: `max-h-[calc(100dvh-48px)]`, bo góc `rounded-[28px]`, viền `#F0EAE1`, đổ bóng `shadow-2xl`.

### E. Component `RoleBadge`
- `role: 'owner'`: Nền vàng hoàng gia `bg-[#FEF9C3] text-[#854D0E] border border-[#FEF08A]` kèm nhãn `👑 Chủ Sáng Lập`.
- `role: 'staff'`: Nền cam đào nhạt `bg-[#FFF0EB] text-[#E58A7B] border border-[#FCDFD7]` kèm nhãn `💆 Kỹ Thuật Viên`.

### F. Component `BedCard`
- Quy chuẩn thẻ giường trực tiếp trên Admin Home: Tên giường (Giường số 01, 02...), tên khách, dịch vụ, thanh % thời gian chạy động, nhấp nháy đỏ khi lố giờ (`animate-pulse`), và nút bấm vào xem ca.

---

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm (Purpose & Context)
- Trong quá trình vận hành, hệ thống có rất nhiều thành phần giao diện lặp lại giữa màn hình của **Kỹ Thuật Viên (Staff)**, **Chủ Tiệm (Admin/Owner)**, **Màn hình tạo tour/POS**, và **các Popup Modal** (như Nút bấm hành động, Thẻ chỉ số thành tích, Huy hiệu trạng thái Sẵn sàng/Đang trong ca, Khung viền Modal).
- Trước đây, các đoạn mã HTML và class Tailwind bị phân tán rải rác ở hàng chục file HTML khác nhau, dẫn đến:
  + Khi muốn đổi màu, đổi font chữ hay đổi bo góc nút bấm thì phải sửa ở nhiều nơi.
  + Dễ xảy ra tình trạng lệch giao diện (ví dụ: Staff một kiểu, Admin một kiểu).
- **Giải pháp**: Xây dựng **Hệ thống UI System (Modular Components)** đặt tại js/Core/Components/. Toàn bộ class Tailwind 4 và kiểu dáng được quản lý tập trung 100%. Khi cần tinh chỉnh, **chỉ cần sửa đúng 1 nơi duy nhất**, toàn bộ app sẽ tự động đồng bộ theo.

---

## 2. Danh Sách File Cấu Thành (Constituent Files)
- **Thư mục linh kiện Component lõi**:
  + js/Core/Components/app_button.js: Chuẩn nút bấm hành động toàn hệ thống (AppButton).
  + js/Core/Components/stat_card.js: Chuẩn thẻ chỉ số & thành tích (StatCard).
  + js/Core/Components/status_badge.js: Chuẩn huy hiệu trạng thái Bận/Rảnh (StatusBadge).
  + js/Core/Components/role_badge.js: Chuẩn huy hiệu vai trò Chủ Tiệm / KTV (RoleBadge).
  + js/Core/Components/bed_card.js: Chuẩn thẻ giường giám sát realtime (BedCard).
  + js/Core/Components/home_banner.js: Chuẩn thẻ banner chào đón luxury (HomeBanner).
  + js/Core/Components/modal_shell.js: Chuẩn khung viền popup modal (ModalShell).
- **Khung giao diện HTML (Layout Skeleton)**:
  + iews/staff/home.html & iews/owner/home.html: Giữ khung layout phân chia vị trí đặt component sạch sẽ.

---

## 3. Quy Tắc Giao Diện & Toàn Bộ Kịch Bản Nghiệp Vụ (UI Scenarios)

### A. Component AppButton
- **Các biến thể màu sắc (Tailwind 4)**:
  + primary: g-gradient-to-r from-[#E58A7B] to-[#F09A8D] hover:opacity-95 text-white shadow-lg shadow-[#E58A7B]/25.
  + 	eal: g-gradient-to-r from-[#2E7D6D] to-[#3B9E8B] hover:opacity-95 text-white shadow-lg shadow-[#2E7D6D]/25.
  + secondary: g-[#FAF6F1] hover:bg-[#FFF0EB] text-[#2D2424] border border-[#EFE8DF].
  + danger: g-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200.
- **Kích thước chuẩn**:
  + lg: w-full sm:w-auto px-7 py-3.5 text-sm sm:text-base rounded-full font-extrabold (dành cho nút chính trang Home).
  + md: px-5 py-2.5 text-xs sm:text-sm rounded-2xl font-bold (dành cho POS và Modal).
  + sm: px-3.5 py-1.5 text-xs rounded-xl font-bold (dành cho nút nhỏ trong danh sách).

### B. Component StatCard
- **Màu sắc chuẩn**:
  + mint: g-[#E8F8F5] border border-[#B7EBDD] text-[#2E7D6D] (Doanh thu, Thu nhập).
  + lue: g-[#EBF5FB] border border-[#D4E6F1] text-[#2980B9] (Tour, Lượt khách).
  + purple: g-[#F5EEF8] border border-[#E8DAEF] text-[#8E44AD] (Lương KTV phát sinh).
  + coral: g-[#E58A7B] text-white shadow-lg shadow-[#E58A7B]/20 (Lợi nhuận tạm tính).
- **Tính năng con mắt che tiền**:
  + Khi isPrivacy: true: Tích hợp icon con mắt eye / eye-off ngay cạnh tiêu đề, click vào số tiền hoặc icon mắt sẽ gọi hàm onPrivacyToggle.

### C. Component StatusBadge
- ree: Nền xanh ngọc mint g-[#E8F8F5] text-[#2E7D6D] border border-[#B7EBDD] kèm chấm tròn tĩnh.
- usy: Nền cam đỏ g-[#FFF0EB] text-[#E58A7B] border border-[#FCDFD7] kèm chấm tròn nhấp nháy nimate-pulse.

---

## 4. Luồng Xử Lý Logic & Phân Tách Trách Nhiệm (Decoupling)
- **Component**: Nhận các tham số đầu vào (Props), trả về chuỗi HTML tĩnh sạch đẹp.
- **Controller (Screens)**:
  + Chịu trách nhiệm lấy dữ liệu (từ State, LocalStorage, Firebase hoặc 	b_config).
  + Quyết định gán hàm hành động nào (showView, handleCompleteCheckout...).
  + Bơm chuỗi HTML vào phần tử DOM đích qua innerHTML.

---

## 5. Ánh Xạ Cơ Sở Dữ Liệu & Config (	b_config)
- Các câu slogan chào đón (home_greeting_slogan) và châm ngôn rảnh (home_free_quote) trên 	b_config được truyền trực tiếp vào các component thông qua pplyDynamicUIConfig().
- Thông báo nội bộ (nnouncement) được truyền vào AnnouncementCard.

---

## 7. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- 2026-09-03 (0.1.5.0):
  + Thiết lập chính thức kiến trúc Hệ Thống UI Component System (Tailwind 4 Modular) theo Điều 15 PROJECT_RULES.md.
  + Tách nhỏ thành các module độc lập trong js/Core/Components/: pp_button.js, stat_card.js, status_badge.js...
  + Áp dụng Giai đoạn 1 cho màn hình Home của Staff và Admin.
