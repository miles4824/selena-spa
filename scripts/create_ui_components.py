# -*- coding: utf-8 -*-
import os

base = r"c:\Users\Miles\Downloads\Selena\js\Core\Components"
os.makedirs(base, exist_ok=True)

# 1. app_button.js
app_button_code = """// =========================================================================
// UI COMPONENT: APP BUTTON (CHUYÊN QUẢN LÝ NÚT BẤM TOÀN HỆ THỐNG - TAILWIND 4)
// =========================================================================
function AppButton({
  text = '',
  icon = '',
  variant = 'primary', // 'primary' | 'teal' | 'secondary' | 'danger'
  size = 'lg',        // 'lg' (Home) | 'md' (POS/Modal) | 'sm' (List/Table)
  onClick = '',
  customClass = '',
  id = ''
} = {}) {
  const variantStyles = {
    primary: 'bg-gradient-to-r from-[#E58A7B] to-[#F09A8D] hover:opacity-95 text-white shadow-lg shadow-[#E58A7B]/25',
    teal: 'bg-gradient-to-r from-[#2E7D6D] to-[#3B9E8B] hover:opacity-95 text-white shadow-lg shadow-[#2E7D6D]/25',
    secondary: 'bg-[#FAF6F1] hover:bg-[#FFF0EB] text-[#2D2424] border border-[#EFE8DF]',
    danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
  };

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-1.5 font-bold',
    md: 'px-5 py-2.5 text-xs sm:text-sm rounded-2xl gap-2 font-bold',
    lg: 'w-full sm:w-auto px-7 py-3.5 text-sm sm:text-base rounded-full gap-2.5 font-extrabold'
  };

  const idAttr = id ? `id="${id}"` : '';
  const iconHtml = icon ? `<i data-lucide="${icon}" class="w-4 h-4 sm:w-5 sm:h-5"></i>` : '';

  return `
    <button ${idAttr} onclick="${onClick}" class="transition flex items-center justify-center cursor-pointer active:scale-95 ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.lg} ${customClass}">
      ${iconHtml}
      <span>${text}</span>
    </button>
  `;
}
window.AppButton = AppButton;
"""
with open(os.path.join(base, "app_button.js"), "w", encoding="utf-8") as f:
    f.write(app_button_code)

# 2. stat_card.js
stat_card_code = """// =========================================================================
// UI COMPONENT: STAT CARD (CHUYÊN QUẢN LÝ THẺ CHỈ SỐ & THÀNH TÍCH - TAILWIND 4)
// =========================================================================
function StatCard({
  id = '',
  title = '',
  value = '0',
  subtitle = '',
  color = 'mint', // 'mint' | 'blue' | 'purple' | 'coral'
  isPrivacy = false,
  privacyEyeId = '',
  onPrivacyToggle = '',
  customClass = ''
} = {}) {
  const colorStyles = {
    mint: { bg: 'bg-[#E8F8F5]', border: 'border-[#B7EBDD]', text: 'text-[#2E7D6D]' },
    blue: { bg: 'bg-[#EBF5FB]', border: 'border-[#D4E6F1]', text: 'text-[#2980B9]' },
    purple: { bg: 'bg-[#F5EEF8]', border: 'border-[#E8DAEF]', text: 'text-[#8E44AD]' },
    coral: { bg: 'bg-[#E58A7B]', border: 'border-transparent', text: 'text-white' }
  };

  const c = colorStyles[color] || colorStyles.mint;
  const isCoral = color === 'coral';

  const eyeBtn = isPrivacy ? `
    <button type="button" onclick="${onPrivacyToggle}" class="${c.text}/70 hover:${c.text} p-0.5 cursor-pointer transition" title="Ẩn/hiện số tiền">
      <i id="${privacyEyeId}" data-lucide="eye-off" class="w-3.5 h-3.5"></i>
    </button>
  ` : '';

  const valueClick = isPrivacy ? `onclick="${onPrivacyToggle}"` : '';
  const valueCursor = isPrivacy ? 'cursor-pointer select-none' : '';
  const numColor = isCoral ? 'text-white' : 'text-[#2D2424]';
  const subColor = isCoral ? 'text-white/90' : c.text;

  return `
    <div class="p-4 sm:p-5 rounded-3xl ${c.bg} border ${c.border} space-y-1 shadow-xs ${customClass}">
      <div class="flex items-center gap-1.5">
        <span class="text-xs font-bold ${c.text} uppercase tracking-wider block">${title}</span>
        ${eyeBtn}
      </div>
      <div ${valueClick} class="text-2xl sm:text-3xl font-extrabold font-mono ${numColor} tracking-tight ${valueCursor}" id="${id}">${value}</div>
      <span class="text-xs ${subColor} font-medium block">${subtitle}</span>
    </div>
  `;
}
window.StatCard = StatCard;
"""
with open(os.path.join(base, "stat_card.js"), "w", encoding="utf-8") as f:
    f.write(stat_card_code)

# 3. status_badge.js
status_badge_code = """// =========================================================================
// UI COMPONENT: STATUS BADGE (CHUYÊN QUẢN LÝ HUY HIỆU TRẠNG THÁI - TAILWIND 4)
// =========================================================================
function StatusBadge({
  status = 'free', // 'free' | 'busy'
  elapsedMin = 0,
  targetMin = 45,
  customClass = '',
  id = ''
} = {}) {
  const idAttr = id ? `id="${id}"` : '';
  if (status === 'busy') {
    return `
      <div ${idAttr} class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FFF0EB] text-[#E58A7B] border border-[#FCDFD7] shadow-2xs ${customClass}">
        <span class="w-2 h-2 rounded-full bg-[#E58A7B] animate-pulse"></span>
        <span>Đang trong tour (${elapsedMin}/${targetMin}p)</span>
      </div>
    `;
  }
  return `
    <div ${idAttr} class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#E8F8F5] text-[#2E7D6D] border border-[#B7EBDD] shadow-2xs ${customClass}">
      <span class="w-2 h-2 rounded-full bg-[#2E7D6D]"></span>
      <span>Sẵn sàng phục vụ</span>
    </div>
  `;
}
window.StatusBadge = StatusBadge;
"""
with open(os.path.join(base, "status_badge.js"), "w", encoding="utf-8") as f:
    f.write(status_badge_code)

print("Created app_button.js, stat_card.js, status_badge.js successfully!")
