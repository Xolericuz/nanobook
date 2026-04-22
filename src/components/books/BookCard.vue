<template>
  <div class="book-card" @click="$emit('click')">
    <div class="cover">
      <div v-if="!book.cover" class="placeholder">{{ book.title[0] }}</div>
      <img v-else :src="book.cover" :alt="book.title" />
      <button class="fav-btn" @click.stop="$emit('favorite')">{{ book.isFavorite ? '★' : '☆' }}</button>
    </div>
    <div class="info">
      <h3>{{ book.title }}</h3>
      <p>{{ book.author }}</p>
      <div class="meta">
        <span class="category">{{ book.category }}</span>
        <span v-if="book.progress > 0" class="progress">{{ book.progress }}%</span>
      </div>
    </div>
    <div v-if="book.progress > 0" class="progress-bar">
      <div class="fill" :style="{ width: book.progress + '%' }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Book } from '@/types'

defineProps<{
  book: Book
}>()

defineEmits<{
  click: []
  favorite: []
}>()
</script>

<style scoped lang="scss">
.book-card {
  background: var(--bg-card);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);

  &:hover {
    transform: translateY(-4px);
    border-color: var(--accent-cyan);
    box-shadow: 0 8px 32px rgba(0, 240, 255, 0.15);
  }

  .cover {
    position: relative;
    height: 140px;
    background: linear-gradient(135deg, var(--bg-panel), var(--bg-card));
    display: flex;
    align-items: center;
    justify-content: center;

    .placeholder {
      font-size: 48px;
      font-weight: 800;
      color: var(--accent-gold);
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .fav-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0, 0, 0, 0.5);
      border: none;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      font-size: 18px;
      color: var(--accent-gold);
      cursor: pointer;
    }
  }

  .info {
    padding: 12px;

    h3 {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-main);
      margin-bottom: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    p {
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 8px;
    }

    .meta {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .category {
        font-size: 10px;
        padding: 4px 8px;
        background: rgba(0, 240, 255, 0.1);
        color: var(--accent-cyan);
        border-radius: 8px;
      }

      .progress {
        font-size: 12px;
        color: var(--accent-gold);
      }
    }
  }

  .progress-bar {
    height: 3px;
    background: rgba(255, 255, 255, 0.1);

    .fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent-gold), var(--accent-cyan));
      transition: width 0.3s ease;
    }
  }
}
</style>