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
  if (!val) return '2026-08-29';
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
  return '2026-08-29';
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

/**
 * =========================================================================
 * SELENA SPA - API GOOGLE APPS SCRIPT (GAS SERVER BACKEND V2.4 - LOYALTY CYCLES & VOUCHERS)
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
        result = { success: true, message: 'Selena Spa Dynamic Backend v2.4 is active!', timestamp: new Date().toISOString() };
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

function normalizePhone(p) {
  if (!p) return '';
  return String(p).replace(/[^0-9]/g, '');
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
    let uUserId = normalizePhone(getCell(row, colMap, ['user_id', 'phone', 'so_dien_thoai']));
    let uStaffId = String(getCell(row, colMap, ['staff_id', 'ma_ktv', 'user_id'])).trim();
    let uPhone = normalizePhone(getCell(row, colMap, ['phone', 'user_id', 'so_dien_thoai']));
    let uPwd = String(getCell(row, colMap, ['password', 'pin'], '123456')).trim();
    let fullName = String(getCell(row, colMap, ['full_name', 'ten_nhan_vien', 'ho_ten'])).trim();
    let role = String(getCell(row, colMap, ['role', 'chuc_vu'], 'staff')).trim();
    let salaryType = String(getCell(row, colMap, ['salary_type', 'loai_luong'], 'fixed')).trim();
    let commRate = parsePercentage(getCell(row, colMap, ['commission_rate', 'rate', 'hoa_hong'], 10));
    let baseSalary = Number(String(getCell(row, colMap, ['base_salary', 'luong_cung'], 0)).replace(/[^\d]/g, '')) || 0;

    let matchUser = (inputPhone === uPhone || inputPhone === uUserId || inputPhone === uStaffId);
    let matchPwd = (inputPwd === uPwd);

    if (matchUser && matchPwd) {
      const isOwner = isOwnerCheck(role, uPhone, uStaffId);
      return {
        success: true,
        user: {
          user_id: uUserId || uPhone,
          staff_id: uStaffId || uUserId,
          phone: uPhone,
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
// 3. TRA CỨU KHÁCH HÀNG, CHU KỲ & VOUCHER
// -------------------------------------------------------------
function checkCustomer(phoneNumber) {
  const phone = normalizePhone(phoneNumber);
  if (!phone) return { success: false, error: 'PHONE_EMPTY' };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetCust = ss.getSheetByName('tb_customers');
  const sheetCycles = ss.getSheetByName('tb_loyalty_cycles');
  const sheetVouchers = ss.getSheetByName('tb_vouchers');

  let customer = null;
  if (sheetCust) {
    const colMapC = createHeaderMap(sheetCust);
    const dataC = sheetCust.getDataRange().getValues();
    for (let i = 1; i < dataC.length; i++) {
      let row = dataC[i];
      let cPhone = normalizePhone(getCell(row, colMapC, ['phone_number', 'phone', 'so_dien_thoai']));
      if (cPhone === phone) {
        customer = {
          phone_number: cPhone,
          customer_name: String(getCell(row, colMapC, ['customer_name', 'name', 'ten_khach'])),
          birth_month: Number(getCell(row, colMapC, ['birth_month', 'thang_sinh', 'birthday'], 0)) || 0,
          total_visits: Number(getCell(row, colMapC, ['total_visits', 'so_lan_goi', 'visits'], 0)) || 0,
          voucher_count: Number(getCell(row, colMapC, ['voucher_count', 'voucher'], 0)) || 0,
          notes: String(getCell(row, colMapC, ['notes', 'ghi_chu'], ''))
        };
        break;
      }
    }
  }

  // Active Loyalty Cycle
  let activeCycle = null;
  const now = new Date();
  const todayStr = Utilities.formatDate(now, 'GMT+7', 'yyyy-MM-dd');
  const currentMonth = now.getMonth() + 1;

  if (sheetCycles) {
    const colMapCy = createHeaderMap(sheetCycles);
    const dataCy = sheetCycles.getDataRange().getValues();
    for (let i = 1; i < dataCy.length; i++) {
      let row = dataCy[i];
      let cyPhone = normalizePhone(getCell(row, colMapCy, ['customer_phone', 'phone']));
      let status = String(getCell(row, colMapCy, ['status', 'trang_thai'], '')).toUpperCase();
      if (cyPhone === phone && status === 'ACTIVE') {
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

  // Vouchers
  let availableVouchers = [];
  if (sheetVouchers) {
    const colMapV = createHeaderMap(sheetVouchers);
    const dataV = sheetVouchers.getDataRange().getValues();
    for (let i = 1; i < dataV.length; i++) {
      let row = dataV[i];
      let vPhone = normalizePhone(getCell(row, colMapV, ['customer_phone', 'phone']));
      let status = String(getCell(row, colMapV, ['status', 'trang_thai'], '')).toLowerCase();
      if (vPhone === phone && (status.includes('chưa') || status === 'active' || status === 'unused')) {
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
// 3B. CẬP NHẬT GHI CHÚ SỞ THÍCH & THÁNG SINH KHÁCH HÀNG
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
    let cPhone = normalizePhone(getCell(dataC[i], colMapC, ['phone_number', 'phone']));
    if (cPhone === phone) {
      foundRow = i + 1;
      break;
    }
  }

  const newNotes = params.notes !== undefined ? String(params.notes).trim() : null;
  const newBirthMonth = params.birth_month !== undefined ? Number(params.birth_month) : null;
  const newName = params.customer_name ? String(params.customer_name).trim() : null;

  if (foundRow > 0) {
    if (newNotes !== null) {
      let colNotes = colMapC['notes'] !== undefined ? colMapC['notes'] + 1 : 6;
      sheetCust.getRange(foundRow, colNotes).setValue(newNotes);
    }
    if (newBirthMonth !== null && newBirthMonth >= 1 && newBirthMonth <= 12) {
      let colBM = colMapC['birth_month'] !== undefined ? colMapC['birth_month'] + 1 : 3;
      sheetCust.getRange(foundRow, colBM).setValue(newBirthMonth);
    }
    if (newName) {
      let colName = colMapC['customer_name'] !== undefined ? colMapC['customer_name'] + 1 : 2;
      sheetCust.getRange(foundRow, colName).setValue(newName);
    }
  } else {
    const todayStr = Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd');
    sheetCust.appendRow([
      phone,
      newName || 'Khách hàng',
      (newBirthMonth && newBirthMonth >= 1 && newBirthMonth <= 12) ? newBirthMonth : '',
      0,
      0,
      newNotes || '',
      todayStr
    ]);
  }

  return { success: true, message: 'Đã cập nhật thông tin khách hàng thành công!' };
}

// -------------------------------------------------------------
// 3C. CHỦ TIỆM TẶNG VOUCHER CHO KHÁCH
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

  if (sheetCust) {
    const colMapC = createHeaderMap(sheetCust);
    const dataC = sheetCust.getDataRange().getValues();
    for (let i = 1; i < dataC.length; i++) {
      let cPhone = normalizePhone(getCell(dataC[i], colMapC, ['phone_number', 'phone']));
      if (cPhone === phone) {
        let vCount = Number(getCell(dataC[i], colMapC, ['voucher_count', 'voucher'], 0)) || 0;
        let colV = colMapC['voucher_count'] !== undefined ? colMapC['voucher_count'] + 1 : 5;
        sheetCust.getRange(i + 1, colV).setValue(vCount + 1);
        break;
      }
    }
  }

  return { success: true, voucher_id: voucherId, message: 'Đã tặng voucher thành công!' };
}

// -------------------------------------------------------------
// 4. TẠO HÓA ĐƠN CA LÀM & TỰ ĐỘNG XỬ LÝ CHU KỲ / VOUCHER
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
  const birthMonth = Number(params.birth_month) || 0;
  const customerNotes = params.notes || '';

  let activeCycleId = '';

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
    } else {
      sheetReceipts.appendRow([
        receiptId, dateStr, startTime, endTime, durationMin,
        phone, customerName, serviceId, serviceName,
        price, tipAmount, totalPaid,
        s1Phone, s1Id, s1Name, s1Comm, s1Tip,
        s2Phone ? s2Phone : '-', s2Id ? s2Id : '-', s2Name ? s2Name : '-', s2Comm, s2Tip,
        paymentMethod, isVoucherUsed ? 'TRUE' : 'FALSE', fullTimeStr
      ]);
    }
  }

  // 2. XỬ LÝ VOUCHER & CHU KỲ TÍCH ĐIỂM
  if (phone) {
    // A. Nếu dùng voucher -> cập nhật tb_vouchers
    if (isVoucherUsed && sheetVouchers) {
      const colMapV = createHeaderMap(sheetVouchers);
      const dataV = sheetVouchers.getDataRange().getValues();
      for (let i = 1; i < dataV.length; i++) {
        let vId = String(getCell(dataV[i], colMapV, ['voucher_id', 'ma_voucher']));
        let vPhone = normalizePhone(getCell(dataV[i], colMapV, ['customer_phone', 'phone']));
        let vStatus = String(getCell(dataV[i], colMapV, ['status', 'trang_thai'], '')).toLowerCase();
        
        if (vPhone === phone && (vId === usedVoucherId || (!usedVoucherId && (vStatus.includes('chưa') || vStatus === 'active')))) {
          let colStatus = colMapV['status'] !== undefined ? colMapV['status'] + 1 : 7;
          let colUsed = colMapV['used_receipt_id'] !== undefined ? colMapV['used_receipt_id'] + 1 : 8;
          sheetVouchers.getRange(i + 1, colStatus).setValue('Đã dùng');
          sheetVouchers.getRange(i + 1, colUsed).setValue(receiptId);
          break;
        }
      }
    }

    // B. Nếu ca trả tiền thật -> xử lý tb_loyalty_cycles
    if (!isVoucherUsed && sheetCycles) {
      const colMapCy = createHeaderMap(sheetCycles);
      const dataCy = sheetCycles.getDataRange().getValues();
      let activeCycleRow = -1;
      let activeCycleVisits = 0;
      let activeCycleEndDate = '';

      for (let i = 1; i < dataCy.length; i++) {
        let cyPhone = normalizePhone(getCell(dataCy[i], colMapCy, ['customer_phone', 'phone']));
        let status = String(getCell(dataCy[i], colMapCy, ['status', 'trang_thai'], '')).toUpperCase();
        if (cyPhone === phone && status === 'ACTIVE') {
          activeCycleRow = i + 1;
          activeCycleVisits = Number(getCell(dataCy[i], colMapCy, ['visits_count', 'so_lan'], 0)) || 0;
          activeCycleEndDate = formatDateVal(getCell(dataCy[i], colMapCy, ['end_date', 'ngay_ket_thuc']));
          activeCycleId = String(getCell(dataCy[i], colMapCy, ['cycle_id', 'ma_chu_ky']));
          break;
        }
      }

      // Kiểm tra hạn 60 ngày
      if (activeCycleRow > 0 && dateStr > activeCycleEndDate) {
        // Chu kỳ cũ hết hạn
        let colStatus = colMapCy['status'] !== undefined ? colMapCy['status'] + 1 : 7;
        let colNotes = colMapCy['notes'] !== undefined ? colMapCy['notes'] + 1 : 9;
        sheetCycles.getRange(activeCycleRow, colStatus).setValue('EXPIRED');
        sheetCycles.getRange(activeCycleRow, colNotes).setValue(`Hết hạn 60 ngày (đạt ${activeCycleVisits}/10 ca)`);
        activeCycleRow = -1; // Cần mở chu kỳ mới
      }

      if (activeCycleRow > 0) {
        // Tăng lượt tích chu kỳ
        activeCycleVisits += 1;
        let colVisits = colMapCy['visits_count'] !== undefined ? colMapCy['visits_count'] + 1 : 6;
        sheetCycles.getRange(activeCycleRow, colVisits).setValue(activeCycleVisits);

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
        // Mở chu kỳ 60 ngày mới
        activeCycleId = 'CYC_' + Utilities.formatDate(now, 'GMT+7', 'yyMMddHHmmss');
        let endDateNew = addDaysToDate(dateStr, 60);
        sheetCycles.appendRow([
          activeCycleId,
          phone,
          customerName,
          dateStr,
          endDateNew,
          1,
          'ACTIVE',
          '',
          'Đang tích chu kỳ (1/10 ca)'
        ]);
      }
    }

    // C. Cập nhật tb_customers
    if (sheetCustomers) {
      const colMapC = createHeaderMap(sheetCustomers);
      const dataC = sheetCustomers.getDataRange().getValues();
      let foundIndex = -1;

      for (let i = 1; i < dataC.length; i++) {
        let cPhone = normalizePhone(getCell(dataC[i], colMapC, ['phone_number', 'phone']));
        if (cPhone === phone) {
          foundIndex = i + 1;
          let visits = Number(getCell(dataC[i], colMapC, ['total_visits', 'visits'], 0)) || 0;
          let vouchers = Number(getCell(dataC[i], colMapC, ['voucher_count', 'voucher'], 0)) || 0;
          
          visits += 1;
          if (isVoucherUsed) {
            vouchers = Math.max(0, vouchers - 1);
          }

          let colVisits = colMapC['total_visits'] !== undefined ? colMapC['total_visits'] + 1 : 4;
          let colVouchers = colMapC['voucher_count'] !== undefined ? colMapC['voucher_count'] + 1 : 5;
          let colNotes = colMapC['notes'] !== undefined ? colMapC['notes'] + 1 : 6;
          let colBM = colMapC['birth_month'] !== undefined ? colMapC['birth_month'] + 1 : 3;

          sheetCustomers.getRange(foundIndex, colVisits).setValue(visits);
          sheetCustomers.getRange(foundIndex, colVouchers).setValue(vouchers);
          if (customerNotes) {
            sheetCustomers.getRange(foundIndex, colNotes).setValue(customerNotes);
          }
          if (birthMonth >= 1 && birthMonth <= 12) {
            sheetCustomers.getRange(foundIndex, colBM).setValue(birthMonth);
          }
          break;
        }
      }

      if (foundIndex === -1) {
        sheetCustomers.appendRow([
          phone,
          customerName,
          (birthMonth >= 1 && birthMonth <= 12) ? birthMonth : '',
          1,
          0,
          customerNotes || '',
          dateStr
        ]);
      }
    }
  }

  return { success: true, receipt_id: receiptId, cycle_id: activeCycleId };
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

  const text = String(params.text || params.announcement || '').trim();
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
// 7. ĐỒNG BỘ TOÀN BỘ DỮ LIỆU (SYNC ALL DATA V2.4)
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
      let uUserId = normalizePhone(getCell(r, colMapU, ['user_id', 'phone', 'so_dien_thoai']));
      let uStaffId = String(getCell(r, colMapU, ['staff_id', 'ma_ktv', 'user_id'])).trim();
      let uPhone = normalizePhone(getCell(r, colMapU, ['phone', 'user_id', 'so_dien_thoai']));
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
            user_id: uUserId || uPhone,
            staff_id: uStaffId || uUserId,
            phone: uPhone,
            password: uPwd,
            full_name: fullName || (uIsOwner ? 'Miles (Đấng tối cao)' : 'KTV'),
            role: uIsOwner ? 'Chủ tiệm' : 'Kỹ thuật viên',
            salary_type: salaryType,
            commission_rate: commRate,
            base_salary: baseSalary
          });
        } else {
          let isMe = (clientPhone && uPhone === clientPhone) || (clientStaffId && uStaffId === clientStaffId);
          users.push({
            user_id: uUserId || uPhone,
            staff_id: uStaffId || uUserId,
            phone: uPhone,
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

  // 3. Customers
  const sheetCust = ss.getSheetByName('tb_customers');
  let customers = [];
  if (sheetCust) {
    const colMapC = createHeaderMap(sheetCust);
    const data = sheetCust.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      let r = data[i];
      let phone = normalizePhone(getCell(r, colMapC, ['phone_number', 'phone', 'so_dien_thoai']));
      if (phone) {
        let name = String(getCell(r, colMapC, ['customer_name', 'name', 'ten_khach']));
        let birthMonth = Number(getCell(r, colMapC, ['birth_month', 'thang_sinh', 'birthday'], 0)) || 0;
        let visits = Number(getCell(r, colMapC, ['total_visits', 'visits'], 0)) || 0;
        let vouchers = Number(getCell(r, colMapC, ['voucher_count', 'voucher'], 0)) || 0;
        let notes = String(getCell(r, colMapC, ['notes', 'ghi_chu']));
        let createdAt = formatDateVal(getCell(r, colMapC, ['created_at', 'ngay_tao']));

        customers.push({
          phone_number: isOwner ? phone : (phone.length >= 7 ? (phone.slice(0, 3) + '***' + phone.slice(-3)) : phone),
          raw_phone: phone,
          customer_name: name,
          birth_month: birthMonth,
          total_visits: visits,
          voucher_count: vouchers,
          notes: notes,
          created_at: createdAt
        });
      }
    }
  }

  // 4. Loyalty Cycles
  const sheetCycles = ss.getSheetByName('tb_loyalty_cycles');
  let loyaltyCycles = [];
  if (sheetCycles) {
    const colMapCy = createHeaderMap(sheetCycles);
    const data = sheetCycles.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      let r = data[i];
      let cyId = String(getCell(r, colMapCy, ['cycle_id', 'ma_chu_ky']));
      let cyPhone = normalizePhone(getCell(r, colMapCy, ['customer_phone', 'phone']));
      if (cyId && cyPhone) {
        loyaltyCycles.push({
          cycle_id: cyId,
          customer_phone: isOwner ? cyPhone : (cyPhone.length >= 7 ? (cyPhone.slice(0, 3) + '***' + cyPhone.slice(-3)) : cyPhone),
          raw_phone: cyPhone,
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

  // 5. Vouchers
  const sheetVouchers = ss.getSheetByName('tb_vouchers');
  let vouchers = [];
  if (sheetVouchers) {
    const colMapV = createHeaderMap(sheetVouchers);
    const data = sheetVouchers.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      let r = data[i];
      let vId = String(getCell(r, colMapV, ['voucher_id', 'ma_voucher']));
      let vPhone = normalizePhone(getCell(r, colMapV, ['customer_phone', 'phone']));
      if (vId && vPhone) {
        vouchers.push({
          voucher_id: vId,
          customer_phone: isOwner ? vPhone : (vPhone.length >= 7 ? (vPhone.slice(0, 3) + '***' + vPhone.slice(-3)) : vPhone),
          raw_phone: vPhone,
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
        let cPhone = normalizePhone(getCell(r, colMapR, ['customer_phone', 'phone']));
        let cName = String(getCell(r, colMapR, ['customer_name', 'ten_khach']));
        let sId = String(getCell(r, colMapR, ['service_id', 'combo_id']));
        let sName = String(getCell(r, colMapR, ['service_name', 'ten_combo']));
        let price = Number(getCell(r, colMapR, ['price', 'gia'], 0)) || 0;
        let tip = Number(getCell(r, colMapR, ['tip_amount', 'tip'], 0)) || 0;
        let totalPaid = Number(getCell(r, colMapR, ['total_paid', 'tong_tien'], price + tip)) || (price + tip);

        let s1Phone = normalizePhone(getCell(r, colMapR, ['staff_1_user_id', 'staff_1_phone', 'user_id_1']));
        let s1Id = String(getCell(r, colMapR, ['staff_1_id', 'staff_id', 'ma_ktv_1']));
        let s1Name = String(getCell(r, colMapR, ['staff_1_name', 'staff_name', 'ten_ktv_1']));
        let s1Comm = Number(getCell(r, colMapR, ['staff_1_comm', 'hoa_hong_ktv_1', 'commission_amount'], 0)) || 0;
        let s1Tip = Number(getCell(r, colMapR, ['staff_1_tip', 'tip_ktv_1'], tip)) || 0;

        let s2Phone = normalizePhone(getCell(r, colMapR, ['staff_2_user_id', 'staff_2_phone', 'user_id_2']));
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
          customer_phone: isOwner ? cPhone : (cPhone.length >= 7 ? (cPhone.slice(0, 3) + '***' + cPhone.slice(-3)) : cPhone),
          raw_phone: cPhone,
          customer_name: cName,
          service_id: sId,
          service_name: sName,
          price: price,
          tip_amount: tip,
          total_paid: totalPaid,
          staff_1_user_id: s1Phone,
          staff_1_id: s1Id,
          staff_1_name: s1Name,
          staff_1_comm: s1Comm,
          staff_1_tip: s1Tip,
          staff_2_user_id: s2Phone,
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
      let k = String(getCell(data[i], colMapCf, ['config_key', 'key'])).trim();
      let v = String(getCell(data[i], colMapCf, ['config_value', 'value'])).trim();
      if (k && v) config[k] = v;
    }
  }

  return {
    success: true,
    is_owner: isOwner,
    menu: menu,
    users: users,
    customers: isOwner ? customers : [],
    loyalty_cycles: isOwner ? loyaltyCycles : [],
    vouchers: isOwner ? vouchers : [],
    receipts: receipts,
    expenses: isOwner ? expenses : [],
    config: config
  };
}
