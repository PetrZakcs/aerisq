# 🚀 GEE Setup - Quick Reference

## Current Status: Authentication ✅ | Project ⏳

---

## Next Steps:

### 1. CREATE GOOGLE CLOUD PROJECT (2 min)

Go to: https://console.cloud.google.com/projectcreate

**Fill in:**
- Project name: `aerisq-earth-engine`
- Project ID: (auto-generated - COPY THIS!)
- Location: No organization

**Click:** CREATE

### 2. COPY PROJECT ID

After creation, copy the **Project ID** (e.g., `aerisq-earth-engine-123456`)

### 3. RUN TEST SCRIPT

```bash
cd c:\Users\Admin\Desktop\aerisq\backend
python scripts\test_gee_final.py
```

**It will ask for Project ID - paste it!**

### 4. VERIFY SUCCESS

You should see:
```
✅ Earth Engine initialized successfully!
✅ Found 15 Sentinel-1 scenes
🔬 Running SAR analysis...
   📊 SAR Statistics:
      Mean VV: -12.34 dB
   🟠 Drought Status: MODERATE DROUGHT
   💧 Soil Moisture Index: 45.2%
🎉 SUCCESS! Google Earth Engine is fully operational!
```

---

## Project ID Storage

The script will save your Project ID to:
```
backend/.gee_project
```

This way you only need to enter it once!

---

## Alternative: Environment Variable

Or set permanently:
```powershell
# Add to .env file:
GEE_PROJECT_ID=your-project-id-here
```

---

## Quick Commands

```bash
# Test GEE
python scripts\test_gee_final.py

# After success, run simple test:
python -c "import ee; ee.Initialize(project='YOUR_PROJECT_ID'); print('✅ OK!')"
```

---

## Troubleshooting

**"Project not found"**
→ Wait 1-2 minutes after creating project
→ Check Project ID spelling (include numbers!)

**"Earth Engine API not enabled"**
→ Go to: https://console.cloud.google.com/apis/library/earthengine.googleapis.com
→ Click ENABLE

**"Permission denied"**
→ Re-run: `python scripts\authenticate_gee.py`

---

## What You Get

✅ Real-time SAR analysis  
✅ No data downloads  
✅ Cloud processing  
✅ Global coverage  
✅ Historical archive (2014-present)  
✅ FREE (10,000 requests/day)

---

**Current step: Create Google Cloud Project**

Browser should be open at: https://console.cloud.google.com/projectcreate

After creating project, run:
```bash
python scripts\test_gee_final.py
```
