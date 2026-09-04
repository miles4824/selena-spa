// =============================================================
// SELENA SPA - UI COMPONENT: APP INPUT (TAILWIND 4 & MINDORA LUXURY)
// Khối 1: Giao diện thuần túy - Không chứa logic nghiệp vụ
// =============================================================

function AppInput({
  id = "",
  name = "",
  label = "",
  type = "text",
  placeholder = "",
  value = "",
  icon = "", // Tên Lucide Icon ở bên trái (vd: 'phone', 'lock', 'user', 'search')
  required = false,
  isMono = false, // font-mono cho SĐT, tiền tệ, mật khẩu
  rightAction = "", // Element / Nút hành động bên phải (như nút mắt ẩn/hiện mật khẩu)
  customClass = "",
  inputClass = "",
  disabled = false,
  readOnly = false,
  onInput = "",
  onChange = "",
  autoComplete = "off",
} = {}) {
  const monoClass = isMono ? "font-mono" : "";
  const paddingLeft = icon ? "pl-12" : "pl-4";
  const paddingRight = rightAction ? "pr-12" : "pr-4";
  const requiredAttr = required ? "required" : "";
  const disabledAttr = disabled ? "disabled" : "";
  const readOnlyAttr = readOnly ? "readonly" : "";
  const onInputAttr = onInput ? `oninput="${onInput}"` : "";
  const onChangeAttr = onChange ? `onchange="${onChange}"` : "";
  const valAttr = value !== "" ? `value="${value}"` : "";
  const nameAttr = name ? `name="${name}"` : "";
  const forAttr = id ? `for="${id}"` : "";

  return `
    <div class="space-y-1 text-left ${customClass}">
      ${label ? `<label ${forAttr} class="block text-sm font-bold text-spa-dark mb-2">${label}</label>` : ""}
      <div class="relative">
        ${
          icon
            ? `
          <div class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-spa-hint flex items-center justify-center">
            <i data-lucide="${icon}" class="w-4 h-4"></i>
          </div>
        `
            : ""
        }
        <input 
          type="${type}" 
          id="${id}" 
          ${nameAttr}
          ${valAttr}
          placeholder="${placeholder}" 
          ${requiredAttr} 
          ${disabledAttr} 
          ${readOnlyAttr}
          ${onInputAttr}
          ${onChangeAttr}
          autocomplete="${autoComplete}"
          class="w-full bg-spa-bg border border-spa-border rounded-full p-4 ${paddingLeft} ${paddingRight} text-spa-dark text-sm sm:text-base ${monoClass} focus:outline-none focus:border-spa-sage focus:bg-spa-card transition-colors duration-200 placeholder:text-spa-hint/70 ${inputClass}"
        >
        ${
          rightAction
            ? `
          <div class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
            ${rightAction}
          </div>
        `
            : ""
        }
      </div>
    </div>
  `;
}
