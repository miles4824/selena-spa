// =============================================================
// CORE: SPLIT COMMISSION (Chia tiền 2 KTV: theo phút hoặc chia đều 50/50)
// =============================================================
const SplitCommission = {
  calculateRatios(mode, s1Minutes, s2Minutes, totalMinutes) {
    if (mode === 'equal' || !totalMinutes || totalMinutes <= 0) {
      return { s1Ratio: 0.5, s2Ratio: 0.5 };
    }
    const m1 = Math.max(0, Number(s1Minutes) || 0);
    const m2 = Math.max(0, Number(s2Minutes) || 0);
    const sum = m1 + m2 || totalMinutes;
    const r1 = Math.round((m1 / sum) * 100) / 100;
    const r2 = Math.round((1 - r1) * 100) / 100;
    return { s1Ratio: r1, s2Ratio: r2 };
  }
};
