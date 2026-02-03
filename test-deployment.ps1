#!/usr/bin/env pwsh
# AerisQ - Quick Deployment Test
# Run this after Vercel deployment completes

$DEPLOYMENT_URL = "https://aerisq.vercel.app"

Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   AerisQ - Deployment Test Suite" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "`n"

# Test 1: Health Check
Write-Host "🔍 Test 1: API Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$DEPLOYMENT_URL/api/health" -Method Get
    if ($response.status -eq "ok") {
        Write-Host "   ✅ API is alive!" -ForegroundColor Green
        Write-Host "   Version: $($response.version)" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ Unexpected response" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Health check failed: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 2: Frontend
Write-Host "`n🌐 Test 2: Frontend Availability..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $DEPLOYMENT_URL -Method Get
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend loads!" -ForegroundColor Green
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Frontend not accessible: $_" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# Test 3: Demo Analysis API
Write-Host "`n🛰️  Test 3: Demo Analysis..." -ForegroundColor Yellow
$testPayload = @{
    polygon = @{
        type = "Polygon"
        coordinates = @(@(
            @(-6.0, 37.5),
            @(-5.0, 37.5),
            @(-5.0, 38.5),
            @(-6.0, 38.5),
            @(-6.0, 37.5)
        ))
    }
    date_range = @{
        start = "2023-07-01"
        end = "2023-07-31"
    }
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "$DEPLOYMENT_URL/api/v1/analyze/demo" `
        -Method Post `
        -Body $testPayload `
        -ContentType "application/json"
    
    if ($response.status -eq "completed") {
        Write-Host "   ✅ Demo analysis works!" -ForegroundColor Green
        Write-Host "   Mean σ₀: $($response.result.mean_sigma0_db) dB" -ForegroundColor Gray
        Write-Host "   Severity: $($response.result.drought_severity)" -ForegroundColor Gray
        Write-Host "   Quality: $($response.result.quality_flag)" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  Analysis returned: $($response.status)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Demo analysis failed: $_" -ForegroundColor Red
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   Test Summary" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "`n"
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Open browser: $DEPLOYMENT_URL" -ForegroundColor White
Write-Host "   2. Login with: admin@aerisq.tech / password123" -ForegroundColor White
Write-Host "   3. Create analysis via UI" -ForegroundColor White
Write-Host "   4. Verify results display on map" -ForegroundColor White
Write-Host "`n"
Write-Host "📖 Full checklist: DEPLOYMENT_TEST_CHECKLIST.md" -ForegroundColor Gray
Write-Host "`n"

# Open browser
Write-Host "🌐 Opening frontend in browser..." -ForegroundColor Yellow
Start-Process $DEPLOYMENT_URL
