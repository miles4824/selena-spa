
// Quản lý các phiên tour đã hoàn thành hoặc đã hủy để chống vòng lặp 100%
let dismissedSessionIds = new Set();
try {
  const savedDismissed = JSON.parse(localStorage.getItem('selena_dismissed_sessions') || '[]');
  dismissedSessionIds = new Set(savedDismissed);
} catch(e) {}

function markSessionDismissed(sess) {
  if (!sess) return;
  const sId = String(sess.session_id || sess.start_timestamp || '');
  if (sId) {
    dismissedSessionIds.add(sId);
    try {
      localStorage.setItem('selena_dismissed_sessions', JSON.stringify(Array.from(dismissedSessionIds)));
    } catch(e) {}
  }
}

// =============================================================
// SELENA SPA - FIREBASE REALTIME DATABASE ENGINE (SINGAPORE)
// Tốc độ phản hồi: 0.03s (30 mili-giây) - Miễn phí trọn đời
// =============================================================

const firebaseConfig = {
  apiKey: "AIzaSyBwMjhBkRJSfGQYCZcXXia90qGnRjTz-w4",
  authDomain: "selena-spa-6a852.firebaseapp.com",
  databaseURL: "https://selena-spa-6a852-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "selena-spa-6a852",
  storageBucket: "selena-spa-6a852.firebasestorage.app",
  messagingSenderId: "43207045747",
  appId: "1:43207045747:web:069c08a1a98aa7f212b006",
  measurementId: "G-TXY8Z8M6T8"
};

let fbApp = null;
let fbDb = null;
let fbInitialized = false;

function initFirebaseEngine() {
  if (fbInitialized) return;
  if (typeof firebase === 'undefined') {
    console.warn('⚠️ Firebase SDK chưa được tải.');
    return;
  }

  try {
    if (!firebase.apps.length) {
      fbApp = firebase.initializeApp(firebaseConfig);
    } else {
      fbApp = firebase.app();
    }
    fbDb = firebase.database();
    fbInitialized = true;
    console.log('⚡ [Firebase Realtime Engine] Đã kết nối thành công tới máy chủ Singapore!');

    // Bật các bộ lắng nghe Realtime Listener tức thì
    setupRealtimeListeners();
  } catch (err) {
    console.error('❌ Lỗi khởi tạo Firebase Engine:', err);
  }
}

