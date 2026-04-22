<template>
  <div class="library-page">
    <AppHeader title="Kutubxona">
      <button @click="showAddModal = true">+</button>
    </AppHeader>

    <div class="search-bar">
      <AppInput v-model="searchQuery" placeholder="Qidirish..." />
    </div>

    <div class="categories">
      <CategoryChip
        v-for="cat in categories"
        :key="cat"
        :category="cat"
        :active="selectedCategory === cat"
        @click="setCategory(cat)"
      />
    </div>

    <div v-if="filteredBooks.length === 0" class="empty">
      <p>Kitoblar topilmadi</p>
    </div>

    <BookGrid v-else>
      <BookCard
        v-for="book in filteredBooks"
        :key="book.id"
        :book="book"
        @click="goToReader(book.id)"
        @favorite="toggleFav(book.id)"
      />
    </BookGrid>

    <AddBookModal :show="showAddModal" @close="showAddModal = false" @add="addNewBook" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import AppInput from '@/components/common/AppInput.vue'
import BookCard from '@/components/books/BookCard.vue'
import BookGrid from '@/components/books/BookGrid.vue'
import CategoryChip from '@/components/categories/CategoryChip.vue'
import AddBookModal from '@/components/books/AddBookModal.vue'
import { useBooksStore } from '@/stores/books'
import { categories } from '@/utils/helpers'
import type { Category, Book } from '@/types'

const router = useRouter()
const booksStore = useBooksStore()

const searchQuery = ref('')
const showAddModal = ref(false)
const selectedCategory = ref<Category>('Barcha')

const filteredBooks = computed(() => {
  let result = booksStore.books
  if (selectedCategory.value !== 'Barcha') {
    result = result.filter(b => b.category === selectedCategory.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
  }
  return result
})

function setCategory(cat: string) {
  selectedCategory.value = cat as Category
  booksStore.setCategory(cat as Category)
}

function goToReader(id: string) {
  router.push(`/reader/${id}`)
}

function toggleFav(id: string) {
  booksStore.toggleFavorite(id)
}

function addNewBook(book: Book) {
  book.id = Date.now().toString()
  book.addedAt = Date.now()
  booksStore.addNewBook(book)
  showAddModal.value = false
}
</script>

<style scoped lang="scss">
.library-page {
  padding-bottom: 100px;

  .search-bar {
    padding: 16px 20px;
  }

  .categories {
    display: flex;
    gap: 8px;
    padding: 0 20px 16px;
    overflow-x: auto;
  }

  .empty {
    text-align: center;
    padding: 60px 20px;
    color: var(--text-muted);
  }
}
</style>