// -------------------------------------------------------------
// APP ROUTER, ANNOUNCEMENT CONTROLLER & LIFECYCLE INITIALIZER
// -------------------------------------------------------------
function hideAllViews() {
  document.getElementById('view-home').classList.add('hidden');
  document.getElementById('view-add').classList.add('hidden');
  document.getElementById('view-history').classList.add('hidden');
  document.getElementById('view-income').classList.add('hidden');
}

function showView(view) {
  currentTab = view;
  hideAllViews();
  const isOwner = isUserOwner(currentUser);

  if (view === 'home') {
    document.getElementById('view-home').classList.remove('hidden');
    if (isOwner) {
      document.getElementById('home-ktv-section').classList.add('hidden');
      document.getElementById('home-owner-section').classList.remove('hidden');
      loadAdminDashboard();
    } else {
      document.getElementById('home-owner-section').classList.add('hidden');
      document.getElementById('home-ktv-section').classList.remove('hidden');
      loadKTVHomeStats();
    }
    renderAnnouncement();
  } else if (view === 'add') {
    document.getElementById('view-add').classList.remove('hidden');
    updatePOSStaffInfo();
  } else if (view === 'history') {
    document.getElementById('view-history').classList.remove('hidden');
    loadHistoryView();
  } else if (view === 'income') {
    document.getElementById('view-income').classList.remove('hidden');
    const headerName = document.getElementById('header-user-name');
    const headerRole = document.getElementById('header-role-badge');
    if (headerName) headerName.innerText = currentUser?.full_name || 'Mai Lan';
    if (headerRole) headerRole.innerText = isOwner ? '👑 Chủ Sáng Lập' : '💆 Kỹ Thuật Viên';
    loadIncomeView();
  }

  renderBottomNavDock();
  lucide.createIcons();
}

function renderBottomNavDock() {
  const navContainer = document.getElementById('nav-buttons-container');
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

function renderAnnouncement() {
  const ann = getStored('announcement', DEFAULT_ANNOUNCEMENT);
  
  const ktvContent = document.getElementById('home-announcement-content');
  const ktvAuthor = document.getElementById('home-announcement-author');
  const ktvDate = document.getElementById('home-announcement-date');

  if (ktvContent) ktvContent.innerText = ann.content || DEFAULT_ANNOUNCEMENT.content;
  if (ktvAuthor) ktvAuthor.innerText = ann.author || 'Miles (Chủ sáng lập)';
  if (ktvDate) ktvDate.innerText = ann.date || 'Hôm nay';

  const admContent = document.getElementById('admin-announcement-content');
  const admDate = document.getElementById('admin-announcement-date');
  if (admContent) admContent.innerText = ann.content || DEFAULT_ANNOUNCEMENT.content;
  if (admDate) admDate.innerText = ann.date || 'Hôm nay';
}

function openEditAnnouncementModal() {
  const ann = getStored('announcement', DEFAULT_ANNOUNCEMENT);
  document.getElementById('input-announcement-content').value = ann.content || '';
  document.getElementById('modal-edit-announcement').classList.remove('hidden');
}

function closeEditAnnouncementModal() {
  document.getElementById('modal-edit-announcement').classList.add('hidden');
}

function handleSaveAnnouncement(e) {
  e.preventDefault();
  const content = document.getElementById('input-announcement-content').value.trim();
  if (!content) return;

  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  const ann = {
    content: content,
    author: currentUser?.full_name || 'Miles (Chủ sáng lập)',
    date: dateStr
  };

  setStored('announcement', ann);
  renderAnnouncement();
  closeEditAnnouncementModal();

  callGasApi('update_announcement', {
    content: content,
    author: ann.author
  });

  alert('✅ Đã cập nhật thông báo thành công! Nội dung đã được lưu và gửi đồng bộ đến Google Sheets.');
}

function loadKTVHomeStats() {
  const receipts = getStored('receipts', []);
  const todayStr = normalizeDateKey(new Date());
  const staffPhone = normalizePhone(currentUser?.phone);
  const staffCode = String(currentUser?.staff_id || '').trim();

  // Update Greeting Name
  const greetingNameEl = document.getElementById('home-greeting-name');
  if (greetingNameEl) {
    let displayName = currentUser?.full_name || 'bạn';
    greetingNameEl.innerText = displayName;
  }

  let todayTours = 0;
  let todayComm = 0;

  receipts.forEach(r => {
    const rDate = normalizeDateKey(r.date || r.created_at);
    const rPhone = normalizePhone(r.staff_phone);
    const rCode = String(r.staff_id || '').trim();

    if (rDate === todayStr && ((staffPhone && rPhone === staffPhone) || (staffCode && rCode === staffCode))) {
      todayTours += 1;
      todayComm += (Number(r.commission_amount) || 0);
    }
  });

  document.getElementById('home-today-tours').innerText = todayTours + ' ca';
  document.getElementById('home-today-comm').innerText = todayComm.toLocaleString('vi-VN') + ' đ';
}

function loadHistoryView() {
  const isOwner = isUserOwner(currentUser);
  if (isOwner) {
    document.getElementById('history-ktv-section').classList.add('hidden');
    document.getElementById('history-owner-section').classList.remove('hidden');
    loadAdminReceiptsList();
  } else {
    document.getElementById('history-owner-section').classList.add('hidden');
    document.getElementById('history-ktv-section').classList.remove('hidden');
    loadStaffHistoryList();
  }
  lucide.createIcons();
}

function loadIncomeView() {
  const isOwner = isUserOwner(currentUser);
  if (isOwner) {
    document.getElementById('income-ktv-section').classList.add('hidden');
    document.getElementById('income-owner-section').classList.remove('hidden');
    loadAdminExpensesList();
  } else {
    document.getElementById('income-owner-section').classList.add('hidden');
    document.getElementById('income-ktv-section').classList.remove('hidden');
    loadStaffPayrollStats();
  }
  lucide.createIcons();
}

// Pull to refresh support for mobile
let touchStartY = 0;
let isPulling = false;
window.addEventListener('touchstart', e => {
  if (window.scrollY === 0) touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchmove', e => {
  const touchY = e.touches[0].clientY;
  const pullDist = touchY - touchStartY;
  const ptr = document.getElementById('ptr-indicator');
  if (window.scrollY === 0 && pullDist > 50 && ptr) {
    isPulling = true;
    ptr.style.transform = `translateY(${Math.min(pullDist - 50, 60)}px)`;
  }
}, { passive: true });

window.addEventListener('touchend', e => {
  const ptr = document.getElementById('ptr-indicator');
  if (isPulling && ptr) {
    ptr.style.transform = 'translateY(0)';
    setTimeout(() => {
      ptr.style.transform = 'translateY(-100%)';
      refreshDataFromGoogleSheets();
    }, 600);
  }
  isPulling = false;
});

// App Initialization
window.addEventListener('DOMContentLoaded', () => {
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
