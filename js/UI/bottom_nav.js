// =========================================================================
// UI COMPONENT: BOTTOM NAVIGATION DOCK (FLOATING GLASS DOCK & SLIDING PILL)
// =========================================================================

/**
 * Render cấu trúc HTML của thanh Dock điều hướng nổi dưới đáy màn hình
 * @param {string} activeTab - Tab đang chọn mặc định ('home' | 'pos' | 'history' | 'income')
 * @returns {string} Chuỗi HTML của Navigation Dock
 */
function renderBottomNav(activeTab = 'home') {
  const isOwner = (typeof isUserOwner === 'function' && typeof currentUser !== 'undefined') ? isUserOwner(currentUser) : false;
  const incomeLabel = isOwner ? 'Báo cáo' : 'Thu nhập';

  return `
    <nav id="mobile-bottom-nav" class="fixed left-4 right-4 z-40 max-w-sm mx-auto transition-all duration-300" style="bottom: calc(env(safe-area-inset-bottom, 16px) + 12px);">
      <div id="nav-dock" class="relative bg-spa-card/90 border border-spa-border backdrop-blur-xl rounded-full shadow-[0_12px_32px_rgba(0,0,0,0.10)] px-2.5 py-2 flex items-center justify-around">
        <!-- VIÊN THUỐC TRƯỢT PHÁT SÁNG DI CHUYỂN TỰ ĐỘNG (SLIDING PILL) -->
        <div id="nav-sliding-indicator" class="absolute rounded-full bg-spa-brand shadow-glow-brand z-[1] pointer-events-none opacity-0 transition-all duration-300 ease-out"></div>

        <!-- 1. TAB HOME (TRANG CHỦ) -->
        <button type="button" onclick="navigateTab('home')" id="nav-btn-home" data-tab="home" title="Trang chủ" class="relative z-10 w-12 h-12 flex items-center justify-center rounded-full text-spa-muted hover:text-spa-brand transition-colors cursor-pointer active:scale-95">
          <i data-lucide="home" class="w-5 h-5"></i>
        </button>

        <!-- 2. TAB POS (TẠO CA / TẠO TOUR MỚI) -->
        <button type="button" onclick="navigateTab('pos')" id="nav-btn-pos" data-tab="pos" title="Tạo ca mới" class="relative z-10 w-12 h-12 flex items-center justify-center rounded-full text-spa-muted hover:text-spa-brand transition-colors cursor-pointer active:scale-95">
          <i data-lucide="plus" class="w-5 h-5"></i>
        </button>

        <!-- 3. TAB HISTORY (LỊCH SỬ TOUR) -->
        <button type="button" onclick="navigateTab('history')" id="nav-btn-history" data-tab="history" title="Lịch sử tour" class="relative z-10 w-12 h-12 flex items-center justify-center rounded-full text-spa-muted hover:text-spa-brand transition-colors cursor-pointer active:scale-95">
          <i data-lucide="clock" class="w-5 h-5"></i>
        </button>

        <!-- 4. TAB INCOME / REPORT (THU NHẬP / BÁO CÁO) -->
        <button type="button" onclick="navigateTab('income')" id="nav-btn-income" data-tab="income" title="${incomeLabel}" class="relative z-10 w-12 h-12 flex items-center justify-center rounded-full text-spa-muted hover:text-spa-brand transition-colors cursor-pointer active:scale-95">
          <i data-lucide="wallet" class="w-5 h-5"></i>
        </button>
      </div>
    </nav>
  `;
}

/**
 * Cập nhật vị trí viên thuốc trượt (Sliding Pill Indicator) đến nút tab đang chọn
 * @param {string} activeTab - Tên tab ('home' | 'pos' | 'history' | 'income')
 */
function updateNavSlidingPill(activeTab = 'home') {
  // Chuẩn hóa tên tab (nếu gọi 'add' thì map về 'pos')
  const tabName = (activeTab === 'add') ? 'pos' : activeTab;
  const tabs = ['home', 'pos', 'history', 'income'];
  const pill = document.getElementById('nav-sliding-indicator');
  const activeBtn = document.getElementById('nav-btn-' + tabName);

  tabs.forEach(t => {
    const btn = document.getElementById('nav-btn-' + t);
    if (btn) {
      if (t === tabName) {
        btn.classList.add('active', '!text-white');
        btn.classList.remove('text-spa-muted');
      } else {
        btn.classList.remove('active', '!text-white');
        btn.classList.add('text-spa-muted');
      }
    }
  });

  if (pill && activeBtn) {
    const isFirstTime = pill.classList.contains('opacity-0');
    if (isFirstTime) {
      // Lần đầu mở app: đặt ngay vị trí, tắt transition để không bị giật lùi
      pill.style.transition = 'none';
      pill.style.width = `${activeBtn.offsetWidth}px`;
      pill.style.height = `${activeBtn.offsetHeight}px`;
      pill.style.top = `${activeBtn.offsetTop}px`;
      pill.style.left = `0px`;
      pill.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
      pill.classList.remove('opacity-0');
      pill.classList.add('opacity-100');
      // Bật lại transition mượt mà cho các lần bấm tiếp theo
      requestAnimationFrame(() => {
        pill.style.transition = '';
      });
    } else {
      // Bấm chuyển tab: trượt mượt mà hai chiều (trái sang phải hoặc phải sang trái)
      pill.style.width = `${activeBtn.offsetWidth}px`;
      pill.style.height = `${activeBtn.offsetHeight}px`;
      pill.style.top = `${activeBtn.offsetTop}px`;
      pill.style.left = `0px`;
      pill.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
    }
  }
}

/**
 * Hàm điều hướng chung khi người dùng click tab trên Bottom Nav
 * @param {string} tab - Tên tab ('home' | 'pos' | 'history' | 'income')
 */
function navigateTab(tab) {
  updateNavSlidingPill(tab);

  // Kích hoạt router điều hướng màn hình
  if (typeof showScreen === 'function') {
    showScreen(tab);
  } else if (typeof showView === 'function') {
    showView(tab);
  }
}

/**
 * Ẩn/Hiện thanh Bottom Nav (Ví dụ khi ở màn Login thì ẩn, vào trong app thì hiện)
 */
function showBottomNav() {
  const nav = document.getElementById('mobile-bottom-nav');
  if (nav) nav.classList.remove('hidden');
}

function hideBottomNav() {
  const nav = document.getElementById('mobile-bottom-nav');
  if (nav) nav.classList.add('hidden');
}

// Xuất ra phạm vi toàn cục
if (typeof window !== 'undefined') {
  window.renderBottomNav = renderBottomNav;
  window.updateNavSlidingPill = updateNavSlidingPill;
  window.navigateTab = navigateTab;
  window.showBottomNav = showBottomNav;
  window.hideBottomNav = hideBottomNav;

  // Giữ viên thuốc bám chuẩn khi xoay màn hình hoặc đổi kích thước cửa sổ
  window.addEventListener('resize', () => {
    const activeBtn = document.querySelector('#nav-dock button.active');
    if (activeBtn) {
      const tab = activeBtn.getAttribute('data-tab');
      if (tab) updateNavSlidingPill(tab);
    }
  });
}
