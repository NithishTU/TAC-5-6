"""
Tasks router - Kanban board task management
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from core.database import get_db
from core.schemas import TaskCreate, TaskUpdate, TaskResponse, TaskMove
from core.models import Task, User

router = APIRouter()


@router.get("/", response_model=List[TaskResponse])
async def list_tasks(
    status_filter: Optional[str] = Query(None, alias="status"),
    assignee_id: Optional[str] = Query(None, alias="assignee"),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    List all tasks with optional filtering

    Filters:
    - status: Filter by task status (backlog, todo, in_progress, in_review, done)
    - assignee: Filter by assignee user ID
    - search: Search in title and description
    """
    query = db.query(Task)

    if status_filter:
        query = query.filter(Task.status == status_filter)

    if assignee_id:
        query = query.filter(Task.assignee_id == assignee_id)

    if search:
        query = query.filter(
            (Task.title.ilike(f"%{search}%")) | (Task.description.ilike(f"%{search}%"))
        )

    tasks = query.order_by(Task.position, Task.created_at.desc()).all()
    return tasks


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(task_data: TaskCreate, db: Session = Depends(get_db)):
    """
    Create a new task
    """
    # TODO: Get current user ID from JWT token
    current_user_id = "placeholder-user-id"

    # Calculate position (last in the column)
    max_position = db.query(Task).filter(Task.status == task_data.status).count()

    task = Task(
        **task_data.model_dump(),
        created_by=current_user_id,
        position=max_position
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str, db: Session = Depends(get_db)):
    """
    Get task by ID
    """
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )

    return task


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, task_data: TaskUpdate, db: Session = Depends(get_db)):
    """
    Update task
    """
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )

    # Update only provided fields
    for field, value in task_data.model_dump(exclude_unset=True).items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(task_id: str, db: Session = Depends(get_db)):
    """
    Delete task
    """
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )

    db.delete(task)
    db.commit()

    return None


@router.patch("/{task_id}/move", response_model=TaskResponse)
async def move_task(task_id: str, move_data: TaskMove, db: Session = Depends(get_db)):
    """
    Move task to different column/status
    """
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )

    # Update status
    task.status = move_data.status

    # Update position if provided
    if move_data.position is not None:
        task.position = move_data.position
    else:
        # Default to end of column
        max_position = db.query(Task).filter(Task.status == move_data.status).count()
        task.position = max_position

    db.commit()
    db.refresh(task)

    return task


@router.post("/{task_id}/assign", response_model=TaskResponse)
async def assign_task(task_id: str, assignee_id: str, db: Session = Depends(get_db)):
    """
    Assign task to user
    """
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID {task_id} not found"
        )

    # Verify user exists
    user = db.query(User).filter(User.id == assignee_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {assignee_id} not found"
        )

    task.assignee_id = assignee_id
    db.commit()
    db.refresh(task)

    return task
