// =========================================================================
// LOGIC SERVICE: HOME SERVICE (TÍNH TOÁN NGHIỆP VỤ & SỐ LIỆU CHO TRANG HOME)
// =========================================================================

/**
 * Định dạng số tiền sang định dạng Việt Nam Đồng (ví dụ: 150.000 đ)
 */
function formatMoney(amount) {
  const num = Number(amount) || 0;
  return num.toLocaleString('vi-VN') + ' đ';
}

/**
 * Chuẩn hóa ngày thành chuỗi YYYY-MM-DD để so sánh chính xác
 */
function toDateKey(val) {
  if (!val) return '';
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return '';
    const y = val.getFullYear();
    const m = (val.getMonth() + 1).toString().padStart(2, '0');
    const d = val.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const s = String(val).trim();
  const m1 = s.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (m1) return `${m1[1]}-${m1[2].padStart(2, '0')}-${m1[3].padStart(2, '0')}`;
  const m2 = s.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (m2) return `${m2[3]}-${m2[2].padStart(2, '0')}-${m2[1].padStart(2, '0')}`;
  return s.slice(0, 10);
}

/**
 * Quản lý trạng thái che số tiền riêng tư của KTV (Privacy Mode)
 */
function isStaffCommMasked() {
  try {
    return localStorage.getItem('selena_staff_comm_masked') !== 'false';
  } catch (e) {
    return true;
  }
}

function toggleStaffCommPrivacy() {
  const next = !isStaffCommMasked();
  try {
    localStorage.setItem('selena_staff_comm_masked', String(next));
  } catch (e) {}
  return next;
}

/**
 * Quản lý trạng thái che doanh thu riêng tư của Chủ tiệm (Privacy Mode)
 */
function isOwnerRevenueMasked() {
  try {
    return localStorage.getItem('selena_owner_rev_masked') !== 'false';
  } catch (e) {
    return true;
  }
}

function toggleOwnerRevenuePrivacy() {
  const next = !isOwnerRevenueMasked();
  try {
    localStorage.setItem('selena_owner_rev_masked', String(next));
  } catch (e) {}
  return next;
}

/**
 * Kiểm tra xem người dùng (KTV hoặc Chủ tiệm) có đang trong tour nào không
 * @param {Object} user - Thông tin currentUser
 * @returns {Object} { isRunning, session, elapsedMin, targetMin }
 */
function checkUserRunningTour(user) {
  if (!user) return { isRunning: false, session: null, elapsedMin: 0, targetMin: 45 };

  const myPhone = (typeof PhoneService !== 'undefined') ? PhoneService.normalize(user.phone) : String(user.phone || '').trim();
  const myId = String(user.staff_id || user.user_id || '').trim();
  const myName = (user.full_name || '').toLowerCase().replace('👑 ', '').replace('ktv ', '').trim();
  const now = Date.now();

  // 1. Kiểm tra session cục bộ trên máy
  let localSession = null;
  try {
    const saved = localStorage.getItem('selena_active_live_session');
    if (saved) {
      localSession = JSON.parse(saved);
      const sId = String(localSession.session_id || '');
      const tId = String(localSession.start_timestamp || '');
      if (typeof dismissedSessionIds !== 'undefined' && (dismissedSessionIds.has(sId) || dismissedSessionIds.has(tId))) {
        localStorage.removeItem('selena_active_live_session');
        localSession = null;
      }
    }
  } catch (e) {}

  // 2. Kiểm tra bộ nhớ đệm Firebase
  const allSessions = (typeof getStored === 'function') ? getStored('live_sessions_cache', []) : [];
  const candidateSessions = localSession ? [localSession, ...allSessions] : allSessions;

  for (const s of candidateSessions) {
    if (!s) continue;
    const sId = String(s.session_id || '');
    const tId = String(s.start_timestamp || '');
    if (typeof dismissedSessionIds !== 'undefined' && (dismissedSessionIds.has(sId) || dismissedSessionIds.has(tId))) continue;

    const startTime = Number(s.start_timestamp || 0);
    const targetMin = Number(s.duration_target_min || 45);
    const maxExpiryMs = (targetMin + 30) * 60 * 1000;
    if (startTime > 0 && (now - startTime) > Math.max(maxExpiryMs, 90 * 60 * 1000)) continue;

    // Nếu tour này đã được tôi bàn giao cho người khác -> Tôi không còn phục vụ tour này
    if (s.is_handover && s.handover_from_phone) {
      const fromP = (typeof PhoneService !== 'undefined') ? PhoneService.normalize(s.handover_from_phone) : String(s.handover_from_phone).replace(/[^0-9]/g, '');
      if (myPhone && fromP === myPhone) continue;
    }

    let isMe = false;
    if (s.staffs && Array.isArray(s.staffs) && s.staffs.length > 0) {
      const entry = s.staffs.find(st => {
        if (!st || st.left_early || st.is_handed_over || st.is_handover_from) return false;
        const stPhone = (typeof PhoneService !== 'undefined') ? PhoneService.normalize(st.phone) : String(st.phone || '').trim();
        const stId = String(st.staff_id || '').trim();
        const stName = (st.name || '').toLowerCase().replace('👑 ', '').replace('ktv ', '').trim();
        return (myPhone && stPhone === myPhone) || (myId && stId === myId) || (myName && (stName.includes(myName) || myName.includes(stName)));
      });
      if (entry) isMe = true;
    } else {
      const s1P = (typeof PhoneService !== 'undefined') ? PhoneService.normalize(s.staff_1_phone || s.staff_phone) : '';
      const s1N = (s.staff_1_name || s.staff_name || '').toLowerCase().replace('👑 ', '').replace('ktv ', '').trim();
      if ((myPhone && s1P === myPhone) || (myName && (s1N.includes(myName) || myName.includes(s1N)))) {
        isMe = true;
      }
    }

    if (isMe) {
      const elapsedMin = startTime > 0 ? Math.max(0, Math.floor((now - startTime) / 60000)) : 0;
      return { isRunning: true, session: s, elapsedMin, targetMin };
    }
  }

  return { isRunning: false, session: null, elapsedMin: 0, targetMin: 45 };
}

