// =============================================================
// SELENA SPA - DATETIME SERVICE (SINGLE SOURCE OF TRUTH)
// =============================================================
const DateTimeService = {
  // Chuẩn hóa ngày yyyy-MM-dd
  formatDateKey(d) {
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

  // Triệt tiêu hoàn toàn 17 phút lệch múi giờ và trả về HH:mm
  formatCleanTime(val, fallbackDate = null) {
    if (!val) {
      if (fallbackDate) {
        const d = new Date(fallbackDate);
        if (!isNaN(d.getTime())) {
          return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
        }
      }
      return '12:00';
    }

    if (val instanceof Date) {
      return String(val.getHours()).padStart(2, '0') + ':' + String(val.getMinutes()).padStart(2, '0');
    }

    const s = String(val).trim();
    if (/^\d{1,2}:\d{2}$/.test(s)) {
      const parts = s.split(':');
      let hh = parseInt(parts[0], 10);
      let mm = parseInt(parts[1], 10);
      return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
    }

    if (s.includes('T') || s.includes('GMT') || s.includes('-') || s.includes('/')) {
      const d = new Date(s);
      if (!isNaN(d.getTime())) {
        return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
      }
    }

    return s.slice(0, 5);
  },

  // Kiểm tra ngày tương lai để vô hiệu hóa bấm
  isFutureDate(dateStr) {
    const todayStr = this.formatDateKey(new Date());
    const targetStr = this.formatDateKey(dateStr);
    return targetStr > todayStr;
  }
};
