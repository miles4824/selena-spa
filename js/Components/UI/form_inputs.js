// =============================================================
// COMPONENT: BASE FORM INPUTS
// =============================================================
const UIInputs = {
  text(id, label, placeholder = '', value = '') {
    return `<div><label class="block text-xs font-bold text-[#2D2424] mb-1">${label}</label><input type="text" id="${id}" value="${value}" placeholder="${placeholder}" class="w-full bg-[#F7F2EC] border border-[#EFE8DF] rounded-2xl p-3 text-xs sm:text-sm text-[#2D2424] font-bold focus:outline-none focus:border-[#E58A7B] focus:bg-white transition"></div>`;
  }
};
