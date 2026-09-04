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
    // 1. MỚI: Mindora Luxury (Bộ màu mới: Hồng phấn hoa hồng -> Trắng tinh khiết -> Xanh xô thơm thảo mộc)
    mindora: 'bg-white dark:bg-spa-card rounded-[28px] border border-spa-peach-border/80 dark:border-spa-border shadow-[0_12px_32px_-6px_rgba(232,174,183,0.20),0_4px_12px_rgba(0,0,0,0.03)] relative overflow-hidden bg-gradient-to-br from-[#FBF0F2] via-[#FFFFFF] to-[#EBF2F0] dark:from-[#28343B] dark:via-[#222C32] dark:to-[#1C2428]',

    // 2. MỚI: Zen Sage (Bộ màu mới: Xanh xô thơm dịu mát -> Trắng -> Nền ngọc bích an yên)
    zen: 'bg-white dark:bg-spa-card rounded-[28px] border border-spa-teal-border/60 dark:border-spa-border shadow-[0_12px_32px_-6px_rgba(94,136,126,0.15),0_4px_12px_rgba(0,0,0,0.03)] relative overflow-hidden bg-gradient-to-br from-[#EBF2F0] via-[#FFFFFF] to-[#F1F5F4] dark:from-[#243036] dark:via-[#20292E] dark:to-[#1C2428]',

    // 3. CŨ (CLASSIC): Nền cam đào nguyên bản của bản cũ (Giữ nguyên vẹn 100%)
    banner: 'bg-white dark:bg-spa-card rounded-[28px] border border-[#F0EAE1] dark:border-spa-border shadow-[0_10px_30px_-5px_rgba(229,138,123,0.05),0_4px_12px_rgba(0,0,0,0.02)] relative overflow-hidden bg-gradient-to-br from-[#FFF0EB] via-[#FFFFFF] to-[#FAF6F1] dark:from-spa-card dark:via-spa-card dark:to-spa-bg/50',
    'banner-classic': 'bg-white dark:bg-spa-card rounded-[28px] border border-[#F0EAE1] dark:border-spa-border shadow-[0_10px_30px_-5px_rgba(229,138,123,0.05),0_4px_12px_rgba(0,0,0,0.02)] relative overflow-hidden bg-gradient-to-br from-[#FFF0EB] via-[#FFFFFF] to-[#FAF6F1] dark:from-spa-card dark:via-spa-card dark:to-spa-bg/50',

    // 4. Surface White (Khối nội dung tiêu chuẩn)
    surface: 'bg-white dark:bg-spa-card rounded-[28px] border border-spa-border shadow-[0_10px_30px_-5px_rgba(229,138,123,0.05),0_4px_12px_rgba(0,0,0,0.02)] relative overflow-hidden',

    // 5. Peach Accent (Khối thông báo / bảng tin)
    peach: 'bg-white dark:bg-spa-card rounded-[28px] border border-spa-peach-border shadow-[0_10px_30px_-5px_rgba(229,138,123,0.05),0_4px_12px_rgba(0,0,0,0.02)] relative overflow-hidden bg-gradient-to-br from-[#FFF0EB]/80 via-[#FFFFFF] to-[#FAF6F1] dark:from-spa-card dark:via-spa-card dark:to-spa-bg/50',

    // 6. Mint Accent (Khối điểm nhấn thành tích ngọc bích)
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