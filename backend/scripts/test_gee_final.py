"""
Google Earth Engine - Final Test with Project
Run this after creating Google Cloud project
"""
import ee
import os
from pathlib import Path

print("=" * 60)
print("   Google Earth Engine - Complete Setup Test")
print("=" * 60)
print()

# Try to load project from config file
config_file = Path(__file__).parent.parent / '.gee_project'

if config_file.exists():
    with open(config_file) as f:
        project_id = f.read().strip()
    print(f"📁 Using project from config: {project_id}")
else:
    # Ask user for project ID
    print("⚠️  No project configured yet.")
    print()
    project_id = input("Enter your Google Cloud Project ID: ").strip()
    
    if not project_id:
        print("❌ Project ID is required!")
        print("\n1. Go to: https://console.cloud.google.com/projectcreate")
        print("2. Create project: aerisq-earth-engine")
        print("3. Copy the Project ID")
        print("4. Run this script again")
        exit(1)
    
    # Save for future use
    with open(config_file, 'w') as f:
        f.write(project_id)
    print(f"✅ Saved project ID to: {config_file}")

print()
print(f"🔧 Initializing Earth Engine with project: {project_id}")

try:
    ee.Initialize(project=project_id)
    print("✅ Earth Engine initialized successfully!")
    
except Exception as e:
    print(f"❌ Initialization failed: {e}")
    print("\nPossible issues:")
    print("1. Wrong Project ID - check spelling")
    print("2. Project not created yet - wait 1-2 minutes")
    print("3. Earth Engine API not enabled")
    print("\nTo enable Earth Engine API:")
    print(f"  https://console.cloud.google.com/apis/library/earthengine.googleapis.com?project={project_id}")
    exit(1)

# SUCCESS! Now test Sentinel-1
print("\n" + "=" * 60)
print("🛰️  Testing Sentinel-1 Access")
print("=" * 60)
print()

try:
    # Test area - Southern Spain (known drought 2023)
    test_polygon = ee.Geometry.Polygon([[
        [-6.0, 37.5],
        [-5.0, 37.5],
        [-5.0, 38.5],
        [-6.0, 38.5],
        [-6.0, 37.5]
    ]])
    
    print("📍 Test area: Southern Spain (Andalusia)")
    print("📅 Date range: July 2023")
    print()
    
    # Query Sentinel-1 collection
    s1_collection = ee.ImageCollection('COPERNICUS/S1_GRD') \
        .filterBounds(test_polygon) \
        .filterDate('2023-07-01', '2023-07-31') \
        .filter(ee.Filter.eq('instrumentMode', 'IW')) \
        .select('VV')
    
    count = s1_collection.size().getInfo()
    print(f"✅ Found {count} Sentinel-1 scenes")
    
    if count == 0:
        print("⚠️  No data for this area/date (but API works!)")
        print("   Try different date range or area")
    else:
        # Get first scene details
        first_scene = s1_collection.first()
        scene_date = first_scene.date().format('YYYY-MM-dd HH:mm:ss').getInfo()
        print(f"   📅 First scene: {scene_date}")
        
        # Calculate statistics
        print("\n🔬 Running SAR analysis...")
        stats = first_scene.reduceRegion(
            reducer=ee.Reducer.mean() \
                .combine(ee.Reducer.stdDev(), '', True) \
                .combine(ee.Reducer.min(), '', True) \
                .combine(ee.Reducer.max(), '', True),
            geometry=test_polygon,
            scale=10,
            maxPixels=1e9
        ).getInfo()
        
        vv_mean = stats.get('VV_mean')
        
        if vv_mean:
            # GEE Sentinel-1 GRD data are already in dB!
            # No log10 conversion needed
            import math
            
            # Values are already in dB
            vv_db = vv_mean
            vv_min = stats.get('VV_min')
            vv_max = stats.get('VV_max')
            vv_min_db = vv_min if vv_min else None
            vv_max_db = vv_max if vv_max else None
            
            print(f"\n   📊 SAR Statistics:")
            print(f"      Mean VV: {vv_db:.2f} dB")
            if vv_min_db:
                print(f"      Min VV:  {vv_min_db:.2f} dB")
            if vv_max_db:
                print(f"      Max VV:  {vv_max_db:.2f} dB")
            
            # Drought classification
            if vv_db < -18:
                severity = "EXTREME DROUGHT"
                emoji = "🔴"
                color = "\033[91m"  # Red
            elif vv_db < -15:
                severity = "SEVERE DROUGHT"
                emoji = "🔴"
                color = "\033[91m"
            elif vv_db < -12:
                severity = "MODERATE DROUGHT"
                emoji = "🟠"
                color = "\033[93m"  # Yellow
            elif vv_db < -10:
                severity = "MILD DROUGHT"
                emoji = "🟡"
                color = "\033[93m"
            else:
                severity = "NORMAL"
                emoji = "🟢"
                color = "\033[92m"  # Green
            
            reset_color = "\033[0m"
            
            print(f"\n   {emoji} Drought Status: {color}{severity}{reset_color}")
            
            # Calculate soil moisture estimate
            smi = max(0, min(100, ((vv_db + 18) / 10) * 100))
            print(f"   💧 Soil Moisture Index: {smi:.1f}% (estimated)")
            
            print("\n" + "=" * 60)
            print(f"   🎉 {color}SUCCESS!{reset_color} Google Earth Engine is fully operational!")
            print("=" * 60)
            print("\n✅ You can now:")
            print("   • Analyze any area on Earth")
            print("   • Access historical data (2014-present)")
            print("   • Get real-time drought detection")
            print("   • Process in cloud (no downloads!)")
            print()
            print("📝 Next step: Integrate into AerisQ API")
            print(f"   Project ID saved in: {config_file}")
            print()
            
        else:
            print("⚠️  Could not compute statistics (but query worked!)")
            
except Exception as e:
    print(f"❌ Sentinel-1 query failed: {e}")
    print("\nAuthentication and project are OK!")
    print("Error might be temporary - try again in a minute.")
    import traceback
    traceback.print_exc()
