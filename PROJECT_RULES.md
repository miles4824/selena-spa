# 📜 BỘ QUY TẮC VÀNG VẬN HÀNH & PHÁT TRIỂN HỆ THỐNG SELENA SPA
*Tài liệu quy chuẩn tối thượng (Master Project Rules) dành cho toàn bộ quá trình phát triển, mở rộng và bảo trì hệ thống Selena Spa & Wellness.*

---

## ⭐️ 0. NGUYÊN TẮC BẮT BUỘC TRƯỚC VÀ SAU KHI CODE (SOP TOÀN DỰ ÁN)

### 1. Luôn Đọc Kiến Trúc Dự Án Trước Khi Bắt Đầu:
- Trước khi thực hiện bất kỳ yêu cầu, sửa lỗi hay nâng cấp tính năng nào, **BẮT BUỘC phải đọc kỹ `PROJECT_RULES.md` và `selena_spa_master_architecture.md`** để nắm rõ vị trí các file và luồng dữ liệu.

### 2. Tạo Tính Năng Mới Phải Tuân Thủ Tuyệt Đối Kiến Trúc Chuẩn:
- Khi tạo bất kỳ tính năng hoặc màn hình mới nào, **luôn dựa trên kiến trúc chuẩn để tạo ra module mới tương tự** nhằm đảm bảo tính đồng bộ 100%:
  - **Khung HTML tĩnh**: Tạo file riêng trong `views/` (chỉ 30 - 80 dòng).
  - **Component xử lý giao diện JS**: Tạo file riêng trong `js/Components/` hoặc `js/Screens/`.
  - **Nghiệp vụ tính toán & Toán học lõi**: Tạo file riêng trong `js/Core/`.

### 3. Luôn Cập Nhật Lại Kiến Trúc Sau Khi Hoàn Thành:
- Sau khi hoàn thành bất kỳ tính năng mới hoặc thay đổi cấu trúc nào, **BẮT BUỘC phải cập nhật lại tài liệu `selena_spa_master_architecture.md` và `PROJECT_RULES.md`** để toàn bộ dự án luôn đồng bộ, minh bạch và chính xác tuyệt đối.

---

## 🏛️ 1. NGUYÊN TẮC CẤU TRÚC ĐỒNG BỘ 1-1 GIỮA HTML VÀ JAVASCRIPT
- Mọi thành phần giao diện (Modal, Khối POS, Màn hình) đều được chia nhỏ thành **cặp đôi 1-1 hoàn chỉnh**:
  - **Khung giao diện HTML tĩnh**: Đặt trong `views/components/modals/`, `views/components/pos/`, `views/staff/`, `views/owner/`.
  - **Logic xử lý động JavaScript**: Đặt tương ứng trong `js/Components/Modals/`, `js/Components/POS/`, `js/Screens/Staff/`, `js/Screens/Owner/`.
  - **Nghiệp vụ lõi & Công thức toán**: Đặt tách biệt hoàn toàn trong `js/Core/`.
- Mỗi file HTML hoặc JS chỉ dài **30 - 80 dòng**, tuyệt đối không viết gộp file lớn.

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
