import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
})

app.use(cors())
app.use(express.json())

const OLLAMA_URL = 'http://localhost:11434'
const MODEL = 'phi3:3.8b'

// State
let ollamaOnline = false
let generationHistory = []
let autoModeEnabled = true
let isRunning = false
let lastGeneration = Date.now()

// Autonomous Agent States
const autonomousState = {
  cycle: 0,
  thinking: false,
  improving: false,
  generating: false,
  lastThought: null,
  selfQuestions: [],
  lastBookGenerated: null
}

// 4 Autonomous Agents
const agents = {
  uiMaster: { 
    name: 'UI Master', 
    role: 'designer',
    status: 'idle',
    thoughts: [],
    improvements: [],
    lastAction: null
  },
  bookGenerator: { 
    name: 'Book Generator', 
    role: 'creator',
    status: 'idle',
    thoughts: [],
    improvements: [],
    lastAction: null
  },
  userIntelligence: { 
    name: 'User Intelligence', 
    role: 'analyst',
    status: 'idle',
    thoughts: [],
    improvements: [],
    lastAction: null
  },
  supervisor: { 
    name: 'Supervisor', 
    role: 'monitor',
    status: 'idle',
    thoughts: [],
    improvements: [],
    lastAction: null
  }
}

const activityLog = []

// Categories for unique books
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

const uzNames = [
  "Azamat", "Bahodir", "Gulshan", "Madina", "Sardor", "Malika", "Rustam", "Zebo", "Kamron", "Sevara"
]

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

async function checkOllama() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { 
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    })
    ollamaOnline = res.ok
    return res.ok
  } catch {
    ollamaOnline = false
    return false
  }
}

async function generateWithAI(prompt) {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.8, num_predict: 2000 }
      })
    })
    
    if (!response.ok) throw new Error('AI error')
    
    const data = await response.json()
    return data.response
  } catch (e) {
    console.log('AI fallback:', e.message)
    return null
  }
}

function generateBookContent(category, title) {
  const mainChar = randomElement(uzNames)
  const secondChar = randomElement(uzNames)
  const location = randomElement(["Toshkent", "Samarqand", "Buxoro", "Farg'ona", "Qo'qon"])
  
  return `I bob. Boshlanish

${title} - ${category} kitobi.

${mainChar} ${location} shahrida yashaydi. U oddiy hayot kechiradi, lekin bir orzu bor - u katta narsalarga intiladi.

Bir kuni ${mainChar} g'alati kashfiyot qiladi. Bu kashfiyot uning butun hayotini o'zgartiradi.

II bob. Rivojlanish

${mainChar} o'z yo'lini izlay boshladi. Bu yo'l oson emas.
${secondChar} unga yordam beradi. Ular birga ishlaydilib, ko'p qiyinchiliklarni yengadilar.

Har bir kashfiyot - yangi qadam. Har bir muammo - yangi dars.

III bob. Markaz

Eng muhim payt keldi. ${mainChar} o'ziga duch keladi - bu eng katta sinov.
U yaxshi yo yomon - hal qilishi kerak.

Bu paytda ${secondChar} ham muhim rol o'ynaydi.

IV bob. Cho'qqi

${mainChar} eng katta to'siqqa duch keladi. Bu to'siqni yengish uchun uning ichki kuchi kerak.
Va nihoyat - g'alaba! Lekin bu faqat boshlanish.

V bob. Yakun

${title} hikoyasi shu yerda tugaydi, lekin ${mainChar}ning hikoyasi davom etadi.
U o'zgargan. Endi u boshqacha qaraydi.

${mainChar} barcha sinovlardan o'tdi va g'alaba qozondi.
Oxirgi so'z: "Hayotim o'zgardi, lekin eng muhimi - men o'zgarmadim."
`
}

function broadcast(type, data) {
  io.emit(type, data)
}

function addLog(agent, action, status) {
  activityLog.unshift({
    id: Date.now(),
    timestamp: Date.now(),
    agent,
    action,
    status
  })
  if (activityLog.length > 100) activityLog.pop()
  broadcast('logUpdate', activityLog)
}

