// =============================================================
// SELENA SPA - UI COMPONENT: APP CHECKBOX (TAILWIND 4 & MINDORA LUXURY)
// Khối 1: Giao diện thuần túy - Không chứa logic nghiệp vụ
// =============================================================

function AppCheckbox({
  id = '',
  name = '',
  label = '',
  checked = false,
  disabled = false,
  onChange = '',
  customClass = '',
  labelClass = '',
  inputClass = ''
} = {}) {
  const checkedAttr = checked ? 'checked' : '';
  const disabledAttr = disabled ? 'disabled' : '';
  const onChangeAttr = onChange ? `onchange="${onChange}"` : '';
  const nameAttr = name ? `name="${name}"` : '';
  const forAttr = id ? `for="${id}"` : '';

  return `
    <label ${forAttr} class="inline-flex items-center gap-2 text-xs sm:text-sm text-spa-muted hover:text-spa-dark cursor-pointer select-none transition-colors ${customClass}">
      <input 
        type="checkbox" 
        id="${id}" 
        ${nameAttr}
        ${checkedAttr} 
        ${disabledAttr} 
        ${onChangeAttr}
        class="w-4 h-4 rounded border border-spa-border accent-[#E8AEB7] cursor-pointer transition-all focus:outline-none focus:ring-1 focus:ring-spa-sage/50 focus:ring-offset-1 ${inputClass}"
      >
      ${label ? `<span class="${labelClass}">${label}</span>` : ''}
    </label>
  `;
}
