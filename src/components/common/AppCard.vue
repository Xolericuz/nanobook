<template>
  <div class="app-card" :class="{ hoverable }">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  hoverable?: boolean
}>()
</script>

<style scoped lang="scss">
.app-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;

  &.hoverable:hover {
    transform: translateY(-4px);
    border-color: var(--accent-cyan);
    box-shadow: 0 8px 32px rgba(0, 240, 255, 0.15);
  }
}
</style>