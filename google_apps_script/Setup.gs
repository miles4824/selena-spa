/**
 * =========================================================================
 * SELENA SPA - SETUP DATABASE SCRIPT (setup.gs)
 * =========================================================================
 * File này dùng để KHỞI TẠO & CẬP NHẬT TOÀN BỘ CỘT CSDL TRÊN GOOGLE SHEETS
 * Chỉ cần chọn hàm `setupEntireDatabase` hoặc `upgradeReceiptsTable` rồi bấm RUN!
 */

// 1. CẬP NHẬT RIÊNG BẢNG tb_receipts (GIỮ NGUYÊN DỮ LIỆU CŨ, THÊM CỘT 2 KTV VÀ TIPS)
function upgradeReceiptsTable() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('tb_receipts');
  
  if (!sheet) {
    sheet = ss.insertSheet('tb_receipts');
  }

  const newHeaders = [
    'receipt_id',        // A: Mã hóa đơn
    'date',              // B: Ngày (YYYY-MM-DD)
    'time',              // C: Giờ (HH:mm)
    'customer_phone',    // D: SĐT khách
    'customer_name',     // E: Tên khách
    'service_id',        // F: Mã combo
    'service_name',      // G: Tên dịch vụ
    'price',             // H: Giá dịch vụ gốc
    'tip_amount',        // I: Tiền Tips
    'total_paid',        // J: Tổng khách trả
    'staff_1_phone',     // K: SĐT KTV 1
    'staff_1_id',        // L: Mã KTV 1
    'staff_1_name',      // M: Tên KTV 1
    'staff_1_comm',      // N: Hoa hồng KTV 1
    'staff_1_tip',       // O: Tiền Tips KTV 1
    'staff_2_phone',     // P: SĐT KTV 2
    'staff_2_id',        // Q: Mã KTV 2
    'staff_2_name',      // R: Tên KTV 2
    'staff_2_comm',      // S: Hoa hồng KTV 2
    'staff_2_tip',       // T: Tiền Tips KTV 2
    'payment_method',    // U: Phương thức TT
    'is_voucher_used',   // V: Dùng voucher
    'created_at'         // W: Thời gian chi tiết
  ];

  // Ghi đè dòng tiêu đề Hàng 1
  sheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);

  // Định dạng style cho Hàng 1: Màu Tím Than Sang Trọng, Chữ Trắng In Đậm
  const headerRange = sheet.getRange(1, 1, 1, newHeaders.length);
  headerRange.setBackground('#3B185F');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  sheet.setRowHeight(1, 35);
  sheet.setFrozenRows(1);

  Logger.log('✅ ĐÃ CẬP NHẬT TOÀN BỘ 23 CỘT CHO BẢNG tb_receipts THÀNH CÔNG!');
}

