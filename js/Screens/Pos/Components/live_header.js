// =========================================================================
// COMPONENT: LIVE HEADER (HEADER & THÔNG TIN DỊCH VỤ CỦA TOUR ĐANG CHẠY)
// =========================================================================

const LiveHeader = {
  /**
   * Cập nhật thông tin dịch vụ, khách hàng và KTV chips lên màn hình tour đang chạy
   */
  update(session) {
    if (!session) return;

    const nameEl = document.getElementById('live-service-name');
    const custEl = document.getElementById('live-customer-name-text');
    const chipsContainer = document.getElementById('live-staff-chips-container');

    if (nameEl) {
      nameEl.innerText = session.service_name || 'Tour Gội';
    }

    if (custEl) {
      custEl.innerText = session.customer_name || 'Khách vãng lai';
    }

    if (chipsContainer) {
      this.renderStaffChips(session, chipsContainer);
    }

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  },

  /**
   * Render các chip KTV đang trực tiếp phục vụ ca gội kèm nút Đổi/Thêm và Bàn Giao
   */
  renderStaffChips(session, container) {
    const cUser = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : null;
    const myPhone = (cUser && cUser.phone) ? String(cUser.phone).replace(/[^0-9]/g, '') : '';
    const isOwner = cUser ? (typeof isUserOwner === 'function' ? isUserOwner(cUser) : (cUser.role === 'admin' || cUser.role === 'owner')) : false;

    const s1Phone = String(session.staff_1_phone || '').replace(/[^0-9]/g, '');
    const isKtvChinh = myPhone && s1Phone === myPhone;
    const canManage = Boolean(isOwner || isKtvChinh);

    const staffs = (session.staffs && session.staffs.length > 0)
      ? session.staffs
      : [
          { name: session.staff_1_name || 'KTV 1', pct: 100 },
          ...(session.extra_staff || []).map(s => ({ name: s.name, pct: s.pct }))
        ];

    const activeStaffs = staffs.filter(s => !s.left_early);

    let html = (activeStaffs.length > 0 ? activeStaffs : staffs).map((s, idx) => `
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${idx === 0 ? 'bg-spa-brand/10 border-spa-brand/30 text-spa-brand' : 'bg-spa-sage/10 border-spa-sage/30 text-spa-sage'} border text-xs font-bold">
        <span class="w-1.5 h-1.5 rounded-full ${idx === 0 ? 'bg-spa-brand' : 'bg-spa-sage'}"></span>
        <span>${s.name}</span>
        ${s.pct ? `<span class="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono">${s.pct}%</span>` : ''}
      </div>
    `).join('');

    if (canManage) {
      html += `
        <button type="button" onclick="SwapStaffModal.open()" title="Đổi hoặc thêm KTV cùng làm tour" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-spa-brand/10 hover:bg-spa-brand/20 text-xs font-bold text-spa-brand border border-spa-brand/30 transition active:scale-95 cursor-pointer shadow-2xs">
          <i data-lucide="users" class="w-3.5 h-3.5"></i>
          <span>Đổi / Thêm</span>
        </button>
        <button type="button" onclick="HandoverModal.open()" title="Bàn giao tour cho bạn KTV khác tiếp quản" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-spa-sage/15 hover:bg-spa-sage/25 text-xs font-bold text-spa-sage border border-spa-sage/30 transition active:scale-95 cursor-pointer shadow-2xs">
          <i data-lucide="arrow-right-left" class="w-3.5 h-3.5"></i>
          <span>Bàn Giao</span>
        </button>
      `;
    }

    container.innerHTML = html;
  },

  /**
   * Huỷ tour đang chạy
   */
  cancelTour() {
    if (!confirm('⚠️ Bạn có chắc chắn muốn hủy tour gội đang chạy này không?')) return;

    if (typeof PosScreen !== 'undefined' && PosScreen.stopLiveTour) {
      PosScreen.stopLiveTour(true);
    }
  }
};

window.LiveHeader = LiveHeader;
