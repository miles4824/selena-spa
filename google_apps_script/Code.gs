function formatTimeVal(val) {
  if (!val) return '12:00';
  if (val instanceof Date) {
    return Utilities.formatDate(val, 'GMT+7', 'HH:mm');
  }
  let s = String(val).trim();
  if (s.includes('GMT') || s.includes('1899')) {
    try {
      return Utilities.formatDate(new Date(val), 'GMT+7', 'HH:mm');
    } catch(e) {}
  }
  let match = s.match(/(\d{1,2}):(\d{2})/);
  if (match) return `${match[1].padStart(2, '0')}:${match[2]}`;
  return s;
}

function formatDateVal(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, 'GMT+7', 'yyyy-MM-dd');
  }
  let s = String(val).trim();
  let match = s.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (match) return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
  try {
    let d = new Date(val);
    if (!isNaN(d.getTime()) && d.getFullYear() > 1970) {
      return Utilities.formatDate(d, 'GMT+7', 'yyyy-MM-dd');
    }
  } catch(e) {}
  return s;
}

function addDaysToDate(dateStr, days) {
  try {
    let d = new Date(dateStr);
    if (isNaN(d.getTime())) d = new Date();
    d.setDate(d.getDate() + days);
    return Utilities.formatDate(d, 'GMT+7', 'yyyy-MM-dd');
  } catch(e) {
    let d2 = new Date();
    d2.setDate(d2.getDate() + days);
    return Utilities.formatDate(d2, 'GMT+7', 'yyyy-MM-dd');
  }
}

function getDaysDiff(d1Str, d2Str) {
  try {
    let d1 = new Date(d1Str);
    let d2 = new Date(d2Str);
    let diff = Math.abs(d2.getTime() - d1.getTime());
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  } catch(e) {
    return 0;
  }
}

function parseBirthMonth(val) {
  if (!val) return 0;
  if (typeof val === 'number' && val >= 1 && val <= 12) return val;
  if (val instanceof Date) {
    return val.getMonth() + 1;
  }
  let s = String(val).trim();
  let mMatch = s.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (mMatch) return Number(mMatch[2]);
  let num = parseInt(s.replace(/[^\d]/g, ''), 10);
  if (!isNaN(num) && num >= 1 && num <= 12) return num;
  return 0;
}

function normalizePhone(p) {
  if (!p) return '';
  let clean = String(p).replace(/[^0-9]/g, '');
  if (clean.length === 9 && !clean.startsWith('0')) {
    clean = '0' + clean;
  }
  return clean;
}

function matchPhone(p1, p2) {
  if (!p1 || !p2) return false;
  let s1 = normalizePhone(p1);
  let s2 = normalizePhone(p2);
  if (s1 === s2) return true;
  let raw1 = s1.replace(/^0+/, '');
  let raw2 = s2.replace(/^0+/, '');
  return raw1 === raw2;
}

/**
 * =========================================================================
 * SELENA SPA - API GOOGLE APPS SCRIPT (GAS SERVER BACKEND V2.7 - FIX KHỚP SĐT 100%)
 * =========================================================================
 */

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    let params = {};
    if (e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (err) {
        params = e.parameter || {};
      }
    } else {
      params = e.parameter || {};
    }

    const action = params.action || 'ping';
    let result = { success: false, error: 'UNKNOWN_ACTION' };

    switch (action) {
      case 'ping':
        result = { success: true, message: 'Selena Spa Dynamic Backend v2.7 is active!', timestamp: new Date().toISOString() };
        break;

      case 'login':
        result = handleLogin(params);
        break;

      case 'sync_all_data':
        result = syncAllData(params);
        break;

      case 'get_menu':
        result = getMenuList();
        break;

      case 'check_customer':
        result = checkCustomer(params.phone_number);
        break;

      case 'update_customer_notes':
        result = updateCustomerNotes(params);
        break;

      case 'gift_voucher':
        result = giftVoucher(params);
        break;

      case 'create_receipt':
        result = createReceipt(params);
        break;

      case 'add_expense':
        result = addExpense(params);
        break;

      case 'update_announcement':
        result = updateAnnouncement(params);
        break;

      default:
        result = { success: false, error: 'ACTION_NOT_SUPPORTED', action: action };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'SERVER_ERROR',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function parsePercentage(val) {
  if (val === undefined || val === null || val === '') return 10;
  if (typeof val === 'number') {
    if (val > 0 && val <= 1) return Math.round(val * 100);
    return Math.round(val);
  }
  let s = String(val).trim();
  if (s.includes('%')) {
    let num = parseFloat(s.replace('%', ''));
    return isNaN(num) ? 10 : num;
  }
  let num = parseFloat(s);
  if (isNaN(num)) return 10;
  if (num > 0 && num <= 1) return Math.round(num * 100);
  return num;
}

function isOwnerCheck(role, phone, staffId) {
  const r = String(role || '').toLowerCase();
  const p = normalizePhone(phone);
  const s = String(staffId || '').trim();
  return (r === 'admin' || r === 'chủ tiệm' || r === 'chủ sáng lập' || r === 'owner' || p === '0949251144' || s === 'FOUNDER_01');
}

function createHeaderMap(sheet) {
  const map = {};
  if (!sheet) return map;
  const lastCol = sheet.getLastColumn();
  if (lastCol < 1) return map;
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  for (let i = 0; i < headers.length; i++) {
    let key = String(headers[i] || '').trim().toLowerCase();
    if (key) map[key] = i;
  }
  return map;
}

function getCell(row, colMap, keyList, fallback = '') {
  if (!Array.isArray(keyList)) keyList = [keyList];
  for (let k of keyList) {
    let lk = k.toLowerCase();
    if (colMap[lk] !== undefined && row[colMap[lk]] !== undefined && row[colMap[lk]] !== '') {
      return row[colMap[lk]];
    }
  }
  return fallback;
}

// -------------------------------------------------------------
// 1. XỬ LÝ ĐĂNG NHẬP
// -------------------------------------------------------------
function handleLogin(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetUsers = ss.getSheetByName('tb_users');
  const inputPhone = normalizePhone(params.phone || params.username || params.user_id);
  const inputPwd = String(params.password || params.pin || '').trim();

  if (!sheetUsers) return { success: false, error: 'NO_USERS_SHEET' };

  const colMap = createHeaderMap(sheetUsers);
  const data = sheetUsers.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    let row = data[i];
    let uUserId = getCell(row, colMap, ['user_id', 'phone', 'so_dien_thoai']);
    let uStaffId = String(getCell(row, colMap, ['staff_id', 'ma_ktv', 'user_id'])).trim();
    let uPhone = getCell(row, colMap, ['phone', 'user_id', 'so_dien_thoai']);
    let uPwd = String(getCell(row, colMap, ['password', 'pin'], '123456')).trim();
    let fullName = String(getCell(row, colMap, ['full_name', 'ten_nhan_vien', 'ho_ten'])).trim();
    let role = String(getCell(row, colMap, ['role', 'chuc_vu'], 'staff')).trim();
    let salaryType = String(getCell(row, colMap, ['salary_type', 'loai_luong'], 'fixed')).trim();
    let commRate = parsePercentage(getCell(row, colMap, ['commission_rate', 'rate', 'hoa_hong'], 10));
    let baseSalary = Number(String(getCell(row, colMap, ['base_salary', 'luong_cung'], 0)).replace(/[^\d]/g, '')) || 0;

    let matchUser = (matchPhone(inputPhone, uPhone) || matchPhone(inputPhone, uUserId) || inputPhone === uStaffId);
    let matchPwd = (inputPwd === uPwd);

    if (matchUser && matchPwd) {
      const isOwner = isOwnerCheck(role, uPhone, uStaffId);
      return {
        success: true,
        user: {
          user_id: normalizePhone(uUserId) || normalizePhone(uPhone),
          staff_id: uStaffId || uUserId,
          phone: normalizePhone(uPhone),
          full_name: fullName || (isOwner ? 'Miles (Chủ tiệm)' : 'KTV Selena'),
          role: isOwner ? 'Chủ tiệm' : 'Kỹ thuật viên',
          salary_type: salaryType,
          commission_rate: commRate,
          base_salary: baseSalary
        }
      };
    }
  }

  return { success: false, error: 'INVALID_CREDENTIALS', message: 'Số điện thoại hoặc mật khẩu không chính xác' };
}

