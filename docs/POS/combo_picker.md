# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: CỤM CHỌN DỊCH VỤ & SẢN PHẨM TOÀN DIỆN (SERVICE & COMBO PICKER)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Cho phép KTV và Chủ Tiệm linh hoạt chọn bất kỳ tổ hợp dịch vụ nào cho ca phục vụ:
  - Khách chỉ gội Combo (Combo 1 - 5).
  - Khách **chỉ làm dịch vụ lẻ** (Massage vai gáy, Tẩy da chết da đầu... mà KHÔNG gội Combo).
  - Khách làm Combo + kèm 1 hoặc nhiều dịch vụ làm thêm.
  - Khách làm kết hợp nhiều dịch vụ lẻ với nhau.
- **Nguồn Dữ Liệu Duy Nhất**: Toàn bộ Combo và Dịch vụ lẻ **100% được nạp động từ bảng `tb_menu` trên Google Sheets**. Không sử dụng dữ liệu tĩnh (hardcoded).

---

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/add.html` & `views/components/pos/combo_section.html`
- **File JS Xử lý giao diện**: `js/Add/pos_checkout.js`
- **Danh Mục Dữ Liệu**: `js/config.js` (`DEFAULT_MENU`), `js/Core/Menu/service_catalog.js`, Google Sheets `tb_menu`.

---

## 3. Quy Tắc Giao Diện & Kịch Bản Nghiệp Vụ Chi Tiết (UI Scenarios & Permissions)

### 3.1. Bố Cục Giao Diện Chuẩn:
```
┌─────────────────────────────────────────────────────────────┐
│ 1. CHỌN DỊCH VỤ & SẢN PHẨM                                  │
│                                                             │
│ [ Dropdown chọn sản phẩm / dịch vụ ▾ ] [ ➕ Thêm ]          │
│                                                             │
│ Chọn nhanh Combo:                                           │
│ [ Combo 1 ] [ Combo 2 ] [ Combo 3 ] [ Combo 4 ] [ Combo 5 ] │
├─────────────────────────────────────────────────────────────┤
│ 📋 DỊCH VỤ ĐÃ CHỌN:                                         │
│ • 💆 Combo 1 (Gội Dưỡng Sinh): 64.000 đ (45p)           [✕] │
│ • ✨ Massage Cổ Vai Gáy: 50.000 đ (20p)                 [✕] │
│                                                             │
│ 💰 TỔNG CỘNG: 114.000 đ    ⏱️ THỜI LƯỢNG: 65 phút            │
└─────────────────────────────────────────────────────────────┘
```

### 3.2. Quy Tắc Nghiệp Vụ Cốt Lõi:
1. **Quy tắc Ẩn Món Đã Chọn Khỏi Dropdown (Hide Selected Items)**:
   - Khi một món (Combo hoặc Dịch vụ lẻ) đã nằm trong danh sách **ĐÃ CHỌN**, món đó sẽ **TỰ ĐỘNG ẨN HOÀN TOÀN KHỎI DROPDOWN** để tránh chọn trùng lặp.
   - Khi KTV bấm nút **`[✕]`** để xóa món ra khỏi giỏ, món đó sẽ **TỰ ĐỘNG HIỆN LẠI TRONG DROPDOWN**.
2. **Quy tắc Nút Bấm Nhanh (Quick Combo Buttons - Toggle 1 Chạm)**:
   - Chạm vào `[ Combo 1 ]` $
ightarrow$ Thêm ngay Combo 1 vào danh sách ĐÃ CHỌN (và ẩn Combo 1 trong dropdown).
   - Chạm lại vào `[ Combo 1 ]` một lần nữa $
ightarrow$ Tự động hủy chọn / xóa Combo 1 khỏi danh sách (và hiện lại trong dropdown).
3. **Quy tắc Phân Nhóm Dropdown (Optgroup)**:
   - Nhóm 1: `💆 Combo Gội Chính` (Combo 1 - 5).
   - Nhóm 2: `✨ Dịch Vụ Lẻ / Làm Thêm` (Massage vai gáy, Tẩy da chết, Đắp mặt nạ, Xông hơi, Nâng cơ mặt...).
4. **Quy tắc Linh Hoạt Tối Đa**:
   - Không ép buộc phải có Combo. Khách có thể chỉ làm 1 dịch vụ lẻ (VD: chỉ Massage vai gáy 50k).
   - Bắt buộc giỏ hàng phải có ít nhất 1 dịch vụ mới có thể bấm "Bắt Đầu Tour Gội".

---

## 4. Luồng Xử Lý Logic & Công Thức Tính Toán (Business Logic)

### 4.1. Quản Lý State:
- `selectedCartItems = []` (Mảng chứa các object dịch vụ được chọn từ `tb_menu`).

### 4.2. Công Thức Tổng Tiền & Thời Gian Ca:
$$	ext{Tổng Giá Tiền Ca} = \sum_{i \in 	ext{selectedCartItems}} 	ext{Price}(i)$$
$$	ext{Tổng Phút Định Mức} = \sum_{i \in 	ext{selectedCartItems}} 	ext{Duration}(i)$$

### 4.3. Đồng Hồ Đếm Giờ (Live Timer):
- Nhận đúng `Tổng Phút Định Mức` của tất cả các dịch vụ trong giỏ để đếm ngược chính xác đến từng giây.

---

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_menu`
  - Cột A: `service_id` (`CB01`, `CB02`, `DV01`, `DV02`...).
  - Cột B: `service_name` (Tên hiển thị).
  - Cột C: `category` (`combo` hoặc `service`).
  - Cột D: `price` (Giá tiền niêm yết).
  - Cột E: `duration_min` (Thời lượng phục vụ).
- **Ghi vào `tb_receipts`**:
  - `service_name`: Chuỗi ghép tên các dịch vụ đã chọn (VD: `Combo 1 + Massage Cổ Vai Gáy`).
  - `price`: Tổng tiền sau khi cộng dồn.
  - `duration_min`: Tổng thời lượng ca.

---

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Khởi tạo component chọn combo.
- `2026-09-01` (`v0.0.1.6`): Bổ sung nút dịch vụ làm thêm.
- `2026-09-01` (`v0.0.2.0`): Cải tiến kiến trúc giỏ dịch vụ toàn diện (Dropdown + Nút bấm nhanh 1 chạm, tự động ẩn món đã chọn khỏi dropdown, hỗ trợ 100% dịch vụ lẻ không cần combo, đồng bộ động từ tb_menu).
