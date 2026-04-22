import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

export function useTheme() {
  const settingsStore = useSettingsStore()
  const isDark = ref(true)

  onMounted(() => {
    isDark.value = settingsStore.settings.theme === 'dark'
  })

  function toggleTheme() {
    const newTheme = isDark.value ? 'light' : 'dark'
    settingsStore.setTheme(newTheme)
    isDark.value = newTheme === 'dark'
  }

  function setDark(dark: boolean) {
    settingsStore.setTheme(dark ? 'dark' : 'light')
    isDark.value = dark
  }

  return { isDark, toggleTheme, setDark }
}