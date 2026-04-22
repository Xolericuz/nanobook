<template>
  <div class="settings-page">
    <AppHeader title="Sozlamalar" back @back="$router.back()" />

    <div class="settings-content">
      <div class="setting-item">
        <label>Shrift o'lchami</label>
        <input type="range" min="14" max="24" :value="settings.fontSize" @input="setFontSize(Number(($event.target as HTMLInputElement).value))" />
        <span>{{ settings.fontSize }}px</span>
      </div>

      <div class="setting-item">
        <label>Yorqinlik</label>
        <input type="range" min="50" max="100" :value="settings.brightness" @input="setBrightness(Number(($event.target as HTMLInputElement).value))" />
        <span>{{ settings.brightness }}%</span>
      </div>

      <div class="setting-item">
        <label>Theme</label>
        <button @click="toggleTheme">{{ settings.theme === 'dark' ? '🌙' : '☀️' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue'
import { useSettingsStore } from '@/stores/settings'
import { storeToRefs } from 'pinia'

const settingsStore = useSettingsStore()
const { settings } = storeToRefs(settingsStore)

function setFontSize(size: number) {
  settingsStore.setFontSize(size)
}

function setBrightness(value: number) {
  settingsStore.setBrightness(value)
}

function toggleTheme() {
  settingsStore.setTheme(settings.value.theme === 'dark' ? 'light' : 'dark')
}
</script>

<style scoped lang="scss">
.settings-page {
  padding-bottom: 100px;

  .settings-content {
    padding: 20px;

    .setting-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: var(--bg-card);
      border-radius: 12px;
      margin-bottom: 12px;

      label {
        color: var(--text-main);
      }

      input[type="range"] {
        width: 150px;
      }

      span {
        color: var(--text-muted);
        min-width: 50px;
        text-align: right;
      }

      button {
        background: var(--bg-panel);
        border: none;
        border-radius: 8px;
        padding: 8px 16px;
        font-size: 20px;
      }
    }
  }
}
</style>