# 🌍 Google Earth Engine - Complete Setup Guide

**Goal:** Real-time SAR analysis without downloads or pre-processing

**Timeline:** 1-2 days (waiting for GEE approval) + 30 min setup  
**Cost:** €0 (FREE for research/education)

---

## 🎯 Why Google Earth Engine?

### ✅ ADVANTAGES:

**1. No Downloads**
- All Sentinel-1 data already in cloud
- Petabytes of global coverage
- Historical archive back to 2014

**2. Cloud Processing**
- Runs on Google's infrastructure
- Automatic calibration & preprocessing
- Parallel processing (fast!)

**3. True Real-Time**
- User requests → GEE analyzes → Results
- No pre-computation needed
- Always fresh data

**4. Simple Architecture**
```
Frontend → Vercel API → Google Earth Engine → Results
```
(No GitHub Actions, no Supabase, no manual steps!)

**5. FREE**
- Research/Education projects = unlimited
- Commercial use = paid (but you're research for now)

### ⚠️ LIMITATIONS:

**1. Processing Time**
- 10-30 seconds per analysis
- (vs <100ms for cached, but that's acceptable!)

**2. Approval Wait**
- Need to apply for access
- Usually approved in hours-days

**3. Rate Limits**
- FREE tier: 10,000 requests/day
- 100 concurrent requests
- (More than enough for MVP!)

---

## 📋 Setup Steps

### STEP 1: Apply for GEE Access (5 minutes)

**1. Go to signup page:**
```
https://earthengine.google.com/signup/
```

**2. Sign in with Google account**
- Use your existing Gmail
- Or create new one

**3. Fill application form:**

| Field | What to Write |
|-------|---------------|
| **How will you use Earth Engine?** | "Research project on drought detection using Sentinel-1 SAR data analysis" |
| **Organization** | "AerisQ Technologies" or "Independent Researcher" |
| **Project title** | "Agricultural Drought Monitoring System" |
| **Project description** | "Development of physics-based drought detection using satellite radar (SAR) for early warning system. Educational/research purposes." |
| **Use case** | Select: "Research" or "Education" |

**4. Submit application**

**5. Wait for approval email**
- Usually: few hours to 2 days
- Check spam folder!
- Email from: earthengine-team@google.com

---

### STEP 2: Install Earth Engine SDK (2 minutes)

**After approval email:**

```bash
cd c:\Users\Admin\Desktop\aerisq\backend

# Install package
pip install earthengine-api

# Verify installation
python -c "import ee; print('✅ Earth Engine SDK installed')"
```

**Add to requirements.txt:**
```bash
echo "earthengine-api==0.1.390" >> requirements.txt
```

---

### STEP 3: Authenticate (3 minutes)

**Run authentication:**
```bash
earthengine authenticate
```

**What happens:**
1. Browser opens
2. Sign in with your Google account
3. Grant permissions
4. Copy authorization code
5. Paste into terminal

**Verify:**
```bash
python scripts/test_gee.py
```

**Expected output:**
```
✅ Google Earth Engine initialized!
🛰️  Testing Sentinel-1 data access...
✅ Found 15 Sentinel-1 scenes
   First scene date: 2023-07-13
🔬 Running sample analysis...
✅ Mean VV backscatter: -12.34 dB
   Drought status: MODERATE DROUGHT
🎉 Google Earth Engine is working!
```

---

### STEP 4: Update API - Option A (Vercel Serverless)

**Problem:** Vercel doesn't support persistent EE authentication

**Solution:** Use service account (recommended for production)

**Setup service account:**

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create new project: "AerisQ-GEE"
3. Enable Earth Engine API
4. Create service account:
   - Name: `aerisq-gee-service`
   - Role: `Earth Engine Resource Writer`
5. Create JSON key
6. Download `service-account-key.json`

**Add to Vercel:**
```bash
# Convert JSON to single-line string
cat service-account-key.json | jq -c . 

# Add as Vercel environment variable:
# Name: GEE_SERVICE_ACCOUNT_KEY
# Value: (paste JSON string)
```

**Update api/index.py:**
```python
import ee
import json
import os

# Initialize EE with service account
try:
    service_account_info = json.loads(os.getenv('GEE_SERVICE_ACCOUNT_KEY'))
    credentials = ee.ServiceAccountCredentials(
        email=service_account_info['client_email'],
        key_data=service_account_info['private_key']
    )
    ee.Initialize(credentials)
except:
    # Fallback to regular init (development)
    ee.Initialize()

# Import GEE analyzer
from app.agents.gee_analyzer import analyze_with_gee

@app.post("/api/v1/analyze")
def create_analysis(request: AnalyzeRequest, user: dict = Depends(get_current_user)):
    job_id = str(uuid.uuid4())
    
    try:
        # Use GEE for real-time analysis
        stats = analyze_with_gee(
            polygon=request.polygon.model_dump(),
            date_start=request.date_range.start,
            date_end=request.date_range.end
        )
        
        # If GEE has data, use it
        if stats.get('quality_flag') == 'GEE_REALTIME':
            # Success - real SAR data!
            pass
        else:
            # Fallback to simulation if no data
            stats = run_physics_simulation(...)
            stats['quality_flag'] = 'SIMULATED'
            
    except Exception as e:
        # If GEE fails, use simulation
        print(f"GEE error: {e}")
        stats = run_physics_simulation(...)
        stats['quality_flag'] = 'SIMULATED'
    
    # Rest of your code...
```

---

### STEP 4: Update API - Option B (Standalone/Development)

**For local development (easier):**

`backend/standalone.py`:
```python
import ee

# Initialize at startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Initializing Google Earth Engine...")
    try:
        ee.Initialize()
        print("✅ GEE ready!")
    except Exception as e:
        print(f"⚠️  GEE init failed: {e}")
    yield

# Use in analysis
def run_real_analysis(...):
    from app.agents.gee_analyzer import analyze_with_gee
    
    return analyze_with_gee(
        polygon=polygon,
        date_start=date_start,
        date_end=date_end
    )
```

---

## 🧪 Testing

### Test 1: Basic functionality
```bash
python scripts/test_gee.py
```

### Test 2: API integration
```bash
# Start backend
python standalone.py

# In another terminal, test API:
curl -X POST http://localhost:8000/api/v1/analyze/demo \
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

**Expected:** Real SAR statistics with `quality_flag: "GEE_REALTIME"`

---

##⏱️ Performance

**Typical processing times:**

| Area Size | GEE Time | Cache Time | Speedup |
|-----------|----------|------------|---------|
| Small (10 km²) | 5-10s | <100ms | 50-100x |
| Medium (100 km²) | 10-20s | <100ms | 100-200x |
| Large (1000 km²) | 20-40s | <100ms | 200-400x |

**Real-world:** 10-30 seconds is acceptable for SAR analysis!

Traditional approach (downloads) would take 20-60 minutes.

---

## 📊 Comparison

| Aspect | GEE Only | Hybrid (Cache + GEE) | Manual Download |
|--------|----------|---------------------|-----------------|
| **Setup complexity** | ⭐⭐ Simple | ⭐⭐⭐⭐ Complex | ⭐ Very simple |
| **API response time** | 10-30s | <100ms | N/A (offline) |
| **Data freshness** | Real-time | 24h delay | On-demand |
| **Reliability** | ⭐⭐⭐⭐ High | ⭐⭐⭐⭐⭐ Very high | ⭐⭐ Low |
| **Cost** | €0 | €0 | €0 |
| **Scalability** | ⭐⭐⭐⭐⭐ Unlimited | ⭐⭐⭐ Limited by cache | ⭐ Manual |
| **Maintenance** | None | Daily cron job | Manual |

**Recommendation for AerisQ:** Start with **GEE-only**, upgrade to hybrid if you need <100ms responses later.

---

## 🚀 Next Steps

### Now (after GEE approval):
1. ✅ Install SDK
2. ✅ Authenticate
3. ✅ Test with `test_gee.py`
4. ✅ Integrate into API

### Later (optimization):
1. Add caching layer (Redis/Supabase)
2. Implement background jobs for popular areas
3. Add hybrid fallback

### Production:
1. Service account setup
2. Deploy to Vercel
3. Monitor GEE quota usage

---

## 🆘 Troubleshooting

**"GEE not initialized"**
→ Run: `earthengine authenticate`

**"No data found"**
→ Check date range (Sentinel-1 started 2014)
→ Verify area is over land

**"Computation timeout"**
→ Reduce polygon size
→ Shorten date range

**"Quota exceeded"**
→ You hit daily limit (10,000 requests)
→ Wait 24h or upgrade plan

---

## 💰 Cost Analysis

| Usage Level | Requests/Day | Cost |
|-------------|--------------|------|
| **Development** | <100 | €0 |
| **MVP** | <1,000 | €0 |
| **Production** | <10,000 | €0 |
| **Scale** | >10,000 | Contact Google |

---

**You're ready! Let me know when you get GEE approval and we'll set it up!** 🚀
