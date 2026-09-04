// =============================================================
// SELENA SPA - ENGINE CONFIG & LOCAL STORAGE (SINGLE SOURCE OF TRUTH)
// =============================================================
const APP_VERSION = 'v0.0.1.1';

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

// 2b. Cấu hình giao diện mặc định & Trình tra cứu tb_config động
const DEFAULT_UI_CONFIG = {
  spa_brand_name: 'SELENA SPA',
  spa_brand_slogan: 'Meditation & Luxury Wellness Care',
  home_greeting_slogan: 'hôm nay sẵn sàng tỏa sáng chưa? ✨',
  home_free_quote: 'Mỗi tour gội là một trải nghiệm thư giãn tuyệt vời gửi gắm đến khách hàng thân yêu.',
  ph_login_phone: '0949251144',
  ph_login_password: '••••••'
};

function getConfig(key, fallback = '') {
  const uiConfig = getStored('ui_config', {});
  const kLower = String(key).toLowerCase();
  const kUpper = String(key).toUpperCase();
  if (uiConfig && typeof uiConfig === 'object') {
    if (uiConfig[key] !== undefined && uiConfig[key] !== '') return uiConfig[key];
    if (uiConfig[kLower] !== undefined && uiConfig[kLower] !== '') return uiConfig[kLower];
    if (uiConfig[kUpper] !== undefined && uiConfig[kUpper] !== '') return uiConfig[kUpper];
  }
  if (DEFAULT_UI_CONFIG[key] !== undefined) return DEFAULT_UI_CONFIG[key];
  if (DEFAULT_UI_CONFIG[kLower] !== undefined) return DEFAULT_UI_CONFIG[kLower];
  return fallback;
}

function applyDynamicUIConfig(customConfig) {
  const cfg = { ...DEFAULT_UI_CONFIG, ...(customConfig || getStored('ui_config', {})) };

  // 1. Cập nhật tên Spa & Slogan (Targeted DOM Mutation - không reload trang)
  const brandNameEls = document.querySelectorAll('.brand-spa-name, #login-brand-name');
  brandNameEls.forEach(el => {
    if (el && cfg.spa_brand_name) el.innerText = cfg.spa_brand_name;
  });

  const brandSloganEls = document.querySelectorAll('.brand-spa-slogan, #login-brand-slogan');
  brandSloganEls.forEach(el => {
    if (el && cfg.spa_brand_slogan) el.innerText = cfg.spa_brand_slogan;
  });

  // 2. Placeholder màn hình Login
  const logPhone = document.getElementById('login-phone');
  if (logPhone && cfg.ph_login_phone) logPhone.placeholder = cfg.ph_login_phone;
  const logPwd = document.getElementById('login-password');
  if (logPwd && cfg.ph_login_password) logPwd.placeholder = cfg.ph_login_password;

  // 3. Cập nhật Title Tab trình duyệt
  if (cfg.spa_brand_name) {
    document.title = `${cfg.spa_brand_name} - ${cfg.spa_brand_slogan || 'Management'}`;
  }
}

// 2c. Cơ chế đồng bộ trực tiếp từ Google Sheets (Bảo vệ đa kênh không cần cài trigger)
const GOOGLE_SPREADSHEET_ID = '1SFFR2sWmOxtRIMOkdlkuKIDYyXJM7IxNyP9gFtZY0L0';

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

let isFetchingSheetConfig = false;
async function fetchLiveConfigFromSheet() {
  if (isFetchingSheetConfig) return;
  isFetchingSheetConfig = true;
  try {
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=tb_config&t=${Date.now()}`;
    const res = await fetch(url);
    if (!res.ok) return;
    const text = await res.text();
    const lines = text.split('\n');
    const newConfig = {};
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const parts = parseCSVLine(line);
      const k = parts[0] ? parts[0].trim() : '';
      const v = parts[1] ? parts[1].trim() : '';
      if (k) {
        newConfig[k] = v;
        newConfig[k.toLowerCase()] = v;
        newConfig[k.toUpperCase()] = v;
      }
    }
    if (Object.keys(newConfig).length > 0) {
      const current = getStored('ui_config', {});
      setStored('ui_config', { ...current, ...newConfig });
      applyDynamicUIConfig(newConfig);

      // Đồng bộ sang Firebase Realtime nếu có kết nối
      if (typeof fbDb !== 'undefined' && fbDb) {
        try {
          fbDb.ref('config/ui_config').update(newConfig);
        } catch(e) {}
      }
    }
  } catch (err) {
    console.warn('⚠️ [Config Sync] Lỗi kết nối Google Sheet:', err);
  } finally {
    isFetchingSheetConfig = false;
  }
}

// Tự động kích hoạt cơ chế kéo Realtime:
// 1. Chạy mỗi khi người dùng click chuột quay lại tab App (focus)
// 2. Chạy chu kỳ ngầm mỗi 5 giây
if (typeof window !== 'undefined') {
  window.addEventListener('focus', () => {
    fetchLiveConfigFromSheet();
  });
  setInterval(fetchLiveConfigFromSheet, 5000);
}

// 3. Quản trị phiên người dùng hiện tại
let currentUser = null;

function isUserOwner(u) {
  if (!u) return false;
  const role = String(u.role || '').toLowerCase();
  const phone = (typeof PhoneService !== 'undefined') ? PhoneService.normalize(u.phone) : String(u.phone || '').trim();
  return (role === 'admin' || role === 'chủ tiệm' || role === 'chủ sáng lập' || role === 'owner' || phone === '0949251144');
}

// 4. Quản lý Chế độ Sáng / Tối (Theme Manager - Light & Dark Mode)
function getTheme() {
  const saved = localStorage.getItem('selena_theme');
  if (saved === 'dark' || saved === 'light') return saved;

  // Mặc định tự động theo giờ thực tế: 6h - 18h là Light Mode, 18h - 6h là Dark Mode
  const currentHour = new Date().getHours();
  return (currentHour < 6 || currentHour >= 18) ? 'dark' : 'light';
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
  // Tự động dọn cache cũ nếu trước đó bị kẹt dark do auto-read OS
  if (localStorage.getItem('selena_palette_version') !== 'mindora_v1') {
    localStorage.removeItem('selena_theme');
    localStorage.setItem('selena_palette_version', 'mindora_v1');
  }
  setTheme(getTheme());
}

function updateThemeToggleIcons() {
  const isDark = getTheme() === 'dark';
  document.querySelectorAll('.theme-toggle-icon').forEach(el => {
    el.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
  });
  if (typeof lucide !== 'undefined') lucide.createIcons();
}
