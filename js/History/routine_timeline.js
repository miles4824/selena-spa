// =============================================================
// TAB 3: HISTORY - KTV DAILY ROUTINE TIMELINE (FORMAT GỌN GÀNG)
// =============================================================

function formatCleanTime(val) {
  if (!val) return '12:00';
  let s = String(val).trim();
  let match = s.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    return `${match[1].padStart(2, '0')}:${match[2]}`;
  }
  return s.slice(0, 5);
}

function formatCleanDate(val) {
  if (!val) return '29/08';
  let s = String(val).trim();
  
  // Khớp định dạng YYYY-MM-DD
  let matchFull = s.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (matchFull) {
    return `${matchFull[3].padStart(2, '0')}/${matchFull[2].padStart(2, '0')}`;
  }
  
  // Khớp định dạng DD/MM hoặc MM/DD
  let matchShort = s.match(/(\d{1,2})[/-](\d{1,2})/);
  if (matchShort) {
    return `${matchShort[1].padStart(2, '0')}/${matchShort[2].padStart(2, '0')}`;
  }
  
  // Parse từ JavaScript Date
  try {
    let d = new Date(val);
    if (!isNaN(d.getTime()) && d.getFullYear() > 1970) {
      let day = d.getDate().toString().padStart(2, '0');
      let month = (d.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month}`;
    }
  } catch(e) {}
  
  return '29/08';
}

function loadStaffHistoryList() {
  const receipts = getStored('receipts', []);
  const container = document.getElementById('staff-receipts-list');
  if (!container) return;

  const staffPhone = normalizePhone(currentUser?.phone);
  const staffCode = String(currentUser?.staff_id || '').trim();

  const myReceipts = receipts.filter(r => {
    const s1Phone = normalizePhone(r.staff_1_user_id || r.staff_1_phone || r.staff_phone);
    const s1Code = String(r.staff_1_id || r.staff_id || '').trim();
    const s2Phone = normalizePhone(r.staff_2_user_id || r.staff_2_phone);
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
    const cleanTime = formatCleanTime(r.start_time || r.time);
    const cleanDate = formatCleanDate(r.date);
    const isQR = r.payment_method === 'Chuyển khoản';
    const cardStyle = pastelBorders[idx % pastelBorders.length];

    const s1Phone = normalizePhone(r.staff_1_user_id || r.staff_1_phone || r.staff_phone);
    const isStaff1 = (staffPhone && s1Phone === staffPhone) || (staffCode && String(r.staff_1_id) === staffCode);

    let myComm = isStaff1 ? ((Number(r.staff_1_comm) !== undefined && r.staff_1_comm !== null) ? Number(r.staff_1_comm) : (Number(r.commission_amount) || 0)) : (Number(r.staff_2_comm) || 0);
    let myTip = isStaff1 ? (Number(r.staff_1_tip) || 0) : (Number(r.staff_2_tip) || 0);
    let totalMyEarning = myComm + myTip;

    return `
      <div class="flex items-start gap-3">
        <div class="w-12 pt-3.5 text-right shrink-0">
          <span class="text-xs font-extrabold text-[#2D2424] block">${cleanTime}</span>
          <span class="text-[10px] text-[#A39696] block">${cleanDate}</span>
        </div>

        <div class="flex-1 spa-card p-4 border-l-4 ${cardStyle} space-y-2">
          <div class="flex justify-between items-start">
            <div class="font-bold text-[#2D2424] text-sm">${r.service_name}</div>
            <div class="text-right">
              <span class="text-xs font-extrabold text-[#2E7D6D]">+${totalMyEarning.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          <div class="flex items-center justify-between text-[11px] text-[#7E7272]">
            <span class="flex items-center gap-1">
              <i data-lucide="user" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
              ${r.customer_name || 'Khách vãng lai'}
            </span>
            <span class="flex items-center gap-1 font-semibold ${isQR ? 'text-[#2E7D6D]' : 'text-[#D35400]'}">
              <i data-lucide="${isQR ? 'qr-code' : 'banknote'}" class="w-3.5 h-3.5"></i>
              ${r.payment_method || 'Chuyển khoản'}
            </span>
            <span class="text-[10px] text-[#A39696] font-mono">${r.receipt_id}</span>
          </div>

          ${r.has_staff_2 ? `
            <div class="text-[11px] text-[#7E7272] bg-white/70 p-2 rounded-xl border border-[#F0EAE1] flex items-center justify-between">
              <span class="flex items-center gap-1 text-[#2D2424]">
                <i data-lucide="users" class="w-3.5 h-3.5 text-[#2E7D6D]"></i>
                Cùng làm: ${r.staff_1_name} & ${r.staff_2_name}
              </span>
              ${myTip > 0 ? `<span class="text-[#E58A7B] font-bold">🎁 Được tip: +${myTip.toLocaleString('vi-VN')} đ</span>` : ''}
            </div>
          ` : `
            ${myTip > 0 ? `
              <div class="text-[11px] text-[#E58A7B] font-bold bg-[#FFF0EB]/80 px-2.5 py-1 rounded-xl flex items-center gap-1">
                <i data-lucide="gift" class="w-3.5 h-3.5"></i>
                Được khách tặng tip riêng: +${myTip.toLocaleString('vi-VN')} đ
              </div>
            ` : ''}
          `}
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}
