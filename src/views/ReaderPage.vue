<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBooksStore } from '@/stores/books'
import { useSettingsStore } from '@/stores/settings'

const route = useRoute()
const router = useRouter()
const booksStore = useBooksStore()
const settingsStore = useSettingsStore()

const chapterIndex = ref(0)
const pageIndex = ref(0)
const showControls = ref(true)
const isScrollMode = computed(() => settingsStore.prefs.readingMode === 'scroll')

let controlsTimer: ReturnType<typeof setTimeout> | null = null

const book = computed(() => booksStore.currentBook)
const chapters = computed(() => book.value?.chapters || [])
const currentChapter = computed(() => chapters.value[chapterIndex.value])
const totalChapters = computed(() => chapters.value.length)
const totalPages = computed(() => currentChapter.value?.pages.length || 1)

const progressPercent = computed(() => {
  if (!book.value) return 0
  const total = chapters.value.length
  return Math.round(((chapterIndex.value + 1) / total) * 100)
})

onMounted(async () => {
  const id = route.params.id as string
  await booksStore.openBook(id)
  if (book.value) {
    document.addEventListener('keydown', onKeydown)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
})

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev()
  else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') next()
  else if (e.key === 'f') toggleFullscreen()
}

function prev() {
  if (isScrollMode.value) return
  if (pageIndex.value > 0) {
    pageIndex.value--
  } else if (chapterIndex.value > 0) {
    chapterIndex.value--
    pageIndex.value = (chapters.value[chapterIndex.value]?.pages.length || 1) - 1
  }
  saveCurrentProgress()
}

function next() {
  if (isScrollMode.value) return
  if (pageIndex.value < totalPages.value - 1) {
    pageIndex.value++
  } else if (chapterIndex.value < totalChapters.value - 1) {
    chapterIndex.value++
    pageIndex.value = 0
  }
  saveCurrentProgress()
}

function goToChapter(index: number) {
  if (index >= 0 && index < totalChapters.value) {
    chapterIndex.value = index
    pageIndex.value = 0
    saveCurrentProgress()
  }
}

function saveCurrentProgress() {
  if (!book.value) return
  const total = totalChapters.value
  const progress = total > 0 ? Math.round(((chapterIndex.value + 1) / total) * 100) : 0
  booksStore.saveProgress(book.value.id, chapterIndex.value, pageIndex.value, progress)
}

function toggleControls() {
  showControls.value = !showControls.value
  if (showControls.value) {
    controlsTimer = setTimeout(() => { showControls.value = false }, 3000)
  } else if (controlsTimer) {
    clearTimeout(controlsTimer)
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {})
  } else {
    document.exitFullscreen().catch(() => {})
  }
}

function goBack() {
  saveCurrentProgress()
  router.push('/library')
}

function toggleReadingMode() {
  settingsStore.setReadingMode(isScrollMode.value ? 'paged' : 'scroll')
}

watch(() => settingsStore.prefs.fontSize, () => {})
</script>

<template>
  <div class="reader" @click="toggleControls">
    <transition name="fade">
      <header v-if="showControls" class="reader-header">
        <div class="reader-header-left">
          <button class="btn btn-ghost btn-icon" @click.stop="goBack">←</button>
          <div class="reader-title">{{ book?.title }}</div>
        </div>
        <div class="reader-header-right">
          <button class="btn btn-ghost btn-icon" @click.stop="toggleReadingMode" :title="isScrollMode ? 'Sahifali rejim' : 'Skroll rejimi'">
            {{ isScrollMode ? '📄' : '📜' }}
          </button>
          <button class="btn btn-ghost btn-icon" @click.stop="toggleFullscreen" title="To'liq ekran">⛶</button>
        </div>
      </header>
    </transition>

    <div class="reader-content" :style="{
      fontSize: settingsStore.prefs.fontSize + 'px',
      fontFamily: settingsStore.prefs.fontFamily,
    }">
      <div v-if="isScrollMode" class="scroll-content">
        <div v-for="(ch, ci) in chapters" :key="ci" class="scroll-chapter">
          <h2 class="chapter-title">{{ ch.title }}</h2>
          <div v-for="(page, pi) in ch.pages" :key="pi" class="scroll-page">
            <p>{{ page }}</p>
          </div>
        </div>
      </div>

      <div v-else class="paged-content">
        <h2 class="chapter-title">{{ currentChapter?.title }}</h2>
        <div class="page-text">
          {{ currentChapter?.pages[pageIndex] }}
        </div>
      </div>
    </div>

    <transition name="fade">
      <footer v-if="showControls" class="reader-footer">
        <div class="reader-footer-left">
          <button class="btn btn-ghost btn-sm" @click.stop="prev">Oldingi</button>
        </div>
        <div class="reader-footer-center">
          <select :value="chapterIndex" @change="goToChapter(Number(($event.target as HTMLSelectElement).value))" class="chapter-select">
            <option v-for="(ch, i) in chapters" :key="i" :value="i">{{ ch.title }}</option>
          </select>
          <span class="page-indicator" v-if="!isScrollMode">
            {{ pageIndex + 1 }} / {{ totalPages }}
          </span>
        </div>
        <div class="reader-footer-right">
          <button class="btn btn-ghost btn-sm" @click.stop="next">Keyingi</button>
        </div>
      </footer>
    </transition>

    <div class="progress-rail">
      <div class="progress-track" :style="{ width: progressPercent + '%' }" />
    </div>
  </div>
</template>

<style scoped>
.reader {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  z-index: 200;
  cursor: default;
}

.reader-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.reader-header-left, .reader-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reader-title {
  font-size: 0.9rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}

.reader-content {
  flex: 1;
  overflow-y: auto;
  padding: 80px 40px 80px;
  line-height: 1.8;
  max-width: 720px;
  margin: 0 auto;
  width: 100%;
}

.chapter-title {
  font-size: 1.3em;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--accent);
}

.paged-content .page-text {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.scroll-chapter {
  margin-bottom: 40px;
}

.scroll-page {
  margin-bottom: 16px;
}

.scroll-page p {
  margin-bottom: 8px;
}

.reader-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.reader-footer-center {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chapter-select {
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 0.8rem;
  max-width: 160px;
}

.page-indicator {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.progress-rail {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--bg-hover);
  z-index: 20;
}

.progress-track {
  height: 100%;
  background: var(--accent);
  transition: width 0.3s ease;
}

@media (max-width: 768px) {
  .reader-content {
    padding: 64px 20px 64px;
  }
  .reader-title {
    max-width: 150px;
  }
}
</style>
