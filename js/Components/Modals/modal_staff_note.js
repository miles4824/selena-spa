// =============================================================
// COMPONENT: MODAL GHI CHÚ KHÁCH HÀNG DÀNH CHO KTV (STAFF)
// Quy tắc: Khách ĐÃ CÓ tháng sinh -> ẨN Ô CHỌN THÁNG VĨNH VIỄN
// =============================================================
async function openStaffCustomerNoteModal(phone, name, receiptId) {
  const modal = document.getElementById('modal-staff-customer-note');
  if (!modal) return;

  const custName = (name || '').trim();
  const allCusts = typeof getAllAvailableCustomers === 'function' ? getAllAvailableCustomers() : (typeof getStored === 'function' ? getStored('customers', []) : []);
  const receipts = typeof getStored === 'function' ? getStored('receipts', []) : [];

  let truePhone = PhoneService.normalize(phone);

  if (!truePhone && receiptId) {
    const matchedR = receipts.find(r => r.receipt_id === receiptId);
    if (matchedR) {
      truePhone = PhoneService.normalize(matchedR.customer_phone || matchedR.raw_phone);
    }
  }

  let cust = null;
  if (truePhone) {
    cust = allCusts.find(c => PhoneService.isSame(c.phone_number || c.raw_phone, truePhone));
  }
  if (!cust && custName && custName !== 'Khách vãng lai' && custName !== 'Khách hàng') {
    cust = allCusts.find(c => c.customer_name && c.customer_name.trim().toLowerCase() === custName.toLowerCase());
    if (cust && !truePhone) {
      truePhone = PhoneService.normalize(cust.phone_number || cust.raw_phone);
    }
  }

  document.getElementById('modal-staff-note-raw-phone').value = truePhone || '';
  document.getElementById('modal-staff-note-name').innerText = custName || (cust && cust.customer_name) || 'Khách Hàng';
  
  const monthSelect = document.getElementById('modal-staff-note-birth-month');
  const monthContainer = document.getElementById('modal-staff-note-birth-month-container');
  const noteInput = document.getElementById('modal-staff-note-content');
  const phoneEl = document.getElementById('modal-staff-note-phone');
  const maskedP = PhoneService.mask(truePhone, false);

  let initialMonth = (cust && cust.birth_month) ? Number(cust.birth_month) : (cust && cust.birthday ? parseBirthMonth(cust.birthday) : 0);
  let initialNotes = (cust && cust.notes) ? cust.notes : '';

  // QUY TẮC: Khách ĐÃ CÓ tháng sinh -> ẨN Ô CHỌN THÁNG VĨNH VIỄN
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
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();

  // Đồng bộ ngầm live trực tiếp từ Google Apps Script
  if (truePhone) {
    try {
      const res = await callGasApi('check_customer', { phone_number: truePhone });
      if (res && res.found && res.customer) {
        const liveCust = res.customer;
        let liveMonth = Number(liveCust.birth_month) || parseBirthMonth(liveCust.birthday);
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

        const curCusts = getStored('customers', []);
        const idx = curCusts.findIndex(c => PhoneService.isSame(c.phone_number || c.raw_phone, truePhone));
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

function closeStaffCustomerNoteModal() {
  document.getElementById('modal-staff-customer-note')?.classList.add('hidden');
}

function handleSaveStaffCustomerNote(e) {
  e.preventDefault();
  let rawPhone = document.getElementById('modal-staff-note-raw-phone')?.value;
  const name = document.getElementById('modal-staff-note-name')?.innerText;
  const birthMonth = document.getElementById('modal-staff-note-birth-month')?.value;
  const notes = document.getElementById('modal-staff-note-content')?.value.trim();

  const allCusts = typeof getAllAvailableCustomers === 'function' ? getAllAvailableCustomers() : (typeof getStored === 'function' ? getStored('customers', []) : []);
  if (!rawPhone && name) {
    const matchedCust = allCusts.find(c => c.customer_name && c.customer_name.trim().toLowerCase() === name.trim().toLowerCase());
    if (matchedCust) {
      rawPhone = PhoneService.normalize(matchedCust.phone_number || matchedCust.raw_phone);
    }
  }

  if (!rawPhone) {
    alert('Không tìm thấy số điện thoại khách để lưu ghi chú!');
    return;
  }

  const bMonthNum = Number(birthMonth) || 0;

  // 1. Update Local Storage
  const customers = getStored('customers', []);
  let found = false;
  customers.forEach(c => {
    if (PhoneService.isSame(c.phone_number || c.raw_phone, rawPhone)) {
      c.notes = notes;
      if (bMonthNum > 0 && (!c.birth_month || Number(c.birth_month) === 0)) {
        c.birth_month = bMonthNum;
        c.birthday = bMonthNum;
      }
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
      cycle_start_date: DateTimeService.formatDateKey(new Date()),
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
  if (typeof callGasApi === 'function') {
    callGasApi('update_customer_notes', {
      phone_number: rawPhone,
      customer_phone: rawPhone,
      customer_name: name,
      birth_month: bMonthNum,
      birthday: bMonthNum ? bMonthNum : '',
      notes: notes
    });
  }

  closeStaffCustomerNoteModal();
  alert('✅ Đã lưu ghi chú sở thích khách hàng thành công!');
}
