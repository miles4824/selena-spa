// =========================================================================
// UI COMPONENT: APP BUTTON (CHUYÊN QUẢN LÝ NÚT BẤM TOÀN HỆ THỐNG - TAILWIND 4)
// =========================================================================
function AppButton({
  text = '',
  icon = '',            // Tên Lucide icon ('log-in', 'arrow-right'...) HOẶC chuỗi SVG: '<svg ...>...</svg>'
  iconSvg = '',         // Tùy chọn riêng nếu muốn truyền trực tiếp mã SVG thô
  iconPosition = 'left',// 'left' (đi liền trước text) | 'right' (đi liền sau text) | 'start' (ghim ở đầu mép trái, text chính giữa) | 'end' (ghim ở đuôi mép phải, text chính giữa)
  iconTrailing = '',    // Icon phụ ở đuôi (nếu muốn có thêm icon ở cuối)
  variant = 'primary',  // 'primary' (Dusty Rose #E8AEB7) | 'teal' (Sage #5E887E) | 'secondary' | 'danger'
  size = 'lg',          // 'lg' (Home/Login) | 'md' (POS/Modal) | 'sm' (List/Table)
  onClick = '',
  customClass = '',
  id = '',
  type = 'button',
  disabled = false
} = {}) {
  const variantStyles = {
    primary: 'bg-spa-brand hover:bg-spa-brand-hover text-white shadow-glow-brand font-bold',
    teal: 'bg-spa-sage hover:bg-spa-sage/90 text-white shadow-glow-sage font-bold',
    secondary: 'bg-spa-bg hover:bg-spa-sage-light text-spa-dark border border-spa-border font-semibold',
    danger: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50 font-bold'
  };

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-1.5 min-h-[34px]',
    md: 'px-5 py-2.5 text-xs sm:text-sm rounded-2xl gap-2 min-h-[42px]',
    lg: 'w-full sm:w-auto px-7 py-3.5 text-sm sm:text-base rounded-full gap-2.5 min-h-[48px]'
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
    md: 'w-4 h-4 sm:w-5 sm:h-5',
    lg: 'w-4 h-4 sm:w-5 sm:h-5'
  };

  const idAttr = id ? `id="${id}"` : '';
  const typeAttr = type ? `type="${type}"` : 'type="button"';
  const disabledAttr = disabled ? 'disabled' : '';

  // Màu sắc icon đồng bộ theo variant
  const iconColor = (variant === 'primary' || variant === 'teal') ? 'text-white' : 'text-spa-dark dark:text-white';
  const activeIcon = iconSvg || icon;
  const currentIconSize = iconSizes[size] || iconSizes.lg;

  // Helper render icon: hỗ trợ cả Lucide name lẫn mã SVG thô
  const renderIconContent = (ic) => {
    if (!ic) return '';
    const str = String(ic).trim();
    if (str.startsWith('<svg') || str.startsWith('<span') || str.startsWith('<i') || str.startsWith('<img')) {
      return `<span class="inline-flex items-center justify-center shrink-0 ${iconColor}">${str}</span>`;
    }
    return `<i data-lucide="${str}" class="${currentIconSize} ${iconColor} shrink-0"></i>`;
  };

  const mainIconHtml = renderIconContent(activeIcon);
  const trailingIconHtml = renderIconContent(iconTrailing);

  // Xử lý bố cục hiển thị theo iconPosition
  let contentHtml = '';
  const isPrimary = (variant === 'primary');
  const textClass = isPrimary ? 'text-white' : '';

  if (!text) {
    // Trường hợp nút chỉ có icon (Icon-only button)
    contentHtml = mainIconHtml || trailingIconHtml;
  } else if (iconPosition === 'start' && mainIconHtml) {
    // 1. Icon ghim ở mép đầu bên trái, text căn chính giữa tuyệt đối
    contentHtml = `
      <span class="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
        ${mainIconHtml}
      </span>
      <span class="w-full text-center px-6 ${textClass}">${text}</span>
      ${trailingIconHtml ? `<span class="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">${trailingIconHtml}</span>` : ''}
    `;
  } else if (iconPosition === 'end' && mainIconHtml) {
    // 2. Text căn chính giữa tuyệt đối, icon ghim ở mép đuôi bên phải
    contentHtml = `
      <span class="w-full text-center px-6 ${textClass}">${text}</span>
      <span class="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
        ${mainIconHtml}
      </span>
    `;
  } else if (iconPosition === 'right') {
    // 3. Icon đi liền ngay sau text (cả cụm ở giữa)
    contentHtml = `
      <span class="${textClass}">${text}</span>
      ${mainIconHtml}
      ${trailingIconHtml}
    `;
  } else {
    // 4. Mặc định 'left': Icon đi liền ngay trước text (cả cụm ở giữa)
    contentHtml = `
      ${mainIconHtml}
      <span class="${textClass}">${text}</span>
      ${trailingIconHtml}
    `;
  }

  // Nếu là dạng 'start' hoặc 'end', button cần có class 'relative'
  const isEdgePosition = (iconPosition === 'start' || iconPosition === 'end' || trailingIconHtml);
  const positionClass = isEdgePosition ? 'relative' : '';

  return `
    <button ${idAttr} ${typeAttr} ${disabledAttr} onclick="${onClick}" class="transition flex items-center justify-center cursor-pointer active:scale-95 select-none ${positionClass} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.lg} ${customClass}">
      ${contentHtml}
    </button>
  `;
}
if (typeof window !== 'undefined') window.AppButton = AppButton;
if (typeof globalThis !== 'undefined') globalThis.AppButton = AppButton;
