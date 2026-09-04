# -*- coding: utf-8 -*-
import os

BASE_DIR = r"c:\Users\Miles\Downloads\Selena"

# 1. REMOVE modal-edit-live-services from views/add.html
add_path = os.path.join(BASE_DIR, "views", "add.html")
with open(add_path, "r", encoding="utf-8") as f:
    add_text = f.read()

split_marker = "<!-- MODAL ĐỔI & THÊM DỊCH VỤ GIỮA CA PHỤC VỤ"
if split_marker in add_text:
    add_text = add_text.split(split_marker)[0].rstrip() + "\n"
    with open(add_path, "w", encoding="utf-8") as f:
        f.write(add_text)
    print("Cleaned views/add.html: Removed embedded modal completely!")
else:
    print("Marker not found in views/add.html")

# 2. ADD views/components/modals/modal_edit_live_services.html to js/app.js
app_path = os.path.join(BASE_DIR, "js", "app.js")
with open(app_path, "r", encoding="utf-8") as f:
    app_text = f.read()

target_line = "'views/components/modals/modal_gift_voucher.html'"
replacement_line = "'views/components/modals/modal_gift_voucher.html',\n    'views/components/modals/modal_edit_live_services.html'"

if "modal_edit_live_services.html" not in app_text:
    app_text = app_text.replace(target_line, replacement_line)
    with open(app_path, "w", encoding="utf-8") as f:
        f.write(app_text)
    print("Added modal_edit_live_services.html to modalFiles in js/app.js!")
else:
    print("Already in js/app.js")
