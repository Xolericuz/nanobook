# 🤖 Xoleric AI - To'liq Qo'llanma

## AI Server - Har Qurilmada Ishlash Uchun

### Talablar
- **PC/Linux/Mac**: Ollama o'rnatilgan
- **Mobil**: Remote AI serverga ulanish

---

## 1. Ollama o'rnatish

### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Mac
```bash
brew install ollama
# yoki
curl -fsSL https://ollama.com/install.sh | sh
```

### Windows
[Ollama.com/download](https://ollama.com/download/windows) dan yuklang

---

## 2. Model yuklash
```bash
ollama pull phi3:3.8b
```

---

## 3. AI Server ishga tushirish

### Local (PC da)
```bash
cd nanobook
node server/ai-server.js
```

### Serverdan foydalanish (boshqa qurilma)
```bash
# Server IP ni bilish
hostname -I

# Serverda:
AI_SERVER_URL=http://192.168.x.x:3001 node server/ai-server.js
```

---

## 4. Vue App ni ulash

AI_SERVER_URL ni o'rnating:

```bash
# .env fayl yaratish
echo "VITE_AI_URL=http://localhost:3001" > .env
# yoki server uchun
echo "VITE_AI_URL=http://SERVER_IP:3001" > .env
```

---

## 5. API ishlatish

### Kitob generatsiya
```bash
curl -X POST http://localhost:3001/api/generate/book \
  -H "Content-Type: application/json" \
  -d '{"category":"Falsafa","title":"Hayot ma'\''nosi"}'
```

### Statuse tekshirish
```bash
curl http://localhost:3001/api/status
```

### Chat
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Salom"}'
```

---

## 6. Auto-start (Linux)

```bash
# systemd service yaratish
sudo nano /etc/systemd/system/xoleric-ai.service

[Unit]
Description=Xoleric AI Server
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/nanobook
ExecStart=/usr/bin/node server/ai-server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

Sozlash:
```bash
sudo systemctl daemon-reload
sudo systemctl enable xoleric-ai
sudo systemctl start xoleric-ai
```

---

## 7. Mobil Ulanish

### WiFi orqali (ham LAN da)
1. Serverda `hostname -I` bilan IPni bilib oling
2. Telefonda: `http://192.168.x.x:3001`

### Internet orqali (remote)
- **Option 1**: Cloudflare Tunnel
- **Option 2**: ngrok: `ngrok http 3001`
- **Option 3**: Port forwarding (router)

---

## 8. Masalalar

### "Ollama offline"
```bash
# Ollama ishga tushganmi?
ollama list

# Qayta ishga tushirish
ollama serve
```

### "Connection refused"
```bash
# Firewall chek
sudo ufw allow 3001/tcp

# Yoki server ishlamayapti
ps aux | grep ai-server
```

---

## Tezkor Buyruqlar

```bash
# Ollama tekshirish
curl http://localhost:11434/api/tags

# AI server tekshirish  
curl http://localhost:3001/api/health

# Kitob generatsiya
curl -X POST http://localhost:3001/api/generate/book \
  -H "Content-Type: application/json" \
  -d '{"category":"Falsafa","title":"Hayot ma'\''nosi"}'
```

---

## Arxitektura

```
┌─────────────┐         ┌─────────────┐
│   Vue App    │────────▶│ AI Server   │────────▶ Ollama
│  (Browser)  │ :3001   │  (Node.js)  │  :11434
└─────────────┘         └─────────────┘
                              │
                     ┌────────┴────────┐
                     │ Book Generation│
                     │   + Chat API    │
                     └─────────���───────┘
```

---

## Foydali Linklar

- [Ollama](https://ollama.com)
- [phi3 model](https://ollama.ai/library/phi3)
- [Cloudflare](https://dash.cloudflare.com)