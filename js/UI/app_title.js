// =========================================================================
// UI COMPONENT: APP TITLE (CHUYÊN QUẢN LÝ TIÊU ĐỀ TOÀN HỆ THỐNG - TAILWIND 4)
// =========================================================================
function AppTitle({
  text = "",
  title = "",
  configKey = "",
  defaultText = "",
  icon = "",
  iconColor = "text-spa-brand",
  level = "section", // 'section' | 'page' | 'card' | 'modal'
  rightText = "",
  rightAction = "",
  actionPosition = "right", // 'right' | 'left' | 'bottom' | 'top'
  subtitle = "",
  customClass = "",
  id = "",
} = {}) {
  // 1. Xác định nội dung chữ: Ưu tiên lấy từ tb_config trên Sheet nếu có configKey
  let titleContent = title || text;
  if (configKey && typeof getStored === "function") {
    const uiConfig = getStored("ui_config", {});
    const defaultTitles =
      typeof DEFAULT_UI_TITLES !== "undefined" ? DEFAULT_UI_TITLES : {};
    titleContent =
      uiConfig[configKey] ||
      uiConfig[configKey.toUpperCase()] ||
      defaultTitles[configKey] ||
      defaultText ||
      titleContent;
  }
  if (!titleContent && defaultText) titleContent = defaultText;

  // 2. Định hình khuôn mẫu UI Tailwind 4 chuẩn mực (Tự động thích ứng Dark/Light Mode)
  const styles = {
    section: "text-base font-bold theme-heading flex items-center gap-2",
    page: "text-2xl font-serif font-medium text-spa-dark dark:text-white",
    card: "text-xs font-bold uppercase tracking-wider text-spa-muted",
    modal:
      "text-base sm:text-lg font-bold text-spa-dark dark:text-white font-serif tracking-tight",
  };

  const idAttr = id ? `id="${id}"` : "";
  const iconHtml = icon
    ? `<i data-lucide="${icon}" class="w-4 h-4 ${iconColor}"></i>`
    : "";
  const rightHtml = rightAction
    ? rightAction
    : rightText
      ? `<span class="text-xs text-spa-hint dark:text-white/60 font-medium">${rightText}</span>`
      : "";
  const subtitleHtml = subtitle
    ? `<p class="text-xs text-spa-muted dark:text-white/60 font-medium mt-0.5">${subtitle}</p>`
    : "";

  // Cấp page: Tiêu đề trang chính (h2), hỗ trợ flex container linh hoạt (trên/dưới/trái/phải)
  if (level === "page") {
    if (rightAction || rightText || subtitle) {
      if (actionPosition === "bottom") {
        return `
          <div class="flex flex-col gap-1.5 ${customClass}">
            <h2 ${idAttr} class="${styles.page} flex items-center gap-2">
              ${iconHtml}
              <span>${titleContent}</span>
            </h2>
            ${subtitleHtml}
            ${rightHtml}
          </div>
        `;
      }
      if (actionPosition === "top") {
        return `
          <div class="flex flex-col-reverse gap-1.5 ${customClass}">
            <h2 ${idAttr} class="${styles.page} flex items-center gap-2">
              ${iconHtml}
              <span>${titleContent}</span>
            </h2>
            ${subtitleHtml}
            ${rightHtml}
          </div>
        `;
      }
      if (actionPosition === "left") {
        return `
          <div class="flex items-center justify-between flex-row-reverse ${customClass}">
            <div>
              <h2 ${idAttr} class="${styles.page} flex items-center gap-2">
                ${iconHtml}
                <span>${titleContent}</span>
              </h2>
              ${subtitleHtml}
            </div>
            ${rightHtml}
          </div>
        `;
      }
      // Mặc định 'right': Tiêu đề bên trái, Action bên phải
      return `
        <div class="flex items-center justify-between ${customClass}">
          <div>
            <h2 ${idAttr} class="${styles.page} flex items-center gap-2">
              ${iconHtml}
              <span>${titleContent}</span>
            </h2>
            ${subtitleHtml}
          </div>
          ${rightHtml}
        </div>
      `;
    }
    return `
      <h2 ${idAttr} class="${styles.page} flex items-center gap-2 ${customClass}">
        ${iconHtml}
        <span>${titleContent}</span>
      </h2>
    `;
  }

  // Cấp section: hiển thị tiêu đề phân đoạn chuẩn theme-heading với container px-1
  if (level === "section") {
    if (actionPosition === "bottom" && rightHtml) {
      return `
        <div class="flex flex-col gap-1 px-1 ${customClass}">
          <h3 ${idAttr} class="${styles.section}">
            ${iconHtml}
            <span>${titleContent}</span>
          </h3>
          ${rightHtml}
        </div>
      `;
    }
    return `
      <div class="flex items-center justify-between px-1 ${customClass}">
        <h3 ${idAttr} class="${styles.section}">
          ${iconHtml}
          <span>${titleContent}</span>
        </h3>
        ${rightHtml}
      </div>
    `;
  }

  return `
    <span ${idAttr} class="${styles[level] || styles.section} flex items-center gap-2 ${customClass}">
      ${iconHtml}
      <span>${titleContent}</span>
    </span>
  `;
}