/**
 * Tính toán thành tích & hoa hồng hôm nay của riêng KTV
 * @param {Object} user - KTV hiện tại
 * @returns {Object} { todayTours, todayCommission, todayTips, formattedCommission }
 */
function getStaffTodayStats(user) {
  if (!user) return { todayTours: 0, todayCommission: 0, todayTips: 0, formattedCommission: '0 đ' };

  const todayStr = toDateKey(new Date());
  const myPhone = (typeof PhoneService !== 'undefined') ? PhoneService.normalize(user.phone) : String(user.phone || '').trim();
  const myId = String(user.staff_id || user.user_id || '').trim();
  const myNameClean = (user.full_name || '').toLowerCase().replace('👑 ', '').replace('ktv ', '').trim();

  const payrollLogs = (typeof getStored === 'function') ? getStored('payroll_logs', []) : [];
  const receipts = (typeof getStored === 'function') ? getStored('receipts', []) : [];

  let todayTours = 0;
  let todayCommission = 0;
  let todayTips = 0;

  // 1. Đọc từ nhật ký lương (payroll_logs)
  const myTodayPayroll = payrollLogs.filter(p => {
    const pDate = toDateKey(p.date || p.created_at);
    const pPhone = (typeof PhoneService !== 'undefined') ? PhoneService.normalize(p.staff_phone) : '';
    const pCode = String(p.staff_id || '').trim();
    const pName = String(p.staff_name || '').toLowerCase().replace('👑 ', '').replace('ktv ', '').trim();
    return pDate === todayStr && ((myPhone && pPhone === myPhone) || (myId && pCode === myId) || (myNameClean && (pName.includes(myNameClean) || myNameClean.includes(pName))));
  });

  if (myTodayPayroll.length > 0) {
    todayTours = myTodayPayroll.length;
    myTodayPayroll.forEach(p => {
      todayCommission += Number(p.commission_amount) || 0;
      todayTips += Number(p.tip_amount) || 0;
    });
  } else {
    // 2. Dự phòng đọc từ hóa đơn (receipts)
    const myTodayReceipts = receipts.filter(r => {
      const rDate = toDateKey(r.date || r.created_at);
      if (rDate !== todayStr) return false;
      const s1P = (typeof PhoneService !== 'undefined') ? PhoneService.normalize(r.staff_1_phone) : '';
      const s1Code = String(r.staff_1_id || '').trim();
      const s1N = String(r.staff_1_name || '').toLowerCase().replace('👑 ', '').replace('ktv ', '').trim();
      return (myPhone && s1P === myPhone) || (myId && s1Code === myId) || (myNameClean && (s1N.includes(myNameClean) || myNameClean.includes(s1N)));
    });

    todayTours = myTodayReceipts.length;
    const commRate = Number(user.commission_rate) || 10;
    myTodayReceipts.forEach(r => {
      const total = Number(r.total_amount || r.subtotal || 0);
      todayCommission += Math.round(total * (commRate / 100));
      todayTips += Number(r.tip_amount || 0);
    });
  }

  const isMasked = isStaffCommMasked();
  const formattedCommission = isMasked ? '•••••• đ' : formatMoney(todayCommission);

  return {
    todayTours,
    todayCommission,
    todayTips,
    formattedCommission,
    isMasked
  };
}

/**
 * Lấy danh sách các giường / tour đang chạy trực tiếp thời gian thực
 * @returns {Array} Danh sách giường kèm tiến độ thời gian
 */
