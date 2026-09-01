# 🗄️ BẢN HƯỚNG DẪN KIẾN TRÚC CƠ SỞ DỮ LIỆU SELENA SPA & WELLNESS
*Tài Liệu Chuẩn Hóa 9 Bảng Dữ Liệu Google Sheets, Luồng Đồng Bộ Đám Mây & Liên Kết Frontend JS*

---

## 🌟 1. SƠ ĐỒ TỔNG THỂ LUỒNG DỮ LIỆU (DATA FLOW ARCHITECTURE)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           📱 1. TẦNG GIAO DIỆN NGƯỜI DÙNG (FRONTEND SPA)                    │
│   • Màn hình POS Tạo Tour     • Timeline Lịch Sử Tour KTV     • Thống Kê Doanh Thu Chủ Tiệm │
│   • Danh Bạ Khách 60 Ngày     • Ví Hoa Hồng / Lương KTV       • Sổ Thu Chi & Lợi Nhuận Ròng │
└──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                               │
               ┌───────────────────────────────┴───────────────────────────────┐
               ▼ (Đồng bộ siêu tốc 0.03 giây)                                  ▼ (Lưu trữ vĩnh viễn)
┌──────────────────────────────────────────────┐                ┌──────────────────────────────────────────────┐
│     🔥 2. FIREBASE REALTIME DATABASE         │                │        📊 3. GOOGLE SHEETS API (GAS)         │
│  • Cập nhật tức thì ca đang gội              │                │  • Backend `Code.gs` xử lý 9 bảng kế toán    │
│  • Bàn giao tour & Đổi KTV sang máy khác     │                │  • Đồng bộ 2 chiều dữ liệu hóa đơn, lương    │
│  • Bắn thông báo nội bộ lên đầu màn hình     │                │  • Tự động sao lưu lịch sử không lo mất      │
└──────────────────────────────────────────────┘                └──────────────────────┬───────────────────────┘
                                                                                       │
 ┌─────────────────────────────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────┐
 │                                           📋 HỆ THỐNG 9 BẢNG DỮ LIỆU TRÊN GOOGLE SHEETS                                                   │
 ├─────────────────────────┬─────────────────────────┬─────────────────────────┬─────────────────────────┬───────────────────────────────────┤
 │ 🧾 1. tb_receipts       │ 👥 2. tb_customers      │ 💰 3. tb_payroll_logs   │ 🎯 4. tb_loyalty_cycles │ 🎁 5. tb_vouchers                 │
 │ (16 cột: Hóa đơn tiệm)  │ (8 cột: Hồ sơ khách)    │ (19 cột: Lương từng KTV)│ (8 cột: Chu kỳ 60 ngày) │ (9 cột: Kho voucher ưu đãi)       │
 ├─────────────────────────┼─────────────────────────┼─────────────────────────┼─────────────────────────┼───────────────────────────────────┤
 │ 💸 6. tb_expenses       │ 👩‍🦰 7. tb_users        │ 🌸 8. tb_menu           │ 📢 9. tb_config         │ 💾 LocalStorage (Offline Cache)   │
 │ (7 cột: Chi phí tiệm)   │ (8 cột: Phân quyền KTV) │ (6 cột: Bảng giá Combo) │ (2 cột: Key-Value Cấu hình) • Lưu tạm trên máy mở app 0.001s│
 └─────────────────────────┴─────────────────────────┴─────────────────────────┴─────────────────────────┴───────────────────────────────────┘
