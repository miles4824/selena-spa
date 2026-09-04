// =============================================================
// TAB 2: ADD - STATIC BANK QR MODAL CONTROLLER
// =============================================================
function openStaticQRModal() {
  const modal = document.getElementById('modal-static-qr');
  if (modal) {
    modal.classList.remove('hidden');
    lucide.createIcons();
  }
}

function closeStaticQRModal() {
  const modal = document.getElementById('modal-static-qr');
  if (modal) {
    modal.classList.add('hidden');
  }
}
