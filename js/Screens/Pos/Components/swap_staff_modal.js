// =========================================================================
// COMPONENT: SWAP STAFF MODAL (ĐIỀU CHỈNH / ĐỔI / THÊM KTV GIỮA CA GỘI)
// Chuẩn phong cách mô-đun hóa, hỗ trợ KTV rời tour sớm & chia hoa hồng linh hoạt
// =========================================================================

const SwapStaffModal = {
  tempSwapStaffs: [],
  currentSplitMode: 'timer',

  /**
   * Mở modal điều chỉnh KTV
   * @param {boolean} isLeaveEarlyMode - Mở ở chế độ rời ca sớm cho KTV phụ
   */
  open(isLeaveEarlyMode = false) {
    const session = (window.PosState && window.PosState.currentLiveSession)
      || (typeof currentLiveSession !== 'undefined' ? currentLiveSession : null);
    if (!session) {
      alert('Không tìm thấy ca tour đang chạy!');
      return;
    }

    const cUser = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : null;
    const myPhone = (cUser && cUser.phone) ? String(cUser.phone).replace(/[^0-9]/g, '') : '';
    const myId = (cUser && (cUser.staff_id || cUser.user_id)) ? String(cUser.staff_id || cUser.user_id).trim() : '';
    const isOwner = cUser ? (typeof isUserOwner === 'function' ? isUserOwner(cUser) : (cUser.role === 'admin' || cUser.role === 'owner')) : false;
    const targetMin = session.duration_target_min || 50;

    // Sao chép danh sách staffs hiện tại vào tempSwapStaffs
    const baseStaffs = (session.staffs && session.staffs.length > 0)
      ? session.staffs
      : [
          {
            phone: session.staff_1_phone,
            name: session.staff_1_name,
            pct: 100,
            joined_min: 0,
            staff_id: session.staff_1_id || 'KTV01'
          }
        ];

    this.tempSwapStaffs = baseStaffs.map(s => {
      const copy = { ...s };
      if (!copy.left_early) {
        copy.left_min = (copy.left_min && copy.left_min < targetMin) ? copy.left_min : targetMin;
      }
      return copy;
    });

    if (isLeaveEarlyMode) {
      const elapsedSec = Math.max(0, Math.floor((Date.now() - session.start_timestamp) / 1000));
      const currentElapsedMin = Math.max(1, Math.min(targetMin, Math.floor(elapsedSec / 60) + (elapsedSec % 60 >= 30 ? 1 : 0)));
      const myStaff = this.tempSwapStaffs.find(s => String(s.phone).replace(/[^0-9]/g, '') === myPhone);
      if (myStaff) {
        myStaff.left_early = true;
        myStaff.left_min = Math.max((myStaff.joined_min || 0) + 1, currentElapsedMin);
      }
    }

    const firstStaff = this.tempSwapStaffs[0];
    const isMainStaff = firstStaff && (
      (firstStaff.phone && String(firstStaff.phone).replace(/[^0-9]/g, '') === myPhone) ||
      (firstStaff.staff_id && String(firstStaff.staff_id).trim() === myId) ||
      (session.staff_1_phone && String(session.staff_1_phone).replace(/[^0-9]/g, '') === myPhone)
    );
    const isPhu = !isMainStaff && !isOwner;

    // Cập nhật tiêu đề và nút bấm theo role
    const titleTextEl = document.getElementById('swap-modal-title-text');
    const submitBtn = document.getElementById('btn-swap-modal-submit');
    const submitTextEl = document.getElementById('btn-swap-modal-submit-text');

    if (isLeaveEarlyMode || isPhu) {
      if (titleTextEl) titleTextEl.innerText = 'Xác Nhận Rời Tour Sớm';
      if (submitTextEl) submitTextEl.innerText = 'Xác Nhận Rời Tour';
      if (submitBtn) {
        submitBtn.onclick = () => this.confirmStaffLeaveTourEarly();
      }
    } else {
      if (titleTextEl) titleTextEl.innerText = 'Điều Chỉnh KTV Tour Này';
      if (submitTextEl) submitTextEl.innerText = 'Lưu Thay Đổi Phân Chia';
      if (submitBtn) {
        submitBtn.onclick = () => this.saveSettings();
      }
    }

    const hasEarlyLeave = this.tempSwapStaffs.some(s => s.left_early || (s.left_min && s.left_min < targetMin));
    const hasNewMidwayStaff = this.tempSwapStaffs.some(s => s.is_midway);

    if (isLeaveEarlyMode || hasEarlyLeave || hasNewMidwayStaff || session.split_mode === 'timer') {
      this.currentSplitMode = 'timer';
    } else if ((session.initial_staff_count || 1) >= 2) {
      this.currentSplitMode = 'equal';
    } else {
      this.currentSplitMode = this.tempSwapStaffs.length > 1 ? 'timer' : 'equal';
    }

    this.renderStaffUI();
    this.updateSplitButtonsUI();
    this.updateSummaryPreview();

    const modal = document.getElementById('modal-swap-staff');
    if (typeof hideBottomNav === 'function') hideBottomNav();
    if (modal) modal.classList.remove('hidden');
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  },

  close() {
    const modal = document.getElementById('modal-swap-staff');
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

  setSplitMode(mode) {
    this.currentSplitMode = mode;
    this.updateSplitButtonsUI();
    this.updateSummaryPreview();
  },

  updateSplitButtonsUI() {
    if (typeof CommissionSplit !== 'undefined') {
      CommissionSplit.updateButtonsUI({
        prefix: 'split',
        activeMode: this.currentSplitMode,
        disabled: this.tempSwapStaffs.length <= 1
      });
      return;
    }
    const btnTimer = document.getElementById('btn-split-timer');
    const btnHalf = document.getElementById('btn-split-half');
    if (!btnTimer || !btnHalf) return;

    const count = this.tempSwapStaffs.length;
    if (count <= 1) {
      btnTimer.disabled = true;
      btnHalf.disabled = true;
      btnTimer.className = 'p-3 rounded-2xl border bg-spa-bg/50 border-spa-border text-spa-muted text-xs flex flex-col items-center gap-1 cursor-not-allowed opacity-60';
      btnHalf.className = 'p-3 rounded-2xl border bg-spa-bg/50 border-spa-border text-spa-muted text-xs flex flex-col items-center gap-1 cursor-not-allowed opacity-60';
      return;
    }

    btnTimer.disabled = false;
    btnHalf.disabled = false;

    if (this.currentSplitMode === 'timer') {
      btnTimer.className = 'p-3 rounded-2xl border bg-spa-brand/10 border-spa-brand text-spa-brand font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition shadow-xs';
      btnHalf.className = 'p-3 rounded-2xl border bg-spa-bg dark:bg-spa-dark/40 border-spa-border text-spa-muted hover:bg-spa-brand/5 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition';
    } else {
      btnHalf.className = 'p-3 rounded-2xl border bg-spa-brand/10 border-spa-brand text-spa-brand font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition shadow-xs';
      btnTimer.className = 'p-3 rounded-2xl border bg-spa-bg dark:bg-spa-dark/40 border-spa-border text-spa-muted hover:bg-spa-brand/5 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition';
    }
  },

  renderStaffUI() {
    const container = document.getElementById('swap-modal-staff-container');
    const addBtn = document.getElementById('btn-swap-add-staff');
    if (!container) return;

    const users = (typeof StaffPrimary !== 'undefined') ? StaffPrimary.getUsersList() : [];
    const cUser = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : null;
    const myPhone = (cUser && cUser.phone) ? String(cUser.phone).replace(/[^0-9]/g, '') : '';
    const myId = (cUser && (cUser.staff_id || cUser.user_id)) ? String(cUser.staff_id || cUser.user_id).trim() : '';
    const isOwner = cUser ? (typeof isUserOwner === 'function' ? isUserOwner(cUser) : (cUser.role === 'admin' || cUser.role === 'owner')) : false;

    const firstStaff = this.tempSwapStaffs[0];
    const isMainStaff = firstStaff && (
      (firstStaff.phone && String(firstStaff.phone).replace(/[^0-9]/g, '') === myPhone) ||
      (firstStaff.staff_id && String(firstStaff.staff_id).trim() === myId)
    );
    const canEdit = Boolean(isOwner || isMainStaff);

    const session = (window.PosState && window.PosState.currentLiveSession)
      || (typeof currentLiveSession !== 'undefined' ? currentLiveSession : null);
    const targetMin = session?.duration_target_min || 50;

    const elapsedSec = Math.max(0, Math.floor((Date.now() - (session?.start_timestamp || Date.now())) / 1000));
    const currentElapsedMin = Math.max(1, Math.min(targetMin, Math.floor(elapsedSec / 60) + (elapsedSec % 60 >= 30 ? 1 : 0)));

    let html = this.tempSwapStaffs.map((item, idx) => {
      const isFirst = idx === 0;
      const isMe = String(item.phone || '').replace(/[^0-9]/g, '') === myPhone;

      if (item.left_early) {
        return `
          <div class="p-3.5 rounded-2xl bg-spa-bg/80 dark:bg-white/5 border border-spa-border space-y-1.5">
            <div class="flex justify-between items-center text-xs">
              <div class="flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                <span class="font-bold text-spa-dark dark:text-white">${item.name}</span>
                <span class="text-spa-muted text-[11px] font-mono">(Phút ${item.joined_min || 0} ➔ ${item.left_min} - Rời sớm)</span>
              </div>
              ${canEdit ? `
                <button type="button" onclick="SwapStaffModal.restoreStaff(${idx})" class="text-xs text-spa-brand hover:underline font-bold cursor-pointer">
                  Hoàn tác
                </button>
              ` : ''}
            </div>
          </div>
        `;
      }

      // Danh sách KTV có thể chọn
      const usedPhones = this.tempSwapStaffs.filter((s, i) => i !== idx && !s.left_early).map(s => String(s.phone).replace(/[^0-9]/g, ''));
      const selectable = users.filter(u => {
        const uPhone = String(u.phone).replace(/[^0-9]/g, '');
        if (uPhone === String(item.phone).replace(/[^0-9]/g, '')) return true;
        if (usedPhones.includes(uPhone)) return false;
        return true;
      });

      const joinedMin = item.joined_min || 0;
      const isWantsEarly = Boolean(item.wants_early_leave);
      const leftMin = item.left_min !== undefined ? item.left_min : targetMin;
      item.left_min = leftMin;

      return `
        <div class="relative p-3.5 rounded-2xl bg-spa-bg/60 dark:bg-spa-dark/40 border border-spa-border space-y-2.5">
          <div class="flex justify-between items-center ${(!isFirst && canEdit) ? 'pr-7' : ''}">
            <div class="text-xs font-bold text-spa-dark dark:text-white flex items-center gap-1.5">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black ${isFirst ? 'bg-spa-brand/10 text-spa-brand' : 'bg-spa-sage/10 text-spa-sage'}">
                ${isFirst ? 'KTV 1 (Chính)' : `KTV ${idx + 1} (Phụ)`}
              </span>
              <span class="text-sm font-bold text-spa-dark dark:text-white">${item.name || ''}</span>
            </div>
            <span class="text-xs font-extrabold text-spa-sage font-mono bg-spa-sage/10 px-2 py-0.5 rounded-full" id="swap-item-pct-${idx}">
              ${item.pct || 0}%
            </span>
          </div>

          ${(!isFirst && canEdit) ? `
            <select onchange="SwapStaffModal.onStaffSelectChange(${idx}, this.value)" class="w-full bg-white dark:bg-spa-card border border-spa-border rounded-xl p-2.5 text-xs font-bold text-spa-dark dark:text-white focus:outline-none focus:border-spa-brand cursor-pointer">
              ${selectable.map(u => `
                <option value="${u.phone}" ${String(u.phone).replace(/[^0-9]/g, '') === String(item.phone).replace(/[^0-9]/g, '') ? 'selected' : ''}>
                  ${u.full_name || u.name}
                </option>
              `).join('')}
            </select>
          ` : ''}

          ${!isFirst ? `
            <div class="pt-1.5 border-t border-spa-border/60 space-y-2 text-xs">
              <div class="flex items-center justify-between gap-2 flex-wrap">
                <div class="flex items-center gap-1.5 font-mono">
                  <span class="text-spa-muted text-[11px]">⏱️ Phút:</span>
                  ${canEdit ? `
                    <input type="number" min="0" max="${targetMin - 1}" value="${joinedMin}" onchange="SwapStaffModal.onJoinedMinChange(${idx}, this.value)" class="w-12 text-center bg-white dark:bg-spa-card border border-spa-border rounded-lg p-1 text-xs font-bold text-spa-dark dark:text-white">
                  ` : `<span class="font-bold">${joinedMin}</span>`}
                  <span class="text-spa-muted">➔</span>
                  ${canEdit ? `
                    <input type="number" min="${joinedMin + 1}" max="${targetMin}" value="${leftMin}" onchange="SwapStaffModal.onLeftMinChange(${idx}, this.value)" class="w-12 text-center bg-white dark:bg-spa-card border border-spa-border rounded-lg p-1 text-xs font-bold text-spa-brand">
                  ` : `<span class="font-bold text-spa-brand">${leftMin}</span>`}
                  <span class="text-spa-muted text-[10px]">/ ${targetMin}p</span>
                </div>

                ${(canEdit || isMe) ? `
                  <label class="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold text-spa-muted select-none">
                    <input type="checkbox" ${isWantsEarly ? 'checked' : ''} onchange="SwapStaffModal.toggleEarlyLeave(${idx}, this.checked)" class="w-4 h-4 accent-spa-brand rounded cursor-pointer">
                    <span class="${isWantsEarly ? 'text-spa-brand' : ''}">Rời sớm</span>
                  </label>
                ` : ''}
              </div>

              ${(isWantsEarly && (canEdit || isMe)) ? `
                ${typeof AppButton === 'function' ? AppButton({
                  text: `Xác nhận KTV ${item.name} xong việc rời ca`,
                  icon: "log-out",
                  iconPosition: "left",
                  variant: "dashDanger",
                  size: "md",
                  onClick: `SwapStaffModal.triggerEarlyLeave(${idx})`,
                  customClass: "w-full font-bold text-xs",
                }) : `
                  <button type="button" onclick="SwapStaffModal.triggerEarlyLeave(${idx})" class="w-full py-2.5 px-3 rounded-full border border-dashed border-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-98">
                    <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
                    <span>Xác nhận KTV ${item.name} xong việc rời ca</span>
                  </button>
                `}
              ` : ''}
            </div>

            ${canEdit ? `
              <button type="button" onclick="SwapStaffModal.removeStaff(${idx})" title="Xóa KTV này khỏi tour" class="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white dark:bg-spa-card border border-rose-200 dark:border-rose-900/50 text-rose-500 hover:bg-rose-50 flex items-center justify-center cursor-pointer active:scale-90 transition shadow-2xs z-10">
                <i data-lucide="x" class="w-3.5 h-3.5"></i>
              </button>
            ` : ''}
          ` : ''}
        </div>
      `;
    }).join('');

    container.innerHTML = html;

    if (addBtn) {
      if (!canEdit) {
        addBtn.classList.add('hidden');
      } else {
        const activePhones = this.tempSwapStaffs.filter(s => !s.left_early).map(s => String(s.phone).replace(/[^0-9]/g, ''));
        if (activePhones.length >= users.length) {
          addBtn.classList.add('hidden');
        } else {
          addBtn.classList.remove('hidden');
        }
      }
    }

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  },

  updateSummaryPreview() {
    const listEl = document.getElementById('swap-summary-pct-list');
    if (!listEl) return;

    const session = (window.PosState && window.PosState.currentLiveSession)
      || (typeof currentLiveSession !== 'undefined' ? currentLiveSession : null);
    const targetMin = session?.duration_target_min || 50;
    const totalPrice = session?.price || 0;

    // Tính % hoa hồng theo mode
    const activeStaffs = this.tempSwapStaffs.filter(s => !s.left_early);
    const totalCount = activeStaffs.length || 1;

    if (this.currentSplitMode === 'equal' || totalCount === 1) {
      const eachPct = Math.round(100 / totalCount);
      this.tempSwapStaffs.forEach(s => {
        if (s.left_early) {
          s.pct = 0;
        } else {
          s.pct = eachPct;
        }
      });
    } else {
      // Tính theo số phút làm việc
      let totalWorkedMinutes = 0;
      this.tempSwapStaffs.forEach(s => {
        const j = s.joined_min || 0;
        const l = s.left_min || targetMin;
        const worked = Math.max(1, l - j);
        s.workedMinutes = worked;
        totalWorkedMinutes += worked;
      });

      let allocatedPct = 0;
      this.tempSwapStaffs.forEach((s, idx) => {
        if (idx === this.tempSwapStaffs.length - 1) {
          s.pct = Math.max(0, 100 - allocatedPct);
        } else {
          s.pct = Math.round((s.workedMinutes / totalWorkedMinutes) * 100);
          allocatedPct += s.pct;
        }
      });
    }

    // Cập nhật badge trên từng thẻ
    this.tempSwapStaffs.forEach((s, idx) => {
      const badge = document.getElementById(`swap-item-pct-${idx}`);
      if (badge) badge.innerText = `${s.pct}%`;
    });

    // Cập nhật tóm tắt
    if (typeof CommissionSplit !== 'undefined') {
      const summaryItems = this.tempSwapStaffs.map((s, idx) => {
        const commVnd = Math.round((totalPrice * 0.1) * (s.pct / 100)); // Ước lượng 10%
        let subtext = '';
        if (s.left_early) {
          subtext = `Rời ca lúc ${s.left_min || targetMin}p`;
        } else if (s.joined_min && s.joined_min > 0) {
          subtext = `Vào lúc ${s.joined_min}p`;
        } else {
          subtext = `Làm từ đầu`;
        }
        return {
          name: s.name,
          subtext: subtext,
          pct: s.pct,
          amountVnd: commVnd,
          dotColor: idx === 0 ? 'bg-spa-brand' : 'bg-spa-sage',
          textColor: idx === 0 ? 'text-spa-brand' : 'text-spa-sage'
        };
      });
      listEl.innerHTML = CommissionSplit.renderSummaryListHTML(summaryItems);
      return;
    }

    let summaryHtml = this.tempSwapStaffs.map(s => {
      const commVnd = Math.round((totalPrice * 0.1) * (s.pct / 100)); // Ước lượng 10%
      return `
        <div class="flex justify-between items-center text-xs">
          <span class="font-bold text-spa-dark dark:text-white">• ${s.name}:</span>
          <span class="font-mono font-extrabold text-spa-sage">${s.pct}% (~${commVnd.toLocaleString('vi-VN')} đ)</span>
        </div>
      `;
    }).join('');

    listEl.innerHTML = summaryHtml;
  },

  onStaffSelectChange(idx, newPhone) {
    const users = (typeof StaffPrimary !== 'undefined') ? StaffPrimary.getUsersList() : [];
    const target = users.find(u => String(u.phone).replace(/[^0-9]/g, '') === String(newPhone).replace(/[^0-9]/g, ''));
    if (!target) return;

    if (this.tempSwapStaffs[idx]) {
      this.tempSwapStaffs[idx].phone = target.phone;
      this.tempSwapStaffs[idx].name = target.full_name || target.name;
      this.tempSwapStaffs[idx].staff_id = target.staff_id || target.id;
    }
    this.renderStaffUI();
    this.updateSummaryPreview();
  },

  onJoinedMinChange(idx, val) {
    if (this.tempSwapStaffs[idx]) {
      this.tempSwapStaffs[idx].joined_min = Math.max(0, parseInt(val) || 0);
    }
    this.updateSummaryPreview();
  },

  onLeftMinChange(idx, val) {
    if (this.tempSwapStaffs[idx]) {
      this.tempSwapStaffs[idx].left_min = Math.max(1, parseInt(val) || 1);
    }
    this.updateSummaryPreview();
  },

  toggleEarlyLeave(idx, isChecked) {
    const session = (window.PosState && window.PosState.currentLiveSession)
      || (typeof currentLiveSession !== 'undefined' ? currentLiveSession : null);
    const targetMin = session?.duration_target_min || 50;

    if (this.tempSwapStaffs[idx]) {
      this.tempSwapStaffs[idx].wants_early_leave = isChecked;
      if (!isChecked) {
        // Trả lại số phút làm việc tròn cả tour khi uncheck
        this.tempSwapStaffs[idx].left_min = targetMin;
      } else {
        const elapsedSec = Math.max(0, Math.floor((Date.now() - (session?.start_timestamp || Date.now())) / 1000));
        const currentElapsedMin = Math.max(1, Math.min(targetMin, Math.floor(elapsedSec / 60) + (elapsedSec % 60 >= 30 ? 1 : 0)));
        this.tempSwapStaffs[idx].left_min = currentElapsedMin;
      }
    }
    this.renderStaffUI();
    this.updateSummaryPreview();
  },

  triggerEarlyLeave(idx) {
    const staff = this.tempSwapStaffs[idx];
    if (!staff) return;

    if (!confirm(`Xác nhận cho KTV ${staff.name} xong việc rời tour sớm?`)) return;

    staff.left_early = true;
    staff.wants_early_leave = false;
    this.renderStaffUI();
    this.updateSummaryPreview();
  },

  restoreStaff(idx) {
    const session = (window.PosState && window.PosState.currentLiveSession)
      || (typeof currentLiveSession !== 'undefined' ? currentLiveSession : null);
    const targetMin = session?.duration_target_min || 50;

    if (this.tempSwapStaffs[idx]) {
      this.tempSwapStaffs[idx].left_early = false;
      this.tempSwapStaffs[idx].wants_early_leave = false;
      this.tempSwapStaffs[idx].left_min = targetMin;
    }
    this.renderStaffUI();
    this.updateSummaryPreview();
  },

  addStaff() {
    const users = (typeof StaffPrimary !== 'undefined') ? StaffPrimary.getUsersList() : [];
    const activePhones = this.tempSwapStaffs.filter(s => !s.left_early).map(s => String(s.phone).replace(/[^0-9]/g, ''));
    const available = users.filter(u => !activePhones.includes(String(u.phone).replace(/[^0-9]/g, '')));

    if (available.length === 0) {
      alert('Không còn KTV nào khác để thêm!');
      return;
    }

    const session = (window.PosState && window.PosState.currentLiveSession)
      || (typeof currentLiveSession !== 'undefined' ? currentLiveSession : null);
    const targetMin = session?.duration_target_min || 50;
    const elapsedSec = Math.max(0, Math.floor((Date.now() - (session?.start_timestamp || Date.now())) / 1000));
    const currentElapsedMin = Math.max(1, Math.min(targetMin, Math.floor(elapsedSec / 60)));

    const nextStaff = available[0];
    this.tempSwapStaffs.push({
      phone: nextStaff.phone,
      name: nextStaff.full_name || nextStaff.name,
      staff_id: nextStaff.staff_id || nextStaff.id,
      joined_min: currentElapsedMin,
      left_min: targetMin,
      is_midway: true,
      pct: 0
    });

    this.currentSplitMode = 'timer';
    this.renderStaffUI();
    this.updateSplitButtonsUI();
    this.updateSummaryPreview();
  },

  removeStaff(idx) {
    if (idx <= 0) return;
    this.tempSwapStaffs.splice(idx, 1);
    this.renderStaffUI();
    this.updateSplitButtonsUI();
    this.updateSummaryPreview();
  },

  saveSettings() {
    const session = (window.PosState && window.PosState.currentLiveSession)
      || (typeof currentLiveSession !== 'undefined' ? currentLiveSession : null);
    if (!session || this.tempSwapStaffs.length === 0) return;

    this.updateSummaryPreview();

    session.staffs = this.tempSwapStaffs.map(s => ({ ...s }));
    session.split_mode = this.currentSplitMode;

    const s1 = this.tempSwapStaffs[0];
    session.staff_1_phone = s1.phone;
    session.staff_1_name = s1.name;
    session.staff_1_pct = s1.pct;

    // Cập nhật extra_staff cho tương thích ngược
    session.extra_staff = this.tempSwapStaffs.slice(1).map(s => ({
      phone: s.phone,
      name: s.name,
      id: s.staff_id,
      pct: s.pct,
      left_early: s.left_early
    }));

    localStorage.setItem('selena_active_live_session', JSON.stringify(session));

    // Bắn lên Firebase Realtime Database
    if (typeof fbSaveLiveSession === 'function') {
      fbSaveLiveSession(session);
    }

    this.close();

    if (typeof LiveHeader !== 'undefined') {
      LiveHeader.update(session);
    }

    if (typeof LiveActions !== 'undefined') {
      LiveActions.updateButtons(session, currentUser);
    }

    alert('✅ Đã lưu phân chia KTV và đồng bộ thành công!');
  },

  confirmStaffLeaveTourEarly() {
    const session = (window.PosState && window.PosState.currentLiveSession)
      || (typeof currentLiveSession !== 'undefined' ? currentLiveSession : null);
    if (!session) return;

    const cUser = (typeof currentUser !== 'undefined' && currentUser) ? currentUser : null;
    const myPhone = (cUser && cUser.phone) ? String(cUser.phone).replace(/[^0-9]/g, '') : '';

    const myEntry = (this.tempSwapStaffs || []).find(s => String(s.phone).replace(/[^0-9]/g, '') === myPhone);
    if (!myEntry) {
      alert('Không tìm thấy thông tin KTV của bạn trong tour này!');
      return;
    }

    if (!confirm('Bạn có chắc chắn đã xong phần việc và muốn rời tour sớm?')) return;

    this.recalcPercentages();
    session.staffs = this.tempSwapStaffs.map(s => ({ ...s }));
    session.split_mode = 'timer';

    const s1 = this.tempSwapStaffs[0];
    session.staff_1_phone = s1.phone;
    session.staff_1_name = s1.name;
    session.staff_1_pct = s1.pct;

    session.extra_staff = this.tempSwapStaffs.slice(1).map(s => ({
      phone: s.phone,
      name: s.name,
      id: s.staff_id,
      pct: s.pct,
      left_early: s.left_early,
      left_min: s.left_min
    }));

    if (typeof fbSaveLiveSession === 'function') {
      fbSaveLiveSession(session);
    }

    this.close();

    // Đối với KTV phụ rời ca sớm: Thoát khỏi màn hình live về form rảnh
    if (typeof PosScreen !== 'undefined') {
      window.PosState.currentLiveSession = null;
      if (typeof currentLiveSession !== 'undefined') currentLiveSession = null;
      localStorage.removeItem('selena_active_live_session');
      PosScreen.renderLiveSessionUI();
    }

    alert('✅ Bạn đã hoàn thành việc và rời ca tour thành công!');
  }
};

window.SwapStaffModal = SwapStaffModal;
