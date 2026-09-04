// =============================================================
// COMPONENT: PULL TO REFRESH (VUỐT XUỐNG ĐỂ TẢI LẠI BẢN MỚI NHẤT)
// Dành riêng cho trải nghiệm PWA mượt mà như app native iOS/Android
// Phong cách: Mindora Luxury Liquid Glass
// =============================================================

function PullToRefresh() {
  return `
    <div id="ptr-indicator" class="fixed top-0 left-0 right-0 z-[99998] flex justify-center pointer-events-none" style="transform: translateY(-90px); will-change: transform;">
      <div id="ptr-pill" class="px-5 py-2.5 rounded-full liquid-glass shadow-2xl border border-white/50 dark:border-white/20 flex items-center gap-2.5 text-xs font-semibold text-spa-dark dark:text-white backdrop-blur-2xl transition-colors">
        <span id="ptr-icon-wrap" class="flex items-center justify-center text-spa-sage dark:text-spa-brand">
          <i data-lucide="arrow-down" class="w-4 h-4"></i>
        </span>
        <span id="ptr-text" class="tracking-wide">Vuốt xuống để làm mới...</span>
      </div>
    </div>
  `;
}

function initPullToRefresh() {
  // Tự động gắn vào DOM nếu chưa có
  let ptr = document.getElementById('ptr-indicator');
  if (!ptr) {
    document.body.insertAdjacentHTML('afterbegin', PullToRefresh());
    ptr = document.getElementById('ptr-indicator');
    if (window.lucide && typeof lucide.createIcons === 'function') {
      lucide.createIcons();
    }
  }

  const ptrText = document.getElementById('ptr-text');
  const ptrIconWrap = document.getElementById('ptr-icon-wrap');
  if (!ptr || !ptrText || !ptrIconWrap) return;

  let touchStartY = 0;
  let isPulling = false;
  let hasTriggeredHaptic = false;
  const PULL_THRESHOLD = 75; // Ngưỡng vuốt (px) để kích hoạt tải lại
  const HIDDEN_Y = -90;      // Vị trí giấu phía trên màn hình (px)
  const HOLDING_Y = 80;     // Vị trí dừng trọn vẹn dưới tai thỏ khi đang tải lại (px)

  // Hàm xác định vị trí cuộn của container cha gần nhất hoặc window
  function getScrollTop(e) {
    let el = e.target;
    while (el && el !== document.body && el !== document.documentElement) {
      if (el.scrollHeight > el.clientHeight) {
        const overflowY = window.getComputedStyle(el).overflowY;
        if (overflowY === 'auto' || overflowY === 'scroll') {
          return el.scrollTop;
        }
      }
      el = el.parentElement;
    }
    return window.scrollY || document.documentElement.scrollTop || 0;
  }

  // Khởi đầu chạm màn hình
  window.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    const scrollTop = getScrollTop(e);
    if (scrollTop <= 3) {
      touchStartY = e.touches[0].clientY;
      isPulling = true;
      hasTriggeredHaptic = false;
      ptr.style.transition = 'none';
      ptr.style.transform = `translateY(${HIDDEN_Y}px)`;
    }
  }, { passive: true });

  // Vuốt kéo xuống
  window.addEventListener('touchmove', (e) => {
    if (!isPulling) return;
    const scrollTop = getScrollTop(e);
    if (scrollTop > 3) {
      isPulling = false;
      ptr.style.transition = 'transform 0.25s linear';
      ptr.style.transform = `translateY(${HIDDEN_Y}px)`;
      return;
    }

    const touchY = e.touches[0].clientY;
    const diff = touchY - touchStartY;

    if (diff > 5) {
      // Ngăn chặn giật nảy rubber-band mặc định của Safari khi đang ở đầu trang
      if (e.cancelable) e.preventDefault();

      // Công thức đưa viên thuốc trượt trọn vẹn xuống dưới tai thỏ (từ -90px đến +85px..+130px)
      const progress = Math.min(diff / PULL_THRESHOLD, 1.35);
      const currentY = HIDDEN_Y + (progress * (HOLDING_Y - HIDDEN_Y + 10));

      ptr.style.transform = `translateY(${currentY}px)`;

      if (diff >= PULL_THRESHOLD) {
        if (!hasTriggeredHaptic) {
          hasTriggeredHaptic = true;
          if (typeof navigator.vibrate === 'function') {
            navigator.vibrate(12);
          }
        }
        ptrText.innerText = 'Thả tay để làm mới bản mới!';
        ptrIconWrap.innerHTML = '<i data-lucide="rotate-cw" class="w-4 h-4"></i>';
      } else {
        hasTriggeredHaptic = false;
        ptrText.innerText = 'Vuốt xuống để làm mới...';
        ptrIconWrap.innerHTML = '<i data-lucide="arrow-down" class="w-4 h-4"></i>';
      }

      if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
      }
    }
  }, { passive: false });

  // Thả tay kết thúc vuốt
  window.addEventListener('touchend', (e) => {
    if (!isPulling) return;
    isPulling = false;
    ptr.style.transition = 'transform 0.25s linear';

    const touchEndY = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : touchStartY;
    const diff = touchEndY - touchStartY;

    if (diff >= PULL_THRESHOLD) {
      // Dừng lại trọn vẹn ở vị trí 80px (hoàn toàn dưới tai thỏ, không bị che khuất)
      ptr.style.transform = `translateY(${HOLDING_Y}px)`;
      ptrText.innerText = 'Đang tải lại bản mới nhất...';
      ptrIconWrap.innerHTML = '<i data-lucide="refresh-cw" class="w-4 h-4 animate-spin"></i>';
      if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
      }

      // Tải lại trang bản mới nhất
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('v', Date.now().toString());
        window.location.replace(url.toString());
      }, 400);
    } else {
      // Thu lại về phía trên
      ptr.style.transform = `translateY(${HIDDEN_Y}px)`;
    }
  }, { passive: true });
}