// -------------------------------------------------------------
// 2. LẤY BẢNG GIÁ COMBO (MENU)
// -------------------------------------------------------------
function getMenuList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('tb_menu');
  if (!sheet) return { success: false, error: 'NO_MENU_SHEET' };

  const colMap = createHeaderMap(sheet);
  const data = sheet.getDataRange().getValues();
  let menu = [];

  for (let i = 1; i < data.length; i++) {
    let row = data[i];
    let id = String(getCell(row, colMap, ['service_id', 'combo_id']));
    let name = String(getCell(row, colMap, ['service_name', 'ten_combo', 'name']));
    if (id && name) {
      let price = Number(getCell(row, colMap, ['price', 'gia'], 0)) || 0;
      let duration = Number(getCell(row, colMap, ['duration_min', 'thoi_gian'], 30)) || 30;
      let cosmetics = Number(getCell(row, colMap, ['cosmetics_cost', 'my_pham'], 0)) || 0;
      let commVal = Number(getCell(row, colMap, ['commission_value', 'hoa_hong'], price * 0.1)) || (price * 0.1);

      menu.push({
        service_id: id,
        service_name: name,
        price: price,
        duration_min: duration,
        cosmetics_cost: cosmetics,
        commission_value: commVal
      });
    }
  }
  return { success: true, menu: menu };
}

// -------------------------------------------------------------
// 3. TRA CỨU KHÁCH HÀNG (TB_CUSTOMERS, TB_LOYALTY_CYCLES & TB_VOUCHERS)
// -------------------------------------------------------------
function checkCustomer(phoneNumber) {
  const phone = normalizePhone(phoneNumber);
  if (!phone) return { success: false, error: 'PHONE_EMPTY' };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetCust = ss.getSheetByName('tb_customers');
  const sheetCycles = ss.getSheetByName('tb_loyalty_cycles');
  const sheetVouchers = ss.getSheetByName('tb_vouchers');

  let customer = null;
  const now = new Date();
  const todayStr = Utilities.formatDate(now, 'GMT+7', 'yyyy-MM-dd');
  const currentMonth = now.getMonth() + 1;

  if (sheetCust) {
    const colMapC = createHeaderMap(sheetCust);
    const dataC = sheetCust.getDataRange().getValues();
    for (let i = 1; i < dataC.length; i++) {
      let row = dataC[i];
      let cPhone = getCell(row, colMapC, ['phone_number', 'phone', 'so_dien_thoai']);
      if (matchPhone(cPhone, phone)) {
        let rawBday = getCell(row, colMapC, ['birthday', 'birth_month', 'ngay_sinh']);
        let cycleStart = formatDateVal(getCell(row, colMapC, ['cycle_start_date', 'ngay_bat_dau_chu_ky']));
        let cycleVisits = Number(getCell(row, colMapC, ['cycle_visits', 'so_lan_chu_ky'], 0)) || 0;
        let totalVisits = Number(getCell(row, colMapC, ['total_visits', 'tong_so_lan'], 0)) || 0;
        let voucherCount = Number(getCell(row, colMapC, ['voucher_count', 'so_voucher'], 0)) || 0;
        let notes = String(getCell(row, colMapC, ['notes', 'ghi_chu'], ''));

        let bMonth = parseBirthMonth(rawBday);
        let cycleEnd = cycleStart ? addDaysToDate(cycleStart, 60) : '';
        let isCycleExpired = (cycleEnd && todayStr > cycleEnd);

        customer = {
          phone_number: normalizePhone(cPhone),
          customer_name: String(getCell(row, colMapC, ['customer_name', 'name', 'ten_khach'])),
          birthday: bMonth ? bMonth : (formatDateVal(rawBday) || String(rawBday)),
          birth_month: bMonth,
          cycle_start_date: cycleStart,
          cycle_end_date: cycleEnd,
          cycle_visits: isCycleExpired ? 0 : cycleVisits,
          total_visits: totalVisits,
          voucher_count: voucherCount,
          notes: notes,
          is_cycle_expired: isCycleExpired
        };
        break;
      }
    }
  }

  // Active Loyalty Cycle từ tb_loyalty_cycles
  let activeCycle = null;
  if (sheetCycles) {
    const colMapCy = createHeaderMap(sheetCycles);
    const dataCy = sheetCycles.getDataRange().getValues();
    for (let i = 1; i < dataCy.length; i++) {
      let row = dataCy[i];
      let cyPhone = getCell(row, colMapCy, ['customer_phone', 'phone']);
      let status = String(getCell(row, colMapCy, ['status', 'trang_thai'], '')).toUpperCase();
      if (matchPhone(cyPhone, phone) && status === 'ACTIVE') {
        let endDateStr = formatDateVal(getCell(row, colMapCy, ['end_date', 'ngay_ket_thuc']));
        let isExpired = (todayStr > endDateStr);
        activeCycle = {
          cycle_id: String(getCell(row, colMapCy, ['cycle_id', 'ma_chu_ky'])),
          start_date: formatDateVal(getCell(row, colMapCy, ['start_date', 'ngay_bat_dau'])),
          end_date: endDateStr,
          visits_count: Number(getCell(row, colMapCy, ['visits_count', 'so_lan'], 0)) || 0,
          status: isExpired ? 'EXPIRED' : 'ACTIVE',
          is_expired: isExpired
        };
        break;
      }
    }
  }

  // Vouchers từ tb_vouchers
  let availableVouchers = [];
  if (sheetVouchers) {
    const colMapV = createHeaderMap(sheetVouchers);
    const dataV = sheetVouchers.getDataRange().getValues();
    for (let i = 1; i < dataV.length; i++) {
      let row = dataV[i];
      let vPhone = getCell(row, colMapV, ['customer_phone', 'phone']);
      let status = String(getCell(row, colMapV, ['status', 'trang_thai'], '')).toLowerCase();
      if (matchPhone(vPhone, phone) && (status.includes('chưa') || status === 'active' || status === 'unused')) {
        let expDate = formatDateVal(getCell(row, colMapV, ['expiry_date', 'han_dung']));
        if (!expDate || expDate >= todayStr) {
          availableVouchers.push({
            voucher_id: String(getCell(row, colMapV, ['voucher_id', 'ma_voucher'])),
            voucher_type: String(getCell(row, colMapV, ['voucher_type', 'loai_voucher'])),
            discount_value: String(getCell(row, colMapV, ['discount_value', 'giam_gia'])),
            expiry_date: expDate,
            notes: String(getCell(row, colMapV, ['notes', 'ghi_chu']))
          });
        }
      }
    }
  }

  let isBirthMonth = (customer && customer.birth_month === currentMonth);

  return {
    success: true,
    found: !!customer,
    phone_number: phone,
    customer: customer,
    active_cycle: activeCycle,
    vouchers: availableVouchers,
    is_birth_month: isBirthMonth
  };
}

// -------------------------------------------------------------
// 3B. CẬP NHẬT GHI CHÚ SỞ THÍCH & NGÀY SINH KHÁCH HÀNG (8 CỘT)
// -------------------------------------------------------------
function updateCustomerNotes(params) {
  const phone = normalizePhone(params.phone_number || params.customer_phone);
  if (!phone) return { success: false, error: 'PHONE_EMPTY' };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetCust = ss.getSheetByName('tb_customers');
  if (!sheetCust) return { success: false, error: 'NO_CUSTOMER_SHEET' };

  const colMapC = createHeaderMap(sheetCust);
  const dataC = sheetCust.getDataRange().getValues();
  let foundRow = -1;

  for (let i = 1; i < dataC.length; i++) {
    let cPhone = getCell(dataC[i], colMapC, ['phone_number', 'phone']);
    if (matchPhone(cPhone, phone)) {
      foundRow = i + 1;
      break;
    }
  }

  const newNotes = params.notes !== undefined ? String(params.notes).trim() : null;
  let newBMonthNum = Number(params.birth_month) || parseBirthMonth(params.birthday);
  const newBirthday = newBMonthNum ? newBMonthNum : (params.birthday ? String(params.birthday).trim() : null);
  const newName = params.customer_name ? String(params.customer_name).trim() : null;

  if (foundRow > 0) {
    if (newNotes !== null) {
      let colNotes = colMapC['notes'] !== undefined ? colMapC['notes'] + 1 : 8;
      sheetCust.getRange(foundRow, colNotes).setValue(newNotes);
    }
    if (newBirthday !== null) {
      let colBday = colMapC['birthday'] !== undefined ? colMapC['birthday'] + 1 : 3;
      sheetCust.getRange(foundRow, colBday).setValue(newBirthday);
    }
    if (newName && newName !== 'Khách hàng') {
      let colName = colMapC['customer_name'] !== undefined ? colMapC['customer_name'] + 1 : 2;
      sheetCust.getRange(foundRow, colName).setValue(newName);
    }
  } else {
    const todayStr = Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd');
    // Chuẩn 8 cột: phone_number, customer_name, birthday, cycle_start_date, cycle_visits, total_visits, voucher_count, notes
    sheetCust.appendRow([
      phone,
      newName || 'Khách hàng',
      newBirthday || '',
      todayStr,
      1,
      1,
      0,
      newNotes || ''
    ]);
  }

  return { success: true, message: 'Đã cập nhật thông tin khách hàng thành công!' };
}

