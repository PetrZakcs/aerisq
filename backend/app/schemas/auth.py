"""
Authentication Schemas
Pydantic models for auth request/response validation
"""
from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    """JWT Token response schema"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token payload data"""
    email: str | None = None
    user_id: str | None = None


class UserLogin(BaseModel):
    """User login request schema"""
    username: str  # Can be email
    password: str


class UserResponse(BaseModel):
    """User response schema"""
    email: str
    is_active: bool = True
    
    class Config:
        from_attributes = True
