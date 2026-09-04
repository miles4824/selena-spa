# -*- coding: utf-8 -*-
import os

BASE_DIR = r"c:\Users\Miles\Downloads\Selena"

# 1. UPDATE modal_add_expense.html
exp_path = os.path.join(BASE_DIR, "views", "components", "modals", "modal_add_expense.html")
exp_content = """<!-- ADD EXPENSE MODAL (CHUẨN MODALSHELL & APPTITLE) -->
<div id="modal-add-expense" class="hidden fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-all duration-300">
  <div class="w-full max-w-md max-h-[calc(100dvh-48px)] bg-white rounded-[28px] border border-[#F0EAE1] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
    
    <!-- 1. HEADER (PIN CHẶT TRÊN ĐỈNH VỚI APPTITLE LEVEL MODAL) -->
    <div class="flex items-center justify-between px-6 py-4.5 border-b border-[#F0EAE1] bg-[#FAF6F1]/90 backdrop-blur-md shrink-0 select-none">
      <span class="text-base sm:text-lg font-bold text-[#2D2424] font-serif tracking-tight flex items-center gap-2.5">
        <i data-lucide="receipt" class="w-5 h-5 text-[#E58A7B]"></i>
        <span>Nhập Chi Phí Phát Sinh</span>
      </span>
      <button type="button" onclick="closeAddExpenseModal()" class="w-8 h-8 rounded-full bg-white hover:bg-[#FFF0EB] text-[#7E7272] hover:text-[#E58A7B] border border-[#EFE8DF] flex items-center justify-center transition cursor-pointer active:scale-90 shadow-2xs" title="Đóng">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>

    <!-- 2. BODY (CUỘN TỰ DO Ở GIỮA) -->
    <div class="p-6 overflow-y-auto space-y-4 overscroll-contain flex-1 text-sm text-[#2D2424]">
      <form id="form-add-expense" onsubmit="handleSaveExpenseForm(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-[#2D2424] mb-1.5">Loại chi phí</label>
          <select id="input-exp-type" class="w-full bg-[#F7F2EC] border border-[#EFE8DF] rounded-2xl p-3.5 text-sm text-[#2D2424] font-medium focus:outline-none focus:border-[#E58A7B] transition cursor-pointer">
            <option value="Điện sấy">Điện sấy & máy lạnh</option>
            <option value="Điện cố định">Điện sinh hoạt cố định</option>
            <option value="Nước cố định">Tiền nước sạch</option>
            <option value="Mạng Internet">Mạng wifi internet</option>
            <option value="Mặt bằng">Tiền thuê mặt bằng</option>
            <option value="Mỹ phẩm & Dầu gội">Mua thêm dầu gội, mỹ phẩm</option>
            <option value="Khác">Chi phí khác</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-[#2D2424] mb-1.5">Số tiền (VNĐ)</label>
          <input type="number" id="input-exp-amount" placeholder="Ví dụ: 350000" class="w-full bg-[#F7F2EC] border border-[#EFE8DF] rounded-2xl p-3.5 text-base font-bold text-[#2D2424] focus:outline-none focus:border-[#E58A7B] transition" required>
        </div>
        <div>
          <label class="block text-xs font-bold text-[#2D2424] mb-1.5">Ghi chú</label>
          <input type="text" id="input-exp-note" placeholder="Ghi chú chi tiết khoản chi..." class="w-full bg-[#F7F2EC] border border-[#EFE8DF] rounded-2xl p-3.5 text-sm text-[#2D2424] focus:outline-none focus:border-[#E58A7B] transition">
        </div>
      </form>
    </div>

    <!-- 3. FOOTER (PIN CHẶT DƯỚI ĐÁY VỚI APPBUTTON) -->
    <div class="px-6 py-4 border-t border-[#F0EAE1] bg-[#FAF6F1]/90 backdrop-blur-md shrink-0 flex items-center justify-end gap-3">
      <button type="button" onclick="closeAddExpenseModal()" class="px-5 py-2.5 rounded-full text-xs font-bold text-[#7E7272] bg-[#FAF6F1] hover:bg-[#FFF0EB] border border-[#EFE8DF] transition active:scale-95 cursor-pointer">Đóng</button>
      <button type="submit" form="form-add-expense" class="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#E58A7B] to-[#D9796A] hover:opacity-95 shadow-md shadow-[#E58A7B]/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5">
        <i data-lucide="check" class="w-4 h-4"></i> Lưu Chi Phí
      </button>
    </div>

  </div>
</div>
"""
with open(exp_path, "w", encoding="utf-8") as f:
    f.write(exp_content)
