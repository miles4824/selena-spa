// =============================================================
// APP ROUTER, ROLE-BASED VIEW ISOLATION & LIFECYCLE INITIALIZER
// =============================================================
let loadedRole = null;

function hideAllViews() {
  const vHome = document.getElementById('view-home');
  const vAdd = document.getElementById('view-add');
  const vHistory = document.getElementById('view-history');
  const vIncome = document.getElementById('view-income');

  if (vHome) vHome.classList.add('hidden');
  if (vAdd) vAdd.classList.add('hidden');
  if (vHistory) vHistory.classList.add('hidden');
  if (vIncome) vIncome.classList.add('hidden');
}

async function showView(view) {
  currentTab = view;

  // Đảm bảo chỉ nạp đúng bộ View của Role đó
  const isOwner = isUserOwner(currentUser);
  const targetRole = isOwner ? 'owner' : 'ktv';
  if (loadedRole !== targetRole) {
    await loadRoleSpecificViews(isOwner);
  }

  hideAllViews();

  if (view === 'home') {
    document.getElementById('view-home')?.classList.remove('hidden');
    if (isOwner) {
      loadAdminDashboard();
    } else {
      loadKTVHomeStats();
    }
    renderAnnouncement();
  } else if (view === 'add') {
    document.getElementById('view-add')?.classList.remove('hidden');
    updatePOSStaffInfo();
  } else if (view === 'history') {
    document.getElementById('view-history')?.classList.remove('hidden');
    loadHistoryView();
  } else if (view === 'income') {
    document.getElementById('view-income')?.classList.remove('hidden');
    const headerName = document.getElementById('header-user-name');
    const headerRole = document.getElementById('header-role-badge');
    if (headerName) headerName.innerText = currentUser?.full_name || 'KTV';
    if (headerRole) headerRole.innerText = isOwner ? '👑 Chủ Sáng Lập' : '💆 Kỹ Thuật Viên';
    loadIncomeView();
  }

  renderBottomNavDock();
  lucide.createIcons();
}

function renderBottomNavDock() {
  const navContainer = document.getElementById('nav-buttons-container');
  if (!navContainer) return;

  const tabs = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'add', icon: 'plus', label: 'Tạo ca' },
    { id: 'history', icon: 'clock', label: 'Lịch sử' },
    { id: 'income', icon: 'wallet', label: 'Thu nhập' }
  ];

  navContainer.innerHTML = tabs.map(t => {
    const isActive = (currentTab === t.id);
    if (isActive) {
      return `
        <button onclick="showView('${t.id}')" title="${t.label}" class="w-12 h-12 rounded-full bg-[#E58A7B] text-white flex items-center justify-center shadow-lg shadow-[#E58A7B]/25 scale-105 transition-all duration-300 cursor-pointer">
          <i data-lucide="${t.icon}" class="w-5 h-5"></i>
        </button>
      `;
    } else {
      return `
        <button onclick="showView('${t.id}')" title="${t.label}" class="w-12 h-12 rounded-full flex items-center justify-center text-[#8C827A] hover:text-[#2D2424] hover:bg-white/60 transition-all duration-200 cursor-pointer">
          <i data-lucide="${t.icon}" class="w-5 h-5"></i>
        </button>
      `;
    }
  }).join('');
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

// NẠP ĐỘNG ĐÚNG BỘ VIEW CỦA ROLE (CÔ LẬP BẢO MẬT 100%)
async function loadRoleSpecificViews(isOwner) {
  const roleSuffix = isOwner ? '_owner.html' : '_ktv.html';
  loadedRole = isOwner ? 'owner' : 'ktv';

  await Promise.all([
    loadViewTemplate('container-home', `views/home${roleSuffix}`),
    loadViewTemplate('container-history', `views/history${roleSuffix}`),
    loadViewTemplate('container-wallet', `views/wallet${roleSuffix}`)
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

// App Initialization
window.addEventListener('DOMContentLoaded', async () => {
  // 1. Tải trước các thành phần dùng chung (Login, Add POS, Nav, Modals)
  await Promise.all([
    loadViewTemplate('container-ptr', 'components/pull_to_refresh.html'),
    loadViewTemplate('container-login', 'views/login.html'),
    loadViewTemplate('container-add', 'views/add.html'),
    loadViewTemplate('container-nav', 'components/bottom_nav.html'),
    loadViewTemplate('container-modals', 'components/modals.html')
  ]);

  initMenuUI();
  renderQuickAccounts();
  renderAnnouncement();

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
  
  // Auto sync latest data from Google Sheets immediately on load
  refreshDataFromGoogleSheets();
  lucide.createIcons();
});
