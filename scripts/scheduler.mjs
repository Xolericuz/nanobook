#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

const stateFile = join(PROJECT_ROOT, 'generated-books', 'generator-state.json');

const state = {
  lastBookDate: null,
  booksThisWeek: 0,
  weekStartDate: null,
  totalGenerated: 0,
  history: []
};

if (existsSync(stateFile)) {
  const saved = JSON.parse(readFileSync(stateFile, 'utf-8'));
  Object.assign(state, saved);
}

function saveState() {
  const dir = join(PROJECT_ROOT, 'generated-books');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(stateFile, JSON.stringify(state, null, 2));
}

function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function isNewWeek() {
  const now = new Date();
  const currentWeek = getWeekNumber(now);
  const stateWeek = state.weekStartDate ? getWeekNumber(state.weekStartDate) : 0;
  return currentWeek !== stateWeek;
}

function shouldGenerateBook() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  if (state.lastBookDate === today) {
    return { should: false, reason: 'Bugungi kitob allaqachon generatsiya qilingan' };
  }

  if (state.booksThisWeek >= 7) {
    return { should: false, reason: 'Ushbu hafta uchun 7 ta kitob generatsiya qilingan' };
  }

  return { should: true };
}

function recordGeneration(book) {
  const now = new Date();

  if (isNewWeek()) {
    state.booksThisWeek = 0;
    state.weekStartDate = now.toISOString();
  }

  state.lastBookDate = now.toISOString().split('T')[0];
  state.booksThisWeek++;
  state.totalGenerated++;
  state.history.push({
    id: book.id,
    title: book.title,
    category: book.category,
    generatedAt: now.toISOString(),
    weekNumber: getWeekNumber(now)
  });

  if (state.history.length > 100) {
    state.history = state.history.slice(-50);
  }

  saveState();
}

function getStatus() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentWeek = getWeekNumber(now);

  return {
    status: 'active',
    currentDate: today,
    currentWeek: currentWeek,
    weekStartDate: state.weekStartDate,
    booksThisWeek: state.booksThisWeek,
    totalGenerated: state.totalGenerated,
    lastGenerated: state.lastBookDate,
    nextGeneration: state.lastBookDate === today ? 'Ertaga' : 'Bugun mumkin',
    weeklyLimit: 7,
    remainingThisWeek: 7 - state.booksThisWeek,
    history: state.history.slice(-10)
  };
}

function resetWeek() {
  state.booksThisWeek = 0;
  state.weekStartDate = new Date().toISOString();
  saveState();
  return { success: true, message: 'Haftalik hisob tiklandi' };
}

function clearAllData() {
  state.lastBookDate = null;
  state.booksThisWeek = 0;
  state.weekStartDate = null;
  state.totalGenerated = 0;
  state.history = [];
  saveState();
  return { success: true, message: 'Barcha ma\'lumotlar tozalandi' };
}

export { shouldGenerateBook, recordGeneration, getStatus, resetWeek, clearAllData };