// ===== AUTONOMOUS AGENT THINKING =====
async function agentThink(agentName) {
  const agent = agents[agentName]
  if (!agent) return
  
  agent.status = 'thinking'
  broadcast('agentUpdate', getAgentStates())
  
  // Self question - each agent asks itself
  const selfQuestions = {
    uiMaster: [
      "UI yaxshiroq bo'lishi mumkinmi?",
      "Foydalanuvchi tajribasi qanday yaxshilansa bo'ladi?",
      "Yangi design elementlar kerakmi?"
    ],
    bookGenerator: [
      "Yangi kitob mavzusi kerakmi?",
      "Content unique bo'lishi uchun nima qilishim kerak?",
      "Qaysi kategoriyada kam kitob bor?"
    ],
    userIntelligence: [
      "Foydalanuvchi qiziqishlari o'zgarmoqdami?",
      "Qanday tavsiyalar bersam yaxshi bo'ladi?",
      "O'qish vaqti o'zgaryapti?"
    ],
    supervisor: [
      "Tizim sog'lom ishlayaptimi?",
      "Performance yaxshimi?",
      "Xatolar bormi?"
    ]
  }
  
  const question = randomElement(selfQuestions[agentName] || ["How can I improve?"])
  const thought = `[${agentName}] ${question} - Men o'ylanaman...`
  
  agent.thoughts.unshift({ 
    id: Date.now(), 
    thought, 
    time: Date.now() 
  })
  if (agent.thoughts.length > 10) agent.thoughts.pop()
  
  addLog(agentName, thought, 'running')
  broadcast('thoughtUpdate', getThoughtStates())
  
  // Simulate thinking
  await new Promise(r => setTimeout(r, 1500))
  
  // Self answer/improvement
  const improvements = {
    uiMaster: ["Design yangilash", "Animation qo'shish", "Responsive fixes"],
    bookGenerator: ["Content yaxshilash", "Struktura takomillashtirish", "Unique mavzu"],
    userIntelligence: ["Analiz yangilash", "Tavsiyalar yaxshilash", "Pattern topish"],
    supervisor: ["Status tekshirish", "Health check", "Log analiz qilish"]
  }
  
  const improvement = randomElement(improvements[agentName] || ["Improve"])
  agent.improvements.unshift({ 
    id: Date.now(), 
    improvement, 
    time: Date.now() 
  })
  if (agent.improvements.length > 10) agent.improvements.pop()
  
  agent.lastAction = improvement
  agent.status = 'idle'
  
  broadcast('agentUpdate', getAgentStates())
  
  return improvement
}

function getAgentStates() {
  const states = {}
  Object.keys(agents).forEach(key => {
    states[key] = {
      status: agents[key].status,
      lastAction: agents[key].lastAction,
      role: agents[key].role
    }
  })
  return states
}

function getThoughtStates() {
  const thoughts = {}
  Object.keys(agents).forEach(key => {
    thoughts[key] = agents[key].thoughts.slice(0, 5)
  })
  return thoughts
}

// ===== AUTONOMOUS BOOK GENERATION =====
async function autonomousGenerateBook() {
  autonomousState.generating = true
  broadcast('autonomousState', autonomousState)
  
  const category = randomElement(CATEGORIES)
  const title = randomElement(BOOK_TITLES[category] || ["New Book"])
  
  addLog('bookGenerator', `🔮 Auto-generatsiya boshlandi: ${title}`, 'running')
  
  // Each agent contributes
  await agentThink('uiMaster')
  await agentThink('bookGenerator')
  await agentThink('userIntelligence')
  await agentThink('supervisor')
  
  // Generate book content
  let content
  if (ollamaOnline) {
    await addLog('bookGenerator', '🤖 AI content generatsiya qilmoqda...', 'running')
    const aiContent = await generateWithAI(
      `O'zbek tilida "${title}" nomli ${category} kitob yoz. 5 bob, har biri 500+ so'z. Original syujet.`
    )
    content = aiContent || generateBookContent(category, title)
  } else {
    content = generateBookContent(category, title)
  }
  
  const book = {
    id: `book_${Date.now()}`,
    title,
    author: 'Xoleric AI',
    category,
    description: `${title} - ${category} janridagi kitob`,
    content,
    chapters: [
      { id: `${id}-1`, title: 'I bob', pages: [content.substring(0, 1500)] },
      { id: `${id}-2`, title: 'II bob', pages: [content.substring(1500, 3000)] },
      { id: `${id}-3`, title: 'III bob', pages: [content.substring(3000, 4500)] },
      { id: `${id}-4`, title: 'IV bob', pages: [content.substring(4500, 6000)] },
      { id: `${id}-5`, title: 'V bob', pages: [content.substring(6000, 7500)] }
    ],
    progress: 0,
    lastRead: 0,
    isFavorite: false,
    addedAt: Date.now(),
    totalPages: 5
  }
  
  generationHistory.unshift(book)
  autonomousState.lastBookGenerated = book
  lastGeneration = Date.now()
  
  addLog('bookGenerator', `✅ Kitob generatsiya tugadi: ${title}`, 'success')
  
  broadcast('bookGenerated', book)
  
  autonomousState.generating = false
  autonomousState.cycle++
  broadcast('autonomousState', autonomousState)
  
  return book
}

