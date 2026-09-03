# -*- coding: utf-8 -*-
import os
import re

BASE_DIR = r"c:\Users\Miles\Downloads\Selena"
RESET_VERSION = "v0.0.0.0"

# 1. Update index.html
idx_path = os.path.join(BASE_DIR, "index.html")
with open(idx_path, "r", encoding="utf-8") as f:
    html = f.read()
html = re.sub(r"\?v=v\d+\.\d+\.\d+\.\d+", f"?v={RESET_VERSION}", html)
with open(idx_path, "w", encoding="utf-8") as f:
    f.write(html)

# 2. Update js/config.js
cfg_path = os.path.join(BASE_DIR, "js", "config.js")
with open(cfg_path, "r", encoding="utf-8") as f:
    cfg = f.read()
cfg = re.sub(r"const APP_VERSION = '[^']+';", f"const APP_VERSION = '{RESET_VERSION}';", cfg)
with open(cfg_path, "w", encoding="utf-8") as f:
    f.write(cfg)

# 3. Update views/login.html
login_path = os.path.join(BASE_DIR, "views", "login.html")
with open(login_path, "r", encoding="utf-8") as f:
    login = f.read()
login = re.sub(r"v\d+\.\d+\.\d+\.\d+(\.\d+)? • Selena Spa[^<]*", f"{RESET_VERSION} • Selena Spa", login)
with open(login_path, "w", encoding="utf-8") as f:
    f.write(login)

# 4. Update docs/Core/ui_system.md
ui_doc_path = os.path.join(BASE_DIR, "docs", "Core", "ui_system.md")
with open(ui_doc_path, "r", encoding="utf-8") as f:
    ui_doc = f.read()
ui_doc = ui_doc.replace("`v0.1.5.0`", f"`{RESET_VERSION}`")
with open(ui_doc_path, "w", encoding="utf-8") as f:
    f.write(ui_doc)

# 5. Update docs/Home/home_dashboard.md
home_doc_path = os.path.join(BASE_DIR, "docs", "Home", "home_dashboard.md")
with open(home_doc_path, "r", encoding="utf-8") as f:
    home_doc = f.read()
home_doc = home_doc.replace("`v0.1.5.0`", f"`{RESET_VERSION}` (Reset mốc phiên bản nâng cấp UI Component)")
with open(home_doc_path, "w", encoding="utf-8") as f:
    f.write(home_doc)

print(f"RESET ALL VERSIONS TO {RESET_VERSION} SUCCESSFULLY!")
