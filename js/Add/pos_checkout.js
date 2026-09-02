// =============================================================
// TRẠNG THÁI NHÂN LỰC THỜI GIAN THỰC & DROPDOWN THÔNG MINH
// =============================================================
function getBusyStaffPhonesMap() {
  const busyMap = {};
  const activeSessions = getStored('live_sessions_cache', []);
  const now = Date.now();
  
  activeSessions.forEach(sess => {
    if (!sess) return;
    const sId = String(sess.session_id || sess.start_timestamp || '');
    if (dismissedSessionIds.has(sId)) return;
    
    // Tự động bỏ qua các phiên cũ quá 90 phút hoặc quá hạn liệu trình + 30p
    const sessTime = Number(sess.start_timestamp || 0);
    const targetMin = Number(sess.duration_target_min || 60);
    const maxExpiryMs = (targetMin + 30) * 60 * 1000;
    if (sessTime > 0 && (now - sessTime) > Math.max(maxExpiryMs, 90 * 60 * 1000)) {
      return;
    }

    if (sess.active_staff_phone) {
      busyMap[normalizePhone(sess.active_staff_phone)] = sess;
    }
    if (sess.staff_1_phone) {
      busyMap[normalizePhone(sess.staff_1_phone)] = sess;
    }
    if (sess.staffs && Array.isArray(sess.staffs)) {
      sess.staffs.forEach(st => {
        if (st && st.phone) {
          busyMap[normalizePhone(st.phone)] = sess;
        }
      });
    }
  });
  return busyMap;
}

function updateStaffAvailabilityHeader() {
  const subEl = document.getElementById('pos-header-subtitle');
  if (!subEl) return;

  const users = getSortedUsersList();
  const busyMap = getBusyStaffPhonesMap();
  const totalStaff = users.length;
  const busyCount = Object.keys(busyMap).filter(p => users.some(u => normalizePhone(u.phone) === p)).length;
  const freeCount = Math.max(0, totalStaff - busyCount);

  if (busyCount === 0) {
    subEl.innerHTML = `
      <div class="inline-flex items-center gap-2 text-xs font-bold text-[#2E7D6D] font-mono">
        <span class="flex h-2 w-2 relative">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2E7D6D] opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-[#2E7D6D]"></span>
        </span>
        <span>Sẵn sàng phục vụ (${totalStaff} nhân sự)</span>
      </div>
    `;
  } else if (freeCount > 0) {
    subEl.innerHTML = `
      <div class="inline-flex items-center gap-2 text-xs font-bold text-[#E58A7B] font-mono">
        <span class="w-2 h-2 rounded-full bg-[#E58A7B]"></span>
        <span>Đang phục vụ: ${busyCount}/${totalStaff} • Rảnh: ${freeCount} người</span>
      </div>
    `;
  } else {
    subEl.innerHTML = `
      <div class="inline-flex items-center gap-2 text-xs font-bold text-rose-500 font-mono">
        <span class="w-2 h-2 rounded-full bg-rose-500"></span>
        <span>Tất cả ${totalStaff} nhân sự đều đang bận</span>
      </div>
    `;
  }
}

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



// =============================================================
// QUẢN LÝ DỊCH VỤ & MULTI-TAG COMBOBOX POS (DYNAMIC TỪ TB_MENU)
// =============================================================
function initMenuUI() {
  const menu = getValidatedMenu();
  
  // Khởi tạo mặc định Combo 1 nếu giỏ hàng đang trống
  if (!selectedCartItems || selectedCartItems.length === 0) {
    const combo1 = findComboByNumber(menu, 1) || menu[0];
    if (combo1) {
      selectedCartItems = [{ ...combo1 }];
    }
  }

  renderMenuDropdown();
  renderQuickComboButtons();
  renderCartUI();
  restoreLiveSessionIfExists();
  setupGlobalClickOutsideDropdown();
}

function setupGlobalClickOutsideDropdown() {
  document.removeEventListener('click', handleOutsideClickDropdown);
  document.addEventListener('click', handleOutsideClickDropdown);
}

function handleOutsideClickDropdown(e) {
  const popover = document.getElementById('pos-custom-dropdown-popover');
  const container = document.getElementById('pos-tag-container');
  if (!popover || popover.classList.contains('hidden')) return;

  if (!popover.contains(e.target) && !container.contains(e.target)) {
    closeCustomDropdownPopover();
  }
}

function toggleCustomDropdownPopover(e) {
  if (e) {
    // Nếu bấm vào nút xóa chip thì không mở popover
    if (e.target.closest('.pos-chip-remove-btn')) return;
  }
  const popover = document.getElementById('pos-custom-dropdown-popover');
  const chevron = document.getElementById('pos-dropdown-chevron');
  if (!popover) return;

  const isHidden = popover.classList.contains('hidden');
  if (isHidden) {
    renderMenuDropdown();
    popover.classList.remove('hidden');
    if (chevron) chevron.classList.add('rotate-180');
  } else {
    closeCustomDropdownPopover();
  }
}

function closeCustomDropdownPopover() {
  const popover = document.getElementById('pos-custom-dropdown-popover');
  const chevron = document.getElementById('pos-dropdown-chevron');
  if (popover) popover.classList.add('hidden');
  if (chevron) chevron.classList.remove('rotate-180');
}

// =============================================================
// CẤU HÌNH 7 DANH MỤC DỊCH VỤ TRONG DROPDOWN
// =============================================================
const SERVICE_CATEGORIES = [
  { prefix: 'CB', title: '💆 Combo Gội Chính', icon: 'sparkles', iconColor: 'text-[#E58A7B]', itemIcon: '💆' },
  { prefix: 'DV_TM', title: '🌿 Dịch Vụ Làm Thêm / Da Đầu', icon: 'plus-circle', iconColor: 'text-[#2E7D6D]', itemIcon: '🌿' },
  { prefix: 'DV_MS', title: '💆 Massage Trị Liệu & Thư Giãn', icon: 'heart-pulse', iconColor: 'text-[#D97706]', itemIcon: '💆' },
  { prefix: 'DV_WX', title: '✨ Dịch Vụ Waxing', icon: 'scissors', iconColor: 'text-[#9333EA]', itemIcon: '✨' },
  { prefix: 'DV_PL', title: '🩺 Nặn Mụn & Peel Trị Liệu', icon: 'shield-check', iconColor: 'text-[#E11D48]', itemIcon: '🩺' },
  { prefix: 'DV_DT', title: '🧪 Dịch Vụ Detox', icon: 'droplets', iconColor: 'text-[#0284C7]', itemIcon: '🧪' },
  { prefix: 'DV_CY', title: '💎 Cấy Dưỡng Chuyên Sâu', icon: 'gem', iconColor: 'text-[#7C3AED]', itemIcon: '💎' }
];

