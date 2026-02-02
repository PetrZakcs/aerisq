"""
AerisQ API - Main Application
Physics-Based Sentinel-1 Radar Analysis Platform
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings
from app.db.database import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("🚀 AerisQ API Starting...")
    logger.info(f"🔧 Debug mode: {settings.DEBUG}")
    logger.info(f"🌐 CORS origins: {settings.CORS_ORIGINS}")
    
    # Initialize database tables
    try:
        init_db()
        logger.info("✅ Database initialized")
    except Exception as e:
        logger.warning(f"⚠️ Database init skipped (may not be available): {e}")
    
    yield
    
    # Shutdown
    logger.info("👋 AerisQ API Shutting down...")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
## AerisQ Physics-Based Radar Analysis Platform

**MVP v3.0** - Sentinel-1 SAR drought detection engine.

### Features:
- 🛰️ **Sentinel-1 Integration**: Direct CDSE API access
- 📊 **Physics Engine**: Real radiometric calibration (Sigma0 dB)
- 🤖 **4-Agent Pipeline**: Scout → Physicist → Analyst → Cartographer
- 🗺️ **GeoJSON Output**: Ready for frontend map visualization

### Authentication:
Use the `/auth/token` endpoint to obtain a JWT token.

**Test Credentials:**
- Email: `admin@aerisq.tech`
- Password: `password123`
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# ===== CORS MIDDLEWARE =====
# Critical for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS + ["*"],  # Include wildcard for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)


# ===== INCLUDE ROUTERS =====
from app.api.auth import router as auth_router
from app.api.v1.analyze import router as analyze_router
from app.api.v1.jobs import router as jobs_router

app.include_router(auth_router)
app.include_router(analyze_router)
app.include_router(jobs_router)


# ===== ROOT ENDPOINTS =====
@app.get("/", tags=["Health"])
def read_root():
    """
    Root endpoint - API health check
    """
    return {
        "service": "AerisQ API",
        "version": settings.APP_VERSION,
        "status": "operational",
        "message": "Physics-Based Radar Analysis Platform Active",
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
def health_check():
    """
    Health check endpoint for monitoring
    """
    return {
        "status": "healthy",
        "service": "aerisq-backend",
        "version": settings.APP_VERSION
    }


@app.get("/api/v1/legend", tags=["Analysis"])
def get_drought_legend():
    """
    Get drought severity legend for frontend map
    """
    from app.agents.cartographer import cartographer
    return {
        "legend": cartographer.create_legend(),
        "threshold_db": settings.DROUGHT_THRESHOLD_DB
    }


# ===== ERROR HANDLERS =====
from fastapi import Request
from fastapi.responses import JSONResponse


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler for unhandled errors"""
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An unexpected error occurred"
        }
    )
