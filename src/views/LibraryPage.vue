<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBooksStore } from '@/stores/books'

const router = useRouter()
const store = useBooksStore()
const searchInput = ref(store.filters.search)

const allCategories = ['Barcha', 'Roman', 'She\'r', 'Drama', 'Detektiv', 'Fantastika', 'Tarix', 'Falsafa', 'Biznes', 'Psixologiya', 'Texnologiya', 'Hikoya', 'Sci-Fi', 'Fantasy', 'Eksperimental']

const categoryCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const cat of allCategories) {
    if (cat === 'Barcha') continue
    counts[cat] = store.books.filter(b => b.category === cat).length
  }
  return counts
})

function onSearch() {
  store.setSearch(searchInput.value)
}

function selectCategory(cat: string) {
  store.setCategory(cat)
}

function selectSort(e: Event) {
  const val = (e.target as HTMLSelectElement).value as any
  store.setSort(val)
}

function openBook(id: string) {
  router.push(`/reader/${id}`)
}

function getInitials(title: string): string {
  return title.charAt(0).toUpperCase()
}

const colors = ['#7c5cfc', '#f5b342', '#34d399', '#60a5fa', '#f87171', '#a78bfa', '#f472b6', '#38bdf8']
</script>

<template>
  <div class="library">
    <header class="page-header">
      <h1 class="page-title">Kutubxona</h1>
      <span class="book-count">{{ store.filteredBooks.length }} ta kitob</span>
    </header>

    <div class="search-bar">
      <input
        v-model="searchInput"
        placeholder="Kitob nomi yoki muallif..."
        @input="onSearch"
        class="search-input"
      />
      <div class="view-toggle">
        <button
          :class="['btn', 'btn-icon', store.filters.view === 'grid' ? 'btn-primary' : 'btn-ghost']"
          title="Grid"
          @click="store.setView('grid')"
        >▦</button>
        <button
          :class="['btn', 'btn-icon', store.filters.view === 'list' ? 'btn-primary' : 'btn-ghost']"
          title="List"
          @click="store.setView('list')"
        >☰</button>
      </div>
    </div>

    <div class="categories-row">
      <button
        v-for="cat in allCategories"
        :key="cat"
        :class="['category-chip', { active: store.filters.category === cat }]"
        @click="selectCategory(cat)"
      >
        {{ cat }}
        <span v-if="cat !== 'Barcha'" class="chip-count">{{ categoryCounts[cat] || 0 }}</span>
      </button>
    </div>

    <div class="sort-row">
      <select :value="store.filters.sort" @change="selectSort" class="sort-select">
        <option value="recent">So'nggi o'qilgan</option>
        <option value="title">Nomi bo'yicha</option>
        <option value="author">Muallif bo'yicha</option>
        <option value="added">Qo'shilgan vaqti</option>
      </select>
    </div>

    <div v-if="store.isLoading" class="loading-state">
      <div class="spinner" />
      <p>Kitoblar yuklanmoqda...</p>
    </div>

    <div v-else-if="store.paginatedBooks.length === 0" class="empty-state">
      <p>Kitob topilmadi</p>
      <button class="btn btn-ghost" @click="store.setCategory('Barcha'); store.setSearch('')">
        Filtrni tozalash
      </button>
    </div>

    <div v-else-if="store.filters.view === 'grid'" class="book-grid">
      <div
        v-for="book in store.paginatedBooks"
        :key="book.id"
        class="book-card"
        @click="openBook(book.id)"
      >
        <div class="book-cover" :style="{ background: colors[book.title.length % colors.length] }">
          {{ getInitials(book.title) }}
        </div>
        <div class="book-body">
          <div class="book-title">{{ book.title }}</div>
          <div class="book-author">{{ book.author }}</div>
          <div class="book-meta">
            <span class="badge badge-accent">{{ book.category }}</span>
            <span v-if="book.progress > 0" class="book-progress">{{ Math.round(book.progress) }}%</span>
          </div>
        </div>
        <div v-if="book.isFavorite" class="favorite-star">★</div>
      </div>
    </div>

    <div v-else class="book-list">
      <div
        v-for="book in store.paginatedBooks"
        :key="book.id"
        class="list-item"
        @click="openBook(book.id)"
      >
        <div class="list-cover" :style="{ background: colors[book.title.length % colors.length] }">
          {{ getInitials(book.title) }}
        </div>
        <div class="list-body">
          <div class="list-title">{{ book.title }}</div>
          <div class="list-author">{{ book.author }}</div>
          <div class="list-desc">{{ book.description.slice(0, 100) }}...</div>
        </div>
        <div class="list-meta">
          <span class="badge badge-accent">{{ book.category }}</span>
          <div v-if="book.progress > 0" class="list-progress">
            <div class="progress-bar"><div class="progress-fill" :style="{ width: book.progress + '%' }" /></div>
            <span>{{ Math.round(book.progress) }}%</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="store.totalPages > 1" class="pagination">
      <button class="btn btn-ghost btn-sm" :disabled="store.filters.page <= 1" @click="store.prevPage()">Oldingi</button>
      <span class="page-info">{{ store.filters.page }} / {{ store.totalPages }}</span>
      <button class="btn btn-ghost btn-sm" :disabled="store.filters.page >= store.totalPages" @click="store.nextPage()">Keyingi</button>
    </div>
  </div>
</template>

<style scoped>
.library {
  max-width: 960px;
}

.page-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 20px;
}

.page-title { font-size: 1.5rem; font-weight: 700; }
.book-count { color: var(--text-muted); font-size: 0.9rem; }

.search-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
}

.view-toggle {
  display: flex;
  gap: 4px;
}

.categories-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 16px;
  scrollbar-width: thin;
}

.category-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.82rem;
  color: var(--text-secondary);
  background: var(--bg-card);
  border: 1px solid var(--border);
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.category-chip:hover { border-color: var(--accent); color: var(--accent); }
.category-chip.active { background: var(--accent); color: white; border-color: var(--accent); }

.chip-count {
  font-size: 0.72rem;
  opacity: 0.7;
}

.sort-row {
  margin-bottom: 16px;
}

.sort-select {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
}

.book-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
}

.book-card:hover {
  border-color: var(--accent);
  transform: translateY(-3px);
  box-shadow: 0 4px 20px rgba(124, 92, 252, 0.15);
}

.book-cover {
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
}

.book-body { padding: 12px 14px; }

.book-title {
  font-weight: 600;
  font-size: 0.95rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-author {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.book-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.book-progress { font-size: 0.8rem; color: var(--accent); font-weight: 500; }

.favorite-star {
  position: absolute;
  top: 8px;
  right: 8px;
  color: var(--gold);
  font-size: 1.1rem;
}

.book-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.list-item {
  display: flex;
  gap: 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.list-item:hover { border-color: var(--accent); }

.list-cover {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  flex-shrink: 0;
}

.list-body { flex: 1; min-width: 0; }
.list-title { font-weight: 500; font-size: 0.95rem; }
.list-author { font-size: 0.8rem; color: var(--text-muted); }
.list-desc { font-size: 0.78rem; color: var(--text-muted); margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.list-meta { text-align: right; display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }

.list-progress { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: var(--text-muted); }
.list-progress .progress-bar { width: 60px; height: 4px; background: var(--bg-hover); border-radius: 2px; overflow: hidden; }
.list-progress .progress-fill { height: 100%; background: var(--accent); border-radius: 2px; }

.loading-state, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.empty-state p { margin-bottom: 12px; }

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}

.page-info {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .book-grid { grid-template-columns: repeat(2, 1fr); }
  .categories-row { flex-wrap: nowrap; }
}
</style>
