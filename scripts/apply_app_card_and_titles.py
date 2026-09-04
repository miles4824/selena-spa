import re

# 1. Update css/style.css with reusable card classes
css_file = "css/style.css"
with open(css_file, "r", encoding="utf-8") as f:
    css_content = f.read()

card_css = """
/* Luxury Reusable Cards (Chuẩn Tailwind 4 & Mobile Performance) */
.card-banner {
  border-radius: 28px;
  border: 1px solid #F0EAE1;
  box-shadow: 0 10px 30px -5px rgba(229, 138, 123, 0.05), 0 4px 12px rgba(0, 0, 0, 0.02);
  background-image: linear-gradient(to bottom right, #FFF0EB, #FFFFFF, #FAF6F1);
  position: relative;
  overflow: hidden;
}

.card-surface {
  background-color: #ffffff;
  border-radius: 28px;
  border: 1px solid #F0EAE1;
  box-shadow: 0 10px 30px -5px rgba(229, 138, 123, 0.05), 0 4px 12px rgba(0, 0, 0, 0.02);
  position: relative;
  overflow: hidden;
}
"""

if ".card-banner" not in css_content:
    css_content += "\n" + card_css.strip() + "\n"
    with open(css_file, "w", encoding="utf-8") as f:
        f.write(css_content)
    print("Updated css/style.css with .card-banner and .card-surface")

# 2. Update js/Core/Components/app_title.js to lookup DEFAULT_UI_TITLES
title_file = "js/Core/Components/app_title.js"
with open(title_file, "r", encoding="utf-8") as f:
    title_content = f.read()

old_lookup = """    const uiConfig = (typeof getStored === 'function') ? getStored('ui_config', {}) : {};
    titleContent = uiConfig[configKey] || uiConfig[configKey.toUpperCase()] || defaultText || text;"""

new_lookup = """    const uiConfig = (typeof getStored === 'function') ? getStored('ui_config', {}) : {};
    const defaultTitles = (typeof DEFAULT_UI_TITLES !== 'undefined') ? DEFAULT_UI_TITLES : {};
    titleContent = uiConfig[configKey] || uiConfig[configKey.toUpperCase()] || defaultTitles[configKey] || defaultText || text;"""

if old_lookup in title_content:
    title_content = title_content.replace(old_lookup, new_lookup)
    with open(title_file, "w", encoding="utf-8") as f:
        f.write(title_content)
    print("Updated app_title.js to lookup DEFAULT_UI_TITLES")

# 3. Update js/config.js to add DEFAULT_UI_TITLES and bump version to v0.0.1.0
config_file = "js/config.js"
with open(config_file, "r", encoding="utf-8") as f:
    config_content = f.read()

titles_dict = """// =============================================================
// CENTRALIZED UI TITLES REGISTRY (TỪ ĐIỂN TIÊU ĐỀ TỪNG CỤM TOÀN HỆ THỐNG)
// =============================================================
const DEFAULT_UI_TITLES = {
  // 1. HOME SCREEN (MÀN CHÍNH)
  title_home_slogan: 'hôm nay sẵn sàng tỏa sáng chưa? ✨',
  title_home_free_quote: 'Mỗi tour gội là một trải nghiệm thư giãn tuyệt vời gửi gắm đến khách hàng thân yêu.',
  title_staff_announcement: 'BẢNG TIN NỘI BỘ TỪ CHỦ TIỆM',
  title_staff_today_stats: 'THÀNH TÍCH CỦA RIÊNG BẠN HÔM NAY',
  title_admin_live_tours: 'CÁC TOUR ĐANG PHỤC VỤ TRỰC TIẾP',
  title_admin_today_snapshot: 'CHỈ SỐ NHANH HÔM NAY',
  title_admin_announcement: 'THÔNG BÁO ĐANG PHÁT CHO KTV',
  title_admin_quick_actions: 'LỐI TẮT THAO TÁC NHANH',

  // 2. HISTORY SCREEN (LỊCH SỬ)
  title_admin_history: 'LỊCH SỬ TOÀN TIỆM',
  subtitle_admin_history: 'Tất cả tour toàn tiệm',
  title_staff_history: 'LỊCH SỬ TOUR CỦA TÔI',
  subtitle_staff_history: 'Hành trình các ca phục vụ của riêng bạn',

  // 3. WALLET / EXPENSES SCREEN (THU NHẬP & CHI PHÍ)
  title_admin_wallet: 'QUẢN LÝ CHI PHÍ TIỆM',
  subtitle_admin_wallet: 'Kiểm soát chi phí cố định & biến phí vận hành',
  title_admin_expenses_list: 'DANH SÁCH CHI PHÍ VẬN HÀNH',
  subtitle_admin_expenses_list: 'Điện sấy, nước sạch, internet, mặt bằng, mỹ phẩm',
  title_staff_wallet: 'THU NHẬP CỦA TÔI',
  subtitle_staff_wallet: 'Chi tiết lương ngày công & hoa hồng tour',
  title_staff_payroll_card: 'TỔNG THU NHẬP THÁNG TẠM TÍNH',

  // 4. ADD SCREEN (TẠO CA / VÀO TOUR)
  title_pos_select_staff: 'CHỌN KỸ THUẬT VIÊN TIẾP NHẬN',
  title_pos_customer_info: 'THÔNG TIN KHÁCH HÀNG',
  title_pos_service_menu: 'MENU DỊCH VỤ & COMBO',

  // 5. MODALS (TIÊU ĐỀ POPUP)
  title_modal_checkout: 'XÁC NHẬN THANH TOÁN',
  title_modal_swap_staff: 'CHUYỂN KTV TIẾP NHẬN',
  title_modal_handover: 'BÀN GIAO TOUR GỘI',
  title_modal_add_expense: 'NHẬP CHI PHÍ VẬN HÀNH',
  title_modal_announcement: 'CẬP NHẬT BẢNG TIN NỘI BỘ',
  title_modal_month_picker: 'CHỌN THÁNG THỐNG KÊ',
  title_modal_staff_note: 'GHI CHÚ KHÁCH HÀNG',
  title_modal_owner_customer: 'HỒ SƠ KHÁCH HÀNG',
  title_modal_gift_voucher: 'TẶNG VOUCHER TRI ÂN',
  title_modal_edit_live_services: 'ĐIỀU CHỈNH DỊCH VỤ TOUR'
};
"""

