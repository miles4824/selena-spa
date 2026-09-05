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
    if (!modal) return;
    if (typeof closeModal === 'function') {
      closeModal(modal, () => {
        if (typeof showBottomNav === 'function') showBottomNav('pos');
      });
    } else {
      modal.classList.add('hidden');
      if (typeof showBottomNav === 'function') showBottomNav('pos');
    }
  },

  setSplitMode(mode) {
    this.handoverSplitMode = mode;
    this.updateSplitButtons();
    this.updatePreview();
  },

  updateSplitButtons() {
    if (typeof CommissionSplit !== 'undefined') {
      CommissionSplit.updateButtonsUI({ prefix: 'handover', activeMode: this.handoverSplitMode });
      return;
    }
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
    const currentStaffName = session.staff_1_name || 'KTV hiện tại';
    const targetStaffName = targetUser.full_name || targetUser.name || 'KTV mới';

    if (typeof CommissionSplit !== 'undefined' && CommissionSplit.calculate) {
      const calcResult = CommissionSplit.calculate({
        staffs: [
          { name: currentStaffName, workedMinutes: elapsedMin, phone: session.staff_1_phone },
          { name: targetStaffName, phone: targetPhone }
        ],
        totalPrice,
        targetMin,
        mode: this.handoverSplitMode || 'timer',
        isHandover: true
      });
      listEl.innerHTML = CommissionSplit.renderSummaryListHTML(calcResult.items);
      return;
    }

    // Fallback nếu không có CommissionSplit
    const estTotalComm = Math.round(totalPrice * 0.1);
    let p1Pct = 50;
    let p2Pct = 50;
    if (this.handoverSplitMode === 'timer') {
      p1Pct = Math.min(90, Math.max(10, Math.round((elapsedMin / targetMin) * 100)));
      p2Pct = 100 - p1Pct;
    }
    const p1Comm = Math.round(estTotalComm * (p1Pct / 100));
    const p2Comm = estTotalComm - p1Comm;

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
          <b>${targetStaffName}</b> (Làm tiếp ${Math.max(0, targetMin - elapsedMin)} phút):
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
    if (typeof CommissionSplit !== 'undefined' && CommissionSplit.calculate) {
      const calcResult = CommissionSplit.calculate({
        staffs: [
          { name: session.staff_1_name, workedMinutes: elapsedMin, phone: session.staff_1_phone },
          { name: targetStaff.full_name || targetStaff.name, phone: targetStaff.phone }
        ],
        totalPrice: session.price || 0,
        targetMin,
        mode: this.handoverSplitMode || 'timer',
        isHandover: true
      });
      if (calcResult.items && calcResult.items.length >= 2) {
        p1Pct = calcResult.items[0].pct;
        p2Pct = calcResult.items[1].pct;
      }
    } else if (this.handoverSplitMode === 'timer') {
      p1Pct = Math.min(90, Math.max(10, Math.round((elapsedMin / targetMin) * 100)));
      p2Pct = 100 - p1Pct;
    }

    const prevStaffName = session.staff_1_name;
    const prevStaffPhone = session.staff_1_phone;
    const prevStaffId = session.staff_1_id;

    // Cập nhật cấu trúc session bàn giao: KTV mới tiếp quản
    session.staff_1_name = targetStaff.full_name || targetStaff.name;
    session.staff_1_phone = targetStaff.phone;
    session.staff_1_id = targetStaff.staff_id || targetStaff.id;
    session.active_staff_phone = targetStaff.phone;
    session.is_handover = true;
    session.handover_from_name = prevStaffName;
    session.handover_from_phone = prevStaffPhone;
    session.handover_from_id = prevStaffId;
    session.handover_worked_min = elapsedMin;
    session.handover_split_mode = this.handoverSplitMode;

    const normPrevPhone = (typeof normalizePhone === 'function')
      ? normalizePhone(prevStaffPhone)
      : String(prevStaffPhone || '').replace(/[^0-9]/g, '');

    // Giữ lại các KTV phụ khác nếu có trong tour (loại bỏ người vừa bàn giao)
    const otherStaffs = (session.staffs || []).filter(s => {
      if (!s) return false;
      const sPhone = (typeof normalizePhone === 'function') ? normalizePhone(s.phone) : String(s.phone || '').replace(/[^0-9]/g, '');
      return sPhone !== normPrevPhone;
    });

    // Người bàn giao được đánh dấu rõ ràng là đã bàn giao / rời ca xong
    session.staffs = [
      {
        phone: prevStaffPhone,
        name: prevStaffName,
        staff_id: prevStaffId || 'KTV01',
        pct: p1Pct,
        worked_min: elapsedMin,
        left_early: true,
        is_handed_over: true,
        is_handover_from: true,
        left_min: elapsedMin
      },
      {
        phone: targetStaff.phone,
        name: targetStaff.full_name || targetStaff.name,
        staff_id: targetStaff.staff_id || targetStaff.id,
        pct: p2Pct,
        joined_min: elapsedMin,
        is_takeover: true
      },
      ...otherStaffs
    ];

    // Ghi nhận session này vào danh sách đã bàn giao trên thiết bị này để tránh Firebase sync ngược lại
    const sId = String(session.session_id || session.start_timestamp || '');
    try {
      const handedList = JSON.parse(localStorage.getItem('selena_handed_over_sessions') || '[]');
      if (sId && !handedList.includes(sId)) {
        handedList.push(sId);
        localStorage.setItem('selena_handed_over_sessions', JSON.stringify(handedList));
      }
    } catch (e) {}

    // Bắn lên Firebase để máy KTV mới nhận tour ngay
    if (typeof fbSaveLiveSession === 'function') {
      await fbSaveLiveSession(session);
    }

    // Dọn dẹp dứt điểm tour trên máy vừa thực hiện bàn giao
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