// -------------------------------------------------------------
// 3C. CHỦ TIỆM TẶNG VOUCHER CHO KHÁCH (ĐỒNG BỘ CẢ 2 BẢNG)
// -------------------------------------------------------------
function giftVoucher(params) {
  const phone = normalizePhone(params.customer_phone || params.phone_number);
  const name = String(params.customer_name || 'Khách hàng').trim();
  if (!phone) return { success: false, error: 'PHONE_EMPTY' };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetVouchers = ss.getSheetByName('tb_vouchers');
  const sheetCust = ss.getSheetByName('tb_customers');

  const now = new Date();
  const todayStr = Utilities.formatDate(now, 'GMT+7', 'yyyy-MM-dd');
  const voucherId = 'VC' + Utilities.formatDate(now, 'GMT+7', 'yyMMddHHmmss');
  const vType = String(params.voucher_type || 'Chủ tiệm tặng').trim();
  const discountVal = String(params.discount_value || '50.000 đ').trim();
  const expiryDays = Number(params.expiry_days) || 60;
  const expiryDate = params.expiry_date || addDaysToDate(todayStr, expiryDays);
  const notes = String(params.notes || 'Tri ân khách hàng thân thiết').trim();

  // 1. Thêm vào tb_vouchers
  if (sheetVouchers) {
    sheetVouchers.appendRow([
      voucherId,
      phone,
      name,
      vType,
      discountVal,
      expiryDate,
      'Chưa dùng',
      '',
      notes
    ]);
  }

  // 2. Tăng voucher_count trong tb_customers (Cột 7)
  if (sheetCust) {
    const colMapC = createHeaderMap(sheetCust);
    const dataC = sheetCust.getDataRange().getValues();
    let found = false;

    for (let i = 1; i < dataC.length; i++) {
      let cPhone = getCell(dataC[i], colMapC, ['phone_number', 'phone']);
      if (matchPhone(cPhone, phone)) {
        let vCount = Number(getCell(dataC[i], colMapC, ['voucher_count', 'so_voucher'], 0)) || 0;
        let colV = colMapC['voucher_count'] !== undefined ? colMapC['voucher_count'] + 1 : 7;
        sheetCust.getRange(i + 1, colV).setValue(vCount + 1);
        found = true;
        break;
      }
    }

    if (!found) {
      sheetCust.appendRow([
        phone,
        name,
        '',
        todayStr,
        0,
        0,
        1,
        notes
      ]);
    }
  }

  return { success: true, voucher_id: voucherId, message: 'Đã tặng voucher thành công!' };
}

