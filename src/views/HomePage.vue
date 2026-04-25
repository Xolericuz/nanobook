<template>
  <div class="home-page">
    <AppHeader>
      <button class="settings-btn" @click="$router.push('/settings')">
        ⚙️
      </button>
    </AppHeader>

    <!-- User Welcome -->
    <div class="welcome-section" v-if="user">
      <h1>Xoleric <span class="accent">Library</span></h1>
      <p class="welcome-text">{{ user.username }} - o'z kutubxonangizga xush kelibsiz!</p>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats">
      <div class="stat-item">
        <span class="stat-value">{{ totalBooks }}</span>
        <span class="stat-label">Kitoblar</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ completedBooks }}</span>
        <span class="stat-label">O'qilgan</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ favoritesCount }}</span>
        <span class="stat-label">Sevimli</span>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <AppButton variant="primary" @click="$router.push('/library')">
        📚 Kutubxona
      </AppButton>
      <AppButton variant="secondary" @click="$router.push('/profile')">
        👤 Profil
      </AppButton>
    </div>

    <!-- Recently Read -->
    <div v-if="recentlyRead.length > 0" class="section">
      <h2>Ohirgi o'qilgan</h2>
      <BookGrid>
        <BookCard
          v-for="book in recentlyRead"
          :key="book.id"
          :book="book"
          @click="goToReader(book.id)"
          @favorite="toggleFav(book.id)"
        />
      </BookGrid>
    </div>

    <!-- Favorites -->
    <div v-if="favorites.length > 0" class="section">
      <h2>Sevimli kitoblar</h2>
      <BookGrid>
        <BookCard
          v-for="book in favorites"
          :key="book.id"
          :book="book"
          @click="goToReader(book.id)"
          @favorite="toggleFav(book.id)"
        />
      </BookGrid>
    </div>

    <!-- Categories Quick Access -->
    <div class="section categories-section">
      <h2>Kategoriyalar</h2>
      <div class="categories-grid">
        <div 
          v-for="cat in categoryStats" 
          :key="cat.name"
          class="category-card"
          @click="goToCategory(cat.name)"
        >
          <span class="category-name">{{ cat.name }}</span>
          <span class="category-count">{{ cat.count }}</span>
        </div>
      </div>
    </div>

    <!-- Daily Quote / Feature -->
    <div class="section featured-section">
      <div class="featured-card">
        <h3>📖 Kuning kitobi</h3>
        <p v-if="dailyBook">{{ dailyBook.title }}</p>
        <p v-else>Barcha kitoblar o'qilgan!</p>
        <AppButton v-if="dailyBook" size="sm" @click="goToDaily">
          O'qishni boshlash
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import AppButton from '@/components/common/AppButton.vue'
import BookCard from '@/components/books/BookCard.vue'
import BookGrid from '@/components/books/BookGrid.vue'
import { useBooksStore } from '@/stores/books'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const booksStore = useBooksStore()
const userStore = useUserStore()

const user = computed(() => userStore.user)

const totalBooks = computed(() => booksStore.books.length)
const completedBooks = computed(() => booksStore.books.filter(b => b.progress >= 100).length)
const favoritesCount = computed(() => booksStore.favorites.length)
const recentlyRead = computed(() => booksStore.recentlyRead.slice(0, 5))
const favorites = computed(() => booksStore.favorites.slice(0, 5))

const categoryStats = computed(() => {
  const counts: Record<string, number> = {}
  booksStore.books.forEach(book => {
    counts[book.category] = (counts[book.category] || 0) + 1
  })
  return Object.entries(counts).map(([name, count]) => ({ name, count }))
})

const dailyBook = computed(() => {
  const unread = booksStore.books.filter(b => b.progress === 0)
  if (unread.length === 0) return null
  return unread[Math.floor(Math.random() * unread.length)]
})

function goToReader(id: string) {
  router.push(`/reader/${id}`)
}

function toggleFav(id: string) {
  booksStore.toggleFavorite(id)
}

function goToCategory(category: string) {
  booksStore.setCategory(category as any)
  router.push('/library')
}

function goToDaily() {
  if (dailyBook.value) {
    router.push(`/reader/${dailyBook.value.id}`)
  }
}

onMounted(() => {
  userStore.initUser()
  booksStore.loadBooks()
})
</script>

<style scoped lang="scss">
.home-page {
  padding-bottom: 100px;
}

.settings-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.welcome-section {
  padding: 20px;
  text-align: center;
  
  h1 {
    font-size: 28px;
    font-weight: 800;
    color: var(--text-main);
    margin-bottom: 8px;
    
    .accent {
      background: linear-gradient(135deg, var(--accent-gold), var(--accent-cyan));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }
  
  .welcome-text {
    color: var(--text-muted);
    font-size: 14px;
  }
}

.quick-stats {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  margin: 0 20px;
  background: var(--bg-card);
  border-radius: 16px;
  
  .stat-item {
    text-align: center;
    
    .stat-value {
      display: block;
      font-size: 24px;
      font-weight: 700;
      color: var(--accent-cyan);
    }
    
    .stat-label {
      font-size: 12px;
      color: var(--text-muted);
    }
  }
}

.quick-actions {
  display: flex;
  gap: 12px;
  padding: 20px;
  
  button {
    flex: 1;
  }
}

.section {
  margin: 24px 0;
  
  h2 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-main);
    padding: 0 20px;
    margin-bottom: 16px;
  }
}

.categories-section {
  .categories-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 0 20px;
  }
  
  .category-card {
    padding: 16px;
    background: var(--bg-card);
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      border-color: var(--accent-cyan);
    }
    
    .category-name {
      font-size: 14px;
      color: var(--text-main);
    }
    
    .category-count {
      font-size: 14px;
      font-weight: 600;
      color: var(--accent-cyan);
    }
  }
}

.featured-section {
  padding: 0 20px;
  
  .featured-card {
    padding: 20px;
    background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(139, 92, 246, 0.1));
    border: 1px solid rgba(0, 240, 255, 0.2);
    border-radius: 16px;
    
    h3 {
      font-size: 16px;
      color: var(--text-main);
      margin-bottom: 8px;
    }
    
    p {
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: 16px;
    }
  }
}
</style>