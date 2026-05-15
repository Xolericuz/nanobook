<script setup lang="ts">
import type { Book } from '@/types'

const props = defineProps<{
  book: Book
}>()

const emit = defineEmits<{
  click: [id: string]
  favorite: [id: string]
}>()

const colors = ['#7c5cfc', '#f5b342', '#34d399', '#60a5fa', '#f87171', '#a78bfa', '#f472b6', '#38bdf8']

function getInitials(title: string): string {
  return title.charAt(0).toUpperCase()
}

function getCoverColor(title: string): string {
  return colors[title.length % colors.length]
}
</script>

<template>
  <div class="book-card" @click="emit('click', book.id)">
    <div class="book-cover" :style="{ background: getCoverColor(book.title) }">
      {{ getInitials(book.title) }}
      <button
        v-if="book.isFavorite"
        class="fav-badge"
        @click.stop="emit('favorite', book.id)"
      >★</button>
    </div>
    <div class="book-info">
      <div class="book-title">{{ book.title }}</div>
      <div class="book-author">{{ book.author }}</div>
      <div class="book-footer">
        <span class="badge badge-accent">{{ book.category }}</span>
        <span v-if="book.progress > 0" class="book-progress">{{ Math.round(book.progress) }}%</span>
      </div>
      <div v-if="book.progress > 0" class="progress-bar">
        <div class="progress-fill" :style="{ width: book.progress + '%' }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.book-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-base);
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
  position: relative;
}

.fav-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: var(--gold);
  font-size: 1.2rem;
  cursor: pointer;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
}

.book-info {
  padding: 12px 14px;
}

.book-title {
  font-weight: 600;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-author {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin-top: 2px;
}

.book-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.book-progress {
  font-size: 0.8rem;
  color: var(--accent);
  font-weight: 500;
}

.progress-bar {
  height: 3px;
  background: var(--bg-hover);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 2px;
  transition: width 0.3s ease;
}
</style>
