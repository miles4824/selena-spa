# 📌 ĐẶC TẢ SẢN PHẨM & KỸ THUẬT: MODAL ĐIỀU CHỈNH & ĐỔI KTV TRONG CA

## 1. Mục Đích & Bối Cảnh Nghiệp Vụ Thực Tế
- Khi đang gội đầu mà cần thêm KTV vào phụ gội/massage, hoặc KTV chính có việc bận cần chuyển giao cho KTV khác làm tiếp, modal này giúp điều chỉnh danh sách KTV và tự động phân chia tiền hoa hồng công bằng.

## 2. Danh Sách File Cấu Thành (HTML & JS)
- **File Khung HTML**: `views/components/modals/modal_swap_staff.html`
- **File JS Xử lý giao diện**: `js/Components/Modals/modal_swap_staff.js` & `js/Add/pos_checkout.js`
- **Hàm Toán học lõi**: `js/Core/Payroll/split_commission.js`

## 3. Quy Tắc Giao Diện & Kịch Bản Phân Quyền Chi Tiết (UI Scenarios & Permissions)

### 🟢 KỊCH BẢN 1: CHẾ ĐỘ PHÂN CHIA THEO THỜI GIAN THỰC (TÍNH THEO PHÚT)
- Hệ thống đếm chính xác KTV 1 đã làm bao nhiêu phút, KTV 2 làm bao nhiêu phút.
- Tỷ lệ hoa hồng tự động chia theo công thức: $	ext{Tỷ lệ KTV 1} = rac{	ext{Phút KTV 1}}{	ext{Tổng phút làm ca}}$.

### 🤝 KỊCH BẢN 2: CHẾ ĐỘ CHIA ĐỀU (50 / 50)
- Hai KTV thống nhất cưa đôi hoa hồng tour.
- Mỗi KTV nhận đúng $50\%$ hoa hồng của ca gội đó.

## 4. Luồng Xử Lý Logic & Hành Vi Hệ Thống (Business Logic)
1. KTV bấm nút *"Đổi / Thêm KTV"* trên đồng hồ POS $
ightarrow$ Mở modal.
2. Cho phép bấm `+ Thêm KTV vào tour này` hoặc bấm icon thùng rác để xóa bớt KTV.
3. Chọn 1 trong 2 chế độ chia tiền $
ightarrow$ Hệ thống tự tính bảng phân bổ tiền dự kiến.
4. Bấm *"Xác Nhận Thay Đổi"* $
ightarrow$ Cập nhật mảng KTV phục vụ của ca trên Firebase.

## 5. Ánh Xạ Cơ Sở Dữ Liệu Chi Tiết (Database Mapping)
- **Bảng Google Sheets**: `tb_payroll_logs`
- **Cột Đọc / Ghi**: Cột N (`commission_pct`), Cột O (`commission_amount`).
- **Hàm Backend GAS phụ trách**: `createReceipt(params)` ghi nhận từng dòng KTV tương ứng.