// ===== AUTO SCHEDULER =====
let autoSchedulerInterval = null

function startAutoScheduler() {
  if (autoSchedulerInterval) {
    clearInterval(autoSchedulerInterval)
  }
  
  console.log('⏰ Auto-scheduler boshlandi: Har 1 soatda')
  
  // Run every hour (3600000 ms)
  autoSchedulerInterval = setInterval(async () => {
    if (autoModeEnabled && !isRunning) {
      isRunning = true
      console.log('🔄 Auto-generation cycle:', autonomousState.cycle + 1)
      
      try {
        await autonomousGenerateBook()
      } catch (e) {
        console.error('Auto-gen xato:', e)
      }
      
      isRunning = false
    }
  }, 3600000) // 1 hour
  
  // Also run immediately on start
  setTimeout(async () => {
    if (autoModeEnabled) {
      isRunning = true
      await autonomousGenerateBook()
      isRunning = false
    }
  }, 5000) // Start after 5 seconds
}

function stopAutoScheduler() {
  if (autoSchedulerInterval) {
    clearInterval(autoSchedulerInterval)
    autoSchedulerInterval = null
    console.log('⏹️ Auto-scheduler to\'xtatildi')
  }
}

// API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    autoMode: autoModeEnabled,
    cycle: autonomousState.cycle,
    lastBook: autonomousState.lastBookGenerated?.title
  })
})

app.get('/api/ollama/check', async (req, res) => {
  const online = await checkOllama()
  res.json({ online, model: MODEL })
})

app.get('/api/autonomous/status', (req, res) => {
  res.json({
    enabled: autoModeEnabled,
    running: isRunning,
    cycle: autonomousState.cycle,
    lastGeneration: new Date(lastGeneration).toISOString(),
    lastBook: autonomousState.lastBookGenerated,
    agents: getAgentStates()
  })
})

app.get('/api/autonomous/start', async (req, res) => {
  if (!autoModeEnabled) {
    autoModeEnabled = true
    startAutoScheduler()
  }
  res.json({ success: true, message: 'Auto-rejim ishga tushdi' })
})

app.get('/api/autonomous/stop', (req, res) => {
  autoModeEnabled = false
  stopAutoScheduler()
  res.json({ success: true, message: 'Auto-rejim to\'xtatildi' })
})

app.get('/api/autonomous/generate', async (req, res) => {
  try {
    const book = await autonomousGenerateBook()
    res.json({ success: true, book })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/autonomous/think', async (req, res) => {
  try {
    // Make all 4 agents think
    for (const agent of ['uiMaster', 'bookGenerator', 'userIntelligence', 'supervisor']) {
      await agentThink(agent)
    }
    res.json({ success: true, thoughts: getThoughtStates() })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/agents', (req, res) => {
  res.json({ agents: getAgentStates(), ollamaOnline })
})

app.get('/api/agents/:name/think', async (req, res) => {
  const { name } = req.params
  if (!agents[name]) {
    return res.status(404).json({ error: 'Agent not found' })
  }
  
  try {
    await agentThink(name)
    res.json({ success: true, agent: name })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/logs', (req, res) => {
  res.json(activityLog.slice(0, 50))
})

app.get('/api/ideas', (req, res) => {
  res.json({
    thoughts: getThoughtStates(),
    improvements: Object.keys(agents).map(key => ({
      agent: key,
      improvements: agents[key].improvements.slice(0, 5)
    }))
  })
})

// WebSocket - Real-time
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  
  // Send full state
  socket.emit('init', { 
    agents: getAgentStates(),
    thoughts: getThoughtStates(),
    ollamaOnline,
    autonomousState,
    logs: activityLog.slice(0, 30)
  })
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Start server
const PORT = process.env.PORT || 3001
httpServer.listen(PORT, async () => {
  console.log(`🤖 Xoleric AUTONOMOUS Agent Server`)
  console.log(`📡 Server: http://localhost:${PORT}`)
  console.log(`⚡ Auto-mode: ${autoModeEnabled ? 'ON' : 'OFF'}`)
  
  // Check Ollama
  await checkOllama()
  console.log(`🤖 Ollama: ${ollamaOnline ? 'ONLINE' : 'OFFLINE'}`)
  
  // Start auto-scheduler
  if (autoModeEnabled) {
    startAutoScheduler()
  }
})

export { app, httpServer, io }