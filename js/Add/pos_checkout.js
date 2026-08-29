function getMergedUsers() {
  let stored = getMergedUsers();
  // Đảm bảo các KTV mẫu luôn có mặt để test
  DEFAULT_USERS.forEach(defU => {
    if (!stored.some(u => normalizePhone(u.phone) === normalizePhone(defU.phone))) {
      stored.push(defU);
    }
  });
  return stored;
}
// =============================================================
// TAB 2: ADD - POS CHECKOUT, DYNAMIC STAFF LIST & 2-PHASE CHECKOUT
// =============================================================
let extraStaffList = []; // Mảng chứa danh sách KTV phụ được add thêm [{ phone, id, name, user_id }]
let staffTipMap = {};    // Map chứa tiền tips theo từng KTV: { [phone]: amount }
let checkoutPaymentMethod = 'Chuyển khoản';
let liveTimerInterval = null;
let currentLiveSession = null;
let currentSplitMode = 'timer';

function initMenuUI() {
  const menu = getStored('menu', DEFAULT_MENU);
  const select = document.getElementById('pos-service-select');
  const quickContainer = document.getElementById('pos-quick-combos');
  if (!select) return;

  select.innerHTML = menu.map(m => `
    <option value="${m.service_id}">${m.service_name} — ${m.price.toLocaleString('vi-VN')} đ (${m.duration_min}p)</option>
  `).join('');

  const pastelBgs = [
    'bg-[#FFF0EB] text-[#D35400] border-[#FCDFD7]',
    'bg-[#E8F8F5] text-[#2E7D6D] border-[#B7EBDD]',
    'bg-[#EBF5FB] text-[#2980B9] border-[#D4E6F1]',
    'bg-[#F5EEF8] text-[#8E44AD] border-[#E8DAEF]'
  ];

  if (quickContainer) {
    quickContainer.innerHTML = menu.slice(0, 4).map((m, idx) => `
      <button type="button" onclick="selectQuickCombo('${m.service_id}')" class="px-3.5 py-2 rounded-2xl text-xs font-bold ${pastelBgs[idx % pastelBgs.length]} border transition cursor-pointer shadow-sm hover:scale-105">
        ${m.service_name.split('(')[0].trim()} (${Math.round(m.price/1000)}k)
      </button>
    `).join('');
  }

  restoreLiveSessionIfExists();
}

function selectQuickCombo(id) {
  const select = document.getElementById('pos-service-select');
  if (select) {
    select.value = id;
    onSelectServiceChange();
  }
}

function onSelectServiceChange() {
  const select = document.getElementById('pos-service-select');
  if (select) {
    selectedComboId = select.value;
    updatePOSCalculations();
  }
}

function onStaff1SelectChange() {
  renderExtraStaffUI();
  updatePOSCalculations();
}

function updatePOSStaffInfo() {
  const users = getMergedUsers();
  const s1Select = document.getElementById('pos-staff1-select');
  const isOwner = currentUser && isUserOwner(currentUser);

  if (s1Select) {
    s1Select.innerHTML = users.map(u => `
      <option value="${u.phone}">${isUserOwner(u) ? '👑' : '💆'} ${u.full_name} (${u.staff_id || u.phone})</option>
    `).join('');

    if (isOwner) {
      s1Select.disabled = false;
      document.getElementById('pos-staff1-role-hint')?.classList.add('hidden');
      document.getElementById('pos-staff1-lock-icon')?.classList.add('hidden');
      if (currentUser) s1Select.value = currentUser.phone;
    } else {
      s1Select.disabled = true;
      document.getElementById('pos-staff1-role-hint')?.classList.remove('hidden');
      document.getElementById('pos-staff1-lock-icon')?.classList.remove('hidden');
      if (currentUser) s1Select.value = currentUser.phone;
    }
  }

  renderExtraStaffUI();
  updatePOSCalculations();
  restoreLiveSessionIfExists();
}

// =============================================================
// QUẢN LÝ DANH SÁCH KTV ĐỘNG (THÊM / XÓA BẰNG DẤU TRỪ ĐỎ ⊖)
// =============================================================

function addExtraStaff() {
  const users = getMergedUsers();
  const staffList = users.filter(u => !isUserOwner(u));
  const s1Phone = document.getElementById('pos-staff1-select')?.value || currentUser?.phone;

  // Lọc ra những KTV chưa có trong ca
  const usedPhones = [normalizePhone(s1Phone), ...extraStaffList.map(s => normalizePhone(s.phone))];
  const available = staffList.filter(u => !usedPhones.includes(normalizePhone(u.phone)));

  if (available.length === 0) {
    alert('Đã thêm toàn bộ kỹ thuật viên hiện có trong tiệm!');
    return;
  }

  const nextStaff = available[0];
  extraStaffList.push({
    phone: nextStaff.phone,
    staff_id: nextStaff.staff_id || 'KTV',
    full_name: nextStaff.full_name,
    user_id: nextStaff.user_id || nextStaff.phone
  });

  renderExtraStaffUI();
  updatePOSCalculations();
}

function removeExtraStaff(index) {
  const container = document.getElementById(`extra-staff-card-${index}`);
  if (container) {
    container.classList.add('scale-95', 'opacity-0', 'transition-all', 'duration-200');
    setTimeout(() => {
      extraStaffList.splice(index, 1);
      renderExtraStaffUI();
      updatePOSCalculations();
    }, 200);
  } else {
    extraStaffList.splice(index, 1);
    renderExtraStaffUI();
    updatePOSCalculations();
  }
}

