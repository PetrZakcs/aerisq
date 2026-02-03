# 🧪 AerisQ - Post-Deployment Testing Checklist

**After Vercel deployment completes**

---

## PHASE 1: Verify Deployment (2 minutes)

### ✅ Step 1.1: Check Vercel Dashboard
- [ ] Build completed successfully (green checkmark)
- [ ] No build errors
- [ ] Copy deployment URL (e.g., `https://aerisq.vercel.app`)

### ✅ Step 1.2: Check Deployment URLs
Open in browser:
```
Frontend: https://aerisq.vercel.app
API Health: https://aerisq.vercel.app/api/health
```

**Expected:**
- Frontend loads (landing page)
- API health returns JSON: `{"status": "ok", "version": "3.0.0"}`

---

## PHASE 2: Frontend Tests (5 minutes)

### ✅ Step 2.1: Landing Page
Visit: `https://aerisq.vercel.app`

**Check:**
- [ ] Page loads without errors
- [ ] Logo visible
- [ ] "Get Started" / "Dashboard" button works
- [ ] No console errors (F12 → Console)

### ✅ Step 2.2: Authentication Flow
1. Click "Login" or "Get Started"
2. Try demo credentials:
   ```
   Email: admin@aerisq.tech
   Password: password123
   ```

**Expected:**
- [ ] Login successful
- [ ] Redirects to /dashboard
- [ ] No authentication errors

### ✅ Step 2.3: Dashboard
After login:

**Check:**
- [ ] Map loads (Leaflet)
- [ ] Drawing tools visible
- [ ] Date picker works
- [ ] No JavaScript errors

---

## PHASE 3: Analysis Flow (5 minutes)

### ✅ Step 3.1: Create Test Analysis

**In Dashboard:**
1. **Draw polygon** on map
   - Click drawing tool
   - Draw small rectangle (e.g., over Spain)
   
2. **Select dates**
   - Start: `2023-07-01`
   - End: `2023-07-31`

3. **Click "Analyze"** button

### ✅ Step 3.2: Verify Results

**Expected behavior:**
- [ ] Loading spinner appears
- [ ] Wait 2-10 seconds
- [ ] Results appear on map
- [ ] Statistics panel shows:
  - Mean σ₀ value (dB)
  - Drought severity
  - Soil moisture index
  - Quality flag: **"SIMULATED"** (GEE not active yet)

**Color-coded areas on map:**
- 🟢 Green = Normal
- 🟡 Yellow = Mild drought
- 🟠 Orange = Moderate drought
- 🔴 Red = Severe drought

---

## PHASE 4: API Direct Tests (3 minutes)

### ✅ Step 4.1: Test Health Endpoint

**Command:**
```bash
curl https://aerisq.vercel.app/api/health
```

**Expected:**
```json
{
  "status": "ok",
  "version": "3.0.0"
}
```

### ✅ Step 4.2: Test Demo Analysis Endpoint

**Command:**
```bash
curl -X POST https://aerisq.vercel.app/api/v1/analyze/demo \
  -H "Content-Type: application/json" \
  -d '{
    "polygon": {
      "type": "Polygon",
      "coordinates": [[
        [-6.0, 37.5],
        [-5.0, 37.5],
        [-5.0, 38.5],
        [-6.0, 38.5],
        [-6.0, 37.5]
      ]]
    },
    "date_range": {
      "start": "2023-07-01",
      "end": "2023-07-31"
    }
  }'
```

**Expected:**
```json
{
  "job_id": "...",
  "status": "completed",
  "result": {
    "mean_sigma0_db": -12.34,
    "drought_severity": "MODERATE",
    "quality_flag": "SIMULATED",
    ...
  }
}
```

---

## PHASE 5: Error Handling (2 minutes)

### ✅ Step 5.1: Test Invalid Input

**Try:**
- Draw very large area (should warn)
- Select invalid dates (should error)
- Submit without drawing (should error)

