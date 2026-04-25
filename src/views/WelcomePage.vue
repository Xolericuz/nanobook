<template>
  <div class="welcome-page">
    <div class="hero">
      <h1>Xoleric <span class="accent">Library</span></h1>
      <p>Xush kelibsiz!</p>
    </div>

    <form class="login-form" @submit.prevent="handleSubmit">
      <AppInput v-model="username" label="Ism" placeholder="Ismingizni kiriting" />
      <AppInput v-model="code" label="Kod (ixtiyoriy)" placeholder="Maxsus kod..." />

      <p v-if="error" class="error">{{ error }}</p>

      <AppButton :loading="isLoading" size="lg">Davom etish</AppButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const code = ref('')
const error = ref('')
const isLoading = ref(false)

async function handleSubmit() {
  if (!username.value.trim()) {
    error.value = 'Iltimos, ismingizni kiriting'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const userCode = await userStore.createUser(username.value.trim(), code.value.trim() || undefined)
    if (code.value.trim()) {
      alert(`Sizning maxsus kodingiz: ${userCode}`)
    }
    router.push('/')
  } catch (e) {
    error.value = 'Xatolik yuz berdi'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.welcome-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;

  .hero {
    text-align: center;
    margin-bottom: 40px;

    h1 {
      font-size: 32px;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 8px;

      .accent {
        background: linear-gradient(135deg, var(--accent-gold), var(--accent-cyan));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    p {
      color: var(--text-muted);
    }
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 400px;
    margin: 0 auto;
    width: 100%;

    .error {
      color: #ff4444;
      font-size: 14px;
      text-align: center;
    }
  }
}
</style>