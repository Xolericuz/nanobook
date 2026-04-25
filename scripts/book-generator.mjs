#!/usr/bin/env node

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'llama3.2';

const CATEGORIES = [
  'Falsafa', 'Texnologiya', 'Psixologiya', 'Hikoya', 'Sci-Fi',
  'Biznes', 'Drama', 'Fantasy', 'Detektiv', 'Eksperimental'
];

const BOOK_TITLES = {
  'Falsafa': [
    'Sukunat ichidagi haqiqat', 'Vaqt bilan suhbat', 'Yo\'qotish san\'ati',
    'Oddiylik kuchi', 'Qarorlar zanjiri', 'Ichki tartibsizlik', 'Tafakkur chegarasi',
    'O\'zlikni izlash', 'Haqiqatning ranglari', 'Jim savollar'
  ],
  'Texnologiya': [
    'Sun\'iy ong uyg\'onishi', 'Kod ortidagi ruh', 'Algoritm hukmronligi',
    'Virtual haqiqat chegarasi', 'Raqamli ong', 'Serverdagi xotiralar',
    'Kvant tarmoq sirlari', 'AI va inson chegarasi', 'Kodlash falsafasi', 'Neural dunyo'
  ],
  'Psixologiya': [
    'Ong labirinti', 'Qo\'rquv mexanizmi', 'Motivatsiya illyuziyasi',
    'Xotira parchalari', 'O\'z-o\'zini sabotaj qilish', 'Emotsiyalar arxitekturasi',
    'Ichki dialog', 'Stress fizikasi', 'Baxt algoritmi', 'Ong osti o\'yinlari'
  ],
  'Hikoya': [
    'Yo\'qolgan shahar', 'Oxirgi odam', 'Vaqt sayohatchisi kundaligi',
    'Soyalar orasida', 'Yashirin kod', 'Tungi signal', 'Qorong\'u tizim',
    'Parallel hayot', 'Noma\'lum signal', 'Sirli fayl'
  ],
  'Sci-Fi': [
    'Marsdagi uyg\'onish', 'Kosmik yolg\'izlik', 'Yulduzlar orasida',
    'Kiber inson', 'Energiya inqilobi', 'Yangi Yer loyihasi', 'Qora tuynuk siri',
    'Vaqt parchalanishi', 'Robot etikasi', 'Galaktik signal'
  ],
  'Biznes': [
    '0 dan start', 'Raqamli boylik', 'Risk psixologiyasi', 'Pul va ong',
    'Startup anatomiyasi', 'Fokus kuchi', 'Disiplina kodi', 'Muvaffaqiyat mexanizmi',
    'Strategik fikrlash', 'O\'sish modeli'
  ],
  'Drama': [
    'Sukunatdagi qichqiriq', 'Yo\'qolgan orzular', 'Oxirgi uchrashuv',
    'Ko\'z yoshlar ortida', 'Unutilgan insonlar', 'Yolg\'izlik hikoyasi',
    'Yashirin haqiqat', 'Oila sinovi', 'Qaror kuni', 'So\'nggi maktub'
  ],
  'Fantasy': [
    'Sehrli shahar', 'Qadimiy kuchlar', 'Ajdarlar davri', 'Sirli kitob',
    'Sehrgar kundaligi', 'Parallel olamlar', 'Qorong\'u sehr', 'Qahramon yo\'li',
    'Yo\'qolgan sehr', 'Qadimgi urush'
  ],
  'Detektiv': [
    'Izsiz yo\'qolish', 'Sirli qotillik', 'Yashirin izlar', 'Kodlangan jinoyat',
    'Soxta haqiqat', 'Qora daftar', 'Sirli odam', 'Oxirgi dalil',
    'Tungi tergov', 'Yo\'qolgan signal'
  ],
  'Eksperimental': [
    'Tush ichidagi tush', 'Haqiqat simulyatsiyasi', 'Ongsiz sayohat',
    'Vaqtsiz makon', 'Qayta boshlanish', 'Sonsiz variantlar', 'Ichki koinot',
    'Kodlangan hayot', 'Tizimdan chiqish', 'Oxirgi savol'
  ]
};

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

