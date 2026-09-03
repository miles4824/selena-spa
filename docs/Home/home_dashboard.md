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
- `2026-09-03` (`v0.1.4.9`):
  + Đảo vị trí 2 thẻ thành tích hôm nay của KTV: Thẻ 'Tour hôm nay' (Xanh dương) nằm bên trái, Thẻ 'Thu nhập hôm nay' (Xanh mint) nằm bên phải.
- `2026-09-03` (`v0.1.4.8`):
  + Tinh chỉnh cụm thành tích hôm nay của KTV đồng bộ 100% với giao diện Admin (Hình 2):
    - Bỏ `text-center`, canh lề trái dồn về 1 bên chuẩn chỉ.
    - Đổi màu sắc thẻ và viền y hệt Admin: Thẻ Thu Nhập màu xanh ngọc mint `#E8F8F5` / viền `#B7EBDD`, Thẻ Tour màu xanh dương pastel `#EBF5FB` / viền `#D4E6F1`.
    - Bỏ dấu `+` trước số tiền thu nhập (`40.844 đ` thay vì `+40.844 đ`, khi che là `•••• đ`).
    - Cập nhật ghi chú "Trong ngày" thành "Phục vụ trong ngày".
- `2026-09-03` (`v0.1.4.7`):
  + Đồng bộ 100% phong cách thẻ Wellness Banner sang trọng từ Staff sang Admin:
    - Bọc cụm chào mừng của Admin trong Card Luxury Bo góc 28px viền #F0EAE1 và nền gradient ấm áp `#FFF0EB` -> `#FAF6F1`.
    - Thống nhất kích thước nút hành động tròn bo cong pill, chữ to rõ ràng `VÀO TOUR NGAY` / `VÀO XEM NGAY`.
- `2026-09-03` (`v0.1.4.6`):
  + Tự động cập nhật tức thì màn hình Admin khi KTV kết thúc tour mà không cần bấm F5:
    - Bổ sung `renderAdminLiveRunningTours()` và `renderAdminTodaySnapshot()` vào listener `live_sessions` của Firebase Realtime.
    - Dọn sạch session cũ trên `localStorage` khi tour đã hoàn thành trên Firebase, tránh tình trạng hiện thẻ ma (Ghost Card Giường số 01).
- `2026-09-03` (`v0.1.4.5`):
  + Sửa triệt để 100% lỗi `#staff-home-status-desc` không nhận nội dung từ `tb_config`:
    - Đưa việc cập nhật `#staff-home-status-desc` và `#home-greeting-slogan` ra khỏi phân nhánh role bị chặn, đảm bảo bất cứ khi nào element tồn tại trong DOM thì luôn luôn được gán dữ liệu mới nhất từ `tb_config` (`home_free_quote`).
    - Đồng bộ `applyDynamicUIConfig` chuẩn xác trong `js/config.js`, `js/Home/home_dashboard.js`, `js/app.js` và `js/Firebase/firebase_engine.js`.
    - Kết nối Firebase Realtime cho `config/ui_config` giúp thay đổi trên Sheet cập nhật tức thì (0.03s) trên giao diện.
- `2026-09-03` (`v0.1.4.4`):
  + Cập nhật màu số tiền thu nhập: bỏ class `text-[#2E7D6D]`, chuyển sang màu đen sẫm chủ đạo `text-[#2D2424]`.
  + Khắc phục triệt để đồng bộ câu chào và câu châm ngôn từ `tb_config`:
    - Thêm `home_greeting_slogan` và `home_free_quote` vào `DEFAULT_UI_CONFIG` và hàm `applyDynamicUIConfig()`.
    - Hỗ trợ cả key chữ thường và chữ hoa (`home_greeting_slogan` & `HOME_GREETING_SLOGAN`).
    - Kích hoạt `applyDynamicUIConfig()` ngay khi tải trang và mỗi khi đồng bộ từ Google Sheets.
- `2026-09-03` (`v0.1.4.3`): Cập nhật class CSS cho `#staff-home-status-desc`: bỏ `text-xs sm:text-sm`, đặt cố định `text-sm` giúp kích thước chữ mô tả trạng thái tour rõ ràng, dễ đọc trên cả màn hình di động lẫn máy tính để bàn.
- `2026-09-03` (`v0.1.4.2`): Tinh chỉnh trải nghiệm Trang Home KTV theo góp ý:
  + Ghi nhớ trạng thái ẩn/hiện tiền trong phiên bằng localStorage (`selena_staff_home_comm_masked`): khi người dùng mở xem tiền, chuyển tab và quay lại Trang Home vẫn giữ nguyên trạng thái hiển thị, không bị tự động ẩn lại.
  + Bỏ class `justify-end` ở huy hiệu trạng thái banner KTV để căn trái tự nhiên.
  + Gom chung "Hoa hồng" và "Tiền Tip" thành một thẻ duy nhất: **"Thu nhập hôm nay"**, hiển thị tổng tiền `Hoa hồng + Tip`, kèm nút con mắt che/hiện và font mono sắc nét. Layout chuyển thành 2 cột cân đối: `Tour hôm nay` (2 tour) và `Thu nhập hôm nay` (+•••• đ).
  + Chuyển câu slogan chào đón (`home_greeting_slogan`: "hôm nay sẵn sàng tỏa sáng chưa? ✨") và câu châm ngôn khi rảnh (`home_free_quote`: "Mỗi tour gội là một trải nghiệm thư giãn tuyệt vời gửi gắm đến khách hàng thân yêu.") sang đọc trực tiếp từ `tb_config` (Google Sheet) để chủ tiệm có thể sửa bất cứ lúc nào.
  + Câu mô tả khi có ca bận: Không dùng dấu ngoặc vuông `[]`, in đậm tên khách (`font-extrabold text-[#2D2424]`), in nghiêng gói combo màu cam san hô (`italic font-bold text-[#E58A7B]`) để phân biệt trực quan.
- `2026-09-03` (`v0.1.4.1`): Tinh chỉnh chi tiết Trang Home KTV:
  + Bỏ huy hiệu "Selena Spa & Wellness".
  + Đổi "🟢 Sẵn sàng phục vụ • Đang rảnh" -> "Sẵn sàng phục vụ".
  + Đổi "⏱️ Đang trong tour (0/50p)" -> "Đang trong tour (0/50p)".
  + Đổi mô tả tour bận thành "Bạn đang trong tour của [Tên khách] (Tên dịch vụ). Vào tour ngay để theo dõi hoặc điều chỉnh ca.".
  + Đổi nút "VÀO XEM NGAY (Xp)" -> "VÀO XEM NGAY".
  + Đổi nhãn "Tour đã làm" -> "Tour hôm nay" và đơn vị "X ca" -> "X tour".
  + Thêm tính năng che mắt bảo mật cho cả "Tiền Tip" đồng bộ với "Hoa hồng", kèm font monospace font-mono.
- `2026-09-03` (`v0.1.4.0`): Tái cấu trúc toàn diện màn hình Trang Chủ (Home) cho cả Admin và Staff theo chuẩn Flowchart. Tích hợp nút vào ca biến hình thông minh (Rảnh -> Vào tour ngay / Bận -> Vào xem ngay), khu vực giám sát các giường chạy giờ realtime toàn tiệm cho Admin, và thành tích hôm nay kèm che mắt hoa hồng cho KTV.
