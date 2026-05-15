# Xoleric

**O'zbek tilidagi AI-kutubxona** — 100+ elektron kitob, aqlli AI agentlar va zamonaviy o'qish tajribasi.

## Imkoniyatlar

- 📚 **100+ kitob** — keng qamrovli o'zbek tilidagi elektron kitoblar to'plami
- 🤖 **AI agentlar** — kitoblar bo'yicha savollarga javob olish va tavsiyalar
- 📴 **Offline o'qish** — Dexie orqali brauzerda kesh bilan offline rejim
- 🌗 **Dark/Light mode** — ko'z uchun qulay interfeys
- 📱 **Responsive** — barcha qurilmalarda mukammal ko'rinish
- ⚡ **Tez va qulay** — Vite asosidagi yuqori tezlikdagi frontend

## Tez boshlash (Docker bilan)

```bash
docker compose up -d
```

Frontend: http://localhost:80
Backend:  http://localhost:8000

## Tez boshlash (Dockersiz)

**Talablar:** Node.js 22+, Python 3.12+

```bash
# Frontend
npm install
npm run dev

# Backend (ayni terminalda)
npm run backend
```

Frontend: http://localhost:5173
Backend:  http://localhost:8000

## AI sozlash

```bash
chmod +x setup-ai.sh
./setup-ai.sh
```

Bu skript Ollama o'rnatadi, llama3.2 modelini yuklab oladi va backend/frontend serverlarini ishga tushiradi.

## Texnologiyalar

| Komponent | Texnologiya |
|-----------|-------------|
| Frontend | Vue 3, Pinia, Vue Router, Vite, TypeScript, SCSS |
| Backend | FastAPI (Python), SQLite |
| AI | Ollama, llama3.2 |
| Ma'lumotlar bazasi | Dexie.js (IndexedDB), JSON |
| Real-time | Socket.IO |
| Deploy | Docker, Cloudflare Pages |

## Loyiha tuzilishi

```
xoleric/
├── backend/          # FastAPI backend
│   ├── main.py
│   ├── books/        # Kitob ma'lumotlari
│   └── requirements.txt
├── src/              # Vue 3 frontend
│   ├── components/
│   ├── views/
│   ├── stores/
│   ├── router/
│   └── main.ts
├── public/           # Statik fayllar
├── docker-compose.yml
├── Dockerfile
├── nginx.conf
└── package.json
```

## Skrinshotlar

*Skrinshotlar tez orada qo'shiladi.*

## Litsenziya

MIT
