// Tự động dọn dẹp cache hóa đơn thử nghiệm cũ để lấy chuẩn 100% từ Google Sheet
(function purgeOldTestCache() {
  try {
    const versionKey = 'selena_cache_cleaned_v0132';
    if (!localStorage.getItem(versionKey)) {
      localStorage.removeItem('selena_receipts');
      localStorage.removeItem('selena_customers');
      localStorage.removeItem('selena_loyalty_cycles');
      localStorage.removeItem('selena_vouchers');
      localStorage.setItem(versionKey, 'true');
    }
  } catch(e) {}
})();

// Tự động dọn dẹp dữ liệu khách hàng mẫu ảo cũ
(function purgeMockCustomerData() {
  try {
    const raw = localStorage.getItem('selena_customers');
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        const cleaned = list.filter(c => {
          const p = String(c.phone_number || c.raw_phone || '').replace(/[^0-9]/g, '');
          return p !== '0912345678' && p !== '0987654321' && p !== '0988776655';
        });
        localStorage.setItem('selena_customers', JSON.stringify(cleaned));
      }
    }
  } catch(e) {}
})();

// =============================================================
// APP ROUTER, ROLE-BASED VIEW ISOLATION & LIFECYCLE INITIALIZER
// =============================================================
let loadedRole = null;

function hideAllViews() {
  const vHome = document.getElementById('view-home');
  const vAdd = document.getElementById('view-add');
  const vHistory = document.getElementById('view-history');
  const vIncome = document.getElementById('view-income');

  if (vHome) {
    vHome.classList.add('hidden');
    vHome.classList.remove('view-enter-active');
  }
  if (vAdd) {
    vAdd.classList.add('hidden');
    vAdd.classList.remove('view-enter-active');
  }
  if (vHistory) {
    vHistory.classList.add('hidden');
    vHistory.classList.remove('view-enter-active');
  }
  if (vIncome) {
    vIncome.classList.add('hidden');
    vIncome.classList.remove('view-enter-active');
  }
}

async function showView(view) {
  currentTab = view;

  // Đảm bảo chỉ nạp đúng bộ View của Role đó
  const isOwner = isUserOwner(currentUser);
  const targetRole = isOwner ? 'owner' : 'staff';
  if (loadedRole !== targetRole) {
    await loadRoleSpecificViews(isOwner);
  }

  hideAllViews();

  let targetEl = null;

  if (view === 'home') {
    targetEl = document.getElementById('view-home');
    if (isOwner) {
      loadAdminDashboard();
    } else {
      loadKTVHomeStats();
    }
    renderAnnouncement();
  if (typeof applyDynamicUIConfig === 'function') applyDynamicUIConfig();
    if (typeof renderHomeStatusAndActionButton === 'function') renderHomeStatusAndActionButton();
  } else if (view === 'add') {
    targetEl = document.getElementById('view-add');
    initMenuUI();
    updatePOSStaffInfo();
  } else if (view === 'history') {
    targetEl = document.getElementById('view-history');
    loadHistoryView();
  } else if (view === 'income') {
    targetEl = document.getElementById('view-income');
    const headerName = document.getElementById('header-user-name');
    const headerRole = document.getElementById('header-role-badge');
    if (headerName) headerName.innerText = currentUser?.full_name || 'KTV';
    if (headerRole) headerRole.innerText = isOwner ? '👑 Chủ Sáng Lập' : '💆 Kỹ Thuật Viên';
    loadIncomeView();
  }

  if (targetEl) {
    targetEl.classList.remove('hidden');
    // Kích hoạt hiệu ứng chuyển cảnh mượt mà Luxury View Transition
    void targetEl.offsetWidth; // Trigger reflow
    targetEl.classList.add('view-enter-active');
  }

  updateNavSlidingPill(view);
  requestAnimationFrame(() => updateNavSlidingPill(view));
  lucide.createIcons();
}

// CẬP NHẬT HIỆU ỨNG VIÊN THUỐC TRƯỢT DI CHUYỂN CHÍNH XÁC 100%
function updateNavSlidingPill(activeTab) {
  const tabs = ['home', 'add', 'history', 'income'];
  const pill = document.getElementById('nav-sliding-indicator');
  const activeBtn = document.getElementById('nav-btn-' + activeTab);

  tabs.forEach(t => {
    const btn = document.getElementById('nav-btn-' + t);
    if (btn) {
      if (t === activeTab) {
        btn.classList.add('active', 'text-white');
        btn.classList.remove('text-[#7E7272]');
      } else {
        btn.classList.remove('active', 'text-white');
        btn.classList.add('text-[#7E7272]');
      }
    }
  });

  if (pill && activeBtn) {
    pill.style.width = `${activeBtn.offsetWidth}px`;
    pill.style.height = `${activeBtn.offsetHeight}px`;
    pill.style.top = `${activeBtn.offsetTop}px`;
    pill.style.left = `0px`;
    pill.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
    pill.classList.remove('opacity-0');
    pill.classList.add('opacity-100');
  }
}

