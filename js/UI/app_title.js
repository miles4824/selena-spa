// =========================================================================
// UI COMPONENT: APP TITLE (CHUYÊN QUẢN LÝ TIÊU ĐỀ TOÀN HỆ THỐNG - TAILWIND 4)
// =========================================================================
function AppTitle({
  text = '',
  configKey = '',
  defaultText = '',
  icon = '',
  iconColor = 'text-spa-brand',
  level = 'section', // 'section' | 'page' | 'card' | 'modal'
  rightText = '',
  rightAction = '',
  customClass = '',
  id = ''
} = {}) {
  // 1. Xác định nội dung chữ: Ưu tiên lấy từ tb_config trên Sheet nếu có configKey
  let titleContent = text;
  if (configKey) {
    const uiConfig = (typeof getStored === 'function') ? getStored('ui_config', {}) : {};
    const defaultTitles = (typeof DEFAULT_UI_TITLES !== 'undefined') ? DEFAULT_UI_TITLES : {};
    titleContent = uiConfig[configKey] || uiConfig[configKey.toUpperCase()] || defaultTitles[configKey] || defaultText || text;
  }
  if (!titleContent && defaultText) titleContent = defaultText;

  // 2. Định hình khuôn mẫu UI Tailwind 4 chuẩn mực (Tự động thích ứng Dark/Light Mode)
  const styles = {
    section: 'text-xs font-extrabold uppercase tracking-wider text-spa-muted',
    page: 'text-2xl font-serif font-medium text-spa-dark dark:text-white',
    card: 'text-xs font-bold uppercase tracking-wider text-spa-muted',
    modal: 'text-base sm:text-lg font-bold text-spa-dark dark:text-white font-serif tracking-tight'
  };

  const idAttr = id ? `id="${id}"` : '';
  const iconHtml = icon ? `<i data-lucide="${icon}" class="w-5 h-5 ${iconColor}"></i>` : '';
  const rightHtml = rightAction ? rightAction : (rightText ? `<span class="text-[11px] text-spa-hint font-medium">${rightText}</span>` : '');

  // Nếu là cấp section có khu vực bên phải (rightText / rightAction) -> Trả về flex row 2 đầu
  if (level === 'section' && (rightText || rightAction)) {
    return `
      <div class="flex items-center justify-between px-1 ${customClass}">
        <span ${idAttr} class="${styles[level]} flex items-center gap-1.5">
          ${icon ? `<i data-lucide="${icon}" class="w-4 h-4 ${iconColor}"></i>` : ''}
          <span>${titleContent}</span>
        </span>
        ${rightHtml}
      </div>
    `;
  }

  return `
    <span ${idAttr} class="${styles[level] || styles.section} flex items-center gap-2 ${customClass}">
      ${iconHtml}
      <span>${titleContent}</span>
    </span>
  `;
}
window.AppTitle = AppTitle;
