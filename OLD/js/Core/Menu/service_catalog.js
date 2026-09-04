// =============================================================
// CORE: SERVICE CATALOG & MENU (tb_menu)
// =============================================================
const ServiceCatalog = {
  getCombos() {
    const menu = typeof getStored === 'function' ? getStored('menu', []) : [];
    const combos = menu.filter(m => !m.category || m.category === 'combo');
    if (combos.length > 0) return combos;
    return typeof DEFAULT_MENU !== 'undefined' ? DEFAULT_MENU : [];
  },
  getAddons() {
    const menu = typeof getStored === 'function' ? getStored('menu', []) : [];
    return menu.filter(m => m.category === 'addon');
  },
  getProducts() {
    const menu = typeof getStored === 'function' ? getStored('menu', []) : [];
    return menu.filter(m => m.category === 'product');
  }
};
