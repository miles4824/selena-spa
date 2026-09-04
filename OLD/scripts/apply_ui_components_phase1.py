# -*- coding: utf-8 -*-
import os
import re

BASE_DIR = r"c:\Users\Miles\Downloads\Selena"
NEW_VERSION = "v0.1.5.0"

# =========================================================================
# 1. UPDATE index.html: Include the new UI Components & bump version
# =========================================================================
idx_path = os.path.join(BASE_DIR, "index.html")
with open(idx_path, "r", encoding="utf-8") as f:
    idx_html = f.read()

# Replace version query strings
idx_html = re.sub(r"\?v=v0\.1\.4\.9", f"?v={NEW_VERSION}", idx_html)

# Add component scripts if not present
comp_scripts = f"""  <!-- A2. Core UI Components (Modular Component-Driven - Tailwind 4) -->
  <script src="js/Core/Components/app_button.js?v={NEW_VERSION}"></script>
  <script src="js/Core/Components/stat_card.js?v={NEW_VERSION}"></script>
  <script src="js/Core/Components/status_badge.js?v={NEW_VERSION}"></script>
  <script src="js/config.js?v={NEW_VERSION}"></script>"""

if "js/Core/Components/app_button.js" not in idx_html:
    idx_html = idx_html.replace(f'<script src="js/config.js?v={NEW_VERSION}"></script>', comp_scripts)

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
# 3. UPDATE views/login.html: Bump version text
# =========================================================================
login_path = os.path.join(BASE_DIR, "views", "login.html")
with open(login_path, "r", encoding="utf-8") as f:
    login_html = f.read()
login_html = re.sub(r"v\d+\.\d+\.\d+\.\d+(\.\d+)? • Selena Spa[^<]*", f"{NEW_VERSION} • Selena Spa", login_html)
with open(login_path, "w", encoding="utf-8") as f:
    f.write(login_html)

# =========================================================================
# 4. REFACTOR views/staff/home.html: Clean layout skeleton
# =========================================================================
staff_home_path = os.path.join(BASE_DIR, "views", "staff", "home.html")
new_staff_home_html = """<!-- views/staff/home.html (LAYOUT SKELETON - SẠCH SẼ THEO HƯỚNG B) -->
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

  <!-- CỤM 3: THÀNH TÍCH CỦA RIÊNG BẠN TRONG NGÀY HÔM NAY -->
  <div class="space-y-2.5">
    <div class="flex items-center justify-between px-1">
      <span class="text-xs font-extrabold text-[#7E7272] uppercase tracking-wider flex items-center gap-1.5">
        <i data-lucide="award" class="w-4 h-4 text-[#E58A7B]"></i> Thành Tích Của Bạn Hôm Nay
      </span>
      <span class="text-[11px] text-[#A39696] font-medium" id="staff-home-today-date">Hôm nay</span>
    </div>

    <!-- Hộp chứa 2 thẻ thành tích do StatCard component bơm vào -->
    <div id="staff-home-stats-container" class="grid grid-cols-2 gap-3 sm:gap-4"></div>
  </div>
</main>
"""
with open(staff_home_path, "w", encoding="utf-8") as f:
    f.write(new_staff_home_html)

# =========================================================================
# 5. REFACTOR views/owner/home.html: Clean layout skeleton
# =========================================================================
owner_home_path = os.path.join(BASE_DIR, "views", "owner", "home.html")
with open(owner_home_path, "r", encoding="utf-8") as f:
    owner_html = f.read()

# Replace the hardcoded 4 cards in Cụm 3 with dynamic container
old_admin_cards_pattern = r'<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">[\s\S]*?<!-- 4\. Lợi nhuận tạm tính hôm nay -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>'
new_admin_cards_block = '<div id="admin-today-snapshot-container" class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"></div>\n  </div>'

owner_html = re.sub(old_admin_cards_pattern, new_admin_cards_block, owner_html)
with open(owner_home_path, "w", encoding="utf-8") as f:
    f.write(owner_html)

# =========================================================================
# 6. REFACTOR js/Home/home_dashboard.js: Render components
# =========================================================================
dash_path = os.path.join(BASE_DIR, "js", "Home", "home_dashboard.js")
with open(dash_path, "r", encoding="utf-8") as f:
    dash_code = f.read()

