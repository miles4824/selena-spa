function matchPhone(p1, p2) { return isSamePhone(p1, p2); }
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

const APP_VERSION = 'v0.0.7.4';
// =============================================================
// SELENA SPA - GLOBAL CONFIG & CONSTANTS
// =============================================================
const DEFAULT_USERS = [
  { user_id: '0949251144', staff_id: 'FOUNDER_01', phone: '0949251144', password: '123', full_name: 'Miles', role: 'admin', salary_type: 'owner', commission_rate: 0, base_salary: 0, bank_name: 'MBBank', bank_account_no: '0949251144', bank_account_name: 'NGUYEN TIEN DUY' },
  { user_id: '0799625591', staff_id: 'KTV01', phone: '0799625591', password: '123', full_name: 'Thu Ngân', role: 'staff', salary_type: 'fixed', commission_rate: 10, base_salary: 2000000, bank_name: 'MBBank', bank_account_no: '0799625591', bank_account_name: 'NGUYEN THI THU NGAN' },
  { user_id: '0912345678', staff_id: 'KTV02', phone: '0912345678', password: '123', full_name: 'KTV Mai Lan', role: 'staff', salary_type: 'commission', commission_rate: 20, base_salary: 0, bank_name: 'MBBank', bank_account_no: '0912345678', bank_account_name: 'KTV MAI LAN' }
];

