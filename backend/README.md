# PhasQ Backend

Physics-Based Sentinel-1 Radar Analysis Platform - Backend API

## Quick Start

### With Docker (Recommended)
```bash
# From project root
docker-compose up --build
```

### Without Docker (Development)
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run the API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once running, access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Authentication

### Test Credentials (God Mode)
- **Email**: `admin@phasq.tech`
- **Password**: `password123`

### Get Token
```bash
curl -X POST "http://localhost:8000/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@phasq.tech&password=password123"
```

### Use Token
```bash
curl -X GET "http://localhost:8000/auth/me" \
  -H "Authorization: Bearer <your_token>"
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/token` | Get JWT access token |
| GET | `/auth/me` | Get current user info |
| POST | `/api/v1/analyze` | Create analysis job |
| POST | `/api/v1/analyze/demo` | Create demo analysis (no auth) |
| GET | `/api/v1/jobs/{job_id}` | Get job status/results |
| GET | `/api/v1/jobs/{job_id}/public` | Get job status (no auth) |
| GET | `/api/v1/legend` | Get drought severity legend |

## Project Structure

```
backend/
├── app/
│   ├── agents/           # The 4 Agents
│   │   ├── scout.py      # Agent 1: Sentinel-1 data fetcher
│   │   ├── physicist.py  # Agent 2: Sigma0 dB calculation
│   │   ├── analyst.py    # Agent 3: GPT-4o summary
│   │   └── cartographer.py # Agent 4: GeoJSON builder
│   ├── api/              # API routes
│   │   ├── auth.py       # Authentication endpoints
│   │   └── v1/
│   │       ├── analyze.py # Analysis endpoints
│   │       └── jobs.py    # Job management
│   ├── core/             # Core configuration
│   │   ├── config.py     # Settings
│   │   └── security.py   # JWT auth
│   ├── db/               # Database
│   │   └── database.py   # SQLAlchemy setup
│   ├── models/           # SQLAlchemy models
│   │   └── job.py        # AnalysisJob model
│   ├── schemas/          # Pydantic schemas
│   │   ├── auth.py       # Auth schemas
│   │   └── job.py        # Job schemas
│   ├── workers/          # Celery tasks
│   │   ├── celery_app.py # Celery config
│   │   └── tasks.py      # Analysis pipeline
│   └── main.py           # FastAPI app
├── .env                  # Environment variables
├── Dockerfile
└── requirements.txt
```

## The 4 Agents Pipeline

1. **Scout** (Agent 1): Queries CDSE for Sentinel-1 GRD products
2. **Physicist** (Agent 2): Calculates Sigma0 dB, detects drought
3. **Analyst** (Agent 3): Generates GPT-4o summary
4. **Cartographer** (Agent 4): Creates GeoJSON for map visualization

## Environment Variables

See `.env.example` for all available configuration options.

## License

Proprietary - PhasQ
