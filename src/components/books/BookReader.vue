<template>
  <div class="book-reader">
    <div class="reader-content" :style="{ fontSize: settings.fontSize + 'px' }">
      <p>{{ currentPage }}</p>
    </div>
    <div class="reader-nav">
      <button :disabled="!hasPrev" @click="$emit('prev')">←</button>
      <span class="page-info">{{ chapterIndex + 1 }}/{{ totalChapters }} - {{ pageIndex + 1 }}/{{ totalPages }}</span>
      <button :disabled="!hasNext" @click="$emit('next')">→</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Book } from '@/types'

const props = defineProps<{
  book: Book
  chapterIndex: number
  pageIndex: number
  settings: { fontSize: number; brightness: number; theme: string; fontFamily: string }
}>()

defineEmits<{
  prev: []
  next: []
}>()

const currentPage = computed(() => {
  if (!props.book.chapters[props.chapterIndex]) return ''
  return props.book.chapters[props.chapterIndex].pages[props.pageIndex] || ''
})

const totalChapters = computed(() => props.book.chapters.length)
const totalPages = computed(() => props.book.chapters[props.chapterIndex]?.pages.length || 0)

const hasPrev = computed(() => {
  if (props.chapterIndex > 0) return true
  if (props.chapterIndex === 0 && props.pageIndex > 0) return true
  return false
})

const hasNext = computed(() => {
  if (props.chapterIndex < props.book.chapters.length - 1) return true
  if (props.chapterIndex === props.book.chapters.length - 1 && props.pageIndex < (props.book.chapters[props.chapterIndex]?.pages.length || 0) - 1) return true
  return false
})
</script>

<style scoped lang="scss">
.book-reader {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-deep);

  .reader-content {
    flex: 1;
    padding: 24px;
    color: var(--text-main);
    line-height: 1.8;
    overflow-y: auto;

    p {
      white-space: pre-wrap;
    }
  }

  .reader-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background: var(--bg-panel);
    border-top: 1px solid rgba(255, 255, 255, 0.05);

    button {
      background: var(--bg-card);
      border: none;
      border-radius: 12px;
      width: 48px;
      height: 48px;
      font-size: 20px;
      color: var(--text-main);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background: var(--accent-cyan);
        color: #000;
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }

    .page-info {
      font-size: 14px;
      color: var(--text-muted);
    }
  }
}
</style>