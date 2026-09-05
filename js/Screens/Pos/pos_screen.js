// =========================================================================
// SCREEN CONTROLLER: POS SCREEN (NHẠC TRƯỞNG ĐIỀU PHỐI TAB POS / ADD)
// Tích hợp chuẩn 100% UI Components: AppCard, AppTitle, ModalShell, AppButton
// =========================================================================

window.PosState = {
  selectedCartItems: [],
  extraStaffList: [],
  isStaffCommMasked: true,
  currentCustomer: null,
  useVoucher: false,
  isBirthdayApplied: false,
  currentLiveSession: null,
};

const PosScreen = {
  initialized: false,

  /**
   * Khởi động và render màn hình POS vào #container-pos
   */
  render() {
    const container = document.getElementById("container-pos");
    if (!container) return;

    if (!currentUser) {
      if (typeof initLogin === "function") initLogin();
      return;
    }

    const isOwner =
      typeof isUserOwner === "function" ? isUserOwner(currentUser) : false;

    // 1. Chỉ dựng cấu trúc DOM nếu chưa dựng (Bảo toàn trạng thái form)
    if (!this.initialized || !container.hasChildNodes()) {
      this.mountDOM(container, isOwner);
      this.initDefaultCart();
      this.initialized = true;
    }

    // 2. Khôi phục trạng thái ca đang chạy (nếu có từ trước)
    this.restoreLiveSession();

    // 3. Khởi tạo biểu tượng Lucide
    if (typeof lucide !== "undefined" && lucide.createIcons) {
      lucide.createIcons();
    }
  },

  /**
   * Khởi tạo giỏ hàng mặc định (Combo 1 nếu giỏ đang trống)
   */
  initDefaultCart() {
    const menu =
      typeof getStored === "function"
        ? getStored(
            "menu",
            typeof DEFAULT_MENU !== "undefined" ? DEFAULT_MENU : [],
          )
        : typeof DEFAULT_MENU !== "undefined"
          ? DEFAULT_MENU
          : [];

    if (
      !window.PosState.selectedCartItems ||
      window.PosState.selectedCartItems.length === 0
    ) {
      const combo1 =
        typeof QuickPills !== "undefined"
          ? QuickPills.findComboByNumber(menu, 1)
          : menu[0] || null;
      if (combo1) {
        window.PosState.selectedCartItems = [{ ...combo1 }];
      }
    }
    this.updateCartUI();
  },

  /**
   * Cập nhật đồng bộ toàn bộ giao diện giỏ hàng và hoa hồng
   */
  updateCartUI() {
    const cart = window.PosState.selectedCartItems || [];

    // 1. Cập nhật Quick Pills
    const pillsContainer = document.getElementById("pos-quick-combos");
    if (pillsContainer && typeof QuickPills !== "undefined") {
      pillsContainer.innerHTML = QuickPills.render(cart);
    }

    // 2. Cập nhật Cart Chips & Badge số lượng
    const chipsContainer = document.getElementById("pos-cart-chips-list");
    const countBadge = document.getElementById("pos-cart-count-badge");
    if (chipsContainer && typeof CartChips !== "undefined") {
      chipsContainer.innerHTML = CartChips.render(cart);
    }
    if (countBadge) {
      countBadge.innerText = `${cart.length} dịch vụ`;
    }

    // 3. Cập nhật Thẻ Tổng Thanh Toán
    if (typeof CartTotalBar !== "undefined") {
      CartTotalBar.update(cart);
    }

    // 4. Cập nhật Hoa hồng KTV chính & phụ
    if (typeof StaffPrimary !== "undefined") {
      StaffPrimary.updateCommissionPreview();
    }
    if (typeof StaffExtra !== "undefined") {
      StaffExtra.renderList();
    }

    if (typeof lucide !== "undefined" && lucide.createIcons) {
      lucide.createIcons();
    }
  },

  /**
   * Bắt đầu ca tour mới (Chuyển từ Form tạo ca sang Màn hình đếm giờ)
   */
  startLiveTour() {
    const cart = window.PosState.selectedCartItems || [];
    if (cart.length === 0) {
      alert("Vui lòng chọn ít nhất 1 dịch vụ hoặc combo để bắt đầu tour!");
      return;
    }

    const s1Phone =
      document.getElementById("pos-staff1-select")?.value || currentUser?.phone;
    const users =
      typeof StaffPrimary !== "undefined" ? StaffPrimary.getUsersList() : [];
    const staff1 =
      users.find(
        (u) =>
          String(u.phone).replace(/[^0-9]/g, "") ===
          String(s1Phone).replace(/[^0-9]/g, ""),
      ) || currentUser;

    const summary =
      typeof PosService !== "undefined"
        ? PosService.calculateCartSummary(cart)
        : { totalPrice: 0, totalDuration: 50 };

    const customerValues =
      typeof CustomerFields !== "undefined"
        ? CustomerFields.getValues()
        : { name: "", birthMonth: "" };

    const customerName = customerValues.name || "Khách vãng lai";
    const phoneInput = document.getElementById("pos-customer-phone");
    const inputVal = phoneInput ? phoneInput.value.trim() : "";
    const customerPhone =
      (window.PosState && window.PosState.customerPhone) ||
      (typeof PhoneService !== "undefined" && PhoneService.resolveTruePhone
        ? PhoneService.resolveTruePhone(inputVal, customerName)
        : inputVal);

    const now = new Date();
    const startTimeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const session = {
      session_id: `LIVE_${Date.now()}`,
      service_name: cart.map((i) => i.service_name).join(" + "),
      price: summary.totalPrice,
      duration_target_min: summary.totalDuration || 50,
      start_time: startTimeStr,
      start_timestamp: Date.now(),
      customer_name: customerName,
      customer_phone: customerPhone,
      staff_1_name: staff1.full_name || staff1.name,
      staff_1_phone: staff1.phone,
      extra_staff: [...(window.PosState.extraStaffList || [])],
    };

    // Chuẩn hóa mảng staffs đầy đủ cho Firebase và Home
    const totalStaffCount = 1 + (window.PosState.extraStaffList || []).length;
    const eachPct = Math.round(100 / totalStaffCount);
    session.staffs = [
      {
        phone: staff1.phone,
        id: staff1.staff_id || staff1.id,
        name: staff1.full_name || staff1.name,
        pct: eachPct,
      },
      ...(window.PosState.extraStaffList || []).map((s) => ({
        phone: s.phone,
        id: s.id,
        name: s.name,
        pct: eachPct,
      })),
    ];

    // Dọn sạch các session cũ của nhân viên trên Firebase để chống đè / ghost tour
    if (typeof fbClearLiveSession === "function") {
      fbClearLiveSession();
    }

    window.PosState.currentLiveSession = session;
    window.currentLiveSession = session;
    localStorage.setItem("selena_active_live_session", JSON.stringify(session));

    // 1. Cập nhật cache toàn tiệm (live_sessions_cache) cho màn Home
    if (typeof getStored === "function" && typeof setStored === "function") {
      const curCache = getStored("live_sessions_cache", []);
      const filtered = curCache.filter(
        (s) =>
          String(s.session_id || s.start_timestamp) !==
          String(session.session_id),
      );
      setStored("live_sessions_cache", [session, ...filtered]);
    }

    // 2. Bắn lên Firebase Realtime Database
    if (typeof fbSaveLiveSession === "function") {
      fbSaveLiveSession(session);
    }

    // 3. Cập nhật giao diện Home nếu đang mở
    if (typeof refreshLiveBeds === "function") {
      refreshLiveBeds();
    }

    this.renderLiveSessionUI();
  },

  /**
   * Điều phối hiển thị giữa Form tạo ca và Ca đang chạy
   */
  renderLiveSessionUI() {
    const liveCard = document.getElementById("live-session-card");
    const formBox = document.getElementById("pos-form-box");
    const session =
      window.PosState.currentLiveSession ||
      (typeof currentLiveSession !== "undefined" ? currentLiveSession : null);

    if (session) {
      if (formBox) formBox.classList.add("hidden");
      if (liveCard) liveCard.classList.remove("hidden");

      if (typeof LiveHeader !== "undefined") {
        LiveHeader.update(session);
      }
      if (typeof LiveTimer !== "undefined") {
        LiveTimer.start(session);
      }
      if (typeof LiveActions !== "undefined") {
        LiveActions.updateButtons(session, currentUser);
      }
    } else {
      if (liveCard) liveCard.classList.add("hidden");
      if (formBox) formBox.classList.remove("hidden");

      if (typeof LiveTimer !== "undefined") {
        LiveTimer.stop();
      }
    }

    if (typeof lucide !== "undefined" && lucide.createIcons) {
      lucide.createIcons();
    }
  },

  /**
   * Dừng tour đang chạy (Hủy hoặc Hoàn thành)
   */
  async stopLiveTour(isCancel = false) {
    const session =
      window.PosState.currentLiveSession ||
      (typeof currentLiveSession !== "undefined" ? currentLiveSession : null);
    const targetSessionId = session
      ? session.session_id || session.start_timestamp
      : null;

    // 1. Đưa session vào danh sách đã hủy/loại bỏ để chống Firebase loop
    if (session && typeof markSessionDismissed === "function") {
      markSessionDismissed(session);
    }
    if (targetSessionId && typeof markSessionDismissed === "function") {
      markSessionDismissed({ session_id: targetSessionId });
    }

    // 2. Dọn dẹp localStorage ngay lập tức
    localStorage.removeItem("selena_active_live_session");

    // 3. Dọn dẹp cache toàn tiệm (live_sessions_cache) để Home gỡ bỏ giường ngay lập tức
    if (typeof getStored === "function" && typeof setStored === "function") {
      const curCache = getStored("live_sessions_cache", []);
      const nextCache = curCache.filter((s) => {
        const sid = String(s.session_id || s.start_timestamp || "");
        if (targetSessionId && sid === String(targetSessionId)) return false;
        if (
          typeof dismissedSessionIds !== "undefined" &&
          dismissedSessionIds.has(sid)
        )
          return false;
        return true;
      });
      setStored("live_sessions_cache", nextCache);
    }

    // 4. Reset biến trạng thái
    window.PosState.currentLiveSession = null;
    if (typeof currentLiveSession !== "undefined") {
      currentLiveSession = null;
    }

    // 5. Dừng đếm giờ
    if (typeof LiveTimer !== "undefined") {
      LiveTimer.stop();
    }

    // 6. Cập nhật lại giao diện POS về form tạo ca
    this.renderLiveSessionUI();

    // 7. Xóa triệt để session khỏi Firebase Realtime Database
    if (typeof fbClearLiveSession === "function") {
      await fbClearLiveSession(targetSessionId);
    }

    // 8. Cập nhật lại các giường trên Home ngay lập tức
    if (typeof refreshLiveBeds === "function") {
      refreshLiveBeds();
    }
    if (
      typeof renderHomeScreen === "function" &&
      typeof currentTab !== "undefined" &&
      currentTab === "home"
    ) {
      renderHomeScreen();
    }
  },

  /**
   * Khôi phục phiên tour đang chạy từ localStorage
   */
  restoreLiveSession() {
    try {
      const saved = localStorage.getItem("selena_active_live_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        const sId = String(parsed.session_id || "");
        const tId = String(parsed.start_timestamp || "");

        // Nếu ca này đã bị hủy hoặc dismissed thì xóa ngay khỏi localStorage
        if (
          typeof dismissedSessionIds !== "undefined" &&
          (dismissedSessionIds.has(sId) ||
            (tId && dismissedSessionIds.has(tId)))
        ) {
          localStorage.removeItem("selena_active_live_session");
          window.PosState.currentLiveSession = null;
          if (typeof currentLiveSession !== "undefined")
            currentLiveSession = null;
        } else {
          window.PosState.currentLiveSession = parsed;
          if (typeof currentLiveSession !== "undefined")
            currentLiveSession = parsed;
        }
      } else {
        window.PosState.currentLiveSession = null;
        if (typeof currentLiveSession !== "undefined")
          currentLiveSession = null;
      }
    } catch (e) {
      window.PosState.currentLiveSession = null;
      if (typeof currentLiveSession !== "undefined") currentLiveSession = null;
    }
    this.renderLiveSessionUI();
  },

  /**
   * Dựng cấu trúc HTML chính của Tab POS tích hợp 100% UI Components chuẩn mực
   */
  mountDOM(container, isOwner) {
    // 1. Header trang chính (AppTitle cấp page)
    const pageHeaderHtml = AppTitle({
      level: "page",
      title: "Tạo Tour Gội Mới",
      id: "pos-page-main-title",
      actionPosition: "bottom",
      rightAction: `
        <div id="pos-header-subtitle" class="inline-flex items-center gap-2 text-xs font-bold text-spa-sage font-mono">
          <span class="flex h-2 w-2 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-spa-sage opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-spa-sage"></span>
          </span>
          <span>Sẵn sàng phục vụ</span>
        </div>
      `,
    });

    // 2. Thẻ Ca Đang Chạy Live (Component PosLiveView)
    const liveSessionCardHtml =
      typeof PosLiveView !== "undefined" ? PosLiveView.render() : "";

    // 3. Form Tạo Ca Mới (Component PosFormView)
    const posFormCardHtml =
      typeof PosFormView !== "undefined"
        ? PosFormView.render(currentUser, isOwner)
        : "";

    // 4. Các Modal phụ trợ cho ca Live (PosLiveView.renderModals)
    const modalsHtml =
      typeof PosLiveView !== "undefined" ? PosLiveView.renderModals() : "";

    // 5. Gắn tất cả vào container-pos
    container.innerHTML = `
      <main id="view-add" class="flex-1 p-4 sm:p-6 max-w-xl w-full mx-auto space-y-5 pb-28 safe-area-top" style="padding-top: max(54px, calc(env(safe-area-inset-top, 0px) + 12px));">
        ${pageHeaderHtml}
        ${liveSessionCardHtml}
        ${posFormCardHtml}
      </main>
      ${modalsHtml}
    `;

    // Lắng nghe click ra ngoài popover menu dịch vụ
    document.addEventListener("click", (e) => {
      const popover = document.getElementById("pos-custom-dropdown-popover");
      const containerEl = document.getElementById("pos-tag-container");
      if (!popover || popover.classList.contains("hidden")) return;

      const path = (e.composedPath && e.composedPath()) || [];
      if (path.includes(popover) || path.includes(containerEl)) return;
      if (typeof ServiceDropdown !== "undefined") {
        ServiceDropdown.closePopover();
      }
    });
  },
};

window.PosScreen = PosScreen;
window.renderPosScreen = function () {
  PosScreen.render();
};
window.renderLiveSessionUI = function () {
  PosScreen.renderLiveSessionUI();
};
window.cancelLiveSession = function () {
  PosScreen.stopLiveTour(true);
};
