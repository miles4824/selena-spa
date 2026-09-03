# -*- coding: utf-8 -*-
import os
import re

BASE_DIR = r"c:\Users\Miles\Downloads\Selena"
NEW_VERSION = "v0.1.4.1"

# =========================================================================
# 1. UPDATE docs/Home/home_dashboard.md (Rule 12 Docs-First)
# =========================================================================
doc_path = os.path.join(BASE_DIR, "docs", "Home", "home_dashboard.md")
with open(doc_path, "r", encoding="utf-8") as f:
    doc_content = f.read()

new_audit = f"""## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-03` (`{NEW_VERSION}`): Tinh chỉnh chi tiết Trang Home KTV:
  + Bỏ huy hiệu "Selena Spa & Wellness".
  + Đổi "🟢 Sẵn sàng phục vụ • Đang rảnh" -> "Sẵn sàng phục vụ".
  + Đổi "⏱️ Đang trong tour (0/50p)" -> "Đang trong tour (0/50p)".
  + Đổi mô tả tour bận thành "Bạn đang trong tour của [Tên khách] (Tên dịch vụ). Vào tour ngay để theo dõi hoặc điều chỉnh ca.".
  + Đổi nút "VÀO XEM NGAY (Xp)" -> "VÀO XEM NGAY".
  + Đổi nhãn "Tour đã làm" -> "Tour hôm nay" và đơn vị "X ca" -> "X tour".
  + Thêm tính năng che mắt bảo mật cho cả "Tiền Tip" đồng bộ với "Hoa hồng", kèm font monospace font-mono.
- `2026-09-03` (`v0.1.4.0`):"""