```

---

## 📋 2. CHI TIẾT 9 BẢNG DỮ LIỆU & ĐƯỜNG DẪN MÃ NGUỒN XỬ LÝ

---

### 🧾 BẢNG 1: `tb_receipts` (Quản Lý Hóa Đơn & Doanh Thu Toàn Tiệm)
*Mục đích: Lưu trữ toàn bộ các ca gội đầu và dịch vụ đã hoàn thành tại tiệm.*

| Cột | Tên Cột Trên Sheet | Kiểu Dữ Liệu | Ví Dụ Mẫu | Nơi Frontend Đọc / Ghi | Hàm Backend GAS |
| :---: | :--- | :---: | :--- | :--- | :--- |
| **A** | `receipt_id` | Chuỗi | `HD260901143000` | `js/Add/pos_checkout.js` sinh tự động | `createReceipt` |
| **B** | `date` | Ngày | `2026-09-01` | Lọc theo ngày tại `js/History/shop_receipts.js` | `createReceipt` |
| **C** | `start_time` | Giờ:Phút | `14:30` | `js/Core/DateTime/time_cleaner.js` (khử lệch 17p)| `createReceipt` |
| **D** | `end_time` | Giờ:Phút | `15:20` | `js/Components/POS/live_timer.js` lúc hoàn tất | `createReceipt` |
| **E** | `duration_min` | Số phút | `50` | `js/Core/Menu/duration_calculator.js` | `createReceipt` |
| **F** | `customer_phone` | SĐT | `0949251144` | KTV che `094*144`, Chủ thấy đủ tại `phone_masker.js` | `createReceipt` |
| **G** | `customer_name` | Chuỗi | `Chị Mai Lan` | `js/Components/Cards/owner_receipt_card.js` | `createReceipt` |
| **H** | `service_id` | Mã | `CB01` | `js/Core/Menu/service_catalog.js` | `createReceipt` |
| **I** | `service_name` | Chuỗi | `Combo 1 (Gội Dưỡng Sinh)`| `js/Components/POS/combo_picker.js` | `createReceipt` |
| **J** | `price` | Số tiền | `64000` | Giá niêm yết combo để tính hoa hồng | `createReceipt` |
| **K** | `tip_amount` | Số tiền | `20000` | Ghi nhận từ Pha 2 thanh toán kín đáo của KTV | `createReceipt` |
| **L** | `total_paid` | Số tiền | `84000` | Bằng `price + tip_amount`, hiển thị cho Chủ | `createReceipt` |
| **M** | `staff_names` | Chuỗi | `Thu Ngân, Mai Lan` | Ghép tên tất cả KTV cùng phục vụ tour | `createReceipt` |
| **N** | `payment_method` | Enum | `Tiền mặt` / `Chuyển khoản`| `js/Components/UI/badges.js` phân loại két vs VIB| `createReceipt` |
| **O** | `is_voucher_used` | Boolean | `TRUE` / `FALSE` | Đánh dấu ca miễn phí (KTV vẫn nhận đủ 10% hoa hồng)| `createReceipt` |
| **P** | `created_at` | Dấu TG | `2026/09/01 - 14:30` | Dấu thời gian hệ thống lưu trữ đối soát | `createReceipt` |

---

### 👥 BẢNG 2: `tb_customers` (Hồ Sơ Khách Hàng, Sinh Nhật & Chu Kỳ 60 Ngày)
*Mục đích: Quản lý khách quen, đếm số lần gội trong chu kỳ 60 ngày để tặng voucher 100% và chúc mừng sinh nhật.*

| Cột | Tên Cột Trên Sheet | Kiểu Dữ Liệu | Ví Dụ Mẫu | Nơi Frontend Đọc / Ghi | Hàm Backend GAS |
| :---: | :--- | :---: | :--- | :--- | :--- |
| **A** | `phone_number` | SĐT 10 số | `0949251144` | Khóa chính chuẩn hóa qua `phone_normalizer.js` | `checkCustomer` |
| **B** | `customer_name` | Chuỗi | `Chị Mai Lan` | `js/Components/Modals/modal_owner_customer.js` | `updateCustomerNotes` |
| **C** | `birthday` / `birth_month`| Số / Ngày | `4` (hoặc `1995-04-12`)| KTV chỉ thấy nếu chưa có, đã có thì ẩn tại `modal_staff_note.js` | `updateCustomerNotes` |
| **D** | `cycle_start_date` | Ngày | `2026-08-01` | Mốc bắt đầu tính chu kỳ 60 ngày | `createReceipt` |
| **E** | `cycle_visits` | Số nguyên | `8` | Đếm từ 1 đến 10 ca trong 60 ngày qua `cycle_tracker.js` | `createReceipt` |
| **F** | `total_visits` | Số nguyên | `25` | Tổng số lần ghé từ trước đến nay | `createReceipt` |
| **G** | `voucher_count` | Số nguyên | `1` | Số lượng voucher miễn phí khách đang có | `giftVoucher` / `createReceipt` |
| **H** | `notes` | Văn bản | `Thích nước ấm, sấy mát` | KTV & Chủ lưu sở thích qua `modal_staff_note.js` | `updateCustomerNotes` |

---

### 💰 BẢNG 3: `tb_payroll_logs` (Sổ Nhật Ký Lương & Hoa Hồng Chi Tiết Từng KTV)
*Mục đích: Tách nhỏ từng tour ra thành từng dòng riêng cho mỗi KTV để tính lương tháng từ ngày 1 - 30 chuẩn xác 100%.*

| Cột | Tên Cột Trên Sheet | Kiểu Dữ Liệu | Ví Dụ Mẫu | Nơi Frontend Đọc / Ghi | Hàm Backend GAS |
| :---: | :--- | :---: | :--- | :--- | :--- |
| **A** | `log_id` | Chuỗi | `LOG260901143000_1` | Khóa chính từng phần chia hoa hồng | `createReceipt` |
| **B** | `receipt_id` | Chuỗi | `HD260901143000` | Khóa ngoại nối với `tb_receipts` | `createReceipt` |
| **C** | `date` | Ngày | `2026-09-01` | Lọc theo ngày / tháng tại `staff_wallet_screen.js`| `createReceipt` |
| **D-E** | `start_time` / `end_time`| Giờ:Phút | `14:30` - `15:20` | Hiển thị giờ làm ca | `createReceipt` |
| **F** | `duration_min` | Số phút | `50` | Thời lượng thực tế KTV này phục vụ | `createReceipt` |
| **G-I** | `customer_name`, `service_name`, `price` | Chuỗi & Số | `Chị Mai Lan`, `CB 1`, `64k` | Thông tin dịch vụ của ca | `createReceipt` |
| **J** | `staff_phone` | SĐT | `0912345678` | **Khóa quan trọng nhất: Lọc đúng tour của KTV đó đăng nhập** | `createReceipt` |
| **K-L** | `staff_id`, `staff_name` | Chuỗi | `KTV01`, `Nguyễn Thị Huệ`| Hiển thị tên KTV nhận tiền | `createReceipt` |
| **M** | `role_in_tour` | Enum | `Chính` / `Phụ` | Vai trò trong tour | `createReceipt` |
| **N** | `commission_pct` | Tỉ lệ % | `10%` hoặc `20%` | Hợp đồng lương tại `tour_commission.js` | `createReceipt` |
| **O** | `commission_amount`| Số tiền | `6400` | Tiền tour KTV nhận được (cộng vào ví KTV) | `createReceipt` |
| **P** | `tip_amount` | Số tiền | `20000` | Tiền tip khách cho riêng KTV này | `createReceipt` |
| **Q** | `total_earned` | Số tiền | `26400` | Bằng `commission_amount + tip_amount` | `createReceipt` |
| **R** | `payment_method` | Enum | `Tiền mặt` / `Chuyển khoản`| Phân loại tiền mặt cầm tay hay nhận cuối tháng | `createReceipt` |

---

### 🎯 BẢNG 4 & 5: `tb_loyalty_cycles` & `tb_vouchers` (Chu Kỳ Khách Hàng & Kho Ưu Đãi)

#### `tb_loyalty_cycles` (8 Cột):
- **Cột A - H**: `cycle_id`, `customer_phone`, `customer_name`, `start_date`, `end_date` (60 ngày), `visits_count` (1-10), `status` (`ACTIVE` / `COMPLETED` / `EXPIRED`), `reward_voucher_id`.
- **Frontend xử lý**: [`js/Core/Loyalty/cycle_tracker.js`](file:///c:/Users/Miles/Downloads/Selena/js/Core/Loyalty/cycle_tracker.js).

#### `tb_vouchers` (9 Cột):
- **Cột A - I**: `voucher_id` (`VC...`), `customer_phone`, `customer_name`, `voucher_type` (`100% miễn phí` / `Giảm 20% sinh nhật`), `discount_value`, `expiry_date` (30/60/90 ngày), `status` (`Chưa dùng` / `Đã dùng`), `used_receipt_id`, `notes`.
- **Frontend xử lý**: [`js/Core/Loyalty/voucher_engine.js`](file:///c:/Users/Miles/Downloads/Selena/js/Core/Loyalty/voucher_engine.js) & [`js/Components/Modals/modal_gift_voucher.js`](file:///c:/Users/Miles/Downloads/Selena/js/Components/Modals/modal_gift_voucher.js).

---

### 💸 BẢNG 6: `tb_expenses` (Sổ Ghi Nhận Chi Phí Tiệm)
*Mục đích: Ghi nhận tiền điện, nước, mặt bằng, dầu gội mỹ phẩm để tính Lợi Nhuận Ròng.*

| Cột | Tên Cột Trên Sheet | Kiểu Dữ Liệu | Ví Dụ Mẫu | Nơi Frontend Đọc / Ghi | Hàm Backend GAS |
| :---: | :--- | :---: | :--- | :--- | :--- |
| **A** | `expense_id` | Chuỗi | `EXP260901150000` | Sinh tự động khi Chủ tiệm nhập chi phí | `addExpense` |
| **B** | `date` | Ngày | `2026-09-01` | Lọc chi phí theo tháng | `addExpense` |
| **C** | `expense_type` | Phân loại | `Điện sấy & máy lạnh`, `Tiền nước`, `Mặt bằng`, `Mỹ phẩm` | `js/Components/Modals/modal_add_expense.js` | `addExpense` |
| **D** | `amount` | Số tiền | `350000` | Số tiền chi ra | `addExpense` |
| **E** | `note` | Chuỗi | `Đóng tiền điện tháng 8` | Ghi chú chi tiết | `addExpense` |
| **F** | `payer` | Chuỗi | `Miles (Chủ tiệm)` | Người chi tiền | `addExpense` |
| **G** | `created_at` | Dấu TG | `2026/09/01 - 15:00` | Dấu thời gian hệ thống lưu trữ | `addExpense` |

---

### 👩‍🦰 BẢNG 7: `tb_users` (Danh Sách Nhân Sự & Cấu Hình Hợp Đồng Lương)

| Cột | Tên Cột Trên Sheet | Kiểu Dữ Liệu | Ví Dụ Mẫu | Nơi Frontend Đọc / Ghi | Hàm Backend GAS |
| :---: | :--- | :---: | :--- | :--- | :--- |
| **A** | `user_id` | SĐT / Mã | `0949251144` | Tài khoản đăng nhập | `handleLogin` |
| **B** | `staff_id` | Mã định danh | `FOUNDER_01`, `KTV01` | Mã định danh KTV trong hệ thống | `handleLogin` |
| **C** | `phone` | SĐT 10 số | `0949251144` | Số điện thoại liên hệ | `handleLogin` |
| **D** | `password` | Chuỗi | `123456` | Mật khẩu đăng nhập | `handleLogin` |
| **E** | `full_name` | Tên đầy đủ | `Trần Thu Ngân`, `Nguyễn Thị Huệ`| Hiển thị lời chào & phân bổ KTV | `handleLogin` |
| **F** | `role` | Quyền hạn | `Chủ tiệm` / `Kỹ thuật viên` | Điều hướng giao diện Owner vs Staff tại `app.js`| `handleLogin` |
| **G** | `salary_type` | Loại lương | `fixed_10pct` (10%+Cứng) / `20pct_tour` (20% thuần tour) | `TourCommission.calculate` | `handleLogin` |
| **H** | `base_salary` | Số tiền | `4500000` (hoặc `0`) | Mức lương cứng hàng tháng | `MonthlyPayroll.calculateMonthlySalary` | `handleLogin` |

---

### 🌸 BẢNG 8: `tb_menu` (Bảng Giá Dịch Vụ Combo & Mỹ Phẩm Niêm Yết)

| Cột | Tên Cột Trên Sheet | Kiểu Dữ Liệu | Ví Dụ Mẫu | Nơi Frontend Đọc / Ghi | Hàm Backend GAS |
| :---: | :--- | :---: | :--- | :--- | :--- |
| **A** | `service_id` | Mã | `CB01`, `CB02` | Khóa chính món dịch vụ | `getMenuList` |
| **B** | `service_name` | Tên Combo | `Combo 1 (Gội Dưỡng Sinh)`| Hiển thị trên nút chọn POS `combo_picker.js` | `getMenuList` |
| **C** | `price` | Số tiền | `64000`, `99000` | Giá niêm yết thu tiền khách | `getMenuList` |
| **D** | `duration_min` | Số phút | `50`, `60` | Thời lượng chuẩn để đồng hồ POS đếm ngược | `getMenuList` |
| **E** | `cosmetics_cost`| Số tiền | `8000` | Chi phí dầu gội / thảo dược tiêu hao | `getMenuList` |
| **F** | `commission_value`| Số tiền | `6400` | Mức hoa hồng mặc định của combo | `getMenuList` |

---

### 📢 BẢNG 9: `tb_config` (Cấu Hình Hệ Thống & Phát Thông Báo Nội Bộ)
- **Cấu trúc**: 2 cột `key` và `value`.
- **Dữ liệu thực tế**:
  - `key = "global_announcement"` $\rightarrow$ `value = "Chào mừng tháng mới! Chúc cả nhà làm việc vui vẻ..."`
- **Frontend xử lý**: [`js/Components/Modals/modal_announcement.js`](file:///c:/Users/Miles/Downloads/Selena/js/Components/Modals/modal_announcement.js) (Chủ tiệm sửa thông báo $\rightarrow$ Bắn banner lên đỉnh đầu màn hình toàn bộ KTV trong 0.03s).

---

## 🔒 3. NGUYÊN TẮC BẢO MẬT & MỞ RỘNG DATABASE (DATABASE RULES)
1. **Khóa khớp số điện thoại**: Luôn chạy qua `phone_normalizer.js` để chuẩn hóa SĐT 10 số trước khi tìm kiếm hoặc lưu vào Google Sheets, tuyệt đối không dùng số bị cắt ngắn (như `94144`).
2. **Khử lệch 17 phút múi giờ**: Bắt buộc đọc giờ phút bằng hàm `val.getHours():val.getMinutes()` trong `Code.gs` và định dạng qua `time_cleaner.js` trên Web để triệt tiêu lệch 17 phút.
3. **Thêm cột mới an toàn**: Khi cần thêm cột mới vào Sheet, luôn thêm về phía bên phải và sử dụng hàm ánh xạ header động `createHeaderMap(sheet)` trong `Code.gs` để không bao giờ bị lệch vị trí cột.

---

## ⭐️ 4. QUY TẮC BẮT BUỘC KHI THAY ĐỔI DATABASE & BACKEND CODE.GS (DATABASE SOP)

Mỗi khi có nhu cầu chỉnh sửa, thêm bớt bảng hoặc thêm bớt cột trên Google Sheets, **BẮT BUỘC phải thực hiện đủ 4 bước sau theo đúng thứ tự**:

1. **Bước 1 (Google Sheets)**: Thêm, xóa hoặc chỉnh sửa cột trên Google Sheets (thoải mái thêm ở bất kỳ vị trí nào vì Code.gs tự động dò tìm theo tên cột).
2. **Bước 2 (Backend `Code.gs`)**: Cập nhật đồng thời các hàm Đọc (`syncAllData`, `checkCustomer`...) và hàm Ghi (`createReceipt`, `updateCustomerNotes`, `addExpense`...) trong [`google_apps_script/Code.gs`](google_apps_script/Code.gs).
3. **Bước 3 (Triển Khai Apps Script)**: Sao chép toàn bộ code mới dán vào mục **Tiện ích mở rộng > Apps Script** của Google Sheet và bấm **Triển khai mới (New Deployment)** để link API nhận code mới nhất.
4. **Bước 4 (Cập Nhật Tài Liệu Này)**: Cập nhật ngay vào bảng tra cứu trong tài liệu [`selena_spa_database_architecture.md`](selena_spa_database_architecture.md) này để ghi nhận rõ tên cột mới, kiểu dữ liệu, hàm JS frontend nào đọc/ghi và hàm GAS nào xử lý.
