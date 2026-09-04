// =============================================================
// TAB 1: HOME - DASHBOARD & STATS CONTROLLER (ADMIN & STAFF)
// Chuẩn hóa 100% theo Flowchart: Trạng thái bận/rảnh biến hình,
// Giám sát giường realtime toàn tiệm, Chỉ số nhanh hôm nay & Che mắt hoa hồng
// =============================================================

// Ghi nhớ trạng thái ẩn/hiện hoa hồng: Mặc định là true, nhưng nếu người dùng đã mở xem thì giữ nguyên khi chuyển tab
let isStaffHomeCommMasked = localStorage.getItem('selena_staff_home_comm_masked') === 'false' ? false : true;

function toggleStaffHomeCommPrivacy() {
  isStaffHomeCommMasked = !isStaffHomeCommMasked;
  try {
    localStorage.setItem('selena_staff_home_comm_masked', String(isStaffHomeCommMasked));
  } catch (e) {}
  if (typeof loadKTVHomeStats === 'function') loadKTVHomeStats();
}
window.toggleStaffHomeCommPrivacy = toggleStaffHomeCommPrivacy;

// -------------------------------------------------------------
// HELPER: KIỂM TRA USER HIỆN TẠI ĐANG TRONG TOUR HAY ĐANG RẢNH
// -------------------------------------------------------------
function checkCurrentUserRunningTour() {
  const myPhone = normalizePhone(currentUser?.phone);
  const myId = String(currentUser?.staff_id || currentUser?.user_id || '').trim();
  const myName = (currentUser?.full_name || '').toLowerCase().replace('👑 ', '').replace('ktv ', '').trim();
  const now = Date.now();

  // 1. Kiểm tra session đang lưu trực tiếp trên máy này
  let localSession = null;
  try {
    const saved = localStorage.getItem('selena_active_live_session');
    if (saved) localSession = JSON.parse(saved);
  } catch (e) {}

  // 2. Lấy danh sách session từ Firebase cache
  const allSessions = getStored('live_sessions_cache', []);
  const candidateSessions = localSession ? [localSession, ...allSessions] : allSessions;

  for (let s of candidateSessions) {
    if (!s) continue;
    const sId = String(s.session_id || s.start_timestamp || '');
    if (typeof dismissedSessionIds !== 'undefined' && dismissedSessionIds.has(sId)) continue;

    const startTime = Number(s.start_timestamp || 0);
    const targetMin = Number(s.duration_target_min || 45);
    const maxExpiryMs = (targetMin + 30) * 60 * 1000;
    if (startTime > 0 && (now - startTime) > Math.max(maxExpiryMs, 90 * 60 * 1000)) continue;

    let isMe = false;
    if (s.staffs && Array.isArray(s.staffs) && s.staffs.length > 0) {
      const entry = s.staffs.find(st => {
        if (!st || st.left_early) return false;
        const stPhone = normalizePhone(st.phone);
        const stId = String(st.staff_id || '').trim();
        const stName = (st.name || '').toLowerCase().replace('👑 ', '').replace('ktv ', '').trim();
        return (myPhone && stPhone === myPhone) || (myId && stId === myId) || (myName && (stName.includes(myName) || myName.includes(stName)));
      });
      if (entry) isMe = true;
    } else {
      const s1P = normalizePhone(s.staff_1_phone || s.active_staff_phone || s.staff_phone);
      const s1N = (s.staff_1_name || s.staff_name || '').toLowerCase().replace('👑 ', '').replace('ktv ', '').trim();
      if ((myPhone && s1P === myPhone) || (myName && (s1N.includes(myName) || myName.includes(s1N)))) {
        isMe = true;
      }
    }

    if (isMe) {
      const elapsedMin = startTime > 0 ? Math.max(0, Math.floor((now - startTime) / 60000)) : 0;
      return {
        isRunning: true,
        session: s,
        elapsedMin: elapsedMin,
        targetMin: targetMin
      };
    }
  }

  return { isRunning: false, session: null, elapsedMin: 0, targetMin: 45 };
}
window.checkCurrentUserRunningTour = checkCurrentUserRunningTour;

// -------------------------------------------------------------
// ĐIỀU HƯỚNG TỚI TOUR ĐANG CHẠY CỦA USER
// -------------------------------------------------------------
function handleHomeGoToActiveTour(targetSession) {
  const tourInfo = targetSession ? { session: targetSession } : checkCurrentUserRunningTour();
  if (tourInfo && tourInfo.session) {
    currentLiveSession = tourInfo.session;
    try {
      localStorage.setItem('selena_active_live_session', JSON.stringify(tourInfo.session));
    } catch (e) {}
  }
  showView('add');
}
window.handleHomeGoToActiveTour = handleHomeGoToActiveTour;

