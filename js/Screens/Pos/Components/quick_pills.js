// =========================================================================
// COMPONENT: QUICK COMBO PILLS (HÀNG NÚT CHỌN NHANH COMBO 1 - 5)
// =========================================================================

const QuickPills = {
  /**
   * Kiểm tra một dịch vụ có phải là Combo hay không
   */
  isCombo(item) {
    if (!item) return false;
    const id = String(item.service_id || '');
    const name = String(item.service_name || '').toLowerCase();
    const cat = String(item.category || '').toLowerCase();
    return id.startsWith('CB') || cat === 'combo' || name.includes('combo');
  },

  /**
   * Tìm combo theo số thứ tự (1..5)
   */
  findComboByNumber(menu, num) {
    if (!Array.isArray(menu)) return null;
    return menu.find(m => {
      const sName = (m.service_name || '').toLowerCase();
      const sId = (m.service_id || '').toLowerCase();
      return (
        sName.includes(`combo ${num}`) ||
        sName.includes(`combo${num}`) ||
        sId === `cb0${num}` ||
        sId === `cb${num}` ||
        sId === `combo${num}` ||
        sId === `combo_${num}`
      );
    }) || null;
  },

  /**
   * Render HTML cho container nút chọn nhanh combo
   */
  render(selectedCartItems = [], context = 'pos') {
    const menu = (typeof getStored === 'function')
      ? getStored('menu', (typeof DEFAULT_MENU !== 'undefined' ? DEFAULT_MENU : []))
      : (typeof DEFAULT_MENU !== 'undefined' ? DEFAULT_MENU : []);

    const selectedIds = new Set(selectedCartItems.map(item => item.service_id));
    const quickNumbers = [1, 2, 3, 4, 5];

    return quickNumbers.map(num => {
      const item = this.findComboByNumber(menu, num);
      if (!item) return '';

      const isSelected = selectedIds.has(item.service_id);

      return `
        <button type="button" 
          onclick="QuickPills.toggle('${item.service_id}', '${context}')" 
          class="px-3.5 py-2 rounded-2xl text-xs font-extrabold border transition-all duration-200 active:scale-95 cursor-pointer ${
            isSelected
              ? 'bg-spa-brand/10 text-spa-brand border-spa-brand ring-2 ring-spa-brand/30 shadow-xs'
              : 'bg-white dark:bg-spa-card text-spa-dark/80 dark:text-white/80 border-spa-border hover:bg-spa-bg hover:border-spa-brand/40 hover:text-spa-brand'
          }">
          ${isSelected ? '✓ ' : ''}Combo ${num}
        </button>
      `;
    }).join('');
  },

  /**
   * Xử lý khi bấm nút chọn nhanh (Quy tắc Single Combo: Thay thế combo cũ)
   */
  toggle(serviceId, context = 'pos') {
    const menu = (typeof getStored === 'function')
      ? getStored('menu', (typeof DEFAULT_MENU !== 'undefined' ? DEFAULT_MENU : []))
      : (typeof DEFAULT_MENU !== 'undefined' ? DEFAULT_MENU : []);
    const item = menu.find(m => m.service_id === serviceId);
    if (!item) return;

    if (context === 'modal-edit') {
      if (typeof ServiceEditModal !== 'undefined') {
        let cart = ServiceEditModal.tempCartItems || [];
        const existsIndex = cart.findIndex(i => i.service_id === serviceId);
        if (existsIndex >= 0) {
          cart.splice(existsIndex, 1);
        } else {
          cart = cart.filter(i => !this.isCombo(i));
          cart.unshift({ ...item });
        }
        ServiceEditModal.tempCartItems = cart;
        ServiceEditModal.onCartChanged();
      }
      return;
    }

    if (!window.PosState) window.PosState = { selectedCartItems: [] };
    let cart = window.PosState.selectedCartItems || [];

    const existsIndex = cart.findIndex(i => i.service_id === serviceId);
    if (existsIndex >= 0) {
      // Đã chọn đúng combo này -> Hủy chọn
      cart.splice(existsIndex, 1);
    } else {
      // Xóa combo cũ (nếu có) và thay bằng combo mới được chọn
      cart = cart.filter(i => !this.isCombo(i));
      cart.unshift({ ...item });
    }

    window.PosState.selectedCartItems = cart;

    // Kích hoạt cập nhật giao diện giỏ hàng
    if (typeof PosScreen !== 'undefined' && PosScreen.updateCartUI) {
      PosScreen.updateCartUI();
    }
  }
};

window.QuickPills = QuickPills;
