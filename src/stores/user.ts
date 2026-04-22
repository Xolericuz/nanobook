import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'
import { getUser, saveUser as dbSaveUser } from '@/utils/db'
import { generateCode } from '@/utils/helpers'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)

  async function initUser() {
    const stored = await getUser()
    if (stored) {
      user.value = stored
      isAuthenticated.value = true
    }
  }

  async function createUser(username: string, code?: string) {
    const newUser: User = {
      id: '1',
      username,
      code: code || generateCode(),
      createdAt: Date.now(),
      booksRead: 0,
      totalReadingTime: 0
    }
    await dbSaveUser(newUser)
    user.value = newUser
    isAuthenticated.value = true
    return newUser.code
  }

  async function updateUsername(newName: string) {
    if (user.value) {
      user.value.username = newName
      await dbSaveUser(user.value)
    }
  }

  async function incrementBooksRead() {
    if (user.value) {
      user.value.booksRead++
      await dbSaveUser(user.value)
    }
  }

  async function addReadingTime(seconds: number) {
    if (user.value) {
      user.value.totalReadingTime += seconds
      await dbSaveUser(user.value)
    }
  }

  function logout() {
    user.value = null
    isAuthenticated.value = false
  }

  return {
    user,
    isAuthenticated,
    initUser,
    createUser,
    updateUsername,
    incrementBooksRead,
    addReadingTime,
    logout
  }
})