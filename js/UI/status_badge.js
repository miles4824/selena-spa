// =========================================================================
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
      <div ${idAttr} class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-spa-brand/15 dark:bg-spa-brand/20 text-spa-brand border border-spa-brand/25 dark:border-spa-brand/35 shadow-2xs ${customClass}">
        <span class="w-2 h-2 rounded-full bg-spa-brand animate-pulse"></span>
        <span>Đang trong tour (${elapsedMin}/${targetMin}p)</span>
      </div>
    `;
  }
  return `
    <div ${idAttr} class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#E8F8F5] dark:bg-spa-sage/20 text-spa-sage dark:text-[#88B8AD] border border-spa-teal-border dark:border-spa-sage/40 shadow-2xs ${customClass}">
      <span class="w-2 h-2 rounded-full bg-spa-sage"></span>
      <span>Sẵn sàng phục vụ</span>
    </div>
  `;
}
window.StatusBadge = StatusBadge;