function onExtraStaffSelectChange(index, newPhone) {
  const users = getMergedUsers();
  const staff = users.find(u => normalizePhone(u.phone) === normalizePhone(newPhone));
  if (staff) {
    extraStaffList[index] = {
      phone: staff.phone,
      staff_id: staff.staff_id || 'KTV',
      full_name: staff.full_name,
      user_id: staff.user_id || staff.phone
    };
  }
  renderExtraStaffUI();
  updatePOSCalculations();
}

function renderExtraStaffUI() {
  const container = document.getElementById('pos-extra-staff-container');
  const addBtn = document.getElementById('btn-add-staff-card');
  if (!container) return;

  const users = getMergedUsers();
  const staffList = users.filter(u => !isUserOwner(u));
  const s1Phone = document.getElementById('pos-staff1-select')?.value || currentUser?.phone;

  container.innerHTML = extraStaffList.map((item, idx) => {
    const ktvNum = idx + 2;
    // Lọc danh sách dropdown: KTV 1 + các KTV khác ngoại trừ chính card này
    const otherUsedPhones = [normalizePhone(s1Phone), ...extraStaffList.filter((_, i) => i !== idx).map(s => normalizePhone(s.phone))];
    const selectable = staffList.filter(u => !otherUsedPhones.includes(normalizePhone(u.phone)));

    return `
      <div id="extra-staff-card-${idx}" class="relative p-3.5 rounded-2xl bg-[#FFF5F2] border border-[#FCDFD7] space-y-2 shadow-sm transition-all">
        <!-- 🔴 NÚT DẤU TRỪ ĐỎ ⊖ Ở GÓC TRÊN BÊN PHẢI -->
        <button type="button" onclick="removeExtraStaff(${idx})" title="Xóa KTV này" class="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-white border-2 border-rose-400 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center shadow-md active:scale-75 transition-all cursor-pointer z-10">
          <i data-lucide="minus" class="w-4 h-4 stroke-[3]"></i>
        </button>

        <div class="flex justify-between items-center pr-5">
          <span class="text-xs font-bold text-[#E58A7B] flex items-center gap-1">
            <i data-lucide="user-check" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
            <span class="font-extrabold">KTV ${ktvNum} (Cùng làm / Phụ):</span>
          </span>
          <span id="pos-staff${ktvNum}-comm-preview" class="text-xs font-extrabold text-[#2E7D6D] bg-[#E8F8F5] px-2.5 py-0.5 rounded-full">+3.200 đ</span>
        </div>

        <select onchange="onExtraStaffSelectChange(${idx}, this.value)" class="w-full bg-white border border-[#FCDFD7] rounded-xl p-3 text-[#2D2424] font-bold text-sm focus:outline-none focus:border-[#E58A7B] cursor-pointer">
          ${selectable.map(u => `
            <option value="${u.phone}" ${normalizePhone(u.phone) === normalizePhone(item.phone) ? 'selected' : ''}>💆 ${u.full_name} (${u.staff_id || u.phone})</option>
          `).join('')}
        </select>
      </div>
    `;
  }).join('');

  // Ẩn nút thêm nếu đã add hết toàn bộ KTV trong tiệm
  const totalUsed = 1 + extraStaffList.length;
  if (addBtn) {
    if (totalUsed >= staffList.length + (isUserOwner(currentUser) ? 1 : 0) || staffList.length <= 1) {
      addBtn.classList.add('hidden');
    } else {
      addBtn.classList.remove('hidden');
    }
  }

  lucide.createIcons();
}

function updatePOSCalculations() {
  const menu = getStored('menu', DEFAULT_MENU);
  const users = getMergedUsers();
  const service = menu.find(m => m.service_id === selectedComboId) || menu[0];

  const s1Phone = document.getElementById('pos-staff1-select')?.value || currentUser?.phone;
  const staff1 = users.find(u => normalizePhone(u.phone) === normalizePhone(s1Phone)) || currentUser;
  const rate1 = parsePercentage(staff1?.commission_rate) || 10;

  const totalStaffCount = 1 + extraStaffList.length;
  const baseTourComm = Math.round(service.price * (rate1 / 100));
  const splitTourComm = Math.round(baseTourComm / totalStaffCount);

  const p1El = document.getElementById('pos-staff1-comm-preview');
  if (p1El) p1El.innerText = `+${splitTourComm.toLocaleString('vi-VN')} đ`;

  extraStaffList.forEach((_, idx) => {
    const ktvNum = idx + 2;
    const pEl = document.getElementById(`pos-staff${ktvNum}-comm-preview`);
    if (pEl) pEl.innerText = `+${splitTourComm.toLocaleString('vi-VN')} đ`;
  });
}

