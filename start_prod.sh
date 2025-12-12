#!/bin/bash

# Function to kill processes on exit
cleanup() {
    echo "Stopping servers..."
    kill $(jobs -p) 2>/dev/null
}
trap cleanup EXIT

echo "Starting backend (Production - Gunicorn)..."
cd backend
if [ -d ".venv" ]; then
    source .venv/bin/activate
else
    echo "Warning: .venv not found. Assuming environment is already set up or using global python."
fi

# Run gunicorn in background
# -w 4: 4 worker processes
# -b 0.0.0.0:5000: Bind to port 5000
# --access-logfile -: Log access to stdout
# run:app : Module 'run' and callable 'app'
gunicorn -w 4 -b 0.0.0.0:5000 --access-logfile - run:app &

echo "Building frontend..."
cd ../frontend
npm run build

echo "Starting frontend (Production - Vite Preview)..."
# vite preview serves the built 'dist' folder
# --host: Expose to network (optional but matched user's start.sh output style)
npm run preview -- --host --port 5173 &

echo "Servers are running in PRODUCTION mode!"
echo "Backend: http://localhost:5000"
echo "Frontend: Check output above for port (usually 4173)"
echo "Press Ctrl+C to stop."

wait
