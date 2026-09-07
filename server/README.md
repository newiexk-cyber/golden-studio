# 🛡️ GOLDEN STUDIO - BACKEND API (EXPRESS.JS)

Backend API bảo mật theo mô hình **BFF (Backend For Frontend)** cho dự án **Golden Studio**, được xây dựng bằng **Node.js** và **Express.js**.

---

## 🌟 1. Lợi Ích Vượt Trội Của Backend Này

1. **Bảo Mật Google Sheets:**
   - Ẩn hoàn toàn Google Sheet ID, GID và cấu trúc dữ liệu khỏi trình duyệt người dùng.
   - Khách hàng và các công cụ F12/Inspect Network chỉ nhìn thấy endpoint `/api/concepts`.
2. **Bộ Nhớ Đệm Tốc Độ Cao (In-memory Cache):**
   - Tự động lưu cache trong RAM Server 5 phút (có thể cấu hình).
   - Khi có hàng trăm khách truy cập cùng lúc, máy chủ chỉ gọi Google Sheets 1 lần duy nhất, phản hồi cho khách trong **< 30ms** thay vì chờ Google Sheets 1-3 giây.
3. **Chống Spam Form Đặt Lịch (Rate Limiting & Sanitization):**
   - Mỗi địa chỉ IP chỉ được gửi tối đa 5 lượt đặt lịch trong 10 phút.
   - Lọc mã độc XSS và kiểm tra định dạng số điện thoại di động Việt Nam hợp lệ.
4. **Bảo Vệ Hạ Tầng Bằng Helmet & CORS:**
   - Tự động kích hoạt các HTTP Security Headers (`X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`,...).
   - Giới hạn tên miền (CORS Whitelist) chỉ cho phép website chính thức của Studio được quyền gọi API.

---

## 🚀 2. Cách Cài Đặt & Chạy Dưới Máy Local (Windows)

### Bước 1: Cài đặt Node.js (nếu máy chưa có)
- Tải bản LTS từ [nodejs.org](https://nodejs.org) và cài đặt (chọn Next mặc định).

### Bước 2: Cài đặt các thư viện cần thiết
Mở Terminal / PowerShell tại thư mục `server`:
```bash
cd c:\memay\luxury-photo-studio\server
npm install
```

### Bước 3: Khởi chạy Server
- Chạy ở chế độ phát triển (tự reload khi sửa code):
```bash
npm run dev
```
- Hoặc chạy ở chế độ bình thường:
```bash
npm start
```

Mở trình duyệt kiểm tra:
- **Kiểm tra trạng thái:** `http://localhost:5000/api/health`
- **Xem dữ liệu Concept:** `http://localhost:5000/api/concepts`

---

## ☁️ 3. Cách Đưa Backend Lên Online Miễn Phí (Deploy lên Render.com)

Để website online trên Cloudflare Pages (`https://goldenstudio-903.pages.dev`) có thể gọi backend liên tục 24/7 mà không cần mở máy tính:

1. Đăng ký tài khoản miễn phí tại **[Render.com](https://render.com)**.
2. Chọn **New +** → **Web Service**.
3. Kết nối với GitHub Repository của bạn.
4. Điền các thông tin:
   - **Name:** `golden-studio-api`
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Thêm các biến môi trường (**Environment Variables**):
   - `GOOGLE_SHEET_ID`: `1LRCu0pMw9z8xkAJ9IDv0UsndnoCDQuyEyoRWXRDGdcI`
   - `ALLOWED_ORIGINS`: `https://goldenstudio-903.pages.dev,http://localhost:3000`
   - `NODE_ENV`: `production`
6. Bấm **Deploy**. Sau 1 phút bạn sẽ nhận được link API dạng: `https://golden-studio-api.onrender.com`.
7. Dán link này vào `apiBaseUrl` trong file `config.js` của Frontend là xong!

---

## 📡 4. Danh Sách API Endpoints

| Phương thức | Đường dẫn | Chức năng | Tham số query |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Kiểm tra trạng thái máy chủ | Không có |
| `GET` | `/api/concepts` | Lấy danh sách concept đã cache | `category=Nu`, `bestseller=true`, `refresh=true` |
| `POST` | `/api/booking` | Gửi thông tin đặt lịch hẹn | Body: `{ name, phone, concept, date, notes }` |
