#!/bin/bash

# Xoleric AI Setup Script
# Har qurilmaga Ollama o'rnatish uchun

echo "╔══════════════════════════════════╗"
echo "║   🤖 Xoleric AI Setup           ║"
echo "╚══════════════════════════════════╝"
echo ""

# OS aniqlash
OS=$(uname -s)
case "$OS" in
  Linux*)
    if command -v apt-get &> /dev/null; then
      OS_TYPE="debian"
    elif command -v pacman &> /dev/null; then
      OS_TYPE="arch"
    elif command -v dnf &> /dev/null; then
      OS_TYPE="fedora"
    fi
    ;;
  Darwin*)
    OS_TYPE="macos"
    ;;
  MINGW*|MSYS*|CYGWIN*)
    OS_TYPE="windows"
    ;;
  *)
    echo "❌ Noma'lum OS: $OS"
    exit 1
    ;;
esac

echo "📱 Aniqlangan OS: $OS_TYPE ($OS)"
echo ""

# 1. Ollama o'rnatish
install_ollama() {
  echo "📦 Ollama o'rnatilmoqda..."
  
  if command -v ollama &> /dev/null; then
    echo "✅ Ollama allaqachon o'rnatilgan"
    return 0
  fi
  
  case "$OS_TYPE" in
    debian)
      curl -fsSL https://ollama.com/install.sh | sh
      ;;
    macos)
      if command -v brew &> /dev/null; then
        brew install ollama
      else
        curl -fsSL https://ollama.com/install.sh | sh
      fi
      ;;
    arch)
      yay -S ollama
      ;;
    windows)
      echo "📥 Windows uchun Ollama ni manual yukolang:"
      echo "   https://ollama.com/download/windows"
      ;;
    *)
      curl -fsSL https://ollama.com/install.sh | sh
      ;;
  esac
}

# 2. Model yuklash
install_model() {
  echo ""
  echo "🤖 Model yuklanmoqda (phi3:3.8b)..."
  
  if command -v ollama &> /dev/null; then
    ollama pull phi3:3.8b
    echo "✅ Model tayyor!"
  fi
}

# 3. Serverni ishga tushirish
start_server() {
  echo ""
  echo "🚀 Server ishga tushirilmoqda..."
  echo ""
  echo "Kitob generatsiya uchun: curl -X POST http://localhost:3001/api/generate/book \\"
  echo '  -H "Content-Type: application/json" \'
  echo '  -d '\''{"category":"Falsafa","title":"Hayot ma'\''nosi"}'\'''
  echo ""
  echo "Chat uchun: curl -X POST http://localhost:3001/api/chat \\"
  echo '  -H "Content-Type: application/json" \'
  echo '  -d '\''{"message":"Salom"}'\'''
  echo ""
  
  cd "$(dirname "$0")"
  node server/ai-server.js
}

# 4. Auto-start setup (systemd)
setup_systemd() {
  if [ "$OS_TYPE" = "debian" ]; then
    echo ""
    echo "⚙️ Auto-start sozlanyapti..."
    sudo tee /etc/systemd/system/xoleric-ai.service > /dev/null <<EOF
[Unit]
Description=Xoleric AI Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=$(which node) server/ai-server.js
Restart=always

[Install]
WantedBy=multi-user.target
EOF
    sudo systemctl daemon-reload
    sudo systemctl enable xoleric-ai
    echo "✅ Auto-start yoqildi! (sudo systemctl start xoleric-ai)"
  fi
}

# Menu
show_menu() {
  echo "Tanlang:"
  echo "  1) Ollama o'rnatish"
  echo "  2) Model yuklash (phi3:3.8b)"
  echo "  3) Serverni ishga tushirish"
  echo "  4) Auto-start sozlash (systemd)"
  echo "  5) Hammasi (1+2+3)"
  echo "  0) Chiqish"
  echo ""
  read -p "Tanlov: " choice
  
  case $choice in
    1) install_ollama ;;
    2) install_model ;;
    3) start_server ;;
    4) setup_systemd ;;
    5) 
      install_ollama
      install_model
      start_server
      ;;
    0) exit 0 ;;
    *) show_menu ;;
  esac
}

# Argv bilan ishlash
if [ "$1" = "install" ]; then
  install_ollama
  install_model
elif [ "$1" = "start" ]; then
  start_server
elif [ "$1" = "daemon" ]; then
  setup_systemd
else
  # Interaktiv rejim
  if [ -t 1 ]; then
    show_menu
  else
    # Non-interactive - auto install
    install_ollama
    install_model
  fi
fi