function onCustomerPhoneInput(val) {
  const rawInput = val.trim();
  const normInput = normalizePhone(rawInput);
  const card = document.getElementById('pos-customer-card');
  const customers = getStored('customers', DEFAULT_CUSTOMERS);

  if (rawInput.length >= 7) {
    const cust = customers.find(c => {
      const cNorm = normalizePhone(c.phone_number);
      return cNorm === normInput || 
             cNorm.endsWith(normInput) || 
             normInput.endsWith(cNorm) || 
             String(c.phone_number).includes(rawInput);
    });

    if (cust) {
      currentCustomer = cust;
      card.classList.remove('hidden');
      document.getElementById('pos-customer-name').value = cust.customer_name;
      document.getElementById('pos-cust-name-badge').innerText = cust.customer_name;
      document.getElementById('pos-cust-phone-badge').innerText = '(' + normalizePhone(cust.phone_number) + ')';
      document.getElementById('pos-cust-visits-badge').innerText = (cust.total_visits || 0) + ' / 10 Lần gội';
      document.getElementById('pos-cust-progress-bar').style.width = Math.min(100, ((cust.total_visits || 0) / 10) * 100) + '%';
      
      let noteText = cust.notes || '';
      if (noteText.includes('GMT') || noteText.includes('00:00:00')) noteText = '';
      if (noteText) {
        document.getElementById('pos-cust-notes-box').classList.remove('hidden');
        document.getElementById('pos-cust-notes-text').innerText = noteText;
      } else {
        document.getElementById('pos-cust-notes-box').classList.add('hidden');
      }

      if (cust.voucher_count > 0) {
        document.getElementById('pos-voucher-banner').classList.remove('hidden');
        document.getElementById('pos-voucher-text').innerText = 'Khách có ' + cust.voucher_count + ' Voucher Combo 1 miễn phí!';
      } else {
        document.getElementById('pos-voucher-banner').classList.add('hidden');
      }
    } else {
      currentCustomer = null;
      card.classList.add('hidden');
    }
  } else {
    currentCustomer = null;
    card.classList.add('hidden');
  }
}

function onVoucherToggle(checked) {
  useVoucher = checked;
  updatePOSCalculations();
}

// =============================================================
// BƯỚC 1 -> BƯỚC 2: KHỞI ĐỘNG CA & ĐẾM GIỜ
// =============================================================

