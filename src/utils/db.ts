import Dexie, { type Table } from 'dexie'
import type { Book, User, Settings, ReadingProgress } from '@/types'

export class NanoBookDB extends Dexie {
  books!: Table<Book>
  user!: Table<User>
  settings!: Table<Settings>
  progress!: Table<ReadingProgress>

  constructor() {
    super('NanoBookDB')
    this.version(1).stores({
      books: 'id, title, author, category, addedAt',
      user: 'id',
      settings: 'id',
      progress: 'bookId'
    })
  }
}

export const db = new NanoBookDB()

export async function getAllBooks(): Promise<Book[]> {
  return db.books.toArray()
}

export async function getBookById(id: string): Promise<Book | undefined> {
  return db.books.get(id)
}

export async function addBook(book: Book): Promise<void> {
  await db.books.put(book)
}

export async function updateBookProgress(bookId: string, progress: number, chapterIndex: number, pageIndex: number): Promise<void> {
  const book = await db.books.get(bookId)
  if (book) {
    await db.books.update(bookId, { progress, lastRead: Date.now() })
  }
  await db.progress.put({
    bookId,
    chapterIndex,
    pageIndex,
    progress,
    updatedAt: Date.now()
  })
}

export async function getUser(): Promise<User | undefined> {
  return db.user.get('1')
}

export async function saveUser(user: User): Promise<void> {
  await db.user.put(user)
}

export async function getSettings(): Promise<Settings | undefined> {
  return db.settings.get('1')
}

export async function saveSettings(settings: Settings): Promise<void> {
  await db.settings.put(settings)
}

export async function searchBooks(query: string): Promise<Book[]> {
  const lower = query.toLowerCase()
  return db.books.filter(b => 
    b.title.toLowerCase().includes(lower) || 
    b.author.toLowerCase().includes(lower)
  ).toArray()
}

export async function getBooksByCategory(category: string): Promise<Book[]> {
  if (category === 'Barcha') {
    return db.books.toArray()
  }
  return db.books.where('category').equals(category).toArray()
}

export async function getFavorites(): Promise<Book[]> {
  return db.books.filter(b => b.isFavorite).toArray()
}