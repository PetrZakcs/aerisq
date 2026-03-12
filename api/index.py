"""
AerisQ Backend API - Vercel Serverless Function
Complete prompt-based satellite analysis with GEE integration + simulation fallback
"""
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, List, Tuple
import hashlib
import uuid
import os
import re
import math
import logging

from jose import jwt
import numpy as np
from scipy.stats import norm

logger = logging.getLogger(__name__)

# ===== GEE INITIALIZATION =====
GEE_AVAILABLE = False
GEE_INIT_ERROR = ""
_ee = None

def _init_gee():
    """Initialize Google Earth Engine (lazy, once)."""
    global GEE_AVAILABLE, GEE_INIT_ERROR, _ee
    if GEE_AVAILABLE:
        return
    if GEE_INIT_ERROR:
        return  # Already failed, don't retry
    try:
        import ee as ee_module
        _ee = ee_module
        
        # Try service account auth
        sa_json = os.environ.get("GEE_SERVICE_ACCOUNT_JSON", "")
        project_id = os.environ.get("GEE_PROJECT_ID", "aerisq")
        
        if sa_json:
            import json, tempfile
            creds_dict = json.loads(sa_json)
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
                json.dump(creds_dict, f)
                creds_path = f.name
            credentials = _ee.ServiceAccountCredentials(
                creds_dict.get("client_email", ""),
                creds_path
            )
            _ee.Initialize(credentials=credentials, project=project_id)
            try:
                os.unlink(creds_path)
            except Exception:
                pass
        else:
            _ee.Initialize(project=project_id)
        
        # Quick smoke test
        _ee.Number(1).getInfo()
        GEE_AVAILABLE = True
        GEE_INIT_ERROR = ""
        print(f"✅ GEE initialized (project: {project_id})")
    except Exception as e:
        GEE_INIT_ERROR = f"{type(e).__name__}: {str(e)}"
        print(f"⚠️ GEE not available: {GEE_INIT_ERROR}")
        GEE_AVAILABLE = False
        _ee = None  # Reset so we don't block debug calls


# ===== CONFIGURATION =====
SECRET_KEY = os.environ.get("SECRET_KEY", "aerisq-vercel-production-key")
GOD_MODE_EMAIL = os.environ.get("GOD_MODE_EMAIL", "admin@aerisq.tech")
GOD_MODE_PASSWORD = os.environ.get("GOD_MODE_PASSWORD", "password123")

# In-memory storage (serverless - ephemeral)
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
    except Exception:
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


class PromptAnalyzeRequest(BaseModel):
    prompt: str
    polygon: Optional[GeoJSONGeometry] = None
    coordinates: Optional[Dict[str, float]] = None
    date_range: Optional[DateRange] = None


# ===== PROMPT PARSER =====
ANALYSIS_TYPES = {
    "ndvi": {
        "name": "NDVI (Vegetation Index)",
        "satellite": "Sentinel-2",
        "description": "Measures vegetation health using near-infrared and red bands",
        "formula": "(NIR - Red) / (NIR + Red)",
        "range": "-1 to 1 (healthy vegetation > 0.3)",
    },
    "ndwi": {
        "name": "NDWI (Water Index)",
        "satellite": "Sentinel-2",
        "description": "Detects water bodies and moisture content",
        "formula": "(Green - NIR) / (Green + NIR)",
        "range": "-1 to 1 (water > 0.3)",
    },
    "sar_moisture": {
        "name": "SAR Soil Moisture",
        "satellite": "Sentinel-1",
        "description": "Radar-based soil moisture estimation using backscatter",
        "formula": "σ₀ (VV polarization) → Soil Moisture Index",
        "range": "0-100 (dry=0, saturated=100)",
    },
    "sar_drought": {
        "name": "SAR Drought Detection",
        "satellite": "Sentinel-1",
        "description": "Drought severity classification from radar backscatter",
        "formula": "σ₀ vs seasonal baseline → anomaly detection",
        "range": "NORMAL / MILD / MODERATE / SEVERE / EXTREME",
    },
}

