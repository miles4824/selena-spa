// =============================================================
// COMPONENT: BASE BUTTONS
// =============================================================
const UIButtons = {
  primary(label, onClickStr, icon = '') {
    return `<button type="button" onclick="${onClickStr}" class="w-full py-3.5 rounded-full bg-[#E58A7B] hover:bg-[#D9796A] text-white font-extrabold text-sm shadow-md shadow-[#E58A7B]/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition">${icon ? `<i data-lucide="${icon}" class="w-4 h-4"></i>` : ''}<span>${label}</span></button>`;
  },
  success(label, onClickStr, icon = '') {
    return `<button type="button" onclick="${onClickStr}" class="w-full py-3.5 rounded-full bg-[#2E7D6D] hover:bg-[#25685B] text-white font-extrabold text-sm shadow-md shadow-[#2E7D6D]/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition">${icon ? `<i data-lucide="${icon}" class="w-4 h-4"></i>` : ''}<span>${label}</span></button>`;
  },
  ghost(label, onClickStr) {
    return `<button type="button" onclick="${onClickStr}" class="flex-1 py-3 rounded-full bg-[#F7F2EC] hover:bg-[#EFE8DF] text-[#7E7272] font-bold text-xs sm:text-sm cursor-pointer transition">${label}</button>`;
  }
};
