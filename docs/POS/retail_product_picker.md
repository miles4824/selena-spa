# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: CỤM CHỌN MỸ PHẨM BÁN KÈM (RETAIL PRODUCTS)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Khi khách mua thêm mỹ phẩm chăm sóc tóc mang về (Dầu gội bưởi 180k, Serum bưởi kích mọc tóc 250k), KTV chọn thêm vào bill để thanh toán chung một lần.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/pos/combo_section.html`
- **File JS Xử lý giao diện**: `js/Components/POS/retail_product_picker.js`
- **Hàm Tính Tiền**: `js/Core/Menu/service_pricing.js`

## 3. Quy Tắc Giao Diện & Kịch Bản Phân Quyền Chi Tiết (UI Scenarios & Permissions)
- Hiển thị icon chai dầu gội `🧴` và giá bán niêm yết.
- Không cộng dồn vào thời lượng gội đầu của ca (vì là sản phẩm mang về).

## 4. Luồng Xử Lý Logic & Hành Vi Hệ Thống (Business Logic)
- Cộng tiền sản phẩm vào tổng hóa đơn thanh toán `total_paid`.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_menu` (dòng có `category = "product"`).
- **Ghi vào `tb_receipts`**: Cột L (`total_paid`).

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Khởi tạo component quản lý sản phẩm bán lẻ.