function startLiveSession() {
  const menu = getStored('menu', DEFAULT_MENU);
  const users = getMergedUsers();
  const service = menu.find(m => m.service_id === selectedComboId) || menu[0];

  const phone = document.getElementById('pos-customer-phone')?.value.trim() || '';
  const name = document.getElementById('pos-customer-name')?.value.trim() || 'Khách vãng lai';

  const s1Phone = document.getElementById('pos-staff1-select')?.value || currentUser?.phone;
  const staff1 = users.find(u => normalizePhone(u.phone) === normalizePhone(s1Phone)) || currentUser;

  const now = new Date();
  const startTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const startDateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

  const allStaffs = [
    {
      user_id: staff1?.user_id || staff1?.phone || '',
      phone: staff1?.phone || '',
      staff_id: staff1?.staff_id || 'KTV01',
      name: staff1?.full_name || 'KTV 1',
      pct: Math.round(100 / (1 + extraStaffList.length))
    },
    ...extraStaffList.map((s, idx) => ({
      user_id: s.user_id || s.phone,
      phone: s.phone,
      staff_id: s.staff_id || `KTV0${idx+2}`,
      name: s.full_name,
      pct: Math.round(100 / (1 + extraStaffList.length))
    }))
  ];

  currentLiveSession = {
    session_id: 'SS' + Date.now(),
    service_id: service.service_id,
    service_name: service.service_name,
    price: service.price,
    duration_target_min: service.duration_min || 45,
    start_timestamp: Date.now(),
    start_time: startTimeStr,
    date: startDateStr,
    customer_phone: phone,
    customer_name: name,
    staffs: allStaffs,
    staff_1_user_id: allStaffs[0].user_id,
    staff_1_phone: allStaffs[0].phone,
    staff_1_id: allStaffs[0].staff_id,
    staff_1_name: allStaffs[0].name,
    has_staff_2: allStaffs.length > 1,
    staff_2_user_id: allStaffs[1]?.user_id || '-',
    staff_2_phone: allStaffs[1]?.phone || '-',
    staff_2_id: allStaffs[1]?.staff_id || '-',
    staff_2_name: allStaffs[1]?.name || '-',
    staff_1_pct: allStaffs[0].pct,
    staff_2_pct: allStaffs[1]?.pct || 0,
    use_voucher: useVoucher
  };

  localStorage.setItem('selena_active_live_session', JSON.stringify(currentLiveSession));
  renderLiveSessionUI();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderLiveSessionUI() {
  const liveCard = document.getElementById('live-session-card');
  const formBox = document.getElementById('pos-form-box');

  if (!currentLiveSession) {
    if (liveCard) liveCard.classList.add('hidden');
    if (formBox) formBox.classList.remove('hidden');
    clearInterval(liveTimerInterval);
    return;
  }

  if (liveCard) liveCard.classList.remove('hidden');
  if (formBox) formBox.classList.add('hidden');

  const staffNames = (currentLiveSession.staffs || [{ name: currentLiveSession.staff_1_name }]).map(s => s.name).join(' & ');

  document.getElementById('live-service-name').innerText = currentLiveSession.service_name;
  document.getElementById('live-customer-badge').innerText = '👤 ' + (currentLiveSession.customer_name || 'Khách vãng lai');
  document.getElementById('live-staff-badge').innerText = '💆 ' + staffNames;
  document.getElementById('live-start-time-text').innerText = currentLiveSession.start_time;
  document.getElementById('live-target-time-text').innerText = currentLiveSession.duration_target_min + ' phút';

  const splitText = document.getElementById('live-split-ratio-text');
  if (splitText) {
    if (currentLiveSession.has_staff_2) {
      splitText.innerText = `🤝 ${(currentLiveSession.staffs || []).length} KTV: ${staffNames}`;
    } else {
      splitText.innerText = '💆 1 KTV phụ trách trọn ca (100%)';
    }
  }

  clearInterval(liveTimerInterval);
  updateLiveTimerTick();
  liveTimerInterval = setInterval(updateLiveTimerTick, 1000);
  lucide.createIcons();
}

function updateLiveTimerTick() {
  if (!currentLiveSession) return;
  const elapsedSec = Math.max(0, Math.floor((Date.now() - currentLiveSession.start_timestamp) / 1000));
  const elapsedMin = Math.floor(elapsedSec / 60);
  const remSec = elapsedSec % 60;

  const timerEl = document.getElementById('live-timer-display');
  const barEl = document.getElementById('live-progress-bar');
  const hintEl = document.getElementById('live-status-hint');

  if (timerEl) {
    timerEl.innerText = `${elapsedMin.toString().padStart(2, '0')}:${remSec.toString().padStart(2, '0')}`;
  }

  const targetMin = currentLiveSession.duration_target_min || 45;
  const pct = Math.min(100, Math.round((elapsedMin / targetMin) * 100));
  if (barEl) barEl.style.width = pct + '%';

  if (hintEl) {
    if (elapsedMin >= targetMin) {
      hintEl.innerText = '🔔 Đã đạt đủ thời gian liệu trình (' + targetMin + ' phút). Bấm nút bên dưới để thanh toán!';
      hintEl.className = 'text-xs text-[#E58A7B] font-extrabold animate-bounce';
    } else {
      hintEl.innerText = `⏱️ Còn khoảng ${targetMin - elapsedMin} phút theo liệu trình`;
      hintEl.className = 'text-xs text-[#2E7D6D] font-medium';
    }
  }
}

function cancelLiveSession() {
  if (confirm('Bạn có chắc muốn hủy ca đang phục vụ này không?')) {
    localStorage.removeItem('selena_active_live_session');
    currentLiveSession = null;
    clearInterval(liveTimerInterval);
    renderLiveSessionUI();
  }
}

function restoreLiveSessionIfExists() {
  const saved = localStorage.getItem('selena_active_live_session');
  if (saved) {
    try {
      currentLiveSession = JSON.parse(saved);
      renderLiveSessionUI();
    } catch(e) {
      localStorage.removeItem('selena_active_live_session');
    }
  }
}

// =============================================================
// LOGIC ĐỔI / THÊM KTV GIỮA CA & CHIA HOA HỒNG THEO THỜI GIAN
// =============================================================

function openSwapStaffModal() {
  if (!currentLiveSession) return;
  const users = getMergedUsers();
  const staffList = users.filter(u => !isUserOwner(u));
  const s2Select = document.getElementById('swap-staff2-select');

  if (s2Select) {
    s2Select.innerHTML = staffList.map(u => `
      <option value="${u.phone}">💆 ${u.full_name} (${u.staff_id || u.phone})</option>
    `).join('');
    if (currentLiveSession.staff_2_phone && currentLiveSession.staff_2_phone !== '-') {
      s2Select.value = currentLiveSession.staff_2_phone;
    } else {
      const other = staffList.find(u => normalizePhone(u.phone) !== normalizePhone(currentLiveSession.staff_1_phone));
      if (other) s2Select.value = other.phone;
    }
  }

  updateSwapPreviewDisplay();
  const modal = document.getElementById('modal-swap-staff');
  if (modal) modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeSwapStaffModal() {
  const modal = document.getElementById('modal-swap-staff');
  if (modal) modal.classList.add('hidden');
}

function setSplitMode(mode) {
  currentSplitMode = mode;
  const btnTimer = document.getElementById('btn-split-timer');
  const btnHalf = document.getElementById('btn-split-half');

  if (mode === 'timer') {
    btnTimer.className = 'p-2.5 rounded-xl border bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B] font-bold text-xs flex flex-col items-center gap-1 cursor-pointer';
    btnHalf.className = 'p-2.5 rounded-xl border bg-[#F7F2EC] border-[#EFE8DF] text-[#7E7272] font-bold text-xs flex flex-col items-center gap-1 cursor-pointer';
  } else {
    btnHalf.className = 'p-2.5 rounded-xl border bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B] font-bold text-xs flex flex-col items-center gap-1 cursor-pointer';
    btnTimer.className = 'p-2.5 rounded-xl border bg-[#F7F2EC] border-[#EFE8DF] text-[#7E7272] font-bold text-xs flex flex-col items-center gap-1 cursor-pointer';
  }
  updateSwapPreviewDisplay();
}

function updateSwapPreviewDisplay() {
  if (!currentLiveSession) return;
  const targetMin = currentLiveSession.duration_target_min || 45;
  const elapsedSec = Math.max(1, Math.floor((Date.now() - currentLiveSession.start_timestamp) / 1000));
  const elapsedMin = Math.floor(elapsedSec / 60);

  let s1Pct = 50;
  let s2Pct = 50;

  if (currentSplitMode === 'timer') {
    let p1 = Math.min(90, Math.max(10, Math.round((elapsedMin / targetMin) * 100)));
    s1Pct = p1;
    s2Pct = 100 - p1;
  }

  document.getElementById('split-timer-pct').innerText = `${s1Pct}% - ${s2Pct}% (${elapsedMin}p đã làm)`;
  document.getElementById('swap-preview-s1-name').innerText = currentLiveSession.staff_1_name + ':';
  document.getElementById('swap-preview-s1-pct').innerText = `${s1Pct}% (${Math.round(currentLiveSession.price * 0.1 * s1Pct / 100).toLocaleString('vi-VN')} đ)`;
  
  const users = getMergedUsers();
  const s2Phone = document.getElementById('swap-staff2-select')?.value;
  const s2 = users.find(u => normalizePhone(u.phone) === normalizePhone(s2Phone));
  const s2Rate = (s2 && parsePercentage(s2?.commission_rate) > 0) ? parsePercentage(s2?.commission_rate) : 10;

  document.getElementById('swap-preview-s2-name').innerText = (s2?.full_name || 'KTV 2') + ':';
  document.getElementById('swap-preview-s2-pct').innerText = `${s2Pct}% (${Math.round(currentLiveSession.price * (s2Rate / 100) * s2Pct / 100).toLocaleString('vi-VN')} đ)`;
}

function saveSwapStaffSetting() {
  if (!currentLiveSession) return;
  const users = getMergedUsers();
  const s2Phone = document.getElementById('swap-staff2-select')?.value;
  const s2 = users.find(u => normalizePhone(u.phone) === normalizePhone(s2Phone));

  const targetMin = currentLiveSession.duration_target_min || 45;
  const elapsedSec = Math.max(1, Math.floor((Date.now() - currentLiveSession.start_timestamp) / 1000));
  const elapsedMin = Math.floor(elapsedSec / 60);

  let s1Pct = 50;
  let s2Pct = 50;

  if (currentSplitMode === 'timer') {
    let p1 = Math.min(90, Math.max(10, Math.round((elapsedMin / targetMin) * 100)));
    s1Pct = p1;
    s2Pct = 100 - p1;
  }

  currentLiveSession.has_staff_2 = true;
  currentLiveSession.staff_2_user_id = s2?.user_id || s2?.phone || '-';
  currentLiveSession.staff_2_phone = s2?.phone || '-';
  currentLiveSession.staff_2_id = s2?.staff_id || '-';
  currentLiveSession.staff_2_name = s2?.full_name || 'KTV 2';
  currentLiveSession.staff_1_pct = s1Pct;
  currentLiveSession.staff_2_pct = s2Pct;

  currentLiveSession.staffs = [
    { phone: currentLiveSession.staff_1_phone, name: currentLiveSession.staff_1_name, pct: s1Pct, user_id: currentLiveSession.staff_1_user_id, staff_id: currentLiveSession.staff_1_id },
    { phone: currentLiveSession.staff_2_phone, name: currentLiveSession.staff_2_name, pct: s2Pct, user_id: currentLiveSession.staff_2_user_id, staff_id: currentLiveSession.staff_2_id }
  ];

  localStorage.setItem('selena_active_live_session', JSON.stringify(currentLiveSession));
  closeSwapStaffModal();
  renderLiveSessionUI();
}

function removeSecondStaffFromLive() {
  if (!currentLiveSession) return;
  currentLiveSession.has_staff_2 = false;
  currentLiveSession.staff_2_user_id = '-';
  currentLiveSession.staff_2_phone = '-';
  currentLiveSession.staff_2_id = '-';
  currentLiveSession.staff_2_name = '-';
  currentLiveSession.staff_1_pct = 100;
  currentLiveSession.staff_2_pct = 0;
  currentLiveSession.staffs = [
    { phone: currentLiveSession.staff_1_phone, name: currentLiveSession.staff_1_name, pct: 100, user_id: currentLiveSession.staff_1_user_id, staff_id: currentLiveSession.staff_1_id }
  ];

  localStorage.setItem('selena_active_live_session', JSON.stringify(currentLiveSession));
  closeSwapStaffModal();
  renderLiveSessionUI();
}

// =============================================================
// BƯỚC 3: MỞ MODAL THANH TOÁN (PHA 1: KHÁCH XEM)
// =============================================================

function openCheckoutModal() {
  if (!currentLiveSession) return;

  const now = new Date();
  const endTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  const elapsedSec = Math.max(1, Math.floor((Date.now() - (currentLiveSession.start_timestamp || Date.now())) / 1000));
  const elapsedMinutes = Math.round((elapsedSec / 60) * 10) / 10;
  
  currentLiveSession.end_time = endTimeStr;
  currentLiveSession.duration_actual_min = elapsedMinutes > 0 ? elapsedMinutes : 0.1;

  document.getElementById('chk-service-name').innerText = currentLiveSession.service_name;
  document.getElementById('chk-service-price').innerText = currentLiveSession.use_voucher ? '0 đ (Voucher)' : currentLiveSession.price.toLocaleString('vi-VN') + ' đ';
  document.getElementById('chk-time-range').innerText = `${currentLiveSession.start_time} - ${endTimeStr} (${currentLiveSession.duration_actual_min} phút)`;
  document.getElementById('chk-customer-name').innerText = currentLiveSession.customer_name || 'Khách vãng lai';

  document.getElementById('checkout-step-customer')?.classList.remove('hidden');
  document.getElementById('checkout-step-staff')?.classList.add('hidden');

  staffTipMap = {};
  setCheckoutPayment('Chuyển khoản');

  const modal = document.getElementById('modal-checkout');
  if (modal) modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeCheckoutModal() {
  const modal = document.getElementById('modal-checkout');
  if (modal) modal.classList.add('hidden');
}

function setCheckoutPayment(method) {
  checkoutPaymentMethod = method;
  const btnQR = document.getElementById('chk-btn-qr');
  const btnCash = document.getElementById('chk-btn-cash');
  const qrBox = document.getElementById('chk-qr-display-box');

  if (method === 'Chuyển khoản') {
    btnQR.className = 'p-3.5 rounded-2xl border bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B] font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer';
    btnCash.className = 'p-3.5 rounded-2xl border bg-[#F7F2EC] border-[#EFE8DF] text-[#7E7272] hover:bg-[#FFF0EB] font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer';
    if (qrBox) qrBox.classList.remove('hidden');
  } else {
    btnCash.className = 'p-3.5 rounded-2xl border bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B] font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer';
    btnQR.className = 'p-3.5 rounded-2xl border bg-[#F7F2EC] border-[#EFE8DF] text-[#7E7272] hover:bg-[#FFF0EB] font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer';
    if (qrBox) qrBox.classList.add('hidden');
  }
  lucide.createIcons();
}

// =============================================================
// CHUYỂN SANG PHA 2: KTV GHI NHẬN TIPS RIÊNG BIỆT KÍN ĐÁO
// =============================================================

function goToStaffTipStep() {
  document.getElementById('checkout-step-customer')?.classList.add('hidden');
  document.getElementById('checkout-step-staff')?.classList.remove('hidden');

  document.getElementById('staff-step-service-price').innerText = currentLiveSession?.use_voucher ? '0 đ (Voucher)' : (currentLiveSession?.price?.toLocaleString('vi-VN') + ' đ');
  document.getElementById('staff-step-pay-method').innerText = checkoutPaymentMethod;

  staffTipMap = {};
  const activeStaffs = currentLiveSession.staffs || [
    { phone: currentLiveSession.staff_1_phone, name: currentLiveSession.staff_1_name, pct: 100 }
  ];

  activeStaffs.forEach(s => {
    staffTipMap[s.phone] = 0;
  });

  renderDynamicTipInputs(activeStaffs);
  updateStaffEarningPreview();
  lucide.createIcons();
}

function renderDynamicTipInputs(staffs) {
  const container = document.getElementById('checkout-dynamic-tips-container');
  if (!container) return;

  const isMulti = staffs.length > 1;

  container.innerHTML = staffs.map((s, idx) => {
    const isFirst = idx === 0;
    const boxBg = isFirst ? 'bg-[#FFF5F2] border-[#FCDFD7]' : 'bg-[#E8F8F5]/80 border-[#B7EBDD]';
    const labelColor = isFirst ? 'text-[#E58A7B]' : 'text-[#2E7D6D]';
    const focusColor = isFirst ? 'focus:border-[#E58A7B]' : 'focus:border-[#2E7D6D]';
    const title = isMulti ? `Tips cho KTV ${idx + 1} (${s.name}):` : `Khách có boa thêm tiền Tips không?`;

    return `
      <div class="space-y-2 p-3.5 rounded-2xl ${boxBg} border">
        <div class="flex justify-between items-center">
          <label class="text-xs sm:text-sm font-bold text-[#2D2424] flex items-center gap-1.5">
            <i data-lucide="${isFirst ? 'heart' : 'gift'}" class="w-4 h-4 ${labelColor}"></i>
            <span>${title}</span>
          </label>
          <span class="text-[11px] text-[#2E7D6D] font-bold">100% KTV</span>
        </div>

        <div class="relative">
          <input type="text" inputmode="numeric" id="chk-tip-input-${s.phone}" oninput="onDynamicStaffTipInput('${s.phone}', this)" placeholder="0" class="w-full bg-white border border-[#EFE8DF] rounded-xl p-3 pr-10 text-base font-extrabold text-[#2D2424] focus:outline-none ${focusColor} font-mono text-left">
          <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#7E7272]">đ</span>
        </div>

        <!-- Quick Tip Buttons (+5k, +10k, +20k, +30k, +50k, +100k, 0đ) -->
        <div class="flex flex-wrap gap-1.5 pt-0.5">
          <button type="button" onclick="setDynamicQuickTip('${s.phone}', 0)" class="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-[#7E7272] border border-[#EFE8DF] transition cursor-pointer shadow-sm">0 đ</button>
          <button type="button" onclick="setDynamicQuickTip('${s.phone}', 5000)" class="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-[#FFF0EB] text-[#2D2424] hover:text-[#E58A7B] border border-[#EFE8DF] transition cursor-pointer shadow-sm">+5k</button>
          <button type="button" onclick="setDynamicQuickTip('${s.phone}', 10000)" class="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-[#FFF0EB] text-[#2D2424] hover:text-[#E58A7B] border border-[#EFE8DF] transition cursor-pointer shadow-sm">+10k</button>
          <button type="button" onclick="setDynamicQuickTip('${s.phone}', 20000)" class="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-[#FFF0EB] text-[#2D2424] hover:text-[#E58A7B] border border-[#EFE8DF] transition cursor-pointer shadow-sm">+20k</button>
          <button type="button" onclick="setDynamicQuickTip('${s.phone}', 30000)" class="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-[#FFF0EB] text-[#2D2424] hover:text-[#E58A7B] border border-[#EFE8DF] transition cursor-pointer shadow-sm">+30k</button>
          <button type="button" onclick="setDynamicQuickTip('${s.phone}', 50000)" class="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-[#FFF0EB] text-[#2D2424] hover:text-[#E58A7B] border border-[#EFE8DF] transition cursor-pointer shadow-sm">+50k</button>
          <button type="button" onclick="setDynamicQuickTip('${s.phone}', 100000)" class="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-[#FFF0EB] text-[#2D2424] hover:text-[#E58A7B] border border-[#EFE8DF] transition cursor-pointer shadow-sm">+100k</button>
        </div>
      </div>
    `;
  }).join('');

  if (isMulti) {
    container.innerHTML += `
      <div class="p-3 rounded-2xl bg-white border border-[#EFE8DF] flex justify-between items-center text-xs">
        <span class="text-[#7E7272] font-medium">Khách boa chung 1 khoản?</span>
        <div class="flex gap-1.5">
          <button type="button" onclick="splitSharedTipDynamic(20000)" class="px-2.5 py-1 rounded-full bg-[#E8F8F5] text-[#2E7D6D] font-bold border border-[#B7EBDD] hover:bg-[#D0F0E8] transition cursor-pointer">Chia 20k</button>
          <button type="button" onclick="splitSharedTipDynamic(50000)" class="px-2.5 py-1 rounded-full bg-[#E8F8F5] text-[#2E7D6D] font-bold border border-[#B7EBDD] hover:bg-[#D0F0E8] transition cursor-pointer">Chia 50k</button>
          <button type="button" onclick="splitSharedTipDynamic(100000)" class="px-2.5 py-1 rounded-full bg-[#E8F8F5] text-[#2E7D6D] font-bold border border-[#B7EBDD] hover:bg-[#D0F0E8] transition cursor-pointer">Chia 100k</button>
        </div>
      </div>
    `;
  }
}

function backToCustomerStep() {
  document.getElementById('checkout-step-customer')?.classList.remove('hidden');
  document.getElementById('checkout-step-staff')?.classList.add('hidden');
  lucide.createIcons();
}

function parseRawNumber(val) {
  if (typeof val === 'number') return val;
  return Number(String(val || '').replace(/\D/g, '')) || 0;
}

function formatWithDots(num) {
  if (!num || num <= 0) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function onDynamicStaffTipInput(phone, inputEl) {
  let val = (inputEl && inputEl.value !== undefined) ? inputEl.value : inputEl;
  let raw = parseRawNumber(val);
  staffTipMap[phone] = raw;
  if (inputEl) inputEl.value = raw > 0 ? formatWithDots(raw) : '';
  updateStaffEarningPreview();
}

function setDynamicQuickTip(phone, amount) {
  staffTipMap[phone] = Number(amount) || 0;
  const input = document.getElementById(`chk-tip-input-${phone}`);
  if (input) input.value = staffTipMap[phone] > 0 ? formatWithDots(staffTipMap[phone]) : '';
  updateStaffEarningPreview();
}

function splitSharedTipDynamic(totalAmount) {
  const staffs = currentLiveSession.staffs || [{ phone: currentLiveSession.staff_1_phone }];
  const count = staffs.length;
  const perStaff = Math.round(totalAmount / count);

  staffs.forEach(s => {
    staffTipMap[s.phone] = perStaff;
    const input = document.getElementById(`chk-tip-input-${s.phone}`);
    if (input) input.value = perStaff > 0 ? formatWithDots(perStaff) : '';
  });

  updateStaffEarningPreview();
}

function updateStaffEarningPreview() {
  if (!currentLiveSession) return;
  const users = getMergedUsers();
  const staffs = currentLiveSession.staffs || [
    { phone: currentLiveSession.staff_1_phone, name: currentLiveSession.staff_1_name, pct: 100 }
  ];

  const totalComm = Math.round(currentLiveSession.price * 0.1);
  const count = staffs.length;

  let summaryHtml = '';
  let totalTip = 0;

  staffs.forEach(s => {
    const u = users.find(user => normalizePhone(user.phone) === normalizePhone(s.phone));
    const rate = (u && parsePercentage(u?.commission_rate) > 0) ? parsePercentage(u?.commission_rate) : 10;
    const sPct = s.pct || Math.round(100 / count);
    const comm = Math.round(currentLiveSession.price * (rate / 100) * (sPct / 100));
    const tip = staffTipMap[s.phone] || 0;
    totalTip += tip;

    summaryHtml += `
      <div class="flex justify-between items-center text-[#2D2424]">
        <span>Thu nhập ${s.name}:</span>
        <span class="font-extrabold text-[#2E7D6D]">+${(comm + tip).toLocaleString('vi-VN')} đ (Tour: ${comm.toLocaleString('vi-VN')}${tip > 0 ? ` + Tip: ${tip.toLocaleString('vi-VN')}` : ''})</span>
      </div>
    `;
  });

  const listEl = document.getElementById('checkout-summary-staff-list');
  if (listEl) listEl.innerHTML = summaryHtml;

  const basePrice = currentLiveSession.use_voucher ? 0 : currentLiveSession.price;
  const grandTotal = basePrice + totalTip;
  const totalEl = document.getElementById('staff-step-grand-total');
  if (totalEl) totalEl.innerText = `${grandTotal.toLocaleString('vi-VN')} đ`;
}

function confirmSaveReceiptFromCheckout() {
  if (!currentLiveSession) return;

  const users = getMergedUsers();
  const staffs = currentLiveSession.staffs || [
    { phone: currentLiveSession.staff_1_phone, name: currentLiveSession.staff_1_name, pct: 100, user_id: currentLiveSession.staff_1_user_id, staff_id: currentLiveSession.staff_1_id }
  ];

  const s1 = staffs[0];
  const s2 = staffs[1] || null;

  const rate1 = parsePercentage(users.find(u => normalizePhone(u.phone) === normalizePhone(s1.phone))?.commission_rate) || 10;
  const rate2 = s2 ? (parsePercentage(users.find(u => normalizePhone(u.phone) === normalizePhone(s2.phone))?.commission_rate) || rate1 || 10) : 0;

  const s1Pct = s1.pct || (staffs.length > 1 ? Math.round(100 / staffs.length) : 100);
  const s2Pct = s2 ? (s2.pct || Math.round(100 / staffs.length)) : 0;

  let comm1 = Math.round(currentLiveSession.price * (rate1 / 100) * (s1Pct / 100));
  let comm2 = s2 ? Math.round(currentLiveSession.price * (rate2 / 100) * (s2Pct / 100)) : 0;

  let tip1 = staffTipMap[s1.phone] || 0;
  let tip2 = s2 ? (staffTipMap[s2.phone] || 0) : 0;

  let totalTip = 0;
  Object.values(staffTipMap).forEach(val => totalTip += Number(val) || 0);

  const finalPrice = currentLiveSession.use_voucher ? 0 : currentLiveSession.price;
  const grandTotal = finalPrice + totalTip;
  const receiptId = 'HD' + Date.now().toString().slice(-6);

  const receipt = {
    receipt_id: receiptId,
    service_id: currentLiveSession.service_id,
    service_name: currentLiveSession.service_name,
    price: currentLiveSession.price,
    tip_amount: totalTip,
    total_paid: grandTotal,
    customer_phone: currentLiveSession.customer_phone,
    customer_name: currentLiveSession.customer_name,
    
    // KTV 1
    staff_1_user_id: s1.user_id || s1.phone || '',
    staff_1_id: s1.staff_id || 'KTV01',
    staff_1_phone: s1.phone || '',
    staff_1_name: s1.name || 'KTV 1',
    staff_1_comm: comm1,
    staff_1_tip: tip1,

    // KTV 2
    has_staff_2: Boolean(s2),
    staff_2_user_id: s2 ? (s2.user_id || s2.phone) : '-',
    staff_2_id: s2 ? s2.staff_id : '-',
    staff_2_phone: s2 ? s2.phone : '-',
    staff_2_name: s2 ? s2.name : '-',
    staff_2_comm: comm2,
    staff_2_tip: tip2,

    // Tương thích ngược
    staff_phone: s1.phone || '',
    staff_id: s1.staff_id || 'KTV01',
    staff_name: s1.name || 'KTV',
    commission_amount: comm1 + tip1,

    start_time: currentLiveSession.start_time,
    end_time: currentLiveSession.end_time || currentLiveSession.start_time,
    duration_min: currentLiveSession.duration_actual_min || currentLiveSession.duration_target_min || 45,
    time: currentLiveSession.start_time,

    payment_method: checkoutPaymentMethod,
    is_voucher_used: currentLiveSession.use_voucher,
    date: currentLiveSession.date,
    created_at: currentLiveSession.date + ' ' + currentLiveSession.start_time
  };

  const receipts = getStored('receipts', []);
  receipts.unshift(receipt);
  setStored('receipts', receipts);

  if (receipt.customer_phone) {
    const customers = getStored('customers', DEFAULT_CUSTOMERS);
    const norm = normalizePhone(receipt.customer_phone);
    let cust = customers.find(c => normalizePhone(c.phone_number) === norm);
    if (cust) {
      if (receipt.is_voucher_used) {
        cust.voucher_count = Math.max(0, (cust.voucher_count || 1) - 1);
      } else {
        cust.total_visits = (cust.total_visits || 0) + 1;
        if (cust.total_visits >= 10) {
          cust.voucher_count = (cust.voucher_count || 0) + 1;
          cust.total_visits -= 10;
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          alert(`🎉 Chúc mừng! Khách hàng ${cust.customer_name} đã tích đủ 10 lần và nhận được 1 Voucher Combo 1 miễn phí!`);
        }
      }
    }
    setStored('customers', customers);
  }

  callGasApi('create_receipt', receipt);
  confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

  let successMsg = `✅ Đã hoàn tất và lưu hóa đơn ca gội!\n• Thời gian: ${receipt.start_time} - ${receipt.end_time} (${receipt.duration_min} phút)\n• Khách trả: ${grandTotal.toLocaleString('vi-VN')} đ (${checkoutPaymentMethod})`;
  if (totalTip > 0) successMsg += `\n• Tổng tiền Tips: +${totalTip.toLocaleString('vi-VN')} đ`;
  successMsg += `\n• KTV 1 (${receipt.staff_1_name}): Tour +${comm1.toLocaleString('vi-VN')} đ${tip1 > 0 ? ` + Tip +${tip1.toLocaleString('vi-VN')} đ` : ''}`;
  if (receipt.has_staff_2) successMsg += `\n• KTV 2 (${receipt.staff_2_name}): Tour +${comm2.toLocaleString('vi-VN')} đ${tip2 > 0 ? ` + Tip +${tip2.toLocaleString('vi-VN')} đ` : ''}`;
  alert(successMsg);

  closeCheckoutModal();
  localStorage.removeItem('selena_active_live_session');
  currentLiveSession = null;
  extraStaffList = [];
  clearInterval(liveTimerInterval);
  renderLiveSessionUI();

  document.getElementById('pos-customer-phone').value = '';
  document.getElementById('pos-customer-name').value = '';
  document.getElementById('pos-customer-card').classList.add('hidden');
  useVoucher = false;
  renderExtraStaffUI();

  showView('history');
}
