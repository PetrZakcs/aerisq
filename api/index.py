"""
AerisQ Backend API - Vercel Serverless Function
This file exposes the FastAPI app for Vercel deployment
"""
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, List
import hashlib
import uuid
import os

from jose import jwt
import numpy as np
from scipy.stats import norm

# Try to import GEE analyzer (for real SAR data)
try:
    import sys
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
    from app.agents.gee_analyzer import gee_analyzer
    GEE_AVAILABLE = gee_analyzer.ready
except Exception as e:
    print(f"⚠️ GEE not available: {e}")
    GEE_AVAILABLE = False

# ===== CONFIGURATION =====
SECRET_KEY = os.environ.get("SECRET_KEY", "aerisq-vercel-production-key")
GOD_MODE_EMAIL = os.environ.get("GOD_MODE_EMAIL", "admin@aerisq.tech")
GOD_MODE_PASSWORD = os.environ.get("GOD_MODE_PASSWORD", "password123")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

# In-memory storage (for serverless, consider using Supabase/Redis)
JOBS_STORE: Dict[str, Dict[str, Any]] = {}

# ===== SECURITY =====
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(plain: str, hashed: str) -> bool:
    return hash_password(plain) == hashed


GOD_MODE_HASH = hash_password(GOD_MODE_PASSWORD)


