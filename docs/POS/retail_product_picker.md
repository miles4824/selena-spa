# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: CỤM CHỌN MỸ PHẨM BÁN KÈM (RETAIL PRODUCTS)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Khi khách hàng sau khi gội đầu xong có nhu cầu mua thêm mỹ phẩm chăm sóc tóc mang về nhà (Dầu gội bưởi, Serum kích mọc tóc, Tinh dầu dưỡng tóc...), KTV chọn thêm sản phẩm vào hóa đơn để thanh toán chung một lần tại quầy.

---

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/pos/retail_section.html` (Dự kiến)
- **File JS Xử lý giao diện**: `js/Components/POS/retail_product_picker.js`
- **Hàm Tính Tiền**: `js/Core/Menu/service_pricing.js`

---

## 3. Quy Tắc Giao Diện & Kịch Bản Nghiệp Vụ Đề Xuất (UI Scenarios & Permissions)

### 3.1. Danh Mục Mỹ Phẩm Bán Lẻ Dự Kiến:
1. 🧴 **Dầu Gội Bưởi Selena Spa 500ml**: `180.000đ`
2. 💧 **Serum Bưởi Kích Mọc Tóc 100ml**: `250.000đ`
3. 🌿 **Xịt Dưỡng Tóc Tinh Dầu Bưởi 150ml**: `120.000đ`
4. 💆 **Dầu Xả Phục Hồi Thảo Mộc 500ml**: `160.000đ`

### 3.2. Điểm Khác Biệt Cốt Lõi So Với Dịch Vụ Làm Thêm:
- ❌ **Không cộng dồn thời gian vào Đồng hồ đếm ngược (Live Timer)**: Vì đây là sản phẩm đóng chai mang về nhà, không tốn thêm thời gian gội tại giường của KTV.
- 🔢 **Có bộ tăng giảm số lượng**: Hỗ trợ nút `[-] [Số lượng: 1, 2, 3...] [+]`.
- 💰 **Hoa hồng bán lẻ riêng**: KTV tư vấn bán mỹ phẩm có thể được hưởng chính sách hoa hồng bán lẻ riêng (VD: 5% - 10% trên giá trị chai).

### 3.3. Hiển Thị Hóa Đơn (Receipt Breakdown):
- Trên hóa đơn thanh toán và báo cáo thu chi tách bạch 2 phần:
  - 💆 **Dịch Vụ Gội**: *Combo 1 + Massage Cổ Vai Gáy (114.000đ)*
  - 🧴 **Mỹ Phẩm Mang Về**: *1x Dầu Gội Bưởi (180.000đ)*
  - 💵 **Tổng Bill Thanh Toán**: *294.000đ*

---

## 4. Luồng Xử Lý Logic & Hành Vi Hệ Thống (Business Logic)
- Cộng tiền sản phẩm vào tổng hóa đơn thanh toán `total_paid`.
- Cập nhật tồn kho sản phẩm nếu có quản lý kho.

---

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_menu` (dòng có `category = "product"`).
- **Ghi vào `tb_receipts`**: Cột L (`retail_products`), Cột M (`total_paid`).

---

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.0.1`): Khởi tạo component quản lý sản phẩm bán lẻ.
- `2026-09-01` (`v0.0.1.6`): Hoàn thiện đề xuất kịch bản nghiệp vụ bán lẻ tách biệt với dịch vụ làm thêm.