# Insert DEFAULT_UI_TITLES right above DEFAULT_UI_CONFIG if not present
if "const DEFAULT_UI_TITLES =" not in config_content:
    config_content = config_content.replace(
        "// DYNAMIC UI CONFIGURATION (ĐỒNG BỘ ĐỘNG TỪ GOOGLE SHEETS TB_CONFIG)",
        titles_dict + "\n// DYNAMIC UI CONFIGURATION (ĐỒNG BỘ ĐỘNG TỪ GOOGLE SHEETS TB_CONFIG)"
    )

# Bump version in config.js
config_content = config_content.replace("const APP_VERSION = 'v0.0.0.9';", "const APP_VERSION = 'v0.0.1.0';")
with open(config_file, "w", encoding="utf-8") as f:
    f.write(config_content)
print("Updated js/config.js with DEFAULT_UI_TITLES and APP_VERSION = v0.0.1.0")

# 4. Update index.html to add app_card.js and bump version to v0.0.1.0
index_file = "index.html"
with open(index_file, "r", encoding="utf-8") as f:
    index_content = f.read()

# Add app_card.js script before app_button.js if not present
if "app_card.js" not in index_content:
    index_content = index_content.replace(
        '<script src="js/Core/Components/app_button.js?v=v0.0.0.9"></script>',
        '<script src="js/Core/Components/app_card.js?v=v0.0.1.0"></script>\n  <script src="js/Core/Components/app_button.js?v=v0.0.1.0"></script>'
    )

# Replace all v0.0.0.9 with v0.0.1.0 in index.html
index_content = index_content.replace("v0.0.0.9", "v0.0.1.0")
with open(index_file, "w", encoding="utf-8") as f:
    f.write(index_content)
print("Updated index.html with app_card.js and v0.0.1.0")

# 5. Update views/login.html with v0.0.1.0
login_file = "views/login.html"
with open(login_file, "r", encoding="utf-8") as f:
    login_content = f.read()
login_content = login_content.replace("v0.0.0.9", "v0.0.1.0")
with open(login_file, "w", encoding="utf-8") as f:
    f.write(login_content)
print("Updated views/login.html with v0.0.1.0")

# 6. Update docs/Core/ui_system.md with AppCard documentation and v0.0.1.0
doc_file = "docs/Core/ui_system.md"
with open(doc_file, "r", encoding="utf-8") as f:
    doc_content = f.read()
doc_content = doc_content.replace("v0.0.0.9", "v0.0.1.0")

app_card_doc = """
### 8. `AppCard` (`js/Core/Components/app_card.js`)
- **Mục đích**: Chuẩn hóa nền thẻ Luxury Banner (Hero Greeting chào đón KTV & Chủ) và Surface White tiêu chuẩn toàn hệ thống.
- **Tham số**:
  ```javascript
  AppCard({
    variant: 'banner', // 'banner' (peach-cream gradient) | 'surface' (white) | 'peach' | 'mint'
    content: '',        // Nội dung HTML bên trong
    padding: 'p-6 sm:p-7',
    customClass: '',
    id: ''
  })
  ```
- **CSS Utility tương ứng trong `css/style.css`**: `.card-banner`, `.card-surface`.

### 9. Từ Điển Tiêu Đề Tập Trung `DEFAULT_UI_TITLES` (`js/config.js`)
- **Mục đích**: Lưu trữ và quản lý tập trung toàn bộ tiêu đề (Title & Subtitle) của từng cụm/khối trên toàn bộ 4 màn hình chính và các Modal.
- Cho phép tra cứu trực tiếp hoặc ghi đè tự động qua Google Sheets `tb_config`.
"""

if "### 8. `AppCard`" not in doc_content:
    doc_content += "\n" + app_card_doc.strip() + "\n"

with open(doc_file, "w", encoding="utf-8") as f:
    f.write(doc_content)
print("Updated docs/Core/ui_system.md with AppCard, DEFAULT_UI_TITLES and v0.0.1.0")