KEYWORD_MAP = {
    "ndvi": ["ndvi", "vegetation", "crop health", "greenness", "plant", "biomass",
             "chlorophyll", "vegetace", "rostliny", "crop", "harvest", "agriculture",
             "farm", "field", "zdraví", "úroda", "zelený"],
    "ndwi": ["ndwi", "water index", "water body", "water bodies", "wetland",
             "voda", "vodní", "lake", "river", "flood", "jezero", "řeka", "povodeň"],
    "sar_moisture": ["soil moisture", "moisture", "vlhkost", "půdní vlhkost",
                     "soil water", "humidity", "wet soil"],
    "sar_drought": ["drought", "sucho", "dry", "backscatter", "sar", "radar",
                    "sigma", "σ₀", "sentinel-1", "arid", "desertification",
                    "suchý", "dešťový deficit"],
}


def parse_prompt(prompt: str) -> Tuple[str, Dict]:
    """Parse natural language prompt to determine analysis type."""
    prompt_lower = prompt.lower().strip()

    scores = {}
    for analysis_type, keywords in KEYWORD_MAP.items():
        score = 0
        for keyword in keywords:
            if keyword in prompt_lower:
                if keyword == prompt_lower or f" {keyword} " in f" {prompt_lower} ":
                    score += 10
                else:
                    score += 5
        scores[analysis_type] = score

    best_type = max(scores, key=scores.get)
    best_score = scores[best_type]

    if best_score == 0:
        best_type = "sar_drought"

    # Try to extract coordinates
    coords = _extract_coordinates(prompt)

    metadata = {
        "analysis_type": best_type,
        "analysis_info": ANALYSIS_TYPES[best_type],
        "confidence": min(1.0, best_score / 10.0) if best_score > 0 else 0.3,
        "extracted_coordinates": coords,
        "original_prompt": prompt,
    }
    return best_type, metadata


def _extract_coordinates(prompt: str) -> Optional[Dict]:
    """Extract lat/lon from prompt text."""
    match = re.search(r'(-?\d+\.?\d*)\s*[,;]\s*(-?\d+\.?\d*)', prompt)
    if match:
        lat, lon = float(match.group(1)), float(match.group(2))
        if -90 <= lat <= 90 and -180 <= lon <= 180:
            return {"lat": lat, "lon": lon}
    return None


def _coords_to_polygon(lat: float, lon: float, radius_km: float = 5.0) -> Dict:
    """Create a square polygon around a point."""
    delta = radius_km / 111.0  # ~1 degree = 111km
    delta_lon = delta / math.cos(math.radians(lat))
    return {
        "type": "Polygon",
        "coordinates": [[
            [lon - delta_lon, lat - delta],
            [lon + delta_lon, lat - delta],
            [lon + delta_lon, lat + delta],
            [lon - delta_lon, lat + delta],
            [lon - delta_lon, lat - delta],
        ]]
    }


# ===== GEE ANALYZERS (real satellite data) =====

def _gee_ndvi(polygon_geojson: Dict, date_start: str, date_end: str) -> Optional[Dict]:
    """Real NDVI analysis via Google Earth Engine."""
    if not GEE_AVAILABLE or _ee is None:
        return None
    try:
        coords = polygon_geojson.get("coordinates", [])
        geometry = _ee.Geometry.Polygon(coords)

        s2 = (_ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
              .filterBounds(geometry)
              .filterDate(date_start, date_end)
              .filter(_ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 30)))

        scene_count = s2.size().getInfo()
        if scene_count == 0:
            return None

        def add_ndvi(image):
            return image.addBands(image.normalizedDifference(["B8", "B4"]).rename("NDVI"))

        composite = s2.map(add_ndvi).median().select("NDVI")
        stats = composite.reduceRegion(
            reducer=_ee.Reducer.mean()
                .combine(_ee.Reducer.stdDev(), sharedInputs=True)
                .combine(_ee.Reducer.min(), sharedInputs=True)
                .combine(_ee.Reducer.max(), sharedInputs=True)
                .combine(_ee.Reducer.median(), sharedInputs=True),
            geometry=geometry, scale=10, maxPixels=1e9, bestEffort=True
        ).getInfo()

        mean_v = stats.get("NDVI_mean", 0) or 0
        if mean_v > 0.6: cls, desc = "EXCELLENT", "Dense, healthy vegetation"
        elif mean_v > 0.4: cls, desc = "GOOD", "Moderate vegetation, generally healthy"
        elif mean_v > 0.2: cls, desc = "STRESSED", "Sparse or stressed vegetation"
        elif mean_v > 0.1: cls, desc = "POOR", "Very sparse vegetation"
        else: cls, desc = "BARREN", "No significant vegetation"

        area = geometry.area().getInfo() / 1_000_000

        # Generate Map Tile URL
        vis_params = {
            'min': 0, 'max': 0.8,
            'palette': ['#ff0000', '#ffff00', '#00ff00'] # Red to Green
        }
        map_id_dict = _ee.data.getMapId({
            'image': composite.visualize(**vis_params),
        })
        map_url = map_id_dict['tile_fetcher'].url_format

        return {
            "index_type": "NDVI", "satellite": "Sentinel-2",
            "mean_value": round(mean_v, 4),
            "std_value": round(stats.get("NDVI_stdDev", 0) or 0, 4),
            "min_value": round(stats.get("NDVI_min", 0) or 0, 4),
            "max_value": round(stats.get("NDVI_max", 0) or 0, 4),
            "median_value": round(stats.get("NDVI_median", 0) or 0, 4),
            "classification": cls, "classification_description": desc,
            "scene_count": scene_count, "area_km2": round(area, 2),
            "date_range": {"start": date_start, "end": date_end},
            "quality_flag": "GEE_REALTIME", "scale_meters": 10,
            "map_url": map_url
        }
    except Exception as e:
        print(f"GEE NDVI error: {e}")
        return None


