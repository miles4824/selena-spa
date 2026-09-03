# -*- coding: utf-8 -*-
import os
import re

BASE_DIR = r"c:\Users\Miles\Downloads\Selena"
NEW_VERSION = "v0.1.4.2"

# =========================================================================
# 1. UPDATE docs/Home/home_dashboard.md (Rule 12 Docs-First)
# =========================================================================
doc_path = os.path.join(BASE_DIR, "docs", "Home", "home_dashboard.md")
with open(doc_path, "r", encoding="utf-8") as f:
    doc_content = f.read()

new_audit = f"""## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-03` (`{NEW_VERSION}`): Tinh chỉnh trải nghiệm Trang Home KTV theo góp ý:
  + Ghi nhớ trạng thái ẩn/hiện tiền trong phiên bằng localStorage (`selena_staff_home_comm_masked`): khi người dùng mở xem tiền, chuyển tab và quay lại Trang Home vẫn giữ nguyên trạng thái hiển thị, không bị tự động ẩn lại.
  + Bỏ class `justify-end` ở huy hiệu trạng thái banner KTV để căn trái tự nhiên.
  + Gom chung "Hoa hồng" và "Tiền Tip" thành một thẻ duy nhất: **"Thu nhập hôm nay"**, hiển thị tổng tiền `Hoa hồng + Tip`, kèm nút con mắt che/hiện và font mono sắc nét. Layout chuyển thành 2 cột cân đối: `Tour hôm nay` (2 tour) và `Thu nhập hôm nay` (+•••• đ).
  + Chuyển câu slogan chào đón (`home_greeting_slogan`: "hôm nay sẵn sàng tỏa sáng chưa? ✨") và câu châm ngôn khi rảnh (`home_free_quote`: "Mỗi tour gội là một trải nghiệm thư giãn tuyệt vời gửi gắm đến khách hàng thân yêu.") sang đọc trực tiếp từ `tb_config` (Google Sheet) để chủ tiệm có thể sửa bất cứ lúc nào.
  + Câu mô tả khi có ca bận: Không dùng dấu ngoặc vuông `[]`, in đậm tên khách (`font-extrabold text-[#2D2424]`), in nghiêng gói combo màu cam san hô (`italic font-bold text-[#E58A7B]`) để phân biệt trực quan.
- `2026-09-03` (`v0.1.4.1`):"""

