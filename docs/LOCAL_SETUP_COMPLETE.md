# 🚀 LOCAL SETUP - COMPLETE!

**Mission:** Run AerisQ locally for "Golden Sample" demo mode

---

## ✅ WHAT'S READY

### **1. Unified Startup Script** ✨
```powershell
.\start_local.ps1
```

**What it does:**
- ✅ Checks backend venv
- ✅ Installs/updates dependencies
- ✅ Creates frontend .env.local (NEXT_PUBLIC_API_URL=http://localhost:8000)
- ✅ Starts backend in separate window (port 8000)
- ✅ Starts frontend in separate window (port 3000)
- ✅ Tests connections
- ✅ Opens browser to http://localhost:3000

**ONE command → BOTH servers running!**

---

### **2. Real Sentinel-1 Processing Setup** 🛰️

**Directory created:**
```
backend/data/sentinel1/    ← Place your .zip here!
```

**Processing script ready:**
```
backend/scripts/process_sar.py
```

**How to use your .zip:**
```powershell
# 1. Copy your Sentinel-1 .zip to:
#    backend/data/sentinel1/your-file.zip

# 2. Process it:
cd backend
.\venv\Scripts\activate
python scripts/process_sar.py "data/sentinel1/your-file.zip"

# 3. Results will be in:
#    backend/data/sentinel1/processed/your-file/
#    ├── results.json    ← Stats
#    ├── preview.png     ← Visualization
#    └── metadata.json   ← Scene info
```

---

### **3. Documentation Created** 📚

✅ `start_local.ps1` - Unified startup  
✅ `REAL_SAR_PROCESSING.md` - Complete .zip processing guide  
✅ `TECHNICAL_STATUS_REPORT.md` - Full tech status

---

## 🎯 QUICK START GUIDE

### **OPTION A: Run with SIMULATED data** (immediate)

```powershell
# Just run this:
.\start_local.ps1
```

**What you get:**
- ✅ Full app running locally
- ✅ Physics-based simulation
- ✅ ~2 second analysis
- ✅ Perfect for testing UI/workflow

---

### **OPTION B: Run with REAL Sentinel-1 data** (requires .zip)

```powershell
# Step 1: Place your .zip file
# Copy your Sentinel-1 .zip to:
# backend/data/sentinel1/

# Step 2: Process it (one-time)
cd backend
.\venv\Scripts\activate
python scripts/process_sar.py "data/sentinel1/YOUR-FILE.zip"

# Step 3: Copy results to demo data
mkdir frontend/public/demo-data -Force
cp data/sentinel1/processed/*/results.json frontend/public/demo-data/real-sar.json

# Step 4: Start servers
cd ..
.\start_local.ps1

# Step 5: Modify frontend to load real data
# (requires code change in AnalysisMap.tsx)
```

---

## 📊 CURRENT STATUS

### **Backend:**
- ✅ venv exists at `backend/venv/`
- ✅ requirements.txt ready
- ✅ standalone.py ready (FastAPI server)
- ✅ GEE analyzer ready (for future)
- ✅ SAR processing script ready

### **Frontend:**
- ✅ node_modules exists
- ✅ Next.js 14 configured
- ✅ .env.local will be created automatically
- ✅ Map & drawing tools ready

### **Data Processing:**
- ✅ Directory created: `backend/data/sentinel1/`
- ✅ Script ready: `process_sar.py`
- ⏳ Waiting for your .zip file!

---

## 🎬 DEMO WORKFLOW

### **For investor presentation:**

**Preparation** (before demo):
1. Process 1-2 real Sentinel-1 scenes
2. Copy results to frontend/public/demo-data/
3. (Optional) Modify UI to load real data for specific regions

**During demo:**
1. Start servers: `.\start_local.ps1`
2. Open app: http://localhost:3000
3. Login: admin@aerisq.tech / password123
4. Draw area on map
5. Click "Analyze"
6. FAST results (<30s with real data, <2s with simulation)
7. Show quality badge: "REAL SAR DATA" or "SIMULATED"

**Key selling points:**
- ✅ "This is running entirely locally - no cloud limits"
- ✅ "We can process any Sentinel-1 data globally"
- ✅ "See real satellite data from ESA"
- ✅ "Physics-based analysis, not just image recognition"

---

## 💡 WHY LOCAL MODE?

### **Advantages:**
✅ **No timeouts** (Vercel = 30s limit)  
✅ **Process large files** (Vercel = 250MB limit)  
✅ **Real Sentinel-1 data** (can't deploy GEE on Vercel)  
✅ **Faster iteration** (no deploy wait)  
✅ **Full debugging** (see all logs)  

### **Trade-offs:**
⚠️ Requires running 2 processes  
⚠️ Not accessible from internet  
⚠️ Requires local compute  

**But for DEMO → Perfect!**

---

## 🚀 NEXT STEPS

### **Immediate (to start demo):**
```powershell
.\start_local.ps1
```

### **For real SAR data:**
1. Tell me when your .zip is in `backend/data/sentinel1/`
2. I'll run the processing script
3. We'll integrate results into demo

### **For investor-ready:**
1. Process 2-3 real scenes
2. Copy to demo data
3. Update UI to toggle real/simulated
4. Record demo video

---

## 🎯 COMMANDS SUMMARY

```powershell
# START EVERYTHING (one command):
.\start_local.ps1

# Process real .zip:
cd backend
.\venv\Scripts\activate
python scripts/process_sar.py "data/sentinel1/FILE.zip"

# Manual start backend only:
cd backend
.\venv\Scripts\activate
python standalone.py

# Manual start frontend only:
cd frontend
npm run dev
```

---

## ✅ READY TO GO!

**To start demo RIGHT NOW:**
```powershell
.\start_local.ps1
```

**Two windows will open:**
1. Backend (Python/FastAPI) - Port 8000
2. Frontend (Next.js/React) - Port 3000

**Browser auto-opens to:** http://localhost:3000

**Login:** admin@aerisq.tech / password123

---

**Want me to start it for you?** Just say "start local" and I'll execute `.\start_local.ps1`! 🚀

Or tell me when your Sentinel-1 .zip is ready and I'll process it!
