# 📜 BỘ QUY TẮC VÀNG VẬN HÀNH & PHÁT TRIỂN HỆ THỐNG SELENA SPA
*Tài liệu quy chuẩn tối thượng (Master Project Rules) dành cho toàn bộ quá trình phát triển, mở rộng và bảo trì hệ thống Selena Spa & Wellness.*

---

## ⭐️ 0. NGUYÊN TẮC BẮT BUỘC TRƯỚC VÀ SAU KHI CODE (SOP TOÀN DỰ ÁN)

### 1. Luôn Đọc Kiến Trúc, Database & Hồ Sơ Đặc Tả Component Trước Khi Bắt Đầu:
- Trước khi thực hiện bất kỳ yêu cầu, sửa lỗi hay nâng cấp tính năng nào, **BẮT BUỘC phải đọc kỹ 4 tài liệu nền tảng**:
  1. [`PROJECT_RULES.md`](PROJECT_RULES.md) (Bộ quy tắc vận hành & bảo mật).
  2. [`selena_spa_master_architecture.md`](selena_spa_master_architecture.md) (Bản thiết kế cấu trúc 1-1 HTML và JS).
  3. [`selena_spa_database_architecture.md`](selena_spa_database_architecture.md) (Bản hướng dẫn kiến trúc 9 bảng Google Sheets & luồng dữ liệu).
  4. **File `.md` tương ứng trong thư mục `docs/`** (Đọc kỹ 6 phần đặc tả của component sắp chỉnh sửa, đặc biệt là Mục 3 Phân Quyền Staff/Owner và Mục 5 Ánh Xạ Database).

### 2. Tạo Tính Năng / Component Mới Phải Tuân Thủ Tuyệt Đối Kiến Trúc Chuẩn & Tạo Docs 1-1:
- Khi tạo bất kỳ tính năng hoặc màn hình mới nào, **luôn dựa trên kiến trúc chuẩn để tạo ra module mới tương tự** nhằm đảm bảo tính đồng bộ 100%:
  - **Khung HTML tĩnh**: Tạo file riêng độc lập trong `views/`.
  - **Component xử lý giao diện JS**: Tạo file riêng độc lập trong `js/Components/` hoặc `js/Screens/`.
  - **Nghiệp vụ tính toán & Toán học lõi**: Tạo file riêng độc lập trong `js/Core/`.
  - **Hồ sơ đặc tả kỹ thuật**: BẮT BUỘC tạo 1 file `.md` mới tương ứng trong `docs/` theo đúng khung 6 phần chuẩn mực.

### 3. Luôn Cập Nhật Lại Kiến Trúc, Database & Mục 6 (Audit Log) Sau Khi Hoàn Thành:
- Sau khi hoàn thành bất kỳ tính năng mới hoặc thay đổi cấu trúc nào:
  - Cập nhật phiên bản (+1) và ghi nội dung đã sửa vào **Mục 6 (Lịch Sử Thay Đổi & Lưu Vết)** của file `.md` tương ứng trong `docs/`.
  - Nếu có thay đổi cấu trúc file/module: **Cập nhật lại `selena_spa_master_architecture.md` và `PROJECT_RULES.md`**.
  - Nếu có thay đổi Database: Tuân thủ nghiêm ngặt **Quy tắc 4 bước** trong [`selena_spa_database_architecture.md`](selena_spa_database_architecture.md) (Cập nhật Sheet $ightarrow$ Cập nhật `Code.gs` $ightarrow$ Triển khai New Deployment $ightarrow$ Cập nhật tài liệu Database).

---

## 🏛️ 1. NGUYÊN TẮC CẤU TRÚC ĐỒNG BỘ 1-1 GIỮA HTML VÀ JAVASCRIPT
- Mọi thành phần giao diện (Modal, Khối POS, Màn hình) đều được chia nhỏ thành **cặp đôi 1-1 hoàn chỉnh**:
  - **Khung giao diện HTML tĩnh**: Đặt trong `views/components/modals/`, `views/components/pos/`, `views/staff/`, `views/owner/`.
  - **Logic xử lý động JavaScript**: Đặt tương ứng trong `js/Components/Modals/`, `js/Components/POS/`, `js/Screens/Staff/`, `js/Screens/Owner/`.
  - **Nghiệp vụ lõi & Công thức toán**: Đặt tách biệt hoàn toàn trong `js/Core/`.
- Mỗi file đảm nhiệm đúng một nhiệm vụ duy nhất (Single Responsibility), gọn gàng, trong sáng, tuyệt đối không gộp chung nhiều màn hình vào một file khổng lồ.

---

## 🔒 2. NGUYÊN TẮC BẢO MẬT & PHÂN QUYỀN (SECURITY & ISOLATION)
- Mã nguồn, component và giao diện của **KTV** và **Chủ Tiệm** phải được tách thành **2 Component/File độc lập hoàn toàn**.
- **Kỹ Thuật Viên (Staff)**: Số điện thoại luôn che `094*144`.
- **Chủ Tiệm (Owner)**: Hiển thị đầy đủ số điện thoại: `0949251144`.
- **Lưu dữ liệu**: Luôn tra cứu và gửi **Số điện thoại thật 10 số (`0949251144`)** về máy chủ, **tuyệt đối không gửi số bị cắt ngắn (như `94144`)**.
- **Tháng sinh nhật**:
  - Khách chưa có: KTV thấy ô chọn tháng để lưu lần đầu.
  - Khách đã có: **Ẩn hoàn toàn ô chọn tháng đối với KTV**, KTV chỉ thấy `• Sinh nhật: Tháng X`, chỉ Chủ tiệm mới có quyền sửa.

