"""
Quick GEE Test - Without project requirement
Uses legacy authentication method
"""
import ee

print("=" * 60)
print("   Google Earth Engine - Quick Test")
print("=" * 60)
print()

try:
    # Try legacy authentication (no project needed)
    print("Initializing Earth Engine (legacy mode)...")
    ee.Initialize()
    print("✅ Connected!")
    
except Exception as e:
    print(f"Trying alternative initialization...")
    try:
        # Use high-volume endpoint (might not need project)
        ee.Initialize(opt_url='https://earthengine-highvolume.googleapis.com')
        print("✅ Connected via high-volume endpoint!")
    except Exception as e2:
        print(f"❌ Failed: {e2}")
        print("\nYou need to create a Google Cloud project:")
        print("1. Go to: https://console.cloud.google.com/")
        print("2. Create new project (any name)")
        print("3. Note the project ID")
        print("4. Run: ee.Initialize(project='your-project-id')")
        exit(1)

# If we got here, we're connected!
print("\n🧪 Testing data access...")

try:
    # Simple test - get version
    info = ee.String('Hello from Earth Engine!').getInfo()
    print(f"✅ Basic test passed: {info}")
    
    print("\n🛰️  Testing Sentinel-1...")
    
    # Very simple query
    img = ee.Image('COPERNICUS/S1_GRD/S1A_IW_GRDH_1SDV_20230713T062738_20230713T062803_049401_05F0B8_7EB1')
    
    # Get a single pixel value
    point = ee.Geometry.Point([-5.5, 38.0])
    value = img.select('VV').reduceRegion(
        reducer=ee.Reducer.first(),
        geometry=point,
        scale=10
    ).get('VV').getInfo()
    
    import math
    vv_db = 10 * math.log10(value) if value else None
    
    print(f"✅ Sentinel-1 accessible!")
    print(f"   Sample VV value: {vv_db:.2f} dB")
    
    print("\n" + "=" * 60)
    print("🎉 SUCCESS! Earth Engine works!")
    print("=" * 60)
    print("\nYou can now use GEE for real-time SAR analysis!")
    
except Exception as e:
    print(f"⚠️  Data access test failed: {e}")
    print("\nAuthentication works, but you may need:")
    print("1. A Google Cloud project")
    print("2. Earth Engine enabled in that project")
    print("\nCreate project at: https://console.cloud.google.com/")

