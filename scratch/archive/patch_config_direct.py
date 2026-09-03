# -*- coding: utf-8 -*-
import os

cfg_path = r"c:\Users\Miles\Downloads\Selena\js\config.js"
with open(cfg_path, "r", encoding="utf-8") as f:
    content = f.read()

target = "  if (giftNote && cfg.ph_gift_voucher_note) giftNote.placeholder = cfg.ph_gift_voucher_note;\n}"
replacement = """  if (giftNote && cfg.ph_gift_voucher_note) giftNote.placeholder = cfg.ph_gift_voucher_note;

  // 7. Home Staff Slogan & Quote
  const sloganEl = document.getElementById('home-greeting-slogan');
  const sloganVal = cfg.home_greeting_slogan || cfg.HOME_GREETING_SLOGAN;
  if (sloganEl && sloganVal) sloganEl.innerText = sloganVal;

  const quoteEl = document.getElementById('staff-home-status-desc');
  const quoteVal = cfg.home_free_quote || cfg.HOME_FREE_QUOTE;
  const tourInfo = (typeof checkCurrentUserRunningTour === 'function') ? checkCurrentUserRunningTour() : { isRunning: false };
  if (quoteEl && quoteVal && !tourInfo.isRunning) quoteEl.innerText = quoteVal;
}"""

if target in content:
    content = content.replace(target, replacement)
    with open(cfg_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("SUCCESS: Updated js/config.js!")
else:
    print("TARGET NOT FOUND! Let's inspect target.")