// -------------------------------------------------------------
// RENDER NÚT TRẠNG THÁI BIẾN HÌNH (RẢNH -> VÀO TOUR / BẬN -> VÀO XEM NGAY)
// -------------------------------------------------------------
function renderHomeStatusAndActionButton() {
  const isOwner = isUserOwner(currentUser);
  const tourInfo = checkCurrentUserRunningTour();

  // 1. Luôn cập nhật câu châm ngôn rảnh nếu có element trong DOM
  const globalDescEl = document.getElementById('staff-home-status-desc');
  if (globalDescEl) {
    const uiConfig = (typeof getStored === 'function') ? getStored('ui_config', {}) : {};
    const quoteVal = uiConfig.home_free_quote || uiConfig.HOME_FREE_QUOTE || 'Mỗi tour gội là một trải nghiệm thư giãn tuyệt vời gửi gắm đến khách hàng thân yêu.';
    if (tourInfo.isRunning) {
      const s = tourInfo.session;
      const custName = s?.customer_name || 'Khách vãng lai';
      const servName = s?.service_name || 'Dịch vụ';
      globalDescEl.innerHTML = `Bạn đang trong tour của <strong class="font-extrabold text-[#2D2424]">${custName}</strong> (<em class="italic font-bold text-[#E58A7B]">${servName}</em>). Vào tour ngay để theo dõi hoặc điều chỉnh ca.`;
    } else {
      globalDescEl.innerText = quoteVal;
    }
  }

  // 2. Luôn cập nhật slogan chào mừng nếu có trong DOM
  const globalSloganEl = document.getElementById('home-greeting-slogan');
  if (globalSloganEl) {
    const uiConfig = (typeof getStored === 'function') ? getStored('ui_config', {}) : {};
    const sloganVal = uiConfig.home_greeting_slogan || uiConfig.HOME_GREETING_SLOGAN || 'hôm nay sẵn sàng tỏa sáng chưa? ✨';
    globalSloganEl.innerText = sloganVal;
  }
  const isAdmin = currentUser ? isUserOwner(currentUser) : false;

  if (isAdmin) {
    const badgeEl = document.getElementById('admin-home-status-badge');
    const btnContainer = document.getElementById('admin-home-action-btn-container');

    if (tourInfo.isRunning) {
      if (badgeEl) {
        badgeEl.className = 'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FFF0EB] text-[#E58A7B] border border-[#FCDFD7] shadow-2xs';
        badgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#E58A7B] animate-pulse"></span><span>Đang trong tour (${tourInfo.elapsedMin}/${tourInfo.targetMin}p)</span>`;
      }
      if (btnContainer) {
        btnContainer.innerHTML = `
          <button onclick="handleHomeGoToActiveTour()" class="px-4 py-2 rounded-2xl bg-[#2E7D6D] hover:bg-[#256357] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-[#2E7D6D]/20 transition flex items-center gap-2 cursor-pointer active:scale-95">
            <i data-lucide="timer" class="w-4 h-4"></i>
            <span>Vào Xem Ngay</span>
          </button>
        `;
      }
    } else {
      if (badgeEl) {
        badgeEl.className = 'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#E8F8F5] text-[#2E7D6D] border border-[#B7EBDD] shadow-2xs';
        badgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#2E7D6D]"></span><span>Sẵn sàng phục vụ</span>`;
      }
      if (btnContainer) {
        btnContainer.innerHTML = `
          <button onclick="showView('add')" class="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E58A7B] to-[#F09A8D] hover:opacity-95 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#E58A7B]/25 transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-95">
            <i data-lucide="plus-circle" class="w-5 h-5"></i>
            <span>VÀO TOUR NGAY</span>
          </button>
        `;
      }
    }
  } else {
    const badgeEl = document.getElementById('staff-home-status-badge');
    const descEl = document.getElementById('staff-home-status-desc');
    const btnContainer = document.getElementById('staff-home-action-btn-container');

    if (tourInfo.isRunning) {
      const s = tourInfo.session;
      if (badgeEl) {
        badgeEl.className = 'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FFF0EB] text-[#E58A7B] border border-[#FCDFD7] shadow-2xs';
        badgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#E58A7B] animate-pulse"></span><span>Đang trong tour (${tourInfo.elapsedMin}/${tourInfo.targetMin}p)</span>`;
      }
      if (descEl) {
        const custName = s?.customer_name || 'Khách vãng lai';
        const servName = s?.service_name || 'Dịch vụ';
        descEl.innerHTML = `Bạn đang trong tour của <strong class="font-extrabold text-[#2D2424]">${custName}</strong> (<em class="italic font-bold text-[#E58A7B]">${servName}</em>). Vào tour ngay để theo dõi hoặc điều chỉnh ca.`;
      }
      if (btnContainer) {
        btnContainer.innerHTML = `
          <button onclick="handleHomeGoToActiveTour()" class="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-[#2E7D6D] to-[#3B9E8B] hover:opacity-95 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#2E7D6D]/25 transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-95">
            <i data-lucide="timer" class="w-5 h-5"></i>
            <span>VÀO XEM NGAY</span>
          </button>
        `;
      }
    } else {
      if (badgeEl) {
        badgeEl.className = 'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#E8F8F5] text-[#2E7D6D] border border-[#B7EBDD] shadow-2xs';
        badgeEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#2E7D6D]"></span><span>Sẵn sàng phục vụ</span>`;
      }
      if (descEl) {
        const uiConfig = (typeof getStored === 'function') ? getStored('ui_config', {}) : {};
        const quoteVal = uiConfig.home_free_quote || uiConfig.HOME_FREE_QUOTE || 'Mỗi tour gội là một trải nghiệm thư giãn tuyệt vời gửi gắm đến khách hàng thân yêu.';
        descEl.innerText = quoteVal;
      }
      if (btnContainer) {
        btnContainer.innerHTML = `
          <button onclick="showView('add')" class="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E58A7B] to-[#F09A8D] hover:opacity-95 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#E58A7B]/25 transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-95">
            <i data-lucide="plus-circle" class="w-5 h-5"></i>
            <span>VÀO TOUR NGAY</span>
          </button>
        `;
      }
    }
  }

  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}
