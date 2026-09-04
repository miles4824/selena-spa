// =========================================================================
// UI COMPONENT: APP CARD (CHUYÊN QUẢN LÝ KHUÔN THẺ NỀN LUXURY - TAILWIND 4)
// =========================================================================
function AppCard({
  variant = 'banner', // 'banner' (peach-cream gradient) | 'surface' (white) | 'peach' | 'mint'
  content = '',
  padding = 'p-6 sm:p-7',
  customClass = '',
  id = ''
} = {}) {
  const variantStyles = {
    // Banner Luxury (Chuẩn Hero Greeting KTV / Chủ tiệm: chuyển sắc kem đào sang trọng)
    banner: 'bg-white dark:bg-spa-card rounded-[28px] border border-spa-border shadow-[0_10px_30px_-5px_rgba(229,138,123,0.05),0_4px_12px_rgba(0,0,0,0.02)] relative overflow-hidden bg-gradient-to-br from-[#FFF0EB] via-[#FFFFFF] to-[#FAF6F1] dark:from-spa-card dark:via-spa-card dark:to-spa-bg/50',
    // Surface White (Khối nội dung tiêu chuẩn)
    surface: 'bg-white dark:bg-spa-card rounded-[28px] border border-spa-border shadow-[0_10px_30px_-5px_rgba(229,138,123,0.05),0_4px_12px_rgba(0,0,0,0.02)] relative overflow-hidden',
    // Peach Accent (Khối thông báo / bảng tin)
    peach: 'bg-white dark:bg-spa-card rounded-[28px] border border-spa-peach-border shadow-[0_10px_30px_-5px_rgba(229,138,123,0.05),0_4px_12px_rgba(0,0,0,0.02)] relative overflow-hidden bg-gradient-to-br from-[#FFF0EB]/80 via-[#FFFFFF] to-[#FAF6F1] dark:from-spa-card dark:via-spa-card dark:to-spa-bg/50',
    // Mint Accent (Khối điểm nhấn thành tích ngọc bích)
    mint: 'bg-[#E8F8F5]/60 dark:bg-spa-sage/10 rounded-[28px] border border-[#B7EBDD] dark:border-spa-sage/30 shadow-xs relative overflow-hidden'
  };

  const chosenStyle = variantStyles[variant] || variantStyles.banner;
  const idAttr = id ? `id="${id}"` : '';

  return `
    <div ${idAttr} class="${chosenStyle} ${padding} ${customClass}">
      ${content}
    </div>
  `;
}
window.AppCard = AppCard;