print("Updated modal_add_expense.html!")

# 2. UPDATE modal_announcement.html
ann_path = os.path.join(BASE_DIR, "views", "components", "modals", "modal_announcement.html")
ann_content = """<!-- EDIT ANNOUNCEMENT MODAL (CHUẨN MODALSHELL & APPTITLE) -->
<div id="modal-edit-announcement" class="hidden fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-all duration-300">
  <div class="w-full max-w-md max-h-[calc(100dvh-48px)] bg-white rounded-[28px] border border-[#F0EAE1] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
    
    <!-- 1. HEADER (PIN CHẶT TRÊN ĐỈNH VỚI APPTITLE LEVEL MODAL) -->
    <div class="flex items-center justify-between px-6 py-4.5 border-b border-[#F0EAE1] bg-[#FAF6F1]/90 backdrop-blur-md shrink-0 select-none">
      <span class="text-base sm:text-lg font-bold text-[#2D2424] font-serif tracking-tight flex items-center gap-2.5">
        <i data-lucide="megaphone" class="w-5 h-5 text-[#E58A7B]"></i>
        <span>Phát Thông Báo Cho KTV</span>
      </span>
      <button type="button" onclick="closeEditAnnouncementModal()" class="w-8 h-8 rounded-full bg-white hover:bg-[#FFF0EB] text-[#7E7272] hover:text-[#E58A7B] border border-[#EFE8DF] flex items-center justify-center transition cursor-pointer active:scale-90 shadow-2xs" title="Đóng">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>

    <!-- 2. BODY (CUỘN TỰ DO Ở GIỮA) -->
    <div class="p-6 overflow-y-auto space-y-4 overscroll-contain flex-1 text-sm text-[#2D2424]">
      <p class="text-xs text-[#7E7272] leading-relaxed bg-[#FAF6F1] p-3 rounded-2xl border border-[#F0EAE1]">
        ✨ Thông báo sẽ hiển thị nổi bật trên màn hình Home của toàn bộ Kỹ Thuật Viên và đồng bộ về Google Sheet (tab tb_config).
      </p>
      
      <form id="form-edit-announcement" onsubmit="handleSaveAnnouncement(event)" class="space-y-3.5">
        <div>
          <label class="block text-xs font-bold text-[#2D2424] mb-1.5">Nội dung thông báo:</label>
          <textarea id="input-announcement-content" rows="4" placeholder="Nhập thông báo gửi đến toàn thể kỹ thuật viên..." class="w-full bg-[#F7F2EC] border border-[#EFE8DF] rounded-2xl p-3.5 text-sm text-[#2D2424] focus:outline-none focus:border-[#E58A7B] focus:bg-white transition leading-relaxed" required></textarea>
        </div>
      </form>
    </div>

    <!-- 3. FOOTER (PIN CHẶT DƯỚI ĐÁY VỚI APPBUTTON) -->
    <div class="px-6 py-4 border-t border-[#F0EAE1] bg-[#FAF6F1]/90 backdrop-blur-md shrink-0 flex items-center justify-end gap-3">
      <button type="button" onclick="closeEditAnnouncementModal()" class="px-5 py-2.5 rounded-full text-xs font-bold text-[#7E7272] bg-[#FAF6F1] hover:bg-[#FFF0EB] border border-[#EFE8DF] transition active:scale-95 cursor-pointer">Đóng</button>
      <button type="submit" form="form-edit-announcement" class="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#E58A7B] to-[#D9796A] hover:opacity-95 shadow-md shadow-[#E58A7B]/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5">
        <i data-lucide="send" class="w-4 h-4"></i> Phát Thông Báo
      </button>
    </div>

  </div>
</div>
"""
with open(ann_path, "w", encoding="utf-8") as f:
    f.write(ann_content)
print("Updated modal_announcement.html!")

