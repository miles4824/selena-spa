// =============================================================
// TAB 2: ADD - POS CHECKOUT, 2 KTV SELECTION & TIPS HANDLER
// =============================================================
let isStaff2Enabled = false;
let currentTipAmount = 0;

function initMenuUI() {
  const menu = getStored('menu', DEFAULT_MENU);
  const select = document.getElementById('pos-service-select');
  const quickContainer = document.getElementById('pos-quick-combos');
  if (!select) return;

  select.innerHTML = menu.map(m => `
    <option value="${m.service_id}">${m.service_name} — ${m.price.toLocaleString('vi-VN')} đ (${m.duration_min}p)</option>
  `).join('');

  const pastelBgs = [
    'bg-[#FFF0EB] text-[#D35400] border-[#FCDFD7]',
    'bg-[#E8F8F5] text-[#2E7D6D] border-[#B7EBDD]',
    'bg-[#EBF5FB] text-[#2980B9] border-[#D4E6F1]',
    'bg-[#F5EEF8] text-[#8E44AD] border-[#E8DAEF]'
  ];

  if (quickContainer) {
    quickContainer.innerHTML = menu.slice(0, 4).map((m, idx) => `
      <button type="button" onclick="selectQuickCombo('${m.service_id}')" class="px-3.5 py-2 rounded-2xl text-xs font-bold ${pastelBgs[idx % pastelBgs.length]} border transition cursor-pointer shadow-sm hover:scale-105">
        ${m.service_name.split('(')[0].trim()} (${Math.round(m.price/1000)}k)
      </button>
    `).join('');
  }
}

function selectQuickCombo(id) {
  const select = document.getElementById('pos-service-select');
  if (select) {
    select.value = id;
    onSelectServiceChange();
  }
}

function onSelectServiceChange() {
  const select = document.getElementById('pos-service-select');
  if (select) {
    selectedComboId = select.value;
    updatePOSCalculations();
  }
}

function updatePOSStaffInfo() {
  const users = getStored('users', DEFAULT_USERS);
  const staffList = users.filter(u => !isUserOwner(u));
  const s1Select = document.getElementById('pos-staff1-select');
  const s2Select = document.getElementById('pos-staff2-select');

  if (s1Select) {
    s1Select.innerHTML = users.map(u => `
      <option value="${u.phone}">${isUserOwner(u) ? '👑' : '💆'} ${u.full_name} (${u.staff_id || u.phone})</option>
    `).join('');
    if (currentUser) {
      s1Select.value = currentUser.phone;
    }
  }

  if (s2Select) {
    s2Select.innerHTML = staffList.map(u => `
      <option value="${u.phone}">💆 ${u.full_name} (${u.staff_id || u.phone})</option>
    `).join('');
    // Mặc định chọn người khác KTV 1 nếu có
    const otherStaff = staffList.find(u => normalizePhone(u.phone) !== normalizePhone(currentUser?.phone));
    if (otherStaff) s2Select.value = otherStaff.phone;
  }

  updatePOSCalculations();
}

function toggleSecondStaff() {
  isStaff2Enabled = !isStaff2Enabled;
  const box = document.getElementById('box-staff2-container');
  const btnText = document.getElementById('toggle-staff2-text');
  const btn = document.getElementById('btn-toggle-staff2');

  if (isStaff2Enabled) {
    box.classList.remove('hidden');
    btnText.innerText = 'Bỏ KTV 2';
    btn.className = 'px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition flex items-center gap-1.5 cursor-pointer shadow-sm';
  } else {
    box.classList.add('hidden');
    btnText.innerText = '+ Thêm KTV cùng làm';
    btn.className = 'px-3 py-1.5 rounded-full text-xs font-bold bg-white text-[#E58A7B] border border-[#FCDFD7] hover:bg-[#FFF0EB] transition flex items-center gap-1.5 cursor-pointer shadow-sm';
  }
  lucide.createIcons();
  updatePOSCalculations();
}

function onTipInputChange(val) {
  currentTipAmount = Math.max(0, Number(val) || 0);
  updatePOSCalculations();
}

