// =========================================================================
// UI COMPONENT: APP TITLE (CHUYÊN QUẢN LÝ TIÊU ĐỀ TOÀN HỆ THỐNG - TAILWIND 4)
// =========================================================================
function AppTitle({
  text = '',
  configKey = '',
  defaultText = '',
  icon = '',
  iconColor = 'text-[#E58A7B]',
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
    titleContent = uiConfig[configKey] || uiConfig[configKey.toUpperCase()] || defaultText || text;
  }
  if (!titleContent && defaultText) titleContent = defaultText;

  // 2. Định hình khuôn mẫu UI Tailwind 4 chuẩn mực (Không bao giờ bị lệch kiểu dáng)
  const styles = {
    section: 'text-xs font-extrabold uppercase tracking-wider text-[#7E7272]',
    page: 'text-2xl font-serif font-medium text-[#2D2424]',
    card: 'text-xs font-bold uppercase tracking-wider text-[#7E7272]',
    modal: 'text-base sm:text-lg font-bold text-[#2D2424] font-serif tracking-tight'
  };

  const idAttr = id ? `id="${id}"` : '';
  const iconHtml = icon ? `<i data-lucide="${icon}" class="w-5 h-5 ${iconColor}"></i>` : '';
  const rightHtml = rightAction ? rightAction : (rightText ? `<span class="text-[11px] text-[#A39696] font-medium">${rightText}</span>` : '');

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
