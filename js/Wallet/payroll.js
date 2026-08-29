// =============================================================
// TAB 4: WALLET - KTV PAYROLL, WORKING DAYS & TIPS CALCULATION
// =============================================================
function getMonthWorkingDaysInfo(targetDate = new Date()) {
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const standardDays = Math.max(24, totalDaysInMonth - 4);
  return { totalDaysInMonth, standardDays };
}

function calculateStaffPayroll(staff, allReceipts, targetDate = new Date()) {
  const baseSalary = Number(staff?.base_salary) || 0;
  const rate = parsePercentage(staff?.commission_rate);
  const isFixed = staff?.salary_type === 'fixed' || staff?.salary_type === 'fixed_10pct';
  const staffPhone = normalizePhone(staff?.phone);
  const staffCode = String(staff?.staff_id || '').trim();

  const { standardDays } = getMonthWorkingDaysInfo(targetDate);
  const currentMonthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;

  const workedDaysSet = new Set();
  let totalCommission = 0;
  let totalTips = 0;
  let totalTours = 0;

  allReceipts.forEach(r => {
    const s1Phone = normalizePhone(r.staff_1_phone || r.staff_phone);
    const s1Code = String(r.staff_1_id || r.staff_id || '').trim();
    const s2Phone = normalizePhone(r.staff_2_phone);
    const s2Code = String(r.staff_2_id || '').trim();

    let myComm = 0;
    let myTip = 0;
    let isMeInReceipt = false;

    if ((staffPhone && s1Phone === staffPhone) || (staffCode && s1Code === staffCode)) {
      isMeInReceipt = true;
      myComm += (Number(r.staff_1_comm) !== undefined && r.staff_1_comm !== null) ? Number(r.staff_1_comm) : (Number(r.commission_amount) || 0);
      myTip += Number(r.staff_1_tip) || 0;
    }

    if ((staffPhone && s2Phone === staffPhone) || (staffCode && s2Code === staffCode)) {
      isMeInReceipt = true;
      myComm += Number(r.staff_2_comm) || 0;
      myTip += Number(r.staff_2_tip) || 0;
    }

    if (isMeInReceipt) {
      const normKey = normalizeDateKey(r.date || r.created_at);
      if (normKey.startsWith(currentMonthStr)) {
        workedDaysSet.add(normKey);
        totalCommission += myComm;
        totalTips += myTip;
        totalTours += 1;
      }
    }
  });

  const workedDays = workedDaysSet.size;
  const dailyRate = isFixed ? Math.round(baseSalary / standardDays) : 0;
  const earnedBase = isFixed ? Math.round(workedDays * dailyRate) : 0;
  const totalEarnings = earnedBase + totalCommission + totalTips;

  return {
    isFixed,
    baseSalary,
    rate,
    standardDays,
    workedDays,
    dailyRate,
    earnedBase,
    totalCommission,
    totalTips,
    totalTours,
    totalEarnings
  };
}

function loadStaffPayrollStats() {
  const receipts = getStored('receipts', []);
  const payroll = calculateStaffPayroll(currentUser, receipts);

  const earningsEl = document.getElementById('staff-total-earnings');
  if (earningsEl) {
    earningsEl.innerHTML = `${payroll.totalEarnings.toLocaleString('vi-VN')} <span class="text-xl text-[#E58A7B] font-normal">đ</span>`;
  }

  const daysTextEl = document.getElementById('staff-days-progress-text');
  if (daysTextEl) daysTextEl.innerText = `${payroll.workedDays} / ${payroll.standardDays} ngày`;
  
  const pct = Math.min(100, Math.round((payroll.workedDays / payroll.standardDays) * 100));
  const barEl = document.getElementById('staff-days-progress-bar');
  if (barEl) barEl.style.width = pct + '%';

  const pctTextEl = document.getElementById('staff-days-pct-text');
  if (pctTextEl) pctTextEl.innerText = pct + '% chỉ tiêu';
  
  const noteEl = document.getElementById('staff-daily-rate-note');
  if (noteEl) {
    if (payroll.isFixed) {
      noteEl.innerText = `Công: ${payroll.dailyRate.toLocaleString('vi-VN')} đ/ngày (Định mức ${payroll.baseSalary.toLocaleString('vi-VN')} đ)`;
    } else {
      noteEl.innerText = `Thuần tour (${payroll.rate}%), không có lương cứng`;
    }
  }

  const toursEl = document.getElementById('staff-total-tours');
  if (toursEl) toursEl.innerText = `${payroll.totalTours} ca`;

  const commEl = document.getElementById('staff-total-commission');
  if (commEl) {
    commEl.innerText = `${payroll.totalCommission.toLocaleString('vi-VN')} đ${payroll.totalTips > 0 ? ` (+${payroll.totalTips.toLocaleString('vi-VN')} đ tip)` : ''}`;
  }

  const baseSalEl = document.getElementById('staff-base-salary');
  if (baseSalEl) baseSalEl.innerText = `${payroll.earnedBase.toLocaleString('vi-VN')} đ`;
}
