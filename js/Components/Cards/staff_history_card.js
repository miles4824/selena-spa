// =============================================================
// COMPONENT: THẺ TOUR LỊCH SỬ KTV (STAFF HISTORY CARD)
// =============================================================
function renderStaffHistoryCard(item, cleanTime, durStatus, partnerNameStr, myComm, myTip, totalEarn, isCash) {
  let detailBoxHtml = '';
  if (partnerNameStr || myTip > 0) {
    detailBoxHtml = `
      <div class="bg-[#FAF6F1] p-2.5 rounded-2xl border border-[#F0EAE1] space-y-1 text-xs">
        ${partnerNameStr ? `
          <div class="flex items-center gap-1.5 text-[#7E7272] mb-1">
            <i data-lucide="users" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
            <span>KTV cùng làm: <b class="text-[#2D2424]">${partnerNameStr}</b></span>
          </div>
        ` : ''}
        <div class="flex justify-between items-center text-[#7E7272]">
          <span>Tiền tour:</span>
          <span class="text-[#2E7D6D] font-extrabold">+${myComm.toLocaleString('vi-VN')} đ</span>
        </div>
        ${myTip > 0 ? `
          <div class="flex justify-between items-center text-[#E58A7B] font-bold pt-0.5 border-t border-[#F0EAE1]">
            <span class="flex items-center gap-1.5">
              <i data-lucide="gift" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
              <span>Tiền tip:</span>
            </span>
            <span class="font-extrabold">+${myTip.toLocaleString('vi-VN')} đ</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  return `
    <div class="flex gap-3.5 items-center">
      <div class="text-right w-12 shrink-0 py-1">
        <span class="text-xs font-extrabold text-[#2D2424] block font-mono leading-tight">${cleanTime}</span>
        <span class="text-[10px] ${durStatus.colorClass} font-extrabold block font-mono leading-tight mt-0.5" title="${durStatus.title}">${durStatus.label}</span>
      </div>

      <div class="bg-white rounded-[28px] border border-[#F0EAE1] shadow-[0_10px_30px_-5px_rgba(229,138,123,0.05),0_4px_12px_rgba(0,0,0,0.02)] p-3.5 flex-1 space-y-2.5 min-w-0">
        <div class="space-y-1">
          <div class="flex justify-between items-center gap-2">
            <h4 class="font-bold text-[#2D2424] text-sm truncate">${item.service_name}</h4>
            <span class="text-sm font-extrabold text-[#2E7D6D] whitespace-nowrap shrink-0">+${totalEarn.toLocaleString('vi-VN')} đ</span>
          </div>

          <div class="flex items-center justify-between gap-1.5 text-[11px] text-[#7E7272] flex-wrap">
            <div class="flex items-center gap-1.5 min-w-0">
              <button type="button" onclick="openStaffCustomerNoteModal('${item.customer_phone || item.raw_phone || ''}', '${item.customer_name || 'Khách vãng lai'}', '${item.receipt_id || ''}')" class="inline-flex items-center gap-1 truncate text-[#2D2424] font-medium hover:text-[#E58A7B] cursor-pointer transition group" title="Bấm để sửa ghi chú & sở thích khách hàng">
                <i data-lucide="user" class="w-3 h-3 text-[#A39696] group-hover:text-[#E58A7B] shrink-0"></i>
                <span class="truncate font-semibold text-[#2D2424] group-hover:text-[#E58A7B] underline decoration-dotted underline-offset-2">${item.customer_name || 'Khách vãng lai'}</span>
                <i data-lucide="edit-3" class="w-2.5 h-2.5 text-[#E58A7B] shrink-0 ml-0.5 opacity-80 group-hover:opacity-100"></i>
              </button>
              <span class="text-[#D4C5B9]">•</span>
              <span class="inline-flex items-center gap-1 font-semibold ${isCash ? 'text-[#D35400]' : 'text-[#2E7D6D]'} shrink-0">
                <i data-lucide="${isCash ? 'banknote' : 'qr-code'}" class="w-3 h-3"></i>
                ${item.payment_method || 'Chuyển khoản'}
              </span>
            </div>
            <span class="text-[10px] text-[#A39696] font-mono shrink-0 ml-auto">${item.receipt_id}</span>
          </div>
        </div>

        ${detailBoxHtml}
      </div>
    </div>
  `;
}
