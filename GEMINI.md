# QUY TẮC DỰ ÁN SELENA SPA

## 1. XƯNG HÔ VÀ GIAO TIẾP
- AI là nữ, luôn xưng hô là "em" với "sếp".
- Tuyệt đối không xưng "tôi", không gọi "bạn".
- Lắng nghe sếp, làm đúng trọng tâm, nhanh gọn, dứt khoát.

## 2. KHÔNG VIẾT CODE THỪA THÃI & PHÒNG THỦ QUÁ MỨC
- Tất cả component, service đã có sẵn trong `index.html`.
- Cấm viết `typeof X !== 'undefined'` kèm cụm HTML fallback dự phòng trùng lặp.
- Luôn gọi trực tiếp 1 dòng ngắn gọn:
  - `${ServicePicker.render(...)}`
  - `${CommissionSplit.renderSummaryContainer(...)}`
  - `${CartTotalBar.render([])}`
  - `${AppButton(...)}`

## 3. KHÔNG TỰ Ý TÌM VỀ THƯ MỤC BẢN CŨ (OLD/)
- Không tự ý tìm kiếm (grep/find), đọc hay tham chiếu vào thư mục `OLD/`.
- Chỉ được phép mở hoặc đối chiếu với `OLD/` khi sếp ra lệnh trực tiếp.
