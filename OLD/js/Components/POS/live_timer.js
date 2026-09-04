// =============================================================
// COMPONENT: LIVE TIMER (Đồng hồ đếm ngược)
// =============================================================
function formatTimerDisplay(secondsLeft) {
  const m = Math.floor(Math.abs(secondsLeft) / 60);
  const s = Math.abs(secondsLeft) % 60;
  const timeStr = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return secondsLeft < 0 ? `+${timeStr}` : timeStr;
}
