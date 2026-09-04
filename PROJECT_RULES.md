# 📜 BỘ QUY TẮC VÀNG VẬN HÀNH & PHÁT TRIỂN HỆ THỐNG SELENA SPA
*Tài liệu quy chuẩn tối thượng (Master Project Rules) dành cho toàn bộ quá trình phát triển, mở rộng và bảo trì hệ thống Selena Spa & Wellness.*

---

## ⭐️ 0. NGUYÊN TẮC BẮT BUỘC TRƯỚC VÀ SAU KHI CODE (SOP TOÀN DỰ ÁN)

### 1. Luôn Đọc Kiến Trúc, Database & Hồ Sơ Đặc Tả Component Trước Khi Bắt Đầu:
- Trước khi thực hiện bất kỳ yêu cầu, sửa lỗi hay nâng cấp tính năng nào, **BẮT BUỘC phải đọc kỹ 4 tài liệu nền tảng**:
  1. [`PROJECT_RULES.md`](PROJECT_RULES.md) (Bộ quy tắc vận hành & bảo mật).
  2. [`selena_spa_master_architecture.md`](selena_spa_master_architecture.md) (Bản thiết kế cấu trúc 1-1 HTML và JS).
  3. [`selena_spa_database_architecture.md`](selena_spa_database_architecture.md) (Bản hướng dẫn kiến trúc 9 bảng Google Sheets & luồng dữ liệu).
  4. **File `.md` tương ứng trong thư mục `docs/`** (Đọc kỹ 6 phần đặc tả của component sắp chỉnh sửa, đặc biệt là Mục 3 Phân Quyền Staff/Owner và Mục 5 Ánh Xạ Database).

### 2. Tạo Tính Năng / Component Mới Phải Tuân Thủ Tuyệt Đối Kiến Trúc Chuẩn & Tạo Docs 1-1:
- Khi tạo bất kỳ tính năng hoặc màn hình mới nào, **luôn dựa trên kiến trúc chuẩn để tạo ra module mới tương tự** nhằm đảm bảo tính đồng bộ 100%:
  - **Khung HTML tĩnh**: Tạo file riêng độc lập trong `views/`.
  - **Component xử lý giao diện JS**: Tạo file riêng độc lập trong `js/Components/` hoặc `js/Screens/`.
  - **Nghiệp vụ tính toán & Toán học lõi**: Tạo file riêng độc lập trong `js/Core/`.
  - **Hồ sơ đặc tả kỹ thuật**: BẮT BUỘC tạo 1 file `.md` mới tương ứng trong `docs/` theo đúng khung 6 phần chuẩn mực.

### 3. Luôn Cập Nhật Lại Kiến Trúc, Database & Mục 6 (Audit Log) Sau Khi Hoàn Thành:
- Sau khi hoàn thành bất kỳ tính năng mới hoặc thay đổi cấu trúc nào:
  - Cập nhật phiên bản (+1) và ghi nội dung đã sửa vào **Mục 6 (Lịch Sử Thay Đổi & Lưu Vết)** của file `.md` tương ứng trong `docs/`.
  - Nếu có thay đổi cấu trúc file/module: **Cập nhật lại `selena_spa_master_architecture.md` và `PROJECT_RULES.md`**.
  - Nếu có thay đổi Database: Tuân thủ nghiêm ngặt **Quy tắc 4 bước** trong [`selena_spa_database_architecture.md`](selena_spa_database_architecture.md) (Cập nhật Sheet $
ightarrow$ Cập nhật `Code.gs` $
ightarrow$ Triển khai New Deployment $
ightarrow$ Cập nhật tài liệu Database).

---

## 🏛️ 1. NGUYÊN TẮC CẤU TRÚC ĐỒNG BỘ 1-1 GIỮA HTML VÀ JAVASCRIPT
- Mọi thành phần giao diện (Modal, Khối POS, Màn hình) đều được chia nhỏ thành **cặp đôi 1-1 hoàn chỉnh**:
  - **Khung giao diện HTML tĩnh**: Đặt trong `views/components/modals/`, `views/components/pos/`, `views/staff/`, `views/owner/`.
  - **Logic xử lý động JavaScript**: Đặt tương ứng trong `js/Components/Modals/`, `js/Components/POS/`, `js/Screens/Staff/`, `js/Screens/Owner/`.
  - **Nghiệp vụ lõi & Công thức toán**: Đặt tách biệt hoàn toàn trong `js/Core/`.