async function generateWithOllama(prompt) {
  try {
    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('Ollama error:', error.message);
    return null;
  }
}

function generateFallbackContent(title, category, author) {
  return `Bu kitob ${title} haqida. ${category} жанридаги бу асар ${author} томонидан ёзилган.

Ушбу адабий асар ўзига хос услуб ва гав-ҳамли қаҳрамонларга бой. Қиссанинг ҳар бир боби ўқувчининг диққатини жалб этади ва янги қийинчиликларга етаклайди.

Бугунги кунда адабиёт жаҳонидаги энг муҳим жиҳатлардан бири — бу ўзига хослик ва ўқувчи билан алоқа ўрнатиш ҳисобланади. Ушбу асар мана шу жиҳатларни ўзида мужассамлаштиради.

Китобнинг асосий ғояси — инсон қалбининг чуқур сфералари, унинг туйғулари, орзу-умидлари ва ҳаётга бўлган қарашлари. Ҳар бир персонаж ўзига хос характер ва тақдирга эга.

${title} — бу фақатгина ҳикоя эмас, балки ҳаётнинг ўзи ҳақидаги мушоҳада. Ушбу китоб ўқилгандан сўнг сиз ўз ҳаётингиз ҳақида янгича ўйлайсиз.

Асарнинг тили оддий ва тушунарли, лекин ҳар бир жумла чуқур маъно юклайди. Бу усталик бежишга ёки ёзишга эмас, балки ҳаётни тўлақонли тарзда англашга ёрдам беради.

Китобнинг тузилмаси мураккаб, лекин мантиқий. Ҳар бир боб аввалгисидан кейингисига олиб боради, ва нихоятдаги охирги боб ўқувчини ҳайратда қолдиради.

${author} — бу ёзувчининг исми. У ўз асарлари орқали ўқувчиларга ҳаётнинг турли қирраларини кўрсатади. Бу китоб уларнинг энг яхши асарларидан бири ҳисобланади.

Агар сиз ${category} жанридаги қизиқарли ва гав-ҳамли китоб излаётган бўлсангиз, ушбу асар сиз учун мукаммал танлов бўлади.`;
}

async function generateBook(category, title) {
  const author = 'Xoleric AI';
  const id = generateId();

  const prompt = `Sen o'zbek tilida Professional kitob muallifisan. Quyidagi kitob uchun 5 ta bobdan iborat keng qamrovli kontent yoz.

Kitob ma'lumotlari:
- Nomi: ${title}
- Kategoriya: ${category}
- Muallif: ${author}

Talablar:
1. Har bir bob kamida 700 ta belgi bo'lishi kerak
2. O'zbek tilida yoz
3. Har bir bobda 2-3 sahifa kontent bo'lishi kerak
4. Boblarni raqam bilan belgila: I bob, II bob, III bob, IV bob, V bob
5. Kontent syujetga boy, tavsifli va interactable bo'lsin
6. Har bir bob alohida paragraph sifatida yozilsin

Chiqarish formati (faqat kitob kontenti):
[I bob. Boshlanish]
[bu yerda bob kontenti - kamida 700 belgi]

[II bob. Rivojlanish]
[bu yerda bob kontenti - kamida 700 belgi]

[III bob. Markaz]
[bu yerda bob kontenti - kamida 700 belgi]

[IV bob. Yuqori cho'qqi]
[bu yerda bob kontenti - kamida 700 belgi]

[V bob. Yakun]
[bu yerda bob kontenti - kamida 700 belgi]`;

  console.log(`📚 "${title}" kitobi generatsiya qilinmoqda...`);

  let rawContent = await generateWithOllama(prompt);

  if (!rawContent) {
    console.log(`⚠️ Ollama не доступен, используется fallback контент`);
    rawContent = generateFallbackContent(title, category, author);
  }

  const chapters = [];
  const chapterMatches = rawContent.match(/\[(I|II|III|IV|V) bob\.?\s*([^\]]*)\]/gi) || [];

  let currentChapter = null;
  let currentContent = [];

  for (const line of rawContent.split('\n')) {
    const match = line.match(/^\[(I|II|III|IV|V)\s*bob\.?\s*([^\]]*)\]/i);

    if (match) {
      if (currentChapter) {
        chapters.push({
          id: `${id}-${chapters.length + 1}`,
          title: currentChapter.title,
          pages: [currentContent.join('\n')]
        });
      }

      currentChapter = {
        number: match[1],
        title: match[2]?.trim() || 'Noma\'lum'
      };
      currentContent = [];
    } else if (currentChapter && line.trim()) {
      currentContent.push(line);
    }
  }

  if (currentChapter && currentContent.length > 0) {
    chapters.push({
      id: `${id}-${chapters.length + 1}`,
      title: currentChapter.title,
      pages: [currentContent.join('\n')]
    });
  }

  if (chapters.length === 0) {
    const paragraphs = rawContent.split('\n\n').filter(p => p.trim().length > 100);
    chapters.push({
      id: `${id}-1`,
      title: 'I bob',
      pages: [paragraphs.slice(0, 3).join('\n\n')]
    });
    chapters.push({
      id: `${id}-2`,
      title: 'II bob',
      pages: [paragraphs.slice(3, 6).join('\n\n')]
    });
    chapters.push({
      id: `${id}-3`,
      title: 'III bob',
      pages: [paragraphs.slice(6, 9).join('\n\n')]
    });
  }

  return {
    id,
    title,
    author,
    category,
    description: `${category} жанридаги "${title}" — ${author} томонидан ёзилган адабий асар. Бу китоб ўзига хос услуб ва гав-ҳамли қаҳрамонларга бой.`,
    cover: '',
    content: rawContent,
    chapters,
    progress: 0,
    lastRead: 0,
    isFavorite: false,
    addedAt: Date.now(),
    totalPages: chapters.length
  };
}

