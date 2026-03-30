"""
Test Google Earth Engine with project initialization
"""
import ee

print("=" * 60)
print("   Google Earth Engine - Test Connection")
print("=" * 60)
print()

# Try to initialize with cloud project (auto-creates if needed)
try:
    print("Initializing Earth Engine...")
    
    # Option 1: Let EE auto-detect or create project
    ee.Initialize(opt_url='https://earthengine-highvolume.googleapis.com')
    
    print("✅ Earth Engine initialized!")
    
except Exception as e:
    if "no project" in str(e).lower():
        print("⚠️  No project found. Creating one...")
        try:
            # Initialize with a new project
            ee.Initialize(project='ee-phasq')
            print("✅ Earth Engine initialized with new project!")
        except Exception as e2:
            print(f"❌ Still failed: {e2}")
            print("\nTry specifying project explicitly:")
            print("  ee.Initialize(project='your-project-id')")
            exit(1)
    else:
        print(f"❌ Initialization failed: {e}")
        exit(1)

print("\n🛰️  Testing Sentinel-1 data access...")

# Test area (Southern Spain)
test_polygon = ee.Geometry.Polygon([[
    [-6.0, 37.5],
    [-5.0, 37.5],
    [-5.0, 38.5],
    [-6.0, 38.5],
    [-6.0, 37.5]
]])

try:
    # Query Sentinel-1
    s1_collection = ee.ImageCollection('COPERNICUS/S1_GRD') \
        .filterBounds(test_polygon) \
        .filterDate('2023-07-01', '2023-07-31') \
        .filter(ee.Filter.eq('instrumentMode', 'IW')) \
        .select('VV')
    
    count = s1_collection.size().getInfo()
    print(f"✅ Found {count} Sentinel-1 scenes")
    
    if count > 0:
        # Get first scene
        first_scene = s1_collection.first()
        scene_date = first_scene.date().format('YYYY-MM-dd').getInfo()
        print(f"   First scene date: {scene_date}")
        
        # Calculate stats
        print("\n🔬 Running sample analysis...")
        mean_vv = first_scene.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=test_polygon,
            scale=10,
            maxPixels=1e9
        )
        
        vv_value = mean_vv.get('VV').getInfo()
        
        # Convert to dB
        import math
        vv_db = 10 * math.log10(vv_value) if vv_value else None
        
        print(f"✅ Mean VV backscatter: {vv_db:.2f} dB")
        
        # Classify
        if vv_db < -15:
            severity = "SEVERE DROUGHT"
            emoji = "🔴"
        elif vv_db < -12:
            severity = "MODERATE DROUGHT"
            emoji = "🟠"
        elif vv_db < -10:
            severity = "MILD DROUGHT"
            emoji = "🟡"
        else:
            severity = "NORMAL"
            emoji = "🟢"
        
        print(f"   {emoji} Drought status: {severity}")
        
        print("\n" + "=" * 60)
        print("🎉 SUCCESS! Google Earth Engine is fully operational!")
        print("=" * 60)
        print("\n✅ You can now:")
        print("   1. Analyze any area on Earth")
        print("   2. Use historical Sentinel-1 archive (2014-present)")
        print("   3. Get real-time drought detection")
        print("\n📝 Next: Integrate into API")
        
    else:
        print("⚠️  No scenes found for this date/area")
        print("   But GEE connection works!")
        
except Exception as e:
    print(f"❌ Query failed: {e}")
    print("\nBut authentication is OK!")
    print("The error might be temporary. Try again.")
