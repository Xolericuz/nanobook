import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginRequest, RegisterRequest } from '@/types'
import { authApi } from '@/api/auth'
import { setToken } from '@/api/client'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const displayName = computed(() => user.value?.username || 'Mehmon')
  const userInitial = computed(() => displayName.value.charAt(0).toUpperCase())

  async function login(data: LoginRequest) {
    isLoading.value = true
    error.value = null
    try {
      const res = await authApi.login(data)
      user.value = res.user
      token.value = res.token
      setToken(res.token)
      return res
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function register(data: RegisterRequest) {
    isLoading.value = true
    error.value = null
    try {
      const res = await authApi.register(data)
      user.value = res.user
      token.value = res.token
      setToken(res.token)
      return res
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUser() {
    if (!token.value) return
    try {
      const res = await authApi.me()
      user.value = res
    } catch {
      logout()
    }
  }

  function logout() {
    user.value = null
    token.value = null
    setToken(null)
  }

  function setUser(u: User) {
    user.value = u
  }

  return {
    user, token, isLoading, error,
    isAuthenticated, displayName, userInitial,
    login, register, fetchUser, logout, setUser,
  }
})
