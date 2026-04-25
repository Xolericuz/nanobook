import { ref } from 'vue'
import type { Book, Category } from '@/types'
import { addBook } from '@/utils/db'

const OLLAMA_URL = 'http://localhost:11434'
const MODEL = 'phi3:3.8b'

const CATEGORIES: Category[] = [
  'Falsafa', 'Texnologiya', 'Psixologiya', 'Hikoya', 
  'Sci-Fi', 'Biznes', 'Drama', 'Fantasy', 'Detektiv', 'Eksperimental'
]

const TITLE_TEMPLATES: Record<Category, string[]> = {
  Falsafa: [
    "Hayot ma'nosi", "Vaqt oqimi", "Yo'qotish va topish", 
    "Oddiylik siri", "Qaror qabul qilish", "Ichki tinchlik",
    "Fikrlash san'ati", "O'z bilim", "Haqiqat ko'zlari", "Javobsiz savollar"
  ],
  Texnologiya: [
    "Sun'iy ong", "Kod yuragi", "Algoritm shahri", 
    "Virtual haqiqat", "Raqamli inson", "Server qal'asi",
    "Kvant sirli", "AI va inson", "Dasturchi taqdiri", "Neural tarmoq"
  ],
  Psixologiya: [
    "Ong labirinti", "Qo'rquv sababi", "Motivatsiya yo'qolishi",
    "Xotira yo'qotishi", "O'z-o'zini aldamchi", "Emotsiya rangi",
    "Ichki gaplar", "Stress tanasi", "Baxt formulasi", "Ong osti dunyosi"
  ],
  Hikoya: [
    "Yo'qolgan shahar", "Oxirgi odam", "Vaqt sayohati",
    "Soyalar sarguzasht", "Yashirin xat", "Tungi ovoz",
    "Qorong'u noma'lum", "Parallel taqdir", "Noma'lum signal", "Sirli hujjat"
  ],
  'Sci-Fi': [
    "Mars koloniyasi", "Yolg'iz kosmos", "Yulduzlar chorak",
    "Kiber inson yaratish", "Energiya inqilobi", "Yangi yer",
    "Qora tuynuk siri", "Vaqt bukurishi", "Robot axloqi", "Galaktik aloqa"
  ],
  Biznes: [
    "Biznes asoslari", "Marketing siri", "Moliyaviy sog'lomlik",
    "Mijoz sokinligi", "Brend qurish", "Savdo san'ati",
    "Rahbarlik qoidalari", "O'sish strategiyasi", "Krizadan chiqish", "Jamoa qurish"
  ],
  Drama: [
    "Ajrlishuv", "Qaytish", "Sirli kelin",
    "Ona yuragi", "Ota va farzand", "Oilaviy sirlar",
    "Do'stlik sinovi", "Ishq azobi", "Haqiqat va yolg'on", "Kutilmagan oxir"
  ],
  Fantasy: [
    "Sehrli qishloq", "Ajdod qilici", "Peri malikasi",
    "G'ayritabiiy", "Sehrli o'rmon", "Arvohlar shahri",
    "Oltin qirollik", "Tungum qirollik", "Ajina shoir", "Sehrli kitob"
  ],
  Detektiv: [
    "Qotillik siri", "Iz", "Kalit",
    "Sirli daftarlar", "Tungi tergov", "Soxta iz",
    "Kodlangan xat", "Oxirgi guvoh", "Qurbon", "Sirli shaxs"
  ],
  Eksperimental: [
    "Yangi dunyo", "O'zgartirish", "Sinash",
    "Imkoniyat", "Variantlar", "Tanlov",
    "Qayta boshlash", "Yangidan", "Cheksiz", "Noma'lum"
  ]
}

const uzNames = [
  "Azamat", "Bahodir", "Gulshan", "Madina", "Sardor", "Malika",
  "Rustam", "Zebo", "Kamron", "Sevara", "Davron", "Nargiz",
  "Otabek", "Sarvar", "Hilola", "Jasur", "Gulnora", "Farrux"
]

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateBookId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
}

