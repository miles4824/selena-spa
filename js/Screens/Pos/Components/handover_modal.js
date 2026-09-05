// =========================================================================
// COMPONENT: HANDOVER MODAL (MODAL CHUYỂN GIAO / BÀN GIAO CA CHO KTV KHÁC)
// Hỗ trợ chia hoa hồng theo thời gian thực hoặc 50/50 & đồng bộ Firebase tức thì
// =========================================================================

const HandoverModal = {
  handoverSplitMode: 'timer',

  /**
   * Mở modal bàn giao ca
   */
  open() {
    const session = (window.PosState && window.PosState.currentLiveSession)
      || (typeof currentLiveSession !== 'undefined' ? currentLiveSession : null);
    if (!session) {
      alert('Không tìm thấy ca tour đang chạy để bàn giao!');
      return;
    }

    this.handoverSplitMode = 'timer';
    this.renderStaffOptions();
    this.updateSplitButtons();
    this.updatePreview();

    const modal = document.getElementById('modal-handover');
    if (typeof hideBottomNav === 'function') hideBottomNav();
    if (modal) modal.classList.remove('hidden');
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  },

  close() {
    const modal = document.getElementById('modal-handover');
    if (modal) modal.classList.add('hidden');
    if (typeof showBottomNav === 'function') showBottomNav();
  },

  setSplitMode(mode) {
    this.handoverSplitMode = mode;
    this.updateSplitButtons();
    this.updatePreview();
  },

  updateSplitButtons() {
    const btnTimer = document.getElementById('btn-handover-timer');
    const btnEqual = document.getElementById('btn-handover-equal');
    if (!btnTimer || !btnEqual) return;

    if (this.handoverSplitMode === 'timer') {
      btnTimer.className = 'p-3 rounded-2xl border bg-spa-brand/10 border-spa-brand text-spa-brand font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition shadow-xs';
      btnEqual.className = 'p-3 rounded-2xl border bg-spa-bg dark:bg-spa-dark/40 border-spa-border text-spa-muted hover:bg-spa-brand/5 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition';
    } else {
      btnEqual.className = 'p-3 rounded-2xl border bg-spa-brand/10 border-spa-brand text-spa-brand font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition shadow-xs';
      btnTimer.className = 'p-3 rounded-2xl border bg-spa-bg dark:bg-spa-dark/40 border-spa-border text-spa-muted hover:bg-spa-brand/5 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition';
    }
  },

  renderStaffOptions() {
    const selectEl = document.getElementById('modal-handover-staff-select');
    if (!selectEl) return;

    const users = (typeof StaffPrimary !== 'undefined')
      ? StaffPrimary.getUsersList()
      : ((typeof DEFAULT_USERS !== 'undefined') ? DEFAULT_USERS : []);

    const session = (window.PosState && window.PosState.currentLiveSession)
      || (typeof currentLiveSession !== 'undefined' ? currentLiveSession : null);
    const currentPhone = session ? String(session.staff_1_phone || '').replace(/[^0-9]/g, '') : '';

    const availableUsers = users.filter(u => String(u.phone).replace(/[^0-9]/g, '') !== currentPhone);

    if (availableUsers.length === 0) {
      selectEl.innerHTML = '<option value="">-- Không có KTV khác sẵn sàng --</option>';
    } else {
      selectEl.innerHTML = availableUsers
        .map(u => {
          const isOwner = (typeof isUserOwner === 'function') ? isUserOwner(u) : false;
          return `<option value="${u.phone}">${u.full_name || u.name} (${isOwner ? 'Chủ tiệm' : 'KTV'})</option>`;
        })
        .join('');
    }
  },

  updatePreview() {
    const session = (window.PosState && window.PosState.currentLiveSession)
      || (typeof currentLiveSession !== 'undefined' ? currentLiveSession : null);
    if (!session) return;

    const listEl = document.getElementById('handover-preview-list');
    if (!listEl) return;

    const users = (typeof StaffPrimary !== 'undefined') ? StaffPrimary.getUsersList() : [];
    const selectEl = document.getElementById('modal-handover-staff-select');
    const targetPhone = selectEl ? selectEl.value : '';
    const targetUser = users.find(u => String(u.phone).replace(/[^0-9]/g, '') === String(targetPhone).replace(/[^0-9]/g, '')) || { full_name: 'KTV mới' };

    const elapsedSec = Math.max(1, Math.floor((Date.now() - (session.start_timestamp || Date.now())) / 1000));
    const elapsedMin = Math.floor(elapsedSec / 60);
    const targetMin = session.duration_target_min || 50;

    const totalPrice = session.price || 0;
    const estTotalComm = Math.round(totalPrice * 0.1); // Ước tính hoa hồng 10%

    let p1Pct = 50;
    let p2Pct = 50;

    if (this.handoverSplitMode === 'timer') {
      p1Pct = Math.min(90, Math.max(10, Math.round((elapsedMin / targetMin) * 100)));
      p2Pct = 100 - p1Pct;
    }

    const p1Comm = Math.round(estTotalComm * (p1Pct / 100));
    const p2Comm = estTotalComm - p1Comm;
    const currentStaffName = session.staff_1_name || 'KTV hiện tại';

    listEl.innerHTML = `
      <div class="flex justify-between items-center text-spa-dark dark:text-white">
        <span class="flex items-center gap-1.5 font-medium">
          <span class="w-2 h-2 rounded-full bg-spa-brand"></span>
          <b>${currentStaffName}</b> (Đã làm ${elapsedMin} phút):
        </span>
        <span class="font-bold text-spa-brand font-mono">${p1Pct}% • ~${p1Comm.toLocaleString('vi-VN')} đ</span>
      </div>
      <div class="flex justify-between items-center text-spa-dark dark:text-white">
        <span class="flex items-center gap-1.5 font-medium">
          <span class="w-2 h-2 rounded-full bg-spa-sage"></span>
          <b>${targetUser.full_name || targetUser.name}</b> (Làm tiếp ${Math.max(0, targetMin - elapsedMin)} phút):
        </span>
        <span class="font-bold text-spa-sage font-mono">${p2Pct}% • ~${p2Comm.toLocaleString('vi-VN')} đ</span>
      </div>
    `;
  },

  /**
   * Xác nhận bàn giao ca cho KTV mới
   */
  async confirmHandover() {
    const selectEl = document.getElementById('modal-handover-staff-select');
    if (!selectEl || !selectEl.value) {
      alert('Vui lòng chọn KTV tiếp quản tour!');
      return;
    }

    const session = (window.PosState && window.PosState.currentLiveSession)
      || (typeof currentLiveSession !== 'undefined' ? currentLiveSession : null);
    if (!session) return;

    const users = (typeof StaffPrimary !== 'undefined') ? StaffPrimary.getUsersList() : [];
    const targetStaff = users.find(u => String(u.phone).replace(/[^0-9]/g, '') === String(selectEl.value).replace(/[^0-9]/g, ''));
    if (!targetStaff) return;

    if (!confirm(`Bạn có chắc chắn muốn bàn giao ca này cho KTV ${targetStaff.full_name || targetStaff.name} không?`)) return;

    const elapsedSec = Math.max(1, Math.floor((Date.now() - session.start_timestamp) / 1000));
    const elapsedMin = Math.floor(elapsedSec / 60);
    const targetMin = session.duration_target_min || 50;

    let p1Pct = 50;
    let p2Pct = 50;
    if (this.handoverSplitMode === 'timer') {
      p1Pct = Math.min(90, Math.max(10, Math.round((elapsedMin / targetMin) * 100)));
      p2Pct = 100 - p1Pct;
    }

    const prevStaffName = session.staff_1_name;
    const prevStaffPhone = session.staff_1_phone;

    // Cập nhật cấu trúc session bàn giao
    session.staff_1_name = targetStaff.full_name || targetStaff.name;
    session.staff_1_phone = targetStaff.phone;
    session.staff_1_id = targetStaff.staff_id || targetStaff.id;
    session.active_staff_phone = targetStaff.phone;
    session.is_handover = true;
    session.handover_from_name = prevStaffName;
    session.handover_from_phone = prevStaffPhone;
    session.handover_worked_min = elapsedMin;
    session.handover_split_mode = this.handoverSplitMode;

    session.staffs = [
      {
        phone: prevStaffPhone,
        name: prevStaffName,
        pct: p1Pct,
        worked_min: elapsedMin
      },
      {
        phone: targetStaff.phone,
        name: targetStaff.full_name || targetStaff.name,
        pct: p2Pct,
        joined_min: elapsedMin,
        is_takeover: true
      }
    ];

    // Bắn lên Firebase để máy KTV mới nhận tour ngay
    if (typeof fbSaveLiveSession === 'function') {
      await fbSaveLiveSession(session);
    }

    // Dọn dẹp tour trên máy của KTV hiện tại (vì đã bàn giao xong)
    localStorage.removeItem('selena_active_live_session');
    if (window.PosState) window.PosState.currentLiveSession = null;
    if (typeof currentLiveSession !== 'undefined') currentLiveSession = null;

    if (typeof LiveTimer !== 'undefined') {
      LiveTimer.stop();
    }

    this.close();

    // Quay về form tạo ca rảnh
    if (typeof PosScreen !== 'undefined' && PosScreen.renderLiveSessionUI) {
      PosScreen.renderLiveSessionUI();
    }

    // Làm mới giao diện Home
    if (typeof refreshLiveBeds === 'function') {
      refreshLiveBeds();
    }

    alert(`✅ Đã bàn giao ca thành công cho KTV ${targetStaff.full_name || targetStaff.name}!`);
  }
};

window.HandoverModal = HandoverModal;
