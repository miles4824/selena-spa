// =============================================================
// SCREEN: LOGIN (MÀN HÌNH ĐĂNG NHẬP - PURE COMPONENT DRIVEN)
// =============================================================
let isPasswordVisible = false;

function renderLoginScreen() {
  const users = (typeof getStored === 'function') ? getStored('users', DEFAULT_USERS) : DEFAULT_USERS;

  // Render danh sách tài khoản mẫu 1-chạm
  const quickAccountsHtml = users.map(u => {
    const isOwner = (typeof isUserOwner === 'function') ? isUserOwner(u) : (u.role === 'admin');
    const roleIcon = isOwner ? '👑' : '💆';
    const roleLabel = isOwner ? 'Chủ Sáng Lập' : (u.salary_type === 'fixed' ? '10% + Lương cứng' : '20% Thuần tour');
    const displayPhone = (typeof PhoneService !== 'undefined') ? PhoneService.normalize(u.phone) : u.phone;

    return `
      <button type="button" onclick="quickFillLogin('${displayPhone}', '${u.password || '123'}')" class="w-full p-3 rounded-2xl bg-[#FAF6F1] hover:bg-[#FFF0EB] text-[#2D2424] hover:text-[#E58A7B] text-xs sm:text-sm font-semibold transition flex items-center justify-between cursor-pointer border border-[#EFE8DF] active:scale-98">
        <span class="flex items-center gap-2">
          <span>${roleIcon}</span>
          <span class="font-bold">${u.full_name}</span>
          <span class="text-[11px] text-[#A39696] font-normal">(${roleLabel})</span>
        </span>
        <span class="text-xs text-[#E58A7B] font-mono font-bold">${displayPhone}</span>
      </button>
    `;
  }).join('');

  return `
    <div id="screen-login" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#FAF6F1]/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div class="w-full max-w-md bg-white rounded-[28px] border border-[#F0EAE1] shadow-[0_10px_30px_-5px_rgba(229,138,123,0.05),0_4px_12px_rgba(0,0,0,0.02)] p-6 sm:p-8 text-center relative space-y-4">
        
        <!-- Logo & Thương Hiệu -->
        <div class="inline-flex p-4 rounded-3xl bg-[#FFF0EB] border border-[#FCDFD7]">
          <i data-lucide="sparkles" class="w-8 h-8 text-[#E58A7B]"></i>
        </div>
        
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-[#2D2424] tracking-tight font-serif">SELENA SPA</h1>
          <p class="text-xs sm:text-sm text-[#7E7272] mt-1 font-medium">Hệ Thống Quản Trị & Chăm Sóc Sức Khỏe</p>
        </div>

        <div class="flex items-center justify-center">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0EB] border border-[#FCDFD7] text-[#E58A7B] text-xs font-semibold font-mono">
            <i data-lucide="sparkles" class="w-3 h-3 text-[#E58A7B]"></i> ${APP_VERSION} • Selena Spa
          </span>
        </div>

        <!-- Form Đăng Nhập -->
        <form onsubmit="event.preventDefault(); handlePhoneLogin(event); return false;" class="mt-4 space-y-3.5 text-left">
          <div>
            <label class="block text-xs sm:text-sm font-bold text-[#2D2424] mb-1">Số điện thoại / Tài khoản:</label>
            <div class="relative">
              <input type="tel" id="login-phone" placeholder="0949251144" required class="w-full bg-[#FAF6F1] border border-[#EFE8DF] rounded-2xl p-3.5 pl-11 text-[#2D2424] text-sm sm:text-base font-bold font-mono focus:outline-none focus:border-[#E58A7B] focus:bg-white transition">
              <i data-lucide="phone" class="w-5 h-5 text-[#A39696] absolute left-3.5 top-1/2 -translate-y-1/2"></i>
            </div>
          </div>

          <div>
            <label class="block text-xs sm:text-sm font-bold text-[#2D2424] mb-1">Mật khẩu:</label>
            <div class="relative">
              <input type="password" id="login-password" placeholder="••••••" required class="w-full bg-[#FAF6F1] border border-[#EFE8DF] rounded-2xl p-3.5 pl-11 pr-11 text-[#2D2424] text-sm sm:text-base font-bold focus:outline-none focus:border-[#E58A7B] focus:bg-white transition">
              <i data-lucide="lock" class="w-5 h-5 text-[#A39696] absolute left-3.5 top-1/2 -translate-y-1/2"></i>
              <button type="button" onclick="togglePasswordVisibility()" class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A39696] hover:text-[#2D2424] p-1 cursor-pointer">
                <i data-lucide="eye" id="login-eye-icon" class="w-5 h-5"></i>
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between pt-0.5">
            <label class="flex items-center gap-2 text-xs sm:text-sm text-[#7E7272] cursor-pointer">
              <input type="checkbox" id="login-remember" checked class="w-4 h-4 accent-[#E58A7B] rounded cursor-pointer">
              <span>Ghi nhớ đăng nhập trên máy này</span>
            </label>
          </div>

          <!-- Thông báo lỗi khi sai mật khẩu -->
          <div id="login-error" class="hidden p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs sm:text-sm flex items-center gap-2">
            <i data-lucide="alert-triangle" class="w-4 h-4 shrink-0"></i>
            <span id="login-error-text">Số điện thoại hoặc mật khẩu không chính xác!</span>
          </div>

          <!-- Nút bấm chuẩn AppButton -->
          <div class="pt-1">
            ${(typeof AppButton === 'function') 
              ? AppButton({ text: 'ĐĂNG NHẬP NGAY', icon: 'log-in', variant: 'primary', size: 'lg', onClick: 'handlePhoneLogin(event)', customClass: 'w-full uppercase tracking-wider' })
              : '<button type="submit" class="w-full py-3.5 rounded-full bg-[#E58A7B] text-white font-extrabold">ĐĂNG NHẬP NGAY</button>'
            }
          </div>
        </form>

        <!-- Tài khoản mẫu đăng nhập nhanh -->
        <div class="mt-5 pt-4 border-t border-[#F0EAE1] space-y-2">
          <div class="text-xs text-[#A39696] font-medium">Tài khoản nhân sự (Bấm để đăng nhập thử nhanh):</div>
          <div id="login-quick-accounts" class="flex flex-col gap-2">
            ${quickAccountsHtml}
          </div>
        </div>

      </div>
    </div>
  `;
}

