// =============================================================
// SELENA SPA - PAYROLL SERVICE (SINGLE SOURCE OF TRUTH)
// =============================================================
const PayrollService = {
  // Tính tiền tour cho KTV theo loại hợp đồng (10% + lương cứng hoặc 20% thuần tour)
  calculateTourCommission(price, staff, isMulti = false, splitRatio = 0.5) {
    const p = Number(price) || 0;
    if (p <= 0) return 0;
    
    let rate = 10; // Default 10%
    if (staff && staff.salary_type === '20% thuần tour') {
      rate = 20;
    } else if (staff && staff.commission_rate) {
      rate = Number(staff.commission_rate) || 10;
    }

    const fullComm = Math.round(p * (rate / 100));
    if (!isMulti) return fullComm;
    return Math.round(fullComm * splitRatio);
  },

  // Phân chia hoa hồng cho 2 KTV (theo số phút thực tế hoặc chia đều 50/50)
  calculateSplitRatios(mode, s1Minutes, s2Minutes, totalMinutes) {
    if (mode === 'equal' || !totalMinutes || totalMinutes <= 0) {
      return { s1Ratio: 0.5, s2Ratio: 0.5 };
    }
    const m1 = Math.max(0, Number(s1Minutes) || 0);
    const m2 = Math.max(0, Number(s2Minutes) || 0);
    const sum = m1 + m2 || totalMinutes;
    const r1 = Math.round((m1 / sum) * 100) / 100;
    const r2 = Math.round((1 - r1) * 100) / 100;
    return { s1Ratio: r1, s2Ratio: r2 };
  },

  // Thống kê hôm nay của KTV (số tour, tiền tour, tiền tip)
  getStaffTodayStats(staffPhone, staffCode, staffName, dateKey = null) {
    const todayStr = dateKey || (typeof normalizeDateKey === 'function' ? normalizeDateKey(new Date()) : new Date().toISOString().slice(0, 10));
    const payrollLogs = typeof getStored === 'function' ? getStored('payroll_logs', []) : [];
    const receipts = typeof getStored === 'function' ? getStored('receipts', []) : [];

    let todayTours = 0;
    let todayComm = 0;
    let todayTip = 0;

    const normPhone = PhoneService.normalize(staffPhone);
    const sNameClean = String(staffName || '').trim().toLowerCase();

    // 1. Quét từ tb_payroll_logs trước
    if (Array.isArray(payrollLogs) && payrollLogs.length > 0) {
      payrollLogs.forEach(log => {
        const logDate = (log.date || '').slice(0, 10);
        if (logDate !== todayStr) return;

        const lPhone = PhoneService.normalize(log.staff_phone);
        const lCode = String(log.staff_id || '').trim().toLowerCase();
        const lName = String(log.staff_name || '').trim().toLowerCase();

        const isMe = (normPhone && lPhone === normPhone) ||
                     (staffCode && lCode === String(staffCode).toLowerCase()) ||
                     (sNameClean && lName === sNameClean);

        if (isMe) {
          todayTours++;
          todayComm += Number(log.commission_amount) || 0;
          todayTip += Number(log.tip_amount) || 0;
        }
      });
    }

    // 2. Fallback quét từ receipts nếu payrollLogs chưa có
    if (todayTours === 0 && Array.isArray(receipts) && receipts.length > 0) {
      receipts.forEach(r => {
        const rDate = (r.date || '').slice(0, 10);
        if (rDate !== todayStr) return;

        const s1P = PhoneService.normalize(r.staff_1_phone);
        const s2P = PhoneService.normalize(r.staff_2_phone);
        const s1N = String(r.staff_1_name || '').trim().toLowerCase();
        const s2N = String(r.staff_2_name || '').trim().toLowerCase();
        const sNames = String(r.staff_names || '').toLowerCase();

        let isMe = false;
        let myComm = 0;
        let myTip = 0;

        if ((normPhone && s1P === normPhone) || (sNameClean && s1N === sNameClean)) {
          isMe = true;
          myComm = Number(r.staff_1_comm) || 0;
          myTip = Number(r.staff_1_tip) || 0;
        } else if ((normPhone && s2P === normPhone) || (sNameClean && s2N === sNameClean)) {
          isMe = true;
          myComm = Number(r.staff_2_comm) || 0;
          myTip = Number(r.staff_2_tip) || 0;
        } else if (sNameClean && sNames.includes(sNameClean)) {
          isMe = true;
          const isMulti = sNames.includes(',');
          myComm = Math.round((Number(r.price) || 0) * 0.1 * (isMulti ? 0.5 : 1));
          myTip = Math.round((Number(r.tip_amount) || 0) * (isMulti ? 0.5 : 1));
        }

        if (isMe) {
          todayTours++;
          todayComm += myComm;
          todayTip += myTip;
        }
      });
    }

    return {
      tours: todayTours,
      commission: todayComm,
      tips: todayTip,
      totalEarned: todayComm + todayTip
    };
  }
};
