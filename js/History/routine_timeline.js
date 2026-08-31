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

  // 1. ĐỌC TRỰC TIẾP TỪ SỔ LƯƠNG TB_PAYROLL_LOGS (NGUỒN DỮ LIỆU CHUẨN XÁC NHẤT)
  const payrollLogs = getStored('payroll_logs', []);
  const myLogs = payrollLogs.filter(p => {
    return (staffPhone && normalizePhone(p.staff_phone) === staffPhone) ||
           (staffCode && String(p.staff_id || '').trim() === staffCode) ||
           (myNameClean && String(p.staff_name || '').toLowerCase().includes(myNameClean));
  });

  const receipts = getStored('receipts', []);

  // 2. TỔNG HỢP DANH SÁCH TOUR (Ưu tiên tb_payroll_logs, fallback tb_receipts)
  let itemsToRender = [];

  if (myLogs.length > 0) {
    itemsToRender = myLogs.map(p => {
      const matchRec = receipts.find(r => r.receipt_id === p.receipt_id);
      return {
        receipt_id: p.receipt_id,
        date: p.date,
        start_time: p.start_time,
        end_time: p.end_time,
        duration_min: p.duration_min || 45,
        service_name: p.service_name,
        customer_name: p.customer_name || 'Khách vãng lai',
        customer_phone: matchRec?.customer_phone || '',
        raw_phone: matchRec?.raw_phone || '',
        payment_method: p.payment_method || matchRec?.payment_method || 'Chuyển khoản',
        myComm: Number(p.commission_amount) || 0,
        myTip: Number(p.tip_amount) || 0,
        totalEarn: Number(p.total_earned) || (Number(p.commission_amount || 0) + Number(p.tip_amount || 0)),
        role_in_tour: p.role_in_tour || 'KTV Phục vụ',
        created_at: p.created_at || p.date
      };
    });
  } else {
    // Fallback nếu tb_payroll_logs chưa được đồng bộ
    const myAllReceipts = receipts.filter(r => {
      const s1Phone = normalizePhone(r.staff_1_user_id || r.staff_1_phone || r.staff_phone);
      const s1Code = String(r.staff_1_id || r.staff_id || '').trim();
      const s2Phone = normalizePhone(r.staff_2_user_id || r.staff_2_phone);
      const s2Code = String(r.staff_2_id || '').trim();
      const s3Phone = normalizePhone(r.staff_3_user_id || r.staff_3_phone);
      const s3Code = String(r.staff_3_id || '').trim();
      const s1Name = String(r.staff_1_name || '').toLowerCase();
      const s2Name = String(r.staff_2_name || '').toLowerCase();
      const s3Name = String(r.staff_3_name || '').toLowerCase();
      const sNames = String(r.staff_names || '').toLowerCase();

      if (staffPhone && (s1Phone === staffPhone || s2Phone === staffPhone || s3Phone === staffPhone)) return true;
      if (staffCode && (s1Code === staffCode || s2Code === staffCode || s3Code === staffCode)) return true;
      if (myNameClean && (s1Name.includes(myNameClean) || s2Name.includes(myNameClean) || s3Name.includes(myNameClean) || sNames.includes(myNameClean))) return true;

      if (r.staffs && Array.isArray(r.staffs) && r.staffs.length > 0) {
        if (r.staffs.some(st => normalizePhone(st.phone) === staffPhone || (staffCode && String(st.staff_id || '').trim() === staffCode) || (myNameClean && String(st.name || '').toLowerCase().includes(myNameClean)))) {
          return true;
        }
      }
      return false;
    });

    itemsToRender = myAllReceipts.map(r => {
      let myComm = 0;
      let myTip = 0;
      if (r.staffs && Array.isArray(r.staffs) && r.staffs.length > 0) {
        const myStaffEntry = r.staffs.find(st => normalizePhone(st.phone) === staffPhone || (staffCode && String(st.staff_id || '').trim() === staffCode) || (myNameClean && String(st.name || '').toLowerCase().includes(myNameClean)));
        if (myStaffEntry) {
          myComm = Number(myStaffEntry.comm_vnd || myStaffEntry.comm) || 0;
          myTip = Number(myStaffEntry.tip_vnd || myStaffEntry.tip) || 0;
        }
      } else {
        const isS1 = (staffPhone && normalizePhone(r.staff_1_phone || r.staff_phone) === staffPhone) ||
                     (staffCode && String(r.staff_1_id || r.staff_id).trim() === staffCode) ||
                     (myNameClean && String(r.staff_1_name || '').toLowerCase().includes(myNameClean));
        myComm = isS1 ? ((r.staff_1_comm !== undefined && r.staff_1_comm !== null && Number(r.staff_1_comm) > 0) ? Number(r.staff_1_comm) : (Number(r.commission_amount) || 0)) : (Number(r.staff_2_comm) || 0);
        myTip = isS1 ? (Number(r.staff_1_tip) || 0) : (Number(r.staff_2_tip) || 0);

        // Nếu hoa hồng = 0 do chưa tính, tự động tính theo % của KTV
        if (myComm === 0 && Number(r.price) > 0) {
          const rate = (currentUser && Number(currentUser.commission_rate) > 0) ? Number(currentUser.commission_rate) : 10;
          const isMulti = Boolean(r.has_staff_2 || (r.staff_names && r.staff_names.includes(',')));
          myComm = Math.round(Number(r.price) * (rate / 100) * (isMulti ? 0.5 : 1));
        }
      }
      return {
        receipt_id: r.receipt_id,
        date: r.date,
        start_time: r.start_time || r.time,
        end_time: r.end_time || r.start_time,
        duration_min: r.duration_min || 45,
        service_name: r.service_name,
        customer_name: r.customer_name || 'Khách vãng lai',
        customer_phone: r.customer_phone || '',
        raw_phone: r.raw_phone || '',
        payment_method: r.payment_method || 'Chuyển khoản',
        myComm: myComm,
        myTip: myTip,
        totalEarn: myComm + myTip,
        role_in_tour: r.staff_names || r.staff_1_name || 'KTV Phục vụ',
        created_at: r.created_at || r.date
      };
    });
  }

  const todayKey = normalizeDateKey(new Date());
  let dateList = [];

  if (selectedStaffHistoryDate === 'ALL') {
    const datesSet = new Set();
    datesSet.add(todayKey);
    itemsToRender.forEach(item => {
      const rDate = normalizeDateKey(item.date || item.created_at);
      if (rDate) datesSet.add(rDate);
    });
    dateList = Array.from(datesSet).sort().reverse();
  } else {
    dateList = [selectedStaffHistoryDate];
  }

  let html = '';

  dateList.forEach(dKey => {
    const dayItems = itemsToRender.filter(item => normalizeDateKey(item.date || item.created_at) === dKey);
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
        const cleanTime = formatCleanTime(item.start_time);
        const durStatus = getReceiptDurationStatus(item);
        const isCash = item.payment_method === 'Tiền mặt';

        let detailBoxHtml = '';
        if (item.myTip > 0) {
          detailBoxHtml = `
            <!-- KHUNG CHI TIẾT KHI CÓ TIỀN TIP -->
            <div class="bg-[#FAF6F1] p-2.5 rounded-2xl border border-[#F0EAE1] space-y-1 text-xs">
              <div class="flex justify-between items-center text-[#7E7272]">
                <span>Hoa hồng tour:</span>
                <span class="text-[#2E7D6D] font-extrabold">+${item.myComm.toLocaleString('vi-VN')} đ</span>
              </div>
              <div class="flex justify-between items-center text-[#E58A7B] font-bold pt-0.5 border-t border-[#F0EAE1]">
                <span class="flex items-center gap-1.5">
                  <i data-lucide="gift" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
                  <span>Tiền tip nhận được:</span>
                </span>
                <span class="font-extrabold">+${item.myTip.toLocaleString('vi-VN')} đ</span>
              </div>
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
                  <span class="text-sm font-extrabold text-[#2E7D6D] whitespace-nowrap shrink-0">+${item.totalEarn.toLocaleString('vi-VN')} đ</span>
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
                  <div class="flex items-center gap-1.5 ml-auto">
                    ${(item.raw_phone || item.customer_phone) ? `
                      <button type="button" onclick="openCustomerNoteModal('${item.raw_phone || item.customer_phone}', '${(item.customer_name || 'Khách hàng').replace(/'/g, "\'")}')" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FFF0EB] hover:bg-[#FCDFD7] text-[#E58A7B] text-[10px] font-bold border border-[#FCDFD7] transition cursor-pointer active:scale-95" title="Thêm / sửa ghi chú sở thích của khách">
                        <i data-lucide="edit-3" class="w-3 h-3"></i> Ghi chú
                      </button>
                    ` : ''}
                    <span class="text-[10px] text-[#A39696] font-mono shrink-0">${item.receipt_id}</span>
                  </div>
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