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
    // Banner Luxury (Chuẩn Hero Greeting KTV / Chủ tiệm)
    banner: 'bg-white rounded-[28px] border border-[#F0EAE1] shadow-[0_10px_30px_-5px_rgba(229,138,123,0.05),0_4px_12px_rgba(0,0,0,0.02)] relative overflow-hidden bg-gradient-to-br from-[#FFF0EB] via-[#FFFFFF] to-[#FAF6F1]',
    // Surface White (Khối nội dung tiêu chuẩn)
    surface: 'bg-white rounded-[28px] border border-[#F0EAE1] shadow-[0_10px_30px_-5px_rgba(229,138,123,0.05),0_4px_12px_rgba(0,0,0,0.02)] relative overflow-hidden',
    // Peach Accent (Khối thông báo / bảng tin)
    peach: 'bg-white rounded-[28px] border border-[#FCDFD7] shadow-[0_10px_30px_-5px_rgba(229,138,123,0.05),0_4px_12px_rgba(0,0,0,0.02)] relative overflow-hidden bg-gradient-to-br from-[#FFF0EB]/80 via-[#FFFFFF] to-[#FAF6F1]',
    // Mint Accent (Khối điểm nhấn thành tích ngọc bích)
    mint: 'bg-[#E8F8F5]/60 rounded-[28px] border border-[#B7EBDD] shadow-xs relative overflow-hidden'
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