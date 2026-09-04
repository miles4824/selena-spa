# -*- coding: utf-8 -*-
import os

BASE_DIR = r"c:\Users\Miles\Downloads\Selena"

# 1. UPDATE modal_swap_staff.html
swap_path = os.path.join(BASE_DIR, "views", "components", "modals", "modal_swap_staff.html")
swap_content = """<!-- MODAL ĐỔI / THÊM KTV GIỮA CA (CHUẨN MODALSHELL & APPTITLE) -->
<div id="modal-swap-staff" class="hidden fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-all duration-300">
  <div class="w-full max-w-md max-h-[calc(100dvh-48px)] bg-white rounded-[28px] border border-[#F0EAE1] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
    
    <!-- 1. HEADER (PIN CHẶT TRÊN ĐỈNH VỚI APPTITLE LEVEL MODAL) -->
    <div class="flex items-center justify-between px-6 py-4.5 border-b border-[#F0EAE1] bg-[#FAF6F1]/90 backdrop-blur-md shrink-0 select-none">
      <span class="text-base sm:text-lg font-bold text-[#2D2424] font-serif tracking-tight flex items-center gap-2.5">
        <i id="swap-modal-icon" data-lucide="users" class="w-5 h-5 text-[#E58A7B]"></i>
        <span id="swap-modal-title-text">Điều Chỉnh KTV Tour Này</span>
      </span>
      <button type="button" onclick="closeSwapStaffModal()" class="w-8 h-8 rounded-full bg-white hover:bg-[#FFF0EB] text-[#7E7272] hover:text-[#E58A7B] border border-[#EFE8DF] flex items-center justify-center transition cursor-pointer active:scale-90 shadow-2xs" title="Đóng">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>

    <!-- 2. BODY (CUỘN TỰ DO Ở GIỮA) -->
    <div class="p-6 overflow-y-auto space-y-4 overscroll-contain flex-1 text-sm text-[#2D2424]">
      <!-- Dynamic Staff List in Swap Modal -->
      <div class="space-y-2.5">
        <label class="block text-xs font-bold text-[#7E7272] uppercase tracking-wider">Danh Sách KTV Đang Làm Tour</label>
        <div id="swap-modal-staff-container" class="space-y-2.5"></div>

        <button type="button" id="btn-swap-add-staff" onclick="addStaffInSwapModal()" class="w-full py-2.5 px-3 rounded-2xl border border-dashed border-[#E58A7B]/60 hover:bg-[#FFF0EB] text-[#E58A7B] font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-98">
          <i data-lucide="user-plus" class="w-3.5 h-3.5"></i> + Thêm KTV vào tour này
        </button>
      </div>

      <!-- Hình thức phân chia hoa hồng -->
      <div class="space-y-2 pt-1">
        <label class="block text-xs font-bold text-[#7E7272] uppercase tracking-wider">Hình Thức Phân Chia Hoa Hồng</label>
        <div class="grid grid-cols-2 gap-2.5">
          <button type="button" id="btn-split-timer" onclick="setSplitMode('timer')" class="p-3 rounded-2xl border bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B] font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition">
            <span class="flex items-center gap-1 font-extrabold"><i data-lucide="clock" class="w-3.5 h-3.5"></i> Theo thời gian thực</span>
            <span id="split-timer-pct" class="text-[10px] font-normal text-[#7E7272]">Tính theo số phút đã làm</span>
          </button>
          <button type="button" id="btn-split-half" onclick="setSplitMode('equal')" class="p-3 rounded-2xl border bg-[#F7F2EC] border-[#EFE8DF] text-[#7E7272] font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition">
            <span class="flex items-center gap-1 font-extrabold"><i data-lucide="handshake" class="w-3.5 h-3.5"></i> Chia đều 50 / 50</span>
            <span id="split-equal-pct" class="text-[10px] font-normal text-[#7E7272]">Làm cùng từ đầu</span>
          </button>
        </div>
      </div>

      <!-- Tóm tắt phân chia hoa hồng -->
      <div class="p-3.5 rounded-2xl bg-[#FAF6F1] border border-[#F0EAE1] text-xs space-y-1.5">
        <div id="swap-summary-pct-list" class="space-y-1"></div>
      </div>
    </div>

    <!-- 3. FOOTER (PIN CHẶT DƯỚI ĐÁY VỚI APPBUTTON) -->
    <div class="px-6 py-4 border-t border-[#F0EAE1] bg-[#FAF6F1]/90 backdrop-blur-md shrink-0 flex items-center justify-end gap-3">
      <button type="button" onclick="closeSwapStaffModal()" class="px-5 py-2.5 rounded-full text-xs font-bold text-[#7E7272] bg-[#FAF6F1] hover:bg-[#FFF0EB] border border-[#EFE8DF] transition active:scale-95 cursor-pointer">Hủy Bỏ</button>
      <button type="button" id="btn-swap-modal-submit" onclick="saveSwapStaffSetting()" class="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#E58A7B] to-[#D9796A] hover:opacity-95 shadow-md shadow-[#E58A7B]/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5">
        <i data-lucide="check" class="w-4 h-4"></i> Xác Nhận Thay Đổi
      </button>
    </div>

  </div>
</div>
"""
with open(swap_path, "w", encoding="utf-8") as f:
    f.write(swap_content)
