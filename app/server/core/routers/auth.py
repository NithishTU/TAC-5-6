"""
Authentication router - GitHub OAuth and JWT token management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from core.schemas import Token, UserResponse, GitHubOAuthCallback
from core.models import User

router = APIRouter()


@router.post("/github/callback", response_model=Token)
async def github_oauth_callback(callback_data: GitHubOAuthCallback, db: Session = Depends(get_db)):
    """
    GitHub OAuth callback endpoint

    Exchanges OAuth code for access token and creates/updates user
    """
    # TODO: Implement GitHub OAuth flow
    # 1. Exchange code for GitHub access token
    # 2. Fetch user data from GitHub API
    # 3. Create or update user in database
    # 4. Generate JWT tokens

    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="GitHub OAuth not yet implemented"
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token: str):
    """
    Refresh JWT access token
    """
    # TODO: Implement token refresh logic
    # 1. Validate refresh token
    # 2. Generate new access token
    # 3. Return new token pair

    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Token refresh not yet implemented"
    )


@router.post("/logout")
async def logout():
    """
    Logout user (invalidate tokens)
    """
    # TODO: Implement logout logic
    # 1. Invalidate refresh token
    # 2. Add to token blacklist if using

    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user(db: Session = Depends(get_db)):
    """
    Get current authenticated user
    """
    # TODO: Implement current user extraction from JWT
    # 1. Extract user ID from JWT token
    # 2. Fetch user from database
    # 3. Return user data

    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="User authentication not yet implemented"
    )


@router.get("/users", response_model=List[UserResponse])
async def list_users(db: Session = Depends(get_db)):
    """
    List all users

    This endpoint is used for populating assignee dropdowns and filters.
    """
    users = db.query(User).order_by(User.username).all()
    return users
