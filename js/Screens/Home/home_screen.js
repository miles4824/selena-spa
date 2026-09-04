// =========================================================================
// SCREEN CONTROLLER: HOME SCREEN (NHẠC TRƯỞNG ĐIỀU PHỐI TRANG CHỦ)
// =========================================================================

let homeTickerInterval = null;

/**
 * Điều phối chính để hiển thị Màn hình Trang chủ
 */
function renderHomeScreen() {
  const app = document.getElementById('app');
  if (!app) return;

  // 1. Kiểm tra phiên đăng nhập
  if (!currentUser) {
    if (typeof initLogin === 'function') {
      initLogin();
    }
    return;
  }

  const isOwner = (typeof isUserOwner === 'function') ? isUserOwner(currentUser) : false;

  // 2. Nội dung Home theo vai trò
  const homeContentHtml = isOwner 
    ? (typeof renderOwnerHome === 'function' ? renderOwnerHome(currentUser) : '')
    : (typeof renderStaffHome === 'function' ? renderStaffHome(currentUser) : '');

  const screenHome = document.getElementById('screen-home');
  const mainScroll = document.getElementById('home-main-scroll');

  // NẾU APP SHELL ĐÃ CÓ (Không xóa app.innerHTML để giữ nguyên Bottom Nav & hiệu ứng trượt)
  if (screenHome && mainScroll) {
    mainScroll.innerHTML = homeContentHtml;
    mainScroll.classList.remove('view-enter-active');
    void mainScroll.offsetWidth; // Kích hoạt Luxury View Transition
    mainScroll.classList.add('view-enter-active');
    if (typeof updateNavSlidingPill === 'function') {
      updateNavSlidingPill('home');
    }
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
    startHomeRealtimeTicker(isOwner);
    return;
  }

  // 3. Khung bố cục chuẩn Luxury (chỉ dựng lần đầu khi đăng nhập): Đệm đáy pb-28 để không bị thanh Navigation Dock che khuất
  app.innerHTML = `
    <div id="screen-home" class="min-h-screen bg-spa-bg text-spa-dark font-sans relative selection:bg-spa-brand/20 pb-28">
      <!-- HEADER TRANG CHỦ: LOGO, TÊN SPA & NÚT ĐỔI THEME / ĐĂNG XUẤT -->
      <header class="sticky top-0 z-30 bg-spa-bg/90 backdrop-blur-md border-b border-spa-border px-4 sm:px-6 py-3 transition-colors duration-300">
        <div class="max-w-5xl mx-auto flex items-center justify-between">
          <!-- Thương hiệu Selena Spa -->
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-2xl bg-spa-brand/15 text-spa-brand flex items-center justify-center font-bold text-sm shadow-2xs">
              <i data-lucide="sparkles" class="w-5 h-5"></i>
            </div>
            <div>
              <h1 class="brand-spa-name text-base font-bold text-spa-dark leading-tight font-serif">
                ${(typeof getConfig === 'function') ? getConfig('spa_brand_name', 'SELENA SPA') : 'SELENA SPA'}
              </h1>
              <p class="brand-spa-slogan text-[10px] text-spa-muted font-medium">
                ${(typeof getConfig === 'function') ? getConfig('spa_brand_slogan', 'Luxury Wellness Care') : 'Luxury Wellness Care'}
              </p>
            </div>
          </div>

          <!-- Nhóm nút góc phải: Nút đổi Theme & Nút Đăng xuất -->
          <div class="flex items-center gap-2">
            ${(typeof ThemeToggle === 'function') ? ThemeToggle({ customClass: 'w-9 h-9' }) : ''}
            <button type="button" onclick="handleLogout()" title="Đăng xuất" class="p-2 rounded-full bg-spa-card hover:bg-rose-50 text-spa-muted hover:text-rose-600 border border-spa-border transition cursor-pointer active:scale-90 flex items-center justify-center">
              <i data-lucide="log-out" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </header>

      <!-- KHỐI NỘI DUNG CUỘN CHÍNH CỦA TRANG HOME -->
      <main id="home-main-scroll" class="p-4 sm:p-6 max-w-5xl mx-auto view-enter-active">
        ${homeContentHtml}
      </main>
    </div>
  `;

  // 4. Khởi tạo thanh điều hướng Bottom Nav nếu chưa có
  if (!document.getElementById('mobile-bottom-nav') && typeof renderBottomNav === 'function') {
    renderBottomNav('home');
  }
  if (typeof showBottomNav === 'function') {
    showBottomNav();
  }
  if (typeof updateNavSlidingPill === 'function') {
    updateNavSlidingPill('home');
  }

  // 5. Khởi tạo lại toàn bộ icon Lucide
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }

  // 6. Khởi chạy chu kỳ cập nhật tự động mỗi 15 giây (Ticker)
  startHomeRealtimeTicker(isOwner);
}

/**
 * Chu kỳ tự động kiểm tra thời gian thực để cập nhật các giường đang chạy
 */
function startHomeRealtimeTicker(isOwner) {
  if (homeTickerInterval) clearInterval(homeTickerInterval);
  homeTickerInterval = setInterval(() => {
    if (isOwner && typeof refreshLiveBeds === 'function') {
      refreshLiveBeds();
    }
  }, 15000);
}

/**
 * Xử lý đăng xuất tài khoản
 */
function handleLogout() {
  if (confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
    if (homeTickerInterval) clearInterval(homeTickerInterval);
    currentUser = null;
    try {
      localStorage.removeItem('selena_current_user');
    } catch (e) {}
    if (typeof hideBottomNav === 'function') hideBottomNav();
    if (typeof initLogin === 'function') initLogin();
  }
}

// Xuất ra phạm vi toàn cục
if (typeof window !== 'undefined') {
  window.renderHomeScreen = renderHomeScreen;
  window.handleLogout = handleLogout;
}
