// =========================================================================
// VIEW COMPONENT: POS LIVE VIEW (GIAO DIỆN TOUR ĐANG CHẠY & CÁC MODAL)
// Quản lý Màn hình đếm giờ, Nút hoàn thành / rời sớm & Các Modal ca Live
// =========================================================================

const PosLiveView = {
  /**
   * Render Card ca đang chạy live (id: live-session-card)
   * @returns {string} HTML string của AppCard
   */
  render() {
    const liveSessionContent = `
      <!-- Header trạng thái ca -->
      <div class="flex justify-between items-center">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-spa-sage/10 border border-spa-sage/30 text-spa-sage text-xs font-bold">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-spa-sage opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-spa-sage"></span>
          </span>
          <span>Đang phục vụ tour gội</span>
        </div>
        <button type="button" onclick="LiveHeader.cancelTour()" class="text-xs text-spa-muted hover:text-rose-600 font-semibold transition cursor-pointer">
          Hủy tour
        </button>
      </div>

      <!-- Thông tin dịch vụ & KTV Chips -->
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-2">
          <h3 id="live-service-name" class="text-xl font-bold font-sans text-spa-dark dark:text-white">Combo 1</h3>
          ${AppButton({
            text: "Đổi Dịch Vụ",
            icon: "edit-3",
            variant: "pink",
            size: "sm",
            onClick: "ServiceEditModal.open()",
            customClass:
              "!rounded-full shrink-0 font-bold border border-spa-brand/30",
          })}
        </div>
        <div class="flex items-center gap-1.5 text-xs sm:text-sm text-spa-muted dark:text-white/60">
          <i data-lucide="user" class="w-3.5 h-3.5 text-spa-brand"></i>
          <span id="live-customer-name-text" class="font-bold text-spa-dark dark:text-white">Khách vãng lai</span>
        </div>
        <div id="live-staff-chips-container" class="flex flex-wrap items-center gap-1.5 pt-1"></div>
      </div>

      <!-- ĐỒNG HỒ ĐẾM GIỜ TRUNG TÂM -->
      <div class="p-5 sm:p-6 rounded-3xl bg-white dark:bg-spa-card border border-spa-border text-center space-y-3.5">
        <div id="live-timer-display" class="text-4xl sm:text-5xl font-extrabold text-spa-dark dark:text-white font-mono tracking-wider py-1">
          00:00
        </div>
        <div class="w-full h-2.5 bg-spa-bg rounded-full overflow-hidden border border-spa-border">
          <div id="live-progress-bar" class="h-full bg-gradient-to-r from-spa-sage via-spa-brand to-rose-500 rounded-full transition-all duration-1000" style="width: 5%"></div>
        </div>
        <div class="grid grid-cols-3 items-center gap-2 pt-2 border-t border-spa-border/60">
          <div class="flex flex-col items-center text-center">
            <span class="text-[11px] font-bold text-spa-muted">Bắt đầu:</span>
            <b id="live-start-time-text" class="text-sm font-black font-mono text-spa-dark dark:text-white mt-0.5">--:--</b>
          </div>
          <div class="flex flex-col items-center text-center px-1">
            <span id="live-status-hint" class="text-[11px] sm:text-xs text-spa-sage font-bold text-center leading-tight">
              ⏱️ Đang tính toán thời gian
            </span>
          </div>
          <div class="flex flex-col items-center text-center">
            <span class="text-[11px] font-bold text-spa-muted">Định mức:</span>
            <b id="live-target-time-text" class="text-sm font-black text-spa-brand mt-0.5 font-mono">50 phút</b>
          </div>
        </div>
      </div>

      <!-- CỤM NÚT HÀNH ĐỘNG -->
      <div class="space-y-2.5 pt-1">
        ${AppButton({
          id: "btn-live-complete-tour",
          text: "Hoàn Thành Tour",
          icon: "check-circle",
          iconPosition: "left",
          variant: "teal",
          size: "lg",
          onClick: "LiveActions.onComplete()",
          customClass:
            "w-full !rounded-full shadow-lg shadow-spa-sage/25 text-base sm:text-lg",
        })}

        ${AppButton({
          id: "btn-live-leave-early",
          text: "Xong Việc Rời Tour Sớm",
          icon: "log-out",
          iconPosition: "end",
          variant: "primary",
          size: "lg",
          onClick: "LiveActions.onLeaveEarly()",
          customClass:
            "hidden w-full !rounded-full shadow-xs text-sm sm:text-base",
        })}
      </div>
    `;

    return AppCard({
      id: "live-session-card",
      variant: "zen",
      ambient: true,
      padding: "p-6 sm:p-7",
      customClass: "hidden space-y-5",
      content: liveSessionContent,
    });
  },

  /**
   * Render tất cả các Modal phụ trợ cho ca Live (Checkout, Đổi Dịch Vụ, Bàn Giao, Đổi KTV)
   * @returns {string} HTML string của các modal
   */
  renderModals() {
    // 1. Modal Đổi Dịch Vụ Giữa Tour
    const modalEditServicesHtml = ModalShell({
      id: "modal-edit-live-services",
      title: "Đổi Dịch Vụ Giữa Tour",
      icon: "edit-3",
      maxWidth: "max-w-sm",
      body: '<div id="modal-edit-services-list" class="space-y-2"></div>',
      onClose: "ServiceEditModal.close()",
    });

    // 2. Modal Bàn Giao Tour
    const modalHandoverHtml = ModalShell({
      id: "modal-handover",
      title: "Bàn Giao Tour Cho KTV Khác",
      icon: "arrow-right-left",
      maxWidth: "max-w-md",
      body: `
        <div class="space-y-4 text-sm text-spa-dark dark:text-white">
          <p class="text-xs text-spa-muted dark:text-white/70 leading-relaxed bg-spa-bg dark:bg-white/5 p-3 rounded-2xl border border-spa-border">
            ✨ Bạn bận việc hoặc mệt đột xuất? Bạn có thể chuyển tour này cho bạn KTV khác làm tiếp. Hệ thống sẽ tự động đồng bộ sang máy bạn ấy và chia hoa hồng công bằng.
          </p>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-spa-muted uppercase tracking-wider">Chọn KTV Vào Thay Làm Tiếp:</label>
            <select id="modal-handover-staff-select" onchange="HandoverModal.updatePreview()" class="w-full bg-white dark:bg-spa-card border border-spa-border rounded-2xl p-3.5 text-sm text-spa-dark dark:text-white font-bold focus:outline-none focus:border-spa-brand transition cursor-pointer"></select>
          </div>

          <div class="space-y-2 pt-1">
            <label class="block text-xs font-bold text-spa-muted uppercase tracking-wider">Hình Thức Phân Chia Hoa Hồng:</label>
            <div class="grid grid-cols-2 gap-2.5">
              <button type="button" id="btn-handover-timer" onclick="HandoverModal.setSplitMode('timer')" class="p-3 rounded-2xl border bg-spa-brand/10 border-spa-brand text-spa-brand font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition shadow-xs">
                <span class="flex items-center gap-1 font-extrabold"><i data-lucide="clock" class="w-3.5 h-3.5"></i> Theo thời gian thực</span>
                <span class="text-[10px] font-normal text-spa-muted">Tính theo số phút đã làm</span>
              </button>
              <button type="button" id="btn-handover-equal" onclick="HandoverModal.setSplitMode('equal')" class="p-3 rounded-2xl border bg-spa-bg dark:bg-spa-dark/40 border-spa-border text-spa-muted hover:bg-spa-brand/5 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition">
                <span class="flex items-center gap-1 font-extrabold"><i data-lucide="handshake" class="w-3.5 h-3.5"></i> Chia đều 50 / 50</span>
                <span class="text-[10px] font-normal text-spa-muted">Cưa đôi hoa hồng tour</span>
              </button>
            </div>
          </div>

          <div class="p-3.5 rounded-2xl bg-spa-bg dark:bg-white/5 border border-spa-border text-xs space-y-2">
            <span class="font-bold text-spa-muted block pb-1 border-b border-spa-border">Dự kiến phân bổ hoa hồng tour:</span>
            <div id="handover-preview-list" class="space-y-1.5"></div>
          </div>
        </div>
      `,
      footer: AppButton({
        id: "btn-confirm-handover",
        text: "Xác Nhận Bàn Giao",
        icon: "check",
        variant: "teal",
        size: "md",
        onClick: "HandoverModal.confirmHandover()",
        customClass: "w-full !rounded-xl",
      }),
      onClose: "HandoverModal.close()",
    });

    // 3. Modal Điều Chỉnh KTV
    const modalSwapStaffHtml = ModalShell({
      id: "modal-swap-staff",
      title: '<span id="swap-modal-title-text">Điều Chỉnh KTV Tour Này</span>',
      icon: "users",
      maxWidth: "max-w-md",
      body: `
        <div class="space-y-4 text-sm text-spa-dark dark:text-white">
          <div class="space-y-2.5">
            <label class="block text-xs font-bold text-spa-muted uppercase tracking-wider">Danh Sách KTV Đang Làm Tour</label>
            <div id="swap-modal-staff-container" class="space-y-2.5"></div>

            <button type="button" id="btn-swap-add-staff" onclick="SwapStaffModal.addStaff()" class="w-full py-3 px-3 rounded-2xl border border-dashed border-spa-brand/60 hover:bg-spa-brand/10 text-spa-brand font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-98">
              <i data-lucide="user-plus" class="w-4 h-4"></i>
              <span>+ Thêm KTV vào tour này</span>
            </button>
          </div>

          <div class="space-y-2 pt-1">
            <label class="block text-xs font-bold text-spa-muted uppercase tracking-wider">Hình Thức Phân Chia Hoa Hồng</label>
            <div class="grid grid-cols-2 gap-2.5">
              <button type="button" id="btn-split-timer" onclick="SwapStaffModal.setSplitMode('timer')" class="p-3 rounded-2xl border bg-spa-brand/10 border-spa-brand text-spa-brand font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition shadow-xs">
                <span class="flex items-center gap-1 font-extrabold"><i data-lucide="clock" class="w-3.5 h-3.5"></i> Theo thời gian thực</span>
                <span class="text-[10px] font-normal text-spa-muted">Tính theo số phút đã làm</span>
              </button>
              <button type="button" id="btn-split-half" onclick="SwapStaffModal.setSplitMode('equal')" class="p-3 rounded-2xl border bg-spa-bg dark:bg-spa-dark/40 border-spa-border text-spa-muted hover:bg-spa-brand/5 font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition">
                <span class="flex items-center gap-1 font-extrabold"><i data-lucide="handshake" class="w-3.5 h-3.5"></i> Chia đều 50 / 50</span>
                <span class="text-[10px] font-normal text-spa-muted">Làm cùng từ đầu</span>
              </button>
            </div>
          </div>

          <div class="p-3.5 rounded-2xl bg-spa-bg dark:bg-white/5 border border-spa-border text-xs space-y-1.5">
            <div class="font-bold text-spa-muted pb-1 border-b border-spa-border">Tóm tắt phân chia hoa hồng:</div>
            <div id="swap-summary-pct-list" class="space-y-1"></div>
          </div>
        </div>
      `,
      footer: AppButton({
        id: "btn-swap-modal-submit",
        text: '<span id="btn-swap-modal-submit-text">Lưu Thay Đổi Phân Chia</span>',
        icon: "check",
        variant: "primary",
        size: "md",
        onClick: "SwapStaffModal.saveSettings()",
        customClass: "w-full !rounded-xl",
      }),
      onClose: "SwapStaffModal.close()",
    });

    // 4. Modal Checkout 2 pha (Khách xem & KTV ghi nhận tips)
    const modalCheckoutHtml = `
      <div id="modal-checkout" class="hidden fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-all duration-300">
        <div class="w-full max-w-md max-h-[calc(100dvh-48px)] bg-spa-card rounded-[28px] border border-spa-border shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <!-- Pha 1: Khách xem -->
          <div id="checkout-step-customer" class="flex flex-col flex-1 min-h-0">
            <div class="flex items-center justify-between px-6 py-4.5 border-b border-spa-border bg-spa-bg/90 dark:bg-spa-card/90 backdrop-blur-md shrink-0 select-none">
              <div>
                <span class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-spa-brand/10 text-spa-brand text-xs font-bold">
                  <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Selena Spa • Thanh Toán
                </span>
                <h3 class="text-base sm:text-lg font-bold font-serif text-spa-dark dark:text-white mt-1">Thông Tin Thanh Toán</h3>
              </div>
              <button type="button" onclick="CheckoutModal.close()" class="w-8 h-8 rounded-full bg-white dark:bg-spa-card hover:bg-spa-bg text-spa-muted hover:text-spa-brand border border-spa-border flex items-center justify-center transition cursor-pointer">
                <i data-lucide="x" class="w-4 h-4"></i>
              </button>
            </div>
            <div class="p-6 overflow-y-auto space-y-4 overscroll-contain flex-1 text-sm text-spa-dark dark:text-white">
              <div class="p-4 rounded-2xl bg-spa-bg dark:bg-spa-dark/30 border border-spa-border space-y-2 text-xs sm:text-sm">
                <div class="flex justify-between font-bold text-spa-dark dark:text-white">
                  <span id="chk-service-name">Combo</span>
                  <span id="chk-service-price" class="text-spa-brand text-base font-extrabold font-mono">0 đ</span>
                </div>
                <div class="flex justify-between text-spa-muted">
                  <span>Thời gian liệu trình:</span>
                  <span id="chk-time-range" class="font-mono font-semibold text-spa-dark dark:text-white">--:--</span>
                </div>
                <div class="flex justify-between text-spa-muted">
                  <span>Khách hàng:</span>
                  <span id="chk-customer-name" class="font-semibold text-spa-dark dark:text-white">Khách</span>
                </div>
              </div>
              <div class="space-y-2">
                <label class="block text-xs font-bold text-spa-muted uppercase tracking-wider">Hình Thức Thanh Toán</label>
                <div class="grid grid-cols-2 gap-3">
                  <button type="button" id="chk-btn-qr" onclick="CheckoutModal.setPaymentMethod('Chuyển khoản')" class="p-3.5 rounded-2xl border bg-spa-brand/10 border-spa-brand text-spa-brand font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-xs">
                    <i data-lucide="qr-code" class="w-4 h-4"></i> Quét Mã QR
                  </button>
                  <button type="button" id="chk-btn-cash" onclick="CheckoutModal.setPaymentMethod('Tiền mặt')" class="p-3.5 rounded-2xl border bg-spa-bg dark:bg-spa-dark/40 border-spa-border text-spa-muted hover:bg-spa-brand/10 font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer">
                    <i data-lucide="banknote" class="w-4 h-4"></i> Tiền Mặt
                  </button>
                </div>
              </div>
              <div id="chk-qr-display-box" class="p-2 sm:p-3 rounded-3xl bg-white dark:bg-spa-card border border-spa-border text-center overflow-hidden">
                <img src="images/qr_bank.jpg" alt="Mã QR VIB" class="w-full h-auto object-contain rounded-2xl mx-auto shadow-2xs">
              </div>
            </div>
            <div class="px-6 py-4 border-t border-spa-border bg-spa-bg/90 dark:bg-spa-card/90 backdrop-blur-md shrink-0 flex items-center justify-end">
              ${AppButton({
                text: "Khách Đã Thanh Toán",
                icon: "arrow-right",
                iconPosition: "right",
                variant: "primary",
                size: "lg",
                onClick: "CheckoutModal.goToStaffStep()",
                customClass:
                  "w-full !rounded-full shadow-lg shadow-spa-brand/25 text-sm font-extrabold",
              })}
            </div>
          </div>

          <!-- Pha 2: KTV nhập Tips -->
          <div id="checkout-step-staff" class="hidden flex flex-col flex-1 min-h-0">
            <div class="flex items-center justify-between px-6 py-4.5 border-b border-spa-border bg-spa-bg/90 dark:bg-spa-card/90 backdrop-blur-md shrink-0 select-none">
              <div>
                <span class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-spa-sage/10 text-spa-sage text-xs font-bold">
                  <i data-lucide="lock" class="w-3.5 h-3.5"></i> Bước Riêng KTV
                </span>
                <h3 class="text-base sm:text-lg font-bold font-serif text-spa-dark dark:text-white mt-1">Ghi Nhận Tiền Tips</h3>
              </div>
              <button type="button" onclick="CheckoutModal.backToCustomerStep()" class="text-xs font-bold text-spa-muted hover:text-spa-brand transition cursor-pointer">
                Quay lại
              </button>
            </div>
            <div class="p-6 overflow-y-auto space-y-4 overscroll-contain flex-1 text-sm text-spa-dark dark:text-white">
              <div class="p-3.5 rounded-2xl bg-spa-bg dark:bg-spa-dark/30 border border-spa-border text-xs text-spa-muted flex justify-between items-center">
                <span>Tiền dịch vụ tour: <b id="staff-step-service-price" class="text-spa-dark dark:text-white font-mono font-bold">0 đ</b></span>
                <span class="font-semibold text-spa-sage" id="staff-step-pay-method">Chuyển khoản</span>
              </div>
              <div id="checkout-dynamic-tips-container" class="space-y-3"></div>
            </div>
            <div class="px-6 py-4 border-t border-spa-border bg-spa-bg/90 dark:bg-spa-card/90 backdrop-blur-md shrink-0">
              ${AppButton({
                text: "Xác Nhận Thu Tiền & Đóng Tour",
                icon: "check-check",
                variant: "primary",
                size: "lg",
                onClick: "CheckoutModal.confirmFinish()",
                customClass:
                  "w-full !rounded-full shadow-lg shadow-spa-brand/25 text-sm font-extrabold",
              })}
            </div>
          </div>
        </div>
      </div>
    `;

    return `
      ${modalCheckoutHtml}
      ${modalEditServicesHtml}
      ${modalHandoverHtml}
      ${modalSwapStaffHtml}
    `;
  },
};

window.PosLiveView = PosLiveView;
