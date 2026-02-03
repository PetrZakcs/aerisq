# GEE Integration Module for Standalone API
# Import this at top of standalone.py

import os
import sys

# Try to import and initialize GEE
GEE_AVAILABLE = False
gee_analyzer = None

try:
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from app.agents.gee_analyzer import GEEAnalyzer
    
    # Initialize with project ID from env
    gee_project_id = os.environ.get("GEE_PROJECT_ID", "aerisq")
    gee_analyzer = GEEAnalyzer(project_id=gee_project_id)
    GEE_AVAILABLE = gee_analyzer.ready
    
    if GEE_AVAILABLE:
        print(f"✅ GEE analyzer ready (project: {gee_project_id})")
    else:
        print("⚠️  GEE analyzer not ready - using physics simulation")
        
except Exception as e:
    print(f"⚠️  GEE import failed: {e}")
    print("   → Will use physics-based simulation instead")
    GEE_AVAILABLE = False


def try_gee_analysis(polygon: dict, date_start: str, date_end: str, job_id: str):
    """
    Attempt GEE analysis, fallback to physics if fails.
    
    Returns: (results_dict, used_gee: bool)
    """
    if not GEE_AVAILABLE or not gee_analyzer:
        return None, False
    
    try:
        print(f"🛰️  Attempting GEE analysis for job {job_id[:8]}...")
        
        # Call GEE analyzer
        results = gee_analyzer.analyze_area(
            polygon_geojson=polygon,
            date_start=date_start,
            date_end=date_end
        )
        
        if results and results.get("quality_flag") == "GEE_REALTIME":
            print(f"   ✅ GEE analysis successful!")
            print(f"      Scenes: {results.get('scene_count', 'N/A')}")
            print(f"      Mean σ₀: {results.get('mean_sigma0_db', 'N/A')} dB")
            return results, True
        else:
            print(f"   ⚠️  GEE returned no data")
            return None, False
            
    except Exception as e:
        print(f"   ❌ GEE analysis failed: {e}")
        return None, False
