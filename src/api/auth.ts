import { api } from './client'
import type { User, LoginRequest, RegisterRequest } from '@/types'

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<{ user: User; token: string }>('/auth/login', data),

  register: (data: RegisterRequest) =>
    api.post<{ user: User; token: string }>('/auth/register', data),

  me: () =>
    api.get<User>('/auth/me'),

  updateProfile: (data: Partial<User>) =>
    api.patch<User>('/auth/profile', data),
}
