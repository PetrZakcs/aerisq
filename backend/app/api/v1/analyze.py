"""
Analysis API Endpoints
POST /api/v1/analyze - Trigger analysis pipeline
"""
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from shapely.geometry import shape
from shapely import wkt

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.job import AnalysisJob
from app.schemas.job import AnalyzeRequest, AnalyzeResponse, JobStatus
from app.workers.tasks import run_analysis_pipeline

router = APIRouter(prefix="/api/v1", tags=["Analysis"])


@router.post("/analyze", response_model=AnalyzeResponse)
async def create_analysis(
    request: AnalyzeRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> AnalyzeResponse:
    """
    Create a new analysis job.
    
    Triggers the processing pipeline for Sentinel-1 drought analysis.
    
    - **polygon**: GeoJSON Polygon geometry defining the area of interest
    - **date_range**: Start and end dates for Sentinel-1 data query
    
    Returns a job ID that can be used to track progress and retrieve results.
    """
    # Validate geometry
    try:
        geom = shape(request.polygon.model_dump())
        if not geom.is_valid:
            raise ValueError("Invalid geometry")
        polygon_wkt = wkt.dumps(geom)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid GeoJSON polygon: {str(e)}"
        )
    
    # Validate date range
    try:
        date_start = datetime.strptime(request.date_range.start, "%Y-%m-%d")
        date_end = datetime.strptime(request.date_range.end, "%Y-%m-%d")
        
        if date_end < date_start:
            raise ValueError("End date must be after start date")
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid date range: {str(e)}"
        )
    
    # Create job record
    job_id = str(uuid.uuid4())
    
    new_job = AnalysisJob(
        id=job_id,
        user_id=current_user.get("user_id", "anonymous"),
        status=JobStatus.PENDING,
        polygon=f"SRID=4326;{polygon_wkt}",
        date_start=date_start,
        date_end=date_end,
        input_geojson=request.polygon.model_dump()
    )
    
    db.add(new_job)
    db.commit()
    
    # Queue the analysis task
    run_analysis_pipeline.delay(
        job_id=job_id,
        polygon=request.polygon.model_dump(),
        date_start=request.date_range.start,
        date_end=request.date_range.end
    )
    
    return AnalyzeResponse(
        job_id=job_id,
        message="Analysis job queued successfully. Check status at /api/v1/jobs/{job_id}",
        status=JobStatus.PENDING
    )


@router.post("/analyze/demo", response_model=AnalyzeResponse)
async def create_demo_analysis(
    request: AnalyzeRequest,
    db: Session = Depends(get_db)
) -> AnalyzeResponse:
    """
    Create a demo analysis job (no authentication required).
    
    This endpoint is for testing the frontend integration without login.
    Uses the same pipeline but with demo data.
    """
    # Validate geometry
    try:
        geom = shape(request.polygon.model_dump())
        if not geom.is_valid:
            raise ValueError("Invalid geometry")
        polygon_wkt = wkt.dumps(geom)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid GeoJSON polygon: {str(e)}"
        )
    
    # Create job with demo user
    job_id = str(uuid.uuid4())
    
    try:
        date_start = datetime.strptime(request.date_range.start, "%Y-%m-%d")
        date_end = datetime.strptime(request.date_range.end, "%Y-%m-%d")
    except ValueError:
        date_start = datetime.now()
        date_end = datetime.now()
    
    new_job = AnalysisJob(
        id=job_id,
        user_id="demo-user",
        status=JobStatus.PENDING,
        polygon=f"SRID=4326;{polygon_wkt}",
        date_start=date_start,
        date_end=date_end,
        input_geojson=request.polygon.model_dump()
    )
    
    db.add(new_job)
    db.commit()
    
    # Queue the analysis task
    run_analysis_pipeline.delay(
        job_id=job_id,
        polygon=request.polygon.model_dump(),
        date_start=request.date_range.start,
        date_end=request.date_range.end
    )
    
    return AnalyzeResponse(
        job_id=job_id,
        message="Demo analysis job queued. Check status at /api/v1/jobs/{job_id}",
        status=JobStatus.PENDING
    )
