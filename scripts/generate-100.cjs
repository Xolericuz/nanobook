#!/usr/bin/env node

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

const CATEGORY_INTROS = {
  'Falsafa': 'Falsafa - bu hayotga qanday qarash haqida fan. Bu asar inson fikri va uning cheksiz imkoniyatlarini ochib beradi. Har bir bob o\'quvchini yangi fikrlar va g\'oyalar bilan tanishtiradi, ularni chuqur o\'ylashga va o\'z dunyoqarashini kengaytirishga majbur qiladi.',
  'Texnologiya': 'Texnologiya zamonamizning eng muhim jihatlaridan biri. Bu kitob sun\'iy intellekt, algoritmlar, va raqamli dunyo haqida chuqur va tushunarli tarzda yozilgan. Har bir sahifa yangi bir kashfiyot va yangi bir fikr olib keladi.',
  'Psixologiya': 'Psixologiya - inson qalbi va uning ishlash prinsipi haqida fan. Bu kitob ong va ong osti, motivatsiya va qo\'rquv, xotira va shaxsiyat haqida ilmiy va amaliy bilimlar beradi. Har bir bob o\'quvchini o\'z ichki dunyosini chuqurroq tushunishga olib boradi.',
  'Hikoya': 'Bu - sarguzashtli va ta\'sirli hikoya. Har bir sahifa yangi bir voqea, yangi bir kashfiyot olib keladi. Qahramonlarimiz turli sinovlardan o\'tib, o\'z maqsadlariga erishishga harakat qiladilar. Hikoya davomiy va hayotiy.',
  'Sci-Fi': 'Sci-Fi janrida yozilgan bu kitob kelajak haqida qiziqarli g\'oyalar va tasavvurlarni o\'z ichiga oladi. Kosmos, sun\'iy intellekt, va insonning kelajagi - bularning barchasi ushbu asarning mavzulari.',
  'Biznes': 'Biznes va muvaffaqiyat haqida amaliy qo\'llanma. Bu kitob g\'oyalardan pulgacha, startup dan katta korporatsiyagacha bo\'lgan yo\'lni ochib beradi. Har bir bob amaliy maslahatlar va motivatsiya bilan to\'ldirilgan.',
  'Drama': 'Drama janridagi bu kitob inson taqdirini chuqur ochib beradi va o\'quvchini hissiy sayohatga olib ketadi. Oilaviy munosabatlar, sevgi va nafrat, g\'alaba va mag\'lubiyat - bularning barchasi bu asarda o\'z aksini topadi.',
  'Fantasy': 'Sehrli dunyoda joy olgan bu kitob xayol dunyosini kengaytiradi va yangi olamlarni ochadi. Sehrgarlar, ajdarlar, va sehrli kuchlar - bularning barchasi ushbu fantastik hikoyani boy va qiziqarli qiladi.',
  'Detektiv': 'Siri va sarguzashtlar bilan to\'ldirilgan detektiv hikoya. Har bir sahifa yangi bir izlanish va yangi bir sır. tergovchi o\'z aql-zakovati bilan murakkab jinoyatni hal qilishga harakat qiladi.',
  'Eksperimental': 'Bu kitob an\'anaviy bo\'lmagan yondashuv va innovatsion g\'oyalar to\'plamini o\'z ichiga oladi. Har bir sahifa o\'quvchini yangi fikrlashga va an\'anaviydan chiqishga undaydi.'
};