function renderMenuDropdown() {
  const itemsContainer = document.getElementById('pos-custom-dropdown-items');
  const placeholderEl = document.getElementById('pos-dropdown-placeholder-text');
  const menu = getValidatedMenu();
  const selectedIds = new Set(selectedCartItems.map(item => item.service_id));

  const uiConfig = (typeof DEFAULT_UI_CONFIG !== 'undefined' ? DEFAULT_UI_CONFIG : {});
  const customConfig = (typeof getStored === 'function' ? getStored('ui_config', {}) : {});
  const optSelectText = customConfig.opt_select_service || uiConfig.opt_select_service || '-- Chọn thêm dịch vụ / sản phẩm --';
  const optAllSelectedText = customConfig.opt_select_service_all_selected || uiConfig.opt_select_service_all_selected || '-- Tất cả dịch vụ đã được chọn --';

  const availableItems = menu.filter(m => !selectedIds.has(m.service_id));

  if (placeholderEl) {
    placeholderEl.innerHTML = `
      <span class="flex items-center gap-1.5 truncate">
        <i data-lucide="plus-circle" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
        <span>${availableItems.length === 0 ? optAllSelectedText : optSelectText}</span>
      </span>
    `;
  }

  if (!itemsContainer) return;

  if (availableItems.length === 0) {
    itemsContainer.innerHTML = `
      <div class="p-4 text-center text-xs text-[#A39696] italic">
        ${optAllSelectedText}
      </div>
    `;
    return;
  }

  let html = '';

  SERVICE_CATEGORIES.forEach(cat => {
    const groupItems = availableItems.filter(m => String(m.service_id).startsWith(cat.prefix));
    if (groupItems.length > 0) {
      html += `
        <div class="px-2.5 py-1.5 mt-2 first:mt-0 text-[11px] font-black text-[#7E7272] uppercase tracking-wider bg-[#F7F2EC] rounded-xl flex items-center gap-1.5 sticky top-0 z-10 shadow-2xs">
          <i data-lucide="${cat.icon}" class="w-3.5 h-3.5 ${cat.iconColor}"></i>
          <span>${cat.title}</span>
        </div>
      `;
      html += groupItems.map(m => `
        <div onclick="addCartItemFromDropdown('${m.service_id}')" class="p-2.5 rounded-xl hover:bg-[#FFF0EB] hover:text-[#E58A7B] transition cursor-pointer flex justify-between items-center text-xs font-bold text-[#2D2424] group">
          <span class="truncate flex items-center gap-2">
            <span>${cat.itemIcon}</span> <span>${m.service_name}</span>
          </span>
          <span class="font-mono text-[#7E7272] group-hover:text-[#E58A7B] text-[11px] shrink-0 font-extrabold">
            ${Number(m.price).toLocaleString('vi-VN')} đ • ${m.duration_min}p
          </span>
        </div>
      `).join('');
    }
  });

  // Món khác nếu có
  const mappedPrefixes = SERVICE_CATEGORIES.map(c => c.prefix);
  const otherItems = availableItems.filter(m => !mappedPrefixes.some(p => String(m.service_id).startsWith(p)));
  if (otherItems.length > 0) {
    html += `
      <div class="px-2.5 py-1.5 mt-2 text-[11px] font-black text-[#7E7272] uppercase tracking-wider bg-[#F7F2EC] rounded-xl flex items-center gap-1.5">
        <i data-lucide="sparkles" class="w-3.5 h-3.5 text-[#E58A7B]"></i> <span>✨ Dịch Vụ Khác</span>
      </div>
    `;
    html += otherItems.map(m => `
      <div onclick="addCartItemFromDropdown('${m.service_id}')" class="p-2.5 rounded-xl hover:bg-[#FFF0EB] hover:text-[#E58A7B] transition cursor-pointer flex justify-between items-center text-xs font-bold text-[#2D2424] group">
        <span class="truncate flex items-center gap-2">
          <span>✨</span> <span>${m.service_name}</span>
        </span>
        <span class="font-mono text-[#7E7272] group-hover:text-[#E58A7B] text-[11px] shrink-0 font-extrabold">
          ${Number(m.price).toLocaleString('vi-VN')} đ • ${m.duration_min}p
        </span>
      </div>
    `).join('');
  }

  itemsContainer.innerHTML = html;
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

function renderQuickComboButtons() {
  const container = document.getElementById('pos-quick-combos');
  if (!container) return;

  const menu = getValidatedMenu();
  const selectedIds = new Set(selectedCartItems.map(item => item.service_id));

  // Chỉ lấy Combo 1 đến Combo 5 (ẩn Combo Bé khỏi hàng nút chọn nhanh)
  const quickNumbers = [1, 2, 3, 4, 5];

  container.innerHTML = quickNumbers.map(num => {
    const item = findComboByNumber(menu, num);
    if (!item) return '';

    const isSelected = selectedIds.has(item.service_id);

    return `
      <button type="button" onclick="toggleQuickCombo('${item.service_id}')" class="px-3.5 py-2 rounded-2xl text-xs font-extrabold border transition-all duration-200 active:scale-95 cursor-pointer shadow-2xs ${isSelected ? 'bg-[#FFF0EB] text-[#E58A7B] border-[#E58A7B] ring-2 ring-[#E58A7B]/40 font-black shadow-xs' : 'bg-white text-[#5D5050] border-[#E8E1D7] hover:bg-[#FAF6F1] hover:border-[#E58A7B]/40 hover:text-[#E58A7B]'}">
        ${isSelected ? '✓ ' : ''}Combo ${num}
      </button>
    `;
  }).join('');
}

function isComboItem(item) {
  if (!item) return false;
  const id = String(item.service_id || '');
  const name = String(item.service_name || '').toLowerCase();
  const cat = String(item.category || '').toLowerCase();
  return id.startsWith('CB') || cat === 'combo' || name.includes('combo');
}

function toggleQuickCombo(serviceId) {
  const menu = getValidatedMenu();
  const item = menu.find(m => m.service_id === serviceId);
  if (!item) return;

  const existsIndex = selectedCartItems.findIndex(i => i.service_id === serviceId);
  if (existsIndex >= 0) {
    // Đã chọn đúng combo này -> Bấm lại để hủy chọn (Toggle)
    selectedCartItems.splice(existsIndex, 1);
  } else {
    // Chưa chọn combo này -> Xóa combo cũ (nếu có) và thay bằng combo mới
    selectedCartItems = selectedCartItems.filter(i => !isComboItem(i));
    selectedCartItems.unshift({ ...item });
  }

  renderMenuDropdown();
  renderQuickComboButtons();
  renderCartUI();
  updatePOSCalculations();
}

function addCartItemFromDropdown(serviceId) {
  const menu = getValidatedMenu();
  const item = menu.find(m => m.service_id === serviceId);
  if (!item) return;

  if (isComboItem(item)) {
    // Nếu là combo -> Xóa combo cũ và thay thế bằng combo mới
    selectedCartItems = selectedCartItems.filter(i => !isComboItem(i));
    selectedCartItems.unshift({ ...item });
  } else {
    // Nếu là dịch vụ lẻ -> Thêm vào giỏ (cho phép chọn nhiều)
    if (!selectedCartItems.some(i => i.service_id === serviceId)) {
      selectedCartItems.push({ ...item });
    }
  }

  closeCustomDropdownPopover();
  renderMenuDropdown();
  renderQuickComboButtons();
  renderCartUI();
  updatePOSCalculations();
}

function addSelectedServiceFromDropdown() {
  toggleCustomDropdownPopover();
}

function removeCartItem(serviceId, e) {
  if (e) e.stopPropagation();
  selectedCartItems = selectedCartItems.filter(i => i.service_id !== serviceId);
  renderMenuDropdown();
  renderQuickComboButtons();
  renderCartUI();
  updatePOSCalculations();
}

function renderCartUI() {
  const chipsContainer = document.getElementById('pos-cart-chips-list');
  const countBadge = document.getElementById('pos-cart-count-badge');
  const totalPriceEl = document.getElementById('pos-cart-total-price');
  const totalDurationEl = document.getElementById('pos-cart-total-duration');
  if (!chipsContainer) return;

  if (selectedCartItems.length === 0) {
    chipsContainer.innerHTML = '';
    if (countBadge) countBadge.innerText = '0 dịch vụ';
    if (totalPriceEl) totalPriceEl.innerText = '0 đ';
    if (totalDurationEl) totalDurationEl.innerText = '0 phút';
    return;
  }

  if (countBadge) countBadge.innerText = `${selectedCartItems.length} dịch vụ`;

  let totalPrice = 0;
  let totalDuration = 0;

  chipsContainer.innerHTML = selectedCartItems.map(item => {
    const price = Number(item.price) || 0;
    const dur = Number(item.duration_min) || 0;
    totalPrice += price;
    totalDuration += dur;

    const isCombo = String(item.service_id || '').startsWith('CB') || String(item.service_name || '').toLowerCase().includes('combo');

    return `
            <div class="inline-flex items-center gap-2.5 px-3 py-0.5 rounded-2xl bg-gradient-to-r from-[#FFF0EB] to-[#FFF6F3] border border-[#E58A7B]/35 text-[#2D2424] shadow-2xs hover:shadow-xs transition animate-in zoom-in-95">
        <!-- Icon nằm giữa 2 dòng text -->
        <div class="text-base sm:text-lg flex items-center justify-center shrink-0">
          ${isCombo ? '💆' : '✨'}
        </div>
        <!-- Cụm 2 dòng text: Tên ở trên, Giá & Phút ở dưới -->
        <div class="min-w-0 flex-1">
          <div class="font-black text-[11px] text-[#2D2424] leading-snug truncate">
            ${item.service_name}
          </div>
          <div class="text-[11px] font-mono text-[#7E7272] mt-0.5 flex items-center gap-1.5 leading-tight">
            <span class="text-[#E58A7B] font-extrabold">${price.toLocaleString('vi-VN')} đ</span>
            <span>•</span>
            <span class="text-[#2E7D6D] font-bold">${dur}p</span>
          </div>
        </div>
        <!-- Nút xóa ✕ -->
        <button type="button" onclick="removeCartItem('${item.service_id}', event)" class="pos-chip-remove-btn ml-1 p-1 text-[#A39696] hover:text-rose-600 hover:bg-rose-100 rounded-full transition cursor-pointer shrink-0" title="Xóa dịch vụ này">
          <i data-lucide="x" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;
  }).join('');

  if (totalPriceEl) totalPriceEl.innerText = `${totalPrice.toLocaleString('vi-VN')} đ`;
  if (totalDurationEl) totalDurationEl.innerText = `${totalDuration} phút`;

  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

function updatePOSStaffInfo() {
  const users = getSortedUsersList();
  const s1Select = document.getElementById('pos-staff1-select');
  const lockIcon = document.getElementById('pos-staff1-lock-icon');
  const roleHint = document.getElementById('pos-staff1-role-hint');
  const isOwner = currentUser && isUserOwner(currentUser);
  const busyMap = (typeof getBusyStaffPhonesMap === 'function') ? getBusyStaffPhonesMap() : {};

  if (s1Select) {
    if (isOwner) {
      // 👑 Chủ tiệm / Admin: Toàn quyền chọn bất kỳ ai làm KTV 1
      s1Select.disabled = false;
      if (lockIcon) lockIcon.classList.add('hidden');
      if (roleHint) roleHint.classList.add('hidden');

      const availableUsers = users.filter(u => !busyMap[normalizePhone(u.phone)]);
      if (availableUsers.length === 0) {
        s1Select.innerHTML = '<option value="">🔴 Tất cả KTV đều đang bận ca</option>';
      } else {
        const curVal = s1Select.value;
        s1Select.innerHTML = availableUsers.map(u => {
          const isSelected = curVal ? (normalizePhone(u.phone) === normalizePhone(curVal)) : false;
          return `<option value="${u.phone}" ${isSelected ? 'selected' : ''}>${u.full_name}</option>`;
        }).join('');
      }
    } else if (currentUser) {
      // 👩‍🦰 KTV: Khóa cố định ô KTV 1 vào tài khoản của KTV này
      s1Select.disabled = true;
      if (lockIcon) lockIcon.classList.remove('hidden');
      if (roleHint) roleHint.classList.remove('hidden');
      s1Select.innerHTML = `<option value="${currentUser.phone}" selected>${currentUser.full_name}</option>`;
    }
  }

  updateStaffAvailabilityHeader();

  updateStaff1CommissionPreview();
  renderExtraStaffUI();
}

function onStaff1SelectChange() {
  updateStaff1CommissionPreview();
  renderExtraStaffUI();
}

function updateStaff1CommissionPreview() {
  const commEl = document.getElementById('pos-staff1-comm-preview');
  if (!commEl) return;
  const totalPrice = selectedCartItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const totalStaffCount = 1 + (extraStaffList ? extraStaffList.length : 0);
  const staff1Pct = Math.round(100 / totalStaffCount);
  const commValue = Math.round((totalPrice * 0.1) * (staff1Pct / 100));
  commEl.innerText = `+${commValue.toLocaleString('vi-VN')} đ (${staff1Pct}%)`;
}

function addExtraStaff() {
  const users = getSortedUsersList();
  const s1Phone = document.getElementById('pos-staff1-select')?.value || (currentUser?.phone);
  const busyMap = (typeof getBusyStaffPhonesMap === 'function') ? getBusyStaffPhonesMap() : {};
  
  const chosenPhones = new Set([
    normalizePhone(s1Phone),
    ...extraStaffList.map(s => normalizePhone(s.phone))
  ]);

  const availableStaffs = users.filter(u => !busyMap[normalizePhone(u.phone)] && !chosenPhones.has(normalizePhone(u.phone)));

  if (availableStaffs.length === 0) {
    alert('Không còn Kỹ Thuật Viên nào khác đang rảnh để thêm vào ca này!');
    return;
  }

  const newStaff = availableStaffs[0];
  extraStaffList.push({
    phone: newStaff.phone,
    full_name: newStaff.full_name,
    staff_id: newStaff.staff_id || `KTV0${extraStaffList.length + 2}`,
    user_id: newStaff.user_id || newStaff.phone
  });

  renderExtraStaffUI();
  updateStaff1CommissionPreview();
}

function removeExtraStaff(idx) {
  extraStaffList.splice(idx, 1);
  renderExtraStaffUI();
  updateStaff1CommissionPreview();
}

function onExtraStaffChange(idx, newPhone) {
  const users = getSortedUsersList();
  const target = users.find(u => normalizePhone(u.phone) === normalizePhone(newPhone));
  if (target && extraStaffList[idx]) {
    extraStaffList[idx] = {
      phone: target.phone,
      full_name: target.full_name,
      staff_id: target.staff_id || `KTV0${idx + 2}`,
      user_id: target.user_id || target.phone
    };
  }
  renderExtraStaffUI();
  updateStaff1CommissionPreview();
}

function renderExtraStaffUI() {
  const container = document.getElementById('pos-extra-staff-container');
  if (!container) return;

  if (extraStaffList.length === 0) {
    container.innerHTML = '';
    return;
  }

  const users = getSortedUsersList();
  const s1Phone = document.getElementById('pos-staff1-select')?.value || (currentUser?.phone);
  const totalPrice = selectedCartItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const totalStaffCount = 1 + extraStaffList.length;
  const eachPct = Math.round(100 / totalStaffCount);
  const eachComm = Math.round((totalPrice * 0.1) * (eachPct / 100));

  container.innerHTML = extraStaffList.map((s, idx) => {
    const ktvNum = idx + 2;
    return `
      <div class="p-3.5 rounded-2xl bg-[#FFF5F2]/80 border border-[#F5DCD5] space-y-2 animate-in fade-in zoom-in-95">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-[#E58A7B] flex items-center gap-1.5">
            <i data-lucide="user-check" class="w-3.5 h-3.5"></i>
            <span class="font-extrabold text-[#2D2424]">KTV ${ktvNum} (Phụ):</span>
          </span>
          <div class="flex items-center gap-2">
            <span class="text-xs font-extrabold text-[#2E7D6D] bg-[#E8F8F5] px-2.5 py-0.5 rounded-full border border-[#B7EBDD]">
              +${eachComm.toLocaleString('vi-VN')} đ (${eachPct}%)
            </span>
            <button type="button" onclick="removeExtraStaff(${idx})" class="p-1 text-[#A39696] hover:text-rose-600 hover:bg-rose-100 rounded-full transition cursor-pointer" title="Xóa KTV này">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
        <select onchange="onExtraStaffChange(${idx}, this.value)" class="w-full bg-white border border-[#EFE8DF] rounded-xl p-3 text-[#2D2424] font-bold text-sm focus:outline-none focus:border-[#E58A7B] cursor-pointer">
          ${users.map(u => {
            const isSelected = normalizePhone(u.phone) === normalizePhone(s.phone);
            return `<option value="${u.phone}" ${isSelected ? 'selected' : ''}>${u.full_name}</option>`;
          }).join('')}
        </select>
      </div>
    `;
  }).join('');

  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

function updatePOSCalculations() {
  const totalPrice = selectedCartItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const totalDuration = selectedCartItems.reduce((sum, item) => sum + (Number(item.duration_min) || 0), 0);

  const totalPriceEl = document.getElementById('pos-cart-total-price');
  const totalDurationEl = document.getElementById('pos-cart-total-duration');
  if (totalPriceEl) totalPriceEl.innerText = `${totalPrice.toLocaleString('vi-VN')} đ`;
  if (totalDurationEl) totalDurationEl.innerText = `${totalDuration} phút`;
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

  // Mở khóa ô tên và tháng sinh cho khách mới
  const nameInput = document.getElementById('pos-customer-name');
  if (nameInput) {
    nameInput.disabled = false;
    nameInput.classList.remove('bg-[#EFE8DF]', 'text-[#7E7272]', 'cursor-not-allowed', 'opacity-85', 'pointer-events-none', 'select-none');
  }
  const bSelect = document.getElementById('pos-birth-month');
  if (bSelect) {
    bSelect.disabled = false;
    bSelect.classList.remove('bg-[#EFE8DF]', 'text-[#7E7272]', 'cursor-not-allowed', 'opacity-85', 'pointer-events-none', 'select-none');
  }
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

  const isOwner = typeof isUserOwner === 'function' ? isUserOwner(currentUser) : false;
  const nameInput = document.getElementById('pos-customer-name');
  
  if (nameInput) {
    nameInput.value = cust.customer_name || '';
    
    // Kiểm tra tên chính thức
    const custNameLower = String(cust.customer_name || '').trim().toLowerCase();
    const isGenericName = !custNameLower || custNameLower === 'khách hàng' || custNameLower === 'khách vãng lai' || custNameLower === 'khach hang' || custNameLower === 'khach vang lai';

    if (isOwner) {
      // 👑 Admin / Chủ tiệm: Toàn quyền chỉnh sửa tên
      nameInput.disabled = false;
      nameInput.classList.remove('bg-[#EFE8DF]', 'text-[#7E7272]', 'cursor-not-allowed', 'opacity-85', 'pointer-events-none', 'select-none');
    } else {
      // 👩‍🦰 Staff / KTV:
      if (!isGenericName) {
        // Khách đã có tên chính thức trong hệ thống -> Khóa không cho KTV sửa
        nameInput.disabled = true;
        nameInput.classList.add('bg-[#EFE8DF]', 'text-[#7E7272]', 'cursor-not-allowed', 'opacity-85', 'pointer-events-none', 'select-none');
      } else {
        // Khách vãng lai hoặc để trống -> Mở cho KTV gõ tên
        nameInput.disabled = false;
        nameInput.classList.remove('bg-[#EFE8DF]', 'text-[#7E7272]', 'cursor-not-allowed', 'opacity-85', 'pointer-events-none', 'select-none');
      }
    }
  }
  
  const nameBadge = document.getElementById('pos-cust-name-badge');
  if (nameBadge) nameBadge.innerText = cust.customer_name || 'Khách hàng';

  let custMonth = cust.birth_month || parseBirthMonth(cust.birthday);
  const bSelect = document.getElementById('pos-birth-month');
  if (bSelect) {
    bSelect.value = (custMonth && custMonth >= 1 && custMonth <= 12) ? String(custMonth) : '';
    if (isOwner) {
      bSelect.disabled = false;
      bSelect.classList.remove('bg-[#EFE8DF]', 'text-[#7E7272]', 'cursor-not-allowed', 'opacity-85', 'pointer-events-none', 'select-none');
    } else {
      if (custMonth && custMonth >= 1 && custMonth <= 12) {
        bSelect.disabled = true;
        bSelect.classList.add('bg-[#EFE8DF]', 'text-[#7E7272]', 'cursor-not-allowed', 'opacity-85', 'pointer-events-none', 'select-none');
      } else {
        bSelect.disabled = false;
        bSelect.classList.remove('bg-[#EFE8DF]', 'text-[#7E7272]', 'cursor-not-allowed', 'opacity-85', 'pointer-events-none', 'select-none');
      }
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
  if (!selectedCartItems || selectedCartItems.length === 0) {
    alert('Vui lòng chọn ít nhất một dịch vụ trước khi bắt đầu tour gội!');
    return;
  }

  const users = getSortedUsersList();
  const totalPrice = selectedCartItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const totalDuration = selectedCartItems.reduce((sum, item) => sum + (Number(item.duration_min) || 0), 0);
  const serviceDisplayName = selectedCartItems.map(i => i.service_name).join(' + ');
  const primaryServiceId = selectedCartItems[0].service_id;

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
    service_id: primaryServiceId,
    service_name: serviceDisplayName,
    selected_items: selectedCartItems,
    price: totalPrice,
    duration_target_min: totalDuration || 45,
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

  // Luôn bắn phiên tour lên Firebase Realtime
  if (typeof fbSaveLiveSession === 'function') {
    fbSaveLiveSession(currentLiveSession);
  }

  const myPhone = (currentUser && currentUser.phone) ? normalizePhone(currentUser.phone) : '';
  const isCreatorParticipating = allStaffs.some(s => normalizePhone(s.phone) === myPhone);

  if (isCreatorParticipating) {
    // Nếu người tạo có trực tiếp tham gia làm tour -> Mở đồng hồ đếm giờ trên máy này
    localStorage.setItem('selena_active_live_session', JSON.stringify(currentLiveSession));
    renderLiveSessionUI();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.85 } });
  } else {
    // Nếu Admin phân công cho KTV khác -> Màn hình Admin giữ form trống để tiếp tục đón khách mới
    const assignedNames = allStaffs.map(s => s.name).join(' & ');
    alert(`✅ ĐÃ PHÂN CÔNG TOUR THÀNH CÔNG!\n\n• Dịch vụ: ${service.service_name}\n• Khách hàng: ${name}\n• KTV phục vụ: ${assignedNames}\n\nTour đã được gửi đến điện thoại của KTV để bắt đầu phục vụ.`);
    
    currentLiveSession = null;
    localStorage.removeItem('selena_active_live_session');
    extraStaffList = [];
    document.getElementById('pos-customer-phone').value = '';
    document.getElementById('pos-customer-name').value = '';
    document.getElementById('pos-customer-card').classList.add('hidden');
    useVoucher = false;
    renderExtraStaffUI();
    updatePOSStaffInfo();
    renderLiveSessionUI();
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.85 } });
  }
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

  const sNameEl = document.getElementById('live-service-name');
  if (sNameEl) sNameEl.innerText = currentLiveSession.service_name || '';

  const custTextEl = document.getElementById('live-customer-name-text');
  if (custTextEl) custTextEl.innerText = currentLiveSession.customer_name || 'Khách vãng lai';

  const custBadgeEl = document.getElementById('live-customer-badge');
  if (custBadgeEl) custBadgeEl.innerText = currentLiveSession.customer_name || 'Khách vãng lai';

  const startTimeEl = document.getElementById('live-start-time-text');
  if (startTimeEl) startTimeEl.innerText = currentLiveSession.start_time || '';

  const targetTimeEl = document.getElementById('live-target-time-text');
  if (targetTimeEl) targetTimeEl.innerText = (currentLiveSession.duration_target_min || 0) + ' phút';

  const chipsContainer = document.getElementById('live-staff-chips-container');
  if (chipsContainer) {
    const staffs = currentLiveSession.staffs || [
      { phone: currentLiveSession.staff_1_phone, name: currentLiveSession.staff_1_name, pct: 100 }
    ];
    
    const cUser = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : null;
    const myPhone = (cUser && cUser.phone) ? normalizePhone(cUser.phone) : '';

    const isKtvChinh = staffs.length > 0 && normalizePhone(staffs[0].phone) === myPhone;
    const myStaffEntry = staffs.find(s => normalizePhone(s.phone) === myPhone);
    const isKtvPhu = Boolean(!isKtvChinh && myStaffEntry);
    const alreadyLeft = myStaffEntry && myStaffEntry.left_early;

    const leaveEarlyBtn = document.getElementById('btn-live-leave-early');
    if (leaveEarlyBtn) {
      if (isKtvPhu && !alreadyLeft) {
        leaveEarlyBtn.classList.remove('hidden');
      } else {
        leaveEarlyBtn.classList.add('hidden');
      }
    }

    chipsContainer.innerHTML = staffs.map((s, idx) => `
      <button type="button" onclick="openSwapStaffModal()" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#EFE8DF] hover:border-[#E58A7B] text-xs font-bold text-[#2D2424] transition active:scale-95 cursor-pointer">
        <span class="w-2 h-2 rounded-full ${idx === 0 ? 'bg-[#2E7D6D]' : 'bg-[#E58A7B]'}"></span>
        <span>${s.name}</span>
        ${s.left_early 
          ? `<span class="text-[9px] font-bold text-[#D35400] bg-[#FFF0EB] px-1.5 py-0.5 rounded-md">Rời p.${s.left_min}</span>` 
          : `<span class="text-[10px] font-extrabold text-[#7E7272] bg-[#FAF6F1] px-1.5 py-0.5 rounded-md">${s.pct || Math.round(100/staffs.length)}%</span>`
        }
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
      hintEl.innerText = '✨ Đã hoàn thành liệu trình';
      hintEl.className = 'text-xs text-[#2E7D6D] font-bold animate-pulse';
    } else {
      hintEl.innerText = `⏱️ Còn khoảng ${targetMin - elapsedMin} phút theo liệu trình`;
      hintEl.className = 'text-xs text-[#2E7D6D] font-medium';
    }
  }
}

function cancelLiveSession() {
  if (confirm('Bạn có chắc muốn hủy tour đang phục vụ này không?')) {
    const targetSessionId = currentLiveSession?.session_id;
    if (currentLiveSession && typeof markSessionDismissed === 'function') {
      markSessionDismissed(currentLiveSession);
    }
    localStorage.removeItem('selena_active_live_session');
    currentLiveSession = null;
    clearInterval(liveTimerInterval);
    if (typeof fbClearLiveSession === 'function' && targetSessionId) {
      fbClearLiveSession(targetSessionId);
    }
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
  setTimeout(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, 50);
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
  const cUser = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : null;
  const isOwner = cUser ? (typeof isUserOwner === 'function' ? isUserOwner(cUser) : (cUser.role === 'admin' || cUser.role === 'owner')) : false;
  const targetMin = currentLiveSession?.duration_target_min || 50;

  container.innerHTML = tempSwapStaffs.map((item, idx) => {
    const isFirst = idx === 0;
    const isLocked = isFirst && !isOwner;
    const busyMap = getBusyStaffPhonesMap();
    const currentTourId = currentLiveSession?.session_id;
    const usedOtherPhones = tempSwapStaffs.filter((_, i) => i !== idx).map(s => normalizePhone(s.phone));
    
    const selectable = users.filter(u => {
      const uPhone = normalizePhone(u.phone);
      if (usedOtherPhones.includes(uPhone)) return false;
      if (uPhone === normalizePhone(item.phone)) return true;
      const busySess = busyMap[uPhone];
      if (busySess && busySess.session_id !== currentTourId) return false;
      return true;
    });

    const joinedMin = item.joined_min || 0;
    const leftMin = item.left_min || targetMin;
    const isEarlyLeave = leftMin < targetMin;

    return `
      <div class="relative p-3 rounded-2xl bg-[#FAF6F1] border border-[#F0EAE1] space-y-2">
        <div class="flex justify-between items-center pr-7">
          <div class="text-xs font-bold text-[#2D2424] flex items-center gap-1.5 flex-wrap">
            ${isLocked ? '<i data-lucide="lock" class="w-3.5 h-3.5 text-[#E58A7B]"></i>' : ''}
            <span class="text-[#E58A7B] font-extrabold">${isFirst ? 'Chính' : 'Phụ'}:</span>
            <span>${item.name || ''}</span>
          </div>
          <span class="text-[11px] font-extrabold text-[#2E7D6D] bg-[#E8F8F5] px-2 py-0.5 rounded-full font-mono" id="swap-item-comm-${idx}">...</span>
        </div>

        <select ${isLocked ? 'disabled' : ''} onchange="onSwapStaffSelectChange(${idx}, this.value)" class="w-full bg-white border border-[#EFE8DF] rounded-xl p-2.5 text-xs font-bold text-[#2D2424] focus:outline-none focus:border-[#E58A7B] ${isLocked ? 'disabled:bg-[#F7F2EC] disabled:opacity-90 cursor-not-allowed' : 'cursor-pointer'}">
          ${selectable.map(u => `
            <option value="${u.phone}" ${normalizePhone(u.phone) === normalizePhone(item.phone) ? 'selected' : ''}>${u.full_name}</option>
          `).join('')}
        </select>

        ${!isFirst ? `
          <!-- Tinh chỉnh thời gian bắt đầu của KTV phụ -->
          <div class="pt-1.5 border-t border-[#F0EAE1]/80 flex items-center justify-between gap-2 text-[11px]">
            <div class="flex items-center gap-1.5">
              <span class="text-[#7E7272]">⏱️ Làm từ phút:</span>
              <input type="number" min="0" max="${targetMin - 1}" value="${joinedMin}" onchange="onSwapStaffJoinedMinChange(${idx}, this.value)" class="w-12 text-center bg-white border border-[#E58A7B]/40 rounded-lg p-1 text-xs font-bold font-mono text-[#2D2424] focus:outline-none focus:border-[#E58A7B]">
              <span class="text-[10px] text-[#A39696] font-mono">/ ${targetMin}p</span>
            </div>
            ${s.left_early ? `<span class="text-[10px] font-bold text-[#D35400] bg-[#FFF0EB] px-2 py-0.5 rounded-full">Đã rời ca phút ${s.left_min}</span>` : ''}
          </div>

          <button type="button" onclick="removeStaffInSwapModal(${idx})" title="Xóa KTV này khỏi tour" class="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-white border border-rose-300 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center cursor-pointer active:scale-90 transition">
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

function onSwapStaffJoinedMinChange(idx, val) {
  const targetMin = currentLiveSession?.duration_target_min || 50;
  const minVal = Math.max(0, Math.min(targetMin - 1, parseInt(val, 10) || 0));
  tempSwapStaffs[idx].joined_min = minVal;
  if (!tempSwapStaffs[idx].left_early) {
    tempSwapStaffs[idx].left_min = targetMin;
  }
  tempSwapStaffs[idx].is_midway = minVal > 0;
  renderSwapModalStaffUI();
  updateSwapPreviewDisplay();
}

function onSwapStaffLeftMinChange(idx, val) {
  const targetMin = currentLiveSession?.duration_target_min || 50;
  const joinedMin = tempSwapStaffs[idx].joined_min || 0;
  const leftVal = Math.max(joinedMin + 1, Math.min(targetMin, parseInt(val, 10) || targetMin));
  tempSwapStaffs[idx].left_min = leftVal;
  renderSwapModalStaffUI();
  updateSwapPreviewDisplay();
}

function toggleSwapStaffEarlyLeave(idx, isChecked) {
  const targetMin = currentLiveSession?.duration_target_min || 50;
  const elapsedSec = Math.max(1, Math.floor((Date.now() - currentLiveSession.start_timestamp) / 1000));
  const elapsedMin = Math.floor(elapsedSec / 60);

  if (isChecked) {
    tempSwapStaffs[idx].left_min = Math.max((tempSwapStaffs[idx].joined_min || 0) + 1, Math.min(targetMin - 1, elapsedMin));
  } else {
    tempSwapStaffs[idx].left_min = targetMin;
  }
  renderSwapModalStaffUI();
  updateSwapPreviewDisplay();
}

function addStaffInSwapModal() {
  const users = getSortedUsersList();
  const busyMap = getBusyStaffPhonesMap();
  const currentTourId = currentLiveSession?.session_id;
  const usedPhones = tempSwapStaffs.map(s => normalizePhone(s.phone));
  const available = users.filter(u => {
    const uPhone = normalizePhone(u.phone);
    if (usedPhones.includes(uPhone)) return false;
    const busySess = busyMap[uPhone];
    if (busySess && busySess.session_id !== currentTourId) return false;
    return true;
  });

  if (available.length === 0) {
    alert('Không còn KTV nào khác đang rảnh để thêm vào tour này!');
    return;
  }

  const targetMin = currentLiveSession?.duration_target_min || 50;
  const elapsedSec = Math.max(1, Math.floor((Date.now() - currentLiveSession.start_timestamp) / 1000));
  const elapsedMin = Math.max(1, Math.min(targetMin - 1, Math.floor(elapsedSec / 60)));

  const next = available[0];
  tempSwapStaffs.push({
    phone: next.phone,
    name: next.full_name,
    user_id: next.user_id || next.phone,
    staff_id: next.staff_id || (isUserOwner(next) ? 'FOUNDER_01' : 'KTV'),
    pct: 0,
    joined_min: elapsedMin,
    left_min: targetMin,
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
  const targetMin = currentLiveSession.duration_target_min || 50;
  const tourPrice = currentLiveSession.price || 0;

  const cUser = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : null;
  const isAdmin = cUser ? (typeof isUserOwner === 'function' ? isUserOwner(cUser) : (cUser.role === 'admin' || cUser.role === 'owner')) : false;
  const myPhone = (cUser && cUser.phone) ? normalizePhone(cUser.phone) : '';

  const summaryContainer = document.getElementById('swap-summary-pct-list');
  let html = '';

  if (count === 1) {
    const s = tempSwapStaffs[0];
    s.pct = 100;
    s.joined_min = 0;
    s.left_min = targetMin;
    const staffObj = users.find(u => normalizePhone(u.phone) === normalizePhone(s.phone));
    const rate = (staffObj && parsePercentage(staffObj?.commission_rate) > 0) ? parsePercentage(staffObj?.commission_rate) : 10;
    s.comm_vnd = Math.round(tourPrice * (rate / 100));

    const isMe = normalizePhone(s.phone) === myPhone;
    const badgeText = (isAdmin || isMe) ? `100% • +${s.comm_vnd.toLocaleString('vi-VN')} đ` : '100%';
    const itemCommBadge = document.getElementById('swap-item-comm-0');
    if (itemCommBadge) itemCommBadge.innerText = badgeText;

    html = `
      <div class="space-y-1.5">
        <div class="text-[11px] font-extrabold text-[#2D2424] uppercase tracking-wider">🏆 Tổng thu nhập trong tour này:</div>
        <div class="flex justify-between items-center text-xs text-[#7E7272]">
          <span>• Làm trọn tour (${targetMin} phút):</span>
          <span class="font-bold text-[#2D2424] font-mono">100%</span>
        </div>
        <div class="flex justify-between items-center pt-2 border-t border-[#F0EAE1] font-bold text-xs">
          <span class="text-[#2D2424]">Tổng tiền nhận:</span>
          <span class="text-sm font-extrabold text-[#2E7D6D] font-mono">+${s.comm_vnd.toLocaleString('vi-VN')} đ</span>
        </div>
      </div>
    `;
  } else if (currentSplitMode === 'timer') {
    // Thuật toán Boundary Intervals Partition Đa Giai Đoạn Linh Hoạt
    tempSwapStaffs[0].joined_min = 0;
    tempSwapStaffs[0].left_min = targetMin;

    const boundaries = new Set([0, targetMin]);
    tempSwapStaffs.forEach(s => {
      const jMin = Math.max(0, Math.min(targetMin - 1, s.joined_min || 0));
      const lMin = Math.max(jMin + 1, Math.min(targetMin, s.left_min || targetMin));
      s.joined_min = jMin;
      s.left_min = lMin;
      boundaries.add(jMin);
      boundaries.add(lMin);
    });

    const sortedBounds = Array.from(boundaries).sort((a, b) => a - b);
    const stages = [];
    const staffEffectiveMins = tempSwapStaffs.map(() => 0);
    const staffTotalEarns = tempSwapStaffs.map(() => 0);

    for (let i = 0; i < sortedBounds.length - 1; i++) {
      const tStart = sortedBounds[i];
      const tEnd = sortedBounds[i + 1];
      const dur = tEnd - tStart;
      if (dur <= 0) continue;

      const activeStaffIndices = [];
      tempSwapStaffs.forEach((s, sIdx) => {
        if (s.joined_min <= tStart && s.left_min >= tEnd) {
          activeStaffIndices.push(sIdx);
        }
      });

      const nActive = activeStaffIndices.length;
      if (nActive > 0) {
        const perStaffDur = dur / nActive;
        const stageWeight = dur / targetMin;
        const stagePrice = tourPrice * stageWeight;

        const stageEqualPct = Math.floor(100 / nActive);
        const stageRemPct = 100 - (stageEqualPct * nActive);

        const stageStaffDetails = activeStaffIndices.map((sIdx, pos) => {
          const s = tempSwapStaffs[sIdx];
          const staffObj = users.find(u => normalizePhone(u.phone) === normalizePhone(s.phone));
          const staffRate = (staffObj && parsePercentage(staffObj?.commission_rate) > 0) ? parsePercentage(staffObj?.commission_rate) : 10;
          
          const myStagePct = stageEqualPct + (pos === 0 ? stageRemPct : 0);
          const myStageComm = Math.round(stagePrice * (staffRate / 100) * (myStagePct / 100));

          staffEffectiveMins[sIdx] += perStaffDur;
          staffTotalEarns[sIdx] += myStageComm;

          return {
            staff_index: sIdx,
            staff_name: s.name,
            staff_phone: s.phone,
            stage_pct: myStagePct,
            stage_comm: myStageComm
          };
        });

        stages.push({
          stage_num: stages.length + 1,
          start: tStart,
          end: tEnd,
          duration: dur,
          active_staffs: stageStaffDetails
        });
      }
    }

    // Tính % và tổng hoa hồng chung của toàn tour
    let totalPctAssigned = 0;
    tempSwapStaffs.forEach((s, idx) => {
      const effMin = staffEffectiveMins[idx];
      s.pct = Math.round((effMin / targetMin) * 100);
      s.comm_vnd = staffTotalEarns[idx];
      totalPctAssigned += s.pct;
    });

    if (tempSwapStaffs.length > 0 && totalPctAssigned !== 100) {
      tempSwapStaffs[0].pct += (100 - totalPctAssigned);
    }

    // Cập nhật huy hiệu trên từng thẻ KTV
    tempSwapStaffs.forEach((s, idx) => {
      const isMe = normalizePhone(s.phone) === myPhone;
      const badgeText = (isAdmin || isMe) ? `${s.pct}% • +${s.comm_vnd.toLocaleString('vi-VN')} đ` : `${s.pct}%`;
      const itemCommBadge = document.getElementById(`swap-item-comm-${idx}`);
      if (itemCommBadge) itemCommBadge.innerText = badgeText;
    });

    // Render danh sách giai đoạn
    const stageColors = ['#E58A7B', '#2E7D6D', '#D35400', '#6366F1', '#EC4899'];
    const myStaffEntry = tempSwapStaffs.find(s => normalizePhone(s.phone) === myPhone) || tempSwapStaffs[0];

    html = `
      <div class="space-y-2">
        ${stages.map((stg, sIdx) => {
          const color = stageColors[sIdx % stageColors.length];
          return `
            <div class="p-2.5 rounded-xl bg-white border border-[#F0EAE1] space-y-1">
              <div class="flex justify-between items-center text-[11px] font-bold" style="color: ${color}">
                <span>🔹 Giai đoạn ${stg.stage_num}: Phút ${stg.start} ➔ ${stg.end} (${stg.duration} phút)</span>
                <span class="text-[#7E7272] font-normal text-[10px] font-mono">${stg.active_staffs.length} KTV</span>
              </div>
              ${stg.active_staffs.map(st => {
                const isMe = normalizePhone(st.staff_phone) === myPhone;
                return `
                  <div class="flex justify-between items-center text-[11px] text-[#7E7272] pl-2">
                    <span>• ${st.staff_name}:</span>
                    <span class="font-semibold text-[#2D2424] font-mono">${(isAdmin || isMe) ? `${st.stage_pct}% (+${st.stage_comm.toLocaleString('vi-VN')} đ)` : `${st.stage_pct}%`}</span>
                  </div>
                `;
              }).join('')}
            </div>
          `;
        }).join('')}

        <div class="pt-1.5 border-t border-[#F0EAE1] space-y-1.5">
          <div class="text-[11px] font-extrabold text-[#2D2424] uppercase tracking-wider">🏆 Tổng thu nhập trong tour này:</div>
          ${!isAdmin ? `
            <!-- Giao diện KTV: Liệt kê từng giai đoạn của chính mình và Tổng tiền nhận -->
            <div class="space-y-1 pl-1 text-xs">
              ${stages.map(stg => {
                const myStage = stg.active_staffs.find(st => normalizePhone(st.staff_phone) === myPhone);
                if (!myStage) {
                  return `
                    <div class="flex justify-between items-center text-[#A39696]">
                      <span>• Giai đoạn ${stg.stage_num} (${stg.duration}p):</span>
                      <span class="font-mono text-[11px]">Không tham gia</span>
                    </div>
                  `;
                }
                return `
                  <div class="flex justify-between items-center text-[#7E7272]">
                    <span>• Giai đoạn ${stg.stage_num} (${stg.duration}p):</span>
                    <span class="font-bold text-[#2D2424] font-mono">+${myStage.stage_comm.toLocaleString('vi-VN')} đ</span>
                  </div>
                `;
              }).join('')}
            </div>
            <div class="flex justify-between items-center pt-2 border-t border-[#F0EAE1] font-bold text-xs">
              <span class="text-[#2D2424]">Tổng tiền nhận:</span>
              <span class="text-sm font-extrabold text-[#2E7D6D] font-mono">+${(myStaffEntry.comm_vnd || 0).toLocaleString('vi-VN')} đ</span>
            </div>
          ` : `
            <!-- Giao diện Admin: Xem chi tiết toàn bộ nhân sự -->
            ${tempSwapStaffs.map((s, sIdx) => {
              const roleTag = sIdx === 0 ? 'Chính' : 'Phụ';
              return `
                <div class="flex justify-between items-center text-xs font-bold">
                  <span class="text-[#2D2424]">${s.name} (${roleTag}):</span>
                  <span class="text-[#2E7D6D] font-extrabold font-mono">+${s.comm_vnd.toLocaleString('vi-VN')} đ</span>
                </div>
              `;
            }).join('')}
          `}
        </div>
      </div>
    `;

    const timerTextEl = document.getElementById('split-timer-pct');
    if (timerTextEl) timerTextEl.innerText = `Theo ${stages.length} giai đoạn thực tế`;
  } else {
    // Chế độ chia đều
    const equalPct = Math.floor(100 / count);
    const remPct = 100 - (equalPct * count);

    tempSwapStaffs.forEach((s, idx) => {
      const isFirst = idx === 0;
      s.pct = equalPct + (isFirst ? remPct : 0);
      s.joined_min = 0;
      s.left_min = targetMin;
      const staffObj = users.find(u => normalizePhone(u.phone) === normalizePhone(s.phone));
      const rate = (staffObj && parsePercentage(staffObj?.commission_rate) > 0) ? parsePercentage(staffObj?.commission_rate) : 10;
      s.comm_vnd = Math.round(tourPrice * (rate / 100) * (s.pct / 100));

      const isMe = normalizePhone(s.phone) === myPhone;
      const badgeText = (isAdmin || isMe) ? `${s.pct}% • +${s.comm_vnd.toLocaleString('vi-VN')} đ` : `${s.pct}%`;
      const itemCommBadge = document.getElementById(`swap-item-comm-${idx}`);
      if (itemCommBadge) itemCommBadge.innerText = badgeText;
    });

    const myStaffEntry = tempSwapStaffs.find(s => normalizePhone(s.phone) === myPhone) || tempSwapStaffs[0];

    html = `
      <div class="space-y-1.5">
        <div class="text-[11px] font-extrabold text-[#2D2424] uppercase tracking-wider">🏆 Tổng thu nhập trong tour này:</div>
        ${!isAdmin ? `
          <div class="flex justify-between items-center text-xs text-[#7E7272]">
            <span>• Chia đều trọn tour (${targetMin}p):</span>
            <span class="font-bold text-[#2D2424] font-mono">${myStaffEntry.pct}%</span>
          </div>
          <div class="flex justify-between items-center pt-2 border-t border-[#F0EAE1] font-bold text-xs">
            <span class="text-[#2D2424]">Tổng tiền nhận:</span>
            <span class="text-sm font-extrabold text-[#2E7D6D] font-mono">+${myStaffEntry.comm_vnd.toLocaleString('vi-VN')} đ</span>
          </div>
        ` : `
          ${tempSwapStaffs.map((s, i) => {
            const roleTag = i === 0 ? 'Chính' : 'Phụ';
            return `
              <div class="flex justify-between items-center text-xs font-bold">
                <span class="text-[#2D2424]">${s.name} (${roleTag}):</span>
                <span class="text-[#2E7D6D] font-extrabold font-mono">+${s.comm_vnd.toLocaleString('vi-VN')} đ</span>
              </div>
            `;
          }).join('')}
        `}
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
  
  // Đồng bộ tức thì lên Firebase Realtime để Admin và tất cả thiết bị cập nhật ngay trạng thái KTV bận
  if (typeof fbSaveLiveSession === 'function') {
    fbSaveLiveSession(currentLiveSession);
  }

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
            <span class="text-[#2D2424]">${idx === 0 ? 'Chính' : 'Phụ'}:</span>
            <span>${s.name}</span>
          </span>
        </div>

        <div class="relative">
          <input type="text" id="chk-tip-input-${s.phone}" value="" onkeyup="onDynamicTipKeyup('${s.phone}', this.value)" placeholder="0" class="w-full bg-white border border-[#FCDFD7] rounded-xl p-3 pr-10 text-[#2D2424] font-extrabold text-base focus:outline-none focus:border-[#E58A7B] font-mono text-right">
          <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#A39696] pointer-events-none">đ</span>
        </div>

        <div class="flex flex-wrap gap-1.5 pt-0.5">
          ${quickAmounts.map(amt => `
            <button type="button" onclick="setDynamicQuickTip('${s.phone}', ${amt})" class="px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${amt === 0 ? 'bg-white text-[#7E7272] border border-[#EFE8DF]' : 'bg-[#FFF0EB] text-[#E58A7B] border border-[#FCDFD7] hover:bg-[#FFE5DC]'} transition active:scale-95 cursor-pointer ">
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

    const staffTipsList = currentStaffs
      .filter(s => getStaffTipAmount(s.phone) > 0)
      .map(s => {
        const tipVnd = getStaffTipAmount(s.phone);
        return `
          <div class="flex justify-between items-center text-xs font-bold text-[#7E7272]">
            <span>Tiền tip ${s.name}:</span>
            <span class="font-mono font-bold text-[#2D2424]">+${tipVnd.toLocaleString('vi-VN')} đ</span>
          </div>
        `;
      }).join('');

    staffSummaryEl.innerHTML = staffTipsList;
  }
}

function confirmSaveReceiptFromCheckout() {
  if (!currentLiveSession) return;

  const users = getSortedUsersList();
  const currentStaffs = currentLiveSession.staffs || [
    { phone: currentLiveSession.staff_1_phone, name: currentLiveSession.staff_1_name, pct: 100 }
  ];

  let totalTip = 0;
  Object.values(staffTipMap).forEach(v => {
    totalTip += Number(v) || 0;
  });

  const basePrice = currentLiveSession.use_voucher ? 0 : currentLiveSession.price;
  const grandTotal = basePrice + totalTip;
  const receiptId = 'HD' + Date.now().toString().slice(-6);

  // Xử lý động N nhân sự tham gia tour
  const mappedStaffs = currentStaffs.map((s, idx) => {
    const staffObj = users.find(u => normalizePhone(u.phone) === normalizePhone(s.phone));
    const rate = (staffObj && parsePercentage(staffObj?.commission_rate) > 0) ? parsePercentage(staffObj?.commission_rate) : 10;
    const commVnd = (s.comm_vnd !== undefined && s.comm_vnd !== null)
      ? s.comm_vnd
      : Math.round(currentLiveSession.price * (rate / 100) * ((s.pct || Math.round(100 / currentStaffs.length)) / 100));
    const tipVnd = getStaffTipAmount(s.phone);

    return {
      phone: s.phone || '',
      staff_id: (staffObj && staffObj.staff_id) || s.staff_id || (idx === 0 ? 'KTV01' : `KTV0${idx + 1}`),
      name: (staffObj && staffObj.full_name) || s.name || `KTV ${idx + 1}`,
      pct: s.pct !== undefined ? s.pct : Math.round(100 / currentStaffs.length),
      comm_vnd: commVnd,
      tip_vnd: tipVnd,
      role: idx === 0 ? 'Chính' : 'Phụ'
    };
  });

  const s1 = mappedStaffs[0];
  const s2 = mappedStaffs[1] || null;
  const s3 = mappedStaffs[2] || null;

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
    
    staff_1_user_id: s1.phone || '',
    staff_1_id: s1.staff_id || 'KTV01',
    staff_1_phone: s1.phone || '',
    staff_names: mappedStaffs.map(s => s.name).join(', '),
    staff_1_name: s1.name || 'KTV',
    staff_1_comm: s1.comm_vnd,
    staff_1_tip: s1.tip_vnd,

    has_staff_2: Boolean(s2),
    staff_2_user_id: s2 ? s2.phone : '-',
    staff_2_id: s2 ? s2.staff_id : '-',
    staff_2_phone: s2 ? s2.phone : '-',
    staff_2_name: s2 ? s2.name : '-',
    staff_2_comm: s2 ? s2.comm_vnd : 0,
    staff_2_tip: s2 ? s2.tip_vnd : 0,

    has_staff_3: Boolean(s3),
    staff_3_user_id: s3 ? s3.phone : '-',
    staff_3_id: s3 ? s3.staff_id : '-',
    staff_3_phone: s3 ? s3.phone : '-',
    staff_3_name: s3 ? s3.name : '-',
    staff_3_comm: s3 ? s3.comm_vnd : 0,
    staff_3_tip: s3 ? s3.tip_vnd : 0,

    staff_1_pct: s1.pct,
    staff_2_pct: s2 ? s2.pct : 0,
    staff_3_pct: s3 ? s3.pct : 0,

    staffs: mappedStaffs,

    staff_phone: s1.phone || '',
    staff_id: s1.staff_id || 'KTV01',
    staff_name: s1.name || 'KTV',
    commission_amount: (s1.comm_vnd || 0) + (s1.tip_vnd || 0),

    start_time: currentLiveSession.start_time,
    end_time: currentLiveSession.end_time || currentLiveSession.start_time,
    duration_min: currentLiveSession.duration_actual_min || currentLiveSession.duration_target_min || 45,
    time: currentLiveSession.start_time,

    payment_method: checkoutPaymentMethod,
    is_voucher_used: currentLiveSession.use_voucher,
    date: currentLiveSession.date,
    created_at: currentLiveSession.date.replace(/-/g, '/') + ' - ' + currentLiveSession.start_time
  };

  const receipts = getStored('receipts', []);
  receipts.unshift(receipt);
  setStored('receipts', receipts);

  // Tạo và lưu tức thì các bản ghi payroll_logs tương ứng vào bộ nhớ cục bộ giữ nguyên thứ tự KTV
  const payrollLogs = getStored('payroll_logs', []);
  const newReceiptLogs = receipt.staffs.map(st => ({
    receipt_id: receiptId,
    date: receipt.date,
    time: receipt.end_time || receipt.start_time,
    customer_name: receipt.customer_name || 'Khách vãng lai',
    customer_phone: receipt.customer_phone || '',
    service_name: receipt.service_name,
    staff_name: st.name,
    staff_phone: st.phone,
    staff_id: st.staff_id,
    role_in_tour: st.role,
    commission_pct: st.pct,
    commission_amount: st.comm_vnd,
    tip_amount: st.tip_vnd,
    total_earned: st.comm_vnd + st.tip_vnd,
    payment_method: receipt.payment_method,
    created_at: receipt.created_at
  }));
  payrollLogs.unshift(...newReceiptLogs);
  setStored('payroll_logs', payrollLogs);

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
  
  mappedStaffs.forEach(st => {
    successMsg += `
• ${st.name} (${st.role}): Tour +${(st.comm_vnd || 0).toLocaleString('vi-VN')} đ${st.tip_vnd > 0 ? ` + Tip +${st.tip_vnd.toLocaleString('vi-VN')} đ` : ''}`;
  });
  alert(successMsg);

  const targetSessionId = currentLiveSession?.session_id;
  closeCheckoutModal();
  if (currentLiveSession && typeof markSessionDismissed === 'function') {
    markSessionDismissed(currentLiveSession);
  }
  localStorage.removeItem('selena_active_live_session');
  currentLiveSession = null;
  extraStaffList = [];
  clearInterval(liveTimerInterval);
  if (typeof fbClearLiveSession === 'function' && targetSessionId) {
    fbClearLiveSession(targetSessionId);
  }
  renderLiveSessionUI();

  document.getElementById('pos-customer-phone').value = '';
  document.getElementById('pos-customer-name').value = '';
  document.getElementById('pos-customer-card').classList.add('hidden');
  useVoucher = false;
  renderExtraStaffUI();
  updatePOSStaffInfo();

  // Tự động chuyển ngay về tab History và làm mới toàn bộ dữ liệu
  if (typeof showView === 'function') {
    showView('history');
  }
  if (typeof refreshAllActiveViews === 'function') {
    refreshAllActiveViews();
  }
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
  const busyMap = getBusyStaffPhonesMap();
  const currentTourId = currentLiveSession?.session_id;
  const myPhone = currentUser ? normalizePhone(currentUser.phone) : normalizePhone(currentLiveSession.staff_1_phone);
  const availableUsers = users.filter(u => {
    const uPhone = normalizePhone(u.phone);
    if (uPhone === myPhone) return false;
    const busySess = busyMap[uPhone];
    if (busySess && busySess.session_id !== currentTourId) return false;
    return true;
  });

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
      { 
        phone: currentLiveSession.staff_1_phone, 
        name: currentUser?.full_name || currentLiveSession.staff_1_name, 
        staff_id: currentLiveSession.staff_1_id || (currentUser ? currentUser.staff_id : 'KTV01'),
        pct: p1Pct, 
        comm: p1Comm, 
        worked_min: elapsedMin 
      },
      { 
        phone: targetUser.phone, 
        name: targetUser.full_name, 
        staff_id: targetUser.staff_id || (isUserOwner(targetUser) ? 'FOUNDER_01' : 'KTV02'),
        pct: p2Pct, 
        comm: p2Comm, 
        is_takeover: true, 
        joined_min: elapsedMin 
      }
    ]
  };

  // Đồng bộ lên Firebase
  try {
    if (typeof fbSaveLiveSession === 'function') {
      await fbSaveLiveSession(handoverSession);
    }
  } catch (err) {
    console.warn('⚠️ Lỗi đồng bộ Firebase live session:', err);
  }

  // Dọn dẹp phiên của KTV bàn giao
  clearInterval(liveTimerInterval);
  currentLiveSession = null;
  localStorage.removeItem('selena_active_live_session');
  renderLiveSessionUI();
  closeHandoverModal();

  alert(`🤝 BÀN GIAO THÀNH CÔNG!\n\nTour đã được chuyển giao cho ${targetUser.full_name} tiếp quản.\nMàn hình của bạn đã kết thúc ca này và trở về trạng thái sẵn sàng đón tour mới.`);
}


// =============================================================
// QUẢN LÝ DỊCH VỤ LÀM THÊM (ADD-ON SERVICES)
// =============================================================
function toggleAddonPickerModal() {
  const box = document.getElementById('pos-addon-selector-box');
  if (!box) return;
  const isHidden = box.classList.contains('hidden');
  if (isHidden) {
    renderAddonOptionsList();
    box.classList.remove('hidden');
  } else {
    box.classList.add('hidden');
  }
}

function renderAddonOptionsList() {
  const container = document.getElementById('pos-addon-options-list');
  if (!container) return;
  const addons = (typeof DEFAULT_ADDONS !== 'undefined') ? DEFAULT_ADDONS : [];

  container.innerHTML = addons.map(ad => {
    const isSelected = selectedAddonIds.includes(ad.addon_id);
    return `
      <div onclick="toggleSelectAddon('${ad.addon_id}')" class="p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${isSelected ? 'bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B]' : 'bg-white border-[#EFE8DF] text-[#2D2424] hover:bg-[#FAF6F1]'}">
        <div class="min-w-0">
          <div class="text-xs font-bold truncate">${ad.icon || '✨'} ${ad.name}</div>
          <div class="text-[11px] font-mono font-semibold ${isSelected ? 'text-[#E58A7B]' : 'text-[#7E7272]'}">+${Number(ad.price).toLocaleString('vi-VN')} đ (+${ad.duration_min}p)</div>
        </div>
        <div class="w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#E58A7B] border-[#E58A7B] text-white' : 'border-[#D4C5B9] bg-white'}">
          ${isSelected ? '✓' : ''}
        </div>
      </div>
    `;
  }).join('');
}

function toggleSelectAddon(addonId) {
  if (selectedAddonIds.includes(addonId)) {
    selectedAddonIds = selectedAddonIds.filter(id => id !== addonId);
  } else {
    selectedAddonIds.push(addonId);
  }
  renderAddonOptionsList();
  renderSelectedAddonChips();
  updatePOSCalculations();
}

function removeSelectedAddon(addonId) {
  selectedAddonIds = selectedAddonIds.filter(id => id !== addonId);
  renderAddonOptionsList();
  renderSelectedAddonChips();
  updatePOSCalculations();
}

function renderSelectedAddonChips() {
  const container = document.getElementById('pos-selected-addons-chips');
  if (!container) return;
  const addons = (typeof DEFAULT_ADDONS !== 'undefined') ? DEFAULT_ADDONS : [];

  if (selectedAddonIds.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = selectedAddonIds.map(id => {
    const ad = addons.find(a => a.addon_id === id);
    if (!ad) return '';
    return `
      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF0EB] border border-[#FCDFD7] text-[#E58A7B] text-xs font-bold shadow-2xs animate-in fade-in">
        <span>${ad.icon || '✨'} ${ad.name} (+${Number(ad.price).toLocaleString('vi-VN')} đ)</span>
        <button type="button" onclick="removeSelectedAddon('${ad.addon_id}')" class="hover:text-red-600 hover:bg-white/50 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer font-extrabold text-[10px]" title="Xóa dịch vụ làm thêm">✕</button>
      </span>
    `;
  }).join('');
}

function getSelectedAddonsData() {
  const addons = (typeof DEFAULT_ADDONS !== 'undefined') ? DEFAULT_ADDONS : [];
  return selectedAddonIds.map(id => addons.find(a => a.addon_id === id)).filter(Boolean);
}


// =============================================================
// QUẢN LÝ MODAL ĐỔI & THÊM DỊCH VỤ GIỮA CA (MODAL EDIT LIVE SERVICES)
// =============================================================
let modalTempCartItems = [];

function openModalEditLiveServices() {
  if (!currentLiveSession) {
    alert('Không tìm thấy ca phục vụ đang chạy!');
    return;
  }

  const menu = getValidatedMenu();

  // Khôi phục danh sách dịch vụ từ currentLiveSession
  if (Array.isArray(currentLiveSession.selected_items) && currentLiveSession.selected_items.length > 0) {
    modalTempCartItems = currentLiveSession.selected_items.map(i => ({ ...i }));
  } else {
    // Nếu chưa có mảng selected_items, tìm theo service_id
    const item = menu.find(m => m.service_id === currentLiveSession.service_id) || menu[0];
    modalTempCartItems = item ? [{ ...item }] : [];
  }

  // Cập nhật thông tin khách
  const custInfoEl = document.getElementById('modal-edit-live-customer-info');
  if (custInfoEl) {
    const custName = currentLiveSession.customer_name || 'Khách vãng lai';
    const custPhone = currentLiveSession.customer_phone || '';
    const sName = currentLiveSession.staff_1_name || (currentUser ? currentUser.full_name : 'KTV');
    custInfoEl.innerText = `Khách: ${custName}${custPhone ? ` (${custPhone})` : ''} • KTV: ${sName}`;
  }

  renderModalQuickCombos();
  renderModalMenuDropdown();
  renderModalCartUI();

  const modal = document.getElementById('modal-edit-live-services');
  if (modal) {
    modal.classList.remove('hidden');
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }
}

function closeModalEditLiveServices() {
  const modal = document.getElementById('modal-edit-live-services');
  if (modal) modal.classList.add('hidden');
  closeModalCustomDropdownPopover();
}

function toggleModalCustomDropdownPopover(e) {
  if (e && e.target.closest('.modal-chip-remove-btn')) return;
  const popover = document.getElementById('modal-edit-live-popover');
  const chevron = document.getElementById('modal-edit-live-chevron');
  if (!popover) return;

  const isHidden = popover.classList.contains('hidden');
  if (isHidden) {
    renderModalMenuDropdown();
    popover.classList.remove('hidden');
    if (chevron) chevron.classList.add('rotate-180');
  } else {
    closeModalCustomDropdownPopover();
  }
}

function closeModalCustomDropdownPopover() {
  const popover = document.getElementById('modal-edit-live-popover');
  const chevron = document.getElementById('modal-edit-live-chevron');
  if (popover) popover.classList.add('hidden');
  if (chevron) chevron.classList.remove('rotate-180');
}

function renderModalQuickCombos() {
  const container = document.getElementById('modal-edit-live-quick-combos');
  if (!container) return;

  const menu = getValidatedMenu();
  const selectedIds = new Set(modalTempCartItems.map(item => item.service_id));
  const quickNumbers = [1, 2, 3, 4, 5];

  container.innerHTML = quickNumbers.map(num => {
    const item = findComboByNumber(menu, num);
    if (!item) return '';

    const isSelected = selectedIds.has(item.service_id);

    return `
      <button type="button" onclick="toggleModalQuickCombo('${item.service_id}')" class="px-3 py-1.5 rounded-2xl text-xs font-extrabold border transition-all duration-200 active:scale-95 cursor-pointer shadow-2xs ${isSelected ? 'bg-[#FFF0EB] text-[#E58A7B] border-[#E58A7B] ring-2 ring-[#E58A7B]/40 font-black shadow-xs' : 'bg-white text-[#5D5050] border-[#E8E1D7] hover:bg-[#FAF6F1] hover:border-[#E58A7B]/40 hover:text-[#E58A7B]'}">
        ${isSelected ? '✓ ' : ''}Combo ${num}
      </button>
    `;
  }).join('');
}

function toggleModalQuickCombo(serviceId) {
  const menu = getValidatedMenu();
  const item = menu.find(m => m.service_id === serviceId);
  if (!item) return;

  const existsIndex = modalTempCartItems.findIndex(i => i.service_id === serviceId);
  if (existsIndex >= 0) {
    // Hủy chọn combo này
    modalTempCartItems.splice(existsIndex, 1);
  } else {
    // Xóa combo cũ và thay bằng combo mới (Single Combo Rule)
    modalTempCartItems = modalTempCartItems.filter(i => !isComboItem(i));
    modalTempCartItems.unshift({ ...item });
  }

  renderModalQuickCombos();
  renderModalMenuDropdown();
  renderModalCartUI();
}

function renderModalMenuDropdown() {
  const itemsContainer = document.getElementById('modal-edit-live-dropdown-items');
  const menu = getValidatedMenu();
  const selectedIds = new Set(modalTempCartItems.map(item => item.service_id));

  const availableItems = menu.filter(m => !selectedIds.has(m.service_id));

  if (!itemsContainer) return;

  if (availableItems.length === 0) {
    itemsContainer.innerHTML = `
      <div class="p-3 text-center text-xs text-[#A39696] italic">
        -- Tất cả dịch vụ đã được chọn --
      </div>
    `;
    return;
  }

  let html = '';

  SERVICE_CATEGORIES.forEach(cat => {
    const groupItems = availableItems.filter(m => String(m.service_id).startsWith(cat.prefix));
    if (groupItems.length > 0) {
      html += `
        <div class="px-2.5 py-1 text-[10px] font-black text-[#7E7272] uppercase tracking-wider bg-[#F7F2EC] rounded-xl flex items-center gap-1.5 sticky top-0 z-10 shadow-2xs">
          <i data-lucide="${cat.icon}" class="w-3 h-3 ${cat.iconColor}"></i>
          <span>${cat.title}</span>
        </div>
      `;
      html += groupItems.map(m => `
        <div onclick="addModalCartItemFromDropdown('${m.service_id}')" class="p-2 rounded-xl hover:bg-[#FFF0EB] hover:text-[#E58A7B] transition cursor-pointer flex justify-between items-center text-xs font-bold text-[#2D2424] group">
          <span class="truncate flex items-center gap-1.5">
            <span>${cat.itemIcon}</span> <span>${m.service_name}</span>
          </span>
          <span class="font-mono text-[#7E7272] group-hover:text-[#E58A7B] text-[11px] shrink-0 font-extrabold">
            ${Number(m.price).toLocaleString('vi-VN')} đ • ${m.duration_min}p
          </span>
        </div>
      `).join('');
    }
  });

  itemsContainer.innerHTML = html;
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

function addModalCartItemFromDropdown(serviceId) {
  const menu = getValidatedMenu();
  const item = menu.find(m => m.service_id === serviceId);
  if (!item) return;

  if (isComboItem(item)) {
    // Thay thế combo cũ
    modalTempCartItems = modalTempCartItems.filter(i => !isComboItem(i));
    modalTempCartItems.unshift({ ...item });
  } else {
    if (!modalTempCartItems.some(i => i.service_id === serviceId)) {
      modalTempCartItems.push({ ...item });
    }
  }

  closeModalCustomDropdownPopover();
  renderModalQuickCombos();
  renderModalMenuDropdown();
  renderModalCartUI();
}

function removeModalCartItem(serviceId, e) {
  if (e) e.stopPropagation();
  modalTempCartItems = modalTempCartItems.filter(i => i.service_id !== serviceId);
  renderModalQuickCombos();
  renderModalMenuDropdown();
  renderModalCartUI();
}

function renderModalCartUI() {
  const chipsContainer = document.getElementById('modal-edit-live-chips-list');
  const countBadge = document.getElementById('modal-edit-live-count-badge');
  const totalPriceEl = document.getElementById('modal-edit-live-total-price');
  const totalDurationEl = document.getElementById('modal-edit-live-total-duration');
  const remainingNoteEl = document.getElementById('modal-edit-live-remaining-note');
  if (!chipsContainer) return;

  if (modalTempCartItems.length === 0) {
    chipsContainer.innerHTML = `
      <div class="p-2 text-center text-xs text-[#A39696] italic">
        Chưa có dịch vụ nào. Vui lòng chọn ít nhất 1 dịch vụ!
      </div>
    `;
    if (countBadge) countBadge.innerText = '0 dịch vụ';
    if (totalPriceEl) totalPriceEl.innerText = '0 đ';
    if (totalDurationEl) totalDurationEl.innerText = '0 phút';
    if (remainingNoteEl) remainingNoteEl.innerText = 'Không thể để trống ca';
    return;
  }

  if (countBadge) countBadge.innerText = `${modalTempCartItems.length} dịch vụ`;

  let totalPrice = 0;
  let totalDuration = 0;

  chipsContainer.innerHTML = modalTempCartItems.map(item => {
    const price = Number(item.price) || 0;
    const dur = Number(item.duration_min) || 0;
    totalPrice += price;
    totalDuration += dur;

    const isCombo = String(item.service_id || '').startsWith('CB') || String(item.service_name || '').toLowerCase().includes('combo');

    return `
      <div class="inline-flex items-center gap-2.5 px-3 py-0.5 rounded-2xl bg-gradient-to-r from-[#FFF0EB] to-[#FFF6F3] border border-[#E58A7B]/35 text-[#2D2424] shadow-2xs hover:shadow-xs transition animate-in zoom-in-95">
        <div class="text-base flex items-center justify-center shrink-0">
          ${isCombo ? '💆' : '✨'}
        </div>
        <div class="min-w-0 flex-1">
          <div class="font-black text-[11px] text-[#2D2424] leading-snug truncate">
            ${item.service_name}
          </div>
          <div class="text-[11px] font-mono text-[#7E7272] mt-0.5 flex items-center gap-1.5 leading-tight">
            <span class="text-[#E58A7B] font-extrabold">${price.toLocaleString('vi-VN')} đ</span>
            <span>•</span>
            <span class="text-[#2E7D6D] font-bold">${dur}p</span>
          </div>
        </div>
        <button type="button" onclick="removeModalCartItem('${item.service_id}', event)" class="modal-chip-remove-btn ml-1 p-1 text-[#A39696] hover:text-rose-600 hover:bg-rose-100 rounded-full transition cursor-pointer shrink-0" title="Xóa dịch vụ này">
          <i data-lucide="x" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;
  }).join('');

  if (totalPriceEl) totalPriceEl.innerText = `${totalPrice.toLocaleString('vi-VN')} đ`;
  if (totalDurationEl) totalDurationEl.innerText = `${totalDuration} phút`;

  // Tính số phút đã trôi qua và số phút còn lại
  if (currentLiveSession && currentLiveSession.start_timestamp && remainingNoteEl) {
    const elapsedMinutes = Math.floor((Date.now() - currentLiveSession.start_timestamp) / 60000);
    const remMin = totalDuration - elapsedMinutes;
    if (remMin > 0) {
      remainingNoteEl.innerText = `Đã chạy ${elapsedMinutes}p • Còn lại khoảng ${remMin} phút`;
    } else {
      remainingNoteEl.innerText = `Đã chạy ${elapsedMinutes}p • Quá giờ +${Math.abs(remMin)} phút`;
    }
  }

  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

function saveModalEditLiveServices() {
  if (!currentLiveSession) return;
  if (!modalTempCartItems || modalTempCartItems.length === 0) {
    alert('Ca phục vụ phải có ít nhất một dịch vụ!');
    return;
  }

  const totalPrice = modalTempCartItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const totalDuration = modalTempCartItems.reduce((sum, item) => sum + (Number(item.duration_min) || 0), 0);
  const serviceDisplayName = modalTempCartItems.map(i => i.service_name).join(' + ');
  const primaryServiceId = modalTempCartItems[0].service_id;

  // Cập nhật object currentLiveSession
  currentLiveSession.selected_items = modalTempCartItems.map(i => ({ ...i }));
  currentLiveSession.price = totalPrice;
  currentLiveSession.duration_target_min = totalDuration;
  currentLiveSession.service_id = primaryServiceId;
  currentLiveSession.service_name = serviceDisplayName;

  // Lưu LocalStorage
  if (typeof setStored === 'function') {
    setStored('currentLiveSession', currentLiveSession);
  }

  // Đồng bộ Firebase Realtime
  if (typeof firebasePut === 'function' && currentLiveSession.session_id) {
    firebasePut('active_sessions/' + currentLiveSession.session_id, currentLiveSession);
  }

  // Cập nhật toàn bộ giao diện màn hình Live Tour
  if (typeof renderLiveSessionUI === 'function') {
    renderLiveSessionUI();
  } else {
    const nameEl = document.getElementById('live-service-name');
    if (nameEl) nameEl.innerText = serviceDisplayName;
    const targetDurEl = document.getElementById('live-target-time-text');
    if (targetDurEl) targetDurEl.innerText = `${totalDuration} phút`;
  }

  closeModalEditLiveServices();
  if (typeof showToast === 'function') {
    showToast('🎉 Đã cập nhật gói dịch vụ thành công!', 'success');
  } else {
    alert('🎉 Đã cập nhật gói dịch vụ cho ca phục vụ thành công!');
  }
}

function confirmStaffLeaveTourEarly() {
  if (!currentLiveSession) return;
  const cUser = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : null;
  const myPhone = (cUser && cUser.phone) ? normalizePhone(cUser.phone) : '';
  
  const staffs = currentLiveSession.staffs || [
    { phone: currentLiveSession.staff_1_phone, name: currentLiveSession.staff_1_name, pct: 100 }
  ];
  const myStaff = staffs.find(s => normalizePhone(s.phone) === myPhone);
  if (!myStaff) {
    alert('Không tìm thấy thông tin bạn trong ca gội này!');
    return;
  }

  const elapsedSec = Math.max(0, Math.floor((Date.now() - currentLiveSession.start_timestamp) / 1000));
  const elapsedMin = Math.max(1, Math.floor(elapsedSec / 60));

  if (!confirm(`Xác nhận bạn (${myStaff.name}) đã xong phần việc và muốn rời ca tại phút thứ ${elapsedMin}?`)) {
    return;
  }

  myStaff.left_min = elapsedMin;
  myStaff.left_early = true;
  myStaff.left_at_min = elapsedMin;
  myStaff.left_timestamp = Date.now();

  currentLiveSession.staffs = staffs;
  localStorage.setItem('selena_active_live_session', JSON.stringify(currentLiveSession));
  
  if (typeof fbSetLiveSession === 'function') {
    fbSetLiveSession(currentLiveSession);
  }

  if (typeof markSessionDismissed === 'function') {
    markSessionDismissed(currentLiveSession);
  }
  
  currentLiveSession = null;
  clearInterval(liveTimerInterval);
  renderLiveSessionUI();

  alert(`🎉 Đã ghi nhận bạn (${myStaff.name}) hoàn thành phần việc lúc phút thứ ${elapsedMin}.

Khi KTV chính hoàn thành và chốt ca, hoa hồng + tip sẽ được tự động tính vào ví của bạn!`);

  if (typeof showView === 'function') {
    showView('home');
  }
}
