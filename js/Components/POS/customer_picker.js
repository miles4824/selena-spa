// =============================================================
// COMPONENT: CUSTOMER PICKER
// =============================================================
function renderCustomerBadge(customerName, phoneMasked, isVip = false) {
  return `
    <div class="p-3 rounded-2xl bg-[#FAF6F1] border border-[#F0EAE1] flex justify-between items-center text-xs">
      <div>
        <span class="font-extrabold text-[#2D2424]">${customerName}</span>
        <span class="text-[#7E7272] block text-[11px]">${phoneMasked}</span>
      </div>
      ${isVip ? '<span class="px-2 py-0.5 rounded-full bg-[#FFF0EB] text-[#E58A7B] font-extrabold text-[10px]">VIP</span>' : ''}
    </div>
  `;
}
