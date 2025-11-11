"""
Tests for tasks router
"""

import sys
from pathlib import Path

# Add parent directory to path to import server module
sys.path.insert(0, str(Path(__file__).parent.parent))

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import create_engine  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402

from server import app  # noqa: E402
from core.database import Base, get_db  # noqa: E402

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
    client.post("/api/tasks/", json={"title": "Design login page", "status": "todo"})
    client.post("/api/tasks/", json={"title": "Write API tests", "status": "done"})

    # Search for tasks containing "auth"
    response = client.get("/api/tasks/?search=auth")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert "authentication" in data[0]["title"].lower()


def test_search_tasks_by_description(client):
    """Test searching tasks by description"""
    # Create tasks with different descriptions
    client.post(
        "/api/tasks/",
        json={"title": "Task 1", "description": "Implement user authentication system", "status": "todo"}
    )
    client.post(
        "/api/tasks/",
        json={"title": "Task 2", "description": "Design dashboard layout", "status": "todo"}
    )

    # Search for tasks with "authentication" in description
    response = client.get("/api/tasks/?search=authentication")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert "authentication" in data[0]["description"].lower()


def test_search_tasks_case_insensitive(client):
    """Test that search is case-insensitive"""
    client.post("/api/tasks/", json={"title": "UPPERCASE TASK", "status": "todo"})
    client.post("/api/tasks/", json={"title": "lowercase task", "status": "todo"})

    # Search with lowercase
    response = client.get("/api/tasks/?search=uppercase")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1

    # Search with uppercase
    response = client.get("/api/tasks/?search=LOWERCASE")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1


def test_search_tasks_partial_match(client):
    """Test that search performs partial matching"""
    client.post("/api/tasks/", json={"title": "Implement authentication", "status": "todo"})
    client.post("/api/tasks/", json={"title": "Design page", "status": "todo"})

    # Search with partial word
    response = client.get("/api/tasks/?search=authen")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert "authentication" in data[0]["title"].lower()


def test_search_tasks_no_results(client):
    """Test searching with no matching results"""
    client.post("/api/tasks/", json={"title": "Task 1", "status": "todo"})
    client.post("/api/tasks/", json={"title": "Task 2", "status": "todo"})

    # Search for non-existent term
    response = client.get("/api/tasks/?search=nonexistent")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0


def test_search_tasks_empty_query(client):
    """Test that empty search returns all tasks"""
    client.post("/api/tasks/", json={"title": "Task 1", "status": "todo"})
    client.post("/api/tasks/", json={"title": "Task 2", "status": "done"})

    # Search with empty string
    response = client.get("/api/tasks/?search=")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_combine_search_and_status_filters(client):
    """Test combining search and status filters"""
    # Create tasks with different statuses and titles
    client.post("/api/tasks/", json={"title": "Fix authentication bug", "status": "todo"})
    client.post("/api/tasks/", json={"title": "Fix navigation bug", "status": "done"})
    client.post("/api/tasks/", json={"title": "Implement authentication", "status": "done"})

    # Search for "authentication" with status filter "done"
    response = client.get("/api/tasks/?search=authentication&status=done")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert "authentication" in data[0]["title"].lower()
    assert data[0]["status"] == "done"


def test_search_tasks_special_characters(client):
    """Test searching with special characters"""
    client.post("/api/tasks/", json={"title": "Task with @special #chars", "status": "todo"})
    client.post("/api/tasks/", json={"title": "Normal task", "status": "todo"})

    # Search for special characters
    response = client.get("/api/tasks/?search=@special")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert "@special" in data[0]["title"]
