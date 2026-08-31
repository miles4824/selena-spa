function parseBirthMonth(val) {
  if (!val) return 0;
  if (typeof val === 'number' && val >= 1 && val <= 12) return val;
  let s = String(val).trim();
  let mMatch = s.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (mMatch) return Number(mMatch[2]);
  let num = parseInt(s.replace(/[^\d]/g, ''), 10);
  if (!isNaN(num) && num >= 1 && num <= 12) return num;
  return 0;
}

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
  if (!Array.isArray(menu) || menu.length === 0) {
    menu = DEFAULT_MENU;
    setStored('menu', DEFAULT_MENU);
  }
  return menu;
}

// Helper tìm đúng combo 1, 2, 3, 4, 5 dựa theo tên hoặc ID từ Google Sheets
function findComboByNumber(menu, num) {
  return menu.find(m => {
    const sName = (m.service_name || '').toLowerCase();
    const sId = (m.service_id || '').toLowerCase();
    return sName.includes(`combo ${num}`) || sName.includes(`combo${num}`) || sId === `cb0${num}` || sId === `cb${num}` || sId === `combo${num}` || sId === `combo_${num}`;
  }) || null;
}

function initMenuUI() {
  const menu = getValidatedMenu();
  const select = document.getElementById('pos-service-select');
  if (!select) return;

  select.innerHTML = menu.map(m => `
    <option value="${m.service_id}">${m.service_name} — ${Number(m.price).toLocaleString('vi-VN')} đ (${m.duration_min}p)</option>
  `).join('');

  // Mặc định luôn tìm và chọn Combo 1
  const combo1 = findComboByNumber(menu, 1);
  if (!selectedComboId || !menu.some(m => m.service_id === selectedComboId)) {
    selectedComboId = combo1 ? combo1.service_id : (menu[0] ? menu[0].service_id : 'CB01');
  }

  // Nếu hiện tại đang trỏ vào Combo Bé, tự động chuyển về Combo 1
  if (combo1 && selectedComboId !== combo1.service_id) {
    const curSelected = menu.find(m => m.service_id === selectedComboId);
    if (!curSelected || (curSelected.service_name || '').toLowerCase().includes('bé') || (curSelected.service_name || '').toLowerCase().includes('be')) {
      selectedComboId = combo1.service_id;
    }
  }

  select.value = selectedComboId;

  renderQuickComboButtons();
  updatePOSCalculations();
  restoreLiveSessionIfExists();
}

function renderQuickComboButtons() {
  const quickContainer = document.getElementById('pos-quick-combos');
  if (!quickContainer) return;

  const menu = getValidatedMenu();
  const select = document.getElementById('pos-service-select');
  const curSelectedId = select ? select.value : selectedComboId;

  const quickNumbers = [1, 2, 3, 4, 5];

  quickContainer.innerHTML = quickNumbers.map(num => {
    const item = findComboByNumber(menu, num);
    if (!item) {
      return `
        <button type="button" class="px-4 py-2.5 rounded-2xl text-xs font-extrabold border bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60">
          Combo ${num}
        </button>
      `;
    }

    const isSelected = item.service_id === curSelectedId;
    return `
      <button type="button" onclick="selectQuickCombo('${item.service_id}')" class="px-4 py-2.5 rounded-2xl text-xs font-extrabold border transition active:scale-95 cursor-pointer ${isSelected ? 'bg-[#FFF0EB] text-[#E58A7B] border-[#E58A7B] ring-2 ring-[#E58A7B]/50 font-black' : 'bg-[#FAF6F1] text-[#7E7272] border-[#EFE8DF] hover:bg-[#FFF0EB] hover:text-[#E58A7B]'}">
        Combo ${num}
      </button>
    `;
  }).join('');
}

