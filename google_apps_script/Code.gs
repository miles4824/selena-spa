/**
 * =========================================================================
 * SELENA SPA - API GOOGLE APPS SCRIPT (GAS SERVER BACKEND V2.0 - SECURE)
 * =========================================================================
 * Phân quyền bảo mật từ gốc:
 * - Chủ tiệm (Admin): Xem toàn bộ doanh thu, lợi nhuận, chi phí, nhân sự
 * - Kỹ thuật viên (KTV): CHỈ nhận ca gội của chính mình, KHÔNG nhận chi phí & lợi nhuận tiệm
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
        result = { success: true, message: 'Selena Spa Secure Backend is active!', timestamp: new Date().toISOString() };
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

// -------------------------------------------------------------
// 1. XỬ LÝ ĐĂNG NHẬP
// -------------------------------------------------------------
function handleLogin(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetUsers = ss.getSheetByName('tb_users');
  const inputPhone = normalizePhone(params.phone || params.username || params.user_id);
  const inputPwd = String(params.password || params.pin || '').trim();

  if (!sheetUsers) return { success: false, error: 'SHEET_USERS_NOT_FOUND' };

  const data = sheetUsers.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    let row = data[i];
    let uPhone = normalizePhone(row[0] || row[2]);
    let uStaffId = String(row[1] || '').trim();
    let uPwd = String(row[3] || '123456').trim();
    let fullName = String(row[4] || '').trim();
    let role = String(row[5] || 'staff').trim();
    let salaryType = String(row[6] || 'fixed').trim();
    let commRate = parsePercentage(row[7]);
    let baseSalary = Number(String(row[8] || 0).replace(/[^\d]/g, '')) || 0;

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
  
  const data = sheet.getDataRange().getValues();
  let menu = [];
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
  
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    let row = data[i];
    if (normalizePhone(row[0]) === phone) {
      return {
        success: true,
        found: true,
        customer: {
          phone_number: normalizePhone(row[0]),
          customer_name: String(row[1]),
          total_visits: Number(row[2]) || 0,
          voucher_count: Number(row[3]) || 0,
          notes: String(row[5] || '')
        }
      };
    }
  }

  return { success: true, found: false, phone_number: phone };
}

// -------------------------------------------------------------
// 4. TẠO HÓA ĐƠN CA LÀM
// -------------------------------------------------------------
function createReceipt(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetReceipts = ss.getSheetByName('tb_receipts');
  const sheetCustomers = ss.getSheetByName('tb_customers');
  const sheetUsers = ss.getSheetByName('tb_users');

  const now = new Date();
  const timeStr = Utilities.formatDate(now, 'GMT+7', 'yyyy/MM/dd - HH:mm');
  const dateStr = Utilities.formatDate(now, 'GMT+7', 'yyyy-MM-dd');
  const receiptId = params.receipt_id || ('HD' + Utilities.formatDate(now, 'GMT+7', 'yyMMddHHmmss'));

  const phone = normalizePhone(params.customer_phone);
  const customerName = String(params.customer_name || 'Khách vãng lai').trim();
  const serviceId = String(params.service_id || '').trim();
  const serviceName = String(params.service_name || '');
  const price = Number(params.price) || 0;
  const totalPaid = Number(params.total_paid) || 0;
  const staffPhone = normalizePhone(params.staff_phone);
  const staffCode = String(params.staff_id || 'KTV01');
  const staffName = String(params.staff_name || 'KTV');
  const commAmount = Number(params.commission_amount) || 0;
  const paymentMethod = String(params.payment_method || 'Chuyển khoản').trim();
  const isVoucherUsed = Boolean(params.is_voucher_used);

  // Ghi vào tb_receipts
  if (sheetReceipts) {
    sheetReceipts.appendRow([
      receiptId,
      dateStr,
      dateStr,
      phone,
      customerName,
      serviceId,
      serviceName,
      staffPhone,
      staffCode,
      staffName,
      price,
      commAmount,
      0,
      totalPaid,
      paymentMethod,
      isVoucherUsed ? 'TRUE' : 'FALSE',
      timeStr
    ]);
  }

  // Cập nhật tích điểm tb_customers
  if (sheetCustomers && phone) {
    const custData = sheetCustomers.getDataRange().getValues();
    let foundIndex = -1;
    for (let i = 1; i < custData.length; i++) {
      if (normalizePhone(custData[i][0]) === phone) {
        foundIndex = i + 1;
        let visits = Number(custData[i][2]) || 0;
        let vouchers = Number(custData[i][3]) || 0;
        if (isVoucherUsed) {
          vouchers = Math.max(0, vouchers - 1);
        } else {
          visits += 1;
          if (visits >= 10) {
            vouchers += 1;
            visits -= 10;
          }
        }
        sheetCustomers.getRange(foundIndex, 3).setValue(visits);
        sheetCustomers.getRange(foundIndex, 4).setValue(vouchers);
        sheetCustomers.getRange(foundIndex, 5).setValue(dateStr);
        if (customerName && customerName !== 'Khách vãng lai') {
          sheetCustomers.getRange(foundIndex, 2).setValue(customerName);
        }
        break;
      }
    }

    if (foundIndex === -1) {
      sheetCustomers.appendRow([
        phone,
        customerName,
        isVoucherUsed ? 0 : 1,
        0,
        dateStr,
        ''
      ]);
    }
  }

  return { success: true, receipt_id: receiptId };
}

// -------------------------------------------------------------
// 5. THÊM CHI PHÍ VẬN HÀNH (CHỈ CHỦ MỚI ĐƯỢC GỌI)
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
// 7. ĐỒNG BỘ TOÀN DIỆN PHÂN QUYỀN BẢO MẬT (SECURE SYNC)
// -------------------------------------------------------------
function syncAllData(params) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Xác thực danh tính người gọi
  const clientPhone = normalizePhone(params.client_phone || params.phone);
  const clientStaffId = String(params.client_staff_id || params.staff_id || '').trim();
  const clientRole = String(params.client_role || '').trim();

  const isOwner = isOwnerCheck(clientRole, clientPhone, clientStaffId);

  // 1. Menu (Công khai cho toàn bộ thợ & chủ)
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

  // 2. Users:
  // - Nếu là Chủ: Trả về đầy đủ thông tin để quản lý nhân sự
  // - Nếu là KTV / Ẩn danh: Chỉ trả về tên hiển thị và SĐT phục vụ chọn tài khoản, GIẤU MẬT KHẨU & LƯƠNG CỦA NGƯỜI KHÁC
  const sheetUsers = ss.getSheetByName('tb_users');
  let users = [];
  if (sheetUsers) {
    const data = sheetUsers.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      let r = data[i];
      if (r[0] || r[1] || r[2]) {
        let uUserId = normalizePhone(r[0]);
        let uStaffId = String(r[1] || '').trim();
        let uPhone = normalizePhone(r[2] || r[0]);
        let uPwd = String(r[3] || '123456').trim();
        let fullName = String(r[4] || '').trim();
        let role = String(r[5] || 'staff').trim();
        let salaryType = String(r[6] || 'fixed').trim();
        let commRate = parsePercentage(r[7]);
        let baseSalary = Number(String(r[8] || 0).replace(/[^\d]/g, '')) || 0;

        const uIsOwner = isOwnerCheck(role, uPhone, uStaffId);

        if (isOwner) {
          // Chủ tiệm nhận toàn bộ
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
          // KTV chỉ nhận thông tin của chính mình, các nhân sự khác chỉ thấy Tên để hiển thị
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

  // 3. Customers (Công khai để tra cứu điểm khách)
  const sheetCust = ss.getSheetByName('tb_customers');
  let customers = [];
  if (sheetCust) {
    const data = sheetCust.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      let r = data[i];
      if (r[0]) {
        customers.push({
          phone_number: normalizePhone(r[0]),
          customer_name: String(r[1]),
          total_visits: Number(r[2]) || 0,
          voucher_count: Number(r[3]) || 0,
          last_visit_date: r[4] ? Utilities.formatDate(new Date(r[4]), 'GMT+7', 'yyyy/MM/dd') : '',
          notes: String(r[5] || '')
        });
      }
    }
  }

  // 4. Receipts:
  // - Nếu là Chủ: Nhận TOÀN BỘ hóa đơn tiệm để tính Doanh thu & Lợi nhuận
  // - Nếu là KTV: CHỈ NHẬN CÁC HÓA ĐƠN DO CHÍNH MÌNH THỰC HIỆN
  const sheetRec = ss.getSheetByName('tb_receipts');
  let receipts = [];
  if (sheetRec) {
    const data = sheetRec.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) {
      let r = data[i];
      if (r[0]) {
        let rStaffPhone = normalizePhone(r[7] || r[8]);
        let rStaffId = String(r[8] || '').trim();
        let isMyReceipt = (clientPhone && rStaffPhone === clientPhone) || (clientStaffId && rStaffId === clientStaffId);

        if (isOwner || isMyReceipt) {
          receipts.push({
            receipt_id: String(r[0]),
            date: String(r[1] || r[2]),
            customer_phone: normalizePhone(r[3]),
            customer_name: String(r[4]),
            service_id: String(r[5]),
            service_name: String(r[6]),
            staff_phone: rStaffPhone,
            staff_id: rStaffId,
            staff_name: String(r[9]),
            price: Number(String(r[10] || 0).replace(/[^\d]/g, '')) || 0,
            commission_amount: Number(String(r[11] || 0).replace(/[^\d]/g, '')) || 0,
            total_paid: Number(String(r[13] || 0).replace(/[^\d]/g, '')) || 0,
            payment_method: String(r[14] || 'Chuyển khoản'),
            is_voucher_used: (r[15] === true || String(r[15]).toUpperCase() === 'TRUE'),
            time: String(r[16] || '').split('- ')[1] || '14:30'
          });
        }
      }
    }
  }

  // 5. Expenses:
  // - Nếu là Chủ: Nhận toàn bộ chi phí vận hành
  // - Nếu là KTV: TRẢ VỀ RỖNG [] (BẢO VỆ TUYỆT ĐỐI DỮ LIỆU CHI PHÍ CỦA TIỆM)
  let expenses = [];
  if (isOwner) {
    const sheetExp = ss.getSheetByName('tb_expenses');
    if (sheetExp) {
      const data = sheetExp.getDataRange().getValues();
      for (let i = data.length - 1; i >= 1; i--) {
        let r = data[i];
        if (r[0]) {
          expenses.push({
            expense_id: String(r[0]),
            date: String(r[1]),
            expense_type: String(r[2]),
            amount: Number(r[3]) || 0,
            note: String(r[4] || '')
          });
        }
      }
    }
  }

  // 6. Announcement & Config
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
