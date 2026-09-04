# -*- coding: utf-8 -*-
import os

BASE_DIR = r"c:\Users\Miles\Downloads\Selena"

# 1. Update PROJECT_RULES.md
rules_path = os.path.join(BASE_DIR, "PROJECT_RULES.md")
with open(rules_path, "r", encoding="utf-8") as f:
    text = f.read()

dom_rules = """
5. **Quy Chuẩn Chống Nóng Máy, Tràn RAM & Tối Ưu Hóa DOM (DOM & Memory Optimization Rules)**:
   - **Tuyệt đối không nhồi nhét dữ liệu lớn vào thuộc tính DOM**: Thẻ HTML chỉ lưu trữ ID định danh ngắn (như `sessionId`, `receiptId`), không bao giờ nhét cả chuỗi JSON dữ liệu lớn vào thuộc tính `data-*` gây phình to cây DOM và rò rỉ bảo mật.
   - **Chống rò rỉ bộ nhớ (Memory Leaks)**: Sử dụng cơ chế hành động ủy quyền hoặc gọi hàm trực tiếp (`onclick="handleFunc()"`) thay vì gán `addEventListener` vô tội vạ trong các hàm render lặp lại làm tràn RAM thiết bị.
   - **Cập nhật trúng đích cục bộ (Targeted DOM Mutation)**: Khi dữ liệu từ Google Sheets (`tb_config`) hoặc Firebase Realtime bắn về, hệ thống chỉ cập nhật chính xác phần tử DOM cần đổi (bằng `innerText` hoặc `textContent`), tuyệt đối không xóa đi vẽ lại toàn bộ trang web gây giật lag hoặc hao pin.
"""

if "5. **Quy Chuẩn Chống Nóng Máy" not in text:
    text = text.strip() + "\n" + dom_rules
    with open(rules_path, "w", encoding="utf-8") as f:
        f.write(text)
    print("Updated PROJECT_RULES.md with Item 5 DOM rules!")

# 2. Update docs/Core/ui_system.md
doc_path = os.path.join(BASE_DIR, "docs", "Core", "ui_system.md")
with open(doc_path, "r", encoding="utf-8") as f:
    doc_text = f.read()

doc_addition = """
---

## 5. Quy Chuẩn Hiệu Năng & An Toàn Bộ Nhớ (Performance & DOM Best Practices)
1. **Zero-Lag DOM Updates**:
   - Sử dụng phương thức Render Cách 2: Dựng khối hoàn chỉnh trong RAM và ghi vào DOM đúng 1 lần (`innerHTML` duy nhất).
   - Khi có thay đổi từ Google Sheets / Firebase: Chỉ cập nhật trúng đích thẻ chứa giá trị đó (`element.innerText = newValue`), không vẽ lại layout.
2. **Chống Rò Rỉ Bộ Nhớ (Zero Memory Leaks)**:
   - Sử dụng `onclick="..."` để DOM tự thu gom rác (Garbage Collection) khi thẻ bị thay thế.
3. **An Toàn Dữ Liệu**:
   - Chỉ truyền ID đối tượng qua các hàm giao diện, dữ liệu chi tiết được truy xuất từ RAM (`getStored()`).
"""

if "## 5. Quy Chuẩn Hiệu Năng" not in doc_text:
    doc_text = doc_text.replace("## 5. Ánh Xạ Cơ Sở Dữ Liệu & Config (`tb_config`)", doc_addition + "\n## 6. Ánh Xạ Cơ Sở Dữ Liệu & Config (`tb_config`)")
    doc_text = doc_text.replace("## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)", "## 7. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)")
    with open(doc_path, "w", encoding="utf-8") as f:
        f.write(doc_text)
    print("Updated docs/Core/ui_system.md with performance guidelines!")