function SectionTitle(props = {}) {
  return AppTitle({ ...props, level: "section" });
}

// =========================================================================
// UI SUB-COMPONENT: CARD HEADER (TIÊU ĐỀ CHUYÊN DỤNG CHO APPCARD)
// =========================================================================
function CardHeader({
  title = "",
  subtitle = "",
  configKey = "",
  defaultText = "",
  icon = "",
  iconColor = "text-spa-brand",
  ping = false, // Chấm tròn nhấp nháy realtime (xanh ngọc)
  pingColor = "bg-spa-sage",
  badge = "", // Nhãn đếm / trạng thái (vd: '3 đang chạy')
  badgeColor = "bg-spa-sage/15 text-spa-sage dark:text-spa-sage",
  action = "", // Nút bấm hoặc phần tử hành động bên phải
  border = true, // Gạch chân phân cách pb-3 border-b
  customClass = "",
  id = "",
} = {}) {
  // 1. Tự động lấy nội dung chữ từ tb_config trên Sheet nếu có configKey
  let titleContent = title;
  if (configKey && typeof getStored === "function") {
    const uiConfig = getStored("ui_config", {});
    const defaultTitles =
      typeof DEFAULT_UI_TITLES !== "undefined" ? DEFAULT_UI_TITLES : {};
    titleContent =
      uiConfig[configKey] ||
      uiConfig[configKey.toUpperCase()] ||
      defaultTitles[configKey] ||
      defaultText ||
      title;
  }
  if (!titleContent && defaultText) titleContent = defaultText;

  // 2. Chấm nhấp nháy trạng thái realtime (Ping Dot)
  const pingHtml = ping
    ? `
    <span class="flex h-2.5 w-2.5 relative shrink-0">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full ${pingColor} opacity-75"></span>
      <span class="relative inline-flex rounded-full h-2.5 w-2.5 ${pingColor}"></span>
    </span>
  `
    : "";

  // 3. Icon Lucide nếu có
  const iconHtml = icon
    ? `<i data-lucide="${icon}" class="w-4.5 h-4.5 ${iconColor} shrink-0"></i>`
    : "";

  // 4. Badge đếm số / trạng thái
  const badgeHtml = badge
    ? `
    <span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${badgeColor} shrink-0">
      ${badge}
    </span>
  `
    : "";

  // 5. Phụ đề nhỏ
  const subHtml = subtitle
    ? `<p class="text-xs text-spa-muted dark:text-white/60 font-normal mt-0.5">${subtitle}</p>`
    : "";

  // 6. Viền gạch chân
  const borderClass = border
    ? "pb-3 border-b border-spa-border dark:border-white/10"
    : "";
  const idAttr = id ? `id="${id}"` : "";

  return `
    <div ${idAttr} class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 ${borderClass} ${customClass}">
      <div class="flex items-center gap-2.5 flex-wrap">
        ${pingHtml}
        ${iconHtml}
        <div>
          <h3 class="text-base sm:text-lg font-bold theme-heading uppercase font-sans">
            ${titleContent}
          </h3>
          ${subHtml}
        </div>
        ${badgeHtml}
      </div>
      ${action ? `<div class="shrink-0 flex items-center gap-2">${action}</div>` : ""}
    </div>
  `;
}

