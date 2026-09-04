// =============================================================
// AUTHENTICATION & ROLE-BASED ACCESS CONTROL
// =============================================================
function isUserOwner(u) {
  if (!u) return false;
  const role = String(u.role || '').toLowerCase();
  const phone = normalizePhone(u.phone);
  return (role === 'admin' || role === 'chủ tiệm' || role === 'chủ sáng lập' || role === 'owner' || phone === '0949251144');
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
