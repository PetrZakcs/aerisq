"""
Prompt Parser - Routes natural language queries to appropriate analyzers.

Examples:
- "Analyze NDVI for crop health" → NDVI
- "Check soil moisture" → SAR Moisture  
- "Detect water bodies with NDWI" → NDWI
- "Show drought severity" → SAR Drought
"""
import re
from typing import Dict, Tuple, Optional


# Analysis type definitions
ANALYSIS_TYPES = {
    "ndvi": {
        "name": "NDVI (Normalized Difference Vegetation Index)",
        "satellite": "Sentinel-2",
        "description": "Measures vegetation health using near-infrared and red bands",
        "formula": "(NIR - Red) / (NIR + Red)",
        "range": "-1 to 1 (healthy vegetation > 0.3)",
    },
    "ndwi": {
        "name": "NDWI (Normalized Difference Water Index)",
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

# Keyword mappings
KEYWORD_MAP = {
    "ndvi": ["ndvi", "vegetation", "crop health", "greenness", "plant health", "biomass", "chlorophyll", "vegetace", "rostliny"],
    "ndwi": ["ndwi", "water index", "water body", "water bodies", "moisture content", "wetland", "voda", "vodní"],
    "sar_moisture": ["soil moisture", "moisture", "vlhkost", "půdní vlhkost", "soil water"],
    "sar_drought": ["drought", "sucho", "dry", "backscatter", "sar", "radar", "sigma", "σ₀", "sentinel-1"],
}


def parse_prompt(prompt: str) -> Tuple[str, Dict]:
    """
    Parse a natural language prompt to determine analysis type.
    
    Returns:
        Tuple of (analysis_type, metadata)
    """
    prompt_lower = prompt.lower().strip()
    
    # Score each analysis type
    scores = {}
    for analysis_type, keywords in KEYWORD_MAP.items():
        score = 0
        for keyword in keywords:
            if keyword in prompt_lower:
                # Exact match gets higher score
                if keyword == prompt_lower or f" {keyword} " in f" {prompt_lower} ":
                    score += 10
                else:
                    score += 5
        scores[analysis_type] = score
    
    # Find best match
    best_type = max(scores, key=scores.get)
    best_score = scores[best_type]
    
    # If no keywords matched, default to sar_drought
    if best_score == 0:
        best_type = "sar_drought"
    
    # Try to extract coordinates from prompt
    coords = extract_coordinates(prompt)
    
    metadata = {
        "analysis_type": best_type,
        "analysis_info": ANALYSIS_TYPES[best_type],
        "confidence": min(1.0, best_score / 10.0) if best_score > 0 else 0.3,
        "extracted_coordinates": coords,
        "original_prompt": prompt,
    }
    
    return best_type, metadata


def extract_coordinates(prompt: str) -> Optional[Dict]:
    """
    Try to extract coordinates from prompt text.
    
    Supports formats:
    - "49.8175, 15.473" (lat, lon)
    - "lat 49.8175 lon 15.473"  
    - "49°49'N 15°28'E"
    """
    # Format: decimal lat, lon
    decimal_pattern = r'(-?\d+\.?\d*)\s*[,;]\s*(-?\d+\.?\d*)'
    match = re.search(decimal_pattern, prompt)
    if match:
        lat = float(match.group(1))
        lon = float(match.group(2))
        # Basic validation
        if -90 <= lat <= 90 and -180 <= lon <= 180:
            return {"lat": lat, "lon": lon, "format": "decimal"}
    
    # Format: lat X lon Y
    latlon_pattern = r'lat[itude]*\s*(-?\d+\.?\d*)\s*,?\s*lon[gitude]*\s*(-?\d+\.?\d*)'
    match = re.search(latlon_pattern, prompt, re.IGNORECASE)
    if match:
        lat = float(match.group(1))
        lon = float(match.group(2))
        if -90 <= lat <= 90 and -180 <= lon <= 180:
            return {"lat": lat, "lon": lon, "format": "latlon_text"}
    
    return None


def get_available_analyses() -> Dict:
    """Return all available analysis types with descriptions."""
    return ANALYSIS_TYPES


def generate_example_prompts() -> list:
    """Return example prompts for the UI."""
    return [
        {"prompt": "Analyze NDVI vegetation health", "type": "ndvi", "icon": "🌿"},
        {"prompt": "Check soil moisture levels", "type": "sar_moisture", "icon": "💧"},
        {"prompt": "Detect water bodies with NDWI", "type": "ndwi", "icon": "🌊"},
        {"prompt": "Show drought severity with SAR", "type": "sar_drought", "icon": "🔥"},
        {"prompt": "Crop health analysis for agriculture", "type": "ndvi", "icon": "🌾"},
    ]
