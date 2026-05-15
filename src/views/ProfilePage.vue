<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useBooksStore } from '@/stores/books'

const router = useRouter()
const userStore = useUserStore()
const booksStore = useBooksStore()

const stats = computed(() => userStore.readingStats)
const totalBooks = computed(() => booksStore.books.length)
const completedBooks = computed(() => booksStore.books.filter(b => b.progress >= 100).length)

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} daqiqa`
  return `${h} soat ${m} daqiqa`
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>

<template>
  <div class="profile">
    <header class="page-header">
      <h1 class="page-title">Profil</h1>
    </header>

    <div class="profile-card">
      <div class="profile-avatar">
        {{ userStore.displayName.charAt(0).toUpperCase() }}
      </div>
      <h2 class="profile-name">{{ userStore.displayName }}</h2>
      <p class="profile-code">ID: {{ userStore.userCode }}</p>
      <p v-if="userStore.user?.createdAt" class="profile-date">
        Ro'yxatdan o'tgan: {{ formatDate(userStore.user.createdAt) }}
      </p>
    </div>

    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-number">{{ stats.booksRead }}</div>
        <div class="stat-label">O'qilgan kitoblar</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ totalBooks }}</div>
        <div class="stat-label">Jami kitoblar</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ completedBooks }}</div>
        <div class="stat-label">Tugatilgan</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ stats.streak }}</div>
        <div class="stat-label">Kunlik streak</div>
      </div>
    </div>

    <div class="section">
      <h3 class="section-title">O'qish statistikasi</h3>
      <div class="reading-stat">
        <span>Umumiy o'qish vaqti</span>
        <span class="stat-value">{{ formatTime(stats.totalTime) }}</span>
      </div>
      <div class="reading-stat">
        <span>O'rtacha kitob/oy</span>
        <span class="stat-value">{{ Math.max(1, Math.round(stats.booksRead / 1)) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile {
  max-width: 600px;
}

.page-header { margin-bottom: 24px; }
.page-title { font-size: 1.5rem; font-weight: 700; }

.profile-card {
  text-align: center;
  padding: 32px 20px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  margin-bottom: 24px;
}

.profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 auto 16px;
}

.profile-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.profile-code {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.profile-date {
  color: var(--text-muted);
  font-size: 0.8rem;
  margin-top: 4px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-item {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px;
  text-align: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 20px;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 16px;
}

.reading-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-size: 0.9rem;
}

.reading-stat:last-child { border-bottom: none; }

.reading-stat .stat-value {
  font-weight: 500;
  color: var(--accent);
}
</style>
