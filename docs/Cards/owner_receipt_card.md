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
- `2026-09-02` (`v0.0.7.0`): Đồng bộ mốc giờ hiển thị trên thẻ toàn tiệm sang lấy `end_time`.
- `2026-09-02` (`v0.0.6.2`): Áp dụng chuẩn font-mono JetBrains Mono cho toàn bộ số tiền doanh thu và tip.
- `2026-09-01` (`v0.0.0.1`): Gắn nút sửa thông tin khách hàng trực tiếp trên tên khách.
