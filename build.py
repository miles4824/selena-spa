# -*- coding: utf-8 -*-
import os
import re
import time

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(BASE_DIR, "src")
TEMPLATE_PATH = os.path.join(SRC_DIR, "template.html")
OUTPUT_SPA_PATH = os.path.join(BASE_DIR, "selena-spa.html")
OUTPUT_INDEX_PATH = os.path.join(BASE_DIR, "index.html")

def build():
    start_time = time.time()
    
    if not os.path.exists(TEMPLATE_PATH):
        print(f"ERROR: Template not found at {TEMPLATE_PATH}")
        return

    with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
        template = f.read()

    def replace_include(match):
        rel_path = match.group(1).strip()
        full_path = os.path.join(SRC_DIR, rel_path)
        if os.path.exists(full_path):
            with open(full_path, "r", encoding="utf-8") as inc_file:
                return inc_file.read()
        else:
            print(f"WARNING: Include file not found: {full_path}")
            return f"<!-- MISSING INCLUDE: {rel_path} -->"

    compiled_html = re.sub(r'<!--\s*INCLUDE:\s*(.*?)\s*-->', replace_include, template)

    with open(OUTPUT_SPA_PATH, "w", encoding="utf-8") as f:
        f.write(compiled_html)

    with open(OUTPUT_INDEX_PATH, "w", encoding="utf-8") as f:
        f.write(compiled_html)

    elapsed = (time.time() - start_time) * 1000
    size_kb = len(compiled_html.encode('utf-8')) / 1024
    print(f"[OK] Build Completed in {elapsed:.2f}ms! Output: index.html & selena-spa.html ({size_kb:.2f} KB)")

if __name__ == "__main__":
    build()
