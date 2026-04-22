<template>
  <div class="app" :class="{ dark: isDark }">
    <nav class="bottom-nav">
      <router-link to="/" class="nav-item" active-class="active">🏠</router-link>
      <router-link to="/library" class="nav-item" active-class="active">📚</router-link>
      <router-link to="/profile" class="nav-item" active-class="active">👤</router-link>
      <router-link to="/settings" class="nav-item" active-class="active">⚙️</router-link>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'
import { useBooksStore } from '@/stores/books'

const settingsStore = useSettingsStore()
const userStore = useUserStore()
const booksStore = useBooksStore()

const isDark = computed(() => settingsStore.settings.theme === 'dark')

onMounted(async () => {
  await settingsStore.loadSettings()
  await userStore.initUser()
  await booksStore.loadBooks()
})
</script>

<style lang="scss">
.app {
  min-height: 100vh;
  background: var(--bg-deep);

  .main-content {
    min-height: 100vh;
  }

  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-around;
    padding: 12px 0;
    background: var(--bg-panel);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    z-index: 50;

    .nav-item {
      font-size: 24px;
      opacity: 0.5;
      text-decoration: none;
      transition: all 0.2s ease;

      &:hover, &.active {
        opacity: 1;
      }

      &.active {
        transform: scale(1.2);
      }
    }
  }
}
</style>