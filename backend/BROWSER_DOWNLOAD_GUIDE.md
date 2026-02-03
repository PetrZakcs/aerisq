# 🌐 Alternative: Manual Browser Download

If the Python script is too slow or hanging, use browser download instead.
This is often MORE RELIABLE for large files!

## Steps:

### 1. Open CDSE Browser
Navigate to: https://browser.dataspace.copernicus.eu/

### 2. Login
- Click "Login" (top right)
- Email: petr@aerisq.tech
- Password: (your password)

### 3. Search for Data

**Area:**
- Click map drawing tool
- Draw rectangle over: Southern Spain
- Coordinates: approximately 37.5°N to 38.5°N, -6°W to -5°W

**Filters (left sidebar):**
- **Products:** Sentinel-1 → GRD
- **Date:** 2023-07-12 to 2023-07-18
- **Sensing Mode:** IW (Interferometric Wide Swath)

### 4. Find the Scene

Look for:
```
S1A_IW_GRDH_1SDV_20230713T062738_20230713T062803_049401_05F0B8_7EB1
```

Or any scene from July 13-15, 2023

### 5. Download

- Click on the scene
- Click "Download Product" button
- Browser will start download to your Downloads folder
- File: ~1.7 GB .zip

### 6. Move to Project

Once downloaded, move file to:
```
C:\Users\Admin\Desktop\aerisq\data\sentinel1\raw\
```

PowerShell command:
```powershell
# Adjust filename if different
Move-Item "$env:USERPROFILE\Downloads\S1A_IW_GRDH_*.zip" "C:\Users\Admin\Desktop\aerisq\data\sentinel1\raw\"
```

### 7. Then Process

```bash
cd C:\Users\Admin\Desktop\aerisq\backend
python scripts/process_sar.py ../data/sentinel1/raw/S1A_*.zip
```

---

## Why Browser is Better:

✅ Visual progress bar  
✅ Can pause/resume  
✅ Browser handles retries automatically  
✅ More reliable for large files  
✅ Can see estimated time remaining

---

## Troubleshooting Script Download:

If you want to try script again later, possible fixes:

### Fix 1: Smaller timeout (faster failure detection)
Edit `backend/app/agents/scout.py` line ~317:
```python
# Change from:
async with httpx.AsyncClient(timeout=600.0) as client:

# To:
async with httpx.AsyncClient(timeout=120.0) as client:
```

### Fix 2: Add progress indicator
The script currently doesn't show download progress. We could add `tqdm` for this.

### Fix 3: Use streaming download
For large files, streaming is better than loading all into memory.

---

**For now: BROWSER DOWNLOAD is your best bet!**