# 3. UPDATE modal_owner_customer.html
own_path = os.path.join(BASE_DIR, "views", "components", "modals", "modal_owner_customer.html")
own_content = """<!-- COMPONENT: MODAL QUẢN TRỊ HỒ SƠ KHÁCH HÀNG (CHỦ TIỆM - CHUẨN MODALSHELL & APPTITLE) -->
<div id="modal-owner-customer-editor" class="hidden fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-all duration-300" onclick="if(event.target === this) closeOwnerCustomerEditorModal()">
  <div class="w-full max-w-md max-h-[calc(100dvh-48px)] bg-white rounded-[28px] border border-[#F0EAE1] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
    
    <!-- 1. HEADER (PIN CHẶT TRÊN ĐỈNH VỚI APPTITLE LEVEL MODAL) -->
    <div class="flex items-center justify-between px-6 py-4.5 border-b border-[#F0EAE1] bg-[#FAF6F1]/90 backdrop-blur-md shrink-0 select-none">
      <span class="text-base sm:text-lg font-bold text-[#2D2424] font-serif tracking-tight flex items-center gap-2.5">
        <i data-lucide="shield-check" class="w-5 h-5 text-[#2E7D6D]"></i>
        <span>Hồ Sơ Khách Hàng (Chủ Tiệm)</span>
      </span>
      <button type="button" onclick="closeOwnerCustomerEditorModal()" class="w-8 h-8 rounded-full bg-white hover:bg-[#FFF0EB] text-[#7E7272] hover:text-[#E58A7B] border border-[#EFE8DF] flex items-center justify-center transition cursor-pointer active:scale-90 shadow-2xs" title="Đóng">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>

    <!-- 2. BODY (CUỘN TỰ DO Ở GIỮA) -->
    <div class="p-6 overflow-y-auto space-y-4 overscroll-contain flex-1 text-sm text-[#2D2424]">
      <form id="form-owner-customer-editor" onsubmit="handleSaveOwnerCustomerEditor(event)" class="space-y-3.5">
        <input type="hidden" id="modal-owner-edit-raw-phone">
        <input type="hidden" id="modal-owner-edit-receipt-id">

        <!-- HÀNG 1: SỐ ĐIỆN THOẠI (TOÀN CHIỀU RỘNG) -->
        <div>
          <label class="block text-xs font-bold text-[#2D2424] mb-1 flex items-center gap-1.5">
            <i data-lucide="phone" class="w-3.5 h-3.5 text-[#2E7D6D]"></i> Số Điện Thoại:
          </label>
          <div class="relative">
            <input type="tel" id="modal-owner-edit-phone" placeholder="Số điện thoại" class="w-full bg-[#F7F2EC] border border-[#EFE8DF] rounded-2xl p-3 text-xs sm:text-sm text-[#2D2424] font-bold focus:outline-none focus:border-[#2E7D6D] focus:bg-white transition" required>
          </div>
        </div>

        <!-- HÀNG 2: [TÊN KHÁCH HÀNG] [SINH NHẬT] (GRID 2 CỘT) -->
        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block text-xs font-bold text-[#2D2424] mb-1 flex items-center gap-1.5">
              <i data-lucide="user" class="w-3.5 h-3.5 text-[#2E7D6D]"></i> Tên Khách Hàng:
            </label>
            <input type="text" id="modal-owner-edit-name" placeholder="Tên khách hàng" class="w-full bg-[#F7F2EC] border border-[#EFE8DF] rounded-2xl p-3 text-xs sm:text-sm text-[#2D2424] font-bold focus:outline-none focus:border-[#2E7D6D] focus:bg-white transition" required>
          </div>
          <div>
            <label class="block text-xs font-bold text-[#2D2424] mb-1 flex items-center gap-1.5">
              <i data-lucide="cake" class="w-3.5 h-3.5 text-[#2E7D6D]"></i> Sinh Nhật:
            </label>
            <select id="modal-owner-edit-birth-month" onchange="this.style.color = this.value ? '#2D2424' : '#A39696'" style="color: #A39696;" class="w-full bg-[#F7F2EC] border border-[#EFE8DF] rounded-2xl p-3 text-xs sm:text-sm font-bold focus:outline-none focus:border-[#2E7D6D] focus:bg-white transition cursor-pointer">
              <option value="">-- Tháng --</option>
              <option value="1">Tháng 1</option>
              <option value="2">Tháng 2</option>
              <option value="3">Tháng 3</option>
              <option value="4">Tháng 4</option>
              <option value="5">Tháng 5</option>
              <option value="6">Tháng 6</option>
              <option value="7">Tháng 7</option>
              <option value="8">Tháng 8</option>
              <option value="9">Tháng 9</option>
              <option value="10">Tháng 10</option>
              <option value="11">Tháng 11</option>
              <option value="12">Tháng 12</option>
            </select>
          </div>
        </div>

        <!-- Thống kê chu kỳ 60 ngày của khách -->
        <div class="p-3.5 rounded-2xl bg-[#FAF6F1] border border-[#F0EAE1] text-xs space-y-2 text-[#7E7272]">
          <div class="flex justify-between items-center">
            <span class="flex items-center gap-1.5"><i data-lucide="rotate-cw" class="w-3.5 h-3.5 text-[#2E7D6D]"></i> Chu kỳ tích điểm (60 ngày):</span>
            <span id="modal-owner-edit-cycle-visits" class="font-extrabold text-[#2E7D6D]">1 / 10 lần</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="flex items-center gap-1.5"><i data-lucide="gift" class="w-3.5 h-3.5 text-[#E58A7B]"></i> Số voucher hiện có:</span>
            <span id="modal-owner-edit-voucher-count" class="font-extrabold text-[#E58A7B]">0 voucher</span>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-[#2D2424] mb-1 flex items-center gap-1.5">
            <i data-lucide="file-text" class="w-3.5 h-3.5 text-[#2E7D6D]"></i> Ghi Chú Sở Thích / Lưu Ý:
          </label>
          <textarea id="modal-owner-edit-notes" rows="3" placeholder="Ghi chú chi tiết sở thích hoặc lưu ý về khách..." class="w-full bg-[#F7F2EC] border border-[#EFE8DF] rounded-2xl p-3 text-xs sm:text-sm text-[#2D2424] focus:outline-none focus:border-[#2E7D6D] focus:bg-white transition leading-relaxed"></textarea>
        </div>
      </form>
    </div>

    <!-- 3. FOOTER (PIN CHẶT DƯỚI ĐÁY VỚI APPBUTTON) -->
    <div class="px-6 py-4 border-t border-[#F0EAE1] bg-[#FAF6F1]/90 backdrop-blur-md shrink-0 flex items-center justify-end gap-3">
      <button type="button" onclick="closeOwnerCustomerEditorModal()" class="px-5 py-2.5 rounded-full text-xs font-bold text-[#7E7272] bg-[#FAF6F1] hover:bg-[#FFF0EB] border border-[#EFE8DF] transition active:scale-95 cursor-pointer">Đóng</button>
      <button type="submit" form="form-owner-customer-editor" class="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#2E7D6D] to-[#256659] hover:opacity-95 shadow-md shadow-[#2E7D6D]/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5">
        <i data-lucide="check" class="w-4 h-4"></i> Cập Nhật Hồ Sơ
      </button>
    </div>

  </div>
</div>
"""
with open(own_path, "w", encoding="utf-8") as f:
    f.write(own_content)