export function useOllamaBook() {
  const isGenerating = ref(false)
  const error = ref<string | null>(null)
  const ollamaAvailable = ref(false)

  async function checkOllama() {
    try {
      const res = await fetch(`${OLLAMA_URL}/api/tags`, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      })
      ollamaAvailable.value = res.ok
      return res.ok
    } catch {
      ollamaAvailable.value = false
      return false
    }
  }

  async function generateWithOllama(category: Category, title: string): Promise<Book> {
    const prompt = `O'zbek tilida uz qisqa 5 ta bobdan iborat "${title}" nomli ${category} kitob yoz. 
Har bir bob 800+ so'zdan. Original syujet va qahramonlar.
Boshqa tilda yozma.

Kitob struktura:
{
  "title": "${title}",
  "category": "${category}",
  "chapters": [
    {"title": "I bob. Boshlanish", "content": "..."},
    {"title": "II bob. Rivojlanish", "content": "..."},
    {"title": "III bob. Markaz", "content": "..."},
    {"title": "IV bob. Eng yuqori cho'qqi", "content": "..."},
    {"title": "V bob. Yakun", "content": "..."}
  ]
}

Faqat JSON yoz, hech qanday matn qo'shmasdan:`

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0.8,
          num_predict: 4000
        }
      })
    })

    if (!response.ok) {
      throw new Error('Ollama error')
    }

    const data = await response.json()
    return parseBookResponse(data.response, category, title)
  }

  function parseBookResponse(response: string, category: string, fallbackTitle: string): Book {
    let bookData: Partial<Book>
    
    try {
      const match = response.match(/\{[\s\S]*\}/)
      if (match) {
        bookData = JSON.parse(match[0])
      } else {
        throw new Error('No JSON')
      }
    } catch {
      return generateFallbackBook(category as Category, fallbackTitle)
    }

    const bookId = generateBookId()
    const totalContent = bookData.chapters?.map((c: any) => c.content).join('\n\n') || ''
    
    return {
      id: bookId,
      title: bookData.title || fallbackTitle,
      author: 'Xoleric AI',
      category: category as Category,
      description: `${bookData.title || fallbackTitle} - ${category} janridagi kitob`,
      cover: '',
      content: totalContent,
      chapters: (bookData.chapters || []).map((ch: any, i: number) => ({
        id: `${bookId}-${i + 1}`,
        title: ch.title || `Bob ${i + 1}`,
        pages: [ch.content?.substring(0, 2000) || '']
      })),
      progress: 0,
      lastRead: 0,
      isFavorite: false,
      addedAt: Date.now(),
      totalPages: bookData.chapters?.length || 5
    }
  }

  function generateFallbackBook(category: Category, title: string): Book {
    const bookId = generateBookId()
    const mainChar = randomElement(uzNames)
    const secondChar = randomElement(uzNames)
    const location = randomElement([
      "Toshkent", "Samarqand", "Buxoro", "Farg'ona", "Qo'qon", 
      "Xiva", "Navoiy", "Andijon", "Namangan", "Qarshi"
    ])

    const chapterTemplates = [
      `I bob. Boshlanish\n\n${title} kitobi shu yerdan boshlanadi.\n\n${mainChar} ${location} shahrida yashaydi. U oddiy hayot kechiraydi, lekin bir orzu bor - u ${title.toLowerCase()} haqida bilmoqchi.\n\nBir kuni ${mainChar} g'alatiga duch keladi. Bu uchrashuv uning hayotini o'zgartiradi.`,
      
      `II bob. Rivojlanish\n\n${mainChar} o'z yo'lini izlay boshladi. Bu yo'l oson emas. Ko'p sinovlar bor.\n\n${secondChar} unga yordam beradi. Ular birga ishlaydilar.\n\nHar bir kashfiyot - yangi qadam.`,
      
      `III bob. Markaz\n\nEng muhim payt keldi. ${mainChar} o'ziga duch keladi - bu eng katta sinov.\n\nU yaxshi yo yomon - hal qilishi kerak.\n\nBu paytda ${secondChar} ham muhim rol o'ynaydi.`,
      
      `IV bob. Eng yuqori cho'qqi\n\n${mainChar} eng katta to'siqqa duch keladi. Bu to'siqni yengish uchun uning qo'rida kuch kerak.\n\nVa nihoyat - g'alaba! Lekin bu faqat boshlanish.`,
      
      `V bob. Yakun\n\n${title} hikoyasi shu yerda tugaydi, lekin ${mainChar}ning hikoyasi davom etadi.\n\nU o'zgargan. Endi u boshqacha qaraydi.\n\nMana shu, ${title}.`
    ]

    return {
      id: bookId,
      title,
      author: 'Xoleric AI',
      category,
      description: `${title} - ${category} janridagi ajoyib hikoya`,
      cover: '',
      content: chapterTemplates.join('\n\n\n'),
      chapters: chapterTemplates.map((content, i) => ({
        id: `${bookId}-${i + 1}`,
        title: chapterTemplates[i].split('\n')[0],
        pages: [content]
      })),
      progress: 0,
      lastRead: 0,
      isFavorite: false,
      addedAt: Date.now(),
      totalPages: 5
    }
  }

  async function createBook(category?: Category): Promise<Book> {
    isGenerating.value = true
    error.value = null

    try {
      const cat = category || randomElement(CATEGORIES)
      const title = randomElement(TITLE_TEMPLATES[cat])
      const ollamaOk = await checkOllama()

      let book: Book

      if (ollamaOk) {
        try {
          book = await generateWithOllama(cat, title)
        } catch (e) {
          console.warn('Ollama failed, using fallback:', e)
          book = generateFallbackBook(cat, title)
        }
      } else {
        book = generateFallbackBook(cat, title)
      }

      await addBook(book)
      return book
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      isGenerating.value = false
    }
  }

  async function createBooks(count: number, category?: Category): Promise<Book[]> {
    const books: Book[] = []
    
    for (let i = 0; i < count; i++) {
      const book = await createBook(category)
      books.push(book)
      
      if (i < count - 1) {
        await new Promise(r => setTimeout(r, 500))
      }
    }

    return books
  }

  return {
    isGenerating,
    error,
    ollamaAvailable,
    checkOllama,
    createBook,
    createBooks,
    categories: CATEGORIES
  }
}