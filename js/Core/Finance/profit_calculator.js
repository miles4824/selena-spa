// =============================================================
// CORE: PROFIT CALCULATOR (Lợi nhuận ròng = Doanh thu - Quỹ lương - Chi phí)
// =============================================================
const ProfitCalculator = {
  calculate(totalRevenue, totalSalaries, totalExpenses) {
    const rev = Number(totalRevenue) || 0;
    const sal = Number(totalSalaries) || 0;
    const exp = Number(totalExpenses) || 0;
    return rev - sal - exp;
  }
};
