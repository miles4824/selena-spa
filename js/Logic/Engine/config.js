// =============================================================
// SELENA SPA - ENGINE CONFIG & LOCAL STORAGE (SINGLE SOURCE OF TRUTH)
// =============================================================
const APP_VERSION = 'v0.0.1.0';

// 1. Danh sách người dùng mặc định ban đầu
const DEFAULT_USERS = [
  {
    user_id: '0949251144',
    staff_id: 'FOUNDER_01',
    phone: '0949251144',
    password: '123',
    full_name: 'Miles',
    role: 'admin',
    salary_type: 'owner',
    commission_rate: 0,
    base_salary: 0,
    bank_name: 'MBBank',
    bank_account_no: '0949251144',
    bank_account_name: 'NGUYEN TIEN DUY'
  },
  {
    user_id: '0799625591',
    staff_id: 'KTV01',
    phone: '0799625591',
    password: '123',
    full_name: 'Thu Ngân',
    role: 'staff',
    salary_type: 'fixed',
    commission_rate: 10,
    base_salary: 2000000,
    bank_name: 'MBBank',
    bank_account_no: '0799625591',
    bank_account_name: 'NGUYEN THI THU NGAN'
  },
  {
    user_id: '0912345678',
    staff_id: 'KTV02',
    phone: '0912345678',
    password: '123',
    full_name: 'KTV Mai Lan',
    role: 'staff',
    salary_type: 'commission',
    commission_rate: 20,
    base_salary: 0,
    bank_name: 'MBBank',
    bank_account_no: '0912345678',
    bank_account_name: 'KTV MAI LAN'
  }
];

// 2. Bộ nhớ cục bộ LocalStorage (Đọc / Ghi an toàn)
function getStored(key, fallback) {
  try {
    const val = localStorage.getItem('selena_' + key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    console.error('Error reading storage for ' + key, e);
    return fallback;
  }
}

function setStored(key, val) {
  try {
    localStorage.setItem('selena_' + key, JSON.stringify(val));
  } catch (e) {
    console.error('Error saving storage for ' + key, e);
  }
}

// 3. Quản trị phiên người dùng hiện tại
let currentUser = null;

function isUserOwner(u) {
  if (!u) return false;
  const role = String(u.role || '').toLowerCase();
  const phone = (typeof PhoneService !== 'undefined') ? PhoneService.normalize(u.phone) : String(u.phone || '').trim();
  return (role === 'admin' || role === 'chủ tiệm' || role === 'chủ sáng lập' || role === 'owner' || phone === '0949251144');
}
// 4. Quản lý Chế độ Sáng / Tối (Tự động theo thời gian thực: 6h - 18h Sáng, 18h - 6h Tối)
function getTheme() {
  // 1. Ưu tiên lựa chọn người dùng đã tự tay bấm công tắc
  const saved = localStorage.getItem('selena_theme');
  if (saved === 'dark' || saved === 'light') return saved;

  // 2. Mặc định tự động theo THỜI GIAN THỰC TẾ TRONG NGÀY
  const currentHour = new Date().getHours();
  const isNight = currentHour < 6 || currentHour >= 18; // Trước 6h sáng hoặc sau 18h tối là ban đêm
  return isNight ? 'dark' : 'light';
}

function setTheme(theme) {
  localStorage.setItem('selena_theme', theme);
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
  }
  updateThemeToggleIcons();
}

function toggleTheme() {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
}

function initTheme() {
  setTheme(getTheme());
}

function updateThemeToggleIcons() {
  const isDark = getTheme() === 'dark';
  document.querySelectorAll('.theme-toggle-icon').forEach(el => {
    el.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}
