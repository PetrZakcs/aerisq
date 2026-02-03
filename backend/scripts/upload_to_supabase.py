"""
Upload processed SAR results to Supabase Storage
This runs in GitHub Actions to store pre-processed data
"""
import os
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime
from typing import List

# Supabase client (install: pip install supabase)
try:
    from supabase import create_client, Client
except ImportError:
    print("⚠️  Supabase client not installed")
    print("   Install: pip install supabase")
    sys.exit(1)


def upload_results_to_supabase(
    result_files: List[Path],
    supabase_url: str,
    supabase_key: str
):
    """
    Upload processed SAR results to Supabase
    
    Args:
        result_files: List of JSON result files
        supabase_url: Supabase project URL
        supabase_key: Supabase anon/service key
    """
    print(f"\n🔄 Uploading {len(result_files)} results to Supabase...")
    
    # Initialize Supabase client
    supabase: Client = create_client(supabase_url, supabase_key)
    
    uploaded_count = 0
    
    for result_file in result_files:
        try:
            # Load result JSON
            with open(result_file) as f:
                result_data = json.load(f)
            
            # Extract metadata
            source_file = result_data.get('source_file', result_file.stem)
            
            # Parse date from filename (e.g., S1A_*_20230713T062738_*.json)
            try:
                date_str = source_file.split('_')[4][:8]  # YYYYMMDD
                sensing_date = datetime.strptime(date_str, '%Y%m%d').isoformat()
            except:
                sensing_date = datetime.utcnow().isoformat()
            
            # Prepare record for database
            record = {
                'scene_id': source_file,
                'sensing_date': sensing_date,
                'mean_sigma0_db': result_data.get('mean_sigma0_db'),
                'drought_severity': result_data.get('drought_severity'),
                'drought_percentage': result_data.get('drought_percentage'),
                'soil_moisture_index': result_data.get('soil_moisture_index'),
                'confidence': result_data.get('confidence'),
                'quality_flag': result_data.get('quality_flag'),
                'full_result': result_data,  # Store complete JSON
                'processed_at': datetime.utcnow().isoformat()
            }
            
            # Insert into Supabase table
            response = supabase.table('sar_results').insert(record).execute()
            
            print(f"   ✅ Uploaded: {source_file}")
            print(f"      Drought: {result_data.get('drought_severity')} "
                  f"({result_data.get('drought_percentage'):.1f}%)")
            
            uploaded_count += 1
            
        except Exception as e:
            print(f"   ❌ Failed to upload {result_file.name}: {e}")
            continue
    
    print(f"\n✅ Uploaded {uploaded_count}/{len(result_files)} results")
    
    return uploaded_count


def main():
    parser = argparse.ArgumentParser(
        description="Upload SAR results to Supabase"
    )
    parser.add_argument(
        '--results',
        nargs='+',
        required=True,
        help='JSON result files to upload'
    )
    parser.add_argument(
        '--supabase-url',
        default=os.getenv('SUPABASE_URL'),
        help='Supabase project URL (or use SUPABASE_URL env var)'
    )
    parser.add_argument(
        '--supabase-key',
        default=os.getenv('SUPABASE_KEY'),
        help='Supabase API key (or use SUPABASE_KEY env var)'
    )
    
    args = parser.parse_args()
    
    # Validate
    if not args.supabase_url or not args.supabase_key:
        print("❌ Error: Supabase credentials required")
        print("   Set SUPABASE_URL and SUPABASE_KEY environment variables")
        print("   Or use --supabase-url and --supabase-key arguments")
        return 1
    
    # Convert to Path objects
    result_files = [Path(f) for f in args.results if Path(f).exists()]
    
    if not result_files:
        print("❌ No valid result files found")
        return 1
    
    print(f"Found {len(result_files)} result files")
    
    # Upload
    uploaded = upload_results_to_supabase(
        result_files=result_files,
        supabase_url=args.supabase_url,
        supabase_key=args.supabase_key
    )
    
    return 0 if uploaded > 0 else 1


if __name__ == "__main__":
    sys.exit(main())
