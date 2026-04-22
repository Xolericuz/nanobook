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

const defaultBooks: Book[] = [
  {
    id: '1',
    title: 'Otam oldida qasr qur',
    author: 'Abdulla Qodiriy',
    category: 'Roman',
    description: 'Ota va bola o\'rtasidagi murakkab munosabatlar haqida ta\'sirli roman.',
    cover: '',
    content: '',
    chapters: [
      { id: '1-1', title: 'I bob. Boshlanish', pages: ['Otajonning ko\'zlari jigarrang edi, melekday to\'q sariq. U har doqddek horg\'in, lekin qattiq qaraydigan. Bolaning ko\'zlarida esa hassan ko\'z yashlari yig\'ilgan edi...'] },
      { id: '1-2', title: 'II bob. Qaror', pages: ['Qo\'y osmon ostida qolgan yolg\'iz daraxtday turar edi. U yana bir marta otasining so\'zlarini esladi: "Bizga qasr kerak emas, bolam..."'] },
      { id: '1-3', title: 'III bob. Orzu', pages: ['Farzand otasining yelkasida qo\'rg\'on qurmoqchi edi. Har bir qizil g\'isht - al单独的 bir orzu edi...'] }
    ],
    progress: 0,
    lastRead: 0,
    isFavorite: false,
    addedAt: Date.now(),
    totalPages: 3
  },
  {
    id: '2',
    title: 'Kecha va kelgusi kun',
    author: 'Said Ahmad',
    category: 'Roman',
    description: 'O\'zbek adabiyotining mashhur romani.',
    cover: '',
    content: '',
    chapters: [
      { id: '2-1', title: 'I bob', pages: ['Shahar boshqa ko\'rinish old old old old old old old old'] },
      { id: '2-2', title: 'II bob', pages: ['Yangi hayot boshlandi...'] }
    ],
    progress: 0,
    lastRead: 0,
    isFavorite: false,
    addedAt: Date.now(),
    totalPages: 2
  },
  {
    id: '3',
    title: 'Meros',
    author: 'Chingiz Aytmatov',
    category: 'Roman',
    description: 'Qirg\'iz adabiyotining shoh asari.',
    cover: '',
    content: '',
    chapters: [
      { id: '3-1', title: 'Asrning birinchi kuni', pages: ['Qor kechasi tog\'dan tushdi. O\'rmon jimjit edi...'] },
      { id: '3-2', title: 'Ertalab', pages: ['Quyosh chiqqanda hamma narsa o\'zgargandi...'] }
    ],
    progress: 0,
    lastRead: 0,
    isFavorite: false,
    addedAt: Date.now(),
    totalPages: 2
  },
  {
    id: '4',
    title: 'Bo\'ston',
    author: 'Abdulla Qodiriy',
    category: 'Drama',
    description: 'O\'zbek drama adabiyotining durdonasi.',
    cover: '',
    content: '',
    chapters: [
      { id: '4-1', title: 'I fan', pages: ['Bo\'ston shahri gullardi...'] },
      { id: '4-2', title: 'II fan', pages: ['Hayot davom etdi...'] }
    ],
    progress: 0,
    lastRead: 0,
    isFavorite: false,
    addedAt: Date.now(),
    totalPages: 2
  },
  {
    id: '5',
    title: 'Ulug\'bek xazinasi',
    author: 'Nazar Eshonqul',
    category: 'Detektiv',
    description: 'Qadimiy xazinani izlovchi hikoyasi.',
    cover: '',
    content: '',
    chapters: [
      { id: '5-1', title: 'Kashf', pages: ['Arxeolog yerni kavlashni boshladi...'] },
      { id: '5-2', title: 'Topilma', pages: ['Xazina topildi!'] }
    ],
    progress: 0,
    lastRead: 0,
    isFavorite: false,
    addedAt: Date.now(),
    totalPages: 2
  }
]

export function getDefaultBooks(): Book[] {
  return defaultBooks
}

export const categories: Category[] = [
  'Barcha',
  'Roman',
  'She\'r',
  'Drama',
  'Detektiv',
  'Fantastika',
  'Tarix',
  'Falsafa',
  'Biznes',
  'Psixologiya'
]

export function getCategoryLabel(category: Category): string {
  const labels: Record<Category, string> = {
    'Barcha': 'Barcha',
    'Roman': 'Roman',
    'She\'r': 'She\'r',
    'Drama': 'Drama',
    'Detektiv': 'Detektiv',
    'Fantastika': 'Fantastika',
    'Tarix': 'Tarix',
    'Falsafa': 'Falsafa',
    'Biznes': 'Biznes',
    'Psixologiya': 'Psixologiya'
  }
  return labels[category]
}