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

  /**
   * Bật/Tắt popover
   */
  togglePopover(e) {
    if (e && e.target && e.target.closest && e.target.closest('.pos-chip-remove-btn')) {
      return;
    }

    const popover = document.getElementById('pos-custom-dropdown-popover');
    const chevron = document.getElementById('pos-dropdown-chevron');
    if (!popover) return;

    const isHidden = popover.classList.contains('hidden');
    if (isHidden) {
      const cart = (window.PosState && window.PosState.selectedCartItems) || [];
      this.renderItems(cart);
      popover.classList.remove('hidden');
      if (chevron) chevron.classList.add('rotate-180');
    } else {
      this.closePopover();
    }
  },

  closePopover() {
    const popover = document.getElementById('pos-custom-dropdown-popover');
    const chevron = document.getElementById('pos-dropdown-chevron');
    if (popover) popover.classList.add('hidden');
    if (chevron) chevron.classList.remove('rotate-180');
  },

  onSearch(val) {
    this.searchQuery = String(val || '');
    const clearBtn = document.getElementById('btn-clear-pos-menu-search');
    if (clearBtn) {
      if (this.searchQuery) clearBtn.classList.remove('hidden');
      else clearBtn.classList.add('hidden');
    }
    const cart = (window.PosState && window.PosState.selectedCartItems) || [];
    this.renderItems(cart);
  },

  clearSearch() {
    this.searchQuery = '';
    const input = document.getElementById('pos-menu-search-input');
    if (input) input.value = '';
    const clearBtn = document.getElementById('btn-clear-pos-menu-search');
    if (clearBtn) clearBtn.classList.add('hidden');
    const cart = (window.PosState && window.PosState.selectedCartItems) || [];
    this.renderItems(cart);
  },

  addItem(serviceId) {
    const menu = (typeof getStored === 'function')
      ? getStored('menu', (typeof DEFAULT_MENU !== 'undefined' ? DEFAULT_MENU : []))
      : (typeof DEFAULT_MENU !== 'undefined' ? DEFAULT_MENU : []);
    const item = menu.find(m => m.service_id === serviceId);
    if (!item) return;

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
    this.renderItems(cart);

    if (typeof PosScreen !== 'undefined' && PosScreen.updateCartUI) {
      PosScreen.updateCartUI();
    }
  }
};

window.ServiceDropdown = ServiceDropdown;