# 6.1 Update loadKTVHomeStats to render StatCard into #staff-home-stats-container
old_ktv_stats_render = """  const toursEl = document.getElementById('home-today-tours');
  const commEl = document.getElementById('home-today-comm');
  const eyeEl = document.getElementById('staff-home-comm-eye');
  const totalToday = todayComm + todayTips;

  if (toursEl) toursEl.innerText = todayTours + ' tour';
  if (commEl) {
    if (isStaffHomeCommMasked) {
      commEl.innerText = '•••• đ';
      if (eyeEl) eyeEl.setAttribute('data-lucide', 'eye-off');
    } else {
      commEl.innerText = `${totalToday.toLocaleString('vi-VN')} đ`;
      if (eyeEl) eyeEl.setAttribute('data-lucide', 'eye');
    }
  }"""

new_ktv_stats_render = """  const totalToday = todayComm + todayTips;
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
  } else {
    const toursEl = document.getElementById('home-today-tours');
    const commEl = document.getElementById('home-today-comm');
    const eyeEl = document.getElementById('staff-home-comm-eye');
    if (toursEl) toursEl.innerText = todayTours + ' tour';
    if (commEl) {
      commEl.innerText = isStaffHomeCommMasked ? '•••• đ' : `${totalToday.toLocaleString('vi-VN')} đ`;
      if (eyeEl) eyeEl.setAttribute('data-lucide', isStaffHomeCommMasked ? 'eye-off' : 'eye');
    }
  }"""

dash_code = dash_code.replace(old_ktv_stats_render, new_ktv_stats_render)

# 6.2 Update renderHomeStatusAndActionButton to use AppButton and StatusBadge
# Staff Busy Badge & Btn
old_staff_busy = """    if (badgeContainer) {
      badgeContainer.className = 'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FFF0EB] text-[#E58A7B] border border-[#FCDFD7] shadow-2xs';
      badgeContainer.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-[#E58A7B] animate-pulse"></span>
        <span>Đang trong tour (${tourInfo.elapsedMin}/${tourInfo.targetMin}p)</span>
      `;
    }

    if (btnContainer) {
      btnContainer.innerHTML = `
        <button onclick="handleHomeGoToActiveTour()" class="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-[#2E7D6D] to-[#3B9E8B] hover:opacity-95 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#2E7D6D]/25 transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-95">
          <i data-lucide="timer" class="w-5 h-5"></i>
          <span>VÀO XEM NGAY</span>
        </button>
      `;
    }"""

new_staff_busy = """    if (badgeContainer) {
      if (typeof StatusBadge === 'function') {
        badgeContainer.outerHTML = StatusBadge({ id: 'staff-home-status-badge', status: 'busy', elapsedMin: tourInfo.elapsedMin, targetMin: tourInfo.targetMin });
      } else {
        badgeContainer.className = 'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#FFF0EB] text-[#E58A7B] border border-[#FCDFD7] shadow-2xs';
        badgeContainer.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#E58A7B] animate-pulse"></span><span>Đang trong tour (${tourInfo.elapsedMin}/${tourInfo.targetMin}p)</span>`;
      }
    }

    if (btnContainer) {
      if (typeof AppButton === 'function') {
        btnContainer.innerHTML = AppButton({
          text: 'VÀO XEM NGAY',
          icon: 'timer',
          variant: 'teal',
          onClick: 'handleHomeGoToActiveTour()'
        });
      } else {
        btnContainer.innerHTML = `
          <button onclick="handleHomeGoToActiveTour()" class="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-[#2E7D6D] to-[#3B9E8B] hover:opacity-95 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#2E7D6D]/25 transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-95">
            <i data-lucide="timer" class="w-5 h-5"></i>
            <span>VÀO XEM NGAY</span>
          </button>
        `;
      }
    }"""

dash_code = dash_code.replace(old_staff_busy, new_staff_busy)

# Staff Free Badge & Btn
old_staff_free = """    if (badgeContainer) {
      badgeContainer.className = 'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#E8F8F5] text-[#2E7D6D] border border-[#B7EBDD] shadow-2xs';
      badgeContainer.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-[#2E7D6D]"></span>
        <span>Sẵn sàng phục vụ</span>
      `;
    }

    if (btnContainer) {
      btnContainer.innerHTML = `
        <button onclick="showView('add')" class="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E58A7B] to-[#F09A8D] hover:opacity-95 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#E58A7B]/25 transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-95">
          <i data-lucide="plus-circle" class="w-5 h-5"></i>
          <span>VÀO TOUR NGAY</span>
        </button>
      `;
    }"""

