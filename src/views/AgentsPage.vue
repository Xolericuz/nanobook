<template>
  <div class="agents-page">
    <AppHeader title="🤖 AI Agentlar">
      <button class="refresh-btn" @click="refreshStatus">
        🔄
      </button>
    </AppHeader>

    <div class="agents-content">
      <!-- System Status -->
      <section class="system-status">
        <h2>Tizim Statusi</h2>
        <div class="status-grid">
          <div class="status-card">
            <span class="label">Ollama</span>
            <span :class="['value', systemStatus.ollamaOnline ? 'online' : 'offline']">
              {{ systemStatus.ollamaOnline ? '✅ Online' : '❌ Offline' }}
            </span>
          </div>
          <div class="status-card">
            <span class="label">Server</span>
            <span :class="['value', connected ? 'online' : 'offline']">
              {{ connected ? '✅ Online' : '❌ Offline' }}
            </span>
          </div>
          <div class="status-card">
            <span class="label">Jami kitoblar</span>
            <span class="value">{{ booksStore.books.length }}</span>
          </div>
          <div class="status-card">
            <span class="label">Agentlar</span>
            <span class="value active">{{ getActiveAgents() }}/4</span>
          </div>
        </div>
      </section>

      <!-- 4 Agents -->
      <section class="agents-section">
        <h2>AI Agentlar - To'liq Nazorat</h2>
        
        <div class="agents-grid">
          <!-- Agent 1: UI Master -->
          <div 
            class="agent-card" 
            :class="{ 
              'online': agents.uiMaster.status === 'success',
              'running': agents.uiMaster.status === 'running',
              'error': agents.uiMaster.status === 'error'
            }"
          >
            <div class="agent-icon">🎨</div>
            <div class="agent-info">
              <h3>UI Master</h3>
              <p>{{ agents.uiMaster.description }}</p>
              <span class="agent-status" :class="agents.uiMaster.status">
                {{ getStatusText(agents.uiMaster.status) }}
              </span>
            </div>
            <div class="agent-controls">
              <button 
                v-if="agents.uiMaster.status !== 'running'"
                class="start-btn"
                @click="startAgent('uiMaster')"
              >
                ▶️ Ishga tushir
              </button>
              <button 
                v-if="agents.uiMaster.status === 'running'"
                class="stop-btn"
                @click="stopAgent('uiMaster')"
              >
                ⏹️ To'xtat
              </button>
            </div>
          </div>

          <!-- Agent 2: Book Generator -->
          <div 
            class="agent-card" 
            :class="{ 
              'online': agents.bookGenerator.status === 'success',
              'running': agents.bookGenerator.status === 'running',
              'error': agents.bookGenerator.status === 'error'
            }"
          >
            <div class="agent-icon">📚</div>
            <div class="agent-info">
              <h3>Book Generator</h3>
              <p>{{ agents.bookGenerator.description }}</p>
              <span class="agent-status" :class="agents.bookGenerator.status">
                {{ getStatusText(agents.bookGenerator.status) }}
              </span>
            </div>
            <div class="agent-controls">
              <button 
                v-if="agents.bookGenerator.status !== 'running'"
                class="start-btn"
                @click="startAgent('bookGenerator')"
              >
                ▶️ Ishga tushir
              </button>
              <button 
                v-if="agents.bookGenerator.status === 'running'"
                class="stop-btn"
                @click="stopAgent('bookGenerator')"
              >
                ⏹️ To'xtat
              </button>
            </div>
          </div>

          <!-- Agent 3: User Intelligence -->
          <div 
            class="agent-card" 
            :class="{ 
              'online': agents.userIntelligence.status === 'success',
              'running': agents.userIntelligence.status === 'running',
              'error': agents.userIntelligence.status === 'error'
            }"
          >
            <div class="agent-icon">🧠</div>
            <div class="agent-info">
              <h3>User Intelligence</h3>
              <p>{{ agents.userIntelligence.description }}</p>
              <span class="agent-status" :class="agents.userIntelligence.status">
                {{ getStatusText(agents.userIntelligence.status) }}
              </span>
            </div>
            <div class="agent-controls">
              <button 
                v-if="agents.userIntelligence.status !== 'running'"
                class="start-btn"
                @click="startAgent('userIntelligence')"
              >
                ▶️ Ishga tushir
              </button>
              <button 
                v-if="agents.userIntelligence.status === 'running'"
                class="stop-btn"
                @click="stopAgent('userIntelligence')"
              >
                ⏹️ To'xtat
              </button>
            </div>
          </div>

          <!-- Agent 4: Supervisor -->
          <div 
            class="agent-card" 
            :class="{ 
              'online': agents.supervisor.status === 'success',
              'running': agents.supervisor.status === 'running',
              'error': agents.supervisor.status === 'error'
            }"
          >
            <div class="agent-icon">👁️</div>
            <div class="agent-info">
              <h3>Supervisor</h3>
              <p>{{ agents.supervisor.description }}</p>
              <span class="agent-status" :class="agents.supervisor.status">
                {{ getStatusText(agents.supervisor.status) }}
              </span>
            </div>
            <div class="agent-controls">
              <button 
                v-if="agents.supervisor.status !== 'running'"
                class="start-btn"
                @click="startAgent('supervisor')"
              >
                ▶️ Ishga tushir
              </button>
              <button 
                v-if="agents.supervisor.status === 'running'"
                class="stop-btn"
                @click="stopAgent('supervisor')"
              >
                ⏹️ To'xtat
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="action-buttons">
          <AppButton 
            variant="primary" 
            :loading="loadingBook"
            @click="generateBook"
          >
            📚 +1 Kitob Generatsiya
          </AppButton>
          <AppButton 
            variant="secondary" 
            :loading="loadingAll"
            @click="startAllAgents"
          >
            🚀 Barcha Agentlarni ishga tushir
          </AppButton>
          <AppButton 
            variant="danger" 
            @click="stopAllAgents"
          >
            ⏹️ Barchasini to'xtat
          </AppButton>
        </div>
      </section>

      <!-- Activity Log -->
      <section class="log-section">
        <h2>Activity Log - Real-time</h2>
        <div class="log-list">
          <div 
            v-for="log in logs" 
            :key="log.id" 
            class="log-item"
            :class="log.status"
          >
            <span class="log-time">{{ formatTime(log.timestamp) }}</span>
            <span class="log-agent">{{ log.agent }}</span>
            <span class="log-action">{{ log.action }}</span>
            <span class="log-status-icon">
              {{ log.status === 'running' ? '⏳' : log.status === 'success' ? '✅' : '❌' }}
            </span>
          </div>
          <p v-if="logs.length === 0" class="no-logs">
            Hozircha log yo'q - agentlarni ishga tushing!
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'
import AppHeader from '@/components/common/AppHeader.vue'
import AppButton from '@/components/common/AppButton.vue'
import { useBooksStore } from '@/stores/books'

