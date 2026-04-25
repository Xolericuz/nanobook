const fs = require('fs');
const books = JSON.parse(fs.readFileSync('generated-books/books.json'));

function escapeString(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
}

const escapedBooks = books.map(book => {
  return {
    ...book,
    title: escapeString(book.title),
    description: escapeString(book.description),
    content: escapeString(book.content)
  };
});

const content = `import type { Book, Category } from '@/types'

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
  if (hours > 0) return \`\${hours}soat \${mins}daq\`
  return \`\${mins}daq\`
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const defaultBooks: Book[] = ${JSON.stringify(escapedBooks, null, 2)}

export function getDefaultBooks(): Book[] {
  return defaultBooks
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
`;

fs.writeFileSync('src/utils/helpers.ts', content);
console.log('Updated with', escapedBooks.length, 'books');