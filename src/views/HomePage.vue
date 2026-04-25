<template>
  <div class="home-page">
    <div class="hero">
      <h1>Xoleric <span class="accent">Library</span></h1>
      <p class="tagline">Zamonaviy kitobxonlik tajribasi</p>
    </div>

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

    <div v-if="favorites.length > 0" class="section">
      <h2>Sevimli</h2>
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

    <div class="quick-actions">
      <AppButton variant="primary" size="lg" @click="$router.push('/library')">Kutubxona →</AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import BookCard from '@/components/books/BookCard.vue'
import BookGrid from '@/components/books/BookGrid.vue'
import AppButton from '@/components/common/AppButton.vue'
import { useBooksStore } from '@/stores/books'

const router = useRouter()
const booksStore = useBooksStore()

const recentlyRead = computed(() => booksStore.recentlyRead)
const favorites = computed(() => booksStore.favorites)

function goToReader(id: string) {
  router.push(`/reader/${id}`)
}

function toggleFav(id: string) {
  booksStore.toggleFavorite(id)
}
</script>

<style scoped lang="scss">
.home-page {
  padding-bottom: 100px;

  .hero {
    text-align: center;
    padding: 60px 20px 40px;

    h1 {
      font-size: 36px;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 12px;

      .accent {
        background: linear-gradient(135deg, var(--accent-gold), var(--accent-cyan));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .tagline {
      font-size: 16px;
      color: var(--text-muted);
    }
  }

  .section {
    margin: 32px 0;

    h2 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-main);
      padding: 0 20px;
      margin-bottom: 16px;
    }
  }

  .quick-actions {
    display: flex;
    justify-content: center;
    padding: 40px 20px;
  }
}
</style>