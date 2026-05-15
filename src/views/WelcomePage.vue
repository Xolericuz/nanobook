<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const name = ref('')
const isLoading = ref(false)
const error = ref('')

async function start() {
  if (!name.value.trim()) {
    error.value = 'Iltimos, ismingizni kiriting'
    return
  }
  isLoading.value = true
  error.value = ''
  try {
    await userStore.createUser(name.value.trim())
    router.push('/')
  } catch {
    error.value = 'Xatolik yuz berdi'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="welcome">
    <div class="welcome-card">
      <div class="welcome-logo">X</div>
      <h1 class="welcome-title">Xoleric Library</h1>
      <p class="welcome-desc">
        O'zbek tilidagi elektron kitoblar kutubxonasiga xush kelibsiz.
        O'qing, o'rganing va kashf eting.
      </p>

      <form @submit.prevent="start" class="welcome-form">
        <div class="input-group">
          <label>Ismingiz</label>
          <input
            v-model="name"
            placeholder="Ismingizni kiriting..."
            maxlength="30"
            autofocus
          />
        </div>
        <p v-if="error" class="error-text">{{ error }}</p>
        <button type="submit" class="btn btn-primary btn-block btn-lg" :disabled="isLoading">
          <span v-if="isLoading" class="spinner" />
          <span v-else>Boshlash</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.welcome {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.welcome-card {
  max-width: 420px;
  width: 100%;
  text-align: center;
  padding: 48px 32px;
}

.welcome-logo {
  width: 72px;
  height: 72px;
  background: var(--accent);
  color: white;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 auto 24px;
}

.welcome-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 12px;
}

.welcome-desc {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 32px;
}

.welcome-form {
  text-align: left;
}

.input-group {
  margin-bottom: 16px;
}

.input-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.input-group input {
  width: 100%;
}

.error-text {
  color: var(--error);
  font-size: 0.85rem;
  margin-bottom: 12px;
}
</style>
