# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: MODAL THANH TOÁN 2 PHA KÍN ĐÁO (CHECKOUT)

## 1. Mục Đích & Bối Cảnh Nghiệp Vụ Thực Tế
- Giải quyết bài toán thanh toán tinh tế và chuyên nghiệp: Khách hàng quét mã QR thanh toán đúng số tiền dịch vụ mà không thấy bất kỳ chữ "Tips" nào. Sau khi khách thanh toán xong, KTV mới mở bước riêng tư để nhập tiền Tips được khách cho riêng.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/modals/modal_checkout.html`
- **File JS Xử lý giao diện**: `js/Components/Modals/modal_checkout.js` & `js/Add/pos_checkout.js`
- **Tài Nguyên Hình Ảnh**: `images/qr_bank.jpg` (Mã QR VietQR VIB tài khoản `799625591 - TRẦN THU NGÂN`).

## 3. Quy Tắc Giao Diện & Kịch Bản Phân Quyền Chi Tiết (UI Scenarios & Permissions)

### 🟢 KỊCH BẢN 1: PHA 1 - ĐƯA MÀN HÌNH CHO KHÁCH XEM (PUBLIC STEP)
- **Mục tiêu**: Khách xem rõ hóa đơn và quét mã QR hoặc đưa tiền mặt.
- **Hiển thị**: Tên combo, dịch vụ thêm, tổng tiền dịch vụ, tên khách hàng.
- **Phương thức thanh toán**: Nút chọn `Quét Mã QR (VIB)` hoặc `Tiền Mặt`.
- **Hiển thị mã QR**: Ảnh QR động chứa đúng số tiền ca gội.
- **QUY TẮC VÀNG BẢO MẬT**: **TUYỆT ĐỐI GIẤU 100% TOÀN BỘ CHỮ VÀ Ô NHẬP TIỀN TIPS**.
- **Nút hành động**: *"Khách Đã Thanh Toán"* (kèm icon mũi tên bên phải).

### 🔒 KỊCH BẢN 2: PHA 2 - NHẬP TIỀN TIPS NỘI BỘ KTV (PRIVATE STEP)
- **Mục tiêu**: KTV ghi nhận tiền tip khách cho riêng từng người.
- **Giao diện**:
  - Chỉ xuất hiện khi KTV bấm tiếp tục từ Pha 1.
  - Hiển thị từng ô nhập Tiền Tip riêng biệt cho từng KTV có mặt trong ca (KTV chính, KTV phụ 1, KTV phụ 2).
  - Tự động cộng tổng tiền thu thực tế và tính hoa hồng dự kiến.
- **Nút hành động**: *"Hoàn Tất & Lưu Hóa Đơn"*.

## 4. Luồng Xử Lý Logic & Hành Vi Hệ Thống (Business Logic)
1. Tổng tiền ca = `Giá combo + Tiền dịch vụ phụ + Tiền mỹ phẩm bán kèm`.
2. Tổng thanh toán = `Tổng tiền ca + Tổng tiền Tips`.
3. Hoa hồng KTV = Tính theo tỷ lệ hợp đồng (10% hoặc 20%) và tỷ lệ phân chia (theo phút hoặc 50-50). Tiền tip thuộc $100\%$ về KTV.
4. Bấm Hoàn tất $
ightarrow$ Sinh mã hóa đơn `HD + yymmddhhmmss` $
ightarrow$ Cập nhật `tb_receipts`, `tb_payroll_logs`, xóa ca đang chạy trên Firebase và bắn pháo hoa confetti.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_receipts` & `tb_payroll_logs`
- **Cột Đọc / Ghi**:
  - `tb_receipts` $
ightarrow$ Cột J (`price`), Cột K (`tip_amount`), Cột L (`total_paid`), Cột N (`payment_method`), Cột O (`is_voucher_used`).
  - `tb_payroll_logs` $
ightarrow$ Cột O (`commission_amount`), Cột P (`tip_amount`), Cột Q (`total_earned`).
- **Hàm Backend GAS phụ trách**: `createReceipt(params)` trong `Code.gs`.

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`):
- `2026-09-02` (`v0.0.4.7`):
- `2026-09-02` (`v0.0.6.3`):
- `2026-09-02` (`v0.0.8.4`): Khắc phục lỗi `comm1 is not defined` bằng cách đọc trực tiếp từ mảng `mappedStaffs` và lặp thông báo lưu đơn động cho $N$ KTV.
- `2026-09-02` (`v0.0.7.1`): Cố định (pin) Header và Footer của modal thanh toán, chỉ cuộn nội dung ở giữa; xóa text STK trùng lặp và mở rộng ảnh QR full-width.
- `2026-09-02` (`v0.0.6.9`): Gán tường minh `text-[#2D2424]` cho số tiền tip (`+10.000 đ`) giúp con số nổi bật sắc nét trên nền nhãn `text-[#7E7272]`.
- `2026-09-02` (`v0.0.6.8`): Tinh chỉnh tiêu đề Ghi Nhận Tiền Tips sang `text-xl font-medium`, đổi màu dòng tip sang `text-[#7E7272]` và làm nổi bật tiêu đề Tổng khách thanh toán `text-[#2D2424]`.
- `2026-09-02` (`v0.0.6.7`): Bảo mật tuyệt đối tiền hoa hồng KTV (ẩn huy hiệu Tour + đ và bảng ăn chia), chỉ hiển thị Tiền dịch vụ tour và Tiền tip của khách. Đồng bộ font-mono JetBrains Mono cho toàn bộ số tiền thanh toán, tiền tip, hoa hồng và nút chọn tip nhanh. Cập nhật nhãn nút bấm Pha 1 thành 'Khách Đã Thanh Toán' kèm icon mũi tên chuyển bước bên phải. Bóc tách thành component độc lập và chuẩn hóa luồng 2 pha.
