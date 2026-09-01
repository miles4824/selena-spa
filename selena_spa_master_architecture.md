# 🏛️ BẢN THIẾT KẾ KIẾN TRÚC TỔNG THỂ HỆ THỐNG SELENA SPA & WELLNESS
*Phiên bản kiến trúc chuẩn mực: Micro-Components & Single Source of Truth*

---

## 🌟 1. SƠ ĐỒ KIẾN TRÚC PHÂN TẦNG (4 TIÊU CHUẨN VẬN HÀNH)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                            🌸 SELENA SPA WEB APPLICATION (SPA)                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
                                               │
   ┌───────────────────────────────────────────┴───────────────────────────────────────────┐
   ▼                                                                                       ▼
┌─────────────────────────────────────────┐                             ┌─────────────────────────────────────────┐
│     👩‍🦰 PHÂN HỆ KỸ THUẬT VIÊN (STAFF)   │                             │        👑 PHÂN HỆ CHỦ TIỆM (OWNER)       │
│  • Home: Lời chào, KPI Tour & Tiền      │                             │  • Home: Doanh thu, Chi phí, Khách 60n  │
│  • POS: Chọn Combo, Đếm giờ, 2 Pha TT   │                             │  • History: Toàn bộ hóa đơn tiệm        │
│  • History: Thẻ Tour & Ghi chú sở thích │                             │  • Wallet: Tài chính, Quỹ lương, Lãi ròng│
└────────────────────┬────────────────────┘                             └────────────────────┬────────────────────┘
                     │                                                                       │
                     └─────────────────────────────────┬─────────────────────────────────────┘
                                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     🧩 TẦNG GIAO DIỆN COMPONENT (UI)                                    │
