# 🔑 Google Earth Engine Service Account Setup

**For Vercel deployment with real SAR data**

---

## Why Service Account?

**Problem:** Vercel serverless functions can't use interactive OAuth  
**Solution:** Service Account = machine-to-machine authentication  
**Result:** GEE works in production without manual login

---

## PART 1: Create Service Account (5 min)

### Step 1.1: Open IAM Console

Browser should open to:
```
https://console.cloud.google.com/iam-admin/serviceaccounts?project=aerisq
```

Or navigate:
1. Go to: https://console.cloud.google.com/
2. Select project: **aerisq**
3. Menu → IAM & Admin → Service Accounts

### Step 1.2: Create Service Account

Click **"+ CREATE SERVICE ACCOUNT"** (top of page)

**Fill form:**

| Field | Value |
|-------|-------|
| **Service account name** | `aerisq-gee-vercel` |
| **Service account ID** | `aerisq-gee-vercel` (auto-generated) |
| **Description** | "GEE access for Vercel deployment" |

Click **"CREATE AND CONTINUE"**

### Step 1.3: Grant Permissions

**Role selection:**

Search and add:
- ✅ **Earth Engine Resource Writer**
  
(Or if not found, use "Editor" for now)

Click **"CONTINUE"**

Click **"DONE"** (skip step 3 - optional)

### Step 1.4: Create JSON Key

1. Find your new service account in list
2. Click **Actions menu** (⋮) → **Manage keys**
3. Click **"ADD KEY"** → **"Create new key"**
4. Select **JSON** format
5. Click **"CREATE"**

**JSON file downloads** → Save it!  
(Example: `aerisq-gee-vercel-abc123.json`)

⚠️ **IMPORTANT:** This file contains secrets! Don't commit to Git!

---

## PART 2: Enable Earth Engine API (2 min)

### Step 2.1: Go to API Library

```
https://console.cloud.google.com/apis/library/earthengine.googleapis.com?project=aerisq
```

### Step 2.2: Enable API

Click **"ENABLE"** button

Wait ~30 seconds for activation.

---

## PART 3: Register Service Account with Earth Engine (3 min)

### Step 3.1: Get Service Account Email

From downloaded JSON, find:
```json
{
  "client_email": "aerisq-gee-vercel@aerisq.iam.gserviceaccount.com"
}
```

Copy this email address.

### Step 3.2: Register with Earth Engine

Go to:
```
https://code.earthengine.google.com/
```

Or run Python locally:
```python
import ee
ee.data.setProject('aerisq')
```

**Note:** Service accounts are automatically registered when you use them with a project.

---

## PART 4: Add to Vercel (5 min)

### Step 4.1: Convert JSON to Single Line

**Open PowerShell:**
```powershell
# Read JSON file
$json = Get-Content "path\to\aerisq-gee-vercel-abc123.json" | ConvertFrom-Json

# Convert to single-line string
$jsonString = $json | ConvertTo-Json -Compress

# Copy to clipboard
$jsonString | Set-Clipboard

Write-Host "✅ JSON copied to clipboard!"
```

Or manually:
1. Open JSON file
2. Remove all line breaks
3. Make it ONE line
4. Copy entire line

### Step 4.2: Add to Vercel Environment Variables

1. Go to: https://vercel.com/petr-zakcs-projects/aerisq
2. Click **Settings** tab
3. Click **Environment Variables**
4. Click **"Add Variable"**

**Add these:**

| Key | Value | Environments |
|-----|-------|--------------|
| `GEE_SERVICE_ACCOUNT_JSON` | (paste single-line JSON) | Production, Preview, Development |
| `GEE_PROJECT_ID` | `aerisq` | Production, Preview, Development |

Click **"Save"**

### Step 4.3: Trigger Redeploy

Vercel will ask: "Redeploy to apply changes?"  
Click **"Redeploy"**

Or manually:
1. Go to Deployments tab
2. Click latest deployment ⋮ menu
3. Click "Redeploy"

---

## PART 5: Update API Code (10 min)

### Step 5.1: Update GEE Analyzer

Edit: `backend/app/agents/gee_analyzer.py`

Change `__init__` method:

