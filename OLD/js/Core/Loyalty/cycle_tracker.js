// =============================================================
// CORE: CYCLE TRACKER (Đếm chu kỳ 60 ngày & tích lũy 10 lần tặng 1)
// =============================================================
const CycleTracker = {
  calculateCycle(startDateStr, visitCount = 1) {
    const start = new Date(startDateStr || new Date());
    const now = new Date();
    const diffDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    
    if (diffDays > 60) {
      return { isNewCycle: true, daysRemaining: 60, currentVisits: 1, isReward: false };
    }
    const remaining = Math.max(0, 60 - diffDays);
    return { isNewCycle: false, daysRemaining: remaining, currentVisits: visitCount, isReward: visitCount >= 10 };
  }
};