print("Updated modal_owner_customer.html!")

# 4. UPDATE modal_staff_note.html
staff_path = os.path.join(BASE_DIR, "views", "components", "modals", "modal_staff_note.html")
staff_content = """<!-- COMPONENT: MODAL GHI CHÚ DÀNH CHO KTV (STAFF - CHUẨN MODALSHELL & APPTITLE) -->
<div id="modal-staff-customer-note" class="hidden fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-all duration-300" onclick="if(event.target === this) closeStaffCustomerNoteModal()">
  <div class="w-full max-w-md max-h-[calc(100dvh-48px)] bg-white rounded-[28px] border border-[#F0EAE1] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
    
    <!-- 1. HEADER (PIN CHẶT TRÊN ĐỈNH VỚI APPTITLE LEVEL MODAL) -->
    <div class="flex items-center justify-between px-6 py-4.5 border-b border-[#F0EAE1] bg-[#FAF6F1]/90 backdrop-blur-md shrink-0 select-none">
      <div class="flex items-center gap-2.5">
        <i data-lucide="edit-3" class="w-5 h-5 text-[#E58A7B]"></i>
        <div>
          <h3 class="text-base sm:text-lg font-bold text-[#2D2424] font-serif tracking-tight" id="modal-staff-note-name">Ghi Chú Khách Hàng</h3>
          <p class="text-[11px] text-[#7E7272] font-mono" id="modal-staff-note-phone">094*144</p>
        </div>
      </div>
      <button type="button" onclick="closeStaffCustomerNoteModal()" class="w-8 h-8 rounded-full bg-white hover:bg-[#FFF0EB] text-[#7E7272] hover:text-[#E58A7B] border border-[#EFE8DF] flex items-center justify-center transition cursor-pointer active:scale-90 shadow-2xs" title="Đóng">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>

    <!-- 2. BODY (CUỘN TỰ DO Ở GIỮA) -->
    <div class="p-6 overflow-y-auto space-y-4 overscroll-contain flex-1 text-sm text-[#2D2424]">
      <form id="form-staff-customer-note" onsubmit="handleSaveStaffCustomerNote(event)" class="space-y-3.5">
        <input type="hidden" id="modal-staff-note-raw-phone">
        <input type="hidden" id="modal-staff-note-receipt-id">
        <input type="hidden" id="modal-staff-note-is-guest" value="0">
        
        <!-- CỤM KHUNG GOM BỔ SUNG THÔNG TIN KHÁCH (CHỈ HIỆN KHI LÀ KHÁCH VÃNG LAI) -->
        <div id="modal-staff-note-guest-inputs" class="hidden space-y-3 bg-[#FAF6F1] p-3.5 rounded-2xl border border-[#FCDFD7]">
          <div class="text-xs font-bold text-[#E58A7B] flex items-center justify-between">
            <span class="flex items-center gap-1.5"><i data-lucide="user-plus" class="w-4 h-4 text-[#E58A7B]"></i> Bổ Sung Thông Tin Khách:</span>
            <span id="modal-staff-note-lookup-badge" class="text-[10px] px-2 py-0.5 rounded-full bg-white font-semibold text-[#7E7272] border border-[#F0EAE1]">Nhập SĐT để dò tìm</span>
          </div>

          <!-- HÀNG 1: SỐ ĐIỆN THOẠI & DROPDOWN GỢI Ý CHUẨN POS -->
          <div class="relative">
            <label class="block text-xs font-bold text-[#2D2424] mb-1 flex items-center gap-1.5">
              <i data-lucide="phone" class="w-3.5 h-3.5 text-[#E58A7B]"></i> Số Điện Thoại:
            </label>
            <div class="relative">
              <input type="tel" id="modal-staff-note-guest-phone" oninput="onStaffGuestPhoneInput(this.value)" onfocus="onStaffGuestPhoneInput(this.value)" autocomplete="off" placeholder="Số điện thoại" class="w-full bg-white border border-[#EFE8DF] rounded-xl p-2.5 text-xs sm:text-sm text-[#2D2424] font-bold focus:outline-none focus:border-[#E58A7B] transition">
            </div>
            <!-- BẢNG SỔ XUỐNG GỢI Ý CHUẨN POS -->
            <div id="modal-staff-note-suggestions" class="hidden absolute left-0 right-0 top-full mt-1 bg-white border border-[#EFE8DF] rounded-2xl shadow-2xl z-[999] max-h-52 overflow-y-auto divide-y divide-[#FAF6F1]"></div>
            <p id="modal-staff-note-phone-hint" class="text-[11px] text-[#A39696] mt-1 italic hidden"></p>
          </div>

          <!-- HÀNG 2: [TÊN KHÁCH HÀNG] [SINH NHẬT] (GRID 2 CỘT) -->
          <div class="grid grid-cols-2 gap-2.5">
            <div>
              <label class="block text-xs font-bold text-[#2D2424] mb-1 flex items-center gap-1.5">
                <i data-lucide="user" class="w-3.5 h-3.5 text-[#E58A7B]"></i> Tên Khách Hàng:
              </label>
              <input type="text" id="modal-staff-note-guest-name" placeholder="Tên khách hàng" class="w-full bg-white border border-[#EFE8DF] rounded-xl p-2.5 text-xs sm:text-sm text-[#2D2424] font-medium focus:outline-none focus:border-[#E58A7B] transition">
            </div>

            <div id="modal-staff-note-guest-month-container">
              <label class="block text-xs font-bold text-[#2D2424] mb-1 flex items-center gap-1.5">
                <i data-lucide="cake" class="w-3.5 h-3.5 text-[#E58A7B]"></i> Sinh Nhật:
              </label>
              <select id="modal-staff-note-guest-birth-month" onchange="this.style.color = this.value ? '#2D2424' : '#A39696'" style="color: #A39696;" class="w-full bg-white border border-[#EFE8DF] rounded-xl p-2.5 text-xs sm:text-sm font-bold focus:outline-none focus:border-[#E58A7B] transition cursor-pointer">
                <option value="">-- Tháng --</option>
                <option value="1">Tháng 1</option>
                <option value="2">Tháng 2</option>
                <option value="3">Tháng 3</option>
                <option value="4">Tháng 4</option>
                <option value="5">Tháng 5</option>
                <option value="6">Tháng 6</option>
                <option value="7">Tháng 7</option>
                <option value="8">Tháng 8</option>
                <option value="9">Tháng 9</option>
                <option value="10">Tháng 10</option>
                <option value="11">Tháng 11</option>
                <option value="12">Tháng 12</option>
              </select>
            </div>
          </div>
        </div>

        <!-- CỤM CHECKBOX SỞ THÍCH GỘI NHANH -->
        <div>
          <label class="block text-xs font-bold text-[#2D2424] mb-2 flex items-center gap-1.5">
            <i data-lucide="sparkles" class="w-3.5 h-3.5 text-[#E58A7B]"></i> Sở Thích / Yêu Cầu Phục Vụ:
          </label>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF6F1] border border-[#F0EAE1] hover:border-[#E58A7B]/40 transition cursor-pointer">
              <input type="checkbox" name="staff-pref-tag" value="Gội mạnh tay" class="accent-[#E58A7B] rounded">
              <span>Gội mạnh tay</span>
            </label>
            <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF6F1] border border-[#F0EAE1] hover:border-[#E58A7B]/40 transition cursor-pointer">
              <input type="checkbox" name="staff-pref-tag" value="Gãi nhẹ nhàng" class="accent-[#E58A7B] rounded">
              <span>Gãi nhẹ nhàng</span>
            </label>
            <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF6F1] border border-[#F0EAE1] hover:border-[#E58A7B]/40 transition cursor-pointer">
              <input type="checkbox" name="staff-pref-tag" value="Thích bấm huyệt" class="accent-[#E58A7B] rounded">
              <span>Thích bấm huyệt</span>
            </label>
            <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF6F1] border border-[#F0EAE1] hover:border-[#E58A7B]/40 transition cursor-pointer">
              <input type="checkbox" name="staff-pref-tag" value="Thích nói chuyện" class="accent-[#E58A7B] rounded">
              <span>Thích nói chuyện</span>
            </label>
            <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF6F1] border border-[#F0EAE1] hover:border-[#E58A7B]/40 transition cursor-pointer">
              <input type="checkbox" name="staff-pref-tag" value="Thích yên tĩnh" class="accent-[#E58A7B] rounded">
              <span>Thích yên tĩnh</span>
            </label>
            <label class="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF6F1] border border-[#F0EAE1] hover:border-[#E58A7B]/40 transition cursor-pointer">
              <input type="checkbox" name="staff-pref-tag" value="Nước ấm vừa" class="accent-[#E58A7B] rounded">
              <span>Nước ấm vừa</span>
            </label>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-[#2D2424] mb-1.5 flex items-center gap-1.5">
            <i data-lucide="file-text" class="w-3.5 h-3.5 text-[#E58A7B]"></i> Ghi Chú Chi Tiết Khác:
          </label>
          <textarea id="modal-staff-note-text" rows="3" placeholder="Ví dụ: Khách hay mỏi vai gáy, thích tinh dầu bưởi..." class="w-full bg-[#F7F2EC] border border-[#EFE8DF] rounded-2xl p-3 text-xs sm:text-sm text-[#2D2424] focus:outline-none focus:border-[#E58A7B] focus:bg-white transition leading-relaxed"></textarea>
        </div>
      </form>
    </div>

    <!-- 3. FOOTER (PIN CHẶT DƯỚI ĐÁY VỚI APPBUTTON) -->
    <div class="px-6 py-4 border-t border-[#F0EAE1] bg-[#FAF6F1]/90 backdrop-blur-md shrink-0 flex items-center justify-end gap-3">
      <button type="button" onclick="closeStaffCustomerNoteModal()" class="px-5 py-2.5 rounded-full text-xs font-bold text-[#7E7272] bg-[#FAF6F1] hover:bg-[#FFF0EB] border border-[#EFE8DF] transition active:scale-95 cursor-pointer">Đóng</button>
      <button type="submit" form="form-staff-customer-note" class="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#E58A7B] to-[#D9796A] hover:opacity-95 shadow-md shadow-[#E58A7B]/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5">
        <i data-lucide="check" class="w-4 h-4"></i> Lưu Ghi Chú
      </button>
    </div>

  </div>
</div>
"""
with open(staff_path, "w", encoding="utf-8") as f:
    f.write(staff_content)