**Expected:**
- [ ] Validation errors display
- [ ] No crashes
- [ ] User-friendly error messages

### ✅ Step 5.2: Check Browser Console

Press **F12** → Console tab

**Should NOT see:**
- ❌ CORS errors
- ❌ 500 Internal Server errors
- ❌ Failed to fetch errors

**Acceptable warnings:**
- ⚠️ "Demo mode" or "Simulated data" warnings

---

## PHASE 6: Performance (2 minutes)

### ✅ Step 6.1: Response Times

**Measure:**
- Page load: < 3 seconds
- API health check: < 500ms
- Demo analysis: < 5 seconds
- Map rendering: < 2 seconds

**Use Network tab (F12):**
- No failed requests
- No slow (>10s) requests

### ✅ Step 6.2: Mobile Responsiveness

**Test on mobile or resize browser:**
- [ ] Mobile view works
- [ ] Map responsive
- [ ] Buttons accessible

---

## PHASE 7: Known Limitations (Awareness)

### ⚠️ Current State:

**✅ WORKING:**
- Frontend (UI, auth, map)
- Backend API (simulation mode)
- Demo analysis
- Database (users, results)

**⏳ NOT YET ACTIVE:**
- ❌ Real GEE satellite data (requires service account)
- ❌ Background processing (Celery/Redis not on Vercel)
- ❌ Real-time SAR downloads

**Quality Flag in Results:**
```json
{
  "quality_flag": "SIMULATED"  ← Tells user it's demo data
}
```

---

## 🎯 SUCCESS CRITERIA

✅ **Deployment is successful if:**

1. **Frontend loads** without errors
2. **Login works** with demo credentials
3. **Dashboard displays** with functional map
4. **Analysis completes** (even if simulated)
5. **Results show** on map with colors
6. **API responds** to health checks
7. **No critical errors** in console

---

## 📋 QUICK TEST SCRIPT

**For fast verification:**

```bash
# Test 1: Health check
curl https://aerisq.vercel.app/api/health

# Test 2: Demo analysis (copy full curl from Step 4.2)
# Should return JSON with results in <5 seconds

# Test 3: Open frontend
start https://aerisq.vercel.app

# Test 4: Login and create analysis via UI
# Use drawing tools + date picker
```

---

## 🆘 Troubleshooting

### Issue: "API not found" (404)
**Fix:** Vercel routing issue
- Check `vercel.json` rewrites
- Verify `api/index.py` exists

### Issue: CORS errors
**Fix:** CORS origins not configured
- Check `backend/app/core/config.py` → CORS_ORIGINS
- Should include `https://aerisq.vercel.app`

### Issue: Authentication fails
**Fix:** Environment variables missing
- Go to Vercel → Settings → Environment Variables
- Verify `SECRET_KEY` exists

### Issue: Slow response (>30s timeout)
**Expected:** Vercel has 30s timeout
- Demo analysis should complete in <5s
- Real GEE would be 10-30s (not active yet)

---

## ✅ AFTER SUCCESSFUL TEST

**Next steps:**

1. **Share deployment URL** with stakeholders
2. **Create demo video** of workflow
3. **Update README** with deployment link
4. **Plan GEE service account** setup (optional)
5. **Monitor** Vercel analytics

---

## 📞 CURRENT STATUS EXPECTATION

**What you should see NOW:**

```
✅ Frontend: Working (production build)
✅ API: Working (simulation mode)
✅ Auth: Working
✅ Analysis: Working (simulated data)
⏳ GEE: Not active (will show "SIMULATED" flag)
```

**This is PERFECT for:**
- ✅ Demo to investors
- ✅ UI/UX validation
- ✅ Workflow testing
- ✅ Proof of concept

**Later add:**
- ⏳ GEE service account → real satellite data
- ⏳ Background workers → async processing
- ⏳ Payment integration → monetization

---

**Start testing when Vercel shows: ✅ Deployment Complete!**
