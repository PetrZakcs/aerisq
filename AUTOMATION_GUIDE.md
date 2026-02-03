# 🤖 Fully Automated SAR Analysis Pipeline

**Goal:** Data downloads, processes, and displays **automatically** without manual work.

**Cost:** €0 (using free tiers)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  AUTOMATED PIPELINE (No manual work!)                  │
└─────────────────────────────────────────────────────────┘

Step 1: GitHub Actions (Runs daily at 2 AM)
   ↓
   - Downloads new Sentinel-1 scenes from CDSE
   - Processes with Physicist agent
   - Extracts drought metrics
   ↓
Step 2: Upload to Supabase (Cloud storage)
   ↓
   - Stores processed results in database
   - Ready for instant API access
   ↓
Step 3: Vercel API (User makes request)
   ↓
   - Finds nearest cached scene for user's polygon
   - Returns results in <100ms
   ↓
Step 4: Frontend displays results
   ✅ Real satellite data
   ✅ No waiting for download/processing
```

---

## 📋 Setup Steps

### Part 1: Supabase Setup (5 minutes, FREE)

**1. Create Supabase Project**
- Go to: https://supabase.com/
- Click "Start your project" (FREE tier)
- Create new project
- Wait 2 minutes for provisioning

**2. Create Database Table**

Go to SQL Editor in Supabase dashboard and run:

```sql
-- Table for storing processed SAR results
CREATE TABLE sar_results (
    id BIGSERIAL PRIMARY KEY,
    scene_id TEXT UNIQUE NOT NULL,
    sensing_date TIMESTAMP NOT NULL,
    mean_sigma0_db FLOAT,
    drought_severity TEXT,
    drought_percentage FLOAT,
    soil_moisture_index FLOAT,
    confidence FLOAT,
    quality_flag TEXT,
    full_result JSONB,
    processed_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

 -- Index for fast queries
CREATE INDEX idx_sensing_date ON sar_results(sensing_date);
CREATE INDEX idx_drought_severity ON sar_results(drought_severity);

-- Enable Row Level Security (optional for now)
ALTER TABLE sar_results ENABLE ROW LEVEL SECURITY;

-- Policy to allow public read access
CREATE POLICY "Public read access"
    ON sar_results
    FOR SELECT
    USING (true);
```

**3. Get Credentials**

In Supabase dashboard → Settings → API:
- Copy **Project URL** (looks like: `https://xxx.supabase.co`)
- Copy **anon public** key (long string)

---

### Part 2: GitHub Secrets Setup (2 minutes)

**1. Go to your GitHub repo:**
```
https://github.com/YOUR_USERNAME/aerisq/settings/secrets/actions
```

**2. Add these secrets:**

Click "New repository secret" for each:

| Secret Name | Value |
|-------------|-------|
| `CDSE_USERNAME` | `petr@aerisq.tech` |
| `CDSE_PASSWORD` | `your_cdse_password` |
| `SUPABASE_URL` | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | `your_supabase_anon_key` |

---

### Part 3: Install Supabase Package (1 minute)

Add to `backend/requirements.txt`:
```
supabase==2.3.4
```

Then install:
```bash
cd backend
pip install supabase
```

---

### Part 4: Test GitHub Actions Workflow

**Manual trigger (for testing):**

1. Go to your repo on GitHub
2. Click "Actions" tab
3. Click "Process SAR Data Automatically"
4. Click "Run workflow"
5. Fill in:
   - Area: `37.5,-6.0,38.5,-5.0`
   - Date: `2023-07-15`
6. Click "Run workflow"

**What happens:**
- GitHub Actions runner starts
- Downloads Sentinel-1 scene (~10 min)
- Processes with Physicist (~5 min)
- Uploads to Supabase (~30 sec)
- **Total: ~15-20 minutes**

**Where to watch:**
- Actions tab shows live progress
- You'll see each step complete
- Green checkmark = success!

---

### Part 5: API Integration (10 minutes)

Update `api/index.py` to query Supabase instead of generating fake data:

```python
from supabase import create_client
import os

# Initialize Supabase
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

@app.post("/api/v1/analyze")
def create_analysis(request: AnalyzeRequest, user: dict = Depends(get_current_user)):
    job_id = str(uuid.uuid4())
    
    # Query Supabase for nearest scene
    date_str = request.date_range.start
    
    response = supabase.table('sar_results') \
        .select('*') \
        .gte('sensing_date', f'{date_str}T00:00:00') \
        .lte('sensing_date', f'{request.date_range.end}T23:59:59') \
        .order('sensing_date', desc=True) \
        .limit(1) \
        .execute()
    
    if response.data and len(response.data) > 0:
        # Use real SAR data!
        result = response.data[0]
        stats = result['full_result']
        stats['quality_flag'] = 'REAL_SAR_DATA'
    else:
        # Fallback to simulation if no data
        stats = run_physics_simulation(...)
        stats['quality_flag'] = 'SIMULATED'
    
    # Rest of your code...
```

---

## 🚀 Daily Automation

**Once set up:**

1. **GitHub Actions runs daily (2 AM UTC)**
   - Automatically downloads yesterday's scenes
   - Processes them
   - Stores in Supabase

2. **API always has fresh data**
   - No manual work needed
   - Results are pre-computed
   - API responses are instant (<100ms)

3. **Users get real satellite data**
   - Transparent labeling ("REAL_SAR_DATA" vs "SIMULATED")
   - Maximum 24 hours old
   - Production quality

---

## 📊 Monitoring

**Check workflow runs:**
```
https://github.com/YOUR_USERNAME/aerisq/actions
```

**Check Supabase data:**
```sql
-- Query in Supabase SQL editor
SELECT 
    scene_id,
    sensing_date,
    drought_severity,
    drought_percentage,
    quality_flag,
    processed_at
FROM sar_results
ORDER BY sensing_date DESC
LIMIT 10;
```

---

## 💰 Cost Analysis (FREE Tier)

| Service | Free Tier | Usage | Cost |
|---------|-----------|-------|------|
| **GitHub Actions** | 2000 min/month | ~20 min/day = 600 min/mo | €0 |
| **Supabase DB** | 500 MB | ~1 MB per scene = 30 MB/mo | €0 |
| **Supabase Storage** | 1 GB | Results only, no raw files | €0 |
| **CDSE Data** | Unlimited | Download bandwidth | €0 |
| **Vercel** | 100 GB bandwidth | API calls | €0 |
| **TOTAL** | | | **€0/month** |

---

## 🎯 Result

**✅ Fully automated**
- No manual downloads
- No manual processing
- No manual uploads

**✅ Always fresh**
- Daily updates
- Maximum 24h old data

**✅ API is fast**
- Pre-computed results
- <100ms response time

**✅ Scalable**
- Process multiple areas
- Store historical archive
- Query by date/location

**✅ 100% FREE**
- All free tiers
- No hidden costs

---

## 🔄 Workflow Customization

### Process Multiple Areas

Edit `.github/workflows/process-sar-data.yml`:

```yaml
strategy:
  matrix:
    area:
      - '37.5,-6.0,38.5,-5.0'  # Spain
      - '40.0,14.0,41.0,15.0'  # Italy
      - '48.0,16.0,49.0,17.0'  # Austria
```

### Change Schedule

```yaml
schedule:
  # Every 6 hours
  - cron: '0 */6 * * *'
  
  # Every Monday at 3 AM
  - cron: '0 3 * * 1'
```

---

## 🆘 Troubleshooting

**Workflow fails?**
- Check GitHub Actions logs
- Verify secrets are set correctly
- Check CDSE credentials

**No data in Supabase?**
- Check workflow completed successfully
- Verify Supabase connection
- Check SQL table exists

**API returns simulation?**
- No matching data for date range
- Expand date range in query
- Check Supabase has data for that period

---

**Next: Set up Supabase and GitHub secrets, then run first workflow!**
