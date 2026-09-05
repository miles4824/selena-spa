// =========================================================================
// COMPONENT: LIVE ACTIONS (NÚT HOÀN THÀNH TOUR & NÚT RỜI CA SỚM CHO KTV PHỤ)
// =========================================================================

const LiveActions = {
  /**
   * Cập nhật hiển thị nút bấm hành động tùy theo vai trò KTV chính hay phụ
   */
  updateButtons(session, currentUser) {
    const btnComplete = document.getElementById('btn-live-complete-tour');
    const btnLeaveEarly = document.getElementById('btn-live-leave-early');
    if (!btnComplete || !btnLeaveEarly || !session) return;

    const normalizePhone = (p) => String(p || '').replace(/[^0-9]/g, '');
    const myPhone = currentUser ? normalizePhone(currentUser.phone) : '';
    const isAdmin = currentUser ? (typeof isUserOwner === 'function' ? isUserOwner(currentUser) : (currentUser.role === 'admin' || currentUser.role === 'owner')) : false;

    const staffs = session.staffs || [
      { phone: session.staff_1_phone, name: session.staff_1_name, pct: 100 }
    ];

    const isKtvChinh = (staffs.length > 0 && normalizePhone(staffs[0].phone) === myPhone) || (normalizePhone(session.staff_1_phone) === myPhone);
    const myStaffEntry = staffs.find(s => normalizePhone(s.phone) === myPhone);
    const isKtvPhu = Boolean(!isKtvChinh && myStaffEntry);
    const alreadyLeft = myStaffEntry && myStaffEntry.left_early;

    if (isAdmin || isKtvChinh) {
      // KTV chính hoặc Chủ tiệm -> Luôn thấy nút xanh Hoàn Thành Tour
      btnComplete.classList.remove('hidden');
      btnLeaveEarly.classList.add('hidden');
    } else if (isKtvPhu) {
      // Đúng là KTV phụ trong ca -> Thấy nút Rời tour sớm
      btnComplete.classList.add('hidden');
      if (!alreadyLeft) {
        btnLeaveEarly.classList.remove('hidden');
      } else {
        btnLeaveEarly.classList.add('hidden');
      }
    } else {
      // Mặc định luôn hiện nút xanh Hoàn Thành Tour
      btnComplete.classList.remove('hidden');
      btnLeaveEarly.classList.add('hidden');
    }
  },

  /**
   * Bấm nút Hoàn thành tour -> Mở Modal thanh toán
   */
  onComplete() {
    if (typeof CheckoutModal !== 'undefined' && CheckoutModal.open) {
      const session = (window.PosState && window.PosState.currentLiveSession)
        || (typeof currentLiveSession !== 'undefined' ? currentLiveSession : null);
      CheckoutModal.open(session);
    }
  },

  /**
   * KTV phụ bấm Xong việc rời tour sớm
   */
  onLeaveEarly() {
    if (typeof SwapStaffModal !== 'undefined' && SwapStaffModal.open) {
      SwapStaffModal.open(true);
      return;
    }

    if (!confirm('Bạn đã hoàn thành phần việc hỗ trợ và muốn rời tour này sớm?')) return;

    const session = (window.PosState && window.PosState.currentLiveSession)
      || (typeof currentLiveSession !== 'undefined' ? currentLiveSession : null);
    if (!session) return;

    const myPhone = currentUser ? String(currentUser.phone || '').replace(/[^0-9]/g, '') : '';
    const elapsedMin = Math.floor(Math.max(0, (Date.now() - session.start_timestamp) / 1000) / 60);

    // Ghi nhận phút rời ca cho KTV phụ
    if (Array.isArray(session.extra_staff)) {
      const entry = session.extra_staff.find(s => String(s.phone).replace(/[^0-9]/g, '') === myPhone);
      if (entry) {
        entry.left_min = elapsedMin;
        entry.left_early = true;
      }
    }
    if (Array.isArray(session.staffs)) {
      const entry = session.staffs.find(s => String(s.phone).replace(/[^0-9]/g, '') === myPhone);
      if (entry) {
        entry.left_min = elapsedMin;
        entry.left_early = true;
      }
    }

    // Đẩy cập nhật lên Firebase
    if (typeof fbSaveLiveSession === 'function') {
      fbSaveLiveSession(session);
    }

    // KTV phụ thoát khỏi màn hình đếm số và quay lại form POS
    localStorage.removeItem('selena_active_live_session');
    if (window.PosState) window.PosState.currentLiveSession = null;
    if (typeof currentLiveSession !== 'undefined') currentLiveSession = null;

    if (typeof PosScreen !== 'undefined' && PosScreen.renderLiveSessionUI) {
      PosScreen.renderLiveSessionUI();
    }
  }
};

window.LiveActions = LiveActions;
