# -*- coding: utf-8 -*-
import os
import re

BASE_DIR = r"c:\Users\Miles\Downloads\Selena"
NEW_VERSION = "v0.1.4.4"

# =========================================================================
# 1. UPDATE docs/Home/home_dashboard.md (Rule 12 Docs-First)
# =========================================================================
doc_path = os.path.join(BASE_DIR, "docs", "Home", "home_dashboard.md")
with open(doc_path, "r", encoding="utf-8") as f:
    doc_content = f.read()

new_audit = f"""## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-03` (`{NEW_VERSION}`):
  + Cập nhật màu số tiền thu nhập: bỏ class `text-[#2E7D6D]`, chuyển sang màu đen sẫm chủ đạo `text-[#2D2424]`.
  + Khắc phục triệt để đồng bộ câu chào và câu châm ngôn từ `tb_config`:
    - Thêm `home_greeting_slogan` và `home_free_quote` vào `DEFAULT_UI_CONFIG` và hàm `applyDynamicUIConfig()`.
    - Hỗ trợ cả key chữ thường và chữ hoa (`home_greeting_slogan` & `HOME_GREETING_SLOGAN`).
    - Kích hoạt `applyDynamicUIConfig()` ngay khi tải trang và mỗi khi đồng bộ từ Google Sheets.
- `2026-09-03` (`v0.1.4.3`):"""

