# 🏛️ BẢN THIẾT KẾ KIẾN TRÚC TỔNG THỂ HỆ THỐNG SELENA SPA & WELLNESS
*Tài liệu kiến trúc chính thức - Phiên bản gốc: v0.0.0.1*

---

## ⭐️ 0. NGUYÊN TẮC BẮT BUỘC TRƯỚC VÀ SAU KHI CODE (SOP TOÀN DỰ ÁN)

### 1. Luôn Đọc Kiến Trúc Dự Án & Database Trước Khi Bắt Đầu:
- Trước khi thực hiện bất kỳ yêu cầu, sửa lỗi hay nâng cấp tính năng nào, **BẮT BUỘC phải đọc kỹ 3 tài liệu**:
  1. [`PROJECT_RULES.md`](PROJECT_RULES.md) (Bộ quy tắc vận hành & bảo mật).
  2. [`selena_spa_master_architecture.md`](selena_spa_master_architecture.md) (Bản thiết kế cấu trúc 1-1 HTML và JS).
  3. [`selena_spa_database_architecture.md`](selena_spa_database_architecture.md) (Bản hướng dẫn kiến trúc 9 bảng Google Sheets & luồng dữ liệu).

### 2. Tạo Tính Năng Mới Phải Tuân Thủ Tuyệt Đối Kiến Trúc Chuẩn:
- Khi tạo bất kỳ tính năng hoặc màn hình mới nào, **luôn dựa trên kiến trúc chuẩn để tạo ra module mới tương tự** nhằm đảm bảo tính đồng bộ 100%:
  - **Khung HTML tĩnh**: Tạo file riêng độc lập trong `views/`.
  - **Component xử lý giao diện JS**: Tạo file riêng độc lập trong `js/Components/` hoặc `js/Screens/`.
  - **Nghiệp vụ tính toán & Toán học lõi**: Tạo file riêng độc lập trong `js/Core/`.

### 3. Luôn Cập Nhật Lại Kiến Trúc, Database & Backend Code.gs Sau Khi Hoàn Thành:
- Sau khi hoàn thành bất kỳ tính năng mới hoặc thay đổi cấu trúc nào:
  - Nếu có thay đổi cấu trúc file/module: **Cập nhật lại `selena_spa_master_architecture.md` và `PROJECT_RULES.md`**.
  - Nếu có thay đổi Database (thêm bớt bảng, thêm bớt cột, đổi tên cột trên Google Sheets):
    1. **BẮT BUỘC cập nhật đồng thời file `google_apps_script/Code.gs`** để bổ sung hàm đọc/ghi tương ứng và tạo Bản Triển Khai Mới (New Deployment) trên Apps Script.
    2. **BẮT BUỘC cập nhật lại tài liệu `selena_spa_database_architecture.md` ngay lập tức** để lưu trữ nhật ký cột mới dùng ở đâu, hàm nào phụ trách.

---

## 🌟 1. SƠ ĐỒ CẤU TRÚC ĐỒNG BỘ 1-1 (HTML VIEWS & JAVASCRIPT COMPONENTS)

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              🌸 CẤU TRÚC ĐỒNG BỘ 1-1 (HTML & JAVASCRIPT)                        │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                📄 KHUNG GIAO DIỆN HTML (views/)       <==== 1-1 ====>       🧠 MÃ XỬ LÝ JAVASCRIPT (js/)
                ──────────────────────────────                              ────────────────────────────
• Modals:       views/components/modals/modal_staff_note.html        <--->  js/Components/Modals/modal_staff_note.js
                views/components/modals/modal_owner_customer.html    <--->  js/Components/Modals/modal_owner_customer.js
                views/components/modals/modal_checkout.html          <--->  js/Components/Modals/modal_checkout.js
                views/components/modals/modal_swap_staff.html        <--->  js/Components/Modals/modal_swap_staff.js
                views/components/modals/modal_handover.html          <--->  js/Components/Modals/modal_handover.js
                views/components/modals/modal_gift_voucher.html      <--->  js/Components/Modals/modal_gift_voucher.js
                views/components/modals/modal_add_expense.html       <--->  js/Components/Modals/modal_add_expense.js
                views/components/modals/modal_announcement.html      <--->  js/Components/Modals/modal_announcement.js
                views/components/modals/modal_month_picker.html      <--->  js/Components/Modals/modal_month_picker.js