def _gee_ndwi(polygon_geojson: Dict, date_start: str, date_end: str) -> Optional[Dict]:
    """Real NDWI analysis via Google Earth Engine."""
    if not GEE_AVAILABLE or _ee is None:
        return None
    try:
        coords = polygon_geojson.get("coordinates", [])
        geometry = _ee.Geometry.Polygon(coords)

        s2 = (_ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
              .filterBounds(geometry)
              .filterDate(date_start, date_end)
              .filter(_ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 30)))

        scene_count = s2.size().getInfo()
        if scene_count == 0:
            return None

        def add_ndwi(image):
            return image.addBands(image.normalizedDifference(["B3", "B8"]).rename("NDWI"))

        composite = s2.map(add_ndwi).median().select("NDWI")
        stats = composite.reduceRegion(
            reducer=_ee.Reducer.mean()
                .combine(_ee.Reducer.stdDev(), sharedInputs=True)
                .combine(_ee.Reducer.min(), sharedInputs=True)
                .combine(_ee.Reducer.max(), sharedInputs=True)
                .combine(_ee.Reducer.median(), sharedInputs=True),
            geometry=geometry, scale=10, maxPixels=1e9, bestEffort=True
        ).getInfo()

        mean_v = stats.get("NDWI_mean", 0) or 0

        # Water mask
        water_mask = composite.gt(0.3)
        water_stats = water_mask.reduceRegion(
            reducer=_ee.Reducer.mean(), geometry=geometry,
            scale=10, maxPixels=1e9, bestEffort=True
        ).getInfo()
        water_pct = (water_stats.get("NDWI", 0) or 0) * 100

        if mean_v > 0.3: cls, desc = "WATER", "Open water body detected"
        elif mean_v > 0.1: cls, desc = "WET", "Moist/wet conditions"
        elif mean_v > -0.1: cls, desc = "MODERATE", "Mixed conditions"
        else: cls, desc = "DRY", "Dry land, no significant water"

        area = geometry.area().getInfo() / 1_000_000

        # Generate Map Tile URL
        vis_params = {
            'min': -0.2, 'max': 0.5,
            'palette': ['#ffffff', '#0000ff'] # White to Blue
        }
        map_id_dict = _ee.data.getMapId({
            'image': composite.visualize(**vis_params),
        })
        map_url = map_id_dict['tile_fetcher'].url_format

        return {
            "index_type": "NDWI", "satellite": "Sentinel-2",
            "mean_value": round(mean_v, 4),
            "std_value": round(stats.get("NDWI_stdDev", 0) or 0, 4),
            "min_value": round(stats.get("NDWI_min", 0) or 0, 4),
            "max_value": round(stats.get("NDWI_max", 0) or 0, 4),
            "median_value": round(stats.get("NDWI_median", 0) or 0, 4),
            "water_percentage": round(water_pct, 1),
            "classification": cls, "classification_description": desc,
            "scene_count": scene_count, "area_km2": round(area, 2),
            "date_range": {"start": date_start, "end": date_end},
            "quality_flag": "GEE_REALTIME", "scale_meters": 10,
            "map_url": map_url
        }
    except Exception as e:
        print(f"GEE NDWI error: {e}")
        return None


