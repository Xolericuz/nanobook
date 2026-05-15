import Dexie, { type Table } from 'dexie'
import type { Book, User, ReadingProgress, UserPreferences } from '@/types'

class XolericDB extends Dexie {
  books!: Table<Book, string>
  user!: Table<User, string>
  settings!: Table<UserPreferences, string>
  progress!: Table<ReadingProgress, string>

  constructor() {
    super('xoleric')
    this.version(2).stores({
      books: 'id, title, author, category, addedAt',
      user: 'id',
      settings: 'id',
      progress: 'bookId',
    })
  }
}

const db = new XolericDB()

export async function getAllBooks(): Promise<Book[]> {
  return db.books.toArray()
}

export async function getBookById(id: string): Promise<Book | undefined> {
  return db.books.get(id)
}

export async function addBook(book: Book): Promise<void> {
  await db.books.put(book)
}

export async function updateBookProgress(bookId: string, data: ReadingProgress): Promise<void> {
  await db.progress.put(data)
}

export async function getBookProgress(bookId: string): Promise<ReadingProgress | undefined> {
  return db.progress.get(bookId)
}

export async function getUser(): Promise<User | undefined> {
  const users = await db.user.toArray()
  return users[0]
}

export async function saveUser(user: User): Promise<void> {
  await db.user.put(user)
}

export async function getSettings(): Promise<UserPreferences | undefined> {
  const settings = await db.settings.toArray()
  return settings[0]
}

export async function saveSettings(settings: UserPreferences): Promise<void> {
  await db.settings.put(settings)
}

export async function searchBooks(query: string): Promise<Book[]> {
  const q = query.toLowerCase()
  return db.books
    .filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
    .toArray()
}

export async function getBooksByCategory(category: string): Promise<Book[]> {
  return db.books.where('category').equals(category).toArray()
}

export async function getFavorites(): Promise<Book[]> {
  const all = await db.books.toArray()
  return all.filter(b => b.isFavorite)
}
