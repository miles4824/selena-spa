// =============================================================
// CORE: PHONE MASKER (Che bảo mật 094*144 cho KTV, hiện đủ cho Chủ tiệm)
// =============================================================
const PhoneMasker = {
  mask(phone, isOwner = false) {
    const raw = typeof PhoneNormalizer !== 'undefined' ? PhoneNormalizer.normalize(phone) : String(phone || '').replace(/[^0-9]/g, '');
    if (!raw) return 'Khách vãng lai';
    if (isOwner) return raw;
    if (raw.length <= 6) return raw;
    return raw.slice(0, 3) + '*' + raw.slice(-3);
  }
};