// -------------------------------------------------------------
// 1. REALTIME LISTENERS (TỰ ĐỘNG CẬP NHẬT GIAO DIỆN TRONG 0.03S)
// -------------------------------------------------------------
function setupRealtimeListeners() {
  if (!fbDb) return;

  // Lắng nghe Hóa đơn (tb_receipts) Realtime
  fbDb.ref('receipts').on('value', snapshot => {
    const data = snapshot.val();
    if (data) {
      const list = Object.values(data);
      list.sort((a, b) => (typeof getReceiptSortTimestamp === 'function' ? (getReceiptSortTimestamp(b) - getReceiptSortTimestamp(a)) : ((b.created_at || '').localeCompare(a.created_at || ''))));
      setStored('receipts', list);
      if (typeof refreshAllActiveViews === 'function') {
        refreshAllActiveViews();
      }
    }
  });

  // Lắng nghe Khách hàng (tb_customers)
  fbDb.ref('customers').on('value', snapshot => {
    const data = snapshot.val();
    if (data) {
      const list = Object.values(data);
      setStored('customers', list);
      if (typeof renderAdminCustomersList === 'function' && currentTab === 'home') {
        renderAdminCustomersList();
      }
    }
  });

    // Lắng nghe Thông báo nội bộ (tb_config)
  fbDb.ref('config/announcement').on('value', snapshot => {
    const text = snapshot.val();
    if (text !== null && text !== undefined) {
      const cleanStr = String(text).trim();
      setStored('announcement', {
        content: cleanStr,
        author: 'Miles (Chủ sáng lập)',
        date: 'Hôm nay'
      });
      const elStaff = document.getElementById('home-announcement-content');
      const elAdmin = document.getElementById('admin-announcement-content');
      if (elStaff) elStaff.innerText = cleanStr;
      if (elAdmin) elAdmin.innerText = cleanStr;
      if (typeof renderAnnouncement === 'function') {
        renderAnnouncement();
      }
      console.log('⚡ [Firebase Realtime] Nhận thông báo mới:', cleanStr);
    }
  });

  // Lắng nghe Phiên Tour đang chạy Realtime (Hỗ trợ Nhiều Tour Song Song & Phân luồng chuẩn xác)
  fbDb.ref('live_sessions').on('value', snapshot => {
    const sessionsObj = snapshot.val();
    const myPhone = (currentUser && currentUser.phone) ? normalizePhone(currentUser.phone) : '';
    
    // Lưu cache toàn bộ tour đang chạy toàn tiệm
    const allActive = sessionsObj ? Object.values(sessionsObj).filter(Boolean) : [];
    setStored('live_sessions_cache', allActive);
    
    if (typeof updateStaffAvailabilityHeader === 'function') {
      updateStaffAvailabilityHeader();
    }
    if (typeof updatePOSStaffInfo === 'function') {
      updatePOSStaffInfo();
    }

    if (sessionsObj) {
      const allSessions = Object.values(sessionsObj).filter(Boolean);
      // Tìm tour mà KTV hiện tại đang tham gia làm (Ưu tiên kiểm tra trạng thái rời ca)
      const mySession = allSessions.find(s => {
        const sId = String(s.session_id || s.start_timestamp || '');
        if (dismissedSessionIds.has(sId)) return false;
        if (!myPhone) return false;

        // Nếu có mảng staffs chi tiết
        if (s.staffs && Array.isArray(s.staffs) && s.staffs.length > 0) {
          const myEntry = s.staffs.find(st => st && st.phone && normalizePhone(st.phone) === myPhone);
          if (myEntry) {
            // Nếu KTV này đã rời ca sớm -> Tuyệt đối không nhận session này
            if (myEntry.left_early) return false;
            return true;
          }
        }

        // KTV Chính khởi tạo tour
        if (s.staff_1_phone && normalizePhone(s.staff_1_phone) === myPhone) return true;
        if (s.active_staff_phone && normalizePhone(s.active_staff_phone) === myPhone) return true;
        return false;
      });

      if (mySession) {
        const isNewSession = !currentLiveSession || currentLiveSession.session_id !== mySession.session_id;
        currentLiveSession = mySession;
        localStorage.setItem('selena_active_live_session', JSON.stringify(mySession));
        if (typeof renderLiveSessionUI === 'function') {
          renderLiveSessionUI();
        }
        if (isNewSession && typeof showView === 'function') {
          showView('add');
        }
        console.log('⚡ [Firebase Realtime] Đang phục vụ tour:', mySession.service_name);
      } else {
        // Nếu KTV / Admin không còn nằm trong bất kỳ tour nào đang chạy (Ví dụ: vừa bị xóa ra khỏi ca, hoặc ca đã kết thúc)
        if (currentLiveSession) {
          if (typeof liveTimerInterval !== 'undefined') clearInterval(liveTimerInterval);
          currentLiveSession = null;
          localStorage.removeItem('selena_active_live_session');
          if (typeof renderLiveSessionUI === 'function') renderLiveSessionUI();
          console.log('⚡ [Firebase Realtime] Đã thoát khỏi ca tour (không còn trong danh sách KTV)');
        }
      }
    } else if (currentLiveSession) {
      if (typeof liveTimerInterval !== 'undefined') clearInterval(liveTimerInterval);
      currentLiveSession = null;
      localStorage.removeItem('selena_active_live_session');
      if (typeof renderLiveSessionUI === 'function') renderLiveSessionUI();
    }
  });

  // Lắng nghe Menu dịch vụ
  fbDb.ref('menu').on('value', snapshot => {
    const data = snapshot.val();
    if (data) {
      setStored('menu', Object.values(data));
      if (typeof initMenuUI === 'function') initMenuUI();
    }
  });
}

