// =========================================================================
// SERVICE: POS & TOUR CALCULATION SERVICE (TOÁN HỌC & NGHIỆP VỤ BÁN HÀNG)
// =========================================================================

const PosService = {
  /**
   * Phân tích chuỗi phần trăm (vd: "10%", 10, "15") thành số nguyên
   */
  parsePercentage(val) {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    const clean = String(val).replace(/[^0-9.]/g, '');
    return Number(clean) || 0;
  },

  /**
   * Định dạng số tiền sang VND (vd: 64000 -> "64.000 đ")
   */
  formatCurrency(amount) {
    const num = Number(amount) || 0;
    return `${num.toLocaleString('vi-VN')} đ`;
  },

  /**
   * Định dạng thời lượng sang phút (vd: 50 -> "50 phút")
   */
  formatDuration(minutes) {
    const num = Number(minutes) || 0;
    return `${num} phút`;
  },

  /**
   * Tính hoa hồng cho 1 dịch vụ đơn lẻ:
   * 1. Nếu có commission_value cố định > 0 -> Dùng commission_value
   * 2. Nếu không -> Lấy theo commission_rate của KTV (mặc định 10%)
   */
  calculateItemCommission(serviceItem, staffUser) {
    if (!serviceItem) return 0;
    const fixedComm = Number(serviceItem.commission_value) || 0;
    if (fixedComm > 0) return fixedComm;

    const rate = (staffUser && this.parsePercentage(staffUser.commission_rate) > 0)
      ? this.parsePercentage(staffUser.commission_rate)
      : 10;
    const price = Number(serviceItem.price) || 0;
    return Math.round(price * (rate / 100));
  },

  /**
   * Tính tổng hoa hồng cho toàn bộ giỏ dịch vụ của 1 KTV theo tỷ lệ chia sẻ (%)
   */
  calculateCartCommission(cartItems, staffUser, pctShare = 100) {
    if (!Array.isArray(cartItems) || cartItems.length === 0) return 0;
    const totalBaseComm = cartItems.reduce(
      (sum, item) => sum + this.calculateItemCommission(item, staffUser),
      0
    );
    return Math.round(totalBaseComm * (pctShare / 100));
  },

  /**
   * Tính tổng tiền và tổng thời lượng của giỏ dịch vụ
   */
  calculateCartSummary(cartItems) {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return { totalPrice: 0, totalDuration: 0, totalCosmetics: 0 };
    }
    return cartItems.reduce(
      (acc, item) => {
        acc.totalPrice += Number(item.price) || 0;
        acc.totalDuration += Number(item.duration_min) || 0;
        acc.totalCosmetics += Number(item.cosmetics_cost) || 0;
        return acc;
      },
      { totalPrice: 0, totalDuration: 0, totalCosmetics: 0 }
    );
  },

  /**
   * Tính tổng thanh toán cuối cùng có áp dụng chiết khấu voucher/sinh nhật/tip
   */
  calculateFinalTotal(cartItems, options = {}) {
    const { useVoucher = false, isBirthday = false, customDiscount = 0, tipAmount = 0 } = options;
    const { totalPrice } = this.calculateCartSummary(cartItems);

    let discount = 0;
    if (useVoucher) {
      // Voucher giảm 100% dịch vụ (hoặc gói combo chính)
      discount = totalPrice;
    } else if (isBirthday) {
      // Ưu đãi sinh nhật giảm 20%
      discount = Math.round(totalPrice * 0.2);
    }

    if (customDiscount > 0) {
      discount += Number(customDiscount);
    }

    const payableAmount = Math.max(0, totalPrice - discount) + (Number(tipAmount) || 0);
    return {
      originalPrice: totalPrice,
      discountAmount: discount,
      tipAmount: Number(tipAmount) || 0,
      payableAmount
    };
  }
};

window.PosService = PosService;
