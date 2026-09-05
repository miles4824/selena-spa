// =========================================================================
// COMPONENT: SERVICE DROPDOWN (MENU THẢ XUỐNG 7 NHÓM DỊCH VỤ CÓ TÌM KIẾM)
// =========================================================================

const ServiceDropdown = {
  categories: [
    { prefix: 'CB', title: '💆 Combo Gội Chính', icon: 'sparkles', iconColor: 'text-spa-brand', itemIcon: '💆' },
    { prefix: 'DV_TM', title: '🌿 Dịch Vụ Làm Thêm / Da Đầu', icon: 'plus-circle', iconColor: 'text-spa-sage', itemIcon: '🌿' },
    { prefix: 'DV_MS', title: '💆 Massage Trị Liệu & Thư Giãn', icon: 'heart-pulse', iconColor: 'text-amber-600', itemIcon: '💆' },
    { prefix: 'DV_WX', title: '✨ Dịch Vụ Waxing', icon: 'scissors', iconColor: 'text-purple-600', itemIcon: '✨' },
    { prefix: 'DV_PL', title: '🩺 Nặn Mụn & Peel Trị Liệu', icon: 'shield-check', iconColor: 'text-rose-600', itemIcon: '🩺' },
    { prefix: 'DV_DT', title: '🧪 Dịch Vụ Detox', icon: 'droplets', iconColor: 'text-sky-600', itemIcon: '🧪' },
    { prefix: 'DV_CY', title: '💎 Cấy Dưỡng Chuyên Sâu', icon: 'gem', iconColor: 'text-indigo-600', itemIcon: '💎' }
  ],

  searchQuery: '',

  /**
   * Gom nhóm menu items theo 7 nhóm chuyên mục
   */
  getGroupedItems(items = []) {
    const groupsMap = new Map();
    this.categories.forEach(cat => {
      groupsMap.set(cat.prefix, { ...cat, items: [] });
    });

    const unclassifiedItems = [];

    items.forEach(item => {
      const sId = String(item.service_id || '').toUpperCase();
      let matched = false;

      // Tìm prefix khớp dài nhất trước (vd: DV_TM khớp trước DV)
      const sortedCats = [...this.categories].sort((a, b) => b.prefix.length - a.prefix.length);
      for (const cat of sortedCats) {
        if (sId.startsWith(cat.prefix.toUpperCase())) {
          groupsMap.get(cat.prefix).items.push(item);
          matched = true;
          break;
        }
      }

      if (!matched) {
        unclassifiedItems.push(item);
      }
    });

    const result = Array.from(groupsMap.values()).filter(g => g.items.length > 0);
    if (unclassifiedItems.length > 0) {
      result.push({
        prefix: 'OTHER',
        title: '✨ Dịch Vụ Khác',
        icon: 'tag',
        iconColor: 'text-spa-dark/60',
        itemIcon: '✨',
        items: unclassifiedItems
      });
    }

    return result;
  },

  normalizeText(str) {
    return String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .trim();
  },

  /**
   * Render danh sách các mục trong popover
   */
  renderItems(selectedCartItems = []) {
    const container = document.getElementById('pos-custom-dropdown-items');
    if (!container) return;

    const menu = (typeof getStored === 'function')
      ? getStored('menu', (typeof DEFAULT_MENU !== 'undefined' ? DEFAULT_MENU : []))
      : (typeof DEFAULT_MENU !== 'undefined' ? DEFAULT_MENU : []);

    const selectedIds = new Set(selectedCartItems.map(item => item.service_id));
    let available = menu.filter(m => !selectedIds.has(m.service_id));

    if (this.searchQuery) {
      const q = this.normalizeText(this.searchQuery);
      available = available.filter(m => {
        const name = this.normalizeText(m.service_name);
        const id = this.normalizeText(m.service_id);
        const cat = this.normalizeText(m.category || m.category_id);
        return name.includes(q) || id.includes(q) || cat.includes(q);
      });
    }

    if (available.length === 0) {
      container.innerHTML = `
        <div class="p-4 text-center text-xs text-spa-dark/50 italic">
          ${this.searchQuery ? 'Không tìm thấy dịch vụ phù hợp' : '-- Tất cả dịch vụ đã được chọn --'}
        </div>
      `;
      return;
    }

    const groups = this.getGroupedItems(available);
    let html = '';

    groups.forEach(group => {
      html += `
        <div class="px-3 py-2 -mx-2 sticky top-0 z-10 bg-spa-bg/95 backdrop-blur-xs border-b border-spa-border shadow-xs flex items-center gap-2 font-black text-[11px] text-spa-dark/70 uppercase tracking-wider">
          <i data-lucide="${group.icon}" class="w-3.5 h-3.5 ${group.iconColor}"></i>
          <span>${group.title}</span>
        </div>
      `;
      html += group.items.map(m => `
        <div onclick="ServiceDropdown.addItem('${m.service_id}')" 
          class="p-2.5 rounded-xl hover:bg-spa-brand/10 hover:text-spa-brand transition cursor-pointer flex justify-between items-center text-xs font-bold text-spa-dark group">
          <span class="truncate flex items-center gap-2">
            <span>${group.itemIcon}</span> <span>${m.service_name}</span>
          </span>
          <span class="font-mono text-spa-dark/60 group-hover:text-spa-brand text-[11px] shrink-0 font-extrabold">
            ${Number(m.price).toLocaleString('vi-VN')} đ • ${m.duration_min}p
          </span>
        </div>
      `).join('');
    });

    container.innerHTML = html;
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  },

  searchQueries: {},

  getSearch(prefix = 'pos') {
    return this.searchQueries[prefix] || '';
  },

  setSearch(prefix = 'pos', val = '') {
    this.searchQueries[prefix] = String(val || '');
  },

  /**
   * Render danh sách các mục trong popover
   */
  renderItems(selectedCartItems = [], prefix = 'pos', context = 'pos') {
    const container = document.getElementById(`${prefix}-custom-dropdown-items`);
    if (!container) return;

    const menu = (typeof getStored === 'function')
      ? getStored('menu', (typeof DEFAULT_MENU !== 'undefined' ? DEFAULT_MENU : []))
      : (typeof DEFAULT_MENU !== 'undefined' ? DEFAULT_MENU : []);

    const selectedIds = new Set(selectedCartItems.map(item => item.service_id));
    let available = menu.filter(m => !selectedIds.has(m.service_id));

    const qStr = this.getSearch(prefix);
    if (qStr) {
      const q = this.normalizeText(qStr);
      available = available.filter(m => {
        const name = this.normalizeText(m.service_name);
        const id = this.normalizeText(m.service_id);
        const cat = this.normalizeText(m.category || m.category_id);
        return name.includes(q) || id.includes(q) || cat.includes(q);
      });
    }

    if (available.length === 0) {
      container.innerHTML = `
        <div class="p-4 text-center text-xs text-spa-dark/50 dark:text-white/50 italic text-left">
          ${qStr ? 'Không tìm thấy dịch vụ phù hợp' : '-- Tất cả dịch vụ đã được chọn --'}
        </div>
      `;
      return;
    }

    const groups = this.getGroupedItems(available);
    let html = '';

    groups.forEach(group => {
      html += `
        <div class="px-3 py-2 -mx-2 sticky top-0 z-10 bg-spa-bg/95 dark:bg-spa-dark/95 backdrop-blur-xs border-b border-spa-border shadow-xs flex items-center gap-2 font-black text-[11px] text-spa-dark/70 dark:text-white/70 uppercase tracking-wider text-left">
          <i data-lucide="${group.icon}" class="w-3.5 h-3.5 ${group.iconColor}"></i>
          <span>${group.title}</span>
        </div>
      `;
      html += group.items.map(m => `
        <div onclick="ServiceDropdown.addItem('${m.service_id}', '${prefix}', '${context}')" 
          class="p-2.5 rounded-xl hover:bg-spa-brand/10 hover:text-spa-brand transition cursor-pointer flex justify-between items-center text-xs font-bold text-spa-dark dark:text-white group text-left">
          <span class="truncate flex items-center gap-2 text-left">
            <span>${group.itemIcon}</span> <span>${m.service_name}</span>
          </span>
          <span class="font-mono text-spa-dark/60 dark:text-white/60 group-hover:text-spa-brand text-[11px] shrink-0 font-extrabold text-right">
            ${Number(m.price).toLocaleString('vi-VN')} đ • ${m.duration_min}p
          </span>
        </div>
      `).join('');
    });

    container.innerHTML = html;
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  },

  /**
   * Bật/Tắt popover
   */
  togglePopover(e, prefix = 'pos', context = 'pos') {
    if (e && e.target && e.target.closest && e.target.closest('.pos-chip-remove-btn')) {
      return;
    }

    const popover = document.getElementById(`${prefix}-custom-dropdown-popover`);
    const chevron = document.getElementById(`${prefix}-dropdown-chevron`);
    if (!popover) return;

    const isHidden = popover.classList.contains('hidden');
    if (isHidden) {
      let cart = [];
      if (context === 'modal-edit') {
        cart = (typeof ServiceEditModal !== 'undefined' && ServiceEditModal.tempCartItems) || [];
      } else {
        cart = (window.PosState && window.PosState.selectedCartItems) || [];
      }
      this.renderItems(cart, prefix, context);
      popover.classList.remove('hidden');
      if (chevron) chevron.classList.add('rotate-180');
    } else {
      this.closePopover(prefix);
    }
  },

  closePopover(prefix = 'pos') {
    const popover = document.getElementById(`${prefix}-custom-dropdown-popover`);
    const chevron = document.getElementById(`${prefix}-dropdown-chevron`);
    if (popover) popover.classList.add('hidden');
    if (chevron) chevron.classList.remove('rotate-180');
  },

  onSearch(val, prefix = 'pos', context = 'pos') {
    this.setSearch(prefix, val);
    const clearBtn = document.getElementById(`btn-clear-${prefix}-menu-search`);
    if (clearBtn) {
      if (val) clearBtn.classList.remove('hidden');
      else clearBtn.classList.add('hidden');
    }
    let cart = [];
    if (context === 'modal-edit') {
      cart = (typeof ServiceEditModal !== 'undefined' && ServiceEditModal.tempCartItems) || [];
    } else {
      cart = (window.PosState && window.PosState.selectedCartItems) || [];
    }
    this.renderItems(cart, prefix, context);
  },

  clearSearch(prefix = 'pos', context = 'pos') {
    this.setSearch(prefix, '');
    const input = document.getElementById(`${prefix}-menu-search-input`);
    if (input) input.value = '';
    const clearBtn = document.getElementById(`btn-clear-${prefix}-menu-search`);
    if (clearBtn) clearBtn.classList.add('hidden');
    let cart = [];
    if (context === 'modal-edit') {
      cart = (typeof ServiceEditModal !== 'undefined' && ServiceEditModal.tempCartItems) || [];
    } else {
      cart = (window.PosState && window.PosState.selectedCartItems) || [];
    }
    this.renderItems(cart, prefix, context);
  },

  addItem(serviceId, prefix = 'pos', context = 'pos') {
    const menu = (typeof getStored === 'function')
      ? getStored('menu', (typeof DEFAULT_MENU !== 'undefined' ? DEFAULT_MENU : []))
      : (typeof DEFAULT_MENU !== 'undefined' ? DEFAULT_MENU : []);
    const item = menu.find(m => m.service_id === serviceId);
    if (!item) return;

    if (context === 'modal-edit') {
      if (typeof ServiceEditModal !== 'undefined') {
        let cart = ServiceEditModal.tempCartItems || [];
        const isCombo = String(item.service_id || '').startsWith('CB') ||
                        String(item.service_name || '').toLowerCase().includes('combo');
        if (isCombo) {
          cart = cart.filter(i => {
            const id = String(i.service_id || '');
            const name = String(i.service_name || '').toLowerCase();
            return !id.startsWith('CB') && !name.includes('combo');
          });
          cart.unshift({ ...item });
        } else {
          cart.push({ ...item });
        }
        ServiceEditModal.tempCartItems = cart;
        this.renderItems(cart, prefix, context);
        ServiceEditModal.onCartChanged();
      }
      return;
    }

    if (!window.PosState) window.PosState = { selectedCartItems: [] };
    let cart = window.PosState.selectedCartItems || [];

    // Nếu chọn thêm combo mới -> thay thế combo cũ
    const isCombo = String(item.service_id || '').startsWith('CB') ||
                    String(item.service_name || '').toLowerCase().includes('combo');
    if (isCombo) {
      cart = cart.filter(i => {
        const id = String(i.service_id || '');
        const name = String(i.service_name || '').toLowerCase();
        return !id.startsWith('CB') && !name.includes('combo');
      });
      cart.unshift({ ...item });
    } else {
      cart.push({ ...item });
    }

    window.PosState.selectedCartItems = cart;

    // Cập nhật lại danh sách items trong popover
    this.renderItems(cart, prefix, context);

    if (typeof PosScreen !== 'undefined' && PosScreen.updateCartUI) {
      PosScreen.updateCartUI();
    }
  }
};

