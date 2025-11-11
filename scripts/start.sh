#!/bin/bash

# Start both frontend and backend servers

echo "Starting Developer Productivity Dashboard..."

# Start backend in background
echo "Starting backend server..."
cd app/server
python server.py &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Start frontend in background
echo "Starting frontend server..."
cd ../client
npm run dev &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Print URLs
echo ""
echo "================================"
echo "Dev Dashboard is running!"
echo "================================"
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo "================================"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
