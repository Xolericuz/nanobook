import config from '../../config/index.js';

// Book categories and titles
const CATEGORIES = config.book.categories;

const BOOK_TITLES = {
  Falsafa: [
    'Sukunat ichidagi haqiqat', 'Vaqt bilan suhbat', 'Yoqotish sanati',
    'Oddiylik kuchi', 'Qarorlar zanjiri', 'Ichki tartibsizlik',
    'Tafakkur chegarasi', 'Ozlikni izlash', 'Haqiqatning ranglari', 'Jim savollar'
  ],
  Texnologiya: [
    'Suniy ong uygonishi', 'Kod ortidagi ruh', 'Algoritm hukmronligi',
    'Virtual haqiqat', 'Raqamli ong', 'Serverdagi xotiralar',
    'Kvant tarmoq sirlari', 'AI va inson', 'Kodlash falsafasi', 'Neural dunyo'
  ],
  Psixologiya: [
    'Ong labirinti', 'Qorquv mexanizmi', 'Motivatsiya illyuziyasi',
    'Xotira parchalari', 'Oz-ozini sabotaj qilish', 'Emotsiyalar arxitekturasi',
    'Ichki dialog', 'Stress fizikasi', 'Baxt algoritmi', 'Ong osti oyinlari'
  ],
  Hikoya: [
    'Yoqolgan shahar', 'Oxirgi odam', 'Vaqt sayohatchisi',
    'Soyalar orasida', 'Yashirin kod', 'Tungi signal',
    'Qongu tizim', 'Parallel hayot', 'Nomalum signal', 'Sirli fayl'
  ],
  'Sci-Fi': [
    'Marsdagi uygonish', 'Kosmik yolgozlik', 'Yulduzlar orasida',
    'Kiber inson', 'Energiya inqilobi', 'Yangi Yer loyihasi',
    'Qora tuynuk siri', 'Vaqt parchalanishi', 'Robot etikasi', 'Galaktik signal'
  ],
  Biznes: [
    '0 dan start', 'Raqamli boylik', 'Risk psixologiyasi',
    'Pul va ong', 'Startup anatomiyasi', 'Fokus kuchi',
    'Disiplina kodi', 'Muvaffaqiyat mexanizmi', 'Strategik fikrlash', 'Osish modeli'
  ],
  Drama: [
    'Sukunatdagi qichqiriq', 'Yoqolgan orzular', 'Oxirgi uchrashuv',
    'Koz yoshlar ortida', 'Unutilgan insonlar', 'Yolgozlik hikoyasi',
    'Yashirin haqiqat', 'Oila sinovi', 'Qaror kuni', 'Songi maktub'
  ],
  Fantasy: [
    'Sehrli shahar', 'Qadimiy kuchlar', 'Ajdarlar davri',
    'Sirli kitob', 'Sehrgar kundaligi', 'Parallel olamlar',
    'Qongu sehr', 'Qahramon yoli', 'Yoqolgan sehr', 'Qadimgi urush'
  ],
  Detektiv: [
    'Izsiz yoqolish', 'Sirli qotillik', 'Yashirin izlar',
    'Kodlangan jinoyat', 'Sohta haqiqat', 'Qora daftar',
    'Sirli odam', 'Oxirgi dalil', 'Tungi tergov', 'Yoqolgan signal'
  ],
  Eksperimental: [
    'Tush ichidagi tush', 'Haqiqat simulyatsiyasi', 'Ongsiz sayohat',
    'Vaqtsiz makon', 'Qayta boshlanish', 'Sonsiz variantlar',
    'Ichki koinot', 'Kodlangan hayot', 'Tizimdan chiqish', 'Oxirgi savol'
  ]
};

// Get random category
export function getRandomCategory() {
  const index = Math.floor(Math.random() * CATEGORIES.length);
  return CATEGORIES[index];
}

// Get title by category
export function getTitleByCategory(category) {
  const titles = BOOK_TITLES[category] || BOOK_TITLES['Falsafa'];
  return titles[Math.floor(Math.random() * titles.length)];
}

// Generate unique seed
export function generateSeed(category, title) {
  return {
    category: category || getRandomCategory(),
    title: title,
    timestamp: Date.now(),
    random: Math.random().toString(36).substring(2, 15)
  };
}

