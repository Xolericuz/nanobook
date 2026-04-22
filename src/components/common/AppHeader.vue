<template>
  <header class="app-header">
    <div class="left">
      <button v-if="back" class="back-btn" @click="$emit('back')">←</button>
      <h1 v-if="title">{{ title }}</h1>
    </div>
    <div class="right">
      <slot />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  back?: boolean
}>()

defineEmits<{
  back: []
}>()
</script>

<style scoped lang="scss">
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--bg-panel);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  .left {
    display: flex;
    align-items: center;
    gap: 12px;

    h1 {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-main);
    }
  }

  .back-btn {
    background: none;
    border: none;
    font-size: 24px;
    color: var(--text-main);
    cursor: pointer;
  }
}
</style>