function loadHistoryView() {
  const isOwner = isUserOwner(currentUser);
  if (isOwner) {
    loadAdminReceiptsList();
  } else {
    loadStaffHistoryList();
  }
  lucide.createIcons();
}

function loadIncomeView() {
  const isOwner = isUserOwner(currentUser);
  if (isOwner) {
    loadAdminExpensesList();
  } else {
    loadStaffPayrollStats();
  }
  lucide.createIcons();
}

// NẠP ĐỘNG ĐÚNG BỘ VIEW CỦA ROLE TỪ VIEWS/OWNER HOẶC VIEWS/STAFF
async function loadRoleSpecificViews(isOwner) {
  const folder = isOwner ? 'views/owner' : 'views/staff';
  loadedRole = isOwner ? 'owner' : 'staff';

  await Promise.all([
    loadViewTemplate('container-home', `${folder}/home.html`),
    loadViewTemplate('container-history', `${folder}/history.html`),
    loadViewTemplate('container-wallet', `${folder}/wallet.html`)
  ]);
  lucide.createIcons();
}

// Helper fetch view template
async function loadViewTemplate(containerId, filePath) {
  try {
    const res = await fetch(filePath + '?v=' + Date.now());
    if (res.ok) {
      const html = await res.text();
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = html;
    }
  } catch (err) {
    console.error('Error loading view:', filePath, err);
  }
}

// BỘ NẠP ĐỘNG TOÀN BỘ CÁC TEMPLATE MODAL ĐỘC LẬP TỪ VIEWS/COMPONENTS/MODALS/
async function loadAllModalTemplates() {
  const modalFiles = [
    'views/components/modals/modal_checkout.html',
    'views/components/modals/modal_swap_staff.html',
    'views/components/modals/modal_handover.html',
    'views/components/modals/modal_add_expense.html',
    'views/components/modals/modal_announcement.html',
    'views/components/modals/modal_month_picker.html',
    'views/components/modals/modal_staff_note.html',
    'views/components/modals/modal_owner_customer.html',
    'views/components/modals/modal_gift_voucher.html',
    'views/components/modals/modal_edit_live_services.html'
  ];

  try {
    const results = await Promise.all(
      modalFiles.map(async (file) => {
        try {
          const res = await fetch(file + '?v=' + Date.now());
          return res.ok ? await res.text() : '';
        } catch(e) {
          return '';
        }
      })
    );
    const combined = results.filter(Boolean).join('\n');
    const container = document.getElementById('container-modals');
    if (container && combined) container.innerHTML = combined;
  } catch(e) {
    console.error('Error loading modular modals:', e);
  }
}

// App Initialization
window.addEventListener('DOMContentLoaded', async () => {
  // Khởi động Firebase Realtime Engine
  if (typeof initFirebaseEngine === 'function') initFirebaseEngine();
  // 1. Tải các thành phần chung
  await Promise.all([
    loadViewTemplate('container-ptr', 'views/components/pull_to_refresh.html'),
    loadViewTemplate('container-login', 'views/login.html'),
    loadViewTemplate('container-add', 'views/add.html'),
    loadViewTemplate('container-nav', 'views/components/bottom_nav.html'),
    loadAllModalTemplates()
  ]);

  initMenuUI();
  renderQuickAccounts();
  renderAnnouncement();
  if (typeof applyDynamicUIConfig === 'function') applyDynamicUIConfig();
    if (typeof renderHomeStatusAndActionButton === 'function') renderHomeStatusAndActionButton();

  const inp = document.getElementById('setting-gas-url');
  if (inp) inp.value = getGasUrl();

  const activeSession = localStorage.getItem('selena_active_session');
  if (activeSession) {
    try {
      const user = JSON.parse(activeSession);
      loginSuccess(user);
    } catch (e) {
      localStorage.removeItem('selena_active_session');
    }
  }
  
  // Tự động căn chỉnh vị trí viên thuốc khi resize màn hình
  window.addEventListener('resize', () => {
    updateNavSlidingPill(currentTab);
  });

  // Auto sync latest data from Google Sheets immediately on load
  refreshDataFromGoogleSheets();
  lucide.createIcons();
});


// Lắng nghe sự kiện đồng bộ siêu tốc giữa các tab trên cùng thiết bị (0.001s)
window.addEventListener('storage', (e) => {
  if (e.key === 'selena_receipts' || e.key === 'receipts' || e.key === 'selena_customers') {
    if (typeof refreshAllActiveViews === 'function') {
      refreshAllActiveViews();
    }
  }
});