new_staff_free = """    if (badgeContainer) {
      if (typeof StatusBadge === 'function') {
        badgeContainer.outerHTML = StatusBadge({ id: 'staff-home-status-badge', status: 'free' });
      } else {
        badgeContainer.className = 'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#E8F8F5] text-[#2E7D6D] border border-[#B7EBDD] shadow-2xs';
        badgeContainer.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#2E7D6D]"></span><span>Sẵn sàng phục vụ</span>`;
      }
    }

    if (btnContainer) {
      if (typeof AppButton === 'function') {
        btnContainer.innerHTML = AppButton({
          text: 'VÀO TOUR NGAY',
          icon: 'plus-circle',
          variant: 'primary',
          onClick: "showView('add')"
        });
      } else {
        btnContainer.innerHTML = `
          <button onclick="showView('add')" class="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E58A7B] to-[#F09A8D] hover:opacity-95 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#E58A7B]/25 transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-95">
            <i data-lucide="plus-circle" class="w-5 h-5"></i>
            <span>VÀO TOUR NGAY</span>
          </button>
        `;
      }
    }"""

dash_code = dash_code.replace(old_staff_free, new_staff_free)

# Admin Busy Badge & Btn
old_admin_busy = """      if (btnContainer) {
        btnContainer.innerHTML = `
          <button onclick="handleHomeGoToActiveTour()" class="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-[#2E7D6D] to-[#3B9E8B] hover:opacity-95 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#2E7D6D]/25 transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-95">
            <i data-lucide="timer" class="w-5 h-5"></i>
            <span>VÀO XEM NGAY</span>
          </button>
        `;
      }
      if (badgeContainer) {
        badgeContainer.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF0EB] text-[#E58A7B] border border-[#FCDFD7] shadow-2xs';
        badgeContainer.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-[#E58A7B] animate-pulse"></span>
          <span>Đang trong tour (${tourInfo.elapsedMin}/${tourInfo.targetMin}p)</span>
        `;
      }"""

new_admin_busy = """      if (btnContainer) {
        if (typeof AppButton === 'function') {
          btnContainer.innerHTML = AppButton({
            text: 'VÀO XEM NGAY',
            icon: 'timer',
            variant: 'teal',
            onClick: 'handleHomeGoToActiveTour()'
          });
        } else {
          btnContainer.innerHTML = `<button onclick="handleHomeGoToActiveTour()" class="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-[#2E7D6D] to-[#3B9E8B] hover:opacity-95 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#2E7D6D]/25 transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"><i data-lucide="timer" class="w-5 h-5"></i><span>VÀO XEM NGAY</span></button>`;
        }
      }
      if (badgeContainer) {
        if (typeof StatusBadge === 'function') {
          badgeContainer.outerHTML = StatusBadge({ id: 'admin-home-status-badge', status: 'busy', elapsedMin: tourInfo.elapsedMin, targetMin: tourInfo.targetMin });
        } else {
          badgeContainer.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF0EB] text-[#E58A7B] border border-[#FCDFD7] shadow-2xs';
          badgeContainer.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#E58A7B] animate-pulse"></span><span>Đang trong tour (${tourInfo.elapsedMin}/${tourInfo.targetMin}p)</span>`;
        }
      }"""

dash_code = dash_code.replace(old_admin_busy, new_admin_busy)

# Admin Free Badge & Btn
old_admin_free = """      if (btnContainer) {
        btnContainer.innerHTML = `
          <button onclick="showView('add')" class="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E58A7B] to-[#F09A8D] hover:opacity-95 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#E58A7B]/25 transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-95">
            <i data-lucide="plus-circle" class="w-5 h-5"></i>
            <span>VÀO TOUR NGAY</span>
          </button>
        `;
      }
      if (badgeContainer) {
        badgeContainer.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F8F5] text-[#2E7D6D] border border-[#B7EBDD] shadow-2xs';
        badgeContainer.innerHTML = `
          <span class="w-2 h-2 rounded-full bg-[#2E7D6D]"></span>
          <span>Sẵn sàng phục vụ</span>
        `;
      }"""

