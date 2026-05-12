#!/usr/bin/env bash
set -e

MODE="${1:-docker}"

echo "=== Ollama Server ==="
echo ""

if [ "$MODE" = "docker" ]; then
    echo "[+] Docker rejimida ishga tushirish..."
    docker compose up -d --build
    echo ""
    echo "    Web UI: http://localhost"
    echo "    API:    http://localhost/api"
    echo ""
    echo "[!] Model yuklash: docker exec -it ollama-server ollama pull llama3.2:1b"
else
    echo "[+] Lokal rejimda ishga tushirish..."

    # Ollama ishlayotganini tekshirish
    if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
        echo "[-] Ollama ishga tushmagan! Iltimos 'ollama serve'ni ishga tushiring."
        exit 1
    fi

    SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

    # Backend
    echo "[+] Backend ishga tushirilmoqda (port 8000)..."
    cd "$SCRIPT_DIR/backend"
    PYTHONPATH="$PWD" OLLAMA_HOST="http://localhost:11434" nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 > /tmp/ollama-backend.log 2>&1 &
    echo "    PID: $!"

    # Frontend
    echo "[+] Frontend ishga tushirilmoqda (port 3000)..."
    cd "$SCRIPT_DIR/frontend"
    nohup python3 -m http.server 3000 > /tmp/ollama-frontend.log 2>&1 &
    echo "    PID: $!"

    echo ""
    echo "    Web UI: http://localhost:3000"
    echo "    API:    http://localhost:8000/api"
    echo ""
    echo "[!] Model yuklash: ollama pull llama3.2:1b"
    echo "[!] Loglarni ko'rish:"
    echo "    tail -f /tmp/ollama-backend.log"
    echo "    tail -f /tmp/ollama-frontend.log"
fi
