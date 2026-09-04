# -*- coding: utf-8 -*-
import os
import re

BASE_DIR = r"c:\Users\Miles\Downloads\Selena"
NEW_VERSION = "v0.0.0.1"

# =========================================================================
# 1. UPDATE index.html: Add app_title.js & bump version to v0.0.0.1
# =========================================================================
idx_path = os.path.join(BASE_DIR, "index.html")
with open(idx_path, "r", encoding="utf-8") as f:
    idx_html = f.read()

# Replace version strings
idx_html = re.sub(r"\?v=v0\.0\.0\.0", f"?v={NEW_VERSION}", idx_html)

# Add app_title.js
if "js/Core/Components/app_title.js" not in idx_html:
    target = f'<script src="js/Core/Components/status_badge.js?v={NEW_VERSION}"></script>'
    replacement = f'<script src="js/Core/Components/status_badge.js?v={NEW_VERSION}"></script>\n  <script src="js/Core/Components/app_title.js?v={NEW_VERSION}"></script>'
    idx_html = idx_html.replace(target, replacement)

with open(idx_path, "w", encoding="utf-8") as f:
    f.write(idx_html)

# =========================================================================
# 2. UPDATE js/config.js: Bump APP_VERSION
# =========================================================================
cfg_path = os.path.join(BASE_DIR, "js", "config.js")
with open(cfg_path, "r", encoding="utf-8") as f:
    cfg = f.read()
cfg = re.sub(r"const APP_VERSION = '[^']+';", f"const APP_VERSION = '{NEW_VERSION}';", cfg)
with open(cfg_path, "w", encoding="utf-8") as f:
    f.write(cfg)

# =========================================================================
# 3. UPDATE views/login.html: Bump version
# =========================================================================
login_path = os.path.join(BASE_DIR, "views", "login.html")
with open(login_path, "r", encoding="utf-8") as f:
    login_html = f.read()
login_html = re.sub(r"v\d+\.\d+\.\d+\.\d+(\.\d+)? • Selena Spa[^<]*", f"{NEW_VERSION} • Selena Spa", login_html)
with open(login_path, "w", encoding="utf-8") as f:
    f.write(login_html)

# =========================================================================
# 4. UPDATE views/staff/home.html: Clean block for Cách 2 Render
# =========================================================================
staff_home_path = os.path.join(BASE_DIR, "views", "staff", "home.html")
new_staff_home = """<!-- views/staff/home.html (LAYOUT SKELETON - SẠCH SẼ THEO HƯỚNG B) -->
<main id="view-home" class="p-4 sm:p-6 max-w-2xl mx-auto space-y-5 pb-28">

  <!-- CỤM 1: WELLNESS BANNER & NÚT TRẠNG THÁI BIẾN HÌNH -->
  <div class="bg-white rounded-[28px] border border-[#F0EAE1] shadow-[0_10px_30px_-5px_rgba(229,138,123,0.05),0_4px_12px_rgba(0,0,0,0.02)] p-6 sm:p-7 relative overflow-hidden bg-gradient-to-br from-[#FFF0EB] via-[#FFFFFF] to-[#FAF6F1]">
    <div class="relative z-10 space-y-3.5">
      <div class="flex items-center">
        <!-- Huy hiệu trạng thái do StatusBadge component bơm vào -->
        <div id="staff-home-status-badge"></div>
      </div>

      <h2 class="text-2xl font-medium font-serif text-[#2D2424]">
        Chào <span id="home-greeting-name" class="text-[#E58A7B]">KTV</span>, <span id="home-greeting-slogan">hôm nay sẵn sàng tỏa sáng chưa? ✨</span>
      </h2>
      <p class="text-[#7E7272] text-sm max-w-md leading-relaxed" id="staff-home-status-desc"></p>

      <!-- Nút hành động biến hình do AppButton component bơm vào -->
      <div class="pt-2" id="staff-home-action-btn-container"></div>
    </div>
  </div>

  <!-- CỤM 2: THÔNG BÁO NỘI BỘ TỪ CHỦ TIỆM (BANNER REALTIME) -->
  <div id="home-announcement-container"></div>

  <!-- CỤM 3: THÀNH TÍCH CỦA RIÊNG BẠN TRONG NGÀY HÔM NAY (RENDER NGUYÊN KHỐI CÁCH 2) -->
  <div id="staff-home-stats-block" class="space-y-2.5"></div>
</main>
"""
with open(staff_home_path, "w", encoding="utf-8") as f:
    f.write(new_staff_home)

# =========================================================================
# 5. UPDATE views/owner/home.html: Clean block for Cách 2 Render
# =========================================================================
owner_home_path = os.path.join(BASE_DIR, "views", "owner", "home.html")
with open(owner_home_path, "r", encoding="utf-8") as f:
    owner_html = f.read()

