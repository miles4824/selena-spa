// =============================================================
// CORE: DURATION CALCULATOR
// =============================================================
const DurationCalculator = {
  calculateTotal(primaryDuration, addonList = []) {
    let total = Number(primaryDuration) || 50;
    if (Array.isArray(addonList)) {
      addonList.forEach(item => {
        total += Number(item.duration_min || item.duration) || 0;
      });
    }
    return total;
  }
};
