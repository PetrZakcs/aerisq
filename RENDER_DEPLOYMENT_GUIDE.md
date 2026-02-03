# 🚀 Render.com Deployment Guide - REAL GEE Backend

**Goal:** Deploy AerisQ backend with Google Earth Engine support on Render.com (FREE tier)

**Time:** 30 minutes

---

## 📋 **PREREQUISITES**

✅ GitHub repo: https://github.com/PetrZakcs/aerisq  
✅ Service account JSON (from `vercel_env_value.txt`)  
✅ Render.com account (free)

---

## 🔧 **STEP-BY-STEP DEPLOYMENT**

### **1. Create Render.com Account** (2 min)

1. Go to: **https://render.com/**
2. Click "Get Started"
3. Sign up with GitHub
4. Authorize Render to access your repos

---

### **2. Create New Web Service** (5 min)

1. Click **"New +"** → **"Web Service"**

2. **Connect Repository:**
   - Select: `PetrZakcs/aerisq`
   - Click "Connect"

3. **Configure Service:**
   ```
   Name: aerisq-backend
   Region: Frankfurt (EU Central)
   Branch: master
   Root Directory: backend
   Runtime: Python 3
   ```

4. **Build & Start Commands:**
   ```
   Build Command:
   pip install -r requirements.txt

   Start Command:
   uvicorn standalone:app --host 0.0.0.0 --port $PORT
   ```

5. **Plan:**
   - Select: **Free** (512 MB RAM, 0.1 CPU)

6. Click **"Create Web Service"**

---

### **3. Configure Environment Variables** (10 min)

In Render dashboard → Your service → **Environment** tab:

**Add these variables:**

```bash
# 1. SECRET_KEY
Name: SECRET_KEY
Value: aerisq-production-2026-secure-key-change-me

# 2. GOD_MODE_EMAIL
Name: GOD_MODE_EMAIL
Value: admin@aerisq.tech

# 3. GOD_MODE_PASSWORD
Name: GOD_MODE_PASSWORD
Value: password123

# 4. GEE_PROJECT_ID
Name: GEE_PROJECT_ID
Value: aerisq

# 5. GEE_SERVICE_ACCOUNT_JSON (IMPORTANT!)
Name: GEE_SERVICE_ACCOUNT_JSON
Value: [PASTE YOUR SERVICE ACCOUNT JSON KEY HERE]

**❓ How to get this key:**
1. Go to Google Cloud Console > IAM & Admin > Service Accounts
2. Select your service account (`aerisq-gee-vercel` or similar)
3. Keys tab > Add Key > Create new key > JSON
4. Open the downloaded file
5. Remove all newlines to make it a single line
6. Paste the full JSON string into the Value field
```

**⚠️ KRITICKÉ:**
- `GEE_SERVICE_ACCOUNT_JSON` musí být **SINGLE LINE**
- Copy z `vercel_env_value.txt` (už je formatted)
- Nesmí obsahovat newlines!

---

### **4. Deploy** (1 min)

1. Click **"Save Changes"**
2. Render automatically triggers deploy
3. Wait 3-5 minutes for build

**Watch logs:**
- Go to **"Logs"** tab
- Should see:
  ```
  Installing dependencies...
  Building wheels...
  Successfully installed earthengine-api...
  Starting server...
  Uvicorn running on http://0.0.0.0:10000
  ```

---

### **5. Verify Deployment** (2 min)

**Your backend URL will be:**
```
https://aerisq-backend.onrender.com
```

**Test endpoints:**

```bash
# Health check
curl https://aerisq-backend.onrender.com/api/health

# Should return:
{
  "status": "healthy",
  "mode": "standalone",
  "physics_version": "2.0",
  "gee_available": true  # ← KEY!
}
```

**If `gee_available: false`:**
- Check Render logs for GEE init errors
- Verify `GEE_SERVICE_ACCOUNT_JSON` is set correctly
- Check `GEE_PROJECT_ID` = "aerisq"

---

### **6. Update Frontend** (5 min)

**In Vercel dashboard:**

