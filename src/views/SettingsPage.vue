<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useBooksStore } from '@/stores/books'

const settingsStore = useSettingsStore()
const booksStore = useBooksStore()

const fonts = ['Inter', 'Roboto', 'Open Sans', 'Merriweather', 'Georgia', 'JetBrains Mono']
const showExportSuccess = ref(false)

function exportData() {
  const data = JSON.stringify(booksStore.books, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'xoleric-books.json'
  a.click()
  URL.revokeObjectURL(url)
  showExportSuccess.value = true
  setTimeout(() => { showExportSuccess.value = false }, 2000)
}
</script>

<template>
  <div class="settings">
    <header class="page-header">
      <h1 class="page-title">Sozlamalar</h1>
    </header>

    <section class="section">
      <h3 class="section-title">Tashqi ko'rinish</h3>

      <div class="setting-item">
        <div class="setting-label">
          <span>Mavzu</span>
          <span class="setting-desc">{{ settingsStore.prefs.theme === 'dark' ? 'Qorong\'i' : 'Yorug\'' }}</span>
        </div>
        <button
          class="theme-toggle"
          :class="{ dark: settingsStore.prefs.theme === 'dark' }"
          @click="settingsStore.setTheme(settingsStore.prefs.theme === 'dark' ? 'light' : 'dark')"
        >
          <span class="toggle-thumb" />
        </button>
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <span>Shrift o'lchami</span>
          <span class="setting-desc">{{ settingsStore.prefs.fontSize }}px</span>
        </div>
        <input
          type="range"
          min="12"
          max="32"
          :value="settingsStore.prefs.fontSize"
          @input="settingsStore.setFontSize(Number(($event.target as HTMLInputElement).value))"
          class="range-slider"
        />
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <span>Yorqinlik</span>
          <span class="setting-desc">{{ settingsStore.prefs.brightness }}%</span>
        </div>
        <input
          type="range"
          min="30"
          max="150"
          :value="settingsStore.prefs.brightness"
          @input="settingsStore.setBrightness(Number(($event.target as HTMLInputElement).value))"
          class="range-slider"
        />
      </div>

      <div class="setting-item">
        <div class="setting-label">
          <span>O'qish rejimi</span>
          <span class="setting-desc">{{ settingsStore.prefs.readingMode === 'scroll' ? 'Skroll' : 'Sahifali' }}</span>
        </div>
        <select
          :value="settingsStore.prefs.readingMode"
          @change="settingsStore.setReadingMode(($event.target as HTMLSelectElement).value as any)"
          class="setting-select"
        >
          <option value="paged">Sahifali</option>
          <option value="scroll">Skroll</option>
        </select>
      </div>
    </section>

    <section class="section">
      <h3 class="section-title">Matn sozlamalari</h3>

      <div class="setting-item">
        <div class="setting-label">
          <span>Shrift turi</span>
        </div>
        <select
          :value="settingsStore.prefs.fontFamily"
          @change="settingsStore.setFontFamily(($event.target as HTMLSelectElement).value)"
          class="setting-select"
        >
          <option v-for="f in fonts" :key="f" :value="f">{{ f }}</option>
        </select>
      </div>

      <div class="preview-box" :style="{ fontFamily: settingsStore.prefs.fontFamily, fontSize: settingsStore.prefs.fontSize + 'px' }">
        <p>Bu matn shrift o'zgarishini ko'rsatish uchun namuna. Siz o'qish paytida qulay shrift va o'lchamni tanlashingiz mumkin.</p>
      </div>
    </section>

    <section class="section">
      <h3 class="section-title">Ma'lumotlar</h3>

      <div class="setting-item">
        <div class="setting-label">
          <span>Kitoblarni eksport qilish</span>
          <span class="setting-desc">JSON formatida</span>
        </div>
        <button class="btn btn-outline btn-sm" @click="exportData">
          {{ showExportSuccess ? '✓ Eksport qilindi' : 'Eksport' }}
        </button>
      </div>
    </section>

    <section class="section">
      <h3 class="section-title">Ilova haqida</h3>

      <div class="about-info">
        <div class="about-row">
          <span>Versiya</span>
          <span>2.0.0</span>
        </div>
        <div class="about-row">
          <span>Platforma</span>
          <span>Web</span>
        </div>
        <div class="about-row">
          <span>Kitoblar</span>
          <span>{{ booksStore.books.length }} ta</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.settings {
  max-width: 600px;
}

.page-header { margin-bottom: 24px; }
.page-title { font-size: 1.5rem; font-weight: 700; }

.section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 20px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-secondary);
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  gap: 16px;
}

.setting-item:last-child { border-bottom: none; }

.setting-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.9rem;
}

.setting-desc {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.theme-toggle {
  width: 48px;
  height: 26px;
  background: var(--bg-hover);
  border: 1px solid var(--border);
  border-radius: 13px;
  position: relative;
  cursor: pointer;
  transition: background var(--transition-fast);
  flex-shrink: 0;
}

.theme-toggle.dark {
  background: var(--accent);
}

.toggle-thumb {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform var(--transition-fast);
}

.theme-toggle.dark .toggle-thumb {
  transform: translateX(22px);
}

.range-slider {
  width: 140px;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--bg-hover);
  border-radius: 3px;
  outline: none;
  border: none;
  padding: 0;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
}

.setting-select {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  background: var(--bg-input);
  border: 1px solid var(--border);
  color: var(--text-primary);
  font-size: 0.85rem;
}

.preview-box {
  margin-top: 12px;
  padding: 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  line-height: 1.7;
}

.preview-box p { margin: 0; }

.about-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.about-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.about-row span:last-child {
  color: var(--text-primary);
  font-weight: 500;
}
</style>
