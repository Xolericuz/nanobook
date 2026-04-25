#!/usr/bin/env node

// Xoleric AI - To'liq Avtonomous Tizim
// 4 AI Agent + GitHub Auto-Sync

import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { execSync, spawn } from 'child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } })

app.use(cors())
app.use(express.json())

// ============ KONFIGURATSIYA ============
const config = {
  ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
  port: process.env.PORT || 3001,
  github: {
    token: process.env.GITHUB_TOKEN,
    repo: process.env.GITHUB_REPO || 'Xolericuz/nanobook',
    branch: process.env.GITHUB_BRANCH || 'main'
  },
  autoSync: process.env.AUTO_SYNC === 'true',
  schedule: process.env.SCHEDULE || '1h'
}

const OLLAMA_MODEL = 'phi3:3.8b'

// ============ HOLAT ============
let state = {
  agents: {
    uiMaster: { status: 'idle', work: null, lastRun: null },
    bookGenerator: { status: 'idle', work: null, lastRun: null },
    userIntelligence: { status: 'idle', work: null, lastRun: null },
    supervisor: { status: 'idle', work: null, lastRun: null }
  },
  ollama: { online: false, model: null },
  books: [],
  commits: [],
  cycle: 0,
  startTime: Date.now()
}

// ============ OLLAMA FUNKTSIYLARI ============
async function checkOllama() {
  try {
    const res = await fetch(`${config.ollamaUrl}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    })
    if (res.ok) {
      const data = await res.json()
      state.ollama = {
        online: true,
        model: data.models?.[0]?.name || OLLAMA_MODEL
      }
      return true
    }
  } catch {}
  state.ollama = { online: false, model: null }
  return false
}

async function generate(prompt, options = {}) {
  const res = await fetch(`${config.ollamaUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: state.ollama.model || OLLAMA_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: options.temperature || 0.8,
        num_predict: options.max_tokens || 4000,
        ...options
      }
    })
  })
  if (!res.ok) throw new Error('Generation failed')
  const data = await res.json()
  return data.response
}

// ============ GITHUB FUNKTSIYLARI ============
async function gitCommand(cmd) {
  try {
    return execSync(cmd, { 
      encoding: 'utf-8',
      cwd: join(__dirname, '..'),
      maxBuffer: 50 * 1024 * 1024
    })
  } catch (e) {
    return e.message
  }
}

async function githubCommit(message, files = []) {
  if (!config.github.token) {
    return { error: 'GitHub token yo\'q' }
  }

  // Fayllarni qo'shish
  for (const file of files) {
    try {
      writeFileSync(join(__dirname, '..', file.path), file.content)
    } catch {}
  }

  // Git add
  await gitCommand('git add -A')
  
  // Commit
  const commitHash = await gitCommand(`git commit -m "${message}"`)
  
  // Push
  if (!commitHash.includes('nothing to commit')) {
    await gitCommand(`git push https://xoleric:${config.github.token}@github.com/${config.github.repo} HEAD`)
  }

  state.commits.unshift({
    id: Date.now(),
    message,
    files: files.map(f => f.path),
    timestamp: new Date().toISOString()
  })

  return { success: true, message }
}

// ============ 4 AI AGENT ============

// Agent 1: UI Master
async function agentUIMaster() {
  state.agents.uiMaster.status = 'working'
  state.agents.uiMaster.work = 'Analiz qilinmoqda...'
  broadcast()

  const prompt = `Sen UI Master designer. Xoleric nanobook loyihasini analiz qil.
Yangilanish kerak bo'lgan komponentlarni top.
Faqat qisqa JSON qaytar:
{
  "needs": ["komponent nomi"],
  "priority": 1-5,
  "ideas": ["yangi idea"]
}`
  
  const analysis = await generate(prompt)
  
  state.agents.uiMaster.work = 'UI yangilandi'
  state.agents.uiMaster.lastRun = Date.now()
  state.agents.uiMaster.status = 'idle'
  
  return { analysis }
}

