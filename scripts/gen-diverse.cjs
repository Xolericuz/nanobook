const fs = require('fs');
const http = require('http');

const OLLAMA_URL = 'http://localhost:11434/api/generate';

const BOOKS = [
  { title: "Sukunat ichidagi haqiqat", category: "Falsafa", tag: "qadimiy", desc: "Inson o'z ichki dunyosini kashf etadi" },
  { title: "Sun'iy ong uyg'onishi", category: "Texnologiya", tag: "AI", desc: "AI to'liq ong'a ega bo'ladi" },
  { title: "Ong labirinti", category: "Psixologiya", tag: "doktor", desc: "Doktor bemorlarni davolaydi" },
  { title: "Yo'qolgan shahar", category: "Hikoya", tag: "shahar", desc: "Shahar yo'qoladi" },
  { title: "Marsdagi uyg'onish", category: "Sci-Fi", tag: "Mars", desc: "Marsda hayot topildi" },
  { title: "0 dan start", category: "Biznes", tag: "startup", desc: "Tadbirkor 0 dan boshlaydi" },
  { title: "Sukunatdagi qichqiriq", category: "Drama", tag: "sukunat", desc: "Oilada sir yashirin" },
  { title: "Sehrli shahar", category: "Fantasy", tag: "sehr", desc: "G'aladek shahar mavjud" },
  { title: "Izsiz yo'qolish", category: "Detektiv", tag: "izsiz", desc: "Odamlar izsiz yo'qoladi" },
  { title: "Tush ichidagi tush", category: "Eksperimental", tag: "tush", desc: "Tushda tush ko'radi" }
];

