"""
Analysis Job Database Model
Stores job metadata and results
"""
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Float, Text, Enum as SQLEnum, JSON
from sqlalchemy.dialects.postgresql import UUID
from geoalchemy2 import Geometry

from app.db.database import Base
from app.schemas.job import JobStatus


class AnalysisJob(Base):
    """
    Analysis Job model for tracking Sentinel-1 analysis tasks
    """
    __tablename__ = "analysis_jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(100), nullable=False, index=True)
    
    # Job status tracking
    status = Column(
        SQLEnum(JobStatus), 
        default=JobStatus.PENDING, 
        nullable=False,
        index=True
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Input parameters
    polygon = Column(Geometry('POLYGON', srid=4326), nullable=False)
    date_start = Column(DateTime, nullable=False)
    date_end = Column(DateTime, nullable=False)
    input_geojson = Column(JSON, nullable=True)  # Store original GeoJSON
    
    # Results
    result_url = Column(String(500), nullable=True)  # GeoTIFF URL
    result_geojson = Column(JSON, nullable=True)  # Output GeoJSON for map
    
    # Statistics from physics engine
    mean_sigma0_db = Column(Float, nullable=True)
    min_sigma0_db = Column(Float, nullable=True)
    max_sigma0_db = Column(Float, nullable=True)
    drought_percentage = Column(Float, nullable=True)
    drought_severity = Column(String(50), nullable=True)
    area_km2 = Column(Float, nullable=True)
    
    # AI-generated summary
    summary = Column(Text, nullable=True)
    
    # Error tracking
    error_message = Column(Text, nullable=True)
    celery_task_id = Column(String(100), nullable=True)
    
    def __repr__(self):
        return f"<AnalysisJob {self.id} - {self.status}>"
