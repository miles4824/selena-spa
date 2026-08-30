const APP_VERSION = 'v0.0.8.1';
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

const DEFAULT_CUSTOMERS = [
  { phone_number: '0912345678', customer_name: 'Chị Mai Lan', total_visits: 8, voucher_count: 0, notes: 'Da đầu dầu, thích sấy mát' },
  { phone_number: '0988776655', customer_name: 'Anh Nam', total_visits: 3, voucher_count: 0, notes: 'Thích bấm huyệt thái dương' }
];

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
const dateStripBaseDates = {};
const lastSlideDirection = {};

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
  lastSlideDirection[containerId] = offsetWeeks < 0 ? 'slide-from-left' : 'slide-from-right';

  const activeDate = (containerId === 'staff-date-strip-container') ? selectedStaffHistoryDate : selectedAdminHistoryDate;
  renderDateStripComponent(containerId, activeDate, onDateClickCallback);
}

function onCustomDatePicked(containerId, pickedDateStr, onDateClickCallback) {
  if (!pickedDateStr) return;
  const normDate = normalizeDateKey(pickedDateStr);
  dateStripBaseDates[containerId] = new Date(normDate + 'T12:00:00');
  
  if (typeof window[onDateClickCallback] === 'function') {
    window[onDateClickCallback](normDate);
  }
}

// CÀI ĐẶT CẢM ỨNG VUỐT TRÁI / PHẢI ĐỔI TUẦN TRÊN MOBILE
function attachSwipeToCalendar(containerId, onDateClickCallback) {
  const container = document.getElementById(containerId);
  if (!container || container.dataset.swipeAttached) return;
  container.dataset.swipeAttached = 'true';

  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  container.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  container.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    // Nếu vuốt ngang > 35px và khoảng cách ngang lớn hơn dọc
    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        // Vuốt sang trái -> Sang tuần sau (Tiến)
        changeWeekOffset(containerId, 1, onDateClickCallback);
      } else {
        // Vuốt sang phải -> Về tuần trước (Lùi)
        changeWeekOffset(containerId, -1, onDateClickCallback);
      }
    }
  }
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

// Component Lịch Tuần Dùng Chung Toàn Diện (Hỗ Trợ Vuốt Trái/Phải & Chọn Ngày iOS iPhone)
function renderDateStripComponent(containerId, activeDateStr, onDateClickCallback) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const baseDate = dateStripBaseDates[containerId] || new Date();
  const weekDays = getWeekDaysFromMonday(baseDate);
  const currentActive = activeDateStr || 'ALL';
  const isAllActive = currentActive === 'ALL';

  const startLabel = `${weekDays[0].dayNum}/${weekDays[0].monthNum}`;
  const endLabel = `${weekDays[6].dayNum}/${weekDays[6].monthNum}`;
  const animClass = lastSlideDirection[containerId] || '';
  lastSlideDirection[containerId] = null;
  const pickerId = `${containerId}-date-picker`;

  container.innerHTML = `
    <div class="spa-card p-3.5 space-y-2.5 touch-pan-y select-none">
      <!-- Header: Khoảng Ngày + Chọn Ngày (Hỗ trợ iPhone 100%) + Tất Cả -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-1.5 text-xs font-bold text-[#2D2424]">
          <i data-lucide="calendar" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
          <span class="font-mono">${startLabel} — ${endLabel}</span>
        </div>

        <div class="flex items-center gap-1.5">
          <!-- Chọn Ngày Tương Thích Hoàn Hảo iPhone iOS Safari -->
          <label class="relative inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-[#FAF6F1] hover:bg-[#FFF0EB] text-[#2D2424] hover:text-[#E58A7B] border border-[#F0EAE1] cursor-pointer transition active:scale-95 overflow-hidden">
            <i data-lucide="calendar" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
            <span>Chọn ngày</span>
            <input type="date" 
                   id="${pickerId}" 
                   value="${isAllActive ? '' : currentActive}" 
                   onchange="onCustomDatePicked('${containerId}', this.value, '${onDateClickCallback}')" 
                   class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
          </label>

          <!-- Nút Xem Tất Cả -->
          <button type="button" onclick="${onDateClickCallback}('ALL')" class="text-[11px] font-extrabold px-3 py-1.5 rounded-xl transition cursor-pointer ${isAllActive ? 'bg-[#E58A7B] text-white font-black' : 'bg-[#FAF6F1] text-[#7E7272] hover:bg-[#FFF0EB] hover:text-[#E58A7B] border border-[#F0EAE1]'}">
            Tất cả
          </button>
        </div>
      </div>

      <!-- 7 Nút Ngày: T2, T3, T4, T5, T6, T7, CN (Có Thể Vuốt Ngang Trái/Phải Để Chuyển Tuần) -->
      <div id="${containerId}-days-row" class="flex items-center justify-between w-full gap-1.5 text-center ${animClass}">
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
            <button type="button" onclick="${onDateClickCallback}('${item.dateStr}')" class="flex-1 py-2 px-1 rounded-2xl ${bgClass} transition-all duration-200 active:scale-95 cursor-pointer">
              <span class="block ${labelClass}">${labelText}</span>
              <span class="${numClass}">${item.dayNum}</span>
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;

  attachSwipeToCalendar(containerId, onDateClickCallback);
  lucide.createIcons();
  requestAnimationFrame(() => updateStickyDateOffset(containerId));
}