const DEFAULT_MENU = [
  // 1. Combo Gội Chính
  { service_id: 'CB_BE', service_name: 'Combo Bé', price: 45000, duration_min: 30, cosmetics_cost: 4500, commission_type: 'fixed', commission_value: 4500, is_active: true },
  { service_id: 'CB_01', service_name: 'Combo 1', price: 64000, duration_min: 50, cosmetics_cost: 6400, commission_type: 'fixed', commission_value: 6400, is_active: true },
  { service_id: 'CB_02', service_name: 'Combo 2', price: 109000, duration_min: 75, cosmetics_cost: 10000, commission_type: 'fixed', commission_value: 11000, is_active: true },
  { service_id: 'CB_03', service_name: 'Combo 3', price: 139000, duration_min: 85, cosmetics_cost: 14000, commission_type: 'fixed', commission_value: 14000, is_active: true },
  { service_id: 'CB_04', service_name: 'Combo 4', price: 179000, duration_min: 95, cosmetics_cost: 18000, commission_type: 'fixed', commission_value: 18000, is_active: true },
  { service_id: 'CB_05', service_name: 'Combo 5', price: 219000, duration_min: 110, cosmetics_cost: 22000, commission_type: 'fixed', commission_value: 22000, is_active: true },

  // 2. Làm Thêm / Da Đầu
  { service_id: 'DV_TM01', service_name: 'Tẩy tế bào chết da đầu', price: 30000, duration_min: 15, cosmetics_cost: 3000, commission_type: 'fixed', commission_value: 3000, is_active: true },
  { service_id: 'DV_TM02', service_name: 'Xông tai nến', price: 40000, duration_min: 20, cosmetics_cost: 5000, commission_type: 'fixed', commission_value: 4000, is_active: true },
  { service_id: 'DV_TM03', service_name: 'Xông hơi da đầu với thảo dược', price: 40000, duration_min: 20, cosmetics_cost: 4000, commission_type: 'fixed', commission_value: 4000, is_active: true },
  { service_id: 'DV_TM04', service_name: 'Đắp mặt nạ', price: 15000, duration_min: 15, cosmetics_cost: 3000, commission_type: 'fixed', commission_value: 2000, is_active: true },
  { service_id: 'DV_TM05', service_name: 'Gội đầu thêm', price: 10000, duration_min: 10, cosmetics_cost: 1000, commission_type: 'fixed', commission_value: 1000, is_active: true },

  // 3. Massage Trị Liệu & Thư Giãn
  { service_id: 'DV_MS01', service_name: 'Massage body (đá nóng)', price: 219000, duration_min: 90, cosmetics_cost: 10000, commission_type: 'fixed', commission_value: 22000, is_active: true },
  { service_id: 'DV_MS02', service_name: 'Massage tay (đá nóng)', price: 40000, duration_min: 20, cosmetics_cost: 2000, commission_type: 'fixed', commission_value: 4000, is_active: true },
  { service_id: 'DV_MS03', service_name: 'Massage chân (đá nóng)', price: 40000, duration_min: 20, cosmetics_cost: 2000, commission_type: 'fixed', commission_value: 4000, is_active: true },
  { service_id: 'DV_MS04', service_name: 'Massage lưng (đá nóng)', price: 50000, duration_min: 25, cosmetics_cost: 3000, commission_type: 'fixed', commission_value: 5000, is_active: true },
  { service_id: 'DV_MS05', service_name: 'Massage cổ vai gáy (đá nóng)', price: 30000, duration_min: 15, cosmetics_cost: 2000, commission_type: 'fixed', commission_value: 3000, is_active: true },
  { service_id: 'DV_MS06', service_name: 'Massage mặt', price: 10000, duration_min: 10, cosmetics_cost: 1000, commission_type: 'fixed', commission_value: 1000, is_active: true },
  { service_id: 'DV_MS07', service_name: 'Massage đầu', price: 10000, duration_min: 10, cosmetics_cost: 1000, commission_type: 'fixed', commission_value: 1000, is_active: true },
  { service_id: 'DV_MS08', service_name: 'Massage trán (không đá nóng)', price: 10000, duration_min: 10, cosmetics_cost: 1000, commission_type: 'fixed', commission_value: 1000, is_active: true },
  { service_id: 'DV_MS09', service_name: 'Massage trán (đá nóng)', price: 15000, duration_min: 10, cosmetics_cost: 1500, commission_type: 'fixed', commission_value: 1500, is_active: true },

  // 4. Waxing
  { service_id: 'DV_WX01', service_name: 'Wax nách', price: 50000, duration_min: 15, cosmetics_cost: 5000, commission_type: 'fixed', commission_value: 5000, is_active: true },
  { service_id: 'DV_WX02', service_name: 'Wax 1/2 tay', price: 100000, duration_min: 20, cosmetics_cost: 10000, commission_type: 'fixed', commission_value: 10000, is_active: true },
  { service_id: 'DV_WX03', service_name: 'Wax full tay', price: 180000, duration_min: 30, cosmetics_cost: 16000, commission_type: 'fixed', commission_value: 18000, is_active: true },
  { service_id: 'DV_WX04', service_name: 'Wax 1/2 chân', price: 120000, duration_min: 25, cosmetics_cost: 11000, commission_type: 'fixed', commission_value: 12000, is_active: true },
  { service_id: 'DV_WX05', service_name: 'Wax full chân', price: 200000, duration_min: 35, cosmetics_cost: 18000, commission_type: 'fixed', commission_value: 20000, is_active: true },
  { service_id: 'DV_WX06', service_name: 'Wax bikini', price: 190000, duration_min: 30, cosmetics_cost: 18000, commission_type: 'fixed', commission_value: 19000, is_active: true },

  // 5. Nặn Mụn & Peel
  { service_id: 'DV_PL01', service_name: 'Nặn mụn chuẩn y khoa', price: 179000, duration_min: 45, cosmetics_cost: 15000, commission_type: 'fixed', commission_value: 18000, is_active: true },
  { service_id: 'DV_PL02', service_name: 'Peel mụn', price: 399000, duration_min: 45, cosmetics_cost: 35000, commission_type: 'fixed', commission_value: 40000, is_active: true },
  { service_id: 'DV_PL03', service_name: 'Peel TCA thu nhỏ lcl', price: 399000, duration_min: 45, cosmetics_cost: 35000, commission_type: 'fixed', commission_value: 40000, is_active: true },
  { service_id: 'DV_PL04', service_name: 'Peel Tảo Ý căng bóng', price: 499000, duration_min: 50, cosmetics_cost: 45000, commission_type: 'fixed', commission_value: 50000, is_active: true },
  { service_id: 'DV_PL05', service_name: 'Peel phục hồi, thải cort', price: 499000, duration_min: 50, cosmetics_cost: 45000, commission_type: 'fixed', commission_value: 50000, is_active: true },
  { service_id: 'DV_PL06', service_name: 'Peel trắng da căng bóng phục hồi', price: 599000, duration_min: 60, cosmetics_cost: 55000, commission_type: 'fixed', commission_value: 60000, is_active: true },
  { service_id: 'DV_PL07', service_name: 'Peel nám', price: 699000, duration_min: 60, cosmetics_cost: 65000, commission_type: 'fixed', commission_value: 70000, is_active: true },
  { service_id: 'DV_PL08', service_name: 'Peel thâm nách', price: 499000, duration_min: 40, cosmetics_cost: 45000, commission_type: 'fixed', commission_value: 50000, is_active: true },
  { service_id: 'DV_PL09', service_name: 'Peel lưng - mông', price: 599000, duration_min: 60, cosmetics_cost: 55000, commission_type: 'fixed', commission_value: 60000, is_active: true },

  // 6. Detox
  { service_id: 'DV_DT01', service_name: 'CO2 Therapy', price: 349000, duration_min: 45, cosmetics_cost: 30000, commission_type: 'fixed', commission_value: 35000, is_active: true },
  { service_id: 'DV_DT02', service_name: 'Deepclean + detox đu đủ', price: 399000, duration_min: 50, cosmetics_cost: 35000, commission_type: 'fixed', commission_value: 40000, is_active: true },
  { service_id: 'DV_DT03', service_name: 'Detox than tre + căng bóng', price: 449000, duration_min: 50, cosmetics_cost: 40000, commission_type: 'fixed', commission_value: 45000, is_active: true },

  // 7. Cấy Dưỡng Chuyên Sâu
  { service_id: 'DV_CY01', service_name: 'Cấy tảo xoắn nano', price: 199000, duration_min: 45, cosmetics_cost: 20000, commission_type: 'fixed', commission_value: 20000, is_active: true },
  { service_id: 'DV_CY02', service_name: 'Cấy hồng sâm', price: 199000, duration_min: 45, cosmetics_cost: 20000, commission_type: 'fixed', commission_value: 20000, is_active: true },
  { service_id: 'DV_CY03', service_name: 'Cấy trắng', price: 299000, duration_min: 50, cosmetics_cost: 30000, commission_type: 'fixed', commission_value: 30000, is_active: true },
  { service_id: 'DV_CY04', service_name: 'Cấy trắng căng bóng', price: 399000, duration_min: 60, cosmetics_cost: 40000, commission_type: 'fixed', commission_value: 40000, is_active: true }
];

