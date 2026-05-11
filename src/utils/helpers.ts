import type { Book, Category } from '@/types'

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

export function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('uz-UZ')
}

export function formatReadingTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}soat ${mins}daq`
  return `${mins}daq`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export async function getDefaultBooks(): Promise<Book[]> {
  const response = await fetch('/books.json')
  if (!response.ok) {
    throw new Error(`Failed to load books: ${response.status}`)
  }
  return response.json()
}

export const categories: Category[] = [
  'Barcha',
  'Roman',
  'Drama',
  'Detektiv',
  'Fantastika',
  'Tarix',
  'Falsafa',
  'Biznes',
  'Psixologiya',
  'Texnologiya',
  'Hikoya',
  'SciFi',
  'Fantasy',
  'Eksperimental'
]

export function getCategoryLabel(category: Category): string {
  const labels: Record<Category, string> = {
    'Barcha': 'Barcha',
    'Roman': 'Roman',
    'Drama': 'Drama',
    'Detektiv': 'Detektiv',
    'Fantastika': 'Fantastika',
    'Tarix': 'Tarix',
    'Falsafa': 'Falsafa',
    'Biznes': 'Biznes',
    'Psixologiya': 'Psixologiya',
    'Texnologiya': 'Texnologiya',
    'Hikoya': 'Hikoya',
    'SciFi': 'Sci-Fi',
    'Fantasy': 'Fantasy',
    'Eksperimental': 'Eksperimental'
  }
  return labels[category] || category
}
