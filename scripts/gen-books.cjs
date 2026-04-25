const fs = require('fs');

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

const CATEGORIES = [
  { cat: 'Falsafa', titles: [
    'Sukunat ichidagi haqiqat','Vaqt bilan suhbat','Yoqotish sanati','Oddiylik kuchi','Qarorlar zanjiri',
    'Ichki tartibsizlik','Tafakkur chegarasi','Ozlikni izlash','Haqiqatning ranglari','Jim savollar'
  ]},
  { cat: 'Texnologiya', titles: [
    'Suniy ong uygonishi','Kod ortidagi ruh','Algoritm hukmronligi','Virtual haqiqat','Raqamli ong',
    'Serverdagi xotiralar','Kvant tarmoq sirlari','AI va inson','Kodlash falsafasi','Neural dunyo'
  ]},
  { cat: 'Psixologiya', titles: [
    'Ong labirinti','Qorquv mexanizmi','Motivatsiya','Xotira parchalari','Oz-ozini sabotaj',
    'Emotsiyalar','Ichki dialog','Stress fizikasi','Baxt algoritmi','Ong osti oyinlari'
  ]},
  { cat: 'Hikoya', titles: [
    'Yoqolgan shahar','Oxirgi odam','Vaqt sayohatchi','Soyalar orasida','Yashirin kod',
    'Tungi signal','Qongu tizim','Parallel hayot','Nomalum signal','Sirli fayl'
  ]},
  { cat: 'Sci-Fi', titles: [
    'Marsdagi uygonish','Kosmik yolgozlik','Yulduzlar orasida','Kiber inson','Energiya inqilobi',
    'Yangi Yer','Qora tuynuk','Vaqt parchalanishi','Robot etikasi','Galaktik signal'
  ]},
  { cat: 'Biznes', titles: [
    '0 dan start','Raqamli boylik','Risk psixologiyasi','Pul va ong','Startup anatomiyasi',
    'Fokus kuchi','Disiplina kodi','Muvaffaqiyat','Strategik fikrlash','Osish modeli'
  ]},
  { cat: 'Drama', titles: [
    'Sukunatdagi qichqiriq','Yoqolgan orzular','Oxirgi uchrashuv','Koz yoshlar ortida','Unutilgan insonlar',
    'Yolgozlik hikoyasi','Yashirin haqiqat','Oila sinovi','Qaror kuni','Songi maktub'
  ]},
  { cat: 'Fantasy', titles: [
    'Sehrli shahar','Qadimiy kuchlar','Ajdarlar davri','Sirli kitob','Sehrgar kundaligi',
    'Parallel olamlar','Qongu sehr','Qahramon yoli','Yoqolgan sehr','Qadimgi urush'
  ]},
  { cat: 'Detektiv', titles: [
    'Izsiz yoqolish','Sirli qotillik','Yashirin izlar','Kodlangan jinoyat','Sohta haqiqat',
    'Qora daftar','Sirli odam','Oxirgi dalil','Tungi tergov','Yoqolgan signal'
  ]},
  { cat: 'Eksperimental', titles: [
    'Tush ichidagi tush','Haqiqat simulyatsiyasi','Ongsiz sayohat','Vaqtsiz makon','Qayta boshlanish',
    'Sonsiz variantlar','Ichki koinot','Kodlangan hayot','Tizimdan chiqish','Oxirgi savol'
  ]}
];

