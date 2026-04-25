<template>
  <div class="agents-page">
    <AppHeader title="🤖 AI Agentlar">
      <button class="refresh-btn" @click="refreshStatus">
        🔄
      </button>
    </AppHeader>

    <div class="agents-content">
      <!-- Ollama Status -->
      <section class="system-status">
        <h2>Tizim Statusi</h2>
        <div class="status-grid">
          <div class="status-card">
            <span class="label">Ollama</span>
            <span :class="['value', ollamaOnline ? 'online' : 'offline']">
              {{ ollamaOnline ? '✅ Online' : '❌ Offline' }}
            </span>
          </div>
          <div class="status-card">
            <span class="label">Model</span>
            <span class="value">{{ model }}</span>
          </div>
          <div class="status-card">
            <span class="label">Jami kitoblar</span>
            <span class="value">{{ totalBooks }}</span>
          </div>
          <div class="status-card">
            <span class="label">Bugun generatsiya</span>
            <span class="value">{{ generatedToday }}</span>
          </div>
        </div>
      </section>

      <!-- 4 Agents -->
      <section class="agents-section">
        <h2>AI Agentlar</h2>
        
        <div class="agents-grid">
          <!-- Agent 1: UI Master -->
          <div class="agent-card" :class="agents.uiMaster.status">
            <div class="agent-icon">🎨</div>
            <div class="agent-info">
              <h3>UI Master</h3>
              <p>Interfeys generatsiya va yangilash</p>
              <span class="agent-status">
                {{ agents.uiMaster.status === 'working' ? '🔄 Ishlamoqda...' : '⏸️ Tayyor' }}
              </span>
            </div>
          </div>

          <!-- Agent 2: Book Generator -->
          <div class="agent-card" :class="agents.bookGenerator.status">
            <div class="agent-icon">📚</div>
            <div class="agent-info">
              <h3>Book Generator</h3>
              <p>Kitob generatsiya va content yozish</p>
              <span class="agent-status">
                {{ agents.bookGenerator.status === 'working' ? '🔄 Ishlamoqda...' : '⏸️ Tayyor' }}
              </span>
            </div>
          </div>

          <!-- Agent 3: User Intelligence -->
          <div class="agent-card" :class="agents.userIntelligence.status">
            <div class="agent-icon">🧠</div>
            <div class="agent-info">
              <h3>User Intelligence</h3>
              <p>Foydalanuvchi analitika va tavsiyalar</p>
              <span class="agent-status">
                {{ agents.userIntelligence.status === 'working' ? '🔄 Ishlamoqda...' : '⏸️ Tayyor' }}
              </span>
            </div>
          </div>

          <!-- Agent 4: Supervisor -->
          <div class="agent-card" :class="agents.supervisor.status">
            <div class="agent-icon">👁️</div>
            <div class="agent-info">
              <h3>Supervisor</h3>
              <p>Monitoring, nazorat va hisobot</p>
              <span class="agent-status">
                {{ agents.supervisor.status === 'working' ? '🔄 Ishlamoqda...' : '⏸️ Tayyor' }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- Activity Log -->
      <section class="log-section">
        <h2>Activity Log</h2>
        <div class="log-list">
          <div v-for="log in recentLogs" :key="log.id" class="log-item">
            <span class="log-time">{{ formatTime(log.timestamp) }}</span>
            <span class="log-action">{{ log.action }}</span>
            <span class="log-status" :class="log.status">{{ log.status }}</span>
          </div>
          <p v-if="recentLogs.length === 0" class="no-logs">
            Hozircha log yo'q
          </p>
        </div>
      </section>

      <!-- Actions -->
      <section class="actions-section">
        <AppButton variant="primary" :loading="generating" @click="generateBook">
          {{ generating ? 'Generatsiya qilinmoqda...' : '+ Kitob Generatsiya qilish' }}
        </AppButton>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import AppButton from '@/components/common/AppButton.vue'
import { useOllamaBook } from '@/composables/useOllamaBook'
import { useBooksStore } from '@/stores/books'

const { checkOllama, ollamaAvailable, createBook: genBook } = useOllamaBook()
const booksStore = useBooksStore()

const ollamaOnline = ref(false)
const model = ref('phi3:3.8b')
const generating = ref(false)
const totalBooks = ref(0)
const generatedToday = ref(0)

const agents = reactive({
  uiMaster: { status: 'idle' as 'idle' | 'working' },
  bookGenerator: { status: 'idle' as 'idle' | 'working' },
  userIntelligence: { status: 'idle' as 'idle' | 'working' },
  supervisor: { status: 'idle' as 'idle' | 'working' }
})

const recentLogs = ref<Array<{
  id: number
  timestamp: number
  action: string
  status: string
}>>([
  { id: 1, timestamp: Date.now() - 60000, action: 'Tizim ishga tushdi', status: 'success' },
  { id: 2, timestamp: Date.now() - 120000, action: 'Ollama tekshirildi', status: 'success' },
  { id: 3, timestamp: Date.now() - 180000, action: 'Kitoblar yuklandi', status: 'success' }
])

async function refreshStatus() {
  ollamaOnline.value = await checkOllama()
  totalBooks.value = booksStore.books.length
}

async function generateBook() {
  generating.value = true
  agents.bookGenerator.status = 'working'
  
  try {
    const book = await genBook()
    booksStore.addNewBook(book)
    generatedToday.value++
    
    recentLogs.value.unshift({
      id: Date.now(),
      timestamp: Date.now(),
      action: `"${book.title}" generatsiya qilindi`,
      status: 'success'
    })
  } catch (e) {
    recentLogs.value.unshift({
      id: Date.now(),
      timestamp: Date.now(),
      action: 'Generatsiya xatosi',
      status: 'error'
    })
  } finally {
    agents.bookGenerator.status = 'idle'
    generating.value = false
  }
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('uz-UZ', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

onMounted(() => {
  refreshStatus()
})

onUnmounted(() => {
  agents.uiMaster.status = 'idle'
  agents.bookGenerator.status = 'idle'
  agents.userIntelligence.status = 'idle'
  agents.supervisor.status = 'idle'
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
    
    &.working {
      border-color: var(--accent-cyan);
      animation: pulse 2s infinite;
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
        color: var(--accent-cyan);
      }
    }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
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
  }
  
  .log-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-color);
    
    &:last-child {
      border-bottom: none;
    }
    
    .log-time {
      font-size: 12px;
      color: var(--text-muted);
    }
    
    .log-action {
      flex: 1;
      font-size: 14px;
      color: var(--text-main);
    }
    
    .log-status {
      font-size: 12px;
      
      &.success {
        color: var(--accent-green);
      }
      
      &.error {
        color: var(--accent-red);
      }
    }
  }
  
  .no-logs {
    padding: 20px;
    text-align: center;
    color: var(--text-muted);
    font-size: 14px;
  }
}

.actions-section {
  display: flex;
  justify-content: center;
}
</style>