const SERVER_URL = 'http://localhost:3001'
const booksStore = useBooksStore()

const connected = ref(false)
const loadingBook = ref(false)
const loadingAll = ref(false)
let socket: Socket | null = null

const systemStatus = reactive({
  ollamaOnline: false,
  totalBooks: 0
})

const agents = reactive({
  uiMaster: { 
    status: 'offline', 
    description: 'Interfeys generatsiya va yangilash' 
  },
  bookGenerator: { 
    status: 'offline', 
    description: 'Kitob generatsiya va content yozish' 
  },
  userIntelligence: { 
    status: 'offline', 
    description: 'Foydalanuvchi analitika va tavsiyalar' 
  },
  supervisor: { 
    status: 'offline', 
    description: 'Monitoring, nazorat va hisobot' 
  }
})

const logs = ref<Array<{
  id: number
  timestamp: number
  agent: string
  action: string
  status: 'running' | 'success' | 'error'
}>>([])

async function refreshStatus() {
  try {
    const res = await fetch(`${SERVER_URL}/api/ollama/check`)
    const data = await res.json()
    systemStatus.ollamaOnline = data.online
  } catch (e) {
    systemStatus.ollamaOnline = false
  }
}

async function startAgent(name: string) {
  if (!socket?.connected) return
  
  socket.emit('startAgent', name)
}

async function stopAgent(name: string) {
  if (!socket?.connected) return
  
  socket.emit('stopAgent', name)
}

async function generateBook() {
  loadingBook.value = true
  
  try {
    const res = await fetch(`${SERVER_URL}/api/agents/bookGenerator/start`)
    if (res.ok) {
      const data = await res.json()
    }
  } catch (e) {
    console.error('Generate error:', e)
  } finally {
    loadingBook.value = false
  }
}

async function startAllAgents() {
  loadingAll.value = true
  
  for (const agent of ['uiMaster', 'bookGenerator', 'userIntelligence', 'supervisor']) {
    await startAgent(agent)
    await new Promise(r => setTimeout(r, 500))
  }
  
  loadingAll.value = false
}

