import { useSettingsStore } from '@/stores/settings'

export function useTheme() {
  const settings = useSettingsStore()

  function toggleTheme() {
    settings.setTheme(settings.prefs.theme === 'dark' ? 'light' : 'dark')
  }

  function setDark() {
    settings.setTheme('dark')
  }

  return {
    isDark: () => settings.prefs.theme === 'dark',
    toggleTheme,
    setDark,
  }
}