// Agent 2: Book Generator
async function agentBookGenerator() {
  state.agents.bookGenerator.status = 'working'
  state.agents.bookGenerator.work = 'Kitob generatsiya qilinmoqda...'
  broadcast()

  const categories = ['Falsafa', 'Texnologiya', 'Psixologiya', 'Hikoya', 'Sci-Fi']
  const titles = {
    Falsafa: ["Hayot ma'nosi", "Vaqt oqimi", "Yo'qotish va topish"],
    Texnologiya: ["Sun'iy ong", "Kod yuragi", "Algoritm shahri"],
    Psixologiya: ["Ong labirinti", "Qo'rquv sababi", "Motivatsiya"],
    Hikoya: ["Yo'qolgan shahar", "Oxirgi odam", "Vaqt sayohati"],
    'Sci-Fi': ["Mars koloniyasi", "Yolg'iz kosmos", "Yulduzlar"]
  }
  
  const category = categories[Math.floor(Math.random() * categories.length)]
  const title = titles[category][Math.floor(Math.random() * titles[category].length)]
  
  const prompt = `O'zbek tilida "${title}" nomli ${category} kitob yoz.
5 ta bob, har biri 800+ so'z. Original syujet.

Format (faqat JSON):
{
  "title": "${title}",
  "category": "${category}",
  "chapters": [
    {"title": "I bob", "content": "..."},
    {"title": "II bob", "content": "..."},
    {"title": "III bob", "content": "..."},
    {"title": "IV bob", "content": "..."},
    {"title": "V bob", "content": "..."}
  ]
}`

  const bookContent = await generate(prompt)
  
  // Parse JSON
  let bookData
  try {
    const match = bookContent.match(/\{[\s\S]*\}/)
    if (match) bookData = JSON.parse(match[0])
  } catch {}

  // Save book
  const bookFile = `generated-books/${category.toLowerCase()}-${Date.now()}.json`
  
  if (bookData) {
    writeFileSync(join(__dirname, '..', bookFile), JSON.stringify(bookData, null, 2))
    state.books.push({ ...bookData, file: bookFile, created: Date.now() })
    
    // Auto-commit
    if (config.autoSync) {
      await githubCommit(`🤖 AI: ${title} kitobi generatsiya qilindi`, [
        { path: bookFile, content: JSON.stringify(bookData, null, 2) }
      ])
    }
  }

  state.agents.bookGenerator.work = 'Kitob tugadi'
  state.agents.bookGenerator.lastRun = Date.now()
  state.agents.bookGenerator.status = 'idle'
  
  return { book: bookData, file: bookFile }
}

// Agent 3: User Intelligence
async function agentUserIntelligence() {
  state.agents.userIntelligence.status = 'working'
  state.agents.userIntelligence.work = 'Foydalanuvchi analiz qilinmoqda...'
  broadcast()

  const prompt = `Sen User Intelligence analitik.
Xoleric foydalanuvchilari qanday contentlar Read ko'proq?
Qisqa tahlil qil va tavsiyalar ber.

Format JSON:
{
  "insights": ["insight1"],
  "recommendations": ["rec1"],
  "trends": ["trend1"]
}`

  const insights = await generate(prompt)
  
  state.agents.userIntelligence.work = 'Analiz tugadi'
  state.agents.userIntelligence.lastRun = Date.now()
  state.agents.userIntelligence.status = 'idle'
  
  return { insights }
}

// Agent 4: Supervisor
async function agentSupervisor() {
  state.agents.supervisor.status = 'working'
  state.agents.supervisor.work = 'Monitoring qilinmoqda...'
  broadcast()

  const prompt = `Sen Supervisor - tizim nazoratchisi.
Xoleric tizimining holatini bahola.
Jami kitoblar: ${state.books.length}
Agent holatlari: ${JSON.stringify(state.agents)}
GitHub ulanish: ${config.github.token ? 'Bor' : 'Yo\'q'}

Qisqa hisobot tuz JSONda:
{
  "health": "good/bad/warning",
  "issues": ["issue1"],
  "recommendations": ["rec1"]
}`

  const report = await generate(prompt)
  
  state.agents.supervisor.work = 'Monitoring tugadi'
  state.agents.supervisor.lastRun = Date.now()
  state.agents.supervisor.status = 'idle'
  
  return { report }
}