async function stopAllAgents() {
  for (const agent of ['uiMaster', 'bookGenerator', 'userIntelligence', 'supervisor']) {
    await stopAgent(agent)
    await new Promise(r => setTimeout(r, 200))
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'running': return '🔄 Ishlamoqda...'
    case 'success': return '✅ Tayyor'
    case 'error': return '❌ Xato'
    default: return '⏸️ Offline'
  }
}

function getActiveAgents(): number {
  return Object.values(agents).filter(a => a.status === 'running' || a.status === 'success').length
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('uz-UZ', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(async () => {
  socket = io(SERVER_URL)
  
  socket.on('connect', () => {
    connected.value = true
    console.log('Connected to agent server')
  })
  
  socket.on('disconnect', () => {
    connected.value = false
  })
  
  socket.on('init', (data: any) => {
    if (data.agents) {
      Object.keys(data.agents).forEach(key => {
        agents[key as keyof typeof agents].status = data.agents[key].status
      })
    }
    systemStatus.ollamaOnline = data.ollamaOnline
    logs.value = data.logs || []
  })
  
  socket.on('agentUpdate', (data: any) => {
    if (agents[data.agent as keyof typeof agents]) {
      agents[data.agent as keyof typeof agents].status = data.status
    }
  })
  
  socket.on('logUpdate', (newLogs: any) => {
    logs.value = newLogs
  })
  
  await refreshStatus()
  await booksStore.loadBooks()
})

onUnmounted(() => {
  socket?.disconnect()
})
</script>

<style scoped lang="scss">
.agents-page {
  min-height: 100vh;
  background: var(--bg-main);
}

.refresh-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.agents-content {
  padding: 20px;
  padding-bottom: 100px;
}

.system-status {
  margin-bottom: 24px;
  
  h2 {
    color: var(--text-main);
    font-size: 18px;
    margin-bottom: 12px;
  }
  
  .status-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .status-card {
    background: var(--bg-card);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .label {
      font-size: 12px;
      color: var(--text-muted);
    }
    
    .value {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-main);
      
      &.online {
        color: var(--accent-green);
      }
      
      &.offline {
        color: var(--accent-red);
      }
    }
  }
}

.agents-section {
  margin-bottom: 24px;
  
  h2 {
    color: var(--text-main);
    font-size: 18px;
    margin-bottom: 12px;
  }
  
  .agents-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .agent-card {
    background: var(--bg-card);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    border: 2px solid transparent;
    transition: all 0.3s ease;
    
    &.online {
      border-color: var(--accent-green);
    }
    
    &.running {
      border-color: var(--accent-cyan);
      animation: pulse 1.5s infinite;
    }
    
    &.error {
      border-color: var(--accent-red);
    }
    
    .agent-icon {
      font-size: 32px;
    }
    
    .agent-info {
      flex: 1;
      
      h3 {
        font-size: 16px;
        color: var(--text-main);
        margin-bottom: 4px;
      }
      
      p {
        font-size: 12px;
        color: var(--text-muted);
        margin-bottom: 4px;
      }
      
      .agent-status {
        font-size: 12px;
        color: var(--text-muted);
        
        &.running { color: var(--accent-cyan); }
        &.success { color: var(--accent-green); }
        &.error { color: var(--accent-red); }
      }
    }
    
    .agent-controls {
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      button {
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 12px;
        cursor: pointer;
        border: none;
        
        &.start-btn {
          background: var(--accent-green);
          color: var(--bg-main);
        }
        
        &.stop-btn {
          background: var(--accent-red);
          color: white;
        }
      }
    }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.quick-actions {
  margin-bottom: 24px;
  
  h2 {
    color: var(--text-main);
    font-size: 18px;
    margin-bottom: 12px;
  }
  
  .action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
}

.log-section {
  margin-bottom: 24px;
  
  h2 {
    color: var(--text-main);
    font-size: 18px;
    margin-bottom: 12px;
  }
  
  .log-list {
    background: var(--bg-card);
    border-radius: 12px;
    overflow: hidden;
    max-height: 300px;
    overflow-y: auto;
  }
  
  .log-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--border-color);
    font-size: 12px;
    
    &:last-child {
      border-bottom: none;
    }
    
    .log-time {
      color: var(--text-muted);
      min-width: 70px;
    }
    
    .log-agent {
      color: var(--accent-cyan);
      min-width: 100px;
    }
    
    .log-action {
      flex: 1;
      color: var(--text-main);
    }
    
    &.running .log-status-icon { animation: blink 1s infinite; }
  }
  
  @keyframes blink {
    50% { opacity: 0.5; }
  }
  
  .no-logs {
    padding: 20px;
    text-align: center;
    color: var(--text-muted);
  }
}
</style>