// 2. KHỞI TẠO & ĐỒNG BỘ TOÀN BỘ 6 BẢNG DỮ LIỆU CỦA SELENA SPA
function setupEntireDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const TABLES = {
    'tb_users': {
      headers: ['user_id', 'staff_id', 'phone', 'password', 'full_name', 'role', 'salary_type', 'commission_rate', 'base_salary'],
      sampleData: [
        ['0949251144', 'FOUNDER_01', '0949251144', '123456', 'Miles', 'Chủ tiệm', 'owner', '100%', 0],
        ['0799625591', 'KTV01', '0799625591', '123456', 'Thu Ngân', 'Kỹ thuật viên', 'fixed', '10%', 2000000],
        ['0912345678', 'KTV02', '0912345678', '123456', 'Mai Lan', 'Kỹ thuật viên', 'commission', '20%', 0]
      ]
    },
    'tb_menu': {
      headers: ['service_id', 'service_name', 'price', 'duration_min', 'cosmetics_cost', 'commission_type', 'commission_value'],
      sampleData: [
        ['CB01', 'Combo 1 (Gội Dưỡng Sinh)', 64000, 45, 3000, 'percent', 6400],
        ['CB02', 'Combo 2 (Gội Chuyên Sâu)', 99000, 60, 5000, 'percent', 9900],
        ['CB03', 'Combo 3 (Gội Dưỡng Sinh Hoàng Gia)', 149000, 75, 8000, 'percent', 14900],
        ['CB04', 'Combo 4 (Gội + Massage Cổ Vai Gáy)', 199000, 90, 10000, 'percent', 19900]
      ]
    },
    'tb_customers': {
      headers: ['phone_number', 'customer_name', 'total_visits', 'voucher_count', 'last_visit_date', 'notes'],
      sampleData: [
        ['0912345678', 'Chị Mai Lan', 8, 0, '2026/08/27', 'Da đầu dầu, thích sấy mát'],
        ['0988776655', 'Anh Nam', 3, 0, '2026/08/26', 'Thích bấm huyệt thái dương']
      ]
    },
    'tb_receipts': {
      headers: [
        'receipt_id', 'date', 'time', 'customer_phone', 'customer_name', 'service_id', 'service_name', 
        'price', 'tip_amount', 'total_paid', 
        'staff_1_phone', 'staff_1_id', 'staff_1_name', 'staff_1_comm', 'staff_1_tip', 
        'staff_2_phone', 'staff_2_id', 'staff_2_name', 'staff_2_comm', 'staff_2_tip', 
        'payment_method', 'is_voucher_used', 'created_at'
      ],
      sampleData: []
    },
    'tb_expenses': {
      headers: ['expense_id', 'date', 'expense_type', 'amount', 'note'],
      sampleData: [
        ['CP01', '2026-08-01', 'Mạng Internet', 350000, 'Gói cước wifi tiệm'],
        ['CP02', '2026-08-01', 'Điện cố định', 1200000, 'Điện chiếu sáng & máy lạnh']
      ]
    },
    'tb_config': {
      headers: ['config_key', 'config_value', 'description'],
      sampleData: [
        ['ANNOUNCEMENT', '✨ Chúc các kỹ thuật viên một ngày làm việc tràn đầy năng lượng! Hãy luôn giữ nụ cười tươi, vệ sinh bồn gội sạch sẽ và tư vấn chu đáo cho khách nhé.', 'Miles (Chủ sáng lập) | 27/08/2026'],
        ['WIFI_SPA_IP', '*', 'Địa chỉ IP Wifi tiệm'],
        ['BANK_NAME', 'MBBank', 'Ngân hàng nhận chuyển khoản'],
        ['BANK_ACCOUNT_NO', '0949251144', 'Số tài khoản nhận tiền'],
        ['BANK_ACCOUNT_NAME', 'NGUYEN TIEN DUY', 'Tên chủ tài khoản']
      ]
    }
  };

  for (let tableName in TABLES) {
    let sheet = ss.getSheetByName(tableName);
    if (!sheet) {
      sheet = ss.insertSheet(tableName);
    }

    const tData = TABLES[tableName];
    
    // Ghi Header
    sheet.getRange(1, 1, 1, tData.headers.length).setValues([tData.headers]);

    // Style Header
    const headerRange = sheet.getRange(1, 1, 1, tData.headers.length);
    headerRange.setBackground('#3B185F');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    headerRange.setVerticalAlignment('middle');
    sheet.setRowHeight(1, 35);
    sheet.setFrozenRows(1);

    // Ghi dữ liệu mẫu nếu bảng đang trống (chỉ có 1 dòng header)
    if (sheet.getLastRow() === 1 && tData.sampleData.length > 0) {
      sheet.getRange(2, 1, tData.sampleData.length, tData.headers.length).setValues(tData.sampleData);
    }
  }

  Logger.log('🎉 TOÀN BỘ 6 BẢNG DỮ LIỆU ĐÃ ĐƯỢC THIẾT LẬP HOÀN HẢO!');
}
