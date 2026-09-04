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
      <div ${idAttr} class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FFF0EB] dark:bg-[#E8AEB7]/20 text-[#E8AEB7] border border-[#FCDFD7] dark:border-[#E8AEB7]/40 shadow-2xs ${customClass}">
        <span class="w-2 h-2 rounded-full bg-[#E8AEB7] animate-pulse"></span>
        <span>Đang trong tour (${elapsedMin}/${targetMin}p)</span>
      </div>
    `;
  }
  return `
    <div ${idAttr} class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#E8F8F5] dark:bg-[#5E887E]/20 text-[#2E7D6D] dark:text-[#88B8AD] border border-[#B7EBDD] dark:border-[#5E887E]/40 shadow-2xs ${customClass}">
      <span class="w-2 h-2 rounded-full bg-[#5E887E]"></span>
      <span>Sẵn sàng phục vụ</span>
    </div>
  `;
}
window.StatusBadge = StatusBadge;
