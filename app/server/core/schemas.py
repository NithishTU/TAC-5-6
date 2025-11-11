"""
Pydantic schemas for request/response validation
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime


# ============================================================================
# User Schemas
# ============================================================================

class UserBase(BaseModel):
    """Base user schema"""
    username: str = Field(..., min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    avatar_url: Optional[str] = None


class UserCreate(UserBase):
    """User creation schema"""
    github_id: Optional[int] = None
    github_token: Optional[str] = None


class UserResponse(UserBase):
    """User response schema"""
    id: str
    github_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Task Schemas
# ============================================================================

class TaskBase(BaseModel):
    """Base task schema"""
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    status: str = Field(default="backlog", pattern="^(backlog|todo|in_progress|in_review|done)$")
    labels: Optional[List[str]] = Field(default_factory=list)
    assignee_id: Optional[str] = None


class TaskCreate(TaskBase):
    """Task creation schema"""
    pass


class TaskUpdate(BaseModel):
    """Task update schema (all fields optional)"""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(backlog|todo|in_progress|in_review|done)$")
    labels: Optional[List[str]] = None
    assignee_id: Optional[str] = None
    position: Optional[int] = None


class TaskMove(BaseModel):
    """Task move schema"""
    status: str = Field(..., pattern="^(backlog|todo|in_progress|in_review|done)$")
    position: Optional[int] = None


class TaskResponse(TaskBase):
    """Task response schema"""
    id: str
    created_by: str
    position: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    assignee: Optional[UserResponse] = None

    class Config:
        from_attributes = True


# ============================================================================
# Time Entry Schemas
# ============================================================================

class TimeEntryBase(BaseModel):
    """Base time entry schema"""
    task_id: Optional[str] = None


class TimeEntryCreate(TimeEntryBase):
    """Time entry creation (manual entry)"""
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[int] = Field(None, ge=0, description="Duration in seconds")


class TimeEntryStart(BaseModel):
    """Start timer schema"""
    task_id: Optional[str] = None


class TimeEntryStop(BaseModel):
    """Stop timer schema"""
    pass


class TimeEntryResponse(TimeEntryBase):
    """Time entry response schema"""
    id: str
    user_id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[int] = None
    is_running: bool
    created_at: datetime
    task: Optional[TaskResponse] = None

    class Config:
        from_attributes = True


class TimeSummary(BaseModel):
    """Time summary response"""
    total_duration: int = Field(..., description="Total duration in seconds")
    entries: List[TimeEntryResponse]
    by_task: dict = Field(default_factory=dict, description="Duration grouped by task")
    by_date: dict = Field(default_factory=dict, description="Duration grouped by date")


# ============================================================================
# Sprint Schemas
# ============================================================================

class SprintBase(BaseModel):
    """Base sprint schema"""
    name: str = Field(..., min_length=1, max_length=255)
    start_date: datetime
    end_date: datetime
    goal: Optional[str] = None
    status: str = Field(default="planning", pattern="^(planning|active|completed)$")


class SprintCreate(SprintBase):
    """Sprint creation schema"""
    pass


class SprintUpdate(BaseModel):
    """Sprint update schema (all fields optional)"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    goal: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(planning|active|completed)$")


class SprintTaskCreate(BaseModel):
    """Add task to sprint schema"""
    task_id: str
    story_points: Optional[int] = Field(None, ge=0)


class SprintResponse(SprintBase):
    """Sprint response schema"""
    id: str
    created_at: datetime
    tasks: Optional[List[TaskResponse]] = None

    class Config:
        from_attributes = True


# ============================================================================
# GitHub Schemas
# ============================================================================

class GitHubPRBase(BaseModel):
    """Base GitHub PR schema"""
    pr_number: int
    repository: str
    title: Optional[str] = None
    status: Optional[str] = None


class GitHubPRResponse(GitHubPRBase):
    """GitHub PR response schema"""
    id: str
    author_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    merged_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GitHubSyncRequest(BaseModel):
    """GitHub sync request schema"""
    sync_type: str = Field(..., pattern="^(prs|commits|issues|all)$")


class GitHubSyncResponse(BaseModel):
    """GitHub sync response schema"""
    status: str
    synced_at: datetime
    items_synced: int
    errors: Optional[List[str]] = None


# ============================================================================
# Analytics Schemas
# ============================================================================

class VelocityDataPoint(BaseModel):
    """Velocity chart data point"""
    sprint_name: str
    tasks_completed: int
    story_points: int
    date: datetime


class VelocityResponse(BaseModel):
    """Velocity chart response"""
    data_points: List[VelocityDataPoint]
    average_velocity: float


class BurndownDataPoint(BaseModel):
    """Burndown chart data point"""
    date: datetime
    remaining_points: int
    ideal_remaining: int


class BurndownResponse(BaseModel):
    """Burndown chart response"""
    sprint_id: str
    sprint_name: str
    data_points: List[BurndownDataPoint]


class CommitFrequency(BaseModel):
    """Commit frequency data"""
    date: datetime
    commit_count: int
    contributors: List[str]


class PRMetrics(BaseModel):
    """PR cycle time metrics"""
    pr_id: str
    pr_number: int
    repository: str
    time_to_merge: Optional[int] = Field(None, description="Time to merge in hours")
    time_to_first_review: Optional[int] = Field(None, description="Time to first review in hours")
    review_count: int


class AnalyticsSummary(BaseModel):
    """Overall analytics summary"""
    total_tasks: int
    completed_tasks: int
    active_tasks: int
    total_time_logged: int = Field(..., description="Total time in seconds")
    average_cycle_time: Optional[float] = Field(None, description="Average task cycle time in hours")


# ============================================================================
# Authentication Schemas
# ============================================================================

class Token(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    """Token refresh request"""
    refresh_token: str


class GitHubOAuthCallback(BaseModel):
    """GitHub OAuth callback data"""
    code: str
    state: Optional[str] = None


# ============================================================================
# WebSocket Schemas
# ============================================================================

class WSMessage(BaseModel):
    """WebSocket message schema"""
    type: str
    data: Optional[dict] = None


class WSTimerUpdate(BaseModel):
    """WebSocket timer update message"""
    type: str = "timer:tick"
    task_id: str
    elapsed: int = Field(..., description="Elapsed time in seconds")


class WSTaskUpdate(BaseModel):
    """WebSocket task update message"""
    type: str = "task:updated"
    task: TaskResponse
