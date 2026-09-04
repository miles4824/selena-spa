// =========================================================================
// UI COMPONENT: ROLE BADGE (HUY HIỆU VAI TRÒ / CHỨC DANH TOÀN APP - TAILWIND 4)
// Owner: Hoàng gia vàng | Staff: Cam đào thanh thoát
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
      <span ${idAttr} class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF9C3] text-[#854D0E] border border-[#FEF08A] shadow-2xs ${customClass}">
        <span>👑</span>
        <span>Chủ Sáng Lập</span>
      </span>
    `;
  }

  return `
    <span ${idAttr} class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF0EB] text-[#E58A7B] border border-[#FCDFD7] shadow-2xs ${customClass}">
      <span>💆</span>
      <span>Kỹ Thuật Viên</span>
    </span>
  `;
}
window.RoleBadge = RoleBadge;
