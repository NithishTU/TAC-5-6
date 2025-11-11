"""
SQLAlchemy database models
"""

from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from datetime import datetime

from core.database import Base


def generate_uuid():
    """Generate UUID as string for compatibility with SQLite"""
    return str(uuid.uuid4())


class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    github_id = Column(Integer, unique=True, nullable=True, index=True)
    username = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    github_token = Column(Text, nullable=True)  # Encrypted
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, server_default=func.now())

    # Relationships
    tasks_created = relationship("Task", back_populates="creator", foreign_keys="Task.created_by")
    tasks_assigned = relationship("Task", back_populates="assignee", foreign_keys="Task.assignee_id")
    time_entries = relationship("TimeEntry", back_populates="user")
    github_prs = relationship("GitHubPR", back_populates="author")

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username})>"


class Task(Base):
    """Task model for Kanban board"""
    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="backlog", index=True)
    # Status values: backlog, todo, in_progress, in_review, done
    assignee_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    labels = Column(JSON, nullable=True, default=list)  # List of labels
    position = Column(Integer, nullable=True)  # For ordering within column
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, server_default=func.now())

    # Relationships
    creator = relationship("User", back_populates="tasks_created", foreign_keys=[created_by])
    assignee = relationship("User", back_populates="tasks_assigned", foreign_keys=[assignee_id])
    time_entries = relationship("TimeEntry", back_populates="task")
    sprint_tasks = relationship("SprintTask", back_populates="task")

    def __repr__(self):
        return f"<Task(id={self.id}, title={self.title}, status={self.status})>"


class TimeEntry(Base):
    """Time tracking entry"""
    __tablename__ = "time_entries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    task_id = Column(String(36), ForeignKey("tasks.id"), nullable=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime, nullable=False, default=datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    duration = Column(Integer, nullable=True)  # Duration in seconds
    is_running = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())

    # Relationships
    task = relationship("Task", back_populates="time_entries")
    user = relationship("User", back_populates="time_entries")

    def __repr__(self):
        return f"<TimeEntry(id={self.id}, task_id={self.task_id}, duration={self.duration})>"


class Sprint(Base):
    """Sprint model for sprint planning"""
    __tablename__ = "sprints"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    goal = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="planning")
    # Status values: planning, active, completed
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())

    # Relationships
    sprint_tasks = relationship("SprintTask", back_populates="sprint")

    def __repr__(self):
        return f"<Sprint(id={self.id}, name={self.name}, status={self.status})>"


class SprintTask(Base):
    """Association table for Sprint and Task with story points"""
    __tablename__ = "sprint_tasks"

    sprint_id = Column(String(36), ForeignKey("sprints.id"), primary_key=True)
    task_id = Column(String(36), ForeignKey("tasks.id"), primary_key=True)
    story_points = Column(Integer, nullable=True)

    # Relationships
    sprint = relationship("Sprint", back_populates="sprint_tasks")
    task = relationship("Task", back_populates="sprint_tasks")

    def __repr__(self):
        return f"<SprintTask(sprint_id={self.sprint_id}, task_id={self.task_id}, points={self.story_points})>"


class GitHubPR(Base):
    """GitHub Pull Request tracking"""
    __tablename__ = "github_prs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    pr_number = Column(Integer, nullable=False)
    repository = Column(String(255), nullable=False, index=True)
    title = Column(String(500), nullable=True)
    author_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    status = Column(String(50), nullable=True)  # open, closed, merged
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    merged_at = Column(DateTime, nullable=True)

    # Relationships
    author = relationship("User", back_populates="github_prs")

    def __repr__(self):
        return f"<GitHubPR(id={self.id}, repo={self.repository}, pr={self.pr_number})>"


class GitHubSyncLog(Base):
    """GitHub synchronization log"""
    __tablename__ = "github_sync_log"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    sync_type = Column(String(50), nullable=False)  # prs, commits, issues
    status = Column(String(50), nullable=False)  # success, failed
    synced_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())
    error_message = Column(Text, nullable=True)

    def __repr__(self):
        return f"<GitHubSyncLog(id={self.id}, type={self.sync_type}, status={self.status})>"
