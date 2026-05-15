#!/usr/bin/env bash
set -euo pipefail

echo "=== Xoleric AI Setup ==="

if ! command -v ollama &> /dev/null; then
  echo "Installing Ollama..."
  curl -fsSL https://ollama.com/install.sh | sh
else
  echo "Ollama already installed"
fi

echo "Pulling llama3.2 model..."
ollama pull llama3.2

echo "Starting backend..."
cd "$(dirname "$0")/backend"
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

echo "Starting frontend dev server..."
cd ..
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=== Xoleric is running ==="
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait
