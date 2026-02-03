"""
Google Earth Engine SAR Analysis Module
Real-time drought detection using Sentinel-1 data (cloud-based)

No downloads needed - everything runs in Google's cloud!
"""
import os
import ee
import math
from typing import Dict, Optional, Tuple
from datetime import datetime


# Drought thresholds (same as Physicist agent)
DROUGHT_THRESHOLDS_VV = {
    "extreme_dry": -18.0,
    "very_dry": -15.0,
    "dry": -12.0,
    "moderate": -10.0,
    "wet": -8.0,
    "very_wet": -5.0
}


class GEEAnalyzer:
    """
    Real-time SAR analysis using Google Earth Engine
    
    Advantages:
    - No data downloads (petabytes of data in cloud)
    - Automated preprocessing (calibration, filtering)
    - Global coverage
    - Historical archive back to 2014
    """
    
    def __init__(self, project_id: Optional[str] = None):
        """
        Initialize Google Earth Engine
        
        Args:
            project_id: Google Cloud Project ID (optional)
                       Will try to load from:
                       1. Parameter
                       2. GEE_PROJECT_ID env variable
                       3. .gee_project config file
        """
        self.project_id = None
        self.ready = False
        
        # Determine project ID
        if project_id:
            self.project_id = project_id
        elif os.getenv('GEE_PROJECT_ID'):
            self.project_id = os.getenv('GEE_PROJECT_ID')
        else:
            # Try to load from config file
            from pathlib import Path
            config_file = Path(__file__).parent.parent.parent / 'backend' / '.gee_project'
            if config_file.exists():
                with open(config_file) as f:
                    self.project_id = f.read().strip()
        
        try:
            if self.project_id:
                ee.Initialize(project=self.project_id)
                print(f"✅ GEE initialized with project: {self.project_id}")
            else:
                # Try without project (legacy)
                ee.Initialize()
                print("✅ GEE initialized (legacy mode)")
            
            self.ready = True
            
        except Exception as e:
            print(f"⚠️ GEE initialization failed: {e}")
            if "no project" in str(e).lower():
                print("   → Need Google Cloud Project ID")
                print("   → Set GEE_PROJECT_ID env variable")
                print("   → Or create backend/.gee_project file")
            self.ready = False
    
    def analyze_area(
        self,
        polygon_geojson: Dict,
        date_start: str,
        date_end: str,
        polarization: str = "VV"
    ) -> Dict:
        """
        Analyze area for drought using Sentinel-1 SAR
        
        Args:
            polygon_geojson: GeoJSON polygon geometry
            date_start: Start date (YYYY-MM-DD)
            date_end: End date (YYYY-MM-DD)
            polarization: VV or VH
            
        Returns:
            Dict with drought metrics
        """
        if not self.ready:
            raise Exception("GEE not initialized. Run: earthengine authenticate")
        
        # Convert GeoJSON to Earth Engine geometry
        coords = polygon_geojson['coordinates'][0]
        ee_polygon = ee.Geometry.Polygon(coords)
        
        # Calculate area (km²)
        area_m2 = ee_polygon.area().getInfo()
        area_km2 = area_m2 / 1_000_000
        
        # Query Sentinel-1 collection
        s1_collection = ee.ImageCollection('COPERNICUS/S1_GRD') \
            .filterBounds(ee_polygon) \
            .filterDate(date_start, date_end) \
            .filter(ee.Filter.eq('instrumentMode', 'IW')) \
            .filter(ee.Filter.listContains('transmitterReceiverPolarisation', polarization)) \
            .select(polarization)
        
        # Check if data exists
        count = s1_collection.size().getInfo()
        
        if count == 0:
            return {
                "error": "No Sentinel-1 data found for this area/date",
                "count": 0,
                "quality_flag": "NO_DATA"
            }
        
        # Use median composite (robust to outliers)
        s1_image = s1_collection.median()
        
        # Calculate statistics
        stats = s1_image.reduceRegion(
            reducer=ee.Reducer.mean() \
                .combine(ee.Reducer.stdDev(), '', True) \
                .combine(ee.Reducer.min(), '', True) \
                .combine(ee.Reducer.max(), '', True) \
                .combine(ee.Reducer.percentile([50]), '', True),
            geometry=ee_polygon,
            scale=10,  # 10m resolution
            maxPixels=1e9,
            bestEffort=True
        ).getInfo()
        
        # Convert from linear to dB
        mean_linear = stats.get(f'{polarization}_mean')
        std_linear = stats.get(f'{polarization}_stdDev')
        min_linear = stats.get(f'{polarization}_min')
        max_linear = stats.get(f'{polarization}_max')
        median_linear = stats.get(f'{polarization}_p50')
        
        # Handle None values
        if not mean_linear:
            return {
                "error": "Failed to compute statistics",
                "quality_flag": "COMPUTATION_ERROR"
            }
        
        mean_db = 10 * math.log10(mean_linear) if mean_linear > 0 else -99
        min_db = 10 * math.log10(min_linear) if min_linear and min_linear > 0 else -99
        max_db = 10 * math.log10(max_linear) if max_linear and max_linear > 0 else -99
        median_db = 10 * math.log10(median_linear) if median_linear and median_linear > 0 else -99
        
        # Calculate std in dB (approximation)
        std_db = (10 * math.log10(mean_linear + std_linear) - mean_db) if std_linear else 0
        
        # Drought classification
        severity, drought_pct = self._classify_drought(mean_db, DROUGHT_THRESHOLDS_VV)
        
        # Soil moisture index (0-100)
        smi = self._calculate_smi(mean_db, DROUGHT_THRESHOLDS_VV)
        
        # Confidence score
        confidence = self._calculate_confidence(count, std_db)
        
        return {
            "mean_sigma0_db": round(mean_db, 2),
            "min_sigma0_db": round(min_db, 2),
            "max_sigma0_db": round(max_db, 2),
            "median_sigma0_db": round(median_db, 2),
            "std_sigma0_db": round(std_db, 2),
            "drought_severity": severity,
            "drought_percentage": round(drought_pct, 1),
            "soil_moisture_index": round(smi, 1),
            "area_km2": round(area_km2, 2),
            "polarization": polarization,
            "scene_count": count,
            "confidence": round(confidence, 2),
            "quality_flag": "GEE_REALTIME",
            "date_range": f"{date_start} to {date_end}",
            "processing_method": "Google Earth Engine (cloud)",
        }
    
    def _classify_drought(self, sigma0_db: float, thresholds: Dict) -> Tuple[str, float]:
        """Classify drought severity"""
        if sigma0_db < thresholds["extreme_dry"]:
            return "EXTREME", 80.0
        elif sigma0_db < thresholds["very_dry"]:
            return "SEVERE", 60.0
        elif sigma0_db < thresholds["dry"]:
            return "MODERATE", 40.0
        elif sigma0_db < thresholds["moderate"]:
            return "MILD", 20.0
        else:
            return "NORMAL", 5.0
    
    def _calculate_smi(self, sigma0_db: float, thresholds: Dict) -> float:
        """Calculate Soil Moisture Index (0-100)"""
        dry_threshold = thresholds["dry"]
        wet_threshold = thresholds["wet"]
        
        if sigma0_db <= dry_threshold:
            return 0.0
        elif sigma0_db >= wet_threshold:
            return 100.0
        else:
            # Linear interpolation
            range_db = wet_threshold - dry_threshold
            position = sigma0_db - dry_threshold
            return (position / range_db) * 100
    
    def _calculate_confidence(self, scene_count: int, std_db: float) -> float:
        """Calculate confidence score (0-1)"""
        # More scenes = higher confidence
        scene_factor = min(scene_count / 10, 1.0)
        
        # Lower std = higher confidence
        std_factor = max(0, 1 - (std_db / 5.0))
        
        return (scene_factor + std_factor) / 2


# Singleton instance
gee_analyzer = GEEAnalyzer()


def analyze_with_gee(
    polygon: Dict,
    date_start: str,
    date_end: str,
    **kwargs
) -> Dict:
    """
    Convenience function for GEE analysis
    
    Usage:
        result = analyze_with_gee(
            polygon={"type": "Polygon", "coordinates": [...]},
            date_start="2023-07-01",
            date_end="2023-07-31"
        )
    """
    return gee_analyzer.analyze_area(
        polygon_geojson=polygon,
        date_start=date_start,
        date_end=date_end,
        **kwargs
    )
