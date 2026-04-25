// Xoleric AI - Browser-based AI (No Ollama Required!)
// Uses free cloud AI APIs

const AI_CONFIGS = {
  // Cloudflare Workers AI (free!)
  cloudflare: {
    url: 'https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/@cf/meta/llama-3-8b-instruct',
    token: null // Set via CF_API_TOKEN
  },
  // Ollama (local, if available)
  ollama: {
    url: 'http://localhost:11434',
    model: 'phi3:3.8b'
  }
}

let config = {
  provider: 'fallback', // 'cloudflare', 'ollama', 'fallback'
  ollamaUrl: 'http://localhost:11434',
  cloudflareToken: null,
  accountId: null
}

const CATEGORIES = [
  'Falsafa', 'Texnologiya', 'Psixologiya', 'Hikoya', 
  'Sci-Fi', 'Biznes', 'Drama', 'Fantasy', 'Detektiv', 'Eksperimental'
]

const BOOK_TITLES = {
  Falsafa: ["Hayot ma'nosi", "Vaqt oqimi", "Yo'qotish va topish", "Oddiylik siri", "Qaror qabul qilish"],
  Texnologiya: ["Sun'iy ong", "Kod yuragi", "Algoritm shahri", "Virtual haqiqat", "Raqamli inson"],
  Psixologiya: ["Ong labirinti", "Qo'rquv sababi", "Motivatsiya", "Xotira", "Baxt formulasi"],
  Hikoya: ["Yo'qolgan shahar", "Oxirgi odam", "Vaqt sayohati", "Soyalar", "Yashirin xat"],
  'Sci-Fi': ["Mars koloniyasi", "Yolg'iz kosmos", "Yulduzlar", "Kiber inson", "Qora tuynuk"],
  Biznes: ["Biznes asoslari", "Marketing", "Moliya", "Mijoz", "Brend"],
  Drama: ["Ajrishuv", "Qaytish", "Sirli kelin", "Ona yuragi", "Do'stlik"],
  Fantasy: ["Sehrli qishloq", "Ajdod qilici", "Peri malikasi", "Sehrli o'rmon", "Oltin qirollik"],
  Detektiv: ["Qotillik siri", "Iz", "Kalit", "Sirli daftarlar", "Tungi tergov"],
  Eksperimental: ["Yangi dunyo", "O'zgartirish", "Sinash", "Imkoniyat", "Variantlar"]
}

const uzNames = ["Azamat", "Bahodir", "Gulshan", "Madina", "Sardor", "Malika", "Rustam", "Zebo", "Kamron", "Sevara"]
const cities = ["Toshkent", "Samarqand", "Buxoro", "Farg'ona", "Qo'qon", "Xiva", "Navoiy", "Andijon"]