// -------------------------------------------------------------
// 4. TẠO HÓA ĐƠN CA LÀM & ĐỒNG BỘ 4 BẢNG (TB_RECEIPTS, TB_LOYALTY_CYCLES, TB_VOUCHERS, TB_CUSTOMERS)
// -------------------------------------------------------------
function createReceipt(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetReceipts = ss.getSheetByName('tb_receipts');
  const sheetCustomers = ss.getSheetByName('tb_customers');
  const sheetCycles = ss.getSheetByName('tb_loyalty_cycles');
  const sheetVouchers = ss.getSheetByName('tb_vouchers');

  const now = new Date();
  const timeStr = Utilities.formatDate(now, 'GMT+7', 'HH:mm');
  const dateStr = params.date || Utilities.formatDate(now, 'GMT+7', 'yyyy-MM-dd');
  const fullTimeStr = Utilities.formatDate(now, 'GMT+7', 'yyyy/MM/dd - HH:mm');
  const receiptId = params.receipt_id || ('HD' + Utilities.formatDate(now, 'GMT+7', 'yyMMddHHmmss'));

  const startTime = params.start_time || params.time || timeStr;
  const endTime = params.end_time || timeStr;
  let durationMin = parseFloat(params.duration_min);
  if (isNaN(durationMin) || durationMin <= 0) {
    if (startTime && endTime && startTime.includes(':') && endTime.includes(':')) {
      let p1 = startTime.split(':').map(Number);
      let p2 = endTime.split(':').map(Number);
      let diff = (p2[0] * 60 + p2[1]) - (p1[0] * 60 + p1[1]);
      if (diff < 0) diff += 1440;
      durationMin = diff > 0 ? diff : 1;
    } else {
      durationMin = params.duration_target_min || 45;
    }
  } else {
    durationMin = Math.round(durationMin * 10) / 10;
  }

  const phone = normalizePhone(params.customer_phone || params.phone);
  const customerName = params.customer_name || (phone ? 'Khách hàng' : 'Khách vãng lai');
  const serviceId = params.service_id || params.combo_id || 'CB01';
  const serviceName = params.service_name || params.combo_name || 'Combo 1';
  const price = Number(params.price) || 0;
  const tipAmount = Number(params.tip_amount || params.tip) || 0;
  const totalPaid = Number(params.total_paid !== undefined ? params.total_paid : (price + tipAmount)) || 0;

  const s1Phone = normalizePhone(params.staff_1_user_id || params.staff_1_phone || params.staff_id || params.staff_phone);
  const s1Id = params.staff_1_id || 'KTV01';
  const s1Name = params.staff_1_name || params.staff_name || 'KTV';
  const s1Comm = Number(params.staff_1_comm !== undefined ? params.staff_1_comm : params.commission_amount) || 0;
  const s1Tip = Number(params.staff_1_tip !== undefined ? params.staff_1_tip : tipAmount) || 0;

  const s2Phone = normalizePhone(params.staff_2_user_id || params.staff_2_phone);
  const s2Id = params.staff_2_id || '-';
  const s2Name = params.staff_2_name || '-';
  const s2Comm = Number(params.staff_2_comm) || 0;
  const s2Tip = Number(params.staff_2_tip) || 0;

  const paymentMethod = params.payment_method || 'Tiền mặt';
  const isVoucherUsed = (params.is_voucher_used === true || params.is_voucher_used === 'TRUE' || params.is_voucher_used === 'true');
  const usedVoucherId = params.used_voucher_id || '';
  let bMonthNum = Number(params.birth_month) || parseBirthMonth(params.birthday);
  const birthdayVal = bMonthNum ? bMonthNum : (params.birthday ? String(params.birthday).trim() : '');
  const customerNotes = params.notes || '';

  // 1. GHI VÀO TB_RECEIPTS
  if (sheetReceipts) {
    const colMapR = createHeaderMap(sheetReceipts);
    const lastCol = sheetReceipts.getLastColumn();
    if (lastCol > 0) {
      let newRow = new Array(lastCol).fill('');
      function assign(keyList, value) {
        for (let k of keyList) {
          let lk = k.toLowerCase();
          if (colMapR[lk] !== undefined) {
            newRow[colMapR[lk]] = value;
            return;
          }
        }
      }

      assign(['receipt_id', 'ma_hoa_don', 'id'], receiptId);
      assign(['date', 'ngay'], dateStr);
      assign(['start_time', 'gio_bat_dau', 'time', 'gio'], startTime);
      assign(['end_time', 'gio_ket_thuc'], endTime);
      assign(['duration_min', 'thoi_luong_phut', 'duration'], durationMin);
      assign(['customer_phone', 'sdt_khach', 'phone'], phone);
      assign(['customer_name', 'ten_khach'], customerName);
      assign(['service_id', 'combo_id', 'ma_combo'], serviceId);
      assign(['service_name', 'ten_combo'], serviceName);
      assign(['price', 'gia'], price);
      assign(['tip_amount', 'tien_tip', 'tip'], tipAmount);
      assign(['total_paid', 'tong_tien', 'thanh_toan'], totalPaid);

      assign(['staff_1_user_id', 'staff_1_phone', 'user_id_1', 'sdt_ktv_1'], s1Phone);
      assign(['staff_1_id', 'staff_id', 'ma_ktv_1', 'ma_ktv'], s1Id);
      assign(['staff_1_name', 'staff_name', 'ten_ktv_1', 'ten_ktv'], s1Name);
      assign(['staff_1_comm', 'commission_amount', 'hoa_hong_ktv_1', 'hoa_hong'], s1Comm);
      assign(['staff_1_tip', 'tip_ktv_1'], s1Tip);

      assign(['staff_2_user_id', 'staff_2_phone', 'user_id_2', 'sdt_ktv_2'], s2Phone ? s2Phone : '-');
      assign(['staff_2_id', 'ma_ktv_2'], s2Id ? s2Id : '-');
      assign(['staff_2_name', 'ten_ktv_2'], s2Name ? s2Name : '-');
      assign(['staff_2_comm', 'hoa_hong_ktv_2'], s2Comm);
      assign(['staff_2_tip', 'tip_ktv_2'], s2Tip);

      assign(['payment_method', 'phuong_thuc_tt'], paymentMethod);
      assign(['is_voucher_used', 'dung_voucher'], isVoucherUsed ? 'TRUE' : 'FALSE');
      assign(['created_at', 'thoi_gian_tao'], fullTimeStr);

      sheetReceipts.appendRow(newRow);
    }
  }

  // 2. XỬ LÝ VOUCHER & CHU KỲ TÍCH ĐIỂM
  let calculatedCycleStart = dateStr;
  let calculatedCycleVisits = 1;
  let calculatedVouchers = 0;
  let calculatedTotalVisits = 1;

  if (phone) {
    // A. Nếu dùng voucher -> cập nhật trạng thái 'Đã dùng' vào tb_vouchers
    if (isVoucherUsed && sheetVouchers) {
      const colMapV = createHeaderMap(sheetVouchers);
      const dataV = sheetVouchers.getDataRange().getValues();
      for (let i = 1; i < dataV.length; i++) {
        let vId = String(getCell(dataV[i], colMapV, ['voucher_id', 'ma_voucher']));
        let vPhone = getCell(dataV[i], colMapV, ['customer_phone', 'phone']);
        let vStatus = String(getCell(dataV[i], colMapV, ['status', 'trang_thai'], '')).toLowerCase();
        
        if (matchPhone(vPhone, phone) && (vId === usedVoucherId || (!usedVoucherId && (vStatus.includes('chưa') || vStatus === 'active')))) {
          let colStatus = colMapV['status'] !== undefined ? colMapV['status'] + 1 : 7;
          let colUsed = colMapV['used_receipt_id'] !== undefined ? colMapV['used_receipt_id'] + 1 : 8;
          sheetVouchers.getRange(i + 1, colStatus).setValue('Đã dùng');
          sheetVouchers.getRange(i + 1, colUsed).setValue(receiptId);
          break;
        }
      }
    }

    // B. Nếu ca trả tiền thật -> xử lý nhật ký tb_loyalty_cycles
    if (!isVoucherUsed && sheetCycles) {
      const colMapCy = createHeaderMap(sheetCycles);
      const dataCy = sheetCycles.getDataRange().getValues();
      let activeCycleRow = -1;
      let activeCycleVisits = 0;
      let activeCycleEndDate = '';
      let activeCycleStartDate = '';

      for (let i = 1; i < dataCy.length; i++) {
        let cyPhone = getCell(dataCy[i], colMapCy, ['customer_phone', 'phone']);
        let status = String(getCell(dataCy[i], colMapCy, ['status', 'trang_thai'], '')).toUpperCase();
        if (matchPhone(cyPhone, phone) && status === 'ACTIVE') {
          activeCycleRow = i + 1;
          activeCycleVisits = Number(getCell(dataCy[i], colMapCy, ['visits_count', 'so_lan'], 0)) || 0;
          activeCycleStartDate = formatDateVal(getCell(dataCy[i], colMapCy, ['start_date', 'ngay_bat_dau']));
          activeCycleEndDate = formatDateVal(getCell(dataCy[i], colMapCy, ['end_date', 'ngay_ket_thuc']));
          break;
        }
      }

      // Kiểm tra xem chu kỳ cũ đã quá 60 ngày chưa
      if (activeCycleRow > 0 && dateStr > activeCycleEndDate) {
        let colStatus = colMapCy['status'] !== undefined ? colMapCy['status'] + 1 : 7;
        let colNotes = colMapCy['notes'] !== undefined ? colMapCy['notes'] + 1 : 9;
        sheetCycles.getRange(activeCycleRow, colStatus).setValue('EXPIRED');
        sheetCycles.getRange(activeCycleRow, colNotes).setValue(`Hết hạn 60 ngày (đạt ${activeCycleVisits}/10 ca)`);
        activeCycleRow = -1; // Cần mở chu kỳ 60 ngày mới
      }

      // Đếm số chu kỳ của khách hàng này
      let custCycleCount = 0;
      let activeCycleIndexForCust = 1;
      for (let i = 1; i < dataCy.length; i++) {
        let cyPhone = getCell(dataCy[i], colMapCy, ['customer_phone', 'phone']);
        if (matchPhone(cyPhone, phone)) {
          custCycleCount += 1;
          if (i + 1 === activeCycleRow) {
            activeCycleIndexForCust = custCycleCount;
          }
        }
      }

      if (activeCycleRow > 0) {
        activeCycleVisits += 1;
        calculatedCycleStart = activeCycleStartDate;
        calculatedCycleVisits = activeCycleVisits;

        let colVisits = colMapCy['visits_count'] !== undefined ? colMapCy['visits_count'] + 1 : 6;
        let colNotes = colMapCy['notes'] !== undefined ? colMapCy['notes'] + 1 : 9;
        sheetCycles.getRange(activeCycleRow, colVisits).setValue(activeCycleVisits);
        sheetCycles.getRange(activeCycleRow, colNotes).setValue(`Đang tích chu kỳ ${activeCycleIndexForCust} (${activeCycleVisits}/10 ca)`);

        if (activeCycleVisits >= 10) {
          // Hoàn thành chu kỳ -> Thưởng Voucher
          let newVoucherId = 'VC' + Utilities.formatDate(now, 'GMT+7', 'yyMMddHHmmss');
          let colStatus = colMapCy['status'] !== undefined ? colMapCy['status'] + 1 : 7;
          let colVoucher = colMapCy['reward_voucher_id'] !== undefined ? colMapCy['reward_voucher_id'] + 1 : 8;
          let colNotes = colMapCy['notes'] !== undefined ? colMapCy['notes'] + 1 : 9;

          sheetCycles.getRange(activeCycleRow, colStatus).setValue('REWARDED');
          sheetCycles.getRange(activeCycleRow, colVoucher).setValue(newVoucherId);
          sheetCycles.getRange(activeCycleRow, colNotes).setValue('Hoàn thành 10 ca -> Nhận 1 ca miễn phí');

          // Thêm voucher mới vào tb_vouchers
          if (sheetVouchers) {
            sheetVouchers.appendRow([
              newVoucherId,
              phone,
              customerName,
              'Tích 10 lần gội',
              '1 ca miễn phí',
              addDaysToDate(dateStr, 60),
              'Chưa dùng',
              '',
              'Thưởng hoàn thành chu kỳ tích 10 ca'
            ]);
          }
        }
      } else {
        // Mở chu kỳ 60 ngày mới trong tb_loyalty_cycles
        let newCycleNumber = custCycleCount + 1;
        let rowCount = dataCy.length;
        let activeCycleId = 'CYC_' + (rowCount < 10 ? '0' + rowCount : rowCount);
        let endDateNew = addDaysToDate(dateStr, 60);
        calculatedCycleStart = dateStr;
        calculatedCycleVisits = 1;

        sheetCycles.appendRow([
          activeCycleId,
          phone,
          customerName,
          dateStr,
          endDateNew,
          1,
          'ACTIVE',
          '',
          `Đang tích chu kỳ ${newCycleNumber} (1/10 ca)`
        ]);
      }
    }

    // C. CẬP NHẬT ĐỒNG BỘ VÀO BẢNG TB_CUSTOMERS ĐÚNG CHUẨN 8 CỘT
    // (phone_number, customer_name, birthday, cycle_start_date, cycle_visits, total_visits, voucher_count, notes)
    if (sheetCustomers) {
      const colMapC = createHeaderMap(sheetCustomers);
      const dataC = sheetCustomers.getDataRange().getValues();
      let foundIndex = -1;

      for (let i = 1; i < dataC.length; i++) {
        let cPhone = getCell(dataC[i], colMapC, ['phone_number', 'phone']);
        if (matchPhone(cPhone, phone)) {
          foundIndex = i + 1;
          
          let curBday = getCell(dataC[i], colMapC, ['birthday', 'ngay_sinh']);
          let curCycleStart = formatDateVal(getCell(dataC[i], colMapC, ['cycle_start_date', 'ngay_bat_dau_chu_ky']));
          let curCycleVisits = Number(getCell(dataC[i], colMapC, ['cycle_visits', 'so_lan_chu_ky'], 0)) || 0;
          let curTotalVisits = Number(getCell(dataC[i], colMapC, ['total_visits', 'tong_so_lan'], 0)) || 0;
          let curVouchers = Number(getCell(dataC[i], colMapC, ['voucher_count', 'so_voucher'], 0)) || 0;

          curTotalVisits += 1;
          if (isVoucherUsed) {
            curVouchers = Math.max(0, curVouchers - 1);
          } else {
            if (!curCycleStart || getDaysDiff(curCycleStart, dateStr) > 60 || curCycleVisits >= 10) {
              curCycleStart = dateStr;
              curCycleVisits = 1;
            } else {
              curCycleVisits += 1;
              if (curCycleVisits >= 10) {
                curVouchers += 1;
              }
            }
          }

          // Cập nhật từng cột theo đúng Header Map
          let colName = colMapC['customer_name'] !== undefined ? colMapC['customer_name'] + 1 : 2;
          let colBday = colMapC['birthday'] !== undefined ? colMapC['birthday'] + 1 : 3;
          let colCycStart = colMapC['cycle_start_date'] !== undefined ? colMapC['cycle_start_date'] + 1 : 4;
          let colCycVis = colMapC['cycle_visits'] !== undefined ? colMapC['cycle_visits'] + 1 : 5;
          let colTotVis = colMapC['total_visits'] !== undefined ? colMapC['total_visits'] + 1 : 6;
          let colVouch = colMapC['voucher_count'] !== undefined ? colMapC['voucher_count'] + 1 : 7;
          let colNotes = colMapC['notes'] !== undefined ? colMapC['notes'] + 1 : 8;

          if (customerName && customerName !== 'Khách hàng') sheetCustomers.getRange(foundIndex, colName).setValue(customerName);
          if (birthdayVal) sheetCustomers.getRange(foundIndex, colBday).setValue(birthdayVal);
          sheetCustomers.getRange(foundIndex, colCycStart).setValue(curCycleStart);
          sheetCustomers.getRange(foundIndex, colCycVis).setValue(curCycleVisits);
          sheetCustomers.getRange(foundIndex, colTotVis).setValue(curTotalVisits);
          sheetCustomers.getRange(foundIndex, colVouch).setValue(curVouchers);
          if (customerNotes) sheetCustomers.getRange(foundIndex, colNotes).setValue(customerNotes);
          break;
        }
      }

      if (foundIndex === -1) {
        // Thêm mới đúng chuẩn 8 cột
        sheetCustomers.appendRow([
          phone,
          customerName || 'Khách hàng',
          birthdayVal || '',
          dateStr,
          isVoucherUsed ? 0 : 1,
          1,
          0,
          customerNotes || ''
        ]);
      }
    }
  }

  return { success: true, receipt_id: receiptId };
}

