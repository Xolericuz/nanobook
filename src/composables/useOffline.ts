import { ref, onMounted, onUnmounted } from 'vue'

export function useOffline() {
  const isOnline = ref(navigator.onLine)
  const wasOffline = ref(false)

  function handleOnline() {
    wasOffline.value = false
    isOnline.value = true
  }

  function handleOffline() {
    wasOffline.value = true
    isOnline.value = false
  }

  onMounted(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  })

  onUnmounted(() => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })

  return { isOnline, wasOffline }
}