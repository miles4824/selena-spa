# -*- coding: utf-8 -*-
import os
import re

BASE_DIR = r"c:\Users\Miles\Downloads\Selena"
NEW_VERSION = "v0.1.4.3"

# =========================================================================
# 1. UPDATE docs/Home/home_dashboard.md (Rule 12 Docs-First)
# =========================================================================
doc_path = os.path.join(BASE_DIR, "docs", "Home", "home_dashboard.md")
with open(doc_path, "r", encoding="utf-8") as f:
    doc_content = f.read()

new_audit = f"""## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-03` (`{NEW_VERSION}`): Cập nhật class CSS cho `#staff-home-status-desc`: bỏ `text-xs sm:text-sm`, đặt cố định `text-sm` giúp kích thước chữ mô tả trạng thái tour rõ ràng, dễ đọc trên cả màn hình di động lẫn máy tính để bàn.
- `2026-09-03` (`v0.1.4.2`):"""

doc_content = doc_content.replace(
    "## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)\n- `2026-09-03` (`v0.1.4.2`):",
    new_audit
)
with open(doc_path, "w", encoding="utf-8") as f:
    f.write(doc_content)

# =========================================================================
# 2. UPDATE views/staff/home.html
# =========================================================================
staff_home_path = os.path.join(BASE_DIR, "views", "staff", "home.html")
with open(staff_home_path, "r", encoding="utf-8") as f:
    staff_home_html = f.read()

staff_home_html = staff_home_html.replace(
    '<p class="text-[#7E7272] text-xs sm:text-sm max-w-md leading-relaxed" id="staff-home-status-desc">',
    '<p class="text-[#7E7272] text-sm max-w-md leading-relaxed" id="staff-home-status-desc">'
)

with open(staff_home_path, "w", encoding="utf-8") as f:
    f.write(staff_home_html)

# =========================================================================
# 3. BUMP VERSION ACROSS APP
# =========================================================================
idx_file = os.path.join(BASE_DIR, "index.html")
with open(idx_file, "r", encoding="utf-8") as f:
    html = f.read()
html = re.sub(r"\?v=\d+\.\d+\.\d+\.\d+(\.\d+)?", f"?v={NEW_VERSION}", html)
html = re.sub(r"\?v=v\d+\.\d+\.\d+\.\d+(\.\d+)?", f"?v={NEW_VERSION}", html)
with open(idx_file, "w", encoding="utf-8") as f:
    f.write(html)

cfg_file = os.path.join(BASE_DIR, "js", "config.js")
with open(cfg_file, "r", encoding="utf-8") as f:
    cfg = f.read()
cfg = re.sub(r"const APP_VERSION = '[^']+';", f"const APP_VERSION = '{NEW_VERSION}';", cfg)
with open(cfg_file, "w", encoding="utf-8") as f:
    f.write(cfg)

login_file = os.path.join(BASE_DIR, "views", "login.html")
with open(login_file, "r", encoding="utf-8") as f:
    l_html = f.read()
l_html = re.sub(r"v\d+\.\d+\.\d+\.\d+(\.\d+)? • Selena Spa[^<]*", f"{NEW_VERSION} • Selena Spa", l_html)
with open(login_file, "w", encoding="utf-8") as f:
    f.write(l_html)

print(f"DONE {NEW_VERSION}!")