def _gee_sar(polygon_geojson: Dict, date_start: str, date_end: str) -> Optional[Dict]:
    """Real SAR drought/moisture analysis via Google Earth Engine."""
    if not GEE_AVAILABLE or _ee is None:
        return None
    try:
        coords = polygon_geojson.get("coordinates", [])
        geometry = _ee.Geometry.Polygon(coords)

        s1 = (_ee.ImageCollection("COPERNICUS/S1_GRD")
              .filterBounds(geometry)
              .filterDate(date_start, date_end)
              .filter(_ee.Filter.listContains("transmitterReceiverPolarisation", "VV"))
              .filter(_ee.Filter.eq("instrumentMode", "IW"))
              .select("VV"))

        scene_count = s1.size().getInfo()
        if scene_count == 0:
            return None

        composite = s1.median()
        stats = composite.reduceRegion(
            reducer=_ee.Reducer.mean()
                .combine(_ee.Reducer.stdDev(), sharedInputs=True)
                .combine(_ee.Reducer.min(), sharedInputs=True)
                .combine(_ee.Reducer.max(), sharedInputs=True)
                .combine(_ee.Reducer.median(), sharedInputs=True),
            geometry=geometry, scale=10, maxPixels=1e9, bestEffort=True
        ).getInfo()

        mean_db = stats.get("VV_mean", -10) or -10
        std_db = stats.get("VV_stdDev", 2) or 2

        # Drought classification
        drought_threshold = -12.0
        z_score = (drought_threshold - mean_db) / max(std_db, 0.1)
        drought_pct = norm.cdf(z_score) * 100

        if drought_pct >= 70: severity = "EXTREME"
        elif drought_pct >= 50: severity = "SEVERE"
        elif drought_pct >= 30: severity = "MODERATE"
        elif drought_pct >= 10: severity = "MILD"
        else: severity = "NORMAL"

        # Soil moisture index (simple model)
        smi = max(0, min(100, ((mean_db - (-18)) / ((-5) - (-18))) * 100))

        area = geometry.area().getInfo() / 1_000_000

        # Seasonal baseline
        try:
            month = datetime.strptime(date_start, "%Y-%m-%d").month
        except Exception:
            month = 6
        baselines = {1: -9.5, 2: -9.0, 3: -9.5, 4: -10.0, 5: -10.5, 6: -11.5,
                     7: -12.5, 8: -13.0, 9: -12.0, 10: -11.0, 11: -10.0, 12: -9.5}
        baseline = baselines.get(month, -10.0)

        # Generate Map Tile URL (SAR)
        vis_params = {
            'min': -20, 'max': -5,
            'palette': ['#000000', '#444444', '#888888', '#ffffff'] # B/W for radar
        }
        map_id_dict = _ee.data.getMapId({
            'image': composite.visualize(**vis_params),
        })
        map_url = map_id_dict['tile_fetcher'].url_format

        return {
            "index_type": "SAR", "satellite": "Sentinel-1",
            "mean_value": round(mean_db, 2),
            "std_value": round(std_db, 2),
            "min_value": round(stats.get("VV_min", mean_db - 2.5 * std_db) or (mean_db - 2.5 * std_db), 2),
            "max_value": round(stats.get("VV_max", mean_db + 2.5 * std_db) or (mean_db + 2.5 * std_db), 2),
            "median_value": round(stats.get("VV_median", mean_db) or mean_db, 2),
            "drought_percentage": round(drought_pct, 1),
            "soil_moisture_index": round(smi, 1),
            "anomaly_db": round(mean_db - baseline, 2),
            "classification": severity,
            "classification_description": f"SAR drought severity: {severity}",
            "scene_count": scene_count, "area_km2": round(area, 2),
            "date_range": {"start": date_start, "end": date_end},
            "quality_flag": "GEE_REALTIME", "scale_meters": 10,
            "confidence": min(0.95, 0.5 + scene_count * 0.05),
            "map_url": map_url
        }
    except Exception as e:
        print(f"GEE SAR error: {e}")
        return None


# ===== SIMULATION FALLBACKS =====

DROUGHT_THRESHOLDS = {
    "VV": {"extreme_dry": -18.0, "very_dry": -15.0, "dry": -12.0, "moderate": -10.0, "wet": -8.0, "very_wet": -5.0},
    "VH": {"extreme_dry": -24.0, "very_dry": -21.0, "dry": -18.0, "moderate": -15.0, "wet": -12.0, "very_wet": -8.0}
}
SEASONAL_BASELINES = {1: -9.5, 2: -9.0, 3: -9.5, 4: -10.0, 5: -10.5, 6: -11.5, 7: -12.5, 8: -13.0, 9: -12.0, 10: -11.0, 11: -10.0, 12: -9.5}


