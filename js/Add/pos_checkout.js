// =============================================================
// TAB 2: ADD - POS CHECKOUT, LIVE SESSION TIMER & 2-PHASE CHECKOUT
// =============================================================
let isStaff2Enabled = false;
let currentCheckoutTip = 0;
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

function updatePOSStaffInfo() {
  const users = getStored('users', DEFAULT_USERS);
  const staffList = users.filter(u => !isUserOwner(u));
  const s1Select = document.getElementById('pos-staff1-select');
  const s2Select = document.getElementById('pos-staff2-select');
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
      // Đối với KTV: Khóa KTV 1 cố định là chính KTV đó
      s1Select.disabled = true;
      document.getElementById('pos-staff1-role-hint')?.classList.remove('hidden');
      document.getElementById('pos-staff1-lock-icon')?.classList.remove('hidden');
      if (currentUser) s1Select.value = currentUser.phone;
    }
  }

  if (s2Select) {
    s2Select.innerHTML = staffList.map(u => `
      <option value="${u.phone}">💆 ${u.full_name} (${u.staff_id || u.phone})</option>
    `).join('');
    const otherStaff = staffList.find(u => normalizePhone(u.phone) !== normalizePhone(currentUser?.phone));
    if (otherStaff) s2Select.value = otherStaff.phone;
  }

  updatePOSCalculations();
  restoreLiveSessionIfExists();
}

function toggleSecondStaff() {
  isStaff2Enabled = !isStaff2Enabled;
  const box = document.getElementById('box-staff2-container');
  const btnText = document.getElementById('toggle-staff2-text');
  const btn = document.getElementById('btn-toggle-staff2');

  if (isStaff2Enabled) {
    box.classList.remove('hidden');
    btnText.innerText = 'Bỏ KTV 2';
    btn.className = 'px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition flex items-center gap-1.5 cursor-pointer shadow-sm';
  } else {
    box.classList.add('hidden');
    btnText.innerText = '+ Thêm KTV cùng làm';
    btn.className = 'px-3 py-1.5 rounded-full text-xs font-bold bg-[#FAF6F1] text-[#E58A7B] border border-[#FCDFD7] hover:bg-[#FFF0EB] transition flex items-center gap-1.5 cursor-pointer shadow-sm';
  }
  lucide.createIcons();
  updatePOSCalculations();
}

