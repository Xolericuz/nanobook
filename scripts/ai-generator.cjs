#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const OLLAMA_URL = 'http://localhost:11434';
const OLLAMA_API = 'http://localhost:11434/api/generate';
const MODEL = 'phi3:3.8b';

const BOOKS_DIR = path.join(__dirname, '..', 'generated-books');
const BOOKS_FILE = path.join(BOOKS_DIR, 'books.json');
const STATE_FILE = path.join(BOOKS_DIR, 'generator-state.json');
const PROGRESS_FILE = path.join(BOOKS_DIR, 'progress.json');

const CATEGORIES = ['Falsafa', 'Texnologiya', 'Psixologiya', 'Hikoya', 'Sci-Fi', 'Biznes', 'Drama', 'Fantasy', 'Detektiv', 'Eksperimental'];

const BOOK_TITLES = {
  'Falsafa': ['Sukunat ichidagi haqiqat', 'Vaqt bilan suhbat', 'Yo\'qotish san\'ati', 'Oddiylik kuchi', 'Qarorlar zanjiri', 'Ichki tartibsizlik', 'Tafakkur chegarasi', 'O\'zlikni izlash', 'Haqiqatning ranglari', 'Jim savollar'],
  'Texnologiya': ['Sun\'iy ong uyg\'onishi', 'Kod ortidagi ruh', 'Algoritm hukmronligi', 'Virtual haqiqat chegarasi', 'Raqamli ong', 'Serverdagi xotiralar', 'Kvant tarmoq sirlari', 'AI va inson chegarasi', 'Kodlash falsafasi', 'Neural dunyo'],
  'Psixologiya': ['Ong labirinti', 'Qo\'rquv mexanizmi', 'Motivatsiya illyuziyasi', 'Xotira parchalari', 'O\'z-o\'zini sabotaj qilish', 'Emotsiyalar arxitekturasi', 'Ichki dialog', 'Stress fizikasi', 'Baxt algoritmi', 'Ong osti o\'yinlari'],
  'Hikoya': ['Yo\'qolgan shahar', 'Oxirgi odam', 'Vaqt sayohatchisi kundaligi', 'Soyalar orasida', 'Yashirin kod', 'Tungi signal', 'Qorong\'u tizim', 'Parallel hayot', 'Noma\'lum signal', 'Sirli fayl'],
  'Sci-Fi': ['Marsdagi uyg\'onish', 'Kosmik yolg\'izlik', 'Yulduzlar orasida', 'Kiber inson', 'Energiya inqilobi', 'Yangi Yer loyihasi', 'Qora tuynuk siri', 'Vaqt parchalanishi', 'Robot etikasi', 'Galaktik signal'],
  'Biznes': ['0 dan start', 'Raqamli boylik', 'Risk psixologiyasi', 'Pul va ong', 'Startup anatomiyasi', 'Fokus kuchi', 'Disiplina kodi', 'Muvaffaqiyat mexanizmi', 'Strategik fikrlash', 'O\'sish modeli'],
  'Drama': ['Sukunatdagi qichqiriq', 'Yo\'qolgan orzular', 'Oxirgi uchrashuv', 'Ko\'z yoshlar ortida', 'Unutilgan insonlar', 'Yolg\'izlik hikoyasi', 'Yashirin haqiqat', 'Oila sinovi', 'Qaror kuni', 'So\'nggi maktub'],
  'Fantasy': ['Sehrli shahar', 'Qadimiy kuchlar', 'Ajdarlar davri', 'Sirli kitob', 'Sehrgar kundaligi', 'Parallel olamlar', 'Qorong\'u sehr', 'Qahramon yo\'li', 'Yo\'qolgan sehr', 'Qadimgi urush'],
  'Detektiv': ['Izsiz yo\'qolish', 'Sirli qotillik', 'Yashirin izlar', 'Kodlangan jinoyat', 'Sohta haqiqat', 'Qora daftar', 'Sirli odam', 'Oxirgi dalil', 'Tungi tergov', 'Yo\'qolgan signal'],
  'Eksperimental': ['Tush ichidagi tush', 'Haqiqat simulyatsiyasi', 'Ongsiz sayohat', 'Vaqtsiz makon', 'Qayta boshlanish', 'Sonsiz variantlar', 'Ichki koinot', 'Kodlangan hayot', 'Tizimdan chiqish', 'Oxirgi savol']
};

function log(msg, type = 'info') {
  const timestamp = new Date().toISOString();
  const icons = { info: '📖', success: '✅', error: '❌', warning: '⚠️', progress: '🔄' };
  console.log(`${icons[type] || '📖'} [${timestamp}] ${msg}`);
}

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function ensureDir() {
  if (!fs.existsSync(BOOKS_DIR)) {
    fs.mkdirSync(BOOKS_DIR, { recursive: true });
  }
}

