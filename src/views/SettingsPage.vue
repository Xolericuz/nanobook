<template>
  <div class="settings-page">
    <AppHeader title="Sozlamalar" />

    <div class="settings-content">
      <!-- Ko'rinish Settings -->
      <section class="settings-section">
        <h2>Ko'rinish</h2>
        
        <div class="setting-item">
          <label>Rejim</label>
          <div class="toggle-group">
            <button 
              :class="{ active: settings.theme === 'dark' }"
              @click="setTheme('dark')"
            >
              Qorong'ilik
            </button>
            <button 
              :class="{ active: settings.theme === 'light' }"
              @click="setTheme('light')"
            >
              Yorug'lik
            </button>
          </div>
        </div>

        <div class="setting-item">
          <label>Shrift o'lchami: {{ settings.fontSize }}px</label>
          <input 
            type="range" 
            min="14" 
            max="24" 
            :value="settings.fontSize"
            @input="setFontSize(Number(($event.target as HTMLInputElement).value))"
          />
          <div class="preview-text" :style="{ fontSize: settings.fontSize + 'px' }">
            Namuna matni
          </div>
        </div>

        <div class="setting-item">
          <label>Yorqinlik: {{ settings.brightness }}%</label>
          <input 
            type="range" 
            min="50" 
            max="150" 
            :value="settings.brightness"
            @input="setBrightness(Number(($event.target as HTMLInputElement).value))"
          />
        </div>
      </section>

      <!-- Kitob Settings -->
      <section class="settings-section">
        <h2>Kitoblar</h2>
        
        <div class="setting-item">
          <label>Standart ko'rinish</label>
          <select v-model="settings.fontFamily">
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Merriweather">Merriweather</option>
          </select>
        </div>

        <div class="setting-item">
          <button class="btn-secondary" @click="exportBooks">
            Kitoblarni eksport qilish
          </button>
        </div>
      </section>

      <!-- Statistika -->
      <section class="settings-section">
        <h2>Statistika</h2>
        
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-value">{{ stats.totalBooks }}</span>
            <span class="stat-label">Jami kitoblar</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats.completedBooks }}</span>
            <span class="stat-label">O'qilgan</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ stats.favorites }}</span>
            <span class="stat-label">Sevimli</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">{{ readingTimeFormatted }}</span>
            <span class="stat-label">O'qish vaqti</span>
          </div>
        </div>
      </section>

      <!-- About -->
      <section class="settings-section">
        <h2>Ilova haqida</h2>
        <p class="about-text">
          Xoleric - AI yordamida kitob generatsiya qiluvchi zamonaviy Kutubxona.
          <br>
          Versiya: 1.0.0
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import { useSettingsStore } from '@/stores/settings'
import { useBooksStore } from '@/stores/books'
import { useUserStore } from '@/stores/user'

const settingsStore = useSettingsStore()
const booksStore = useBooksStore()
const userStore = useUserStore()

const settings = computed(() => settingsStore.settings)

const stats = computed(() => ({
  totalBooks: booksStore.books.length,
  completedBooks: booksStore.books.filter(b => b.progress >= 100).length,
  favorites: booksStore.favorites.length
}))

const readingTimeFormatted = computed(() => {
  const mins = Math.floor((userStore.user?.totalReadingTime || 0) / 60)
  if (mins < 60) return `${mins}daq`
  const hours = Math.floor(mins / 60)
  return `${hours}soat ${mins % 60}daq`
})

function setTheme(theme: 'dark' | 'light') {
  settingsStore.setTheme(theme)
}

function setFontSize(size: number) {
  settingsStore.setFontSize(size)
}

function setBrightness(value: number) {
  settingsStore.setBrightness(value)
}

function exportBooks() {
  const data = JSON.stringify(booksStore.books, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'xoleric-books.json'
  a.click()
}

onMounted(() => {
  settingsStore.loadSettings()
  booksStore.loadBooks()
  userStore.initUser()
})
</script>

<style scoped lang="scss">
.settings-page {
  padding-bottom: 100px;
}

.settings-content {
  padding: 20px;
}

.settings-section {
  margin-bottom: 32px;
  
  h2 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-main);
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
}

.setting-item {
  margin-bottom: 20px;
  
  label {
    display: block;
    font-size: 14px;
    color: var(--text-muted);
    margin-bottom: 8px;
  }

  input[type="range"] {
    width: 100%;
    height: 4px;
    -webkit-appearance: none;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    outline: none;
    
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px;
      height: 20px;
      background: var(--accent-cyan);
      border-radius: 50%;
      cursor: pointer;
    }
  }

  select {
    width: 100%;
    padding: 12px;
    background: var(--bg-card);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: var(--text-main);
    font-size: 16px;
  }
}

.toggle-group {
  display: flex;
  gap: 8px;
  
  button {
    flex: 1;
    padding: 12px;
    background: var(--bg-card);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: var(--text-muted);
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &.active {
      background: var(--accent-cyan);
      color: var(--bg-main);
      border-color: var(--accent-cyan);
    }
    
    &:hover:not(.active) {
      border-color: var(--accent-cyan);
    }
  }
}

.preview-text {
  margin-top: 12px;
  padding: 16px;
  background: var(--bg-card);
  border-radius: 8px;
  color: var(--text-main);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-card {
  padding: 16px;
  background: var(--bg-card);
  border-radius: 12px;
  text-align: center;
  
  .stat-value {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: var(--accent-cyan);
    margin-bottom: 4px;
  }
  
  .stat-label {
    font-size: 12px;
    color: var(--text-muted);
  }
}

.btn-secondary {
  padding: 12px 20px;
  background: transparent;
  border: 1px solid var(--accent-cyan);
  border-radius: 8px;
  color: var(--accent-cyan);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--accent-cyan);
    color: var(--bg-main);
  }
}

.about-text {
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
}
</style>