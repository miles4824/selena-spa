// =========================================================================
// COMPONENT: SERVICE PICKER (GIAO DIỆN CHỌN DỊCH VỤ DÙNG CHUNG)
// Gom trọn bộ: Hàng nút Chọn Nhanh Combo 1-5 + Tag Dịch Vụ Đã Chọn + Popover Menu 7 Nhóm
// Dùng chung 100% giữa Tạo Tour Ngoài POS và Modal Đổi Dịch Vụ
// =========================================================================

const ServicePicker = {
  /**
   * Render toàn bộ cụm giao diện chọn dịch vụ
   * @param {Object} options
   * @param {string} [options.prefix='pos'] - Tiền tố ID ('pos' | 'modal-edit')
   * @param {string} [options.context='pos'] - Ngữ cảnh ('pos' | 'modal-edit')
   * @param {string} [options.title='Dịch Vụ Đã Chọn:'] - Tiêu đề vùng chọn
   * @param {string} [options.placeholderText='-- Chọn thêm dịch vụ / sản phẩm --'] - Gợi ý nút mở menu
   * @returns {string} HTML string
   */
  render({
    prefix = "pos",
    context = "pos",
    title = "Dịch Vụ Đã Chọn:",
    placeholderText = "-- Chọn thêm dịch vụ / sản phẩm --",
  } = {}) {
    return `
      <!-- HÀNG 1: CHỌN NHANH COMBO DUY -->
      <div class="space-y-2 text-left" style="text-align: left !important;">
        <div class="text-[11px] font-extrabold text-spa-muted flex items-center gap-1.5 text-left">
          <i data-lucide="zap" class="w-3.5 h-3.5 text-spa-brand"></i>
          <span>Chọn nhanh Combo:</span>
        </div>
        <div id="${prefix}-quick-combos" class="flex flex-wrap gap-2 text-left justify-start"></div>
      </div>

      <div class="border-t border-dashed border-spa-border my-3"></div>

      <!-- HÀNG 2: DỊCH VỤ ĐÃ CHỌN & DROPDOWN POPOVER -->
      <div class="space-y-3 text-left" style="text-align: left !important;">
        <div class="flex justify-between items-center px-0.5">
          <span class="text-xs font-black text-spa-muted uppercase tracking-wider flex items-center gap-1.5 text-left">
            <i data-lucide="clipboard-list" class="w-3.5 h-3.5 text-spa-sage"></i> ${title}
          </span>
          <span id="${prefix}-cart-count-badge" class="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-spa-sage/10 text-spa-sage border border-spa-sage/30">
            0 dịch vụ
          </span>
        </div>

        <div class="relative text-left">
          <div id="${prefix}-tag-container" onclick="ServiceDropdown.togglePopover(event, '${prefix}', '${context}')" class="min-h-[56px] p-3 bg-white dark:bg-spa-card border border-spa-border hover:border-spa-brand/60 rounded-2xl flex flex-col gap-2.5 cursor-pointer transition-all focus-within:border-spa-brand focus-within:ring-2 focus-within:ring-spa-brand/20 shadow-2xs text-left items-start">
            <div id="${prefix}-cart-chips-list" class="flex flex-wrap gap-2.5 text-left justify-start w-full"></div>
            
            <div id="${prefix}-dropdown-trigger-row" class="w-full flex items-center justify-between text-xs font-bold text-spa-muted hover:text-spa-brand py-3 mt-1 px-3 rounded-xl bg-spa-bg/80 dark:bg-spa-dark/40 hover:bg-spa-brand/10 transition border border-dashed border-spa-border text-left">
              <span id="${prefix}-dropdown-placeholder-text" class="flex items-center gap-1.5 truncate text-left">
                <i data-lucide="plus-circle" class="w-3.5 h-3.5 text-spa-brand"></i>
                <span class="truncate">${placeholderText}</span>
              </span>
              <i id="${prefix}-dropdown-chevron" data-lucide="chevron-down" class="w-4 h-4 text-spa-dark/40 transition-transform duration-200 shrink-0 ml-1"></i>
            </div>
          </div>

          <!-- POPOVER 7 NHÓM DỊCH VỤ -->
          <div id="${prefix}-custom-dropdown-popover" class="hidden absolute left-0 right-0 top-full mt-2 bg-white dark:bg-spa-card border border-spa-border rounded-2xl shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 text-left">
            <div class="p-2.5 border-b border-spa-border bg-spa-bg/95 dark:bg-spa-dark/95 sticky top-0 z-20" onclick="event.stopPropagation()">
              <div class="relative flex items-center">
                <i data-lucide="search" class="w-3.5 h-3.5 text-spa-dark/40 absolute left-2.5 pointer-events-none"></i>
                <input type="text" id="${prefix}-menu-search-input" oninput="ServiceDropdown.onSearch(this.value, '${prefix}', '${context}')" placeholder="Tìm nhanh dịch vụ, combo, mỹ phẩm..." class="w-full pl-8 pr-7 py-2 text-xs bg-white dark:bg-spa-card border border-spa-border rounded-xl text-spa-dark dark:text-white placeholder:text-spa-dark/40 focus:outline-none focus:border-spa-brand focus:ring-1 focus:ring-spa-brand/30 font-medium transition" autocomplete="off" />
                <button type="button" id="btn-clear-${prefix}-menu-search" onclick="ServiceDropdown.clearSearch('${prefix}', '${context}')" class="hidden absolute right-2 text-spa-dark/40 hover:text-spa-brand p-0.5 cursor-pointer">
                  <i data-lucide="x" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>
            <div id="${prefix}-custom-dropdown-items" class="border-spa-border border-t pb-2 space-y-1 max-h-64 overflow-y-auto text-left"></div>
          </div>
        </div>
      </div>
    `;
  },
};

window.ServicePicker = ServicePicker;
window.ServicePickerUI = ServicePicker;
