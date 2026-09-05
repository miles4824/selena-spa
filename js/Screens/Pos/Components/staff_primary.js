// =========================================================================
// COMPONENT: STAFF PRIMARY (Ô CHỌN VÀ HIỂN THỊ KTV 1 CHÍNH)
// =========================================================================

const StaffPrimary = {
  /**
   * Lấy danh sách nhân sự đã sắp xếp (KTV trước, Chủ tiệm sau)
   */
  getUsersList() {
    const users = (typeof getStored === 'function')
      ? getStored('users', (typeof DEFAULT_USERS !== 'undefined' ? DEFAULT_USERS : []))
      : (typeof DEFAULT_USERS !== 'undefined' ? DEFAULT_USERS : []);

    const isOwnerFn = (typeof isUserOwner === 'function') ? isUserOwner : (u => u && u.role === 'owner');
    const ktvs = users.filter(u => !isOwnerFn(u));
    const owners = users.filter(u => isOwnerFn(u));
    return [...ktvs, ...owners];
  },

  /**
   * Render HTML ô chọn KTV 1 chính
   */
  render(currentUser, isOwner = false) {
    const users = this.getUsersList();
    const myPhone = currentUser ? (currentUser.phone || '') : '';

    return `
      <div class="p-3.5 rounded-2xl bg-spa-bg border border-spa-border space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-spa-dark/70 flex items-center gap-1.5">
            ${!isOwner ? `<span id="pos-staff1-lock-icon" class="text-spa-brand"><i data-lucide="lock" class="w-3.5 h-3.5"></i></span>` : ''}
            <span class="font-extrabold text-spa-dark">KTV 1 (Chính):</span>
          </span>

          <!-- Con mắt bật/tắt che tiền hoa hồng -->
          <div onclick="StaffPrimary.togglePrivacy()" 
            class="flex items-center gap-1.5 cursor-pointer select-none group" 
            title="Bấm để ẩn/hiện hoa hồng">
            <span id="pos-staff1-comm-preview" class="text-xs font-extrabold text-spa-sage bg-spa-sage/10 px-2.5 py-0.5 rounded-full border border-spa-sage/30 tracking-wider">
              +•••• đ
            </span>
            <span class="text-spa-dark/40 group-hover:text-spa-sage transition p-0.5">
              <i id="pos-staff1-comm-eye" data-lucide="eye-off" class="w-3.5 h-3.5"></i>
            </span>
          </div>
        </div>

        <select id="pos-staff1-select" 
          onchange="StaffPrimary.onChange()" 
          class="w-full bg-white border border-spa-border rounded-xl p-3 text-spa-dark font-bold text-sm focus:outline-none focus:border-spa-brand disabled:opacity-80 disabled:bg-spa-bg/80 cursor-pointer"
          ${!isOwner ? 'disabled' : ''}>
          ${users.map(u => {
            const isSelected = myPhone && (String(u.phone).replace(/[^0-9]/g, '') === String(myPhone).replace(/[^0-9]/g, ''));
            return `<option value="${u.phone}" ${isSelected ? 'selected' : ''}>${u.full_name || u.name}</option>`;
          }).join('')}
        </select>

        ${!isOwner ? `<p class="text-[11px] text-spa-dark/50">🔒 Tour được gán cố định cho tài khoản của bạn</p>` : ''}
      </div>
    `;
  },

  /**
   * Cập nhật số tiền hoa hồng hiển thị trên badge
   */
  updateCommissionPreview() {
    const commEl = document.getElementById('pos-staff1-comm-preview');
    const eyeEl = document.getElementById('pos-staff1-comm-eye');
    if (!commEl) return;

    if (!window.PosState) window.PosState = {};
    const cart = window.PosState.selectedCartItems || [];
    const extraStaff = window.PosState.extraStaffList || [];
    const totalStaffCount = 1 + extraStaff.length;
    const staff1Pct = Math.round(100 / totalStaffCount);

    const s1Phone = document.getElementById('pos-staff1-select')?.value || (currentUser?.phone);
    const users = this.getUsersList();
    const staffObj = users.find(u => String(u.phone).replace(/[^0-9]/g, '') === String(s1Phone).replace(/[^0-9]/g, '')) || currentUser;

    const commValue = (typeof PosService !== 'undefined')
      ? PosService.calculateCartCommission(cart, staffObj, staff1Pct)
      : 0;

    const isMasked = window.PosState.isStaffCommMasked !== false;

    if (isMasked) {
      commEl.innerText = '+•••• đ';
      if (eyeEl) eyeEl.setAttribute('data-lucide', 'eye-off');
    } else {
      commEl.innerText = (typeof PosService !== 'undefined')
        ? `+${PosService.formatCurrency(commValue)}`
        : `+${commValue.toLocaleString('vi-VN')} đ`;
      if (eyeEl) eyeEl.setAttribute('data-lucide', 'eye');
    }

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  },

  togglePrivacy() {
    if (!window.PosState) window.PosState = {};
    window.PosState.isStaffCommMasked = !(window.PosState.isStaffCommMasked !== false);

    this.updateCommissionPreview();
    if (typeof StaffExtra !== 'undefined' && StaffExtra.renderList) {
      StaffExtra.renderList();
    }
  },

  onChange() {
    this.updateCommissionPreview();
    if (typeof StaffExtra !== 'undefined' && StaffExtra.renderList) {
      StaffExtra.renderList();
    }
  }
};

window.StaffPrimary = StaffPrimary;