print("Updated modal_staff_note.html!")

# 5. UPDATE modal_gift_voucher.html
gift_path = os.path.join(BASE_DIR, "views", "components", "modals", "modal_gift_voucher.html")
gift_content = """<!-- MODAL CHỦ TIỆM TẶNG VOUCHER CHO KHÁCH HÀNG (CHUẨN MODALSHELL & APPTITLE) -->
<div id="modal-gift-voucher" class="hidden fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm transition-all duration-300" onclick="if(event.target === this) closeGiftVoucherModal()">
  <div class="w-full max-w-md max-h-[calc(100dvh-48px)] bg-white rounded-[28px] border border-[#F0EAE1] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
    
    <!-- 1. HEADER (PIN CHẶT TRÊN ĐỈNH VỚI APPTITLE LEVEL MODAL) -->
    <div class="flex items-center justify-between px-6 py-4.5 border-b border-[#F0EAE1] bg-[#FAF6F1]/90 backdrop-blur-md shrink-0 select-none">
      <div class="flex items-center gap-2.5">
        <i data-lucide="gift" class="w-5 h-5 text-[#2E7D6D]"></i>
        <div>
          <h3 class="text-base sm:text-lg font-bold text-[#2D2424] font-serif tracking-tight">Tặng Voucher Khách Hàng</h3>
          <p class="text-[11px] text-[#7E7272]" id="modal-gift-cust-info">Chị Mai Lan (0912345678)</p>
        </div>
      </div>
      <button type="button" onclick="closeGiftVoucherModal()" class="w-8 h-8 rounded-full bg-white hover:bg-[#FFF0EB] text-[#7E7272] hover:text-[#E58A7B] border border-[#EFE8DF] flex items-center justify-center transition cursor-pointer active:scale-90 shadow-2xs" title="Đóng">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>

    <!-- 2. BODY (CUỘN TỰ DO Ở GIỮA) -->
    <div class="p-6 overflow-y-auto space-y-4 overscroll-contain flex-1 text-sm text-[#2D2424]">
      <form id="form-gift-voucher" onsubmit="handleSaveGiftVoucher(event)" class="space-y-3.5">
        <input type="hidden" id="modal-gift-raw-phone">
        <input type="hidden" id="modal-gift-cust-name">

        <div>
          <label class="block text-xs font-bold text-[#2D2424] mb-1.5">Loại Voucher Ưu Đãi:</label>
          <select id="modal-gift-type" onchange="onGiftTypeChange(this.value)" class="w-full bg-[#F7F2EC] border border-[#EFE8DF] rounded-2xl p-3 text-xs sm:text-sm text-[#2D2424] font-bold focus:outline-none focus:border-[#E58A7B] focus:bg-white transition cursor-pointer">
            <option value="Chủ tiệm tặng 1 lần">Tặng 1 Lần Gội Miễn Phí (100%)</option>
            <option value="Giảm 20% sinh nhật">Giảm 20% Hóa Đơn</option>
            <option value="Giảm tiền mặt">Giảm Số Tiền Cố Định (50.000 đ)</option>
          </select>
        </div>

        <div id="modal-gift-val-box" class="hidden">
          <label class="block text-xs font-bold text-[#2D2424] mb-1.5">Giá trị giảm:</label>
          <input type="text" id="modal-gift-val" value="50.000 đ" class="w-full bg-[#F7F2EC] border border-[#EFE8DF] rounded-2xl p-3 text-xs sm:text-sm text-[#2D2424] font-bold focus:outline-none focus:border-[#E58A7B] focus:bg-white transition">
        </div>

        <div>
          <label class="block text-xs font-bold text-[#2D2424] mb-1.5">Hạn Sử Dụng (Kể từ hôm nay):</label>
          <select id="modal-gift-days" class="w-full bg-[#F7F2EC] border border-[#EFE8DF] rounded-2xl p-3 text-xs sm:text-sm text-[#2D2424] font-bold focus:outline-none focus:border-[#E58A7B] focus:bg-white transition cursor-pointer">
            <option value="30">Hạn 30 ngày (1 tháng)</option>
            <option value="60" selected>Hạn 60 ngày (2 tháng)</option>
            <option value="90">Hạn 90 ngày (3 tháng)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-bold text-[#2D2424] mb-1.5">Lý Do / Ghi Chú Tặng:</label>
          <input type="text" id="modal-gift-notes" value="Tri ân khách hàng thân thiết" placeholder="VD: Khách VIP, Quà tri ân..." class="w-full bg-[#F7F2EC] border border-[#EFE8DF] rounded-2xl p-3 text-xs sm:text-sm text-[#2D2424] focus:outline-none focus:border-[#E58A7B] focus:bg-white transition">
        </div>
      </form>
    </div>

    <!-- 3. FOOTER (PIN CHẶT DƯỚI ĐÁY VỚI APPBUTTON) -->
    <div class="px-6 py-4 border-t border-[#F0EAE1] bg-[#FAF6F1]/90 backdrop-blur-md shrink-0 flex items-center justify-end gap-3">
      <button type="button" onclick="closeGiftVoucherModal()" class="px-5 py-2.5 rounded-full text-xs font-bold text-[#7E7272] bg-[#FAF6F1] hover:bg-[#FFF0EB] border border-[#EFE8DF] transition active:scale-95 cursor-pointer">Đóng</button>
      <button type="submit" form="form-gift-voucher" id="btn-save-gift-voucher" class="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#2E7D6D] to-[#25685B] hover:opacity-95 shadow-md shadow-[#2E7D6D]/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5">
        <i data-lucide="gift" class="w-4 h-4"></i> Xác Nhận Tặng
      </button>
    </div>

  </div>
</div>
"""
with open(gift_path, "w", encoding="utf-8") as f:
    f.write(gift_content)
