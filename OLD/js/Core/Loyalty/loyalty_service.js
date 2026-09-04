// =============================================================
// SELENA SPA - LOYALTY & VOUCHER SERVICE (SINGLE SOURCE OF TRUTH)
// =============================================================
const LoyaltyService = {
  // Tính chu kỳ 60 ngày & số lượt ghé thăm
  calculateCycle(startDateStr, visitCount = 1) {
    const start = new Date(startDateStr || new Date());
    const now = new Date();
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    
    // Nếu quá 60 ngày -> Bắt đầu chu kỳ mới
    if (diffDays > 60) {
      return {
        isNewCycle: true,
        daysRemaining: 60,
        currentVisits: 1,
        isMilestoneReward: false
      };
    }

    const remaining = Math.max(0, 60 - diffDays);
    const isReward = visitCount >= 10;
    return {
      isNewCycle: false,
      daysRemaining: remaining,
      currentVisits: visitCount,
      isMilestoneReward: isReward
    };
  },

  // Kiểm tra hạn sử dụng của Voucher
  isVoucherValid(expiryDateStr, status = 'Chưa dùng') {
    if (status !== 'Chưa dùng') return false;
    if (!expiryDateStr) return true;
    const nowStr = new Date().toISOString().slice(0, 10);
    return expiryDateStr >= nowStr;
  }
};
