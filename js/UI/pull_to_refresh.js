// =============================================================
// COMPONENT: PULL TO REFRESH (VUỐT KÉO TOÀN TRANG ĐỂ LÀM MỚI)
// Cơ chế chuẩn Native App: Toàn bộ trang kéo xuống để lộ thanh reload bên dưới
// Phong cách: Mindora Luxury (Sang trọng, mượt mà, không giật lag)
// =============================================================

function PullToRefresh() {
  return `
    <div id="ptr-indicator" class="fixed top-0 left-0 right-0 h-14 flex items-center justify-center pointer-events-none z-0 select-none">
      <div class="flex items-center gap-2 text-xs font-semibold text-spa-dark/80 dark:text-white/80">
        <span id="ptr-icon" class="flex items-center justify-center text-spa-sage dark:text-spa-brand transition-transform">
          <i data-lucide="arrow-down" class="w-4 h-4"></i>
        </span>
        <span id="ptr-text" class="tracking-wide">Kéo xuống để làm mới...</span>
      </div>
    </div>
  `;
}

function initPullToRefresh() {
  // Gắn thanh reload vào vị trí dưới cùng của body (z-index thấp hơn trang)
  let ptr = document.getElementById('ptr-indicator');
  if (!ptr) {
    document.body.insertAdjacentHTML('afterbegin', PullToRefresh());
    ptr = document.getElementById('ptr-indicator');
    if (window.lucide && typeof lucide.createIcons === 'function') {
      lucide.createIcons();
    }
  }

  const ptrText = document.getElementById('ptr-text');
  const ptrIcon = document.getElementById('ptr-icon');
  if (!ptr || !ptrText || !ptrIcon) return;

  let touchStartY = 0;
  let isPulling = false;
  let hasTriggeredHaptic = false;
  const PULL_THRESHOLD = 70; // Ngưỡng kéo (px) để kích hoạt tải lại
  const MAX_TRANSLATE = 75;  // Độ dãn tối đa khi kéo toàn trang

  // Lấy container trang đang hiển thị (màn hình login hoặc #app)
  function getPageElement() {
    return document.getElementById('screen-login') || document.getElementById('app');
  }

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

  // Bắt đầu chạm
  window.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    const scrollTop = getScrollTop(e);
    if (scrollTop <= 3) {
      touchStartY = e.touches[0].clientY;
      isPulling = true;
      hasTriggeredHaptic = false;
      const page = getPageElement();
      if (page) page.style.transition = 'none';
    }
  }, { passive: true });

  // Vuốt kéo toàn trang xuống
  window.addEventListener('touchmove', (e) => {
    if (!isPulling) return;
    const scrollTop = getScrollTop(e);
    if (scrollTop > 3) {
      isPulling = false;
      const page = getPageElement();
      if (page) {
        page.style.transition = 'transform 0.2s linear';
        page.style.transform = 'translateY(0px)';
        setTimeout(() => { page.style.transform = ''; page.style.transition = ''; }, 200);
      }
      return;
    }

    const touchY = e.touches[0].clientY;
    const diff = touchY - touchStartY;

    if (diff > 5) {
      if (e.cancelable) e.preventDefault();

      const page = getPageElement();
      if (!page) return;

      // Toàn bộ trang trượt xuống êm ái theo ngón tay, để lộ thanh reload ở phía trên
      const translateY = Math.min(diff * 0.45, MAX_TRANSLATE);
      page.style.transform = `translateY(${translateY}px)`;

      if (diff >= PULL_THRESHOLD) {
        if (!hasTriggeredHaptic) {
          hasTriggeredHaptic = true;
          if (typeof navigator.vibrate === 'function') {
            navigator.vibrate(12);
          }
        }
        ptrText.innerText = 'Thả tay để làm mới!';
        ptrIcon.innerHTML = '<i data-lucide="rotate-cw" class="w-4 h-4"></i>';
      } else {
        hasTriggeredHaptic = false;
        ptrText.innerText = 'Kéo xuống để làm mới...';
        ptrIcon.innerHTML = '<i data-lucide="arrow-down" class="w-4 h-4"></i>';
      }

      if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
      }
    }
  }, { passive: false });

  // Thả tay
  window.addEventListener('touchend', (e) => {
    if (!isPulling) return;
    isPulling = false;

    const page = getPageElement();
    if (!page) return;

    const touchEndY = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : touchStartY;
    const diff = touchEndY - touchStartY;

    page.style.transition = 'transform 0.25s linear';

    if (diff >= PULL_THRESHOLD) {
      // Giữ trang hé mở ở 50px để hiển thị trạng thái đang tải lại
      page.style.transform = 'translateY(50px)';
      ptrText.innerText = 'Đang tải lại bản mới nhất...';
      ptrIcon.innerHTML = '<i data-lucide="refresh-cw" class="w-4 h-4 animate-spin"></i>';
      if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
      }

      // Tải lại trang với tham số làm mới bộ nhớ đệm
      setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('v', Date.now().toString());
        window.location.replace(url.toString());
      }, 350);
    } else {
      // Kéo chưa đủ ngưỡng: trả trang về lại vị trí ban đầu
      page.style.transform = 'translateY(0px)';
      setTimeout(() => {
        page.style.transform = '';
        page.style.transition = '';
      }, 250);
    }
  }, { passive: true });
}
