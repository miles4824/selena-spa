# -*- coding: utf-8 -*-
import os
import re

BASE_DIR = r"c:\Users\Miles\Downloads\Selena"
NEW_VERSION = "v0.1.4.8"

# =========================================================================
# 1. UPDATE docs/Home/home_dashboard.md (Rule 12 Docs-First)
# =========================================================================
doc_path = os.path.join(BASE_DIR, "docs", "Home", "home_dashboard.md")
with open(doc_path, "r", encoding="utf-8") as f:
    doc_content = f.read()

new_audit = f"""## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-03` (`{NEW_VERSION}`):
  + Tinh chỉnh cụm thành tích hôm nay của KTV đồng bộ 100% với giao diện Admin (Hình 2):
    - Bỏ `text-center`, canh lề trái dồn về 1 bên chuẩn chỉ.
    - Đổi màu sắc thẻ và viền y hệt Admin: Thẻ Thu Nhập màu xanh ngọc mint `#E8F8F5` / viền `#B7EBDD`, Thẻ Tour màu xanh dương pastel `#EBF5FB` / viền `#D4E6F1`.
    - Bỏ dấu `+` trước số tiền thu nhập (`40.844 đ` thay vì `+40.844 đ`, khi che là `•••• đ`).
    - Cập nhật ghi chú "Trong ngày" thành "Phục vụ trong ngày".
- `2026-09-03` (`v0.1.4.7`):"""

doc_content = doc_content.replace(
    "## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)\n- `2026-09-03` (`v0.1.4.7`):",
    new_audit
)
with open(doc_path, "w", encoding="utf-8") as f:
    f.write(doc_content)

# =========================================================================
# 2. UPDATE views/staff/home.html
# =========================================================================
staff_home_path = os.path.join(BASE_DIR, "views", "staff", "home.html")
with open(staff_home_path, "r", encoding="utf-8") as f:
    staff_html = f.read()

old_cards_block = """    <div class="grid grid-cols-2 gap-3 sm:gap-4">
      <!-- 1. Số tour hôm nay -->
      <div class="bg-white rounded-3xl border border-[#F0EAE1] p-4 sm:p-5 text-center space-y-1.5 bg-[#EBF5FB] border-[#D4E6F1] shadow-2xs">
        <span class="text-xs sm:text-sm font-bold text-[#2980B9] uppercase tracking-wider block">Tour hôm nay</span>
        <div class="text-2xl sm:text-3xl font-black text-[#2D2424]" id="home-today-tours">0 tour</div>
        <span class="text-[11px] text-[#2980B9]/80 block font-medium">Trong ngày</span>
      </div>

      <!-- 2. Thu nhập hôm nay (Hoa hồng + Tiền Tip, kèm con mắt che/hiện) -->
      <div class="bg-white rounded-3xl border border-[#F0EAE1] p-4 sm:p-5 text-center space-y-1.5 bg-[#E8F8F5] border-[#B7EBDD] shadow-2xs">
        <div class="flex items-center justify-center gap-1.5">
          <span class="text-xs sm:text-sm font-bold text-[#2E7D6D] uppercase tracking-wider block">Thu nhập hôm nay</span>
          <button type="button" onclick="toggleStaffHomeCommPrivacy()" class="text-[#2E7D6D]/70 hover:text-[#2E7D6D] p-0.5 cursor-pointer transition" title="Bấm để ẩn/hiện số tiền">
            <i id="staff-home-comm-eye" data-lucide="eye-off" class="w-4 h-4"></i>
          </button>
        </div>
        <div onclick="toggleStaffHomeCommPrivacy()" class="text-2xl sm:text-3xl font-black font-mono text-[#2D2424] tracking-tight cursor-pointer select-none" id="home-today-comm">+•••• đ</div>
        <span class="text-[11px] text-[#2E7D6D]/80 block font-medium">Hoa hồng + Tip tích lũy</span>
      </div>
    </div>"""

new_cards_block = """    <div class="grid grid-cols-2 gap-3 sm:gap-4">
      <!-- 1. Thu nhập hôm nay (Màu xanh ngọc mint giống Admin hình 2, dồn về bên trái) -->
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

      <!-- 2. Tour hôm nay (Màu xanh dương pastel giống Admin hình 2, dồn về bên trái) -->
      <div class="p-4 sm:p-5 rounded-3xl bg-[#EBF5FB] border border-[#D4E6F1] space-y-1 shadow-xs">
        <span class="text-xs font-bold text-[#2980B9] uppercase tracking-wider block">Tour hôm nay</span>
        <div class="text-2xl sm:text-3xl font-extrabold text-[#2D2424]" id="home-today-tours">0 tour</div>
        <span class="text-xs text-[#2980B9] font-medium block">Phục vụ trong ngày</span>
      </div>
    </div>"""

staff_html = staff_html.replace(old_cards_block, new_cards_block)
with open(staff_home_path, "w", encoding="utf-8") as f:
    f.write(staff_html)

# =========================================================================
# 3. UPDATE js/Home/home_dashboard.js (Bỏ dấu + trước số tiền thu nhập)
# =========================================================================
dash_path = os.path.join(BASE_DIR, "js", "Home", "home_dashboard.js")
with open(dash_path, "r", encoding="utf-8") as f:
    dash_code = f.read()

dash_code = dash_code.replace("commEl.innerText = '+•••• đ';", "commEl.innerText = '•••• đ';")
dash_code = dash_code.replace("commEl.innerText = `+${totalToday.toLocaleString('vi-VN')} đ`;", "commEl.innerText = `${totalToday.toLocaleString('vi-VN')} đ`;")

with open(dash_path, "w", encoding="utf-8") as f:
    f.write(dash_code)

# =========================================================================
# 4. BUMP VERSION ACROSS PROJECT
# =========================================================================
idx_file = os.path.join(BASE_DIR, "index.html")
with open(idx_file, "r", encoding="utf-8") as f:
    html = f.read()
html = re.sub(r"\?v=v0\.1\.4\.7", f"?v={NEW_VERSION}", html)
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

print(f"DONE SYNCING TO {NEW_VERSION}!")
