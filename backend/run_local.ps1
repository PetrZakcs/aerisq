# AerisQ Backend - Local Development Setup (No Docker)
# Run this script to set up and start the backend locally

# Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Cyan
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Cyan
& .\venv\Scripts\Activate.ps1

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Cyan
pip install -r requirements.txt

# Run the server
Write-Host "Starting AerisQ Backend on http://localhost:8000" -ForegroundColor Green
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "Test credentials: admin@aerisq.tech / password123" -ForegroundColor Yellow
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
