// =============================================================
// COMPONENT: ADDON SERVICE PICKER (Dịch vụ làm thêm)
// =============================================================
function renderAddonServiceList(addons, selectedAddonIds = [], onToggleFn) {
  return addons.map(a => {
    const isSelected = selectedAddonIds.includes(a.service_id);
    return `
      <button type="button" onclick="${onToggleFn}('${a.service_id}')" class="p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition cursor-pointer ${isSelected ? 'bg-[#E8F8F5] border-[#2E7D6D] text-[#2E7D6D]' : 'bg-[#FAF6F1] border-[#EFE8DF] text-[#7E7272]'}">
        <span>${a.service_name} (+${a.duration_min}p)</span>
        <span>+${Number(a.price).toLocaleString('vi-VN')} đ</span>
      </button>
    `;
  }).join('');
}
