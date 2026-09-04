// =========================================================================
// UI COMPONENT: MODAL SHELL (KHUNG POPUP CHUẨN MOBILE TAILWIND 4)
// Ghim chặt Header (Sticky Top) + Cuộn mượt ở giữa + Ghim Footer (Sticky Bottom)
// Chiều cao tối đa: max-h-[calc(100dvh-48px)], bo góc cong luxury rounded-[28px]
// =========================================================================
function ModalShell({
  id = '',                // ID phần tử DOM để mở/đóng (vd: 'modal-add-expense')
  title = '',             // Tiêu đề modal (vd: 'Nhập Chi Phí Tiệm')
  icon = '',              // Tên icon Lucide
  iconColor = 'text-[#E58A7B]',
  body = '',              // Nội dung ruột cuộn ở giữa
  footer = '',            // Nút bấm ghim chặt ở đáy (vd: Nút Lưu / Hủy)
  maxWidth = 'max-w-md',  // Chiều rộng tối đa (max-w-sm, max-w-md, max-w-lg)
  onClose = '',           // Lệnh JS khi bấm đóng (mặc định closeModal(id))
  customClass = ''
} = {}) {
  const closeAction = onClose || `closeModal('${id}')`;
  const iconHtml = icon ? `<i data-lucide="${icon}" class="w-5 h-5 ${iconColor}"></i>` : '';

  return `
    <div id="${id}" class="fixed inset-0 z-[9999] hidden flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-all duration-300">
      
      <!-- KHUNG MODAL CHUẨN: Chiều cao tối đa trừ padding, flex-col để ghim top/bottom -->
      <div class="w-full ${maxWidth} max-h-[calc(100dvh-48px)] bg-white rounded-[28px] border border-[#F0EAE1] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${customClass}">
        
        <!-- 1. HEADER (PIN CHẶT TRÊN ĐỈNH) -->
        <div class="flex items-center justify-between px-6 py-4.5 border-b border-[#F0EAE1] bg-[#FAF6F1]/90 backdrop-blur-md shrink-0 select-none">
          <div class="flex items-center gap-2.5">
            ${iconHtml}
            <h3 class="text-base sm:text-lg font-bold text-[#2D2424] font-serif tracking-tight">${title}</h3>
          </div>
          <button type="button" onclick="${closeAction}" class="w-8 h-8 rounded-full bg-white hover:bg-[#FFF0EB] text-[#7E7272] hover:text-[#E58A7B] border border-[#EFE8DF] flex items-center justify-center transition cursor-pointer active:scale-90 shadow-2xs" title="Đóng">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- 2. BODY (CUỘN TỰ DO Ở GIỮA) -->
        <div class="p-6 overflow-y-auto space-y-4 overscroll-contain flex-1 text-sm text-[#2D2424]">
          ${body}
        </div>

        <!-- 3. FOOTER (PIN CHẶT DƯỚI ĐÁY NẾU CÓ NÚT HÀNH ĐỘNG) -->
        ${footer ? `
          <div class="px-6 py-4 border-t border-[#F0EAE1] bg-[#FAF6F1]/90 backdrop-blur-md shrink-0 flex items-center justify-end gap-3">
            ${footer}
          </div>
        ` : ''}

      </div>
    </div>
  `;
}
window.ModalShell = ModalShell;