function selectQuickCombo(serviceId) {
  if (!serviceId) return;
  selectedComboId = serviceId;
  const select = document.getElementById('pos-service-select');
  if (select) {
    select.value = serviceId;
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

function updatePOSStaffInfo() {
  const users = getSortedUsersList();
  const s1Select = document.getElementById('pos-staff1-select');
  const isOwner = currentUser && isUserOwner(currentUser);

  if (s1Select) {
    s1Select.innerHTML = users.map(u => `
      <option value="${u.phone}" ${currentUser && normalizePhone(u.phone) === normalizePhone(currentUser.phone) ? 'selected' : ''}>
        ${u.full_name}
      </option>
    `).join('');

    if (isOwner) {
      s1Select.disabled = false;
      document.getElementById('pos-staff1-lock-icon')?.classList.add('hidden');
      document.getElementById('pos-staff1-role-hint')?.classList.add('hidden');
    } else {
      s1Select.disabled = true;
      if (currentUser) s1Select.value = currentUser.phone;
      document.getElementById('pos-staff1-lock-icon')?.classList.remove('hidden');
      document.getElementById('pos-staff1-role-hint')?.classList.remove('hidden');
    }
  }

  renderExtraStaffUI();
  updatePOSCalculations();
}

function onStaff1SelectChange() {
  renderExtraStaffUI();
  updatePOSCalculations();
}

function addExtraStaff() {
  const users = getSortedUsersList();
  const s1Phone = document.getElementById('pos-staff1-select')?.value || currentUser?.phone;

  const usedPhones = [normalizePhone(s1Phone), ...extraStaffList.map(s => normalizePhone(s.phone))];
  const available = users.filter(u => !usedPhones.includes(normalizePhone(u.phone)));

  if (available.length === 0) {
    alert('Đã thêm toàn bộ nhân viên và quản lý hiện có trong tiệm!');
    return;
  }

  const nextStaff = available[0];
  extraStaffList.push({
    phone: nextStaff.phone,
    staff_id: nextStaff.staff_id || (isUserOwner(nextStaff) ? 'FOUNDER_01' : 'KTV'),
    full_name: nextStaff.full_name,
    user_id: nextStaff.user_id || nextStaff.phone
  });

  renderExtraStaffUI();
  updatePOSCalculations();
}

function removeExtraStaff(index) {
  const cardEl = document.getElementById(`extra-staff-card-${index}`);
  if (cardEl) {
    cardEl.style.transition = 'all 0.25s ease';
    cardEl.style.transform = 'scale(0.85)';
    cardEl.style.opacity = '0';
  }

  setTimeout(() => {
    extraStaffList.splice(index, 1);
    renderExtraStaffUI();
    updatePOSCalculations();
  }, 200);
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
      <div id="extra-staff-card-${idx}" class="relative p-3.5 rounded-2xl bg-[#FFF5F2] border border-[#FCDFD7] space-y-2 transition-all">
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
  const service = menu.find(m => m.service_id === selectedComboId) || findComboByNumber(menu, 1) || menu[0];
  if (!service) return;

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

let customerSearchDebounce = null;

function getAllAvailableCustomers() {
  const storedCusts = getStored('customers', []);
  const custMap = new Map();

  // 1. Từ danh sách customers
  storedCusts.forEach(c => {
    let p = String(c.raw_phone || c.phone_number || '').replace(/[^0-9]/g, '');
    if (p.length === 9 && !p.startsWith('0')) p = '0' + p;
    if (p && p.length >= 7) {
      custMap.set(p, {
        phone_number: p,
        raw_phone: p,
        customer_name: c.customer_name || 'Khách hàng',
        birthday: c.birthday || '',
        birth_month: c.birth_month || parseBirthMonth(c.birthday),
        cycle_start_date: c.cycle_start_date || '',
        cycle_end_date: c.cycle_end_date || '',
        cycle_visits: Number(c.cycle_visits) || 0,
        total_visits: Number(c.total_visits) || 0,
        voucher_count: Number(c.voucher_count) || 0,
        notes: c.notes || ''
      });
    }
  });

  // 2. Gom thêm từ danh sách receipts nếu customers chưa sync kịp
  const receipts = getStored('receipts', []);
  receipts.forEach(r => {
    let p = String(r.raw_phone || r.customer_phone || '').replace(/[^0-9]/g, '');
    if (p.length === 9 && !p.startsWith('0')) p = '0' + p;
    if (p && p.length >= 7 && !custMap.has(p)) {
      custMap.set(p, {
        phone_number: p,
        raw_phone: p,
        customer_name: r.customer_name || 'Khách hàng',
        birthday: '',
        birth_month: 0,
        cycle_start_date: r.date || '',
        cycle_end_date: '',
        cycle_visits: 1,
        total_visits: 1,
        voucher_count: 0,
        notes: ''
      });
    }
  });

  return Array.from(custMap.values());
}

function matchCustomerPhoneOrName(c, rawInput, normInput) {
  if (!c) return false;
  const name = (c.customer_name || '').toLowerCase();
  const rawTarget = String(c.phone_number || c.raw_phone || '').replace(/[^0-9]/g, '');
  if (!rawTarget && !name) return false;

  const cWith0 = rawTarget.startsWith('0') ? rawTarget : ('0' + rawTarget);
  const cNo0 = rawTarget.replace(/^0+/, '');

  const uWith0 = normInput.startsWith('0') ? normInput : ('0' + normInput);
  const uNo0 = normInput.replace(/^0+/, '');

  // 1. Khớp SĐT: Bắt buộc phải BẮT ĐẦU từ đầu số (Prefix Match chuẩn xác)
  let matchPhone = false;
  if (normInput) {
    matchPhone = (
      cWith0.startsWith(normInput) || 
      cWith0.startsWith(uWith0) || 
      cNo0.startsWith(uNo0) || 
      rawTarget.startsWith(normInput)
    );
  }

  // 2. Khớp Tên: Tìm theo chữ cái trong tên khách
  let matchName = false;
  if (rawInput && /[a-zA-ZÀ-ỹ]/.test(rawInput)) {
    matchName = name.includes(rawInput.toLowerCase());
  }

  return Boolean(matchPhone || matchName);
}

function onCustomerPhoneInput(val) {
  const rawInput = val.trim();
  const normInput = String(rawInput).replace(/[^0-9]/g, '');
  const card = document.getElementById('pos-customer-card');
  const suggestionsBox = document.getElementById('pos-customer-suggestions');
  const customers = getAllAvailableCustomers();

  // 1. Hiển thị Dropdown Gợi ý Khách hàng
  if (suggestionsBox) {
    if (rawInput.length >= 1) {
      const matches = customers.filter(c => matchCustomerPhoneOrName(c, rawInput, normInput)).slice(0, 8);

      if (matches.length > 0) {
        renderSuggestionsHTML(matches, normInput);
      } else {
        suggestionsBox.classList.add('hidden');
        
        // Live search trực tiếp từ Google Apps Script nếu cục bộ chưa có
        if (normInput.length >= 3) {
          clearTimeout(customerSearchDebounce);
          customerSearchDebounce = setTimeout(async () => {
            try {
              const res = await callGasApi('check_customer', { phone_number: normInput });
              if (res && res.found && res.customer) {
                const liveCust = res.customer;
                const curCusts = getStored('customers', []);
                const rawP = String(liveCust.phone_number || '').replace(/[^0-9]/g, '');
                const stdP = rawP.startsWith('0') ? rawP : ('0' + rawP);
                liveCust.phone_number = stdP;
                
                if (!curCusts.some(x => String(x.phone_number).includes(rawP))) {
                  curCusts.push(liveCust);
                  setStored('customers', curCusts);
                }
                renderSuggestionsHTML([liveCust], normInput);
              }
            } catch(e) {}
          }, 350);
        }
      }
    } else {
      suggestionsBox.classList.add('hidden');
    }
  }

  // 2. Tìm chính xác nếu đã nhập từ 7 số trở lên
  if (normInput.length >= 7) {
    const cust = customers.find(c => {
      const p = c.phone_number || c.raw_phone;
      return typeof isSamePhone === 'function' ? isSamePhone(p, normInput) : (normalizePhone(p) === normInput);
    });

    if (cust) {
      applyCustomerData(cust);
      return;
    }
  }

  currentCustomer = null;
  if (card) card.classList.add('hidden');
  useVoucher = false;
  const vCheck = document.getElementById('pos-use-voucher');
  if (vCheck) vCheck.checked = false;
}

function renderSuggestionsHTML(matches, currentInput = '') {
  const suggestionsBox = document.getElementById('pos-customer-suggestions');
  if (!suggestionsBox) return;

  const isOwner = typeof isUserOwner === 'function' ? isUserOwner(currentUser) : false;

  suggestionsBox.innerHTML = `
    <div class="px-3 py-1.5 bg-[#FAF6F1] text-[10px] font-extrabold text-[#7E7272] uppercase tracking-wider flex items-center justify-between border-b border-[#F0EAE1]">
      <span>🔍 Khách hàng tìm thấy (${matches.length})</span>
      <span class="text-[9px] text-[#A39696]">Chạm để chọn</span>
    </div>
    ${matches.map(c => {
      let rawP = String(c.phone_number || c.raw_phone || '').replace(/[^0-9]/g, '');
      let fullP = rawP.startsWith('0') ? rawP : ('0' + rawP);
      let displayP = typeof maskPhoneNumber === 'function' ? maskPhoneNumber(fullP, isOwner, currentInput) : fullP;
      let bMonth = c.birth_month || parseBirthMonth(c.birthday);
      const visits = Number(c.cycle_visits) || 0;
      const vCount = Number(c.voucher_count) || 0;

      return `
        <div onclick="selectCustomerSuggestion('${fullP}')" class="p-3 hover:bg-[#FFF5F2] cursor-pointer transition flex items-center justify-between gap-2 border-b border-[#FAF6F1] last:border-b-0 bg-white">
          <div>
            <div class="font-bold text-xs sm:text-sm text-[#2D2424] flex items-center gap-1.5">
              <span>👤 ${c.customer_name}</span>
              ${bMonth ? `<span class="text-[10px] text-[#A39696] font-semibold">(T${bMonth})</span>` : ''}
              ${vCount > 0 ? `<span class="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-[#E8F8F5] text-[#2E7D6D]">🎁 ${vCount} Voucher</span>` : ''}
            </div>
            <div class="text-[11px] font-mono text-[#E58A7B] font-semibold mt-0.5">${displayP}</div>
          </div>
          <span class="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-[#FAF6F1] text-[#7E7272] border border-[#F0EAE1]">
            ${visits}/10 lần
          </span>
        </div>
      `;
    }).join('')}
  `;

  suggestionsBox.classList.remove('hidden');
}

function selectCustomerSuggestion(phone) {
  const customers = getAllAvailableCustomers();
  const cleanPhone = String(phone).replace(/[^0-9]/g, '');
  const isOwner = typeof isUserOwner === 'function' ? isUserOwner(currentUser) : false;

  const cust = customers.find(c => {
    const p = c.phone_number || c.raw_phone;
    return typeof isSamePhone === 'function' ? isSamePhone(p, cleanPhone) : (normalizePhone(p) === cleanPhone);
  });
  
  const suggestionsBox = document.getElementById('pos-customer-suggestions');
  if (suggestionsBox) suggestionsBox.classList.add('hidden');

  const pInput = document.getElementById('pos-customer-phone');
  if (pInput) {
    const fullP = cleanPhone.startsWith('0') ? cleanPhone : ('0' + cleanPhone);
    pInput.value = typeof maskPhoneNumber === 'function' ? maskPhoneNumber(fullP, isOwner, '094') : fullP;
  }

  if (cust) {
    applyCustomerData(cust);
  }
}

function applyCustomerData(cust) {
  currentCustomer = cust;
  const card = document.getElementById('pos-customer-card');
  if (card) card.classList.remove('hidden');
  const currentMonth = new Date().getMonth() + 1;
  const rawP = String(cust.phone_number || cust.raw_phone || '').replace(/[^0-9]/g, '');
  const cPhone = rawP.startsWith('0') ? rawP : ('0' + rawP);

  const nameInput = document.getElementById('pos-customer-name');
  if (nameInput) {
    nameInput.value = cust.customer_name || '';
    // Khóa hoàn toàn ô Tên nếu khách đã có hồ sơ tên chính thức trong hệ thống
    if (cust.customer_name && cust.customer_name !== 'Khách hàng' && cust.customer_name !== 'Khách vãng lai') {
      nameInput.disabled = true;
      nameInput.classList.add('bg-[#EFE8DF]', 'text-[#7E7272]', 'cursor-not-allowed', 'opacity-85', 'pointer-events-none', 'select-none');
    } else {
      nameInput.disabled = false;
      nameInput.classList.remove('bg-[#EFE8DF]', 'text-[#7E7272]', 'cursor-not-allowed', 'opacity-85', 'pointer-events-none', 'select-none');
    }
  }
  
  const nameBadge = document.getElementById('pos-cust-name-badge');
  if (nameBadge) nameBadge.innerText = cust.customer_name || 'Khách hàng';

  let custMonth = cust.birth_month || parseBirthMonth(cust.birthday);
  const bSelect = document.getElementById('pos-birth-month');
  if (bSelect) {
    bSelect.value = (custMonth && custMonth >= 1 && custMonth <= 12) ? String(custMonth) : '';
    // Khóa hoàn toàn ô Tháng sinh nếu khách đã có tháng sinh trong hệ thống
    if (custMonth && custMonth >= 1 && custMonth <= 12) {
      bSelect.disabled = true;
      bSelect.classList.add('bg-[#EFE8DF]', 'text-[#7E7272]', 'cursor-not-allowed', 'opacity-85', 'pointer-events-none', 'select-none');
    } else {
      bSelect.disabled = false;
      bSelect.classList.remove('bg-[#EFE8DF]', 'text-[#7E7272]', 'cursor-not-allowed', 'opacity-85', 'pointer-events-none', 'select-none');
    }
  }

  // Active 60-day Loyalty Cycle (Cột D & E)
  let visits = Number(cust.cycle_visits) || 0;
  let expiryDate = cust.cycle_end_date ? formatDateVN(cust.cycle_end_date) : '';

  const visitsBadge = document.getElementById('pos-cust-visits-badge');
  if (visitsBadge) visitsBadge.innerText = visits + ' / 10 Lần gội';

  const progressBar = document.getElementById('pos-cust-progress-bar');
  if (progressBar) progressBar.style.width = Math.min(100, (visits / 10) * 100) + '%';

  const cycleStatusEl = document.getElementById('pos-cust-cycle-status-text');
  if (cycleStatusEl) {
    cycleStatusEl.innerText = `Chu kỳ 60 ngày (${visits}/10 lần)`;
  }

  const expTextEl = document.getElementById('pos-cust-cycle-expiry-text');
  if (expTextEl) {
    expTextEl.innerText = expiryDate ? `Hạn đến: ${expiryDate}` : 'Hạn 60 ngày';
  }

  // Birthday banner
  const bBanner = document.getElementById('pos-birthday-banner');
  if (bBanner) {
    if (custMonth === currentMonth) {
      bBanner.classList.remove('hidden');
    } else {
      bBanner.classList.add('hidden');
    }
  }

  // Ghi Chú Sở Thích / Lưu Ý
  let noteText = String(cust.notes || '').trim();
  if (noteText.includes('GMT') || noteText.includes('00:00:00') || noteText === 'undefined' || noteText === 'null') noteText = '';
  const notesBox = document.getElementById('pos-cust-notes-box');
  const notesText = document.getElementById('pos-cust-notes-text');
  if (notesBox && notesText) {
    if (noteText) {
      notesBox.classList.remove('hidden');
      notesText.innerText = noteText;
    } else {
      notesBox.classList.add('hidden');
    }
  }

  // Vouchers
  const vCount = Number(cust.voucher_count) || 0;
  const vBanner = document.getElementById('pos-voucher-banner');
  const vText = document.getElementById('pos-voucher-text');
  if (vBanner && vText) {
    if (vCount > 0) {
      vBanner.classList.remove('hidden');
      vText.innerText = `Khách có ${vCount} Voucher lần miễn phí!`;
    } else {
      vBanner.classList.add('hidden');
    }
  }
}

function applyBirthdayDiscount() {
  alert('🎂 Đã áp dụng ưu đãi giảm 20% cho khách sinh nhật trong tháng!');
}

function onVoucherToggle(checked) {
  useVoucher = checked;
  updatePOSCalculations();
}

// =============================================================
// BƯỚC 1 -> BƯỚC 2: KHỞI ĐỘNG TOUR & ĐẾM GIỜ
// =============================================================

function startLiveSession() {
  const menu = getValidatedMenu();
  const users = getSortedUsersList();
  const service = menu.find(m => m.service_id === selectedComboId) || findComboByNumber(menu, 1) || menu[0];

  let phone = document.getElementById('pos-customer-phone')?.value.trim() || '';
  if (currentCustomer && (phone.includes('*') || phone === currentCustomer.phone_number || phone === currentCustomer.raw_phone)) {
    phone = currentCustomer.phone_number || currentCustomer.raw_phone || phone;
  } else {
    const digits = phone.replace(/[^0-9]/g, '');
    if (digits.length === 9 && !digits.startsWith('0')) {
      phone = '0' + digits;
    } else if (digits.length >= 7) {
      phone = digits;
    }
  }
  const name = document.getElementById('pos-customer-name')?.value.trim() || 'Khách vãng lai';
  const birthMonth = document.getElementById('pos-birth-month')?.value.trim() || (currentCustomer?.birth_month ? String(currentCustomer.birth_month) : '');

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
    birth_month: birthMonth ? Number(birthMonth) : 0,
    birthday: birthMonth ? Number(birthMonth) : (currentCustomer?.birth_month ? Number(currentCustomer.birth_month) : (currentCustomer?.birthday || '')),
    initial_staff_count: allStaffs.length,
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
  confetti({ particleCount: 50, spread: 60, origin: { y: 0.85 } });
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

  const chipsContainer = document.getElementById('live-staff-chips-container');
  if (chipsContainer) {
    const staffs = currentLiveSession.staffs || [
      { phone: currentLiveSession.staff_1_phone, name: currentLiveSession.staff_1_name, pct: 100 }
    ];
    
    chipsContainer.innerHTML = staffs.map((s, idx) => `
      <button type="button" onclick="openSwapStaffModal()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EFE8DF] hover:border-[#E58A7B] text-xs font-bold text-[#2D2424] transition active:scale-95 cursor-pointer">
        <span class="w-2 h-2 rounded-full ${idx === 0 ? 'bg-[#2E7D6D]' : 'bg-[#E58A7B]'}"></span>
        <span>${s.name}</span>
        <span class="text-[10px] font-extrabold text-[#7E7272] bg-[#FAF6F1] px-1.5 py-0.5 rounded-md">${s.pct || Math.round(100/staffs.length)}%</span>
      </button>
    `).join('') + `
      <button type="button" onclick="openSwapStaffModal()" title="Điều chỉnh / Thêm KTV" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#FFF0EB] hover:bg-[#FFE5DC] text-xs font-bold text-[#E58A7B] border border-[#FCDFD7] transition active:scale-95 cursor-pointer">
        <i data-lucide="user-plus" class="w-3.5 h-3.5"></i>
        <span>Đổi / Thêm</span>
      </button>
      <button type="button" onclick="openHandoverModal()" title="Bàn giao tour cho bạn khác tiếp quản" class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#E8F8F5] hover:bg-[#D2F3EB] text-xs font-bold text-[#2E7D6D] border border-[#B7EBDD] transition active:scale-95 cursor-pointer">
        <i data-lucide="arrow-right-left" class="w-3.5 h-3.5"></i>
        <span>Bàn Giao</span>
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
// LOGIC MODAL ĐỔI / THÊM KTV GIỮA TOUR (PHƯƠNG ÁN B - GIAI ĐOẠN)
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

  if (initialCount >= 2 && !hasMidwayJoiner) {
    btnTimer.disabled = true;
    btnTimer.className = 'p-2.5 rounded-xl border bg-gray-100 border-gray-200 text-gray-400 font-bold text-xs flex flex-col items-center gap-0.5 cursor-not-allowed opacity-60';
    btnHalf.disabled = false;
    btnHalf.className = 'p-2.5 rounded-xl border bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B] font-bold text-xs flex flex-col items-center gap-0.5 cursor-pointer ';
    currentSplitMode = 'equal';
  } else if (count >= 2) {
    btnTimer.disabled = false;
    btnHalf.disabled = false;
    if (currentSplitMode === 'timer') {
      btnTimer.className = 'p-2.5 rounded-xl border bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B] font-bold text-xs flex flex-col items-center gap-0.5 cursor-pointer ';
      btnHalf.className = 'p-2.5 rounded-xl border bg-[#F7F2EC] border-[#EFE8DF] text-[#7E7272] hover:bg-[#FFF0EB] font-bold text-xs flex flex-col items-center gap-0.5 cursor-pointer';
    } else {
      btnHalf.className = 'p-2.5 rounded-xl border bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B] font-bold text-xs flex flex-col items-center gap-0.5 cursor-pointer ';
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
          <button type="button" onclick="removeStaffInSwapModal(${idx})" title="Xóa KTV này khỏi tour" class="absolute top-2 right-2 w-6 h-6 rounded-full bg-white border border-rose-300 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center cursor-pointer active:scale-90 transition">
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
    is_midway: true
  });

  currentSplitMode = 'timer';

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
          <span>${tempSwapStaffs[0].name} (100% trọn tour):</span>
          <span class="text-[#2E7D6D] font-extrabold">+${totalComm.toLocaleString('vi-VN')} đ</span>
        </div>
      </div>
    `;
    const itemCommBadge = document.getElementById('swap-item-comm-0');
    if (itemCommBadge) itemCommBadge.innerText = `100% • +${totalComm.toLocaleString('vi-VN')} đ`;
  } else if (currentSplitMode === 'timer') {
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

    html = `
      <div class="space-y-2.5">
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
          <span>🤝 Cùng làm từ đầu (Chia đều trọn tour ${targetMin} phút):</span>
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
      else equalTextEl.innerText = 'Chia đều trọn tour';
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

// =============================================================
// BƯỚC 2 -> CHECKOUT & THU TIỀN VÀ TIPS
// =============================================================

function openCheckoutModal() {
  if (!currentLiveSession) return;

  const now = new Date();
  currentLiveSession.end_time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const elapsedMinutes = Math.max(1, Math.round((Date.now() - currentLiveSession.start_timestamp) / 60000));
  currentLiveSession.duration_actual_min = elapsedMinutes;

  // 1. Fill Step 1 (Customer view)
  const sNameEl = document.getElementById('chk-service-name');
  if (sNameEl) sNameEl.innerText = currentLiveSession.service_name;

  const cNameEl = document.getElementById('chk-customer-name');
  if (cNameEl) cNameEl.innerText = currentLiveSession.customer_name || 'Khách vãng lai';

  const timeRangeEl = document.getElementById('chk-time-range');
  if (timeRangeEl) timeRangeEl.innerText = `${currentLiveSession.start_time} - ${currentLiveSession.end_time} (${elapsedMinutes} phút)`;

  const price = currentLiveSession.use_voucher ? 0 : currentLiveSession.price;
  const sPriceEl = document.getElementById('chk-service-price');
  if (sPriceEl) sPriceEl.innerText = price.toLocaleString('vi-VN') + ' đ';

  // 2. Default to Step 1
  const stepCust = document.getElementById('checkout-step-customer');
  const stepStaff = document.getElementById('checkout-step-staff');
  if (stepCust) stepCust.classList.remove('hidden');
  if (stepStaff) stepStaff.classList.add('hidden');

  setCheckoutPayment('Chuyển khoản');

  // 3. Reset tips
  staffTipMap = {};
  const currentStaffs = currentLiveSession.staffs || [
    { phone: currentLiveSession.staff_1_phone, name: currentLiveSession.staff_1_name, pct: 100 }
  ];
  currentStaffs.forEach(s => {
    staffTipMap[s.phone] = 0;
  });

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
  const btnQr = document.getElementById('chk-btn-qr');
  const btnCash = document.getElementById('chk-btn-cash');
  const qrBox = document.getElementById('chk-qr-display-box');

  if (method === 'Chuyển khoản') {
    if (btnQr) {
      btnQr.className = 'p-3.5 rounded-2xl border bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B] font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs';
    }
    if (btnCash) {
      btnCash.className = 'p-3.5 rounded-2xl border bg-[#F7F2EC] border-[#EFE8DF] text-[#7E7272] hover:bg-[#FFF0EB] font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer';
    }
    if (qrBox) qrBox.classList.remove('hidden');
  } else {
    if (btnCash) {
      btnCash.className = 'p-3.5 rounded-2xl border bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B] font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs';
    }
    if (btnQr) {
      btnQr.className = 'p-3.5 rounded-2xl border bg-[#F7F2EC] border-[#EFE8DF] text-[#7E7272] hover:bg-[#FFF0EB] font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer';
    }
    if (qrBox) qrBox.classList.add('hidden');
  }

  const staffPayMethodEl = document.getElementById('staff-step-pay-method');
  if (staffPayMethodEl) staffPayMethodEl.innerText = method;

  updateCheckoutGrandTotal();
}

function goToStaffTipStep() {
  const stepCust = document.getElementById('checkout-step-customer');
  const stepStaff = document.getElementById('checkout-step-staff');
  if (stepCust) stepCust.classList.add('hidden');
  if (stepStaff) stepStaff.classList.remove('hidden');

  const price = currentLiveSession?.use_voucher ? 0 : (currentLiveSession?.price || 0);
  const staffPriceEl = document.getElementById('staff-step-service-price');
  if (staffPriceEl) staffPriceEl.innerText = price.toLocaleString('vi-VN') + ' đ';

  const staffPayMethodEl = document.getElementById('staff-step-pay-method');
  if (staffPayMethodEl) staffPayMethodEl.innerText = checkoutPaymentMethod;

  renderDynamicTipInputs();
  updateCheckoutGrandTotal();
  lucide.createIcons();
}

function backToCustomerStep() {
  const stepCust = document.getElementById('checkout-step-customer');
  const stepStaff = document.getElementById('checkout-step-staff');
  if (stepCust) stepCust.classList.remove('hidden');
  if (stepStaff) stepStaff.classList.add('hidden');
  lucide.createIcons();
}

function renderDynamicTipInputs() {
  const container = document.getElementById('checkout-dynamic-tips-container');
  if (!container || !currentLiveSession) return;

  const users = getSortedUsersList();
  const currentStaffs = currentLiveSession.staffs || [
    { phone: currentLiveSession.staff_1_phone, name: currentLiveSession.staff_1_name, pct: 100 }
  ];

  const quickAmounts = [0, 5000, 10000, 20000, 30000, 50000, 100000];

  container.innerHTML = currentStaffs.map((s, idx) => {
    const staffObj = users.find(u => normalizePhone(u.phone) === normalizePhone(s.phone));
    const rate = (staffObj && parsePercentage(staffObj?.commission_rate) > 0) ? parsePercentage(staffObj?.commission_rate) : 10;
    const commVnd = Math.round(currentLiveSession.price * (rate / 100) * ((s.pct || Math.round(100/currentStaffs.length)) / 100));

    return `
      <div class="p-3.5 rounded-2xl bg-[#FFF5F2] border border-[#FCDFD7] space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-xs font-extrabold text-[#E58A7B] flex items-center gap-1">
            <span class="text-[#2D2424]">KTV ${idx + 1}:</span>
            <span>${s.name}</span>
          </span>
          <span class="text-xs font-extrabold text-[#2E7D6D] bg-[#E8F8F5] px-2 py-0.5 rounded-full">
            Tour: +${commVnd.toLocaleString('vi-VN')} đ
          </span>
        </div>

        <div class="relative">
          <input type="text" id="chk-tip-input-${s.phone}" value="" onkeyup="onDynamicTipKeyup('${s.phone}', this.value)" placeholder="0" class="w-full bg-white border border-[#FCDFD7] rounded-xl p-3 pr-10 text-[#2D2424] font-extrabold text-base focus:outline-none focus:border-[#E58A7B] font-mono text-right">
          <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#A39696] pointer-events-none">đ</span>
        </div>

        <div class="flex flex-wrap gap-1.5 pt-0.5">
          ${quickAmounts.map(amt => `
            <button type="button" onclick="setDynamicQuickTip('${s.phone}', ${amt})" class="px-2.5 py-1 rounded-lg text-xs font-bold ${amt === 0 ? 'bg-white text-[#7E7272] border border-[#EFE8DF]' : 'bg-[#FFF0EB] text-[#E58A7B] border border-[#FCDFD7] hover:bg-[#FFE5DC]'} transition active:scale-95 cursor-pointer ">
              ${amt === 0 ? '0 đ' : `+${amt >= 1000 ? (amt/1000) + 'k' : amt}`}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function setDynamicQuickTip(phone, amount) {
  staffTipMap[phone] = amount;
  const inputEl = document.getElementById(`chk-tip-input-${phone}`);
  if (inputEl) {
    inputEl.value = amount > 0 ? formatWithDots(amount) : '';
  }
  updateCheckoutGrandTotal();
}

function splitSharedTipDynamic(totalTipAmount) {
  const currentStaffs = currentLiveSession?.staffs || [
    { phone: currentLiveSession?.staff_1_phone, name: currentLiveSession?.staff_1_name, pct: 100 }
  ];
  const count = currentStaffs.length;
  if (count === 0) return;

  const perStaff = Math.floor(totalTipAmount / count);
  const remainder = totalTipAmount - (perStaff * count);

  currentStaffs.forEach((s, idx) => {
    const tip = perStaff + (idx === 0 ? remainder : 0);
    staffTipMap[s.phone] = tip;
    const inputEl = document.getElementById(`chk-tip-input-${s.phone}`);
    if (inputEl) {
      inputEl.value = formatWithDots(tip);
    }
  });

  updateCheckoutGrandTotal();
}

function formatWithDots(val) {
  if (val === null || val === undefined || val === '') return '';
  const num = parseInt(String(val).replace(/[^0-9]/g, ''), 10);
  if (isNaN(num) || num === 0) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function onDynamicTipKeyup(phone, val) {
  const rawNum = parseInt(String(val).replace(/[^0-9]/g, ''), 10) || 0;
  staffTipMap[phone] = rawNum;

  const inputEl = document.getElementById(`chk-tip-input-${phone}`);
  if (inputEl && rawNum > 0) {
    inputEl.value = formatWithDots(rawNum);
  }
  updateCheckoutGrandTotal();
}

function getStaffTipAmount(phone) {
  return Number(staffTipMap[phone]) || 0;
}

function updateCheckoutGrandTotal() {
  if (!currentLiveSession) return;
  const basePrice = currentLiveSession.use_voucher ? 0 : currentLiveSession.price;

  let totalTip = 0;
  Object.values(staffTipMap).forEach(v => {
    totalTip += Number(v) || 0;
  });

  const grandTotal = basePrice + totalTip;
  const grandTotalEl = document.getElementById('staff-step-grand-total');
  if (grandTotalEl) {
    grandTotalEl.innerText = grandTotal.toLocaleString('vi-VN') + ' đ';
  }

  const staffSummaryEl = document.getElementById('checkout-summary-staff-list');
  if (staffSummaryEl) {
    const users = getSortedUsersList();
    const currentStaffs = currentLiveSession.staffs || [
      { phone: currentLiveSession.staff_1_phone, name: currentLiveSession.staff_1_name, pct: 100 }
    ];

    staffSummaryEl.innerHTML = currentStaffs.map((s, idx) => {
      const staffObj = users.find(u => normalizePhone(u.phone) === normalizePhone(s.phone));
      const rate = (staffObj && parsePercentage(staffObj?.commission_rate) > 0) ? parsePercentage(staffObj?.commission_rate) : 10;
      const commVnd = Math.round(currentLiveSession.price * (rate / 100) * ((s.pct || Math.round(100/currentStaffs.length)) / 100));
      const tipVnd = getStaffTipAmount(s.phone);

      return `
        <div class="flex justify-between items-center text-xs font-bold text-[#2D2424]">
          <span>${s.name}:</span>
          <span class="text-[#2E7D6D]">Tour +${commVnd.toLocaleString('vi-VN')} đ ${tipVnd > 0 ? `<span class="text-[#E58A7B]">(Tip +${tipVnd.toLocaleString('vi-VN')} đ)</span>` : ''}</span>
        </div>
      `;
    }).join('');
  }
}

function confirmSaveReceiptFromCheckout() {
  if (!currentLiveSession) return;

  const users = getSortedUsersList();
  const currentStaffs = currentLiveSession.staffs || [
    { phone: currentLiveSession.staff_1_phone, name: currentLiveSession.staff_1_name, pct: 100 }
  ];

  const s1 = currentStaffs[0];
  const s2 = currentStaffs[1] || null;

  const staff1Obj = users.find(u => normalizePhone(u.phone) === normalizePhone(s1.phone));
  const rate1 = (staff1Obj && parsePercentage(staff1Obj?.commission_rate) > 0) ? parsePercentage(staff1Obj?.commission_rate) : 10;
  const comm1 = Math.round(currentLiveSession.price * (rate1 / 100) * ((s1.pct || 100) / 100));
  const tip1 = getStaffTipAmount(s1.phone);

  let comm2 = 0;
  let tip2 = 0;
  if (s2) {
    const staff2Obj = users.find(u => normalizePhone(u.phone) === normalizePhone(s2.phone));
    const rate2 = (staff2Obj && parsePercentage(staff2Obj?.commission_rate) > 0) ? parsePercentage(staff2Obj?.commission_rate) : 10;
    comm2 = Math.round(currentLiveSession.price * (rate2 / 100) * ((s2.pct || 0) / 100));
    tip2 = getStaffTipAmount(s2.phone);
  }

  let totalTip = 0;
  Object.values(staffTipMap).forEach(v => {
    totalTip += Number(v) || 0;
  });

  const basePrice = currentLiveSession.use_voucher ? 0 : currentLiveSession.price;
  const grandTotal = basePrice + totalTip;
  const receiptId = 'HD' + Date.now().toString().slice(-6);

  const receipt = {
    receipt_id: receiptId,
    service_id: currentLiveSession.service_id,
    service_name: currentLiveSession.service_name,
    price: currentLiveSession.price,
    tip_amount: totalTip,
    total_paid: grandTotal,
    customer_phone: (currentCustomer && currentCustomer.phone_number) ? currentCustomer.phone_number : currentLiveSession.customer_phone,
    customer_name: currentLiveSession.customer_name,
    birth_month: currentLiveSession.birth_month || 0,
    birthday: currentLiveSession.birth_month ? Number(currentLiveSession.birth_month) : (currentLiveSession.birthday || ''),
    
    staff_1_user_id: s1.user_id || s1.phone || '',
    staff_1_id: s1.staff_id || 'KTV01',
    staff_1_phone: s1.phone || '',
    staff_1_name: s1.name || 'KTV 1',
    staff_1_comm: comm1,
    staff_1_tip: tip1,

    has_staff_2: Boolean(s2),
    staff_2_user_id: s2 ? (s2.user_id || s2.phone) : '-',
    staff_2_id: s2 ? s2.staff_id : '-',
    staff_2_phone: s2 ? s2.phone : '-',
    staff_2_name: s2 ? s2.name : '-',
    staff_2_comm: comm2,
    staff_2_tip: tip2,

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
  if (typeof fbSaveReceipt === 'function') {
    fbSaveReceipt(receipt, currentCustomer);
  }

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

  let successMsg = `✅ Đã hoàn tất và lưu hóa đơn tour gội!
• Thời gian: ${receipt.start_time} - ${receipt.end_time} (${receipt.duration_min} phút)
• Khách trả: ${grandTotal.toLocaleString('vi-VN')} đ (${checkoutPaymentMethod})`;
  if (totalTip > 0) successMsg += `
• Tổng tiền Tips: +${totalTip.toLocaleString('vi-VN')} đ`;
  successMsg += `
• KTV 1 (${receipt.staff_1_name}): Tour +${comm1.toLocaleString('vi-VN')} đ${tip1 > 0 ? ` + Tip +${tip1.toLocaleString('vi-VN')} đ` : ''}`;
  if (receipt.has_staff_2) successMsg += `
• KTV 2 (${receipt.staff_2_name}): Tour +${comm2.toLocaleString('vi-VN')} đ${tip2 > 0 ? ` + Tip +${tip2.toLocaleString('vi-VN')} đ` : ''}`;
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
  updatePOSStaffInfo();
}


// =============================================================
// TÍNH NĂNG BÀN GIAO TOUR GỘI REALTIME GIỮA KTV (HANDOVER)
// =============================================================
let handoverSplitMode = 'timer';

function openHandoverModal() {
  if (!currentLiveSession) {
    alert('Không tìm thấy phiên tour đang chạy!');
    return;
  }
  const users = getSortedUsersList();
  const myPhone = currentUser ? normalizePhone(currentUser.phone) : normalizePhone(currentLiveSession.staff_1_phone);
  const availableUsers = users.filter(u => normalizePhone(u.phone) !== myPhone);

  const selectEl = document.getElementById('handover-target-staff-select');
  if (selectEl) {
    if (availableUsers.length === 0) {
      selectEl.innerHTML = '<option value="">Không có KTV khác sẵn sàng</option>';
    } else {
      selectEl.innerHTML = availableUsers.map(u => `
        <option value="${u.phone}">${u.full_name} (${isUserOwner(u) ? 'Chủ tiệm' : 'KTV'})</option>
      `).join('');
    }
  }

  handoverSplitMode = 'timer';
  updateHandoverSplitButtons();
  updateHandoverPreview();

  const modal = document.getElementById('modal-handover-tour');
  if (modal) modal.classList.remove('hidden');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeHandoverModal() {
  const modal = document.getElementById('modal-handover-tour');
  if (modal) modal.classList.add('hidden');
}

function setHandoverSplitMode(mode) {
  handoverSplitMode = mode;
  updateHandoverSplitButtons();
  updateHandoverPreview();
}

function updateHandoverSplitButtons() {
  const btnTimer = document.getElementById('btn-handover-timer');
  const btnEqual = document.getElementById('btn-handover-equal');
  if (!btnTimer || !btnEqual) return;

  if (handoverSplitMode === 'timer') {
    btnTimer.className = 'p-3 rounded-2xl border bg-[#E8F8F5] border-[#2E7D6D] text-[#2E7D6D] font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition';
    btnEqual.className = 'p-3 rounded-2xl border bg-[#F7F2EC] border-[#EFE8DF] text-[#7E7272] hover:bg-[#FFF0EB] font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition';
  } else {
    btnEqual.className = 'p-3 rounded-2xl border bg-[#E8F8F5] border-[#2E7D6D] text-[#2E7D6D] font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition';
    btnTimer.className = 'p-3 rounded-2xl border bg-[#F7F2EC] border-[#EFE8DF] text-[#7E7272] hover:bg-[#FFF0EB] font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition';
  }
}

function updateHandoverPreview() {
  if (!currentLiveSession) return;
  const listEl = document.getElementById('handover-preview-list');
  if (!listEl) return;

  const users = getSortedUsersList();
  const selectEl = document.getElementById('handover-target-staff-select');
  const targetPhone = selectEl ? selectEl.value : '';
  const targetUser = users.find(u => normalizePhone(u.phone) === normalizePhone(targetPhone)) || { full_name: 'KTV mới' };

  const elapsedSec = Math.max(1, Math.floor((Date.now() - currentLiveSession.start_timestamp) / 1000));
  const elapsedMin = Math.floor(elapsedSec / 60);
  const targetMin = currentLiveSession.duration_target_min || 50;

  const menu = getValidatedMenu();
  const service = menu.find(m => m.service_id === currentLiveSession.service_id) || menu[0];
  const rate1 = parsePercentage(currentUser?.commission_rate) || 10;
  const totalComm = Math.round(service.price * (rate1 / 100));

  let p1Pct = 50;
  let p2Pct = 50;

  if (handoverSplitMode === 'timer') {
    p1Pct = Math.min(90, Math.max(10, Math.round((elapsedMin / targetMin) * 100)));
    p2Pct = 100 - p1Pct;
  }

  const p1Comm = Math.round(totalComm * (p1Pct / 100));
  const p2Comm = totalComm - p1Comm;

  const currentStaffName = currentUser?.full_name || currentLiveSession.staff_1_name || 'KTV hiện tại';

  listEl.innerHTML = `
    <div class="flex justify-between items-center text-[#2D2424]">
      <span class="flex items-center gap-1">
        <span class="w-2 h-2 rounded-full bg-[#E58A7B]"></span>
        <b>${currentStaffName}</b> (Đã làm ${elapsedMin} phút):
      </span>
      <span class="font-extrabold text-[#E58A7B]">${p1Pct}% • +${p1Comm.toLocaleString('vi-VN')} đ</span>
    </div>
    <div class="flex justify-between items-center text-[#2D2424]">
      <span class="flex items-center gap-1">
        <span class="w-2 h-2 rounded-full bg-[#2E7D6D]"></span>
        <b>${targetUser.full_name}</b> (Làm tiếp ${Math.max(0, targetMin - elapsedMin)} phút):
      </span>
      <span class="font-extrabold text-[#2E7D6D]">${p2Pct}% • +${p2Comm.toLocaleString('vi-VN')} đ</span>
    </div>
  `;
}

async function confirmHandoverTour() {
  if (!currentLiveSession) return;
  const users = getSortedUsersList();
  const selectEl = document.getElementById('handover-target-staff-select');
  const targetPhone = selectEl ? selectEl.value : '';
  const targetUser = users.find(u => normalizePhone(u.phone) === normalizePhone(targetPhone));

  if (!targetUser) {
    alert('Vui lòng chọn KTV tiếp quản tour!');
    return;
  }

  const elapsedSec = Math.max(1, Math.floor((Date.now() - currentLiveSession.start_timestamp) / 1000));
  const elapsedMin = Math.floor(elapsedSec / 60);
  const targetMin = currentLiveSession.duration_target_min || 50;

  const menu = getValidatedMenu();
  const service = menu.find(m => m.service_id === currentLiveSession.service_id) || menu[0];
  const rate1 = parsePercentage(currentUser?.commission_rate) || 10;
  const totalComm = Math.round(service.price * (rate1 / 100));

  let p1Pct = 50;
  let p2Pct = 50;
  if (handoverSplitMode === 'timer') {
    p1Pct = Math.min(90, Math.max(10, Math.round((elapsedMin / targetMin) * 100)));
    p2Pct = 100 - p1Pct;
  }

  const p1Comm = Math.round(totalComm * (p1Pct / 100));
  const p2Comm = totalComm - p1Comm;

  const handoverSession = {
    ...currentLiveSession,
    active_staff_phone: normalizePhone(targetUser.phone),
    staff_1_phone: targetUser.phone,
    staff_1_name: targetUser.full_name,
    staff_1_id: targetUser.staff_id || (isUserOwner(targetUser) ? 'FOUNDER_01' : 'KTV'),
    is_handover: true,
    handover_from_name: currentUser?.full_name || currentLiveSession.staff_1_name,
    handover_from_phone: currentLiveSession.staff_1_phone,
    handover_worked_min: elapsedMin,
    handover_split_mode: handoverSplitMode,
    staffs: [
      { phone: currentLiveSession.staff_1_phone, name: currentUser?.full_name || currentLiveSession.staff_1_name, pct: p1Pct, comm: p1Comm, worked_min: elapsedMin },
      { phone: targetUser.phone, name: targetUser.full_name, pct: p2Pct, comm: p2Comm, is_takeover: true, joined_min: elapsedMin }
    ]
  };

  // Đồng bộ lên Firebase
  if (typeof fbSaveLiveSession === 'function') {
    await fbSaveLiveSession(handoverSession);
  }

  // Dọn dẹp phiên của KTV bàn giao
  clearInterval(liveTimerInterval);
  currentLiveSession = null;
  localStorage.removeItem('selena_active_live_session');
  renderLiveSessionUI();
  closeHandoverModal();

  alert(`🤝 BÀN GIAO THÀNH CÔNG!\n\nTour đã được chuyển giao cho ${targetUser.full_name} tiếp quản.\nMàn hình của bạn đã kết thúc ca này và trở về trạng thái sẵn sàng đón tour mới.`);
}
