<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useBooksStore } from '@/stores/books'

const booksStore = useBooksStore()

interface Agent {
  name: string
  label: string
  description: string
  status: 'idle' | 'running' | 'error'
  color: string
  icon: string
}

const agents = ref<Agent[]>([
  { name: 'uiMaster', label: 'UI Master', description: 'UI/UX dizayn va takomillashtirish', status: 'idle', color: '#7c5cfc', icon: '🎨' },
  { name: 'bookGenerator', label: 'Book Generator', description: 'Avtomatik kitob yaratish', status: 'idle', color: '#f5b342', icon: '📚' },
  { name: 'userIntelligence', label: 'User Intelligence', description: 'Foydalanuvchi tahlili va tavsiyalar', status: 'idle', color: '#34d399', icon: '🧠' },
  { name: 'supervisor', label: 'Supervisor', description: 'Tizim monitoringi va hisobot', status: 'idle', color: '#60a5fa', icon: '👁' },
])

const logs = ref<{ time: string; agent: string; message: string; type: string }[]>([])
const serverConnected = ref(false)
const ollamaConnected = ref(false)
const allRunning = ref(false)

function addLog(agent: string, message: string, type: string = 'info') {
  const time = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  logs.value.unshift({ time, agent, message, type })
  if (logs.value.length > 100) logs.value.pop()
}

async function startAgent(agent: Agent) {
  agent.status = 'running'
  allRunning.value = agents.value.every(a => a.status === 'running')
  addLog(agent.label, 'Ishga tushirilmoqda...', 'start')

  if (agent.name === 'bookGenerator') {
    addLog(agent.label, 'Kitob generatsiya qilinmoqda...', 'info')
    await new Promise(r => setTimeout(r, 2000))
    addLog(agent.label, 'Kitob muvaffaqiyatli yaratildi', 'success')
    await booksStore.loadBooks()
  } else {
    await new Promise(r => setTimeout(r, 1500))
    addLog(agent.label, 'Ish bajarildi', 'success')
  }

  agent.status = 'idle'
  allRunning.value = agents.value.every(a => a.status === 'running')
}

function stopAgent(agent: Agent) {
  agent.status = 'idle'
  addLog(agent.label, 'To\'xtatildi', 'stop')
}

function startAll() {
  agents.value.forEach(a => {
    if (a.status === 'idle') startAgent(a)
  })
}

function stopAll() {
  agents.value.forEach(a => stopAgent(a))
}

onMounted(async () => {
  addLog('Tizim', 'Agent paneli yuklandi', 'info')
  try {
    const res = await fetch('http://localhost:3001/api/health').catch(() => null)
    ollamaConnected.value = res?.ok || false
    serverConnected.value = true
  } catch {
    serverConnected.value = false
  }
})
</script>

<template>
  <div class="agents">
    <header class="page-header">
      <div>
        <h1 class="page-title">AI Agentlar</h1>
        <p class="page-subtitle">Avtomatlashtirilgan kitob generatsiya tizimi</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-ghost btn-sm" @click="stopAll" :disabled="!allRunning">Stop all</button>
        <button class="btn btn-primary btn-sm" @click="startAll" :disabled="allRunning">Start all</button>
      </div>
    </header>

    <div class="status-bar">
      <div class="status-item">
        <span :class="['status-dot', serverConnected ? 'online' : 'offline']" />
        <span>Server</span>
      </div>
      <div class="status-item">
        <span :class="['status-dot', ollamaConnected ? 'online' : 'offline']" />
        <span>Ollama</span>
      </div>
      <div class="status-item">
        <span class="status-count">{{ booksStore.books.length }}</span>
        <span>Kitoblar</span>
      </div>
    </div>

    <div class="agents-grid">
      <div v-for="agent in agents" :key="agent.name" class="agent-card" :style="{ borderColor: agent.color + '40' }">
        <div class="agent-header">
          <div class="agent-icon" :style="{ background: agent.color + '20', color: agent.color }">{{ agent.icon }}</div>
          <div>
            <div class="agent-name">{{ agent.label }}</div>
            <div class="agent-desc">{{ agent.description }}</div>
          </div>
        </div>
        <div class="agent-status">
          <span :class="['badge', agent.status === 'running' ? 'badge-success' : agent.status === 'error' ? 'badge-error' : '']">
            {{ agent.status === 'running' ? 'Ishlamoqda' : agent.status === 'error' ? 'Xato' : 'Kutmoqda' }}
          </span>
        </div>
        <div class="agent-actions">
          <button
            v-if="agent.status !== 'running'"
            class="btn btn-primary btn-sm btn-block"
            @click="startAgent(agent)"
          >
            Ishga tushirish
          </button>
          <button
            v-else
            class="btn btn-outline btn-sm btn-block"
            @click="stopAgent(agent)"
          >
            To'xtatish
          </button>
        </div>
      </div>
    </div>

    <section class="section">
      <div class="section-header">
        <h3>Activity log</h3>
        <button class="btn btn-ghost btn-sm" @click="logs = []">Clear</button>
      </div>
      <div class="log-container">
        <div v-if="logs.length === 0" class="log-empty">Hozircha log yo'q</div>
        <div v-for="(log, i) in logs" :key="i" class="log-entry" :class="log.type">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-agent">{{ log.agent }}</span>
          <span class="log-msg">{{ log.message }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.agents {
  max-width: 960px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page-title { font-size: 1.5rem; font-weight: 700; }
.page-subtitle { color: var(--text-secondary); font-size: 0.85rem; margin-top: 4px; }

.header-actions { display: flex; gap: 8px; }

.status-bar {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  padding: 14px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.status-dot.online { background: var(--success); }
.status-dot.offline { background: var(--error); }
.status-count { font-weight: 600; color: var(--accent); }

.agents-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}

.agent-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 20px;
  transition: all var(--transition-fast);
}

.agent-card:hover { border-color: inherit; }

.agent-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.agent-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.agent-name { font-weight: 600; font-size: 0.95rem; }
.agent-desc { font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; }

.agent-status { margin-bottom: 12px; }

.agent-actions { margin-top: auto; }

.section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h3 { font-size: 1rem; font-weight: 600; }

.log-container {
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.log-empty {
  color: var(--text-muted);
  font-size: 0.85rem;
  text-align: center;
  padding: 20px;
}

.log-entry {
  display: flex;
  gap: 8px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  align-items: baseline;
}

.log-entry:hover { background: var(--bg-hover); }

.log-time { color: var(--text-muted); font-family: var(--font-mono); font-size: 0.75rem; flex-shrink: 0; }
.log-agent { font-weight: 500; flex-shrink: 0; }
.log-msg { color: var(--text-secondary); }

.log-entry.success .log-msg { color: var(--success); }
.log-entry.error .log-msg { color: var(--error); }
.log-entry.start .log-msg { color: var(--info); }
.log-entry.stop .log-msg { color: var(--warning); }

@media (max-width: 768px) {
  .agents-grid { grid-template-columns: 1fr; }
}
</style>
