#!/usr/bin/env node

// Xoleric AI Server - Ollama bilan bog'langan
// Har qurilmadan foydalanish mumkin

import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } })

app.use(cors())
app.use(express.json())

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
const PORT = process.env.PORT || 3001

let ollamaStatus = { online: false, model: null, lastCheck: null }
const requestLog = []

// Ollama tekshirish
async function checkOllama() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { 
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    })
    if (res.ok) {
      const data = await res.json()
      ollamaStatus = {
        online: true,
        model: data.models?.[0]?.name || 'phi3:3.8b',
        lastCheck: Date.now()
      }
      return true
    }
  } catch (e) {}
  ollamaStatus = { online: false, model: null, lastCheck: Date.now() }
  return false
}

// AI dan javob olish
async function generateAI(prompt, options = {}) {
  const model = ollamaStatus.model || 'phi3:3.8b'
  
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature: options.temperature || 0.8,
        num_predict: options.max_tokens || 2000,
        ...options
      }
    })
  })
  
  if (!response.ok) throw new Error('Generation failed')
  
  const data = await response.json()
  return data.response
}

// API Routes
app.get('/api/health', async (req, res) => {
  await checkOllama()
  res.json({ 
    status: ollamaStatus.online ? 'ok' : 'error',
    ollama: ollamaStatus,
    timestamp: Date.now()
  })
})

app.get('/api/status', async (req, res) => {
  await checkOllama()
  res.json({
    ollama: ollamaStatus,
    requests: requestLog.slice(0, 20),
    uptime: process.uptime()
  })
})

// Kitob generatsiya
app.post('/api/generate/book', async (req, res) => {
  const { category, title, characters } = req.body
  
  const prompt = `O'zbek tilida "${title}" nomli ${category} kitob yoz. 
5 ta bob, har biri 800+ so'z. Original syujet va qahramonlar.
Boshqa tilda yozma.

Format (faqat JSON):
{
  "title": "${title}",
  "chapters": [
    {"title": "I bob", "content": "..."},
    {"title": "II bob", "content": "..."},
    {"title": "III bob", "content": "..."},
    {"title": "IV bob", "content": "..."},
    {"title": "V bob", "content": "..."}
  ]
}`

  try {
    const startTime = Date.now()
    const response = await generateAI(prompt)
    const duration = Date.now() - startTime
    
    // Log
    requestLog.unshift({
      id: Date.now(),
      type: 'book',
      title,
      duration,
      timestamp: new Date().toISOString()
    })
    
    // Parse JSON
    let bookData
    try {
      const match = response.match(/\{[\s\S]*\}/)
      if (match) bookData = JSON.parse(match[0])
    } catch {}
    
    res.json({ success: true, book: bookData, raw: response, duration })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Generic AI chat
app.post('/api/chat', async (req, res) => {
  const { message, system } = req.body
  
  const prompt = system 
    ? `${system}\n\nUser: ${message}\nAssistant:`
    : message

  try {
    const response = await generateAI(prompt)
    res.json({ success: true, response })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// WebSocket - Real-time
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  
  socket.on('generate', async (data) => {
    socket.emit('status', 'generating')
    try {
      const response = await generateAI(data.prompt)
      socket.emit('response', response)
    } catch (e) {
      socket.emit('error', e.message)
    }
  })
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Auto-check Ollama every 30s
setInterval(checkOllama, 30000)

// Start
httpServer.listen(PORT, async () => {
  console.log(`
╔═══════════════════════════════════════╗
║    🤖 Xoleric AI Server             ║
║─────────────────────────────────────║
║  URL: http://localhost:${PORT}          ║
║  Ollama: ${OLLAMA_URL}              ║
╚═══════════════════════════════════════╝
  `)
  
  await checkOllama()
  console.log('Ollama Status:', ollamaStatus.online ? '✅ Online' : '❌ Offline')
})

export { app, httpServer, io }