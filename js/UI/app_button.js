// =========================================================================
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
