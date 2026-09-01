// =============================================================
// TAB 1: HOME - DASHBOARD & STATS CONTROLLER
// =============================================================
function loadKTVHomeStats() {
  const receipts = getStored('receipts', []);
  const payrollLogs = getStored('payroll_logs', []);
  const todayStr = normalizeDateKey(new Date());
  const staffPhone = normalizePhone(currentUser?.phone);
  const staffCode = String(currentUser?.staff_id || '').trim();
  const myNameClean = (currentUser?.full_name || '').toLowerCase().replace('👑 ', '').replace('ktv ', '').trim();

  const users = typeof getSortedUsersList === 'function' ? getSortedUsersList() : (typeof DEFAULT_USERS !== 'undefined' ? DEFAULT_USERS : []);
  const myUserObj = users.find(u => (staffPhone && normalizePhone(u.phone) === staffPhone) || (staffCode && String(u.staff_id || '').trim() === staffCode) || (myNameClean && u.full_name && u.full_name.toLowerCase().includes(myNameClean))) || currentUser;
  const myCommRate = (myUserObj && parsePercentage(myUserObj.commission_rate) > 0) ? parsePercentage(myUserObj.commission_rate) : 10;

  // Update Greeting Name
  const greetingNameEl = document.getElementById('home-greeting-name');
  if (greetingNameEl) {
    greetingNameEl.innerText = currentUser?.full_name || 'bạn';
  }

  let todayTours = 0;
  let todayComm = 0;
  let todayTips = 0;

  // 1. ƯU TIÊN ĐỌC TỪ TB_PAYROLL_LOGS
  const myTodayPayroll = payrollLogs.filter(p => {
    const pDate = normalizeDateKey(p.date || p.created_at);
    const pPhone = normalizePhone(p.staff_phone);
    const pCode = String(p.staff_id || '').trim();
    const pName = String(p.staff_name || '').toLowerCase().replace('👑 ', '').replace('ktv ', '').trim();
    return pDate === todayStr && ((staffPhone && pPhone === staffPhone) || (staffCode && pCode === staffCode) || (myNameClean && (pName.includes(myNameClean) || myNameClean.includes(pName))));
  });

  if (myTodayPayroll.length > 0) {
    todayTours = myTodayPayroll.length;
    myTodayPayroll.forEach(p => {
      todayComm += Number(p.commission_amount) || 0;
      todayTips += Number(p.tip_amount) || 0;
    });
  } else {
    // 2. NẾU CHƯA CÓ TRONG TB_PAYROLL_LOGS -> TRÍCH XUẤT TỪ TB_RECEIPTS
    receipts.forEach(r => {
      const rDate = normalizeDateKey(r.date || r.created_at);
      if (rDate !== todayStr) return;

      const sNames = String(r.staff_names || '').toLowerCase();
      const s1N = String(r.staff_1_name || '').toLowerCase();
      const s2N = String(r.staff_2_name || '').toLowerCase();
      const s1P = normalizePhone(r.staff_1_user_id || r.staff_1_phone || r.staff_phone);
      const s2P = normalizePhone(r.staff_2_user_id || r.staff_2_phone);
      const isMulti = Boolean(r.has_staff_2 || sNames.includes(',') || (s2N && s2N !== '-'));

      let isMe = false;
      let tourComm = 0;
      let tourTip = 0;

      if (r.staffs && Array.isArray(r.staffs) && r.staffs.length > 0) {
        const entry = r.staffs.find(s => normalizePhone(s.phone) === staffPhone || (staffCode && String(s.staff_id || '').trim() === staffCode) || (myNameClean && String(s.name || '').toLowerCase().includes(myNameClean)));
        if (entry) {
          isMe = true;
          tourComm = Number(entry.comm_vnd || entry.comm) || 0;
          tourTip = Number(entry.tip_vnd || entry.tip) || 0;
        }
      } else {
        if (s1P === staffPhone || (myNameClean && (s1N.includes(myNameClean) || sNames.includes(myNameClean)))) {
          isMe = true;
          tourComm = Number(r.staff_1_comm) || 0;
          tourTip = Number(r.staff_1_tip) || 0;
        } else if (s2P === staffPhone || (myNameClean && s2N.includes(myNameClean))) {
          isMe = true;
          tourComm = Number(r.staff_2_comm) || 0;
          tourTip = Number(r.staff_2_tip) || 0;
        }
      }

      if (isMe) {
        const price = Number(r.price) || 0;
        const totalTipOnRec = Number(r.tip_amount) || 0;

        if (tourComm === 0 && price > 0) {
          tourComm = Math.round(price * (myCommRate / 100) * (isMulti ? 0.5 : 1));
        }
        if (tourTip === 0 && totalTipOnRec > 0) {
          tourTip = Math.round(totalTipOnRec * (isMulti ? 0.5 : 1));
        }

        todayTours += 1;
        todayComm += tourComm;
        todayTips += tourTip;
      }
    });
  }

  const toursEl = document.getElementById('home-today-tours');
  const commEl = document.getElementById('home-today-comm');

  if (toursEl) toursEl.innerText = todayTours + ' tour';
  if (commEl) {
    let totalToday = todayComm + todayTips;
    commEl.innerText = totalToday.toLocaleString('vi-VN') + ' đ';
  }
}

