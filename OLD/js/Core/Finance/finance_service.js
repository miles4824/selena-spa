// =============================================================
// SELENA SPA - FINANCE & EXPENSE SERVICE (SINGLE SOURCE OF TRUTH)
// =============================================================
const FinanceService = {
  // Tính lợi nhuận ròng
  calculateNetProfit(totalRevenue, totalStaffSalaries, totalExpenses) {
    const rev = Number(totalRevenue) || 0;
    const sal = Number(totalStaffSalaries) || 0;
    const exp = Number(totalExpenses) || 0;
    return rev - sal - exp;
  },

  // Phân loại doanh thu Tiền mặt vs Chuyển khoản VIB
  splitCashAndBank(receiptsList = []) {
    let cashTotal = 0;
    let bankTotal = 0;
    if (Array.isArray(receiptsList)) {
      receiptsList.forEach(r => {
        const total = Number(r.total_paid || r.price) || 0;
        if (r.payment_method === 'Tiền mặt') {
          cashTotal += total;
        } else {
          bankTotal += total;
        }
      });
    }
    return { cash: cashTotal, bank: bankTotal, total: cashTotal + bankTotal };
  }
};
