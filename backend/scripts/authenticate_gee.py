"""
Google Earth Engine Authentication Helper
Runs the authentication flow
"""
import ee

print("=" * 60)
print("   Google Earth Engine - Authentication")
print("=" * 60)
print()
print("This will open a browser for authentication.")
print("Follow the instructions and paste the code here.")
print()

try:
    # Run authentication
    ee.Authenticate()
    print("\n✅ Authentication successful!")
    print("\nTesting EE initialization...")
    ee.Initialize()
    print("✅ Earth Engine initialized!")
    print("\n🎉 You're ready to use Google Earth Engine!")
    
except Exception as e:
    print(f"\n❌ Authentication failed: {e}")
    print("\nTroubleshooting:")
    print("1. Make sure you have Google Earth Engine access")
    print("2. Check your internet connection")
    print("3. Try again with: python scripts/authenticate_gee.py")
