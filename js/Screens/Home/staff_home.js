// =========================================================================
// SCREEN COMPONENT: STAFF HOME (DASHBOARD CA TRỰC DÀNH CHO KỸ THUẬT VIÊN)
// =========================================================================

/**
 * Render toàn bộ giao diện Trang chủ dành cho Kỹ thuật viên (Staff / KTV)
 * @param {Object} user - Thông tin KTV hiện tại (currentUser)
 * @returns {string} Chuỗi HTML của giao diện Staff Home
 */
function renderStaffHome(user) {
  if (!user) return "";

  const tourInfo =
    typeof HomeService !== "undefined"
      ? HomeService.checkUserRunningTour(user)
      : { isRunning: false, session: null, elapsedMin: 0, targetMin: 45 };

  const stats =
    typeof HomeService !== "undefined"
      ? HomeService.getStaffTodayStats(user)
      : {
          todayTours: 0,
          todayCommission: 0,
          formattedCommission: "0 đ",
          isMasked: true,
        };

  const announcement =
    typeof HomeService !== "undefined"
      ? HomeService.getHomeAnnouncement()
      : "✨ Chúc các bạn KTV một ngày làm việc tuyệt vời!";

  // 1. CỤM BANNER TRẠNG THÁI & NÚT HÀNH ĐỘNG BIẾN HÌNH
  const statusBadgeHtml =
    typeof StatusBadge === "function"
      ? StatusBadge({
          status: tourInfo.isRunning ? "busy" : "free",
          elapsedMin: tourInfo.elapsedMin,
          targetMin: tourInfo.targetMin,
          id: "staff-status-badge",
        })
      : "";

  let statusDesc = "";
  let actionBtnHtml = "";

  if (tourInfo.isRunning) {
    const s = tourInfo.session;
    const cust = s?.customer_name || "Khách vãng lai";
    const serv = s?.service_name || "Dịch vụ dưỡng sinh";
    statusDesc = `Bạn đang trong tour phục vụ <strong class="font-extrabold text-spa-dark dark:text-white">${cust}</strong> (<em class="italic font-bold text-spa-brand">${serv}</em>). Vào tour ngay để theo dõi ca hoặc bổ sung dịch vụ.`;

    actionBtnHtml =
      typeof AppButton === "function"
        ? AppButton({
            text: "VÀO XEM NGAY",
            icon: "timer",
            iconPosition: "left",
            variant: "teal",
            size: "lg",
            onClick: "navigateTab('pos')",
            customClass: "w-full sm:w-auto shadow-glow-sage",
          })
        : "";
  } else {
    statusDesc =
      typeof getConfig === "function"
        ? getConfig(
            "home_free_quote",
            "Mỗi tour gội là một trải nghiệm thư giãn tuyệt vời gửi gắm đến khách hàng thân yêu.",
          )
        : "Mỗi tour gội là một trải nghiệm thư giãn tuyệt vời gửi gắm đến khách hàng thân yêu.";

    actionBtnHtml =
      typeof AppButton === "function"
        ? AppButton({
            text: "VÀO TOUR NGAY",
            icon: "plus-circle",
            iconPosition: "left",
            variant: "primary",
            size: "lg",
            onClick: "navigateTab('pos')",
            customClass: "w-full sm:w-auto shadow-glow-brand",
          })
        : "";
  }

  // 2. CỤM THẺ CHỈ SỐ THÀNH TÍCH HÔM NAY (STAT CARDS)
  const toursCardHtml =
    typeof StatCard === "function"
      ? StatCard({
          id: "staff-today-tours-count",
          title: "Số Tour Đã Gội",
          value: String(stats.todayTours),
          subtitle: "Đã hoàn thành hôm nay",
          color: "coral",
        })
      : "";

  const commCardHtml =
    typeof StatCard === "function"
      ? StatCard({
          id: "staff-today-commission-value",
          title: "Hoa Hồng Hôm Nay",
          value: stats.formattedCommission,
          subtitle: "Bấm để ẩn / hiện số tiền",
          color: "mint",
          isPrivacy: true,
          privacyEyeId: "staff-comm-eye-icon",
          onPrivacyToggle: "handleStaffTogglePrivacy()",
        })
      : "";

  return `
    <div id="staff-home-container" class="space-y-5 animate-fade-in">
      <!-- CỤM 1: WELLNESS BANNER CHÀO ĐÓN & NÚT TRẠNG THÁI BIẾN HÌNH -->
      ${
        typeof AppCard === "function"
          ? AppCard({
              variant: "mindora",
              ambient: true,
              content: `
          <div class="relative z-10 space-y-3.5">
            <div class="flex items-center justify-between">
              ${statusBadgeHtml}
              <div class="flex items-center gap-2">
                <span class="text-xs text-spa-muted dark:text-white/60 font-medium">Hôm nay</span>
                ${typeof ThemeToggle === "function" ? ThemeToggle({ customClass: "w-8 h-8 !p-1.5 bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-spa-border dark:border-white/15 shadow-2xs" }) : ""}
              </div>
            </div>

            <h2 class="text-2xl sm:text-3xl font-medium font-serif theme-heading tracking-tight">
              Chào <span class="text-spa-brand font-bold">${user.full_name || "KTV"}</span>, <span class="font-normal theme-subtext">hôm nay sẵn sàng tỏa sáng chưa? ✨</span>
            </h2>

            <p class="theme-subtext text-sm max-w-md leading-relaxed">
              ${statusDesc}
            </p>

            <div class="pt-2">
              ${actionBtnHtml}
            </div>
          </div>
        `,
            })
          : ""
      }

      <!-- CỤM 2: THÔNG BÁO NỘI BỘ TỪ CHỦ TIỆM -->
      ${
        typeof AppCard === "function"
          ? AppCard({
              variant: "peach",
              padding: "p-4 sm:p-5",
              customClass: "flex items-start gap-3.5",
              content: `
          <div class="w-10 h-10 rounded-2xl bg-spa-brand/15 text-spa-brand flex items-center justify-center shrink-0 mt-0.5">
            <i data-lucide="megaphone" class="w-5 h-5"></i>
          </div>
          <div class="space-y-1">
            <div class="text-xs font-bold text-spa-brand uppercase tracking-wider">Thông Báo Từ Chủ Tiệm</div>
            <p class="text-xs sm:text-sm theme-heading font-medium leading-relaxed">
              ${announcement}
            </p>
          </div>
        `,
            })
          : ""
      }

      <!-- CỤM 3: THÀNH TÍCH CỦA BẠN TRONG NGÀY HÔM NAY -->
      <div class="space-y-3">
        <div class="flex items-center justify-between px-1">
          <h3 class="text-base font-bold theme-heading flex items-center gap-2">
            <i data-lucide="award" class="w-4 h-4 text-spa-brand"></i>
            <span>Thành Tích Của Bạn Hôm Nay</span>
          </h3>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          ${toursCardHtml}
          ${commCardHtml}
        </div>
      </div>
    </div>
  `;
}

/**
 * Xử lý sự kiện bấm nút mắt ẩn/hiện số tiền hoa hồng riêng tư
 */
function handleStaffTogglePrivacy() {
  if (typeof HomeService === "undefined") return;
  const isMasked = HomeService.toggleStaffCommPrivacy();
  const valEl = document.getElementById("staff-today-commission-value");
  const eyeIcon = document.getElementById("staff-comm-eye-icon");

  if (valEl && typeof currentUser !== "undefined") {
    const stats = HomeService.getStaffTodayStats(currentUser);
    valEl.innerText = isMasked
      ? "•••••• đ"
      : HomeService.formatMoney(stats.todayCommission);
  }

  if (eyeIcon) {
    eyeIcon.setAttribute("data-lucide", isMasked ? "eye-off" : "eye");
    if (typeof lucide !== "undefined" && lucide.createIcons)
      lucide.createIcons();
  }
}

// Xuất ra phạm vi toàn cục
if (typeof window !== "undefined") {
  window.renderStaffHome = renderStaffHome;
  window.handleStaffTogglePrivacy = handleStaffTogglePrivacy;
}
