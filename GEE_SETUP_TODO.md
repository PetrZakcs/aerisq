# 🎯 GEE Service Account - Quick Action Steps

**Status: Code deployed, waiting for service account credentials**

---

## ✅ DONE (Automated)

- ✅ GEE analyzer supports service account
- ✅ API tries GEE first, falls back to simulation  
- ✅ Code pushed to GitHub
- ✅ Vercel auto-deploying

---

## 📋 TODO (Manual - 10 minutes)

### STEP 1: Create Service Account (if not done yet)

**Browser should be at:**
```
https://console.cloud.google.com/iam-admin/serviceaccounts?project=aerisq
```

**Actions:**
1. Click "+ CREATE SERVICE ACCOUNT"
2. Name: `aerisq-gee-vercel`
3. Role: "Earth Engine Resource Writer" (or "Editor")
4. CREATE
5. Find account → Actions (⋮) → Manage keys
6. ADD KEY → Create new key → JSON
7. DOWNLOAD JSON file

---

### STEP 2: Enable Earth Engine API

```
https://console.cloud.google.com/apis/library/earthengine.googleapis.com?project=aerisq
```

Click: **ENABLE** (if not already enabled)

---

### STEP 3: Convert JSON to Vercel Format

**In PowerShell:**
```powershell
cd c:\Users\Admin\Desktop\aerisq

# Update path to your downloaded JSON file
.\convert_json_for_vercel.ps1 "C:\Users\Admin\Downloads\aerisq-gee-vercel-*.json"
```

**This will:**
- ✅ Convert JSON to single-line
- ✅ Copy to clipboard  
- ✅ Show next steps

---

### STEP 4: Add to Vercel Environment Variables

**Go to:**
```
https://vercel.com/petr-zakcs-projects/aerisq/settings/environment-variables
```

**Add 2 variables:**

**Variable 1:**
```
Name: GEE_SERVICE_ACCOUNT_JSON
Value: (Ctrl+V - paste from clipboard)
Environments: ✓ Production ✓ Preview ✓ Development
```

**Variable 2:**
```
Name: GEE_PROJECT_ID
Value: aerisq
Environments: ✓ Production ✓ Preview ✓ Development
```

Click **SAVE** → Click **REDEPLOY** when asked

---

### STEP 5: Wait for Deployment (~3 min)

Vercel will rebuild with new environment variables.

---

### STEP 6: Test!

**After deployment completes:**

```powershell
cd c:\Users\Admin\Desktop\aerisq
.\test-deployment.ps1
```

**OR test in UI:**
1. Go to: https://aerisq.vercel.app
2. Login
3. Draw polygon
4. Click "Analyze"
5. Look for quality badge:
   - ❌ "SIMULATED" = GEE not working yet
   - ✅ "GEE_REALTIME" = Real satellite data! 🎉

---

## 🔍 HOW TO VERIFY SUCCESS

### In Browser Console (F12):
- Check Vercel logs for GEE initialization messages
- ✅ "GEE initialized with service account"
- OR ⚠️ "GEE not available"

### In API Response:
```json
{
  "quality_flag": "GEE_REALTIME",  // ← Real data!
  "processing_method": "Google Earth Engine (cloud)",
  "scene_count": 15  // ← Real scenes found
}
```

### Processing Time:
- Simulation: <2 seconds
- GEE Real Data: 10-30 seconds ← This is expected!

---

## 🆘 Troubleshooting

**Still shows "SIMULATED"?**

1. Check Vercel logs:
   ```
   https://vercel.com/petr-zakcs-projects/aerisq/deployments
   ```
   Click latest → "View Function Logs"

2. Look for:
   - ✅ "GEE initialized with service account"
   - ❌ "GEE not available"
   - ❌ "Invalid GEE_SERVICE_ACCOUNT_JSON"

3. Common issues:
   - JSON not properly formatted (should be ONE line)
   - Missing environment variables
   - Service account not enabled for Earth Engine
   - API not enabled

**"Permission denied"?**
→ Enable Earth Engine API for project
→ Check service account has correct role

**"Project not found"?**
→ Verify GEE_PROJECT_ID = "aerisq" (exact match)

---

## 📊 Expected Timeline

| Step | Time | Status |
|------|------|--------|
| ✅ Code deployed | Done | Complete |
| ⏳ Create service account | 5 min | **NOW** |
| ⏳ Convert JSON | 1 min | After download |
| ⏳ Add to Vercel | 2 min | After convert |
| ⏳ Wait for redeploy | 3 min | Automatic |
| ⏳ Test | 2 min | After deploy |
| **TOTAL** | **~13 min** | **From now** |

---

## 🎯 CURRENT STEP

**You need to:**
1. Go to service account page (browser opened earlier)
2. Create account + download JSON
3. Run convert script
4. Add to Vercel
5. Wait for deployment
6. Test!

---

**Ready? Start with STEP 1 above! 🚀**
