# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: CỤM CHỌN DỊCH VỤ COMBO CHÍNH (COMBO PICKER)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Quản lý danh mục Combo gội chuẩn xác của Selena Spa, nạp 100% từ bảng `tb_menu` trên Google Sheets.
- Cho phép chọn nhanh 1 chạm qua hàng nút Pills hoặc chọn từ Dropdown.

---

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/add.html` & `views/components/pos/combo_section.html`
- **File JS Xử lý giao diện**: `js/Add/pos_checkout.js`
- **Danh Mục Dữ Liệu**: `js/config.js` (`DEFAULT_MENU`), Google Sheets `tb_menu`.

---

## 3. Quy Tắc Giao Diện & Bảng Giá Menu Chuẩn Xác Của Tiệm

### 3.1. Danh Mục Combo Niêm Yết Tại Tiệm:
| `service_id` | `service_name` | `price` | `duration_min` | `cosmetics_cost` | `commission_type` | `commission_value` | `is_active` |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `CB_BE` | Combo Bé | `45.000 đ` | 30 | `4.500 đ` | `fixed` | `4.500 đ` | `TRUE` |
| `CB_01` | Combo 1 | `64.000 đ` | 50 | `6.400 đ` | `fixed` | `6.400 đ` | `TRUE` |
| `CB_02` | Combo 2 | `109.000 đ` | 75 | `10.000 đ` | `fixed` | `11.000 đ` | `TRUE` |
| `CB_03` | Combo 3 | `139.000 đ` | 85 | `14.000 đ` | `fixed` | `14.000 đ` | `TRUE` |
| `CB_04` | Combo 4 | `179.000 đ` | 95 | `18.000 đ` | `fixed` | `18.000 đ` | `TRUE` |
| `CB_05` | Combo 5 | `219.000 đ` | 110 | `22.000 đ` | `fixed` | `22.000 đ` | `TRUE` |

### 3.2. Quy Tắc Tương Tác:
- Mặc định khi mở tab Tạo Ca: Tự động chọn **Combo 1** (`64.000đ` • `50 phút`).
- Hàng nút bấm nhanh hiển thị đủ các nút: `[ Combo Bé ]` `[ Combo 1 ]` `[ Combo 2 ]` `[ Combo 3 ]` `[ Combo 4 ]` `[ Combo 5 ]`.
- Bấm vào nút $
ightarrow$ Thêm vào giỏ hàng và ẩn khỏi Dropdown. Bấm lại lần nữa $
ightarrow$ Hủy chọn (Toggle).

---


### 3.3. Quản Lý Nhãn Động Qua Google Sheets (`tb_config`):
- **`opt_select_service`**: `-- Chọn thêm dịch vụ / sản phẩm --` (Chữ mặc định của dropdown chọn dịch vụ khi còn món để chọn).
- **`opt_select_service_all_selected`**: `-- Tất cả dịch vụ đã được chọn --` (Chữ hiển thị khi giỏ đã chọn toàn bộ các món trong menu).
- Cả 2 nhãn này được kết nối động trực tiếp với bảng `tb_config`, cho phép Chủ Tiệm thay đổi câu chữ bất cứ lúc nào từ Google Sheets mà không cần sửa code.

## 4. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_menu`
  - Cột 1: `service_id`
  - Cột 2: `service_name`
  - Cột 3: `price`
  - Cột 4: `duration_min`
  - Cột 5: `cosmetics_cost`
  - Cột 6: `commission_type`
  - Cột 7: `commission_value`
  - Cột 8: `is_active`

---

## 5. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Khởi tạo component chọn combo.
- `2026-09-01` (`v0.0.2.1`):
- `2026-09-01` (`v0.0.2.4`):
- `2026-09-01` (`v0.0.2.5`):
- `2026-09-01` (`v0.0.2.6`):
- `2026-09-01` (`v0.0.2.7`): Tái thiết kế toàn bộ cụm chọn dịch vụ POS thoáng đãng, nâng cấp khoảng cách `my-3` và thẻ dịch vụ sang trọng. Bổ sung các đường nét đứt (dash) phân cách các tầng và đóng khung hộp nổi bật cho dòng Tổng cộng. Đưa hàng chọn nhanh Combo 1-5 lên trên cùng, ẩn Combo Bé khỏi nút chọn nhanh, mở rộng khu vực dịch vụ đã chọn không đóng khung. Bổ sung cấu hình động nhãn dropdown `opt_select_service` vào bảng `tb_config`. Cập nhật chính xác 100% danh mục Menu của tiệm (Combo Bé 45k 30p, Combo 1 64k 50p, Combo 2 109k 75p, Combo 3 139k 85p, Combo 4 179k 95p, Combo 5 219k 110p) và cấu trúc 8 cột bảng `tb_menu`.
