// =========================================================================
// UI COMPONENT: APP CARD (CHUYÊN QUẢN LÝ KHUÔN THẺ NỀN LUXURY - TAILWIND 4)
// =========================================================================
function AppCard({
  variant = "banner", // 'banner' | 'surface' | 'peach' | 'mint' | 'mindora' | 'zen'
  ambient = false, // Bật hiệu ứng quả cầu phát sáng mờ ảo Ambient Glow (true/false)
  content = "",
  padding = "p-6 sm:p-7",
  customClass = "",
  id = "",
} = {}) {
  const variantStyles = {
    // 1. MỚI: Mindora Luxury (Bộ 5 màu: #E8AEB7 Dusty Rose -> #FFFFFF -> #5E887E Sage Green & #A7C7E7 Sky Blue | Dark: #2F3E46 Deep Slate Pine)
    mindora:
      "app-card-mindora rounded-xl border relative overflow-hidden transition-all duration-300",

    // 2. MỚI: Zen Sage (Bộ 5 màu: #5E887E Sage Green dịu mát -> Trắng -> #F1F5F4 Mint White | Dark: #2F3E46 Deep Slate)
    zen: "app-card-zen rounded-xl border relative overflow-hidden transition-all duration-300",

    // 3. CŨ (CLASSIC): Nền cam đào nguyên bản của phiên bản cũ (Giữ nguyên vẹn 100%)
    banner:
      "app-card-banner rounded-xl border relative overflow-hidden transition-all duration-300",
    "banner-classic":
      "app-card-banner-classic rounded-xl border relative overflow-hidden transition-all duration-300",

    // 4. Surface White (Khối nội dung tiêu chuẩn thích ứng Dark Mode)
    surface:
      "app-card-surface rounded-xl border relative overflow-hidden transition-all duration-300",

    // 5. Peach Accent (Khối thông báo / bảng tin)
    peach:
      "app-card-peach rounded-xl border relative overflow-hidden transition-all duration-300",

    // 6. Mint Accent (Khối điểm nhấn thành tích ngọc bích)
    mint: "app-card-mint bg-[#E8F8F5]/60 dark:bg-[#5E887E]/15 rounded-xl border border-[#B7EBDD] dark:border-[#5E887E]/30 relative overflow-hidden transition-all duration-300",
  };

  const chosenStyle = variantStyles[variant] || variantStyles.banner;
  const idAttr = id ? `id="${id}"` : "";

  // TÍCH HỢP SẴN KHỐI AMBIENT GLOW SPHERES (Khi ambient: true)
  const ambientHtml = ambient
    ? `
      <!-- Ambient Glow Spheres (Bộ 5 màu - Chuẩn WebKit Masking) -->
      <div class="absolute inset-0 pointer-events-none select-none overflow-hidden rounded-xl" style="-webkit-mask-image: -webkit-radial-gradient(white, black); border-radius: 28px;">
        <div class="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-spa-brand/20 dark:bg-spa-brand/10 blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-spa-sage/20 dark:bg-spa-sage/10 blur-3xl pointer-events-none"></div>
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-spa-mist/15 dark:bg-spa-mist/5 blur-3xl pointer-events-none"></div>
      </div>
    `
    : "";

  return `
    <div ${idAttr} class="${chosenStyle} ${padding} ${customClass}" style="-webkit-mask-image: -webkit-radial-gradient(white, black); border-radius: 28px; -webkit-border-radius: 28px; isolation: isolate; transform: translateZ(0);">
      ${ambientHtml}
      ${content}
    </div>
  `;
}
window.AppCard = AppCard;