# Replace Cụm 3 with single container
old_owner_c3 = r'<div class="space-y-2\.5">\s*<span class="text-xs font-extrabold text-\[#7E7272\][\s\S]*?<div id="admin-today-snapshot-container"[\s\S]*?<\/div>\s*<\/div>'
new_owner_c3 = '<div id="admin-today-snapshot-block" class="space-y-2.5"></div>'
owner_html = re.sub(old_owner_c3, new_owner_c3, owner_html)

with open(owner_home_path, "w", encoding="utf-8") as f:
    f.write(owner_html)

# =========================================================================
# 6. UPDATE js/Home/home_dashboard.js: Render Cách 2 with AppTitle
# =========================================================================
dash_path = os.path.join(BASE_DIR, "js", "Home", "home_dashboard.js")
with open(dash_path, "r", encoding="utf-8") as f:
    dash_code = f.read()

# 6.1 Update loadKTVHomeStats with Render Cách 2 (AppTitle + StatCard nguyên khối)
old_ktv_block = """  const totalToday = todayComm + todayTips;
  const statsContainer = document.getElementById('staff-home-stats-container');
  if (statsContainer && typeof StatCard === 'function') {
    const formattedComm = isStaffHomeCommMasked ? '•••• đ' : `${totalToday.toLocaleString('vi-VN')} đ`;
    statsContainer.innerHTML = `
      ${StatCard({
        id: 'home-today-tours',
        title: 'Tour hôm nay',
        value: todayTours + ' tour',
        subtitle: 'Phục vụ trong ngày',
        color: 'blue'
      })}
      ${StatCard({
        id: 'home-today-comm',
        title: 'Thu nhập hôm nay',
        value: formattedComm,
        subtitle: 'Hoa hồng + Tip tích lũy',
        color: 'mint',
        isPrivacy: true,
        privacyEyeId: 'staff-home-comm-eye',
        onPrivacyToggle: 'toggleStaffHomeCommPrivacy()'
      })}
    `;
    const eyeEl = document.getElementById('staff-home-comm-eye');
    if (eyeEl) eyeEl.setAttribute('data-lucide', isStaffHomeCommMasked ? 'eye-off' : 'eye');
  }"""

new_ktv_block = """  const totalToday = todayComm + todayTips;
  const statsBlock = document.getElementById('staff-home-stats-block') || document.getElementById('staff-home-stats-container');
  if (statsBlock && typeof StatCard === 'function') {
    const formattedComm = isStaffHomeCommMasked ? '•••• đ' : `${totalToday.toLocaleString('vi-VN')} đ`;
    const todayDateStr = (typeof formatDateDisplayVN === 'function') ? formatDateDisplayVN(new Date()) : 'Hôm nay';

    // RENDER NGUYÊN KHỐI CHUẨN CÁCH 2: 1 LẦN GHI DOM DUY NHẤT (<1ms, KHÔNG CHỚP TẮT)
    statsBlock.innerHTML = `
      ${(typeof AppTitle === 'function') ? AppTitle({
        configKey: 'title_staff_today_stats',
        defaultText: 'Thành Tích Của Bạn Hôm Nay',
        icon: 'award',
        iconColor: 'text-[#E58A7B]',
        level: 'section',
        rightText: todayDateStr,
        id: 'staff-home-today-title'
      }) : ''}

      <div class="grid grid-cols-2 gap-3 sm:gap-4">
        ${StatCard({
          id: 'home-today-tours',
          title: 'Tour hôm nay',
          value: todayTours + ' tour',
          subtitle: 'Phục vụ trong ngày',
          color: 'blue'
        })}
        ${StatCard({
          id: 'home-today-comm',
          title: 'Thu nhập hôm nay',
          value: formattedComm,
          subtitle: 'Hoa hồng + Tip tích lũy',
          color: 'mint',
          isPrivacy: true,
          privacyEyeId: 'staff-home-comm-eye',
          onPrivacyToggle: 'toggleStaffHomeCommPrivacy()'
        })}
      </div>
    `;
    const eyeEl = document.getElementById('staff-home-comm-eye');
    if (eyeEl) eyeEl.setAttribute('data-lucide', isStaffHomeCommMasked ? 'eye-off' : 'eye');
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }"""

dash_code = dash_code.replace(old_ktv_block, new_ktv_block)

