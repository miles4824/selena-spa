// =============================================================
// TAB 1: HOME - DASHBOARD & STATS CONTROLLER
// =============================================================
function loadKTVHomeStats() {
  const receipts = getStored('receipts', []);
  const todayStr = normalizeDateKey(new Date());
  const staffPhone = normalizePhone(currentUser?.phone);
  const staffCode = String(currentUser?.staff_id || '').trim();

  // Update Greeting Name
  const greetingNameEl = document.getElementById('home-greeting-name');
  if (greetingNameEl) {
    let displayName = currentUser?.full_name || 'bạn';
    greetingNameEl.innerText = displayName;
  }

  let todayTours = 0;
  let todayComm = 0;

  receipts.forEach(r => {
    const rDate = normalizeDateKey(r.date || r.created_at);
    const rPhone = normalizePhone(r.staff_phone);
    const rCode = String(r.staff_id || '').trim();

    if (rDate === todayStr && ((staffPhone && rPhone === staffPhone) || (staffCode && rCode === staffCode))) {
      todayTours += 1;
      todayComm += (Number(r.commission_amount) || 0);
    }
  });

  document.getElementById('home-today-tours').innerText = todayTours + ' ca';
  document.getElementById('home-today-comm').innerText = todayComm.toLocaleString('vi-VN') + ' đ';
}

function loadAdminDashboard() {
  const receipts = getStored('receipts', []);
  const expenses = getStored('expenses', []);
  const users = getStored('users', DEFAULT_USERS);

  let totalRevenue = 0;
  let totalSalaries = 0;

  receipts.forEach(r => {
    totalRevenue += (Number(r.total_paid) || Number(r.price) || 0);
  });

  users.filter(u => !isUserOwner(u)).forEach(staff => {
    const p = calculateStaffPayroll(staff, receipts);
    totalSalaries += p.totalEarnings;
  });

  let totalExpenses = 0;
  expenses.forEach(e => {
    totalExpenses += (Number(e.amount) || 0);
  });

  const netProfit = totalRevenue - totalSalaries - totalExpenses;

  document.getElementById('kpi-revenue').innerText = totalRevenue.toLocaleString('vi-VN') + ' đ';
  document.getElementById('kpi-tours').innerText = receipts.length + ' ca phục vụ';
  document.getElementById('kpi-salaries').innerText = totalSalaries.toLocaleString('vi-VN') + ' đ';
  document.getElementById('kpi-expenses').innerText = totalExpenses.toLocaleString('vi-VN') + ' đ';
  document.getElementById('kpi-net-profit').innerText = netProfit.toLocaleString('vi-VN') + ' đ';

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
  document.getElementById('admin-users-count').innerText = users.length + ' nhân sự';
  const container = document.getElementById('admin-users-list');

  container.innerHTML = users.map(u => {
    const isOwner = isUserOwner(u);
    const payroll = calculateStaffPayroll(u, receipts);

    return `
      <div class="p-4 rounded-3xl bg-[#FAF6F1] border border-[#F0EAE1] space-y-3">
        <div class="flex justify-between items-start">
          <div>
            <div class="font-extrabold text-sm sm:text-base text-[#2D2424]">${isOwner ? '👑' : '💆'} ${u.full_name}</div>
            <div class="text-xs text-[#7E7272] font-mono">${u.phone} • ${u.staff_id}</div>
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
              <span>Lương tour + Lương cứng:</span>
              <span class="font-bold text-[#2E7D6D]">${payroll.totalCommission.toLocaleString('vi-VN')} + ${payroll.earnedBase.toLocaleString('vi-VN')} đ</span>
            </div>
            <div class="flex justify-between text-[#2D2424] font-extrabold pt-1 border-t border-[#F0EAE1]">
              <span>Tổng lương tạm tính:</span>
              <span class="text-[#E58A7B] font-bold text-sm">${payroll.totalEarnings.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function loadAdminCustomersList() {
  const customers = getStored('customers', DEFAULT_CUSTOMERS);
  document.getElementById('admin-customer-count').innerText = customers.length + ' khách';
  const container = document.getElementById('admin-customers-list');

  container.innerHTML = customers.map(c => `
    <div class="p-4 rounded-3xl bg-[#F7F2EC] border border-[#EFE8DF] space-y-2">
      <div class="flex justify-between items-center">
        <div class="font-bold text-[#2D2424] text-sm">${c.customer_name}</div>
        <span class="text-xs font-extrabold text-[#E58A7B] bg-[#FFF0EB] px-2.5 py-0.5 rounded-full">${c.total_visits || 0}/10 lần</span>
      </div>
      <div class="text-xs text-[#7E7272] font-mono">${c.phone_number}</div>
      ${c.notes ? `<div class="text-xs text-[#D35400] bg-white/70 p-2 rounded-xl">📝 ${c.notes}</div>` : ''}
      ${c.voucher_count > 0 ? `<div class="text-xs font-bold text-[#2E7D6D] bg-[#E8F8F5] p-2 rounded-xl flex items-center gap-1.5"><i data-lucide="gift" class="w-3.5 h-3.5"></i> Có ${c.voucher_count} Voucher Combo 1</div>` : ''}
    </div>
  `).join('');
}
