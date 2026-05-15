import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserPreferences } from '@/types'
import { authApi } from '@/api/auth'
import { getUser, saveUser } from '@/utils/db'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)

  const displayName = computed(() => user.value?.username || 'Mehmon')
  const userCode = computed(() => user.value?.code || '---')
  const readingStats = computed(() => ({
    booksRead: user.value?.booksRead || 0,
    totalTime: user.value?.totalReadingTime || 0,
    streak: user.value?.readingStreak || 0,
  }))

  async function initUser() {
    const existing = await getUser()
    if (existing) {
      user.value = existing as User
      isAuthenticated.value = true
      return existing
    }
    return null
  }

  async function createUser(username: string, email?: string) {
    const code = generateCode()
    const newUser: User = {
      id: generateId(),
      username,
      email: email || '',
      code,
      avatar: '',
      createdAt: Date.now(),
      booksRead: 0,
      totalReadingTime: 0,
      readingStreak: 0,
      lastReadDate: '',
      preferences: {
        fontSize: 18,
        brightness: 100,
        theme: 'dark',
        fontFamily: 'Inter',
        readingMode: 'paged',
        autoSync: false,
      },
    }
    user.value = newUser
    isAuthenticated.value = true
    await saveUser(newUser as any)
    return newUser
  }

  async function updateProfile(data: Partial<User>) {
    if (!user.value) return
    Object.assign(user.value, data)
    await saveUser(user.value as any)
    authApi.updateProfile(data).catch(() => {})
  }

  function incrementBooksRead() {
    if (user.value) {
      user.value.booksRead++
      updateProfile({ booksRead: user.value.booksRead })
    }
  }

  function addReadingTime(minutes: number) {
    if (user.value) {
      user.value.totalReadingTime += minutes
      updateProfile({ totalReadingTime: user.value.totalReadingTime })
    }
  }

  function logout() {
    user.value = null
    isAuthenticated.value = false
  }

  return {
    user, isAuthenticated, displayName, userCode, readingStats,
    initUser, createUser, updateProfile,
    incrementBooksRead, addReadingTime, logout,
  }
})

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
