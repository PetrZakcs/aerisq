---
description: Implementace reálné SAR analýzy (100% zdarma)
---

# 🚀 Roadmap: Od Simulace k Reálné Analýze (FREE)

## 🎯 Cíl
Nahradit simulátor skutečnou Sentinel-1 SAR analýzou **bez jakýchkoliv nákladů**.

---

## KROK 1: Získání Reálných Dat (ZDARMA)

### 1.1 CDSE Account (5 minut)
1. Jdi na: https://dataspace.copernicus.eu/
2. "Register" → Vyplň email
3. Ověř email
4. **Credentials**: Ulož username + password do `.env`

**Výsledek**: Přístup ke všem Sentinel datům zdarma

### 1.2 Stažení Testovací Scény (30 minut)
Použijeme **Browser-based download** (jednodušší než API):

1. Jdi na: https://browser.dataspace.copernicus.eu/
2. Nastavení:
   - **Products**: Sentinel-1 GRD
   - **Dates**: 2023-07-01 to 2023-07-31
   - **Area**: Nakresli polygon (např. jižní Španělsko 38°N, -4°W)
   - **Cloud Cover**: N/A (SAR nemá clouds)
3. Vyber scénu: S1A_IW_GRDH_*.SAFE
4. Download → **Stáhne se .zip (~800 MB)**

**Kam uložit**: `c:\Users\Admin\Desktop\aerisq\data\sentinel1\raw\`

---

## KROK 2: Pre-processing (Lokálně na PC)

### 2.1 Instalace GDAL (ZDARMA)
```powershell
# Windows - OSGeo4W installer
# Stáhnout: https://trac.osgeo.org/osgeo4w/
# Nebo Conda:
conda install -c conda-forge gdal rasterio
```

### 2.2 Extrakce VV Polarizace
```python
# scripts/extract_sigma0.py
import rasterio
from pathlib import Path

def extract_vv_band(safe_path: Path, output_path: Path):
    """Extract VV polarization GeoTIFF from SAFE"""
    
    # Sentinel-1 GRD má GeoTIFF v measurement/
    vv_tiff = safe_path / "measurement" / "s1*-vv-*.tiff"
    
    with rasterio.open(vv_tiff) as src:
        profile = src.profile
        data = src.read(1)
        
        # Konverze DN → Sigma0 (dB)
        # GRD je už kalibrované, ale v power scale
        sigma0_db = 10 * np.log10(data + 1e-10)
        
        with rasterio.open(output_path, 'w', **profile) as dst:
            dst.write(sigma0_db, 1)
    
    print(f"✅ Extracted: {output_path}")
```

**Náklady**: 0 Kč (běží na vašem PC)

---

## KROK 3: Integrace s Physicist Agentem

### 3.1 Upravit `api/index.py` - Přidat Reálný Mód

```python
# api/index.py - Nová funkce

import os
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data" / "sentinel1" / "processed"
USE_REAL_DATA = os.getenv("USE_REAL_SAR_DATA", "false").lower() == "true"

def run_real_sar_analysis(polygon: dict, date_start: str, job_id: str):
    """
    Použije předpřipravený reálný GeoTIFF místo simulace
    """
    # 1. Najdi closest date v našem cache
    available_dates = list(DATA_DIR.glob("*.tif"))
    if not available_dates:
        raise Exception("No real SAR data available - run preprocessing first")
    
    # Pro demo: použij první dostupný soubor
    raster_path = available_dates[0]
    
    # 2. Použij Physicist agenta
    from backend.app.agents.physicist import PhysicistAgent
    
    physicist = PhysicistAgent()
    result = physicist.analyze_from_raster(
        raster_path=str(raster_path),
        polygon_geojson=polygon,
        polarization="VV",
        apply_speckle_filter=True
    )
    
    # 3. Vrať reálné výsledky
    return {
        "mean_sigma0_db": result.mean_sigma0_db,
        "drought_percentage": result.drought_percentage,
        "drought_severity": result.drought_severity,
        "quality_flag": "REAL_SAR_DATA",  # ← Transparentnost!
        "source_date": raster_path.stem,
        # ... další metriky
    }
```

### 3.2 Environment Variable
```bash
# .env nebo Vercel env vars
USE_REAL_SAR_DATA=true  # Kdy máme data
USE_REAL_SAR_DATA=false # Fallback na simulaci
```

---

## KROK 4: Hybrid Přístup (Doporučuji)

### Strategie: "Best of Both"
```python
def analyze(polygon, dates, job_id):
    # Zkus najít reálná data
    real_data_path = find_cached_sar_data(polygon, dates)
    
    if real_data_path:
        # REAL MODE
        return run_real_sar_analysis(real_data_path, polygon, job_id)
    else:
        # SIMULATION MODE (fallback)
        return run_physics_simulation(polygon, dates, job_id)
