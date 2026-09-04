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
    // 1. MỚI: Mindora Luxury (Bộ 5 màu: #E8AEB7 Dusty Rose -> #FFFFFF -> #5E887E Sage Green & #A7C7E7 Sky Blue | Dark: #2F3E46 Deep Slate Pine)
    mindora: 'bg-white dark:bg-[#2F3E46] rounded-[28px] border border-[#E8AEB7]/40 dark:border-[#5E887E]/30 shadow-[0_12px_32px_-6px_rgba(232,174,183,0.20),0_4px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_12px_32px_-6px_rgba(0,0,0,0.5)] relative overflow-hidden bg-gradient-to-br from-[#FBF0F2] via-[#FFFFFF] to-[#EBF2F0] dark:from-[#2F3E46] dark:via-[#263339] dark:to-[#1C2428]',

    // 2. MỚI: Zen Sage (Bộ 5 màu: #5E887E Sage Green dịu mát -> Trắng -> #F1F5F4 Mint White | Dark: #2F3E46 Deep Slate)
    zen: 'bg-white dark:bg-[#2F3E46] rounded-[28px] border border-[#5E887E]/30 dark:border-[#5E887E]/30 shadow-[0_12px_32px_-6px_rgba(94,136,126,0.15),0_4px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_12px_32px_-6px_rgba(0,0,0,0.5)] relative overflow-hidden bg-gradient-to-br from-[#EBF2F0] via-[#FFFFFF] to-[#F1F5F4] dark:from-[#26343A] dark:via-[#222E33] dark:to-[#1C2428]',

    // 3. CŨ (CLASSIC): Nền cam đào nguyên bản của phiên bản cũ (Giữ nguyên vẹn 100%)
    banner: 'bg-white dark:bg-[#2F3E46] rounded-[28px] border border-[#F0EAE1] dark:border-spa-border shadow-[0_10px_30px_-5px_rgba(229,138,123,0.05),0_4px_12px_rgba(0,0,0,0.02)] relative overflow-hidden bg-gradient-to-br from-[#FFF0EB] via-[#FFFFFF] to-[#FAF6F1] dark:from-[#2F3E46] dark:via-[#263339] dark:to-[#1C2428]',
    'banner-classic': 'bg-white dark:bg-[#2F3E46] rounded-[28px] border border-[#F0EAE1] dark:border-spa-border shadow-[0_10px_30px_-5px_rgba(229,138,123,0.05),0_4px_12px_rgba(0,0,0,0.02)] relative overflow-hidden bg-gradient-to-br from-[#FFF0EB] via-[#FFFFFF] to-[#FAF6F1] dark:from-[#2F3E46] dark:via-[#263339] dark:to-[#1C2428]',

    // 4. Surface White (Khối nội dung tiêu chuẩn thích ứng Dark Mode)
    surface: 'bg-white dark:bg-[#2F3E46] rounded-[28px] border border-spa-border dark:border-[#3D4E56] shadow-[0_10px_30px_-5px_rgba(229,138,123,0.05),0_4px_12px_rgba(0,0,0,0.02)] dark:shadow-none relative overflow-hidden',

    // 5. Peach Accent (Khối thông báo / bảng tin)
    peach: 'bg-white dark:bg-[#2F3E46] rounded-[28px] border border-[#E8AEB7]/40 dark:border-[#E8AEB7]/25 shadow-[0_10px_30px_-5px_rgba(229,138,123,0.05),0_4px_12px_rgba(0,0,0,0.02)] relative overflow-hidden bg-gradient-to-br from-[#FBF0F2] via-[#FFFFFF] to-[#FAF6F1] dark:from-[#35272B] dark:via-[#2F3E46] dark:to-[#222D33]',

    // 6. Mint Accent (Khối điểm nhấn thành tích ngọc bích)
    mint: 'bg-[#E8F8F5]/60 dark:bg-[#5E887E]/15 rounded-[28px] border border-[#B7EBDD] dark:border-[#5E887E]/30 shadow-xs relative overflow-hidden'
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