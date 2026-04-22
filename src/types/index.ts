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
}

export interface Chapter {
  id: string
  title: string
  pages: string[]
}

export interface User {
  id: string
  username: string
  code: string
  createdAt: number
  booksRead: number
  totalReadingTime: number
}

export interface Settings {
  fontSize: number
  brightness: number
  theme: 'dark' | 'light'
  fontFamily: string
}

export type Category =
  | 'Barcha'
  | 'Roman'
  | 'She\'r'
  | 'Drama'
  | 'Detektiv'
  | 'Fantastika'
  | 'Tarix'
  | 'Falsafa'
  | 'Biznes'
  | 'Psixologiya'

export interface ReadingProgress {
  bookId: string
  chapterIndex: number
  pageIndex: number
  progress: number
  updatedAt: number
}