"""
Developer Productivity Dashboard - Main FastAPI Application
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from core.config import settings
from core.database import engine, Base
from core.routers import auth, tasks, time_tracking, github, analytics, sprints

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting Developer Productivity Dashboard...")

    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created")

    yield

    # Shutdown
    logger.info("Shutting down...")


# Initialize FastAPI application
app = FastAPI(
    title="Developer Productivity Dashboard API",
    description="Track tasks, time, and team productivity with GitHub integration",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(time_tracking.router, prefix="/api/time", tags=["Time Tracking"])
app.include_router(github.router, prefix="/api/github", tags=["GitHub"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(sprints.router, prefix="/api/sprints", tags=["Sprints"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Developer Productivity Dashboard API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "connected",
        "version": "1.0.0"
    }


# WebSocket connection manager
class ConnectionManager:
    """Manage WebSocket connections"""

    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting message: {e}")


manager = ConnectionManager()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()

            # Handle different message types
            message_type = data.get("type")

            if message_type == "ping":
                await websocket.send_json({"type": "pong"})

            elif message_type == "timer:start":
                # Broadcast timer start to all clients
                await manager.broadcast({
                    "type": "timer:started",
                    "task_id": data.get("task_id"),
                    "user_id": data.get("user_id")
                })

            elif message_type == "timer:stop":
                # Broadcast timer stop to all clients
                await manager.broadcast({
                    "type": "timer:stopped",
                    "task_id": data.get("task_id"),
                    "user_id": data.get("user_id"),
                    "duration": data.get("duration")
                })

            elif message_type == "task:update":
                # Broadcast task update to all clients
                await manager.broadcast({
                    "type": "task:updated",
                    "task": data.get("task")
                })

            else:
                logger.warning(f"Unknown message type: {message_type}")

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