function getLiveRunningTours() {
  const now = Date.now();
  let localSession = null;
  try {
    const saved = localStorage.getItem('selena_active_live_session');
    if (saved) {
      localSession = JSON.parse(saved);
      const sId = String(localSession.session_id || '');
      const tId = String(localSession.start_timestamp || '');
      if (typeof dismissedSessionIds !== 'undefined' && (dismissedSessionIds.has(sId) || dismissedSessionIds.has(tId))) {
        localStorage.removeItem('selena_active_live_session');
        localSession = null;
      }
    }
  } catch (e) {}

  const allSessions = (typeof getStored === 'function') ? getStored('live_sessions_cache', []) : [];
  const merged = localSession ? [localSession, ...allSessions] : allSessions;
  const seenIds = new Set();
  const validSessions = [];

  merged.forEach((sess, idx) => {
    if (!sess) return;
    const sId = String(sess.session_id || sess.start_timestamp || idx);
    const tId = String(sess.start_timestamp || '');
    if (seenIds.has(sId)) return;
    if (typeof dismissedSessionIds !== 'undefined' && (dismissedSessionIds.has(sId) || (tId && dismissedSessionIds.has(tId)))) return;

    const startTime = Number(sess.start_timestamp || 0);
    const targetMin = Number(sess.duration_target_min || 45);
    const maxExpiryMs = (targetMin + 30) * 60 * 1000;
    if (startTime > 0 && (now - startTime) > Math.max(maxExpiryMs, 90 * 60 * 1000)) return;

    seenIds.add(sId);

    const elapsedMin = startTime > 0 ? Math.max(0, Math.floor((now - startTime) / 60000)) : 0;
    const progressPct = Math.min(100, Math.round((elapsedMin / targetMin) * 100));
    const isOverdue = elapsedMin > targetMin;
    // Chỉ hiển thị KTV đang trực tiếp phục vụ (loại bỏ người đã rời sớm / đã bàn giao)
    const activeStaffs = (sess.staffs && Array.isArray(sess.staffs))
      ? sess.staffs.filter(s => s && !s.left_early && !s.is_handed_over && !s.is_handover_from)
      : [];

    const staffNames = activeStaffs.length > 0
      ? activeStaffs.map(s => s.name).join(', ')
      : (sess.staff_1_name || 'KTV');

    validSessions.push({
      ...sess,
      bedIndex: idx + 1,
      elapsedMin,
      targetMin,
      progressPct,
      isOverdue,
      staffNames
    });
  });

  return validSessions;
}

/**
 * Lấy các chỉ số tài chính & vận hành nhanh của tiệm trong ngày (Today Snapshot)
 * @returns {Object} { todayRevenue, todayCustomers, activeBedsCount, totalBedsCount, formattedRevenue }
 */
function getOwnerTodaySnapshot() {
  const todayStr = toDateKey(new Date());
  const receipts = (typeof getStored === 'function') ? getStored('receipts', []) : [];
  const todayReceipts = receipts.filter(r => toDateKey(r.date || r.created_at) === todayStr);

  let todayRevenue = 0;
  todayReceipts.forEach(r => {
    todayRevenue += Number(r.total_amount || r.total || 0);
  });

  const activeTours = getLiveRunningTours();
  const totalBeds = 6; // Số giường mặc định toàn tiệm
  const isMasked = isOwnerRevenueMasked();
  const formattedRevenue = isMasked ? '•••••• đ' : formatMoney(todayRevenue);

  return {
    todayRevenue,
    formattedRevenue,
    isMasked,
    todayCustomers: todayReceipts.length,
    activeBedsCount: activeTours.length,
    totalBedsCount: totalBeds
  };
}

/**
 * Lấy nội dung thông báo nội bộ đang phát cho nhân sự
 */
function getHomeAnnouncement() {
  const uiConfig = (typeof getStored === 'function') ? getStored('ui_config', {}) : {};
  return uiConfig.home_announcement || '✨ Chúc các kỹ thuật viên một ngày làm việc tràn đầy năng lượng & phục vụ khách hàng tận tâm!';
}

/**
 * Cập nhật thông báo nội bộ mới (dành cho Chủ tiệm)
 */
function saveHomeAnnouncement(content) {
  const cleanText = String(content || '').trim();
  if (!cleanText) return false;

  const current = (typeof getStored === 'function') ? getStored('ui_config', {}) : {};
  const updated = { ...current, home_announcement: cleanText };
  if (typeof setStored === 'function') setStored('ui_config', updated);

  // Đồng bộ Firebase nếu có kết nối
  if (typeof fbDb !== 'undefined' && fbDb) {
    try {
      fbDb.ref('config/ui_config/home_announcement').set(cleanText);
    } catch (e) {}
  }
  return true;
}

// Xuất ra phạm vi toàn cục
if (typeof window !== 'undefined') {
  window.HomeService = {
    formatMoney,
    toDateKey,
    isStaffCommMasked,
    toggleStaffCommPrivacy,
    isOwnerRevenueMasked,
    toggleOwnerRevenuePrivacy,
    checkUserRunningTour,
    getStaffTodayStats,
    getLiveRunningTours,
    getOwnerTodaySnapshot,
    getHomeAnnouncement,
    saveHomeAnnouncement
  };
}
