// =============================================================
// SELENA SPA - MENU & CATALOG SERVICE (SINGLE SOURCE OF TRUTH)
// =============================================================
const MenuService = {
  // Tính tổng thời lượng tour (Combo + Add-ons)
  calculateTotalDuration(primaryComboDuration, addonList = []) {
    let total = Number(primaryComboDuration) || 50;
    if (Array.isArray(addonList)) {
      addonList.forEach(item => {
        total += Number(item.duration_min || item.duration) || 0;
      });
    }
    return total;
  },

  // Tính tổng tiền thanh toán (Combo + Addons + Products)
  calculateTotalPrice(comboPrice, addonList = [], productList = []) {
    let total = Number(comboPrice) || 0;
    if (Array.isArray(addonList)) {
      addonList.forEach(a => total += (Number(a.price) || 0));
    }
    if (Array.isArray(productList)) {
      productList.forEach(p => total += (Number(p.price) || 0));
    }
    return total;
  }
};
