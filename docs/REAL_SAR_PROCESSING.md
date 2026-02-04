# 🛰️ Sentinel-1 Data Processing - "Golden Sample" Mode

**Status:** Ready for real `.zip` file processing

---

## 📁 WHERE TO PLACE YOUR SENTINEL-1 .ZIP FILE

### **Option A: Backend data directory** (RECOMMENDED)
```
backend/data/sentinel1/
├── your-sentinel1-file.zip
```

**Create directory if it doesn't exist:**
```powershell
mkdir -p backend/data/sentinel1
```

### **Option B: Project root data directory**
```
data/sentinel1/
├── your-sentinel1-file.zip
```

---

## 🔧 PROCESSING SCRIPT

**Location:** `backend/scripts/process_sar.py`

**What it does:**
1. Extracts `.zip` file
2. Finds VV polarization GeoTIFF
3. Applies speckle filtering
4. Calculates drought statistics
5. Generates:
   - `results.json` (statistics)
   - `preview.png` (visualization)

---

## 🚀 HOW TO PROCESS YOUR .ZIP FILE

### **Step 1: Place the file**
```powershell
# Copy your Sentinel-1 .zip to:
cp path/to/your-sentinel1.zip backend/data/sentinel1/
```

### **Step 2: Run processing script**
```powershell
cd backend
.\venv\Scripts\activate
python scripts/process_sar.py "data/sentinel1/your-file.zip"
```

### **Step 3: Check output**
```
backend/data/sentinel1/processed/
├── your-file/
│   ├── results.json      ← SAR analysis results
│   ├── preview.png       ← Visualization
│   └── metadata.json     ← Scene metadata
```

---

## 📊 RESULTS FORMAT

**`results.json`:**
```json
{
  "mean_sigma0_db": -11.8,
  "std_sigma0_db": 2.3,
  "min_sigma0_db": -18.5,
  "max_sigma0_db": -6.2,
  "drought_severity": "MODERATE",
  "drought_percentage": 45.2,
  "soil_moisture_index": 38,
  "quality_flag": "REAL_SAR_PROCESSED",
  "scene_date": "2023-07-15",
  "polarization": "VV",
  "orbit": "ASCENDING",
  "processing_timestamp": "2026-02-03T20:00:00Z"
}
```

---

## 🎯 INTEGRATE INTO DEMO

### **Option A: Static demo data**

**Move processed results to frontend:**
```powershell
# Copy JSON + PNG to frontend public folder
cp backend/data/sentinel1/processed/*/results.json frontend/public/demo-data/real-sar-results.json
cp backend/data/sentinel1/processed/*/preview.png frontend/public/demo-data/real-sar-preview.png
```

**Update demo to use real data:**
- Modify `frontend/components/AnalysisMap.tsx`
- Load from `/demo-data/real-sar-results.json`
- Show badge: "REAL SAR DATA"

### **Option B: Dynamic processing** (requires backend running)

**API endpoint:**
```python
@app.post("/api/v1/analyze/real-sar")
def analyze_real_sar(zip_file: UploadFile):
    # Process uploaded .zip
    # Return results
    pass
```

**Not implemented yet** - would need file upload handling.

---

## 🛰️ WHERE TO GET SENTINEL-1 DATA

### **Option 1: Copernicus Data Space**
1. Register: https://dataspace.copernicus.eu/
2. Search for Sentinel-1 GRD products
3. Download .zip file (2-4 GB)

**Already have account?** Use `backend/scripts/download_real_sar.py`

### **Option 2: Google Earth Engine** (when activated)
- Script: `backend/scripts/test_gee_final.py`
- Auto-downloads from GEE
- No manual download needed

---

## 📝 FILE NAMING CONVENTION

**Sentinel-1 .zip files typically named:**
```
S1A_IW_GRDH_1SDV_20230715T061234_20230715T061259_049123_05E3C4_1234.zip
```

**Breakdown:**
- `S1A` = Sentinel-1A satellite
- `IW` = Interferometric Wide swath
- `GRDH` = Ground Range Detected, High resolution
- `20230715T061234` = Acquisition date/time
- `049123` = Orbit number
- `05E3C4` = Data take ID

---

## ⚙️ CURRENT STATUS

**What exists:**
- ✅ `process_sar.py` script (ready to use)
- ✅ Physics-based Physicist agent
- ✅ Speckle filtering
- ✅ Drought classification
- ❌ File upload API (not implemented)
- ❌ Real-time GEE processing (blocked by Vercel limits)

**What works:**
- ✅ Process .zip files locally
- ✅ Generate JSON results
- ✅ Create visualizations

**What doesn't work yet:**
- ❌ Upload .zip through UI
- ❌ Process on-demand via API
- ❌ GEE real-time on Vercel

---

## 🎬 DEMO WORKFLOW (with real data)

### **Preparation** (one-time):
1. Download Sentinel-1 .zip
2. Process with `process_sar.py`
3. Copy results to `frontend/public/demo-data/`

### **During demo:**
1. User draws area on map
2. User clicks "Analyze"
3. Frontend loads **PRE-PROCESSED** real results
4. Shows badge: "REAL SAR DATA (July 2023)"
5. Displays authentic satellite analysis

### **Benefit:**
- ✅ Shows **REAL** Sentinel-1 data
- ✅ Instant (no processing during demo)
- ✅ No timeout issues
- ✅ Verifiable (can show raw .zip)

---

## 💡 RECOMMENDATION FOR INVESTOR DEMO

**Best approach:**

1. **Process 2-3 real Sentinel-1 scenes** before demo:
   - Southern Spain (known 2023 drought)
   - Normal area (for contrast)
   - Recent area (shows currency)

2. **Pre-load into demo**:
   - Copy JSON results to frontend
   - When user draws those specific areas → show real data
   - Badge: "REAL SATELLITE DATA (Sentinel-1)"

3. **During pitch:**
   - "This is ACTUAL data from ESA's Sentinel-1 satellite"
   - "Processed using our physics engine"
   - "See the quality badge - this is real, not simulated"

4. **Show raw .zip** if they ask:
   - Pull up the 3GB .zip file
   - "This is what we downloaded from Copernicus"
   - "Our engine processed it into these insights"

---

## 🚀 QUICK START (for your .zip)

```powershell
# 1. Create directory
mkdir backend/data/sentinel1

# 2. Move your .zip there
# (manually copy file)

# 3. Process it
cd backend
.\venv\Scripts\activate
python scripts/process_sar.py "data/sentinel1/your-file-name.zip"

# 4. Check results
cat data/sentinel1/processed/*/results.json
start data/sentinel1/processed/*/preview.png

# 5. Copy to demo
cp data/sentinel1/processed/*/results.json ../frontend/public/demo-data/real-sar-july2023.json
```

---

## 📊 WHAT YOU'LL SEE

**Processing output:**
```
🛰️  Processing Sentinel-1 SAR data...
   Extracting: S1A_IW_GRDH_....zip
   Found VV polarization: measurement/s1a-iw-grd-vv-*.tiff
   Applying speckle filter...
   Calculating statistics...
   ✅ Mean σ₀: -11.8 dB
   ✅ Drought severity: MODERATE
   ✅ Saved: results.json
   ✅ Saved: preview.png
```

**Results preview:**
- False-color image showing drought areas
- Red = severe drought
- Yellow = moderate
- Green = normal

---

**Ready to process your .zip file?**  
Just tell me when it's in `backend/data/sentinel1/` and I'll run the script! 🚀