async function generateDailyBook() {
  const fs = await import('fs');
  const path = await import('path');

  const configPath = path.join(process.cwd(), 'generated-books', 'config.json');
  let config = { lastGenerated: null, generatedBooks: [] };

  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }

  const lastDate = config.lastGenerated ? new Date(config.lastGenerated).toDateString() : null;
  const today = new Date().toDateString();

  if (lastDate === today) {
    console.log(`📅 Bugungi kitob allaqachon generatsiya qilingan. Keyingi kitob ertaga.`);
    return null;
  }

  const categoryIndex = config.generatedBooks.length % CATEGORIES.length;
  const category = CATEGORIES[categoryIndex];
  const titles = BOOK_TITLES[category];
  const titleIndex = Math.floor(config.generatedBooks.length / CATEGORIES.length) % titles.length;
  const title = titles[titleIndex];

  const book = await generateBook(category, title);

  const booksPath = path.join(process.cwd(), 'generated-books', 'books.json');
  let books = [];
  if (fs.existsSync(booksPath)) {
    books = JSON.parse(fs.readFileSync(booksPath, 'utf-8'));
  }
  books.push(book);
  fs.writeFileSync(booksPath, JSON.stringify(books, null, 2));

  config.lastGenerated = Date.now();
  config.generatedBooks.push({ id: book.id, title: book.title, category });
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(`✅ Kitob generatsiya qilindi: "${title}" (${category})`);
  console.log(`📖 Jami generatsiya qilingan kitoblar: ${books.length}`);

  return book;
}

async function runScheduler() {
  console.log('🚀 Xoleric AI Book Generator ishga tushdi');
  console.log('⏰ Har kuni 1 ta kitob generatsiya qilinadi');
  console.log('📦 Ollama API: ' + OLLAMA_URL);
  console.log('---');

  await generateDailyBook();

  setInterval(async () => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      console.log(`\n🕐 ${now.toISOString()} - Yangi kun boshlandi`);
      await generateDailyBook();
    }
  }, 60000);

  setInterval(async () => {
    console.log(`⏰ Scheduler hali ishlamoqda... (${new Date().toISOString()})`);
  }, 3600000);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runScheduler();
}

export { generateBook, generateDailyBook, runScheduler };