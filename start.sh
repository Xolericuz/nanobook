#!/usr/bin/env bash
set -e

echo "=== Ollama Server - Ishga tushirish ==="
echo ""

# .env faylini tekshirish
if [ ! -f .env ]; then
    echo "[+] .env fayli yaratilmoqda..."
    cat > .env << 'EOF'
JWT_SECRET=$(openssl rand -hex 32)
EOF
    echo "    JWT_SECRET yaratildi"
fi

# Docker mavjudligini tekshirish
if ! command -v docker &> /dev/null; then
    echo "[-] Xatolik: Docker o'rnatilmagan!"
    echo "    Iltimos, avval Docker'ni o'rnating:"
    echo "    curl -fsSL https://get.docker.com | sh"
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo "[-] Xatolik: Docker Compose o'rnatilmagan!"
    exit 1
fi

echo "[+] Docker komponentlari ishga tushirilmoqda..."
docker compose up -d --build

echo ""
echo "=== Server tayyor! ==="
echo "    Web UI: http://localhost"
echo "    API:    http://localhost/api"
echo ""
echo "[!] Model yuklash uchun:"
echo "    docker exec -it ollama-server ollama pull llama3.2:1b"
echo "    yoki: docker exec -it ollama-server ollama pull qwen2.5:0.5b"
echo ""
echo "[!] Loglarni ko'rish:"
echo "    docker compose logs -f"
