# -*- coding: utf-8 -*-
import os

BASE_DIR = r"c:\Users\Miles\Downloads\Selena"

# 1. Update PROJECT_RULES.md
rules_path = os.path.join(BASE_DIR, "PROJECT_RULES.md")
with open(rules_path, "r", encoding="utf-8") as f:
    text = f.read()

modal_rule = """
6. **Quy Chuẩn Thiết Kế Popup Modal Chuẩn Mobile (`ModalShell`)**:
   - **Header ghim chặt trên đỉnh (Sticky Top)**: Luôn cố định tiêu đề và nút đóng tròn ✕ để người dùng có thể đóng modal bất kỳ lúc nào mà không bị trôi khi cuộn.
   - **Body cuộn tự do ở giữa (Scrollable Center)**: Cuộn mượt mà với `overflow-y-auto overscroll-contain flex-1`.
   - **Footer ghim chặt dưới đáy (Sticky Bottom)**: Luôn hiển thị sẵn các nút bấm hành động (`AppButton` Lưu / Hủy / Xác nhận) để người dùng bấm ngay mà không cần phải cuộn chuột xuống đáy.
   - **Chiều cao tối đa thông minh**: Giới hạn trong khoảng `max-h-[calc(100dvh-48px)]` trừ khoảng đệm trên dưới vừa mắt, bo góc cong chuẩn `rounded-[28px]` và lớp phủ mờ `backdrop-blur-sm`.
"""

if "6. **Quy Chuẩn Thiết Kế Popup Modal Chuẩn Mobile" not in text:
    text = text.strip() + "\n" + modal_rule
    with open(rules_path, "w", encoding="utf-8") as f:
        f.write(text)
    print("Updated PROJECT_RULES.md with Item 6 ModalShell rules!")

# 2. Update docs/Core/ui_system.md
doc_path = os.path.join(BASE_DIR, "docs", "Core", "ui_system.md")
with open(doc_path, "r", encoding="utf-8") as f:
    doc_text = f.read()

modal_doc = """
### D. Component `ModalShell`
- **Cấu trúc chuẩn 3 tầng**:
  + **Tầng 1 (Header Sticky)**: Ghim chặt trên đỉnh với icon, tiêu đề và nút đóng ✕ tròn `w-8 h-8 rounded-full`.
  + **Tầng 2 (Body Scrollable)**: Cuộn mượt ở giữa với `overflow-y-auto overscroll-contain flex-1`.
  + **Tầng 3 (Footer Sticky)**: Ghim chặt ở đáy chứa các nút bấm hành động (`AppButton`).
- **Kích thước**: `max-h-[calc(100dvh-48px)]`, bo góc `rounded-[28px]`, viền `#F0EAE1`, đổ bóng `shadow-2xl`.

### E. Component `RoleBadge`
- `role: 'owner'`: Nền vàng hoàng gia `bg-[#FEF9C3] text-[#854D0E] border border-[#FEF08A]` kèm nhãn `👑 Chủ Sáng Lập`.
- `role: 'staff'`: Nền cam đào nhạt `bg-[#FFF0EB] text-[#E58A7B] border border-[#FCDFD7]` kèm nhãn `💆 Kỹ Thuật Viên`.

### F. Component `BedCard`
- Quy chuẩn thẻ giường trực tiếp trên Admin Home: Tên giường (Giường số 01, 02...), tên khách, dịch vụ, thanh % thời gian chạy động, nhấp nháy đỏ khi lố giờ (`animate-pulse`), và nút bấm vào xem ca.
"""

if "### D. Component `ModalShell`" not in doc_text:
    doc_text = doc_text.replace("---", modal_doc + "\n---", 1)
    with open(doc_path, "w", encoding="utf-8") as f:
        f.write(doc_text)
    print("Updated docs/Core/ui_system.md with ModalShell, RoleBadge, BedCard!")
