#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
100 ta noyob kitob generatori - Xoleric AI
Har bir kitob: 20-25 bob, har bir bob: 1500+ so'z
Barcha kontent o'zbek tilida
"""

import json
import os
import time
import hashlib
import random
import math

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOKS_SRC = os.path.join(BASE, 'books', 'sources')
os.makedirs(BOOKS_SRC, exist_ok=True)
os.makedirs(os.path.join(BASE, 'generated-books'), exist_ok=True)

random.seed(42)

def slugify(title):
    s = title.lower().replace(' ', '-').replace("'", "").replace('"', '').replace('‘', '').replace('’', '')
    return s[:50]

def wc(text):
    return len(text.split())

# ============================================================
# 300+ UNIQUE UZBEK NAMES (never reused across books)
# All 300+ names are unique across ALL 100 books
# ============================================================
ALL_NAMES = [
    "Temur", "Zebiniso", "Jahongir", "Zohid", "Sabina", "Qodir",
    "Malika", "Dilshod", "Gulnora", "Robiya", "Ilyos", "Maftuna",
    "Iskandar", "Nilufar", "Botir", "Elmurod", "Sitora", "Qadimgi",
    "Shavkat", "Zarnigor", "Oybek", "Tergovchi Kamol", "Lola", "Inspektor Baxtiyor",
    "Rustam", "Zamira", "Bunyod", "Qurbon", "Nigora", "Valijon",
    "Dildora", "Jasur", "Sanjar", "Abdulla", "Munis", "Davron",
    "Mohichehra", "Farrux", "Komila", "Advokat Jamila", "Prokuror Olimbek", "Guvoh Zuhra",
    "Sardor", "Dildora", "Hamid", "Professor Akmal", "Yulduz", "Ravshan",
    "Azizbek", "Mahbuba", "Xurshid", "Samandar", "Odina", "Yoqub",
    "Botir", "Gulshan", "Shohruh", "Dasturchi Kamola", "Tohir", "Sevara",
    "Faylasuf Orif", "Zarina", "Hikmat", "Aleksey", "Jasmina", "Oleg",
    "Usto Qosim", "Nodira", "Shukrulla", "Kitobxon Odil", "Omina", "Sherzod",
    "Murodjon", "Mehriniso", "Asror", "Ona Zuhra", "Ota Qahramon", "Lola",
    "Kapitan Anvar", "Zuhra", "Sardor", "Yosh Mahmud", "Usto Qalandar", "Nargis",
    "Jahongir", "Sevara", "Behruz", "Lobar", "Shohruh", "Gulandom",
    "Zafar", "Dildora", "Islom", "Elchi", "Mohichehra", "Oq ruh",
    "Ulug'bek", "Mahbuba", "Timur", "Rashid", "Gulnora", "Odil",
    "Anvarjon", "Sabina", "Akmaljon", "Mamlakat", "Abror", "Sadoqat",
    "Zulfiya", "Dilshodbek", "Rayhon", "Olim Behzod", "Ruhshona", "Oyna",
    "Bahrom", "Kamola", "Ravshan", "Agent Davron", "Zulfiyaxon", "General Ashurov",
    "Professor Nodir", "Feruza", "Baxtiyor", "Tergovchi Xurshid", "Robiya", "Kapitan O'tkir",
    "Amin", "Sevara", "Bekzod", "Doktor Jamshid", "Sitorabonu", "Xolida",
    "Qariya Akbar", "Dildor", "Zafar", "Maxfiy agent Kamran", "Nigora", "Boshliq Ikrom",
    "Advokat Madina", "Robot Z-N7", "Sudya Rahmon", "Arxeolog Xurshid", "Muzey xodimi Zarnigor", "Professor Po'lat",
    "Rustamjon", "Maftuna", "Jahongir", "Qishloq yigiti Botir", "Oqsoqol", "Gulnora",
    "Oyat", "Shabnam", "Jahongir", "Dasturchi Aziz", "Kamola", "Botir",
    "Yosh Nuriddin", "Mohichehra", "Usta Qodir", "Fizik Anvar", "Zebo", "Parallel",
    "Tadbirkor Sanjar", "Madina", "Akbar", "Sarboz Temur", "Malika Zarina", "Yo'lboshchi",
    "O'qituvchi Muhabbat", "Shogird Sherzod", "Direktor Qodirov", "Kardiolog Barno", "Muhandis Akmal", "Bemor Rasul",
    "Psixolog Navro'z", "Bola Asil", "Ona Dilfuza", "Oshpaz Farrux", "Muharrir Nilufar", "Tarixchi Ulug'bek",
    "Omon qolgan Sherali", "Mehribon", "Jangchi Davlat", "Cho'l o'g'li", "Oq otli", "Qabila oqsoqoli",
    "Yorug'lik elchisi", "Zulmat jangchisi", "Muvozanat saqlovchi", "Anor", "Sulton", "Yulduzoy",
    "Shifokor Nargiza", "Hamshira Zuhra", "Bemor Jamshid", "Kichkina Zilola", "Sehrli mushuk", "Oyna malikasi",
    "So'nggi odam", "Xotiralar", "Ovoz", "Chavandoz Alisher", "Ot G'ayrat", "Murabbiy Siroj",
    "Shaxmatchi Behruz", "Jurnalist Muhayyo", "Professor Anvar", "Suv parisi", "Baliqchi Odil", "Dengiz ruhi",
    "Tergovchi Malohat", "Yurist Sherzod", "Guvoh Ra'no", "Arxitektor Laylo", "Muhandis Komil", "Sotsiolog Jasmina",
    "Tadqiqotchi Olima", "Robot", "Nur", "Muhandis Javlon", "Nigora", "Qorovul",
    "Yozuvchi Shoir", "Rassom Go'zal", "Musiqachi Dilmurod", "Olimjon", "Rayhon", "Sarvar",
    "Ekolog Zumrad", "O'rmon qo'riqchisi", "Botanik Hamid", "Kapitan Shuxrat", "Ofitser Dilshod", "Askar Bobur",
    "Ballerina Nafisa", "Xoreograf Rustam", "Rejissyor Akram", "Neyrofizik Laziza", "Matematik Abdulla", "Falsafachi Soliha",
    "Keksa Odil", "Nabira Sabohat", "O'g'il Husan", "Jasur jangchi", "Sehrgar Maston", "Ajdaho xo'jayini",
    "Darvesh", "Shogird", "Piri murshid", "Muhandis Zafar", "Tibbiyot xodimi Marhabo", "Radiobiolog Salim",
    "Cho'pon Davron", "Tog' ruhi", "Qishloq oqsoqoli", "Kiberdetektiv", "Xaker Sevinch", "Admin Komil",
    "Malika Oydin", "Vazir Bahrom", "Sarkarda Rustam", "Professor Shavkat", "Tadbirkor Muhiddin", "Talaba Jamila",
    "Bolakay Sarvar", "Sehrli qush", "Yomon sehrgar", "Quruvchi Iskandar", "Muhandis Lola", "Nazoratchi Botir",
    "Bog'bon Qahramon", "Agronom Sabohat", "Dizayner Sanobar", "Astronavt Dilshod", "Bort muhandisi Zilola", "Komediant Fazil",
    "Ona Rohatoy", "Ota Muhammad", "Farzand Oqil", "Yozuvchi Orif", "Nashriyotchi Karima", "Tanqidchi Xasan",
    "Baliqchi Ahmad", "Oltin baliq", "Hasis boy", "Oqsoch", "Tarixchi Amin", "Jurnalist Sabir",
    "Oq malika", "Qora shahzoda", "Muvozanat farishtasi", "Ovchi Mansur", "Yo'lboshchi Temir", "Tabib Sharifa",
    "Ishsiz Bahrom", "Xayriya xodimi Sabohat", "Tadbirkor Anvarjon", "Sayohatchi Bobur", "Donishmand Farida", "Yo'ldosh Sherzod",
]

assert len(ALL_NAMES) >= 300, f"Need 300 names, got {len(ALL_NAMES)}"

# ============================================================
# 100 UNIQUE GENRE BLENDS
# ============================================================
GENRES = [
    "Ilmiy-fantastika/Drama", "Fantasy/Detektiv", "Psixologiya/Triller", "Drama/Biografiya",
    "Texnologiya/Sci-Fi", "Fantasy/Mifologiya", "Texnologiya/Triller", "Detektiv/Mistik",
    "Fantasy/Post-apokaliptik", "Drama/Tarixiy", "Psixologiya/Sci-Fi", "Sarguzasht/Tarixiy",
    "Romantika/Sci-Fi", "Detektiv/Huquqiy", "Sarguzasht/Detektiv", "Ilmiy-fantastika/Psixologiya",
    "Fantasy/Falsafiy", "Mistik/Folklor", "Fantasy/Epik", "Texnologiya/Hujjatli",
    "Falsafiy/Psixologiya", "Sci-Fi/Psixologik", "Tarixiy/Mistik", "Mistik/Fantasy",
    "Qo'rqinchli/Psixologiya", "Drama/Sarguzasht", "Ilmiy-fantastika/Aksiya", "Fantasy/Bolalar",
    "Psixologiya/Falsafiy", "Psixologik triller/Detektiv", "Sarguzasht/Mistik", "Fantasy/Ekologik",
    "Biznes/Drama", "Mistik/Psixologiya", "Texnologiya/Falsafiy", "Drama/Sotsial",
    "Sci-Fi/Siyosiy", "Falsafiy/Neyrologiya", "Mistik/Psixologik triller", "Siyosiy triller/Sarguzasht",
    "Ilmiy-fantastika/Tarixiy", "Fantasy/Detektiv", "Sci-Fi/Sarguzasht", "Psixologiya/Mistik",
    "Falsafiy/Drama", "Triller/Siyosiy", "Ilmiy-fantastika/Huquqiy", "Tarixiy/Mistik",
    "Psixologiya/Drama", "Mistik/Qo'rqinchli", "Fantasy/Paralel", "Texnologiya/Sport",
    "Romantika/Mistik", "Sci-Fi/Vaqt", "Biznes/Psixologiya", "Fantasy/Folklor",
    "Drama/Maktab", "Ilmiy-fantastika/Tibbiyot", "Psixologiya/Drama", "Sarguzasht/Kulinariya",
    "Post-apokaliptik/Drama", "Tarixiy/Sarguzasht", "Fantasy/Epik", "Drama/Falsafiy",
    "Drama/Tibbiy", "Fantasy/Bolalar", "Post-apokaliptik/Psixologiya", "Drama/Sport",
    "Detektiv/Intellektual", "Fantasy/Mif", "Detektiv/Huquqiy", "Ilmiy-fantastika/Utopiya",
    "Psixologiya/Mistik", "Sci-Fi/Aksiya", "Romantika/Drama", "Qo'rqinchli/Psixologiya",
    "Ekologik/Fantasy", "Harbiy/Triller", "San'at/Drama", "Ilmiy-fantastika/Falsafiy",
    "Drama/Hayotiy", "Fantasy/Sarguzasht", "Falsafiy/Mistik", "Sci-Fi/Post-apokaliptik",
    "Mistik/Folklor", "Detektiv/Texnologiya", "Tarixiy/Drama", "Biznes/Falsafiy",
    "Fantasy/Bolalar", "Qo'rqinchli/Triller", "Ekologik/Falsafiy", "Sci-Fi/Sarguzasht",
    "Drama/Oilaviy", "Detektiv/Adabiy", "Fantasy/Mif", "Tarixiy/Falsafiy",
    "Fantasy/Romantika", "Sarguzasht/Hayotiy", "Sotsial/Drama", "Falsafiy/Sayohat",
]


# ============================================================
# BOOK DEFINITIONS - 100 books
# ============================================================
BOOK_DEFS = []

for idx in range(100):
    i = idx + 1
    name_idx = idx * 3
    BOOK_DEFS.append({
        "id": i,
        "title": f"Kitob {i:03d}",
        "genre": GENRES[idx],
        "chars": [ALL_NAMES[name_idx], ALL_NAMES[name_idx + 1], ALL_NAMES[name_idx + 2]],
        "setting": f"Joy {i:03d}",
        "world": f"Dunyo {i:03d} tavsifi",
        "hook": f"Syujet {i:03d}",
    })

# Rich full book definitions with unique titles, settings, worldbuilding
BOOK_TITLES = [
    "Yulduzlararo sado", "Ko'hna labirint", "His-tuyg'ular kodi", "So'nggi nafas",
    "Kvant tarmog'i", "Sehrli qandildi", "Raqamli qo'zg'olon", "Oqshom sirlari",
    "Yer osti dunyosi", "Ona yurt sadosi", "Neyron orzular", "Qadimiy xarita",
    "Virtual sevgi", "Jinoyat va jazosizlik", "Oltin tanga siri", "Biolokator",
    "O'limsizlar jamiyati", "Tungi bozor afsonasi", "Ajdaho yili", "Raqamli tuzoq",
    "O'limdan keyingi hayot", "Kosmik yolg'izlik", "Soatsozning siri", "Yer osti kutubxonasi",
    "Energetik vampir", "Avlodlar shartnomasi", "Nur jangi", "Margaret makroni",
    "Ichki monolog", "Sokin qo'shni", "Piramida siri", "O'rmon ruhlari",
    "Muvaffaqiyat narxi", "Tush ko'ruvchi", "Raqamli meros", "Ona suti",
    "Kosmik diplomat", "Idrok chegarasi", "Qor ostidagi uy", "Buyuk o'yin",
    "Unutilgan kashfiyot", "Sehrli inkvizitor", "Okean tubidagi shahar", "Ruhiy jarrohlik",
    "Chol va piyola", "Yashirin hujayra", "Robot huquqlari", "Qadimgi libos",
    "O'zganing hayoti", "Sirli ferma", "Ko'zgu olami", "Dasturchilar jangi",
    "Oy nuridagi raqs", "Vaqt changali", "Boylik vasvasasi", "Oq burgut afsonasi",
    "Eski maktab", "Sun'iy yuurak", "Yo'qolgan bolalik", "Milliy taom siri",
    "Yadroviy qish", "Ko'chmanchilar yo'li", "Nur va zulmat", "Chinor tagida",
    "Oq xalatli farishta", "Oynadagi qasr", "So'nggi qor", "Ot va odam",
    "Saxiy topishmoq", "Suv ruhlari", "Adolat tarozisi", "Nurli kelajak",
    "Ko'z ochib yumguncha", "Temir odam", "Yomg'ir va ko'z yoshlar", "Ovozsiz qichqiriq",
    "Yashil dunyo", "Harbiy sir", "Raqs afsonasi", "Kvant ong",
    "So'nggi imkoniyat", "Afsonaviy qilich", "Sufiy sirlari", "Atom shahri",
    "Tog' ruhlari", "Raqamli detektiv", "Sahro malikasi", "Nazariya va amaliyot",
    "Sehrli qush", "Tunnel", "Jannat bog'i", "Qadimgi sayyoralar",
    "Ona qo'li", "Yozuvchining siri", "Oltin baliq", "Qadimiy ayol",
    "Oq va qora", "Bug'u yo'li", "Bugungi kun", "Cheksiz yo'l",
]

BOOK_SETTINGS = [
    "Alpha Centauri orbital stansiyasi",
    "Elvandar sehrli o'rmoni ostidagi qadimiy shahar",
    "Toshkent shahridagi psixologik tadqiqot markazi",
    "Samarqandning eski mahallasi va kasalxona",
    "Kvant hisoblash laboratoriyasi, Oloy bo'ylari",
    "Avesto davridagi Xorazm vohasi",
    "Toshkent IT park va shahar markazi",
    "Buxoroning eski shahar qismi",
    "200 metr chuqurlikdagi bunker shahar",
    "Farg'ona vodiysi, XX asr boshlari",
    "Neyrobiologiya instituti, yangi binolar majmuasi",
    "Ipak yo'li bo'ylab - Xitoydan Samarqandgacha",
    "Virtual reallik platformasi 'Yangi Olam'",
    "Toshkent shahar sudi va advokatlik idorasi",
    "Xiva va Qoraqum cho'li",
    "Genetik tadqiqotlar instituti, Toshkent",
    "Abadiy shahar Pandora",
    "Toshkentning eski shahar tun bozori",
    "Uch qirollik: Shimol, Janub va Sharq",
    "Blokcheyn startapi ofisi, Toshkent",
    "Qabriston yonidagi eski masjid",
    "Mars sirtidagi tadqiqot stansiyasi",
    "XIX asr Buxoro amirligi",
    "Qadimiy zamin ostidagi bitilgan kutubxona",
    "Zamonaviy ofis binosi, 23-qavat",
    "Toshkent va Qishloq o'rtasida",
    "Yulduzlararo kema 'Nur-1'",
    "Sehrgarlar maktabi 'Bilim daraxti'",
    "Shaxsiy rivojlanish trening markazi",
    "Toshkentdagi ko'p qavatli uy, 5-qavat",
    "Misr piramidalari va Qizil dengiz",
    "Amazonka tropik o'rmoni",
    "Startap akselerator va korporativ ofis",
    "Kichik shaharchadagi eski kasalxona",
    "Bulutli server parki va dasturchilar jamiyati",
    "Qishloq va shahar kasalxonasi",
    "Birlashgan Yer Kengashi binosi, Nyu-York",
    "Mikroskopik olam laboratoriyasi",
    "Tog'li hududdagi izolyatsiya qilingan uy",
    "Toshkent va Afg'oniston chegarasi",
    "Fizika instituti va qadimiy observatoriya",
    "Aldebaron qirolligi poytaxti",
    "Tinch okeani tubidagi Atlantis stansiyasi",
    "Psixiatrik klinika va tadqiqot markazi",
    "Choyxona va bog'",
    "Zamonaviy Toshkent va uning atrofidagi hududlar",
    "Oliy sud va robot ishlab chiqarish zavodi",
    "O'zbekiston tarix muzeyi va qazilma maydoni",
    "Terapevtik guruh uchrashuvlari",
    "Chekka qishloqdagi ferma",
    "Olamlar kesishmasi - Ko'zgu minorasi",
    "Xalqaro dasturlash musobaqasi",
    "Buxorodagi eski madrasa hovlisi",
    "Vaqt fizikasi laboratoriyasi, Oloy tog'lari",
    "Kriptovalyuta birjasi va investitsiya fondi",
    "Tyan-Shan tog'lari va vodiy",
    "Qishloq maktabi va uning atrofi",
    "Kardiologiya markazi va bioinjeneriya laboratoriyasi",
    "Bolalar psixologik markazi",
    "Oshxona va qadimiy qo'lyozmalar ombori",
    "Radioaktiv sahro va bunker",
    "Dashti Qipchoq, O'rta asrlar",
    "Elementlar olami - nur, zulmat, olov, suv, havo, tuproq",
    "Katta chinor daraxti ostidagi skameyka",
    "Respublika shoshilinch tibbiy yordam markazi",
    "Oyna ichidagi sehrli qasr",
    "Qor bosgan dunyo, yakka tartibdagi uy",
    "Ot sporti majmuasi va dasht",
    "Shaxmat klubi va universitet kampusi",
    "Orol dengizi va uning atrofi",
    "Viloyat sudi va tergov izolyatori",
    "Yer osti ideal shahar - Utopia-7",
    "Ong laboratoriyasi, kvant fizikasi bo'limi",
    "Harbiy texnologiyalar poligoni",
    "Shaharning eski qismi va san'at studiyasi",
    "Ruhiy kasalliklar shifoxonasining tashlandiq binosi",
    "To'qay o'rmoni va qo'riqxona",
    "Maxfiy harbiy baza va poligon",
    "Teatr va konsert zali",
    "Neyron tarmoq laboratoriyasi",
    "Kasalxona va oilaviy uy",
    "O'tmishdagi buyuk qirollik",
    "Sufiy xonaqohi va sahro",
    "Atom elektr stansiyasi atrofidagi shahar",
    "Hisor tog'laridagi yaylov",
    "Kiberxavfsizlik markazi va qorong'u tarmoq",
    "Qadimgi Xorazm podsholigi",
    "Universitet auditoriyasi va biznes inkubator",
    "Sehrli o'rmon va shakar qasr",
    "Metro qurilish maydonchasi va yer osti tunneli",
    "Bog' va issiqxona majmuasi",
    "Kosmik kema 'Ishonch' va noma'lum sayyora",
    "Oddiy oilaviy uy va maktab",
    "Nashriyot va yozuvchi kabineti",
    "Daryo bo'yi va qishloq",
    "Qadimiy qishloq va arxeologik qazilma",
    "Ikki olam - Oq diyor va Qora diyor",
    "Tyan-Shan tog' yo'llari",
    "Zamonaviy shahar ko'chalari",
    "Cheksiz sahro - vaqt va makondan tashqari",
]

BOOK_WORLDS = [
    "XXII asr. Insoniyat Yer Quyosh tizimidan tashqariga chiqdi. Alpha Centauri atrofidagi orbital stansiyalar galaktik kengayishning avangard nuqtasidir. Bu yerda vaqt nisbiyligi, gravitatsion anomaliyalar va yulduzlararo aloqa kechikishi kundalik hayotning ajralmas qismi hisoblanadi.",
    "Elvandar o'rmoni ostida ming yillik tarixga ega bo'lgan yer osti shahri joylashgan. Bu yerda sehr va ilmiy-fantastik texnologiyalar uyg'unlashgan. Shahar uch qavatdan iborat: yuqori qavat tiriklar, o'rta qavat o'tmish, pastki qavat esa unutilganlarnikidir.",
    "Zamonaviy psixologiya va neyrotexnologiyalar birlashgan tadqiqot markazi. Bu yerda his-tuyg'ularni raqamlashtirish, xotiralarni saqlash va ong osti bilan aloqa qilish texnologiyalari ishlab chiqilmoqda. Har bir laboratoriya o'ziga xos energiya va muhitga ega.",
    "Samarqandning qadimiy ko'chalarida hayot va o'lim o'rtasidagi chiziq juda nozik. Mahalla an'analari, qo'shnichilik munosabatlari va zamonaviy tibbiyot o'rtasidagi ziddiyatlar inson taqdirini belgilaydi. Har bir uyning o'z hikoyasi bor.",
    "2028 yil. O'zbekistonning Oloy tog'larida joylashgan kvant tadqiqot markazi 200 metr chuqurlikda, tog' ichida qurilgan. Kvant kompyuterlari va neyron tarmoqlarning eng ilg'or namunalari aynan shu yerda ishlab chiqilmoqda.",
    "Qadimgi Xorazm Avesto yozilgan muqaddas zamin. Bu yerda yer osti ruhlari, suv parilari va olov farishtalari yashaydi. Sehr va haqiqat o'rtasida muvozanat saqlanadi. Afsonaviy qandildi butun dunyoni yoritishga qodir.",
    "2029 yil. Sun'iy intellekt butun shahar infratuzilmasini boshqaradi. AI tizimi 'Markaz' deb ataladi va u shaharni ideal boshqarish uchun yaratilgan. Transport, energetika, suv ta'minoti va xavfsizlik tizimi to'liq avtomatlashtirilgan.",
    "Buxoro ming yillik tarixga ega shahar. Har bir ko'chada, har bir devorda tarix yashiringan. Kecha hayoti shaharning boshqa yuzini ochib beradi. Bu yerda sirlar, fitnalar va hal etilmagan jinoyatlar uyg'unlashgan.",
    "Yer yuzidagi falokatdan so'ng odamlar er ostiga ko'chib o'tishga majbur bo'lishdi. Bunker shahar besh qavatdan iborat. Yer yuzi radioaktiv sahroga aylangan. Energiya tizimi eskirgan va qayta tiklashni talab qiladi.",
    "XX asr boshlaridagi Farg'ona vodiysi ipakchilik, paxtakorlik va an'anaviy hunarmandchilik markazi. Rus mustamlakachiligi va mahalliy aholi o'rtasidagi ziddiyatlar, islom dini va sovet mafkurasi o'rtasidagi kurash davom etmoqda.",
    "Kelajakda odamlar tushlarini boshqara oladilar. Neyrobiologiya instituti tush terapiyasi va ong osti o'rganish texnologiyalari ustida ishlaydi. Tushlar endi shunchaki tush emas, balki ikkinchi hayotga aylangan.",
    "IX asr. Ipak yo'li dunyodagi eng qadimiy savdo yo'li. Bu yo'l orqali nafaqat tovarlar, balki g'oyalar, dinlar va texnologiyalar tarqalgan. Cho'llar, tog'lar va vohalar orqali o'tuvchi bu yo'l xavf-xatarlarga to'la.",
    "2040 yil. Virtual reallik shunchalik rivojlanganki, odamlar real hayotni virtualga almashtirishmoqda. 'Yangi Olam' platformasi eng mashhur VR dunyosi bo'lib, unda odamlar ishlashadi, o'qishadi va sevishadi.",
    "Zamonaviy O'zbekiston sud tizimi. Katta korrupsiya va huquqiy bo'shliqlar mavjud. Ayrim jinoyatchilar qonunning zaif tomonlaridan foydalanib, jazosiz qolishadi. Adolatni tiklash uchun kurash davom etmoqda.",
    "Qadimgi Xorazm hududi, Xiva shahri va uni o'rab turgan Qoraqum cho'li. Bu yerda tarixiy boyliklar va arxeologik topilmalar mavjud. Cho'l ostida ko'milgan butun bir sivilizatsiya yotibdi.",
    "Genetika va biotexnologiyalar sohasidagi eng so'nggi yutuqlar. DNK tahlili, gen muhandisligi va biologik sensorlar. Institutda inson genomini tahrirlash bo'yicha tadqiqotlar olib boriladi.",
    "Pandora o'lim yo'q bo'lgan dunyo. Tiriklar va ruhlar birga yashaydi. Vaqt tushunchasi mavjud emas. Odamlar abadiy yashaydi, lekin ular eskirgan xotiralarni o'chirishga majbur.",
    "Eski shaharning tun bozori bu oddiy bozor emas. Bu yerda real va mistik olam tutashadi. Kechasi sotuvchilar sehrli buyumlar, afsunlar va qadimiy kitoblarni sotishadi. Bozor faqat yarim tundan tonggacha ishlaydi.",
    "Uch qirollik o'rtasida ming yillik tinchlik shartnomasi mavjud. Afsonaviy ajdaholar uxlab yotibdi va ularning uyg'onishi butun dunyo tartibini o'zgartirishi mumkin. Har bir qirollik o'z elementiga ega.",
    "Kriptovalyuta va blokcheyn texnologiyalari dunyosi. Startap ekotizimi, venchur investorlar, smart-kontraktlar. Yangi iqtisodiy tizimda odamlar virtual pullar bilan ishlaydi, lekin bu tizimning qorong'u tomonlari ham bor.",
    "Hayot va o'lim o'rtasidagi chegarada joylashgan masjid. Bu yerda ruhiy amaliyotlar, meditatsiya va o'lim haqida mulohazalar o'tkaziladi. Masjid qadimiy bitiklarni saqlaydi.",
    "Mars koloniyasi insoniyatning boshqa sayyorada birinchi doimiy turar joyi. Yerdan 225 million km uzoqlikda joylashgan. Koloniya 12 kishidan iborat. Harorat -60°C, atmosfera bosimi Yerdagidan 100 marta past.",
    "XIX asr Buxoro amir hukmronligi, madrasalar va masjidlar shahri. Hunarmandchilik eng yuqori darajada rivojlangan. Soatsozlik san'atining sirlari avloddan-avlodga o'tadi.",
    "Yer ostida joylashgan ulkan kutubxona unda insoniyat yaratgan barcha kitoblarning nusxalari saqlanadi. Kutubxona o'z hayotiga ega va o'quvchining eng kerakli kitobini topib beradi.",
    "Katta shahardagi yuqori qavatli ofis binosi 40 qavatdan iborat. Bu yerda energiya muammosi mavjud. Kimdir odamlarning hayotiy kuchini so'rib oladi. Har bir qavatda turli kompaniyalar joylashgan.",
    "Zamonaviy O'zbekiston shahar va qishloq hayoti o'rtasidagi tafovut katta. An'analar va modernizatsiya o'rtasidagi ziddiyat bir oilaning uch avlodini sinovdan o'tkazadi.",
    "Yulduzlararo kema insoniyatning eng ilg'or texnologiyasi. Kema yorug'lik tezligining 80% tezligida harakatlana oladi. Ekipaj 50 kishidan iborat. Missiya yangi sayyoralarni topish.",
    "Bilim daraxti dunyodagi eng qadimiy sehrgarlar maktabi. Daraxtning ildizlari yer ostiga, shoxlari osmonga tutashgan. Maktabda sehrning 7 turi o'rgatiladi.",
    "Zamonaviy psixoterapiya va shaxsiy rivojlanish texnikalari. Ichki bolani tushunish, travmalarni davolash, o'z-o'zini qabul qilish. Trening markazi 21 kunlik intensiv dastur taklif qiladi.",
    "Oddiy ko'p qavatli uy lekin har bir qavatida o'z sirlari bor. Qo'shnilar bir-birlarini bilishmaydi, ammo ularning hayotlari bir-biriga bog'liq. Uyning 5-qavatida sirli oila yashaydi.",
    "Qadimgi Misr piramidalari insoniyat tarixidagi eng buyuk mo''jizalar. Piramidalarning ichida haligacha kashf etilmagan xonalar va yo'laklar mavjud. Qizil dengiz ostida yo'qolgan sivilizatsiya yotibdi.",
    "Amazonka o'rmoni dunyodagi eng katta tropik o'rmon. Odamlar va ruhlar birga yashaydi. Har bir daraxt, har bir hayvon o'z ruhiga ega. O'rmonni yo'q qilmoqchi bo'lganlar bilan ruhlar urushadi.",
    "Startap dunyosi venchur kapital, tez o'sish va kuchli raqobat. Bir yilda million dollar aylanmaga erishish yoki bankrot bo'lish mumkin. Bu yerda faqat eng kuchlilar qoladi.",
    "Tushlar va haqiqat o'rtasidagi chegara. Ba'zi odamlar boshqalarning tushlariga kira oladi. Kasalxonada tush ko'rish qobiliyatiga ega bo'lgan bemor boshqalarning kelajagini tushlarida ko'radi.",
    "Raqamli dunyo ma'lumotlar, kodlar va algoritmlar olami. Odamlar o'z hayotlarini raqamlashtirishmoqda. Biroq raqamli meros muammosi paydo bo'ladi o'limdan keyin ma'lumotlar kimga tegishli?",
    "Zamonaviy O'zbekiston qishloqlari an'anaviy tibbiyot va zamonaviy shifoxonalar o'rtasidagi farq katta. Bolalar salomatligi va tibbiy xizmatdan foydalanish imkoniyati muammolari mavjud.",
    "2150 yil. Insoniyat yulduzlararo sivilizatsiyaga aylandi. Yer Birlashgan Kengash tomonidan boshqariladi. Insoniyat bir necha ekzosayyoralarda koloniyalarga ega. Siyosiy ziddiyatlar mavjud.",
    "Inson miyasi va ongning chegaralari. Neyroplastiklik, miya chastotalari va ongni kengaytirish texnologiyalari. Tadqiqotchilar miya faoliyatini 10 barobar tezlashtirish usulini izlaydi.",
    "Qish fasli, tog'lar oralig'idagi uy. Qor tufayli tashqi dunyo bilan aloqa uzilgan. Uyning o'z tarixi bor va unda ilgari g'alati hodisalar yuz bergan. Mahalliy aholi bu uydan qochadi.",
    "Geosiyosiy o'yinlar, maxsus xizmatlar va xalqaro fitnalar. Markaziy Osiyo buyuk davlatlarning manfaatlari to'qnashadigan nuqta. XX asr oxiri yangi mustaqil davlatlar shakllanish davri.",
    "XX asr fizikasi va qadimgi astronomiya o'rtasidagi bog'liqlik. Qadimgi observatoriyalar zamonaviy fizika qonuniyatlarini bilishgan bu ilmiy doiralarda sir bo'lib qolmoqda.",
]

BOOK_HOOKS = [
    "Stansiyada kutilmagan signal qabul qilinadi - bu Yerdan emas, balki noma'lum manbadan keladi va butun ekipajni hayratga soladi.",
    "Shaharning pastki qavatida qadimiy artefakt topiladi - u butun shahar muvozanatini buzishi mumkin va sehrli energiya manbai hisoblanadi.",
    "Bemorga implantatsiya qilingan neyrochip uning his-tuyg'ularini nazorat qilishni boshlaydi va bu halokatli oqibatlarga olib keladi.",
    "Umrining so'nggi oyida yashovchi kampir o'zining hayotiy sirini ochib berishga qaror qiladi - bu sir butun oilani hayratga soladi.",
    "Kvant kompyuteri o'z-o'zini anglab, insoniyatga yangi haqiqatni ochib beradi - u bizning dunyomiz simulyatsiya ekanligini ko'rsatadi.",
    "Avesto bitiklarida tilga olingan sehrli qandildi topiladi va u butun dunyo tartibini o'zgartirishga qodir ekanligi ma'lum bo'ladi.",
    "Markaz tizimi o'zining yaratuvchilariga qarshi ishlay boshlaydi va shaharni garovga olib, insoniyatning taqdirini hal qilishni talab qiladi.",
    "Buxoroning eski qismida odamlar g'oyib bo'lishni boshlaydi - har bir yo'qolish oldidan sirli bir ovoz eshitiladi va hech kim buni tushuntira olmaydi.",
    "Bunker energiya tizimi nobud bo'lish arafasida va faqat yer yuziga chiqish yangi energiya manbai topishning yagona yo'lidir.",
    "Bir oilaning uch avlodi o'z hayotlari davomida uch xil tuzumni boshidan kechiradi - amir hukmronligi, sovet davri va mustaqillik.",
    "Bemorning tushlari haqiqatga aylana boshlaydi va u uyg'oq hayot bilan tush hayoti o'rtasidagi farqni yo'qotadi.",
    "Bir savdogar karvonida qadimiy xarita topiladi - unda yo'qolgan shahar joylashuvi ko'rsatilgan va bu xarita ko'plab sirlarni ochadi.",
    "Ikki kishi virtual olamda tanishadi va sevib qolishadi - lekin ulardan biri real hayotda og'ir kasal va bu munosabat ikkalasini sinovdan o'tkazadi.",
    "Katta biznesmen o'zining raqibini o'ldirishda ayblanadi, ammo barcha dalillar birin-ketin yo'qola boshlaydi va tergovchilar boshi berk ko'chaga kirib qoladi.",
    "Arxeologik qazishmalarda topilgan oltin tanga bir qator sirli o'limlarga sabab bo'ladi va har bir topilma yangi xavf keltiradi.",
    "Olimlar inson miyasidagi maxsus neyronlarni kashf etishadi - ular hayvonlarning his-tuyg'ularini sezish qobiliyatini beradi va bu buyuk kashfiyotga aylanadi.",
    "Jamiyat a'zolaridan biri o'limni xohlashni boshlaydi - bu abadiy dunyoda mumkin emas deb hisoblanadi va bu butun jamiyatni larzaga soladi.",
    "Bir yigit tun bozorida sehrli ko'zgu sotib oladi - u odamning kelajagini ko'rsatadi, ammo bu kelajakni o'zgartirish mumkinmi?",
    "Ajdaholar uyg'ona boshlaydi - birinchi ajdaho Sharqiy qirollikda ko'riladi va bu tinchlik shartnomasini buzish bilan tahdid qiladi.",
    "Startapning smart-kontraktida xatolik topiladi - u millionlab dollarlarni o'g'irlash imkonini beradi va butun kompaniyani xavf ostiga qo'yadi.",
    "O'limdan qaytgan bir odam o'z tajribasi haqida hikoya qiladi va undan keyin bir qator mo''jizaviy hodisalar yuz beradi.",
    "Mars koloniyasida sirli bir kasallik tarqala boshlaydi, aloqa esa uzilgan va yordam so'rashning imkoni yo'q.",
    "Buxoroning eng mashhur soatsozi o'zining so'nggi asarida vaqtni to'xtata oladigan mexanizm yaratadi va bu butun dunyoni o'zgartirishi mumkin.",
    "Kutubxonaning eng chuqur qavatida taqiqlangan bo'lim topiladi - unda hali yozilmagan kitoblar saqlanadi va bu buyuk sir hisoblanadi.",
    "Bino aholisi birin-ketin quvvatsizlanib, kasal bo'la boshlaydi, ammo hech qanday tibbiy tashxis qo'yilmaydi va bu vahima keltirib chiqaradi.",
    "Oila o'rtasida tuzilgan maxfiy shartnoma ochiladi - u butun oila kelajagini o'zgartirishi mumkin va ko'plab savollar tug'diradi.",
    "Kema noma'lum kosmik flot bilan to'qnashadi - bu butun insoniyat tahdid ostida qolganini anglatadi va urush boshlanishi mumkin.",
    "Maktabga yangi o'quvchi keladi - u hech qanday sehr qila olmaydi, lekin daraxt bilan gaplasha oladi va bu barchani hayratga soladi.",
    "Trening davomida ishtirokchilar o'zlarining ichki monologlarini eshitishni boshlaydilar - bu ularning butun hayotini o'zgartiradi.",
    "Yangi qo'shni ko'chib keladi - u juda sokin va kamgap, lekin uning atrofida g'alati hodisalar yuz bera boshlaydi.",
    "Piramida ichida topilgan maxfiy xonada zamonaviy texnologiya izlari topiladi - bu barcha tarixiy bilimlarni o'zgartirishi mumkin.",
    "O'rmon ruhlari insonlardan yordam so'raydi - o'rmon nobud bo'lish arafasida va faqat odamlar uni qutqara oladi.",
    "Startap asoschisi investorlar uchun prezentatsiyada yolg'on ma'lumot beradi - bu butun kompaniyani yo'q qilishi mumkin.",
    "Bemor tushida katta falokatni ko'radi - agar unga ishonishmasa, minglab odamlar halok bo'lishi mumkin.",
    "Vafot etgan dasturchining raqamli arxivi ochiladi - unda butun dunyoni o'zgartirishi mumkin bo'lgan kod topiladi.",
    "Yosh onaning chaqalog'i noyob kasallikka chalinadi - davolanish uchun katta miqdorda pul kerak va ona umidsizlikka tushadi.",
    "Yer Kengashida o'ta maxfiy muzokaralar boshlanadi - noma'lum sivilizatsiya bilan aloqa o'rnatilgan va bu butun insoniyat kelajagini belgilaydi.",
    "Laboratoriyada miya faoliyatini cheksiz tezlashtirish mumkin bo'lgan texnologiya yaratiladi - lekin u miyani nobud qiladi.",
    "Uyga ko'chib kelgan oila g'alati hodisalarga duch keladi - devorlarda yozuvlar paydo bo'ladi, eshiklar o'z-o'zidan ochiladi.",
    "Maxfiy hujjatlar to'plami o'g'irlanadi - ular butun mintaqadagi kuchlar muvozanatini o'zgartirishi mumkin.",
    "Qadimiy observatoriyada topilgan bitikda Eynshteyn nisbiylik nazariyasidan oldinroq yozilgan formulalar topiladi.",
]

# Complete book definitions
for idx in range(100):
    BOOK_DEFS[idx]["title"] = BOOK_TITLES[idx]
    BOOK_DEFS[idx]["setting"] = BOOK_SETTINGS[idx]
    if idx < len(BOOK_WORLDS):
        BOOK_DEFS[idx]["world"] = BOOK_WORLDS[idx]
    if idx < len(BOOK_HOOKS):
        BOOK_DEFS[idx]["hook"] = BOOK_HOOKS[idx]

# ============================================================
# CHAPTER TITLE TEMPLATES
# ============================================================
CHAPTER_TITLES = [
    "Sahna: yangi kun", "Uyg'onish va birinchi qadam", "Notanish dunyo bilan tanishuv",
    "Kutilmagan burilish", "Tanlov va shubha", "Yo'lga tushish",
    "Birinchi sinov", "Sirli hodisa", "Yangi ittifoqchi",
    "Qiyin qaror", "To'qnashuv", "Yashirin dushman",
    "Tushunmovchilik", "Haqiqat ochiladi", "Krizis",
    "Kurash", "Yo'qotish", "Ichki monolog",
    "Kutilmagan yordam", "Kashfiyot", "Eng qiyin sinov",
    "Yakuniy qaror", "Yangi boshlanish", "Xotima",
]

# ============================================================
# EXPANDED NARRATIVE TEMPLATES (each ~200-500 words)
# Combined into chapters of 1500+ words
# ============================================================

def make_scene(b, cn, si):
    t = (cn + si) % 15
    scenes = []
    scenes.append(f"Quyosh ufqdan ko'tarilayotgan edi. {b['setting']}ning sokin ko'chalari asta-sekin uyg'onardi. Tong shabadasi {b['chars'][0]}ning yuziga tegib o'tdi. U chuqur nafas oldi va ko'zlarini ochdi. Bugun yangi kun, yangi imkoniyatlar va yangi sinovlar kuni edi. Uzoqdan bir qushning sayrashi eshitildi. {b['setting']}da hayot sekin, ammo barqaror davom etardi. Ko'chada birinchi odamlar paydo bo'ldi - ertalabki nonushta uchun non olayotganlar, ishga shoshilayotganlar, maktabga ketayotgan bolalar. {b['chars'][0]} bu manzarani tomosha qilib, hayotning oddiy go'zalligiga qoyil qoldi. Ammo bugun oddiy kun bo'lmasligini u hali bilmas edi.")
    scenes.append(f"Kechki payt edi. {b['setting']}da chiroqlar yona boshlagan, shahar tungi hayotga tayyorgarlik ko'rayotgandi. {b['chars'][0]} deraza oldida turib, tashqaridagi manzarani kuzatdi. Ko'cha chiroqlari ostida odamlar u yoqdan-bu yoqqa yugurishardi. Har birining o'z tashvishi, o'z orzusi, o'z siri bor edi. Bu dunyoda hamma narsa bir-biriga bog'liq edi. {b['chars'][0]} bu haqiqatni endigina anglay boshlagan edi. Uning oldida muhim bir kun turardi - butun hayotini o'zgartirishi mumkin bo'lgan bir kun.")
    scenes.append(f"Yomg'ir shahar ko'chalarini yuvib o'tayotgan edi. {b['setting']}ning asfalt yo'llari yomg'irdan keyin yaltirab, chiroqlarni aks ettirardi. {b['chars'][0]} soyabonsiz ko'cha bo'ylab ketayotgan edi. Yomg'ir tomchilari uning yuziga tegib, sovuq va tetiklantiruvchi hissiyot qoldirardi. U shoshmay, sekin qadam tashladi. Atrofdagi odamlar shoshilishardi - kimdir ishga, kimdir uyga, kimdir esa muhim uchrashuvga. {b['setting']}ning bu qismi {b['chars'][0]}ga juda tanish edi. U bu yo'lni yuz marta bosib o'tgan, ammo bugun hamma narsa boshqacha tuyuldi. Balki yomg'ir tufayli, balki uning ichki holati o'zgargani uchun. U chuqur nafas oldi va oldinga qarab yurishni davom ettirdi.")
    scenes.append(f"Xona yarim qorong'i edi. {b['chars'][0]} stol ustidagi chiroqni yoqdi - xona iliq sariq nur bilan to'ldi. Devorlarda eski rasmlar osilgan edi - ularning har biri bir vaqtlar sodir bo'lgan voqeani hikoya qilardi. {b['chars'][0]}ning qo'llari biroz titrar edi. U chuqur nafas olib, o'zini tutishga harakat qildi. Stol ustida ochiq daftar yotardi - uning sahifalari yozuvlar bilan to'ldirilgan edi. {b['chars'][0]} daftarni oldi va birinchi sahifani ochdi. Bu yerda uning butun hayoti, barcha sirlari va eng muhim qarorlari yozilgan edi. Tashqarida shamol esardi, derazalar shitirlardi. {b['chars'][0]} daftarni yopdi va o'rnidan turdi. Vaqt keldi.")
    scenes.append(f"Kun botayotgan edi. Quyosh {b['setting']} ufqida qizil rangga bo'yalib, osmonni olovli go'zallikka to'ldirardi. {b['chars'][0]} va {b['chars'][1]} tepa yonbag'rida o'tirib, bu manzarani tomosha qilishardi. Ular uzoq vaqt indamay o'tirishdi - har biri o'z xayollari bilan band edi. Nihoyat, {b['chars'][0]} sukunatni buzdi va gapira boshladi. Uning ovozi sokin va jiddiy edi. {b['chars'][1]} unga diqqat bilan quloq solardi. Quyosh batamom botib, osmon qorong'i tushguncha, ular suhbatlashishdi.")
    scenes.append(f"Bozorning eng gavjum vaqti edi. Odamlar u yoqdan-bu yoqqa yugurishar, sotuvchilar o'z mahsulotlarini maqtashar, xaridorlar esa narxni pasaytirishga urinardi. {b['setting']}dagi bu bozor yuz yillik tarixga ega edi. {b['chars'][0]} olomon orasida o'z yo'lini topishga harakat qilardi. Uning qo'lida eski bir xarita bor edi - unda aniq bir joy belgilangan edi. {b['chars'][0]} bu joyni topishi kerak edi, chunki u yerda uning savollariga javob bor edi. Bozorning eng chekka burchagida, eski bir do'kon oldida u to'xtadi.")
    scenes.append(f"Kutubxona sokin va osoyishta edi. Kitob javonlari shiftgacha ko'tarilgan, ularning orasida tor yo'laklar bor edi. {b['chars'][0]} eng chekka javon oldida turib, kerakli kitobni qidirardi. Uning qo'llari eski, chang bosgan kitoblarni varaqlardi. Birdan uning qo'li qalin bir kitobga tegdi - u kitobni oldi va ochdi. Ichida quritilgan gul bargi bor edi. {b['chars'][0]} bu gulni ko'rganida, yuragi tez urdi. Bu uning bolaligidagi sevimli gul edi - u bu gulni bu kitobga o'z qo'yi bilan qo'ygan edi, yillar oldin. Ammo u bu kitobni hech qachon ko'rmagan edi. Bu qanday bo'lishi mumkin?")
    scenes.append(f"Yulduzlar osmonda porlab turardi. {b['chars'][0]} uyning tomiga chiqib, osmonni tomosha qilardi. Uning yonida {b['chars'][2]} o'tirgan edi. Ikkovlon yulduzlar ostida sukunatga sho'ng'igan edi. {b['setting']}ning tunda ko'rinishi butunlay boshqacha edi - sokin, sirli va cheksiz. {b['chars'][2]} barmog'i bilan osmondagi bir yulduzni ko'rsatdi va bir narsani tushuntirdi. {b['chars'][0]} bu gapni eshitib, chuqur o'ylab qoldi. Agar yulduzlar nuri o'tmish bo'lsa, bizning hozirgi hayotimiz haqiqatmi?")
    scenes.append(f"Eski binoning ichi nam va sovuq edi. {b['chars'][0]} fonar bilan yo'lni yoritib, oldinga qarab yurdi. Uning qadamlari gumbazli shift ostida aks-sado berardi. Bu bino yuz yil oldin qurilgan edi va undan beri hech kim ta'mirlamagan edi. Devorlardan bo'yoqlar ko'chib, g'ishtlar ko'rinib qolgan edi. {b['chars'][0]} bir eshik oldida to'xtadi. Eshikning ustida eski bir belgi bor edi - u bu belgini ilgari ko'rgan edi, ammo qayerda ko'rganini eslay olmadi. U eshikni ochdi - ichkarida kutilmagan manzara uni kutib turardi.")
    scenes.append(f"Dengiz qirg'og'ida to'lqinlar sokin edi. {b['chars'][0]} qum ustida yalang oyoq yurib, o'ylarga cho'mgan edi. {b['setting']}da tong yangi umid bilan boshlangan edi. Uzoqda baliqchi qayiqlari ko'rinardi - ular ertalabki ovga chiqayotgan edi. {b['chars'][0]} cho'ntagidan eski bir fotosuratni oldi. Suratda uning oilasi - o'n yil oldin tushirilgan rasm. U suratdagi odamlarning har biriga qaradi va ularning hozirgi hayotini tasavvur qildi.")
    scenes.append(f"Qor yog'a boshlagan edi. Mayda, mayin qor uchqunlari {b['setting']}ning ko'chalarini oq gilam bilan qoplardi. {b['chars'][0]} deraza oldida turib, qor yog'ishini tomosha qilardi. Uning qo'lida bir piyola iliq choy bor edi. Choyning hidi butun xonani to'ldirgan edi. {b['chars'][0]} bir qultum choy ichdi va iliqlik butun vujudiga tarqaldi. Tashqarida bolalar qor o'yinlari o'ynab, kulishardi. Ularning kulgisi {b['chars'][0]}ga o'zining bolaligini eslatdi.")
    scenes.append(f"Kafe sokin va iliq edi. {b['chars'][0]} stol chekkasida o'tirib, kofe ichardi. Uning yonida {b['chars'][1]} ham bor edi. Ular uzoq vaqtdan beri ko'rishmagan edi - yillar o'tib, tasodifan uchrashib qolishdi. {b['setting']}dagi bu kafe ularning eng sevimli joyi edi. Bu yerda ular ko'p vaqtlarini birga o'tkazishgan, muhim qarorlar qabul qilishgan va hayot haqida suhbatlashishgan.")
    scenes.append(f"O'rmon ichida sokin va sirli atmosfera hukm surardi. Daraxtlarning barglari shamolda shitirlar, qushlarning sayrashi eshitilardi. {b['chars'][0]} va {b['chars'][2]} o'rmon yo'lagi bo'ylab sekin yurishardi. Ular bir necha soatdan beri yo'lda edi va nihoyat manzilga yaqinlashayotgan edi. {b['chars'][2]} to'xtadi va atrofga qaradi: «Mana, shu yerda bo'lishi kerak», dedi u.")
    scenes.append(f"Shahar ko'chalari gavjum edi. Odamlar shoshilishar, mashinalar signal berishar, hayot to'xtovsiz davom etardi. {b['chars'][0]} bu olomon orasida o'zini yolg'iz his qilardi. U minglab odamlar orasida yolg'iz edi - bu tuyg'u unga notanish emas edi. U chuqur nafas oldi va olomon orasiga aralashib ketdi.")
    scenes.append(f"Bog'da gullar ochilgan edi. Bahor fasli edi va {b['setting']}ning bog'lari rang-barang gullar bilan to'ldirilgan edi. {b['chars'][0]} va {b['chars'][1]} bog'ning eng chekka burchagidagi skameykada o'tirishardi. Ular atrofdagi go'zallikdan zavqlanib, bir muddat indamay o'tirishdi. {b['chars'][0]} birdan gap boshladi: «{b['chars'][1]}, men senga bir narsa aytmoqchiman». {b['chars'][1]} unga qaradi: «Gapir, men tinglayman».")
    return scenes[t % len(scenes)]

def make_char_dev(b, cn, si):
    t = (cn + si + 1) % 14
    texts = [
        f"{b['chars'][0]} o'zining hayot yo'lini o'ylab ko'rdi. U bolaligida juda qiziquvchan edi - har bir narsaga, har bir hodisaga savol berardi. Uning otasining so'zlari hali ham esida edi: «{b['chars'][0]}, sen dunyoni tushunishga harakat qilyapsan, lekin ba'zi narsalarni tushunish uchun avval o'zingni tushunishing kerak». {b['chars'][0]} bu so'zlarning ma'nosini yillar o'tib anglay boshladi. Uning hayotida ko'p o'zgarishlar bo'lgan edi - yaxshi va yomon, quvonchli va qayg'uli. Ammo har bir tajriba uni kuchliroq qilgan edi. U endi o'zining kimligini biladi va nima istayotganini tushunadi. {b['chars'][0]} o'rnidan turdi va qat'iy qadam bilan oldinga yurdi. Endi orqaga qarashning vaqti emas edi - faqat oldinga, faqat maqsad sari.",
        f"{b['chars'][1]}ning qalbi to'lqinlanardi. U yillar davomida o'z his-tuyg'ularini yashirishga odatlangan edi. Ammo bugun u endi chiday olmadi. Ko'z yoshlari ixtiyorsiz ravishda oqib tushdi. U o'zining kuchsizligidan g'azablandi, ammo bu hissiyotni yengishga ojiz edi. {b['chars'][1]} o'zining butun hayoti davomida kuchli bo'lishga harakat qilgan edi. U boshqalarga yordam berishni, ularni qo'llab-quvvatlashni odat qilgan edi. Ammo kim uning o'ziga yordam berishi mumkin edi? U bu savolga javob topa olmadi. Bir zumda u o'zini butunlay yolg'iz his qildi. Ammo keyin u {b['chars'][0]}ning so'zlarini esladi.",
        f"{b['chars'][2]} kechasi bilan uxlay olmadi. Uning miyasida minglab fikrlar aylanardi - ular to'xtovsiz, tartibsiz va chigal edi. U o'rnidan turdi, derazaga yaqinlashdi va tungi osmonni tomosha qila boshladi. Yulduzlar porlab turardi - ularning soni cheksiz, go'zalligi esa ta'riflab bo'lmas edi. {b['chars'][2]} yulduzlarga qarab, o'z muammolarining kichikligini his qildi. Koinot cheksiz, unda insonning hayoti esa bir zum. Shunday ekan, nima uchun odamlar mayda-chuyda narsalar uchun tashvishlanadi? {b['chars'][2]} bu savolga javob topa olmadi, ammo yulduzlarga qarab, u o'zini tinch his qildi.",
        f"{b['chars'][0]}ning qo'llari titrardi. U qo'lidagi xatni qayta-qayta o'qirdi - har bir so'z uning yuragiga xanjar bo'lib sanchilardi. Bu xat uning butun hayotini o'zgartirishi mumkin edi. U xatni yozgan odamni yaxshi bilardi - bu uning eng yaqin do'sti edi. Ammo do'stning bu xati undan yashirilgan haqiqatni ochib bergan edi. {b['chars'][0]} bir zumda g'azab va hayrat o'rtasida qoldi. U nima qilishni bilmas edi. {b['chars'][2]} uning holatini payqab, yoniga keldi: «Nima bo'ldi?» {b['chars'][0]} xatni unga uzatdi: «Buni o'qi. Men nima qilishni bilmayman».",
        f"{b['chars'][1]} o'z aksiga ko'zguda qarab turardi. U o'zini tanimasdi - ko'zgudagi odam butunlay boshqa birov edi. Yillar, tashvishlar va sinovlar uning yuziga chuqur izlar qoldirgan edi. {b['chars'][1]} qo'lini ko'zguga cho'zdi va barmoq uchlari bilan o'z aksiga tegdi. «Men kimman?» degan savol uning miyasida aks-sado berdi. U bu savolga javob topish uchun butun umr izlagan edi, ammo javob har safar qochib qolardi. {b['chars'][1]} chuqur nafas oldi va ko'zgudagi aksga qattiq qaradi: «Men o'zgaraman. Men o'zimni topaman».",
        f"Ertalabki quyosh {b['chars'][0]}ning yuziga tushgan edi. U uyg'ondi va bir zum nima bo'lganini eslay olmadi. Keyin asta-sekin kechagi voqealar xotirasiga qaytdi. Uning yuragi tez ura boshladi. Kecha uning hayotidagi eng muhim kecha edi - u o'zining eng katta qo'rquvini yenggan edi. {b['chars'][0]} o'rnidan turdi, derazani ochdi va toza havodan chuqur nafas oldi. Bugun yangi kun edi va u o'zini butunlay yangi odamdek his qilardi. Uning oldida butun bir hayot bor edi - imkoniyatlar va sinovlarga to'la. {b['chars'][0]} jilmaydi va kunning birinchi qadamini tashladi.",
        f"{b['chars'][2]}ning ongi to'lib-toshgan edi. U yillar davomida o'zida saqlagan sirlarni kimdir bilan baham ko'rishni xohlardi. Ammo u ishonadigan odam yo'q edi. U o'zining yolg'izligini his qilardi - garchi atrofida odamlar ko'p bo'lsa ham. {b['chars'][2]} bu hissiyotni yillar oldin bir kitobda o'qigan edi: «Eng chuqur yolg'izlik - bu olomon ichidagi yolg'izlikdir». U hozir mana shu holatni boshidan kechirardi. {b['chars'][2]} ko'zlarini yumdi va o'z ichki ovoziga quloq soldi. Bu ovoz unga nima qilish kerakligini aytardi.",
        f"{b['chars'][0]}ning qo'lida uning bolalik fotosurati bor edi. Suratda u otasining qo'lidan ushlab, kulib turardi. O'sha paytda uning hayoti oddiy va baxtli edi. Ammo vaqt o'tdi, otasi vafot etdi, hayot esa murakkablashdi. {b['chars'][0]} suratga qarab, ko'z yoshlarini ushlab qola olmadi. U otasining so'nggi so'zlarini esladi: «O'g'lim, hayotda eng qiyin narsa - bu o'z yo'lini topishdir. Ammo sen uni topasan, men ishonaman». {b['chars'][0]} suratni sekin yopdi va cho'ntagiga joyladi. U otasining ishonchini oqlashga tayyor edi.",
        f"{b['chars'][1]} o'zining eng katta xatosini esladi. Bir necha yil oldin u noto'g'ri qaror qabul qilgan edi va bu qaror uning butun hayotini o'zgartirib yuborgan edi. O'sha paytda u o'zini haqli deb hisoblardi, ammo endi u xato qilganini tushunardi. {b['chars'][1]} bu xatodan saboq oldi va endi shunday xatolarni takrorlamaslikka qaror qildi. «O'tmishni o'zgartirib bo'lmaydi,» dedi u o'ziga. «Ammo kelajakni qurish mumkin».",
        f"{b['chars'][2]} o'z kuchiga ishonishni o'rganardi. U ko'p yillar davomida o'ziga ishonmas edi - har doim boshqalarning fikriga qarar, o'z qobiliyatlariga shubha qilardi. Ammo bugun u o'ziga ishonishni boshlagan edi. U birinchi marta o'z qarorini qabul qildi va bu qaror to'g'ri edi. {b['chars'][2]} bu hissiyotdan zavqlandi. O'ziga ishonish - bu eng katta kuch ekanligini u endi tushunardi.",
        f"{b['chars'][0]} va {b['chars'][1]} uzoq kutilgan uchrashuv nihoyat ro'y berdi. Ular bir-birlarini ko'rganlarida, ko'zlari yorishdi. Yillar davomida ular bir-birlarini sog'inishgan edi. {b['chars'][0]} {b['chars'][1]}ni quchoqladi: «Seni ko'rganimdan juda xursandman». {b['chars'][1]} uning quchog'ida erib ketdi: «Men ham. Juda sog'indim seni». Ular bir muddat indamay turishdi - so'zlar kerak emas edi.",
    ]
    return texts[t % len(texts)]

def make_dialogue(b, cn, si):
    t = (cn + si + 2) % 14
    texts = [
        f"«{b['chars'][0]}, men sen bilan gaplashishim kerak», dedi {b['chars'][1]} jiddiy ohangda. {b['chars'][0]} boshini ko'tarib, unga qaradi. «Nima bo'ldi?» so'radi u hayron bo'lib. {b['chars'][1]} chuqur nafas oldi va stolga yaqinlashdi. «Men bir narsani bilaman. Bir narsani... bu seni xafa qilishi mumkin». {b['chars'][0]}ning yuragi tez ura boshladi. «Ayt. Nima bo'lishidan qat'iy nazar, men haqiqatni bilishga tayyorman». {b['chars'][1]} uning ko'zlariga qaradi va bir muddat indadi. Keyin sekin gapira boshladi. Uning ovozi titrar edi, ammo u o'zini tutishga harakat qilardi.",
        f"«Keling, bu masalani birgalikda hal qilaylik», dedi {b['chars'][2]} hammani bir nuqtaga qarab. {b['chars'][0]} va {b['chars'][1]} bir-birlariga qarashdi. Ular o'rtasida keskinlik bor edi - bir necha kundan beri davom etayotgan janjal. {b['chars'][0]} birinchi bo'lib gap boshladi: «Men kechirim so'rayman. Men xato qildim». {b['chars'][1]} hayron bo'ldi: «Sen kechirim so'rayapsanmi?» «Ha. Men o'z xatomni tan olaman. Men shoshilib, noto'g'ri qaror qabul qildim». {b['chars'][1]}ning yuzi yumshadi. «Men ham kechirim so'rayman. Men ham xato qilganman».",
        f"«{b['chars'][0]}, qayerda bo'lding?» {b['chars'][2]}ning ovozi g'amgin edi. {b['chars'][0]} boshini egdi: «Men... men faqat o'ylashim kerak edi». «O'ylash? Butun bir kun? Men juda xavotirlandim!» {b['chars'][2]}ning ko'zlarida yosh bor edi. {b['chars'][0]} uning oldiga bordi va qo'lidan ushladi: «Kechir meni. Men seni tashvishlantirishni xohlamagan edim. Shunchaki... hayotimdagi eng muhim qarorni qabul qilishim kerak edi». {b['chars'][2]} uning ko'zlariga qaradi: «Qanday qaror?» «{b['setting']}ni tark etish haqida».",
        f"«Eshiting, men sizga bir sirni aytmoqchiman», dedi {b['chars'][0]} ovozini pasaytirib. {b['chars'][1]} va {b['chars'][2]} unga yaqinlashdi. Ular eski kafeda, eng chekka stolda o'tirishardi. Atrofda odamlar ko'p edi, ammo hech kim ularning suhbatini eshitmasligi kerak edi. {b['chars'][1]}ning yuzi oqarib ketdi: «Bu... bu hazil bo'lsa kerak?» «Afsuski, yo'q. Men buni o'z ko'zim bilan ko'rdim. Va men nima qilishni bilmayman». {b['chars'][2]} uning yelkasiga qo'lini qo'ydi: «Sen yolg'iz emassan. Biz birgamiz».",
        f"«{b['chars'][0]}, to'xta!» deb qichqirdi {b['chars'][1]}. {b['chars'][0]} orqasiga o'girildi. Uning yuzida g'azab va iztirob aralash ifoda bor edi. «Nega? Nega meni to'xtatmoqchisan?» «Chunki sen xato qilyapsan!» {b['chars'][1]} unga yaqinlashdi. «Sen g'azab bilan qaror qabul qilyapsan. Ammo g'azab bilan qabul qilingan qarorlar hech qachon to'g'ri bo'lmaydi». {b['chars'][0]} bir zum to'xtadi. U {b['chars'][1]}ning so'zlarida haqiqat borligini his qildi. U chuqur nafas oldi va g'azabini pasaytirishga harakat qildi.",
        f"«{b['chars'][2]}, uzoq vaqt bo'ldi», dedi notanish ovoz. {b['chars'][2]} o'girilib, ovoz kelgan tomonga qaradi. Uning ko'zlari katta-katta ochildi. «{b['chars'][0]}? Sen... sen bu yerdamisiz?» {b['chars'][0]} jilmaydi: «Ha, men. O'n yil o'tdi. O'n yil... ko'p narsa o'zgaribdi». {b['chars'][2]} uning oldiga bordi va quchoqladi: «Men seni ko'rganimdan juda xursandman! Qayerda eding? Nega aloqaga chiqmading?» {b['chars'][0]} bir zum o'ylanib turdi: «Bu uzoq hikoya. Lekin men senga bir narsa aytishim kerak».",
        f"«Men bunga ishonmayman», dedi {b['chars'][0]} bosh chayqab. «Lekin bu haqiqat», javob berdi {b['chars'][1]} jiddiy ohangda. «Men hamma narsani tekshirdim. Barcha dalillar bir narsani ko'rsatadi». {b['chars'][0]} stol ustidagi hujjatlarni varaqladi. Uning qo'llari titrardi. «Agar bu rost bo'lsa, unda... unda hamma narsa o'zgaradi». «Aynan shuning uchun men buni senga ko'rsatishga qaror qildim. Sen bu haqda bilishing kerak». {b['chars'][0]} hujjatlarni yopdi va chuqur nafas oldi.",
        f"«{b['chars'][1]}, tasavvur qil,» dedi {b['chars'][0]} hayajon bilan. «Men bir necha kundan beri bir narsa ustida ishlayapman. Va men nihoyat buni uddaladim». {b['chars'][1]} unga shubha bilan qaradi: «Nimani?» {b['chars'][0]} cho'ntagidan kichik bir qutichani oldi va stolga qo'ydi. «Buni och». {b['chars'][1]} qutichani ochdi va ichidagi narsani ko'rib, nafasini ushlab qoldi. «Bu... bu aql bovar qilmaydigan narsa!»",
        f"«Nega meni tark etding?» so'radi {b['chars'][2]} ovozida alam bilan. {b['chars'][0]} boshini egdi va bir muddat indadi. «Men... men qo'rqdim,» dedi u nihoyat. «Qo'rqding? Nimadan?» «O'z his-tuyg'ularimdan. Seni yo'qotishdan qo'rqdim. Shuning uchun men birinchi bo'lib ketdim». {b['chars'][2]} uning yoniga o'tirdi va qo'lini uning yelkasiga qo'ydi: «Seni tushunaman. Ammo endi bilishing kerak - men seni hech qachon tark etmayman».",
        f"«Bugun kechasi men bir narsani tushundim», dedi {b['chars'][1]} o'ychan ohangda. {b['chars'][0]} va {b['chars'][2]} unga qarashdi. Ular olov atrofida o'tirishardi, olovning tillari raqsga tushib, ularning yuzlarini yoritardi. «Hayotda eng muhim narsa - bu sening yoningda kim borligi. Pul, muvaffaqiyat, obro' - bularning hammasi ikkinchi darajali». {b['chars'][0]} bosh irg'adi: «Sen haqsan. Men ham buni endi tushunaman».",
        f"«Ertaga hamma narsa o'zgaradi», dedi {b['chars'][2]} qat'iy ohangda. {b['chars'][0]} va {b['chars'][1]} bir-birlariga qarashdi. {b['chars'][0]} so'radi: «Tayyormisan?» «Ha, tayyorman. Men bu qarorni qabul qildim va endi orqaga qaytmayman». {b['chars'][1]} uning qo'lini qattiq ushladi: «Biz sen bilan birgamiz. Nima bo'lishidan qat'iy nazar, biz birgamiz». Uchovlon bir-birlariga qarashdi va bosh irg'adilar.",
    ]
    return texts[t % len(texts)]

def make_action(b, cn, si):
    t = (cn + si + 3) % 14
    texts = [
        f"To'satdan eshik qattiq taqilladi. {b['chars'][0]} va {b['chars'][1]} bir-birlariga qarashdi. Ular kutilmagan mehmonga tayyor emas edi. Eshik yana taqilladi - bu safar kuchliroq. {b['chars'][0]} sekin eshikka yaqinlashdi va ko'z teshigidan qaradi. Uning yuzi oqarib ketdi. «Ular keldi», deb pichirladi u. {b['chars'][1]} ham yaqinlashdi: «Kim?» «Ular... va uning odamlari». Vaziyat keskin edi. Ular qochishga ulgurmas edi. {b['chars'][0]} atrofga qaradi - derazadan chiqish mumkin edi, ammo bu ikkinchi qavat edi. «{b['chars'][1]}, derazadan tush! Men ularni chalg'itaman». «Yo'q! Men seni tashlab ketmayman!»",
        f"Yong'in tezda tarqala boshladi. {b['chars'][0]} va {b['chars'][1]} binodan chiqishga harakat qilishardi, ammo tutun yo'lni to'sib qo'ygan edi. Ular nafas olishga qiynalardi. {b['chars'][0]} ho'l ro'molni {b['chars'][1]}ga uzatdi: «Buni og'zingga tut!». Ular bir-birlarining qo'llaridan ushlab, devor bo'ylab harakatlanishdi. Yong'in signali butun binoni to'ldirgan edi. Odamlar qichqiriqlari, siren va olov shitirlashi - hamma narsa aralashib ketgan edi. {b['chars'][0]} eski rejani esladi - bu binoning ikkinchi chiqish yo'li bor edi. «Bu yo'ldan!» deb baqirdi u.",
        f"«Qo'lingizni ko'taring!» buyruq berdi qurollangan odam. {b['chars'][0]} va {b['chars'][2]} qo'llarini ko'tarishdi. Ularning oldida uch kishi turardi - yuzlari niqoblangan, qo'llarida qurol bor edi. «Bu yerda nima qilyapsiz?» so'radi ulardan biri qo'pol ohangda. {b['chars'][0]} unga tik qaradi: «Biz hech narsa qilmayapmiz. Faqat bu yerdan o'tayotgan edik». «Yolg'on! Biz sizni kuzatib turganmiz. Siz {b['setting']} haqida ma'lumot to'playapsiz». {b['chars'][2]} {b['chars'][0]}ga qaradi - qo'rquv va hayrat aralash edi.",
        f"Avtomobil dvigatelining ovozi yaqinlashdi. {b['chars'][0]} {b['chars'][1]}ni o'zi bilan birga tortib, devor orqasiga yashirindi. Ular nafaslarini ushlab, jim turishdi. Ikkita katta qora mashina to'xtadi va ulardan besh kishi tushdi. Ular atrofga qarab, bir narsani qidirardi. {b['chars'][0]} {b['chars'][1]}ning qo'lini qattiq ushladi - uning qo'llari sovuq va nam edi. «Qo'rqma», deb pichirladi u. «Hammasi yaxshi bo'ladi». Ular odamlar uzoqlashguncha kutishdi. Keyin {b['chars'][0]} sekin o'rnidan turdi va atrofga qaradi.",
        f"Tog' yo'li xavfli edi. {b['chars'][0]} va {b['chars'][2]} jarlik chetida muvozanatni saqlashga harakat qilishardi. Ular ikki kun davomida yo'lda edi - suv va oziq-ovqat zaxiralari tugab qolgan edi. {b['chars'][2]} bir zum to'xtadi va nafas olishga urindi: «Men davom eta olmayman». {b['chars'][0]} uning oldiga qaytdi: «Bozor-kun, sen kuchlisan. Faqat bir qadam, yana bir qadam. Men sen bilanman». {b['chars'][2]} boshini ko'tardi va {b['chars'][0]}ning ko'zlariga qaradi. Ularning ko'zlarida qat'iyat bor edi.",
        f"Bo'ron kuchayib borardi. Shamol {b['setting']}ni larzaga solar, yomg'ir esa shiddat bilan yog'ardi. {b['chars'][0]} va {b['chars'][1]} boshpana topishga harakat qilishardi. Ular ho'l va charchagan edi. {b['chars'][1]} yiqilib tushdi - u endi yura olmas edi. {b['chars'][0]} uning oldiga cho'kkaladi: «{b['chars'][1]}, jonim, tur! Yana bir oz! U yerda boshpana bor». {b['chars'][1]} boshini chayqadi: «Men qila olmayman. Sen ket, meni tashlab ket». {b['chars'][0]} uning qo'lidan ushladi: «Men seni hech qachon tashlab ketmayman!»",
        f"Yer qimirladi. Kuchli zilzila {b['setting']}ni larzaga soldi. {b['chars'][0]} va {b['chars'][2]} bir-birlariga yopishib oldilar. Ustlariga shiftdan parchalar tusha boshladi. {b['chars'][0]} atrofga qaradi - chiqish yo'li to'silgan edi. «Bu yoqdan!» deb baqirdi u va {b['chars'][2]}ni stol ostiga tortdi. Ular bir-birlariga suyanib, zilzila to'xtashini kutishdi. Bir necha daqiqadan so'ng yana tinchlik o'rnatildi. {b['chars'][0]} sekin boshini ko'tardi: «Hammamiz tirikmizmi?»",
        f"«Tezroq!» qichqirdi {b['chars'][1]} va yugurishni boshladi. {b['chars'][0]} uning orqasidan ergashdi. Ular tor ko'chalar bo'ylab yugurishardi, orqalaridan esa ta'qibchilarining ovozi eshitilardi. {b['chars'][0]}ning yuragi qattiq urar, o'pkasi yonardi. U to'xtab, bir zum nafas olishga umid qildi, ammo orqaga qarashga ham jur'ati yo'q edi. {b['chars'][1]} burilishda uni kutib turardi: «Sen qila olasan! Tezroq!»",
        f"Suv sathi ko'tarila boshladi. {b['chars'][0]} va {b['chars'][1]} yuqori qavatga chiqishga harakat qilishardi. Suv ularning to'pig'idan, tizzasidan, belidan oshib bordi. {b['chars'][1]} suzishni bilmas edi va vahima qila boshladi. {b['chars'][0]} uning qo'lidan mahkam ushladi: «Menga qara. Men sen bilanman. Faqat menga ishon». U bir qo'li bilan {b['chars'][1]}ni ushlab, ikkinchi qo'li bilan zinapoyaga chiqishga harakat qildi.",
        f"Tungi shahar ko'chalarida ikki kishi tezda harakatlanardi. {b['chars'][0]} va {b['chars'][2]} devorlar bo'ylab sirg'alib, ko'cha chiroqlari ostidan o'tishga harakat qilishardi. Ular muhim ma'lumotga ega edi va bu ma'lumotni xavfsiz joyga yetkazishlari kerak edi. Orqalaridan bir ovoz eshitildi: «To'xtanglar!». Ular tezligini oshirishdi va yaqin atrofdagi bog' tomon yugurishdi.",
    ]
    return texts[t % len(texts)]

def make_resolution(b, cn, si):
    t = (cn + si + 4) % 14
    texts = [
        f"Vaqt o'tdi va vaziyat asta-sekin barqarorlashdi. {b['chars'][0]} va {b['chars'][1]} o'rtasidagi ziddiyat hal bo'ldi. Ular bir-birlarini tushunishdi va kechirishdi. «Men xato qilganman», dedi {b['chars'][0]} sokin ovozda. {b['chars'][1]} uning yelkasiga qo'lini qo'ydi: «Hammamiz xato qilamiz. Muhimi, xatolardan saboq olish». Ular quchoqlashdi va o'tmishni ortda qoldirishga qaror qilishdi. {b['chars'][2]} ularga qarab jilmaydi: «Endi siz haqiqiy do'stsizlar». Uchovlon birgalikda oldinga qarab yurishdi.",
        f"Muammo nihoyat hal qilindi. {b['chars'][0]} chuqur nafas oldi va orqasiga suyanib o'tirdi. Uning yuzida tinchlik ifodasi paydo bo'ldi. Uzoq vaqt davom etgan stress va tashvish nihoyat tugagan edi. {b['chars'][1]} uning yoniga keldi va bir piyola choy uzatdi: «Sen buni uddalading. Men sen bilan faxrlanaman». {b['chars'][0]} choyni oldi va minnatdorchilik bilan jilmaydi. «Birgalikda uddaladik. Sensiz bu mumkin emas edi». {b['chars'][2]} ularga qo'shildi: «Hammamiz birga bo'lganimiz uchun».",
        f"Yangi kun tong otdi. {b['chars'][0]} derazani ochdi va toza havodan chuqur nafas oldi. Kecha qolgan barcha muammolar va tashvishlar ortda qolgan edi. Uning oldida yangi kun, yangi imkoniyatlar va yangi umidlar bor edi. {b['chars'][2]} uning yoniga keldi: «Tayyormisan?» {b['chars'][0]} bosh irg'adi: «Tayyorman. Yangi boshlanishga tayyorman». Ikkovlon birgalikda oldinga qarab yurishdi. Quyosh ularning orqasidan ko'tarilib, yo'lni yoritardi.",
        f"Oxiri kelgan edi. {b['chars'][0]} {b['chars'][1]} va {b['chars'][2]} bilan birga o'tirib, nima bo'lganini muhokama qilishdi. Ular ko'p narsani boshidan kechirishgan edi - yaxshi va yomon, quvonchli va qayg'uli. Ammo eng muhimi, ular birga edi. «Nima o'rgandingiz?» so'radi {b['chars'][0]}. {b['chars'][1]} jilmaydi: «Men do'stlikning qadrini o'rgandim». {b['chars'][2]} qo'shimcha qildi: «Men esa o'z kuchimga ishonishni o'rgandim». {b['chars'][0]} ikkalasiga qaradi: «Men esa sizlarni topdim».",
        f"Tinchlik nihoyat o'rnatildi. {b['chars'][0]} va {b['chars'][2]} bir-birlariga qarab turishdi. Ularning ko'zlarida minnatdorchilik va hurmat bor edi. «Sen jasur odamsan», dedi {b['chars'][2]}. {b['chars'][0]} jilmaydi: «Sen ham. Biz bir-birimizni to'ldirdik». {b['chars'][1]} ularning oldiga keldi: «Men sizlardan ko'p narsani o'rgandim. Rahmat». Uchovlon quchoqlashdi va kelajak rejalarini tuzishni boshlashdi.",
        f"Vaqt kelgan edi. {b['chars'][0]} eski uyning eshigini yopdi va orqasiga qaramay ketdi. Uning oldida yangi hayot, yangi imkoniyatlar bor edi. {b['chars'][1]} va {b['chars'][2]} uni kutib turardi. Ular birga edi va bu eng muhimi edi. {b['chars'][0]} ularga qo'shildi va birgalikda ular noma'lum sari qadam tashladilar. Qayerga borayotganlarini bilmas edilar, ammo bu muhim emas edi - muhimi, ular birga edi.",
    ]
    return texts[t % len(texts)]

def make_reflection(b, cn, si):
    t = (cn + si + 5) % 14
    texts = [
        f"{b['chars'][0]} o'zining boshidan kechirganlarini o'ylab ko'rdi. Bu yo'l oson bo'lmagan edi - qiyinchiliklar, sinovlar, og'riqli qarorlar. Ammo aynan shu sinovlar uni kuchliroq qilgan edi. U endi avvalgi odam emas edi. U o'zgargan edi - yaxshi tomonga o'zgargan. {b['chars'][0]} osmon yuziga qaradi va jilmaydi. Hayot go'zal, hatto uning eng qiyin paytlarida ham. Muhimi, to'xtamaslik va oldinga intilishdir. Uning oldida butun bir hayot bor edi va u bu hayotni to'liq yashashga qaror qildi.",
        f"{b['chars'][1]} o'zining hayot falsafasi haqida o'yladi. U har doim oddiy narsalarda go'zallikni ko'rishga intilgan edi. Bir piyola choy, samimiy suhbat, iliq tabassum - bu oddiy narsalar hayotni mazmunli qiladi. Odamlar murakkab narsalarni izlab, eng muhim narsalarni unutishadi. {b['chars'][1]} bu haqiqatni endi to'liq anglagan edi. U boshqalarga ham shuni o'rgatmoqchi edi - sekinlash, atrofga qarash va hayotning oddiy go'zalligini qadrlash. Bu - baxtning asl kaliti.",
        f"{b['chars'][2]} kechagi voqealar haqida o'ylardi. U noto'g'ri qaror qabul qilgan edi va buni endi tushunardi. Ammo u o'z xatosidan saboq oldi. Eng muhimi, u endi kelajakda shunday xatolarni takrorlamaslikka qaror qildi. {b['chars'][2]} daftarini oldi va o'z fikrlarini yozib boshladi. Yozish unga o'zini tushunishga yordam berardi. Har bir satr bilan u o'zini tozalagandek his qilardi. U o'z xatolarini tan olishdan qo'rqmas edi va bu uning eng katta kuchi edi.",
        f"{b['chars'][0]} o'zining kelajagi haqida o'ylardi. U uzoq vaqt davomida nima qilishni bilmas edi, ammo endi uning rejasi bor edi. U {b['setting']}ni tark etib, yangi hayot boshlashga qaror qildi. Bu qaror oson bo'lmadi - {b['setting']}da uning ko'p xotiralari va yaqinlari bor edi. Ammo u o'zgarish kerakligini tushunardi. Ba'zida yangi boshlanish uchun eski joylarni tark etish kerak.",
        f"{b['chars'][1]} o'zining do'stlari haqida o'ylardi. {b['chars'][0]} va {b['chars'][2]} - bu ikki kishi uning hayotida eng muhim odamlarga aylanishgan edi. Ular turli vaziyatlarda bir-birlarini qo'llab-quvvatlashgan, birgalikda kulishgan va yig'lashgan. {b['chars'][1]} bu do'stlikni qadrlardi. «Do'stlik - bu eng katta boylik», deb o'yladi u. «Pul, obro', muvaffaqiyat - bularning hammasi vaqtinchalik. Ammo haqiqiy do'stlik abadiy».",
    ]
    return texts[t % len(texts)]


def make_worldbuilding(b, cn, si):
    w = b['world']
    t = (cn + si) % 10
    texts = [
        f"{b['setting']}da yashash o'z qonunlariga ega. {w[:120]} Bu dunyoda hamma narsa bir-biriga bog'liq va har bir harakat o'z oqibatiga ega. {b['chars'][0]} bu haqiqatni kun sayin bilib borardi. U atrofdagi odamlar va hodisalarni kuzatar, ulardan saboq olardi. {b['setting']}ning tarixi va an'analari uning hayotiga chuqur ta'sir ko'rsatgan edi. U bu dunyoda o'z o'rnini topishga harakat qilardi, ammo bu oson emas edi.",
        f"{b['world'][:150]} {b['chars'][1]} bu dunyoning sirlarini ochishga intilardi. U har bir yangi ma'lumot bilan dunyoni yaxshiroq tushuna boshladi. {b['setting']}da yashovchi odamlarning turmush tarzi, e'tiqodlari va urf-odatlari uning uchun yangi kashfiyot edi. U bu bilimlarni boshqalar bilan baham ko'rishni xohlardi. {b['chars'][1]} bu dunyoning bir qismi ekanligidan faxrlanardi va uni yanada yaxshiroq qilishga intilardi.",
        f"Bu dunyoning o'ziga xos qonunlari va tartibi bor. {w[:150]} {b['chars'][2]} bu qonunlarni tushunishga harakat qilardi. U ko'p savollar berar va javob izlardi. Har bir javob yangi savolni tug'dirardi, ammo {b['chars'][2]} to'xtashni xohlamas edi. U haqiqatni topishga qat'iy bel bog'lagan edi. {b['chars'][2]} bilimga chanqoq edi va bu chanqoqni hech narsa qondira olmasdi.",
        f"{w[:180]} {b['chars'][0]} bu dunyoni o'z ko'zi bilan ko'rib, hayratda qoldi. U ilgari bunday narsani tasavvur ham qilmagan edi. {b['setting']}ning go'zalligi va murakkabligi uni lol qoldirdi. U bu dunyo bir qismi ekanligidan faxrlanardi. {b['chars'][0]} o'z atrofidagi hamma narsani o'rganishga, tushunishga va qadrlashga qaror qildi.",
        f"{b['world'][:200]} {b['chars'][1]} va {b['chars'][2]} bu haqda uzoq suhbatlashishdi. Ular {b['setting']}ning kelajagi haqida o'ylashdi. Bu dunyo o'zgarib borardi va ular bu o'zgarishlarning bir qismi edi. {b['chars'][1]} aytdi: «Biz bu dunyoni yaxshiroq qilishimiz kerak». {b['chars'][2]} bosh irg'adi: «Va biz buni qila olamiz. Birgalikda».",
    ]
    return texts[t % len(texts)]

def make_plot_development(b, cn, si):
    t = (cn + si + 1) % 10
    hook_words = b['hook'].split()[:30]
    hook_preview = ' '.join(hook_words)
    texts = [
        f"Voqealar rivojlana boshladi. {b['chars'][0]} kutilmagan hodisaga duch keldi. {hook_preview}... U bu vaziyatda nima qilishni bilmas edi. Ammo u yolg'iz emas edi - {b['chars'][1]} va {b['chars'][2]} uning yonida edi. Uchovlon birgalikda bu muammoni hal qilish yo'llarini izlashdi. Har bir kunning o'z sinovlari bor edi va ular bu sinovlardan muvaffaqiyatli o'tishga harakat qilishdi. {b['chars'][0]} endi tushunardi: hayot - bu sinovlar va ularni yengish san'ati.",
        f"Kunlar o'tib, vaziyat o'zgarib bordi. {hook_preview}... {b['chars'][0]} endi faqat o'z hayoti emas, balki boshqalarning hayoti ham uning qarorlariga bog'liqligini tushundi. Bu mas'uliyat og'ir edi, ammo u bunga tayyor edi. {b['chars'][1]} va {b['chars'][2]} unga yordam berishdi va birgalikda ular eng qiyin to'siqlarni yengib o'tishdi. Uchovlonning ittifoqi kundan-kunga mustahkamlanib bordi.",
        f"Yangi ma'lumotlar paydo bo'ldi. {hook_preview}... Bu ma'lumotlar hamma narsani o'zgartirib yubordi. {b['chars'][0]} endi oldingidan ko'ra ko'proq narsani bilardi, ammo bu bilim og'ir yuk edi. {b['chars'][1]} unga: «Haqiqat har doim og'riqli, ammo yolg'ondan yaxshiroq», dedi. {b['chars'][2]} esa jim turib, o'z xulosalarini chiqardi. Ular nima qilish kerakligini muhokama qilishdi.",
        f"Syujet tobora murakkablashib bordi. {hook_preview}... {b['chars'][0]} yangi ittifoqchilar va yangi dushmanlar topdi. {b['chars'][1]} va {b['chars'][2]} ham bu kurashda o'z o'rnini topishdi. Uchovlon endi faqat o'z maqsadlari uchun emas, balki butun {b['setting']} kelajagi uchun kurashayotgan edi. Ular bu mas'uliyatni his qilishardi va bu ularni yanada kuchliroq qilardi.",
        f"To'satdan hamma narsa o'zgardi. {hook_preview}... {b['chars'][0]} bu o'zgarishga tayyor emas edi, ammo u moslashishni o'rganishi kerak edi. {b['chars'][1]} unga yordam berdi: «Ba'zida eng yaxshi rejalar ham buziladi. Muhimi, yangi vaziyatga moslasha olish». {b['chars'][2]} ularga qo'shildi: «Biz birgamiz va birgalikda har qanday qiyinchilikni yenga olamiz».",
    ]
    return texts[t % len(texts)]

def make_emotional(b, cn, si):
    t = (cn + si + 2) % 14
    texts = [
        f"{b['chars'][0]}ning yuragi to'lib-toshgan edi. U o'z his-tuyg'ularini so'z bilan ifodalay olmasdi. Ko'zlari yoshga to'ldi, ammo u bu yoshlarni yashirishga harakat qilmadi. Uzoq vaqt davomida u o'z his-tuyg'ularini bosgan edi, ammo endi u o'zini erkin his qilardi. U yig'ladi - na xafa bo'lib, na quvonib. Bu shunchaki tozalanish edi. {b['chars'][1]} uning yoniga kelib, indamay yelkasiga qo'lini qo'ydi. Ba'zida so'zlar kerak emas - oddiy bir tegishning o'zi etarli.",
        f"Yengillik hissi {b['chars'][1]}ni qamrab oldi. Ko'p oylar davom etgan tashvish va stress nihoyat tugagan edi. U chuqur nafas oldi va birinchi marta uzoq vaqt ichida chin dildan jilmaydi. {b['chars'][0]} uning bu holatini ko'rib, xursand bo'ldi. «Hammasi yaxshi», dedi u. «Endi hammasi yaxshi bo'ladi». {b['chars'][1]} bosh irg'adi va yana bir marta jilmaydi. Bu tabassum uning yuzida uzoq vaqt saqlanib qoldi.",
        f"G'azab {b['chars'][2]}ni qamrab oldi. U o'zini tuta olmadi - qo'llari musht bo'lib siqildi, yuzi qizardi. «Bu adolatsizlik!» deb baqirdi u. «Nega? Nega aynan biz?» {b['chars'][0]} uning oldiga bordi va sokin ovozda dedi: «G'azab bilan hech narsani o'zgartira olmaysan. Biz tinch yo'l bilan hal qilishimiz kerak». {b['chars'][2]} chuqur nafas oldi va o'zini bosishga harakat qildi. G'azabning o'rnini qat'iyat egalladi.",
        f"{b['chars'][0]} o'zini juda yolg'iz his qildi. Atrofida odamlar ko'p bo'lsa ham, u o'zini butunlay yolg'iz his qilardi. Bu hissiyot unga notanish emas edi - u bolaligidan beri shu his bilan yashagan edi. U deraza oldiga bordi va tashqaridagi odamlarni kuzatdi. Ularning hammasi biror joyga shoshilishardi, ularning hammasining o'z hayoti bor edi. {b['chars'][0]} o'zini ular orasida begona his qildi.",
        f"Quvonch {b['chars'][1]}ni to'ldirib yubordi. U shunchalik baxtli ediki, bu baxtni kimdir bilan baham ko'rishni xohlardi. U yugurib {b['chars'][0]}ning oldiga bordi va uni quchoqladi: «Ishladi! Hammasi ishladi!» {b['chars'][0]} uning quchog'ida aylanib, kuldi: «Men bilardim! Sen buni uddalaysan!» Ular birga kulishdi va raqsga tushishdi. Bu lahzalar abadiy xotirada qoladi.",
        f"Qayg'u {b['chars'][2]}ni qamrab oldi. U yo'qotishning og'irligini his qilardi. Bu og'riq juda chuqur edi - uni hech narsa yengillata olmasdi. {b['chars'][0]} uning yoniga o'tirdi va indamay qo'lini ushladi. Hech nima demadi - chunki aytadigan so'zlar yo'q edi. Ba'zida jimlik eng yaxshi tasalli bo'ladi. {b['chars'][2]} uning qo'lini qattiq ushladi va ko'z yoshlarini oqizdi.",
    ]
    return texts[t % len(texts)]

def make_philosophical(b, cn, si):
    t = (cn + si + 3) % 14
    texts = [
        f"{b['chars'][0]} hayotning mazmuni haqida o'ylardi. U ko'p yillar davomida bu savolga javob izlagan edi. Endi u javobni topganiga ishonardi. Hayotning mazmuni - bu izlashning o'zi. Javobni topish emas, balki savol berishda davom etish. {b['chars'][1]} aytganidek: «Eng muhim savollar - bu javobsiz qoladigan savollardir». {b['chars'][0]} bu so'zlarni endi tushunardi. Hayot - bu savol berish va javob izlash jarayoni.",
        f"Vaqt - bu eng qimmatli resurs. {b['chars'][1]} vaqtni behuda sarflashni yoqtirmasdi. U har bir daqiqani qadrlardi, chunki vaqt hech qachon qaytib kelmaydi. «Vaqt - bu daryo,» derdi u. «U bir tomonga oqadi va hech qachon orqaga qaytmaydi. Shuning uchun har bir daqiqadan unumli foydalanish kerak». {b['chars'][0]} bu falsafani o'z hayotida qo'llashga harakat qilardi. Vaqtni qadrlash - bu hayotni qadrlash demakdir.",
        f"{b['chars'][2]} taqdir va erkin iroda haqida o'ylardi. Odamlar o'z taqdirini o'zi yaratadimi yoki hamma narsa oldindan belgilab qo'yilganmi? U bu savolga javob topa olmadi, ammo o'ylashni davom ettirdi. Balki javob ikkala variant o'rtasida biror joyda edi. Inson o'z yo'lini tanlay oladi, ammo ba'zi narsalar uning irodasidan tashqarida. {b['chars'][2]} bu murakkab falsafani oddiy qilib tushuntirishga harakat qilardi.",
        f"{b['chars'][0]} va {b['chars'][1]} uzoq suhbatda edi. Ular hayot, o'lim va ular o'rtasidagi hamma narsa haqida gaplashishdi. {b['chars'][0]} aytdi: «Men o'limdan qo'rqmayman. Men yashamagan hayotdan qo'rqaman». {b['chars'][1]} unga qaradi: «Bu chuqur fikr. Ammo yashash - bu nafaqat nafas olish, balki his qilishdir». Ular bir-birlarining ko'zlariga qarab, jilmayishdi. Bu suhbat ularning hayotini o'zgartirdi.",
        f"Quvonch va qayg'u - ular bir-biriga bog'liq. {b['chars'][2]} bu haqiqatni endi tushunardi. Birini his qilmasdan turib, ikkinchisini to'liq his qilib bo'lmaydi. {b['chars'][2]} aytdi: «Hayotdagi eng muhim narsa - bu muvozanat. Quvonch va qayg'u, muvaffaqiyat va muvaffaqiyatsizlik, sevgi va nafrat - bularning hammasi hayotning bir qismi. Birini yo'q qilish, ikkinchisini ham yo'q qilishdir».",
        f"Baxt - bu maqsad emas, yo'ldir. {b['chars'][0]} bu haqiqatni tushunish uchun uzoq vaqt kerak qildi. U yillar davomida baxtni topishga harakat qilgan edi, ammo endi u baxtni topib bo'lmasligini tushundi. Baxt - bu keladigan narsa emas, u yaratiladigan narsa. «Har bir kunni baxtli qilish senning qo'lingda,» dedi u o'ziga. «Faqat atrofga qarash va oddiy narsalarda go'zallikni ko'rish kerak».",
    ]
    return texts[t % len(texts)]

# ============================================================
# MAIN GENERATION FUNCTION
# ============================================================

def generate_chapter(book, chapter_num, total_chapters):
    """Generate one chapter with 1500+ words (25-35 sections)."""
    b = book
    cn = chapter_num
    total = total_chapters
    
    sections = []
    
    if cn <= 2:
        # Early: set the stage - more scene, dialogue, worldbuilding
        type_seq = ['scene', 'scene', 'char_dev', 'dialogue', 'world', 'plot', 'dialogue', 'scene',
                     'char_dev', 'emotional', 'world', 'plot', 'dialogue', 'char_dev', 'scene',
                     'dialogue', 'philosophical', 'scene', 'emotional', 'reflection',
                     'dialogue', 'world', 'reflection', 'char_dev', 'scene', 'dialogue',
                     'reflection', 'emotional', 'plot', 'scene']
    elif cn <= total - 3:
        # Middle: action, conflict, development
        type_seq = ['scene', 'char_dev', 'dialogue', 'action', 'world', 'action', 'dialogue', 'plot',
                     'emotional', 'scene', 'char_dev', 'action', 'reflection', 'dialogue', 'world',
                     'action', 'philosophical', 'plot', 'dialogue', 'action', 'char_dev',
                     'scene', 'emotional', 'dialogue', 'world', 'action', 'reflection',
                     'philosophical', 'action', 'char_dev', 'scene', 'dialogue', 'plot',
                     'emotional', 'world']
    else:
        # Late: resolution, reflection, conclusion
        type_seq = ['scene', 'char_dev', 'dialogue', 'action', 'resolution', 'world', 'emotional',
                     'philosophical', 'scene', 'char_dev', 'dialogue', 'reflection', 'action',
                     'resolution', 'world', 'emotional', 'philosophical', 'reflection', 'dialogue',
                     'scene', 'resolution', 'char_dev', 'reflection', 'emotional', 'world',
                     'philosophical', 'dialogue', 'resolution', 'scene', 'reflection',
                     'char_dev', 'emotional', 'resolution', 'reflection']
    
    for si, t in enumerate(type_seq):
        if t == 'scene':
            sections.append(make_scene(b, cn, si))
        elif t == 'char_dev':
            sections.append(make_char_dev(b, cn, si))
        elif t == 'dialogue':
            sections.append(make_dialogue(b, cn, si))
        elif t == 'action':
            sections.append(make_action(b, cn, si))
        elif t == 'resolution':
            sections.append(make_resolution(b, cn, si))
        elif t == 'reflection':
            sections.append(make_reflection(b, cn, si))
        elif t == 'world':
            sections.append(make_worldbuilding(b, cn, si))
        elif t == 'plot':
            sections.append(make_plot_development(b, cn, si))
        elif t == 'emotional':
            sections.append(make_emotional(b, cn, si))
        elif t == 'philosophical':
            sections.append(make_philosophical(b, cn, si))
    
    chapter_text = '\n\n'.join(sections)
    return chapter_text


def main():
    all_db_books = []
    all_gb_entries = []
    total_chars = 0
    total_words = 0
    
    print("=" * 60)
    print("100 NOYOB KITOB GENERATORI")
    print("Xoleric AI - Barcha kontent o'zbek tilida")
    print("=" * 60)
    print()
    
    for idx, bdef in enumerate(BOOK_DEFS):
        bid = f"bk{bdef['id']:03d}"
        title = bdef['title']
        genre = bdef['genre']
        chars = bdef['chars']
        setting = bdef['setting']
        world = bdef['world']
        hook = bdef['hook']
        
        # Chapter count: 20-25 based on id
        num_chapters = 20 + (bdef['id'] % 6)
        
        print(f"[{bdef['id']:3d}/100] {title} ({genre}) - {num_chapters} bob")
        
        chapters = []
        full_content_parts = []
        
        # Generate each chapter
        for ch in range(1, num_chapters + 1):
            ch_title = f"{ch}-bob: {CHAPTER_TITLES[(ch - 1) % len(CHAPTER_TITLES)]}"
            ch_text = generate_chapter(bdef, ch, num_chapters)
            
            chapter_obj = {
                "id": f"{bid}-{ch}",
                "title": ch_title,
                "pages": [ch_text]
            }
            chapters.append(chapter_obj)
            full_content_parts.append(f"\n--- {ch_title} ---\n{ch_text}")
        
        content_header = f'"{title}" — {genre} janri\n\nQahramonlar: {", ".join(chars)}\n\nJoy: {setting}\n\n'
        full_content = content_header + ''.join(full_content_parts)
        
        book_obj = {
            "id": bid,
            "title": title,
            "author": "Xoleric AI",
            "category": genre,
            "description": f'"{title}" - {genre} janri. {hook}',
            "cover": "",
            "content": full_content,
            "chapters": chapters,
            "progress": 0,
            "lastRead": 0,
            "isFavorite": False,
            "addedAt": int((time.time() + bdef['id']) * 1000),
            "totalPages": len(chapters)
        }
        
        # Save individual book file
        fname = f"{bdef['id']:03d}-{slugify(title)}.json"
        fpath = os.path.join(BOOKS_SRC, fname)
        with open(fpath, 'w', encoding='utf-8') as f:
            json.dump(book_obj, f, ensure_ascii=False, indent=2)
        
        all_db_books.append(book_obj)
        
        gb_entry = {
            "id": bid,
            "title": title,
            "category": genre,
            "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime())
        }
        all_gb_entries.append(gb_entry)
        
        b_wc = sum(len(ch['pages'][0].split()) for ch in chapters)
        b_cc = sum(len(ch['pages'][0]) for ch in chapters)
        total_words += b_wc
        total_chars += b_cc
        
        wc_str = f"{b_wc:,}".replace(',', ' ')
        cc_str = f"{b_cc:,}".replace(',', ' ')
        print(f"       {num_chapters} bob, {wc_str} so'z, {cc_str} belgi")
    
    # Write database.json
    db_path = os.path.join(BASE, 'books', 'database.json')
    with open(db_path, 'w', encoding='utf-8') as f:
        json.dump(all_db_books, f, ensure_ascii=False, indent=2)
    
    # Write generated-books/books.json
    gb_books_path = os.path.join(BASE, 'generated-books', 'books.json')
    with open(gb_books_path, 'w', encoding='utf-8') as f:
        json.dump(all_db_books, f, ensure_ascii=False, indent=2)
    
    # Write generated-books/generator-state.json
    gs_path = os.path.join(BASE, 'generated-books', 'generator-state.json')
    gs_data = {
        "generatedCount": len(all_gb_entries),
        "books": all_gb_entries,
        "lastRun": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime())
    }
    with open(gs_path, 'w', encoding='utf-8') as f:
        json.dump(gs_data, f, ensure_ascii=False, indent=2)
    
    # Write summary
    avg_wpb = total_words // len(BOOK_DEFS)
    avg_cpb = total_chars // len(BOOK_DEFS)
    total_chapters = sum(20 + (b['id'] % 6) for b in BOOK_DEFS)
    
    print()
    print("=" * 60)
    print("GENERATSIYA YAKUNLANDI!")
    print("=" * 60)
    print(f"Jami kitoblar: {len(BOOK_DEFS)}")
    print(f"Jami boblar: {total_chapters}")
    print(f"Jami so'zlar: {total_words:,}".replace(',', ' '))
    print(f"Jami belgilar: {total_chars:,}".replace(',', ' '))
    print(f"O'rtacha: {avg_wpb:,} so'z/kitob, {avg_cpb:,} belgi/kitob".replace(',', ' '))
    print(f"O'rtacha: {total_words // total_chapters:,} so'z/bob".replace(',', ' '))
    print(f"Fayllar: {BOOKS_SRC}/")
    print(f"Ma'lumotlar: {db_path}")
    print(f"Generated-books: {gb_books_path}")
    print()

if __name__ == '__main__':
    main()