// =========================================================================
// UI SUB-COMPONENT: MODAL HEADER (TIÊU ĐỀ GHIM ĐỈNH CHUYÊN DỤNG CHO MODAL)
// =========================================================================
function ModalHeader({
  title = "",
  subtitle = "",
  configKey = "",
  defaultText = "",
  icon = "",
  iconColor = "text-spa-brand",
  badge = "",
  badgeColor = "bg-spa-brand/15 text-spa-brand",
  onClose = "", // Lệnh JS khi bấm nút đóng 'x' (vd: closeModal('id'))
  action = "", // Nút phụ bên phải nếu có
  border = true,
  customClass = "",
  id = "",
} = {}) {
  // 1. Tự động lấy nội dung chữ từ tb_config trên Sheet nếu có configKey
  let titleContent = title;
  if (configKey && typeof getStored === "function") {
    const uiConfig = getStored("ui_config", {});
    const defaultTitles =
      typeof DEFAULT_UI_TITLES !== "undefined" ? DEFAULT_UI_TITLES : {};
    titleContent =
      uiConfig[configKey] ||
      uiConfig[configKey.toUpperCase()] ||
      defaultTitles[configKey] ||
      defaultText ||
      title;
  }
  if (!titleContent && defaultText) titleContent = defaultText;

  // 2. Icon Lucide nếu có
  const iconHtml = icon
    ? `<i data-lucide="${icon}" class="w-5 h-5 ${iconColor} shrink-0"></i>`
    : "";

  // 3. Badge nếu có
  const badgeHtml = badge
    ? `
    <span class="text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor} shrink-0">
      ${badge}
    </span>
  `
    : "";

  // 4. Subtitle
  const subHtml = subtitle
    ? `<p class="text-xs text-spa-muted dark:text-white/60 font-normal mt-0.5">${subtitle}</p>`
    : "";

  // 5. Nút đóng chuẩn luxury
  const closeBtnHtml = onClose
    ? `
    <button type="button" onclick="${onClose}" class="w-8 h-8 rounded-full bg-spa-card dark:bg-white/10 hover:bg-spa-brand/15 text-spa-muted hover:text-spa-brand border border-spa-border dark:border-white/15 flex items-center justify-center transition cursor-pointer active:scale-90 shadow-2xs shrink-0" title="Đóng">
      <i data-lucide="x" class="w-4 h-4"></i>
    </button>
  `
    : "";

  const borderClass = border
    ? "border-b border-spa-border dark:border-white/10"
    : "";
  const idAttr = id ? `id="${id}"` : "";

  return `
    <div ${idAttr} class="flex items-center justify-between px-6 py-4.5 ${borderClass} bg-spa-bg/90 backdrop-blur-md shrink-0 select-none ${customClass}">
      <div class="flex items-center gap-2.5">
        ${iconHtml}
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-base sm:text-lg font-bold text-spa-dark dark:text-white font-serif tracking-tight leading-tight">
              ${titleContent}
            </h3>
            ${badgeHtml}
          </div>
          ${subHtml}
        </div>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        ${action}
        ${closeBtnHtml}
      </div>
    </div>
  `;
}

// Gán bí danh vào AppTitle & xuất ra phạm vi toàn cục
AppTitle.Section = SectionTitle;
AppTitle.Card = CardHeader;
AppTitle.Modal = ModalHeader;

if (typeof window !== "undefined") {
  window.AppTitle = AppTitle;
  window.SectionTitle = SectionTitle;
  window.CardHeader = CardHeader;
  window.ModalHeader = ModalHeader;
}