```

**Benefit**: 
- ✅ Pokud MÁŠ data → reálná analýza
- ✅ Pokud NEMÁŠ data → simulace (lepší než error)

---

## KROK 5: Free Storage pro Výsledky

### 5.1 Supabase Storage (500 MB free)
```javascript
// Upload processed results
const { data, error } = await supabase
  .storage
  .from('sar-results')
  .upload(`${jobId}/result.geojson`, geojsonBlob)
```

### 5.2 ImgBB pro Preview (unlimited free)
```python
import requests

def upload_preview_image(numpy_array):
    # Convert numpy → PNG
    image_bytes = array_to_png(numpy_array)
    
    response = requests.post(
        "https://api.imgbb.com/1/upload",
        data={
            "key": "YOUR_FREE_API_KEY",
            "image": base64.b64encode(image_bytes)
        }
    )
    
    return response.json()["data"]["url"]
```

---

## KROK 6: Vercel Deployment (FREE)

### Problém: 30s timeout
### Řešení: Pre-processing offline

```yaml
# .github/workflows/process-sar.yml
name: Process SAR Data
on:
  workflow_dispatch:  # Manuální trigger
  
jobs:
  process:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Download & Process SAR
        run: |
          python scripts/download_sentinel.py
          python scripts/extract_sigma0.py
          
      - name: Upload to Supabase
        run: python scripts/upload_results.py
```

**Flow**:
1. GitHub Actions zpracuje data (FREE - 2000 min/month)
2. Uloží výsledky do Supabase
3. Vercel API jen **čte** předpřipravené výsledky (fast!)

---

## BONUS: Open Alternative Data

Pokud nechceš stahovat 800MB scény:

### Google Earth Engine (ZDARMA)
- Pre-processed Sentinel-1 data
- Cloud-based analysis
- Python/JavaScript API

```python
import ee

ee.Initialize()

# Získej Sentinel-1 data
s1 = ee.ImageCollection('COPERNICUS/S1_GRD') \
    .filterBounds(ee.Geometry.Polygon([...])) \
    .filterDate('2023-07-01', '2023-07-31') \
    .select('VV')

# Vypočítej mean
mean_vv = s1.mean().reduceRegion(
    reducer=ee.Reducer.mean(),
    geometry=polygon,
    scale=10
)

print(mean_vv.getInfo())
```

**Výhoda**: Žádné downloady, vše v cloudu
**Nevýhoda**: Potřebuješ se naučit GEE API

---

## 📊 COST BREAKDOWN (FREE TIER)

| Služba | Free Limit | Stačí? |
|--------|-----------|--------|
| CDSE Data | Unlimited | ✅ |
| GitHub Actions | 2000 min/měs | ✅ |
| Vercel Hosting | 100 GB bandwidth | ✅ |
| Supabase DB | 500 MB | ✅ (Pro metadata) |
| Supabase Storage | 1 GB | ✅ (Pro ~100 analýz) |
| ImgBB | Unlimited uploads | ✅ |
| **CELKEM** | **€0/měsíc** | ✅ |

---

## 🎯 PRIORITY QUEUE

### Týden 1: MVP s Reálnými Daty
1. ✅ Stáhnout 1 testovací scénu
2. ✅ Zpracovat lokálně na PC
3. ✅ Připojit Physicist agent
4. ✅ Test na známé oblasti

### Týden 2: Automation
1. ✅ GitHub Actions workflow
2. ✅ Supabase storage setup
3. ✅ Hybrid mode (real + simulation)

### Týden 3: UI Updates
1. ✅ Badge: "REAL DATA" vs "SIMULATED"
2. ✅ Zobrazit source date
3. ✅ Confidence metrics

### Týden 4: Documentation
1. ✅ README update (být transparentní)
2. ✅ Video demo s real data
3. ✅ Pitch deck update

---

## ⚠️ TRANSPARENTNOST

**DŮLEŽITÉ**: V UI zobrazuj:
```tsx
{stats.quality_flag === "REAL_SAR_DATA" ? (
  <Badge variant="success">✓ Real Satellite Data</Badge>
) : (
  <Badge variant="warning">⚡ Simulated (Demo Mode)</Badge>
)}
```

**Proč**: Budovat důvěru > fake perfection

---

## 🚀 NEXT STEPS

Chceš začít implementovat? Navrhuju:

1. **Start Small**: 1 oblast, 1 datum, validace
2. **Iterate**: Přidej více scén postupně
3. **Scale**: Až bude fungovat, automatizuj

Mám připravit konkrétní kód pro KROK 2 nebo 3?