window.renderHomeStatusAndActionButton = renderHomeStatusAndActionButton;

// -------------------------------------------------------------
// 1. STAFF HOME STATS (THÀNH TÍCH RIÊNG CỦA KTV TRONG NGÀY HÔM NAY)
// -------------------------------------------------------------
function loadKTVHomeStats() {
  const receipts = getStored('receipts', []);
  const payrollLogs = getStored('payroll_logs', []);
  const todayStr = normalizeDateKey(new Date());
  const staffPhone = normalizePhone(currentUser?.phone);
  const staffCode = String(currentUser?.staff_id || '').trim();
  const myNameClean = (currentUser?.full_name || '').toLowerCase().replace('👑 ', '').replace('ktv ', '').trim();

  const users = typeof getSortedUsersList === 'function' ? getSortedUsersList() : (typeof DEFAULT_USERS !== 'undefined' ? DEFAULT_USERS : []);
  const myUserObj = users.find(u => (staffPhone && normalizePhone(u.phone) === staffPhone) || (staffCode && String(u.staff_id || '').trim() === staffCode) || (myNameClean && u.full_name && u.full_name.toLowerCase().includes(myNameClean))) || currentUser;
  const myCommRate = (myUserObj && parsePercentage(myUserObj.commission_rate) > 0) ? parsePercentage(myUserObj.commission_rate) : 10;

  // Update Greeting Name
  const greetingNameEl = document.getElementById('home-greeting-name');
  if (greetingNameEl) {
    greetingNameEl.innerText = currentUser?.full_name || 'bạn';
  }

  const todayDateEl = document.getElementById('staff-home-today-date');
  if (todayDateEl) {
    todayDateEl.innerText = formatDateVN(new Date());
  }

  let todayTours = 0;
  let todayComm = 0;
  let todayTips = 0;

  // 1. ƯU TIÊN ĐỌC TỪ TB_PAYROLL_LOGS
  const myTodayPayroll = payrollLogs.filter(p => {
    const pDate = normalizeDateKey(p.date || p.created_at);
    const pPhone = normalizePhone(p.staff_phone);
    const pCode = String(p.staff_id || '').trim();
    const pName = String(p.staff_name || '').toLowerCase().replace('👑 ', '').replace('ktv ', '').trim();
    return pDate === todayStr && ((staffPhone && pPhone === staffPhone) || (staffCode && pCode === staffCode) || (myNameClean && (pName.includes(myNameClean) || myNameClean.includes(pName))));
  });

  if (myTodayPayroll.length > 0) {
    todayTours = myTodayPayroll.length;
    myTodayPayroll.forEach(p => {
      todayComm += Number(p.commission_amount) || 0;
      todayTips += Number(p.tip_amount) || 0;
    });
  } else {
    // 2. NẾU CHƯA CÓ TRONG TB_PAYROLL_LOGS -> TRÍCH XUẤT TỪ TB_RECEIPTS
    receipts.forEach(r => {
      const rDate = normalizeDateKey(r.date || r.created_at);
      if (rDate !== todayStr) return;

      const sNames = String(r.staff_names || '').toLowerCase();
      const s1N = String(r.staff_1_name || '').toLowerCase();
      const s2N = String(r.staff_2_name || '').toLowerCase();
      const s1P = normalizePhone(r.staff_1_user_id || r.staff_1_phone || r.staff_phone);
      const s2P = normalizePhone(r.staff_2_user_id || r.staff_2_phone);
      const isMulti = Boolean(r.has_staff_2 || sNames.includes(',') || (s2N && s2N !== '-'));

      let isMe = false;
      let tourComm = 0;
      let tourTip = 0;

      if (r.staffs && Array.isArray(r.staffs) && r.staffs.length > 0) {
        const entry = r.staffs.find(s => normalizePhone(s.phone) === staffPhone || (staffCode && String(s.staff_id || '').trim() === staffCode) || (myNameClean && String(s.name || '').toLowerCase().includes(myNameClean)));
        if (entry) {
          isMe = true;
          tourComm = Number(entry.comm_vnd || entry.comm) || 0;
          tourTip = Number(entry.tip_vnd || entry.tip) || 0;
        }
      } else {
        if (s1P === staffPhone || (myNameClean && (s1N.includes(myNameClean) || sNames.includes(myNameClean)))) {
          isMe = true;
          tourComm = Number(r.staff_1_comm) || 0;
          tourTip = Number(r.staff_1_tip) || 0;
        } else if (s2P === staffPhone || (myNameClean && s2N.includes(myNameClean))) {
          isMe = true;
          tourComm = Number(r.staff_2_comm) || 0;
          tourTip = Number(r.staff_2_tip) || 0;
        }
      }

      if (isMe) {
        const price = Number(r.price) || 0;
        const totalTipOnRec = Number(r.tip_amount) || 0;

        if (tourComm === 0 && price > 0) {
          tourComm = Math.round(price * (myCommRate / 100) * (isMulti ? 0.5 : 1));
        }
        if (tourTip === 0 && totalTipOnRec > 0) {
          tourTip = Math.round(totalTipOnRec * (isMulti ? 0.5 : 1));
        }

        todayTours += 1;
        todayComm += tourComm;
        todayTips += tourTip;
      }
    });
  }

  // Lấy câu slogan chào mừng từ tb_config
  const uiConfig = (typeof getStored === 'function') ? getStored('ui_config', {}) : {};
  const sloganEl = document.getElementById('home-greeting-slogan');
  if (sloganEl) {
    const sloganVal = uiConfig.home_greeting_slogan || uiConfig.HOME_GREETING_SLOGAN || 'hôm nay sẵn sàng tỏa sáng chưa? ✨';
    sloganEl.innerText = sloganVal;
  }

  const totalToday = todayComm + todayTips;
  const statsBlock = document.getElementById('staff-home-stats-block') || document.getElementById('staff-home-stats-container');
  if (statsBlock && typeof StatCard === 'function') {
    const formattedComm = isStaffHomeCommMasked ? '•••• đ' : `${totalToday.toLocaleString('vi-VN')} đ`;
    const todayDateStr = (typeof formatDateDisplayVN === 'function') ? formatDateDisplayVN(new Date()) : 'Hôm nay';

    // RENDER NGUYÊN KHỐI CHUẨN CÁCH 2: 1 LẦN GHI DOM DUY NHẤT (<1ms, KHÔNG CHỚP TẮT)
    statsBlock.innerHTML = `
      ${(typeof AppTitle === 'function') ? AppTitle({
        configKey: 'title_staff_today_stats',
        defaultText: 'Thành Tích Của Bạn Hôm Nay',
        icon: 'award',
        iconColor: 'text-[#E58A7B]',
        level: 'section',
        rightText: todayDateStr,
        id: 'staff-home-today-title'
      }) : ''}

      <div class="grid grid-cols-2 gap-3 sm:gap-4">
        ${StatCard({
          id: 'home-today-tours',
          title: 'Tour hôm nay',
          value: todayTours + ' tour',
          subtitle: 'Phục vụ trong ngày',
          color: 'blue'
        })}
        ${StatCard({
          id: 'home-today-comm',
          title: 'Thu nhập hôm nay',
          value: formattedComm,
          subtitle: 'Hoa hồng + Tip tích lũy',
          color: 'mint',
          isPrivacy: true,
          privacyEyeId: 'staff-home-comm-eye',
          onPrivacyToggle: 'toggleStaffHomeCommPrivacy()'
        })}
      </div>
    `;
    const eyeEl = document.getElementById('staff-home-comm-eye');
    if (eyeEl) eyeEl.setAttribute('data-lucide', isStaffHomeCommMasked ? 'eye-off' : 'eye');
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  } else {
    const toursEl = document.getElementById('home-today-tours');
    const commEl = document.getElementById('home-today-comm');
    const eyeEl = document.getElementById('staff-home-comm-eye');
    if (toursEl) toursEl.innerText = todayTours + ' tour';
    if (commEl) {
      commEl.innerText = isStaffHomeCommMasked ? '•••• đ' : `${totalToday.toLocaleString('vi-VN')} đ`;
      if (eyeEl) eyeEl.setAttribute('data-lucide', isStaffHomeCommMasked ? 'eye-off' : 'eye');
    }
  }

  renderHomeStatusAndActionButton();
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

// -------------------------------------------------------------
// 2. ADMIN HOME: CÁC TOUR ĐANG PHỤC VỤ TRỰC TIẾP (GIÁM SÁT REALTIME)
// -------------------------------------------------------------
function renderAdminLiveRunningTours() {
  const container = document.getElementById('admin-live-running-tours-list');
  const summaryEl = document.getElementById('admin-live-staff-summary');
  if (!container) return;

  const users = typeof getSortedUsersList === 'function' ? getSortedUsersList() : getStored('users', DEFAULT_USERS);
  const busyMap = typeof getBusyStaffPhonesMap === 'function' ? getBusyStaffPhonesMap() : {};
  const totalStaff = users.length;
  const busyCount = Object.keys(busyMap).filter(p => users.some(u => normalizePhone(u.phone) === p)).length;
  const freeCount = Math.max(0, totalStaff - busyCount);

  if (summaryEl) {
    summaryEl.innerText = `Đang có ${totalStaff} nhân viên trực (${busyCount} người đang làm khách, ${freeCount} người đang rảnh)`;
  }

  // Thu thập các tour đang chạy hợp lệ
  const allSessions = getStored('live_sessions_cache', []);
  const now = Date.now();
  const validSessions = [];
  const seenIds = new Set();

  // Kiểm tra thêm session lưu cục bộ trên máy (chỉ lấy nếu còn tồn tại trên Firebase hoặc mới tạo)
  try {
    const saved = localStorage.getItem('selena_active_live_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.session_id) {
        const stillInFb = allSessions.some(s => s.session_id === parsed.session_id);
        if (stillInFb) {
          // đã có
        } else if ((now - Number(parsed.start_timestamp || 0)) < 15000) {
          allSessions.unshift(parsed);
        } else {
          localStorage.removeItem('selena_active_live_session');
        }
      }
    }
  } catch (e) {}

  allSessions.forEach(sess => {
    if (!sess) return;
    const sId = String(sess.session_id || sess.start_timestamp || '');
    if (!sId || seenIds.has(sId)) return;
    if (typeof dismissedSessionIds !== 'undefined' && dismissedSessionIds.has(sId)) return;

    const startTime = Number(sess.start_timestamp || 0);
    const targetMin = Number(sess.duration_target_min || 45);
    const maxExpiryMs = (targetMin + 30) * 60 * 1000;
    if (startTime > 0 && (now - startTime) > Math.max(maxExpiryMs, 90 * 60 * 1000)) return;

    seenIds.add(sId);
    validSessions.push(sess);
  });

  if (validSessions.length === 0) {
    container.className = 'w-full';
    container.innerHTML = `
      <div class="p-6 rounded-2xl bg-[#FAF6F1] border border-dashed border-[#EFE8DF] text-center space-y-2">
        <div class="w-10 h-10 rounded-2xl bg-white text-[#2E7D6D] mx-auto flex items-center justify-center shadow-2xs">
          <i data-lucide="sparkles" class="w-5 h-5"></i>
        </div>
        <div class="font-extrabold text-sm text-[#2D2424]">Tất cả ${totalStaff} nhân sự đang sẵn sàng!</div>
        <p class="text-xs text-[#7E7272] max-w-sm mx-auto">Hiện tại chưa có ca phục vụ nào đang chạy. Hãy bấm nút "Vào Tour Ngay" khi có khách ghé tiệm.</p>
      </div>
    `;
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
    return;
  }

  container.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5';
  container.innerHTML = validSessions.map((sess, idx) => {
    const startTime = Number(sess.start_timestamp || 0);
    const targetMin = Number(sess.duration_target_min || 45);
    const elapsedMin = startTime > 0 ? Math.max(0, Math.floor((now - startTime) / 60000)) : 0;
    const progressPct = Math.min(100, Math.round((elapsedMin / targetMin) * 100));
    const isOverdue = elapsedMin > targetMin;

    const staffNames = sess.staffs && Array.isArray(sess.staffs)
      ? sess.staffs.map(s => s.name).join(', ')
      : (sess.staff_1_name || 'KTV');

    if (typeof BedCard === 'function') {
      return BedCard({
        sess,
        bedIndex: idx + 1,
        elapsedMin,
        targetMin,
        progressPct,
        isOverdue,
        staffNames
      });
    }
  }).join('');

  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}
