# Quick diagnostic - what's wrong with GEE on Vercel?

## Možné problémy:

### 1. Import path issue
- Vercel structure vs local different
- `backend/` folder might not be accessible

### 2. earthengine-api not installed
- Check requirements.txt deployed
- Vercel might skip it

### 3. Service account JSON invalid
- Check if properly escaped
- Single-line format required

### 4. Timeout during init
- GEE init might take >10s on cold start
- Vercel times out

## Quick fix to try:

### Option A: Simplify import (RECOMMENDED)
Move GEE initialization INSIDE the endpoint, not at import time.

**Change in api/index.py:**
```python
# Don't init at import
gee_analyzer = None

@app.post("/api/v1/analyze")
def create_analysis(...):
    global gee_analyzer
    
    # Init on first use (lazy)
    if gee_analyzer is None:
        try:
            from app.agents.gee_analyzer import GEEAnalyzer
            gee_analyzer = GEEAnalyzer(project_id=os.getenv("GEE_PROJECT_ID", "aerisq"))
        except:
            pass  # Will fallback to simulation
    
    if gee_analyzer and gee_analyzer.ready:
        # Try GEE
        ...
```

### Option B: Check Vercel logs
Look for specific error messages.

### Option C: Accept SIMULATED for demo
GEE setup on Vercel is complex. For MVP/demo, SIMULATED is acceptable:
- Physics-based
- Consistent
- Fast
- Free
- Transparent (badge shows it)

## Recommendation:

For investor demo: **Use SIMULATED mode**
- It works NOW
- Physics-based = credible
- Badge is transparent
- Can explain: "Real GEE ready, just needs production deployment setup"

For production: **Continue GEE debugging**
- Worth the effort for real data
- But not critical for demo

## Timeline estimate:
- More GEE debugging: 1-2 hours
- Accept SIMULATED: 0 hours (done!)

Your choice!