doc_content = doc_content.replace(
    "## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)\n- `2026-09-03` (`v0.1.4.1`):",
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

# 2.1 Bỏ justify-end ở huy hiệu trạng thái
staff_home_html = staff_home_html.replace(
    '<div class="flex items-center justify-end">',
    '<div class="flex items-center">'
)

# 2.2 Thêm span id="home-greeting-slogan" cho câu chào
old_greeting = """      <h2 class="text-2xl font-medium font-serif text-[#2D2424]">
        Chào <span id="home-greeting-name" class="text-[#E58A7B]">Mai Lan</span>, hôm nay sẵn sàng tỏa sáng chưa? ✨
      </h2>"""

new_greeting = """      <h2 class="text-2xl font-medium font-serif text-[#2D2424]">
        Chào <span id="home-greeting-name" class="text-[#E58A7B]">Mai Lan</span>, <span id="home-greeting-slogan">hôm nay sẵn sàng tỏa sáng chưa? ✨</span>
      </h2>"""

staff_home_html = staff_home_html.replace(old_greeting, new_greeting)

# 2.3 Gom chung Hoa hồng + Tips thành 1 thẻ "THU NHẬP HÔM NAY" (2 cột cân đối)
old_cards_grid = """    <div class="grid grid-cols-3 gap-2.5 sm:gap-3.5">
      <!-- 1. Số tour hôm nay -->
      <div class="bg-white rounded-2xl border border-[#F0EAE1] p-3.5 sm:p-4 text-center space-y-1 bg-[#EBF5FB] border-[#D4E6F1] shadow-2xs">
        <span class="text-[11px] sm:text-xs font-bold text-[#2980B9] uppercase tracking-wider block">Tour hôm nay</span>
        <div class="text-xl sm:text-2xl font-black text-[#2D2424]" id="home-today-tours">0 tour</div>
        <span class="text-[10px] text-[#2980B9]/80 block font-medium">Trong ngày</span>
      </div>

      <!-- 2. Hoa hồng tích lũy hôm nay (kèm con mắt che/hiện) -->
      <div class="bg-white rounded-2xl border border-[#F0EAE1] p-3.5 sm:p-4 text-center space-y-1 bg-[#E8F8F5] border-[#B7EBDD] shadow-2xs">
        <div class="flex items-center justify-center gap-1">
          <span class="text-[11px] sm:text-xs font-bold text-[#2E7D6D] uppercase tracking-wider block">Hoa hồng</span>
          <button type="button" onclick="toggleStaffHomeCommPrivacy()" class="text-[#2E7D6D]/70 hover:text-[#2E7D6D] p-0.5 cursor-pointer transition" title="Bấm để ẩn/hiện số tiền">
            <i id="staff-home-comm-eye" data-lucide="eye-off" class="w-3.5 h-3.5"></i>
          </button>
        </div>
        <div onclick="toggleStaffHomeCommPrivacy()" class="text-xl sm:text-2xl font-black font-mono text-[#2E7D6D] tracking-tight cursor-pointer select-none" id="home-today-comm">+•••• đ</div>
        <span class="text-[10px] text-[#2E7D6D]/80 block font-medium">Tích lũy hôm nay</span>
      </div>

      <!-- 3. Tiền tip hôm nay -->
      <div class="bg-white rounded-2xl border border-[#F0EAE1] p-3.5 sm:p-4 text-center space-y-1 bg-[#FFF0EB] border-[#FCDFD7] shadow-2xs">
        <div class="flex items-center justify-center gap-1">
          <span class="text-[11px] sm:text-xs font-bold text-[#D35400] uppercase tracking-wider block">Tiền Tip</span>
          <button type="button" onclick="toggleStaffHomeCommPrivacy()" class="text-[#D35400]/70 hover:text-[#D35400] p-0.5 cursor-pointer transition" title="Bấm để ẩn/hiện số tiền">
            <i id="staff-home-tips-eye" data-lucide="eye-off" class="w-3.5 h-3.5"></i>
          </button>
        </div>
        <div onclick="toggleStaffHomeCommPrivacy()" class="text-xl sm:text-2xl font-black font-mono text-[#D35400] tracking-tight cursor-pointer select-none" id="home-today-tips">+•••• đ</div>
        <span class="text-[10px] text-[#D35400]/80 block font-medium">Khách gửi tặng</span>
      </div>
    </div>"""

new_cards_grid = """    <div class="grid grid-cols-2 gap-3 sm:gap-4">
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
        <div onclick="toggleStaffHomeCommPrivacy()" class="text-2xl sm:text-3xl font-black font-mono text-[#2E7D6D] tracking-tight cursor-pointer select-none" id="home-today-comm">+•••• đ</div>
        <span class="text-[11px] text-[#2E7D6D]/80 block font-medium">Hoa hồng + Tip tích lũy</span>
      </div>
    </div>"""

staff_home_html = staff_home_html.replace(old_cards_grid, new_cards_grid)

with open(staff_home_path, "w", encoding="utf-8") as f:
    f.write(staff_home_html)

# =========================================================================
# 3. UPDATE js/Home/home_dashboard.js
# =========================================================================
home_dash_path = os.path.join(BASE_DIR, "js", "Home", "home_dashboard.js")
with open(home_dash_path, "r", encoding="utf-8") as f:
    home_code = f.read()

# 3.1 Ghi nhớ trạng thái ẩn/hiện tiền trong localStorage
old_privacy_state = """let isStaffHomeCommMasked = true; // Mặc định luôn che "+•••• đ" chuẩn ngân hàng

function toggleStaffHomeCommPrivacy() {
  isStaffHomeCommMasked = !isStaffHomeCommMasked;
  if (typeof loadKTVHomeStats === 'function') loadKTVHomeStats();
}
window.toggleStaffHomeCommPrivacy = toggleStaffHomeCommPrivacy;"""

new_privacy_state = """// Ghi nhớ trạng thái ẩn/hiện hoa hồng: Mặc định là true, nhưng nếu người dùng đã mở xem thì giữ nguyên khi chuyển tab
let isStaffHomeCommMasked = localStorage.getItem('selena_staff_home_comm_masked') === 'false' ? false : true;

function toggleStaffHomeCommPrivacy() {
  isStaffHomeCommMasked = !isStaffHomeCommMasked;
  try {
    localStorage.setItem('selena_staff_home_comm_masked', String(isStaffHomeCommMasked));
  } catch (e) {}
  if (typeof loadKTVHomeStats === 'function') loadKTVHomeStats();
}
window.toggleStaffHomeCommPrivacy = toggleStaffHomeCommPrivacy;"""

home_code = home_code.replace(old_privacy_state, new_privacy_state)

# 3.2 Cập nhật renderHomeStatusAndActionButton:
# Câu mô tả in đậm tên khách, in nghiêng tên gói combo, không dùng dấu ngoặc vuông
# Khi rảnh: Lấy câu quote từ tb_config
old_render_desc = """      if (descEl) {
        descEl.innerText = `Bạn đang trong tour của [${s?.customer_name || 'Khách vãng lai'}] (${s?.service_name || 'Dịch vụ'}). Vào tour ngay để theo dõi hoặc điều chỉnh ca.`;
      }"""

new_render_desc = """      if (descEl) {
        const custName = s?.customer_name || 'Khách vãng lai';
        const servName = s?.service_name || 'Dịch vụ';
        descEl.innerHTML = `Bạn đang trong tour của <strong class="font-extrabold text-[#2D2424]">${custName}</strong> (<em class="italic font-bold text-[#E58A7B]">${servName}</em>). Vào tour ngay để theo dõi hoặc điều chỉnh ca.`;
      }"""

home_code = home_code.replace(old_render_desc, new_render_desc)

old_free_desc = """      if (descEl) {
        descEl.innerText = `Mỗi tour gội là một trải nghiệm thư giãn tuyệt vời gửi gắm đến khách hàng thân yêu.`;
      }"""

new_free_desc = """      if (descEl) {
        const uiConfig = (typeof getStored === 'function') ? getStored('ui_config', {}) : {};
        descEl.innerText = uiConfig.home_free_quote || 'Mỗi tour gội là một trải nghiệm thư giãn tuyệt vời gửi gắm đến khách hàng thân yêu.';
      }"""

home_code = home_code.replace(old_free_desc, new_free_desc)

# 3.3 Cập nhật loadKTVHomeStats:
# Lấy slogan chào từ tb_config
# Gom tiền Hoa hồng + Tip thành Thu nhập hôm nay
old_stats_logic = """  const toursEl = document.getElementById('home-today-tours');
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

new_stats_logic = """  // Lấy câu slogan chào mừng từ tb_config
  const uiConfig = (typeof getStored === 'function') ? getStored('ui_config', {}) : {};
  const sloganEl = document.getElementById('home-greeting-slogan');
  if (sloganEl) {
    sloganEl.innerText = uiConfig.home_greeting_slogan || 'hôm nay sẵn sàng tỏa sáng chưa? ✨';
  }

  const toursEl = document.getElementById('home-today-tours');
  const commEl = document.getElementById('home-today-comm');
  const eyeEl = document.getElementById('staff-home-comm-eye');
  const totalToday = todayComm + todayTips;

  if (toursEl) toursEl.innerText = todayTours + ' tour';
  if (commEl) {
    if (isStaffHomeCommMasked) {
      commEl.innerText = '+•••• đ';
      if (eyeEl) eyeEl.setAttribute('data-lucide', 'eye-off');
    } else {
      commEl.innerText = `+${totalToday.toLocaleString('vi-VN')} đ`;
      if (eyeEl) eyeEl.setAttribute('data-lucide', 'eye');
    }
  }"""

home_code = home_code.replace(old_stats_logic, new_stats_logic)

with open(home_dash_path, "w", encoding="utf-8") as f:
    f.write(home_code)

# =========================================================================
# 4. UPDATE google_apps_script/Code.gs
# =========================================================================
code_gs_path = os.path.join(BASE_DIR, "google_apps_script", "Code.gs")
with open(code_gs_path, "r", encoding="utf-8") as f:
    code_gs = f.read()

# Add keys to defaultKeys
old_keys_block = """    ['ph_announcement', 'Nhập thông báo gửi đến toàn thể kỹ thuật viên...', 'Placeholder ô soạn thông báo'],
    ['ph_gift_voucher_note', 'VD: Khách VIP, Quà tri ân...', 'Placeholder ô ghi chú tặng voucher'],"""

new_keys_block = """    ['ph_announcement', 'Nhập thông báo gửi đến toàn thể kỹ thuật viên...', 'Placeholder ô soạn thông báo'],
    ['ph_gift_voucher_note', 'VD: Khách VIP, Quà tri ân...', 'Placeholder ô ghi chú tặng voucher'],
    ['home_greeting_slogan', 'hôm nay sẵn sàng tỏa sáng chưa? ✨', 'Câu slogan chào đón KTV trang Home'],
    ['home_free_quote', 'Mỗi tour gội là một trải nghiệm thư giãn tuyệt vời gửi gắm đến khách hàng thân yêu.', 'Câu châm ngôn truyền cảm hứng khi KTV đang rảnh'],"""

code_gs = code_gs.replace(old_keys_block, new_keys_block)

# Add keys to config default object
old_cfg_obj = """    optgroup_combos: '💆 Combo Gội Chính',
    optgroup_addons: '✨ Dịch Vụ Lẻ / Làm Thêm'"""

new_cfg_obj = """    optgroup_combos: '💆 Combo Gội Chính',
    optgroup_addons: '✨ Dịch Vụ Lẻ / Làm Thêm',
    home_greeting_slogan: 'hôm nay sẵn sàng tỏa sáng chưa? ✨',
    home_free_quote: 'Mỗi tour gội là một trải nghiệm thư giãn tuyệt vời gửi gắm đến khách hàng thân yêu.'"""

code_gs = code_gs.replace(old_cfg_obj, new_cfg_obj)

with open(code_gs_path, "w", encoding="utf-8") as f:
    f.write(code_gs)

# =========================================================================
# 5. BUMP VERSION ACROSS APP
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
