const APP_VERSION = 'v0.0.7.0';
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
const dateStripBaseDates = {};

function openSystemDatePicker(pickerId) {
  const inp = document.getElementById(pickerId);
  if (!inp) return;
  if (typeof inp.showPicker === 'function') {
    try {
      inp.showPicker();
      return;
    } catch (e) {}
  }
  inp.focus();
  inp.click();
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

function onCustomDatePicked(containerId, pickedDateStr, onDateClickCallback) {
  if (!pickedDateStr) return;
  const normDate = normalizeDateKey(pickedDateStr);
  dateStripBaseDates[containerId] = new Date(normDate + 'T12:00:00');
  
  if (typeof window[onDateClickCallback] === 'function') {
    window[onDateClickCallback](normDate);
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

// Component Lịch Tuần Dùng Chung Toàn Diện (T2 -> CN, Điều Hướng Tuần & Chọn Lịch Nhanh)
function renderDateStripComponent(containerId, activeDateStr, onDateClickCallback) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const baseDate = dateStripBaseDates[containerId] || new Date();
  const weekDays = getWeekDaysFromMonday(baseDate);
  const currentActive = activeDateStr || 'ALL'; // MẶC ĐỊNH LÀ 'ALL'
  const isAllActive = currentActive === 'ALL';

  const startLabel = `${weekDays[0].dayNum}/${weekDays[0].monthNum}`;
  const endLabel = `${weekDays[6].dayNum}/${weekDays[6].monthNum}`;
  const pickerId = `${containerId}-date-picker`;

  container.innerHTML = `
    <div class="spa-card p-3.5 space-y-3">
      <!-- Thanh Điều Hướng: Chuyển Tuần + Nút Chọn Ngày Lịch + Tất Cả -->
      <div class="flex items-center justify-between gap-2 flex-wrap">
        <div class="flex items-center gap-1.5 bg-[#FAF6F1] p-1 rounded-2xl border border-[#F0EAE1]">
          <button type="button" onclick="changeWeekOffset('${containerId}', -1, '${onDateClickCallback}')" title="Tuần trước" class="w-7 h-7 rounded-xl bg-white hover:bg-[#FFF0EB] text-[#7E7272] hover:text-[#E58A7B] flex items-center justify-center transition cursor-pointer active:scale-90">
            <i data-lucide="chevron-left" class="w-4 h-4"></i>
          </button>
          <span class="text-xs font-bold text-[#2D2424] px-1.5 font-mono">
            ${startLabel} — ${endLabel}
          </span>
          <button type="button" onclick="changeWeekOffset('${containerId}', 1, '${onDateClickCallback}')" title="Tuần sau" class="w-7 h-7 rounded-xl bg-white hover:bg-[#FFF0EB] text-[#7E7272] hover:text-[#E58A7B] flex items-center justify-center transition cursor-pointer active:scale-90">
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </button>
        </div>

        <div class="flex items-center gap-1.5">
          <!-- Chọn Ngày Lịch Bất Kỳ -->
          <div class="relative">
            <button type="button" onclick="openSystemDatePicker('${pickerId}')" class="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-xl bg-[#FAF6F1] hover:bg-[#FFF0EB] text-[#2D2424] hover:text-[#E58A7B] border border-[#F0EAE1] cursor-pointer transition active:scale-95">
              <i data-lucide="calendar" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
              <span>Chọn ngày</span>
            </button>
            <input type="date" id="${pickerId}" value="${isAllActive ? '' : currentActive}" onchange="onCustomDatePicked('${containerId}', this.value, '${onDateClickCallback}')" class="absolute inset-0 opacity-0 pointer-events-none w-full h-full">
          </div>

          <!-- Nút Xem Tất Cả -->
          <button type="button" onclick="${onDateClickCallback}('ALL')" class="text-[11px] font-extrabold px-3 py-1.5 rounded-xl transition cursor-pointer ${isAllActive ? 'bg-[#E58A7B] text-white font-black' : 'bg-[#FAF6F1] text-[#7E7272] hover:bg-[#FFF0EB] hover:text-[#E58A7B] border border-[#F0EAE1]'}">
            Tất cả
          </button>
        </div>
      </div>

      <!-- 7 Nút Ngày: T2, T3, T4, T5, T6, T7, CN (Không Có Dấu Chấm Rối Mắt) -->
      <div class="flex items-center justify-between w-full gap-1.5 text-center">
        ${weekDays.map(item => {
          const isSelected = !isAllActive && (item.dateStr === currentActive);
          const isToday = item.isToday;

          let bgClass = 'bg-[#F7F2EC] text-[#7E7272] hover:bg-[#FFF0EB] hover:text-[#E58A7B]';
          let labelText = item.label; // LUÔN LÀ T2, T3, T4, T5, T6, T7, CN
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
            <button type="button" onclick="${onDateClickCallback}('${item.dateStr}')" class="flex-1 py-2 px-1 rounded-2xl ${bgClass} transition active:scale-95 cursor-pointer">
              <span class="block ${labelClass}">${labelText}</span>
              <span class="${numClass}">${item.dayNum}</span>
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;
  lucide.createIcons();
}