const TEMPLATES = {
  Falsafa: (b) => `Bu kitob ${b.title} haqida. ${b.desc}

I bob. Hayot va ma'no
Inson tug'ilganda maqsadsiz keladi. Uning birinchi og'ri - ma'no izlash. ${b.tag} ustoz ${b.tag}ning sirlarini biladi va shu bilimni boshqalarga bermoqchi. U o'quvchi topadi va unga o'rgatadi. Lekin o'rgatish - oson emas.

II bob. Sinov va tanlov
O'quvchi sinovdan o'tadi. Har bir sinov - alohida dars. ${b.tag} - bu darsning nomi. U o'quvcini sinaydi va natijani kutatadi. Kim biladi, balki bu sinov uning uchun juda og'ir bo'ladi.

III bob. Burilish
To'satdan hamma narsa o'zgaradi. ${b.tag} yangi ko'rinish oldida paydo bo'ladi. Bu - kutibgan daqiqa. Endi hamma narsa boshqacha. Bu burilish - abadiy.

IV bob. Qaror
Eng muhim qaror qilinadi. Bu qaror - butun hayotning yig'indisi. ${b.tag} qabul qilinadi yoki rad etiladi. Har ikkalasi ham mumkin. Lekin faqat biri to'g'ri.

V bob. Natiha
${b.title} shu yerda tugaydi. Lekin hikoya davom etadi - har bir o'quvchining hayotida. Uning ta'siri abadiy. Har kim o'z xulosasini chiqaradi.`,

  Texnologiya: (b) => `Bu kitob ${b.title} haqida. ${b.desc}

I bob. boshlash
Dasturchi ${b.tag}ga duch keladi. U yangi narsani kashf etadi. Bu kashfiyot - butun karyerasini o'zgartiradi. Kodlar o'zgaradi, lekin fikr o'zgirmaydi.

II bob. Chuqurlash
${b.tag} chuqurroq o'rganiladi. Uning sirlari ochiladi. Har bir qator - alohida dunyo. Har bir funksiya - alohida qahramon. Bu dunyo - cheksiz.

III bob. Muammo
Muammo paydo bo'ladi. ${b.tag} ishlamaydi. Kod xato. Nima qilish kerak? Dasturchi fikrlaydi, Izlanadi, Sinaydi. Va nihoyat - yechim topadi.

IV bob. Yechim
Yechim topildi! Endi hamma narsa ishlaydi. Lekin bu faqat boshlanish. Yana ko'p muammolar bor. Ularni ham hal qilish kerak.

V bob. Kelajak
${b.title} muvaffaqiyatli tugaydi. Lekin hikoya davom etadi. Yangi ${b.tag}lar, Yangi muammolar, Yangi yechimlar. Dasturlash - cheksiz sayohat.`,

  Psixologiya: (b) => `Bu kitob ${b.title} haqida. ${b.desc}

I bob. Bemorni
${b.tag} bemorni ko'radi. Uning muammosi aniq emas - u xuddi o'zi bilmaydi nima wrong. Qalbi og'riydi, lekin sababi yo'q. ${b.tag} yordam berishga harakat qiladi.

II bob. Suhbat
${b.tag} bemor bilan gaplashadi. Har bir so'z - alohida ma'no. JImjit jumlalar ham gap. Ko'zlar gapirar ekan, dil gapirar. Bu suhbat - davoning boshlanishi.

III bob. Kashfiyot
Haqiqat ochiladi. Muammoning sababi - ${b.tag}ning ichida yashiringan. U buni bilishdan qo'rqqan. Endi bilish kerak - bu og'ir, lekin zarur.

IV bob. Qabul
Bem${b.tag} o'z haqiqatini qabul qiladi. Bu - eng qiyin qadam. Lekin bu qadam - ozodlik boshlanishi. Endi oldinga borish mumkin.

V bob. Ozodlik
${b.title} va'da beradi. Ozodlik - bu maqsad. ${b.tag} va bemor birga uni qo'lga kiritadi. Ozodlik - abadiy, chunki u ichki.'`,

  Hikoya: (b) => `Bu kitob ${b.title} haqida. ${b.desc}

I bob. Boshlanish
Bir kuni ${b.tag} paydo bo'ladi. U odatiy hayot yashaydi. Lekin uning ichida boshqa narsa bor - u sezmaydi. Hamma narsa oddiy ko'rinadi.

II bob. ${b.tag.toUpperCase()}
${b.tag} o'zgaradi. U yangi narsani kashf etadi. Bu kashfiyot uning hayotini o'zgartiradi. Endi u avvalgi odam emas. U o'zgaradi.

III bob. Sinov
Sinovlar boshlanadi. ${b.tag} turli qiyinchiliklarga duch keladi. Har biri - alohida sinov. Ba'zilari muvaffaqiyatli, ba'zilari yo'q.

IV bob. Tanlov
Eng muhim tanlov oldida. ${b.tag} qaror qilishi kerak. Ikkita yo'l bor - biri oson, biri og'ir. Qaysi to'g'ri?

V bob. Yakun
${b.title} yakun topadi. ${b.tag} o'z tanlovini qiladi. Natija - har kim uchun boshqa. Lekin hikoya tugamaydi.`,

  "Sci-Fi": (b) => `Bu kitob ${b.title} haqida. ${b.desc}

I bob. Kashfiyot
${b.tag} kashf etildi! Bu - sensatsiya. Olimlar hayratda. Bu narsa bilish mumkin emas edi, lekin paydo bo'ldi. Va endi hamma narsa boshqacha.

II bob. Tahlil
${b.tag} o'rganiladi. Har bir tahlil - yangi kashfiyot. Uni tushunish qiyin, lekin mumkin. Olimlar mehnat qiladi Va natija keladi.

III bob. Tavakkal
${b.tag} xavfli ekan. Lekin xavfsiz variant ham bor. Tavakkal qilish kerakmi? Qaror qilinadi - va spacega yuboriladi.

IV bob. Encounters
${b.tag} bilan uchrashuv! Ular kutgandek edi. Yoki kutmaydimi? Encounters noaniq - lekin real. Bu - yangi boshlanish.

V bob. Kelajak
${b.title} kelajakni ko'rsatadi. ${b.tag} - bu kelajak. U yaqinmi yoki uzoqmi? Javob har bir o'quvchida.'`,

  Biznes: (b) => `Bu kitob ${b.title} haqida. ${b.desc}

I bob. G'oya
${b.tag} g'oyasi paydo bo'ladi. U oddiy - lekin kuchli. pul yo'q, lekin orzu bor. Har katta narsa kichik g'oyadan boshlanadi.

II bob. boshlash
Biznes ro'yxatdan o'tkaziladi. Hujjatlar, ruxsatnomalar, raqamlar. Barchasi rasmiy - lekin kerak. ${b.tag} shakllanadi.

III bob. O'sish
Mijozlar ko'payadi. Pul kiradi. Lekin muammolar ham ko'payadi. Har bir muammo - rivojlanish imkoniyati. ${b.tag} ulgaydi.

IV bob. inqiroz
Inqiroz keladi. Pul yo'qoladi. Mijozlar ketadi. ${b.tag} qiyin ahvolda. Lekin bu - sinov. Faqat kuchlilar o'tadi.

V bob. G'alaba
${b.title} g'alaba bilan tugaydi. ${b.tag} - bu muvaffaqiyat haqida. U boshqalarga o'rnek bo'ladi.`,

  Drama: (b) => `Bu kitob ${b.title} haqida. ${b.desc}

I bob. Oila
Oilada - ${b.tag}. Ular birga yashaydi, lekin hech narsa bilmaydi. Har biri o'z sirini saqlaydi. Bu - normal.

II bob. Sir
${b.tag} sir paydo bo'ladi. U katta - lekim hali ochilmagan. Oilada jimjitlik. Lekin bu jimjitlik - so'zlar o'rniga.

III bob. Otkash
Sir ochiladi. Bu - shock. ${b.tag} hamma narsani o'zgartiradi. Ona faryod qiladi. OTA jimjit. Bolalar - chuqur.

IV bob. Qarama-qarshilik
Oilada jiddiy muammo. ${b.tag} ularni ajratadi yoki birlashtiradi? Javob - murakkab. Lekin hamma o'tadi.

V bob. Yechim
${b.title} yechim topadi. ${b.tag} va'da beradi - yaxshiroq kelajak. Oilaviy - bu doimiy kurash.`,

  Fantasy: (b) => `Bu kitob ${b.title} haqida. ${b.desc}

I bob. Olam
Boshqa olam - ${b.tag}ning olami. U boshqacha qoidalar bilan ishlaydi. Mavjud emas - lekin real. Ichida - ${b.tag}.

II bob. ${b.tag.toUpperCase()}
${b.tag} paydo bo'ladi. U mahluk, kuch, yoki hujjatmi? Nima ekanini bilmaymiz. Lekin u bor - va ta'sirli.

III bob. Qiyinchilik
${b.tag}ga to'siq qiladi. Dushman, muammo, yoki o'zi. Qiyin - lekin yengish mumkin. ${b.tag} kuchayadi.

IV bob. Chess
Eng katta sinov. ${b.tag} va uning dushmani yakuniy jang qiladi. G'alaba yoki mag'lubiyat - faqat boshlanish.

V bob. Qaytish
${b.title} tamom bo'ladi. ${b.tag} o'z dunyosiga qaytadi. Lekin u o'zgargan - va bu o'zgarish abadiy.`,

  Detektiv: (b) => `Bu kitob ${b.title} haqida. ${b.desc}

I bob. Jinoyat
Jinoyat sodir bo'ldi. ${b.tag} - bu qotil. Joy aniq emas, vaqt aniq emas. Faqat jasad va sir.

II bob. Tergov
Tergov boshlanadi. ${b.tag} - birinchi shubxa. Lekin u shubxami? Tergovchi izlaydi, topadi, va so'raydi.

III bob. Ip
Ip topildi! ${b.tag} va jasad o'rtasida aloqa. Lekin bu - yolg'iz ip. Yana ko'p narsalar kerak.

IV bob. Haqiqat
Haqiqat ochiladi. ${b.tag} - qotil emas! Yoki? Tergovchi hayratda. Endi kim qotil?

V bob. Yakun
${b.title} yakun topadi. ${b.tag} - bu haqiqat. Lekin haqiqat ham o'zgarishi mumkin. Tergov davom etadi.`,

  Eksperimental: (b) => `Bu kitob ${b.title} haqida. ${b.desc}

I bob. Kirish
${b.tag} boshlanadi. Lekin bu normal boshlanish emas. Qayerdaligini bilmaymiz. Vaqt yo'q. Makon yo'q.

II bob. Sayohat
${b.tag} davom etadi. Vaqt va makon o'zgaradi. Guruhlar orasida - parallel olamlar. Har biri - alohida.

III bob. ${b.tag.toUpperCase()}
${b.tag} markazga yetadi. Bu - eng qirrli nuqta. Hamma narsa birlashadi - va tarqaladi.

IV bob. Burilish
Burilish sodir bo'ladi. ${b.tag} boshqacha ko'rinish oladi. Endi u eski u emas. U - yangi.

V bob. Oxirgi savol
${b.title} tugaydi. Lekin savollar qoladi. ${b.tag} - bu javob emas, savol. Har kim o'z javobini topadi.`
};

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

