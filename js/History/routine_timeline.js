// =============================================================
// TAB 3: HISTORY - KTV DAILY ROUTINE TIMELINE (PHÂN NHÓM THEO NGÀY)
// =============================================================

let selectedStaffHistoryDate = 'ALL'; // Mặc định là xem tất cả

function onStaffDateSelect(dateStr) {
  selectedStaffHistoryDate = dateStr;
  loadStaffHistoryList(dateStr);
}

function loadStaffHistoryList(targetDate) {
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
  const myNameClean = (currentUser?.full_name || '').toLowerCase().replace('👑 ', '').replace('ktv ', '').trim();

  const users = typeof getSortedUsersList === 'function' ? getSortedUsersList() : (typeof DEFAULT_USERS !== 'undefined' ? DEFAULT_USERS : []);
  const myUserObj = users.find(u => (staffPhone && normalizePhone(u.phone) === staffPhone) || (staffCode && String(u.staff_id || '').trim() === staffCode) || (myNameClean && u.full_name && u.full_name.toLowerCase().includes(myNameClean))) || currentUser;
  const myCommRate = (myUserObj && parsePercentage(myUserObj.commission_rate) > 0) ? parsePercentage(myUserObj.commission_rate) : 10;

  // 1. ĐỌC TỪ TB_PAYROLL_LOGS NẾU CÓ DỮ LIỆU
  const payrollLogs = getStored('payroll_logs', []);
  let myLogs = payrollLogs.filter(p => {
    const pPhone = normalizePhone(p.staff_phone);
    const pCode = String(p.staff_id || '').trim();
    const pName = String(p.staff_name || '').toLowerCase().replace('👑 ', '').replace('ktv ', '').trim();
    return (staffPhone && pPhone === staffPhone) ||
           (staffCode && pCode === staffCode) ||
           (myNameClean && (pName.includes(myNameClean) || myNameClean.includes(pName)));
  });

  // 2. NẾU TB_PAYROLL_LOGS CHƯA CÓ -> TRÍCH XUẤT ĐẦY ĐỦ TỪ TB_RECEIPTS
  if (myLogs.length === 0) {
    const receipts = getStored('receipts', []);
    receipts.forEach(r => {
      let isMyTour = false;
      let myComm = 0;
      let myTip = 0;
      let myRole = 'KTV 1 (Chính)';
      let myPct = '100%';

      const sNames = String(r.staff_names || '').toLowerCase();
      const s1N = String(r.staff_1_name || '').toLowerCase();
      const s2N = String(r.staff_2_name || '').toLowerCase();
      const s1P = normalizePhone(r.staff_1_user_id || r.staff_1_phone || r.staff_phone);
      const s2P = normalizePhone(r.staff_2_user_id || r.staff_2_phone);

      const isMulti = Boolean(r.has_staff_2 || sNames.includes(',') || (s2N && s2N !== '-'));
      const isS1 = (s1P && s1P === staffPhone) || (myNameClean && (s1N.includes(myNameClean) || (!s2N.includes(myNameClean) && sNames.includes(myNameClean))));
      const isS2 = (s2P && s2P === staffPhone) || (myNameClean && s2N.includes(myNameClean));

      if (r.staffs && Array.isArray(r.staffs) && r.staffs.length > 0) {
        const entry = r.staffs.find(s => normalizePhone(s.phone) === staffPhone || (staffCode && String(s.staff_id || '').trim() === staffCode) || (myNameClean && String(s.name || '').toLowerCase().includes(myNameClean)));
        if (entry) {
          isMyTour = true;
          myComm = Number(entry.comm_vnd || entry.comm) || 0;
          myTip = Number(entry.tip_vnd || entry.tip) || 0;
          myRole = entry.role || myRole;
          myPct = entry.pct ? `${entry.pct}%` : (isMulti ? '50%' : '100%');
        }
      } else {
        if (isS1) {
          isMyTour = true;
          myComm = Number(r.staff_1_comm) || 0;
          myTip = Number(r.staff_1_tip) || 0;
          myRole = 'KTV 1 (Chính)';
          myPct = isMulti ? '50%' : '100%';
        } else if (isS2) {
          isMyTour = true;
          myComm = Number(r.staff_2_comm) || 0;
          myTip = Number(r.staff_2_tip) || 0;
          myRole = 'KTV 2 (Cùng làm)';
          myPct = '50%';
        }
      }

      if (isMyTour) {
        const price = Number(r.price) || 0;
        const totalTipOnReceipt = Number(r.tip_amount) || 0;

        // Tính lại hoa hồng nếu bị 0
        if (myComm === 0 && price > 0) {
          myComm = Math.round(price * (myCommRate / 100) * (isMulti ? 0.5 : 1));
        }

        // Tính lại tiền tip nếu bị 0 nhưng hóa đơn có tip
        if (myTip === 0 && totalTipOnReceipt > 0) {
          myTip = Math.round(totalTipOnReceipt * (isMulti ? 0.5 : 1));
        }

        myLogs.push({
          log_id: r.receipt_id + '_LOG',
          receipt_id: r.receipt_id,
          date: r.date,
          start_time: r.start_time || r.time || '12:00',
          end_time: r.end_time || r.start_time,
          duration_min: r.duration_min || 45,
          service_name: r.service_name,
          customer_name: r.customer_name || 'Khách vãng lai',
          customer_phone: r.customer_phone || '',
          price: price,
          commission_pct: myPct,
          commission_amount: myComm,
          tip_amount: myTip,
          total_earned: myComm + myTip,
          role_in_tour: myRole,
          payment_method: r.payment_method || 'Chuyển khoản',
          created_at: r.created_at || r.date
        });
      }
    });
  }

  const todayKey = normalizeDateKey(new Date());
  let dateList = [];

  if (selectedStaffHistoryDate === 'ALL') {
    const datesSet = new Set();
    datesSet.add(todayKey);
    myLogs.forEach(item => {
      const rDate = normalizeDateKey(item.date || item.created_at);
      if (rDate) datesSet.add(rDate);
    });
    dateList = Array.from(datesSet).sort().reverse();
  } else {
    dateList = [selectedStaffHistoryDate];
  }

  let html = '';

  dateList.forEach(dKey => {
    const dayItems = myLogs.filter(item => normalizeDateKey(item.date || item.created_at) === dKey);
    const formattedDateVN = formatDateVN(dKey);
    const isTodayHeader = dKey === todayKey;

    html += `
      <div class="space-y-3">
        <!-- VẠCH PHÂN CÁCH NGÀY GHIM CỐ ĐỊNH CHUẨN XÁC TAILWIND 4 (STICKY DATE HEADER) -->
        <div class="sticky top-[var(--sticky-date-offset,130px)] z-20 bg-[#FAF6F1] py-1.5 -mx-1 px-1">
          <div class="relative flex items-center">
            <div class="flex-grow border-t border-[#EFE8DF]"></div>
            <span class="flex-shrink mx-3 text-xs font-extrabold ${isTodayHeader ? 'text-[#E58A7B] bg-[#FFF0EB] border-[#FCDFD7]' : 'text-[#7E7272] bg-[#FAF6F1] border-[#F0EAE1]'} px-3.5 py-1 rounded-full border font-mono shadow-xs ">
              ${isTodayHeader ? 'Hôm nay • ' : ''}${formattedDateVN}
            </span>
            <div class="flex-grow border-t border-[#EFE8DF]"></div>
          </div>
        </div>
    `;

    if (dayItems.length === 0) {
      html += `
        <div class="py-3 text-center text-xs text-[#A39696] font-medium italic">
          Không có tour gội nào trong ngày
        </div>
      `;
    } else {
      html += dayItems.map(item => {
        const cleanTime = formatCleanTime(item.start_time, item.created_at);
        const durStatus = getReceiptDurationStatus(item);
        const isCash = item.payment_method === 'Tiền mặt';
        const myComm = Number(item.commission_amount) || 0;
        const myTip = Number(item.tip_amount) || 0;
        const totalEarn = Number(item.total_earned) || (myComm + myTip);

        // Tìm KTV cùng làm (Partner) từ dữ liệu tour
        const receiptsList = getStored('receipts', []);
        const rawReceipt = receiptsList.find(r => r.receipt_id === item.receipt_id);
        const allPayroll = getStored('payroll_logs', []);
        const otherLogs = allPayroll.filter(p => p.receipt_id === item.receipt_id && normalizePhone(p.staff_phone) !== staffPhone && !String(p.staff_name || '').toLowerCase().includes(myNameClean));

        let partnerNames = [];
        if (otherLogs.length > 0) {
          partnerNames = otherLogs.map(p => p.staff_name);
        } else if (rawReceipt) {
          if (rawReceipt.staff_names) {
            partnerNames = String(rawReceipt.staff_names).split(',').map(s => s.trim()).filter(s => s && !s.toLowerCase().includes(myNameClean));
          } else {
            const s1Name = String(rawReceipt.staff_1_name || '').trim();
            const s2Name = String(rawReceipt.staff_2_name || '').trim();
            if (s1Name && s1Name !== '-' && !s1Name.toLowerCase().includes(myNameClean)) partnerNames.push(s1Name);
            if (s2Name && s2Name !== '-' && !s2Name.toLowerCase().includes(myNameClean)) partnerNames.push(s2Name);
          }
        }
        const partnerNameStr = partnerNames.join(', ');

        let detailBoxHtml = '';
        if (partnerNameStr || myTip > 0) {
          detailBoxHtml = `
            <div class="bg-[#FAF6F1] p-2.5 rounded-2xl border border-[#F0EAE1] space-y-1 text-xs">
              ${partnerNameStr ? `
                <div class="flex items-center gap-1.5 text-[#7E7272] mb-1">
                  <i data-lucide="users" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
                  <span>KTV cùng làm: <b class="text-[#2D2424]">${partnerNameStr}</b></span>
                </div>
              ` : ''}
              <div class="flex justify-between items-center text-[#7E7272]">
                <span>Tiền tour:</span>
                <span class="text-[#2E7D6D] font-extrabold">+${myComm.toLocaleString('vi-VN')} đ</span>
              </div>
              ${myTip > 0 ? `
                <div class="flex justify-between items-center text-[#E58A7B] font-bold pt-0.5 border-t border-[#F0EAE1]">
                  <span class="flex items-center gap-1.5">
                    <i data-lucide="gift" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
                    <span>Tiền tip:</span>
                  </span>
                  <span class="font-extrabold">+${myTip.toLocaleString('vi-VN')} đ</span>
                </div>
              ` : ''}
            </div>
          `;
        }

        return `
          <div class="flex gap-3.5 items-center">
            <div class="text-right w-12 shrink-0 py-1">
              <span class="text-xs font-extrabold text-[#2D2424] block font-mono leading-tight">${cleanTime}</span>
              <span class="text-xs ${durStatus.colorClass} font-extrabold block font-mono leading-tight mt-0.5" title="${durStatus.title}">${durStatus.label}</span>
            </div>

            <div class="bg-white rounded-[28px] border border-[#F0EAE1] shadow-[0_10px_30px_-5px_rgba(229,138,123,0.05),0_4px_12px_rgba(0,0,0,0.02)] p-3.5 flex-1 space-y-2.5 min-w-0">
              <div class="space-y-1">
                <div class="flex justify-between items-center gap-2">
                  <h4 class="font-bold text-[#2D2424] text-sm truncate">${item.service_name}</h4>
                  <span class="text-sm font-extrabold text-[#2E7D6D] whitespace-nowrap shrink-0 font-mono">+${totalEarn.toLocaleString('vi-VN')} đ</span>
                </div>

                <div class="flex items-center justify-between gap-1.5 text-[11px] text-[#7E7272] flex-wrap">
                  <div class="flex items-center gap-1.5 min-w-0">
                    <button type="button" onclick="openStaffCustomerNoteModal('${item.customer_phone || item.raw_phone || ''}', '${item.customer_name || 'Khách vãng lai'}', '${item.receipt_id || ''}')" class="inline-flex items-center gap-1 truncate text-[#2D2424] font-medium hover:text-[#E58A7B] cursor-pointer transition group" title="Bấm để sửa ghi chú & sở thích khách hàng">
                      <i data-lucide="user" class="w-3 h-3 text-[#A39696] group-hover:text-[#E58A7B] shrink-0"></i>
                      <span class="truncate font-semibold text-[#2D2424] group-hover:text-[#E58A7B] underline decoration-dotted underline-offset-2">${item.customer_name || 'Khách vãng lai'}</span>
                      <i data-lucide="edit-3" class="w-2.5 h-2.5 text-[#E58A7B] shrink-0 ml-0.5 opacity-80 group-hover:opacity-100"></i>
                    </button>
                    <span class="text-[#D4C5B9]">•</span>
                    <span class="inline-flex items-center gap-1 font-semibold ${isCash ? 'text-[#D35400]' : 'text-[#2E7D6D]'} shrink-0">
                      <i data-lucide="${isCash ? 'banknote' : 'qr-code'}" class="w-3 h-3"></i>
                      ${item.payment_method || 'Chuyển khoản'}
                    </span>
                  </div>
                  <span class="text-[10px] text-[#A39696] font-mono shrink-0 ml-auto">${item.receipt_id}</span>
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
  void container.offsetWidth;
  container.classList.add('history-list-anim');
  container.innerHTML = html;
  lucide.createIcons();
}


// =============================================================
// =============================================================
// =============================================================
// =============================================================
// =============================================================
// COMPONENT: MODAL GHI CHÚ & BỔ SUNG THÔNG TIN KHÁCH HÀNG (KTV / STAFF)
// TUÂN THỦ 100% ĐẶC TẢ TẠI: docs/Modals/modal_staff_note.md
// =============================================================

async function openStaffCustomerNoteModal(phone, name, receiptId) {
  const modal = document.getElementById('modal-staff-customer-note');
  if (!modal) return;

  const rawPhone = normalizePhone(phone);
  const isGuest = (!rawPhone || rawPhone === '' || name === 'Khách vãng lai' || name === 'Khách hàng');

  document.getElementById('modal-staff-note-raw-phone').value = rawPhone || '';
  document.getElementById('modal-staff-note-receipt-id').value = receiptId || '';
  document.getElementById('modal-staff-note-is-guest').value = isGuest ? '1' : '0';

  const guestInputs = document.getElementById('modal-staff-note-guest-inputs');
  const regularMonthSection = document.getElementById('modal-staff-note-regular-month-section');
  const regMonthContainer = document.getElementById('modal-staff-note-regular-month-container');
  const regMonthFixed = document.getElementById('modal-staff-note-regular-month-fixed');
  const regMonthFixedText = document.getElementById('modal-staff-note-regular-month-fixed-text');
  const regMonthSelect = document.getElementById('modal-staff-note-regular-birth-month');

  const guestMonthContainer = document.getElementById('modal-staff-note-guest-month-container');
  const guestMonthFixed = document.getElementById('modal-staff-note-guest-month-fixed');
  const guestMonthFixedText = document.getElementById('modal-staff-note-guest-month-fixed-text');
  const guestMonthSelect = document.getElementById('modal-staff-note-guest-birth-month');

  const noteContent = document.getElementById('modal-staff-note-content');
  const guestNameInput = document.getElementById('modal-staff-note-guest-name');
  const guestPhoneInput = document.getElementById('modal-staff-note-guest-phone');
  const lookupBadge = document.getElementById('modal-staff-note-lookup-badge');
  const phoneHint = document.getElementById('modal-staff-note-phone-hint');
  const suggestionsBox = document.getElementById('modal-staff-note-suggestions');

  if (suggestionsBox) suggestionsBox.classList.add('hidden');

  // Đọc danh bạ khách hàng hiện tại
  const customers = getStored('customers', DEFAULT_CUSTOMERS);
  let foundCust = null;
  if (rawPhone) {
    foundCust = customers.find(c => isSamePhone(c.phone_number || c.raw_phone, rawPhone));
  }
  if (!foundCust && name && name !== 'Khách vãng lai' && name !== 'Khách hàng') {
    foundCust = customers.find(c => c.customer_name && c.customer_name.trim().toLowerCase() === name.trim().toLowerCase());
  }

  let bMonth = (foundCust && foundCust.birth_month) ? Number(foundCust.birth_month) : (foundCust && foundCust.birthday ? parseBirthMonth(foundCust.birthday) : 0);

  if (isGuest) {
    // 🟠 KỊCH BẢN 2: KHÁCH VÃNG LAI -> HIỆN KHUNG GOM VÀNG CAM
    document.getElementById('modal-staff-note-name').innerText = 'Bổ Sung Thông Tin Khách';
    document.getElementById('modal-staff-note-phone').innerText = 'Tour ca chưa có số điện thoại';
    
    if (guestInputs) guestInputs.classList.remove('hidden');
    if (regularMonthSection) regularMonthSection.classList.add('hidden');

    if (guestNameInput) {
      guestNameInput.value = (name && name !== 'Khách vãng lai') ? name : '';
      guestNameInput.readOnly = false;
      guestNameInput.classList.remove('bg-gray-100', 'text-gray-500');
    }
    if (guestPhoneInput) {
      guestPhoneInput.value = '';
      delete guestPhoneInput.dataset.rawPhone;
    }
    if (lookupBadge) {
      lookupBadge.innerText = 'Nhập SĐT để dò tìm';
      lookupBadge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-white font-semibold text-[#7E7272] border border-[#F0EAE1]';
    }
    if (phoneHint) phoneHint.classList.add('hidden');

    if (guestMonthContainer) guestMonthContainer.classList.remove('hidden');
    if (guestMonthFixed) guestMonthFixed.classList.add('hidden');
    if (guestMonthSelect) { guestMonthSelect.value = ''; guestMonthSelect.style.color = '#A39696'; }
    if (noteContent) noteContent.value = '';
  } else {
    // 🟢 KỊCH BẢN 1: KHÁCH QUEN ĐÃ CÓ SĐT -> ẨN KHUNG GOM, HIỆN MỤC THÁNG CHO KHÁCH QUEN
    const displayPhone = rawPhone ? maskPhoneNumber(rawPhone, false) : '094*144';
    document.getElementById('modal-staff-note-name').innerText = name || foundCust?.customer_name || 'Khách Hàng';
    document.getElementById('modal-staff-note-phone').innerText = displayPhone;
    
    if (guestInputs) guestInputs.classList.add('hidden');
    if (regularMonthSection) regularMonthSection.classList.remove('hidden');

    if (bMonth && bMonth >= 1 && bMonth <= 12) {
      // ĐÃ CÓ THÁNG SINH -> ẨN DROPDOWN VĨNH VIỄN, HIỆN DÒNG CỐ ĐỊNH
      if (regMonthContainer) regMonthContainer.classList.add('hidden');
      if (regMonthFixed) regMonthFixed.classList.remove('hidden');
      if (regMonthFixedText) regMonthFixedText.innerText = `Sinh nhật: Tháng ${bMonth}`;
      if (regMonthSelect) regMonthSelect.value = String(bMonth);
    } else {
      // CHƯA CÓ THÁNG SINH -> MỞ DROPDOWN CHO KTV LƯU LẦN ĐẦU
      if (regMonthContainer) regMonthContainer.classList.remove('hidden');
      if (regMonthFixed) regMonthFixed.classList.add('hidden');
      if (regMonthSelect) { regMonthSelect.value = ''; regMonthSelect.style.color = '#A39696'; }
    }

    if (noteContent) {
      noteContent.value = foundCust?.notes || '';
    }
  }

  modal.classList.remove('hidden');
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

// 🔍 TỰ ĐỘNG DÒ TÌM SĐT KHÁCH QUEN & HIỂN THỊ DROPDOWN CHUẨN POS
function onStaffGuestPhoneInput(val) {
  const rawInput = val.trim();
  const clean = normalizePhone(rawInput);
  const lookupBadge = document.getElementById('modal-staff-note-lookup-badge');
  const phoneHint = document.getElementById('modal-staff-note-phone-hint');
  const guestNameInput = document.getElementById('modal-staff-note-guest-name');
  const suggestionsBox = document.getElementById('modal-staff-note-suggestions');
  const customers = getStored('customers', DEFAULT_CUSTOMERS);

  // 1. Hiển thị Dropdown gợi ý chuẩn POS nếu có ký tự gõ vào
  if (suggestionsBox) {
    if (rawInput.length >= 1) {
      const matches = customers.filter(c => {
        const p = normalizePhone(c.phone_number || c.raw_phone);
        const n = String(c.customer_name || '').toLowerCase();
        const q = rawInput.toLowerCase();
        return p.includes(clean || rawInput) || n.includes(q);
      }).slice(0, 5);

      if (matches.length > 0) {
        suggestionsBox.innerHTML = `
          <div class="px-3 py-1.5 bg-[#FAF6F1] text-[10px] font-extrabold text-[#7E7272] uppercase tracking-wider flex items-center justify-between border-b border-[#F0EAE1]">
            <span>🔍 Khách hàng tìm thấy (${matches.length})</span>
            <span class="text-[9px] text-[#A39696]">Chạm để chọn</span>
          </div>
          ${matches.map(c => {
            let fullP = normalizePhone(c.phone_number || c.raw_phone);
            let maskedP = maskPhoneNumber(fullP, false);
            let bMonth = c.birth_month || parseBirthMonth(c.birthday);
            const visits = Number(c.cycle_visits) || 0;
            const vCount = Number(c.voucher_count) || 0;

            return `
              <div onclick="selectStaffGuestSuggestion('${fullP}', '${(c.customer_name || 'Khách').replace(/'/g, "\\'")}', ${bMonth || 0})" class="p-2.5 hover:bg-[#FFF5F2] cursor-pointer transition flex items-center justify-between gap-2 border-b border-[#FAF6F1] last:border-b-0 bg-white">
                <div>
                  <div class="font-bold text-xs text-[#2D2424] flex items-center gap-1.5">
                    <span>👤 ${c.customer_name}</span>
                    ${bMonth ? `<span class="text-[10px] text-[#A39696] font-semibold">(T${bMonth})</span>` : ''}
                    ${vCount > 0 ? `<span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#E8F8F5] text-[#2E7D6D]">🎁 ${vCount} Voucher</span>` : ''}
                  </div>
                  <div class="text-[11px] font-mono text-[#E58A7B] font-semibold mt-0.5">${maskedP}</div>
                </div>
                <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FAF6F1] text-[#7E7272] border border-[#F0EAE1]">
                  ${visits}/10 ca
                </span>
              </div>
            `;
          }).join('')}
        `;
        suggestionsBox.classList.remove('hidden');
      } else {
        suggestionsBox.classList.add('hidden');
      }
    } else {
      suggestionsBox.classList.add('hidden');
    }
  }

  // 2. Tự động kiểm tra khớp số chính xác 10 số
  if (clean.length >= 9) {
    const foundCust = customers.find(c => isSamePhone(c.phone_number || c.raw_phone, clean));
    if (foundCust) {
      if (lookupBadge) {
        lookupBadge.innerText = `✓ Khách quen: ${foundCust.customer_name}`;
        lookupBadge.className = 'text-[10px] px-2.5 py-0.5 rounded-full bg-[#E8F8F5] text-[#2E7D6D] font-extrabold border border-[#B7EBDD]';
      }
      if (phoneHint) {
        phoneHint.innerText = `Đã tìm thấy: ${foundCust.customer_name} (${maskPhoneNumber(clean, false)})`;
        phoneHint.className = 'text-[11px] text-[#2E7D6D] font-semibold mt-1 block';
      }
      if (guestNameInput) {
        guestNameInput.value = foundCust.customer_name || '';
        guestNameInput.readOnly = true;
        guestNameInput.classList.add('bg-gray-100', 'text-gray-500');
      }
      let bMonth = foundCust.birth_month || parseBirthMonth(foundCust.birthday);
      const guestMonthContainer = document.getElementById('modal-staff-note-guest-month-container');
      const guestMonthFixed = document.getElementById('modal-staff-note-guest-month-fixed');
      const guestMonthFixedText = document.getElementById('modal-staff-note-guest-month-fixed-text');
      const guestMonthSelect = document.getElementById('modal-staff-note-guest-birth-month');

      if (bMonth && bMonth >= 1 && bMonth <= 12) {
        if (guestMonthContainer) guestMonthContainer.classList.add('hidden');
        if (guestMonthFixed) guestMonthFixed.classList.remove('hidden');
        if (guestMonthFixedText) guestMonthFixedText.innerText = `Sinh nhật: Tháng ${bMonth}`;
        if (guestMonthSelect) guestMonthSelect.value = String(bMonth);
      } else {
        if (guestMonthContainer) guestMonthContainer.classList.remove('hidden');
        if (guestMonthFixed) guestMonthFixed.classList.add('hidden');
      }
      return;
    }
  }

  // 3. Khách mới
  if (lookupBadge) {
    lookupBadge.innerText = clean.length >= 9 ? '+ Khách mới' : 'Nhập SĐT để dò tìm';
    lookupBadge.className = clean.length >= 9 ? 'text-[10px] px-2.5 py-0.5 rounded-full bg-[#FFF0EB] text-[#E58A7B] font-extrabold border border-[#FCDFD7]' : 'text-[10px] px-2 py-0.5 rounded-full bg-white font-semibold text-[#7E7272] border border-[#F0EAE1]';
  }
  if (phoneHint) {
    if (clean.length >= 9) {
      phoneHint.innerText = `Số mới: ${maskPhoneNumber(clean, false)} (Chưa có trong danh bạ)`;
      phoneHint.className = 'text-[11px] text-[#E58A7B] font-medium mt-1 block';
    } else {
      phoneHint.classList.add('hidden');
    }
  }
  if (guestNameInput) {
    guestNameInput.readOnly = false;
    guestNameInput.classList.remove('bg-gray-100', 'text-gray-500');
  }
}

// Khi KTV chạm vào 1 gợi ý từ bảng sổ xuống
function selectStaffGuestSuggestion(fullPhone, name, birthMonth) {
  const guestPhoneInput = document.getElementById('modal-staff-note-guest-phone');
  const guestNameInput = document.getElementById('modal-staff-note-guest-name');
  const suggestionsBox = document.getElementById('modal-staff-note-suggestions');
  const lookupBadge = document.getElementById('modal-staff-note-lookup-badge');
  const phoneHint = document.getElementById('modal-staff-note-phone-hint');
  const guestMonthContainer = document.getElementById('modal-staff-note-guest-month-container');
  const guestMonthFixed = document.getElementById('modal-staff-note-guest-month-fixed');
  const guestMonthFixedText = document.getElementById('modal-staff-note-guest-month-fixed-text');
  const guestMonthSelect = document.getElementById('modal-staff-note-guest-birth-month');

  if (guestPhoneInput) {
    guestPhoneInput.value = maskPhoneNumber(fullPhone, false);
    guestPhoneInput.dataset.rawPhone = fullPhone;
  }
  if (guestNameInput) {
    guestNameInput.value = name;
    guestNameInput.readOnly = true;
    guestNameInput.classList.add('bg-gray-100', 'text-gray-500');
  }

  if (suggestionsBox) suggestionsBox.classList.add('hidden');

  if (lookupBadge) {
    lookupBadge.innerText = `✓ Khách quen: ${name}`;
    lookupBadge.className = 'text-[10px] px-2.5 py-0.5 rounded-full bg-[#E8F8F5] text-[#2E7D6D] font-extrabold border border-[#B7EBDD]';
  }
  if (phoneHint) {
    phoneHint.innerText = `Đã chọn: ${name} (${maskPhoneNumber(fullPhone, false)})`;
    phoneHint.className = 'text-[11px] text-[#2E7D6D] font-semibold mt-1 block';
  }

  if (birthMonth && birthMonth >= 1 && birthMonth <= 12) {
    if (guestMonthContainer) guestMonthContainer.classList.add('hidden');
    if (guestMonthFixed) guestMonthFixed.classList.remove('hidden');
    if (guestMonthFixedText) guestMonthFixedText.innerText = `Sinh nhật: Tháng ${birthMonth}`;
    if (guestMonthSelect) guestMonthSelect.value = String(birthMonth);
  } else {
    if (guestMonthContainer) guestMonthContainer.classList.remove('hidden');
    if (guestMonthFixed) guestMonthFixed.classList.add('hidden');
  }
}

function closeStaffCustomerNoteModal() {
  document.getElementById('modal-staff-customer-note')?.classList.add('hidden');
}

function handleSaveStaffCustomerNote(e) {
  e.preventDefault();
  const rawPhone = document.getElementById('modal-staff-note-raw-phone')?.value;
  const receiptId = document.getElementById('modal-staff-note-receipt-id')?.value;
  const isGuest = document.getElementById('modal-staff-note-is-guest')?.value === '1';

  const guestName = document.getElementById('modal-staff-note-guest-name')?.value?.trim();
  const guestPhoneInput = document.getElementById('modal-staff-note-guest-phone');
  const inputPhoneVal = guestPhoneInput?.dataset?.rawPhone || guestPhoneInput?.value?.trim();
  
  const birthMonth = isGuest ? 
    document.getElementById('modal-staff-note-guest-birth-month')?.value : 
    document.getElementById('modal-staff-note-regular-birth-month')?.value;

  const notes = document.getElementById('modal-staff-note-content')?.value.trim();

  let targetPhone = rawPhone;
  let targetName = document.getElementById('modal-staff-note-name')?.innerText;

  if (isGuest) {
    if (!inputPhoneVal) {
      alert('Vui lòng nhập số điện thoại của khách hàng!');
      return;
    }
    targetPhone = normalizePhone(inputPhoneVal);
    if (targetPhone.length < 9) {
      alert('Số điện thoại không hợp lệ (cần đủ 10 số)!');
      return;
    }

    const customers = getStored('customers', DEFAULT_CUSTOMERS);
    const existingCust = customers.find(c => isSamePhone(c.phone_number || c.raw_phone, targetPhone));

    if (existingCust) {
      // 🟢 TRƯỜNG HỢP 2A: KHÁCH CŨ
      targetName = existingCust.customer_name || guestName || 'Khách hàng';
    } else {
      // 🟠 TRƯỜNG HỢP 2B: KHÁCH MỚI -> XÁC NHẬN TẠO MỚI
      targetName = guestName || 'Khách hàng';
      const maskedShow = maskPhoneNumber(targetPhone, false);
      const confirmCreate = confirm(`Số điện thoại ${maskedShow} là khách mới.\nBạn có chắc chắn muốn tạo hồ sơ khách hàng cho [${targetName}] không?`);
      if (!confirmCreate) return;
    }
  }

  // 1. Cập nhật vào danh bạ tb_customers trên LocalStorage
  const customers = getStored('customers', DEFAULT_CUSTOMERS);
  let foundIndex = customers.findIndex(c => isSamePhone(c.phone_number || c.raw_phone, targetPhone));

  if (foundIndex >= 0) {
    // Sửa tại chỗ khách cũ
    if (notes) customers[foundIndex].notes = notes;
    if (birthMonth && !customers[foundIndex].birth_month) {
      customers[foundIndex].birth_month = Number(birthMonth);
      customers[foundIndex].birthday = Number(birthMonth);
    }
    if (isGuest) {
      customers[foundIndex].cycle_visits = (Number(customers[foundIndex].cycle_visits) || 0) + 1;
      customers[foundIndex].total_visits = (Number(customers[foundIndex].total_visits) || 0) + 1;
    }
  } else {
    // Thêm mới khách hàng
    customers.push({
      phone_number: targetPhone,
      customer_name: targetName,
      birthday: birthMonth ? Number(birthMonth) : '',
      birth_month: birthMonth ? Number(birthMonth) : 0,
      cycle_start_date: normalizeDateKey(new Date()),
      cycle_visits: 1,
      total_visits: 1,
      voucher_count: 0,
      notes: notes || ''
    });
  }
  setStored('customers', customers);

  // 2. Cập nhật hóa đơn trong tb_receipts VÀ tb_payroll_logs nếu có receiptId
  if (receiptId) {
    const receipts = getStored('receipts', []);
    const rIdx = receipts.findIndex(r => r.receipt_id === receiptId);
    if (rIdx >= 0) {
      receipts[rIdx].customer_phone = targetPhone;
      receipts[rIdx].customer_name = targetName;
      receipts[rIdx].raw_phone = targetPhone;
      setStored('receipts', receipts);
    }

    const payrollLogs = getStored('payroll_logs', []);
    payrollLogs.forEach(p => {
      if (p.receipt_id === receiptId) {
        p.customer_name = targetName;
        p.customer_phone = targetPhone;
      }
    });
    setStored('payroll_logs', payrollLogs);
  }

  // 3. Lấy thông tin KTV đang đăng nhập chính xác 100%
  let activeUser = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : null;
  if (!activeUser) {
    try {
      activeUser = JSON.parse(localStorage.getItem('selena_active_session') || '{}');
    } catch(e) {}
  }
  const staffName = activeUser?.full_name || activeUser?.name || 'Nguyễn Thị Huệ';
  const staffId = activeUser?.staff_id || activeUser?.user_id || 'KTV01';

  // 4. Gửi đồng bộ về Google Apps Script
  callGasApi('update_customer_notes', {
    phone_number: targetPhone,
    customer_name: targetName,
    birth_month: birthMonth || '',
    birthday: birthMonth || '',
    notes: notes,
    receipt_id: receiptId || '',
    staff_name: staffName,
    staff_id: staffId,
    note: isGuest ? 'KTV cập nhật tour vãng lai' : 'Cập nhật ghi chú',
    action_type: isGuest ? 'ASSIGN_GUEST_CUSTOMER' : 'UPDATE_NOTES'
  });

  // 5. Cập nhật Firebase Realtime để các thiết bị khác đồng bộ ngay
  if (typeof fbSaveCustomerNote === 'function') {
    fbSaveCustomerNote(targetPhone, targetName, Number(birthMonth) || 0, notes);
  }
  if (receiptId && typeof firebase !== 'undefined' && firebase.database) {
    try {
      firebase.database().ref('receipts/' + receiptId).update({
        customer_name: targetName,
        customer_phone: targetPhone
      });
    } catch(e) {}
  }

  closeStaffCustomerNoteModal();
  alert('✅ Đã cập nhật thông tin khách hàng thành công!');

  // 6. Tải lại danh sách lịch sử tour ngay lập tức trên cả Staff lẫn Admin
  if (typeof loadStaffReceiptsList === 'function') {
    const curStaffDate = (typeof selectedStaffHistoryDate !== 'undefined') ? selectedStaffHistoryDate : 'ALL';
    loadStaffReceiptsList(curStaffDate);
  }
  if (typeof loadAdminReceiptsList === 'function') {
    const curAdminDate = (typeof selectedAdminHistoryDate !== 'undefined') ? selectedAdminHistoryDate : 'ALL';
    loadAdminReceiptsList(curAdminDate);
  }
}