window.renderAdminLiveRunningTours = renderAdminLiveRunningTours;

function handleAdminInspectSession(sessionId) {
  const allSessions = getStored('live_sessions_cache', []);
  const target = allSessions.find(s => String(s.session_id) === String(sessionId));
  if (target) {
    currentLiveSession = target;
    try {
      localStorage.setItem('selena_active_live_session', JSON.stringify(target));
    } catch (e) {}
  }
  showView('add');
}
window.handleAdminInspectSession = handleAdminInspectSession;

// -------------------------------------------------------------
// 3. ADMIN HOME: CHỈ SỐ NHANH HÔM NAY (TODAY SNAPSHOT)
// -------------------------------------------------------------
function renderAdminTodaySnapshot() {
  const receipts = getStored('receipts', []);
  const payrollLogs = getStored('payroll_logs', []);
  const expenses = getStored('expenses', []);
  const todayStr = normalizeDateKey(new Date());

  // Lọc dữ liệu hôm nay
  const todayReceipts = receipts.filter(r => normalizeDateKey(r.date || r.created_at) === todayStr);
  const todayPayroll = payrollLogs.filter(p => normalizeDateKey(p.date || p.created_at) === todayStr);
  const todayExpenses = expenses.filter(e => normalizeDateKey(e.date || e.created_at) === todayStr);

  let todayRevenue = 0;
  todayReceipts.forEach(r => {
    todayRevenue += (Number(r.total_paid) || Number(r.price) || 0);
  });

  let todaySalaries = 0;
  if (todayPayroll.length > 0) {
    todayPayroll.forEach(p => {
      todaySalaries += (Number(p.commission_amount) || 0) + (Number(p.tip_amount) || 0);
    });
  } else {
    todayReceipts.forEach(r => {
      todaySalaries += (Number(r.commission_amount) || Number(r.staff_1_comm) || 0) + (Number(r.tip_amount) || Number(r.staff_1_tip) || 0);
    });
  }

  let todayExpenseAmount = 0;
  todayExpenses.forEach(e => {
    todayExpenseAmount += (Number(e.amount) || 0);
  });

  const todayProfit = todayRevenue - todaySalaries - todayExpenseAmount;

  const revEl = document.getElementById('admin-today-revenue');
  const tourCountEl = document.getElementById('admin-today-tour-count');
  const guestCountEl = document.getElementById('admin-today-guest-count');
  const salEl = document.getElementById('admin-today-salaries');
  const profitEl = document.getElementById('admin-today-profit');

  if (revEl) revEl.innerText = todayRevenue.toLocaleString('vi-VN') + ' đ';
  if (tourCountEl) tourCountEl.innerText = `${todayReceipts.length} ca hoàn thành`;
  if (guestCountEl) guestCountEl.innerText = `${todayReceipts.length} lượt`;
  if (salEl) salEl.innerText = todaySalaries.toLocaleString('vi-VN') + ' đ';
  if (profitEl) profitEl.innerText = todayProfit.toLocaleString('vi-VN') + ' đ';
}
window.renderAdminTodaySnapshot = renderAdminTodaySnapshot;