// -------------------------------------------------------------
// 5. THÊM CHI PHÍ VẬN HÀNH
// -------------------------------------------------------------
function addExpense(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetExpenses = ss.getSheetByName('tb_expenses');
  if (!sheetExpenses) return { success: false, error: 'NO_EXPENSES_SHEET' };

  const now = new Date();
  const dateStr = params.date || Utilities.formatDate(now, 'GMT+7', 'yyyy-MM-dd');
  const expenseId = params.expense_id || ('EXP' + Utilities.formatDate(now, 'GMT+7', 'yyMMddHHmmss'));
  const expenseType = params.expense_type || params.type || 'Khác';
  const amount = Number(params.amount) || 0;
  const note = params.note || '';

  sheetExpenses.appendRow([expenseId, dateStr, expenseType, amount, note]);
  return { success: true, expense_id: expenseId };
}

// -------------------------------------------------------------
// 6. CẬP NHẬT THÔNG BÁO TỪ CHỦ TIỆM
// -------------------------------------------------------------
function updateAnnouncement(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetConfig = ss.getSheetByName('tb_config');
  if (!sheetConfig) return { success: false, error: 'NO_CONFIG_SHEET' };

  const text = String(params.content || params.text || params.announcement || params.value || '').trim();
  const colMap = createHeaderMap(sheetConfig);
  const data = sheetConfig.getDataRange().getValues();
  let found = false;

  for (let i = 1; i < data.length; i++) {
    let key = String(getCell(data[i], colMap, ['config_key', 'key'])).trim().toLowerCase();
    if (key === 'announcement' || key === 'thong_bao') {
      let colVal = colMap['config_value'] !== undefined ? colMap['config_value'] + 1 : 2;
      sheetConfig.getRange(i + 1, colVal).setValue(text);
      found = true;
      break;
    }
  }

  if (!found) {
    sheetConfig.appendRow(['announcement', text, 'Thông báo từ chủ tiệm']);
  }

  return { success: true, text: text };
}

