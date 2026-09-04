// =========================================================================
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
    mint: { 
      bg: 'bg-[#E8F8F5] dark:bg-[#2F3E46]', 
      border: 'border-[#B7EBDD] dark:border-[#5E887E]/40', 
      text: 'text-[#2E7D6D] dark:text-[#88B8AD]' 
    },
    blue: { 
      bg: 'bg-[#EBF5FB] dark:bg-[#2F3E46]', 
      border: 'border-[#D4E6F1] dark:border-[#A7C7E7]/40', 
      text: 'text-[#2980B9] dark:text-[#A7C7E7]' 
    },
    purple: { 
      bg: 'bg-[#F5EEF8] dark:bg-[#2F3E46]', 
      border: 'border-[#E8DAEF] dark:border-[#E8AEB7]/40', 
      text: 'text-[#8E44AD] dark:text-[#E8AEB7]' 
    },
    coral: { 
      bg: 'bg-gradient-to-br from-[#E8AEB7] to-[#D995A0] dark:from-[#2F3E46] dark:to-[#263339]', 
      border: 'border-transparent dark:border-[#E8AEB7]/40', 
      text: 'text-white dark:text-[#E8AEB7]' 
    }
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
  const numColor = isCoral ? 'text-white dark:text-white' : 'text-[#2D2424] dark:text-white';
  const subColor = isCoral ? 'text-white/90 dark:text-white/70' : `${c.text} dark:text-white/70`;

  return `
    <div class="p-4 sm:p-5 rounded-3xl ${c.bg} border ${c.border} stat-card-theme-${color} space-y-1 shadow-xs transition-all duration-300 ${customClass}">
      <div class="flex items-center gap-1.5">
        <span class="text-xs font-bold ${c.text} uppercase tracking-wider block">${title}</span>
        ${eyeBtn}
      </div>
      <div ${valueClick} class="text-2xl sm:text-3xl font-extrabold font-mono ${numColor} stat-card-val tracking-tight ${valueCursor}" id="${id}">${value}</div>
      <span class="text-xs ${subColor} font-medium block">${subtitle}</span>
    </div>
  `;
}
window.StatCard = StatCard;
