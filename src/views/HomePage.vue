<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBooksStore } from '@/stores/books'
import { useUserStore } from '@/stores/user'
const router = useRouter()
const booksStore = useBooksStore()
const userStore = useUserStore()

const stats = computed(() => booksStore.stats)
const recent = computed(() => booksStore.recentlyRead)
const fav = computed(() => booksStore.favorites.slice(0, 6))

const categories = [
  { name: 'Roman', icon: '📖' },
  { name: 'Sci-Fi', icon: '🚀' },
  { name: 'Fantasy', icon: '🐉' },
  { name: 'Detektiv', icon: '🔍' },
  { name: 'Falsafa', icon: '💭' },
  { name: 'Drama', icon: '🎭' },
  { name: 'Psixologiya', icon: '🧠' },
  { name: 'Tarix', icon: '📜' },
]

function goToReader(id: string) {
  router.push(`/reader/${id}`)
}

function goToLibrary(cat?: string) {
  if (cat) booksStore.setCategory(cat)
  router.push('/library')
}

function getInitials(title: string): string {
  return title.charAt(0).toUpperCase()
}

const colors = [
  '#7c5cfc', '#f5b342', '#34d399', '#60a5fa',
  '#f87171', '#a78bfa', '#f472b6', '#38bdf8',
]
</script>

<template>
  <div class="home">
    <header class="page-header">
      <div>
        <h1 class="page-title">
          Xush kelibsiz, {{ userStore.displayName }}
        </h1>
        <p class="page-subtitle">Bugun nima o'qimoqchisiz?</p>
      </div>
      <button class="btn btn-primary" @click="goToLibrary()">
        Kutubxona
      </button>
    </header>

    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">Kitoblar</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.completed }}</div>
        <div class="stat-label">O'qilgan</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.reading }}</div>
        <div class="stat-label">Jarayonda</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats.favorites }}</div>
        <div class="stat-label">Saralangan</div>
      </div>
    </div>

    <section v-if="recent.length" class="section">
      <div class="section-header">
        <h2>So'nggi o'qilganlar</h2>
        <button class="btn btn-ghost btn-sm" @click="goToLibrary()">Barchasi</button>
      </div>
      <div class="book-row">
        <div
          v-for="book in recent"
          :key="book.id"
          class="book-card-mini"
          @click="goToReader(book.id)"
        >
          <div class="mini-cover" :style="{ background: colors[book.title.length % colors.length] }">
            {{ getInitials(book.title) }}
          </div>
          <div class="mini-info">
            <div class="mini-title">{{ book.title }}</div>
            <div class="mini-author">{{ book.author }}</div>
          </div>
          <div class="mini-progress">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: book.progress + '%' }" />
            </div>
            <span class="progress-text">{{ Math.round(book.progress) }}%</span>
          </div>
        </div>
      </div>
    </section>

    <section v-if="fav.length" class="section">
      <div class="section-header">
        <h2>Saralangan kitoblar</h2>
        <button class="btn btn-ghost btn-sm" @click="goToLibrary()">Barchasi</button>
      </div>
      <div class="book-row">
        <div
          v-for="book in fav"
          :key="book.id"
          class="book-card-mini"
          @click="goToReader(book.id)"
        >
          <div class="mini-cover" :style="{ background: colors[book.title.length % colors.length] }">
            {{ getInitials(book.title) }}
          </div>
          <div class="mini-info">
            <div class="mini-title">{{ book.title }}</div>
            <div class="mini-category badge badge-accent">{{ book.category }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h2>Kategoriyalar</h2>
      </div>
      <div class="category-grid">
        <div
          v-for="cat in categories"
          :key="cat.name"
          class="category-card"
          @click="goToLibrary(cat.name)"
        >
          <span class="cat-icon">{{ cat.icon }}</span>
          <span class="cat-name">{{ cat.name }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  max-width: 960px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-top: 4px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px;
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.section-header h2 {
  font-size: 1.1rem;
  font-weight: 600;
}

.book-row {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  scrollbar-width: thin;
}

.book-card-mini {
  min-width: 200px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.book-card-mini:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}

.mini-cover {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin-bottom: 10px;
}

.mini-title {
  font-size: 0.9rem;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mini-author, .mini-category {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.mini-progress {
  margin-top: 8px;
}

.progress-bar {
  height: 4px;
  background: var(--bg-hover);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.category-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.category-card:hover {
  border-color: var(--accent);
  background: var(--accent-muted);
}

.cat-icon {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 6px;
}

.cat-name {
  font-size: 0.85rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .category-grid { grid-template-columns: repeat(2, 1fr); }
  .book-card-mini { min-width: 160px; }
}
</style>
