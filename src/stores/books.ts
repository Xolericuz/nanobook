import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Book, ReadingProgress, BookFilters } from '@/types'
import { booksApi } from '@/api/books'
import { getAllBooks, getBookById, addBook, updateBookProgress, searchBooks, getBooksByCategory, getFavorites } from '@/utils/db'

export const useBooksStore = defineStore('books', () => {
  const books = ref<Book[]>([])
  const currentBook = ref<Book | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const filters = ref<BookFilters>({
    category: 'Barcha',
    search: '',
    sort: 'recent',
    view: 'grid',
    page: 1,
    limit: 20,
  })

  const filteredBooks = computed(() => {
    let result = [...books.value]

    if (filters.value.category !== 'Barcha') {
      result = result.filter(b => b.category === filters.value.category)
    }

    if (filters.value.search) {
      const q = filters.value.search.toLowerCase()
      result = result.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q)
      )
    }

    switch (filters.value.sort) {
      case 'title': result.sort((a, b) => a.title.localeCompare(b.title)); break
      case 'author': result.sort((a, b) => a.author.localeCompare(b.author)); break
      case 'added': result.sort((a, b) => b.addedAt - a.addedAt); break
      default: result.sort((a, b) => b.lastRead - a.lastRead); break
    }

    return result
  })

  const paginatedBooks = computed(() => {
    const start = (filters.value.page - 1) * filters.value.limit
    return filteredBooks.value.slice(start, start + filters.value.limit)
  })

  const totalPages = computed(() =>
    Math.ceil(filteredBooks.value.length / filters.value.limit)
  )

  const favorites = computed(() => books.value.filter(b => b.isFavorite))

  const recentlyRead = computed(() =>
    [...books.value]
      .filter(b => b.lastRead > 0)
      .sort((a, b) => b.lastRead - a.lastRead)
      .slice(0, 5)
  )

  const stats = computed(() => ({
    total: books.value.length,
    completed: books.value.filter(b => b.progress >= 100).length,
    favorites: favorites.value.length,
    reading: books.value.filter(b => b.progress > 0 && b.progress < 100).length,
  }))

  async function loadBooks() {
    isLoading.value = true
    error.value = null
    try {
      const res = await booksApi.list({ limit: 100 }).catch(() => null)
      if (res?.books) {
        books.value = res.books
        return
      }
    } catch {}
    const local = await getAllBooks()
    if (local.length > 0) {
      books.value = local
    } else {
      try {
        const resp = await fetch('/books.json')
        const data = await resp.json()
        books.value = Array.isArray(data) ? data : data.books || []
        for (const b of books.value) {
          await addBook(b).catch(() => {})
        }
      } catch {
        error.value = 'Kitoblarni yuklab bo\'lmadi'
      }
    }
    isLoading.value = false
  }

  async function openBook(id: string) {
    let book = books.value.find(b => b.id === id)
    if (!book) {
      book = await getBookById(id).catch(() => null) as Book | null
      if (book) books.value.push(book)
    }
    if (book) {
      book.lastRead = Date.now()
      currentBook.value = book
      await updateBookProgress(book.id, {
        bookId: book.id,
        chapterIndex: 0,
        pageIndex: 0,
        progress: book.progress,
        updatedAt: Date.now(),
      }).catch(() => {})
    }
    return book
  }

  async function saveProgress(bookId: string, chapterIndex: number, pageIndex: number, progress: number) {
    const data: ReadingProgress = { bookId, chapterIndex, pageIndex, progress, updatedAt: Date.now() }
    await updateBookProgress(bookId, data).catch(() => {})
    booksApi.saveProgress(bookId, data).catch(() => {})
    const book = books.value.find(b => b.id === bookId)
    if (book) {
      book.progress = progress
      book.lastRead = Date.now()
    }
  }

  async function toggleFavorite(bookId: string) {
    const book = books.value.find(b => b.id === bookId)
    if (book) {
      book.isFavorite = !book.isFavorite
      await addBook(book).catch(() => {})
      booksApi.toggleFavorite(bookId).catch(() => {})
    }
  }

  function setCategory(cat: string) {
    filters.value.category = cat
    filters.value.page = 1
  }

  function setSearch(q: string) {
    filters.value.search = q
    filters.value.page = 1
  }

  function setSort(s: BookFilters['sort']) {
    filters.value.sort = s
  }

  function setView(v: 'grid' | 'list') {
    filters.value.view = v
  }

  function nextPage() {
    if (filters.value.page < totalPages.value) filters.value.page++
  }

  function prevPage() {
    if (filters.value.page > 1) filters.value.page--
  }

  return {
    books, currentBook, isLoading, error, filters,
    filteredBooks, paginatedBooks, totalPages,
    favorites, recentlyRead, stats,
    loadBooks, openBook, saveProgress, toggleFavorite,
    setCategory, setSearch, setSort, setView,
    nextPage, prevPage,
  }
})
