<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  chapter: { title: string; pages: string[] } | null
  chapterIndex: number
  pageIndex: number
  totalChapters: number
}>()

const emit = defineEmits<{
  prev: []
  next: []
}>()

const hasPrev = computed(() => props.chapterIndex > 0 || props.pageIndex > 0)
const hasNext = computed(() => {
  if (!props.chapter) return false
  return props.chapterIndex < props.totalChapters - 1 || props.pageIndex < props.chapter.pages.length - 1
})
</script>

<template>
  <div class="reader-component">
    <div v-if="chapter" class="reader-page">
      <h2 class="chapter-title">{{ chapter.title }}</h2>
      <div class="page-content">
        {{ chapter.pages[pageIndex] }}
      </div>
    </div>
    <div class="reader-nav">
      <button class="btn btn-ghost" :disabled="!hasPrev" @click="emit('prev')">←</button>
      <span class="nav-info">
        {{ chapterIndex + 1 }}/{{ totalChapters }} — {{ pageIndex + 1 }}/{{ chapter?.pages.length || 1 }}
      </span>
      <button class="btn btn-ghost" :disabled="!hasNext" @click="emit('next')">→</button>
    </div>
  </div>
</template>

<style scoped>
.reader-component {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.reader-page {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  line-height: 1.8;
}

.chapter-title {
  font-size: 1.3em;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--accent);
}

.page-content {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.reader-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 40px;
  border-top: 1px solid var(--border);
}

.nav-info {
  font-size: 0.85rem;
  color: var(--text-muted);
}
</style>