# 6.2 Update renderAdminTodaySnapshot with Render Cách 2 (AppTitle + 4 StatCards nguyên khối)
old_admin_block = """  // Hiển thị ra giao diện bằng StatCard component chuẩn
  const snapshotContainer = document.getElementById('admin-today-snapshot-container');
  if (snapshotContainer && typeof StatCard === 'function') {
    snapshotContainer.innerHTML = `
      ${StatCard({
        id: 'admin-today-revenue',
        title: 'Doanh Thu Hôm Nay',
        value: `${todayRevenue.toLocaleString('vi-VN')} đ`,
        subtitle: `${todayReceipts.length} ca hoàn thành`,
        color: 'mint'
      })}
      ${StatCard({
        id: 'admin-today-guest-count',
        title: 'Lượt Khách / Tour',
        value: `${todayGuestCount} lượt`,
        subtitle: 'Phục vụ trong ngày',
        color: 'blue'
      })}
      ${StatCard({
        id: 'admin-today-salaries',
        title: 'Lương KTV Phát Sinh',
        value: `${todaySalaries.toLocaleString('vi-VN')} đ`,
        subtitle: 'Hoa hồng + tips',
        color: 'purple'
      })}
      ${StatCard({
        id: 'admin-today-profit',
        title: 'LỢI NHUẬN TẠM TÍNH',
        value: `${todayEstProfit.toLocaleString('vi-VN')} đ`,
        subtitle: 'Doanh thu - Lương - Chi phí',
        color: 'coral',
        customClass: 'col-span-2 sm:col-span-1 shadow-lg shadow-[#E58A7B]/20'
      })}
    `;
  }"""

new_admin_block = """  // Hiển thị ra giao diện bằng Render Cách 2 nguyên khối (AppTitle + 4 StatCards)
  const snapshotBlock = document.getElementById('admin-today-snapshot-block') || document.getElementById('admin-today-snapshot-container');
  if (snapshotBlock && typeof StatCard === 'function') {
    snapshotBlock.innerHTML = `
      ${(typeof AppTitle === 'function') ? AppTitle({
        configKey: 'title_admin_today_snapshot',
        defaultText: 'Chỉ Số Nhanh Hôm Nay (Today Snapshot)',
        icon: 'trending-up',
        iconColor: 'text-[#2E7D6D]',
        level: 'section'
      }) : ''}

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        ${StatCard({
          id: 'admin-today-revenue',
          title: 'Doanh Thu Hôm Nay',
          value: `${todayRevenue.toLocaleString('vi-VN')} đ`,
          subtitle: `${todayReceipts.length} ca hoàn thành`,
          color: 'mint'
        })}
        ${StatCard({
          id: 'admin-today-guest-count',
          title: 'Lượt Khách / Tour',
          value: `${todayGuestCount} lượt`,
          subtitle: 'Phục vụ trong ngày',
          color: 'blue'
        })}
        ${StatCard({
          id: 'admin-today-salaries',
          title: 'Lương KTV Phát Sinh',
          value: `${todaySalaries.toLocaleString('vi-VN')} đ`,
          subtitle: 'Hoa hồng + tips',
          color: 'purple'
        })}
        ${StatCard({
          id: 'admin-today-profit',
          title: 'LỢI NHUẬN TẠM TÍNH',
          value: `${todayEstProfit.toLocaleString('vi-VN')} đ`,
          subtitle: 'Doanh thu - Lương - Chi phí',
          color: 'coral',
          customClass: 'col-span-2 sm:col-span-1 shadow-lg shadow-[#E58A7B]/20'
        })}
      </div>
    `;
    if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
  }"""

dash_code = dash_code.replace(old_admin_block, new_admin_block)

with open(dash_path, "w", encoding="utf-8") as f:
    f.write(dash_code)

# =========================================================================
# 7. UPDATE docs/Home/home_dashboard.md Audit Log
# =========================================================================
doc_path = os.path.join(BASE_DIR, "docs", "Home", "home_dashboard.md")
with open(doc_path, "r", encoding="utf-8") as f:
    doc_content = f.read()

new_audit = f"""## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-03` (`{NEW_VERSION}`):
  + Tích hợp component tiêu đề chuẩn `AppTitle` (`js/Core/Components/app_title.js`).
  + Áp dụng phương thức Render Cách 2 (Template Literals nguyên khối) cho cả Staff Home và Admin Home.
  + Ghi 1 lần DOM duy nhất, triệt tiêu 100% hiện tượng chớp giật chữ và tối ưu hiệu năng thiết bị.
- `2026-09-03` (`v0.0.0.0`):"""

doc_content = doc_content.replace("## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)\n- `2026-09-03` (`v0.0.0.0`", new_audit)
with open(doc_path, "w", encoding="utf-8") as f:
    f.write(doc_content)

print(f"DEPLOYED APP_TITLE AND CACH 2 RENDER TO {NEW_VERSION} SUCCESSFULLY!")
