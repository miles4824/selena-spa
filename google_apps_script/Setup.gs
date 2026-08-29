/**
 * =========================================================================
 * SELENA SPA - SETUP DATABASE SCRIPT (setup.gs) - 25 CỘT CHUẨN START/END
 * =========================================================================
 */

function upgradeReceiptsTable() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('tb_receipts');
  if (!sheet) sheet = ss.insertSheet('tb_receipts');

  const newHeaders = [
    'receipt_id',        // A: Mã hóa đơn
    'date',              // B: Ngày (YYYY-MM-DD)
    'start_time',        // C: Giờ bắt đầu (HH:mm)
    'end_time',          // D: Giờ kết thúc (HH:mm)
    'duration_min',      // E: Số phút làm thực tế
    'customer_phone',    // F: SĐT khách
    'customer_name',     // G: Tên khách
    'service_id',        // H: Mã combo
    'service_name',      // I: Tên dịch vụ
    'price',             // J: Giá dịch vụ gốc
    'tip_amount',        // K: Tiền Tips
    'total_paid',        // L: Tổng khách trả
    'staff_1_phone',     // M: SĐT KTV 1
    'staff_1_id',        // N: Mã KTV 1
    'staff_1_name',      // O: Tên KTV 1
    'staff_1_comm',      // P: Hoa hồng KTV 1
    'staff_1_tip',       // Q: Tiền Tips KTV 1
    'staff_2_phone',     // R: SĐT KTV 2
    'staff_2_id',        // S: Mã KTV 2
    'staff_2_name',      // T: Tên KTV 2
    'staff_2_comm',      // U: Hoa hồng KTV 2
    'staff_2_tip',       // V: Tiền Tips KTV 2
    'payment_method',    // W: Phương thức TT
    'is_voucher_used',   // X: Dùng voucher
    'created_at'         // Y: Thời gian tạo
  ];

  sheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
  const headerRange = sheet.getRange(1, 1, 1, newHeaders.length);
  headerRange.setBackground('#3B185F');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  sheet.setRowHeight(1, 35);
  sheet.setFrozenRows(1);

  Logger.log('✅ ĐÃ CẬP NHẬT 25 CỘT CHUẨN START/END CHO BẢNG tb_receipts!');
}
