// =============================================================
// COMPONENT: MODAL QUẢN TRỊ HỒ SƠ KHÁCH HÀNG (DÀNH CHO CHỦ TIỆM)
// Toàn quyền sửa tháng sinh, tên, SĐT và quản lý chu kỳ khách hàng
// =============================================================
async function openOwnerCustomerEditorModal(phone, name, receiptId) {
  const modal = document.getElementById('modal-owner-customer-editor');
  if (!modal) return;

  let rawPhone = PhoneService.resolveTruePhone(phone, name, receiptId);
  document.getElementById('modal-owner-edit-raw-phone').value = rawPhone;
  document.getElementById('modal-owner-edit-name').value = name || 'Khách Hàng';
  document.getElementById('modal-owner-edit-phone').value = rawPhone || '';

  const monthSelect = document.getElementById('modal-owner-edit-birth-month');
  const noteInput = document.getElementById('modal-owner-edit-notes');
  const cycleVisitsEl = document.getElementById('modal-owner-edit-cycle-visits');
  const voucherCountEl = document.getElementById('modal-owner-edit-voucher-count');

  const allCusts = typeof getAllAvailableCustomers === 'function' ? getAllAvailableCustomers() : (typeof getStored === 'function' ? getStored('customers', []) : []);
  let cust = allCusts.find(c => PhoneService.isSame(c.phone_number || c.raw_phone, rawPhone));

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

  if (rawPhone) {
    try {
      const res = await callGasApi('check_customer', { phone_number: rawPhone });
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
  const newPhone = PhoneService.normalize(document.getElementById('modal-owner-edit-phone')?.value);
  const birthMonth = document.getElementById('modal-owner-edit-birth-month')?.value;
  const notes = document.getElementById('modal-owner-edit-notes')?.value.trim();

  if (!newPhone && !rawPhone) {
    alert('Vui lòng nhập số điện thoại khách!');
    return;
  }

  const targetPhone = newPhone || rawPhone;
  const bMonthNum = Number(birthMonth) || 0;

  // 1. Cập nhật local storage
  const customers = getStored('customers', []);
  let found = false;
  customers.forEach(c => {
    if (PhoneService.isSame(c.phone_number || c.raw_phone, rawPhone) || PhoneService.isSame(c.phone_number || c.raw_phone, targetPhone)) {
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
      cycle_start_date: DateTimeService.formatDateKey(new Date()),
      cycle_visits: 1,
      total_visits: 1,
      voucher_count: 0,
      notes: notes
    });
  }

  setStored('customers', customers);

  if (typeof fbSaveCustomerNote === 'function') {
    fbSaveCustomerNote(targetPhone, newName, bMonthNum, notes);
  }

  if (typeof callGasApi === 'function') {
    callGasApi('update_customer_notes', {
      phone_number: targetPhone,
      customer_phone: targetPhone,
      customer_name: newName,
      birth_month: bMonthNum,
      birthday: bMonthNum ? bMonthNum : '',
      notes: notes
    });
  }

  closeOwnerCustomerEditorModal();
  alert('👑 Đã cập nhật hồ sơ khách hàng thành công!');
  
  if (typeof loadAdminCustomersList === 'function') {
    loadAdminCustomersList();
  }
  if (typeof loadShopReceiptsList === 'function') {
    loadShopReceiptsList();
  }
}
