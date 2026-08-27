/**
 * =========================================================================
 * SELENA SPA - API GOOGLE APPS SCRIPT (GAS SERVER BACKEND)
 * =========================================================================
 * Xử lý: Phân quyền, Khóa IP Wifi tiệm, Nhập ca gội, Tích điểm, Lương & Tài chính
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
        result = { success: true, message: 'Selena Spa API is active!', timestamp: new Date().toISOString() };
        break;

      case 'login':
        result = handleLogin(params);
        break;

      case 'sync_all_data':
        result = syncAllData();
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

      case 'get_staff_history':
        result = getStaffHistory(params.staff_id, params.month, params.year);
        break;

      case 'get_admin_dashboard':
        result = getAdminDashboard(params.month, params.year);
        break;

      case 'add_expense':
        result = addExpense(params);
        break;

      case 'update_config_ip':
        result = updateSpaWifiIP(params.client_ip);
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
function handleLogin(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetUsers = ss.getSheetByName('tb_users');
  const sheetConfig = ss.getSheetByName('tb_config');
  
  const usernameOrPin = String(params.pin || params.username || '').trim();
  const clientIp = String(params.client_ip || '').trim();

  // Đọc cấu hình Wifi Spa
  let spaWifiIp = '';
  let bankConfig = {};
  if (sheetConfig) {
    const configData = sheetConfig.getDataRange().getValues();
    for (let i = 1; i < configData.length; i++) {
      let key = String(configData[i][0]).trim();
      let val = String(configData[i][1]).trim();
      if (key === 'WIFI_SPA_IP') spaWifiIp = val;
      if (key === 'BANK_NAME') bankConfig.bank_name = val;
      if (key === 'BANK_ACCOUNT_NO') bankConfig.bank_account_no = val;
      if (key === 'BANK_ACCOUNT_NAME') bankConfig.bank_account_name = val;
      if (key === 'LOYALTY_TARGET') bankConfig.loyalty_target = Number(val) || 10;
    }
  }

  // Tìm tài khoản theo username hoặc PIN
  const usersData = sheetUsers.getDataRange().getValues();
  let foundUser = null;

  for (let i = 1; i < usersData.length; i++) {
    let row = usersData[i];
    let userId = String(row[0]).trim();
    let uname = String(row[1]).trim();
    let pin = String(row[2]).trim();
    let fullName = String(row[3]).trim();
    let role = String(row[4]).trim();
    let salaryType = String(row[5]).trim();
    let baseSalary = Number(row[6]) || 0;

    if (pin === usernameOrPin || uname === usernameOrPin || userId === usernameOrPin) {
      foundUser = {
        user_id: userId,
        username: uname,
        full_name: fullName,
        role: role,
        salary_type: salaryType,
        base_salary: baseSalary
      };
      break;
    }
  }

  if (!foundUser) {
    return { success: false, error: 'INVALID_CREDENTIALS', message: 'Mã PIN hoặc Tài khoản không chính xác.' };
  }

  // Kiểm tra bảo mật Wifi nếu là tài khoản Staff (KTV)
  if (foundUser.role === 'staff' && spaWifiIp && spaWifiIp !== '0.0.0.0' && spaWifiIp !== '') {
    if (clientIp && clientIp !== spaWifiIp) {
      return {
        success: false,
        error: 'WIFI_NOT_SPA',
        message: 'Bạn cần kết nối vào mạng Wifi của tiệm Selena Spa để đăng nhập.',
        client_ip: clientIp,
        required_ip: spaWifiIp
      };
    }
  }

  return {
    success: true,
    user: foundUser,
    config: bankConfig
  };
}

// -------------------------------------------------------------
// 2. LẤY DANH MỤC MENU DỊCH VỤ
// -------------------------------------------------------------
function getMenuList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('tb_menu');
  const data = sheet.getDataRange().getValues();
  
  let menu = [];
  for (let i = 1; i < data.length; i++) {
    let row = data[i];
    if (row[7] === true || row[7] === 'TRUE' || row[7] === 1) {
      menu.push({
        service_id: String(row[0]),
        service_name: String(row[1]),
        price: Number(row[2]) || 0,
        duration_min: Number(row[3]) || 30,
        cosmetics_cost: Number(row[4]) || 0,
        commission_type: String(row[5]),
        commission_value: Number(row[6]) || 0
      });
    }
  }
  return { success: true, menu: menu };
}

// -------------------------------------------------------------
// 3. TRA CỨU KHÁCH HÀNG & TÍCH ĐIỂM
// -------------------------------------------------------------
function checkCustomer(phoneNumber) {
  const phone = String(phoneNumber || '').trim();
  if (!phone) return { success: false, error: 'PHONE_EMPTY' };

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('tb_customers');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    let row = data[i];
    if (String(row[0]).trim() === phone) {
      return {
        success: true,
        found: true,
        customer: {
          phone_number: String(row[0]),
          customer_name: String(row[1]),
          total_visits: Number(row[2]) || 0,
          voucher_count: Number(row[3]) || 0,
          last_visit_date: row[4] ? formatDate(new Date(row[4])) : '',
          notes: String(row[5] || '')
        }
      };
    }
  }

  return { success: true, found: false, phone_number: phone };
}

// -------------------------------------------------------------
// 4. TẠO HÓA ĐƠN CA LÀM & TÍNH ĐIỂM / LƯƠNG TOUR
// -------------------------------------------------------------
function createReceipt(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetReceipts = ss.getSheetByName('tb_receipts');
  const sheetCustomers = ss.getSheetByName('tb_customers');
  const sheetUsers = ss.getSheetByName('tb_users');
  const sheetMenu = ss.getSheetByName('tb_menu');

  const now = new Date();
  const timeStr = formatDateTime(now);
  const receiptId = params.receipt_id || ('HD' + Utilities.formatDate(now, 'GMT+7', 'yyMMddHHmmss'));

  const phone = normalizePhone(params.customer_phone);
  const customerName = String(params.customer_name || 'Khách vãng lai').trim();
  const serviceId = String(params.service_id || '').trim();
  const staffPhone = normalizePhone(params.staff_phone || params.staff_id);
  const paymentMethod = String(params.payment_method || 'Chuyển khoản').trim();
  const isVoucherUsed = Boolean(params.is_voucher_used);
  const note = String(params.note || '').trim();

  // 1. Tìm thông tin dịch vụ
  let serviceName = String(params.service_name || '');
  let price = Number(params.price) || 0;
  if (!serviceName && sheetMenu) {
    const menuData = sheetMenu.getDataRange().getValues();
    for (let i = 1; i < menuData.length; i++) {
      if (String(menuData[i][0]).trim() === serviceId) {
        serviceName = String(menuData[i][1]);
        price = Number(menuData[i][2]) || price;
        break;
      }
    }
  }

  // 2. Tìm thông tin nhân viên & cách tính lương qua SĐT hoặc staff_id
  let staffName = String(params.staff_name || '');
  let staffCode = String(params.staff_id || 'KTV01');
  let staffSalaryType = 'fixed';
  let commRate = 10;
  if (sheetUsers) {
    const usersData = sheetUsers.getDataRange().getValues();
    for (let i = 1; i < usersData.length; i++) {
      let uPhone = normalizePhone(usersData[i][0] || usersData[i][2]);
      let uStaffId = String(usersData[i][1] || '').trim();
      if (uPhone === staffPhone || uStaffId === staffCode) {
        staffCode = uStaffId || staffCode;
        staffName = String(usersData[i][4] || usersData[i][3] || staffName);
        staffSalaryType = String(usersData[i][6] || usersData[i][5] || staffSalaryType);
        commRate = parsePercentage(usersData[i][7]);
        break;
      }
    }
  }

  // 3. Tính tiền hoa hồng KTV theo % thực tế của thợ (Ví dụ 10% của 64.000 = 6.400)
  let commissionAmount = Number(params.commission_amount) || 0;
  if (!commissionAmount) {
    commissionAmount = Math.round(price * (commRate / 100));
  }

  // 4. Tính tiền thực thu từ khách
  let discountAmount = isVoucherUsed ? price : 0;
  let totalPaid = isVoucherUsed ? 0 : price;

  // 5. Ghi vào tb_receipts (Chuẩn 18 cột của Sheet)
  sheetReceipts.appendRow([
    receiptId, timeStr, formatDate(now), "'" + phone, customerName,
    serviceId, serviceName, "'" + staffPhone, staffCode, staffName,
    price, commissionAmount, discountAmount, totalPaid,
    paymentMethod, isVoucherUsed, 'completed', note
  ]);

  // 6. Xử lý tích điểm & Voucher khách hàng trong tb_customers
  let updatedVisits = 1;
  let updatedVouchers = 0;
  let customerRowIndex = -1;

  if (phone) {
    const custData = sheetCustomers.getDataRange().getValues();
    for (let i = 1; i < custData.length; i++) {
      if (normalizePhone(custData[i][0]) === phone) {
        customerRowIndex = i + 1;
        let curVisits = Number(custData[i][2]) || 0;
        let curVouchers = Number(custData[i][3]) || 0;

        if (isVoucherUsed) {
          updatedVouchers = Math.max(0, curVouchers - 1);
          updatedVisits = curVisits;
        } else {
          updatedVisits = curVisits + 1;
          updatedVouchers = curVouchers;
          if (updatedVisits >= 10) {
            updatedVouchers += 1;
            updatedVisits -= 10;
          }
        }
        break;
      }
    }

    if (customerRowIndex > 0) {
      sheetCustomers.getRange(customerRowIndex, 2).setValue(customerName);
      sheetCustomers.getRange(customerRowIndex, 3).setValue(updatedVisits);
      sheetCustomers.getRange(customerRowIndex, 4).setValue(updatedVouchers);
      sheetCustomers.getRange(customerRowIndex, 5).setValue(timeStr);
      if (note) {
        let oldNote = sheetCustomers.getRange(customerRowIndex, 6).getValue();
        sheetCustomers.getRange(customerRowIndex, 6).setValue(oldNote ? oldNote + ' | ' + note : note);
      }
    } else {
      // Khách mới
      sheetCustomers.appendRow(["'" + phone, customerName, 1, 0, timeStr, note]);
    }
  }

  return {
    success: true,
    receipt_id: receiptId,
    total_paid: totalPaid,
    commission_earned: commissionAmount,
    loyalty: {
      total_visits: updatedVisits,
      voucher_count: updatedVouchers,
      awarded_new_voucher: (updatedVisits === 0 && !isVoucherUsed)
    }
  };
}

// -------------------------------------------------------------
// 5. BÁO CÁO LƯƠNG & LỊCH SỬ KTV
// -------------------------------------------------------------
function getStaffHistory(staffId, month, year) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetReceipts = ss.getSheetByName('tb_receipts');
  const sheetUsers = ss.getSheetByName('tb_users');
  
  const targetYear = Number(year) || new Date().getFullYear();
  const targetMonth = Number(month) || (new Date().getMonth() + 1);

  let baseSalary = 0;
  const usersData = sheetUsers.getDataRange().getValues();
  for (let i = 1; i < usersData.length; i++) {
    if (String(usersData[i][0]).trim() === staffId) {
      baseSalary = Number(usersData[i][6]) || 0;
      break;
    }
  }

  const data = sheetReceipts.getDataRange().getValues();
  let receipts = [];
  let totalCommission = 0;
  let totalTours = 0;

  for (let i = data.length - 1; i >= 1; i--) {
    let row = data[i];
    let rowStaffId = String(row[7]).trim();
    let rowDateStr = String(row[2]).trim();

    if (rowStaffId === staffId) {
      let parts = rowDateStr.split('-');
      if (parts.length >= 2) {
        let rYear = Number(parts[0]);
        let rMonth = Number(parts[1]);
        if (rYear === targetYear && rMonth === targetMonth) {
          let comm = Number(row[10]) || 0;
          totalCommission += comm;
          totalTours += 1;

          receipts.push({
            receipt_id: String(row[0]),
            timestamp: String(row[1]),
            date: rowDateStr,
            customer_name: String(row[4]),
            service_name: String(row[6]),
            price: Number(row[9]),
            commission_amount: comm,
            total_paid: Number(row[12]),
            payment_method: String(row[13]),
            is_voucher_used: Boolean(row[14])
          });
        }
      }
    }
  }

  return {
    success: true,
    staff_id: staffId,
    month: targetMonth,
    year: targetYear,
    summary: {
      total_tours: totalTours,
      total_commission: totalCommission,
      base_salary: baseSalary,
      total_earnings: baseSalary + totalCommission
    },
    receipts: receipts
  };
}

// -------------------------------------------------------------
// 6. DASHBOARD TÀI CHÍNH DÒNG TIỀN DÀNH CHO CHỦ TIỆM
// -------------------------------------------------------------
function getAdminDashboard(month, year) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetReceipts = ss.getSheetByName('tb_receipts');
  const sheetExpenses = ss.getSheetByName('tb_expenses');
  const sheetUsers = ss.getSheetByName('tb_users');
  const sheetMenu = ss.getSheetByName('tb_menu');

  const targetYear = Number(year) || new Date().getFullYear();
  const targetMonth = Number(month) || (new Date().getMonth() + 1);

  // Map biến phí mỹ phẩm từ Menu
  let menuCosmeticsMap = {};
  const menuData = sheetMenu.getDataRange().getValues();
  for (let i = 1; i < menuData.length; i++) {
    menuCosmeticsMap[String(menuData[i][0]).trim()] = Number(menuData[i][4]) || 0;
  }

  // 1. Tính Doanh thu, Hoa hồng KTV & Chi phí Dầu gội
  let totalRevenue = 0;
  let totalStaffCommissions = 0;
  let totalCosmeticsCost = 0;
  let totalTours = 0;
  let recentReceipts = [];

  const recData = sheetReceipts.getDataRange().getValues();
  for (let i = recData.length - 1; i >= 1; i--) {
    let row = recData[i];
    let dateStr = String(row[2]).trim();
    let parts = dateStr.split('-');
    if (parts.length >= 2) {
      let rYear = Number(parts[0]);
      let rMonth = Number(parts[1]);
      if (rYear === targetYear && rMonth === targetMonth) {
        let rev = Number(row[12]) || 0;
        let comm = Number(row[10]) || 0;
        let servId = String(row[5]).trim();
        let cosm = menuCosmeticsMap[servId] || 0;

        totalRevenue += rev;
        totalStaffCommissions += comm;
        totalCosmeticsCost += cosm;
        totalTours += 1;

        if (recentReceipts.length < 20) {
          recentReceipts.push({
            receipt_id: String(row[0]),
            timestamp: String(row[1]),
            customer_name: String(row[4]),
            service_name: String(row[6]),
            staff_name: String(row[8]),
            total_paid: rev,
            payment_method: String(row[13]),
            is_voucher_used: Boolean(row[14])
          });
        }
      }
    }
  }

  // 2. Tính Tổng Lương cứng KTV
  let totalBaseSalary = 0;
  const usersData = sheetUsers.getDataRange().getValues();
  for (let i = 1; i < usersData.length; i++) {
    if (String(usersData[i][4]).trim() === 'staff') {
      totalBaseSalary += Number(usersData[i][6]) || 0;
    }
  }

  // 3. Tính Chi phí Vận hành (Điện, nước, mạng, mặt bằng...)
  let totalOperatingExpenses = 0;
  let expensesList = [];
  const expData = sheetExpenses.getDataRange().getValues();
  for (let i = 1; i < expData.length; i++) {
    let row = expData[i];
    let expDate = String(row[1]).trim();
    let parts = expDate.split('-');
    if (parts.length >= 2) {
      let rYear = Number(parts[0]);
      let rMonth = Number(parts[1]);
      if (rYear === targetYear && rMonth === targetMonth) {
        let amount = Number(row[3]) || 0;
        totalOperatingExpenses += amount;
        expensesList.push({
          expense_id: String(row[0]),
          date: expDate,
          expense_type: String(row[2]),
          amount: amount,
          note: String(row[4])
        });
      }
    }
  }

  const totalSalaries = totalBaseSalary + totalStaffCommissions;
  const netProfit = totalRevenue - totalSalaries - totalOperatingExpenses - totalCosmeticsCost;

  return {
    success: true,
    month: targetMonth,
    year: targetYear,
    kpis: {
      total_revenue: totalRevenue,
      total_salaries: totalSalaries,
      staff_commissions: totalStaffCommissions,
      staff_base_salaries: totalBaseSalary,
      operating_expenses: totalOperatingExpenses,
      cosmetics_cost: totalCosmeticsCost,
      net_profit: netProfit,
      total_tours: totalTours
    },
    recent_receipts: recentReceipts,
    expenses: expensesList
  };
}

// -------------------------------------------------------------
// 7. TIỆN ÍCH THÊM CHI PHÍ & CẬP NHẬT IP WIFI
// -------------------------------------------------------------
function addExpense(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('tb_expenses');
  const expId = 'EXP' + Utilities.formatDate(new Date(), 'GMT+7', 'yyMMddHHmmss');
  const dateStr = params.date || formatDate(new Date());
  const type = params.expense_type || 'Khác';
  const amount = Number(params.amount) || 0;
  const note = params.note || '';

  sheet.appendRow([expId, dateStr, type, amount, note]);
  return { success: true, expense_id: expId };
}

function updateSpaWifiIP(newIp) {
  if (!newIp) return { success: false, error: 'IP_EMPTY' };
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('tb_config');
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === 'WIFI_SPA_IP') {
      sheet.getRange(i + 1, 2).setValue(newIp);
      return { success: true, updated_ip: newIp };
    }
  }
  sheet.appendRow(['WIFI_SPA_IP', newIp, 'Địa chỉ IP Wifi công cộng của Spa']);
  return { success: true, updated_ip: newIp };
}

// Helper formats
function formatDate(d) {
  return Utilities.formatDate(d, 'GMT+7', 'yyyy/MM/dd');
}

function formatDateTime(d) {
  return Utilities.formatDate(d, 'GMT+7', 'yyyy/MM/dd - HH:mm');
}

// -------------------------------------------------------------
// 8. ĐỒNG BỘ TOÀN DIỆN 2 CHIỀU (SYNC ALL DATA TỪ SHEET)
// -------------------------------------------------------------
function syncAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Menu
  const sheetMenu = ss.getSheetByName('tb_menu');
  let menu = [];
  if (sheetMenu) {
    const data = sheetMenu.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      let r = data[i];
      if (r[0] && r[1]) {
        menu.push({
          service_id: String(r[0]),
          service_name: String(r[1]),
          price: Number(r[2]) || 0,
          duration_min: Number(r[3]) || 30,
          cosmetics_cost: Number(r[4]) || 0,
          commission_value: Number(r[6]) || (Number(r[2]) * 0.1)
        });
      }
    }
  }

  // 2. Users (tb_users: user_id, staff_id, phone, password, full_name, role, salary_type, commission_rate, base_salary...)
  const sheetUsers = ss.getSheetByName('tb_users');
  let users = [];
  if (sheetUsers) {
    const data = sheetUsers.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      let r = data[i];
      if (r[0] || r[1] || r[2]) {
        let userId = normalizePhone(r[0]);
        let staffId = String(r[1] || '').trim();
        let phone = normalizePhone(r[2] || r[0]);
        let pwd = String(r[3] || '123456').trim();
        let fullName = String(r[4] || '').trim();
        let role = String(r[5] || 'staff').trim();
        let salaryType = String(r[6] || 'fixed').trim();
        
        // Đọc % hoa hồng từ Cột H (Index 7)
        let commRate = parsePercentage(r[7]);
        if (role === 'admin' || role === 'owner') commRate = 100;

        // Đọc lương cứng từ Cột I (Index 8)
        let baseSalary = Number(String(r[8] || r[7] || 0).replace(/[^\d]/g, '')) || 0;

        const isOwner = (role.toLowerCase() === 'admin' || role === 'Chủ tiệm' || role === 'Chủ Sáng Lập' || phone === '0949251144' || staffId === 'FOUNDER_01');

        users.push({
          user_id: userId || phone,
          staff_id: staffId || userId || phone,
          phone: phone,
          password: pwd,
          full_name: fullName || (isOwner ? 'Miles (Đấng tối cao)' : 'KTV'),
          role: isOwner ? 'Chủ tiệm' : 'Kỹ thuật viên',
          salary_type: salaryType,
          commission_rate: commRate,
          base_salary: baseSalary
        });
      }
    }
  }

  // 3. Customers
  const sheetCust = ss.getSheetByName('tb_customers');
  let customers = [];
  if (sheetCust) {
    const data = sheetCust.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      let r = data[i];
      if (r[0]) {
        let phone = normalizePhone(r[0]);
        let lastVisit = '';
        if (r[4]) {
          try {
            lastVisit = Utilities.formatDate(new Date(r[4]), 'GMT+7', 'yyyy/MM/dd');
          } catch(e) {
            lastVisit = String(r[4]);
          }
        }
        customers.push({
          phone_number: phone,
          customer_name: String(r[1]),
          total_visits: Number(r[2]) || 0,
          voucher_count: Number(r[3]) || 0,
          last_visit_date: lastVisit,
          notes: String(r[5] || '')
        });
      }
    }
  }

  // 4. Receipts (tb_receipts: receipt_id, timestamp, date, customer_phone, customer_name, service_id, service_name, user_id, staff_id, staff_name, price, commission_amount, discount_amount, total_paid, payment_method, is_voucher_used...)
  const sheetRec = ss.getSheetByName('tb_receipts');
  let receipts = [];
  if (sheetRec) {
    const data = sheetRec.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) {
      let r = data[i];
      if (r[0]) {
        let price = Number(String(r[10] || 0).replace(/[^\d]/g, '')) || 0;
        let comm = Number(String(r[11] || 0).replace(/[^\d]/g, '')) || 0;
        let totalPaid = Number(String(r[13] || 0).replace(/[^\d]/g, '')) || 0;
        let isVoucher = (r[15] === true || String(r[15]).toUpperCase() === 'TRUE');

        receipts.push({
          receipt_id: String(r[0]),
          date: String(r[1] || r[2]),
          customer_phone: normalizePhone(r[3]),
          customer_name: String(r[4]),
          service_id: String(r[5]),
          service_name: String(r[6]),
          user_id: normalizePhone(r[7]),
          staff_id: String(r[8] || r[7]),
          staff_phone: normalizePhone(r[7]),
          staff_name: String(r[9] || 'KTV'),
          price: price,
          commission_amount: comm,
          total_paid: totalPaid,
          payment_method: String(r[14]),
          is_voucher_used: isVoucher
        });
      }
    }
  }

  // 6. Config & Announcements (tb_config)
  const sheetConfig = ss.getSheetByName('tb_config');
  let configMap = {};
  let announcement = {
    content: '✨ Chúc các kỹ thuật viên một ngày làm việc tràn đầy năng lượng! Hãy luôn giữ nụ cười tươi, phục vụ tận tâm và chăm sóc khách chu đáo nhé.',
    author: 'Miles (Chủ sáng lập)',
    date: formatDate(new Date())
  };

  if (sheetConfig) {
    const data = sheetConfig.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      let k = String(data[i][0] || '').trim();
      let v = String(data[i][1] || '').trim();
      let note = String(data[i][2] || '').trim();
      let d = String(data[i][3] || '').trim();
      if (k) configMap[k] = v;
      if (k === 'ANNOUNCEMENT' || k === 'THONG_BAO') {
        announcement = {
          content: v,
          author: note ? note.replace('Thông báo từ ', '') : 'Miles (Chủ sáng lập)',
          date: d || formatDate(new Date())
        };
      }
    }
  }

  return {
    success: true,
    data: { menu, users, customers, receipts, expenses, announcement, config: configMap }
  };
}

function updateAnnouncement(params) {
  const content = String(params.content || '').trim();
  const author = String(params.author || 'Miles (Chủ sáng lập)').trim();
  if (!content) return { success: false, error: 'CONTENT_EMPTY' };
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheetConfig = ss.getSheetByName('tb_config');
  if (!sheetConfig) {
    sheetConfig = ss.insertSheet('tb_config');
    sheetConfig.appendRow(['config_key', 'config_value', 'description', 'updated_at']);
  }
  
  const data = sheetConfig.getDataRange().getValues();
  const dateStr = formatDate(new Date());
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === 'ANNOUNCEMENT') {
      sheetConfig.getRange(i + 1, 2).setValue(content);
      sheetConfig.getRange(i + 1, 3).setValue('Thông báo từ ' + author);
      sheetConfig.getRange(i + 1, 4).setValue(dateStr);
      return { success: true, message: 'Updated announcement', content: content, author: author, date: dateStr };
    }
  }
  sheetConfig.appendRow(['ANNOUNCEMENT', content, 'Thông báo từ ' + author, dateStr]);
  return { success: true, message: 'Created announcement', content: content, author: author, date: dateStr };
}