│  • Theme Tokens (#E58A7B, #2E7D6D)    • Base Buttons / Form Inputs / Badges                             │
│  • Combo & Add-on Pickers             • StaffHistoryCard vs OwnerReceiptCard                            │
│  • Weekly Date Strip (Khóa ngày tới)  • Month Picker Modal (Chuẩn iOS/Safari)                           │
│  • Modal Ghi Chú KTV (StaffNoteModal) • Modal Quản Lý Khách Hàng Chủ Tiệm (OwnerCustomerEditor)         │
│  • Modal Thanh Toán 2 Pha (Checkout)  • Modal Đổi KTV (SwapStaff) / Bàn Giao (Handover)                 │
└──────────────────────────────────────────────────────┬──────────────────────────────────────────────────┘
                                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 🧠 TẦNG NGHIỆP VỤ LÕI (CORE MICRO-SERVICES)                              │
│  1. 👤 Phone & CRM      : Chuẩn hóa SĐT, Che số 094*144, Ẩn/Hiện tháng sinh theo quyền                   │
│  2. 🎁 Loyalty & Voucher: Chu kỳ 60 ngày (10 tặng 1), Quản lý hạn voucher (30/60/90 ngày)                │
│  3. 🌸 Menu & Add-ons   : Combo 1-5, Dịch vụ phụ (Cổ vai gáy, Tẩy da đầu), Sản phẩm, Tự cộng dồn giờ/tiền│
│  4. ⏱️ POS & Sessions   : Đếm ngược giờ làm, Chia hoa hồng (theo phút / 50-50), Bàn giao ca             │
│  5. 💰 Payroll Engine   : Tính hoa hồng tour (10%/20%), Tiền tip 100%, Lương tháng (1 - 30)            │
│  6. 📊 Finance Engine   : Quản lý chi phí (Điện, nước, mặt bằng, dầu gội), Tính lãi ròng, Tiền mặt/VIB │
│  7. 📅 DateTime Engine  : Triệt tiêu 100% lệch 17 phút múi giờ, Chuẩn hóa ngày yyyy-MM-dd               │
│  8. 📢 Auth & Broadcast : Đăng nhập SĐT+Mật khẩu, Ghi nhớ phiên, Bắn thông báo nội bộ tức thì           │
└──────────────────────────────────────────────────────┬──────────────────────────────────────────────────┘
                                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      ⚡ TẦNG ĐỒNG BỘ ĐÁM MÂY (CLOUD)                                     │
│  • 🔥 Firebase Realtime Database (Đồng bộ tức thì 0.03 giây: Khách hàng, Ca làm, Thông báo)             │
│  • 📊 Google Sheets API (Backend Code.gs lưu trữ vĩnh viễn 8 bảng kế toán)                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📂 2. CẤU TRÚC THƯ MỤC DỰ ÁN CHI TIẾT (CLEAN ARCHITECTURE)

```text
c:\Users\Miles\Downloads\Selena\
│
├── 📁 js/
│   │
│   ├── 📁 Core/                                 <-- 🧠 TẦNG NGHIỆP VỤ & TOÁN HỌC (Không dính HTML)
│   │   ├── 📁 Theme/
│   │   │   └── theme_tokens.js                  (Bảng mã màu #E58A7B, #2E7D6D, #FAF6F1, #2D2424)
│   │   │
│   │   ├── 📁 Phone/
│   │   │   ├── phone_normalizer.js              (Chuẩn hóa SĐT 10 số: 0949251144, chặn số rác 94144)
│   │   │   ├── phone_masker.js                  (Che số bảo mật 094*144 cho KTV, hiện đủ cho Chủ tiệm)
│   │   │   └── phone_matcher.js                 (So khớp chính xác SĐT dù có đầu 0 hay 84)
│   │   │
│   │   ├── 📁 Menu/
│   │   │   ├── service_catalog.js               (Danh mục Combo 1-5, Dịch vụ phụ Add-ons, Mỹ phẩm)
│   │   │   ├── duration_calculator.js           (Cộng dồn thời lượng: 50p + 15p = 65p)
│   │   │   └── service_pricing.js               (Tính tổng tiền dịch vụ + sản phẩm)
│   │   │
│   │   ├── 📁 Payroll/
│   │   │   ├── tour_commission.js               (Tính hoa hồng tour theo hợp đồng 10% hoặc 20%)
│   │   │   ├── split_commission.js              (Chia tiền 2 KTV: tính theo số phút hoặc chia đều 50/50)
│   │   │   └── monthly_payroll.js               (Tính tổng lương tháng từ ngày 1 - 30)
│   │   │
│   │   ├── 📁 Loyalty/
│   │   │   ├── cycle_tracker.js                 (Đếm chu kỳ 60 ngày & tích lũy 10 lần tặng 1)
│   │   │   └── voucher_engine.js                (Kiểm tra hạn dùng, trừ voucher khi dùng)
│   │   │
│   │   ├── 📁 DateTime/
│   │   │   ├── time_cleaner.js                  (Định dạng giờ phút sạch, triệt tiêu 100% lệch 17 phút)
│   │   │   └── date_helper.js                   (Khóa bấm an toàn cho các ngày chưa tới)
│   │   │
│   │   └── 📁 Finance/
│   │       └── profit_calculator.js             (Lợi nhuận ròng = Doanh thu - Quỹ lương - Chi phí)
│   │
│   ├── 📁 Components/                           <-- 🧩 TẦNG GIAO DIỆN COMPONENT (Mỗi cái 1 file)
│   │   ├── 📁 UI/
│   │   │   ├── buttons.js                       (Nút hồng cam #E58A7B, nút xanh #2E7D6D, nút tròn icon)
│   │   │   ├── form_inputs.js                   (Ô nhập chữ, ô nhập SĐT, ô nhập tiền tệ, dropdown)
│   │   │   └── badges.js                        (Nhãn thanh toán [QR / Tiền mặt], nhãn số phút ca gội)
│   │   │
│   │   ├── 📁 POS/
│   │   │   ├── combo_picker.js                  (Cụm chọn Gói Combo Chính: [Combo 1] [Combo 2]...)
│   │   │   ├── addon_service_picker.js          (Cụm chọn Dịch Vụ Thêm: [+ Cổ Vai Gáy] [+ Đắp Mặt Nạ]...)
│   │   │   ├── retail_product_picker.js         (Cụm chọn Sản Phẩm: [Dầu Gội Bưởi] [Serum]...)
│   │   │   ├── customer_picker.js               (Cụm tra cứu & chọn Khách Hàng)
│   │   │   ├── staff_picker.js                  (Cụm chọn KTV làm ca & KTV phụ)
│   │   │   └── live_timer.js                    (Cụm đồng hồ đếm ngược thời gian tour)
│   │   │
│   │   ├── 📁 Cards/
│   │   │   ├── staff_history_card.js            (Vẽ thẻ tour KTV: tiền tour, tip, KTV cùng làm)
│   │   │   ├── owner_receipt_card.js            (Vẽ thẻ hóa đơn Chủ tiệm: doanh thu, tất cả KTV)
│   │   │   ├── customer_profile_card.js         (Vẽ thẻ hồ sơ khách: chu kỳ 60 ngày, ví voucher)
│   │   │   └── weekly_date_strip.js             (Vẽ thanh trượt lịch 7 ngày trong tuần)
│   │   │
│   │   └── 📁 Modals/
│   │       ├── modal_staff_note.js              (Modal KTV: Ghi chú sở thích, ẩn ô chọn tháng nếu đã có)
│   │       ├── modal_owner_customer.js          (Modal Chủ tiệm: Toàn quyền sửa tên, SĐT, tháng sinh)
│   │       ├── modal_checkout.js                (Modal thanh toán 2 pha: QR khách xem -> KTV nhập tip)
│   │       ├── modal_swap_staff.js              (Modal đổi/thêm KTV giữa ca)
│   │       ├── modal_handover.js                (Modal bàn giao ca gội)
│   │       ├── modal_gift_voucher.js            (Modal chủ tiệm tặng voucher)
│   │       ├── modal_add_expense.js             (Modal nhập chi phí tiệm)
│   │       ├── modal_announcement.js            (Modal phát thông báo nội bộ)
│   │       └── modal_month_picker.js            (Modal chọn lịch tháng)
│   │
│   ├── 📁 Screens/                              <-- 📱 TẦNG MÀN HÌNH ỨNG DỤNG (Lắp ráp các Component)
│   │   ├── 📁 Staff/
│   │   │   ├── staff_home_screen.js             (Home KTV: Lời chào, Thông báo, Tour & Tiền hôm nay)
│   │   │   ├── staff_history_screen.js          (Lịch sử tour KTV đã làm)
│   │   │   └── staff_wallet_screen.js           (Thu nhập tháng của KTV)
│   │   ├── 📁 Owner/
│   │   │   ├── owner_home_screen.js             (Home Chủ tiệm: KPI doanh thu, Danh bạ khách 60 ngày)
│   │   │   ├── owner_history_screen.js          (Lịch sử hóa đơn toàn tiệm)
│   │   │   └── owner_wallet_screen.js           (Tài chính tiệm, Quỹ lương, Quản lý chi phí)
│   │   ├── 📁 POS/
│   │   │   └── pos_screen.js                    (Tạo tour, chọn combo, chọn KTV, đồng hồ đếm giờ)
│   │   └── 📁 Auth/
│   │       └── login_screen.js                  (Màn hình đăng nhập, phân quyền, ghi nhớ phiên)
│   │
│   ├── 📁 Cloud/                                <-- ⚡ TẦNG ĐỒNG BỘ ĐÁM MÂY
│   │   ├── firebase_engine.js                   (Firebase Realtime 0.03s: Khách, Hóa đơn, Thông báo)
│   │   └── gas_client.js                        (Gửi API về Google Apps Script)
│   │
│   ├── config.js                                (Cấu hình chung, phiên bản app, API endpoint)
│   └── app.js                                   (Bộ khởi động app & điều hướng chuyển trang)
│
├── 📁 views/                                    <-- 📄 CÁC FILE TEMPLATE HTML GIAO DIỆN
│   ├── 📁 staff/                                (home.html, history.html, wallet.html)
│   ├── 📁 owner/                                (home.html, history.html, wallet.html)
│   ├── 📁 components/                           (modals.html, bottom_nav.html, pull_to_refresh.html)
│   ├── add.html                                 (Màn hình POS tạo tour)
│   └── login.html                               (Màn hình Đăng nhập)
│
└── 📁 google_apps_script/
    └── Code.gs                                  (Backend Google Sheets xử lý 8 bảng dữ liệu)
```

---

## 📋 3. BẢNG TRA CỨU NHANH KHI CẦN SỬA ĐỔI (DÀNH CHO ANH)

| Nhu Cầu Chỉnh Sửa Trong Tương Lai | Mở Đúng File Này (Chỉ Mất 3 Giây) |
| :--- | :--- |
| **1. Đổi màu thương hiệu tiệm** | `js/Core/Theme/theme_tokens.js` |
| **2. Sửa công thức tính lương / hoa hồng tour** | `js/Core/Payroll/tour_commission.js` |
| **3. Sửa quy tắc tính lương tháng (1 - 30)** | `js/Core/Payroll/monthly_payroll.js` |
| **4. Sửa danh mục Combo, Add-on, Mỹ phẩm** | `js/Core/Menu/service_catalog.js` |
| **5. Sửa quy tắc che số điện thoại / tháng sinh** | `js/Core/Phone/phone_masker.js` |
| **6. Sửa chu kỳ tích điểm 60 ngày & Voucher** | `js/Core/Loyalty/cycle_tracker.js` |
| **7. Chỉnh sửa giao diện thẻ tour của KTV** | `js/Components/Cards/staff_history_card.js` |
| **8. Chỉnh sửa modal quản trị của Chủ tiệm** | `js/Components/Modals/modal_owner_customer.js` |
| **9. Chỉnh sửa modal thanh toán 2 pha** | `js/Components/Modals/modal_checkout.js` |
