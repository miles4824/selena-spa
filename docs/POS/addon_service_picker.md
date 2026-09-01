# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: CỤM DỊCH VỤ LẺ & LÀM THÊM (STANDALONE & ADD-ON SERVICES)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Cho phép chọn các dịch vụ lẻ độc lập hoặc làm thêm kết hợp cùng combo.
- Tất cả dịch vụ lẻ được quản lý tập trung trong bảng `tb_menu` trên Google Sheets.

---

## 2. Danh Mục Dịch Vụ Lẻ Tiêu Chuẩn Trong `tb_menu`:
- `DV01`: **Massage Cổ Vai Gáy Chuyên Sâu** (`50.000đ` • `20 phút`)
- `DV02`: **Tẩy Tế Bào Chết Da Đầu Thảo Dược** (`40.000đ` • `15 phút`)
- `DV03`: **Đắp Mặt Nạ Thảo Mộc / Collagen** (`30.000đ` • `10 phút`)
- `DV04`: **Xông Hơi Tinh Dầu Trị Liệu** (`35.000đ` • `15 phút`)
- `DV05`: **Massage Nâng Cơ Mặt Ngọc Thạch** (`60.000đ` • `20 phút`)

---

## 3. Quy Tắc Tương Tác & Giao Diện
- Hiển thị trong Dropdown chọn dịch vụ dưới nhóm `✨ Dịch Vụ Lẻ / Làm Thêm`.
- Khi chọn $ightarrow$ Tự động thêm vào danh sách **DỊCH VỤ ĐÃ CHỌN** và **ẨN KHỎI DROPDOWN**.
- Khi bấm nút `[✕]` xóa $ightarrow$ **TỰ ĐỘNG HIỆN LẠI TRONG DROPDOWN**.

---

## 4. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Khởi tạo tài liệu.
- `2026-09-01` (`v0.0.1.8`): Đồng nhất dịch vụ lẻ vào giỏ hàng chung của POS, ẩn/hiện động trong dropdown.
