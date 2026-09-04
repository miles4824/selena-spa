# -*- coding: utf-8 -*-
import os
import re

BASE_DIR = r"c:\Users\Miles\Downloads\Selena"
OLD_VERSION = "v0.0.0.2"
NEW_VERSION = "v0.0.0.3"

# =========================================================================
# 1. UPDATE index.html: Add modal_shell, role_badge, bed_card & bump version
# =========================================================================
idx_path = os.path.join(BASE_DIR, "index.html")
with open(idx_path, "r", encoding="utf-8") as f:
    idx_html = f.read()

# Replace version strings
idx_html = idx_html.replace(f"?v={OLD_VERSION}", f"?v={NEW_VERSION}")

# Add new script tags if not present
new_scripts = f"""  <script src="js/Core/Components/app_title.js?v={NEW_VERSION}"></script>
  <script src="js/Core/Components/role_badge.js?v={NEW_VERSION}"></script>
  <script src="js/Core/Components/bed_card.js?v={NEW_VERSION}"></script>
  <script src="js/Core/Components/modal_shell.js?v={NEW_VERSION}"></script>"""

if "js/Core/Components/modal_shell.js" not in idx_html:
    old_target = f'<script src="js/Core/Components/app_title.js?v={NEW_VERSION}"></script>'
    idx_html = idx_html.replace(old_target, new_scripts)

with open(idx_path, "w", encoding="utf-8") as f:
    f.write(idx_html)

# =========================================================================
# 2. UPDATE js/config.js: Bump APP_VERSION
# =========================================================================
cfg_path = os.path.join(BASE_DIR, "js", "config.js")
with open(cfg_path, "r", encoding="utf-8") as f:
    cfg = f.read()
cfg = re.sub(r"const APP_VERSION = '[^']+';", f"const APP_VERSION = '{NEW_VERSION}';", cfg)
with open(cfg_path, "w", encoding="utf-8") as f:
    f.write(cfg)

# =========================================================================
# 3. UPDATE views/login.html: Bump version
# =========================================================================
login_path = os.path.join(BASE_DIR, "views", "login.html")
with open(login_path, "r", encoding="utf-8") as f:
    login_html = f.read()
login_html = re.sub(r"v\d+\.\d+\.\d+\.\d+(\.\d+)? • Selena Spa[^<]*", f"{NEW_VERSION} • Selena Spa", login_html)
with open(login_path, "w", encoding="utf-8") as f:
    f.write(login_html)

# =========================================================================
# 4. UPDATE docs/Core/ui_system.md: Bump version
# =========================================================================
doc_path = os.path.join(BASE_DIR, "docs", "Core", "ui_system.md")
with open(doc_path, "r", encoding="utf-8") as f:
    doc_text = f.read()
doc_text = doc_text.replace(OLD_VERSION, NEW_VERSION)
with open(doc_path, "w", encoding="utf-8") as f:
    f.write(doc_text)

# =========================================================================
# 5. UPDATE js/Home/home_dashboard.js: Use BedCard and RoleBadge
# =========================================================================
dash_path = os.path.join(BASE_DIR, "js", "Home", "home_dashboard.js")
with open(dash_path, "r", encoding="utf-8") as f:
    dash_code = f.read()

# Replace bed card raw HTML with BedCard component
old_bed_block = """    return `
      <div class="p-4 rounded-3xl bg-[#FAF6F1] border border-[#F0EAE1] space-y-3 shadow-xs hover:border-[#E58A7B]/40 transition group">
        <div class="flex justify-between items-start">
          <div>
            <div class="text-[11px] font-black text-[#E58A7B] uppercase tracking-wider flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full ${isOverdue ? 'bg-rose-500' : 'bg-[#2E7D6D]'} animate-pulse"></span>
              <span>Giường số 0${idx + 1}</span>
            </div>
            <div class="font-extrabold text-sm text-[#2D2424] mt-0.5">${sess.customer_name || 'Khách vãng lai'}</div>
            <div class="text-xs text-[#7E7272]">${sess.service_name || 'Dịch vụ'}</div>
          </div>
          <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-full ${isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-[#E8F8F5] text-[#2E7D6D]'}">
            ${elapsedMin}/${targetMin}p
          </span>
        </div>

        <!-- Tiến trình thời gian -->
        <div class="space-y-1">
          <div class="w-full h-2 bg-white rounded-full overflow-hidden shadow-inner">
            <div class="h-full ${isOverdue ? 'bg-rose-500' : 'bg-gradient-to-r from-[#2E7D6D] to-[#3B9E8B]'} rounded-full transition-all duration-500" style="width: ${progressPct}%"></div>
          </div>
          <div class="flex justify-between text-[10px] text-[#A39696] font-medium">
            <span>Bắt đầu: ${sess.start_time || '--:--'}</span>
            <span>KTV: ${staffNames}</span>
          </div>
        </div>

        <!-- Nút vào xem ca này -->
        <button onclick="handleAdminInspectSession('${sess.session_id}')" class="w-full py-2 px-3 rounded-2xl bg-white hover:bg-[#FFF0EB] border border-[#EFE8DF] hover:border-[#E58A7B]/40 text-[#2D2424] hover:text-[#E58A7B] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-98">
          <i data-lucide="timer" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
          <span>Xem / Chăm Sóc Ca Này</span>
        </button>
      </div>
    `;"""

new_bed_block = """    if (typeof BedCard === 'function') {
      return BedCard({
        sess,
        bedIndex: idx + 1,
        elapsedMin,
        targetMin,
        progressPct,
        isOverdue,
        staffNames
      });
    }"""

if old_bed_block in dash_code:
    dash_code = dash_code.replace(old_bed_block, new_bed_block)
    print("Replaced BedCard in home_dashboard.js successfully!")
else:
    print("Could not find old_bed_block in home_dashboard.js!")

with open(dash_path, "w", encoding="utf-8") as f:
    f.write(dash_code)

print(f"APPLIED UI COMPONENTS PHASE 2 & BUMPED VERSION TO {NEW_VERSION} SUCCESSFULLY!")
