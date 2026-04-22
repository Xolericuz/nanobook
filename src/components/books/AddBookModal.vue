<template>
  <div v-if="show" class="add-book-modal" @click.self="$emit('close')">
    <div class="modal-content">
      <h2>Kitob Qo'shish</h2>
      <form @submit.prevent="$emit('add', book)">
        <AppInput v-model="book.title" label="Nom" placeholder="Kitob nomi" />
        <AppInput v-model="book.author" label="Muallif" placeholder="Muallif ismi" />
        <AppInput v-model="book.category" label="Kategoriya" placeholder="Roman, She'r..." />
        <AppInput v-model="book.description" label="Tavsif" placeholder="Kitob haqida" />
        <div class="actions">
          <AppButton variant="ghost" @click="$emit('close')">Bekor</AppButton>
          <AppButton type="submit">Qo'shish</AppButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import type { Book } from '@/types'
import AppInput from '@/components/common/AppInput.vue'
import AppButton from '@/components/common/AppButton.vue'

defineProps<{
  show: boolean
}>()

defineEmits<{
  close: []
  add: [book: Book]
}>()

const book = reactive<Book>({
  id: '',
  title: '',
  author: '',
  category: '',
  description: '',
  cover: '',
  content: '',
  chapters: [],
  progress: 0,
  lastRead: 0,
  isFavorite: false,
  addedAt: Date.now(),
  totalPages: 0
})
</script>

<style scoped lang="scss">
.add-book-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;

  .modal-content {
    background: var(--bg-panel);
    border-radius: 20px;
    padding: 24px;
    width: 90%;
    max-width: 400px;
    border: 1px solid var(--accent-cyan);

    h2 {
      color: var(--text-main);
      margin-bottom: 20px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 8px;
    }
  }
}
</style>