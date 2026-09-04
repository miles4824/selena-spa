// =========================================================================
// UI COMPONENT: BOTTOM NAVIGATION DOCK (FLOATING GLASS DOCK & SLIDING PILL)
// =========================================================================

let currentActiveNavTab = "home";

/**
 * Render cấu trúc HTML của thanh Dock điều hướng vào #container-nav
 * @param {string} activeTab - Tab đang chọn mặc định ('home' | 'pos' | 'history' | 'income')
 */
function renderBottomNav(activeTab = "home") {
  const container = document.getElementById("container-nav");
  if (!container) return;

  const tabName = activeTab === "add" ? "pos" : activeTab;
  currentActiveNavTab = tabName;

  const isOwner =
    typeof isUserOwner === "function" && typeof currentUser !== "undefined"
      ? isUserOwner(currentUser)
      : false;
  const incomeLabel = isOwner ? "Báo cáo" : "Thu nhập";

  container.innerHTML = `
    <nav id="mobile-bottom-nav" class="fixed left-4 right-4 z-50 max-w-sm mx-auto pointer-events-auto" style="bottom: calc(env(safe-area-inset-bottom, 16px) + 12px);">
      <div id="nav-dock" class="relative bg-white/90 dark:bg-[#2F3E46]/95 border border-spa-border dark:border-[#3D4E56] backdrop-blur-xl rounded-full shadow-[0_12px_32px_rgba(0,0,0,0.10)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.5)] px-2.5 py-4 flex items-center justify-around">
        <!-- VIÊN THUỐC TRƯỢT DI CHUYỂN TỰ ĐỘNG (SLIDING PILL) -->
        <div id="nav-sliding-indicator" class="absolute rounded-full bg-spa-brand shadow-glow-brand z-[1] pointer-events-none opacity-0 transition-all duration-300 ease-out"></div>

        <!-- 1. TAB HOME -->
        <button type="button" onclick="navigateTab('home')" id="nav-btn-home" data-tab="home" title="Trang chủ" class="relative z-10 w-12 h-12 flex items-center justify-center rounded-full text-[#6D7E84] dark:text-[#A7C7E7] hover:text-spa-brand dark:hover:text-white transition-colors cursor-pointer active:scale-95">
          <i data-lucide="home" class="w-5 h-5"></i>
        </button>

        <!-- 2. TAB POS / TẠO CA -->
        <button type="button" onclick="navigateTab('pos')" id="nav-btn-pos" data-tab="pos" title="Tạo ca mới" class="relative z-10 w-12 h-12 flex items-center justify-center rounded-full text-[#6D7E84] dark:text-[#A7C7E7] hover:text-spa-brand dark:hover:text-white transition-colors cursor-pointer active:scale-95">
          <i data-lucide="plus" class="w-5 h-5"></i>
        </button>

        <!-- 3. TAB HISTORY -->
        <button type="button" onclick="navigateTab('history')" id="nav-btn-history" data-tab="history" title="Lịch sử tour" class="relative z-10 w-12 h-12 flex items-center justify-center rounded-full text-[#6D7E84] dark:text-[#A7C7E7] hover:text-spa-brand dark:hover:text-white transition-colors cursor-pointer active:scale-95">
          <i data-lucide="clock" class="w-5 h-5"></i>
        </button>

        <!-- 4. TAB INCOME / REPORT -->
        <button type="button" onclick="navigateTab('income')" id="nav-btn-income" data-tab="income" title="${incomeLabel}" class="relative z-10 w-12 h-12 flex items-center justify-center rounded-full text-[#6D7E84] dark:text-[#A7C7E7] hover:text-spa-brand dark:hover:text-white transition-colors cursor-pointer active:scale-95">
          <i data-lucide="wallet" class="w-5 h-5"></i>
        </button>
      </div>
    </nav>
  `;

  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }

  requestAnimationFrame(() => {
    updateNavSlidingPill(tabName);
  });
}

/**
 * Cập nhật vị trí viên thuốc trượt (Sliding Pill Indicator) đến nút tab đang chọn
 * @param {string} activeTab - Tên tab ('home' | 'pos' | 'history' | 'income')
 */
function updateNavSlidingPill(activeTab = "home") {
  const tabName = activeTab === "add" ? "pos" : activeTab;
  currentActiveNavTab = tabName;
  const tabs = ["home", "pos", "history", "income"];
  const pill = document.getElementById("nav-sliding-indicator");
  const activeBtn = document.getElementById("nav-btn-" + tabName);

  tabs.forEach((t) => {
    const btn = document.getElementById("nav-btn-" + t);
    if (btn) {
      if (t === tabName) {
        btn.classList.add("active", "!text-white");
        btn.classList.remove("text-spa-muted");
      } else {
        btn.classList.remove("active", "!text-white");
        btn.classList.add("text-spa-muted");
      }
    }
  });

  if (pill && activeBtn) {
    pill.style.width = `${activeBtn.offsetWidth}px`;
    pill.style.height = `${activeBtn.offsetHeight}px`;
    pill.style.top = `${activeBtn.offsetTop}px`;
    pill.style.left = `0px`;
    pill.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
    pill.classList.remove("opacity-0");
    pill.classList.add("opacity-100");
  }
}

/**
 * Điều hướng tab
 * @param {string} tab - Tên tab ('home' | 'pos' | 'history' | 'income')
 */
function navigateTab(tab) {
  const tabName = tab === "add" ? "pos" : tab;

  // Nếu đang ở Home và bấm lại Home thì chỉ cuộn lên đầu trang, tránh re-render giật lag
  if (tabName === currentActiveNavTab && tabName === "home") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  currentActiveNavTab = tabName;
  updateNavSlidingPill(tabName);

  if (typeof showScreen === "function") {
    showScreen(tabName);
  } else if (typeof showView === "function") {
    showView(tabName);
  }
}

/**
 * Ẩn/Hiện thanh Bottom Nav
 */
function showBottomNav() {
  const container = document.getElementById("container-nav");
  if (container) container.classList.remove("hidden");
}

function hideBottomNav() {
  const container = document.getElementById("container-nav");
  if (container) container.classList.add("hidden");
}

// Xuất ra phạm vi toàn cục
if (typeof window !== "undefined") {
  window.renderBottomNav = renderBottomNav;
  window.updateNavSlidingPill = updateNavSlidingPill;
  window.navigateTab = navigateTab;
  window.showBottomNav = showBottomNav;
  window.hideBottomNav = hideBottomNav;
  window.getCurrentActiveNavTab = () => currentActiveNavTab;
  window.setCurrentActiveNavTab = (tab) => {
    currentActiveNavTab = tab;
  };

  // Giữ viên thuốc bám chuẩn khi xoay màn hình hoặc đổi kích cỡ
  window.addEventListener("resize", () => {
    const activeBtn = document.querySelector("#nav-dock button.active");
    if (activeBtn) {
      const tab = activeBtn.getAttribute("data-tab");
      if (tab) updateNavSlidingPill(tab);
    }
  });
}