def create_token(email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    return jwt.encode({"sub": email, "exp": expire}, SECRET_KEY, algorithm="HS256")


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return {"email": payload.get("sub")}
    except:
        raise HTTPException(status_code=401, detail="Invalid token")


# ===== SCHEMAS =====
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class GeoJSONGeometry(BaseModel):
    type: str
    coordinates: list


class DateRange(BaseModel):
    start: str
    end: str


class AnalysisMode(BaseModel):
    use_historical_baseline: bool = False
    baseline_year: int = 2020
    polarization: str = "VV"
    apply_speckle_filter: bool = True


class AnalyzeRequest(BaseModel):
    polygon: GeoJSONGeometry
    date_range: DateRange
    mode: Optional[AnalysisMode] = None


# ===== PHYSICS ENGINE =====
DROUGHT_THRESHOLDS = {
    "VV": {"extreme_dry": -18.0, "very_dry": -15.0, "dry": -12.0, "moderate": -10.0, "wet": -8.0, "very_wet": -5.0},
    "VH": {"extreme_dry": -24.0, "very_dry": -21.0, "dry": -18.0, "moderate": -15.0, "wet": -12.0, "very_wet": -8.0}
}

SEASONAL_BASELINES = {1: -9.5, 2: -9.0, 3: -9.5, 4: -10.0, 5: -10.5, 6: -11.5, 7: -12.5, 8: -13.0, 9: -12.0, 10: -11.0, 11: -10.0, 12: -9.5}


def run_physics_analysis(polygon: dict, date_start: str, date_end: str, job_id: str, mode: Optional[AnalysisMode] = None) -> dict:
    coords = polygon.get("coordinates", [[]])
    ring = coords[0]
    n = len(ring)
    
    center_lon = sum(p[0] for p in ring) / n if n > 0 else 0
    center_lat = sum(p[1] for p in ring) / n if n > 0 else 0
    
    try:
        start_date = datetime.strptime(date_start, "%Y-%m-%d")
        month, year = start_date.month, start_date.year
    except:
        month, year = 6, 2024
    
    seed = int(abs(center_lat * 1000 + center_lon * 100 + month * 10 + year))
    np.random.seed(seed)
    
    polarization = mode.polarization if mode else "VV"
    thresholds = DROUGHT_THRESHOLDS.get(polarization, DROUGHT_THRESHOLDS["VV"])
    
    # Seasonal model
    if center_lat > 0:
        seasonal_offset = {6: -2.5, 7: -2.5, 8: -2.5, 12: 1.5, 1: 1.5, 2: 1.5}.get(month, 0)
    else:
        seasonal_offset = {6: 1.5, 7: 1.5, 8: 1.5, 12: -2.5, 1: -2.5, 2: -2.5}.get(month, 0)
    
    regional_offset = -2.0 if abs(center_lat) < 25 else (1.0 if abs(center_lat) > 55 else 0)
    year_offset = -1.5 if year in [2022, 2023] else (-0.5 if year == 2024 else 0)
    
    mean_db = -10.0 + seasonal_offset + regional_offset + year_offset + np.random.normal(0, 1.0)
    std_db = np.random.uniform(1.5, 3.0)
    
    drought_threshold = thresholds["dry"]
    z_score = (drought_threshold - mean_db) / std_db
    drought_pct = norm.cdf(z_score) * 100
    
    if drought_pct >= 70 or mean_db < thresholds["extreme_dry"]:
        severity = "EXTREME"
    elif drought_pct >= 50 or mean_db < thresholds["very_dry"]:
        severity = "SEVERE"
    elif drought_pct >= 30 or mean_db < thresholds["dry"]:
        severity = "MODERATE"
    elif drought_pct >= 10:
        severity = "MILD"
    else:
        severity = "NORMAL"
    
    baseline_mean = SEASONAL_BASELINES.get(month, -10.0)
    smi = max(0, min(100, ((mean_db - thresholds["dry"]) / (thresholds["wet"] - thresholds["dry"])) * 100))
    
    area_deg2 = 0.5 * abs(sum(ring[i][0] * ring[(i + 1) % n][1] - ring[(i + 1) % n][0] * ring[i][1] for i in range(n)))
    km_per_deg = 111 * np.cos(np.radians(center_lat))
    area_km2 = area_deg2 * (km_per_deg ** 2)
    
    return {
        "mean_sigma0_db": round(mean_db, 2),
        "min_sigma0_db": round(mean_db - 2.5 * std_db, 2),
        "max_sigma0_db": round(mean_db + 2.5 * std_db, 2),
        "std_sigma0_db": round(std_db, 2),
        "drought_percentage": round(drought_pct, 1),
        "drought_severity": severity,
        "soil_moisture_index": round(smi, 1),
        "area_km2": round(area_km2, 2),
        "anomaly_db": round(mean_db - baseline_mean, 2),
        "baseline_mean_db": baseline_mean,
        "polarization": polarization,
        "confidence": 0.85,
        "quality_flag": "SIMULATED"
    }


def generate_summary(stats: dict) -> str:
    severity_emoji = {"NORMAL": "🟢", "MILD": "🟡", "MODERATE": "🟠", "SEVERE": "🔴", "EXTREME": "⚠️"}
    return f"{severity_emoji.get(stats['drought_severity'], '')} {stats['drought_severity']}: {stats['drought_percentage']:.0f}% drought area, mean σ₀ {stats['mean_sigma0_db']:.1f} dB"


# ===== FASTAPI APP =====
app = FastAPI(
    title="AerisQ API",
    version="3.1.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== ROUTES =====
@app.get("/api")
def root():
    return {"service": "AerisQ API", "version": "3.1.0", "status": "operational"}


@app.get("/api/health")
def health():
    return {"status": "healthy", "environment": "vercel"}


@app.post("/api/auth/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    if form_data.username == GOD_MODE_EMAIL and verify_password(form_data.password, GOD_MODE_HASH):
        return Token(access_token=create_token(GOD_MODE_EMAIL))
    raise HTTPException(status_code=401, detail="Invalid credentials")


@app.get("/api/auth/me")
def get_me(user: dict = Depends(get_current_user)):
    return {"email": user["email"], "is_active": True}


@app.post("/api/auth/verify")
def verify_token_endpoint(user: dict = Depends(get_current_user)):
    return {"valid": True, "email": user["email"]}


@app.post("/api/v1/analyze")
def create_analysis(request: AnalyzeRequest, user: dict = Depends(get_current_user)):
    job_id = str(uuid.uuid4())
    
    # Try GEE for real SAR data, fallback to simulation
    stats = None
    if GEE_AVAILABLE:
        try:
            print(f"📡 Attempting GEE analysis for job {job_id}...")
            gee_result = gee_analyzer.analyze_area(
                polygon_geojson=request.polygon.model_dump(),
                date_start=request.date_range.start,
                date_end=request.date_range.end
            )
            
            if gee_result.get('quality_flag') == 'GEE_REALTIME':
                print(f"✅ GEE analysis successful!")
                stats = gee_result
            else:
                print(f"⚠️ GEE returned non-realtime data: {gee_result.get('error')}")
        except Exception as e:
            print(f"⚠️ GEE analysis failed: {e}")
    
    # Fallback to simulation if GEE not available or failed
    if not stats:
        print(f"🔄 Using simulation for job {job_id}")
        stats = run_physics_analysis(
            request.polygon.model_dump(),
            request.date_range.start,
            request.date_range.end,
            job_id,
            request.mode
        )
    
    severity_colors = {"NORMAL": "#22c55e", "MILD": "#eab308", "MODERATE": "#f97316", "SEVERE": "#ef4444", "EXTREME": "#7c2d12"}
    
    JOBS_STORE[job_id] = {
        "job_id": job_id,
        "status": "completed",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "stats": stats,
        "summary": generate_summary(stats),
        "geojson": {
            "type": "FeatureCollection",
            "features": [{"type": "Feature", "id": job_id, "geometry": request.polygon.model_dump(), "properties": {**stats, "fill": severity_colors.get(stats["drought_severity"], "#888"), "fill-opacity": 0.5}}]
        }
    }
    
    return {"job_id": job_id, "status": "completed", "message": f"Severity: {stats['drought_severity']}"}


@app.post("/api/v1/analyze/demo")
def create_demo_analysis(request: AnalyzeRequest):
    job_id = str(uuid.uuid4())
    stats = run_physics_analysis(request.polygon.model_dump(), request.date_range.start, request.date_range.end, job_id, request.mode)
    
    severity_colors = {"NORMAL": "#22c55e", "MILD": "#eab308", "MODERATE": "#f97316", "SEVERE": "#ef4444", "EXTREME": "#7c2d12"}
    
    JOBS_STORE[job_id] = {
        "job_id": job_id,
        "status": "completed",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "stats": stats,
        "summary": generate_summary(stats),
        "geojson": {
            "type": "FeatureCollection",
            "features": [{"type": "Feature", "id": job_id, "geometry": request.polygon.model_dump(), "properties": {**stats, "fill": severity_colors.get(stats["drought_severity"], "#888"), "fill-opacity": 0.5}}]
        }
    }
    
    return {"job_id": job_id, "status": "completed"}


@app.get("/api/v1/jobs/{job_id}")
def get_job(job_id: str, user: dict = Depends(get_current_user)):
    if job_id not in JOBS_STORE:
        raise HTTPException(status_code=404, detail="Job not found")
    return JOBS_STORE[job_id]


@app.get("/api/v1/jobs/{job_id}/public")
def get_job_public(job_id: str):
    if job_id not in JOBS_STORE:
        raise HTTPException(status_code=404, detail="Job not found")
    return JOBS_STORE[job_id]


@app.get("/api/v1/legend")
def get_legend():
    return {
        "legend": [
            {"severity": "NORMAL", "color": "#22c55e", "label": "Normal", "range": "< 10%"},
            {"severity": "MILD", "color": "#eab308", "label": "Mild", "range": "10-30%"},
            {"severity": "MODERATE", "color": "#f97316", "label": "Moderate", "range": "30-50%"},
            {"severity": "SEVERE", "color": "#ef4444", "label": "Severe", "range": "50-70%"},
            {"severity": "EXTREME", "color": "#7c2d12", "label": "Extreme", "range": "> 70%"},
        ],
        "thresholds": DROUGHT_THRESHOLDS["VV"]
    }


@app.get("/api/v1/baselines")
def get_baselines(month: Optional[int] = None):
    if month:
        return {"month": month, "baseline_sigma0_db": SEASONAL_BASELINES.get(month, -10.0)}
    return {"baselines": SEASONAL_BASELINES}
