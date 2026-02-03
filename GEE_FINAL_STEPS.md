# ✅ GEE Setup - Final Checklist

## DONE ✅

- ✅ Service account created
- ✅ JSON key downloaded
- ✅ Converted to Vercel format
- ✅ Copied to clipboard
- ✅ Backup saved (`vercel_env_value.txt`)

---

## NOW - In Vercel Browser 🔄

### Add Environment Variables:

**Variable 1:**
```
Key: GEE_SERVICE_ACCOUNT_JSON
Value: (Ctrl+V to paste)
Environments: ☑ Production ☑ Preview ☑ Development
```

**Variable 2:**
```
Key: GEE_PROJECT_ID
Value: aerisq
Environments: ☑ Production ☑ Preview ☑ Development
```

**Then:** Click "Save" → Click "Redeploy"

---

## AFTER REDEPLOY (~3 min) 🧪

### Test Real SAR Data:

```powershell
cd c:\Users\Admin\Desktop\aerisq
.\test-gee-integration.ps1
```

### What to expect:

**✅ SUCCESS (Real Data):**
```
✅ SUCCESS! REAL SATELLITE DATA!
🛰️  Data Source: Sentinel-1
   Quality Flag: GEE_REALTIME
   ⏱️ Processing Time: 15-30 seconds
```

**❌ NOT YET (Still Simulated):**
```
⚠️  Still using SIMULATED data
   Quality Flag: SIMULATED
   ⏱️ Processing Time: <3 seconds
```

**If still simulated:**
1. Wait 1-2 more minutes (redeploy not complete)
2. Check Vercel logs for errors
3. Verify environment variables saved correctly

---

## How to Check Vercel Logs:

1. Go to: https://vercel.com/petr-zakcs-projects/aerisq/deployments
2. Click latest deployment
3. Click "View Function Logs"
4. Look for:
   - ✅ "GEE initialized with service account"
   - ✅ "Attempting GEE analysis"
   - OR ❌ "GEE not available"

---

## Timeline:

| Step | Time | Status |
|------|------|--------|
| ✅ JSON converted | Done | Complete |
| 🔄 Add to Vercel | 2 min | **NOW** |
| ⏳ Redeploy | 3 min | After save |
| 🧪 Test | 30 sec | After deploy |

---

**Current: Add variables in Vercel browser, then SAVE + REDEPLOY!**