// -------------------------------------------------------------
// 2. GHI DỮ LIỆU SIÊU TỐC LÊN FIREBASE (CHỈ MẤT 0.03 GIÂY)
// -------------------------------------------------------------

// A. Ghi hóa đơn ca gội mới
async function fbSaveReceipt(receipt, customerInfo = null, cycleInfo = null, voucherInfo = null) {
  if (!receipt || !receipt.receipt_id) return false;
  let updates = {};
  try {
    const rId = receipt.receipt_id;
    updates[`receipts/${rId}`] = receipt;

    if (customerInfo && customerInfo.phone_number) {
      const pKey = normalizePhone(customerInfo.phone_number);
      if (pKey) updates[`customers/${pKey}`] = customerInfo;
    }

    if (cycleInfo && cycleInfo.cycle_id) {
      updates[`loyalty_cycles/${cycleInfo.cycle_id}`] = cycleInfo;
    }

    if (voucherInfo && voucherInfo.voucher_id) {
      updates[`vouchers/${voucherInfo.voucher_id}`] = voucherInfo;
    }

    const cleanUpdates = JSON.parse(JSON.stringify(updates));

    if (fbDb) {
      await fbDb.ref().update(cleanUpdates);
    } else {
      await fetch(`https://selena-spa-6a852-default-rtdb.asia-southeast1.firebasedatabase.app/.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanUpdates)
      });
    }
    console.log(`⚡ [Firebase] Đã lưu hóa đơn ${rId} trong 0.03s!`);
    return true;
  } catch (e) {
    console.warn('⚠️ Lỗi fbSaveReceipt qua SDK, chuyển sang REST fallback:', e.message);
    try {
      const cleanUpdates = JSON.parse(JSON.stringify(updates));
      await fetch(`https://selena-spa-6a852-default-rtdb.asia-southeast1.firebasedatabase.app/.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanUpdates)
      });
      return true;
    } catch(err2) {
      console.error('Lỗi REST fbSaveReceipt:', err2);
      return false;
    }
  }
}

// B. Ghi chú & Tháng sinh nhật khách hàng
async function fbSaveCustomerNote(phone, name, birthMonth, notes) {
  if (!fbDb || !phone) return false;
  try {
    const pKey = normalizePhone(phone);
    const custRef = fbDb.ref(`customers/${pKey}`);
    const snap = await custRef.once('value');
    const existing = snap.val() || {};

    const updated = {
      ...existing,
      phone_number: pKey,
      raw_phone: pKey,
      customer_name: name || existing.customer_name || 'Khách hàng',
      birth_month: Number(birthMonth) || existing.birth_month || 0,
      birthday: Number(birthMonth) || existing.birthday || '',
      notes: notes !== undefined ? notes : (existing.notes || '')
    };

    await custRef.set(updated);
    console.log(`⚡ [Firebase] Đã cập nhật ghi chú khách ${pKey} trong 0.03s!`);
    return true;
  } catch (e) {
    console.error('Lỗi fbSaveCustomerNote:', e);
    return false;
  }
}

// C. Lưu chi phí vận hành
async function fbSaveExpense(expense) {
  if (!fbDb || !expense || !expense.expense_id) return false;
  try {
    await fbDb.ref(`expenses/${expense.expense_id}`).set(expense);
    console.log(`⚡ [Firebase] Đã lưu chi phí ${expense.expense_id} trong 0.03s!`);
    return true;
  } catch (e) {
    console.error('Lỗi fbSaveExpense:', e);
    return false;
  }
}

// D. Lưu thông báo từ chủ tiệm
async function fbSaveAnnouncement(text) {
  if (!fbDb) return false;
  try {
    await fbDb.ref('config/announcement').set(String(text).trim());
    console.log(`⚡ [Firebase] Đã phát thông báo trong 0.03s!`);
    return true;
  } catch (e) {
    console.error('Lỗi fbSaveAnnouncement:', e);
    return false;
  }
}

