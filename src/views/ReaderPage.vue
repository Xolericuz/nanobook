<template>
  <div class="reader-page">
    <AppHeader :title="book?.title" back @back="$router.back()">
      <button @click="toggleFav">{{ book?.isFavorite ? '★' : '☆' }}</button>
    </AppHeader>

    <div v-if="book" class="reader-wrapper">
      <BookReader
        :book="book"
        :chapter-index="chapterIndex"
        :page-index="pageIndex"
        :settings="settingsStore.settings"
        @prev="prevPage"
        @next="nextPage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import BookReader from '@/components/books/BookReader.vue'
import { useBooksStore } from '@/stores/books'
import { useSettingsStore } from '@/stores/settings'

const route = useRoute()
const booksStore = useBooksStore()
const settingsStore = useSettingsStore()

const chapterIndex = ref(0)
const pageIndex = ref(0)

const book = computed(() => booksStore.currentBook)

watch(() => route.params.id, async (id) => {
  if (id) {
    await booksStore.openBook(id as string)
  }
}, { immediate: true })

function prevPage() {
  if (pageIndex.value > 0) {
    pageIndex.value--
  } else if (chapterIndex.value > 0) {
    chapterIndex.value--
    const ch = book.value?.chapters[chapterIndex.value]
    pageIndex.value = (ch?.pages.length || 1) - 1
  }
  saveProgress()
}

function nextPage() {
  const ch = book.value?.chapters[chapterIndex.value]
  if (ch && pageIndex.value < ch.pages.length - 1) {
    pageIndex.value++
  } else if (book.value && chapterIndex.value < book.value.chapters.length - 1) {
    chapterIndex.value++
    pageIndex.value = 0
  }
  saveProgress()
}

function saveProgress() {
  if (!book.value) return
  const total = book.value.chapters.reduce((acc, ch) => acc + ch.pages.length, 0)
  let current = 0
  for (let i = 0; i < chapterIndex.value; i++) {
    current += book.value.chapters[i].pages.length
  }
  current += pageIndex.value + 1
  const progress = Math.round((current / total) * 100)
  booksStore.saveProgress(book.value.id, progress, chapterIndex.value, pageIndex.value)
}

function toggleFav() {
  if (book.value) {
    booksStore.toggleFavorite(book.value.id)
  }
}
</script>

<style scoped lang="scss">
.reader-page {
  height: 100vh;
  display: flex;
  flex-direction: column;

  .reader-wrapper {
    flex: 1;
    overflow: hidden;
  }
}
</style>