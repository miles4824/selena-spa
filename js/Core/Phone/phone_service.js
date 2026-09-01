// =============================================================
// SELENA SPA - PHONE SERVICE & MASKING (SINGLE SOURCE OF TRUTH)
// =============================================================
const PhoneService = {
  // Chuẩn hóa số điện thoại 10 số (Loại bỏ ký tự lạ, chuẩn hóa đầu 84 và 0)
  normalize(val) {
    if (!val) return '';
    const s = String(val).trim();
    if (s.includes('*')) return ''; // Masked string không phải là số thật
    let digits = s.replace(/[^0-9]/g, '');
    if (!digits || digits.length < 8) return '';
    if (digits.startsWith('84')) digits = '0' + digits.slice(2);
    if (digits.startsWith('0')) return digits;
    if (digits.length === 9) return '0' + digits;
    return digits;
  },

  // Che số bảo mật cho KTV (094*144), hiện đủ cho Chủ tiệm (0949251144)
  mask(phone, isOwner = false) {
    const raw = this.normalize(phone);
    if (!raw) return 'Khách vãng lai';
    if (isOwner) return raw;
    if (raw.length <= 6) return raw;
    return raw.slice(0, 3) + '*' + raw.slice(-3);
  },

  // So sánh 2 số điện thoại
  isSame(p1, p2) {
    const n1 = this.normalize(p1);
    const n2 = this.normalize(p2);
    if (!n1 || !n2) return false;
    return n1 === n2;
  },

  // Tìm số điện thoại thật của khách hàng từ kho dữ liệu (Customers & Receipts)
  resolveTruePhone(inputPhone, customerName, receiptId) {
    let truePhone = this.normalize(inputPhone);
    if (truePhone) return truePhone;

    const allCusts = typeof getAllAvailableCustomers === 'function' ? getAllAvailableCustomers() : (typeof getStored === 'function' ? getStored('customers', []) : []);
    const receipts = typeof getStored === 'function' ? getStored('receipts', []) : [];

    if (receiptId) {
      const r = receipts.find(x => x.receipt_id === receiptId);
      if (r) {
        truePhone = this.normalize(r.customer_phone || r.raw_phone);
        if (truePhone) return truePhone;
      }
    }

    if (customerName && customerName !== 'Khách vãng lai' && customerName !== 'Khách hàng') {
      const cust = allCusts.find(c => c.customer_name && c.customer_name.trim().toLowerCase() === customerName.trim().toLowerCase());
      if (cust) {
        truePhone = this.normalize(cust.phone_number || cust.raw_phone);
        if (truePhone) return truePhone;
      }
    }

    return '';
  }
};

// Global bridging for backwards compatibility
function normalizePhone(val) { return PhoneService.normalize(val); }
function maskPhoneNumber(phone, isOwner = false) { return PhoneService.mask(phone, isOwner); }
function isSamePhone(p1, p2) { return PhoneService.isSame(p1, p2); }
