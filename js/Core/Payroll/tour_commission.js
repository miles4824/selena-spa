// =============================================================
// CORE: TOUR COMMISSION (Tính hoa hồng 1 ca theo hợp đồng 10% hoặc 20%)
// =============================================================
const TourCommission = {
  calculate(price, staff, isMulti = false, splitRatio = 0.5) {
    const p = Number(price) || 0;
    if (p <= 0) return 0;
    let rate = 10;
    if (staff && staff.salary_type === '20% thuần tour') {
      rate = 20;
    } else if (staff && staff.commission_rate) {
      rate = Number(staff.commission_rate) || 10;
    }
    const fullComm = Math.round(p * (rate / 100));
    if (!isMulti) return fullComm;
    return Math.round(fullComm * splitRatio);
  }
};
