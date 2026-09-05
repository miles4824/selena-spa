// =========================================================================
// SELENA SPA - GOOGLE APPS SCRIPT API CLIENT (GAS CLIENT)
// Dong bo 2 chieu sieu toc giua App va Google Sheets
// =========================================================================

const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbwQ-Dwr2zCWWWMPWBCyVIfwDirofgvjD8S7Ug-5OSNLHvM63Gw0nSCa10BqhpD5g8id/exec';

function getGasUrl() {
  let url = localStorage.getItem('selena_gas_url') || DEFAULT_GAS_URL;
  if (!url || url.includes('AKfycbyLuh0304rL-59hJq-wzP3h-a6lH-v9C-s')) {
    url = DEFAULT_GAS_URL;
    localStorage.setItem('selena_gas_url', DEFAULT_GAS_URL);
  }
  return url;
}

function saveGasUrl(newUrl) {
  const url = (newUrl || '').trim() || DEFAULT_GAS_URL;
  localStorage.setItem('selena_gas_url', url);
  if (typeof refreshDataFromGoogleSheets === 'function') {
    refreshDataFromGoogleSheets();
  }
}

/**
 * Goi API Google Apps Script voi co che xac thuc va bao ve du lieu
 * @param {string} action - Ten hanh dong ('create_receipt' | 'sync_all_data' | 'check_customer' ...)
 * @param {object} payload - Du lieu gui kem
 */
async function callGasApi(action, payload = {}) {
  const gasUrl = getGasUrl();
  if (!gasUrl || !gasUrl.startsWith('http')) return null;

  const cUser = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : null;
  const authPayload = {
    client_phone: cUser ? (typeof normalizePhone === 'function' ? normalizePhone(cUser.phone) : String(cUser.phone).replace(/[^0-9]/g, '')) : '',
    client_staff_id: cUser ? (cUser.staff_id || cUser.id || '') : '',
    client_role: cUser ? (cUser.role || '') : '',
    ...payload
  };

  try {
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...authPayload })
    });

    if (!res.ok) {
      console.warn('[GAS API] HTTP ' + res.status + ' cho action: ' + action);
      return null;
    }

    const text = await res.text();
    try {
      const data = JSON.parse(text);
      console.log('[GAS API] Thanh cong cho action ' + action + ':', data);
      return data;
    } catch (e) {
      return { status: 'success', raw: text };
    }
  } catch (err) {
    console.warn('[GAS API] Ngoai le ket noi (' + action + '):', err.message);
    return null;
  }
}

/**
 * Tai toan bo du lieu moi nhat tu Google Sheets ve luu cache cuc bo
 */
async function refreshDataFromGoogleSheets() {
  const btn = document.getElementById('btn-sync-cloud');
  if (btn) {
    btn.innerHTML = '<i data-lucide=" loader-2\ class=\w-4 h-4 animate-spin text-[#E58A7B]\></i> <span class=\hidden sm:inline\>Dang tai...</span>';
 if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
 }

 try {
 const result = await callGasApi('sync_all_data');
 if (result && (result.status === 'success' || result.success === true)) {
 const payload = result.data || result;
 if (Array.isArray(payload.categories) && payload.categories.length > 0) {
 if (typeof setStored === 'function') setStored('categories', payload.categories);
 }
 if (Array.isArray(payload.menu) && payload.menu.length > 0) {
 if (typeof setStored === 'function') setStored('menu', payload.menu);
 }
 if (Array.isArray(payload.users) && payload.users.length > 0) {
 if (typeof setStored === 'function') setStored('users', payload.users);
 }
 if (Array.isArray(payload.customers)) {
 if (typeof setStored === 'function') setStored('customers', payload.customers);
 }
 if (Array.isArray(payload.receipts)) {
 if (typeof setStored === 'function') setStored('receipts', payload.receipts);
 }
 if (Array.isArray(payload.payroll_logs)) {
 if (typeof setStored === 'function') setStored('payroll_logs', payload.payroll_logs);
 } else if (Array.isArray(payload.tb_payroll_logs)) {
 if (typeof setStored === 'function') setStored('payroll_logs', payload.tb_payroll_logs);
 }
 if (Array.isArray(payload.expenses)) {
 if (typeof setStored === 'function') setStored('expenses', payload.expenses);
 }
 if (Array.isArray(payload.loyalty_cycles)) {
 if (typeof setStored === 'function') setStored('loyalty_cycles', payload.loyalty_cycles);
 }
 if (Array.isArray(payload.vouchers)) {
 if (typeof setStored === 'function') setStored('vouchers', payload.vouchers);
 }

 if (typeof refreshAllActiveViews === 'function') {
 refreshAllActiveViews();
 }
 console.log('✅ [GAS Client] Da dong bo toan bo du lieu tu Google Sheets ve may thanh cong!');
 }
 } catch (err) {
 console.error('Loi refreshDataFromGoogleSheets:', err);
 } finally {
 if (btn) {
 btn.innerHTML = '<i data-lucide=\cloud\ class=\w-4 h-4\></i> <span class=\hidden sm:inline\>Dong bo</span>';
 if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
 }
 }
}

// Xuat ra pham vi toan cuc
if (typeof window !== 'undefined') {
 window.DEFAULT_GAS_URL = DEFAULT_GAS_URL;
 window.getGasUrl = getGasUrl;
 window.saveGasUrl = saveGasUrl;
 window.callGasApi = callGasApi;
 window.refreshDataFromGoogleSheets = refreshDataFromGoogleSheets;
}
