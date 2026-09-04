// =========================================================================
// SCREEN COMPONENT: OWNER HOME (DASHBOARD QUẢN TRỊ DÀNH CHO CHỦ SÁNG LẬP)
// =========================================================================

/**
 * Render toàn bộ giao diện Trang chủ dành cho Chủ tiệm / Quản lý (Owner / Admin)
 * @param {Object} user - Thông tin Chủ tiệm hiện tại (currentUser)
 * @returns {string} Chuỗi HTML của giao diện Owner Home
 */
function renderOwnerHome(user) {
  if (!user) return '';

  const snapshot = (typeof HomeService !== 'undefined')
    ? HomeService.getOwnerTodaySnapshot()
    : { todayRevenue: 0, formattedRevenue: '0 đ', todayCustomers: 0, activeBedsCount: 0, totalBedsCount: 6 };

  const liveTours = (typeof HomeService !== 'undefined')
    ? HomeService.getLiveRunningTours()
    : [];

  const announcement = (typeof HomeService !== 'undefined')
    ? HomeService.getHomeAnnouncement()
    : '✨ Chúc các bạn một ngày làm việc tuyệt vời!';

  // 1. CỤM BANNER CHỦ SÁNG LẬP & NÚT HÀNH ĐỘNG
  const actionBtnHtml = (typeof AppButton === 'function') ? AppButton({
    text: 'LẬP PHIẾU TOUR MỚI',
    icon: 'plus-circle',
    iconPosition: 'left',
    variant: 'primary',
    size: 'lg',
    onClick: "navigateTab('pos')",
    customClass: 'w-full sm:w-auto shadow-glow-brand'
  }) : '';

  // 2. CỤM DANH SÁCH GIƯỜNG ĐANG CHẠY GIỜ REALTIME
  let liveBedsListHtml = '';
  if (liveTours.length === 0) {
    liveBedsListHtml = `
      <div class="p-6 rounded-3xl bg-spa-bg/50 dark:bg-white/5 border border-dashed border-spa-border text-center space-y-2 col-span-full">
        <div class="w-10 h-10 rounded-2xl bg-spa-sage/15 text-spa-sage mx-auto flex items-center justify-center">
          <i data-lucide="sparkles" class="w-5 h-5"></i>
        </div>
        <div class="font-bold text-sm text-spa-dark dark:text-white">Tất cả các giường đang sẵn sàng!</div>
        <p class="text-xs text-spa-muted dark:text-white/60 max-w-sm mx-auto">
          Hiện tại chưa có ca phục vụ nào đang chạy. Bấm nút "Lập phiếu tour mới" khi có khách ghé trải nghiệm.
        </p>
      </div>
    `;
  } else {
    liveBedsListHtml = liveTours.map((t, idx) => {
      if (typeof BedCard === 'function') {
        return BedCard({
          sess: t,
          bedIndex: t.bedIndex || (idx + 1),
          elapsedMin: t.elapsedMin,
          targetMin: t.targetMin,
          progressPct: t.progressPct,
          isOverdue: t.isOverdue,
          staffNames: t.staffNames
        });
      }
      return '';
    }).join('');
  }

  // 3. CỤM THẺ CHỈ SỐ TODAY SNAPSHOT
  const revCardHtml = (typeof StatCard === 'function') ? StatCard({
    id: 'owner-today-revenue',
    title: 'Doanh Thu Hôm Nay',
    value: snapshot.formattedRevenue,
    subtitle: 'Thực thu toàn tiệm',
    color: 'coral'
  }) : '';

  const custCardHtml = (typeof StatCard === 'function') ? StatCard({
    id: 'owner-today-customers',
    title: 'Lượt Khách Đến',
    value: String(snapshot.todayCustomers),
    subtitle: 'Hóa đơn đã thanh toán',
    color: 'mint'
  }) : '';

  const bedsCardHtml = (typeof StatCard === 'function') ? StatCard({
    id: 'owner-today-beds-stat',
    title: 'Giường Đang Chạy',
    value: `${snapshot.activeBedsCount}/${snapshot.totalBedsCount}`,
    subtitle: 'Công suất phòng gội',
    color: 'purple'
  }) : '';

  return `
    <div id="owner-home-container" class="space-y-6 animate-fade-in">
      <!-- CỤM 1: WELLNESS BANNER CHỦ SÁNG LẬP -->
      ${typeof AppCard === 'function' ? AppCard({
        variant: 'mindora',
        content: `
          <!-- Ambient Glow Spheres (Bộ 5 màu) -->
          <div class="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-[#E8AEB7]/20 dark:bg-[#E8AEB7]/10 blur-3xl pointer-events-none"></div>
          <div class="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-[#5E887E]/20 dark:bg-[#5E887E]/10 blur-3xl pointer-events-none"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-[#A7C7E7]/15 dark:bg-[#A7C7E7]/5 blur-3xl pointer-events-none"></div>

          <div class="relative z-10 space-y-3.5">
            <div class="flex items-center justify-between">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-spa-brand/15 text-spa-brand border border-spa-brand/25">
                <i data-lucide="crown" class="w-3.5 h-3.5"></i>
                <span>Chủ Sáng Lập</span>
              </span>
              <div class="flex items-center gap-2">
                <span class="text-xs text-spa-muted dark:text-white/60 font-medium">Hôm nay</span>
                ${typeof ThemeToggle === 'function' ? ThemeToggle({ customClass: 'w-8 h-8 !p-1.5 bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-spa-border dark:border-white/15 shadow-2xs' }) : ''}
              </div>
            </div>

            <h2 class="text-2xl sm:text-3xl font-medium font-serif text-spa-dark dark:text-white tracking-tight">
              Chào <span class="text-spa-brand font-bold">${user.full_name || 'Miles'}</span>, <span class="font-normal text-spa-muted dark:text-white/70">hôm nay tiệm vận hành tuyệt vời chứ? ✨</span>
            </h2>

            <p class="text-spa-muted dark:text-white/70 text-sm max-w-md leading-relaxed">
              Giám sát các giường đang gội trực tiếp & kiểm soát doanh thu thời gian thực.
            </p>

            <div class="pt-2">
              ${actionBtnHtml}
            </div>
          </div>
        `
      }) : ''}

      <!-- CỤM 2: CÁC TOUR ĐANG PHỤC VỤ TRỰC TIẾP (LIVE RUNNING TOURS REALTIME) -->
      ${typeof AppCard === 'function' ? AppCard({
        variant: 'surface',
        padding: 'p-5 sm:p-6',
        customClass: 'space-y-4',
        content: `
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-spa-border dark:border-white/10">
            <div class="flex items-center gap-2.5">
              <span class="flex h-3 w-3 relative">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-spa-sage opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-spa-sage"></span>
              </span>
              <h3 class="text-base sm:text-lg font-bold text-spa-dark dark:text-white">
                Các Giường Đang Phục Vụ Trực Tiếp
              </h3>
              <span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-spa-sage/15 text-spa-sage dark:text-[#88B8AD]">
                ${liveTours.length} đang chạy
              </span>
            </div>

            <button onclick="refreshLiveBeds()" class="px-3 py-1.5 rounded-xl bg-spa-bg dark:bg-white/10 hover:bg-spa-peach-light dark:hover:bg-white/15 text-spa-muted dark:text-white/80 hover:text-spa-brand text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-spa-border dark:border-white/10">
              <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
              <span>Cập nhật</span>
            </button>
          </div>

          <!-- Danh sách các thẻ giường BedCard -->
          <div id="owner-live-beds-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            ${liveBedsListHtml}
          </div>
        `
      }) : ''}

      <!-- CỤM 3: CHỈ SỐ NHANH HÔM NAY (TODAY SNAPSHOT) -->
      <div class="space-y-3">
        <div class="flex items-center justify-between px-1">
          <h3 class="text-base font-bold text-spa-dark dark:text-white flex items-center gap-2">
            <i data-lucide="bar-chart-2" class="w-4 h-4 text-spa-brand"></i>
            <span>Chỉ Số Vận Hành Hôm Nay (Today Snapshot)</span>
          </h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          ${revCardHtml}
          ${custCardHtml}
          ${bedsCardHtml}
        </div>
      </div>

      <!-- CỤM 4: THÔNG BÁO ĐANG PHÁT CHO TOÀN BỘ KTV -->
      ${typeof AppCard === 'function' ? AppCard({
        variant: 'peach',
        padding: 'p-5',
        customClass: 'space-y-3',
        content: `
          <div class="flex items-center justify-between">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-spa-brand/15 text-spa-brand text-xs font-bold border border-spa-brand/25">
              <i data-lucide="megaphone" class="w-3.5 h-3.5"></i>
              <span>Thông Báo Đang Phát Cho KTV</span>
            </div>
            <button onclick="promptEditAnnouncement()" class="px-3.5 py-1.5 rounded-full bg-spa-brand hover:bg-spa-brand-hover text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-glow-brand active:scale-95">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
              <span>Sửa Thông Báo</span>
            </button>
          </div>

          <div class="text-sm font-semibold text-spa-dark dark:text-white leading-relaxed" id="owner-announcement-display">
            ${announcement}
          </div>
        `
      }) : ''}
    </div>
  `;
}

/**
 * Làm mới nhanh danh sách giường đang chạy mà không tải lại cả trang
 */
function refreshLiveBeds() {
  const grid = document.getElementById('owner-live-beds-grid');
  if (!grid || typeof HomeService === 'undefined') return;

  const liveTours = HomeService.getLiveRunningTours();
  if (liveTours.length === 0) {
    grid.className = 'w-full';
    grid.innerHTML = `
      <div class="p-6 rounded-3xl bg-spa-bg/50 dark:bg-white/5 border border-dashed border-spa-border text-center space-y-2">
        <div class="w-10 h-10 rounded-2xl bg-spa-sage/15 text-spa-sage mx-auto flex items-center justify-center">
          <i data-lucide="sparkles" class="w-5 h-5"></i>
        </div>
        <div class="font-bold text-sm text-spa-dark dark:text-white">Tất cả các giường đang sẵn sàng!</div>
        <p class="text-xs text-spa-muted dark:text-white/60 max-w-sm mx-auto">
          Hiện tại chưa có ca phục vụ nào đang chạy.
        </p>
      </div>
    `;
  } else {
    grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5';
    grid.innerHTML = liveTours.map((t, idx) => {
      if (typeof BedCard === 'function') {
        return BedCard({
          sess: t,
          bedIndex: t.bedIndex || (idx + 1),
          elapsedMin: t.elapsedMin,
          targetMin: t.targetMin,
          progressPct: t.progressPct,
          isOverdue: t.isOverdue,
          staffNames: t.staffNames
        });
      }
      return '';
    }).join('');
  }

  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

/**
 * Xử lý khi Chủ tiệm bấm "Xem / Chăm sóc ca này" trên thẻ BedCard
 */
function handleAdminInspectSession(sessionId) {
  const allSessions = (typeof getStored === 'function') ? getStored('live_sessions_cache', []) : [];
  const target = allSessions.find(s => String(s.session_id) === String(sessionId));
  if (target) {
    try {
      localStorage.setItem('selena_active_live_session', JSON.stringify(target));
    } catch (e) {}
  }
  if (typeof navigateTab === 'function') {
    navigateTab('pos');
  } else if (typeof showScreen === 'function') {
    showScreen('pos');
  }
}

/**
 * Hộp thoại sửa nhanh thông báo phát cho KTV
 */
function promptEditAnnouncement() {
  const current = (typeof HomeService !== 'undefined') ? HomeService.getHomeAnnouncement() : '';
  const newMsg = prompt('Nhập thông báo truyền cảm hứng mới cho toàn bộ KTV:', current);
  if (newMsg && newMsg.trim()) {
    if (typeof HomeService !== 'undefined') {
      HomeService.saveHomeAnnouncement(newMsg.trim());
    }
    const displayEl = document.getElementById('owner-announcement-display');
    if (displayEl) displayEl.innerText = newMsg.trim();
  }
}

// Xuất ra phạm vi toàn cục
if (typeof window !== 'undefined') {
  window.renderOwnerHome = renderOwnerHome;
  window.refreshLiveBeds = refreshLiveBeds;
  window.handleAdminInspectSession = handleAdminInspectSession;
  window.promptEditAnnouncement = promptEditAnnouncement;
}
