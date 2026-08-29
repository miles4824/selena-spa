// =============================================================
// TAB 4: WALLET - OWNER OPERATING EXPENSES CONTROLLER
// =============================================================
function loadAdminExpensesList() {
  const expenses = getStored('expenses', []);
  const container = document.getElementById('admin-expenses-list');
  if (!container) return;

  if (expenses.length === 0) {
    container.innerHTML = `<div class="p-6 text-center text-[#7E7272] spa-card col-span-full">Chưa có chi phí nào trong tháng</div>`;
    return;
  }

  container.innerHTML = expenses.map(e => `
    <div class="p-4 rounded-3xl bg-[#FAF6F1] border border-[#F0EAE1] flex justify-between items-center">
      <div>
        <span class="text-xs font-bold text-[#E58A7B] uppercase block">${e.expense_type || 'Chi phí'}</span>
        <div class="text-sm font-bold text-[#2D2424]">${e.note || 'Chi phí vận hành'}</div>
        <span class="text-[10px] text-[#A39696] font-mono">${e.date || ''}</span>
      </div>
      <div class="text-right">
        <span class="text-base font-extrabold text-[#D35400]">${(Number(e.amount) || 0).toLocaleString('vi-VN')} đ</span>
      </div>
    </div>
  `).join('');
}

function openAddExpenseModal() {
  document.getElementById('modal-add-expense').classList.remove('hidden');
}

function closeAddExpenseModal() {
  document.getElementById('modal-add-expense').classList.add('hidden');
}

function handleSaveExpenseForm(e) {
  e.preventDefault();
  const type = document.getElementById('input-exp-type').value;
  const amount = Number(document.getElementById('input-exp-amount').value) || 0;
  const note = document.getElementById('input-exp-note').value.trim();

  if (amount <= 0) {
    alert('Vui lòng nhập số tiền chi phí hợp lệ!');
    return;
  }

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;

  const expense = {
    expense_id: 'CP' + Date.now().toString().slice(-6),
    expense_type: type,
    amount: amount,
    note: note,
    date: dateStr,
    created_at: dateStr + ' ' + now.toLocaleTimeString('vi-VN')
  };

  const expenses = getStored('expenses', []);
  expenses.unshift(expense);
  setStored('expenses', expenses);

  callGasApi('add_expense', expense);

  closeAddExpenseModal();
  loadAdminDashboard();
  loadAdminExpensesList();
  alert('✅ Đã thêm chi phí ' + amount.toLocaleString('vi-VN') + ' đ thành công!');
}
