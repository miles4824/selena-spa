// =============================================================
// TAB 3: HISTORY - KTV DAILY ROUTINE TIMELINE (PHÂN NHÓM THEO NGÀY)
// =============================================================

let selectedStaffHistoryDate = 'ALL'; // Mặc định là xem tất cả

function onStaffDateSelect(dateStr) {
  selectedStaffHistoryDate = dateStr;
  loadStaffHistoryList(dateStr);
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
        const isS1 = (staffPhone && normalizePhone(r.staff_1_phone || r.staff_phone) === staffPhone) ||
                     (staffCode && String(r.staff_1_id || r.staff_id).trim() === staffCode);
        const myComm = isS1 ? ((r.staff_1_comm !== undefined && r.staff_1_comm !== null) ? Number(r.staff_1_comm) : (Number(r.commission_amount) || 0)) : (Number(r.staff_2_comm) || 0);
        const myTip = isS1 ? (Number(r.staff_1_tip) || 0) : (Number(r.staff_2_tip) || 0);
        const totalEarn = myComm + myTip;

        const partnerName = isS1 ? r.staff_2_name : r.staff_1_name;
        const hasPartner = r.has_staff_2 && partnerName && partnerName.trim() !== '';

        const cleanTime = formatCleanTime(r.start_time || r.time);
        const durStatus = getReceiptDurationStatus(r);
        const isCash = r.payment_method === 'Tiền mặt';

        let detailBoxHtml = '';
        if (myTip > 0) {
          detailBoxHtml = `
            <!-- KHUNG CHI TIẾT KHI CÓ TIỀN TIP -->
            <div class="bg-[#FAF6F1] p-2.5 rounded-2xl border border-[#F0EAE1] space-y-1 text-xs">
              ${hasPartner ? `
                <div class="flex items-center gap-1.5 text-[#7E7272] mb-1">
                  <i data-lucide="users" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
                  <span>KTV hỗ trợ: <b class="text-[#2D2424]">${partnerName}</b></span>
                </div>
              ` : ''}
              <div class="flex justify-between items-center text-[#7E7272]">
                <span>Hoa hồng tour:</span>
                <span class="text-[#2E7D6D] font-extrabold">+${myComm.toLocaleString('vi-VN')} đ</span>
              </div>
              <div class="flex justify-between items-center text-[#E58A7B] font-bold pt-0.5 border-t border-[#F0EAE1]">
                <span class="flex items-center gap-1.5">
                  <i data-lucide="gift" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
                  <span>Tiền tip nhận được:</span>
                </span>
                <span class="font-extrabold">+${myTip.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
          `;
        } else if (hasPartner) {
          detailBoxHtml = `
            <!-- KHUNG CHỈ HIỆN KTV HỖ TRỢ KHI KHÔNG CÓ TIP -->
            <div class="bg-[#FAF6F1] px-3 py-2 rounded-2xl border border-[#F0EAE1] text-xs flex items-center gap-1.5 text-[#7E7272]">
              <i data-lucide="users" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
              <span>KTV hỗ trợ: <b class="text-[#2D2424]">${partnerName}</b></span>
            </div>
          `;
        }

        return `
          <div class="flex gap-3.5 items-center">
            <div class="text-right w-12 shrink-0 py-1">
              <span class="text-xs font-extrabold text-[#2D2424] block font-mono leading-tight">${cleanTime}</span>
              <span class="text-[10px] ${durStatus.colorClass} font-extrabold block leading-tight mt-0.5" title="${durStatus.title}">${durStatus.label}</span>
            </div>

            <div class="bg-white rounded-[28px] border border-[#F0EAE1] shadow-[0_10px_30px_-5px_rgba(229,138,123,0.05),0_4px_12px_rgba(0,0,0,0.02)] p-3.5 flex-1 space-y-2.5 min-w-0">
              <!-- HEADER THẺ: 2 HÀNG RÕ RÀNG CHỐNG VỠ TRÊN MÀN HÌNH NHỎ -->
              <div class="space-y-1">
                <!-- Hàng 1: Tên Dịch Vụ + Tổng Thu Nhập Ca -->
                <div class="flex justify-between items-center gap-2">
                  <h4 class="font-bold text-[#2D2424] text-sm truncate">${r.service_name}</h4>
                  <span class="text-sm font-extrabold text-[#2E7D6D] whitespace-nowrap shrink-0">+${totalEarn.toLocaleString('vi-VN')} đ</span>
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

              ${detailBoxHtml}
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
