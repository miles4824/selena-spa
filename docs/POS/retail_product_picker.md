# 📌 ĐẶC TẢ CHI TIẾT: CỤM CHỌN SẢN PHẨM BÁN KÈM (RETAIL PRODUCTS)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Khi khách mua thêm mỹ phẩm mang về (Dầu gội bưởi 180k, Serum kích mọc tóc 250k), KTV chọn thêm vào bill để thanh toán chung một lần.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/pos/combo_section.html`
- **File JS Xử lý**: `js/Components/POS/retail_product_picker.js`
- **Hàm Tính Tiền**: `js/Core/Menu/service_pricing.js`

## 3. Quy Tắc Giao Diện & Phân Quyền Chi Tiết (UI & Permissions)
- Hiển thị icon chai dầu gội `🧴` và giá bán niêm yết.
- Không cộng dồn vào thời lượng gội đầu (vì là sản phẩm mang về).

## 4. Luồng Xử Lý Logic & Công Thức Toán Học (Business Logic)
- Cộng tiền sản phẩm vào tổng hóa đơn thanh toán của khách.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_menu` (dòng có `category = "product"`).
- **Ghi vào `tb_receipts`**: Cột L (`total_paid`).

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Khởi tạo component quản lý sản phẩm bán lẻ.
