// =========================================================================
// COMPONENT: CART TOTAL BAR (THẺ HIỂN THỊ TỔNG THANH TOÁN & THỜI LƯỢNG)
// =========================================================================

const CartTotalBar = {
  /**
   * Render HTML cấu trúc của thanh tổng thanh toán
   */
  render(cartItems = []) {
    const summary = (typeof PosService !== 'undefined')
      ? PosService.calculateCartSummary(cartItems)
      : { totalPrice: 0, totalDuration: 0 };

    const formattedPrice = (typeof PosService !== 'undefined')
      ? PosService.formatCurrency(summary.totalPrice)
      : `${summary.totalPrice.toLocaleString('vi-VN')} đ`;

    const formattedDuration = (typeof PosService !== 'undefined')
      ? PosService.formatDuration(summary.totalDuration)
      : `${summary.totalDuration} phút`;

    return `
      <div class="p-3 sm:p-3.5 px-4 rounded-2xl bg-gradient-to-r from-spa-brand/10 via-spa-mist/20 to-spa-bg border border-spa-brand/20 flex justify-between items-center shadow-xs">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-spa-brand/15 flex items-center justify-center text-spa-brand shrink-0">
            <i data-lucide="receipt" class="w-4 h-4"></i>
          </div>
          <div>
            <div class="text-[10px] font-black text-spa-dark/60 uppercase tracking-wider">Tổng Thanh Toán</div>
            <div id="pos-cart-total-price" class="text-xl sm:text-2xl font-black font-mono text-spa-brand tracking-tight leading-none mt-0.5">
              ${formattedPrice}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-spa-border text-xs font-black text-spa-sage shadow-2xs">
          <i data-lucide="clock" class="w-3.5 h-3.5"></i>
          <span id="pos-cart-total-duration">${formattedDuration}</span>
        </div>
      </div>
    `;
  },

  /**
   * Cập nhật nhanh số liệu vào DOM mà không phải vẽ lại cả card
   */
  update(cartItems = []) {
    const summary = (typeof PosService !== 'undefined')
      ? PosService.calculateCartSummary(cartItems)
      : { totalPrice: 0, totalDuration: 0 };

    const priceEl = document.getElementById('pos-cart-total-price');
    const durEl = document.getElementById('pos-cart-total-duration');

    if (priceEl) {
      priceEl.innerText = (typeof PosService !== 'undefined')
        ? PosService.formatCurrency(summary.totalPrice)
        : `${summary.totalPrice.toLocaleString('vi-VN')} đ`;
    }
    if (durEl) {
      durEl.innerText = (typeof PosService !== 'undefined')
        ? PosService.formatDuration(summary.totalDuration)
        : `${summary.totalDuration} phút`;
    }
  }
};

window.CartTotalBar = CartTotalBar;