def _polygon_area_km2(coords: list, center_lat: float) -> float:
    """Calculate approximate polygon area in km²."""
    ring = coords[0] if coords else []
    n = len(ring)
    if n < 3:
        return 100.0
    area_deg2 = 0.5 * abs(sum(
        ring[i][0] * ring[(i + 1) % n][1] - ring[(i + 1) % n][0] * ring[i][1]
        for i in range(n)
    ))
    km_per_deg = 111 * math.cos(math.radians(center_lat))
    return area_deg2 * (km_per_deg ** 2)


def _simulate_ndvi(polygon: Dict, date_start: str, date_end: str) -> Dict:
    """Simulated NDVI with realistic seasonal patterns."""
    coords = polygon.get("coordinates", [[]])
    ring = coords[0] if coords else []
    n = len(ring) if ring else 1
    cx = sum(p[0] for p in ring) / n if ring else 15.0
    cy = sum(p[1] for p in ring) / n if ring else 49.0
    try:
        month = datetime.strptime(date_start, "%Y-%m-%d").month
    except Exception:
        month = 6

    np.random.seed(int(abs(cy * 1000 + cx * 100 + month * 10)))

    seasonal = {1: 0.15, 2: 0.18, 3: 0.25, 4: 0.40, 5: 0.55, 6: 0.65,
                7: 0.60, 8: 0.55, 9: 0.45, 10: 0.30, 11: 0.20, 12: 0.15}
    base = seasonal.get(month, 0.4)
    # latitude adjustment: tropical = higher, arctic = lower
    lat_factor = 1.0 - abs(cy - 25) / 90.0  # peak at 25°
    mean_ndvi = base * (0.7 + 0.3 * lat_factor) + np.random.normal(0, 0.05)
    mean_ndvi = max(-0.1, min(0.9, mean_ndvi))
    std_ndvi = np.random.uniform(0.05, 0.12)

    if mean_ndvi > 0.6: cls, desc = "EXCELLENT", "Dense, healthy vegetation"
    elif mean_ndvi > 0.4: cls, desc = "GOOD", "Moderate vegetation, generally healthy"
    elif mean_ndvi > 0.2: cls, desc = "STRESSED", "Sparse or stressed vegetation"
    elif mean_ndvi > 0.1: cls, desc = "POOR", "Very sparse vegetation"
    else: cls, desc = "BARREN", "No significant vegetation"

    area = _polygon_area_km2(coords, cy)

    return {
        "index_type": "NDVI", "satellite": "Sentinel-2",
        "mean_value": round(mean_ndvi, 4),
        "std_value": round(std_ndvi, 4),
        "min_value": round(mean_ndvi - 2 * std_ndvi, 4),
        "max_value": round(mean_ndvi + 2 * std_ndvi, 4),
        "median_value": round(mean_ndvi + np.random.normal(0, 0.01), 4),
        "classification": cls, "classification_description": desc,
        "scene_count": int(np.random.randint(8, 25)),
        "area_km2": round(area, 2),
        "date_range": {"start": date_start, "end": date_end},
        "quality_flag": "MODELED", "scale_meters": 10,
    }


def _simulate_ndwi(polygon: Dict, date_start: str, date_end: str) -> Dict:
    """Simulated NDWI."""
    coords = polygon.get("coordinates", [[]])
    ring = coords[0] if coords else []
    n = len(ring) if ring else 1
    cx = sum(p[0] for p in ring) / n if ring else 15.0
    cy = sum(p[1] for p in ring) / n if ring else 49.0
    try:
        month = datetime.strptime(date_start, "%Y-%m-%d").month
    except Exception:
        month = 6

    np.random.seed(int(abs(cy * 1000 + cx * 100 + month * 10 + 42)))

    mean_ndwi = np.random.uniform(-0.3, 0.1)
    std_ndwi = np.random.uniform(0.05, 0.15)
    water_pct = max(0, (mean_ndwi + 0.3) / 0.6 * 30)

    if mean_ndwi > 0.3: cls, desc = "WATER", "Open water body detected"
    elif mean_ndwi > 0.1: cls, desc = "WET", "Moist/wet conditions"
    elif mean_ndwi > -0.1: cls, desc = "MODERATE", "Mixed conditions"
    else: cls, desc = "DRY", "Dry land, no significant water"

    area = _polygon_area_km2(coords, cy)

    return {
        "index_type": "NDWI", "satellite": "Sentinel-2",
        "mean_value": round(mean_ndwi, 4),
        "std_value": round(std_ndwi, 4),
        "min_value": round(mean_ndwi - 2 * std_ndwi, 4),
        "max_value": round(mean_ndwi + 2 * std_ndwi, 4),
        "median_value": round(mean_ndwi + np.random.normal(0, 0.02), 4),
        "water_percentage": round(water_pct, 1),
        "classification": cls, "classification_description": desc,
        "scene_count": int(np.random.randint(5, 20)),
        "area_km2": round(area, 2),
        "date_range": {"start": date_start, "end": date_end},
        "quality_flag": "MODELED", "scale_meters": 10,
    }


