"""
Analysis Job Schemas
Pydantic models for analysis job request/response validation
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field


class JobStatus(str, Enum):
    """Job processing status enumeration"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class GeoJSONGeometry(BaseModel):
    """GeoJSON Geometry schema"""
    type: str = Field(..., description="Geometry type (Polygon, MultiPolygon)")
    coordinates: List[Any] = Field(..., description="Coordinate array")


class GeoJSONFeature(BaseModel):
    """GeoJSON Feature schema"""
    type: str = "Feature"
    geometry: GeoJSONGeometry
    properties: Optional[Dict[str, Any]] = None


class DateRange(BaseModel):
    """Date range for analysis"""
    start: str = Field(..., description="Start date (YYYY-MM-DD)")
    end: str = Field(..., description="End date (YYYY-MM-DD)")


class AnalyzeRequest(BaseModel):
    """
    Analysis request schema
    Input from Frontend to trigger analysis pipeline
    """
    polygon: GeoJSONGeometry = Field(
        ..., 
        description="GeoJSON Polygon geometry defining the area of interest"
    )
    date_range: DateRange = Field(
        ..., 
        description="Date range for Sentinel-1 data query"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "polygon": {
                    "type": "Polygon",
                    "coordinates": [[[35.0, 31.5], [35.5, 31.5], [35.5, 32.0], [35.0, 32.0], [35.0, 31.5]]]
                },
                "date_range": {
                    "start": "2024-01-01",
                    "end": "2024-01-31"
                }
            }
        }


class AnalyzeResponse(BaseModel):
    """Analysis job creation response"""
    job_id: str = Field(..., description="Unique job identifier (UUID)")
    message: str = "Analysis job queued successfully"
    status: JobStatus = JobStatus.PENDING


class DroughtStats(BaseModel):
    """Drought statistics from physics engine"""
    mean_sigma0_db: float = Field(..., description="Mean backscatter in dB")
    min_sigma0_db: float = Field(..., description="Minimum backscatter in dB")
    max_sigma0_db: float = Field(..., description="Maximum backscatter in dB")
    drought_percentage: float = Field(..., description="Percentage of area below threshold")
    drought_severity: str = Field(..., description="Severity classification")
    area_km2: float = Field(..., description="Total analyzed area in km²")


class JobResult(BaseModel):
    """Complete job result response"""
    job_id: str
    status: JobStatus
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    # Results (populated when completed)
    result_url: Optional[str] = Field(None, description="URL to GeoTIFF result")
    stats: Optional[DroughtStats] = None
    summary: Optional[str] = Field(None, description="AI-generated analysis summary")
    geojson: Optional[Dict[str, Any]] = Field(None, description="Result GeoJSON for map overlay")
    
    # Error info (if failed)
    error_message: Optional[str] = None
    
    class Config:
        from_attributes = True
