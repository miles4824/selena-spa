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
                <span>Hoa hồng tour (${item.commission_pct || (partnerNameStr ? '50%' : '100%')}):</span>
                <span class="text-[#2E7D6D] font-extrabold">+${myComm.toLocaleString('vi-VN')} đ</span>
              </div>
              ${myTip > 0 ? `
                <div class="flex justify-between items-center text-[#E58A7B] font-bold pt-0.5 border-t border-[#F0EAE1]">
                  <span class="flex items-center gap-1.5">
                    <i data-lucide="gift" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
                    <span>Tiền tip nhận được:</span>
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
              <span class="text-[10px] ${durStatus.colorClass} font-extrabold block leading-tight mt-0.5" title="${durStatus.title}">${durStatus.label}</span>
            </div>

            <div class="bg-white rounded-[28px] border border-[#F0EAE1] shadow-[0_10px_30px_-5px_rgba(229,138,123,0.05),0_4px_12px_rgba(0,0,0,0.02)] p-3.5 flex-1 space-y-2.5 min-w-0">
              <div class="space-y-1">
                <div class="flex justify-between items-center gap-2">
                  <h4 class="font-bold text-[#2D2424] text-sm truncate">${item.service_name}</h4>
                  <span class="text-sm font-extrabold text-[#2E7D6D] whitespace-nowrap shrink-0">+${totalEarn.toLocaleString('vi-VN')} đ</span>
                </div>

                <div class="flex items-center justify-between gap-1.5 text-[11px] text-[#7E7272] flex-wrap">
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span class="inline-flex items-center gap-1 truncate text-[#2D2424] font-medium">
                      <i data-lucide="user" class="w-3 h-3 text-[#A39696] shrink-0"></i>
                      <span class="truncate font-semibold text-[#2D2424]">${item.customer_name || 'Khách vãng lai'}</span>
                    </span>
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
// MODAL GHI CHÚ KHÁCH HÀNG (DÀNH CHO KTV & CHỦ TIỆM SAU CA)
// =============================================================
async function openCustomerNoteModal(phone, name) {
  const modal = document.getElementById('modal-customer-note');
  if (!modal) return;

  const rawPhone = normalizePhone(phone);
  const isOwner = typeof isUserOwner === 'function' ? isUserOwner(currentUser) : false;

  document.getElementById('modal-note-cust-raw-phone').value = rawPhone;
  document.getElementById('modal-note-cust-name').innerText = name || 'Khách Hàng';
  document.getElementById('modal-note-cust-phone').innerText = maskPhoneNumber(rawPhone, isOwner);

  const monthSelect = document.getElementById('modal-note-birth-month');
  const monthContainer = document.getElementById('modal-note-birth-month-container');
  const noteInput = document.getElementById('modal-note-content');
  const phoneEl = document.getElementById('modal-note-cust-phone');
  const maskedP = maskPhoneNumber(rawPhone, isOwner);

  // 1. Tìm thông tin trong bộ nhớ (từ customers và receipts)
  const allCusts = typeof getAllAvailableCustomers === 'function' ? getAllAvailableCustomers() : getStored('customers', []);
  let cust = allCusts.find(c => {
    const p = c.phone_number || c.raw_phone;
    return typeof isSamePhone === 'function' ? isSamePhone(p, rawPhone) : (normalizePhone(p) === rawPhone);
  });

  let initialMonth = (cust && cust.birth_month) ? cust.birth_month : (cust && cust.birthday ? parseBirthMonth(cust.birthday) : 0);
  let initialNotes = (cust && cust.notes) ? cust.notes : '';

  if (initialMonth && initialMonth >= 1 && initialMonth <= 12) {
    if (phoneEl) phoneEl.innerText = `${maskedP} • Sinh nhật: Tháng ${initialMonth}`;
    if (monthContainer) monthContainer.classList.add('hidden');
  } else {
    if (phoneEl) phoneEl.innerText = maskedP;
    if (monthContainer) monthContainer.classList.remove('hidden');
  }

  if (monthSelect) {
    monthSelect.value = (initialMonth && initialMonth >= 1 && initialMonth <= 12) ? String(initialMonth) : '';
  }
  if (noteInput) {
    noteInput.value = initialNotes;
  }

  modal.classList.remove('hidden');
  lucide.createIcons();

  // 2. Đồng bộ ngầm live trực tiếp từ Google Apps Script
  if (rawPhone) {
    try {
      const res = await callGasApi('check_customer', { phone_number: rawPhone });
      if (res && res.found && res.customer) {
        const liveCust = res.customer;
        let liveMonth = liveCust.birth_month || parseBirthMonth(liveCust.birthday);
        let liveNotes = liveCust.notes || '';
        
        if (liveMonth && liveMonth >= 1 && liveMonth <= 12) {
          if (phoneEl) phoneEl.innerText = `${maskedP} • Sinh nhật: Tháng ${liveMonth}`;
          if (monthContainer) monthContainer.classList.add('hidden');
        } else {
          if (monthContainer) monthContainer.classList.remove('hidden');
        }

        if (monthSelect) {
          monthSelect.value = (liveMonth && liveMonth >= 1 && liveMonth <= 12) ? String(liveMonth) : '';
        }
        if (noteInput && liveNotes && !noteInput.value) {
          noteInput.value = liveNotes;
        }

        // Cập nhật lại vào local storage
        const curCusts = getStored('customers', []);
        const idx = curCusts.findIndex(c => normalizePhone(c.phone_number || c.raw_phone) === rawPhone);
        if (idx >= 0) {
          curCusts[idx] = { ...curCusts[idx], ...liveCust };
        } else {
          curCusts.push(liveCust);
        }
        setStored('customers', curCusts);
      }
    } catch(e) {}
  }
}

function closeCustomerNoteModal() {
  document.getElementById('modal-customer-note')?.classList.add('hidden');
}

function handleSaveCustomerNote(e) {
  e.preventDefault();
  const rawPhone = document.getElementById('modal-note-cust-raw-phone')?.value;
  const name = document.getElementById('modal-note-cust-name')?.innerText;
  const birthMonth = document.getElementById('modal-note-birth-month')?.value;
  const notes = document.getElementById('modal-note-content')?.value.trim();

  if (!rawPhone) {
    alert('Không tìm thấy số điện thoại khách!');
    return;
  }

  const bMonthNum = Number(birthMonth) || 0;

  // 1. Update Local Storage
  const customers = getStored('customers', []);
  let found = false;
  customers.forEach(c => {
    if (normalizePhone(c.phone_number || c.raw_phone) === rawPhone) {
      c.notes = notes;
      c.birth_month = bMonthNum;
      c.birthday = bMonthNum ? bMonthNum : '';
      found = true;
    }
  });

  if (!found) {
    customers.push({
      phone_number: rawPhone,
      raw_phone: rawPhone,
      customer_name: name || 'Khách hàng',
      birth_month: bMonthNum,
      birthday: bMonthNum ? bMonthNum : '',
      cycle_start_date: normalizeDateKey(new Date()),
      cycle_visits: 1,
      total_visits: 1,
      voucher_count: 0,
      notes: notes
    });
  }

  setStored('customers', customers);
  if (typeof fbSaveCustomerNote === 'function') {
    fbSaveCustomerNote(rawPhone, name, bMonthNum, notes);
  }

  // 2. Call Google Apps Script API
  callGasApi('update_customer_notes', {
    phone_number: rawPhone,
    customer_phone: rawPhone,
    customer_name: name,
    birth_month: bMonthNum,
    birthday: bMonthNum ? bMonthNum : '',
    notes: notes
  });

  closeCustomerNoteModal();
  alert('✅ Đã lưu ghi chú và tháng sinh khách hàng thành công!');
}