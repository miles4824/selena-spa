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
        <!-- VẠCH PHÂN CÁCH NGÀY GHIM CỐ ĐỊNH CHUẨN XÁC TAILWIND 4 (STICKY DATE HEADER) -->
        <div class="sticky top-[var(--sticky-date-offset,130px)] z-20 bg-[#FAF6F1] py-1.5 -mx-1 px-1">
          <div class="relative flex items-center">
            <div class="flex-grow border-t border-[#EFE8DF]"></div>
            <span class="flex-shrink mx-3 text-xs font-extrabold ${isTodayHeader ? 'text-[#E58A7B] bg-[#FFF0EB] border-[#FCDFD7]' : 'text-[#7E7272] bg-[#FAF6F1] border-[#F0EAE1]'} px-3.5 py-1 rounded-full border font-mono shadow-xs">
              ${isTodayHeader ? 'Hôm nay • ' : ''}${formattedDateVN}
            </span>
            <div class="flex-grow border-t border-[#EFE8DF]"></div>
          </div>
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
        const durStatus = getReceiptDurationStatus(r);
        const isCash = r.payment_method === 'Tiền mặt';
        const totalPaid = Number(r.total_paid) || ((Number(r.price) || 0) + (Number(r.tip_amount) || 0));

        const staff1Name = r.staff_1_name || 'KTV 1';
        const staff1Comm = Number(r.staff_1_comm || r.commission_amount || 0);
        const staff1Tip = Number(r.staff_1_tip) || 0;

        const staff2Name = r.staff_2_name;
        const staff2Comm = Number(r.staff_2_comm || 0);
        const staff2Tip = Number(r.staff_2_tip) || 0;

        const totalTip = Number(r.tip_amount) || (staff1Tip + staff2Tip);

        return `
          <div class="flex gap-3.5 items-center">
            <div class="text-right w-12 shrink-0 py-1">
              <span class="text-xs font-extrabold text-[#2D2424] block font-mono leading-tight">${cleanTime}</span>
              <span class="text-[10px] ${durStatus.colorClass} font-extrabold block leading-tight mt-0.5" title="${durStatus.title}">${durStatus.label}</span>
            </div>

            <div class="spa-card p-3.5 flex-1 space-y-2.5 min-w-0">
              <!-- HEADER THẺ: 2 HÀNG RÕ RÀNG CHỐNG VỠ TRÊN MÀN HÌNH NHỎ -->
              <div class="space-y-1">
                <!-- Hàng 1: Tên Dịch Vụ + Tổng Doanh Thu Ca -->
                <div class="flex justify-between items-center gap-2">
                  <h4 class="font-bold text-[#2D2424] text-sm truncate">${r.service_name}</h4>
                  <span class="text-sm font-extrabold text-[#E58A7B] whitespace-nowrap shrink-0">${totalPaid.toLocaleString('vi-VN')} đ</span>
                </div>

                <!-- Hàng 2: Khách Hàng (SVG User) + Thanh Toán (SVG) + Mã Phiếu -->
                <div class="flex items-center justify-between gap-1 text-[11px] text-[#7E7272] flex-wrap">
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="inline-flex items-center gap-1 truncate text-[#2D2424] font-medium">
                      <i data-lucide="user" class="w-3 h-3 text-[#A39696] shrink-0"></i>
                      <span class="truncate">${r.customer_name || 'Khách vãng lai'}</span>
                    </span>
                    <span class="text-[#D4C5B9]">•</span>
                    <span class="inline-flex items-center gap-1 font-semibold ${isCash ? 'text-[#D35400]' : 'text-[#2E7D6D]'} shrink-0">
                      <i data-lucide="${isCash ? 'banknote' : 'qr-code'}" class="w-3 h-3"></i>
                      ${r.payment_method || 'Chuyển khoản'}
                    </span>
                  </div>
                  <span class="text-[10px] text-[#A39696] font-mono shrink-0 ml-auto">${r.receipt_id}</span>
                </div>
              </div>

              <!-- KHUNG KỸ THUẬT VIÊN XUỐNG DÒNG RÕ RÀNG & TỔNG TIP DƯỚI CÙNG -->
              <div class="bg-[#FAF6F1] p-2.5 rounded-2xl border border-[#F0EAE1] space-y-1.5 text-xs">
                <div class="font-bold text-[#7E7272] flex items-center gap-1.5 mb-1">
                  <i data-lucide="users" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
                  <span>Kỹ thuật viên:</span>
                </div>

                <!-- KTV 1 -->
                <div class="space-y-0.5 pl-2">
                  <div class="flex justify-between items-center">
                    <span class="text-[#2D2424] font-medium">• ${staff1Name}:</span>
                    <span class="text-[#2E7D6D] font-extrabold">+${staff1Comm.toLocaleString('vi-VN')} đ</span>
                  </div>
                  ${staff1Tip > 0 ? `
                    <div class="flex justify-between items-center pl-3 text-[#7E7272]">
                      <span class="text-[11px] font-medium">Tip:</span>
                      <span class="text-[#E58A7B] font-extrabold text-[11px]">+${staff1Tip.toLocaleString('vi-VN')} đ</span>
                    </div>
                  ` : ''}
                </div>

                <!-- KTV 2 (Nếu có) -->
                ${r.has_staff_2 && staff2Name ? `
                  <div class="space-y-0.5 pl-2 pt-0.5">
                    <div class="flex justify-between items-center">
                      <span class="text-[#2D2424] font-medium">• ${staff2Name}:</span>
                      <span class="text-[#2E7D6D] font-extrabold">+${staff2Comm.toLocaleString('vi-VN')} đ</span>
                    </div>
                    ${staff2Tip > 0 ? `
                      <div class="flex justify-between items-center pl-3 text-[#7E7272]">
                        <span class="text-[11px] font-medium">Tip:</span>
                        <span class="text-[#E58A7B] font-extrabold text-[11px]">+${staff2Tip.toLocaleString('vi-VN')} đ</span>
                      </div>
                    ` : ''}
                  </div>
                ` : ''}

                <!-- Đường Gạch Phân Cách & Tổng Tip -->
                ${totalTip > 0 ? `
                  <div class="pt-1.5 border-t border-[#F0EAE1] flex justify-between items-center pl-1 font-bold text-[#E58A7B]">
                    <span class="flex items-center gap-1 text-[11px]">
                      <i data-lucide="gift" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
                      <span>Tổng tip:</span>
                    </span>
                    <span class="font-extrabold text-xs">+${totalTip.toLocaleString('vi-VN')} đ</span>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    html += `</div>`;
  });

    container.classList.remove('history-list-anim');
  void container.offsetWidth; // Trigger reflow
  container.classList.add('history-list-anim');
  container.innerHTML = html;
  lucide.createIcons();
}
