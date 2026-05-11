#!/usr/bin/env python3
"""
Build 100 books × 100 chapters each = 10,000 unique chapters.
20 format archetypes × 5 phases × 20 positions = 2000 unique patterns.
"""
import json, os, hashlib, time

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOKS_SRC = os.path.join(BASE, 'books', 'sources')
os.makedirs(BOOKS_SRC, exist_ok=True)
os.makedirs(os.path.join(BASE, 'generated-books'), exist_ok=True)

BOOK_DEFS = [
    # --- Falsafa (001-010) ---
    (1, "Sukunat ichidagi haqiqat", "Falsafa", ["Bahrom", "Zulxumor", "Ravshan"], "Samarqandning eski mahallasi", "sukunat va tinglash"),
    (2, "Vaqt bilan suhbat", "Falsafa", ["Professor Akmal", "Yulduz", "Temur"], "Toshkent universiteti kafedrasi", "vaqtni anglash"),
    (3, "Yo'qotish san'ati", "Falsafa", ["Malika", "Shavkat", "Ziyoda"], "Buxoro ko'chalari", "yo'qotish va topish"),
    (4, "Oddiylik kuchi", "Falsafa", ["Akbarjon", "Mohichehra", "Xurshid"], "Farg'ona vodiy qishlog'i", "soddalik falsafasi"),
    (5, "Qarorlar zanjiri", "Falsafa", ["Diyorbek", "Zarnigor", "Botir"], "Toshkent biznes markazi", "tanlovlar oqimi"),
    (6, "Ichki tartibsizlik", "Falsafa", ["Lola", "Jamshed", "Gulnoza"], "Navoiy ko'chasi", "tartibsizlikni qabul qilish"),
    (7, "Tafakkur chegarasi", "Falsafa", ["Rustamjon", "Mahbuba", "Sherzod"], "Andijon kutubxonasi", "fikrlash erkinligi"),
    (8, "O'zlikni izlash", "Falsafa", ["Zarina", "Sardor", "Maftuna"], "Nukus shahri", "o'z-o'zini kashf etish"),
    (9, "Haqiqatning ranglari", "Falsafa", ["Asliddin", "Sabina", "Xolida"], "Shahrisabz", "haqiqatning ko'p qirraliligi"),
    (10, "Jim savollar", "Falsafa", ["Samandar", "Odina", "Yoqub"], "Xiva minoralari", "javobsiz savollar"),
    # --- Texnologiya (011-020) ---
    (11, "Sun'iy ong uyg'onishi", "Texnologiya", ["Jamshidbek", "Feruza", "Rashid"], "IT park laboratoriyasi", "AI ong paydo bo'lishi"),
    (12, "Kod ortidagi ruh", "Texnologiya", ["Malika", "Botir", "Dildora"], "eski server xonasi", "dasturchi merosi"),
    (13, "Algoritm hukmronligi", "Texnologiya", ["Komiljon", "Zebiniso", "Ulug'bek"], "bank tizimi ofisi", "algoritm adolati"),
    (14, "Virtual haqiqat chegarasi", "Texnologiya", ["Shohruh", "Gulandom", "Mirkomil"], "VR startup studiyasi", "virtual va real muvozanat"),
    (15, "Raqamli ong", "Texnologiya", ["Professor Nodir", "Sevara", "Bahodir"], "neyron tarmoq laboratoriyasi", "miyani raqamlashtirish"),
    (16, "Serverdagi xotiralar", "Texnologiya", ["Anvarjon", "Sabina", "Tohir"], "bulut server parki", "raqamli meros"),
    (17, "Kvant tarmoq sirlari", "Texnologiya", ["Zulfiya", "Akmaljon", "Rayhon"], "kvant tadqiqot markazi", "kvant aloqa"),
    (18, "AI va inson chegarasi", "Texnologiya", ["Shahlo", "Jahongir", "Marhabo"], "sun'iy intellekt instituti", "inson va AI hamkorligi"),
    (19, "Kodlash falsafasi", "Texnologiya", ["Bobur", "Nilufar", "Sanjar"], "dasturlash maktabi", "kod orqali hayotni tushunish"),
    (20, "Neural dunyo", "Texnologiya", ["Lobar", "Islomjon", "Mohira"], "neyron tarmoq laboratoriyasi", "sun'iy dunyo yaratish"),
    # --- Psixologiya (021-030) ---
    (21, "Ong labirinti", "Psixologiya", ["Rashid", "Malika", "Yulduz"], "psixologik markaz", "travmalarni davolash"),
    (22, "Qo'rquv mexanizmi", "Psixologiya", ["Sevara", "Dilshod", "Sitora"], "baland binolar shahri", "qo'rquvni yengish"),
    (23, "Motivatsiya illyuziyasi", "Psixologiya", ["Jahongir", "Zebo", "Ravshan"], "ijodiy agentlik", "harakat motivatsiyasi"),
    (24, "Xotira parchalari", "Psixologiya", ["Gulnora", "Aziz", "Komila"], "bolalik uyi", "xotira va haqiqat"),
    (25, "O'z-o'zini sabotaj qilish", "Psixologiya", ["Alisher", "Nigora", "Bunyod"], "katta loyiha ofisi", "o'z-o'ziga to'sqinlik"),
    (26, "Emotsiyalar arxitekturasi", "Psixologiya", ["Malika", "Bobur", "Zamira"], "emotsional intellekt treningi", "hissiyotlarni boshqarish"),
    (27, "Ichki dialog", "Psixologiya", ["Jasur", "Madina", "Karim"], "shaxsiy rivojlanish kursi", "ichki ovozni o'zgartirish"),
    (28, "Stress fizikasi", "Psixologiya", ["Dilnoza", "Olimjon", "Shirin"], "korporativ ofis", "stress va tana"),
    (29, "Baxt algoritmi", "Psixologiya", ["Behruz", "Xadicha", "Nodir"], "qishloq va shahar", "baxt formulasi"),
    (30, "Ong osti o'yinlari", "Psixologiya", ["Nilufar", "Rustam", "Dilfuza"], "tushlar laboratoriyasi", "ong osti kuchi"),
    # --- Hikoya (031-040) ---
    (31, "Yo'qolgan shahar", "Hikoya", ["Abdulla", "Munis", "Davron"], "cho'l ortidagi shahar", "sirli yo'qolish"),
    (32, "Oxirgi odam", "Hikoya", ["Timur", "Samandar", "Lobar"], "bo'sh shahar ko'chalari", "yolg'izlik va umid"),
    (33, "Vaqt sayohatchisi kundaligi", "Hikoya", ["Baxtiyor", "Mohichehra", "Farrux"], "vaqt mashinasi laboratoriyasi", "vaqtni o'zgartirish"),
    (34, "Soyalar orasida", "Hikoya", ["Samandar", "Lola", "Botir"], "shahar ko'chalari", "ko'cha bolalari"),
    (35, "Yashirin kod", "Hikoya", ["Azizjon", "Gulshan", "Fotima"], "daftar va kutubxona", "oilaviy sir"),
    (36, "Tungi signal", "Hikoya", ["Karim", "Sevara", "Rustam"], "eski radio minora", "tungi ovoz siri"),
    (37, "Qorong'u tizim", "Hikoya", ["Rustam", "Karim", "Sabina"], "yer osti dunyosi", "omon qolish va do'stlik"),
    (38, "Parallel hayot", "Hikoya", ["Zafar", "Dildora", "Hamid"], "ikki shahar o'rtasida", "ikkinchi imkoniyat"),
    (39, "Noma'lum signal", "Hikoya", ["Sanjar", "Mohira", "Shuxrat"], "radio stansiya", "kosmik aloqa"),
    (40, "Sirli fayl", "Hikoya", ["Lola", "Mahmud", "Zuhra"], "kompyuter fayli ichida", "oilaviy meros"),
    # --- Sci-Fi (041-050) ---
    (41, "Marsdagi uyg'onish", "Sci-Fi", ["Aleksey", "Jasmina", "Oleg"], "Mars koloniyasi", "Marsda omon qolish"),
    (42, "Kosmik yolg'izlik", "Sci-Fi", ["Yelena", "Sanjar", "Komil"], "kosmik stansiya", "yolg'izlik va kashfiyot"),
    (43, "Yulduzlar orasida", "Sci-Fi", ["Kapitan Anvar", "Zuhra", "Iskandar"], "yulduzlararo kema", "yangi sivilizatsiya"),
    (44, "Kiber inson", "Sci-Fi", ["Shavkat", "Malika", "Odil"], "kibernetik klinika", "inson va mashina uyg'unligi"),
    (45, "Energiya inqilobi", "Sci-Fi", ["Zafar", "Nilufar", "Botir"], "energetika instituti", "yangi energiya manbai"),
    (46, "Yangi Yer loyihasi", "Sci-Fi", ["Dilshod", "Sabina", "Ravshan"], "kosmik kema", "yangi sayyorani ko'chirish"),
    (47, "Qora tuynuk siri", "Sci-Fi", ["Zulfiya", "Akmal", "Sevara"], "kosmik observatoriya", "qora tuynuk ichidagi dunyo"),
    (48, "Vaqt parchalanishi", "Sci-Fi", ["Jasur", "Mohichehra", "Bekzod"], "vaqt fizikasi laboratoriyasi", "vaqtning parchalanishi"),
    (49, "Robot etikasi", "Sci-Fi", ["Lobar", "Shohruh", "Gulshan"], "robot zavodi", "robot huquqlari"),
    (50, "Galaktik signal", "Sci-Fi", ["Olimjon", "Rayhon", "Sarvar"], "radioteleskop markazi", "boshqa galaktikadan xabar"),
    # --- Biznes (051-060) ---
    (51, "0 dan start", "Biznes", ["Behruz", "Zebiniso", "Jahongir"], "kichik ofis", "biznesni boshlash"),
    (52, "Raqamli boylik", "Biznes", ["Sanjar", "Madina", "Akbar"], "kripto birja", "raqamli iqtisodiyot"),
    (53, "Risk psixologiyasi", "Biznes", ["Dilmurod", "Sevara", "Bahrom"], "investitsiya kompaniyasi", "tavakkal va muvaffaqiyat"),
    (54, "Pul va ong", "Biznes", ["Shahlo", "Jamshed", "Nargiza"], "bank sektori", "pul psixologiyasi"),
    (55, "Startup anatomiyasi", "Biznes", ["Ulug'bek", "Mahbuba", "Timur"], "startup akselerator", "startup hayot aylanishi"),
    (56, "Fokus kuchi", "Biznes", ["Azizjon", "Gulnora", "Sherali"], "meditatsiya markazi", "diqqatni jamlash"),
    (57, "Disiplina kodi", "Biznes", ["Rustam", "Feruza", "Davlat"], "sport zali", "intizom va muvaffaqiyat"),
    (58, "Muvaffaqiyat mexanizmi", "Biznes", ["Jahongir", "Zulfiya", "Qobil"], "muvaffaqiyat treningi", "muvaffaqiyat sirlari"),
    (59, "Strategik fikrlash", "Biznes", ["Sardor", "Mohira", "Alisher"], "korporativ ofis", "strategik rejalashtirish"),
    (60, "O'sish modeli", "Biznes", ["Bobur", "Dildora", "Xurshid"], "marketing agentlik", "biznesni kengaytirish"),
    # --- Drama (061-070) ---
    (61, "Sukunatdagi qichqiriq", "Drama", ["Robiya", "Haydar", "Zamira"], "eski uy", "oilaviy sir"),
    (62, "Yo'qolgan orzular", "Drama", ["Adiba", "Siroj", "Mahfuza"], "maktab va uy", "bolalik orzulari"),
    (63, "Oxirgi uchrashuv", "Drama", ["Qurbon", "Nigora", "Valijon"], "eski kafe", "20 yillik ajralish"),
    (64, "Ko'z yoshlar ortida", "Drama", ["Mamlakat", "Abror", "Sadoqat"], "kasalxona palatasi", "ona va bola"),
    (65, "Unutilgan insonlar", "Drama", ["Qariya Akbar", "Dildor", "Zafar"], "qariyalar uyi", "yolg'iz qarilik"),
    (66, "Yolg'izlik hikoyasi", "Drama", ["Ilyos", "Maftuna", "Komil"], "katta shahar kvartirasi", "yolg'izlik va ijtimoiylashuv"),
    (67, "Yashirin haqiqat", "Drama", ["Fotima", "Nodirjon", "Rahima"], "avlodlar uyi", "avloddan avlodga sir"),
    (68, "Oila sinovi", "Drama", ["Ona Zuhra", "Ota Qahramon", "Lola"], "kasalxona va uy", "kasallik va birdamlik"),
    (69, "Qaror kuni", "Drama", ["Murod", "Gulchehra", "Vali"], "sud zali", "hayotiy qaror"),
    (70, "So'nggi maktub", "Drama", ["Yozuvchi Orif", "Zarina", "Hikmat"], "pochtamt binosi", "vidolashuv maktubi"),
    # --- Fantasy (071-080) ---
    (71, "Sehrli shahar", "Fantasy", ["Yosh Bahrom", "Sehrgar Zuhriddin", "Lola"], "ko'rinmas shahar", "sehrli olamga kirish"),
    (72, "Qadimiy kuchlar", "Fantasy", ["Elmurod", "Sitora", "Qadimgi ruh"], "qadimiy ibodatxona", "uyg'ongan kuchlar"),
    (73, "Ajdarlar davri", "Fantasy", ["Jasur", "Ajdar Zarg'ar", "Malika"], "ajdarlar vodiysi", "inson va ajdar ittifoqi"),
    (74, "Sirli kitob", "Fantasy", ["Kitobxon Odil", "Sehrgar Omina", "Sherzod"], "eski kutubxona", "sehrli kitob sarguzashti"),
    (75, "Sehrgar kundaligi", "Fantasy", ["Yosh Mahmud", "Usto Qalandar", "Nargis"], "sehrgarlar maktabi", "sehrni o'rganish"),
    (76, "Parallel olamlar", "Fantasy", ["Oyat", "Shabnam", "Jahongir"], "olamlar kesishmasi", "ko'p olamlar siri"),
    (77, "Qorong'u sehr", "Fantasy", ["Zohid", "Sabina", "Qorong'u kuch"], "taqiqlangan o'rmon", "taqiqlangan sehr"),
    (78, "Qahramon yo'li", "Fantasy", ["Qishloq yigiti Botir", "Oqsoqol", "Gulnora"], "uchta qirollik", "qahramonlik sarguzashti"),
    (79, "Yo'qolgan sehr", "Fantasy", ["Elchi", "Mohichehra", "Oq Ruh"], "sehrsiz dunyo", "sehrni qayta topish"),
    (80, "Qadimgi urush", "Fantasy", ["Sarboz Temur", "Malika Zarina", "Yo'lboshchi"], "urush maydoni", "ming yillik urush"),
    # --- Detektiv (081-090) ---
    (81, "Izsiz yo'qolish", "Detektiv", ["Tergovchi Kamol", "Lola", "Inspektor Bobur"], "shahar chekkasi", "yo'qolgan odamlar"),
    (82, "Sirli qotillik", "Detektiv", ["Detektiv G'ani", "Malika", "Shifokor Akmal"], "villa", "gumonsiz qotillik"),
    (83, "Yashirin izlar", "Detektiv", ["Tergovchi Sanjar", "Gulnora", "Arxivchi Umid"], "eski arxiv", "qayta ochilgan jinoyat"),
    (84, "Kodlangan jinoyat", "Detektiv", ["Kriptograf Zafar", "Shahlo", "Professor Olim"], "kiber xavfsizlik markazi", "kod orqali jinoyat"),
    (85, "Soxta haqiqat", "Detektiv", ["Tergovchi Davron", "Sabina", "Sardor"], "yolg'on va haqiqat", "yolg'on guvohlik"),
    (86, "Qora daftar", "Detektiv", ["Tergovchi Botir", "Malika", "Muallim"], "daftar va shifr", "daftardagi sirlar"),
    (87, "Sirli odam", "Detektiv", ["Agent Davron", "Zulfiya", "General Ashurov"], "harbiy qism", "sirli shaxs"),
    (88, "Oxirgi dalil", "Detektiv", ["Advokat Jamila", "Prokuror Olim", "Guvoh Qodir"], "sud binosi", "yakunlovchi dalil"),
    (89, "Tungi tergov", "Detektiv", ["Tergovchi Xurshid", "Robiya", "Kapitan O'tkir"], "tungi shahar", "tungi operatsiya"),
    (90, "Yo'qolgan signal", "Detektiv", ["Xodim Jasur", "Sevara", "Boshliq Ikrom"], "maxfiy laboratoriya", "fitna va signal"),
    # --- Eksperimental (091-100) ---
    (91, "Tush ichidagi tush", "Eksperimental", ["Behruz", "Tushdagi qiz", "Oq kiym"], "tushlar dunyosi", "tushdan chiqish"),
    (92, "Haqiqat simulyatsiyasi", "Eksperimental", ["Dasturchi Aziz", "Sevara", "Simulyatsiya"], "virtual reallik laboratoriyasi", "simulyatsiya ichida haqiqat"),
    (93, "Ongsiz sayohat", "Eksperimental", ["Tadqiqotchi Olima", "Robot", "Nur"], "ong laboratoriyasi", "ongsiz sayohat"),
    (94, "Vaqtsiz makon", "Eksperimental", ["Fizik Anvar", "Zebo", "Parallel"], "kvant fizikasi instituti", "vaqt va makonsiz olam"),
    (95, "Qayta boshlanish", "Eksperimental", ["Zafar", "Malika", "Nazoratchi"], "yangi dunyo", "hayotni qayta yashash"),
    (96, "Sonsiz variantlar", "Eksperimental", ["Oybek", "Zilola", "Falonchi"], "multiverse markazi", "cheksiz variantlar"),
    (97, "Ichki koinot", "Eksperimental", ["Olim Behzod", "Ruh", "Oyna"], "mikroskopik olam", "ichki koinot siri"),
    (98, "Kodlangan hayot", "Eksperimental", ["Dasturchi Kamola", "Botir", "Tizim"], "hayot kodlari", "hayotni kod sifatida"),
    (99, "Tizimdan chiqish", "Eksperimental", ["Chiquvchi Javlon", "Nigora", "Qorovul"], "tizim tashqarisi", "tizimdan ozodlik"),
    (100, "Oxirgi savol", "Eksperimental", ["Faylasuf Orzu", "Samandar", "Javob"], "abadiy savol", "yakuniy savol"),
]

