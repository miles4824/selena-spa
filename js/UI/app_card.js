// =========================================================================
// UI COMPONENT: APP CARD (CHUYÊN QUẢN LÝ KHUÔN THẺ NỀN LUXURY - TAILWIND 4)
// =========================================================================
function AppCard({
  variant = "banner", // 'banner' (peach-cream gradient) | 'surface' (white) | 'peach' | 'mint'
  content = "",
  padding = "p-6 sm:p-7",
  customClass = "",
  id = "",
} = {}) {
  const variantStyles = {
    // 1. MỚI: Mindora Luxury (Bộ 5 màu: #E8AEB7 Dusty Rose -> #FFFFFF -> #5E887E Sage Green & #A7C7E7 Sky Blue | Dark: #2F3E46 Deep Slate Pine)
    mindora:
      "app-card-mindora rounded-[28px] border relative overflow-hidden transition-all duration-300",

    // 2. MỚI: Zen Sage (Bộ 5 màu: #5E887E Sage Green dịu mát -> Trắng -> #F1F5F4 Mint White | Dark: #2F3E46 Deep Slate)
    zen: "app-card-zen rounded-[28px] border relative overflow-hidden transition-all duration-300",

    // 3. CŨ (CLASSIC): Nền cam đào nguyên bản của phiên bản cũ (Giữ nguyên vẹn 100%)
    banner:
      "app-card-banner rounded-[28px] border relative overflow-hidden transition-all duration-300",
    "banner-classic":
      "app-card-banner-classic rounded-[28px] border relative overflow-hidden transition-all duration-300",

    // 4. Surface White (Khối nội dung tiêu chuẩn thích ứng Dark Mode)
    surface:
      "app-card-surface rounded-[28px] border relative overflow-hidden transition-all duration-300",

    // 5. Peach Accent (Khối thông báo / bảng tin)
    peach:
      "app-card-peach rounded-[28px] border relative overflow-hidden transition-all duration-300",

    // 6. Mint Accent (Khối điểm nhấn thành tích ngọc bích)
    mint: "bg-[#E8F8F5]/60 dark:bg-[#5E887E]/15 rounded-[28px] border border-[#B7EBDD] dark:border-[#5E887E]/30 relative overflow-hidden transition-all duration-300",
  };

  const chosenStyle = variantStyles[variant] || variantStyles.banner;
  const idAttr = id ? `id="${id}"` : "";

  return `
    <div ${idAttr} class="${chosenStyle} ${padding} ${customClass}">
      ${content}
    </div>
  `;
}
window.AppCard = AppCard;