// -------------------------------------------------------------
// 4. LOAD TOÀN BỘ DASHBOARD ADMIN
// -------------------------------------------------------------
function loadAdminDashboard() {
  renderHomeStatusAndActionButton();
  renderAdminLiveRunningTours();
  renderAdminTodaySnapshot();
  loadAdminUsersList();
  loadAdminCustomersList();
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}
window.loadAdminDashboard = loadAdminDashboard;

function switchAdminTab(tab) {
  const tabs = ['users', 'customers', 'settings'];
  tabs.forEach(t => {
    const el = document.getElementById('admin-subtab-' + t);
    const btn = document.getElementById('tab-btn-' + t);
    if (t === tab) {
      el?.classList.remove('hidden');
      btn?.classList.remove('bg-white', 'text-[#7E7272]', 'border', 'border-[#F0EAE1]');
      btn?.classList.add('bg-[#E58A7B]', 'text-white', 'shadow-md', 'shadow-[#E58A7B]/25');
    } else {
      el?.classList.add('hidden');
      btn?.classList.add('bg-white', 'text-[#7E7272]', 'border', 'border-[#F0EAE1]');
      btn?.classList.remove('bg-[#E58A7B]', 'text-white', 'shadow-md', 'shadow-[#E58A7B]/25');
    }
  });
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}
window.switchAdminTab = switchAdminTab;