// -------------------------------------------------------------
// 7. ĐỒNG BỘ TOÀN BỘ DỮ LIỆU (SYNC ALL DATA V2.7)
// -------------------------------------------------------------
function syncAllData(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const clientPhone = normalizePhone(params.client_phone || params.phone);
  const clientStaffId = String(params.client_staff_id || params.staff_id || '').trim();
  const clientRole = String(params.client_role || '').trim();

  const isOwner = isOwnerCheck(clientRole, clientPhone, clientStaffId);

  // 1. Menu
  const sheetMenu = ss.getSheetByName('tb_menu');
  let menu = [];
  if (sheetMenu) {
    const colMapM = createHeaderMap(sheetMenu);
    const data = sheetMenu.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      let r = data[i];
      let id = String(getCell(r, colMapM, ['service_id', 'combo_id']));
      let name = String(getCell(r, colMapM, ['service_name', 'ten_combo', 'name']));
      if (id && name) {
        let price = Number(getCell(r, colMapM, ['price', 'gia'], 0)) || 0;
        let duration = Number(getCell(r, colMapM, ['duration_min', 'thoi_gian'], 30)) || 30;
        let cosmetics = Number(getCell(r, colMapM, ['cosmetics_cost', 'my_pham'], 0)) || 0;
        let commVal = Number(getCell(r, colMapM, ['commission_value', 'hoa_hong'], price * 0.1)) || (price * 0.1);

        menu.push({
          service_id: id,
          service_name: name,
          price: price,
          duration_min: duration,
          cosmetics_cost: cosmetics,
          commission_value: commVal
        });
      }
    }
  }

  // 2. Users
  const sheetUsers = ss.getSheetByName('tb_users');
  let users = [];
  if (sheetUsers) {
    const colMapU = createHeaderMap(sheetUsers);
    const data = sheetUsers.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      let r = data[i];
      let uUserId = getCell(r, colMapU, ['user_id', 'phone', 'so_dien_thoai']);
      let uStaffId = String(getCell(r, colMapU, ['staff_id', 'ma_ktv', 'user_id'])).trim();
      let uPhone = getCell(r, colMapU, ['phone', 'user_id', 'so_dien_thoai']);
      let uPwd = String(getCell(r, colMapU, ['password', 'pin'], '123456')).trim();
      let fullName = String(getCell(r, colMapU, ['full_name', 'ten_nhan_vien', 'ho_ten'])).trim();
      let role = String(getCell(r, colMapU, ['role', 'chuc_vu'], 'staff')).trim();
      let salaryType = String(getCell(r, colMapU, ['salary_type', 'loai_luong'], 'fixed')).trim();
      let commRate = parsePercentage(getCell(r, colMapU, ['commission_rate', 'rate', 'hoa_hong'], 10));
      let baseSalary = Number(String(getCell(r, colMapU, ['base_salary', 'luong_cung'], 0)).replace(/[^\d]/g, '')) || 0;

      if (uPhone || uStaffId) {
        const uIsOwner = isOwnerCheck(role, uPhone, uStaffId);

        if (isOwner) {
          users.push({
            user_id: normalizePhone(uUserId) || normalizePhone(uPhone),
            staff_id: uStaffId || uUserId,
            phone: normalizePhone(uPhone),
            password: uPwd,
            full_name: fullName || (uIsOwner ? 'Miles (Đấng tối cao)' : 'KTV'),
            role: uIsOwner ? 'Chủ tiệm' : 'Kỹ thuật viên',
            salary_type: salaryType,
            commission_rate: commRate,
            base_salary: baseSalary
          });
        } else {
          let isMe = (clientPhone && matchPhone(uPhone, clientPhone)) || (clientStaffId && uStaffId === clientStaffId);
          users.push({
            user_id: normalizePhone(uUserId) || normalizePhone(uPhone),
            staff_id: uStaffId || uUserId,
            phone: normalizePhone(uPhone),
            password: isMe ? uPwd : '***',
            full_name: fullName,
            role: uIsOwner ? 'Chủ tiệm' : 'Kỹ thuật viên',
            salary_type: isMe ? salaryType : 'fixed',
            commission_rate: commRate || 10,
            base_salary: isMe ? baseSalary : 0
          });
        }
      }
    }
  }

  // 3. Customers (CHUẨN 8 CỘT: phone_number, customer_name, birthday, cycle_start_date, cycle_visits, total_visits, voucher_count, notes)
  const sheetCust = ss.getSheetByName('tb_customers');
  let customers = [];
  if (sheetCust) {
    const colMapC = createHeaderMap(sheetCust);
    const dataC = sheetCust.getDataRange().getValues();
    for (let i = 1; i < dataC.length; i++) {
      let r = dataC[i];
      let rawP = getCell(r, colMapC, ['phone_number', 'phone', 'so_dien_thoai']);
      let phone = normalizePhone(rawP);
      if (phone) {
        let name = String(getCell(r, colMapC, ['customer_name', 'name', 'ten_khach']));
        let rawBday = getCell(r, colMapC, ['birthday', 'birth_month', 'ngay_sinh']);
        let cycleStartDate = formatDateVal(getCell(r, colMapC, ['cycle_start_date', 'ngay_bat_dau_chu_ky']));
        let cycleVisits = Number(getCell(r, colMapC, ['cycle_visits', 'so_lan_chu_ky'], 0)) || 0;
        let totalVisits = Number(getCell(r, colMapC, ['total_visits', 'tong_so_lan'], 0)) || 0;
        let voucherCount = Number(getCell(r, colMapC, ['voucher_count', 'so_voucher'], 0)) || 0;
        let notes = String(getCell(r, colMapC, ['notes', 'ghi_chu']));

        let birthMonth = parseBirthMonth(rawBday);
        let cycleEndDate = cycleStartDate ? addDaysToDate(cycleStartDate, 60) : '';

        customers.push({
          phone_number: phone,
          raw_phone: phone,
          customer_name: name,
          birthday: birthMonth ? birthMonth : (formatDateVal(rawBday) || String(rawBday)),
          birth_month: birthMonth,
          cycle_start_date: cycleStartDate,
          cycle_end_date: cycleEndDate,
          cycle_visits: cycleVisits,
          total_visits: totalVisits,
          voucher_count: voucherCount,
          notes: notes
        });
      }
    }
  }

  // 4. Loyalty Cycles (tb_loyalty_cycles)
  const sheetCycles = ss.getSheetByName('tb_loyalty_cycles');
  let loyaltyCycles = [];
  if (sheetCycles) {
    const colMapCy = createHeaderMap(sheetCycles);
    const dataCy = sheetCycles.getDataRange().getValues();
    for (let i = 1; i < dataCy.length; i++) {
      let r = dataCy[i];
      let cyId = String(getCell(r, colMapCy, ['cycle_id', 'ma_chu_ky']));
      let cyPhone = getCell(r, colMapCy, ['customer_phone', 'phone']);
      if (cyId && cyPhone) {
        loyaltyCycles.push({
          cycle_id: cyId,
          customer_phone: isOwner ? normalizePhone(cyPhone) : (normalizePhone(cyPhone).length >= 7 ? (normalizePhone(cyPhone).slice(0, 3) + '***' + normalizePhone(cyPhone).slice(-3)) : cyPhone),
          raw_phone: normalizePhone(cyPhone),
          customer_name: String(getCell(r, colMapCy, ['customer_name', 'name'])),
          start_date: formatDateVal(getCell(r, colMapCy, ['start_date', 'ngay_bat_dau'])),
          end_date: formatDateVal(getCell(r, colMapCy, ['end_date', 'ngay_ket_thuc'])),
          visits_count: Number(getCell(r, colMapCy, ['visits_count', 'so_lan'], 0)) || 0,
          status: String(getCell(r, colMapCy, ['status', 'trang_thai'], 'ACTIVE')),
          reward_voucher_id: String(getCell(r, colMapCy, ['reward_voucher_id', 'voucher'])),
          notes: String(getCell(r, colMapCy, ['notes', 'ghi_chu']))
        });
      }
    }
  }

  // 5. Vouchers (tb_vouchers)
  const sheetVouchers = ss.getSheetByName('tb_vouchers');
  let vouchers = [];
  if (sheetVouchers) {
    const colMapV = createHeaderMap(sheetVouchers);
    const dataV = sheetVouchers.getDataRange().getValues();
    for (let i = 1; i < dataV.length; i++) {
      let r = dataV[i];
      let vId = String(getCell(r, colMapV, ['voucher_id', 'ma_voucher']));
      let vPhone = getCell(r, colMapV, ['customer_phone', 'phone']);
      if (vId && vPhone) {
        vouchers.push({
          voucher_id: vId,
          customer_phone: isOwner ? normalizePhone(vPhone) : (normalizePhone(vPhone).length >= 7 ? (normalizePhone(vPhone).slice(0, 3) + '***' + normalizePhone(vPhone).slice(-3)) : vPhone),
          raw_phone: normalizePhone(vPhone),
          customer_name: String(getCell(r, colMapV, ['customer_name', 'name'])),
          voucher_type: String(getCell(r, colMapV, ['voucher_type', 'loai_voucher'])),
          discount_value: String(getCell(r, colMapV, ['discount_value', 'giam_gia'])),
          expiry_date: formatDateVal(getCell(r, colMapV, ['expiry_date', 'han_dung'])),
          status: String(getCell(r, colMapV, ['status', 'trang_thai'], 'Chưa dùng')),
          used_receipt_id: String(getCell(r, colMapV, ['used_receipt_id', 'ma_bill'])),
          notes: String(getCell(r, colMapV, ['notes', 'ghi_chu']))
        });
      }
    }
  }

  // 6. Receipts
  const sheetReceipts = ss.getSheetByName('tb_receipts');
  let receipts = [];
  if (sheetReceipts) {
    const colMapR = createHeaderMap(sheetReceipts);
    const data = sheetReceipts.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      let r = data[i];
      let id = String(getCell(r, colMapR, ['receipt_id', 'id']));
      if (id) {
        let rDate = formatDateVal(getCell(r, colMapR, ['date', 'ngay']));
        let startTime = formatTimeVal(getCell(r, colMapR, ['start_time', 'time', 'gio_bat_dau']));
        let endTime = formatTimeVal(getCell(r, colMapR, ['end_time', 'gio_ket_thuc']));
        let durationMin = Number(getCell(r, colMapR, ['duration_min', 'duration'], 45)) || 45;
        let cPhone = getCell(r, colMapR, ['customer_phone', 'phone']);
        let cName = String(getCell(r, colMapR, ['customer_name', 'ten_khach']));
        let sId = String(getCell(r, colMapR, ['service_id', 'combo_id']));
        let sName = String(getCell(r, colMapR, ['service_name', 'ten_combo']));
        let price = Number(getCell(r, colMapR, ['price', 'gia'], 0)) || 0;
        let tip = Number(getCell(r, colMapR, ['tip_amount', 'tip'], 0)) || 0;
        let totalPaid = Number(getCell(r, colMapR, ['total_paid', 'tong_tien'], price + tip)) || (price + tip);

        let s1Phone = getCell(r, colMapR, ['staff_1_user_id', 'staff_1_phone', 'user_id_1']);
        let s1Id = String(getCell(r, colMapR, ['staff_1_id', 'staff_id', 'ma_ktv_1']));
        let s1Name = String(getCell(r, colMapR, ['staff_1_name', 'staff_name', 'ten_ktv_1']));
        let s1Comm = Number(getCell(r, colMapR, ['staff_1_comm', 'hoa_hong_ktv_1', 'commission_amount'], 0)) || 0;
        let s1Tip = Number(getCell(r, colMapR, ['staff_1_tip', 'tip_ktv_1'], tip)) || 0;

        let s2Phone = getCell(r, colMapR, ['staff_2_user_id', 'staff_2_phone', 'user_id_2']);
        let s2Id = String(getCell(r, colMapR, ['staff_2_id', 'ma_ktv_2'], '-'));
        let s2Name = String(getCell(r, colMapR, ['staff_2_name', 'ten_ktv_2'], '-'));
        let s2Comm = Number(getCell(r, colMapR, ['staff_2_comm', 'hoa_hong_ktv_2'], 0)) || 0;
        let s2Tip = Number(getCell(r, colMapR, ['staff_2_tip', 'tip_ktv_2'], 0)) || 0;

        let payMethod = String(getCell(r, colMapR, ['payment_method', 'phuong_thuc_tt'], 'Tiền mặt'));
        let isVoucher = String(getCell(r, colMapR, ['is_voucher_used', 'dung_voucher'], 'FALSE')).toUpperCase() === 'TRUE';
        let created = String(getCell(r, colMapR, ['created_at', 'thoi_gian_tao']));

        receipts.push({
          receipt_id: id,
          date: rDate,
          start_time: startTime,
          end_time: endTime,
          duration_min: durationMin,
          customer_phone: isOwner ? normalizePhone(cPhone) : (normalizePhone(cPhone).length >= 7 ? (normalizePhone(cPhone).slice(0, 3) + '***' + normalizePhone(cPhone).slice(-3)) : cPhone),
          raw_phone: normalizePhone(cPhone),
          customer_name: cName,
          service_id: sId,
          service_name: sName,
          price: price,
          tip_amount: tip,
          total_paid: totalPaid,
          staff_1_user_id: normalizePhone(s1Phone),
          staff_1_id: s1Id,
          staff_1_name: s1Name,
          staff_1_comm: s1Comm,
          staff_1_tip: s1Tip,
          staff_2_user_id: normalizePhone(s2Phone),
          staff_2_id: s2Id,
          staff_2_name: s2Name,
          staff_2_comm: s2Comm,
          staff_2_tip: s2Tip,
          payment_method: payMethod,
          is_voucher_used: isVoucher,
          created_at: created
        });
      }
    }
  }

  // 7. Expenses
  const sheetExpenses = ss.getSheetByName('tb_expenses');
  let expenses = [];
  if (sheetExpenses) {
    const colMapE = createHeaderMap(sheetExpenses);
    const data = sheetExpenses.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      let r = data[i];
      let id = String(getCell(r, colMapE, ['expense_id', 'id']));
      if (id) {
        expenses.push({
          expense_id: id,
          date: formatDateVal(getCell(r, colMapE, ['date', 'ngay'])),
          expense_type: String(getCell(r, colMapE, ['expense_type', 'loai_chi_phi', 'type'])),
          amount: Number(getCell(r, colMapE, ['amount', 'so_tien'], 0)) || 0,
          note: String(getCell(r, colMapE, ['note', 'ghi_chu']))
        });
      }
    }
  }

  // 8. Config
  const sheetConfig = ss.getSheetByName('tb_config');
  let config = {
    announcement: 'Chào mừng bạn đến với Selena Spa!',
    allowed_wifi_ip: '*',
    bank_name: 'MBBank',
    bank_account_no: '0912345678',
    bank_account_name: 'SELENA SPA'
  };
  if (sheetConfig) {
    const colMapCf = createHeaderMap(sheetConfig);
    const data = sheetConfig.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      let k = String(getCell(data[i], colMapCf, ['config_key', 'key'])).trim().toLowerCase();
      let v = String(getCell(data[i], colMapCf, ['config_value', 'value'])).trim();
      if (k && v) {
        config[k] = v;
        config[k.toUpperCase()] = v;
      }
    }
  }

  return {
    success: true,
    is_owner: isOwner,
    menu: menu,
    users: users,
    customers: customers,
    loyalty_cycles: isOwner ? loyaltyCycles : [],
    vouchers: isOwner ? vouchers : [],
    receipts: receipts,
    expenses: isOwner ? expenses : [],
    config: config
  };
}


