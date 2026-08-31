function isSamePhone(p1, p2) {
  if (!p1 || !p2) return false;
  const s1 = String(p1).replace(/[^0-9]/g, '');
  const s2 = String(p2).replace(/[^0-9]/g, '');
  if (!s1 || !s2) return false;
  if (s1 === s2) return true;
  return s1.replace(/^0+/, '') === s2.replace(/^0+/, '');
}

function isUserOwner(u) {
  const user = u || currentUser;
  if (!user) return false;
  const r = String(user.role || '').toLowerCase();
  const p = normalizePhone(user.phone);
  const s = String(user.staff_id || '').trim();
  return (r === 'admin' || r === 'chủ tiệm' || r === 'chủ sáng lập' || r === 'owner' || p === '0949251144' || s === 'FOUNDER_01');
}

function maskPhoneNumber(phone, isOwner = false, queryInput = '') {
  if (!phone) return '';
  const clean = String(phone).replace(/[^0-9]/g, '');
  const std = clean.length === 9 && !clean.startsWith('0') ? ('0' + clean) : clean;
  if (isOwner) return std;

  const totalLen = std.length; // 10 chữ số (VD: 0949251144)
  const tailLen = 3; // 3 số cuối (144)
  if (totalLen <= tailLen + 2) return std;

  const tail = std.slice(-tailLen);
  const q = String(queryInput || '').replace(/[^0-9]/g, '');
  const qStd = q.length === 9 && !q.startsWith('0') ? ('0' + q) : q;

  // Lấy đúng số ký tự đầu theo những gì Staff đã nhập (tối thiểu 2 số '09', tối đa 7 số)
  const revealHeadLen = Math.min(totalLen - tailLen, Math.max(2, qStd ? qStd.length : 3));
  const head = std.slice(0, revealHeadLen);
  const maskLen = Math.max(1, totalLen - revealHeadLen - tailLen);
  const stars = '*'.repeat(maskLen);

  return `${head}${stars}${tail}`;
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

const APP_VERSION = 'v0.1.5.9';
// =============================================================
// SELENA SPA - GLOBAL CONFIG & CONSTANTS
// =============================================================
const DEFAULT_USERS = [
  { user_id: '0949251144', staff_id: 'FOUNDER_01', phone: '0949251144', password: '123', full_name: 'Miles', role: 'admin', salary_type: 'owner', commission_rate: 0, base_salary: 0, bank_name: 'MBBank', bank_account_no: '0949251144', bank_account_name: 'NGUYEN TIEN DUY' },
  { user_id: '0799625591', staff_id: 'KTV01', phone: '0799625591', password: '123', full_name: 'Thu Ngân', role: 'staff', salary_type: 'fixed', commission_rate: 10, base_salary: 2000000, bank_name: 'MBBank', bank_account_no: '0799625591', bank_account_name: 'NGUYEN THI THU NGAN' },
  { user_id: '0912345678', staff_id: 'KTV02', phone: '0912345678', password: '123', full_name: 'KTV Mai Lan', role: 'staff', salary_type: 'commission', commission_rate: 20, base_salary: 0, bank_name: 'MBBank', bank_account_no: '0912345678', bank_account_name: 'KTV MAI LAN' }
];

const DEFAULT_MENU = [
  { service_id: 'CB01', service_name: 'Combo 1 (Gội Dưỡng Sinh)', price: 64000, duration_min: 45, commission_ktv_fixed: 6400, commission_ktv_commission: 12800, cosmetics_cost: 3000 },
  { service_id: 'CB02', service_name: 'Combo 2 (Gội Chuyên Sâu)', price: 99000, duration_min: 60, commission_ktv_fixed: 9900, commission_ktv_commission: 19800, cosmetics_cost: 5000 },
  { service_id: 'CB03', service_name: 'Combo 3 (Gội Dưỡng Sinh Hoàng Gia)', price: 149000, duration_min: 75, commission_ktv_fixed: 14900, commission_ktv_commission: 29800, cosmetics_cost: 8000 },
  { service_id: 'CB04', service_name: 'Combo 4 (Gội + Massage Cổ Vai Gáy)', price: 199000, duration_min: 90, commission_ktv_fixed: 19900, commission_ktv_commission: 39800, cosmetics_cost: 10000 },
  { service_id: 'CB05', service_name: 'Combo 5 (Gội Thư Giãn Toàn Diện)', price: 249000, duration_min: 105, commission_ktv_fixed: 24900, commission_ktv_commission: 49800, cosmetics_cost: 12000 }
];

const DEFAULT_CUSTOMERS = [];

const DEFAULT_LOYALTY_CYCLES = [];

const DEFAULT_VOUCHERS = [];

const DEFAULT_ANNOUNCEMENT = {
  content: '✨ Chúc các kỹ thuật viên một ngày làm việc tràn đầy năng lượng! Hãy luôn giữ nụ cười tươi, vệ sinh bồn gội sạch sẽ và tư vấn chu đáo cho khách nhé.',
  author: 'Miles (Chủ sáng lập)',
  date: '27/08/2026'
};

// Global Application State
let currentUser = null;
let currentTab = 'home';
let selectedComboId = 'CB01';
let currentCustomer = null;
let paymentMethod = 'Chuyển khoản';
let useVoucher = false;
let pendingReceipt = null;
let isPasswordVisible = false;

// LocalStorage Helper Utilities
function getStored(key, fallback) {
  try {
    const val = localStorage.getItem('selena_' + key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setStored(key, data) {
  localStorage.setItem('selena_' + key, JSON.stringify(data));
}

function normalizePhone(p) {
  if (!p) return '';
  return String(p).replace(/[^0-9]/g, '');
}

function parsePercentage(val) {
  if (val === undefined || val === null || val === '') return 10;
  if (typeof val === 'number') {
    if (val > 0 && val <= 1) return Math.round(val * 100);
    return Math.round(val);
  }
  let s = String(val).trim();
  if (s.includes('%')) {
    let num = parseFloat(s.replace('%', ''));
    return isNaN(num) ? 10 : num;
  }
  let num = parseFloat(s);
  if (isNaN(num)) return 10;
  if (num > 0 && num <= 1) return Math.round(num * 100);
  return Math.round(num);
}

function getReceiptDurationStatus(r) {
  const menu = getStored('menu', DEFAULT_MENU);
  let targetMin = Number(r.duration_target_min) || 0;

  if (!targetMin) {
    const s = menu.find(m => m.service_id === r.service_id || (m.service_name && r.service_name && m.service_name.toLowerCase() === r.service_name.toLowerCase()));
    if (s && s.duration_min) {
      targetMin = Number(s.duration_min);
    } else {
      const sName = (r.service_name || '').toLowerCase();
      if (sName.includes('bé') || sName.includes('be')) targetMin = 30;
      else if (sName.includes('1')) targetMin = 45;
      else if (sName.includes('2')) targetMin = 60;
      else if (sName.includes('3')) targetMin = 75;
      else if (sName.includes('4')) targetMin = 90;
      else if (sName.includes('5')) targetMin = 105;
      else targetMin = 45;
    }
  }

  const actualMin = Number(r.duration_min) || Number(r.duration_actual_min) || 45;
  const isFullTime = actualMin >= targetMin;

  return {
    actualMin: actualMin,
    targetMin: targetMin,
    isFullTime: isFullTime,
    colorClass: isFullTime ? 'text-[#2E7D6D]' : 'text-[#D97706]',
    label: `${actualMin}p`,
    title: isFullTime ? `Đủ giờ (${actualMin}/${targetMin}p)` : `Thiếu giờ (${actualMin}/${targetMin}p)`
  };
}

function formatCleanTime(val) {
  if (!val) return '12:00';
  let s = String(val).trim();
  let match = s.match(/(\d{1,2}):(\d{2})/);
  if (match) return `${match[1].padStart(2, '0')}:${match[2]}`;
  return s.slice(0, 5);
}

function formatCleanDate(val) {
  if (!val) return '29/08';
  let s = String(val).trim();
  
  let matchFull = s.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (matchFull) {
    return `${matchFull[3].padStart(2, '0')}/${matchFull[2].padStart(2, '0')}`;
  }
  
  let matchShort = s.match(/(\d{1,2})[/-](\d{1,2})/);
  if (matchShort) {
    return `${matchShort[1].padStart(2, '0')}/${matchShort[2].padStart(2, '0')}`;
  }
  
  try {
    let d = new Date(val);
    if (!isNaN(d.getTime()) && d.getFullYear() > 1970) {
      let day = d.getDate().toString().padStart(2, '0');
      let month = (d.getMonth() + 1).toString().padStart(2, '0');
      return `${day}/${month}`;
    }
  } catch(e) {}
  
  return '29/08';
}

function normalizeDateKey(val) {
  if (!val) return '';
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return '';
    let y = val.getFullYear();
    let m = (val.getMonth() + 1).toString().padStart(2, '0');
    let d = val.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  let s = String(val).trim();
  if (s.includes('GMT') || s.includes('T') || s.includes('Z')) {
    try {
      let d = new Date(val);
      if (!isNaN(d.getTime()) && d.getFullYear() > 1970) {
        let y = d.getFullYear();
        let m = (d.getMonth() + 1).toString().padStart(2, '0');
        let day = d.getDate().toString().padStart(2, '0');
        return `${y}-${m}-${day}`;
      }
    } catch(e) {}
  }
  let m1 = s.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (m1) return `${m1[1]}-${m1[2].padStart(2, '0')}-${m1[3].padStart(2, '0')}`;

  let m2 = s.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (m2) return `${m2[3]}-${m2[2].padStart(2, '0')}-${m2[1].padStart(2, '0')}`;

  let m3 = s.match(/^(\d{1,2})[/-](\d{1,2})$/);
  if (m3) {
    let curYear = new Date().getFullYear();
    return `${curYear}-${m3[2].padStart(2, '0')}-${m3[1].padStart(2, '0')}`;
  }

  try {
    let d = new Date(val);
    if (!isNaN(d.getTime()) && d.getFullYear() > 1970) {
      let y = d.getFullYear();
      let m = (d.getMonth() + 1).toString().padStart(2, '0');
      let day = d.getDate().toString().padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
  } catch(e) {}

  return s;
}

// Lấy danh sách 7 ngày trong tuần tính từ Thứ 2 (T2) đến Chủ Nhật (CN)
// Map lưu baseDate cho từng container lịch để chuyển tuần độc lập
// Map lưu baseDate cho từng container lịch để chuyển tuần độc lập
// Map lưu baseDate cho từng container lịch để chuyển tuần độc lập
// Map lưu baseDate cho từng container lịch để chuyển tuần độc lập
// Map lưu baseDate cho từng container lịch để chuyển tuần độc lập
// Map lưu baseDate cho từng container lịch để chuyển tuần độc lập
// Map lưu baseDate cho từng container lịch để chuyển tuần độc lập
// Map lưu baseDate cho từng container lịch để chuyển tuần độc lập
// Map lưu baseDate cho từng container lịch để chuyển tuần độc lập
const dateStripBaseDates = {};
let currentPickerYear = new Date().getFullYear();
let currentPickerMonth = new Date().getMonth(); // 0 - 11
let currentPickerContainerId = '';
let currentPickerCallback = '';

function updateStickyDateOffset(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    const h = container.offsetHeight;
    if (h > 0) {
      document.documentElement.style.setProperty('--sticky-date-offset', `${h - 2}px`);
    }
  }
}

function formatDateVN(dateStr) {
  if (!dateStr) return '';
  const norm = normalizeDateKey(dateStr);
  const m = norm.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return dateStr;
}

function changeWeekOffset(containerId, offsetWeeks, onDateClickCallback) {
  let base = dateStripBaseDates[containerId] || new Date();
  const newBase = new Date(base);
  newBase.setDate(newBase.getDate() + (offsetWeeks * 7));
  dateStripBaseDates[containerId] = newBase;

  const activeDate = (containerId === 'staff-date-strip-container') ? selectedStaffHistoryDate : selectedAdminHistoryDate;
  renderDateStripComponent(containerId, activeDate, onDateClickCallback);
}

// BẬT MODAL LỊCH THÁNG SELENA SPA
function openMonthPickerModal(containerId, onDateClickCallback) {
  currentPickerContainerId = containerId;
  currentPickerCallback = onDateClickCallback;
  
  const base = dateStripBaseDates[containerId] || new Date();
  currentPickerYear = base.getFullYear();
  currentPickerMonth = base.getMonth();

  renderMonthPickerGrid();
  const modal = document.getElementById('modal-month-calendar-picker');
  if (modal) {
    modal.classList.remove('hidden');
    lucide.createIcons();
  }
}

function closeMonthPickerModal() {
  const modal = document.getElementById('modal-month-calendar-picker');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function changePickerMonth(offset) {
  currentPickerMonth += offset;
  if (currentPickerMonth > 11) {
    currentPickerMonth = 0;
    currentPickerYear += 1;
  } else if (currentPickerMonth < 0) {
    currentPickerMonth = 11;
    currentPickerYear -= 1;
  }
  renderMonthPickerGrid();
}

function renderMonthPickerGrid() {
  const labelEl = document.getElementById('picker-month-header-label');
  const gridEl = document.getElementById('picker-month-grid');
  if (labelEl) {
    labelEl.textContent = `Tháng ${currentPickerMonth + 1} / ${currentPickerYear}`;
  }
  if (!gridEl) return;

  const firstDay = new Date(currentPickerYear, currentPickerMonth, 1);
  const totalDays = new Date(currentPickerYear, currentPickerMonth + 1, 0).getDate();
  const dayOfWeek = firstDay.getDay(); // 0: CN, 1: T2
  const startOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Số ô trống đầu tuần

  const todayStr = normalizeDateKey(new Date());
  const activeDate = (currentPickerContainerId === 'staff-date-strip-container') ? selectedStaffHistoryDate : selectedAdminHistoryDate;

  let html = '';
  for (let i = 0; i < startOffset; i++) {
    html += '<div class="h-8"></div>';
  }

  for (let d = 1; d <= totalDays; d++) {
    const dStr = `${currentPickerYear}-${String(currentPickerMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isToday = dStr === todayStr;
    const isSelected = activeDate !== 'ALL' && dStr === activeDate;

    let btnClass = 'bg-[#FAF6F1] text-[#2D2424] hover:bg-[#FFF0EB] hover:text-[#E58A7B]';
    if (isSelected) {
      btnClass = 'bg-[#E58A7B] text-white font-extrabold shadow-sm';
    } else if (isToday) {
      btnClass = 'bg-[#FFF0EB] border border-[#FCDFD7] text-[#E58A7B] font-extrabold';
    }

    html += `
      <button type="button" onclick="selectPickerDate('${dStr}')" class="h-8 w-8 mx-auto flex items-center justify-center rounded-xl text-xs transition cursor-pointer active:scale-95 ${btnClass}">
        ${d}
      </button>
    `;
  }

  gridEl.innerHTML = html;
}

function selectPickerDate(pickedDateStr) {
  closeMonthPickerModal();
  if (!pickedDateStr) return;
  const normDate = normalizeDateKey(pickedDateStr);
  dateStripBaseDates[currentPickerContainerId] = new Date(normDate + 'T12:00:00');

  if (typeof window[currentPickerCallback] === 'function') {
    window[currentPickerCallback](normDate);
  }
}

function selectPickerToday() {
  const todayStr = normalizeDateKey(new Date());
  selectPickerDate(todayStr);
}

// Lấy danh sách 7 ngày trong tuần tính từ Thứ 2 (T2) đến Chủ Nhật (CN)
function getWeekDaysFromMonday(baseDate = new Date()) {
  const current = new Date(baseDate);
  const day = current.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday);

  const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const weekDays = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = normalizeDateKey(d);
    weekDays.push({
      label: dayLabels[i],
      dayNum: d.getDate(),
      monthNum: d.getMonth() + 1,
      year: d.getFullYear(),
      dateStr: dateStr,
      dateObj: d,
      isToday: dateStr === normalizeDateKey(new Date())
    });
  }

  return weekDays;
}

// Render HTML cho một hàng 7 ngày (1 tuần chiếm đúng 33.333333% của track 300%)
function renderWeekRowHtml(weekDays, currentActive, isAllActive, onDateClickCallback) {
  return `
    <div class="flex items-center justify-between gap-1 text-center flex-shrink-0 box-border" style="width: 33.333333%; min-width: 33.333333%; max-width: 33.333333%;">
      ${weekDays.map(item => {
        const isSelected = !isAllActive && (item.dateStr === currentActive);
        const isToday = item.isToday;

        let bgClass = 'bg-[#F7F2EC] text-[#7E7272] hover:bg-[#FFF0EB] hover:text-[#E58A7B]';
        let labelText = item.label;
        let labelClass = 'text-[10px] text-[#A39696] uppercase font-bold';
        let numClass = 'text-sm font-extrabold text-[#2D2424]';

        if (isSelected) {
          bgClass = 'bg-[#E58A7B] text-white ring-2 ring-[#E58A7B]/40 font-black';
          labelClass = 'text-[10px] text-white/90 uppercase font-extrabold';
          numClass = 'text-sm font-black text-white';
        } else if (isToday) {
          labelClass = 'text-[10px] text-[#E58A7B] uppercase font-extrabold';
          numClass = 'text-sm font-extrabold text-[#E58A7B]';
          bgClass = 'bg-[#FFF0EB] border border-[#FCDFD7] text-[#E58A7B]';
        }

        return `
          <button type="button" onclick="${onDateClickCallback}('${item.dateStr}')" class="flex-1 py-2 px-0.5 rounded-2xl ${bgClass} transition-colors duration-150 active:scale-95 cursor-pointer select-none">
            <span class="block ${labelClass}">${labelText}</span>
            <span class="${numClass}">${item.dayNum}</span>
          </button>
        `;
      }).join('')}
    </div>
  `;
}

// CƠ CHẾ BĂNG CHUYỀN 3 TUẦN LIÊN TỤC CHUẨN XÁC CSS PERCENTAGE 100%
function attachContinuousSwiperToCalendar(containerId, onDateClickCallback) {
  const viewport = document.getElementById(`${containerId}-carousel-viewport`);
  const track = document.getElementById(`${containerId}-carousel-track`);
  if (!viewport || !track) return;

  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let currentDeltaX = 0;
  let isHorizontalMove = false;

  const onTouchStart = (clientX, clientY) => {
    isDragging = true;
    startX = clientX;
    startY = clientY;
    currentDeltaX = 0;
    isHorizontalMove = false;
    track.style.transition = 'none';
  };

  const onTouchMove = (clientX, clientY) => {
    if (!isDragging) return;
    const diffX = clientX - startX;
    const diffY = clientY - startY;

    if (!isHorizontalMove) {
      if (Math.abs(diffX) > 6 && Math.abs(diffX) > Math.abs(diffY)) {
        isHorizontalMove = true;
      } else if (Math.abs(diffY) > 8) {
        isDragging = false;
        return;
      }
    }

    if (isHorizontalMove) {
      currentDeltaX = diffX;
      track.style.transform = `translateX(calc(-33.333333% + ${diffX}px))`;
    }
  };

  const onTouchEnd = () => {
    if (!isDragging) return;
    if (!isHorizontalMove) {
      isDragging = false;
      track.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
      track.style.transform = 'translateX(-33.333333%)';
      return;
    }
    isDragging = false;
    isHorizontalMove = false;

    const threshold = 45; // Kéo qua 45px là xác nhận chuyển tuần
    if (currentDeltaX < -threshold) {
      // Vuốt sang trái -> Trượt sang Tuần Sau
      track.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
      track.style.transform = 'translateX(-66.666667%)';
      setTimeout(() => {
        changeWeekOffset(containerId, 1, onDateClickCallback);
      }, 220);
    } else if (currentDeltaX > threshold) {
      // Vuốt sang phải -> Trượt về Tuần Trước
      track.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
      track.style.transform = 'translateX(0%)';
      setTimeout(() => {
        changeWeekOffset(containerId, -1, onDateClickCallback);
      }, 220);
    } else {
      // Trả về vị trí tuần hiện tại chính giữa tuyệt đối (Snap back)
      track.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
      track.style.transform = 'translateX(-33.333333%)';
    }
  };

  // 1. Touch Events trên điện thoại
  viewport.addEventListener('touchstart', e => {
    onTouchStart(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  viewport.addEventListener('touchmove', e => {
    onTouchMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  viewport.addEventListener('touchend', onTouchEnd, { passive: true });
  viewport.addEventListener('touchcancel', onTouchEnd, { passive: true });

  // 2. Mouse Drag Events trên máy tính
  viewport.addEventListener('mousedown', e => {
    onTouchStart(e.clientX, e.clientY);
    isHorizontalMove = true;
  });

  const onMouseMove = e => {
    if (!isDragging) return;
    onTouchMove(e.clientX, e.clientY);
  };

  const onMouseUp = () => {
    if (isDragging) {
      onTouchEnd();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }
  };

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}

// Component Lịch Tuần Dùng Chung Toàn Diện (Sử Dụng Modal Lịch Tháng Thuần SPA Tuyệt Đẹp)
function renderDateStripComponent(containerId, activeDateStr, onDateClickCallback) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const baseDate = dateStripBaseDates[containerId] || new Date();
  
  // Tính 3 tuần: Tuần Trước, Tuần Này, Tuần Sau
  const prevBase = new Date(baseDate);
  prevBase.setDate(prevBase.getDate() - 7);
  const nextBase = new Date(baseDate);
  nextBase.setDate(nextBase.getDate() + 7);

  const prevWeekDays = getWeekDaysFromMonday(prevBase);
  const currWeekDays = getWeekDaysFromMonday(baseDate);
  const nextWeekDays = getWeekDaysFromMonday(nextBase);

  const currentActive = activeDateStr || 'ALL';
  const isAllActive = currentActive === 'ALL';

  const startLabel = `${currWeekDays[0].dayNum}/${currWeekDays[0].monthNum}`;
  const endLabel = `${currWeekDays[6].dayNum}/${currWeekDays[6].monthNum}`;

  container.innerHTML = `
    <div class="bg-gradient-to-br from-[#FFF0EB] via-[#FFFFFF] to-[#FAF6F1] rounded-[28px] border border-[#F0EAE1] shadow-[0_10px_30px_-5px_rgba(229,138,123,0.05),0_4px_12px_rgba(0,0,0,0.02)] p-3.5 space-y-2.5 touch-pan-y select-none relative overflow-hidden">
      <!-- Header: Khoảng Ngày + Nút Chọn Ngày (Mở Popup Lịch Tháng Tuyệt Đẹp) + Tất Cả -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-1.5 text-xs font-bold text-[#2D2424]">
          <i data-lucide="calendar" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
          <span class="font-mono">${startLabel} — ${endLabel}</span>
        </div>

        <div class="flex items-center gap-1.5">
          <!-- Nút Chọn Ngày (Mở Modal Lịch Tháng Đẹp Chuẩn Spa, Hoạt Động 100% Trên iPhone Safari) -->
          <button type="button" 
                  onclick="openMonthPickerModal('${containerId}', '${onDateClickCallback}')" 
                  class="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-[#FAF6F1] hover:bg-[#FFF0EB] text-[#2D2424] hover:text-[#E58A7B] border border-[#F0EAE1] cursor-pointer transition active:scale-95">
            <i data-lucide="calendar" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
            <span>Chọn ngày</span>
          </button>

          <!-- Nút Xem Tất Cả -->
          <button type="button" onclick="${onDateClickCallback}('ALL')" class="text-[11px] font-extrabold px-3 py-1.5 rounded-xl transition cursor-pointer ${isAllActive ? 'bg-[#E58A7B] text-white font-black' : 'bg-[#FAF6F1] text-[#7E7272] hover:bg-[#FFF0EB] hover:text-[#E58A7B] border border-[#F0EAE1]'}">
            Tất cả
          </button>
        </div>
      </div>

      <!-- BĂNG CHUYỀN 3 TUẦN LIÊN TỤC CĂN GIỮA TUẦN HIỆN TẠI TUYỆT ĐỐI -->
      <div id="${containerId}-carousel-viewport" class="w-full overflow-hidden relative cursor-grab active:cursor-grabbing">
        <div id="${containerId}-carousel-track" class="flex relative" style="width: 300%; transform: translateX(-33.333333%);">
          ${renderWeekRowHtml(prevWeekDays, currentActive, isAllActive, onDateClickCallback)}
          ${renderWeekRowHtml(currWeekDays, currentActive, isAllActive, onDateClickCallback)}
          ${renderWeekRowHtml(nextWeekDays, currentActive, isAllActive, onDateClickCallback)}
        </div>
      </div>
    </div>
  `;

  attachContinuousSwiperToCalendar(containerId, onDateClickCallback);
  lucide.createIcons();
  requestAnimationFrame(() => updateStickyDateOffset(containerId));
}




// Hàm sắp xếp hóa đơn chuẩn xác 100% theo thời gian thực (hỗ trợ mọi định dạng ngày giờ)
function getReceiptSortTimestamp(r) {
  if (!r) return 0;
  if (r.timestamp && !isNaN(Number(r.timestamp))) return Number(r.timestamp);
  
  let dStr = (r.date || '').replace(/\//g, '-');
  let tStr = (r.start_time || r.time || '00:00');
  
  if (r.created_at) {
    let clean = String(r.created_at).replace(/\//g, '-').replace(' - ', ' ').trim();
    let parts = clean.split(' ');
    if (parts[0]) dStr = parts[0];
    if (parts[1]) tStr = parts[1];
  }
  
  if (dStr.includes('-')) {
    let dParts = dStr.split('-');
    if (dParts[0].length === 2 && dParts[2]?.length === 4) {
      // Format DD-MM-YYYY -> YYYY-MM-DD
      dStr = `${dParts[2]}-${dParts[1]}-${dParts[0]}`;
    }
  }
  
  let timeOnly = tStr.split(':').slice(0, 2).join(':');
  let isoStr = `${dStr}T${timeOnly.length === 5 ? timeOnly : '00:00'}:00`;
  let dt = new Date(isoStr);
  let timeVal = dt.getTime();
  return isNaN(timeVal) ? 0 : timeVal;
}


// Hàm làm mới toàn diện mọi giao diện cho cả Admin và KTV ngay lập tức
function refreshAllActiveViews() {
  try {
    const isOwner = currentUser ? isUserOwner(currentUser) : false;
    if (isOwner) {
      if (typeof loadAdminDashboard === 'function') loadAdminDashboard();
      if (typeof loadAdminReceiptsList === 'function') loadAdminReceiptsList();
      if (typeof loadAdminExpensesList === 'function') loadAdminExpensesList();
      if (typeof loadAdminUsersList === 'function') loadAdminUsersList();
      if (typeof loadAdminCustomersList === 'function') loadAdminCustomersList();
    } else {
      if (typeof loadKTVHomeStats === 'function') loadKTVHomeStats();
      if (typeof loadStaffHistoryList === 'function') loadStaffHistoryList();
      if (typeof loadStaffPayrollStats === 'function') loadStaffPayrollStats();
    }
    if (typeof renderAnnouncement === 'function') renderAnnouncement();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  } catch(e) {
    console.warn('Lỗi refreshAllActiveViews:', e);
  }
}
