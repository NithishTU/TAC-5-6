"""
Application configuration settings
"""

from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Application
    APP_ENV: str = Field(default="development", description="Application environment")
    DEBUG: bool = Field(default=True, description="Debug mode")
    SECRET_KEY: str = Field(default="dev-secret-key-change-in-production", description="Secret key for JWT")
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:5173", "http://localhost:3000"],
        description="CORS allowed origins"
    )
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")

    # Database
    DATABASE_URL: str = Field(
        default="sqlite:///./devdash.db",
        description="Database connection URL"
    )

    # JWT
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=15, description="Access token expiration")
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7, description="Refresh token expiration")
    ALGORITHM: str = Field(default="HS256", description="JWT algorithm")

    # GitHub OAuth
    GITHUB_CLIENT_ID: str = Field(default="", description="GitHub OAuth client ID")
    GITHUB_CLIENT_SECRET: str = Field(default="", description="GitHub OAuth client secret")
    GITHUB_REDIRECT_URI: str = Field(
        default="http://localhost:8000/api/auth/github/callback",
        description="GitHub OAuth redirect URI"
    )

    # Redis (for Celery)
    REDIS_URL: str = Field(default="redis://localhost:6379/0", description="Redis connection URL")

    # Cloudflare R2 (optional)
    CLOUDFLARE_R2_ACCOUNT_ID: str = Field(default="", description="Cloudflare R2 account ID")
    CLOUDFLARE_R2_ACCESS_KEY: str = Field(default="", description="Cloudflare R2 access key")
    CLOUDFLARE_R2_SECRET_KEY: str = Field(default="", description="Cloudflare R2 secret key")
    CLOUDFLARE_R2_BUCKET_NAME: str = Field(default="devdash-screenshots", description="R2 bucket name")

    # ADW Configuration
    CLAUDE_CODE_PATH: str = Field(default="", description="Path to Claude Code CLI")
    GITHUB_PAT: str = Field(default="", description="GitHub Personal Access Token")

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=100, description="API rate limit per minute")

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
