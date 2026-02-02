"""
AerisQ Configuration Settings
Environment-based configuration using Pydantic Settings
"""
from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    APP_NAME: str = "AerisQ API"
    APP_VERSION: str = "3.0.0"
    DEBUG: bool = False
    
    # Security
    SECRET_KEY: str = "aerisq-super-secret-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # CORS - Frontend origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://aerisq-frontend.vercel.app",
        "https://aerisq.vercel.app",
    ]
    
    # Database
    DATABASE_URL: str = "postgresql://aeris:password@db:5432/aerisq"
    
    # Redis / Celery
    CELERY_BROKER_URL: str = "redis://redis:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/0"
    
    # CDSE (Copernicus Data Space Ecosystem) API
    CDSE_CLIENT_ID: str = ""
    CDSE_CLIENT_SECRET: str = ""
    CDSE_TOKEN_URL: str = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
    CDSE_CATALOG_URL: str = "https://catalogue.dataspace.copernicus.eu/odata/v1"
    
    # OpenAI (for Analyst Agent)
    OPENAI_API_KEY: str = ""
    
    # Physics Engine Thresholds
    DROUGHT_THRESHOLD_DB: float = -3.0  # Sigma0 below this = drought indicator
    
    # God Mode Test User (for development/testing)
    GOD_MODE_EMAIL: str = "admin@aerisq.tech"
    GOD_MODE_PASSWORD: str = "password123"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance"""
    return Settings()


# Export settings instance
settings = get_settings()
