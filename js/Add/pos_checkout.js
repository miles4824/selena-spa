// Helper lấy danh sách users với KTV xếp trước, Sếp luôn ở dưới cùng
function getSortedUsersList() {
  const users = getStored('users', DEFAULT_USERS);
  const ktvs = users.filter(u => !isUserOwner(u));
  const owners = users.filter(u => isUserOwner(u));
  return [...ktvs, ...owners];
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

function getValidatedMenu() {
  let menu = getStored('menu', DEFAULT_MENU);
  if (!Array.isArray(menu) || menu.length < 5) {
    menu = DEFAULT_MENU;
    setStored('menu', DEFAULT_MENU);
  }
  return menu;
}

function initMenuUI() {
  const menu = getValidatedMenu();
  const select = document.getElementById('pos-service-select');
  if (!select) return;

  select.innerHTML = menu.map(m => `
    <option value="${m.service_id}">${m.service_name} — ${Number(m.price).toLocaleString('vi-VN')} đ (${m.duration_min}p)</option>
  `).join('');

  if (!selectedComboId || !menu.some(m => m.service_id === selectedComboId)) {
    selectedComboId = menu[0].service_id;
  }
  select.value = selectedComboId;

  renderQuickComboButtons();
  updatePOSCalculations();
  restoreLiveSessionIfExists();
}

function renderQuickComboButtons() {
  const quickContainer = document.getElementById('pos-quick-combos');
  if (!quickContainer) return;

  const quickList = [
    { id: 'CB01', label: 'Combo 1' },
    { id: 'CB02', label: 'Combo 2' },
    { id: 'CB03', label: 'Combo 3' },
    { id: 'CB04', label: 'Combo 4' },
    { id: 'CB05', label: 'Combo 5' }
  ];

  quickContainer.innerHTML = quickList.map(item => {
    const isSelected = item.id === selectedComboId;
    return `
      <button type="button" onclick="selectQuickCombo('${item.id}')" class="px-4 py-2.5 rounded-2xl text-xs font-extrabold border transition active:scale-95 cursor-pointer shadow-sm ${isSelected ? 'bg-[#FFF0EB] text-[#E58A7B] border-[#E58A7B] ring-1 ring-[#E58A7B]' : 'bg-[#FAF6F1] text-[#7E7272] border-[#EFE8DF] hover:bg-[#FFF0EB] hover:text-[#E58A7B]'}">
        ${item.label}
      </button>
    `;
  }).join('');
}

function selectQuickCombo(id) {
  selectedComboId = id;
  const select = document.getElementById('pos-service-select');
  if (select) {
    select.value = id;
  }
  renderQuickComboButtons();
  updatePOSCalculations();
}

function onSelectServiceChange() {
  const select = document.getElementById('pos-service-select');
  if (select) {
    selectedComboId = select.value;
  }
  renderQuickComboButtons();
  updatePOSCalculations();
}

function onExtraStaffSelectChange(index, newPhone) {
  const users = getSortedUsersList();
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

  const users = getSortedUsersList();
  const s1Phone = document.getElementById('pos-staff1-select')?.value || currentUser?.phone;

  container.innerHTML = extraStaffList.map((item, idx) => {
    const ktvNum = idx + 2;
    const otherUsedPhones = [normalizePhone(s1Phone), ...extraStaffList.filter((_, i) => i !== idx).map(s => normalizePhone(s.phone))];
    const selectable = users.filter(u => !otherUsedPhones.includes(normalizePhone(u.phone)));

    return `
      <div id="extra-staff-card-${idx}" class="relative p-3.5 rounded-2xl bg-[#FFF5F2] border border-[#FCDFD7] space-y-2 shadow-sm transition-all">
        <!-- 🔴 NÚT DẤU TRỪ ĐỎ ⊖ Ở GÓC TRÊN BÊN PHẢI -->
        <button type="button" onclick="removeExtraStaff(${idx})" title="Xóa người này" class="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-white border-2 border-rose-400 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center shadow-md active:scale-75 transition-all cursor-pointer z-10">
          <i data-lucide="minus" class="w-4 h-4 stroke-[3]"></i>
        </button>

        <div class="flex justify-between items-center pr-5">
          <span class="text-xs font-bold text-[#E58A7B] flex items-center gap-1">
            <i data-lucide="user-check" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
            <span class="font-extrabold">Người cùng làm ${ktvNum}:</span>
          </span>
          <span id="pos-staff${ktvNum}-comm-preview" class="text-xs font-extrabold text-[#2E7D6D] bg-[#E8F8F5] px-2.5 py-0.5 rounded-full">+3.200 đ</span>
        </div>

        <select onchange="onExtraStaffSelectChange(${idx}, this.value)" class="w-full bg-white border border-[#FCDFD7] rounded-xl p-3 text-[#2D2424] font-bold text-sm focus:outline-none focus:border-[#E58A7B] cursor-pointer">
          ${selectable.map(u => `
            <option value="${u.phone}" ${normalizePhone(u.phone) === normalizePhone(item.phone) ? 'selected' : ''}>${u.full_name}</option>
          `).join('')}
        </select>
      </div>
    `;
  }).join('');

  const totalUsed = 1 + extraStaffList.length;
  if (addBtn) {
    if (totalUsed >= users.length) {
      addBtn.classList.add('hidden');
    } else {
      addBtn.classList.remove('hidden');
    }
  }

  lucide.createIcons();
}

function updatePOSCalculations() {
  const menu = getValidatedMenu();
  const users = getSortedUsersList();
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
  const menu = getValidatedMenu();
  const users = getSortedUsersList();
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
      pct: Math.round(100 / (1 + extraStaffList.length)),
      joined_min: 0,
      is_midway: false
    },
    ...extraStaffList.map((s, idx) => ({
      user_id: s.user_id || s.phone,
      phone: s.phone,
      staff_id: s.staff_id || `KTV0${idx+2}`,
      name: s.full_name,
      pct: Math.round(100 / (1 + extraStaffList.length)),
      joined_min: 0,
      is_midway: false
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
    initial_staff_count: allStaffs.length, // Số lượng KTV ban đầu lúc tạo ca
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

  document.getElementById('live-service-name').innerText = currentLiveSession.service_name;
  document.getElementById('live-customer-badge').innerText = '👤 ' + (currentLiveSession.customer_name || 'Khách vãng lai');
  document.getElementById('live-start-time-text').innerText = currentLiveSession.start_time;
  document.getElementById('live-target-time-text').innerText = currentLiveSession.duration_target_min + ' phút';

  // RENDER CÁCH 1: CÁC CHIP KTV TƯƠNG TÁC
  const chipsContainer = document.getElementById('live-staff-chips-container');
  if (chipsContainer) {
    const staffs = currentLiveSession.staffs || [
      { phone: currentLiveSession.staff_1_phone, name: currentLiveSession.staff_1_name, pct: 100 }
    ];
    
    chipsContainer.innerHTML = staffs.map((s, idx) => `
      <button type="button" onclick="openSwapStaffModal()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EFE8DF] hover:border-[#E58A7B] text-xs font-bold text-[#2D2424] shadow-sm transition active:scale-95 cursor-pointer">
        <span class="w-2 h-2 rounded-full ${idx === 0 ? 'bg-[#2E7D6D]' : 'bg-[#E58A7B]'}"></span>
        <span>${s.name}</span>
        <span class="text-[10px] font-extrabold text-[#7E7272] bg-[#FAF6F1] px-1.5 py-0.5 rounded-md">${s.pct || Math.round(100/staffs.length)}%</span>
      </button>
    `).join('') + `
      <button type="button" onclick="openSwapStaffModal()" title="Điều chỉnh / Thêm KTV" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#FFF0EB] hover:bg-[#FFE5DC] text-xs font-bold text-[#E58A7B] border border-[#FCDFD7] shadow-sm transition active:scale-95 cursor-pointer">
        <i data-lucide="user-plus" class="w-3.5 h-3.5"></i>
        <span>Đổi / Thêm</span>
      </button>
    `;
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
  if (confirm('Bạn có chắc muốn hủy tour đang phục vụ này không?')) {
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
// LOGIC MODAL ĐỔI / THÊM KTV GIỮA CA (PHƯƠNG ÁN B - DANH SÁCH ĐỘNG & GIAI ĐOẠN)
// =============================================================
let tempSwapStaffs = [];

function openSwapStaffModal() {
  if (!currentLiveSession) return;
  const users = getSortedUsersList();

  tempSwapStaffs = (currentLiveSession.staffs || [
    { phone: currentLiveSession.staff_1_phone, name: currentLiveSession.staff_1_name, pct: 100, joined_min: 0 }
  ]).map(s => ({ ...s }));

  const initialCount = currentLiveSession.initial_staff_count || 1;
  const hasNewMidwayStaff = tempSwapStaffs.some(s => s.is_midway);

  // Nếu ca ban đầu có từ 2 người trở lên và chưa có người mới vào giữa ca -> CỐ ĐỊNH 'equal' (chia đều)
  if (initialCount >= 2 && !hasNewMidwayStaff) {
    currentSplitMode = 'equal';
  } else if (currentLiveSession.split_mode) {
    currentSplitMode = currentLiveSession.split_mode;
  } else {
    currentSplitMode = (initialCount === 1 && tempSwapStaffs.length > 1) ? 'timer' : 'equal';
  }

  renderSwapModalStaffUI();
  updateSplitButtonsUI();
  updateSwapPreviewDisplay();

  const modal = document.getElementById('modal-swap-staff');
  if (modal) modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeSwapStaffModal() {
  const modal = document.getElementById('modal-swap-staff');
  if (modal) modal.classList.add('hidden');
}

function updateSplitButtonsUI() {
  const btnTimer = document.getElementById('btn-split-timer');
  const btnHalf = document.getElementById('btn-split-half');
  if (!btnTimer || !btnHalf) return;

  const count = tempSwapStaffs.length;
  const initialCount = currentLiveSession?.initial_staff_count || 1;
  const hasMidwayJoiner = tempSwapStaffs.some(s => s.is_midway);

  // Khóa nút "Thời gian thực" nếu ca làm cùng từ đầu và không có ai vào thêm giữa chừng
  if (initialCount >= 2 && !hasMidwayJoiner) {
    btnTimer.disabled = true;
    btnTimer.className = 'p-2.5 rounded-xl border bg-gray-100 border-gray-200 text-gray-400 font-bold text-xs flex flex-col items-center gap-0.5 cursor-not-allowed opacity-60';
    btnHalf.disabled = false;
    btnHalf.className = 'p-2.5 rounded-xl border bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B] font-bold text-xs flex flex-col items-center gap-0.5 cursor-pointer shadow-sm';
    currentSplitMode = 'equal';
  } else if (count >= 2) {
    btnTimer.disabled = false;
    btnHalf.disabled = false;
    if (currentSplitMode === 'timer') {
      btnTimer.className = 'p-2.5 rounded-xl border bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B] font-bold text-xs flex flex-col items-center gap-0.5 cursor-pointer shadow-sm';
      btnHalf.className = 'p-2.5 rounded-xl border bg-[#F7F2EC] border-[#EFE8DF] text-[#7E7272] hover:bg-[#FFF0EB] font-bold text-xs flex flex-col items-center gap-0.5 cursor-pointer';
    } else {
      btnHalf.className = 'p-2.5 rounded-xl border bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B] font-bold text-xs flex flex-col items-center gap-0.5 cursor-pointer shadow-sm';
      btnTimer.className = 'p-2.5 rounded-xl border bg-[#F7F2EC] border-[#EFE8DF] text-[#7E7272] hover:bg-[#FFF0EB] font-bold text-xs flex flex-col items-center gap-0.5 cursor-pointer';
    }
  } else {
    btnTimer.disabled = true;
    btnHalf.disabled = true;
    btnTimer.className = 'p-2.5 rounded-xl border bg-gray-100 border-gray-200 text-gray-400 font-bold text-xs flex flex-col items-center gap-0.5 cursor-not-allowed opacity-60';
    btnHalf.className = 'p-2.5 rounded-xl border bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B] font-bold text-xs flex flex-col items-center gap-0.5 cursor-not-allowed';
  }
}

function renderSwapModalStaffUI() {
  const container = document.getElementById('swap-modal-staff-container');
  const addBtn = document.getElementById('btn-swap-add-staff');
  if (!container) return;

  const users = getSortedUsersList();
  const isOwner = currentUser && isUserOwner(currentUser);

  container.innerHTML = tempSwapStaffs.map((item, idx) => {
    const isFirst = idx === 0;
    const isLocked = isFirst && !isOwner;
    const usedOtherPhones = tempSwapStaffs.filter((_, i) => i !== idx).map(s => normalizePhone(s.phone));
    const selectable = users.filter(u => !usedOtherPhones.includes(normalizePhone(u.phone)));
    const joinHint = item.is_midway ? `<span class="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md font-semibold">Vào từ phút ${item.joined_min}</span>` : '';

    return `
      <div class="relative p-3 rounded-xl bg-[#FAF6F1] border border-[#F0EAE1] space-y-1.5">
        <div class="flex justify-between items-center pr-6">
          <div class="text-xs font-bold text-[#2D2424] flex items-center gap-1.5 flex-wrap">
            ${isLocked ? '<i data-lucide="lock" class="w-3.5 h-3.5 text-[#E58A7B]"></i>' : ''}
            <span class="text-[#E58A7B] font-extrabold">KTV ${idx + 1}${isFirst ? ' (Chính)' : ''}:</span>
            <span>${item.name || ''}</span>
            ${joinHint}
          </div>
          <span class="text-[11px] font-extrabold text-[#2E7D6D] bg-[#E8F8F5] px-2 py-0.5 rounded-full" id="swap-item-comm-${idx}">...</span>
        </div>

        <select ${isLocked ? 'disabled' : ''} onchange="onSwapStaffSelectChange(${idx}, this.value)" class="w-full bg-white border border-[#EFE8DF] rounded-lg p-2.5 text-xs font-bold text-[#2D2424] focus:outline-none focus:border-[#E58A7B] ${isLocked ? 'disabled:bg-[#F7F2EC] disabled:opacity-90 cursor-not-allowed' : 'cursor-pointer'}">
          ${selectable.map(u => `
            <option value="${u.phone}" ${normalizePhone(u.phone) === normalizePhone(item.phone) ? 'selected' : ''}>${u.full_name}</option>
          `).join('')}
        </select>

        ${!isFirst ? `
          <button type="button" onclick="removeStaffInSwapModal(${idx})" title="Xóa KTV này khỏi ca" class="absolute top-2 right-2 w-6 h-6 rounded-full bg-white border border-rose-300 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center shadow-sm cursor-pointer active:scale-90 transition">
            <i data-lucide="minus" class="w-3.5 h-3.5 stroke-[2.5]"></i>
          </button>
        ` : ''}
      </div>
    `;
  }).join('');

  if (addBtn) {
    if (tempSwapStaffs.length >= users.length) {
      addBtn.classList.add('hidden');
    } else {
      addBtn.classList.remove('hidden');
    }
  }

  lucide.createIcons();
}

function onSwapStaffSelectChange(index, newPhone) {
  const users = getSortedUsersList();
  const u = users.find(user => normalizePhone(user.phone) === normalizePhone(newPhone));
  if (u) {
    tempSwapStaffs[index].phone = u.phone;
    tempSwapStaffs[index].name = u.full_name;
    tempSwapStaffs[index].user_id = u.user_id || u.phone;
    tempSwapStaffs[index].staff_id = u.staff_id || (isUserOwner(u) ? 'FOUNDER_01' : 'KTV');
  }
  renderSwapModalStaffUI();
  updateSwapPreviewDisplay();
}

function addStaffInSwapModal() {
  const users = getSortedUsersList();
  const usedPhones = tempSwapStaffs.map(s => normalizePhone(s.phone));
  const available = users.filter(u => !usedPhones.includes(normalizePhone(u.phone)));

  if (available.length === 0) return;

  const elapsedSec = Math.max(1, Math.floor((Date.now() - currentLiveSession.start_timestamp) / 1000));
  const elapsedMin = Math.floor(elapsedSec / 60);

  const next = available[0];
  tempSwapStaffs.push({
    phone: next.phone,
    name: next.full_name,
    user_id: next.user_id || next.phone,
    staff_id: next.staff_id || (isUserOwner(next) ? 'FOUNDER_01' : 'KTV'),
    pct: 0,
    joined_min: elapsedMin,
    is_midway: true // Đánh dấu là KTV vào giữa ca
  });

  currentSplitMode = 'timer'; // Tự động gợi ý tính theo thời gian giai đoạn

  renderSwapModalStaffUI();
  updateSplitButtonsUI();
  updateSwapPreviewDisplay();
}

function removeStaffInSwapModal(index) {
  if (index === 0 && tempSwapStaffs.length === 1) return;
  tempSwapStaffs.splice(index, 1);
  renderSwapModalStaffUI();
  updateSplitButtonsUI();
  updateSwapPreviewDisplay();
}

function setSplitMode(mode) {
  currentSplitMode = mode;
  updateSplitButtonsUI();
  updateSwapPreviewDisplay();
}

function updateSwapPreviewDisplay() {
  if (!currentLiveSession || tempSwapStaffs.length === 0) return;
  const users = getSortedUsersList();
  const count = tempSwapStaffs.length;
  const targetMin = currentLiveSession.duration_target_min || 45;
  const elapsedSec = Math.max(1, Math.floor((Date.now() - currentLiveSession.start_timestamp) / 1000));
  const elapsedMin = Math.floor(elapsedSec / 60);

  const staff1User = users.find(u => normalizePhone(u.phone) === normalizePhone(tempSwapStaffs[0].phone));
  const rate1 = (staff1User && parsePercentage(staff1User?.commission_rate) > 0) ? parsePercentage(staff1User?.commission_rate) : 10;
  const totalComm = Math.round(currentLiveSession.price * (rate1 / 100));

  const summaryContainer = document.getElementById('swap-summary-pct-list');
  let html = '';

  if (count === 1) {
    tempSwapStaffs[0].pct = 100;
    tempSwapStaffs[0].comm_vnd = totalComm;
    html = `
      <div class="space-y-1">
        <div class="flex justify-between items-center text-[#2D2424] font-bold">
          <span>💆 ${tempSwapStaffs[0].name} (100% trọn ca):</span>
          <span class="text-[#2E7D6D] font-extrabold">+${totalComm.toLocaleString('vi-VN')} đ</span>
        </div>
      </div>
    `;
    const itemCommBadge = document.getElementById('swap-item-comm-0');
    if (itemCommBadge) itemCommBadge.innerText = `100% • +${totalComm.toLocaleString('vi-VN')} đ`;
  } else if (currentSplitMode === 'timer') {
    // =========================================================
    // ⏱️ TÍNH TOÁN VÀ HIỂN THỊ CHI TIẾT THEO GIAI ĐOẠN 1 & 2
    // =========================================================
    const midwayStaff = tempSwapStaffs.find(s => s.is_midway);
    const joinMin = Math.min(targetMin, Math.max(1, midwayStaff ? (midwayStaff.joined_min || elapsedMin) : elapsedMin));
    const remMin = Math.max(0, targetMin - joinMin);

    const stage1Comm = Math.round(totalComm * (joinMin / targetMin));
    const stage2Comm = totalComm - stage1Comm;

    const earlyStaffs = tempSwapStaffs.filter(s => !s.is_midway);
    const nEarly = earlyStaffs.length > 0 ? earlyStaffs.length : 1;
    const nTotal = tempSwapStaffs.length;

    const earlyStage1Vnd = Math.floor(stage1Comm / nEarly);
    const stage1Rem = stage1Comm - (earlyStage1Vnd * nEarly);

    const allStage2Vnd = Math.floor(stage2Comm / nTotal);
    const stage2Rem = stage2Comm - (allStage2Vnd * nTotal);

    tempSwapStaffs.forEach((s, idx) => {
      let comm = 0;
      if (!s.is_midway) {
        comm = earlyStage1Vnd + allStage2Vnd + (idx === 0 ? (stage1Rem + stage2Rem) : 0);
      } else {
        comm = allStage2Vnd;
      }
      s.comm_vnd = comm;
      s.pct = totalComm > 0 ? Math.round((comm / totalComm) * 100) : Math.round(100 / count);

      const itemCommBadge = document.getElementById(`swap-item-comm-${idx}`);
      if (itemCommBadge) itemCommBadge.innerText = `${s.pct}% • +${comm.toLocaleString('vi-VN')} đ`;
    });

    // Tạo giao diện bảng chi tiết các pha cực kỳ dễ hiểu
    html = `
      <div class="space-y-2.5">
        <!-- Giai đoạn 1 -->
        <div class="p-2.5 rounded-xl bg-white border border-[#F0EAE1] space-y-1">
          <div class="flex justify-between items-center text-[11px] font-bold text-[#E58A7B]">
            <span>🔹 Giai đoạn 1: ${joinMin} phút đầu (${earlyStaffs.length} KTV làm)</span>
            <span>${stage1Comm.toLocaleString('vi-VN')} đ</span>
          </div>
          ${earlyStaffs.map((s, i) => `
            <div class="flex justify-between items-center text-[11px] text-[#7E7272] pl-2">
              <span>• ${s.name}:</span>
              <span class="font-semibold text-[#2D2424]">+${(earlyStage1Vnd + (i === 0 ? stage1Rem : 0)).toLocaleString('vi-VN')} đ</span>
            </div>
          `).join('')}
        </div>

        <!-- Giai đoạn 2 -->
        <div class="p-2.5 rounded-xl bg-white border border-[#F0EAE1] space-y-1">
          <div class="flex justify-between items-center text-[11px] font-bold text-[#2E7D6D]">
            <span>🔹 Giai đoạn 2: ${remMin} phút sau (${nTotal} KTV cùng làm)</span>
            <span>${stage2Comm.toLocaleString('vi-VN')} đ</span>
          </div>
          ${tempSwapStaffs.map((s, i) => `
            <div class="flex justify-between items-center text-[11px] text-[#7E7272] pl-2">
              <span>• ${s.name}${s.is_midway ? ' (Vào sau)' : ''}:</span>
              <span class="font-semibold text-[#2D2424]">+${(allStage2Vnd + (i === 0 ? stage2Rem : 0)).toLocaleString('vi-VN')} đ</span>
            </div>
          `).join('')}
        </div>

        <!-- Tổng cộng thực nhận -->
        <div class="pt-1.5 border-t border-[#F0EAE1] space-y-1">
          <div class="text-[11px] font-extrabold text-[#2D2424] uppercase tracking-wider">🏆 Tổng Cộng Thực Nhận:</div>
          ${tempSwapStaffs.map(s => `
            <div class="flex justify-between items-center text-xs font-bold">
              <span class="text-[#2D2424]">${s.name}:</span>
              <span class="text-[#2E7D6D] font-extrabold">+${s.comm_vnd.toLocaleString('vi-VN')} đ (${s.pct}%)</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    const timerTextEl = document.getElementById('split-timer-pct');
    if (timerTextEl) timerTextEl.innerText = `Theo giai đoạn (${joinMin}p đầu & ${remMin}p sau)`;
  } else {
    // =========================================================
    // 🤝 CHIA ĐỀU (ƯU TIÊN 34% & TIỀN DÔI CHO KTV 1)
    // =========================================================
    const perStaffVnd = Math.floor(totalComm / count);
    const remVnd = totalComm - (perStaffVnd * count);
    const equalPct = Math.floor(100 / count);
    const remPct = 100 - (equalPct * count);

    tempSwapStaffs.forEach((s, idx) => {
      const isFirst = idx === 0;
      s.pct = equalPct + (isFirst ? remPct : 0);
      s.comm_vnd = perStaffVnd + (isFirst ? remVnd : 0);

      const itemCommBadge = document.getElementById(`swap-item-comm-${idx}`);
      if (itemCommBadge) itemCommBadge.innerText = `${s.pct}% • +${s.comm_vnd.toLocaleString('vi-VN')} đ`;
    });

    html = `
      <div class="space-y-1.5">
        <div class="text-[11px] font-bold text-[#7E7272] flex items-center gap-1">
          <span>🤝 Cùng làm từ đầu (Chia đều trọn ca ${targetMin} phút):</span>
        </div>
        ${tempSwapStaffs.map((s, i) => `
          <div class="flex justify-between items-center text-xs font-bold">
            <span class="text-[#2D2424]">${s.name}${i === 0 ? ' (KTV Chính)' : ''}:</span>
            <span class="text-[#2E7D6D] font-extrabold">+${s.comm_vnd.toLocaleString('vi-VN')} đ (${s.pct}%)</span>
          </div>
        `).join('')}
      </div>
    `;

    const equalTextEl = document.getElementById('split-equal-pct');
    if (equalTextEl) {
      if (count === 2) equalTextEl.innerText = '50% - 50%';
      else if (count === 3) equalTextEl.innerText = '34% - 33% - 33%';
      else equalTextEl.innerText = 'Chia đều trọn ca';
    }
  }

  if (summaryContainer) summaryContainer.innerHTML = html;
}

function saveSwapStaffSetting() {
  if (!currentLiveSession || tempSwapStaffs.length === 0) return;

  currentLiveSession.staffs = tempSwapStaffs.map(s => ({ ...s }));
  currentLiveSession.split_mode = currentSplitMode;

  const s1 = tempSwapStaffs[0];
  const s2 = tempSwapStaffs[1] || null;

  currentLiveSession.staff_1_phone = s1.phone;
  currentLiveSession.staff_1_name = s1.name;
  currentLiveSession.staff_1_user_id = s1.user_id;
  currentLiveSession.staff_1_id = s1.staff_id;
  currentLiveSession.staff_1_pct = s1.pct;

  currentLiveSession.has_staff_2 = Boolean(s2);
  currentLiveSession.staff_2_phone = s2 ? s2.phone : '-';
  currentLiveSession.staff_2_name = s2 ? s2.name : '-';
  currentLiveSession.staff_2_user_id = s2 ? s2.user_id : '-';
  currentLiveSession.staff_2_id = s2 ? s2.staff_id : '-';
  currentLiveSession.staff_2_pct = s2 ? s2.pct : 0;

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
  const users = getSortedUsersList();
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

  const users = getSortedUsersList();
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

  let successMsg = `✅ Đã hoàn tất và lưu hóa đơn tour gội!\n• Thời gian: ${receipt.start_time} - ${receipt.end_time} (${receipt.duration_min} phút)\n• Khách trả: ${grandTotal.toLocaleString('vi-VN')} đ (${checkoutPaymentMethod})`;
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
