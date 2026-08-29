// =============================================================
// TAB 2: ADD - POS CHECKOUT & SERVICE SELECTION
// =============================================================
function initMenuUI() {
  const menu = getStored('menu', DEFAULT_MENU);
  const select = document.getElementById('pos-service-select');
  const quickContainer = document.getElementById('pos-quick-combos');

  select.innerHTML = menu.map(m => `
    <option value="${m.service_id}">${m.service_name} — ${m.price.toLocaleString('vi-VN')} đ (${m.duration_min}p)</option>
  `).join('');

  const pastelBgs = ['bg-[#FFF0EB] text-[#D35400] border-[#FCDFD7]', 'bg-[#E8F8F5] text-[#2E7D6D] border-[#B7EBDD]', 'bg-[#EBF5FB] text-[#2980B9] border-[#D4E6F1]', 'bg-[#F5EEF8] text-[#8E44AD] border-[#E8DAEF]'];
  quickContainer.innerHTML = menu.slice(0, 4).map((m, idx) => `
    <button type="button" onclick="selectQuickCombo('${m.service_id}')" class="px-3.5 py-2 rounded-2xl text-xs font-bold ${pastelBgs[idx % pastelBgs.length]} border transition cursor-pointer shadow-sm hover:scale-105">
      ${m.service_name.split('(')[0].trim()} (${Math.round(m.price/1000)}k)
    </button>
  `).join('');
}

function selectQuickCombo(id) {
  document.getElementById('pos-service-select').value = id;
  onSelectServiceChange();
}

function onSelectServiceChange() {
  selectedComboId = document.getElementById('pos-service-select').value;
  updatePOSCalculations();
}

function updatePOSStaffInfo() {
  document.getElementById('staff-pos-name').innerText = currentUser?.full_name || 'KTV';
  document.getElementById('staff-pos-avatar').innerText = (currentUser?.full_name || 'K').charAt(0);
  const rate = parsePercentage(currentUser?.commission_rate);
  const isFixed = currentUser?.salary_type === 'fixed' || currentUser?.salary_type === 'fixed_10pct';
  document.getElementById('staff-pos-model').innerText = `${rate}% Tour • ${isFixed ? 'Có lương cứng' : 'Thuần hoa hồng'}`;
  updatePOSCalculations();
}

function updatePOSCalculations() {
  const menu = getStored('menu', DEFAULT_MENU);
  const service = menu.find(m => m.service_id === selectedComboId) || menu[0];
  const rate = parsePercentage(currentUser?.commission_rate);
  let comm = Math.round(service.price * (rate / 100));
  document.getElementById('staff-pos-commission').innerText = '+' + comm.toLocaleString('vi-VN') + ' đ (' + rate + '%)';

  let finalPrice = useVoucher ? 0 : service.price;
  document.getElementById('pos-price-display').innerText = useVoucher ? '0 đ (Dùng Voucher)' : finalPrice.toLocaleString('vi-VN') + ' đ';
}

function onCustomerPhoneInput(val) {
  const rawInput = val.trim();
  const normInput = normalizePhone(rawInput);
  const card = document.getElementById('pos-customer-card');
  const customers = getStored('customers', DEFAULT_CUSTOMERS);

  if (rawInput.length >= 7) {
    const cust = customers.find(c => {
      const cNorm = normalizePhone(c.phone_number);
      return cNorm === normInput || 
             cNorm.endsWith(normInput) || 
             normInput.endsWith(cNorm) || 
             String(c.phone_number).includes(rawInput);
    });

    if (cust) {
      currentCustomer = cust;
      card.classList.remove('hidden');
      document.getElementById('pos-customer-name').value = cust.customer_name;
      document.getElementById('pos-cust-name-badge').innerText = cust.customer_name;
      document.getElementById('pos-cust-phone-badge').innerText = '(' + normalizePhone(cust.phone_number) + ')';
      document.getElementById('pos-cust-visits-badge').innerText = (cust.total_visits || 0) + ' / 10 Lần gội';
      document.getElementById('pos-cust-progress-bar').style.width = Math.min(100, ((cust.total_visits || 0) / 10) * 100) + '%';
      
      let noteText = cust.notes || '';
      if (noteText.includes('GMT') || noteText.includes('00:00:00')) {
        noteText = '';
      }
      if (noteText) {
        document.getElementById('pos-cust-notes-box').classList.remove('hidden');
        document.getElementById('pos-cust-notes-text').innerText = noteText;
      } else {
        document.getElementById('pos-cust-notes-box').classList.add('hidden');
      }

      if (cust.voucher_count > 0) {
        document.getElementById('pos-voucher-banner').classList.remove('hidden');
        document.getElementById('pos-voucher-text').innerText = 'Khách có ' + cust.voucher_count + ' Voucher Combo 1 miễn phí!';
      } else {
        document.getElementById('pos-voucher-banner').classList.add('hidden');
      }
    } else {
      currentCustomer = null;
      card.classList.add('hidden');
    }
  } else {
    currentCustomer = null;
    card.classList.add('hidden');
  }
}

