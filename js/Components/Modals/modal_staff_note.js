// =============================================================
// COMPONENT: MODAL GHI CHÚ & BỔ SUNG THÔNG TIN KHÁCH HÀNG (KTV / STAFF)
// TUÂN THỦ 100% ĐẶC TẢ TẠI: docs/Modals/modal_staff_note.md
// =============================================================

function openStaffCustomerNoteModal(phone, name, receiptId) {
  const modal = document.getElementById('modal-staff-customer-note');
  if (!modal) return;

  const rawPhone = normalizePhone(phone);
  const isGuest = (!rawPhone || rawPhone === '' || name === 'Khách vãng lai' || name === 'Khách hàng');

  document.getElementById('modal-staff-note-raw-phone').value = rawPhone;
  document.getElementById('modal-staff-note-receipt-id').value = receiptId || '';
  document.getElementById('modal-staff-note-is-guest').value = isGuest ? '1' : '0';

  const guestInputs = document.getElementById('modal-staff-note-guest-inputs');
  const monthContainer = document.getElementById('modal-staff-note-birth-month-container');
  const monthFixed = document.getElementById('modal-staff-note-birth-month-fixed');
  const monthFixedText = document.getElementById('modal-staff-note-birth-month-fixed-text');
  const monthSelect = document.getElementById('modal-staff-note-birth-month');
  const noteContent = document.getElementById('modal-staff-note-content');
  const guestNameInput = document.getElementById('modal-staff-note-guest-name');
  const guestPhoneInput = document.getElementById('modal-staff-note-guest-phone');
  const lookupBadge = document.getElementById('modal-staff-note-lookup-badge');
  const phoneHint = document.getElementById('modal-staff-note-phone-hint');

  // Đọc danh bạ khách hàng hiện tại
  const customers = getStored('customers', DEFAULT_CUSTOMERS);
  const foundCust = customers.find(c => matchPhone(c.phone_number || c.raw_phone, rawPhone));

  if (isGuest) {
    // 🟠 KỊCH BẢN 2: KHÁCH VÃNG LAI
    document.getElementById('modal-staff-note-name').innerText = 'Bổ Sung Thông Tin Khách';
    document.getElementById('modal-staff-note-phone').innerText = 'Tour ca chưa có số điện thoại';
    
    if (guestInputs) guestInputs.classList.remove('hidden');
    if (guestNameInput) {
      guestNameInput.value = (name && name !== 'Khách vãng lai') ? name : '';
      guestNameInput.readOnly = false;
      guestNameInput.classList.remove('bg-gray-100', 'text-gray-500');
    }
    if (guestPhoneInput) guestPhoneInput.value = '';
    if (lookupBadge) {
      lookupBadge.innerText = 'Nhập SĐT để dò tìm';
      lookupBadge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-white font-semibold text-[#7E7272] border border-[#F0EAE1]';
    }
    if (phoneHint) phoneHint.classList.add('hidden');

    if (monthContainer) monthContainer.classList.remove('hidden');
    if (monthFixed) monthFixed.classList.add('hidden');
    if (monthSelect) monthSelect.value = '';
    if (noteContent) noteContent.value = '';
  } else {
    // 🟢 KỊCH BẢN 1: KHÁCH QUEN ĐÃ CÓ SĐT
    document.getElementById('modal-staff-note-name').innerText = name || foundCust?.customer_name || 'Khách Hàng';
    document.getElementById('modal-staff-note-phone').innerText = maskPhone(rawPhone);
    
    if (guestInputs) guestInputs.classList.add('hidden');

    let bMonth = foundCust?.birth_month || 0;
    if (!bMonth && foundCust?.birthday) {
      bMonth = parseBirthMonth(foundCust.birthday);
    }

    if (bMonth && bMonth >= 1 && bMonth <= 12) {
      // Đã có sinh nhật -> ẨN DROPDOWN VĨNH VIỄN
      if (monthContainer) monthContainer.classList.add('hidden');
      if (monthFixed) monthFixed.classList.remove('hidden');
      if (monthFixedText) monthFixedText.innerText = `Sinh nhật: Tháng ${bMonth}`;
      if (monthSelect) monthSelect.value = String(bMonth);
    } else {
      // Chưa có sinh nhật -> Hiện dropdown để KTV lưu lần đầu
      if (monthContainer) monthContainer.classList.remove('hidden');
      if (monthFixed) monthFixed.classList.add('hidden');
      if (monthSelect) monthSelect.value = '';
    }

    if (noteContent) {
      noteContent.value = foundCust?.notes || '';
    }
  }

  modal.classList.remove('hidden');
  lucide.createIcons();
}

// 🔍 TỰ ĐỘNG DÒ TÌM SĐT KHÁCH QUEN KHI KTV GÕ VÀO Ô INPUT
function onStaffGuestPhoneInput(val) {
  const clean = normalizePhone(val);
  const lookupBadge = document.getElementById('modal-staff-note-lookup-badge');
  const phoneHint = document.getElementById('modal-staff-note-phone-hint');
  const guestNameInput = document.getElementById('modal-staff-note-guest-name');
  const monthContainer = document.getElementById('modal-staff-note-birth-month-container');
  const monthFixed = document.getElementById('modal-staff-note-birth-month-fixed');
  const monthFixedText = document.getElementById('modal-staff-note-birth-month-fixed-text');
  const monthSelect = document.getElementById('modal-staff-note-birth-month');

  if (!clean || clean.length < 9) {
    if (lookupBadge) {
      lookupBadge.innerText = 'Cần nhập đủ 10 số';
      lookupBadge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-white font-semibold text-[#7E7272] border border-[#F0EAE1]';
    }
    if (phoneHint) phoneHint.classList.add('hidden');
    if (guestNameInput) {
      guestNameInput.readOnly = false;
      guestNameInput.classList.remove('bg-gray-100', 'text-gray-500');
    }
    return;
  }

  const customers = getStored('customers', DEFAULT_CUSTOMERS);
  const foundCust = customers.find(c => matchPhone(c.phone_number || c.raw_phone, clean));

  if (foundCust) {
    // 🟢 TRƯỜNG HỢP 2A: TRÙNG SĐT KHÁCH CŨ
    if (lookupBadge) {
      lookupBadge.innerText = `✓ Khách quen: ${foundCust.customer_name}`;
      lookupBadge.className = 'text-[10px] px-2.5 py-0.5 rounded-full bg-[#E8F8F5] text-[#2E7D6D] font-extrabold border border-[#B7EBDD]';
    }
    if (phoneHint) {
      phoneHint.innerText = `Đã tìm thấy khách quen: ${foundCust.customer_name} (Đã ghé ${foundCust.total_visits || foundCust.cycle_visits || 1} lần)`;
      phoneHint.className = 'text-[11px] text-[#2E7D6D] font-semibold mt-1 block';
    }
    if (guestNameInput) {
      guestNameInput.value = foundCust.customer_name || '';
      guestNameInput.readOnly = true;
      guestNameInput.classList.add('bg-gray-100', 'text-gray-500');
    }

    let bMonth = foundCust.birth_month || parseBirthMonth(foundCust.birthday);
    if (bMonth && bMonth >= 1 && bMonth <= 12) {
      if (monthContainer) monthContainer.classList.add('hidden');
      if (monthFixed) monthFixed.classList.remove('hidden');
      if (monthFixedText) monthFixedText.innerText = `Sinh nhật: Tháng ${bMonth}`;
      if (monthSelect) monthSelect.value = String(bMonth);
    }
  } else {
    // 🟠 TRƯỜNG HỢP 2B: SĐT MỚI TINH
    if (lookupBadge) {
      lookupBadge.innerText = '+ Khách mới';
      lookupBadge.className = 'text-[10px] px-2.5 py-0.5 rounded-full bg-[#FFF0EB] text-[#E58A7B] font-extrabold border border-[#FCDFD7]';
    }
    if (phoneHint) {
      phoneHint.innerText = 'Số điện thoại mới chưa có trong hệ thống.';
      phoneHint.className = 'text-[11px] text-[#E58A7B] font-medium mt-1 block';
    }
    if (guestNameInput) {
      guestNameInput.readOnly = false;
      guestNameInput.classList.remove('bg-gray-100', 'text-gray-500');
    }
  }
}

function closeStaffCustomerNoteModal() {
  const modal = document.getElementById('modal-staff-customer-note');
  if (modal) modal.classList.add('hidden');
}

function handleSaveStaffCustomerNote(e) {
  e.preventDefault();
  const rawPhone = document.getElementById('modal-staff-note-raw-phone').value;
  const receiptId = document.getElementById('modal-staff-note-receipt-id').value;
  const isGuest = document.getElementById('modal-staff-note-is-guest').value === '1';

  const guestName = document.getElementById('modal-staff-note-guest-name')?.value?.trim();
  const guestPhoneInput = document.getElementById('modal-staff-note-guest-phone')?.value?.trim();
  const birthMonth = document.getElementById('modal-staff-note-birth-month').value;
  const notes = document.getElementById('modal-staff-note-content').value.trim();

  let targetPhone = rawPhone;
  let targetName = document.getElementById('modal-staff-note-name').innerText;

  if (isGuest) {
    if (!guestPhoneInput) {
      showNotification('Vui lòng nhập số điện thoại của khách hàng!', 'error');
      return;
    }
    targetPhone = normalizePhone(guestPhoneInput);
    if (targetPhone.length < 9) {
      showNotification('Số điện thoại không hợp lệ (cần đủ 10 số)!', 'error');
      return;
    }

    const customers = getStored('customers', DEFAULT_CUSTOMERS);
    const existingCust = customers.find(c => matchPhone(c.phone_number || c.raw_phone, targetPhone));

    if (existingCust) {
      // 🟢 TRƯỜNG HỢP 2A: KHÁCH CŨ
      targetName = existingCust.customer_name || guestName || 'Khách hàng';
    } else {
      // 🟠 TRƯỜNG HỢP 2B: KHÁCH MỚI -> XÁC NHẬN TẠO MỚI
      targetName = guestName || 'Khách hàng';
      const confirmCreate = confirm(`Số điện thoại ${targetPhone} là khách mới.\nBạn có chắc chắn muốn tạo hồ sơ khách hàng cho [${targetName}] không?`);
      if (!confirmCreate) return;
    }
  }

  // 1. Cập nhật vào danh bạ tb_customers trên LocalStorage
  const customers = getStored('customers', DEFAULT_CUSTOMERS);
  let foundIndex = customers.findIndex(c => matchPhone(c.phone_number || c.raw_phone, targetPhone));

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

  // 2. Cập nhật hóa đơn trong tb_receipts nếu là ca vãng lai được bổ sung SĐT
  if (isGuest && receiptId) {
    const receipts = getStored('receipts', []);
    const rIdx = receipts.findIndex(r => r.receipt_id === receiptId);
    if (rIdx >= 0) {
      receipts[rIdx].customer_phone = targetPhone;
      receipts[rIdx].customer_name = targetName;
      receipts[rIdx].raw_phone = targetPhone;
      setStored('receipts', receipts);
    }
  }

  // 3. Lấy thông tin KTV đang đăng nhập để làm nhật ký đối soát
  const activeUser = getStored('active_user', null);
  const staffName = activeUser?.full_name || 'KTV';
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
    action_type: isGuest ? 'ASSIGN_GUEST_CUSTOMER' : 'UPDATE_NOTES'
  });

  // 5. Cập nhật Firebase Realtime
  if (typeof syncCustomerToFirebase === 'function') {
    syncCustomerToFirebase(targetPhone, {
      customer_name: targetName,
      birth_month: birthMonth || '',
      notes: notes
    });
  }

  showNotification('Đã cập nhật thông tin khách hàng thành công!', 'success');
  closeStaffCustomerNoteModal();

  // 6. Tải lại danh sách lịch sử tour để phản ánh ngay
  if (typeof loadStaffReceiptsList === 'function') {
    loadStaffReceiptsList(selectedDateFilter);
  }
  if (typeof loadAdminReceiptsList === 'function') {
    loadAdminReceiptsList(selectedAdminHistoryDate);
  }
}
