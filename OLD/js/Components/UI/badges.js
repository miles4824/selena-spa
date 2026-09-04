// =============================================================
// COMPONENT: BASE BADGES
// =============================================================
const UIBadges = {
  payment(method) {
    const isCash = method === 'Tiền mặt';
    return `<span class="inline-flex items-center gap-1 font-semibold ${isCash ? 'text-[#D35400]' : 'text-[#2E7D6D]'} shrink-0"><i data-lucide="${isCash ? 'banknote' : 'qr-code'}" class="w-3 h-3"></i>${method || 'Chuyển khoản'}</span>`;
  }
};
