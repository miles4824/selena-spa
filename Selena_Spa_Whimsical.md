# 📱 SELENA SPA APP (PWA Mobile)
## 1. Màn hình Đăng nhập PIN & Check IP
### ❓ Đang kết nối Wifi tiệm?
#### ❌ KHÔNG (Staff) -> 🚫 Chặn truy cập (Yêu cầu kết nối Wifi tiệm)
#### ✅ CÓ (Hoặc là Chủ tiệm Admin)
##### 📱 GIAO DIỆN NHÂN VIÊN (Staff Portal)
###### 💆 1. Nhập ca làm gội đầu
- 🔍 Gõ SĐT -> Tự động hiện Lưu ý Da đầu & Sở thích khách cũ
- 💳 Chọn Thanh toán: Chuyển khoản (VietQR tự điền tiền) / Tiền mặt
- 💾 Bấm Lưu hóa đơn -> Gửi dữ liệu về Google Sheets
- ➕ Tự động +1 Lượt gội vào hồ sơ khách (tb_customers)
- 🎁 Đủ 10 lần gội -> Tự động tặng 1 Voucher Combo 1 miễn phí
###### 📊 2. Xem Lịch sử & Lương cá nhân
- 📜 Danh sách ca gội đầu đã làm trong ngày/tháng
- 💰 Tổng tiền hoa hồng (lương tour) tạm tính cá nhân
##### 👑 GIAO DIỆN CHỦ TIỆM (Admin Portal)
###### 📈 Dashboard Báo cáo Tài chính
- 💵 Tổng Doanh thu
- 👥 Tổng Lương KTV
- ⚡ Chi phí vận hành (Điện, Nước, Mạng, Mặt bằng)
- 💎 LỢI NHUẬN RÒNG = Doanh thu - Lương - Chi phí - Dầu gội
###### 📋 Quản lý Menu Combo & Tiền tour KTV
###### 👥 Quản lý Nhân sự & Phân loại lương
###### ⚡ Nhập Chi phí Điện, Nước, Mạng, Mặt bằng
###### 🎁 Quản lý Khách hàng, Lịch sử gội & Voucher
##### 📊 ĐỒNG BỘ TRỰC TIẾP VỚI GOOGLE SHEETS (6 Tabs)
- tb_users | tb_menu | tb_receipts | tb_expenses | tb_customers | tb_config
