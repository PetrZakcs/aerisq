# Test GEE Integration on Vercel
$DEPLOYMENT_URL = "https://aerisq.vercel.app"

Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   GEE Integration Test - Real Satellite Data" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Simple JSON payload
$jsonPayload = @"
{
    "polygon": {
        "type": "Polygon",
        "coordinates": [[
            [-6.0, 37.5],
            [-5.0, 37.5],
            [-5.0, 38.5],
            [-6.0, 38.5],
            [-6.0, 37.5]
        ]]
    },
    "date_range": {
        "start": "2023-07-01",
        "end": "2023-07-31"
    }
}
"@

Write-Host "🛰️  Testing REAL satellite data analysis..." -ForegroundColor Yellow
Write-Host "   Area: Southern Spain" -ForegroundColor Gray
Write-Host "   Date: July 2023" -ForegroundColor Gray
Write-Host "`n⏳ Processing (10-30 seconds for real data)...`n" -ForegroundColor Yellow

$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()

try {
    $response = Invoke-RestMethod -Uri "$DEPLOYMENT_URL/api/v1/analyze/demo" -Method Post -Body $jsonPayload -ContentType "application/json" -TimeoutSec 60
    
    $stopwatch.Stop()
    $elapsed = $stopwatch.Elapsed.TotalSeconds
    
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "   RESULTS" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
    
    $quality = $response.result.quality_flag
    
    if ($quality -eq "GEE_REALTIME") {
        Write-Host "✅ SUCCESS! REAL SATELLITE DATA!" -ForegroundColor Green
        Write-Host "`n🛰️  Source: Sentinel-1 (Google Earth Engine)" -ForegroundColor Green
        Write-Host "   Scenes: $($response.result.scene_count)" -ForegroundColor Gray
    }
    elseif ($quality -eq "SIMULATED") {
        Write-Host "⚠️  Still SIMULATED data" -ForegroundColor Yellow
        Write-Host "`nCheck:" -ForegroundColor Yellow
        Write-Host "  1. Vercel deployment complete?" -ForegroundColor Gray
        Write-Host "  2. Environment variables saved?" -ForegroundColor Gray
    }
    else {
        Write-Host "⚠️  Unknown flag: $quality" -ForegroundColor Yellow
    }
    
    Write-Host "`n📊 Results:" -ForegroundColor Cyan
    Write-Host "   Mean σ₀: $($response.result.mean_sigma0_db) dB" -ForegroundColor White
    Write-Host "   Severity: $($response.result.drought_severity)" -ForegroundColor White
    Write-Host "   Quality: $quality" -ForegroundColor White
    Write-Host "`n⏱️  Time: $([math]::Round($elapsed, 2))s" -ForegroundColor Gray
    
    if ($quality -eq "GEE_REALTIME" -and $elapsed -gt 5) {
        Write-Host "   (Slow = real processing! ✓)" -ForegroundColor Green
    }
    elseif ($elapsed -lt 3) {
        Write-Host "   (Fast = still simulated)" -ForegroundColor Yellow
    }
}
catch {
    $stopwatch.Stop()
    Write-Host "❌ Error: $_" -ForegroundColor Red
}

Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🌐 Dashboard: $DEPLOYMENT_URL/dashboard" -ForegroundColor White
Write-Host "🔍 Logs: https://vercel.com/petr-zakcs-projects/aerisq" -ForegroundColor White
Write-Host "`n"

Start-Process "$DEPLOYMENT_URL/dashboard"
