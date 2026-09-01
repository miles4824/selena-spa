// =============================================================
// CORE: MONTHLY PAYROLL (Tính tổng lương tháng từ ngày 1 - 30)
// =============================================================
const MonthlyPayroll = {
  calculateMonthlySalary(staff, payrollLogs = [], month = null, year = null) {
    const baseSal = Number(staff.base_salary) || 0;
    let totalComm = 0;
    let totalTip = 0;
    let tourCount = 0;

    payrollLogs.forEach(log => {
      totalComm += Number(log.commission_amount) || 0;
      totalTip += Number(log.tip_amount) || 0;
      tourCount++;
    });

    return {
      baseSalary: baseSal,
      commission: totalComm,
      tips: totalTip,
      tours: tourCount,
      grossEarnings: baseSal + totalComm + totalTip
    };
  }
};
