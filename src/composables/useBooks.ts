import { ref, onMounted } from 'vue'
import { useBooksStore } from '@/stores/books'

export function useBooks() {
  const booksStore = useBooksStore()
  const isReady = ref(false)

  onMounted(async () => {
    await booksStore.loadBooks()
    isReady.value = true
  })

  return {
    books: booksStore.books,
    filteredBooks: booksStore.filteredBooks,
    currentBook: booksStore.currentBook,
    favorites: booksStore.favorites,
    recentlyRead: booksStore.recentlyRead,
    isLoading: booksStore.isLoading,
    isReady,
    openBook: booksStore.openBook,
    saveProgress: booksStore.saveProgress,
    toggleFavorite: booksStore.toggleFavorite,
    setCategory: booksStore.setCategory,
    setSearch: booksStore.setSearch
  }
}