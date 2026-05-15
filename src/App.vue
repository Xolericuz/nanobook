<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBooksStore } from '@/stores/books'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const booksStore = useBooksStore()
const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const userStore = useUserStore()

const navItems = [
  { path: '/', label: 'Bosh sahifa', icon: '' },
  { path: '/library', label: 'Kutubxona', icon: '' },
  { path: '/agents', label: 'Agentlar', icon: '' },
  { path: '/profile', label: 'Profil', icon: '' },
  { path: '/settings', label: 'Sozlamalar', icon: '' },
]

onMounted(async () => {
  await settingsStore.loadSettings()
  await userStore.initUser()
  await booksStore.loadBooks()
  if (!userStore.user) {
    router.push('/welcome')
  }
})

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar hide-mobile">
      <div class="sidebar-brand" @click="router.push('/')">
        <div class="brand-icon">X</div>
        <span class="brand-text">Xoleric</span>
      </div>

      <nav class="sidebar-nav">
        <a
          v-for="item in navItems"
          :key="item.path"
          :class="['nav-item', { active: isActive(item.path) }]"
          @click="router.push(item.path)"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="user-mini" @click="router.push('/profile')">
          <div class="user-avatar">{{ authStore.userInitial || userStore.displayName.charAt(0).toUpperCase() }}</div>
          <div class="user-info">
            <div class="user-name">{{ authStore.displayName || userStore.displayName }}</div>
            <div class="user-status">Online</div>
          </div>
        </div>
      </div>
    </aside>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <nav class="bottom-nav hide-desktop">
      <a
        v-for="item in navItems.slice(0, 5)"
        :key="item.path"
        :class="['nav-item', { active: isActive(item.path) }]"
        @click="router.push(item.path)"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </a>
    </nav>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.sidebar {
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  cursor: pointer;
  user-select: none;
}

.brand-icon {
  width: 36px;
  height: 36px;
  background: var(--accent);
  color: white;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.brand-text {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.sidebar-nav {
  flex: 1;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
  font-size: 0.9rem;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--accent-muted);
  color: var(--accent);
  font-weight: 500;
}

.nav-icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--border);
}

.user-mini {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.user-mini:hover {
  background: var(--bg-hover);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.85rem;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-status {
  font-size: 0.75rem;
  color: var(--success);
}

.main-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  padding: 24px 32px;
  padding-bottom: calc(24px + var(--bottom-nav-height));
  min-height: 100vh;
  max-width: 1200px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--bottom-nav-height);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 100;
}

.bottom-nav .nav-item {
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px;
  font-size: 0.7rem;
}

.bottom-nav .nav-icon {
  font-size: 1.3rem;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 16px;
    padding-bottom: calc(16px + var(--bottom-nav-height));
  }
}
</style>
