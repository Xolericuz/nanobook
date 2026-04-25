const http = require('http');

const OLLAMA_API = 'http://localhost:11434/api/generate';
const MODEL = 'phi3:3.8b';

function callOllama(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: MODEL,
      prompt: prompt,
      stream: false,
      options: { temperature: 0.8, num_predict: 2048 }
    });

    const req = http.request(OLLAMA_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body).response);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(180000, () => { req.destroy(); reject(new Error('timeout')); });
    req.write(data);
    req.end();
  });
}

const BOOKS = [
  { title: "Sukunat ichidagi haqiqat", category: "Falsafa", desc: "Inson o'z ichki dunyosini kashf etadi. U qadimiy ustozdan sirli ta'lim oladi va hayotning asl ma'nosini topadi." },
  { title: "Sun'iy ong uyg'onishi", category: "Texnologiya", desc: "AI to'liq ong'a ega bo'ladi. Lekin u insonni yo'q qiladi yoki unga yordam beradi? Roman shu savolni ko'taradi." },
  { title: "Ong labirinti", category: "Psixologiya", desc: "Doktor Rashid bemorlarni davolashga harakat qiladi. Lekin uning o'zi ham davolanmagan - o'z labirintida yo'qolgan." },
  { title: "Yo'qolgan shahar", category: "Hikoya", desc: "Bir kuni shahar yo'qoladi. Keyin ma'lum bo'ladiki, u hech qachon mavjud bo'lmagan - faqat xotirada." },
  { title: "Marsdagi uyg'onish", category: "Sci-Fi", desc: "Marsda birinchi odam paydo bo'ladi. U yerliklarga duch keladi - yoki o'zi yerlikmi?" },
  { title: "0 dan start", category: "Biznes", desc: "Yosh tadbirkor 0 dan boshlaydi. U muvaffaqiyatga erishadimi yoki hamma narsasini yo'qotadimi?" },
  { title: "Sukunatdagi qichqiriq", category: "Drama", desc: "Oilada katta sir. Ona jim, otа jim, bola jim. Lekin bu sukunat ichida qichqiriq yashirin." },
  { title: "Sehrli shahar", category: "Fantasy", desc: "G'aladek shahar mavjud. Unda har kim tilaganini oladi. Lekin qancha ko'p olsa, shuncha kam qoldadi." },
  { title: "Izsiz yo'qolish", category: "Detektiv", desc: "Odamlar izsiz yo'qolmoqda. Ular o'zi ketdimi yoki olib ketildimi? Tergovchi qotilni topadi - lekin topilmaganini ham." },
  { title: "Tush ichidagi tush", category: "Eksperimental", desc: "Bir kuni tushda boshqa tush ko'radi. U tushdan chiqolmaydi. Tush ichidagi tush - eng xavflisi." },
  { title: "Vaqt bilan suhbat", category: "Falsafa", desc: "Faylasuf vaqt bilan suhbat qiladi. Vaqt unga barcha sirlarni aytadi - lekin hech narsa o'zgartirmaydi." },
  { title: "Kod ortidagi ruh", category: "Texnologiya", desc: "Dasturchi o'z dasturi ichida sirli maximalni kashf etadi. Code ichida jon bor!" },
  { title: "Qo'rquv mexanizmi", category: "Psixologiya", desc: "Har bir insonda qo'rquv bor. Lekin qo'rquv nima? U qayerdan keladi va qayerga ketadi?" },
  { title: "Oxirgi odam", category: "Hikoya", desc: "Yerda faqat bir odam qoldi. U o'zi oxirgi? Yo'q, boshqa ham bor - lekin ko'rinmaydi." },
  { title: "Kosmik yolg'izlik", category: "Sci-Fi", desc: "Kosmonavt yolg'izlikda fikr qiladi. U yerga qaytmoqchi. Lekin yerdaham xuddi shunaqa." },
  { title: "Raqamli boylik", category: "Biznes", desc: "Raqamli biznes boshlaydi. Pul ko'payadi - lekin u pul emas, faqat raqam." },
  { title: "Yo'qolgan orzular", category: "Drama", desc: "Bolalar orzusi yo'qoldi. Ular orzu qilishni unutdi. Endi ularga faqat o'yinlar kerak." },
  { title: "Qadimiy kuchlar", category: "Fantasy", desc: "Qadimiy kuchlar uyg'ondi. Ular yaxshiymi yoki yomonmi? Kim biladi, muallifi ham bilmaydi." },
  { title: "Sirli qotillik", category: "Detektiv", desc: "Villa sahnasida qotillik. Lekin hamma shubxali - hatto qotil ham." },
  { title: "Haqiqat simulyatsiyasi", category: "Eksperimental", desc: "Haqiqat simulator yaratildi. U haqiqatni ko'rsatadi - lekin bu ham simulator." },
  { title: "Yo'qotish san'ati", category: "Falsafa", desc: "Usta nima yo'qotishni biladi. U har bir narsani beradi va hech narsa olmaydi." },
  { title: "Algoritm hukmronligi", category: "Texnologiya", desc: "Algoritm dunyoni boshqaradi. Inson uning o'yin qo'g'oni. O'yin boshlanadi." },
  { title: "Motivatsiya illyuziyasi", category: "Psixologiya", desc: "Motivatsiya yo'q. Lekin uning o'rniga boshqa narsa kerak - lekin nima?" },
  { title: "Vaqt sayohatchisi kundaligi", category: "Hikoya", desc: "Vaqt sayohatchisi o'tmishga qaytadi. U otasini qutqarmoqchi - lekin muxol bo'ladi." },
  { title: "Yulduzlar orasida", category: "Sci-Fi", desc: "Yulduzlar orasida sayohat. Har bir yulduz - alohida dunyo. Lekin barchasi bir xil." },
  { title: "Risk psixologiyasi", category: "Biznes", desc: "Risk bor. Lekin risksiz ham muvaffaqiyat yo'q. Qanday risk olmoq kerak?" },
  { title: "Oxirgi uchrashuv", category: "Drama", desc: "Ikkim eski do'st uchrashadi. Ular 20 yil ko'rmagan. Hamma narsa o'zgardi." },
  { title: "Ajdarlar davri", category: "Fantasy", desc: "Ajdarlar qaytadi. Ular yaxshi edi - lekin ular o'zgaradi. Davr ham o'zgaradi." },
  { title: "Yashirin izlar", category: "Detektiv", desc: "Qotil iz qoldirdi. Izni duch keladi - lekin iz egasi yo'q." },
  { title: "Ongsiz sayohat", category: "Eksperimental", desc: "Sahna yo'q - faqat qorong'u. U erda nimadir harakat qiladi. Nima ekanini kim biladi." },
  { title: "Oddiylik kuchi", category: "Falsafa", desc: "Oddiylikda kuch bor. Eng murakkab narsalar ham oddiy yechim topadi." },
  { title: "Virtual haqiqat chegarasi", category: "Texnologiya", desc: "VR va haqiqat arasida chegara yo'q. Qaysi haqiqat? Qaysi virtual?" },
  { title: "Xotira parchalari", category: "Psixologiya", desc: "Xotira parchalangan. Ular bir joyda emas - lekin hali ham esda." },
  { title: "Soyalar orasida", category: "Hikoya", desc: "Soyalar o'rtasida yashaydi. Ular oilani ko'rmagan. Soyalar ularni topadi." },
  { title: "Kiber inson", category: "Sci-Fi", desc: "Kiber inson yaratildi. U insondan yaxshimi? Javob: yaxshi va yomon - ikkalasi ham." },
  { title: "Pul va ong", category: "Biznes", desc: "Pul onggizni boshqaradi. Lekin ong pulni boshqaradi. Kim kimniki?" },
  { title: "Ko'z yoshlar ortida", category: "Drama", desc: "Ona ko'z yoshlarini yashiradi. Bola ko'rmasligini xohlaydi. Lekin u ko'radi." },
  { title: "Sirli kitob", category: "Fantasy", desc: "Kitob sirli. Uni ochgan o'lmagan. Ochmoqchi bo'lgan ham o'ldi." },
  { title: "Kodlangan jinoyat", category: "Detektiv", desc: "Jinoyat kodlangan. Kodni yechish mumkin - lekin jinoyatchi kim?" },
  { title: "Vaqtsiz makon", category: "Eksperimental", desc: "Vaqt yo'q, makon yo'q. Lekin ichkarida vaqt va makon bor." },
  { title: "Qarorlar zanjiri", category: "Falsafa", desc: "Bir qaror boshqa qarorni keltiradi. U zanjirining boshini top." },
  { title: "Raqamli ong", category: "Texnologiya", desc: "Raqamli ong - yangi forma. U o'ylaydi, his qiladi, sevadi." },
  { title: "O'z-o'zini sabotaj qilish", category: "Psixologiya", desc: "Inson o'z-o'ziga to'siq qiladi. Nega? Javob ichida yashirin." },
  { title: "Yashirin kod", category: "Hikoya", desc: "Kod yashirin. Uni topish uchun kitob yaratildi - kitobning o'zi sirli." },
  { title: "Energiya inqilobi", category: "Sci-Fi", desc: "Yangi energiya topildi. Bu inqilob - kimga inqilob?" },
  { title: "Startup anatomiyasi", category: "Biznes", desc: "Startup - jonli organizm. U o'sadi, kasallanadi, o'ladi." },
  { title: "Unutilgan insonlar", category: "Drama", desc: "Insonlar unutiladi. Ular yo'q bo'lib ketadi - lekin hali ham jonida." },
  { title: "Sehrgar kundaligi", category: "Fantasy", desc: "Sehrgar sayohatga chiqadi. U yo'l topadi - lekin yo'lning oxiri yo'q." },
  { title: "Soxta haqiqat", category: "Detektiv", desc: "Haqiqat soxta. Haqiqi haqiqat boshqa yerda. Topish mumkinmi?" },
  { title: "Qayta boshlanish", category: "Eksperimental", desc: "Barcha qayta boshlanadi. Lekin bu safar boshqacha." },
  { title: "Ichki tartibsizlik", category: "Falsafa", desc: "Ichki tartibsizlik - bu normal holat. Tartib izlash - o'zgarish." },
  { title: "Serverdagi xotiralar", category: "Texnologiya", desc: "Server ichida xotiralar yashaydi. Ular eski - lekin hali ham ta'sirli." },
  { title: "Emotsiyalar arxitekturasi", category: "Psixologiya", desc: "Emotsiyalar binodir. Har bir emotsiya - alohida qavat." },
  { title: "Tungi signal", category: "Hikoya", desc: "Tungi signal keladi. Kimdan? Nima uchun? Javob: tunda." },
  { title: "Yangi Yer loyihasi", category: "Sci-Fi", desc: "Yangi Yer yaratiladi. Bu yerda hamma narsa yaxshi - lekin sun'iy." },
  { title: "Fokus kuchi", category: "Biznes", desc: "Fokus - kuch. Uni yo'qotish oson, topish qiyin." },
  { title: "Yolg'izlik hikoyasi", category: "Drama", desc: "Yolg'iz inson hikoya qiladi. Lekin kimyo tinglaydi?" },
  { title: "Parallel olamlar", category: "Fantasy", desc: "Parallel olamlar mavjud. Ularning barchasida siz borsiz." },
  { title: "Qora daftar", category: "Detektiv", desc: "Qora daftar topildi. Ichida nima bor? Kim biladi." },
  { title: "Sonsiz variantlar", category: "Eksperimental", desc: "Variantlar sonsiz. Har biri boshqa - lekin barchasi bir xil tugaydi." },
  { title: "Tafakkur chegarasi", category: "Falsafa", desc: "Fikrlashning chegarasi yo'q. Lekin fikrlash ham chegarasi bor." },
  { title: "Kvant tarmoq sirlari", category: "Texnologiya", desc: "Kvant kompyuter sirli narsalarni biladi. U aytmaydi." },
  { title: "Ichki dialog", category: "Psixologiya", desc: "Inson o'zi bilan gaplashadi. Bu normalmi?" },
  { title: "Qorong'u tizim", category: "Hikoya", desc: "Tizim qorong'ida ishlaydi. Uni ko'rmaslik yaxshi." },
  { title: "Qora tuynuk siri", category: "Sci-Fi", desc: "Qora tuynukdan nima chiqadi? Hech narsa. Nima kiradi? Hamma narsa." },
  { title: "Disiplina kodi", category: "Biznes", desc: "Disiplina - shaxsiy qonun. Bu qonunni buzish mumkin." },
  { title: "Yashirin haqiqat", category: "Drama", desc: "Haqiqat yashirin. Uni ochish - xavfli." },
  { title: "Qorong'u sehr", category: "Fantasy", desc: "Qorong'uda sehr kuchi bor. U yaxshi yomon o'rtasida." },
  { title: "Sirli odam", category: "Detektiv", desc: "Sirli odam borki, uning sirri yo'q. Ziddiyatmi?" },
  { title: "Ichki koinot", category: "Eksperimental", desc: "Har insonda koinot bor. U cheksiz - lekin biz bilmaymiz." },
  { title: "O'zlikni izlash", category: "Falsafa", desc: "Inson o'zini izlaydi. Topadi - lekin tan olmaydi." },
  { title: "AI va inson chegarasi", category: "Texnologiya", desc: "AI insondanqan farq qiladi. Bu chegarani kim belgilaydi?" },
  { title: "Stress fizikasi", category: "Psixologiya", desc: "Stress jismoniy. U tan orqali chiqadi." },
  { title: "Parallel hayot", category: "Hikoya", desc: "Boshqa hayotda siz boshqa insonsiz. U yerda hamma yaxshi." },
  { title: "Vaqt parchalanishi", category: "Sci-Fi", desc: "Vaqt parchalanadi. Har bir parcha alohida oqadi." },
  { title: "Muvaffaqiyat mexanizmi", category: "Biznes", desc: "Muvaffaqiyat mexanizmi oddiy: harakat va takror." },
  { title: "Oila sinovi", category: "Drama", desc: "Oilada sinov. Har bir a'zo o'z sinovidan o'tadi." },
  { title: "Qahramon yo'li", category: "Fantasy", desc: "Qahramon yo'li qiyin. Lekin qaytish oson." },
  { title: "Oxirgi dalil", category: "Detektiv", desc: "Oxirgi dalil eng muhim. U hamma narsani o'zgartiradi." },
  { title: "Kodlangan hayot", category: "Eksperimental", desc: "Hayot kodlangan. Uni yechish mumkin - lekin kerakmi?" },
  { title: "Haqiqatning ranglari", category: "Falsafa", desc: "Haqiqatning ranglari turli. Har kim o'z rangini ko'radi." },
  { title: "Kodlash falsafasi", category: "Texnologiya", desc: "Kodlash falsafa - kod qanday ishlashini tushunish." },
  { title: "Baxt algoritmi", category: "Psixologiya", desc: "Baxt uchun algoritm yo'q. Lekin baxt - algoritm." },
  { title: "Noma'lum signal", category: "Hikoya", desc: "Signal keladi manbasiz. Uni qabul qilish kerak." },
  { title: "Robot etikasi", category: "Sci-Fi", desc: "Robot qaror qilishi kerakmi? Qanday qaror?" },
  { title: "Strategik fikrlash", category: "Biznes", desc: "Strategiya - uzoqni ko'rish. Bugungi qaror kelajakda qaror." },
  { title: "Qaror kuni", category: "Drama", desc: "Qaror kuni keladi. Har kim o'z qarorini qiladi." },
  { title: "Yo'qolgan sehr", category: "Fantasy", desc: "Sehr yo'qoladi. Uni topish - sehrning boshlanishi." },
  { title: "Tungi tergov", category: "Detektiv", desc: "Tungi tergov samarali. Tunda hamma narsa boshqacha." },
  { title: "Tizimdan chiqish", category: "Eksperimental", desc: "Tizimdan chiqish mumkin. Lekin tashqarida ham tizim bor." },
  { title: "Jim savollar", category: "Falsafa", desc: "Javobsiz savollar eng muhim. Ular javob kutmaydi." },
  { title: "Neural dunyo", category: "Texnologiya", desc: "Neural tarmoq yangi dunyo yaratadi. Bu dunyo haqiqiy." },
  { title: "Ong osti o'yinlari", category: "Psixologiya", desc: "Ong ostida o'yinlar bor. Ularni bilish - kuch." },
  { title: "Sirli fayl", category: "Hikoya", desc: "Fayl sirli ma'lumotlarni saqlaydi. Uni ochish - xavf." },
  { title: "Galaktik signal", category: "Sci-Fi", desc: "Signal galaktikadan keladi. U nima demoqchi?" },
  { title: "O'sish modeli", category: "Biznes", desc: "O'sish modeli takrorlanadi. Lekin har safar boshqacha." },
  { title: "So'nggi maktub", category: "Drama", desc: "So'nggi maktub keladi. Uni o'qish - oxirgi marra." },
  { title: "Qadimgi urush", category: "Fantasy", desc: "Qadimgi urush qaytalanadi. Lekin boshqacha." },
  { title: "Yo'qolgan signal", category: "Detektiv", desc: "Signal yo'qoladi. Uni topish - maxsus operatsiya." },
  { title: "Oxirgi savol", category: "Eksperimental", desc: "Oxirgi savol eng muhim. Javob - sizning javobingiz." }
];

