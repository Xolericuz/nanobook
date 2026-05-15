export interface Book {
  id: string
  title: string
  author: string
  category: string
  description: string
  cover: string
  content: string
  chapters: Chapter[]
  progress: number
  lastRead: number
  isFavorite: boolean
  addedAt: number
  totalPages: number
  wordCount?: number
  rating?: number
  tags?: string[]
}

export interface Chapter {
  id: string
  title: string
  pages: string[]
}

export interface User {
  id: string
  username: string
  email: string
  code: string
  avatar: string
  createdAt: number
  booksRead: number
  totalReadingTime: number
  readingStreak: number
  lastReadDate: string
  preferences: UserPreferences
}

export interface UserPreferences {
  fontSize: number
  brightness: number
  theme: 'dark' | 'light'
  fontFamily: string
  readingMode: 'scroll' | 'paged'
  autoSync: boolean
}

export type Category =
  | 'Barcha' | 'Roman' | 'She\'r' | 'Drama' | 'Detektiv'
  | 'Fantastika' | 'Tarix' | 'Falsafa' | 'Biznes'
  | 'Psixologiya' | 'Texnologiya' | 'Hikoya' | 'Sci-Fi'
  | 'Fantasy' | 'Eksperimental' | 'Triller' | 'Sarguzasht'

export interface ReadingProgress {
  bookId: string
  chapterIndex: number
  pageIndex: number
  progress: number
  updatedAt: number
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface BookFilters {
  category: string
  search: string
  sort: 'title' | 'author' | 'recent' | 'added'
  view: 'grid' | 'list'
  page: number
  limit: number
}
