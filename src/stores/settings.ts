import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Settings } from '@/types'
import { getSettings, saveSettings } from '@/utils/db'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<Settings>({
    fontSize: 18,
    brightness: 100,
    theme: 'dark',
    fontFamily: 'Inter'
  })

  async function loadSettings() {
    const stored = await getSettings()
    if (stored) {
      settings.value = stored
      applySettings()
    }
  }

  async function updateSettings(newSettings: Partial<Settings>) {
    settings.value = { ...settings.value, ...newSettings }
    await saveSettings(settings.value)
    applySettings()
  }

  function applySettings() {
    const root = document.documentElement
    root.style.setProperty('--font-size', `${settings.value.fontSize}px`)
    root.style.setProperty('--brightness', `${settings.value.brightness}%`)
    root.style.setProperty('--font-family', settings.value.fontFamily)
  }

  async function setFontSize(size: number) {
    await updateSettings({ fontSize: size })
  }

  async function setBrightness(value: number) {
    await updateSettings({ brightness: value })
  }

  async function setTheme(theme: 'dark' | 'light') {
    await updateSettings({ theme })
  }

  return {
    settings,
    loadSettings,
    updateSettings,
    setFontSize,
    setBrightness,
    setTheme
  }
})