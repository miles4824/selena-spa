// =========================================================================
// VIEW COMPONENT: POS FORM VIEW (GIAO DIỆN TẠO TOUR GỘI MỚI)
// Quản lý Form chọn Combo/Dịch vụ, Kỹ thuật viên & Thông tin khách hàng
// =========================================================================

const PosFormView = {
  /**
   * Render toàn bộ Card Form tạo tour mới (id: pos-form-box)
   * @param {Object} currentUser
   * @param {boolean} isOwner
   * @returns {string} HTML string của AppCard
   */
  render(currentUser, isOwner) {
    const posFormContent = `
      <!-- 1. CHỌN DỊCH VỤ & SẢN PHẨM -->
      <div class="space-y-3.5">
        ${SectionTitle({ title: "1. Chọn Dịch Vụ & Sản Phẩm", icon: "sparkles" })}

        <!-- Hàng 1: Quick Pills -->
        <div class="space-y-2">
          <div class="text-[11px] font-extrabold text-spa-muted flex items-center gap-1.5">
            <i data-lucide="zap" class="w-3.5 h-3.5 text-spa-brand"></i>
            <span>Chọn nhanh Combo:</span>
          </div>
          <div id="pos-quick-combos" class="flex flex-wrap gap-2"></div>
        </div>

        <div class="border-t border-dashed border-spa-border my-3"></div>

        <!-- Dịch vụ đã chọn & Dropdown popover -->
        <div class="space-y-3">
          <div class="flex justify-between items-center px-0.5">
            <span class="text-xs font-black text-spa-muted uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="clipboard-list" class="w-3.5 h-3.5 text-spa-sage"></i> Dịch Vụ Đã Chọn:
            </span>
            <span id="pos-cart-count-badge" class="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-spa-sage/10 text-spa-sage border border-spa-sage/30">
              1 dịch vụ
            </span>
          </div>

          <div class="relative">
            <div id="pos-tag-container" onclick="ServiceDropdown.togglePopover(event)" class="min-h-[56px] p-3 bg-white dark:bg-spa-card border border-spa-border hover:border-spa-brand/60 rounded-2xl flex flex-col gap-2.5 cursor-pointer transition-all focus-within:border-spa-brand focus-within:ring-2 focus-within:ring-spa-brand/20 shadow-2xs">
              <div id="pos-cart-chips-list" class="flex flex-wrap gap-2.5"></div>
              
              <div id="pos-dropdown-trigger-row" class="w-full flex items-center justify-between text-xs font-bold text-spa-muted hover:text-spa-brand py-3 mt-1 px-3 rounded-xl bg-spa-bg/80 dark:bg-spa-dark/40 hover:bg-spa-brand/10 transition border border-dashed border-spa-border">
                <span id="pos-dropdown-placeholder-text" class="flex items-center gap-1.5 truncate">
                  <i data-lucide="plus-circle" class="w-3.5 h-3.5 text-spa-brand"></i>
                  <span>-- Chọn thêm dịch vụ / sản phẩm --</span>
                </span>
                <i id="pos-dropdown-chevron" data-lucide="chevron-down" class="w-4 h-4 text-spa-dark/40 transition-transform duration-200 shrink-0 ml-1"></i>
              </div>
            </div>

            <!-- Popover 7 nhóm dịch vụ -->
            <div id="pos-custom-dropdown-popover" class="hidden absolute left-0 right-0 top-full mt-2 bg-white dark:bg-spa-card border border-spa-border rounded-2xl shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
              <div class="p-2 border-b border-spa-border bg-spa-bg/90 dark:bg-spa-dark/90 sticky top-0 z-20" onclick="event.stopPropagation()">
                <div class="relative flex items-center">
                  <i data-lucide="search" class="w-3.5 h-3.5 text-spa-dark/40 absolute left-2.5 pointer-events-none"></i>
                  <input type="text" id="pos-menu-search-input" oninput="ServiceDropdown.onSearch(this.value)" placeholder="Tìm kiếm nhanh dịch vụ, combo, mỹ phẩm..." class="w-full pl-8 pr-7 py-2 text-xs bg-white dark:bg-spa-card border border-spa-border rounded-xl text-spa-dark dark:text-white placeholder:text-spa-dark/40 focus:outline-none focus:border-spa-brand focus:ring-1 focus:ring-spa-brand/30 font-medium transition" autocomplete="off" />
                  <button type="button" id="btn-clear-pos-menu-search" onclick="ServiceDropdown.clearSearch()" class="hidden absolute right-2 text-spa-dark/40 hover:text-spa-brand p-0.5 cursor-pointer">
                    <i data-lucide="x" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
              <div id="pos-custom-dropdown-items" class="border-spa-border border-t pb-2 px-2 space-y-1 max-h-64 overflow-y-auto"></div>
            </div>
          </div>

          <div class="border-t border-dashed border-spa-border my-3"></div>

          <!-- Thẻ Tổng Thanh Toán (CartTotalBar) -->
          ${typeof CartTotalBar !== "undefined" ? CartTotalBar.render([]) : ""}
        </div>
      </div>

      <!-- 2. PHÂN BỔ KỸ THUẬT VIÊN -->
      <div class="space-y-3">
        ${SectionTitle({ title: "2. Kỹ Thuật Viên Phục Vụ", icon: "users" })}
        <div id="pos-staff-list-container" class="space-y-3">
          ${typeof StaffPrimary !== "undefined" ? StaffPrimary.render(currentUser, isOwner) : ""}
          <div id="pos-extra-staff-container" class="space-y-3"></div>
        </div>
        ${AppButton({
          id: "pos-btn-add-extra-staff",
          text: "Thêm Kỹ Thuật Viên Cùng Làm",
          icon: "user-plus",
          iconPosition: "left",
          variant: "dashPink",
          size: "md",
          onClick: "StaffExtra.add()",
          customClass: "w-full font-bold text-xs sm:text-sm",
        })}
      </div>

      <!-- 3. THÔNG TIN KHÁCH HÀNG & TÍCH ĐIỂM -->
      <div class="space-y-3">
        ${SectionTitle({ title: "3. Thông Tin Khách Hàng", icon: "user" })}
        <div class="space-y-3 bg-spa-bg dark:bg-spa-card/50 p-3.5 rounded-3xl border border-spa-border">
          <!-- Ô SĐT -->
          <div class="relative">
            <label class="block text-xs font-bold text-spa-dark dark:text-white mb-1 flex items-center gap-1.5">
              <i data-lucide="phone" class="w-3.5 h-3.5 text-spa-brand"></i> Số Điện Thoại:
            </label>
            <input type="tel" id="pos-customer-phone" oninput="CustomerPhone.onInput(this.value)" onblur="CustomerPhone.onBlur(this.value)" autocomplete="off" placeholder="Số điện thoại" class="w-full bg-white dark:bg-spa-card border border-spa-border rounded-2xl p-3 text-spa-dark dark:text-white text-xs sm:text-sm font-bold focus:outline-none focus:border-spa-brand transition">
            <div id="pos-customer-suggestions" class="hidden absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-spa-card border border-spa-border rounded-2xl shadow-2xl z-[999] max-h-60 overflow-y-auto divide-y divide-spa-bg"></div>
          </div>

          <!-- Ô Tên & Tháng sinh -->
          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="block text-xs font-bold text-spa-dark dark:text-white mb-1 flex items-center gap-1.5">
                <i data-lucide="user" class="w-3.5 h-3.5 text-spa-brand"></i> Tên Khách Hàng:
              </label>
              <input type="text" id="pos-customer-name" placeholder="Tên khách hàng" class="w-full bg-white dark:bg-spa-card border border-spa-border rounded-2xl p-3 text-spa-dark dark:text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-spa-brand transition">
            </div>
            <div>
              <label class="block text-xs font-bold text-spa-dark dark:text-white mb-1 flex items-center gap-1.5">
                <i data-lucide="cake" class="w-3.5 h-3.5 text-spa-brand"></i> Sinh Nhật:
              </label>
              <select id="pos-birth-month" onchange="this.style.color = this.value ? 'var(--color-spa-dark, #2D2424)' : '#A39696'" style="color: #A39696;" class="w-full bg-white dark:bg-spa-card border border-spa-border rounded-2xl p-3 text-xs sm:text-sm font-bold focus:outline-none focus:border-spa-brand transition cursor-pointer">
                <option value="">-- Tháng --</option>
                ${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}">Tháng ${i + 1}</option>`).join("")}
              </select>
            </div>
          </div>
        </div>

        <!-- Thẻ tích điểm chu kỳ 10 lần (Customer Loyalty Card) -->
        <div id="pos-customer-card" class="hidden p-4 sm:p-5 rounded-3xl bg-spa-brand/10 border border-spa-brand/30 space-y-3">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-spa-sage animate-ping"></span>
              <span id="pos-cust-name-badge" class="text-sm font-bold text-spa-dark dark:text-white">Khách quen</span>
            </div>
            <span id="pos-cust-visits-badge" class="text-xs sm:text-sm font-extrabold text-spa-brand">0 / 10 Lần gội</span>
          </div>
          <div class="space-y-1">
            <div class="w-full h-2.5 bg-white dark:bg-spa-card rounded-full overflow-hidden">
              <div id="pos-cust-progress-bar" class="h-full bg-gradient-to-r from-spa-brand to-spa-mist rounded-full transition-all duration-500" style="width: 0%"></div>
            </div>
            <div class="flex justify-between text-[11px] text-spa-muted">
              <span id="pos-cust-cycle-status-text">Chu kỳ tích 10 lần</span>
              <span id="pos-cust-cycle-expiry-text" class="text-spa-brand font-semibold">Chu kỳ 60 ngày</span>
            </div>
          </div>
          <div id="pos-birthday-banner" class="hidden flex items-center justify-between p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <div class="flex items-center gap-2">
              <i data-lucide="cake" class="w-4 h-4 text-amber-600"></i>
              <span>🎂 Sinh nhật tháng này! Ưu đãi giảm 20%</span>
            </div>
            <button type="button" onclick="LoyaltyCard.applyBirthdayDiscount()" class="px-2.5 py-1 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition cursor-pointer">Áp dụng</button>
          </div>
          <div id="pos-cust-notes-box" class="hidden text-xs text-amber-800 bg-white/80 dark:bg-spa-card rounded-2xl p-3 border border-amber-200">
            <span class="font-bold">📝 Lưu ý:</span> <span id="pos-cust-notes-text"></span>
          </div>
          <div id="pos-voucher-banner" class="hidden flex items-center justify-between p-3 rounded-2xl bg-spa-sage/10 border border-spa-sage/30">
            <div class="flex items-center gap-2.5 text-xs sm:text-sm text-spa-sage font-bold">
              <i data-lucide="gift" class="w-5 h-5 text-spa-sage"></i>
              <span id="pos-voucher-text">Khách có Voucher lần miễn phí!</span>
            </div>
            <input type="checkbox" id="pos-use-voucher" onchange="LoyaltyCard.toggleVoucher(this.checked)" class="w-5 h-5 accent-spa-sage rounded cursor-pointer">
          </div>
        </div>
      </div>

      <!-- NÚT BẮT ĐẦU TOUR GỘI (AppButton) -->
      <div class="pt-2">
        ${AppButton({
          text: "Bắt Đầu Tour Gội",
          icon: "play-circle",
          variant: "primary",
          size: "lg",
          onClick: "PosScreen.startLiveTour()",
          customClass:
            "w-full !rounded-full shadow-lg shadow-spa-brand/25 text-base sm:text-lg",
        })}
      </div>
    `;

    return AppCard({
      id: "pos-form-box",
      variant: "surface",
      padding: "p-5 sm:p-7",
      customClass: "space-y-6",
      content: posFormContent,
    });
  },
};

window.PosFormView = PosFormView;