doc_content = doc_content.replace(
    "## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)\n- `2026-09-03` (`v0.1.4.3`):",
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

# Bỏ class text-[#2E7D6D], thay bằng text-[#2D2424]
staff_home_html = staff_home_html.replace(
    'class="text-2xl sm:text-3xl font-black font-mono text-[#2E7D6D] tracking-tight cursor-pointer select-none" id="home-today-comm"',
    'class="text-2xl sm:text-3xl font-black font-mono text-[#2D2424] tracking-tight cursor-pointer select-none" id="home-today-comm"'
)

with open(staff_home_path, "w", encoding="utf-8") as f:
    f.write(staff_home_html)

# =========================================================================
# 3. UPDATE js/config.js
# =========================================================================
cfg_path = os.path.join(BASE_DIR, "js", "config.js")
with open(cfg_path, "r", encoding="utf-8") as f:
    cfg_code = f.read()

# Add to DEFAULT_UI_CONFIG
old_default_cfg = """  ph_announcement: 'Nhập thông báo gửi đến toàn thể kỹ thuật viên...',
  ph_gift_voucher_note: 'VD: Khách VIP, Quà tri ân...'
};"""

new_default_cfg = """  ph_announcement: 'Nhập thông báo gửi đến toàn thể kỹ thuật viên...',
  ph_gift_voucher_note: 'VD: Khách VIP, Quà tri ân...',
  home_greeting_slogan: 'hôm nay sẵn sàng tỏa sáng chưa? ✨',
  home_free_quote: 'Mỗi tour gội là một trải nghiệm thư giãn tuyệt vời gửi gắm đến khách hàng thân yêu.'
};"""

cfg_code = cfg_code.replace(old_default_cfg, new_default_cfg)

# Add to applyDynamicUIConfig
old_apply_ui = """  const annContent = document.getElementById('input-announcement-content');
  if (annContent && cfg.ph_announcement) annContent.placeholder = cfg.ph_announcement;
}"""

new_apply_ui = """  const annContent = document.getElementById('input-announcement-content');
  if (annContent && cfg.ph_announcement) annContent.placeholder = cfg.ph_announcement;

  // 7. Home Staff Greeting Slogan & Free Quote
  const sloganEl = document.getElementById('home-greeting-slogan');
  const sloganVal = cfg.home_greeting_slogan || cfg.HOME_GREETING_SLOGAN;
  if (sloganEl && sloganVal) sloganEl.innerText = sloganVal;

  const quoteEl = document.getElementById('staff-home-status-desc');
  const quoteVal = cfg.home_free_quote || cfg.HOME_FREE_QUOTE;
  const tourInfo = (typeof checkCurrentUserRunningTour === 'function') ? checkCurrentUserRunningTour() : { isRunning: false };
  if (quoteEl && quoteVal && !tourInfo.isRunning) quoteEl.innerText = quoteVal;
}"""

cfg_code = cfg_code.replace(old_apply_ui, new_apply_ui)

with open(cfg_path, "w", encoding="utf-8") as f:
    f.write(cfg_code)

# =========================================================================
# 4. UPDATE js/Home/home_dashboard.js
# =========================================================================
home_dash_path = os.path.join(BASE_DIR, "js", "Home", "home_dashboard.js")
with open(home_dash_path, "r", encoding="utf-8") as f:
    home_code = f.read()

# Slogan đọc cả chữ hoa/thường
old_slogan_code = """  const uiConfig = (typeof getStored === 'function') ? getStored('ui_config', {}) : {};
  const sloganEl = document.getElementById('home-greeting-slogan');
  if (sloganEl) {
    sloganEl.innerText = uiConfig.home_greeting_slogan || 'hôm nay sẵn sàng tỏa sáng chưa? ✨';
  }"""

new_slogan_code = """  const uiConfig = (typeof getStored === 'function') ? getStored('ui_config', {}) : {};
  const sloganEl = document.getElementById('home-greeting-slogan');
  if (sloganEl) {
    const sloganVal = uiConfig.home_greeting_slogan || uiConfig.HOME_GREETING_SLOGAN || 'hôm nay sẵn sàng tỏa sáng chưa? ✨';
    sloganEl.innerText = sloganVal;
  }"""

home_code = home_code.replace(old_slogan_code, new_slogan_code)

# Quote đọc cả chữ hoa/thường
old_quote_code = """        const uiConfig = (typeof getStored === 'function') ? getStored('ui_config', {}) : {};
        descEl.innerText = uiConfig.home_free_quote || 'Mỗi tour gội là một trải nghiệm thư giãn tuyệt vời gửi gắm đến khách hàng thân yêu.';"""

new_quote_code = """        const uiConfig = (typeof getStored === 'function') ? getStored('ui_config', {}) : {};
        const quoteVal = uiConfig.home_free_quote || uiConfig.HOME_FREE_QUOTE || 'Mỗi tour gội là một trải nghiệm thư giãn tuyệt vời gửi gắm đến khách hàng thân yêu.';
        descEl.innerText = quoteVal;"""

home_code = home_code.replace(old_quote_code, new_quote_code)

with open(home_dash_path, "w", encoding="utf-8") as f:
    f.write(home_code)

# =========================================================================
# 5. UPDATE js/app.js (Tự động kích hoạt applyDynamicUIConfig khi load trang)
# =========================================================================
app_js_path = os.path.join(BASE_DIR, "js", "app.js")
with open(app_js_path, "r", encoding="utf-8") as f:
    app_js = f.read()

if "applyDynamicUIConfig" not in app_js:
    app_js = app_js.replace(
        "renderAnnouncement();",
        "renderAnnouncement();\n  if (typeof applyDynamicUIConfig === 'function') applyDynamicUIConfig();"
    )
    with open(app_js_path, "w", encoding="utf-8") as f:
        f.write(app_js)

# =========================================================================
# 6. BUMP VERSION ACROSS APP
# =========================================================================
idx_file = os.path.join(BASE_DIR, "index.html")
with open(idx_file, "r", encoding="utf-8") as f:
    html = f.read()
html = re.sub(r"\?v=\d+\.\d+\.\d+\.\d+(\.\d+)?", f"?v={NEW_VERSION}", html)
html = re.sub(r"\?v=v\d+\.\d+\.\d+\.\d+(\.\d+)?", f"?v={NEW_VERSION}", html)
with open(idx_file, "w", encoding="utf-8") as f:
    f.write(html)

with open(cfg_path, "r", encoding="utf-8") as f:
    cfg = f.read()
cfg = re.sub(r"const APP_VERSION = '[^']+';", f"const APP_VERSION = '{NEW_VERSION}';", cfg)
with open(cfg_path, "w", encoding="utf-8") as f:
    f.write(cfg)

login_file = os.path.join(BASE_DIR, "views", "login.html")
with open(login_file, "r", encoding="utf-8") as f:
    l_html = f.read()
l_html = re.sub(r"v\d+\.\d+\.\d+\.\d+(\.\d+)? • Selena Spa[^<]*", f"{NEW_VERSION} • Selena Spa", l_html)
with open(login_file, "w", encoding="utf-8") as f:
    f.write(l_html)

print(f"DONE {NEW_VERSION}!")
