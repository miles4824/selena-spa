# -*- coding: utf-8 -*-
import os

BASE_DIR = r"c:\Users\Miles\Downloads\Selena"

modal_html = """<!-- MODAL ĐỔI & THÊM DỊCH VỤ GIỮA CA PHỤC VỤ (CHUẨN MODALSHELL & APPTITLE) -->
<div id="modal-edit-live-services" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm hidden transition-all duration-300">
  <div class="w-full max-w-lg max-h-[calc(100dvh-48px)] bg-white rounded-[28px] border border-[#F0EAE1] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
    
    <!-- 1. HEADER (PIN CHẶT TRÊN ĐỈNH VỚI APPTITLE LEVEL MODAL) -->
    <div class="flex items-center justify-between px-6 py-4.5 border-b border-[#F0EAE1] bg-[#FAF6F1]/90 backdrop-blur-md shrink-0 select-none">
      <div class="flex items-center gap-2.5">
        <i data-lucide="refresh-cw" class="w-5 h-5 text-[#E58A7B]"></i>
        <div>
          <h3 class="text-base sm:text-lg font-bold text-[#2D2424] font-serif tracking-tight">Điều Chỉnh Dịch Vụ</h3>
          <p id="modal-edit-live-customer-info" class="text-[11px] text-[#7E7272] mt-0.5">Khách: Khách vãng lai</p>
        </div>
      </div>
      <button type="button" onclick="closeModalEditLiveServices()" class="w-8 h-8 rounded-full bg-white hover:bg-[#FFF0EB] text-[#7E7272] hover:text-[#E58A7B] border border-[#EFE8DF] flex items-center justify-center transition cursor-pointer active:scale-90 shadow-2xs" title="Đóng">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>

    <!-- 2. BODY (CUỘN TỰ DO Ở GIỮA) -->
    <div class="p-6 overflow-y-auto space-y-4 overscroll-contain flex-1 text-sm text-[#2D2424]">
      
      <!-- HÀNG 1: CHỌN NHANH COMBO (SINGLE COMBO RULE) -->
      <div class="space-y-2">
        <div class="text-[11px] font-extrabold text-[#7E7272] flex items-center gap-1.5">
          <i data-lucide="zap" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
          <span>Gói Combo Chính (Tối đa 1 combo):</span>
        </div>
        <div id="modal-edit-live-quick-combos" class="flex flex-wrap gap-2"></div>
      </div>

      <!-- ĐƯỜNG DASH NGĂN CÁCH -->
      <div class="border-t border-dashed border-[#E8E1D7] my-2"></div>

      <!-- HÀNG 2: MULTI-TAG COMBOBOX DỊCH VỤ ĐÃ CHỌN -->
      <div class="space-y-2.5">
        <div class="flex justify-between items-center px-0.5">
          <span class="text-xs font-black text-[#7E7272] uppercase tracking-wider flex items-center gap-1.5">
            <i data-lucide="clipboard-list" class="w-3.5 h-3.5 text-[#2E7D6D]"></i> Dịch Vụ Đang Chọn:
          </span>
          <span id="modal-edit-live-count-badge" class="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#E8F8F5] text-[#2E7D6D] border border-[#B7EBDD]">
            1 dịch vụ
          </span>
        </div>

        <!-- HỘP MULTI-TAGS KÈM DROPDOWN TRIGGER -->
        <div class="relative">
          <div id="modal-edit-live-tag-container" class="min-h-[56px] p-3 bg-white border border-[#E8E1D7] hover:border-[#E58A7B]/60 rounded-2xl flex flex-col gap-2.5 cursor-pointer transition-all focus-within:border-[#E58A7B] focus-within:ring-2 focus-within:ring-[#E58A7B]/20 shadow-2xs" onclick="toggleModalCustomDropdownPopover(event)">
            <!-- Danh sách Chips dịch vụ -->
            <div id="modal-edit-live-chips-list" class="flex flex-wrap gap-2.5"></div>
            
            <!-- Nút trigger mở menu thả xuống -->
            <div id="modal-edit-live-trigger-row" class="w-full flex items-center justify-between text-xs font-bold text-[#7E7272] hover:text-[#E58A7B] py-3 mt-1 px-3 rounded-xl bg-[#FAF6F1]/80 hover:bg-[#FFF0EB] transition border border-dashed border-[#EAE2D7]">
              <span id="modal-edit-live-placeholder-text" class="flex items-center gap-1.5 truncate">
                <i data-lucide="plus-circle" class="w-3.5 h-3.5 text-[#E58A7B]"></i>
                <span>-- Chọn thêm dịch vụ từ menu --</span>
              </span>
              <i id="modal-edit-live-chevron" data-lucide="chevron-down" class="w-4 h-4 text-[#A39696] transition-transform duration-200 shrink-0 ml-1"></i>
            </div>
          </div>

          <!-- DROPDOWN DANH SÁCH DỊCH VỤ DẠNG POPOVER NỔI -->
          <div id="modal-edit-live-custom-dropdown-popover" class="hidden absolute left-0 right-0 top-full mt-2 bg-white border border-[#E8E1D7] rounded-2xl shadow-2xl z-[9999] overflow-hidden animate-in fade-in zoom-in-95 duration-150" onclick="event.stopPropagation()">
            <!-- Ô TÌM KIẾM DỊCH VỤ NHANH -->
            <div class="p-3 border-b border-[#FAF6F1] bg-[#FAF6F1]/60">
              <div class="relative">
                <i data-lucide="search" class="w-3.5 h-3.5 text-[#A39696] absolute left-3 top-1/2 -translate-y-1/2"></i>
                <input type="text" id="modal-edit-live-search-input" placeholder="Tìm tên dịch vụ..." oninput="filterModalServicesDropdown(this.value)" class="w-full pl-8 pr-3 py-1.5 bg-white border border-[#EFE8DF] rounded-xl text-xs text-[#2D2424] font-medium focus:outline-none focus:border-[#E58A7B]">
              </div>
            </div>

            <!-- DANH SÁCH CÁC MÓN PHÂN LOẠI COMBO / DỊCH VỤ LẺ -->
            <div id="modal-edit-live-dropdown-scrollable" class="max-h-60 overflow-y-auto divide-y divide-[#FAF6F1] overscroll-contain"></div>
          </div>
        </div>
      </div>

      <!-- HÀNG 3: BẢNG TÍNH LẠI GIÁ VÀ THỜI LƯỢNG MỚI -->
      <div class="p-3.5 rounded-2xl bg-[#FFF0EB]/40 border border-[#FCDFD7] flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-xl bg-white border border-[#FCDFD7] flex items-center justify-center text-[#E58A7B] shadow-2xs">
            <i data-lucide="receipt" class="w-4 h-4"></i>
          </div>
          <div>
            <span class="text-[11px] font-extrabold text-[#7E7272] uppercase tracking-wider block">Tổng Thanh Toán Mới</span>
            <div id="modal-edit-live-total-price" class="text-xl font-black font-mono text-[#E58A7B] tracking-tight leading-none mt-0.5">64.000 đ</div>
          </div>
        </div>

        <div class="flex flex-col items-end">
          <div class="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#E8E1D7] text-xs font-black text-[#2E7D6D] shadow-2xs">
            <i data-lucide="clock" class="w-3.5 h-3.5"></i>
            <span id="modal-edit-live-total-duration">50 phút</span>
          </div>
          <span id="modal-edit-live-remaining-note" class="text-[10px] text-[#7E7272] font-semibold mt-1">Còn lại khoảng 45 phút</span>
        </div>
      </div>

    </div>

    <!-- 3. FOOTER (PIN CHẶT DƯỚI ĐÁY VỚI APPBUTTON) -->
    <div class="px-6 py-4 border-t border-[#F0EAE1] bg-[#FAF6F1]/90 backdrop-blur-md shrink-0 flex items-center justify-end gap-3">
      <button type="button" onclick="closeModalEditLiveServices()" class="px-5 py-2.5 rounded-full text-xs font-bold text-[#7E7272] bg-[#FAF6F1] hover:bg-[#FFF0EB] border border-[#EFE8DF] transition active:scale-95 cursor-pointer">Hủy / Đóng</button>
      <button type="button" onclick="saveModalEditLiveServices()" class="px-6 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#E58A7B] to-[#D9796A] hover:opacity-95 shadow-md shadow-[#E58A7B]/20 transition active:scale-95 cursor-pointer flex items-center gap-1.5">
        <i data-lucide="check" class="w-4 h-4"></i> Xác Nhận Thay Đổi
      </button>
    </div>

  </div>
</div>
"""

# Update views/components/modals/modal_edit_live_services.html
modal_file_path = os.path.join(BASE_DIR, "views", "components", "modals", "modal_edit_live_services.html")
with open(modal_file_path, "w", encoding="utf-8") as f:
    f.write(modal_html)
print("Updated views/components/modals/modal_edit_live_services.html!")

# Update views/add.html
add_html_path = os.path.join(BASE_DIR, "views", "add.html")
with open(add_html_path, "r", encoding="utf-8") as f:
    add_text = f.read()

split_marker = "<!-- MODAL ĐỔI & THÊM DỊCH VỤ GIỮA CA PHỤC VỤ (MODAL EDIT LIVE SERVICES) -->"
if split_marker in add_text:
    prefix = add_text.split(split_marker)[0]
    add_text = prefix + modal_html
    with open(add_html_path, "w", encoding="utf-8") as f:
        f.write(add_text)
    print("Updated views/add.html modal-edit-live-services!")
else:
    print("Marker not found in views/add.html")
