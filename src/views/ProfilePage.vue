<template>
  <div class="profile-page">
    <AppHeader title="Profil" />

    <div v-if="user" class="profile-content">
      <div class="avatar">{{ user.username[0].toUpperCase() }}</div>
      <h2>{{ user.username }}</h2>
      <p class="code">Kod: {{ user.code }}</p>

      <div class="stats">
        <div class="stat">
          <span class="value">{{ user.booksRead }}</span>
          <span class="label">Kitob o'qilgan</span>
        </div>
        <div class="stat">
          <span class="value">{{ formatTime(user.totalReadingTime) }}</span>
          <span class="label">Jami vaqt</span>
        </div>
      </div>

      <div class="actions">
        <AppButton variant="secondary" @click="showEdit = true">O'zgartirish</AppButton>
      </div>
    </div>

    <div v-else class="no-user">
      <p>Foydalanuvchi topilmadi</p>
      <AppButton @click="$router.push('/welcome')">Ro'yxatdan o'tish</AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppHeader from '@/components/common/AppHeader.vue'
import AppButton from '@/components/common/AppButton.vue'
import { useUserStore } from '@/stores/user'
import { formatReadingTime } from '@/utils/helpers'

const userStore = useUserStore()
const user = ref(userStore.user)
const showEdit = ref(false)

function formatTime(seconds: number): string {
  return formatReadingTime(seconds)
}
</script>

<style scoped lang="scss">
.profile-page {
  padding-bottom: 100px;

  .profile-content {
    padding: 40px 20px;
    text-align: center;

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent-gold), var(--accent-cyan));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 700;
      color: #000;
      margin: 0 auto 16px;
    }

    h2 {
      font-size: 24px;
      color: var(--text-main);
      margin-bottom: 8px;
    }

    .code {
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: 32px;
    }

    .stats {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-bottom: 32px;

      .stat {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .value {
          font-size: 24px;
          font-weight: 700;
          color: var(--accent-gold);
        }

        .label {
          font-size: 12px;
          color: var(--text-muted);
        }
      }
    }
  }

  .no-user {
    text-align: center;
    padding: 60px 20px;
    color: var(--text-muted);
  }
}
</style>