@echo off
chcp 65001 >nul
title 🚀 TỰ ĐỘNG ĐẨY CODE LÊN GITHUB - GOLDEN STUDIO

echo ========================================================
echo   🌟 GOLDEN STUDIO - CÔNG CỤ TỰ ĐỘNG PUSH CODE LÊN GITHUB
echo ========================================================
echo.

:: 1. Kiểm tra Git đã cài trên máy chưa
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] Git chua duoc cai dat tren may tinh cua ban!
    echo Vui long tai va cai dat Git tai: https://git-scm.com/downloads
    echo.
    pause
    exit /b 1
)

:: 2. Khởi tạo Git repo nếu chưa có
if not exist ".git" (
    echo [*] Dang khoi tao Git repository...
    git init -b main
    echo [OK] Da khoi tao nhanh 'main'.
    echo.
)

:: 3. Kiểm tra remote origin
git remote get-url origin >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Chua tim thay lien ket voi GitHub Repo nao.
    echo.
    echo Vui long tao mot Repository moi tren GitHub (https://github.com/new).
    set /p REPO_URL=">> Dan link GitHub Repo cua ban vao day (vi du: https://github.com/user/repo.git): "
    
    if "%REPO_URL%"=="" (
        echo [LOI] Link GitHub khong duoc de trong!
        pause
        exit /b 1
    )
    
    git remote add origin %REPO_URL%
    echo [OK] Da lien ket voi: %REPO_URL%
    echo.
)

:: 4. Nhập ghi chú commit
echo.
set /p COMMIT_MSG=">> Nhap noi dung cap nhat (Nhan Enter de lay mac dinh 'Cap nhat Golden Studio'): "
if "%COMMIT_MSG%"=="" (
    set COMMIT_MSG=Cap nhat website va backend Golden Studio
)

:: 5. Gom file và Commit
echo.
echo [*] Dang gom toan bo file...
git add .

echo [*] Dang tao Commit: "%COMMIT_MSG%"...
git commit -m "%COMMIT_MSG%"

:: 6. Đẩy code lên GitHub
echo.
echo [*] Dang day code len GitHub (nhanh main)...
git branch -M main
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo  ✨ THÀNH CÔNG! CODE ĐÃ ĐƯỢC PUSH LÊN GITHUB AN TOÀN!
    echo ========================================================
    echo  Neu ban da ket noi repo nay voi Cloudflare Pages hoac Render,
    echo  website se tu dong cap nhat trong vong 30 - 60 giay!
) else (
    echo.
    echo [!] Push chua thanh cong. Vui long kiem tra lai:
    echo     1. Quyen truy cap tai khoan GitHub cua ban.
    echo     2. Link repo da dung chua (Personal Access Token hoac SSH key).
)

echo.
pause
