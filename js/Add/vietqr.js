// =============================================================
// TAB 2: ADD - VIETQR CODE GENERATOR & MODAL
// =============================================================
function showVietQRModal(receipt) {
  const bankName = currentUser?.bank_name || 'MBBank';
  const bankAcc = currentUser?.bank_account_no || '0949251144';
  const accName = currentUser?.bank_account_name || 'SELENA SPA';
  const amount = receipt.total_paid;
  const desc = 'SelenaSpa ' + receipt.receipt_id;

  const qrUrl = `https://img.vietqr.io/image/${bankName}-${bankAcc}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(desc)}&accountName=${encodeURIComponent(accName)}`;

  document.getElementById('vietqr-img').src = qrUrl;
  document.getElementById('vietqr-bank-info').innerText = `${bankName} - ${bankAcc}`;
  document.getElementById('vietqr-account-name').innerText = accName;
  document.getElementById('vietqr-amount').innerText = amount.toLocaleString('vi-VN') + ' đ';
  document.getElementById('vietqr-desc').innerText = desc;

  document.getElementById('modal-vietqr').classList.remove('hidden');
  lucide.createIcons();
}

function closeVietQRModal() {
  document.getElementById('modal-vietqr').classList.add('hidden');
}

function confirmVietQRSuccess() {
  closeVietQRModal();
  if (pendingReceipt) {
    saveReceiptRecord(pendingReceipt);
  }
}
