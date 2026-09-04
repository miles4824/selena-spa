// =========================================================================
// SCREEN CONTROLLER: HOME SCREEN (NHẠC TRƯỞNG ĐIỀU PHỐI TRANG CHỦ)
// =========================================================================

let homeTickerInterval = null;

/**
 * Điều phối chính để hiển thị Màn hình Trang chủ
 */
function renderHomeScreen() {
  const container = document.getElementById('container-home') || document.getElementById('app');
  if (!container) return;

  // 1. Kiểm tra phiên đăng nhập
  if (!currentUser) {
    if (typeof initLogin === 'function') {
      initLogin();
    }
    return;
  }

  const isOwner = (typeof isUserOwner === 'function') ? isUserOwner(currentUser) : false;

  // 2. Nội dung Home theo vai trò (Bắt đầu thẳng từ Wellness Banner và danh sách giường)
  const homeContentHtml = isOwner 
    ? (typeof renderOwnerHome === 'function' ? renderOwnerHome(currentUser) : '')
    : (typeof renderStaffHome === 'function' ? renderStaffHome(currentUser) : '');

  // 3. Render trực tiếp vào container-home (Không có Header giả tạo)
  container.innerHTML = `
    <main id="view-home" class="p-4 sm:p-6 max-w-5xl mx-auto space-y-6 view-enter-active">
      ${homeContentHtml}
    </main>
  `;

  // 4. Khởi tạo lại toàn bộ icon Lucide
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }

  // 5. Khởi chạy chu kỳ cập nhật tự động mỗi 15 giây (Ticker)
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

function stopHomeRealtimeTicker() {
  if (homeTickerInterval) {
    clearInterval(homeTickerInterval);
    homeTickerInterval = null;
  }
}

// Xuất ra phạm vi toàn cục
if (typeof window !== 'undefined') {
  window.renderHomeScreen = renderHomeScreen;
  window.startHomeRealtimeTicker = startHomeRealtimeTicker;
  window.stopHomeRealtimeTicker = stopHomeRealtimeTicker;
}