function setQuickTip(amount) {
  currentTipAmount = amount;
  const input = document.getElementById('pos-tip-amount');
  if (input) input.value = amount > 0 ? amount : '';
  updatePOSCalculations();
}

function updatePOSCalculations() {
  const menu = getStored('menu', DEFAULT_MENU);
  const users = getStored('users', DEFAULT_USERS);
  const service = menu.find(m => m.service_id === selectedComboId) || menu[0];

  const s1Phone = document.getElementById('pos-staff1-select')?.value || currentUser?.phone;
  const s2Phone = document.getElementById('pos-staff2-select')?.value;

  const staff1 = users.find(u => normalizePhone(u.phone) === normalizePhone(s1Phone)) || currentUser;
  const staff2 = isStaff2Enabled ? users.find(u => normalizePhone(u.phone) === normalizePhone(s2Phone)) : null;

  const rate1 = parsePercentage(staff1?.commission_rate);
  const rate2 = staff2 ? parsePercentage(staff2?.commission_rate) : 0;

  // Tính tiền dịch vụ & hoa hồng
  let basePrice = useVoucher ? 0 : service.price;
  let totalComm = Math.round(service.price * (rate1 / 100));

  let comm1 = totalComm;
  let comm2 = 0;
  let tip1 = currentTipAmount;
  let tip2 = 0;

  if (isStaff2Enabled && staff2) {
    // Chia đôi 50/50 hoa hồng và tips
    comm1 = Math.round(totalComm / 2);
    comm2 = Math.round(service.price * (rate2 / 100) / 2);
    tip1 = Math.round(currentTipAmount / 2);
    tip2 = currentTipAmount - tip1;
  }

  // Cập nhật xem trước hoa hồng KTV 1 & KTV 2
  const p1El = document.getElementById('pos-staff1-comm-preview');
  if (p1El) {
    let totalEarning1 = comm1 + tip1;
    p1El.innerText = `+${totalEarning1.toLocaleString('vi-VN')} đ (Tour: ${comm1.toLocaleString('vi-VN')}${tip1 > 0 ? ` + Tip: ${tip1.toLocaleString('vi-VN')}` : ''})`;
  }

  const p2El = document.getElementById('pos-staff2-comm-preview');
  if (p2El && isStaff2Enabled) {
    let totalEarning2 = comm2 + tip2;
    p2El.innerText = `+${totalEarning2.toLocaleString('vi-VN')} đ (Tour: ${comm2.toLocaleString('vi-VN')}${tip2 > 0 ? ` + Tip: ${tip2.toLocaleString('vi-VN')}` : ''})`;
  }

  // Cập nhật tóm tắt thanh toán
  const sPriceEl = document.getElementById('pos-service-price-preview');
  const tPriceEl = document.getElementById('pos-tip-price-preview');
  const totPaidEl = document.getElementById('pos-total-paid-preview');

  if (sPriceEl) sPriceEl.innerText = useVoucher ? '0 đ (Dùng Voucher)' : service.price.toLocaleString('vi-VN') + ' đ';
  if (tPriceEl) tPriceEl.innerText = currentTipAmount.toLocaleString('vi-VN') + ' đ';
  if (totPaidEl) {
    let grandTotal = basePrice + currentTipAmount;
    totPaidEl.innerText = grandTotal.toLocaleString('vi-VN') + ' đ';
  }
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

  if (method === 'Chuyển khoản') {
    btnQR.className = 'p-4 rounded-2xl border bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B] font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition cursor-pointer';
    btnCash.className = 'p-4 rounded-2xl border bg-[#F7F2EC] border-[#EFE8DF] text-[#7E7272] hover:bg-[#FFF0EB] font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition cursor-pointer';
  } else {
    btnCash.className = 'p-4 rounded-2xl border bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B] font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition cursor-pointer';
    btnQR.className = 'p-4 rounded-2xl border bg-[#F7F2EC] border-[#EFE8DF] text-[#7E7272] hover:bg-[#FFF0EB] font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition cursor-pointer';
  }
  lucide.createIcons();
}

