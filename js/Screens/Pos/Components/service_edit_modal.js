// =========================================================================
// COMPONENT: SERVICE EDIT MODAL (MODAL ĐỔI & BỔ SUNG DỊCH VỤ GIỮA TOUR)
// Chuẩn phong cách Mindora Luxury, sử dụng chung QuickPills, CartChips, ServiceDropdown
// và ServicePickerUI để đảm bảo đồng bộ 100% giao diện với Màn hình Tạo Tour
// =========================================================================

const ServiceEditModal = {
  tempCartItems: [],

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

    // 3. Xóa tìm kiếm dropdown nếu có
    if (typeof ServiceDropdown !== 'undefined' && ServiceDropdown.clearSearch) {
      ServiceDropdown.clearSearch('modal-edit', 'modal-edit');
    }

    // 4. Render toàn bộ UI cho modal-edit
    this.updateUI();

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
    if (typeof ServiceDropdown !== 'undefined' && ServiceDropdown.closePopover) {
      ServiceDropdown.closePopover('modal-edit');
    }
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

  /**
   * Callback khi giỏ hàng trong modal thay đổi (từ QuickPills, CartChips hoặc ServiceDropdown)
   */
  onCartChanged() {
    this.updateUI();
  },

  /**
   * Cập nhật toàn bộ các thành phần hiển thị trong modal
   */
  updateUI() {
    // 1. Render nút chọn nhanh combo
    const quickEl = document.getElementById('modal-edit-quick-combos')
      || document.getElementById('modal-edit-live-quick-combos');
    if (quickEl && typeof QuickPills !== 'undefined') {
      quickEl.innerHTML = QuickPills.render(this.tempCartItems, 'modal-edit');
    }

    // 2. Render danh sách chips
    const chipsEl = document.getElementById('modal-edit-cart-chips-list')
      || document.getElementById('modal-edit-live-chips-list');
    const badgeEl = document.getElementById('modal-edit-cart-count-badge')
      || document.getElementById('modal-edit-live-count-badge');
    const totalPriceEl = document.getElementById('modal-edit-live-total-price');
    const totalDurationEl = document.getElementById('modal-edit-live-total-duration');
    const remainingNoteEl = document.getElementById('modal-edit-live-remaining-note');

    if (chipsEl) {
      if (this.tempCartItems.length === 0) {
        chipsEl.innerHTML = `
          <div class="p-2.5 text-center text-xs text-rose-500 font-bold italic w-full">
            ⚠️ Chưa có dịch vụ nào! Vui lòng chọn ít nhất 1 dịch vụ.
          </div>
        `;
      } else if (typeof CartChips !== 'undefined') {
        chipsEl.innerHTML = CartChips.render(this.tempCartItems, 'modal-edit');
      }
    }

    if (badgeEl) {
      badgeEl.innerText = `${this.tempCartItems.length} dịch vụ`;
    }

    // 3. Tính tổng tiền & thời lượng
    const totalPrice = this.tempCartItems.reduce((sum, i) => sum + (Number(i.price) || 0), 0);
    const totalDuration = this.tempCartItems.reduce((sum, i) => sum + (Number(i.duration_min) || 0), 0);

    if (totalPriceEl) totalPriceEl.innerText = `${totalPrice.toLocaleString('vi-VN')} đ`;
    if (totalDurationEl) totalDurationEl.innerText = `${totalDuration} phút`;

    // 4. Tính thời gian đã chạy & còn lại
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

// Đóng popover khi click ra ngoài
document.addEventListener('click', (e) => {
  const popover = document.getElementById('modal-edit-custom-dropdown-popover');
  const tagContainer = document.getElementById('modal-edit-tag-container');
  if (!popover || popover.classList.contains('hidden')) return;
  if (!popover.contains(e.target) && tagContainer && !tagContainer.contains(e.target)) {
    if (typeof ServiceDropdown !== 'undefined' && ServiceDropdown.closePopover) {
      ServiceDropdown.closePopover('modal-edit');
    }
  }
});

window.ServiceEditModal = ServiceEditModal;
