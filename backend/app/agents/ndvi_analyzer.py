"""
NDVI Analyzer - Vegetation health using Google Earth Engine + Sentinel-2

NDVI = (NIR - Red) / (NIR + Red)
- Values near 1: Dense healthy vegetation
- Values near 0: Bare soil, rock
- Negative values: Water, clouds
"""
import os
import logging
from typing import Dict, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# Try importing Earth Engine
try:
    import ee
    EE_AVAILABLE = True
except ImportError:
    EE_AVAILABLE = False
    logger.warning("Earth Engine not available for NDVI analysis")


def analyze_ndvi(
    polygon_geojson: Dict,
    date_start: str,
    date_end: str,
    cloud_max: int = 20,
) -> Dict:
    """
    Analyze NDVI for a given area using Sentinel-2 via Google Earth Engine.
    
    Falls back to simulation if GEE is not available.
    """
    if not EE_AVAILABLE:
        return _simulate_ndvi(polygon_geojson, date_start, date_end)
    
    try:
        return _gee_ndvi(polygon_geojson, date_start, date_end, cloud_max)
    except Exception as e:
        logger.error(f"GEE NDVI analysis failed: {e}")
        return _simulate_ndvi(polygon_geojson, date_start, date_end)


def _gee_ndvi(
    polygon_geojson: Dict,
    date_start: str,
    date_end: str,
    cloud_max: int = 20,
) -> Dict:
    """Real NDVI analysis using Google Earth Engine."""
    # Create geometry
    coords = polygon_geojson.get("coordinates", [])
    geometry = ee.Geometry.Polygon(coords)
    
    # Get Sentinel-2 Surface Reflectance collection
    s2 = (ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
          .filterBounds(geometry)
          .filterDate(date_start, date_end)
          .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", cloud_max)))
    
    scene_count = s2.size().getInfo()
    
    if scene_count == 0:
        logger.warning("No Sentinel-2 scenes found, trying with higher cloud threshold")
        s2 = (ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
              .filterBounds(geometry)
              .filterDate(date_start, date_end)
              .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 50)))
        scene_count = s2.size().getInfo()
        
        if scene_count == 0:
            return _simulate_ndvi(polygon_geojson, date_start, date_end)
    
    # Calculate NDVI: (B8 - B4) / (B8 + B4)
    def add_ndvi(image):
        ndvi = image.normalizedDifference(["B8", "B4"]).rename("NDVI")
        return image.addBands(ndvi)
    
    s2_ndvi = s2.map(add_ndvi)
    
    # Get composite (median)
    composite = s2_ndvi.median()
    ndvi_band = composite.select("NDVI")
    
    # Calculate statistics
    stats = ndvi_band.reduceRegion(
        reducer=ee.Reducer.mean()
            .combine(ee.Reducer.stdDev(), sharedInputs=True)
            .combine(ee.Reducer.min(), sharedInputs=True)
            .combine(ee.Reducer.max(), sharedInputs=True)
            .combine(ee.Reducer.median(), sharedInputs=True),
        geometry=geometry,
        scale=10,  # Sentinel-2 resolution
        maxPixels=1e9,
        bestEffort=True
    ).getInfo()
    
    mean_ndvi = stats.get("NDVI_mean", 0)
    std_ndvi = stats.get("NDVI_stdDev", 0)
    min_ndvi = stats.get("NDVI_min", 0)
    max_ndvi = stats.get("NDVI_max", 0)
    median_ndvi = stats.get("NDVI_median", 0)
    
    # Classify vegetation health
    if mean_ndvi > 0.6:
        health = "EXCELLENT"
        health_desc = "Dense, healthy vegetation"
    elif mean_ndvi > 0.4:
        health = "GOOD"
        health_desc = "Moderate vegetation, generally healthy"
    elif mean_ndvi > 0.2:
        health = "STRESSED"
        health_desc = "Sparse or stressed vegetation"
    elif mean_ndvi > 0.1:
        health = "POOR"
        health_desc = "Very sparse vegetation, mostly bare soil"
    else:
        health = "BARREN"
        health_desc = "No significant vegetation, bare soil or water"
    
    # Calculate area
    area = geometry.area().getInfo() / 1_000_000  # m² to km²
    
    return {
        "index_type": "NDVI",
        "satellite": "Sentinel-2",
        "mean_value": round(mean_ndvi, 4),
        "std_value": round(std_ndvi, 4),
        "min_value": round(min_ndvi, 4),
        "max_value": round(max_ndvi, 4),
        "median_value": round(median_ndvi, 4),
        "classification": health,
        "classification_description": health_desc,
        "scene_count": scene_count,
        "area_km2": round(area, 2),
        "date_range": {"start": date_start, "end": date_end},
        "quality_flag": "GEE_REALTIME",
        "cloud_filter_pct": cloud_max,
        "scale_meters": 10,
    }


def _simulate_ndvi(polygon_geojson: Dict, date_start: str, date_end: str) -> Dict:
    """Simulated NDVI analysis for demo/fallback."""
    import numpy as np
    
    coords = polygon_geojson.get("coordinates", [[]])
    ring = coords[0] if coords else []
    n = len(ring) if ring else 1
    
    # Use location for reproducible results
    cx = sum(p[0] for p in ring) / n if ring else 15.0
    cy = sum(p[1] for p in ring) / n if ring else 49.0
    
    try:
        month = datetime.strptime(date_start, "%Y-%m-%d").month
    except:
        month = 6
    
    seed = int(abs(cy * 1000 + cx * 100 + month * 10))
    np.random.seed(seed)
    
    # Seasonal NDVI pattern (Northern Hemisphere)
    seasonal = {1: 0.15, 2: 0.18, 3: 0.25, 4: 0.40, 5: 0.55, 6: 0.65,
                7: 0.60, 8: 0.55, 9: 0.45, 10: 0.30, 11: 0.20, 12: 0.15}
    
    base = seasonal.get(month, 0.4)
    mean_ndvi = base + np.random.normal(0, 0.08)
    mean_ndvi = max(-0.1, min(0.9, mean_ndvi))
    
    std_ndvi = np.random.uniform(0.05, 0.15)
    
    if mean_ndvi > 0.6:
        health = "EXCELLENT"
    elif mean_ndvi > 0.4:
        health = "GOOD"
    elif mean_ndvi > 0.2:
        health = "STRESSED"
    elif mean_ndvi > 0.1:
        health = "POOR"
    else:
        health = "BARREN"
    
    # Area calculation
    if ring:
        area_deg2 = 0.5 * abs(sum(
            ring[i][0] * ring[(i+1) % n][1] - ring[(i+1) % n][0] * ring[i][1]
            for i in range(n)
        ))
        km_per_deg = 111 * np.cos(np.radians(cy))
        area = area_deg2 * (km_per_deg ** 2)
    else:
        area = 100.0
    
    return {
        "index_type": "NDVI",
        "satellite": "Sentinel-2",
        "mean_value": round(mean_ndvi, 4),
        "std_value": round(std_ndvi, 4),
        "min_value": round(mean_ndvi - 2 * std_ndvi, 4),
        "max_value": round(mean_ndvi + 2 * std_ndvi, 4),
        "median_value": round(mean_ndvi + np.random.normal(0, 0.02), 4),
        "classification": health,
        "classification_description": f"{'Simulated'}: {health.lower()} vegetation conditions",
        "scene_count": np.random.randint(5, 20),
        "area_km2": round(area, 2),
        "date_range": {"start": date_start, "end": date_end},
        "quality_flag": "SIMULATED",
        "cloud_filter_pct": 20,
        "scale_meters": 10,
    }
