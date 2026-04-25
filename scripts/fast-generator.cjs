#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const BOOKS_DIR = path.join(__dirname, '..', 'generated-books');
const BOOKS_FILE = path.join(BOOKS_DIR, 'books.json');
const STATE_FILE = path.join(BOOKS_DIR, 'generator-state.json');

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

const FALLBACK_CONTENT = {
  'Falsafa': [
    'Bu falsafiy asar inson hayoti va uning ma\'nosi haqida chuqur mulohazalar yuritadi. Har bir bob o\'quvchini yangi fikrlar va g\'oyalar bilan tanishtiradi. Kitob o\'qilganda, inson o\'zicha o\'ylab ko\'radi: nega yashayapman? Nimaga erishmoqchiman? Bu savollar har bir insonning ichida uyg\'onadi va javob kutadi.\n\nKitobning asosiy qahramoni - oddiy bir inson, lekin uning ichki dunyosi juda boy. U yillar davomida turli voqealardan o\'tib, oxir-oqibatda o\'z haqiqatini topadi. Bu yo\'l oson bo\'lmadi - ko\'p tushkunliklar, ko\'p qiyinchiliklar, lekin natijada - totuvlik va huzur.\n\nFalsafa - bu nafaqat bilim, balki hayotning o\'zi. Har bir sahifa yangi bir perspektiva ochadi. Muallif tilni juda ustalik bilan ishlatadi - har bir so\'z o\'ziga xos ma\'no yuklaydi. Bu kitobni o\'qigan inson albatta o\'zgaradi.',
    'Ikkinchi bobda asosiy mavzular chuqurroq ochiladi. Sukunat, haqiqat, va bilish - bularning barchasi bir-biri bilan bog\'liq. Kitob o\'quvchini o\'ylashga majbur qiladi, lekin bu o\'ylash - zavqli va foydali.\n\nMuallif misollar va hikoyalar orqali murakkab falsafiy tushunchalarni oddiy qiladi. Har bir misol hayotiy va tushunarli. Bu usul kitobni yanada qiziqarli va o\'qilishi oson qiladi.\n\nKitobning uslubini alohida ta\'kidlash kerak. Til sodda, lekin mazmuni boy. Har bir sahifa qayta o\'qilishi mumkin va har safar yangi ma\'no ochiladi. Bu - yaxshi adabiyotning belgisi.'
  ],
  'Hikoya': [
    'Bu hikoya shu yerda boshlanadi - anonim bir shaharda, noma\'lum bir vaqtda. Qahramon - oddiy bir odam, lekin uning hayotida shunday voqea ro\'y beradiki, u hamma narsani o\'zgartiradi.\n\nShahar - bu o\'ziga xos dunyo. Ko\'chalar, uylar, odamlar - hamma narsa oddiy ko\'rinadi, lekin har birining ichida sir yashirin. Bu sirni ochish -qiziqarli va xavfli.\n\nQahramonimiz bir kuni shu shaharning eng qadimiy qismida yangi narsani kashf etadi. Bu kashfiyot uning butun hayotini o\'zgartiradi. U endi avvalgi odam emas - u o\'zgaradi, rivojlanadi, va nihoyat o\'z maqsadini topadi.\n\nHikoya davom etadi - har bir sahifa yangi sarguzasht. Qahramon turli sinovlardan o\'tadi, turli odamlar bilan uchrashadi. Har bir uchrashuv - yangi bir saboq. Bu saboqlar hayot haqida chuqur bilim beradi.'
  ]
};

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function log(msg, type = 'info') {
  const timestamp = new Date().toISOString();
  const icons = { info: '📖', success: '✅', error: '❌', warning: '⚠️', progress: '🔄' };
  console.log(`${icons[type] || '📖'} [${timestamp}] ${msg}`);
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
  return { generatedCount: 0, books: [], lastRun: null };
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

function generateRichContent(title, category) {
  const intros = {
    'Falsafa': `Falsafa - bu hayotga qanday qarash haqida fan. ${title} kitobi bu fanni chuqur va tushunarli tarzda ochib beradi.` ,
    'Texnologiya': `${title} - texnologiya haqida zamonaviy qarashlarni o\'z ichiga olgan innovatsion asar.`,
    'Psixologiya': `Psixologiya - inson qalbi va uning ishlash prinsipi haqida. Bu kitob ${title} orqali murakkab tushunchalarni soddalashtiradi.`,
    'Hikoya': `Bu - ${title} haqidagi sarguzashtli hikoya. Har bir sahifa yangi bir kashfiyot olib keladi.`,
    'Sci-Fi': `Sci-Fi janrida yozilgan ${title} kitobi kelajak haqida qiziqarli g\'oyalar va tasavvurlarni o\'z ichiga oladi.`,
    'Biznes': `${title} - biznes va muvaffaqiyat haqida amaliy qo\'llanma. Bu kitob ko\'plab muammolarga yechim topishga yordam beradi.`,
    'Drama': `Drama janridagi ${title} kitobi inson taqdirini chuqur ochib beradi va o\'quvchini hissiy sayohatga olib ketadi.`,
    'Fantasy': `Sehrli dunyoda joy olgan ${title} kitobi xayol dunyosini kengaytiradi va yangi olamlarni ochadi.`,
    'Detektiv': `${title} - siri va sarguzashtlar bilan to\'ldirilgan detektiv hikoya. Har bir sahifa yangi bir izlanish.`,
    'Eksperimental': `${title} - bu an\'anaviy bo\'lmagan yondashuv va innovatsion g\'oyalar to\'plami.`
  };

  const intro = intros[category] || `${title} - ${category} janridagi ajoyib asar.`;

  const content = `[I bob. Boshlanish]
${intro} Bu bob asosiy tushunchalar va belgilarni taqdim etadi. Qahramonimiz o\'z yo\'liga chiqadi - bu yo\'l uning butun hayotini o\'zgartiradi.

Birinchi sahifada biz qahramonni uning oddiy hayotida ko\'ramiz. U har kuni-ish, uy, oila - odatiy ritm. Lekin bir kuni - hamma narsa o\'zgaradi. Bu o\'zgarish kichik, lekin o\'ta muhim.

Muallif ustalik bilan atmosferani yaratadi. Har bir so\'z o\'ziga xos ma\'noni yuklaydi. O\'quvchi darhol hikoyaga jalb qilinadi va keyingi sahifani o\'qishga intiladi.

Ikkinchi sahifa chuqurroq - biz qahramonning ichki dunyosini ko\'ramiz. Uning orzulari, qo\'rquvlari, va umidları. Bu ichki dunyo - asarning yuragi.

Uchinchi sahifa voqealarni rivojlantiradi. Qahramon yangi muammoga duch keladi - bu muammo uning kuchini sinash uchun mo\'ljallangan. U hal qilishga harakat qiladi.

Törtinchi sahifa eng qiziqarli - qahramon o\'z kuchini kashf etadi. Bu kashfiyot - turning boshlanishi. U endi eski odam emas, u o\'zgaradi.

Beshinchi sahifa yakunlovchi - hamma narsa boshqa ko\'rinish oladi. Lekin hikoya tugamaydi - bu faqat boshlanish.

[II bob. Rivojlanish]
${category} janrining xususiyatlari bu bobda yanada ochiladi. Qahramon yangi bosqichga o\'tadi - bu bosqich murakkab va qiziqarli.

Birinchi sahifa yangi belgilarni tanishtiradi. Ular - turli xil charakterlar, turli maqsadlar. Lekin barchasi bitta narsaga intiladi - haqiqatga.

Ikkinchi sahifa munosabatlarni rivojlantiradi. Qahramon va yangi belgilar o\'rtasidagi Aloqa chuqur va murakkab. Har bir suhbat - yangi bir ma\'no.

Uchinchi sahifa eng muhim voqeani o\'z ichiga oladi. Bu voqea hamma narsani o\'zgartiradi - nafaqat qahramon uchun, balki boshqa belgilar uchun ham.

Törtinchi sahifa oqibatlarni ko\'rsatadi. Har bir qarorning oqibati bor - bu haqiqat bu bobda ochiladi. O\'quvchi tushunadi - hamma narsa mantiqiy.

Beshinchi sahifa yangi savolni ko\'taradi. Bu savol o\'quvchini o\'ylashga majbur qiladi. Javob - oldingi boblarda yashiringan.

[III bob. Markaz]
Bu bob - asarning markazi. Hamma narsa bu yerda birlashadi - syujet, belgilar, va g\'oyalar.

Birinchi sahifa muammoni qo\'yadi - bu muammo butun hikoyaning yadrosi. Qahramon uni hal qilish uchun hamma narsasini qo\'yadi.

Ikkinchi sahifa kurashni tasvirlaеdi. Bu kurash - ichki va tashqi. Qahramon o\'z ichidagi dushman bilan ham, tashqaridagi dushman bilan ham kurashadi.

Uchinchi sahifa eng yuqori cho\'qqini ifodalaydi. Bu yerda hamma narsa eng yuqori darajada - emotsiyalar, kuchlanish, va intilish.

Törtinchi sahifa burilishni olib keladi. Bu burilish - kutilmagan, lekin mantiqiy. O\'quvchi hayratda qoladi.

Beshinchi sahifa tayyorgarlikni ko\'rsatadi. Qahramon yakuniy safarga tayyorgarlik ko\'radi. Bu safar - butun hikoyaning maqsadi.

[IV bob. Yuqori cho\'qqi]
Yuqori cho\'qqi - bu eng yuqori nuqta. Hamma kuchlanish, hamma hissiyot bu yerda yig\'ilgan.

Birinchi sahifa yakuniy safarni boshlaydi. Qahramon o\'z maqsadiga yaqin, lekin hali to\'sqinliklar bor.

Ikkinchi sahifa eng katta sinovni tasvirlaеdi. Bu sinov - qahramonni to\'liq sinash uchun mo\'ljallangan. U g\'alaba qozonadimi yoki mag\'lub bo\'ladimi?

Uchinchi sahifa eng aniqlanuvchi lahza. Bu yerda hamma narsa aniq bo\'ladi - kim yutdi, kim yutqazdi. Lekin bu faqat boshlanish.

Törtinchi sahifa yangi olamni ochadi. Qahramon g\'alaba qozondi, lekin bu g\'alaba - boshqa narsalar uchun eshik ochadi.

Beshinchi sahifa tushunishni olib keladi. Qahramon o\'z haqiqatini to\'liq tushunadi. Bu tushunish - abadiy.

[V bob. Yakun]
Yakun - bu boshlanishning yakuni va yangi boshlanishning boshi. Hikoya tugamaydi, u davom etadi.

Birinchi sahifa natijalarni xulosalaydi. Hamma narsa o\'z joyiga tushadi - har qanday hikoyada bo\'lgani kabi.

Ikkinchi sahifa qahramonning o\'zgarishini ko\'rsatadi. U endi avvalgi odam emas. Bu o\'zgarish - butun hikoyanın natijasi.

Uchinchi sahifa umumiy xulosani olib keladi. O\'quvchi tushunadi - bu faqat hikoya emas, bu hayotning o\'zi haqida.

Törtinchi sahifa eskirish va qoldirish haqida. Qahramon o\'tmishini qabul qiladi va kelajakka qaraydi.

Beshinchi sahifa - oxirgi so\'z. Lekin bu oxirgi so\'z - yangi boshlanish uchun eshik. Har bir o\'quvchi bu eshikdan o\'tadi - o\'zicha.

${title} kitobi shu yerda tugaydi, lekin uning ta\'siri davom etadi. Har bir o\'quvchi bu kitobdan o\'zicha narsa oladi - bu narsa abadiy.`;

  return content;
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

  return chapters.length > 0 ? chapters : [{
    id: `${bookId}-1`,
    title: 'I bob',
    pages: [content]
  }];
}

async function generateBook(title, category) {
  const bookId = generateId();
  const content = generateRichContent(title, category);
  const chapters = parseChapters(content, bookId);

  return {
    id: bookId,
    title,
    author: 'Xoleric AI',
    category,
    description: `${category} janridagi "${title}" - Xoleric AI tomonidan yozilgan ajoyib asar. Bu kitob chuqur ma\'no va hayotiy ta\'limotlarga boy.`,
    cover: '',
    content,
    chapters,
    progress: 0,
    lastRead: 0,
    isFavorite: false,
    addedAt: Date.now(),
    totalPages: chapters.length
  };
}

async function runGenerator() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 XOLERIC AI KITOB GENERATOR v1.0');
  console.log('='.repeat(60) + '\n');

  const state = loadState();
  let count = state.generatedCount;

  log(`Jami generatsiya qilingan: ${count}/100`);

  while (count < 100) {
    const categoryIndex = count % CATEGORIES.length;
    const category = CATEGORIES[categoryIndex];
    const titles = BOOK_TITLES[category];
    const titleIndex = Math.floor(count / CATEGORIES.length) % titles.length;
    const title = titles[titleIndex];

    log(`Generatsiya qilinmoqda: "${title}" (${category}) [${count + 1}/100]`, 'progress');

    const book = await generateBook(title, category);
    const books = loadBooks();
    books.push(book);
    saveBooks(books);

    count++;
    state.generatedCount = count;
    state.lastRun = new Date().toISOString();
    state.books.push({ id: book.id, title, category, generatedAt: state.lastRun });
    saveState(state);

    log(`Kitob generatsiya qilindi! (${book.chapters.length} ta bob)`, 'success');
    console.log(`📊 Progress: ${count}/100 (${Math.round(count)}%)\n`);

    if (count < 100) {
      log('1 soat kutish...', 'info');
      await new Promise(resolve => setTimeout(resolve, 3600000));
    }
  }

  log('Barcha 100 ta kitob generatsiya qilindi! 🎉', 'success');
  const books = loadBooks();
  console.log(`\n📚 Jami kitoblar: ${books.length}`);
  console.log(`📁 Fayil: ${BOOKS_FILE}`);
}

if (require.main === module) {
  runGenerator().catch(console.error);
}

module.exports = { generateBook, loadState, loadBooks };