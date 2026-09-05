// =========================================================================
// UI COMPONENT: MODAL SHELL (KHUNG POPUP CHUẨN MOBILE TAILWIND 4)
// Tự động tích hợp AppTitle cho Header ghim đỉnh (Sticky Top)
// Cuộn mượt ở giữa (Scrollable Center) + Ghim Footer dưới đáy (Sticky Bottom)
// Chiều cao tối đa: max-h-[calc(100dvh-48px)], bo góc cong luxury rounded-xl
// =========================================================================
function ModalShell({
  id = "", // ID phần tử DOM để mở/đóng (vd: 'modal-add-expense')
  title = "", // Tiêu đề modal (chữ trực tiếp hoặc lấy từ configKey)
  subtitle = "", // Phụ đề bên dưới tiêu đề
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

  // Tự động chuẩn hóa Header theo đúng ModalHeader chuẩn mực
  const headerHtml =
    typeof ModalHeader === "function"
      ? ModalHeader({
          title,
          subtitle,
          configKey,
          defaultText: defaultText || title,
          icon,
          iconColor,
          onClose: closeAction,
        })
      : "";

  return `
    <div id="${id}" onclick="if(event.target === this) ${closeAction}" class="modal-backdrop fixed inset-0 z-[9999] hidden flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-all duration-300 overflow-y-auto">
      
      <!-- KHUNG MODAL CHUẨN: Luôn nằm giữa (m-auto), Chiều cao tối đa bằng ~2/3 màn hình thiết bị -->
      <div class="w-full ${maxWidth} max-h-[67dvh] sm:max-h-[70dvh] m-auto my-auto bg-spa-card rounded-[28px] border border-spa-border shadow-2xl flex flex-col min-h-0 overflow-hidden ${customClass}" style="-webkit-mask-image: -webkit-radial-gradient(white, black); border-radius: 28px; -webkit-border-radius: 28px; isolation: isolate; max-height: 67dvh; max-height: 67vh;">
        
        <!-- 1. HEADER (PIN CHẶT TRÊN ĐỈNH VỚI MODALHEADER) -->
        ${headerHtml}

        <!-- 2. BODY (CUỘN TỰ DO Ở GIỮA, MẶC ĐỊNH CANH TRÁI) -->
        <div class="p-6 overflow-y-auto space-y-4 overscroll-contain flex-1 min-h-0 text-sm text-left text-spa-dark dark:text-white">
          ${body}
        </div>

        <!-- 3. FOOTER (PIN CHẶT DƯỚI ĐÁY VỚI APPBUTTON BO TRÒN ROUND-FULL) -->
        ${
          footer
            ? `
          <div class="px-6 py-4 border-t border-spa-border dark:border-spa-border bg-spa-bg/90 dark:bg-spa-card/90 backdrop-blur-md shrink-0 flex items-center justify-end gap-3 [&_button]:!rounded-full">
            ${footer}
          </div>
        `
            : ""
        }

      </div>
    </div>
  `;
}

/**
 * Đóng Modal với hiệu ứng FadeOut & PopOut mượt mà (190ms)
 * @param {string|HTMLElement} modalOrId 
 * @param {Function} [onClosed] 
 */
function closeModal(modalOrId, onClosed) {
  const modal = typeof modalOrId === 'string' ? document.getElementById(modalOrId) : modalOrId;
  if (!modal) return;
  modal.classList.add('is-closing');
  setTimeout(() => {
    modal.classList.remove('is-closing');
    modal.classList.add('hidden');
    if (typeof onClosed === 'function') onClosed();
  }, 190);
}

if (typeof window !== "undefined") {
  window.ModalShell = ModalShell;
  window.closeModal = closeModal;
}
if (typeof globalThis !== "undefined") {
  globalThis.ModalShell = ModalShell;
  globalThis.closeModal = closeModal;
}
