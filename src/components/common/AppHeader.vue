<script setup lang="ts">
defineProps<{
  title: string
  showBack?: boolean
}>()

const emit = defineEmits<{
  back: []
}>()
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <button v-if="showBack" class="btn btn-ghost btn-icon" @click="emit('back')">←</button>
      <h1 class="header-title">{{ title }}</h1>
    </div>
    <div class="header-right">
      <slot name="actions" />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 700;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