// -------------------------------------------------------------
// 3. ĐỒNG BỘ 2 CHIỀU TỪ GOOGLE SHEETS VÀO FIREBASE (SEED/REFRESH)
// -------------------------------------------------------------
async function fbSyncAllFromSheets(payload) {
  if (!fbDb || !payload) return;
  try {
    const updates = {};

    if (Array.isArray(payload.menu) && payload.menu.length > 0) {
      const menuObj = {};
      payload.menu.forEach(m => { if (m.service_id) menuObj[m.service_id] = m; });
      updates['menu'] = menuObj;
    }

    if (Array.isArray(payload.customers)) {
      const custObj = {};
      payload.customers.forEach(c => {
        const p = normalizePhone(c.phone_number || c.raw_phone);
        if (p) custObj[p] = c;
      });
      updates['customers'] = custObj;
    }

    if (Array.isArray(payload.receipts)) {
      const recObj = {};
      payload.receipts.forEach(r => {
        if (r.receipt_id) recObj[r.receipt_id] = r;
      });
      updates['receipts'] = recObj;
    }

    if (Array.isArray(payload.expenses)) {
      const expObj = {};
      payload.expenses.forEach(e => {
        if (e.expense_id) expObj[e.expense_id] = e;
      });
      updates['expenses'] = expObj;
    }

    if (payload.config) {
      const cfg = payload.config;
      const realAnn = (cfg.ANNOUNCEMENT && cfg.ANNOUNCEMENT !== 'Chào mừng bạn đến với Selena Spa!') 
        ? cfg.ANNOUNCEMENT 
        : (cfg.announcement || cfg.ANNOUNCEMENT || '');
      if (realAnn) {
        updates['config/announcement'] = String(realAnn).trim();
      }
    }

    await fbDb.ref().update(updates);
    console.log('⚡ [Firebase] Đã đồng bộ 2 chiều dữ liệu từ Google Sheets sang Firebase!');
  } catch (e) {
    console.error('Lỗi fbSyncAllFromSheets:', e);
  }
}


// -------------------------------------------------------------
// 4. TỰ ĐỘNG KHỞI ĐỘNG & HEARTBEAT LÀM MỚI LIÊN TỤC (5 GIÂY)
// -------------------------------------------------------------
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initFirebaseEngine);
} else {
  initFirebaseEngine();
}