function updatePOSCalculations() {
  const menu = getStored('menu', DEFAULT_MENU);
  const users = getStored('users', DEFAULT_USERS);
  const service = menu.find(m => m.service_id === selectedComboId) || menu[0];

  const s1Phone = document.getElementById('pos-staff1-select')?.value || currentUser?.phone;
  const s2Phone = document.getElementById('pos-staff2-select')?.value;

  const staff1 = users.find(u => normalizePhone(u.phone) === normalizePhone(s1Phone)) || currentUser;
  const staff2 = isStaff2Enabled ? users.find(u => normalizePhone(u.phone) === normalizePhone(s2Phone)) : null;

  const rate1 = parsePercentage(staff1?.commission_rate);
  const rate2 = staff2 ? parsePercentage(staff2?.commission_rate) : 0;

  const totalComm = Math.round(service.price * (rate1 / 100));
  let comm1 = isStaff2Enabled && staff2 ? Math.round(totalComm / 2) : totalComm;
  let comm2 = isStaff2Enabled && staff2 ? Math.round(service.price * (rate2 / 100) / 2) : 0;

  const p1El = document.getElementById('pos-staff1-comm-preview');
  if (p1El) p1El.innerText = `+${comm1.toLocaleString('vi-VN')} đ`;

  const p2El = document.getElementById('pos-staff2-comm-preview');
  if (p2El && isStaff2Enabled) p2El.innerText = `+${comm2.toLocaleString('vi-VN')} đ`;
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
  const users = getStored('users', DEFAULT_USERS);
  const service = menu.find(m => m.service_id === selectedComboId) || menu[0];

  const phone = document.getElementById('pos-customer-phone')?.value.trim() || '';
  const name = document.getElementById('pos-customer-name')?.value.trim() || 'Khách vãng lai';

  const s1Phone = document.getElementById('pos-staff1-select')?.value || currentUser?.phone;
  const s2Phone = document.getElementById('pos-staff2-select')?.value;

  const staff1 = users.find(u => normalizePhone(u.phone) === normalizePhone(s1Phone)) || currentUser;
  const staff2 = isStaff2Enabled ? users.find(u => normalizePhone(u.phone) === normalizePhone(s2Phone)) : null;

  const now = new Date();
  const startTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const startDateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

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
    staff_1_user_id: staff1?.user_id || staff1?.phone || '',
    staff_1_phone: staff1?.phone || '',
    staff_1_id: staff1?.staff_id || 'KTV01',
    staff_1_name: staff1?.full_name || 'KTV 1',
    has_staff_2: Boolean(isStaff2Enabled && staff2),
    staff_2_user_id: staff2 ? (staff2.user_id || staff2.phone) : '-',
    staff_2_phone: staff2 ? staff2.phone : '-',
    staff_2_id: staff2 ? (staff2.staff_id || 'KTV02') : '-',
    staff_2_name: staff2 ? staff2.full_name : '-',
    staff_1_pct: isStaff2Enabled && staff2 ? 50 : 100,
    staff_2_pct: isStaff2Enabled && staff2 ? 50 : 0,
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

  document.getElementById('live-service-name').innerText = currentLiveSession.service_name;
  document.getElementById('live-customer-badge').innerText = '👤 ' + (currentLiveSession.customer_name || 'Khách vãng lai');
  document.getElementById('live-staff-badge').innerText = '💆 ' + currentLiveSession.staff_1_name + (currentLiveSession.has_staff_2 ? ` & ${currentLiveSession.staff_2_name}` : '');
  document.getElementById('live-start-time-text').innerText = currentLiveSession.start_time;
  document.getElementById('live-target-time-text').innerText = currentLiveSession.duration_target_min + ' phút';

  const splitText = document.getElementById('live-split-ratio-text');
  if (splitText) {
    if (currentLiveSession.has_staff_2) {
      splitText.innerText = `🤝 2 KTV: ${currentLiveSession.staff_1_name} (${currentLiveSession.staff_1_pct || 50}%) & ${currentLiveSession.staff_2_name} (${currentLiveSession.staff_2_pct || 50}%)`;
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
  const users = getStored('users', DEFAULT_USERS);
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
  
  const users = getStored('users', DEFAULT_USERS);
  const s2Phone = document.getElementById('swap-staff2-select')?.value;
  const s2 = users.find(u => normalizePhone(u.phone) === normalizePhone(s2Phone));
  
  document.getElementById('swap-preview-s2-name').innerText = (s2?.full_name || 'KTV 2') + ':';
  document.getElementById('swap-preview-s2-pct').innerText = `${s2Pct}% (${Math.round(currentLiveSession.price * 0.1 * s2Pct / 100).toLocaleString('vi-VN')} đ)`;
}

function saveSwapStaffSetting() {
  if (!currentLiveSession) return;
  const users = getStored('users', DEFAULT_USERS);
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
  
  // LỰA CHỌN 3: Tính số phút thập phân chính xác từng giây
  const elapsedSec = Math.max(1, Math.floor((Date.now() - (currentLiveSession.start_timestamp || Date.now())) / 1000));
  const elapsedMinutes = Math.round((elapsedSec / 60) * 10) / 10;
  
  currentLiveSession.end_time = endTimeStr;
  currentLiveSession.duration_actual_min = elapsedMinutes > 0 ? elapsedMinutes : 0.1;

  document.getElementById('chk-service-name').innerText = currentLiveSession.service_name;
  document.getElementById('chk-service-price').innerText = currentLiveSession.use_voucher ? '0 đ (Voucher)' : currentLiveSession.price.toLocaleString('vi-VN') + ' đ';
  document.getElementById('chk-time-range').innerText = `${currentLiveSession.start_time} - ${endTimeStr} (${currentLiveSession.duration_actual_min} phút)`;
  document.getElementById('chk-customer-name').innerText = currentLiveSession.customer_name || 'Khách vãng lai';

  // Hiển thị Pha 1 (Khách xem) và ẩn Pha 2 (KTV nhập Tips)
  document.getElementById('checkout-step-customer')?.classList.remove('hidden');
  document.getElementById('checkout-step-staff')?.classList.add('hidden');

  currentCheckoutTip = 0;
  document.getElementById('chk-tip-input').value = '';
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
// CHUYỂN SANG PHA 2: KTV GHI NHẬN TIPS KÍN ĐÁO SAU KHI KHÁCH ĐÃ THANH TOÁN
// =============================================================

function goToStaffTipStep() {
  document.getElementById('checkout-step-customer')?.classList.add('hidden');
  document.getElementById('checkout-step-staff')?.classList.remove('hidden');

  document.getElementById('staff-step-service-price').innerText = currentLiveSession?.use_voucher ? '0 đ (Voucher)' : (currentLiveSession?.price?.toLocaleString('vi-VN') + ' đ');
  document.getElementById('staff-step-pay-method').innerText = checkoutPaymentMethod;

  updateStaffEarningPreview();
  lucide.createIcons();
}

function backToCustomerStep() {
  document.getElementById('checkout-step-customer')?.classList.remove('hidden');
  document.getElementById('checkout-step-staff')?.classList.add('hidden');
  lucide.createIcons();
}

function onCheckoutTipChange(val) {
  currentCheckoutTip = Math.max(0, Number(val) || 0);
  updateStaffEarningPreview();
}

function setCheckoutQuickTip(amount) {
  currentCheckoutTip = amount;
  const input = document.getElementById('chk-tip-input');
  if (input) input.value = amount > 0 ? amount : '';
  updateStaffEarningPreview();
}

function updateStaffEarningPreview() {
  if (!currentLiveSession) return;
  const users = getStored('users', DEFAULT_USERS);
  const staff1 = users.find(u => normalizePhone(u.phone) === normalizePhone(currentLiveSession.staff_1_phone)) || currentUser;
  const rate1 = parsePercentage(staff1?.commission_rate);

  const totalComm = Math.round(currentLiveSession.price * (rate1 / 100));
  const s1Pct = currentLiveSession.has_staff_2 ? (currentLiveSession.staff_1_pct || 50) : 100;
  
  let myComm = Math.round(totalComm * (s1Pct / 100));
  let myTip = Math.round(currentCheckoutTip * (s1Pct / 100));
  let myTotal = myComm + myTip;

  const earnEl = document.getElementById('staff-step-ktv-earning');
  if (earnEl) earnEl.innerText = `+${myTotal.toLocaleString('vi-VN')} đ (Tour: ${myComm.toLocaleString('vi-VN')}${myTip > 0 ? ` + Tip: ${myTip.toLocaleString('vi-VN')}` : ''})`;
}

function confirmSaveReceiptFromCheckout() {
  if (!currentLiveSession) return;

  const users = getStored('users', DEFAULT_USERS);
  const staff1 = users.find(u => normalizePhone(u.phone) === normalizePhone(currentLiveSession.staff_1_phone)) || currentUser;
  const staff2 = currentLiveSession.has_staff_2 ? users.find(u => normalizePhone(u.phone) === normalizePhone(currentLiveSession.staff_2_phone)) : null;

  const rate1 = parsePercentage(staff1?.commission_rate);
  const rate2 = staff2 ? parsePercentage(staff2?.commission_rate) : 0;

  const totalComm1 = Math.round(currentLiveSession.price * (rate1 / 100));
  const totalComm2 = staff2 ? Math.round(currentLiveSession.price * (rate2 / 100)) : 0;

  const s1Pct = currentLiveSession.has_staff_2 ? (currentLiveSession.staff_1_pct || 50) : 100;
  const s2Pct = currentLiveSession.has_staff_2 ? (currentLiveSession.staff_2_pct || 50) : 0;

  let comm1 = Math.round(totalComm1 * (s1Pct / 100));
  let comm2 = Math.round(totalComm2 * (s2Pct / 100));
  let tip1 = Math.round(currentCheckoutTip * (s1Pct / 100));
  let tip2 = currentCheckoutTip - tip1;

  const finalPrice = currentLiveSession.use_voucher ? 0 : currentLiveSession.price;
  const grandTotal = finalPrice + currentCheckoutTip;
  const receiptId = 'HD' + Date.now().toString().slice(-6);

  const receipt = {
    receipt_id: receiptId,
    service_id: currentLiveSession.service_id,
    service_name: currentLiveSession.service_name,
    price: currentLiveSession.price,
    tip_amount: currentCheckoutTip,
    total_paid: grandTotal,
    customer_phone: currentLiveSession.customer_phone,
    customer_name: currentLiveSession.customer_name,
    
    // KTV 1
    staff_1_user_id: staff1?.user_id || staff1?.phone || '',
    staff_1_id: staff1?.staff_id || staff1?.phone || 'KTV01',
    staff_1_phone: staff1?.phone || '',
    staff_1_name: staff1?.full_name || 'KTV 1',
    staff_1_comm: comm1,
    staff_1_tip: tip1,

    // KTV 2
    has_staff_2: currentLiveSession.has_staff_2,
    staff_2_user_id: staff2 ? (staff2.user_id || staff2.phone) : '-',
    staff_2_id: staff2 ? (staff2.staff_id || 'KTV02') : '-',
    staff_2_phone: staff2 ? staff2.phone : '-',
    staff_2_name: staff2 ? staff2.full_name : '-',
    staff_2_comm: comm2,
    staff_2_tip: tip2,

    // Tương thích ngược
    staff_phone: staff1?.phone || '',
    staff_id: staff1?.staff_id || 'KTV01',
    staff_name: staff1?.full_name || 'KTV',
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

  // Lưu receipt
  const receipts = getStored('receipts', []);
  receipts.unshift(receipt);
  setStored('receipts', receipts);

  // Cập nhật tích điểm khách
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

  let successMsg = `✅ Đã hoàn tất và lưu hóa đơn ca gội!\n• Thời gian: ${receipt.start_time} - ${receipt.end_time} (${receipt.duration_min} phút)\n• Khách thanh toán: ${grandTotal.toLocaleString('vi-VN')} đ (${checkoutPaymentMethod})`;
  if (receipt.tip_amount > 0) successMsg += `\n• Tiền Tips: +${receipt.tip_amount.toLocaleString('vi-VN')} đ`;
  successMsg += `\n• KTV 1 (${receipt.staff_1_name} - ${s1Pct}%): +${(comm1 + tip1).toLocaleString('vi-VN')} đ`;
  if (receipt.has_staff_2) successMsg += `\n• KTV 2 (${receipt.staff_2_name} - ${s2Pct}%): +${(comm2 + tip2).toLocaleString('vi-VN')} đ`;
  alert(successMsg);

  // Đóng modal và dọn live session
  closeCheckoutModal();
  localStorage.removeItem('selena_active_live_session');
  currentLiveSession = null;
  clearInterval(liveTimerInterval);
  renderLiveSessionUI();

  // Reset input form
  document.getElementById('pos-customer-phone').value = '';
  document.getElementById('pos-customer-name').value = '';
  document.getElementById('pos-customer-card').classList.add('hidden');
  useVoucher = false;
  if (isStaff2Enabled) toggleSecondStaff();

  showView('history');
}