new_admin_free = """      if (btnContainer) {
        if (typeof AppButton === 'function') {
          btnContainer.innerHTML = AppButton({
            text: 'VÀO TOUR NGAY',
            icon: 'plus-circle',
            variant: 'primary',
            onClick: "showView('add')"
          });
        } else {
          btnContainer.innerHTML = `<button onclick="showView('add')" class="w-full sm:w-auto px-7 py-3.5 rounded-full bg-gradient-to-r from-[#E58A7B] to-[#F09A8D] hover:opacity-95 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#E58A7B]/25 transition flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"><i data-lucide="plus-circle" class="w-5 h-5"></i><span>VÀO TOUR NGAY</span></button>`;
        }
      }
      if (badgeContainer) {
        if (typeof StatusBadge === 'function') {
          badgeContainer.outerHTML = StatusBadge({ id: 'admin-home-status-badge', status: 'free' });
        } else {
          badgeContainer.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F8F5] text-[#2E7D6D] border border-[#B7EBDD] shadow-2xs';
          badgeContainer.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#2E7D6D]"></span><span>Sẵn sàng phục vụ</span>`;
        }
      }"""

dash_code = dash_code.replace(old_admin_free, new_admin_free)

# 6.3 Update renderAdminTodaySnapshot to render StatCard into #admin-today-snapshot-container
old_admin_snapshot_render = """  // Hiển thị ra giao diện
  const revEl = document.getElementById('admin-today-revenue');
  const countEl = document.getElementById('admin-today-tour-count');
  const guestEl = document.getElementById('admin-today-guest-count');
  const salEl = document.getElementById('admin-today-salaries');
  const profEl = document.getElementById('admin-today-profit');

  if (revEl) revEl.innerText = `${todayRevenue.toLocaleString('vi-VN')} đ`;
  if (countEl) countEl.innerText = `${todayReceipts.length} ca hoàn thành`;
  if (guestEl) guestEl.innerText = `${todayGuestCount} lượt`;
  if (salEl) salEl.innerText = `${todaySalaries.toLocaleString('vi-VN')} đ`;
  if (profEl) profEl.innerText = `${todayEstProfit.toLocaleString('vi-VN')} đ`;"""

new_admin_snapshot_render = """  // Hiển thị ra giao diện bằng StatCard component chuẩn
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
  } else {
    const revEl = document.getElementById('admin-today-revenue');
    const countEl = document.getElementById('admin-today-tour-count');
    const guestEl = document.getElementById('admin-today-guest-count');
    const salEl = document.getElementById('admin-today-salaries');
    const profEl = document.getElementById('admin-today-profit');

    if (revEl) revEl.innerText = `${todayRevenue.toLocaleString('vi-VN')} đ`;
    if (countEl) countEl.innerText = `${todayReceipts.length} ca hoàn thành`;
    if (guestEl) guestEl.innerText = `${todayGuestCount} lượt`;
    if (salEl) salEl.innerText = `${todaySalaries.toLocaleString('vi-VN')} đ`;
    if (profEl) profEl.innerText = `${todayEstProfit.toLocaleString('vi-VN')} đ`;
  }"""

dash_code = dash_code.replace(old_admin_snapshot_render, new_admin_snapshot_render)

with open(dash_path, "w", encoding="utf-8") as f:
    f.write(dash_code)

# =========================================================================
# 7. UPDATE docs/Home/home_dashboard.md (Rule 12 Docs-First Audit Log)
# =========================================================================
doc_path = os.path.join(BASE_DIR, "docs", "Home", "home_dashboard.md")
with open(doc_path, "r", encoding="utf-8") as f:
    doc_content = f.read()

new_audit = f"""## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-03` (`{NEW_VERSION}`):
  + Triển khai Giai đoạn 1 Hệ Thống UI Component System (Tailwind 4 Modular) theo Điều 15 `PROJECT_RULES.md`:
    - Tích hợp 3 component cốt lõi `AppButton`, `StatCard`, `StatusBadge` vào `js/Core/Components/`.
    - Tinh gọn `views/staff/home.html` và `views/owner/home.html` thành khung layout rỗng sạch sẽ.
    - Chuyển đổi toàn bộ nút bấm hành động và thẻ chỉ số thành tích trên cả Staff và Admin sang Component.
- `2026-09-03` (`v0.1.4.9`):"""

doc_content = doc_content.replace(
    "## 3. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)\n- `2026-09-03` (`v0.1.4.9`):",
    new_audit
)
with open(doc_path, "w", encoding="utf-8") as f:
    f.write(doc_content)

print(f"REFACTOR COMPLETED TO {NEW_VERSION} SUCCESSFULLY!")
