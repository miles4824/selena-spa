# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: CỤM DỊCH VỤ LẺ & PHÂN NHÓM DROPDOWN (SERVICE PICKER)

## 1. Mục Đích & Bối Cảnh Thực Tế Tại Tiệm
- Quản lý toàn bộ 42 dịch vụ thực tế của Selena Spa được nạp từ bảng `tb_menu` trên Google Sheets.
- Tự động phân chia thành **7 nhóm chuyên mục rõ ràng, trực quan** trong menu dropdown thả xuống giúp KTV tìm kiếm và chọn nhanh chóng:
  1. `CB_...`: **💆 Gói Combo Gội Chính**
  2. `DV_TM...`: **🌿 Dịch Vụ Làm Thêm / Da Đầu** (Tẩy tế bào chết, Xông tai nến, Xông hơi da đầu, Đắp mặt nạ, Gội đầu thêm)
  3. `DV_MS...`: **💆 Massage Trị Liệu & Thư Giãn** (Massage body đá nóng, Tay, Chân, Lưng, Cổ vai gáy, Mặt, Đầu, Trán...)
  4. `DV_WX...`: **✨ Dịch Vụ Waxing** (Wax nách, 1/2 tay, Full tay, 1/2 chân, Full chân, Bikini)
  5. `DV_PL...`: **🩺 Nặn Mụn & Peel Trị Liệu** (Nặn mụn chuẩn y khoa, Peel mụn, Peel TCA, Peel Tảo Ý, Peel phục hồi, Peel trắng da, Peel nám, Peel thâm nách, Peel lưng - mông)
  6. `DV_DT...`: **🧪 Dịch Vụ Detox** (CO2 Therapy, Deepclean detox đu đủ, Detox than tre)
  7. `DV_CY...`: **💎 Dịch Vụ Cấy Dưỡng Chuyên Sâu** (Cấy tảo xoắn nano, Cấy hồng sâm, Cấy trắng, Cấy trắng căng bóng)

---

## 2. Danh Sách File Cấu Thành
- **Giao diện Dropdown**: `views/add.html` & `views/components/modals/modal_edit_live_services.html`
- **Xử lý Logic Render**: `js/Add/pos_checkout.js`
- **Dữ liệu Menu**: `js/config.js` (`DEFAULT_MENU`) & Google Sheets `tb_menu`.

---

## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-01` (`v0.0.3.4`): Đồng bộ danh mục mở rộng.
- `2026-09-02` (`v0.0.5.1`): Phân chia chuyên sâu 7 danh mục chuyên biệt trong menu dropdown với tiêu đề và icon sắc nét.
