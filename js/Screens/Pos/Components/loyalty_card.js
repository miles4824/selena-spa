// =========================================================================
// COMPONENT: LOYALTY CARD (THẺ TÍCH ĐIỂM 10 LẦN, BANNER SINH NHẬT & VOUCHER)
// =========================================================================

const LoyaltyCard = {
  /**
   * Hiển thị thẻ tích điểm và thông tin ưu đãi khi nhận diện được khách quen
   */
  show(cust) {
    const card = document.getElementById('pos-customer-card');
    if (!card || !cust) return;

    const nameBadge = document.getElementById('pos-cust-name-badge');
    const visitsBadge = document.getElementById('pos-cust-visits-badge');
    const progressBar = document.getElementById('pos-cust-progress-bar');
    const expiryText = document.getElementById('pos-cust-cycle-expiry-text');
    const birthdayBanner = document.getElementById('pos-birthday-banner');
    const notesBox = document.getElementById('pos-cust-notes-box');
    const notesText = document.getElementById('pos-cust-notes-text');
    const voucherBanner = document.getElementById('pos-voucher-banner');
    const voucherCheckbox = document.getElementById('pos-use-voucher');

    const custName = cust.customer_name || cust.name || 'Khách quen';
    const visits = Number(cust.total_visits || cust.visits_count || 0) % 10;
    const progressPct = Math.min(100, Math.round((visits / 10) * 100));

    if (nameBadge) nameBadge.innerText = custName;
    if (visitsBadge) visitsBadge.innerText = `${visits} / 10 Lần gội`;
    if (progressBar) progressBar.style.width = `${progressPct}%`;

    // Hạn chót chu kỳ (nếu có)
    if (expiryText) {
      expiryText.innerText = cust.cycle_expiry ? `Hạn đến: ${cust.cycle_expiry}` : 'Chu kỳ 60 ngày';
    }

    // Kiểm tra sinh nhật trong tháng
    const currentMonth = new Date().getMonth() + 1;
    const birthMonth = Number(cust.birth_month || cust.birthday_month || 0);
    const isBirthdayMonth = (birthMonth > 0 && birthMonth === currentMonth);

    if (birthdayBanner) {
      if (isBirthdayMonth) {
        birthdayBanner.classList.remove('hidden');
      } else {
        birthdayBanner.classList.add('hidden');
      }
    }

    // Ghi chú sở thích
    const notes = cust.notes || cust.customer_notes || cust.preferences || '';
    if (notesBox && notesText) {
      if (notes) {
        notesText.innerText = notes;
        notesBox.classList.remove('hidden');
      } else {
        notesBox.classList.add('hidden');
      }
    }

    // Kiểm tra voucher
    const hasVoucher = Boolean(cust.has_voucher || cust.voucher_available || (cust.voucher_count && cust.voucher_count > 0));
    if (voucherBanner) {
      if (hasVoucher) {
        voucherBanner.classList.remove('hidden');
      } else {
        voucherBanner.classList.add('hidden');
      }
    }
    if (voucherCheckbox) {
      voucherCheckbox.checked = false;
    }

    card.classList.remove('hidden');
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  },

  /**
   * Ẩn thẻ khi không có khách quen
   */
  hide() {
    const card = document.getElementById('pos-customer-card');
    if (card) card.classList.add('hidden');

    const vCheck = document.getElementById('pos-use-voucher');
    if (vCheck) vCheck.checked = false;

    if (window.PosState) {
      window.PosState.useVoucher = false;
      window.PosState.isBirthdayApplied = false;
    }
  },

  /**
   * Bật/Tắt dùng voucher miễn phí
   */
  toggleVoucher(checked) {
    if (!window.PosState) window.PosState = {};
    window.PosState.useVoucher = Boolean(checked);

    if (typeof CartTotalBar !== 'undefined') {
      CartTotalBar.update(window.PosState.selectedCartItems);
    }
  },

  /**
   * Áp dụng giảm 20% sinh nhật
   */
  applyBirthdayDiscount() {
    if (!window.PosState) window.PosState = {};
    window.PosState.isBirthdayApplied = true;

    alert('🎂 Đã áp dụng ưu đãi giảm 20% tháng sinh nhật cho khách!');
    if (typeof CartTotalBar !== 'undefined') {
      CartTotalBar.update(window.PosState.selectedCartItems);
    }
  }
};

window.LoyaltyCard = LoyaltyCard;