print("Updated modal_swap_staff.html!")

# 2. UPDATE modal_handover.html
hand_path = os.path.join(BASE_DIR, "views", "components", "modals", "modal_handover.html")
hand_content = """<!-- MODAL BÀN GIAO TOUR GỘI CHO KTV KHÁC (CHUẨN MODALSHELL & APPTITLE) -->
<div id="modal-handover-tour" class="hidden fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-all duration-300" onclick="if(event.target === this) closeHandoverModal()">
  <div class="w-full max-w-md max-h-[calc(100dvh-48px)] bg-white rounded-[28px] border border-[#F0EAE1] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
    
    <!-- 1. HEADER (PIN CHẶT TRÊN ĐỈNH VỚI APPTITLE LEVEL MODAL) -->
    <div class="flex items-center justify-between px-6 py-4.5 border-b border-[#F0EAE1] bg-[#FAF6F1]/90 backdrop-blur-md shrink-0 select-none">
      <span class="text-base sm:text-lg font-bold text-[#2D2424] font-serif tracking-tight flex items-center gap-2.5">
        <i data-lucide="arrow-right-left" class="w-5 h-5 text-[#2E7D6D]"></i>
        <span>Bàn Giao Tour Cho KTV Khác</span>
      </span>
      <button type="button" onclick="closeHandoverModal()" class="w-8 h-8 rounded-full bg-white hover:bg-[#FFF0EB] text-[#7E7272] hover:text-[#E58A7B] border border-[#EFE8DF] flex items-center justify-center transition cursor-pointer active:scale-90 shadow-2xs" title="Đóng">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>

    <!-- 2. BODY (CUỘN TỰ DO Ở GIỮA) -->
    <div class="p-6 overflow-y-auto space-y-4 overscroll-contain flex-1 text-sm text-[#2D2424]">
      <p class="text-xs text-[#7E7272] leading-relaxed bg-[#FAF6F1] p-3 rounded-2xl border border-[#F0EAE1]">
        ✨ Bạn bận việc hoặc mệt đột xuất? Bạn có thể chuyển tour này cho bạn KTV khác làm tiếp. Hệ thống sẽ tự động đồng bộ sang máy bạn ấy và chia hoa hồng công bằng.
      </p>

      <div class="space-y-1.5">
        <label class="block text-xs font-bold text-[#7E7272] uppercase tracking-wider">Chọn KTV Vào Thay Làm Tiếp:</label>
        <select id="handover-target-staff-select" onchange="updateHandoverPreview()" class="w-full bg-[#F7F2EC] border border-[#EFE8DF] rounded-2xl p-3.5 text-sm text-[#2D2424] font-bold focus:outline-none focus:border-[#2E7D6D] focus:bg-white transition cursor-pointer"></select>
      </div>

      <div class="space-y-2 pt-1">
        <label class="block text-xs font-bold text-[#7E7272] uppercase tracking-wider">Hình Thức Phân Chia Hoa Hồng:</label>
        <div class="grid grid-cols-2 gap-2.5">
          <button type="button" id="btn-handover-timer" onclick="setHandoverSplitMode('timer')" class="p-3 rounded-2xl border bg-[#E8F8F5] border-[#2E7D6D] text-[#2E7D6D] font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition">
            <span class="flex items-center gap-1 font-extrabold"><i data-lucide="clock" class="w-3.5 h-3.5"></i> Theo thời gian thực</span>
            <span id="handover-timer-hint" class="text-[10px] font-normal text-[#7E7272]">Tính theo số phút đã làm</span>
          </button>
          <button type="button" id="btn-handover-equal" onclick="setHandoverSplitMode('equal')" class="p-3 rounded-2xl border bg-[#F7F2EC] border-[#EFE8DF] text-[#7E7272] font-bold text-xs flex flex-col items-center gap-1 cursor-pointer transition">
            <span class="flex items-center gap-1 font-extrabold"><i data-lucide="handshake" class="w-3.5 h-3.5"></i> Chia đều 50 / 50</span>
            <span id="handover-equal-hint" class="text-[10px] font-normal text-[#7E7272]">Cưa đôi hoa hồng tour</span>
          </button>
        </div>
      </div>

      <div class="p-3.5 rounded-2xl bg-[#FAF6F1] border border-[#F0EAE1] text-xs space-y-2">
        <span class="font-bold text-[#7E7272] block pb-1 border-b border-[#F0EAE1]">Dự kiến phân bổ hoa hồng tour:</span>
        <div id="handover-preview-list" class="space-y-1.5"></div>
      </div>
    </div>

    <!-- 3. FOOTER (PIN CHẶT DƯỚI ĐÁY VỚI APPBUTTON) -->
    <div class="px-6 py-4 border-t border-[#F0EAE1] bg-[#FAF6F1]/90 backdrop-blur-md shrink-0 flex items-center justify-end gap-3">
      <button type="button" onclick="closeHandoverModal()" class="px-5 py-2.5 rounded-full text-xs font-bold text-[#7E7272] bg-[#FAF6F1] hover:bg-[#FFF0EB] border border-[#EFE8DF] transition active:scale-95 cursor-pointer">Đóng</button>
      <button type="button" id="btn-confirm-handover" onclick="confirmHandoverTour()" class="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#2E7D6D] to-[#25685B] hover:opacity-95 shadow-md shadow-[#2E7D6D]/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5">
        <i data-lucide="check" class="w-4 h-4"></i> Xác Nhận Bàn Giao
      </button>
    </div>

  </div>
</div>
"""
with open(hand_path, "w", encoding="utf-8") as f:
    f.write(hand_content)
