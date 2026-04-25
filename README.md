# 🤖 Xoleric AI - To'liq Avtonomous AI Tizim

<p align="center">
  <img src="https://img.shields.io/badge/Xoleric-AI-blue?style=for-the-badge&logo=🤖" alt="Xoleric AI">
  <img src="https://img.shields.io/badge/4-Agents-green?style=for-the-badge" alt="4 Agents">
  <img src="https://img.shields.io/badge/Autonomous-purple?style=for-the-badge" alt="Autonomous">
  <img src="https://img.shields.io/badge/GitHub-Auto%20Sync-orange?style=for-the-badge" alt="GitHub Auto Sync">
</p>

---

## 🚀 Tezkor Boshlanish

### 1. Ollama o'rnatish
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull phi3:3.8b
```

### 2. GitHub Token o'rnatish
```bash
# GitHub → Settings → Developer settings → Personal access tokens
# Token yarating (repo, workflows)

export GITHUB_TOKEN=ghp_xxxxxxx
```

### 3. AI Serverni ishga tushirish
```bash
cd nanobook
npm run ai
```

### 4. Vue App
```bash
npm run dev
```

---

## 📱 Arxitektura

```
┌──────────────────────────────────────────────────┐
│                  XOLERIC AI                       │
├──────────────────────────────────────────────────┤
│                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Vue App  │  │ AI Server│  │ Ollama   │      │
│  │(Browser) │◄─►│Node.js  │◄─►│phi3:3.8b│      │
│  └──────────┘  └────┬─────┘  └──────────┘      │
│                     │                             │
│              ┌──────┴──────┐                    │
│              │ GitHub Auto  │                    │
│              │    Sync      │                    │
│              └──────┬──────┘                    │
│                     │                             │
│              ┌──────┴──────┐                    │
│              │   GitHub    │                    │
│              │  Repository│                    │
│              └─────────────┘                    │
└──────────────────────────────────────────────────┘
```

---

## 🤖 4 Ta AI Agent

| Agent | Vazifa | Holat |
|-------|---------|-------|
| 🎨 **UI Master** | UI/Design analizi va yangilash | `GET /api/agents/uiMaster/run` |
| 📚 **Book Generator** | Kitob generatsiya | `GET /api/agents/bookGenerator/run` |
| 🧠 **User Intelligence** | Foydalanuvchi analitika | `GET /api/agents/userIntelligence/run` |
| 👁️ **Supervisor** | Tizim monitoring | `GET /api/agents/supervisor/run` |

---

## ⚡ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Tizim holati |
| GET | `/api/agents` | 4 agent holatlari |
| GET | `/api/agents/:name/run` | Agent ishga tushirish |
| GET | `/api/cycle/run` | To'liq cycle ishga tushirish |
| GET | `/api/books` | Jami kitoblar |
| POST | `/api/github/sync` | GitHubga push |

---

## 🔧 Environment Variables

```bash
# Ollama
OLLAMA_URL=http://localhost:11434

# Server Port
PORT=3001

# GitHub Auto Sync
AUTO_SYNC=true
SCHEDULE=1h

# GitHub Token
GITHUB_TOKEN=ghp_xxxxxxx
GITHUB_REPO=Xolericuz/nanobook
```

---

## 📦 GitHubga Upload

```bash
# .env yaratish (GITHUB_TOKEN qo'shing)
cp .env.example .env

# Edit .env
nano .env

# Server ishga tushirish
npm run ai
```

Auto-cycle GitHubga push qiladi!

---

## 🎯 Foydalanish

### Terminal
```bash
# Barcha agentlarni ishga tushirish
curl http://localhost:3001/api/cycle/run

# Faqat kitob generatsiya
curl http://localhost:3001/api/agents/bookGenerator/run
```

### Brauzer
- http://localhost:5173 - Vue App
- http://localhost:3001/api/status - API holat

---

## 📁 Loyiha Tuzilishi

```
nanobook/
├── server/
│   ├── xoleric-ai.js    # Asosiy AI server
│   ├── ai-server.js     # Oddiy AI server
│   └── autonomous.js   # Avtonomous agent
├── src/
│   ├── composables/     # Vue composables
│   ├── views/           # Sahifalar
│   └── stores/          # State management
├── generated-books/      # AI kitoblar
├── .env                 # Environment
└── package.json
```

---

## 🛠 O'rnatish

```bash
# Klonlash
git clone https://github.com/Xolericuz/nanobook.git
cd nanobook

# Dependencies
npm install

# Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Server ishga tushirish
npm run ai
```

---

## 📄 License

MIT License - Xoleric AI Team

---

<p align="center">
  <sub>Made with ❤️ by Xoleric AI</sub>
</p>