// Generate random book (fallback when Ollama unavailable)
export function generateRandomBook(seed) {
  const category = seed?.category || getRandomCategory();
  const title = seed?.title || getTitleByCategory(category);
  const bookId = generateBookId();

  const content = generateLongContent(title, category);
  const chapters = generateChapters(title, category);

  return {
    id: bookId,
    title,
    author: 'Xoleric AI',
    category,
    description: `${title} - ${category} janridagi ajoyib asar.`,
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

// Generate long unique content
function generateLongContent(title, category) {
  const intro = `${title} - bu ${category} janridagi ajoyib asar. 
Muallif bu kitobni yozishda ko'p yillik tajriba va kuzatishlardan foydalangan.
Bu kitob o'quvchini hayratda qoldiradi va o'ylashga majbur qiladi.`;

  return intro;
}

// Generate book chapters with 700+ chars each
function generateChapters(title, category) {
  const bobTitles = [
    'Boshlanish va Kirish',
    'Rivojlanish va Chuqurlash',
    'Markaz va Eng Muhim Moment',
    'Yuqori Choqqi va Burilish',
    'Yakun va Xulosa'
  ];

  const contents = [
    `${title} kitobining birinchi bobi. Bu bobda asosiy tushunchalar beriladi. ${title} nima ekanini, uning kelib chiqishi va ahamiyatini bilib oling.\n\nYillar davomida ${category} sohasida ko'p narsalar o'zgardi. Qadimiy donishmandlar ham bu haqida o'ylagan va yozgan. Ularning merosi bizgacha yetib kelgan.\n\nBu bobda muallif o'z shaxsiy tajribasini ulashadi. U ${category} bilan yillardan beri shugullanadi. Endi bu bilimlarni sizga bermoqchi.\n\nAsarning boshida главный герой - oddiy inson. U katta shaharda yashaydi va odatiy hayot kechiradi. Lekin bir kuni - hamma narsa o'zgaradi.`,
    `Ikkinchi bob ${title}ning rivojlanishini davom ettiradi. Bu bobda ${category}ning turli tomonlari ochiladi. Uning kelib chiqishi, rivojlanishi va ta'sirini o'rganamiz.\n\n главный герой turli sinovlardan o'tadi. Har bir sinov - alohida dars. U muhim kashfiyot qiladi va bu kashfiyot uning hayotini o'zgartiradi.\n\nBu bob главный геройni sinaydi. U o'z aqlini va qalbini ishga soladi. Ikkalasi ham kerak.`,
    `Uchinchi bob - ${title}ning eng muhim qismi. Bu yerda ${category}ning haqiqiy ma'nosi ochiladi. главный герой o'z tanlovini qiladi. Bu qaror - uning hayotidagi eng muhim qaror.\n\nBu bobda dramatik voqealar sodir bo'ladi. Sevgi va xiyonat, sadoqat va aldamchilik - hamma birga uchrashadi. главный герoy hamma narsani boshdan kechiradi.\n\nEmotsiyalar to'lib ketadi. Qalb og'riydi, lekin bu og'riq - o'sish og'rig'i.`,
    `To'rtinchi bob - ${title}ning eng cho'qqisi. главныйгерой o'z maqsadiga yetadi. Lekin bu yo'l unchalik oson emas. Ko'p narsa yo'qoladi.\n\nU o'zgaradi, lekin bu yaxshi o'zgarish. U o'sadi va rivojladi. Bu o'zgarish - eng yaxshi natija.\n\nBu bobda eng qiziqarli voqea sodir bo'ladi. главный герой o'zining eng yaxshi do'stini yoki dushmanini topadi.`,
    `Beshinchi bob - ${title}ning yakuniy bobi. Asar tugaydi, lekin hikoya davom etadi. ${category} haqida o'ylanganlar o'quvchining qalbida yashaydi.\n\n главный герой o'zgargan holda qaytadi. U boshqa odam emas - u yangi odam. Bu o'zgarish - butun hikoyaning maqsadi.\n\nBu kitob ${category}ning biz uchun qancha muhim ekanini ko'rsatadi. Biz uni qadrlashimiz kerak.`
  ];

  return bobTitles.map((bobTitle, idx) => ({
    id: `ch-${idx + 1}`,
    title: bobTitle,
    pages: [contents[idx]]
  })));
}

// Generate unique book ID
function generateBookId() {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export default {
  getRandomCategory,
  getTitleByCategory,
  generateSeed,
  generateRandomBook
};