print("Updated modal_handover.html!")

# 3. UPDATE modal_checkout.html
chk_path = os.path.join(BASE_DIR, "views", "components", "modals", "modal_checkout.html")
chk_content = """<!-- ============================================================= -->
<!-- MODAL THANH TOÁN 2 PHA (CHUẨN MODALSHELL & APPTITLE) -->
<!-- ============================================================= -->
<div id="modal-checkout" class="hidden fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-all duration-300">
  <div class="w-full max-w-md max-h-[calc(100dvh-48px)] bg-white rounded-[28px] border border-[#F0EAE1] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
    
    <!-- 🟢 PHA 1: MÀN HÌNH ĐƯA CHO KHÁCH XEM (HOÀN TOÀN GIẤU CHỮ TIPS) -->
    <div id="checkout-step-customer" class="flex flex-col flex-1 min-h-0">
      
      <!-- 1. PINNED HEADER PHA 1 -->
      <div class="flex items-center justify-between px-6 py-4.5 border-b border-[#F0EAE1] bg-[#FAF6F1]/90 backdrop-blur-md shrink-0 select-none">
        <div>
          <span class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFF0EB] text-[#E58A7B] text-xs font-bold">
            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Selena Spa • Thanh Toán
          </span>
          <h3 class="text-base sm:text-lg font-bold font-serif text-[#2D2424] mt-1">Thông Tin Thanh Toán</h3>
        </div>
        <button type="button" onclick="closeCheckoutModal()" class="w-8 h-8 rounded-full bg-white hover:bg-[#FFF0EB] text-[#7E7272] hover:text-[#E58A7B] border border-[#EFE8DF] flex items-center justify-center transition cursor-pointer active:scale-90 shadow-2xs" title="Đóng">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- 2. SCROLLABLE BODY PHA 1 -->
      <div class="p-6 overflow-y-auto space-y-4 overscroll-contain flex-1 text-sm text-[#2D2424]">
        <!-- Tóm tắt dịch vụ khách sử dụng -->
        <div class="p-4 rounded-2xl bg-[#FAF6F1] border border-[#F0EAE1] space-y-2 text-xs sm:text-sm">
          <div class="flex justify-between font-bold text-[#2D2424]">
            <span id="chk-service-name">Combo 2 (Gội Chuyên Sâu)</span>
            <span id="chk-service-price" class="text-[#E58A7B] text-base font-extrabold font-mono">99.000 đ</span>
          </div>
          <div class="flex justify-between text-[#7E7272]">
            <span>Thời gian liệu trình:</span>
            <span id="chk-time-range" class="font-mono font-semibold text-[#2D2424]">15:30 - 16:30 (60 phút)</span>
          </div>
          <div class="flex justify-between text-[#7E7272]">
            <span>Khách hàng:</span>
            <span id="chk-customer-name" class="font-semibold text-[#2D2424]">Chị Mai Lan</span>
          </div>
        </div>

        <!-- Chọn Phương thức thanh toán (QR hoặc Tiền mặt) -->
        <div class="space-y-2">
          <label class="block text-xs font-bold text-[#7E7272] uppercase tracking-wider">
            Hình Thức Thanh Toán
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button type="button" id="chk-btn-qr" onclick="setCheckoutPayment('Chuyển khoản')" class="p-3.5 rounded-2xl border bg-[#FFF0EB] border-[#E58A7B] text-[#E58A7B] font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer">
              <i data-lucide="qr-code" class="w-4 h-4"></i> Quét Mã QR
            </button>
            <button type="button" id="chk-btn-cash" onclick="setCheckoutPayment('Tiền mặt')" class="p-3.5 rounded-2xl border bg-[#F7F2EC] border-[#EFE8DF] text-[#7E7272] hover:bg-[#FFF0EB] font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer">
              <i data-lucide="banknote" class="w-4 h-4"></i> Tiền Mặt
            </button>
          </div>
        </div>

        <!-- 📱 KHUNG MÃ QR VIB CỦA TIỆM (ĐỂ ĐƯA KHÁCH QUÉT) -->
        <div id="chk-qr-display-box" class="p-2 sm:p-3 rounded-3xl bg-white border border-[#F0EAE1] text-center overflow-hidden">
          <img src="images/qr_bank.jpg?v=0.0.7.1" alt="Mã QR VIB" class="w-full h-auto object-contain rounded-2xl mx-auto shadow-2xs">
        </div>
      </div>

      <!-- 3. PINNED FOOTER PHA 1 -->
      <div class="px-6 py-4 border-t border-[#F0EAE1] bg-[#FAF6F1]/90 backdrop-blur-md shrink-0 flex items-center justify-end">
        <button type="button" onclick="goToStaffTipStep()" class="w-full py-3.5 rounded-full bg-gradient-to-r from-[#2E7D6D] to-[#25685B] hover:opacity-95 text-white font-extrabold text-sm shadow-lg shadow-[#2E7D6D]/25 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer">
          <span>Khách Đã Thanh Toán</span>
          <i data-lucide="arrow-right" class="w-4 h-4"></i>
        </button>
      </div>

    </div>

    <!-- 🔴 PHA 2: MÀN HÌNH BÍ MẬT DÀNH CHO KTV (NHẬP TIỀN TIP & XUẤT HÓA ĐƠN) -->
    <div id="checkout-step-staff" class="hidden flex flex-col flex-1 min-h-0">
      
      <!-- 1. PINNED HEADER PHA 2 -->
      <div class="flex items-center justify-between px-6 py-4.5 border-b border-[#F0EAE1] bg-[#FAF6F1]/90 backdrop-blur-md shrink-0 select-none">
        <div>
          <span class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E8F8F5] text-[#2E7D6D] text-xs font-bold">
            <i data-lucide="lock" class="w-3.5 h-3.5"></i> KTV • Xác Nhận Tiền Tip
          </span>
          <h3 class="text-base sm:text-lg font-bold font-serif text-[#2D2424] mt-1">Hoàn Tất Ca & Nhận Tip</h3>
        </div>
        <button type="button" onclick="backToCustomerStep()" class="text-xs font-bold text-[#7E7272] hover:text-[#2D2424] cursor-pointer">
          Quay lại
        </button>
      </div>

      <!-- 2. SCROLLABLE BODY PHA 2 -->
      <div class="p-6 overflow-y-auto space-y-4 overscroll-contain flex-1 text-sm text-[#2D2424]">
        <div>
          <label class="block text-xs font-bold text-[#2D2424] mb-1.5">Khách Có Tip Thêm Không?</label>
          <input type="number" id="chk-input-tips" placeholder="Nhập số tiền tip (VD: 50000)..." class="w-full bg-[#F7F2EC] border border-[#EFE8DF] rounded-2xl p-3.5 text-base font-bold text-[#E58A7B] focus:outline-none focus:border-[#E58A7B] focus:bg-white transition">
        </div>

        <div class="p-3.5 rounded-2xl bg-[#FAF6F1] border border-[#F0EAE1] text-xs space-y-1.5">
          <div class="flex justify-between text-[#7E7272]">
            <span>Tổng tiền tour:</span>
            <span id="chk-staff-tour-price" class="font-bold text-[#2D2424]">99.000 đ</span>
          </div>
          <div class="flex justify-between text-[#7E7272]">
            <span>Hoa hồng KTV:</span>
            <span id="chk-staff-comm-est" class="font-bold text-[#2E7D6D]">-- đ</span>
          </div>
        </div>
      </div>

      <!-- 3. PINNED FOOTER PHA 2 -->
      <div class="px-6 py-4 border-t border-[#F0EAE1] bg-[#FAF6F1]/90 backdrop-blur-md shrink-0 flex items-center justify-end gap-3">
        <button type="button" onclick="backToCustomerStep()" class="px-5 py-2.5 rounded-full text-xs font-bold text-[#7E7272] bg-[#FAF6F1] hover:bg-[#FFF0EB] border border-[#EFE8DF] transition active:scale-95 cursor-pointer">Sửa Lại</button>
        <button type="button" onclick="handleCompleteCheckout()" class="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#E58A7B] to-[#D9796A] hover:opacity-95 shadow-md shadow-[#E58A7B]/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5">
          <i data-lucide="check-circle" class="w-4 h-4"></i> Hoàn Tất & Lưu Ca
        </button>
      </div>

    </div>

  </div>
</div>
"""
with open(chk_path, "w", encoding="utf-8") as f:
    f.write(chk_content)
print("Updated modal_checkout.html!")

print("ALL TOUR MODALS (SWAP, HANDOVER, CHECKOUT) FULLY CONVERTED TO MODALSHELL STANDARD!")
