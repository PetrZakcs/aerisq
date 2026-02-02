"""
Celery Application Configuration
Async task queue for processing Sentinel-1 analysis jobs
"""
from celery import Celery

from app.core.config import settings

# Create Celery app
celery_app = Celery(
    "aerisq",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=["app.workers.tasks"]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    
    # Task settings
    task_track_started=True,
    task_time_limit=600,  # 10 minutes max per task
    task_soft_time_limit=540,  # Soft limit at 9 minutes
    
    # Result settings
    result_expires=86400,  # Results expire after 24 hours
    
    # Worker settings
    worker_prefetch_multiplier=1,
    worker_concurrency=2,
)

# Task routes (optional - for scaling)
celery_app.conf.task_routes = {
    "app.workers.tasks.run_analysis_pipeline": {"queue": "analysis"},
    "app.workers.tasks.fetch_sentinel_data": {"queue": "data"},
}
