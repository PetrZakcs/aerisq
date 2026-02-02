"""
Jobs API Endpoints
GET /api/v1/jobs/{job_id} - Get job status and results
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.job import AnalysisJob
from app.schemas.job import JobResult, JobStatus, DroughtStats

router = APIRouter(prefix="/api/v1/jobs", tags=["Jobs"])


@router.get("/{job_id}", response_model=JobResult)
async def get_job_status(
    job_id: str,
    current_user: Optional[dict] = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> JobResult:
    """
    Get the status and results of an analysis job.
    
    - **job_id**: UUID of the analysis job
    
    Returns job status and results when completed.
    """
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job {job_id} not found"
        )
    
    # Build response based on job status
    result = JobResult(
        job_id=str(job.id),
        status=job.status,
        created_at=job.created_at,
        completed_at=job.completed_at
    )
    
    if job.status == JobStatus.COMPLETED:
        result.stats = DroughtStats(
            mean_sigma0_db=job.mean_sigma0_db or 0.0,
            min_sigma0_db=job.min_sigma0_db or 0.0,
            max_sigma0_db=job.max_sigma0_db or 0.0,
            drought_percentage=job.drought_percentage or 0.0,
            drought_severity=job.drought_severity or "UNKNOWN",
            area_km2=job.area_km2 or 0.0
        )
        result.summary = job.summary
        result.result_url = job.result_url
        result.geojson = job.result_geojson
    
    elif job.status == JobStatus.FAILED:
        result.error_message = job.error_message
    
    return result


@router.get("/{job_id}/public")
async def get_job_status_public(
    job_id: str,
    db: Session = Depends(get_db)
) -> JobResult:
    """
    Get job status without authentication (for demo purposes).
    """
    job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job {job_id} not found"
        )
    
    result = JobResult(
        job_id=str(job.id),
        status=job.status,
        created_at=job.created_at,
        completed_at=job.completed_at
    )
    
    if job.status == JobStatus.COMPLETED:
        result.stats = DroughtStats(
            mean_sigma0_db=job.mean_sigma0_db or 0.0,
            min_sigma0_db=job.min_sigma0_db or 0.0,
            max_sigma0_db=job.max_sigma0_db or 0.0,
            drought_percentage=job.drought_percentage or 0.0,
            drought_severity=job.drought_severity or "UNKNOWN",
            area_km2=job.area_km2 or 0.0
        )
        result.summary = job.summary
        result.result_url = job.result_url
        result.geojson = job.result_geojson
    
    elif job.status == JobStatus.FAILED:
        result.error_message = job.error_message
    
    return result


@router.get("/")
async def list_user_jobs(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = 10,
    offset: int = 0
):
    """
    List all jobs for the current user.
    """
    user_id = current_user.get("user_id")
    
    jobs = (
        db.query(AnalysisJob)
        .filter(AnalysisJob.user_id == user_id)
        .order_by(AnalysisJob.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    
    return {
        "jobs": [
            {
                "job_id": str(job.id),
                "status": job.status,
                "created_at": job.created_at.isoformat(),
                "drought_severity": job.drought_severity
            }
            for job in jobs
        ],
        "total": db.query(AnalysisJob).filter(AnalysisJob.user_id == user_id).count(),
        "limit": limit,
        "offset": offset
    }
