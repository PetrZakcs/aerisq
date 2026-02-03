# ✅ REAL SAR DATA - Complete Checklist

**Goal:** Switch from simulated to real Sentinel-1 satellite analysis

**Total Time:** ~1-2 hours (mostly waiting for downloads)  
**Cost:** €0

---

## 📋 Phase 1: CDSE Registration (10 minutes)

### Task 1.1: Create Account
- [ ] Open in browser: https://identity.dataspace.copernicus.eu/auth/realms/CDSE/login-actions/registration
- [ ] Fill out form:
  - Email: _________________
  - Username: _________________
  - Password: _________________ (write down!)
  - First Name: _________________
  - Last Name: _________________
- [ ] Accept terms and conditions
- [ ] Click "Register"

### Task 1.2: Verify Email
- [ ] Check email inbox
- [ ] Find email from `noreply@dataspace.copernicus.eu`
- [ ] Click verification link
- [ ] See confirmation message

### Task 1.3: Test Login
- [ ] Go to: https://dataspace.copernicus.eu/
- [ ] Click "Login"
- [ ] Enter username and password
- [ ] Successfully logged in ✅

**✅ Checkpoint:** You can log into CDSE website

---

## 📋 Phase 2: Configure Credentials (2 minutes)

### Task 2.1: Edit .env File
```bash
# Open file:
c:\Users\Admin\Desktop\aerisq\backend\.env
```

### Task 2.2: Add Your Credentials
Find these lines:
```bash
CDSE_USERNAME=
CDSE_PASSWORD=
```

Change to:
```bash
CDSE_USERNAME=your_actual_username
CDSE_PASSWORD=your_actual_password
```

**⚠️ Important:** 
- No quotes needed
- No spaces around =
- No # comments on same line

### Task 2.3: Verify Setup
Run test:
```bash
cd c:\Users\Admin\Desktop\aerisq\backend
python scripts\test_setup.py
```

**Expected:** "✅ CDSE authentication successful!"

**✅ Checkpoint:** Test shows CDSE connected

---

## 📋 Phase 3: Download Real Satellite Data (30-60 min)

### Task 3.1: Choose Test Area

**Recommended:** Southern Spain drought (known case)
```
Area: 38°N, -4°W (Andalusia region)
Date: July 15, 2023
```

Or pick your own area:
```
Area: [latitude, longitude] _______________
Date: [YYYY-MM-DD] _______________
```

### Task 3.2: Run Download Script
```bash
cd c:\Users\Admin\Desktop\aerisq\backend

python scripts\download_real_sar.py --area "37.5,-6.0,38.5,-5.0" --date "2023-07-15" --max 1
```

**What happens:**
- Searches CDSE catalog
- Finds closest Sentinel-1 scene
- Downloads ~800 MB .zip file
- Saves to `../data/sentinel1/raw/`

**Time:** 10-40 minutes (depends on internet speed)

**✅ Checkpoint:** You have a .zip file in `data/sentinel1/raw/`

---

## 📋 Phase 4: Process SAR Data (5 minutes)

### Task 4.1: Run Processing Script
```bash
cd c:\Users\Admin\Desktop\aerisq\backend

python scripts\process_sar.py ../data/sentinel1/raw/S1A_*.zip --output ../data/sentinel1/processed
```

**What happens:**
- Extracts VV polarization band
- Applies Lee speckle filter
- Calculates sigma0 (dB)
- Detects drought areas
- Saves JSON results

**Time:** 3-5 minutes

### Task 4.2: Check Results
```bash
type ..\data\sentinel1\processed\result_*.json
```

**Expected:** JSON with real metrics:
```json
{
  "mean_sigma0_db": -12.3,
  "drought_percentage": 42.5,
  "drought_severity": "MODERATE",
  "quality_flag": "NOMINAL"
}
```

**✅ Checkpoint:** You have processed SAR results!

---

## 📋 Phase 5: Verify Results (5 minutes)

### Task 5.1: Visual Inspection
Look at the results and check:
- [ ] mean_sigma0_db is between -20 and -5 dB (typical range)
- [ ] drought_percentage is between 0-100%
- [ ] drought_severity is one of: NORMAL, MILD, MODERATE, SEVERE, EXTREME
- [ ] quality_flag says "NOMINAL" (good quality)

### Task 5.2: Compare with Known Events

**If you used Southern Spain July 2023:**
- Expect: MODERATE to SEVERE drought
- Why: Well-documented drought event in 2023
- Reference: https://edo.jrc.ec.europa.eu/ (EU Drought Observatory)

### Task 5.3: Sanity Check
Real data should show:
- ✅ More noise/variation than simulation
- ✅ Realistic sigma0 values (-20 to -5 dB)
- ✅ Spatial patterns (not uniform)

**✅ Checkpoint:** Results look realistic

---

## 🎉 SUCCESS CRITERIA

You're successful when ALL these are true:

- ✅ CDSE account created and verified
- ✅ Can login to dataspace.copernicus.eu
- ✅ Credentials in .env work (test passed)
- ✅ Downloaded at least 1 Sentinel-1 scene
- ✅ Processed scene into JSON results
- ✅ Results show realistic values
- ✅ quality_flag = "NOMINAL" or "REAL_SAR_DATA"

---

## ⏭️ NEXT STEPS (After Success)

Once you have real data working:

1. **Update API** to use real results instead of simulation
2. **Add UI badge** showing "REAL DATA" vs "SIMULATED"  
3. **Build database** of processed scenes (Supabase)
4. **Create demo video** showing real satellite analysis
5. **Validate accuracy** against known drought events
6. **Update pitch deck** with real results

---

## 🆘 If You Get Stuck

**Problem:** Registration fails
→ See: `CDSE_REGISTRATION_GUIDE.md`

**Problem:** Download fails  
→ Check credentials in `.env`
→ Run: `python scripts\test_setup.py`

**Problem:** Processing fails
→ Check if rasterio installed: `pip install rasterio`
→ Verify .zip file is complete (~800 MB)

**Problem:** Results look wrong
→ Share JSON output, I'll help debug
→ Check if area was over water (SAR needs land)

---

## 📞 Current Status

**Where you are now:**
- [x] Scripts created
- [x] Dependencies installed
- [x] Physicist agent tested
- [ ] **← START HERE:** CDSE registration

**Next action:** 
Register at https://identity.dataspace.copernicus.eu/auth/realms/CDSE/login-actions/registration

---

**Ready to start? Open the registration link and complete Phase 1!**

When done with each phase, let me know and we'll proceed to the next one.