- Mỗi file đảm nhiệm đúng một nhiệm vụ duy nhất (Single Responsibility), gọn gàng, trong sáng, tuyệt đối không gộp chung nhiều màn hình vào một file khổng lồ.

---

## 🔒 2. NGUYÊN TẮC BẢO MẬT & PHÂN QUYỀN (SECURITY & ISOLATION)
- Mã nguồn, component và giao diện của **KTV** và **Chủ Tiệm** phải được tách thành **2 Component/File độc lập hoàn toàn**.
- **Kỹ Thuật Viên (Staff)**: Số điện thoại luôn che `094*144`.
- **Chủ Tiệm (Owner)**: Hiển thị đầy đủ số điện thoại: `0949251144`.
- **Lưu dữ liệu**: Luôn tra cứu và gửi **Số điện thoại thật 10 số (`0949251144`)** về máy chủ, **tuyệt đối không gửi số bị cắt ngắn (như `94144`)**.
- **Tháng sinh nhật**:
  - Khách chưa có: KTV thấy ô chọn tháng để lưu lần đầu.
  - Khách đã có: **Ẩn hoàn toàn ô chọn tháng đối với KTV**, KTV chỉ thấy `• Sinh nhật: Tháng X`, chỉ Chủ tiệm mới có quyền sửa.

---

## 👥 3. NGUYÊN TẮC KTV, CA LÀM & ĐỒNG NGHIỆP CÙNG LÀM (STAFF & WORKFLOW)
- Hiện rõ `KTV cùng làm: [Tên Bạn Làm Cùng]` trên thẻ tour.
- Dùng nhãn thân thiện: **`Tiền tour:`** và **`Tiền tip:`**.
- Phân chia hoa hồng ca chung: **Theo thời gian thực tế** hoặc **Chia đều 50/50**.
- Bàn giao tour (Handover) đồng bộ sang KTV tiếp quản trong **0.03 giây**.

---

## 💰 4. NGUYÊN TẮC TÍNH TOÁN & KẾ TOÁN (PAYROLL & FINANCE)
- Hoa hồng tour: `10% + lương cứng` hoặc `20% thuần tour`.
- Khách dùng Voucher -> KTV **vẫn được hưởng hoa hồng theo giá gốc niêm yết của Combo**.
- Tiền tip 100% thuộc về KTV.
- **Tính lương tháng từ ngày 1 đến ngày 30**.
- Báo cáo Lợi nhuận ròng = $	ext{Doanh thu} - 	ext{Quỹ lương} - 	ext{Chi phí}$.
- Phân loại rõ: Tiền mặt có trong két vs Tiền chuyển khoản VIB (`TRẦN THU NGÂN - 799625591`).

---

## 🌸 5. MENU DỊCH VỤ, LÀM THÊM & SẢN PHẨM (MENU & ADD-ONS)
- Combo chính (Combo 1 - 5).
- Dịch vụ làm thêm (Add-ons: Cổ vai gáy, Đắp mặt nạ, Tẩy da đầu...).
- Sản phẩm bán kèm (Dầu gội bưởi, serum...).
- Tự cộng dồn thời lượng: `Combo chính + Dịch vụ thêm`.

---

## ⏱️ 6. QUY TRÌNH TẠO TOUR & THANH TOÁN KÍN ĐÁO (POS & SESSIONS)
- Đồng hồ đếm ngược trực quan.
- Thanh toán 2 pha: Pha 1 (Khách xem QR giấu tip) -> Pha 2 (KTV nhập tip riêng tư).

---

## 📅 7. LỊCH & THỜI GIAN (DATETIME)
- Làm mờ và khóa bấm (`pointer-events-none`) toàn bộ các ngày chưa tới trong tương lai.
- Triệt tiêu 100% độ lệch 17 phút lịch sử do múi giờ.

---