function loadState() {
  ensureDir();
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  }
  return { generatedCount: 0, lastBookIndex: -1, books: [], lastRun: null };
}

function saveState(state) {
  ensureDir();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function loadBooks() {
  ensureDir();
  if (fs.existsSync(BOOKS_FILE)) {
    return JSON.parse(fs.readFileSync(BOOKS_FILE, 'utf-8'));
  }
  return [];
}

function saveBooks(books) {
  ensureDir();
  fs.writeFileSync(BOOKS_FILE, JSON.stringify(books, null, 2));
}

function checkOllama() {
  return new Promise((resolve) => {
    http.get(`${OLLAMA_URL}/api/tags`, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false));
  });
}

function callOllama(prompt, timeout = 180000) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: MODEL,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        num_predict: 2048
      }
    });

    const req = http.request(OLLAMA_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result.response || '');
        } catch (e) {
          reject(new Error('Failed to parse Ollama response'));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error('Ollama timeout'));
    });

    req.write(data);
    req.end();
  });
}

function generateFallbackBook(title, category, author = 'Xoleric AI') {
  const content = `Bu kitob ${title} haqida. ${category} janridagi bu asar o'ziga xos uslub va rangli qahramonlarga boy.

Ushbu adabiy asar o'zida chuqur ma'no va hayotiy ta'limotlarni saqlaydi. Har bir sahifa o'quvchini yangi fikrlarga olib boradi va uning dunyoqarashini kengaytiradi.

Kitobning asosiy g'oyasi - inson qalbi va uning cheksiz imkoniyatlari haqida. Qahramonlar o'z yo'llarini topishga harakat qiladilar, garchi bu yo'l oson bo'lmasa ham.

${title} - bu nafaqat hikoya, balki hayotning o'zi haqida mulohaza. Kitobni o'qib bo'lgach, siz o'z hayotingiz haqida yangi qarashlarga ega bo'lasiz.

Muallif ${author} tilni san'at darajasida ishlatadi. Har bir jumla o'ziga xos ritm va go'zallikka ega. Bu ustalikni faqat chuqur bilim va ko'p yillik tajriba orqali erishish mumkin.

Kitobning tuzilishi murakkab, lekin mukammal. Birinchi bob asosiy belgilarni tanishtiradi. Ikkinchi bob ularning ichki dunyosini ochadi. Uchinchi bob keskin voqealar bilan to'ldirilgan. Toshiriq bob esa barcha ipni birlashtiradi va hayratda qoldiradi.

${category} janrining yagonaligi shundaki, u o'quvchini faqat zabonna olib qolmaydi, balki uning ichki olamiga ham ta'sir qiladi. Bunday asarni o'qigan inson o'zgaradi - bu o'zgarish esa abadiy.

Kitobni o'qishdan maqsad - faqat zavq olish emas, balki o'zligimizni chuqurroq tushunish hamdir. Har bir sahifa yangi kashfiyot va yangi fikr olib keladi.

Nihoyat, ${title} - bu zamonaviy adabiyotning durdona asari hisoblanadi. U har bir kitobxon kutubxonasida bo'lishi kerak. Bu asarni o'qigan har bir inson o'z hayotida bir necha o'zgarishlarni sezadi.

Kitobni tavsiya qilaman - har bir kishi uchun, har bir yosh uchun, har bir did uchun. Bu asar adabiyotning eng yuqori cho'qqisi hisoblanadi.`;

  return content;
}

async function generateBookContent(title, category, author = 'Xoleric AI') {
  const prompt = `Sen o'zbek tilida professional kitob muallifisan. "${title}" nomli ${category} janridagi kitob uchun 5 ta bobdan iborat kontent yoz.

TALABLAR:
- Har bir bob kamida 800 ta belgidan iborat bo'lishi kerak
- O'zbek tilida yoz
- Har bir bob 3-4 paragraf bo'lishi kerak
- Syujet rivojlantiruvchi va hayotiy bo'lsin
- Har bir bobning sarlavhasi: I bob, II bob, III bob, IV bob, V bob

FORMAT:
[I bob. Boshlanish]
(bob matni - kamida 800 belgi)

[II bob. Rivojlanish]
(bob matni - kamida 800 belgi)

[III bob. Markaz]
(bob matni - kamida 800 belgi)

[IV bob. Yuqori cho'qqi]
(bob matni - kamida 800 belgi)

[V bob. Yakun]
(bob matni - kamida 800 belgi)`;

  try {
    log(`Ollama chaqirilmoqda: "${title}"`, 'progress');
    const content = await callOllama(prompt);

    if (content && content.length > 500) {
      return content;
    }
    log('Ollama javobi yaroqsiz, fallback ishlatilmoqda', 'warning');
    return generateFallbackBook(title, category);
  } catch (error) {
    log(`Ollama xatosi: ${error.message}`, 'error');
    return generateFallbackBook(title, category);
  }
}

