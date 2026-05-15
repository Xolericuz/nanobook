import { onMounted, ref } from 'vue'
import { useBooksStore } from '@/stores/books'

export function useBooks() {
  const store = useBooksStore()
  const isReady = ref(false)

  onMounted(async () => {
    if (store.books.length === 0) {
      await store.loadBooks()
    }
    isReady.value = true
  })

  return { store, isReady }
}
