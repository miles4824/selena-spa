// =========================================================================
// COMPONENT: SERVICE EDIT MODAL (MODAL ĐỔI HOẶC BỔ SUNG DỊCH VỤ GIỮA TOUR)
// =========================================================================

const ServiceEditModal = {
  /**
   * Mở modal chỉnh sửa dịch vụ cho ca đang chạy
   */
  open() {
    const modal = document.getElementById('modal-edit-live-services');
    if (!modal) return;

    const session = (window.PosState && window.PosState.currentLiveSession)
      || (typeof currentLiveSession !== 'undefined' ? currentLiveSession : null);
    if (!session) return;

    this.renderCurrentServices(session);
    if (typeof hideBottomNav === 'function') hideBottomNav();
    modal.classList.remove('hidden');
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  },

  close() {
    const modal = document.getElementById('modal-edit-live-services');
    if (modal) modal.classList.add('hidden');
    if (typeof showBottomNav === 'function') showBottomNav();
  },

  renderCurrentServices(session) {
    const container = document.getElementById('modal-edit-services-list');
    if (!container) return;

    const currentName = session.service_name || 'Combo 1';
    const dur = session.duration_target_min || session.duration_min || 50;

    container.innerHTML = `
      <div class="p-3.5 rounded-2xl bg-spa-brand/10 border border-spa-brand/30 flex justify-between items-center text-xs font-bold text-spa-dark">
        <span class="truncate font-extrabold text-spa-brand">${currentName}</span>
        <span class="font-mono text-spa-sage shrink-0">${dur} phút</span>
      </div>
    `;
  },

  /**
   * Lưu thay đổi dịch vụ vào ca đang chạy
   */
  saveChanges(newService) {
    const session = (window.PosState && window.PosState.currentLiveSession)
      || (typeof currentLiveSession !== 'undefined' ? currentLiveSession : null);
    if (!session || !newService) return;

    session.service_name = newService.service_name;
    session.duration_target_min = Number(newService.duration_min) || 50;
    session.price = Number(newService.price) || session.price;

    // Lưu vào localStorage
    localStorage.setItem('selena_active_live_session', JSON.stringify(session));

    // Đẩy cập nhật lên Firebase
    if (typeof fbSaveLiveSession === 'function') {
      fbSaveLiveSession(session);
    }

    // Cập nhật lại giao diện ca đang chạy
    if (typeof LiveHeader !== 'undefined') {
      LiveHeader.update(session);
    }
    if (typeof LiveTimer !== 'undefined') {
      LiveTimer.updateStaticTimes(session);
    }

    this.close();
  }
};

window.ServiceEditModal = ServiceEditModal;
