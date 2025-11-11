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
    client.post("/api/tasks/", json={"title": "Fix authentication bug", "status": "todo"})
    client.post("/api/tasks/", json={"title": "Add new feature", "status": "in_progress"})
    client.post("/api/tasks/", json={"title": "Fix database connection", "status": "done"})

    # Search for "fix"
    response = client.get("/api/tasks/?search=fix")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all("fix" in task["title"].lower() for task in data)


def test_search_tasks_by_description(client):
    """Test searching tasks by description"""
    # Create tasks with different descriptions
    client.post("/api/tasks/", json={
        "title": "Task 1",
        "description": "This task needs urgent attention",
        "status": "todo"
    })
    client.post("/api/tasks/", json={
        "title": "Task 2",
        "description": "Regular maintenance work",
        "status": "todo"
    })
    client.post("/api/tasks/", json={
        "title": "Task 3",
        "description": "Urgent security patch",
        "status": "in_progress"
    })

    # Search for "urgent"
    response = client.get("/api/tasks/?search=urgent")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all("urgent" in task["description"].lower() for task in data)


def test_search_tasks_case_insensitive(client):
    """Test that search is case insensitive"""
    client.post("/api/tasks/", json={"title": "UPPERCASE TASK", "status": "todo"})
    client.post("/api/tasks/", json={"title": "lowercase task", "status": "todo"})
    client.post("/api/tasks/", json={"title": "MixedCase Task", "status": "todo"})

    # Search with lowercase
    response = client.get("/api/tasks/?search=task")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3

    # Search with uppercase
    response = client.get("/api/tasks/?search=TASK")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3


def test_combined_filters_status_and_search(client):
    """Test combining status filter and search query"""
    # Create tasks
    client.post("/api/tasks/", json={"title": "Fix bug in login", "status": "todo"})
    client.post("/api/tasks/", json={"title": "Fix bug in logout", "status": "done"})
    client.post("/api/tasks/", json={"title": "Add new feature", "status": "todo"})

    # Search for "fix" in "todo" status
    response = client.get("/api/tasks/?status=todo&search=fix")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Fix bug in login"
    assert data[0]["status"] == "todo"


def test_search_with_empty_query(client):
    """Test that empty search query returns all tasks"""
    # Create tasks
    client.post("/api/tasks/", json={"title": "Task 1", "status": "todo"})
    client.post("/api/tasks/", json={"title": "Task 2", "status": "done"})

    # Search with empty string
    response = client.get("/api/tasks/?search=")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_search_with_no_results(client):
    """Test search that matches no tasks"""
    # Create tasks
    client.post("/api/tasks/", json={"title": "Task 1", "status": "todo"})
    client.post("/api/tasks/", json={"title": "Task 2", "status": "done"})

    # Search for non-existent text
    response = client.get("/api/tasks/?search=nonexistent")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0


def test_search_with_special_characters(client):
    """Test search with special characters"""
    # Create tasks with special characters
    client.post("/api/tasks/", json={"title": "Task with % character", "status": "todo"})
    client.post("/api/tasks/", json={"title": "Task with _ underscore", "status": "todo"})

    # Search for special characters - SQL LIKE treats % and _ as wildcards
    # So searching for "%" will match all tasks, and "_" will match single character
    response = client.get("/api/tasks/?search=%")
    assert response.status_code == 200
    data = response.json()
    # % is a wildcard in SQL LIKE, so it matches all tasks
    assert len(data) >= 1

    response = client.get("/api/tasks/?search=_")
    assert response.status_code == 200
    data = response.json()
    # _ is a wildcard in SQL LIKE, so it matches single character
    assert len(data) >= 1


def test_search_partial_word_match(client):
    """Test that search matches partial words"""
    # Create tasks
    client.post("/api/tasks/", json={"title": "Authentication module", "status": "todo"})
    client.post("/api/tasks/", json={"title": "Authorization system", "status": "todo"})

    # Search for partial word "auth"
    response = client.get("/api/tasks/?search=auth")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


def test_filter_all_statuses(client):
    """Test filtering tasks across all statuses"""
    # Create tasks with all different statuses
    client.post("/api/tasks/", json={"title": "Backlog Task", "status": "backlog"})
    client.post("/api/tasks/", json={"title": "Todo Task", "status": "todo"})
    client.post("/api/tasks/", json={"title": "In Progress Task", "status": "in_progress"})
    client.post("/api/tasks/", json={"title": "In Review Task", "status": "in_review"})
    client.post("/api/tasks/", json={"title": "Done Task", "status": "done"})

    # Filter by each status
    for status in ["backlog", "todo", "in_progress", "in_review", "done"]:
        response = client.get(f"/api/tasks/?status={status}")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["status"] == status


def test_combined_filters_all_parameters(client):
    """Test combining all filter parameters together"""
    # Create a test user first
    db = next(override_get_db())
    test_user = User(email="test@example.com", username="testuser")
    db.add(test_user)
    db.commit()
    db.refresh(test_user)

    # Create tasks with different combinations
    client.post("/api/tasks/", json={
        "title": "Fix authentication bug",
        "description": "Critical security issue",
        "status": "todo",
        "assignee_id": str(test_user.id)
    })
    client.post("/api/tasks/", json={
        "title": "Fix database bug",
        "status": "todo",
        "assignee_id": str(test_user.id)
    })
    client.post("/api/tasks/", json={
        "title": "Fix authentication bug",
        "status": "done",
        "assignee_id": str(test_user.id)
    })

    # Filter with all parameters
    response = client.get(
        f"/api/tasks/?status=todo&search=authentication&assignee={test_user.id}"
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Fix authentication bug"
    assert data[0]["status"] == "todo"

    db.close()
