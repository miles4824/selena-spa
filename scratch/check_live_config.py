# -*- coding: utf-8 -*-
import urllib.request
import json

req = urllib.request.Request(
    'https://script.google.com/macros/s/AKfycbwQ-Dwr2zCWWWMPWBCyVIfwDirofgvjD8S7Ug-5OSNLHvM63Gw0nSCa10BqhpD5g8id/exec',
    data=json.dumps({'action': 'sync_all_data'}).encode('utf-8')
)
res = urllib.request.urlopen(req)
raw = res.read().decode('utf-8')
data = json.loads(raw)

payload = data.get('data') or data
cfg = payload.get('config', {})

with open(r"c:\Users\Miles\Downloads\Selena\scratch\live_config_dump.json", "w", encoding="utf-8") as f:
    json.dump(cfg, f, ensure_ascii=False, indent=2)

print("Keys in live config:", len(cfg))
for k, v in cfg.items():
    if "slogan" in k or "quote" in k or "home" in k:
        print(f"  {k}: {repr(v)}")