## 🎁 8. CHU KỲ 60 NGÀY & VOUCHER (LOYALTY)
- Khách đi đủ 10 lần trong 60 ngày -> Tự động tặng 1 lần gội miễn phí (100%).
- Quản lý chính xác hạn dùng voucher (30 / 60 / 90 ngày).

---

## 📢 9. THÔNG BÁO NỘI BỘ (ANNOUNCEMENT)
- Chủ tiệm phát thông báo qua `modal_announcement` -> Bắn banner lên đỉnh màn hình KTV trong 0.03s.

---

## 🏛️ 10. NGUYÊN TẮC LẬP TRÌNH & KIẾN TRÚC
1. **Không tự ý thay đổi cấu trúc hay logic nghiệp vụ mà không thảo luận và xin phép người dùng.**
2. **Single Source of Truth**: Mỗi công thức chỉ viết ở 1 file duy nhất.
3. **Micro-Components 1-1**: Khung HTML và mã JS tương ứng 1-1.
4. **Kiểm tra cú pháp trước khi triển khai**: Luôn chạy Node.js kiểm tra toàn bộ file JS trước khi commit và push.

---

## 🔢 11. NGUYÊN TẮC ĐÁNH SỐ PHIÊN BẢN HỆ THỐNG (DECIMAL VERSIONING RULE)
- **Quy tắc nhảy số tuần tự hệ thập phân (0 – 9 Rollover)**: Mỗi lần chỉnh sửa, cập nhật code hoặc tính năng mới, số phiên bản **BẮT BUỘC tăng tuần tự 1 đơn vị theo đúng chuỗi thập phân**:
  - `v0.0.0.1` $
ightarrow$ `v0.0.0.2` $
ightarrow$ ... $
ightarrow$ `v0.0.0.8` $
ightarrow$ `v0.0.0.9`
  - Sau `.9` $
ightarrow$ Nhảy số hàng trước thành: **`v0.0.1.0`**
  - Tiếp tục: `v0.0.1.0` $
ightarrow$ `v0.0.1.1` $
ightarrow$ ... $
ightarrow$ `v0.0.1.9` $
ightarrow$ **`v0.0.2.0`**
  - Khi đạt đến `v0.0.9.9` $
ightarrow$ Nhảy tiếp thành: **`v0.1.0.0`**
  - Khi đạt đến `v0.9.9.9` $
ightarrow$ Nhảy tiếp thành: **`v1.0.0.0`** (Bản phát hành chính thức toàn diện)
- **Tuyệt đối không nhảy cóc**: Không được bỏ qua bất kỳ số nào trong chuỗi thập phân.
- **Đồng bộ bắt buộc tại 4 vị trí**:
  1. `index.html` (Toàn bộ query string `?v=v0.0.0.x` của các file script, css, icon, manifest).
  2. `js/config.js` (`const APP_VERSION = 'v0.0.0.x';`).
  3. `views/login.html` (Dòng text hiển thị phiên bản ở chân trang đăng nhập).
  4. Mục 6 (Audit Log) của các file trong `docs/`.

---

## 📝 12. NGUYÊN TẮC LUÔN CẬP NHẬT TÀI LIỆU ĐẶC TẢ (.MD) TRƯỚC KHI CODE (DOCS-FIRST WORKFLOW)
- **Quy trình bắt buộc (Docs-First Rule)**: Khi chuẩn bị làm bất kỳ tính năng, thay đổi giao diện, thêm kịch bản nghiệp vụ hay sửa lỗi cho module nào, AI Assistant **BẮT BUỘC phải mở và cập nhật đầy đủ 100% kịch bản nghiệp vụ vào file `.md` tương ứng trong thư mục `docs/` TRƯỚC KHI bắt tay vào viết code**.
- **Cấm viết code chay**: Tuyệt đối không được viết code trực tiếp trên HTML/JS nếu chưa cập nhật tài liệu đặc tả `.md` của module đó.
- **Nội dung chuẩn 6 phần bắt buộc trong file `.md`**:
  1. **Mục đích & Bối cảnh thực tế tại tiệm**.
  2. **Danh sách file cấu thành** (Khung HTML, Mã JS, Core Services).
  3. **Quy tắc giao diện & Toàn bộ kịch bản nghiệp vụ chi tiết** (UI Scenarios, Edge cases, quyền hạn Staff vs Admin).
  4. **Luồng xử lý logic & Quản lý state** (State variables, công thức tính tiền/giờ với LaTeX).
  5. **Ánh xạ cơ sở dữ liệu chi tiết** (Cột nào trong `tb_menu`, `tb_receipts`, `tb_customers`, `tb_payroll_logs`, `tb_config`...).
  6. **Lịch sử thay đổi & Lưu vết (Audit Log)**: Ghi rõ ngày tháng và phiên bản hệ thống (Ví dụ: `- 2026-09-01 (v0.0.1.7): ...`).

