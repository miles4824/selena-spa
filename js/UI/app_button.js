// =========================================================================
// UI COMPONENT: APP BUTTON (CHUYÊN QUẢN LÝ NÚT BẤM TOÀN HỆ THỐNG - TAILWIND 4)
// =========================================================================
function AppButton({
  text = '',
  icon = '',
  variant = 'primary', // 'primary' (Dusty Rose #E8AEB7) | 'teal' (Sage #5E887E) | 'secondary' | 'danger'
  size = 'lg',        // 'lg' (Home/Login) | 'md' (POS/Modal) | 'sm' (List/Table)
  onClick = '',
  customClass = '',
  id = ''
} = {}) {
  const variantStyles = {
    primary: 'bg-spa-brand hover:bg-spa-brand-hover text-white shadow-lg shadow-spa-brand/25 font-bold',
    teal: 'bg-spa-sage hover:bg-spa-sage/90 text-white shadow-lg shadow-spa-sage/25 font-bold',
    secondary: 'bg-spa-bg hover:bg-spa-sage-light text-spa-dark border border-spa-border font-semibold',
    danger: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50 font-bold'
  };

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-1.5',
    md: 'px-5 py-2.5 text-xs sm:text-sm rounded-2xl gap-2',
    lg: 'w-full sm:w-auto px-7 py-3.5 text-sm sm:text-base rounded-full gap-2.5'
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
