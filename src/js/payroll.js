// -------------------------------------------------------------
// PAYROLL & WORKING DAYS CALCULATION LOGIC
// -------------------------------------------------------------
function getMonthWorkingDaysInfo(targetDate = new Date()) {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const standardDays = Math.max(24, totalDaysInMonth - 4);
  return { totalDaysInMonth, standardDays };
}

function calculateStaffPayroll(staff, allReceipts, targetDate = new Date()) {
  const baseSalary = Number(staff.base_salary) || 0;
  const rate = parsePercentage(staff.commission_rate);
  const isFixed = staff.salary_type === 'fixed' || staff.salary_type === 'fixed_10pct';
  const staffPhone = normalizePhone(staff.phone);
  const staffCode = String(staff.staff_id || '').trim();

  const { standardDays } = getMonthWorkingDaysInfo(targetDate);
  const currentMonthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;

  const workedDaysSet = new Set();
  let totalCommission = 0;
  let totalTours = 0;

  allReceipts.forEach(r => {
    const rStaffPhone = normalizePhone(r.staff_phone);
    const rStaffCode = String(r.staff_id || '').trim();
    const rStaffName = String(r.staff_name || '').trim();

    const isMe = (staffPhone && rStaffPhone === staffPhone) || 
                 (staffCode && rStaffCode === staffCode) || 
                 (staff.full_name && rStaffName === staff.full_name);

    if (isMe) {
      const normKey = normalizeDateKey(r.date || r.created_at);
      if (normKey.startsWith(currentMonthStr)) {
        workedDaysSet.add(normKey);
        totalCommission += (Number(r.commission_amount) || 0);
        totalTours += 1;
      }
    }
  });

  const workedDays = workedDaysSet.size;
  const dailyRate = isFixed ? Math.round(baseSalary / standardDays) : 0;
  const earnedBase = isFixed ? Math.round(workedDays * dailyRate) : 0;
  const totalEarnings = earnedBase + totalCommission;

  return {
    isFixed,
    baseSalary,
    rate,
    standardDays,
    workedDays,
    dailyRate,
    earnedBase,
    totalCommission,
    totalTours,
    totalEarnings
  };
}

function loadStaffPayrollStats() {
  const receipts = getStored('receipts', []);
  const payroll = calculateStaffPayroll(currentUser, receipts);

  document.getElementById('staff-total-earnings').innerHTML = `${payroll.totalEarnings.toLocaleString('vi-VN')} <span class="text-xl text-[#E58A7B] font-normal">đ</span>`;
  document.getElementById('staff-days-progress-text').innerText = `${payroll.workedDays} / ${payroll.standardDays} ngày`;
  
  const pct = Math.min(100, Math.round((payroll.workedDays / payroll.standardDays) * 100));
  document.getElementById('staff-days-progress-bar').style.width = pct + '%';
  document.getElementById('staff-days-pct-text').innerText = pct + '% chỉ tiêu';
  
  if (payroll.isFixed) {
    document.getElementById('staff-daily-rate-note').innerText = `Công: ${payroll.dailyRate.toLocaleString('vi-VN')} đ/ngày (Định mức ${payroll.baseSalary.toLocaleString('vi-VN')} đ)`;
  } else {
    document.getElementById('staff-daily-rate-note').innerText = `Thuần tour (${payroll.rate}%), không có lương cứng`;
  }

  document.getElementById('staff-total-tours').innerText = `${payroll.totalTours} ca`;
  document.getElementById('staff-total-commission').innerText = `${payroll.totalCommission.toLocaleString('vi-VN')} đ`;
  document.getElementById('staff-base-salary').innerText = `${payroll.earnedBase.toLocaleString('vi-VN')} đ`;
}
