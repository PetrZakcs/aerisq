"""
Authentication API Endpoints
Handles user login and JWT token generation
"""
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.security import (
    verify_password,
    create_access_token,
    get_current_user,
    GOD_MODE_PASSWORD_HASH,
)
from app.schemas.auth import Token, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Token:
    """
    OAuth2 compatible token login endpoint.
    
    Authenticates user and returns JWT access token.
    Currently uses hardcoded "God Mode" user for testing.
    
    - **username**: User email (admin@aerisq.tech for testing)
    - **password**: User password (password123 for testing)
    
    Returns JWT token on success.
    """
    # God Mode Authentication (for founder testing)
    if form_data.username == settings.GOD_MODE_EMAIL:
        if not verify_password(form_data.password, GOD_MODE_PASSWORD_HASH):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create access token for God Mode user
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": settings.GOD_MODE_EMAIL,
                "user_id": "god-mode-user-001",
                "role": "admin"
            },
            expires_delta=access_token_expires,
        )
        
        return Token(access_token=access_token, token_type="bearer")
    
    # TODO: Implement database user lookup
    # For now, reject all other users
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user)
) -> UserResponse:
    """
    Get current authenticated user information.
    
    Requires valid JWT token in Authorization header.
    """
    return UserResponse(
        email=current_user["email"],
        is_active=True
    )


@router.post("/verify")
async def verify_token(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Verify that a token is valid.
    
    Returns user info if token is valid, 401 if invalid.
    """
    return {
        "valid": True,
        "email": current_user["email"],
        "user_id": current_user.get("user_id")
    }
