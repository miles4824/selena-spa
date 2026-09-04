// =============================================================
// CORE: PHONE MATCHER (So khớp chính xác SĐT)
// =============================================================
const PhoneMatcher = {
  isSame(p1, p2) {
    const n1 = typeof PhoneNormalizer !== 'undefined' ? PhoneNormalizer.normalize(p1) : String(p1 || '').trim();
    const n2 = typeof PhoneNormalizer !== 'undefined' ? PhoneNormalizer.normalize(p2) : String(p2 || '').trim();
    if (!n1 || !n2) return false;
    return n1 === n2;
  }
};
