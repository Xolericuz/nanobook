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
let ollamaOnline = false

const agents = {
  uiMaster: { 
    name: 'UI Master', 
    status: 'offline', 
    lastRun: null, 
    description: 'Interfeys generatsiya va yangilash' 
  },
  bookGenerator: { 
    name: 'Book Generator', 
    status: 'offline', 
    lastRun: null, 
    description: 'Kitob generatsiya va content yozish' 
  },
  userIntelligence: { 
    name: 'User Intelligence', 
    status: 'offline', 
    lastRun: null, 
    description: 'Foydalanuvchi analitika va tavsiyalar' 
  },
  supervisor: { 
    name: 'Supervisor', 
    status: 'offline', 
    lastRun: null, 
    description: 'Monitoring, nazorat va hisobot' 
  }
}

const activityLog = []

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

function broadcast(type, data) {
  io.emit(type, data)
}

function setAgentStatus(agentName, status) {
  if (agents[agentName]) {
    agents[agentName].status = status
    if (status === 'running') {
      agents[agentName].lastRun = Date.now()
    }
    broadcast('agentUpdate', { 
      agent: agentName, 
      status,
      lastRun: agents[agentName].lastRun
    })
  }
}

function addLog(agent, action, status) {
  activityLog.unshift({
    id: Date.now(),
    timestamp: Date.now(),
    agent,
    action,
    status
  })
  if (activityLog.length > 50) activityLog.pop()
  broadcast('logUpdate', activityLog)
}

// API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

app.get('/api/ollama/check', async (req, res) => {
  const online = await checkOllama()
  res.json({ online, model: 'phi3:3.8b' })
})

app.get('/api/agents', (req, res) => {
  res.json({ agents, ollamaOnline })
})

app.get('/api/agents/:name/start', async (req, res) => {
  const { name } = req.params
  
  if (!agents[name]) {
    return res.status(404).json({ error: 'Agent not found' })
  }

  setAgentStatus(name, 'running')
  addLog(name, 'Ishga tushdi', 'running')

  try {
    switch (name) {
      case 'bookGenerator': {
        addLog(name, 'Kitob generatsiya qilinmoqda...', 'running')
        await new Promise(r => setTimeout(r, 2000))
        addLog(name, 'Kitob generatsiya tugadi', 'success')
        break
      }
      case 'uiMaster': {
        addLog(name, 'UI yangilanmoqda...', 'running')
        await new Promise(r => setTimeout(r, 1000))
        addLog(name, 'UI yangilandi', 'success')
        break
      }
      case 'userIntelligence': {
        addLog(name, 'Analiz qilinmoqda...', 'running')
        await new Promise(r => setTimeout(r, 1500))
        addLog(name, 'Analiz tugadi', 'success')
        break
      }
      case 'supervisor': {
        addLog(name, 'Monitoring...', 'running')
        await new Promise(r => setTimeout(r, 500))
        addLog(name, 'Hisobot tayyor', 'success')
        break
      }
    }

    setAgentStatus(name, 'success')
    res.json({ success: true, agent: name })
  } catch (e) {
    setAgentStatus(name, 'error')
    addLog(name, `Xato: ${e.message}`, 'error')
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/agents/:name/stop', (req, res) => {
  const { name } = req.params
  if (agents[name]) {
    setAgentStatus(name, 'offline')
    addLog(name, "To'xtatildi", 'error')
    res.json({ success: true, agent: name })
  } else {
    res.status(404).json({ error: 'Agent not found' })
  }
})

app.get('/api/logs', (req, res) => {
  const limit = parseInt(req.query.limit) || 20
  res.json(activityLog.slice(0, limit))
})

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)
  
  socket.emit('init', { agents, ollamaOnline, logs: activityLog.slice(0, 20) })
  
  socket.on('startAgent', async (agentName) => {
    setAgentStatus(agentName, 'running')
    addLog(agentName, 'Ishga tushdi', 'running')
    
    await new Promise(r => setTimeout(r, 2000))
    
    setAgentStatus(agentName, 'success')
    addLog(agentName, 'Ish tugadi', 'success')
  })
  
  socket.on('stopAgent', (agentName) => {
    setAgentStatus(agentName, 'offline')
    addLog(agentName, "To'xtatildi", 'error')
  })
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`🤖 Xoleric Agent Server running on port ${PORT}`)
  console.log(`📡 WebSocket: ws://localhost:${PORT}`)
})

export { app, httpServer, io }