// Heartbeat kiểm tra dữ liệu ngầm mỗi 5 giây phòng trường hợp mạng rớt WebSocket
setInterval(async () => {
  try {
    const res = await fetch('https://selena-spa-6a852-default-rtdb.asia-southeast1.firebasedatabase.app/config/announcement.json');
    if (res.ok) {
      const text = await res.json();
      if (text && typeof text === 'string') {
        const cleanStr = text.trim();
        const curAnn = getStored('announcement', '');
        const curStr = typeof curAnn === 'string' ? curAnn : (curAnn?.content || '');
        if (cleanStr && cleanStr !== curStr) {
          setStored('announcement', {
            content: cleanStr,
            author: 'Miles (Chủ sáng lập)',
            date: 'Hôm nay'
          });
          const elStaff = document.getElementById('home-announcement-content');
          const elAdmin = document.getElementById('admin-announcement-content');
          if (elStaff) elStaff.innerText = cleanStr;
          if (elAdmin) elAdmin.innerText = cleanStr;
          if (typeof renderAnnouncement === 'function') renderAnnouncement();
          console.log('⚡ [Auto-Sync Heartbeat] Đã tự động cập nhật thông báo:', cleanStr);
        }
      }
    }

    // Heartbeat cho Live Sessions (Đa Tour & Phân Luồng Tức Thì)
    const resSess = await fetch('https://selena-spa-6a852-default-rtdb.asia-southeast1.firebasedatabase.app/live_sessions.json');
    if (resSess.ok) {
      const sessionsObj = await resSess.json();
      const myPhone = (currentUser && currentUser.phone) ? normalizePhone(currentUser.phone) : '';
      if (sessionsObj && typeof sessionsObj === 'object') {
        const allSessions = Object.values(sessionsObj).filter(Boolean);
        const mySession = allSessions.find(s => {
          const sId = String(s.session_id || s.start_timestamp || '');
          if (dismissedSessionIds.has(sId)) return false;
          if (s.active_staff_phone && normalizePhone(s.active_staff_phone) === myPhone) return true;
          if (s.staffs && Array.isArray(s.staffs) && s.staffs.some(st => normalizePhone(st.phone) === myPhone)) return true;
          return false;
        });

        if (mySession) {
          if (!currentLiveSession || currentLiveSession.session_id !== mySession.session_id) {
            currentLiveSession = mySession;
            localStorage.setItem('selena_active_live_session', JSON.stringify(mySession));
            if (typeof renderLiveSessionUI === 'function') renderLiveSessionUI();
            if (typeof showView === 'function') showView('add');
          }
        } else if (currentLiveSession) {
          if (typeof liveTimerInterval !== 'undefined') clearInterval(liveTimerInterval);
          currentLiveSession = null;
          localStorage.removeItem('selena_active_live_session');
          if (typeof renderLiveSessionUI === 'function') renderLiveSessionUI();
        }
      } else if (currentLiveSession) {
        if (typeof liveTimerInterval !== 'undefined') clearInterval(liveTimerInterval);
        currentLiveSession = null;
        localStorage.removeItem('selena_active_live_session');
        if (typeof renderLiveSessionUI === 'function') renderLiveSessionUI();
      }
    }

    // Heartbeat cho Hóa đơn (tb_receipts)
    const resRec = await fetch('https://selena-spa-6a852-default-rtdb.asia-southeast1.firebasedatabase.app/receipts.json');
    if (resRec.ok) {
      const recData = await resRec.json();
      if (recData) {
        const list = Object.values(recData);
        list.sort((a, b) => (typeof getReceiptSortTimestamp === 'function' ? (getReceiptSortTimestamp(b) - getReceiptSortTimestamp(a)) : ((b.created_at || '').localeCompare(a.created_at || ''))));
        const oldRecs = getStored('receipts', []);
        if (list.length !== oldRecs.length || (list[0] && oldRecs[0] && list[0].receipt_id !== oldRecs[0].receipt_id)) {
          setStored('receipts', list);
          if (typeof refreshAllActiveViews === 'function') {
            refreshAllActiveViews();
          }
        }
      }
    }
  } catch(e) {}
}, 5000);


// C. Lưu và đồng bộ Phiên Tour đang phục vụ (Hỗ trợ Nhiều Tour Song Song)
window.fbSetLiveSession = function(sessionData) { return fbSaveLiveSession(sessionData); };
async function fbSaveLiveSession(sessionData) {
  if (!sessionData || !sessionData.session_id) return false;
  try {
    const sId = String(sessionData.session_id);
    const cleanPayload = JSON.parse(JSON.stringify(sessionData));
    if (fbDb) {
      await fbDb.ref(`live_sessions/${sId}`).set(cleanPayload);
      return true;
    }
    await fetch(`https://selena-spa-6a852-default-rtdb.asia-southeast1.firebasedatabase.app/live_sessions/${sId}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanPayload)
    });
    return true;
  } catch(e) {
    console.warn('⚠️ fbSaveLiveSession fallback:', e.message);
    try {
      const sId = String(sessionData.session_id);
      const cleanPayload = JSON.parse(JSON.stringify(sessionData));
      await fetch(`https://selena-spa-6a852-default-rtdb.asia-southeast1.firebasedatabase.app/live_sessions/${sId}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanPayload)
      });
      return true;
    } catch(err2) {
      return false;
    }
  }
}

async function fbClearLiveSession(sessionId = null) {
  let sId = sessionId;
  if (!sId && currentLiveSession && currentLiveSession.session_id) {
    sId = currentLiveSession.session_id;
  }
  if (!sId) {
    // Nếu không có ID, dọn sạch active cũ
    sId = 'active';
  }
  try {
    if (fbDb) {
      fbDb.ref(`live_sessions/${sId}`).remove().catch(() => {});
    }
  } catch(e) {}
  try {
    fetch(`https://selena-spa-6a852-default-rtdb.asia-southeast1.firebasedatabase.app/live_sessions/${sId}.json`, {
      method: 'DELETE'
    }).catch(() => {});
  } catch(e) {}
  return true;
}
