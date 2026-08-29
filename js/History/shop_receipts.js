// =============================================================
// TAB 3: HISTORY - OWNER SHOP-WIDE ALL RECEIPTS
// =============================================================

function formatCleanTime(val) {
  if (!val) return '12:00';
  let s = String(val).trim();
  let match = s.match(/(\d{1,2}):(\d{2})/);
  if (match) return `${match[1].padStart(2, '0')}:${match[2]}`;
  return s.slice(0, 5);
}

function formatCleanDate(val) {
  if (!val) return '08-29';
  let s = String(val).trim();
  let matchFull = s.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (matchFull) return `${matchFull[2].padStart(2, '0')}-${matchFull[3].padStart(2, '0')}`;
  let matchShort = s.match(/(\d{1,2})[/-](\d{1,2})/);
  if (matchShort) return `${matchShort[1].padStart(2, '0')}-${matchShort[2].padStart(2, '0')}`;
  return s.slice(-5);
}

function loadOwnerReceiptsList() {
  const receipts = getStored('receipts', []);
  const container = document.getElementById('owner-receipts-list');
  if (!container) return;

  if (receipts.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center spa-card space-y-3">
        <div class="w-12 h-12 rounded-full bg-[#FFF0EB] text-[#E58A7B] flex items-center justify-center mx-auto">
          <i data-lucide="receipt" class="w-6 h-6"></i>
        </div>
        <div class="text-sm font-bold text-[#2D2424]">Chưa có hóa đơn nào được tạo</div>
        <p class="text-xs text-[#7E7272]">Toàn bộ ca gội của tiệm sẽ hiển thị tại đây theo thời gian thực.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = receipts.map(r => {
    const cleanTime = formatCleanTime(r.start_time || r.time);
    const cleanDate = formatCleanDate(r.date);
    const isQR = r.payment_method === 'Chuyển khoản';
    const totalPaid = Number(r.total_paid) || ((Number(r.price) || 0) + (Number(r.tip_amount) || 0));

    return `
      <div class="spa-card p-4 space-y-2.5">
        <div class="flex justify-between items-start">
          <div>
            <div class="font-bold text-[#2D2424] text-sm">${r.service_name}</div>
            <div class="text-[11px] text-[#7E7272] font-mono mt-0.5">
              ${cleanTime} • ${cleanDate} • Mã: ${r.receipt_id}
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm font-extrabold text-[#E58A7B]">${totalPaid.toLocaleString('vi-VN')} đ</div>
            <span class="inline-flex items-center gap-1 text-[10px] font-bold ${isQR ? 'text-[#2E7D6D]' : 'text-[#D35400]'}">
              <i data-lucide="${isQR ? 'qr-code' : 'banknote'}" class="w-3 h-3"></i>
              ${r.payment_method || 'Chuyển khoản'}
            </span>
          </div>
        </div>

        <div class="text-xs text-[#2D2424] bg-[#FAF6F1] p-2.5 rounded-2xl border border-[#F0EAE1] space-y-1">
          <div class="flex justify-between">
            <span class="text-[#7E7272]">Khách hàng:</span>
            <span class="font-bold text-[#2D2424]">${r.customer_name || 'Khách vãng lai'} ${r.customer_phone ? `(${r.customer_phone})` : ''}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-[#7E7272]">KTV phụ trách:</span>
            <span class="font-semibold text-[#2E7D6D]">
              ${r.staff_1_name} (+${(Number(r.staff_1_comm || r.commission_amount || 0) + Number(r.staff_1_tip || 0)).toLocaleString('vi-VN')} đ)
              ${r.has_staff_2 ? ` • ${r.staff_2_name} (+${(Number(r.staff_2_comm || 0) + Number(r.staff_2_tip || 0)).toLocaleString('vi-VN')} đ)` : ''}
            </span>
          </div>
          ${Number(r.tip_amount) > 0 ? `
            <div class="flex justify-between text-[#E58A7B] font-bold">
              <span>Tiền Tips khách cho:</span>
              <span>+${Number(r.tip_amount).toLocaleString('vi-VN')} đ</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}
