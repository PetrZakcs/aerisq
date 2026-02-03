"""
AerisQ - Connection Test
Verify that all free services are configured correctly
"""
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv

load_dotenv()


def test_cdse_credentials():
    """Test CDSE credentials"""
    print("\n🛰️  Testing CDSE Connection...")
    
    username = os.getenv("CDSE_USERNAME", "").strip()
    password = os.getenv("CDSE_PASSWORD", "").strip()
    
    if not username or not password or "#" in username:
        print("   ❌ CDSE credentials not configured")
        print("   📋 Action required:")
        print("      1. Register at: https://dataspace.copernicus.eu/")
        print("      2. Add to backend/.env:")
        print("         CDSE_USERNAME=your_username")
        print("         CDSE_PASSWORD=your_password")
        return False
    
    print(f"   ✅ CDSE credentials found")
    print(f"      Username: {username}")
    
    # Try to authenticate
    try:
        from app.agents.scout import ScoutAgent
        import asyncio
        
        scout = ScoutAgent()
        
        if not scout.auth:
            print("   ⚠️  Scout auth not initialized (demo mode)")
            return False
        
        # Try to get token
        async def test_auth():
            try:
                token = await scout.auth.get_token()
                return bool(token)
            except Exception as e:
                print(f"   ❌ Authentication failed: {e}")
                return False
        
        success = asyncio.run(test_auth())
        
        if success:
            print("   ✅ CDSE authentication successful!")
            print("   🎉 You can now download real satellite data!")
            return True
        else:
            print("   ❌ Authentication failed - check credentials")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_physicist_agent():
    """Test Physicist agent"""
    print("\n🔬 Testing Physicist Agent...")
    
    try:
        from app.agents.physicist import PhysicistAgent
        import numpy as np
        
        physicist = PhysicistAgent()
        
        # Test basic functions
        test_array = np.random.rand(100, 100) * 1000  # Simulated DN values
        
        # Test calibration
        sigma0_linear = physicist.calibrate_dn_to_sigma0_linear(test_array)
        sigma0_db = physicist.sigma0_linear_to_db(sigma0_linear)
        
        # Test speckle filter
        filtered = physicist.apply_lee_filter(sigma0_db, window_size=5)
        
        print("   ✅ Physicist agent operational")
        print(f"      Lee filter: OK")
        print(f"      Sigma0 conversion: OK")
        print(f"      Sample mean σ₀: {np.mean(sigma0_db):.2f} dB")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_dependencies():
    """Test required Python packages"""
    print("\n📦 Testing Dependencies...")
    
    required = [
        ("numpy", "NumPy"),
        ("rasterio", "Rasterio (GDAL)"),
        ("scipy", "SciPy"),
        ("httpx", "HTTPX"),
        ("fastapi", "FastAPI"),
    ]
    
    all_ok = True
    
    for module, name in required:
        try:
            __import__(module)
            print(f"   ✅ {name}")
        except ImportError:
            print(f"   ❌ {name} - run: pip install {module}")
            all_ok = False
    
    return all_ok


def test_data_directories():
    """Test data directory structure"""
    print("\n📁 Checking Data Directories...")
    
    base = Path(__file__).parent.parent.parent / "data"
    
    dirs = [
        base / "sentinel1" / "raw",
        base / "sentinel1" / "processed",
    ]
    
    for dir_path in dirs:
        if dir_path.exists():
            files = list(dir_path.glob("*"))
            print(f"   ✅ {dir_path.relative_to(base.parent)} ({len(files)} files)")
        else:
            dir_path.mkdir(parents=True, exist_ok=True)
            print(f"   📁 Created: {dir_path.relative_to(base.parent)}")
    
    return True


def main():
    print("=" * 60)
    print("   AerisQ - System Check (FREE Setup)")
    print("=" * 60)
    
    results = {
        "Dependencies": test_dependencies(),
        "Data Directories": test_data_directories(),
        "Physicist Agent": test_physicist_agent(),
        "CDSE Connection": test_cdse_credentials(),
    }
    
    print("\n" + "=" * 60)
    print("   SUMMARY")
    print("=" * 60)
    
    for test, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"   {status}  {test}")
    
    if all(results.values()):
        print("\n🎉 All systems operational!")
        print("\n📋 Next Steps:")
        print("   1. Download SAR data:")
        print("      python scripts/download_real_sar.py --area '38,-4,39,-3' --date '2023-07-15'")
        print("\n   2. Process data:")
        print("      python scripts/process_sar.py ../data/sentinel1/raw/*.zip")
    else:
        print("\n⚠️  Some tests failed. Check messages above.")
    
    print("\n")


if __name__ == "__main__":
    main()
