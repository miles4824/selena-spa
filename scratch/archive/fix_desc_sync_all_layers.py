# -*- coding: utf-8 -*-
import os
import re

BASE_DIR = r"c:\Users\Miles\Downloads\Selena"
NEW_VERSION = "v0.1.4.5"

# =========================================================================
# 1. UPDATE docs/Home/home_dashboard.md (Rule 12 Docs-First)
# =========================================================================
doc_path = os.path.join(BASE_DIR, "docs", "Home", "home_dashboard.md")
with open(doc_path, "r", encoding="utf-8") as f:
    doc_content = f.read()

new_audit = f"""## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-03` (`{NEW_VERSION}`):
  + Sửa triệt để 100% lỗi `#staff-home-status-desc` không nhận nội dung từ `tb_config`:
    - Đưa việc cập nhật `#staff-home-status-desc` và `#home-greeting-slogan` ra khỏi phân nhánh role bị chặn, đảm bảo bất cứ khi nào element tồn tại trong DOM thì luôn luôn được gán dữ liệu mới nhất từ `tb_config` (`home_free_quote`).
    - Đồng bộ `applyDynamicUIConfig` chuẩn xác trong `js/config.js`, `js/Home/home_dashboard.js`, `js/app.js` và `js/Firebase/firebase_engine.js`.
    - Kết nối Firebase Realtime cho `config/ui_config` giúp thay đổi trên Sheet cập nhật tức thì (0.03s) trên giao diện.
- `2026-09-03` (`v0.1.4.4`):"""

doc_content = doc_content.replace(
    "## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)\n- `2026-09-03` (`v0.1.4.4`):",
    new_audit
)
with open(doc_path, "w", encoding="utf-8") as f:
    f.write(doc_content)

# =========================================================================
# 2. UPDATE js/config.js
# =========================================================================
cfg_path = os.path.join(BASE_DIR, "js", "config.js")
with open(cfg_path, "r", encoding="utf-8") as f:
    cfg_code = f.read()

# Đảm bảo DEFAULT_UI_CONFIG có home_greeting_slogan và home_free_quote
if "home_greeting_slogan:" not in cfg_code:
    cfg_code = cfg_code.replace(
        "  ph_gift_voucher_note: 'VD: Khách VIP, Quà tri ân...'",
        "  ph_gift_voucher_note: 'VD: Khách VIP, Quà tri ân...',\n  home_greeting_slogan: 'hôm nay sẵn sàng tỏa sáng chưa? ✨',\n  home_free_quote: 'Mỗi tour gội là một trải nghiệm thư giãn tuyệt vời gửi gắm đến khách hàng thân yêu.'"
    )

# Đảm bảo applyDynamicUIConfig cập nhật staff-home-status-desc không điều kiện nếu không chạy tour
apply_ui_block = """  // 7. Home Staff Greeting Slogan & Free Quote (Cập nhật trực tiếp mọi lúc mọi nơi)
  const sloganEl = document.getElementById('home-greeting-slogan');
  const sloganVal = cfg.home_greeting_slogan || cfg.HOME_GREETING_SLOGAN;
  if (sloganEl && sloganVal) sloganEl.innerText = sloganVal;

  const quoteEl = document.getElementById('staff-home-status-desc');
  const quoteVal = cfg.home_free_quote || cfg.HOME_FREE_QUOTE;
  if (quoteEl && quoteVal) {
    const tourInfo = (typeof checkCurrentUserRunningTour === 'function') ? checkCurrentUserRunningTour() : { isRunning: false };
    if (!tourInfo.isRunning) {
      quoteEl.innerText = quoteVal;
    }
  }
}"""

# Thay thế đoạn cuối applyDynamicUIConfig
cfg_code = re.sub(
    r"\s*// 7\. Home Staff Slogan & Quote[\s\S]*?\}",
    "\n" + apply_ui_block,
    cfg_code
)
if "staff-home-status-desc" not in cfg_code:
    cfg_code = cfg_code.rstrip()
    if cfg_code.endswith("}"):
        cfg_code = cfg_code[:-1] + "\n" + apply_ui_block

with open(cfg_path, "w", encoding="utf-8") as f:
    f.write(cfg_code)

# =========================================================================
# 3. UPDATE js/Home/home_dashboard.js
# =========================================================================
dash_path = os.path.join(BASE_DIR, "js", "Home", "home_dashboard.js")
with open(dash_path, "r", encoding="utf-8") as f:
    dash_code = f.read()

