// =============================================================
// CORE: VOUCHER ENGINE (Kiểm tra hạn dùng, trừ voucher khi thanh toán)
// =============================================================
const VoucherEngine = {
  isValid(expiryDateStr, status = 'Chưa dùng') {
    if (status !== 'Chưa dùng') return false;
    if (!expiryDateStr) return true;
    const nowStr = new Date().toISOString().slice(0, 10);
    return expiryDateStr >= nowStr;
  }
};
