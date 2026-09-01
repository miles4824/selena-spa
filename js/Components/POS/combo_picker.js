// =============================================================
// COMPONENT: COMBO PICKER (Gói combo chính)
// =============================================================
function renderComboPills(combos, activeComboId, onSelectFn) {
  return combos.map(c => `
    <button type="button" onclick="${onSelectFn}('${c.service_id}')" class="py-2 px-3 rounded-2xl border text-xs font-bold transition cursor-pointer ${c.service_id === activeComboId ? 'bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B]' : 'bg-[#FAF6F1] border-[#EFE8DF] text-[#7E7272]'}">
      ${c.service_name}
    </button>
  `).join('');
}