function parseChapters(content, bookId) {
  const chapters = [];
  const lines = content.split('\n');
  let currentChapter = null;
  let currentContent = [];

  for (const line of lines) {
    const match = line.match(/^\[(I|II|III|IV|V)\s*bob\.?\s*([^\]]*)\]/i);

    if (match) {
      if (currentChapter) {
        const text = currentContent.join('\n');
        if (text.length > 100) {
          chapters.push({
            id: `${bookId}-${chapters.length + 1}`,
            title: currentChapter.title || `Bob ${chapters.length + 1}`,
            pages: [text]
          });
        }
      }
      currentChapter = { number: match[1], title: match[2]?.trim() || '' };
      currentContent = [];
    } else if (currentChapter && line.trim()) {
      currentContent.push(line);
    }
  }

  if (currentChapter && currentContent.length > 0) {
    const text = currentContent.join('\n');
    chapters.push({
      id: `${bookId}-${chapters.length + 1}`,
      title: currentChapter.title || `Bob ${chapters.length + 1}`,
      pages: [text]
    });
  }

  if (chapters.length === 0) {
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 100);
    for (let i = 0; i < Math.min(5, paragraphs.length); i++) {
      chapters.push({
        id: `${bookId}-${i + 1}`,
        title: `Bob ${['I', 'II', 'III', 'IV', 'V'][i]}`,
        pages: [paragraphs.slice(i * 2, i * 2 + 2).join('\n\n')]
      });
    }
  }

  return chapters;
}

async function generateNextBook() {
  const state = loadState();

  if (state.generatedCount >= 100) {
    log('Barcha 100 ta kitob generatsiya qilindi!', 'success');
    return null;
  }

  const categoryIndex = state.generatedCount % CATEGORIES.length;
  const category = CATEGORIES[categoryIndex];
  const titles = BOOK_TITLES[category];
  const titleIndex = Math.floor(state.generatedCount / CATEGORIES.length) % titles.length;
  const title = titles[titleIndex];

  log(`Generatsiya qilinmoqda: "${title}" (${category}) [${state.generatedCount + 1}/100]`, 'progress');

  const content = await generateBookContent(title, category);
  const bookId = generateId();
  const chapters = parseChapters(content, bookId);

  const book = {
    id: bookId,
    title,
    author: 'Xoleric AI',
    category,
    description: `${category} janridagi "${title}" - Xoleric AI tomonidan yozilgan adabiy asar. Bu kitob chuqur ma'no va hayotiy ta'limotlarga boy.`,
    cover: '',
    content,
    chapters,
    progress: 0,
    lastRead: 0,
    isFavorite: false,
    addedAt: Date.now(),
    totalPages: chapters.length
  };

  const books = loadBooks();
  books.push(book);
  saveBooks(books);

  state.generatedCount++;
  state.lastRun = new Date().toISOString();
  state.books.push({ id: book.id, title, category, generatedAt: state.lastRun });
  saveState(state);

  log(`Kitob generatsiya qilindi: "${title}" - ${chapters.length} ta bob`, 'success');

  return book;
}

function getStatus() {
  const state = loadState();
  const books = loadBooks();
  return {
    generated: state.generatedCount,
    remaining: 100 - state.generatedCount,
    lastRun: state.lastRun,
    recentBooks: state.books.slice(-5),
    allBooks: books
  };
}

async function runGenerator() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 XOLERIC AI KITOB GENERATOR v1.0');
  console.log('='.repeat(60) + '\n');

  const ollamaAvailable = await checkOllama();
  if (ollamaAvailable) {
    log('Ollama bilan bog\'landi', 'success');
  } else {
    log('Ollama dostup emes - fallback rejimda ishlaydi', 'warning');
  }

  const status = getStatus();
  log(`Jami generatsiya qilingan: ${status.generated}/100`);
  log(`Qolgan: ${status.remaining}`);

  if (status.generated >= 100) {
    log('Barcha kitoblar generatsiya qilindi!', 'success');
    process.exit(0);
  }

  log('Boshlanmoqda...', 'progress');

  let generatedCount = status.generated;

  while (generatedCount < 100) {
    const book = await generateNextBook();

    if (book) {
      generatedCount++;
      console.log(`\n📊 Progress: ${generatedCount}/100 (${Math.round(generatedCount)}%)`);
    }

    if (generatedCount < 100) {
      log(`1 soat kutish (keyingi kitob)`, 'info');
      await new Promise(resolve => setTimeout(resolve, 3600000));
    }
  }

  log('Barcha 100 ta kitob generatsiya qilindi! 🎉', 'success');

  const finalBooks = loadBooks();
  console.log(`\n📚 Jami kitoblar soni: ${finalBooks.length}`);
  console.log(`📁 Fayil: ${BOOKS_FILE}`);
}

if (require.main === module) {
  runGenerator().catch(console.error);
}

module.exports = { generateNextBook, getStatus, checkOllama };