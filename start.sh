#!/bin/bash

# Cyber Incident Feed Monitoring Tool - Quick Start Script

echo "🚀 Starting Cyber Incident Feed Monitoring Tool..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Start Backend
echo -e "${BLUE}📦 Starting Backend Server...${NC}"
cd backend
source venv/bin/activate
python app.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start Frontend
echo -e "${BLUE}🎨 Starting Frontend Server...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ Both servers are running!${NC}"
echo ""
echo "Backend API: http://localhost:5000"
echo "Frontend App: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