const INTROS = {
  Falsafa: [
    'Falsafa inson fikri va dunyo tasvirini ochib beradi. Har bir bob falsafiy masalalarni turli tomondan qarab chiqadi.',
    'Inson hayotining maqsadi va uning qadriyatlari haqida chuqur mulohazalar. Bu kitob oquvchini oylashga undaydi.',
    'Hayotga oid eng muhim savollar va ularga javoblar izlanishi. Qadimiy donishmandlikdan zamonaviy fikrlargacha.'
  ],
  Texnologiya: [
    'Zamonaviy texnologiya va uning inson hayotiga taosiri. Suniy intellekt, algoritmlar, raqamli olam.',
    'Texnologik inqilobning ichki dunyosi. Kodlar ortidagi sir va失, yaratuvchilik va ijod.',
    'Kelajak texnologiyasi haqida qiziqarli groyalr va ularning royi haqiqatga aytilishi.'
  ],
  Psixologiya: [
    'Inson psiхikasi va uning ishlash mexanizmi. On, ong osti, emotsiya va ularning oltinot.',
    'Inson qalbi sirlarini ochish safari. Qorquv, sevgi, umid va umidsizlikning kelib chiqishi.',
    'Zamonaviy psixologiya ilmi va uning amaliy qoEllanishi. Oquvchini ozi haqida koPro bilim beradi.'
  ],
  Hikoya: [
    'Qiziqarli sarguzasht va ta sirli voqealar. Qahramonlar oz talohiri va taqdiriga qarshi kurashadi.',
    'Turli voqealar va ularning oquvchini hayratda qoldiruvchi ahiri. Hayot haqida chuqur mulohaza.',
    'Inson taqdiri va uning ozigarishlari. Sevgi, sadoqat, xiyonat va qadriyatlar.'
  ],
  'Sci-Fi': [
    'Kelajak texnologiyasi va kosmos sirlari. Insonning yulduzlarga sayohati va uchrashuvlar.',
    'Fantastik dunyo va uning qoidalari. Kosmik siviпlанция va boshqa olamlar.',
    'Zamonaviy sci-fi groyasi va ularning haqiqatga yaqinligi. Texnologiya va inson oltinot.'
  ],
  Biznes: [
    'Biznes va muvaffaqiyat siri. Startupdan katta korporatsiyagacha bolgan yo l.',
    'Tadbirkorlik va uning qiyinchiliklari. Pul, risk va muvaffaqiyat oltinot.',
    'Zamonaviy biznes strategiyasi va uning sirlari. Muvaffaqiyat formulu va uning qollanishi.'
  ],
  Drama: [
    'Inson taqdiri va uning ogriqlari. Oilaviy munosabatlar, sevgi va paxshi qaqida.',
    'Turli insonlar taqdiri va ularning oziEarishlari. Hayotning ogriqlari va ularni yengish.',
    'Dramatik voqealar va ularning ta sirli ahiri. Inson qalbi va uning chuqur kechinmalari.'
  ],
  Fantasy: [
    'Sehrli dunyo va uning sirlari. Ajdarlar, sehrgarlar va ularning kurashlari.',
    'Fantastik sarguzasht va uning qiziqarli syujeti. Xayol dunyo va uning qoidalari.',
    'Qadimiy epos va uning zamonaviy talqini. Qahramonlik va sehr siрati.'
  ],
  Detektiv: [
    'Tergov va uning sirli olami. Qotil, jasad va haqiqat oltinot.',
    'Murakkab jinoyatlar va ularning echimi. Tergovchi aql-zakavat va uning ish usuli.',
    'Sirli ishlar va ularning fosh qilinishi. Haqiqatni topish yo li va uning qiyinligi.'
  ],
  Eksperimental: [
    'Ananaviydan farqli yondashuv va groyasi. Hayotga oid yangi piksirlar.',
    'Eksperimental adabiyot va uning oquchilari. Turli uslub va usullar.',
    'Zamonaviy adabiyot va uning cheksiz imkoniyatlari. Kitob - bu sayohat.'
  ]
};

const books = [];

CATEGORIES.forEach(cat => {
  cat.titles.forEach((title, idx) => {
    const intro = INTROS[cat.cat][idx % INTROS[cat.cat].length];
    const tag = title.toLowerCase().split(' ')[0];
    
    const content = `I bob. Boshlanish\n${intro}\n\n${tag} haqida bu kitob ${cat.cat} janrida yozilgan.Bu bob asosiy tushunchalarni ochib beradi.${tag} nima ekanini va uning ahamiyatini bilib oling.\n\nII bob. Rivojlanish\nSyujent davom etadi va chuqurlashadi. ${tag}tiga oid yangi ma lumotlar ochiladi. Bunlar hayotiy va foydali.\n\nIII bob. Markaz\nBu bob ${tag}ning eng muhim qismi.Bu yerda asosiy g oya va syujet birlashadi.\n\nIV bob. Yuqori choqqi\nEng qiziqarli va ta sirli qism.Bu yerda hamma narsa o zgartadi va yangi burilish yuz beradi.\n\nV bob. Yakun\nXulosa va yakuniy fikrlar.${tag} va uning hayotimizga ta osiri haqida.`;
    
    books.push({
      id: generateId(),
      title: title,
      author: 'Xoleric AI',
      category: cat.cat,
      description: title + ' - Xoleric AI tomonidan yozilgan ' + cat.cat + ' kitobi.',
      cover: '',
      content: content,
      chapters: [
        { id: 'ch-1', title: 'Boshlanish', pages: [intro + '\n\n' + tag + ' haqida bu kitob ' + cat.cat + ' janrida yozilgan. Bu bob asosiy tushunchalarni ochib beradi.'] },
        { id: 'ch-2', title: 'Rivojlanish', pages: ['Syujent davom etadi. ' + tag + ' haqida yangi ma\'lumotlar ochiladi.'] },
        { id: 'ch-3', title: 'Markaz', pages: ['Eng muhim qism. ' + tag + 'ning asosiy g\'oyasi.'] },
        { id: 'ch-4', title: 'Yuqori choqqi', pages: ['Ta\'sirli moment. Hamma narsa o\'zgaradi.'] },
        { id: 'ch-5', title: 'Yakun', pages: ['Xulosa va ' + tag + ' haqida oxirgi fikrlar.'] }
      ],
      progress: 0,
      lastRead: 0,
      isFavorite: false,
      addedAt: Date.now(),
      totalPages: 5
    });
  });
});

fs.writeFileSync('generated-books/books.json', JSON.stringify(books, null, 2));
console.log('Yaratildi:', books.length, 'ta kitob');
console.log('Har bir kategoriyada:', (books.length / 10), 'ta');

let totalContent = books.reduce((a,b) => a + b.content.length, 0);
let avgContent = Math.round(totalContent / books.length);
console.log('Ortacha kontentUzunligi:', avgContent, 'belgi');