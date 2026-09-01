# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: CỤM CHỌN DỊCH VỤ COMBO CHÍNH (COMBO PICKER)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Quản lý danh mục Combo gội chuẩn xác của Selena Spa, nạp 100% từ bảng `tb_menu` trên Google Sheets.
- Cho phép chọn nhanh 1 chạm qua hàng nút Pills hoặc chọn từ Multi-Select Tag Dropdown.

---

## 2. Danh Mục Combo Niêm Yết Tại Tiệm (tb_menu):
| `service_id` | `service_name` | `price` | `duration_min` | `cosmetics_cost` | `commission_type` | `commission_value` | `is_active` |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `CB_BE` | Combo Bé | 45000 | 30 | 4500 | fixed | 4500 | TRUE |
| `CB_01` | Combo 1 | 64000 | 50 | 6400 | fixed | 6400 | TRUE |
| `CB_02` | Combo 2 | 109000 | 75 | 10000 | fixed | 11000 | TRUE |
| `CB_03` | Combo 3 | 139000 | 85 | 14000 | fixed | 14000 | TRUE |
| `CB_04` | Combo 4 | 179000 | 95 | 18000 | fixed | 18000 | TRUE |
| `CB_05` | Combo 5 | 219000 | 110 | 22000 | fixed | 22000 | TRUE |

---

## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.3.3`): Nâng cấp thanh Tổng Thanh Toán sang trọng.
- `2026-09-01` (`v0.0.3.4`):
- `2026-09-01` (`v0.0.3.5`): Nâng cấp thẻ Chip dịch vụ 2 dòng với icon căn giữa và thanh trigger thêm dịch vụ tách biệt thoáng đãng. Đồng bộ toàn bộ danh mục thực đơn đầy đủ của tiệm (Combo, Thêm, Massage, Waxing, Nặn Mụn & Peel, Detox, Cấy Dưỡng).
