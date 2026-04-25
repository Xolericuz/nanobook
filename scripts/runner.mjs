#!/usr/bin/env node

import { spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { generateDailyBook } from './book-generator.mjs';
import { shouldGenerateBook, recordGeneration, getStatus } from './scheduler.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('═══════════════════════════════════════════════════════════════');
console.log('🚀 Xoleric AI Kitob Generator v1.0');
console.log('═══════════════════════════════════════════════════���═══════════');
console.log('');

function displayStatus() {
  const status = getStatus();
  console.log('📊 HOLAT:');
  console.log(`   Status: ${status.status}`);
  console.log(`   Jami generatsiya qilingan: ${status.totalGenerated}`);
  console.log(`   Shu haftada: ${status.booksThisWeek}/${status.weeklyLimit}`);
  console.log(`   Qolgan: ${status.remainingThisWeek}`);
  console.log(`   Oxirgi generatsiya: ${status.lastGenerated || 'Hech qachon'}`);
  console.log(`   Keyingi generatsiya: ${status.nextGeneration}`);
  console.log('');
}

async function generateOneBook() {
  displayStatus();

  const check = shouldGenerateBook();
  if (!check.should) {
    console.log(`❌ ${check.reason}`);
    process.exit(0);
  }

  console.log('📚 Yangi kitob generatsiya qilinmoqda...\n');

  try {
    const book = await generateDailyBook();
    if (book) {
      recordGeneration(book);
      console.log('\n✅ Kitob muvaffaqiyatli generatsiya qilindi!');
      console.log(`   ID: ${book.id}`);
      console.log(`   Nomi: ${book.title}`);
      console.log(`   Kategoriya: ${book.category}`);
      console.log(`   Boblar soni: ${book.chapters.length}`);
    } else {
      console.log('\n⚠️ Kitob generatsiya qilinmadi');
    }
  } catch (error) {
    console.error('\n❌ Xatolik yuz berdi:', error.message);
  }

  displayStatus();
}

async function startScheduler() {
  console.log('⏰ Scheduler rejimi ishga tushdi...\n');
  displayStatus();

  const check = shouldGenerateBook();
  if (check.should) {
    console.log('📚 Bugungi kitob generatsiya qilinmoqda...\n');
    try {
      const book = await generateDailyBook();
      if (book) {
        recordGeneration(book);
        console.log('\n✅ Muvaffaqiyat!');
      }
    } catch (error) {
      console.error('❌ Xatolik:', error.message);
    }
  }

  const oneDay = 24 * 60 * 60 * 1000;
  const checkInterval = 60 * 1000;

  console.log('\n⏰ Har daqiqada tekshiriladi...');
  console.log('   Ctrl+C = chiqish\n');

  setInterval(async () => {
    const now = new Date();
    const status = getStatus();
    const check = shouldGenerateBook();

    if (check.should) {
      console.log(`\n🕐 ${now.toISOString()} - Yangi tekshiruv`);
      try {
        const book = await generateDailyBook();
        if (book) {
          recordGeneration(book);
          console.log(`✅ "${book.title}" generatsiya qilindi`);
        }
      } catch (error) {
        console.error('❌ Xatolik:', error.message);
      }
    }
  }, checkInterval);

  setInterval(() => {
    displayStatus();
  }, oneDay);
}

function startAPI() {
  const PORT = 3456;

  const server = createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (req.url === '/api/status') {
      res.end(JSON.stringify(getStatus()));
    } else if (req.url === '/api/generate' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const book = await generateDailyBook();
          if (book) {
            recordGeneration(book);
            res.end(JSON.stringify({ success: true, book }));
          } else {
            res.end(JSON.stringify({ success: false, message: 'Kitob generatsiya qilinmadi' }));
          }
        } catch (error) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: error.message }));
        }
      });
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  });

  server.listen(PORT, () => {
    console.log(`🌐 API Server http://localhost:${PORT}`);
    console.log('   GET  /api/status   - Holatni ko\'rish');
    console.log('   POST /api/generate - Kitob generatsiya qilish');
  });
}

const command = process.argv[2] || 'status';

if (command === 'generate') {
  generateOneBook();
} else if (command === 'scheduler') {
  startScheduler();
} else if (command === 'api') {
  startAPI();
} else if (command === 'status') {
  displayStatus();
} else {
  console.log('Foydalanish:');
  console.log('  node runner.mjs          - Holatni ko\'rish');
  console.log('  node runner.mjs generate - Bitta kitob generatsiya qilish');
  console.log('  node runner.mjs scheduler - Doimiy scheduler');
  console.log('  node runner.mjs api      - API server');
}