// =============================================================
// 7. TỰ ĐỘNG BẮN DỮ LIỆU TỪ GOOGLE SHEET SANG FIREBASE (REALTIME PUSH)
// Tốc độ cập nhật: 0.2s ngay khi anh bấm Enter trên Google Sheet
// =============================================================

const FIREBASE_RTDB_URL = 'https://selena-spa-6a852-default-rtdb.asia-southeast1.firebasedatabase.app';

// Kích hoạt khi anh chỉnh sửa bất kỳ ô nào trên Google Sheet (Installable onEdit Trigger)
function installedOnEdit(e) {
  if (!e || !e.range) return;
  try {
    const sheet = e.range.getSheet();
    const sheetName = sheet.getName();
    const row = e.range.getRow();

    // Bỏ qua nếu sửa dòng tiêu đề (Dòng 1)
    if (row <= 1) return;

    if (sheetName === 'tb_customers') {
      pushSingleCustomerToFirebase(sheet, row);
    } else if (sheetName === 'tb_menu') {
      pushSingleMenuToFirebase(sheet, row);
    } else if (sheetName === 'tb_config') {
      pushConfigToFirebase(sheet);
    } else if (sheetName === 'tb_receipts') {
      pushSingleReceiptToFirebase(sheet, row);
    }
  } catch (err) {
    Logger.log('Lỗi installedOnEdit push Firebase: ' + err.message);
  }
}

// Kích hoạt khi anh thêm/xóa dòng hoặc thay đổi cấu trúc bảng (Installable onChange Trigger)
function installedOnChange(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    const sheetName = sheet ? sheet.getName() : '';

    if (sheetName === 'tb_customers') {
      menuSyncAllToFirebase();
    } else if (sheetName === 'tb_menu') {
      menuSyncAllToFirebase();
    } else if (sheetName === 'tb_config') {
      pushConfigToFirebase(sheet);
    } else if (sheetName === 'tb_receipts') {
      menuSyncAllToFirebase();
    }
  } catch (err) {
    Logger.log('Lỗi installedOnChange push Firebase: ' + err.message);
  }
}

// Cài đặt Trigger tự động kết nối mạng (chỉ cần chạy 1 lần)
function installAutoSyncTrigger() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const triggers = ScriptApp.getProjectTriggers();
  for (let t of triggers) {
    ScriptApp.deleteTrigger(t);
  }

  // 1. Tạo Trigger khi sửa từng ô (onEdit)
  ScriptApp.newTrigger('installedOnEdit')
    .forSpreadsheet(ss)
    .onEdit()
    .create();

  // 2. Tạo Trigger khi thêm/xóa dòng (onChange)
  ScriptApp.newTrigger('installedOnChange')
    .forSpreadsheet(ss)
    .onChange()
    .create();

  SpreadsheetApp.getUi().alert('🎉 ĐÃ KÍCH HOẠT THÀNH CÔNG!\n\nHệ thống tự động đồng bộ (onEdit & onChange) đã được cài đặt vĩnh viễn trên máy chủ Google. Từ giờ mỗi khi anh sửa ô hoặc thêm/xóa dòng, dữ liệu sẽ tự động bắn sang App ngay tức thì!');
}