• POS Tạo Tour: views/components/pos/combo_section.html              <--->  js/Components/POS/combo_picker.js
                views/components/pos/customer_section.html           <--->  js/Components/POS/customer_picker.js
                views/components/pos/staff_section.html              <--->  js/Components/POS/staff_picker.js
                views/components/pos/timer_section.html              <--->  js/Components/POS/live_timer.js

• Màn Hình KTV: views/staff/home.html                                <--->  js/Screens/Staff/staff_home_screen.js
                views/staff/history.html                             <--->  js/Screens/Staff/staff_history_screen.js
                views/staff/wallet.html                              <--->  js/Screens/Staff/staff_wallet_screen.js

• Màn Hình Chủ: views/owner/home.html                                <--->  js/Screens/Owner/owner_home_screen.js
                views/owner/history.html                             <--->  js/Screens/Owner/owner_history_screen.js
                views/owner/wallet.html                              <--->  js/Screens/Owner/owner_wallet_screen.js

• Đăng Nhập:    views/login.html                                     <--->  js/Screens/Auth/login_screen.js
```

---

## 📂 2. CÂY THƯ MỤC DỰ ÁN CHI TIẾT TOÀN DIỆN

```text
c:\Users\Miles\Downloads\Selena\
│
├── 📄 index.html                                (Trang chủ nạp toàn bộ component & SPA router)
├── 📄 PROJECT_RULES.md                          (Bảng 11 quy tắc vàng vận hành & phát triển)
├── 📄 selena_spa_master_architecture.md         (Bản thiết kế kiến trúc toàn diện)
│
├── 📁 views/                                    <-- 📄 TẦNG 1: KHUNG HTML MẪU (MODULAR VIEWS)
│   │
│   ├── 📁 components/                           (Các khung thành phần nhỏ)
│   │   ├── 📁 modals/                           (Mỗi Modal là 1 file HTML riêng biệt)
│   │   │   ├── modal_staff_note.html            (Khung KTV ghi chú sở thích & ẩn tháng sinh)
│   │   │   ├── modal_owner_customer.html        (Khung Chủ tiệm quản trị hồ sơ khách toàn quyền)
│   │   │   ├── modal_checkout.html              (Khung Thanh toán 2 pha: QR khách xem -> Tip KTV)
│   │   │   ├── modal_swap_staff.html            (Khung Đổi / thêm KTV giữa ca)
│   │   │   ├── modal_handover.html              (Khung Bàn giao ca gội)
│   │   │   ├── modal_gift_voucher.html          (Khung Chủ tiệm tặng voucher)
│   │   │   ├── modal_add_expense.html           (Khung Nhập chi phí tiệm)
│   │   │   ├── modal_announcement.html          (Khung Phát thông báo nội bộ)
│   │   │   └── modal_month_picker.html          (Khung Lịch chọn tháng)
│   │   │
│   │   ├── 📁 pos/                              (Các khối trên màn hình tạo tour)
│   │   │   ├── combo_section.html               (Khung chọn Combo chính & Dịch vụ làm thêm)
│   │   │   ├── customer_section.html            (Khung chọn & tra cứu Khách hàng)
│   │   │   ├── staff_section.html               (Khung chọn KTV làm ca)
│   │   │   └── timer_section.html               (Khung đồng hồ đếm ngược)
│   │   │
│   │   ├── bottom_nav.html                      (Khung menu đáy 3 tab)
│   │   └── pull_to_refresh.html                 (Khung hiệu ứng kéo làm mới)
│   │
│   ├── 📁 staff/                                (Khung màn hình Kỹ Thuật Viên)
│   │   ├── home.html                            (Khung Home KTV: Lời chào, Tour & tiền hôm nay)
│   │   ├── history.html                         (Khung Lịch sử tour KTV)
│   │   └── wallet.html                          (Khung Thu nhập tháng KTV)
│   │
│   ├── 📁 owner/                                (Khung màn hình Chủ Tiệm)
│   │   ├── home.html                            (Khung Home Chủ tiệm: Doanh thu, Danh bạ khách 60n)
│   │   ├── history.html                         (Khung Lịch sử hóa đơn toàn tiệm)
│   │   └── wallet.html                          (Khung Tài chính tiệm, Quỹ lương, Chi phí)
│   │
│   ├── add.html                                 (Khung màn hình POS tổng)
│   └── login.html                               (Khung màn hình Đăng nhập)
│
│
├── 📁 js/                                       <-- 🧠 TẦNG 2: MÃ JAVASCRIPT XỬ LÝ (MODULAR JS)
│   │
│   ├── 📁 Core/                                 <-- ⚙️ Nghiệp Vụ & Toán Học Lõi (Không dính HTML)
│   │   ├── 📁 Theme/
│   │   │   └── theme_tokens.js                  (Bảng mã màu #E58A7B, #2E7D6D, #FAF6F1, #2D2424)
│   │   ├── 📁 Menu/
│   │   │   ├── service_catalog.js               (Danh mục Combo 1-5, Dịch vụ phụ Add-ons, Mỹ phẩm)
│   │   │   ├── duration_calculator.js           (Cộng dồn thời lượng: 50p + 15p = 65p)
│   │   │   └── service_pricing.js               (Tính tổng tiền dịch vụ + sản phẩm)
│   │   ├── 📁 Phone/
│   │   │   ├── phone_normalizer.js              (Chuẩn hóa SĐT 10 số: 0949251144, chặn số rác 94144)
│   │   │   ├── phone_masker.js                  (Che số 094*144 cho KTV, hiện đủ cho Chủ tiệm)
│   │   │   └── phone_matcher.js                 (So khớp chính xác SĐT dù có đầu 0 hay 84)
│   │   ├── 📁 Payroll/
│   │   │   ├── tour_commission.js               (Tính hoa hồng tour theo hợp đồng 10% hoặc 20%)
│   │   │   ├── split_commission.js              (Chia tiền 2 KTV: theo số phút hoặc chia đều 50/50)
│   │   │   └── monthly_payroll.js               (Tính tổng lương tháng từ ngày 1 - 30)
│   │   ├── 📁 Loyalty/
│   │   │   ├── cycle_tracker.js                 (Đếm chu kỳ 60 ngày & tích lũy 10 lần tặng 1)
│   │   │   └── voucher_engine.js                (Kiểm tra hạn dùng, trừ voucher khi dùng)
│   │   ├── 📁 DateTime/
│   │   │   ├── time_cleaner.js                  (Định dạng giờ phút sạch, triệt tiêu 100% lệch 17 phút)
│   │   │   └── date_helper.js                   (Khóa bấm an toàn cho các ngày chưa tới)
│   │   └── 📁 Finance/
│   │       └── profit_calculator.js             (Lợi nhuận ròng = Doanh thu - Quỹ lương - Chi phí)
│   │
│   ├── 📁 Components/                           <-- 🧩 Xử Lý Từng Khung Giao Diện & Modal Cụ Thể
│   │   ├── 📁 UI/
│   │   │   ├── buttons.js                       (Nút chính hồng cam, nút xanh, nút tròn icon)
│   │   │   ├── form_inputs.js                   (Ô nhập chữ, ô nhập SĐT, ô nhập tiền tệ)
│   │   │   └── badges.js                        (Nhãn thanh toán [QR / Tiền mặt], nhãn số phút ca gội)
│   │   ├── 📁 POS/
│   │   │   ├── combo_picker.js                  (Chọn combo chính)
│   │   │   ├── addon_service_picker.js          (Chọn dịch vụ làm thêm)
│   │   │   ├── retail_product_picker.js         (Chọn sản phẩm bán kèm)
│   │   │   ├── customer_picker.js               (Tra cứu & chọn khách hàng)
│   │   │   ├── staff_picker.js                  (Chọn KTV & KTV phụ)
│   │   │   └── live_timer.js                    (Đồng hồ đếm ngược ca gội)
│   │   ├── 📁 Cards/
│   │   │   ├── staff_history_card.js            (Render thẻ tour KTV: tiền tour, tip, bạn cùng làm)
│   │   │   ├── owner_receipt_card.js            (Render thẻ hóa đơn Chủ tiệm: doanh thu, tất cả KTV)
│   │   │   ├── customer_profile_card.js         (Render thẻ khách hàng: chu kỳ 60 ngày, ví voucher)
│   │   │   └── weekly_date_strip.js             (Render thanh trượt lịch 7 ngày trong tuần)
│   │   └── 📁 Modals/
│   │       ├── modal_staff_note.js              (Controller Modal KTV: Ghi chú sở thích, ẩn tháng sinh)
│   │       ├── modal_owner_customer.js          (Controller Modal Chủ tiệm: Sửa tên, SĐT, tháng sinh)
│   │       ├── modal_checkout.js                (Controller Modal Thanh toán 2 pha kín đáo)
│   │       ├── modal_swap_staff.js              (Controller Modal Đổi/thêm KTV giữa ca)
│   │       ├── modal_handover.js                (Controller Modal Bàn giao ca gội)
│   │       ├── modal_gift_voucher.js            (Controller Modal Tặng voucher)
│   │       ├── modal_add_expense.js             (Controller Modal Nhập chi phí tiệm)
│   │       ├── modal_announcement.js            (Controller Modal Phát thông báo nội bộ)
│   │       └── modal_month_picker.js            (Controller Modal Chọn lịch tháng)
│   │
│   ├── 📁 Screens/                              <-- 📱 Điều Khiển Chuyển Đổi Màn Hình
│   │   ├── 📁 Staff/
│   │   │   ├── staff_home_screen.js             (Home KTV: Lời chào, Thông báo, Tour & Tiền hôm nay)
│   │   │   ├── staff_history_screen.js          (Lịch sử tour KTV)
│   │   │   └── staff_wallet_screen.js           (Thu nhập tháng KTV)
│   │   ├── 📁 Owner/
│   │   │   ├── owner_home_screen.js             (Home Chủ: Doanh thu, Danh bạ khách 60n)
│   │   │   ├── owner_history_screen.js          (Lịch sử hóa đơn toàn tiệm)
│   │   │   └── owner_wallet_screen.js           (Tài chính tiệm, Quỹ lương, Chi phí)
│   │   ├── 📁 POS/
│   │   │   └── pos_screen.js                    (POS tạo ca & đồng hồ)
│   │   └── 📁 Auth/
│   │       └── login_screen.js                  (Màn hình đăng nhập & ghi nhớ phiên)
│   │
│   ├── 📁 Cloud/                                <-- ⚡ Đồng Bộ Đám Mây 2 Chiều
│   │   ├── firebase_engine.js                   (Kết nối Firebase Realtime Database 0.03s)
│   │   └── gas_client.js                        (Kết nối Google Apps Script)
│   │
│   ├── config.js                                (Cấu hình chung, phiên bản app: v0.0.0.1, API)
│   └── app.js                                   (Bộ nạp Template tự động & điều hướng chuyển tab)
│
├── 📁 images/
│   └── qr_bank.jpg                              (Ảnh mã QR ngân hàng VIB chính thức)
│
└── 📁 google_apps_script/
    └── Code.gs                                  (Backend xử lý 8 bảng dữ liệu trên Google Sheets)
```

---

## 📋 3. BẢNG TRA CỨU NHANH KHI CẦN SỬA ĐỔI (CHỈ MẤT 3 GIÂY)

| Nhu Cầu Chỉnh Sửa Trong Tương Lai | Mở Đúng File Này |
| :--- | :--- |
| **1. Đổi màu nhận diện thương hiệu** | `js/Core/Theme/theme_tokens.js` |
| **2. Sửa công thức tính hoa hồng tour (10%/20%)** | `js/Core/Payroll/tour_commission.js` |
| **3. Sửa quy tắc tính lương tháng (1 - 30)** | `js/Core/Payroll/monthly_payroll.js` |
| **4. Sửa danh mục Combo, Dịch vụ phụ, Mỹ phẩm** | `js/Core/Menu/service_catalog.js` |
| **5. Sửa quy tắc che số điện thoại / tháng sinh** | `js/Core/Phone/phone_masker.js` |
| **6. Sửa chu kỳ tích điểm 60 ngày & Voucher** | `js/Core/Loyalty/cycle_tracker.js` |
| **7. Sửa giao diện & logic thẻ tour KTV** | `views/staff/history.html` & `js/Components/Cards/staff_history_card.js` |
| **8. Sửa giao diện & logic thẻ hóa đơn Chủ tiệm** | `views/owner/history.html` & `js/Components/Cards/owner_receipt_card.js` |
| **9. Sửa giao diện & logic Modal KTV ghi chú** | `views/components/modals/modal_staff_note.html` & `js/Components/Modals/modal_staff_note.js` |
| **10. Sửa giao diện & logic Modal Chủ quản trị khách** | `views/components/modals/modal_owner_customer.html` & `js/Components/Modals/modal_owner_customer.js` |
| **11. Sửa giao diện & logic Modal Thanh toán 2 pha** | `views/components/modals/modal_checkout.html` & `js/Components/Modals/modal_checkout.js` |
