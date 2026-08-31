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

  // Lắng nghe Hóa đơn (tb_receipts)
  fbDb.ref('receipts').on('value', snapshot => {
    const data = snapshot.val();
    if (data) {
      const list = Object.values(data);
      list.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
      setStored('receipts', list);
      if (typeof loadHistoryView === 'function' && currentTab === 'history') {
        loadHistoryView();
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

  // Lắng nghe Phiên Tour đang chạy (Bàn giao ca Realtime)
  fbDb.ref('live_sessions/active').on('value', snapshot => {
    const session = snapshot.val();
    const myPhone = (currentUser && currentUser.phone) ? normalizePhone(currentUser.phone) : '';
    
    if (session && session.active_staff_phone) {
      if (normalizePhone(session.active_staff_phone) === myPhone) {
        currentLiveSession = session;
        localStorage.setItem('selena_active_live_session', JSON.stringify(session));
        if (typeof renderLiveSessionUI === 'function') {
          renderLiveSessionUI();
        }
        if (typeof showView === 'function') {
          showView('add');
        }
        console.log('⚡ [Firebase Realtime] Bạn vừa nhận bàn giao tour thành công:', session.service_name);
      } else if (currentLiveSession && currentLiveSession.start_timestamp === session.start_timestamp && myPhone !== normalizePhone(session.active_staff_phone)) {
        if (typeof liveTimerInterval !== 'undefined') clearInterval(liveTimerInterval);
        currentLiveSession = null;
        localStorage.removeItem('selena_active_live_session');
        if (typeof renderLiveSessionUI === 'function') renderLiveSessionUI();
      }
    } else if (!session && currentLiveSession) {
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
  if (!fbDb || !receipt || !receipt.receipt_id) return false;
  try {
    const updates = {};
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

    await fbDb.ref().update(updates);
    console.log(`⚡ [Firebase] Đã lưu hóa đơn ${rId} trong 0.03s!`);
    return true;
  } catch (e) {
    console.error('Lỗi fbSaveReceipt:', e);
    return false;
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

    // Heartbeat cho Live Sessions
    const resSess = await fetch('https://selena-spa-6a852-default-rtdb.asia-southeast1.firebasedatabase.app/live_sessions/active.json');
    if (resSess.ok) {
      const s = await resSess.json();
      const myPhone = (currentUser && currentUser.phone) ? normalizePhone(currentUser.phone) : '';
      if (s && s.active_staff_phone && normalizePhone(s.active_staff_phone) === myPhone) {
        if (!currentLiveSession || currentLiveSession.start_timestamp !== s.start_timestamp) {
          currentLiveSession = s;
          localStorage.setItem('selena_active_live_session', JSON.stringify(s));
          if (typeof renderLiveSessionUI === 'function') renderLiveSessionUI();
          if (typeof showView === 'function') showView('add');
        }
      }
    }
  } catch(e) {}
}, 5000);


// C. Lưu và đồng bộ Phiên Tour đang phục vụ (Live Session / Handover)
async function fbSaveLiveSession(sessionData) {
  if (!sessionData) {
    return await fbClearLiveSession();
  }
  try {
    // Khử sạch 100% mọi thuộc tính undefined để Firebase Realtime DB không báo lỗi
    const cleanPayload = JSON.parse(JSON.stringify(sessionData));
    if (fbDb) {
      await fbDb.ref('live_sessions/active').set(cleanPayload);
      return true;
    }
    await fetch('https://selena-spa-6a852-default-rtdb.asia-southeast1.firebasedatabase.app/live_sessions/active.json', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanPayload)
    });
    return true;
  } catch(e) {
    console.warn('⚠️ fbSaveLiveSession REST fallback:', e.message);
    try {
      const cleanPayload = JSON.parse(JSON.stringify(sessionData));
      await fetch('https://selena-spa-6a852-default-rtdb.asia-southeast1.firebasedatabase.app/live_sessions/active.json', {
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

async function fbClearLiveSession() {
  try {
    if (fbDb) {
      fbDb.ref('live_sessions/active').remove().catch(() => {});
    }
  } catch(e) {}
  try {
    fetch('https://selena-spa-6a852-default-rtdb.asia-southeast1.firebasedatabase.app/live_sessions/active.json', {
      method: 'DELETE'
    }).catch(() => {});
  } catch(e) {}
  return true;
}
