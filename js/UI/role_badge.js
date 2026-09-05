// =========================================================================
// UI COMPONENT: ROLE BADGE (HUY HIỆU VAI TRÒ / CHỨC DANH TOÀN APP - TAILWIND 4)
// Owner: Hoàng gia vàng | Staff: Dusty Rose thanh thoát
// =========================================================================
function RoleBadge({
  role = 'staff',     // 'owner' | 'staff'
  customClass = '',
  id = ''
} = {}) {
  const isOwner = String(role).toLowerCase() === 'owner';
  const idAttr = id ? `id="${id}"` : '';

  if (isOwner) {
    return `
      <span ${idAttr} class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 shadow-2xs ${customClass}">
        <span>👑</span>
        <span>Chủ Sáng Lập</span>
      </span>
    `;
  }

  return `
    <span ${idAttr} class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-spa-brand/15 dark:bg-spa-brand/20 text-spa-brand border border-spa-brand/25 dark:border-spa-brand/35 shadow-2xs ${customClass}">
      <span>💆</span>
      <span>Kỹ Thuật Viên</span>
    </span>
  `;
}
window.RoleBadge = RoleBadge;
