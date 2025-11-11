"""
Time tracking router - Timer and time entry management
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from core.database import get_db
from core.schemas import (
    TimeEntryCreate,
    TimeEntryStart,
    TimeEntryStop,
    TimeEntryResponse,
    TimeSummary
)
from core.models import TimeEntry, Task

router = APIRouter()


@router.post("/start", response_model=TimeEntryResponse, status_code=status.HTTP_201_CREATED)
async def start_timer(timer_data: TimeEntryStart, db: Session = Depends(get_db)):
    """
    Start a new timer

    Stops any existing running timer for the user before starting new one
    """
    # TODO: Get current user ID from JWT token
    current_user_id = "placeholder-user-id"

    # Stop any existing running timer
    existing_timer = db.query(TimeEntry).filter(
        TimeEntry.user_id == current_user_id,
        TimeEntry.is_running == True
    ).first()

    if existing_timer:
        existing_timer.end_time = datetime.utcnow()
        existing_timer.duration = int((existing_timer.end_time - existing_timer.start_time).total_seconds())
        existing_timer.is_running = False

    # Create new timer
    time_entry = TimeEntry(
        task_id=timer_data.task_id,
        user_id=current_user_id,
        start_time=datetime.utcnow(),
        is_running=True
    )

    db.add(time_entry)
    db.commit()
    db.refresh(time_entry)

    return time_entry


@router.post("/stop", response_model=TimeEntryResponse)
async def stop_timer(db: Session = Depends(get_db)):
    """
    Stop the currently running timer
    """
    # TODO: Get current user ID from JWT token
    current_user_id = "placeholder-user-id"

    time_entry = db.query(TimeEntry).filter(
        TimeEntry.user_id == current_user_id,
        TimeEntry.is_running == True
    ).first()

    if not time_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No running timer found"
        )

    time_entry.end_time = datetime.utcnow()
    time_entry.duration = int((time_entry.end_time - time_entry.start_time).total_seconds())
    time_entry.is_running = False

    db.commit()
    db.refresh(time_entry)

    return time_entry


@router.get("/entries", response_model=List[TimeEntryResponse])
async def get_time_entries(
    task_id: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get time entries with optional filtering

    Filters:
    - task_id: Filter by task
    - start_date: Filter entries after this date
    - end_date: Filter entries before this date
    """
    # TODO: Get current user ID from JWT token
    current_user_id = "placeholder-user-id"

    query = db.query(TimeEntry).filter(TimeEntry.user_id == current_user_id)

    if task_id:
        query = query.filter(TimeEntry.task_id == task_id)

    if start_date:
        query = query.filter(TimeEntry.start_time >= start_date)

    if end_date:
        query = query.filter(TimeEntry.start_time <= end_date)

    entries = query.order_by(TimeEntry.start_time.desc()).all()
    return entries


@router.post("/entries", response_model=TimeEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_time_entry(entry_data: TimeEntryCreate, db: Session = Depends(get_db)):
    """
    Create a manual time entry
    """
    # TODO: Get current user ID from JWT token
    current_user_id = "placeholder-user-id"

    # Calculate duration if end_time provided
    duration = None
    if entry_data.end_time:
        duration = int((entry_data.end_time - entry_data.start_time).total_seconds())

    time_entry = TimeEntry(
        task_id=entry_data.task_id,
        user_id=current_user_id,
        start_time=entry_data.start_time,
        end_time=entry_data.end_time,
        duration=duration or entry_data.duration,
        is_running=False
    )

    db.add(time_entry)
    db.commit()
    db.refresh(time_entry)

    return time_entry


@router.get("/summary", response_model=TimeSummary)
async def get_time_summary(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get time tracking summary

    Returns total duration, entries, and breakdowns by task and date
    """
    # TODO: Get current user ID from JWT token
    current_user_id = "placeholder-user-id"

    # Default to last 7 days if no dates provided
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = end_date - timedelta(days=7)

    entries = db.query(TimeEntry).filter(
        TimeEntry.user_id == current_user_id,
        TimeEntry.start_time >= start_date,
        TimeEntry.start_time <= end_date,
        TimeEntry.duration.isnot(None)
    ).all()

    # Calculate total duration
    total_duration = sum(entry.duration or 0 for entry in entries)

    # Group by task
    by_task = {}
    for entry in entries:
        task_id = entry.task_id or "no_task"
        by_task[task_id] = by_task.get(task_id, 0) + (entry.duration or 0)

    # Group by date
    by_date = {}
    for entry in entries:
        date_key = entry.start_time.date().isoformat()
        by_date[date_key] = by_date.get(date_key, 0) + (entry.duration or 0)

    return TimeSummary(
        total_duration=total_duration,
        entries=entries,
        by_task=by_task,
        by_date=by_date
    )
