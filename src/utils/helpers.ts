export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

export function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export function formatDate(date: Date | number): string {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatReadingTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} daqiqa`
  if (m === 0) return `${h} soat`
  return `${h} soat ${m} daqiqa`
}

export function truncateText(text: string, max: number = 100): string {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '...'
}

export function estimateReadingTime(text: string): number {
  const words = text.split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
}

export function pluralize(count: number, word: string): string {
  return count === 1 ? word : `${word}lar`
}

export const categories = [
  { id: 'Barcha', label: 'Barcha', icon: '📚' },
  { id: 'Roman', label: 'Roman', icon: '📖' },
  { id: "She'r", label: "She'r", icon: '🎭' },
  { id: 'Drama', label: 'Drama', icon: '🎪' },
  { id: 'Detektiv', label: 'Detektiv', icon: '🔍' },
  { id: 'Fantastika', label: 'Fantastika', icon: '🚀' },
  { id: 'Tarix', label: 'Tarix', icon: '📜' },
  { id: 'Falsafa', label: 'Falsafa', icon: '💭' },
  { id: 'Biznes', label: 'Biznes', icon: '💼' },
  { id: 'Psixologiya', label: 'Psixologiya', icon: '🧠' },
  { id: 'Texnologiya', label: 'Texnologiya', icon: '💻' },
  { id: 'Hikoya', label: 'Hikoya', icon: '📝' },
  { id: 'Sci-Fi', label: 'Sci-Fi', icon: '🛸' },
  { id: 'Fantasy', label: 'Fantasy', icon: '🐉' },
  { id: 'Eksperimental', label: 'Eksperimental', icon: '🔬' },
  { id: 'Triller', label: 'Triller', icon: '😱' },
  { id: 'Sarguzasht', label: 'Sarguzasht', icon: '🗺️' },
]

export function getCategoryLabel(cat: string): string {
  const found = categories.find(c => c.id === cat)
  return found?.label || cat
}

export async function getDefaultBooks(): Promise<any[]> {
  try {
    const res = await fetch('/books.json')
    const data = await res.json()
    return Array.isArray(data) ? data : data.books || []
  } catch {
    return []
  }
}
