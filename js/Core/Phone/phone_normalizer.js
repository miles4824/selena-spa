// =============================================================
// CORE: PHONE NORMALIZER (Chuẩn hóa 10 số, triệt tiêu số rác)
// =============================================================
const PhoneNormalizer = {
  normalize(val) {
    if (!val) return '';
    const s = String(val).trim();
    if (s.includes('*')) return '';
    let digits = s.replace(/[^0-9]/g, '');
    if (!digits || digits.length < 8) return '';
    if (digits.startsWith('84')) digits = '0' + digits.slice(2);
    if (digits.startsWith('0')) return digits;
    if (digits.length === 9) return '0' + digits;
    return digits;
  }
};