---

## 📋 13. NGUYÊN TẮC XUẤT VÀ GỬI DỮ LIỆU DATABASE CHO GOOGLE SHEETS (SHEETS COPY-PASTE STANDARD)
Mỗi khi người dùng yêu cầu gửi mã dữ liệu / dữ liệu mẫu / bảng database để dán vào Google Sheets, AI Assistant **BẮT BUỘC tuân thủ 100% các tiêu chuẩn kỹ thuật sau**:

1. **Định Dạng Chuẩn Tab (Tab-Separated Values - TSV) Dạng Khối Mã (` ```text `)**:
   - Dữ liệu giữa các cột **BẮT BUỘC phân tách bằng ký tự Tab (`\t`)**, mỗi bản ghi trên 1 dòng.
   - Đặt trong khối mã text để người dùng bấm copy toàn bộ khối, chọn ô **A1** trên Google Sheet và ấn **Ctrl + V (Dán)** là dữ liệu tự động dàn đều vào từng cột, từng hàng chuẩn xác $100\%$.
   - **Tuyệt đối không dùng bảng Markdown có dấu gạch đứng (`|`)** khi gửi dữ liệu để paste vào Sheets (vì sẽ bị dính ký tự `|` vào dữ liệu ô tính).

2. **Quy Tắc Tiền Tệ & Con Số (Pure Integer Number Rule)**:
   - Mọi giá trị tiền tệ (giá dịch vụ, tiền hoa hồng, tiền tip, chi phí mỹ phẩm, lương...), số phút, số lượng **BẮT BUỘC PHẢI LÀ SỐ NGUYÊN THUẦN TÚY (Ví dụ: `45000`, `64000`, `109000`)**.
   - **TUYỆT ĐỐI CẤM**:
     - ❌ Không thêm chữ `"đ"`, `"VNĐ"`, `"$"`.
     - ❌ Không thêm dấu chấm `.` hoặc dấu phẩy `,` phân cách hàng nghìn (để Google Sheets có thể dùng các hàm tính toán `SUM`, `AVERAGE` bình thường).

3. **Quy Tắc Kiểu Dữ Liệu Logic (Boolean) & Header**:
   - Dòng 1 luôn là Header đúng chuẩn tên cột tiếng Anh viết thường hoặc snake_case (`service_id`, `service_name`, `price`...).
   - Các cột trạng thái logic phải ghi chữ in hoa chuẩn: **`TRUE`** hoặc **`FALSE`**.

---

## 🌐 14. NGUYÊN TẮC ĐỌC VÀ ĐỒNG BỘ DỮ LIỆU TỪ GOOGLE SHEETS THỰC TẾ (REAL GOOGLE SHEETS DATABASE SOURCE OF TRUTH)
1. **Đường Dẫn Nguồn Dữ Liệu Duy Nhất (Single Source of Truth URL)**:
   - Toàn bộ cơ sở dữ liệu thực tế của hệ thống Selena Spa được lưu trữ và quản lý tại Google Spreadsheet chính thức:
     `https://docs.google.com/spreadsheets/d/1SFFR2sWmOxtRIMOkdlkuKIDYyXJM7IxNyP9gFtZY0L0/edit?usp=sharing`
2. **Quy Định Nghiêm Ngặt Về Đọc Dữ Liệu (No Hallucinated Data Rule)**:
   - Khi cần kiểm tra, đọc dữ liệu, đối soát cấu trúc hoặc đồng bộ (`tb_users`, `tb_menu`, `tb_customers`, `tb_receipts`, `tb_payroll_logs`, `tb_config`, `tb_expenses`, `tb_customer_audits`...), AI Assistant **BẮT BUỘC phải đọc trực tiếp từ link Google Sheets thực tế nêu trên** (qua API/Export URL `gviz/tq?tqx=out:csv&sheet={sheet_name}`).
   - **TUYỆT ĐỐI CẤM TỰ Ý TƯỞNG TƯỢNG, BỊA ĐẶT HAY VẼ VỜI DỮ LIỆU ẢO**: Không được tự suy diễn tên dịch vụ, giá tiền, mã KTV, tên cột hay nội dung cấu hình mà không đối chiếu với Sheet thực tế.
3. **Quy Tắc Khi Tạo Dữ Liệu Mẫu / Test Data**:
   - Chỉ được phép tạo dữ liệu mẫu khi có **lệnh yêu cầu trực tiếp bằng văn bản từ người dùng**.
   - Ngay cả khi tạo dữ liệu mẫu để test, **BẮT BUỘC PHẢI DỰA 100% VÀO CẤU TRÚC TIÊU ĐỀ (HEADER COLUMNS) THỰC TẾ CỦA GOOGLE SHEETS**, tuyệt đối không được tự ý đổi tên cột, thiếu cột hoặc chế thêm cột lạ làm sai lệch hệ thống.

---

## 🧩 15. NGUYÊN TẮC HỆ THỐNG UI SYSTEM & REUSABLE COMPONENTS (TAILWIND 4 COMPONENT-DRIVEN)
Nhằm đảm bảo giao diện thống nhất $100\%$ giữa Admin và Staff, dễ dàng tùy biến giao diện bằng **Tailwind 4** mà **chỉ cần sửa đúng 1 nơi duy nhất**, toàn bộ dự án tuân thủ các quy chuẩn sau:

1. **Kiến Trúc Module Tách Biệt Theo File Độc Lập (`js/Core/Components/`)**:
   - Mỗi loại thành phần giao diện được đặt trong **1 file riêng biệt** mang tên thành phần đó (theo chuẩn snake_case):
     + `app_button.js`: Nút bấm hành động toàn app (`AppButton`).
     + `stat_card.js`: Thẻ số liệu & thành tích (`StatCard`).
     + `status_badge.js`: Huy hiệu trạng thái Sẵn sàng / Trong tour (`StatusBadge`).
     + `app_title.js`: Chuẩn hóa kiểu dáng tiêu đề toàn hệ thống (`AppTitle`).
     + `role_badge.js`: Huy hiệu vai trò Chủ tiệm / KTV (`RoleBadge`).
     + `bed_card.js`: Thẻ giám sát giường trực tiếp (`BedCard`).
     + `home_banner.js`: Khung banner chào đón (`HomeBanner`).
     + `modal_shell.js`: Khung nền popup chuẩn (`ModalShell`).
   - Tuyệt đối không gộp chung toàn bộ component vào 1 file khổng lồ khó quản lý.

2. **Nguyên Tắc Phân Tách Trách Nhiệm (Decoupling Giao Diện vs Dữ Liệu/Hành Động)**:
   - **Component chỉ quản lý GIAO DIỆN**: Màu sắc Tailwind 4, bo góc, hiệu ứng hover/active, bóng đổ, icon.
   - **Nơi gọi component truyền vào DỮ LIỆU & HÀNH ĐỘNG**:
     + `text` hoặc `configKey`: Câu chữ hiển thị (gõ trực tiếp hoặc lấy tự động từ `tb_config` trên Google Sheets).
     + `onClick`: Hành động khi bấm (hàm chuyển tab `showView`, mở modal, thanh toán...).
     + `variant` / `color` / `size` / `level`: Chọn biến thể hiển thị theo ngữ cảnh.

3. **Mô Hình Khung Xương & Nội Thất (Hybrid Architecture với `views/`)**:
   - Thư mục `views/` giữ các file HTML đóng vai trò **khung sườn (Layout Skeleton)** với các hộp `<div>` rỗng sạch sẽ.
   - JavaScript Component chịu trách nhiệm "bơm nội thất" chi tiết vào các hộp đó khi nạp trang.

4. **Phương Thức Render Chuẩn (Cách 2 - Kẹp Chung Nguyên Khối Template Literals `${...}`)**:
   - Toàn bộ các component con (như `${AppTitle()}`, `${StatCard()}`, `${AppButton()}`) được nhúng trực tiếp trong cùng một khối chuỗi Template Literals `${...}`.
   - Chỉ thực hiện **1 lần ghi DOM duy nhất (Single DOM Write)** qua `innerHTML` cho cả cụm để đạt hiệu năng tối ưu (<1ms), triệt tiêu hoàn toàn hiện tượng chớp tắt (FOUC), không gây nóng máy và bảo vệ pin thiết bị di động tối đa.

5. **Quy Chuẩn Chống Nóng Máy, Tràn RAM & Tối Ưu Hóa DOM (DOM & Memory Optimization Rules)**:
   - **Tuyệt đối không nhồi nhét dữ liệu lớn vào thuộc tính DOM**: Thẻ HTML chỉ lưu trữ ID định danh ngắn (như `sessionId`, `receiptId`), không bao giờ nhét cả chuỗi JSON dữ liệu lớn vào thuộc tính `data-*` gây phình to cây DOM và rò rỉ bảo mật.
   - **Chống rò rỉ bộ nhớ (Memory Leaks)**: Sử dụng cơ chế hành động ủy quyền hoặc gọi hàm trực tiếp (`onclick="handleFunc()"`) thay vì gán `addEventListener` vô tội vạ trong các hàm render lặp lại làm tràn RAM thiết bị.
   - **Cập nhật trúng đích cục bộ (Targeted DOM Mutation)**: Khi dữ liệu từ Google Sheets (`tb_config`) hoặc Firebase Realtime bắn về, hệ thống chỉ cập nhật chính xác phần tử DOM cần đổi (bằng `innerText` hoặc `textContent`), tuyệt đối không xóa đi vẽ lại toàn bộ trang web gây giật lag hoặc hao pin.

6. **Quy Chuẩn Thiết Kế Popup Modal Chuẩn Mobile (`ModalShell`)**:
   - **Header ghim chặt trên đỉnh (Sticky Top)**: Luôn cố định tiêu đề và nút đóng tròn ✕ để người dùng có thể đóng modal bất kỳ lúc nào mà không bị trôi khi cuộn.
   - **Body cuộn tự do ở giữa (Scrollable Center)**: Cuộn mượt mà với `overflow-y-auto overscroll-contain flex-1`.
   - **Footer ghim chặt dưới đáy (Sticky Bottom)**: Luôn hiển thị sẵn các nút bấm hành động (`AppButton` Lưu / Hủy / Xác nhận) để người dùng bấm ngay mà không cần phải cuộn chuột xuống đáy.
   - **Chiều cao tối đa thông minh**: Giới hạn trong khoảng `max-h-[calc(100dvh-48px)]` trừ khoảng đệm trên dưới vừa mắt, bo góc cong chuẩn `rounded-[28px]` và lớp phủ mờ `backdrop-blur-sm`.

7. **Quy Định Bắt Buộc Áp Dụng `ModalShell` & `AppTitle` Cho Mọi Popup**:
   - Mọi Popup Modal trong toàn bộ hệ thống (dù viết qua JS Component hay template HTML) **BẮT BUỘC $100\%$ PHẢI TUÂN THỦ CẤU TRÚC 3 TẦNG CỦA `ModalShell`**:
     + **Header Pinned**: Tiêu đề chuẩn `${AppTitle({ level: 'modal' })}` (font serif sang trọng) và nút đóng tròn ✕ cố định trên đỉnh.
     + **Body Scrollable**: Nội dung cuộn tự do ở giữa với `overflow-y-auto overscroll-contain flex-1`.
     + **Footer Pinned**: Các nút bấm hành động chuẩn `${AppButton()}` ghim chặt dưới đáy, không bị trôi khi cuộn.
     + **Chiều cao tối đa**: Luôn giới hạn `max-h-[calc(100dvh-48px)]` và bo góc cong `rounded-[28px]`.
   - Tuyệt đối cấm viết mã HTML modal tự do làm lệch chuẩn giao diện giữa các tính năng.