function loadAdminUsersList() {
  const users = getStored('users', DEFAULT_USERS);
  const receipts = getStored('receipts', []);
  const countEl = document.getElementById('admin-users-count');
  if (countEl) countEl.innerText = users.length + ' nhân sự';
  const container = document.getElementById('admin-users-list');
  if (!container) return;

  container.innerHTML = users.map(u => {
    const isOwner = isUserOwner(u);
    const payroll = calculateStaffPayroll(u, receipts);

    return `
      <div class="p-4 rounded-3xl bg-[#FAF6F1] border border-[#F0EAE1] space-y-3 shadow-xs">
        <div class="flex justify-between items-start">
          <div>
            <div class="font-extrabold text-sm sm:text-base text-[#2D2424]">${isOwner ? '👑' : '💆'} ${u.full_name}</div>
            <div class="text-xs text-[#7E7272] font-mono">${u.phone} • ${u.staff_id || u.phone}</div>
          </div>
          <span class="text-xs font-bold px-2.5 py-1 rounded-full ${isOwner ? 'bg-[#FFF0EB] text-[#E58A7B]' : u.salary_type === 'fixed' || u.salary_type === 'fixed_10pct' ? 'bg-[#E8F8F5] text-[#2E7D6D]' : 'bg-[#EBF5FB] text-[#2980B9]'}">
            ${isOwner ? 'Chủ tiệm' : u.salary_type === 'fixed' || u.salary_type === 'fixed_10pct' ? '10% + Lương cứng' : '20% Thuần tour'}
          </span>
        </div>

        ${!isOwner ? `
          <div class="p-3 rounded-2xl bg-white space-y-1.5 text-xs border border-[#F0EAE1]">
            <div class="flex justify-between text-[#7E7272]">
              <span>Ngày công tháng này:</span>
              <span class="font-bold text-[#E58A7B] font-mono">${payroll.workedDays} / ${payroll.standardDays} ngày</span>
            </div>
            <div class="flex justify-between text-[#7E7272]">
              <span>Lương tour + Tips + Cứng:</span>
              <span class="font-bold text-[#2E7D6D]">${payroll.totalCommission.toLocaleString('vi-VN')} + ${payroll.totalTips.toLocaleString('vi-VN')} + ${payroll.earnedBase.toLocaleString('vi-VN')} đ</span>
            </div>
            <div class="flex justify-between text-[#2D2424] font-extrabold pt-1 border-t border-[#F0EAE1]">
              <span>Tổng thu nhập KTV:</span>
              <span class="text-[#E58A7B] font-bold text-sm">${payroll.totalEarnings.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

let adminCustomerSearchQuery = '';

function filterAdminCustomers(query) {
  adminCustomerSearchQuery = (query || '').trim().toLowerCase();
  loadAdminCustomersList();
}

function loadAdminCustomersList() {
  const customers = getStored('customers', DEFAULT_CUSTOMERS);
  const countEl = document.getElementById('admin-customer-count');
  if (countEl) countEl.innerText = customers.length + ' khách hàng';
  const container = document.getElementById('admin-customers-list');
  if (!container) return;

  const filtered = customers.filter(c => {
    if (!adminCustomerSearchQuery) return true;
    const q = adminCustomerSearchQuery;
    const name = String(c.customer_name || '').toLowerCase();
    const phone = String(c.phone_number || c.raw_phone || '').toLowerCase();
    return name.includes(q) || phone.includes(q);
  });

  const now = new Date();
  const currentMonth = now.getMonth() + 1;

  container.innerHTML = filtered.map(c => {
    const rawP = c.phone_number || c.raw_phone || '-';
    const visits = c.cycle_visits || 0;
    const endDate = c.cycle_end_date ? formatDateVN(c.cycle_end_date) : '';
    const vCount = Number(c.voucher_count) || 0;

    let bMonth = Number(c.birth_month) || 0;
    if (!bMonth && c.birthday) {
      let m = String(c.birthday).match(/(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})/);
      if (m) bMonth = Number(m[2]);
    }
    const isBirthMonth = (bMonth === currentMonth);

    return `
      <div class="p-4 rounded-3xl bg-[#FAF6F1] border border-[#F0EAE1] space-y-3 shadow-xs">
        <div class="flex justify-between items-start">
          <div>
            <div class="font-extrabold text-sm sm:text-base text-[#2D2424] flex items-center gap-1.5">
              <span>👤 ${c.customer_name}</span>
              ${isBirthMonth ? `<span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold flex items-center gap-1">🎂 Sinh nhật T${bMonth}</span>` : (bMonth ? `<span class="text-[10px] text-[#A39696] font-semibold">(T${bMonth})</span>` : '')}
            </div>
            <div class="text-xs text-[#7E7272] font-mono mt-0.5">${rawP}</div>
          </div>
          <span class="text-xs font-extrabold px-2.5 py-1 rounded-full bg-[#FFF0EB] text-[#E58A7B] border border-[#FCDFD7]">
            ${c.total_visits || 0} lần ghé
          </span>
        </div>

        <!-- Chu Kỳ Tích Điểm 60 Ngày (Cột D & E) -->
        <div class="p-3 rounded-2xl bg-white space-y-1.5 text-xs border border-[#F0EAE1]">
          <div class="flex justify-between items-center text-[#7E7272]">
            <span class="font-bold text-[#2D2424]">🎯 Chu kỳ 60 ngày:</span>
            <span class="font-extrabold text-[#E58A7B] font-mono">${visits} / 10 ca</span>
          </div>
          <div class="w-full h-2 bg-[#FAF6F1] rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-[#E58A7B] to-[#F09A8D] rounded-full" style="width: ${Math.min(100, (visits / 10) * 100)}%"></div>
          </div>
          ${endDate ? `<div class="text-[10px] text-[#A39696] text-right">Hạn chót 60 ngày: ${endDate}</div>` : ''}
        </div>

        <!-- Sở Thích & Voucher -->
        ${c.notes ? `
          <div class="text-xs text-[#D35400] bg-white/90 p-2.5 rounded-2xl border border-[#FCDFD7]">
            <span class="font-bold">📝 Sở thích:</span> ${c.notes}
          </div>
        ` : ''}

        ${vCount > 0 ? `
          <div class="text-xs font-bold text-[#2E7D6D] bg-[#E8F8F5] p-2.5 rounded-2xl border border-[#B7EBDD] flex items-center justify-between">
            <span class="flex items-center gap-1.5"><i data-lucide="gift" class="w-3.5 h-3.5"></i> Có ${vCount} Voucher ca miễn phí</span>
          </div>
        ` : ''}

        <!-- Nút Hành Động -->
        <div class="flex gap-2 pt-1">
          <button type="button" onclick="openOwnerCustomerEditorModal('${rawP}', '${(c.customer_name || 'Khách').replace(/'/g, "\\'")}')" class="flex-1 py-2 px-3 rounded-full bg-white hover:bg-[#FFF0EB] text-[#7E7272] hover:text-[#E58A7B] border border-[#F0EAE1] text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Sửa Info
          </button>
          <button type="button" onclick="openGiftVoucherModal('${rawP}', '${(c.customer_name || 'Khách').replace(/'/g, "\\'")}')" class="flex-1 py-2 px-3 rounded-full bg-[#E8F8F5] hover:bg-[#D1F2EB] text-[#2E7D6D] border border-[#B7EBDD] text-xs font-extrabold transition flex items-center justify-center gap-1 cursor-pointer">
            <i data-lucide="gift" class="w-3.5 h-3.5"></i> Tặng Voucher
          </button>
        </div>
      </div>
    `;
  }).join('');
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

function openGiftVoucherModal(phone, name) {
  const modal = document.getElementById('modal-gift-voucher');
  if (!modal) return;

  const rawP = normalizePhone(phone);
  document.getElementById('modal-gift-raw-phone').value = rawP;
  document.getElementById('modal-gift-cust-name').value = name;
  document.getElementById('modal-gift-cust-info').innerText = `${name} (${rawP})`;

  modal.classList.remove('hidden');
  if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
}

function closeGiftVoucherModal() {
  document.getElementById('modal-gift-voucher')?.classList.add('hidden');
}

function onGiftTypeChange(val) {
  const box = document.getElementById('modal-gift-val-box');
  if (!box) return;
  if (val.includes('tiền')) {
    box.classList.remove('hidden');
  } else {
    box.classList.add('hidden');
  }
}

function handleSaveGiftVoucher(e) {
  e.preventDefault();
  const rawP = document.getElementById('modal-gift-raw-phone')?.value;
  const name = document.getElementById('modal-gift-cust-name')?.value;
  const type = document.getElementById('modal-gift-type')?.value;
  const days = Number(document.getElementById('modal-gift-days')?.value) || 60;
  const notes = document.getElementById('modal-gift-notes')?.value;
  let discountVal = '1 lần miễn phí';
  if (type.includes('20%')) discountVal = '20%';
  if (type.includes('tiền')) discountVal = document.getElementById('modal-gift-val')?.value || '50.000 đ';

  if (!rawP) {
    alert('Không tìm thấy SĐT khách!');
    return;
  }

  const vouchers = getStored('vouchers', DEFAULT_VOUCHERS);
  const vId = 'VC' + Date.now().toString().slice(-6);
  const now = new Date();
  now.setDate(now.getDate() + days);
  const expDate = normalizeDateKey(now);

  vouchers.push({
    voucher_id: vId,
    customer_phone: rawP,
    raw_phone: rawP,
    customer_name: name,
    voucher_type: type,
    discount_value: discountVal,
    expiry_date: expDate,
    status: 'Chưa dùng',
    used_receipt_id: '',
    notes: notes
  });
  setStored('vouchers', vouchers);

  const customers = getStored('customers', DEFAULT_CUSTOMERS);
  customers.forEach(c => {
    if (normalizePhone(c.phone_number || c.raw_phone) === rawP) {
      c.voucher_count = (c.voucher_count || 0) + 1;
    }
  });
  setStored('customers', customers);

  const gasUrl = getStored('gas_url', '');
  if (gasUrl) {
    fetch(gasUrl, {
      method: 'POST',
      body: JSON.stringify({
        action: 'gift_voucher',
        customer_phone: rawP,
        customer_name: name,
        voucher_type: type,
        discount_value: discountVal,
        expiry_days: days,
        notes: notes
      })
    }).catch(() => {});
  }

  closeGiftVoucherModal();
  alert(`🎁 Đã tặng thành công Voucher cho ${name}!`);
  loadAdminCustomersList();
}
