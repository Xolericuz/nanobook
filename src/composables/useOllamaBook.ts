import { ref } from 'vue'
import { useBooksStore } from '@/stores/books'
import { generateId } from '@/utils/helpers'

const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:3001'

export function useOllamaBook() {
  const booksStore = useBooksStore()
  const isGenerating = ref(false)
  const error = ref<string | null>(null)

  const categories = [
    { name: 'Falsafa', titles: ['Sukunat ichidagi haqiqat', 'Vaqt bilan suhbat', 'Yo\'qotish san\'ati', 'Oddiylik kuchi', 'Qarorlar zanjiri', 'Ichki tartibsizlik', 'Tafakkur chegarasi', 'O\'zlikni izlash'] },
    { name: 'Texnologiya', titles: ['Sun\'iy ong uyg\'onishi', 'Kod ortidagi ruh', 'Algoritm hukmronligi', 'Virtual haqiqat', 'Raqamli ong', 'Kvant tarmoq', 'Neural dunyo'] },
    { name: 'Psixologiya', titles: ['Ong labirinti', 'Qo\'rquv mexanizmi', 'Xotira parchalari', 'Ichki dialog', 'Stress fizikasi', 'Baxt algoritmi'] },
    { name: 'Sci-Fi', titles: ['Marsdagi uyg\'onish', 'Kosmik yolg\'izlik', 'Yulduzlar orasida', 'Kiber inson', 'Yangi Yer', 'Qora tuynuk siri'] },
    { name: 'Biznes', titles: ['0 dan start', 'Raqamli boylik', 'Startup anatomiyasi', 'Fokus kuchi', 'Strategik fikrlash'] },
    { name: 'Drama', titles: ['Yo\'qolgan orzular', 'Oxirgi uchrashuv', 'Yolg\'izlik hikoyasi', 'Oila sinovi', 'So\'nggi maktub'] },
    { name: 'Fantasy', titles: ['Sehrli shahar', 'Ajdarlar davri', 'Sehrgar kundaligi', 'Parallel olamlar', 'Qadimgi urush'] },
    { name: 'Detektiv', titles: ['Izsiz yo\'qolish', 'Sirli qotillik', 'Yashirin izlar', 'Qora daftar', 'Tungi tergov'] },
    { name: 'Eksperimental', titles: ['Tush ichidagi tush', 'Haqiqat simulyatsiyasi', 'Vaqtsiz makon', 'Sonsiz variantlar', 'Tizimdan chiqish'] },
    { name: 'Hikoya', titles: ['Yo\'qolgan shahar', 'Oxirgi odam', 'Soyalar orasida', 'Noma\'lum signal'] },
  ]

  const names = ['Bahrom', 'Malika', 'Ravshan', 'Zulxumor', 'Temur', 'Yulduz', 'Shavkat', 'Ziyoda', 'Akmal', 'Sevara', 'Jahongir', 'Gulnora', 'Bobur', 'Nilufar', 'Sanjar', 'Lobar', 'Rustam', 'Madina', 'Jasur', 'Dilnoza']

  const settings = ['Samarqand', 'Buxoro', 'Toshkent', 'Xiva', 'Farg\'ona', 'Navoiy', 'Andijon', 'Nukus', 'Shahrisabz', 'Termiz']

  async function checkOllama(): Promise<boolean> {
    try {
      const res = await fetch(`${AI_URL}/api/health`)
      return res.ok
    } catch {
      return false
    }
  }

  function randomPick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
  }

  function generateChapter(index: number, bookTitle: string, cat: string, chars: string[], setting: string): string {
    const a = chars[0], b = chars[1], c = chars[2]
    const templates = [
      `${a} ${setting}da yashar edi. ${bookTitle} uning butun hayotini o'zgartirib yubordi. ${b} bilan uchrashish, ${c} bilan suhbatlashish — bularning barchasi tasodif emas edi. Har bir uchrashuv, har bir so'z ma'noga ega edi. ${a} o'z yo'lini topish uchun uzoq izlandi. Oxirida tushundi: haqiqat oddiy narsalarda yashirin.`,
      `${b} ${a}ga qaradi: "Sen ${bookTitle}ni tushunishing kerak". ${a} bosh chayqadi. ${c} esa indamay kuzatib turardi. ${setting} ko'chalarida kezib, ular hayotning mazmuni haqida bahslashdilar. ${a} asta-sekin ${bookTitle}ning mohiyatini anglay boshladi. Bu oddiy tushuncha edi, lekin uni topish uchun butun bir umr kerak bo'lishi mumkin edi.`,
      `${bookTitle} — bu shunchaki so'z emas edi. Bu ${a}ning hayot falsafasiga aylandi. ${b} va ${c} uning yo'ldoshlari edi. ${setting}ning go'zal manzaralari ularga ilhom berdi. Har bir kun yangi kashfiyot, har bir kecha yangi o'ylar bilan o'tdi. ${a} endi biladi: eng muhim narsa — bu izlashdan to'xtamaslik.`,
    ]
    return templates[index % templates.length]
  }

  async function createBook(category?: string): Promise<void> {
    isGenerating.value = true
    error.value = null

    try {
      const cat = category || randomPick(categories).name
      const catData = categories.find(c => c.name === cat) || categories[0]
      const title = randomPick(catData.titles)
      const chars = [randomPick(names), randomPick(names), randomPick(names)]
      const setting = randomPick(settings)
      const chapters = []

      for (let i = 0; i < 5; i++) {
        const content = generateChapter(i, title, cat, chars, setting)
        chapters.push({
          id: `${generateId()}-${i + 1}`,
          title: `${i + 1}-bob`,
          pages: [content],
        })
      }

      const fullText = chapters.map(ch => ch.pages[0]).join('\n\n')

      const book = {
        id: generateId(),
        title,
        author: 'Xoleric AI',
        category: cat,
        description: `"${title}" — ${cat} janridagi kitob. ${setting}da kechuvchi hikoya.`,
        cover: '',
        content: fullText,
        chapters,
        progress: 0,
        lastRead: 0,
        isFavorite: false,
        addedAt: Date.now(),
        totalPages: chapters.length,
      }

      const { addBook } = await import('@/utils/db')
      await addBook(book as any)
      await booksStore.loadBooks()
    } catch (e: any) {
      error.value = e.message || 'Xatolik yuz berdi'
    } finally {
      isGenerating.value = false
    }
  }

  return {
    isGenerating,
    error,
    checkOllama,
    createBook,
  }
}
