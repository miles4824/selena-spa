// =========================================================================
// COMPONENT: STAFF EXTRA (DANH SÁCH VÀ NÚT THÊM KTV PHỤ CÙNG LÀM)
// =========================================================================

const StaffExtra = {
  /**
   * Render danh sách các thẻ KTV phụ vào #pos-extra-staff-container
   */
  renderList() {
    const container = document.getElementById('pos-extra-staff-container');
    if (!container) return;

    if (!window.PosState) window.PosState = {};
    const extraList = window.PosState.extraStaffList || [];
    const cart = window.PosState.selectedCartItems || [];
    const isMasked = window.PosState.isStaffCommMasked !== false;

    const users = (typeof StaffPrimary !== 'undefined')
      ? StaffPrimary.getUsersList()
      : ((typeof DEFAULT_USERS !== 'undefined') ? DEFAULT_USERS : []);

    const s1Select = document.getElementById('pos-staff1-select');
    const s1Phone = (typeof normalizePhone === 'function')
      ? normalizePhone(s1Select?.value || currentUser?.phone)
      : String(s1Select?.value || currentUser?.phone || '').replace(/[^0-9]/g, '');

    // Cập nhật trạng thái hiển thị nút "Thêm KTV"
    const addBtn = document.getElementById('pos-btn-add-extra-staff');
    const maxAllowedExtra = Math.min(2, Math.max(0, users.length - 1));
    if (addBtn) {
      if (extraList.length >= maxAllowedExtra) {
        addBtn.classList.add('hidden');
      } else {
        addBtn.classList.remove('hidden');
      }
    }

    if (extraList.length === 0) {
      container.innerHTML = '';
      return;
    }

    const totalStaffCount = 1 + extraList.length;
    const eachPct = Math.round(100 / totalStaffCount);

    container.innerHTML = extraList.map((s, idx) => {
      const ktvNum = idx + 2;
      const myPhoneNorm = (typeof normalizePhone === 'function') ? normalizePhone(s.phone) : String(s.phone).replace(/[^0-9]/g, '');
      const staffObj = users.find(u => {
        const uP = (typeof normalizePhone === 'function') ? normalizePhone(u.phone) : String(u.phone).replace(/[^0-9]/g, '');
        return uP === myPhoneNorm;
      });

      const staffComm = (typeof PosService !== 'undefined')
        ? PosService.calculateCartCommission(cart, staffObj, eachPct)
        : 0;

      const formattedComm = isMasked
        ? '+•••• đ'
        : ((typeof PosService !== 'undefined') ? `+${PosService.formatCurrency(staffComm)}` : `+${staffComm.toLocaleString('vi-VN')} đ`);

      // Lọc danh sách KTV có thể chọn: Loại trừ KTV chính và các KTV phụ khác
      const otherChosenPhones = new Set([
        s1Phone,
        ...extraList.filter((_, i) => i !== idx).map(st => (typeof normalizePhone === 'function' ? normalizePhone(st.phone) : String(st.phone).replace(/[^0-9]/g, '')))
      ]);

      const selectableUsers = users.filter(u => {
        const uP = (typeof normalizePhone === 'function') ? normalizePhone(u.phone) : String(u.phone).replace(/[^0-9]/g, '');
        return uP === myPhoneNorm || !otherChosenPhones.has(uP);
      });

      return `
        <div class="p-3.5 rounded-2xl bg-spa-brand/5 border border-spa-brand/20 space-y-2 animate-in fade-in zoom-in-95">
          <div class="flex justify-between items-center">
            <span class="text-xs font-bold text-spa-brand flex items-center gap-1.5">
              <i data-lucide="user-check" class="w-3.5 h-3.5"></i>
              <span class="font-extrabold text-spa-dark">KTV ${ktvNum} (Phụ):</span>
            </span>

            <!-- Nút xóa KTV phụ -->
            <button type="button" 
              onclick="StaffExtra.remove(${idx})" 
              class="p-1 text-spa-dark/40 hover:text-rose-600 hover:bg-rose-100 rounded-full transition cursor-pointer" 
              title="Xóa KTV này">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>

          <select onchange="StaffExtra.onChange(${idx}, this.value)" 
            class="w-full bg-white border border-spa-border rounded-xl p-3 text-spa-dark font-bold text-sm focus:outline-none focus:border-spa-brand cursor-pointer">
            ${selectableUsers.map(u => {
              const uP = (typeof normalizePhone === 'function') ? normalizePhone(u.phone) : String(u.phone).replace(/[^0-9]/g, '');
              const isSelected = uP === myPhoneNorm;
              return `<option value="${u.phone}" ${isSelected ? 'selected' : ''}>${u.full_name || u.name}</option>`;
            }).join('')}
          </select>
        </div>
      `;
    }).join('');

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  },

  /**
   * Thêm 1 KTV phụ mới (Tối đa 2 KTV phụ, tổng ca tối đa 3 KTV)
   */
  add() {
    if (!window.PosState) window.PosState = {};
    if (!Array.isArray(window.PosState.extraStaffList)) {
      window.PosState.extraStaffList = [];
    }

    const users = (typeof StaffPrimary !== 'undefined')
      ? StaffPrimary.getUsersList()
      : ((typeof DEFAULT_USERS !== 'undefined') ? DEFAULT_USERS : []);

    const maxAllowedExtra = Math.min(2, Math.max(0, users.length - 1));
    if (window.PosState.extraStaffList.length >= maxAllowedExtra) {
      if (window.PosState.extraStaffList.length >= 2) {
        alert('Mỗi tour gội phục vụ tối đa 3 KTV (1 KTV chính và 2 KTV phụ)!');
      } else {
        alert('Đã chọn hết tất cả Kỹ Thuật Viên rảnh trong tiệm!');
      }
      return;
    }

    const s1Select = document.getElementById('pos-staff1-select');
    const s1Phone = (typeof normalizePhone === 'function')
      ? normalizePhone(s1Select?.value || currentUser?.phone)
      : String(s1Select?.value || currentUser?.phone || '').replace(/[^0-9]/g, '');

    const existingPhones = new Set([
      s1Phone,
      ...window.PosState.extraStaffList.map(s => (typeof normalizePhone === 'function' ? normalizePhone(s.phone) : String(s.phone).replace(/[^0-9]/g, '')))
    ]);

    // Tìm KTV đầu tiên chưa được chọn
    const availableStaff = users.find(u => {
      const uP = (typeof normalizePhone === 'function') ? normalizePhone(u.phone) : String(u.phone).replace(/[^0-9]/g, '');
      return !existingPhones.has(uP);
    });

    if (!availableStaff) {
      alert('Tất cả Kỹ Thuật Viên rảnh đã được chọn trong ca này!');
      return;
    }

    window.PosState.extraStaffList.push({
      phone: availableStaff.phone,
      id: availableStaff.staff_id || availableStaff.id,
      name: availableStaff.full_name || availableStaff.name
    });

    this.renderList();
    if (typeof StaffPrimary !== 'undefined') {
      StaffPrimary.updateCommissionPreview();
    }
  },

  /**
   * Xóa KTV phụ theo index
   */
  remove(index) {
    if (!window.PosState || !Array.isArray(window.PosState.extraStaffList)) return;
    window.PosState.extraStaffList.splice(index, 1);

    this.renderList();
    if (typeof StaffPrimary !== 'undefined') {
      StaffPrimary.updateCommissionPreview();
    }
  },

  /**
   * Thay đổi người được chọn trong dropdown KTV phụ
   */
  onChange(index, newPhone) {
    if (!window.PosState || !Array.isArray(window.PosState.extraStaffList)) return;
    const users = (typeof StaffPrimary !== 'undefined') ? StaffPrimary.getUsersList() : [];
    const staffObj = users.find(u => String(u.phone).replace(/[^0-9]/g, '') === String(newPhone).replace(/[^0-9]/g, ''));

    if (staffObj && window.PosState.extraStaffList[index]) {
      window.PosState.extraStaffList[index].phone = staffObj.phone;
      window.PosState.extraStaffList[index].name = staffObj.full_name || staffObj.name;
      window.PosState.extraStaffList[index].id = staffObj.staff_id || staffObj.id;
    }

    this.renderList();
    if (typeof StaffPrimary !== 'undefined') {
      StaffPrimary.updateCommissionPreview();
    }
  }
};

window.StaffExtra = StaffExtra;
