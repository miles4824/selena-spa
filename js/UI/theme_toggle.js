// =========================================================================
// UI COMPONENT: THEME TOGGLE (NÚT CÔNG TẮC SÁNG / TỐI - TAILWIND 4)
// =========================================================================
function ThemeToggle({
  customClass = '',
  id = ''
} = {}) {
  const isDark = (typeof getTheme === 'function') && getTheme() === 'dark';
  const idAttr = id ? `id="${id}"` : '';

  return `
    <button ${idAttr} type="button" onclick="toggleTheme()" title="Chuyển chế độ Sáng / Tối" class="p-2 rounded-full bg-spa-bg hover:bg-spa-peach-light text-spa-muted hover:text-spa-brand border border-spa-border transition cursor-pointer active:scale-90 flex items-center justify-center ${customClass}">
      <i data-lucide="${isDark ? 'sun' : 'moon'}" class="w-4 h-4 theme-toggle-icon"></i>
    </button>
  `;
}
window.ThemeToggle = ThemeToggle;
