#!/usr/bin/env pwsh
# Convert GEE Service Account JSON to single-line for Vercel
# Usage: .\convert_json_for_vercel.ps1 path\to\service-account.json

param(
    [Parameter(Mandatory=$true)]
    [string]$JsonFilePath
)

Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   GEE Service Account → Vercel Format Converter" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Check if file exists
if (-not (Test-Path $JsonFilePath)) {
    Write-Host "❌ File not found: $JsonFilePath" -ForegroundColor Red
    exit 1
}

try {
    # Read and parse JSON
    Write-Host "📖 Reading JSON file..." -ForegroundColor Yellow
    $json = Get-Content $JsonFilePath -Raw | ConvertFrom-Json
    
    # Extract key info
    $email = $json.client_email
    $projectId = $json.project_id
    
    Write-Host "✅ Parsed successfully!" -ForegroundColor Green
    Write-Host "   Service Account: $email" -ForegroundColor Gray
    Write-Host "   Project ID: $projectId" -ForegroundColor Gray
    
    # Convert to single-line string
    Write-Host "`n🔄 Converting to single-line format..." -ForegroundColor Yellow
    $jsonString = $json | ConvertTo-Json -Compress -Depth 10
    
    # Copy to clipboard
    $jsonString | Set-Clipboard
    
    Write-Host "✅ Converted and copied to clipboard!" -ForegroundColor Green
    
    # Show preview (truncated)
    $preview = $jsonString.Substring(0, [Math]::Min(100, $jsonString.Length))
    Write-Host "`n📋 Preview:" -ForegroundColor Yellow
    Write-Host "   $preview..." -ForegroundColor Gray
    
    # Instructions
    Write-Host "`n" -NoNewline
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "   Next Steps" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
    
    Write-Host "1️⃣  Go to Vercel:" -ForegroundColor Yellow
    Write-Host "   https://vercel.com/petr-zakcs-projects/aerisq/settings/environment-variables`n" -ForegroundColor White
    
    Write-Host "2️⃣  Click 'Add Variable'" -ForegroundColor Yellow
    Write-Host "   Key: GEE_SERVICE_ACCOUNT_JSON" -ForegroundColor White
    Write-Host "   Value: (Ctrl+V to paste from clipboard)" -ForegroundColor White
    Write-Host "   Environments: ☑ Production ☑ Preview ☑ Development`n" -ForegroundColor White
    
    Write-Host "3️⃣  Add Project ID:" -ForegroundColor Yellow
    Write-Host "   Key: GEE_PROJECT_ID" -ForegroundColor White
    Write-Host "   Value: $projectId" -ForegroundColor White
    Write-Host "   Environments: ☑ Production ☑ Preview ☑ Development`n" -ForegroundColor White
    
    Write-Host "4️⃣  Click 'Save' and redeploy`n" -ForegroundColor Yellow
    
    # Save to file for backup
    $outputFile = "vercel_env_value.txt"
    $jsonString | Out-File -FilePath $outputFile -Encoding UTF8 -NoNewline
    Write-Host "💾 Also saved to: $outputFile" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host "`n❌ Error: $_" -ForegroundColor Red
    Write-Host "   Make sure the JSON file is valid." -ForegroundColor Yellow
    exit 1
}
