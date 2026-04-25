const http = require('http');
const fs = require('fs');

const OLLAMA_API = 'http://localhost:11434/api/generate';
const MODEL = 'phi3:3.8b';

function callOllama(prompt) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: MODEL,
      prompt: prompt,
      stream: false,
      options: { temperature: 0.9, num_predict: 1500 }
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
    req.setTimeout(120000, () => { req.destroy(); reject(new Error('timeout')); });
    req.write(data);
    req.end();
  });
}

const BOOKS = [
  { title: "Sukunat ichidagi haqiqat", category: "Falsafa", desc: "Inson o'z ichki dunyosini kashf etadi. U qadimiy ustozdan sirli ta'lim oladi va hayotning asl ma'nosini topadi." },
  { title: "Sun'iy ong uyg'onishi", category: "Texnologiya", desc: "AI to'liq ong'a ega bo'ladi. Lekin u insonni yo'q qiladi yoki unga yordam beradi? Roman shu savolni ko'taradi." },
  { title: "Ong labirinti", category: "Psixologiya", desc: "Doktor Rashid bemorlarni davolashga harakat qiladi. Lekin uning o'zi ham davolanmagan." },
  { title: "Yo'qolgan shahar", category: "Hikoya", desc: "Bir kuni shahar yo'qoladi. Keyin ma'lum bo'ladiki, u hech qachon mavjud bo'lmagan." },
  { title: "Marsdagi uyg'onish", category: "Sci-Fi", desc: "Marsda birinchi odam paydo bo'ladi. U yerliklarga duch keladi." },
  { title: "0 dan start", category: "Biznes", desc: "Yosh tadbirkor 0 dan boshlaydi. U muvaffaqiyatga erishadimi?" },
  { title: "Sukunatdagi qichqiriq", category: "Drama", desc: "Oilada katta sir. Ona jim, otа jim, bola jim. Lekin bu sukunat ichida qichqiriq yashirin." },
  { title: "Sehrli shahar", category: "Fantasy", desc: "G'aladek shahar mavjud. Unda har kim tilaganini oladi. Lekin qancha ko'p olsa, shuncha kam qoldadi." },
  { title: "Izsiz yo'qolish", category: "Detektiv", desc: "Odamlar izsiz yo'qolmoqda. Ular o'zi ketdimi yoki olib ketildimi?" },
  { title: "Tush ichidagi tush", category: "Eksperimental", desc: "Bir kuni tushda boshqa tush ko'radi. U tushdan chiqolmaydi." },
  { title: "Vaqt bilan suhbat", category: "Falsafa", desc: "Faylasuf vaqt bilan suhbat qiladi. Vaqt unga barcha sirlarni aytadi." },
  { title: "Kod ortidagi ruh", category: "Texnologiya", desc: "Dasturchi o'z dasturi ichida sirli maximalni kashf etadi." },
  { title: "Qo'rquv mexanizmi", category: "Psixologiya", desc: "Har bir insonda qo'rquv bor. Lekin qo'rquv nima?" },
  { title: "Oxirgi odam", category: "Hikoya", desc: "Yerda faqat bir odam qoldi. U o'zi oxirgi?" },
  { title: "Kosmik yolg'izlik", category: "Sci-Fi", desc: "Kosmonavt yolg'izlikda fikr qiladi. U yerga qaytmoqchi." },
  { title: "Raqamli boylik", category: "Biznes", desc: "Raqamli biznes boshlaydi. Pul ko'payadi." },
  { title: "Yo'qolgan orzular", category: "Drama", desc: "Bolalar orzusi yo'qoldi. Ular orzu qilishni unutdi." },
  { title: "Qadimiy kuchlar", category: "Fantasy", desc: "Qadimiy kuchlar uyg'ondi. Ular yaxshiymi yoki yomonmi?" },
  { title: "Sirli qotillik", category: "Detektiv", desc: "Villa sahnasida qotillik. Lekin hamma shubxali." },
  { title: "Haqiqat simulyatsiyasi", category: "Eksperimental", desc: "Haqiqat simulator yaratildi. U haqiqatni ko'rsatadi." },
  { title: "Yo'qotish san'ati", category: "Falsafa", desc: "Usta nima yo'qotishni biladi. U har bir narsani beradi." },
  { title: "Algoritm hukmronligi", category: "Texnologiya", desc: "Algoritm dunyoni boshqaradi. Inson uning o'yin qo'g'oni." },
  { title: "Motivatsiya illyuziyasi", category: "Psixologiya", desc: "Motivatsiya yo'q. Lekin uning o'rniga boshqa narsa kerak." },
  { title: "Vaqt sayohatchisi", category: "Hikoya", desc: "Vaqt sayohatchisi o'tmishga qaytadi. U otasini qutqarmoqchi." },
  { title: "Yulduzlar orasida", category: "Sci-Fi", desc: "Yulduzlar orasida sayohat. Har bir yulduz - alohida dunyo." },
  { title: "Risk psixologiyasi", category: "Biznes", desc: "Risk bor. Lekin risksiz ham muvaffaqiyat yo'q." },
  { title: "Oxirgi uchrashuv", category: "Drama", desc: "Ikkim eski do'st uchrashadi. Ular 20 yil ko'rmagan." },
  { title: "Ajdarlar davri", category: "Fantasy", desc: "Ajdarlar qaytadi. Ular yaxshi edi." },
  { title: "Yashirin izlar", category: "Detektiv", desc: "Qotil iz qoldirdi. Izni duch keladi." },
  { title: "Ongsiz sayohat", category: "Eksperimental", desc: "Sahna yo'q - faqat qorong'u. U erda nimadir harakat qiladi." },
  { title: "Oddiylik kuchi", category: "Falsafa", desc: "Oddiylikda kuch bor. Eng murakkab narsalar ham oddiy yechim topadi." },
  { title: "Virtual haqiqat", category: "Texnologiya", desc: "VR va haqiqat arasida chegara yo'q." },
  { title: "Xotira parchalari", category: "Psixologiya", desc: "Xotira parchalangan. Ular bir joyda emas." },
  { title: "Soyalar orasida", category: "Hikoya", desc: "Soyalar o'rtasida yashaydi. Ular oilani ko'rmagan." },
  { title: "Kiber inson", category: "Sci-Fi", desc: "Kiber inson yaratildi. U insondan yaxshimi?" },
  { title: "Pul va ong", category: "Biznes", desc: "Pul onggizni boshqaradi. Lekin ong pulni boshqaradi." },
  { title: "Ko'z yoshlar ortida", category: "Drama", desc: "Ona ko'z yoshlarini yashiradi. Bola ko'rmasligini xohlaydi." },
  { title: "Sirli kitob", category: "Fantasy", desc: "Kitob sirli. Uni ochgan o'lmagan." },
  { title: "Kodlangan jinoyat", category: "Detektiv", desc: "Jinoyat kodlangan. Kodni yechish mumkin." },
  { title: "Vaqtsiz makon", category: "Eksperimental", desc: "Vaqt yo'q, makon yo'q. Lekin ichkarida vaqt va makon bor." },
  { title: "Qarorlar zanjiri", category: "Falsafa", desc: "Bir qaror boshqa qarorni keltiradi. U zanjirining boshini top." },
  { title: "Raqamli ong", category: "Texnologiya", desc: "Raqamli ong - yangi forma. U o'ylaydi, his qiladi." },
  { title: "O'z-o'zini sabotaj", category: "Psixologiya", desc: "Inson o'z-o'ziga to'siq qiladi. Nega?" },
  { title: "Yashirin kod", category: "Hikoya", desc: "Kod yashirin. Uni topish uchun kitob yaratildi." },
  { title: "Energiya inqilobi", category: "Sci-Fi", desc: "Yangi energiya topildi. Bu inqilob." },
  { title: "Startup anatomiyasi", category: "Biznes", desc: "Startup - jonli organizm. U o'sadi, kasallanadi, o'ladi." },
  { title: "Unutilgan insonlar", category: "Drama", desc: "Insonlar unutiladi. Ular yo'q bo'lib ketadi." },
  { title: "Sehrgar kundaligi", category: "Fantasy", desc: "Sehrgar sayohatga chiqadi. U yo'l topadi." },
  { title: "Soxta haqiqat", category: "Detektiv", desc: "Haqiqat soxta. Haqiqi haqiqat boshqa yerda." },
  { title: "Qayta boshlanish", category: "Eksperimental", desc: "Barcha qayta boshlanadi. Lekin bu safar boshqacha." },
  { title: "Ichki tartibsizlik", category: "Falsafa", desc: "Ichki tartibsizlik - bu normal holat." },
  { title: "Serverdagi xotiralar", category: "Texnologiya", desc: "Server ichida xotiralar yashaydi." },
  { title: "Emotsiyalar arxitekturasi", category: "Psixologiya", desc: "Emotsiyalar binodir. Har bir emotsiya - alohida qavat." },
  { title: "Tungi signal", category: "Hikoya", desc: "Tungi signal keladi. Kimdan?" },
  { title: "Yangi Yer loyihasi", category: "Sci-Fi", desc: "Yangi Yer yaratiladi. Bu yerda hamma narsa yaxshi." },
  { title: "Fokus kuchi", category: "Biznes", desc: "Fokus - kuch. Uni yo'qotish oson." },
  { title: "Yolg'izlik hikoyasi", category: "Drama", desc: "Yolg'iz inson hikoya qiladi. Lekin kimyo tinglaydi?" },
  { title: "Parallel olamlar", category: "Fantasy", desc: "Parallel olamlar mavjud. Ularning barchasida siz borsiz." },
  { title: "Qora daftar", category: "Detektiv", desc: "Qora daftar topildi. Ichida nima bor?" },
  { title: "Sonsiz variantlar", category: "Eksperimental", desc: "Variantlar sonsiz. Har biri boshqa." },
  { title: "Tafakkur chegarasi", category: "Falsafa", desc: "Fikrlashning chegarasi yo'q." },
  { title: "Kvant tarmoq sirlari", category: "Texnologiya", desc: "Kvant kompyuter sirli narsalarni biladi." },
  { title: "Ichki dialog", category: "Psixologiya", desc: "Inson o'zi bilan gaplashadi. Bu normalmi?" },
  { title: "Qorong'u tizim", category: "Hikoya", desc: "Tizim qorong'ida ishlaydi." },
  { title: "Qora tuynuk siri", category: "Sci-Fi", desc: "Qora tuynukdan nima chiqadi?" },
  { title: "Disiplina kodi", category: "Biznes", desc: "Disiplina - shaxsiy qonun." },
  { title: "Yashirin haqiqat", category: "Drama", desc: "Haqiqat yashirin. Uni ochish - xavfli." },
  { title: "Qorong'u sehr", category: "Fantasy", desc: "Qorong'uda sehr kuchi bor." },
  { title: "Sirli odam", category: "Detektiv", desc: "Sirli odam borki, uning sirri yo'q." },
  { title: "Ichki koinot", category: "Eksperimental", desc: "Har insonda koinot bor. U cheksiz." },
  { title: "O'zlikni izlash", category: "Falsafa", desc: "Inson o'zini izlaydi. Topadi - lekin tan olmaydi." },
  { title: "AI va inson", category: "Texnologiya", desc: "AI insondanqan farq qiladi." },
  { title: "Stress fizikasi", category: "Psixologiya", desc: "Stress jismoniy. U tan orqali chiqadi." },
  { title: "Parallel hayot", category: "Hikoya", desc: "Boshqa hayotda siz boshqa insonsiz." },
  { title: "Vaqt parchalanishi", category: "Sci-Fi", desc: "Vaqt parchalanadi. Har bir parcha alohida oqadi." },
  { title: "Muvaffaqiyat mexanizmi", category: "Biznes", desc: "Muvaffaqiyat mexanizmi oddiy." },
  { title: "Oila sinovi", category: "Drama", desc: "Oilada sinov. Har bir a'zo o'z sinovidan o'tadi." },
  { title: "Qahramon yo'li", category: "Fantasy", desc: "Qahramon yo'li qiyin." },
  { title: "Oxirgi dalil", category: "Detektiv", desc: "Oxirgi dalil eng muhim." },
  { title: "Kodlangan hayot", category: "Eksperimental", desc: "Hayot kodlangan." },
  { title: "Haqiqatning ranglari", category: "Falsafa", desc: "Haqiqatning ranglari turli." },
  { title: "Kodlash falsafasi", category: "Texnologiya", desc: "Kodlash falsafa." },
  { title: "Baxt algoritmi", category: "Psixologiya", desc: "Baxt uchun algoritm yo'q." },
  { title: "Noma'lum signal", category: "Hikoya", desc: "Signal keladi manbasiz." },
  { title: "Robot etikasi", category: "Sci-Fi", desc: "Robot qaror qilishi kerakmi?" },
  { title: "Strategik fikrlash", category: "Biznes", desc: "Strategiya - uzoqni ko'rish." },
  { title: "Qaror kuni", category: "Drama", desc: "Qaror kuni keladi." },
  { title: "Yo'qolgan sehr", category: "Fantasy", desc: "Sehr yo'qoladi." },
  { title: "Tungi tergov", category: "Detektiv", desc: "Tungi tergov samarali." },
  { title: "Tizimdan chiqish", category: "Eksperimental", desc: "Tizimdan chiqish mumkin." },
  { title: "Jim savollar", category: "Falsafa", desc: "Javobsiz savollar eng muhim." },
  { title: "Neural dunyo", category: "Texnologiya", desc: "Neural tarmoq yangi dunyo yaratadi." },
  { title: "Ong osti o'yinlari", category: "Psixologiya", desc: "Ong ostida o'yinlar bor." },
  { title: "Sirli fayl", category: "Hikoya", desc: "Fayl sirli ma'lumotlarni saqlaydi." },
  { title: "Galaktik signal", category: "Sci-Fi", desc: "Signal galaktikadan keladi." },
  { title: "O'sish modeli", category: "Biznes", desc: "O'sish modeli takrorlanadi." },
  { title: "So'nggi maktub", category: "Drama", desc: "So'nggi maktub keladi." },
  { title: "Qadimgi urush", category: "Fantasy", desc: "Qadimgi urush qaytalanadi." },
  { title: "Yo'qolgan signal", category: "Detektiv", desc: "Signal yo'qoladi." },
  { title: "Oxirgi savol", category: "Eksperimental", desc: "Oxirgi savol eng muhim." }
];

