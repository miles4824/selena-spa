// =============================================================
// COMPONENT: WEEKLY DATE STRIP (Thanh trượt 7 ngày trong tuần)
// =============================================================
function renderWeeklyDateStripComponent(containerId, activeDateStr, onSelectDateCallback) {
  if (typeof initDateStripTrack === 'function') {
    initDateStripTrack(containerId, onSelectDateCallback, activeDateStr);
  }
}
