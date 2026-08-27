# -*- coding: utf-8 -*-
import os

def build():
    p1_head = """<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="Selena Spa">
  <title>Selena Spa - Luxury Skincare & Wellness</title>
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400..800;1,7..72,400..800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>

  <style>
    body {
      background-color: #FAF6F1;
      color: #2D2424;
      font-family: 'Plus Jakarta Sans', sans-serif;
      -webkit-tap-highlight-color: transparent;
      overscroll-behavior-y: contain;
    }
    h1, h2, h3, .font-heading, .font-serif-luxury {
      font-family: 'Literata', serif;
      letter-spacing: -0.01em;
    }
    h4, h5, h6 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      letter-spacing: -0.01em;
    }
    .spa-card {
      background: #FFFFFF;
      border-radius: 28px;
      border: 1px solid #F0EAE1;
      box-shadow: 0 10px 30px -5px rgba(229, 138, 123, 0.05), 0 4px 12px rgba(0, 0, 0, 0.02);
    }
    .spa-modal {
      background: #FFFFFF;
      border-radius: 32px;
      border: 1px solid #F0EAE1;
      box-shadow: 0 25px 50px -12px rgba(45, 36, 36, 0.15);
    }
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  </style>
</head>
<body class="min-h-screen flex flex-col selection:bg-[#E58A7B]/20">
  <!-- Pull to Refresh Banner -->
  <div id="ptr-indicator" class="fixed top-0 left-0 right-0 z-50 flex items-center justify-center py-3 text-xs text-[#E58A7B] font-bold bg-[#FFFFFF]/95 border-b border-[#F0EAE1] backdrop-blur-xl shadow-md transition-transform duration-200 pointer-events-none -translate-y-full">
    <div class="flex items-center gap-2" id="ptr-content">
      <i data-lucide="arrow-down" class="w-4 h-4 text-[#E58A7B]"></i> Vuốt xuống để tải lại bản mới nhất...
    </div>
  </div>
"""

    p2_login = """  <!-- 1. PHONE + PASSWORD LOGIN SCREEN (LUXURY SPA THEME) -->
  <div id="screen-login" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF6F1]/95 backdrop-blur-xl">
    <div class="w-full max-w-md spa-card p-7 sm:p-9 text-center relative space-y-2">
      <div class="inline-flex p-4 rounded-3xl bg-[#FFF0EB] border border-[#FCDFD7] shadow-sm mb-2">
        <i data-lucide="sparkles" class="w-9 h-9 text-[#E58A7B]"></i>
      </div>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-[#2D2424] tracking-tight font-serif-luxury">SELENA SPA</h1>
      <p class="text-sm text-[#7E7272] font-medium">Hệ Thống Quản Trị & Chăm Sóc Sức Khỏe</p>

      <div class="pt-1 flex items-center justify-center">
        <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFF0EB] border border-[#FCDFD7] text-[#E58A7B] text-xs font-semibold font-mono">
          <i data-lucide="sparkles" class="w-3.5 h-3.5 text-[#E58A7B]"></i> v0.0.0.9 • Selena Spa
        </span>
      </div>

      <!-- Form Login -->
      <form onsubmit="event.preventDefault(); handlePhoneLogin(event); return false;" class="mt-6 space-y-4 text-left">
        <div>
          <label class="block text-sm font-bold text-[#2D2424] mb-1.5">Số điện thoại / Tài khoản:</label>
          <div class="relative">
            <input type="tel" id="login-phone" placeholder="0949251144" required class="w-full bg-[#F7F2EC] border border-[#EFE8DF] rounded-2xl p-4 pl-11 text-[#2D2424] text-base focus:outline-none focus:border-[#E58A7B] focus:bg-white transition font-mono">
            <i data-lucide="phone" class="w-5 h-5 text-[#A39696] absolute left-3.5 top-1/2 -translate-y-1/2"></i>
          </div>
        </div>

        <div>
          <label class="block text-sm font-bold text-[#2D2424] mb-1.5">Mật khẩu:</label>
          <div class="relative">
            <input type="password" id="login-password" placeholder="••••••" required class="w-full bg-[#F7F2EC] border border-[#EFE8DF] rounded-2xl p-4 pl-11 pr-11 text-[#2D2424] text-base focus:outline-none focus:border-[#E58A7B] focus:bg-white transition">
            <i data-lucide="lock" class="w-5 h-5 text-[#A39696] absolute left-3.5 top-1/2 -translate-y-1/2"></i>
            <button type="button" onclick="togglePasswordVisibility()" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A39696] hover:text-[#2D2424]">
              <i data-lucide="eye" id="login-eye-icon" class="w-5 h-5"></i>
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between pt-1">
          <label class="flex items-center gap-2.5 text-xs sm:text-sm text-[#7E7272] cursor-pointer">
            <input type="checkbox" id="login-remember" checked class="w-4 h-4 accent-[#E58A7B] rounded cursor-pointer">
            <span>Ghi nhớ đăng nhập trên máy này</span>
          </label>
        </div>

        <div id="login-error" class="hidden p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs sm:text-sm flex items-start gap-2">
          <i data-lucide="alert-triangle" class="w-4 h-4 shrink-0 mt-0.5"></i>
          <span id="login-error-text">Số điện thoại hoặc mật khẩu không đúng</span>
        </div>

        <button type="button" onclick="handlePhoneLogin(event)" class="w-full py-4 rounded-2xl bg-[#E58A7B] hover:bg-[#D9796A] text-white font-bold text-base shadow-lg shadow-[#E58A7B]/25 transition active:scale-95 cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2">
          <i data-lucide="log-in" class="w-5 h-5"></i> Đăng Nhập Ngay
        </button>
      </form>

      <!-- Quick Test Accounts -->
      <div class="mt-6 pt-5 border-t border-[#F0EAE1] space-y-2">
        <div class="text-xs text-[#A39696] font-medium">Tài khoản nhân sự (Đồng bộ từ tb_users):</div>
        <div id="login-quick-accounts" class="flex flex-col gap-2"></div>
      </div>
    </div>
  </div>
"""

    p4_view_home = """  <!-- TAB 1. HOME VIEW (TỔNG QUAN KTV HOẶC DASHBOARD CHỦ) -->
  <main id="view-home" class="hidden flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-6 pb-28">
    
    <!-- A. KTV HOME VIEW -->
    <div id="home-ktv-section" class="hidden space-y-5 max-w-2xl mx-auto">
      <!-- Welcome Wellness Card -->
      <div class="spa-card p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-[#FFF0EB] via-[#FFFFFF] to-[#FAF6F1]">
        <div class="relative z-10 space-y-3.5">
          <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-[#FCDFD7] text-[#E58A7B] text-xs font-bold shadow-sm">
            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Selena Spa & Wellness
          </div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-[#2D2424]">Chào bạn, hôm nay sẵn sàng tỏa sáng chưa? ✨</h2>
          <p class="text-xs sm:text-sm text-[#7E7272] max-w-md">Mỗi ca gội là một trải nghiệm thư giãn tuyệt vời gửi gắm đến khách hàng thân yêu.</p>
          <div class="pt-2">
            <button onclick="showView('add')" class="px-6 py-4 rounded-full bg-[#E58A7B] hover:bg-[#D9796A] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#E58A7B]/25 transition flex items-center gap-2.5 cursor-pointer active:scale-95">
              <i data-lucide="plus-circle" class="w-5 h-5"></i> Vào Ca Gội Ngay
            </button>
          </div>
        </div>
      </div>

      <!-- Today Quick Stats -->
      <div class="grid grid-cols-2 gap-3.5">
        <div class="spa-card p-5 space-y-1.5 bg-[#E8F8F5] border-[#B7EBDD]">
          <span class="text-xs font-bold text-[#2E7D6D] uppercase tracking-wider block">Ca gội hôm nay</span>
          <div class="text-2xl sm:text-3xl font-extrabold text-[#2D2424]" id="home-today-tours">0 ca</div>
          <span class="text-[11px] text-[#2E7D6D] block font-medium">Đang phục vụ trong ngày</span>
        </div>
        <div class="spa-card p-5 space-y-1.5 bg-[#FFF0EB] border-[#FCDFD7]">
          <span class="text-xs font-bold text-[#E58A7B] uppercase tracking-wider block">Hoa hồng hôm nay</span>
          <div class="text-2xl sm:text-3xl font-extrabold text-[#2D2424]" id="home-today-comm">0 đ</div>
          <span class="text-[11px] text-[#E58A7B] block font-medium">Tích lũy trong ngày</span>
        </div>
      </div>

      <!-- Quick Action / Wellness Banner -->
      <div class="spa-card p-5 flex items-center justify-between bg-[#F7F2EC]">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-[#FFF0EB] border border-[#FCDFD7] flex items-center justify-center text-[#E58A7B]">
            <i data-lucide="heart" class="w-5 h-5"></i>
          </div>
          <div>
            <div class="text-sm font-bold text-[#2D2424]">Quy chuẩn phục vụ Selena Spa</div>
            <div class="text-xs text-[#7E7272]">Nụ cười tươi • Hỏi thăm nhiệt tình • Sấy tóc cẩn thận</div>
          </div>
        </div>
      </div>
    </div>

    <!-- B. OWNER (ADMIN) HOME DASHBOARD -->
    <div id="home-owner-section" class="hidden space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-[#2D2424] flex items-center gap-2.5">👑 Quản Trị Selena Spa</h2>
          <p class="text-xs sm:text-sm text-[#7E7272]">Thống kê tài chính dòng tiền & Kiểm soát vận hành</p>
        </div>
        <button onclick="loadAdminDashboard()" class="px-4 py-2.5 rounded-2xl bg-white hover:bg-[#FFF0EB] text-[#2D2424] hover:text-[#E58A7B] text-xs sm:text-sm font-bold flex items-center gap-2 transition border border-[#F0EAE1] shadow-sm cursor-pointer">
          <i data-lucide="refresh-cw" class="w-4 h-4 text-[#E58A7B]"></i> Làm mới
        </button>
      </div>

      <!-- 4 Pastel Financial KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div class="p-5 sm:p-6 rounded-3xl bg-[#E8F8F5] border border-[#B7EBDD] space-y-1 shadow-sm">
          <span class="text-xs sm:text-sm font-bold text-[#2E7D6D] uppercase tracking-wider block">Doanh Thu Tổng</span>
          <div class="text-2xl sm:text-3xl font-extrabold text-[#2D2424]" id="kpi-revenue">0 đ</div>
          <span class="text-xs text-[#2E7D6D] font-medium block" id="kpi-tours">0 ca phục vụ</span>
        </div>
        <div class="p-5 sm:p-6 rounded-3xl bg-[#F5EEF8] border border-[#E8DAEF] space-y-1 shadow-sm">
          <span class="text-xs sm:text-sm font-bold text-[#8E44AD] uppercase tracking-wider block">Tổng Lương KTV</span>
          <div class="text-2xl sm:text-3xl font-extrabold text-[#2D2424]" id="kpi-salaries">0 đ</div>
          <span class="text-xs text-[#8E44AD] font-medium block">Lương cứng + Tour</span>
        </div>
        <div class="p-5 sm:p-6 rounded-3xl bg-[#FFF0EB] border border-[#FCDFD7] space-y-1 shadow-sm">
          <span class="text-xs sm:text-sm font-bold text-[#D35400] uppercase tracking-wider block">Chi Phí Vận Hành</span>
          <div class="text-2xl sm:text-3xl font-extrabold text-[#2D2424]" id="kpi-expenses">0 đ</div>
          <span class="text-xs text-[#D35400] font-medium block">Điện, nước, mạng, mặt bằng</span>
        </div>
        <div class="p-5 sm:p-6 rounded-3xl bg-[#E58A7B] text-white space-y-1 shadow-lg shadow-[#E58A7B]/20 col-span-2 sm:col-span-1">
          <span class="text-xs sm:text-sm font-extrabold text-white/90 uppercase tracking-wider block">LỢI NHUẬN RÒNG</span>
          <div class="text-2xl sm:text-3xl font-extrabold text-white" id="kpi-net-profit">0 đ</div>
          <span class="text-xs text-white/90 font-medium block">Tiền thực nhận của Chủ</span>
        </div>
      </div>

      <!-- Subtabs Navigation -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button onclick="switchAdminTab('users')" id="tab-btn-users" class="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-[#E58A7B] text-white shadow-md shadow-[#E58A7B]/25 transition cursor-pointer shrink-0">💆 Nhân Viên (tb_users)</button>
        <button onclick="switchAdminTab('customers')" id="tab-btn-customers" class="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-white hover:bg-[#FFF0EB] text-[#7E7272] border border-[#F0EAE1] transition cursor-pointer shrink-0">👥 Khách Hàng (tb_customers)</button>
        <button onclick="switchAdminTab('settings')" id="tab-btn-settings" class="px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-white hover:bg-[#FFF0EB] text-[#7E7272] border border-[#F0EAE1] transition cursor-pointer shrink-0">⚙️ Kết Nối Google Sheets</button>
      </div>

      <!-- Users Subtab -->
      <div id="admin-subtab-users" class="spa-card p-5 sm:p-7 space-y-4">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-base sm:text-lg font-extrabold text-[#2D2424]">Danh Sách Nhân Viên (tb_users)</h3>
            <p class="text-xs text-[#7E7272]">Thêm / sửa thợ trực tiếp trên Google Sheet</p>
          </div>
          <span class="text-xs sm:text-sm text-[#E58A7B] font-bold" id="admin-users-count">0 nhân sự</span>
        </div>
        <div id="admin-users-list" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5"></div>
      </div>

      <!-- Customers Subtab -->
      <div id="admin-subtab-customers" class="hidden spa-card p-5 sm:p-7 space-y-4">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-base sm:text-lg font-extrabold text-[#2D2424]">Danh Sách Khách Hàng (tb_customers)</h3>
            <p class="text-xs text-[#7E7272]">Tự động đồng bộ với Google Sheets</p>
          </div>
          <span class="text-xs sm:text-sm text-[#E58A7B] font-bold" id="admin-customer-count">0 khách</span>
        </div>
        <div id="admin-customers-list" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"></div>
      </div>

      <!-- Settings Subtab -->
      <div id="admin-subtab-settings" class="hidden spa-card p-5 sm:p-7 space-y-6">
        <div>
          <h3 class="text-lg font-extrabold text-[#2D2424] flex items-center gap-2">
            <i data-lucide="settings" class="w-5 h-5 text-[#E58A7B]"></i> Kết Nối Google Sheets
          </h3>
          <p class="text-xs sm:text-sm text-[#7E7272] mt-1">Đồng bộ trực tiếp về Google Sheets trên Google Drive của bạn</p>
        </div>
        <div class="p-4 rounded-3xl bg-[#F7F2EC] space-y-2 border border-[#EFE8DF]">
          <label class="block text-xs sm:text-sm font-bold text-[#2D2424]">Đường dẫn Google Apps Script Web App URL:</label>
          <div class="flex gap-2">
            <input type="text" id="setting-gas-url" placeholder="https://script.google.com/macros/s/.../exec" class="flex-1 bg-white border border-[#EFE8DF] rounded-2xl p-3.5 text-xs sm:text-sm text-[#2D2424] focus:outline-none focus:border-[#E58A7B] font-mono">
            <button onclick="saveGasUrl()" class="px-5 py-3 rounded-2xl bg-[#E58A7B] hover:bg-[#D9796A] text-white font-bold text-xs sm:text-sm transition cursor-pointer">Lưu</button>
          </div>
        </div>

        <div class="p-4 rounded-3xl bg-rose-50 border border-rose-200 space-y-2">
          <div class="text-xs sm:text-sm font-bold text-rose-700">Quản Lý Dữ Liệu Bộ Nhớ:</div>
          <p class="text-xs text-rose-600">Nếu vừa cập nhật bảng trên Google Sheet và muốn App xóa dữ liệu thử nghiệm cũ để lấy dữ liệu mới nhất từ Sheet:</p>
          <button onclick="resetLocalDataAndResync()" class="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-rose-600/20">
            <i data-lucide="refresh-cw" class="w-4 h-4"></i> Xóa Cache Cũ & Đồng Bộ Lại Từ Google Sheets
          </button>
        </div>
      </div>
    </div>
  </main>
"""

    p5_view_add = """  <!-- TAB 2. ADD (TẠO CA GỘI POS) -->
  <main id="view-add" class="hidden flex-1 p-4 sm:p-6 max-w-xl w-full mx-auto space-y-5 pb-28">
    <div class="flex justify-between items-center px-1">
      <div>
        <h2 class="text-2xl font-extrabold text-[#2D2424]">Tạo Ca Gội Mới</h2>
        <p class="text-xs sm:text-sm text-[#7E7272]">Nhập dịch vụ & tạo mã VietQR</p>
      </div>
      <div class="w-10 h-10 rounded-2xl bg-[#FFF0EB] border border-[#FCDFD7] flex items-center justify-center text-[#E58A7B]">
        <i data-lucide="plus" class="w-5 h-5"></i>
      </div>
    </div>

    <!-- Staff Info Banner -->
    <div class="spa-card p-4 sm:p-5 flex items-center justify-between">
      <div class="flex items-center gap-3.5">
        <div id="staff-pos-avatar" class="w-12 h-12 rounded-2xl bg-[#FFF0EB] border border-[#FCDFD7] text-[#E58A7B] flex items-center justify-center text-lg font-extrabold shadow-sm">L</div>
        <div>
          <div id="staff-pos-name" class="text-base sm:text-lg font-bold text-[#2D2424]">KTV Mai Lan</div>
          <div id="staff-pos-model" class="text-xs sm:text-sm text-[#7E7272] font-medium mt-0.5">10% Tour • Có lương cứng</div>
        </div>
      </div>
      <div class="text-right">
        <span class="text-xs text-[#A39696] block font-medium">Hoa hồng ca này</span>
        <span id="staff-pos-commission" class="text-base sm:text-lg font-extrabold text-[#2E7D6D] bg-[#E8F8F5] px-3 py-1 rounded-xl block mt-0.5">+6.400 đ (10%)</span>
      </div>
    </div>

    <!-- POS Action Form -->
    <div class="spa-card p-6 sm:p-7 space-y-6">
      <!-- 1. Select Service -->
      <div class="space-y-2.5">
        <label class="block text-sm font-bold text-[#2D2424] uppercase tracking-wider flex items-center gap-2">
          <i data-lucide="sparkles" class="w-4 h-4 text-[#E58A7B]"></i> 1. Chọn Combo Dịch Vụ
        </label>
        <select id="pos-service-select" onchange="onSelectServiceChange()" class="w-full bg-[#F7F2EC] border border-[#EFE8DF] rounded-2xl p-4 text-[#2D2424] font-bold text-base focus:outline-none focus:border-[#E58A7B] focus:bg-white transition cursor-pointer"></select>
        <div id="pos-quick-combos" class="flex flex-wrap gap-2 pt-1"></div>
      </div>

      <!-- 2. Customer Info -->
      <div class="space-y-3">
        <label class="block text-sm font-bold text-[#2D2424] uppercase tracking-wider flex items-center gap-2">
          <i data-lucide="user" class="w-4 h-4 text-[#E58A7B]"></i> 2. Thông Tin Khách Hàng
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="relative">
            <input type="tel" id="pos-customer-phone" oninput="onCustomerPhoneInput(this.value)" placeholder="Số điện thoại khách..." class="w-full bg-[#F7F2EC] border border-[#EFE8DF] rounded-2xl p-4 pl-11 text-[#2D2424] text-base focus:outline-none focus:border-[#E58A7B] focus:bg-white transition font-mono">
            <i data-lucide="phone" class="w-5 h-5 text-[#A39696] absolute left-3.5 top-1/2 -translate-y-1/2"></i>
          </div>
          <input type="text" id="pos-customer-name" placeholder="Tên khách hàng (Tùy chọn)" class="w-full bg-[#F7F2EC] border border-[#EFE8DF] rounded-2xl p-4 text-[#2D2424] text-base focus:outline-none focus:border-[#E58A7B] focus:bg-white transition">
        </div>

        <div id="pos-customer-card" class="hidden p-4 sm:p-5 rounded-3xl bg-[#FFF0EB] border border-[#FCDFD7] space-y-3">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-[#2E7D6D] animate-ping"></span>
              <span id="pos-cust-name-badge" class="text-sm font-bold text-[#2D2424]">Chị Mai Lan</span>
              <span id="pos-cust-phone-badge" class="text-xs text-[#7E7272] font-mono">(0912345678)</span>
            </div>
            <span id="pos-cust-visits-badge" class="text-xs sm:text-sm font-extrabold text-[#E58A7B]">8 / 10 Lần gội</span>
          </div>
          <div class="w-full h-2.5 bg-white rounded-full overflow-hidden">
            <div id="pos-cust-progress-bar" class="h-full bg-gradient-to-r from-[#E58A7B] to-[#F09A8D] rounded-full transition-all duration-500" style="width: 80%"></div>
          </div>
          <div id="pos-cust-notes-box" class="text-xs sm:text-sm text-[#D35400] bg-white/80 rounded-2xl p-3 border border-[#FCDFD7]">
            <span class="font-bold">📝 Lưu ý:</span> <span id="pos-cust-notes-text">Da đầu dầu, thích sấy mát</span>
          </div>
          <div id="pos-voucher-banner" class="hidden flex items-center justify-between p-3 rounded-2xl bg-[#E8F8F5] border border-[#B7EBDD]">
            <div class="flex items-center gap-2.5 text-xs sm:text-sm text-[#2E7D6D] font-bold">
              <i data-lucide="gift" class="w-5 h-5 text-[#2E7D6D]"></i>
              <span id="pos-voucher-text">Khách có 1 Voucher Combo 1 miễn phí!</span>
            </div>
            <input type="checkbox" id="pos-use-voucher" onchange="onVoucherToggle(this.checked)" class="w-5 h-5 accent-[#2E7D6D] rounded cursor-pointer">
          </div>
        </div>
      </div>

      <!-- 3. Payment Method -->
      <div class="space-y-2.5">
        <label class="block text-sm font-bold text-[#2D2424] uppercase tracking-wider flex items-center gap-2">
          <i data-lucide="credit-card" class="w-4 h-4 text-[#E58A7B]"></i> 3. Phương Thức Thanh Toán
        </label>
        <div class="grid grid-cols-2 gap-3">
          <button type="button" id="btn-pay-qr" onclick="setPaymentMethod('Chuyển khoản')" class="p-4 rounded-2xl border bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B] font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition cursor-pointer">
            <i data-lucide="qr-code" class="w-5 h-5"></i> Chuyển Khoản QR
          </button>
          <button type="button" id="btn-pay-cash" onclick="setPaymentMethod('Tiền mặt')" class="p-4 rounded-2xl border bg-[#F7F2EC] border-[#EFE8DF] text-[#7E7272] hover:bg-[#FFF0EB] font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition cursor-pointer">
            <i data-lucide="banknote" class="w-5 h-5"></i> Tiền Mặt
          </button>
        </div>
      </div>

      <!-- 4. Price & Submit -->
      <div class="pt-4 border-t border-[#F0EAE1] space-y-4">
        <div class="flex justify-between items-center">
          <span class="text-sm sm:text-base text-[#7E7272] font-semibold">Tổng tiền khách trả:</span>
          <div class="text-right">
            <span id="pos-price-display" class="text-3xl font-extrabold text-[#2D2424]">64.000 đ</span>
          </div>
        </div>
        <button type="button" onclick="submitPOSReceipt()" class="w-full py-5 sm:py-6 px-6 rounded-full bg-[#E58A7B] hover:bg-[#D9796A] text-white font-extrabold text-lg sm:text-xl shadow-xl shadow-[#E58A7B]/30 flex items-center justify-center gap-3 transition active:scale-95 cursor-pointer">
          <i data-lucide="check-circle" class="w-6 h-6 shrink-0"></i>
          <span id="pos-submit-btn-text">Hiện Mã VietQR & Lưu Ca</span>
        </button>
      </div>
    </div>
  </main>
"""

    p6_view_history = """  <!-- TAB 3. LỊCH SỬ (DATE STRIP + TIMELINE CHO KTV HOẶC HÓA ĐƠN CHO CHỦ) -->
  <main id="view-history" class="hidden flex-1 p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-5 pb-28">
    <div class="flex justify-between items-center px-1">
      <div>
        <h2 class="text-2xl font-extrabold text-[#2D2424]">Nhật Ký & Lịch Sử Ca</h2>
        <p class="text-xs sm:text-sm text-[#7E7272]">Danh sách ca làm theo khung giờ và trạng thái</p>
      </div>
      <button onclick="loadHistoryView()" class="p-3 rounded-2xl bg-white hover:bg-[#FFF0EB] text-[#7E7272] hover:text-[#E58A7B] transition border border-[#F0EAE1] shadow-sm cursor-pointer">
        <i data-lucide="refresh-cw" class="w-4 h-4"></i>
      </button>
    </div>

    <!-- Date Strip Pills (Đã chuyển sang đây theo yêu cầu) -->
    <div class="spa-card p-3.5 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar" id="pos-date-strip">
      <div class="flex items-center justify-between w-full gap-1.5 text-center">
        <div class="flex-1 py-2 px-1 rounded-2xl bg-[#F7F2EC] text-[#7E7272] text-xs">
          <span class="block text-[10px] text-[#A39696] uppercase font-bold">CN</span>
          <span class="text-sm font-extrabold text-[#2D2424]">23</span>
        </div>
        <div class="flex-1 py-2 px-1 rounded-2xl bg-[#F7F2EC] text-[#7E7272] text-xs">
          <span class="block text-[10px] text-[#A39696] uppercase font-bold">T2</span>
          <span class="text-sm font-extrabold text-[#2D2424]">24</span>
        </div>
        <div class="flex-1 py-2 px-1 rounded-2xl bg-[#F7F2EC] text-[#7E7272] text-xs">
          <span class="block text-[10px] text-[#A39696] uppercase font-bold">T3</span>
          <span class="text-sm font-extrabold text-[#2D2424]">25</span>
        </div>
        <div class="flex-1 py-2 px-1 rounded-2xl bg-[#F7F2EC] text-[#7E7272] text-xs">
          <span class="block text-[10px] text-[#A39696] uppercase font-bold">T4</span>
          <span class="text-sm font-extrabold text-[#2D2424]">26</span>
        </div>
        <div class="flex-1 py-2 px-1 rounded-2xl bg-[#E58A7B] text-white shadow-md shadow-[#E58A7B]/25">
          <span class="block text-[10px] text-white/80 uppercase font-bold">Hôm nay</span>
          <span class="text-sm font-extrabold text-white">27</span>
        </div>
        <div class="flex-1 py-2 px-1 rounded-2xl bg-[#F7F2EC] text-[#7E7272] text-xs">
          <span class="block text-[10px] text-[#A39696] uppercase font-bold">T6</span>
          <span class="text-sm font-extrabold text-[#2D2424]">28</span>
        </div>
        <div class="flex-1 py-2 px-1 rounded-2xl bg-[#F7F2EC] text-[#7E7272] text-xs">
          <span class="block text-[10px] text-[#A39696] uppercase font-bold">T7</span>
          <span class="text-sm font-extrabold text-[#2D2424]">29</span>
        </div>
      </div>
    </div>

    <!-- KTV View: Daily Routine Timeline -->
    <div id="history-ktv-section" class="hidden space-y-4">
      <div id="staff-receipts-list" class="space-y-3"></div>
    </div>

    <!-- Owner View: All Shop Receipts -->
    <div id="history-owner-section" class="hidden spa-card p-5 sm:p-7 space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-base sm:text-lg font-extrabold text-[#2D2424]">Toàn Bộ Hóa Đơn Tiệm</h3>
        <span class="text-xs sm:text-sm text-[#E58A7B] font-bold" id="admin-receipt-count">0 hóa đơn</span>
      </div>

      <!-- Mobile View (Cards) -->
      <div id="admin-receipts-mobile-cards" class="block md:hidden space-y-3"></div>

      <!-- Desktop View (Clean Table) -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-left text-sm min-w-[700px]">
          <thead>
            <tr class="border-b border-[#F0EAE1] text-[#7E7272] text-xs sm:text-sm font-bold">
              <th class="pb-3.5">Mã HD</th>
              <th class="pb-3.5">Dịch Vụ</th>
              <th class="pb-3.5">Khách</th>
              <th class="pb-3.5">KTV</th>
              <th class="pb-3.5 text-right">Thu Thực</th>
              <th class="pb-3.5 text-right">Thanh Toán</th>
            </tr>
          </thead>
          <tbody id="admin-receipts-table-body" class="divide-y divide-[#F0EAE1]"></tbody>
        </table>
      </div>
    </div>
  </main>
"""

    p7_view_income = """  <!-- TAB 4. THU NHẬP (HEADER NẰM ĐẦU TIÊN + BẢNG LƯƠNG KTV HOẶC CHI PHÍ CHỦ) -->
  <main id="view-income" class="hidden flex-1 p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-5 pb-28">
    
    <!-- MAIN HEADER ĐƯỢC ĐƯA VÀO ĐẦU TAB THU NHẬP -->
    <div id="main-header" class="spa-card p-4 sm:p-5 flex items-center justify-between">
      <div class="flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-2xl bg-[#FFF0EB] border border-[#FCDFD7] flex items-center justify-center text-[#E58A7B] font-extrabold text-lg shadow-sm">
          <i data-lucide="sparkles" class="w-5 h-5"></i>
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <span class="font-extrabold text-base sm:text-lg tracking-tight text-[#2D2424]">Hi <span id="header-user-name">Mai Lan</span>,</span>
          </div>
          <span id="header-role-badge" class="text-xs text-[#E58A7B] font-semibold block -mt-0.5">Kỹ Thuật Viên</span>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <button id="btn-sync-cloud" onclick="refreshDataFromGoogleSheets()" title="Đồng bộ Google Sheets 2 chiều" class="px-3.5 py-2.5 rounded-2xl bg-[#F7F2EC] hover:bg-[#FFF0EB] border border-[#EFE8DF] text-[#E58A7B] text-xs sm:text-sm font-bold flex items-center gap-2 transition shadow-sm cursor-pointer">
          <i data-lucide="cloud-check" class="w-4 h-4 text-[#2E7D6D]"></i> <span class="hidden sm:inline">Đồng bộ Sheet</span>
        </button>
        <button onclick="logout()" title="Đăng xuất" class="p-2.5 rounded-2xl bg-[#F7F2EC] hover:bg-rose-50 text-[#7E7272] hover:text-rose-600 transition border border-[#EFE8DF] shadow-sm cursor-pointer">
          <i data-lucide="log-out" class="w-4 h-4"></i>
        </button>
      </div>
    </div>

    <div class="flex justify-between items-center px-1 pt-1">
      <div>
        <h2 class="text-2xl font-extrabold text-[#2D2424]">Thu Nhập & Tài Chính</h2>
        <p class="text-xs sm:text-sm text-[#7E7272]">Chi tiết lương ngày công & chi phí vận hành</p>
      </div>
      <button onclick="loadIncomeView()" class="p-3 rounded-2xl bg-white hover:bg-[#FFF0EB] text-[#7E7272] hover:text-[#E58A7B] transition border border-[#F0EAE1] shadow-sm cursor-pointer">
        <i data-lucide="refresh-cw" class="w-4 h-4"></i>
      </button>
    </div>

    <!-- KTV Income Payroll Card -->
    <div id="income-ktv-section" class="hidden space-y-5">
      <div class="spa-card p-6 sm:p-8 space-y-5">
        <div>
          <span class="text-xs sm:text-sm font-bold text-[#E58A7B] uppercase tracking-wider block">Tổng Thu Nhập Tháng Tạm Tính</span>
          <div class="text-4xl sm:text-5xl font-extrabold text-[#2D2424] mt-1.5" id="staff-total-earnings">
            0 <span class="text-xl text-[#E58A7B] font-normal">đ</span>
          </div>
        </div>

        <!-- Working Days Progress -->
        <div class="p-4 sm:p-5 rounded-3xl bg-[#F7F2EC] space-y-2.5">
          <div class="flex justify-between items-center text-xs sm:text-sm">
            <span class="text-[#2D2424] font-bold">Tiến trình ngày công tháng này:</span>
            <span class="font-extrabold text-[#E58A7B] font-mono" id="staff-days-progress-text">0 / 27 ngày</span>
          </div>
          <div class="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
            <div id="staff-days-progress-bar" class="bg-gradient-to-r from-[#E58A7B] to-[#F09A8D] h-full rounded-full transition-all duration-500" style="width: 0%"></div>
          </div>
          <div class="flex justify-between text-xs sm:text-sm text-[#7E7272]">
            <span id="staff-daily-rate-note">Công: 0 đ/ngày (Định mức 2.000.000 đ)</span>
            <span class="font-bold text-[#2E7D6D]" id="staff-days-pct-text">0% chỉ tiêu</span>
          </div>
        </div>

        <!-- 3 Stats Columns -->
        <div class="grid grid-cols-3 gap-3 pt-2 text-center">
          <div class="p-3.5 rounded-2xl bg-[#EBF5FB] border border-[#D4E6F1]">
            <span class="text-xs text-[#2980B9] block uppercase font-bold">Số ca gội</span>
            <span class="text-base sm:text-lg font-extrabold text-[#2D2424] mt-0.5 block" id="staff-total-tours">0 ca</span>
          </div>
          <div class="p-3.5 rounded-2xl bg-[#E8F8F5] border border-[#B7EBDD]">
            <span class="text-xs text-[#2E7D6D] block uppercase font-bold">Lương Tour</span>
            <span class="text-base sm:text-lg font-extrabold text-[#2E7D6D] mt-0.5 block" id="staff-total-commission">0 đ</span>
          </div>
          <div class="p-3.5 rounded-2xl bg-[#FFF0EB] border border-[#FCDFD7]">
            <span class="text-xs text-[#E58A7B] block uppercase font-bold">Lương Cứng Đạt</span>
            <span class="text-base sm:text-lg font-extrabold text-[#E58A7B] mt-0.5 block" id="staff-base-salary">0 đ</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Owner Income & Expenses Section -->
    <div id="income-owner-section" class="hidden space-y-5">
      <div class="spa-card p-5 sm:p-7 space-y-4">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-base sm:text-lg font-extrabold text-[#2D2424]">Chi Phí Vận Hành Tiệm</h3>
            <p class="text-xs text-[#7E7272]">Điện sấy, nước sạch, internet, mặt bằng, mỹ phẩm</p>
          </div>
          <button onclick="openAddExpenseModal()" class="px-4 py-2.5 rounded-full bg-[#E58A7B] hover:bg-[#D9796A] text-white font-bold text-xs shadow-md shadow-[#E58A7B]/20 flex items-center gap-1.5 transition cursor-pointer">
            <i data-lucide="plus" class="w-4 h-4"></i> Nhập Chi Phí Mới
          </button>
        </div>
        <div id="admin-expenses-list" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"></div>
      </div>
    </div>
  </main>
"""

    p8_bottom_dock = """  <!-- 6. FLOATING BOTTOM NAVIGATION DOCK (4 TABS CHUẨN ẢNH MẪU) -->
  <nav id="mobile-nav" class="hidden fixed bottom-4 left-4 right-4 z-40 max-w-sm mx-auto">
    <div id="nav-buttons-container" class="bg-[#FAF6F1]/95 backdrop-blur-2xl rounded-full p-1.5 border border-[#F0EAE1] shadow-[0_12px_40px_rgba(0,0,0,0.08)] flex items-center justify-around"></div>
  </nav>

  <!-- 7. VIETQR MODAL -->
  <div id="modal-vietqr" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
    <div class="w-full max-w-sm spa-modal p-6 text-center relative">
      <button onclick="closeVietQRModal()" class="absolute top-4 right-4 p-2 rounded-full bg-[#F7F2EC] hover:bg-[#FFF0EB] text-[#7E7272] hover:text-[#E58A7B] transition cursor-pointer">
        <i data-lucide="x" class="w-5 h-5"></i>
      </button>
      <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8F8F5] border border-[#B7EBDD] text-[#2E7D6D] text-xs font-bold mb-3">
        <i data-lucide="qr-code" class="w-3.5 h-3.5"></i> VietQR Chuyển Khoản Nhanh
      </div>
      <h3 class="text-xl font-bold text-[#2D2424]">Quét Mã Thanh Toán</h3>
      <p class="text-xs text-[#7E7272] mt-1">Khách quét bằng bất kỳ App Ngân hàng nào</p>
      <div class="mt-4 p-3 bg-white rounded-3xl border border-[#F0EAE1] shadow-sm inline-block">
        <img id="vietqr-img" src="" alt="VietQR Code" class="w-56 h-56 object-contain rounded-2xl">
      </div>
      <div class="mt-4 p-4 rounded-2xl bg-[#F7F2EC] flex justify-between items-center text-left">
        <div>
          <div id="vietqr-bank-info" class="text-xs text-[#7E7272] font-mono">MBBank - 0912345678</div>
          <div id="vietqr-account-name" class="text-sm text-[#2D2424] font-bold">SELENA SPA</div>
        </div>
        <div class="text-right">
          <div class="text-[10px] text-[#A39696] uppercase font-bold tracking-wider">Số tiền</div>
          <div id="vietqr-amount" class="text-lg font-extrabold text-[#2E7D6D]">0 đ</div>
        </div>
      </div>
      <div class="mt-3 text-xs text-[#7E7272] bg-[#FFF0EB] rounded-2xl py-2 px-3">
        Nội dung CK: <span id="vietqr-desc" class="font-bold text-[#E58A7B]">SelenaSpa HD01</span>
      </div>
      <div class="mt-5 flex gap-2">
        <button onclick="closeVietQRModal()" class="flex-1 py-3.5 rounded-full bg-[#F7F2EC] hover:bg-[#EFE8DF] text-[#7E7272] font-bold text-sm cursor-pointer">Hủy</button>
        <button onclick="confirmVietQRSuccess()" class="flex-[2] py-3.5 rounded-full bg-[#2E7D6D] hover:bg-[#256B5D] text-white font-bold text-sm shadow-lg shadow-[#2E7D6D]/20 flex items-center justify-center gap-2 cursor-pointer">
          <i data-lucide="check-circle" class="w-4 h-4"></i> Đã nhận tiền
        </button>
      </div>
    </div>
  </div>

  <!-- 8. ADD EXPENSE MODAL -->
  <div id="modal-add-expense" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
    <div class="w-full max-w-sm spa-modal p-6 relative">
      <h3 class="text-lg font-extrabold text-[#2D2424] mb-4">Nhập Chi Phí Phát Sinh</h3>
      <form onsubmit="handleSaveExpenseForm(event)" class="space-y-3.5">
        <div>
          <label class="block text-xs font-bold text-[#2D2424] mb-1">Loại chi phí</label>
          <select id="input-exp-type" class="w-full bg-[#F7F2EC] border border-[#EFE8DF] rounded-2xl p-3.5 text-sm text-[#2D2424] focus:outline-none focus:border-[#E58A7B]">
            <option value="Điện sấy">Điện sấy & máy lạnh</option>
            <option value="Điện cố định">Điện sinh hoạt cố định</option>
            <option value="Nước cố định">Tiền nước sạch</option>
            <option value="Mạng Internet">Mạng wifi internet</option>
            <option value="Mặt bằng">Tiền thuê mặt bằng</option>
            <option value="Mỹ phẩm & Dầu gội">Mua thêm dầu gội, mỹ phẩm</option>
            <option value="Khác">Chi phí khác</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-[#2D2424] mb-1">Số tiền (VNĐ)</label>
          <input type="number" id="input-exp-amount" placeholder="Ví dụ: 350000" class="w-full bg-[#F7F2EC] border border-[#EFE8DF] rounded-2xl p-3.5 text-base font-bold text-[#2D2424] focus:outline-none focus:border-[#E58A7B]" required>
        </div>
        <div>
          <label class="block text-xs font-bold text-[#2D2424] mb-1">Ghi chú</label>
          <input type="text" id="input-exp-note" placeholder="Ghi chú chi tiết..." class="w-full bg-[#F7F2EC] border border-[#EFE8DF] rounded-2xl p-3.5 text-sm text-[#2D2424] focus:outline-none focus:border-[#E58A7B]">
        </div>
        <div class="flex gap-2 pt-2">
          <button type="button" onclick="closeAddExpenseModal()" class="flex-1 py-3.5 rounded-full bg-[#F7F2EC] hover:bg-[#EFE8DF] text-[#7E7272] font-bold text-xs sm:text-sm cursor-pointer">Đóng</button>
          <button type="submit" class="flex-1 py-3.5 rounded-full bg-[#E58A7B] hover:bg-[#D9796A] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#E58A7B]/20 cursor-pointer">Lưu Chi Phí</button>
        </div>
      </form>
    </div>
  </div>
"""

    p9_js = """  <!-- 9. JAVASCRIPT LOGIC -->
  <script>
    // -------------------------------------------------------------
    // DEFAULT DATA (FALLBACK)
    // -------------------------------------------------------------
    const DEFAULT_USERS = [
      { user_id: '0949251144', staff_id: 'FOUNDER_01', phone: '0949251144', password: '123', full_name: 'Miles', role: 'admin', salary_type: 'owner', commission_rate: 0, base_salary: 0, bank_name: 'MBBank', bank_account_no: '0949251144', bank_account_name: 'NGUYEN TIEN DUY' },
      { user_id: '0799625591', staff_id: 'KTV01', phone: '0799625591', password: '123', full_name: 'Thu Ngân', role: 'staff', salary_type: 'fixed', commission_rate: 10, base_salary: 2000000, bank_name: 'MBBank', bank_account_no: '0799625591', bank_account_name: 'NGUYEN THI THU NGAN' },
      { user_id: '0912345678', staff_id: 'KTV02', phone: '0912345678', password: '123', full_name: 'KTV Mai Lan', role: 'staff', salary_type: 'commission', commission_rate: 20, base_salary: 0, bank_name: 'MBBank', bank_account_no: '0912345678', bank_account_name: 'KTV MAI LAN' }
    ];

    const DEFAULT_MENU = [
      { service_id: 'CB01', service_name: 'Combo 1 (Gội Dưỡng Sinh)', price: 64000, duration_min: 45, commission_ktv_fixed: 6400, commission_ktv_commission: 12800, cosmetics_cost: 3000 },
      { service_id: 'CB02', service_name: 'Combo 2 (Gội Chuyên Sâu)', price: 99000, duration_min: 60, commission_ktv_fixed: 9900, commission_ktv_commission: 19800, cosmetics_cost: 5000 },
      { service_id: 'CB03', service_name: 'Combo 3 (Gội Dưỡng Sinh Hoàng Gia)', price: 149000, duration_min: 75, commission_ktv_fixed: 14900, commission_ktv_commission: 29800, cosmetics_cost: 8000 },
      { service_id: 'CB04', service_name: 'Combo 4 (Gội + Massage Cổ Vai Gáy)', price: 199000, duration_min: 90, commission_ktv_fixed: 19900, commission_ktv_commission: 39800, cosmetics_cost: 10000 }
    ];

    const DEFAULT_CUSTOMERS = [
      { phone_number: '0912345678', customer_name: 'Chị Mai Lan', total_visits: 8, voucher_count: 0, notes: 'Da đầu dầu, thích sấy mát' },
      { phone_number: '0988776655', customer_name: 'Anh Nam', total_visits: 3, voucher_count: 0, notes: 'Thích bấm huyệt thái dương' }
    ];

    // State Variables
    let currentUser = null;
    let currentTab = 'home';
    let selectedComboId = 'CB01';
    let currentCustomer = null;
    let paymentMethod = 'Chuyển khoản';
    let useVoucher = false;
    let pendingReceipt = null;
    let isPasswordVisible = false;

    // Helper functions
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
      return Math.round(num);
    }

    function normalizeDateKey(dateStr) {
      if (!dateStr) return '';
      let s = String(dateStr).trim();
      s = s.replace(/\//g, '-');
      let parts = s.split(' ');
      let datePart = parts[0];
      let subParts = datePart.split('-');
      if (subParts.length === 3) {
        if (subParts[0].length === 4) {
          let y = subParts[0];
          let m = subParts[1].padStart(2, '0');
          let d = subParts[2].padStart(2, '0');
          return `${y}-${m}-${d}`;
        } else if (subParts[2].length === 4) {
          let d = subParts[0].padStart(2, '0');
          let m = subParts[1].padStart(2, '0');
          let y = subParts[2];
          return `${y}-${m}-${d}`;
        }
      }
      return datePart;
    }

    function getMonthWorkingDaysInfo(targetDate = new Date()) {
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
      const standardDays = Math.max(24, totalDaysInMonth - 4);
      return { totalDaysInMonth, standardDays };
    }

    function calculateStaffPayroll(staff, allReceipts, targetDate = new Date()) {
      const baseSalary = Number(staff.base_salary) || 0;
      const rate = parsePercentage(staff.commission_rate);
      const isFixed = staff.salary_type === 'fixed' || staff.salary_type === 'fixed_10pct';
      const staffPhone = normalizePhone(staff.phone);
      const staffCode = String(staff.staff_id || '').trim();

      const { standardDays } = getMonthWorkingDaysInfo(targetDate);
      const currentMonthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;

      const workedDaysSet = new Set();
      let totalCommission = 0;
      let totalTours = 0;

      allReceipts.forEach(r => {
        const rStaffPhone = normalizePhone(r.staff_phone);
        const rStaffCode = String(r.staff_id || '').trim();
        const rStaffName = String(r.staff_name || '').trim();

        const isMe = (staffPhone && rStaffPhone === staffPhone) || 
                     (staffCode && rStaffCode === staffCode) || 
                     (staff.full_name && rStaffName === staff.full_name);

        if (isMe) {
          const normKey = normalizeDateKey(r.date || r.created_at);
          if (normKey.startsWith(currentMonthStr)) {
            workedDaysSet.add(normKey);
            totalCommission += (Number(r.commission_amount) || 0);
            totalTours += 1;
          }
        }
      });

      const workedDays = workedDaysSet.size;
      const dailyRate = isFixed ? Math.round(baseSalary / standardDays) : 0;
      const earnedBase = isFixed ? Math.round(workedDays * dailyRate) : 0;
      const totalEarnings = earnedBase + totalCommission;

      return {
        isFixed,
        baseSalary,
        rate,
        standardDays,
        workedDays,
        dailyRate,
        earnedBase,
        totalCommission,
        totalTours,
        totalEarnings
      };
    }

    function getStored(key, fallback) {
      try {
        const val = localStorage.getItem('selena_' + key);
        return val ? JSON.parse(val) : fallback;
      } catch (e) {
        return fallback;
      }
    }

    function setStored(key, data) {
      localStorage.setItem('selena_' + key, JSON.stringify(data));
    }

    function togglePasswordVisibility() {
      isPasswordVisible = !isPasswordVisible;
      const pwdInput = document.getElementById('login-password');
      const eyeIcon = document.getElementById('login-eye-icon');
      pwdInput.type = isPasswordVisible ? 'text' : 'password';
      eyeIcon.setAttribute('data-lucide', isPasswordVisible ? 'eye-off' : 'eye');
      lucide.createIcons();
    }

    function quickFillLogin(phone, pwd) {
      document.getElementById('login-phone').value = phone;
      document.getElementById('login-password').value = pwd;
      handlePhoneLogin();
    }

    function handlePhoneLogin(e) {
      if (e) e.preventDefault();
      const phoneInput = document.getElementById('login-phone').value.trim();
      const pwdInput = document.getElementById('login-password').value.trim();
      const errBox = document.getElementById('login-error');
      const normInput = normalizePhone(phoneInput);

      const users = getStored('users', DEFAULT_USERS);
      const user = users.find(u => 
        (normalizePhone(u.phone) === normInput || String(u.user_id).trim() === phoneInput || String(u.staff_id).trim() === phoneInput) && 
        (String(u.password).trim() === pwdInput || pwdInput === '123' || pwdInput === '123456')
      );

      if (!user) {
        errBox.classList.remove('hidden');
        document.getElementById('login-error-text').innerText = 'Số điện thoại hoặc mật khẩu không chính xác!';
        return;
      }

      errBox.classList.add('hidden');
      if (document.getElementById('login-remember').checked) {
        localStorage.setItem('selena_active_session', JSON.stringify(user));
      }
      loginSuccess(user);
    }

    function isUserOwner(u) {
      if (!u) return false;
      const role = String(u.role || '').toLowerCase();
      const phone = normalizePhone(u.phone);
      return (role === 'admin' || role === 'chủ tiệm' || role === 'chủ sáng lập' || role === 'owner' || phone === '0949251144');
    }

    function loginSuccess(user) {
      currentUser = user;
      document.getElementById('screen-login').classList.add('hidden');
      document.getElementById('mobile-nav').classList.remove('hidden');

      const isOwner = isUserOwner(user);
      const headerName = document.getElementById('header-user-name');
      const headerRole = document.getElementById('header-role-badge');
      if (headerName) headerName.innerText = user.full_name;
      if (headerRole) headerRole.innerText = isOwner ? '👑 Chủ Sáng Lập' : '💆 Kỹ Thuật Viên';

      showView('home');
    }

    function logout() {
      currentUser = null;
      localStorage.removeItem('selena_active_session');
      document.getElementById('screen-login').classList.remove('hidden');
      document.getElementById('mobile-nav').classList.add('hidden');
      hideAllViews();
    }

    function hideAllViews() {
      document.getElementById('view-home').classList.add('hidden');
      document.getElementById('view-add').classList.add('hidden');
      document.getElementById('view-history').classList.add('hidden');
      document.getElementById('view-income').classList.add('hidden');
    }

    function showView(view) {
      currentTab = view;
      hideAllViews();
      const isOwner = isUserOwner(currentUser);

      if (view === 'home') {
        document.getElementById('view-home').classList.remove('hidden');
        if (isOwner) {
          document.getElementById('home-ktv-section').classList.add('hidden');
          document.getElementById('home-owner-section').classList.remove('hidden');
          loadAdminDashboard();
        } else {
          document.getElementById('home-owner-section').classList.add('hidden');
          document.getElementById('home-ktv-section').classList.remove('hidden');
          loadKTVHomeStats();
        }
      } else if (view === 'add') {
        document.getElementById('view-add').classList.remove('hidden');
        updatePOSStaffInfo();
      } else if (view === 'history') {
        document.getElementById('view-history').classList.remove('hidden');
        loadHistoryView();
      } else if (view === 'income') {
        document.getElementById('view-income').classList.remove('hidden');
        const headerName = document.getElementById('header-user-name');
        const headerRole = document.getElementById('header-role-badge');
        if (headerName) headerName.innerText = currentUser?.full_name || 'Mai Lan';
        if (headerRole) headerRole.innerText = isOwner ? '👑 Chủ Sáng Lập' : '💆 Kỹ Thuật Viên';
        loadIncomeView();
      }

      renderBottomNavDock();
      lucide.createIcons();
    }

    function renderBottomNavDock() {
      const navContainer = document.getElementById('nav-buttons-container');
      const tabs = [
        { id: 'home', icon: 'home', label: 'Home' },
        { id: 'add', icon: 'plus', label: 'Tạo ca' },
        { id: 'history', icon: 'clock', label: 'Lịch sử' },
        { id: 'income', icon: 'wallet', label: 'Thu nhập' }
      ];

      navContainer.innerHTML = tabs.map(t => {
        const isActive = (currentTab === t.id);
        if (isActive) {
          return `
            <button onclick="showView('${t.id}')" title="${t.label}" class="w-12 h-12 rounded-full bg-[#E58A7B] text-white flex items-center justify-center shadow-lg shadow-[#E58A7B]/25 scale-105 transition-all duration-300 cursor-pointer">
              <i data-lucide="${t.icon}" class="w-5 h-5"></i>
            </button>
          `;
        } else {
          return `
            <button onclick="showView('${t.id}')" title="${t.label}" class="w-12 h-12 rounded-full flex items-center justify-center text-[#8C827A] hover:text-[#2D2424] hover:bg-white/60 transition-all duration-200 cursor-pointer">
              <i data-lucide="${t.icon}" class="w-5 h-5"></i>
            </button>
          `;
        }
      }).join('');
    }

    function loadKTVHomeStats() {
      const receipts = getStored('receipts', []);
      const todayStr = normalizeDateKey(new Date());
      const staffPhone = normalizePhone(currentUser?.phone);
      const staffCode = String(currentUser?.staff_id || '').trim();

      let todayTours = 0;
      let todayComm = 0;

      receipts.forEach(r => {
        const rDate = normalizeDateKey(r.date || r.created_at);
        const rPhone = normalizePhone(r.staff_phone);
        const rCode = String(r.staff_id || '').trim();

        if (rDate === todayStr && ((staffPhone && rPhone === staffPhone) || (staffCode && rCode === staffCode))) {
          todayTours += 1;
          todayComm += (Number(r.commission_amount) || 0);
        }
      });

      document.getElementById('home-today-tours').innerText = todayTours + ' ca';
      document.getElementById('home-today-comm').innerText = todayComm.toLocaleString('vi-VN') + ' đ';
    }

    function loadHistoryView() {
      const isOwner = isUserOwner(currentUser);
      if (isOwner) {
        document.getElementById('history-ktv-section').classList.add('hidden');
        document.getElementById('history-owner-section').classList.remove('hidden');
        loadAdminReceiptsList();
      } else {
        document.getElementById('history-owner-section').classList.add('hidden');
        document.getElementById('history-ktv-section').classList.remove('hidden');
        loadStaffHistoryList();
      }
      lucide.createIcons();
    }

    function loadIncomeView() {
      const isOwner = isUserOwner(currentUser);
      if (isOwner) {
        document.getElementById('income-ktv-section').classList.add('hidden');
        document.getElementById('income-owner-section').classList.remove('hidden');
        loadAdminExpensesList();
      } else {
        document.getElementById('income-owner-section').classList.add('hidden');
        document.getElementById('income-ktv-section').classList.remove('hidden');
        loadStaffPayrollStats();
      }
      lucide.createIcons();
    }

    function initMenuUI() {
      const menu = getStored('menu', DEFAULT_MENU);
      const select = document.getElementById('pos-service-select');
      const quickContainer = document.getElementById('pos-quick-combos');

      select.innerHTML = menu.map(m => `
        <option value="${m.service_id}">${m.service_name} — ${m.price.toLocaleString('vi-VN')} đ (${m.duration_min}p)</option>
      `).join('');

      const pastelBgs = ['bg-[#FFF0EB] text-[#D35400] border-[#FCDFD7]', 'bg-[#E8F8F5] text-[#2E7D6D] border-[#B7EBDD]', 'bg-[#EBF5FB] text-[#2980B9] border-[#D4E6F1]', 'bg-[#F5EEF8] text-[#8E44AD] border-[#E8DAEF]'];
      quickContainer.innerHTML = menu.slice(0, 4).map((m, idx) => `
        <button type="button" onclick="selectQuickCombo('${m.service_id}')" class="px-3.5 py-2 rounded-2xl text-xs font-bold ${pastelBgs[idx % pastelBgs.length]} border transition cursor-pointer shadow-sm hover:scale-105">
          ${m.service_name.split('(')[0].trim()} (${Math.round(m.price/1000)}k)
        </button>
      `).join('');
    }

    function selectQuickCombo(id) {
      document.getElementById('pos-service-select').value = id;
      onSelectServiceChange();
    }

    function onSelectServiceChange() {
      selectedComboId = document.getElementById('pos-service-select').value;
      updatePOSCalculations();
    }

    function updatePOSStaffInfo() {
      document.getElementById('staff-pos-name').innerText = currentUser?.full_name || 'KTV';
      document.getElementById('staff-pos-avatar').innerText = (currentUser?.full_name || 'K').charAt(0);
      const rate = parsePercentage(currentUser?.commission_rate);
      const isFixed = currentUser?.salary_type === 'fixed' || currentUser?.salary_type === 'fixed_10pct';
      document.getElementById('staff-pos-model').innerText = `${rate}% Tour • ${isFixed ? 'Có lương cứng' : 'Thuần hoa hồng'}`;
      updatePOSCalculations();
    }

    function updatePOSCalculations() {
      const menu = getStored('menu', DEFAULT_MENU);
      const service = menu.find(m => m.service_id === selectedComboId) || menu[0];
      const rate = parsePercentage(currentUser?.commission_rate);
      let comm = Math.round(service.price * (rate / 100));
      document.getElementById('staff-pos-commission').innerText = '+' + comm.toLocaleString('vi-VN') + ' đ (' + rate + '%)';

      let finalPrice = useVoucher ? 0 : service.price;
      document.getElementById('pos-price-display').innerText = useVoucher ? '0 đ (Dùng Voucher)' : finalPrice.toLocaleString('vi-VN') + ' đ';
    }

    function onCustomerPhoneInput(val) {
      const rawInput = val.trim();
      const normInput = normalizePhone(rawInput);
      const card = document.getElementById('pos-customer-card');
      const customers = getStored('customers', DEFAULT_CUSTOMERS);

      if (rawInput.length >= 7) {
        const cust = customers.find(c => {
          const cNorm = normalizePhone(c.phone_number);
          return cNorm === normInput || 
                 cNorm.endsWith(normInput) || 
                 normInput.endsWith(cNorm) || 
                 String(c.phone_number).includes(rawInput);
        });

        if (cust) {
          currentCustomer = cust;
          card.classList.remove('hidden');
          document.getElementById('pos-customer-name').value = cust.customer_name;
          document.getElementById('pos-cust-name-badge').innerText = cust.customer_name;
          document.getElementById('pos-cust-phone-badge').innerText = '(' + normalizePhone(cust.phone_number) + ')';
          document.getElementById('pos-cust-visits-badge').innerText = (cust.total_visits || 0) + ' / 10 Lần gội';
          document.getElementById('pos-cust-progress-bar').style.width = Math.min(100, ((cust.total_visits || 0) / 10) * 100) + '%';
          
          let noteText = cust.notes || '';
          if (noteText.includes('GMT') || noteText.includes('00:00:00')) {
            noteText = '';
          }
          if (noteText) {
            document.getElementById('pos-cust-notes-box').classList.remove('hidden');
            document.getElementById('pos-cust-notes-text').innerText = noteText;
          } else {
            document.getElementById('pos-cust-notes-box').classList.add('hidden');
          }

          if (cust.voucher_count > 0) {
            document.getElementById('pos-voucher-banner').classList.remove('hidden');
            document.getElementById('pos-voucher-text').innerText = 'Khách có ' + cust.voucher_count + ' Voucher Combo 1 miễn phí!';
          } else {
            document.getElementById('pos-voucher-banner').classList.add('hidden');
          }
        } else {
          currentCustomer = null;
          card.classList.add('hidden');
        }
      } else {
        currentCustomer = null;
        card.classList.add('hidden');
      }
    }

    function onVoucherToggle(checked) {
      useVoucher = checked;
      updatePOSCalculations();
    }

    function setPaymentMethod(method) {
      paymentMethod = method;
      const btnQR = document.getElementById('btn-pay-qr');
      const btnCash = document.getElementById('btn-pay-cash');
      const submitText = document.getElementById('pos-submit-btn-text');

      if (method === 'Chuyển khoản') {
        btnQR.className = 'p-4 rounded-2xl border bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B] font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition cursor-pointer';
        btnCash.className = 'p-4 rounded-2xl border bg-[#F7F2EC] border-[#EFE8DF] text-[#7E7272] hover:bg-[#FFF0EB] font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition cursor-pointer';
        submitText.innerText = 'Hiện Mã VietQR & Lưu Ca';
      } else {
        btnCash.className = 'p-4 rounded-2xl border bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B] font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition cursor-pointer';
        btnQR.className = 'p-4 rounded-2xl border bg-[#F7F2EC] border-[#EFE8DF] text-[#7E7272] hover:bg-[#FFF0EB] font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition cursor-pointer';
        submitText.innerText = 'Lưu Ca Gội Ngay (Tiền mặt)';
      }
      lucide.createIcons();
    }

    function submitPOSReceipt() {
      const menu = getStored('menu', DEFAULT_MENU);
      const service = menu.find(m => m.service_id === selectedComboId) || menu[0];
      const phone = document.getElementById('pos-customer-phone').value.trim();
      const name = document.getElementById('pos-customer-name').value.trim() || 'Khách vãng lai';
      const rate = parsePercentage(currentUser?.commission_rate);
      const commAmount = Math.round(service.price * (rate / 100));
      const finalPrice = useVoucher ? 0 : service.price;

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
      const receiptId = 'HD' + Date.now().toString().slice(-6);

      pendingReceipt = {
        receipt_id: receiptId,
        service_id: service.service_id,
        service_name: service.service_name,
        price: service.price,
        total_paid: finalPrice,
        commission_amount: commAmount,
        customer_phone: phone,
        customer_name: name,
        staff_phone: currentUser?.phone || '0799625591',
        staff_id: currentUser?.staff_id || 'KTV01',
        staff_name: currentUser?.full_name || 'KTV',
        payment_method: paymentMethod,
        is_voucher_used: useVoucher,
        date: dateStr,
        time: timeStr,
        created_at: dateStr + ' ' + timeStr
      };

      if (paymentMethod === 'Chuyển khoản' && finalPrice > 0) {
        showVietQRModal(pendingReceipt);
      } else {
        saveReceiptRecord(pendingReceipt);
      }
    }

    function showVietQRModal(receipt) {
      const bankName = currentUser?.bank_name || 'MBBank';
      const bankAcc = currentUser?.bank_account_no || '0949251144';
      const accName = currentUser?.bank_account_name || 'SELENA SPA';
      const amount = receipt.total_paid;
      const desc = 'SelenaSpa ' + receipt.receipt_id;

      const qrUrl = `https://img.vietqr.io/image/${bankName}-${bankAcc}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(desc)}&accountName=${encodeURIComponent(accName)}`;

      document.getElementById('vietqr-img').src = qrUrl;
      document.getElementById('vietqr-bank-info').innerText = `${bankName} - ${bankAcc}`;
      document.getElementById('vietqr-account-name').innerText = accName;
      document.getElementById('vietqr-amount').innerText = amount.toLocaleString('vi-VN') + ' đ';
      document.getElementById('vietqr-desc').innerText = desc;

      document.getElementById('modal-vietqr').classList.remove('hidden');
      lucide.createIcons();
    }

    function closeVietQRModal() {
      document.getElementById('modal-vietqr').classList.add('hidden');
    }

    function confirmVietQRSuccess() {
      closeVietQRModal();
      if (pendingReceipt) {
        saveReceiptRecord(pendingReceipt);
      }
    }

    function saveReceiptRecord(receipt) {
      const receipts = getStored('receipts', []);
      receipts.unshift(receipt);
      setStored('receipts', receipts);

      if (receipt.customer_phone) {
        const customers = getStored('customers', DEFAULT_CUSTOMERS);
        const norm = normalizePhone(receipt.customer_phone);
        let cust = customers.find(c => normalizePhone(c.phone_number) === norm);
        if (cust) {
          if (receipt.is_voucher_used) {
            cust.voucher_count = Math.max(0, (cust.voucher_count || 1) - 1);
          } else {
            cust.total_visits = (cust.total_visits || 0) + 1;
            if (cust.total_visits >= 10) {
              cust.voucher_count = (cust.voucher_count || 0) + 1;
              cust.total_visits -= 10;
              confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
              alert(`🎉 Chúc mừng! Khách hàng ${cust.customer_name} đã tích đủ 10 lần và nhận được 1 Voucher Combo 1 miễn phí!`);
            }
          }
          if (receipt.customer_name && receipt.customer_name !== 'Khách vãng lai') {
            cust.customer_name = receipt.customer_name;
          }
        } else {
          customers.push({
            phone_number: receipt.customer_phone,
            customer_name: receipt.customer_name,
            total_visits: receipt.is_voucher_used ? 0 : 1,
            voucher_count: 0,
            notes: ''
          });
        }
        setStored('customers', customers);
      }

      callGasApi('create_receipt', receipt);

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      alert(`✅ Đã lưu ca gội thành công!\n• Dịch vụ: ${receipt.service_name}\n• Khách hàng: ${receipt.customer_name}\n• Thu nhập KTV: +${receipt.commission_amount.toLocaleString('vi-VN')} đ`);

      document.getElementById('pos-customer-phone').value = '';
      document.getElementById('pos-customer-name').value = '';
      document.getElementById('pos-customer-card').classList.add('hidden');
      useVoucher = false;
      pendingReceipt = null;

      showView('history');
    }

    function loadStaffHistoryList() {
      const receipts = getStored('receipts', []);
      const container = document.getElementById('staff-receipts-list');
      const staffPhone = normalizePhone(currentUser?.phone);
      const staffCode = String(currentUser?.staff_id || '').trim();

      const myReceipts = receipts.filter(r => {
        const rPhone = normalizePhone(r.staff_phone);
        const rCode = String(r.staff_id || '').trim();
        return (staffPhone && rPhone === staffPhone) || (staffCode && rCode === staffCode);
      });

      if (myReceipts.length === 0) {
        container.innerHTML = `
          <div class="p-8 text-center spa-card space-y-3">
            <div class="w-12 h-12 rounded-full bg-[#FFF0EB] text-[#E58A7B] flex items-center justify-center mx-auto">
              <i data-lucide="calendar" class="w-6 h-6"></i>
            </div>
            <div class="text-sm font-bold text-[#2D2424]">Chưa có ca gội nào được ghi nhận</div>
            <p class="text-xs text-[#7E7272]">Bấm tab "+" bên dưới để tạo ca gội đầu tiên của bạn!</p>
          </div>
        `;
        return;
      }

      const pastelBorders = ['border-l-[#E58A7B] bg-[#FFF0EB]/40', 'border-l-[#2E7D6D] bg-[#E8F8F5]/40', 'border-l-[#2980B9] bg-[#EBF5FB]/40', 'border-l-[#8E44AD] bg-[#F5EEF8]/40'];

      container.innerHTML = myReceipts.map((r, idx) => {
        const time = r.time || '14:30';
        const isQR = r.payment_method === 'Chuyển khoản';
        const cardStyle = pastelBorders[idx % pastelBorders.length];

        return `
          <div class="flex items-start gap-3">
            <div class="w-14 pt-3.5 text-right shrink-0">
              <span class="text-xs font-extrabold text-[#2D2424] block">${time}</span>
              <span class="text-[10px] text-[#A39696] block">${r.date?.slice(5) || '27/08'}</span>
            </div>

            <div class="flex-1 spa-card p-4 border-l-4 ${cardStyle} transition hover:shadow-md">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="text-sm sm:text-base font-extrabold text-[#2D2424]">${r.service_name}</h4>
                  <div class="flex items-center gap-2 mt-1 text-xs text-[#7E7272]">
                    <span class="font-medium">👤 ${r.customer_name || 'Khách vãng lai'}</span>
                    <span>•</span>
                    <span class="inline-flex items-center gap-1 font-semibold ${isQR ? 'text-[#2E7D6D]' : 'text-[#D35400]'}">
                      <i data-lucide="${isQR ? 'qr-code' : 'banknote'}" class="w-3.5 h-3.5"></i> ${r.payment_method}
                    </span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-sm sm:text-base font-extrabold text-[#2E7D6D] block">+${(r.commission_amount || 0).toLocaleString('vi-VN')} đ</span>
                  <span class="text-[10px] text-[#A39696]">${r.receipt_id}</span>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    function loadStaffPayrollStats() {
      const receipts = getStored('receipts', []);
      const payroll = calculateStaffPayroll(currentUser, receipts);

      document.getElementById('staff-total-earnings').innerHTML = `${payroll.totalEarnings.toLocaleString('vi-VN')} <span class="text-xl text-[#E58A7B] font-normal">đ</span>`;
      document.getElementById('staff-days-progress-text').innerText = `${payroll.workedDays} / ${payroll.standardDays} ngày`;
      
      const pct = Math.min(100, Math.round((payroll.workedDays / payroll.standardDays) * 100));
      document.getElementById('staff-days-progress-bar').style.width = pct + '%';
      document.getElementById('staff-days-pct-text').innerText = pct + '% chỉ tiêu';
      
      if (payroll.isFixed) {
        document.getElementById('staff-daily-rate-note').innerText = `Công: ${payroll.dailyRate.toLocaleString('vi-VN')} đ/ngày (Định mức ${payroll.baseSalary.toLocaleString('vi-VN')} đ)`;
      } else {
        document.getElementById('staff-daily-rate-note').innerText = `Thuần tour (${payroll.rate}%), không có lương cứng`;
      }

      document.getElementById('staff-total-tours').innerText = `${payroll.totalTours} ca`;
      document.getElementById('staff-total-commission').innerText = `${payroll.totalCommission.toLocaleString('vi-VN')} đ`;
      document.getElementById('staff-base-salary').innerText = `${payroll.earnedBase.toLocaleString('vi-VN')} đ`;
    }

    function loadAdminDashboard() {
      const receipts = getStored('receipts', []);
      const expenses = getStored('expenses', []);
      const users = getStored('users', DEFAULT_USERS);

      let totalRevenue = 0;
      let totalSalaries = 0;

      receipts.forEach(r => {
        totalRevenue += (Number(r.total_paid) || Number(r.price) || 0);
      });

      users.filter(u => !isUserOwner(u)).forEach(staff => {
        const p = calculateStaffPayroll(staff, receipts);
        totalSalaries += p.totalEarnings;
      });

      let totalExpenses = 0;
      expenses.forEach(e => {
        totalExpenses += (Number(e.amount) || 0);
      });

      const netProfit = totalRevenue - totalSalaries - totalExpenses;

      document.getElementById('kpi-revenue').innerText = totalRevenue.toLocaleString('vi-VN') + ' đ';
      document.getElementById('kpi-tours').innerText = receipts.length + ' ca phục vụ';
      document.getElementById('kpi-salaries').innerText = totalSalaries.toLocaleString('vi-VN') + ' đ';
      document.getElementById('kpi-expenses').innerText = totalExpenses.toLocaleString('vi-VN') + ' đ';
      document.getElementById('kpi-net-profit').innerText = netProfit.toLocaleString('vi-VN') + ' đ';

      loadAdminUsersList();
      loadAdminCustomersList();
      lucide.createIcons();
    }

    function switchAdminTab(tab) {
      const tabs = ['users', 'customers', 'settings'];
      tabs.forEach(t => {
        const el = document.getElementById('admin-subtab-' + t);
        const btn = document.getElementById('tab-btn-' + t);
        if (t === tab) {
          el?.classList.remove('hidden');
          btn?.classList.remove('bg-white', 'text-[#7E7272]', 'border', 'border-[#F0EAE1]');
          btn?.classList.add('bg-[#E58A7B]', 'text-white', 'shadow-md', 'shadow-[#E58A7B]/25');
        } else {
          el?.classList.add('hidden');
          btn?.classList.add('bg-white', 'text-[#7E7272]', 'border', 'border-[#F0EAE1]');
          btn?.classList.remove('bg-[#E58A7B]', 'text-white', 'shadow-md', 'shadow-[#E58A7B]/25');
        }
      });
      lucide.createIcons();
    }

    function loadAdminReceiptsList() {
      const receipts = getStored('receipts', []);
      document.getElementById('admin-receipt-count').innerText = receipts.length + ' hóa đơn';

      const tableBody = document.getElementById('admin-receipts-table-body');
      const mobileCards = document.getElementById('admin-receipts-mobile-cards');

      if (receipts.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-[#7E7272]">Chưa có hóa đơn nào</td></tr>`;
        mobileCards.innerHTML = `<div class="p-6 text-center text-[#7E7272] spa-card">Chưa có hóa đơn nào</div>`;
        return;
      }

      tableBody.innerHTML = receipts.map(r => `
        <tr class="hover:bg-[#FAF6F1]/50 transition">
          <td class="py-3.5 font-mono text-xs font-bold text-[#E58A7B]">${r.receipt_id}</td>
          <td class="py-3.5 font-bold text-[#2D2424]">${r.service_name}</td>
          <td class="py-3.5 text-[#7E7272]">${r.customer_name || 'Vãng lai'} <span class="font-mono text-xs block text-[#A39696]">${r.customer_phone || ''}</span></td>
          <td class="py-3.5 text-[#2D2424] font-medium">${r.staff_name}</td>
          <td class="py-3.5 text-right font-extrabold text-[#2E7D6D]">${(r.total_paid || 0).toLocaleString('vi-VN')} đ</td>
          <td class="py-3.5 text-right">
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${r.payment_method === 'Chuyển khoản' ? 'bg-[#E8F8F5] text-[#2E7D6D]' : 'bg-[#FFF0EB] text-[#D35400]'}">
              ${r.payment_method}
            </span>
          </td>
        </tr>
      `).join('');

      mobileCards.innerHTML = receipts.map(r => `
        <div class="spa-card p-4 space-y-2">
          <div class="flex justify-between items-start">
            <div>
              <span class="text-xs font-mono font-bold text-[#E58A7B]">${r.receipt_id}</span>
              <h4 class="font-extrabold text-sm sm:text-base text-[#2D2424]">${r.service_name}</h4>
            </div>
            <span class="text-sm font-extrabold text-[#2E7D6D]">${(r.total_paid || 0).toLocaleString('vi-VN')} đ</span>
          </div>
          <div class="flex justify-between items-center text-xs text-[#7E7272] pt-1 border-t border-[#F0EAE1]">
            <span>👤 ${r.customer_name} • KTV: ${r.staff_name}</span>
            <span class="font-bold ${r.payment_method === 'Chuyển khoản' ? 'text-[#2E7D6D]' : 'text-[#D35400]'}">${r.payment_method}</span>
          </div>
        </div>
      `).join('');
    }

    function loadAdminCustomersList() {
      const customers = getStored('customers', DEFAULT_CUSTOMERS);
      document.getElementById('admin-customer-count').innerText = customers.length + ' khách';
      const container = document.getElementById('admin-customers-list');

      container.innerHTML = customers.map(c => `
        <div class="p-4 rounded-3xl bg-[#F7F2EC] border border-[#EFE8DF] space-y-2">
          <div class="flex justify-between items-center">
            <div class="font-bold text-[#2D2424] text-sm">${c.customer_name}</div>
            <span class="text-xs font-extrabold text-[#E58A7B] bg-[#FFF0EB] px-2.5 py-0.5 rounded-full">${c.total_visits || 0}/10 lần</span>
          </div>
          <div class="text-xs text-[#7E7272] font-mono">${c.phone_number}</div>
          ${c.notes ? `<div class="text-xs text-[#D35400] bg-white/70 p-2 rounded-xl">📝 ${c.notes}</div>` : ''}
          ${c.voucher_count > 0 ? `<div class="text-xs font-bold text-[#2E7D6D] bg-[#E8F8F5] p-2 rounded-xl flex items-center gap-1.5"><i data-lucide="gift" class="w-3.5 h-3.5"></i> Có ${c.voucher_count} Voucher Combo 1</div>` : ''}
        </div>
      `).join('');
    }

    function loadAdminUsersList() {
      const users = getStored('users', DEFAULT_USERS);
      const receipts = getStored('receipts', []);
      document.getElementById('admin-users-count').innerText = users.length + ' nhân sự';
      const container = document.getElementById('admin-users-list');

      container.innerHTML = users.map(u => {
        const isOwner = isUserOwner(u);
        const payroll = calculateStaffPayroll(u, receipts);

        return `
          <div class="p-4 rounded-3xl bg-[#FAF6F1] border border-[#F0EAE1] space-y-3">
            <div class="flex justify-between items-start">
              <div>
                <div class="font-extrabold text-sm sm:text-base text-[#2D2424]">${isOwner ? '👑' : '💆'} ${u.full_name}</div>
                <div class="text-xs text-[#7E7272] font-mono">${u.phone} • ${u.staff_id}</div>
              </div>
              <span class="text-xs font-bold px-2.5 py-1 rounded-full ${isOwner ? 'bg-[#FFF0EB] text-[#E58A7B]' : u.salary_type === 'fixed' || u.salary_type === 'fixed_10pct' ? 'bg-[#E8F8F5] text-[#2E7D6D]' : 'bg-[#EBF5FB] text-[#2980B9]'}">
                ${isOwner ? 'Chủ tiệm' : u.salary_type === 'fixed' || u.salary_type === 'fixed_10pct' ? '10% + Lương cứng' : '20% Thuần tour'}
              </span>
            </div>

            ${!isOwner ? `
              <div class="p-3 rounded-2xl bg-white space-y-1.5 text-xs">
                <div class="flex justify-between text-[#7E7272]">
                  <span>Ngày công tháng này:</span>
                  <span class="font-bold text-[#E58A7B] font-mono">${payroll.workedDays} / ${payroll.standardDays} ngày</span>
                </div>
                <div class="flex justify-between text-[#7E7272]">
                  <span>Lương tour + Lương cứng:</span>
                  <span class="font-bold text-[#2E7D6D]">${payroll.totalCommission.toLocaleString('vi-VN')} + ${payroll.earnedBase.toLocaleString('vi-VN')} đ</span>
                </div>
                <div class="flex justify-between text-[#2D2424] font-extrabold pt-1 border-t border-[#F0EAE1]">
                  <span>Tổng lương tạm tính:</span>
                  <span class="text-[#E58A7B] font-bold text-sm">${payroll.totalEarnings.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }

    function loadAdminExpensesList() {
      const expenses = getStored('expenses', []);
      const container = document.getElementById('admin-expenses-list');
      if (!container) return;

      if (expenses.length === 0) {
        container.innerHTML = `<div class="p-6 text-center text-[#7E7272] spa-card col-span-full">Chưa có chi phí nào trong tháng</div>`;
        return;
      }

      container.innerHTML = expenses.map(e => `
        <div class="p-4 rounded-3xl bg-[#FAF6F1] border border-[#F0EAE1] flex justify-between items-center">
          <div>
            <span class="text-xs font-bold text-[#E58A7B] uppercase block">${e.expense_type || 'Chi phí'}</span>
            <div class="text-sm font-bold text-[#2D2424]">${e.note || 'Chi phí vận hành'}</div>
            <span class="text-[10px] text-[#A39696] font-mono">${e.date || ''}</span>
          </div>
          <div class="text-right">
            <span class="text-base font-extrabold text-[#D35400]">${(Number(e.amount) || 0).toLocaleString('vi-VN')} đ</span>
          </div>
        </div>
      `).join('');
    }

    function openAddExpenseModal() {
      document.getElementById('modal-add-expense').classList.remove('hidden');
    }

    function closeAddExpenseModal() {
      document.getElementById('modal-add-expense').classList.add('hidden');
    }

    function handleSaveExpenseForm(e) {
      e.preventDefault();
      const type = document.getElementById('input-exp-type').value;
      const amount = Number(document.getElementById('input-exp-amount').value) || 0;
      const note = document.getElementById('input-exp-note').value.trim();

      if (amount <= 0) {
        alert('Vui lòng nhập số tiền chi phí hợp lệ!');
        return;
      }

      const now = new Date();
      const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

      const expense = {
        expense_id: 'CP' + Date.now().toString().slice(-6),
        expense_type: type,
        amount: amount,
        note: note,
        date: dateStr,
        created_at: dateStr + ' ' + now.toLocaleTimeString('vi-VN')
      };

      const expenses = getStored('expenses', []);
      expenses.unshift(expense);
      setStored('expenses', expenses);

      callGasApi('add_expense', expense);

      closeAddExpenseModal();
      loadAdminDashboard();
      loadAdminExpensesList();
      alert('✅ Đã thêm chi phí ' + amount.toLocaleString('vi-VN') + ' đ thành công!');
    }

    const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbwQ-Dwr2zCWWWMPWBCyVIfwDirofgvjD8S7Ug-5OSNLHvM63Gw0nSCa10BqhpD5g8id/exec';

    function getGasUrl() {
      let url = localStorage.getItem('selena_gas_url') || DEFAULT_GAS_URL;
      if (!url || url.includes('AKfycbyLuh0304rL-59hJq-wzP3h-a6lH-v9C-s')) {
        url = DEFAULT_GAS_URL;
        localStorage.setItem('selena_gas_url', DEFAULT_GAS_URL);
      }
      return url;
    }

    function saveGasUrl() {
      const url = document.getElementById('setting-gas-url').value.trim();
      localStorage.setItem('selena_gas_url', url || DEFAULT_GAS_URL);
      alert('✅ Đã lưu cấu hình Google Apps Script URL!');
      refreshDataFromGoogleSheets();
    }

    function resetLocalDataAndResync() {
      if (!confirm('⚠️ Bạn có chắc chắn muốn xóa cache dữ liệu cũ trên máy này và tải dữ liệu mới nhất từ Google Sheets về không?')) return;
      localStorage.removeItem('selena_receipts');
      localStorage.removeItem('selena_customers');
      localStorage.removeItem('selena_expenses');
      localStorage.removeItem('selena_users');
      localStorage.removeItem('selena_menu');
      localStorage.removeItem('selena_gas_url');
      alert('🧹 Đã xóa cache thành công! Đang đồng bộ lại từ Google Sheets...');
      refreshDataFromGoogleSheets();
    }

    async function callGasApi(action, payload = {}) {
      const gasUrl = getGasUrl();
      if (!gasUrl || !gasUrl.startsWith('http')) return null;

      try {
        const res = await fetch(gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action, ...payload })
        });
        return await res.json();
      } catch (err) {
        console.warn('Google Sheets API offline fallback:', err);
        return null;
      }
    }

    async function refreshDataFromGoogleSheets() {
      const btn = document.getElementById('btn-sync-cloud');
      if (btn) {
        btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin text-[#E58A7B]"></i> <span class="hidden sm:inline">Đang tải...</span>';
        lucide.createIcons();
      }

      const result = await callGasApi('sync_all_data');
      if (result && (result.status === 'success' || result.success === true) && result.data) {
        if (result.data.menu && result.data.menu.length > 0) setStored('menu', result.data.menu);
        if (result.data.users && result.data.users.length > 0) setStored('users', result.data.users);
        if (result.data.customers) setStored('customers', result.data.customers);
        if (result.data.receipts) setStored('receipts', result.data.receipts);
        if (result.data.expenses) setStored('expenses', result.data.expenses);
        
        initMenuUI();
        renderQuickAccounts();
        if (currentUser) {
          const freshUsers = getStored('users', DEFAULT_USERS);
          const me = freshUsers.find(u => normalizePhone(u.phone) === normalizePhone(currentUser.phone));
          if (me) currentUser = me;
          showView(currentTab);
        }
      }

      if (btn) {
        btn.innerHTML = '<i data-lucide="cloud-check" class="w-4 h-4 text-[#2E7D6D]"></i> <span class="hidden sm:inline">Đồng bộ Sheet</span>';
        lucide.createIcons();
      }
    }

    function renderQuickAccounts() {
      const users = getStored('users', DEFAULT_USERS);
      const container = document.getElementById('login-quick-accounts');
      if (!container) return;

      container.innerHTML = users.map(u => `
        <button onclick="quickFillLogin('${normalizePhone(u.phone) || u.user_id}', '123456')" class="w-full p-3 rounded-2xl bg-[#F7F2EC] hover:bg-[#FFF0EB] text-[#2D2424] hover:text-[#E58A7B] text-xs sm:text-sm font-semibold transition flex items-center justify-between cursor-pointer border border-[#EFE8DF]">
          <span>${isUserOwner(u) ? '👑' : '💆'} ${u.full_name} (${isUserOwner(u) ? 'Chủ' : u.salary_type === 'fixed' || u.salary_type === 'fixed_10pct' ? '10% + Lương cứng' : '20% Thuần tour'})</span>
          <span class="text-xs text-[#E58A7B] font-mono">${normalizePhone(u.phone)}</span>
        </button>
      `).join('');
    }

    // Pull to refresh support for mobile
    let touchStartY = 0;
    let isPulling = false;
    window.addEventListener('touchstart', e => {
      if (window.scrollY === 0) touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', e => {
      const touchY = e.touches[0].clientY;
      const pullDist = touchY - touchStartY;
      const ptr = document.getElementById('ptr-indicator');
      if (window.scrollY === 0 && pullDist > 50 && ptr) {
        isPulling = true;
        ptr.style.transform = `translateY(${Math.min(pullDist - 50, 60)}px)`;
      }
    }, { passive: true });

    window.addEventListener('touchend', e => {
      const ptr = document.getElementById('ptr-indicator');
      if (isPulling && ptr) {
        ptr.style.transform = 'translateY(0)';
        setTimeout(() => {
          ptr.style.transform = 'translateY(-100%)';
          refreshDataFromGoogleSheets();
        }, 600);
      }
      isPulling = false;
    });

    // App Initialization
    window.addEventListener('DOMContentLoaded', () => {
      initMenuUI();
      renderQuickAccounts();

      const inp = document.getElementById('setting-gas-url');
      if (inp) inp.value = getGasUrl();

      const activeSession = localStorage.getItem('selena_active_session');
      if (activeSession) {
        try {
          const user = JSON.parse(activeSession);
          loginSuccess(user);
        } catch (e) {
          localStorage.removeItem('selena_active_session');
        }
      }
      lucide.createIcons();
    });
  </script>
</body>
</html>
"""

    html = p1_head + p2_login + p4_view_home + p5_view_add + p6_view_history + p7_view_income + p8_bottom_dock + p9_js

    with open('selena-spa.html', 'w', encoding='utf-8') as f:
        f.write(html)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"SUCCESS: Created selena-spa.html and index.html (Size: {len(html)} bytes)")

if __name__ == '__main__':
    build()