```python
def __init__(self, project_id: Optional[str] = None):
    """Initialize Google Earth Engine"""
    self.project_id = None
    self.ready = False
    
    # Determine project ID
    if project_id:
        self.project_id = project_id
    elif os.getenv('GEE_PROJECT_ID'):
        self.project_id = os.getenv('GEE_PROJECT_ID')
    else:
        from pathlib import Path
        config_file = Path(__file__).parent.parent.parent / 'backend' / '.gee_project'
        if config_file.exists():
            with open(config_file) as f:
                self.project_id = f.read().strip()
    
    try:
        # Check for service account (Vercel)
        service_account_json = os.getenv('GEE_SERVICE_ACCOUNT_JSON')
        
        if service_account_json:
            # Parse JSON
            import json
            credentials_dict = json.loads(service_account_json)
            
            # Create credentials
            credentials = ee.ServiceAccountCredentials(
                email=credentials_dict['client_email'],
                key_data=credentials_dict['private_key']
            )
            
            # Initialize with service account
            ee.Initialize(
                credentials=credentials,
                project=self.project_id or 'aerisq'
            )
            
            print(f"✅ GEE initialized with service account")
            self.ready = True
            
        elif self.project_id:
            # Local development - use regular auth
            ee.Initialize(project=self.project_id)
            print(f"✅ GEE initialized with project: {self.project_id}")
            self.ready = True
            
        else:
            # Try without project (legacy)
            ee.Initialize()
            print("✅ GEE initialized (legacy mode)")
            self.ready = True
            
    except Exception as e:
        print(f"⚠️ GEE initialization failed: {e}")
        self.ready = False
```

### Step 5.2: Update API to Use GEE

Edit: `api/index.py`

Add at top:
```python
import os
from app.agents.gee_analyzer import gee_analyzer
```

Update `create_analysis` endpoint:
```python
@app.post("/api/v1/analyze")
async def create_analysis(
    request: AnalyzeRequest,
    current_user: dict = Depends(get_current_user)
):
    job_id = str(uuid.uuid4())
    
    # Try GEE first, fallback to simulation
    try:
        if gee_analyzer.ready:
            # Use real GEE data!
            result = gee_analyzer.analyze_area(
                polygon_geojson=request.polygon.model_dump(),
                date_start=request.date_range.start,
                date_end=request.date_range.end
            )
            
            if result.get('quality_flag') == 'GEE_REALTIME':
                # Success! Real satellite data
                return AnalyzeResponse(
                    job_id=job_id,
                    status="completed",
                    result=result
                )
        
        # Fallback to simulation
        result = run_physics_analysis(...)
        result['quality_flag'] = 'SIMULATED'
        
    except Exception as e:
        # Error - use simulation
        logger.error(f"GEE error: {e}")
        result = run_physics_analysis(...)
        result['quality_flag'] = 'SIMULATED'
    
    return AnalyzeResponse(...)
```

---

## PART 6: Test (5 min)

### Step 6.1: Commit and Push

```bash
git add backend/app/agents/gee_analyzer.py api/index.py
git commit -m "Add GEE service account support for Vercel"
git push origin master
```

### Step 6.2: Wait for Deployment

Vercel will auto-deploy (~2-3 minutes)

### Step 6.3: Test API

```bash
curl -X POST https://aerisq.vercel.app/api/v1/analyze/demo \
  -H "Content-Type: application/json" \
  -d '{
    "polygon": {"type": "Polygon", "coordinates": [[[-6,37.5],[-5,37.5],[-5,38.5],[-6,38.5],[-6,37.5]]]},
    "date_range": {"start": "2023-07-01", "end": "2023-07-31"}
  }'
```

**Look for:**
```json
{
  "quality_flag": "GEE_REALTIME"  // ← Real data!
}
```

**vs**
```json
{
  "quality_flag": "SIMULATED"  // ← Still simulation
}
```

---

## ✅ SUCCESS CRITERIA

You'll know it works when:

1. **Vercel deployment** succeeds (no errors)
2. **API response** shows `"quality_flag": "GEE_REALTIME"`
3. **Processing time** is 10-30 seconds (vs instant simulation)
4. **Data values** vary with real geography
5. **UI badge** shows "GEE_REALTIME" instead of "SIMULATED"

---

## 🆘 Troubleshooting

### "Service account not found"
→ Verify email in JSON matches registered account

### "Permission denied"
→ Enable Earth Engine API for project
→ Check service account has "Earth Engine Resource Writer" role

### "Invalid credentials"
→ Re-download JSON key
→ Verify JSON is valid (run through JSON validator)

### "Project not found"
→ Set GEE_PROJECT_ID environment variable
→ Use project ID (not name): `aerisq`

### Still shows "SIMULATED"
→ Check Vercel logs for GEE initialization errors
→ Verify environment variables are set correctly

---

## 📊 Before vs After

| Aspect | Before (Simulated) | After (Real GEE) |
|--------|-------------------|------------------|
| **Quality Flag** | SIMULATED | GEE_REALTIME |
| **Data Source** | Math model | Sentinel-1 satellite |
| **Processing** | <2 seconds | 10-30 seconds |
| **Variability** | Algorithmic | Real geography |
| **Trust** | Demo-quality | Production-grade |
| **Cost** | €0 | €0 (free tier) |

---

**Ready to start? Follow steps above!**

Current step: **Create Service Account in browser**
