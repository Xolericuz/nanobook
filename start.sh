#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "============================================"
echo "  4 Agent - Ollama Server"
echo "  Avtomatik ishga tushirish"
echo "============================================"
echo ""

# 1. Ollama ishlayaptimi?
echo "[1/5] Ollama tekshirilmoqda..."
if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    echo "  [-] Ollama ishga tushirilmoqda..."
    nohup ollama serve > /tmp/ollama-serve.log 2>&1 &
    sleep 3
    if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
        echo "  [-] Ollama ishga tushmadi! 'ollama serve'ni qo'lda bajaring."
        exit 1
    fi
fi
echo "  [OK] Ollama ishlayapti (port 11434)"

# 2. 4 ta modelni tekshirish
echo "[2/5] Modellar tekshirilmoqda..."
MODELS=("qwen2.5:0.5b" "llama3.2:1b" "tinyllama" "phi:latest")
for model in "${MODELS[@]}"; do
    if ollama list 2>/dev/null | grep -q "$model"; then
        echo "  [OK] $model - tayyor"
    else
        echo "  [+] $model yuklanmoqda..."
        nohup ollama pull "$model" > "/tmp/ollama-pull-$(echo $model | tr ':.' '-').log" 2>&1 &
    fi
done

# 3. Eski jarayonlarni tozalash
echo "[3/5] Eski jarayonlar tozalanmoqda..."
pkill -f "uvicorn main:app" 2>/dev/null || true
pkill -f "http.server 8080" 2>/dev/null || true
sleep 1

# 4. Backendni ishga tushirish
echo "[4/5] Backend ishga tushirilmoqda..."
cd "$SCRIPT_DIR/backend"
PYTHONPATH="$PWD" OLLAMA_HOST="http://localhost:11434" setsid python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 </dev/null &>/tmp/backend-4agent.log &
BACKEND_PID=$!
sleep 2
echo "  [OK] Backend ishlayapti (PID: $BACKEND_PID, port 8000)"

# 5. Frontendni ishga tushirish
echo "[5/5] Frontend ishga tushirilmoqda..."
cd "$SCRIPT_DIR/frontend"
setsid python3 -m http.server 8080 </dev/null &>/tmp/frontend-4agent.log &
FRONTEND_PID=$!
echo "  [OK] Frontend ishlayapti (PID: $FRONTEND_PID, port 8080)"

echo ""
echo "============================================"
echo "  TIZIM TAYYOR!"
echo "============================================"
echo ""
echo "  Web UI: http://localhost:8080"
echo "  API:    http://localhost:8000/api"
echo ""
echo "  Agentlar:"
echo "    🤖 Yordamchi  (qwen2.5:0.5b)"
echo "    💻 Dasturchi  (llama3.2:1b)"
echo "    ✍️  Yozuvchi   (tinyllama)"
echo "    🧠 Mutafakkir (phi:latest)"
echo ""
echo "  Loglar:"
echo "    Backend:  tail -f /tmp/backend-4agent.log"
echo "    Frontend: tail -f /tmp/frontend-4agent.log"
echo ""

# Model yuklanishini kutish (ixtiyoriy)
echo "[*] Modellar yuklanmoqda (background)..."
echo "    Holatni tekshirish: ollama list"
