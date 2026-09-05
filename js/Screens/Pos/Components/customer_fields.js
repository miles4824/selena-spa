// =========================================================================
// COMPONENT: CUSTOMER FIELDS (Ô TÊN KHÁCH HÀNG & THÁNG SINH INLINE)
// =========================================================================

const CustomerFields = {
  /**
   * Áp dụng thông tin khách hàng đã chọn vào ô Tên và Tháng sinh
   */
  applyCustomer(cust, isOwner = false) {
    const nameInput = document.getElementById('pos-customer-name');
    const monthSelect = document.getElementById('pos-birth-month');

    const custName = cust ? (cust.customer_name || cust.name || '') : '';
    const birthMonth = cust ? (cust.birth_month || cust.birthday_month || '') : '';

    if (nameInput) {
      nameInput.value = custName;
      // Quy tắc bảo vệ tên: Nếu khách đã có tên chính thức -> Khoá không cho Staff sửa
      const isOfficial = custName && custName.toLowerCase() !== 'khách vãng lai';
      if (isOfficial && !isOwner) {
        nameInput.disabled = true;
        nameInput.classList.add('bg-spa-bg/80', 'text-spa-dark/80');
      } else {
        nameInput.disabled = false;
        nameInput.classList.remove('bg-spa-bg/80', 'text-spa-dark/80');
      }
    }

    if (monthSelect) {
      monthSelect.value = birthMonth ? String(birthMonth) : '';
      monthSelect.style.color = monthSelect.value ? 'var(--color-spa-dark, #2D2424)' : '#A39696';
    }
  },

  /**
   * Reset ô Tên và Tháng sinh về trạng thái mở cho khách mới
   */
  reset() {
    const nameInput = document.getElementById('pos-customer-name');
    const monthSelect = document.getElementById('pos-birth-month');

    if (nameInput) {
      nameInput.value = '';
      nameInput.disabled = false;
      nameInput.classList.remove('bg-spa-bg/80', 'text-spa-dark/80');
    }

    if (monthSelect) {
      monthSelect.value = '';
      monthSelect.style.color = '#A39696';
    }
  },

  /**
   * Lấy giá trị hiện tại của tên và tháng sinh từ form
   */
  getValues() {
    const nameInput = document.getElementById('pos-customer-name');
    const monthSelect = document.getElementById('pos-birth-month');

    return {
      name: nameInput ? nameInput.value.trim() : '',
      birthMonth: monthSelect ? monthSelect.value : ''
    };
  }
};

window.CustomerFields = CustomerFields;
