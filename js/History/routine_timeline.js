// =============================================================
// TAB 3: HISTORY - KTV DAILY ROUTINE TIMELINE (PHÂN NHÓM THEO NGÀY)
// =============================================================

let selectedStaffHistoryDate = 'ALL'; // Mặc định là xem tất cả

function onStaffDateSelect(dateStr) {
  selectedStaffHistoryDate = dateStr;
  loadStaffHistoryList(dateStr);
}

function getReceiptDuration(r) {
  if (r.duration_min && Number(r.duration_min) > 0) return Number(r.duration_min);
  if (r.duration_actual_min && Number(r.duration_actual_min) > 0) return Number(r.duration_actual_min);
  if (r.duration_target_min && Number(r.duration_target_min) > 0) return Number(r.duration_target_min);
  return 45;
}

function loadStaffHistoryList(targetDate) {
  const receipts = getStored('receipts', []);
  const container = document.getElementById('staff-receipts-list');
  if (!container) return;

  if (targetDate !== undefined) {
    selectedStaffHistoryDate = targetDate;
  }
  if (!selectedStaffHistoryDate) {
    selectedStaffHistoryDate = 'ALL';
  }

  // Render Date Strip Component
  renderDateStripComponent('staff-date-strip-container', selectedStaffHistoryDate, 'onStaffDateSelect');

  const staffPhone = normalizePhone(currentUser?.phone);
  const staffCode = String(currentUser?.staff_id || '').trim();

  // Lọc toàn bộ ca của KTV hiện tại
  const myAllReceipts = receipts.filter(r => {
    const s1Phone = normalizePhone(r.staff_1_user_id || r.staff_1_phone || r.staff_phone);
    const s1Code = String(r.staff_1_id || r.staff_id || '').trim();
    const s2Phone = normalizePhone(r.staff_2_user_id || r.staff_2_phone);
    const s2Code = String(r.staff_2_id || '').trim();

    return (staffPhone && (s1Phone === staffPhone || s2Phone === staffPhone)) || 
           (staffCode && (s1Code === staffCode || s2Code === staffCode));
  });

  const todayKey = normalizeDateKey(new Date());
  let dateList = [];

  if (selectedStaffHistoryDate === 'ALL') {
    const datesSet = new Set();
    datesSet.add(todayKey); // Luôn có ngày hôm nay ở đầu
    myAllReceipts.forEach(r => {
      const rDate = normalizeDateKey(r.date || r.created_at);
      if (rDate) datesSet.add(rDate);
    });
    dateList = Array.from(datesSet).sort().reverse();
  } else {
    dateList = [selectedStaffHistoryDate];
  }

  let html = '';

  dateList.forEach(dKey => {
    const dayReceipts = myAllReceipts.filter(r => normalizeDateKey(r.date || r.created_at) === dKey);
    const formattedDateVN = formatDateVN(dKey);
    const isTodayHeader = dKey === todayKey;

    html += `
      <div class="space-y-3">
        <!-- VẠCH PHÂN CÁCH NGÀY ĐẸP MẮT -->
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
        const isS1 = (staffPhone && normalizePhone(r.staff_1_phone || r.staff_phone) === staffPhone) ||
                     (staffCode && String(r.staff_1_id || r.staff_id).trim() === staffCode);
        const myComm = isS1 ? ((r.staff_1_comm !== undefined && r.staff_1_comm !== null) ? Number(r.staff_1_comm) : (Number(r.commission_amount) || 0)) : (Number(r.staff_2_comm) || 0);
        const myTip = isS1 ? (Number(r.staff_1_tip) || 0) : (Number(r.staff_2_tip) || 0);
        const totalEarn = myComm + myTip;

        const cleanTime = formatCleanTime(r.start_time || r.time);
        const durationMin = getReceiptDuration(r);
        const isCash = r.payment_method === 'Tiền mặt';

        return `
          <div class="flex gap-3.5 items-start">
            <div class="text-right w-12 pt-3 shrink-0">
              <span class="text-xs font-extrabold text-[#2D2424] block font-mono">${cleanTime}</span>
              <span class="text-[10px] text-[#2E7D6D] font-extrabold block">${durationMin}p</span>
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
                  <span class="text-sm font-extrabold text-[#2E7D6D]">+${totalEarn.toLocaleString('vi-VN')} đ</span>
                  <span class="block text-[10px] text-[#A39696] font-mono">Mã: ${r.receipt_id}</span>
                </div>
              </div>

              ${r.has_staff_2 || myTip > 0 ? `
                <div class="bg-[#FAF6F1] p-2.5 rounded-2xl border border-[#F0EAE1] flex justify-between items-center text-xs flex-wrap gap-1">
                  <div class="flex items-center gap-1 text-[#7E7272]">
                    <i data-lucide="users" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
                    <span>Cùng làm: <b class="text-[#2D2424]">${r.staff_1_name} & ${r.staff_2_name}</b></span>
                  </div>
                  ${myTip > 0 ? `
                    <span class="text-[#E58A7B] font-extrabold flex items-center gap-1">
                      🎁 Được tip: +${myTip.toLocaleString('vi-VN')} đ
                    </span>
                  ` : ''}
                </div>
              ` : ''}
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
