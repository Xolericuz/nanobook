import { api } from './client'
import type { Book, ReadingProgress } from '@/types'

export const booksApi = {
  list: (params?: { category?: string; search?: string; sort?: string; page?: number; limit?: number }) =>
    api.get<{ books: Book[]; total: number; page: number }>('/books', { params } as any),

  getById: (id: string) =>
    api.get<Book>(`/books/${id}`),

  getFavorites: () =>
    api.get<Book[]>('/books/favorites'),

  toggleFavorite: (id: string) =>
    api.post<Book>(`/books/${id}/favorite`),

  saveProgress: (bookId: string, data: ReadingProgress) =>
    api.put<ReadingProgress>(`/books/${bookId}/progress`, data),

  getProgress: (bookId: string) =>
    api.get<ReadingProgress>(`/books/${bookId}/progress`),

  getCategories: () =>
    api.get<{ name: string; count: number }[]>('/books/categories'),
}
