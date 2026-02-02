---
description: How to start the AerisQ backend for development
---

# Run AerisQ Backend

## Prerequisites
- Python 3.11+ installed
- (Optional) Docker for full stack with PostgreSQL, Redis, and Celery

## Quick Start (Standalone Mode - No Docker)

This runs a simplified version without external dependencies:

// turbo
1. Navigate to backend directory:
```powershell
cd backend
```

// turbo
2. Create virtual environment (if not exists):
```powershell
python -m venv venv
```

// turbo
3. Activate virtual environment:
```powershell
.\venv\Scripts\activate
```

// turbo
4. Install dependencies:
```powershell
pip install -r requirements-standalone.txt
```

// turbo
5. Start the standalone server:
```powershell
python standalone.py
```

6. Access the API:
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Test Authentication

Login with God Mode credentials:
- **Email**: `admin@aerisq.tech`
- **Password**: `password123`

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/auth/token" -Method POST -Headers @{"Content-Type"="application/x-www-form-urlencoded"} -Body "username=admin@aerisq.tech&password=password123"
```

## Full Stack with Docker

// turbo-all
If Docker is installed, run the complete stack:

```powershell
docker compose up --build -d
```

This starts:
- Backend API: http://localhost:8000
- PostgreSQL/PostGIS: Port 5432
- Redis: Port 6379
- Celery Worker

## Stop Services

Standalone: Press `Ctrl+C` in the terminal

Docker:
```powershell
docker compose down
```
