# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: THẺ HÓA ĐƠN DOANH THU CHỦ TIỆM (OWNER RECEIPT CARD)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Dành cho Chủ Tiệm theo dõi toàn bộ hóa đơn của tiệm: doanh thu từng ca, tổng tiền khách trả, phân loại Tiền mặt / Chuyển khoản VIB, và chi tiết hoa hồng/tip của TẤT CẢ các KTV phục vụ ca đó.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/owner/history.html`
- **File JS Xử lý giao diện**: `js/Components/Cards/owner_receipt_card.js` & `js/History/shop_receipts.js`

## 3. Quy Tắc Giao Diện & Kịch Bản Phân Quyền Chi Tiết (UI Scenarios & Permissions)
- 👑 **Quy tắc hiển thị cho Chủ Tiệm**:
  - Tên khách có icon cây bút `edit-3` $
ightarrow$ Bấm vào mở `modal_owner_customer.html` (Toàn quyền sửa).
  - Hiển thị tổng tiền khách trả (gồm tiền dịch vụ + tổng tip).
  - Khung KTV hiển thị đầy đủ danh sách tất cả KTV làm ca đó kèm hoa hồng và tip của từng người.
  - Phân loại rõ ràng nhãn [QR Chuyển khoản] màu xanh vs [Tiền mặt] màu cam.

## 4. Luồng Xử Lý Logic & Hành Vi Hệ Thống (Business Logic)
- Đọc từ `tb_receipts` và khớp nối với `tb_payroll_logs` theo `receipt_id`.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_receipts` (16 cột) & `tb_payroll_logs` (19 cột).

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-02` (`v0.0.7.9`): Sắp xếp danh sách hóa đơn theo thứ tự thời gian giảm dần (Mới nhất hiển thị trên cùng).
- `2026-09-02` (`v0.0.9.8`): Lọc sạch giá trị thời lượng hiển thị trên trục thời gian, đảm bảo không bao giờ bị dính số âm timestamp mili-giây từ Google Sheets.
- `2026-09-02` (`v0.0.8.7`): Khắc phục triệt để lỗi đảo ngược thứ tự KTV khi lưu `payroll_logs` (thay `forEach unshift` bằng `unshift(...newLogs)`), đảm bảo KTV `Chính` luôn nằm ở dòng đầu tiên, theo sau là các KTV `Phụ`.
- `2026-09-02` (`v0.0.8.5`): Đảm bảo 100% các dòng KTV trên thẻ lịch sử luôn hiển thị đầy đủ nhãn `(Chính)` / `(Phụ)` tức thì ngay sau khi lưu ca.
- `2026-09-02` (`v0.0.8.2`): Rút gọn nhãn vai trò KTV thành `(Chính)` và `(Phụ)` ngắn gọn, tinh gọn thẻ lịch sử.
- `2026-09-02` (`v0.0.8.1`): Giữ Tên khách hàng, Hình thức thanh toán và Mã HD trên cùng 1 hàng; áp dụng truncate dấu 3 chấm (`...`) cho tên khách khi quá dài để không bao giờ bị đẩy rớt mã HD xuống dòng.
- `2026-09-02` (`v0.0.8.0`): Tối ưu bố cục thẻ: chuyển Hình thức thanh toán xuống hàng dưới Tên khách hàng, mã `receipt_id` nằm cùng hàng bên phải; áp dụng `whitespace-nowrap shrink-0` chống tràn/rớt chữ `đ` trên số tiền.
- `2026-09-02` (`v0.0.7.8`): Lưu chuẩn `payroll_logs` từ API sync Google Sheets và đọc 100% cột `commission_amount` từ `tb_payroll_logs` theo `receipt_id`.
- `2026-09-02` (`v0.0.7.7`): Xóa bỏ hoàn toàn code fallback chia đều 10% cũ. Toàn bộ thông tin KTV và tiền hoa hồng hiển thị trên thẻ Lịch sử Toàn Tiệm bắt buộc đọc trực tiếp 100% từ `tb_payroll_logs` theo `receipt_id`.
- `2026-09-02` (`v0.0.7.6`): Đồng bộ tức thì `payroll_logs` ngay khi chốt ca và khắc phục lỗi chia đều 10% mặc định trên thẻ Lịch sử Toàn Tiệm.
- `2026-09-02` (`v0.0.7.0`): Đồng bộ mốc giờ hiển thị trên thẻ toàn tiệm sang lấy `end_time`.
- `2026-09-02` (`v0.0.6.2`): Áp dụng chuẩn font-mono JetBrains Mono cho toàn bộ số tiền doanh thu và tip.
- `2026-09-01` (`v0.0.0.1`): Gắn nút sửa thông tin khách hàng trực tiếp trên tên khách.
