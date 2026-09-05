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
  isMasked = true,
  privacyEyeId = '',
  onPrivacyToggle = '',
  customClass = ''
} = {}) {
  const colorStyles = {
    mint: { 
      bg: 'bg-spa-sage-light dark:bg-spa-card', 
      border: 'border-spa-teal-border dark:border-spa-sage/40', 
      text: 'text-spa-sage dark:text-spa-sage' 
    },
    blue: { 
      bg: 'bg-spa-mist/15 dark:bg-spa-card', 
      border: 'border-spa-mist/40 dark:border-spa-mist/40', 
      text: 'text-spa-dark dark:text-spa-mist' 
    },
    purple: { 
      bg: 'bg-spa-peach-light dark:bg-spa-card', 
      border: 'border-spa-peach-border dark:border-spa-brand/40', 
      text: 'text-spa-brand dark:text-spa-brand' 
    },
    coral: { 
      bg: 'stat-card-coral', 
      border: 'border-transparent dark:border-spa-brand/40', 
      text: 'text-white dark:text-spa-brand' 
    }
  };

  const c = colorStyles[color] || colorStyles.mint;
  const isCoral = color === 'coral';

  const eyeBtn = isPrivacy ? `
    <button type="button" onclick="${onPrivacyToggle}" class="${c.text}/70 hover:${c.text} p-0.5 cursor-pointer transition" title="Ẩn/hiện số tiền">
      <i id="${privacyEyeId}" data-lucide="${isMasked ? 'eye-off' : 'eye'}" class="w-3.5 h-3.5"></i>
    </button>
  ` : '';

  const valueClick = isPrivacy ? `onclick="${onPrivacyToggle}"` : '';
  const valueCursor = isPrivacy ? 'cursor-pointer select-none' : '';
  const numColor = isCoral ? 'text-white dark:text-white' : 'text-spa-dark dark:text-white';
  const subColor = isCoral ? 'text-white/90 dark:text-white/70' : `${c.text} dark:text-white/70`;

  return `
    <div class="p-4 sm:p-5 rounded-3xl ${c.bg} border ${c.border} stat-card-theme-${color} space-y-1 shadow-xs transition-all duration-300 ${customClass}" style="-webkit-mask-image: -webkit-radial-gradient(white, black); border-radius: 24px; -webkit-border-radius: 24px; isolation: isolate; transform: translateZ(0);">
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