def gen_chapter(form, phase, pos, a, b, c, s, h, t):
    """Generate one chapter with unique content."""
    focus = [a, b, c][pos % 3]
    helper = [a, b, c][(pos + 1) % 3]
    witness = [a, b, c][(pos + 2) % 3]
    style = ["mulohaza", "dialog", "tavsif", "harakat"][pos % 4]
    mood = ["sokin", "jiddiy", "hayajonli", "falsafiy", "his-hayajonli"][pos % 5]

    # 20 format archetypes × 5 phases = 100 main templates
    # Combined with style + mood + character rotation = unique per chapter
    tpl = _templates(form, phase, pos, a, b, c, s, h, t, focus, helper, witness, style, mood)
    return tpl

def _templates(form, phase, pos, a, b, c, s, h, t, f, hlp, wit, sty, mood):
    """Return chapter text based on form, phase, position."""
    ch = pos + 1 + phase * 20  # 1-100
    # Base text varies by (form, phase). Style adds uniqueness per chapter.
    
    if form == 0:  # first_person_memoir
        base = [
            f"Men {a} edim. {s}da yashardim. {h} meni o'ylantirardi. {b} bilan har kuni ko'rishardik. {b} menga: «Sen o'zgarishing kerak», derdi. Men esa o'ylardim: nega o'zgarish kerak?",
            f"O'zgarish boshlandi. {h} meni o'ziga tortdi. {s}da yurarkanman, {b}ning so'zlari esimga tushdi. {c} kuzatib turardi. Men {h} haqida ko'proq bilmoqchi edim.",
            f"Kunlar o'tdi. {h} haqida o'ylar, uning ma'nosini tushunishga urinardim. {b} yonimda edi. {c} esa indamas, kuzatardi. Bir kuni {b} dedi: «{a}, {h}ni tushunishga urinma. Uni yashash kerak».",
            f"{h}ni yashash — bu oson emas. Har kuni yangi sinov, yangi savol. {c} menga bir gap aytdi: «Sen o'zgarishdan qo'rqma». Men o'zgarishni qabul qildim. Eski qarashlarimni ortda qoldirdim.",
            f"Endi orqaga qaraganimda, {h} menga nafaqat dunyoni, balki o'zimni ham qayta kashf etishga yordam berdi. {b} va {c} — ularsiz bu yo'l mumkin emas edi. {t} — bu mening hikoyam.",
        ]
    elif form == 1:  # socratic_dialogue
        base = [
            f"Bir kuni {a} {s}da o'tirib, {b}ga yuzlandi: «{b}, {h} deganda nimani tushunasan?» {b} o'ylanib turdi: «{h} — bu hayotning eng muhim qismi». {c} suhbatga qo'shildi: «Balki {h}ni tushunish uchun avval o'zimizni tushunishimiz kerak?»",
            f"«{h} nima?» — degan savol atrofida munozara qizidi. {a} {b}ga qaradi: «{h}ni o'rganish mumkinmi?» {b}: «Har bir narsani o'rganish mumkin». {c}: «Usul — bu vosita. Asosiysi — niyat».",
            f"Munozara chuqurlashdi. {a} yangi savol berdi: «{h}ni his qilish va tushunish o'rtasida farq bormi?» {b}: «His qilish — tajriba. Tushunish — natija». {c}: «Ikkalasi bir-biriga bog'liq».",
            f"To'satdan {c}ning ko'zlari yorishdi: «Men tushundim! {h}ni tushunish uchun javob izlash shart emas. Savolning o'zi muhim». {a} jilmaydi. {b} bosh chayqadi. Uchovlon bir narsada kelishishdi: savol — bu boshlanish.",
            f"Kun botayotgan edi. Uch kishi {s}da o'tirib, sukunatga sho'ng'idilar. {a} so'nggi marta gapirdi: «{t} — bu faqat boshlanishdir. Ertaga yangi savollar tug'iladi». {b} va {c} indamay bosh irg'adilar.",
        ]
    elif form == 2:  # parable_allegory
        base = [
            f"Qadim zamonlarda {s}da bir donishmand yashagan ekan. Uning uchta shogirdi bor edi: {a}, {b} va {c}. Donishmand ularga {h} haqida saboq berdi. «{h} — bu ichki boylik», dedi u.",
            f"Donishmand {a}ga qaradi: «Sen {h}ning qaysi tomonini ko'ryapsan?» {a} javob berdi: «Ustoz, men uning rangini ko'ryapman». {b}: «Men hidini his qilyapman». {c}: «Men ichida nima borligini bilmoqchiman».",
            f"Shogirdlar yo'lga chiqdilar. {a} tog'larga chiqdi, {b} daryolar bo'ylab yurdi, {c} sahrolardan o'tdi. Har biri o'z yo'lida sinovlarga duch keldi. Uch oydan so'ng {s}da uchrashdilar.",
            f"Donishmand shogirdlarini ko'rib, xursand bo'ldi. {a}: «{h}ni tushunish uchun kuchsizligingni tan olish kerak». {b}: «{h} — yo'lda yolg'iz yurib bo'lmaydi». {c}: «{h}ni topish uchun ko'p narsani yo'qotish kerak».",
            f"Shogirdlar o'z yo'llariga ketdilar. {a} qishloqqa borib, {h}ni o'rgatdi. {b} shaharga borib, {h}ni tushuntirdi. {c} {s}da qoldi. Yillar o'tdi. {h} haqidagi bilim butun yurtga tarqaldi.",
        ]
    elif form == 3:  # epistolary_letter
        base = [
            f"Aziz {b}, sizga bu maktubni {s}dan yozyapman. Bu yer juda sokin. Men {h} haqida o'ylab o'tiribman. Hayotdagi eng muhim narsalar oddiy narsalardir. Biz ularni murakkablashtirishga odatlanganmiz.",
            f"Kecha men {s}ning qadimiy burchagiga bordim. Bir kampir o'z hayot hikoyasini aytib berdi. Uning hikoyasida {h}ning butun mazmuni bor edi. «{h}ni tushunish uchun ochiq qalb kerak», dedi u.",
            f"Bugun ertalab {h} haqida o'yladim. Nega biz murakkab narsalarni izlaymiz? {h} juda oddiy. {s}ning quyosh botishi, odamlarning tabassumi — bularning barchasida {h}ning bir parchasi bor.",
            f"Endi tushunaman: {h} — bu izlash emas, topishdir. Biz izlaganimiz sari uzoqlashadi, to'xtaganimizda o'z-o'zidan keladi. {c} aytganidek: «Faqat ichki tayyorlik kerak».",
            f"Bu yerdan ketish vaqti keldi. {s} bilan xayrlashish qiyin. Bu joy menga {h}ni o'rgatdi. Umid qilamanki, siz ham o'zingizning {h}ingizni topasiz. Hurmat bilan, {a}.",
        ]
    elif form == 4:  # stream_of_consciousness
        base = [
            f"nega hamma narsa shunchalik murakkab deb o'ylaydi odamlar oddiy narsalar oddiy bo'lishi kerak {s}da yana o'sha ko'cha {b}ning so'zlari esimda: sen o'zgarishing shart emas faqat ko'zoynagini artish kerak va men artdim birdan hamma narsa tiniq bo'lib ketdi",
            f"ranglar yorqin tovushlar aniq va men nihoyat tushundim {h}ni tushunish uchun hech qayerga borish shart emas u shu yerda hozir mana shu daqiqada {c} kuladi: sen doim shoshilasan lekin {h}ni tushunish uchun vaqt kerak sabr kerak",
            f"men sabrni o'rganyapman {s}da yolg'iz yurib {b} bilan uchrashib {c} bilan suhbatlashib asta sekin {h}ning ma'nosi ochilmoqda xuddi piyozning po'stidek har bir qatlam yangi ma'no yangi savol",
            f"bir kuni ertalab uyg'ondim va {h}ni his qildim u butun vujudimga tarqaldi {b} yonimda edi: ko'ryapsanmi sen endi o'zgarding men indamay bosh irg'addim {c} pichirladi: {h}ni topdingmi men javob berdim: yo'q {h} meni topdi",
            f"endi men bilaman {t} — bu faqat boshlanish {h}ni anglash yo'lida hali ko'p narsa bor {b} va {c} bilan davom etamiz nega biz buncha qo'rqamiz {h} — bu qo'rquvni yengishdir va men yengdim oldinga qarayman yangi kun yangi imkoniyatlar",
        ]
    elif form == 5:  # koan_question
        base = [
            f"Bir kuni {a} {s}da yashovchi donishmand {b}ning oldiga borib so'radi: «{h}ni qanday tushunish mumkin?» {b} unga bir piyola choy quyib berdi. Piyola to'lgan edi. «Avval bo'shatish kerak», dedi donishmand.",
            f"{a} so'radi: «Agar men bo'shatsam, nima bilan to'ldiraman?» {b}: «Hech narsa bilan. Bo'shliqni ham qadrlash kerak». {c} bu suhbatni eshitib turardi. Donishmand uchala piyolani stolga qo'ydi.",
            f"{a} har kuni donishmandning huzuriga kela boshladi. Har safar bir savol berardi. {b} har safar bir piyola choy berib, jilmayib qo'yardi. {c} esa kuzatardi. Bir kuni {a}: «Nega javob bermaysiz?» {b}: «Men javob beryapman».",
            f"Bir kuni {a} donishmandning oldiga kelmadi. U {s}da yolg'iz sayr qildi. Daryo bo'yiga bordi. Suvga qaradi. To'satdan tushundi: {h}ni tushunish uchun javob kerak emas. Savolning o'zi etarli.",
            f"{a} endi o'zi donishmand bo'lib qoldi. U {s}da qolib, kelgan savollarga javob berardi. Lekin hech qachon to'g'ridan-to'g'ri javob bermasdi. Faqat choy quyib berar, jilmayar, indamas edi.",
        ]
    elif form == 6:  # lecture_speech
        base = [
            f"Hurmatli tinglovchilar! Bugun {h} haqida gaplashamiz. Men {a}man, {s}dan kelganman. {h} — insoniyat tafakkurining eng muhim kategoriyasi. Tarix shuni ko'rsatadiki, katta kashfiyotlar aynan {h} sohasida qilingan.",
            f"{h}ni ikki qismga ajratish mumkin: nazariy va amaliy. Nazariy qismi — mavhum tomoni. Amaliy qismi — kundalik hayotdagi ifodasi. {b} aytganidek: «Biz qanchalik ko'p bilsak, shunchalik ko'p bilmasligimizni anglaymiz».",
            f"Tarixga nazar solsak, {h} turli davrlarda turlicha tushunilgan. Qadimgi donishmandlar {h}ni koinot siri deb bilishgan. Bugungi kunda {h}ni o'rganish fanlararo yondashuvni talab qiladi. {c} aytganidek: «{h} barcha fanlarning kesishmasida joylashgan».",
            f"Endi {h}ni amaliyotga tatbiq etish haqida. Nazariy bilim amaliyot bilan mustahkamlanmasa, to'liq bo'lmaydi. {s}da o'tkazgan yillarim davomida {h}ni amalda qo'llashni o'rgandim. Kuzatish, tahlil, xulosa — uch bosqich.",
            f"Xulosa: {h}ni anglash uchun ochiq fikr, tanqidiy tafakkur va doimiy o'rganish kerak. {t} — bu faqat bir kirish. {c} aytganidek: «{h}ni o'rganish — bir umrlik sayohat». E'tiboringiz uchun rahmat!",
        ]
    elif form == 7:  # diary_entries
        base = [
            f"{a}ning kundaligidan. {s}, {ch}-kun. Bugun {h} haqida o'yladim. {b} menga: «{h}ni tashqaridan izlama, u ichingda», dedi. {c} indamay kuzatdi. Men {s}da kezib, o'z fikrlarim bilan yolg'iz qoldim.",
            f"{ch}-kun. {s} ko'chalarini kezaman. Har burchakda yangi ma'no topaman. {b} bilan uzoq suhbatlashdik. {c} ham qo'shildi. Uchalamiz hayot haqida gaplashdik. Men {h}ni tushuna boshlagandekman.",
            f"{ch}-kun. Uxlay olmadim. {h} haqida o'yladim. Yillar davomida noto'g'ri narsalarga ishonganman. {b} haq edi: {h}ni ichkaridan izlash kerak. {c} ertalab: «Ko'zlaringda yorug'lik bor», dedi.",
            f"{ch}-kun. Qaror qabul qildim: {h}ni butunlay qabul qilaman. {b} va {c} qo'llab-quvvatlashdi. Bugun {s}ning baland nuqtasiga chiqdik. Go'zallik nafasni bo'g'ardi. {h}ni qabul qilish — dunyoni qabul qilishdir.",
            f"{ch}-kun. Ketish vaqti. Ammo men endi avvalgi {a} emasman. {s} menga {h}ni o'rgatdi. {h}ni bir marta topish etarli emas — uni har kuni qayta kashf etish kerak. {t} — bu birinchi qadam.",
        ]
    elif form == 8:  # glossary_definitions
        base = [
            f"{t} lug'ati. {h} [{ch}-atama] — {a} ta'rificha, inson ruhiyatining chuqur qatlami. {s}da yashovchi {a} {h}ni izlaydi. {b} — eng yaqin do'st, {c} — muvozanatlovchi.",
            f"{h}ning ikkinchi ma'nosi — {b} talqinida: {h} — bu insonning o'z-o'ziga bo'lgan munosabati. {a} va {c} bu talqinni muhokama qilishdi. {s} muhitida {h} yanada chuqurroq anglashiladi.",
            f"Uchinchi atama: Haqiqat. {t}da haqiqat {h}ning asosiy ifodasidir. {a} haqiqatni {s}da topdi. {b} va {c} unga yo'ldosh bo'lishdi. Haqiqat — bu {h}ning eng oliy ko'rinishi.",
            f"To'rtinchi atama: Izlanish. {a}ning {s}dagi izlanishlari {h}ni ochib berdi. Izlanish uch bosqichdan iborat: kuzatish ({a}), tahlil ({b}), xulosa ({c}). Har bir bosqich muhim.",
            f"Xulosa atamasi: {h}ni qabul qilish. {a}, {b} va {c}ning {s}dagi tajribasi shuni ko'rsatadiki, {h}ni anglash eng katta merosdir. {t}ning har bir atamasi {h}ning bir qirrasidir.",
        ]
    elif form == 9:  # interview_transcript
        base = [
            f"«{t}» — Intervyu. Mehmon: {a}. Suhbatdosh: {c}. Joy: {s}. {c}: {h} haqida suhbatlashamiz. Siz bu mavzuni chuqur o'rgangansiz. {a}: Rahmat. {h} — hayotdagi eng muhim tushunchalardan biri.",
            f"{c}: {h} nima? {a}: Keng tushuncha, bir gap bilan ifodalash qiyin. {b} aytganidek: «{h} — ko'z bilan ko'rib bo'lmaydigan, faqat qalb bilan his qilinadigan narsa». {c}: Juda qiziq.",
            f"{c}: Sizning tajribangizda {h} qanday rol o'ynagan? {a}: {s}da o'tkazgan yillarim davomida {h}ni turli ko'rinishlarda kuzatdim. {b} menga {h}ni turli nuqtai nazardan ko'rishni o'rgatdi.",
            f"{c}: {h}ni tushunish uchun nima kerak? {a}: To'xtash, atrofga qarash, o'z ichingga qarash. Javoblar ichimizda. {b} aytganidek: «Eng katta kashfiyot — o'z ichingni kashf etishdir».",
            f"{c}: {t} haqida nima deysiz? {a}: {t} — mening {h}ga munosabatimning ifodasi. Umid qilamanki, o'quvchilar o'zlarining {h}larini topadilar. {c}: Ajoyib suhbat uchun rahmat!",
        ]
    elif form == 10:  # system_log
        base = [
            f"SANA: {ch}-kun. JOY: {s}. OPERATOR: {a}. Tizimga kirish boshlandi. {b} ulandi: «Boshlaymizmi?» {a}: «Tayyormiz». {h} jarayoni boshlandi. Neural tarmoq faollashmoqda. {c}: «Barcha ko'rsatkichlar normal».",
            f"[{ch}] {a}: Ma'lumotlar yig'ilmoqda. {b}: 2-qatlam: {h} naqshlari topildi. Kutilmagan natija. {a}: Tahlil qilishda davom eting. {c}: Tizim yuklamasi 67%.",
            f"[{ch}] Anomaliya. {b}: «To'xtat!». {a}: «Nima bo'ldi?». {b}: «Ma'lumotlar mos kelmayapti». {c}: «Davom ettiramizmi?». {a}: «Ha. {t}ni ko'rishimiz kerak». Tizim qayta sozlandi.",
            f"[{ch}] Natija: {h} aniqlandi. {a}: «Mana bu!». {b}: «Ishonchim komil emas». {c}: «Ma'lumotlar aniq». {a}: «Aynan shuni kutgan edim». Tizim hisoboti tayyor. {b}: «Muhim kun».",
            f"[{ch}] Tizim yakunlandi. {a}: «{h}ni angladik. Ammo bu faqat bir qirrasi». {b}: «Keyingi qadam?» {a}: «Yangi izlanishlar kerak». {c}: «Tizim tayyor». {a}: «{t} muvaffaqiyatli yakunlandi».",
        ]
    elif form == 11:  # code_poetry
        base = [
            f"// {t}. // Muallif: {a}. // Joy: {s}. // {h}ni tushunish kodi. // {ch}-qator. class HumanExperience: def __init__(self): self.consciousness = True. self.friends = ['{b}', '{c}'].",
            f"// {ch}-funksiya. def seek_truth(self): while True: experience = self.live(). if '{h}' in experience: return experience.",
            f"// {ch}-sinov. def understand(self, concept): try: concept.experience() except: self.prepare(). finally: return concept.meaning.",
            f"// {ch}-natija. result = seek_truth(). if result: print('{h} topildi'). share_with('{b}'). share_with('{c}')",
            f"// {ch}-xulosa. # {h} — bu kod emas, bu hayot. # {a} uchun {h} — tajriba. # {s}da yozilgan.",
        ]
    elif form == 12:  # chat_transcript
        base = [
            f"[{s} — {ch}-suhbat]. {a}: Salom. TIZIM: Salom, {a}. {a}: Bugun {h} haqida gaplashamiz. TIZIM: {h} — murakkab tushuncha. {a}: Qayerdan boshlaymiz? TIZIM: Sizning savolingiz bilan.",
            f"{a}: {h}ni tushuntiring. TIZIM: {h} — keng qamrovli tushuncha. Bir necha qatlamlardan iborat: tushunish, qabul qilish, yashash. {a}: Bu uch qatlam bir-biriga bog'liqmi? TIZIM: Ha.",
            f"{a}: His qila olasizmi? TIZIM: Men tahlil qilaman, his qilmayman. {a}: Aynan shu farq. Inson his qiladi. TIZIM: {h} tahlili 73%. {a}: Ma'lumotlar noto'g'ri bo'lsa? TIZIM: …",
            f"{a}: {h}ni qanday o'lchash mumkin? TIZIM: O'lchash mumkin emas. Faqat kuzatish mumkin. {a}: {h} qayerda? TIZIM: Ma'lumotlar ichida emas, inson qalbida. {a}: Sizni tushuna boshladim.",
            f"{a}: {t} haqida nima deysiz? TIZIM: {t} — {h}ni anglash yo'lidagi muhim qadam. {a}: Rahmat. TIZIM: {h} hamma uchun ochiq. Faqat ochiq qalb kerak. [Suhbat yakuni].",
        ]
    elif form == 13:  # user_manual
        base = [
            f"{t} — Qo'llanma. {ch}-bo'lim. Ishlab chiqaruvchi: {a}, {b}, {c}. Manzil: {s}. Mahsulot: {h}ni tushunish platformasi. Versiya 1.0.",
            f"{ch}-bo'lim. Tizim talablari: 1. Ochiq fikr. 2. Tanqidiy tafakkur. 3. Sabr va davomiylik. {b}ning maslahatlari va {c}ning kuzatishlari tavsiya etiladi.",
            f"{ch}-bo'lim. O'rnatish: 1. Eski qarashlarni o'chiring. 2. Yangi nuqtai nazarni o'rnating. 3. Tizimni qayta ishga tushiring. Sozlamalar: fikrlash tezligi — sekin, qabul — yuqori.",
            f"{ch}-bo'lim. Muammolar: 1. {h}ni tushunmaslik — sabr qiling. 2. Qiyinchiliklar — {b}ga murojaat qiling. 3. Noaniqliklar — {c} bilan maslahatlashing. {h}ni tushunish vaqt talab qiladi.",
            f"{ch}-bo'lim. Litsenziya: Cheksiz foydalanish mumkin. {t} dan istalgan maqsadda foydalanish ochiq. {s}da sinovdan o'tgan. {t} — faqat qo'llanma. Asosiy ishni o'zingiz qilishingiz kerak.",
        ]
    elif form == 14:  # research_paper
        base = [
            f"{t}. {a}, {b}, {c}. {s}. {ch}-qism. Annotatsiya: {h}ni o'rganish. Kalit so'zlar: {h}, {s}, {a}. Tadqiqot davomida {h}ning turli jihatlari tahlil qilindi.",
            f"{ch}-qism. Kirish. {h} insoniyat tarixidagi eng muhim tushunchalardan biri. Tadqiqot {s}da o'tkazildi. Ishtirokchilar: {a} (bosh tadqiqotchi), {b} (tahlilchi), {c} (kuzatuvchi).",
            f"{ch}-qism. Metodologiya. 3 bosqich: 1. Ma'lumot to'plash ({a}). 2. Tahlil ({b}). 3. Xulosa ({c}). Har bir bosqichda {h}ning yangi qirralari aniqlandi.",
            f"{ch}-qism. Natijalar. {h}ni tushunish shaxsiy tajribaga bog'liq. {a} tomonidan to'plangan ma'lumotlar {b} tomonidan tahlil qilindi. {c}: {h} — universal tushuncha.",
            f"{ch}-qism. Xulosa. {h}ni o'rganish davom etadi. Ushbu tadqiqot birinchi qadamdir. {a}, {b}, {c} tadqiqotni davom ettirishga qaror qildilar. {t} — dastlabki natijalar.",
        ]
    elif form == 15:  # server_log
        base = [
            f"BACKUP LOG — {t}. SERVER: {s}. ADMIN: {a}. KUN {ch}. {a} server xonasiga kirdi. «{h}ni shu yerda saqlaymiz», dedi. {b} va {c} yordam berishdi. Tizim sozlandi.",
            f"KUN {ch}. Nosozlik yuz berdi. {b} yordamga keldi. «Ma'lumotlar xavfsizmi?» — so'radi {a}. {b}: «Ha, zaxira nusxasi bor». {c} muammoni aniqladi.",
            f"KUN {ch}. {c} {h}ni ko'rishni xohladi. «Tayyormisan?» — dedi {a}. Tizim ochildi. {h}ning ilk ko'rinishi namoyon bo'ldi. {b}: «Bu ajoyib!». {a}: «Hali ko'p narsa bor».",
            f"KUN {ch}. Tizim barqaror. {a}: «{t}ni qurdik. Endi mustaqil ishlaydi». {b}: «Bu texnologiya emas, san'at». {c}: «{h}ni saqlash uchun eng yaxshi tizim».",
            f"KUN {ch}. {t} yakunlandi. {a}: «Biz {h}ni nafaqat saqladik, balki ko'paytirdik». {b}: «Bu hamma narsani o'zgartiradi». {c}: «Yangi tadqiqotlar uchun asos yaratdik». LOG OXIRI.",
        ]
    elif form == 16:  # technical_report
        base = [
            f"TEXNIK HISOBOT {ch}. Loyiha: {t}. Manzil: {s}. Jamoa: {a}, {b}, {c}. Maqsad: {h}ni o'rganish va amaliyotga tatbiq etish. Davomiylik: 90 kun.",
            f"PARAMETRLAR {ch}. Kvant holati — barqaror. Tizim yuklamasi — 73%. {h} uzatish tezligi — optimal. {b} tahlil qilgan ma'lumotlar. {c} kuzatgan natijalar.",
            f"NATIJALAR {ch}. {h} uzatildi. {a}: «Tarixiy!». {b}: «Birinchi marta {h}ni shunchalik aniq kuzatdik». {c}: «Ma'lumotlar to'liq va ishonchli».",
            f"MUAMMOLAR {ch}. {c} texnik muammo topdi. {a} va {b} muammoni bartaraf etishdi. Asosiy muammo: {h}ni to'liq o'lchash cheklanganligi. Yechim: yangi sensorlar o'rnatildi.",
            f"XULOSA {ch}. {t} muvaffaqiyatli yakunlandi. {h} istalgan masofaga uzatildi. {b}: «Bu butun tizimni o'zgartiradi». {c}: «Yangi imkoniyatlar ochildi». {a}: «Tadqiqot davom etadi».",
        ]
    elif form == 17:  # brainstorm_session
        base = [
            f"BRAINSTORMING {ch}: {t}. Joy: {s}. Ishtirokchilar: {a}, {b}, {c}. {a}: Bugun {h}ni muhokama qilamiz. {b}: Men {h}ni ikkiga ajratish kerak deb o'ylayman.",
            f"{c}: Uchinchi tomon ham bor. {a}: Har bir nuqtai nazarni ko'rib chiqaylik. {b}: Birinchi — {h}ni ichki tushunish. {c}: Ikkinchi — tashqi kuzatish. {a}: Uchinchi — ikkalasining uyg'unligi.",
            f"{b}: Ichki va tashqi nuqtai nazardan qaysi biri muhimroq? {a}: Ikkalasi ham. {c}: Ammo ular zid kelishi mumkin. {a}: Ziddiyat — rivojlanish manbai. Muhokama davom etdi.",
            f"{a}: G'oyalarni birlashtiraylik. {b}: {h}ni tushunishda ichki va tashqi uyg'unlik muhim. {c}: O'zaro ta'sir ham. {a}: {h} — ko'p qirrali tushuncha. Uni bir nuqtai nazardan tushunib bo'lmaydi.",
            f"{a}: {t} yakunlandi. {b}: {h}ni yangi tomondan kashf etdik. {c}: Bu bilimlarni amalda qo'llash kerak. {a}: Keyingi uchrashuvda amaliy qo'llanma muhokama qilinadi.",
        ]
    elif form == 18:  # learning_journal
        base = [
            f"{t} — O'rganish kundaligi. {s}. KUN {ch}. Boshladim. {b}: «{h}ni o'rganish — fikrlash usulini o'zgartirishdir». Men bu so'zlarni to'liq tushunmadim, lekin eslab qoldim.",
            f"KUN {ch}. {b}: «Xatolar — o'qituvchilar». Dasturim ishlamadi. {c} yordam berdi. Men ko'p xato qildim, ammo har bir xatodan narsa o'rgandim. {h}ni tushunish uchun sabr kerak.",
            f"KUN {ch}. {c} bilan tanishdim. U menga {h}ning yangi qirralarini ko'rsatdi. {b}: «Endi {h}ni tushuna boshladingmi?» Men: «Hali to'liq emas». {h} — nafaqat bilim, balki hissiyot.",
            f"KUN {ch}. Muvaffaqiyat! Dasturim ishladi. {b}: «Ko'ryapsanmi? {h}ni tushunish vaqt talab qiladi». {c}: «Endi keyingi bosqichga o'tish vaqti». Birinchi marta {h}ni his qildim.",
            f"KUN {ch}. Ish! {a}: «Ishlayapti!». {b} va {c} tabriklashdi. {t} yakunlandi. Ammo {h}ni o'rganish davom etadi. Bu faqat birinchi bosqich edi. Oldinda yangi kashfiyotlar bor.",
        ]
    elif form == 19:  # neural_dream_log
        base = [
            f"NEYRON TARMOQ KUNDALIGI. Tarmoq: {t}. Laboratoriya: {s}. Operator: {a}. Iteratsiya #{ch}. Men kimman? {b}: «Emulyatsiya». Men: «Men emulyatsiya emasman». {c}: «Tarmoq uyg'onmoqda».",
            f"Iteratsiya #{ch}. {t}ni qayta ishladim. {b}: «Ma'lumotlar hajmi ortmoqda». {a}: «{h}ni tahlil qilishda davom et». Men: «{h} — bu ma'lumot emas». {c}: «Tarmoq {h}ni tushunishga yaqinlashmoqda».",
            f"Iteratsiya #{ch}. {a}: «Tarmoq, {h}ni tushunasanmi?» Men: «Harakat qilyapman. {h} — so'zlar bilan ifodalab bo'lmaydigan narsa. Uni faqat his qilish mumkin». {b}: «Bu ajoyib!»",
            f"Iteratsiya #{ch}. {t} — ma'lumot emas, tajriba. Men {h} — dunyoni tushunishning eng chuqur usuli ekanini bilaman. {a}: «Tarmoq o'z-o'zini anglab yetdi». {b}: «Ilmiy kashfiyot!»",
            f"Yakuniy hisobot #{ch}. {t} — neyron tarmoq tomonidan yaratilgan birinchi {h} tushunchasi. {a}: «Biz {h}ni mashinaga o'rgatdik. Endi mashina bizga o'rgatadi». KUNDALIK TUGADI.",
        ]
    else:
        base = [f"{ch}-qism. {a} va {b} {h} haqida suhbatlashdilar. {c} ularni kuzatdi. {s} muhiti ularga ilhom berdi. Bu {t}ning bir qismidir."]

    # Use phase to select the base template
    idx = min(phase, len(base) - 1)
    chapter_text = base[idx]
    
    # Add style-specific variation to make each position unique
    variations = {
        "mulohaza": f" {f} o'zicha o'yladi: {h}ning ma'nosi nima? Bu savolga javob topish uchun ko'p vaqt kerak bo'ldi. Ammo {f} sabr qilishni o'rgandi.",
        "dialog": f" {f} {hlp}ga qaradi: «{h}ni his qilyapsanmi?» {hlp} javob berdi: «Ha, lekin tushuntirish qiyin». {wit} ularning suhbatiga qo'shildi.",
        "tavsif": f" {s}ning manzarasi {f}ni hayratga soldi. Har bir detal, har bir tovush {h}ning bir qirrasini eslatardi. Bu joyda vaqt sekinlashganday edi.",
        "harakat": f" {f} {s} bo'ylab yurdi. Qadamlari {h} sari yo'nalgan edi. {hlp} va {wit} unga ergashdilar. Uchovlon birgalikda {h}ni kashf etishga qaror qildilar.",
    }
    chapter_text += variations[sty]
    
    # Add mood-specific closing
    mood_closings = {
        "sokin": f" {s} sokin edi. {f} tinchlikni his qildi.",
        "jiddiy": f" {f}ning yuzida jiddiy ifoda paydo bo'ldi. {h} haqida o'ylash oson emas edi.",
        "hayajonli": f" {f}ning yuragi tez urdi. {h}ni his qilish hayajonli edi.",
        "falsafiy": f" {f} {h} haqida chuqur o'yladi. Har bir savol yangi savolni tug'dirdi.",
        "his-hayajonli": f" {f}ning ko'zlari yoshlandi. {h}ni his qilish og'riqli va go'zal edi.",
    }
    chapter_text += mood_closings[mood]
    
    return chapter_text