function submitPOSReceipt() {
  const menu = getStored('menu', DEFAULT_MENU);
  const users = getStored('users', DEFAULT_USERS);
  const service = menu.find(m => m.service_id === selectedComboId) || menu[0];

  const phone = document.getElementById('pos-customer-phone').value.trim();
  const name = document.getElementById('pos-customer-name').value.trim() || 'Khách vãng lai';

  const s1Phone = document.getElementById('pos-staff1-select')?.value || currentUser?.phone;
  const s2Phone = document.getElementById('pos-staff2-select')?.value;

  const staff1 = users.find(u => normalizePhone(u.phone) === normalizePhone(s1Phone)) || currentUser;
  const staff2 = isStaff2Enabled ? users.find(u => normalizePhone(u.phone) === normalizePhone(s2Phone)) : null;

  const rate1 = parsePercentage(staff1?.commission_rate);
  const rate2 = staff2 ? parsePercentage(staff2?.commission_rate) : 0;

  const totalComm = Math.round(service.price * (rate1 / 100));
  let comm1 = totalComm;
  let comm2 = 0;
  let tip1 = currentTipAmount;
  let tip2 = 0;

  if (isStaff2Enabled && staff2) {
    comm1 = Math.round(totalComm / 2);
    comm2 = Math.round(service.price * (rate2 / 100) / 2);
    tip1 = Math.round(currentTipAmount / 2);
    tip2 = currentTipAmount - tip1;
  }

  const finalPrice = useVoucher ? 0 : service.price;
  const grandTotal = finalPrice + currentTipAmount;

  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  const receiptId = 'HD' + Date.now().toString().slice(-6);

  const receipt = {
    receipt_id: receiptId,
    service_id: service.service_id,
    service_name: service.service_name,
    price: service.price,
    tip_amount: currentTipAmount,
    total_paid: grandTotal,
    customer_phone: phone,
    customer_name: name,
    
    // KTV 1
    staff_1_id: staff1?.staff_id || staff1?.phone || 'KTV01',
    staff_1_phone: staff1?.phone || '',
    staff_1_name: staff1?.full_name || 'KTV 1',
    staff_1_comm: comm1,
    staff_1_tip: tip1,

    // KTV 2 (Nếu có)
    has_staff_2: Boolean(isStaff2Enabled && staff2),
    staff_2_id: staff2?.staff_id || staff2?.phone || '',
    staff_2_phone: staff2?.phone || '',
    staff_2_name: staff2?.full_name || '',
    staff_2_comm: comm2,
    staff_2_tip: tip2,

    // Tương thích ngược
    staff_phone: staff1?.phone || '',
    staff_id: staff1?.staff_id || 'KTV01',
    staff_name: staff1?.full_name || 'KTV',
    commission_amount: comm1 + tip1,

    payment_method: paymentMethod,
    is_voucher_used: useVoucher,
    date: dateStr,
    time: timeStr,
    created_at: dateStr + ' ' + timeStr
  };

  saveReceiptRecord(receipt);
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
  
  let msg = `✅ Đã lưu ca gội thành công!\n• Dịch vụ: ${receipt.service_name}\n• Khách hàng: ${receipt.customer_name}`;
  if (receipt.tip_amount > 0) msg += `\n• Tiền Tips: +${receipt.tip_amount.toLocaleString('vi-VN')} đ`;
  msg += `\n• KTV 1 (${receipt.staff_1_name}): +${(receipt.staff_1_comm + receipt.staff_1_tip).toLocaleString('vi-VN')} đ`;
  if (receipt.has_staff_2) {
    msg += `\n• KTV 2 (${receipt.staff_2_name}): +${(receipt.staff_2_comm + receipt.staff_2_tip).toLocaleString('vi-VN')} đ`;
  }
  alert(msg);

  // Reset form
  document.getElementById('pos-customer-phone').value = '';
  document.getElementById('pos-customer-name').value = '';
  document.getElementById('pos-customer-card').classList.add('hidden');
  document.getElementById('pos-tip-amount').value = '';
  currentTipAmount = 0;
  useVoucher = false;
  if (isStaff2Enabled) toggleSecondStaff();

  showView('history');
}