def _simulate_sar(polygon: Dict, date_start: str, date_end: str, mode: Optional[AnalysisMode] = None) -> Dict:
    """Simulated SAR drought analysis with realistic physics model."""
    coords = polygon.get("coordinates", [[]])
    ring = coords[0] if coords else []
    n = len(ring) if ring else 1
    cx = sum(p[0] for p in ring) / n if ring else 15.0
    cy = sum(p[1] for p in ring) / n if ring else 49.0
    try:
        start_date = datetime.strptime(date_start, "%Y-%m-%d")
        month, year = start_date.month, start_date.year
    except Exception:
        month, year = 6, 2024

    np.random.seed(int(abs(cy * 1000 + cx * 100 + month * 10 + year)))

    polarization = mode.polarization if mode else "VV"
    thresholds = DROUGHT_THRESHOLDS.get(polarization, DROUGHT_THRESHOLDS["VV"])

    # Seasonal model
    if cy > 0:
        seasonal_offset = {6: -2.5, 7: -2.5, 8: -2.5, 12: 1.5, 1: 1.5, 2: 1.5}.get(month, 0)
    else:
        seasonal_offset = {6: 1.5, 7: 1.5, 8: 1.5, 12: -2.5, 1: -2.5, 2: -2.5}.get(month, 0)

    regional_offset = -2.0 if abs(cy) < 25 else (1.0 if abs(cy) > 55 else 0)
    year_offset = -1.5 if year in [2022, 2023] else (-0.5 if year == 2024 else 0)

    mean_db = -10.0 + seasonal_offset + regional_offset + year_offset + np.random.normal(0, 1.0)
    std_db = np.random.uniform(1.5, 3.0)

    drought_threshold = thresholds["dry"]
    z_score = (drought_threshold - mean_db) / std_db
    drought_pct = norm.cdf(z_score) * 100

    if drought_pct >= 70: severity = "EXTREME"
    elif drought_pct >= 50: severity = "SEVERE"
    elif drought_pct >= 30: severity = "MODERATE"
    elif drought_pct >= 10: severity = "MILD"
    else: severity = "NORMAL"

    baseline_mean = SEASONAL_BASELINES.get(month, -10.0)
    smi = max(0, min(100, ((mean_db - thresholds["dry"]) / (thresholds["wet"] - thresholds["dry"])) * 100))
    area = _polygon_area_km2(coords, cy)

    return {
        "index_type": "SAR", "satellite": "Sentinel-1",
        "mean_value": round(mean_db, 2),
        "std_value": round(std_db, 2),
        "min_value": round(mean_db - 2.5 * std_db, 2),
        "max_value": round(mean_db + 2.5 * std_db, 2),
        "median_value": round(mean_db + np.random.normal(0, 0.3), 2),
        "drought_percentage": round(drought_pct, 1),
        "soil_moisture_index": round(smi, 1),
        "anomaly_db": round(mean_db - baseline_mean, 2),
        "classification": severity,
        "classification_description": f"Drought severity: {severity}",
        "scene_count": int(np.random.randint(10, 30)),
        "area_km2": round(area, 2),
        "date_range": {"start": date_start, "end": date_end},
        "quality_flag": "MODELED", "scale_meters": 10,
        "confidence": 0.82,
    }


# ===== UNIFIED ANALYSIS DISPATCHER =====