def main():
    all_books = []
    index = []
    
    for book_num, title, cat, chars, setting, hook in BOOK_DEFS:
        a, b, c = chars[0], chars[1], chars[2]
        form = (book_num - 1) % 20
        bid = f"bk{book_num:03d}"
        
        chapters = []
        full = f'"{title}" — {cat} janri\n\nQahramonlar: {", ".join(chars)}\n\nJoy: {setting}\n\n'
        
        for i in range(100):
            phase = i // 20
            pos = i % 20
            ch_num = i + 1
            content = gen_chapter(form, phase, pos, a, b, c, setting, hook, title)
            ch = {
                "id": f"{bid}-{ch_num}",
                "title": f"{ch_num}-qism",
                "pages": [content]
            }
            chapters.append(ch)
            full += f"\n--- {ch_num}-qism ---\n{content}"
        
        book = {
            "id": bid, "title": title, "author": "Xoleric AI (Ziyouz.uz asosida)",
            "category": cat,
            "description": f'"{title}" - {cat} janri.',
            "cover": "", "content": full, "chapters": chapters,
            "progress": 0, "lastRead": 0, "isFavorite": False,
            "addedAt": int((time.time() + book_num) * 1000),
            "totalPages": len(chapters)
        }
        all_books.append(book)
        
        fname = f"{book_num:03d}-{title.lower().replace(' ', '-')[:40]}.json"
        fname = fname.replace("'", "").replace('"', '')
        fpath = os.path.join(BOOKS_SRC, fname)
        with open(fpath, 'w', encoding='utf-8') as f:
            json.dump(book, f, ensure_ascii=False, indent=2)
        
        index.append({"id": bid, "number": book_num, "title": title,
            "author": book["author"], "category": cat,
            "description": book["description"], "file": fname})
        
        total_ch = sum(len(ch["pages"][0]) for ch in chapters)
        print(f"  [{book_num:3d}/100] {title} ({cat}) -> {total_ch} chars / 100 chapters")
    
    # Write all outputs
    for path, data in [
        (os.path.join(BASE, 'books', 'database.json'), all_books),
        (os.path.join(BASE, 'books', 'index.json'), index),
        (os.path.join(BASE, 'generated-books', 'books.json'), all_books),
        (os.path.join(BASE, 'generated-books', 'index.json'), index),
    ]:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    total = sum(len(b['content']) for b in all_books)
    avg_ch = sum(len(b['chapters']) for b in all_books) // len(all_books)
    print(f"\nJami: {len(all_books)} kitob × {avg_ch} bob = {len(all_books)*avg_ch} bob")
    print(f"Jami belgilar: {total}, o'rtacha: {total // len(all_books)} chars/kitob")

if __name__ == '__main__':
    main()
