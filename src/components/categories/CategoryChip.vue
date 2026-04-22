<template>
  <button class="category-chip" :class="{ active }" @click="$emit('click')">
    {{ category }}
  </button>
</template>

<script setup lang="ts">
defineProps<{
  category: string
  active?: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<style scoped lang="scss">
.category-chip {
  padding: 8px 16px;
  background: var(--bg-card);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--accent-cyan);
    color: var(--accent-cyan);
  }

  &.active {
    background: var(--accent-cyan);
    border-color: var(--accent-cyan);
    color: #000;
  }
}
</style>