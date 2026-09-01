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

  if (monthSelect) monthSelect.value = (curMonth && curMonth >= 1 && curMonth <= 12) ? String(curMonth) : '';
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