print("Updated modal_gift_voucher.html!")

# 6. UPDATE PROJECT_RULES.md
rules_path = os.path.join(BASE_DIR, "PROJECT_RULES.md")
with open(rules_path, "r", encoding="utf-8") as f:
    r_text = f.read()

r_addition = """
7. **Quy Định Bắt Buộc Áp Dụng `ModalShell` & `AppTitle` Cho Mọi Popup**:
   - Mọi Popup Modal trong toàn bộ hệ thống (dù viết qua JS Component hay template HTML) **BẮT BUỘC $100\%$ PHẢI TUÂN THỦ CẤU TRÚC 3 TẦNG CỦA `ModalShell`**:
     + **Header Pinned**: Tiêu đề chuẩn `${AppTitle({ level: 'modal' })}` (font serif sang trọng) và nút đóng tròn ✕ cố định trên đỉnh.
     + **Body Scrollable**: Nội dung cuộn tự do ở giữa với `overflow-y-auto overscroll-contain flex-1`.
     + **Footer Pinned**: Các nút bấm hành động chuẩn `${AppButton()}` ghim chặt dưới đáy, không bị trôi khi cuộn.
     + **Chiều cao tối đa**: Luôn giới hạn `max-h-[calc(100dvh-48px)]` và bo góc cong `rounded-[28px]`.
   - Tuyệt đối cấm viết mã HTML modal tự do làm lệch chuẩn giao diện giữa các tính năng.
"""

if "7. **Quy Định Bắt Buộc Áp Dụng `ModalShell`" not in r_text:
    r_text = r_text.strip() + "\n" + r_addition
    with open(rules_path, "w", encoding="utf-8") as f:
        f.write(r_text)
    print("Updated PROJECT_RULES.md with item 7 mandatory modal rule!")

print("ALL MODALS AND RULES UPDATED TO MODALSHELL STANDARD SUCCESSFULLY!")