1. Go to: https://vercel.com/petr-zakcs-projects/aerisq
2. Settings → Environment Variables
3. **Add new variable:**
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://aerisq-backend.onrender.com
   
   Environments: ☑ Production ☑ Preview ☑ Development
   ```
4. Click "Save"

5. **Redeploy:**
   - Go to Deployments tab
   - Click ⋮ on latest → "Redeploy"

**OR update locally:**

```bash
# frontend/.env.production
NEXT_PUBLIC_API_URL=https://aerisq-backend.onrender.com
```

Then push to GitHub (Vercel auto-deploys).

---

### **7. Test REAL SAR Analysis** (5 min)

1. Open: **https://aerisq.vercel.app**
2. Login: admin@aerisq.tech / password123
3. Draw polygon over **Spain**
4. Dates: **July 1-31, 2023**
5. Click **"Analyze"**

**Expected:**
- ⏱️ Processing: **15-30 seconds** (not instant!)
- 🏷️ Quality badge: **"GEE_REALTIME"** (not SIMULATED!)
- 📊 Results: Real satellite data
- 🛰️ Scene count: ~18 scenes

**If still SIMULATED:**
- Check browser console for API errors
- Verify frontend is calling Render backend
- Check Render logs for GEE initialization

---

## ⚠️ **RENDER FREE TIER NOTES**

### **What to expect:**

✅ **Works perfectly** for demo/beta  
✅ **Unlimited requests** (within reason)  
✅ **Auto-scales** to handle traffic  

⚠️ **"Spins down" after 15 min inactivity**  
   → First request after idle = ~30-60s delay  
   → Subsequent requests = fast  

⚠️ **512 MB RAM limit**  
   → Enough for GEE API (lightweight)  
   → Might struggle with very large polygons (>10,000 km²)

⚠️ **Shared CPU**  
   → Processing time varies  
   → Typically 15-30s for analysis

### **For production:**

Upgrade to **Starter** ($7/month):
- Always-on (no spin-down)
- Dedicated resources
- Faster processing

---

## 🔍 **TROUBLESHOOTING**

### **Deploy Failed:**

**Check build logs for:**
```
ERROR: psycopg2-binary failed to build
```

**Fix:** Remove heavy dependencies not needed:
```bash
# Edit backend/requirements.txt
# Comment out:
# psycopg2-binary==2.9.9  # Not needed for GEE-only mode
# celery[redis]==5.3.6     # Not needed for standalone
```

### **GEE Not Available:**

**Check Render logs for:**
```
⚠️ GEE initialization failed: Invalid credentials
```

**Fix:**
1. Verify `GEE_SERVICE_ACCOUNT_JSON` in Render env vars
2. Make sure it's single-line (use `vercel_env_value.txt`)
3. Check `GEE_PROJECT_ID` = "aerisq"

### **Frontend Still Calling Vercel API:**

**Check browser console:**
```
POST https://aerisq.vercel.app/api/v1/analyze
```

**Should be:**
```
POST https://aerisq-backend.onrender.com/api/v1/analyze
```

**Fix:**
- Verify `NEXT_PUBLIC_API_URL` in Vercel env vars
- Redeploy frontend after adding variable

---

## 📊 **MONITORING**

### **Render Dashboard:**

**Metrics to watch:**
- Requests/min
- Response time
- Memory usage
- Error rate

**Logs:**
- Real-time streaming
- Filter by ERROR, WARN
- Download logs for analysis

### **Uptime:**

Render free tier availability: ~99% (good for demo)

To prevent spin-down:
- Use cron job to ping `/health` every 10 min
- Or upgrade to Starter plan ($7/mo)

---

## ✅ **SUCCESS CHECKLIST**

After deployment, verify:

- [ ] Render service status: **Live**
- [ ] Health endpoint: `GET /api/health` → `"healthy"`
- [ ] GEE available: Response includes `"gee_available": true`
- [ ] Frontend deployed: https://aerisq.vercel.app loads
- [ ] Frontend → Backend: Console shows Render URL
- [ ] Analysis works: Returns `"quality_flag": "GEE_REALTIME"`
- [ ] Processing time: 15-30 seconds (not <2s)
- [ ] Real data: Scene count > 0

---

## 🎯 **FINAL TEST**

**The ultimate test:**

1. Send link to investor: **https://aerisq.vercel.app**
2. They draw polygon **ANYWHERE on Earth**
3. They wait **15-30 seconds**
4. They see **REAL SATELLITE DATA**
5. Badge shows: **"GEE_REALTIME"**
6. They verify on Copernicus Browser (optional)

**This proves:**
- ✅ Technology works globally
- ✅ Real satellite integration
- ✅ Cloud processing (not local)
- ✅ Production-ready architecture

---

## 🚀 **DEPLOYMENT TIMELINE**

```
Now:          Backend on Render (deploying...)
+5 min:       First deploy complete
+10 min:      Environment vars configured
+15 min:      Frontend updated
+20 min:      First test analysis
+25 min:      Verified GEE_REALTIME
+30 min:      PRODUCTION READY!
```

---

## 💰 **COST BREAKDOWN**

```
Render.com Free Tier:     €0/month
Vercel Hobby:             €0/month
Google Earth Engine:      €0/month (free tier)
Supabase Free:            €0/month
GitHub:                   €0/month (public repo)
─────────────────────────────────────
TOTAL:                    €0/month

For production scale:
Render Starter:           €7/month
Vercel Pro:               €20/month (optional)
─────────────────────────────────────
Total (production):       €7-27/month
```

---

## 📝 **NEXT STEPS AFTER DEPLOYMENT**

1. **Test thoroughly:**
   - Different regions (Europe, US, Africa, Asia)
   - Different dates (2023, 2024)
   - Different polygon sizes (1 km² to 1000 km²)

2. **Document for investors:**
   - Take screenshots of GEE_REALTIME badge
   - Record demo video
   - Prepare verification guide

3. **Monitor performance:**
   - Check Render logs for errors
   - Monitor response times
   - Track memory usage

4. **Share with beta testers:**
   - Send link: https://aerisq.vercel.app
   - Collect feedback
   - Iterate based on usage

---

## 🔗 **USEFUL LINKS**

- **Render Dashboard:** https://dashboard.render.com/
- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Repo:** https://github.com/PetrZakcs/aerisq
- **GEE Console:** https://console.cloud.google.com/
- **Live App:** https://aerisq.vercel.app

---

**Ready to deploy?** Let's do it! 🚀
