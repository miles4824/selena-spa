// =========================================================================
// COMPONENT: CHECKOUT MODAL (MODAL THANH TOÁN 2 PHA VÀ ẢNH QR VIB TĨNH)
// =========================================================================

const CheckoutModal = {
  paymentMethod: 'Chuyển khoản',
  staffTipMap: {},

  /**
   * Mở modal thanh toán với thông tin phiên tour
   */
  open(session) {
    if (!session) return;
    const modal = document.getElementById('modal-checkout');
    if (!modal) return;

    this.staffTipMap = {};
    this.paymentMethod = 'Chuyển khoản';

    // Đưa về Pha 1 (Khách xem)
    const stepCust = document.getElementById('checkout-step-customer');
    const stepStaff = document.getElementById('checkout-step-staff');
    if (stepCust) stepCust.classList.remove('hidden');
    if (stepStaff) stepStaff.classList.add('hidden');

    // Điền dữ liệu tóm tắt vào Pha 1
    const nameEl = document.getElementById('chk-service-name');
    const priceEl = document.getElementById('chk-service-price');
    const timeEl = document.getElementById('chk-time-range');
    const custEl = document.getElementById('chk-customer-name');

    if (nameEl) nameEl.innerText = session.service_name || 'Tour Gội';
    if (priceEl) {
      const price = Number(session.price || session.payable_price || 0);
      priceEl.innerText = (typeof PosService !== 'undefined')
        ? PosService.formatCurrency(price)
        : `${price.toLocaleString('vi-VN')} đ`;
    }

    if (timeEl) {
      const now = new Date();
      const endTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const dur = session.duration_target_min || session.duration_min || 50;
      timeEl.innerText = `${session.start_time || 'Bắt đầu'} - ${endTime} (${dur} phút)`;
    }

    if (custEl) {
      custEl.innerText = session.customer_name || 'Khách vãng lai';
    }

    this.setPaymentMethod('Chuyển khoản');

    if (typeof hideBottomNav === 'function') hideBottomNav();
    modal.classList.remove('hidden');
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  },

  close() {
    const modal = document.getElementById('modal-checkout');
    if (modal) modal.classList.add('hidden');
    if (typeof showBottomNav === 'function') showBottomNav();
  },

  /**
   * Chọn phương thức: Chuyển khoản (hiện QR tĩnh) hoặc Tiền mặt (ẩn QR tĩnh)
   */
  setPaymentMethod(method) {
    this.paymentMethod = method;
    const btnQr = document.getElementById('chk-btn-qr');
    const btnCash = document.getElementById('chk-btn-cash');
    const qrBox = document.getElementById('chk-qr-display-box');

    if (method === 'Chuyển khoản') {
      if (btnQr) {
        btnQr.className = 'p-3.5 rounded-2xl border bg-spa-brand/10 border-spa-brand text-spa-brand font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs';
      }
      if (btnCash) {
        btnCash.className = 'p-3.5 rounded-2xl border bg-spa-bg border-spa-border text-spa-dark/70 hover:bg-spa-brand/10 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer';
      }
      if (qrBox) qrBox.classList.remove('hidden');
    } else {
      if (btnQr) {
        btnQr.className = 'p-3.5 rounded-2xl border bg-spa-bg border-spa-border text-spa-dark/70 hover:bg-spa-brand/10 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer';
      }
      if (btnCash) {
        btnCash.className = 'p-3.5 rounded-2xl border bg-spa-brand/10 border-spa-brand text-spa-brand font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs';
      }
      if (qrBox) qrBox.classList.add('hidden');
    }

    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  },

  /**
   * Chuyển sang Pha 2 (Màn hình riêng cho KTV nhập Tip)
   */
  goToStaffStep() {
    const stepCust = document.getElementById('checkout-step-customer');
    const stepStaff = document.getElementById('checkout-step-staff');
    if (stepCust) stepCust.classList.add('hidden');
    if (stepStaff) stepStaff.classList.remove('hidden');

    const session = (window.PosState && window.PosState.currentLiveSession)
      || (typeof currentLiveSession !== 'undefined' ? currentLiveSession : null);

    const priceEl = document.getElementById('staff-step-service-price');
    const payMethodEl = document.getElementById('staff-step-pay-method');

    if (priceEl && session) {
      const p = Number(session.price || 0);
      priceEl.innerText = (typeof PosService !== 'undefined') ? PosService.formatCurrency(p) : `${p.toLocaleString('vi-VN')} đ`;
    }
    if (payMethodEl) {
      payMethodEl.innerText = this.paymentMethod;
    }

    this.renderDynamicTipInputs(session);
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  },

  backToCustomerStep() {
    const stepCust = document.getElementById('checkout-step-customer');
    const stepStaff = document.getElementById('checkout-step-staff');
    if (stepCust) stepCust.classList.remove('hidden');
    if (stepStaff) stepStaff.classList.add('hidden');
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  },

  /**
   * Render các ô nhập tiền Tips cho từng KTV tham gia ca
   */
  renderDynamicTipInputs(session) {
    const container = document.getElementById('checkout-dynamic-tips-container');
    if (!container || !session) return;

    const staffs = session.staffs || [
      { phone: session.staff_1_phone, name: session.staff_1_name, pct: 100 }
    ];
    if (Array.isArray(session.extra_staff)) {
      session.extra_staff.forEach(s => {
        if (!staffs.some(x => x.phone === s.phone)) {
          staffs.push({ phone: s.phone, name: s.name, pct: Math.round(100 / (1 + session.extra_staff.length)) });
        }
      });
    }

    const quickAmounts = [0, 10000, 20000, 50000, 100000];

    container.innerHTML = staffs.map((s, idx) => {
      const sPhone = s.phone;
      const currentTip = this.staffTipMap[sPhone] || 0;

      return `
        <div class="p-3.5 rounded-2xl bg-spa-brand/5 border border-spa-brand/20 space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-xs font-extrabold text-spa-brand flex items-center gap-1">
              <span class="text-spa-dark">${idx === 0 ? 'Chính' : 'Phụ'}:</span>
              <span>${s.name}</span>
            </span>
          </div>

          <div class="relative">
            <input type="number" 
              id="chk-tip-input-${sPhone}" 
              value="${currentTip || ''}" 
              oninput="CheckoutModal.onTipInput('${sPhone}', this.value)" 
              placeholder="0" 
              class="w-full bg-white border border-spa-border rounded-xl p-3 pr-10 text-spa-dark font-extrabold text-base focus:outline-none focus:border-spa-brand font-mono text-right">
            <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-spa-dark/40 pointer-events-none">đ</span>
          </div>

          <div class="flex flex-wrap gap-1.5 pt-0.5">
            ${quickAmounts.map(amt => `
              <button type="button" 
                onclick="CheckoutModal.setQuickTip('${sPhone}', ${amt})" 
                class="px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${amt === 0 ? 'bg-white text-spa-dark/70 border border-spa-border' : 'bg-spa-brand/10 text-spa-brand border border-spa-brand/30 hover:bg-spa-brand/20'} transition active:scale-95 cursor-pointer">
                ${amt === 0 ? '0 đ' : `+${amt >= 1000 ? (amt/1000) + 'k' : amt}`}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  },

  onTipInput(phone, val) {
    this.staffTipMap[phone] = Number(val) || 0;
  },

  setQuickTip(phone, amount) {
    this.staffTipMap[phone] = Number(amount) || 0;
    const input = document.getElementById(`chk-tip-input-${phone}`);
    if (input) {
      input.value = amount > 0 ? amount : '';
    }
  },

  /**
   * Xác nhận hoàn tất ca và đóng tour, đồng bộ vào LocalStorage, Firebase và Google Sheets
   */
  async confirmFinish() {
    const session = (window.PosState && window.PosState.currentLiveSession)
      || (typeof currentLiveSession !== 'undefined' ? currentLiveSession : null);
    if (!session) return;

    // 1. Tổng hợp tiền tips từng KTV
    let totalTips = 0;
    Object.values(this.staffTipMap).forEach(amt => {
      totalTips += Number(amt) || 0;
    });

    const now = new Date();
    const endTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const elapsedMin = Math.floor(Math.max(0, (Date.now() - (session.start_timestamp || Date.now())) / 1000) / 60);
    const dateStr = now.toISOString().slice(0, 10);
    const dateFormatted = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
    const createdAtStr = `${dateFormatted} - ${endTimeStr}`;

    const tourPrice = Number(session.price || session.payable_price || 0);
    const grandTotal = tourPrice + totalTips;

    // 2. Chuẩn hóa danh sách KTV tham gia ca
    const baseStaffs = (session.staffs && session.staffs.length > 0)
      ? session.staffs
      : [
          {
            phone: session.staff_1_phone,
            name: session.staff_1_name,
            staff_id: session.staff_1_id || 'KTV01',
            role: 'KTV Chính',
            pct: 100
          }
        ];

    const mappedStaffs = baseStaffs.map((st, idx) => {
      const p = st.phone || '';
      const tipVnd = Number(this.staffTipMap[p] || 0);
      const pct = Number(st.pct) || Math.round(100 / baseStaffs.length);
      const commVnd = (st.comm_vnd !== undefined && st.comm_vnd !== null)
        ? Number(st.comm_vnd)
        : Math.round(tourPrice * 0.1 * (pct / 100));

      return {
        ...st,
        phone: p,
        name: st.name || `KTV ${idx + 1}`,
        staff_id: st.staff_id || `KTV0${idx + 1}`,
        role: st.role || (idx === 0 ? 'KTV Chính' : 'KTV Phụ'),
        pct: pct,
        comm_vnd: commVnd,
        tip_vnd: tipVnd
      };
    });

    const s1 = mappedStaffs[0] || {};
    const s2 = mappedStaffs[1] || null;
    const s3 = mappedStaffs[2] || null;

    // 3. Giải mã số điện thoại thật của khách hàng
    const currentCustomer = (window.PosState && window.PosState.currentCustomer) || null;
    let customerPhone = (currentCustomer && (currentCustomer.phone_number || currentCustomer.raw_phone))
      || (window.PosState && window.PosState.customerPhone)
      || session.customer_phone
      || '';

    if (typeof PhoneService !== 'undefined' && PhoneService.normalize) {
      customerPhone = PhoneService.normalize(customerPhone);
    } else {
      customerPhone = String(customerPhone).replace(/[^0-9]/g, '');
    }

    const receiptId = 'HD' + Date.now().toString().slice(-6);

    // 4. Tạo đối tượng Receipt chuẩn cho Google Sheets & Firebase
    const receipt = {
      receipt_id: receiptId,
      service_id: session.service_id || 'CB01',
      service_name: session.service_name || 'Combo 1',
      price: tourPrice,
      tip_amount: totalTips,
      total_paid: grandTotal,
      customer_phone: customerPhone,
      customer_name: session.customer_name || (customerPhone ? 'Khách hàng' : 'Khách vãng lai'),
      birth_month: session.birth_month || 0,
      birthday: session.birth_month ? Number(session.birth_month) : (session.birthday || ''),

      staff_1_user_id: s1.phone || '',
      staff_1_id: s1.staff_id || 'KTV01',
      staff_1_phone: s1.phone || '',
      staff_names: mappedStaffs.map(s => s.name).join(', '),
      staff_1_name: s1.name || 'KTV',
      staff_1_comm: s1.comm_vnd || 0,
      staff_1_tip: s1.tip_vnd || 0,
      staff_1_pct: s1.pct || 100,

      has_staff_2: Boolean(s2),
      staff_2_user_id: s2 ? s2.phone : '-',
      staff_2_id: s2 ? s2.staff_id : '-',
      staff_2_phone: s2 ? s2.phone : '-',
      staff_2_name: s2 ? s2.name : '-',
      staff_2_comm: s2 ? s2.comm_vnd : 0,
      staff_2_tip: s2 ? s2.tip_vnd : 0,
      staff_2_pct: s2 ? s2.pct : 0,

      has_staff_3: Boolean(s3),
      staff_3_user_id: s3 ? s3.phone : '-',
      staff_3_id: s3 ? s3.staff_id : '-',
      staff_3_phone: s3 ? s3.phone : '-',
      staff_3_name: s3 ? s3.name : '-',
      staff_3_comm: s3 ? s3.comm_vnd : 0,
      staff_3_tip: s3 ? s3.tip_vnd : 0,
      staff_3_pct: s3 ? s3.pct : 0,

      staffs: mappedStaffs,

      staff_phone: s1.phone || '',
      staff_id: s1.staff_id || 'KTV01',
      staff_name: s1.name || 'KTV',
      commission_amount: (s1.comm_vnd || 0) + (s1.tip_vnd || 0),

      start_time: session.start_time,
      end_time: endTimeStr,
      duration_min: Math.max(1, elapsedMin || Number(session.duration_target_min) || 45),
      time: endTimeStr,

      payment_method: this.paymentMethod,
      is_voucher_used: Boolean(session.use_voucher),
      date: dateStr,
      created_at: createdAtStr
    };

    // 5. Lưu vào LocalStorage: receipts
    const receipts = (typeof getStored === 'function') ? getStored('receipts', []) : [];
    receipts.unshift(receipt);
    if (typeof setStored === 'function') setStored('receipts', receipts);

    // 6. Lưu vào LocalStorage: payroll_logs
    const payrollLogs = (typeof getStored === 'function') ? getStored('payroll_logs', []) : [];
    const newReceiptLogs = mappedStaffs.map(st => ({
      receipt_id: receiptId,
      date: receipt.date,
      time: receipt.end_time || receipt.start_time,
      customer_name: receipt.customer_name || 'Khách vãng lai',
      customer_phone: receipt.customer_phone || '',
      service_name: receipt.service_name,
      staff_name: st.name,
      staff_phone: st.phone,
      staff_id: st.staff_id || 'KTV',
      role_in_tour: st.role || 'KTV',
      commission_pct: st.pct,
      commission_amount: st.comm_vnd,
      tip_amount: st.tip_vnd,
      total_earned: (st.comm_vnd || 0) + (st.tip_vnd || 0),
      payment_method: receipt.payment_method,
      created_at: receipt.created_at
    }));
    payrollLogs.unshift(...newReceiptLogs);
    if (typeof setStored === 'function') setStored('payroll_logs', payrollLogs);

    // 7. Cập nhật tích điểm khách hàng nếu có SĐT
    if (receipt.customer_phone) {
      const customers = (typeof getStored === 'function') ? getStored('customers', []) : [];
      const normPhone = receipt.customer_phone;
      let cust = customers.find(c => {
        const p = String(c.phone_number || c.raw_phone || '').replace(/[^0-9]/g, '');
        return p === normPhone;
      });
      if (cust) {
        if (receipt.is_voucher_used) {
          cust.voucher_count = Math.max(0, (cust.voucher_count || 1) - 1);
        } else {
          cust.total_visits = (cust.total_visits || 0) + 1;
          if (cust.total_visits >= 10) {
            cust.voucher_count = (cust.voucher_count || 0) + 1;
            cust.total_visits -= 10;
          }
        }
        if (typeof setStored === 'function') setStored('customers', customers);
      }
    }

    // 8. Đẩy siêu tốc lên Firebase Realtime Database (0.03s)
    if (typeof fbSaveReceipt === 'function') {
      fbSaveReceipt(receipt, currentCustomer);
    }

    // 9. ĐỒNG BỘ LÊN GOOGLE SHEETS QUA GAS API
    if (typeof callGasApi === 'function') {
      callGasApi('create_receipt', receipt).catch(err => {
        console.warn('Lỗi ghi Sheets bất đồng bộ:', err);
      });
    }

    // 10. Đóng popup thanh toán
    this.close();

    // 11. Dừng và dọn dẹp triệt để session tour
    if (typeof PosScreen !== 'undefined' && PosScreen.stopLiveTour) {
      PosScreen.stopLiveTour(false);
    } else {
      if (typeof markSessionDismissed === 'function') markSessionDismissed(session);
      if (typeof fbClearLiveSession === 'function') fbClearLiveSession(session.session_id);
      localStorage.removeItem('selena_active_live_session');
      if (window.PosState) window.PosState.currentLiveSession = null;
      if (typeof currentLiveSession !== 'undefined') currentLiveSession = null;
      if (typeof LiveTimer !== 'undefined') LiveTimer.stop();
      if (typeof refreshLiveBeds === 'function') refreshLiveBeds();
    }

    // 12. Reset lại giỏ hàng và form thông tin khách về mặc định
    if (window.PosState) {
      window.PosState.extraStaffList = [];
      window.PosState.currentCustomer = null;
      window.PosState.customerPhone = '';
      window.PosState.useVoucher = false;
    }
    const custPhone = document.getElementById('pos-customer-phone');
    if (custPhone) custPhone.value = '';
    const custName = document.getElementById('pos-customer-name');
    if (custName) custName.value = '';
    const custCard = document.getElementById('pos-customer-card');
    if (custCard) custCard.classList.add('hidden');

    if (typeof PosScreen !== 'undefined') {
      PosScreen.initDefaultCart();
      PosScreen.renderLiveSessionUI();
    }

    // Thông báo chi tiết
    let msg = `🎉 ĐÃ HOÀN TẤT VÀ LƯU HÓA ĐƠN TOUR GỘI!
• Thời gian: ${receipt.start_time} - ${receipt.end_time} (${receipt.duration_min} phút)
• Tổng thu: ${grandTotal.toLocaleString('vi-VN')} đ (${this.paymentMethod})`;
    if (totalTips > 0) msg += `\n• Tips: +${totalTips.toLocaleString('vi-VN')} đ`;
    mappedStaffs.forEach(st => {
      msg += `\n• ${st.name} (${st.role}): Tour +${st.comm_vnd.toLocaleString('vi-VN')} đ${st.tip_vnd > 0 ? ` | Tip +${st.tip_vnd.toLocaleString('vi-VN')} đ` : ''}`;
    });
    alert(msg);
  }
};

window.CheckoutModal = CheckoutModal;
