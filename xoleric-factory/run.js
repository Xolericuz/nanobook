#!/usr/bin/env node

import { initializeQueues, closeQueues } from './src/queue/index.js';
import { initializeScheduler, stopScheduler } from './src/scheduler/index.js';
import { addAuditLog, EventTypes } from './src/audit/index.js';
import { initializeStats } from './src/api/stats.js';
import { broadcast } from './src/api/server.js';

const args = process.argv.slice(2);
const command = args[0] || 'start';

async function start() {
  console.log(`
╔══════════════════════════════════════════════════╗
║     🏭 XOLERIC AI FACTORY v1.0                 ║
║     "AI-driven Book Ecosystem"                ║
╚══════════════════════════════════════════════════╝
  `);

  // Initialize stats with existing books
  initStatsWithExistingBooks();
  
  // Initialize queues
  await initializeQueues();
  
  // Initialize scheduler
  initializeScheduler();
  
  // Add system start event
  addAuditLog(EventTypes.SYSTEM_START, { version: '1.0.0' });

  console.log('✅ Factory started successfully');
  console.log('📚 Ready for book generation');
  console.log('⏰ Scheduler active');
  
  // Keep process alive
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    await closeQueues();
    stopScheduler();
    process.exit(0);
  });
}

function initStatsWithExistingBooks() {
  try {
    const fs = require('fs');
    const path = require('path');
    const booksPath = path.join('..', 'generated-books', 'books.json');
    
    if (fs.existsSync(booksPath)) {
      const books = JSON.parse(fs.readFileSync(booksPath));
      initializeStats(books.length);
      console.log(`📊 Stats initialized with ${books.length} books`);
    }
  } catch (e) {
    console.log('📊 Stats initialized (no existing books)');
  }
}

async function stop() {
  console.log('🛑 Stopping factory...');
  await closeQueues();
  stopScheduler();
  console.log('✅ Factory stopped');
  process.exit(0);
}

async function status() {
  console.log('📊 Factory status:');
  console.log('   Workers: Active');
  console.log('   Scheduler: Active');
  console.log('   Queues: Ready');
  process.exit(0);
}

async function generate() {
  await initializeQueues();
  const { addJob } = await import('./src/queue/index.js');
  await addJob('generate_book', { source: 'manual' });
  console.log('✅ Book generation queued');
  process.exit(0);
}

async function health() {
  await initializeQueues();
  const { addJob } = await import('./src/queue/index.js');
  await addJob('health_check', { source: 'manual' });
  console.log('✅ Health check queued');
  process.exit(0);
}

const commands = {
  start,
  stop,
  status,
  generate,
  health
};

if (commands[command]) {
  commands[command]();
} else {
  console.log('Commands: start, stop, status, generate, health');
}