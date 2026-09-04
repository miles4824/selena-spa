// =========================================================================
// UI COMPONENT: BED CARD (THẺ GIÁM SÁT GIƯỜNG TRỰC TIẾP REALTIME - TAILWIND 4)
// Hiển thị Giường số, Tên khách, Dịch vụ, KTV, Thanh % thời gian chạy động
// =========================================================================
function BedCard({
  sess = {},
  bedIndex = 1,
  elapsedMin = 0,
  targetMin = 45,
  progressPct = 0,
  isOverdue = false,
  staffNames = 'KTV',
  customClass = ''
} = {}) {
  const sId = String(sess.session_id || '');
  const bedNumberStr = String(bedIndex).padStart(2, '0');

  return `
    <div class="p-4 rounded-3xl bg-[#FAF6F1] border border-[#F0EAE1] space-y-3 shadow-xs hover:border-[#E58A7B]/40 transition group ${customClass}">
      <div class="flex justify-between items-start">
        <div>
          <div class="text-[11px] font-black text-[#E58A7B] uppercase tracking-wider flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full ${isOverdue ? 'bg-rose-500' : 'bg-[#2E7D6D]'} animate-pulse"></span>
            <span>Giường số ${bedNumberStr}</span>
          </div>
          <div class="font-extrabold text-sm text-[#2D2424] mt-0.5">${sess.customer_name || 'Khách vãng lai'}</div>
          <div class="text-xs text-[#7E7272]">${sess.service_name || 'Dịch vụ'}</div>
        </div>
        <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-full ${isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-[#E8F8F5] text-[#2E7D6D]'}">
          ${elapsedMin}/${targetMin}p
        </span>
      </div>

      <!-- Tiến trình thời gian % động -->
      <div class="space-y-1">
        <div class="w-full h-2 bg-white rounded-full overflow-hidden shadow-inner">
          <div class="h-full ${isOverdue ? 'bg-rose-500' : 'bg-gradient-to-r from-[#2E7D6D] to-[#3B9E8B]'} rounded-full transition-all duration-500" style="width: ${progressPct}%"></div>
        </div>
        <div class="flex justify-between text-[10px] text-[#A39696] font-medium">
          <span>Bắt đầu: ${sess.start_time || '--:--'}</span>
          <span>KTV: ${staffNames}</span>
        </div>
      </div>

      <!-- Nút hành động xem ca -->
      <div class="pt-1 flex items-center justify-end">
        <button onclick="handleAdminInspectSession('${sId}')" class="text-xs font-bold text-[#E58A7B] hover:text-[#D4796A] flex items-center gap-1 group-hover:translate-x-0.5 transition cursor-pointer">
          <span>Xem / Chăm Sóc Ca Này</span>
          <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  `;
}
window.BedCard = BedCard;
