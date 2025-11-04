echo "Starting frontend..."
cd frontend
npm run dev &

echo "Starting backend..."
cd ../backend
source .venv/bin/activate
python3 run.py &

echo "Both servers are running!"
echo "Press Ctrl+C to stop both servers"

# Wait for both background processes
wait