function loadAdminDashboard() {
  const receipts = getStored('receipts', []);
  const expenses = getStored('expenses', []);
  const users = getStored('users', DEFAULT_USERS);

  let totalRevenue = 0;
  let totalSalaries = 0;

  receipts.forEach(r => {
    totalRevenue += (Number(r.price) || Number(r.total_paid) || 0);
  });

  users.filter(u => !isUserOwner(u)).forEach(staff => {
    const p = calculateStaffPayroll(staff, receipts);
    totalSalaries += (p.earnedBase + p.totalCommission);
  });

  let totalExpenses = 0;
  expenses.forEach(e => {
    totalExpenses += (Number(e.amount) || 0);
  });

  const netProfit = totalRevenue - totalSalaries - totalExpenses;

  const revEl = document.getElementById('kpi-revenue');
  const toursEl = document.getElementById('kpi-tours');
  const salEl = document.getElementById('kpi-salaries');
  const expEl = document.getElementById('kpi-expenses');
  const netEl = document.getElementById('kpi-net-profit');

  if (revEl) revEl.innerText = totalRevenue.toLocaleString('vi-VN') + ' đ';
  if (toursEl) toursEl.innerText = receipts.length + ' ca phục vụ';
  if (salEl) salEl.innerText = totalSalaries.toLocaleString('vi-VN') + ' đ';
  if (expEl) expEl.innerText = totalExpenses.toLocaleString('vi-VN') + ' đ';
  if (netEl) netEl.innerText = netProfit.toLocaleString('vi-VN') + ' đ';

  loadAdminUsersList();
  loadAdminCustomersList();
  lucide.createIcons();
}

function switchAdminTab(tab) {
  const tabs = ['users', 'customers', 'settings'];
  tabs.forEach(t => {
    const el = document.getElementById('admin-subtab-' + t);
    const btn = document.getElementById('tab-btn-' + t);
    if (t === tab) {
      el?.classList.remove('hidden');
      btn?.classList.remove('bg-white', 'text-[#7E7272]', 'border', 'border-[#F0EAE1]');
      btn?.classList.add('bg-[#E58A7B]', 'text-white', 'shadow-md', 'shadow-[#E58A7B]/25');
    } else {
      el?.classList.add('hidden');
      btn?.classList.add('bg-white', 'text-[#7E7272]', 'border', 'border-[#F0EAE1]');
      btn?.classList.remove('bg-[#E58A7B]', 'text-white', 'shadow-md', 'shadow-[#E58A7B]/25');
    }
  });
  lucide.createIcons();
}

