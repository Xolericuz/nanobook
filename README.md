# 🏭 Xoleric - AI-Powered Digital Publishing Factory

> "AI-driven self-evolving book ecosystem" - O'zbek tilidagi birinchi raqamli nashriyot fabrikasi

---

## 🚀 Quick Start

```bash
# Clone qiling
git clone https://github.com/Xolericuz/nanobook.git
cd nanobook

# Ishga tushiring
npm run dev
```

Bo't-browserda: `http://localhost:5173`

---

## 📱 Ilovani ishga tushirish

```bash
cd nanobook
npm install
npm run dev    # Development
npm run build   # Production build
```

---

## 📚 100 ta kitob

Xolericda **100 ta** turli kategoriyalardagi kitoblar bor:

| Kategoriya | Kitoblar soni |
|------------|---------------|
| Falsafa | 10 |
| Texnologiya | 10 |
| Psixologiya | 10 |
| Hikoya | 10 |
| Sci-Fi | 10 |
| Biznes | 10 |
| Drama | 10 |
| Fantasy | 10 |
| Detektiv | 10 |
| Eksperimental | 10 |

Har bir kitob:
- **5 ta bob**
- **3800+ belgi**
- **Unique syujet**

---

## 🏭 AI Factory (Xoleric Factory)

> "AI-driven book ecosystem" - Bu to'liq arxitektura

### 4 ta Ollama Agent

| Agent | Vazifa |
|-------|-------|
| **🤖 UIMaster** | UI/UX yangiliklar generatsiya |
| **📚 BookGenerator** | Kuniga 1 kitob (100+ sahifa) |
| **🧍 UserIntelligence** | Foydalanuvchi preferences |
| **🧑‍✈️ Supervisor** | Monitoring va hisobot |

### Factory ishga tushirish

```bash
cd xoleric-factory
npm install
node run.js start
```

### API Endpoints

| Endpoint | Method | Tavsif |
|----------|--------|--------|
| `/api/stats` | GET | Statistika |
| `/api/generate/book` | POST | Kitob generatsiya |
| `/api/generate/ui` | POST | UI update |
| `/api/user/track` | POST | User tracking |
| `/api/audit` | GET | Audit log |

### Scheduler

- **10:00** - Kunlik kitob generatsiya
- **Har soat** - Tizim salomatligi tekshirish
- **00:00** - Kunlik stats reset

---

## 🔐 Blockchain-like Audit Log

Har event immutable loglanadi - o'zgartirib bo'lmaydi:

```json
{
  "event": "BOOK_CREATED",
  "timestamp": "2026-04-25T10:00:00Z",
  "hash": "sha256..."
}
```

---

## 📁 Loyiha tuzilmasi

```
nanobook/
├── src/                    # Vue.js ilovasi
│   ├── components/
│   ├── views/
│   ├── stores/
│   └── utils/
├── generated-books/       # 100 ta kitob
│   └── books.json
├── xoleric-factory/       # AI Factory
│   ├── src/
│   │   ├── api/          # Express server
│   │   ├── agents/       # 4 AI agent
│   │   ├── queue/        # BullMQ
│   │   ├── scheduler/
│   │   └── audit/       # Blockchain log
│   └── run.js
├── dist/                  # Production build
└── package.json
```

---

## 🛠 Texnologiyalar

| Qism | Texnologiya |
|------|------------|
| Frontend | Vue 3 + Pinia |
| Build | Vite |
| Database | Dexie (IndexedDB) |
| AI | Ollama (phi3:3.8b) |
| Queue | BullMQ |
| Scheduler | node-cron |

---

## 📊 Statistika

- **Jami kitoblar**: 100+
- **Har kitob uzunligi**: 3800+ belgi
- **Kategorilar**: 10 ta
- **AI Factory**: 4 agent

---

## 🔧 Development

```bash
# Development
npm run dev

# Production build
npm run build

# Preview
npm run preview
```

---

## 📄 Litsenziya

MIT License

---

## 🤝 Hissa qo'shish

Pull requestlar qabul qilinadi!

---

## 🔗 Foydali links

- [Ollama](https://ollama.ai) - Loyal AI
- [Vue 3](https://vuejs.org)
- [Dexie](https://dexie.org)

---

**Xoleric** - "AI-driven book ecosystem" 🏭📚