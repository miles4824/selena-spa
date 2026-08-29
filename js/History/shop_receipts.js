// =============================================================
// TAB 3: HISTORY - OWNER ALL SHOP RECEIPTS (TABLE & CARDS)
// =============================================================
function loadAdminReceiptsList() {
  const receipts = getStored('receipts', []);
  document.getElementById('admin-receipt-count').innerText = receipts.length + ' hóa đơn';

  const tableBody = document.getElementById('admin-receipts-table-body');
  const mobileCards = document.getElementById('admin-receipts-mobile-cards');

  if (receipts.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-[#7E7272]">Chưa có hóa đơn nào</td></tr>`;
    mobileCards.innerHTML = `<div class="p-6 text-center text-[#7E7272] spa-card">Chưa có hóa đơn nào</div>`;
    return;
  }

  tableBody.innerHTML = receipts.map(r => `
    <tr class="hover:bg-[#FAF6F1]/50 transition">
      <td class="py-3.5 font-mono text-xs font-bold text-[#E58A7B]">${r.receipt_id}</td>
      <td class="py-3.5 font-bold text-[#2D2424]">${r.service_name}</td>
      <td class="py-3.5 text-[#7E7272]">${r.customer_name || 'Vãng lai'} <span class="font-mono text-xs block text-[#A39696]">${r.customer_phone || ''}</span></td>
      <td class="py-3.5 text-[#2D2424] font-medium">${r.staff_name}</td>
      <td class="py-3.5 text-right font-extrabold text-[#2E7D6D]">${(r.total_paid || 0).toLocaleString('vi-VN')} đ</td>
      <td class="py-3.5 text-right">
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${r.payment_method === 'Chuyển khoản' ? 'bg-[#E8F8F5] text-[#2E7D6D]' : 'bg-[#FFF0EB] text-[#D35400]'}">
          ${r.payment_method}
        </span>
      </td>
    </tr>
  `).join('');

  mobileCards.innerHTML = receipts.map(r => `
    <div class="spa-card p-4 space-y-2">
      <div class="flex justify-between items-start">
        <div>
          <span class="text-xs font-mono font-bold text-[#E58A7B]">${r.receipt_id}</span>
          <h4 class="font-extrabold text-sm sm:text-base text-[#2D2424]">${r.service_name}</h4>
        </div>
        <span class="text-sm font-extrabold text-[#2E7D6D]">${(r.total_paid || 0).toLocaleString('vi-VN')} đ</span>
      </div>
      <div class="flex justify-between items-center text-xs text-[#7E7272] pt-1 border-t border-[#F0EAE1]">
        <span>👤 ${r.customer_name} • KTV: ${r.staff_name}</span>
        <span class="font-bold ${r.payment_method === 'Chuyển khoản' ? 'text-[#2E7D6D]' : 'text-[#D35400]'}">${r.payment_method}</span>
      </div>
    </div>
  `).join('');
}
