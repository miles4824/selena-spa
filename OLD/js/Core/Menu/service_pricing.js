// =============================================================
// CORE: SERVICE PRICING
// =============================================================
const ServicePricing = {
  calculateTotal(comboPrice, addonList = [], productList = []) {
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
