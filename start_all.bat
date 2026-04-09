@echo off
echo ==========================================
echo   Instagram Cyber Incident Monitoring Tool
echo ==========================================

:: Kill old processes to avoid Port-in-use errors
echo [1/4] Cleaning up old processes...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul
npx -y kill-port 3000
npx -y kill-port 5002
npx -y kill-port 5003

:: Start Backend (Port 5002)
echo [2/4] Starting Main Backend (Auth & Analysis)...
start "Backend (5002)" cmd /k "cd backend && python app.py"

:: Start Feed Simulator (Port 5003)
echo [3/4] Starting Feed Simulator...
start "Simulator (5003)" cmd /k "cd backend && python instagram_feed_simulator.py"

:: Start Frontend (Port 3000)
echo [4/4] Starting React Frontend...
start "Frontend (3000)" cmd /k "cd frontend && npm run dev -- --port 3000"

echo ==========================================
echo   ALL SERVICES STARTED! 🚀
echo   - Frontend: http://localhost:3000
echo   - Backend Health: http://localhost:5002/health
echo ==========================================
pause