function generateRichContent(title, category) {
  const intro = CATEGORY_INTROS[category] || `${title} - ${category} janridagi ajoyib asar.`;
  
  return `[I bob. Boshlanish]
${intro} Bu bob asosiy tushunchalar va belgilarni taqdim etadi. Qahramonimiz o\'z yo\'liga chiqadi - bu yo\'l uning butun hayotini o\'zgartiradi va unga yangi ma\'nolar yuklaydi.

Birinchi sahifada biz qahramonni uning odatiy hayotida ko\'ramiz. U har kuni-ish, uy, oila - bu oddiy, lekin uning ichida katta orzular yashaydi. Lekin bir kuni - hamma narsa o\'zgaradi. Bu o\'zgarish kichik boshlaydi, lekin tez orada katta o\'lchamlarni oladi.

Muallif ustalik bilan atmosferani yaratadi. Har bir so\'z o\'ziga xos ma\'noni yuklaydi. O\'quvchi darhol hikoyaga jalb qilinadi - bu jalb qilish nafaqat syujet orqali, balki tilning go\'zalligi orqali ham amalga oshadi.

Ikkinchi sahifa chuqurroq - biz qahramonning ichki dunyosini ko\'ramiz. Uning orzulari, qo\'rquvlari, umidları - bularning barchasi bir-biri bilan bog\'liq va qahramonni real qiladi. Bu ichki dunyo - asarning yuragi va harakati.

Uchinchi sahifa voqealarni rivojlantiradi. Qahramon yangi muammoga duch keladi - bu muammo uning kuchini sinash uchun mo\'ljallangan. U hal qilishga harakat qiladi, lekin bu oson bo\'lmaydi.

Törtinchi sahifa eng qiziqarli - qahramon o\'z kuchini kashf etadi. Bu kashfiyot - turning boshlanishi. U endi eski odam emas - u o\'zgaradi, rivojlanadi, va nihoyat o\'z maqsadini topadi.

Beshinchi sahifa yakunlovchi - hamma narsa boshqa ko\'rinish oladi. Lekin hikoya tugamaydi - bu faqat boshlanish. Keyingi boblar yanada qiziqarli voqealar va chuqurroq fikrlar olib keladi.

[II bob. Rivojlanish]
${category} janrining xususiyatlari bu bobda yanada ochiladi. Qahramon yangi bosqichga o\'tadi - bu bosqich murakkab va qiziqarli, lekin ayni paytda o\'quvchini hayratda qoldiradi.

Birinchi sahifa yangi belgilarni tanishtiradi. Ular - turli xil charakterlar, turli maqsadlar. Lekin barchasi bitta narsaga intiladi - haqiqatga va o\'z maqsadlariga. Bu belgilar bir-biri bilan munosabatda bo\'lib, syujetni rivojlantiradi.

Ikkinchi sahifa munosabatlarni rivojlantiradi. Qahramon va yangi belgilar o\'rtasidagi Aloqa chuqur va murakkab. Har bir suhbat - yangi bir ma\'no va yangi bir yondashuv. Bu munosabatlar - hikoyaning muhim qismi.

Uchinchi sahifa eng muhim voqeani o\'z ichiga oladi. Bu voqea hamma narsani o\'zgartiradi - nafaqat qahramon uchun, balki boshqa belgilar uchun ham. Bu o\'zgartirish - butun hikoyanın yadrosi va markazi.

Törtinchi sahifa oqibatlarni ko\'rsatadi. Har bir qarorning oqibati bor - bu haqiqat bu bobda ochiladi. O\'quvchi tushunadi - hamma narsa mantiqiy va har bir narsaning o\'z sababi bor.

Beshinchi sahifa yangi savolni ko\'taradi. Bu savol o\'quvchini o\'ylashga majbur qiladi. Javob - oldingi boblarda yashiringan, lekin uni topish uchun chuqur o\'qish kerak.

[III bob. Markaz]
Bu bob - asarning markazi. Hamma narsa bu yerda birlashadi - syujet, belgilar, g\'oyalar, va emotsiyalar. Bu birlashish - kitobning eng kuchli jihati.

Birinchi sahifa muammoni qo\'yadi - bu muammo butun hikoyaning yadrosi. Qahramon uni hal qilish uchun hamma narsasini qo\'yadi. Bu qurbonlik - uning haqiqiy kuchini ko\'rsatadi.

Ikkinchi sahifa kurashni tasvirlaеdi. Bu kurash - ichki va tashqi. Qahramon o\'z ichidagi dushman bilan ham kurashadi, tashqaridagi dushman bilan ham. Bu kurash - hikoyaning eng dramatik qismi.

Uchinchi sahifa eng yuqori cho\'qqini ifodalaydi. Bu yerda hamma narsa eng yuqori darajada - emotsiyalar, kuchlanish, intilish. Bu cho\'qqi - kitobning eng ta\'sirli lahza.

Törtinchi sahifa burilishni olib keladi. Bu burilish - kutilmagan, lekin mantiqiy. O\'quvchi hayratda qoladi va bu burilishni qabul qiladi. Bu - muallifning ustaligi.

Beshinchi sahifa tayyorgarlikni ko\'rsatadi. Qahramon yakuniy safarga tayyorgarlik ko\'radi. Bu safar - butun hikoyaning maqsadi. Bu tayyorgarlik - oxirgi bobga o\'tish.

[IV bob. Yuqori cho\'qqi]
Yuqori cho\'qqi - bu eng yuqori nuqta. Hamma kuchlanish, hamma hissiyot bu yerda yig\'ilgan. Bu yig\'ilish - kitobning eng kuchli momenti.

Birinchi sahifa yakuniy safarni boshlaydi. Qahramon o\'z maqsadiga yaqin, lekin hali to\'sqinliklar bor. Bu to\'sqinliklar - oxirgi sinov.

Ikkinchi sahifa eng katta sinovni tasvirlaеdi. Bu sinov - qahramonni to\'liq sinash uchun mo\'ljallangan. U g\'alaba qozonadimi yoki mag\'lub bo\'ladimi? Bu savol o\'quvchini hayajonga soladi.

Uchinchi sahifa eng aniqlanuvchi lahza. Bu yerda hamma narsa aniq bo\'ladi - kim yutdi, kim yutqazdi. Lekin bu faqat boshlanish - eng muhimi hali oldinda.

Törtinchi sahifa yangi olamni ochadi. Qahramon g\'alaba qozondi, lekin bu g\'alaba - boshqa narsalar uchun eshik ochadi. Bu eshik - yangi imkoniyatlar va yangi sarguzashtlar.

Beshinchi sahifa tushunishni olib keladi. Qahramon o\'z haqiqatini to\'liq tushunadi. Bu tushunish - abadiy va o\'zgarishsiz. Bu - uning oxirgi maqsadi.

[V bob. Yakun]
Yakun - bu boshlanishning yakuni va yangi boshlanishning boshi. Hikoya tugamaydi, u davom etadi - har bir o\'quvchining hayotida davom etadi.

Birinchi sahifa natijalarni xulosalaydi. Hamma narsa o\'z joyiga tushadi - har qanday hikoyada bo\'lgani kabi. Lekin bu xulosa - faqat rasmiy xulosa, haqiqiy xulosa - har bir o\'quvchining ichida.

Ikkinchi sahifa qahramonning o\'zgarishini ko\'rsatadi. U endi avvalgi odam emas. Bu o\'zgarish - butun hikoyanın natijasi va maqsadi. U o\'sgan, rivojlangan, va o\'zgargan.

Uchinchi sahifa umumiy xulosani olib keladi. O\'quvchi tushunadi - bu faqat hikoya emas, bu hayotning o\'zi haqida. Bu hikoya - har bir insonning hayoti.

Törtinchi sahifa eskirish va qoldirish haqida. Qahramon o\'tmishini qabul qiladi va kelajakka qaraydi. Bu qabul - eng muhim o\'zgarish.

Beshinchi sahifa - oxirgi so\'z. Lekin bu oxirgi so\'z - yangi boshlanish uchun eshik. Har bir o\'quvchi bu eshikdan o\'tadi - o\'zicha. Bu eshik - har kim uchun alohida.

${title} kitobi shu yerda tugaydi, lekin uning ta\'siri davom etadi. Har bir o\'quvchi bu kitobdan o\'zicha narsa oladi - bu narsa abadiy va o\'zgarishsiz.`;
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

async function runFullGenerator() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 XOLERIC 100 KITOB GENERATOR v1.0 (TEZ REJIM)');
  console.log('='.repeat(60) + '\n');

  const state = loadState();
  let count = state.generatedCount;
  const startCount = count;

  console.log(`📊 Boshlang\'ich holat: ${count}/100 ta kitob generatsiya qilingan\n`);

  while (count < 100) {
    const categoryIndex = count % CATEGORIES.length;
    const category = CATEGORIES[categoryIndex];
    const titles = BOOK_TITLES[category];
    const titleIndex = Math.floor(count / CATEGORIES.length) % titles.length;
    const title = titles[titleIndex];

    process.stdout.write(`📚 "${title}" (${category}) [${count + 1}/100]... `);

    const book = await generateBook(title, category);
    const books = loadBooks();
    books.push(book);
    saveBooks(books);

    count++;
    state.generatedCount = count;
    state.lastRun = new Date().toISOString();
    state.books.push({ id: book.id, title, category, generatedAt: state.lastRun });
    saveState(state);

    process.stdout.write(`✅ ${book.chapters.length} bob\n`);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`🎉 MUVAFFAQIYAT! ${count - startCount} ta yangi kitob generatsiya qilindi!`);
  console.log('='.repeat(60));
  console.log(`\n📊 Jami generatsiya qilingan: ${count}/100`);
  console.log(`📁 Fayil: ${BOOKS_FILE}`);
  console.log(`💾 Fayil hajmi: ${(fs.statSync(BOOKS_FILE).size / 1024 / 1024).toFixed(2)} MB`);
}

if (require.main === module) {
  runFullGenerator().catch(console.error);
}

module.exports = { generateBook, loadState, loadBooks };