/**
 * Component UI dùng chung: Khung chọn Combo, Multi-tag Chips và Dropdown Popover
 */
const ServicePickerUI = {
  render({
    prefix = 'pos',
    context = 'pos',
    title = 'Dịch Vụ Đã Chọn:',
    placeholderText = '-- Chọn thêm dịch vụ / sản phẩm --'
  } = {}) {
    return `
      <!-- HÀNG 1: CHỌN NHANH COMBO -->
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
                <span>${placeholderText}</span>
              </span>
              <i id="${prefix}-dropdown-chevron" data-lucide="chevron-down" class="w-4 h-4 text-spa-dark/40 transition-transform duration-200 shrink-0 ml-1"></i>
            </div>
          </div>

          <!-- Popover 7 nhóm dịch vụ -->
          <div id="${prefix}-custom-dropdown-popover" class="hidden absolute left-0 right-0 top-full mt-2 bg-white dark:bg-spa-card border border-spa-border rounded-2xl shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 text-left" onclick="event.stopPropagation()">
            <div class="p-2 border-b border-spa-border bg-spa-bg/90 dark:bg-spa-dark/90 sticky top-0 z-20 text-left">
              <div class="relative flex items-center">
                <i data-lucide="search" class="w-3.5 h-3.5 text-spa-dark/40 absolute left-2.5 pointer-events-none"></i>
                <input type="text" id="${prefix}-menu-search-input" oninput="ServiceDropdown.onSearch(this.value, '${prefix}', '${context}')" placeholder="Tìm kiếm nhanh dịch vụ, combo, mỹ phẩm..." class="w-full pl-8 pr-7 py-2 text-xs bg-white dark:bg-spa-card border border-spa-border rounded-xl text-spa-dark dark:text-white placeholder:text-spa-dark/40 focus:outline-none focus:border-spa-brand focus:ring-1 focus:ring-spa-brand/30 font-medium transition text-left" autocomplete="off" />
                <button type="button" id="btn-clear-${prefix}-menu-search" onclick="ServiceDropdown.clearSearch('${prefix}', '${context}')" class="hidden absolute right-2 text-spa-dark/40 hover:text-spa-brand p-0.5 cursor-pointer">
                  <i data-lucide="x" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>
            <div id="${prefix}-custom-dropdown-items" class="border-spa-border border-t pb-2 px-2 space-y-1 max-h-64 overflow-y-auto text-left"></div>
          </div>
        </div>
      </div>
    `;
  }
};

window.ServiceDropdown = ServiceDropdown;
window.ServicePickerUI = ServicePickerUI;