---

## 👥 3. NGUYÊN TẮC KTV, CA LÀM & ĐỒNG NGHIỆP CÙNG LÀM (STAFF & WORKFLOW)
- Hiện rõ `KTV cùng làm: [Tên Bạn Làm Cùng]` trên thẻ tour.
- Dùng nhãn thân thiện: **`Tiền tour:`** và **`Tiền tip:`**.
- Phân chia hoa hồng ca chung: **Theo thời gian thực tế** hoặc **Chia đều 50/50**.
- Bàn giao tour (Handover) đồng bộ sang KTV tiếp quản trong **0.03 giây**.

---

## 💰 4. NGUYÊN TẮC TÍNH TOÁN & KẾ TOÁN (PAYROLL & FINANCE)
- Hoa hồng tour: `10% + lương cứng` hoặc `20% thuần tour`.
- Khách dùng Voucher -> KTV **vẫn được hưởng hoa hồng theo giá gốc niêm yết của Combo**.
- Tiền tip 100% thuộc về KTV.
- **Tính lương tháng từ ngày 1 đến ngày 30**.
- Báo cáo Lợi nhuận ròng = $	ext{Doanh thu} - 	ext{Quỹ lương} - 	ext{Chi phí}$.
- Phân loại rõ: Tiền mặt có trong két vs Tiền chuyển khoản VIB (`TRẦN THU NGÂN - 799625591`).

---

## 🌸 5. MENU DỊCH VỤ, LÀM THÊM & SẢN PHẨM (MENU & ADD-ONS)
- Combo chính (Combo 1 - 5).
- Dịch vụ làm thêm (Add-ons: Cổ vai gáy, Đắp mặt nạ, Tẩy da đầu...).
- Sản phẩm bán kèm (Dầu gội bưởi, serum...).
- Tự cộng dồn thời lượng: `Combo chính + Dịch vụ thêm`.

---

## ⏱️ 6. QUY TRÌNH TẠO TOUR & THANH TOÁN KÍN ĐÁO (POS & SESSIONS)
- Đồng hồ đếm ngược trực quan.
- Thanh toán 2 pha: Pha 1 (Khách xem QR giấu tip) -> Pha 2 (KTV nhập tip riêng tư).

---

## 📅 7. LỊCH & THỜI GIAN (DATETIME)
- Làm mờ và khóa bấm (`pointer-events-none`) toàn bộ các ngày chưa tới trong tương lai.
- Triệt tiêu 100% độ lệch 17 phút lịch sử do múi giờ.

---

## 🎁 8. CHU KỲ 60 NGÀY & VOUCHER (LOYALTY)
- Khách đi đủ 10 lần trong 60 ngày -> Tự động tặng 1 lần gội miễn phí (100%).
- Quản lý chính xác hạn dùng voucher (30 / 60 / 90 ngày).

---

## 📢 9. THÔNG BÁO NỘI BỘ (ANNOUNCEMENT)
- Chủ tiệm phát thông báo qua `modal_announcement` -> Bắn banner lên đỉnh màn hình KTV trong 0.03s.

---

## 🏛️ 10. NGUYÊN TẮC LẬP TRÌNH & KIẾN TRÚC
1. **Không tự ý thay đổi cấu trúc hay logic nghiệp vụ mà không thảo luận và xin phép người dùng.**
2. **Single Source of Truth**: Mỗi công thức chỉ viết ở 1 file duy nhất.
3. **Micro-Components 1-1**: Khung HTML và mã JS tương ứng 1-1.
4. **Kiểm tra cú pháp trước khi triển khai**: Luôn chạy Node.js kiểm tra toàn bộ file JS trước khi commit và push.

---

## 🔢 11. NGUYÊN TẮC ĐÁNH SỐ PHIÊN BẢN (VERSION INCREMENT RULE)
- **Tăng tuần tự từng bước nhỏ**: Mỗi lần chỉnh sửa, cập nhật code hoặc tính năng mới, số phiên bản **BẮT BUỘC chỉ được tăng thêm 1 đơn vị ở số cuối cùng** (ví dụ: `v0.0.0.1` -> `v0.0.0.2` -> `v0.0.0.3` -> `v0.0.0.4`...).
- **Tuyệt đối không được nhảy cóc số phiên bản** (ví dụ: cấm nhảy từ `v0.0.0.1` lên thẳng `v0.0.1.0` hoặc `v0.1.0.0`).
- **Đồng bộ toàn bộ 3 vị trí**:
  1. `index.html` (Query string `?v=v0.0.0.x` của tất cả các file script/css).
  2. `js/config.js` (`const APP_VERSION = 'v0.0.0.x';`).
  3. `views/login.html` (Dòng chữ hiển thị phiên bản ở chân trang đăng nhập).