const DEFAULT_ADDONS = [
  { addon_id: 'AD01', name: 'Massage Cổ Vai Gáy Chuyên Sâu', price: 50000, duration_min: 20, icon: '💆' },
  { addon_id: 'AD02', name: 'Tẩy Tế Bào Chết Da Đầu Thảo Dược', price: 40000, duration_min: 15, icon: '🧖' },
  { addon_id: 'AD03', name: 'Đắp Mặt Nạ Thảo Mộc / Collagen', price: 30000, duration_min: 10, icon: '🥑' },
  { addon_id: 'AD04', name: 'Xông Hơi Tinh Dầu Trị Liệu', price: 35000, duration_min: 15, icon: '🌿' },
  { addon_id: 'AD05', name: 'Massage Nâng Cơ Mặt Ngọc Thạch', price: 60000, duration_min: 20, icon: '💆‍♀️' }
];

let selectedAddonIds = [];

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
let selectedCartItems = [];
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

function formatCleanTime(val, createdAtFallback) {
  let createdTime = '';
  if (createdAtFallback) {
    let matchC = String(createdAtFallback).match(/(\d{1,2}):(\d{2})/);
    if (matchC) createdTime = `${matchC[1].padStart(2, '0')}:${matchC[2]}`;
  }

  if (val instanceof Date) {
    let h = val.getHours().toString().padStart(2, '0');
    let m = val.getMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  let s = String(val || '').trim();
  let match = s.match(/(\d{1,2}):(\d{2})/);
  let valTime = match ? `${match[1].padStart(2, '0')}:${match[2]}` : '';

  if (createdTime && valTime) {
    let pVal = valTime.split(':').map(Number);
    let pCre = createdTime.split(':').map(Number);
    let diff = (pVal[0] * 60 + pVal[1]) - (pCre[0] * 60 + pCre[1]);
    if (diff === 17 || diff === -1423 || diff === 16 || diff === 18) {
      return createdTime;
    }
  }

  return valTime || createdTime || '12:00';
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
    const isFuture = dStr > todayStr;

    if (isFuture) {
      html += `
        <button type="button" disabled class="h-8 w-8 mx-auto flex items-center justify-center rounded-xl text-xs text-[#B8ACA2] bg-[#F6F1EA]/60 cursor-not-allowed pointer-events-none font-semibold">
          ${d}
        </button>
      `;
      continue;
    }

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
  const todayStr = normalizeDateKey(new Date());
  return `
    <div class="flex items-center justify-between gap-1 text-center flex-shrink-0 box-border" style="width: 33.333333%; min-width: 33.333333%; max-width: 33.333333%;">
      ${weekDays.map(item => {
        const isSelected = !isAllActive && (item.dateStr === currentActive);
        const isToday = item.isToday;
        const isFuture = item.dateStr > todayStr;

        let bgClass = 'bg-[#F7F2EC] text-[#7E7272] hover:bg-[#FFF0EB] hover:text-[#E58A7B]';
        let labelText = item.label;
        let labelClass = 'text-[10px] text-[#A39696] uppercase font-bold';
        let numClass = 'text-sm font-extrabold text-[#2D2424]';

        if (isFuture) {
          return `
            <button type="button" disabled class="flex-1 py-2 px-0.5 rounded-2xl bg-[#F6F1EA] border border-[#EFE8DE] cursor-not-allowed pointer-events-none select-none">
              <span class="block text-[10px] text-[#B8ACA2] uppercase font-bold">${labelText}</span>
              <span class="text-sm font-extrabold text-[#B8ACA2]">${item.dayNum}</span>
            </button>
          `;
        }

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


// =============================================================
// THÔNG BÁO TOAST SANG TRỌNG (THAY THẾ HOÀN TOÀN POPUP ALERT THÔ CỦA TRÌNH DUYỆT)
// =============================================================
function showToast(message, type = 'success') {
  try {
    let toastContainer = document.getElementById('selena-toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'selena-toast-container';
      toastContainer.className = 'fixed top-5 left-1/2 -translate-x-1/2 z-[99999] flex flex-col gap-2.5 pointer-events-none w-[92%] max-w-sm';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    const isSuccess = type === 'success' || !type;
    const isWarn = type === 'warn' || type === 'warning';
    const bgClass = isSuccess ? 'bg-[#2E7D6D] text-white shadow-[#2E7D6D]/30' : (isWarn ? 'bg-[#D97706] text-white shadow-[#D97706]/30' : 'bg-[#2D2424] text-white shadow-black/30');
    const icon = isSuccess ? 'check-circle-2' : (isWarn ? 'alert-triangle' : 'info');

    toast.className = `${bgClass} shadow-xl rounded-2xl p-3.5 flex items-start gap-2.5 pointer-events-auto transition-all duration-300 transform -translate-y-5 opacity-0 border border-white/15 backdrop-blur-lg text-xs`;
    
    // Tách dòng thông báo đẹp mắt
    const cleanLines = String(message).split('\n').filter(Boolean);
    const contentHtml = cleanLines.map((line, idx) => {
      if (idx === 0) {
        return `<div class="font-extrabold text-sm text-white leading-snug">${line}</div>`;
      }
      return `<div class="text-[11px] text-white/90 mt-0.5 leading-relaxed">${line}</div>`;
    }).join('');

    toast.innerHTML = `
      <div class="p-1 rounded-xl bg-white/20 shrink-0 mt-0.5 flex items-center justify-center">
        <i data-lucide="${icon}" class="w-4 h-4 text-white"></i>
      </div>
      <div class="flex-1 min-w-0">${contentHtml}</div>
      <button type="button" class="text-white/70 hover:text-white shrink-0 ml-1 p-0.5 text-sm cursor-pointer" onclick="this.parentElement.remove()">✕</button>
    `;

    toastContainer.appendChild(toast);
    if (typeof lucide !== 'undefined') lucide.createIcons();

    requestAnimationFrame(() => {
      toast.classList.remove('-translate-y-5', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    setTimeout(() => {
      toast.classList.add('-translate-y-5', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  } catch(e) {
    console.log('Toast log:', message);
  }
}

// Thay thế hoàn toàn alert mặc định của trình duyệt để không bao giờ hiện popup khó chịu
window.alert = function(msg) {
  showToast(msg, 'success');
};

// =============================================================
// DYNAMIC UI CONFIGURATION (ĐỒNG BỘ ĐỘNG TỪ GOOGLE SHEETS TB_CONFIG)
// =============================================================
const DEFAULT_UI_CONFIG = {
  ph_phone: 'Số điện thoại',
  ph_customer_name: 'Tên khách hàng',
  ph_notes: 'Ghi chú chi tiết sở thích hoặc lưu ý về khách...',
  opt_birth_month: '-- Tháng --',
  opt_select_service: '-- Chọn thêm dịch vụ / sản phẩm --',
  opt_select_service_all_selected: '-- Tất cả dịch vụ đã được chọn --',
  optgroup_combos: '💆 Combo Gội Chính',
  optgroup_addons: '✨ Dịch Vụ Lẻ / Làm Thêm',
  ph_login_phone: '0949251144',
  ph_login_password: '••••••',
  ph_admin_cust_search: '🔍 Tìm kiếm theo tên hoặc số điện thoại...',
  ph_add_exp_amount: 'Ví dụ: 350000',
  ph_add_exp_note: 'Ghi chú chi tiết...',
  ph_announcement: 'Nhập thông báo gửi đến toàn thể kỹ thuật viên...',
  ph_gift_voucher_note: 'VD: Khách VIP, Quà tri ân...'
};

function applyDynamicUIConfig(customConfig) {
  const cfg = { ...DEFAULT_UI_CONFIG, ...(customConfig || getStored('ui_config', {})) };

  // 1. Placeholder Số Điện Thoại
  ['pos-customer-phone', 'modal-staff-note-guest-phone', 'modal-owner-edit-phone'].forEach(id => {
    const el = document.getElementById(id);
    if (el && cfg.ph_phone) el.placeholder = cfg.ph_phone;
  });

  // 2. Placeholder Tên Khách Hàng
  ['pos-customer-name', 'modal-staff-note-guest-name', 'modal-owner-edit-name'].forEach(id => {
    const el = document.getElementById(id);
    if (el && cfg.ph_customer_name) el.placeholder = cfg.ph_customer_name;
  });

  // 3. Placeholder Ghi Chú
  ['modal-staff-note-content', 'modal-owner-edit-notes'].forEach(id => {
    const el = document.getElementById(id);
    if (el && cfg.ph_notes) el.placeholder = cfg.ph_notes;
  });

  // 4. Default Text Dropdown Sinh Nhật
  ['pos-birth-month', 'modal-staff-note-guest-birth-month', 'modal-staff-note-regular-birth-month', 'modal-owner-edit-birth-month'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.options && el.options[0] && cfg.opt_birth_month) {
      el.options[0].text = cfg.opt_birth_month;
    }
  });

  // 4b. Default Text Dropdown Chọn Dịch Vụ POS
  const sDropdown = document.getElementById('pos-service-dropdown');
  if (sDropdown && sDropdown.options && sDropdown.options[0] && cfg.opt_select_service && !sDropdown.disabled) {
    sDropdown.options[0].text = cfg.opt_select_service;
  }

  // 5. Login
  const logPhone = document.getElementById('login-phone');
  if (logPhone && cfg.ph_login_phone) logPhone.placeholder = cfg.ph_login_phone;
  const logPwd = document.getElementById('login-password');
  if (logPwd && cfg.ph_login_password) logPwd.placeholder = cfg.ph_login_password;

  // 6. Admin Search & Expenses
  const admSearch = document.getElementById('admin-customer-search-input');
  if (admSearch && cfg.ph_admin_cust_search) admSearch.placeholder = cfg.ph_admin_cust_search;
  const expAmt = document.getElementById('input-exp-amount');
  if (expAmt && cfg.ph_add_exp_amount) expAmt.placeholder = cfg.ph_add_exp_amount;
  const expNote = document.getElementById('input-exp-note');
  if (expNote && cfg.ph_add_exp_note) expNote.placeholder = cfg.ph_add_exp_note;
  const annContent = document.getElementById('input-announcement-content');
  if (annContent && cfg.ph_announcement) annContent.placeholder = cfg.ph_announcement;
  const giftNote = document.getElementById('modal-gift-notes');
  if (giftNote && cfg.ph_gift_voucher_note) giftNote.placeholder = cfg.ph_gift_voucher_note;
}
