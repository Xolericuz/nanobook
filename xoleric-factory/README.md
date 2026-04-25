# 🏭 Xoleric AI Factory

> "AI-driven self-evolving book ecosystem" - Raqamli nashriyot fabrikasi

## 🚀 Quick Start

```bash
cd xoleric-factory
npm install
npm run dev      # API server
npm run worker   # Queue worker
npm run scheduler # Scheduler
```

## 📊 Dashboard

Dashboard real-time statistics va agentlarni kuzatish uchun ishlatiladi.

## ⚙️ 4 ta Ollama Agent Arxitekturasi

### 1. 🤖 UIMaster (Agent 1)
- UI/UX yangiliklar generatsiya qiladi
- Theme va layout update takliflari

### 2. 📚 BookGenerator (Agent 2)
- Kuniga 1 ta kitob generatsiya qiladi
- 100+ sahifa, har biri 700+ belgi

### 3. 🧍 UserIntelligence (Agent 3)
- Foydalanuvchi preferences o'rganadi
- Tavsiyalar beradi

### 4. 🧑‍✈️ Supervisor (Agent 4)
- Barcha agentlarni monitoring qiladi
- Hisobot chiqaradi

## 📁 Loyiha tuzilmasi

```
xoleric-factory/
├── src/
│   ├── api/          # Express server
│   ├── agents/       # 4 AI agent
│   ├── queue/        # BullMQ queue
│   ├── scheduler/    # Cron jobs
│   ├── audit/        # Blockchain-like log
│   ├── dashboard/   # Real-time stats
│   └── config/       # Configuration
└── logs/            # Audit logs
```

## 🔌 API Endpoints

| Endpoint | Method | Tavsif |
|----------|--------|--------|
| `/api/stats` | GET | Jami statistic |
| `/api/generate/book` | POST | Kitob generatsiya |
| `/api/generate/ui` | POST | UI update |
| `/api/user/track` | POST | Foydalanuvchi tracking |
| `/api/audit` | GET | Audit log |

## 📊 Real-time Statistika

```json
{
  "totalBooks": 100,
  "todayBooks": 0,
  "currentGeneration": "idle",
  "lastBookTime": null
}
```

## ⏱️ Scheduler

- **10:00** - Kunlik kitob generatsiya
- **Har soat** - Tizim salomatligi tekshirish
- **Har daqiqa** - Stats yangilash
- **00:00** - Kunlik stats reset

## 🔐 Audit Log

Har event blockchain kabi loglanadi:
```json
{
  "event": "BOOK_CREATED",
  "timestamp": "...",
  "hash": "sha256..."
}
```

## 🧩 Queue System

BullMQ orqali asynchronous job processing:
- `generate_book` - Kitob generatsiya
- `generate_ui` - UI yangilash
- `track_user` - User tracking
- `health_check` - Salomatlik tekshirish

## 🔧 Configuration

`src/config/index.js` da barcha sozlamalar:

```js
export default {
  ollama: { baseUrl: 'http://localhost:11434' },
  scheduler: { jobs: [...] },
  book: { minPages: 100, minCharsPerPage: 700 }
}
```