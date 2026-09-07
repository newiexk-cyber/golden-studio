# 🚀 HƯỚNG DẪN ĐẨY CODE LÊN GITHUB & TỰ ĐỘNG CẬP NHẬT WEBSITE (CI/CD)

Tài liệu hướng dẫn từng bước chi tiết giúp bạn đưa toàn bộ mã nguồn website **Golden Studio** (cả Frontend và Backend Express.js) lên **GitHub** và cài đặt chế độ **tự động deploy (cập nhật web tự động mỗi khi bạn sửa code)**.

---

## 🌟 BƯỚC 1: TẠO REPOSITORY TRÊN GITHUB (MẤT 1 PHÚT)

1. Đăng nhập vào tài khoản [GitHub](https://github.com/).
2. Nhấn vào dấu **`+`** ở góc trên cùng bên phải → chọn **New repository** (hoặc truy cập nhanh: [https://github.com/new](https://github.com/new)).
3. Điền các thông tin cơ bản:
   - **Repository name:** `golden-photo-studio` (hoặc tên tùy thích).
   - **Visibility:** Chọn **Public** (hoặc **Private** nếu bạn muốn giấu code).
   - ⚠️ **LƯU Ý QUAN TRỌNG:** Ở mục *"Initialize this repository with"*, **ĐỂ TRỐNG TOÀN BỘ** (Không tích vào Add a README file, không chọn .gitignore, không chọn license).
4. Nhấn nút xanh **Create repository**.
5. Sau khi tạo xong, GitHub sẽ hiển thị đường link của repository, dạng:
   ```text
   https://github.com/<tai-khoan-cua-ban>/golden-photo-studio.git
   ```
   *(Hãy copy đường link này lại để dùng ở Bước 2)*.

---

## ⚡ BƯỚC 2: ĐẨY CODE LÊN GITHUB BẰNG 1-CLICK

Trong thư mục `luxury-photo-studio`, tôi đã tạo sẵn cho bạn công cụ tự động:

### 👉 Cách 1: Dùng chuột bấm đúp (Khuyên dùng - Cực nhanh)
1. Mở thư mục `c:\memay\luxury-photo-studio` trên máy tính.
2. Bấm đúp chuột vào file: **`push-to-github.bat`**.
3. Cửa sổ màu đen hiện lên:
   - Nếu là lần đầu tiên, dán đường link GitHub bạn vừa copy ở Bước 1 vào rồi nhấn **Enter**.
   - Nhập nội dung cập nhật (hoặc nhấn **Enter** luôn để lấy mặc định).
4. Toàn bộ code sẽ tự động được gom và đẩy thẳng lên GitHub thành công 100%!

### 👉 Cách 2: Dùng lệnh Git trong Terminal
Nếu bạn quen gõ lệnh, chỉ cần mở terminal tại thư mục `luxury-photo-studio` và gõ:
```bash
git init -b main
git remote add origin https://github.com/<tai-khoan-cua-ban>/golden-photo-studio.git
git add .
git commit -m "Khoi tao website va backend Golden Studio"
git push -u origin main
```

> **Từ những lần sau:** Mỗi khi bạn sửa bất kỳ file HTML, CSS hay JS nào, bạn chỉ cần bấm đúp file **`push-to-github.bat`** là code tự động bay lên GitHub!

---

## 🔄 BƯỚC 3: KẾT NỐI VỚI CLOUDFLARE PAGES ĐỂ TỰ ĐỘNG CẬP NHẬT WEB

Hiện tại trang web của bạn đang chạy tại: `https://goldenstudio-903.pages.dev`. Khi kết nối với GitHub:
**Mỗi lần bạn đẩy code lên GitHub, Cloudflare Pages sẽ tự động cập nhật web chỉ trong 30 giây mà bạn không cần phải nén file zip hay kéo thả thủ công nữa!**

### Cách liên kết:
1. Đăng nhập vào [Cloudflare Dashboard](https://dash.cloudflare.com/) → Vào mục **Workers & Pages**.
2. Bấm vào dự án **`goldenstudio-903`** của bạn.
3. Vào tab **Settings** → **Builds & deployments**.
4. Ở phần **Source repository**, bấm **Connect to Git** (hoặc **Link repository**).
5. Đăng nhập tài khoản GitHub của bạn và chọn repo `golden-photo-studio`.
6. Cấu hình Build:
   - **Framework preset:** None
   - **Build command:** Để trống
   - **Build output directory:** `.` (hoặc để trống nếu toàn bộ file nằm ở root)
7. Bấm **Save and Deploy**.
8. Xong! Từ nay về sau, hễ bạn bấm `push-to-github.bat`, Cloudflare sẽ tự động làm mới website cho bạn!

---

## 🛡️ BƯỚC 4: TRIỂN KHAI BACKEND EXPRESS.JS LÊN CLOUD MIỄN PHÍ

Backend Express.js nằm trong thư mục `server/` giúp bảo mật Google Sheets và chống spam đặt lịch. Bạn có thể cho nó chạy online 24/7 hoàn toàn miễn phí trên **Render.com**:

1. Đăng ký tài khoản tại [Render.com](https://render.com) (đăng nhập bằng tài khoản GitHub).
2. Chọn **New +** → **Web Service**.
3. Chọn repository `golden-photo-studio` bạn vừa push lên.
4. Điền thiết lập:
   - **Name:** `golden-studio-backend`
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Mục **Environment Variables** (Biến môi trường):
   - `GOOGLE_SHEET_ID`: `1oMuNluQ6hKDzf-_nj8No1CM4Ez0fSYlHYDsrHdgzjcI`
   - `GOOGLE_SHEET_GID`: `0`
   - `ALLOWED_ORIGINS`: `https://goldenstudio-903.pages.dev`
   - `NODE_ENV`: `production`
6. Nhấn **Create Web Service**.
7. Chờ 1-2 phút, Render sẽ cấp cho bạn một link API bảo mật, ví dụ: `https://golden-studio-backend.onrender.com`.
8. Bạn mở file `config.js`, điền link này vào:
   ```javascript
   backendApi: {
       enabled: true,
       baseUrl: "https://golden-studio-backend.onrender.com"
   }
   ```
   Sau đó bấm `push-to-github.bat` là toàn bộ hệ thống web và backend của bạn hoàn tất!
