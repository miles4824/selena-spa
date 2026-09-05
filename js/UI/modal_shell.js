// =========================================================================
// UI COMPONENT: MODAL SHELL (KHUNG POPUP CHUẨN MOBILE TAILWIND 4)
// Tự động tích hợp AppTitle cho Header ghim đỉnh (Sticky Top)
// Cuộn mượt ở giữa (Scrollable Center) + Ghim Footer dưới đáy (Sticky Bottom)
// Chiều cao tối đa: max-h-[calc(100dvh-48px)], bo góc cong luxury rounded-xl
// =========================================================================
function ModalShell({
  id = "", // ID phần tử DOM để mở/đóng (vd: 'modal-add-expense')
  title = "", // Tiêu đề modal (chữ trực tiếp hoặc lấy từ configKey)
  configKey = "", // Key cấu hình từ Google Sheets tb_config
  defaultText = "", // Chữ dự phòng nếu chưa có trên Sheet
  icon = "", // Tên icon Lucide
  iconColor = "text-spa-brand",
  body = "", // Nội dung ruột cuộn ở giữa
  footer = "", // Nút bấm ghim chặt ở đáy (AppButton)
  maxWidth = "max-w-md", // Chiều rộng tối đa (max-w-sm, max-w-md, max-w-lg)
  onClose = "", // Lệnh JS khi bấm đóng (mặc định closeModal(id))
  customClass = "",
} = {}) {
  const closeAction = onClose || `closeModal('${id}')`;

  // Tự động chuẩn hóa Title theo đúng AppTitle level 'modal'
  const titleHtml =
    typeof AppTitle === "function"
      ? AppTitle({
          text: title,
          configKey,
          defaultText: defaultText || title,
          icon,
          iconColor,
          level: "modal",
        })
      : `<div class="flex items-center gap-2">${icon ? `<i data-lucide="${icon}" class="w-5 h-5 ${iconColor}"></i>` : ""}<h3 class="text-base sm:text-lg font-bold text-spa-dark dark:text-white font-serif tracking-tight">${title}</h3></div>`;

  return `
    <div id="${id}" class="fixed inset-0 z-[9999] hidden flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-all duration-300">
      
      <!-- KHUNG MODAL CHUẨN: Chiều cao tối đa trừ padding, flex-col để ghim top/bottom -->
      <div class="w-full ${maxWidth} max-h-[calc(100dvh-48px)] bg-white dark:bg-[#2F3E46] rounded-2xl border border-spa-border dark:border-[#3D4E56] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${customClass}">
        
        <!-- 1. HEADER (PIN CHẶT TRÊN ĐỈNH VỚI APPTITLE) -->
        <div class="flex items-center justify-between px-6 py-4.5 border-b border-spa-border dark:border-[#3D4E56] bg-spa-bg/90 dark:bg-[#263339]/90 backdrop-blur-md shrink-0 select-none">
          ${titleHtml}
          <button type="button" onclick="${closeAction}" class="w-8 h-8 rounded-full bg-spa-card dark:bg-white/10 hover:bg-spa-brand/15 text-spa-muted hover:text-spa-brand border border-spa-border dark:border-white/15 flex items-center justify-center transition cursor-pointer active:scale-90 shadow-2xs" title="Đóng">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- 2. BODY (CUỘN TỰ DO Ở GIỮA) -->
        <div class="p-6 overflow-y-auto space-y-4 overscroll-contain flex-1 text-sm text-spa-dark dark:text-white">
          ${body}
        </div>

        <!-- 3. FOOTER (PIN CHẶT DƯỚI ĐÁY VỚI APPBUTTON) -->
        ${
          footer
            ? `
          <div class="px-6 py-4 border-t border-spa-border dark:border-[#3D4E56] bg-spa-bg/90 dark:bg-[#263339]/90 backdrop-blur-md shrink-0 flex items-center justify-end gap-3">
            ${footer}
          </div>
        `
            : ""
        }

      </div>
    </div>
  `;
}
window.ModalShell = ModalShell;
