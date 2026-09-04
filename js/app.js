// =========================================================================
// APPLICATION CONTROLLER & MULTI-CONTAINER ROUTER: APP.JS
// Nhạc trưởng điều phối toàn bộ ứng dụng Selena Spa (Chuẩn kiến trúc Đa Container)
// =========================================================================

/**
 * Điều phối hiển thị màn hình và chuyển tab thông minh (0ms Transition)
 * @param {string} screenName - Tên màn hình ('home' | 'pos' | 'history' | 'income' | 'login')
 */
function showScreen(screenName) {
  window.scrollTo(0, 0);
  const tabName = (screenName === 'add') ? 'pos' : screenName;

  // 1. Nếu chuyển về màn hình đăng nhập
  if (tabName === 'login') {
    if (typeof hideBottomNav === 'function') hideBottomNav();
    ['home', 'pos', 'history', 'income'].forEach(t => {
      const el = document.getElementById('container-' + t);
      if (el) el.classList.add('hidden');
    });
    const loginEl = document.getElementById('container-login');
    if (loginEl) loginEl.classList.remove('hidden');
    if (typeof initLogin === 'function') initLogin();
    return;
  }

  // 2. Ẩn màn hình đăng nhập
  const loginEl = document.getElementById('container-login');
  if (loginEl) loginEl.classList.add('hidden');

  // 3. Đồng bộ vị trí viên thuốc trên Bottom Nav
  if (typeof updateNavSlidingPill === 'function') {
    updateNavSlidingPill(tabName);
  }

  // 4. Hoán đổi class hidden giữa các container (Bảo toàn nguyên vẹn form của các tab khác)
  const tabs = ['home', 'pos', 'history', 'income'];
  tabs.forEach(t => {
    const el = document.getElementById('container-' + t);
    if (!el) return;
    if (t === tabName) {
      el.classList.remove('hidden');
      el.classList.remove('view-enter-active');
      void el.offsetWidth; // Kích hoạt Luxury Fade Slide-in Transition
      el.classList.add('view-enter-active');
    } else {
      el.classList.add('hidden');
    }
  });

  const activeContainer = document.getElementById('container-' + tabName);

  // 5. LAZY LOAD: Tab nào chưa có nội dung thì mới dựng lần đầu
  if (tabName === 'home') {
    if (activeContainer && (!activeContainer.hasChildNodes() || activeContainer.innerHTML.trim() === '')) {
      if (typeof renderHomeScreen === 'function') renderHomeScreen();
    } else if (typeof refreshLiveBeds === 'function') {
      // REFRESH HOOK: Tự động cập nhật số liệu mới nhất khi quay lại Home
      refreshLiveBeds();
    }
  } else if (tabName === 'pos') {
    if (activeContainer && (!activeContainer.hasChildNodes() || activeContainer.innerHTML.trim() === '')) {
      activeContainer.innerHTML = renderPlaceholderTab('pos', 'Tạo Ca / Vé Mới (POS)');
      if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
    }
  } else if (tabName === 'history') {
    if (activeContainer && (!activeContainer.hasChildNodes() || activeContainer.innerHTML.trim() === '')) {
      activeContainer.innerHTML = renderPlaceholderTab('history', 'Lịch Sử Tour');
      if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
    }
  } else if (tabName === 'income') {
    if (activeContainer && (!activeContainer.hasChildNodes() || activeContainer.innerHTML.trim() === '')) {
      activeContainer.innerHTML = renderPlaceholderTab('income', 'Báo Cáo & Thu Nhập');
      if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
    }
  }
}

/**
 * Khung giữ chỗ cho các phân hệ đang hoàn thiện (POS, History, Income)
 */
function renderPlaceholderTab(screenName, title) {
  const isOwner = (typeof isUserOwner === 'function' && typeof currentUser !== 'undefined') ? isUserOwner(currentUser) : false;
  return `
    <main class="p-4 sm:p-6 max-w-5xl mx-auto space-y-5">
      ${screenName === 'income' ? `
        <!-- Header Báo cáo & Tài khoản (Chỉ xuất hiện ở tab Báo cáo/Thu nhập theo bản gốc) -->
        <div class="p-4 sm:p-5 rounded-3xl bg-spa-card border border-spa-border shadow-xs flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-spa-brand/15 text-spa-brand flex items-center justify-center font-bold text-base shadow-2xs">
              ${isOwner ? '👑' : '💆'}
            </div>
            <div>
              <div class="font-extrabold text-base text-spa-dark">
                Chào <span class="text-spa-brand">${currentUser ? (currentUser.name || currentUser.username) : 'Bạn'}</span>,
              </div>
              <div class="text-xs text-spa-muted font-medium">
                ${isOwner ? '👑 Chủ Sáng Lập' : '💆 Kỹ Thuật Viên'}
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            ${typeof ThemeToggle === 'function' ? ThemeToggle({ customClass: 'w-9 h-9' }) : ''}
            <button type="button" onclick="handleLogout()" title="Đăng xuất" class="p-2 rounded-full bg-spa-card hover:bg-rose-50 text-spa-muted hover:text-rose-600 border border-spa-border transition cursor-pointer active:scale-90 flex items-center justify-center">
              <i data-lucide="log-out" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      ` : ''}
      <div class="p-8 rounded-3xl bg-spa-card border border-spa-border text-center space-y-4 shadow-xs">
        <div class="w-12 h-12 rounded-full bg-spa-brand/15 text-spa-brand mx-auto flex items-center justify-center">
          <i data-lucide="sparkles" class="w-6 h-6"></i>
        </div>
        <h2 class="text-xl font-bold font-serif text-spa-dark">${title}</h2>
        <p class="text-xs text-spa-muted">Module ${screenName.toUpperCase()} đang được hoàn thiện theo chuẩn giao diện Zen Spa Mindora.</p>
        <button onclick="navigateTab('home')" class="px-5 py-2.5 rounded-full bg-spa-brand text-white text-xs font-bold shadow-glow-brand cursor-pointer active:scale-95">
          Quay Lại Trang Chủ
        </button>
      </div>
    </main>
  `;
}

/**
 * Xử lý đăng xuất tài khoản an toàn
 */
function handleLogout() {
  if (confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
    if (typeof stopHomeRealtimeTicker === 'function') stopHomeRealtimeTicker();
    currentUser = null;
    try {
      localStorage.removeItem('selena_current_user');
    } catch (e) {}
    if (typeof hideBottomNav === 'function') hideBottomNav();
    ['home', 'pos', 'history', 'income'].forEach(t => {
      const el = document.getElementById('container-' + t);
      if (el) el.classList.add('hidden');
    });
    showScreen('login');
  }
}

// Khởi tạo ứng dụng khi DOM sẵn sàng
window.addEventListener('DOMContentLoaded', () => {
  if (typeof initTheme === 'function') initTheme();
  if (typeof initPullToRefresh === 'function') initPullToRefresh();
  
  // Khôi phục phiên đăng nhập nếu đã có
  const savedUser = (typeof getStored === 'function') ? getStored('current_user', null) : null;
  if (savedUser) {
    currentUser = savedUser;
    if (typeof renderBottomNav === 'function') renderBottomNav('home');
    if (typeof showBottomNav === 'function') showBottomNav();
    showScreen('home');
  } else {
    showScreen('login');
  }

  if (typeof initFirebaseEngine === 'function') initFirebaseEngine();
});

// Xuất hàm ra phạm vi toàn cục
if (typeof window !== 'undefined') {
  window.showScreen = showScreen;
  window.handleLogout = handleLogout;
}