// ============ AUTO CYCLE ============
async function runAutoCycle() {
  state.cycle++
  console.log(`\n🔄 Auto Cycle #${state.cycle} boshlandi...`)
  
  // 1. Supervisor tekshiradi
  console.log('👁️ Supervisor ishga tushdi...')
  await agentSupervisor()
  
  // 2. Book Generator kitob yaratadi
  console.log('📚 Book Generator ishga tushdi...')
  const book = await agentBookGenerator()
  console.log(`✅ Kitob: ${book.book?.title}`)
  
  // 3. UI Master yangilanish kerakmi?
  console.log('🎨 UI Master ishga tushdi...')
  await agentUIMaster()
  
  // 4. User Intelligence analiz
  console.log('🧠 User Intelligence ishga tushdi...')
  await agentUserIntelligence()
  
  console.log(`\n✅ Cycle #${state.cycle} tugadi!`)
  
  broadcast()
}

// ============ API ROUTES ============
app.get('/api/health', async (req, res) => {
  await checkOllama()
  res.json({
    status: 'ok',
    ollama: state.ollama,
    uptime: process.uptime(),
    cycle: state.cycle
  })
})

app.get('/api/agents', (req, res) => {
  res.json(state.agents)
})

app.get('/api/agents/:name/run', async (req, res) => {
  const { name } = req.params
  const agents = { uiMaster: agentUIMaster, bookGenerator: agentBookGenerator, userIntelligence: agentUserIntelligence, supervisor: agentSupervisor }
  
  if (!agents[name]) {
    return res.status(404).json({ error: 'Agent topilmadi' })
  }
  
  try {
    const result = await agents[name]()
    res.json({ success: true, agent: name, result })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/cycle/run', async (req, res) => {
  try {
    await runAutoCycle()
    res.json({ success: true, cycle: state.cycle })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/books', (req, res) => {
  res.json(state.books)
})

app.get('/api/github/status', (req, res) => {
  res.json({
    token: !!config.github.token,
    repo: config.github.repo,
    autoSync: config.autoSync,
    commits: state.commits.slice(0, 10)
  })
})

app.post('/api/github/sync', async (req, res) => {
  const { message, files } = req.body
  try {
    const result = await githubCommit(message, files)
    res.json(result)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ============ WEBSOCKET ============
function broadcast() {
  io.emit('state', state)
}

io.on('connection', (socket) => {
  socket.emit('init', state)
})

// ============ AUTO SCHEDULER ============
let scheduleInterval = null

function startScheduler() {
  const ms = {
    '1m': 60000,
    '5m': 300000,
    '1h': 3600000,
    '1d': 86400000
  }
  
  const interval = ms[config.schedule] || 3600000
  
  scheduleInterval = setInterval(runAutoCycle, interval)
  console.log(`⏰ Auto-scheduler boshlandi: har ${config.schedule}`)
}

// ============ START ============
httpServer.listen(config.port, async () => {
  console.log(`
╔══════════════════════════════════════════╗
║        🤖 XOLERIC AI - TO'LIQ AVTONOMOUS   ║
╚══════════════════════════════════════════╝
  
URL: http://localhost:${config.port}
Ollama: ${config.ollamaUrl}

4 TA AI AGENT:
  🎨 UI Master     - UI/Design
  📚 Book Generator - Kitob generatsiya
  🧠 User Intelligence - Analitika
  👁️ Supervisor   - Monitoring

GitHub: ${config.github.token ? '✅ Ulanagan' : '❌ Token yo\'q'}
Auto-Sync: ${config.autoSync ? '✅ Yoqilgan' : '❌ O\'chi'}

API:
  GET  /api/health         - Holat
  GET  /api/agents       - Agent holatlari
  GET  /api/agents/:run  - Agent ishga tushirish
  GET  /api/cycle/run    - To'liq cycle
  GET  /api/books        - Jami kitoblar
  POST /api/github/sync  - GitHubga push
`)
  
  await checkOllama()
  console.log(`Ollama: ${state.ollama.online ? '✅ Online' : '❌ Offline'}`)
  
  if (config.autoSync) {
    startScheduler()
  }
})

export { app, httpServer, io }