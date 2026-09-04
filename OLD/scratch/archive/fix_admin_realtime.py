# -*- coding: utf-8 -*-
import os
import re

BASE_DIR = r"c:\Users\Miles\Downloads\Selena"
NEW_VERSION = "v0.1.4.6"

# 1. Update docs
doc_path = os.path.join(BASE_DIR, "docs", "Home", "home_dashboard.md")
with open(doc_path, "r", encoding="utf-8") as f:
    doc_content = f.read()

new_audit = f"""## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-03` (`{NEW_VERSION}`):
  + Tự động cập nhật tức thì màn hình Admin khi KTV kết thúc tour mà không cần bấm F5:
    - Bổ sung `renderAdminLiveRunningTours()` và `renderAdminTodaySnapshot()` vào listener `live_sessions` của Firebase Realtime.
    - Dọn sạch session cũ trên `localStorage` khi tour đã hoàn thành trên Firebase, tránh tình trạng hiện thẻ ma (Ghost Card Giường số 01).
- `2026-09-03` (`v0.1.4.5`):"""

doc_content = doc_content.replace(
    "## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)\n- `2026-09-03` (`v0.1.4.5`):",
    new_audit
)
with open(doc_path, "w", encoding="utf-8") as f:
    f.write(doc_content)

# 2. Update Firebase Engine
fb_path = os.path.join(BASE_DIR, "js", "Firebase", "firebase_engine.js")
with open(fb_path, "r", encoding="utf-8") as f:
    fb_code = f.read()

# Add auto re-render in live_sessions listener
old_ls_end = """    } else if (currentLiveSession) {
      if (typeof liveTimerInterval !== 'undefined') clearInterval(liveTimerInterval);
      currentLiveSession = null;
      localStorage.removeItem('selena_active_live_session');
      if (typeof renderLiveSessionUI === 'function') renderLiveSessionUI();
    }
  });"""

new_ls_end = """    } else if (currentLiveSession) {
      if (typeof liveTimerInterval !== 'undefined') clearInterval(liveTimerInterval);
      currentLiveSession = null;
      localStorage.removeItem('selena_active_live_session');
      if (typeof renderLiveSessionUI === 'function') renderLiveSessionUI();
    }

    // TỰ ĐỘNG CẬP NHẬT TỨC THÌ CHO MÀN HÌNH ADMIN VÀ STAFF KHÔNG CẦN F5
    if (typeof renderAdminLiveRunningTours === 'function') renderAdminLiveRunningTours();
    if (typeof renderAdminTodaySnapshot === 'function') renderAdminTodaySnapshot();
    if (typeof renderHomeStatusAndActionButton === 'function') renderHomeStatusAndActionButton();
    if (typeof loadKTVHomeStats === 'function' && currentTab === 'home') loadKTVHomeStats();
  });"""

fb_code = fb_code.replace(old_ls_end, new_ls_end)
with open(fb_path, "w", encoding="utf-8") as f:
    f.write(fb_code)

# 3. Update home_dashboard.js: Không lưu session ma từ localStorage nếu trên Firebase đã xóa
dash_path = os.path.join(BASE_DIR, "js", "Home", "home_dashboard.js")
with open(dash_path, "r", encoding="utf-8") as f:
    dash_code = f.read()

old_ghost_check = """  // Kiểm tra thêm session lưu cục bộ trên máy
  try {
    const saved = localStorage.getItem('selena_active_live_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.session_id) {
        allSessions.unshift(parsed);
      }
    }
  } catch (e) {}"""

new_ghost_check = """  // Kiểm tra thêm session lưu cục bộ trên máy (chỉ lấy nếu còn tồn tại trên Firebase hoặc mới tạo)
  try {
    const saved = localStorage.getItem('selena_active_live_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.session_id) {
        const stillInFb = allSessions.some(s => s.session_id === parsed.session_id);
        if (stillInFb) {
          // đã có
        } else if ((now - Number(parsed.start_timestamp || 0)) < 15000) {
          allSessions.unshift(parsed);
        } else {
          localStorage.removeItem('selena_active_live_session');
        }
      }
    }
  } catch (e) {}"""

dash_code = dash_code.replace(old_ghost_check, new_ghost_check)
with open(dash_path, "w", encoding="utf-8") as f:
    f.write(dash_code)

# 4. Bump version
idx_file = os.path.join(BASE_DIR, "index.html")
with open(idx_file, "r", encoding="utf-8") as f:
    html = f.read()
html = re.sub(r"\?v=v0\.1\.4\.5", f"?v={NEW_VERSION}", html)
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

print("DONE FIXING!")
