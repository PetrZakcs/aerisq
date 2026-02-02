"""
Celery Tasks
Async tasks for the analysis pipeline
"""
import asyncio
from datetime import datetime
from typing import Dict, Any
import logging

from celery import shared_task

from app.workers.celery_app import celery_app
from app.agents.scout import scout
from app.agents.physicist import physicist
from app.agents.analyst import analyst
from app.agents.cartographer import cartographer
from app.db.database import SessionLocal
from app.models.job import AnalysisJob
from app.schemas.job import JobStatus

logger = logging.getLogger(__name__)


def run_async(coro):
    """Helper to run async functions in sync context"""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(bind=True, name="app.workers.tasks.run_analysis_pipeline")
def run_analysis_pipeline(
    self,
    job_id: str,
    polygon: Dict[str, Any],
    date_start: str,
    date_end: str
) -> Dict[str, Any]:
    """
    Main analysis pipeline task
    Orchestrates the 4 agents: Scout → Physicist → Analyst → Cartographer
    
    Args:
        job_id: UUID of the analysis job
        polygon: GeoJSON geometry
        date_start: Start date (YYYY-MM-DD)
        date_end: End date (YYYY-MM-DD)
        
    Returns:
        Analysis result dictionary
    """
    logger.info(f"Starting analysis pipeline for job {job_id}")
    
    db = SessionLocal()
    
    try:
        # Update job status to PROCESSING
        job = db.query(AnalysisJob).filter(AnalysisJob.id == job_id).first()
        if job:
            job.status = JobStatus.PROCESSING
            job.celery_task_id = self.request.id
            db.commit()
        
        # ===== AGENT 1: THE SCOUT =====
        logger.info(f"[Job {job_id}] Agent 1 (Scout) - Fetching Sentinel-1 data")
        
        # Convert polygon to WKT for CDSE query
        coords = polygon.get("coordinates", [[]])[0]
        wkt_coords = ", ".join([f"{c[0]} {c[1]}" for c in coords])
        polygon_wkt = f"POLYGON(({wkt_coords}))"
        
        # Search for Sentinel-1 products (async)
        products = run_async(
            scout.search_sentinel1(polygon_wkt, date_start, date_end)
        )
        logger.info(f"[Job {job_id}] Scout found {len(products)} products")
        
        # ===== AGENT 2: THE PHYSICIST =====
        logger.info(f"[Job {job_id}] Agent 2 (Physicist) - Processing radar data")
        
        # In demo mode, generate simulated analysis
        # In production, this would process actual GeoTIFF data
        coords_for_analysis = polygon.get("coordinates", [[]])
        result = physicist.generate_demo_analysis(
            polygon_coords=coords_for_analysis,
            seed=hash(job_id) % 10000  # Deterministic seed from job ID
        )
        
        logger.info(
            f"[Job {job_id}] Physicist result: "
            f"mean={result.mean_sigma0_db}dB, drought={result.drought_percentage}%"
        )
        
        # ===== AGENT 3: THE ANALYST =====
        logger.info(f"[Job {job_id}] Agent 3 (Analyst) - Generating summary")
        
        summary = run_async(
            analyst.generate_summary(
                result=result,
                location_name="Analyzed Region",
                date_range=f"{date_start} to {date_end}"
            )
        )
        
        # ===== AGENT 4: THE CARTOGRAPHER =====
        logger.info(f"[Job {job_id}] Agent 4 (Cartographer) - Creating GeoJSON")
        
        result_geojson = cartographer.create_result_geojson(
            original_polygon=polygon,
            result=result,
            job_id=job_id,
            date_range={"start": date_start, "end": date_end}
        )
        
        formatted_stats = cartographer.format_stats_for_frontend(result)
        
        # ===== UPDATE DATABASE =====
        if job:
            job.status = JobStatus.COMPLETED
            job.completed_at = datetime.utcnow()
            job.mean_sigma0_db = result.mean_sigma0_db
            job.min_sigma0_db = result.min_sigma0_db
            job.max_sigma0_db = result.max_sigma0_db
            job.drought_percentage = result.drought_percentage
            job.drought_severity = result.drought_severity
            job.area_km2 = result.area_km2
            job.summary = summary
            job.result_geojson = result_geojson
            # In production: job.result_url = upload_geotiff_to_storage(...)
            db.commit()
        
        logger.info(f"[Job {job_id}] Pipeline completed successfully")
        
        return {
            "success": True,
            "job_id": job_id,
            "status": "completed",
            "stats": formatted_stats,
            "summary": summary,
            "geojson": result_geojson
        }
        
    except Exception as e:
        logger.error(f"[Job {job_id}] Pipeline failed: {str(e)}")
        
        if job:
            job.status = JobStatus.FAILED
            job.error_message = str(e)
            db.commit()
        
        return {
            "success": False,
            "job_id": job_id,
            "status": "failed",
            "error": str(e)
        }
        
    finally:
        db.close()


@celery_app.task(name="app.workers.tasks.fetch_sentinel_data")
def fetch_sentinel_data(product_id: str, job_id: str) -> Dict[str, Any]:
    """
    Fetch Sentinel-1 data for a specific product
    (Separated task for potential parallel processing)
    """
    logger.info(f"Fetching Sentinel-1 product {product_id} for job {job_id}")
    
    download_url = run_async(scout.get_download_url(product_id))
    
    return {
        "product_id": product_id,
        "download_url": download_url,
        "status": "ready"
    }
