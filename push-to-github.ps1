# ========================================================
# 🌟 GOLDEN STUDIO - SCRIPT POWERSHELL PUSH CODE LÊN GITHUB
# ========================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  🌟 GOLDEN STUDIO - TỰ ĐỘNG ĐẨY CODE LÊN GITHUB" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Kiểm tra Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ [LỖI] Git chưa được cài đặt trên máy tính của bạn!" -ForegroundColor Red
    Write-Host "Vui lòng tải Git tại: https://git-scm.com/downloads" -ForegroundColor Yellow
    Read-Host "Nhấn Enter để thoát..."
    exit 1
}

# 2. Khởi tạo Git nếu chưa có
if (-not (Test-Path ".git")) {
    Write-Host "⚙️ Đang khởi tạo Git repository..." -ForegroundColor Gray
    git init -b main
    Write-Host "✅ Đã khởi tạo nhánh 'main' thành công!" -ForegroundColor Green
}

# 3. Kiểm tra remote origin
$origin = git remote get-url origin 2>$null
if (-not $origin) {
    Write-Host "⚠️ Chưa tìm thấy liên kết với GitHub Repository nào." -ForegroundColor Yellow
    Write-Host "Tạo repo mới trên GitHub: https://github.com/new" -ForegroundColor Gray
    $repoUrl = Read-Host ">> Dán link GitHub Repository (vd: https://github.com/user/repo.git)"
    
    if ([string]::IsNullOrWhiteSpace($repoUrl)) {
        Write-Host "❌ Link GitHub không được để trống!" -ForegroundColor Red
        Read-Host "Nhấn Enter để thoát..."
        exit 1
    }
    
    git remote add origin $repoUrl
    Write-Host "✅ Đã liên kết với: $repoUrl" -ForegroundColor Green
}

# 4. Nhập ghi chú commit
$defaultMsg = "Cập nhật website và backend Golden Studio (" + (Get-Date -Format "yyyy-MM-dd HH:mm") + ")"
$commitMsg = Read-Host ">> Nhập ghi chú commit (Nhấn Enter để lấy: '$defaultMsg')"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = $defaultMsg
}

# 5. Staging và Commit
Write-Host "📦 Đang gom toàn bộ tập tin..." -ForegroundColor Gray
git add .

Write-Host "📝 Đang tạo commit: '$commitMsg'..." -ForegroundColor Gray
git commit -m $commitMsg

# 6. Push lên GitHub
Write-Host "🚀 Đang đẩy code lên GitHub..." -ForegroundColor Cyan
git branch -M main
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host "  ✨ THÀNH CÔNG! CODE ĐÃ ĐƯỢC ĐẨY LÊN GITHUB AN TOÀN! " -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host "Nếu bạn đã liên kết với Cloudflare Pages hoặc Render," -ForegroundColor Cyan
    Write-Host "hệ thống sẽ tự động build và cập nhật phiên bản mới sau 30 giây!" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Đẩy code chưa thành công. Vui lòng kiểm tra quyền tài khoản GitHub hoặc kết nối mạng." -ForegroundColor Red
}

Write-Host ""
Read-Host "Nhấn Enter để kết thúc..."
