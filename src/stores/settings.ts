import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { UserPreferences } from '@/types'
import { getSettings, saveSettings } from '@/utils/db'

export const useSettingsStore = defineStore('settings', () => {
  const prefs = ref<UserPreferences>({
    fontSize: 18,
    brightness: 100,
    theme: 'dark',
    fontFamily: 'Inter',
    readingMode: 'paged',
    autoSync: false,
  })

  watch(() => prefs.value.theme, (val) => {
    document.documentElement.classList.toggle('light', val === 'light')
  }, { immediate: true })

  watch(() => prefs.value.fontSize, () => applyCss())
  watch(() => prefs.value.brightness, () => applyCss())
  watch(() => prefs.value.fontFamily, () => applyCss())

  function applyCss() {
    const root = document.documentElement
    root.style.setProperty('--reader-font-size', `${prefs.value.fontSize}px`)
    root.style.setProperty('--reader-brightness', `${prefs.value.brightness}%`)
    root.style.setProperty('--reader-font-family', prefs.value.fontFamily)
  }

  async function loadSettings() {
    const saved = await getSettings()
    if (saved) {
      Object.assign(prefs.value, saved)
      applyCss()
    }
  }

  async function updateSettings(data: Partial<UserPreferences>) {
    Object.assign(prefs.value, data)
    await saveSettings(prefs.value as any)
    applyCss()
  }

  function setFontSize(size: number) {
    updateSettings({ fontSize: Math.max(12, Math.min(32, size)) })
  }

  function setBrightness(val: number) {
    updateSettings({ brightness: Math.max(30, Math.min(150, val)) })
  }

  function setTheme(theme: 'dark' | 'light') {
    updateSettings({ theme })
  }

  function setFontFamily(font: string) {
    updateSettings({ fontFamily: font })
  }

  function setReadingMode(mode: 'scroll' | 'paged') {
    updateSettings({ readingMode: mode })
  }

  return {
    prefs,
    loadSettings, updateSettings,
    setFontSize, setBrightness, setTheme,
    setFontFamily, setReadingMode,
  }
})
