# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: THẺ TOUR LỊCH SỬ KTV (STAFF HISTORY CARD)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Hiển thị chi tiết từng ca gội KTV đã hoàn thành: thời gian, tên combo, tên bạn KTV cùng làm, tiền tour nhận được và tiền tip riêng của KTV đó.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/staff/history.html`
- **File JS Xử lý giao diện**: `js/Components/Cards/staff_history_card.js` & `js/History/routine_timeline.js`

## 3. Quy Tắc Giao Diện & Kịch Bản Phân Quyền Chi Tiết (UI Scenarios & Permissions)
- 👩‍🦰 **Quy tắc hiển thị cho KTV**:
  - Tên khách hàng có icon cây bút `edit-3` và đường gạch chân nét đứt $
ightarrow$ Bấm vào mở `modal_staff_note.html`.
  - Hiển thị rõ ràng dòng: `KTV cùng làm: [Tên bạn làm cùng]` (nếu là ca làm chung).
  - Dùng đúng 2 nhãn chuẩn thân thiện: **`Tiền tour: +6.400 đ`** và **`Tiền tip: +20.000 đ`**.
  - SĐT luôn che `094*144`.

## 4. Luồng Xử Lý Logic & Hành Vi Hệ Thống (Business Logic)
- Lọc trong `tb_payroll_logs` lấy đúng các dòng có `staff_phone` trùng với SĐT KTV đang đăng nhập.
- Tổng thu nhập ca = `commission_amount + tip_amount`.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_payroll_logs` (19 cột).

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`):
- `2026-09-02` (`v0.0.5.9`):
- `2026-09-02` (`v0.0.6.0`):
- `2026-09-02` (`v0.0.6.1`):
- `2026-09-02` (`v0.0.9.6`): Tự động trích xuất và cập nhật `payroll_logs` ngay khi nhận tín hiệu hóa đơn mới từ Firebase Realtime, giúp màn hình lịch sử của KTV Phụ cập nhật tức thì mà không cần F5.
- `2026-09-02` (`v0.0.8.7`): Đảm bảo thứ tự KTV trong tour luôn cố định từ người nhận ca đầu tiên (Chính) đến các người phụ (Phụ).
- `2026-09-02` (`v0.0.8.1`): Giữ Tên khách hàng, Hình thức thanh toán và Mã HD trên cùng 1 hàng với cơ chế truncate 3 chấm thông minh.
- `2026-09-02` (`v0.0.8.0`): Tối ưu bố cục thẻ KTV: chuyển hình thức thanh toán xuống hàng riêng cùng mã HD, chống rớt chữ `đ` trên tiền tour/tip.
- `2026-09-02` (`v0.0.7.9`): Sắp xếp danh sách thẻ lịch sử theo thứ tự thời gian giảm dần (Mới nhất hiển thị trên cùng, ca sáng sớm nằm dưới cùng).
- `2026-09-02` (`v0.0.7.7`): Chuẩn hóa 100% nguồn dữ liệu từ `tb_payroll_logs` làm nguồn chân lý duy nhất (Single Source of Truth) cho lịch sử và thu nhập.
- `2026-09-02` (`v0.0.7.0`): Chuyển đổi mốc giờ hiển thị trên thẻ timeline sang lấy `end_time` (giờ kết thúc/thanh toán ca) thay vì `start_time`.
- `2026-09-02` (`v0.0.6.4`): Đồng bộ 100% font-mono JetBrains Mono cho các dòng Tiền tour (+3.200 đ) và Tiền tip (+35.000 đ) trong chi tiết ca gội.
- `2026-09-02` (`v0.0.6.2`): Đổi nhãn thời lượng ca sang `text-xs font-mono` và gắn `font-mono JetBrains Mono` cho toàn bộ số tiền ca/tip. Đồng bộ `font-mono` cho số phút thời lượng ca (`23p`) khớp hoàn hảo với giờ bắt đầu (`21:59`). Áp dụng chuẩn `text-2xl font-medium font-serif uppercase` cho NHẬT KÝ TOUR và ẩn nút Đồng bộ Sheet cho KTV. Chuẩn hóa tiêu đề NHẬT KÝ TOUR với font-bold font-serif uppercase tracking-wider. Bóc tách thành component độc lập và phục hồi icon sửa ghi chú khách hàng.
