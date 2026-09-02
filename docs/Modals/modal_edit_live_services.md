# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: MODAL ĐỔI & THÊM DỊCH VỤ KHI ĐANG CHẠY TOUR (MODAL EDIT LIVE SERVICES)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Cho phép KTV và Chủ Tiệm thay đổi gói Combo hoặc bổ sung thêm các dịch vụ làm thêm (Massage, Waxing, Peel, Detox, Cấy dưỡng...) ngay khi khách đang nằm gội mà **không cần hủy ca phục vụ**.
- Tự động điều chỉnh lại tổng thời lượng định mức (`duration_target_min`), tính toán lại đồng hồ đếm ngược và cập nhật tổng tiền thanh toán chuẩn xác.

---

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/modals/modal_edit_live_services.html`
- **File JS Xử lý**: `js/Components/Modals/modal_edit_live_services.js` (hoặc `js/Add/pos_checkout.js`)
- **File Giao diện cha**: `views/add.html` & `views/components/pos/timer_section.html`
- **Đồng bộ Realtime**: `js/Firebase/firebase_engine.js` (node `active_sessions/`)

---

## 3. Quy Tắc Giao Diện & Kịch Bản Nghiệp Vụ Chi Tiết (UI Scenarios)

### 3.1. Điểm Chạm Kích Hoạt (Trigger Point):
- Trên màn hình Live Tour, bên cạnh tên dịch vụ đang phục vụ (Ví dụ: `Combo 1 + Tẩy tế bào chết da đầu`) có nút nhỏ **`[ ✏️ Đổi / Thêm Dịch Vụ ]`** hoặc chạm trực tiếp vào thẻ tên ca.

### 3.2. Bố Cục Giao Diện Trong Modal:
```
┌─────────────────────────────────────────────────────────────┐
│ 🔄 ĐIỀU CHỈNH DỊCH VỤ CA PHỤC VỤ                    [ ✕ ]   │
│ Khách: Chị Ngân (0799625591) • KTV: Thu Ngân                │
├─────────────────────────────────────────────────────────────┤
│ ⚡ Chọn nhanh Combo:                                         │
│ [ Combo 1 ] [ ✓ Combo 2 ] [ Combo 3 ] [ Combo 4 ] [ Combo 5 ]│
│                                                             │
│ ─────────────────- - - - - - - - - - - - -──────────────── │
│                                                             │
│ 📋 DỊCH VỤ ĐANG CHỌN CHO CA NÀY:                            │
│ [ 💆 Combo 2 — 109.000 đ • 75p  ✕ ]                         │
│ [ ✨ Massage Body Đá Nóng — 219.000 đ • 90p  ✕ ]            │
│ [ ➕ -- Chọn thêm dịch vụ từ menu --                    ▾ ] │
│                                                             │
│ ─────────────────- - - - - - - - - - - - -──────────────── │
│                                                             │
│ ⏱️ THỜI GIAN MỚI: 165 phút (Đã chạy 15p • Còn lại 150p)     │
│ 💰 TỔNG TIỀN MỚI: 328.000 đ                                 │
├─────────────────────────────────────────────────────────────┤
│        [ ✕ Đóng / Hủy ]     [ 💾 Xác Nhận Thay Đổi ]        │
└─────────────────────────────────────────────────────────────┘
```

### 3.3. Quy Tắc Nghiệp Vụ Cốt Lõi:
1. **Tuân thủ Single Combo Rule**: Khi chọn một Combo mới, hệ thống tự động thay thế Combo cũ trong ca và giữ nguyên các dịch vụ lẻ.
2. **Multi-Select Dịch Vụ Lẻ**: Cho phép thêm bớt không giới hạn các dịch vụ lẻ từ toàn bộ danh mục `tb_menu` (Massage, Waxing, Peel, Nặn mụn, Detox, Cấy dưỡng...).
3. **Giữ Nguyên Thời Gian Bắt Đầu (`start_time`)**: Giữ nguyên mốc `start_time` ban đầu của ca, số phút đã trôi qua được trừ trực tiếp vào định mức mới.
4. **Cập Nhật Tức Thì Đồng Hồ Live Timer**:
   $$	ext{Định Mức Mới} = \sum 	ext{Phút của tất cả dịch vụ mới}$$
   $$	ext{Thời Lượng Còn Lại} = 	ext{Định Mức Mới} - 	ext{Số Phút Đã Trôi Qua}$$
   Thanh tiến trình đồng hồ sẽ tính lại phần trăm theo định mức mới.

---

## 4. Luồng Xử Lý Logic & Quản Lý State (State Management)
1. **Mở Modal**: Đọc `currentLiveSession.selected_items` (hoặc tái tạo từ `service_id` và `service_name`), nạp vào biến tạm `modalTempCartItems`.
2. **Thao tác trong modal**: Thêm/bớt/đổi combo trên `modalTempCartItems`.
3. **Bấm [Xác Nhận Thay Đổi]**:
   - Gán `currentLiveSession.selected_items = modalTempCartItems`.
   - Cập nhật `currentLiveSession.price = newTotalPrice`.
   - Cập nhật `currentLiveSession.duration_target_min = newTotalDuration`.
   - Cập nhật `currentLiveSession.service_name = newServiceDisplayName`.
   - Bắn update sang Firebase `active_sessions/{sessionId}`.
   - Cập nhật giao diện Live Timer và đóng modal.

---

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Firebase Realtime**: `active_sessions/{sessionId}` cập nhật `service_name`, `price`, `duration_target_min`, `selected_items`.
- **Hóa Đơn Cuối Ca (`tb_receipts`)**: Nhận đúng tên gói dịch vụ mới, tổng tiền mới và hoa hồng mới khi KTV bấm Hoàn Thành Tour.

---

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-02` (`v0.1.0.7`): Nâng z-index lên `z-[999]` che phủ hoàn toàn thanh bottom navigation; đổi tiêu đề thành `Điều chỉnh dịch vụ` với định dạng `font-medium text-xl uppercase` (xóa `sm:text-base`) và bỏ `font-semibold` ở dòng thông tin khách/KTV.
- `2026-09-01` (`v0.0.4.2`): Khắc phục lỗi cập nhật tiêu đề live-service-name và gọi hàm renderLiveSessionUI() đồng bộ tức thì. Gắn nút `[ ✏️ Đổi Dịch Vụ ]` trực tiếp trên thẻ tiêu đề của `live-session-card`. Khởi tạo tài liệu đặc tả nghiệp vụ Modal Đổi & Thêm Dịch Vụ Khi Đang Chạy Tour.
