// =============================================================
// CORE: DATE HELPER (Chuẩn hóa ngày yyyy-MM-dd & khóa ngày tương lai)
// =============================================================
const DateHelper = {
  formatKey(d) {
    if (!d) return '';
    if (typeof d === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
      d = new Date(d);
    }
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  },

  isFuture(dateStr) {
    const todayStr = this.formatKey(new Date());
    const targetStr = this.formatKey(dateStr);
    return targetStr > todayStr;
  }
};
