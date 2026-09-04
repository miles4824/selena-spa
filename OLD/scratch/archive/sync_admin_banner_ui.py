# -*- coding: utf-8 -*-
import os
import re

BASE_DIR = r"c:\Users\Miles\Downloads\Selena"
NEW_VERSION = "v0.1.4.7"

# 1. Update docs
doc_path = os.path.join(BASE_DIR, "docs", "Home", "home_dashboard.md")
with open(doc_path, "r", encoding="utf-8") as f:
    doc_content = f.read()

new_audit = f"""## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-03` (`{NEW_VERSION}`):
  + Đồng bộ 100% phong cách thẻ Wellness Banner sang trọng từ Staff sang Admin:
    - Bọc cụm chào mừng của Admin trong Card Luxury Bo góc 28px viền #F0EAE1 và nền gradient ấm áp `#FFF0EB` -> `#FAF6F1`.
    - Thống nhất kích thước nút hành động tròn bo cong pill, chữ to rõ ràng `VÀO TOUR NGAY` / `VÀO XEM NGAY`.
- `2026-09-03` (`v0.1.4.6`):"""

doc_content = doc_content.replace(
    "## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)\n- `2026-09-03` (`v0.1.4.6`):",
    new_audit
)
with open(doc_path, "w", encoding="utf-8") as f:
    f.write(doc_content)

# 2. Update views/owner/home.html
owner_home_path = os.path.join(BASE_DIR, "views", "owner", "home.html")
with open(owner_home_path, "r", encoding="utf-8") as f:
    owner_html = f.read()

old_owner_banner = """  <!-- CỤM 1: HEADER & TRẠNG THÁI NHÂN SỰ -->
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
    <div>
      <h2 class="text-2xl sm:text-3xl font-extrabold text-[#2D2424] flex items-center gap-2.5">
        <span>👑 Chào chủ sáng lập</span>
        <span class="text-[#E58A7B] text-xl sm:text-2xl font-serif font-medium">(Hi Miles ✨)</span>
      </h2>
      <p class="text-xs sm:text-sm text-[#7E7272] mt-0.5">Kiểm soát vận hành trực tiếp & thống kê tài chính thời gian thực</p>
    </div>
    
    <!-- Thanh trạng thái & Nút hành động của Admin (nếu trực tiếp vào ca) -->
    <div class="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
      <div id="admin-home-status-badge" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"></div>
      <div id="admin-home-action-btn-container"></div>
    </div>
  </div>"""

new_owner_banner = """  <!-- CỤM 1: WELLNESS BANNER CHỦ SÁNG LẬP & NÚT TRẠNG THÁI BIẾN HÌNH (CHUẨN LUXURY NHƯ STAFF) -->
  <div class="bg-white rounded-[28px] border border-[#F0EAE1] shadow-[0_10px_30px_-5px_rgba(229,138,123,0.05),0_4px_12px_rgba(0,0,0,0.02)] p-6 sm:p-7 relative overflow-hidden bg-gradient-to-br from-[#FFF0EB] via-[#FFFFFF] to-[#FAF6F1]">
    <div class="relative z-10 space-y-3.5">
      <div class="flex items-center">
        <!-- Huy hiệu trạng thái: Sẵn sàng phục vụ hoặc Đang trong tour -->
        <div id="admin-home-status-badge" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold"></div>
      </div>

      <h2 class="text-2xl font-medium font-serif text-[#2D2424]">
        Chào <span id="admin-greeting-name" class="text-[#E58A7B]">Chủ sáng lập (Miles)</span>, <span id="admin-greeting-slogan">hôm nay tiệm vận hành tuyệt vời chứ? ✨</span>
      </h2>
      <p class="text-[#7E7272] text-sm max-w-md leading-relaxed" id="admin-home-status-desc">
        Kiểm soát vận hành các giường trực tiếp & theo dõi chỉ số tài chính thời gian thực.
      </p>

      <!-- Nút hành động biến hình chuẩn pill: [💆 VÀO TOUR NGAY] hoặc [⏱️ VÀO XEM NGAY] -->
      <div class="pt-2" id="admin-home-action-btn-container"></div>
    </div>
  </div>"""

owner_html = owner_html.replace(old_owner_banner, new_owner_banner)
with open(owner_home_path, "w", encoding="utf-8") as f:
    f.write(owner_html)

# 3. Update home_dashboard.js: Đồng bộ nút bấm admin chuẩn như staff
dash_path = os.path.join(BASE_DIR, "js", "Home", "home_dashboard.js")
with open(dash_path, "r", encoding="utf-8") as f:
    dash_code = f.read()

# Thay thế nút admin bấm trong renderHomeStatusAndActionButton
old_admin_btn_busy = """      if (btnContainer) {
        btnContainer.innerHTML = `
          <button onclick="handleHomeGoToActiveTour()" class="px-4 py-2 rounded-2xl bg-[#2E7D6D] hover:bg-[#256357] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-[#2E7D6D]/20 transition flex items-center gap-2 cursor-pointer active:scale-95">
            <i data-lucide="timer" class="w-4 h-4"></i>
            <span>Vào Xem Tour</span>
          </button>
        `;
      }"""

new_admin_btn_busy = """      if (btnContainer) {
        btnContainer.innerHTML = `
          <button onclick="handleHomeGoToActiveTour()" class="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-[#2E7D6D] to-[#3B9E8B] hover:opacity-95 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#2E7D6D]/25 transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-95">
            <i data-lucide="timer" class="w-5 h-5"></i>
            <span>VÀO XEM NGAY</span>
          </button>
        `;
      }"""

old_admin_btn_free = """      if (btnContainer) {
        btnContainer.innerHTML = `
          <button onclick="showView('add')" class="px-4 py-2 rounded-2xl bg-[#E58A7B] hover:bg-[#D9796A] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-[#E58A7B]/20 transition flex items-center gap-2 cursor-pointer active:scale-95">
            <i data-lucide="plus-circle" class="w-4 h-4"></i>
            <span>Vào Tour Ngay</span>
          </button>
        `;
      }"""

new_admin_btn_free = """      if (btnContainer) {
        btnContainer.innerHTML = `
          <button onclick="showView('add')" class="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E58A7B] to-[#F09A8D] hover:opacity-95 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#E58A7B]/25 transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-95">
            <i data-lucide="plus-circle" class="w-5 h-5"></i>
            <span>VÀO TOUR NGAY</span>
          </button>
        `;
      }"""

dash_code = dash_code.replace(old_admin_btn_busy, new_admin_btn_busy)
dash_code = dash_code.replace(old_admin_btn_free, new_admin_btn_free)

with open(dash_path, "w", encoding="utf-8") as f:
    f.write(dash_code)

# 4. Bump version
idx_file = os.path.join(BASE_DIR, "index.html")
with open(idx_file, "r", encoding="utf-8") as f:
    html = f.read()
html = re.sub(r"\?v=v0\.1\.4\.6", f"?v={NEW_VERSION}", html)
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

print("DONE SYNCING UI TO v0.1.4.7!")
