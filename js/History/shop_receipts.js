// =============================================================
// TAB 3: HISTORY - OWNER SHOP-WIDE ALL RECEIPTS (ĐỒNG BỘ 1-1 VỚI TIMELINE STAFF)
// =============================================================

let selectedAdminHistoryDate = 'ALL'; // Mặc định là xem tất cả

function onAdminDateSelect(dateStr) {
  selectedAdminHistoryDate = dateStr;
  loadAdminReceiptsList(dateStr);
}

function loadAdminReceiptsList(targetDate) {
  loadOwnerReceiptsList(targetDate);
}

function loadOwnerReceiptsList(targetDate) {
  const receipts = getStored('receipts', []);
  const container = document.getElementById('admin-receipts-list') || document.getElementById('admin-receipts-mobile-cards') || document.getElementById('owner-receipts-list');
  if (!container) return;

  if (targetDate !== undefined) {
    selectedAdminHistoryDate = targetDate;
  }
  if (!selectedAdminHistoryDate) {
    selectedAdminHistoryDate = 'ALL';
  }

  // Render Date Strip Component cho Admin
  renderDateStripComponent('admin-date-strip-container', selectedAdminHistoryDate, 'onAdminDateSelect');

  const todayKey = normalizeDateKey(new Date());
  let dateList = [];

  if (selectedAdminHistoryDate === 'ALL') {
    const datesSet = new Set();
    datesSet.add(todayKey);
    receipts.forEach(r => {
      const rDate = normalizeDateKey(r.date || r.created_at);
      if (rDate) datesSet.add(rDate);
    });
    dateList = Array.from(datesSet).sort().reverse();
  } else {
    dateList = [selectedAdminHistoryDate];
  }

  let html = '';

  dateList.forEach(dKey => {
    const dayReceipts = receipts.filter(r => normalizeDateKey(r.date || r.created_at) === dKey);
    const formattedDateVN = formatDateVN(dKey);
    const isTodayHeader = dKey === todayKey;

    html += `
      <div class="space-y-3">
        <!-- VẠCH PHÂN CÁCH NGÀY ĐỒNG BỘ ĐẸP MẮT -->
        <div class="relative flex py-2.5 items-center">
          <div class="flex-grow border-t border-[#EFE8DF]"></div>
          <span class="flex-shrink mx-3 text-xs font-extrabold ${isTodayHeader ? 'text-[#E58A7B] bg-[#FFF0EB] border-[#FCDFD7]' : 'text-[#7E7272] bg-[#FAF6F1] border-[#F0EAE1]'} px-3.5 py-1 rounded-full border font-mono">
            ${isTodayHeader ? 'Hôm nay • ' : ''}${formattedDateVN}
          </span>
          <div class="flex-grow border-t border-[#EFE8DF]"></div>
        </div>
    `;

    if (dayReceipts.length === 0) {
      html += `
        <div class="py-3 text-center text-xs text-[#A39696] font-medium italic">
          Không có tour gội nào trong ngày
        </div>
      `;
    } else {
      html += dayReceipts.map(r => {
        const cleanTime = formatCleanTime(r.start_time || r.time);
        const cleanDate = formatCleanDate(r.date || r.created_at);
        const isCash = r.payment_method === 'Tiền mặt';
        const totalPaid = Number(r.total_paid) || ((Number(r.price) || 0) + (Number(r.tip_amount) || 0));
        const tipAmount = Number(r.tip_amount) || 0;

        const staff1Name = r.staff_1_name || 'KTV 1';
        const staff1Comm = Number(r.staff_1_comm || r.commission_amount || 0);
        const staff2Name = r.staff_2_name;
        const staff2Comm = Number(r.staff_2_comm || 0);

        let staffDisplay = `${staff1Name} (+${staff1Comm.toLocaleString('vi-VN')} đ)`;
        if (r.has_staff_2 && staff2Name) {
          staffDisplay += ` & ${staff2Name} (+${staff2Comm.toLocaleString('vi-VN')} đ)`;
        }

        return `
          <div class="flex gap-3.5 items-start">
            <div class="text-right w-12 pt-3 shrink-0">
              <span class="text-xs font-extrabold text-[#2D2424] block font-mono">${cleanTime}</span>
              <span class="text-[10px] text-[#A39696] font-mono block">${cleanDate}</span>
            </div>

            <div class="spa-card p-4 flex-1 space-y-2.5">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-bold text-[#2D2424] text-sm">${r.service_name}</h4>
                  <div class="flex items-center gap-2 text-xs text-[#7E7272] mt-0.5">
                    <span>👤 ${r.customer_name || 'Khách vãng lai'}</span>
                    <span>•</span>
                    <span class="inline-flex items-center gap-1 font-medium ${isCash ? 'text-[#D35400]' : 'text-[#2E7D6D]'}">
                      <i data-lucide="${isCash ? 'banknote' : 'qr-code'}" class="w-3 h-3"></i>
                      ${r.payment_method || 'Chuyển khoản'}
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-sm font-extrabold text-[#E58A7B]">${totalPaid.toLocaleString('vi-VN')} đ</span>
                  <span class="block text-[10px] text-[#A39696] font-mono">Mã: ${r.receipt_id}</span>
                </div>
              </div>

              <div class="bg-[#FAF6F1] p-2.5 rounded-2xl border border-[#F0EAE1] flex justify-between items-center text-xs flex-wrap gap-1">
                <div class="flex items-center gap-1 text-[#7E7272]">
                  <i data-lucide="users" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
                  <span>KTV: <b class="text-[#2D2424]">${staffDisplay}</b></span>
                </div>
                ${tipAmount > 0 ? `
                  <span class="text-[#E58A7B] font-extrabold flex items-center gap-1">
                    🎁 Được tip: +${tipAmount.toLocaleString('vi-VN')} đ
                  </span>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    html += `</div>`;
  });

  container.innerHTML = html;
  lucide.createIcons();
}
