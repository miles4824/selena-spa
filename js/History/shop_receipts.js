// =============================================================
// TAB 3: HISTORY - OWNER SHOP-WIDE ALL RECEIPTS (DESKTOP & MOBILE)
// =============================================================

let selectedAdminHistoryDate = normalizeDateKey(new Date());

function onAdminDateSelect(dateStr) {
  selectedAdminHistoryDate = dateStr;
  loadAdminReceiptsList(dateStr);
}

function loadAdminReceiptsList(targetDate) {
  loadOwnerReceiptsList(targetDate);
}

function loadOwnerReceiptsList(targetDate) {
  const receipts = getStored('receipts', []);
  const mobileContainer = document.getElementById('admin-receipts-mobile-cards') || document.getElementById('owner-receipts-list');
  const tableBody = document.getElementById('admin-receipts-table-body');
  const countBadge = document.getElementById('admin-receipt-count');

  if (targetDate !== undefined) {
    selectedAdminHistoryDate = targetDate;
  }
  if (!selectedAdminHistoryDate) {
    selectedAdminHistoryDate = normalizeDateKey(new Date());
  }

  // Render Date Strip Component cho Admin
  renderDateStripComponent('admin-date-strip-container', selectedAdminHistoryDate, 'onAdminDateSelect');

  let filteredReceipts = receipts;
  if (selectedAdminHistoryDate !== 'ALL') {
    filteredReceipts = receipts.filter(r => {
      const rDate = normalizeDateKey(r.date || r.created_at);
      return rDate === selectedAdminHistoryDate;
    });
  }

  if (countBadge) {
    countBadge.innerText = `${filteredReceipts.length} hóa đơn`;
  }

  if (filteredReceipts.length === 0) {
    const emptyHtml = `
      <div class="p-8 text-center spa-card space-y-3">
        <div class="w-12 h-12 rounded-full bg-[#FFF0EB] text-[#E58A7B] flex items-center justify-center mx-auto">
          <i data-lucide="calendar-x" class="w-6 h-6"></i>
        </div>
        <div class="text-sm font-bold text-[#2D2424]">Không có hóa đơn nào trong ngày này</div>
        <p class="text-xs text-[#7E7272]">Hãy chọn ngày khác trên thanh lịch phía trên hoặc bấm "Xem tất cả".</p>
      </div>
    `;
    if (mobileContainer) mobileContainer.innerHTML = emptyHtml;
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-xs text-[#7E7272]">Không có dữ liệu hóa đơn</td></tr>`;
    lucide.createIcons();
    return;
  }

  // 1. Render Mobile Cards
  if (mobileContainer) {
    mobileContainer.innerHTML = filteredReceipts.map(r => {
      const cleanTime = formatCleanTime(r.start_time || r.time);
      const cleanDate = formatCleanDate(r.date || r.created_at);
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
              <span class="text-[#7E7272]">KTV phục vụ:</span>
              <span class="font-semibold text-[#2E7D6D]">
                ${r.staff_1_name || 'KTV 1'} (+${(Number(r.staff_1_comm || r.commission_amount || 0) + Number(r.staff_1_tip || 0)).toLocaleString('vi-VN')} đ)
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
  }

  // 2. Render Desktop Table Body
  if (tableBody) {
    tableBody.innerHTML = filteredReceipts.map(r => {
      const cleanTime = formatCleanTime(r.start_time || r.time);
      const cleanDate = formatCleanDate(r.date || r.created_at);
      const isQR = r.payment_method === 'Chuyển khoản';
      const totalPaid = Number(r.total_paid) || ((Number(r.price) || 0) + (Number(r.tip_amount) || 0));

      const staffText = `${r.staff_1_name || 'KTV 1'}${r.has_staff_2 ? ` & ${r.staff_2_name}` : ''}`;

      return `
        <tr class="hover:bg-[#FAF6F1]/50 transition">
          <td class="py-3 font-mono font-bold text-xs text-[#E58A7B]">${r.receipt_id}</td>
          <td class="py-3">
            <div class="font-bold text-[#2D2424] text-xs">${r.service_name}</div>
            <div class="text-[10px] text-[#7E7272] font-mono">${cleanTime} ${cleanDate}</div>
          </td>
          <td class="py-3 text-xs text-[#2D2424] font-medium">${r.customer_name || 'Khách vãng lai'}</td>
          <td class="py-3 text-xs text-[#2E7D6D] font-semibold">${staffText}</td>
          <td class="py-3 text-right font-extrabold text-[#2D2424] text-xs">${totalPaid.toLocaleString('vi-VN')} đ</td>
          <td class="py-3 text-right text-xs">
            <span class="inline-flex items-center gap-1 font-bold ${isQR ? 'text-[#2E7D6D]' : 'text-[#D35400]'}">
              <i data-lucide="${isQR ? 'qr-code' : 'banknote'}" class="w-3 h-3"></i>
              ${r.payment_method || 'CK'}
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  lucide.createIcons();
}
