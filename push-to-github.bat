@echo off
title Push Code to GitHub - Golden Studio

echo ========================================================
echo   GOLDEN STUDIO - TU DONG DAY CODE LEN GITHUB
echo ========================================================
echo.

REM 1. Kiem tra Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] Git chua duoc cai dat tren may!
    echo Vui long tai Git tai: https://git-scm.com
    echo.
    pause
    exit /b 1
)

REM 2. Khoi tao repo neu chua co
if not exist ".git" (
    echo [*] Dang khoi tao Git repository...
    git init -b main
)

REM 3. Kiem tra remote
git remote get-url origin >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Chua co lien ket GitHub.
    set /p REPO_URL=">> Dan link GitHub repo (vd: https://github.com/user/repo.git): "
    if defined REPO_URL (
        git remote add origin %REPO_URL%
    )
)

REM 4. Thuc hien commit va push
echo.
echo [*] Dang gom toan bo tap tin moi nhat...
git add .

echo [*] Dang commit du lieu...
git commit -m "Cap nhat Golden Studio - %date% %time%"

echo.
echo [*] Dang day code len GitHub (nhanh main)...
git branch -M main
git push origin main

echo.
if %errorlevel% equ 0 (
    echo ========================================================
    echo   THANH CONG! CODE DA DUOC DAY LEN GITHUB AN TOAN!
    echo ========================================================
    echo Cloudflare Pages se tu dong cap nhat web trong vai chuc giay!
) else (
    echo ========================================================
    echo   CO LOI HOAC CHUA CO THAY DOI MOI DE PUSH!
    echo ========================================================
)

echo.
pause
