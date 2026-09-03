# -*- coding: utf-8 -*-
import os

BASE_DIR = r"c:\Users\Miles\Downloads\Selena"

# 1. Update PROJECT_RULES.md
rules_path = os.path.join(BASE_DIR, "PROJECT_RULES.md")
with open(rules_path, "r", encoding="utf-8") as f:
    text = f.read()

rule15_marker = "## 🧩 15. NGUYÊN TẮC HỆ THỐNG UI SYSTEM & REUSABLE COMPONENTS (TAILWIND 4 COMPONENT-DRIVEN)"
rule15_content = """## 🧩 15. NGUYÊN TẮC HỆ THỐNG UI SYSTEM & REUSABLE COMPONENTS (TAILWIND 4 COMPONENT-DRIVEN)
Nhằm đảm bảo giao diện thống nhất $100\%$ giữa Admin và Staff, dễ dàng tùy biến giao diện bằng **Tailwind 4** mà **chỉ cần sửa đúng 1 nơi duy nhất**, toàn bộ dự án tuân thủ các quy chuẩn sau:

1. **Kiến Trúc Module Tách Biệt Theo File Độc Lập (`js/Core/Components/`)**:
   - Mỗi loại thành phần giao diện được đặt trong **1 file riêng biệt** mang tên thành phần đó (theo chuẩn snake_case):
     + `app_button.js`: Nút bấm hành động toàn app (`AppButton`).
     + `stat_card.js`: Thẻ số liệu & thành tích (`StatCard`).
     + `status_badge.js`: Huy hiệu trạng thái Sẵn sàng / Trong tour (`StatusBadge`).
     + `app_title.js`: Chuẩn hóa kiểu dáng tiêu đề toàn hệ thống (`AppTitle`).
     + `role_badge.js`: Huy hiệu vai trò Chủ tiệm / KTV (`RoleBadge`).
     + `bed_card.js`: Thẻ giám sát giường trực tiếp (`BedCard`).
     + `home_banner.js`: Khung banner chào đón (`HomeBanner`).
     + `modal_shell.js`: Khung nền popup chuẩn (`ModalShell`).
   - Tuyệt đối không gộp chung toàn bộ component vào 1 file khổng lồ khó quản lý.

2. **Nguyên Tắc Phân Tách Trách Nhiệm (Decoupling Giao Diện vs Dữ Liệu/Hành Động)**:
   - **Component chỉ quản lý GIAO DIỆN**: Màu sắc Tailwind 4, bo góc, hiệu ứng hover/active, bóng đổ, icon.
   - **Nơi gọi component truyền vào DỮ LIỆU & HÀNH ĐỘNG**:
     + `text` hoặc `configKey`: Câu chữ hiển thị (gõ trực tiếp hoặc lấy tự động từ `tb_config` trên Google Sheets).
     + `onClick`: Hành động khi bấm (hàm chuyển tab `showView`, mở modal, thanh toán...).
     + `variant` / `color` / `size` / `level`: Chọn biến thể hiển thị theo ngữ cảnh.

3. **Mô Hình Khung Xương & Nội Thất (Hybrid Architecture với `views/`)**:
   - Thư mục `views/` giữ các file HTML đóng vai trò **khung sườn (Layout Skeleton)** với các hộp `<div>` rỗng sạch sẽ.
   - JavaScript Component chịu trách nhiệm "bơm nội thất" chi tiết vào các hộp đó khi nạp trang.

4. **Phương Thức Render Chuẩn (Cách 2 - Kẹp Chung Nguyên Khối Template Literals `${...}`)**:
   - Toàn bộ các component con (như `${AppTitle()}`, `${StatCard()}`, `${AppButton()}`) được nhúng trực tiếp trong cùng một khối chuỗi Template Literals `${...}`.
   - Chỉ thực hiện **1 lần ghi DOM duy nhất (Single DOM Write)** qua `innerHTML` cho cả cụm để đạt hiệu năng tối ưu (<1ms), triệt tiêu hoàn toàn hiện tượng chớp tắt (FOUC), không gây nóng máy và bảo vệ pin thiết bị di động tối đa.
"""

if rule15_marker in text:
    prefix = text.split(rule15_marker)[0]
    new_text = prefix + rule15_content
    with open(rules_path, "w", encoding="utf-8") as f:
        f.write(new_text)
    print("Updated PROJECT_RULES.md successfully!")

# 2. Update docs/Core/ui_system.md
doc_path = os.path.join(BASE_DIR, "docs", "Core", "ui_system.md")
with open(doc_path, "r", encoding="utf-8") as f:
    doc_text = f.read()

doc_text = doc_text.replace(
    "+ `js/Core/Components/status_badge.js`: Chuẩn huy hiệu trạng thái Bận/Rảnh (`StatusBadge`).",
    "+ `js/Core/Components/status_badge.js`: Chuẩn huy hiệu trạng thái Bận/Rảnh (`StatusBadge`).\n  + `js/Core/Components/app_title.js`: Chuẩn hóa kiểu dáng tiêu đề toàn hệ thống (`AppTitle`)."
)

render_method_doc = """## 4. Luồng Xử Lý Logic & Phân Tách Trách Nhiệm (Decoupling)
- **Phương thức Render chuẩn (Cách 2 - Template Literals)**:
  + Toàn bộ các component con (`${AppTitle()}`, `${StatCard()}`, `${AppButton()}`) được nhúng trực tiếp trong cùng một chuỗi template HTML `${...}`.
  + Chỉ gọi lệnh `innerHTML` **1 lần duy nhất cho cả cụm** $\rightarrow$ Trình duyệt chỉ vẽ đúng 1 lần (Single Paint), triệt tiêu 100% hiện tượng chớp tắt hay reflow giật hình, đạt tốc độ siêu tốc $<1\\text{ms}$.
- **Hỗ trợ Chữ Trực Tiếp & Chữ Động Từ Sheet**:
  + `text`: Chữ trực tiếp do lập trình viên truyền vào.
  + `configKey` & `defaultText`: Tự động kéo giá trị mới nhất từ `tb_config` trên Google Sheets, có sẵn chữ dự phòng an toàn nếu mạng chưa kịp tải."""

doc_text = doc_text.replace(
    "## 4. Luồng Xử Lý Logic & Phân Tách Trách Nhiệm (Decoupling)\n- **Component**: Nhận các tham số đầu vào (Props), trả về chuỗi HTML tĩnh sạch đẹp.\n- **Controller (Screens)**:\n  + Chịu trách nhiệm lấy dữ liệu (từ State, LocalStorage, Firebase hoặc `tb_config`).\n  + Quyết định gán hàm hành động nào (`showView`, `handleCompleteCheckout`...).",
    render_method_doc + "\n- **Controller (Screens)**:\n  + Chịu trách nhiệm lấy dữ liệu (từ State, LocalStorage, Firebase hoặc `tb_config`).\n  + Quyết định gán hàm hành động nào (`showView`, `handleCompleteCheckout`...).",
)

with open(doc_path, "w", encoding="utf-8") as f:
    f.write(doc_text)
print("Updated docs/Core/ui_system.md successfully!")
