"""
AerisQ - FREE Sentinel-1 Data Downloader
Downloads and preprocesses real SAR data using CDSE (100% free)

Usage:
    python download_real_sar.py --area "38,-4,39,-3" --date "2023-07-15"
"""
import os
import sys
from pathlib import Path
from datetime import datetime, timedelta
import asyncio
import argparse

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.agents.scout import ScoutAgent
from dotenv import load_dotenv

load_dotenv()


async def download_sentinel_data(
    bbox: tuple,
    date: str,
    output_dir: Path,
    max_products: int = 1
):
    """
    Download Sentinel-1 data for specified area and date
    
    Args:
        bbox: (min_lat, min_lon, max_lat, max_lon)
        date: Target date YYYY-MM-DD
        output_dir: Where to save downloaded files
        max_products: Number of products to download
    """
    print(f"🛰️  AerisQ - Real SAR Data Downloader")
    print(f"=" * 60)
    
    # Check CDSE credentials
    if not os.getenv("CDSE_USERNAME") or not os.getenv("CDSE_PASSWORD"):
        print("❌ ERROR: CDSE credentials not configured!")
        print("\n📋 Steps to fix:")
        print("1. Register at: https://dataspace.copernicus.eu/")
        print("2. Add to backend/.env:")
        print("   CDSE_USERNAME=your_username")
        print("   CDSE_PASSWORD=your_password")
        return False
    
    # Create polygon from bbox
    min_lat, min_lon, max_lat, max_lon = bbox
    polygon = {
        "type": "Polygon",
        "coordinates": [[
            [min_lon, min_lat],
            [max_lon, min_lat],
            [max_lon, max_lat],
            [min_lon, max_lat],
            [min_lon, min_lat]
        ]]
    }
    
    # Date range (±3 days for better coverage)
    target_date = datetime.strptime(date, "%Y-%m-%d")
    date_start = (target_date - timedelta(days=3)).strftime("%Y-%m-%d")
    date_end = (target_date + timedelta(days=3)).strftime("%Y-%m-%d")
    
    print(f"\n🔍 Searching for Sentinel-1 data...")
    print(f"   Area: {bbox}")
    print(f"   Date: {date_start} to {date_end}")
    
    # Initialize Scout agent
    scout = ScoutAgent()
    
    # Search for products
    results = await scout.search_products(
        polygon=polygon,
        date_start=date_start,
        date_end=date_end,
        max_results=max_products
    )
    
    if results.error and "Demo mode" not in results.error:
        print(f"\n❌ Search failed: {results.error}")
        return False
    
    if not results.products:
        print(f"\n⚠️  No products found for this area/date")
        print(f"   Try different dates or larger area")
        return False
    
    print(f"\n✅ Found {len(results.products)} products:")
    for i, product in enumerate(results.products, 1):
        size_mb = product.size_bytes / 1e6
        print(f"   {i}. {product.name}")
        print(f"      Date: {product.sensing_start}")
        print(f"      Size: {size_mb:.0f} MB")
        print(f"      Polarization: {product.polarization}")
    
    # Download products
    output_dir.mkdir(parents=True, exist_ok=True)
    
    for i, product in enumerate(results.products[:max_products], 1):
        print(f"\n📥 Downloading {i}/{max_products}: {product.name}")
        
        downloaded_path = await scout.download_product(
            product=product,
            output_dir=output_dir
        )
        
        if downloaded_path:
            print(f"   ✅ Saved to: {downloaded_path}")
        else:
            print(f"   ❌ Download failed")
    
    print(f"\n🎉 Download complete!")
    print(f"📁 Files saved to: {output_dir}")
    
    return True


def main():
    parser = argparse.ArgumentParser(
        description="Download Sentinel-1 SAR data (FREE)"
    )
    parser.add_argument(
        "--area",
        type=str,
        required=True,
        help="Bounding box: min_lat,min_lon,max_lat,max_lon (e.g., '38,-4,39,-3')"
    )
    parser.add_argument(
        "--date",
        type=str,
        required=True,
        help="Target date YYYY-MM-DD (e.g., '2023-07-15')"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="../data/sentinel1/raw",
        help="Output directory (default: ../data/sentinel1/raw)"
    )
    parser.add_argument(
        "--max",
        type=int,
        default=1,
        help="Maximum products to download (default: 1)"
    )
    
    args = parser.parse_args()
    
    # Parse bbox
    try:
        bbox = tuple(map(float, args.area.split(",")))
        if len(bbox) != 4:
            raise ValueError
    except:
        print("❌ Invalid --area format. Use: min_lat,min_lon,max_lat,max_lon")
        return
    
    # Parse date
    try:
        datetime.strptime(args.date, "%Y-%m-%d")
    except:
        print("❌ Invalid --date format. Use: YYYY-MM-DD")
        return
    
    output_dir = Path(args.output)
    
    # Run download
    asyncio.run(download_sentinel_data(
        bbox=bbox,
        date=args.date,
        output_dir=output_dir,
        max_products=args.max
    ))


if __name__ == "__main__":
    main()
