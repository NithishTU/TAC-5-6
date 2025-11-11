"""
Tests for tasks router
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
from pathlib import Path

# Add parent directory to path to import server module
sys.path.insert(0, str(Path(__file__).parent.parent))

from server import app
from core.database import Base, get_db
from core.models import Task, User

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def test_db():
    """Create test database tables"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(test_db):
    """Test client fixture"""
    return TestClient(app)


def test_create_task(client):
    """Test creating a task"""
    response = client.post(
        "/api/tasks/",
        json={
            "title": "Test Task",
            "description": "This is a test task",
            "status": "todo",
            "labels": ["bug", "urgent"]
        }
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["description"] == "This is a test task"
    assert data["status"] == "todo"
    assert "bug" in data["labels"]


def test_list_tasks(client):
    """Test listing tasks"""
    # Create a task first
    client.post(
        "/api/tasks/",
        json={"title": "Task 1", "status": "todo"}
    )
    client.post(
        "/api/tasks/",
        json={"title": "Task 2", "status": "done"}
    )

    # List all tasks
    response = client.get("/api/tasks/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_get_task(client):
    """Test getting a specific task"""
    # Create a task
    create_response = client.post(
        "/api/tasks/",
        json={"title": "Test Task", "status": "todo"}
    )
    task_id = create_response.json()["id"]

    # Get the task
    response = client.get(f"/api/tasks/{task_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == task_id
    assert data["title"] == "Test Task"


def test_update_task(client):
    """Test updating a task"""
    # Create a task
    create_response = client.post(
        "/api/tasks/",
        json={"title": "Original Title", "status": "todo"}
    )
    task_id = create_response.json()["id"]

    # Update the task
    response = client.patch(
        f"/api/tasks/{task_id}",
        json={"title": "Updated Title"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["status"] == "todo"  # Unchanged field


def test_delete_task(client):
    """Test deleting a task"""
    # Create a task
    create_response = client.post(
        "/api/tasks/",
        json={"title": "Task to Delete", "status": "todo"}
    )
    task_id = create_response.json()["id"]

    # Delete the task
    response = client.delete(f"/api/tasks/{task_id}")
    assert response.status_code == 204

    # Verify it's deleted
    get_response = client.get(f"/api/tasks/{task_id}")
    assert get_response.status_code == 404


def test_move_task(client):
    """Test moving a task to different status"""
    # Create a task
    create_response = client.post(
        "/api/tasks/",
        json={"title": "Task to Move", "status": "todo"}
    )
    task_id = create_response.json()["id"]

    # Move the task
    response = client.patch(
        f"/api/tasks/{task_id}/move",
        json={"status": "in_progress"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "in_progress"


def test_filter_tasks_by_status(client):
    """Test filtering tasks by status"""
    # Create tasks with different statuses
    client.post("/api/tasks/", json={"title": "Todo Task", "status": "todo"})
    client.post("/api/tasks/", json={"title": "Done Task", "status": "done"})

    # Filter by status
    response = client.get("/api/tasks/?status=todo")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["status"] == "todo"


def test_search_tasks_by_title(client):
    """Test searching tasks by title"""
    # Create tasks with different titles
    client.post("/api/tasks/", json={"title": "Implement authentication", "status": "todo"})
    client.post("/api/tasks/", json={"title": "Fix login bug", "status": "todo"})
    client.post("/api/tasks/", json={"title": "Update documentation", "status": "done"})

    # Search by title
    response = client.get("/api/tasks/?search=authentication")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert "authentication" in data[0]["title"].lower()


def test_search_tasks_by_description(client):
    """Test searching tasks by description"""
    # Create tasks with different descriptions
    client.post("/api/tasks/", json={
        "title": "Task 1",
        "description": "Add JWT-based authentication system",
        "status": "todo"
    })
    client.post("/api/tasks/", json={
        "title": "Task 2",
        "description": "Fix the login form validation",
        "status": "todo"
    })

    # Search by description keyword
    response = client.get("/api/tasks/?search=JWT")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert "JWT" in data[0]["description"]


def test_search_tasks_case_insensitive(client):
    """Test that search is case-insensitive"""
    # Create task
    client.post("/api/tasks/", json={
        "title": "Implement Authentication Feature",
        "status": "todo"
    })

    # Search with lowercase
    response = client.get("/api/tasks/?search=authentication")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1

    # Search with uppercase
    response = client.get("/api/tasks/?search=AUTHENTICATION")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1

    # Search with mixed case
    response = client.get("/api/tasks/?search=AuThEnTiCaTiOn")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1


def test_filter_by_assignee(client):
    """Test filtering tasks by assignee"""
    # Create users first
    db = next(override_get_db())
    user1 = User(username="user1", email="user1@example.com")
    user2 = User(username="user2", email="user2@example.com")
    db.add(user1)
    db.add(user2)
    db.commit()
    db.refresh(user1)
    db.refresh(user2)

    # Create tasks with different assignees
    task1 = Task(title="Task 1", status="todo", assignee_id=user1.id, created_by=user1.id)
    task2 = Task(title="Task 2", status="todo", assignee_id=user2.id, created_by=user2.id)
    task3 = Task(title="Task 3", status="todo", created_by=user1.id)  # No assignee
    db.add(task1)
    db.add(task2)
    db.add(task3)
    db.commit()

    # Filter by first user
    response = client.get(f"/api/tasks/?assignee={user1.id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["assignee_id"] == user1.id

    # Filter by second user
    response = client.get(f"/api/tasks/?assignee={user2.id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["assignee_id"] == user2.id

    db.close()


def test_combined_filters(client):
    """Test combining multiple filters (search + status)"""
    # Create multiple tasks
    client.post("/api/tasks/", json={
        "title": "Fix authentication bug",
        "description": "Users cannot log in",
        "status": "todo"
    })
    client.post("/api/tasks/", json={
        "title": "Implement authentication",
        "description": "Add JWT support",
        "status": "done"
    })
    client.post("/api/tasks/", json={
        "title": "Update docs",
        "description": "Add API documentation",
        "status": "todo"
    })

    # Combine search and status filter
    response = client.get("/api/tasks/?search=authentication&status=todo")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert "authentication" in data[0]["title"].lower()
    assert data[0]["status"] == "todo"


def test_filter_returns_empty_when_no_matches(client):
    """Test that filtering returns empty list when no tasks match"""
    # Create some tasks
    client.post("/api/tasks/", json={"title": "Task 1", "status": "todo"})
    client.post("/api/tasks/", json={"title": "Task 2", "status": "done"})

    # Search for non-existent term
    response = client.get("/api/tasks/?search=nonexistent")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0

    # Filter by non-existent status
    response = client.get("/api/tasks/?status=archived")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0


def test_search_with_special_characters(client):
    """Test searching with special characters"""
    # Create task with special characters
    client.post("/api/tasks/", json={
        "title": "Fix: User can't log in with email@example.com",
        "status": "todo"
    })

    # Search with special characters
    response = client.get("/api/tasks/?search=can't")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1

    # Search with @ symbol
    response = client.get("/api/tasks/?search=email@example")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
