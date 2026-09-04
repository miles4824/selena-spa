// =============================================================
// COMPONENT: PULL TO REFRESH (VUỐT KÉO ĐỂ LÀM MỚI CHUẨN NATIVE APP)
// Hình nền giữ cố định tuyệt đối, chỉ có thẻ nội dung trượt xuống hé lộ thanh reload
// Phong cách: Mindora Luxury (Sang trọng, mượt mà, không giật lag)
// =============================================================

function PullToRefresh() {
  return `
    <div id="ptr-indicator" class="fixed top-0 left-0 right-0 h-16 flex items-center justify-center pointer-events-none opacity-0 select-none" style="z-index: 10; transition: opacity 0.2s linear;">
      <div class="flex items-center gap-2.5 px-4 py-2 rounded-full liquid-glass border border-white/40 dark:border-white/20 text-xs font-semibold text-spa-dark dark:text-white shadow-lg backdrop-blur-xl">
        <span id="ptr-icon" class="flex items-center justify-center text-spa-sage dark:text-spa-brand transition-transform">
          <i data-lucide="arrow-down" class="w-4 h-4"></i>
        </span>
        <span id="ptr-text" class="tracking-wide">Kéo xuống để làm mới...</span>
      </div>
    </div>
  `;
}

function initPullToRefresh() {
  // Gắn thanh reload vào đầu trang
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
  const MAX_TRANSLATE = 80;  // Độ dãn tối đa khi kéo thẻ card

  // Chỉ kéo khối nội dung/card, TUYỆT ĐỐI KHÔNG KÉO HÌNH NỀN
  function getCardElement() {
    return document.getElementById('login-content-wrapper') || document.getElementById('app');
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
      const card = getCardElement();
      if (card) card.style.transition = 'none';
      ptr.style.transition = 'none';
    }
  }, { passive: true });

  // Vuốt kéo nội dung xuống
  window.addEventListener('touchmove', (e) => {
    if (!isPulling) return;
    const scrollTop = getScrollTop(e);
    if (scrollTop > 3) {
      isPulling = false;
      const card = getCardElement();
      if (card) {
        card.style.transition = 'transform 0.25s linear';
        card.style.transform = 'translateY(0px)';
        setTimeout(() => { card.style.transform = ''; card.style.transition = ''; }, 250);
      }
      ptr.style.opacity = '0';
      return;
    }

    const touchY = e.touches[0].clientY;
    const diff = touchY - touchStartY;

    if (diff > 5) {
      if (e.cancelable) e.preventDefault();

      const card = getCardElement();
      if (!card) return;

      // Card trượt xuống nhẹ nhàng theo tay, nền tranh giữ nguyên tĩnh lặng
      const translateY = Math.min(diff * 0.45, MAX_TRANSLATE);
      card.style.transform = `translateY(${translateY}px)`;

      // Thanh reload hiện dần ở khoảng trống phía trên
      ptr.style.opacity = Math.min(diff / 45, 1).toString();
      ptr.style.transform = `translateY(${Math.min(diff * 0.2, 18)}px)`;

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

    const card = getCardElement();
    if (!card) return;

    const touchEndY = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : touchStartY;
    const diff = touchEndY - touchStartY;

    card.style.transition = 'transform 0.25s linear';
    ptr.style.transition = 'all 0.25s linear';

    if (diff >= PULL_THRESHOLD) {
      // Giữ card hé mở ở 55px để hiển thị trạng thái đang tải lại
      card.style.transform = 'translateY(55px)';
      ptr.style.opacity = '1';
      ptr.style.transform = 'translateY(18px)';
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
      // Kéo chưa đủ ngưỡng: trả card về vị trí cũ và ẩn thanh reload
      card.style.transform = 'translateY(0px)';
      ptr.style.opacity = '0';
      ptr.style.transform = 'translateY(0px)';
      setTimeout(() => {
        card.style.transform = '';
        card.style.transition = '';
      }, 250);
    }
  }, { passive: true });
}