// ============ AI GENERATION ============
async function generateAI(prompt, options = {}) {
  // Try Cloudflare first
  if (config.provider === 'cloudflare' && config.cloudflareToken) {
    try {
      const res = await fetch(config.cloudflareUrl.replace('{account_id}', config.accountId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.cloudflareToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
      })
      const data = await res.json()
      if (data.result?.response) return data.result.response
    } catch (e) {
      console.log('Cloudflare failed:', e.message)
    }
  }
  
  // Try Ollama
  if (config.provider === 'ollama' || config.provider === 'fallback') {
    try {
      const res = await fetch(`${config.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'phi3:3.8b',
          prompt,
          stream: false
        })
      })
      const data = await res.json()
      if (data.response) return data.response
    } catch (e) {
      console.log('Ollama failed:', e.message)
    }
  }
  
  return null
}

// ============ BOOK GENERATION ============
function generateBookContent(category, title) {
  const mainChar = uzNames[Math.floor(Math.random() * uzNames.length)]
  const secondChar = uzNames[Math.floor(Math.random() * uzNames.length)]
  const location = cities[Math.floor(Math.random() * cities.length)]
  
  return `I bob. Boshlanish

${title} - ${category} kitobi.

${mainChar} ${location} shahrida yashaydi. U oddiy hayot kechiradi, lekin bir katta orzu bor.

Bir kuni ${mainChar} g'alati kashfiyot qiladi. Bu uning hayotini o'zgartiradi.

II bob. Rivojlanish

${mainChar} o'z yo'lini izlay boshladi. Bu yo'l oson emas.
${secondChar} unga yordam beradi. Ular birga ko'p qiyinchiliklarni yengadilar.

III bob. Markaz

Eng muhim payt keldi. ${mainChar} eng katta sinovga duch keladi.
U yaxshi yomon - hal qilishi kerak.

IV bob. Cho'qqi

${mainChar} g'alaba qozonadi! Lekin bu faqat boshlanish.

V bob. Yakun

${title} hikoyasi shu yerda tugaydi.
${mainChar} o'zgargan holda davom etadi.

Muallif: Xoleric AI
Yaratilgan: ${new Date().toLocaleString('uz-UZ')}
`
}

// ============ EXPRESS SERVER ============
import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } })

app.use(cors())
app.use(express.json())

let state = {
  agents: {
    uiMaster: { status: 'idle', work: null, lastRun: null },
    bookGenerator: { status: 'idle', work: null, lastRun: null },
    userIntelligence: { status: 'idle', work: null, lastRun: null },
    supervisor: { status: 'idle', work: null, lastRun: null }
  },
  ollama: { online: false, model: 'phi3:3.8b' },
  books: [],
  cycle: 0,
  startTime: Date.now()
}

function broadcast() {
  io.emit('state', state)
}

// API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ollama: state.ollama, cycle: state.cycle })
})

app.get('/api/agents', (req, res) => res.json(state.agents))

app.get('/api/agents/bookGenerator/run', async (req, res) => {
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
  const title = BOOK_TITLES[category][Math.floor(Math.random() * BOOK_TITLES[category].length)]
  
  state.agents.bookGenerator.status = 'working'
  state.agents.bookGenerator.work = 'Kitob generatsiya qilinmoqda...'
  broadcast()
  
  const aiContent = await generateAI(`O'zbek tilida "${title}" nomli ${category} kitob yoz. 5 bob, har biri 500+ so'z.`)
  
  const content = aiContent || generateBookContent(category, title)
  
  const book = {
    id: `book_${Date.now()}`,
    title,
    category,
    content,
    created: Date.now()
  }
  
  state.books.push(book)
  state.agents.bookGenerator.status = 'idle'
  state.agents.bookGenerator.work = 'Tayyor'
  state.agents.bookGenerator.lastRun = Date.now()
  
  broadcast()
  res.json({ success: true, book })
})

app.get('/api/cycle/run', async (req, res) => {
  state.cycle++
  
  // Generate book
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)]
  const title = BOOK_TITLES[category][Math.floor(Math.random() * BOOK_TITLES[category].length)]
  const content = await generateAI(`O'zbek tilida "${title}" nomli ${category} kitob yoz.`) || generateBookContent(category, title)
  
  const book = { id: `book_${Date.now()}`, title, category, content, created: Date.now() }
  state.books.push(book)
  
  broadcast()
  res.json({ success: true, cycle: state.cycle, book })
})

app.get('/api/books', (req, res) => res.json(state.books))

// WebSocket
io.on('connection', (socket) => {
  socket.emit('init', state)
})

// Start
const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║     🤖 XOLERIC AI - TO'LIQ ISHGA TUSHDI     ║
╚═══════════════════════════════════════╝

URL: http://localhost:${PORT}

4 TA AGENT:
  📚 Book Generator: /api/agents/bookGenerator/run
  🔄 Cycle: /api/cycle/run
  📖 Kitoblar: /api/books

Kitob generatsiya uchun:
  curl http://localhost:${PORT}/api/agents/bookGenerator/run

`)
})

export { app, httpServer, io }