// Bắn 1 khách hàng vừa sửa sang Firebase
function pushSingleCustomerToFirebase(sheet, row) {
  const colMap = createHeaderMap(sheet);
  const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  const phone = normalizePhone(getCell(rowData, colMap, ['phone_number', 'phone']));
  if (!phone) return;

  const rawBday = getCell(rowData, colMap, ['birthday', 'birth_month', 'ngay_sinh']);
  const bMonth = Number(rawBday) || parseBirthMonth(rawBday);

  const custObj = {
    phone_number: phone,
    raw_phone: phone,
    customer_name: String(getCell(rowData, colMap, ['customer_name', 'ten_khach', 'name'], 'Khách hàng')).trim(),
    birthday: bMonth ? bMonth : (formatDateVal(rawBday) || String(rawBday || '')),
    birth_month: bMonth,
    cycle_start_date: formatDateVal(getCell(rowData, colMap, ['cycle_start_date', 'ngay_bat_dau_chu_ky'])),
    cycle_end_date: formatDateVal(getCell(rowData, colMap, ['cycle_end_date', 'ngay_ket_thuc_chu_ky'])),
    cycle_visits: Number(getCell(rowData, colMap, ['cycle_visits', 'so_lan_chu_ky'], 0)) || 0,
    total_visits: Number(getCell(rowData, colMap, ['total_visits', 'tong_so_lan'], 0)) || 0,
    voucher_count: Number(getCell(rowData, colMap, ['voucher_count', 'so_voucher'], 0)) || 0,
    notes: String(getCell(rowData, colMap, ['notes', 'ghi_chu'], '')).trim()
  };

  firebasePut(`customers/${phone}`, custObj);
}

// Bắn 1 món menu vừa sửa sang Firebase
function pushSingleMenuToFirebase(sheet, row) {
  const colMap = createHeaderMap(sheet);
  const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  const sId = String(getCell(rowData, colMap, ['service_id', 'combo_id', 'id'])).trim();
  if (!sId) return;

  const menuObj = {
    service_id: sId,
    combo_id: sId,
    service_name: String(getCell(rowData, colMap, ['service_name', 'combo_name', 'ten_combo'])).trim(),
    combo_name: String(getCell(rowData, colMap, ['service_name', 'combo_name', 'ten_combo'])).trim(),
    price: Number(getCell(rowData, colMap, ['price', 'gia'], 0)) || 0,
    duration_min: Number(getCell(rowData, colMap, ['duration_min', 'thoi_luong_phut', 'duration'], 45)) || 45,
    commission_rate: String(getCell(rowData, colMap, ['commission_rate', 'ti_le_hoa_hong'], '10%')),
    description: String(getCell(rowData, colMap, ['description', 'mo_ta'], ''))
  };

  firebasePut(`menu/${sId}`, menuObj);
}

// Bắn thông báo nội bộ sang Firebase
function pushConfigToFirebase(sheet) {
  const colMap = createHeaderMap(sheet);
  const data = sheet.getDataRange().getValues();
  let ann = '';
  for (let i = 1; i < data.length; i++) {
    let k = String(getCell(data[i], colMap, ['key', 'khoa'])).trim().toLowerCase();
    let v = String(getCell(data[i], colMap, ['value', 'gia_tri'])).trim();
    if (k === 'announcement' || k === 'thong_bao') ann = v;
  }
  firebasePut('config/announcement', ann);
}

// Bắn 1 hóa đơn vừa sửa sang Firebase
function pushSingleReceiptToFirebase(sheet, row) {
  const colMap = createHeaderMap(sheet);
  const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rId = String(getCell(rowData, colMap, ['receipt_id', 'ma_hoa_don', 'id'])).trim();
  if (!rId) return;

  const phone = normalizePhone(getCell(rowData, colMap, ['customer_phone', 'sdt_khach', 'phone']));
  const isVoucher = String(getCell(rowData, colMap, ['is_voucher_used', 'dung_voucher'])).toUpperCase() === 'TRUE';

  const receiptObj = {
    receipt_id: rId,
    date: formatDateVal(getCell(rowData, colMap, ['date', 'ngay'])),
    start_time: formatTimeVal(getCell(rowData, colMap, ['start_time', 'gio_bat_dau', 'time', 'gio'])),
    end_time: formatTimeVal(getCell(rowData, colMap, ['end_time', 'gio_ket_thuc'])),
    duration_min: Number(getCell(rowData, colMap, ['duration_min', 'thoi_luong_phut', 'duration'], 45)) || 45,
    customer_phone: phone,
    raw_phone: phone,
    customer_name: String(getCell(rowData, colMap, ['customer_name', 'ten_khach'], 'Khách hàng')).trim(),
    service_id: String(getCell(rowData, colMap, ['service_id', 'combo_id'])).trim(),
    service_name: String(getCell(rowData, colMap, ['service_name', 'ten_combo'])).trim(),
    price: Number(getCell(rowData, colMap, ['price', 'gia'], 0)) || 0,
    tip_amount: Number(getCell(rowData, colMap, ['tip_amount', 'tien_tip', 'tip'], 0)) || 0,
    total_paid: Number(getCell(rowData, colMap, ['total_paid', 'tong_tien', 'thanh_toan'], 0)) || 0,
    staff_1_user_id: normalizePhone(getCell(rowData, colMap, ['staff_1_user_id', 'staff_1_phone'])),
    staff_1_name: String(getCell(rowData, colMap, ['staff_1_name', 'ten_ktv_1'])).trim(),
    staff_1_comm: Number(getCell(rowData, colMap, ['staff_1_comm', 'hoa_hong_ktv_1'], 0)) || 0,
    staff_1_tip: Number(getCell(rowData, colMap, ['staff_1_tip', 'tip_ktv_1'], 0)) || 0,
    staff_2_user_id: normalizePhone(getCell(rowData, colMap, ['staff_2_user_id', 'staff_2_phone'])),
    staff_2_name: String(getCell(rowData, colMap, ['staff_2_name', 'ten_ktv_2'])).trim(),
    staff_2_comm: Number(getCell(rowData, colMap, ['staff_2_comm', 'hoa_hong_ktv_2'], 0)) || 0,
    staff_2_tip: Number(getCell(rowData, colMap, ['staff_2_tip', 'tip_ktv_2'], 0)) || 0,
    payment_method: String(getCell(rowData, colMap, ['payment_method', 'phuong_thuc_tt'], 'Tiền mặt')).trim(),
    is_voucher_used: isVoucher
  };

  firebasePut(`receipts/${rId}`, receiptObj);
}

// Hàm gửi HTTP PUT lên Firebase REST API
function firebasePut(path, data) {
  const url = `${FIREBASE_RTDB_URL}/${path}.json`;
  const options = {
    method: 'put',
    contentType: 'application/json; charset=utf-8',
    payload: JSON.stringify(data),
    muteHttpExceptions: true
  };
  try {
    UrlFetchApp.fetch(url, options);
  } catch (e) {
    Logger.log('Lỗi firebasePut: ' + e.message);
  }
}

// Thêm Menu trên Google Sheet
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🌟 Selena Spa')
    .addItem('⚡ 1. Kích hoạt Tự Động Bắn Realtime (Chạy 1 lần)', 'installAutoSyncTrigger')
    .addItem('🚀 2. Bắn toàn bộ dữ liệu Sheet sang App ngay', 'menuSyncAllToFirebase')
    .addToUi();
}

function menuSyncAllToFirebase() {
  const res = syncAllData({ client_role: 'owner' });
  const payload = {
    menu: res.menu,
    customers: res.customers,
    receipts: res.receipts,
    expenses: res.expenses,
    config: res.config
  };

  const menuObj = {};
  if (Array.isArray(payload.menu)) payload.menu.forEach(m => { if (m.service_id) menuObj[m.service_id] = m; });

  const custObj = {};
  if (Array.isArray(payload.customers)) payload.customers.forEach(c => { if (c.phone_number) custObj[c.phone_number] = c; });

  const recObj = {};
  if (Array.isArray(payload.receipts)) payload.receipts.forEach(r => { if (r.receipt_id) recObj[r.receipt_id] = r; });

  const expObj = {};
  if (Array.isArray(payload.expenses)) payload.expenses.forEach(e => { if (e.expense_id) expObj[e.expense_id] = e; });

  firebasePut('menu', menuObj);
  firebasePut('customers', custObj);
  firebasePut('receipts', recObj);
  firebasePut('expenses', expObj);
  if (payload.config && payload.config.announcement) {
    firebasePut('config/announcement', payload.config.announcement);
  }

  SpreadsheetApp.getUi().alert('✅ Đã bắn toàn bộ dữ liệu từ Google Sheet sang App (Firebase) siêu tốc thành công!');
}