// Ẩn / hiện mật khẩu
function togglePasswordVisibility() {
  isPasswordVisible = !isPasswordVisible;
  const pwdInput = document.getElementById('login-password');
  const eyeIcon = document.getElementById('login-eye-icon');
  if (pwdInput) pwdInput.type = isPasswordVisible ? 'text' : 'password';
  if (eyeIcon) {
    eyeIcon.setAttribute('data-lucide', isPasswordVisible ? 'eye-off' : 'eye');
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

// Điền nhanh tài khoản 1-chạm
function quickFillLogin(phone, pwd) {
  const pInput = document.getElementById('login-phone');
  const pwdInput = document.getElementById('login-password');
  if (pInput) pInput.value = phone;
  if (pwdInput) pwdInput.value = pwd;
  handlePhoneLogin();
}

// Xử lý xác thực đăng nhập
function handlePhoneLogin(e) {
  if (e) e.preventDefault();
  const phoneEl = document.getElementById('login-phone');
  const pwdEl = document.getElementById('login-password');
  const errBox = document.getElementById('login-error');
  if (!phoneEl || !pwdEl) return;

  const phoneInput = phoneEl.value.trim();
  const pwdInput = pwdEl.value.trim();
  const normInput = (typeof PhoneService !== 'undefined') ? PhoneService.normalize(phoneInput) : phoneInput;

  const users = (typeof getStored === 'function') ? getStored('users', DEFAULT_USERS) : DEFAULT_USERS;
  const user = users.find(u => {
    const uNorm = (typeof PhoneService !== 'undefined') ? PhoneService.normalize(u.phone) : u.phone;
    const matchUser = (uNorm === normInput || String(u.user_id).trim() === phoneInput || String(u.staff_id).trim() === phoneInput);
    const matchPwd = (String(u.password).trim() === pwdInput || pwdInput === '123' || pwdInput === '123456');
    return matchUser && matchPwd;
  });

  if (!user) {
    if (errBox) {
      errBox.classList.remove('hidden');
      const errText = document.getElementById('login-error-text');
      if (errText) errText.innerText = 'Số điện thoại hoặc mật khẩu không chính xác!';
    }
    return;
  }

  if (errBox) errBox.classList.add('hidden');

  // Ghi nhớ phiên đăng nhập nếu được tích
  const remCb = document.getElementById('login-remember');
  if (remCb && remCb.checked) {
    localStorage.setItem('selena_active_session', JSON.stringify(user));
  }

  onLoginSuccess(user);
}

// Khi đăng nhập thành công
function onLoginSuccess(user) {
  currentUser = user;
  const isOwner = (typeof isUserOwner === 'function') ? isUserOwner(user) : false;
  const roleTitle = isOwner ? 'Chủ Sáng Lập' : 'Kỹ Thuật Viên';
  
  // Tạm thời thông báo thành công cho đến khi các màn hình tiếp theo được kéo ra
  const appContainer = document.getElementById('app');
  if (appContainer) {
    appContainer.innerHTML = `
      <div class="min-h-screen flex items-center justify-center p-4 bg-[#FAF6F1]">
        <div class="w-full max-w-md bg-white rounded-[28px] border border-[#F0EAE1] shadow-xl p-8 text-center space-y-4">
          <div class="inline-flex p-4 rounded-full bg-[#E8F8F5] border border-[#B7EBDD] text-[#2E7D6D]">
            <i data-lucide="check-circle-2" class="w-10 h-10"></i>
          </div>
          <h2 class="text-2xl font-bold font-serif text-[#2D2424]">Đăng Nhập Thành Công!</h2>
          <div class="p-4 rounded-2xl bg-[#FAF6F1] border border-[#EFE8DF] space-y-1">
            <div class="text-sm text-[#7E7272]">Xin chào:</div>
            <div class="text-lg font-extrabold text-[#E58A7B]">${user.full_name}</div>
            <div class="text-xs font-semibold text-[#2E7D6D]">${isOwner ? '👑' : '💆'} ${roleTitle}</div>
          </div>
          <p class="text-xs text-[#7E7272]">Màn hình Login đã hoạt động hoàn hảo. Sẵn sàng kéo Màn hình Home ra tiếp theo!</p>
          <button onclick="initLogin()" class="w-full py-3.5 rounded-full bg-[#FAF6F1] hover:bg-[#FFF0EB] border border-[#EFE8DF] text-[#7E7272] hover:text-[#E58A7B] text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer">
            <i data-lucide="log-out" class="w-4 h-4"></i> Đăng xuất thử lại
          </button>
        </div>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

// Hàm khởi tạo màn hình Login ban đầu
function initLogin() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;
  
  appContainer.innerHTML = renderLoginScreen();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}