function loadAdminUsersList() {
  const users = getStored('users', DEFAULT_USERS);
  const receipts = getStored('receipts', []);
  const countEl = document.getElementById('admin-users-count');
  if (countEl) countEl.innerText = users.length + ' nhân sự';
  const container = document.getElementById('admin-users-list');
  if (!container) return;

  container.innerHTML = users.map(u => {
    const isOwner = isUserOwner(u);
    const payroll = calculateStaffPayroll(u, receipts);

    return `
      <div class="p-4 rounded-3xl bg-[#FAF6F1] border border-[#F0EAE1] space-y-3">
        <div class="flex justify-between items-start">
          <div>
            <div class="font-extrabold text-sm sm:text-base text-[#2D2424]">${isOwner ? '👑' : '💆'} ${u.full_name}</div>
            <div class="text-xs text-[#7E7272] font-mono">${u.phone} • ${u.staff_id || u.phone}</div>
          </div>
          <span class="text-xs font-bold px-2.5 py-1 rounded-full ${isOwner ? 'bg-[#FFF0EB] text-[#E58A7B]' : u.salary_type === 'fixed' || u.salary_type === 'fixed_10pct' ? 'bg-[#E8F8F5] text-[#2E7D6D]' : 'bg-[#EBF5FB] text-[#2980B9]'}">
            ${isOwner ? 'Chủ tiệm' : u.salary_type === 'fixed' || u.salary_type === 'fixed_10pct' ? '10% + Lương cứng' : '20% Thuần tour'}
          </span>
        </div>

        ${!isOwner ? `
          <div class="p-3 rounded-2xl bg-white space-y-1.5 text-xs">
            <div class="flex justify-between text-[#7E7272]">
              <span>Ngày công tháng này:</span>
              <span class="font-bold text-[#E58A7B] font-mono">${payroll.workedDays} / ${payroll.standardDays} ngày</span>
            </div>
            <div class="flex justify-between text-[#7E7272]">
              <span>Lương tour + Tips + Cứng:</span>
              <span class="font-bold text-[#2E7D6D]">${payroll.totalCommission.toLocaleString('vi-VN')} + ${payroll.totalTips.toLocaleString('vi-VN')} + ${payroll.earnedBase.toLocaleString('vi-VN')} đ</span>
            </div>
            <div class="flex justify-between text-[#2D2424] font-extrabold pt-1 border-t border-[#F0EAE1]">
              <span>Tổng thu nhập KTV:</span>
              <span class="text-[#E58A7B] font-bold text-sm">${payroll.totalEarnings.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

let adminCustomerSearchQuery = '';

function filterAdminCustomers(query) {
  adminCustomerSearchQuery = (query || '').trim().toLowerCase();
  loadAdminCustomersList();
}

function loadAdminCustomersList() {
  const customers = getStored('customers', DEFAULT_CUSTOMERS);
  const countEl = document.getElementById('admin-customer-count');
  if (countEl) countEl.innerText = customers.length + ' khách hàng';
  const container = document.getElementById('admin-customers-list');
  if (!container) return;

  const currentMonth = new Date().getMonth() + 1;

  let filtered = customers;
  if (adminCustomerSearchQuery) {
    filtered = customers.filter(c => {
      const name = (c.customer_name || '').toLowerCase();
      const phone = normalizePhone(c.phone_number || c.raw_phone);
      return name.includes(adminCustomerSearchQuery) || phone.includes(adminCustomerSearchQuery);
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-8 text-center text-xs text-[#A39696] italic">
        Không tìm thấy khách hàng nào phù hợp với tìm kiếm
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(c => {
    const rawP = normalizePhone(c.phone_number || c.raw_phone);
    const visits = Number(c.cycle_visits) || 0;
    const endDate = c.cycle_end_date ? formatDateVN(c.cycle_end_date) : '';
    const vCount = Number(c.voucher_count) || 0;

    let bMonth = c.birth_month || 0;
    if (!bMonth && c.birthday) {
      let m = String(c.birthday).match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
      if (m) bMonth = Number(m[2]);
    }
    const isBirthMonth = (bMonth === currentMonth);

    return `
      <div class="p-4 rounded-3xl bg-[#FAF6F1] border border-[#F0EAE1] space-y-3 shadow-xs">
        <div class="flex justify-between items-start">
          <div>
            <div class="font-extrabold text-sm sm:text-base text-[#2D2424] flex items-center gap-1.5">
              <span>👤 ${c.customer_name}</span>
              ${isBirthMonth ? `<span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold flex items-center gap-1">🎂 Sinh nhật T${bMonth}</span>` : (bMonth ? `<span class="text-[10px] text-[#A39696] font-semibold">(T${bMonth})</span>` : '')}
            </div>
            <div class="text-xs text-[#7E7272] font-mono mt-0.5">${rawP}</div>
          </div>
          <span class="text-xs font-extrabold px-2.5 py-1 rounded-full bg-[#FFF0EB] text-[#E58A7B] border border-[#FCDFD7]">
            ${c.total_visits || 0} lần ghé
          </span>
        </div>

        <!-- Chu Kỳ Tích Điểm 60 Ngày (Cột D & E) -->
        <div class="p-3 rounded-2xl bg-white space-y-1.5 text-xs border border-[#F0EAE1]">
          <div class="flex justify-between items-center text-[#7E7272]">
            <span class="font-bold text-[#2D2424]">🎯 Chu kỳ 60 ngày:</span>
            <span class="font-extrabold text-[#E58A7B] font-mono">${visits} / 10 ca</span>
          </div>
          <div class="w-full h-2 bg-[#FAF6F1] rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-[#E58A7B] to-[#F09A8D] rounded-full" style="width: ${Math.min(100, (visits / 10) * 100)}%"></div>
          </div>
          ${endDate ? `<div class="text-[10px] text-[#A39696] text-right">Hạn chót 60 ngày: ${endDate}</div>` : ''}
        </div>

        <!-- Sở Thích & Voucher -->
        ${c.notes ? `
          <div class="text-xs text-[#D35400] bg-white/90 p-2.5 rounded-2xl border border-[#FCDFD7]">
            <span class="font-bold">📝 Sở thích:</span> ${c.notes}
          </div>
        ` : ''}

        ${vCount > 0 ? `
          <div class="text-xs font-bold text-[#2E7D6D] bg-[#E8F8F5] p-2.5 rounded-2xl border border-[#B7EBDD] flex items-center justify-between">
            <span class="flex items-center gap-1.5"><i data-lucide="gift" class="w-3.5 h-3.5"></i> Có ${vCount} Voucher ca miễn phí</span>
          </div>
        ` : ''}

        <!-- Nút Hành Động -->
        <div class="flex gap-2 pt-1">
          <button type="button" onclick="openOwnerCustomerEditorModal('${rawP}', '${(c.customer_name || 'Khách').replace(/'/g, "\\'")}')" class="flex-1 py-2 px-3 rounded-full bg-white hover:bg-[#FFF0EB] text-[#7E7272] hover:text-[#E58A7B] border border-[#F0EAE1] text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Sửa Info
          </button>
          <button type="button" onclick="openGiftVoucherModal('${rawP}', '${(c.customer_name || 'Khách').replace(/'/g, "\\'")}')" class="flex-1 py-2 px-3 rounded-full bg-[#E8F8F5] hover:bg-[#D1F2EB] text-[#2E7D6D] border border-[#B7EBDD] text-xs font-extrabold transition flex items-center justify-center gap-1 cursor-pointer">
            <i data-lucide="gift" class="w-3.5 h-3.5"></i> Tặng Voucher
          </button>
        </div>
      </div>
    `;
  }).join('');
  lucide.createIcons();
}

function openGiftVoucherModal(phone, name) {
  const modal = document.getElementById('modal-gift-voucher');
  if (!modal) return;

  const rawP = normalizePhone(phone);
  document.getElementById('modal-gift-raw-phone').value = rawP;
  document.getElementById('modal-gift-cust-name').value = name;
  document.getElementById('modal-gift-cust-info').innerText = `${name} (${rawP})`;

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeGiftVoucherModal() {
  document.getElementById('modal-gift-voucher')?.classList.add('hidden');
}

function onGiftTypeChange(val) {
  const box = document.getElementById('modal-gift-val-box');
  if (!box) return;
  if (val.includes('tiền')) {
    box.classList.remove('hidden');
  } else {
    box.classList.add('hidden');
  }
}

function handleSaveGiftVoucher(e) {
  e.preventDefault();
  const rawP = document.getElementById('modal-gift-raw-phone')?.value;
  const name = document.getElementById('modal-gift-cust-name')?.value;
  const type = document.getElementById('modal-gift-type')?.value;
  const days = Number(document.getElementById('modal-gift-days')?.value) || 60;
  const notes = document.getElementById('modal-gift-notes')?.value;
  let discountVal = '1 lần miễn phí';
  if (type.includes('20%')) discountVal = '20%';
  if (type.includes('tiền')) discountVal = document.getElementById('modal-gift-val')?.value || '50.000 đ';

  if (!rawP) {
    alert('Không tìm thấy SĐT khách!');
    return;
  }

  // Add Voucher to local storage
  const vouchers = getStored('vouchers', DEFAULT_VOUCHERS);
  const vId = 'VC' + Date.now().toString().slice(-6);
  const now = new Date();
  now.setDate(now.getDate() + days);
  const expDate = normalizeDateKey(now);

  vouchers.push({
    voucher_id: vId,
    customer_phone: rawP,
    raw_phone: rawP,
    customer_name: name,
    voucher_type: type,
    discount_value: discountVal,
    expiry_date: expDate,
    status: 'Chưa dùng',
    used_receipt_id: '',
    notes: notes
  });
  setStored('vouchers', vouchers);

  // Increment voucher_count in customer
  const customers = getStored('customers', DEFAULT_CUSTOMERS);
  customers.forEach(c => {
    if (normalizePhone(c.phone_number || c.raw_phone) === rawP) {
      c.voucher_count = (c.voucher_count || 0) + 1;
    }
  });
  setStored('customers', customers);

  // Call Google Apps Script in background
  const gasUrl = getStored('gas_url', '');
  if (gasUrl) {
    fetch(gasUrl, {
      method: 'POST',
      body: JSON.stringify({
        action: 'gift_voucher',
        customer_phone: rawP,
        customer_name: name,
        voucher_type: type,
        discount_value: discountVal,
        expiry_days: days,
        notes: notes
      })
    }).catch(() => {});
  }

  closeGiftVoucherModal();
  alert(`🎁 Đã tặng thành công Voucher cho ${name}!`);
  loadAdminCustomersList();
}