async function generate(book, index) {
  const prompt = `Sen professiona yozuvchisan. "${book.title}" (${book.category}) kitobi uchun 5 ta unique bob yoz. Har bir bob 800+ belgi.

TALABLAR:
- Har bir bob tamomila boshqa kontentga ega bolsin
- ${book.desc}
- O'zbek tilida yoz
- Har bir bobda syujet elementi bolsin
- Qahramonlar, voqelar rivojlansin

FORMAT (faqat kontent):
[I bob. Boshlanish]
Unikal kontent...

[II bob. Rivojlanish]
Unikal kontent...

[III bob. Markaz]
Unikal kontent...

[IV bob. Yuqori choqqi]
Unikal kontent...

[V bob. Yakun]
Unikal kontent...`;

  console.log(`\n[${index+1}/100] "${book.title}" generatsiya qilinmoqda...`);
  
  let content = '';
  try {
    content = await callOllama(prompt);
  } catch (e) {
    console.log('AI xato, fallback ishlatilmoqda');
    return null;
  }
  
  if (content && content.length > 1000) {
    return {
      ...book,
      description: book.desc,
      content: content,
      author: 'Xoleric AI'
    };
  }
  return null;
}

async function main() {
  const fs = require('fs');
  const startTime = Date.now();
  
  console.log('='.repeat(50));
  console.log('🔄 UNIQUE 100 KITOB GENERATOR (AI)');
  console.log('='.repeat(50));
  
  const newBooks = [];
  
  for (let i = 0; i < BOOKS.length; i++) {
    const book = await generate(BOOKS[i], i);
    if (book) {
      book.id = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      book.chapters = parseChapters(book.content, book.id);
      newBooks.push(book);
    }
    
    // Brief delay between calls
    if (i < BOOKS.length - 1) await new Promise(r => setTimeout(r, 500));
  }
  
  if (newBooks.length > 0) {
    fs.writeFileSync('generated-books/unique-books.json', JSON.stringify(newBooks, null, 2));
    console.log(`\n✅ ${newBooks.length} ta unique kitob yaratildi!`);
    console.log(`⏱️ Vaqt: ${Math.round((Date.now() - startTime)/60000)} daqiqa`);
  }
}

function parseChapters(content, bookId) {
  const chapters = [];
  let currentTitle = '';
  let currentContent = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    const match = line.match(/^\[(I|II|III|IV|V)\s*bob\.?\s*(.*)\]/i);
    if (match) {
      if (currentTitle && currentContent.length) {
        chapters.push({
          id: `${bookId}-${chapters.length + 1}`,
          title: currentTitle,
          pages: [currentContent.join('\n')]
        });
      }
      currentTitle = match[2]?.trim() || `Bob ${['I','II','III','IV','V'][chapters.length]}`;
      currentContent = [];
    } else if (line.trim()) {
      currentContent.push(line);
    }
  }
  
  if (currentTitle && currentContent.length) {
    chapters.push({
      id: `${bookId}-${chapters.length + 1}`,
      title: currentTitle,
      pages: [currentContent.join('\n')]
    });
  }
  
  return chapters.length > 0 ? chapters : [{ id: `${bookId}-1`, title: 'I bob', pages: [content] }];
}

main().catch(console.error);