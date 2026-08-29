// =============================================================
// TAB 3: HISTORY - KTV DAILY ROUTINE TIMELINE
// =============================================================
function loadStaffHistoryList() {
  const receipts = getStored('receipts', []);
  const container = document.getElementById('staff-receipts-list');
  if (!container) return;

  const staffPhone = normalizePhone(currentUser?.phone);
  const staffCode = String(currentUser?.staff_id || '').trim();

  const myReceipts = receipts.filter(r => {
    const s1Phone = normalizePhone(r.staff_1_phone || r.staff_phone);
    const s1Code = String(r.staff_1_id || r.staff_id || '').trim();
    const s2Phone = normalizePhone(r.staff_2_phone);
    const s2Code = String(r.staff_2_id || '').trim();

    return (staffPhone && (s1Phone === staffPhone || s2Phone === staffPhone)) || 
           (staffCode && (s1Code === staffCode || s2Code === staffCode));
  });

  if (myReceipts.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center spa-card space-y-3">
        <div class="w-12 h-12 rounded-full bg-[#FFF0EB] text-[#E58A7B] flex items-center justify-center mx-auto">
          <i data-lucide="calendar" class="w-6 h-6"></i>
        </div>
        <div class="text-sm font-bold text-[#2D2424]">Chưa có ca gội nào được ghi nhận</div>
        <p class="text-xs text-[#7E7272]">Bấm tab "+" bên dưới để tạo ca gội đầu tiên của bạn!</p>
      </div>
    `;
    return;
  }

  const pastelBorders = [
    'border-l-[#E58A7B] bg-[#FFF0EB]/40',
    'border-l-[#2E7D6D] bg-[#E8F8F5]/40',
    'border-l-[#2980B9] bg-[#EBF5FB]/40',
    'border-l-[#8E44AD] bg-[#F5EEF8]/40'
  ];

  container.innerHTML = myReceipts.map((r, idx) => {
    const time = r.time || '14:30';
    const isQR = r.payment_method === 'Chuyển khoản';
    const cardStyle = pastelBorders[idx % pastelBorders.length];

    const s1Phone = normalizePhone(r.staff_1_phone || r.staff_phone);
    const isStaff1 = (staffPhone && s1Phone === staffPhone) || (staffCode && String(r.staff_1_id) === staffCode);

    let myComm = isStaff1 ? ((Number(r.staff_1_comm) !== undefined && r.staff_1_comm !== null) ? Number(r.staff_1_comm) : (Number(r.commission_amount) || 0)) : (Number(r.staff_2_comm) || 0);
    let myTip = isStaff1 ? (Number(r.staff_1_tip) || 0) : (Number(r.staff_2_tip) || 0);
    let totalMyEarning = myComm + myTip;

    return `
      <div class="flex items-start gap-3">
        <div class="w-14 pt-3.5 text-right shrink-0">
          <span class="text-xs font-extrabold text-[#2D2424] block">${time}</span>
          <span class="text-[10px] text-[#A39696] block">${r.date?.slice(5) || '27/08'}</span>
        </div>

        <div class="flex-1 spa-card p-4 border-l-4 ${cardStyle} transition hover:shadow-md space-y-1.5">
          <div class="flex justify-between items-start">
            <div>
              <h4 class="text-sm sm:text-base font-extrabold text-[#2D2424]">${r.service_name}</h4>
              <div class="flex items-center gap-2 mt-1 text-xs text-[#7E7272]">
                <span class="font-medium">👤 ${r.customer_name || 'Khách vãng lai'}</span>
                <span>•</span>
                <span class="inline-flex items-center gap-1 font-semibold ${isQR ? 'text-[#2E7D6D]' : 'text-[#D35400]'}">
                  <i data-lucide="${isQR ? 'qr-code' : 'banknote'}" class="w-3.5 h-3.5"></i> ${r.payment_method}
                </span>
              </div>
            </div>
            <div class="text-right">
              <span class="text-sm sm:text-base font-extrabold text-[#2E7D6D] block">+${totalMyEarning.toLocaleString('vi-VN')} đ</span>
              <span class="text-[10px] text-[#A39696]">${r.receipt_id}</span>
            </div>
          </div>

          ${(r.has_staff_2 || myTip > 0) ? `
            <div class="flex justify-between items-center text-[11px] pt-1.5 border-t border-[#F0EAE1]/80 text-[#7E7272]">
              <span>${r.has_staff_2 ? `👥 Cùng làm: ${r.staff_1_name} & ${r.staff_2_name}` : '💆 1 KTV'}</span>
              ${myTip > 0 ? `<span class="text-[#E58A7B] font-bold">🎁 Được tip: +${myTip.toLocaleString('vi-VN')} đ</span>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}
