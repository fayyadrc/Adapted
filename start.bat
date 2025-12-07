@echo off
echo Starting frontend...
start cmd /k "cd frontend && npm run dev"

echo Starting backend...
start cmd /k "cd backend && .venv\Scripts\activate && python run.py"

echo Both servers are running!
echo Close the terminal windows to stop the servers.
pause
