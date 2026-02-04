# AerisQ - Local Development Startup
# Runs Backend (8000) + Frontend (3000)

$ErrorActionPreference = "Stop"
$projectRoot = $PSScriptRoot

Write-Host "`n==============================================================" -ForegroundColor Cyan
Write-Host "   AerisQ - Local Development Mode" -ForegroundColor Cyan
Write-Host "==============================================================`n" -ForegroundColor Cyan

# Backend check
Write-Host "Checking backend..." -ForegroundColor Yellow
$backendPath = Join-Path $projectRoot "backend"
$venvPath = Join-Path $backendPath "venv\Scripts\python.exe"

if (-not (Test-Path $venvPath)) {
    Write-Host "ERROR: Backend venv not found!" -ForegroundColor Red
    Write-Host "Run: cd backend; python -m venv venv" -ForegroundColor Yellow
    exit 1
}

Write-Host "  OK: Backend venv found" -ForegroundColor Green

# Install backend deps
Write-Host "  Installing backend dependencies..." -ForegroundColor Gray
$backendReqs = Join-Path $backendPath "requirements.txt"
& $venvPath -m pip install -q -r $backendReqs 2>$null
Write-Host "  OK: Backend ready" -ForegroundColor Green

# Frontend check
Write-Host "`nChecking frontend..." -ForegroundColor Yellow
$frontendPath = Join-Path $projectRoot "frontend"
$nodeModules = Join-Path $frontendPath "node_modules"

if (-not (Test-Path $nodeModules)) {
    Write-Host "  Installing frontend dependencies..." -ForegroundColor Gray
    Push-Location $frontendPath
    npm install --silent 2>$null
    Pop-Location
}

Write-Host "  OK: Frontend ready" -ForegroundColor Green

# Create .env.local
$envLocal = Join-Path $frontendPath ".env.local"
if (-not (Test-Path $envLocal)) {
    Write-Host "  Creating .env.local..." -ForegroundColor Gray
    "NEXT_PUBLIC_API_URL=http://localhost:8000" | Out-File -FilePath $envLocal -Encoding ASCII
    Write-Host "  OK: Created .env.local" -ForegroundColor Green
}
else {
    Write-Host "  OK: .env.local exists" -ForegroundColor Green
}

# Start servers
Write-Host "`nStarting servers..." -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "  Frontend: http://localhost:3000`n" -ForegroundColor White

# Backend command
$backendCmd = @"
cd '$backendPath'
& '.\venv\Scripts\activate.ps1'
Write-Host 'Backend starting on http://localhost:8000...' -ForegroundColor Green
python standalone.py
"@

# Frontend command
$frontendCmd = @"
cd '$frontendPath'
Write-Host 'Frontend starting on http://localhost:3000...' -ForegroundColor Blue
npm run dev
"@

# Launch
Write-Host "Opening backend window..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd

Start-Sleep -Seconds 2

Write-Host "Opening frontend window..." -ForegroundColor Gray
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd

# Wait
Write-Host "`nWaiting for startup..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test
Write-Host "Testing connections...`n" -ForegroundColor Yellow

try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -TimeoutSec 5
    Write-Host "  OK: Backend responding (status: $($health.status))" -ForegroundColor Green
}
catch {
    Write-Host "  WAIT: Backend still starting..." -ForegroundColor Yellow
}

try {
    Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing | Out-Null
    Write-Host "  OK: Frontend responding" -ForegroundColor Green
}
catch {
    Write-Host "  WAIT: Frontend still compiling..." -ForegroundColor Yellow
}

# Summary
Write-Host "`n==============================================================" -ForegroundColor Cyan
Write-Host "   LOCAL ENVIRONMENT READY!" -ForegroundColor Cyan
Write-Host "==============================================================`n" -ForegroundColor Cyan

Write-Host "Open in browser:" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "  API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""

Write-Host "Login: admin@aerisq.tech / password123`n" -ForegroundColor Gray

Write-Host "Servers running in separate windows." -ForegroundColor Gray
Write-Host "Close those windows to stop servers.`n" -ForegroundColor Gray

Write-Host "Press Enter to open browser..." -ForegroundColor Cyan
Read-Host

Start-Process "http://localhost:3000"

Write-Host "Monitoring active. Press Ctrl+C to exit." -ForegroundColor Gray
