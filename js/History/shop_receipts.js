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
    dayReceipts.sort((a, b) => {
      const timeA = String(a.start_time || a.time || a.created_at || a.end_time || '');
      const timeB = String(b.start_time || b.time || b.created_at || b.end_time || '');
      return timeB.localeCompare(timeA);
    });
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

    if (dayReceipts.length === 0) {
      html += `
        <div class="py-3 text-center text-xs text-[#A39696] font-medium italic">
          Không có tour gội nào trong ngày
        </div>
      `;
    } else {
          html += dayReceipts.map(r => {
      const cleanTime = formatCleanTime(r.end_time || r.start_time || r.time, r.created_at);
      const durStatus = getReceiptDurationStatus(r);
      const isCash = r.payment_method === 'Tiền mặt';
      const totalPaid = Number(r.total_paid) || ((Number(r.price) || 0) + (Number(r.tip_amount) || 0));

      const payrollLogs = getStored('payroll_logs', []);
      const logsForThisReceipt = payrollLogs.filter(p => p.receipt_id === r.receipt_id);

      let staffListHtml = '';

      if (logsForThisReceipt.length > 0) {
        staffListHtml = logsForThisReceipt.map(p => `
          <div class="space-y-0.5 pl-2">
            <div class="flex justify-between items-center gap-2 min-w-0">
              <span class="text-[#2D2424] font-medium min-w-0 truncate">• ${p.staff_name} <span class="text-[10px] text-[#A39696]">(${p.role_in_tour === 'Chính' || p.role_in_tour === 'KTV 1 (Chính)' ? 'Chính' : 'Phụ'})</span>:</span>
              <span class="text-[#2E7D6D] font-extrabold font-mono whitespace-nowrap shrink-0">+${(Number(p.commission_amount) || 0).toLocaleString('vi-VN')} đ</span>
            </div>
            ${Number(p.tip_amount || 0) > 0 ? `
              <div class="flex justify-between items-center gap-2 pl-3 text-[#7E7272] min-w-0">
                <span class="text-[11px] font-medium shrink-0">Tip:</span>
                <span class="text-[#E58A7B] font-extrabold text-[11px] font-mono whitespace-nowrap shrink-0">+${Number(p.tip_amount).toLocaleString('vi-VN')} đ</span>
              </div>
            ` : ''}
          </div>
        `).join('');
      } else {
        // Fallback đọc từ staff_names hoặc các cột cũ
        let staffNamesArr = [];
        if (r.staff_names && String(r.staff_names).trim() !== '') {
          staffNamesArr = String(r.staff_names).split(',').map(s => s.trim()).filter(Boolean);
        } else {
          if (r.staff_1_name && r.staff_1_name !== '-') staffNamesArr.push(r.staff_1_name);
          if (r.staff_2_name && r.staff_2_name !== '-') staffNamesArr.push(r.staff_2_name);
          if (r.staff_3_name && r.staff_3_name !== '-') staffNamesArr.push(r.staff_3_name);
        }

        if (staffNamesArr.length === 0) staffNamesArr.push('KTV Phục vụ');

        staffListHtml = staffNamesArr.map((sName, sIdx) => {
          let sComm = sIdx === 0 ? (Number(r.staff_1_comm) || 0) : (sIdx === 1 ? (Number(r.staff_2_comm) || 0) : (Number(r.staff_3_comm) || 0));
          let sTip = sIdx === 0 ? (Number(r.staff_1_tip) || 0) : (sIdx === 1 ? (Number(r.staff_2_tip) || 0) : (Number(r.staff_3_tip) || 0));
          return `
            <div class="space-y-0.5 pl-2">
              <div class="flex justify-between items-center">
                <span class="text-[#2D2424] font-medium">• ${sName}:</span>
                <span class="text-[#2E7D6D] font-extrabold font-mono">+${sComm.toLocaleString('vi-VN')} đ</span>
              </div>
              ${sTip > 0 ? `
                <div class="flex justify-between items-center pl-3 text-[#7E7272]">
                  <span class="text-[11px] font-medium">Tip:</span>
                  <span class="text-[#E58A7B] font-extrabold text-[11px] font-mono">+${sTip.toLocaleString('vi-VN')} đ</span>
                </div>
              ` : ''}
            </div>
          `;
        }).join('');
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
                <h4 class="font-bold text-[#2D2424] text-sm truncate">${r.service_name}</h4>
                <span class="text-sm font-extrabold text-[#E58A7B] whitespace-nowrap shrink-0 font-mono">${totalPaid.toLocaleString('vi-VN')} đ</span>
              </div>

              <!-- Hàng thông tin phụ: Tên khách • Hình thức thanh toán ... Mã hóa đơn -->
              <div class="flex items-center justify-between gap-2 text-[11px] text-[#7E7272] min-w-0">
                <div class="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                  <button type="button" onclick="openOwnerCustomerEditorModal('${r.customer_phone || r.raw_phone || ''}', '${(r.customer_name || 'Khách vãng lai').replace(/'/g, "\\'")}', '${r.receipt_id || ''}')" class="inline-flex items-center gap-1 min-w-0 text-[#2D2424] font-medium hover:text-[#E58A7B] cursor-pointer transition group shrink" title="Bấm để chỉnh sửa thông tin khách hàng">
                    <i data-lucide="user" class="w-3.5 h-3.5 text-[#A39696] group-hover:text-[#E58A7B] shrink-0"></i>
                    <span class="truncate font-semibold text-[#2D2424] group-hover:text-[#E58A7B] underline decoration-dotted underline-offset-2 max-w-[95px] sm:max-w-[150px]">${r.customer_name || 'Khách vãng lai'}</span>
                    <i data-lucide="edit-3" class="w-3 h-3 text-[#E58A7B] shrink-0 ml-0.5 opacity-80 group-hover:opacity-100"></i>
                  </button>
                  <span class="text-[#D4C5B9] shrink-0">•</span>
                  <span class="inline-flex items-center gap-1 font-semibold ${isCash ? 'text-[#D35400]' : 'text-[#2E7D6D]'} shrink-0 whitespace-nowrap">
                    <i data-lucide="${isCash ? 'banknote' : 'qr-code'}" class="w-3 h-3 shrink-0"></i>
                    ${r.payment_method || 'Chuyển khoản'}
                  </span>
                </div>
                <span class="text-[10px] text-[#A39696] font-mono shrink-0 ml-auto whitespace-nowrap">${r.receipt_id}</span>
              </div>
            </div>

            <!-- KHUNG KỸ THUẬT VIÊN HIỂN THỊ ĐỦ TẤT CẢ KTV -->
            <div class="bg-[#FAF6F1] p-2.5 rounded-2xl border border-[#F0EAE1] space-y-1.5 text-xs">
              <div class="font-bold text-[#7E7272] flex items-center gap-1.5 mb-1">
                <i data-lucide="users" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
                <span>Kỹ thuật viên:</span>
              </div>
              ${staffListHtml}
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


// =============================================================
// =============================================================
// COMPONENT: MODAL QUẢN TRỊ HỒ SƠ KHÁCH HÀNG (DÀNH CHO CHỦ TIỆM)
// Toàn quyền sửa tháng sinh, tên, SĐT 10 số thật và quản lý chu kỳ khách hàng
// =============================================================

async function openOwnerCustomerEditorModal(phone, name, receiptId) {
  const modal = document.getElementById('modal-owner-customer-editor');
  if (!modal) return;

  const allCusts = typeof getAllAvailableCustomers === 'function' ? getAllAvailableCustomers() : getStored('customers', DEFAULT_CUSTOMERS);
  const receipts = getStored('receipts', []);

  let truePhone = '';
  // 1. Nếu phone là số thật 10 số (không chứa *)
  if (phone && !String(phone).includes('*') && String(phone).replace(/[^0-9]/g, '').length >= 9) {
    truePhone = normalizePhone(phone);
  }

  // 2. Tìm theo receiptId
  if (!truePhone && receiptId) {
    const r = receipts.find(x => x.receipt_id === receiptId);
    if (r) {
      if (r.raw_phone && !String(r.raw_phone).includes('*')) {
        truePhone = normalizePhone(r.raw_phone);
      } else if (r.customer_phone && !String(r.customer_phone).includes('*')) {
        truePhone = normalizePhone(r.customer_phone);
      }
    }
  }

  // 3. Tìm theo tên khách hàng trong danh bạ
  let cust = null;
  if (name && name !== 'Khách vãng lai' && name !== 'Khách hàng') {
    cust = allCusts.find(c => c.customer_name && c.customer_name.trim().toLowerCase() === name.trim().toLowerCase());
    if (cust && !truePhone) {
      truePhone = normalizePhone(cust.phone_number || cust.raw_phone);
    }
  }

  if (truePhone && !cust) {
    cust = allCusts.find(c => isSamePhone(c.phone_number || c.raw_phone, truePhone));
  }

  document.getElementById('modal-owner-edit-raw-phone').value = truePhone || '';
  document.getElementById('modal-owner-edit-name').value = name || cust?.customer_name || 'Khách Hàng';
  document.getElementById('modal-owner-edit-phone').value = truePhone || '';

  const monthSelect = document.getElementById('modal-owner-edit-birth-month');
  const noteInput = document.getElementById('modal-owner-edit-notes');
  const cycleVisitsEl = document.getElementById('modal-owner-edit-cycle-visits');
  const voucherCountEl = document.getElementById('modal-owner-edit-voucher-count');

  let curMonth = (cust && cust.birth_month) ? cust.birth_month : (cust && cust.birthday ? parseBirthMonth(cust.birthday) : 0);
  let curNotes = (cust && cust.notes) ? cust.notes : '';
  let curVisits = (cust && cust.cycle_visits) ? Number(cust.cycle_visits) : 1;
  let curVouchers = (cust && cust.voucher_count) ? Number(cust.voucher_count) : 0;

  if (monthSelect) {
    monthSelect.value = (curMonth && curMonth >= 1 && curMonth <= 12) ? String(curMonth) : '';
    monthSelect.style.color = monthSelect.value ? '#2D2424' : '#A39696';
  }
  if (noteInput) noteInput.value = curNotes;
  if (cycleVisitsEl) cycleVisitsEl.innerText = `${curVisits} / 10 lần`;
  if (voucherCountEl) voucherCountEl.innerText = `${curVouchers} voucher`;

  modal.classList.remove('hidden');
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();

  if (truePhone) {
    try {
      const res = await callGasApi('check_customer', { phone_number: truePhone });
      if (res && res.found && res.customer) {
        const liveCust = res.customer;
        let liveMonth = liveCust.birth_month || parseBirthMonth(liveCust.birthday);
        let liveNotes = liveCust.notes || '';
        let liveVisits = Number(liveCust.cycle_visits || 1);
        let liveVouchers = Number(liveCust.voucher_count || 0);

        if (monthSelect && liveMonth) monthSelect.value = String(liveMonth);
        if (noteInput && liveNotes && !noteInput.value) noteInput.value = liveNotes;
        if (cycleVisitsEl) cycleVisitsEl.innerText = `${liveVisits} / 10 lần`;
        if (voucherCountEl) voucherCountEl.innerText = `${liveVouchers} voucher`;
      }
    } catch(e) {}
  }
}

function closeOwnerCustomerEditorModal() {
  document.getElementById('modal-owner-customer-editor')?.classList.add('hidden');
}

function handleSaveOwnerCustomerEditor(e) {
  e.preventDefault();
  const rawPhone = document.getElementById('modal-owner-edit-raw-phone')?.value;
  const newName = document.getElementById('modal-owner-edit-name')?.value.trim();
  const newPhone = normalizePhone(document.getElementById('modal-owner-edit-phone')?.value);
  const birthMonth = document.getElementById('modal-owner-edit-birth-month')?.value;
  const notes = document.getElementById('modal-owner-edit-notes')?.value.trim();

  if (!newPhone && !rawPhone) {
    alert('Vui lòng nhập số điện thoại khách!');
    return;
  }

  const targetPhone = newPhone || rawPhone;
  const bMonthNum = Number(birthMonth) || 0;

  // 1. Cập nhật local storage
  const customers = getStored('customers', DEFAULT_CUSTOMERS);
  let found = false;
  customers.forEach(c => {
    if (isSamePhone(c.phone_number || c.raw_phone, rawPhone) || isSamePhone(c.phone_number || c.raw_phone, targetPhone)) {
      c.customer_name = newName || c.customer_name;
      c.phone_number = targetPhone;
      c.raw_phone = targetPhone;
      c.birth_month = bMonthNum;
      c.birthday = bMonthNum ? bMonthNum : '';
      c.notes = notes;
      found = true;
    }
  });

  if (!found) {
    customers.push({
      phone_number: targetPhone,
      raw_phone: targetPhone,
      customer_name: newName || 'Khách hàng',
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

  // 2. Bắn sang Firebase & Google Sheets
  if (typeof fbSaveCustomerNote === 'function') {
    fbSaveCustomerNote(targetPhone, newName, bMonthNum, notes);
  }

  callGasApi('update_customer_notes', {
    phone_number: targetPhone,
    customer_phone: targetPhone,
    customer_name: newName,
    birth_month: bMonthNum,
    birthday: bMonthNum ? bMonthNum : '',
    notes: notes
  });

  closeOwnerCustomerEditorModal();
  alert('👑 Đã cập nhật hồ sơ khách hàng thành công!');
  
  if (typeof loadAdminReceiptsList === 'function') {
    loadAdminReceiptsList(selectedAdminHistoryDate);
  }
}
