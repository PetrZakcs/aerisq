"""
Agent 4: The Cartographer
Prepares GeoJSON responses for frontend map visualization
"""
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime

from app.agents.physicist import DroughtAnalysisResult

logger = logging.getLogger(__name__)


class CartographerAgent:
    """
    The Cartographer Agent - Map Data Preparation
    
    Responsibilities:
    - Convert analysis results to GeoJSON
    - Generate color-coded drought layers
    - Prepare data for frontend map rendering
    """
    
    def __init__(self):
        # Drought severity color palette (used by frontend)
        self.severity_colors = {
            "NORMAL": "#22c55e",      # Green
            "MILD": "#eab308",        # Yellow
            "MODERATE": "#f97316",    # Orange
            "SEVERE": "#ef4444",      # Red
            "EXTREME": "#7c2d12"      # Dark Red
        }
        
        self.severity_opacity = {
            "NORMAL": 0.3,
            "MILD": 0.4,
            "MODERATE": 0.5,
            "SEVERE": 0.6,
            "EXTREME": 0.7
        }
    
    def create_result_geojson(
        self,
        original_polygon: Dict[str, Any],
        result: DroughtAnalysisResult,
        job_id: str,
        date_range: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Create a GeoJSON FeatureCollection with analysis results
        
        Args:
            original_polygon: Original input GeoJSON polygon
            result: DroughtAnalysisResult from Physicist
            job_id: Analysis job ID
            date_range: Date range of analysis
            
        Returns:
            GeoJSON FeatureCollection with styled features
        """
        severity = result.drought_severity
        color = self.severity_colors.get(severity, "#888888")
        opacity = self.severity_opacity.get(severity, 0.5)
        
        # Build properties for the feature
        properties = {
            "job_id": job_id,
            "analysis_type": "drought_detection",
            "timestamp": datetime.utcnow().isoformat(),
            
            # Statistics
            "mean_sigma0_db": result.mean_sigma0_db,
            "min_sigma0_db": result.min_sigma0_db,
            "max_sigma0_db": result.max_sigma0_db,
            "drought_percentage": result.drought_percentage,
            "drought_severity": severity,
            "area_km2": result.area_km2,
            
            # Styling properties (for mapbox/leaflet)
            "fill": color,
            "fill-opacity": opacity,
            "stroke": color,
            "stroke-width": 2,
            "stroke-opacity": 0.8,
        }
        
        if date_range:
            properties["date_start"] = date_range.get("start")
            properties["date_end"] = date_range.get("end")
        
        # Create the feature
        feature = {
            "type": "Feature",
            "id": job_id,
            "geometry": original_polygon,
            "properties": properties
        }
        
        # Wrap in FeatureCollection
        geojson = {
            "type": "FeatureCollection",
            "features": [feature],
            "metadata": {
                "generated_by": "AerisQ Physics Engine",
                "version": "3.0.0",
                "analysis_date": datetime.utcnow().isoformat(),
                "data_source": "Sentinel-1 SAR"
            }
        }
        
        logger.info(f"Cartographer created GeoJSON for job {job_id}")
        return geojson
    
    def create_legend(self) -> List[Dict[str, Any]]:
        """
        Create legend data for frontend
        
        Returns:
            List of legend items with colors and labels
        """
        return [
            {"severity": "NORMAL", "color": self.severity_colors["NORMAL"], 
             "label": "Normal", "range": "< 10% affected"},
            {"severity": "MILD", "color": self.severity_colors["MILD"], 
             "label": "Mild Drought", "range": "10-30% affected"},
            {"severity": "MODERATE", "color": self.severity_colors["MODERATE"], 
             "label": "Moderate Drought", "range": "30-50% affected"},
            {"severity": "SEVERE", "color": self.severity_colors["SEVERE"], 
             "label": "Severe Drought", "range": "50-70% affected"},
            {"severity": "EXTREME", "color": self.severity_colors["EXTREME"], 
             "label": "Extreme Drought", "range": "> 70% affected"},
        ]
    
    def format_stats_for_frontend(
        self,
        result: DroughtAnalysisResult
    ) -> Dict[str, Any]:
        """
        Format statistics for frontend dashboard display
        
        Args:
            result: DroughtAnalysisResult from Physicist
            
        Returns:
            Formatted statistics dictionary
        """
        return {
            "backscatter": {
                "mean": f"{result.mean_sigma0_db:.1f} dB",
                "range": f"{result.min_sigma0_db:.1f} to {result.max_sigma0_db:.1f} dB",
                "unit": "dB"
            },
            "drought": {
                "percentage": f"{result.drought_percentage:.1f}%",
                "severity": result.drought_severity,
                "color": self.severity_colors.get(result.drought_severity, "#888")
            },
            "coverage": {
                "area": f"{result.area_km2:.1f}",
                "unit": "km²"
            }
        }


# Singleton instance
cartographer = CartographerAgent()
