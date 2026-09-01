# 📌 ĐẶC TẢ CHI TIẾT: THEO DÕI CHU KỲ 60 NGÀY (LOYALTY CYCLE TRACKER)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Quản lý chương trình tri ân khách hàng thân thiết: Khách đi đủ 10 lần trong vòng 60 ngày sẽ được tự động tặng 1 lần gội miễn phí 100%.

## 2. Danh Sách File Cấu Thành
- **File JS Xử lý**: `js/Core/Loyalty/cycle_tracker.js`

## 3. Quy Tắc & Công Thức Tính Toán Chi Tiết
- **Thời hạn chu kỳ**: Đúng 60 ngày kể từ ngày khách đi ca đầu tiên (`cycle_start_date`).
- **Nếu trong 60 ngày khách đi đủ 10 lần**:
  - Tự động tặng 1 mã Voucher gội miễn phí 100% (hạn 60 ngày).
  - Đóng chu kỳ cũ và mở chu kỳ 60 ngày mới từ lần đi thứ 11.
- **Nếu quá 60 ngày mà khách chưa đủ 10 lần**:
  - Chu kỳ cũ tự động hết hạn, lần đi tiếp theo sẽ mở lại chu kỳ mới từ `1 / 10`.

## 4. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_customers` (Cột D `cycle_start_date`, Cột E `cycle_visits`) & `tb_loyalty_cycles`.

## 5. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Chuẩn hóa thuật toán đếm chu kỳ 60 ngày.