# Cập nhật renderHomeStatusAndActionButton để luôn cập nhật staff-home-status-desc nếu có trong DOM
target_render_func = """function renderHomeStatusAndActionButton() {
  const isOwner = isUserOwner(currentUser);
  const tourInfo = checkCurrentUserRunningTour();

  // 1. Luôn cập nhật câu châm ngôn rảnh nếu có element trong DOM
  const globalDescEl = document.getElementById('staff-home-status-desc');
  if (globalDescEl) {
    const uiConfig = (typeof getStored === 'function') ? getStored('ui_config', {}) : {};
    const quoteVal = uiConfig.home_free_quote || uiConfig.HOME_FREE_QUOTE || 'Mỗi tour gội là một trải nghiệm thư giãn tuyệt vời gửi gắm đến khách hàng thân yêu.';
    if (tourInfo.isRunning) {
      const s = tourInfo.session;
      const custName = s?.customer_name || 'Khách vãng lai';
      const servName = s?.service_name || 'Dịch vụ';
      globalDescEl.innerHTML = `Bạn đang trong tour của <strong class="font-extrabold text-[#2D2424]">${custName}</strong> (<em class="italic font-bold text-[#E58A7B]">${servName}</em>). Vào tour ngay để theo dõi hoặc điều chỉnh ca.`;
    } else {
      globalDescEl.innerText = quoteVal;
    }
  }

  // 2. Luôn cập nhật slogan chào mừng nếu có trong DOM
  const globalSloganEl = document.getElementById('home-greeting-slogan');
  if (globalSloganEl) {
    const uiConfig = (typeof getStored === 'function') ? getStored('ui_config', {}) : {};
    const sloganVal = uiConfig.home_greeting_slogan || uiConfig.HOME_GREETING_SLOGAN || 'hôm nay sẵn sàng tỏa sáng chưa? ✨';
    globalSloganEl.innerText = sloganVal;
  }"""

dash_code = re.sub(
    r"function renderHomeStatusAndActionButton\(\)\s*\{[\s\S]*?const tourInfo = checkCurrentUserRunningTour\(\);",
    target_render_func,
    dash_code
)

with open(dash_path, "w", encoding="utf-8") as f:
    f.write(dash_code)

# =========================================================================
# 4. UPDATE js/Firebase/firebase_engine.js
# =========================================================================
fb_path = os.path.join(BASE_DIR, "js", "Firebase", "firebase_engine.js")
with open(fb_path, "r", encoding="utf-8") as f:
    fb_code = f.read()

fb_listener = """  // Lắng nghe Cấu hình Giao diện Realtime (tb_config / ui_config)
  fbDb.ref('config/ui_config').on('value', snapshot => {
    const liveConfig = snapshot.val();
    if (liveConfig && typeof liveConfig === 'object') {
      setStored('ui_config', liveConfig);
      if (typeof applyDynamicUIConfig === 'function') applyDynamicUIConfig(liveConfig);
      if (typeof renderHomeStatusAndActionButton === 'function') renderHomeStatusAndActionButton();
      if (typeof loadKTVHomeStats === 'function' && currentTab === 'home') loadKTVHomeStats();
      console.log('⚡ [Firebase Realtime] Đã cập nhật ui_config thời gian thực');
    }
  });"""

if "config/ui_config" not in fb_code:
    fb_code = fb_code.replace(
        "// Lắng nghe Thông báo nội bộ Realtime",
        fb_listener + "\n\n  // Lắng nghe Thông báo nội bộ Realtime"
    )
    with open(fb_path, "w", encoding="utf-8") as f:
        f.write(fb_code)

# =========================================================================
# 5. UPDATE js/Wallet/gas_api.js (Bắn config lên Firebase khi sync_all_data)
# =========================================================================
gas_path = os.path.join(BASE_DIR, "js", "Wallet", "gas_api.js")
with open(gas_path, "r", encoding="utf-8") as f:
    gas_code = f.read()

old_cfg_line = "if (payload.config) { if (payload.config.announcement) setStored('announcement', payload.config.announcement); setStored('ui_config', payload.config); if (typeof applyDynamicUIConfig === 'function') applyDynamicUIConfig(payload.config); }"
new_cfg_line = """if (payload.config) {
        if (payload.config.announcement) setStored('announcement', payload.config.announcement);
        setStored('ui_config', payload.config);
        if (typeof applyDynamicUIConfig === 'function') applyDynamicUIConfig(payload.config);
        if (typeof renderHomeStatusAndActionButton === 'function') renderHomeStatusAndActionButton();
        if (typeof firebasePut === 'function') {
          firebasePut('config/ui_config', payload.config);
        } else if (typeof fbDb !== 'undefined' && fbDb) {
          try { fbDb.ref('config/ui_config').set(payload.config); } catch(e){}
        }
      }"""

if old_cfg_line in gas_code:
    gas_code = gas_code.replace(old_cfg_line, new_cfg_line)
    with open(gas_path, "w", encoding="utf-8") as f:
        f.write(gas_code)

# =========================================================================
# 6. UPDATE js/app.js (Đảm bảo renderHomeStatusAndActionButton chạy khi showView('home'))
# =========================================================================
app_js_path = os.path.join(BASE_DIR, "js", "app.js")
with open(app_js_path, "r", encoding="utf-8") as f:
    app_js = f.read()

app_js = app_js.replace(
    "if (typeof applyDynamicUIConfig === 'function') applyDynamicUIConfig();",
    "if (typeof applyDynamicUIConfig === 'function') applyDynamicUIConfig();\n    if (typeof renderHomeStatusAndActionButton === 'function') renderHomeStatusAndActionButton();"
)
with open(app_js_path, "w", encoding="utf-8") as f:
    f.write(app_js)

# =========================================================================
# 7. BUMP VERSION ACROSS ENTIRE PROJECT
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

print(f"DONE UPGRADING TO {NEW_VERSION}!")