## 6. Lịch Sử Thay Đổi & Lưu Vết (Audit Log)
- `2026-09-03` (`v0.1.1.7`): Khắc phục triệt để lỗi ReferenceError `activeStaffItems` trong hàm `renderSwapModalStaffUI` khi kiểm tra điều kiện hiển thị nút thêm KTV.
- `2026-09-03` (`v0.1.1.6`): Hiển thị toàn bộ danh sách thẻ KTV theo đúng dòng thời gian tuần tự (Chặng 2 nằm dưới cùng sau chặng 1); checkbox sử dụng ô vuông màu `#E58A7B` với dấu checkmark màu trắng sắc nét `text-white stroke-[3.5]` theo đúng hình mẫu.
- `2026-09-03` (`v0.1.1.5`): Sử dụng Checkbox nguyên bản chuẩn giao diện phẳng, phủ màu hồng đào thương hiệu Selena (`accent-[#E58A7B]`), tinh gọn, trực quan và tiện dụng trên mọi thiết bị.
- `2026-09-03` (`v0.1.1.4`): Đưa danh sách KTV đang làm `htmlActive` lên đầu và khối `KTV ĐÃ RỜI CA` xuống dưới các KTV đang làm; nâng cấp nút bật tắt `Xong việc rời sớm` sang dạng Toggle Switch phong cách iOS cao cấp, mượt mà và sang trọng.
- `2026-09-03` (`v0.1.1.3`): Khôi phục lại bảng màu cam đào / hồng san hô đặc trưng của Selena Spa (`#E58A7B` và `#FFF0EB`) cho checkbox và nút bấm `Xác nhận xong việc` dạng bo tròn `rounded-full border-2`.
- `2026-09-03` (`v0.1.1.2`): Cập nhật UI Checkbox `Xong việc rời sớm` sang dạng thẻ bo góc viền ngọc bích `#2E7D6D` kèm ô tích vuông sắc nét; nút `Xác nhận xong việc` đổi sang dạng bo tròn `rounded-full border-2` theo đúng hình mẫu thiết kế.
- `2026-09-03` (`v0.1.1.1`): Khắc phục lỗi dropdown trống ở KTV chặng 2; tự động disable dropdown khi không còn KTV rảnh nào khác để đổi; sắp xếp khối `KTV ĐÃ RỜI CA` lên trên các chặng đang làm theo đúng dòng thời gian; nâng cấp UI checkbox rời sớm sang dạng chip pill cao cấp với biểu tượng checkmark mượt mà.
- `2026-09-03` (`v0.1.1.0`): Triển khai cơ chế Multi-Segment Staff (KTV làm nhiều chặng ngắt quãng trong 1 tour) với thuật toán tính hoa hồng chính xác từng chặng, không hưởng tiền khoảng trống vắng mặt; phân tách rõ ràng với nút `Hoàn tác (bấm nhầm)`.
- `2026-09-02` (`v0.1.0.9`): Cập nhật tiêu đề `font-medium text-xl uppercase` cho cả 2 tiêu đề `Điều Chỉnh KTV Tour Này` và `Xác Nhận Rời Tour Sớm`; phóng to và làm đẹp checkbox `Xong việc rời sớm` với `accent-[#E58A7B] w-4 h-4`; đổi tên nút hành động thành `Xác nhận xong việc`.
- `2026-09-02` (`v0.1.0.8`): Tinh gọn thẻ KTV trong modal: bỏ dropdown trên thẻ KTV Chính; ẩn số % của KTV khác để bảo mật thu nhập; trên màn hình KTV Phụ ẩn hoàn toàn dropdown và dòng thời gian của các KTV khác; đổi nhãn nút thành `Xác Nhận Rời Tour` (bỏ dấu tick ✓).
- `2026-09-02` (`v0.1.0.6`): Tách biệt rõ ràng giữa trạng thái xem trước khi tích checkbox (`wants_early_leave`) và hành động thực thi rời ca (`left_early`); khi tích checkbox chỉ làm hiện nút `Xong Việc Rời Tour Sớm` và cập nhật xem trước, chỉ khi người dùng bấm nút thì mới chính thức hoàn tất rời ca.
- `2026-09-02` (`v0.1.0.5`): Mặc định ô thời gian kết thúc là định mức tour (`[ 50 ] / 50p`); khi tích chọn checkbox `Xong việc rời sớm` thì tự động nhảy sang phút hiện tại và làm hiện nút `Xong Việc Rời Tour Sớm` để bấm rời tour ngay.
- `2026-09-02` (`v0.1.0.4`): Sửa lỗi checkbox `Xong việc rời sớm` cho phép tích chọn / hủy chọn linh hoạt; đổi tên nút hành động thành `Xong Việc Rời Tour Sớm`.
- `2026-09-02` (`v0.1.0.3`): Ô số phút kết thúc `[ X ]` trong modal tự động khởi tạo bằng số phút hiện tại của tour (`currentElapsedMin`) theo thời gian thực thay vì mặc định 50 phút.
- `2026-09-02` (`v0.1.0.2`): Tối ưu nhận diện quyền KTV Chính / Admin mở rộng theo cả phone, staff_id và active_staff; đồng bộ chính xác số phút rời ca thực tế `left_min` giữa KTV Phụ và máy KTV Chính / Admin.
- `2026-09-02` (`v0.1.0.1`): Gán tường minh `window.onSwapStaffSelectChange` và tất cả các hàm xử lý modal vào `window` global scope, triệt tiêu hoàn toàn lỗi `ReferenceError` khi người dùng thao tác dropdown.
- `2026-09-02` (`v0.1.0.0`): Bổ sung hàm `onSwapStaffSelectChange` xử lý đổi người trong modal; áp dụng chuẩn làm tròn thời gian thực tế: từ 30 giây trở lên (`>= 30s`) được làm tròn lên +1 phút.
- `2026-09-02` (`v0.0.9.7`): KTV Phụ bấm `Xong Việc Rời Tour Sớm` sẽ mở modal xác nhận với số phút thực tế chính xác; ẩn các nút `Đổi / Thêm` và `Bàn Giao` trên màn hình của KTV Phụ; nút hành động chuyển thành `Xác Nhận Rời Tour`.
- `2026-09-02` (`v0.0.9.6`): Phân quyền nghiêm ngặt trong modal: KTV Phụ chỉ xem thông tin dạng chỉ đọc (chỉ hiện 2 ô số, ẩn nút cho nghỉ và checkbox); chỉ KTV Chính/Admin mới có quyền chỉnh sửa. Đồng bộ tự động nội dung modal theo thời gian thực khi đang mở.
- `2026-09-02` (`v0.0.9.5`): KTV Chính có thể cho KTV Phụ nghỉ ca trực tiếp từ nút trong modal; KTV đã rời ca được tự động gỡ khỏi `Danh Sách KTV Đang Làm` và chip màn hình chính, đưa vào danh sách lịch sử giai đoạn đã hoàn thành.
- `2026-09-02` (`v0.0.9.4`): Bổ sung nút bấm trực tiếp `Xong việc rời tour sớm` bên trong từng thẻ KTV Phụ của modal Điều Chỉnh KTV; xử lý thoát hoàn toàn màn hình đếm số cho KTV Phụ sau khi rời ca thành công.
- `2026-09-02` (`v0.0.9.3`): Khôi phục ô nhập số phút kết thúc cho phép chỉnh sửa thủ công và checkbox `Xong việc rời sớm` trong modal; thêm hàm `calculateLiveSessionStaffSplits` tính toán lại hoa hồng tức thì cho tất cả KTV khi có người rời ca sớm.
- `2026-09-02` (`v0.0.9.2`): Tự động phát hiện KTV rời tour sớm để chuyển sang chế độ `timer` đa giai đoạn (Giai đoạn 1 KTV Chính, Giai đoạn 2 Cùng làm, Giai đoạn 3 KTV Chính làm tiếp 100%); giải phóng trạng thái bận để KTV rời ca có thể nhận tour mới.
- `2026-09-02` (`v0.0.9.0`): Cập nhật hiển thị thời gian làm việc của KTV phụ theo dạng `Làm từ phút: [input] ➔ [leftMin] / [50p]` với mốc phút kết thúc tự động cập nhật khi rời tour sớm.
- `2026-09-02` (`v0.0.8.9`): Khắc phục lỗi `ReferenceError: s is not defined` trong `renderSwapModalStaffUI` bằng cách đồng bộ tên biến đối tượng KTV.
- `2026-09-02` (`v0.0.8.8`): Lược bỏ ô nhập số kết thúc và checkbox 'Xong việc rời sớm' trong modal Điều Chỉnh KTV (chỉ giữ lại ô nhập phút bắt đầu làm); chuyển tính năng rời tour sớm ra nút bấm trực tiếp ngoài màn hình đếm giờ trực tiếp cho KTV Phụ.
- `2026-09-02` (`v0.0.8.6`): Cố định (pin) Header và Footer của modal Điều Chỉnh KTV; cá nhân hóa mục tổng kết theo từng giai đoạn làm việc thực tế cho KTV với tiêu đề `🏆 Tổng thu nhập trong tour này:` và Tổng tiền nhận.
- `2026-09-02` (`v0.0.8.5`): Cập nhật icon `users` hợp lệ của Lucide, gỡ bỏ đoạn mô tả dài dòng thừa, đổi tiêu đề danh sách thành `Danh Sách KTV đang làm`, và bỏ phần % thừa phía sau số tiền trong phần Dự kiến phân bổ tổng.
- `2026-09-02` (`v0.0.8.2`): Tối giản quy ước `role_in_tour` thành 2 trạng thái gọn gàng: `Chính` (KTV đầu tiên) và `Phụ` (các KTV vào sau/cùng làm), mở rộng hỗ trợ động $N$ nhân sự không giới hạn số lượng.
- `2026-09-02` (`v0.0.7.5`): Chuẩn hóa hiển thị % minh bạch theo từng giai đoạn (1 KTV làm: 100%; 2 KTV làm: 50% mỗi người; 3 KTV làm: 33% mỗi người của đoạn đó) và chỉ hiển thị tổng % tích lũy ở phần Tổng kết.
- `2026-09-02` (`v0.0.7.4`): Nâng cấp Động cơ Phân chia Đa giai đoạn Linh hoạt (Multi-Stage Timeline Engine): Hỗ trợ N giai đoạn tự động khi có 3+ KTV vào ở các thời điểm khác nhau, hoặc KTV phụ làm xong nhiệm vụ rời ca sớm để KTV chính tiếp tục làm đoạn còn lại.
- `2026-09-02` (`v0.0.7.3`): Khắc phục triệt để lỗi ReferenceError bằng cách truy cập an toàn biến toàn cục `currentUser` và hàm `isUserOwner()`.
- `2026-09-02` (`v0.0.7.2`): Bảo mật tuyệt đối hoa hồng từng KTV (Staff chỉ thấy tiền của mình, thấy % của bạn làm chung; Admin thấy toàn bộ) và tính đúng theo tỷ lệ % hoa hồng riêng biệt của từng KTV từ `tb_users`.
- `2026-09-01` (`v0.0.0.1`): Bóc tách thành component độc lập.
