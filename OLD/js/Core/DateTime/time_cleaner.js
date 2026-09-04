// =============================================================
// CORE: TIME CLEANER (Định dạng giờ phút sạch, triệt tiêu lệch 17 phút)
// =============================================================
const TimeCleaner = {
  formatClean(val, fallbackDate = null) {
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
  }
};
