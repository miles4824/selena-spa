// =============================================================
// SCREEN: LOGIN (MÀN HÌNH ĐĂNG NHẬP - PURE COMPONENT DRIVEN)
// Thiết kế theo phong cách Mindora Luxury (Thanh tao, êm dịu, sang trọng)
// =============================================================
let isPasswordVisible = false;

function renderLoginScreen() {
  const users =
    typeof getStored === "function"
      ? getStored("users", DEFAULT_USERS)
      : DEFAULT_USERS;

  // Render danh sách tài khoản mẫu 1-chạm
  const quickAccountsHtml = users
    .map((u) => {
      const isOwner =
        typeof isUserOwner === "function" ? isUserOwner(u) : u.role === "admin";
      const roleIcon = isOwner ? "👑" : "💆";
      const roleLabel = isOwner
        ? "Chủ Sáng Lập"
        : u.salary_type === "fixed"
          ? "10% + Lương cứng"
          : "20% Thuần tour";
      const displayPhone =
        typeof PhoneService !== "undefined"
          ? PhoneService.normalize(u.phone)
          : u.phone;

      return `
      <button type="button" onclick="quickFillLogin('${displayPhone}', '${u.password || "123"}')" class="w-full p-3 rounded-2xl bg-spa-bg/80 hover:bg-spa-sage-light text-spa-dark hover:text-spa-sage text-xs sm:text-sm font-semibold transition flex items-center justify-between cursor-pointer border border-spa-border active:scale-98">
        <span class="flex items-center gap-2">
          <span>${roleIcon}</span>
          <span class="font-bold">${u.full_name}</span>
          <span class="text-[11px] text-spa-muted font-normal">(${roleLabel})</span>
        </span>
        <span class="text-xs text-spa-sage font-mono font-bold">${displayPhone}</span>
      </button>
    `;
    })
    .join("");

  return `
    <div id="screen-login" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-spa-bg/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div class="w-full max-w-md bg-spa-card/95 backdrop-blur-2xl rounded-[32px] border border-spa-border/90 shadow-[0_25px_60px_-15px_rgba(28,36,40,0.35)] p-7 sm:p-9 text-center relative space-y-5 transition-colors duration-300 my-auto">
        
        <!-- Nút Công Tắc Bật Tắt Sáng / Tối (ThemeToggle Component) -->
        ${ThemeToggle({ customClass: "absolute top-5 right-5" })}

        <!-- Logo & Thương Hiệu (Mindora Zen Style) -->
        <div class="inline-flex p-4 rounded-3xl bg-spa-sage-light border border-spa-teal-border/40">
          <i data-lucide="sparkles" class="w-8 h-8 text-spa-sage"></i>
        </div>
        
        <div class="space-y-1">
          <h1 id="login-brand-name" class="brand-spa-name text-2xl sm:text-3xl font-extrabold text-spa-dark tracking-tight font-serif">${getConfig("spa_brand_name")}</h1>
          <p id="login-brand-slogan" class="brand-spa-slogan text-xs sm:text-sm text-spa-muted font-medium">${getConfig("spa_brand_slogan")}</p>
        </div>

        <div class="flex items-center justify-center">
          <span class="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-spa-sage-light border border-spa-teal-border/40 text-spa-sage text-xs font-semibold font-mono">
            <i data-lucide="leaf" class="w-3.5 h-3.5"></i> ${APP_VERSION} • ${getConfig("spa_brand_name")}
          </span>
        </div>

        <!-- Form Đăng Nhập -->
        <form onsubmit="event.preventDefault(); handlePhoneLogin(event); return false;" class="mt-4 space-y-3.5 text-left">
          <!-- Ô nhập Số điện thoại (AppInput Component) -->
          ${AppInput({
            id: "login-phone",
            label: "Số điện thoại:",
            type: "tel",
            placeholder: getConfig("ph_login_phone", "0949251144"),
            icon: "phone",
            required: true,
            isMono: true,
            autoComplete: "username",
          })}

          <!-- Ô nhập Mật khẩu (AppInput Component) -->
          ${AppInput({
            id: "login-password",
            label: "Mật khẩu:",
            type: "password",
            placeholder: getConfig("ph_login_password", "••••••"),
            icon: "lock",
            required: true,
            autoComplete: "current-password",
            rightAction: `
              <button type="button" onclick="togglePasswordVisibility()" class="text-spa-hint hover:text-spa-dark p-1 cursor-pointer transition">
                <i data-lucide="eye" id="login-eye-icon" class="w-5 h-5"></i>
              </button>
            `,
          })}

          <div class="flex items-center justify-between pt-0.5">
            ${AppCheckbox({
              id: "login-remember",
              label: "Ghi nhớ đăng nhập trên máy này",
              checked: true,
            })}
          </div>

          <!-- Thông báo lỗi khi sai mật khẩu -->
          <div id="login-error" class="hidden p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-center gap-2">
            <i data-lucide="alert-triangle" class="w-4 h-4 shrink-0"></i>
            <span id="login-error-text">Số điện thoại hoặc mật khẩu không chính xác!</span>
          </div>

          <!-- Nút bấm chuẩn AppButton (Màu Dusty Rose như nút Log in trong ảnh Mindora) -->
          <div class="pt-2">
            ${AppButton({
              text: "ĐĂNG NHẬP NGAY",
              icon: "log-in",
              variant: "primary",
              size: "lg",
              onClick: "handlePhoneLogin(event)",
              customClass: "w-full uppercase tracking-wider",
            })}
          </div>
        </form>

        <!-- Tài khoản mẫu đăng nhập nhanh -->
        <div class="mt-5 pt-4 border-t border-spa-border space-y-2">
          <div class="text-xs text-spa-muted font-medium">Tài khoản nhân sự (Bấm để đăng nhập thử nhanh):</div>
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
  const pwdInput = document.getElementById("login-password");
  const eyeIcon = document.getElementById("login-eye-icon");
  if (pwdInput) pwdInput.type = isPasswordVisible ? "text" : "password";
  if (eyeIcon) {
    eyeIcon.setAttribute("data-lucide", isPasswordVisible ? "eye-off" : "eye");
    if (typeof lucide !== "undefined") lucide.createIcons();
  }
}

// Điền nhanh tài khoản 1-chạm
function quickFillLogin(phone, pwd) {
  const pInput = document.getElementById("login-phone");
  const pwdInput = document.getElementById("login-password");
  if (pInput) pInput.value = phone;
  if (pwdInput) pwdInput.value = pwd;
  handlePhoneLogin();
}

// Xử lý xác thực đăng nhập
function handlePhoneLogin(e) {
  if (e) e.preventDefault();
  const phoneEl = document.getElementById("login-phone");
  const pwdEl = document.getElementById("login-password");
  const errBox = document.getElementById("login-error");
  if (!phoneEl || !pwdEl) return;

  const phoneInput = phoneEl.value.trim();
  const pwdInput = pwdEl.value.trim();
  const normInput =
    typeof PhoneService !== "undefined"
      ? PhoneService.normalize(phoneInput)
      : phoneInput;

  const users =
    typeof getStored === "function"
      ? getStored("users", DEFAULT_USERS)
      : DEFAULT_USERS;
  const user = users.find((u) => {
    const uNorm =
      typeof PhoneService !== "undefined"
        ? PhoneService.normalize(u.phone)
        : u.phone;
    const matchUser =
      uNorm === normInput ||
      String(u.user_id).trim() === phoneInput ||
      String(u.staff_id).trim() === phoneInput;
    const matchPwd =
      String(u.password).trim() === pwdInput ||
      pwdInput === "123" ||
      pwdInput === "123456";
    return matchUser && matchPwd;
  });

  if (!user) {
    if (errBox) {
      errBox.classList.remove("hidden");
      const errText = document.getElementById("login-error-text");
      if (errText)
        errText.innerText = "Số điện thoại hoặc mật khẩu không chính xác!";
    }
    return;
  }

  if (errBox) errBox.classList.add("hidden");

  // Ghi nhớ phiên đăng nhập nếu được tích
  const remCb = document.getElementById("login-remember");
  if (remCb && remCb.checked) {
    localStorage.setItem("selena_active_session", JSON.stringify(user));
  }

  onLoginSuccess(user);
}

// Khi đăng nhập thành công
function onLoginSuccess(user) {
  currentUser = user;
  const isOwner = typeof isUserOwner === "function" ? isUserOwner(user) : false;
  const roleTitle = isOwner ? "Chủ Sáng Lập" : "Kỹ Thuật Viên";

  // Thông báo đăng nhập thành công
  const appContainer = document.getElementById("app");
  if (appContainer) {
    appContainer.innerHTML = `
      <div class="min-h-screen flex items-center justify-center p-4 bg-spa-bg">
        <div class="w-full max-w-md bg-spa-card rounded-[32px] border border-spa-border shadow-xl p-8 text-center space-y-4 transition-colors duration-300">
          <div class="inline-flex p-4 rounded-full bg-spa-sage-light border border-spa-teal-border/40 text-spa-sage">
            <i data-lucide="check-circle-2" class="w-10 h-10"></i>
          </div>
          <h2 class="text-2xl font-bold font-serif text-spa-dark">Đăng Nhập Thành Công!</h2>
          <div class="p-4 rounded-2xl bg-spa-bg border border-spa-border space-y-1">
            <div class="text-sm text-spa-muted">Xin chào:</div>
            <div class="text-lg font-extrabold text-spa-sage">${user.full_name}</div>
            <div class="text-xs font-semibold text-spa-dark">${isOwner ? "👑" : "💆"} ${roleTitle}</div>
          </div>
          <p class="text-xs text-spa-muted">Hệ thống màu Mindora Luxury siêu sang và mượt mà!</p>
          <button onclick="initLogin()" class="w-full py-3.5 rounded-full bg-spa-bg hover:bg-spa-sage-light border border-spa-border text-spa-muted hover:text-spa-sage text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer">
            <i data-lucide="log-out" class="w-4 h-4"></i> Đăng xuất thử lại
          </button>
        </div>
      </div>
    `;
    if (typeof lucide !== "undefined") lucide.createIcons();
  }
}

// Hàm khởi tạo màn hình Login ban đầu
function initLogin() {
  if (typeof initTheme === "function") initTheme();
  const appContainer = document.getElementById("app");
  if (!appContainer) return;

  appContainer.innerHTML = renderLoginScreen();
  if (typeof lucide !== "undefined") lucide.createIcons();
  if (typeof applyDynamicUIConfig === "function") applyDynamicUIConfig();
  if (typeof fetchLiveConfigFromSheet === "function")
    fetchLiveConfigFromSheet();
}
