# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: THẺ TOUR LỊCH SỬ KTV (STAFF HISTORY CARD)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Hiển thị chi tiết từng ca gội KTV đã hoàn thành: thời gian, tên combo, tên bạn KTV cùng làm, tiền tour nhận được và tiền tip riêng của KTV đó.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/staff/history.html`
- **File JS Xử lý giao diện**: `js/Components/Cards/staff_history_card.js` & `js/History/routine_timeline.js`

## 3. Quy Tắc Giao Diện & Kịch Bản Phân Quyền Chi Tiết (UI Scenarios & Permissions)
- 👩‍🦰 **Quy tắc hiển thị cho KTV**:
  - Tên khách hàng có icon cây bút `edit-3` và đường gạch chân nét đứt $ightarrow$ Bấm vào mở `modal_staff_note.html`.
  - Hiển thị rõ ràng dòng: `KTV cùng làm: [Tên bạn làm cùng]` (nếu là ca làm chung).
  - Dùng đúng 2 nhãn chuẩn thân thiện: **`Tiền tour: +6.400 đ`** và **`Tiền tip: +20.000 đ`**.
  - SĐT luôn che `094*144`.

## 4. Luồng Xử Lý Logic & Hành Vi Hệ Thống (Business Logic)
- Lọc trong `tb_payroll_logs` lấy đúng các dòng có `staff_phone` trùng với SĐT KTV đang đăng nhập.
- Tổng thu nhập ca = `commission_amount + tip_amount`.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_payroll_logs` (19 cột).

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Bóc tách thành component độc lập và phục hồi icon sửa ghi chú khách hàng.
