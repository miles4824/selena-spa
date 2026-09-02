// =============================================================
// COMPONENT: THẺ HÓA ĐƠN DOANH THU CHỦ TIỆM (OWNER RECEIPT CARD)
// =============================================================
function renderOwnerReceiptCard(r, cleanTime, durStatus, isCash, staffListHtml) {
  const price = Number(r.price) || 0;
  const tipTotal = Number(r.tip_amount) || 0;
  const totalPaid = Number(r.total_paid) || (price + tipTotal);

  return `
    <div class="flex gap-3.5 items-center">
      <div class="text-right w-12 shrink-0 py-1">
        <span class="text-xs font-extrabold text-[#2D2424] block font-mono leading-tight">${cleanTime}</span>
        <span class="text-xs ${durStatus.colorClass} font-extrabold block font-mono leading-tight mt-0.5" title="${durStatus.title}">${durStatus.label}</span>
      </div>

      <div class="bg-white rounded-[28px] border border-[#F0EAE1] shadow-[0_10px_30px_-5px_rgba(229,138,123,0.05),0_4px_12px_rgba(0,0,0,0.02)] p-4 flex-1 space-y-3 min-w-0">
        <div class="space-y-1">
          <div class="flex justify-between items-start gap-2">
            <h4 class="font-bold text-[#2D2424] text-base truncate">${r.service_name}</h4>
            <div class="text-right shrink-0">
              <span class="text-base font-extrabold text-[#2D2424] block">${totalPaid.toLocaleString('vi-VN')} đ</span>
              ${tipTotal > 0 ? `<span class="text-[11px] text-[#E58A7B] font-semibold block">gồm ${tipTotal.toLocaleString('vi-VN')} đ tip</span>` : ''}
            </div>
          </div>

          <div class="flex items-center justify-between gap-2 text-xs text-[#7E7272] flex-wrap">
            <div class="flex items-center gap-1.5 min-w-0">
              <button type="button" onclick="openOwnerCustomerEditorModal('${r.customer_phone || r.raw_phone || ''}', '${r.customer_name || 'Khách vãng lai'}', '${r.receipt_id || ''}')" class="inline-flex items-center gap-1 truncate text-[#2D2424] font-medium hover:text-[#E58A7B] cursor-pointer transition group" title="Bấm để sửa ghi chú & sở thích khách hàng">
                <i data-lucide="user" class="w-3.5 h-3.5 text-[#A39696] group-hover:text-[#E58A7B] shrink-0"></i>
                <span class="truncate font-semibold text-[#2D2424] group-hover:text-[#E58A7B] underline decoration-dotted underline-offset-2">${r.customer_name || 'Khách vãng lai'}</span>
                <i data-lucide="edit-3" class="w-3 h-3 text-[#E58A7B] shrink-0 ml-0.5 opacity-80 group-hover:opacity-100"></i>
              </button>
              <span class="text-[#D4C5B9]">•</span>
              <span class="inline-flex items-center gap-1 font-semibold ${isCash ? 'text-[#D35400]' : 'text-[#2E7D6D]'} shrink-0">
                <i data-lucide="${isCash ? 'banknote' : 'qr-code'}" class="w-3 h-3"></i>
                ${r.payment_method || 'Chuyển khoản'}
              </span>
            </div>
            <span class="text-[10px] text-[#A39696] font-mono shrink-0 ml-auto">${r.receipt_id}</span>
          </div>
        </div>

        <div class="bg-[#FAF6F1] p-3 rounded-2xl border border-[#F0EAE1] space-y-1.5 text-xs">
          <div class="text-[#7E7272] font-bold flex items-center gap-1 mb-1">
            <i data-lucide="users" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
            <span>Kỹ thuật viên thực hiện:</span>
          </div>
          ${staffListHtml}
        </div>
      </div>
    </div>
  `;
}
