/**
 * =========================================================================
 * SELENA SPA - SCRIPT KHỞI TẠO CƠ SỞ DỮ LIỆU GOOGLE SHEETS (1-CLICK SETUP)
 * =========================================================================
 * Hướng dẫn:
 * 1. Mở file Google Sheet mới trên Google Drive của bạn.
 * 2. Vào 'Tiện ích mở rộng' (Extensions) -> 'Apps Script'.
 * 3. Dán toàn bộ mã nguồn này vào file 'Setup.gs'.
 * 4. Chọn hàm 'initDatabase' và bấm nút 'Chạy' (Run).
 * 5. Cấp quyền truy cập cho Script. Toàn bộ 6 bảng sẽ được tạo tự động với dữ liệu mẫu!
 */

function initDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. BẢNG tb_users (Tài khoản nhân sự & Lương)
  let sheetUsers = getOrCreateSheet(ss, 'tb_users');
  sheetUsers.clear();
  sheetUsers.appendRow([
    'sdt_tai_khoan', 'mat_khau', 'ho_ten', 'vai_tro', 
    'che_do_luong', 'luong_cung', 'ngan_hang', 'so_tai_khoan', 'ten_chu_tk'
  ]);
  sheetUsers.appendRow(["'0949251144", '123456', 'Miles (Chủ Sáng Lập)', 'Chủ tiệm', 'Chủ tiệm', 0, 'MBBank', "'0912345678", 'MILES']);
  sheetUsers.appendRow(["'0912345678", '123456', 'KTV Mai Lan', 'Kỹ thuật viên', '10% + Lương cứng', 2000000, 'Vietcombank', "'1012345678", 'MAI LAN']);
  sheetUsers.appendRow(["'0987654321", '123456', 'KTV Kim Hoa', 'Kỹ thuật viên', '20% (Không lương)', 0, 'Techcombank', "'19012345678", 'KIM HOA']);
  formatHeader(sheetUsers, '#7c6cf0');

  // 2. BẢNG tb_menu (Danh mục Combo & Dịch vụ)
  let sheetMenu = getOrCreateSheet(ss, 'tb_menu');
  sheetMenu.clear();
  sheetMenu.appendRow([
    'ma_dich_vu', 'ten_dich_vu', 'gia_tien', 'thoi_gian_phut', 'chi_phi_my_pham', 
    'loai_hoa_hong', 'gia_tri_hoa_hong', 'dang_hoat_dong'
  ]);
  sheetMenu.appendRow(['CB_BE', 'Combo Bé (Gội cơ bản)', 45000, 30, 4500, '10%', 4500, true]);
  sheetMenu.appendRow(['CB_01', 'Combo 1 (Gội dưỡng sinh thư giãn)', 64000, 50, 6400, '10%', 6400, true]);
  sheetMenu.appendRow(['CB_02', 'Combo 2 (Dưỡng sinh chuyên sâu + Cổ vai gáy)', 109000, 75, 10000, '10%', 11000, true]);
  sheetMenu.appendRow(['CB_03', 'Combo 3 (Dưỡng sinh thảo mộc cao cấp)', 139000, 85, 14000, '10%', 14000, true]);
  sheetMenu.appendRow(['CB_04', 'Combo 4 (Liệu trình phục hồi da đầu + Massage)', 179000, 95, 18000, '10%', 18000, true]);
  sheetMenu.appendRow(['CB_05', 'Combo 5 (Đại tiệc Thư giãn Hoàng Gia)', 219000, 110, 22000, '10%', 22000, true]);
  formatHeader(sheetMenu, '#10b981');

  // 3. BẢNG tb_receipts (Nhật ký Hóa đơn & Ca làm)
  let sheetReceipts = getOrCreateSheet(ss, 'tb_receipts');
  sheetReceipts.clear();
  sheetReceipts.appendRow([
    'ma_hoa_don', 'ngay_tao', 'ngay_lam', 'sdt_khach', 'ten_khach', 
    'ma_dich_vu', 'ten_dich_vu', 'sdt_ktv', 'ten_ktv', 'gia_tien', 
    'hoa_hong_ktv', 'giam_gia', 'tong_thu_thuc', 'phuong_thuc_tt', 
    'dung_voucher', 'ghi_chu'
  ]);
  formatHeader(sheetReceipts, '#3b82f6');

  // 4. BẢNG tb_expenses (Chi phí Vận hành)
  let sheetExpenses = getOrCreateSheet(ss, 'tb_expenses');
  sheetExpenses.clear();
  sheetExpenses.appendRow([
    'ma_chi_phi', 'ngay_chi', 'loai_chi_phi', 'so_tien', 'ghi_chu'
  ]);
  sheetExpenses.appendRow(['EXP01', '2026/08/01', 'Mặt bằng', 0, 'Chi phí thuê mặt bằng']);
  sheetExpenses.appendRow(['EXP02', '2026/08/01', 'Mạng Internet', 350000, 'Gói cước mạng wifi']);
  sheetExpenses.appendRow(['EXP03', '2026/08/01', 'Điện cố định', 1000000, 'Tiền điện sinh hoạt cố định']);
  sheetExpenses.appendRow(['EXP04', '2026/08/01', 'Nước cố định', 250000, 'Tiền nước sinh hoạt']);
  formatHeader(sheetExpenses, '#ef4444');

  // 5. BẢNG tb_customers (Khách hàng & Tích điểm)
  let sheetCustomers = getOrCreateSheet(ss, 'tb_customers');
  sheetCustomers.clear();
  sheetCustomers.appendRow([
    'sdt_khach', 'ten_khach', 'so_lan_goi', 'so_voucher', 'ngay_goi_gan_nhat', 'luu_y_da_dau'
  ]);
  sheetCustomers.appendRow(["'0912345678", 'Chị Mai Lan', 8, 0, '2026/08/25', 'Da đầu nhạy cảm, thích sấy mát, gội nước ấm']);
  sheetCustomers.appendRow(["'0987654321", 'Anh Nam', 2, 1, '2026/08/26', 'Thích massage mạnh cổ vai gáy']);
  formatHeader(sheetCustomers, '#ec4899');

  // 6. BẢNG tb_config (Cấu hình Bảo mật & Hệ thống)
  let sheetConfig = getOrCreateSheet(ss, 'tb_config');
  sheetConfig.clear();
  sheetConfig.appendRow(['key', 'value', 'description']);
  sheetConfig.appendRow(['WIFI_SPA_IP', '14.232.245.10', 'Địa chỉ IP Wifi công cộng của tiệm Spa để xác thực KTV']);
  sheetConfig.appendRow(['BANK_NAME', 'MBBank', 'Tên ngân hàng nhận tiền của Chủ']);
  sheetConfig.appendRow(['BANK_ACCOUNT_NO', '0912345678', 'Số tài khoản nhận tiền của Chủ']);
  sheetConfig.appendRow(['BANK_ACCOUNT_NAME', 'CHU TIEM SELENA SPA', 'Tên chủ tài khoản ngân hàng']);
  sheetConfig.appendRow(['LOYALTY_TARGET', '10', 'Số lần gội để được tặng 1 Voucher']);
  formatHeader(sheetConfig, '#6b7280');

  SpreadsheetApp.flush();
  Logger.log('ĐÃ KHỞI TẠO THÀNH CÔNG 6 BẢNG DỮ LIỆU TIẾNG VIỆT CHO SELENA SPA!');
}

function getOrCreateSheet(ss, name) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function formatHeader(sheet, bgColor) {
  let range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  range.setBackground(bgColor);
  range.setFontColor('#ffffff');
  range.setFontWeight('bold');
  range.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, sheet.getLastColumn());
}
