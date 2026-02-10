"""
NDWI Analyzer - Water detection using Google Earth Engine + Sentinel-2

NDWI = (Green - NIR) / (Green + NIR)
- Values > 0.3: Water
- Values 0 to 0.3: Wet/moist areas
- Values < 0: Dry land/vegetation
"""
import os
import logging
from typing import Dict, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

try:
    import ee
    EE_AVAILABLE = True
except ImportError:
    EE_AVAILABLE = False
    logger.warning("Earth Engine not available for NDWI analysis")


def analyze_ndwi(
    polygon_geojson: Dict,
    date_start: str,
    date_end: str,
    cloud_max: int = 20,
) -> Dict:
    """
    Analyze NDWI for a given area using Sentinel-2 via Google Earth Engine.
    Falls back to simulation if GEE is not available.
    """
    if not EE_AVAILABLE:
        return _simulate_ndwi(polygon_geojson, date_start, date_end)
    
    try:
        return _gee_ndwi(polygon_geojson, date_start, date_end, cloud_max)
    except Exception as e:
        logger.error(f"GEE NDWI analysis failed: {e}")
        return _simulate_ndwi(polygon_geojson, date_start, date_end)


def _gee_ndwi(
    polygon_geojson: Dict,
    date_start: str,
    date_end: str,
    cloud_max: int = 20,
) -> Dict:
    """Real NDWI analysis using Google Earth Engine."""
    coords = polygon_geojson.get("coordinates", [])
    geometry = ee.Geometry.Polygon(coords)
    
    # Sentinel-2 Surface Reflectance
    s2 = (ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
          .filterBounds(geometry)
          .filterDate(date_start, date_end)
          .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", cloud_max)))
    
    scene_count = s2.size().getInfo()
    
    if scene_count == 0:
        s2 = (ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
              .filterBounds(geometry)
              .filterDate(date_start, date_end)
              .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 50)))
        scene_count = s2.size().getInfo()
        if scene_count == 0:
            return _simulate_ndwi(polygon_geojson, date_start, date_end)
    
    # NDWI = (B3 - B8) / (B3 + B8)
    def add_ndwi(image):
        ndwi = image.normalizedDifference(["B3", "B8"]).rename("NDWI")
        return image.addBands(ndwi)
    
    s2_ndwi = s2.map(add_ndwi)
    composite = s2_ndwi.median()
    ndwi_band = composite.select("NDWI")
    
    stats = ndwi_band.reduceRegion(
        reducer=ee.Reducer.mean()
            .combine(ee.Reducer.stdDev(), sharedInputs=True)
            .combine(ee.Reducer.min(), sharedInputs=True)
            .combine(ee.Reducer.max(), sharedInputs=True)
            .combine(ee.Reducer.median(), sharedInputs=True),
        geometry=geometry,
        scale=10,
        maxPixels=1e9,
        bestEffort=True
    ).getInfo()
    
    mean_ndwi = stats.get("NDWI_mean", 0)
    std_ndwi = stats.get("NDWI_stdDev", 0)
    min_ndwi = stats.get("NDWI_min", 0)
    max_ndwi = stats.get("NDWI_max", 0)
    median_ndwi = stats.get("NDWI_median", 0)
    
    # Water percentage (NDWI > 0.3)
    water_mask = ndwi_band.gt(0.3)
    water_stats = water_mask.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=geometry,
        scale=10,
        maxPixels=1e9,
        bestEffort=True
    ).getInfo()
    water_pct = (water_stats.get("NDWI", 0) or 0) * 100
    
    # Classification
    if mean_ndwi > 0.3:
        classification = "WATER"
        desc = "Open water body detected"
    elif mean_ndwi > 0.1:
        classification = "WET"
        desc = "Moist/wet conditions, possible wetland"
    elif mean_ndwi > -0.1:
        classification = "MODERATE"
        desc = "Mixed conditions, some moisture present"
    else:
        classification = "DRY"
        desc = "Dry land, no significant water"
    
    area = geometry.area().getInfo() / 1_000_000
    
    return {
        "index_type": "NDWI",
        "satellite": "Sentinel-2",
        "mean_value": round(mean_ndwi, 4),
        "std_value": round(std_ndwi, 4),
        "min_value": round(min_ndwi, 4),
        "max_value": round(max_ndwi, 4),
        "median_value": round(median_ndwi, 4),
        "water_percentage": round(water_pct, 1),
        "classification": classification,
        "classification_description": desc,
        "scene_count": scene_count,
        "area_km2": round(area, 2),
        "date_range": {"start": date_start, "end": date_end},
        "quality_flag": "GEE_REALTIME",
        "cloud_filter_pct": cloud_max,
        "scale_meters": 10,
    }


def _simulate_ndwi(polygon_geojson: Dict, date_start: str, date_end: str) -> Dict:
    """Simulated NDWI for demo/fallback."""
    import numpy as np
    
    coords = polygon_geojson.get("coordinates", [[]])
    ring = coords[0] if coords else []
    n = len(ring) if ring else 1
    
    cx = sum(p[0] for p in ring) / n if ring else 15.0
    cy = sum(p[1] for p in ring) / n if ring else 49.0
    
    try:
        month = datetime.strptime(date_start, "%Y-%m-%d").month
    except:
        month = 6
    
    seed = int(abs(cy * 1000 + cx * 100 + month * 10 + 42))
    np.random.seed(seed)
    
    # NDWI is typically negative for land
    mean_ndwi = np.random.uniform(-0.3, 0.1)
    std_ndwi = np.random.uniform(0.05, 0.15)
    water_pct = max(0, (mean_ndwi + 0.3) / 0.6 * 30)
    
    if mean_ndwi > 0.3:
        classification = "WATER"
    elif mean_ndwi > 0.1:
        classification = "WET"
    elif mean_ndwi > -0.1:
        classification = "MODERATE"
    else:
        classification = "DRY"
    
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
        "index_type": "NDWI",
        "satellite": "Sentinel-2",
        "mean_value": round(mean_ndwi, 4),
        "std_value": round(std_ndwi, 4),
        "min_value": round(mean_ndwi - 2 * std_ndwi, 4),
        "max_value": round(mean_ndwi + 2 * std_ndwi, 4),
        "median_value": round(mean_ndwi + np.random.normal(0, 0.02), 4),
        "water_percentage": round(water_pct, 1),
        "classification": classification,
        "classification_description": f"Simulated: {classification.lower()} conditions",
        "scene_count": np.random.randint(5, 20),
        "area_km2": round(area, 2),
        "date_range": {"start": date_start, "end": date_end},
        "quality_flag": "SIMULATED",
        "cloud_filter_pct": 20,
        "scale_meters": 10,
    }