def run_analysis(analysis_type: str, polygon: Dict, date_start: str, date_end: str, mode: Optional[AnalysisMode] = None) -> Dict:
    """Run analysis: try GEE first, fallback to simulation."""
    _init_gee()

    gee_result = None

    if analysis_type == "ndvi":
        gee_result = _gee_ndvi(polygon, date_start, date_end)
        if gee_result is None:
            return _simulate_ndvi(polygon, date_start, date_end)
        return gee_result

    elif analysis_type == "ndwi":
        gee_result = _gee_ndwi(polygon, date_start, date_end)
        if gee_result is None:
            return _simulate_ndwi(polygon, date_start, date_end)
        return gee_result

    elif analysis_type in ("sar_drought", "sar_moisture"):
        gee_result = _gee_sar(polygon, date_start, date_end)
        if gee_result is None:
            return _simulate_sar(polygon, date_start, date_end, mode)
        return gee_result

    else:
        return _simulate_sar(polygon, date_start, date_end, mode)


# ===== FASTAPI APP =====
app = FastAPI(
    title="AerisQ API",
    version="4.0.0",
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
    _init_gee()
    return {
        "service": "AerisQ API",
        "version": "4.0.0",
        "status": "operational",
        "gee_available": GEE_AVAILABLE,
        "capabilities": ["ndvi", "ndwi", "sar_drought", "sar_moisture"],
    }


@app.get("/api/health")
def health():
    return {"status": "healthy", "environment": "vercel", "gee": GEE_AVAILABLE}


@app.get("/api/debug")
def debug():
    """Debug endpoint to diagnose GEE setup issues. Forces fresh retry."""
    global GEE_INIT_ERROR
    GEE_INIT_ERROR = ""  # Reset to force retry
    _init_gee()
    sa_json = os.environ.get("GEE_SERVICE_ACCOUNT_JSON", "")
    project_id = os.environ.get("GEE_PROJECT_ID", "")
    return {
        "gee_available": GEE_AVAILABLE,
        "gee_init_error": GEE_INIT_ERROR,
        "env_GEE_SERVICE_ACCOUNT_JSON_set": bool(sa_json),
        "env_GEE_SERVICE_ACCOUNT_JSON_length": len(sa_json),
        "env_GEE_PROJECT_ID": project_id or "(not set)",
        "earthengine_import": _ee is not None,
    }


# ===== AUTH =====

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


# ===== PROMPT-BASED ANALYSIS (main endpoint for investors) =====

@app.post("/api/v1/analyze/prompt")
async def analyze_prompt(request: PromptAnalyzeRequest):
    """
    Natural language satellite analysis.
    Parses the prompt, determines analysis type, runs analysis.
    No auth required for demo accessibility.
    """
    analysis_type, metadata = parse_prompt(request.prompt)

    # Resolve polygon
    polygon = None
    if request.polygon:
        polygon = request.polygon.model_dump()
    elif request.coordinates:
        lat = request.coordinates.get("lat", 49.8)
        lon = request.coordinates.get("lon", 15.5)
        polygon = _coords_to_polygon(lat, lon)
    elif metadata.get("extracted_coordinates"):
        c = metadata["extracted_coordinates"]
        polygon = _coords_to_polygon(c["lat"], c["lon"])
    else:
        # Default: Vysočina region, Czech Republic (our demo area)
        polygon = {
            "type": "Polygon",
            "coordinates": [[[15.3, 49.7], [15.7, 49.7], [15.7, 49.9], [15.3, 49.9], [15.3, 49.7]]]
        }

    # Resolve dates
    if request.date_range:
        date_start = request.date_range.start
        date_end = request.date_range.end
    else:
        end = datetime.now(timezone.utc)
        start = end - timedelta(days=30)
        date_start = start.strftime("%Y-%m-%d")
        date_end = end.strftime("%Y-%m-%d")

    # Run analysis
    results = run_analysis(analysis_type, polygon, date_start, date_end)

    job_id = str(uuid.uuid4())

    response = {
        "job_id": job_id,
        "status": "completed",
        "prompt": request.prompt,
        "analysis_type": analysis_type,
        "analysis_info": metadata["analysis_info"],
        "prompt_confidence": metadata["confidence"],
        "results": results,
        "polygon_used": polygon,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    JOBS_STORE[job_id] = response
    return response


# ===== LEGACY ANALYSIS ENDPOINTS =====

@app.post("/api/v1/analyze")
def create_analysis(request: AnalyzeRequest, user: dict = Depends(get_current_user)):
    job_id = str(uuid.uuid4())
    polygon = request.polygon.model_dump()

    results = run_analysis("sar_drought", polygon, request.date_range.start, request.date_range.end, request.mode)

    # Convert to legacy format
    stats = {
        "mean_sigma0_db": results.get("mean_value", -10),
        "min_sigma0_db": results.get("min_value", -15),
        "max_sigma0_db": results.get("max_value", -5),
        "std_sigma0_db": results.get("std_value", 2),
        "drought_percentage": results.get("drought_percentage", 0),
        "drought_severity": results.get("classification", "NORMAL"),
        "soil_moisture_index": results.get("soil_moisture_index", 50),
        "area_km2": results.get("area_km2", 100),
        "anomaly_db": results.get("anomaly_db", 0),
        "baseline_mean_db": SEASONAL_BASELINES.get(datetime.now().month, -10),
        "polarization": "VV",
        "confidence": results.get("confidence", 0.82),
        "quality_flag": results.get("quality_flag", "MODELED"),
    }

    severity_colors = {"NORMAL": "#22c55e", "MILD": "#eab308", "MODERATE": "#f97316", "SEVERE": "#ef4444", "EXTREME": "#7c2d12"}

    JOBS_STORE[job_id] = {
        "job_id": job_id, "status": "completed",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "stats": stats,
        "summary": f"{stats['drought_severity']}: {stats['drought_percentage']:.0f}% drought area, mean σ₀ {stats['mean_sigma0_db']:.1f} dB",
        "geojson": {
            "type": "FeatureCollection",
            "features": [{"type": "Feature", "id": job_id, "geometry": polygon,
                          "properties": {**stats, "fill": severity_colors.get(stats["drought_severity"], "#888"), "fill-opacity": 0.5}}]
        }
    }

    return {"job_id": job_id, "status": "completed", "message": f"Severity: {stats['drought_severity']}"}


@app.post("/api/v1/analyze/demo")
def create_demo_analysis(request: AnalyzeRequest):
    """Demo analysis without auth."""
    job_id = str(uuid.uuid4())
    polygon = request.polygon.model_dump()

    results = run_analysis("sar_drought", polygon, request.date_range.start, request.date_range.end, request.mode)

    stats = {
        "mean_sigma0_db": results.get("mean_value", -10),
        "min_sigma0_db": results.get("min_value", -15),
        "max_sigma0_db": results.get("max_value", -5),
        "std_sigma0_db": results.get("std_value", 2),
        "drought_percentage": results.get("drought_percentage", 0),
        "drought_severity": results.get("classification", "NORMAL"),
        "soil_moisture_index": results.get("soil_moisture_index", 50),
        "area_km2": results.get("area_km2", 100),
        "anomaly_db": results.get("anomaly_db", 0),
        "polarization": "VV",
        "confidence": results.get("confidence", 0.82),
        "quality_flag": results.get("quality_flag", "MODELED"),
    }

    severity_colors = {"NORMAL": "#22c55e", "MILD": "#eab308", "MODERATE": "#f97316", "SEVERE": "#ef4444", "EXTREME": "#7c2d12"}

    JOBS_STORE[job_id] = {
        "job_id": job_id, "status": "completed",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "stats": stats,
        "summary": f"{stats['drought_severity']}: {stats['drought_percentage']:.0f}% drought area",
        "geojson": {
            "type": "FeatureCollection",
            "features": [{"type": "Feature", "id": job_id, "geometry": polygon,
                          "properties": {**stats, "fill": severity_colors.get(stats["drought_severity"], "#888"), "fill-opacity": 0.5}}]
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


@app.get("/api/v1/capabilities")
def get_capabilities():
    """List all available analysis capabilities for the frontend."""
    _init_gee()
    return {
        "analysis_types": ANALYSIS_TYPES,
        "gee_available": GEE_AVAILABLE,
        "example_prompts": [
            {"prompt": "Analyze NDVI vegetation health", "type": "ndvi", "icon": "🌿"},
            {"prompt": "Check soil moisture levels", "type": "sar_moisture", "icon": "💧"},
            {"prompt": "Detect water bodies with NDWI", "type": "ndwi", "icon": "🌊"},
            {"prompt": "Show drought severity with SAR", "type": "sar_drought", "icon": "🔥"},
            {"prompt": "Crop health analysis for agriculture", "type": "ndvi", "icon": "🌾"},
        ],
    }
