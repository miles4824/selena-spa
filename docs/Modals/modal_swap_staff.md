# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: MODAL ĐIỀU CHỈNH & ĐỔI KTV TRONG CA

## 1. Mục Đích & Bối Cảnh Nghiệp Vụ Thực Tế
- Khi đang gội đầu mà cần thêm KTV vào phụ gội/massage, hoặc KTV chính có việc bận cần chuyển giao cho KTV khác làm tiếp, modal này giúp điều chỉnh danh sách KTV và tự động phân chia tiền hoa hồng công bằng.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/modals/modal_swap_staff.html`
- **File JS Xử lý giao diện**: `js/Components/Modals/modal_swap_staff.js` & `js/Add/pos_checkout.js`
- **Hàm Toán học lõi**: `js/Core/Payroll/split_commission.js`

## 3. Quy Tắc Giao Diện & Kịch Bản Phân Quyền Chi Tiết (UI Scenarios & Permissions)

### 🟢 KỊCH BẢN 1: CHẾ ĐỘ PHÂN CHIA THEO THỜI GIAN THỰC (TÍNH THEO PHÚT)
- Hệ thống đếm chính xác KTV 1 đã làm bao nhiêu phút, KTV 2 làm bao nhiêu phút.
- Tỷ lệ hoa hồng tự động chia theo công thức: $	ext{Tỷ lệ KTV 1} = rac{	ext{Phút KTV 1}}{	ext{Tổng phút làm ca}}$.

### 🤝 KỊCH BẢN 2: CHẾ ĐỘ CHIA ĐỀU (50 / 50)
- Hai KTV thống nhất cưa đôi hoa hồng tour.
- Mỗi KTV nhận đúng $50\%$ hoa hồng của ca gội đó.

## 4. Luồng Xử Lý Logic & Hành Vi Hệ Thống (Business Logic)
1. KTV bấm nút *"Đổi / Thêm KTV"* trên đồng hồ POS $
ightarrow$ Mở modal.
2. Cho phép bấm `+ Thêm KTV vào tour này` hoặc bấm icon thùng rác để xóa bớt KTV.
3. Chọn 1 trong 2 chế độ chia tiền $
ightarrow$ Hệ thống tự tính bảng phân bổ tiền dự kiến.
4. Bấm *"Xác Nhận Thay Đổi"* $
ightarrow$ Cập nhật mảng KTV phục vụ của ca trên Firebase.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_payroll_logs`
- **Cột Đọc / Ghi**: Cột N (`commission_pct`), Cột O (`commission_amount`).
- **Hàm Backend GAS phụ trách**: `createReceipt(params)` ghi nhận từng dòng KTV tương ứng.

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-02` (`v0.0.8.6`): Cố định (pin) Header và Footer của modal Điều Chỉnh KTV; cá nhân hóa mục tổng kết theo từng giai đoạn làm việc thực tế cho KTV với tiêu đề `🏆 Tổng thu nhập trong tour này:` và Tổng tiền nhận.
- `2026-09-02` (`v0.0.8.5`): Cập nhật icon `users` hợp lệ của Lucide, gỡ bỏ đoạn mô tả dài dòng thừa, đổi tiêu đề danh sách thành `Danh Sách KTV đang làm`, và bỏ phần % thừa phía sau số tiền trong phần Dự kiến phân bổ tổng.
- `2026-09-02` (`v0.0.8.2`): Tối giản quy ước `role_in_tour` thành 2 trạng thái gọn gàng: `Chính` (KTV đầu tiên) và `Phụ` (các KTV vào sau/cùng làm), mở rộng hỗ trợ động $N$ nhân sự không giới hạn số lượng.
- `2026-09-02` (`v0.0.7.5`): Chuẩn hóa hiển thị % minh bạch theo từng giai đoạn (1 KTV làm: 100%; 2 KTV làm: 50% mỗi người; 3 KTV làm: 33% mỗi người của đoạn đó) và chỉ hiển thị tổng % tích lũy ở phần Tổng kết.
- `2026-09-02` (`v0.0.7.4`): Nâng cấp Động cơ Phân chia Đa giai đoạn Linh hoạt (Multi-Stage Timeline Engine): Hỗ trợ N giai đoạn tự động khi có 3+ KTV vào ở các thời điểm khác nhau, hoặc KTV phụ làm xong nhiệm vụ rời ca sớm để KTV chính tiếp tục làm đoạn còn lại.
- `2026-09-02` (`v0.0.7.3`): Khắc phục triệt để lỗi ReferenceError bằng cách truy cập an toàn biến toàn cục `currentUser` và hàm `isUserOwner()`.
- `2026-09-02` (`v0.0.7.2`): Bảo mật tuyệt đối hoa hồng từng KTV (Staff chỉ thấy tiền của mình, thấy % của bạn làm chung; Admin thấy toàn bộ) và tính đúng theo tỷ lệ % hoa hồng riêng biệt của từng KTV từ `tb_users`.
- `2026-09-01` (`v0.0.0.1`): Bóc tách thành component độc lập.
