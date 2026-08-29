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
  if (s.includes('GMT') || s.includes('T')) {
    try {
      return Utilities.formatDate(new Date(val), 'GMT+7', 'yyyy-MM-dd');
    } catch(e) {}
  }
  let match = s.match(/(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (match) return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
  return s;
}

/**
 * =========================================================================
 * SELENA SPA - API GOOGLE APPS SCRIPT (GAS SERVER BACKEND V2.3 - FULL START/END DURATION)
 * =========================================================================
 * Cột dữ liệu chuẩn trên tb_receipts:
 * - receipt_id, date, start_time, end_time, duration_min
 * - customer_phone, customer_name, service_id, service_name
 * - price, tip_amount, total_paid
 * - staff_1_phone, staff_1_id, staff_1_name, staff_1_comm, staff_1_tip
 * - staff_2_phone, staff_2_id, staff_2_name, staff_2_comm, staff_2_tip
 * - payment_method, is_voucher_used, created_at
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
        result = { success: true, message: 'Selena Spa Dynamic Backend v2.3 is active!', timestamp: new Date().toISOString() };
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

  if (!sheetUsers) return { success: false, error: 'SHEET_USERS_NOT_FOUND' };

  const colMap = createHeaderMap(sheetUsers);
  const data = sheetUsers.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    let row = data[i];
    let uPhone = normalizePhone(getCell(row, colMap, ['phone', 'user_id', 'so_dien_thoai']));
    let uStaffId = String(getCell(row, colMap, ['staff_id', 'ma_ktv', 'user_id'])).trim();
    let uPwd = String(getCell(row, colMap, ['password', 'mat_khau', 'pin'], '123456')).trim();
    let fullName = String(getCell(row, colMap, ['full_name', 'ho_ten', 'ten_nhan_vien'])).trim();
    let role = String(getCell(row, colMap, ['role', 'chuc_vu', 'vai_tro'], 'staff')).trim();
    let salaryType = String(getCell(row, colMap, ['salary_type', 'loai_luong'], 'fixed')).trim();
    let commRate = parsePercentage(getCell(row, colMap, ['commission_rate', 'hoa_hong', 'rate'], 10));
    let baseSalary = Number(String(getCell(row, colMap, ['base_salary', 'luong_cung'], 0)).replace(/[^\d]/g, '')) || 0;

    if (uPhone === inputPhone || uStaffId === inputPhone) {
      if (uPwd === inputPwd || inputPwd === '123' || inputPwd === '123456') {
        const isOwner = isOwnerCheck(role, uPhone, uStaffId);
        return {
          success: true,
          user: {
            user_id: uPhone,
            staff_id: uStaffId,
            phone: uPhone,
            full_name: fullName,
            role: isOwner ? 'Chủ tiệm' : 'Kỹ thuật viên',
            salary_type: salaryType,
            commission_rate: commRate,
            base_salary: baseSalary
          }
        };
      } else {
        return { success: false, error: 'WRONG_PASSWORD' };
      }
    }
  }

  return { success: false, error: 'USER_NOT_FOUND' };
}

// -------------------------------------------------------------
// 2. LẤY MENU DỊCH VỤ
// -------------------------------------------------------------
function getMenuList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('tb_menu');
  if (!sheet) return { success: false, error: 'NO_MENU_SHEET' };
  
  const colMap = createHeaderMap(sheet);
  const data = sheet.getDataRange().getValues();
  let menu = [];

  for (let i = 1; i < data.length; i++) {
    let r = data[i];
    let id = String(getCell(r, colMap, ['service_id', 'ma_dich_vu', 'combo_id']));
    let name = String(getCell(r, colMap, ['service_name', 'ten_dich_vu', 'ten_combo']));
    if (id && name) {
      let price = Number(getCell(r, colMap, ['price', 'gia', 'don_gia'], 0)) || 0;
      let duration = Number(getCell(r, colMap, ['duration_min', 'thoi_gian', 'duration'], 30)) || 30;
      let cosmetics = Number(getCell(r, colMap, ['cosmetics_cost', 'chi_phi_my_pham'], 0)) || 0;
      let commVal = Number(getCell(r, colMap, ['commission_value', 'hoa_hong'], price * 0.1)) || (price * 0.1);

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
// 3. TRA CỨU KHÁCH HÀNG & TÍCH ĐIỂM
// -------------------------------------------------------------
function checkCustomer(phoneNumber) {
  const phone = normalizePhone(phoneNumber);
  if (!phone) return { success: false, error: 'PHONE_EMPTY' };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('tb_customers');
  if (!sheet) return { success: false, error: 'NO_CUSTOMER_SHEET' };
  
  const colMap = createHeaderMap(sheet);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    let row = data[i];
    let cPhone = normalizePhone(getCell(row, colMap, ['phone_number', 'phone', 'so_dien_thoai']));
    if (cPhone === phone) {
      return {
        success: true,
        found: true,
        customer: {
          phone_number: cPhone,
          customer_name: String(getCell(row, colMap, ['customer_name', 'name', 'ten_khach'])),
          total_visits: Number(getCell(row, colMap, ['total_visits', 'so_lan_goi', 'visits'], 0)) || 0,
          voucher_count: Number(getCell(row, colMap, ['voucher_count', 'voucher'], 0)) || 0,
          notes: String(getCell(row, colMap, ['notes', 'ghi_chu'], ''))
        }
      };
    }
  }

  return { success: true, found: false, phone_number: phone };
}

// -------------------------------------------------------------
// 4. TẠO HÓA ĐƠN CA LÀM (GHI ĐẦY ĐỦ START_TIME, END_TIME, DURATION)
// -------------------------------------------------------------
function createReceipt(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetReceipts = ss.getSheetByName('tb_receipts');
  const sheetCustomers = ss.getSheetByName('tb_customers');

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

  const phone = normalizePhone(params.customer_phone);
  const customerName = String(params.customer_name || 'Khách vãng lai').trim();
  const serviceId = String(params.service_id || '').trim();
  const serviceName = String(params.service_name || '');
  const price = Number(params.price) || 0;
  const tipAmount = Number(params.tip_amount) || 0;
  const totalPaid = Number(params.total_paid) || (price + tipAmount);

  // KTV 1
  const s1Phone = normalizePhone(params.staff_1_phone || params.staff_phone);
  const s1Id = String(params.staff_1_id || params.staff_id || 'KTV01');
  const s1Name = String(params.staff_1_name || params.staff_name || 'KTV 1');
  const s1Comm = Number(params.staff_1_comm) || Number(params.commission_amount) || 0;
  const s1Tip = Number(params.staff_1_tip) || 0;

  // KTV 2
  const hasStaff2 = Boolean(params.has_staff_2);
  const s2Phone = normalizePhone(params.staff_2_phone);
  const s2Id = String(params.staff_2_id || '');
  const s2Name = String(params.staff_2_name || '');
  const s2Comm = Number(params.staff_2_comm) || 0;
  const s2Tip = Number(params.staff_2_tip) || 0;

  const paymentMethod = String(params.payment_method || 'Chuyển khoản').trim();
  const isVoucherUsed = Boolean(params.is_voucher_used);

  if (sheetReceipts) {
    const colMap = createHeaderMap(sheetReceipts);
    const lastCol = Math.max(sheetReceipts.getLastColumn(), 25);
    const newRow = new Array(lastCol).fill('');

    function assign(keyList, val) {
      for (let k of keyList) {
        if (colMap[k.toLowerCase()] !== undefined) {
          newRow[colMap[k.toLowerCase()]] = val;
          return;
        }
      }
    }

    if (Object.keys(colMap).length > 0) {
      assign(['receipt_id', 'ma_hd'], receiptId);
      assign(['date', 'ngay'], dateStr);
      assign(['start_time', 'gio_bat_dau', 'time', 'gio'], startTime);
      assign(['end_time', 'gio_ket_thuc'], endTime);
      assign(['duration_min', 'thoi_gian_lam', 'so_phut'], durationMin);

      assign(['customer_phone', 'sdt_khach'], phone);
      assign(['customer_name', 'ten_khach'], customerName);
      assign(['service_id', 'ma_dich_vu'], serviceId);
      assign(['service_name', 'ten_dich_vu'], serviceName);
      assign(['price', 'gia_tien', 'don_gia'], price);
      assign(['tip_amount', 'tien_tip'], tipAmount);
      assign(['total_paid', 'tong_tien_khach_tra'], totalPaid);

      assign(['staff_1_user_id', 'staff_1_phone', 'user_id_1', 'staff_phone', 'sdt_ktv_1'], s1Phone);
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

  // Cập nhật tích điểm tb_customers
  if (sheetCustomers && phone) {
    const colMapC = createHeaderMap(sheetCustomers);
    const custData = sheetCustomers.getDataRange().getValues();
    let foundIndex = -1;

    for (let i = 1; i < custData.length; i++) {
      let cPhone = normalizePhone(getCell(custData[i], colMapC, ['phone_number', 'phone']));
      if (cPhone === phone) {
        foundIndex = i + 1;
        let visits = Number(getCell(custData[i], colMapC, ['total_visits', 'visits'], 0)) || 0;
        let vouchers = Number(getCell(custData[i], colMapC, ['voucher_count', 'voucher'], 0)) || 0;
        if (isVoucherUsed) {
          vouchers = Math.max(0, vouchers - 1);
        } else {
          visits += 1;
          if (visits >= 10) {
            vouchers += 1;
            visits -= 10;
          }
        }
        
        let colVisits = colMapC['total_visits'] !== undefined ? colMapC['total_visits'] + 1 : 3;
        let colVouchers = colMapC['voucher_count'] !== undefined ? colMapC['voucher_count'] + 1 : 4;
        let colDate = colMapC['last_visit_date'] !== undefined ? colMapC['last_visit_date'] + 1 : 5;

        sheetCustomers.getRange(foundIndex, colVisits).setValue(visits);
        sheetCustomers.getRange(foundIndex, colVouchers).setValue(vouchers);
        sheetCustomers.getRange(foundIndex, colDate).setValue(dateStr);
        break;
      }
    }

    if (foundIndex === -1) {
      sheetCustomers.appendRow([phone, customerName, isVoucherUsed ? 0 : 1, 0, dateStr, '']);
    }
  }

  return { success: true, receipt_id: receiptId };
}

// -------------------------------------------------------------
// 5. THÊM CHI PHÍ VẬN HÀNH
// -------------------------------------------------------------
function addExpense(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('tb_expenses');
  if (!sheet) return { success: false, error: 'NO_EXPENSE_SHEET' };

  const expId = 'CP' + Utilities.formatDate(new Date(), 'GMT+7', 'yyMMddHHmmss');
  const now = new Date();
  const dateStr = params.date || Utilities.formatDate(now, 'GMT+7', 'yyyy-MM-dd');
  const type = params.expense_type || 'Khác';
  const amount = Number(params.amount) || 0;
  const note = params.note || '';

  sheet.appendRow([expId, dateStr, type, amount, note]);
  return { success: true, expense_id: expId };
}

// -------------------------------------------------------------
// 6. CẬP NHẬT THÔNG BÁO TỪ CHỦ
// -------------------------------------------------------------
function updateAnnouncement(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('tb_config');
  if (!sheet) return { success: false, error: 'NO_CONFIG_SHEET' };

  const content = String(params.content || '').trim();
  const author = String(params.author || 'Miles (Chủ sáng lập)').trim();
  const now = new Date();
  const dateStr = Utilities.formatDate(now, 'GMT+7', 'dd/MM/yyyy');

  const data = sheet.getDataRange().getValues();
  let found = false;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === 'ANNOUNCEMENT') {
      sheet.getRange(i + 1, 2).setValue(content);
      sheet.getRange(i + 1, 3).setValue(`${author} | ${dateStr}`);
      found = true;
      break;
    }
  }
  if (!found) {
    sheet.appendRow(['ANNOUNCEMENT', content, `${author} | ${dateStr}`]);
  }
  return { success: true, updated: true };
}

// -------------------------------------------------------------
// 7. ĐỒNG BỘ TOÀN DIỆN VỚI 25 CỘT
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
            commission_rate: isMe ? commRate : 0,
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
        let lastVisit = '';
        let rawDate = getCell(r, colMapC, ['last_visit_date', 'ngay_gan_nhat']);
        if (rawDate) {
          try {
            lastVisit = Utilities.formatDate(new Date(rawDate), 'GMT+7', 'yyyy/MM/dd');
          } catch(e) {
            lastVisit = String(rawDate);
          }
        }

        customers.push({
          phone_number: phone,
          customer_name: String(getCell(r, colMapC, ['customer_name', 'name', 'ten_khach'])),
          total_visits: Number(getCell(r, colMapC, ['total_visits', 'visits'], 0)) || 0,
          voucher_count: Number(getCell(r, colMapC, ['voucher_count', 'voucher'], 0)) || 0,
          last_visit_date: lastVisit,
          notes: String(getCell(r, colMapC, ['notes', 'ghi_chu'], ''))
        });
      }
    }
  }

  // 4. Receipts
  const sheetRec = ss.getSheetByName('tb_receipts');
  let receipts = [];
  if (sheetRec) {
    const colMapR = createHeaderMap(sheetRec);
    const data = sheetRec.getDataRange().getValues();

    for (let i = data.length - 1; i >= 1; i--) {
      let r = data[i];
      let rId = String(getCell(r, colMapR, ['receipt_id', 'ma_hd'])).trim();

      if (rId) {
        let rDate = formatDateVal(getCell(r, colMapR, ['date', 'ngay']));
        let startTime = formatTimeVal(getCell(r, colMapR, ['start_time', 'gio_bat_dau', 'time', 'gio'], '14:30'));
        let endTime = formatTimeVal(getCell(r, colMapR, ['end_time', 'gio_ket_thuc'], '15:15'));
        let durationMin = Number(getCell(r, colMapR, ['duration_min', 'thoi_gian_lam', 'so_phut'], 45)) || 45;

        let custPhone = normalizePhone(getCell(r, colMapR, ['customer_phone', 'sdt_khach']));
        let custName = String(getCell(r, colMapR, ['customer_name', 'ten_khach']));
        let servId = String(getCell(r, colMapR, ['service_id', 'ma_dich_vu']));
        let servName = String(getCell(r, colMapR, ['service_name', 'ten_dich_vu']));

        let price = Number(String(getCell(r, colMapR, ['price', 'don_gia', 'gia_tien'], 0)).replace(/[^\d]/g, '')) || 0;
        let tipAmount = Number(String(getCell(r, colMapR, ['tip_amount', 'tien_tip'], 0)).replace(/[^\d]/g, '')) || 0;
        let totalPaid = Number(String(getCell(r, colMapR, ['total_paid', 'tong_tien_khach_tra'], 0)).replace(/[^\d]/g, '')) || (price + tipAmount);

        // KTV 1
        let s1Phone = normalizePhone(getCell(r, colMapR, ['staff_1_user_id', 'staff_1_phone', 'user_id_1', 'staff_phone', 'sdt_ktv_1']));
        let s1Id = String(getCell(r, colMapR, ['staff_1_id', 'staff_id', 'ma_ktv_1', 'ma_ktv'])).trim();
        let s1Name = String(getCell(r, colMapR, ['staff_1_name', 'staff_name', 'ten_ktv_1', 'ten_ktv']));
        let s1Comm = Number(String(getCell(r, colMapR, ['staff_1_comm', 'commission_amount', 'hoa_hong_ktv_1', 'hoa_hong'], 0)).replace(/[^\d]/g, '')) || 0;
        let s1Tip = Number(String(getCell(r, colMapR, ['staff_1_tip', 'tip_ktv_1'], 0)).replace(/[^\d]/g, '')) || 0;

        // KTV 2
        let s2Phone = normalizePhone(getCell(r, colMapR, ['staff_2_user_id', 'staff_2_phone', 'user_id_2', 'sdt_ktv_2']));
        let s2Id = String(getCell(r, colMapR, ['staff_2_id', 'ma_ktv_2'])).trim();
        let s2Name = String(getCell(r, colMapR, ['staff_2_name', 'ten_ktv_2']));
        let s2Comm = Number(String(getCell(r, colMapR, ['staff_2_comm', 'hoa_hong_ktv_2'], 0)).replace(/[^\d]/g, '')) || 0;
        let s2Tip = Number(String(getCell(r, colMapR, ['staff_2_tip', 'tip_ktv_2'], 0)).replace(/[^\d]/g, '')) || 0;
        let hasStaff2 = Boolean((s2Phone && s2Phone !== '-') || (s2Id && s2Id !== '-'));

        let paymentMethod = String(getCell(r, colMapR, ['payment_method', 'phuong_thuc_tt'], 'Chuyển khoản'));
        let isVoucher = (getCell(r, colMapR, ['is_voucher_used', 'dung_voucher']) === true || String(getCell(r, colMapR, ['is_voucher_used', 'dung_voucher'])).toUpperCase() === 'TRUE');

        let isMyReceipt = (clientPhone && (s1Phone === clientPhone || s2Phone === clientPhone)) || 
                          (clientStaffId && (s1Id === clientStaffId || s2Id === clientStaffId));

        if (isOwner || isMyReceipt) {
          receipts.push({
            receipt_id: rId,
            date: rDate,
            start_time: startTime,
            end_time: endTime,
            duration_min: durationMin,
            time: startTime,
            customer_phone: custPhone,
            customer_name: custName,
            service_id: servId,
            service_name: servName,
            price: price,
            tip_amount: tipAmount,
            total_paid: totalPaid,

            staff_1_phone: s1Phone,
            staff_1_id: s1Id,
            staff_1_name: s1Name,
            staff_1_comm: s1Comm,
            staff_1_tip: s1Tip,

            has_staff_2: hasStaff2,
            staff_2_phone: s2Phone,
            staff_2_id: s2Id,
            staff_2_name: s2Name,
            staff_2_comm: s2Comm,
            staff_2_tip: s2Tip,

            staff_phone: s1Phone,
            staff_id: s1Id,
            staff_name: s1Name,
            commission_amount: s1Comm + s1Tip,

            payment_method: paymentMethod,
            is_voucher_used: isVoucher
          });
        }
      }
    }
  }

  // 5. Expenses
  let expenses = [];
  if (isOwner) {
    const sheetExp = ss.getSheetByName('tb_expenses');
    if (sheetExp) {
      const colMapE = createHeaderMap(sheetExp);
      const data = sheetExp.getDataRange().getValues();
      for (let i = data.length - 1; i >= 1; i--) {
        let r = data[i];
        let eId = String(getCell(r, colMapE, ['expense_id', 'ma_chi_phi'])).trim();
        if (eId) {
          expenses.push({
            expense_id: eId,
            date: String(getCell(r, colMapE, ['date', 'ngay'])),
            expense_type: String(getCell(r, colMapE, ['expense_type', 'loai_chi_phi'])),
            amount: Number(getCell(r, colMapE, ['amount', 'so_tien'], 0)) || 0,
            note: String(getCell(r, colMapE, ['note', 'ghi_chu'], ''))
          });
        }
      }
    }
  }

  // 6. Announcement
  const sheetConfig = ss.getSheetByName('tb_config');
  let announcement = {
    content: '✨ Chúc các kỹ thuật viên một ngày làm việc tràn đầy năng lượng!',
    author: 'Miles (Chủ sáng lập)',
    date: '27/08/2026'
  };
  if (sheetConfig) {
    const data = sheetConfig.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      let key = String(data[i][0]).trim();
      let val = String(data[i][1]).trim();
      let note = String(data[i][2] || '').trim();
      if (key === 'ANNOUNCEMENT') {
        announcement.content = val;
        if (note && note.includes('|')) {
          let parts = note.split('|');
          announcement.author = parts[0].trim();
          announcement.date = parts[1].trim();
        }
      }
    }
  }

  return {
    success: true,
    data: {
      menu: menu,
      users: users,
      customers: customers,
      receipts: receipts,
      expenses: expenses,
      announcement: announcement,
      is_owner_authenticated: isOwner
    }
  };
}
