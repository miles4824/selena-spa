# 🏛️ ĐẶC TẢ KIẾN TRÚC PHÂN LUỒNG HOME DASHBOARD (MODULAR HOME ARCHITECTURE)

*Tài liệu kỹ thuật lưu trữ toàn bộ phương án phân rã file `home_dashboard.js` (gần 800 dòng) thành 4 module độc lập theo đối tượng người dùng và vai trò vận hành.*

---

## 1. Bối Cảnh & Vấn Đề Cần Giải Quyết
- File `js/Home/home_dashboard.js` hiện tại đang gánh cùng lúc **5 nhiệm vụ khổng lồ**:
  1. Thống kê cá nhân của Kỹ Thuật Viên (Tour, Hoa hồng, Tip, Che mắt số tiền).
  2. Báo cáo tài chính hôm nay của Chủ Tiệm (Doanh thu, Lượt khách, Quỹ lương, Lợi nhuận tạm tính).
  3. Giám sát các giường đang phục vụ thời gian thực (Live Bed Monitor).
  4. Trạng thái Bận/Rảnh và nút biến hình (`VÀO TOUR NGAY` / `VÀO XEM NGAY`).
  5. Quản lý danh bạ khách hàng 60 ngày và nhân sự trực.
- **Hậu quả**: File phình to gần 800 dòng, gây khó khăn cho việc tìm kiếm để chỉnh sửa câu chữ, vi phạm nguyên tắc Single Responsibility và Rule 2 (Tách biệt Staff/Owner).

---

## 2. Bản Đồ Phân Chia 4 Module Con

```text
📁 js/Home/
  ├── 📄 staff_home.js       (~70 dòng) -> Chuyên trách Kỹ Thuật Viên
  ├── 📄 admin_home.js       (~80 dòng) -> Chuyên trách Chủ Tiệm
  ├── 📄 admin_live_beds.js  (~70 dòng) -> Chuyên trách Giám Sát Giường Realtime
  └── 📄 home_dashboard.js   (~25 dòng) -> Nhạc trưởng điều phối router tab Home
```

### Chi tiết phân công từng file:

| Tên File | Vai trò | Các hàm chủ lực | Nhiệm vụ đảm nhiệm |
| :--- | :--- | :--- | :--- |
| **`staff_home.js`** | Kỹ Thuật Viên | `loadKTVHomeStats()`<br>`renderStaffHomeStatusAndAction()`<br>`toggleStaffHomeCommPrivacy()` | Đếm số tour, tính hoa hồng + tip, che số tiền `•••• đ`, câu châm ngôn rảnh từ `tb_config`. |
| **`admin_home.js`** | Chủ Tiệm | `loadAdminDashboard()`<br>`renderAdminTodaySnapshot()`<br>`renderAdminHomeStatusAndAction()` | Tính Doanh thu hôm nay, Lượt tour/khách, Quỹ lương phát sinh, Lợi nhuận tạm tính, Danh bạ khách 60 ngày. |
| **`admin_live_beds.js`** | Giám Sát Giường | `renderAdminLiveRunningTours()`<br>`handleAdminInspectSession()` | Lắng nghe `live_sessions_cache`, đếm KTV rảnh/bận, vẽ thẻ giường với % thời gian chạy động, cảnh báo đỏ lố giờ. |
| **`home_dashboard.js`** | Nhạc Trưởng | `showHomeScreen()`<br>`refreshHomeViews()` | Kiểm tra role người dùng `isUserOwner(currentUser)` để gọi đúng file tương ứng, nhận tín hiệu từ Firebase. |

---

## 3. Sơ Đồ Lưu Chuyển Luồng (Flowchart)

```mermaid
flowchart TD
    Start([Người dùng mở App hoặc bấm Tab Home]) --> CheckAuth{Đã đăng nhập chưa?}
    CheckAuth -- Chưa --> ShowLogin[Chuyển về màn hình Login]
    CheckAuth -- Rồi --> Router[showView('home') trong app.js]

    Router --> Controller["🎼 Nhạc Trưởng: home_dashboard.js<br>(Kiểm tra role người dùng)"]
    Controller --> CheckRole{Tài khoản là ai?}

    %% Phân luồng KTV
    CheckRole -- "Kỹ Thuật Viên (Staff)" --> StaffFlow["📄 staff_home.js"]
    subgraph SUB_STAFF ["MÀN HÌNH KỸ THUẬT VIÊN (Staff Home)"]
        StaffFlow --> S1["1. Đọc tên KTV và câu châm ngôn (tb_config)"]
        StaffFlow --> S2["2. Trạng thái: Đang Rảnh (VÀO TOUR) hay Trong Ca (VÀO XEM)"]
        StaffFlow --> S3["3. Đọc payroll_logs: Đếm số tour và tính Hoa hồng + Tip"]
        StaffFlow --> S4["4. Render Cách 2: ${AppTitle()} + 2 thẻ ${StatCard()}"]
    end

    %% Phân luồng Chủ Tiệm
    CheckRole -- "Chủ Tiệm (Admin/Owner)" --> AdminFlow["📄 admin_home.js"]
    subgraph SUB_ADMIN ["MÀN HÌNH CHỦ TIỆM (Admin Home)"]
        AdminFlow --> A1["1. Đọc tên Chủ tiệm và câu chào hỏi"]
        AdminFlow --> A2["2. Kiểm tra trạng thái Admin vào ca"]
        AdminFlow --> A3["3. Đọc receipts: Doanh thu, Lượt khách, Quỹ lương, Lợi nhuận"]
        AdminFlow --> A4["4. Render Cách 2: ${AppTitle()} + 4 thẻ ${StatCard()}"]
        AdminFlow --> A5["5. Danh bạ khách hàng 60 ngày và Danh sách nhân sự"]
    end

    %% Giám Sát Giường
    CheckRole -- "Đồng thời (Nếu là Admin)" --> BedFlow["📄 admin_live_beds.js"]
    subgraph SUB_BEDS ["GIÁM SÁT GIƯỜNG REALTIME"]
        BedFlow --> B1["1. Lắng nghe live_sessions_cache từ Firebase"]
        BedFlow --> B2["2. Đếm số KTV đang bận / rảnh toàn tiệm"]
        BedFlow --> B3["3. Vẽ danh sách thẻ giường (Giường số 01, 02...):<br>• Thanh chạy giờ % động<br>• Cảnh báo đỏ nếu lố giờ<br>• Nút 'Xem / Chăm Sóc Ca Này'"]
    end

    %% Sự kiện Realtime
    FirebaseRealtime[("⚡ Firebase Realtime / Google Sheets")] -.->|Dữ liệu đổi tức thì 0.03s| Controller
```

---

## 4. Kế Hoạch Các Bước Thực Hiện Khi Quay Lại:
1. Tạo 3 file mới: `staff_home.js`, `admin_home.js`, `admin_live_beds.js` trong thư mục `js/Home/`.
2. Chuyển các hàm tương ứng từ `home_dashboard.js` vào 3 file trên.
3. Rút gọn `home_dashboard.js` chỉ còn hàm nhạc trưởng điều phối.
4. Nạp 3 file mới vào `index.html`.
5. Kiểm tra cú pháp 100% bằng Node.js và test thực tế.