const books = BOOKS.flatMap(category => {
  const titles = [];
  for (let i = 1; i <= 10; i++) {
    const base = category;
    titles.push({
      ...base,
      id: generateId(),
      title: i === 1 ? base.title : `${base.title} ${i}`,
      description: `${base.desc} - ${i}-qism',
      content: TEMPLATES[base.category]({...base, tag: `${base.tag}${i}`}),
    });
  }
  return titles;
}).map((b, idx) => {
  const content = b.content;
  const chapters = [];
  const bobTitles = ['Boshlanish','Rivojlanish','Markaz','Yuqori cho\'qqi','Yakun'];
  const parts = content.split(/(?=\[I bob|[II bob|[III bob|[IV bob|[V bob)/gi);
  
  parts.forEach((part, i) => {
    if (part.trim() && i > 0) {
      chapters.push({
        id: `ch-${i}`,
        title: bobTitles[i-1] || `Bob ${i}`,
        pages: [part.trim()]
      });
    }
  });
  
  if (chapters.length === 0) {
    chapters.push({ id: 'ch-1', title: 'I bob', pages: [content] });
  }
  
  return {
    ...b,
    author: 'Xoleric AI',
    cover: '',
    chapters,
    progress: 0,
    lastRead: 0,
    isFavorite: false,
    addedAt: Date.now(),
    totalPages: chapters.length
  };
});

fs.writeFileSync('generated-books/books.json', JSON.stringify(books, null, 2));
console.log(`✅ ${books.length} ta unique kitob yaratildi!`);
console.log(`📁 generated-books/books.json`);