"""
AerisQ - Simple SAR Preprocessor
Extracts and processes Sentinel-1 GRD data for drought analysis

Simplified approach - no SNAP needed!
Uses only Python + rasterio + numpy
"""
import sys
from pathlib import Path
import zipfile
import numpy as np
import rasterio
from rasterio.mask import mask
import json

sys.path.insert(0, str(Path(__file__).parent.parent))

from app.agents.physicist import PhysicistAgent


def extract_safe_from_zip(zip_path: Path, extract_dir: Path) -> Path:
    """Extract .SAFE directory from downloaded ZIP"""
    print(f"📦 Extracting: {zip_path.name}")
    
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        # Find .SAFE directory
        members = zip_ref.namelist()
        safe_dir = None
        
        for member in members:
            if '.SAFE/' in member:
                safe_dir = member.split('.SAFE/')[0] + '.SAFE'
                break
        
        if not safe_dir:
            raise ValueError("No .SAFE directory found in ZIP")
        
        # Extract only measurement data (VV band)
        measurement_files = [m for m in members if 'measurement' in m and 'vv' in m.lower()]
        
        for file in measurement_files:
            zip_ref.extract(file, extract_dir)
        
        safe_path = extract_dir / safe_dir
        print(f"   ✅ Extracted to: {safe_path}")
        
        return safe_path


def find_vv_geotiff(safe_path: Path) -> Path:
    """Find VV polarization GeoTIFF in SAFE structure"""
    measurement_dir = safe_path / "measurement"
    
    if not measurement_dir.exists():
        raise FileNotFoundError(f"No measurement dir in {safe_path}")
    
    # Find VV TIFF
    vv_files = list(measurement_dir.glob("*vv*.tiff")) + list(measurement_dir.glob("*vv*.tif"))
    
    if not vv_files:
        raise FileNotFoundError("No VV polarization TIFF found")
    
    return vv_files[0]


def process_sar_simple(
    input_tiff: Path,
    output_dir: Path,
    polygon_geojson: dict = None
) -> dict:
    """
    Simple SAR processing:
    1. Read GeoTIFF
    2. Convert to Sigma0 dB (if needed)
    3. Apply Lee filter
    4. Crop to polygon
    5. Calculate drought metrics
    """
    print(f"\n🔬 Processing SAR data...")
    
    physicist = PhysicistAgent()
    
    # Full analysis pipeline
    result = physicist.analyze_from_raster(
        raster_path=str(input_tiff),
        polygon_geojson=polygon_geojson,
        polarization="VV",
        apply_speckle_filter=True,
        baseline_mean_db=None  # TODO: Add from database
    )
    
    print(f"\n📊 Analysis Results:")
    print(f"   Mean σ₀: {result.mean_sigma0_db:.2f} dB")
    print(f"   Drought %: {result.drought_percentage:.1f}%")
    print(f"   Severity: {result.drought_severity}")
    print(f"   Confidence: {result.confidence:.2f}")
    
    # Save results
    output_dir.mkdir(parents=True, exist_ok=True)
    result_file = output_dir / f"result_{input_tiff.stem}.json"
    
    result_dict = {
        "source_file": input_tiff.name,
        "mean_sigma0_db": result.mean_sigma0_db,
        "min_sigma0_db": result.min_sigma0_db,
        "max_sigma0_db": result.max_sigma0_db,
        "std_sigma0_db": result.std_sigma0_db,
        "drought_percentage": result.drought_percentage,
        "drought_severity": result.drought_severity,
        "soil_moisture_index": result.soil_moisture_index,
        "confidence": result.confidence,
        "quality_flag": result.quality_flag,
        "processing_timestamp": result.processing_timestamp
    }
    
    with open(result_file, 'w') as f:
        json.dump(result_dict, f, indent=2)
    
    print(f"   ✅ Saved to: {result_file}")
    
    return result_dict


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description="Process Sentinel-1 SAR data")
    parser.add_argument("input", help="Input .zip or .SAFE directory")
    parser.add_argument("--output", default="../data/sentinel1/processed", help="Output directory")
    parser.add_argument("--polygon", help="GeoJSON file with AOI polygon (optional)")
    
    args = parser.parse_args()
    
    input_path = Path(args.input)
    output_dir = Path(args.output)
    
    # Load polygon if provided
    polygon_geojson = None
    if args.polygon:
        with open(args.polygon) as f:
            geojson_data = json.load(f)
            if geojson_data.get("type") == "Feature":
                polygon_geojson = geojson_data["geometry"]
            else:
                polygon_geojson = geojson_data
    
    # Extract if ZIP
    if input_path.suffix == '.zip':
        extract_dir = input_path.parent / "extracted"
        safe_path = extract_safe_from_zip(input_path, extract_dir)
        tiff_path = find_vv_geotiff(safe_path)
    elif input_path.is_dir() and '.SAFE' in input_path.name:
        tiff_path = find_vv_geotiff(input_path)
    else:
        # Assume it's already a TIFF
        tiff_path = input_path
    
    # Process
    results = process_sar_simple(
        input_tiff=tiff_path,
        output_dir=output_dir,
        polygon_geojson=polygon_geojson
    )
    
    print(f"\n🎉 Processing complete!")


if __name__ == "__main__":
    main()