doc_content = doc_content.replace(
    "## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)\n- `2026-09-03` (`v0.1.4.0`):",
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

# 2.1 Xóa "Selena Spa & Wellness"
old_top_bar = """      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-[#FCDFD7] text-[#E58A7B] text-xs font-bold">
          <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Selena Spa & Wellness
        </div>
        <!-- Huy hiệu trạng thái: 🟢 Đang rảnh hoặc ⏱️ Đang trong ca -->
        <div id="staff-home-status-badge" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"></div>
      </div>"""

new_top_bar = """      <div class="flex items-center justify-end">
        <!-- Huy hiệu trạng thái: Sẵn sàng phục vụ hoặc Đang trong tour -->
        <div id="staff-home-status-badge" class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold"></div>
      </div>"""

staff_home_html = staff_home_html.replace(old_top_bar, new_top_bar)

# 2.2 Đổi "Tour đã làm" -> "Tour hôm nay"
staff_home_html = staff_home_html.replace(
    '<span class="text-[11px] sm:text-xs font-bold text-[#2980B9] uppercase tracking-wider block">Tour đã làm</span>',
    '<span class="text-[11px] sm:text-xs font-bold text-[#2980B9] uppercase tracking-wider block">Tour hôm nay</span>'
)

# 2.3 Đổi "0 ca" -> "0 tour"
staff_home_html = staff_home_html.replace(
    '<div class="text-xl sm:text-2xl font-black text-[#2D2424]" id="home-today-tours">0 ca</div>',
    '<div class="text-xl sm:text-2xl font-black text-[#2D2424]" id="home-today-tours">0 tour</div>'
)

# 2.4 Cập nhật Hoa hồng: font-mono
old_comm_card = """      <!-- 2. Hoa hồng tích lũy hôm nay (kèm con mắt che/hiện) -->
      <div class="bg-white rounded-2xl border border-[#F0EAE1] p-3.5 sm:p-4 text-center space-y-1 bg-[#E8F8F5] border-[#B7EBDD] shadow-2xs">
        <div class="flex items-center justify-center gap-1">
          <span class="text-[11px] sm:text-xs font-bold text-[#2E7D6D] uppercase tracking-wider block">Hoa hồng</span>
          <button type="button" onclick="toggleStaffHomeCommPrivacy()" class="text-[#2E7D6D]/70 hover:text-[#2E7D6D] p-0.5 cursor-pointer transition" title="Bấm để ẩn/hiện số tiền">
            <i id="staff-home-comm-eye" data-lucide="eye-off" class="w-3.5 h-3.5"></i>
          </button>
        </div>
        <div onclick="toggleStaffHomeCommPrivacy()" class="text-xl sm:text-2xl font-black text-[#2E7D6D] tracking-tight cursor-pointer select-none" id="home-today-comm">+•••• đ</div>
        <span class="text-[10px] text-[#2E7D6D]/80 block font-medium">Tích lũy hôm nay</span>
      </div>"""

new_comm_card = """      <!-- 2. Hoa hồng tích lũy hôm nay (kèm con mắt che/hiện) -->
      <div class="bg-white rounded-2xl border border-[#F0EAE1] p-3.5 sm:p-4 text-center space-y-1 bg-[#E8F8F5] border-[#B7EBDD] shadow-2xs">
        <div class="flex items-center justify-center gap-1">
          <span class="text-[11px] sm:text-xs font-bold text-[#2E7D6D] uppercase tracking-wider block">Hoa hồng</span>
          <button type="button" onclick="toggleStaffHomeCommPrivacy()" class="text-[#2E7D6D]/70 hover:text-[#2E7D6D] p-0.5 cursor-pointer transition" title="Bấm để ẩn/hiện số tiền">
            <i id="staff-home-comm-eye" data-lucide="eye-off" class="w-3.5 h-3.5"></i>
          </button>
        </div>
        <div onclick="toggleStaffHomeCommPrivacy()" class="text-xl sm:text-2xl font-black font-mono text-[#2E7D6D] tracking-tight cursor-pointer select-none" id="home-today-comm">+•••• đ</div>
        <span class="text-[10px] text-[#2E7D6D]/80 block font-medium">Tích lũy hôm nay</span>
      </div>"""

staff_home_html = staff_home_html.replace(old_comm_card, new_comm_card)

# 2.5 Cập nhật Tiền Tip: có con mắt che và font-mono
old_tips_card = """      <!-- 3. Tiền tip hôm nay -->
      <div class="bg-white rounded-2xl border border-[#F0EAE1] p-3.5 sm:p-4 text-center space-y-1 bg-[#FFF0EB] border-[#FCDFD7] shadow-2xs">
        <span class="text-[11px] sm:text-xs font-bold text-[#D35400] uppercase tracking-wider block">Tiền Tip</span>
        <div class="text-xl sm:text-2xl font-black text-[#D35400]" id="home-today-tips">0 đ</div>
        <span class="text-[10px] text-[#D35400]/80 block font-medium">Khách gửi tặng</span>
      </div>"""

new_tips_card = """      <!-- 3. Tiền tip hôm nay -->
      <div class="bg-white rounded-2xl border border-[#F0EAE1] p-3.5 sm:p-4 text-center space-y-1 bg-[#FFF0EB] border-[#FCDFD7] shadow-2xs">
        <div class="flex items-center justify-center gap-1">
          <span class="text-[11px] sm:text-xs font-bold text-[#D35400] uppercase tracking-wider block">Tiền Tip</span>
          <button type="button" onclick="toggleStaffHomeCommPrivacy()" class="text-[#D35400]/70 hover:text-[#D35400] p-0.5 cursor-pointer transition" title="Bấm để ẩn/hiện số tiền">
            <i id="staff-home-tips-eye" data-lucide="eye-off" class="w-3.5 h-3.5"></i>
          </button>
        </div>
        <div onclick="toggleStaffHomeCommPrivacy()" class="text-xl sm:text-2xl font-black font-mono text-[#D35400] tracking-tight cursor-pointer select-none" id="home-today-tips">+•••• đ</div>
        <span class="text-[10px] text-[#D35400]/80 block font-medium">Khách gửi tặng</span>
      </div>"""

staff_home_html = staff_home_html.replace(old_tips_card, new_tips_card)

with open(staff_home_path, "w", encoding="utf-8") as f:
    f.write(staff_home_html)

# =========================================================================
# 3. UPDATE js/Home/home_dashboard.js
# =========================================================================
home_dash_path = os.path.join(BASE_DIR, "js", "Home", "home_dashboard.js")
with open(home_dash_path, "r", encoding="utf-8") as f:
    home_code = f.read()

# 3.1 Cập nhật renderHomeStatusAndActionButton:
# "🟢 Sẵn sàng phục vụ • Đang rảnh" -> "Sẵn sàng phục vụ"
# "⏱️ Đang trong tour (0/50p)" -> "Đang trong tour (0/50p)"
# "VÀO XEM NGAY (Xp)" -> "VÀO XEM NGAY"
# Mô tả: "Bạn đang trong tour của [Tên khách] (Tên combo). Vào tour ngay để theo dõi hoặc điều chỉnh ca."

old_admin_busy_badge = """badgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#E58A7B] animate-pulse"></span><span>⏱️ Đang trực tiếp làm ca (${tourInfo.elapsedMin}p)</span>`;"""
new_admin_busy_badge = """badgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#E58A7B] animate-pulse"></span><span>Đang trong tour (${tourInfo.elapsedMin}/${tourInfo.targetMin}p)</span>`;"""
home_code = home_code.replace(old_admin_busy_badge, new_admin_busy_badge)

old_admin_free_badge = """badgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#2E7D6D]"></span><span>🟢 Đang rảnh sẵn sàng</span>`;"""
new_admin_free_badge = """badgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#2E7D6D]"></span><span>Sẵn sàng phục vụ</span>`;"""
home_code = home_code.replace(old_admin_free_badge, new_admin_free_badge)

old_staff_busy_badge = """badgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#E58A7B] animate-pulse"></span><span>⏱️ Đang trong tour (${tourInfo.elapsedMin}/${tourInfo.targetMin}p)</span>`;"""
new_staff_busy_badge = """badgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#E58A7B] animate-pulse"></span><span>Đang trong tour (${tourInfo.elapsedMin}/${tourInfo.targetMin}p)</span>`;"""
home_code = home_code.replace(old_staff_busy_badge, new_staff_busy_badge)

old_staff_free_badge = """badgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#2E7D6D]"></span><span>🟢 Sẵn sàng phục vụ • Đang rảnh</span>`;"""
new_staff_free_badge = """badgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#2E7D6D]"></span><span>Sẵn sàng phục vụ</span>`;"""
home_code = home_code.replace(old_staff_free_badge, new_staff_free_badge)

old_desc = """descEl.innerText = `Bạn đang phục vụ tour cho khách ${s?.customer_name || 'Khách'} (${s?.service_name || 'Dịch vụ'}). Bấm nút dưới để theo dõi hoặc điều chỉnh ca.`;"""
new_desc = """descEl.innerText = `Bạn đang trong tour của [${s?.customer_name || 'Khách vãng lai'}] (${s?.service_name || 'Dịch vụ'}). Vào tour ngay để theo dõi hoặc điều chỉnh ca.`;"""
home_code = home_code.replace(old_desc, new_desc)

old_btn_text = """<span>VÀO XEM NGAY (${tourInfo.elapsedMin}p)</span>"""
new_btn_text = """<span>VÀO XEM NGAY</span>"""
home_code = home_code.replace(old_btn_text, new_btn_text)

# 3.2 Cập nhật loadKTVHomeStats:
# "0 ca" -> "0 tour"
# Tiền Tip có che mắt
old_stats_code = """  const toursEl = document.getElementById('home-today-tours');
  const commEl = document.getElementById('home-today-comm');
  const tipsEl = document.getElementById('home-today-tips');
  const eyeEl = document.getElementById('staff-home-comm-eye');

  if (toursEl) toursEl.innerText = todayTours + ' ca';
  if (commEl) {
    if (isStaffHomeCommMasked) {
      commEl.innerText = '+•••• đ';
      if (eyeEl) eyeEl.setAttribute('data-lucide', 'eye-off');
    } else {
      commEl.innerText = `+${todayComm.toLocaleString('vi-VN')} đ`;
      if (eyeEl) eyeEl.setAttribute('data-lucide', 'eye');
    }
  }
  if (tipsEl) tipsEl.innerText = `+${todayTips.toLocaleString('vi-VN')} đ`;"""

new_stats_code = """  const toursEl = document.getElementById('home-today-tours');
  const commEl = document.getElementById('home-today-comm');
  const tipsEl = document.getElementById('home-today-tips');
  const eyeEl = document.getElementById('staff-home-comm-eye');
  const tipsEyeEl = document.getElementById('staff-home-tips-eye');

  if (toursEl) toursEl.innerText = todayTours + ' tour';
  if (commEl) {
    if (isStaffHomeCommMasked) {
      commEl.innerText = '+•••• đ';
      if (eyeEl) eyeEl.setAttribute('data-lucide', 'eye-off');
    } else {
      commEl.innerText = `+${todayComm.toLocaleString('vi-VN')} đ`;
      if (eyeEl) eyeEl.setAttribute('data-lucide', 'eye');
    }
  }
  if (tipsEl) {
    if (isStaffHomeCommMasked) {
      tipsEl.innerText = '+•••• đ';
      if (tipsEyeEl) tipsEyeEl.setAttribute('data-lucide', 'eye-off');
    } else {
      tipsEl.innerText = `+${todayTips.toLocaleString('vi-VN')} đ`;
      if (tipsEyeEl) tipsEyeEl.setAttribute('data-lucide', 'eye');
    }
  }"""

home_code = home_code.replace(old_stats_code, new_stats_code)

with open(home_dash_path, "w", encoding="utf-8") as f:
    f.write(home_code)

# =========================================================================
# 4. BUMP VERSION ACROSS APP
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
