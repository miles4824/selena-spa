// =========================================================================
// COMPONENT: CART CHIPS (DANH SÁCH CHIP DỊCH VỤ ĐÃ CHỌN TRONG GIỎ)
// =========================================================================

const CartChips = {
  /**
   * Render HTML danh sách chips dịch vụ đã chọn
   */
  render(cartItems = [], context = 'pos') {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return "";
    }

    return cartItems
      .map((item) => {
        const price = Number(item.price) || 0;
        const dur = Number(item.duration_min) || 0;
        const isCombo =
          String(item.service_id || "").startsWith("CB") ||
          String(item.service_name || "")
            .toLowerCase()
            .includes("combo");

        return `
        <div class="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-gradient-to-r from-spa-brand/10 to-spa-bg dark:to-spa-card border border-spa-brand/30 text-spa-dark dark:text-white shadow-2xs hover:shadow-xs transition animate-in zoom-in-95">
          <!-- Icon đại diện -->
          <div class="text-base sm:text-lg flex items-center justify-center shrink-0">
            ${isCombo ? "💆" : "✨"}
          </div>
          <!-- Cụm 2 dòng text: Tên ở trên, Giá & Phút ở dưới -->
          <div class="min-w-0 flex-1">
            <div class="font-extrabold text-[11px] text-spa-dark dark:text-white leading-snug truncate">
              ${item.service_name}
            </div>
            <div class="text-[11px] font-mono text-spa-dark/70 dark:text-white/70 mt-0.5 flex items-center gap-1.5 leading-tight">
              <span class="text-spa-brand font-black">${price.toLocaleString("vi-VN")} đ</span>
              <span>•</span>
              <span class="text-spa-sage font-bold">${dur}p</span>
            </div>
          </div>
          <!-- Nút xóa ✕ -->
          <button type="button" 
            onclick="CartChips.remove('${item.service_id}', event, '${context}')" 
            class="pos-chip-remove-btn ml-1 p-1 text-spa-dark/40 dark:text-white/40 hover:text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-full transition cursor-pointer shrink-0" 
            title="Xóa dịch vụ này">
            <i data-lucide="x" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      `;
      })
      .join("");
  },

  /**
   * Xóa 1 dịch vụ khỏi giỏ hàng
   */
  remove(serviceId, event, context = 'pos') {
    if (event) event.stopPropagation();

    if (context === 'modal-edit') {
      if (typeof ServiceEditModal !== 'undefined') {
        let cart = ServiceEditModal.tempCartItems || [];
        const index = cart.findIndex((item) => item.service_id === serviceId);
        if (index >= 0) {
          cart.splice(index, 1);
          ServiceEditModal.tempCartItems = cart;
          ServiceEditModal.onCartChanged();
        }
      }
      return;
    }

    if (!window.PosState) window.PosState = { selectedCartItems: [] };
    let cart = window.PosState.selectedCartItems || [];

    const index = cart.findIndex((item) => item.service_id === serviceId);
    if (index >= 0) {
      cart.splice(index, 1);
      window.PosState.selectedCartItems = cart;

      if (typeof PosScreen !== "undefined" && PosScreen.updateCartUI) {
        PosScreen.updateCartUI();
      }
    }
  },
};

window.CartChips = CartChips;
