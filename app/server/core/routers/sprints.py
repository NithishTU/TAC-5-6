"""
Sprints router - Sprint planning and management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from core.schemas import (
    SprintCreate,
    SprintUpdate,
    SprintResponse,
    SprintTaskCreate
)
from core.models import Sprint, Task, SprintTask

router = APIRouter()


@router.get("/", response_model=List[SprintResponse])
async def list_sprints(db: Session = Depends(get_db)):
    """
    List all sprints

    Returns sprints ordered by start date (most recent first)
    """
    sprints = db.query(Sprint).order_by(Sprint.start_date.desc()).all()
    return sprints


@router.post("/", response_model=SprintResponse, status_code=status.HTTP_201_CREATED)
async def create_sprint(sprint_data: SprintCreate, db: Session = Depends(get_db)):
    """
    Create a new sprint
    """
    # Validate dates
    if sprint_data.end_date <= sprint_data.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date must be after start date"
        )

    sprint = Sprint(**sprint_data.model_dump())

    db.add(sprint)
    db.commit()
    db.refresh(sprint)

    return sprint


@router.get("/{sprint_id}", response_model=SprintResponse)
async def get_sprint(sprint_id: str, db: Session = Depends(get_db)):
    """
    Get sprint by ID

    Returns sprint details with associated tasks
    """
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()

    if not sprint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sprint with ID {sprint_id} not found"
        )

    return sprint


@router.patch("/{sprint_id}", response_model=SprintResponse)
async def update_sprint(
    sprint_id: str,
    sprint_data: SprintUpdate,
    db: Session = Depends(get_db)
):
    """
    Update sprint
    """
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()

    if not sprint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sprint with ID {sprint_id} not found"
        )

    # Update only provided fields
    for field, value in sprint_data.model_dump(exclude_unset=True).items():
        setattr(sprint, field, value)

    # Validate dates if both are present
    if sprint.end_date <= sprint.start_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End date must be after start date"
        )

    db.commit()
    db.refresh(sprint)

    return sprint


@router.delete("/{sprint_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sprint(sprint_id: str, db: Session = Depends(get_db)):
    """
    Delete sprint

    Also removes task associations but does not delete the tasks
    """
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()

    if not sprint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sprint with ID {sprint_id} not found"
        )

    db.delete(sprint)
    db.commit()

    return None


@router.post("/{sprint_id}/tasks", status_code=status.HTTP_201_CREATED)
async def add_task_to_sprint(
    sprint_id: str,
    task_data: SprintTaskCreate,
    db: Session = Depends(get_db)
):
    """
    Add task to sprint with story points
    """
    # Verify sprint exists
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sprint with ID {sprint_id} not found"
        )

    # Verify task exists
    task = db.query(Task).filter(Task.id == task_data.task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_data.task_id} not found"
        )

    # Check if task already in sprint
    existing = db.query(SprintTask).filter(
        SprintTask.sprint_id == sprint_id,
        SprintTask.task_id == task_data.task_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Task already in sprint"
        )

    # Add task to sprint
    sprint_task = SprintTask(
        sprint_id=sprint_id,
        task_id=task_data.task_id,
        story_points=task_data.story_points
    )

    db.add(sprint_task)
    db.commit()

    return {"message": "Task added to sprint successfully"}


@router.delete("/{sprint_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_task_from_sprint(
    sprint_id: str,
    task_id: str,
    db: Session = Depends(get_db)
):
    """
    Remove task from sprint
    """
    sprint_task = db.query(SprintTask).filter(
        SprintTask.sprint_id == sprint_id,
        SprintTask.task_id == task_id
    ).first()

    if not sprint_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found in sprint"
        )

    db.delete(sprint_task)
    db.commit()

    return None
