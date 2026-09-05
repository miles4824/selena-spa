// =========================================================================
// COMPONENT: LIVE TIMER (ĐỒNG HỒ ĐẾM GIỜ TRUNG TÂM & THANH TIẾN TRÌNH %)
// =========================================================================

const LiveTimer = {
  timerInterval: null,

  /**
   * Bắt đầu chạy chu kỳ đếm giờ 1s một lần
   */
  start(session) {
    this.stop();
    if (!session) return;

    this.updateStaticTimes(session);
    this.tick();
    this.timerInterval = setInterval(() => this.tick(), 1000);
  },

  /**
   * Dừng chu kỳ đếm giờ
   */
  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  },

  /**
   * Cập nhật thời gian bắt đầu và định mức thời gian lên 3 cột chân đồng hồ
   */
  updateStaticTimes(session) {
    const startEl = document.getElementById('live-start-time-text');
    const targetEl = document.getElementById('live-target-time-text');

    if (startEl && session.start_time) {
      startEl.innerText = session.start_time;
    }

    const targetMin = Number(session.duration_target_min || session.duration_min || 50);
    if (targetEl) {
      targetEl.innerText = (typeof PosService !== 'undefined')
        ? PosService.formatDuration(targetMin)
        : `${targetMin} phút`;
    }
  },

  /**
   * Cập nhật số đếm ngược / đếm cộng dồn mỗi giây
   */
  tick() {
    const session = (window.PosState && window.PosState.currentLiveSession)
      || (typeof currentLiveSession !== 'undefined' ? currentLiveSession : null);
    if (!session || !session.start_timestamp) return;

    const elapsedSec = Math.max(0, Math.floor((Date.now() - session.start_timestamp) / 1000));
    const elapsedMin = Math.floor(elapsedSec / 60);
    const remSec = elapsedSec % 60;

    const timerEl = document.getElementById('live-timer-display');
    const barEl = document.getElementById('live-progress-bar');
    const hintEl = document.getElementById('live-status-hint');

    const formattedTime = `${elapsedMin.toString().padStart(2, '0')}:${remSec.toString().padStart(2, '0')}`;
    const targetMin = Number(session.duration_target_min || session.duration_min || 50);

    if (timerEl) {
      if (elapsedMin >= targetMin) {
        timerEl.innerText = `+${formattedTime}`;
        timerEl.classList.add('text-rose-600');
      } else {
        timerEl.innerText = formattedTime;
        timerEl.classList.remove('text-rose-600');
      }
    }

    const pct = Math.min(100, Math.round((elapsedMin / targetMin) * 100));
    if (barEl) {
      barEl.style.width = `${pct}%`;
    }

    if (hintEl) {
      if (elapsedMin >= targetMin) {
        hintEl.innerText = '✨ Đã hoàn thành liệu trình';
        hintEl.className = 'text-[11px] sm:text-xs text-spa-brand font-bold text-center leading-tight animate-pulse';
      } else {
        hintEl.innerText = `⏱️ Còn khoảng ${targetMin - elapsedMin} phút theo liệu trình`;
        hintEl.className = 'text-[11px] sm:text-xs text-spa-sage font-bold text-center leading-tight';
      }
    }
  }
};

window.LiveTimer = LiveTimer;
