// =========================================================================
// COMPONENT: SERVICE EDIT MODAL (MODAL ĐỔI & BỔ SUNG DỊCH VỤ GIỮA TOUR)
// Chuẩn phong cách Mindora Luxury, tích hợp Quick Combos, Popover 7 nhóm dịch vụ,
// tính toán thời gian thực và thời lượng còn lại chuẩn bản OLD
// =========================================================================

const ServiceEditModal = {
  tempCartItems: [],
  searchQuery: '',

  /**
   * Mở modal chỉnh sửa dịch vụ cho ca đang chạy
   */
  open() {
    const session = (window.PosState && window.PosState.currentLiveSession)
      || (typeof currentLiveSession !== 'undefined' ? currentLiveSession : null);
    if (!session) {
      alert('Không tìm thấy ca tour đang chạy!');
      return;
    }

    // 1. Sao chép danh sách dịch vụ hiện tại vào tempCartItems
    const menu = (typeof getStored === 'function')
      ? getStored('menu', (typeof DEFAULT_MENU !== 'undefined' ? DEFAULT_MENU : []))
      : (typeof DEFAULT_MENU !== 'undefined' ? DEFAULT_MENU : []);

    if (session.selected_items && Array.isArray(session.selected_items) && session.selected_items.length > 0) {
      this.tempCartItems = session.selected_items.map(i => ({ ...i }));
    } else {
      // Nếu chưa có mảng selected_items, tìm trong menu theo service_name hoặc mặc định
      const sName = String(session.service_name || '').toLowerCase();
      const matched = menu.find(m => sName.includes((m.service_name || '').toLowerCase()));
      if (matched) {
        this.tempCartItems = [{ ...matched }];
      } else {
        this.tempCartItems = [{
          service_id: session.service_id || 'CB01',
          service_name: session.service_name || 'Combo 1',
          price: Number(session.price) || 64000,
          duration_min: Number(session.duration_target_min) || 50
        }];
      }
    }

    // 2. Cập nhật thông tin khách hàng & KTV
    const custInfoEl = document.getElementById('modal-edit-live-customer-info');
    if (custInfoEl) {
      const custName = session.customer_name || 'Khách vãng lai';
      const custPhone = session.customer_phone || '';
      const sName = session.staff_1_name || (typeof currentUser !== 'undefined' && currentUser ? currentUser.full_name : 'KTV');
      custInfoEl.innerText = `Khách: ${custName}${custPhone ? ` (${custPhone})` : ''} • KTV: ${sName}`;
    }

    // 3. Render giao diện các thành phần trong modal
    this.searchQuery = '';
    const searchInput = document.getElementById('modal-edit-live-search-input');
    if (searchInput) searchInput.value = '';
    const clearBtn = document.getElementById('btn-clear-modal-edit-search');
    if (clearBtn) clearBtn.classList.add('hidden');

    this.renderQuickCombos();
    this.renderMenuDropdown();
    this.renderCartUI();

    if (typeof hideBottomNav === 'function') hideBottomNav();

    const modal = document.getElementById('modal-edit-live-services');
    if (modal) {
      modal.classList.remove('hidden');
    }
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
  },

  close() {
    this.closePopover();
    const modal = document.getElementById('modal-edit-live-services');
    if (!modal) return;
    if (typeof closeModal === 'function') {
      closeModal(modal, () => {
        if (typeof showBottomNav === 'function') showBottomNav();
      });
    } else {
      modal.classList.add('hidden');
      if (typeof showBottomNav === 'function') showBottomNav();
    }
  },

  togglePopover(e) {
    if (e && e.target && e.target.closest('.modal-chip-remove-btn')) return;
    const popover = document.getElementById('modal-edit-live-popover');
    const chevron = document.getElementById('modal-edit-live-chevron');
    if (!popover) return;

    const isHidden = popover.classList.contains('hidden');
    if (isHidden) {
      this.renderMenuDropdown();
      popover.classList.remove('hidden');
      if (chevron) chevron.classList.add('rotate-180');
      const input = document.getElementById('modal-edit-live-search-input');
      if (input) setTimeout(() => input.focus(), 100);
    } else {
      this.closePopover();
    }
  },

  closePopover() {
    const popover = document.getElementById('modal-edit-live-popover');
    const chevron = document.getElementById('modal-edit-live-chevron');
    if (popover) popover.classList.add('hidden');
    if (chevron) chevron.classList.remove('rotate-180');
  },

  onSearch(val) {
    this.searchQuery = String(val || '').trim();
    const clearBtn = document.getElementById('btn-clear-modal-edit-search');
    if (clearBtn) {
      if (this.searchQuery) clearBtn.classList.remove('hidden');
      else clearBtn.classList.add('hidden');
    }
    this.renderMenuDropdown();
  },

  clearSearch() {
    this.searchQuery = '';
    const input = document.getElementById('modal-edit-live-search-input');
    if (input) {
      input.value = '';
      input.focus();
    }
    const clearBtn = document.getElementById('btn-clear-modal-edit-search');
    if (clearBtn) clearBtn.classList.add('hidden');
    this.renderMenuDropdown();
  },

  isCombo(item) {
    if (!item) return false;
    if (typeof QuickPills !== 'undefined' && QuickPills.isCombo) {
      return QuickPills.isCombo(item);
    }
    const id = String(item.service_id || '').toUpperCase();
    const name = String(item.service_name || '').toLowerCase();
    const cat = String(item.category || '').toLowerCase();
    return id.startsWith('CB') || cat === 'combo' || name.includes('combo');
  },

  toggleQuickCombo(serviceId) {
    const menu = (typeof getStored === 'function')
      ? getStored('menu', (typeof DEFAULT_MENU !== 'undefined' ? DEFAULT_MENU : []))
      : (typeof DEFAULT_MENU !== 'undefined' ? DEFAULT_MENU : []);
    const item = menu.find(m => m.service_id === serviceId);
    if (!item) return;

    const existsIndex = this.tempCartItems.findIndex(i => i.service_id === serviceId);
    if (existsIndex >= 0) {
      // Hủy chọn combo này
      this.tempCartItems.splice(existsIndex, 1);
    } else {
      // Single Combo Rule: Xóa combo cũ và thay bằng combo mới ghim ở đầu
      this.tempCartItems = this.tempCartItems.filter(i => !this.isCombo(i));
      this.tempCartItems.unshift({ ...item });
    }

    this.renderQuickCombos();
    this.renderMenuDropdown();
    this.renderCartUI();
  },

  addCartItem(serviceId) {
    const menu = (typeof getStored === 'function')
      ? getStored('menu', (typeof DEFAULT_MENU !== 'undefined' ? DEFAULT_MENU : []))
      : (typeof DEFAULT_MENU !== 'undefined' ? DEFAULT_MENU : []);
    const item = menu.find(m => m.service_id === serviceId);
    if (!item) return;

    if (this.isCombo(item)) {
      // Thay thế combo cũ
      this.tempCartItems = this.tempCartItems.filter(i => !this.isCombo(i));
      this.tempCartItems.unshift({ ...item });
    } else {
      if (!this.tempCartItems.some(i => i.service_id === serviceId)) {
        this.tempCartItems.push({ ...item });
      }
    }

    this.closePopover();
    this.renderQuickCombos();
    this.renderMenuDropdown();
    this.renderCartUI();
  },

  removeCartItem(serviceId, e) {
    if (e) e.stopPropagation();
    this.tempCartItems = this.tempCartItems.filter(i => i.service_id !== serviceId);
    this.renderQuickCombos();
    this.renderMenuDropdown();
    this.renderCartUI();
  },

  renderQuickCombos() {
    const container = document.getElementById('modal-edit-live-quick-combos');
    if (!container) return;

    const menu = (typeof getStored === 'function')
      ? getStored('menu', (typeof DEFAULT_MENU !== 'undefined' ? DEFAULT_MENU : []))
      : (typeof DEFAULT_MENU !== 'undefined' ? DEFAULT_MENU : []);

    const selectedIds = new Set(this.tempCartItems.map(item => item.service_id));
    const quickNumbers = [1, 2, 3, 4, 5];

    container.innerHTML = quickNumbers.map(num => {
      const item = (typeof QuickPills !== 'undefined' && QuickPills.findComboByNumber)
        ? QuickPills.findComboByNumber(menu, num)
        : null;
      if (!item) return '';

      const isSelected = selectedIds.has(item.service_id);

      return `
        <button type="button" onclick="ServiceEditModal.toggleQuickCombo('${item.service_id}')" class="px-3.5 py-1.5 rounded-2xl text-xs font-extrabold border transition-all duration-200 active:scale-95 cursor-pointer shadow-2xs ${
          isSelected
            ? 'bg-spa-brand/15 text-spa-brand border-spa-brand ring-2 ring-spa-brand/30 font-black shadow-xs'
            : 'bg-white dark:bg-spa-card text-spa-dark dark:text-white border-spa-border hover:bg-spa-bg hover:border-spa-brand/40 hover:text-spa-brand'
        }">
          ${isSelected ? '✓ ' : ''}Combo ${num}
        </button>
      `;
    }).join('');
  },

  renderMenuDropdown() {
    const itemsContainer = document.getElementById('modal-edit-live-dropdown-items');
    if (!itemsContainer) return;

    const menu = (typeof getStored === 'function')
      ? getStored('menu', (typeof DEFAULT_MENU !== 'undefined' ? DEFAULT_MENU : []))
      : (typeof DEFAULT_MENU !== 'undefined' ? DEFAULT_MENU : []);

    const selectedIds = new Set(this.tempCartItems.map(item => item.service_id));
    let available = menu.filter(m => !selectedIds.has(m.service_id));

    if (this.searchQuery) {
      const q = (typeof ServiceDropdown !== 'undefined' && ServiceDropdown.normalizeText)
        ? ServiceDropdown.normalizeText(this.searchQuery)
        : this.searchQuery.toLowerCase();
      available = available.filter(m => {
        const name = (m.service_name || '').toLowerCase();
        const id = (m.service_id || '').toLowerCase();
        return name.includes(q) || id.includes(q);
      });
    }

    if (available.length === 0) {
      itemsContainer.innerHTML = `
        <div class="p-4 text-center text-xs text-spa-muted italic">
          ${this.searchQuery ? 'Không tìm thấy dịch vụ phù hợp' : '-- Tất cả dịch vụ đã được chọn --'}
        </div>
      `;
      return;
    }

    const groups = (typeof ServiceDropdown !== 'undefined' && ServiceDropdown.getGroupedItems)
      ? ServiceDropdown.getGroupedItems(available)
      : [{ title: 'Dịch Vụ', items: available, itemIcon: '✨', icon: 'tag', iconColor: 'text-spa-brand' }];

    let html = '';
    groups.forEach(group => {
      html += `
        <div class="px-3 py-1.5 -mx-2 sticky top-0 z-10 bg-spa-bg/95 dark:bg-spa-dark/95 border-b border-spa-border shadow-2xs flex items-center gap-2 font-black text-[10px] text-spa-muted uppercase tracking-wider backdrop-blur-xs">
          <i data-lucide="${group.icon}" class="w-3 h-3 ${group.iconColor}"></i>
          <span>${group.title}</span>
        </div>
      `;
      html += group.items.map(m => `
        <div onclick="ServiceEditModal.addCartItem('${m.service_id}')" class="p-2.5 rounded-xl hover:bg-spa-brand/10 hover:text-spa-brand transition cursor-pointer flex justify-between items-center text-xs font-bold text-spa-dark dark:text-white group">
          <span class="truncate flex items-center gap-1.5">
            <span>${group.itemIcon || '✨'}</span> <span>${m.service_name}</span>
          </span>
          <span class="font-mono text-spa-muted group-hover:text-spa-brand text-[11px] shrink-0 font-extrabold ml-2">
            ${Number(m.price || 0).toLocaleString('vi-VN')} đ • ${m.duration_min || 0}p
          </span>
        </div>
      `).join('');
    });

    itemsContainer.innerHTML = html;
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  },

  renderCartUI() {
    const chipsContainer = document.getElementById('modal-edit-live-chips-list');
    const countBadge = document.getElementById('modal-edit-live-count-badge');
    const totalPriceEl = document.getElementById('modal-edit-live-total-price');
    const totalDurationEl = document.getElementById('modal-edit-live-total-duration');
    const remainingNoteEl = document.getElementById('modal-edit-live-remaining-note');
    if (!chipsContainer) return;

    if (this.tempCartItems.length === 0) {
      chipsContainer.innerHTML = `
        <div class="p-2.5 text-center text-xs text-rose-500 font-bold italic">
          ⚠️ Chưa có dịch vụ nào! Vui lòng chọn ít nhất 1 dịch vụ.
        </div>
      `;
      if (countBadge) countBadge.innerText = '0 dịch vụ';
      if (totalPriceEl) totalPriceEl.innerText = '0 đ';
      if (totalDurationEl) totalDurationEl.innerText = '0 phút';
      if (remainingNoteEl) remainingNoteEl.innerText = 'Không thể để trống ca';
      return;
    }

    if (countBadge) countBadge.innerText = `${this.tempCartItems.length} dịch vụ`;

    let totalPrice = 0;
    let totalDuration = 0;

    chipsContainer.innerHTML = this.tempCartItems.map(item => {
      const price = Number(item.price) || 0;
      const dur = Number(item.duration_min) || 0;
      totalPrice += price;
      totalDuration += dur;

      const isCombo = this.isCombo(item);

      return `
        <div class="inline-flex items-center gap-2.5 px-3 py-1 rounded-2xl bg-gradient-to-r from-spa-brand/10 to-spa-bg border border-spa-brand/30 text-spa-dark dark:text-white shadow-2xs hover:shadow-xs transition animate-in zoom-in-95">
          <div class="text-base flex items-center justify-center shrink-0">
            ${isCombo ? '💆' : '✨'}
          </div>
          <div class="min-w-0 flex-1">
            <div class="font-extrabold text-[11px] leading-snug truncate">
              ${item.service_name}
            </div>
            <div class="text-[11px] font-mono text-spa-muted mt-0.5 flex items-center gap-1.5 leading-tight">
              <span class="text-spa-brand font-black">${price.toLocaleString('vi-VN')} đ</span>
              <span>•</span>
              <span class="text-spa-sage font-bold">${dur}p</span>
            </div>
          </div>
          <button type="button" onclick="ServiceEditModal.removeCartItem('${item.service_id}', event)" class="modal-chip-remove-btn ml-1 p-1 text-spa-muted hover:text-rose-600 hover:bg-rose-50 rounded-full transition cursor-pointer shrink-0" title="Xóa dịch vụ này">
            <i data-lucide="x" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `;
    }).join('');

    if (totalPriceEl) totalPriceEl.innerText = `${totalPrice.toLocaleString('vi-VN')} đ`;
    if (totalDurationEl) totalDurationEl.innerText = `${totalDuration} phút`;

    // Tính thời gian đã chạy và thời gian còn lại
    const session = (window.PosState && window.PosState.currentLiveSession)
      || (typeof currentLiveSession !== 'undefined' ? currentLiveSession : null);
    if (session && session.start_timestamp && remainingNoteEl) {
      const elapsedMinutes = Math.floor((Date.now() - session.start_timestamp) / 60000);
      const remMin = totalDuration - elapsedMinutes;
      if (remMin > 0) {
        remainingNoteEl.innerText = `Đã chạy ${elapsedMinutes}p • Còn lại khoảng ${remMin} phút`;
      } else {
        remainingNoteEl.innerText = `Đã chạy ${elapsedMinutes}p • Quá giờ +${Math.abs(remMin)} phút`;
      }
    }

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  },

  /**
   * Lưu thay đổi dịch vụ vào ca đang chạy
   */
  saveChanges() {
    const session = (window.PosState && window.PosState.currentLiveSession)
      || (typeof currentLiveSession !== 'undefined' ? currentLiveSession : null);
    if (!session) return;

    if (!this.tempCartItems || this.tempCartItems.length === 0) {
      alert('Ca phục vụ phải có ít nhất một dịch vụ!');
      return;
    }

    const totalPrice = this.tempCartItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    const totalDuration = this.tempCartItems.reduce((sum, item) => sum + (Number(item.duration_min) || 0), 0);
    const serviceDisplayName = this.tempCartItems.map(i => i.service_name).join(' + ');
    const primaryServiceId = this.tempCartItems[0].service_id;

    // Cập nhật session
    session.selected_items = this.tempCartItems.map(i => ({ ...i }));
    session.price = totalPrice;
    session.duration_target_min = totalDuration;
    session.service_id = primaryServiceId;
    session.service_name = serviceDisplayName;

    // Lưu vào localStorage
    localStorage.setItem('selena_active_live_session', JSON.stringify(session));
    if (typeof setStored === 'function') {
      setStored('currentLiveSession', session);
    }

    // Đẩy cập nhật lên Firebase Realtime
    if (typeof fbSaveLiveSession === 'function') {
      fbSaveLiveSession(session);
    }

    // Cập nhật giao diện ca đang chạy ngay lập tức
    if (typeof LiveHeader !== 'undefined') {
      LiveHeader.update(session);
    }
    if (typeof LiveTimer !== 'undefined') {
      LiveTimer.updateStaticTimes(session);
    }
    if (typeof refreshLiveBeds === 'function') {
      refreshLiveBeds();
    }

    this.close();
  }
};

// Đóng popover chọn dịch vụ khi nhấp ra ngoài hộp chọn
document.addEventListener('click', (e) => {
  const popover = document.getElementById('modal-edit-live-popover');
  const tagContainer = document.getElementById('modal-edit-live-tag-container');
  if (!popover || popover.classList.contains('hidden')) return;
  if (!popover.contains(e.target) && tagContainer && !tagContainer.contains(e.target)) {
    ServiceEditModal.closePopover();
  }
});

window.ServiceEditModal = ServiceEditModal;

