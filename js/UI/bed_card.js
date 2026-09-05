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
    <div class="p-4 rounded-3xl bg-spa-card dark:bg-[#263339] border border-spa-border dark:border-[#384850] space-y-3 shadow-xs hover:border-spa-brand/50 dark:hover:border-spa-brand/50 transition group ${customClass}" style="-webkit-mask-image: -webkit-radial-gradient(white, black); border-radius: 24px; -webkit-border-radius: 24px; isolation: isolate; transform: translateZ(0);">
      <div class="flex justify-between items-start">
        <div>
          <div class="text-[11px] font-black text-spa-brand uppercase tracking-wider flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full ${isOverdue ? 'bg-rose-500' : 'bg-spa-sage'} animate-pulse"></span>
            <span>Giường số ${bedNumberStr}</span>
          </div>
          <div class="font-extrabold text-sm text-spa-dark dark:text-white mt-0.5">${sess.customer_name || 'Khách vãng lai'}</div>
          <div class="text-xs text-spa-muted dark:text-white/60">${sess.service_name || 'Dịch vụ'}</div>
        </div>
        <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-full ${isOverdue ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300' : 'bg-spa-sage-light dark:bg-spa-sage/25 text-spa-sage dark:text-[#88B8AD]'}">
          ${elapsedMin}/${targetMin}p
        </span>
      </div>

      <!-- Tiến trình thời gian % động -->
      <div class="space-y-1">
        <div class="w-full h-2 bg-white dark:bg-black/30 rounded-full overflow-hidden shadow-inner">
          <div class="h-full ${isOverdue ? 'bg-rose-500' : 'bg-gradient-to-r from-spa-sage to-[#7BA69C]'} rounded-full transition-all duration-500" style="width: ${progressPct}%"></div>
        </div>
        <div class="flex justify-between text-[10px] text-spa-hint dark:text-white/50 font-medium">
          <span>Bắt đầu: ${sess.start_time || '--:--'}</span>
          <span>KTV: ${staffNames}</span>
        </div>
      </div>

      <!-- Nút hành động xem ca -->
      <div class="pt-1 flex items-center justify-end">
        <button onclick="handleAdminInspectSession('${sId}')" class="text-xs font-bold text-spa-brand hover:text-spa-brand-hover flex items-center gap-1 group-hover:translate-x-0.5 transition cursor-pointer">
          <span>Xem / Chăm Sóc Ca Này</span>
          <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  `;
}
window.BedCard = BedCard;
