#!/bin/bash

# Default to development mode
MODE=${1:-dev}

if [ "$MODE" = "prod" ] || [ "$MODE" = "production" ]; then
    echo "🚀 Starting in PRODUCTION mode..."
    
    # Build frontend
    echo "📦 Building frontend..."
    cd frontend
    npm run build
    
    # Start backend with Gunicorn
    echo "🔧 Starting backend with Gunicorn..."
    cd ../backend
    source .venv/bin/activate
    export FLASK_ENV=production
    export PYTHONPATH=$PYTHONPATH:$(pwd)/..
    gunicorn --bind 0.0.0.0:${PORT:-5000} --workers 4 run:app &
    
    echo ""
    echo "✅ Production server running!"
    echo "   Backend: http://0.0.0.0:${PORT:-5000}"
    echo "   Frontend: Serve the 'frontend/dist' folder with a static server (nginx, etc.)"
    echo ""
    
else
    echo "🔧 Starting in DEVELOPMENT mode..."
    
    echo "Starting frontend..."
    cd frontend
    npm run dev &

    echo "Starting backend..."
    cd ../backend
    source .venv/bin/activate
    export FLASK_ENV=development
    export PYTHONPATH=$PYTHONPATH:$(pwd)/..
    python3 run.py &

    echo ""
    echo "✅ Both servers are running!"
    echo "   Frontend: http://localhost:5173"
    echo "   Backend:  http://localhost:5000"
    echo ""
fi

echo "Press Ctrl+C to stop all servers"

# Wait for both background processes
wait