async function generate(book, index) {
  const prompt = `"${book.title}" kitobi (${book.category}). Syujet: ${book.desc}

5 ta bob yoz. Har biri unique syujetga ega bolsin. Har bir bob 600+ belgi.

[I bob]
Unikal kirish va qahramon ta'rifi...

[II bob]
Syujent rivojlanadi, yangi voqealar...

[III bob]
Markaziy qarama-qarshilik...

[IV bob]
Yuqori cho'qqi va burilish...

[V bob]
Yakun va xulosa...`;

  try {
    console.log(`[${index+1}/100] ${book.title}...`);
    const content = await callOllama(prompt);
    if (content && content.length > 500) {
      return {
        id: Math.random().toString(36).substring(2, 15) + Date.now().toString(36),
        title: book.title,
        author: 'Xoleric AI',
        category: book.category,
        description: book.desc,
        content: content,
        chapters: content.split(/\[(I|II|III|IV|V)\s*bob/i).filter(x => x.trim()).slice(0,5).map((c, i) => ({
          id: `ch-${i+1}`,
          title: ['Boshlanish','Rivojlanish','Markaz','Yuqori cho\'qqi','Yakun'][i],
          pages: [c.trim()]
        })),
        progress: 0,
        lastRead: 0,
        isFavorite: false,
        addedAt: Date.now(),
        totalPages: 5
      };
    }
  } catch (e) {
    console.log(`Xato: ${e.message}`);
  }
  return null;
}

async function main() {
  const startTime = Date.now();
  console.log('='.repeat(40));
  console.log('UNIQUE 100 KITOB (AI)');
  console.log('='.repeat(40));
  
  const results = [];
  
  for (let i = 0; i < BOOKS.length; i++) {
    const book = await generate(BOOKS[i], i);
    if (book) results.push(book);
    await new Promise(r => setTimeout(r, 200));
  }
  
  if (results.length > 0) {
    fs.writeFileSync('generated-books/unique.json', JSON.stringify(results, null, 2));
    console.log(`\n✅ ${results.length}/100`);
    console.log(`⏱️ ${(Date.now()-startTime)/1000}s`);
  }
}

main().catch(console.error);