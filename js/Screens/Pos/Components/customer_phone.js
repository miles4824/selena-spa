// =========================================================================
// COMPONENT: CUSTOMER PHONE (Ô NHẬP SĐT & DROPDOWN GỢI Ý KHÁCH QUEN)
// =========================================================================

const CustomerPhone = {
  debounceTimer: null,

  /**
   * Xử lý khi người dùng nhập số điện thoại hoặc tên khách
   */
  onInput(val) {
    const rawVal = String(val || '').trim();
    const digits = rawVal.replace(/[^0-9]/g, '');
    const suggestionsBox = document.getElementById('pos-customer-suggestions');
    if (!suggestionsBox) return;

    const customers = typeof getAllAvailableCustomers === 'function'
      ? getAllAvailableCustomers()
      : ((typeof getStored === 'function') ? getStored('customers', []) : []);

    const isOwner = (typeof isUserOwner === 'function' && typeof currentUser !== 'undefined')
      ? isUserOwner(currentUser)
      : false;

    // 1. Tìm gợi ý khách quen nếu đã gõ từ 1 chữ số hoặc từ 2 chữ cái tên
    if (digits.length >= 1 || (rawVal.length >= 2 && /[a-zA-ZÀ-ỹ]/.test(rawVal))) {
      const queryLower = rawVal.toLowerCase();
      const matched = customers.filter(c => {
        const p = String(c.phone_number || c.raw_phone || c.phone || '').replace(/[^0-9]/g, '');
        const name = String(c.customer_name || c.name || '').toLowerCase();
        const pMatch = digits.length >= 1 && (p.includes(digits) || (digits.startsWith('0') ? p.includes(digits) : ('0' + p).includes('0' + digits)));
        const nMatch = rawVal.length >= 2 && name.includes(queryLower);
        return pMatch || nMatch;
      }).slice(0, 8);

      if (matched.length > 0) {
        this.renderSuggestions(matched, rawVal, isOwner);
        suggestionsBox.classList.remove('hidden');
      } else {
        suggestionsBox.classList.add('hidden');
      }

      // 2. Tự động nhận diện nếu đã nhập đủ số điện thoại chính xác (từ 9-10 số)
      if (digits.length >= 9) {
        const exactCust = customers.find(c => {
          const p = String(c.phone_number || c.raw_phone || c.phone || '').replace(/[^0-9]/g, '');
          return p === digits || (p.endsWith(digits) && digits.length >= 9);
        });

        if (exactCust) {
          this.selectCustomer(exactCust);
          return;
        } else {
          if (!window.PosState) window.PosState = {};
          window.PosState.customerPhone = digits;
        }
      }
    } else {
      suggestionsBox.classList.add('hidden');
      if (rawVal.length === 0) {
        this.resetCustomer();
      }
    }
  },

  /**
   * Khi rời khỏi ô nhập SĐT (onBlur): Che số bảo mật nếu là vai trò KTV (Staff)
   */
  onBlur(val) {
    const rawVal = String(val || '').trim();
    const isOwner = (typeof isUserOwner === 'function' && typeof currentUser !== 'undefined')
      ? isUserOwner(currentUser)
      : false;

    // Ẩn popover sau khi blur (delay nhẹ để kịp click)
    setTimeout(() => {
      const suggestionsBox = document.getElementById('pos-customer-suggestions');
      if (suggestionsBox) suggestionsBox.classList.add('hidden');
    }, 250);

    if (isOwner) return; // Chủ tiệm thấy toàn bộ số

    const phoneInput = document.getElementById('pos-customer-phone');
    if (!phoneInput) return;

    let targetPhone = (window.PosState && window.PosState.customerPhone) || rawVal.replace(/[^0-9]/g, '');
    if (targetPhone && targetPhone.length >= 8 && !phoneInput.value.includes('*')) {
      if (!window.PosState) window.PosState = {};
      window.PosState.customerPhone = targetPhone;
      if (typeof PhoneService !== 'undefined' && PhoneService.mask) {
        phoneInput.value = PhoneService.mask(targetPhone, false);
      }
    }
  },

  /**
   * Render danh sách gợi ý khách quen vào popover
   */
  renderSuggestions(customers, query, isOwner) {
    const suggestionsBox = document.getElementById('pos-customer-suggestions');
    if (!suggestionsBox) return;

    suggestionsBox.innerHTML = customers.map(cust => {
      const rawP = String(cust.phone_number || cust.raw_phone || cust.phone || '');
      const displayPhone = (typeof PhoneService !== 'undefined' && PhoneService.mask)
        ? PhoneService.mask(rawP, isOwner)
        : (isOwner ? rawP : rawP.slice(0, 3) + '*' + rawP.slice(-3));

      const custName = cust.customer_name || cust.name || 'Khách quen';
      const visits = Number(cust.total_visits || cust.visits_count || 0);

      return `
        <div onclick="CustomerPhone.selectById('${cust.customer_id || cust.id || rawP}')" 
          class="p-3 hover:bg-spa-brand/10 transition cursor-pointer flex items-center justify-between group border-b border-spa-border/40 last:border-0">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-7 h-7 rounded-full bg-spa-brand/15 text-spa-brand flex items-center justify-center text-xs font-bold shrink-0">
              <i data-lucide="user" class="w-3.5 h-3.5"></i>
            </div>
            <div class="truncate">
              <div class="text-xs font-black text-spa-dark group-hover:text-spa-brand truncate">
                ${custName}
              </div>
              <div class="text-[11px] font-mono text-spa-dark/60">
                ${displayPhone}
              </div>
            </div>
          </div>
          <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-spa-bg text-spa-brand border border-spa-border shrink-0">
            ${visits} lần
          </span>
        </div>
      `;
    }).join('');

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  },

  selectById(custIdOrPhone) {
    const customers = typeof getAllAvailableCustomers === 'function'
      ? getAllAvailableCustomers()
      : ((typeof getStored === 'function') ? getStored('customers', []) : []);

    const cust = customers.find(c =>
      (c.customer_id && c.customer_id === custIdOrPhone) ||
      (c.id && c.id === custIdOrPhone) ||
      String(c.phone_number || c.raw_phone || c.phone || '').replace(/[^0-9]/g, '') === String(custIdOrPhone).replace(/[^0-9]/g, '')
    );
    if (cust) this.selectCustomer(cust);
  },

  /**
   * Chọn khách hàng và áp dụng dữ liệu vào form
   */
  selectCustomer(cust) {
    const suggestionsBox = document.getElementById('pos-customer-suggestions');
    if (suggestionsBox) suggestionsBox.classList.add('hidden');

    const isOwner = (typeof isUserOwner === 'function' && typeof currentUser !== 'undefined')
      ? isUserOwner(currentUser)
      : false;

    const phoneInput = document.getElementById('pos-customer-phone');
    const rawP = String(cust.phone_number || cust.raw_phone || cust.phone || '');

    if (!window.PosState) window.PosState = {};
    window.PosState.currentCustomer = cust;
    window.PosState.customerPhone = rawP;

    if (phoneInput) {
      phoneInput.value = (typeof PhoneService !== 'undefined' && PhoneService.mask)
        ? PhoneService.mask(rawP, isOwner)
        : (isOwner ? rawP : rawP.slice(0, 3) + '*' + rawP.slice(-3));
    }

    // Cập nhật các ô Tên, Tháng sinh và Thẻ tích điểm
    if (typeof CustomerFields !== 'undefined') {
      CustomerFields.applyCustomer(cust, isOwner);
    }
    if (typeof LoyaltyCard !== 'undefined') {
      LoyaltyCard.show(cust);
    }
  },

  /**
   * Reset trạng thái khách hàng về khách mới / khách vãng lai
   */
  resetCustomer() {
    if (!window.PosState) window.PosState = {};
    window.PosState.currentCustomer = null;
    window.PosState.customerPhone = '';
    window.PosState.useVoucher = false;

    if (typeof CustomerFields !== 'undefined') {
      CustomerFields.reset();
    }
    if (typeof LoyaltyCard !== 'undefined') {
      LoyaltyCard.hide();
    }
  }
};

window.CustomerPhone = CustomerPhone;
