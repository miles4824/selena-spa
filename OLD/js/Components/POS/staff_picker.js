// =============================================================
// COMPONENT: STAFF PICKER (Chọn KTV làm ca & KTV phụ)
// =============================================================
function renderStaffPillList(staffList, selectedStaffId, onSelectFn) {
  return staffList.map(s => `
    <button type="button" onclick="${onSelectFn}('${s.staff_id || s.phone}')" class="py-2 px-3 rounded-2xl border text-xs font-bold transition cursor-pointer ${s.staff_id === selectedStaffId || s.phone === selectedStaffId ? 'bg-[#E8F8F5] border-[#2E7D6D] text-[#2E7D6D]' : 'bg-[#FAF6F1] border-[#EFE8DF] text-[#7E7272]'}">
      ${s.full_name}
    </button>
  `).join('');
}
