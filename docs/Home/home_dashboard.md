# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: TRANG CHỦ (HOME DASHBOARD)

## 1. Mục Đích & Bối Cảnh Nghiệp Vụ Tại Tiệm
- Trang Chủ là màn hình đầu tiên hiển thị sau khi đăng nhập thành công.
- Được phân tách rạch ròi theo vai trò:
  1. **Chủ Tiệm (Admin / Owner - Miles)**: Kiểm soát tức thời tình hình vận hành của tiệm thời gian thực (các giường đang chạy, ai đang rảnh/bận, dòng tiền hôm nay, lối tắt quản trị).
  2. **Kỹ Thuật Viên (Staff - Mai Lan, Thu Ngân...)**: Nhẹ nhàng, truyền cảm hứng thư giãn, tạo động lực với thành tích cá nhân trong ngày và nút vào ca biến hình thông minh.

---

## 2. Kiến Trúc Cụm Chức Năng Chi Tiết (Theo Flowchart Chuẩn)

### A. Nhánh Kỹ Thuật Viên (Staff)
1. **Cụm 1: Wellness Banner & Nút Trạng Thái Thông Minh**:
   - Chào đón: *"Chào [Tên KTV] ✨ Hôm nay sẵn sàng tỏa sáng chưa?"*.
   - **Nút hành động biến hình (Dynamic Status Action)**:
     - 🟢 **Nếu ĐANG RẢNH**: Huy hiệu `🟢 Sẵn sàng phục vụ • Đang rảnh` + Nút **`[💆 VÀO TOUR NGAY]`** $\rightarrow$ Bấm là chuyển ngay sang tab POS (Add).
     - 🔴 **Nếu ĐANG TRONG TOUR**: Huy hiệu `⏱️ Đang trong tour (Phút thứ X / Y)` + Nút **`[⏱️ VÀO XEM NGAY]`** $\rightarrow$ Bấm là mở trực tiếp ca đếm giờ đang phục vụ của KTV đó.
2. **Cụm 2: Thông Báo Từ Chủ Tiệm**:
   - Hiển thị thông báo, lời dặn dò từ anh (Miles).
3. **Cụm 3: Thành Tích Riêng Của KTV Trong Ngày Hôm Nay**:
   - Số tour hôm nay đã làm (`4 ca`).
   - Tiền hoa hồng tích lũy hôm nay (kèm icon con mắt 👁️ để che/hiện bảo mật `+•••• đ` $\leftrightarrow$ `+120.000 đ`).
   - Tiền Tip hôm nay nhận được.

---

### B. Nhánh Chủ Tiệm (Admin / Owner)
1. **Cụm 1: Header & Trạng Thái Cá Nhân**:
   - Chào chủ sáng lập: `👑 Chào chủ sáng lập (Hi Miles ✨)`.
   - Nút trạng thái cá nhân: Nếu đang rảnh `[💆 VÀO TOUR NGAY]`, nếu đang làm khách `[⏱️ VÀO XEM NGAY]`.
2. **Cụm 2: Giám Sát Realtime Toàn Tiệm (Live Running Tours)**:
   - Dòng tổng quan: *Đang có X nhân viên trực (Y người đang làm khách, Z người đang rảnh)*.
   - Danh sách các giường/tour đang chạy giờ: Tên khách, KTV phục vụ, Gói dịch vụ, Tiến trình thời gian thực (phút chạy / mục tiêu).
   - Nút xem chi tiết từng ca.
3. **Cụm 3: Chỉ Số Nhanh Hôm Nay (Today Snapshot)**:
   - Doanh thu hôm nay.
   - Số lượt khách/tour hôm nay.
   - Lương KTV phát sinh hôm nay.
   - Lợi nhuận tạm tính hôm nay.
4. **Cụm 4: Bảng Phát Thông Báo Nhanh Cho KTV**:
   - Hiển thị thông báo hiện tại + Nút sửa thông báo 1 chạm.
5. **Cụm 5: Lối Tắt Thao Tác Nhanh (Quick Actions)**:
   - `[➕ Vào Tour Mới (POS)]` | `[💸 Nhập Chi Phí Nhanh]` | `[👥 Xem Khách Hàng]`.

---

## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-03` (`v0.1.4.0`): Tái cấu trúc toàn diện màn hình Trang Chủ (Home) cho cả Admin và Staff theo chuẩn Flowchart. Tích hợp nút vào ca biến hình thông minh (Rảnh -> Vào tour ngay / Bận -> Vào xem ngay), khu vực giám sát các giường chạy giờ realtime toàn tiệm cho Admin, và thành tích hôm nay kèm che mắt hoa hồng cho KTV.
