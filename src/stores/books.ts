import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Book, Category } from '@/types'
import { getAllBooks, getBookById, addBook, updateBookProgress } from '@/utils/db'
import { getDefaultBooks } from '@/utils/helpers'

export const useBooksStore = defineStore('books', () => {
  const books = ref<Book[]>([])
  const currentBook = ref<Book | null>(null)
  const selectedCategory = ref<Category>('Barcha')
  const isLoading = ref(false)
  const searchQuery = ref('')

  const filteredBooks = computed(() => {
    let result = books.value
    if (selectedCategory.value !== 'Barcha') {
      result = result.filter(b => b.category === selectedCategory.value)
    }
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      result = result.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.author.toLowerCase().includes(q)
      )
    }
    return result
  })

  const favorites = computed(() => books.value.filter(b => b.isFavorite))

  const recentlyRead = computed(() => 
    books.value.filter(b => b.lastRead > 0).sort((a, b) => b.lastRead - a.lastRead).slice(0, 5)
  )

  async function loadBooks() {
    isLoading.value = true
    try {
      let stored = await getAllBooks()
      if (stored.length === 0) {
        const defaults = getDefaultBooks()
        for (const book of defaults) {
          await addBook(book)
        }
        stored = defaults
      }
      books.value = stored
    } catch (e) {
      console.error('Failed to load books:', e)
    } finally {
      isLoading.value = false
    }
  }

  async function openBook(id: string) {
    const book = await getBookById(id)
    if (book) {
      currentBook.value = book
      book.lastRead = Date.now()
      await addBook(book)
    }
  }

  async function saveProgress(bookId: string, progress: number, chapterIndex: number, pageIndex: number) {
    await updateBookProgress(bookId, progress, chapterIndex, pageIndex)
    const book = books.value.find(b => b.id === bookId)
    if (book) {
      book.progress = progress
      book.lastRead = Date.now()
    }
  }

  async function toggleFavorite(id: string) {
    const book = books.value.find(b => b.id === id)
    if (book) {
      book.isFavorite = !book.isFavorite
      await addBook(book)
    }
  }

  async function addNewBook(book: Book) {
    await addBook(book)
    books.value.push(book)
  }

  function setCategory(cat: Category) {
    selectedCategory.value = cat
  }

  function setSearch(query: string) {
    searchQuery.value = query
  }

  return {
    books,
    currentBook,
    selectedCategory,
    isLoading,
    searchQuery,
    filteredBooks,
    favorites,
    recentlyRead,
    loadBooks,
    openBook,
    saveProgress,
    toggleFavorite,
    addNewBook,
    setCategory,
    setSearch
  }
})