<script setup lang="ts">
import { ref } from 'vue'
import type { Book } from '@/types'
import { generateId } from '@/utils/helpers'

const emit = defineEmits<{
  add: [book: Book]
  close: []
}>()

const title = ref('')
const author = ref('')
const category = ref('Roman')
const description = ref('')

const categories = ['Roman', 'She\'r', 'Drama', 'Detektiv', 'Fantastika', 'Tarix', 'Falsafa', 'Biznes', 'Psixologiya', 'Texnologiya', 'Hikoya', 'Sci-Fi', 'Fantasy', 'Eksperimental']

function submit() {
  if (!title.value.trim()) return
  const book: Book = {
    id: generateId(),
    title: title.value.trim(),
    author: author.value.trim() || 'Noma\'lum',
    category: category.value,
    description: description.value.trim(),
    cover: '',
    content: '',
    chapters: [],
    progress: 0,
    lastRead: 0,
    isFavorite: false,
    addedAt: Date.now(),
    totalPages: 0,
  }
  emit('add', book)
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <h2>Yangi kitob qo'shish</h2>
      <form @submit.prevent="submit" class="modal-form">
        <div class="field">
          <label>Kitob nomi</label>
          <input v-model="title" placeholder="Nomini kiriting" required />
        </div>
        <div class="field">
          <label>Muallif</label>
          <input v-model="author" placeholder="Muallif ismi" />
        </div>
        <div class="field">
          <label>Kategoriya</label>
          <select v-model="category">
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div class="field">
          <label>Tavsif</label>
          <textarea v-model="description" placeholder="Qisqa tavsif" rows="3" />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" @click="emit('close')">Bekor qilish</button>
          <button type="submit" class="btn btn-primary">Qo'shish</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
}

.modal {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 28px;
  width: 440px;
  max-width: 90vw;
}

h2 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 20px;
}

.field {
  margin-bottom: 14px;
}

.field label {
  display: block;
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.field input, .field select, .field textarea {
  width: 100%;
}

.field textarea {
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
}
</style>
