// =============================================================
// TAB 4: WALLET - SECURE GOOGLE APPS SCRIPT API & CLOUD SYNC
// =============================================================
const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbwQ-Dwr2zCWWWMPWBCyVIfwDirofgvjD8S7Ug-5OSNLHvM63Gw0nSCa10BqhpD5g8id/exec';

function getGasUrl() {
  let url = localStorage.getItem('selena_gas_url') || DEFAULT_GAS_URL;
  if (!url || url.includes('AKfycbyLuh0304rL-59hJq-wzP3h-a6lH-v9C-s')) {
    url = DEFAULT_GAS_URL;
    localStorage.setItem('selena_gas_url', DEFAULT_GAS_URL);
  }
  return url;
}

function saveGasUrl() {
  const url = document.getElementById('setting-gas-url').value.trim();
  localStorage.setItem('selena_gas_url', url || DEFAULT_GAS_URL);
  alert('✅ Đã lưu cấu hình Google Apps Script URL!');
  refreshDataFromGoogleSheets();
}

function resetLocalDataAndResync() {
  if (!confirm('⚠️ Bạn có chắc chắn muốn xóa cache dữ liệu cũ trên máy này và tải dữ liệu mới nhất từ Google Sheets về không?')) return;
  localStorage.removeItem('selena_receipts');
  localStorage.removeItem('selena_customers');
  localStorage.removeItem('selena_expenses');
  localStorage.removeItem('selena_users');
  localStorage.removeItem('selena_menu');
  localStorage.removeItem('selena_announcement');
  localStorage.removeItem('selena_gas_url');
  alert('🧹 Đã xóa cache thành công! Đang đồng bộ lại từ Google Sheets...');
  refreshDataFromGoogleSheets();
}

async function callGasApi(action, payload = {}) {
  const gasUrl = getGasUrl();
  if (!gasUrl || !gasUrl.startsWith('http')) return null;

  const authPayload = {
    client_phone: currentUser ? normalizePhone(currentUser.phone) : '',
    client_staff_id: currentUser ? currentUser.staff_id : '',
    client_role: currentUser ? currentUser.role : '',
    ...payload
  };

  try {
    const res = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...authPayload })
    });
    if (!res.ok) return null;
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch(e) {
      return { status: 'success', raw: text };
    }
  } catch (err) {
    // Chế độ offline tự động lưu vào localStorage và không ngắt luồng
    return null;
  }
}

async function refreshDataFromGoogleSheets() {
  const btn = document.getElementById('btn-sync-cloud');
  if (btn) {
    btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin text-[#E58A7B]"></i> <span class="hidden sm:inline">Đang tải...</span>';
    lucide.createIcons();
  }

  try {
    const result = await callGasApi('sync_all_data');
    if (result && (result.status === 'success' || result.success === true)) {
      const payload = result.data || result;
      if (Array.isArray(payload.menu) && payload.menu.length > 0) setStored('menu', payload.menu);
      if (Array.isArray(payload.users) && payload.users.length > 0) setStored('users', payload.users);
      if (Array.isArray(payload.customers)) setStored('customers', payload.customers);
      if (Array.isArray(payload.receipts)) setStored('receipts', payload.receipts);
      if (Array.isArray(payload.expenses)) setStored('expenses', payload.expenses);
      if (Array.isArray(payload.loyalty_cycles)) setStored('loyalty_cycles', payload.loyalty_cycles);
      if (Array.isArray(payload.vouchers)) setStored('vouchers', payload.vouchers);
      if (payload.config && payload.config.announcement) setStored('announcement', payload.config.announcement);
      
      if (typeof initMenuUI === 'function') initMenuUI();
      if (typeof renderQuickAccounts === 'function') renderQuickAccounts();
      if (typeof renderAnnouncement === 'function') renderAnnouncement();
      
            if (currentUser) {
        const freshUsers = getStored('users', DEFAULT_USERS);
        const me = freshUsers.find(u => normalizePhone(u.phone) === normalizePhone(currentUser.phone));
        if (me) currentUser = me;
        if (typeof showView === 'function') showView(currentTab);
        if (typeof loadHistoryView === 'function') loadHistoryView();
      }
    }
  } catch(e) {
    console.error('Lỗi khi đồng bộ từ Google Sheets:', e);
  }

  if (btn) {
    btn.innerHTML = '<i data-lucide="cloud-check" class="w-4 h-4 text-[#2E7D6D]"></i> <span class="hidden sm:inline">Đồng bộ Sheet</span>';
    lucide.createIcons();
  }
}