function onVoucherToggle(checked) {
  useVoucher = checked;
  updatePOSCalculations();
}

function setPaymentMethod(method) {
  paymentMethod = method;
  const btnQR = document.getElementById('btn-pay-qr');
  const btnCash = document.getElementById('btn-pay-cash');
  const submitText = document.getElementById('pos-submit-btn-text');

  if (method === 'Chuyển khoản') {
    btnQR.className = 'p-4 rounded-2xl border bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B] font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition cursor-pointer';
    btnCash.className = 'p-4 rounded-2xl border bg-[#F7F2EC] border-[#EFE8DF] text-[#7E7272] hover:bg-[#FFF0EB] font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition cursor-pointer';
    submitText.innerText = 'Hiện Mã VietQR & Lưu Ca';
  } else {
    btnCash.className = 'p-4 rounded-2xl border bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B] font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition cursor-pointer';
    btnQR.className = 'p-4 rounded-2xl border bg-[#F7F2EC] border-[#EFE8DF] text-[#7E7272] hover:bg-[#FFF0EB] font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition cursor-pointer';
    submitText.innerText = 'Lưu Ca Gội Ngay (Tiền mặt)';
  }
  lucide.createIcons();
}

function submitPOSReceipt() {
  const menu = getStored('menu', DEFAULT_MENU);
  const service = menu.find(m => m.service_id === selectedComboId) || menu[0];
  const phone = document.getElementById('pos-customer-phone').value.trim();
  const name = document.getElementById('pos-customer-name').value.trim() || 'Khách vãng lai';
  const rate = parsePercentage(currentUser?.commission_rate);
  const commAmount = Math.round(service.price * (rate / 100));
  const finalPrice = useVoucher ? 0 : service.price;

  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  const receiptId = 'HD' + Date.now().toString().slice(-6);

  pendingReceipt = {
    receipt_id: receiptId,
    service_id: service.service_id,
    service_name: service.service_name,
    price: service.price,
    total_paid: finalPrice,
    commission_amount: commAmount,
    customer_phone: phone,
    customer_name: name,
    staff_phone: currentUser?.phone || '0799625591',
    staff_id: currentUser?.staff_id || 'KTV01',
    staff_name: currentUser?.full_name || 'KTV',
    payment_method: paymentMethod,
    is_voucher_used: useVoucher,
    date: dateStr,
    time: timeStr,
    created_at: dateStr + ' ' + timeStr
  };

  if (paymentMethod === 'Chuyển khoản' && finalPrice > 0) {
    showVietQRModal(pendingReceipt);
  } else {
    saveReceiptRecord(pendingReceipt);
  }
}

function saveReceiptRecord(receipt) {
  const receipts = getStored('receipts', []);
  receipts.unshift(receipt);
  setStored('receipts', receipts);

  if (receipt.customer_phone) {
    const customers = getStored('customers', DEFAULT_CUSTOMERS);
    const norm = normalizePhone(receipt.customer_phone);
    let cust = customers.find(c => normalizePhone(c.phone_number) === norm);
    if (cust) {
      if (receipt.is_voucher_used) {
        cust.voucher_count = Math.max(0, (cust.voucher_count || 1) - 1);
      } else {
        cust.total_visits = (cust.total_visits || 0) + 1;
        if (cust.total_visits >= 10) {
          cust.voucher_count = (cust.voucher_count || 0) + 1;
          cust.total_visits -= 10;
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          alert(`🎉 Chúc mừng! Khách hàng ${cust.customer_name} đã tích đủ 10 lần và nhận được 1 Voucher Combo 1 miễn phí!`);
        }
      }
      if (receipt.customer_name && receipt.customer_name !== 'Khách vãng lai') {
        cust.customer_name = receipt.customer_name;
      }
    } else {
      customers.push({
        phone_number: receipt.customer_phone,
        customer_name: receipt.customer_name,
        total_visits: receipt.is_voucher_used ? 0 : 1,
        voucher_count: 0,
        notes: ''
      });
    }
    setStored('customers', customers);
  }

  callGasApi('create_receipt', receipt);

  confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  alert(`✅ Đã lưu ca gội thành công!\n• Dịch vụ: ${receipt.service_name}\n• Khách hàng: ${receipt.customer_name}\n• Thu nhập KTV: +${receipt.commission_amount.toLocaleString('vi-VN')} đ`);

  document.getElementById('pos-customer-phone').value = '';
  document.getElementById('pos-customer-name').value = '';
  document.getElementById('pos-customer-card').classList.add('hidden');
  useVoucher = false;
  pendingReceipt = null;

  showView('history');
}
