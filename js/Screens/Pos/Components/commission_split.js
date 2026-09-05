// =========================================================================
// COMPONENT: COMMISSION SPLIT (HÌNH THỨC PHÂN CHIA HOA HỒNG & TÓM TẮT DỰ KIẾN)
// Dùng chung cho: Modal Bàn Giao Tour (handover) & Modal Điều Chỉnh KTV (swap-staff)
// Chuẩn phong cách Mindora Luxury, đồng bộ 100% UI và hiển thị
// =========================================================================

const CommissionSplit = {
  /**
   * Render HTML cụm 2 nút chọn hình thức phân chia hoa hồng
   * @param {Object} options
   * @param {string} options.prefix - Tiền tố id ('handover' | 'split')
   * @param {string} options.activeMode - 'timer' | 'equal'
   * @param {string} options.onSelectFn - Tên hàm gọi khi click, vd: "HandoverModal.setSplitMode"
   * @param {boolean} [options.disabled=false]
   * @param {string} [options.equalSubtext='Chia đều hoa hồng tour']
   */
  renderSelector({ prefix, activeMode = 'timer', onSelectFn, disabled = false, equalSubtext = 'Chia đều hoa hồng tour' }) {
    const isTimer = activeMode === 'timer';

    const activeClass = 'p-3 rounded-2xl border bg-spa-brand/10 border-spa-brand text-spa-brand font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition shadow-xs';
    const inactiveClass = 'p-3 rounded-2xl border bg-spa-bg dark:bg-spa-dark/40 border-spa-border text-spa-muted hover:bg-spa-brand/5 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition';
    const disabledClass = 'p-3 rounded-2xl border bg-spa-bg/50 border-spa-border text-spa-muted text-xs flex flex-col items-center gap-1 cursor-not-allowed opacity-60';

    const timerCls = disabled ? disabledClass : (isTimer ? activeClass : inactiveClass);
    const equalCls = disabled ? disabledClass : (!isTimer ? activeClass : inactiveClass);
    const disAttr = disabled ? 'disabled' : '';

    return `
      <div class="space-y-2 pt-1 text-left" style="text-align: left !important;">
        <label class="block text-xs font-bold text-spa-muted uppercase tracking-wider text-left">Hình Thức Phân Chia Hoa Hồng:</label>
        <div class="grid grid-cols-2 gap-2.5">
          <button type="button" id="btn-${prefix}-timer" ${disAttr} onclick="${onSelectFn}('timer')" class="${timerCls}">
            <span class="flex items-center gap-1 font-extrabold"><i data-lucide="clock" class="w-3.5 h-3.5"></i> Theo thời gian thực</span>
            <span class="text-[10px] font-normal text-spa-muted">Tính theo số phút đã làm</span>
          </button>
          <button type="button" id="btn-${prefix}-equal" ${disAttr} onclick="${onSelectFn}('equal')" class="${equalCls}">
            <span class="flex items-center gap-1 font-extrabold"><i data-lucide="handshake" class="w-3.5 h-3.5"></i> Chia đều 50 / 50</span>
            <span class="text-[10px] font-normal text-spa-muted">${equalSubtext}</span>
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Cập nhật style active/inactive của 2 nút bấm mà không cần render lại DOM
   */
  updateButtonsUI({ prefix, activeMode = 'timer', disabled = false }) {
    const btnTimer = document.getElementById(`btn-${prefix}-timer`);
    const btnEqual = document.getElementById(`btn-${prefix}-equal`) || document.getElementById(`btn-${prefix}-half`);
    if (!btnTimer || !btnEqual) return;

    if (disabled) {
      btnTimer.disabled = true;
      btnEqual.disabled = true;
      btnTimer.className = 'p-3 rounded-2xl border bg-spa-bg/50 border-spa-border text-spa-muted text-xs flex flex-col items-center gap-1 cursor-not-allowed opacity-60';
      btnEqual.className = 'p-3 rounded-2xl border bg-spa-bg/50 border-spa-border text-spa-muted text-xs flex flex-col items-center gap-1 cursor-not-allowed opacity-60';
      return;
    }

    btnTimer.disabled = false;
    btnEqual.disabled = false;

    if (activeMode === 'timer') {
      btnTimer.className = 'p-3 rounded-2xl border bg-spa-brand/10 border-spa-brand text-spa-brand font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition shadow-xs';
      btnEqual.className = 'p-3 rounded-2xl border bg-spa-bg dark:bg-spa-dark/40 border-spa-border text-spa-muted hover:bg-spa-brand/5 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition';
    } else {
      btnEqual.className = 'p-3 rounded-2xl border bg-spa-brand/10 border-spa-brand text-spa-brand font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition shadow-xs';
      btnTimer.className = 'p-3 rounded-2xl border bg-spa-bg dark:bg-spa-dark/40 border-spa-border text-spa-muted hover:bg-spa-brand/5 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition';
    }
  },

  /**
   * Render khung bao tóm tắt dự kiến
   * @param {Object} options
   * @param {string} options.listId - ID thẻ chứa danh sách
   * @param {string} [options.title='Dự kiến phân bổ hoa hồng tour:']
   */
  renderSummaryContainer({ listId, title = 'Dự kiến phân bổ hoa hồng tour:' }) {
    return `
      <div class="p-3.5 rounded-2xl bg-spa-bg dark:bg-white/5 border border-spa-border text-xs space-y-2 text-left" style="text-align: left !important;">
        <span class="font-bold text-spa-muted block pb-1 border-b border-spa-border text-left">${title}</span>
        <div id="${listId}" class="space-y-1.5 text-left"></div>
      </div>
    `;
  },

  /**
   * Render danh sách tóm tắt từng KTV chuẩn giao diện Mindora Luxury
   * @param {Array<Object>} items
   * item schema: { name: string, subtext?: string, pct: number, amountVnd: number, dotColor?: string, textColor?: string }
   */
  renderSummaryListHTML(items = []) {
    if (!Array.isArray(items) || items.length === 0) {
      return '<div class="text-xs text-spa-muted italic">Chưa có thông tin phân chia</div>';
    }

    return items.map((item, idx) => {
      const dotColor = item.dotColor || (idx === 0 ? 'bg-spa-brand' : 'bg-spa-sage');
      const textColor = item.textColor || (idx === 0 ? 'text-spa-brand' : 'text-spa-sage');
      const amountStr = Number(item.amountVnd || 0).toLocaleString('vi-VN');
      const sub = item.subtext ? ` (${item.subtext})` : '';

      return `
        <div class="flex justify-between items-center text-spa-dark dark:text-white text-xs">
          <span class="flex items-center gap-1.5 font-medium truncate pr-2">
            <span class="w-2 h-2 rounded-full ${dotColor} shrink-0"></span>
            <b class="truncate">${item.name}</b>${sub}:
          </span>
          <span class="font-bold ${textColor} font-mono shrink-0 text-right">${item.pct}% • ~${amountStr} đ</span>
        </div>
      `;
    }).join('');
  },

  /**
   * CỖ MÁY TÍNH TOÁN HOA HỒNG & PHẦN TRĂM DÙNG CHUNG (SINGLE SOURCE OF TRUTH)
   * @param {Object} params
   * @param {Array<Object>} params.staffs - Danh sách KTV
   * @param {number} params.totalPrice - Giá tour (đ)
   * @param {number} [params.targetMin=50] - Thời lượng tour dự kiến (phút)
   * @param {string} [params.mode='timer'] - 'timer' | 'equal'
   * @param {number} [params.commissionRate=0.1] - Tỷ lệ hoa hồng ước tính (mặc định 10%)
   * @param {boolean} [params.isHandover=false] - Cờ nhận biết ca bàn giao 2 người
   * @returns {{ estTotalComm: number, items: Array<Object> }}
   */
  calculate({
    staffs = [],
    totalPrice = 0,
    targetMin = 50,
    mode = 'timer',
    commissionRate = 0.1,
    isHandover = false
  } = {}) {
    const estTotalComm = Math.round((Number(totalPrice) || 0) * commissionRate);

    // TH 1: Ca Bàn Giao Tour (Chính xác 2 KTV: Người giao và Người nhận)
    if (isHandover && staffs.length >= 2) {
      const s1 = staffs[0];
      const s2 = staffs[1];
      const workedMin = Math.max(1, Math.min(targetMin, Number(s1.workedMinutes || 1)));
      const remainingMin = Math.max(0, targetMin - workedMin);

      let p1Pct = 50;
      let p2Pct = 50;

      if (mode === 'timer') {
        p1Pct = Math.min(90, Math.max(10, Math.round((workedMin / targetMin) * 100)));
        p2Pct = 100 - p1Pct;
      }

      const p1Comm = Math.round(estTotalComm * (p1Pct / 100));
      const p2Comm = estTotalComm - p1Comm;

      return {
        estTotalComm,
        items: [
          {
            name: s1.name || 'KTV hiện tại',
            phone: s1.phone || '',
            subtext: `Đã làm ${workedMin} phút`,
            workedMinutes: workedMin,
            pct: p1Pct,
            amountVnd: p1Comm,
            dotColor: 'bg-spa-brand',
            textColor: 'text-spa-brand'
          },
          {
            name: s2.name || 'KTV mới',
            phone: s2.phone || '',
            subtext: `Làm tiếp ${remainingMin} phút`,
            workedMinutes: remainingMin,
            pct: p2Pct,
            amountVnd: p2Comm,
            dotColor: 'bg-spa-sage',
            textColor: 'text-spa-sage'
          }
        ]
      };
    }

    // TH 2: Ca Điều Chỉnh KTV (1, 2, 3 đến 5 KTV)
    const activeStaffs = staffs.filter(s => !s.left_early);
    const totalActiveCount = activeStaffs.length || 1;

    let computedList = [];

    if (mode === 'equal' || totalActiveCount === 1) {
      const eachPct = Math.round(100 / totalActiveCount);
      let allocatedPct = 0;

      computedList = staffs.map((s, idx) => {
        let pct = 0;
        if (!s.left_early) {
          const isLastActive = (idx === staffs.length - 1) || (activeStaffs[activeStaffs.length - 1] === s);
          pct = isLastActive ? Math.max(0, 100 - allocatedPct) : eachPct;
          allocatedPct += pct;
        }

        let subtext = 'Làm từ đầu';
        if (s.left_early) {
          subtext = `Rời ca lúc ${s.left_min || targetMin}p`;
        } else if (s.joined_min && s.joined_min > 0) {
          subtext = `Vào lúc ${s.joined_min}p`;
        }

        const commVnd = Math.round(estTotalComm * (pct / 100));

        return {
          name: s.name || `KTV ${idx + 1}`,
          phone: s.phone || '',
          subtext,
          pct,
          amountVnd: commVnd,
          dotColor: idx === 0 ? 'bg-spa-brand' : 'bg-spa-sage',
          textColor: idx === 0 ? 'text-spa-brand' : 'text-spa-sage'
        };
      });
    } else {
      // Tính theo số phút làm việc
      let totalWorkedMinutes = 0;
      const workedList = staffs.map(s => {
        const j = Number(s.joined_min) || 0;
        const l = s.left_early ? (Number(s.left_min) || targetMin) : (Number(s.left_min) || targetMin);
        const worked = Math.max(1, l - j);
        totalWorkedMinutes += worked;
        return { ...s, workedMinutes: worked };
      });

      let allocatedPct = 0;
      computedList = workedList.map((s, idx) => {
        let pct = 0;
        if (idx === workedList.length - 1) {
          pct = Math.max(0, 100 - allocatedPct);
        } else {
          pct = Math.round((s.workedMinutes / totalWorkedMinutes) * 100);
          allocatedPct += pct;
        }

        let subtext = `Làm ${s.workedMinutes}p`;
        if (s.left_early) {
          subtext = `Rời ca lúc ${s.left_min || targetMin}p (${s.workedMinutes}p)`;
        } else if (s.joined_min && s.joined_min > 0) {
          subtext = `Vào lúc ${s.joined_min}p (${s.workedMinutes}p)`;
        }

        const commVnd = Math.round(estTotalComm * (pct / 100));

        return {
          name: s.name || `KTV ${idx + 1}`,
          phone: s.phone || '',
          subtext,
          pct,
          amountVnd: commVnd,
          dotColor: idx === 0 ? 'bg-spa-brand' : 'bg-spa-sage',
          textColor: idx === 0 ? 'text-spa-brand' : 'text-spa-sage'
        };
      });
    }

    return {
      estTotalComm,
      items: computedList
    };
  }
};

window.CommissionSplit = CommissionSplit;
