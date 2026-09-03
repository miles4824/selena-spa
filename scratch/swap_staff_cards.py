# -*- coding: utf-8 -*-
import os
import re

BASE_DIR = r"c:\Users\Miles\Downloads\Selena"
NEW_VERSION = "v0.1.4.9"

# 1. Update docs
doc_path = os.path.join(BASE_DIR, "docs", "Home", "home_dashboard.md")
with open(doc_path, "r", encoding="utf-8") as f:
    doc_content = f.read()

new_audit = f"""## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-03` (`{NEW_VERSION}`):
  + Đảo vị trí 2 thẻ thành tích hôm nay của KTV: Thẻ 'Tour hôm nay' (Xanh dương) nằm bên trái, Thẻ 'Thu nhập hôm nay' (Xanh mint) nằm bên phải.
- `2026-09-03` (`v0.1.4.8`):"""

doc_content = doc_content.replace(
    "## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)\n- `2026-09-03` (`v0.1.4.8`):",
    new_audit
)
with open(doc_path, "w", encoding="utf-8") as f:
    f.write(doc_content)

# 2. Swap cards in views/staff/home.html
staff_home_path = os.path.join(BASE_DIR, "views", "staff", "home.html")
with open(staff_home_path, "r", encoding="utf-8") as f:
    staff_html = f.read()

swapped_cards = """    <div class="grid grid-cols-2 gap-3 sm:gap-4">
      <!-- 1. Tour hôm nay (Màu xanh dương pastel) -->
      <div class="p-4 sm:p-5 rounded-3xl bg-[#EBF5FB] border border-[#D4E6F1] space-y-1 shadow-xs">
        <span class="text-xs font-bold text-[#2980B9] uppercase tracking-wider block">Tour hôm nay</span>
        <div class="text-2xl sm:text-3xl font-extrabold text-[#2D2424]" id="home-today-tours">0 tour</div>
        <span class="text-xs text-[#2980B9] font-medium block">Phục vụ trong ngày</span>
      </div>

      <!-- 2. Thu nhập hôm nay (Màu xanh ngọc mint) -->
      <div class="p-4 sm:p-5 rounded-3xl bg-[#E8F8F5] border border-[#B7EBDD] space-y-1 shadow-xs">
        <div class="flex items-center gap-1.5">
          <span class="text-xs font-bold text-[#2E7D6D] uppercase tracking-wider block">Thu nhập hôm nay</span>
          <button type="button" onclick="toggleStaffHomeCommPrivacy()" class="text-[#2E7D6D]/70 hover:text-[#2E7D6D] p-0.5 cursor-pointer transition" title="Bấm để ẩn/hiện số tiền">
            <i id="staff-home-comm-eye" data-lucide="eye-off" class="w-3.5 h-3.5"></i>
          </button>
        </div>
        <div onclick="toggleStaffHomeCommPrivacy()" class="text-2xl sm:text-3xl font-extrabold font-mono text-[#2D2424] tracking-tight cursor-pointer select-none" id="home-today-comm">•••• đ</div>
        <span class="text-xs text-[#2E7D6D] font-medium block">Hoa hồng + Tip tích lũy</span>
      </div>
    </div>"""

# Match existing grid block
staff_html = re.sub(
    r'<div class="grid grid-cols-2 gap-3 sm:gap-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/main>',
    swapped_cards + "\n  </div>\n</main>",
    staff_html
)

with open(staff_home_path, "w", encoding="utf-8") as f:
    f.write(staff_html)

# 3. Bump version
idx_file = os.path.join(BASE_DIR, "index.html")
with open(idx_file, "r", encoding="utf-8") as f:
    html = f.read()
html = re.sub(r"\?v=v0\.1\.4\.8", f"?v={NEW_VERSION}", html)
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

print(f"DONE SWAPPING CARDS TO {NEW_VERSION}!")
