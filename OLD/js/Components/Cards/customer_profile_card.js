// =============================================================
// COMPONENT: CUSTOMER PROFILE CARD (Chu kỳ 60 ngày & Ví voucher)
// =============================================================
function renderCustomerProfileCard(c, onEditFn, onGiftFn) {
  const pMask = typeof PhoneMasker !== 'undefined' ? PhoneMasker.mask(c.phone_number || c.raw_phone, false) : (c.phone_number || '');
  const bDayText = c.birth_month ? `Tháng ${c.birth_month}` : 'Chưa có';
  return `
    <div class="bg-white rounded-[24px] border border-[#F0EAE1] p-4 shadow-sm space-y-2">
      <div class="flex justify-between items-start">
        <div>
          <h4 class="font-extrabold text-[#2D2424] text-sm">${c.customer_name || 'Khách hàng'}</h4>
          <span class="text-xs text-[#7E7272]">${pMask}</span>
        </div>
        <span class="px-2.5 py-0.5 rounded-full bg-[#FFF0EB] text-[#E58A7B] font-extrabold text-xs">🎂 ${bDayText}</span>
      </div>
      <div class="flex justify-between text-xs text-[#7E7272] pt-1 border-t border-[#F0EAE1]">
        <span>Đã đi: <b class="text-[#2E7D6D]">${c.total_visits || 1} lần</b></span>
        <span>Voucher: <b class="text-[#E58A7B]">${c.voucher_count || 0}</b></span>
      </div>
    </div>
  `;
}
