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
  const monthContainer = document.getElementById('modal-staff-note-birth-month-container');
  const monthFixed = document.getElementById('modal-staff-note-birth-month-fixed');
  const monthFixedText = document.getElementById('modal-staff-note-birth-month-fixed-text');
  const monthSelect = document.getElementById('modal-staff-note-birth-month');
  const noteContent = document.getElementById('modal-staff-note-content');
  const guestNameInput = document.getElementById('modal-staff-note-guest-name');
  const guestPhoneInput = document.getElementById('modal-staff-note-guest-phone');
  const lookupBadge = document.getElementById('modal-staff-note-lookup-badge');
  const phoneHint = document.getElementById('modal-staff-note-phone-hint');
  const suggestionsBox = document.getElementById('modal-staff-note-suggestions');

  if (suggestionsBox) suggestionsBox.classList.add('hidden');

  // Đọc danh bạ khách hàng hiện tại
  const customers = getStored('customers', DEFAULT_CUSTOMERS);
  const foundCust = customers.find(c => isSamePhone(c.phone_number || c.raw_phone, rawPhone));

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
    document.getElementById('modal-staff-note-phone').innerText = maskPhoneNumber(rawPhone, false);
    
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
      const monthContainer = document.getElementById('modal-staff-note-birth-month-container');
      const monthFixed = document.getElementById('modal-staff-note-birth-month-fixed');
      const monthFixedText = document.getElementById('modal-staff-note-birth-month-fixed-text');
      const monthSelect = document.getElementById('modal-staff-note-birth-month');

      if (bMonth && bMonth >= 1 && bMonth <= 12) {
        if (monthContainer) monthContainer.classList.add('hidden');
        if (monthFixed) monthFixed.classList.remove('hidden');
        if (monthFixedText) monthFixedText.innerText = `Sinh nhật: Tháng ${bMonth}`;
        if (monthSelect) monthSelect.value = String(bMonth);
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
  const monthContainer = document.getElementById('modal-staff-note-birth-month-container');
  const monthFixed = document.getElementById('modal-staff-note-birth-month-fixed');
  const monthFixedText = document.getElementById('modal-staff-note-birth-month-fixed-text');
  const monthSelect = document.getElementById('modal-staff-note-birth-month');

  if (guestPhoneInput) {
    // Lưu số thật vào dataset, hiển thị số che cho Staff
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
    if (monthContainer) monthContainer.classList.add('hidden');
    if (monthFixed) monthFixed.classList.remove('hidden');
    if (monthFixedText) monthFixedText.innerText = `Sinh nhật: Tháng ${birthMonth}`;
    if (monthSelect) monthSelect.value = String(birthMonth);
  } else {
    if (monthContainer) monthContainer.classList.remove('hidden');
    if (monthFixed) monthFixed.classList.add('hidden');
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
  const birthMonth = document.getElementById('modal-staff-note-birth-month')?.value;
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
  if (typeof fbSaveCustomerNote === 'function') {
    fbSaveCustomerNote(targetPhone, targetName, Number(birthMonth) || 0, notes);
  }

  closeStaffCustomerNoteModal();
  alert('✅ Đã cập nhật thông tin khách hàng thành công!');

  // 6. Tải lại danh sách lịch sử tour để phản ánh ngay
  if (typeof loadStaffReceiptsList === 'function') {
    loadStaffReceiptsList(selectedDateFilter);
  }
  if (typeof loadAdminReceiptsList === 'function') {
    loadAdminReceiptsList(selectedAdminHistoryDate);
  }
}
