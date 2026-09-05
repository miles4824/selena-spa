// =========================================================================
// UI COMPONENT: STAT CARD (CHUYÊN QUẢN LÝ THẺ CHỈ SỐ & THÀNH TÍCH - TAILWIND 4)
// Tự động hóa cơ chế ẩn/hiện số tiền bảo mật & realtime đa hình
// =========================================================================
function StatCard({
  id = "",
  title = "",
  value = "0",
  subtitle = "",
  color = "mint", // 'mint' | 'blue' | 'purple' | 'coral'
  isPrivacy = false,
  isMasked = null,
  privacyType = "", // 'staff_comm' | 'owner_revenue'
  privacyEyeId = "",
  onPrivacyToggle = "",
  customClass = "",
} = {}) {
  // 1. Tự động nhận diện trạng thái che dựa trên privacyType nếu chưa truyền isMasked
  let activeMasked = true;
  if (isMasked !== null) {
    activeMasked = Boolean(isMasked);
  } else if (typeof HomeService !== "undefined") {
    if (privacyType === "staff_comm") {
      activeMasked = HomeService.isStaffCommMasked();
    } else if (privacyType === "owner_revenue") {
      activeMasked = HomeService.isOwnerRevenueMasked();
    }
  }

  // 2. Tự sinh ID con mắt và hành động click nếu chưa truyền
  const resolvedEyeId =
    privacyEyeId || (id ? `${id}-eye-icon` : "stat-card-eye-icon");
  const resolvedEyeBtnId = id ? `${id}-eye-btn` : "stat-card-eye-btn";
  const resolvedToggleAction =
    onPrivacyToggle || (id ? `StatCard.toggle('${id}', '${privacyType}')` : "");

  const colorStyles = {
    mint: {
      bg: "bg-spa-sage-light dark:bg-spa-card",
      border: "border-spa-teal-border dark:border-spa-sage/40",
      text: "text-spa-sage dark:text-spa-sage",
    },
    mist: {
      bg: "bg-spa-mist/15 dark:bg-spa-card",
      border: "border-spa-mist/40 dark:border-spa-mist/40",
      text: "text-spa-mist dark:text-spa-mist",
    },
    pink: {
      bg: "bg-spa-peach-light dark:bg-spa-card",
      border: "border-spa-peach-border dark:border-spa-brand/40",
      text: "text-spa-brand dark:text-spa-brand",
    },
    coral: {
      bg: "stat-card-coral",
      border: "border-transparent dark:border-spa-brand/40",
      text: "text-white dark:text-spa-brand",
    },
  };

  const c = colorStyles[color] || colorStyles.mint;
  const isCoral = color === "coral";

  const eyeBtn = isPrivacy
    ? `
    <button id="${resolvedEyeBtnId}" type="button" onclick="${resolvedToggleAction}" class="${c.text}/70 hover:${c.text} p-0.5 cursor-pointer transition" title="Ẩn/hiện số tiền">
      <i id="${resolvedEyeId}" data-lucide="${activeMasked ? "eye-off" : "eye"}" class="w-3.5 h-3.5"></i>
    </button>
  `
    : "";

  const valueClick = isPrivacy ? `onclick="${resolvedToggleAction}"` : "";
  const valueCursor = isPrivacy ? "cursor-pointer select-none" : "";
  const numColor = isCoral
    ? "text-white dark:text-white"
    : "text-spa-dark dark:text-white";
  const subColor = isCoral ? "text-white/90 dark:text-white/70" : `${c.text}`;

  return `
    <div class="p-4 sm:p-5 rounded-3xl ${c.bg} border ${c.border} stat-card-theme-${color} space-y-1 shadow-xs transition-all duration-300 ${customClass}" style="-webkit-mask-image: -webkit-radial-gradient(white, black); border-radius: 24px; -webkit-border-radius: 24px; isolation: isolate; transform: translateZ(0);">
      <div class="flex items-center gap-1.5">
        <span class="text-xs font-bold ${c.text} uppercase tracking-wider block">${title}</span>
        ${eyeBtn}
      </div>
      <div ${valueClick} class="text-2xl sm:text-3xl font-extrabold font-mono ${numColor} stat-card-val tracking-tight ${valueCursor}" id="${id}">${value}</div>
      <span class="text-xs ${subColor} font-medium block">${subtitle}</span>
    </div>
  `;
}

/**
 * Hàm điều phối trung tâm tự động hóa ẩn/hiện số tiền cho mọi thẻ StatCard
 * Đạt chuẩn Realtime 100% & Bảo mật tuyệt đối (Zero Leaks)
 */
StatCard.toggle = function (cardId, privacyType) {
  try {
    if (typeof HomeService === "undefined") return;

    let isMasked = true;
    let newValue = "•••••• đ";

    if (privacyType === "staff_comm") {
      isMasked = HomeService.toggleStaffCommPrivacy();
      const stats =
        typeof currentUser !== "undefined"
          ? HomeService.getStaffTodayStats(currentUser)
          : null;
      newValue = isMasked
        ? "•••••• đ"
        : stats
          ? stats.formattedCommission
          : "0 đ";
    } else if (privacyType === "owner_revenue") {
      isMasked = HomeService.toggleOwnerRevenuePrivacy();
      const snapshot = HomeService.getOwnerTodaySnapshot();
      newValue = isMasked ? "•••••• đ" : snapshot.formattedRevenue;
    }

    // 1. Cập nhật số tiền hiển thị trên thẻ trúng đích
    const valEl = document.getElementById(cardId);
    if (valEl) {
      valEl.innerText = newValue;
    }

    // 2. Cập nhật icon con mắt
    const eyeBtn = document.getElementById(`${cardId}-eye-btn`);
    const eyeId = `${cardId}-eye-icon`;
    if (eyeBtn) {
      eyeBtn.innerHTML = `<i id="${eyeId}" data-lucide="${isMasked ? "eye-off" : "eye"}" class="w-3.5 h-3.5"></i>`;
    } else {
      const eyeEl =
        document.getElementById(eyeId) ||
        (valEl ? valEl.parentElement.querySelector("[data-lucide]") : null);
      if (eyeEl) {
        eyeEl.outerHTML = `<i id="${eyeId}" data-lucide="${isMasked ? "eye-off" : "eye"}" class="w-3.5 h-3.5"></i>`;
      }
    }

    if (typeof lucide !== "undefined" && lucide.createIcons) {
      lucide.createIcons();
    }
  } catch (err) {
    console.error("[StatCard.toggle] Error toggling privacy:", err);
  }
};

window.StatCard = StatCard;
